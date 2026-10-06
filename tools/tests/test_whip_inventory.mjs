import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseWhip, readBaseline, canonicalGroups, original, excluded } from './whip_inventory.mjs';

test('32 fixed WHIP definitions preserve 25 stable identities and zero flags', () => {
    const data = readBaseline();
    assert.equal(data.count, 32);
    for (const row of data.varieties) {
        const parsed = parseWhip(row.source, row.old_path.slice(1) + '.c');
        assert.deepEqual(parsed, Object.fromEntries(Object.keys(parsed).map(k => [k, row[k]])));
    }
    assert.equal(canonicalGroups().length, 25);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
    assert.ok(data.observations.every(o => (o.blueprint.flag ?? 0) === 0 && (o.clone.flag ?? 0) === 0));
});

test('source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/whip_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('only fixed WHIP initialization is accepted; special objects stay excluded', () => {
    const source = readBaseline().varieties[0].source;
    for (const edited of [
        source.replace('init_whip(30)', 'init_whip(random(30))'),
        source.replace('init_whip(30)', 'init_whip(30, 110)'),
        source.replace('init_whip(30)', 'init_whip(30, 0, 0)'),
        source + '\nvoid init() {}\n',
        source.replace('inherit WHIP;', 'inherit WHIP; inherit F_FOOD;'),
        source.replace('inherit WHIP;', 'inherit BLADE;'),
        source.replace('set_weight(700)', 'set_weight(random(700))'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_whip(30);', 'init_whip(30); init_whip(30);'),
    ]) assert.throws(() => parseWhip(edited, 'd/test/whip.c'));
    for (const file of excluded) assert.throws(() => parseWhip(original(file), file), file);
});
