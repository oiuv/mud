import { afterDefensiveMigration } from './defensive_gear_inventory.mjs';
// Strict frozen-source/caller/effective-identity audit; no live records.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original, families, preserved } from './axe_fork_pin_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 9); assert.equal(data.excluded.length, preserved.length);
assert.equal(data.hits.length, 6); assert.equal(new Set(data.hits.map(h => h.file)).size, 6);
assert.equal(data.dynamic.length, 2); assert.equal(Object.keys(data.callers).length, 7);
if (!process.argv.includes('--baseline-only')) {
    for (const file of Object.keys(data.callers)) {
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterDefensiveMigration(file, expectedCaller(file), semantic)), file);
        assert.deepEqual(semantic(data.callers[file]), semantic(original(file)), 'Frozen caller: ' + file);
        const paths = new Map();
        for (const hit of data.hits.filter(h => h.file === file)) {
            if (!paths.has(hit.new_path)) paths.set(hit.new_path, new Set());
            paths.get(hit.new_path).add(hit.old_path);
        }
        assert.ok([...paths.values()].every(values => values.size === 1), 'Review merged configuration keys: ' + file);
    }
    assert.equal(references(data.varieties).hits.length, 0, 'Old runtime references');
    for (const family of ['axe', 'spear', 'pin']) assert.deepEqual(semantic(readFileSync(join(root, 'd/items/' + family + '_data.h'), 'utf8')), semantic(renderDefinitions(family)));
    assert.equal(renderDefinitions('fork'), '', 'FORK generator cannot recreate a deleted family');
    assert.equal(existsSync(join(root, 'd/items/fork.lpc')), false);
    assert.equal(existsSync(join(root, 'd/items/fork_data.h')), false);
    for (const row of data.varieties) {
        assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
        if (!process.argv.includes('--before-removal')) assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
        for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
    }
    for (const { file, source_hash } of data.excluded) {
        const frozen = original(file);
        assert.equal(createHash('sha256').update(frozen).digest('hex'), source_hash, 'Frozen retained: ' + file);
        if (file === 'inherit/weapon/fork.c') {
            assert.equal(existsSync(join(root, file)), false, 'FORK parent was explicitly replaced');
            assert.ok(existsSync(join(root, 'inherit/weapon/spear.lpc')), 'SPEAR parent exists');
            continue;
        }
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterDefensiveMigration(file, frozen, semantic)), 'Retained or precisely migrated: ' + file);
    }
    for (const { file } of data.dynamic) if (!data.callers[file])
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterDefensiveMigration(file, original(file), semantic)), 'Unrelated dynamic clue changed: ' + file);
}
const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, normalize(v)])) : value;
const identity = row => { const { path, ids, ...record } = data.observations.find(o => o.path === row.old_path); return normalize(record); };
assert.equal(data.observations.length, 9);
assert.equal(data.observations.filter(o => o.blueprint.flag === 5).length, 4);
assert.equal(new Set(data.varieties.map(row => JSON.stringify(identity(row)))).size, canonicalGroups().length,
    'All effectively identical clubs must merge');
for (const group of canonicalGroups()) for (const row of group.rows)
    assert.deepEqual(identity(row), identity(group.representative), 'Effective grouping: ' + group.id);
console.log('AXE_FORK_PIN AUDIT PASS: 9 historical varieties plus explicit weapon normalization; 7 callers; unchanged combat/special items, FORK replaced by SPEAR');
