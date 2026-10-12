// Three bounded original-command sequences, prepared only; no runner registration here.
import assert from 'node:assert/strict';
import { gumuComboConditions } from './school_gumu_combo_cases.mjs';
import { gumuHuboConditions, huboBusyValues } from './school_gumu_hubo_cases.mjs';
import { distribution, probability } from './statistics.mjs';

export const gumuTemporalFixtureRequirements = [
    'Register only in a later unlocked window; these three conditions are not executed by preparation tests.',
    'Only tuo-cooldown admits both original USER heartbeats; do not reuse the bout strategy that automatically performs every tick.',
    'Run the same original tuo command at initial, early and expired phases; poll the original clock and busy state, never advance busy or refill resources.',
    'Keep per-command before/after snapshots, cumulative resource counters and launch/direct offsets; the waiting-window attacks and recovery remain separate.',
    'Use three distinct connected USERs for hubo-targets, prepare both original hostile relations before resetting observation counters, and retain the third target snapshots.',
    'Extend the existing original do_perform and integer-busy observers only for this group; each hubo step observes all three USERs, not two separate commands.',
    'Snapshot original clock, room, hostility and the already used marriage/hubo qualifications; preserve explicit null busy and reject absent observations.',
    'Reuse the existing typed direct observer for tuo; incomplete, lost-target or timeout sequences retain raw evidence and cannot become successful observations.',
    'Reports receive the frozen condition; raw.parameters is absent after finish_sample. Ice/fire interleaving and callable busy are not included.',
];

export function gumuTemporalConditions(catalog, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    const oldCombo = gumuComboConditions(catalog), oldHubo = gumuHuboConditions(catalog);
    const tuo = structuredClone(oldCombo.find(c => c.id === 'school-gumu-combo-sad-strike-tuo-l200-low-defense'));
    const hubo = oldHubo.find(c => c.id === 'school-gumu-hubo-perform-l360');
    assert.ok(tuo && hubo, '缺少已核对的拖泥／互搏基准');
    tuo.id = 'school-gumu-temporal-tuo-cooldown';
    tuo.status = 'configured_not_executed';
    tuo.samples = smoke ? 1 : 2;
    Object.assign(tuo.parameters, { collection_group: 'gumu-temporal', temporal_kind: 'tuo-cooldown',
        action: 'perform unarmed.tuo right', observation: 'original_clock_three_commands', observe_seconds: 90,
        qualification_note: '复用200级黯然、300级内功的合法原拖泥与低防御目标；只将双方气血池明确设为1000000。'
            + '同一原命令先成功，原心跳自然解除忙乱后在60秒内因冷却拒绝，原时间戳至少经过60秒后再用。'
            + '只验两次自然冷却机制，不估随机分布；不清忙、不补资源、不改时钟或时间戳。'
            + '等待期间原普攻、伤害和恢复另账；失活、脱战、耗尽或超时保留未完成，不重置补成通过。'
            + '实验资格与高气血不代表玩家养成或整场平衡。' });
    for (const cfg of [tuo.parameters.actor, tuo.parameters.target])
        Object.assign(cfg.properties, { qi: 1000000, eff_qi: 1000000, max_qi: 1000000 });
    tuo.parameters.qualification_sources = [...new Set([...tuo.parameters.qualification_sources,
        'inherit/char/char.c', 'feature/attack.c'])];
    const result = [tuo];
    for (const secondBusy of [false, true]) {
        const c = structuredClone(hubo), p = c.parameters;
        c.id = 'school-gumu-temporal-hubo-' + (secondBusy ? 'second-busy' : 'two-targets');
        c.status = 'configured_not_executed';
        c.samples = smoke ? 2 : 100;
        Object.assign(p, { collection_group: 'gumu-temporal', temporal_kind: 'hubo-targets',
            action: 'perform strike.wang right and strike.wang third',
            perform_arguments: ['strike.wang right', 'strike.wang third'],
            qualification_note: '360级互搏配400级天罗，原一次双招命令分别指向right和third两名不同真实USER。'
                + '双方目标基本闪躲200，保留原random(400)>100的控制判定；实验技能不证明师承。'
                + '三名USER准备与敌对关系先完成再开启正式计数，立即观察期间不放行原心跳。'
                + '第二目标已忙条件只改变third的忙乱初值7；逐步区分受理、实际发动、费用、目标和忙乱恢复。' });
        p.target.skills.dodge = 200;
        p.extra_target = structuredClone(p.target);
        if (secondBusy) p.extra_target.busy = 7;
        result.push(c);
    }
    return result;
}

