import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b27SourcePaths, b27ReviewedSourceHash, b27PerformConditions, validateB27Record,
    b27Effects, b27Schools
} from './b27_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b27PerformConditions(catalog, read);
const smoke = b27PerformConditions(catalog, read, { smoke: true });

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
    if (t.randomBase !== undefined) return t.randomBase;
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

function trace(c, { hit = true, fee: feeOverride = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b27Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.kind === 'control') {
        const fee = feeOverride ?? (hit ? (cfg.feeHit ?? cfg.fee) : (cfg.feeMiss ?? cfg.fee));
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        if (hit) {
            v.busy = targetBusyFor(cfg, b);
            b.busy = cfg.meBusyHitMin ?? cfg.meBusyHit ?? 0;
        } else {
            b.busy = cfg.meBusyMiss;
            v.busy = 0;
        }
    } else if (cfg.kind === 'buff') {
        b.neili -= cfg.fee;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: 0 };
        b.temp = { ...b.temp, [cfg.marker]: 1, apply: { ...b.temp.apply, ...cfg.applyBuffs } };
    } else {
        // multi
        const cost = feeOverride ?? cfg.feePerRound * cfg.rounds;
        const qiCost = cfg.qiPerRound * cfg.rounds;
        b.neili -= cost;
        b.qi -= qiCost;
        raw.metrics[0] = { neili_cost: cost, qi_cost: qiCost, direct: 0 };
        b.busy = 1;
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B27 batch matrix', () => {
    assert.ok(cases.length >= 15);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b27-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b27-perform');
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-control'] ?? 0) >= 10);
    assert.ok((kinds['bl-buff'] ?? 0) >= 2);
    assert.ok((kinds['bl-multi'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['bluesea-force-bo', 'five-avoid-break', 'qiufeng-chenfa-chan',
        'sougu-muyeyingyang', 'canhe-zhi-zhi', 'chanhun-suo-suo',
        'yunzhou-fufa-feng', 'xiaoyao-jian-fei', 'jinshe-jian-kun',
        'xuantie-jian-juan', 'xue-dao-huan', 'xueshan-jian-hui',
        'shenxing-baibian-piao', 'jinzhong-zhao-zhao', 'yunv-jian-mei'])
        assert.ok(ids.includes('b27-' + sk + '-baseline-l300'), sk);
});

test('B27 source bytes pinned', () => {
    for (const p of b27SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b27SourcePaths.every(p => !p.includes('..')));
});

test('B27 gates and families', () => {
    for (const [key, cfg] of Object.entries(b27Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b27Schools['bluesea-force/bo'].kind, 'control');
    assert.equal(b27Schools['five-avoid/break'].kind, 'multi');
    assert.equal(b27Schools['shenxing-baibian/piao'].kind, 'buff');
});

test('B27 contract shape', () => {
    for (const [key, cfg] of Object.entries(b27Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(['control', 'buff', 'multi'].includes(cfg.kind), key);
    }
});

test('B27 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB27Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B27 control hit and miss', () => {
    const c = cases.find(x => x.id === 'b27-bluesea-force-bo-baseline-l300');
    const hit = trace(c, { hit: true });
    const info = validateB27Record(hit, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
    const miss = trace(c, { hit: false });
    const mi = validateB27Record(miss, c);
    assert.equal(mi.hit, false);
});

test('B27 buff applies marker', () => {
    const c = cases.find(x => x.id === 'b27-shenxing-baibian-piao-baseline-l300');
    const raw = trace(c);
    const info = validateB27Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'buff');
});

test('B27 multi rounds', () => {
    const c = cases.find(x => x.id === 'b27-five-avoid-break-baseline-l300');
    const raw = trace(c);
    const info = validateB27Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'multi');
});

test('B27 rejects unexplained mutation', () => {
    const c = cases.find(x => x.id === 'b27-canhe-zhi-zhi-baseline-l300');
    const raw = trace(c, { hit: true });
    raw.immediate[0].qi -= 1; // unexplained self damage
    assert.throws(() => validateB27Record(raw, c));
});

test('B27 effects', () => {
    const c = cases.find(x => x.id === 'b27-xue-dao-huan-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b27Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B27 all 15 dispatchable', () => {
    for (const [key, cfg] of Object.entries(b27Schools)) {
        assert.ok(['control', 'buff', 'multi'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b27Schools).length, 15);
});
