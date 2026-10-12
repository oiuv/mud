// Original needle seed, poison heartbeat and scheduled cold-debuff recovery; no game changes.
import assert from 'node:assert/strict';
import { gumuNeedles, gumuThrowingConditions, validateGumuThrowingRecord } from './school_gumu_throwing_cases.mjs';
import { validateGumuPoisonTick } from './school_gumu_poison_cases.mjs';
import { distribution } from './statistics.mjs';

const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
export const gumuNeedleLifecycleFixtureRequirements = [
    'Execute one original hand/perform seed and retain its full immediate record, needle hit, poison identity and original zero-amount cleanup evidence.',
    'Explicitly stop both combat relationships after the seed. Keep the caster heartbeat off; enable only the victim original USER heartbeat for poison ticks.',
    'For bingpo recovery keep both heartbeats off to isolate its original call_out. Observe the original scheduled delay and before/after back() states in the temporary source copy.',
    'Never directly invoke back() or condition update, reschedule callbacks, replace RNG, or preset a successful poison/bingpo result.',
    'Keep immediate/cumulative resource metrics, poison before/after/heartbeat-settled states and actual elapsed times; absence of poison skips ticks rather than inventing a cure.',
];

export function gumuNeedleLifecycleConditions(catalog, { smoke = false } = {}) {
    const base = gumuThrowingConditions(catalog), rows = [];
    function add(d, mode, suffix, extra = {}) {
        const level = extra.level ?? 200;
        const template = base.find(c => c.id === `school-gumu-throwing-${d.skill}-l${level === 120 ? 200 : level}-j0`);
        assert.ok(template);
        const p = structuredClone(template.parameters);
        if (level === 120) for (const k of Object.keys(p.actor.skills)) p.actor.skills[k] = level;
        p.level = level;
        Object.assign(p.target.skills, { dodge: 2, parry: mode === 'bingpo_restore' ? 2 : 100000,
            force: mode === 'bingpo_restore' ? 600 : 300 }, extra.targetSkills);
        Object.assign(p.target.properties, extra.targetProperties);
        p.target.temp = { ...extra.targetTemp };
        if (extra.amount) p.actor.equipment.amount = extra.amount;
        const maxDelay = 1 + Math.trunc(level / 15);
        Object.assign(p, { collection_group: 'gumu-needle-lifecycle', lifecycle: mode,
            seed_mode: 'original_perform', seed_side: 0, seed_action: p.action, stop_combat_after_seed: true,
            condition_name: d.poison.type, ticks: mode === 'poison_ticks' ? extra.ticks ?? 1 : 0,
            observation: mode === 'poison_ticks' ? 'original_condition_heartbeat' : 'original_bingpo_callback',
            observe_seconds: mode === 'poison_ticks' ? 45 : maxDelay + 4,
            ...(mode === 'bingpo_restore' ? { restore_delay: [2, maxDelay] } : {}),
            sampling: 'original_lifecycle_checks',
            qualification_note: '原针具和原命令产生初始命中／施毒／寒冰减益，不预置成功。原施展记录单独校验。'
                + '种毒后显式停止双方战斗，施招者不走心跳；毒发由受招者原USER心跳处理，寒冰恢复仅沿原call_out。'
                + '这是隔离后续机制，不是完整战斗或自然脱战。辟易／制毒者等阻施毒时不伪造毒发。'
                + '气血、创伤、毒发、自然恢复和临时属性分列，每条件两次机制检查，不用该样本量估计概率分布。',
        });
        p.qualification_sources = [...new Set([...p.qualification_sources, 'inherit/char/char.c', 'include/condition.h'])];
        rows.push({ ...template, id: `school-gumu-needle-lifecycle-${d.skill}-${suffix}`,
            method: mode === 'poison_ticks' ? 'condition' : 'perform', samples: smoke ? 1 : 2, parameters: p });
    }
    const bing = gumuNeedles.find(d => d.ability === 'bing');
    for (const level of [120, 200, 400, 800]) add(bing, 'bingpo_restore', 'restore-l' + level, { level });
    add(bing, 'bingpo_restore', 'restore-existing', { targetTemp: { 'apply/attack': 17, 'apply/dodge': 23, 'apply/parry': 11 } });
    add(bing, 'bingpo_restore', 'restore-last-needle', { amount: 1 });
    for (const d of gumuNeedles) {
        for (const level of [200, 400, 800]) add(d, 'poison_ticks', 'poison-l' + level, { level });
        add(d, 'poison_ticks', 'poison-persist', { targetSkills: { force: 2 }, ticks: 2 });
        add(d, 'poison_ticks', 'poison-piyi', { targetProperties: { 'special_skill/piyi': 1 }, ticks: 0 });
        add(d, 'poison_ticks', 'poison-immune', { targetProperties: { 'immune/poison': -1 } });
        add(d, 'poison_ticks', 'poison-nopoison', { targetTemp: { nopoison: 1 } });
        add(d, 'poison_ticks', 'poison-partial-immune', { targetProperties: { 'immune/poison': 20 } });
        add(d, 'poison_ticks', 'poison-maker', { targetProperties: { id: d.poison.id }, ticks: 0 });
        add(d, 'poison_ticks', 'poison-high-force', { targetSkills: { force: 4 * d.poison.level + 4 }, ticks: 0 });
        add(d, 'poison_ticks', 'poison-high-skill', { targetSkills: { poison: d.poison.level + 1 }, ticks: 0 });
    }
    return rows;
}

