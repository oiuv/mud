// Pure future-protocol fixtures, not collected native observations. No driver or registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangResearchConditions }
    from './school_mingjiao_jiuyang_research_cases.mjs';
import { validateMingjiaoJiuyangResearchRecord as validate }
    from './school_mingjiao_jiuyang_research_observation.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(resolve(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const path = 'kungfu/skill/jiuyang-shengong.c', skill = 'jiuyang-shengong';
const conditions = mingjiaoJiuyangResearchConditions({ skills: [{ path, sha256: hash(read(path)) }] }, read);
const copy = value => structuredClone(value);
const pick = variant => { const c = conditions.find(c => c.parameters.variant === variant); assert.ok(c); return c; };
const defaultNotice = '依你目前的能力，没有办法研究这种技能。\n';
const tiredNotice = '你今天太累了，结果什么也没有研究成。\n';
const sameNotice = '你刚刚才研究过（如果你要连续研究，可以指明研究的次数）。\n';
const prefix = '\x1b[256D\x1b[K';
const epoch = 1791975600;

function snapshot(config, side, fighting) {
    const { properties: p, skills: s } = config;
    const state = { object: '/tests/actor#' + (side + 51), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: config.busy ?? null, fighting_opponent: Number(fighting), conditions: null,
        skills: copy(s), mappings: copy(config.mappings), preparations: copy(config.preparations), learned: {},
        temp: { user_setup: 1, apply: { armor: 100 } }, cultivation: { sex: null,
            'immune/poison': null, 'wudang-jiuyang': null, 'special_skill/divine': null },
        effective_skills: Object.fromEntries(Object.entries(s).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (s[config.mappings[key]] ?? 0)])),
        craze: 0, max_craze: 5000, force_attribute: null, age: 25,
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0,
    };
    for (const [key, value] of Object.entries(p)) {
        if (['name', 'race'].includes(key)) continue;
        (key.includes('/') || ['class', 'character', 'reborn', 'doing', 'breakup'].includes(key)
            ? state.cultivation : state)[key] = value;
    }
    for (const [key, basic] of [['str', 'unarmed'], ['con', 'force'], ['dex', 'dodge'], ['int', 'literate']])
        state['effective_' + key] = p[key] + Math.trunc((s[basic] ?? 0) / 10);
    return state;
}

// Independent literal command branching; does not call the production prediction/support helper.
function firstBranch(p) {
    const a = p.actor, q = a.properties, s = a.skills, times = Number(p.action.split(' ').at(-1));
    const result = { accepted: false, completed: 0, writeoff: 0, intro: false,
        stamp: false, notice: '', writes: [], times };
    if (p.room.pigging) result.notice = '你还是专心拱猪吧！\n';
    else if (a.busy) result.notice = '你现在正忙着呢。\n';
    else if (p.room.no_fight && q.doing !== 'scheme') result.notice = '这里太纷杂，你没法作研究。\n';
    else if (times < 1 || times > 100) result.notice = '研究次数最少一次，最多也不能超过一百次。\n';
    else if (p.fighting) result.notice = '临阵磨枪？来不及啦。\n';
    else if (!s[skill]) result.notice = '这项技能你还不会，研究什么？\n';
    else if (s[skill] < 180) result.notice = '你对九阳神功的掌握程度还未到研究的程度。\n';
    else if (q['env/no_learn']) result.notice = '你已设置禁止学习『九阳神功』。\n';
    else if (q.potential - q.learned_points < times) result.notice = '你的潜能不够研究这么多次了。\n';
    else {
        result.intro = true;
        if (q.eff_jing < 25) result.notice = '你觉得你精力不济，实在没有办法进行研究。\n';
        else {
            result.accepted = true; result.notice = defaultNotice;
            if (Math.trunc(s[skill] ** 3 / 10) > q.combat_exp)
                result.writes.push('也许是缺乏实战经验，你感到难以继续研究九阳神功的问题了。\n');
            else {
                result.stamp = true; result.completed = Math.min(times, Math.floor(q.jing / 25));
                if (result.completed < times) result.writeoff = q.jing - result.completed * 25;
                if (!result.completed) result.writes.push(tiredNotice);
                else if (result.completed < times) result.writes.push('你觉得太累了，研究了二次后只好停下来休息。\n');
            }
        }
    }
    return result;
}

