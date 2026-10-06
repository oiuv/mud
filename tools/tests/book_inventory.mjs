// Ordinary ITEM-based reading materials. Frozen sources, never player data.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, tokens, parseCloth, references } from './cloth_inventory.mjs';
import { compareItemIds, validId } from './item_ids.mjs';
export { root };
export const baseline = 'ea5f6afd1d95f22c5dc47fe23081a927ee64e11a';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64e6 });
export const original = file => git('show', `${baseline}:${file}`);
const savedFile = resolve(root, 'tools/tests/book/baseline.json');
export const readBaseline = () => JSON.parse(readFileSync(savedFile, 'utf8'));
const hash = source => createHash('sha256').update(source).digest('hex');
const semantic = source => tokens(source).map(t => t.text).filter((x, i, a) => x !== ',' || !['}', ']', ')'].includes(a[i + 1]));

export const excluded = ['d/city/npc/obj/lbook3.c', 'd/hengyang/obj/zigai-book.c',
    'd/kunlun/obj/lyj-book.c', 'd/lingxiao/obj/book-iron.c', 'd/wudu/obj/dujing1.c'];
export const dynamicRooms = ['d/emei/cangjingge.c', 'd/emei/cangjinglou.c', 'd/shaolin/cjlou.c', 'd/shaolin/jianyu.c'];
export const dynamicSuppliers = ['kungfu/class/shaolin/dao-chen.c', 'kungfu/class/shaolin/dao-xiang.c', 'd/xiangyang/npc/wuxiuwen.c'];
export const dynamicCallers = [...dynamicRooms, ...dynamicSuppliers];
const entries = {
    baibian_shentong: ['changan/npc/obj/book'],
    bojuan: ['lingxiao/obj/book-silk'],
    boluomi_jing: ['kaifeng/npc/obj/jing4'],
    chaizhao_mishu: ['wudu/obj/book2'],
    changsheng_jue: ['death/sky/obj/jue', 'sky/obj/jue'],
    daodejing1: ['quanzhen/npc/obj/daodejing-i'],
    daodejing2: ['quanzhen/npc/obj/daodejing-ii'],
    daofa_jianjie: ['changan/npc/obj/book_blade'],
    dujing2: ['wudu/obj/dujing2'],
    feilong_tanyun: ['death/sky/obj/miji3', 'sky/obj/miji3'],
    fojing1: ['emei/obj/fojing10', 'shaolin/obj/fojing10', 'shaolin/obj/fojing11'],
    fojing2: ['emei/obj/fojing11'],
    fojing3: ['emei/obj/fojing20'],
    fojing4: ['emei/obj/fojing21'],
    fojing5: ['shaolin/obj/fojing20', 'shaolin/obj/fojing21'],
    jingang_jing: ['kaifeng/npc/obj/jing3'],
    kunlun_miji: ['kunlun/obj/force-book'],
    lengjia_jing: ['mingjiao/obj/jing'],
    niepan_jing: ['kaifeng/npc/obj/jing2'],
    qinggong_pian: ['yanziwu/obj/dodgebook'],
    quanfa_jianjie: ['changan/npc/obj/book_unarmed'],
    shiban: ['lingxiao/obj/book-stone'],
    siji_jianfa: ['death/sky/obj/miji2', 'sky/obj/miji2'],
    tiexian_quan: ['death/sky/obj/miji1', 'sky/obj/miji1'],
    wuliang_jing: ['kaifeng/npc/obj/jing1'],
    xuedao_jing: ['jingzhou/obj/xuedao-jing'],
    yueshan_yishu: ['death/sky/obj/yishu', 'sky/obj/yishu'],
    zhu_pian: ['lingxiao/obj/book-bamboo'],
};

