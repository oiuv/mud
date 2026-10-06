import { afterWhipMigration } from './whip_inventory.mjs';
import { afterStaffMigration } from './staff_inventory.mjs';
import { afterHammerMigration } from './hammer_inventory.mjs';
import { afterEquipMigration } from "./equip_inventory.mjs";
import { readBaseline as equipBaseline } from './equip_inventory.mjs';
import { afterBladeMigration } from "./blade_inventory.mjs";
import { afterLiquidMigration } from "./liquid_inventory.mjs";
import assert from 'node:assert/strict';
import { afterWristsMigration } from './wrists_inventory.mjs';
import { afterFoodMigration } from './food_inventory.mjs';
import { afterSwordMigration } from './sword_inventory.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { references } from './cloth_inventory.mjs';
import { root, original, readBaseline, canonicalGroups, renderDefinitions, expectedCaller, dynamicCallers } from './boots_inventory.mjs';
import { readBaseline as headwearBaseline, original as beforeHeadwear, expectedCaller as expectedHeadwearCaller,
    dynamicCallers as headwearDynamicCallers } from './headwear_inventory.mjs';
import { renameReferences } from './item_ids.mjs';
import { afterHandsMigration } from './hands_inventory.mjs';
import { afterNeckMigration } from './neck_inventory.mjs';

const semantic = source => tokenize(source.replaceAll('\r\n', '\n'))
    .filter(t => t.kind !== 'whitespace').map(t => [t.kind, t.text]);
const baseline = readBaseline();
const callers = new Set([...baseline.hits.map(h => h.file), ...dynamicCallers]);
for (const file of callers) {
    let expected = expectedCaller(file);
    if (headwearBaseline().hits.some(h => h.file === file) || headwearDynamicCallers.includes(file)) {
        assert.deepEqual(semantic(renameReferences(beforeHeadwear(file))), semantic(expected), 'BOOTS historical caller baseline changed: ' + file);
        expected = expectedHeadwearCaller(file);
    }
    expected = afterHandsMigration(file, expected, semantic);
    expected = afterNeckMigration(file, expected, semantic);
    expected = afterWristsMigration(file, expected, semantic);
    expected = afterFoodMigration(file, expected, semantic);
    expected = afterWhipMigration(file, afterStaffMigration(file, afterHammerMigration(file, afterEquipMigration(file, afterBladeMigration(file, afterLiquidMigration(file, afterSwordMigration(file, expected, semantic), semantic), semantic), semantic), semantic), semantic), semantic);
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')), semantic(expected), 'Unexpected caller change: ' + file);
}
assert.equal(callers.size, 15);
assert.equal(baseline.hits.length, 17);
assert.equal(references(baseline.varieties).hits.length, 0, 'Old executable reference');
assert.deepEqual(semantic(readFileSync(join(root, 'd/items/boots_data.h'), 'utf8')), semantic(renderDefinitions()));
for (const row of baseline.varieties) {
    assert.equal(existsSync(join(root, row.old_path.slice(1) + '.c')), false);
    for (const suffix of ['.c', '.lpc']) assert.equal(existsSync(join(root, row.new_path.slice(1) + suffix)), false);
}
for (const file of ['d/lanzhou/npc/obj/shoes.c', 'd/lanzhou/obj/shoes.c', 'd/village/npc/obj/shoes.c',
    'd/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-chen.c'])
    assert.deepEqual(semantic(readFileSync(join(root, file), 'utf8')),
        semantic(afterWhipMigration(file, afterStaffMigration(file, afterHammerMigration(file, afterEquipMigration(file, afterBladeMigration(file, afterLiquidMigration(file, afterSwordMigration(file, afterWristsMigration(file, afterNeckMigration(file, afterHandsMigration(file, renameReferences(original(file)), semantic), semantic), semantic), semantic), semantic), semantic), semantic), semantic), semantic), semantic)), 'Excluded behavior changed: ' + file);
// The former exclusion is now covered by the separate direct-EQUIP migration.
const oldShoe = equipBaseline().varieties.find(row => row.old_path === '/d/city/npc/cloth/shoes');
assert.deepEqual(semantic(oldShoe.source), semantic(original('d/city/npc/cloth/shoes.c')));
assert.equal(oldShoe.new_path, '/d/items/equip/xiuhuaxie');
assert.equal(existsSync(join(root, 'd/city/npc/cloth/shoes.c')), false);
// No two substitutions in one file collapse distinct configuration keys in this batch.
for (const file of callers) {
    const paths = new Map();
    for (const h of baseline.hits.filter(h => h.file === file)) {
        if (!paths.has(h.new_path)) paths.set(h.new_path, new Set());
        paths.get(h.new_path).add(h.old_path);
    }
    assert.ok([...paths.values()].every(p => p.size === 1), 'Review merged configuration keys: ' + file);
}
assert.equal(canonicalGroups().length, 8);
console.log('BOOTS AUDIT PASS: 19 originals -> 8 varieties; 15 caller files, 17 static + 2 dynamic; no key collisions, old files or aliases; excluded files unchanged');
