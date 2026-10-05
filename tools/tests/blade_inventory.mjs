// Ordinary BLADE inventory and offline migration metadata; never reads player data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = 'b5e94cd0550cf3c44911457ae5715b9ba4cb6172';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/blade/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = ['d/death/npc/obj/blade1.c', 'd/luoyang/npc/obj/blade1.c',
    'd/death/sky/npc/obj/jingzhongyue.c', 'd/sky/npc/obj/jingzhongyue.c',
    'd/jingzhou/obj/xblade.c', 'd/tulong/obj/tulongdao.c'];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c', 'd/changan/npc/fujiang.c', 'kungfu/class/shaolin/dao-chen.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseBlade(source, file) {
    const syntax = tokens(source);
    const setups = syntax.flatMap((t, i) => t.text === 'setup' ? [i] : []);
    assert.equal(setups.length, 1, file + ': exactly one setup');
    assert.deepEqual(syntax.slice(setups[0] + 1, setups[0] + 4).map(t => t.text),
        ['(', ')', ';'], file + ': setup takes no arguments');
    const calls = [...source.matchAll(/\binit_blade\s*\(\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)\s*;/g)];
    assert.equal(calls.length, 1, file + ': exactly one constant init_blade');
    const call = calls[0];
    const prior = tokens(source.slice(0, call.index));
    assert.equal(prior.at(-1).text, '}', file + ': init_blade immediately after default/property branch');
    const normalized = source.replace(/\binherit\s+BLADE\s*;/, 'inherit CLOTH;').replace(call[0], '');
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
    return { ...row, damage: Number(call[1]), flags: Number(call[2] || 0), source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = [
    'chaidao', 'dadao', 'gangdao', 'gangdao2', 'duandao', 'dadao2', 'dandao', 'zijin_dao',
    'gangdao3', 'gangdao4', 'gangdao5', 'kandao', 'mandao', 'queyue_ren', 'chanyi_dao',
    'qiwang_dao', 'fenghuang_jue', 'yingdao', 'qinglong_ya', 'qingdiao_yuzhuo', 'wugui_ren',
    'qisha_ren', 'jinyang_dao', 'bihai_jue', 'qing_tianyu1', 'qing_tianyu2', 'qing_tianyu3',
    'xuanjin_zhan1', 'xuanjin_zhan2', 'xuanjin_zhan3', 'qiankun_dao1', 'qiankun_dao2',
    'dizang_zhan', 'caidao', 'chuangwang_dao', 'lengyue_dao', 'jiandao', 'dadao3',
    'gangdao6', 'caidao2', 'jiedao', 'mutang', 'wodao', 'jiedao2', 'mudao', 'wandao',
    'yudao', 'duan_tulong', 'chaidao2', 'juzi', 'mudao2', 'gangdao7',
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
        return { id, path: '/d/items/blade/' + id, rows, representative: rows[0], ids };
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
        `    else if (arg == "blade")\n        obj = new("${paths['/d/beijing/npc/obj/blade']}");\n    else if (arg == "feet")`);
    if (file === dynamicCallers[1]) replace('    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();',
        `    else if (weapon_file == "gangdao")\n        carry_object("${paths['/d/changan/npc/obj/gangdao']}")->wield();\n    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();`);
    if (file === dynamicCallers[2]) replace('    else\n        ob = new("/d/shaolin/obj/" + name);',
        `    else if (name == "jiedao")\n        ob = new("${paths['/d/shaolin/obj/jiedao']}");\n    else\n        ob = new("/d/shaolin/obj/" + name);`);
    return source;
}
export function afterBladeMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected BLADE baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通刀的蓝图属性；规范 ID 自然排序，伤害与标志由 init_blade 初始化。\n'
        + 'private mapping blade_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "damage": ${g.representative.damage},\n`
            + (g.representative.flags ? `            "flags": ${g.representative.flags},\n` : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${value} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-e', 'inherit BLADE;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 67);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseBlade(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/blade/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 61); assert.equal(refs.hits.length, 102); assert.equal(refs.dynamic.length, 7);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/blade'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseBlade(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/blade_data.h'), renderDefinitions());
    console.log(`BLADE HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
