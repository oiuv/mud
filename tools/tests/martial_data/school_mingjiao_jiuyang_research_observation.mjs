// Unregistered, preparation-only consumer. Synthetic checks are not native samples.
// Future wiring must read research_steps around each original USER force_me command:
// action, entry_actor/return_actor, before/after (two snapshots), metrics_before/after
// (two cumulative sparse counter mappings), accepted (actual integer execution cost),
// reason, wall_time_before/after (actual time()), and received messages.
// No new game/RNG/improve_skill probe is required. Provenance of native source,
// driver and fixture bytes remains a separate collection audit. Snapshot learned
// is already normalized by the producer; name/race are not exposed in that protocol.
import assert from 'node:assert/strict';
import { validateMingjiaoJiuyangResearchCondition }
    from './school_mingjiao_jiuyang_research_cases.mjs';

const skill = 'jiuyang-shengong';
const defaultNotice = '依你目前的能力，没有办法研究这种技能。\n';
const tiredNotice = '你今天太累了，结果什么也没有研究成。\n';
const sameNotice = '你刚刚才研究过（如果你要连续研究，可以指明研究的次数）。\n';
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
const zero = value => assert.ok(value === 0 || value === null, 'expected explicit LPC zero/null');
// Only original SGR and the complete SEFUN notify_fail cursor prefix are display codes.
const plain = text => {
    assert.equal(typeof text, 'string');
    return text.replace(/^\x1b\[256D\x1b\[K/, '').replace(/\x1b\[[0-9;]*m/g, '');
};
const pair = (value, label) => {
    assert.ok(Array.isArray(value), label); assert.equal(value.length, 2, label);
    value.forEach(map); return value;
};

function initial(state, config, side, fighting) {
    assert.match(own(state, 'object'), /^\/tests\/actor#\d+$/);
    assert.equal(own(state, 'id'), side ? 'right' : 'left');
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(state, key), 1);
    for (const key of ['wizardp', 'ghost']) zero(own(state, key));
    const busy = own(state, 'busy');
    if (config.busy) assert.equal(busy, config.busy); else zero(busy);
    if (fighting) assert.equal(own(state, 'fighting_opponent'), 1);
    else zero(own(state, 'fighting_opponent'));
    const conditions = own(state, 'conditions');
    if (conditions !== 0 && conditions !== null) assert.deepEqual(map(conditions), {});
    assert.deepEqual(own(state, 'skills'), config.skills);
    assert.deepEqual(own(state, 'mappings'), config.mappings);
    assert.deepEqual(own(state, 'preparations'), config.preparations);
    assert.deepEqual(own(state, 'learned'), {});
    const cultivation = map(own(state, 'cultivation'));
    for (const [key, expected] of Object.entries(config.properties)) {
        if (['name', 'race'].includes(key)) continue;
        const container = key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key)
            ? cultivation : state;
        const actual = own(container, key);
        if (expected === 0) zero(actual); else assert.equal(actual, expected, key);
    }
    for (const key of ['sex', 'immune/poison', 'wudang-jiuyang', 'special_skill/divine'])
        zero(own(cultivation, key));
    assert.deepEqual(own(state, 'temp'), { user_setup: 1, apply: { armor: 100 } });
    assert.deepEqual(own(state, 'effective_skills'), Object.fromEntries(Object.entries(config.skills)
        .map(([key, value]) => [key, Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0)])));
    for (const [attribute, basic] of [['str', 'unarmed'], ['con', 'force'], ['dex', 'dodge'], ['int', 'literate']])
        assert.equal(own(state, 'effective_' + attribute), config.properties[attribute]
            + Math.trunc((config.skills[basic] ?? 0) / 10));
    assert.equal(own(state, 'craze'), 0); assert.equal(own(state, 'max_craze'), 5000);
    zero(own(state, 'force_attribute'));
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
        assert.equal(own(state, slot), 'none'); assert.deepEqual(own(state, slot + '_details'), {});
    }
    for (const key of ['weapon_damage', 'weapon_flag', 'ammunition']) assert.equal(own(state, key), 0);
}

