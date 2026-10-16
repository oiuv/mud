import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoJiuyangExertConditions as conditions, mingjiaoJiuyangExertSourcePaths as sources,
    mingjiaoJiuyangExertReviewedSourceHash as reviewed, mingjiaoJiuyangExertAbsentPaths as absent,
    validateMingjiaoJiuyangExertCondition as condition, validateMingjiaoJiuyangExertRecord as record,
    mingjiaoJiuyangExertEffects as effects } from './school_mingjiao_jiuyang_exert_cases.mjs';
import { validateRecord as general } from './execution.mjs';
import { validateSchoolCombatRecord as school } from './school_combat_cases.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p), copy = v => structuredClone(v);
const hash = b => createHash('sha256').update(b).digest('hex'), skill = 'jiuyang-shengong';
const catalog = { skills: ['powerup', 'shield', 'roar'].map(a => { const path = `kungfu/skill/${skill}/exert/${a}.c`;
    return { path, sha256: hash(read(path)), entries: [{ id: `${path}:${a === 'roar' ? 7 : 9}:exert` }] }; }) };
const cases = conditions(catalog, read), pick = (a, variant = a === 'powerup' ? '400-breakup0' : '400', phase = 'immediate') => {
    const c = cases.find(c => c.parameters.ability === a && c.parameters.variant === variant && c.parameters.phase === phase); assert.ok(c); return c; };
