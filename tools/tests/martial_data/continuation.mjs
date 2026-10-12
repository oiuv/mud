// Persistence helpers for this collector, not game/runtime recovery machinery.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { closeSync, existsSync, openSync, readFileSync, readSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { digest, readSamples, recordSample } from './ledger.mjs';

function processIsLive(pid) {
    assert.ok(Number.isSafeInteger(pid) && pid > 0, '进程记录无效，保留现场');
    try { process.kill(pid, 0); return true; }
    catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

export function seriesLock(directory) {
    const path = join(directory, 'collector.lock');
    if (existsSync(path)) {
        const old = JSON.parse(readFileSync(path, 'utf8'));
        assert.ok(!processIsLive(old.pid), '采集进程仍存活，禁止并发续跑：' + old.pid);
        renameSync(path, join(directory, `stale-lock-${randomUUID()}.json`));
    }
    const token = randomUUID();
    writeFileSync(path, JSON.stringify({ pid: process.pid, token }), { flag: 'wx' });
    return () => {
        if (JSON.parse(readFileSync(path, 'utf8')).token === token) unlinkSync(path);
    };
}

// A killed collector can leave its driver running. Never import a changing log
// or start a second driver for that series; do not kill a PID on the user's behalf.
export function verifyAttemptStopped(directory) {
    const path = join(directory, 'process.json');
    if (!existsSync(path) || existsSync(join(directory, 'result.json'))) return;
    const processInfo = JSON.parse(readFileSync(path, 'utf8'));
    assert.ok(!processIsLive(processInfo.pid), '隔离驱动仍存活，禁止续跑：' + processInfo.pid);
}

export function attemptImporter(jobs, accept) {
    const expected = new Set(jobs.map(job => job.condition_id + '.' + job.index));
    assert.equal(expected.size, jobs.length, '本次运行包含重复任务');
    return raw => {
        assert.ok(expected.has(raw.condition_id + '.' + raw.index), '样本不属于本次运行任务');
        accept(raw);
    };
}

export function missingJobs(manifest, rows, selectedCase) {
    const conditions = manifest.identity.conditions;
    if (selectedCase) assert.ok(conditions.some(c => c.id === selectedCase), '条件不在原系列：' + selectedCase);
    const completed = new Set(rows.map(row => row.condition_id + '.' + row.index));
    return conditions.filter(c => !selectedCase || c.id === selectedCase).flatMap(condition =>
        Array.from({ length: condition.samples }, (_, index) => ({ condition_id: condition.id,
            index, method: condition.method, parameters: condition.parameters }))
            .filter(job => !completed.has(job.condition_id + '.' + job.index)));
}

export function verifyResume(manifest, inventory, catalog, execution) {
    assert.equal(manifest.identity.source_fingerprint, inventory.source_fingerprint, '源码变化，必须新建系列');
    assert.equal(manifest.identity.dictionary_sha256, catalog.dictionary_sha256, '字典变化，必须新建系列');
    assert.equal(manifest.versions.commit, inventory.versions.commit, '源码提交变化，必须新建系列');
    assert.equal(manifest.versions.mudcore, inventory.versions.mudcore, '子模块提交变化，必须新建系列');
    assert.equal(digest(manifest.identity.execution), digest(execution), '驱动、夹具、参数或依赖变化，必须新建系列');
}

// Read only complete UTF-8 JSONL records; retain a torn final line as evidence.
export function jsonlTail(path, onRecord) {
    let offset = 0, pending = Buffer.alloc(0), line = 0;
    const errors = [];
    return {
        errors,
        drain() {
            if (!existsSync(path)) return;
            const size = statSync(path).size;
            assert.ok(size >= offset, '原始记录被截短');
            if (size === offset) return;
            const fd = openSync(path, 'r');
            const bytes = Buffer.alloc(size - offset);
            let count = 0;
            try {
                while (count < bytes.length) {
                    const n = readSync(fd, bytes, count, bytes.length - count, offset + count);
                    if (!n) break;
                    count += n;
                }
            } finally { closeSync(fd); }
            offset += count;
            pending = Buffer.concat([pending, bytes.subarray(0, count)]);
            let end;
            while ((end = pending.indexOf(10)) !== -1) {
                const text = pending.subarray(0, end).toString('utf8');
                pending = pending.subarray(end + 1); line++;
                if (!text.trim()) continue;
                try { onRecord(JSON.parse(text)); }
                catch (error) { errors.push({ line, error: error.message }); }
            }
        },
        get incompleteBytes() { return pending.length; },
    };
}

export function sampleImporter(directory, manifest, validate) {
    const known = new Map(readSamples(directory, manifest).map(row => [row.condition_id + '.' + row.index, row]));
    let imported = 0;
    return {
        get imported() { return imported; },
        get rows() { return [...known.values()]; },
        accept(raw) {
            const condition = manifest.identity.conditions.find(c => c.id === raw.condition_id);
            assert.ok(condition, '未知条件');
            validate(raw, condition);
            const key = raw.condition_id + '.' + raw.index;
            if (known.has(key)) {
                assert.equal(known.get(key).raw_sha256, digest(raw), '重复编号对应不同原始样本');
                return;
            }
            const row = recordSample(directory, manifest, { condition_id: raw.condition_id, index: raw.index,
                outcome: raw.outcome, reason: raw.reason, raw });
            known.set(key, row); imported++;
        },
    };
}
