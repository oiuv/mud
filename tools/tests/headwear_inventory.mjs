// Offline baseline and read-only audit. Never imported by the running MUD.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { root, parseCloth, tokens, references } from './cloth_inventory.mjs';
import { currentBaseline, renamedPaths, renameReferences, validId, compareItemIds } from './item_ids.mjs';

export { root };
export const baseline = 'b081c7ffd4febbeaff6b13595e306e29ea0b84b6';
export const original = file => execFileSync('git', ['show', `${baseline}:${file}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 32e6 });
export const readBaseline = () => currentBaseline('headwear', JSON.parse(readFileSync(resolve(root, 'tools/tests/headwear/baseline.json'), 'utf8')));
export const groups = {
    maozi: ['beijing/npc/obj/hat'],
    gangkui: ['beijing/npc/obj/head', 'beijing/npc/obj/helmet'],
    bai_chahua: ['changan/npc/obj/bai-chahua'],
    hei_mudan: ['changan/npc/obj/hei-mudan'],
    hong_meigui: ['changan/npc/obj/hmeigui'],
    hong_meigui2: ['changan/npc/obj/hong-meigui'],
    huang_meigui2: ['changan/npc/obj/huang-meigui'],
    lan_tiane: ['changan/npc/obj/lan-tiane'],
    zi_luolan: ['changan/npc/obj/zi-luolan'],
    tie_toukui: ['city/npc/obj/toukui', 'city/obj/toukui', 'jingzhou/obj/toukui'],
    hong_meigui3: ['city/obj/rrose'],
    huang_meigui: ['city/obj/yrose'],
    taiyi_toujin: ['dali/npc/obj/ttoujin'],
    chahua1: ['dali/obj/chahua1'],
    chahua2: ['dali/obj/chahua2'],
    chahua3: ['dali/obj/chahua3'],
    chahua4: ['dali/obj/chahua4'],
    chahua5: ['dali/obj/chahua5'],
    chahua6: ['dali/obj/chahua6'],
    chahua7: ['dali/obj/chahua7'],
    chahua8: ['dali/obj/chahua8'],
    chahua9: ['dali/obj/chahua9'],
    chahua10: ['dali/obj/chahua10'],
    chahua11: ['dali/obj/chahua11'],
    chahua12: ['dali/obj/chahua12'],
    chahua13: ['dali/obj/chahua13'],
    baihe_hua: ['foshan/obj/hua1'],
    shaluo_hua: ['foshan/obj/hua2'],
    huilan_hua: ['foshan/obj/hua3'],
    cuiyu: ['hangzhou/honghua/obj/cuiyu'],
    zitan_fochuan: ['kaifeng/npc/obj/fozhu'],
    toukui: ['mingjiao/obj/toukui'],
    shaolin_toukui: ['shaolin/obj/toukui'],
    jindai: ['taohua/obj/jindai'],
    jindai2: ['taohua/obj/shudai'],
    zangseng_mao: ['xueshan/obj/sengmao'],
};
export const excluded = ['d/death/npc/obj/armor2.c', 'd/luoyang/npc/obj/head1.c'];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c'];
export const unrelatedCallers = ['d/changan/npc/fujiang.c', 'd/xiangyang/npc/wuxiuwen.c',
    'kungfu/class/shaolin/dao-chen.c', 'kungfu/class/shaolin/dao-xiang.c'];

export function parseHeadwear(source, file) {
    assert.equal(tokens(source)[1].text, 'HEAD');
    const weights = [...source.matchAll(/set_weight\(([^;]+)\);/g)];
    assert.equal(weights.length, 1, 'One literal weight setter: ' + file);
    const weight = weights[0];
    const blueprintOnly = weight.index > source.indexOf('if (clonep()');
    let parsedSource = source.replace(/inherit\s+HEAD\s*;/, 'inherit CLOTH;');
    if (blueprintOnly) {
        assert.match(source, /if \(clonep\(\)\)[\s\S]+else\s*\{/);
        parsedSource = parsedSource.replace(weight[0], '').replace('if (clonep()', weight[0] + '\nif (clonep()');
    }
    // Move only the recognized setter for parsing. Preserve its original scope and source/hash.
    const row = parseCloth(parsedSource, file);
    row.source_hash = createHash('sha256').update(source).digest('hex');
    row.weight_scope = blueprintOnly ? 'blueprint' : 'both';
    assert.equal(row.before_weight.length + row.before_branch.length + row.after_branch.length, 0);
    return row;
}

export function buildBaseline() {
    const varieties = Object.entries(groups).flatMap(([id, paths]) => paths.map(path => {
        const file = 'd/' + path + '.c', source = original(file);
        assert.equal(readFileSync(resolve(root, file), 'utf8'), source, 'Original changed: ' + file);
        return { ...parseHeadwear(source, file), id, new_path: '/d/items/headwear/' + id, source };
    }));
    const refs = references(varieties);
    assert.equal(varieties.length, 39);
    assert.equal(refs.hits.length, 45);
    assert.equal(new Set(refs.hits.map(h => h.file)).size, 29);
    return { baseline, count: varieties.length, varieties, ...refs, excluded, dynamic_callers: dynamicCallers,
        unrelated_dynamic_callers: unrelatedCallers };
}

export function canonicalGroups() {
    const rows = readBaseline().varieties;
    const expression = value => tokens(value).map(t => t.text);
    const signature = r => JSON.stringify([expression(r.name[0]), expression(r.weight), r.weight_scope,
        r.properties.map(pair => pair.map(expression)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
    return Object.keys(groups).map(id => {
        assert.ok(validId(id), 'Invalid HEAD ID: ' + id);
        const members = rows.filter(r => r.id === id);
        assert.equal(members.length, groups[id].length);
        assert.equal(new Set(members.map(signature)).size, 1, 'Non-equivalent group: ' + id);
        const aliases = r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(members.flatMap(aliases))];
        for (const r of members) {
            const initial = aliases(r)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/headwear/' + id, rows: members, representative: members[0], ids };
    });
}
export const migrationPaths = () => ({ ...Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path])),
    ...renamedPaths('headwear') });
export function expectedCaller(file) {
    let source = original(file);
    for (const hit of readBaseline().hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(hit.start, hit.end), hit.expression);
        source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
    }
    if (file === dynamicCallers[0]) source = source.replace('else\n        obj = new(__DIR__ "obj/" + arg);',
        'else if (arg == "helmet")\n        obj = new("/d/items/headwear/gangkui");\n    else\n        obj = new(__DIR__ "obj/" + arg);');
    return renameReferences(source);
}
export function renderDefinitions(selection) {
    return '// 普通头饰共用资产；固定属性只用 properties，历史路径仅用于离线迁移。\n'
        + 'private mapping headwear_definitions() {\n    return ([\n'
        + canonicalGroups().filter(g => !selection || selection.includes(g.id))
            .sort((a, b) => compareItemIds(a.id, b.id)).map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(id => JSON.stringify(id)).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n`
            + (g.representative.weight_scope === 'blueprint' ? '            "clone_weight": 0,\n' : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([k, v]) => `                ({ ${k}, ${v} })`).join(',\n')
            + '\n            }),\n        ])').join(',\n') + '\n    ]);\n}\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const saved = readBaseline();
    for (const row of saved.varieties) {
        const file = row.old_path.slice(1) + '.c', source = original(file);
        assert.equal(source, row.source);
        for (const [key, value] of Object.entries(parseHeadwear(source, file))) assert.deepEqual(row[key], value);
    }
    canonicalGroups();
    console.log(`HEADWEAR BASELINE PASS: ${saved.varieties.length} originals at ${baseline}, ${Object.keys(groups).length} groups`);
    if (process.argv.includes('--references')) console.log(JSON.stringify(references(saved.varieties), null, 2));
}