// Same original immediate contract, not a second execution path.
export function gumuNeedleSeedCondition(c) {
    return { ...c, method: 'perform', parameters: { ...c.parameters, collection_group: 'gumu-throwing',
        observation: 'single_action_immediate', observe_seconds: 0 } };
}
function counter(metrics, key) {
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics));
    const n = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(n) && n >= 0, key); return n;
}
function sameResources(a, b) { for (const k of health) assert.equal(a[k], b[k], k); }
function emptyConditions(value) {
    assert.ok(value === null || (value && typeof value === 'object' && !Array.isArray(value)), '缺少异常状态');
    if (value !== null) assert.deepEqual(value, {});
}
function sameApply(a, b) {
    // LPC add_temp() can leave zero-valued keys after the original subtraction is undone.
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) assert.equal(a[key] ?? 0, b[key] ?? 0, key);
}
function sameSkillsAfterHeartbeat(before, after) {
    // Original USER.user_dump(DUMP_IDLE) can learn idle-force on an old test connection.
    // This is not a needle effect. Do not allow unrelated skill or progress changes.
    const learned = before.learned ?? {}, endLearned = after.learned ?? {};
    if (JSON.stringify(before.skills) === JSON.stringify(after.skills)
        && JSON.stringify(learned) === JSON.stringify(endLearned)) return;
    assert.equal(before.temp.start_idle, 1); assert.equal(after.temp.start_idle, 1);
    const level = before.skills['idle-force'] ?? 0, progress = learned['idle-force'] ?? 0;
    assert.ok(Number.isSafeInteger(level) && level >= 0 && level < 500);
    assert.ok(Number.isSafeInteger(progress) && progress >= 0);
    const improved = progress + 1 + Math.trunc(10 * 100 / (level + 100));
    const upgraded = improved > (level + 1) ** 2;
    assert.deepEqual(after.skills, { ...before.skills, 'idle-force': level + Number(upgraded) });
    assert.deepEqual(endLearned, { ...learned, 'idle-force': upgraded ? 0 : improved });
}

