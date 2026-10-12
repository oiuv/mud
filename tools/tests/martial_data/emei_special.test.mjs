import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { emeiSpecialConditions } from './emei_special_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'emei-special');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-emei-special-fengling-' + suffix));

// Fabricated snapshots exercise validation only, never count as game evidence.
function fixture(c) {
    const p = c.parameters, a = p.actor, props = a.properties;
    let before = { contribution: props.gongxian, jing: 10000, neili: props.neili, max_neili: props.max_neili,
        max_jingli: 0, potential: props.potential, learned_points: props.learned_points,
        effective_force: Math.trunc(a.skills.force / 2), effective_dodge: 0,
        shen: props.shen, str: props.str, combat_exp: props.combat_exp,
        grants: Object.fromEntries(p.monitored_grants.map(g => [g, 0])),
        skills: { ...a.skills }, learned: {}, mappings: { ...a.mappings },
        family: props['family/family_name'], master_id: props['family/master_id'], master_name: props['family/master_name'] };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before);
        after.contribution -= e.contribution_spent; after.jing -= 12;
        after.skills = { ...e.skills_after }; after.learned = { ...e.learned_after };
        after.grants[e.grant] = e.value;
        const step = { teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
            student: '/tests/teaching_actor#1', command: e.action, command_accepted: 1,
            elapsed: 0.001, before: structuredClone(before), after,
            message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: [{ category: 'test', text: e.response_contains }] };
        before = after; return step;
    });
}

test('风陵两主题38条件76记录，旧11265条件完整指纹不变', () => {
    assert.equal(cases.length, 38); assert.equal(cases.reduce((n,c) => n+c.samples, 0), 76);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 22);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    const old = all.slice(0, 11265);
    assert.equal(old.length, 11265); assert.equal(old.reduce((n,c) => n+c.samples, 0), 48202);
    assert.equal(sha256(JSON.stringify(old)), '43c3922a44d1d7433241b46dbc5aee47b8eca7ef1ab5f2f26e1343e860dca508');
    for (const c of cases) validateTeachingObservation(fixture(c), c);
});

test('各门槛独立降低，当前内力与师父中文名不冒充原传招条件', () => {
    for (const id of ['yun', 'zhao']) {
        for (const variant of ['contribution-low', 'max-neili-low', 'shen-low', 'family-other',
            'master-other', 'skill-zero', 'skill-low', 'force-low'])
            assert.equal(get(id + '-' + variant).parameters.expected, 'refused');
        for (const variant of ['master-name-other', 'current-neili-zero'])
            assert.equal(get(id + '-' + variant).parameters.expected, 'observed');
        assert.equal(get(id + '-grant').parameters.teaching_expectations[0].contribution_spent, id === 'yun' ? 1800 : 2200);
    }
});

test('经验限制技能奖励但不限制授招，武学修养仍按原函数提升', () => {
    for (const id of ['yun', 'zhao']) {
        for (const variant of ['experience-zero', 'experience-low']) {
            const p = get(id + '-' + variant).parameters, e = p.teaching_expectations[0];
            assert.equal(e.value, 1); assert.equal(e.skills_after.strike, p.actor.skills.strike);
            assert.equal(e.skills_after['piaoxue-zhang'], p.actor.skills['piaoxue-zhang']);
            assert.equal(e.skills_after['martial-cognize'], 101);
            assert.deepEqual(e.learned_after, { 'martial-cognize': 0 });
        }
        const exact = get(id + '-experience-floor').parameters;
        assert.equal(exact.teaching_expectations[0].skills_after.strike, exact.actor.skills.strike + 1);
        const basic = get(id + '-basic-reward-capped').parameters.teaching_expectations[0];
        assert.equal(basic.skills_after.strike, 800); assert.equal(basic.learned_after.strike, undefined);
        const special = get(id + '-special-reward-capped').parameters.teaching_expectations[0];
        assert.equal(special.skills_after['piaoxue-zhang'], 800);
        assert.equal(special.learned_after['piaoxue-zhang'], undefined);
    }
});

test('高等级记录实际进度不虚报升级，两种双招顺序保留状态与费用', () => {
    for (const id of ['yun', 'zhao']) {
        const p = get(id + '-high-level-progress').parameters;
        assert.equal(p.teaching_expectations[0].skills_after.strike, 800);
        assert.equal(p.teaching_expectations[0].learned_after.strike, 200001);
        assert.equal(p.teaching_expectations[0].learned_after['piaoxue-zhang'], 200001);
        const c = get(id + '-both-and-repeat'), steps = fixture(c);
        const observed = validateTeachingObservation(steps, c);
        assert.deepEqual(observed.map(s => s.acquired), [true, true, false, false]);
        assert.equal(observed.reduce((n,s) => n+s.contribution_spent, 0), 4000);
        assert.equal(steps.at(-1).after.skills['martial-cognize'], 102);
        for (const candidate of [p, c.parameters]) assert.equal(candidate.actor.temp, undefined);
    }
});

test('拒绝伪造奖励、重复扣费、资源变化、丢失原回复及连续状态重置', () => {
    for (const mutate of [
        r => r[0].after.skills.strike++, r => r[0].after.learned['unexpected-skill'] = 1,
        r => r[0].after.neili--, r => r[0].after.combat_exp--,
        r => r[0].messages = [], r => r[1].before.contribution++,
        r => r[1].after.contribution--, r => r[1].after.skills['piaoxue-zhang']++,
        r => r[1].student = '/tests/teaching_actor#3',
    ]) {
        const c = get('yun-repeat'), steps = fixture(c); mutate(steps);
        assert.throws(() => validateTeachingObservation(steps, c));
    }
});

test('源文件变动必须重审，风陵条件模块进入完整冻结清单', () => {
    const read = p => readFileSync(root + '/' + p, 'utf8');
    assert.throws(() => emeiSpecialConditions(relations, catalog,
        p => read(p) + (p === 'feature/skill.c' ? '\n//changed' : '')), /源码变化/);
    assert.ok(read('tools/tests/martial_data/execution.mjs').includes("'emei_special_cases'"));
    assert.deepEqual(emeiSpecialConditions({ ...relations, objects: [] }, catalog, read), []);
});
