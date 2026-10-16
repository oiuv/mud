// UNREGISTERED consumer preparation. Synthetic acceptance is not native evidence.
// Existing raw: before/immediate/after, metrics/immediate_metrics, command_context,
// research_steps, interfaces, launches/refusals, passives, exercise_steps,
// healing_steps/healing_halt, callbacks and buff_steps.
// REQUIRED NEW OBSERVER CONTRACT (not yet implemented by the producer):
// force_events is an ordered, lossless actor-only timeline of ORIGINAL heart_beat
// and expiry callbacks. Each event brackets actual before/after snapshots and
// cumulative metrics, elapsed_before/elapsed and actual wall_time_before/after;
// source is {path,function,sha256}; step_count_before/after locates already
// captured exercise/healing steps. No manufactured callback, timer or random draw.
// command_clock brackets the ORIGINAL command's time() interval for timed expiry.
// Repeated command buff_steps additionally retain command_cost (actual force_me
// result); accepted remains the existing normalized bit, NOT its execution cost.
// Exercise halt additionally needs exercise_halt={before,after}, matching the
// existing healing_halt observation. None of these fields is natively present yet.
// This is a narrow observation contract, not an alternative execution framework.
import assert from 'node:assert/strict';
import { validateMingjiaoForceRemainingCondition } from './school_mingjiao_force_remaining_cases.mjs';
import { validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';

const own = (v, k) => { assert.ok(v && Object.hasOwn(v, k), 'missing ' + k); return v[k]; };
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const list = v => { assert.ok(Array.isArray(v), 'array required'); return v; };
const int = v => { assert.ok(Number.isSafeInteger(v), 'integer required'); return v; };
const count = v => { assert.ok(int(v) >= 0, 'negative count'); return v; };
const time = v => { assert.ok(Number.isFinite(v) && v >= 0, 'nonnegative time required'); return v; };
const text = v => { assert.equal(typeof v, 'string'); return v; };
const zero = v => assert.ok(v === 0 || v === null, 'explicit LPC zero required');
const empty = v => v === null || v === 0 ? {} : map(v);
const copy = v => structuredClone(v);
const metric = (v, k) => Object.hasOwn(map(v), k) ? count(v[k]) : 0;
const sparse = (v, k) => Object.hasOwn(map(v), k) ? int(v[k]) : 0;
const plain = v => text(v).replace(/^\x1b\[256D\x1b\[K/, '').replace(/\x1b\[[0-9;]*m/g, '');
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const staticKeys = ['str', 'int', 'con', 'dex', 'gender', 'character', 'combat_exp', 'jiali',
    'shen', 'potential', 'max_qi', 'max_jing', 'skills', 'mappings', 'preparations', 'cultivation'];
const cultivationKeys = new Set(['class', 'character', 'reborn', 'breakup', 'doing']);
const clean = s => { const v = copy(s); delete v.temp.notify_fail; return v; };
const normalized = temp => { const v = copy(temp); delete v.notify_fail;
    for (const k of Object.keys(v.apply)) if (!v.apply[k]) delete v.apply[k]; return v; };
const sameResources = (b, a, except = []) => resources.filter(k => !except.includes(k)).forEach(k => assert.equal(a[k], b[k], k));
const effective = s => Object.fromEntries(Object.entries(s.skills).map(([k, n]) => [k,
    Math.trunc(n / 2) + (s.skills[s.mappings[k]] ?? 0) + sparse(s.temp.apply, k)]));

function learned(s) {
    const kind = own(s, 'learned_kind'), raw = own(s, 'learned_raw'), view = map(own(s, 'learned'));
    if (kind === 'undefined') zero(raw);
    else if (kind === 'int') assert.equal(int(raw), 0);
    else { assert.equal(kind, 'mapping'); Object.values(map(raw)).forEach(count); }
    assert.deepEqual(view, kind === 'mapping' ? raw : {}, 'raw learned type/view');
    return view;
}
function state(s, side, object) {
    map(s); assert.match(text(own(s, 'object')), /^\/tests\/actor#\d+$/);
    if (object !== undefined) assert.equal(s.object, object);
    assert.equal(own(s, 'id'), side ? 'right' : 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost', 'not_living']) zero(own(s, k));
    for (const k of [...resources, 'max_qi', 'max_jing', 'max_neili', 'jingli', 'max_jingli',
        'str', 'int', 'con', 'dex', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen']) int(own(s, k));
    for (const k of ['skills', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'temp']) map(own(s, k));
    map(own(s.temp, 'apply')); Object.values(s.skills).forEach(count); Object.values(s.temp.apply).forEach(int);
    assert.deepEqual(s.effective_skills, effective(s)); learned(s); empty(own(s, 'conditions'));
    const busy = own(s, 'busy'); if (busy !== '<function>' && busy !== null) count(busy);
    for (const k of ['fighting_opponent', 'killing_opponent']) assert.ok([0, 1].includes(own(s, k)));
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) { text(own(s, slot)); map(own(s, slot + '_details')); }
    return s;
}
function initial(s, config, fighting) {
    for (const [k, v] of Object.entries(config.properties)) {
        if (['name', 'race'].includes(k)) continue; // Not exposed by the existing snapshot.
        const container = k.includes('/') || cultivationKeys.has(k) ? s.cultivation : s;
        const actual = own(container, k); v === 0 ? zero(actual) : assert.equal(actual, v, 'initial ' + k);
    }
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(s[k], config[k]);
    assert.deepEqual(learned(s), {}); assert.deepEqual(empty(s.conditions), config.conditions ?? {});
    assert.equal(s.busy ?? 0, config.busy ?? 0); assert.equal(s.fighting_opponent, Number(fighting));
    // The finite /tests/sword uses init_sword(50), weight3000 and original
    // setup/wield: damage50 and dodge-1 are already in the real apply mapping.
    const apply = config.equipment ? { armor: 100, damage: 50, dodge: -1 } : { armor: 100 };
    for (const [k, v] of Object.entries(config.temp ?? {})) { assert.ok(k.startsWith('apply/')); apply[k.slice(6)] = v; }
    const temp = { user_setup: 1, apply };
    if (!config.equipment) { assert.equal(s.weapon, 'none'); assert.deepEqual(s.weapon_details, {}); }
    else {
        assert.equal(s.weapon, 'sword'); assert.equal(s.weapon_details.program, '/tests/sword');
        assert.match(s.weapon_details.object, /^\/tests\/sword#\d+$/);
        for (const [k, v] of Object.entries({ skill_type: 'sword', flag: 4, damage: 50, weight: 3000, consistence: 100 }))
            assert.equal(s.weapon_details[k], v);
        temp.weapon = s.weapon_details.object;
    }
    assert.deepEqual(s.temp, temp);
    assert.equal(s.handing, 'none'); assert.equal(s.secondary_weapon, 'none');
}
function stable(b, a) { staticKeys.forEach(k => assert.deepEqual(a[k], b[k], 'static ' + k)); }
function account(b, a, counters) {
    Object.values(map(counters)).forEach(count);
    return Object.fromEntries(resources.map(k => {
        const decrease = metric(counters, k + '_cost'), recovery = metric(counters, k + '_recovery');
        assert.equal(b[k] - a[k], decrease - recovery, 'resource ledger ' + k);
        return [k, { decrease, recovery, net_decrease: b[k] - a[k] }];
    }));
}
function exactResourceEvents(metrics, costs = {}, recoveries = {}) {
    for (const k of resources) {
        assert.equal(metric(metrics, k + '_cost'), costs[k] ?? 0, 'original gross cost ' + k);
        assert.equal(metric(metrics, k + '_recovery'), recoveries[k] ?? 0, 'original gross recovery ' + k);
    }
}
function command(raw, p, b) {
    const n = count(own(raw, 'command_accepted')), context = map(own(raw, 'command_context'));
    assert.equal(own(context, 'action'), p.action); assert.equal(own(context, 'actor'), b.object);
    assert.equal(own(context, 'force_me_source'), '/feature/command'); return n;
}
function source(p, key) { const entry = p.source_entries.find(e => e.entry_id.endsWith(':' + key)); assert.ok(entry, key); return entry; }
function growth(b, a, key, amount) {
    const before = learned(b), after = learned(a);
    for (const k of new Set([...Object.keys(before), ...Object.keys(after), key]))
        assert.equal(sparse(after, k) - sparse(before, k), k === key ? amount : 0, 'actual learned ' + k);
}
function launch(raw, b, skill, argument, n = 1) {
    assert.deepEqual(raw.launches, Array.from({ length: n }, () => ({ actor: b.object, skill, argument })));
    assert.equal(metric(raw.metrics[0], 'ability_launched'), n);
}

function research(raw, c) {
    const p = c.parameters, [b] = raw.before, a = raw.after[0];
    assert.deepEqual(raw.after, raw.immediate); assert.equal(raw.research_steps?.length, 1);
    const step = raw.research_steps[0]; assert.equal(step.action, p.action);
    for (const k of ['entry_actor', 'return_actor']) assert.equal(step[k], b.object);
    assert.deepEqual(step.before, raw.before); assert.deepEqual(step.after, raw.after);
    assert.equal(count(step.accepted), raw.command_accepted);
    assert.deepEqual(step.metrics_before, [{}, {}]); assert.deepEqual(step.metrics_after, raw.metrics);
    const lo = count(step.wall_time_before), hi = count(step.wall_time_after); assert.ok(hi >= lo && lo > 0);
    const n = int(a.learned_points - b.learned_points); assert.equal(n, p.completed);
    const started = p.variant !== 'level179' && p.variant !== 'potential0';
    const accepted = !['level179', 'potential0', 'effjing26'].includes(p.variant);
    assert.equal(raw.command_accepted > 0, accepted);
    const fee = n * Math.trunc(1000 / b.int), writeoff = ['jing26', 'jing54-times3'].includes(p.variant) ? b.jing - fee : 0;
    assert.equal(metric(raw.metrics[0], 'jing_cost'), fee + writeoff); assert.equal(a.jing, b.jing - fee - writeoff);
    const lvl = b.skills[p.skill], related = [b.skills.force, ...(b.skills['shenghuo-shengong'] ? [b.skills['shenghuo-shengong']] : [])].sort((a, b) => b - a);
    const scaled = related.reduce((v, x, i) => v + Math.trunc(x * [150, 120][i] / (lvl >= 500 ? 2 : 1)), 0);
    const bound = Math.trunc(Math.trunc(scaled / 15) / 100) + Math.trunc(lvl / 50)
        + Math.trunc((b.int / (lvl >= 500 ? 6 : 12)) ** 2);
    const single = [...new Set(Array.from({ length: bound }, (_, r) => 1 + Math.trunc(r * 100 / (lvl + 100))))];
    let support = [0]; for (let i = 0; i < n; i++) support = [...new Set(support.flatMap(v => single.map(x => v + x)))];
    const gain = sparse(learned(a), p.skill); assert.ok(support.includes(gain)); growth(b, a, p.skill, gain);
    sameResources(b, a, ['jing']); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.interfaces, []);
    const expected = copy(b); expected.jing = a.jing; expected.learned_points += n;
    expected.learned = copy(a.learned); expected.learned_raw = copy(a.learned_raw); expected.learned_kind = a.learned_kind;
    if (started && !['effjing26', 'experience-minus1'].includes(p.variant)) {
        const t = int(own(map(own(a.temp, 'time')), 'research')); assert.ok(t >= lo && t <= hi);
        expected.temp.time = { research: t };
    }
    expected.temp.notify_fail = a.temp.notify_fail; assert.equal(typeof a.temp.notify_fail, 'string');
    assert.deepEqual(a, expected, 'only original research state changes');
    if (!n) assert.ok(raw.reason.trim());
    return { completed: n, gain, fee, writeoff, random_input: null };
}

// Original source capacity for these exact, no-bonus finite actors only.
function capacity(s) { const basic = Math.trunc(s.skills.force / 2) * 10, special = s.skills[s.mappings.force] ?? 0;
    return basic + special * 10 + (s.mappings.force === 'shenghuo-shengong' ? Math.trunc(Math.trunc(special * special * 15 * 16 / 100) / 200) : 0); }
// Only a support check for the source-pinned, living USER states in this finite
// group. Food/water are not exposed: early water exit and post-qi food exit are
// retained as alternatives. Actual observed resource changes require one real
// heal_up opportunity, whose internal integer t is bracketed by the owning HB.
function naturalRecovery(before, after) {
    const keys = [...resources, 'jingli'];
    if (keys.every(k => before[k] === after[k])) return false;
    const partial = Object.fromEntries(keys.map(k => [k, before[k]]));
    partial.jing = Math.min(before.eff_jing, before.jing + before.con + Math.trunc(before.max_jingli / 10));
    partial.eff_jing += Number(partial.jing >= before.eff_jing && before.eff_jing < before.max_jing);
    if (!before.busy) partial.qi = Math.min(before.eff_qi, before.qi + before.con * 2 + Math.trunc(before.max_neili / 20));
    else if (partial.qi >= before.eff_qi) partial.qi = before.eff_qi;
    partial.eff_qi += Number(partial.qi >= before.eff_qi && before.eff_qi < before.max_qi);
    const full = { ...partial };
    if (before.max_jingli && before.jingli < before.max_jingli)
        full.jingli = Math.min(before.max_jingli, before.jingli + before.con + Math.trunc(before.effective_skills.force / 6));
    if (before.max_neili && before.neili < before.max_neili)
        full.neili = Math.min(before.max_neili, before.neili + before.con * 2 + Math.trunc(before.effective_skills.force / 3));
    assert.ok([partial, full].some(candidate => keys.every(k => candidate[k] === after[k])), 'one original heal_up resource support');
    return true;
}
function timed(raw, p, steps = []) {
    const events = list(own(raw, 'force_events')); assert.ok(events.length, 'actual original timeline required');
    const clock = map(own(raw, 'command_clock'));
    let originLow = count(own(clock, 'wall_time_before')), originHigh = count(own(clock, 'wall_time_after')) + 1;
    assert.ok(originHigh > originLow);
    let previous = raw.immediate[0], counters = raw.immediate_metrics[0], elapsed = 0, stepIndex = 0, beats = 0, expiries = 0;
    let previousNaturalLower = null, naturalUpdates = 0;
    for (const e of events) {
        assert.ok(['heartbeat', 'expiry'].includes(own(e, 'kind'))); assert.deepEqual(own(e, 'before'), previous);
        state(own(e, 'after'), 0, previous.object); stable(previous, e.after);
        assert.deepEqual(own(e, 'metrics_before'), counters);
        Object.values(map(own(e, 'metrics_after'))).forEach(count);
        const delta = Object.fromEntries([...new Set([...Object.keys(counters), ...Object.keys(e.metrics_after)])].map(k => [k,
            count(metric(e.metrics_after, k) - metric(counters, k))]));
        account(e.before, e.after, delta);
        const start = time(own(e, 'elapsed_before')), end = time(own(e, 'elapsed')); assert.ok(start >= elapsed && end >= start && end <= raw.elapsed);
        const lo = count(own(e, 'wall_time_before')), hi = count(own(e, 'wall_time_after')); assert.ok(hi >= lo);
        // time() is an integer observation, not the exact internal t or the
        // high-resolution origin. Require a common feasible origin interval.
        originLow = Math.max(originLow, lo - end); originHigh = Math.min(originHigh, hi + 1 - start);
        assert.ok(originLow < originHigh, 'elapsed/wall brackets have no common origin');
        const provenance = map(own(e, 'source'));
        const entry = e.kind === 'heartbeat' ? { path: 'inherit/char/char.c', function: 'heart_beat' }
            : source(p, 'remove_effect');
        assert.deepEqual(provenance, { path: entry.path, function: entry.function, sha256: p.source_evidence[entry.path] });
        assert.equal(own(e, 'step_count_before'), stepIndex); const last = count(own(e, 'step_count_after'));
        if (e.kind === 'heartbeat') {
            beats++; assert.ok(last === stepIndex || last === stepIndex + 2); assert.equal(metric(delta, 'heartbeats'), 1);
            let afterContinuation = e.before;
            if (last > stepIndex) {
                const [b, a] = steps.slice(stepIndex, last); assert.ok(b && a);
                for (const x of [b, a]) { assert.ok(x.elapsed >= start && x.elapsed <= end); state(x.state, 0, previous.object); }
                // Original busy continuation occurs before natural heal_up in heart_beat.
                assert.deepEqual(b.state, e.before);
                for (const k of ['max_neili', 'skills', 'mappings', 'learned', 'learned_raw', 'learned_kind']) assert.deepEqual(e.after[k], a.state[k]);
                afterContinuation = a.state;
            }
            if (naturalRecovery(afterContinuation, e.after)) {
                const lower = previousNaturalLower === null ? lo : Math.max(lo, previousNaturalLower + 5);
                assert.ok(lower <= hi, 'original natural heal_up clock has no feasible internal t');
                previousNaturalLower = lower; naturalUpdates++;
            }
        } else {
            expiries++; assert.equal(last, stepIndex); assert.equal(metric(delta, 'heartbeats'), 0);
            const pair = raw.callbacks.slice((expiries - 1) * 2, expiries * 2);
            assert.deepEqual(pair.map(x => x.phase), ['before', 'after']);
            assert.deepEqual(pair.map(x => x.state), [e.before, e.after]);
            assert.ok(pair[0].elapsed >= start && pair[1].elapsed <= end);
        }
        stepIndex = last; previous = e.after; counters = e.metrics_after; elapsed = end;
    }
    assert.equal(stepIndex, steps.length);
    if (p.halt_after) {
        const halt = map(own(raw, p.panel === 'exercise' ? 'exercise_halt' : 'healing_halt'));
        assert.deepEqual(own(halt, 'before'), previous); assert.deepEqual(own(halt, 'after'), raw.after[0]);
        const delta = Object.fromEntries([...new Set([...Object.keys(counters), ...Object.keys(raw.metrics[0])])].map(k =>
            [k, count(metric(raw.metrics[0], k) - metric(counters, k))]));
        account(previous, raw.after[0], delta); assert.equal(metric(delta, 'heartbeats'), 0);
        if (p.panel === 'exercise') {
            sameResources(previous, raw.after[0], ['neili']);
            assert.equal(raw.after[0].neili, Math.min(previous.neili, previous.max_neili * 2));
            assert.equal(raw.after[0].max_neili, previous.max_neili);
        }
    } else { assert.deepEqual(previous, raw.after[0]); assert.deepEqual(counters, raw.metrics[0]); }
    assert.equal(metric(raw.metrics[0], 'heartbeats'), beats);
    return { heartbeats: beats, expiries, natural_updates: naturalUpdates, elapsed };
}

function expiry(raw, p) {
    const b = raw.before[0], a = raw.immediate[0], end = raw.after[0], shield = p.ability === 'shield';
    const amount = Math.trunc((p.skill === 'shenghuo-xinfa' ? b.effective_skills.force : b.skills[p.skill]) / (shield ? 2 : p.skill === 'shenghuo-xinfa' ? 6 : 3));
    const keys = shield ? ['armor'] : ['attack', 'dodge', 'parry'], flag = shield ? 'shield' : 'powerup';
    const expected = normalized(b.temp); keys.forEach(k => expected.apply[k] = sparse(expected.apply, k) + amount); expected[flag] = 1;
    assert.deepEqual(normalized(a.temp), expected); assert.equal(b.neili - a.neili, shield ? 100 : 150);
    assert.equal(raw.outcome, 'observed'); assert.ok(raw.command_accepted > 0); assert.deepEqual(raw.interfaces, []);
    launch(raw, b, p.skill, p.ability); growth(b, a, p.skill, 1);
    const clock = map(own(raw, 'command_clock')), lo = count(own(clock, 'wall_time_before')), hi = count(own(clock, 'wall_time_after')); assert.ok(hi >= lo);
    assert.equal(raw.callbacks.length, 2); const pair = raw.callbacks;
    assert.deepEqual(pair.map(e => [e.side, e.phase]), [[0, 'before'], [0, 'after']]);
    const events = timed(raw, p); assert.equal(events.expiries, 1);
    const e = raw.force_events.find(e => e.kind === 'expiry'); assert.ok(e.wall_time_after >= lo + p.original_delay_seconds,
        'natural callback cannot precede original delay');
    assert.ok(e.elapsed >= p.original_delay_seconds - 1); assert.ok(raw.elapsed >= e.elapsed);
    assert.deepEqual(normalized(end.temp), normalized(b.temp));
    sameResources(e.before, e.after); assert.equal(e.before.temp[flag], 1); zero(e.after.temp[flag] ?? 0);
    return { ...events, amount, original_delay: p.original_delay_seconds, callback_elapsed: pair[0].elapsed };
}

function dispel(raw, p) {
    const side = Number(p.other), b = raw.before[0], a = raw.after[0], victim = raw.before[side], end = raw.after[side];
    const old = empty(victim.conditions)[p.condition_name], now = empty(end.conditions)[p.condition_name];
    assert.deepEqual(raw.after, raw.immediate); assert.ok(raw.command_accepted > 0); launch(raw, b, 'force', p.action.slice(6));
    growth(b, a, 'force', 1); const initialFee = p.other ? 250 : 100;
    let fee = initialFee, change = 'retained';
    if (p.condition_name === 'freezing') {
        const need = old.level + 10 + (p.other ? Math.trunc((old.level + 10) / 5) : 0), power = b.effective_skills.force;
        if (need <= power) {
            const available = b.neili - initialFee, divisor = p.other ? 4 : 2;
            const removed = Math.min(old.remain, Math.trunc(Math.trunc(available * power / (old.level + 1)) / divisor));
            fee += removed === old.remain ? Math.trunc(old.remain * divisor * (old.level + 1) / power) : available;
            if (removed === old.remain) { assert.equal(now, undefined); change = 'cleared'; }
            else { assert.deepEqual(now, { ...old, remain: old.remain - removed }); change = 'reduced'; }
        } else assert.deepEqual(now, old);
    } else assert.deepEqual(now, old);
    assert.equal(change, p.planned_condition_change); assert.equal(metric(raw.metrics[0], 'neili_cost'), fee);
    sameResources(b, a, ['neili']); assert.equal(b.neili - a.neili, fee);
    sameResources(raw.before[1], raw.after[1]);
    const range = p.condition_name === 'bandaged' ? p.other ? [[2], [1]] : [[1], [0]]
        : change === 'retained' ? p.other ? [[6,7,8,9,10,11], [4,5,6,7]] : [[3,4,5], [0]]
            : p.other ? [[2,3,4], [1,2]] : [[1,2], [0]];
    for (const side of [0, 1]) assert.ok(range[side].includes(raw.after[side].busy ?? 0), 'original outer dispel busy');
    return { condition_origin: p.condition_origin, change, remaining: now === undefined ? null : copy(now), neili_cost: fee };
}

function inherited(raw, p) {
    assert.equal(raw.outcome, 'observed'); assert.equal(raw.reason, ''); assert.ok(!Object.hasOwn(raw, 'command_accepted'));
    const ordinary = map(own(raw, 'ordinary_step')); assert.equal(ordinary.actor, 0); assert.equal(ordinary.target, 1); assert.equal(ordinary.type, 0);
    assert.ok([-1, 0, 1].includes(ordinary.caller_side)); if (ordinary.result !== null) int(ordinary.result);
    assert.equal(raw.attacks.length, 1); assert.equal(raw.actions.length, 1); assert.deepEqual(raw.after, raw.immediate);
    const attack = raw.attacks[0]; assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
    assert.ok([0, -1, -2].includes(attack.result)); count(attack.damage);
    for (const [key, value] of [['hit', 0], ['dodge', -1], ['parry', -2]]) {
        assert.equal(metric(raw.metrics[0], key), Number(attack.result === value)); assert.equal(metric(raw.metrics[1], key), 0);
    }
    assert.deepEqual(raw.interfaces, []); assert.deepEqual(raw.launches, []);
    const calls = raw.passives.filter(x => x.route === 'force'); assert.ok(calls.length <= 1);
    const actor = raw.before[0], required = attack.result === 0 && actor.jiali !== 0
        && actor.neili > actor.jiali && !!actor.mappings.force;
    assert.equal(calls.length, Number(required), 'original mapped force hook count');
    for (const e of calls) {
        assert.equal(e.skill, 'shenghuo-xinfa'); assert.equal(e.actor, 0); assert.equal(e.target, 1);
        const [b, t] = e.before, [a, end] = e.after; int(e.incoming); const factor = count(e.factor);
        assert.equal(factor, actor.jiali, 'original jiali factor');
        for (const [side, s] of e.before.entries()) {
            state(s, side, raw.before[side].object); state(e.after[side], side, s.object);
            stable(raw.before[side], s); sameResources(raw.before[side], s);
        }
        const damage = Math.trunc(Math.min(b.neili, b.max_neili) / 20) + factor - Math.trunc(Math.min(t.neili, t.max_neili) / 24);
        assert.equal(a.neili, b.neili - factor); sameResources(t, end);
        const m = b.effective_skills.force, v = t.effective_skills.force;
        const canReflect = damage < 0 && b.weapon === 'none' && m < v;
        const mustReflect = canReflect && m + Math.max(0, Math.trunc(m / 3) - 1) < v;
        if (mustReflect) assert.ok(e.result && typeof e.result === 'object', 'original guaranteed reflection mapping');
        if (e.result && typeof e.result === 'object') {
            assert.ok(canReflect); assert.equal(e.result.damage, damage * 2); text(e.result.msg);
            assert.deepEqual(Object.keys(e.result).sort(), ['damage', 'msg']);
            assert.ok(m < v, 'reflection random support');
            assert.equal(b.qi - a.qi, -damage * 4); assert.equal(b.eff_qi - a.eff_qi, -damage * 4);
        } else { int(e.result ?? 0); assert.equal(e.result, damage); sameResources(b, a, ['neili']); }
    }
    return { attempts: 1, attacks: raw.attacks.length, hits: metric(raw.metrics[0], 'hit'), force_calls: calls.length,
        reflection_calls: calls.filter(e => e.result && typeof e.result === 'object').length,
        returns: calls.map(e => copy(e.result)), hidden_random: null };
}

export function validateMingjiaoForceRemainingRecord(raw, c) {
    const p = validateMingjiaoForceRemainingCondition(c);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id); assert.equal(own(raw, 'method'), c.method);
    assert.ok(count(own(raw, 'index')) < c.samples); time(own(raw, 'elapsed')); text(own(raw, 'reason'));
    assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(own(raw, 'outcome')));
    if (['error', 'not_applicable'].includes(raw.outcome)) { assert.ok(raw.reason.trim()); return null; }
    assert.equal(raw.outcome, p.expected, 'finite observed/refused outcome');
    for (const k of ['predicted_result', 'random_draws', 'rng_draws', 'force_forecast']) assert.ok(!Object.hasOwn(raw, k), 'prediction is not observation');
    for (const phase of ['before', 'immediate', 'after']) {
        assert.equal(list(own(raw, phase)).length, 2);
        raw[phase].forEach((s, side) => state(s, side, phase === 'before' ? undefined : raw.before[side].object));
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    raw.before.forEach((s, side) => initial(s, side ? p.target : p.actor, p.fighting));
    for (const phase of ['immediate', 'after']) raw[phase].forEach((s, side) => stable(raw.before[side], s));
    for (const phase of ['immediate', 'after']) for (const side of [0, 1]) {
        const b = raw.before[side], a = raw[phase][side];
        assert.equal(a.max_jingli, b.max_jingli);
        if (p.panel !== 'exercise') assert.equal(a.max_neili, b.max_neili, 'only original exercise changes capacity');
        if (p.panel !== 'research') assert.equal(a.learned_points, b.learned_points);
        if (p.panel !== 'dispel') assert.deepEqual(a.conditions, b.conditions, 'no condition changes in this panel');
        if (['capacity', 'recovery', 'dispel'].includes(p.panel)) assert.deepEqual(normalized(a.temp), normalized(b.temp));
    }
    for (const k of ['metrics', 'immediate_metrics']) { assert.equal(list(own(raw, k)).length, 2); raw[k].forEach(m => Object.values(map(m)).forEach(count)); }
    const accounts = raw.before.map((b, side) => account(b, raw.after[side], raw.metrics[side]));
    raw.before.forEach((b, side) => account(b, raw.immediate[side], raw.immediate_metrics[side]));
    for (const k of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'launches', 'refusals', 'callbacks', 'terminals']) list(own(raw, k));
    assert.deepEqual(raw.terminals, []); assert.deepEqual(raw.directs, []);
    const natural = ['exercise', 'healing', 'expiry'].includes(p.panel) && p.expected !== 'refused';
    if (!natural) { assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.metrics, raw.immediate_metrics); raw.metrics.forEach(m => assert.equal(metric(m, 'heartbeats'), 0)); }
    if (p.panel !== 'inherited-hit') {
        for (const k of ['actions', 'attacks', 'passives', 'defenses', 'dodge_checks']) assert.deepEqual(raw[k], []);
        command(raw, p, raw.before[0]);
    }
    let detail = null;
    if (p.panel === 'research') detail = research(raw, c);
    else if (p.panel === 'capacity') {
        assert.ok(raw.command_accepted > 0); assert.equal(raw.interfaces.length, 1); const e = raw.interfaces[0];
        for (const [k, v] of Object.entries(p.interface)) assert.equal(e[k], v);
        const result = own(e, 'result');
        assert.equal(e.implemented_by, p.ability === 'can_learn' ? '/cmds/skill/learn' : '/clone/user/user');
        if (p.ability === 'can_learn') { zero(result); assert.equal(raw.outcome, 'refused'); assert.ok(raw.reason.trim()); }
        else { assert.equal(int(result), p.source_derived_capacity); assert.equal(raw.outcome, 'observed'); }
        assert.deepEqual(clean(raw.after[0]), clean(raw.before[0])); detail = { result: copy(result), owner: e.implemented_by };
        for (const m of raw.metrics) Object.values(m).forEach(v => assert.equal(v, 0, 'pure query has no event'));
    } else if (p.panel === 'inherited-hit') detail = inherited(raw, p);
    else if (p.panel === 'expiry') detail = expiry(raw, p);
    else if (p.panel === 'dispel') detail = dispel(raw, p);
    else if (p.panel === 'repeat') {
        const alias = { ...copy(c), parameters: { ...copy(p), combination: 'repeat', power_selected: 'force' } };
        const sample = copy(raw); sample.command_accepted = Number(raw.command_accepted > 0);
        validateWudangBuffRecord(sample, alias);
        let cost = 0;
        for (const step of raw.buff_steps) if (step.operation.command) {
            assert.equal(Number(count(own(step, 'command_cost')) > 0), step.accepted); cost += step.command_cost;
        }
        assert.equal(cost, raw.command_accepted, 'actual repeated command costs');
        launch(raw, raw.before[0], 'force', p.ability); growth(raw.before[0], raw.after[0], 'force', 1);
        const afterTemp = normalized(raw.after[0].temp), beforeTemp = normalized(raw.before[0].temp);
        delete afterTemp[p.ability]; delete afterTemp.apply; delete beforeTemp.apply;
        assert.deepEqual(afterTemp, beforeTemp, 'no unrelated repeat buffs');
        detail = { commands: raw.buff_steps.filter(s => s.operation.command).length,
            explicit_refill: raw.buff_steps.filter(s => s.operation.refill_neili !== undefined)
                .reduce((n, s) => n + s.after.neili - s.before.neili, 0), natural_expiry: null };
    } else if (p.panel === 'healing') {
        const sample = copy(raw); sample.command_accepted = Number(raw.command_accepted > 0);
        validateWudangHealingRecord(sample, c);
        if (p.expected !== 'refused') { launch(raw, raw.before[0], 'force', p.ability); growth(raw.before[0], raw.after[0], 'force', 1); }
        detail = p.expected === 'refused' ? { terminal: 'refused', heartbeats: 0 }
            : { ...timed(raw, p, raw.healing_steps), terminal: p.expected_end,
                pending_residue: sparse(raw.after[0].temp.pending ?? {}, p.ability === 'heal' ? 'healing' : 'inspiring') };
    } else if (p.panel === 'exercise' || p.panel === 'recovery') {
        const sample = copy(raw); sample.command_accepted = Number(raw.command_accepted > 0);
        validateQuanzhenRecoveryRecord(sample, c);
        if (p.panel === 'recovery') {
            launch(raw, raw.before[0], 'force', p.ability); growth(raw.before[0], raw.after[0], 'force', 1);
            const key = p.ability === 'recover' ? 'qi' : 'jing', gain = raw.before[0]['eff_' + key] - raw.before[0][key];
            let fee = Math.trunc(gain * (p.ability === 'recover' ? 100 : 60) / raw.before[0].effective_skills.force);
            fee = Math.max(20, fee); exactResourceEvents(raw.metrics[0], { neili: fee }, { [key]: gain });
            exactResourceEvents(raw.metrics[1]);
        }
        if (p.panel === 'exercise' && p.expected !== 'refused') {
            for (const step of raw.exercise_steps) assert.equal(step.limit, capacity(raw.before[0]));
            detail = { ...timed(raw, p, raw.exercise_steps), terminal: raw.exercise_terminal };
        } else detail = { terminal: p.panel === 'exercise' ? 'refused' : 'immediate', heartbeats: 0 };
    } else assert.fail('uncovered force panel');
    if (['exercise', 'healing'].includes(p.panel) && p.expected === 'refused') {
        for (const side of [0, 1]) {
            assert.deepEqual(clean(raw.after[side]), clean(raw.before[side]), 'original refused command has no side effect');
            for (const v of Object.values(raw.metrics[side])) assert.equal(v, 0, 'refused command has no event');
        }
    }
    if (p.panel !== 'expiry') assert.deepEqual(raw.callbacks, []);
    if (p.panel !== 'inherited-hit' && !(p.panel === 'dispel' && p.other))
        assert.deepEqual(raw.after[1], raw.before[1], 'unaffected target');
    return { panel: p.panel, matched: true, command_cost: p.panel === 'inherited-hit' ? null : raw.command_accepted,
        commands_accepted: p.panel === 'inherited-hit' ? null : Number(raw.command_accepted > 0), resources: accounts, detail };
}
