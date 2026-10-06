import * as whip from './whip_inventory.mjs';
// Naming-only regression: fixed IDs, frozen baselines and no runtime aliases.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, references } from './cloth_inventory.mjs';
import * as cloth from './cloth_canonical.mjs';
import * as boots from './boots_inventory.mjs';
import * as headwear from './headwear_inventory.mjs';
import * as hands from './hands_inventory.mjs';
import * as neck from './neck_inventory.mjs';
import * as wrists from './wrists_inventory.mjs';
import * as food from './food_inventory.mjs';
import * as sword from './sword_inventory.mjs';
import * as liquid from './liquid_inventory.mjs';
import * as blade from './blade_inventory.mjs';
import * as equip from './equip_inventory.mjs';
import { canonicalId, canonicalPath, currentBaseline, renamedIds, renamedPaths, validId, compareItemIds } from './item_ids.mjs';

import * as staff from './staff_inventory.mjs';
import * as hammer from './hammer_inventory.mjs';

const families = { cloth, boots, headwear };
const counts = { cloth: 148, boots: 8, headwear: 36 };
const historicalNames = JSON.parse(execFileSync('git', ['show', 'b081c7ff:tools/tests/cloth/canonical_ids.json'],
    { cwd: root, encoding: 'utf8', windowsHide: true }));

test('all 1145 historical paths resolve to registered varieties in one pass', () => {
    const all = { ...families, hands, neck, wrists, food, sword, liquid, blade, equip, hammer, staff, whip };
    const pairs = Object.values(all).flatMap(m => Object.entries(m.migrationPaths()));
    const paths = Object.fromEntries(pairs);
    const targets = new Set(Object.values(all).flatMap(m => m.canonicalGroups().map(g => g.path)));
    assert.equal(pairs.length, 1145);
    assert.equal(Object.keys(paths).length, 1145);
    assert.equal(targets.size, 674);
    for (const [oldPath, target] of pairs) {
        assert.ok(targets.has(target), oldPath);
        assert.equal(paths[target] ?? target, target, oldPath + ': no second conversion');
    }
});

