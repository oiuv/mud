// Cumulative expectations for the approved weapon normalization. No live saves.
// Historical migration snapshots and their grouping rules remain immutable.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { compareItemIds } from '../item_ids.mjs';
import { canonicalWeaponPath, definitionEntries, mergeWeaponTable, normalization, normalizeWeaponReferences } from './normalization.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const originalTables = new Map();

// Driver fixtures compare approved merges to a frozen representative, never to
// the current object's own definition. Every unlisted pair keeps strict parity.
export function weaponFixtureExpectations(groups) {
    const byPath = new Map(groups.map(group => [group.path, group]));
    const references = {}, canonical = [];
    for (const group of groups) {
        const target = normalization.merges[group.path];
        if (target) {
            const representative = byPath.get(target)?.representative;
            assert.ok(representative, 'Frozen merge representative: ' + target);
            for (const row of group.rows)
                references[row.old_path] = { target, reference: representative.old_path };
            continue;
        }
        const donors = Object.entries(normalization.merges)
            .filter(([, targetPath]) => targetPath === group.path)
            .map(([oldPath]) => {
                assert.ok(byPath.has(oldPath), 'Frozen merge donor: ' + oldPath);
                return byPath.get(oldPath);
            });
        const ids = [];
        for (const member of [group, ...donors]) {
            ids.push(...member.ids);
            if (member.ids[0][0] !== ids[0][0]) ids.push(member.ids[0][0]);
        }
        canonical.push({ path: canonicalWeaponPath(group.path), ids: [...new Set(ids)],
            historical: [group, ...donors].flatMap(member => member.rows.map(row => row.new_path)) });
    }
    return { canonical, references };
}

function originalTable(family) {
    if (!originalTables.has(family)) originalTables.set(family, execFileSync('git',
        ['show', normalization.baseline + ':d/items/' + family + '_data.h'],
        { cwd: root, encoding: 'utf8', maxBuffer: 8e6 }));
    return originalTables.get(family);
}

// Input is the old generator's independently reconstructed table, never the
// current data file. Incoming definitions come from the pinned pre-change commit.
export function normalizeWeaponTable(family, source) {
    const merged = mergeWeaponTable(family, source);
    const entries = definitionEntries(merged);
    for (const [before, after] of Object.entries(normalization.moves)) {
        const [, , , oldFamily, oldId] = before.split('/');
        const [, , , newFamily, newId] = after.split('/');
        if (oldFamily === family) {
            assert.ok(entries.delete(oldId), 'Explicit outgoing variety: ' + before);
        }
        if (newFamily === family) {
            assert.ok(!entries.has(newId), 'No overwritten incoming variety: ' + after);
            const entry = definitionEntries(originalTable(oldFamily)).get(oldId);
            assert.ok(entry, 'Pinned incoming variety: ' + before);
            entries.set(newId, entry);
        }
    }
    if (!entries.size) return '';
    const start = merged.indexOf('    return ([\n');
    assert.ok(start >= 0, 'Generator table body: ' + family);
    return merged.slice(0, start) + '    return ([\n'
        + [...entries].sort(([a], [b]) => compareItemIds(a, b)).map(([, text]) => text).join('')
        + '    ]);\n}\n';
}

export function renderSpearDefinitions() {
    return normalizeWeaponTable('spear', '// 普通枪系长兵器的蓝图属性；按规范 ID 自然排序。\n'
        + 'private mapping spear_definitions() {\n    return ([\n    ]);\n}\n');
}

const axeNpcs = new Set(['b/tulong/npc/guo.c', 'kungfu/class/duan/gu.c',
    ...['fan', 'feng', 'qu', 'yun'].map(id => 'kungfu/class/riyue/' + id + '.c')]);
const spearNpcs = new Set(['d/huanghe/npc/hou.c', 'd/huanghe/npc/wu.c', 'd/huanghe/npc/xixiabing.c',
    'd/lingzhou/npc/hao.c', 'd/lingzhou/npc/shiwushi.c', 'd/lingzhou/npc/xixiabing.c',
    'd/hangzhou/npc/honghua2.c', 'd/hangzhou/npc/qingbing.c', 'd/xiangyang/npc/menggubing.c',
    'b/yitian/npc/bing1.c', 'b/yitian/npc/bing2.c',
    'd/tulong/yitian/npc/bing1.c', 'd/tulong/yitian/npc/bing2.c']);
const spearItems = new Set(['clone/weapon/changqiang.c', 'clone/weapon/qishiji.c', 'b/yitian/npc/obj/spear.c']);

// Applied only at the end of the existing chronological migration chain.
// File-scoped substitutions prevent unrelated martial arts from being accepted.
export function afterWeaponNormalization(file, source) {
    source = normalizeWeaponReferences(source);
    if (axeNpcs.has(file)) source = source.replaceAll('"hammer"', '"axe"')
        .replaceAll('"hammer.cuo"', '"axe.cuo"').replaceAll('"hammer.kai"', '"axe.kai"');
    if (file === 'kungfu/class/riyue/fan.c') source = source.replaceAll('这套锤法', '这套斧法')
        .replaceAll('你锤法的造诣', '你斧法的造诣');
    if (spearNpcs.has(file)) source = source.replaceAll('"club"', '"spear"');
    if (spearItems.has(file)) source = source.replace('inherit CLUB;', 'inherit SPEAR;')
        .replaceAll('init_club(', 'init_spear(');
    if (file === 'clone/weapon/changqiang.c') source = source.replace('一杆根$n', '一杆$n');
    if (file === 'd/guiyun/npc/quanjinfa.c') source = source.replaceAll('"zhongping-qiang"', '"caiyan-gong"');
    if (['kungfu/class/riyue/tong.c', 'kungfu/class/riyue/zhao.c'].includes(file))
        source = source.replaceAll('"pangu-qishi"', '"hanshan-chuifa"').replaceAll('"hammer.kai"', '"hammer.zhen"');
    if (file === 'kungfu/class/riyue/zhao.c') {
        source = source.replace('void create()', 'mixed ask_hanshan();\n\nvoid create()')
            .replace('"开天辟地": "你去让我师兄教你吧。",',
                '"开天辟地": "你去让我师兄教你吧。",\n        "撼山震岳": (: ask_hanshan :),')
            .replace('这套盘古七势', '这套撼山锤法');
        source += readFileSync(new URL('./zhao_teaching.expected.lpc', import.meta.url), 'utf8');
    }
    if (file === 'd/items/club_data.h') source = normalizeWeaponTable('club', source);
    return source;
}
