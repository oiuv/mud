// Pure handwritten/synthetic future observations. NO native run or producer.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangFusionConditions } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionRecord as check } from './school_mingjiao_jiuyang_fusion_record.mjs';

const root = new URL('../../../', import.meta.url), clone = value => structuredClone(value);
const read = path => fs.readFileSync(new URL(path, root));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const main = 'kungfu/skill/jiuyang-shengong.c';
const conditions = mingjiaoJiuyangFusionConditions({ skills: [{ path: main, sha256: hash(read(main)) }] }, read);
const find = v => conditions.find(c => c.parameters.variant === v);
const actor = '/tests/actor#123', target = '/tests/actor#124', owner = '/cmds/skill/yanlian';
const skill = 'jiuyang-shengong', children = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
const names = { 'wudang-jiuyang': '武当九阳功', 'shaolin-jiuyang': '少林九阳功', 'emei-jiuyang': '峨嵋九阳功' };
// These are literal ORIGINAL selected action values, not the validator's helpers.
const actions = {
    'wudang-jiuyang': '$N急运武当九阳神功，猛的一拳在呼啸声中陡然挥击而出',
    'shaolin-jiuyang': '$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光',
    'emei-jiuyang': '$N跨步上前，身形微微一展，双掌对准$n$l一并攻出',
};
const outside = [{ object: '/tests/runner', function: 'capture_after_original_return' }];
const parent = [{ object: '/tests/runner', function: 'observe_original_caller' },
    { object: actor, function: 'continue_action' }, { object: actor, function: 'heart_beat' }];
const finishText = {
    'gender-wuxing': '你演练完毕，只感气血上涌，看来自己阴阳不调，无法学此奇功。\n',
    'character-jiaoxia': '你演练完毕，觉得九阳神功正大恢弘，气度俨然，自己怎么也无法将其合一。\n',
    'character-yinxian': '你演练完毕，觉得九阳神功正大恢弘，气度俨然，自己怎么也无法将其合一。\n',
    'raw-int33': '你演练完毕，只感三种九阳神功毫无牵连，看来依你的悟性，无法将其合一。\n',
    'raw-con37': '你演练完毕，发现自己的先天根骨太差，无法将三种九阳神功合一。\n',
    'raw-force199': '你觉得自己基本内功修为太浅，看来暂且无法将三种九阳神功合一。\n',
    cognize99: '你演练完毕，发现自己的武学修养尚待提高，暂且无法将三种九阳神功合一。\n',
    'max-neili3499': '你觉得自己的内力修为太浅，无法将三种九阳神功合一。\n',
};
function state(c, side = 0, uninitialized = false) {
    const cfg = side ? c.parameters.target : c.parameters.actor, s = {
        object: side ? target : actor, id: side ? 'right' : 'left', race: '人类',
        userp: 1, playerp: 1, interactive: 1, living: 1, ghost: 0, wizardp: 0,
        age: 14, fighting_opponent: 0, conditions: null, force_attribute: null,
        skills: clone(cfg.skills), mappings: {}, preparations: {}, learned: {},
        cultivation: {}, temp: { user_setup: 1, apply: { armor: 100 } },
        busy: Object.hasOwn(cfg, 'busy') ? cfg.busy : uninitialized ? null : 0,
        weapon: 'none', secondary_weapon: 'none', weapon_details: {}, secondary_weapon_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0, craze: 0,
        max_craze: cfg.properties.character === '光明磊落' ? 5000 : 0,
        effective_str: cfg.properties.str, effective_int: cfg.properties.int,
        effective_dex: cfg.properties.dex, effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2)])),
    };
    for (const [key, value] of Object.entries(cfg.properties)) {
        if (['name', 'race'].includes(key)) continue;
        const q = key.includes('/') || ['class', 'character', 'reborn', 'breakup', 'doing'].includes(key);
        (q ? s.cultivation : s)[key] = value;
    }
    for (const key of ['sex', 'improve/neili', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison',
        'can_learn/jiuyang-shengong/enable_weapon']) s.cultivation[key] = 0;
    return { snapshot: s, learned_raw: null, learned_mappingp: 0, busy_owner: null, busy_repr: null,
        pending: { parent_present: 0, parent_mappingp: 0, parent_raw: null,
            practice_present: 0, practice_raw: null, skill_present: 0, skill_raw: null } };
}
function busy(s, value) {
    s.snapshot.busy = value; s.busy_owner = value === '<function>' ? owner : null;
    s.busy_repr = value === '<function>' ? 'synthetic original closure identity A' : null;
}
function pending(s, n, value = skill) {
    s.snapshot.temp.pending = { practice: n, practicing_skill: value };
    s.pending = { parent_present: 1, parent_mappingp: 1, parent_raw: clone(s.snapshot.temp.pending),
        practice_present: 1, practice_raw: n, skill_present: 1, skill_raw: value };
}
const boundary = (s, elapsed, metrics = {}, stack = outside) =>
    ({ state: clone(s), elapsed, metrics: clone(metrics), stack: clone(stack) });
