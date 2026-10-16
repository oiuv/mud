// FUTURE consumer only: no producer, heartbeat scheduling, source loading or RNG.
// Existing State/Command/Window observations are retained verbatim. The envelope
// and ledger/source-copy/probe/driver verification remain separate responsibilities.
import assert from 'node:assert/strict';
import { validateMingjiaoJiuyangFusionCondition } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionState as stateCheck,
    validateMingjiaoJiuyangFusionCommand as commandCheck,
    validateMingjiaoJiuyangFusionWindow as windowCheck } from './school_mingjiao_jiuyang_fusion_observation.mjs';

const skill = 'jiuyang-shengong', owner = '/cmds/skill/yanlian';
const children = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
const chinese = { 'wudang-jiuyang': '武当九阳功', 'shaolin-jiuyang': '少林九阳功', 'emei-jiuyang': '峨嵋九阳功' };
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const nor = '\x1b[0m', hiw = '\x1b[1;37m', hic = '\x1b[1;36m';
const colors = ['\x1b[1;33m', '\x1b[1;32m', hiw, '\x1b[1;35m', hic];
const copy = value => structuredClone(value);
const plain = value => value.replace(/\x1b\[[0-9;]*m/g, ''); // SGR only, never arbitrary CSI/content
function map(value) { assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value; }
function own(value, key) { assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key]; }
function exact(value, keys) { assert.deepEqual(Object.keys(map(value)).sort(), [...keys].sort()); }
function num(value) { assert.ok(Number.isSafeInteger(value), 'safe integer required'); return value; }
function zero(value) { assert.ok(value === 0 || value === null, 'explicit LPC zero/null required'); }
function time(value) { assert.ok(Number.isFinite(value) && value >= 0); return value; }
function text(value) { assert.equal(typeof value, 'string'); assert.ok(value.trim().length); return value; }
function array(value) { assert.ok(Array.isArray(value)); return value; }
function counters(value) {
    for (const [key, count] of Object.entries(map(value))) {
        assert.ok(num(count) >= 0);
        // All 22 start at full pools and all selected child actions omit force.
        // Original heal_up can only clamp to those same full pools. No recovery is
        // inferred from a timer; no zero is substituted for an absent mapping.
        if (key !== 'heartbeats') assert.equal(count, 0, 'unexpected event/cost ' + key);
    }
}
function effective(skills) { return Object.fromEntries(Object.entries(skills).map(([k, v]) => [k, Math.trunc(v / 2)])); }
function initial(s, cfg, side) {
    assert.match(own(s, 'object'), /^\/tests\/actor#\d+$/);
    assert.equal(own(s, 'id'), side ? 'right' : 'left');
    assert.equal(own(s, 'race'), cfg.properties.race); // FUTURE actual query, old snapshot omits this
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(s, key), 1);
    for (const key of ['wizardp', 'ghost', 'fighting_opponent', 'conditions', 'force_attribute']) zero(own(s, key));
    for (const [key, value] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(key)) continue; // actual names are separately captured below
        const cultivation = key.includes('/') || ['character', 'class', 'reborn', 'breakup', 'doing'].includes(key);
        assert.deepEqual(own(cultivation ? own(s, 'cultivation') : s, key), value, 'initial ' + key);
    }
    for (const key of ['sex', 'improve/neili', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison',
        'can_learn/jiuyang-shengong/enable_weapon']) zero(own(s.cultivation, key));
    assert.deepEqual(own(s, 'skills'), cfg.skills); assert.deepEqual(own(s, 'learned'), {});
    assert.deepEqual(own(s, 'mappings'), cfg.mappings); assert.deepEqual(own(s, 'preparations'), cfg.preparations);
    assert.deepEqual(own(s, 'effective_skills'), effective(cfg.skills));
    assert.equal(own(s, 'effective_str'), cfg.properties.str);
    assert.equal(own(s, 'effective_int'), cfg.properties.int);
    assert.equal(own(s, 'effective_dex'), cfg.properties.dex);
    assert.equal(own(s, 'effective_con'), cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    if (Object.hasOwn(cfg, 'busy')) assert.equal(own(s, 'busy'), cfg.busy);
    else zero(own(s, 'busy')); // Fresh USER mixed busy can retain LPC undefined/null.
    assert.deepEqual(own(s, 'temp'), { user_setup: 1, apply: { armor: 100 } });
    assert.equal(own(s, 'craze'), 0);
    assert.equal(own(s, 'max_craze'), cfg.properties.character === '光明磊落' ? 5000 : 0);
    for (const key of ['weapon', 'secondary_weapon']) assert.equal(own(s, key), 'none');
    for (const key of ['weapon_details', 'secondary_weapon_details']) assert.deepEqual(own(s, key), {});
    for (const key of ['weapon_damage', 'weapon_flag', 'ammunition']) zero(own(s, key));
    num(own(s, 'age'));
}
function stable(s, reference) {
    const a = copy(s), b = copy(reference);
    for (const key of ['skills', 'effective_skills', 'temp', 'busy', 'age']) { delete a[key]; delete b[key]; }
    assert.deepEqual(a, b, 'unrelated USER mutation or missing snapshot field');
    assert.deepEqual(own(s, 'effective_skills'), effective(own(s, 'skills')));
    num(own(s, 'age'));
}
function outside(frames, actor) {
    assert.ok(array(frames).length);
    for (const f of frames) {
        exact(f, ['object', 'function']); assert.equal(typeof f.function, 'string');
        assert.ok(f.object === 0 || f.object === null || typeof f.object === 'string');
        assert.ok(f.object !== owner && !(f.object === actor &&
            ['heart_beat', 'continue_action', 'interrupt_me'].includes(f.function)), 'original stack not unwound');
    }
}
function boundary(b, reference) {
    exact(b, ['elapsed', 'state', 'metrics', 'stack']); time(b.elapsed);
    stateCheck(b.state, reference.object); stable(b.state.snapshot, reference); counters(b.metrics);
}
function sameState(a, b) {
    const x = copy(a), y = copy(b); delete x.snapshot.age; delete y.snapshot.age;
    assert.deepEqual(x, y, 'discontinuous original state');
}
function pendingState(point, step, name = skill) {
    const wanted = copy(point);
    wanted.snapshot.temp.pending = { practice: step, practicing_skill: name };
    wanted.pending = { parent_present: 1, parent_mappingp: 1, parent_raw: copy(wanted.snapshot.temp.pending),
        practice_present: 1, practice_raw: step, skill_present: 1, skill_raw: name };
    return wanted;
}
function bridge(a, b, increment = 0) {
    assert.ok(b.elapsed >= a.elapsed, 'clock reset between original windows');
    sameState(a.state, b.state);
    const keys = new Set([...Object.keys(a.metrics), ...Object.keys(b.metrics)]);
    for (const key of keys) assert.ok((b.metrics[key] ?? 0) >= (a.metrics[key] ?? 0), 'counter reset');
    if (increment !== null) assert.equal((b.metrics.heartbeats ?? 0) - (a.metrics.heartbeats ?? 0), increment,
        'actual heartbeat count is not callback count inferred from parameters');
}
function notices(rows) {
    return array(rows).map(r => {
        exact(r, ['side', 'type', 'text']); assert.ok([0, 1].includes(r.side));
        assert.equal(typeof r.type, 'string'); assert.equal(typeof r.text, 'string');
        return { side: r.side, type: r.type, text: r.text };
    });
}
const finishNotices = {
    'gender-wuxing': '你演练完毕，只感气血上涌，看来自己阴阳不调，无法学此奇功。\n',
    'character-jiaoxia': '你演练完毕，觉得九阳神功正大恢弘，气度俨然，自己怎么也无法将其合一。\n',
    'character-yinxian': '你演练完毕，觉得九阳神功正大恢弘，气度俨然，自己怎么也无法将其合一。\n',
    'raw-int33': '你演练完毕，只感三种九阳神功毫无牵连，看来依你的悟性，无法将其合一。\n',
    'raw-con37': '你演练完毕，发现自己的先天根骨太差，无法将三种九阳神功合一。\n',
    'raw-force199': '你觉得自己基本内功修为太浅，看来暂且无法将三种九阳神功合一。\n',
    cognize99: '你演练完毕，发现自己的武学修养尚待提高，暂且无法将三种九阳神功合一。\n',
    'max-neili3499': '你觉得自己的内力修为太浅，无法将三种九阳神功合一。\n',
};
const successNotice = '一阵凡尘往事涌上心头，你几欲放声长叹。霎那间，你放眼回首，竟有一股莫名\n'
    + '的悲哀。宗师泰斗那种高出不胜寒、登泰山而小天下之感犹然而生，你只觉得以\n'
    + '往的武学现在看来是多么的渺小可笑。\n';
