// Frozen, strict inventory for ordinary ITEM + F_FOOD; never reads player data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = '1c35e24c3caa2c796ef0d7f20b1346e37785e51c';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
export const readBaseline = () => JSON.parse(readFileSync(resolve(root, 'tools/tests/food/baseline.json'), 'utf8'));

export function parseFood(source, file) {
    const inherited = [...source.matchAll(/\binherit\s+(\w+)\s*;/g)].map(m => m[1]).sort();
    assert.deepEqual(inherited, ['F_FOOD', 'ITEM'], file + ': inheritance');
    const hasSetup = /\bsetup\s*\(\s*\)\s*;/.test(source);
    const hasWeight = /\bset_weight\s*\(/.test(source);
    let normalized = source.replace(/\binherit\s+(ITEM|F_FOOD)\s*;/g, '');
    if (file === 'd/kunlun/obj/rice.c') normalized = normalized.replace(/void\s+init\s*\(\s*\)\s*;/, '');
    if (['d/changan/npc/obj/lhjiyu.c', 'd/changan/npc/obj/snxiangji.c'].includes(file)) {
        const constant = normalized.match(/string\s+name\s*=\s*([^;]+);/);
        assert.ok(constant, file + ': constant name');
        normalized = normalized.replace(constant[0], '').replace(/\bname\b/g, constant[1]);
    }
    normalized = 'inherit CLOTH;\n' + normalized;
    if (!hasWeight) normalized = normalized.replace(/if\s*\(\s*clonep\s*\(\s*\)\s*\)/, 'set_weight(0);\n$&');
    if (!hasSetup) normalized = normalized.replace(/}\s*$/, 'setup();\n}');
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch, row.after_branch], [[], [], []], file + ': extra setters');
    row.source_hash = createHash('sha256').update(source).digest('hex');
    row.has_setup = hasSetup;
    row.has_weight = hasWeight;
    return row;
}

export function canonicalGroups(data = readBaseline()) {
    const grouped = new Map();
    for (const row of data.varieties) {
        assert.ok(validId(row.id), 'Invalid food ID: ' + row.id);
        if (!grouped.has(row.id)) grouped.set(row.id, []);
        grouped.get(row.id).push(row);
    }
    return [...grouped].sort(([a], [b]) => compareItemIds(a, b)).map(([id, rows]) => {
        const ids = [...new Set(rows.flatMap(r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text))))];
        for (const row of rows) {
            const first = JSON.parse(tokens(row.name[1]).find(t => t.kind === 'string').text)[0].toLowerCase();
            if (first !== ids[0][0].toLowerCase() && !ids.includes(first)) ids.push(first);
        }
        return { id, path: '/d/items/food/' + id, rows, representative: rows[0], ids };
    });
}
export const migrationPaths = () => Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path]));
export function expectedCaller(file) {
    const data = readBaseline();
    let source = data.callers[file];
    assert.equal(typeof source, 'string', file);
    for (const hit of data.hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(hit.start, hit.end), hit.expression);
        source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
    }
    return source;
}
export function afterFoodMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected food baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通食物的蓝图属性；规范 ID 自然排序，行为由 ITEM + F_FOOD 提供。\n'
        + 'private mapping food_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "properties": ({\n`
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${value} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const data = readBaseline();
    const historicalPaths = git('grep', '-l', '-e', 'inherit F_FOOD;', baseline, '--', 'd/').trim().split('\n')
        .map(s => s.slice(baseline.length + 1));
    assert.equal(historicalPaths.length, 184);
    assert.deepEqual(new Set(historicalPaths), new Set([...data.varieties.map(r => r.old_path.slice(1) + '.c'),
        ...data.excluded.map(e => e.file)]));
    assert.equal(data.varieties.filter(r => r.has_setup).length, 38);
    assert.equal(data.varieties.filter(r => !r.has_weight).length, 13);
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c';
        const parsed = parseFood(original(file), file);
        for (const key of Object.keys(parsed)) assert.deepEqual(parsed[key], row[key], file + ': ' + key);
    }
    console.log(`FOOD HISTORICAL AUDIT PASS: ${data.varieties.length} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
