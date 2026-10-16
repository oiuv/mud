import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { scanSource } from './inventory.mjs';
import { mingjiaoShenghuoConditions, mingjiaoShenghuoSourcePaths, mingjiaoShenghuoAbsentPaths,
    mingjiaoShenghuoReviewedSourceHash, validateMingjiaoShenghuoRecord,
    validateMingjiaoShenghuoLoads, mingjiaoShenghuoEffects, mingjiaoShenghuoPublicSupports } from './school_mingjiao_shenghuo_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const ling = 'shenghuo-ling', god = 'shenghuo-shengong';
const catalog = { skills: [ling, god, ling + '/can'].map(id => {
    const path = `kungfu/skill/${id}.c`, bytes = read(path), parsed = scanSource(bytes.toString('utf8'));
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(bytes), entries: parsed.functions.map(fn =>
        ({ id: `${path}:${fn.line}:${fn.name}`, function: fn.name,
            role: fn.name === 'perform' ? 'perform' : 'combat_interface' })) };
}) };
const cases = mingjiaoShenghuoConditions(catalog, read);
const pick = (variant, method, suite = 'main') => {
    const c = cases.find(c => c.parameters.variant === variant && (!method || c.method === method) && c.parameters.suite === suite);
    assert.ok(c, variant); return c;
};
const copy = v => structuredClone(v);
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
function snapshot(cfg, side, p) {
    const properties = Object.entries(cfg.properties), s = {
        ...Object.fromEntries(properties.filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: Object.fromEntries(properties.filter(([k]) => k.includes('/') || k === 'character')),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, ghost: 0, living: 1, busy: cfg.busy ?? 0,
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: {}, preparation_order: [],
        learned: {}, conditions: null, craze: 0, max_craze: 5000, fighting_opponent: Number(p.fighting),
        killing_opponent: Number(p.fighting), effective_str: 56, effective_int: 40,
        effective_dex: 36 + Math.trunc(cfg.skills.dodge / 10), weapon: 'none', weapon_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
        weapon_damage: 0, weapon_flag: 0, ammunition: 0, temp: { user_setup: 1, apply: { armor: 100 } },
    };
    for (const [path, value] of Object.entries(cfg.temp ?? {})) { const [key, leaf] = path.split('/'); s.temp[key] ??= {}; s.temp[key][leaf] = value; }
    if (cfg.equipment) {
        s.weapon = cfg.equipment.type; s.weapon_damage = 25; s.weapon_flag = 4;
        s.weapon_details = { object: cfg.equipment.program + '#' + (200 + side), program: cfg.equipment.program,
            skill_type: cfg.equipment.type, flag: 4, damage: 25, weight: cfg.equipment.type === 'blade' ? 7000 : 6000,
            material: 'steel', rigidity: 0, consistence: 100, no_wield: 0 };
        s.temp.apply.damage = 25; s.temp.apply.dodge = -2;
    }
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, level]) =>
        [k, Math.trunc(level / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
    if (side && p.target_state === 'unconscious') { s.living = 0; s.qi = 0; s.jing = 0; }
    return s;
}
const action0 = { lvl: 180, force: 360, attack: 100, dodge: 75, damage: 130, parry: 150,
    action: '$N忽然低头，一个头锤向$n撞来，$n不动声色，向旁又是一让，突觉胸口一麻，\n$N手中$w急挥横扫，突然连翻三个空心筋斗，$w已到$n右肩', damage_type: '割伤' };
// These are synthetic, possible support witnesses. They are not original samples/RNG outcomes.
export function syntheticShenghuoTrace(c, { hit = false, trigger = false, canGate = false, weak = 0,
    publicDamage = true, targetBusy = false, callerSide = 0, run = c.parameters.suite } = {}) {
    const p = c.parameters, state = [snapshot(p.actor, 0, p), snapshot(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: p.expected, elapsed: 0.002,
        reason: '', ...(c.method === 'ordinary' ? {} : { command_accepted: Number(p.expected === 'observed') }), before: copy(state), immediate: [], after: [],
        metrics: [{}, {}], actions: [], attacks: [], passives: [], passive_events: [], dodge_checks: [], busy_calls: [],
        skill_messages: [], launches: [], refusals: [], interfaces: [], directs: [], defenses: [], dropped: [], callbacks: [],
        terminals: [],
        stack_terminal: { attacks: 0, passives: 0 }, skill_loads: [] };
    if (p.target_state === 'unconscious') raw.preparation = { before: snapshot(p.target, 1, { ...p, target_state: 'living' }),
        after: copy(state[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    const loadCfg = { skills: { sword: p.cache_loader_level, [ling]: p.cache_loader_level,
        force: p.cache_loader_level, [god]: p.cache_loader_level, unarmed: 200, dodge: 200, parry: 200 },
        mappings: {}, preparations: {}, properties: { ...p.actor.properties, jiali: 0 } };
    raw.skill_loads.push({ skill: ling, path: p.base_source.path, sha256: p.base_source.sha256,
        run_id: run, load_id: run + ':' + ling, command: 'enable parry ' + ling, state: snapshot(loadCfg, 0, { fighting: false }) });
    let attackSerial = 0, passiveSerial = 0;
    const attackStack = [], passiveStack = [];
    const flag = (s, k) => s.temp[ling]?.[k] ?? 0;
    const changeFlag = (key, value) => { state[0].temp[ling] ??= {}; if (value === undefined) delete state[0].temp[ling][key]; else state[0].temp[ling][key] = value; };
    const passive = (route, incoming, fn) => {
        const frame = { id: ++passiveSerial, parent_id: passiveStack.at(-1)?.id ?? 0, depth: passiveStack.length + 1,
            attack_id: attackStack.at(-1)?.attack_id ?? 0, route };
        raw.passive_events.push({ ...frame, phase: 'before' }); passiveStack.push(frame);
        const before = copy(state), result = fn(frame);
        raw.passives.push({ ...frame, actor: 0, target: 1, skill: route === 'martial' ? ling : god, incoming,
            factor: route === 'martial' ? 0 : 50, result, before, after: copy(state), neili_after: state[0].neili,
            target_eff_qi_after: state[1].eff_qi, target_busy_after: state[1].busy });
        raw.passive_events.push({ ...frame, phase: 'after' }); assert.equal(passiveStack.pop(), frame); return result;
    };
    const busyCall = (side, requested) => {
        raw.busy_calls.push({ side, caller_side: callerSide, requested, before: state[side].busy, after: requested,
            attack_id: attackStack.at(-1)?.attack_id ?? 0, parent_passive_id: passiveStack.at(-1)?.id ?? 0 });
        state[side].busy = requested;
    };
    const godCall = (route, incoming, allow) => passive(route, incoming, () => {
        const a = state[0], eligible = a.skills[god] >= 140 && incoming !== 0 && a.mappings.force === god
            && a.mappings.sword === ling && a.weapon === 'sword' && a.effective_skills[ling] >= 140
            && !flag(a, 'hit') && a.neili >= 200 && !flag(a, 'max_hit');
        if (!allow || !eligible) return 0;
        const n = Math.min(Math.trunc(a.skills[ling] / 40), 8); busyCall(0, 1); a.neili -= n * 20; changeFlag('hit', 1);
        for (let i = 0; i < n; i++) attack(false);
        changeFlag('hit'); return 1;
    });
    const attack = allow => {
        const frame = { attack_id: ++attackSerial, parent_attack_id: attackStack.at(-1)?.attack_id ?? 0,
            attack_depth: attackStack.length + 1 };
        raw.actions.push({ ...frame, actor: 0, target: 1, skill: ling, action: copy(action0), before: copy(state) });
        attackStack.push(frame); state[0].temp.fight = { attack: 100, dodge: 75, parry: 150 };
        const power = (lvl, bonus = 0) => {
            const p = lvl > 500 ? Math.trunc(lvl / 10) * lvl * lvl : Math.trunc(lvl ** 3 / 10);
            const b = Math.trunc((p + 6950000) / 30) * 36; return b + Math.trunc(b / 100) * bonus;
        };
        const ap = power(state[0].effective_skills.sword + (state[0].temp.apply.attack ?? 0), 100);
        const dp = power(state[1].effective_skills.dodge);
        for (const phase of ['base', 'settled']) raw.dodge_checks.push({ attack_id: frame.attack_id, actor: 0, target: 1,
            type: 0, skill: 0, phase, ap, dp: phase === 'settled' && state[1].busy ? Math.trunc(dp / 3) : dp, busy: state[1].busy });
        let damage = 0;
        if (hit) {
            let forceResult = 0;
            if (state[0].jiali && state[0].neili > state[0].jiali) forceResult = godCall('force', 56, allow && trigger);
            const bonus = 56 + forceResult, b = bonus + Math.trunc(action0.force * bonus / 100);
            const incoming = 12 + Math.trunc(12 * action0.damage / 100) + Math.trunc(b / 3);
            passive('martial', incoming, () => {
                state[1].qi -= incoming;
                if (flag(state[0], 'max_hit')) state[1].eff_qi -= incoming;
                return '\x1b[1;31m只听“噗嗤”一声，一股鲜血至$n\x1b[1;31m胸前射出！\n\x1b[0m';
            });
            const outcome = mingjiaoShenghuoPublicSupports(incoming, state[1]).find(v => publicDamage ? v.D > 0 && v.W === 0 : v.D === 0);
            assert.ok(outcome); damage = outcome.D; state[1].qi = outcome.qi; state[1].eff_qi = outcome.eff_qi; state[1].craze = outcome.craze;
        }
        raw.attacks.push({ ...frame, actor: 0, target: 1, type: 0, result: hit ? 0 : -1, damage,
            action_flag: 0, attack_usage: 'sword', attack_skill: ling, after: copy(state),
            neili: state[0].neili, apply_attack: state[0].temp.apply.attack ?? 0 });
        assert.equal(attackStack.pop(), frame); if (damage > 0) state[1].busy = 0;
    };
    if (p.expected === 'refused') {
        if (p.refusal_scope === 'command') { raw.reason = (p.outer_refusal === 'unmapped' ? '\x1b[256D\x1b[K' : '') + p.refusal;
            raw.refusals.push({ actor: state[0].object, reason: raw.reason }); state[0].temp.notify_fail = p.refusal; }
        else { raw.reason = p.refusal; raw.refusals.push({ actor: state[0].object, reason: p.refusal }); state[0].temp.notify_fail = p.refusal; }
    } else if (c.method === 'ordinary') attack(true);
    else if (c.method === 'perform') {
        raw.launches.push({ actor: state[0].object, skill: ling, argument: 'can right' }); raw.metrics[0].ability_launched = 1;
        raw.skill_messages.push({ side: 0, type: 'tell_object', text: canGate ? '完全无法看透，招式一滞。' : '打起精神小心接招。' });
        state[0].neili -= 300; changeFlag('hit', 1); if (canGate) changeFlag('max_hit', 1);
        state[0].temp.apply.attack = canGate ? Math.trunc(state[0].skills[ling] / 6) : 0;
        for (let i = 0; i < 7; i++) { if (targetBusy && state[1].busy === 0) busyCall(1, 1); attack(false); }
        changeFlag('hit', 0); changeFlag('max_hit'); state[0].temp.apply.attack = 0; busyCall(0, 1);
        if (state[0].effective_skills[ling] >= 120 || weak) state[0].learned[ling] = 1;
    } else {
        const result = godCall('interface', p.interface.damage, trigger);
        raw.interfaces.push({ ...p.interface, result, implemented_by: '/kungfu/skill/' + god });
        delete raw.interfaces[0].object; raw.interfaces[0].object = p.interface.object;
    }
    raw.immediate = copy(state); raw.after = copy(state);
    for (const side of [0, 1]) for (const k of health) {
        const diff = raw.before[side][k] - state[side][k];
        if (diff) raw.metrics[side][k + (diff > 0 ? '_cost' : '_recovery')] = Math.abs(diff);
    }
    for (const [key, value] of [['hit', 0], ['dodge', -1], ['parry', -2]]) {
        const n = raw.attacks.filter(e => e.result === value).length; if (n) raw.metrics[0][key] = n;
    }
    return raw;
}

test('42 finite source-pinned cases separate main1942/cold200 and smoke84; source change fails closed', () => {
    assert.equal(cases.length, 42); assert.equal(cases.filter(c => c.parameters.suite === 'main').length, 40);
    assert.equal(cases.filter(c => c.parameters.suite === 'main').reduce((n, c) => n + c.samples, 0), 1942);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2142);
    assert.equal(mingjiaoShenghuoConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 84);
    assert.equal(hash(JSON.stringify(mingjiaoShenghuoSourcePaths.map(p => [p, hash(read(p))]))), mingjiaoShenghuoReviewedSourceHash);
    assert.deepEqual(mingjiaoShenghuoAbsentPaths, []);
    assert.throws(() => mingjiaoShenghuoConditions(catalog, p => Buffer.concat([read(p), Buffer.from('x')])));
});
test('matrix actual skill gates, budgets and special effective level are distinct', () => {
    const c = pick('positive', 'perform'); assert.equal(c.parameters.level, 220);
    assert.equal(c.parameters.actor.skills.force / 2 + c.parameters.actor.skills[god], 350);
    assert.equal(pick('force349').parameters.actor.skills.force / 2 + 220, 349);
    assert.equal(pick('neili200').parameters.actor.properties.neili, 200);
    assert.equal(pick('ling279').parameters.actor.skills[ling] / 2, 139.5);
    assert.equal(cases[0].parameters.actor.properties.jiali, 0);
    assert.equal(cases[0].parameters.level, 200);
});
test('every matrix condition accepts a synthetic legal guard/dodge trace, not real data', () => {
    for (const c of cases) assert.ok(validateMingjiaoShenghuoRecord(syntheticShenghuoTrace(c), c), c.id);
});
test('ordinary recursive trigger uses original LIFO and eight additional attacks, fee160 not jiali450', () => {
    const c = pick('jiali50', 'ordinary'); // first is200 which is below original flvl gate
    const gated = syntheticShenghuoTrace(c, { hit: true, trigger: true });
    assert.equal(validateMingjiaoShenghuoRecord(gated, c).additional, 0);
    const high = cases.find(c => c.method === 'ordinary' && c.parameters.level === 400 && c.parameters.variant === 'jiali50');
    const r = syntheticShenghuoTrace(high, { hit: true, trigger: true }), observation = validateMingjiaoShenghuoRecord(r, high);
    assert.equal(observation.additional, 8); assert.equal(observation.force_triggered, 1);
    assert.equal(observation.max_depth, 2); assert.equal(r.metrics[0].neili_cost, 160);
    assert.equal(r.attacks.at(-1).attack_id, 1);
    for (const change of [r => r.metrics[0].neili_cost += 450, r => r.passive_events[1].parent_id = 0,
        r => r.attacks[0].parent_attack_id = 0, r => r.stack_terminal.passives = 1,
        r => r.actions[1].before[0].temp[ling].hit = 0]) {
        const bad = copy(r); change(bad); assert.throws(() => validateMingjiaoShenghuoRecord(bad, high));
    }
});
test('CAN seven attacks are protected in both gate branches; max_hit controls wounds only', () => {
    const c = cases.find(c => c.method === 'perform' && c.parameters.level === 400 && c.parameters.variant === 'positive');
    for (const canGate of [false, true]) {
        const r = syntheticShenghuoTrace(c, { hit: true, canGate }); const obs = validateMingjiaoShenghuoRecord(r, c);
        assert.equal(obs.primary, 7); assert.equal(obs.additional, 0); assert.equal(obs.force_triggered, 0);
        assert.equal(obs.ling_wound > 0, canGate); assert.equal(r.metrics[0].neili_cost, 300);
        const bad = copy(r); bad.actions[0].before[0].temp[ling].hit = 0;
        assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
    }
});
test('interface guard execution is observed, owner/result required; eligibility does not imply trigger', () => {
    const c = pick('neili200'), r = syntheticShenghuoTrace(c, { trigger: true, hit: true });
    const obs = validateMingjiaoShenghuoRecord(r, c); assert.equal(obs.additional, 8);
    assert.equal(r.immediate[0].neili, 40); assert.equal(r.passives.filter(e => e.route === 'force').length, 0);
    for (const mutate of [r => delete r.interfaces[0].result, r => r.interfaces[0].implemented_by = 0,
        r => r.passives.at(-1).incoming = 99]) { const bad = copy(r); mutate(bad); assert.throws(() => validateMingjiaoShenghuoRecord(bad, c)); }
    const g = pick('max-hit1'); assert.equal(validateMingjiaoShenghuoRecord(syntheticShenghuoTrace(g), g).force_triggered, 0);
});
test('joint public damage allows positive no-wound and zero-public-D with nonzero Ling injury; rejects fake loss/rage', () => {
    const c = cases[0];
    for (const publicDamage of [true, false]) {
        const r = syntheticShenghuoTrace(c, { hit: true, publicDamage }); const obs = validateMingjiaoShenghuoRecord(r, c);
        assert.ok(obs.ling_qi > 0); assert.equal(obs.public_damage > 0, publicDamage); assert.equal(obs.public_wound, 0);
        const bad = copy(r); bad.attacks[0].after[1].craze++;
        assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
        const fake = copy(r); fake.passives[0].after[1].qi--;
        assert.throws(() => validateMingjiaoShenghuoRecord(fake, c));
    }
});
test('cold caches require distinct actual runs and original first-role state, not upgraded globals', () => {
    const main = syntheticShenghuoTrace(cases[0]), cold = syntheticShenghuoTrace(pick('jiali50', 'ordinary', 'cold400'));
    assert.equal(validateMingjiaoShenghuoLoads([main, cold]).runs, 2);
    const bad = copy(cold); bad.skill_loads[0].run_id = 'main'; bad.skill_loads[0].load_id = 'main:' + ling;
    assert.throws(() => validateMingjiaoShenghuoLoads([main, bad]));
    const b = copy(main); b.skill_loads[0].state.mappings.force = god;
    assert.throws(() => validateMingjiaoShenghuoRecord(b, cases[0]));
});
test('missing arrays/metrics, foreign snapshot state, invalid fixed action and fake busy are rejected', () => {
    const c = cases[0], r = syntheticShenghuoTrace(c, { hit: true });
    for (const change of [r => delete r.actions, r => r.before[1].int = 39, r => r.actions[0].action.force++,
        r => r.passives[0].before[1].skills.force++, r => delete r.metrics[1].qi_cost,
        r => r.immediate[0].weapon_details.material = 'gold']) {
        const bad = copy(r); change(bad); assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
    }
});
test('220 weak is real zero/one support, 400 guaranteed; errors unknown not zero-damage observations', () => {
    const low = pick('positive', 'perform');
    for (const weak of [0, 1]) validateMingjiaoShenghuoRecord(syntheticShenghuoTrace(low, { weak }), low);
    const c = pick('grant0'), r = syntheticShenghuoTrace(c), e = { kind: 'sample', condition_id: c.id,
        method: c.method, outcome: 'error', reason: 'synthetic unexpected failure' };
    const effects = mingjiaoShenghuoEffects([r, e], c);
    assert.equal(effects.validated, 1); assert.equal(effects.unknown, 1); assert.equal(effects.acceptance.trials, 1);
    assert.equal(effects.target_cost.qi.n, 1); assert.equal(effects.force_trigger.trials, 0);
});
test('CAN busy source lowers DP to a third and original positive public damage clears final target busy', () => {
    const c = cases.find(c => c.method === 'perform' && c.parameters.level === 400 && c.parameters.variant === 'positive');
    const r = syntheticShenghuoTrace(c, { hit: true, targetBusy: true }); validateMingjiaoShenghuoRecord(r, c);
    assert.equal(r.busy_calls.filter(e => e.side === 1).length, 7); assert.equal(r.immediate[1].busy, 0);
    const noPublic = syntheticShenghuoTrace(c, { hit: true, targetBusy: true, publicDamage: false });
    validateMingjiaoShenghuoRecord(noPublic, c); assert.equal(noPublic.immediate[1].busy, 1);
    const bad = copy(r); bad.dodge_checks[1].dp = bad.dodge_checks[0].dp;
    assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
    const badBusy = copy(r); badBusy.immediate[1].busy = 1; badBusy.after[1].busy = 1;
    assert.throws(() => validateMingjiaoShenghuoRecord(badBusy, c));
});
test('dynamic global action is raw-loader supported and invariant within one run, not level-growth randomization', () => {
    const c = cases.find(c => c.method === 'ordinary' && c.parameters.level === 400 && c.parameters.variant === 'jiali0');
    const r = syntheticShenghuoTrace(c);
    const dynamic = { lvl: 250, force: 100, attack: 50, dodge: 33, parry: 33, damage: 50, skill_name: '极意',
        damage_type: '割伤', action: '$N凝神静气，使出极招\x1b[31m 圣火令法之极意 \x1b[0m' };
    r.actions[0].action = copy(dynamic);
    for (const s of [r.attacks[0].after[0], r.immediate[0], r.after[0]]) s.temp.fight = { attack: 50, dodge: 33, parry: 33 };
    const lvl = r.before[0].effective_skills.sword, raw = lvl > 500 ? Math.trunc(lvl / 10) * lvl * lvl : Math.trunc(lvl ** 3 / 10);
    const base = Math.trunc((raw + 6950000) / 30) * 36;
    for (const d of r.dodge_checks) d.ap = base + Math.trunc(base / 100) * 50;
    validateMingjiaoShenghuoRecord(r, c); validateMingjiaoShenghuoLoads([r, copy(r)]);
    const changed = copy(r); changed.actions[0].action.force = 101;
    validateMingjiaoShenghuoRecord(changed, c); assert.throws(() => validateMingjiaoShenghuoLoads([r, changed]));
    const bad = copy(r); bad.actions[0].action.force = 300;
    assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
    const badAP = copy(r); badAP.dodge_checks.forEach(d => d.ap++);
    assert.throws(() => validateMingjiaoShenghuoRecord(badAP, c));
});
test('ordinary direct call has no command receipt; command/actual interface receipts cannot be missing or invented', () => {
    const c = cases[0], raw = syntheticShenghuoTrace(c);
    assert.equal(Object.hasOwn(raw, 'command_accepted'), false); validateMingjiaoShenghuoRecord(raw, c);
    for (const value of [0, 1, null]) { const bad = copy(raw); bad.command_accepted = value;
        assert.throws(() => validateMingjiaoShenghuoRecord(bad, c)); }
    for (const c of [pick('positive', 'perform'), pick('max-hit1', 'interface')]) {
        const raw = syntheticShenghuoTrace(c); validateMingjiaoShenghuoRecord(raw, c);
        for (const mutate of [r => delete r.command_accepted, r => r.command_accepted = 0]) {
            const bad = copy(raw); mutate(bad); assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
        }
    }
});
test('ordinary busy context preserves member_array -1/0/1 without changing effect actor; command contexts remain player0', () => {
    const c = cases.find(c => c.method === 'ordinary' && c.parameters.level === 400 && c.parameters.variant === 'jiali50');
    for (const callerSide of [-1, 0, 1]) {
        const r = syntheticShenghuoTrace(c, { hit: true, trigger: true, callerSide });
        validateMingjiaoShenghuoRecord(r, c); assert.equal(r.busy_calls[0].side, 0);
        assert.equal(r.busy_calls[0].attack_id, 1); assert.equal(r.busy_calls[0].parent_passive_id, 1);
        for (const value of [2, null]) { const bad = copy(r); bad.busy_calls[0].caller_side = value;
            assert.throws(() => validateMingjiaoShenghuoRecord(bad, c)); }
    }
    for (const c of [pick('positive', 'perform'), pick('neili200', 'interface')]) for (const callerSide of [-1, 1]) {
        const raw = syntheticShenghuoTrace(c, { hit: true, trigger: true, callerSide });
        assert.throws(() => validateMingjiaoShenghuoRecord(raw, c));
    }
});
test('unmapped literal pins current UTF8 result and preserves raw cursor prefix separately from temp text', () => {
    const c = pick('sword-unmapped', 'perform'), r = syntheticShenghuoTrace(c);
    assert.equal(c.parameters.refusal, '你现在的(sword)中并没有这种外功。\n');
    assert.equal(r.reason, '\x1b[256D\x1b[K' + c.parameters.refusal);
    assert.equal(r.immediate[0].temp.notify_fail, c.parameters.refusal);
    const original = copy(r); validateMingjiaoShenghuoRecord(r, c); assert.deepEqual(r, original);
    const sgr = copy(r); sgr.reason = '\x1b[31m' + r.reason + '\x1b[0m'; sgr.refusals[0].reason = sgr.reason;
    validateMingjiaoShenghuoRecord(sgr, c);
    for (const literal of ['你现在的剑法(sword)中并没有这种外功。\n', '你现在的(sword)中没有这种外功。\n',
        '\x1b[1A' + c.parameters.refusal, '\x1b[2C' + c.parameters.refusal, c.parameters.refusal.trimEnd()]) {
        const bad = copy(r); bad.reason = literal; bad.refusals[0].reason = literal;
        bad.immediate[0].temp.notify_fail = literal; bad.after[0].temp.notify_fail = literal;
        assert.throws(() => validateMingjiaoShenghuoRecord(bad, c));
    }
    const inconsistent = copy(r); inconsistent.immediate[0].temp.notify_fail += '误文'; inconsistent.after[0].temp.notify_fail += '误文';
    assert.throws(() => validateMingjiaoShenghuoRecord(inconsistent, c));
    assert.ok(!mingjiaoShenghuoEffects([r], c).unknown_scopes.some(s => s.includes('pending')));
});
