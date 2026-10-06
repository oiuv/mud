import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseStaff, readBaseline, canonicalGroups, original, excluded } from './staff_inventory.mjs';

test('37 fixed STAFF definitions preserve 32 stable identities and original LONG behavior', () => {
    const data = readBaseline();
    assert.equal(data.count, 37);
    for (const row of data.varieties) {
        const parsed = parseStaff(row.source, row.old_path.slice(1) + '.c');
        assert.deepEqual(parsed, Object.fromEntries(Object.keys(parsed).map(k => [k, row[k]])));
    }
    assert.equal(canonicalGroups().length, 32);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
    assert.ok(data.observations.every(o => o.blueprint.flag === 16 && o.clone.flag === 16));
});

test('source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/staff_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('only fixed STAFF initialization is accepted; special objects stay excluded', () => {
    const source = readBaseline().varieties[0].source;
    for (const edited of [
        source.replace('init_staff(25)', 'init_staff(random(25))'),
        source.replace('init_staff(25)', 'init_staff(25, 110)'),
        source.replace('init_staff(25)', 'init_staff(25, 0, 0)'),
        source + '\nvoid init() {}\n',
        source.replace('inherit STAFF;', 'inherit STAFF; inherit F_FOOD;'),
        source.replace('inherit STAFF;', 'inherit BLADE;'),
        source.replace('set_weight(4000)', 'set_weight(random(4000))'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_staff(25);', 'init_staff(25); init_staff(25);'),
    ]) assert.throws(() => parseStaff(edited, 'd/test/staff.c'));
    for (const file of excluded) assert.throws(() => parseStaff(original(file), file), file);
});
