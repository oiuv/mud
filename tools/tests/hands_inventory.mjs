// Offline baseline and read-only audit; never imported by the running MUD.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { root, parseCloth, tokens, references } from './cloth_inventory.mjs';
import { validId, compareItemIds } from './item_ids.mjs';

export { root };
export const baseline = '0265d3615c4429fe0a718a3a09f8766306f35494';
export const original = file => execFileSync('git', ['show', `${baseline}:${file}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 32e6 });
export const readBaseline = () => JSON.parse(readFileSync(resolve(root, 'tools/tests/hands/baseline.json'), 'utf8'));
export const groups = {
    baijie: ['changan/npc/obj/baijie'],
    baojie: ['changan/npc/obj/baojie'],
    jinjie2: ['changan/npc/obj/jinjie'],
    zijin_jie: ['changan/npc/obj/ring'],
    yinjie: ['changan/npc/obj/yinjie'],
    zuanjie: ['changan/npc/obj/zuanjie'],
    jinjie: ['city/npc/obj/goldring', 'city/obj/goldring', 'yanziwu/npc/obj/goldring'],
    shoutao: ['city/npc/obj/shoutao', 'city/obj/shoutao', 'jingzhou/obj/shoutao'],
    tieshou: ['city/npc/obj/tieshou', 'city/obj/tieshou', 'jingzhou/obj/tieshou'],
    zhitao: ['city/npc/obj/zhitao', 'city/obj/zhitao'],
    zhitao2: ['jingzhou/obj/zhitao'],
    canxue_shoutao: ['death/sky/npc/obj/hands', 'sky/npc/obj/hands'],
    shoutao2: ['mingjiao/obj/shoutao'],
    tieshou2: ['mingjiao/obj/tieshou'],
    zhitao3: ['mingjiao/obj/zhitao'],
    shaolin_shoutao: ['shaolin/obj/shoutao'],
    shaolin_tieshou: ['shaolin/obj/tieshou'],
    shaolin_zhitao: ['shaolin/obj/zhitao'],
    panlong_gong: ['tulong/yitian/npc/obj/gong'],
    jinsi_shoutao: ['xiyu/obj/shoutao'],
};
export const excluded = ['d/luoyang/npc/obj/hand.c', 'd/luoyang/npc/obj/finger.c', 'd/lingxiao/obj/book-iron.c'];
export const dynamicCallers = ['d/xiangyang/npc/wuxiuwen.c', 'kungfu/class/shaolin/dao-xiang.c'];
export const unrelatedCallers = ['d/changan/npc/fujiang.c', 'kungfu/class/shaolin/dao-chen.c', 'd/xiyu/houdong.c'];

export function parseHands(source, file) {
    assert.equal(tokens(source)[1].text, 'HANDS');
    let parsedSource = source.replace(/inherit\s+HANDS\s*;/, 'inherit CLOTH;');
    const weights = [...source.matchAll(/set_weight\(([^;]+)\);/g)];
    assert.ok(weights.length <= 1, 'Literal weight setter: ' + file);
    // These six rings set a dbase property, not move.c's actual encumbrance.
    // Insert zero only in the parser input; keep the original source and hash.
    if (!weights.length) {
        assert.match(source, /set\("weight", (100|400)\);/);
        parsedSource = parsedSource.replace('if (clonep()', 'set_weight(0);\nif (clonep()');
    }
    const row = parseCloth(parsedSource, file);
    row.source_hash = createHash('sha256').update(source).digest('hex');
    assert.equal(row.before_branch.length + row.after_branch.length, 0);
    if (!weights.length) {
        assert.equal(row.before_weight.length, 1);
        assert.equal(row.before_weight[0][0], '"weight"');
        row.weight_attribute = row.before_weight[0][1];
        row.properties.unshift(...row.before_weight);
    } else assert.equal(row.before_weight.length, 0);
    return row;
}

export function buildBaseline() {
    const varieties = Object.entries(groups).flatMap(([id, paths]) => paths.map(path => {
        const file = 'd/' + path + '.c', source = original(file);
        assert.equal(readFileSync(resolve(root, file), 'utf8'), source, 'Original changed: ' + file);
        return { ...parseHands(source, file), id, new_path: '/d/items/hands/' + id, source };
    }));
    const refs = references(varieties);
    assert.equal(varieties.length, 28);
    assert.equal(refs.hits.length, 49);
    assert.equal(new Set(refs.hits.map(h => h.file)).size, 30);
    return { baseline, count: varieties.length, varieties, ...refs, excluded, dynamic_callers: dynamicCallers,
        unrelated_dynamic_callers: unrelatedCallers };
}

export function canonicalGroups() {
    const rows = readBaseline().varieties;
    const expression = value => tokens(value).map(t => t.text);
    const signature = r => JSON.stringify([expression(r.name[0]), expression(r.weight),
        r.properties.map(pair => pair.map(expression)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
    return Object.keys(groups).map(id => {
        assert.ok(validId(id), 'Invalid HANDS ID: ' + id);
        const members = rows.filter(r => r.id === id);
        assert.equal(members.length, groups[id].length);
        assert.equal(new Set(members.map(signature)).size, 1, 'Non-equivalent group: ' + id);
        const aliases = r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(members.flatMap(aliases))];
        for (const r of members) {
            const initial = aliases(r)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/hands/' + id, rows: members, representative: members[0], ids };
    });
}
export const migrationPaths = () => Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path]));
// Earlier audits retain their historical assertions, then admit only this batch's exact edits.
export function afterHandsMigration(file, expected, semantic) {
    if (!dynamicCallers.includes(file) && !readBaseline().hits.some(h => h.file === file)) return expected;
    assert.deepEqual(semantic(original(file)), semantic(expected), 'Pre-HANDS caller baseline changed: ' + file);
    return expectedCaller(file);
}
export function expectedCaller(file) {
    let source = original(file);
    for (const hit of readBaseline().hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(hit.start, hit.end), hit.expression);
        source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
    }
    if (dynamicCallers.includes(file)) {
        const assignment = '    ob = new("/d/shaolin/obj/" + name);';
        const branch = '    if (name == "shoutao")\n        ob = new("/d/items/hands/shaolin_shoutao");\n'
            + '    else if (name == "zhitao")\n        ob = new("/d/items/hands/shaolin_zhitao");\n';
        if (file === dynamicCallers[0]) source = source.replace(assignment, branch + '    else\n    ' + assignment);
        else source = source.replace('    if (name == "sengxie")', branch + '    else if (name == "sengxie")');
    }
    return source;
}
export function renderDefinitions(selection) {
    return '// 手部装备共用资产；固定属性只用 properties，历史路径仅用于离线迁移。\n'
        + 'private mapping hands_definitions() {\n    return ([\n'
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
        for (const [key, value] of Object.entries(parseHands(source, file))) assert.deepEqual(row[key], value);
    }
    canonicalGroups();
    console.log(`HANDS BASELINE PASS: ${saved.varieties.length} originals at ${baseline}, ${Object.keys(groups).length} groups`);
    if (process.argv.includes('--references')) console.log(JSON.stringify(references(saved.varieties), null, 2));
}
