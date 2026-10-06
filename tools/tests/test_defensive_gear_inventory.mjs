import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArmor, readBaseline, canonicalGroups, correctedText, original, excluded } from './defensive_gear_inventory.mjs';
const data = readBaseline();
test('fixed armor parser rejects callbacks, extra inheritance, random and temporary state', () => {
    const s = data.varieties[0].source;
    for (const invalid of [s + '\nvoid init() {}', s.replace('inherit ARMOR;', 'inherit ARMOR; inherit F_UNIQUE;'),
        s.replace(/set_weight\(\d+\)/, 'set_weight(random(2000))'), s.replace('setup();', 'set_temp("uses", 1); setup();')])
        assert.throws(() => parseArmor(invalid, 'invalid.c'));
});
test('all six special /d definitions are rejected instead of losing behavior', () => {
    for (const f of excluded.filter(f => f.startsWith('d/'))) assert.throws(() => parseArmor(original(f), f), f);
});
test('four groups merge, shaolin flag and parent families remain distinct', () => {
    const groups = canonicalGroups();
    assert.equal(groups.length, 10); assert.equal(groups.filter(g => g.rows.length > 1).length, 4);
    assert.equal(groups.find(g => g.id === 'niupi_dun').rows.length, 4);
    assert.ok(groups.find(g => g.id === 'shaolin_huyao').representative.properties.some(([k, v]) => k === '"shaolin"' && v === '1'));
    assert.ok(!groups.find(g => g.id === 'tie_huyao').representative.properties.some(([k]) => k === '"shaolin"'));
    assert.ok(groups.every(g => g.id.length <= 13));
});
test('only two reviewed pangu display fields change; snapshots retain old text', () => {
    for (const row of data.varieties) for (const [key, value] of row.properties) {
        const corrected = correctedText(row.id, key, value);
        if (corrected !== value) assert.ok(row.id === 'pangu_kai' && ['"unit"', '"long"'].includes(key));
    }
    assert.equal(correctedText('pangu_kai', '"unit"', '"见"'), '"件"');
    assert.equal(correctedText('pangu_kai', '"material"', '"cloth"'), '"cloth"');
    assert.equal(data.varieties.filter(r => r.source.includes('一见黑黝黝')).length, 2);
});