test('all fourteen data tables and renderers use natural ID order without changing definitions or history', () => {
    const idsIn = source => [...source.matchAll(/^        "([a-z][a-z0-9_]*)": \(\[/gm)].map(m => m[1]);
    assert.deepEqual(['chahua10', 'buyi2', 'chahua2', 'buyi', 'chahua13', 'chahua1'].sort(compareItemIds),
        ['buyi', 'buyi2', 'chahua1', 'chahua2', 'chahua10', 'chahua13']);
    for (const [family, metadata] of Object.entries({ ...families, hands, neck, wrists, food, sword, liquid, blade, equip, hammer, staff, whip })) {
        const snapshot = join(root, `tools/tests/${family}/baseline.json`);
        const savedBytes = readFileSync(snapshot);
        const groupsBefore = metadata.canonicalGroups();
        const pathsBefore = metadata.migrationPaths();
        const expected = groupsBefore.map(g => g.id).sort(compareItemIds);
        const rendered = metadata.renderDefinitions();
        const actual = readFileSync(join(root, `d/items/${family}_data.h`), 'utf8');
        assert.deepEqual(idsIn(rendered), expected, family + ' generator order');
        assert.deepEqual(idsIn(actual), expected, family + ' file order');
        assert.equal(new Set(expected).size, counts[family] ?? ({ neck: 10, hands: 20, wrists: 4, food: 119, sword: 70, liquid: 54, blade: 52, equip: 56, hammer: 40, staff: 32, whip: 25 })[family]);
        assert.deepEqual(metadata.canonicalGroups(), groupsBefore, family + ' historical group order unchanged');
        assert.deepEqual(metadata.migrationPaths(), pathsBefore, family + ' migration unchanged');
        assert.deepEqual(readFileSync(snapshot), savedBytes, family + ' frozen baseline unchanged');
    }
    for (const metadata of [headwear, hands, neck, wrists]) {
        const selection = metadata.canonicalGroups().map(g => g.id).reverse().slice(0, 4);
        assert.deepEqual(idsIn(metadata.renderDefinitions(selection)), [...selection].sort(compareItemIds));
    }
});

test('all 192 varieties retain their historical members and have unique meaningful IDs', () => {
    for (const [family, metadata] of Object.entries(families)) {
        const saved = JSON.parse(readFileSync(join(root, `tools/tests/${family}/baseline.json`), 'utf8'));
        const groups = metadata.canonicalGroups();
        const ids = groups.map(g => g.id);
        assert.equal(groups.length, counts[family]);
        assert.equal(new Set(ids).size, ids.length);
        assert.ok(ids.every(validId));
        const oldIds = family === 'cloth' ? Object.values(historicalNames) : [...new Set(saved.varieties.map(r => r.id))];
        const clothNames = new Map(saved.varieties.filter(row => family === 'cloth' && historicalNames[row.key])
            .map(row => [cloth.definitionSignature(row), historicalNames[row.key]]));
        assert.deepEqual(new Set(ids), new Set(oldIds.map(id => canonicalId(family, id))));
        for (const oldId of Object.keys(renamedIds[family])) assert.ok(oldIds.includes(oldId), 'Unknown old ID: ' + oldId);
        for (const group of groups) {
            const expected = saved.varieties.filter(row => canonicalId(family,
                family === 'cloth' ? clothNames.get(cloth.definitionSignature(row)) : row.id) === group.id);
            assert.deepEqual(group.rows.map(r => r.old_path).sort(), expected.map(r => r.old_path).sort());
            for (const row of group.rows) {
                assert.equal(metadata.migrationPaths()[row.old_path], group.path);
                if (family === 'cloth') assert.equal(metadata.migrationPaths()[row.new_path], group.path);
            }
        }
        for (const [oldPath, path] of Object.entries(metadata.migrationPaths())) {
            assert.ok(ids.includes(path.split('/').at(-1)), 'Unregistered target: ' + oldPath);
            assert.equal(canonicalPath(path), path, 'Migration needs another pass: ' + path);
        }
    }
});

test('stable numbers survive sorting and insertion; saved baselines are not mutated', () => {
    for (const [family, names] of Object.entries(renamedIds)) {
        const before = Object.entries(names).map(([id, target]) => [id, canonicalId(family, id), target]);
        for (const [id, target, expected] of before.reverse()) {
            assert.equal(canonicalId(family, id), expected);
            assert.equal(target, expected);
        }
        assert.equal(canonicalId(family, 'new_variety99'), 'new_variety99');
        if (family === 'cloth') continue;
        const saved = JSON.parse(readFileSync(join(root, `tools/tests/${family}/baseline.json`), 'utf8'));
        const bytes = JSON.stringify(saved);
        const projected = currentBaseline(family, saved);
        const reversed = currentBaseline(family, { ...saved, varieties: [...saved.varieties].reverse() });
        assert.deepEqual(reversed.varieties, [...projected.varieties].reverse());
        assert.equal(JSON.stringify(saved), bytes);
        for (let i = 0; i < saved.varieties.length; i++) {
            assert.equal(projected.varieties[i].source, saved.varieties[i].source);
            assert.equal(projected.varieties[i].source_hash, saved.varieties[i].source_hash);
        }
    }
    const flowers = headwear.canonicalGroups().filter(g => /^chahua[0-9]+$/.test(g.id));
    assert.equal(flowers.length, 13);
    for (const g of flowers) assert.equal(g.representative.old_path, '/d/dali/obj/' + g.id);
});

test('short IDs allow numbers but reject invalid paths and keep unknown names unknown', () => {
    for (const id of ['buyi', 'buyi2', 'hong_meigui3', 'chahua13']) assert.ok(validId(id));
    for (const id of ['', '2', 'foo/bar', '../buyi', '_buyi', 'Buyi', 'buyi#1', 'buyi-1', null]) assert.ok(!validId(id));
    assert.equal(canonicalPath('/d/items/cloth/unknown'), '/d/items/cloth/unknown');
});

test('all renamed paths are absent from game references and definition keys', () => {
    const old = Object.keys(families).flatMap(family => Object.keys(renamedPaths(family)).map(old_path => ({ old_path })));
    assert.equal(references(old).hits.length, 0, 'Old long ID still called by the game');
    for (const [family, names] of Object.entries(renamedIds)) {
        const data = readFileSync(join(root, `d/items/${family}_data.h`), 'utf8');
        for (const id of Object.keys(names)) assert.ok(!data.includes(`"${id}": ([`), 'Runtime alias: ' + id);
    }
});
