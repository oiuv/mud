// Entirely synthetic COMPONENT tests. No Record, native stack, collection, or
// observed fusion success is produced by these fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangFusionConditions } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionState as stateCheck,
    validateMingjiaoJiuyangFusionCommand as commandCheck,
    validateMingjiaoJiuyangFusionWindow as windowCheck }
    from './school_mingjiao_jiuyang_fusion_observation.mjs';

const root = new URL('../../../', import.meta.url), sha = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceBytes = new Map();
const read = path => {
    if (!sourceBytes.has(path)) sourceBytes.set(path, fs.readFileSync(new URL(path, root)));
    return sourceBytes.get(path);
};
const main = 'kungfu/skill/jiuyang-shengong.c';
const conditions = mingjiaoJiuyangFusionConditions({ skills: [{ path: main, sha256: sha(read(main)) }] }, read);
const condition = variant => conditions.find(c => c.parameters.variant === variant);
const clone = value => structuredClone(value), actor = '/tests/actor#123';
const skill = 'jiuyang-shengong', owner = '/cmds/skill/yanlian';
const names = ['wudang-jiuyang', 'shaolin-jiuyang', 'emei-jiuyang'];
const skillMap = { 'wudang-jiuyang': 180, 'shaolin-jiuyang': 180, 'emei-jiuyang': 180 };
const actionText = {
    'wudang-jiuyang': '$N急运武当九阳神功，猛的一拳在呼啸声中陡然挥击而出',
    'shaolin-jiuyang': '$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光',
    'emei-jiuyang': '$N跨步上前，身形微微一展，双掌对准$n$l一并攻出',
};
const outside = [{ object: '/tests/runner', function: 'settle_fusion' }];
const parent = [{ object: '/tests/runner', function: 'observe_fusion_caller' },
    { object: actor, function: 'continue_action' }, { object: actor, function: 'heart_beat' }];

function busy(point, value) {
    point.snapshot.busy = value;
    point.busy_owner = value === '<function>' ? owner : null;
    point.busy_repr = value === '<function>' ? 'synthetic opaque closure A' : null;
}
function pending(point, step, name = skill) {
    if (step === undefined) delete point.snapshot.temp.pending;
    else point.snapshot.temp.pending = { practice: step, practicing_skill: name };
    point.pending = { parent_present: step === undefined ? 0 : 1,
        parent_mappingp: step === undefined ? 0 : 1,
        parent_raw: step === undefined ? null : clone(point.snapshot.temp.pending),
        practice_present: step === undefined ? 0 : 1, practice_raw: step === undefined ? null : step,
        skill_present: step === undefined ? 0 : 1, skill_raw: step === undefined ? null : name };
}
function state(c = condition('complete180'), step) {
    const p = c.parameters;
    const point = { snapshot: { object: actor, id: 'left', userp: 1, playerp: 1, interactive: 1,
        living: 1, ghost: 0, wizardp: 0, skills: clone(p.actor.skills), learned: {}, mappings: {},
        preparations: {}, temp: { user_setup: 1, apply: { armor: 100 } },
        qi: 1000000, eff_qi: 1000000, jing: 1000000, eff_jing: 1000000, neili: 3500 },
        learned_raw: null, learned_mappingp: 0 };
    busy(point, step === undefined ? (p.actor.busy ?? 0) : '<function>');
    pending(point, step); return point;
}
function boundary(point, time, frames = outside, metrics = {}) {
    return { elapsed: time, state: clone(point), metrics: clone(metrics), stack: clone(frames) };
}
function command(c, cost = 23, halt = false) {
    const before = state(c, halt ? 2 : undefined), after = clone(before), p = c.parameters;
    const query = c.method === 'interface';
    if (halt) { pending(after, 0, 0); busy(after, 0); }
    else if (!query && p.source_expectation.command_cost === 'zero') {
        cost = 0; after.snapshot.temp.notify_fail = p.refusal;
    } else if (!query) { pending(after, 1); busy(after, '<function>'); }
    return { action: halt ? 'halt' : p.action, cost, entry_actor: actor, return_actor: actor,
        before: boundary(before, 0), after: boundary(after, 0.01), messages: [],
        interface: query ? { object: '/kungfu/skill/jiuyang-shengong', function: p.interface.function,
            implemented_by: '/kungfu/skill/jiuyang-shengong', result: p.interface.function === 'get_ready' ? 1 : clone(skillMap) } : null };
}
function window(c = condition('complete180'), step = 1, finish = 1, keys = names, halt = false) {
    const initial = state(c, step), events = [], frames = halt ? outside : parent;
    const add = (fn, phase, value, details, point) => events.push({ index: events.length,
        elapsed: 1.01 + events.length / 100, actor, caller: owner, function: fn, phase, result: value,
        details: clone(details), state: clone(point), stack: [
            { object: '/tests/runner', function: 'copy_point' },
            { object: '/tests/runner', function: 'observe_jiuyang_fusion' },
            { object: owner, function: halt ? 'halt_practice' : 'practicing' },
            { object: actor, function: halt ? 'interrupt_me' : 'continue_action' },
            { object: halt ? '/cmds/std/halt' : actor, function: halt ? 'main' : 'heart_beat' }] });
    let final;
    if (halt) {
        final = clone(initial); busy(final, 0); add('halt_practice', 'enter', 0, {}, final);
        pending(final, 0, 0); add('halt_practice', 'return-halt', 1, {}, final);
    } else {
        add('practicing', 'enter', 0, {}, initial);
        add('practicing', 'keys', 0, { step, skill, keys, sub_skills: skillMap }, initial);
        final = clone(initial);
        if (step === 4) {
            pending(final, 0); add('get_finish', 'before', 0, { step, skill }, final);
            add('get_finish', 'after', finish, { step, skill }, final);
            if (finish === 1) {
                for (const key of names) delete final.snapshot.skills[key];
                final.snapshot.skills[skill] = c.parameters.variant === 'complete200' ? 200 : 180;
            }
            add('practicing', 'return-finished', 0, { step, skill }, final);
        } else {
            const child = keys[step - 1], level = initial.snapshot.skills[child];
            if (!level) add('practicing', 'return-missing-child', 0, { step, skill, sub_skill: child }, final);
            else {
                add('practicing', 'action', 0, { step, skill, sub_skill: child,
                    action: { action: actionText[child], lvl: 0, damage_type: '瘀伤' } }, final);
                if (level < 180) add('practicing', 'return-below-child-level', 0, { step, skill, sub_skill: child }, final);
                else { pending(final, step + 1); add('practicing', 'return-continue', 1, { step: step + 1, skill }, final); }
            }
        }
        if (events.at(-1).phase !== 'return-continue') busy(final, 0);
    }
    return { kind: halt ? 'halt' : 'continue_action', status: 'closed', reason: '',
        before: boundary(initial, 1, frames), events,
        after: boundary(final, 1.1, frames), settled: boundary(final, 1.2) };
}
function rejects(check, good, edits) {
    for (const edit of edits) { const bad = clone(good); edit(bad); assert.throws(() => check(bad)); }
}

