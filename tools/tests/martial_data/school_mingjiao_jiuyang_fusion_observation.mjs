// Unregistered preparation-only COMPONENT validators, not a sample Record or Effects.
// No native fusion observation exists. The proposed points below need future runner
// wiring: an existing snapshot plus unnormalised learned, pending presence and busy
// owner; actual call_stack(1/2) pairs; continue_action before/after; a later, out-of-
// USER-stack settlement. A probe labelled get_finish still CALLS FROM practicing.
// No caller position, action draw, message, return, counter or missing point is made
// up here. These checks do not audit the other USER, full initial attributes, raw
// envelope/ledger/provenance, messages' source text, or a complete 22-case outcome.
// In particular, passing these components is NOT native collection readiness.
import assert from 'node:assert/strict';
import { validateMingjiaoJiuyangFusionCondition }
    from './school_mingjiao_jiuyang_fusion_cases.mjs';

const yanlian = '/cmds/skill/yanlian', skill = 'jiuyang-shengong';
const skillObject = '/kungfu/skill/' + skill;
const children = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
const subSkills = Object.fromEntries(children.map(name => [name, 180]));
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
// Verbatim ORIGINAL locals, before yanlian substitutes $n/$l in its separate msg.
const actions = {
    'wudang-jiuyang': ['$N急运武当九阳神功，猛的一拳在呼啸声中陡然挥击而出',
        '$N一声暴喝，十指暮的张开，一股雄厚的内劲澎湃而出'],
    'shaolin-jiuyang': ['$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳',
        '$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光'],
    'emei-jiuyang': ['$N将峨嵋九阳神功运劲于臂，一掌凌空劈斩而出，划出一道炽热的黄芒',
        '$N跨步上前，身形微微一展，双掌对准$n$l一并攻出'],
};
const copy = value => structuredClone(value);
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function map(value) { assert.ok(mapping(value), 'missing mapping'); return value; }
function own(value, key) { assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key]; }
function exact(value, keys) { assert.deepEqual(Object.keys(map(value)).sort(), [...keys].sort()); }
function integer(value) { assert.ok(Number.isSafeInteger(value), 'integer required'); return value; }
function nonnegative(value) { assert.ok(integer(value) >= 0, 'negative integer'); return value; }
function zero(value) { assert.ok(value === 0 || value === null, 'explicit LPC zero/null required'); }
function flag(value) { assert.ok(value === 0 || value === 1, 'observed boolean integer required'); return value; }
function text(value) { assert.equal(typeof value, 'string'); assert.ok(value.length); return value; }
function elapsed(value) { assert.ok(Number.isFinite(value) && value >= 0, 'invalid elapsed'); return value; }

// point.snapshot is the existing snapshot, unchanged. The additional raw fields
// are mandatory FUTURE observations, not values inferred from that snapshot.
export function validateMingjiaoJiuyangFusionState(point, actorObject) {
    exact(point, ['snapshot', 'learned_raw', 'learned_mappingp', 'busy_owner', 'busy_repr', 'pending']);
    const s = map(point.snapshot);
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/);
    if (actorObject !== undefined) assert.equal(s.object, actorObject, 'different USER');
    assert.equal(own(s, 'id'), 'left');
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(s, key), 1);
    for (const key of ['wizardp', 'ghost']) zero(own(s, key));
    for (const key of ['skills', 'learned', 'mappings', 'preparations', 'temp']) map(own(s, key));
    for (const key of resources) integer(own(s, key));
    for (const value of Object.values(s.skills)) nonnegative(value);
    const learnedMapping = flag(point.learned_mappingp);
    assert.equal(learnedMapping, Number(mapping(point.learned_raw)), 'learned raw type');
    if (learnedMapping) {
        for (const value of Object.values(point.learned_raw)) nonnegative(value);
        assert.deepEqual(s.learned, point.learned_raw);
    } else { zero(point.learned_raw); assert.deepEqual(s.learned, {}); }
    if (own(s, 'busy') === '<function>') {
        assert.equal(point.busy_owner, yanlian, 'original closure definition owner');
        text(point.busy_repr); // opaque original sprintf value, not a parsed function name
    } else {
        if (s.busy !== null) nonnegative(s.busy);
        zero(point.busy_owner); zero(point.busy_repr);
    }
    const p = point.pending;
    exact(p, ['parent_present', 'parent_mappingp', 'parent_raw', 'practice_present',
        'practice_raw', 'skill_present', 'skill_raw']);
    assert.equal(flag(p.parent_present), Number(Object.hasOwn(s.temp, 'pending')));
    if (p.parent_present) assert.deepEqual(p.parent_raw, s.temp.pending);
    else zero(p.parent_raw);
    assert.equal(flag(p.parent_mappingp), Number(mapping(p.parent_raw)));
    const rawParent = p.parent_mappingp ? p.parent_raw : {};
    if (!p.parent_mappingp) zero(p.parent_raw);
    for (const [label, key] of [['practice', 'practice'], ['skill', 'practicing_skill']]) {
        assert.equal(flag(p[label + '_present']), Number(Object.hasOwn(rawParent, key)));
        const value = p[label + '_raw'];
        if (p[label + '_present']) assert.deepEqual(value, rawParent[key]);
        else zero(value);
        if (label === 'practice' && value !== null) nonnegative(value);
        if (label === 'skill') assert.ok(value === null || value === 0 || value === skill);
    }
    return point; // never normalise or rewrite the raw observation
}

