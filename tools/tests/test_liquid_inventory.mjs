import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parseLiquid, readBaseline, root } from './liquid_inventory.mjs';

test('74 fixed constructors retain liquid data and actual setup choices', () => {
    const data = readBaseline();
    assert.equal(data.varieties.length, 74);
    assert.equal(data.varieties.filter(r => r.setup).length, 4);
    for (const row of data.varieties) {
        const parsed = parseLiquid(row.source, row.old_path);
        assert.deepEqual(parsed.after_branch, row.after_branch);
        assert.equal(parsed.setup, row.setup);
    }
});
test('rejects callbacks, runtime expressions, non-liquid parents and extra setup behavior', () => {
    const source = readBaseline().varieties[0].source;
    for (const changed of [source + '\nvoid init() {}', source.replace('set_weight(50)', 'set_weight(random(50))'),
        source.replace('"remaining": 0', '"remaining": random(10)'),
        source.replace('inherit F_LIQUID;', ''), source.replace('inherit ITEM;', 'inherit ARMOR;'),
        source + '\nvoid setup() {}', source.replace('"remaining": 0', '"remaining": counter')])
        assert.throws(() => parseLiquid(changed, 'test.c'));
});
test('capture cannot overwrite historical snapshot', () => {
    const file = root + '/tools/tests/liquid/baseline.json';
    const before = readFileSync(file);
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/liquid_inventory.mjs', '--capture'],
        { cwd: root, stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
    assert.deepEqual(readFileSync(file), before);
});
