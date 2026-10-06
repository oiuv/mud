import test from 'node:test';
import assert from 'node:assert/strict';
import { readBaseline, parseClub, canonicalGroups, correctedClubText } from './club_inventory.mjs';
const data = readBaseline();

test('CLUB parser rejects callbacks, extra inheritance, random and temporary state', () => {
    const source = data.varieties[0].source;
    for (const invalid of [source + '\nvoid init() {}\n', source.replace('inherit CLUB;', 'inherit CLUB; inherit F_UNIQUE;'),
        source.replace(/set_weight\(\d+\)/, 'set_weight(random(5000))'),
        source.replace('setup();', 'set_temp("uses", 1); setup();')])
        assert.throws(() => parseClub(invalid, 'invalid-club.c'));
});

test('only equivalent qimei definitions merge; meaningful short IDs retain original aliases', () => {
    const groups = canonicalGroups();
    assert.equal(groups.length, 17);
    assert.deepEqual(groups.filter(g => g.rows.length > 1).map(g => [g.id, g.rows.length]), [['qimei_gun', 2]]);
    assert.ok(groups.every(g => g.id.length <= 12 && !/shaolin|changan|huanghe/.test(g.id)));
    assert.ok(!groups.find(g => g.id === 'qimei_gun').ids.includes('qimeigun'));
});

test('approved CLUB text corrections are narrow and leave frozen source untouched', () => {
    assert.equal(correctedClubText('qimei_gun', '"long"', '白腊棍'), '白蜡棍');
    assert.equal(correctedClubText('gancheng', '"long"', '一杆闹市货物常用的杆秤。'), '这是一杆称量货物用的杆秤。');
    assert.equal(correctedClubText('ruyi_gun', '"wield_msg"', '刹时雷声轰鸣'), '霎时雷声轰鸣');
    assert.equal(correctedClubText('mugun', '"long"', '刹时雷声轰鸣'), '刹时雷声轰鸣');
    assert.equal(correctedClubText('qimei_gun', '"name"', '白腊棍'), '白腊棍');
    assert.ok(data.varieties.find(r => r.id === 'qimei_gun').source.includes('白腊棍'));
});