function windowNotices(w, received, names, objects, variant) {
    exact(received, ['write_actor_observed', 'write_actor', 'messages']);
    assert.ok([0, 1].includes(received.write_actor_observed));
    const actual = notices(received.messages), expected = [], writeTexts = [];
    const destination = objects.indexOf(received.write_actor);
    if (received.write_actor_observed) assert.ok(received.write_actor === 0 || received.write_actor === null ||
        typeof received.write_actor === 'string');
    else assert.equal(received.write_actor, null, 'unobserved is not a fabricated receiver');
    // halt executes synchronously in the recorded USER command context. This
    // does not infer the receiver of independent original heartbeat windows.
    if (w.kind === 'halt') {
        if (received.write_actor_observed) assert.equal(received.write_actor, objects[0]);
        for (const row of actual.filter(r => r.type === 'write')) assert.equal(row.side, 0);
    }
    const write = text => { writeTexts.push(text); if (destination >= 0) expected.push({ side: destination, type: 'write', text }); };
    const vision = (text, color = '') => {
        expected.push({ side: 0, type: 'vision', text: color + text.replaceAll('$N', '你') + (color ? nor : '') });
        expected.push({ side: 1, type: 'vision', text: color + text.replaceAll('$N', names[0]) + (color ? nor : '') });
    };
    for (const e of w.events) {
        if (e.phase === 'action') {
            const delivered = actual.find(r => r.side === 0 && r.type === 'vision');
            assert.ok(delivered, 'missing actual child message');
            const color = colors.find(c => delivered.text.startsWith(c));
            assert.ok(color, 'child message color outside original five-color support');
            vision(e.details.action.action.replaceAll('$n', '虚空')
                .replaceAll('$l', '无尽处').replaceAll('$w', '兵刃') + '。\n\n', color);
        }
        if (e.phase === 'return-missing-child') write('你正欲继续演练，突然一楞，这才发现自己不会运用'
            + chinese[e.details.sub_skill] + '\n');
        if (e.phase === 'return-below-child-level') write('你演练完' + chinese[e.details.sub_skill]
            + '这一招，觉得有些迷茫，一时无法继续演练下去。\n');
        if (e.function === 'get_finish' && e.phase === 'before') vision('$N缓缓的收住步伐，似有所思。\n');
        if (e.function === 'get_finish' && e.phase === 'after') {
            const text = e.result ? hiw + successNotice + nor :
                (finishNotices[variant] ?? '你觉得有所感悟，或许再演练一次就能融会贯通，将二者合一。\n')
                + (['gender-wuxing', 'character-jiaoxia', 'character-yinxian'].includes(variant) ? nor : '');
            expected.push({ side: 0, type: 'tell_object', text });
            if (e.result) write(hic + '\n恭喜你练成了「九阳神功」。\n\n' + nor);
        }
        if (e.phase === 'return-halt') write('你收住意念，不再继续演练。\n');
    }
    // Unobserved routing cannot satisfy a complete message gate. Still validate
    // source-guaranteed vision/tell_object deliveries rather than accepting [];
    // writes to unrelated receivers are explicitly outside the two-USER capture.
    const certain = actual.filter(r => r.type !== 'write');
    assert.deepEqual(certain, expected.filter(r => r.type !== 'write'));
    // A partial route still cannot invent a source write or modify its bytes.
    let nextWrite = 0;
    for (const row of actual.filter(r => r.type === 'write')) {
        const at = writeTexts.indexOf(row.text, nextWrite); assert.ok(at >= 0, 'unsupported original write');
        nextWrite = at + 1;
    }
    if (received.write_actor_observed && (destination >= 0 || received.write_actor === 0 || received.write_actor === null))
        assert.deepEqual(actual, expected);
    return received.write_actor_observed === 1 &&
        (destination >= 0 || received.write_actor === 0 || received.write_actor === null);
}
function lateHaltWindow(w, reference) {
    exact(w, ['kind', 'status', 'reason', 'before', 'events', 'after', 'settled']);
    assert.equal(w.kind, 'halt'); assert.equal(w.status, 'closed'); assert.equal(w.reason, '');
    const start = w.before.state, actor = reference.object;
    assert.ok([3, 4].includes(start.pending.practice_raw)); assert.equal(start.snapshot.busy, '<function>');
    outside(w.before.stack, actor); assert.equal(array(w.events).length, 2);
    for (const [i, e] of w.events.entries()) {
        exact(e, ['index', 'elapsed', 'actor', 'caller', 'function', 'phase', 'result', 'details', 'state', 'stack']);
        assert.equal(e.index, i); assert.equal(e.actor, actor); assert.equal(e.caller, owner);
        assert.equal(e.function, 'halt_practice'); assert.equal(e.phase, i ? 'return-halt' : 'enter');
        assert.equal(e.result, i); assert.deepEqual(e.details, {}); stateCheck(e.state, actor);
        stable(e.state.snapshot, reference); assert.equal(e.state.snapshot.busy, 0);
        const frames = array(e.stack), at = frames.findIndex(f => f.object !== '/tests/runner');
        assert.ok(frames.some(f => f.object === '/tests/runner' && f.function === 'observe_jiuyang_fusion'));
        assert.deepEqual(frames[at], { object: owner, function: 'halt_practice' });
        assert.deepEqual(frames[at + 1], { object: actor, function: 'interrupt_me' });
        assert.ok(frames.slice(at + 2).some(f => f.object === '/cmds/std/halt' && f.function === 'main'));
        time(e.elapsed); assert.ok(e.elapsed >= (i ? w.events[0].elapsed : w.before.elapsed));
        const wanted = copy(start); wanted.snapshot.busy = 0; wanted.busy_owner = null; wanted.busy_repr = null;
        if (i) {
            wanted.snapshot.temp.pending = { practice: 0, practicing_skill: 0 };
            wanted.pending = { parent_present: 1, parent_mappingp: 1, parent_raw: copy(wanted.snapshot.temp.pending),
                practice_present: 1, practice_raw: 0, skill_present: 1, skill_raw: 0 };
        }
        // Explicit actual LPC zero/null closure metadata is preserved.
        zero(e.state.busy_owner); zero(e.state.busy_repr);
        wanted.busy_owner = e.state.busy_owner; wanted.busy_repr = e.state.busy_repr;
        sameState(e.state, wanted);
    }
    for (const b of [w.after, w.settled]) {
        boundary(b, reference); outside(b.stack, actor); sameState(b.state, w.events[1].state);
        assert.deepEqual(b.metrics, w.before.metrics); assert.ok(b.elapsed >= w.events[1].elapsed);
    }
    assert.ok(w.settled.elapsed >= w.after.elapsed);
}
function finishedHaltDiagnostic(condition) {
    // This is the ALREADY REVIEWED complete180 condition, not modified raw input
    // or a new case. Only the original halt case has this exact actor/target.
    // The original factory validator below verifies every field/source again.
    const diagnostic = copy(condition), p = diagnostic.parameters;
    diagnostic.id = 'school-mingjiao-fusion-jiuyang-complete180';
    p.variant = 'complete180'; delete p.interrupt;
    p.random_effects = true; p.formal_samples = 100; p.expected = ['observed', 'refused'];
    diagnostic.samples = p.run_mode === 'smoke' ? 2 : p.formal_samples;
    p.source_expectation = { command_cost: 'positive_safe_integer', main_return: 1,
        natural_callbacks: 4, child_actions: 3, get_finish_calls: 1, get_finish_return_support: [0, 1],
        random_failure: { source_expression: 'random(10) > 8', numerator: 1, denominator: 10, forced_sample_count: null },
        success: { merged_level: 180, delete_original_children: true,
            learned_cleanup: 'original_delete_skill_only_if_mapping_exists',
            mapping_cleanup: 'original_delete_skill_map_skill_for_actual_mapped_usages_only', auto_map_new_skill: false },
        failure: { preserve_child_skills_learned_mappings_preparations: true, new_main_skill: false },
        final_state: { pending_practice: 0, pending_practicing_skill: skill, busy_after_original_caller: 0,
            busy_zero_source: 'original_continue_action_after_practicing_return0', pending_write_is_not_delete: true } };
    validateMingjiaoJiuyangFusionCondition(diagnostic);
    return diagnostic;
}

