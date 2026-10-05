// Offline WRISTS migration metadata; never imported by the running game.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { root, parseCloth, tokens, references } from './cloth_inventory.mjs';
import { validId, compareItemIds } from './item_ids.mjs';

export { root };
export const baseline = '61abfde332b86b286f2cf8ce44d5b502cfbec10e';
export const original = file => execFileSync('git', ['show', `${baseline}:${file}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 32e6 });
export const readBaseline = () => JSON.parse(readFileSync(resolve(root, 'tools/tests/wrists/baseline.json'), 'utf8'));
export const groups = {
    huwan: ['city/npc/obj/huwan', 'city/obj/huwan', 'jingzhou/obj/huwan'],
    shaolin_huwan: ['shaolin/obj/huwan'],
    tie_huwan: ['mingjiao/obj/huwan'],
    wanlian: ['changan/npc/obj/wrists'],
};
export const excluded = ['d/luoyang/npc/obj/wanlun1.c'];
export const dynamicCallers = ['d/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-xiang.c'];
export const unrelatedCallers = ['d/changan/npc/fujiang.c', 'kungfu/class/shaolin/dao-chen.c', 'd/city/npc/obj/yang.c'];

export function parseWrists(source, file) {
    assert.equal(tokens(source)[1].text, 'WRISTS');
    let parsedSource = source.replace(/inherit\s+WRISTS\s*;/, 'inherit CLOTH;');
    const weights = [...source.matchAll(/set_weight\(([^;]+)\);/g)];
    assert.ok(weights.length <= 1, 'Literal weight setter: ' + file);
    if (!weights.length) {
        assert.match(source, /set\("weight", 200\);/);
        parsedSource = parsedSource.replace('if (clonep()', 'set_weight(0);\nif (clonep()');
    }
    const row = parseCloth(parsedSource, file);
    row.source_hash = createHash('sha256').update(source).digest('hex');
    assert.equal(row.before_branch.length + row.after_branch.length, 0);
    if (!weights.length) {
        assert.equal(row.before_weight.length, 1);
        assert.equal(row.before_weight[0][0], '"weight"');
        row.weight_attribute = row.before_weight[0][1];
    } else {
        assert.ok(row.before_weight.every(([key]) => key === '"long"'));
    }
    row.properties.unshift(...row.before_weight);
    return row;
}

export function buildBaseline() {
    const varieties = Object.entries(groups).flatMap(([id, paths]) => paths.map(path => {
        const file = 'd/' + path + '.c', source = original(file);
        assert.equal(readFileSync(resolve(root, file), 'utf8'), source, 'Original changed: ' + file);
        return { ...parseWrists(source, file), id, new_path: '/d/items/wrists/' + id, source };
    }));
    const refs = references(varieties);
    assert.equal(varieties.length, 6);
    assert.equal(refs.hits.length, 6);
    assert.equal(new Set(refs.hits.map(h => h.file)).size, 6);
    return { baseline, count: varieties.length, varieties, ...refs, excluded, dynamic_callers: dynamicCallers,
        unrelated_dynamic_callers: unrelatedCallers };
}

export function canonicalGroups() {
    const rows = readBaseline().varieties;
    const expression = value => tokens(value).map(t => t.text);
    const signature = r => JSON.stringify([expression(r.name[0]), expression(r.weight),
        r.properties.map(pair => pair.map(expression)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
    return Object.keys(groups).map(id => {
        assert.ok(validId(id), 'Invalid WRISTS ID: ' + id);
        const members = rows.filter(r => r.id === id);
        assert.equal(members.length, groups[id].length);
        assert.equal(new Set(members.map(signature)).size, 1, 'Non-equivalent group: ' + id);
        const aliases = r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(members.flatMap(aliases))];
        for (const r of members) {
            const initial = aliases(r)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/wrists/' + id, rows: members, representative: members[0], ids };
    });
}
export const migrationPaths = () => Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path]));
export function expectedCaller(file) {
    let source = original(file);
    for (const hit of readBaseline().hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(hit.start, hit.end), hit.expression);
        source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
    }
    if (dynamicCallers.includes(file)) {
        const branch = '    if (name == "weibo")';
        assert.equal(source.split(branch).length, 2);
        source = source.replace(branch, '    if (name == "huwan")\n        ob = new("/d/items/wrists/shaolin_huwan");\n'
            + '    else if (name == "weibo")');
    }
    return source;
}
// Keep earlier audits intact, admitting only this batch's exact caller edits.
export function afterWristsMigration(file, expected, semantic) {
    if (!dynamicCallers.includes(file) && !readBaseline().hits.some(h => h.file === file)) return expected;
    assert.deepEqual(semantic(original(file)), semantic(expected), 'Pre-WRISTS caller baseline changed: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions(selection) {
    return '// 护腕共用资产；固定属性只用 properties，历史路径仅用于离线迁移。\n'
        + 'private mapping wrists_definitions() {\n    return ([\n'
        + canonicalGroups().filter(g => !selection || selection.includes(g.id))
            .sort((a, b) => compareItemIds(a.id, b.id)).map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(id => JSON.stringify(id)).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n`
            + '            "properties": ({\n'
            + g.representative.properties.map(([k, v]) => `                ({ ${k}, ${v} })`).join(',\n')
            + '\n            }),\n        ])').join(',\n') + '\n    ]);\n}\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const saved = readBaseline();
    for (const row of saved.varieties) {
        const file = row.old_path.slice(1) + '.c', source = original(file);
        assert.equal(source, row.source);
        for (const [key, value] of Object.entries(parseWrists(source, file))) assert.deepEqual(row[key], value);
    }
    canonicalGroups();
    console.log(`WRISTS BASELINE PASS: ${saved.varieties.length} originals at ${baseline}, ${Object.keys(groups).length} groups`);
    if (process.argv.includes('--references')) console.log(JSON.stringify(references(saved.varieties), null, 2));
}