function stack(frames) {
    assert.ok(Array.isArray(frames) && frames.length, 'actual stack required');
    for (const frame of frames) {
        exact(frame, ['object', 'function']);
        if (frame.object !== 0 && frame.object !== null) text(frame.object);
        assert.equal(typeof frame.function, 'string');
    }
    return frames;
}
const frameIndex = (frames, object, fn, start = 0) => frames.findIndex((f, i) =>
    i >= start && f.object === object && f.function === fn);
function outside(frames, actor) {
    stack(frames);
    assert.ok(!frames.some(f => f.object === yanlian || (f.object === actor &&
        ['heart_beat', 'continue_action', 'interrupt_me'].includes(f.function))), 'original stack still active');
}
function counters(value) {
    map(value); // sparse zero is allowed only in an actually observed mapping
    for (const [key, count] of Object.entries(value)) {
        nonnegative(count);
        if (key !== 'heartbeats' && !resources.some(r => key === r + '_cost' || key === r + '_recovery'))
            assert.equal(count, 0, 'unrelated event ' + key);
    }
}
function boundary(value, actor) {
    exact(value, ['elapsed', 'state', 'metrics', 'stack']); elapsed(value.elapsed);
    validateMingjiaoJiuyangFusionState(value.state, actor); counters(value.metrics); stack(value.stack);
}
function resourceWindow(before, after, noChanges = false) {
    assert.ok(after.elapsed >= before.elapsed);
    const keys = new Set([...Object.keys(before.metrics), ...Object.keys(after.metrics)]);
    for (const key of keys) {
        assert.ok((after.metrics[key] ?? 0) >= (before.metrics[key] ?? 0), 'counter went backwards');
        if (noChanges) assert.equal(after.metrics[key] ?? 0, before.metrics[key] ?? 0,
            'synchronous command/callback counter changed');
    }
    for (const resource of resources) {
        const cost = (after.metrics[resource + '_cost'] ?? 0) - (before.metrics[resource + '_cost'] ?? 0);
        const recovery = (after.metrics[resource + '_recovery'] ?? 0) - (before.metrics[resource + '_recovery'] ?? 0);
        assert.equal(after.state.snapshot[resource] - before.state.snapshot[resource], recovery - cost, 'resource ledger');
        if (noChanges) { assert.equal(cost, 0, 'callback gross cost'); assert.equal(recovery, 0, 'callback recovery'); }
    }
}
function pending(point, step, name = skill) {
    assert.equal(point.pending.parent_present, 1); assert.equal(point.pending.parent_mappingp, 1);
    assert.equal(point.pending.practice_present, 1); assert.equal(point.pending.skill_present, 1);
    assert.equal(point.pending.practice_raw, step); assert.equal(point.pending.skill_raw, name);
}
function core(point) {
    return { skills: point.snapshot.skills, mappings: point.snapshot.mappings,
        preparations: point.snapshot.preparations, learned_raw: point.learned_raw,
        learned_mappingp: point.learned_mappingp };
}
function messages(value) {
    assert.ok(Array.isArray(value), 'unobserved messages');
    for (const row of value) {
        exact(row, ['side', 'type', 'text']); assert.ok([0, 1].includes(row.side));
        assert.equal(typeof row.type, 'string'); assert.equal(typeof row.text, 'string');
    }
}