function natural(c, initial, n, finish, keys) {
    const events = [], messages = [], s = clone(initial), start = n;
    const add = (fn, phase, result, details) => events.push({ index: events.length,
        elapsed: start + .01 * (events.length + 1), actor, caller: owner, function: fn, phase,
        result, details: clone(details), state: clone(s), stack: [
            { object: '/tests/runner', function: 'observe_jiuyang_fusion' },
            { object: owner, function: 'practicing' }, { object: actor, function: 'continue_action' },
            { object: actor, function: 'heart_beat' }] });
    const vision = (text, colored = false) => {
        const prefix = colored ? '\x1b[1;33m' : '', suffix = colored ? '\x1b[0m' : '';
        messages.push({ side: 0, type: 'vision', text: prefix + text.replaceAll('$N', '你') + suffix },
            { side: 1, type: 'vision', text: prefix + text.replaceAll('$N', '试侠') + suffix });
    };
    const write = text => messages.push({ side: 0, type: 'write', text });
    add('practicing', 'enter', 0, {});
    add('practicing', 'keys', 0, { step: n, skill, keys, sub_skills: Object.fromEntries(children.map(k => [k, 180])) });
    if (n < 4) {
        const child = keys[n - 1], level = s.snapshot.skills[child];
        if (!level) {
            write('你正欲继续演练，突然一楞，这才发现自己不会运用' + names[child] + '\n');
            add('practicing', 'return-missing-child', 0, { step: n, skill, sub_skill: child });
        } else {
            add('practicing', 'action', 0, { step: n, skill, sub_skill: child,
                action: { action: actions[child], lvl: 0, damage_type: '瘀伤' } });
            vision(actions[child].replaceAll('$n', '虚空').replaceAll('$l', '无尽处') + '。\n\n', true);
            if (level < 180) {
                write('你演练完' + names[child] + '这一招，觉得有些迷茫，一时无法继续演练下去。\n');
                add('practicing', 'return-below-child-level', 0, { step: n, skill, sub_skill: child });
            } else { pending(s, n + 1); add('practicing', 'return-continue', 1, { step: n + 1, skill }); }
        }
    } else {
        vision('$N缓缓的收住步伐，似有所思。\n'); pending(s, 0);
        add('get_finish', 'before', 0, { step: 4, skill });
        add('get_finish', 'after', finish, { step: 4, skill });
        messages.push({ side: 0, type: 'tell_object', text: finish ?
            '\x1b[1;37m一阵凡尘往事涌上心头，你几欲放声长叹。霎那间，你放眼回首，竟有一股莫名\n'
            + '的悲哀。宗师泰斗那种高出不胜寒、登泰山而小天下之感犹然而生，你只觉得以\n'
            + '往的武学现在看来是多么的渺小可笑。\n\x1b[0m' :
            (finishText[c.parameters.variant] ?? '你觉得有所感悟，或许再演练一次就能融会贯通，将二者合一。\n')
            + (['gender-wuxing', 'character-jiaoxia', 'character-yinxian'].includes(c.parameters.variant) ? '\x1b[0m' : '') });
        if (finish) {
            write('\x1b[1;36m\n恭喜你练成了「九阳神功」。\n\n\x1b[0m');
            const sum = children.reduce((x, k) => x + s.snapshot.skills[k], 0);
            for (const k of children) { delete s.snapshot.skills[k]; delete s.snapshot.effective_skills[k]; }
            s.snapshot.skills[skill] = Math.trunc(sum / 3); s.snapshot.effective_skills[skill] = Math.trunc(sum / 6);
        }
        add('practicing', 'return-finished', 0, { step: 4, skill });
    }
    if (events.at(-1).result === 0) busy(s, 0);
    const metrics = { heartbeats: n };
    return { window: { kind: 'continue_action', status: 'closed', reason: '',
        before: boundary(initial, start, metrics, parent), events,
        after: boundary(s, start + .08, metrics, parent), settled: boundary(s, start + .1, metrics) },
    received: { write_actor_observed: 1, write_actor: actor, messages } };
}
function haltWindow(before) {
    const s = clone(before.state), events = [];
    busy(s, 0);
    for (const [i, phase] of ['enter', 'return-halt'].entries()) {
        if (i) pending(s, 0, 0);
        events.push({ index: i, elapsed: before.elapsed + .01 * (i + 1), actor, caller: owner,
            function: 'halt_practice', phase, result: i, details: {}, state: clone(s), stack: [
                { object: '/tests/runner', function: 'observe_jiuyang_fusion' },
                { object: owner, function: 'halt_practice' }, { object: actor, function: 'interrupt_me' },
                { object: '/cmds/std/halt', function: 'main' }] });
    }
    const settled = boundary(s, before.elapsed + .04, before.metrics);
    return { window: { kind: 'halt', status: 'closed', reason: '', before: clone(before), events,
        after: boundary(s, before.elapsed + .03, before.metrics), settled },
    received: { write_actor_observed: 1, write_actor: actor,
        messages: [{ side: 0, type: 'write', text: '你收住意念，不再继续演练。\n' }] } };
}
function trace(c, { finish = 1, keys = children, haltAt = 2, uninitialized = false } = {}) {
    const p = c.parameters, initial = state(c, 0, uninitialized), query = c.method === 'interface';
    const immediate = clone(initial), cost = p.source_expectation.command_cost === 'zero' ? 0 : 23;
    if (!query && cost) { pending(immediate, 1); busy(immediate, '<function>'); }
    if (!query && !cost) immediate.snapshot.temp.notify_fail = p.refusal;
    const before = boundary(initial, 0), mid = boundary(immediate, .01);
    const first = { action: p.action, cost, entry_actor: actor, return_actor: actor, before, after: mid,
        messages: query || !cost ? [] : [{ side: 0, type: 'write', text: '你开始演练九阳神功。\n' }],
        interface: query ? { object: '/kungfu/skill/' + skill, function: p.interface.function,
            implemented_by: '/kungfu/skill/' + skill, result: clone(p.source_expectation.result) } : null };
    const commands = [first], windows = [], received = [];
    let previous = mid;
    if (!query && cost) for (let n = 1; n <= 4; n++) {
        if (p.interrupt && n === haltAt) {
            const h = haltWindow(previous); windows.push(h.window); received.push(h.received);
            commands.push({ action: 'halt', cost: 31, entry_actor: actor, return_actor: actor,
                before: clone(previous), after: clone(h.window.settled), messages: [], interface: null });
            previous = h.window.settled; break;
        }
        const outcome = ['complete180', 'complete200', 'halt-after-first-step'].includes(p.variant) ? finish : 0;
        const next = natural(c, previous.state, n, outcome, keys);
        windows.push(next.window); received.push(next.received); previous = next.window.settled;
        if (previous.state.snapshot.busy === 0) break;
    }
    if (p.interrupt && haltAt === 5) {
        const after = clone(previous); after.elapsed += .01; after.state.snapshot.temp.notify_fail = '你现在不忙。\n';
        commands.push({ action: 'halt', cost: 0, entry_actor: actor, return_actor: actor,
            before: clone(previous), after, messages: [], interface: null }); previous = after;
    }
    const allMessages = [...first.messages, ...received.flatMap(r => r.messages)];
    const outcome = query || windows.some(w => w.kind === 'halt' && w.status === 'closed') ||
        previous.state.snapshot.skills[skill] > 0 && cost ? 'observed' : 'refused';
    return { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: previous.elapsed,
        outcome, reason: '', before: [clone(initial.snapshot), state(c, 1, uninitialized).snapshot],
        immediate: [clone(immediate.snapshot), state(c, 1, uninitialized).snapshot],
        after: [clone(previous.state.snapshot), state(c, 1, uninitialized).snapshot], metrics: [clone(previous.metrics), {}],
        actions: [], attacks: [], directs: [], passives: [], launches: [], refusals: [], terminals: [], dropped: [],
        interfaces: first.interface ? [clone(first.interface)] : [], skill_messages: allMessages,
        fusion: { before, immediate: mid, after: clone(previous), names: ['试侠', '试侠'],
            room_no_fight: Object.hasOwn(p.room, 'no_fight') ? p.room.no_fight : uninitialized ? null : 0,
            commands, windows, window_messages: received, status: 'closed', reason: '' } };
}
function rejects(c, good, changes) {
    for (const change of changes) { const bad = clone(good); change(bad); assert.throws(() => check(bad, c)); }
}

