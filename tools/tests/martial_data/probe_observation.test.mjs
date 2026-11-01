import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validateProbeAbilityRecord } from './probe_observation.mjs';

const grant = 'can_perform/demo/hit';
function teaching() {
    const state = { jing: 100, neili: 100, skills: { finger: 100 }, mappings: {},
        grants: { [grant]: 0 }, learned: { finger: 0 }, learned_points: 0,
        family: null, master_id: null, master_name: null };
    const condition = { id: 'probe-teacher', parameters: {
        probe_contract: 2, teaching_profile: 'probe', teaching_kind: 'ask_topic',
        action: 'ask teacher about 真传', teacher: { id: 'teacher', path: '/teacher' },
        monitored_grants: [grant], teaching_expectations: [{}] } };
    const raw = { kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: 'refused',
        teaching: [{ command: condition.parameters.action, student: '/student#1', teacher: '/teacher#1',
            teacher_program: '/teacher', elapsed: 0.1, command_accepted: 1,
            before: structuredClone(state), after: structuredClone(state) }],
        before: [{ object: '/student#1', ...structuredClone(state) }],
        after: [{ object: '/student#1', ...structuredClone(state) }], metrics: [{}] };
    return { raw, condition };
}

test('teaching validates actual grants, not skill mappings or invented recruitment flags', () => {
    const { raw, condition } = teaching();
    assert.equal(validateTeachingRecord(raw, condition)[0].advanced, false);
    raw.outcome = 'observed';
    assert.throws(() => validateTeachingRecord(raw, condition), /无实际/);
    raw.teaching[0].recruited = true;
    raw.teaching[0].family_changed = true;
    assert.throws(() => validateTeachingRecord(raw, condition), /无实际/);
    raw.teaching[0].after.grants[grant] = 1;
    assert.equal(validateTeachingRecord(raw, condition)[0].advanced, true);
    raw.outcome = 'refused';
    assert.throws(() => validateTeachingRecord(raw, condition), /有实际/);
    raw.teaching[0].after.grants[grant] = 0;
    delete raw.teaching[0].before.grants[grant];
    assert.throws(() => validateTeachingRecord(raw, condition), /实际授权观察/);
});

test('command, student, teacher, repeated-step resources and grants cannot be substituted', () => {
    for (const mutate of [
        r => r.teaching[0].command = 'say unrelated',
        r => r.teaching[0].student = '/other#2',
        r => r.teaching[0].teacher_program = '/other',
        r => r.teaching[0].teacher = '/other#2',
        r => r.after[0].jing++,
    ]) {
        const { raw, condition } = teaching(); mutate(raw);
        assert.throws(() => validateTeachingRecord(raw, condition));
    }
    const { raw, condition } = teaching();
    condition.parameters.teaching_expectations.push({});
    raw.teaching.push(structuredClone(raw.teaching[0]));
    validateTeachingRecord(raw, condition);
    raw.teaching[1].before.grants[grant] = 1;
    assert.throws(() => validateTeachingRecord(raw, condition), /状态被重置/);
});

test('learning progress is measured from the real skill, not command acceptance', () => {
    const { raw, condition } = teaching(), p = condition.parameters;
    p.teaching_kind = 'learn_gate'; p.skill = 'finger';
    p.action = raw.teaching[0].command = 'learn teacher finger 1';
    raw.outcome = 'observed';
    raw.teaching[0].after.learned.finger = 3;
    assert.equal(validateTeachingRecord(raw, condition)[0].advanced, true);
    raw.teaching[0].after.learned.finger = 0;
    assert.throws(() => validateTeachingRecord(raw, condition), /无实际/);
    p.action = raw.teaching[0].command = 'learn teacher 1';
    assert.throws(() => validateTeachingRecord(raw, condition), /真实技能/);
});

test('ability probes require reviewed configuration and actual actor/skill launches', () => {
    const condition = { id: 'probe-ability', method: 'perform', parameters: {
        variant: 'probe', probe_contract: 2, skill: 'demo', usage: 'finger', ability: 'hit',
        action: 'perform finger.hit', actor: { skills: { finger: 200, demo: 200 }, mappings: { finger: 'demo' } } } };
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: 'observed',
        before: [{ object: '/actor#1', ...structuredClone(condition.parameters.actor) }],
        after: [{ object: '/actor#1' }], command_accepted: 1,
        launches: [{ actor: '/actor#1', skill: 'demo', argument: 'hit target' }] };
    assert.equal(validateProbeAbilityRecord(raw, condition).discovery_only, true);
    for (const mutate of [
        r => r.launches = [],
        r => r.launches[0].actor = '/other#2',
        r => r.launches[0].skill = 'other',
        r => r.before[0].skills.finger = 0,
        r => r.before[0].mappings = {},
        r => r.command_accepted = 0,
    ]) {
        const changed = structuredClone(raw); mutate(changed);
        assert.throws(() => validateProbeAbilityRecord(changed, condition));
    }
    delete condition.parameters.probe_contract;
    assert.throws(() => validateProbeAbilityRecord(raw, condition), /旧通用/);
});
