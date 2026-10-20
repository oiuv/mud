import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b16SourcePaths, b16ReviewedSourceHash, b16PerformConditions, validateB16Record,
    b16Effects, b16Schools } from './b16_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b16PerformConditions(catalog, read);
const smoke = b16PerformConditions(catalog, read, { smoke: true });

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
    const effSkill = name => {
        const raw = b.skills?.[name] ?? 0;
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? (b.skills?.[mapped] ?? 0) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'skill18-2': return Math.trunc(rawSkill / 18) + 2;
        case 'skill20-2': return Math.trunc(effSkill(cfg.skill) / 20) + 2;
        case 'claw25-2': {
            const rawClaw = b.skills?.claw ?? 300;
            return Math.trunc(rawClaw / 25) + 2;
        }
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null, death = false, disarm = false } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b16Schools[`${p.skill}/${p.ability}`];
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
        b.neili -= cfg.fee;
        b.busy = cfg.hitBusyMin;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
        let qi = v.qi;
        for (let i = 0; i < n; i++) {
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: input });
            qi = Math.max(1, qi - input);
        }
        v.qi = qi;
    } else if (cfg.kind === 'duo') {
        b.learned = { [p.skill]: 1 };
        const isMiss = !hit && !death && !disarm;
        const fee = isMiss ? cfg.feeMiss : cfg.feeHit;
        b.neili -= fee;
        b.busy = isMiss ? cfg.missBusy : cfg.hitBusyMin;
        raw.metrics[0] = { neili_cost: fee };
        if (death) {
            raw.terminals.push({ actor: 0, target: 1 });
            v.ghost = 1; v.living = 0;
        } else if (disarm) {
            v.busy = 2;
        } else if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else if (cfg.kind === 'throwing') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.max(1, v.eff_qi - input);
        }
    } else if (cfg.kind === 'direct') {
        const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
            : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        b.busy = hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacksMax ?? cfg.comboAttacks;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
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

import { slice2SupportSet } from './school_slice2_cases.mjs';

test('B16 批量矩阵：18 招条件、kind 分发 direct 10/combo 3/control 2/multi 1/duo 1/throwing 1，ID 与 families 契约', () => {
    assert.ok(cases.length >= 70, 'conditions at least 70, got ' + cases.length);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = { direct: 0, multi: 0, control: 0, combo: 0, duo: 0, throwing: 0 };
    for (const c of cases) {
        assert.match(c.id, /^b16-[a-z]/i, '条件 ID 使用 b16- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b16-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['中原苗家', '五毒教'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b16SourcePaths.includes(c.parameters.base_source.path));
        assert.ok(kinds[c.parameters.kind] !== undefined, 'known kind');
        if (c.id.endsWith('baseline-l300')) kinds[c.parameters.kind]++;
    }
    assert.equal(kinds.direct, 10);
    assert.equal(kinds.control, 2);
    assert.equal(kinds.combo, 3);
    assert.equal(kinds.multi, 1);
    assert.equal(kinds.duo, 1);
    assert.equal(kinds.throwing, 1);
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b16-miaojia-zhang-dan-baseline-l300'));
    assert.ok(ids.includes('b16-pobei-tui-kai-baseline-l300'));
    assert.ok(ids.includes('b16-tianlong-jian-zhui-baseline-l300'));
    assert.ok(ids.includes('b16-miaojia-jian-zhai-baseline-l300'));
    assert.ok(ids.includes('b16-ruanhong-zhusuo-pan-baseline-l300'));
    assert.ok(ids.includes('b16-jinwu-goufa-duo-baseline-l300'));
    assert.ok(ids.includes('b16-hansha-sheying-zhen-baseline-l300'));
    assert.ok(ids.includes('b16-tianchan-zhang-chan-baseline-l300'));
    assert.ok(ids.includes('b16-jinwu-goufa-duo-instant-kill'));
    assert.ok(ids.includes('b16-jinwu-goufa-duo-disarm'));
    assert.ok(ids.includes('b16-miaojia-jian-zhai-target-busy'));
    assert.ok(ids.includes('b16-ruanhong-zhusuo-pan-target-busy'));
    assert.deepEqual(cases.find(x => x.id === 'b16-miaojia-zhang-dan-baseline-l300').parameters.families,
        ['中原苗家']);
    assert.deepEqual(cases.find(x => x.id === 'b16-ruanhong-zhusuo-pan-baseline-l300').parameters.families,
        ['五毒教']);
});

test('B16 来源钉住真实字节', () => {
    for (const path of b16SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b16SourcePaths.every(p => !p.includes('..')));
    if (b16ReviewedSourceHash !== 'PENDING') {
        assert.match(b16ReviewedSourceHash, /^[a-f0-9]{64}$/);
        const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
        assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b16ReviewedSourceHash);
    }
});

test('direct 契约：丹阳劲无条件费用与翅展九州两段费用', () => {
    const dan = cases.find(x => x.id === 'b16-miaojia-zhang-dan-baseline-l300');
    const dh = trace(dan, { input: 120 });
    validateB16Record(dh, dan);
    assert.equal(dh.before[0].neili - dh.immediate[0].neili, 30);
    const dm = trace(dan, { hit: false });
    validateB16Record(dm, dan);
    assert.equal(dm.before[0].neili - dm.immediate[0].neili, 30, 'unconditional fee');
    const zhan = cases.find(x => x.id === 'b16-chongtian-zhang-zhan-baseline-l300');
    const zh = trace(zhan, { input: 80 });
    validateB16Record(zh, zhan);
    assert.equal(zh.before[0].neili - zh.immediate[0].neili, 150);
    const zm = trace(zhan, { hit: false });
    validateB16Record(zm, zhan);
    assert.equal(zm.before[0].neili - zm.immediate[0].neili, 50);
});

test('direct 契约：黄龙吐珠与残阳劲与搏虎诀分支费用', () => {
    const zhu = cases.find(x => x.id === 'b16-miaojia-jian-zhu-baseline-l300');
    const zh = trace(zhu, { input: 150 });
    validateB16Record(zh, zhu);
    assert.equal(zh.before[0].neili - zh.immediate[0].neili, 150);
    const zm = trace(zhu, { hit: false });
    validateB16Record(zm, zhu);
    assert.equal(zm.before[0].neili - zm.immediate[0].neili, 50);
    const can = cases.find(x => x.id === 'b16-suqin-beijian-can-baseline-l300');
    const ch = trace(can, { input: 90 });
    validateB16Record(ch, can);
    assert.equal(ch.before[0].neili - ch.immediate[0].neili, 30);
    const cm = trace(can, { hit: false });
    validateB16Record(cm, can);
    assert.equal(cm.before[0].neili - cm.immediate[0].neili, 20);
    const bohu = cases.find(x => x.id === 'b16-ruanhong-zhusuo-bohu-baseline-l300');
    const bh = trace(bohu, { input: 100 });
    validateB16Record(bh, bohu);
    assert.equal(bh.before[0].neili - bh.immediate[0].neili, 300);
    const bm = trace(bohu, { hit: false });
    validateB16Record(bm, bohu);
    assert.equal(bm.before[0].neili - bm.immediate[0].neili, 100);
});

test('multi 契约：毒龙双锥无条件费用', () => {
    const zhui = cases.find(x => x.id === 'b16-tianlong-jian-zhui-baseline-l300');
    const both = trace(zhui, { input: 80, directs: 2 });
    validateB16Record(both, zhui);
    assert.equal(both.before[0].neili - both.immediate[0].neili, 350);
    const one = trace(zhui, { input: 50, directs: 1 });
    validateB16Record(one, zhui);
    assert.equal(one.before[0].neili - one.immediate[0].neili, 350);
    const none = trace(zhui, { hit: false });
    validateB16Record(none, zhui);
    assert.equal(none.before[0].neili - none.immediate[0].neili, 350);
});

test('control 契约：云边摘月与盘鹰诀忙乱', () => {
    const zhai = cases.find(x => x.id === 'b16-miaojia-jian-zhai-baseline-l300');
    const zh = trace(zhai, { hit: true });
    validateB16Record(zh, zhai);
    assert.equal(zh.before[0].neili - zh.immediate[0].neili, 30);
    assert.equal(zh.immediate[1].busy, targetBusyFor(b16Schools['miaojia-jian/zhai'], zh.immediate[0], true));
    const zm = trace(zhai, { hit: false });
    validateB16Record(zm, zhai);
    assert.equal(zm.before[0].neili - zm.immediate[0].neili, 30);
    const pan = cases.find(x => x.id === 'b16-ruanhong-zhusuo-pan-baseline-l300');
    const ph = trace(pan, { hit: true });
    validateB16Record(ph, pan);
    assert.equal(ph.before[0].neili - ph.immediate[0].neili, 0, 'no fee');
    const pm = trace(pan, { hit: false });
    validateB16Record(pm, pan);
    assert.equal(pm.before[0].neili - pm.immediate[0].neili, 0);
});

test('combo 契约：五岳为开与剑舞千秋与锁龙诀按攻击扣费', () => {
    const kai = cases.find(x => x.id === 'b16-pobei-tui-kai-baseline-l300');
    const kt = trace(kai, { attacks: 4, planned: 4, busy: 2 });
    validateB16Record(kt, kai);
    assert.equal(kt.before[0].neili - kt.immediate[0].neili, 100);
    const qian = cases.find(x => x.id === 'b16-miaojia-jian-qian-baseline-l300');
    const qt = trace(qian, { attacks: 8, planned: 8, busy: 4 });
    validateB16Record(qt, qian);
    assert.equal(qt.before[0].neili - qt.immediate[0].neili, 200);
    const suo = cases.find(x => x.id === 'b16-ruanhong-zhusuo-suo-baseline-l300');
    const st = trace(suo, { attacks: 6, planned: 6, busy: 3 });
    validateB16Record(st, suo);
    assert.equal(st.before[0].neili - st.immediate[0].neili, 120);
});

test('duo 契约：金钩夺魄三分支', () => {
    const duo = cases.find(x => x.id === 'b16-jinwu-goufa-duo-baseline-l300');
    const hit = trace(duo, { input: 200 });
    validateB16Record(hit, duo);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 250);
    const missC = cases.find(x => x.id === 'b16-jinwu-goufa-duo-miss');
    const miss = trace(missC, { hit: false });
    validateB16Record(miss, missC);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 50);
    const killC = cases.find(x => x.id === 'b16-jinwu-goufa-duo-instant-kill');
    const kill = trace(killC, { death: true });
    validateB16Record(kill, killC);
    const disarmC = cases.find(x => x.id === 'b16-jinwu-goufa-duo-disarm');
    const disarm = trace(disarmC, { disarm: true });
    validateB16Record(disarm, disarmC);
});

