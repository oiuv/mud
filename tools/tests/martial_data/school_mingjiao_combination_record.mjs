// UNREGISTERED. Missing producer contracts, not permission to synthesize them:
// NPC snapshots need actual effective_mappings (all stored keys, explicit LPC zero),
// effective_skills (raw-skill/stored-map key union), and preparation_order (actual keys).
// Natural chat choices need NPC before_state/after_state at the existing choice probe;
// a destroyed NPC's missing after_state must link the original same-stack death entry.
// Preparation.loaded_before/after must observe qishang-quan/shenghuo-ling, not Gumu's list.
// Everything else below reuses original runner/NPC observer/receiver fields.
import assert from 'node:assert/strict';
import { mingjiaoCombinationConditions } from './school_mingjiao_combination_cases.mjs';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';

const own = (o, k) => { assert.ok(o && Object.hasOwn(o, k), 'missing actual ' + k); return o[k]; };
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x), 'mapping required'); return x; };
const list = x => { assert.ok(Array.isArray(x), 'array required'); return x; };
const int = x => { assert.ok(Number.isSafeInteger(x), 'actual integer required'); return x; };
const count = x => { assert.ok(int(x) >= 0, 'nonnegative count'); return x; };
const zero = x => assert.ok(x === null || x === 0, 'explicit LPC zero');
const absent = x => x === null || x === 0;
const text = x => { assert.equal(typeof x, 'string'); return x; };
const copy = x => structuredClone(x);
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const metric = (m, k) => Object.hasOwn(map(m), k) ? count(m[k]) : 0;
const clock = (x, end) => { assert.ok(Number.isFinite(x) && x >= 0 && x <= end, 'actual clock'); return x; };
const cloneName = (name, program) => assert.ok(typeof name === 'string' && name.startsWith(program + '#')
    && /^\d+$/.test(name.slice(program.length + 1)), 'exact clone identity');