function counters(value) {
    map(value);
    for (const [key, v] of Object.entries(value)) {
        assert.ok(integer(v) >= 0, key);
        if (key !== 'jing_cost') assert.equal(v, 0, 'unexpected counter ' + key);
    }
    // An absent lazy counter in a PRESENT mapping is a known zero, not a missing map.
    return Object.hasOwn(value, 'jing_cost') ? value.jing_cost : 0;
}

function messages(step, parameters, spec, completed, enteredIntro, notifyOnly) {
    const actual = own(step, 'messages'); assert.ok(Array.isArray(actual));
    const actor = [], target = [];
    for (const message of actual) {
        assert.deepEqual(Object.keys(map(message)).sort(), ['side', 'text', 'type']);
        const side = integer(own(message, 'side'));
        assert.ok(side === 0 || side === 1);
        assert.equal(own(message, 'type'), side ? 'vision' : 'write');
        (side ? target : actor).push(plain(own(message, 'text')));
    }
    const expectedActor = [], expectedTarget = [];
    if (enteredIntro) {
        const times = spec.requested_times === 3 ? '三' : '一';
        expectedActor.push(`你开始研究${times}次有关「九阳神功」的奥秘。\n`);
        expectedTarget.push(parameters.actor.properties.name + '在冥神思索。\n');
    }
    if (completed) expectedActor.push('你研究了一会，似乎对「九阳神功」有些新的领悟。\n');
    if (spec.notice_kind === 'write' && spec.notice) expectedActor.push(spec.notice);
    if (completed === 2 && spec.requested_times === 3)
        expectedActor.push('你觉得太累了，研究了二次后只好停下来休息。\n');
    // notify_fail sets the original temp and efun failure; it is not a source write().
    if (notifyOnly) assert.equal(spec.notice_kind, 'notify_fail');
    assert.deepEqual(actor, expectedActor, 'actual research write messages');
    assert.deepEqual(target, expectedTarget, 'actual research vision messages');
    return actual;
}

function progressSupport(single, completed) {
    let support = [0];
    for (let i = 0; i < completed; i++)
        support = [...new Set(support.flatMap(value => single.map(gain => value + gain)))];
    return support;
}

