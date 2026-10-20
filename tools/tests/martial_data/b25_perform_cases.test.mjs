import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b25SourcePaths, b25ReviewedSourceHash, b25PerformConditions, validateB25Record,
    b25Effects, b25Schools
} from './b25_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b25PerformConditions(catalog, read);
const smoke = b25PerformConditions(catalog, read, { smoke: true });

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

function trace(c, { hit = true, input = 100, death = false, fee: feeOverride = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b25Schools[`${p.skill}/${p.ability}`];
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
    const fee = feeOverride ?? (cfg.feeHit !== undefined && hit ? cfg.feeHit
        : cfg.feeMiss !== undefined && !hit ? cfg.feeMiss : cfg.fee ?? 0);
    b.neili -= fee;
    raw.metrics[0] = { neili_cost: fee, direct: 0 };
    if (cfg.kind === 'heal') {
        b.qi -= cfg.selfQi ?? 0;
        b.jing -= cfg.selfJing ?? 0;
        b.busy = cfg.meBusy;
        v.eff_qi = Math.min(v.eff_qi + 2000, v.max_qi);
        v.eff_jing = Math.min(v.eff_jing + 1000, v.max_jing);
    } else if (cfg.targetInstantDeath) {
        const instant = before[0].max_neili > before[1].max_neili * 2;
        b.busy = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusy ?? 2) : (cfg.missBusy ?? 3);
        if (instant || death) {
            v.living = 0;
            v.ghost = 1;
            raw.terminals.push({ side: 1 });
        } else if (hit) {
            v.qi = Math.max(0, v.qi - 500);
        }
    } else {
        b.busy = cfg.meBusy ?? (hit ? cfg.meBusyMin ?? cfg.hitBusyMin ?? 2 : cfg.meBusyMin ?? cfg.missBusyMin ?? 3);
        const killed = death || cfg.skill === 'xiaoli-feidao';
        if (killed) {
            v.living = 0;
            v.ghost = 1;
            raw.terminals.push({ side: 1 });
        } else if (hit) {
            v.qi = Math.max(0, v.qi - 500);
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B25 batch matrix', () => {
    assert.ok(cases.length >= 20);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b25-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b25-perform');
        assert.ok(['逍遥派', '灵鹫宫', '大理段家', '侠客盟'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-instant_death'] ?? 0) >= 5);
    assert.ok((kinds['bl-heal'] ?? 0) >= 2);
    const ids = cases.map(c => c.id);
    for (const sk of ['zhemei-shou-hua', 'bluesea-force-mie', 'xiaoli-feidao-fei',
        'wudoumi-shengong-gui', 'never-defeated-lei', 'yiyang-zhi-heal', 'sun-finger-heal'])
        assert.ok(ids.includes('b25-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b25-zhemei-shou-hua-baseline-l300').parameters.families, ['逍遥派']);
    assert.deepEqual(cases.find(x => x.id === 'b25-wudoumi-shengong-gui-baseline-l300').parameters.families, ['灵鹫宫']);
    assert.deepEqual(cases.find(x => x.id === 'b25-yiyang-zhi-heal-baseline-l300').parameters.families, ['大理段家']);
    assert.deepEqual(cases.find(x => x.id === 'b25-never-defeated-lei-baseline-l300').parameters.families, ['侠客盟']);
});

test('B25 source bytes pinned', () => {
    for (const p of b25SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b25SourcePaths.every(p => !p.includes('..')));
});

test('B25 gates and families', () => {
    for (const [key, cfg] of Object.entries(b25Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b25Schools['zhemei-shou/hua'].kind, 'instant_death');
    assert.equal(b25Schools['yiyang-zhi/heal'].kind, 'heal');
    assert.equal(b25Schools['sun-finger/heal'].kind, 'heal');
    assert.equal(b25Schools['xiaoli-feidao/fei'].kind, 'instant_death');
});

test('B25 contract shape', () => {
    for (const [key, cfg] of Object.entries(b25Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(['instant_death', 'heal'].includes(cfg.kind), key);
    }
});

test('B25 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB25Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B25 heal validation', () => {
    const c = cases.find(x => x.id === 'b25-yiyang-zhi-heal-baseline-l300');
    const raw = trace(c);
    const info = validateB25Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'heal');
});

test('B25 instant death validation', () => {
    const c = cases.find(x => x.id === 'b25-xiaoli-feidao-fei-baseline-l300');
    const raw = trace(c, { death: true });
    const info = validateB25Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
});

test('B25 effects', () => {
    const c = cases.find(x => x.id === 'b25-never-defeated-lei-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b25Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B25 all 7 dispatchable', () => {
    for (const [key, cfg] of Object.entries(b25Schools)) {
        assert.ok(['instant_death', 'heal'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b25Schools).length, 7);
});
