// Wudang uses the original public recovery fallback and heartbeat exercise.
import assert from 'node:assert/strict';
import { forceRecoveryConditions, validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';
import { wudangForces, wudangForceCapacity } from './school_wudang_cultivation_cases.mjs';

export function wudangRecoveryConditions(catalog, options) {
    return forceRecoveryConditions(catalog, {
        school: 'wudang', family: '武当派', forces: wudangForces, capacity: wudangForceCapacity,
        sources: ['kungfu/class/wudang/zhang.c', 'kungfu/class/wudang/song.c', 'kungfu/class/wudang/yin.c'],
    }, options);
}

export function validateWudangRecoveryRecord(raw, condition) {
    validateQuanzhenRecoveryRecord(raw, condition);
    for (const step of raw.exercise_steps ?? [])
        assert.equal(step.limit, wudangForceCapacity(condition.parameters.actor, true), '武当当前内力上限');
}
