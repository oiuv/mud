import { afterWeaponMigration } from './axe_fork_pin_inventory.mjs';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions,
    original, parseInstrument, families, retained } from './instrument_inventory.mjs';

const semantic = source => tokenize(source.replaceAll('\r\n', '\n'))
    .filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const hash = source => createHash('sha256').update(source).digest('hex');
const data = readBaseline();
assert.equal(data.varieties.length, 24);
assert.equal(data.hits.length, 27);
assert.equal(Object.keys(data.callers).length, 11);
assert.equal(canonicalGroups().length, 24);
assert.equal(data.observations.length, 24);
assert.equal(data.excluded.length, 20);
assert.equal(retained.length, 7);
assert.deepEqual(families.map(f => data.varieties.filter(r => r.family === f).length), [15, 7, 2]);
for (const file of Object.keys(data.callers)) {
    assert.equal(data.callers[file], original(file), 'Frozen caller: ' + file);
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterWeaponMigration(file, expectedCaller(file), semantic)), file);
}
const refs = references(data.varieties);
assert.equal(refs.hits.length, 0, 'Old static runtime references');
assert.deepEqual([...new Set(refs.dynamic.map(h => h.file))], ['d/changan/npc/fujiang.c']);
for (const family of families)
    assert.deepEqual(semantic(readFileSync(join(root, `d/items/${family}_data.h`), 'utf8')),
        semantic(renderDefinitions(family)), family + ': data and natural ID order');
for (const row of data.varieties) {
    const file = row.old_path.slice(1) + '.c';
    assert.equal(hash(row.source), row.source_hash, file);
    assert.equal(original(file), row.source, 'Frozen source: ' + file);
    for (const [key, value] of Object.entries(parseInstrument(row.source, file)))
        assert.deepEqual(row[key], value, file + ': ' + key);
    if (process.argv.includes('--before-removal'))
        assert.equal(readFileSync(join(root, file), 'utf8'), row.source, 'Removal target unchanged');
    else assert.ok(!existsSync(join(root, file)), 'No legacy file: ' + file);
    for (const suffix of ['.c', '.lpc'])
        assert.ok(!existsSync(join(root, row.new_path.slice(1) + suffix)), 'No forwarding files');
}
for (const { file, source_hash } of data.excluded) {
    const frozen = original(file);
    assert.equal(hash(frozen), source_hash, 'Frozen retained: ' + file);
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
        semantic(afterWeaponMigration(file, frozen, semantic)), 'Retained or explicitly migrated: ' + file);
}
for (const row of data.observations) {
    assert.equal(row.uid, 'Domain');
    assert.equal(row.euid, 'Domain');
}
console.log('INSTRUMENT AUDIT PASS: 24 originals -> 24 varieties; 27 references/11 consumers; 20 retained hashes'
    + (process.argv.includes('--before-removal') ? '; removal pending' : '; no old files or forwarding aliases'));
