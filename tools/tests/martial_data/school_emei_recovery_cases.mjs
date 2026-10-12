// Emei uses the original public recovery commands and heartbeat-driven exercise.
import assert from 'node:assert/strict';
import { forceRecoveryConditions, validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';
import { emeiForces, emeiForceCapacity } from './school_emei_cultivation_cases.mjs';

export const emeiRecoveryFields = ['sex', 'improve/neili', 'breakup', 'special_skill/self',
    'special_skill/mystery', 'special_skill/guimai', 'class', 'family/family_name', 'character'];

export function emeiRecoveryConditions(catalog, options) {
    const conditions = forceRecoveryConditions(catalog, {
        school: 'emei', family: '峨嵋派', forces: emeiForces, capacity: emeiForceCapacity,
        sources: ['kungfu/skill/mahayana.c', 'kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h'],
    }, options);
    for (const c of conditions) {
        c.parameters.actor.properties.gender = '女性';
        c.parameters.actor.skills.mahayana = Math.max(200, c.parameters.level);
        c.parameters.qualification_note += '峨嵋女性、大乘至少200级为实验资格；本组测已掌握内功的原恢复/打坐，不调用学习接口，不据低内力边界推定可在该状态新学峨嵋九阳。三门各用原当前内力上限，不按同名九阳合并。';
    }
    return conditions;
}

export function validateEmeiRecoveryRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'emei'); assert.equal(raw.outcome, p.expected);
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation));
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.equal(before.userp, 1); assert.equal(before.interactive, 1);
        assert.equal(before.playerp, 1); assert.equal(before.wizardp, 0);
        assert.deepEqual(before.skills, config.skills);
        assert.deepEqual(before.mappings, config.mappings);
        assert.deepEqual(raw.after[side].mappings, before.mappings);
        for (const [key, value] of Object.entries(config.properties)) {
            const actual = emeiRecoveryFields.includes(key) ? before.cultivation[key] : before[key];
            assert.equal(actual, value, key);
        }
    }
    const actor = raw.before[0];
    assert.equal(actor.gender, '女性');
    for (const key of emeiRecoveryFields) {
        assert.ok(Object.hasOwn(actor.cultivation, key), '缺少属性观察：' + key);
        // query() of an unset LPC property is serialized as null, not a missing observation.
        assert.equal(actor.cultivation[key] ?? 0, p.actor.properties[key] ?? 0, key);
    }
    assert.equal(actor.effective_skills.force, Math.trunc(p.actor.skills.force / 2)
        + (p.actor.mappings.force ? p.actor.skills[p.actor.mappings.force] : 0));
    assert.deepEqual(raw.after[0].cultivation, actor.cultivation);
    validateQuanzhenRecoveryRecord(raw, condition);
    for (const step of raw.exercise_steps ?? [])
        assert.equal(step.limit, emeiForceCapacity(p.actor, true), '峨嵋原当前内力上限');
    if (raw.exercise_steps?.length)
        assert.equal(raw.after[0].max_neili, raw.exercise_steps.at(-1).state.max_neili,
            '自然恢复与收功不得额外改变最大内力');
}
