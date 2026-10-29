import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { qianyeMemberConditions, validateQianyeMemberRecord } from './school_qianye_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = qianyeMemberConditions(catalog, read);
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
        effective_skills: { force: Math.trunc(cfg.skills.force / 2),
            hand: Math.trunc((cfg.skills.hand ?? 0) / 2) + (cfg.mappings.hand ? cfg.skills['qianye-shou'] : 0) },
    }));
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        launches: [], directs: [], interfaces: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    const [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, attack_skill: p.skill,
            attack_usage: 'hand', result: 0, damage: 10 });
        r.passives.push({ route: 'martial', actor: 0, target: 1, skill: p.skill, factor: 0, result: null });
        v.qi -= 10; v.eff_qi -= 2;
        r.metrics[1].qi_cost = 10; r.metrics[1].eff_qi_cost = 2;
    } else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            a.qi -= 68; a.neili -= 64; r.metrics[0].qi_cost = 68; r.metrics[0].neili_cost = 64;
        }
    }
    r.after = structuredClone(r.immediate); return r;
}
test('千叶手38条件664正式/76独立烟雾，注册原接口且不冒师承或绝招', () => {
    assert.equal(cases.length, 38); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 664);
    assert.equal(qianyeMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 76);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-qianye'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.ok(cases.every(c => ['ordinary', 'interface'].includes(c.method)));
    assert.throws(() => qianyeMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
});
test('名称返回字符串，0参数保留，>=命名边界不替代普通选招>', () => {
    for (const [level, name] of [[0, '南海礼佛'], [29, '南海礼佛'], [30, '金玉瓦砾'], [160, '觉后空空'], [800, '觉后空空']]) {
        const c = find('query_skill_name-l' + level);
        assert.equal(c.parameters.interface.argument, level); assert.equal(c.parameters.expected_result, name);
        validateQianyeMemberRecord(row(c), c);
        const r = row(c); r.interfaces[0].result = 1;
        assert.throws(() => validateQianyeMemberRecord(r, c));
    }
    assert.equal(find('valid_combine-jinyu-quan').parameters.expected, 'observed');
    assert.equal(find('valid_combine-jinyu-quan').parameters.expected_result, 0);
});
test('有效内功40用原始80，基本手法比较原值，双手练习拒绝与费用68/64严格', () => {
    assert.equal(find('valid_learn-force39').parameters.actor.skills.force, 78);
    assert.equal(find('valid_learn-force40').parameters.actor.skills.force, 80);
    for (const ability of ['valid_learn', 'practice_skill']) for (const slot of ['weapon', 'secondary_weapon'])
        assert.equal(find(ability + '-' + slot).parameters.expected, 'refused');
    const c = find('practice_skill-baseline'), r = row(c); r.immediate[0].neili++;
    r.after = structuredClone(r.immediate); assert.throws(() => validateQianyeMemberRecord(r, c));
    const c2 = find('valid_learn-force40'), r2 = row(c2); r2.before[0].effective_skills.force = 39;
    assert.throws(() => validateQianyeMemberRecord(r2, c2));
    const armed = find('practice_skill-secondary_weapon'), side = row(armed);
    side.before[0].secondary_weapon_details.program = '/fake/sword';
    assert.throws(() => validateQianyeMemberRecord(side, armed));
});
test('无特殊内功映射不补回调或费用，攻击用途/真实USER/空阵列缺一即拒绝', () => {
    const c = find('ordinary-l400-jiali50');
    for (const mutate of [r => r.passives.pop(), r => { r.passives[0].result = 1; },
        r => { r.passives[0].route = 'force'; }, r => { r.metrics[0].neili_cost = 50; },
        r => { r.attacks[0].attack_usage = 'strike'; }, r => { r.before[0].wizardp = 1; },
        r => { r.before[0].mappings.force = 'other'; }, r => { r.metrics[0].heartbeats = 1; },
        r => { delete r.directs; }, r => { r.immediate[0].qi--; r.after = structuredClone(r.immediate); }]) {
        const r = row(c); mutate(r); assert.throws(() => validateQianyeMemberRecord(r, c));
    }
});
