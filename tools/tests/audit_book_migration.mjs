import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, readBaseline, canonicalGroups, expectedCaller, renderDefinitions, original } from './book_inventory.mjs';
const semantic = source => tokenize(source.replaceAll('\r\n', '\n')).filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const data = readBaseline();
assert.equal(data.varieties.length, 36); assert.equal(data.hits.length, 19);
assert.equal(Object.keys(data.callers).length, 20); assert.equal(canonicalGroups().length, 28);
assert.equal(data.observations.length, 36); assert.equal(data.excluded.length, 6);
for (const file of Object.keys(data.callers)) {
    assert.equal(data.callers[file], original(file), 'Frozen caller: ' + file);
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(afterWeaponMigration(file, expectedCaller(file), semantic)), file);
}
assert.equal(references(data.varieties).hits.length, 0, 'Old static runtime references');
assert.deepEqual(semantic(readFileSync(join(root, 'd/items/book_data.h'), 'utf8')), semantic(renderDefinitions()));
for (const row of data.varieties) {
    assert.equal(createHash('sha256').update(row.source).digest('hex'), row.source_hash);
    if (!process.argv.includes('--before-removal')) assert.ok(!existsSync(join(root, row.old_path.slice(1) + '.c')), row.old_path);
    for (const suffix of ['.c', '.lpc']) assert.ok(!existsSync(join(root, row.new_path.slice(1) + suffix)), 'No forwarding files');
}
for (const { file, source_hash } of data.excluded) {
    const frozen = original(file);
    assert.equal(createHash('sha256').update(frozen).digest('hex'), source_hash, 'Frozen retained: ' + file);
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
        semantic(afterWeaponMigration(file, frozen, semantic)), 'Retained or explicitly migrated: ' + file);
}
assert.equal(readFileSync(join(root, 'cmds/skill/du.alias'), 'utf8').trim(), 'study');
for (const row of data.observations) {
    assert.equal(row.uid, 'Domain'); assert.equal(row.euid, 'Domain');
    if (row.path.endsWith('/book_blade') || row.path.endsWith('/book_unarmed')) {
        assert.ok(row.clone.skill.sen_cost > 0); assert.ok(!row.clone.skill.jing_cost);
    }
    if (row.path === '/d/changan/npc/obj/book') assert.equal(row.clone.value, 100);
}
console.log('BOOK AUDIT PASS: 36 originals -> 28 varieties; 20 consumers; retained hashes/du alias/odd legacy fields verified'
    + (process.argv.includes('--before-removal') ? '; removal pending' : '; no old files or forwarding aliases'));
import { afterWeaponMigration } from './axe_fork_pin_inventory.mjs';
