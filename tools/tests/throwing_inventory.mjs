// Ordinary THROWING inventory and offline migration metadata; never reads player data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
import { parseBlade } from './blade_inventory.mjs';
export { root };
export const baseline = '55f5e073918809866a411bfbb61c2db718df07a2';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/throwing/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = ['d/beijing/obj/yinzhen.c', 'd/chengdu/npc/obj/tea-leaf.c',
    'd/gumu/obj/bingpo-zhen.c', 'd/gumu/obj/yufeng-zhen.c', 'd/kunlun/obj/sangmending.c',
    'd/mingjiao/yuan/obj/arrow.c'];
export const dynamicCallers = ['d/beijing/npc/qianzhenglun.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseThrowing(source, file) {
    const syntax = tokens(source);
    const inherited = syntax.flatMap((t, i) => t.text === 'inherit' ? [i] : []);
    assert.equal(inherited.length, 1, file + ': one THROWING parent');
    assert.equal(syntax[inherited[0] + 1].text, 'THROWING', file + ': THROWING parent');
    const amounts = syntax.flatMap((t, i) => t.text === 'set_amount' ? [i] : []);
    assert.equal(amounts.length, 1, file + ': one constant quantity');
    const i = amounts[0];
    assert.deepEqual(syntax.slice(i - 1, i + 6).map(t => t.text),
        ['}', 'set_amount', '(', syntax[i + 2].text, ')', ';', 'init_throwing'],
        file + ': quantity follows properties and precedes init_throwing');
    assert.match(syntax[i + 2].text, /^[1-9]\d*$/, file + ': positive constant quantity');
    let normalized = source.slice(0, syntax[i].start) + source.slice(syntax[i + 4].end);
    const hasWeight = syntax.some(t => t.text === 'set_weight');
    if (!hasWeight) {
        const branch = tokens(normalized).find(t => t.text === 'if');
        normalized = normalized.slice(0, branch.start) + 'set_weight(0);\n' + normalized.slice(branch.start);
    }
    normalized = normalized.replace(/\binherit\s+THROWING\s*;/, 'inherit BLADE;')
        .replace(/\binit_throwing\b/g, 'init_blade');
    const row = parseBlade(normalized, file);
    assert.deepEqual(row.after_branch, [], file + ': no post-branch overrides');
    return { ...row, amount: Number(syntax[i + 2].text), initial_weight: hasWeight ? Number(row.weight) : null,
        source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = [
    'jinbiao', 'feihuangshi', 'jinbiao2', 'feihuangshi2', 'huaban', 'tielianzi', 'tielianzi2',
    'xianhe_zhen', 'tianqiong_zhen', 'longxiang_zhen', 'leiting_zhen', 'xiaoli_feidao',
    'duandao', 'tiedan', 'eluanshi', 'heixue_zhen', 'jinshe_zhui', 'furong_zhen',
    'lanwu_zhen', 'qizi', 'feidao', 'dujili', 'taohua_ban', 'shizi', 'bilin_zhen', 'lianxin_dan'
];
const signature = row => JSON.stringify([semantic(row.name[0]), row.weight, row.amount, row.damage, row.flags,
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
        return { id, path: '/d/items/throwing/' + id, rows, representative: rows[0], ids };
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
        `    else if (arg == "throwing")\n        obj = new("${paths['/d/beijing/npc/obj/throwing']}");\n    else if (arg == "feet")`);
    return source;
}
export function afterThrowingMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected THROWING baseline overlap: ' + file);
    return expectedCaller(file);
}
// Display corrections are scoped to the exact source and property, never to frozen snapshots.
export function correctedThrowingText(path, key, value) {
    if (key !== '"long"') return value;
    if (['/d/chengdu/npc/obj/flower-leaf', '/d/taohua/obj/huaban'].includes(path))
        return value.replace('挂这晶莹', '挂着晶莹');
    if (path === '/d/chengdu/npc/obj/lianzi') return value.replace('沉颠颠', '沉甸甸');
    return value;
}
export function renderDefinitions() {
    return '// 普通暗器的蓝图属性；规范 ID 自然排序，数量由每个对象独立初始化。\n'
        + 'private mapping throwing_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "amount": ${g.representative.amount},\n            "damage": ${g.representative.damage},\n`
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${correctedThrowingText(g.representative.old_path, key, value)} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-e', 'inherit THROWING;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 33);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseThrowing(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/throwing/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 27); assert.equal(refs.hits.length, 41); assert.equal(refs.dynamic.length, 2);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: excluded.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/throwing'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseThrowing(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) writeFileSync(resolve(root, 'd/items/throwing_data.h'), renderDefinitions());
    console.log(`THROWING HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
