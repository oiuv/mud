// Ordinary HAMMER inventory and offline migration metadata; never reads player data.
import assert from 'node:assert/strict';
import { correctedItemText } from './item_text_corrections.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
import { parseBlade } from './blade_inventory.mjs';
export { root };
export const baseline = '9553790649746e0b8b21ef2b9dcf818fd839f242';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/hammer/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = [
    "d/changan/npc/obj/jitui.c",
    "d/chengdu/npc/obj/jitui.c",
    "d/city/npc/obj/jitui.c",
    "d/city/obj/jitui.c",
    "d/dali/npc/obj/yaoqin.c",
    "d/jingzhou/npc/obj/jitui.c",
    "d/jingzhou/obj/jitui.c",
    "d/kunming/npc/obj/jitui.c",
    "d/luoyang/npc/obj/hammer1.c",
    "d/quanzhen/npc/obj/jitui.c",
    "d/wudu/npc/obj/jitui.c",
    "d/wudu/obj/jitui.c",
    "d/xiakedao/npc/obj/jitui.c",
    "d/xiakedao/obj/backleg.c",
    "d/xiakedao/obj/forleg.c",
    "d/xiakedao/obj/zhutou.c",
    "d/zhongzhou/npc/obj/jitui.c"
];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseHammer(source, file) {
    const syntax = tokens(source);
    const inherited = syntax.flatMap((t, i) => t.text === 'inherit' ? [i] : []);
    assert.equal(inherited.length, 1, file + ': one HAMMER parent');
    assert.equal(syntax[inherited[0] + 1].text, 'HAMMER', file + ': HAMMER parent');
    const weights = syntax.flatMap((t, i) => t.text === 'set_weight' ? [i] : []);
    assert.ok(weights.length === 1 || weights.length === 2, file + ': one weight or consecutive constant overwrite');
    const writes = weights.map(i => {
        assert.deepEqual(syntax.slice(i + 1, i + 5).map(t => t.text),
            ['(', syntax[i + 2].text, ')', ';'], file + ': constant weight call');
        assert.ok(/^\d+$/.test(syntax[i + 2].text), file + ': constant weight');
        return Number(syntax[i + 2].text);
    });
    let normalized = source;
    if (weights.length === 2) {
        assert.equal(weights[1], weights[0] + 5, file + ': no behavior between weight writes');
        normalized = source.slice(0, syntax[weights[0]].start) + source.slice(syntax[weights[0] + 4].end);
    }
    normalized = normalized.replace(/\binherit\s+HAMMER\s*;/, 'inherit BLADE;')
        .replace(/\binit_hammer\b/g, 'init_blade');
    const row = parseBlade(normalized, file);
    assert.equal(row.flags, 0, file + ': this batch preserves default HAMMER flags');
    return { ...row, weight_writes: writes, source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = [
    "tiechui",
    "tiechui2",
    "tiechui3",
    "gutou",
    "shitou",
    "jiasuo",
    "tianluo_chui",
    "dingyao_chui",
    "qixing_chui1",
    "qixing_chui2",
    "qixing_chui3",
    "poyu_chui",
    "shikuai",
    "tiepipa",
    "tongren",
    "kaishan_fu",
    "leizhen_dang",
    "tongchui",
    "shitou2",
    "jinhuoqiang",
    "tieqipan",
    "shigu",
    "muyu_chui",
    "yufu",
    "xigua",
    "shitou3",
    "tongbo",
    "tiechui4",
    "hongtiechui",
    "muyu_chui2",
    "shitou4",
    "datiechui",
    "chutou",
    "shuipiao",
    "saozhou",
    "yaochu",
    "falun",
    "gangchu",
    "jinlun",
    "yinlun"
];
const signature = row => JSON.stringify([semantic(row.name[0]), row.weight, row.damage, row.flags,
    row.properties.map(pair => pair.map(semantic)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
export function canonicalGroups(data = readBaseline()) {
    const groups = new Map();
    for (const row of data.varieties) {
        assert.ok(validId(row.id), row.id);
        if (!groups.has(row.id)) groups.set(row.id, []);
        groups.get(row.id).push(row);
    }
    return [...groups].sort(([a], [b]) => compareItemIds(a, b)).map(([id, rows]) => {
        const aliases = row => tokens(row.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(rows.flatMap(aliases))];
        for (const row of rows) {
            const first = aliases(row)[0][0].toLowerCase();
            if (first !== ids[0][0].toLowerCase() && !ids.includes(first)) ids.push(first);
        }
        return { id, path: '/d/items/hammer/' + id, rows, representative: rows[0], ids };
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
    const paths = migrationPaths();
    const replace = (before, after) => {
        assert.equal(source.split(before).length, 2, file + ': exact dynamic branch');
        source = source.replace(before, after);
    };
    if (file === dynamicCallers[0]) replace('    else if (arg == "feet")',
        `    else if (arg == "hammer")\n        obj = new("${paths['/d/beijing/npc/obj/hammer']}");\n    else if (arg == "feet")`);
    return source;
}
export function afterHammerMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected HAMMER baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通锤类物品的蓝图属性；规范 ID 自然排序，伤害与标志由 init_hammer 初始化。\n'
        + 'private mapping hammer_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "damage": ${g.representative.damage},\n`
            + (g.representative.flags ? `            "flags": ${g.representative.flags},\n` : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${correctedItemText(key, value)} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-e', 'inherit HAMMER;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 60);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseHammer(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/hammer/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 43); assert.equal(refs.hits.length, 55); assert.equal(refs.dynamic.length, 6);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/hammer'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    const data = readBaseline();
    if (process.argv.includes('--observations')) {
        assert.ok(!data.observations, 'Do not overwrite frozen driver observations');
        const file = process.argv[process.argv.indexOf('--observations') + 1];
        const observations = JSON.parse(readFileSync(file, 'utf8'));
        assert.equal(observations.length, data.count);
        data.observations = observations;
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c';
        assert.equal(original(file), row.source);
        for (const [key, value] of Object.entries(parseHammer(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/hammer_data.h'), renderDefinitions());
    console.log(`HAMMER HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
