// Ordinary drinks inventory and offline metadata. Never reads live records.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = '719a96ecd0bb9d0e24cc08eed6449184a01d0c9a';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/liquid/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = ['d/gumu/obj/fengmi.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseLiquid(source, file) {
    const code = tokens(source);
    const setup = code.filter(t => t.text === 'setup');
    assert.ok(setup.length <= 1, file + ': repeated setup');
    if (setup.length) {
        const i = code.indexOf(setup[0]);
        assert.deepEqual(code.slice(i, i + 4).map(t => t.text), ['setup', '(', ')', ';'], file);
    }
    let normalized = source.replace(/\binherit\s+ITEM\s*;/, 'inherit CLOTH;')
        .replace(/\binherit\s+F_LIQUID\s*;/, '').replace(/\bvoid\s+init\s*\(\s*\)\s*;/, '');
    assert.equal(code.filter(t => t.text === 'F_LIQUID').length, 1, file + ': liquid parent');
    if (!setup.length) {
        const last = tokens(normalized).at(-1);
        assert.equal(last.text, '}', file + ': constructor end');
        normalized = normalized.slice(0, last.start) + 'setup();\n' + normalized.slice(last.start);
    }
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch], [[], []], file + ': extra initialization');
    assert.match(row.weight, /^\d+$/, file + ': constant weight');
    assert.deepEqual(row.after_branch.map(([key]) => key), row.after_branch.length === 1
        ? ['"liquid"'] : ['"liquid"', '"liquid_type"'], file + ': explicit initial liquid');
    assert.ok(!row.properties.some(([key]) => ['"liquid"', '"liquid_type"'].includes(key)), file);
    const allowed = new Set(['NOR', 'BLK', 'RED', 'GRN', 'YEL', 'BLU', 'MAG', 'CYN', 'WHT',
        'HIR', 'HIG', 'HIY', 'HIB', 'HIM', 'HIC', 'HIW', 'HIK']);
    for (const expression of [...row.name, ...row.properties.flat(), ...row.after_branch.flat()])
        for (const token of tokens(expression))
            if (/^[A-Za-z_]\w*$/.test(token.text))
                assert.ok(allowed.has(token.text), file + ': nonliteral data: ' + token.text);
    assert.deepEqual(tokens(row.after_branch[0][1]).slice(0, 2).map(t => t.text), ['(', '['], file + ': liquid mapping');
    return { ...row, setup: !!setup.length, source_hash: hash(source) };
}

// Short semantic names; suffixes are stable varieties, never source directories.
const initialIds = [
    'dawan', 'doujiang', 'gaiwancha', 'wulongcha', 'longjingcha', 'longjingcha2',
    'baijiu', 'jiudai', 'chahu', 'zuixunfeng', 'jiudai2', 'huadiao_dai', 'beizhan', 'jiubei',
    'puercha', 'qingshui_hulu', 'jiuping', 'gourou_tang', 'zhou', 'jiuping2', 'xiangcha',
    'qingshui', 'nverhong', 'mogu_tang', 'zaopen', 'jiyu_tang', 'cuciwan', 'dawancha',
    'shuihu', 'jiuhulu', 'jiudai3', 'shuihu2', 'hulu', 'jiudai4', 'suanmei_tang',
    'xuehe_tang', 'hulu2', 'shuiwan', 'caitang', 'suancai_tang', 'jiuhulu2', 'jiudai5',
    'heye_tang', 'zuixiancha', 'cuciwan2', 'jiuhu', 'qinghua_wan', 'huacha',
    'yecai_tang', 'shuiwan2', 'manai_hu', 'qing_hulu', 'niupidai', 'biluochun',
];
const signature = row => JSON.stringify([semantic(row.name[0]), row.weight,
    row.properties.map(pair => pair.map(semantic)).sort(),
    row.after_branch.map(pair => pair.map(semantic)).sort(), row.setup]);

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
        return { id, path: '/d/items/liquid/' + id, rows, representative: rows[0], ids };
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
export function afterLiquidMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected LIQUID baseline overlap: ' + file);
    return expectedCaller(file);
}
export function renderDefinitions() {
    return '// 普通饮具的固定属性及初始液体；规范 ID 自然排序，液体每次创建独立复制。\n'
        + 'private mapping liquid_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n`
            + (g.representative.setup ? '            "setup": 1,\n' : '')
            + '            "properties": ({\n'
            + [...g.representative.properties, ...g.representative.after_branch].map(([key, value]) =>
                `                ({ ${key}, ${value} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-E', 'inherit[[:space:]]+F_LIQUID[[:space:]]*;', baseline, '--', 'd/')
            .trim().split('\n').map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 75);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseLiquid(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/liquid/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 74); assert.equal(refs.hits.length, 99); assert.equal(refs.dynamic.length, 4);
        const callers = Object.fromEntries([...new Set(refs.hits.map(h => h.file))].sort()
            .map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/liquid'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
    }
    const data = readBaseline();
    if (process.argv.includes('--observations')) {
        assert.ok(!data.observations, 'Do not overwrite frozen driver observations');
        const observations = JSON.parse(readFileSync(process.argv[process.argv.indexOf('--observations') + 1], 'utf8'));
        assert.equal(observations.length, data.count);
        assert.deepEqual(observations.map(o => o.path), data.varieties.map(r => r.old_path));
        data.observations = observations;
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c';
        assert.equal(original(file), row.source);
        for (const [key, value] of Object.entries(parseLiquid(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) {
        assert.equal(data.observations?.length, 74, 'Capture actual behavior before rendering');
        writeFileSync(resolve(root, 'd/items/liquid_data.h'), renderDefinitions());
    }
    console.log(`LIQUID HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} ${data.observations ? 'observed' : 'candidate'} varieties, ${data.hits.length} references`);
}
