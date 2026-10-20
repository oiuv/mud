import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b26SourcePaths, b26ReviewedSourceHash, b26PerformConditions, validateB26Record,
    b26Effects, b26Schools
} from './b26_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b26PerformConditions(catalog, read);
const smoke = b26PerformConditions(catalog, read, { smoke: true });

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

function targetBusyFor(cfg, b) {
    return Math.trunc(b.skills[cfg.targetBusy.skill] / cfg.targetBusy.div) + cfg.targetBusy.add;
}

function trace(c, { hit = true, fee: feeOverride = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b26Schools[`${p.skill}/${p.ability}`];
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
    } else {
        const fee = feeOverride ?? (hit ? cfg.feeHit : cfg.feeMiss);
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        b.busy = hit ? cfg.meBusyHit : cfg.meBusyMiss;
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B26 batch matrix', () => {
    assert.ok(cases.length >= 15);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b26-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b26-perform');
        assert.ok(['全真教', '丐帮', '衡山派'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-control'] ?? 0) >= 4);
    assert.ok((kinds['bl-disarm'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['quanzhen-jian-chan', 'dagou-bang-chan', 'wushen-jian-hui',
        'tiangang-zhi-ling', 'dragon-strike-qin'])
        assert.ok(ids.includes('b26-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b26-quanzhen-jian-chan-baseline-l300').parameters.families, ['全真教']);
    assert.deepEqual(cases.find(x => x.id === 'b26-dagou-bang-chan-baseline-l300').parameters.families, ['丐帮']);
    assert.deepEqual(cases.find(x => x.id === 'b26-wushen-jian-hui-baseline-l300').parameters.families, ['衡山派']);
    assert.deepEqual(cases.find(x => x.id === 'b26-dragon-strike-qin-baseline-l300').parameters.families, ['丐帮']);
});

test('B26 source bytes pinned', () => {
    for (const p of b26SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b26SourcePaths.every(p => !p.includes('..')));
});

test('B26 gates and families', () => {
    for (const [key, cfg] of Object.entries(b26Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b26Schools['quanzhen-jian/chan'].kind, 'control');
    assert.equal(b26Schools['tiangang-zhi/ling'].kind, 'control');
    assert.equal(b26Schools['dragon-strike/qin'].kind, 'disarm');
});

test('B26 contract shape', () => {
    for (const [key, cfg] of Object.entries(b26Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(['control', 'disarm'].includes(cfg.kind), key);
    }
});

test('B26 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB26Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B26 control hit and miss', () => {
    const c = cases.find(x => x.id === 'b26-dagou-bang-chan-baseline-l300');
    const hit = trace(c, { hit: true });
    const info = validateB26Record(hit, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
    const miss = trace(c, { hit: false });
    const mi = validateB26Record(miss, c);
    assert.equal(mi.hit, false);
});

test('B26 disarm hit and miss', () => {
    const c = cases.find(x => x.id === 'b26-dragon-strike-qin-baseline-l300');
    const hit = trace(c, { hit: true });
    const info = validateB26Record(hit, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
    assert.equal(info.stole, true);
    const miss = trace(c, { hit: false });
    const mi = validateB26Record(miss, c);
    assert.equal(mi.hit, false);
});

test('B26 rejects unexplained mutation', () => {
    const c = cases.find(x => x.id === 'b26-quanzhen-jian-chan-baseline-l300');
    const raw = trace(c, { hit: true });
    raw.immediate[0].qi -= 1; // unexplained self damage
    assert.throws(() => validateB26Record(raw, c));
});

test('B26 effects', () => {
    const c = cases.find(x => x.id === 'b26-wushen-jian-hui-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b26Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B26 all 5 dispatchable', () => {
    for (const [key, cfg] of Object.entries(b26Schools)) {
        assert.ok(['control', 'disarm'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b26Schools).length, 5);
});
