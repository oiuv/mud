import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';
import { b20SourcePaths, b20ReviewedSourceHash, b20PerformConditions, validateB20Record,
    b20Effects, b20Schools } from './b20_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b20PerformConditions(catalog, read);
const smoke = b20PerformConditions(catalog, read, { smoke: true });

test('B20 lingbo already-active is a finite supported fixture state, not an N/A', () => {
    const c = cases.find(c => c.id === 'b20-lingbo-weibu-ling-already-active');
    assert.deepEqual(c.parameters.actor.temp, { lingbo: 1 });
    assert.equal(c.parameters.expected, 'refused');
    assert.equal(c.parameters.refusal, '你已经运起「洛神凌波」了。\n');
    const runner = read('tools/tests/martial_data/runner.lpc').toString('utf8');
    assert.match(runner, /"b20-perform" && side == 0 &&\s*current\["parameters"\]\["skill"\] == "lingbo-weibu" &&\s*current\["parameters"\]\["ability"\] == "ling" &&\s*current\["parameters"\]\["variant"\] == "already-active" &&\s*key == "lingbo" && value == 1/);
});

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
        case 'staff25-2': return Math.trunc(effSkill('staff') / 25) + 2;
        case 'blade27-2': return Math.trunc(effSkill('blade') / 27) + 2;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b20Schools[`${p.skill}/${p.ability}`];
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
        raw.metrics[0] = { neili_cost: cfg.fee };
        const level = p.actor.skills?.[cfg.skill] ?? 0;
        const delta = cfg.buffApplyDelta ?? Math.trunc(level / 30);
        b.temp[cfg.buff] = (b.temp[cfg.buff] ?? 0) + 1;
        b.temp.apply = { ...(b.temp.apply ?? {}) };
        for (const key of cfg.buffApplyKeys ?? ['attack']) {
            if (key.includes('/')) {
                const parts = key.split('/');
                let node = b.temp;
                for (const p2 of parts.slice(0, -1)) node = node[p2] ??= {};
                node[parts.at(-1)] = (node[parts.at(-1)] ?? 0) + delta;
            } else {
                b.temp[key] = (b.temp[key] ?? 0) + delta;
            }
        }
    } else if (cfg.kind === 'control') {
        b.learned = { [p.skill]: 1 };
        const fee = hit ? (cfg.feeHit ?? cfg.fee ?? 0) : (cfg.feeMiss ?? cfg.fee ?? 0);
        b.neili -= fee;
        b.busy = hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 0) : (cfg.missBusyMin ?? cfg.missBusy ?? 0);
        raw.metrics[0] = { neili_cost: fee };
        if (hit) v.busy = targetBusyFor(cfg, b, hit) || 3;
    } else if (cfg.kind === 'special') {
        b.learned = { [p.skill]: 1 };
        if (cfg.specialBusy === 'tao') {
            b.neili = 0;
            b.max_neili -= 50;
            b.busy = cfg.meBusyMin;
            raw.metrics[0] = { neili_cost: 0 };
            if (hit) {
                v.qi = Math.max(1, v.qi - input);
                v.jing = Math.max(1, v.jing - input / 2);
            }
        } else if (cfg.specialBusy === 'shi') {
            const fee = cfg.feeMin;
            b.neili -= fee;
            b.qi -= cfg.selfWound;
            b.busy = cfg.meBusyMin;
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
                for (let i = 0; i < 6; i++) {
                    raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 10 });
                }
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
        if (cfg.selfWound) b.qi -= cfg.selfWound;
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacks;
        const plan = planned ?? n;
        b.neili -= cfg.fee;
        raw.metrics[0] = { neili_cost: cfg.fee };
        b.busy = Math.min(cfg.comboBusyMax, Math.max(cfg.comboBusyMin, busy));
        for (let i = 0; i < n; i++) {
            raw.attacks.push({ actor: 0, target: 1, type: 0, result: 0, damage: 20 });
            v.qi -= 20;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B20 batch matrix', () => {
    assert.ok(cases.length >= 50);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b20-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b20-perform');
        assert.ok(['星宿派', '铁掌帮', '血刀门', '逍遥派'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 8);
    assert.ok((kinds['bl-control'] ?? 0) >= 2);
    assert.ok((kinds['bl-combo'] ?? 0) >= 5);
    assert.ok((kinds['bl-special'] ?? 0) >= 1);
    assert.ok((kinds['bl-buff'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['chanhun-suo-duo', 'sanyin-wugongzhao-zhua', 'chousui-zhang-shi',
        'tianshan-zhang-fugu', 'tianshan-zhang-xue',
        'tie-zhang-lei', 'tianlei-dao-zha', 'tianlei-dao-shan',
        'tongbi-zhang-chu', 'tiexue-dao-xue',
        'xuedao-dafa-ying', 'xuedao-dafa-chi', 'xuedao-dafa-xue', 'xuedao-dafa-shi',
        'honglian-dao-huo',
        'qingyun-shou-zhuo', 'panyang-zhang-pan', 'ruyi-dao-ruyi',
        'liuyue-jian-liu', 'lingbo-weibu-ling'])
        assert.ok(ids.includes('b20-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b20-chanhun-suo-duo-baseline-l300').parameters.families, ['星宿派']);
    assert.deepEqual(cases.find(x => x.id === 'b20-tie-zhang-lei-baseline-l300').parameters.families, ['铁掌帮']);
    assert.deepEqual(cases.find(x => x.id === 'b20-xuedao-dafa-ying-baseline-l300').parameters.families, ['血刀门']);
    assert.deepEqual(cases.find(x => x.id === 'b20-qingyun-shou-zhuo-baseline-l300').parameters.families, ['逍遥派']);
});

test('B20 source bytes pinned', () => {
    for (const p of b20SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b20SourcePaths.every(p => !p.includes('..')));
});

test('B20 gates and families', () => {
    for (const [key, cfg] of Object.entries(b20Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === cfg.skill + '/' + ak);
        assert.equal(base?.path, 'kungfu/skill/' + cfg.skill + '.c', key);
        assert.equal(ability?.path, 'kungfu/skill/' + cfg.skill + '/' + ak + '.c', key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b20Schools['xuedao-dafa/ying'].abilityPath, 'perform/ying');
    assert.equal(b20Schools['lingbo-weibu/ling'].kind, 'buff');
});

test('B20 contract shape', () => {
    for (const [key, cfg] of Object.entries(b20Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
    }
});

test('B20 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB20Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B20 effects', () => {
    const c = cases.find(x => x.id === 'b20-tie-zhang-lei-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b20Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B20 all 20 kind dispatchable', () => {
    for (const [key, cfg] of Object.entries(b20Schools)) {
        assert.ok(['direct', 'control', 'combo', 'buff', 'special'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b20Schools).length, 20);
});
