import assert from 'node:assert/strict';
import test from 'node:test';
import { appendFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { attemptImporter, jsonlTail, missingJobs, sampleImporter, seriesLock, verifyAttemptStopped, verifyResume } from './continuation.mjs';
import { createSeries, readSamples } from './ledger.mjs';
import { parseArgs } from '../../collect_martial_data.mjs';

const temp = () => mkdtempSync(join(tmpdir(), 'mud-martial-resume-unit-'));
function fixture() {
    const directory = temp(), hash = 'a'.repeat(64);
    const inventory = { source_fingerprint: hash, versions: { commit: 'main', mudcore: 'submodule' } };
    const catalog = { source_fingerprint: hash, dictionary_sha256: 'b'.repeat(64), skills: [
        { path: 'kungfu/skill/a.c', sha256: hash, entries: [] } ] };
    const conditions = [{ id: 'case-a', entry_id: 'kungfu/skill/a.c', stage: 'weapon', method: 'ordinary',
        samples: 3, parameters: { level: 200 } }];
    const execution = { driver: 'driver-hash', source_files: { 'fixture.lpc': hash } };
    return { directory, inventory, catalog, execution, manifest: createSeries(directory, { inventory, catalog, conditions, execution }) };
}

test('增量 JSONL 保留半个 UTF-8 字符和尾行；坏完整行显式失败', () => {
    const path = join(temp(), 'raw.jsonl'), rows = [];
    const bytes = Buffer.from('{"说明":"剑法"}\n');
    writeFileSync(path, bytes.subarray(0, 12));
    const tail = jsonlTail(path, row => rows.push(row)); tail.drain();
    assert.equal(rows.length, 0); assert.equal(tail.incompleteBytes, 12);
    appendFileSync(path, bytes.subarray(12)); tail.drain();
    assert.deepEqual(rows, [{ 说明: '剑法' }]); assert.equal(tail.incompleteBytes, 0);
    tail.drain(); assert.equal(rows.length, 1);
    appendFileSync(path, '{oops}\n{"unfinished":'); tail.drain();
    assert.equal(tail.errors.length, 1); assert.equal(tail.errors[0].line, 2);
    assert.ok(tail.incompleteBytes > 0);
    writeFileSync(path, ''); assert.throws(() => tail.drain(), /截短/);
});

test('导入幂等但不覆盖；相同编号不同内容拒绝；错误不自动重跑', () => {
    const f = fixture();
    const importer = sampleImporter(f.directory, f.manifest, raw => assert.ok(raw.proof));
    const raw = { condition_id: 'case-a', index: 0, outcome: 'error', reason: '真实错误', proof: true };
    importer.accept(raw);
    const path = join(f.directory, 'samples/case-a.0.json'), before = readFileSync(path);
    importer.accept(raw); assert.equal(importer.imported, 1); assert.deepEqual(readFileSync(path), before);
    assert.throws(() => importer.accept({ ...raw, outcome: 'observed' }), /不同原始/);
    assert.throws(() => importer.accept({ ...raw, index: 1, proof: false }));
    assert.equal(readSamples(f.directory, f.manifest).length, 1);
    assert.deepEqual(missingJobs(f.manifest, importer.rows).map(j => j.index), [1, 2]);
    assert.throws(() => missingJobs(f.manifest, importer.rows, 'case-b'), /不在原系列/);
});

test('源码、字典、提交、驱动和夹具改变均拒绝续跑', () => {
    const f = fixture(); verifyResume(f.manifest, f.inventory, f.catalog, f.execution);
    for (const field of ['commit', 'mudcore']) assert.throws(() => verifyResume(f.manifest,
        { ...f.inventory, versions: { ...f.inventory.versions, [field]: 'other' } }, f.catalog, f.execution), /新建/);
    assert.throws(() => verifyResume(f.manifest, { ...f.inventory, source_fingerprint: 'other' }, f.catalog, f.execution), /新建/);
    assert.throws(() => verifyResume(f.manifest, f.inventory, { ...f.catalog, dictionary_sha256: 'other' }, f.execution), /新建/);
    assert.throws(() => verifyResume(f.manifest, f.inventory, f.catalog, { ...f.execution, driver: 'other' }), /新建/);
    assert.throws(() => verifyResume(f.manifest, f.inventory, f.catalog, { ...f.execution, source_files: {} }), /新建/);
});

test('禁止同系列并发；确认进程已退出后才保留旧锁并续行', () => {
    const directory = temp(), release = seriesLock(directory);
    assert.throws(() => seriesLock(directory), /仍存活/);
    release(); assert.equal(existsSync(join(directory, 'collector.lock')), false);
    const child = spawnSync(process.execPath, ['-e', ''], { windowsHide: true });
    assert.equal(child.status, 0);
    writeFileSync(join(directory, 'collector.lock'), JSON.stringify({ pid: child.pid, token: 'old' }));
    const unlock = seriesLock(directory);
    assert.equal(readdirSync(directory).filter(n => n.startsWith('stale-lock-')).length, 1);
    unlock();
});

test('resume 不接受重设样本量/等级，不能隐式改变原系列', () => {
    assert.equal(parseArgs(['resume', '--input', 'fixture']).command, 'resume');
    assert.throws(() => parseArgs(['resume']), /需要/);
    assert.throws(() => parseArgs(['resume', '--input', 'fixture', '--level', '400']), /无效/);
    assert.throws(() => parseArgs(['resume', '--input', 'fixture', '--samples', '200']), /无效/);
});

test('采集器已退出也不能与遗留驱动并发；只检查存活，不终止进程', () => {
    const directory = temp();
    verifyAttemptStopped(directory);
    writeFileSync(join(directory, 'process.json'), JSON.stringify({ pid: process.pid }));
    assert.throws(() => verifyAttemptStopped(directory), /隔离驱动仍存活/);
    const child = spawnSync(process.execPath, ['-e', ''], { windowsHide: true });
    assert.equal(child.status, 0);
    writeFileSync(join(directory, 'process.json'), JSON.stringify({ pid: child.pid }));
    verifyAttemptStopped(directory);
});

test('运行原始记录必须来自该次请求的任务编号，不只核对总系列', () => {
    const rows = [], jobs = [{ condition_id: 'a', index: 1 }];
    const accept = attemptImporter(jobs, row => rows.push(row));
    accept({ condition_id: 'a', index: 1 });
    assert.throws(() => accept({ condition_id: 'a', index: 0 }), /不属于/);
    assert.throws(() => accept({ condition_id: 'b', index: 1 }), /不属于/);
    assert.throws(() => attemptImporter([...jobs, ...jobs], () => {}), /重复/);
    assert.equal(rows.length, 1);
});
