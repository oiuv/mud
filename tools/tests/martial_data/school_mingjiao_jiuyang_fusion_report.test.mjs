// Handwritten synthetic fixtures adapted from RecordV2 tests; NO native run or producer.
// These literal states/messages are independent of production validators, not imported test code.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { buildCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionConditions } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { digest } from './ledger.mjs';
import { mingjiaoJiuyangFusionReport as report, mingjiaoJiuyangFusionEffects as effects,
    mingjiaoJiuyangFusionMarkdown as markdown } from './school_mingjiao_jiuyang_fusion_report.mjs';

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
function state(c, side = 0) {
    const cfg = side ? c.parameters.target : c.parameters.actor, s = {
        object: side ? target : actor, id: side ? 'right' : 'left', race: '人类',
        userp: 1, playerp: 1, interactive: 1, living: 1, ghost: 0, wizardp: 0,
        age: 14, fighting_opponent: 0, conditions: null, force_attribute: null,
        skills: clone(cfg.skills), mappings: {}, preparations: {}, learned: {},
        cultivation: {}, temp: { user_setup: 1, apply: { armor: 100 } }, busy: cfg.busy ?? 0,
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
function trace(c, { finish = 1, keys = children, haltAt = 2 } = {}) {
    const p = c.parameters, initial = state(c), query = c.method === 'interface';
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
        outcome, reason: '', before: [clone(initial.snapshot), state(c, 1).snapshot],
        immediate: [clone(immediate.snapshot), state(c, 1).snapshot],
        after: [clone(previous.state.snapshot), state(c, 1).snapshot], metrics: [clone(previous.metrics), {}],
        actions: [], attacks: [], directs: [], passives: [], launches: [], refusals: [], terminals: [], dropped: [],
        interfaces: first.interface ? [clone(first.interface)] : [], skill_messages: allMessages,
        fusion: { before, immediate: mid, after: clone(previous), names: ['试侠', '试侠'],
            room_no_fight: p.room.no_fight ?? 0, commands, windows, window_messages: received, status: 'closed', reason: '' } };
}


const smokeConditions = mingjiaoJiuyangFusionConditions(
    { skills: [{ path: main, sha256: hash(read(main)) }] }, read, { smoke: true });
function manifest(all = conditions, smoke = false) {
    const entries = [...new Map(all.map(c => {
        const s = c.parameters.source_entry;
        const role = s.id === main + ':109:get_ready' ? 'other_function'
            : s.id === main + ':181:query_sub_skills' ? 'query_or_gate' : s.role;
        return [s.id, { id: s.id, path: s.path, role, sha256: s.sha256 }];
    })).values()];
    const identity = { source_fingerprint: digest({ synthetic: true }), dictionary_sha256: null,
        entries_sha256: digest(entries), execution: { collection: 'school-combat', smoke,
            source_files: clone(all[0].parameters.source_evidence) }, conditions: clone(all) };
    return { format: 1, kind: 'martial_data_series', entries, identity, fingerprint: digest(identity) };
}
const formal = manifest(), smoke = manifest(smokeConditions, true);
const reseal = m => { m.identity.entries_sha256 = digest(m.entries); m.fingerprint = digest(m.identity); };
function row(c, index = 0, options = {}, m = formal) {
    const raw = trace(c, options); raw.index = index;
    if (raw.outcome === 'refused') raw.reason = '合成原记录：未形成新技能';
    return pack(c, raw, m);
}
function pack(c, raw, m = formal) {
    return { format: 1, fingerprint: m.fingerprint, condition_id: c.id, condition_sha256: digest(c),
        index: raw.index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw) };
}
function diagnostic(c, index, outcome, m = formal) {
    return pack(c, { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .5,
        outcome, reason: '真实观察仍未知 | <diagnostic>\n下一行' }, m);
}
function changedRow(c, mutate, options = {}, m = formal) {
    const r = row(c, 0, options, m); mutate(r.raw); r.outcome = r.raw.outcome; r.reason = r.raw.reason;
    r.raw_sha256 = digest(r.raw); return r;
}

test('22有限条件/240正式/44烟雾的空记录均未知，不从期望填入效果', () => {
    assert.equal(conditions.length, 22); assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 240);
    assert.equal(smokeConditions.reduce((n, c) => n + c.samples, 0), 44);
    for (const [all, m] of [[conditions, formal], [smokeConditions, smoke]]) for (const c of all) {
        const result = report([], c, m);
        assert.equal(result.effects.known, null); assert.equal(result.effects.complete_plan, null);
        assert.equal(result.coverage.complete, false); assert.equal(result.coverage.missing, c.samples);
        assert.match(markdown(result, m, []), /融合、费用与自然回调统计：未知/);
    }
});

