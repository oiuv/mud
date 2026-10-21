import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeReplay, reviewDefinitions, summarizeSeriesCoverage } from './collection_review.mjs';

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
    assert.equal(definitions.declarations, 508);
    assert.equal(definitions.active_placements, 500);
    assert.equal(definitions.unique_active_paths, 467);
    assert.equal(definitions.unique_declared_paths, 472);
    assert.equal(definitions.pending.length, 8);
    assert.ok(definitions.duplicates.length > 0);
});