test('准备矩阵22/240/44保持；仅组件而非完整Record', () => {
    assert.equal(conditions.length, 22); assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 240);
    const smoke = mingjiaoJiuyangFusionConditions({ skills: [{ path: main, sha256: sha(read(main)) }] }, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 44);
    assert.equal(conditions.filter(c => c.method === 'interface').length, 2);
    assert.equal(conditions.filter(c => c.method === 'yanlian').length, 20);
    for (const c of conditions) assert.equal(commandCheck(command(c), c), true);
});

test('原learned null/0/映射原样保存，缺键及假类型不能归一化', () => {
    for (const raw of [null, 0, {}]) {
        const s = state(); s.learned_raw = raw; s.learned_mappingp = raw && typeof raw === 'object' ? 1 : 0;
        const bytes = JSON.stringify(s); assert.equal(stateCheck(s, actor), s); assert.equal(JSON.stringify(s), bytes);
    }
    rejects(s => stateCheck(s, actor), state(), [s => { delete s.learned_raw; }, s => { s.learned_raw = undefined; },
        s => { s.learned_raw = []; }, s => { s.learned_mappingp = 1; }, s => { s.snapshot.learned = { x: 1 }; }]);
});

test('pending父/子存在位与raw temp交叉；null不等SET0，不删除成员冒清零', () => {
    const s = state(condition('complete180'), 0); assert.doesNotThrow(() => stateCheck(s, actor));
    rejects(x => stateCheck(x, actor), s, [x => { delete x.pending; }, x => { x.pending.parent_present = 0; },
        x => { x.pending.practice_present = 0; }, x => { delete x.snapshot.temp.pending.practice; },
        x => { x.pending.parent_raw = {}; }, x => { x.pending.practice_raw = null; }, x => { x.pending.parent_mappingp = null; }]);
    const c = condition('complete180'), w = window(c, 4);
    rejects(x => windowCheck(x, c), w, [x => {
        const point = x.events[2].state;
        point.snapshot.temp.pending.practice = point.pending.practice_raw = point.pending.parent_raw.practice = null;
    }]);
});