const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const map = (value, label) => {
    assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), label);
    return value;
};
const integer = (value, label, minimum = 0) => {
    assert.ok(Number.isSafeInteger(value) && value >= minimum, label); return value;
};
const busy = state => {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少真实忙乱');
    return state.busy === null ? 0 : integer(state.busy, '无效忙乱');
};
const counter = (metrics, key) => {
    map(metrics, '缺少原资源计数映射');
    return Object.hasOwn(metrics, key) ? integer(metrics[key], key) : 0;
};
const property = (state, key) => key.includes('/') || key === 'character' ? state.cultivation[key] : state[key];
const canonicalState = state => {
    const copy = structuredClone(state); copy.busy = busy(state); delete copy.clock_seconds;
    delete map(copy.temp, '缺少完整临时属性').notify_fail; return copy;
};
const cooldown = state => {
    let value = map(state.temp, '缺少完整临时属性');
    // An absent key inside the actual entire temp mapping is an original unset value.
    for (const key of ['last_perform', 'sad-strike']) {
        if (!Object.hasOwn(value, key)) return 0;
        value = map(value[key], '冷却中间属性必须是映射');
    }
    if (!Object.hasOwn(value, 'tuo')) return 0;
    return value.tuo === null ? 0 : integer(value.tuo, '原冷却时间');
};

function liveState(state, initial) {
    map(state, '缺少玩家状态');
    for (const key of ['userp', 'interactive', 'playerp', 'living']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0);
    assert.ok(Object.hasOwn(state, 'ghost') && [null, 0].includes(state.ghost));
    assert.equal(state.object, initial.object); assert.equal(state.id, initial.id);
    assert.equal(state.environment, initial.environment);
    assert.deepEqual(state.mappings, initial.mappings); assert.deepEqual(state.preparations, initial.preparations);
    for (const key of resources) integer(state[key], key);
    for (const key of ['skills', 'learned', 'effective_skills', 'cultivation', 'temp', 'hostility']) map(state[key], key);
    for (const key of ['enemies', 'killers', 'wants']) assert.ok(Array.isArray(state.hostility[key]), key);
    busy(state); integer(state.clock_seconds, '原时钟');
}