test('纯synthetic完整22有限条件/240/44；不注册producer或宣称native', () => {
    assert.equal(conditions.length, 22); assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 240);
    for (const c of conditions) assert.equal(check(trace(c), c).complete, true, c.id);
});
test('原LPC未初始化busy和未声明禁斗接受0或null，22条件不补写原始状态', () => {
    for (const c of conditions) {
        const raw = trace(c, { uninitialized: true }), original = JSON.stringify(raw);
        assert.equal(raw.before[1].busy, null);
        assert.equal(raw.before[0].busy, c.parameters.actor.busy ?? null);
        assert.equal(raw.fusion.room_no_fight, c.parameters.room.no_fight ?? null);
        assert.equal(check(raw, c).complete, true, c.id);
        assert.equal(JSON.stringify(raw), original, 'validator must not normalize raw');
        assert.equal(check(trace(c), c).complete, true, 'literal SET0 fixture remains supported');
    }
});
test('未声明空值不能泛化为缺键/布尔/字符串/非零；显式busy2和禁斗1仍严格', () => {
    const query = find('get-ready'), good = trace(query, { uninitialized: true });
    for (const value of [undefined, false, true, '0', 1, -1, {}, []]) {
        for (const side of [0, 1]) {
            const bad = clone(good);
            if (value === undefined) delete bad.before[side].busy; else bad.before[side].busy = value;
            assert.throws(() => check(bad, query));
        }
        const bad = clone(good);
        if (value === undefined) delete bad.fusion.room_no_fight; else bad.fusion.room_no_fight = value;
        assert.throws(() => check(bad, query));
    }
    for (const [variant, edit] of [
        ['busy2', (raw, value) => { raw.before[0].busy = value; }],
        ['no-fight', (raw, value) => { raw.fusion.room_no_fight = value; }],
    ]) for (const value of [null, 0, false, '1', '2', 3]) {
        const c = find(variant), raw = trace(c, { uninitialized: true }); edit(raw, value);
        assert.throws(() => check(raw, c));
    }
    const c = find('complete180'), ended = trace(c, { uninitialized: true });
    ended.after[0].busy = null; ended.fusion.after.state.snapshot.busy = null;
    assert.throws(() => check(ended, c), 'original terminal busy SET0 is still required');
});
test('手写完整成功锚：4原HB、3子招、一次finish、实际23成本而非一次计数', () => {
    const c = find('complete180'), raw = trace(c), result = check(raw, c);
    assert.deepEqual(raw.fusion.windows.map(w => w.events.map(e => e.function + ':' + e.phase)), [
        ['practicing:enter', 'practicing:keys', 'practicing:action', 'practicing:return-continue'],
        ['practicing:enter', 'practicing:keys', 'practicing:action', 'practicing:return-continue'],
        ['practicing:enter', 'practicing:keys', 'practicing:action', 'practicing:return-continue'],
        ['practicing:enter', 'practicing:keys', 'get_finish:before', 'get_finish:after', 'practicing:return-finished'],
    ]);
    assert.deepEqual(raw.after[0].skills, { force: 300, 'martial-cognize': 100, 'jiuyang-shengong': 180 });
    assert.equal(raw.after[0].busy, 0); assert.deepEqual(raw.after[0].temp.pending, { practice: 0, practicing_skill: skill });
    assert.equal(raw.skill_messages[1].text, '\x1b[1;33m你急运武当九阳神功，猛的一拳在呼啸声中陡然挥击而出。\n\n\x1b[0m');
    assert.equal(raw.skill_messages.at(-1).text, '\x1b[1;36m\n恭喜你练成了「九阳神功」。\n\n\x1b[0m');
    assert.equal(result.command_cost, 23); assert.equal(result.commands_accepted, 1);
    assert.equal(result.natural_callbacks, 4); assert.equal(result.child_actions, 3); assert.equal(result.get_finish_calls, 1);
    assert.equal(result.success, true); assert.equal(result.nonempty_association_cleanup_observed, false);
});
test('原200均值与随机失败保持，源码概率不强制样本比', () => {
    const c = find('complete200'); assert.equal(trace(c).after[0].skills[skill], 200);
    const failure = check(trace(c, { finish: 0 }), c);
    assert.equal(failure.source_random_failure, true); assert.equal(failure.success, false); assert.equal(failure.complete, true);
    assert.deepEqual(trace(c, { finish: 0 }).after[0].skills, c.parameters.actor.skills);
});
test('原runtime keys三种顺序闭合缺子/179，而非手算固定第几次', () => {
    for (const keys of [children, [...children].reverse(), [children[1], children[2], children[0]]])
        for (const c of conditions.filter(c => c.parameters.source_expectation.failing_child)) {
            const r = check(trace(c, { keys }), c);
            assert.equal(r.natural_callbacks, keys.indexOf(c.parameters.source_expectation.failing_child) + 1);
            assert.equal(r.get_finish_calls, 0);
        }
});
test('身份/source/index/缺键及一致篡改两USER初态仍拒绝', () => {
    const c = find('complete180'), good = trace(c);
    rejects(c, good, [r => r.index = null, r => r.index = 100, r => r.condition_id += '-fake',
        r => delete r.reason, r => delete r.metrics, r => delete r.before[0].cultivation.character,
        r => delete r.before[0].race,
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][1].neili = 3400; },
        r => { r.before[0].int = 99; r.fusion.before.state.snapshot.int = 99; r.fusion.commands[0].before.state.snapshot.int = 99; },
        r => r.fusion.names[0] = '伪侠', r => r.fusion.room_no_fight = 1]);
    const bad = clone(c); bad.parameters.source_evidence[main] = '0'.repeat(64); assert.throws(() => check(good, bad));
});
test('跨窗状态/钟/计数/父栈/末端原busy清零均严格', () => {
    const c = find('complete180'), good = trace(c);
    rejects(c, good, [r => r.fusion.windows[1].before.elapsed = .1,
        r => r.fusion.windows[1].before.state.pending.practice_raw = 1,
        r => r.fusion.windows[2].before.metrics.heartbeats = 100,
        r => r.fusion.windows[0].events[0].stack[3].function = 'poll',
        r => r.fusion.windows[1].events[1].details.keys.reverse(),
        r => r.fusion.windows[3].events.splice(3, 0, clone(r.fusion.windows[3].events[3])),
        r => { r.fusion.after.state.snapshot.busy = '<function>'; r.after[0].busy = '<function>'; },
        r => r.fusion.after.stack.push({ object: actor, function: 'heart_beat' }),
        r => { r.metrics[0].jing_cost = 1; r.fusion.after.metrics.jing_cost = 1; },
        r => r.fusion.commands[0].after.state.snapshot.temp.extra = 1]);
});
test('两USER消息按真实receiver核，未观察不可把[]当完整门禁', () => {
    const c = find('below180-shaolin-jiuyang'), raw = trace(c);
    const last = raw.fusion.window_messages.at(-1);
    last.write_actor = target; last.messages.at(-1).side = 1;
    raw.skill_messages = [...raw.fusion.commands[0].messages, ...raw.fusion.window_messages.flatMap(r => r.messages)];
    assert.equal(check(raw, c).complete, true);
    last.write_actor_observed = 0; last.write_actor = null;
    const unknown = check(raw, c); assert.equal(unknown.complete, false); assert.equal(unknown.success, null);
    assert.equal(unknown.status, 'message_unknown'); assert.equal(unknown.command_cost, 23);
    const good = trace(c);
    rejects(c, good, [r => r.fusion.window_messages.at(-1).messages.at(-1).text = '假消息\n',
        r => r.fusion.window_messages[0].messages = [], r => delete r.skill_messages,
        r => { for (const m of r.fusion.window_messages[0].messages) m.text = m.text.replace(/\x1b\[[0-9;]*m/g, ''); },
        r => { for (const m of r.fusion.window_messages[0].messages) m.text = m.text.replace('[1;33m', '[1;31m'); },
        r => r.fusion.window_messages[0].write_actor_observed = 2]);
});
test('真实无USER写接收者明确未投递，但vision/tell仍不可省', () => {
    const c = find('complete180'), raw = trace(c);
    for (const m of raw.fusion.window_messages) { m.write_actor = null; m.messages = m.messages.filter(x => x.type !== 'write'); }
    raw.skill_messages = [...raw.fusion.commands[0].messages, ...raw.fusion.window_messages.flatMap(r => r.messages)];
    assert.equal(check(raw, c).messages_known, true);
    raw.fusion.window_messages[3].messages = [];
    assert.throws(() => check(raw, c));
});
test('实际pending2原halt含出栈；pending3/4错过观察保成本却不计原条件完成', () => {
    const c = find('halt-after-first-step');
    assert.equal(trace(c).outcome, 'observed');
    const misclassified = trace(c); misclassified.outcome = 'refused';
    assert.throws(() => check(misclassified, c));
    const r = check(trace(c), c); assert.equal(r.complete, true); assert.equal(r.command_cost, 54);
    for (const haltAt of [3, 4]) {
        const late = check(trace(c, { haltAt }), c);
        assert.equal(late.complete, false); assert.equal(late.condition_matched, false);
        assert.equal(late.missed_interruption, true); assert.equal(late.command_cost, 54);
        assert.equal(late.interrupted_at, haltAt); assert.equal(late.source_random_failure, false);
    }
});
test('截断前缀保实际命令成本但不计get_finish0/随机失败', () => {
    const c = find('complete180'), r = trace(c); r.fusion.windows = r.fusion.windows.slice(0, 1);
    r.fusion.window_messages = r.fusion.window_messages.slice(0, 1);
    const w = r.fusion.windows[0]; w.events = w.events.slice(0, 2); w.after = null; w.settled = null;
    w.status = 'open'; w.reason = 'real observation truncated'; r.fusion.status = 'truncated'; r.fusion.reason = w.reason;
    r.skill_messages = [...r.fusion.commands[0].messages]; r.fusion.window_messages[0].messages = [];
    const summary = check(r, c);
    assert.equal(summary.complete, false); assert.equal(summary.get_finish_calls, null);
    assert.equal(summary.source_random_failure, null); assert.equal(summary.command_cost, 23);
});
test('错过全部4原HB后原halt不忙拒绝：不篡改pending、不计原halt覆盖', () => {
    const c = find('halt-after-first-step');
    for (const finish of [0, 1]) {
        const raw = trace(c, { haltAt: 5, finish }), result = check(raw, c);
        assert.equal(result.condition_matched, false); assert.equal(result.complete, false);
        assert.equal(result.missed_interruption, true); assert.equal(result.natural_callbacks, 4);
        assert.equal(result.get_finish_calls, 1); assert.equal(result.success, finish === 1);
        assert.equal(result.commands_accepted, 1); assert.equal(result.command_cost, 23);
        assert.equal(raw.fusion.commands[1].cost, 0);
        assert.deepEqual(raw.after[0].temp.pending, { practice: 0, practicing_skill: skill });
        rejects(c, raw, [r => r.fusion.commands[1].cost = 1,
            r => r.fusion.commands[1].after.state.snapshot.temp.notify_fail = '假中止成功\n']);
    }
});
test('formal/smoke晚halt仅内部诊断计划随mode；真实2槽和raw不变且缩减正式100拒绝', () => {
    const catalog = { skills: [{ path: main, sha256: hash(read(main)) }] };
    for (const smoke of [false, true]) {
        const all = mingjiaoJiuyangFusionConditions(catalog, read, { smoke });
        const c = all.find(row => row.parameters.variant === 'halt-after-first-step');
        assert.equal(c.parameters.run_mode, smoke ? 'smoke' : 'formal');
        assert.equal(c.samples, 2); assert.equal(c.parameters.formal_samples, 2);
        for (const finish of [0, 1]) for (const index of [0, 1]) {
            const raw = trace(c, { haltAt: 5, finish }); raw.index = index;
            const conditionBytes = JSON.stringify(c), rawBytes = JSON.stringify(raw);
            const result = check(raw, c);
            assert.equal(result.complete, false); assert.equal(result.condition_matched, false);
            assert.equal(result.missed_interruption, true); assert.equal(result.success, finish === 1);
            assert.equal(result.natural_callbacks, 4); assert.equal(result.get_finish_calls, 1);
            assert.equal(result.commands_accepted, 1); assert.equal(result.command_cost, 23);
            assert.equal(raw.fusion.commands[1].cost, 0);
            assert.equal(JSON.stringify(c), conditionBytes); assert.equal(JSON.stringify(raw), rawBytes);
            const wrongSlot = clone(raw); wrongSlot.index = 2;
            assert.throws(() => check(wrongSlot, c));
        }
        const noMode = clone(c); delete noMode.parameters.run_mode;
        assert.throws(() => check(trace(c, { haltAt: 5 }), noMode));
        if (!smoke) for (const variant of ['complete180', 'complete200']) {
            const complete = all.find(row => row.parameters.variant === variant);
            const reduced = clone(complete); reduced.samples = 2;
            assert.throws(() => check(trace(complete), reduced));
        }
    }
});
test('诊断身份先验，error/NA未知不补正常state/成本0', () => {
    const c = find('complete180');
    for (const outcome of ['error', 'not_applicable']) {
        const r = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: .5,
            outcome, reason: 'actual diagnostic' };
        assert.equal(check(r, c), null);
        rejects(c, r, [x => x.reason = '', x => x.index = null, x => x.index = -1,
            x => x.method = 'perform', x => x.condition_id = 'wrong', x => x.elapsed = -1]);
    }
});
test('末端额外idle原HB计量保真，不冒第5次practicing/get_finish', () => {
    const c = find('complete180'), raw = trace(c);
    raw.fusion.after.metrics.heartbeats = 5; raw.metrics[0].heartbeats = 5;
    raw.fusion.after.elapsed += 1; raw.elapsed += 1;
    const s = check(raw, c); assert.equal(s.complete, true);
    assert.equal(s.observed_heartbeats, 5); assert.equal(s.natural_callbacks, 4); assert.equal(s.get_finish_calls, 1);
});