function synthetic(c, { cost = 1, cross = false, draws = [], gains } = {}) {
    const p = c.parameters, before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'research', index: 0, elapsed: 0.04,
        outcome: 'refused', reason: '', before, metrics: [{}, {}], command_accepted: 0,
        research_room: { no_fight: p.room.no_fight ?? null, pigging: p.room.pigging ?? null,
            research_improve: p.room.research_improve ?? null }, research_steps: [], skill_messages: [] };
    for (const key of ['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'launches', 'refusals', 'interfaces', 'callbacks', 'dropped', 'terminals', 'background_stopped']) raw[key] = [];
    let states = before, metrics = [{}, {}], completedTotal = 0, drawIndex = 0;
    for (const [i, action] of p.actions.entries()) {
        const branch = i === 0 ? firstBranch(p) : cross
            ? { accepted: true, completed: 0, writeoff: 0, intro: true, stamp: true,
                notice: defaultNotice, writes: [tiredNotice], times: 1 }
            : { accepted: false, completed: 0, writeoff: 0, intro: false, stamp: false,
                notice: sameNotice, writes: [], times: 1 };
        const at = epoch + Number(i > 0 && cross);
        const step = { action, entry_actor: states[0].object, return_actor: states[0].object,
            before: copy(states), metrics_before: copy(metrics), accepted: branch.accepted ? cost : 0,
            reason: branch.accepted ? '' : prefix + branch.notice, wall_time_before: at,
            wall_time_after: at, messages: [] };
        const a = copy(states), m = copy(metrics), jingCost = branch.completed * 25 + branch.writeoff;
        a[0].jing -= jingCost; a[0].learned_points += branch.completed;
        a[0].temp.notify_fail = branch.notice;
        if (branch.stamp) a[0].temp.time = { ...(a[0].temp.time ?? {}), research: at };
        for (let j = 0; j < branch.completed; j++) {
            const r = draws[drawIndex] ?? 0, adjusted = r + Math.floor(r * 100 / 500);
            const gain = gains?.[drawIndex] ?? 1 + Math.floor(adjusted * 100 / (p.level + 100));
            a[0].learned[skill] = (a[0].learned[skill] ?? 0) + gain; drawIndex++;
        }
        if (jingCost) m[0].jing_cost = (m[0].jing_cost ?? 0) + jingCost;
        if (branch.intro) {
            step.messages.push({ side: 0, type: 'write', text: '\x1b[1;32m你开始研究'
                + (branch.times === 3 ? '三' : '一') + '次有关「九阳神功」的奥秘。\n\x1b[0m' });
            step.messages.push({ side: 1, type: 'vision', text: '试侠在冥神思索。\n' });
        }
        if (branch.completed) step.messages.push({ side: 0, type: 'write',
            text: '\x1b[1;35m你研究了一会，似乎对「九阳神功」有些新的领悟。\n\x1b[0m' });
        for (const text of branch.writes) step.messages.push({ side: 0, type: 'write', text });
        step.after = a; step.metrics_after = m;
        raw.research_steps.push(step); raw.skill_messages.push(...copy(step.messages));
        raw.command_accepted += step.accepted; completedTotal += branch.completed;
        states = a; metrics = m;
    }
    raw.immediate = copy(states); raw.after = copy(states); raw.metrics = copy(metrics);
    raw.outcome = completedTotal ? 'observed' : 'refused';
    raw.reason = completedTotal ? '' : states[0].temp.notify_fail;
    return raw;
}

function deny(edit, c = pick('level200'), options) {
    const raw = synthetic(c, options), original = copy(raw); edit(raw);
    assert.notDeepEqual(raw, original, 'negative edit is not a no-op');
    assert.throws(() => validate(raw, c));
}

test('future pure protocol: all25/1128/50 and both indices; original data/conditions unchanged', () => {
    assert.equal(conditions.length, 25);
    assert.equal(conditions.reduce((n, c) => n + c.samples, 0), 1128);
    const frozen = copy(conditions);
    for (const c of conditions) for (const index of [0, 1]) {
        const raw = synthetic(c); raw.index = index; const before = copy(raw);
        const value = validate(raw, c); assert.ok(value.condition_matched);
        assert.equal(c.status, 'prepared_not_sampled'); assert.equal(value.hidden_random_input,
            value.completed ? 'unobserved' : 'not_called'); assert.deepEqual(raw, before);
    }
    assert.deepEqual(conditions, frozen);
});

test('independent hand-written RNG/improve anchors: 180/200/400/800 and original random0 gain1', () => {
    for (const [level, r, gain] of [[180, 14, 6], [200, 15, 7], [400, 21, 6], [800, 62, 9]]) {
        const c = pick('level' + level), value = validate(synthetic(c, { draws: [r] }), c);
        assert.equal(value.learned_net, gain); assert.equal(value.source_derived_gross, gain);
        assert.equal(value.completed, 1); assert.equal(value.normal_jing_fee, 25);
        assert.equal(value.skill_upgrades, 0); assert.equal(value.hidden_random_input, 'unobserved');
        assert.equal(validate(synthetic(c), c).learned_net, 1);
    }
    assert.throws(() => validate(synthetic(pick('level200'), { gains: [8] }), pick('level200')));
});

test('partial3 is two actual completions/learned8/fee50+SET1, not three or fee75', () => {
    const c = pick('jing51-times3'), raw = synthetic(c, { draws: [15, 0], cost: 37 }), r = validate(raw, c);
    assert.equal(r.completed, 2); assert.equal(r.learned_net, 8); assert.equal(r.normal_jing_fee, 50);
    assert.equal(r.jing_writeoff, 1); assert.equal(r.jing_cost, 51); assert.equal(r.command_cost, 37);
    assert.equal(raw.after[0].jing, 0); assert.equal(raw.after[0].learned_points, 2);
    assert.equal(raw.after[0].potential, 10000); assert.equal(raw.after[0].skills[skill], 200);
    assert.equal(r.potential_field_cost, 0);
    deny(r => { r.metrics[0].jing_cost = 75; }, c);
    deny(r => { r.research_steps[0].messages.at(-1).text = '你觉得太累了，研究了两次后只好停下来休息。\n'; }, c);
});

test('jing24 accepted without growth: actualSET24/time write; exp-minus1 return positive without time/fee', () => {
    const c = pick('jing24'), raw = synthetic(c, { cost: 241 }), v = validate(raw, c);
    assert.equal(raw.outcome, 'refused'); assert.equal(v.commands_accepted, 1); assert.equal(v.command_cost, 241);
    assert.equal(v.completed, 0); assert.equal(v.normal_jing_fee, 0); assert.equal(v.jing_writeoff, 24);
    assert.equal(raw.after[0].temp.time.research, epoch); assert.equal(v.learned_net, 0);
    assert.equal(v.hidden_random_input, 'not_called');
    const e = pick('exp-minus1'), eraw = synthetic(e), ev = validate(eraw, e);
    assert.equal(ev.commands_accepted, 1); assert.equal(ev.completed, 0); assert.equal(ev.jing_cost, 0);
    assert.ok(!Object.hasOwn(eraw.after[0].temp, 'time'));
    deny(r => { r.after[0].temp.time.research++; }, c);
    deny(r => { r.research_steps[0].after[0].jing = 1; }, c);
});

test('same-second: two real commands, firstpositiveSET24/secondreject; original timestamp and CSI notice', () => {
    const c = pick('same-second-jing24'), raw = synthetic(c, { cost: 73 }), r = validate(raw, c);
    assert.equal(r.commands, 2); assert.equal(r.commands_accepted, 1); assert.equal(r.commands_refused, 1);
    assert.equal(r.command_cost, 73); assert.equal(r.jing_cost, 24); assert.equal(r.completed, 0);
    assert.equal(r.same_second_status, 'met'); assert.equal(r.condition_matched, true);
    assert.deepEqual(r.same_second, { trials: 1, refused: 1 });
    assert.equal(raw.research_steps[0].after[0].temp.time.research,
        raw.research_steps[1].after[0].temp.time.research);
    deny(r => { r.research_steps[1].wall_time_before++; r.research_steps[1].wall_time_after++; }, c);
    deny(r => { r.research_steps[1].after[0].temp.time.research++; }, c);
    deny(r => { r.research_steps[1].accepted = 1; }, c);
});

test('cross-second path stays actual/refused-no-growth but conditionnotmet and same-secondstatisticsnull', () => {
    const c = pick('same-second-jing24'), raw = synthetic(c, { cost: 17, cross: true }), r = validate(raw, c);
    assert.equal(raw.outcome, 'refused'); assert.equal(raw.command_accepted, 34);
    assert.equal(r.commands_accepted, 2); assert.equal(r.commands_refused, 0); assert.equal(r.jing_writeoff, 24);
    assert.equal(r.same_second_status, 'not_met'); assert.equal(r.condition_matched, false);
    assert.deepEqual(r.same_second, { trials: null, refused: null });
    assert.equal(raw.after[0].temp.time.research, epoch + 1);
    raw.research_steps[1].wall_time_before = epoch; // Actual source t may be either second inside this bracket.
    assert.equal(validate(raw, c).same_second_status, 'not_met');
    const same = synthetic(c); same.research_steps[1].wall_time_after++;
    assert.equal(validate(same, c).same_second_status, 'met');
    deny(r => { r.research_steps[1].wall_time_after = epoch; }, c, { cross: true });
    deny(r => { r.research_steps[1].accepted = 0; r.command_accepted = 1; }, c, { cross: true });
});

test('actual command costs are safe integers, not fixed1 or bool/cost counted as repetitions', () => {
    const c = pick('level200');
    for (const cost of [1, 32, 601, Number.MAX_SAFE_INTEGER]) {
        const r = validate(synthetic(c, { cost }), c);
        assert.equal(r.command_cost, cost); assert.equal(r.commands, 1); assert.equal(r.commands_accepted, 1);
    }
    for (const cost of [0, -1, 1.5, null, '1', false, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
        deny(r => { r.research_steps[0].accepted = cost; r.command_accepted = cost; });
    deny(r => { r.command_accepted = 2; });
});

test('mandatoryraw/step maps, identity/clock/source fields cannot be fabricated from parameters', () => {
    for (const key of Object.keys(synthetic(pick('level200')))) deny(r => { delete r[key]; });
    for (const key of Object.keys(synthetic(pick('level200')).research_steps[0]))
        deny(r => { delete r.research_steps[0][key]; });
    for (const edit of [r => { r.research_steps[0].entry_actor = r.before[1].object; },
        r => { r.research_steps[0].return_actor = '/tests/actor#999'; },
        r => { r.research_steps[0].wall_time_before = null; },
        r => { r.research_steps[0].wall_time_after = epoch - 1; },
        r => { r.research_steps[0].metrics_before[0] = null; },
        r => { r.before[0].skills = null; }, r => { delete r.before[0].cultivation['env/auto_regenerate']; },
        r => { r.research_room.research_improve = undefined; },
        r => { r.research_steps[0].random_draws = [0]; }, r => { r.random_input = 0; },
        r => { r.before[0].temp.time = { research: epoch }; }]) deny(edit);
});

test('resource/skill/lp/target and progress tampering cannot borrow source forecasts as observations', () => {
    for (const phase of ['immediate', 'after']) for (const side of [0, 1]) for (const key of
        ['qi', 'eff_qi', 'neili', 'max_neili', 'jing', 'eff_jing', 'potential', 'learned_points'])
        deny(r => { r[phase][side][key]++; });
    for (const edit of [r => { r.research_steps[0].after[0].skills[skill]++; },
        r => { r.research_steps[0].after[0].learned[skill] = 8; },
        r => { r.research_steps[0].after[0].cultivation.reborn = 1; },
        r => { r.research_steps[0].after[1].neili--; },
        r => { r.research_steps[0].after[0].temp.time.research++; },
        r => { r.research_steps[0].after[0].temp.extra_probe = 1; }]) deny(edit);
});

test('sparse known0 counters require maps and nonnegative integer values; cumulativetwo-step closure', () => {
    const c = pick('level200'), raw = synthetic(c);
    for (const maps of [raw.metrics, raw.research_steps[0].metrics_before, raw.research_steps[0].metrics_after])
        for (const m of maps) m.qi_cost = 0;
    assert.equal(validate(raw, c).jing_cost, 25);
    for (const value of [null, 0, [], undefined]) deny(r => { r.metrics[0] = value; });
    for (const value of [null, '0', false, 0.5, -1, undefined])
        deny(r => { r.research_steps[0].metrics_after[0].jing_cost = value; });
    deny(r => { r.research_steps[0].metrics_after[1].jing_cost = 1; });
    deny(r => { r.research_steps[1].metrics_before[0] = {}; }, pick('same-second-jing24'));
});

test('original messages/notify channel required; no missed write, forged targetmessage or arbitraryCSI', () => {
    for (const c of [pick('level200'), pick('jing24'), pick('eff-jing24'), pick('exp-minus1')])
        deny(r => { r.research_steps[0].messages = []; }, c);
    deny(r => { r.research_steps[0].messages[1].type = 'write'; });
    deny(r => { r.skill_messages.pop(); });
    deny(r => { r.research_steps[0].after[0].temp.notify_fail = ''; });
    deny(r => { r.research_steps[0].reason = '\x1b[2J' + r.research_steps[0].reason; }, pick('times0'));
    deny(r => { r.reason = 'generic refusal fabricated'; }, pick('jing24'));
});

test('error/NA are unknown after strictidentity/index/elapsed/reason and fixed139source pin', () => {
    const c = pick('level200');
    for (const outcome of ['error', 'not_applicable']) {
        const raw = { kind: 'sample', condition_id: c.id, method: 'research', index: 0,
            elapsed: 0.1, outcome, reason: 'actual diagnostic' };
        assert.equal(validate(raw, c), null);
        for (const edit of [r => { r.index = null; }, r => { r.index = c.samples; },
            r => { r.elapsed = null; }, r => { r.elapsed = -1; }, r => { r.reason = ' '; },
            r => { r.method = 'interface'; }, r => { r.condition_id += '-wrong'; }]) {
            const b = copy(raw); edit(b); assert.throws(() => validate(b, c));
        }
    }
    for (const edit of [c => { c.parameters.source_evidence['cmds/skill/research.c'] = '0'.repeat(64); },
        c => { c.parameters.actor.properties.int = 41; }, c => { c.parameters.research_prediction.rng_bound++; },
        c => { c.status = 'complete'; }]) {
        const bad = copy(c); edit(bad); assert.throws(() => validate(synthetic(c), bad));
    }
});
