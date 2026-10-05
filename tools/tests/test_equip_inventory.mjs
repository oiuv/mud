import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readBaseline, parseEquip, canonicalGroups } from './equip_inventory.mjs';
const data = readBaseline();
const source = data.varieties.find(r => r.setup).source;
test('frozen EQUIP has 56 definitions, 25 setup and 31 no setup, 64 references in 25 consumers', () => {
    assert.equal(data.varieties.length, 56);
    assert.equal(data.varieties.filter(r => r.setup).length, 25);
    assert.equal(data.hits.length, 64);
    assert.equal(Object.keys(data.callers).length, 25);
    for (const row of data.varieties) assert.equal(parseEquip(row.source, row.old_path).setup, row.setup);
    assert.equal(canonicalGroups().flatMap(g => g.rows).length, 56);
});
for (const [label, change] of [
    ['other parent', s => s.replace('inherit EQUIP;', 'inherit CLOTH;')],
    ['second inherit', s => s.replace('inherit EQUIP;', 'inherit EQUIP; inherit F_UNIQUE;')],
    ['callback', s => s + '\nvoid init() {}\n'],
    ['runtime value', s => s.replace('2000', 'random(2000)')],
    ['dynamic name', s => s.replace('HIY "软金束带" NOR', 'get_name()')],
    ['duplicate setup', s => s.replace('setup();', 'setup(); setup();')],
    ['setup argument', s => s.replace('setup();', 'setup(1);')],
    ['reordered setup', s => s.replace('setup();', '').replace('set_weight(1000);', 'setup(); set_weight(1000);')],
    ['nonliteral weight', s => s.replace('set_weight(1000)', 'set_weight(query("weight"))')],
    ['unexpected property scope', s => s.replace('set_weight(1000);', 'set_weight(1000); set("value", 9);')],
]) test('reject ' + label, () => assert.throws(() => parseEquip(change(source), label)));