test('一致篡改不得藏掉忙闭包心跳、倒转halt时间或把原halt写给右侧', () => {
    const complete = find('complete180'), halt = find('halt-after-first-step');
    const hidden = trace(complete);
    hidden.fusion.windows[0].settled.metrics.heartbeats += 5;
    for (const w of hidden.fusion.windows.slice(1))
        for (const phase of ['before', 'after', 'settled']) w[phase].metrics.heartbeats += 5;
    hidden.fusion.after.metrics.heartbeats += 5;
    hidden.metrics[0].heartbeats += 5;
    assert.throws(() => check(hidden, complete));

    const reversal = trace(halt, { haltAt: 5 });
    reversal.fusion.commands[1].after.elapsed = .02;
    reversal.fusion.after.elapsed = .02;
    reversal.elapsed = .02;
    assert.throws(() => check(reversal, halt));

    for (const haltAt of [2, 3, 4]) {
        const wrongReceiver = trace(halt, { haltAt });
        const received = wrongReceiver.fusion.window_messages.at(-1);
        received.write_actor = target;
        for (const message of received.messages) message.side = 1;
        wrongReceiver.skill_messages = [...wrongReceiver.fusion.commands[0].messages,
            ...wrongReceiver.fusion.window_messages.flatMap(r => r.messages)];
        assert.throws(() => check(wrongReceiver, halt));
        received.write_actor_observed = 0;
        received.write_actor = null;
        assert.throws(() => check(wrongReceiver, halt));
    }
});
