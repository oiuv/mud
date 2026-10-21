import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { sliceCombinationConditions, sliceCombinationPairs, sliceAsymmetricPairs,
    validateSliceCombinationRecord } from './school_slice_combination_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = sliceCombinationConditions(catalog);

test('27切片组组合覆盖：双向互备+非对称+准备+单轮交锋', () => {
    assert.ok(cases.length > 200, '条件数应超过200，实际:' + cases.length);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.parameters.collection_group, 'slice-combination');
        assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.observation, 'single_action_immediate');
        for (const p of c.parameters.qualification_sources)
            assert.ok(existsSync(join(root, p)), p);
    }
    // Count by method
    const byMethod = {};
    for (const c of cases) byMethod[c.method] = (byMethod[c.method] || 0) + 1;
    console.log('methods:', JSON.stringify(byMethod));
    console.log('total conditions:', cases.length);
    console.log('total samples:', cases.reduce((n, c) => n + c.samples, 0));
    // Each group with pairs should have conditions
    const groups = new Set(cases.map(c => c.parameters.school));
    assert.ok(groups.size >= 25, 'should cover at least 25 groups, got:' + groups.size);
});

test('4组未配置本批互备，不等于门派能力N/A', () => {
    // none/tangmen/ultra/xiakedao have zero combination sources
    const noCombo = ['none', 'tangmen', 'ultra', 'xiakedao'];
    for (const g of noCombo) {
        assert.ok(!cases.some(c => c.parameters.school === g),
            g + ' should have no conditions in this batch');
    }
});

test('烟雾条件2样本', () => {
    const smoke = sliceCombinationConditions(catalog, { smoke: true });
    for (const c of smoke.filter(c => c.method === 'round')) {
        assert.equal(c.samples, 2);
    }
});

test('双向互备方向性与非对称分别核对', () => {
    // Bidirectional: both directions should be allowed
    for (const [group, pairs] of Object.entries(sliceCombinationPairs)) {
        for (const [a, b] of pairs) {
            const prefix = `school-slice-combination-${group}-${a}-${b}-`;
            const ab = cases.find(c => c.id === `${prefix}${a}-allows-${b}-l200`);
            const ba = cases.find(c => c.id === `${prefix}${b}-allows-${a}-l200`);
            assert.ok(ab && ba, '两方向条件必须实际存在');
            assert.equal(ab.parameters.combine_result, 1);
            assert.equal(ba.parameters.combine_result, 1);
        }
    }
    // Asymmetric: one direction allowed, reverse refused
    for (const [group, pairs] of Object.entries(sliceAsymmetricPairs)) {
        for (const [a, b] of pairs) {
            const prefix = `school-slice-combination-${group}-${a}-${b}-`;
            const ab = cases.find(c => c.id === `${prefix}${a}-allows-${b}-l200`);
            const ba = cases.find(c => c.id === `${prefix}${b}-allows-${a}-l200`);
            assert.ok(ab && ba);
            assert.equal(ab.parameters.combine_result, 1);
            assert.equal(ba.parameters.combine_result, null, '缺失接口不是显式0');
        }
    }
});

// Synthetic consumer tests: not substitutes for real driver evidence.
function specimen(c) {
    const p = c.parameters;
    const state = config => ({ userp: 1, interactive: 1, wizardp: 0, weapon: 'none', temp: {},
        skills: { ...config.skills }, mappings: { ...config.mappings }, preparations: {}, preparation_order: [],
        ...Object.fromEntries(Object.entries(config.properties).filter(([k]) => !k.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([k]) => k.includes('/'))) });
    const before = [state(p.actor), state(p.target)], immediate = structuredClone(before);
    const raw = { method: c.method, outcome: p.expected, before, immediate,
        launches: [], interfaces: [], attacks: [], prepare_steps: [], metrics: [{}, {}] };
    if (c.method === 'interface') raw.interfaces.push({ ...p.interface, result: p.combine_result });
    else {
        let previous = before[0];
        for (const e of p.prepare_commands) {
            const after = structuredClone(previous);
            after.preparations = { ...e.preparations };
            after.preparation_order = Object.keys(e.preparations);
            raw.prepare_steps.push({ action: e.action, accepted: e.accepted, before: previous, after });
            previous = after;
        }
        immediate[0] = structuredClone(previous);
        if (c.method === 'round') {
            immediate[0].temp.guarding = 0;
            raw.attacks = previous.preparation_order.map((usage, index) => ({ actor: 0, target: 1,
                action_flag: index, attack_usage: usage, attack_skill: p.actor.mappings[usage], type: 0, result: 0 }));
        }
    }
    raw.after = structuredClone(immediate);
    return raw;
}

