import test from 'node:test';
import assert from 'node:assert/strict';
import { readBaseline, parseBook, canonicalGroups, correctedBookText, migrationPaths } from './book_inventory.mjs';
import { compareItemIds } from './item_ids.mjs';

const data = readBaseline();

test('BOOK parser preserves all frozen ordinary ITEM definitions and rejects added behavior', () => {
    for (const row of data.varieties) assert.equal(parseBook(row.source, row.old_path.slice(1) + '.c').source_hash, row.source_hash);
    const source = data.varieties.find(row => row.id === 'baibian_shentong').source;
    for (const invalid of [source + '\nvoid init() {}\n',
        source.replace('inherit ITEM;', 'inherit ITEM; inherit F_UNIQUE;'),
        source.replace(/set_weight\(\d+\)/, 'set_weight(random(5000))'),
        source.replace(/}\s*$/, 'setup();\n}'),
        source.replace(/}\s*$/, 'set_temp("uses", 1);\n}')]) {
        assert.notEqual(invalid, source);
        assert.throws(() => parseBook(invalid, 'invalid-book.c'));
    }
});

test('36 historical paths resolve directly to 28 naturally sorted canonical definitions', () => {
    const groups = canonicalGroups(), paths = migrationPaths();
    assert.equal(Object.keys(paths).length, 36);
    assert.equal(new Set(Object.values(paths)).size, 28);
    assert.equal(groups.length, 28);
    assert.deepEqual(groups.map(g => g.id), groups.map(g => g.id).sort(compareItemIds));
    assert.equal(groups.find(g => g.id === 'fojing1').rows.length, 3);
    assert.equal(groups.find(g => g.id === 'fojing5').rows.length, 2);
    for (const suffix of ['1', '2', '3', '4', '5']) assert.ok(groups.some(g => g.id === 'fojing' + suffix));
    assert.ok(groups.every(g => g.id.length <= 16 && !/changan|shaolin|lingxiao/.test(g.id)));
});

test('random name, skill and blueprint jing cost remain distinct literal metadata', () => {
    const rows = canonicalGroups().map(g => g.representative);
    assert.ok(rows.some(r => r.name_choices.length > 1));
    assert.ok(rows.some(r => r.name_choices.length === 1));
    assert.ok(rows.find(r => r.id === 'shiban').skill_choices.length > 1);
    assert.equal(rows.find(r => r.id === 'daodejing1').jing_cost_random, 10);
    assert.equal(rows.find(r => r.id === 'daodejing2').jing_cost_random, 20);
    assert.ok(rows.filter(r => !r.id.startsWith('daodejing')).every(r => r.jing_cost_random === 0));
});

test('only three approved long text corrections apply; names and frozen sources stay unchanged', () => {
    assert.equal(correctedBookText('siji_jianfa', '"long"', '奥决'), '奥诀');
    assert.equal(correctedBookText('bojuan', '"long"', '吐呐'), '吐纳');
    assert.equal(correctedBookText('shiban', '"long"', '园园的石板'), '圆圆的石板');
    assert.equal(correctedBookText('shiban', '"name"', '园园的石板'), '园园的石板');
    assert.equal(correctedBookText('other', '"long"', '吐呐'), '吐呐');
    assert.ok(data.varieties.find(r => r.id === 'bojuan').source.includes('吐呐'));
});
