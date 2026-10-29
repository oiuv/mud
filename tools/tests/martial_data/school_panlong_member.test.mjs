import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { panlongMemberConditions, validatePanlongMemberRecord } from './school_panlong_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = panlongMemberConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), object: '/tests/actor#' + i,
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        temp: { apply: { armor: 100 } }, learned: {},
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills['miaojia-neigong'] ?? 0),
            claw: Math.trunc((cfg.skills.claw ?? 0) / 2) + (cfg.mappings.claw ? cfg.skills['panlong-zhao'] : 0) },
    }));
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        launches: [], directs: [], interfaces: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    const [b] = before, [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, attack_skill: p.skill,
            attack_usage: 'claw', result: 0, damage: 10 });
        if (b.jiali) {
            a.neili -= b.jiali;
            r.passives.push({ route: 'force', actor: 0, target: 1, skill: 'miaojia-neigong', factor: b.jiali, result: 10 });
        }
        r.passives.push({ route: 'martial', actor: 0, target: 1, skill: p.skill, factor: 0, result: null });
        v.qi -= 10; v.eff_qi -= 2;
        r.metrics[0].neili_cost = b.jiali; r.metrics[1].qi_cost = 10; r.metrics[1].eff_qi_cost = 2;
    } else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            a.qi -= 60; a.neili -= 69; r.metrics[0].qi_cost = 60; r.metrics[0].neili_cost = 69;
        }
    }
    r.after = structuredClone(r.immediate); return r;
}

test('盘龙爪本体29条件646正式/58烟雾，注册全量入口且不冒充tan覆盖', () => {
    assert.equal(cases.length, 29); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 646);
    assert.equal(panlongMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 58);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-panlong'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.ok(cases.every(c => ['ordinary', 'interface'].includes(c.method)));
    assert.throws(() => panlongMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
});
test('有效爪法30要求未激发原始60，而原始基本功还须不少于特殊等级', () => {
    for (const [suffix, raw, expected] of [['minimum-basic29', 58, 'refused'], ['minimum-basic30', 60, 'observed'],
        ['basic199', 199, 'refused'], ['basic200', 200, 'observed']]) {
        const c = find(suffix); assert.equal(c.parameters.actor.skills.claw, raw);
        assert.equal(c.parameters.expected, expected); validatePanlongMemberRecord(row(c), c);
    }
    const c = find('minimum-basic30'), r = row(c); r.before[0].effective_skills.claw = 29;
    assert.throws(() => validatePanlongMemberRecord(r, c));
});
test('学习与练习都检查双手；练习气血70内力80、原费用60/69必须一致', () => {
    for (const ability of ['valid_learn', 'practice_skill']) for (const slot of ['weapon', 'secondary_weapon'])
        assert.equal(find(ability + '-' + slot).parameters.expected, 'refused');
    const c = find('practice_skill-baseline'), r = row(c); r.immediate[0].neili++;
    r.after = structuredClone(r.immediate); assert.throws(() => validatePanlongMemberRecord(r, c));
    const armed = find('practice_skill-secondary_weapon'), side = row(armed);
    side.before[0].secondary_weapon_details.program = '/fake/sword';
    assert.throws(() => validatePanlongMemberRecord(side, armed));
});
test('实际苗家内功回调/攻击用途/身份和空观察阵列必须保留', () => {
    const c = find('ordinary-l400-jiali50');
    for (const mutate of [r => r.passives.shift(), r => { r.passives[1].result = 1; },
        r => { r.attacks[0].attack_usage = 'strike'; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].mappings.force = 'other'; }, r => { r.metrics[0].heartbeats = 1; },
        r => { delete r.directs; }, r => { r.immediate[0].qi--; r.after = structuredClone(r.immediate); }]) {
        const r = row(c); mutate(r); assert.throws(() => validatePanlongMemberRecord(r, c));
    }
    assert.equal(find('valid_enable-sword').parameters.expected_result, 0);
    assert.equal(find('valid_enable-sword').parameters.expected, 'observed');
});
