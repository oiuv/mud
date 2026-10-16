// Independent synthetic report checks; no driver and no other test-module imports.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { mingjiaoJiuyangExertConditions, mingjiaoJiuyangExertSourcePaths } from './school_mingjiao_jiuyang_exert_cases.mjs';
import { mingjiaoJiuyangExertReport, mingjiaoJiuyangExertMarkdown } from './school_mingjiao_jiuyang_exert_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p, 'utf8');
const skill = 'jiuyang-shengong';
const catalog = { skills: ['powerup', 'shield', 'roar'].map(a => {
    const path = `kungfu/skill/${skill}/exert/${a}.c`;
    return { path, sha256: sha256(read(path)), entries: [{ id: `${path}:${a === 'roar' ? 7 : 9}:exert` }] };
}) };
const cases = mingjiaoJiuyangExertConditions(catalog, read);
const pick = (ability, variant, phase = 'immediate') => {
    const c = cases.find(c => c.parameters.ability === ability && c.parameters.variant === variant && c.parameters.phase === phase);
    assert.ok(c, `${ability}/${variant}/${phase}`); return c;
};
const envelope = (raw, c) => ({ format: 1, fingerprint: 'a'.repeat(64), condition_id: c.id, condition_sha256: digest(c),
    index: raw.index, outcome: raw.outcome, reason: raw.reason, raw, raw_sha256: digest(raw), recorded: '2026-10-14T00:00:00.000Z' });
const diagnostic = (c, outcome = 'error', index = 0) => envelope({ kind: 'sample', condition_id: c.id, method: c.method,
    index, elapsed: .01, outcome, reason: 'synthetic <error>|`\x1b[31m\nonly' }, c);