export function parseBook(source, file) {
    let normalized = source;
    const pools = {};
    for (const key of ['titles', 'skills']) {
        const matches = [...normalized.matchAll(new RegExp(`string\\s*\\*${key}\\s*=\\s*(\\(\\{[\\s\\S]*?\\}\\))\\s*;`, 'g'))];
        assert.ok(matches.length <= 1, file + ': one ' + key + ' pool');
        if (!matches.length) continue;
        const [declaration, expression] = matches[0];
        const parts = tokens(expression);
        assert.deepEqual(parts.slice(0, 2).map(p => p.text), ['(', '{'], file + ': array start');
        assert.deepEqual(parts.slice(-2).map(p => p.text), ['}', ')'], file + ': array end');
        assert.ok(parts.slice(2, -2).every((p, i) => i % 2 ? p.text === ',' : p.kind === 'string'), file + ': literal pool');
        pools[key] = parts.filter(p => p.kind === 'string').map(p => JSON.parse(p.text));
        assert.ok(pools[key].length, file + ': nonempty pool');
        normalized = normalized.replace(declaration, '');
    }
    if (pools.titles) {
        assert.equal((normalized.match(/titles\[random\(sizeof\(titles\)\)\]/g) || []).length, 1, file);
        normalized = normalized.replace('titles[random(sizeof(titles))]', '"BOOK_RANDOM_NAME"');
    }
    if (pools.skills) {
        const declaration = /int i = random\(sizeof\(skills\)\);/;
        assert.ok(declaration.test(normalized), file + ': original skill draw');
        normalized = normalized.replace(declaration, '');
        assert.equal((normalized.match(/skills\[i\]/g) || []).length, 1, file);
        normalized = normalized.replace('skills[i]', '"BOOK_RANDOM_SKILL"');
    }
    const costs = [...normalized.matchAll(/20\s*\+\s*random\((10|20)\)/g)];
    assert.ok(costs.length <= 1, file + ': one blueprint cost');
    const costRandom = costs.length ? Number(costs[0][1]) : 0;
    if (costRandom) normalized = normalized.replace(costs[0][0], '20');
    assert.ok(!tokens(normalized).some(t => t.text === 'setup'), file + ': no original setup');
    normalized = normalized.replace(/inherit\s+ITEM\s*;/, 'inherit CLOTH;').replace(/}\s*$/, 'setup();\n}');
    const row = parseCloth(normalized, file);
    assert.deepEqual([row.before_weight, row.before_branch, row.after_branch], [[], [], []], file + ': no extra state');
    assert.ok(/^\d+$/.test(row.weight), file + ': constant weight');
    for (const expression of [...row.name, ...row.properties.flat()]) {
        const parts = tokens(expression);
        assert.ok(!parts.some((p, i) => /^[A-Za-z_]\w*$/.test(p.text) && parts[i + 1]?.text === '('), file + ': no runtime expressions');
    }
    assert.ok(row.properties.some(([key]) => key === '"skill"'), file + ': skill mapping');
    return { ...row, name_choices: pools.titles || [], skill_choices: pools.skills || [],
        jing_cost_random: costRandom, source_hash: hash(source) };
}

const signature = row => JSON.stringify([semantic(row.name[0]), row.weight,
    row.name_choices, row.skill_choices, row.jing_cost_random,
    [...new Map(row.properties).entries()].map(pair => pair.map(semantic)).sort((a, b) => JSON.stringify(a[0]).localeCompare(JSON.stringify(b[0])))]);