test('真实buildInventory/buildCatalog的两查询原role与冻结接口用途精确绑定', () => {
    const catalog = buildCatalog(buildInventory(fileURLToPath(root)), read('data/e2c_dict.o').toString('utf8'));
    const actual = mingjiaoJiuyangFusionConditions(catalog, read);
    assert.deepEqual(actual, conditions);
    const source = catalog.skills.find(s => s.path === main), m = clone(formal);
    for (const [variant, role] of [['get-ready', 'other_function'], ['query-sub-skills', 'query_or_gate']]) {
        const c = find(variant), e = source.entries.find(e => e.id === c.entry_id);
        assert.equal(e.role, role); assert.equal(c.parameters.source_entry.role, 'interface');
        assert.equal(e.evidence.line, c.parameters.source_entry.line);
        assert.equal(e.function, c.parameters.source_entry.function);
        m.entries[m.entries.findIndex(x => x.id === e.id)] = {
            id: e.id, path: e.evidence.path, role: e.role, sha256: e.evidence.sha256,
        };
    }
    m.identity.source_fingerprint = digest(catalog); reseal(m);
    for (const variant of ['get-ready', 'query-sub-skills']) {
        const c = find(variant), rows = [row(c, 0, {}, m), row(c, 1, {}, m)];
        assert.equal(report(rows, c, m).coverage.complete, true);
        for (const badRole of ['interface', 'command', variant === 'get-ready' ? 'query_or_gate' : 'other_function']) {
            const bad = clone(m); bad.entries.find(e => e.id === c.entry_id).role = badRole; reseal(bad);
            assert.throws(() => report([row(c, 0, {}, bad)], c, bad));
        }
        for (const edit of [e => e.function = 'fake', e => e.line = c.parameters.source_entry.line + 1,
            e => e.path = 'kungfu/skill/force.c', e => e.sha256 = '0'.repeat(64), e => e.id += '-other']) {
            const bad = clone(m); edit(bad.entries.find(e => e.id === c.entry_id)); reseal(bad);
            assert.throws(() => report([], c, bad));
        }
        const altered = clone(c); altered.parameters.source_entry.role = source.entries.find(e => e.id === c.entry_id).role;
        assert.throws(() => report([], altered, manifest([altered])));
    }
});

test('所有22条件的手写正常双槽可验，但两随机正式条件不能以2冒100', () => {
    for (const c of conditions) {
        const rows = [row(c), row(c, 1)], result = report(rows, c, formal);
        assert.equal(result.coverage.normal, 2, c.id);
        assert.equal(result.coverage.complete, c.samples === 2, c.id);
        assert.equal(result.effects.complete_plan !== null, c.samples === 2);
    }
});

test('正式100原槽独立合成正负结果：受理100、原随机失败37、成功63，不强制九一比例', () => {
    const c = find('complete200');
    const rows = Array.from({ length: 100 }, (_, i) => row(c, i, { finish: i < 37 ? 0 : 1 }));
    const result = report(rows.reverse(), c, formal), k = result.effects.known;
    assert.equal(result.coverage.complete, true);
    assert.deepEqual(result.records.map(r => r.index), Array.from({ length: 100 }, (_, i) => i));
    assert.deepEqual([k.commands, k.commands_accepted, k.command_cost, k.fusion_commands_accepted,
        k.natural_callbacks, k.child_actions, k.get_finish_calls, k.observed_heartbeats],
    [100, 100, 2300, 100, 400, 300, 100, 400]);
    assert.equal(k.outcomes.fusion_success, 63); assert.equal(k.outcomes.source_random_failure, 37);
    assert.equal(k.random_trials, 100); assert.equal(k.fusion_success_rate, .63);
    assert.equal(k.source_random_failure_rate, .37);
    assert.deepEqual(k.merged_level_frequencies, { 200: 63 });
    assert.deepEqual(k.callback_cost, { qi: 0, eff_qi: 0, jing: 0, eff_jing: 0, neili: 0 });
    assert.deepEqual(result.effects.complete_plan, k); assert.deepEqual(effects(rows, c, formal).known, k);
    assert.match(markdown(result, formal, rows), /不是零伤害/);
});