function initialStates(raw, p) {
    const configs = [p.actor, p.target, ...(p.extra_target ? [p.extra_target] : [])];
    const states = [...raw.before, ...(p.extra_target ? [raw.extra_target_before] : [])];
    assert.equal(states.length, configs.length);
    assert.equal(new Set(states.map(s => s?.object)).size, configs.length, '必须是不同实际USER');
    assert.equal(new Set(states.map(s => s?.id)).size, configs.length, '目标ID不得互相冒充');
    for (const [side, cfg] of configs.entries()) {
        const s = states[side];
        assert.ok(typeof s?.object === 'string' && s.object.includes('#'));
        assert.equal(s.id, ['left', 'right', 'third'][side]);
        assert.ok(typeof s.environment === 'string' && s.environment.startsWith('/'));
        assert.equal(s.environment, states[0].environment);
        liveState(s, s); assert.equal(busy(s), cfg.busy ?? 0);
        assert.deepEqual(s.mappings, cfg.mappings); assert.deepEqual(s.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(s.skills[key], value, key);
        for (const [key, value] of Object.entries(cfg.properties)) assert.equal(property(s, key), value, key);
        assert.equal(s.weapon, cfg.equipment?.type ?? 'none');
        const enemies = side ? ['left'] : states.slice(1).map(t => t.id);
        assert.deepEqual([...s.hostility.enemies].sort(), [...enemies].sort());
        assert.deepEqual([...s.hostility.killers].sort(), [...enemies].sort());
    }
    return states;
}

function resourceBalance(before, after, metricsBefore, metricsAfter) {
    map(metricsBefore, '缺少窗口前计数'); map(metricsAfter, '缺少窗口后计数');
    for (const key of new Set([...Object.keys(metricsBefore), ...Object.keys(metricsAfter)]))
        assert.ok(counter(metricsAfter, key) >= counter(metricsBefore, key), '累计计数不得重置');
    for (const key of resources) {
        const cost = counter(metricsAfter, key + '_cost') - counter(metricsBefore, key + '_cost');
        const recovery = counter(metricsAfter, key + '_recovery') - counter(metricsBefore, key + '_recovery');
        assert.equal(after[key] - before[key], recovery - cost, key + '原资源账');
    }
}

function commandProgress(before, after, skill, accepted) {
    const b = map(before.learned, '缺少原进度'), a = map(after.learned, '缺少原进度');
    const old = Object.hasOwn(b, skill) ? integer(b[skill], '原进度') : 0;
    const value = Object.hasOwn(a, skill) ? integer(a[skill], '原进度') : 0;
    const others = values => Object.fromEntries(Object.entries(values).filter(([key]) => key !== skill));
    assert.deepEqual(others(a), others(b)); assert.deepEqual(after.skills, before.skills, '原weak模式不升级');
    const amount = 1 + Math.trunc((1 + Math.trunc((before.skills['martial-cognize'] ?? 0) / 500))
        * 100 / (before.skills[skill] + 100));
    const values = accepted ? (before.effective_skills[skill] >= 120 ? [amount] : [0, amount]) : [0];
    assert.ok(values.includes(value - old), '原perform弱进度的随机门／增长');
}

function validateCooldown(raw, p, initial) {
    assert.equal(raw.temporal_steps?.length, 3);
    assert.equal(raw.directs.length, 2); assert.equal(raw.launches.length, 2);
    assert.equal(cooldown(initial[0]), 0); assert.equal(busy(initial[0]), 0);
    const phases = ['initial', 'early', 'expired'];
    let lastTime = 0, lastStamp = 0, launches = 0, directs = 0, previousStates = initial;
    let previousMetrics = [{}, {}];
    for (const [index, step] of raw.temporal_steps.entries()) {
        assert.equal(step.phase, phases[index]); assert.equal(step.action, p.action);
        for (const key of ['before', 'after', 'metrics_before', 'metrics_after']) assert.equal(step[key]?.length, 2, key);
        assert.equal(step.accepted, Number(index !== 1));
        if (!index) assert.deepEqual(step.before.map(canonicalState), initial.map(canonicalState));
        for (const side of [0, 1]) {
            liveState(step.before[side], initial[side]); liveState(step.after[side], initial[side]);
            resourceBalance(previousStates[side], step.before[side], previousMetrics[side], step.metrics_before[side]);
            resourceBalance(step.before[side], step.after[side], step.metrics_before[side], step.metrics_after[side]);
            for (const key of ['heartbeats', 'hit', 'dodge', 'parry'])
                assert.equal(counter(step.metrics_after[side], key), counter(step.metrics_before[side], key), '单次原命令内不插心跳或普攻');
            for (const key of resources)
                assert.equal(counter(step.metrics_after[side], key + '_recovery'), counter(step.metrics_before[side], key + '_recovery'));
        }
        const [before, target] = step.before, [after] = step.after;
        assert.equal(busy(before), 0, '仅在原忙乱已解除后尝试');
        assert.ok(before.neili >= 500); assert.ok(before.effective_skills.force >= 360);
        assert.equal(before.preparations.unarmed, 'sad-strike');
        assert.equal(before.cultivation['static/marry'], 1);
        assert.equal(before.cultivation['couple/id'], p.actor.properties['couple/id']);
        assert.equal(before.cultivation['can_perform/sad-strike/tuo'], 1);
        assert.ok(before.skills['sad-strike'] >= 180);
        assert.ok(before.clock_seconds >= lastTime && after.clock_seconds >= before.clock_seconds);
        assert.equal(cooldown(before), lastStamp, '等待期间不改写原时间戳');
        assert.equal(step.launches_before, launches); assert.equal(step.directs_before, directs);
        commandProgress(before, after, 'sad-strike', index !== 1);
        assert.deepEqual(step.after[1].learned, target.learned);
        const cost = counter(step.metrics_after[0], 'neili_cost') - counter(step.metrics_before[0], 'neili_cost');
        const direct = counter(step.metrics_after[0], 'direct') - counter(step.metrics_before[0], 'direct');
        assert.equal(cost, index === 1 ? 0 : 400); assert.equal(direct, Number(index !== 1));
        assert.equal(counter(step.metrics_after[1], 'direct'), counter(step.metrics_before[1], 'direct'));
        if (index === 1) {
            assert.ok(before.clock_seconds - lastStamp > 0 && before.clock_seconds - lastStamp < 60);
            assert.match(step.reason, /你刚刚施展完/); assert.match(step.reason, /现在心情没有那么郁闷/);
            assert.deepEqual(step.after.map(canonicalState), step.before.map(canonicalState));
        } else {
            if (index === 2) assert.ok(before.clock_seconds - lastStamp >= 60, '必须经过原60秒冷却');
            assert.ok([2, 3].includes(busy(after)));
            assert.ok(cooldown(after) >= before.clock_seconds && cooldown(after) <= after.clock_seconds);
            const event = raw.directs[directs], launch = raw.launches[launches];
            assert.equal(launch.actor, initial[0].object); assert.equal(launch.skill, 'sad-strike'); assert.equal(launch.argument, 'tuo right');
            assert.equal(event.actor, 0); assert.equal(event.target, 1);
            assert.ok(Object.hasOwn(event, 'type') && [null, 0].includes(event.type));
            assert.equal(event.percent, 120); assert.equal(event.weapon, 'none'); assert.equal(event.weapon_object, '');
            const ap = before.effective_skills.unarmed + before.effective_skills.force;
            const dp = target.effective_skills.parry + target.effective_skills.force;
            assert.ok(Math.trunc(ap * 3 / 5) > dp, '冻结低防御条件不强制随机');
            const aps = [ap, ...(before.max_neili > 5000 ? [ap + Math.trunc(ap * 10 / 100)] : [])];
            integer(event.damage, '原直伤参数');
            assert.ok(aps.some(value => event.damage >= value && event.damage < value + Math.trunc(value / 2)));
            lastStamp = cooldown(after); launches++; directs++;
        }
        assert.equal(step.launches_after, launches); assert.equal(step.directs_after, directs);
        lastTime = after.clock_seconds; previousStates = step.after; previousMetrics = step.metrics_after;
    }
    assert.deepEqual(raw.immediate.map(canonicalState), raw.temporal_steps[0].after.map(canonicalState));
    assert.deepEqual(raw.after.map(canonicalState), previousStates.map(canonicalState));
    assert.deepEqual(raw.metrics, previousMetrics);
    for (const side of [0, 1]) {
        assert.ok(counter(raw.metrics[side], 'heartbeats') > 0, '原USER心跳必须实际运行');
        resourceBalance(initial[side], raw.after[side], {}, raw.metrics[side]);
    }
    assert.equal(counter(raw.metrics[0], 'direct'), 2); assert.equal(counter(raw.metrics[1], 'direct'), 0);
    assert.ok(raw.after[0].clock_seconds - initial[0].clock_seconds <= p.observe_seconds + 1);
}

function validateTargets(raw, p, initial) {
    assert.equal(raw.hubo_steps?.length, 2); assert.ok(Array.isArray(raw.busy_calls));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.directs.length, 0);
    const immediate = [...raw.immediate, raw.extra_target_immediate], after = [...raw.after, raw.extra_target_after];
    const metrics = [...raw.metrics, raw.extra_target_metrics];
    let states = structuredClone(initial), actorBusy = 0, launched = 0;
    const expectedCalls = [];
    for (const [index, step] of raw.hubo_steps.entries()) {
        const target = index + 1;
        assert.equal(step.argument, p.perform_arguments[index]);
        assert.equal(step.before?.length, 3); assert.equal(step.after?.length, 3);
        for (const side of [0, 1, 2]) {
            liveState(step.before[side], initial[side]); liveState(step.after[side], initial[side]);
            assert.ok(step.after[side].clock_seconds >= step.before[side].clock_seconds);
        }
        states = structuredClone(states);
        states[0].busy = 0; // The original dual command, not the fixture, suspends first busy.
        assert.deepEqual(step.before.map(canonicalState), states.map(canonicalState));
        const accepted = Number(!busy(step.before[target]));
        assert.equal(step.accepted, accepted);
        const next = structuredClone(step.before);
        if (accepted) {
            launched++; next[0].neili -= 60;
            commandProgress(step.before[0], step.after[0], 'tianluo-diwang', true);
            next[0].learned = structuredClone(step.after[0].learned);
            const launch = raw.launches[launched - 1];
            assert.equal(launch?.actor, initial[0].object); assert.equal(launch.skill, 'tianluo-diwang');
            assert.equal(launch.argument, ['wang right', 'wang third'][index]);
            const controlled = busy(step.after[target]); assert.ok([0, 27].includes(controlled));
            next[target].busy = controlled;
            if (controlled) expectedCalls.push({ side: target, requested: [27], before: 0, after: 27 });
            const requested = controlled ? [2, 3] : [1];
            assert.ok(requested.flatMap(n => huboBusyValues(p.level, n)).includes(busy(step.after[0])));
            next[0].busy = busy(step.after[0]);
            expectedCalls.push({ side: 0, requested, before: 0, after: busy(step.after[0]) });
        } else {
            assert.equal(index, 1); assert.equal(busy(step.before[target]), 7);
            assert.match(step.reason, /自顾不暇/);
        }
        assert.deepEqual(step.after.map(canonicalState), next.map(canonicalState));
        actorBusy = Math.max(actorBusy, busy(step.after[0])); states = step.after;
    }
    states = structuredClone(states); states[0].busy = actorBusy;
    assert.deepEqual(immediate.map(canonicalState), states.map(canonicalState));
    assert.deepEqual(after.map(canonicalState), immediate.map(canonicalState));
    assert.equal(raw.launches.length, launched);
    assert.equal(raw.busy_calls.length, expectedCalls.length);
    for (const [index, expected] of expectedCalls.entries()) {
        const call = raw.busy_calls[index];
        assert.equal(call.side, expected.side); assert.equal(call.caller_side, 0);
        assert.ok(expected.requested.includes(call.requested));
        assert.equal(busy({ busy: call.before }), expected.before); assert.equal(busy({ busy: call.after }), expected.after);
    }
    for (const side of [0, 1, 2]) {
        liveState(immediate[side], initial[side]); liveState(after[side], initial[side]);
        resourceBalance(initial[side], after[side], {}, metrics[side]);
        for (const key of resources) {
            assert.equal(counter(metrics[side], key + '_cost'), side === 0 && key === 'neili' ? 60 * launched : 0);
            assert.equal(counter(metrics[side], key + '_recovery'), 0);
        }
        for (const key of ['heartbeats', 'direct', 'hit', 'dodge', 'parry']) assert.equal(counter(metrics[side], key), 0);
    }
}

