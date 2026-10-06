import { afterClubMigration } from './club_inventory.mjs';
import { afterThrowingMigration } from './throwing_inventory.mjs';
import { afterDaggerMigration } from './dagger_inventory.mjs';
import { afterWhipMigration } from './whip_inventory.mjs';
import { afterStaffMigration } from './staff_inventory.mjs';
import { afterHammerMigration } from './hammer_inventory.mjs';
import { afterEquipMigration } from "./equip_inventory.mjs";
// Frozen source, effective identities and exact caller migration; no live records.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { afterBladeMigration } from './blade_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original } from './liquid_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 74); assert.equal(data.excluded.length, 1);
assert.equal(data.hits.length, 99); assert.equal(Object.keys(data.callers).length, 87);
assert.equal(data.dynamic.length, 4);
const normalize = value => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([k]) => k !== 'id').sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, normalize(v)])) : value;
const identity = row => { const { path, ids, ...record } = data.observations.find(o => o.path === row.old_path); return normalize(record); };
assert.equal(data.observations.length, 74);
assert.equal(data.observations.filter(o => o.setup === 1 && o.clone_setup === 1).length, 4);
// Missing LPC mapping counters serialize as null; both represent no setup calls.
assert.equal(data.observations.filter(o => !o.setup && !o.clone_setup).length, 70);
assert.equal(new Set(data.varieties.map(row => JSON.stringify(identity(row)))).size, canonicalGroups().length,
    'All effectively identical drinks must merge');
for (const group of canonicalGroups()) for (const row of group.rows)
    assert.deepEqual(identity(row), identity(group.representative), 'Effective grouping: ' + group.id);
for (const row of data.varieties) assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
for (const { file, source_hash } of data.excluded)
    assert.equal(createHash('sha256').update(readFileSync(join(root, file))).digest('hex'), source_hash, 'Special liquid changed: ' + file);
if (!process.argv.includes('--baseline-only')) {
    for (const file of Object.keys(data.callers)) {
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterClubMigration(file, afterThrowingMigration(file, afterDaggerMigration(file, afterWhipMigration(file, afterStaffMigration(file, afterHammerMigration(file, afterEquipMigration(file, afterBladeMigration(file, expectedCaller(file), semantic), semantic), semantic), semantic), semantic), semantic), semantic), semantic)), file);
        assert.deepEqual(semantic(data.callers[file]), semantic(original(file)), 'Frozen caller: ' + file);
        const paths = new Map();
        for (const hit of data.hits.filter(h => h.file === file)) {
            if (!paths.has(hit.new_path)) paths.set(hit.new_path, new Set());
            paths.get(hit.new_path).add(hit.old_path);
        }
        assert.ok([...paths.values()].every(values => values.size === 1), 'Review merged configuration keys: ' + file);
    }
    assert.equal(references(data.varieties).hits.length, 0, 'Old runtime references');
    assert.deepEqual(semantic(readFileSync(join(root, 'd/items/liquid_data.h'), 'utf8')), semantic(renderDefinitions()));
    for (const row of data.varieties) {
        assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
        for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
    }
    for (const { file } of data.dynamic) if (!data.callers[file])
        assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterClubMigration(file, afterThrowingMigration(file, afterDaggerMigration(file, afterWhipMigration(file, afterStaffMigration(file, afterHammerMigration(file, afterEquipMigration(file, afterBladeMigration(file, original(file), semantic), semantic), semantic), semantic), semantic), semantic), semantic), semantic)), 'Unrelated dynamic clue changed: ' + file);
}
console.log(`LIQUID AUDIT PASS: 74 originals -> ${canonicalGroups().length} effective varieties; 4 setup / 70 no setup; honey unchanged`
    + (process.argv.includes('--baseline-only') ? '; migration not checked' : '; 87 callers, 99 references; no collisions, old files or shells'));
