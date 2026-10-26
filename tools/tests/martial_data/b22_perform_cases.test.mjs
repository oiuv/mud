import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';
import { b22SourcePaths, b22ReviewedSourceHash, b22PerformConditions, validateB22Record,
    b22Effects, b22Schools } from './b22_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b22PerformConditions(catalog, read);
const smoke = b22PerformConditions(catalog, read, { smoke: true });

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

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b22Schools[`${p.skill}/${p.ability}`];
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
    if (cfg.kind === 'practice') {
        b.learned = { [p.skill]: 1, sword: 1 };
        const fee = cfg.fee ?? cfg.feeMin ?? 0;
        b.neili -= fee;
        b.busy = 1;
        raw.metrics[0] = { neili_cost: fee };
    } else if (cfg.kind === 'special') {
        b.learned = { [p.skill]: 1 };
        if (cfg.specialBusy === 'qi') {
            const fee = hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0);
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
        } else if (cfg.specialBusy === 'cui') {
            const fee = hit ? (cfg.feeHit ?? 260) : (cfg.feeMiss ?? 120);
            b.neili -= fee;
            b.busy = hit ? (cfg.hitBusyMin ?? 2) : (cfg.missBusyMax ?? 3);
            raw.metrics[0] = { neili_cost: fee };
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
                raw.metrics[0].direct = 1;
                const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
                v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
                v.temp = { ...(v.temp ?? {}), cuixin: 1 };
            }
        } else if (cfg.specialBusy === 'hua') {
            const instant = before[0].max_neili > before[1].max_neili * 2;
            const fee = hit ? (cfg.feeHit ?? 360) : (cfg.feeMiss ?? 200);
            b.neili -= fee;
            b.busy = instant ? (cfg.instantBusy ?? 1) : hit ? (cfg.hitBusyMin ?? 2) : (cfg.missBusyMax ?? 3);
            raw.metrics[0] = { neili_cost: fee };
            if (instant) {
                v.qi = 0; v.eff_qi = 0; v.ghost = 1; v.living = 0;
            } else if (hit) {
                v.qi = Math.max(1, v.qi - input);
                v.eff_qi = Math.min(v.eff_qi, v.qi);
                v.jing = Math.max(1, v.jing - input / 4);
            }
        }
    } else if (cfg.kind === 'multi') {
        b.learned = { [p.skill]: 1 };
        const n = Math.min(cfg.multiDirects, 3);
        b.neili -= cfg.fee;
        raw.metrics[0] = { neili_cost: cfg.fee, direct: n };
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
        if (hit) {
            raw.directs = [{ actor: 0, target: 1, type: 0, damage: input }];
            raw.metrics[0].direct = 1;
            const support = slice2SupportSet(input, cfg.percent, before[0], before[1], cfg.directType);
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    } else {
        // combo
        b.learned = { [p.skill]: 1 };
        const n = attacks ?? cfg.comboAttacksMin ?? cfg.comboAttacks;
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

test('B22 batch matrix', () => {
    assert.ok(cases.length >= 30);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b22-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b22-perform');
        assert.ok(['凌霄城', '桃花岛', '灵鹫宫', '逍遥派', '侠客盟'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 3);
    assert.ok((kinds['bl-combo'] ?? 0) >= 2);
    assert.ok((kinds['bl-multi'] ?? 0) >= 1);
    assert.ok((kinds['bl-special'] ?? 0) >= 3);
    assert.ok((kinds['bl-practice'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['lingxiao-quan-san', 'hanmei-jian-leng', 'yinlong-bian-zhu', 'cuixin-zhang-cui',
        'caiyan-gong-huan', 'liuyue-jian-sheng', 'zhemei-shou-hua',
        'dugu-jiujian-jue', 'dugu-jiujian-po', 'dugu-jiujian-qi'])
        assert.ok(ids.includes('b22-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b22-lingxiao-quan-san-baseline-l300').parameters.families, ['凌霄城']);
    assert.deepEqual(cases.find(x => x.id === 'b22-yinlong-bian-zhu-baseline-l300').parameters.families, ['桃花岛']);
    assert.deepEqual(cases.find(x => x.id === 'b22-caiyan-gong-huan-baseline-l300').parameters.families, ['灵鹫宫']);
    assert.deepEqual(cases.find(x => x.id === 'b22-liuyue-jian-sheng-baseline-l300').parameters.families, ['逍遥派']);
    assert.deepEqual(cases.find(x => x.id === 'b22-dugu-jiujian-qi-baseline-l300').parameters.families, ['侠客盟']);
});

test('B22 source bytes pinned', () => {
    for (const p of b22SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b22SourcePaths.every(p => !p.includes('..')));
});

test('B22 gates and families', () => {
    for (const [key, cfg] of Object.entries(b22Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === cfg.skill + '/' + ak);
        assert.equal(base?.path, 'kungfu/skill/' + cfg.skill + '.c', key);
        assert.equal(ability?.path, 'kungfu/skill/' + cfg.skill + '/' + ak + '.c', key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b22Schools['lingxiao-quan/san'].kind, 'multi');
    assert.equal(b22Schools['zhemei-shou/hua'].targetInstantDeath, true);
    assert.equal(b22Schools['dugu-jiujian/jue'].kind, 'practice');
    assert.equal(b22Schools['dugu-jiujian/qi'].specialBusy, 'qi');
});

test('B22 contract shape', () => {
    for (const [key, cfg] of Object.entries(b22Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
    }
});

test('B22 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB22Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B22 effects', () => {
    const c = cases.find(x => x.id === 'b22-hanmei-jian-leng-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b22Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B22 all 11 kind dispatchable', () => {
    for (const [key, cfg] of Object.entries(b22Schools)) {
        assert.ok(['direct', 'combo', 'multi', 'special', 'practice'].includes(cfg.kind), key);
    }
    // 含 dugu-jiujian/jue、lonely-sword/jue 两个非战斗演练（kind=practice, nonCombat）
    assert.equal(Object.keys(b22Schools).length, 11);
});
