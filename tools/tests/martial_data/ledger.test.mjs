import assert from 'node:assert/strict';
import test from 'node:test';
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { coverage, coverageMarkdown, createSeries, digest, openSeries, readSamples, recordFinding, recordSample } from './ledger.mjs';

function fixture() {
    const directory = mkdtempSync(join(tmpdir(), 'mud-martial-ledger-test-'));
    const sourceHash = 'a'.repeat(64);
    const inventory = { source_fingerprint: sourceHash, versions: { commit: 'fixture' } };
    const catalog = { source_fingerprint: sourceHash, dictionary_sha256: 'b'.repeat(64), skills: [
        { path: 'kungfu/skill/a.lpc', sha256: sourceHash, entries: [{ id: 'a:perform', role: 'perform' }] },
        { path: 'kungfu/skill/b.lpc', sha256: sourceHash, entries: [] },
    ] };
    const conditions = [{ id: 'case-a', stage: 'weapon', entry_id: 'a:perform', samples: 4,
        method: 'single_perform', parameters: { level: 200 } }];
    const execution = { driver_sha256: 'c'.repeat(64), fixture_sha256: 'd'.repeat(64) };
    return { directory, manifest: createSeries(directory, { inventory, catalog, conditions, execution }), inventory, catalog, conditions, execution };
}

const record = (f, index, outcome = 'observed') => recordSample(f.directory, f.manifest,
    { condition_id: 'case-a', index, outcome, raw: { launched: outcome === 'observed', qi_delta: index }, reason: outcome === 'observed' ? '' : 'fixture reason' });

test('教学函数身份加入同一台账，必须属于当前源码，不能伪装成已施展的武学', () => {
    const f = fixture();
    const entry = { id: 'kungfu/class/example/teacher.h:12:accept_ask',
        path: 'kungfu/class/example/teacher.h', line: 12, function: 'accept_ask',
        sha256: 'e'.repeat(64), role: 'teaching' };
    const options = { ...f, inventory: { ...f.inventory, files: [{ path: entry.path, sha256: entry.sha256 }] },
        conditions: [{ ...f.conditions[0], stage: 'school', method: 'teaching', entry_id: entry.id }],
        teachingEntries: [entry] };
    const directory = mkdtempSync(join(tmpdir(), 'mud-teaching-ledger-test-'));
    const result = createSeries(directory, options);
    assert.deepEqual(result.entries.at(-1), entry);
    assert.equal(coverage(directory).totals.configured_entries, 1);
    for (const changed of [{ ...entry, sha256: 'f'.repeat(64) },
        { ...entry, role: 'perform' }, { ...entry, line: 13 }]) {
        assert.throws(() => createSeries(directory, { ...options, teachingEntries: [changed] }),
            /教学|附加入口/);
    }
    assert.throws(() => createSeries(directory, { ...options, teachingEntries: [entry, entry] }), /重复/);
});

test('条件、源码、驱动/夹具指纹不可混算；参数对象键顺序不影响身份', () => {
    const f = fixture();
    assert.equal(openSeries(f.directory, f.manifest.identity).fingerprint, f.manifest.fingerprint);
    assert.equal(digest({ a: 1, b: 2 }), digest({ b: 2, a: 1 }));
    for (const identity of [
        { ...f.manifest.identity, source_fingerprint: 'other' },
        { ...f.manifest.identity, dictionary_sha256: 'other' },
        { ...f.manifest.identity, execution: { driver_sha256: 'other' } },
        { ...f.manifest.identity, conditions: [{ ...f.conditions[0], parameters: { level: 400 } }] },
    ]) assert.throws(() => openSeries(f.directory, identity), /必须新建/);
    assert.throws(() => createSeries(f.directory, f), /已有系列/);
});

test('中断后只续缺失编号，旧数据不覆盖；未完成落盘不计成功', () => {
    const f = fixture(); record(f, 0);
    writeFileSync(join(f.directory, 'samples', 'case-a.1.interrupted.pending'), '{"raw":');
    let report = coverage(f.directory);
    assert.deepEqual(report.conditions[0].missing, [1, 2, 3]);
    assert.equal(report.pending_files.length, 1);
    const reopened = openSeries(f.directory, f.manifest.identity);
    recordSample(f.directory, reopened, { condition_id: 'case-a', index: 1, outcome: 'observed', raw: { ok: true } });
    assert.throws(() => record(f, 0), /禁止覆盖/);
    report = coverage(f.directory);
    assert.deepEqual(report.conditions[0].missing, [2, 3]);
    assert.equal(report.totals.observed, 2);
    assert.equal(report.totals.configured_entries, 1);
    assert.equal(report.totals.entries, 3);
    assert.equal(report.conditions[0].normal_effect, 'incomplete');
});

test('拒绝/错误/不适用与正常效果分母分开，记录齐全不冒充正常效果通过', () => {
    const f = fixture();
    record(f, 0); record(f, 1, 'refused'); record(f, 2, 'error'); record(f, 3, 'not_applicable');
    const report = coverage(f.directory), c = report.conditions[0];
    assert.equal(c.recorded, 4);
    assert.equal(c.observations_denominator, 1);
    assert.equal(c.attempts_denominator, 4);
    assert.equal(c.normal_effect, 'incomplete');
    assert.equal(report.totals.errors, 1);
    assert.match(coverageMarkdown(report), /4\/4 \| 1 \| 1 \| 1 \| 1 \| incomplete/);
});

test('原始证据缺失、数据被改写和重复样本均拒绝', () => {
    const f = fixture();
    assert.throws(() => recordSample(f.directory, f.manifest, { condition_id: 'case-a', index: 0, outcome: 'observed', raw: {} }), /缺少原始/);
    record(f, 0);
    const path = join(f.directory, 'samples', 'case-a.0.json');
    copyFileSync(path, join(f.directory, 'samples', 'duplicate.json'));
    assert.throws(() => readSamples(f.directory, f.manifest), /重复样本/);
    const g = fixture(); record(g, 0);
    const target = join(g.directory, 'samples', 'case-a.0.json');
    const sample = JSON.parse(readFileSync(target)); sample.raw.qi_delta = 999;
    writeFileSync(target, JSON.stringify(sample));
    assert.throws(() => coverage(g.directory), /证据不一致/);
});

test('全样本正常观察才标为 sampled，依然不声称全库完成', () => {
    const f = fixture(); for (let index = 0; index < 4; index++) record(f, index);
    const report = coverage(f.directory);
    assert.equal(report.conditions[0].normal_effect, 'sampled');
    assert.equal(report.totals.sampled_conditions, 1);
    assert.equal(report.entries.filter(e => e.status === 'not_configured').length, 2);
});

test('确认错误要有出处和复现样本；只登记待处理、不修改游戏', () => {
    const f = fixture(); record(f, 0, 'error');
    const finding = { id: 'bug-a', certainty: 'confirmed', title: 'fixture only',
        expected_basis: 'contract', trigger: 'sample 0', actual: 'error', impact: 'single condition',
        sources: [{ path: 'kungfu/skill/a.lpc', line: 1, sha256: 'a'.repeat(64) }], samples: ['case-a.0'] };
    const result = recordFinding(f.directory, f.manifest, finding);
    assert.equal(result.status, 'open_deferred');
    assert.throws(() => recordFinding(f.directory, f.manifest, { ...finding, id: 'bug-b', samples: [] }), /复现样本/);
    assert.throws(() => recordFinding(f.directory, f.manifest, { ...finding, id: 'bug-c', samples: ['missing.0'] }), /样本缺失/);
    assert.throws(() => recordFinding(f.directory, f.manifest, finding), /禁止覆盖/);
});
