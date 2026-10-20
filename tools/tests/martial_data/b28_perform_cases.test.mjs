import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b28SourcePaths, b28ReviewedSourceHash, b28PerformConditions, validateB28Record,
    b28Effects, b28Schools
} from './b28_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b28PerformConditions(catalog, read);
const smoke = b28PerformConditions(catalog, read, { smoke: true });

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

function effSkill(b, name) {
    const raw = b.skills[name] ?? 0;
    const mapped = b.mappings?.[name];
    return mapped ? Math.trunc(raw / 2) + (b.skills[mapped] ?? 0) : Math.trunc(raw / 2);
}

function targetBusyFor(cfg, b) {
    const t = cfg.targetBusy;
    if (t.useAp) {
        let ap = 0;
        for (const [name, coef] of cfg.apSkills ?? []) {
            const v = cfg.useEffectiveAp ? effSkill(b, name) : (b.skills[name] ?? 0);
            ap += v * coef;
        }
        return Math.trunc(ap / t.div) + (t.add ?? 0);
    }
    const name = t.skill ?? t.useSkill ?? cfg.skill;
    const level = t.useEffective ? effSkill(b, name) : (b.skills[name] ?? 0);
    return Math.trunc(level / t.div) + (t.add ?? 0);
}

function trace(c, { hit = true, fee: feeOverride = null, specialBranch = 'combo' } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b28Schools[`${p.skill}/${p.ability}`];
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
    b.learned = { [p.skill]: 1 };
    if (cfg.kind === 'combo') {
        const fee = feeOverride ?? (cfg.feePerAttack !== undefined
            ? cfg.feePerAttack * (cfg.comboAttacks ?? 5)
            : cfg.fee ?? 0);
        const qiCost = cfg.qiFee ?? 0;
        b.neili -= fee;
        b.qi -= qiCost;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        const nAttacks = cfg.comboAttacks ?? 5;
        for (let i = 0; i < nAttacks; i++) {
            raw.attacks.push({ actor: 0, target: 1, result: i === 0 ? 0 : -1, damage: 0 });
        }
        b.busy = cfg.comboBusyMin ?? 1;
    } else if (cfg.kind === 'direct') {
        const fee = feeOverride ?? (hit ? (cfg.feeHit ?? cfg.fee) : (cfg.feeMiss ?? cfg.fee));
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: hit ? 1 : 0 };
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, damage: 100 }];
            v.qi -= 100; v.eff_qi -= 100;
            b.busy = cfg.hitBusy ?? 2;
        } else {
            b.busy = cfg.missBusy ?? 3;
        }
        if (cfg.selfWound) {
            b.qi -= cfg.selfWound;
            b.eff_qi = Math.min(b.eff_qi, b.qi);
        }
    } else if (cfg.kind === 'control') {
        const fee = feeOverride ?? (hit ? (cfg.feeHit ?? cfg.fee ?? 0) : (cfg.feeMiss ?? cfg.fee ?? 0));
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        if (hit) {
            v.busy = targetBusyFor(cfg, b);
            b.busy = cfg.hitBusy ?? 0;
        } else {
            b.busy = cfg.missBusy ?? 1;
            v.busy = 0;
        }
    } else if (cfg.kind === 'instant_death') {
        const fee = feeOverride ?? cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        b.busy = 1;
    } else {
        // special
        const fee = feeOverride ?? cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        if (cfg.specialKind === 'throwing') {
            b.busy = 1;
        } else if (specialBranch === 'no-combo-miss') {
            b.busy = cfg.noComboBusyMax ?? 4;
        } else if (specialBranch === 'no-combo-partial') {
            v.busy = 3;
        } else {
            const nAttacks = cfg.comboAttacksMin ?? 4;
            for (let i = 0; i < nAttacks; i++) {
                raw.attacks.push({ actor: 0, target: 1, result: i === 0 ? 0 : -1, damage: 0 });
            }
            b.busy = cfg.comboBusyMin ?? 1;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B28 batch matrix', () => {
    assert.ok(cases.length >= 18);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b28-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b28-perform');
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 8);
    assert.ok((kinds['bl-combo'] ?? 0) >= 6);
    assert.ok((kinds['bl-control'] ?? 0) >= 1);
    assert.ok((kinds['bl-instant_death'] ?? 0) >= 1);
    assert.ok((kinds['bl-special'] ?? 0) >= 2);
    const ids = cases.map(c => c.id);
    for (const sk of ['dongyang-dao-luan', 'dongyang-dao-zhan', 'dragon-strike-lei',
        'dragon-strike-xiang', 'mizong-houquan-zhou', 'qishi-ji-chong', 'qishi-ji-juan',
        'tianchang-zhang-huang', 'wushen-jian-qian', 'xiyang-jian-ci',
        'xue-dao-shendao', 'xue-dao-xueyu',
        'never-defeated-juemie', 'never-defeated-lei', 'never-defeated-po',
        'never-defeated-tianhua', 'never-defeated-wanli', 'never-defeated-yuce'])
        assert.ok(ids.includes('b28-' + sk + '-baseline-l300'), sk);
});

