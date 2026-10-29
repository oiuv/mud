// Snapshot assertions only. New-window integration tests use schoolCombatConditions directly.
import { schoolCombatConditions } from './school_combat_cases.mjs';

export function isOctober29Window(condition) {
    const p = condition.parameters;
    return p.collection_group?.startsWith('s1-')
        || ['huashan-duration', 'emei-npc-bout'].includes(p.collection_group)
        || condition.id.startsWith('school-quanzhen-boundary-')
        || p.target_busy_lifecycle === true;
}

export function preOctober29SchoolConditions(catalog, options) {
    return preOctober29Conditions(schoolCombatConditions(catalog, options));
}

export function preOctober29Conditions(conditions) {
    return conditions.filter(c => !isOctober29Window(c));
}
