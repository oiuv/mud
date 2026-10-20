import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';
import { b21SourcePaths, b21ReviewedSourceHash, b21PerformConditions, validateB21Record,
    b21Effects, b21Schools } from './b21_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b21PerformConditions(catalog, read);
const smoke = b21PerformConditions(catalog, read, { smoke: true });

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
        case 'whip22-1': return Math.trunc(effSkill('whip') / 22) + 1;
        default: return 0;
    }
}

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b21Schools[`${p.skill}/${p.ability}`];
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
        const delta = cfg.buffApplyDelta ?? Math.trunc(level / (cfg.buffApplyDivisor ?? 30));
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
        if (cfg.specialBusy === 'tong') {
            const fee = hit ? (cfg.feeHit ?? 100) : (cfg.feeMiss ?? 50);
            b.neili -= fee;
            b.busy = hit ? (cfg.hitBusyMin ?? 3) : (cfg.missBusyMax ?? 4);
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
                v.temp = { ...(v.temp ?? {}), no_exert: 1 };
            }
        } else if (cfg.specialBusy === 'jie') {
            const fee = hit ? (cfg.feeHit ?? 200) : (cfg.feeMiss ?? 100);
            b.neili -= fee;
            b.busy = hit ? (cfg.hitBusyMin ?? 3) : (cfg.missBusyMax ?? 4);
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
                v.jing = Math.max(1, v.jing - input);
                v.busy = 1;
            }
        }
    } else if (cfg.kind === 'throwing') {
        b.learned = { [p.skill]: 1 };
        b.neili -= cfg.fee;
        b.busy = cfg.meBusy ?? 2;
        raw.metrics[0] = { neili_cost: cfg.fee };
        if (hit) {
            v.qi = Math.max(1, v.qi - input);
            v.eff_qi = Math.min(v.eff_qi, v.qi);
        }
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = Math.min(cfg.multiDirects, 3);
        b.neili -= cfg.feeMin;
        raw.metrics[0] = { neili_cost: cfg.feeMin, direct: n };
        b.busy = cfg.hitBusyMin;
        for (let i = 0; i < n; i++) {
            raw.directs.push({ actor: 0, target: 1, type: 0, damage: input });
            const support = slice2SupportSet(input, cfg.percentRanges[i][0], before[0], before[1], cfg.directType ?? 'WEAPON');
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else if (cfg.kind === 'direct') {
        const fee = cfg.unconditionalFee ? (cfg.feeHit ?? 0)
            : hit ? (cfg.feeAlways ?? 0) + (cfg.feeHit ?? 0)
                : (cfg.feeAlways ?? 0) + (cfg.feeMiss ?? 0);
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
        const fee = cfg.fee ?? cfg.feeMin ?? 0;
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

test('B21 batch matrix', () => {
    assert.ok(cases.length >= 50);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b21-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b21-perform');
        assert.ok(['八卦门', '商家堡', '云龙门', '峨嵋派', '大轮寺'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 5);
    assert.ok((kinds['bl-combo'] ?? 0) >= 5);
    assert.ok((kinds['bl-control'] ?? 0) >= 1);
    assert.ok((kinds['bl-buff'] ?? 0) >= 1);
    assert.ok((kinds['bl-throwing'] ?? 0) >= 2);
    assert.ok((kinds['bl-multi'] ?? 0) >= 1);
    assert.ok((kinds['bl-special'] ?? 0) >= 2);
    const ids = cases.map(c => c.id);
    for (const sk of ['bagua-biao-xian', 'bagua-biao-zhi', 'bagua-zhang-ding', 'youshen-zhang-fan',
        'baisheng-quan-kai', 'jinbiao-jue-huan', 'quemen-jian-can', 'tan-tui-wang',
        'yunlong-bian-chan', 'yunlong-jian-xian', 'ningxue-shenzhao-ji', 'ningxue-zhang-xue',
        'emei-jian-xian', 'huifeng-jian-jue', 'huifeng-jian-mie', 'jieshou-jiushi-jie',
        'poxu-daxuefa-tong', 'riyue-lun-lian', 'riyue-lun-po', 'riyue-lun-yuan'])
        assert.ok(ids.includes('b21-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b21-bagua-biao-xian-baseline-l300').parameters.families, ['八卦门']);
    assert.deepEqual(cases.find(x => x.id === 'b21-baisheng-quan-kai-baseline-l300').parameters.families, ['商家堡']);
    assert.deepEqual(cases.find(x => x.id === 'b21-yunlong-bian-chan-baseline-l300').parameters.families, ['云龙门']);
    assert.deepEqual(cases.find(x => x.id === 'b21-emei-jian-xian-baseline-l300').parameters.families, ['峨嵋派']);
    assert.deepEqual(cases.find(x => x.id === 'b21-riyue-lun-lian-baseline-l300').parameters.families, ['大轮寺']);
});

test('B21 source bytes pinned', () => {
    for (const p of b21SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b21SourcePaths.every(p => !p.includes('..')));
});

test('B21 gates and families', () => {
    for (const [key, cfg] of Object.entries(b21Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === cfg.skill + '/' + ak);
        assert.equal(base?.path, 'kungfu/skill/' + cfg.skill + '.c', key);
        assert.equal(ability?.path, 'kungfu/skill/' + cfg.skill + '/' + ak + '.c', key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b21Schools['bagua-biao/xian'].preparedSkill, 'bagua-zhang');
    assert.equal(b21Schools['riyue-lun/yuan'].kind, 'buff');
    assert.equal(b21Schools['huifeng-jian/jue'].kind, 'multi');
});

test('B21 contract shape', () => {
    for (const [key, cfg] of Object.entries(b21Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
    }
});

test('B21 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB21Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B21 effects', () => {
    const c = cases.find(x => x.id === 'b21-bagua-zhang-ding-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b21Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B21 all 20 kind dispatchable', () => {
    for (const [key, cfg] of Object.entries(b21Schools)) {
        assert.ok(['direct', 'control', 'combo', 'buff', 'special', 'throwing', 'multi'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b21Schools).length, 20);
});