const effective = s => Object.fromEntries(Object.entries(s.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (s.mappings[k] === skill ? s.skills[skill] : 0) + (s.temp.apply[k] ?? 0)]));
function state(cfg, side, p, awake = false) {
    const s = { object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side], userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0,
        living: 1, not_living: null, busy: cfg.busy ?? null, conditions: cfg.conditions ? copy(cfg.conditions) : null,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        cultivation: Object.fromEntries(['improve/neili', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: side ? { armor: 100 } : { armor: 107, attack: 7, parry: 11, dodge: 13 } },
        craze: 0, max_craze: 5000, no_exert: cfg.temp?.no_exert ?? null, die_guard: cfg.temp?.die_guard ?? null, last_damage_from: null,
        hostility: { enemies: p.fighting ? [side ? 'left' : 'right'] : [], killers: p.fighting ? [side ? 'left' : 'right'] : [], wants: [] },
        weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, secondary_weapon: 'none', secondary_weapon_details: {},
        handing: 'none', handing_details: {}, ammunition: 0, environment: '/tests/runner' };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing', 'breakup'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    for (const [k, v] of Object.entries(cfg.temp ?? {})) if (k.startsWith('apply/')) s.temp.apply[k.slice(6)] = v; else s.temp[k] = v;
    s.effective_skills = effective(s); s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_con = s.con + Math.trunc(cfg.skills.force / 10);
    s.effective_int = s.int; s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    if (side === 1 && p.target_state && !awake) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
function relations(states) {
    return states.map((s, side) => ({ side, enemies: s.hostility.enemies.map(id => states.findIndex(p => p.id === id)),
        want: copy(s.hostility.wants), killers: copy(s.hostility.killers), pairs: states.flatMap((peer, other) => other === side ? [] : [{ side: other,
            fighting: Number(s.hostility.enemies.includes(peer.id)), want: Number(s.hostility.wants.includes(peer.id)), killing: Number(s.hostility.killers.includes(peer.id)) }]) }));
}
// Synthetic records with independent original source equations; no driver and no natural waiting.
export function syntheticJiuyangExertTrace(c, { gate = true, weak = 1, costs = [1, 1], index = 0, reverse = false } = {}) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p)];
    if (p.extra_target) before.push(state(p.extra_target, 2, p));
    const raw = { kind: 'sample', condition_id: c.id, method: 'exert', index, elapsed: p.observe_seconds ? p.observe_seconds + .1 : .01,
        outcome: p.expected, reason: '', before: copy(before.slice(0, 2)), immediate: [], after: [], metrics: [{}, {}],
        actions: [], attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], directs: [],
        launches: [], refusals: [], callbacks: [], busy_calls: [], skill_messages: [], exert_steps: [], command_accepted: 0,
        exert_room: { no_fight: p.room.no_fight ?? null, skybook: p.room.skybook ?? null }, relation_context: { before: relations(before) } };
    if (p.extra_target) { raw.extra_target_before = copy(before[2]); raw.extra_target_metrics = {}; }
    if (p.target_state) raw.preparation = { before: state(p.target, 1, p, true), after: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    let current = copy(before);
    for (let i = 0; i < p.actions.length; i++) {
        const action = p.actions[i], ability = action.split(' ')[1], accepted = p.expected === 'observed' && !(p.repeat_refusal && i === 1);
        const step = { action, before: copy(current.slice(0, 2)), accepted: accepted ? costs[i] : 0, reason: '', launch_start: raw.launches.length, refusal_start: raw.refusals.length };
        if (p.extra_target) step.extra_before = copy(current[2]);
        if (accepted) {
            raw.launches.push({ actor: current[0].object, skill, argument: action.slice(6) });
            current[0].temp.notify_fail = '你所学的内功中没有这种功能。\n';
            current[0].neili -= 100; current[0].learned = weak ? { [skill]: (current[0].learned[skill] ?? 0) + weak } : copy(current[0].learned);
            if (ability === 'roar') {
                current[0].qi -= 10;
                raw.busy_calls.push({ side: 0, caller_side: 0, requested: 5, before: current[0].busy, after: 5 }); current[0].busy = 5;
                raw.skill_messages.push({ side: 0, type: 'vision', text: '猛然深吸一口气，仰天长吟，声音洪亮无比，气势恢弘。\n' });
                const s = current[0].effective_skills.force, targets = current.map((_, side) => side).filter(side => side);
                if (reverse) targets.reverse();
                for (const side of targets) {
                    const t = current[side], lower = Math.trunc(s / 2), passed = lower >= t.con * 2 || gate && lower + lower - 1 >= t.con * 2;
                    if (!passed) continue;
                    current[0].hostility.enemies.push(t.id); current[0].hostility.wants.push(t.id);
                    if (t.living) { t.hostility.enemies.push(current[0].id); t.hostility.killers.push(current[0].id); }
                    const d = s - Math.trunc(t.max_neili / 10);
                    if (d > 0) {
                        const qi = d * 3, w = t.neili < s * 2 ? d * 2 : 0;
                        t.qi = Math.max(-1, t.qi - qi); t.eff_jing = Math.max(-1, t.eff_jing - w); if (w) t.jing = Math.min(t.jing, t.eff_jing);
                        t.craze = Math.min(t.max_craze, t.craze + (qi > 150 ? Math.trunc(qi / 5) : 0) + (w > 150 ? Math.trunc(w / 3) : 0));
                        t.last_damage_from = current[0].object;
                        raw.skill_messages.push({ side, type: 'tell', text: '你只觉得胸口一阵苦闷，顿时倒退几步，一股鲜血从口中喷出。\n' });
                    }
                }
            } else {
                const s = current[0].effective_skills.force, breakup = current[0].cultivation.breakup;
                const change = ability === 'shield' ? { armor: Math.trunc(s / 2) } : breakup ? { attack: Math.trunc(s * 2 / 3), parry: Math.trunc(s * 2 / 5), dodge: Math.trunc(s * 2 / 5) }
                    : { attack: Math.trunc(s / 3), parry: Math.trunc(s / 3), dodge: Math.trunc(s / 3) };
                for (const [k, n] of Object.entries(change)) current[0].temp.apply[k] += n; current[0].temp[ability] = 1;
                current[0].effective_skills = effective(current[0]);
                if (p.fighting) { const n = ability === 'powerup' ? 3 : 2; raw.busy_calls.push({ side: 0, caller_side: 0, requested: n, before: current[0].busy, after: n }); current[0].busy = n; }
                raw.skill_messages.push({ side: 0, type: 'vision', text: ability === 'powerup' ? '微一凝神，运起九阳神功，将真气凝聚在丹田之中，沿奇经八脉遍布全身！\n' : '默念九阳神功的口诀：他强由他强，清风拂山冈。\n' });
            }
        } else {
            const notice = p.repeat_refusal ?? p.refusal; current[0].temp.notify_fail = notice; step.reason = notice;
            if (!p.outer_refusal) raw.refusals.push({ actor: current[0].object, reason: '\x1b[256D\x1b[K' + notice });
            if (p.ability === 'roar' && p.variant === 'no-fight') { current[0].neili -= 100; current[0].qi -= 10; }
        }
        step.launch_end = raw.launches.length; step.refusal_end = raw.refusals.length; step.after = copy(current.slice(0, 2));
        if (p.extra_target) step.extra_after = copy(current[2]); raw.exert_steps.push(step); raw.command_accepted += step.accepted;
    }
    raw.immediate = copy(current.slice(0, 2)); raw.relation_context.immediate = relations(current);
    if (p.extra_target) raw.extra_target_immediate = copy(current[2]);
    if (p.observe_seconds) {
        const s = before[0].effective_skills.force, delay = p.ability === 'powerup' ? Math.trunc(s / 2) : s;
        raw.callbacks.push({ side: 0, phase: 'before', elapsed: delay, owner: current[0].object, function: 'eval_function', state: copy(current[0]) });
        const change = p.ability === 'shield' ? { armor: Math.trunc(s / 2) } : before[0].cultivation.breakup ? { attack: Math.trunc(s * 2 / 3), parry: Math.trunc(s * 2 / 5), dodge: Math.trunc(s * 2 / 5) }
            : { attack: Math.trunc(s / 3), parry: Math.trunc(s / 3), dodge: Math.trunc(s / 3) };
        for (const [k, n] of Object.entries(change)) current[0].temp.apply[k] -= n;
        delete current[0].temp[p.ability]; current[0].effective_skills = effective(current[0]);
        raw.callbacks.push({ side: 0, phase: 'after', elapsed: delay + .001, owner: current[0].object, function: 'eval_function', state: copy(current[0]) });
        raw.skill_messages.push({ side: 0, type: 'tell', text: '你的九阳神功运行完毕，将内力收回丹田。\n' });
    }
    raw.after = copy(current.slice(0, 2)); raw.relation_context.after = relations(current);
    if (p.extra_target) raw.extra_target_after = copy(current[2]);
    const metrics = [...raw.metrics, ...(p.extra_target ? [raw.extra_target_metrics] : [])];
    for (let side = 0; side < current.length; side++) for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const diff = before[side][k] - current[side][k]; if (diff) metrics[side][k + '_cost'] = diff;
    }
    if (raw.launches.length) raw.metrics[0].ability_launched = raw.launches.length;
    raw.reason = p.expected === 'observed' ? '' : raw.exert_steps.at(-1).reason; return raw;
}
const reject = (c, raw, change) => { const bad = copy(raw); change(bad); assert.throws(() => record(bad, c)); };
test('complete61/1788/122:41buff32+9high,20roar;17random100+44det2;exact137source/4absence', () => {
    assert.equal(cases.length, 61); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1788);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 122);
    assert.deepEqual(['powerup', 'shield', 'roar'].map(a => cases.filter(c => c.parameters.ability === a).length), [24, 17, 20]);
    assert.equal(cases.filter(c => c.id.startsWith('school-mingjiao-exert-jiuyang-lifecycle-')).length, 9);
    assert.equal(cases.filter(c => c.parameters.phase === 'lifecycle').length, 12); assert.equal(sources.length, 137); assert.equal(absent.length, 4);
    assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), reviewed); cases.forEach(condition);
    assert.throws(() => conditions(catalog, p => p === absent[0] ? Buffer.from('appeared') : read(p)));
    assert.throws(() => conditions(catalog, p => p === 'kungfu/skill/force/roar.c' ? Buffer.from('drift') : read(p)));
    assert.equal(sources.at(-1), 'cmds/skill/exert.c');
    assert.throws(() => conditions(catalog, p => p === 'cmds/skill/exert.c' ? Buffer.from('command drift') : read(p)));
    const bad = copy(pick('powerup')); bad.parameters.actions = ['exert roar']; assert.throws(() => condition(bad));
});
test('all61 complete explicitlysyntheticrecords pass actual general/school/special3layers;no nativeclock', () => {
    for (const c of cases) { const r = syntheticJiuyangExertTrace(c); general(r, c); school(r, c); assert.ok(record(r, c)); }
});
test('buffthreegrowthandbreakup originalfloors offsets7/11/13 armor107 exactreturn;rawtimersnotshortened', () => {
    for (const c of cases.filter(c => c.parameters.phase === 'lifecycle')) {
        const r = syntheticJiuyangExertTrace(c), e = record(r, c), s = r.before[0].effective_skills.force;
        assert.equal(c.parameters.observe_seconds, (c.parameters.ability === 'powerup' ? Math.trunc(s / 2) : s) + 2);
        assert.deepEqual(r.after[0].temp.apply, { armor: 107, attack: 7, parry: 11, dodge: 13 }); assert.deepEqual(e.buff_returned, e.buff_added);
        reject(c, r, b => { b.callbacks[0].elapsed = 0; }); reject(c, r, b => { b.callbacks[1].owner = b.before[1].object; });
        reject(c, r, b => { b.after[0].temp.apply.parry--; b.callbacks[1].state = copy(b.after[0]); });
        reject(c, r, b => { delete b.callbacks[1].function; });
    }
    const c = pick('powerup', '400-breakup1'), r = syntheticJiuyangExertTrace(c), e = record(r, c);
    assert.deepEqual(e.buff_added, { attack: 400, parry: 240, dodge: 240, armor: 0 });
    reject(c, r, b => { b.immediate[0].temp.apply.parry += 1; b.after = copy(b.immediate); b.exert_steps[0].after = copy(b.immediate); });
});
test('low30powerup/low40shield weaknatural0or1;highforcesuccessgain1,notfalseallweak0', () => {
    for (const c of cases.filter(c => c.parameters.random_effects && c.parameters.ability !== 'roar')) for (const weak of [0, 1]) {
        const r = syntheticJiuyangExertTrace(c, { weak }); assert.equal(record(r, c).weak_gain, weak);
    }
    const c = pick('shield'), r = syntheticJiuyangExertTrace(c); reject(c, r, b => {
        b.immediate[0].learned = {}; b.after = copy(b.immediate); b.exert_steps[0].after = copy(b.immediate);
    });
});
test('repeat/combinations原2commands positive23/476 costs notbool/count;refusal+launch boundaries exact', () => {
    for (const c of cases.filter(c => c.parameters.actions.length === 2)) {
        const r = syntheticJiuyangExertTrace(c, { costs: [23, 476] }), e = record(r, c);
        assert.equal(e.commands_attempted, 2); assert.equal(e.commands_accepted, c.parameters.repeat_refusal ? 1 : 2);
        assert.equal(e.command_cost, c.parameters.repeat_refusal ? 23 : 499);
        assert.equal(effects([{ raw: r }], c).commands_accepted, e.commands_accepted);
        reject(c, r, b => { b.command_accepted = 1; }); reject(c, r, b => { b.exert_steps[1].launch_start = 0; });
        reject(c, r, b => { b.exert_steps[1].refusal_end++; });
    }
});
test('roar directbody skip publicguard:die_guard/unconscious/skybook/outsidefamily andtwoactualtargets', () => {
    for (const variant of ['die-guard', 'unconscious', 'skybook', 'outside-family', 'three-users']) {
        const c = pick('roar', variant), r = syntheticJiuyangExertTrace(c, { gate: true, reverse: true }), e = record(r, c);
        assert.equal(e.roar_targets['1'].gate_passed, 1); assert.ok(e.roar_targets['1'].qi_input > 0);
        if (variant === 'unconscious') { assert.equal(e.roar_targets['1'].qi_cost, 1); assert.equal(e.roar_targets['1'].target_killing, 0); assert.equal(e.roar_targets['1'].actor_fighting, 1); }
        if (variant === 'three-users') { assert.equal(e.roar_targets['2'].gate_passed, 1);
            reject(c, r, b => { delete b.extra_target_metrics; }); reject(c, r, b => { b.extra_target_after.hostility.killers = []; }); }
    }
});
test('roar d-1/0/+1 gateviawantrelation notcost;rawcon/RNGgate bothbranches truthful', () => {
    for (const delta of [-1, 0, 1]) for (const gate of [false, true]) {
        const c = pick('roar', 'damage' + delta), r = syntheticJiuyangExertTrace(c, { gate }), e = record(r, c);
        assert.equal(e.roar_targets['1'].gate_passed, Number(gate)); assert.equal(e.roar_targets['1'].damaging, Number(gate && delta > 0));
        assert.equal(e.roar_targets['1'].qi_input, gate && delta > 0 ? 3 : 0);
        if (gate && delta <= 0) assert.equal(r.immediate[0].hostility.wants.length, 1);
        reject(c, r, b => { b.relation_context.immediate[0].pairs[0].want = 1 - Number(gate); });
    }
});
test('roar neili2S-1 vs2S jingwoundinput distinctfromcurrentjingcost andnominalQi', () => {
    for (const n of [1199, 1200]) {
        const c = pick('roar', 'target-neili' + n), r = syntheticJiuyangExertTrace(c), e = record(r, c).roar_targets['1'];
        assert.equal(e.qi_input, 1200); assert.equal(e.jing_wound_input, n === 1199 ? 800 : 0);
        assert.equal(e.eff_jing_cost, e.jing_wound_input); assert.equal(e.jing_cost, e.jing_wound_input);
        reject(c, r, b => { b.immediate[1].eff_jing--; b.metrics[1].eff_jing_cost = (b.metrics[1].eff_jing_cost ?? 0) + 1;
            b.after = copy(b.immediate); b.exert_steps[0].after = copy(b.immediate); });
        reject(c, r, b => { b.immediate[1].craze--; b.after = copy(b.immediate); b.exert_steps[0].after = copy(b.immediate); });
    }
});
test('no_fight realfee100/qi10beforepublicfinalrefusal;current99fee0 fallbackfinalnotice;outerrefusals0', () => {
    const c = pick('roar', 'no-fight'), r = syntheticJiuyangExertTrace(c), e = record(r, c);
    assert.equal(e.commands_accepted, 0); assert.equal(e.actor_neili_cost, 100); assert.equal(e.actor_qi_cost, 10);
    assert.equal(r.refusals.length, 1); assert.equal(r.reason, '在这里不能攻击他人。\n');
    reject(c, r, b => { b.metrics[0] = {}; b.immediate = copy(b.before); b.immediate[0].temp.notify_fail = c.parameters.refusal; b.after = copy(b.immediate); b.exert_steps[0].after = copy(b.immediate); });
    const low = pick('roar', 'neili99'), lr = syntheticJiuyangExertTrace(low); assert.equal(record(lr, low).actor_neili_cost, 0); assert.equal(lr.reason, '你的真气不够。\n');
    for (const a of ['powerup', 'shield', 'roar']) for (const v of ['busy1', 'no-exert', 'exert-drug', 'unmapped']) {
        const c = pick(a, v), r = syntheticJiuyangExertTrace(c); assert.equal(r.refusals.length, 0); assert.ok(record(r, c));
        reject(c, r, b => { b.refusals.push({ actor: b.before[0].object, reason: b.reason }); });
    }
});
test('mandatoryshape/metadata/cost/resource/callbackunknownfailclosed;diagnosticneverzerofill', () => {
    const c = pick('roar'), r = syntheticJiuyangExertTrace(c);
    for (const k of ['metrics', 'relation_context', 'exert_steps', 'exert_room', 'skill_messages']) reject(c, r, b => { delete b[k]; });
    for (const cost of [0, -1, null, 1.5, true, '23']) reject(c, r, b => { b.exert_steps[0].accepted = cost; b.command_accepted = cost; });
    reject(c, r, b => { b.before[0].interactive = 0; }); reject(c, r, b => { b.metrics[1].heartbeats = 1; });
    for (const index of [null, -1, c.samples]) reject(c, r, b => { b.index = index; });
    const diagnostic = { kind: 'sample', condition_id: c.id, method: 'exert', index: 0, elapsed: 0, outcome: 'error', reason: 'synthetic error' };
    assert.equal(record(diagnostic, c), null); const e = effects([{ raw: diagnostic }], c); assert.equal(e.actor_neili_cost, null); assert.equal(e.buff_added.attack, null);
    reject(c, diagnostic, b => { b.reason = ''; }); reject(c, diagnostic, b => { b.elapsed = null; }); reject(c, diagnostic, b => { delete b.index; });
});
test('Effects actualknownsum/roleprobability/elapsedclockandunknownpartiallabel—not totalplan timing', () => {
    const c = pick('roar'), rows = [false, true].map((gate, index) => ({ raw: syntheticJiuyangExertTrace(c, { gate, index }) }));
    const e = effects(rows, c); assert.equal(e.commands_accepted, 2); assert.equal(e.actor_qi_cost, 20); assert.equal(e.roar_targets['1'].gate_probability.trials, 2);
    assert.equal(e.roar_targets['1'].gate_probability.successes, 1); assert.equal(e.elapsed_wait.n, 0);
    const lc = pick('shield', '800', 'lifecycle'), trace = syntheticJiuyangExertTrace(lc), f = effects([{ raw: trace }], lc);
    assert.equal(f.callback_pairs, 1); assert.equal(f.elapsed_wait.n, 1); assert.equal(f.callback_elapsed.min, 1200.001);
    const unknown = { kind: 'sample', condition_id: c.id, method: 'exert', index: 1, elapsed: .1, outcome: 'not_applicable', reason: 'synthetic unknown' };
    const mixed = effects([rows[0], { raw: unknown }], c); assert.equal(mixed.roar_targets['1'].gate_trials, null); assert.equal(mixed.commands_accepted, null);
    assert.equal(mixed.roar_targets['1'].recorded, 1);
});
