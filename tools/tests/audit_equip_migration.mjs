import { afterDaggerMigration } from './dagger_inventory.mjs';
import { afterWhipMigration } from './whip_inventory.mjs';
import { afterStaffMigration } from './staff_inventory.mjs';
import { afterHammerMigration } from './hammer_inventory.mjs';
// Frozen source/caller and effective-identity audit; no live records.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original, parseEquip } from './equip_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 56);
assert.equal(data.varieties.filter(r => r.setup).length, 25);
assert.equal(data.hits.length, 64);
assert.equal(Object.keys(data.callers).length, 25);
assert.equal(data.dynamic.length, 0);
for (const row of data.varieties) {
    assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
    assert.equal(original(row.old_path.slice(1) + '.c'), row.source);
    for (const [key, value] of Object.entries(parseEquip(row.source, row.old_path.slice(1) + '.c')))
        assert.deepEqual(row[key], value, row.old_path + ': ' + key);
}
const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, normalize(v)])) : value;
const identity = row => {
    const o = data.observations.find(o => o.path === row.old_path);
    return normalize([o.blueprint, o.clone, o.weight, o.clone_weight, o.blueprint_setup, o.clone_setup,
        o.female_wear, o.male_wear, o.npc_wear]);
};
assert.equal(data.observations.length, 56);
assert.equal(new Set(data.varieties.map(row => JSON.stringify(identity(row)))).size, canonicalGroups().length,
    'Effectively identical definitions must merge');
for (const group of canonicalGroups()) for (const row of group.rows)
    assert.deepEqual(identity(row), identity(group.representative), 'Effective group: ' + group.id);
for (const o of data.observations) {
    // LPC undefined zero is serialized as JSON null by the driver.
    assert.equal(o.female_wear.result, Number(o.blueprint_setup));
    assert.equal(o.npc_wear.result, Number(o.clone_setup));
}
for (const [file, source] of Object.entries(data.callers)) assert.equal(source, original(file), 'Frozen caller: ' + file);
if (!process.argv.includes('--baseline-only')) {
    for (const file of Object.keys(data.callers)) {
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterDaggerMigration(file, afterWhipMigration(file, afterStaffMigration(file, afterHammerMigration(file, expectedCaller(file), semantic), semantic), semantic), semantic)), file);
        const newPaths = new Map();
        for (const hit of data.hits.filter(h => h.file === file)) {
            if (!newPaths.has(hit.new_path)) newPaths.set(hit.new_path, new Set());
            newPaths.get(hit.new_path).add(hit.old_path);
        }
        assert.ok([...newPaths.values()].every(p => p.size === 1), 'Review merged config keys: ' + file);
    }
    assert.equal(references(data.varieties).hits.length, 0, 'Old runtime references');
    assert.deepEqual(semantic(readFileSync(join(root, 'd/items/equip_data.h'), 'utf8')), semantic(renderDefinitions()));
    for (const row of data.varieties) {
        if (!process.argv.includes('--before-removal')) assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
        for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
    }
}
console.log(`EQUIP AUDIT PASS: 56 originals -> ${canonicalGroups().length} varieties; 25 setup, 31 no setup; 64 references, 25 callers`
    + (process.argv.includes('--baseline-only') ? '; baseline only' : '; exact caller and definition parity')
    + (process.argv.includes('--baseline-only') || process.argv.includes('--before-removal') ? '; removal not checked' : '; no old files or forwarding shells'));
