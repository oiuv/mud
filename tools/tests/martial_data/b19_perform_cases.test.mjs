import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { b19SourcePaths, b19ReviewedSourceHash, b19PerformConditions, validateB19Record,
    b19Effects, b19Schools } from './b19_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b19PerformConditions(catalog, read);
const smoke = b19PerformConditions(catalog, read, { smoke: true });

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
        case 'finger20-2': return Math.trunc(effSkill('finger') / 20) + 2;
        case 'never45-2': return Math.trunc((Math.trunc((b.skills?.['never-defeated'] ?? 0) * 3 / 2) + (b.skills?.['martial-cognize'] ?? 0)) / 45) + 2;
        case 'tianyu23-1': return Math.trunc((b.skills?.['tianyu-qijian'] ?? 0) / 23) + 1;
        case 'dagger25-2': return Math.trunc(effSkill('dagger') / 25) + 2;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null,
    directs = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b19Schools[`${p.skill}/${p.ability}`];
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
        if (hit) v.busy = typeof cfg.targetBusyOnHit === 'number' ? cfg.targetBusyOnHit : targetBusyFor(cfg, b, hit);
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = directs ?? (hit ? cfg.multiDirects : 0);
        const fee = cfg.fee ?? cfg.feeMin ?? 0;
        b.neili -= fee;
        b.busy = cfg.hitBusyMin;
        raw.metrics[0] = { neili_cost: fee, direct: n };
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
        if (cfg.specialBusy === 'lei') {
            b.neili -= cfg.fee;
            b.busy = cfg.meBusyMin;
            raw.metrics[0] = { neili_cost: cfg.fee };
            if (hit) {
                v.qi = Math.max(1, v.qi - input);
            }
        } else if (cfg.specialBusy === 'chang3') {
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
        if (cfg.shenCost) b.shen -= cfg.shenCost;
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
                if (cfg.targetBusyOnHit === 'random3') v.busy = 1;
                else if (cfg.targetBusyOnHit === 'random13') v.busy = 2;
                else v.busy = typeof cfg.targetBusyOnHit === 'number'
                    ? cfg.targetBusyOnHit : targetBusyFor(cfg, b, true);
            }
        }
    } else if (cfg.kind === 'special') {
        b.learned = { [p.skill]: 1 };
        if (cfg.specialBusy === 'lei') {
            b.neili -= cfg.fee;
            b.busy = cfg.meBusyMin;
            raw.metrics[0] = { neili_cost: cfg.fee };
            if (hit) {
                v.qi = Math.max(1, v.qi - input);
            }
        }
    } else if (cfg.kind === 'receive') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.max(1, v.eff_qi - Math.trunc(input / 2));
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

test('B19 batch matrix', () => {
    assert.ok(cases.length >= 60);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b19-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b19-perform');
        assert.ok(['武当派','大理段家','侠客岛','侠客盟'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-'+c.parameters.kind] = (kinds['bl-'+c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 8);
    assert.ok((kinds['bl-control'] ?? 0) >= 3);
    assert.ok((kinds['bl-combo'] ?? 0) >= 4);
    assert.ok((kinds['bl-multi'] ?? 0) >= 2);
    assert.ok((kinds['bl-receive'] ?? 0) >= 1);
    assert.ok((kinds['bl-special'] ?? 0) >= 1);
    assert.ok((kinds['bl-throwing'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['zhenshan-zhang-da','wudang-jian-sheng','yitian-zhang-zheng','shenmen-jian-ci','xuanxu-dao-huan','raozhi-roujian-chuan','huzhua-shou-juehu','huoyan-dao-fen','huoyan-dao-yan','sun-finger-dian','liumai-shenjian-qi','liumai-shenjian-six','liumai-shenjian-zong','taixuan-gong-hun','taixuan-gong-jing','taixuan-gong-po','taixuan-gong-xuan','jinwu-daofa-chi','never-defeated-lei','never-defeated-po','never-defeated-tianhua','never-defeated-wanli','never-defeated-yuce'])
        assert.ok(ids.includes('b19-'+sk+'-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b19-zhenshan-zhang-da-baseline-l300').parameters.families, ['武当派']);
    assert.deepEqual(cases.find(x => x.id === 'b19-huoyan-dao-fen-baseline-l300').parameters.families, ['大理段家']);
    assert.deepEqual(cases.find(x => x.id === 'b19-taixuan-gong-hun-baseline-l300').parameters.families, ['侠客岛']);
    assert.deepEqual(cases.find(x => x.id === 'b19-never-defeated-lei-baseline-l300').parameters.families, ['侠客盟']);
});

test('B19 source bytes pinned', () => {
    for (const p of b19SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b19SourcePaths.every(p => !p.includes('..')));
});

test('B19 gates and families', () => {
    for (const [key, cfg] of Object.entries(b19Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === cfg.skill + '/' + ak);
        assert.equal(base?.path, 'kungfu/skill/' + cfg.skill + '.c', key);
        assert.equal(ability?.path, 'kungfu/skill/' + cfg.skill + '/' + ak + '.c', key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b19Schools['raozhi-roujian/chuan'].grant, 'can_perform/raozhi-roujian/chuankong');
    assert.equal(b19Schools['taixuan-gong/hun'].abilityPath, 'perform/hun');
    assert.equal(b19Schools['never-defeated/lei'].abilityPath, 'perform/lei');
});

test('B19 contract shape', () => {
    for (const [key, cfg] of Object.entries(b19Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
            assert.ok(!gate.refusal.includes(''), key);
        }
    }
});

test('B19 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB19Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B19 effects', () => {
    const c = cases.find(x => x.id === 'b19-never-defeated-wanli-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b19Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B19 all 23 kind dispatchable', () => {
    for (const [key, cfg] of Object.entries(b19Schools)) {
        assert.ok(['direct','control','combo','multi','receive','throwing','special'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b19Schools).length, 23);
});