// A fully observed single command only. main's LPC return is NOT command() cost.
// This does not assert the final outcome of a later natural fusion attempt.
export function validateMingjiaoJiuyangFusionCommand(command, condition) {
    const p = validateMingjiaoJiuyangFusionCondition(condition);
    exact(command, ['action', 'cost', 'entry_actor', 'return_actor', 'before', 'after', 'messages', 'interface']);
    boundary(command.before); const actor = command.before.state.snapshot.object;
    boundary(command.after, actor); outside(command.before.stack, actor); outside(command.after.stack, actor);
    assert.equal(command.entry_actor, actor); assert.equal(command.return_actor, actor);
    nonnegative(command.cost); messages(command.messages);
    const before = command.before.state, after = command.after.state;
    assert.deepEqual(before.snapshot.skills, p.actor.skills);
    assert.deepEqual(before.snapshot.mappings, p.actor.mappings);
    assert.deepEqual(before.snapshot.preparations, p.actor.preparations);
    assert.deepEqual(before.snapshot.learned, {});
    resourceWindow(command.before, command.after, true);
    assert.deepEqual(core(after), core(before), 'command changed skill/learned associations');
    if (condition.method === 'interface') {
        assert.equal(command.action, p.action); assert.ok(command.cost > 0);
        assert.deepEqual(command.interface, { object: p.interface.object, function: p.interface.function,
            implemented_by: skillObject, result: p.source_expectation.result });
        assert.deepEqual(after, before, 'query is not natural growth');
    } else {
        assert.equal(command.interface, null, 'yanlian is not an interface');
        if (command.action === 'halt') {
            assert.ok(p.interrupt); assert.ok(command.cost > 0);
            pending(before, 2); assert.equal(before.snapshot.busy, '<function>');
            pending(after, 0, 0); assert.equal(after.snapshot.busy, 0);
        } else {
            assert.equal(command.action, p.action);
            assert.equal(before.pending.parent_present, 0, 'no invented initial pending');
            if (p.source_expectation.command_cost === 'zero') {
                assert.equal(command.cost, 0);
                assert.equal(own(after.snapshot.temp, 'notify_fail'), p.refusal);
                const l = copy(before), r = copy(after);
                delete l.snapshot.temp.notify_fail; delete r.snapshot.temp.notify_fail;
                assert.deepEqual(r, l, 'early refusal changed state');
            } else {
                assert.ok(command.cost > 0); pending(after, 1);
                assert.equal(after.snapshot.busy, '<function>');
            }
        }
    }
    return true;
}

