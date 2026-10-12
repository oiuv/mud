import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root, parseArgs } from '../../collect_martial_data.mjs';
import { fengSources, fengGrants, fengTeachingConditions } from './feng_teaching_cases.mjs';
import { teachingEntries } from './teaching_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';
import { selectConditions } from './execution.mjs';

const read = path => readFileSync(root + '/' + path, 'utf8');
const relations = { objects: [{ path: 'kungfu/class/huashan/feng.c',
    sha256: fengSources['kungfu/class/huashan/feng.c'], learning_permissions: [] }] };
const catalog = { skills: [{ id: 'dugu-jiujian' }] };
const cases = fengTeachingConditions(relations, catalog, read);
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-feng-' + suffix));

// Fabricated observations only test the reader. They are not gameplay evidence.
function knowledge(c, wins = [true, false]) {
    const p = c.parameters;
    let before = { ...p.actor.properties, skills: { ...p.actor.skills }, learned: {}, mappings: {},
        grants: Object.fromEntries(fengGrants.map(k => [k, 0])),
        feng_flags: { blocked: 0, told: 0, visited: 0 }, contribution: 0, balance: 0,
        family: p.actor.properties['family/family_name'], effective_int: p.actor.properties.int };
    return p.teaching_expectations.map((e, i) => {
        const after = structuredClone(before), key = 'can_perform/dugu-jiujian';
        after.jing -= 12;
        if (before.skills['dugu-jiujian'] && !before.grants[key]) {
            const available = before.potential - before.learned_points;
            after.learned_points += Math.min(available, 10);
            if (available >= 10 && wins[i]) {
                after.grants[key] = [...p.knowledge_types];
                for (const skill of ['sword', 'dugu-jiujian', 'martial-cognize']) {
                    if (skill !== 'martial-cognize' && before.combat_exp === 0) continue;
                    after.skills[skill]++; after.learned[skill] = 0;
                }
            }
        }
        const row = { student: '/tests/teaching_actor#1', teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
            command: p.action, command_accepted: 1, elapsed: 0.01, before: structuredClone(before), after,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [] };
        before = structuredClone(after); return row;
    });
}

test('风清扬条件不预写许可，普通学习和八种随机知识分开，源码版本冻结', () => {
    assert.equal(cases.length, 47);
    assert.equal(teachingEntries(cases).length, 2);
    assert.ok(cases.every(c => c.parameters.actor.properties['can_perform/dugu-jiujian'] === undefined));
    assert.equal(get('learn-sword-int35').parameters.expected, 'observed');
    assert.equal(get('learn-dugu-jiujian-int35').parameters.expected, 'refused');
    assert.equal(get('learn-dugu101').parameters.teaching_expectations[0].told, 1);
    assert.deepEqual(get('knowledge-staff').parameters.knowledge_types, ['staff']);
    assert.throws(() => fengTeachingConditions(relations, catalog, path => read(path) + '// drift'));
});

test('首次获授、重复询问免扣潜能；随机失败仍扣10，不靠文字或命令返回判定', () => {
    const c = get('knowledge-sword');
    for (const wins of [[true, false], [false, true], [false, false]]) {
        const result = validateTeachingObservation(knowledge(c, wins), c);
        assert.deepEqual(result.map(s => s.knowledge_acquired), wins);
        assert.deepEqual(result.map(s => s.learned_points_spent), wins[0] ? [10, 0] : [10, 10]);
    }
    const forged = knowledge(c); forged[0].after.learned_points = 0;
    assert.throws(() => validateTeachingObservation(forged, c));
    const fakeGrant = knowledge(c); fakeGrant[0].after.grants['can_perform/dugu-jiujian'] = ['sword', 'spear'];
    assert.throws(() => validateTeachingObservation(fakeGrant, c));
    const reset = knowledge(c); reset[1].before.learned_points = 0;
    assert.throws(() => validateTeachingObservation(reset, c));
});

test('潜能不足消耗余数，无独孤技能不扣，经验不足不奖励剑法但仍奖励认知', () => {
    for (const suffix of ['potential0', 'potential9', 'potential10', 'no-dugu', 'exp0', 'nothing', 'not-learning-qualified']) {
        const c = get('knowledge-' + suffix);
        validateTeachingObservation(knowledge(c), c);
        validateTeachingObservation(knowledge(c, [false, false]), c);
    }
    const c = get('knowledge-exp0'), forged = knowledge(c); forged[0].after.skills.sword++;
    assert.throws(() => validateTeachingObservation(forged, c));
});

test('教学前缀只选新系列，不支持与精确条件混用或扩大其他模式参数', () => {
    const options = parseArgs(['teaching', '--case-prefix', 'teaching-feng-knowledge-']);
    assert.equal(selectConditions(cases, options).length, 15);
    assert.throws(() => parseArgs(['teaching', '--case', 'one', '--case-prefix', 'two']));
    assert.throws(() => parseArgs(['school-team', '--case-prefix', 'one']));
});