test('真实USER及闭包定义owner严格；不把原函数替成字符串即算观察完整', () => {
    const s = state(condition('complete180'), 1);
    rejects(x => stateCheck(x, actor), s, [x => { x.snapshot.object = '/tests/actor#999'; },
        x => { x.snapshot.userp = 0; }, x => { x.snapshot.id = 'right'; }, x => { x.busy_owner = actor; },
        x => { delete x.busy_repr; }, x => { x.busy_repr = null; }, x => { x.snapshot.busy = '<closure>'; }]);
});

test('两查询分离：1/23/476原cost保留，接口1不是命令成本或融合成功', () => {
    for (const variant of ['query-sub-skills', 'get-ready']) {
        const c = condition(variant);
        for (const cost of [1, 23, 476]) { const q = command(c, cost); assert.equal(commandCheck(q, c), true); assert.equal(q.cost, cost); }
        rejects(q => commandCheck(q, c), command(c), [q => { q.cost = 0; }, q => { q.cost = 0.5; },
            q => { q.cost = -1; }, q => { q.cost = Number.MAX_SAFE_INTEGER + 1; }, q => { delete q.cost; },
            q => { q.cost = null; }, q => { q.cost = '23'; }, q => { q.interface.implemented_by = actor; },
            q => { q.interface.result = 0; }, q => { q.return_actor = '/tests/actor#999'; }, q => { q.messages = null; }]);
    }
});

test('命令受理与自然结果分离，早拒绝只查实际notify_fail，不用空消息补造', () => {
    for (const variant of ['already-known', 'busy2', 'no-fight']) {
        const c = condition(variant), row = command(c);
        assert.equal(row.cost, 0); assert.equal(commandCheck(row, c), true);
        rejects(x => commandCheck(x, c), row, [x => { delete x.after.state.snapshot.temp.notify_fail; },
            x => { x.after.state.snapshot.temp.notify_fail += '伪'; }, x => { x.cost = 23; }]);
        assert.throws(() => windowCheck(window(c), c));
    }
    assert.throws(() => windowCheck(window(), condition('get-ready')));
    for (const cost of [1, 23, 476]) {
        const c = condition('complete180'), row = command(c, cost);
        assert.equal(commandCheck(row, c), true); assert.equal(row.cost, cost);
    }
    const c = clone(condition('complete180')); c.parameters.source_evidence['cmds/skill/yanlian.c'] = '0'.repeat(64);
    assert.throws(() => commandCheck(command(condition('complete180')), c));
});

test('实际keys排列驱动子技能，action复制原二选一，不补force或重抽随机', () => {
    for (const keys of [names, [names[2], names[0], names[1]]]) {
        for (let step = 1; step <= 3; step++) assert.equal(windowCheck(window(undefined, step, 1, keys), condition('complete180')), true);
    }
    const c = condition('complete180'), good = window(c);
    rejects(x => windowCheck(x, c), good, [x => { x.events[1].details.keys = [names[0], names[0], names[2]]; },
        x => { x.events[2].details.action.force = 0; }, x => { x.events[2].details.action.action = '自造动作'; },
        x => { x.events[2].details.sub_skill = names[1]; }, x => { x.events[2].result = 1; }]);
});

test('六缺失/179子阶段可在真实keys第1/2/3位失败，拒绝阶段不冒finish', () => {
    for (const mode of ['missing', 'below180']) for (const child of names) for (let position = 0; position < 3; position++) {
        const c = condition(mode + '-' + child), keys = names.filter(x => x !== child); keys.splice(position, 0, child);
        const w = window(c, position + 1, 0, keys); assert.equal(windowCheck(w, c), true);
        assert.equal(w.events.at(-1).details.sub_skill, child); assert.equal(w.after.state.snapshot.busy, 0);
    }
});