const copy = v => structuredClone(v);
function effective(s) {
    s.effective_skills = Object.fromEntries(Object.entries(s.skills).map(([k, v]) => [k,
        Math.trunc(v / 2) + (s.mappings[k] === skill ? s.skills[skill] : 0) + (s.temp.apply[k] ?? 0)]));
}
function state(cfg, side, p, awake = false) {
    const s = { object: '/tests/actor#' + (100 + side), id: ['left', 'right', 'third'][side], userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, ghost: null, living: 1, not_living: null, last_damage_from: null, busy: cfg.busy ?? null,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        conditions: cfg.conditions ? copy(cfg.conditions) : null, craze: 0, max_craze: 5000,
        cultivation: Object.fromEntries(['improve/neili', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: side ? { armor: 100 } : { armor: 107, attack: 7, parry: 11, dodge: 13 } },
        no_exert: cfg.temp?.no_exert ?? null, die_guard: cfg.temp?.die_guard ?? null,
        weapon: 'none', weapon_details: {}, secondary_weapon: 'none', secondary_weapon_details: {},
        handing: 'none', handing_details: {}, weapon_damage: 0, weapon_flag: 0, ammunition: 0,
        hostility: { enemies: p.fighting ? [side ? 'left' : 'right'] : [], killers: p.fighting ? [side ? 'left' : 'right'] : [], wants: [] } };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing', 'breakup'].includes(k)) s.cultivation[k] = v;
        else s[k] = v;
    }
    for (const [k, v] of Object.entries(cfg.temp ?? {})) if (!k.includes('/')) s.temp[k] = v;
    s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_int = s.int;
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    effective(s);
    if (side === 1 && p.target_state && !awake) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
function relations(states) {
    return states.map((s, side) => ({ side, enemies: s.hostility.enemies.map(id => states.findIndex(s => s.id === id)),
        want: copy(s.hostility.wants), killers: copy(s.hostility.killers),
        pairs: states.flatMap((peer, i) => i === side ? [] : [{ side: i, fighting: Number(s.hostility.enemies.includes(peer.id)),
            killing: Number(s.hostility.killers.includes(peer.id)), want: Number(s.hostility.wants.includes(peer.id)) }]) }));
}
// Narrow source-supported synthetic trace, never an actual elapsed driver sample.
function trace(c, { passed = true, cost = 1, weak = 1, index = 0 } = {}) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p), ...(p.extra_target ? [state(p.extra_target, 2, p)] : [])];
    const raw = { kind: 'sample', condition_id: c.id, method: 'exert', index, elapsed: .01, outcome: p.expected,
        reason: '', command_accepted: 0, before: copy(before.slice(0, 2)), immediate: [], after: [], metrics: [{}, {}],
        attacks: [], actions: [], directs: [], passives: [], defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [],
        launches: [], refusals: [], callbacks: [], busy_calls: [], skill_messages: [], exert_steps: [],
        exert_room: { no_fight: p.room.no_fight ?? null, skybook: p.room.skybook ?? null }, relation_context: { before: relations(before) } };
    if (p.extra_target) { raw.extra_target_before = copy(before[2]); raw.extra_target_metrics = {}; }
    if (p.target_state) raw.preparation = { before: state(p.target, 1, p, true), after: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    let current = copy(before);
    for (let i = 0; i < p.actions.length; i++) {
        const action = p.actions[i], ability = action.split(' ')[1], accepted = p.expected === 'observed' && !(p.repeat_refusal && i === 1);
        const step = { action, before: copy(current.slice(0, 2)), launch_start: raw.launches.length,
            refusal_start: raw.refusals.length, accepted: accepted ? cost : 0, reason: '' };
        if (p.extra_target) step.extra_before = copy(current[2]);
        const a = current[0];
        if (accepted) {
            raw.launches.push({ actor: a.object, skill, argument: action.slice(6) });
            a.temp.notify_fail = '你所学的内功中没有这种功能。\n';
            a.neili -= 100;
            if (weak) a.learned[skill] = (a.learned[skill] ?? 0) + weak;
            if (ability === 'roar') {
                a.qi -= 10;
                for (let side = 1; side < current.length; side++) {
                    const t = current[side], yes = Array.isArray(passed) ? passed[side - 1] : passed;
                    if (!yes) continue;
                    a.hostility.wants.push(t.id); a.hostility.enemies.push(t.id);
                    if (t.living) { t.hostility.enemies.push(a.id); t.hostility.killers.push(a.id); }
                    const d = a.effective_skills.force - Math.trunc(t.max_neili / 10);
                    if (d > 0) {
                        const q = 3 * d, w = t.neili < a.effective_skills.force * 2 ? 2 * d : 0;
                        t.qi = Math.max(-1, t.qi - q); t.eff_jing = Math.max(-1, t.eff_jing - w);
                        if (w) t.jing = Math.min(t.jing, t.eff_jing);
                        t.last_damage_from = a.object;
                        t.craze = Math.min(t.max_craze, t.craze + (q > 150 ? Math.trunc(q / 5) : 0) + (w > 150 ? Math.trunc(w / 3) : 0));
                    }
                }
            } else {
                const s = a.effective_skills.force, breakup = a.cultivation.breakup;
                const added = ability === 'shield' ? { armor: Math.trunc(s / 2) } : breakup
                    ? { attack: Math.trunc(2 * s / 3), parry: Math.trunc(2 * s / 5), dodge: Math.trunc(2 * s / 5) }
                    : { attack: Math.trunc(s / 3), parry: Math.trunc(s / 3), dodge: Math.trunc(s / 3) };
                for (const [k, v] of Object.entries(added)) a.temp.apply[k] += v;
                a.temp[ability] = 1; effective(a);
            }
            if (ability === 'roar' || p.fighting) {
                const next = ability === 'roar' ? 5 : ability === 'powerup' ? 3 : 2;
                raw.busy_calls.push({ side: 0, caller_side: 0, requested: next, before: a.busy, after: next }); a.busy = next;
            }
            raw.skill_messages.push({ side: 0, type: 'vision', text: ability === 'roar' ? '猛然深吸一口气，仰天长吟。\n' : '运起九阳神功。\n' });
        } else {
            step.reason = p.repeat_refusal ?? p.refusal; a.temp.notify_fail = step.reason;
            if (!p.outer_refusal) raw.refusals.push({ actor: a.object, reason: '\x1b[256D\x1b[K' + step.reason });
            if (p.ability === 'roar' && p.variant === 'no-fight') { a.neili -= 100; a.qi -= 10; }
        }
        step.launch_end = raw.launches.length; step.refusal_end = raw.refusals.length; step.after = copy(current.slice(0, 2));
        if (p.extra_target) step.extra_after = copy(current[2]);
        raw.command_accepted += step.accepted; raw.exert_steps.push(step);
    }
    raw.reason = p.expected === 'observed' ? '' : raw.exert_steps.at(-1).reason;
    raw.immediate = copy(current.slice(0, 2)); raw.relation_context.immediate = relations(current);
    if (p.extra_target) raw.extra_target_immediate = copy(current[2]);
    if (p.phase === 'lifecycle') {
        const s = before[0].effective_skills.force, delay = p.ability === 'powerup' ? Math.trunc(s / 2) : s;
        raw.callbacks.push({ side: 0, phase: 'before', elapsed: delay + .01, owner: current[0].object, function: 'eval_function', state: copy(current[0]) });
        current[0].temp.apply = copy(before[0].temp.apply); delete current[0].temp[p.ability]; effective(current[0]);
        raw.callbacks.push({ side: 0, phase: 'after', elapsed: delay + .02, owner: current[0].object, function: 'eval_function', state: copy(current[0]) });
        raw.elapsed = p.observe_seconds + .05;
        raw.skill_messages.push({ side: 0, type: 'tell', text: '你的九阳神功运行完毕，将内力收回丹田。\n' });
    }
    raw.after = copy(current.slice(0, 2)); raw.relation_context.after = relations(current);
    if (p.extra_target) raw.extra_target_after = copy(current[2]);
    const metrics = [...raw.metrics, ...(p.extra_target ? [raw.extra_target_metrics] : [])];
    for (let side = 0; side < current.length; side++) for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const loss = before[side][k] - current[side][k]; if (loss) metrics[side][k + '_cost'] = loss;
    }
    raw.metrics[0].ability_launched = raw.launches.length;
    return raw;
}

