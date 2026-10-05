// Ordinary SWORD inventory and offline migration metadata; never reads player data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = '3c572f18a9731787a6e91caab69d1a5939963521';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/sword/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = ['d/death/obj/wujian.c', 'd/jinshe/obj/jinshe-jian.c',
    'd/luoyang/npc/obj/sword1.c', 'd/meizhuang/obj/qin.c', 'd/tiezhang/obj/ycj.c',
    'd/tulong/obj/yitianjian.c', 'd/tulong/tulong/obj/ling1.c'];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c', 'd/changan/npc/fujiang.c', 'kungfu/class/shaolin/dao-chen.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseSword(source, file) {
    const calls = [...source.matchAll(/\binit_sword\s*\(\s*(\d+)\s*\)\s*;/g)];
    assert.equal(calls.length, 1, file + ': exactly one constant init_sword');
    const call = calls[0];
    const prior = tokens(source.slice(0, call.index));
    assert.equal(prior.at(-1).text, '}', file + ': init_sword immediately after default/property branch');
    const normalized = source.replace(/\binherit\s+SWORD\s*;/, 'inherit CLOTH;').replace(call[0], '');
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch], [[], []], file + ': extra behavior');
    assert.ok(/^\d+$/.test(row.weight), file + ': constant weight');
    assert.ok(row.after_branch.every(([key]) => ['"wield_msg"', '"unwield_msg"'].includes(key)), file + ': fixed messages only');
    row.properties.push(...row.after_branch);
    for (const expression of [...row.name, ...row.properties.flat()]) {
        const parts = tokens(expression);
        assert.ok(!parts.some((part, i) => /^[A-Za-z_]\w*$/.test(part.text) && parts[i + 1]?.text === '('),
            file + ': runtime expressions are not data');
    }
    return { ...row, damage: Number(call[1]), source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = [
    'changjian', 'changjian2', 'gangjian', 'bintie_jian', 'guanfu_jian', 'dongchang_jian',
    'changjian3', 'changjian4', 'changjian5', 'duanjian', 'gangjian2', 'tiedi',
    'tianzun_jian', 'xuanyuan_jian', 'cangqiong_jian', 'guilong', 'taia', 'qilinjin1',
    'qilinjin2', 'qilinjin3', 'longhuang_jian', 'fenghuang_qin', 'yanyang_chi', 'liangtian_chi',
    'panlong_jian', 'qingsha_jian', 'tianyue_jian', 'qiyun_jian', 'gusong_jian', 'wuyang_jian',
    'huanglong_jian', 'wugou_jian', 'guxing_jian', 'chijian', 'xuanchi_jian', 'ruanjian',
    'zhujian1', 'xiuhua_zhen', 'duanjian2', 'mujian1', 'bishui_jian', 'longquan_jian',
    'gangjian3', 'changjian6', 'duanjian3', 'jindi', 'changjian7', 'ganjiang', 'moye',
    'nanhai_shenmu', 'xiuhua_zhen2', 'zhujian2', 'duanjian4', 'yujian', 'taomu_jian',
    'duan_yitian', 'bintie_ling', 'yitian_jian', 'youlong_jian', 'zhujian3', 'tiegan',
    'ganggou', 'hanyandai', 'wudu_jian', 'huoba', 'jinwu_gou', 'mujian2', 'baihong_jian',
    'mujian3', 'changjian8',
];
const signature = row => JSON.stringify([semantic(row.name[0]), row.weight, row.damage,
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
        return { id, path: '/d/items/sword/' + id, rows, representative: rows[0], ids };
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
    if (file === dynamicCallers[0]) replace('    if (arg == "feet")',
        `    if (arg == "sword")\n        obj = new("${paths['/d/beijing/npc/obj/sword']}");\n    else if (arg == "feet")`);
    if (file === dynamicCallers[1]) replace('    carry_object(__DIR__ "obj/" + weapon_file)->wield();',
        `    if (weapon_file == "changjian")\n        carry_object("${paths['/d/changan/npc/obj/changjian']}")->wield();\n    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();`);
    if (file === dynamicCallers[2]) replace('    ob = new("/d/shaolin/obj/" + name);',
        `    if (name == "changjian")\n        ob = new("${paths['/d/shaolin/obj/changjian']}");\n    else\n        ob = new("/d/shaolin/obj/" + name);`);
    return source;
}
export function afterSwordMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected SWORD baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通剑的蓝图属性；规范 ID 自然排序，伤害由 init_sword 初始化。\n'
        + 'private mapping sword_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "damage": ${g.representative.damage},\n            "properties": ({\n`
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${value} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-e', 'inherit SWORD;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 92);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseSword(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/sword/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 85); assert.equal(refs.hits.length, 134); assert.equal(refs.dynamic.length, 8);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/sword'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseSword(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/sword_data.h'), renderDefinitions());
    console.log(`SWORD HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