test('get_finish仅一次原调用点，after不提前清技能；0/1皆合法且不强制分布', () => {
    for (const variant of ['complete180', 'complete200']) for (const result of [0, 1]) {
        const c = condition(variant), w = window(c, 4, result);
        assert.equal(windowCheck(w, c), true);
        assert.deepEqual(w.events[3].state.snapshot.skills, c.parameters.actor.skills);
        assert.equal(w.events[4].state.snapshot.busy, '<function>'); assert.equal(w.after.state.snapshot.busy, 0);
    }
    for (const c of conditions.filter(c => c.parameters.source_expectation.failure_stage === 'get_finish_before_final_random')) {
        assert.equal(windowCheck(window(c, 4, 0), c), true); assert.throws(() => windowCheck(window(c, 4, 1), c));
    }
    const c = condition('complete200'), w = window(c, 4, 1);
    rejects(x => windowCheck(x, c), w, [x => { x.events[3].state = clone(x.events[4].state); },
        x => { x.events[3].caller = '/kungfu/skill/jiuyang-shengong'; },
        x => { x.events.splice(4, 0, clone(x.events[3])); x.events.forEach((e, i) => { e.index = i; }); },
        x => { x.events[4].state.snapshot.skills[skill] = 201; }, x => { busy(x.events[4].state, 0); },
        x => { busy(x.after.state, '<function>'); }, x => { x.events[3].state.learned_raw = {}; x.events[3].state.learned_mappingp = 1; }]);
});

test('父/caller须真实栈同链但不固定下标，假label或错误USER祖先拒绝', () => {
    const c = condition('complete180'), w = window(c);
    w.events.forEach(e => e.stack.unshift({ object: '/tests/runner', function: 'another_read_helper' }));
    assert.equal(windowCheck(w, c), true);
    rejects(x => windowCheck(x, c), w, [x => { x.events[0].stack[3].object = '/evil'; },
        x => { x.events[0].stack[4].object = '/tests/actor#999'; },
        x => { x.events[0].stack[5].function = 'manual_heartbeat'; }, x => { x.events[0].stack.reverse(); },
        x => { x.events[0].actor = '/tests/actor#999'; }, x => { x.events[0].caller = actor; }]);
});

test('原halt入口busy已0，两pending成员SET0；发令前仍原busy且pending2', () => {
    const c = condition('halt-after-first-step'), w = window(c, 2, 0, names, true);
    assert.equal(windowCheck(w, c), true); assert.equal(commandCheck(command(c, 476, true), c), true);
    rejects(x => windowCheck(x, c), w, [x => { busy(x.events[0].state, '<function>'); },
        x => { pending(x.events[1].state, 0); }, x => { x.events[0].result = 1; },
        x => { x.before.stack = clone(parent); }, x => { x.events[0].stack.at(-1).object = owner; }]);
});

test('毛费/恢复按窗口闭账；同额扣恢复不能伪装零费用，缺映射不是零', () => {
    const c = condition('complete180'), w = window(c);
    for (const point of [w.before.state, ...w.events.map(e => e.state), w.after.state, w.settled.state]) point.snapshot.neili = 3400;
    w.settled.state.snapshot.neili = 3407; w.settled.metrics.neili_recovery = 7;
    assert.equal(windowCheck(w, c), true);
    rejects(x => windowCheck(x, c), w, [x => { x.after.metrics.neili_cost = x.after.metrics.neili_recovery = 1; },
        x => { delete x.settled.metrics.neili_recovery; }, x => { x.after.metrics = null; },
        x => { delete x.before.metrics; }, x => { x.after.metrics.hit = 1; }, x => { x.after.metrics.neili_cost = -1; },
        x => { x.after.metrics.heartbeats = 99; }, x => { x.after.state.snapshot.temp.fake = 1; },
        x => { x.settled.state.busy_repr = 'synthetic replacement closure'; }]);
});

test('缺返回/缺原HB出栈只能未知，不提前销毁或把截断当原随机失败', () => {
    const c = condition('complete180'), w = window(c, 4, 0);
    w.status = 'open'; w.reason = 'waiting for original caller'; w.after = null; w.settled = null;
    w.events = w.events.slice(0, 3); assert.equal(windowCheck(w, c), null);
    const bytes = JSON.stringify(w); assert.equal(windowCheck(w, c), null); assert.equal(JSON.stringify(w), bytes);
    const diagnostic = clone(w); diagnostic.status = 'error'; diagnostic.reason = 'original callback did not finish';
    assert.equal(windowCheck(diagnostic, c), null);
    rejects(x => windowCheck(x, c), w, [x => { x.status = 'closed'; x.reason = ''; },
        x => { delete x.after; }, x => { x.reason = ''; }, x => { x.events[0].elapsed = -1; }]);
    const done = window(c, 4, 0);
    rejects(x => windowCheck(x, c), done, [x => { x.settled.stack = clone(parent); },
        x => { x.settled.state.snapshot.object = '/tests/actor#999'; }, x => { x.settled.elapsed = 0.5; }]);
});
