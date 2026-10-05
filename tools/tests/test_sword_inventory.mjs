import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSword, readBaseline, canonicalGroups } from './sword_inventory.mjs';

test('all frozen swords retain strict initialization and short stable identities', () => {
    const data = readBaseline();
    assert.equal(data.count, 85);
    for (const row of data.varieties) for (const [key, value] of Object.entries(parseSword(row.source, row.old_path))) {
        // The parser accepts a real file path; the generated key is only historical metadata.
        if (key === 'old_path' || key === 'key') continue;
        assert.deepEqual(value, row[key]);
    }
    assert.equal(canonicalGroups().length, 70);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
});

test('nonstandard initialization, extra callbacks and runtime expressions cannot become data silently', () => {
    const row = readBaseline().varieties[0], source = row.source;
    for (const edited of [source.replace('init_sword(25)', 'init_sword(random(25))'),
        source.replace('init_sword(25)', 'init_sword(25, 1)'), source + '\nvoid init() {}\n',
        source.replace('set("value", 500)', 'set("value", random(500))'),
        source.replace('init_sword(25);', 'init_sword(25); init_sword(25);')])
        assert.throws(() => parseSword(edited, 'd/test/sword.c'));
});
