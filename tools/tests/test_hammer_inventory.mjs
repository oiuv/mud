import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseHammer, readBaseline, canonicalGroups } from './hammer_inventory.mjs';

test('43 fixed HAMMER definitions retain 40 meaningful stable identities', () => {
    const data = readBaseline();
    assert.equal(data.count, 43);
    for (const row of data.varieties)
        assert.deepEqual(parseHammer(row.source, row.old_path.slice(1) + '.c'),
            Object.fromEntries(Object.keys(parseHammer(row.source, row.old_path.slice(1) + '.c')).map(k => [k, row[k]])));
    assert.equal(canonicalGroups().length, 40);
    assert.ok(data.varieties.every(r => r.flags === 0));
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
    const overwritten = data.varieties.filter(r => r.weight_writes.length === 2);
    assert.equal(overwritten.length, 1);
    assert.deepEqual(overwritten[0].weight_writes, [160000, 20000]);
    assert.equal(overwritten[0].weight, '20000');
});

test('source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/hammer_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('only fixed initialization and adjacent constant weight overwrites are data', () => {
    const source = readBaseline().varieties[0].source;
    for (const edited of [
        source.replace('init_hammer(15)', 'init_hammer(random(15))'),
        source.replace('init_hammer(15)', 'init_hammer(15, 110)'),
        source.replace('init_hammer(15)', 'init_hammer(15, 0, 0)'),
        source + '\nvoid init() {}\n',
        source.replace('inherit HAMMER;', 'inherit HAMMER; inherit F_FOOD;'),
        source.replace('inherit HAMMER;', 'inherit BLADE;'),
        source.replace('set_weight(8000)', 'set_weight(random(8000))'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_hammer(15);', 'init_hammer(15); init_hammer(15);'),
        source.replace('set_weight(8000);', 'set_weight(9000); set("value", query_weight()); set_weight(8000);'),
        source.replace('set_weight(8000);', 'set_weight(1); set_weight(2); set_weight(8000);'),
    ]) assert.throws(() => parseHammer(edited, 'd/test/hammer.c'));
    assert.equal(parseHammer(source.replace('set_weight(8000);',
        'set_weight(9000); /* discarded constant */ set_weight(8000);'), 'd/test/hammer.c').weight, '8000');
});
