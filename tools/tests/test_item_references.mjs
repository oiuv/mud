// Read-only regression for migration reference discovery. No game/player data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { references } from './cloth_inventory.mjs';
import { migrationPaths as cloth } from './cloth_canonical.mjs';
import { migrationPaths as boots } from './boots_inventory.mjs';
import { migrationPaths as headwear } from './headwear_inventory.mjs';
import { migrationPaths as hands } from './hands_inventory.mjs';
import { migrationPaths as neck } from './neck_inventory.mjs';
import { migrationPaths as wrists } from './wrists_inventory.mjs';
import { migrationPaths as food } from './food_inventory.mjs';
import { migrationPaths as sword } from './sword_inventory.mjs';
import { migrationPaths as liquid } from './liquid_inventory.mjs';
import { migrationPaths as blade } from './blade_inventory.mjs';
import { migrationPaths as equip } from './equip_inventory.mjs';

import { migrationPaths as staff } from './staff_inventory.mjs';
import { migrationPaths as hammer } from './hammer_inventory.mjs';

test('all migrated historical item paths are absent, including root paths without slash', () => {
    const paths = { ...cloth(), ...boots(), ...headwear(), ...hands(), ...neck(), ...wrists(), ...food(), ...sword(), ...liquid(), ...blade(), ...equip(), ...hammer(), ...staff() };
    assert.equal(Object.keys(paths).length, 1113);
    const rows = Object.entries(paths).map(([old_path, new_path]) => ({ old_path, new_path }));
    assert.deepEqual(references(rows).hits, []);
});

test('absolute, root-relative, directory-relative, macro and concatenated spellings are found', () => {
    const source = `
#define OLD "d/city/obj/"
void create() {
    carry_object("/d/city/obj/cloth");
    carry_object("d/city/obj/cloth");
    new("d/city/obj/cloth.c");
    load_object("d/city/obj/cloth.lpc");
    carry_object(OLD "cloth");
    carry_object("d/city/" + "obj/cloth");
    carry_object("d/city/" "obj/cloth");
    carry_object(__DIR__ "obj/cloth");
    carry_object("obj/cloth");
    // carry_object("d/city/obj/cloth");
}
`;
    const rows = [
        { old_path: '/d/city/obj/cloth', new_path: '/d/items/cloth/buyi' },
        { old_path: '/d/village/npc/obj/cloth', new_path: '/d/items/cloth/buyi2' },
    ];
    const result = references(rows, new Map([['d/village/npc/test.c', source]]));
    assert.equal(result.hits.length, 9);
    assert.deepEqual(result.hits.map(h => h.new_path), [
        ...Array(7).fill('/d/items/cloth/buyi'), ...Array(2).fill('/d/items/cloth/buyi2'),
    ]);
    for (const hit of result.hits) assert.equal(source.slice(hit.start, hit.end), hit.expression);
    assert.equal(result.dynamic.length, 0);
});

test('root-relative dynamic prefixes are reported as clues, never exact replacements', () => {
    const source = 'void create() { new("d/city/obj/" + name); new("unrelated/obj/cloth"); }';
    const result = references([{ old_path: '/d/city/obj/cloth' }],
        new Map([['d/village/npc/test.c', source]]));
    assert.equal(result.hits.length, 0);
    assert.equal(result.dynamic.length, 1);
    assert.equal(result.dynamic[0].file, 'd/village/npc/test.c');
});
