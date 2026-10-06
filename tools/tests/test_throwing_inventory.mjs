import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseThrowing, readBaseline, canonicalGroups, original, excluded, correctedThrowingText, renderDefinitions } from './throwing_inventory.mjs';

test('27 fixed THROWING definitions preserve 26 stable identities and independent quantities', () => {
    const data = readBaseline();
    assert.equal(data.count, 27);
    for (const row of data.varieties) {
        const parsed = parseThrowing(row.source, row.old_path.slice(1) + '.c');
        assert.deepEqual(parsed, Object.fromEntries(Object.keys(parsed).map(k => [k, row[k]])));
    }
    assert.equal(canonicalGroups().length, 26);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
    assert.ok(data.observations.every(o => (o.blueprint.flag ?? 0) === 8 && (o.clone.flag ?? 0) === 8));
});

test('source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/throwing_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('three approved display corrections keep all unrelated frozen fields unchanged', () => {
    const changes = [];
    for (const row of readBaseline().varieties) for (const [key, value] of row.properties) {
        const corrected = correctedThrowingText(row.old_path, key, value);
        if (corrected !== value) changes.push([row.old_path, key, value, corrected]);
    }
    assert.equal(changes.length, 3);
    for (const [needle, replacement] of [['挂这晶莹', '挂着晶莹'], ['沉颠颠', '沉甸甸']]) {
        const changed = changes.find(c => c[2].includes(needle));
        assert.ok(changed, needle);
        assert.equal(changed[3], changed[2].replace(needle, replacement));
        assert.ok(renderDefinitions().includes(changed[3]));
        assert.equal(correctedThrowingText('/unrelated', changed[1], changed[2]), changed[2]);
    }
});

test('only fixed THROWING initialization is accepted; special objects stay excluded', () => {
    const source = readBaseline().varieties[0].source;
    for (const edited of [
        source.replace('init_throwing(50)', 'init_throwing(random(4))'),
        source.replace('set_amount(10)', 'set_amount(random(10))'),
        source.replace('init_throwing(50)', 'init_throwing(4, 0, 0)'),
        source + '\nvoid init() {}\n',
        source.replace('inherit THROWING;', 'inherit THROWING; inherit F_FOOD;'),
        source.replace('inherit THROWING;', 'inherit BLADE;'),
        source.replace('set_amount(10);', 'set_temp("poison", 1); set_amount(10);'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_throwing(50);', 'init_throwing(50); init_throwing(50);'),
    ]) assert.throws(() => parseThrowing(edited, 'd/test/throwing.c'));
    for (const file of excluded) assert.throws(() => parseThrowing(original(file), file), file);
});
