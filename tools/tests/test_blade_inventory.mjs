import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { parseBlade, readBaseline, canonicalGroups } from './blade_inventory.mjs';

test('all frozen blades retain strict initialization and short stable identities', () => {
    const data = readBaseline();
    assert.equal(data.count, 61);
    for (const row of data.varieties) for (const [key, value] of Object.entries(parseBlade(row.source, row.old_path))) {
        // The parser accepts a real file path; the generated key is only historical metadata.
        if (key === 'old_path' || key === 'key') continue;
        assert.deepEqual(value, row[key]);
    }
    assert.equal(canonicalGroups().length, 52);
    assert.equal(data.varieties.filter(r => r.flags === 110).length, 3);
    assert.equal(data.varieties.filter(r => r.flags === 0).length, 58);
    assert.ok(canonicalGroups().every(g => g.id.length <= 16 && !/_npc_|_obj_/.test(g.id)));
});

test('frozen source snapshots cannot be overwritten', () => {
    assert.throws(() => execFileSync(process.execPath, ['tools/tests/blade_inventory.mjs', '--capture'],
        { stdio: 'pipe' }), /Do not overwrite the frozen baseline/);
});

test('nonstandard initialization, extra callbacks and runtime expressions cannot become data silently', () => {
    const row = readBaseline().varieties[0], source = row.source;
    for (const edited of [source.replace('init_blade(5)', 'init_blade(random(5))'),
        source.replace('init_blade(5)', 'init_blade(5, random(110))'),
        source.replace('init_blade(5)', 'init_blade(5, 110, 0)'), source + '\nvoid init() {}\n',
        source.replace('set_weight(1000)', 'set_weight(random(1000))'),
        source.replace('setup();', 'setup(42);'),
        source.replace('init_blade(5);', 'init_blade(5); init_blade(5);')])
        assert.throws(() => parseBlade(edited, 'd/test/blade.c'));
});
