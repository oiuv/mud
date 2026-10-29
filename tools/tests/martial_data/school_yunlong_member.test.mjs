import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { yunlongMemberConditions, validateYunlongMemberRecord } from './school_yunlong_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root)), cases = yunlongMemberConditions(catalog, read);
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
        effective_skills: { force: Math.trunc(cfg.skills.force / 2) + (cfg.skills['yunlong-shengong'] ?? 0) },
    }));
    const r = { method: c.method, outcome: p.expected, before, immediate: structuredClone(before),
        launches: [], directs: [], interfaces: [], attacks: [], passives: [], metrics: [{}, {}], reason: p.refusal };
    const [b, t] = before, [a, v] = r.immediate;
    if (p.ability === 'ordinary') {
        r.attacks.push({ actor: 0, target: 1, type: 0, attack_skill: p.skill,
            attack_usage: p.usage, result: 0, damage: 10 });
        if (b.jiali) {
            a.neili -= b.jiali;
            r.passives.push({ route: 'force', actor: 0, target: 1, skill: 'yunlong-shengong', factor: b.jiali, result: 10 });
        }
        r.passives.push({ route: 'martial', actor: 0, target: 1, skill: p.skill, factor: 0, result: null });
        v.qi -= 10; v.eff_qi -= 2;
        r.metrics[0].neili_cost = b.jiali; r.metrics[1].qi_cost = 10; r.metrics[1].eff_qi_cost = 2;
    } else {
        r.interfaces.push({ ...p.interface, result: p.ability === 'query_skill_name' ? p.expected_name : p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            const [qi, neili] = p.skill === 'yunlong-shou' ? [62, 59] : [55, 62];
            a.qi -= qi; a.neili -= neili; r.metrics[0].qi_cost = qi; r.metrics[0].neili_cost = neili;
        }
    }
    r.after = structuredClone(r.immediate); return r;
}
test('云龙两成员73条件1910正式/146烟雾，旧云龙爪unarmed能力单独保留', () => {
    assert.equal(cases.length, 73); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 1910);
    assert.equal(yunlongMemberConditions(catalog, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 146);
    assert.deepEqual(schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 's1-yunlong'), cases);
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    assert.throws(() => yunlongMemberConditions(catalog, p => read(p) + ' '), /重新审阅/);
    assert.equal(cases.filter(c => c.method === 'ordinary' && c.parameters.usage === 'unarmed').length, 6);
});
test('云龙爪不是招架，云龙手不是unarmed；查询0不冒充资格拒绝或已有绝招', () => {
    for (const [suffix, expected] of [['yunlong-shou-valid_enable-parry', 1], ['yunlong-shou-valid_enable-unarmed', 0],
        ['yunlong-zhua-valid_enable-parry', 0], ['yunlong-zhua-valid_enable-unarmed', 1]]) {
        const c = find(suffix); assert.equal(c.parameters.expected_result, expected); assert.equal(c.parameters.expected, 'observed');
    }
    assert.ok(cases.every(c => !['perform', 'exert'].includes(c.method)));
    const c = find('yunlong-zhua-ordinary-unarmed-l200-jiali0'), r = row(c);
    r.attacks[0].attack_usage = 'claw'; assert.throws(() => validateYunlongMemberRecord(r, c));
});
test('MA-013名称错键原样返回零，169/170边界不补造名称或删除结果字段', () => {
    assert.equal(find('yunlong-shou-query_skill_name-level169').parameters.expected_name, '如烟往事');
    const c = find('yunlong-shou-query_skill_name-level170');
    assert.equal(c.parameters.expected_name, null); validateYunlongMemberRecord(row(c), c);
    for (const value of ['我心依旧', '', false]) {
        const r = row(c); r.interfaces[0].result = value; assert.throws(() => validateYunlongMemberRecord(r, c));
    }
    const zero = row(c); zero.interfaces[0].result = 0; validateYunlongMemberRecord(zero, c);
    const missing = row(c); delete missing.interfaces[0].result; assert.throws(() => validateYunlongMemberRecord(missing, c));
});
test('学习与练习不同门槛及费用，不为外观空手检查新增游戏规则', () => {
    const armed = find('yunlong-shou-practice_skill-secondary_weapon');
    assert.equal(armed.parameters.expected, 'observed'); validateYunlongMemberRecord(row(armed), armed);
    const c = find('yunlong-zhua-practice_skill-baseline'), r = row(c);
    r.immediate[0].neili++; r.after = structuredClone(r.immediate); assert.throws(() => validateYunlongMemberRecord(r, c));
    for (const suffix of ['yunlong-shou-valid_learn-force99', 'yunlong-zhua-valid_learn-max-neili799',
        'yunlong-shou-valid_learn-minimum-basic99', 'yunlong-zhua-valid_learn-basic199'])
        assert.equal(find(suffix).parameters.expected, 'refused');
});
test('回调、实际映射、初态和副手对象须核对，不用配置声明代替效果', () => {
    const c = find('yunlong-zhua-ordinary-claw-l400-jiali50');
    for (const mutate of [r => r.passives.shift(), r => { r.before[0].mappings.claw = 'other'; },
        r => { r.passives[1].result = 1; }, r => { r.metrics[0].heartbeats = 1; }]) {
        const r = row(c); mutate(r); assert.throws(() => validateYunlongMemberRecord(r, c));
    }
    const side = find('yunlong-shou-valid_learn-secondary_weapon'), r = row(side);
    r.before[0].secondary_weapon_details.program = '/fake/sword'; assert.throws(() => validateYunlongMemberRecord(r, side));
});
test('真实runner提供窄名称查询、空直伤观察和双路攻击用途，不只验证合成记录', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /finite original Yunlong name query/);
    assert.match(runner, /"query_skill_name",\s*"query_parry_msg"/);
    assert.match(runner, /if \(spec\["function"\] == "query_skill_name"\)\s*require\(member_array\(current\["parameters"\]\["collection_group"\],\s*\(\{ "s1-yunlong", "s1-qianye", "s1-sanyin", "s1-mizong" \}\)\) != -1,\s*"finite member name query observation"\);/);
    const directGroups = runner.match(/if \(member_array\(\s*current\["parameters"\]\["collection_group"\],\s*\(\{([^{}]*)\}\)\s*\) != -1\)\s*current\["directs"\] = \(\{\}\);/);
    assert.ok(directGroups); assert.match(directGroups[1], /"s1-yunlong"/);
    const c = find('yunlong-shou-ordinary-hand-l200-jiali0'), r = row(c);
    delete r.directs; assert.throws(() => validateYunlongMemberRecord(r, c));
});