test('接口get_ready返回1、已有技能拒绝、资格及子技失败不伪计融合成功或随机失败', () => {
    for (const [variant, kind, accepted] of [
        ['get-ready', 'interface', 0], ['query-sub-skills', 'interface', 0],
        ['already-known', 'command_refused', 0], ['raw-int33', 'qualification_refused', 2],
        ['below180-wudang-jiuyang', 'child_refused', 2],
    ]) {
        const c = find(variant), k = report([row(c), row(c, 1)], c, formal).effects.known;
        assert.equal(k.outcomes[kind], 2); assert.equal(k.outcomes.fusion_success, 0);
        assert.equal(k.outcomes.source_random_failure, 0); assert.equal(k.random_trials, 0);
        assert.equal(k.fusion_success_rate, null); assert.equal(k.fusion_commands_accepted, accepted);
    }
});

test('正确原pending2 halt计条件完成但不计融合：两命令54成本，一自然HB', () => {
    const c = find('halt-after-first-step'), rows = [row(c), row(c, 1)], r = report(rows, c, formal), k = r.effects.known;
    assert.equal(r.coverage.complete, true); assert.equal(k.outcomes.halted, 2);
    assert.deepEqual([k.commands, k.commands_accepted, k.command_cost, k.natural_callbacks,
        k.fusion_commands, k.fusion_commands_accepted], [4, 4, 108, 2, 2, 2]);
    assert.equal(k.outcomes.fusion_success, 0); assert.equal(k.random_trials, 0);
});

test('pending3/4晚halt保成本但全部留诊断，不能进入完整计划/费用正常分母', () => {
    const c = find('halt-after-first-step'), rows = [row(c, 0, { haltAt: 3 }), row(c, 1, { haltAt: 4 })];
    const r = report(rows, c, formal);
    assert.equal(r.coverage.complete, false); assert.equal(r.coverage.missing, 0);
    assert.equal(r.coverage.diagnostics, 2); assert.equal(r.effects.known, null);
    assert.equal(r.effects.complete_plan, null);
    assert.deepEqual(r.records.map(x => x.classification), ['late_halt', 'late_halt']);
    assert.deepEqual(r.records.map(x => x.observation.command_cost), [54, 54]);
});

test('错过halt却真实融合成功仍原样显示；另一原自然失败也不是本halt的随机试验', () => {
    const c = find('halt-after-first-step');
    const rows = [row(c, 0, { haltAt: 5, finish: 1 }), row(c, 1, { haltAt: 5, finish: 0 })];
    const r = report(rows, c, formal);
    assert.equal(r.coverage.normal, 0); assert.equal(r.coverage.complete, false); assert.equal(r.effects.known, null);
    assert.deepEqual(r.records.map(x => x.classification), ['missed_halt', 'missed_halt']);
    assert.deepEqual(r.records.map(x => x.observation.success), [true, false]);
    assert.deepEqual(r.records.map(x => x.merged_level), [180, null]);
    const md = markdown(r, formal, rows);
    assert.match(md, /missed_halt \| 否 \| 是 \| 180 \| 23/);
    assert.match(md, /不算中止条件完成/);
});

test('过早pending1 halt不是源契约，不能把人工中止状态冒有效原halt观察', () => {
    const c = find('halt-after-first-step');
    assert.throws(() => report([row(c, 0, { haltAt: 1 })], c, formal));
});

test('未知写消息目标保留message_unknown与命令成本，不置成功false或随机失败true', () => {
    const c = find('below180-shaolin-jiuyang');
    const r0 = changedRow(c, raw => {
        const receiver = raw.fusion.window_messages.at(-1);
        receiver.write_actor_observed = 0; receiver.write_actor = null;
    });
    const result = report([r0, row(c, 1)], c, formal);
    assert.equal(result.coverage.complete, false); assert.equal(result.coverage.normal, 1);
    assert.equal(result.records[0].classification, 'message_unknown');
    assert.equal(result.records[0].observation.success, null);
    assert.equal(result.records[0].observation.source_random_failure, null);
    assert.equal(result.effects.known.command_cost, 23);
    assert.equal(result.effects.known.outcomes.child_refused, 1);
});