export function canonicalGroups(data = readBaseline()) {
    const groups = new Map();
    for (const row of data.varieties) {
        assert.ok(validId(row.id), row.id);
        if (!groups.has(row.id)) groups.set(row.id, []);
        groups.get(row.id).push(row);
    }
    return [...groups].sort(([a], [b]) => compareItemIds(a, b)).map(([id, rows]) => {
        for (const row of rows) assert.equal(signature(row), signature(rows[0]), id + ': effective definition mismatch');
        const aliases = row => tokens(row.name[1]).filter(t => t.kind === 'string').map(t => JSON.parse(t.text));
        const ids = [...new Set(rows.flatMap(aliases))];
        for (const row of rows) {
            const first = aliases(row)[0][0].toLowerCase();
            if (first !== ids[0][0].toLowerCase() && !ids.includes(first)) ids.push(first);
        }
        return { id, path: '/d/items/book/' + id, rows, representative: rows[0], ids };
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
    if (dynamicRooms.includes(file)) {
        const emei = file.startsWith('d/emei/');
        const prefix = emei ? '__DIR__ "obj/fojing' : '"d/shaolin/obj/fojing';
        for (const digit of file.endsWith('/jianyu.c') ? [1] : [1, 2]) {
            const before = prefix + digit + '" + random(2)';
            assert.equal(source.split(before).length, 2, file + ': exact random path');
            const choices = [0, 1].map(n => paths[`/d/${emei ? 'emei' : 'shaolin'}/obj/fojing${digit}${n}`]);
            source = source.replace(before, `({ ${choices.map(JSON.stringify).join(', ')} })[random(2)]`);
        }
    }
    if (dynamicSuppliers.includes(file)) {
        const before = '    else\n        ob = new("/d/shaolin/obj/" + name);';
        assert.equal(source.split(before).length, 2, file + ': exact supplier branch');
        const branches = ['10', '11', '20', '21'].map(n =>
            `    else if (name == "fojing${n}")\n        ob = new("${paths['/d/shaolin/obj/fojing' + n]}");\n`).join('');
        source = source.replace(before, branches + before);
    }
    return source;
}
export function afterBookMigration(file, expected, compare) {
    const data = readBaseline();
    if (!data.callers[file]) return expected;
    assert.deepEqual(compare(data.callers[file]), compare(expected), 'Unexpected BOOK baseline overlap: ' + file);
    return expectedCaller(file);
}
export function correctedBookText(id, key, value) {
    if (key !== '"long"') return value;
    if (id === 'siji_jianfa') return value.replace('奥决', '奥诀');
    if (id === 'bojuan') return value.replace('吐呐', '吐纳');
    if (id === 'shiban') return value.replace('园园的石板', '圆圆的石板');
    return value;
}
const lpcArray = values => '({ ' + values.map(JSON.stringify).join(', ') + ' })';
export function renderDefinitions() {
    return '// 普通研读物；规范 ID 自然排序，随机候选只保存数据，不在建表时抽样。\n'
        + 'private mapping book_definitions() {\n    return ([\n'
        + canonicalGroups().map(g => {
            const r = g.representative;
            return `        "${g.id}": ([\n`
                + (r.name_choices.length ? `            "name_choices": ${lpcArray(r.name_choices)},\n` : `            "name": ${r.name[0]},\n`)
                + `            "ids": ${lpcArray(g.ids)},\n            "weight": ${r.weight},\n`
                + (r.skill_choices.length ? `            "skill_choices": ${lpcArray(r.skill_choices)},\n` : '')
                + (r.jing_cost_random ? `            "jing_cost_random": ${r.jing_cost_random},\n` : '')
                + '            "properties": ({\n'
                + r.properties.map(([key, value]) => `                ({ ${key}, ${correctedBookText(g.id, key, value).replace('"BOOK_RANDOM_SKILL"', '0')} }),`).join('\n')
                + '\n            }),\n        ]),';
        }).join('\n') + '\n    ]);\n}\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--capture')) {
        assert.ok(!existsSync(savedFile), 'Do not overwrite the frozen baseline');
        const varieties = Object.entries(entries).flatMap(([id, files]) => files.map(path => {
            const file = 'd/' + path + '.c', source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified baseline');
            return { ...parseBook(source, file), id, new_path: '/d/items/book/' + id, source };
        })).sort((a, b) => a.old_path.localeCompare(b.old_path));
        const refs = references(varieties);
        const callers = Object.fromEntries([...new Set([...refs.hits.map(h => h.file), ...dynamicCallers])].sort().map(file => {
            const source = original(file);
            assert.equal(readFileSync(resolve(root, file), 'utf8'), source, file + ': unmodified caller');
            return [file, source];
        }));
        assert.equal(varieties.length, 36); assert.equal(refs.hits.length, 19); assert.equal(Object.keys(callers).length, 20);
        const data = { baseline, count: varieties.length, varieties, ...refs, callers,
            excluded: [...excluded, 'd/changan/npc/fujiang.c'].map(file => ({ file, source_hash: hash(original(file)) })) };
        assert.equal(canonicalGroups(data).length, 28);
        mkdirSync(resolve(root, 'tools/tests/book'), { recursive: true });
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
    }
    const data = readBaseline();
    if (process.argv.includes('--observations')) {
        assert.ok(!data.observations, 'Do not overwrite frozen observations');
        const file = process.argv[process.argv.indexOf('--observations') + 1];
        data.observations = JSON.parse(readFileSync(file, 'utf8'));
        assert.equal(data.observations.length, data.count);
        writeFileSync(savedFile, JSON.stringify(data, null, 2) + '\n');
    }
    for (const row of data.varieties) {
        const file = row.old_path.slice(1) + '.c';
        assert.equal(original(file), row.source);
        for (const [key, value] of Object.entries(parseBook(row.source, file))) assert.deepEqual(row[key], value, file + ': ' + key);
    }
    if (process.argv.includes('--render')) process.stdout.write(renderDefinitions());
    else console.log(`BOOK HISTORICAL AUDIT PASS: ${data.count} definitions, ${canonicalGroups().length} varieties, ${data.hits.length} references`);
}