// Each window is one actual continue_action or original halt command. A missing
// after/settled boundary is explicit null and status=open/error, NEVER result 0.
// before/after bracket the original caller. settled is captured after HB/interrupt
// stack unwinds; only its resource delta may include original natural recovery.
export function validateMingjiaoJiuyangFusionWindow(window, condition) {
    const p = validateMingjiaoJiuyangFusionCondition(condition);
    assert.equal(condition.method, 'yanlian', 'queries have no natural callback window');
    assert.equal(p.source_expectation.command_cost, 'positive_safe_integer', 'early refusal cannot start a callback');
    exact(window, ['kind', 'status', 'reason', 'before', 'events', 'after', 'settled']);
    assert.ok(['continue_action', 'halt'].includes(window.kind));
    assert.ok(['open', 'closed', 'error'].includes(window.status));
    assert.equal(typeof window.reason, 'string');
    if (window.status === 'closed') assert.equal(window.reason, ''); else text(window.reason.trim());
    boundary(window.before); const actor = window.before.state.snapshot.object;
    const initial = window.before.state, step = initial.pending.practice_raw, isHalt = window.kind === 'halt';
    pending(initial, step); assert.ok(step >= 1 && step <= 4); assert.equal(initial.snapshot.busy, '<function>');
    if (step === 4) assert.equal(p.source_expectation.get_finish_calls, 1);
    assert.deepEqual(initial.snapshot.skills, p.actor.skills);
    assert.deepEqual(initial.snapshot.mappings, p.actor.mappings);
    assert.deepEqual(initial.snapshot.preparations, p.actor.preparations);
    assert.deepEqual(initial.snapshot.learned, {}, 'this matrix has no nonzero learned cleanup');
    if (isHalt) { assert.ok(p.interrupt); assert.equal(step, 2); outside(window.before.stack, actor); }
    else {
        const at = frameIndex(window.before.stack, actor, 'continue_action');
        assert.ok(at >= 0 && frameIndex(window.before.stack, actor, 'heart_beat', at + 1) >= 0, 'original HB parent');
    }
    assert.ok(Array.isArray(window.events));
    const phases = [], states = [], details = [];
    let lastTime = window.before.elapsed, finishResult;
    for (const [i, event] of window.events.entries()) {
        exact(event, ['index', 'elapsed', 'actor', 'caller', 'function', 'phase', 'result', 'details', 'state', 'stack']);
        assert.equal(event.index, i); elapsed(event.elapsed); assert.ok(event.elapsed >= lastTime); lastTime = event.elapsed;
        assert.equal(event.actor, actor); assert.equal(event.caller, yanlian);
        validateMingjiaoJiuyangFusionState(event.state, actor); stack(event.stack);
        const callback = isHalt ? 'halt_practice' : 'practicing';
        assert.equal(event.stack[0].object, '/tests/runner', 'actual receiver frame');
        assert.ok(event.stack.some(f => f.object === '/tests/runner' && f.function === 'observe_jiuyang_fusion'));
        const at = event.stack.findIndex(f => f.object !== '/tests/runner');
        assert.ok(at >= 0 && event.stack[at].object === yanlian && event.stack[at].function === callback,
            'first external frame must be actual probe caller');
        const parent = frameIndex(event.stack, actor, isHalt ? 'interrupt_me' : 'continue_action', at + 1);
        assert.ok(parent >= 0, 'actual original parent');
        assert.ok(frameIndex(event.stack, isHalt ? '/cmds/std/halt' : actor,
            isHalt ? 'main' : 'heart_beat', parent + 1) >= 0, 'original command/HB ancestor');
        const phase = event.function + ':' + event.phase;
        phases.push(phase); states.push(event.state); details.push(map(event.details));
        if (phase === 'get_finish:after') {
            assert.ok(finishResult === undefined, 'get_finish called twice');
            assert.ok(p.source_expectation.get_finish_return_support?.includes(event.result)); finishResult = event.result;
        } else assert.equal(event.result, phase.endsWith(':return-continue') || phase.endsWith(':return-halt') ? 1 : 0);
    }
    let expected, child;
    if (isHalt) expected = ['halt_practice:enter', 'halt_practice:return-halt'];
    else if (step === 4) expected = ['practicing:enter', 'practicing:keys', 'get_finish:before',
        'get_finish:after', 'practicing:return-finished'];
    else {
        expected = ['practicing:enter', 'practicing:keys'];
        if (details[1]) {
            const keys = own(details[1], 'keys');
            assert.ok(Array.isArray(keys)); assert.deepEqual([...keys].sort(), [...children].sort());
            child = keys[step - 1];
            if (!initial.snapshot.skills[child]) expected.push('practicing:return-missing-child');
            else expected.push('practicing:action', initial.snapshot.skills[child] < 180
                ? 'practicing:return-below-child-level' : 'practicing:return-continue');
        }
    }
    assert.ok(phases.length <= expected.length);
    assert.deepEqual(phases, expected.slice(0, phases.length), 'original phase sequence');
    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i], point = states[i], d = details[i];
        const wantedCore = copy(core(initial));
        if (phase === 'practicing:return-finished' && finishResult === 1) {
            const sum = children.reduce((total, name) => total + wantedCore.skills[name], 0);
            for (const name of children) delete wantedCore.skills[name];
            wantedCore.skills[skill] = Math.trunc(sum / 3);
        }
        assert.deepEqual(core(point), wantedCore, 'mutation occurred in wrong phase');
        const oldTemp = copy(initial.snapshot.temp), newTemp = copy(point.snapshot.temp);
        delete oldTemp.pending; delete newTemp.pending;
        assert.deepEqual(newTemp, oldTemp, 'unrelated temp mutation');
        for (const resource of resources) assert.equal(point.snapshot[resource], initial.snapshot[resource]);
        assert.equal(point.snapshot.busy, isHalt ? 0 : '<function>', 'busy belongs to original caller');
        if (!isHalt) assert.equal(point.busy_repr, initial.busy_repr, 'busy closure identity changed');
        if (phase.endsWith(':enter')) { assert.deepEqual(d, {}); pending(point, step); }
        else if (phase === 'halt_practice:return-halt') { assert.deepEqual(d, {}); pending(point, 0, 0); }
        else {
            const next = phase === 'practicing:return-continue' ? step + 1 : step;
            assert.equal(own(d, 'step'), next); assert.equal(own(d, 'skill'), skill);
            pending(point, phase.startsWith('get_finish:') || phase.endsWith(':return-finished') ? 0 : next);
            if (phase === 'practicing:keys') {
                exact(d, ['step', 'skill', 'keys', 'sub_skills']);
                assert.ok(Array.isArray(d.keys)); assert.deepEqual([...d.keys].sort(), [...children].sort());
                assert.deepEqual(d.sub_skills, subSkills);
            } else if (phase === 'practicing:action') {
                exact(d, ['step', 'skill', 'sub_skill', 'action']); assert.equal(d.sub_skill, child);
                exact(d.action, ['action', 'lvl', 'damage_type']);
                assert.ok(actions[child].includes(d.action.action)); assert.equal(d.action.lvl, 0);
                assert.equal(d.action.damage_type, '瘀伤');
            } else if (phase.includes('return-missing') || phase.includes('return-below')) {
                exact(d, ['step', 'skill', 'sub_skill']); assert.equal(d.sub_skill, child);
            } else exact(d, ['step', 'skill']);
        }
    }
    if (window.after !== null) {
        assert.equal(phases.length, expected.length, 'caller cannot finish a partial event sequence');
        boundary(window.after, actor); assert.ok(window.after.elapsed >= lastTime);
        const final = states.at(-1); assert.ok(final);
        assert.deepEqual(core(window.after.state), core(final));
        assert.deepEqual(window.after.state.pending, final.pending);
        assert.deepEqual(window.after.state.snapshot.temp, final.snapshot.temp);
        assert.equal(window.after.state.snapshot.busy, phases.at(-1) === 'practicing:return-continue' ? '<function>' : 0);
        if (window.after.state.snapshot.busy === '<function>') assert.equal(window.after.state.busy_repr, final.busy_repr);
        resourceWindow(window.before, window.after, true);
        if (!isHalt) assert.ok(frameIndex(window.after.stack, actor, 'continue_action') >= 0);
        else outside(window.after.stack, actor);
    }
    if (window.settled !== null) {
        assert.notEqual(window.after, null, 'settlement without original return');
        boundary(window.settled, actor); outside(window.settled.stack, actor);
        assert.deepEqual(core(window.settled.state), core(window.after.state));
        assert.deepEqual(window.settled.state.pending, window.after.state.pending);
        assert.deepEqual(window.settled.state.snapshot.temp, window.after.state.snapshot.temp);
        assert.equal(window.settled.state.snapshot.busy, window.after.state.snapshot.busy);
        if (window.settled.state.snapshot.busy === '<function>')
            assert.equal(window.settled.state.busy_repr, window.after.state.busy_repr);
        resourceWindow(window.after, window.settled); // original recovery is not callback cost
    }
    if (window.status !== 'closed') return null; // no zero/result/success invented for unknown
    assert.notEqual(window.after, null); assert.notEqual(window.settled, null);
    assert.equal(phases.length, expected.length);
    return true;
}
