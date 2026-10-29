import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeReplay, reviewDefinitions, summarizeSeriesCoverage, summarizeEntryCoverage,
    resolveEntryReference } from './collection_review.mjs';

test('review separates missing, error, N/A and failed validation from success', () => {
    const conditions = [{ id: 'c', samples: 5 }];
    const rows = ['observed', 'error', 'not_applicable', 'refused'].map((outcome, index) => ({
        condition_id: 'c', index, outcome, reason: outcome,
        raw: { condition_id: 'c', index, outcome },
    }));
    const r = summarizeReplay(conditions, rows, raw => { if (raw.outcome === 'refused') throw new Error('bad refusal'); });
    assert.equal(r.passed, 1); assert.equal(r.replayed, 2);
    assert.equal(r.pending.length, 2); assert.equal(r.failures.length, 1);
    assert.equal(r.missing_samples, 1); assert.equal(r.complete, false);
    assert.throws(() => summarizeReplay(conditions, [rows[0], rows[0]], () => {}), /duplicate/);
});

test('coverage counts unique formal slots and retains repeated/versioned attempts', () => {
    const one = { directory: 'a', smoke: false, source_fingerprint: 'src', execution_sha256: 'v1',
        failures: [], pending: [], conditions: [{ id: 'c', sha256: 'hash', group: 'g', planned: 2, recorded_indices: [0, 1] }] };
    const two = structuredClone(one); two.directory = 'b'; two.execution_sha256 = 'v2';
    two.failures = [{ slot: 'c.1' }];
    const smoke = { ...one, directory: 'smoke', smoke: true };
    const unknown = { ...one, directory: 'unknown', smoke: null };
    const r = summarizeSeriesCoverage([one, two, smoke, unknown]);
    assert.equal(r.attempts, 4); assert.equal(r.recorded_slots, 2); assert.equal(r.repeated_attempts, 2);
    assert.equal(r.groups.g.passed_slots, 2); assert.equal(r.groups.g.multi_version_slots, 2);
    assert.equal(r.conditions[0].slots[1].attempts[1].passed, false);
    assert.deepEqual(r.excluded, ['smoke', 'unknown']);
    const changed = structuredClone(two); changed.conditions[0].sha256 = 'different';
    assert.equal(summarizeSeriesCoverage([one, changed]).recorded_slots, 4);
    const failed = structuredClone(one); failed.failures = [{ slot: 'c.0' }];
    failed.pending = [{ slot: 'c.1', outcome: 'error' }];
    assert.equal(summarizeSeriesCoverage([failed]).groups.g.passed_slots, 0);
});

test('review has a clean gate but does not conflate declaration counts and unique paths', async () => {
    const r = summarizeReplay([{ id: 'c', samples: 1 }], [{ condition_id: 'c', index: 0,
        outcome: 'observed', raw: { condition_id: 'c', index: 0, outcome: 'observed' } }], () => {});
    assert.equal(r.complete, true);
    const definitions = await reviewDefinitions();
    // 漂移来源：b22 新增 lonely-sword/jue 非战斗演练（+1 声明、+1 活动路径）；
    // jinshe-zhui/tuwu 与 xuanyuan-arrow/baibu 由 pending 转为可采配置（+2 活动、pending 8→6）。
    assert.equal(definitions.declarations, 509);
    assert.equal(definitions.active_placements, 503);
    assert.equal(definitions.unique_active_paths, 470);
    assert.equal(definitions.unique_declared_paths, 472);
    assert.equal(definitions.pending.length, 6);
    assert.ok(definitions.duplicates.length > 0);
});

test('entry coverage joins actual passed records by source version, never declarations or refused-only slots', () => {
    const entry = { id: 'p:1:perform', role: 'perform', function: 'perform' };
    const catalog = { skills: [{ path: 'p', sha256: 'hash', entries: [entry] }] };
    const c = { id: 'c', entry: { ...entry, path: 'p', sha256: 'hash' }, passed_observed: 1, passed_refused: 0 };
    const s = { directory: 'smoke', smoke: true, conditions: [c], execution_sha256: 'v' };
    assert.equal(summarizeEntryCoverage([s, s], catalog).roles.perform.smoke_only_observed, 1);
    assert.equal(summarizeEntryCoverage([{ ...s, smoke: false }], catalog).roles.perform.formal_observed, 1);
    assert.equal(summarizeEntryCoverage([{ ...s, smoke: null }], catalog).roles.perform.no_verified_observed.length, 1);
    const refused = { ...c, passed_observed: 0, passed_refused: 2 };
    assert.equal(summarizeEntryCoverage([{ ...s, conditions: [refused] }], catalog).roles.perform.no_verified_observed.length, 1);
    const drift = { ...c, entry: { ...c.entry, sha256: 'changed' } };
    const r = summarizeEntryCoverage([{ ...s, conditions: [drift] }], catalog);
    assert.equal(r.unbound.length, 1);
    assert.equal(r.roles.perform.smoke_only_observed, 0);
});

test('redirected perform preserves old wrong identity without crediting either physical entry', () => {
    const dispatcher = { path: 'kungfu/skill/six-finger.c',
        sha256: '7fda80d2616c837bc505ed231fe0a505303516279221da38fb25bf84a9316d31', entries: [] };
    const skill = path => ({ path, sha256: 'ability-hash', entries: [
        { id: path + ':1:perform', role: 'perform', function: 'perform' },
    ] });
    const wrong = skill('kungfu/skill/six-finger/qi.c');
    const actual = skill('kungfu/skill/liumai-shenjian/qi.c');
    const catalog = { skills: [dispatcher, wrong, actual] };
    const condition = { entry_id: wrong.entries[0].id,
        parameters: { collection_group: 'b23-perform', skill: 'six-finger', ability: 'qi' } };
    const ref = resolveEntryReference(condition, catalog);
    assert.equal(ref.path, wrong.path);
    assert.equal(ref.expected_path, actual.path);
    assert.equal(ref.binding_valid, false);
    for (const smoke of [true, false]) {
        const report = summarizeEntryCoverage([{ directory: 'old', smoke, conditions: [
            { id: 'c', entry: ref, passed_observed: 100, passed_refused: 2 },
        ] }], catalog);
        assert.equal(report.roles.perform.formal_observed, 0);
        assert.equal(report.roles.perform.smoke_only_observed, 0);
        assert.equal(report.unbound.length, 1);
        assert.match(report.unbound[0].reason, /dispatcher/);
        assert.ok(report.entries.every(e => e.refused.length === 0));
    }
    condition.entry_id = actual.entries[0].id;
    assert.equal(resolveEntryReference(condition, catalog).binding_valid, true);
    dispatcher.sha256 = 'unreviewed-dispatcher';
    assert.equal(resolveEntryReference(condition, catalog).binding_valid, false);
});
