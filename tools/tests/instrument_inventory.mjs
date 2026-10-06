import { afterWeaponMigration } from './axe_fork_pin_inventory.mjs';
// Ordinary ITEM musical instruments. Only repository sources and explicit test artifacts.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = 'aab4cff1e5b17ecadd0eb36ffd3581d6a7995ec8';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/instrument/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);
export const entries = {
    "d/baituo/obj/tiezheng.c": [
        "zheng",
        "tiezheng"
    ],
    "d/baituo/obj/zheng.c": [
        "zheng",
        "guzheng"
    ],
    "d/changan/npc/obj/muqin.c": [
        "qin",
        "muqin"
    ],
    "d/hengyang/npc/obj/huqin.c": [
        "qin",
        "huqin"
    ],
    "d/hengyang/npc/obj/tanmuqin.c": [
        "qin",
        "tanmuqin"
    ],
    "d/hengyang/npc/obj/zhuxiao.c": [
        "xiao",
        "zhuxiao"
    ],
    "d/hengyang/yueqi/honghuqin.c": [
        "qin",
        "honghuqin"
    ],
    "d/hengyang/yueqi/huqin.c": [
        "qin",
        "huqin2"
    ],
    "d/hengyang/yueqi/jiaoyeqin.c": [
        "qin",
        "jiaoyeqin"
    ],
    "d/hengyang/yueqi/jiuxiaoqin.c": [
        "qin",
        "jiuxiaoqin"
    ],
    "d/hengyang/yueqi/qin-jimo.c": [
        "qin",
        "jimo_qin"
    ],
    "d/hengyang/yueqi/qin-jueyin.c": [
        "qin",
        "jueyin_qin"
    ],
    "d/hengyang/yueqi/qin-konggu.c": [
        "qin",
        "konggu_qin"
    ],
    "d/hengyang/yueqi/qin-tianlai.c": [
        "qin",
        "tianlai_qin"
    ],
    "d/hengyang/yueqi/shixuanqin-zhanguo.c": [
        "qin",
        "shixuanqin"
    ],
    "d/hengyang/yueqi/tanhuqin.c": [
        "qin",
        "tanhuqin"
    ],
    "d/hengyang/yueqi/zhongnishi.c": [
        "qin",
        "zhongniqin"
    ],
    "d/hengyang/yueqi/zhuxiao-liuquan.c": [
        "xiao",
        "liuquan_xiao"
    ],
    "d/hengyang/yueqi/zhuxiao-qingyin.c": [
        "xiao",
        "qingyin_xiao"
    ],
    "d/hengyang/yueqi/zhuxiao-shuiyun.c": [
        "xiao",
        "shuiyun_xiao"
    ],
    "d/hengyang/yueqi/zhuxiao-youlan.c": [
        "xiao",
        "youlan_xiao"
    ],
    "d/hengyang/yueqi/zhuxiao.c": [
        "xiao",
        "zhuxiao2"
    ],
    "d/kunlun/obj/jwqin.c": [
        "qin",
        "jiaoweiqin"
    ],
    "d/taohua/obj/zhuxiao.c": [
        "xiao",
        "zhuxiao3"
    ]
};
export const retained = ['d/dali/npc/obj/yaoqin.c', 'd/meizhuang/obj/qin.c',
    'd/taohua/obj/yuxiao.c', 'clone/lonely/tieqin.c', 'clone/lonely/yaoqin.c',
    'clone/lonely/dongxiao.c', 'clone/lonely/yuxiao.c'];
export const negatives = ['d/kunlun/obj/guzheng.c', 'd/xiyu/obj/tongbo.c',
    'd/xiyu/obj/tonggu.c', 'd/xiyu/obj/tonghao.c'];
export const preserved = [...retained, ...negatives, 'd/changan/npc/fujiang.c',
    'include/music.h', 'inherit/misc/_qin.c', 'inherit/misc/_xiao.c', 'inherit/misc/_zheng.c',
    'inherit/weapon/xsword.c', 'kungfu/skill/tanqin-jifa.c',
    'kungfu/skill/chuixiao-jifa.c', 'kungfu/skill/guzheng-jifa.c'];
export const families = ['qin', 'xiao', 'zheng'];