export function validateGumuTemporalRecord(raw, condition) {
    const p = condition.parameters; assert.equal(p.collection_group, 'gumu-temporal');
    assert.equal(raw.method, 'perform'); assert.equal(condition.method, 'perform');
    assert.equal(raw.outcome, 'observed'); assert.equal(raw.command_accepted, 1);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'attacks', 'directs', 'terminals', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    assert.equal(raw.terminals.length, 0); assert.equal(raw.dropped.length, 0);
    const initial = initialStates(raw, p);
    for (const side of [0, 1]) for (const key of ['immediate', 'after']) liveState(raw[key][side], initial[side]);
    if (p.temporal_kind === 'tuo-cooldown') validateCooldown(raw, p, initial);
    else { assert.equal(p.temporal_kind, 'hubo-targets'); validateTargets(raw, p, initial); }
}

export function gumuTemporalEffects(records, condition) {
    const known = [], candidates = records.filter(r => r.outcome !== 'error');
    for (const record of candidates) {
        try { validateGumuTemporalRecord(record.raw, condition); known.push(record.raw); } catch { /* unknown, not zero */ }
    }
    const common = { samples: candidates.length, valid: known.length, unknown: candidates.length - known.length,
        errors: records.filter(r => r.outcome === 'error').length };
    if (condition?.parameters?.temporal_kind === 'tuo-cooldown') return { ...common,
        completed_sequences: known.length, early_cooldown_refusals: known.length,
        mechanism_only: true, cooldown_age_seconds: distribution(known.map(r =>
            r.temporal_steps[2].before[0].clock_seconds - cooldown(r.temporal_steps[0].after[0]))),
        command_neili_cost: distribution(known.flatMap(r => r.temporal_steps.map(s =>
            counter(s.metrics_after[0], 'neili_cost') - counter(s.metrics_before[0], 'neili_cost')))),
        waiting_neili_cost: distribution(known.map(r => counter(r.metrics[0], 'neili_cost') - 800)),
        total_neili_recovery: distribution(known.map(r => counter(r.metrics[0], 'neili_recovery'))) };
    return { ...common, dual_attempts: known.length,
        launches: distribution(known.map(r => r.launches.length)),
        second_refused: known.filter(r => !r.hubo_steps[1].accepted).length,
        targets: [1, 2].map(side => {
            const accepted = known.filter(r => r.hubo_steps[side - 1].accepted);
            return { side, accepted: accepted.length,
                controlled: probability(accepted.filter(r => busy(r.hubo_steps[side - 1].after[side]) === 27).length, accepted.length) };
        }), neili_cost: distribution(known.map(r => counter(r.metrics[0], 'neili_cost'))),
        actor_busy: distribution(known.map(r => busy(r.immediate[0]))) };
}