export function validateMingjiaoJiuyangFusionRecord(raw, condition) {
    const p = validateMingjiaoJiuyangFusionCondition(condition);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), condition.method);
    const index = num(own(raw, 'index')); assert.ok(index >= 0 && index < condition.samples);
    time(own(raw, 'elapsed')); assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(own(raw, 'outcome')));
    assert.equal(typeof own(raw, 'reason'), 'string');
    if (['error', 'not_applicable'].includes(raw.outcome)) { text(raw.reason); return null; }
    for (const phase of ['before', 'immediate', 'after', 'metrics']) assert.equal(array(own(raw, phase)).length, 2);
    const f = own(raw, 'fusion');
    exact(f, ['before', 'immediate', 'after', 'names', 'room_no_fight', 'commands', 'windows', 'window_messages', 'status', 'reason']);
    assert.ok(['closed', 'truncated'].includes(f.status)); assert.equal(typeof f.reason, 'string');
    if (f.status === 'closed') assert.equal(f.reason, ''); else text(f.reason);
    assert.equal(array(f.names).length, 2);
    for (const [i, cfg] of [p.actor, p.target].entries()) {
        assert.equal(plain(text(f.names[i])), cfg.properties.name);
        initial(raw.before[i], cfg, i); counters(raw.metrics[i]);
    }
    const actor = raw.before[0], target = raw.before[1], objects = [actor.object, target.object];
    assert.notEqual(actor.object, target.object);
    if (Object.hasOwn(p.room, 'no_fight')) assert.equal(f.room_no_fight, p.room.no_fight);
    else zero(f.room_no_fight); // Deleted room property is not an explicit integer SET0.
    for (const phase of ['before', 'immediate', 'after']) {
        boundary(f[phase], actor); assert.deepEqual(f[phase].state.snapshot, raw[phase][0]);
        stable(raw[phase][1], target);
        const t = copy(raw[phase][1]), before = copy(target); delete t.age; delete before.age;
        assert.deepEqual(t, before, 'passive second USER changed');
    }
    outside(f.before.stack, actor.object); outside(f.immediate.stack, actor.object); outside(f.after.stack, actor.object);
    for (const n of Object.values(f.before.metrics)) assert.equal(n, 0);
    assert.deepEqual(f.after.metrics, raw.metrics[0]);
    assert.ok(f.after.elapsed >= f.immediate.elapsed && f.immediate.elapsed >= f.before.elapsed);
    assert.ok(raw.elapsed >= f.after.elapsed);
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'launches', 'refusals', 'terminals', 'dropped'])
        assert.deepEqual(own(raw, key), [], 'fusion is not combat/exert');
    const commands = array(f.commands), windows = array(f.windows), received = array(f.window_messages);
    assert.ok(commands.length >= 1 && commands.length <= (p.interrupt ? 2 : 1));
    assert.equal(windows.length, received.length);
    const first = commands[0]; commandCheck(first, condition);
    assert.deepEqual(first.before, f.before); assert.deepEqual(first.after, f.immediate);
    if (condition.method === 'yanlian' && first.cost > 0) {
        const wanted = pendingState(f.before.state, 1);
        wanted.snapshot.busy = '<function>'; wanted.busy_owner = first.after.state.busy_owner;
        wanted.busy_repr = first.after.state.busy_repr;
        sameState(first.after.state, wanted);
    }
    const firstMessages = notices(first.messages);
    assert.deepEqual(firstMessages, condition.method === 'interface' || first.cost === 0 ? [] :
        [{ side: 0, type: 'write', text: '你开始演练九阳神功。\n' }]);
    const interfaces = own(raw, 'interfaces'); assert.deepEqual(interfaces, first.interface ? [first.interface] : []);
    let previous = f.immediate, ordering, messagesKnown = true, finish = null, childActions = 0, natural = 0;
    let halted = false, interruptedAt = null;
    const allMessages = [...first.messages];
    for (const [i, w] of windows.entries()) {
        boundary(w.before, actor);
        bridge(previous, w.before, w.kind === 'continue_action' ? 1 : 0);
        if (w.kind === 'halt' && [3, 4].includes(w.before.state.pending.practice_raw)) lateHaltWindow(w, actor);
        else windowCheck(w, p.interrupt && w.kind === 'continue_action' && w.before.state.pending.practice_raw === 4
            ? finishedHaltDiagnostic(condition) : condition);
        for (const e of w.events) { stable(e.state.snapshot, actor); }
        if (w.after !== null) boundary(w.after, actor);
        if (w.settled !== null) boundary(w.settled, actor);
        if (w.status === 'closed') {
            // These are snapshots of one synchronous callback and its return,
            // not a gap in which unrecorded busy callbacks may disappear.
            assert.deepEqual(w.after.metrics, w.before.metrics);
            assert.deepEqual(w.settled.metrics, w.after.metrics);
        }
        const keysEvent = w.events.find(e => e.phase === 'keys');
        if (keysEvent) {
            if (ordering) assert.deepEqual(keysEvent.details.keys, ordering, 'keys order changed between callbacks');
            else ordering = copy(keysEvent.details.keys);
        }
        childActions += w.events.filter(e => e.phase === 'action').length;
        for (const e of w.events.filter(e => e.function === 'get_finish' && e.phase === 'after')) {
            assert.equal(finish, null, 'get_finish called more than once'); finish = e.result;
        }
        if (w.kind === 'continue_action') natural++;
        else { assert.equal(halted, false); halted = true; interruptedAt = w.before.state.pending.practice_raw; }
        messagesKnown = windowNotices(w, received[i], f.names, objects, p.variant) && messagesKnown;
        allMessages.push(...received[i].messages);
        if (w.status !== 'closed') {
            assert.equal(f.status, 'truncated'); assert.equal(i, windows.length - 1);
            assert.equal(commands.length, 1, 'unfinished original caller cannot run another command');
            assert.deepEqual(own(raw, 'skill_messages'), allMessages);
            return { status: 'truncated', condition_matched: false, complete: false, success: null,
                commands: 1, command_cost: first.cost, natural_callbacks: null, get_finish_calls: null,
                callback_cost: null, source_random_failure: null, messages_known: messagesKnown };
        }
        previous = w.settled;
    }
    let lateIdle = false;
    if (commands.length === 2) {
        assert.ok(p.interrupt); const halt = commands[1];
        assert.equal(halt.action, 'halt'); assert.equal(halt.interface, null);
        assert.equal(halt.entry_actor, actor.object); assert.equal(halt.return_actor, actor.object);
        assert.ok(num(halt.cost) >= 0); boundary(halt.before, actor); boundary(halt.after, actor);
        assert.ok(halt.after.elapsed >= halt.before.elapsed, 'clock reset inside original halt command');
        outside(halt.before.stack, actor.object); outside(halt.after.stack, actor.object);
        if (halted) {
            const w = windows.at(-1); assert.equal(w.kind, 'halt');
            assert.deepEqual(halt.before, w.before); assert.deepEqual(halt.after, w.settled);
            assert.ok(halt.cost > 0); assert.deepEqual(halt.messages, []); // original write belongs to the halt window
            if (interruptedAt === 2) commandCheck(halt, condition);
        } else {
            assert.equal(previous.state.snapshot.busy, 0, 'missing original halt callback');
            // Once original busy is zero, additional idle HB can be observed but
            // cannot be relabelled practicing/get_finish callbacks.
            bridge(previous, halt.before, null); assert.equal(halt.cost, 0); lateIdle = true;
            const expected = copy(halt.before.state); expected.snapshot.temp.notify_fail = '你现在不忙。\n';
            sameState(halt.after.state, expected); assert.deepEqual(halt.after.metrics, halt.before.metrics);
            assert.deepEqual(halt.messages, []);
        }
        previous = halt.after;
    } else assert.equal(halted, false, 'halt callback without original USER command');
    bridge(previous, f.after, previous.state.snapshot.busy === 0 ? null : 0);
    assert.deepEqual(own(raw, 'skill_messages'), allMessages);
    if (f.status === 'truncated') return { status: 'truncated', condition_matched: false, complete: false,
        success: null, commands: commands.length, command_cost: commands.reduce((n, c) => n + c.cost, 0),
        natural_callbacks: null, get_finish_calls: null, callback_cost: null, source_random_failure: null, messages_known: messagesKnown };
    let matched = true, success = false;
    if (condition.method === 'interface' || first.cost === 0) {
        assert.equal(windows.length, 0); assert.equal(commands.length, 1); assert.equal(finish, null);
        assert.equal(raw.outcome, condition.method === 'interface' ? 'observed' : 'refused');
    } else if (p.interrupt) {
        assert.equal(commands.length, 2, 'original halt not observed');
        matched = !lateIdle && interruptedAt === 2 && natural === 1 && childActions === 1;
        success = finish === 1; // actual natural merge is distinct from matching the intended halt
        // The observed original halt is a valid action, not an attempted merge failure.
        assert.equal(raw.outcome, halted || f.after.state.snapshot.skills[skill] > 0 ? 'observed' : 'refused');
    } else {
        if (Number.isSafeInteger(p.source_expectation.natural_callbacks))
            assert.equal(natural, p.source_expectation.natural_callbacks);
        if (p.source_expectation.failing_child) {
            const position = ordering.indexOf(p.source_expectation.failing_child) + 1;
            assert.equal(natural, position); assert.equal(finish, null);
            assert.equal(childActions, position - (p.source_expectation.failure_stage === 'child_before_query_action' ? 1 : 0));
        } else {
            assert.equal(natural, 4); assert.equal(childActions, 3); assert.ok([0, 1].includes(finish));
        }
        success = finish === 1;
        assert.equal(raw.outcome, success ? 'observed' : 'refused');
        const allowed = Array.isArray(p.expected) ? p.expected : [p.expected]; assert.ok(allowed.includes(raw.outcome));
        assert.equal(f.after.state.snapshot.busy, 0);
    }
    // No post-finish callbacks, no pending2 clean-up inferred from a blank map.
    if (first.cost > 0 && condition.method !== 'interface') assert.equal(f.after.state.snapshot.busy, 0);
    const commandCost = commands.reduce((n, c) => n + c.cost, 0);
    if (Object.hasOwn(raw, 'command_accepted')) assert.equal(raw.command_accepted, first.cost);
    return { status: messagesKnown ? 'closed' : 'message_unknown', condition_matched: matched && messagesKnown,
        complete: matched && messagesKnown, success: condition.method === 'interface' || !messagesKnown ? null : success,
        commands: commands.length,
        commands_accepted: commands.filter(c => c.cost > 0).length, command_cost: commandCost,
        natural_callbacks: natural, child_actions: childActions, get_finish_calls: finish === null ? 0 : 1,
        get_finish_return: finish, interrupted_at: interruptedAt, missed_interruption: !!p.interrupt && !matched,
        source_random_failure: messagesKnown ? !p.interrupt && ['complete180', 'complete200'].includes(p.variant) && finish === 0 : null,
        callback_cost: Object.fromEntries(resources.map(r => [r, 0])), messages_known: messagesKnown,
        observed_heartbeats: f.after.metrics.heartbeats ?? 0, elapsed: raw.elapsed,
        nonempty_association_cleanup_observed: false };
}
