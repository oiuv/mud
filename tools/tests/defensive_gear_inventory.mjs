// Fixed ARMOR/WAIST/SURCOAT/SHIELD definitions; no live records are read.
import assert from 'node:assert/strict';
import { afterWeaponNormalization } from './weapon_classification/migration_expectations.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, parseCloth, tokens, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = '487c98daa21c94bf87c732dd08c3a78123cd6685';
export const original = file => execFileSync('git', ['show', `${baseline}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
const savedFile = resolve(root, 'tools/tests/defensive_gear/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const families = ['armor', 'waist', 'surcoat', 'shield'];
export const groups = {
    armor: {
        tiejia: ['beijing/npc/obj/body'], jinhuan_jia: ['death/obj/armor1'],
        pangu_kai: ['death/sky/npc/obj/pangukai', 'sky/npc/obj/pangukai'],
        ruanwei_jia: ['taohua/obj/ruanwei'], pi_beixin: ['zhongzhou/npc/obj/beixin'],
    },
    waist: {
        huyao: ['city/npc/obj/huyao', 'city/obj/huyao', 'jingzhou/obj/huyao'],
        tie_huyao: ['mingjiao/obj/huyao'], shaolin_huyao: ['shaolin/obj/huyao'],
    },
    surcoat: { dudai: ['city/npc/obj/surcoat', 'city/obj/surcoat', 'jingzhou/obj/surcoat'] },
    shield: { niupi_dun: ['changan/npc/obj/shield', 'city/npc/obj/shield', 'city/obj/shield', 'jingzhou/obj/shield'] },
};
export const excluded = ['d/death/npc/obj/armor1.c', 'd/emei/obj/yaodai.c', 'd/mingjiao/obj/yaodai.c',
    'd/shaolin/obj/yaodai.c', 'd/wudu/obj/zhulou.c', 'd/wudu/obj/zhulou2.c', 'clone/cloth/yaodai.c',
    'clone/lonely/baojia.c', 'clone/lonely/jiasha.c', 'clone/lonely/sheying.c', 'clone/weapon/jsbaojia.c'];
export const preserved = [...excluded, ...families.map(f => 'inherit/armor/' + f + '.c'),
    'inherit/misc/equip.c', 'adm/daemons/itemd.c', 'feature/dealer.c', 'inherit/char/npc.c', 'd/changan/npc/fujiang.c'];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c', 'd/xiangyang/npc/wuxiuwen.c',
    'kungfu/class/shaolin/dao-xiang.c', 'kungfu/class/shaolin/dao-chen.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
export function parseArmor(source, file) {
    const syntax = tokens(source);
    assert.equal(syntax.filter(t => t.text === 'inherit').length, 1, 'one armor parent');
    const family = syntax[1]?.text.toLowerCase();
    assert.ok(families.includes(family), 'approved armor parent');
    const row = parseCloth(source.replace(new RegExp('inherit\\s+' + family.toUpperCase() + '\\s*;'), 'inherit CLOTH;'), file);
    assert.match(row.weight, /^\d+$/, 'literal weight');
    assert.equal(row.before_branch.length + row.after_branch.length, 0, 'blueprint-only properties');
    assert.ok(row.before_weight.every(([key]) => key === '"long"'), 'only fixed long before weight');
    row.properties.unshift(...row.before_weight);
    return { ...row, family, source_hash: hash(source) };
}
export function canonicalGroups(data = readBaseline()) {
    return families.flatMap(family => Object.keys(groups[family]).sort(compareItemIds).map(id => {
        assert.ok(validId(id));
        const rows = data.varieties.filter(r => r.family === family && r.id === id);
        assert.equal(rows.length, groups[family][id].length);
        const signature = r => JSON.stringify([r.family, tokens(r.name[0]).map(t => t.text), r.weight,
            r.properties.map(pair => pair.map(v => tokens(v).map(t => t.text))).sort()]);
        assert.equal(new Set(rows.map(signature)).size, 1, 'Non-equivalent group ' + id);
        const aliases = r => tokens(r.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(rows.flatMap(aliases))];
        for (const r of rows) {
            const initial = aliases(r)[0][0].toLowerCase();
            if (initial !== ids[0][0].toLowerCase() && !ids.includes(initial)) ids.push(initial);
        }
        return { id, path: '/d/items/' + family + '/' + id, rows, representative: rows[0], ids };
    }));
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
    if (dynamicCallers.includes(file)) {
        const qian = file === dynamicCallers[0], chen = file === dynamicCallers[3];
        const before = qian ? '    else\n        obj = new(__DIR__ "obj/" + arg);' : chen
            ? '    else\n        ob = new("/d/shaolin/obj/" + name);' : '    if (name == "huwan")';
        const branch = qian ? '    else if (arg == "body")\n        obj = new("/d/items/armor/tiejia");\n' : chen
            ? '    else if (name == "huyao")\n        ob = new("/d/items/waist/shaolin_huyao");\n'
            : '    if (name == "huyao")\n        ob = new("/d/items/waist/shaolin_huyao");\n    else if (name == "huwan")';
        assert.equal(source.split(before).length, 2, 'Exact dynamic branch: ' + file);
        source = source.replace(before, qian || chen ? branch + before : branch);
    }
    return source;
}
export function afterDefensiveMigration(file, expected, compare) {
    const data = readBaseline();
    if (data.callers[file]) {
        assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected defensive overlap: ' + file);
        expected = expectedCaller(file);
    }
    return afterWeaponNormalization(file, expected);
}
export function correctedText(id, key, value) {
    if (id === 'pangu_kai' && key === '"unit"') return value.replace('"见"', '"件"');
    if (id === 'pangu_kai' && key === '"long"') return value.replace('一见黑黝黝', '一件黑黝黝');
    return value;
}
export function renderDefinitions(family) {
    return '// 普通防具的蓝图属性；按规范 ID 自然排序。\nprivate mapping ' + family + '_definitions() {\n    return ([\n'
        + canonicalGroups().filter(g => g.representative.family === family).map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n            "weight": ${g.representative.weight},\n`
            + '            "properties": ({\n' + g.representative.properties.map(([k, v]) => `                ({ ${k}, ${correctedText(g.id, k, v)} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Never overwrite frozen source');
        const varieties = families.flatMap(family => Object.entries(groups[family]).flatMap(([id, paths]) => paths.map(path => {
            const file = 'd/' + path + '.c', source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file);
            const row = parseArmor(source, file); assert.equal(row.family, family);
            return { ...row, id, new_path: '/d/items/' + family + '/' + id, source };
        })));
        const refs = references(varieties);
        assert.equal(varieties.length, 18); assert.equal(refs.hits.length, 17); assert.equal(refs.dynamic.length, 5);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])].sort().map(file => [file, original(file)]));
        const data = { baseline, count: 18, varieties, ...refs, callers,
            excluded: preserved.map(file => ({ file, source_hash: hash(original(file)) })) };
        canonicalGroups(data);
        mkdirSync(resolve(root, 'tools/tests/defensive_gear'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    const data = readBaseline();
    if (process.argv.includes('--observations')) {
        assert.ok(!data.observations, 'Never overwrite frozen observations');
        const observations = JSON.parse(readFileSync(process.argv[process.argv.indexOf('--observations') + 1], 'utf8'));
        assert.equal(observations.length, data.count);
        data.observations = observations; writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c'; assert.equal(original(file), row.source);
        for (const [k, v] of Object.entries(parseArmor(row.source, file))) assert.deepEqual(row[k], v, file + ': ' + k);
    }
    console.log(`DEFENSIVE_GEAR HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties`);
}