test('finite61/1788/122 keeps lifecycle separate from instantaneous observations', () => {
    assert.equal(cases.length, 61); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1788);
    assert.equal(mingjiaoJiuyangExertSourcePaths.length, 137);
    assert.equal(mingjiaoJiuyangExertConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 122);
    const lifecycle = cases.filter(c => c.parameters.phase === 'lifecycle'); assert.equal(lifecycle.length, 12);
    assert.equal(lifecycle.filter(c => c.parameters.level >= 200).length, 9);
    for (const c of cases) {
        const s = mingjiaoJiuyangExertReport([], c);
        assert.equal(s.context.source_count, mingjiaoJiuyangExertSourcePaths.length);
        assert.equal(s.effects, null); assert.equal(s.coverage.missing, c.samples);
        const md = mingjiaoJiuyangExertMarkdown(s); assert.match(md, /未观测：没有原件/);
        if (c.parameters.phase === 'lifecycle') assert.match(md, /自然到期/);
        else assert.match(md, /即时观察/);
    }
});

test('diagnostics retain identities and null costs even on a fee-before-refusal case', () => {
    for (const c of [pick('powerup', '400-breakup0'), pick('shield', '800', 'lifecycle'), pick('roar', 'no-fight')]) {
        const s = mingjiaoJiuyangExertReport([diagnostic(c), diagnostic(c, 'not_applicable', 1)], c);
        assert.equal(s.coverage.known, 0); assert.equal(s.coverage.unknown, 2);
        const md = mingjiaoJiuyangExertMarkdown(s); assert.match(md, /未知/);
        assert.match(md, /&lt;error&gt;\\\|&#96;\\x1b/); assert.doesNotMatch(md, /<error>/);
    }
});

test('original ledger digest, frozen source, metadata and slot counterexamples are rejected', () => {
    const c = cases[0], row = diagnostic(c);
    for (const mutate of [r => { r.condition_id += '-wrong'; }, r => { r.raw.condition_id += '-wrong'; },
        r => { r.raw.method = 'interface'; }, r => { r.index = r.raw.index = null; },
        r => { r.index = r.raw.index = -1; }, r => { r.index = r.raw.index = c.samples; },
        r => { r.reason = r.raw.reason = ''; }, r => { r.raw.elapsed = -1; }, r => { delete r.raw.elapsed; },
        r => { r.outcome = 'refused'; }, r => { r.reason = 'different reason'; }, r => { r.raw.kind = 'event'; }]) {
        const b = structuredClone(row); mutate(b); b.raw_sha256 = digest(b.raw);
        assert.throws(() => mingjiaoJiuyangExertReport([b], c));
    }
    for (const key of ['raw_sha256', 'condition_sha256']) {
        const bad = structuredClone(row); bad[key] = '0'.repeat(64); assert.throws(() => mingjiaoJiuyangExertReport([bad], c));
    }
    assert.throws(() => mingjiaoJiuyangExertReport([row, row], c));
    const changed = structuredClone(c); changed.parameters.source_evidence[Object.keys(changed.parameters.source_evidence)[0]] = '0'.repeat(64);
    assert.throws(() => mingjiaoJiuyangExertReport([], changed));
});

test('positive command cost is not an accepted-command count; duplicate buff attempt is separate', () => {
    const c = pick('powerup', 'repeat'), raw = trace(c, { cost: 7 }), s = mingjiaoJiuyangExertReport([envelope(raw, c)], c);
    assert.equal(s.effects.commands_attempted, 2); assert.equal(s.effects.commands_accepted, 1);
    assert.equal(s.effects.commands_refused, 1); assert.equal(s.effects.command_cost, 7);
    assert.equal(s.effects.actor_neili_cost, 100); assert.equal(s.effects.callback_pairs, 0);
    assert.equal(s.effects.buff_added.attack, 200); assert.equal(s.effects.buff_returned.attack, 0);
    const md = mingjiaoJiuyangExertMarkdown(s); assert.match(md, /即时观察/); assert.match(md, /不证明强化已按原时钟自然到期/);
    const bad = copy(s); bad.effects.commands_accepted = 7;
    assert.throws(() => mingjiaoJiuyangExertMarkdown(bad));
    const missing = copy(raw); delete missing.exert_steps[0].accepted;
    assert.throws(() => mingjiaoJiuyangExertReport([envelope(missing, c)], c));
    for (const [ability, variant] of [['powerup', 'then-shield'], ['shield', 'then-powerup']]) {
        const pair = pick(ability, variant), t = mingjiaoJiuyangExertReport([envelope(trace(pair), pair)], pair);
        assert.equal(t.effects.commands_attempted, 2); assert.equal(t.effects.commands_accepted, 2);
        assert.equal(t.effects.actor_neili_cost, 200); assert.equal(t.effects.weak_gain, 2);
        assert.equal(t.effects.buff_added.attack, 200); assert.equal(t.effects.buff_added.armor, 300);
        mingjiaoJiuyangExertMarkdown(t);
    }
    const low = pick('powerup', 'low30-breakup0');
    const noGain = mingjiaoJiuyangExertReport([envelope(trace(low, { weak: 0 }), low)], low);
    assert.equal(noGain.effects.weak_gain, 0); mingjiaoJiuyangExertMarkdown(noGain);
});

test('natural low and high expiry callbacks return exact offsets without clock shortcuts', () => {
    for (const [ability, variant] of [['powerup', 'low30-breakup1'], ['shield', '800']]) {
        const c = pick(ability, variant, 'lifecycle'), raw = trace(c), s = mingjiaoJiuyangExertReport([envelope(raw, c)], c);
        assert.equal(s.effects.callback_pairs, 1); assert.deepEqual(s.effects.buff_returned, s.effects.buff_added);
        assert.equal(raw.after[0].temp.apply.armor, 107); assert.equal(raw.after[0].temp.apply.attack, 7);
        assert.equal(s.effects.elapsed_wait.n, 1); assert.ok(s.effects.elapsed_wait.min >= c.parameters.observe_seconds);
        const md = mingjiaoJiuyangExertMarkdown(s); assert.match(md, /自然到期观察/); assert.match(md, /不缩短原时钟/);
        const early = copy(raw); early.callbacks[0].elapsed = early.callbacks[1].elapsed = 1;
        assert.throws(() => mingjiaoJiuyangExertReport([envelope(early, c)], c));
        const bad = copy(s); bad.effects.buff_returned.armor++;
        assert.throws(() => mingjiaoJiuyangExertMarkdown(bad));
    }
});

test('roar no-fight command refusal retains body fee and no invented gate event', () => {
    const c = pick('roar', 'no-fight'), raw = trace(c), s = mingjiaoJiuyangExertReport([envelope(raw, c)], c);
    assert.equal(s.effects.commands_accepted, 0); assert.equal(s.effects.commands_refused, 1); assert.equal(s.effects.launches, 0);
    assert.equal(s.effects.actor_neili_cost, 100); assert.equal(s.effects.actor_qi_cost, 10);
    assert.equal(raw.refusals.length, 1); assert.deepEqual(s.effects.roar_targets, {});
    assert.match(mingjiaoJiuyangExertMarkdown(s), /该拒绝保留真实费用/);
    const bad = copy(s); bad.effects.actor_neili_cost = 0;
    assert.throws(() => mingjiaoJiuyangExertMarkdown(bad));
    const fake = copy(raw); fake.refusals.push({ actor: raw.before[0].object, reason: '这里不能攻击别人! \n' });
    assert.throws(() => mingjiaoJiuyangExertReport([envelope(fake, c)], c));
});

test('roar same-family three roles and nonpositive d retain independent relationship facts', () => {
    const c = pick('roar', 'three-users'), raw = trace(c, { passed: [true, false] });
    const s = mingjiaoJiuyangExertReport([envelope(raw, c)], c), r = s.effects.roar_targets;
    assert.equal(r['1'].gate_passed, 1); assert.equal(r['2'].gate_passed, 0);
    assert.equal(r['1'].qi_input, 1500); assert.equal(r['1'].jing_wound_input, 1000);
    assert.equal(r['1'].jing_cost, 1000); assert.equal(r['1'].eff_jing_cost, 1000);
    assert.equal(r['1'].actor_fighting, 1); assert.equal(r['1'].actor_killing, 0); assert.equal(r['1'].target_killing, 1);
    assert.match(mingjiaoJiuyangExertMarkdown(s), /同门、第三角色/);
    const noDamage = pick('roar', 'damage-1'), nd = mingjiaoJiuyangExertReport([envelope(trace(noDamage), noDamage)], noDamage);
    assert.equal(nd.effects.qi_cost, 0); assert.equal(nd.effects.roar_targets['1'].gate_passed, 1);
    assert.equal(nd.effects.roar_targets['1'].actor_want, 1); assert.equal(nd.effects.roar_targets['1'].damaging, 0);
    assert.deepEqual(nd.effects.roar_targets['1'].source_damage, { '-1': 1 });
    assert.match(mingjiaoJiuyangExertMarkdown(nd), /d<=0仍可能过门并形成敌意/);
    const fake = copy(s); fake.effects.roar_targets['2'].gate_passed = 1;
    assert.throws(() => mingjiaoJiuyangExertMarkdown(fake));
});

test('unconscious roar separates nominal input, current clamp and asymmetric kill relations', () => {
    const c = pick('roar', 'unconscious'), raw = trace(c), s = mingjiaoJiuyangExertReport([envelope(raw, c)], c), r = s.effects.roar_targets['1'];
    assert.equal(r.qi_input, 1500); assert.equal(r.qi_cost, 1); assert.equal(r.jing_wound_input, 1000);
    assert.equal(r.jing_cost, 0); assert.equal(r.eff_jing_cost, 1000);
    assert.equal(r.actor_fighting, 1); assert.equal(r.target_fighting, 0); assert.equal(r.target_killing, 0);
    assert.match(mingjiaoJiuyangExertMarkdown(s), /当前精神毛损来自原创伤夹制/);
    const bad = copy(raw); bad.metrics[1].jing_cost = 1000;
    assert.throws(() => mingjiaoJiuyangExertReport([envelope(bad, c)], c));
});

test('mixed exceptional rows retain known classifications but all total costs stay null', () => {
    const c = pick('roar', '400'), s = mingjiaoJiuyangExertReport([envelope(trace(c), c), diagnostic(c, 'error', 1)], c);
    assert.equal(s.effects.actor_neili_cost, null); assert.equal(s.effects.roar_targets['1'].qi_cost, null);
    assert.equal(s.effects.roar_targets['1'].recorded, 1); assert.equal(s.effects.roar_targets['1'].gate_probability.trials, 1);
    assert.match(mingjiaoJiuyangExertMarkdown(s), /未知合计保留null/);
    const bad = copy(s); bad.effects.actor_qi_cost = 0;
    assert.throws(() => mingjiaoJiuyangExertMarkdown(bad));
});