test('throwing 契约：无影针费用与忙乱', () => {
    const zhen = cases.find(x => x.id === 'b16-hansha-sheying-zhen-baseline-l300');
    const hit = trace(zhen, { input: 80, hit: true });
    validateB16Record(hit, zhen);
    assert.equal(hit.before[0].neili - hit.immediate[0].neili, 100);
    assert.equal(hit.immediate[0].busy, 2);
    const miss = trace(zhen, { hit: false });
    validateB16Record(miss, zhen);
    assert.equal(miss.before[0].neili - miss.immediate[0].neili, 100);
});

test('特殊约束分支：目标忙乱拒绝', () => {
    for (const id of ['b16-miaojia-jian-zhai-target-busy', 'b16-ruanhong-zhusuo-pan-target-busy']) {
        const c = cases.find(x => x.id === id);
        assert.equal(c.parameters.expected, 'refused');
        validateB16Record(trace(c), c);
    }
});

test('错误样本豁免与 effects 汇总分母独立', () => {
    const c = cases.find(x => x.id === 'b16-miaojia-zhang-dan-baseline-l300');
    const err = trace(c); err.outcome = 'error'; err.reason = 'driver interruption';
    assert.equal(validateB16Record(err, c), null);
    const rows = [
        { condition_id: c.id, index: 0, outcome: 'observed', raw: trace(c) },
        { condition_id: c.id, index: 1, outcome: 'error', raw: err },
    ];
    const e = b16Effects(rows, c);
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

test('拒绝文本与原 notify_fail 逐字节一致', () => {
    const abilityFile = cfg => {
        const key = cfg.abilityPath ?? cfg.ability;
        return join(root, 'kungfu/skill', cfg.skill, key + '.c');
    };
    let checked = 0;
    for (const [key, cfg] of Object.entries(b16Schools)) {
        const texts = sourceRefusals(abilityFile(cfg));
        for (const gate of cfg.gates) {
            checked++;
            assert.ok(texts.includes(gate.refusal), `${key}/${gate.key} refusal matches source`);
        }
    }
    assert.ok(checked >= 30);
});