export function validateGumuNeedleLifecycleRecord(raw, c) {
    const p = c.parameters;
    assert.equal(p.collection_group, 'gumu-needle-lifecycle');
    assert.equal(raw.method, c.method); assert.equal(raw.outcome, 'observed');
    validateGumuThrowingRecord(raw.seed, gumuNeedleSeedCondition(c));
    for (const k of ['before', 'immediate', 'after', 'immediate_metrics', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['callbacks', 'incidental_callbacks', 'condition_events', 'condition_heartbeats', 'attacks', 'terminals']) assert.ok(Array.isArray(raw[k]), k);
    // Original announcement expiry is not cold recovery. Retain it and verify no gameplay effect.
    assert.equal(raw.incidental_callbacks.length % 2, 0);
    for (let i = 0; i < raw.incidental_callbacks.length; i += 2) {
        const [pre, post] = raw.incidental_callbacks.slice(i, i + 2);
        assert.equal(pre.phase, 'before'); assert.equal(post.phase, 'after');
        assert.ok([0, 1].includes(pre.side)); assert.equal(pre.side, post.side);
        assert.ok(Number.isFinite(pre.elapsed) && pre.elapsed >= 0);
        assert.ok(Number.isFinite(post.elapsed) && post.elapsed >= pre.elapsed && post.elapsed <= raw.elapsed);
        sameResources(pre.state, post.state); assert.deepEqual(pre.state.conditions, post.state.conditions);
        assert.deepEqual(pre.state.temp.apply, post.state.temp.apply);
        assert.equal(pre.state.temp.bingpo, post.state.temp.bingpo);
    }
    assert.deepEqual(raw.before, raw.seed.before); assert.deepEqual(raw.immediate, raw.seed.immediate);
    assert.deepEqual(raw.immediate_metrics, raw.seed.metrics); assert.deepEqual(raw.combat_stopped_after_seed, [1, 1]);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.terminals.length, 0);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0 && raw.elapsed < p.observe_seconds);
    for (const side of [0, 1]) {
        const b = raw.before[side], end = raw.after[side], m = raw.metrics[side], start = raw.immediate_metrics[side];
        const lastHeartbeat = side === 1 && p.lifecycle === 'poison_ticks' && p.ticks
            ? raw.condition_heartbeats.at(-1)?.state : b;
        assert.equal(end.weapon, 'none'); assert.deepEqual(end.skills, lastHeartbeat.skills);
        assert.deepEqual(end.mappings, b.mappings);
        assert.deepEqual(end.preparations, b.preparations); assert.equal(end.max_neili, b.max_neili);
        for (const k of health) {
            const cost = counter(m, k + '_cost'), recovered = counter(m, k + '_recovery');
            assert.equal(b[k] - end[k], cost - recovered, 'total ' + k);
            assert.ok(cost >= counter(start, k + '_cost')); assert.ok(recovered >= counter(start, k + '_recovery'));
            if (!side || p.lifecycle === 'bingpo_restore') {
                assert.equal(cost, counter(start, k + '_cost')); assert.equal(recovered, 0);
            }
        }
        assert.equal(counter(m, 'direct'), 0);
    }
    assert.equal(counter(raw.metrics[0], 'heartbeats'), 0);
    sameResources(raw.after[0], raw.immediate[0]);
    assert.deepEqual(raw.after[0].temp.apply, raw.before[0].temp.apply);
    assert.equal(raw.after[0].busy, raw.immediate[0].busy);
    const endHeld = raw.after[0].handing_details;
    if (raw.seed.ammo_cleanup.object_exists) assert.deepEqual(endHeld, raw.immediate[0].handing_details);
    else assert.deepEqual(endHeld, {});
    const b = raw.before[1], a = raw.immediate[1], end = raw.after[1];
    if (p.lifecycle === 'bingpo_restore') {
        assert.equal(counter(raw.metrics[1], 'heartbeats'), 0);
        assert.equal(raw.condition_events.length, 0); assert.equal(raw.condition_heartbeats.length, 0);
        emptyConditions(a.conditions); emptyConditions(end.conditions);
        assert.equal(a.temp.bingpo, 1); assert.equal(end.temp.bingpo ?? 0, 0);
        const schedule = raw.restore_schedule;
        assert.equal(schedule?.program, '/kungfu/skill/bingpo-shenzhen/bing');
        assert.equal(schedule.function, 'back'); assert.equal(schedule.side, 1);
        assert.ok(Number.isSafeInteger(schedule.delay) && schedule.delay >= p.restore_delay[0] && schedule.delay <= p.restore_delay[1]);
        assert.ok(Number.isFinite(schedule.elapsed) && schedule.elapsed >= 0);
        assert.deepEqual(raw.callbacks.map(e => e.phase), ['before', 'after']);
        const [pre, post] = raw.callbacks;
        for (const e of raw.callbacks) {
            assert.equal(e.side, 1); assert.equal(e.program, schedule.program); assert.equal(e.function, 'back');
            assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= schedule.elapsed && e.elapsed <= raw.elapsed);
            sameResources(e.state, a);
        }
        assert.ok(pre.elapsed - schedule.elapsed >= schedule.delay - 1, '不缩短原call_out时钟');
        assert.ok(post.elapsed >= pre.elapsed); assert.equal(pre.state.temp.bingpo, 1);
        assert.deepEqual(pre.state.temp.apply, a.temp.apply);
        assert.equal(post.state.temp.bingpo ?? 0, 0);
        sameApply(post.state.temp.apply, b.temp.apply);
        sameApply(end.temp.apply, b.temp.apply); sameResources(end, a);
        assert.equal(end.busy, a.busy);
        return;
    }
    assert.equal(p.lifecycle, 'poison_ticks'); assert.equal(raw.callbacks.length, 0);
    assert.ok(!raw.restore_schedule); assert.equal(a.temp.bingpo ?? 0, 0); assert.equal(end.temp.bingpo ?? 0, 0);
    assert.deepEqual(end.temp.apply, b.temp.apply);
    assert.equal(raw.condition_events.length, p.ticks * 2); assert.equal(raw.condition_heartbeats.length, p.ticks);
    assert.ok(counter(raw.metrics[1], 'heartbeats') >= p.ticks);
    if (!p.ticks) {
        emptyConditions(a.conditions); emptyConditions(end.conditions);
        assert.equal(counter(raw.metrics[1], 'heartbeats'), 0); sameResources(end, a);
        for (const key of health) {
            assert.equal(counter(raw.metrics[1], key + '_cost'), counter(raw.immediate_metrics[1], key + '_cost'));
            assert.equal(counter(raw.metrics[1], key + '_recovery'), 0);
        }
        return;
    }
    for (let i = 0; i < p.ticks; i++) {
        const [pre, post] = raw.condition_events.slice(i * 2, i * 2 + 2), settled = raw.condition_heartbeats[i];
        assert.equal(pre.phase, 'before'); assert.equal(post.phase, 'after');
        for (const e of [pre, post]) {
            assert.equal(e.side, 1); assert.equal(e.name, p.condition_name); assert.equal(e.daemon, '/kungfu/condition/' + p.condition_name);
            assert.ok(Number.isFinite(e.elapsed) && e.elapsed >= 0 && e.elapsed <= raw.elapsed);
        }
        const previous = i ? raw.condition_heartbeats[i - 1].state : a;
        sameResources(pre.state, previous); assert.deepEqual(pre.state.conditions, previous.conditions);
        assert.deepEqual(pre.state.skills, previous.skills);
        assert.deepEqual(post.state.skills, pre.state.skills);
        assert.deepEqual(post.state.learned, pre.state.learned);
        sameSkillsAfterHeartbeat(post.state, settled.state);
        validateGumuPoisonTick(pre, post, settled, p.condition_name);
        assert.equal(settled.side, 1); assert.ok(Number.isFinite(settled.elapsed));
        assert.ok(settled.elapsed >= post.elapsed && post.elapsed >= pre.elapsed && settled.elapsed <= raw.elapsed);
        if (i) assert.ok(pre.elapsed > raw.condition_heartbeats[i - 1].elapsed);
    }
    const last = raw.condition_heartbeats.at(-1).state;
    sameResources(end, last); assert.deepEqual(end.conditions, last.conditions); assert.ok(raw.elapsed > 0);
    for (const key of health) {
        let cost = counter(raw.immediate_metrics[1], key + '_cost'), recovered = 0;
        for (let i = 0; i < p.ticks; i++) {
            const [pre, post] = raw.condition_events.slice(i * 2, i * 2 + 2);
            cost += pre.state[key] - post.state[key];
            recovered += raw.condition_heartbeats[i].state[key] - post.state[key];
        }
        assert.equal(counter(raw.metrics[1], key + '_cost'), cost, 'tick total ' + key);
        assert.equal(counter(raw.metrics[1], key + '_recovery'), recovered, 'recovery total ' + key);
    }
}