test('B28 source bytes pinned', () => {
    for (const p of b28SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b28SourcePaths.every(p => !p.includes('..')));
});

test('B28 gates and families', () => {
    for (const [key, cfg] of Object.entries(b28Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b28Schools['dongyang-dao/luan'].kind, 'combo');
    assert.equal(b28Schools['dongyang-dao/zhan'].kind, 'direct');
    assert.equal(b28Schools['never-defeated/tianhua'].kind, 'control');
    assert.equal(b28Schools['never-defeated/lei'].kind, 'instant_death');
    assert.equal(b28Schools['never-defeated/po'].kind, 'special');
});

test('B28 contract shape', () => {
    for (const [key, cfg] of Object.entries(b28Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(Math.abs(gate.pair[1] - gate.pair[0]), 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(['direct', 'combo', 'control', 'instant_death', 'special'].includes(cfg.kind), key);
    }
});

test('B28 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB28Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B28 direct hit and miss', () => {
    const c = cases.find(x => x.id === 'b28-dongyang-dao-zhan-baseline-l300');
    const hit = trace(c, { hit: true });
    const info = validateB28Record(hit, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
    const miss = trace(c, { hit: false });
    const mi = validateB28Record(miss, c);
    assert.equal(mi.hit, false);
});

test('B28 combo attacks', () => {
    const c = cases.find(x => x.id === 'b28-dongyang-dao-luan-baseline-l300');
    const raw = trace(c);
    const info = validateB28Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'combo');
});

test('B28 control target busy', () => {
    const c = cases.find(x => x.id === 'b28-never-defeated-tianhua-baseline-l300');
    const raw = trace(c);
    const info = validateB28Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'control');
});

test('B28 instant death', () => {
    const c = cases.find(x => x.id === 'b28-never-defeated-lei-baseline-l300');
    const raw = trace(c);
    const info = validateB28Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'instant_death');
});

test('B28 special throwing', () => {
    const c = cases.find(x => x.id === 'b28-never-defeated-yuce-baseline-l300');
    const raw = trace(c);
    const info = validateB28Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'special');
    assert.equal(info.specialKind, 'throwing');
});

test('B28 mizong combo busy reaches source max', () => {
    const c = cases.find(x => x.id === 'b28-mizong-houquan-zhou-baseline-l300');
    const raw = trace(c);
    raw.immediate[0].busy = 7;
    raw.after[0].busy = 7;
    const info = validateB28Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'combo');
});

test('B28 special no-combo branches', () => {
    const c = cases.find(x => x.id === 'b28-never-defeated-po-baseline-l300');
    const miss = trace(c, { specialBranch: 'no-combo-miss' });
    const mi = validateB28Record(miss, c);
    assert.equal(mi.accepted, true);
    assert.equal(mi.hit, false);
    const partial = trace(c, { specialBranch: 'no-combo-partial' });
    const pi = validateB28Record(partial, c);
    assert.equal(pi.accepted, true);
    assert.equal(pi.hit, true);
});

test('B28 rejects unexplained mutation', () => {
    const c = cases.find(x => x.id === 'b28-dongyang-dao-zhan-baseline-l300');
    const raw = trace(c, { hit: true });
    raw.immediate[0].qi -= 1; // unexplained self damage
    assert.throws(() => validateB28Record(raw, c));
});

test('B28 effects', () => {
    const c = cases.find(x => x.id === 'b28-xue-dao-shendao-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b28Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B28 all 18 dispatchable', () => {
    for (const [key, cfg] of Object.entries(b28Schools)) {
        assert.ok(['direct', 'combo', 'control', 'instant_death', 'special'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b28Schools).length, 18);
});
