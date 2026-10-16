// Strict consumer for original capacity queries; it never creates native observations.
// Runner wiring records the existing interface_steps shape for this group,
// including the same USER at entry/return and function_exists on the actual receiver:
// the skill object for query_neili_improve, the USER for the two capacity methods.
// It must also expose the existing learning snapshot fields and explicit empty event
// arrays. Missing observations are rejected here, not synthesized from parameters.
// Source/driver/fixture byte provenance is a separate collection audit. The existing
// snapshot normalizes query_learned() with || ([]) and does not expose name/race;
// equality below proves only the recorded representation, not the original raw type.
import assert from 'node:assert/strict';
import { validateMingjiaoJiuyangCapacityCondition }
    from './school_mingjiao_jiuyang_capacity_cases.mjs';

const skillObject = '/kungfu/skill/jiuyang-shengong';
const map = value => {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'expected mapping');
    return value;
};
const own = (value, key) => {
    assert.ok(Object.hasOwn(map(value), key), 'missing ' + key);
    return value[key];
};
const integer = value => {
    assert.ok(Number.isSafeInteger(value), 'expected safe integer');
    return value;
};
const zero = value => {
    assert.ok(value === 0 || value === null, 'expected explicit LPC zero/null');
};
const emptyConditions = value => {
    if (value === 0 || value === null) return;
    assert.deepEqual(map(value), {}, 'unexpected condition');
};

function initial(state, config, side) {
    assert.match(own(state, 'object'), /^\/tests\/actor#\d+$/);
    assert.equal(own(state, 'id'), side === 0 ? 'left' : 'right');
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(state, key), 1);
    for (const key of ['wizardp', 'ghost', 'busy', 'fighting_opponent']) zero(own(state, key));
    emptyConditions(own(state, 'conditions'));
    assert.deepEqual(own(state, 'skills'), config.skills);
    assert.deepEqual(own(state, 'mappings'), config.mappings);
    assert.deepEqual(own(state, 'preparations'), config.preparations);
    assert.deepEqual(own(state, 'learned'), {});
    const cultivation = map(own(state, 'cultivation'));
    for (const [key, expected] of Object.entries(config.properties)) {
        if (['name', 'race'].includes(key)) continue; // Not present in this snapshot protocol.
        const container = key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key)
            ? cultivation : state;
        const actual = own(container, key);
        if (expected === 0) zero(actual);
        else assert.equal(actual, expected, 'initial ' + key);
    }
    for (const key of ['sex', 'immune/poison', 'wudang-jiuyang', 'special_skill/divine'])
        zero(own(cultivation, key));
    // These finite conditions have no equipment, buffs or temporary setup overrides.
    assert.deepEqual(own(state, 'temp'), { user_setup: 1, apply: { armor: 100 } });
    assert.deepEqual(own(state, 'effective_skills'), Object.fromEntries(
        Object.entries(config.skills).map(([key, value]) => [key,
            Math.trunc(value / 2) + (config.mappings[key] ? config.skills[config.mappings[key]] : 0)])));
    for (const [attribute, basic] of [['str', 'unarmed'], ['con', 'force'], ['dex', 'dodge'], ['int', 'literate']])
        assert.equal(own(state, 'effective_' + attribute), config.properties[attribute]
            + Math.trunc((config.skills[basic] ?? 0) / 10));
    assert.equal(own(state, 'craze'), 0);
    assert.equal(own(state, 'max_craze'), 5000);
    zero(own(state, 'force_attribute'));
    for (const slot of ['weapon', 'handing']) {
        assert.equal(own(state, slot), 'none');
        assert.deepEqual(own(state, slot + '_details'), {});
    }
    for (const key of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(own(state, key), 0);
}

// Returns a single observed query summary, or null for an explicit diagnostic.
// Reporting and series/source-copy provenance are checked by their own callers.
export function validateMingjiaoJiuyangCapacityRecord(raw, condition) {
    const parameters = validateMingjiaoJiuyangCapacityCondition(condition);
    assert.equal(own(raw, 'kind'), 'sample');
    assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), 'interface');
    const index = integer(own(raw, 'index'));
    assert.ok(index >= 0 && index < condition.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    const outcome = own(raw, 'outcome'), reason = own(raw, 'reason');
    assert.equal(typeof reason, 'string');
    if (outcome === 'error' || outcome === 'not_applicable') {
        assert.ok(reason.trim(), 'diagnostic requires an actual reason');
        return null; // Unknown is not a successful zero-capacity observation.
    }
    assert.equal(outcome, 'observed');
    assert.equal(reason, '');
    const commandCost = integer(own(raw, 'command_accepted'));
    assert.ok(commandCost > 0, 'single original command must be accepted');
    for (const key of ['before', 'immediate', 'after', 'metrics']) {
        assert.ok(Array.isArray(own(raw, key)));
        assert.equal(raw[key].length, 2);
    }
    initial(raw.before[0], parameters.actor, 0);
    initial(raw.before[1], parameters.target, 1);
    assert.notEqual(raw.before[0].object, raw.before[1].object, 'two distinct original USERs');
    assert.deepEqual(raw.immediate, raw.before, 'query changed recorded state');
    assert.deepEqual(raw.after, raw.before, 'query changed final recorded state');
    for (const counters of raw.metrics) {
        map(counters); // Sparse zero counters are allowed, an absent/null map is not.
        for (const [key, value] of Object.entries(counters))
            assert.equal(integer(value), 0, 'unexpected event/resource counter ' + key);
    }
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'launches', 'refusals', 'callbacks', 'dropped', 'terminals', 'background_stopped', 'skill_messages'])
        assert.deepEqual(own(raw, key), [], 'unexpected or unobserved ' + key);
    for (const key of ['extra_target_before', 'extra_target_immediate', 'extra_target_after',
        'extra_target_metrics', 'preparation']) assert.ok(!Object.hasOwn(raw, key), 'unexpected ' + key);
    if (Object.hasOwn(raw, 'busy_calls')) assert.deepEqual(raw.busy_calls, []);
    const interfaces = own(raw, 'interfaces'), steps = own(raw, 'interface_steps');
    assert.ok(Array.isArray(interfaces) && Array.isArray(steps));
    assert.equal(interfaces.length, 1); assert.equal(steps.length, 1);
    const implementedBy = parameters.interface.object === 'player' ? '/clone/user/user' : skillObject;
    const value = integer(own(interfaces[0], 'result'));
    assert.equal(value, parameters.expected_return, 'original capacity return');
    assert.deepEqual(interfaces[0], {
        object: parameters.interface.object, function: parameters.ability, result: value, implemented_by: implementedBy,
    });
    const step = map(steps[0]);
    assert.deepEqual(Object.keys(step).sort(), ['after', 'before', 'command', 'entry_actor',
        'implemented_by', 'messages', 'reason', 'result', 'return_actor']);
    assert.equal(step.command, parameters.action);
    assert.equal(step.entry_actor, raw.before[0].object);
    assert.equal(step.return_actor, raw.before[0].object);
    assert.deepEqual(step.before, raw.before[0]);
    assert.deepEqual(step.after, raw.immediate[0]);
    assert.equal(step.result, value);
    assert.equal(step.implemented_by, implementedBy);
    assert.equal(step.reason, ''); assert.deepEqual(step.messages, []);
    return { commands: 1, commands_accepted: 1, command_cost: commandCost, interface_calls: 1,
        interface_value: value, implemented_by: implementedBy };
}