test('截断前缀保原成本23但未知次数，缺窗返回不补原finish0与随机失败', () => {
    const c = find('complete180'), r0 = changedRow(c, raw => {
        raw.fusion.windows = raw.fusion.windows.slice(0, 1);
        raw.fusion.window_messages = raw.fusion.window_messages.slice(0, 1);
        const w = raw.fusion.windows[0]; w.events = w.events.slice(0, 2); w.after = null; w.settled = null;
        w.status = 'open'; w.reason = 'synthetic interrupted original trace';
        raw.fusion.status = 'truncated'; raw.fusion.reason = w.reason;
        raw.fusion.window_messages[0].messages = [];
        raw.skill_messages = clone(raw.fusion.commands[0].messages);
    });
    const result = report([r0], c, formal), v = result.records[0];
    assert.equal(v.classification, 'truncated'); assert.equal(v.observation.command_cost, 23);
    assert.equal(v.observation.get_finish_calls, null); assert.equal(v.observation.source_random_failure, null);
    assert.equal(result.effects.known, null); assert.equal(result.coverage.complete, false);
    assert.match(markdown(result, formal, [r0]), /synthetic interrupted original trace/);
});

test('error/NA两个原槽完整也只诊断，保留原因且不可当正常0耗时费用', () => {
    const c = find('get-ready'), rows = [diagnostic(c, 0, 'error'), diagnostic(c, 1, 'not_applicable')];
    const result = report(rows, c, formal);
    assert.equal(result.coverage.missing, 0); assert.equal(result.coverage.error, 1);
    assert.equal(result.coverage.not_applicable, 1); assert.equal(result.coverage.complete, false);
    assert.equal(result.effects.known, null); assert.equal(result.effects.complete_plan, null);
    assert.equal(result.exceptional.length, 2);
    assert.match(markdown(result, formal, rows), /\\\| &lt;diagnostic&gt;<br>/);
    assert.throws(() => report([diagnostic(c, 0, 'error', { ...formal, fingerprint: 'f'.repeat(64) })], c, formal));
});

test('模式必须原manifest绑定：正式100缩2即使重签condition/rows/manifest也拒绝', () => {
    for (const variant of ['complete180', 'complete200']) {
        const original = find(variant), reduced = clone(original); reduced.samples = 2;
        const m = manifest([reduced]); const rows = [0, 1].map(i => pack(reduced, { ...trace(original), index: i }, m));
        assert.throws(() => report(rows, reduced, m));
        reduced.parameters.run_mode = 'smoke'; const resealed = manifest([reduced], false);
        const sealedRows = [0, 1].map(i => pack(reduced, { ...trace(original), index: i }, resealed));
        assert.throws(() => report(sealedRows, reduced, resealed));
        // A legitimately separate smoke manifest is NOT the original formal manifest.
        const separateSmoke = manifest([reduced], true);
        assert.throws(() => report(sealedRows, reduced, separateSmoke));
        assert.throws(() => report([row(original)], reduced, separateSmoke));
        const s = smokeConditions.find(c => c.parameters.variant === variant), goodRows = [row(s, 0, {}, smoke), row(s, 1, {}, smoke)];
        assert.equal(report(goodRows, s, smoke).coverage.complete, true);
        assert.throws(() => report(goodRows, s, formal));
        assert.match(markdown(report(goodRows, s, smoke), smoke, goodRows), /仅为独立烟雾记录/);
    }
});

test('确定性同2槽也不能自报smoke；缺mode/boolean字符串及模式重签拒绝', () => {
    const c = find('get-ready');
    for (const value of [true, 'false', undefined]) {
        const m = clone(formal);
        if (value === undefined) delete m.identity.execution.smoke; else m.identity.execution.smoke = value;
        reseal(m); assert.throws(() => report([], c, m));
    }
    const s = clone(c); s.parameters.run_mode = 'smoke';
    assert.throws(() => report([], s, formal));
    assert.throws(() => report([], s, manifest([s], false)));
    delete s.parameters.run_mode; assert.throws(() => report([], s, manifest([s], false)));
});

