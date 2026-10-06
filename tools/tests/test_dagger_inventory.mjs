import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseDagger, readBaseline, canonicalGroups, original, excluded, correctedDaggerText, renderDefinitions } from './dagger_inventory.mjs';

test('23 fixed DAGGER definitions preserve 22 stable identities and edged/secondary flags', () => {
    const data = readBaseline();
    assert.equal(data.count, 23);
    for (const row of data.varieties) {
        const parsed = parseDagger(row.source, row.old_path.slice(1) + '.c');
        assert.deepEqual(parsed, Object.fromEntries(Object.keys(parsed).map(k => [k, row[k]])));
    }
    assert.equal(canonicalGroups().length, 22);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
    assert.ok(data.observations.every(o => (o.blueprint.flag ?? 0) === 6 && (o.clone.flag ?? 0) === 6));
});

test('source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/dagger_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('three approved display corrections keep all unrelated frozen fields unchanged', () => {
    const changes = [];
    for (const row of readBaseline().varieties) for (const [key, value] of row.properties) {
        const corrected = correctedDaggerText(row.old_path, key, value);
        if (corrected !== value) changes.push([row.old_path, key, value, corrected]);
    }
    assert.equal(changes.length, 3);
    for (const [needle, replacement] of [['看起相当普通', '看起来相当普通'], ['宫，绣着', '扇，绣着'], ['放会兜里', '放回兜里']]) {
        const changed = changes.find(c => c[2].includes(needle));
        assert.ok(changed, needle);
        assert.equal(changed[3], changed[2].replace(needle, replacement));
        assert.ok(renderDefinitions().includes(changed[3]));
        assert.equal(correctedDaggerText('/unrelated', changed[1], changed[2]), changed[2]);
    }
});

test('only fixed DAGGER initialization is accepted; special objects stay excluded', () => {
    const source = readBaseline().varieties[0].source;
    for (const edited of [
        source.replace('init_dagger(4)', 'init_dagger(random(4))'),
        source.replace('init_dagger(4)', 'init_dagger(4, 110)'),
        source.replace('init_dagger(4)', 'init_dagger(4, 0, 0)'),
        source + '\nvoid init() {}\n',
        source.replace('inherit DAGGER;', 'inherit DAGGER; inherit F_FOOD;'),
        source.replace('inherit DAGGER;', 'inherit BLADE;'),
        source.replace('set_weight(1000)', 'set_weight(random(1000))'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_dagger(4);', 'init_dagger(4); init_dagger(4);'),
    ]) assert.throws(() => parseDagger(edited, 'd/test/dagger.c'));
    for (const file of excluded) assert.throws(() => parseDagger(original(file), file), file);
});
