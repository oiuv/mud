import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { classifyConditionEvidence, buildPerformEntryCoverage, successfulProcessExit } from './perform_entry_coverage.mjs';
import { createSeries } from './ledger.mjs';

test('formal credit belongs to the same fully checked condition and execution', () => {
    const ref = { planned: 2, recorded: 2, passed_observed: 2, passed_refused: 0, smoke: false };
    const context = { successfulExit: true, discovery: false };
    assert.equal(classifyConditionEvidence(ref, context), 'formal');
    assert.equal(classifyConditionEvidence({ ...ref, smoke: true }, context), 'smoke');
    assert.equal(classifyConditionEvidence({ ...ref, smoke: null }, context), 'unverified');
    assert.equal(classifyConditionEvidence(ref, { ...context, discovery: true }), 'unverified');
    assert.equal(classifyConditionEvidence(ref, { ...context, successfulExit: false }), 'unverified');
    assert.equal(classifyConditionEvidence({ ...ref, recorded: 1, passed_observed: 1 }, context), 'unverified');
    assert.equal(classifyConditionEvidence({ ...ref, passed_observed: 1 }, context), 'unverified');
    assert.equal(classifyConditionEvidence({ ...ref, passed_observed: 0, passed_refused: 2 }, context), 'refused_only');
    // Smoke records plus an empty formal declaration cannot be combined into formal.
    assert.equal(classifyConditionEvidence({ ...ref, recorded: 0, passed_observed: 0 }, context), 'config_only');
    assert.equal(classifyConditionEvidence({ ...ref, smoke: true }, context), 'smoke');
});

test('process checks accept the actual empty error-list format, not absent or failed exits', () => {
    const run = { process: { code: 0, signal: null }, validation_errors: [], incomplete_bytes: 0 };
    assert.equal(successfulProcessExit(run), true);
    assert.equal(successfulProcessExit({ ...run, validation_errors: 0 }), true);
    assert.equal(successfulProcessExit({ ...run, validation_errors: ['bad'] }), false);
    assert.equal(successfulProcessExit({ ...run, validation_errors: undefined }), false);
    assert.equal(successfulProcessExit({ ...run, process: { code: null, signal: 'SIGTERM' } }), false);
    assert.equal(successfulProcessExit({ ...run, incomplete_bytes: 1 }), false);
});

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'mud-entry-coverage-'));
    t.after(() => {
        assert.equal(dirname(resolve(root)), resolve(tmpdir()));
        rmSync(root, { recursive: true });
    });
    const path = 'kungfu/skill/demo/hit.c', hash = 'a'.repeat(64);
    const catalog = { source_fingerprint: 'snapshot', dictionary_sha256: 'b'.repeat(64),
        skills: [{ id: 'demo/hit', path, sha256: hash,
            entries: [{ id: path + ':1:perform', function: 'perform', role: 'perform', evidence: { line: 1 } }] }] };
    const catalogPath = join(root, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog));
    const directory = join(root, 'series');
    mkdirSync(directory);
    createSeries(directory, { inventory: { source_fingerprint: 'snapshot', versions: {} }, catalog,
        execution: { smoke: false }, conditions: [{
            id: 'target', entry_id: path + ':1:perform', method: 'perform', stage: 'skill', samples: 2,
            parameters: { collection_group: 'unsupported' },
        }] });
    writeFileSync(join(directory, 'catalog.json'), JSON.stringify(catalog));
    return { root, directory, catalog, catalogPath };
}

test('matching filenames with invalid JSON cannot count as validated samples', async t => {
    const f = fixture(t);
    writeFileSync(join(f.directory, 'samples', 'target.0.json'), '{broken');
    const r = await buildPerformEntryCoverage(f.root, f.catalogPath, { directories: [f.directory] });
    assert.equal(r.totals.coverage.formal, 0);
    assert.equal(r.entries[0].coverage, 'unverified');
    assert.equal(r.diagnostics.length, 1);
});

test('foreign sample contents, unsupported consumers and source drift fail closed', async t => {
    const f = fixture(t);
    writeFileSync(join(f.directory, 'samples', 'target.0.json'), JSON.stringify({ condition_id: 'foreign' }));
    let r = await buildPerformEntryCoverage(f.root, f.catalogPath, { directories: [f.directory] });
    assert.equal(r.totals.coverage.formal, 0);
    assert.ok(r.diagnostics.length);
    rmSync(join(f.directory, 'samples', 'target.0.json'));
    r = await buildPerformEntryCoverage(f.root, f.catalogPath, { directories: [f.directory] });
    assert.equal(r.totals.coverage.formal, 0);
    assert.match(r.diagnostics[0].reason, /Unsupported replay group/);
    f.catalog.skills[0].sha256 = 'c'.repeat(64);
    writeFileSync(f.catalogPath, JSON.stringify(f.catalog));
    r = await buildPerformEntryCoverage(f.root, f.catalogPath, { directories: [f.directory] });
    assert.equal(r.entries[0].coverage, 'none');
    assert.deepEqual(r.entries[0].evidence, []);
});