// Null means an explicit error/NA with checked identity; never a successful zero study.
// condition_matched=false is a valid actual cross-second path, not same-second coverage.
// Importers/reports must keep that flag and refuse a completion declaration.
export function validateMingjiaoJiuyangResearchRecord(raw, condition) {
    const p = validateMingjiaoJiuyangResearchCondition(condition);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), 'research');
    const index = integer(own(raw, 'index')); assert.ok(index >= 0 && index < condition.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    const outcome = own(raw, 'outcome'), reason = own(raw, 'reason');
    assert.equal(typeof reason, 'string');
    if (outcome === 'error' || outcome === 'not_applicable') {
        assert.ok(reason.trim(), 'diagnostic requires an actual reason'); return null;
    }
    assert.ok(outcome === 'observed' || outcome === 'refused');
    for (const key of ['random_draws', 'rng_draws', 'random_input', 'research_prediction'])
        assert.ok(!Object.hasOwn(raw, key), 'random/source prediction is not a raw observation');
    const before = pair(own(raw, 'before'), 'before');
    const immediate = pair(own(raw, 'immediate'), 'immediate');
    const after = pair(own(raw, 'after'), 'after');
    const metrics = pair(own(raw, 'metrics'), 'metrics');
    initial(before[0], p.actor, 0, p.fighting); initial(before[1], p.target, 1, p.fighting);
    assert.notEqual(before[0].object, before[1].object);
    assert.deepEqual(after, immediate, 'immediate research has no later heartbeat/timer stage');
    const room = map(own(raw, 'research_room'));
    assert.deepEqual(Object.keys(room).sort(), ['no_fight', 'pigging', 'research_improve']);
    for (const key of Object.keys(room)) {
        if (p.room[key]) assert.equal(room[key], p.room[key]); else zero(room[key]);
    }
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'launches', 'refusals', 'interfaces', 'callbacks', 'dropped', 'terminals', 'background_stopped'])
        assert.deepEqual(own(raw, key), []);
    for (const key of ['extra_target_before', 'extra_target_immediate', 'extra_target_after',
        'extra_target_metrics', 'preparation', 'upgrades']) assert.ok(!Object.hasOwn(raw, key));
    if (Object.hasOwn(raw, 'busy_calls')) assert.deepEqual(raw.busy_calls, []);
    const steps = own(raw, 'research_steps'); assert.ok(Array.isArray(steps));
    assert.equal(steps.length, p.actions.length);
    let last = before, lastCounters = null, completedTotal = 0, costTotal = 0, acceptedTotal = 0;
    let feeTotal = 0, writeoffTotal = 0, gainTotal = 0, sameSecond = 'not_applicable';
    const summaries = [], allMessages = [];
    for (const [i, step] of steps.entries()) {
        assert.deepEqual(Object.keys(map(step)).sort(), ['accepted', 'action', 'after', 'before',
            'entry_actor', 'messages', 'metrics_after', 'metrics_before', 'reason', 'return_actor',
            'wall_time_after', 'wall_time_before']);
        assert.equal(step.action, p.actions[i]);
        assert.equal(step.entry_actor, before[0].object); assert.equal(step.return_actor, before[0].object);
        const b = pair(step.before, 'step before'), a = pair(step.after, 'step after');
        assert.deepEqual(b, last, 'each original command starts at the preceding state');
        const mb = pair(step.metrics_before, 'metrics before'), ma = pair(step.metrics_after, 'metrics after');
        if (lastCounters) assert.deepEqual(mb, lastCounters, 'cumulative counters cannot reset between commands');
        else for (const counter of mb) assert.equal(counters(counter), 0, 'setup is not study cost');
        const cost = integer(step.accepted); assert.ok(cost >= 0); assert.equal(typeof step.reason, 'string');
        const wallBefore = integer(step.wall_time_before), wallAfter = integer(step.wall_time_after);
        assert.ok(wallBefore > 0 && wallAfter >= wallBefore, 'actual wall-clock command bracket');
        let spec = p.research_steps[i], completed = spec.expected_completed;
        let writeoff = spec.expected_jing_writeoff, timestamp = spec.expected_timestamp;
        let expectedAccepted = spec.expected_command_accepted;
        let intro = completed > 0 || timestamp === 'written' || ['eff-jing24', 'exp-minus1'].includes(p.variant);
        if (i === 1) {
            const priorTime = integer(own(map(own(b[0].temp, 'time')), 'research'));
            if (cost === 0) {
                assert.ok(wallBefore <= priorTime && priorTime <= wallAfter, 'original same-second t is in the actual bracket');
                sameSecond = 'met'; intro = false;
            } else {
                sameSecond = 'not_met'; expectedAccepted = true; timestamp = 'written'; intro = true;
                writeoff = 0; completed = 0;
                spec = { ...spec, notice_kind: 'write', notice: tiredNotice };
            }
        }
        assert.equal(cost > 0, expectedAccepted, 'actual command acceptance, not a synthesized constant');
        if (cost > 0) assert.equal(step.reason, '');
        else assert.equal(plain(step.reason), spec.notice);
        const actualCompleted = integer(own(a[0], 'learned_points')) - integer(own(b[0], 'learned_points'));
        assert.equal(actualCompleted, completed, 'actual loop count is the observed learned_points delta');
        completed = actualCompleted;
        const expected = structuredClone(b);
        const fee = completed * Math.trunc(1000 / b[0].int);
        const jingCost = counters(ma[0]) - counters(mb[0]);
        assert.equal(jingCost - fee, writeoff, 'actual SET loss, not a source forecast filled into raw');
        writeoff = jingCost - fee;
        expected[0].jing -= jingCost; expected[0].learned_points += completed;
        assert.equal(a[0].potential, b[0].potential, 'research uses learned_points, not a potential-field deduction');
        const net = completed ? integer(own(map(own(a[0], 'learned')), skill))
            - (Object.hasOwn(b[0].learned, skill) ? integer(b[0].learned[skill]) : 0) : 0;
        assert.ok(progressSupport(p.research_prediction.possible_single_gain, completed).includes(net), 'original finite RNG/improve support');
        if (completed) expected[0].learned[skill] = (b[0].learned[skill] ?? 0) + net;
        assert.ok((expected[0].learned[skill] ?? 0) <= (b[0].skills[skill] + 1) ** 2, 'this finite window has no level-up/reset');
        expected[0].temp.notify_fail = cost === 0 ? spec.notice : defaultNotice;
        if (timestamp === 'written') {
            const t = integer(own(map(own(a[0].temp, 'time')), 'research'));
            assert.ok(wallBefore <= t && t <= wallAfter, 'original stored research timestamp');
            if (i === 1) assert.notEqual(t, b[0].temp.time.research, 'accepted second command really used a different second');
            expected[0].temp.time = { ...(expected[0].temp.time ?? {}), research: t };
        }
        assert.deepEqual(a, expected, 'original research may change only progress, jing, learned_points and exact temp fields');
        for (const side of [0, 1]) {
            assert.equal(counters(ma[side]) - counters(mb[side]), side ? 0 : jingCost, 'actual resource fee plus SET writeoff');
        }
        allMessages.push(...messages(step, p, spec, completed, intro, cost === 0));
        costTotal += cost; assert.ok(Number.isSafeInteger(costTotal));
        acceptedTotal += Number(cost > 0); completedTotal += completed;
        feeTotal += fee; writeoffTotal += writeoff; gainTotal += net;
        summaries.push({ command_cost: cost, completed, normal_jing_fee: fee, jing_writeoff: writeoff,
            jing_cost: jingCost, learned_net: net, source_derived_gross: net,
            hidden_random_input: completed ? 'unobserved' : 'not_called' });
        last = a; lastCounters = ma;
    }
    assert.deepEqual(immediate, last); assert.deepEqual(metrics, lastCounters);
    assert.deepEqual(own(raw, 'skill_messages'), allMessages);
    assert.equal(integer(own(raw, 'command_accepted')), costTotal);
    assert.equal(outcome, completedTotal ? 'observed' : 'refused');
    if (completedTotal) assert.equal(reason, '');
    else assert.equal(plain(reason), own(last[0].temp, 'notify_fail'), 'original no-progress reason retained');
    return { commands: steps.length, commands_accepted: acceptedTotal,
        commands_refused: steps.length - acceptedTotal, command_cost: costTotal,
        completed: completedTotal, normal_jing_fee: feeTotal, jing_writeoff: writeoffTotal,
        jing_cost: feeTotal + writeoffTotal, potential_field_cost: 0, learned_points_used: completedTotal,
        learned_net: gainTotal, source_derived_gross: gainTotal, skill_upgrades: 0,
        hidden_random_input: completedTotal ? 'unobserved' : 'not_called',
        same_second_status: sameSecond, condition_matched: sameSecond !== 'not_met',
        same_second: sameSecond === 'met' ? { trials: 1, refused: 1 } : { trials: null, refused: null },
        steps: summaries,
        qualification_note: 'Only checked recorded USER/source/state representations. Gross progress equals net only in this no-upgrade window; random inputs are not observed. Cross-second records do not complete the same-second condition.' };
}