function npcSkillLoads(raw) {
    const loads = list(own(raw, 'skill_load_contexts'));
    assert.equal(loads.length, 2, 'both original skill-load observations');
    const before = list(own(raw, 'before'))[0]; map(before);
    const prep = map(own(map(own(raw, 'npc_observation')), 'preparation'));
    assert.deepEqual(own(prep, 'skill_load_contexts'), loads, 'same original USER load context');
    for (const [index, skill] of ['shenghuo-ling', 'qishang-quan'].entries()) {
        const load = map(loads[index]);
        assert.equal(own(load, 'skill'), skill);
        assert.equal(own(load, 'actor'), own(before, 'object'), 'connected USER owns initial load');
        assert.deepEqual(own(load, 'skills'), own(before, 'skills'), 'actual original USER skills at load');
        assert.ok([0, 1].includes(own(load, 'already_loaded')), 'actual prior load state');
        assert.equal(own(load, 'command'), 'test_interface');
        assert.equal(own(load, 'function'), 'valid_enable');
        assert.equal(own(load, 'argument'), skill === 'shenghuo-ling' ? 'sword' : 'cuff');
        assert.equal(own(load, 'result'), 1, 'actual original valid_enable result');
    }
}
function order(s) {
    map(own(s, 'preparations')); list(own(s, 'preparation_order'));
    assert.deepEqual([...s.preparation_order].sort(), Object.keys(s.preparations).sort(), 'actual preparation keys');
}
function point(s, object) {
    map(s); assert.equal(own(s, 'object'), object);
    const values = s.userp === 0 ? map(own(s, 'properties')) : s;
    for (const k of resources) {
        const value = own(values, k);
        // Xiaozhao never assigns neili; setup_char/setup_human do not fill it.
        // Keep serialized undefined/null distinct from an actual integer zero.
        if (s.userp === 0 && s.program === '/kungfu/class/mingjiao/xiaozhao' && k === 'neili' && value === null) continue;
        int(value);
    }
    return values;
}
function user(s, config, identity) {
    map(s); cloneName(own(s, 'object'), '/tests/actor');
    if (identity) assert.equal(s.object, identity);
    for (const k of ['userp', 'playerp', 'interactive']) assert.equal(own(s, k), 1);
    assert.equal(own(s, 'wizardp'), 0); assert.ok([0, 1].includes(own(s, 'living')));
    if (!absent(own(s, 'ghost'))) assert.equal(s.ghost, 1);
    if (!absent(own(s, 'busy'))) count(s.busy);
    if (!absent(own(s, 'conditions'))) map(s.conditions);
    for (const k of ['skills', 'mappings', 'temp', 'effective_skills', 'cultivation']) map(own(s, k));
    order(s); point(s, s.object);
    if (!config) return;
    assert.equal(s.living, 1); zero(s.ghost); zero(s.busy);
    for (const [k, v] of Object.entries(config.properties))
        assert.equal(own(k.includes('/') || k === 'character' ? s.cultivation : s, k), v, 'original USER input ' + k);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(s[k], config[k]);
    assert.equal(s.weapon, config.equipment?.type ?? 'none');
    assert.equal(s.effective_skills.force, 300);
    if (config.equipment) {
        map(own(s, 'weapon_details')); cloneName(s.weapon_details.object, '/tests/sword');
        assert.equal(s.weapon_details.skill_type, 'sword');
    } else assert.deepEqual(own(s, 'weapon_details'), {});
    assert.equal(s.effective_str, config.properties.str + Math.trunc(Math.max(0,
        ...['unarmed', 'cuff', 'finger', 'hand', 'claw', 'strike'].map(k => config.skills[k] ?? 0)) / 10));
    assert.equal(s.effective_dex, config.properties.dex + Math.trunc(config.skills.dodge / 10));
    for (const k of ['guarding', 'action_flag', 'combat_time']) if (Object.hasOwn(s.temp, k)) zero(s.temp[k]);
}
function account(before, after, metrics) {
    Object.values(map(metrics)).forEach(count);
    return Object.fromEntries(resources.map(k => {
        const decrease = metric(metrics, k + '_cost'), recovery = metric(metrics, k + '_recovery');
        assert.equal(before[k] - after[k], decrease - recovery, 'actual resource ledger ' + k);
        return [k, { decrease, recovery, net_decrease: before[k] - after[k] }];
    }));
}
function attacks(raw, allowed, metrics) {
    const items = list(own(raw, 'attacks'));
    for (const x of items) {
        assert.ok(allowed.some(([a, t]) => x.actor === a && x.target === t), 'attack participants');
        assert.ok([0, 1, 2].includes(own(x, 'type'))); assert.ok([0, -1, -2].includes(own(x, 'result')));
        count(own(x, 'damage')); if (x.result !== 0) assert.equal(x.damage, 0);
    }
    for (const [side, values] of metrics) {
        const ownAttacks = items.filter(x => x.actor === side);
        for (const [key, code] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(metric(values, key), ownAttacks.filter(x => x.result === code).length, key);
        for (const [key, code] of [['riposte', 1], ['quick', 2]])
            assert.equal(metric(values, key), ownAttacks.filter(x => x.type === code).length, key);
    }
    return items;
}
function combo(raw, c) {
    const p = c.parameters;
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(list(own(raw, k)).length, 2, k);
    for (const k of ['interfaces', 'launches', 'prepare_steps', 'attacks', 'callbacks', 'terminals', 'dropped']) list(own(raw, k));
    for (const k of ['launches', 'callbacks', 'terminals', 'dropped']) assert.deepEqual(raw[k], []);
    assert.deepEqual(raw.after, raw.immediate, 'no natural interval in combination sample');
    const accounts = [];
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        user(raw.before[side], cfg); user(raw.immediate[side], null, raw.before[side].object);
        for (const key of ['skills', 'mappings']) assert.deepEqual(raw.immediate[side][key], raw.before[side][key]);
        accounts.push(account(raw.before[side], raw.immediate[side], raw.metrics[side]));
        for (const key of ['heartbeats', 'direct', 'neili_cost', 'neili_recovery']) assert.equal(metric(raw.metrics[side], key), 0);
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    // force_me() returns original command evaluation cost; only the disposable
    // legacy view has booleans. Raw costs, including refusal zero, stay intact.
    const commands = raw.prepare_steps.map((s, i) => {
        const expected = p.prepare_commands?.[i]; assert.ok(expected, 'unplanned command');
        const cost = count(own(s, 'accepted')); text(own(s, 'reason'));
        assert.equal(Number(cost > 0), expected.accepted);
        assert.equal(s.reason === '', cost > 0, 'command reason and actual cost');
        order(s.before); order(s.after);
        return { action: s.action, accepted: Number(cost > 0), command_cost: cost, reason: s.reason };
    });
    validateWudangCombinationRecord({ ...raw, prepare_steps: raw.prepare_steps.map(s => ({ ...s, accepted: Number(s.accepted > 0) })) }, c);
    for (const s of [...raw.before, ...raw.immediate, ...raw.prepare_steps.flatMap(x => [x.before, x.after])]) order(s);
    if (c.method !== 'round') assert.deepEqual(raw.immediate[1], raw.before[1]);
    if (c.method === 'interface') {
        assert.deepEqual(raw.prepare_steps, []); assert.deepEqual(raw.immediate, raw.before);
        for (const m of raw.metrics) assert.ok(Object.values(m).every(x => x === 0));
    }
    const hitList = attacks(raw, [[0, 1], [1, 0]], raw.metrics.map((m, i) => [i, m]));
    if (c.method !== 'round') assert.equal(hitList.length, 0);
    else {
        const primary = hitList.filter(x => x.actor === 0 && x.target === 1);
        const prepared = raw.prepare_steps.at(-1).after;
        assert.deepEqual(raw.immediate[0].preparation_order, prepared.preparation_order);
        if (prepared.preparation_order.length !== 2) assert.ok(primary.length <= 1);
        assert.equal(metric(raw.metrics[0], 'neili_cost'), 0);
        const maxGuard = Math.max(0, Math.trunc(raw.before[1].effective_str * 3 / 4) - 1);
        if (raw.before[0].effective_str > maxGuard) assert.ok(primary.length > 0, 'impossible guarding');
        // The unchanged target has no previous guarding turn in this single
        // fight call; retain real counterattack handling in NPC bouts instead.
        assert.equal(hitList.length, primary.length, 'no preexisting target guarding in this fixed single round');
        const totalDamage = primary.reduce((n, x) => n + x.damage, 0);
        assert.equal(accounts[1].qi.decrease, totalDamage, 'single-round attack damage/resource correlation');
        for (const side of [0, 1]) for (const key of resources) {
            assert.equal(accounts[side][key].recovery, 0, 'no natural recovery interval');
            if (side === 0 || !['qi', 'eff_qi'].includes(key)) assert.equal(accounts[side][key].decrease, 0);
        }
        assert.ok(accounts[1].eff_qi.decrease <= totalDamage);
    }
    return { matched: true, method: c.method, commands, interface_result: c.method === 'interface' ? raw.interfaces[0].result : null,
        attacks: copy(hitList), resources: accounts, npc: null };
}

function npcState(s, cfg, initial = false) {
    map(s); cloneName(own(s, 'object'), cfg.path); assert.equal(own(s, 'program'), cfg.path);
    assert.equal(own(s, 'clone'), 1);
    for (const key of ['userp', 'interactive', 'wizardp']) assert.equal(own(s, key), 0);
    zero(own(s, 'playerp')); assert.ok([0, 1].includes(own(s, 'living')));
    if (!absent(own(s, 'busy'))) count(s.busy);
    if (!absent(own(s, 'conditions'))) map(s.conditions);
    if (!absent(own(s, 'ghost'))) assert.equal(s.ghost, 1);
    for (const key of ['skills', 'mappings', 'temp', 'learned', 'effective_skills', 'effective_mappings']) map(own(s, key));
    order(s); point(s, s.object);
    assert.deepEqual(Object.keys(s.effective_mappings).sort(), Object.keys(s.mappings).sort(), 'stored mapping key union');
    assert.deepEqual(Object.keys(s.effective_skills).sort(), [...new Set([...Object.keys(s.skills), ...Object.keys(s.mappings)])].sort());
    for (const [k, value] of Object.entries(s.effective_mappings))
        assert.ok(absent(value) || value === s.mappings[k], 'effective mapping must be stored or original zero');
    Object.values(s.effective_skills).forEach(int);
    // These nine original NPC mappings have state-independent valid_enable
    // results. Validate each actual snapshot, not just constructor output;
    // preparation changes do not disable a valid mapping. Temporary apply
    // values belong to this snapshot, so natural buffs are not locked away.
    const effective = { ...s.mappings };
    if (cfg.id === 'zhangwuji') { effective.dodge = null; effective.unarmed = null; }
    for (const [k, v] of Object.entries(effective)) absent(v) ? zero(s.effective_mappings[k]) : assert.equal(s.effective_mappings[k], v);
    for (const [k, v] of Object.entries(s.effective_skills)) assert.equal(v, Math.trunc((s.skills[k] ?? 0) / 2)
        + (typeof s.effective_mappings[k] === 'string' ? s.skills[s.effective_mappings[k]] : 0)
        + int(s.temp.apply?.[k] ?? 0), 'original effective skill ' + k);
    list(own(s, 'inventory')); list(own(s, 'callouts'));
    assert.equal(list(own(s, 'combat_callbacks')).length, cfg.original.callbacks.length);
    assert.deepEqual(own(s, 'combat_callback_owners'), cfg.original.callbacks.map(() => s.object));
    assert.ok(s.combat_callbacks.every(x => typeof x === 'string' && x.length));
    for (const item of s.inventory) {
        cloneName(item.object, item.program); assert.equal(item.clone, 1); assert.equal(item.environment, s.object);
        for (const k of ['equipped', 'consistence', 'skill_type']) own(item, k);
        map(item.weapon_prop); map(item.armor_prop);
    }
    if (!initial) return;
    assert.equal(s.living, 1); zero(s.ghost); zero(s.busy);
    assert.deepEqual(s.skills, cfg.original.skills); assert.deepEqual(s.mappings, cfg.original.mappings);
    assert.deepEqual(s.preparations, cfg.original.preparations); assert.deepEqual(s.learned, {});
    assert.deepEqual(s.callouts, []);
    for (const [k, v] of Object.entries(cfg.original.props)) assert.equal(own(s.properties, k), v, 'NPC original ' + k);
    for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing'])
        assert.equal(s.properties[k], cfg.original.props[k.includes('jing') ? 'max_jing' : 'max_qi'], 'original filled health ' + k);
    if (cfg.id === 'xiaozhao') {
        const exp = int(s.properties.combat_exp); assert.ok(exp >= 50000 && exp <= 59999, 'original random combat_exp');
        zero(own(s.properties, 'chat_chance_combat'));
        zero(own(s.properties, 'neili'));
    }
    const forces = { daijisi: 480, fanyao: 170, lengqian: 210, weiyixiao: 330, xiaozhao: 40,
        xiexun: 420, yangxiao: 480, yintianzheng: 420, zhangwuji: 540 };
    assert.equal(s.effective_skills.force, forces[cfg.id]);
    assert.deepEqual(s.inventory.map(i => i.program).sort(), [...cfg.original.gear].sort());
    assert.equal(own(s, 'secondary_weapon_object'), '');
    if (!cfg.original.wield) { assert.equal(s.weapon, 'none'); assert.equal(s.weapon_object, ''); }
    for (const item of s.inventory) {
        assert.equal(item.consistence, 100);
        if (item.program === cfg.original.wield) {
            assert.equal(item.equipped, 'wielded'); assert.equal(s.weapon_object, item.object);
            assert.equal(s.weapon, item.skill_type);
        } else assert.equal(item.equipped, 'worn');
    }
}
function npcBout(raw, c) {
    const p = c.parameters, cfg = p.npc;
    for (const key of ['before', 'after', 'metrics']) assert.equal(list(own(raw, key)).length, 2);
    const accounts = [];
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        user(raw.before[side], config); user(raw.after[side], null, raw.before[side].object);
        accounts.push(account(raw.before[side], raw.after[side], raw.metrics[side]));
    }
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.after[1], raw.before[1]); assert.ok(Object.values(raw.metrics[1]).every(v => v === 0));
    const n = map(own(raw, 'npc_observation')), b = map(own(raw, 'npc_bout'));
    npcState(own(n, 'before'), cfg, true);
    const npcObject = n.before.object, identity = (x, withTarget = false) => {
        assert.ok([-1, 0].includes(own(x, 'actor')));
        assert.equal(own(x, 'actor_object'), x.actor === -1 ? npcObject : raw.before[0].object);
        if (withTarget) { assert.equal(own(x, 'target'), x.actor === -1 ? 0 : -1);
            assert.equal(own(x, 'target_object'), x.target === -1 ? npcObject : raw.before[0].object); }
    };
    assert.equal(n.target_object, raw.before[0].object); assert.match(n.room, /^\/tests\//);
    assert.equal(b.npc_object, npcObject); assert.equal(b.user_object, raw.before[0].object);
    assert.equal(b.bystander_object, raw.before[1].object); assert.match(b.bystander_room, /^\/tests\//);
    assert.notEqual(b.bystander_room, n.room); assert.equal(b.npc_gross_resources, 'not_observed');
    assert.equal(b.first_actor, raw.index % 2 ? 0 : -1); assert.equal(b.duration_limit_seconds, p.observe_seconds);
    for (const key of ['heartbeats', 'chat_choices', 'terminal_events', 'corpse_returns', 'corpses']) list(own(b, key));
    assert.ok(b.heartbeats.length); assert.equal(b.heartbeats[0].actor, b.first_actor);
    let previous = 0;
    for (const h of b.heartbeats) { identity(h); assert.ok(clock(h.elapsed, raw.elapsed) >= previous); previous = h.elapsed;
        if (!absent(own(h, 'busy'))) count(h.busy); }
    for (const key of ['heartbeats', 'scans', 'chats', 'choices', 'hit', 'dodge', 'parry', 'quick', 'riposte', 'direct', 'rounds', 'force', 'martial']) count(own(b.npc_metrics, key));
    const npcBeats = b.heartbeats.filter(h => h.actor === -1).length;
    assert.equal(b.npc_metrics.heartbeats, npcBeats);
    assert.equal(metric(raw.metrics[0], 'heartbeats'), b.heartbeats.length - npcBeats);
    assert.ok(b.npc_metrics.chats <= b.npc_metrics.scans && b.npc_metrics.scans <= npcBeats);
    assert.equal(b.npc_metrics.choices, b.chat_choices.length); assert.ok(b.chat_choices.length <= b.npc_metrics.chats);
    for (const side of ['npc', 'user']) clock(own(b.busy_seconds, side), raw.elapsed);
    const terminalLink = (x, kind, index) => {
        if (own(x, 'return_observation') === 'observed') { assert.equal(own(x, 'terminal_event_index'), -1); return false; }
        assert.equal(x.return_observation, 'not_observed'); assert.equal(x.actor, -1);
        assert.equal(own(x, 'result'), 'not_observed');
        const i = count(own(x, 'terminal_event_index')), e = b.terminal_events[i]; map(e);
        assert.equal(e.kind, 'death'); assert.equal(e.actor, -1); assert.equal(e.actor_object, npcObject);
        assert.equal(e['pending_' + kind + '_index'], index); assert.equal(e.heartbeat_index, x.heartbeat_index);
        assert.ok(e.elapsed >= x.elapsed); assert.equal(b.terminal, 'death'); zero(own(n, 'after'));
        return true;
    };
    const selected = new Set();
    let previousPreparation = copy(n.before.preparations);
    for (const [index, x] of b.chat_choices.entries()) {
        identity(x, true); assert.equal(x.actor, -1); clock(x.elapsed, raw.elapsed);
        const h = b.heartbeats[count(x.heartbeat_index)]; assert.ok(h && h.actor === -1 && h.elapsed <= x.elapsed);
        assert.ok(!selected.has(x.heartbeat_index)); selected.add(x.heartbeat_index);
        zero(x.busy); assert.equal(x.fighting, 1); assert.equal(x.owner, npcObject);
        count(x.index); assert.ok(x.index < cfg.original.callbacks.length);
        assert.equal(x.repr, n.before.combat_callbacks[x.index]); npcState(own(x, 'before_state'), cfg);
        assert.equal(x.before_state.object, npcObject);
        assert.deepEqual(x.before_state.skills, cfg.original.skills);
        assert.deepEqual(x.before_state.mappings, cfg.original.mappings);
        if (cfg.id === 'fanyao') assert.deepEqual(x.before_state.preparations, previousPreparation,
            'natural preparation chain cannot reset or invent a preceding choice');
        if (terminalLink(x, 'choice', index)) { zero(own(x, 'after_state')); continue; }
        npcState(own(x, 'after_state'), cfg); assert.equal(x.after_state.object, npcObject);
        const [entry, key, value] = cfg.original.callbacks[x.index];
        if (entry === 'command') count(own(x, 'result'));
        else {
            assert.equal(entry, 'prepare_skill'); zero(own(x, 'result'));
            assert.deepEqual(x.after_state.preparations, { ...x.before_state.preparations, [key]: value });
        }
        assert.deepEqual(x.after_state.skills, cfg.original.skills); assert.deepEqual(x.after_state.mappings, cfg.original.mappings);
        previousPreparation = copy(x.after_state.preparations);
    }
    const hitList = attacks(raw, [[-1, 0], [0, -1]], [[-1, b.npc_metrics], [0, raw.metrics[0]]]);
    for (const key of ['npc_direct', 'attack_rounds', 'passives', 'actions']) list(own(raw, key));
    assert.ok(hitList.length + raw.npc_direct.length > 0, 'heartbeats alone do not prove combat');
    for (const x of [...hitList, ...raw.npc_direct, ...raw.passives, ...raw.actions]) identity(x, true);
    assert.ok(raw.actions.length >= hitList.length);
    for (const x of raw.actions) assert.equal(typeof own(map(x.action), 'action'), 'string');
    for (const [i, x] of raw.attack_rounds.entries()) {
        identity(x); clock(x.elapsed, raw.elapsed); count(x.before);
        const h = b.heartbeats[count(x.heartbeat_index)]; assert.ok(h && h.actor === x.actor && h.elapsed <= x.elapsed);
        if (terminalLink(x, 'round', i)) assert.equal(x.after, 'not_observed'); else { int(x.after); int(x.result); }
    }
    for (const x of raw.npc_direct) { assert.equal(x.actor, -1); int(x.damage); int(x.type); int(x.percent); }
    for (const x of raw.passives) {
        assert.equal(x.actor, -1); assert.ok(['force', 'martial'].includes(x.route)); int(x.incoming);
        if (!absent(x.factor)) int(x.factor); own(x, 'result');
        assert.ok(Object.values(cfg.original.mappings).includes(x.skill));
        if (x.route === 'force') assert.equal(x.skill, cfg.original.mappings.force);
        for (const phase of ['before', 'after']) {
            assert.equal(list(x[phase]).length, 2); point(x[phase][0], x.actor_object); point(x[phase][1], x.target_object);
        }
    }
    for (const [side, m] of [[-1, b.npc_metrics], [0, raw.metrics[0]]]) {
        assert.equal(metric(m, 'direct'), raw.npc_direct.filter(e => e.actor === side).length);
        assert.equal(metric(m, 'rounds'), raw.attack_rounds.filter(e => e.actor === side).length);
        for (const route of ['force', 'martial']) assert.equal(metric(m, route), raw.passives.filter(e => e.actor === side && e.route === route).length);
    }
    if (!absent(own(n, 'after'))) {
        npcState(n.after, cfg); assert.equal(n.after.object, npcObject);
        assert.deepEqual(n.after.skills, cfg.original.skills); assert.deepEqual(n.after.mappings, cfg.original.mappings);
        assert.deepEqual(n.after.preparations, cfg.id === 'fanyao' ? previousPreparation : cfg.original.preparations,
            'NPC preparation changes must come from the original natural choices');
    }
    assert.ok(['time_limit', 'unconscious', 'death'].includes(b.terminal));
    for (const [i, e] of b.terminal_events.entries()) {
        identity(e); clock(e.elapsed, raw.elapsed); assert.ok(['unconscious', 'death'].includes(e.kind));
        e.actor === -1 ? npcState(e.state_before, cfg) : user(e.state_before);
        const hp = point(e.state_before, e.actor_object);
        assert.ok(hp.qi < 0 || hp.jing < 0, 'neutral ordinary-bout terminal requires original dying health');
        assert.ok(b.heartbeats[count(e.heartbeat_index)]?.elapsed <= e.elapsed);
        for (const [kind, calls] of [['choice', b.chat_choices], ['round', raw.attack_rounds]]) {
            const pending = int(own(e, 'pending_' + kind + '_index')); assert.ok(pending >= -1);
            if (pending >= 0) { const x = calls[pending]; map(x); assert.equal(e.kind, 'death'); assert.equal(e.actor, -1);
                assert.equal(x.return_observation, 'not_observed'); assert.equal(x.terminal_event_index, i);
                assert.equal(x.heartbeat_index, e.heartbeat_index); assert.equal(x.actor_object, e.actor_object); }
        }
    }
    if (b.terminal === 'time_limit') {
        assert.deepEqual(b.terminal_events, []); assert.equal(b.winner, 'none');
        assert.ok(raw.elapsed >= p.observe_seconds && npcBeats > 0 && metric(raw.metrics[0], 'heartbeats') > 0);
        assert.equal(n.after?.living, 1); assert.equal(raw.after[0].living, 1);
    } else {
        const last = b.terminal_events.at(-1); assert.ok(last); assert.equal(last.kind, b.terminal);
        assert.equal(b.winner, last.actor === -1 ? 'user' : 'npc');
        if (last.actor === -1) {
            if (last.kind === 'death') zero(n.after);
            else { assert.equal(cfg.id, 'xiaozhao', 'other eight NPCs forward unconscious to die'); assert.equal(n.after?.living, 0); }
        } else assert.ok(raw.after[0].living === 0 || raw.after[0].ghost === 1);
    }
    const deaths = b.terminal_events.filter(e => e.kind === 'death');
    assert.equal(absent(n.after), deaths.some(e => e.actor === -1));
    assert.deepEqual(b.corpse_returns.map(x => x.victim_object).sort(), deaths.map(x => x.actor_object).sort());
    for (const x of b.corpse_returns) if (!absent(own(x, 'result'))) cloneName(x.result, '/clone/misc/corpse');
    assert.deepEqual(b.corpses.map(x => x.object).sort(), b.corpse_returns.filter(x => !absent(x.result)).map(x => x.result).sort());
    const prep = map(own(n, 'preparation'));
    assert.equal(prep.entry_player, raw.before[0].object); assert.ok([raw.before[0].object, npcObject].includes(prep.returned_player));
    assert.equal(prep.initializer_actor, 'not_observed'); assert.ok([0, 1].includes(prep.npc_heartbeat_before));
    assert.equal(prep.npc_heartbeat_paused, 0); assert.equal(prep.blueprint_heartbeat, 0);
    assert.deepEqual(prep.constructor_callbacks, []); assert.deepEqual(prep.created_npcs, [npcObject]);
    for (const key of ['loaded_before', 'loaded_after']) {
        list(prep[key]); assert.equal(new Set(prep[key]).size, prep[key].length);
        assert.ok(prep[key].every(x => ['/kungfu/skill/qishang-quan', '/kungfu/skill/shenghuo-ling'].includes(x)));
    }
    assert.ok(prep.loaded_before.every(x => prep.loaded_after.includes(x)));
    const owned = [npcObject, ...n.before.inventory.map(x => x.object)];
    for (const corpse of b.corpses) {
        cloneName(corpse.object, '/clone/misc/corpse'); assert.equal(corpse.program, '/clone/misc/corpse');
        assert.equal(corpse.origin, 'original_make_corpse_return'); assert.match(corpse.environment, /^\/tests\//);
        assert.ok(deaths.some(e => e.actor_object === corpse.victim_object));
        list(corpse.inventory_objects).forEach(x => assert.ok(owned.includes(x) || x === raw.before[0].weapon_details.object));
        owned.push(corpse.object);
    }
    assert.equal(n.destroyed, 1); assert.equal(n.cleanup.enemies_removed, 1);
    assert.deepEqual(n.cleanup.objects.map(x => x.object).sort(), [...new Set(owned)].sort());
    for (const x of n.cleanup.objects) { assert.ok([0, 1].includes(x.existed_before_cleanup)); assert.equal(x.destroyed, 1);
        if (x.object === npcObject) assert.equal(x.existed_before_cleanup, Number(!absent(n.after))); }
    assert.deepEqual(n.cleanup.remaining_callbacks, []);
    const end = !absent(n.after) ? n.after.properties : null;
    const terminal = b.terminal_events.filter(e => e.actor === -1).at(-1)?.state_before.properties ?? null;
    return { matched: true, method: 'bout', commands: [], interface_result: null, attacks: copy(hitList), resources: accounts,
        npc: { winner: b.winner, terminal: b.terminal, elapsed: raw.elapsed, heartbeats: b.heartbeats.length,
            choices: copy(b.chat_choices), npc_gross_resources: 'not_observed',
            endpoint_net_loss: Object.fromEntries(resources.map(k => [k, end && Number.isSafeInteger(n.before.properties[k])
                && Number.isSafeInteger(end[k]) ? n.before.properties[k] - end[k] : null])),
            preterminal_net_loss: Object.fromEntries(resources.map(k => [k, terminal && Number.isSafeInteger(n.before.properties[k])
                && Number.isSafeInteger(terminal[k]) ? n.before.properties[k] - terminal[k] : null])) } };
}

export function createMingjiaoCombinationRecordValidator(catalog, readSource, { smoke = false } = {}) {
    const plans = mingjiaoCombinationConditions(catalog, readSource, { smoke });
    const canonical = new Map(plans.map(c => [c.id, c]));
    const condition = c => { assert.ok(canonical.has(c?.id), 'unreviewed combination/NPC condition');
        assert.deepEqual(c, canonical.get(c.id), 'original finite condition and run mode'); return c.parameters; };
    const check = (raw, c) => {
        condition(c); map(raw); assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), c.id);
        assert.equal(own(raw, 'method'), c.method); count(own(raw, 'index')); assert.ok(raw.index < c.samples);
        assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0); text(own(raw, 'reason'));
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(own(raw, 'outcome')));
        if (raw.outcome === 'error' || raw.outcome === 'not_applicable') { assert.ok(raw.reason.trim()); return null; }
        assert.equal(raw.outcome, c.parameters.expected, 'expected actual branch');
        if (raw.outcome === 'refused') assert.ok(raw.reason.trim()); else assert.equal(raw.reason, '');
        if (c.method === 'bout') { npcSkillLoads(raw); return npcBout(raw, c); }
        return combo(raw, c);
    };
    check.validateCondition = condition;
    return check;
}
