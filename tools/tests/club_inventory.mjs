// Ordinary CLUB inventory and offline migration metadata; never reads player data.
import assert from 'node:assert/strict';
import { normalizeWeaponTable } from './weapon_classification/migration_expectations.mjs';
import { afterBookMigration } from './book_inventory.mjs';
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
export const baseline = 'f4d88805d088d554fb59cdb60d1fb40f1d596484';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/club/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const excluded = ['d/luoyang/npc/obj/club1.c'];
export const preserved = [...excluded, 'clone/lonely/shenmu.c', 'clone/weapon/changqiang.c',
    'clone/weapon/qimeigun.c', 'clone/weapon/qishiji.c', 'clone/weapon/tiegun.c',
    'b/tulong/npc/obj/flag.c', 'b/yitian/npc/obj/spear.c', 'd/beijing/npc/qianzhenglun.c'];
export const dynamicCallers = ['kungfu/class/shaolin/dao-chen.c', 'kungfu/class/shaolin/dao-xiang.c', 'd/xiangyang/npc/wuxiuwen.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseClub(source, file) {
    const syntax = tokens(source);
    const inherited = syntax.flatMap((t, i) => t.text === 'inherit' ? [i] : []);
    assert.equal(inherited.length, 1, file + ': one CLUB parent');
    assert.equal(syntax[inherited[0] + 1].text, 'CLUB', file + ': CLUB parent');
    const normalized = source.replace(/\binherit\s+CLUB\s*;/, 'inherit BLADE;')
        .replace(/\binit_club\b/g, 'init_blade');
    const row = parseBlade(normalized, file);
    assert.equal(row.flags, 0, file + ': this batch uses default CLUB LONG flags');
    return { ...row, source_hash: hash(source) };
}

// Stable variety numbers distinguish genuine differences, not their old map directory.
const initialIds = ['tongjian', 'panlong_gun', 'dinghai_zhen', 'fangtian_ji', 'tianlei_dang',
    'xuantian_gun', 'ruyi_gun', 'gancheng', 'tiejiang', 'shutong_gun', 'sangu_cha', 'tieqiao',
    'diaogan', 'qimei_gun', 'daqi', 'bintie_qiang', 'mugun'];
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
        return { id, path: '/d/items/club/' + id, rows, representative: rows[0], ids };
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
    if (dynamicCallers.includes(file)) replace('    else\n        ob = new("/d/shaolin/obj/" + name);',
        `    else if (name == "qimeigun")\n        ob = new("${paths['/d/shaolin/obj/qimeigun']}");\n    else\n        ob = new("/d/shaolin/obj/" + name);`);
    if (file === 'kungfu/class/riyue/feng.c') replace('扬扬咋们日月神教的威风', '扬扬咱们日月神教的威风');
    return source;
}
export function afterClubMigration(file, expected, compare) {
    const data = readBaseline();
    if (data.callers[file]) {
        assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected CLUB baseline overlap: ' + file);
        expected = expectedCaller(file);
    }
    return afterBookMigration(file, expected, compare);
}
export function correctedClubText(id, key, value) {
    if (key === '"long"' && id === 'qimei_gun') return value.replace('白腊棍', '白蜡棍');
    if (key === '"long"' && id === 'gancheng') return value.replace('一杆闹市货物常用的杆秤。', '这是一杆称量货物用的杆秤。');
    if (key === '"wield_msg"' && ['xuantian_gun', 'ruyi_gun', 'dinghai_zhen'].includes(id))
        return value.replace('刹时雷声轰鸣', '霎时雷声轰鸣');
    return correctedItemText(key, value);
}
export function renderDefinitions() {
    return normalizeWeaponTable('club', renderHistoricalDefinitions());
}
export function renderHistoricalDefinitions() {
    return '// 普通棍类物品的蓝图属性；规范 ID 自然排序，伤害与标志由 init_club 初始化。\n'
        + 'private mapping club_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "damage": ${g.representative.damage},\n`
            + (g.representative.flags ? `            "flags": ${g.representative.flags},\n` : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${correctedClubText(g.id, key, value)} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = git('grep', '-l', '-e', 'inherit CLUB;', baseline, '--', 'd/').trim().split('\n')
            .map(file => file.slice(baseline.length + 1)).sort();
        assert.equal(files.length, 19);
        const seen = new Map();
        const varieties = files.filter(file => !excluded.includes(file)).map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseClub(source, file), key = signature(row);
            if (!seen.has(key)) seen.set(key, initialIds[seen.size]);
            const id = seen.get(key);
            assert.ok(id, file + ': explicit semantic ID required');
            return { ...row, id, new_path: '/d/items/club/' + id, source };
        });
        assert.equal(seen.size, initialIds.length);
        const refs = references(varieties);
        assert.equal(varieties.length, 18); assert.equal(refs.hits.length, 27);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: preserved.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/club'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseClub(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) process.stdout.write(renderDefinitions());
    console.log(`CLUB HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
