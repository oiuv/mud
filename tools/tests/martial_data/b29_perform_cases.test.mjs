import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b29SourcePaths, b29ReviewedSourceHash, b29PerformConditions, validateB29Record,
    b29Effects, b29Schools, b29Pending, b29Dispositions
} from './b29_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b29PerformConditions(catalog, read);
const smoke = b29PerformConditions(catalog, read, { smoke: true });

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
    if (t.randomBase !== undefined) {
        const name = t.useSkill ?? t.skill ?? cfg.skill;
        const level = b.skills[name] ?? 0;
        return t.randomBase;
    }
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
    const cfg = b29Schools[`${p.skill}/${p.ability}`];
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
            : cfg.feeHit ?? cfg.fee ?? 0);
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
            if (cfg.targetMarker) v.temp = { ...(v.temp ?? {}), [cfg.targetMarker]: 1 };
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
        if (cfg.instantDeathFormula === 'always') {
            v.living = 0; v.ghost = 1; v.qi = 0; v.eff_qi = 0;
        }
    } else if (cfg.kind === 'multi_stage') {
        const fee = feeOverride ?? (cfg.fee ?? 0);
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        const nStages = cfg.stages ?? 3;
        for (let i = 0; i < nStages; i++) {
            raw.attacks.push({ actor: 0, target: 1, result: i === 0 ? 0 : -1, damage: 0 });
        }
        b.busy = cfg.busyMin ?? 1;
    } else if (cfg.kind === 'buff') {
        const fee = feeOverride ?? cfg.fee;
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        b.busy = 0;
    } else {
        // special
        const fee = feeOverride ?? (cfg.feeHit ?? cfg.fee ?? 0);
        b.neili -= fee;
        raw.metrics[0] = { neili_cost: fee, direct: 0 };
        if (cfg.specialKind === 'combo_disarm') {
            if (specialBranch === 'no-combo-miss') {
                b.busy = cfg.noComboBusyMax ?? 4;
            } else if (specialBranch === 'no-combo-partial') {
                v.busy = 3;
                b.busy = cfg.noComboBusyMin ?? 1;
            } else {
                const nAttacks = cfg.comboAttacksMin ?? 4;
                for (let i = 0; i < nAttacks; i++) {
                    raw.attacks.push({ actor: 0, target: 1, result: i === 0 ? 0 : -1, damage: 0 });
                }
                b.busy = cfg.comboBusyMin ?? 1;
            }
        } else {
            // weapon_break / debuff / two_stage / redirect
            if (hit) {
                raw.directs = [{ actor: 0, target: 1, damage: 100 }];
                v.qi -= 100; v.eff_qi -= 100;
            }
            b.busy = hit ? (cfg.hitBusy ?? 2) : (cfg.missBusy ?? 3);
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B29 batch matrix', () => {
    assert.ok(cases.length >= 48);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b29-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b29-perform');
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-direct'] ?? 0) >= 10);
    assert.ok((kinds['bl-multi_stage'] ?? 0) >= 8);
    assert.ok((kinds['bl-control'] ?? 0) >= 4);
    assert.ok((kinds['bl-instant_death'] ?? 0) >= 2);
    assert.ok((kinds['bl-combo'] ?? 0) >= 1);
    const ids = cases.map(c => c.id);
    for (const sk of ['bluesea-force-bo', 'bluesea-force-jue', 'bluesea-force-mie',
        'lonely-sword-yi', 'jinshe-jian-shi', 'yunu-sword-wushuang',
        'shenzhaojing-wu', 'zhongping-qiang-ding',
        'kuihua-mogong-bian', 'jiuyang-shengong-hun',
        'qiankun-jian-qian'])
        assert.ok(ids.includes('b29-' + sk + '-baseline-l300'), sk);
});

test('B29 source bytes pinned', () => {
    for (const p of b29SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b29SourcePaths.every(p => !p.includes('..')));
});

test('B29 gates and families', () => {
    for (const [key, cfg] of Object.entries(b29Schools)) {
        if (b29Pending[key]) continue;
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b29Schools['bluesea-force/bo'].kind, 'control');
    assert.equal(b29Schools['bluesea-force/jue'].kind, 'direct');
    assert.equal(b29Schools['bluesea-force/mie'].kind, 'instant_death');
    assert.equal(b29Schools['jingang-buhuaiti/jingang'].kind, 'buff');
});

