import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeReplay, reviewDefinitions } from './collection_review.mjs';

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

test('review has a clean gate but does not conflate declaration counts and unique paths', async () => {
    const r = summarizeReplay([{ id: 'c', samples: 1 }], [{ condition_id: 'c', index: 0,
        outcome: 'observed', raw: { condition_id: 'c', index: 0, outcome: 'observed' } }], () => {});
    assert.equal(r.complete, true);
    const definitions = await reviewDefinitions();
    assert.equal(definitions.declarations, 506);
    assert.equal(definitions.active_placements, 498);
    assert.equal(definitions.unique_active_paths, 465);
    assert.equal(definitions.unique_declared_paths, 470);
    assert.equal(definitions.pending.length, 8);
    assert.ok(definitions.duplicates.length > 0);
});