test('清单fingerprint/entries_digest/条件匹配严格；重新签错源码入口依然拒绝', () => {
    const c = find('complete180');
    const edits = [
        m => m.format = 2, m => m.kind = 'wrong', m => m.fingerprint = 'f'.repeat(64),
        m => m.identity.entries_sha256 = 'f'.repeat(64),
        m => { m.identity.conditions = []; reseal(m); },
        m => { m.identity.conditions.push(clone(c)); reseal(m); },
        m => { m.identity.conditions.find(x => x.id === c.id).parameters.actor.properties.str++; reseal(m); },
        m => { m.entries.find(e => e.id === c.entry_id).role = 'file'; reseal(m); },
        m => { m.entries.find(e => e.id === c.entry_id).path = main; reseal(m); },
        m => { m.entries.find(e => e.id === c.entry_id).sha256 = '0'.repeat(64); reseal(m); },
        m => { m.entries.find(e => e.id === c.entry_id).function = 'fake'; reseal(m); },
        m => { m.entries.push(clone(m.entries.find(e => e.id === c.entry_id))); reseal(m); },
        m => { m.entries = m.entries.filter(e => e.id !== c.entry_id); reseal(m); },
        m => { m.identity.execution.source_files[main] = '0'.repeat(64); reseal(m); },
        m => { delete m.identity.execution.source_files['cmds/skill/yanlian.c']; reseal(m); },
    ];
    for (const change of edits) { const m = clone(formal); change(m); assert.throws(() => report([], c, m)); }
    const altered = clone(c); altered.parameters.source_entry.function = 'fake';
    assert.throws(() => report([], altered, manifest([altered])));
});

test('每原row身份/格式/index/digest/outcome/reason强核，重复与错condition拒绝', () => {
    const c = find('get-ready'), good = row(c);
    for (const change of [
        r => r.format = 2, r => r.fingerprint = '0'.repeat(64), r => r.condition_id += '-other',
        r => r.condition_sha256 = '0'.repeat(64), r => r.index = null, r => r.index = -1, r => r.index = 2,
        r => r.index = 1, r => r.raw_sha256 = '0'.repeat(64), r => delete r.raw_sha256,
        r => r.outcome = 'refused', r => r.reason = 'changed',
        r => { r.raw.method = 'perform'; r.raw_sha256 = digest(r.raw); },
        r => { r.raw.condition_id = 'different'; r.raw_sha256 = digest(r.raw); },
    ]) {
        const bad = clone(good); change(bad); assert.throws(() => report([bad], c, formal));
    }
    assert.throws(() => report([good, clone(good)], c, formal));
    assert.throws(() => report([row(find('complete180'))], c, formal));
    assert.throws(() => report([good, row(c, 1), row(c, 2)], c, formal));
});

test('缺一个原件与100→2数据删减绝不完整；已知两条统计不外推全计划', () => {
    const c = find('complete180'), rows = [row(c, 99), row(c, 3, { finish: 0 })];
    const result = report(rows, c, formal);
    assert.equal(result.coverage.missing, 98); assert.equal(result.coverage.complete, false);
    assert.equal(result.effects.known.random_trials, 2); assert.equal(result.effects.known.outcomes.fusion_success, 1);
    assert.equal(result.effects.complete_plan, null);
    assert.ok(result.coverage.missing_indices.includes(0)); assert.ok(!result.coverage.missing_indices.includes(99));
});

test('Markdown必须原rows重算；效果/完整/诊断/模式/条件任意摘要篡改拒绝', () => {
    const c = find('halt-after-first-step'), rows = [row(c), row(c, 1)], result = report(rows, c, formal);
    const good = markdown(result, formal, rows);
    assert.match(good, /原执行成本/); assert.match(good, /空关联不证明非空映射/);
    for (const edit of [
        r => r.effects.known.outcomes.fusion_success++,
        r => r.coverage.complete = false, r => r.records[0].observation.success = true,
        r => r.effects.complete_plan.command_cost = 0,
        r => r.series.smoke = true, r => r.condition.parameters.variant = 'complete180',
        r => r.coverage.recorded = 100,
    ]) {
        const bad = clone(result); edit(bad); assert.throws(() => markdown(bad, formal, rows));
    }
    assert.throws(() => markdown(result, formal, rows.slice(0, 1)));
    assert.throws(() => markdown(result, formal));
});

test('纯消费者不修改输入；输出condition与完整汇总互不共享可变引用', () => {
    const c = find('get-ready'), rows = [row(c), row(c, 1)];
    const before = JSON.stringify({ rows, c, formal }), result = report(rows, c, formal);
    markdown(result, formal, rows);
    assert.equal(JSON.stringify({ rows, c, formal }), before);
    result.effects.complete_plan.command_cost = 999;
    assert.notEqual(result.effects.known.command_cost, 999);
    result.condition.parameters.actor.properties.str = 999;
    assert.notEqual(c.parameters.actor.properties.str, 999);
});
