import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { duanMemberConditions, validateDuanMemberRecord } from './school_duan_member_cases.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { digest } from './ledger.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const allMemberCases = duanMemberConditions(catalog, read);
const cases = allMemberCases.filter(c => !c.parameters.mapped_force);
const find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((a, i) => ({
        ...structuredClone(a.properties), cultivation: { 'family/family_name': a.properties['family/family_name'] },
        object: '/tests/actor#' + i, userp: 1, interactive: 1, wizardp: 0,
        skills: structuredClone(a.skills), mappings: structuredClone(a.mappings),
        preparations: structuredClone(a.preparations), temp: { apply: {} },
        weapon: a.equipment?.slot === 'secondary_weapon' ? 'none' : a.equipment?.type ?? 'none',
        secondary_weapon: a.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none',
        secondary_weapon_details: a.equipment?.slot === 'secondary_weapon' ? { program: '/tests/sword' } : {},
    }));
    const r = { method: c.method, outcome: p.expected, reason: p.refusal, before,
        immediate: structuredClone(before), interfaces: [], attacks: [], launches: [], passives: [], metrics: [{}, {}] };
    if (p.ability === 'ordinary') r.attacks.push({ actor: 0, target: 1, type: 0,
        result: 0, attack_usage: p.usage, attack_skill: p.skill });
    else {
        r.interfaces.push({ ...p.interface, result: p.expected_result });
        if (p.ability === 'practice_skill' && p.expected_result) {
            const qi = p.skill === 'jinyu-quan' ? 35 : 40, neili = p.skill === 'jinyu-quan' ? 21 : 13;
            r.immediate[0].qi -= qi; r.immediate[0].neili -= neili;
            r.metrics[0].qi_cost = qi; r.metrics[0].neili_cost = neili;
        }
    }
    r.after = structuredClone(r.immediate);
    if (p.mapped_force && p.actor.properties.jiali) {
        r.passives.push({ route: 'force', actor: 0, target: 1, skill: 'duanshi-xinfa', factor: 50, result: 60 });
        r.metrics[0].neili_cost = 50; r.immediate[0].neili -= 50;
        r.after = structuredClone(r.immediate);
    }
    return r;
}
test('两成员48条件1272正式，烟雾96独立且现有组合不改', () => {
    assert.equal(cases.length, 48); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1272);
    assert.equal(digest(cases), 'e1bb7225040c9313f2e19a9e28ab75a3714e857b064c9c2f2f5d20d3cda8888d',
        '保留既有正式48条件逐字段身份');
    assert.equal(cases.filter(c => c.samples === 100).length, 12);
    const smoke = duanMemberConditions(catalog, read, { smoke: true }).filter(c => !c.parameters.mapped_force);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 96);
    assert.equal(new Set(cases.map(c => c.id)).size, 48);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 's1-duan-members'), allMemberCases);
    const combinations = all.filter(c => c.parameters.collection_group === 'slice-combination');
    assert.equal(combinations.length, 282);
    assert.equal(combinations.reduce((n, c) => n + c.samples, 0), 7424);
});
test('段氏心法扩展单列12条件1200样本，逐次原内功调用与费用对应', () => {
    const mapped = allMemberCases.filter(c => c.parameters.mapped_force);
    assert.equal(mapped.length, 12); assert.equal(mapped.reduce((n, c) => n + c.samples, 0), 1200);
    for (const c of mapped) validateSchoolCombatRecord(row(c), c);
    const c = mapped.find(c => c.parameters.actor.properties.jiali === 50), r = row(c);
    r.passives = []; assert.throws(() => validateSchoolCombatRecord(r, c));
    const wrong = row(c); wrong.metrics[0].neili_cost = 0;
    assert.throws(() => validateSchoolCombatRecord(wrong, c));
    const zero = mapped.find(c => c.parameters.actor.properties.jiali === 0), fabricated = row(zero);
    fabricated.passives.push({ route: 'force', factor: 0 });
    assert.throws(() => validateSchoolCombatRecord(fabricated, zero));
});
test('审阅来源变化拒绝启动，原越爪功错文案不改', () => {
    assert.throws(() => duanMemberConditions(catalog, p => read(p) + ' '), /来源已改变/);
    assert.equal(find('wuluo-zhang-valid_learn-force19').parameters.refusal,
        '你的内功火候不够，无法学越爪功。\n');
});
test('所有条件经过注册消费者，验证原判定、使用类别、练习费用', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
});
test('学习有效等级与原始比较分开；无激发不虚增有效内功', () => {
    for (const skill of ['jinyu-quan', 'wuluo-zhang']) {
        const gate = skill === 'jinyu-quan' ? 100 : 20;
        const low = find(`${skill}-valid_learn-force${gate - 1}`), high = find(`${skill}-valid_learn-force${gate}`);
        assert.deepEqual(low.parameters.actor.mappings, {});
        assert.equal(low.parameters.actor.skills.force, (gate - 1) * 2);
        assert.equal(high.parameters.actor.skills.force, gate * 2);
        const r = row(low); r.interfaces[0].result = 1;
        assert.throws(() => validateDuanMemberRecord(r, low));
        const changed = structuredClone(low); changed.parameters.expected_result = 1;
        assert.throws(() => validateDuanMemberRecord(row(changed), changed), /原接口条件/);
    }
});
test('原清行前缀可保留，不接受错误正文或任意ANSI删除', () => {
    const c = find('jinyu-quan-valid_learn-force99'), r = row(c);
    r.reason = '\x1b[256D\x1b[K' + c.parameters.refusal;
    validateDuanMemberRecord(r, c);
    r.reason += '额外文字'; assert.throws(() => validateDuanMemberRecord(r, c));
    r.reason = '\x1b[31m' + c.parameters.refusal;
    assert.throws(() => validateDuanMemberRecord(r, c));
});
test('副手、准备、来源技能及对象状态不能伪造', () => {
    const secondary = find('jinyu-quan-valid_learn-secondary_weapon'), r = row(secondary);
    r.before[0].secondary_weapon = 'none';
    assert.throws(() => validateDuanMemberRecord(r, secondary));
    const ordinary = find('jinyu-quan-ordinary-l200-jiali0'), a = row(ordinary);
    a.attacks[0].attack_skill = 'wuluo-zhang';
    assert.throws(() => validateDuanMemberRecord(a, ordinary));
    const b = row(ordinary); b.before[0].preparations = {};
    assert.throws(() => validateDuanMemberRecord(b, ordinary));
    const c = row(ordinary); c.launches.push({ skill: 'jinyu-quan', argument: 'man' });
    assert.throws(() => validateDuanMemberRecord(c, ordinary));
});
test('练习只许原资源变化，不许凭接口返回伪称进度或对手伤害', () => {
    for (const skill of ['jinyu-quan', 'wuluo-zhang']) {
        const c = find(`${skill}-practice_skill-baseline`), r = row(c);
        r.immediate[0].skills[skill]++; r.after = structuredClone(r.immediate);
        assert.throws(() => validateDuanMemberRecord(r, c));
        const q = row(c); q.immediate[1].qi--; q.after = structuredClone(q.immediate);
        assert.throws(() => validateDuanMemberRecord(q, c));
    }
});
