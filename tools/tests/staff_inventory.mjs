// Ordinary STAFF inventory and offline migration metadata; never reads player data.
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
export const baseline = '32f587a5c46c10193ad3974069ce76e07b91a2a3';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/staff/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = [
    "d/baituo/obj/lingshezhang.c",
    "d/baituo/obj/shezhang.c",
    "d/city/obj/shuzhi.c",
    "d/foshan/obj/shuzhi.c",
    "d/hangzhou/obj/shuzhi.c",
    "d/kunming/npc/obj/yantong.c",
    "d/luoyang/npc/obj/staff1.c",
    "d/shaolin/obj/fumo-zhang.c"
];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c', 'd/changan/npc/fujiang.c', 'kungfu/class/shaolin/dao-chen.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseStaff(source, file) {
    const syntax = tokens(source);
    const inherited = syntax.flatMap((t, i) => t.text === 'inherit' ? [i] : []);
    assert.equal(inherited.length, 1, file + ': one STAFF parent');
    assert.equal(syntax[inherited[0] + 1].text, 'STAFF', file + ': STAFF parent');
    const normalized = source.replace(/\binherit\s+STAFF\s*;/, 'inherit BLADE;')
        .replace(/\binit_staff\b/g, 'init_blade');
    const row = parseBlade(normalized, file);
    assert.equal(row.flags, 0, file + ': this batch uses default STAFF LONG flags');
    return { ...row, source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = [
    "chanzhang",
    "gangzhang",
    "shawei_bang",
    "zhubang",
    "zhubang2",
    "panlong_zhang",
    "jiuhuang_zhang",
    "tianya_guai",
    "baxian_zhang",
    "qixing_zhang1",
    "qixing_zhang2",
    "qixing_zhang3",
    "qixing_zhang4",
    "laojun_zhang",
    "zhubang3",
    "biandan",
    "chaihe",
    "chuihuo_guan",
    "tiebian",
    "tiejiang",
    "shouzhang",
    "chanzhang2",
    "langyabang",
    "muzhang",
    "huoqiang",
    "gangzhang2",
    "jingtie_zhang",
    "mugun",
    "senggun",
    "kusang_bang",
    "tie_lingpai",
    "zhaohun_fan"
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
        return { id, path: '/d/items/staff/' + id, rows, representative: rows[0], ids };
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
        `    else if (arg == "staff")\n        obj = new("${paths['/d/beijing/npc/obj/staff']}");\n    else if (arg == "feet")`);
    if (file === dynamicCallers[1]) replace('    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();',
        `    else if (weapon_file == "gangzhang")\n        carry_object("${paths['/d/changan/npc/obj/gangzhang']}")->wield();\n    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();`);
    if (file === dynamicCallers[2]) replace('    else\n        ob = new("/d/shaolin/obj/" + name);',
        `    else if (name == "chanzhang")\n        ob = new("${paths['/d/shaolin/obj/chanzhang']}");\n    else\n        ob = new("/d/shaolin/obj/" + name);`);
    return source;
}
export function afterStaffMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected STAFF baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通杖类物品的蓝图属性；规范 ID 自然排序，伤害与标志由 init_staff 初始化。\n'
        + 'private mapping staff_definitions() {\n    return ([\n'
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
        const files = git('grep', '-l', '-e', 'inherit STAFF;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 45);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseStaff(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/staff/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 37); assert.equal(refs.hits.length, 49); assert.equal(refs.dynamic.length, 7);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/staff'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseStaff(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/staff_data.h'), renderDefinitions());
    console.log(`STAFF HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