export function parseInstrument(source, file) {
    const t = tokens(source), parents = t.flatMap((v, i) => v.text === 'inherit' ? [t[i + 1].text] : []);
    assert.equal(parents.length, 2, file + ': exactly two parents');
    assert.equal(parents[0], 'ITEM', file + ': ITEM parent');
    assert.match(parents[1], /^MI_(QIN|XIAO|ZHENG)$/, file + ': music parent');
    const family = parents[1].slice(3).toLowerCase();
    const init = source.match(/void\s+init\s*\(\s*\)\s*\{[^{}]*\}\s*$/);
    assert.ok(init, file + ': trailing init');
    assert.deepEqual(semantic(init[0]), semantic(`void init() { add_action("play_${family}", "play"); }`),
        file + ': unchanged action registration');
    const normalized = source.slice(0, init.index).replace(/\binherit\s+ITEM\s*;/, 'inherit CLOTH;')
        .replace(/\binherit\s+MI_(QIN|XIAO|ZHENG)\s*;/, '');
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch, row.after_branch], [[], [], []],
        file + ': fixed blueprint properties only');
    assert.match(row.weight, /^\d+$/);
    return { ...row, family, source_hash: hash(source) };
}
const signature = row => JSON.stringify([row.family, semantic(row.name[0]), row.weight,
    [...new Map(row.properties)].map(p => p.map(semantic)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
export function canonicalGroups(data = readBaseline()) {
    const groups = new Map();
    for (const row of data.varieties) {
        assert.ok(validId(row.id), row.id);
        const path = '/d/items/' + row.family + '/' + row.id;
        assert.equal(path, row.new_path);
        if (!groups.has(path)) groups.set(path, []);
        groups.get(path).push(row);
    }
    const signatures = new Set();
    return [...groups].sort(([a], [b]) => compareItemIds(a, b)).map(([path, rows]) => {
        const r = rows[0], sig = signature(r);
        assert.ok(!signatures.has(sig), path + ': duplicate equivalent definition');
        signatures.add(sig);
        for (const row of rows) assert.equal(signature(row), sig, path + ': equivalent grouping');
        const ids = [...new Set(rows.flatMap(row => tokens(row.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text))))];
        return { id: r.id, family: r.family, path, rows, representative: r, ids };
    });
}
export const migrationPaths = () => Object.fromEntries(readBaseline().varieties.map(r => [r.old_path, r.new_path]));
export function expectedCaller(file) {
    const data = readBaseline();
    let source = data.callers[file];
    assert.equal(typeof source, 'string', file);
    for (const h of data.hits.filter(h => h.file === file).sort((a, b) => b.start - a.start)) {
        assert.equal(source.slice(h.start, h.end), h.expression);
        source = source.slice(0, h.start) + JSON.stringify(h.new_path) + source.slice(h.end);
    }
    return source;
}
export function afterInstrumentMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return afterWeaponMigration(file, expected, compare);
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected instrument overlap: ' + file);
    return afterWeaponMigration(file, expectedCaller(file), compare);
}
export function renderDefinitions(family) {
    assert.ok(families.includes(family));
    return '// 普通乐器固定蓝图属性；规范 ID 自然排序，演奏复用原 MI 继承。\n'
        + `private mapping ${family}_definitions() {\n    return ([\n`
        + canonicalGroups().filter(g => g.family === family).map(g =>
            `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n            "weight": ${g.representative.weight},\n`
            + '            "properties": ({\n'
            + g.representative.properties.map(([k, v]) => `                ({ ${k}, ${v} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite frozen sources');
        const direct = git('grep', '-l', '-E', 'inherit (MI_QIN|MI_XIAO|MI_ZHENG|XSWORD);', baseline, '--', 'd/', 'clone/')
            .trim().split('\n').map(f => f.slice(baseline.length + 1)).sort();
        assert.deepEqual(direct, [...Object.keys(entries), ...retained].sort(), 'Complete direct and XSWORD inventory');
        const varieties = Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)).map(([file, [family, id]]) => {
            const source = original(file), row = parseInstrument(source, file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, 'Original unchanged: ' + file);
            assert.equal(row.family, family);
            return { ...row, id, new_path: '/d/items/' + family + '/' + id, source };
        });
        const refs = references(varieties);
        assert.equal(refs.hits.length, 27);
        assert.deepEqual([...new Set(refs.dynamic.map(h => h.file))], ['d/changan/npc/fujiang.c']);
        const callers = Object.fromEntries([...new Set(refs.hits.map(h => h.file))].sort().map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, 'Original consumer: ' + file);
            return [file, source];
        }));
        assert.equal(Object.keys(callers).length, 11);
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: preserved.map(file => ({ file, source_hash: hash(original(file)) })) };
        assert.equal(canonicalGroups(data).length, 24);
        mkdirSync(resolve(root, 'tools/tests/instrument'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    const data = readBaseline();
    if (process.argv.includes('--observations')) {
        assert.ok(!data.observations, 'Do not overwrite old driver observations');
        const observations = JSON.parse(readFileSync(process.argv[process.argv.indexOf('--observations') + 1], 'utf8'));
        assert.equal(observations.length, data.count);
        assert.deepEqual(observations.map(r => r.path).sort(), data.varieties.map(r => r.old_path).sort());
        data.observations = observations;
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c';
        assert.equal(original(file), row.source);
        for (const [k, v] of Object.entries(parseInstrument(row.source, file))) assert.deepEqual(row[k], v, file + ': ' + k);
    }
    console.log(`INSTRUMENT HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
