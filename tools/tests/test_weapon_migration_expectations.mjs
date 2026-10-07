// Independent old -> approved-current expectations; never reads saved game data.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tokenize } from '../../fluffos/tools/lpc-syntax/tokenizer.mjs';
import { normalization, definitionEntries, normalizeWeaponReferences } from './weapon_classification/normalization.mjs';
import { afterWeaponNormalization, normalizeWeaponTable, renderSpearDefinitions, weaponFixtureExpectations } from './weapon_classification/migration_expectations.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const frozen = file => execFileSync('git', ['show', normalization.baseline + ':' + file],
    { cwd: root, encoding: 'utf8', maxBuffer: 8e6 });
const semantic = text => tokenize(text.replaceAll('\r\n', '\n'))
    .filter(token => token.kind !== 'whitespace').map(token => [token.kind, token.text]);

test('current generators apply explicit deltas without overwriting the historical definitions', async () => {
    for (const family of ['sword', 'blade', 'hammer', 'club', 'whip']) {
        const metadata = await import('./' + family + '_inventory.mjs');
        const snapshot = new URL('./' + family + '/baseline.json', import.meta.url);
        const bytes = readFileSync(snapshot);
        const historical = metadata.renderHistoricalDefinitions();
        assert.deepEqual(semantic(historical), semantic(frozen('d/items/' + family + '_data.h')), family);
        const expected = metadata.renderDefinitions();
        assert.deepEqual(semantic(expected), semantic(normalizeWeaponTable(family, historical)), family);
        assert.deepEqual(readFileSync(snapshot), bytes, family + ': immutable baseline');
    }
});

test('category moves fail on missing sources or occupied destinations instead of dropping data', () => {
    const oldClub = frozen('d/items/club_data.h');
    const missing = oldClub.replace(definitionEntries(oldClub).get('bintie_qiang'), '');
    assert.throws(() => normalizeWeaponTable('club', missing), /Explicit outgoing variety/);
    assert.throws(() => normalizeWeaponTable('spear', renderSpearDefinitions()), /overwritten incoming/);
    assert.equal(normalizeWeaponTable('fork', frozen('d/items/fork_data.h')), '');
    assert.deepEqual([...definitionEntries(renderSpearDefinitions()).keys()],
        ['bintie_qiang', 'fangtian_ji', 'gangcha', 'sangu_cha']);
});

test('reference changes match complete quoted paths only', () => {
    const before = '/d/items/club/bintie_qiang', after = '/d/items/spear/bintie_qiang';
    for (const suffix of ['', '.c', '.lpc'])
        assert.equal(normalizeWeaponReferences(JSON.stringify(before + suffix)), JSON.stringify(after + suffix));
    for (const value of [before + '2', before + '/child', 'prefix' + before])
        assert.equal(normalizeWeaponReferences(JSON.stringify(value)), JSON.stringify(value));
});

test('driver merge expectations use frozen representatives and preserve aliases without mutating snapshots', async () => {
    const { canonicalGroups } = await import('./hammer_inventory.mjs');
    const groups = canonicalGroups(), saved = JSON.stringify(groups);
    const expected = weaponFixtureExpectations(groups);
    assert.equal(expected.canonical.length, groups.length - 3);
    assert.equal(JSON.stringify(groups), saved);
    const target = groups.find(group => group.id === 'tiechui');
    const donor = groups.find(group => group.id === 'tiechui2');
    assert.deepEqual(expected.references[donor.rows[0].old_path], {
        target: target.path, reference: target.representative.old_path,
    });
    assert.equal(expected.references[target.representative.old_path], undefined);
    assert.ok(expected.canonical.some(group => group.path === '/d/items/axe/kaishan_fu'));
    assert.ok(!expected.canonical.some(group => group.path === donor.path));
    const result = expected.canonical.find(group => group.path === target.path);
    for (const alias of donor.ids) assert.ok(result.ids.includes(alias));
    assert.throws(() => weaponFixtureExpectations(groups.filter(group => group !== target)),
        /Frozen merge representative/);
});

test('NPC changes are file scoped and preserve unrelated levels and fields', () => {
    const source = 'set_skill("hammer", 140); map_skill("hammer", "pangen-cuojiefu"); set("combat_exp", 123456);';
    const expected = 'set_skill("axe", 140); map_skill("axe", "pangen-cuojiefu"); set("combat_exp", 123456);';
    assert.equal(afterWeaponNormalization('kungfu/class/duan/gu.c', source), expected);
    assert.equal(afterWeaponNormalization('unrelated/npc.c', source), source);
    assert.notDeepEqual(semantic(expected.replace('140', '141')), semantic(afterWeaponNormalization('kungfu/class/duan/gu.c', source)));
});

test('Zhao teaching is an explicit expected addition, not copied from the current implementation', () => {
    const file = 'kungfu/class/riyue/zhao.c';
    const expected = afterWeaponNormalization(file, frozen(file));
    const actual = readFileSync(new URL('../../' + file, import.meta.url), 'utf8');
    assert.deepEqual(semantic(actual), semantic(expected));
    assert.notDeepEqual(semantic(actual.replace('"gongxian", -1200', '"gongxian", -1199')), semantic(expected));
});
