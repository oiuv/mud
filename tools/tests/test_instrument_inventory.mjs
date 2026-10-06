import test from 'node:test';
import assert from 'node:assert/strict';
import { readBaseline, parseInstrument, canonicalGroups, migrationPaths, families,
    expectedCaller } from './instrument_inventory.mjs';
import { compareItemIds } from './item_ids.mjs';

const data = readBaseline();
test('instrument parser preserves all 24 sources and rejects extra behavior', () => {
    for (const row of data.varieties)
        assert.equal(parseInstrument(row.source, row.old_path.slice(1) + '.c').source_hash, row.source_hash);
    const source = data.varieties.find(r => r.family === 'qin').source;
    for (const invalid of [source + '\nvoid reset() {}\n',
        source.replace('inherit ITEM;', 'inherit ITEM; inherit F_UNIQUE;'),
        source.replace('inherit ITEM;', 'inherit SWORD;'),
        source.replace(/set_weight\(\d+\)/, 'set_weight(random(5000))'),
        source.replace('play_qin', 'play_xiao'),
        source.replace(/}\s*$/, 'set_temp("uses", 1);\n}')]) {
        assert.notEqual(invalid, source);
        assert.throws(() => parseInstrument(invalid, 'invalid-instrument.c'));
    }
});

test('24 distinct varieties use short semantic IDs, stable suffixes and natural ordering', () => {
    const groups = canonicalGroups(), paths = migrationPaths();
    assert.equal(Object.keys(paths).length, 24);
    assert.equal(new Set(Object.values(paths)).size, 24);
    for (const family of families) {
        const ids = groups.filter(g => g.family === family).map(g => g.id);
        assert.deepEqual(ids, [...ids].sort(compareItemIds));
    }
    assert.ok(groups.every(g => g.id.length <= 16 && !/hengyang|changan|taohua/.test(g.id)));
    for (const id of ['zhuxiao', 'zhuxiao2', 'zhuxiao3'])
        assert.ok(groups.some(g => g.id === id));
    assert.notEqual(paths['/d/hengyang/npc/obj/huqin'], paths['/d/hengyang/yueqi/huqin']);
    assert.deepEqual(families.map(f => groups.filter(g => g.family === f).length), [15, 7, 2]);
});

test('consumer replacement only changes recorded reference expressions', () => {
    for (const file of Object.keys(data.callers)) {
        let source = data.callers[file];
        for (const hit of data.hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
            assert.equal(source.slice(hit.start, hit.end), hit.expression);
            source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
        }
        assert.equal(expectedCaller(file), source);
    }
    assert.equal(data.hits.length, 27);
    assert.ok(data.hits.some(h => h.expression.includes('__DIR__')));
    assert.ok(data.hits.some(h => /"d\//.test(h.expression)));
});
