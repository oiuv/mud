import test from 'node:test';
import assert from 'node:assert/strict';
import { readBaseline, parseWeapon, canonicalGroups, correctedWeaponText } from './axe_fork_pin_inventory.mjs';
const data = readBaseline();

test('AXE parser rejects callbacks, extra inheritance, random and temporary state', () => {
    const source = data.varieties[0].source;
    for (const invalid of [source + '\nvoid init() {}\n', source.replace('inherit AXE;', 'inherit AXE; inherit F_UNIQUE;'),
        source.replace(/set_weight\(\d+\)/, 'set_weight(random(5000))'),
        source.replace('setup();', 'set_temp("uses", 1); setup();')])
        assert.throws(() => parseWeapon(invalid, 'invalid-axe.c'));
});

test('nine semantically distinct varieties retain compact IDs and exact flags', () => {
    const groups = canonicalGroups();
    assert.equal(groups.length, 9);
    assert.equal(data.varieties.filter(row => row.flags === 1).length, 4);
    assert.ok(groups.every(g => g.rows.length === 1 && g.id.length <= 12));
    assert.deepEqual(groups.find(g => g.id === 'banfu').ids, ['axe']);
    assert.equal(groups.find(g => g.id === 'dabanfu').representative.damage, 25);
    assert.equal(groups.find(g => g.id === 'dabanfu2').representative.damage, 35);
});
test('symbolic flags accept TWO_HANDED only, never arbitrary expressions', () => {
    const row = data.varieties.find(r => r.flags === 1);
    for (const flag of ['SECONDARY', 'TWO_HANDED | SECONDARY', 'random(2)', 'unknown', '2'])
        assert.throws(() => parseWeapon(row.source.replace('TWO_HANDED', flag), 'invalid.c'));
    assert.equal(parseWeapon(row.source, row.old_path + '.c').flags, 1);
});
test('only the two approved display fields change', () => {
    assert.equal(correctedWeaponText('sangmen_fu', '"long"', '这是一杆三尖开刃的三股叉。'), '这是一柄锋利的丧门斧。');
    assert.equal(correctedWeaponText('kanchai_fu', '"wield_msg"', '$N抽出一根$n握在手中。'), '$N抽出一柄$n握在手中。');
    assert.equal(correctedWeaponText('sangmen_fu', '"unit"', '"杆"'), '"杆"');
    assert.ok(data.varieties.find(r => r.id === 'sangmen_fu').source.includes('三股叉'));
});
