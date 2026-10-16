// Synthetic consumer preparation only; never counted as native game samples.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoForceRemainingConditions } from './school_mingjiao_force_remaining_cases.mjs';
import { validateMingjiaoForceRemainingRecord as check } from './school_mingjiao_force_remaining_record.mjs';
import { healingStepExpected } from './school_wudang_healing_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => fs.readFileSync(new URL(path, new URL('../../../', import.meta.url)));
const catalog = collectCatalog(root, buildInventory(root));
const formal = mingjiaoForceRemainingConditions(catalog, read), smoke = mingjiaoForceRemainingConditions(catalog, read, { smoke: true });
const copy = v => structuredClone(v);
function state(config, side, fighting = false) {
    const s = { ...copy(config.properties), object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0, not_living: null,
        busy: config.busy ?? null, fighting_opponent: Number(fighting), killing_opponent: Number(fighting),
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([k]) => k.includes('/') || ['class', 'character', 'reborn', 'breakup', 'doing'].includes(k))),
        conditions: config.conditions ? copy(config.conditions) : null,
        learned: {}, learned_kind: 'undefined', learned_raw: null,
        temp: { user_setup: 1, apply: { armor: 100 } },
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {}, secondary_weapon: 'none', secondary_weapon_details: {} };
    for (const [k, v] of Object.entries(config.temp ?? {})) s.temp.apply[k.slice(6)] = v;
    if (config.equipment) {
        s.weapon = 'sword'; s.weapon_details = { object: '/tests/sword#300', program: '/tests/sword',
            skill_type: 'sword', flag: 4, damage: 50, weight: 3000, consistence: 100 };
        // Match original setup/wield, including the actual equipped object reference.
        Object.assign(s.temp.apply, { damage: 50, dodge: -1 });
        s.temp.weapon = s.weapon_details.object;
    }
    s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
    return s;
}
function raw(c) {
    const p = c.parameters, b = [state(p.actor, 0, p.fighting), state(p.target, 1, p.fighting)];
    return { kind: 'sample', condition_id: c.id, method: c.method, index: 0, outcome: p.expected, reason: '', elapsed: 0.01,
        before: b, immediate: copy(b), after: copy(b), metrics: [{}, {}], immediate_metrics: [{}, {}],
        command_accepted: 453, command_context: { action: p.action, actor: b[0].object, force_me_source: '/feature/command' },
        actions: [], attacks: [], directs: [], passives: [], defenses: [], dodge_checks: [], interfaces: [],
        launches: [], refusals: [], callbacks: [], terminals: [] };
}
function capacity(c) {
    const p = c.parameters, r = raw(c), result = p.ability === 'can_learn' ? 0 : p.source_derived_capacity;
    r.interfaces = [{ ...copy(p.interface), result, implemented_by: p.ability === 'can_learn' ? '/cmds/skill/learn' : '/clone/user/user' }];
    if (p.expected === 'refused') r.reason = '原资格拒绝（合成）';
    return r;
}
function recovery(c) {
    const p = c.parameters, r = raw(c), key = p.ability === 'recover' ? 'qi' : 'jing', a = r.after[0];
    a[key] += 100; a.neili -= 20; a.learned = { force: 1 }; a.learned_raw = copy(a.learned); a.learned_kind = 'mapping';
    r.immediate = copy(r.after); r.metrics = [{ neili_cost: 20, [key + '_recovery']: 100, ability_launched: 1 }, {}];
    r.immediate_metrics = copy(r.metrics); r.launches = [{ actor: a.object, skill: 'force', argument: p.ability }];
    return r;
}
function progress(s, key, n = 1) {
    if (!n) return; s.learned[key] = (s.learned[key] ?? 0) + n;
    s.learned_raw = copy(s.learned); s.learned_kind = 'mapping';
}
function updateEffective(s) {
    s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (s.skills[s.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
}
// These are hand-selected values inside original supports, NOT forced production RNG.
function research(c) {
    const p = c.parameters, r = raw(c), b = r.before[0], a = r.after[0], n = p.completed;
    const accepted = !['level179', 'potential0', 'effjing26'].includes(p.variant);
    const fee = n * Math.trunc(1000 / b.int), writeoff = ['jing26', 'jing54-times3'].includes(p.variant) ? b.jing - fee : 0;
    a.jing -= fee + writeoff; a.learned_points += n; progress(a, p.skill, n);
    a.temp.notify_fail = p.variant === 'level179' ? '你对圣火心法的掌握程度还未到研究的程度。\n'
        : p.variant === 'potential0' ? '你的潜能不够研究这么多次了。\n'
            : p.variant === 'effjing26' ? '你觉得你精力不济，实在没有办法进行研究。\n' : '依你目前的能力，没有办法研究这种技能。\n';
    if (!['level179', 'potential0', 'effjing26', 'experience-minus1'].includes(p.variant)) a.temp.time = { research: 1001 };
    r.reason = n ? '' : a.temp.notify_fail; r.command_accepted = accepted ? 453 : 0;
    r.metrics = [fee + writeoff ? { jing_cost: fee + writeoff } : {}, {}]; r.immediate_metrics = copy(r.metrics);
    r.immediate = copy(r.after); r.research_steps = [{ action: p.action, entry_actor: b.object, return_actor: b.object,
        before: copy(r.before), after: copy(r.after), metrics_before: [{}, {}], metrics_after: copy(r.metrics),
        accepted: r.command_accepted, reason: r.reason, wall_time_before: 1000, wall_time_after: 1001, messages: [] }];
    return r;
}
function dispel(c) {
    const p = c.parameters, r = raw(c), b = r.before[0], a = r.after[0], side = Number(p.other), victim = r.after[side];
    const old = copy(victim.conditions[p.condition_name]), initial = p.other ? 250 : 100;
    let fee = initial, change = 'retained';
    if (p.condition_name === 'freezing') {
        const need = old.level + 10 + (p.other ? Math.trunc((old.level + 10) / 5) : 0), power = b.effective_skills.force;
        if (need <= power) {
            const avail = b.neili - initial, div = p.other ? 4 : 2;
            const removed = Math.min(old.remain, Math.trunc(Math.trunc(avail * power / (old.level + 1)) / div));
            fee += removed === old.remain ? Math.trunc(old.remain * div * (old.level + 1) / power) : avail;
            if (removed === old.remain) { victim.conditions = {}; change = 'cleared'; }
            else { victim.conditions[p.condition_name].remain -= removed; change = 'reduced'; }
        }
    }
    a.neili -= fee; progress(a, 'force');
    a.busy = p.condition_name === 'bandaged' ? p.other ? 2 : 1 : change === 'retained' ? p.other ? 6 : 3 : p.other ? 2 : 1;
    if (p.other) victim.busy = p.condition_name === 'freezing' && change === 'retained' ? 4 : 1;
    r.launches = [{ actor: a.object, skill: 'force', argument: p.action.slice(6) }];
    r.metrics = [{ neili_cost: fee, ability_launched: 1 }, {}]; r.immediate = copy(r.after); r.immediate_metrics = copy(r.metrics);
    return r;
}
function repeat(c) {
    const p = c.parameters, r = raw(c), s = copy(r.before[0]), t = copy(r.before[1]);
    const m = {}, add = (k, n) => { if (n) m[k] = (m[k] ?? 0) + n; };
    r.buff_steps = [];
    for (const [i, operation] of p.buff_steps.entries()) {
        const before = copy(s), step = { operation: copy(operation), before };
        if (operation.refill_neili !== undefined) { add('neili_recovery', operation.refill_neili - s.neili); s.neili = operation.refill_neili; }
        else {
            step.accepted = i === 0 ? 1 : 0; step.launches_before = i ? 1 : 0; step.launches_after = 1;
            step.command_cost = i === 0 ? 453 : 0;
            step.refusals_before = i === 3 ? 1 : 0; step.refusals_after = i === 0 ? 0 : i === 1 ? 1 : 2;
            step.reason = i === 0 ? '' : p.ability === 'power' && s.neili < 100 ? '你的内力不够！\n' : '你已经在运功中了。\n';
            if (i === 0) {
                add('neili_cost', s.neili); s.neili = 0; s.temp[p.ability] = 1;
                if (p.ability === 'power') s.temp.apply.force = Math.trunc(s.skills['martial-cognize'] / 5);
                else {
                    const low = s.skills.force + Math.trunc(Math.pow(-s.shen, 1 / 3)), count = Math.trunc(low / 4);
                    for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing']) { s[k] -= low; add(k + '_cost', low); }
                    for (const k of ['str', 'int', 'con', 'dex']) s.temp.apply[k] = s[k];
                    s.temp.apply.attack = count; s.temp.apply.damage = s.temp.apply.unarmed_damage = s.str * 3;
                    for (const k of Object.keys(s.mappings)) s.temp.apply[k] = Math.trunc(count / 2);
                }
                progress(s, 'force'); updateEffective(s); add('ability_launched', 1);
            } else s.temp.notify_fail = step.reason;
        }
        step.after = copy(s); r.buff_steps.push(step);
    }
    r.launches = [{ actor: s.object, skill: 'force', argument: p.ability }];
    r.refusals = r.buff_steps.filter(x => x.reason).map(x => ({ actor: s.object, reason: x.reason }));
    r.after = [copy(s), t]; r.immediate = copy(r.after); r.metrics = [m, {}]; r.immediate_metrics = copy(r.metrics);
    return r;
}
function inherited(c, reflection = false) {
    const p = c.parameters, r = raw(c); delete r.command_accepted; delete r.command_context;
    r.ordinary_step = { actor: 0, target: 1, type: 0, caller_side: -1, result: null };
    r.attacks = [{ actor: 0, target: 1, type: 0, result: -2, damage: 0 }]; r.actions = [{ actor: 0, target: 1, action: {} }];
    r.metrics = [{ parry: 1 }, {}]; r.immediate_metrics = copy(r.metrics);
    if (reflection) {
        const b = copy(r.before), a = copy(b), factor = 50;
        const damage = Math.trunc(b[0].neili / 20) + factor - Math.trunc(b[1].neili / 24);
        a[0].neili -= factor; a[0].qi += damage * 4; a[0].eff_qi += damage * 4;
        const result = { damage: damage * 2, msg: '原父内功反震（合成）' };
        r.passives = [{ actor: 0, target: 1, skill: p.skill, route: 'force', factor, incoming: 20, before: b, after: a, result }];
        r.after = copy(a); r.immediate = copy(a); r.metrics = [{ neili_cost: factor, qi_cost: -damage * 4, eff_qi_cost: -damage * 4, hit: 1 }, {}];
        r.immediate_metrics = copy(r.metrics); r.attacks[0].result = 0;
    }
    return r;
}
// All timer/HB instants below are synthetic examples of admissible ORIGINAL
// scheduling. No real clock or driver is changed, and no sample is emitted.
function lifecycle(c) {
    const p = c.parameters, r = raw(c), current = copy(r.before[0]), m = {};
    let elapsed = 0, stepCount = 0;
    const set = (k, v) => { const d = v - current[k]; if (d) m[k + (d < 0 ? '_cost' : '_recovery')] = (m[k + (d < 0 ? '_cost' : '_recovery')] ?? 0) + Math.abs(d); current[k] = v; };
    const add = (k, n) => set(k, current[k] + n);
    const event = (kind, at, fn) => {
        const before = copy(current), metrics_before = copy(m), oldCount = stepCount;
        elapsed = at; if (kind === 'heartbeat') m.heartbeats = (m.heartbeats ?? 0) + 1;
        fn();
        const source = kind === 'heartbeat' ? { path: 'inherit/char/char.c', function: 'heart_beat' }
            : p.source_entries.find(e => e.function === 'remove_effect');
        r.force_events.push({ kind, before, after: copy(current), metrics_before, metrics_after: copy(m),
            elapsed_before: at, elapsed: at + 0.002, wall_time_before: 1000 + Math.floor(at), wall_time_after: 1001 + Math.floor(at),
            source: { path: source.path, function: source.function, sha256: p.source_evidence[source.path] },
            step_count_before: oldCount, step_count_after: stepCount });
    };
    const natural = at => {
        // A feasible next_beat = prior t +5, observed at every third2s HB.
        // Default actual fixture has food/water; all natural changes retain their
        // real setter counters and are not assigned to the skill callback.
        if (at % 6) return;
        set('jing', Math.min(current.eff_jing, current.jing + current.con + Math.trunc(current.max_jingli / 10)));
        if (current.jing >= current.eff_jing && current.eff_jing < current.max_jing) add('eff_jing', 1);
        if (!current.busy) set('qi', Math.min(current.eff_qi, current.qi + current.con * 2 + Math.trunc(current.max_neili / 20)));
        if (current.qi >= current.eff_qi && current.eff_qi < current.max_qi) add('eff_qi', 1);
        if (current.neili < current.max_neili) set('neili', Math.min(current.max_neili, current.neili + current.con * 2 + Math.trunc(current.effective_skills.force / 3)));
    };
    r.force_events = []; r.command_clock = { wall_time_before: 1000, wall_time_after: 1001 };
    if (p.expected === 'refused') {
        r.command_accepted = 0; r.reason = '原入口资格拒绝（合成）';
        if (p.panel === 'healing') r.healing_steps = []; else r.exercise_steps = [];
        return r;
    }
    if (p.panel === 'expiry') {
        const shield = p.ability === 'shield', flag = shield ? 'shield' : 'powerup';
        const amount = Math.trunc((p.skill === 'shenghuo-xinfa' ? current.effective_skills.force : current.skills[p.skill]) / (shield ? 2 : p.skill === 'shenghuo-xinfa' ? 6 : 3));
        add('neili', shield ? -100 : -150); current.temp[flag] = 1;
        const keys = shield ? ['armor'] : ['attack', 'dodge', 'parry']; for (const k of keys) current.temp.apply[k] = (current.temp.apply[k] ?? 0) + amount;
        progress(current, p.skill); updateEffective(current); m.ability_launched = 1;
        r.launches = [{ actor: current.object, skill: p.skill, argument: p.ability }];
        r.immediate = [copy(current), copy(r.before[1])]; r.immediate_metrics = [copy(m), {}];
        for (let at = 2; at < p.original_delay_seconds; at += 2) event('heartbeat', at, () => natural(at));
        event('expiry', p.original_delay_seconds + 0.1, () => {
            r.callbacks.push({ side: 0, phase: 'before', elapsed: p.original_delay_seconds + 0.1, state: copy(current) });
            for (const k of keys) current.temp.apply[k] -= amount; delete current.temp[flag]; updateEffective(current);
            r.callbacks.push({ side: 0, phase: 'after', elapsed: p.original_delay_seconds + 0.101, state: copy(current) });
        });
    } else {
        const healing = p.panel === 'healing', flag = healing ? p.ability === 'heal' ? 'healing' : 'inspiring' : 'exercise';
        current.busy = '<function>'; current.temp.pending = { [flag]: 1 };
        if (!healing) current.temp.exercise_cost = p.exercise_cost;
        else { progress(current, 'force'); m.ability_launched = 1; r.launches = [{ actor: current.object, skill: 'force', argument: p.ability }]; }
        r.immediate = [copy(current), copy(r.before[1])]; r.immediate_metrics = [copy(m), {}];
        const steps = healing ? (r.healing_steps = []) : (r.exercise_steps = []);
        for (let at = 2; at < 88; at += 2) {
            event('heartbeat', at, () => {
                const limit = Math.trunc(current.skills.force / 2) * 10 + current.skills[p.skill] * 10
                    + (p.skill === 'shenghuo-shengong' ? Math.trunc(Math.trunc(current.skills[p.skill] ** 2 * 15 * 16 / 100) / 200) : 0);
                steps.push({ phase: 'before', elapsed: at, state: copy(current), ...(healing ? {} : { limit }) });
                if (healing) {
                    const expected = healingStepExpected(p.ability, current); add('eff_' + expected.key, expected.gain); add('neili', -expected.cost);
                    if (expected.stop) {
                        current.busy = 0;
                        if (p.ability === 'heal' || expected.stop === 'unmapped') current.temp.pending[flag] = 0;
                        else current.temp.pending[expected.stop === 'completed' ? 'exercise' : 'healing'] = 0;
                    }
                } else {
                    const gain = Math.min(current.temp.exercise_cost, current.qi, 1 + Math.trunc(Math.trunc(current.effective_skills.force / 5) / 2) + (p.room.exercise_improve ?? 0));
                    current.temp.exercise_cost -= gain; add('neili', gain); add('qi', -gain);
                    if (!current.temp.exercise_cost) {
                        current.temp.pending.exercise = 0; current.busy = 0;
                        if (current.neili >= current.max_neili * 2) { if (current.max_neili < limit) current.max_neili++; set('neili', current.max_neili); }
                    }
                }
                steps.push({ phase: 'after', elapsed: at + 0.0005, state: copy(current), ...(healing ? {} : { limit }) }); stepCount += 2;
                natural(at);
            });
            if (p.halt_after) {
                const halt = { before: copy(current) };
                if (healing && p.ability === 'heal') add('neili', -Math.min(current.neili, 100));
                if (!healing && current.neili > current.max_neili * 2) set('neili', current.max_neili * 2);
                current.busy = 0; current.temp.pending[flag] = 0; halt.after = copy(current);
                r[healing ? 'healing_halt' : 'exercise_halt'] = halt; r.halt_accepted = 1;
                r[healing ? 'healing_terminal' : 'exercise_terminal'] = 'halted'; break;
            }
            if (!current.busy) { r[healing ? 'healing_terminal' : 'exercise_terminal'] = healing ? 'busy_ended' : 'completed'; break; }
        }
    }
    r.after = [copy(current), copy(r.before[1])]; r.metrics = [copy(m), {}]; r.elapsed = elapsed + 0.01;
    return r;
}
function successful(c) {
    const panel = c.parameters.panel;
    return panel === 'research' ? research(c) : panel === 'capacity' ? capacity(c) : panel === 'recovery' ? recovery(c)
        : panel === 'dispel' ? dispel(c) : panel === 'repeat' ? repeat(c) : panel === 'inherited-hit' ? inherited(c) : lifecycle(c);
}
function adversarial(conditions) {
    const find = fn => { const c = conditions.find(fn); if (!c) throw Error('missing synthetic condition'); return c; };
    const combat = find(c => c.parameters.panel === 'inherited-hit' && c.parameters.variant === 'defender200');
    const missing = inherited(combat); missing.attacks[0].result = 0; missing.attacks[0].damage = 10;
    missing.metrics = [{ hit: 1 }, {}]; missing.immediate_metrics = copy(missing.metrics);
    const negative = inherited(combat, true), e = negative.passives[0]; e.factor = -5;
    e.result = { damage: -160, msg: 'Synthetic altered factor' }; e.after[0].neili = 1005;
    e.after[0].qi = e.after[0].eff_qi = 9680; negative.after = copy(e.after); negative.immediate = copy(e.after);
    negative.metrics = [{ hit: 1, neili_recovery: 5, qi_cost: 320, eff_qi_cost: 320 }, {}]; negative.immediate_metrics = copy(negative.metrics);
    const zeroC = find(c => c.parameters.panel === 'inherited-hit' && c.parameters.variant === 'jiali0'), zeroHook = inherited(zeroC, true);
    const scalar = inherited(combat, true); scalar.passives[0].result = -25;
    scalar.passives[0].after[0].qi = scalar.passives[0].after[0].eff_qi = 10000;
    scalar.after = copy(scalar.passives[0].after); scalar.immediate = copy(scalar.after);
    scalar.metrics = [{ hit: 1, neili_cost: 50 }, {}]; scalar.immediate_metrics = copy(scalar.metrics);
    const healing = find(c => c.parameters.panel === 'healing' && c.parameters.ability === 'inspire' && c.parameters.variant === 'inspire-level200');
    const compressed = lifecycle(healing); compressed.command_clock = { wall_time_before: 1000, wall_time_after: 1000 };
    for (const event of compressed.force_events) { event.elapsed_before /= 1000; event.elapsed /= 1000; event.wall_time_before = event.wall_time_after = 1000; }
    for (const step of compressed.healing_steps) step.elapsed /= 1000; compressed.elapsed /= 1000;
    const refused = find(c => c.parameters.panel === 'exercise' && c.parameters.variant === 'cost9'), lost = lifecycle(refused);
    lost.after[0].eff_qi--; lost.immediate = copy(lost.after); lost.metrics = [{ eff_qi_cost: 1 }, {}]; lost.immediate_metrics = copy(lost.metrics);
    const pure = find(c => c.parameters.panel === 'capacity' && c.parameters.ability === 'query_neili_limit'), query = capacity(pure);
    query.metrics = [{ qi_cost: 100, qi_recovery: 100 }, {}]; query.immediate_metrics = copy(query.metrics);
    const restore = find(c => c.parameters.panel === 'recovery'), restored = recovery(restore), key = restore.parameters.ability === 'recover' ? 'qi' : 'jing';
    restored.metrics[0][key + '_cost'] = 10; restored.metrics[0][key + '_recovery'] = 110; restored.immediate_metrics = copy(restored.metrics);
    return [
        { label: 'mandatory-force-hook', condition: combat, raw: missing, reason: /original mapped force hook count/ },
        { label: 'negative-factor', condition: combat, raw: negative, reason: /negative count|original jiali factor/ },
        { label: 'zero-jiali-hook', condition: zeroC, raw: zeroHook, reason: /original mapped force hook count/ },
        { label: 'guaranteed-reflection', condition: combat, raw: scalar, reason: /original guaranteed reflection mapping/ },
        { label: 'compressed-natural-updates', condition: healing, raw: compressed, reason: /original natural heal_up clock/ },
        { label: 'refused-exercise-side-effect', condition: refused, raw: lost, reason: /original refused command has no side effect/ },
        { label: 'pure-query-cancelling-gross', condition: pure, raw: query, reason: /pure query has no event/ },
        { label: 'recovery-cancelling-gross', condition: restore, raw: restored, reason: /original gross cost/ },
    ];
}
const bad = (r, c, mutate) => { const x = copy(r); mutate(x); assert.throws(() => check(x, c)); };

test('all112 finite formal/smoke conditions preserve actual error/NA; no native success implied', () => {
    assert.equal(formal.length, 112); assert.equal(smoke.length, 112);
    for (const c of [...formal, ...smoke]) for (const outcome of ['error', 'not_applicable']) {
        const r = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, outcome,
            elapsed: 0.1, reason: 'producer not implemented (synthetic)' };
        assert.equal(check(r, c), null); bad(r, c, x => { x.reason = ''; });
        bad(r, c, x => { x.index = c.samples; }); bad(r, c, x => { x.method = 'forged'; });
    }
});
test('seven capacity interfaces: exact owner, integer/zero return and source prediction independent', () => {
    for (const c of formal.filter(c => c.parameters.panel === 'capacity')) {
        const r = capacity(c), v = check(r, c); assert.equal(v.command_cost, 453); assert.equal(v.detail.result, r.interfaces[0].result);
        bad(r, c, x => { delete x.interfaces[0].result; });
        bad(r, c, x => { x.interfaces[0].implemented_by = '/forged'; });
        bad(r, c, x => { x.after[0].neili++; x.immediate = copy(x.after); x.metrics[0].neili_recovery = 1; x.immediate_metrics = copy(x.metrics); });
    }
});
test('nine immediate recoveries: hand anchor100 gain/20cost/public force progress, not zero inferred', () => {
    for (const c of formal.filter(c => c.parameters.panel === 'recovery')) {
        const r = recovery(c), v = check(r, c), key = c.parameters.ability === 'recover' ? 'qi' : 'jing';
        assert.equal(v.resources[0][key].recovery, 100); assert.equal(v.resources[0].neili.decrease, 20);
        bad(r, c, x => { delete x.metrics[0]; }); bad(r, c, x => { x.metrics[0].neili_cost = null; });
        bad(r, c, x => { x.after[0].learned_raw.force++; x.after[0].learned.force++; x.immediate = copy(x.after); });
        bad(r, c, x => { x.launches[0].skill = c.parameters.skill; });
    }
});
test('success claims without original timed/progress/combat/dispel evidence fail for all remaining panels', () => {
    for (const c of formal.filter(c => !['capacity', 'recovery'].includes(c.parameters.panel))) assert.throws(() => check(raw(c), c), c.id);
});
test('all112 source-reachable synthetic paths have positive consumers, including actual refusals, partials and original natural windows', () => {
    for (const c of formal) {
        try { assert.ok(check(successful(c), c)); }
        catch (error) { error.message = c.id + ': ' + error.message; throw error; }
    }
});
test('all nine panels reject panel-specific tampering after a valid positive, not only absent fixtures', () => {
    const specs = {
        research: r => { r.research_steps[0].wall_time_after = 999; },
        exercise: r => { r.exercise_steps[0].limit++; },
        'inherited-hit': r => { r.metrics[0].parry = 0; r.immediate_metrics = copy(r.metrics); },
        capacity: r => { r.interfaces[0].implemented_by = '/forged'; },
        expiry: r => { r.force_events.at(-1).wall_time_before = 1000; r.force_events.at(-1).wall_time_after = 1000; },
        healing: r => { r.healing_steps[1].state.eff_qi++; },
        dispel: r => { r.after[0].conditions = copy(r.before[0].conditions); r.immediate = copy(r.after); },
        repeat: r => { delete r.buff_steps[0].command_cost; },
        recovery: r => { r.launches[0].skill = 'forged-owner'; },
    };
    for (const [panel, edit] of Object.entries(specs)) {
        const c = formal.find(c => c.parameters.panel === panel), r = successful(c); check(r, c);
        if (panel === 'recovery') bad(r, c, x => { x.launches[0].skill = c.parameters.skill; });
        else bad(r, c, edit);
    }
});
test('reflection mapping remains separate from no-hook/miss denominator and cannot be relabelled as target damage', () => {
    const c = formal.find(c => c.parameters.panel === 'inherited-hit'), r = inherited(c, true), v = check(r, c);
    assert.equal(v.detail.reflection_calls, 1); assert.equal(v.resources[0].qi.decrease, 100);
    assert.equal(v.resources[1].qi.decrease, 0); assert.equal(v.detail.returns[0].damage, -50);
    bad(r, c, x => { x.passives[0].result.damage = 50; });
    bad(r, c, x => { x.passives[0].after[0].qi++; });
});

test('synthetic held sword retains original equipment apply and object; dodge is counted once', () => {
    const c = formal.find(c => c.parameters.panel === 'inherited-hit' && c.parameters.variant === 'held-sword');
    const r = successful(c); check(r, c);
    assert.deepEqual(r.before[0].temp.apply, { armor: 100, damage: 50, dodge: -1 });
    assert.equal(r.before[0].temp.weapon, r.before[0].weapon_details.object);
    assert.equal(r.before[0].effective_skills.dodge, 99);
    const mutateActor = (raw, edit) => { for (const phase of ['before', 'immediate', 'after']) edit(raw[phase][0]); };
    bad(r, c, x => mutateActor(x, s => { delete s.temp.apply.damage; }));
    bad(r, c, x => mutateActor(x, s => { delete s.temp.apply.dodge; s.effective_skills.dodge = 100; }));
    bad(r, c, x => mutateActor(x, s => { s.effective_skills.dodge--; }));
    bad(r, c, x => mutateActor(x, s => { s.temp.weapon = '/tests/sword#999'; }));
    // The old synthetic path was not a truthful normal-wield state.
    bad(r, c, x => mutateActor(x, s => {
        delete s.temp.weapon; delete s.temp.apply.damage; delete s.temp.apply.dodge;
    }));
});
test('natural heal_up is not collapsed into callback costs and actual halt clamps remain source-specific', () => {
    for (const panel of ['healing', 'exercise', 'expiry']) {
        const c = formal.find(c => c.parameters.panel === panel && !c.parameters.halt_after), r = successful(c);
        check(r, c); bad(r, c, x => { x.force_events[0].wall_time_before += 100; x.force_events[0].wall_time_after += 100; });
    }
    const c = formal.find(c => c.parameters.panel === 'healing' && c.parameters.ability === 'heal' && c.parameters.level === 200 && !c.parameters.halt_after);
    const r = successful(c); assert.ok(r.metrics[0].neili_recovery > 0); assert.ok(r.metrics[0].neili_cost > r.before[0].neili - r.after[0].neili);
    bad(r, c, x => { x.metrics[0].neili_recovery = 0; });
    const halted = formal.find(c => c.parameters.variant === 'halt-overcharge'), x = successful(halted);
    assert.equal(x.after[0].neili, x.after[0].max_neili * 2); check(x, halted);
    bad(x, halted, v => { v.exercise_halt.after.neili--; v.after = [copy(v.exercise_halt.after), copy(v.before[1])]; v.metrics[0].neili_cost++; });
});
test('eight independently established impossible trajectories reject for their original causal gaps', () => {
    for (const entry of adversarial(formal)) assert.throws(() => check(entry.raw, entry.condition), entry.reason, entry.label);
});
test('source clock accepts internal-time brackets and no-op HBs without a hard first-delay or exact elapsed cadence', () => {
    const c = formal.find(c => c.parameters.panel === 'healing' && c.parameters.variant === 'inspire-level200');
    const r = lifecycle(c); check(r, c);
    // The integer internal t may be at the END, not the before observation:
    // adjacent observed updates [1006,1007] and [1011,1012] have a feasible5s gap.
    const natural = r.force_events.filter(e => e.after.neili > r.healing_steps[e.step_count_after - 1].state.neili);
    assert.equal(natural.length, 2); natural[1].wall_time_before--;
    check(r, c);
    // Changing a no-resource-effect HB's time within the original common origin
    // cannot invent another heal_up opportunity or impose an update on that HB.
    const unchanged = r.force_events[0]; assert.equal(unchanged.wall_time_after - unchanged.wall_time_before, 1);
    const drift = copy(r); drift.force_events.find(e => e.after.neili > drift.healing_steps[e.step_count_after - 1].state.neili).after.neili++;
    assert.throws(() => check(drift, c));
});
test('finite sample plan and identity cannot be changed after validation or via raw authority', () => {
    const c = formal.find(c => c.parameters.panel === 'recovery'), r = recovery(c);
    // Deterministic formal/smoke both have2 slots; only the original manifest can
    // distinguish them. The record must reject an invalid finite count instead.
    const d = copy(c); d.samples = 3; assert.throws(() => check(r, d));
    for (const edit of [x => { x.before[0].wizardp = 1; }, x => { x.after[0].object = '/tests/actor#999'; },
        x => { delete x.after[0].learned_raw; }, x => { x.after[0].effective_skills.force++; },
        x => { x.random_draws = [0]; }, x => { x.immediate_metrics[0].heartbeats = 1; }]) bad(r, c, edit);
});