test('组合消费者拒绝错误返回、缺步骤、拒绝准备、缺攻击和错初态', () => {
    for (const method of ['interface', 'prepare', 'round']) {
        const c = cases.find(c => c.method === method), good = specimen(c);
        validateSliceCombinationRecord(good, c);
        const bad = edit => { const r = structuredClone(good); edit(r); assert.throws(() => validateSliceCombinationRecord(r, c)); };
        bad(r => { delete r.before[0].neili; });
        bad(r => { r.before[0].skills = {}; });
        bad(r => { r.before[1].mappings.force = 'taiji-shengong'; });
        bad(r => { r.before[0].cultivation['family/family_name'] = 'wrong'; });
        bad(r => { r.method = 'unknown'; });
        if (method === 'interface') {
            bad(r => { r.interfaces[0].result = 999; });
            bad(r => { r.interfaces[0].combo = 'wrong'; });
        } else {
            bad(r => { r.prepare_steps = []; });
            bad(r => { r.prepare_steps[0].accepted = 0; });
            bad(r => { r.prepare_steps[0].action = 'prepare wrong'; });
            bad(r => { r.prepare_steps[0].after.preparations = {}; });
        }
        if (method === 'round') {
            bad(r => { r.attacks = []; });
            bad(r => { r.attacks[0].attack_skill = 'wrong'; });
            const guard = structuredClone(good);
            guard.attacks = []; guard.immediate[0].temp.guarding = 1;
            guard.after = structuredClone(guard.immediate);
            validateSliceCombinationRecord(guard, c); // A real guarding round may have zero attacks.
        }
    }
});

test('单轮新条件从空准备执行累计准备链，基本技能明确赋值', () => {
    for (const c of cases.filter(c => c.method === 'round')) {
        assert.deepEqual(c.parameters.actor.preparations, {});
        const expected = {};
        for (const e of c.parameters.prepare_commands) {
            const skill = e.action.slice('prepare '.length);
            const usage = Object.keys(c.parameters.actor.mappings).find(k => c.parameters.actor.mappings[k] === skill);
            expected[usage] = skill;
            assert.equal(c.parameters.actor.skills[usage], 200);
            assert.deepEqual(e.preparations, expected);
        }
        validateSliceCombinationRecord(specimen(c), c);
    }
});

test('六阳折梅追加攻击须具备原被动证据与对应费用，不能一律限制为两击或任意放行', () => {
    const c = cases.find(c => c.id === 'school-slice-combination-xiaoyao-liuyang-zhang-zhemei-shou-pair-l200');
    const r = specimen(c);
    r.attacks.unshift(structuredClone(r.attacks[0]), structuredClone(r.attacks[0]));
    r.passives = [{ route: 'martial', actor: 0, target: 1, skill: 'liuyang-zhang' }];
    r.metrics[0].neili_cost = 60;
    r.immediate[0].neili -= 60; r.after = structuredClone(r.immediate);
    validateSliceCombinationRecord(r, c);
    const bad = edit => { const copy = structuredClone(r); edit(copy);
        assert.throws(() => validateSliceCombinationRecord(copy, c)); };
    bad(copy => { copy.passives = []; });
    bad(copy => { copy.metrics[0].neili_cost = 0; });
    bad(copy => { copy.attacks.splice(2, 0, structuredClone(copy.attacks[0])); });
    bad(copy => { copy.attacks[2].result = -1; });
    bad(copy => { copy.immediate[0].temp.is_attacking = 1; copy.after = structuredClone(copy.immediate); });
    const ordinary = cases.find(c => c.method === 'round' && c.parameters.school === 'duan');
    const extra = specimen(ordinary); extra.attacks.push(structuredClone(extra.attacks[0]));
    assert.throws(() => validateSliceCombinationRecord(extra, ordinary));
});
