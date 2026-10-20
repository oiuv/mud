import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b14SourcePaths, b14ReviewedSourceHash, b14PerformConditions, validateB14Record,
    b14Effects, b14Schools } from './b14_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b14PerformConditions(catalog, read);
const smoke = b14PerformConditions(catalog, read, { smoke: true });

function state(cfg, side) {
    const src = side ? cfg.target : cfg.actor;
    const temp = { apply: { armor: 1 } };
    for (const [key, value] of Object.entries(src.temp ?? {})) {
        const parts = key.split('/');
        let node = temp;
        for (const part of parts.slice(0, -1)) node = node[part] ??= {};
        node[parts.at(-1)] = value;
    }
    return {
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        skills: { ...src.skills }, learned: {}, mappings: { ...src.mappings },
        preparations: { ...src.preparations },
        temp,
        busy: src.busy ?? null,
        qi: src.properties.qi, eff_qi: src.properties.eff_qi, jing: src.properties.jing,
        eff_jing: src.properties.eff_jing, neili: src.properties.neili,
        max_neili: src.properties.max_neili,
        jingli: src.properties.jingli, max_jingli: src.properties.max_jingli,
        str: src.properties.str, int: src.properties.int, con: src.properties.con,
        dex: src.properties.dex, shen: src.properties.shen,
        gender: src.properties.gender, character: src.properties.character,
        combat_exp: src.properties.combat_exp,
        effective_str: src.properties.str, effective_dex: src.properties.dex + 20,
        effective_skills: Object.fromEntries(Object.entries(src.skills).map(([k, v]) =>
            [k, src.mappings?.[k] ? Math.trunc(v / 2) + (src.skills[src.mappings[k]] ?? 0) : Math.trunc(v / 2)])),
        conditions: { ...(src.conditions ?? {}) },
        equipment: src.equipment ? { ...src.equipment } : null,
    };
}