export function gumuNeedleLifecycleEffects(records, condition) {
    const rows = records.filter(r => r.outcome === 'observed' && r.raw)
        .map(r => condition ? { ...r.raw, parameters: condition.parameters } : r.raw);
    const groups = Object.fromEntries(['bingpo_restore', 'poison_ticks'].map(mode => {
        const group = rows.filter(r => r.parameters?.lifecycle === mode);
        const ticks = group.flatMap(r => (r.condition_heartbeats ?? []).map((settled, i) => ({
            pre: r.condition_events?.[i * 2]?.state, post: r.condition_events?.[i * 2 + 1]?.state, settled: settled.state })));
        return [mode, { samples: group.length, ticks: ticks.length,
            unknown_tick_records: group.filter(r => !Array.isArray(r.condition_heartbeats)).length,
            callback_seconds: distribution(group.map(r => r.callbacks?.find(e => e.phase === 'before')?.elapsed)),
            tick_loss: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.pre?.[k] - t.post?.[k]))])),
            recovery_after_tick: Object.fromEntries(health.map(k => [k, distribution(ticks.map(t => t.settled?.[k] - t.post?.[k]))])),
        }];
    }));
    return { samples: rows.length, unobserved: records.length - rows.length,
        unclassified: rows.filter(r => !Object.hasOwn(groups, r.parameters?.lifecycle)).length, groups,
        limitations: ['每条件两次原生命周期检查，不估计概率分布；毒发和施招损伤、自然恢复分开。'] };
}
