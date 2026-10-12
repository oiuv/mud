// Shared public force commands, measured independently with Shaolin mappings.
import assert from 'node:assert/strict';
import { forceRecoveryConditions, validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';
import { shaolinForces, shaolinForceCapacity } from './school_shaolin_cultivation_cases.mjs';

export function shaolinRecoveryConditions(catalog, options) {
    return forceRecoveryConditions(catalog, {
        school: 'shaolin', family: '少林派', forces: shaolinForces, capacity: shaolinForceCapacity,
        sources: ['kungfu/class/shaolin/da-mo.c', 'kungfu/class/shaolin/du-e.c', 'kungfu/class/shaolin/du-yuan.c'],
    }, options);
}

export function validateShaolinRecoveryRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'shaolin');
    assert.equal(raw.outcome, p.expected);
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation));
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1); assert.equal(before.wizardp, 0);
        assert.deepEqual(before.skills, config.skills);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(raw.after[side].mappings, before.mappings);
        for (const key of ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jiali'])
            if (Object.hasOwn(config.properties, key)) assert.equal(before[key], config.properties[key], key);
    }
    validateQuanzhenRecoveryRecord(raw, condition);
    for (const step of raw.exercise_steps ?? [])
        assert.equal(step.limit, shaolinForceCapacity(p.actor, true), '少林当前内力上限');
}
