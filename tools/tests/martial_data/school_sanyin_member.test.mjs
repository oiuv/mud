import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { sanyinMemberConditions, validateSanyinMemberRecord, validateSanyinLoads } from './school_sanyin_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = sanyinMemberConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function state(cfg, i) {
    return { ...structuredClone(cfg.properties), object: '/tests/actor#' + i,
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, busy: null,
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations),
        temp: { apply: { armor: 100 } }, learned: {},
        weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'none' : cfg.equipment?.type ?? 'none',
        secondary_weapon: cfg.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: cfg.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
        effective_skills: { force: Math.trunc(cfg.skills.force / 2), claw: Math.trunc((cfg.skills.claw ?? 0) / 2)
            + (cfg.mappings.claw ? cfg.skills['sanyin-wugongzhao'] : 0),
            dodge: Math.trunc(cfg.skills.dodge / 2), parry: Math.trunc(cfg.skills.parry / 2) } };
}
function row(c) {
    const p = c.parameters, before = [state(p.actor, 0), state(p.target, 1)];
    const loader = state({ ...cases[0].parameters.actor, mappings: {}, preparations: {} }, 0);
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        skill_loads: [{ ...p.capture_skill_loads[0], load_id: 'run:skill', run_id: 'run',
            command: 'enable parry sanyin-wugongzhao', state: loader }],
        launches: [], directs: [], interfaces: [], actions: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    const [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, attack_skill: p.skill, attack_usage: 'claw', result: 0, damage: 10 });
        r.passives.push({ route: 'martial', actor: 0, target: 1, skill: p.skill, factor: 0, result: null });
        const action = p.level <= 200
            ? { action: '爪影', lvl: 120, force: 270, dodge: 60, damage: 90, skill_name: '唯我独尊', damage_type: '抓伤' }
            : { action: '极意', lvl: 200, force: 100, attack: 25, dodge: 25, parry: 25, damage: 66, skill_name: '极意', damage_type: '抓伤' };
        r.actions.push({ actor: 0, target: 1, skill: p.skill, action });
        v.qi -= 10; v.eff_qi -= 2; r.metrics[1].qi_cost = 10; r.metrics[1].eff_qi_cost = 2;
    } else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            a.qi -= 30; a.neili -= 31; r.metrics[0].qi_cost = 30; r.metrics[0].neili_cost = 31;
        }
    }
    r.after = structuredClone(r.immediate); return r;
}
test('三阴39条件764正式/78独立烟雾，200/201边界及原加载来源注册', () => {
    assert.equal(cases.length, 39); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 764);
    assert.equal(sanyinMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 78);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-sanyin'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => sanyinMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
});
test('学习检查双手但练习不限制武器；无内功门槛，原费用30/31不改', () => {
    assert.equal(find('valid_learn-force0').parameters.expected_result, 1);
    for (const slot of ['weapon', 'secondary_weapon']) {
        assert.equal(find('valid_learn-' + slot).parameters.expected, 'refused');
        assert.equal(find('practice_skill-' + slot).parameters.expected, 'observed');
    }
    const c = find('practice_skill-baseline'), r = row(c); r.immediate[0].neili++;
    r.after = structuredClone(r.immediate); assert.throws(() => validateSanyinMemberRecord(r, c));
});
test('原缺失招式名返回null，0参数与名称>=边界保留，不臆造低阶名称', () => {
    for (const level of [0, 29, 30, 59, 60, 89]) {
        const c = find('query_skill_name-l' + level); assert.equal(c.parameters.interface.argument, level);
        assert.equal(c.parameters.expected_result, null); const r = row(c); r.interfaces[0].result = '补造名称';
        assert.throws(() => validateSanyinMemberRecord(r, c));
    }
    assert.equal(find('query_skill_name-l90').parameters.expected_result, '唯我独尊');
    assert.equal(find('query_skill_name-l200').parameters.expected_result, '极意');
});
test('动态动作按首次加载有效技能而非当前400/800计算，跨记录随机常量固定', () => {
    const c = find('ordinary-l400-jiali0'), r = row(c); validateSanyinMemberRecord(r, c);
    for (const mutate of [x => { x.actions[0].action.force = 400; }, x => { x.skill_loads[0].state.wizardp = 1; },
        x => { x.skill_loads[0].state.effective_skills.claw = 200; }, x => { x.passives[0].route = 'force'; },
        x => { x.attacks[0].attack_usage = 'hand'; }, x => { delete x.actions; }]) {
        const value = row(c); mutate(value); assert.throws(() => validateSanyinMemberRecord(value, c));
    }
    const r2 = row(c); r2.actions[0].action.force++;
    assert.throws(() => validateSanyinLoads([r, r2]), /不得逐样本/);
    const r3 = row(c); r3.skill_loads[0].state.skills.force++;
    assert.throws(() => validateSanyinLoads([r, r3]), /来源不得/);
    assert.deepEqual(validateSanyinLoads([r, row(find('ordinary-l800-jiali0'))]), { loads: 1, dynamic_actions: 1 });
});
