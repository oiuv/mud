// Offline metadata and read-only audit; never imported by the game.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { root, parseCloth, tokens, references } from './cloth_inventory.mjs';
import { currentBaseline, renamedPaths, renameReferences, validId, compareItemIds } from './item_ids.mjs';

export { root };
export const baseline = '09e371bb';
export const original = file => execFileSync('git', ['show', `${baseline}:${file}`],
    { cwd: root, encoding: 'utf8', maxBuffer: 32e6 });
export const readBaseline = () => currentBaseline('boots', JSON.parse(readFileSync(resolve(root, 'tools/tests/boots/baseline.json'), 'utf8')));
export const groups = {
    zhanxue: ['beijing/npc/obj/feet'],
    caoxie: ['city/npc/obj/caoxie', 'city/obj/caoxie', 'jingzhou/obj/caoxie'],
    xiuhuaxie: ['city/npc/obj/flower_shoe', 'city/obj/flower_shoe', 'dali/npc/obj/shoes',
        'fuzhou/npc/flower_shoe', 'fuzhou/obj/flower_shoe', 'jingzhou/obj/flower_shoe',
        'quanzhou/obj/flower_shoe', 'yanziwu/npc/obj/flower_shoe'],
    pixue: ['city/npc/obj/pixue', 'city/obj/pixue', 'jingzhou/obj/pixue'],
    qilinxue: ['death/obj/qilinxue'],
    xiuhuaxie2: ['hengyang/npc/obj/female-shoe'],
    sengxie: ['mingjiao/obj/sengxie'],
    shaolin_sengxie: ['shaolin/obj/sengxie'],
};
export function parseBoots(source, file) {
    assert.equal(tokens(source)[1].text, 'BOOTS');
    // Same small initializer grammar; parsing does not change the saved source/hash.
    const row = parseCloth(source.replace(/inherit\s+BOOTS\s*;/, 'inherit CLOTH;'), file);
    row.source_hash = createHash('sha256').update(source).digest('hex');
    assert.equal(row.before_weight.length + row.before_branch.length + row.after_branch.length, 0);
    return row;
}
export function canonicalGroups() {
    const rows = readBaseline().varieties;
    const expression = text => tokens(text).map(t => t.text);
    const signature = r => JSON.stringify([expression(r.name[0]), expression(r.weight),
        r.properties.map(pair => pair.map(expression)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
    return Object.keys(groups).map(id => {
        assert.ok(validId(id), 'Invalid BOOTS ID: ' + id);
        const members = rows.filter(r => r.id === id);
        assert.equal(members.length, groups[id].length);
        assert.equal(new Set(members.map(signature)).size, 1, 'Non-equivalent group: ' + id);
        const aliases = r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(members.flatMap(aliases))];
        for (const r of members) {
            const initial = aliases(r)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/boots/' + id, rows: members, representative: members[0], ids };
    });
}
export const migrationPaths = () => ({ ...Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path])),
    ...renamedPaths('boots') });
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c', 'kungfu/class/shaolin/dao-xiang.c'];
export function expectedCaller(file) {
    let source = original(file);
    for (const hit of readBaseline().hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(hit.start, hit.end), hit.expression);
        source = source.slice(0, hit.start) + JSON.stringify(hit.new_path) + source.slice(hit.end);
    }
    if (file === 'd/death/npc/dizangwang.c') source = source.replace(/^#define QILIN_XUE[^\n]*\n/m, '');
    if (file === dynamicCallers[0]) source = source.replace('obj = new(__DIR__ "obj/" + arg);',
        'if (arg == "feet") obj = new("/d/items/boots/zhanxue"); else obj = new(__DIR__ "obj/" + arg);');
    if (file === dynamicCallers[1]) source = source.replace('ob = new("/d/shaolin/obj/" + name);',
        'if (name == "sengxie") ob = new("/d/items/boots/shaolin_sengxie"); else ob = new("/d/shaolin/obj/" + name);');
    return renameReferences(source);
}
export function renderDefinitions() {
    return '// 普通鞋靴共用资产；仅保存品种蓝图默认值，历史路径不参与运行。\n'
        + 'private mapping boots_definitions() {\n    return ([\n'
        + canonicalGroups().sort((a, b) => compareItemIds(a.id, b.id)).map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(id => JSON.stringify(id)).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "properties": ({\n`
            + g.representative.properties.map(([k, v]) => `                ({ ${k}, ${v} })`).join(',\n')
            + '\n            }),\n        ])').join(',\n') + '\n    ]);\n}\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const saved = readBaseline();
    for (const row of saved.varieties) {
        const source = original(row.old_path.slice(1) + '.c');
        assert.equal(source, row.source);
        for (const [key, value] of Object.entries(parseBoots(source, row.old_path.slice(1) + '.c')))
            assert.deepEqual(row[key], value);
    }
    canonicalGroups();
    console.log(`BOOTS BASELINE PASS: ${saved.varieties.length} originals at ${baseline}, ${Object.keys(groups).length} groups`);
    if (process.argv.includes('--references')) console.log(JSON.stringify(references(saved.varieties), null, 2));
}
