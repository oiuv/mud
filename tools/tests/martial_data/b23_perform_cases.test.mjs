import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { slice2SupportSet } from './school_slice2_cases.mjs';
import { b23SourcePaths, b23ReviewedSourceHash, b23PerformConditions, validateB23Record,
    b23Effects, b23Schools } from './b23_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const cases = b23PerformConditions(catalog, read);
const smoke = b23PerformConditions(catalog, read, { smoke: true });

test('B23 rejects erased multi-stage damage and forged recorded percentages', () => {
    const c = cases.find(x => x.id === 'b23-canhe-zhi-canhe-baseline-l300');
    const good = trace(c);
    assert.equal(validateB23Record(good, c).hits, 3);
    for (const mutate of [
        r => { r.immediate[1].qi = r.before[1].qi; r.immediate[1].eff_qi = r.before[1].eff_qi; },
        r => { r.directs[0].percent = 0; },
        r => { r.directs[0].percent = 70; },
        r => { r.directs[0].type = 1; },
        r => { delete r.directs[0].percent; },
        r => { r.metrics[0].direct = 0; },
    ]) {
        const bad = structuredClone(good); mutate(bad);
        bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateB23Record(bad, c));
    }
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

function trace(c, { hit = true, input = 100, attacks = null, busy = 3, planned = null } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const cfg = b23Schools[`${p.skill}/${p.ability}`];
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
    const n = hit ? Math.min(cfg.maxDirects, cfg.maxDirects >= 3 ? 3 : cfg.maxDirects) : 0;
    const fee = cfg.fee !== undefined ? cfg.fee
        : cfg.feeMin !== undefined ? cfg.feeMin
            : hit ? (cfg.feeHit ?? cfg.feeHitMin ?? 0) : (cfg.feeMiss ?? cfg.feeMissMin ?? 0);
    b.neili -= fee;
    raw.metrics[0] = { neili_cost: fee, direct: n };
    const busyAfter = cfg.meBusy !== undefined ? cfg.meBusy
        : cfg.meBusyMin !== undefined ? cfg.meBusyMin
            : hit ? (cfg.hitBusyMin ?? cfg.hitBusy ?? 2) : (cfg.missBusyMin ?? cfg.missBusy ?? 2);
    b.busy = busyAfter;
    const damageActor = structuredClone(before[0]);
    if (p.skill === 'liuhe-bian' && n > 0)
        damageActor.temp.apply.damage = (damageActor.temp.apply.damage ?? 0)
            + Math.trunc(damageActor.skills[p.skill] / 3);
    for (let i = 0; i < n; i++) {
        const percent = cfg.stages?.[i]?.percentRange ?? cfg.percentRange;
        let actualPercent = Array.isArray(percent) ? percent[0] : percent;
        if (p.skill === 'leiting-fu') {
            const reborn = p.actor.properties['reborn/count'] ?? 0;
            const first = before[0].effective_str - reborn * 20;
            actualPercent = [first, first + before[0].dex - reborn * 20,
                first + before[0].dex + before[0].con - reborn * 40][i];
        }
        const type = p.skill === 'sanfen-jianshu' ? ['REMOTE', 'WEAPON'][i] : cfg.directType;
        raw.directs.push({ actor: 0, target: 1, type: ['UNARMED', 'WEAPON', 'REMOTE'].indexOf(type),
            damage: input, percent: actualPercent });
        const support = slice2SupportSet(input, actualPercent,
            damageActor, v, type);
        if (support.length) {
            v.qi = support[0].qi; v.eff_qi = support[0].eff_qi;
        }
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('B23 batch matrix', () => {
    assert.ok(cases.length >= 30);
    assert.equal(smoke.length, cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const kinds = {};
    for (const c of cases) {
        assert.match(c.id, /^b23-/i);
        assert.equal(c.stage, 'school');
        assert.equal(c.method, 'perform');
        assert.equal(c.parameters.collection_group, 'b23-perform');
        assert.ok(['少林寺', '大理段家', '慕容世家', '丐帮', '凌霄城', '梅庄', '衡山派',
            '峨嵋派', '玄冥教', '神龙教', '侠客盟'].includes(c.parameters.families[0]));
        kinds[c.parameters.kind] = (kinds[c.parameters.kind] ?? 0) + 1;
        if (c.id.endsWith('baseline-l300')) kinds['bl-' + c.parameters.kind] = (kinds['bl-' + c.parameters.kind] ?? 0) + 1;
    }
    assert.ok((kinds['bl-multi_stage'] ?? 0) >= 10);
    const ids = cases.map(c => c.id);
    for (const sk of ['lunhui-jian-hui', 'six-finger-qi', 'six-finger-zong', 'liuhe-bian-lianhuan',
        'canhe-zhi-canhe', 'dragon-strike-hui', 'shangqing-jian-qing', 'fenglei-panfa-fenglei',
        'wushen-jian-shen', 'yuenv-jian-xin', 'xuanming-zhang-xing', 'shedao-qigong-xian',
        'leiting-fu-sanda', 'daojian-guizhen-daojian', 'jinshe-jian-shi', 'jiuyin-baiguzhao-duo',
        'kuihua-mogong-wswd', 'sanfen-jianshu-haishi', 'yinsuo-jinling-feng', 'yujian-shu-yujian',
        'zhougong-jian-mang'])
        assert.ok(ids.includes('b23-' + sk + '-baseline-l300'), sk);
    assert.deepEqual(cases.find(x => x.id === 'b23-lunhui-jian-hui-baseline-l300').parameters.families, ['少林寺']);
    assert.deepEqual(cases.find(x => x.id === 'b23-six-finger-qi-baseline-l300').parameters.families, ['大理段家']);
    assert.deepEqual(cases.find(x => x.id === 'b23-dragon-strike-hui-baseline-l300').parameters.families, ['丐帮']);
    assert.deepEqual(cases.find(x => x.id === 'b23-shangqing-jian-qing-baseline-l300').parameters.families, ['凌霄城']);
    assert.deepEqual(cases.find(x => x.id === 'b23-leiting-fu-sanda-baseline-l300').parameters.families, ['侠客盟']);
});

test('B23 source bytes pinned', () => {
    for (const p of b23SourcePaths) assert.equal(sha256(read(p)), cases[0].parameters.source_evidence[p], p);
    assert.ok(b23SourcePaths.every(p => !p.includes('..')));
});

test('B23 gates and families', () => {
    for (const [key, cfg] of Object.entries(b23Schools)) {
        const ak = cfg.abilityPath ?? cfg.ability;
        const base = catalog.skills.find(s => s.id === cfg.skill);
        const ability = catalog.skills.find(s => s.id === `${cfg.skill}/${ak}`);
        assert.equal(base?.path, `kungfu/skill/${cfg.skill}.c`, key);
        assert.ok(ability?.path, key);
        const actual = cases.find(c => c.parameters.skill === cfg.skill && c.parameters.ability === cfg.ability);
        assert.equal(actual.parameters.ability_source.path,
            `kungfu/skill/${cfg.sourceSkill ?? cfg.skill}/${ak}.c`);
        assert.ok(cfg.gates.length >= 1, key);
        assert.ok(cfg.title && cfg.title.length, key);
        assert.ok(cfg.families.length >= 1, key);
    }
    assert.equal(b23Schools['lunhui-jian/hui'].kind, 'multi_stage');
    assert.equal(b23Schools['six-finger/zong'].kind, 'multi_stage');
    assert.equal(b23Schools['kuihua-mogong/wswd'].abilityPath, 'perform/wswd');
    assert.equal(b23Schools['six-finger/qi'].preparedSkill, 'liumai-shenjian');
});

test('B23 contract shape', () => {
    for (const [key, cfg] of Object.entries(b23Schools)) {
        for (const gate of cfg.gates) {
            assert.ok(Array.isArray(gate.pair) && gate.pair.length === 2, key);
            assert.equal(gate.pair[1] - gate.pair[0], 1, key);
            assert.ok(gate.refusal.endsWith('\n'), key);
        }
        assert.ok(cfg.maxDirects >= 1, key);
        assert.ok(Array.isArray(cfg.stages) && cfg.stages.length >= 1, key);
    }
});

test('B23 samples pass contract', () => {
    for (const c of cases) {
        const raw = trace(c);
        const info = validateB23Record(raw, c);
        if (c.parameters.expected === 'refused') assert.equal(info.accepted, false);
        else assert.equal(info.accepted, true);
    }
});

test('B23 effects', () => {
    const c = cases.find(x => x.id === 'b23-shangqing-jian-qing-baseline-l300');
    const rows = [{ condition_id: c.id, raw: trace(c, { hit: true }), outcome: 'observed' }];
    const e = b23Effects(rows, c);
    assert.equal(e.counts.observed, 1);
    assert.equal(e.hits.trials, 1);
});

test('B23 all 21 multi_stage dispatchable', () => {
    for (const [key, cfg] of Object.entries(b23Schools)) {
        assert.equal(cfg.kind, 'multi_stage', key);
    }
    assert.equal(Object.keys(b23Schools).length, 21);
});
