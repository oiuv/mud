import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .slice(0, 11809)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile))
    .filter(c => !['lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => c.parameters.teaching_kind === 'introductory_teaching');
const get = id => structuredClone(cases.find(c => c.id === 'teaching-meizhuang-intro-' + id));

// Synthetic observations only exercise the reader; driver evidence is collected separately.
function observation(condition) {
    const p = condition.parameters;
    let before = { contribution: p.actor.properties.gongxian, balance: p.actor.properties.balance,
        jing: 10000, neili: 6000, max_neili: 6000, max_jingli: 1000, potential: 1200, learned_points: 200,
        effective_force: 0, effective_dodge: 0, shen: 0, str: 30,
        grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])),
        skills: { ...p.actor.skills }, learned: {}, mappings: {},
        family: p.actor.properties['family/family_name'], master_id: null };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before);
        Object.assign(after.grants, e.grants_after); Object.assign(after.skills, e.skills_after);
        after.contribution -= e.contribution_spent; after.balance -= e.balance_spent; after.jing -= 12;
        const teacher = e.teacher ?? p.teacher;
        const step = { student: '/tests/actor#1', teacher: teacher.path + '#2', teacher_program: teacher.path,
            command: e.action ?? p.action, command_accepted: 1, elapsed: 0.01,
            before: structuredClone(before), after, message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: e.response_contains ? [{ category: 'vision', text: e.response_contains }] : [] };
        before = structuredClone(after); return step;
    });
}

test('四庄主独立日月入口追加56条件，不覆盖既有2537条件', () => {
    assert.equal(all.length, 2593); assert.equal(cases.length, 56);
    assert.equal(teachingEntries(cases).length, 4); assert.equal(teachingEntries(all).length, 254);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(p.teaching_entry.function, 'ask_riyue');
        assert.equal(p.monitored_grants.length, 8);
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        assert.equal(validateTeachingObservation(observation(c), c).length, p.teaching_expectations.length);
    }
});

test('贡献和存款采用原严格大于门槛，精确门槛只取得免费入门', () => {
    for (const file of ['danqing', 'tubi', 'heibai', 'huang']) {
        const paid = get(file + '-paid').parameters;
        assert.equal(paid.actor.properties.gongxian, 10001);
        assert.equal(paid.actor.properties.balance, 100000001);
        assert.equal(paid.teaching_expectations[0].contribution_spent, 10000);
        assert.equal(paid.teaching_expectations[0].balance_spent, 100000000);
        for (const variant of ['contribution-at', 'balance-at', 'both-at']) {
            const e = get(file + '-' + variant).parameters.teaching_expectations[0];
            assert.equal(e.balance_spent, 0); assert.equal(e.contribution_spent, 0);
            assert.equal(Object.values(e.grants_after).reduce((a, b) => a + b, 0), 1);
        }
        for (const variant of ['family-other', 'family-empty'])
            assert.equal(get(file + '-' + variant).parameters.expected, 'refused');
    }
});

test('保留高等级降至10的MA-047，不在夹具或读取器中偷偷修正', () => {
    for (const file of ['danqing', 'tubi', 'heibai', 'huang']) {
        const c = get(file + '-level-20'), p = c.parameters;
        const skill = Object.keys(p.teaching_expectations[0].skills_after)[0];
        assert.equal(p.actor.skills[skill], 20); assert.equal(p.known_issue, 'MA-047');
        assert.equal(p.teaching_expectations[0].skills_after[skill], 10);
        const steps = observation(c); steps[0].after.skills[skill] = 20;
        assert.throws(() => validateTeachingObservation(steps, c), /技能状态不符/);
    }
});

test('真实首轮取得共享许可，重复及跨庄主不再扣费或获得另一门技能', () => {
    for (const file of ['danqing', 'tubi', 'heibai', 'huang']) {
        for (const variant of ['repeat-paid', 'repeat-free', 'cross-paid', 'cross-free']) {
            const c = get(file + '-' + variant), p = c.parameters, steps = observation(c);
            assert.deepEqual(steps[1].before, steps[0].after);
            const result = validateTeachingObservation(steps, c);
            assert.deepEqual(result.map(r => r.advanced), [true, false]);
            assert.equal(result[1].balance_spent, 0); assert.equal(result[1].contribution_spent, 0);
            if (variant.startsWith('cross')) {
                assert.notEqual(p.teaching_expectations[1].teacher.path, p.teacher.path);
                assert.equal(p.teaching_expectations[1].teaching_entry.function, 'ask_riyue');
            }
        }
    }
});

test('拒绝缺失存款、错误扣费、额外领悟和未声明技能变化', () => {
    const c = get('huang-paid');
    for (const [mutate, reason] of [
        [s => { delete s.before.balance; }, /存款观察/],
        [s => { s.after.balance++; }, /存款扣除/],
        [s => { s.after.contribution++; }, /贡献扣除/],
        [s => { s.after.grants['can_perform/pomopima-jian/zui'] = 1; }, /许可写入/],
        [s => { s.after.skills['pomopima-jian'] = 10; }, /原等级变化/],
        [s => { s.after.learned['qixian-wuxingjian'] = 10; }, /学习进度/],
    ]) {
        const steps = observation(c); mutate(steps[0]);
        assert.throws(() => validateTeachingObservation(steps, c), reason);
    }
});

test('跨教师仍核验版本与同一学生连续状态，不能以换对象绕过共享许可', () => {
    const c = get('huang-cross-paid');
    for (const [mutate, reason] of [
        [s => { s.before.grants['can_learn/meizhuang'] = 0; }, /重置或注入/],
        [s => { s.student = '/tests/actor#3'; }, /换了学生/],
        [s => { s.teacher_program = c.parameters.teacher.path; }, /教师来源/],
    ]) {
        const steps = observation(c); mutate(steps[1]);
        assert.throws(() => validateTeachingObservation(steps, c), reason);
    }
    const changed = structuredClone(c);
    changed.parameters.teaching_expectations[1].teacher.sha256 = 'wrong';
    assert.throws(() => validateTeachingObservation(observation(changed), changed), /教师版本/);
    const unconfigured = structuredClone(c); delete unconfigured.parameters.teaching_expectations[1].teacher;
    assert.throws(() => validateTeachingObservation(observation(c), unconfigured), /教师来源/);
});
