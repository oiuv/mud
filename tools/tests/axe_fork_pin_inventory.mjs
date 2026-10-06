import { afterDefensiveMigration } from './defensive_gear_inventory.mjs';
// Ordinary AXE/FORK/PIN inventory and offline migration metadata; never reads player data.
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
export const baseline = '3c7bd13cd324fe61c580c57bc865ce63fe91143a';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/axe_fork_pin/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
export const families = ['axe', 'fork', 'pin'];
export const excluded = ['clone/lonely/kuihuazhen.c', 'clone/misc/pin.c', 'clone/misc/spin.c',
    'clone/tattoo/npc_item2.c', 'kungfu/class/riyue/dongfang/zhen.c'];
export const preserved = [...excluded, 'd/beijing/npc/qianzhenglun.c', 'd/guanwai/famu.c',
    ...families.map(f => 'inherit/weapon/' + f + '.c'), 'adm/daemons/combatd.c',
    'd/items/club.lpc', 'd/items/club_data.h', 'clone/weapon/changqiang.c', 'b/yitian/npc/obj/spear.c'];
export const dynamicCallers = ['d/changan/npc/fujiang.c'];
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text);

export function parseWeapon(source, file) {
    const syntax = tokens(source);
    const inherited = syntax.flatMap((t, i) => t.text === 'inherit' ? [i] : []);
    assert.equal(inherited.length, 1, file + ': one weapon parent');
    const family = syntax[inherited[0] + 1].text.toLowerCase();
    assert.ok(families.includes(family), file + ': approved family');
    const init = new RegExp('\\binit_' + family + '\\s*\\(\\s*(\\d+)\\s*(?:,\\s*(TWO_HANDED|0))?\\s*\\)\\s*;', 'g');
    const matches = [...source.matchAll(init)];
    assert.equal(matches.length, 1, file + ': literal damage and explicit supported flag only');
    const match = matches[0];
    const normalized = source.replace(new RegExp('\\binherit\\s+' + family.toUpperCase() + '\\s*;'), 'inherit BLADE;')
        .replace(match[0], 'init_blade(' + match[1] + ', ' + (match[2] === 'TWO_HANDED' ? 1 : 0) + ');');
    const row = parseBlade(normalized, file);
    return { ...row, family, source_hash: hash(source) };
}

const initialIds = {
    'd/beijing/npc/obj/axe.c': 'dabanfu', 'd/changan/npc/obj/axe.c': 'banfu',
    'd/guanwai/obj/axe.c': 'futou', 'd/guiyun/npc/obj/axe.c': 'kanchai_fu',
    'd/huanghe/npc/obj/axe.c': 'sangmen_fu', 'd/huanghe/npc/obj/futou.c': 'da_futou',
    'd/tiezhang/obj/axe.c': 'dabanfu2', 'd/beijing/npc/obj/fork.c': 'gangcha',
    'd/quanzhou/obj/xiuhua.c': 'xiuhua_zhen',
};
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
        return { id, path: '/d/items/' + rows[0].family + '/' + id, rows, representative: rows[0], ids };
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
    if (file === 'd/changan/npc/fujiang.c') {
        const before = '    else\n        carry_object(__DIR__ "obj/" + weapon_file)->wield();';
        assert.equal(source.split(before).length, 2, 'exact fujiang dynamic branch');
        source = source.replace(before,
            '    else if (weapon_file == "axe")\n        carry_object("/d/items/axe/banfu")->wield();\n' + before);
    }
    return source;
}
export function afterWeaponMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return afterDefensiveMigration(file, expected, compare);
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected weapon overlap: ' + file);
    return afterDefensiveMigration(file, expectedCaller(file), compare);
}
export function correctedWeaponText(id, key, value) {
    if (id === 'sangmen_fu' && key === '"long"')
        return value.replace('这是一杆三尖开刃的三股叉。', '这是一柄锋利的丧门斧。');
    if (id === 'kanchai_fu' && key === '"wield_msg"')
        return value.replace('$N抽出一根$n握在手中。', '$N抽出一柄$n握在手中。');
    return value;
}
export function renderDefinitions(family) {
    return '// 普通兵器的蓝图属性；按规范 ID 自然排序。\n'
        + 'private mapping ' + family + '_definitions() {\n    return ([\n'
        + canonicalGroups().filter(g => g.representative.family === family).map(g => `        "${g.id}": ([\n            "name": ${g.representative.name[0]},\n`
            + `            "ids": ({ ${g.ids.map(JSON.stringify).join(', ')} }),\n`
            + `            "weight": ${g.representative.weight},\n            "damage": ${g.representative.damage},\n`
            + (g.representative.flags ? `            "flags": ${g.representative.flags},\n` : '')
            + '            "properties": ({\n'
            + g.representative.properties.map(([key, value]) => `                ({ ${key}, ${correctedWeaponText(g.id, key, value)} }),`).join('\n')
            + '\n            }),\n        ]),').join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const files = Object.keys(initialIds).sort();
        const varieties = files.map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified original');
            const row = parseWeapon(source, file), id = initialIds[file];
            return { ...row, id, new_path: '/d/items/' + row.family + '/' + id, source };
        });
        const refs = references(varieties);
        assert.equal(varieties.length, 9); assert.equal(refs.hits.length, 6); assert.equal(refs.dynamic.length, 2);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])]
            .sort().map(file => [file, readFileSync(resolve(root, file), 'utf8')]));
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: preserved.map(file => ({ file, source_hash: hash(original(file)) })) };
        mkdirSync(resolve(root, 'tools/tests/axe_fork_pin'), { recursive: true });
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
        for (const [key, value] of Object.entries(parseWeapon(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) process.stdout.write(renderDefinitions(process.argv[process.argv.indexOf('--render') + 1]));
    console.log(`AXE_FORK_PIN HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