function targetBusyFor(cfg, b, hit) {
    if (!hit) return 0;
    const rawSkill = b.skills?.[cfg.skill] ?? 300;
    const rawDodge = b.skills?.dodge ?? 300;
    const effSkill = name => {
        const raw = b.skills?.[name] ?? 300;
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? (b.skills?.[mapped] ?? 0) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'ap40-2': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 40) + 2;
        }
        case 'ap40-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 40) + 1;
        }
        case 'ap36-1': {
            const ap = rawSkill + Math.trunc(rawDodge / 2);
            return Math.trunc(ap / 36) + 1;
        }
        case 'skill26-2': return Math.trunc(rawSkill / 26) + 2;
        case 'skill-random-26': return 2 + Math.trunc(rawSkill / 26) - 1;
        case 'skill-random-24': return 2 + Math.trunc(rawSkill / 24) - 1;
        case 'strike18-1': return 1 + Math.trunc(effSkill('strike') / 18);
        case 'cuff22': return Math.trunc(effSkill('cuff') / 22);
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, palm2Only = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b14Schools[`${p.skill}/${p.ability}`];
    const before = [state(p, 0), state(p, 1)];
    const raw = {
        kind: 'sample', condition_id: c.id, method: c.method, index: 0,
        outcome: p.expected, elapsed: 0.01, before,
        immediate: structuredClone(before), after: structuredClone(before),
        metrics: [{}, {}], actions: [], attacks: [], passives: [], defenses: [],
        dodge_checks: [], interfaces: [], callbacks: [], dropped: [], terminals: [],
        launches: [], refusals: [], directs: [], reason: '',
    };
    const b = raw.immediate[0], v = raw.immediate[1];
    if (!accepted) {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: before[0].object, reason: p.refusal }];
        raw.after = structuredClone(raw.immediate);
        return raw;
    }
    raw.launches = [{ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' }];
    const real = !!p.actor.properties?.['real_perform/poyang-jian/long'];
    const backlashHit = p.variant === 'backlash';
    if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? cfg.feeHit : cfg.feeMiss;
        b.neili -= fee;
        b.busy = hit ? (cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0) : (cfg.meBusyMiss ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = targetBusyFor(cfg, b, hit);
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = directs ?? (hit ? cfg.multiDirects : 0);
        const [h1, m1] = cfg.feePalm1, [h2, m2] = cfg.feePalm2;
        let fee;
        if (n === 2) fee = h1 + h2;
        else if (n === 1 && palm2Only) fee = m1 + h2;
        else if (n === 1) fee = h1 + m2;
        else fee = m1 + m2;
        b.neili -= fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: fee, direct: n };
        let qi = v.qi;
        for (let i = 0; i < n; i++) {
            const dmg = input;
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: dmg });
            qi = Math.max(1, qi - dmg);
        }
        v.qi = qi;
    } else if (cfg.kind === 'direct') {
        const fee = backlashHit ? cfg.feeHit
            : cfg.unconditionalFee ? (cfg.feeHit ?? 0)
                : hit ? ((real && cfg.feeHitReal) ? cfg.feeHitReal : cfg.feeHit ?? 0)
                    : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        const useReal = real && hit;
        const busyMin = hit ? (useReal ? (cfg.hitBusyMinReal ?? cfg.hitBusyMin ?? cfg.hitBusy)
            : (cfg.hitBusyMin ?? cfg.hitBusy)) : (cfg.missBusyMin ?? cfg.missBusy);
        b.busy = cfg.meBusy ?? busyMin ?? 0;
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (backlashHit) {
            b.qi = Math.max(1, b.qi - 50);
            b.conditions = { ...(b.conditions ?? {}), xuanming_poison: { level: 1, id: 'right', duration: 1 } };
        } else if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const percent = real && cfg.percentReal ? cfg.percentReal : cfg.percent;
            const support = b14Support(input, percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacksMax;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        // Source adds +bonus on hit but subtracts bonus unconditionally.
        if (cfg.comboHitBonus) {
            b.temp.apply = { ...(b.temp.apply ?? {}) };
            b.temp.apply.attack = (b.temp.apply.attack ?? 0) - cfg.comboHitBonus;
        }
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

// Reuse slice2 support by importing the helper through the schools module path.
import { slice2SupportSet } from './school_slice2_cases.mjs';
function b14Support(input, percent, actor, target, directType) {
    return slice2SupportSet(input, percent, actor, target, directType);
}

test('B14 批量矩阵：22 招/115 条件、kind 分发 direct 8/combo 5/control 8/multi 1，ID 与 families 契约', () => {
    assert.equal(cases.length, 115, 'conditions 115');
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b14-[a-z]/i, '条件 ID 使用 b14- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b14-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['嵩山派', '玄冥谷'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b14SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 8);
    assert.equal(kinds.control, 8);
    assert.equal(kinds.combo, 5);
    assert.equal(kinds.multi, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b14-hanbing-zhang-hen-baseline-l300'));
    assert.ok(ids.includes('b14-chuanyue-jian-hao-baseline-l300'));
    assert.ok(ids.includes('b14-xuanming-zhang-lang-baseline-l300'));
    assert.ok(ids.includes('b14-hexing-bifa-dian-baseline-l300'));
    assert.ok(ids.includes('b14-poyang-jian-long-real-perform'));
    assert.ok(ids.includes('b14-xuanming-zhang-zhe-backlash'));
    assert.ok(ids.includes('b14-hanbing-zhang-hen-target-busy'));
    assert.ok(ids.includes('b14-piaofeng-quan-juan-target-busy'));
    assert.deepEqual(cases.find(x => x.id === 'b14-hanbing-zhang-hen-baseline-l300').parameters.families,
        ['嵩山派']);
    assert.deepEqual(cases.find(x => x.id === 'b14-xuanming-zhang-zhe-baseline-l300').parameters.families,
        ['玄冥谷']);
});

test('B14 来源钉住真实字节', () => {
    for (const path of b14SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b14SourcePaths.every(p => !p.includes('..')));
    assert.match(b14ReviewedSourceHash, /^[a-f0-9]{64}$/);
    const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
    assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b14ReviewedSourceHash);
});

test('direct 契约：极天寒掌与破山斧与剑气冲霄费用与忙乱窗口', () => {
    const han = cases.find(x => x.id === 'b14-hanbing-zhang-han-baseline-l300');
    const hh = trace(han, { input: 120 });
    validateB14Record(hh, han);
    assert.equal(hh.before[0].neili - hh.immediate[0].neili, 220);
    const hm = trace(han, { hit: false });
    validateB14Record(hm, han);
    assert.equal(hm.before[0].neili - hm.immediate[0].neili, 120);
    const po = cases.find(x => x.id === 'b14-songshan-zhang-po-baseline-l300');
    const ph = trace(po, { input: 80 });
    validateB14Record(ph, po);
    assert.equal(ph.before[0].neili - ph.immediate[0].neili, 100);
    const pm = trace(po, { hit: false });
    validateB14Record(pm, po);
    assert.equal(pm.before[0].neili - pm.immediate[0].neili, 30);
    const xiao = cases.find(x => x.id === 'b14-lingyun-jian-xiao-baseline-l300');
    const xh = trace(xiao, { input: 200 });
    validateB14Record(xh, xiao);
    assert.equal(xh.before[0].neili - xh.immediate[0].neili, 200);
});

test('direct 契约：天外玉龙 real_perform 两模式费用与百分比', () => {
    const c = cases.find(x => x.id === 'b14-poyang-jian-long-baseline-l300');
    const hit = trace(c, { input: 150 });
    validateB14Record(hit, c);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 220);
    const real = cases.find(x => x.id === 'b14-poyang-jian-long-real-perform');
    const rh = trace(real, { input: 150 });
    validateB14Record(rh, real);
    assert.equal(rh.before[0].neili - rh.immediate[0].neili, 300);
    const rm = trace(real, { hit: false });
    validateB14Record(rm, real);
    assert.equal(rm.before[0].neili - rm.immediate[0].neili, 150);
});

test('direct 契约：只手遮天反噬分支自伤并自中寒毒', () => {
    const c = cases.find(x => x.id === 'b14-xuanming-zhang-zhe-backlash');
    const t = trace(c);
    validateB14Record(t, c);
    assert.equal(t.before[0].neili - t.immediate[0].neili, 300);
    assert.ok(t.immediate[0].conditions?.xuanming_poison, 'self poison');
    assert.equal((t.directs ?? []).length, 0, 'no do_damage on backlash');
});

test('multi 契约：惊涛骇浪两掌分段扣费', () => {
    const c = cases.find(x => x.id === 'b14-xuanming-zhang-lang-baseline-l300');
    const both = trace(c, { input: 100, directs: 2 });
    validateB14Record(both, c);
    assert.equal(both.before[0].neili - both.immediate[0].neili, 350);
    const one = trace(c, { input: 80, directs: 1 });
    validateB14Record(one, c);
    assert.equal(one.before[0].neili - one.immediate[0].neili, 150 + 100);
    const none = trace(c, { hit: false });
    validateB14Record(none, c);
    assert.equal(none.before[0].neili - none.immediate[0].neili, 75 + 100);
});

test('control 契约：踏雪无痕 ap/40+2 与卷字决 cuff/22 忙乱', () => {
    const hen = cases.find(x => x.id === 'b14-hanbing-zhang-hen-baseline-l300');
    const hh = trace(hen, { hit: true });
    validateB14Record(hh, hen);
    assert.equal(hh.before[0].neili - hh.immediate[0].neili, 100);
    assert.equal(hh.immediate[1].busy, targetBusyFor(b14Schools['hanbing-zhang/hen'], hh.immediate[0], true));
    const hm = trace(hen, { hit: false });
    validateB14Record(hm, hen);
    assert.equal(hm.before[0].neili - hm.immediate[0].neili, 30);
    const juan = cases.find(x => x.id === 'b14-piaofeng-quan-juan-baseline-l300');
    const jh = trace(juan, { hit: true });
    validateB14Record(jh, juan);
    assert.equal(jh.before[0].neili - jh.immediate[0].neili, 40);
});

test('combo 契约：千掌环与内点乾坤按攻击次数扣费', () => {
    const qian = cases.find(x => x.id === 'b14-yinyang-zhang-qian-baseline-l300');
    const qt = trace(qian, { attacks: 4, planned: 4, busy: 3 });
    validateB14Record(qt, qian);
    assert.equal(qt.before[0].neili - qt.immediate[0].neili, 80);
    const dian = cases.find(x => x.id === 'b14-hexing-bifa-dian-baseline-l300');
    const dt = trace(dian, { attacks: 5, planned: 5, busy: 2 });
    validateB14Record(dt, dian);
    assert.equal(dt.before[0].neili - dt.immediate[0].neili, 150);
});

test('特殊约束分支：目标忙乱拒绝', () => {
    for (const id of ['b14-hanbing-zhang-hen-target-busy', 'b14-piaofeng-quan-juan-target-busy',
        'b14-jingyue-bifa-ci-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB14Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b14-hanbing-zhang-han-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB14Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b14Effects(rows, c);
    assert.equal(e.samples, 2);
    assert.equal(e.counts.error, 1);
    assert.equal(e.accepted.successes, 1);
});

const ansiMacros = ['HIM', 'NOR', 'HIG', 'HIR', 'HIY', 'HIC', 'HIW', 'CYN', 'YEL', 'GRN',
    'BLU', 'MAG', 'WHT', 'RED', 'HBRED', 'HBWHT', 'HBYEL', 'HBGRN', 'HBBLU', 'HBCYN',
    'HBMAG', 'HBBLK', 'BLK', 'BBLU', 'BRED', 'BGRN', 'BYEL', 'BCYN', 'BMAG', 'BBLK',
    'U', 'BLI', 'REV', 'HBU', 'BEEP'];

function sourceRefusals(path) {
    const src = readFileSync(path, 'utf8');
    const defs = Object.fromEntries(ansiMacros.map(n => [n, '""']));
    for (const line of src.split('\n')) {
        const m = line.match(/^#define\s+(\w+)\s+(.+)$/);
        if (m && m[2].includes('"')) defs[m[1]] = m[2];
    }
    const expand = expr => {
        let out = expr;
        for (let guard = 0; guard < 30; guard++) {
            let changed = false;
            out = out.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (all, name) => {
                if (defs[name] !== undefined && defs[name].includes('"')) {
                    changed = true;
                    return '(' + defs[name] + ')';
                }
                return all;
            });
            if (!changed) break;
        }
        return out;
    };
    const literal = text => {
        const parts = [...text.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
        let s = parts.join('');
        s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        return s.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
    };
    return [...src.matchAll(/notify_fail\(([\s\S]*?)\);/g)].map(x => literal(expand(x[1])));
}

test('拒绝文本与原 notify_fail 逐字节一致，含特殊约束分支', () => {
    const specials = {
        'hanbing-zhang/hen': ['目前正自顾不暇，放胆攻击吧'],
        'poyang-jian/xian': ['目前正自顾不暇，放胆攻击吧'],
        'yinyang-zhang/qian': ['目前正自顾不暇，放胆攻击吧'],
        'songshan-jian/meng': ['目前正自顾不暇，放胆攻击吧'],
        'songyang-zhang/ying': ['目前正自顾不暇，放胆攻击吧'],
        'xuanming-zhang/ying': ['目前正自顾不暇，放胆攻击吧'],
        'dulong-shenzhua/bao': ['目前正自顾不暇，放胆攻击吧'],
        'piaofeng-quan/juan': ['目前正自顾不暇，放胆攻击吧'],
        'jingyue-bifa/ci': ['目前正自顾不暇，放胆攻击吧'],
    };
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b14Schools)) {
        const texts = sourceRefusals(abilityFile(cfg));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
        for (const s of specials[key] ?? []) {
            checked++;
            assert.ok(texts.some(t => t.includes(s)), `${key} special refusal matches source`);
        }
    }
    assert.ok(checked >= 40);
});
