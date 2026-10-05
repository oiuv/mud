// Direct EQUIP definitions and frozen offline migration evidence; no live records.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = 'beef12eae82f6d52e836cdf729ac6465e5b594b7';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/equip/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
const hash = source => createHash('sha256').update(source).digest('hex');

export function parseEquip(source, file) {
    const syntax = tokens(source);
    assert.deepEqual(syntax.slice(0, 3).map(t => t.text), ['inherit', 'EQUIP', ';'], file + ': direct EQUIP only');
    const setups = syntax.flatMap((t, i) => t.text === 'setup' ? [i] : []);
    assert.ok(setups.length <= 1, file + ': setup at most once');
    if (setups.length) assert.deepEqual(syntax.slice(setups[0]).map(t => t.text),
        ['setup', '(', ')', ';', '}'], file + ': terminal no-argument setup only');
    assert.equal(syntax.at(-1)?.text, '}', file + ': closed constructor');
    // Adapt only the absent final call to the existing strict initializer grammar.
    // Saved source/hash always refer to the actual unmodified EQUIP source.
    const normalized = (setups.length ? source : source.slice(0, syntax.at(-1).start)
        + 'setup();\n' + source.slice(syntax.at(-1).start)).replace(/\binherit\s+EQUIP\s*;/, 'inherit CLOTH;');
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch, row.after_branch], [[], [], []], file + ': fixed blueprint properties only');
    assert.ok(/^\d+$/.test(row.weight), file + ': constant weight');
    for (const expression of [...row.name, ...row.properties.flat()]) {
        const parts = tokens(expression);
        assert.ok(parts.every(t => t.kind === 'string' || /^-?\d+$/.test(t.text)
            || /^(?:NOR|HI[RGBYMCW]|[RGBYMCW][A-Z]{2}|BLK)$/.test(t.text)
            || ['(', ')', '{', '}', ',', '-'].includes(t.text)), file + ': fixed literal expression only: ' + expression);
    }
    return { ...row, setup: Number(!!setups.length), source_hash: hash(source) };
}

// Stable semantic IDs in the frozen source order. Numbers denote real variants.
const initialIds = [
    'ruanjin_dai', 'yangpi_xue', 'buxie', 'magua', 'wucai_qun', 'lihua_shang',
    'tuanjin_gua', 'guihua_shan', 'yingzi_mao', 'baoshi_dai', 'yingwu_fu', 'jiehun_lifu',
    'jinshen_ao', 'jiaoyue_shang', 'lihua_shang2', 'qicai_yi', 'nihong_qun', 'xiaoyao_jin',
    'danyan_sha', 'xiuhuaxie', 'xuanse_ao', 'xiucai_zhuang', 'xiaofang_jin', 'ningxiang_yi', 'shaxiang_qun',
    'baichou_qun', 'baipao', 'baisiyi',
    'ruanjin_dai2', 'heijin_zhuang', 'yangpi_xue2', 'buxie2', 'magua2', 'wucai_qun2', 'lihua_shang3',
    'tuanjin_gua2', 'guihua_shan2', 'yingzi_mao2', 'baoshi_dai2', 'yingwu_fu2', 'jiehun_lifu2',
    'jinshen_ao2', 'jiaoyue_shang2', 'lihua_shang4', 'qicai_yi2', 'qingshan', 'nihong_qun2',
    'xiaoyao_jin2', 'danyan_sha2', 'xiuhuaxie2', 'xiuhuaxie3', 'xuanse_ao2', 'xiucai_zhuang2',
    'xiaofang_jin2', 'ningxiang_yi2', 'shaxiang_qun2',
];
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
        return { id, path: '/d/items/equip/' + id, rows, representative: rows[0], ids };
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
    return source;
}
export function afterEquipMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected EQUIP baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 直接 EQUIP 防具的蓝图属性；规范 ID 自然排序，setup 仅保留原初始化选择。\n'
        + 'private mapping equip_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n`
            + (g.representative.setup ? '            "setup": 1,\n' : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${value} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite frozen source');
        const files = git('grep', '-l', '-e', 'inherit EQUIP;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 56);
        const varieties = files.map((file, i) => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseEquip(source, file), id = initialIds[i];
            assert.ok(id, file + ': semantic ID required');
            return { ...row, id, new_path: '/d/items/equip/' + id, source };
        });
        assert.equal(varieties.filter(r => r.setup).length, 25);
        const refs = references(varieties);
        assert.equal(refs.hits.length, 64); assert.equal(refs.dynamic.length, 0);
        const callers = Object.fromEntries([...new Set(refs.hits.map(h => h.file))].sort()
            .map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        assert.equal(Object.keys(callers).length, 25);
        mkdirSync(resolve(root, 'tools/tests/equip'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify({ baseline, count: varieties.length, varieties, ...refs, callers }, null, 2) + '\n');
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
        for (const [key, value] of Object.entries(parseEquip(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/equip_data.h'), renderDefinitions());
    console.log(`EQUIP HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} candidate varieties, ${data.hits.length} references`);
}
