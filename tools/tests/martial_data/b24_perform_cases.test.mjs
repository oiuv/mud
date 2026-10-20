import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import {
    b24SourcePaths, b24ReviewedSourceHash, b24PerformConditions, validateB24Record,
    b24Effects, b24Schools
} from './b24_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b24PerformConditions(catalog, read);
const smoke = b24PerformConditions(catalog, read, { smoke: true });

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

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, fee: feeOverride = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b24Schools[`${p.skill}/${p.ability}`];
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
    const n = attacks ?? (cfg.comboAttacks ?? cfg.comboMin ?? 3);
    const fee = feeOverride ?? (cfg.feePerAttack !== undefined ? n * cfg.feePerAttack
        : cfg.feeMin !== undefined ? cfg.feeMin
            : cfg.fee !== undefined ? cfg.fee
                : hit ? (cfg.feeHit ?? 0) : (cfg.feeMiss ?? 0));
    b.neili -= fee;
    raw.metrics[0] = { neili_cost: fee, direct: 0 };
    const busyAfter = cfg.meBusy !== undefined ? cfg.meBusy
        : hit ? (cfg.meBusyMin ?? 2) : (cfg.meBusyMin ?? 2);
    b.busy = busyAfter;
    for (let i = 0; i < n; i++) {
        raw.attacks.push({ actor: 0, target: 1, result: hit ? 0 : -1, type: 0, input });
    }
    if (cfg.targetBusy && hit) v.busy = 1;
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B24 batch matrix', () => {
    assert.ok(cases.length >= 30);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b24-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b24-perform');
        assert.ok(['少林派', '武当派', '慕容世家', '古墓派', '云龙门', '桃花岛', '侠客盟']
            .includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-combo'] ?? 0) >= 10);
    const ids = cases.map(c => c.id);
    for (const sk of ['damo-jian-sanjue', 'hongye-daofa-kuang', 'rouyun-jian-tao',
        'murong-sword-qixing', 'xuantie-jian-xunlei', 'suxin-jian-lian',
        'wuhu-duanmendao-duan', 'xuanfeng-tui-kuang', 'jinshe-zhang-fugu',
        'jinshe-jian-wan', 'biyan-dao-luo', 'xiyang-jian-lian', 'baihua-quan-cuo'])
        assert.ok(ids.includes('b24-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b24-damo-jian-sanjue-baseline-l300').parameters.families, ['少林派']);
    assert.deepEqual(cases.find(x => x.id === 'b24-rouyun-jian-tao-baseline-l300').parameters.families, ['武当派']);
    assert.deepEqual(cases.find(x => x.id === 'b24-murong-sword-qixing-baseline-l300').parameters.families, ['慕容世家']);
    assert.deepEqual(cases.find(x => x.id === 'b24-jinshe-zhang-fugu-baseline-l300').parameters.families, ['侠客盟']);
});

test('B24 source bytes pinned', () => {
    for (const p of b24SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b24SourcePaths.every(p => !p.includes('..')));
});

test('B24 gates and families', () => {
    for (const [key, cfg] of Object.entries(b24Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b24Schools['damo-jian/sanjue'].kind, 'combo');
    assert.equal(b24Schools['murong-sword/qixing'].comboAttacks, 7);
    assert.equal(b24Schools['jinshe-jian/wan'].feePerAttack, 30);
    // 迅雷击：原 perform 固定 350 + 玄铁剑 hit_ob 每次 120（最多 3 次）。
    assert.equal(b24Schools['xuantie-jian/xunlei'].feeMin, 350);
    assert.equal(b24Schools['xuantie-jian/xunlei'].feeMax, 710);
});

test('B24 xunlei fee covers hit_ob extras', () => {
    const c = cases.find(x => x.id === 'b24-xuantie-jian-xunlei-baseline-l300');
    for (const fee of [350, 470, 590, 710]) {
        const raw = trace(c, { fee });
        assert.equal(validateB24Record(raw, c).accepted, true);
    }
    for (const fee of [349, 711, 830]) {
        const raw = trace(c, { fee });
        assert.throws(() => validateB24Record(raw, c), /combo fee range/);
    }
});

test('B24 contract shape', () => {
    for (const [key, cfg] of Object.entries(b24Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        if (cfg.comboAttacks !== undefined) assert.ok(cfg.comboAttacks >= 1, key);
        else {
            assert.ok(cfg.comboMin >= 1, key);
            assert.ok(cfg.comboMax >= cfg.comboMin, key);
        }
        assert.ok(cfg.kind === 'combo', key);
    }
});

test('B24 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB24Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B24 effects', () => {
    const c = cases.find(x => x.id === 'b24-murong-sword-qixing-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b24Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B24 all 13 combo dispatchable', () => {
    for (const [key, cfg] of Object.entries(b24Schools)) {
        assert.equal(cfg.kind, 'combo', key);
    }
    assert.equal(Object.keys(b24Schools).length, 13);
});
