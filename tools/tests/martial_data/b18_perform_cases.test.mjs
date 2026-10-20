import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b18SourcePaths, b18ReviewedSourceHash, b18PerformConditions, validateB18Record,
    b18Effects, b18Schools } from './b18_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b18PerformConditions(catalog, read);
const smoke = b18PerformConditions(catalog, read, { smoke: true });

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
    const effSkill = name => {
        const raw = b.skills?.[name] ?? 0;
        const mapped = b.mappings?.[name];
        return Math.trunc(raw / 2) + (mapped ? (b.skills?.[mapped] ?? 0) : 0);
    };
    switch (cfg.targetBusyFormula) {
        case 'throwing80-2': return Math.trunc(effSkill('throwing') / 80) + 2;
        case 'hand100-2': {
            const qdex = (b.dex ?? 0) + Math.trunc((b.skills?.dodge ?? 0) / 10) + (b.temp?.apply?.dex ?? 0);
            return Math.trunc((effSkill('hand') + qdex * 10) / 100) + 2;
        }
        case 'tianyu23-1': return Math.trunc((b.skills?.['tianyu-qijian'] ?? 0) / 23) + 1;
        case 'dagger25-2': return Math.trunc(effSkill('dagger') / 25) + 2;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b18Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.kind === 'buff') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = cfg.fee < 0
            ? { neili_recovery: -cfg.fee }
            : { neili_cost: cfg.fee };
        const delta = cfg.buffApplyDelta ?? 1;
        b.temp[cfg.buff] = (b.temp[cfg.buff] ?? 0) + delta;
        b.temp.apply = { ...(b.temp.apply ?? {}) };
        for (const key of cfg.buffApplyKeys ?? ['attack'])
            b.temp.apply[key] = (b.temp.apply[key] ?? 0) + delta;
    } else if (cfg.kind === 'control') {
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
    } else if (cfg.kind === 'throwing') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy !== undefined ? cfg.meBusy
            : hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.max(1, v.eff_qi - input);
            if (cfg.targetBusyFormula) v.busy = targetBusyFor(cfg, b, hit);
        } else if (cfg.targetBusyFormula) {
            // miss branch may drain target neili (tangmen throwing)
            v.neili = Math.max(0, v.neili - 1000);
        }
    } else if (cfg.kind === 'special') {
        b.learned = { [p.skill]: 1 };
        if (cfg.specialBusy === 'chang3') {
            const fee = cfg.feeMin;
            b.neili -= fee;
            b.qi -= cfg.selfQiCost;
            b.busy = cfg.meBusyMin;
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                v.qi = Math.max(1, v.qi - input);
                v.jing = Math.max(1, v.jing - input);
            }
        } else if (cfg.crush) {
            b.neili -= cfg.fee;
            b.busy = cfg.hitBusyMin;
            raw.metrics[0] = { neili_cost: cfg.fee };
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            }
        } else if (cfg.specialBusy === 'wu') {
            b.neili -= cfg.fee;
            b.busy = cfg.meBusy;
            raw.metrics[0] = { neili_cost: cfg.fee };
            if (hit) {
                v.busy = 5;
                b.qi = Math.max(1, b.qi - 200);
                b.jing = Math.max(1, b.jing - 80);
            }
        } else if (cfg.specialBusy === 'yin') {
            const fee = hit ? cfg.feeHit : cfg.feeMiss;
            b.neili -= fee;
            b.busy = cfg.meBusy;
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                v.jing = Math.max(1, v.jing - input);
                v.eff_jing = Math.max(1, v.eff_jing - input / 3);
            }
        }
    } else if (cfg.kind === 'direct') {
        const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
            : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
        b.neili -= fee;
        b.busy = cfg.meBusy !== undefined ? cfg.meBusy
            : hit ? (cfg.hitBusyMin ?? cfg.hitBusy) : (cfg.missBusyMin ?? cfg.missBusy);
        b.learned = { [p.skill]: 1 };
        raw.metrics[0] = { neili_cost: fee };
        if (hit) {
            if (cfg.receiveOnly) {
                v.qi = Math.max(1, v.qi - input);
                v.eff_qi = Math.max(1, v.eff_qi - Math.trunc(input / 2));
            } else {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
            }
            if (cfg.poison) v.conditions = { ...(v.conditions ?? {}), [cfg.poison]: 1 };
            if (cfg.targetBusyOnHit !== undefined) {
                v.busy = typeof cfg.targetBusyOnHit === 'number'
                    ? cfg.targetBusyOnHit : targetBusyFor(cfg, b, true);
            }
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacks;
        const plan = planned ?? n;
        const fee = cfg.feePerAttack ? plan * cfg.feePerAttack : cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

import { slice2SupportSet } from './school_slice2_cases.mjs';

test('B18 批量矩阵：28 招条件、kind 分发，ID 与 families 契约', () => {
    assert.ok(cases.length >= 70, 'conditions at least 70, got ' + cases.length);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b18-[a-z]/i, '条件 ID 使用 b18- 前缀');
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.observation, 'single_action_immediate');
        assert.equal(c.parameters.collection_group, 'b18-perform');
        assert.ok(Array.isArray(c.parameters.families) && c.parameters.families.length >= 1);
        assert.ok(['唐门世家', '灵鹫宫', '梅庄', '神龙教'].includes(c.parameters.families[0]));
        assert.equal(c.parameters.not_applicable, '');
        assert.ok(b18SourcePaths.includes(c.parameters.base_source.path));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300'))
            kinds['baseline-' + c.parameters.kind] = (kinds['baseline-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['baseline-direct'] ?? 0) >= 6, 'direct baselines');
    assert.ok((kinds['baseline-control'] ?? 0) >= 2, 'control baselines');
    assert.ok((kinds['baseline-combo'] ?? 0) >= 5, 'combo baselines');
    assert.ok((kinds['baseline-multi'] ?? 0) >= 1, 'multi baselines');
    assert.ok((kinds['baseline-throwing'] ?? 0) >= 5, 'throwing baselines');
    assert.ok((kinds['baseline-buff'] ?? 0) >= 2, 'buff baselines');
    assert.ok((kinds['baseline-special'] ?? 0) >= 4, 'special baselines');
    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('b18-tangmen-throwing-biao-baseline-l300'));
    assert.ok(ids.includes('b18-tangmen-throwing-qian-baseline-l300'));
    assert.ok(ids.includes('b18-tangmen-throwing-san-baseline-l300'));
    assert.ok(ids.includes('b18-boyun-suowu-dian-baseline-l300'));
    assert.ok(ids.includes('b18-boyun-suowu-meng-baseline-l300'));
    assert.ok(ids.includes('b18-qiulin-shiye-wu-baseline-l300'));
    assert.ok(ids.includes('b18-wuzhan-mei-liu-baseline-l300'));
    assert.ok(ids.includes('b18-tianyu-qijian-huan-baseline-l300'));
    assert.ok(ids.includes('b18-tianyu-qijian-shan-baseline-l300'));
    assert.ok(ids.includes('b18-wudoumi-shengong-gui-baseline-l300'));
    assert.ok(ids.includes('b18-lansha-shou-po-baseline-l300'));
    assert.ok(ids.includes('b18-pidi-shenzhen-huan-baseline-l300'));
    assert.ok(ids.includes('b18-zhemei-shou-hai-baseline-l300'));
    assert.ok(ids.includes('b18-liuyang-zhang-po-baseline-l300'));
    assert.ok(ids.includes('b18-qixian-wuxingjian-yin-baseline-l300'));
    assert.ok(ids.includes('b18-qixian-wuxingjian-zhu-baseline-l300'));
    assert.ok(ids.includes('b18-shigu-bifa-feng-baseline-l300'));
    assert.ok(ids.includes('b18-shigu-bifa-shiyi-baseline-l300'));
    assert.ok(ids.includes('b18-jidian-jian-dian-baseline-l300'));
    assert.ok(ids.includes('b18-xuantian-zhi-bing-baseline-l300'));
    assert.ok(ids.includes('b18-fenglei-zifa-she-baseline-l300'));
    assert.ok(ids.includes('b18-shedao-qigong-cui-baseline-l300'));
    assert.ok(ids.includes('b18-shedao-qigong-fei-baseline-l300'));
    assert.ok(ids.includes('b18-shedao-qigong-chang1-baseline-l300'));
    assert.ok(ids.includes('b18-shedao-qigong-chang2-baseline-l300'));
    assert.ok(ids.includes('b18-shedao-qigong-chang3-baseline-l300'));
    assert.ok(ids.includes('b18-huagu-mianzhang-hua-baseline-l300'));
    assert.ok(ids.includes('b18-shenlong-bashi-xian-baseline-l300'));
    assert.deepEqual(cases.find(x => x.id === 'b18-tangmen-throwing-biao-baseline-l300').parameters.families,
        ['唐门世家']);
    assert.deepEqual(cases.find(x => x.id === 'b18-tianyu-qijian-huan-baseline-l300').parameters.families,
        ['灵鹫宫']);
    assert.deepEqual(cases.find(x => x.id === 'b18-qixian-wuxingjian-yin-baseline-l300').parameters.families,
        ['梅庄']);
    assert.deepEqual(cases.find(x => x.id === 'b18-shedao-qigong-cui-baseline-l300').parameters.families,
        ['神龙教']);
});

test('B18 来源钉住真实字节', () => {
    for (const path of b18SourcePaths) assert.equal(sha256(read(path)), cases[0].parameters.source_evidence[path], path);
    assert.ok(b18SourcePaths.every(p => !p.includes('..')));
    if (b18ReviewedSourceHash !== 'PENDING') {
        assert.match(b18ReviewedSourceHash, /^[a-f0-9]{64}$/);
        const digest = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
        assert.equal(digest(Object.entries(cases[0].parameters.source_evidence)), b18ReviewedSourceHash);
    }
});

test('B18 资格门与 families 销账', () => {
    for (const [key, cfg] of Object.entries(b18Schools)) {
        const abilityKey = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${abilityKey}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.equal(ability?.path, `kungfu/skill/${cfg.skill}/${abilityKey}.c`, key);
        assert.ok(cfg.gates.length >= 1, key + ' has gates');
        assert.ok(cfg.title && cfg.title.length, key + ' has title');
        assert.ok(cfg.families.length >= 1, key + ' has families');
    }
    // shedao-qigong/cui is gated by the xian grant key (source anomaly, kept as-is).
    assert.equal(b18Schools['shedao-qigong/cui'].grant, 'can_perform/shedao-qigong/xian');
    assert.equal(b18Schools['wudoumi-shengong/gui'].abilityPath, 'perform/gui');
    assert.equal(b18Schools['wudoumi-shengong/gui'].requirePowerup, true);
});

test('B18 契约形状：refusal 保留换行，门对成对', () => {
    for (const [key, cfg] of Object.entries(b18Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key + ' gate pair');
            assert.equal(gate.pair[1] - gate.pair[0], 1, key + ' adjacent pair');
            assert.ok(gate.refusal.endsWith('\n'), key + ' refusal newline');
            assert.ok(!/\x1b/.test(gate.refusal), key + ' refusal has no raw ansi');
        }
    }
});

test('B18 拒绝与观察样本可通过契约校验', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB18Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B18 直伤/控制/连击/暗器效果分布', () => {
    const rows = [];
    for (const c of cases.filter(x => x.id === 'b18-lansha-shou-po-baseline-l300')) {
        rows.push({ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' });
    }
    const c = cases.find(x => x.id === 'b18-lansha-shou-po-baseline-l300');
    const e = b18Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B18 全部 28 招 entry 与 kind 可分发', () => {
    for (const [key, cfg] of Object.entries(b18Schools)) {
        assert.ok(['direct', 'control', 'combo', 'multi', 'throwing', 'buff', 'special']
            .includes(cfg.kind), key + ' kind ' + cfg.kind);
    }
    assert.equal(Object.keys(b18Schools).length, 28);
});