test('B29 contract shape', () => {
    for (const [key, cfg] of Object.entries(b29Schools)) {
        if (b29Pending[key]) continue;
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(Math.abs(gate.pair[1] - gate.pair[0]), 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(['direct', 'combo', 'control', 'instant_death', 'special', 'buff', 'multi_stage'].includes(cfg.kind), key);
    }
});

test('B29 deferred entries distinguish missing fixtures from unreachable dispatch', () => {
    // jinshe-zhui/tuwu、xuanyuan-arrow/baibu 已建专用弹药夹具并转入可采配置，
    // 不再计 pending_fixture；余 4 项演练/多段窗口 + 2 项分发不可达。
    assert.equal(Object.keys(b29Dispositions).length, 6);
    assert.equal(Object.values(b29Dispositions).filter(v => v.disposition === 'pending_fixture').length, 4);
    for (const [key, info] of Object.entries(b29Dispositions)) {
        assert.equal(info.disposition, info.category === '分发不可达' ? 'unreachable_dispatch' : 'pending_fixture', key);
        assert.ok(['演练型', '分发不可达', '缺专用道具', '多段窗口'].includes(info.category), key);
        assert.ok(info.reason.length > 5, key);
        assert.ok(info.evidence.length > 5, key);
        assert.ok(b29Schools[key], key);
    }
    // Skipping this batch does not close whole-project effect coverage.
    for (const c of cases) {
        assert.ok(!b29Pending[`${c.parameters.skill}/${c.parameters.ability}`], c.id);
    }
});

test('B29 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB29Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B29 direct hit and miss', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-jue-baseline-l300');
    const hit = trace(c, { hit: true });
    const info = validateB29Record(hit, c);
    assert.equal(info.accepted, true);
    assert.equal(info.hit, true);
    const miss = trace(c, { hit: false });
    const mi = validateB29Record(miss, c);
    assert.equal(mi.hit, false);
});

test('B29 combo attacks', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-xuan-baseline-l300');
    const raw = trace(c);
    const info = validateB29Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'combo');
});

test('B29 control target busy', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-bo-baseline-l300');
    const raw = trace(c);
    const info = validateB29Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'control');
});

test('B29 instant death', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-mie-baseline-l300');
    const raw = trace(c);
    const info = validateB29Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'instant_death');
});

test('B29 multi_stage', () => {
    const c = cases.find(x => x.id === 'b29-six-finger-six-baseline-l300');
    const raw = trace(c);
    const info = validateB29Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'multi_stage');
});

test('B29 buff', () => {
    const c = cases.find(x => x.id === 'b29-jingang-buhuaiti-jingang-baseline-l300');
    const raw = trace(c);
    const info = validateB29Record(raw, c);
    assert.equal(info.accepted, true);
    assert.equal(info.kind, 'buff');
});

test('B29 special combo_disarm branches', () => {
    const c = cases.find(x => x.id === 'b29-lonely-sword-po-baseline-l300');
    const miss = trace(c, { specialBranch: 'no-combo-miss' });
    const mi = validateB29Record(miss, c);
    assert.equal(mi.accepted, true);
    assert.equal(mi.hit, false);
    const partial = trace(c, { specialBranch: 'no-combo-partial' });
    const pi = validateB29Record(partial, c);
    assert.equal(pi.accepted, true);
    assert.equal(pi.hit, true);
});

test('B29 rejects unexplained mutation', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-jue-baseline-l300');
    const raw = trace(c, { hit: true });
    raw.immediate[0].qi -= 1; // unexplained self damage
    assert.throws(() => validateB29Record(raw, c));
});

test('B29 effects', () => {
    const c = cases.find(x => x.id === 'b29-bluesea-force-jue-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b29Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B29 all dispatchable', () => {
    for (const [key, cfg] of Object.entries(b29Schools)) {
        if (b29Pending[key]) continue;
        assert.ok(['direct', 'combo', 'control', 'instant_death', 'special', 'buff', 'multi_stage'].includes(cfg.kind), key);
    }
    assert.equal(Object.keys(b29Schools).length, 55); // 49 implemented + 6 pending entries
    assert.equal(Object.keys(b29Schools).length, 49 + Object.keys(b29Pending).length);
});
