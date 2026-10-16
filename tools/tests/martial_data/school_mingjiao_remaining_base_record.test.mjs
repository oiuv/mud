// Hand-written synthetic paths only. No driver, sampled outcome or probability claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { mingjiaoRemainingBaseProfiles, mingjiaoRemainingBaseConditions } from './school_mingjiao_remaining_base_cases.mjs';
import { validateMingjiaoRemainingBaseRecord as check } from './school_mingjiao_remaining_base_record.mjs';

const root = new URL('../../../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root));
const sha = x => createHash('sha256').update(x).digest('hex');
const copy = x => structuredClone(x);
const catalog = { skills: [...mingjiaoRemainingBaseProfiles.map(p => p.skill), 'hanbing-mianzhang'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', bytes = read(path), sha256 = sha(bytes);
    const entries = bytes.toString().split('\n').flatMap((line, i) => {
        const m = /^(?:int|mapping|mixed)\s+(valid_enable|valid_learn|practice_skill|query_action|hit_ob)\(/.exec(line);
        return m ? [{ id: `${path}:${i + 1}:${m[1]}`, function: m[1],
            evidence: { path, line: i + 1, sha256 } }] : [];
    });
    return { id, path, sha256, entries };
}) };
const formal = mingjiaoRemainingBaseConditions(catalog, read);
const smoke = mingjiaoRemainingBaseConditions(catalog, read, { smoke: true });
const select = (skill, ability, variant, level = 200, mode = 'formal') => {
    const c = (mode === 'smoke' ? smoke : formal).find(x => x.parameters.skill === skill && x.parameters.ability === ability
        && x.parameters.variant === variant && x.parameters.level === level);
    assert.ok(c); return c;
};
function state(config, side, fighting) {
    const s = { ...copy(config.properties), object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0, living: 1, not_living: null,
        fighting_opponent: Number(fighting), killing_opponent: Number(fighting), busy: config.busy ?? null,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        conditions: null, learned: {}, learned_raw: null, learned_kind: 'undefined',
        effective_int: config.properties.int + Math.trunc((config.skills.literate ?? 0) / 10),
        effective_dex: config.properties.dex + Math.trunc(config.skills.dodge / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([k, v]) => [k,
            Math.trunc(v / 2) + (config.skills[config.mappings[k]] ?? 0) - Number(k === 'dodge' && !!config.equipment)])),
        cultivation: { ...Object.fromEntries(['class', 'family/family_name', 'reborn', 'breakup', 'doing', 'env/no_learn',
            'env/auto_regenerate', 'immune/poison', 'special_skill/piyi'].map(k => [k, config.properties[k]])),
            ...Object.fromEntries(['special_skill/wuxing', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai',
                'tattoo/tattoo_str', 'tattoo/tattoo_int', 'tattoo/tattoo_con', 'tattoo/tattoo_dex'].map(k => [k, null])) },
        temp: copy(config.temp ?? {}),
        weapon: 'none', weapon_details: {}, handing: 'none', handing_details: {}, secondary_weapon: 'none', secondary_weapon_details: {},
        weapon_flag: 0, weapon_damage: 0, ammunition: 0 };
    if (config.equipment) {
        const type = config.equipment.type;
        s.weapon = type; s.weapon_flag = type === 'sword' ? 4 : 16; s.weapon_damage = 50;
        s.weapon_details = { object: `/tests/${type}#${300 + side}`, program: '/tests/' + type, skill_type: type,
            flag: s.weapon_flag, weight: 3000, damage: 50, consistence: 100, rigidity: null, no_wield: null, material: null };
    }
    return s;
}
const poison = {
    'hanbing-mianzhang': ['ice_poison', '寒冰掌毒', '$n忽然神色大变，一个寒战，退了几步。\n', 4],
    'tougu-zhen': ['tougu_zhen', '透骨寒针之扰', '$n只感到从伤口处传来一阵切骨之痛，看来是受了对方透骨针内劲的干扰。\n', 2],
    'yinfeng-dao': ['yinfeng_dao', '阴风刮骨之扰', '$n只感一阵刮骨之痛，看来是受了对方阴风刀内劲的干扰。\n', 2],
};
function trace(c, options = {}) {
    const p = c.parameters, raw = { kind: 'sample', condition_id: c.id, index: 0, method: c.method,
        outcome: 'observed', reason: '', elapsed: 0.02,
        before: [state(p.actor, 0, p.fighting), state(p.target, 1, p.fighting)],
        metrics: [{}, {}], immediate_metrics: [{}, {}], actions: [], attacks: [], directs: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], interface_steps: [], busy_calls: [], skill_messages: [],
        launches: [], refusals: [], terminals: [], condition_events: [], condition_heartbeats: [] };
    let current = copy(raw.before);
    const charge = (side, key, amount) => { current[side][key] -= amount; if (amount) raw.metrics[side][key + '_cost'] = (raw.metrics[side][key + '_cost'] ?? 0) + amount; };
    const passive = (result, route) => {
        const a = copy(current), source = poison[p.skill];
        if (source && result) current[1].conditions = { [source[0]]: { id: 'left', name: source[1], level: 10, remain: source[3] * 10 } };
        if (p.skill === 'xiaoyao-jian' && result) {
            charge(0, 'neili', 80); current[1].busy = 2;
            raw.busy_calls.push({ side: 1, caller_side: 0, requested: 2, before: a[1].busy, after: 2 });
        }
        const value = source && result ? source[2] : result;
        raw.passives.push({ actor: 0, target: 1, skill: p.skill, incoming: p.interface?.damage ?? 20,
            factor: route === 'martial' ? 0 : p.interface?.factor ?? null, route, result: value, before: a, after: copy(current),
            neili_after: current[0].neili, target_eff_qi_after: current[1].eff_qi, target_busy_after: current[1].busy });
        return value;
    };
    if (c.method === 'interface') {
        raw.command_accepted = options.cost ?? 23;
        raw.command_context = { action: p.action, actor: current[0].object, force_me_source: '/feature/command' };
        let result = Object.hasOwn(options, 'result') ? options.result : 1;
        if (p.interface.function === 'hit_ob') result = passive(result, 'interface');
        else if (p.interface.function === 'practice_skill') {
            charge(0, 'qi', options.qi ?? 0); charge(0, 'neili', options.neili ?? 0);
        }
        raw.interfaces = [{ object: p.interface.object, function: p.interface.function, implemented_by: p.interface.object, result,
            ...(p.interface.function === 'hit_ob' ? { damage: p.interface.damage, factor: p.interface.factor ?? null } : {}) }];
        if (p.interface.function !== 'hit_ob' && !result) { raw.outcome = 'refused'; raw.reason = '原接口拒绝（合成）\n'; }
        raw.interface_steps = [{ command: 'test_interface', entry_actor: current[0].object, return_actor: current[0].object,
            before: copy(raw.before[0]), after: copy(current[0]), result, implemented_by: p.interface.object,
            reason: raw.reason, messages: [] }];
    } else if (c.method === 'practice') {
        raw.command_accepted = options.cost ?? 23;
        charge(0, 'qi', options.qi ?? 0); charge(0, 'neili', options.neili ?? 0);
        if (options.gain) { current[0].learned_kind = 'mapping'; current[0].learned = { [p.skill]: options.gain }; current[0].learned_raw = copy(current[0].learned); }
        else { raw.outcome = 'refused'; raw.reason = '你的火候不够（合成）\n'; }
        raw.command_context = { action: p.action, actor: current[0].object, force_me_source: '/feature/command', command_source: '/cmds/skill/practice.c' };
        raw.practice_step = { before: copy(raw.before), after: copy(current), accepted: raw.command_accepted, reason: raw.reason };
    } else {
        raw.ordinary_step = { actor: 0, target: 1, type: 0, result: null, caller_side: -1 };
        raw.dodge_checks = ['base', 'settled'].map(phase => ({ actor: 0, target: 1, type: 0, phase,
            ap: 1000, dp: 800, skill: null, busy: current[1].busy }));
        const usage = current[0].weapon !== 'none' ? current[0].weapon : Object.keys(current[0].preparations)[0] ?? 'unarmed';
        raw.actions = [{ actor: 0, target: 1, skill: current[0].mappings[usage] ?? null,
            action: { action: '纯合成所选动作，不宣称原生', force: 100, damage: 0 } }];
        const hit = !!options.hit || !!options.seed;
        if (hit && current[0].jiali > 0) {
            const before = copy(current); charge(0, 'neili', current[0].jiali);
            raw.passives.push({ actor: 0, target: 1, skill: 'shenghuo-xinfa', route: 'force',
                incoming: 20, factor: current[0].jiali, result: 0, before, after: copy(current),
                neili_after: current[0].neili, target_eff_qi_after: current[1].eff_qi, target_busy_after: current[1].busy });
        }
        if (options.seed) passive(1, 'martial');
        if (options.busy) passive(1, 'martial');
        if (hit && !options.seed && !options.busy && current[0].mappings[usage]) passive(null, 'martial');
        raw.busy_calls.forEach(x => { x.caller_side = -1; });
        if (hit) { charge(1, 'qi', 20); charge(1, 'eff_qi', 10); }
        raw.attacks = [{ actor: 0, target: 1, type: 0, result: hit ? 0 : -1, damage: hit ? 20 : 0 }];
        if (hit && current[1].mappings.parry) raw.defenses = [{ actor: 0, target: 1,
            skill: current[1].mappings.parry, incoming: 20, result: null, route: 'ordinary' }];
        raw.metrics[0][hit ? 'hit' : 'dodge'] = 1;
    }
    if (c.method === 'condition') {
        const source = poison[p.skill], name = source[0], seed = current[1].conditions?.[name] ?? 0;
        current.forEach(s => { s.fighting_opponent = 0; s.killing_opponent = 0; });
        raw.condition_seed = { condition_name: name, state: copy(seed), seeded: Number(!!seed),
            combat_stopped_after_seed: [1, 1], enemy_counts: [0, 0], killer_counts: [0, 0], elapsed: 0.01 };
        raw.condition_terminal = seed ? 'removed' : 'no_seed'; raw.condition_lifecycle_complete = Number(!!seed);
    }
    raw.immediate = copy(current); raw.immediate_metrics = copy(raw.metrics);
    if (c.method === 'condition' && options.seed) {
        const source = poison[p.skill], name = source[0], protectedVictim = !!p.target.temp?.nopoison || p.target.properties['immune/poison'] === -1;
        const ticks = protectedVictim ? 1 : source[3];
        for (let i = 0; i < ticks; i++) {
            const hb = { side: 1, before: copy(current[1]), elapsed_before: 1 + i * 6, elapsed: 1.01 + i * 6,
                wall_time_before: 1000 + i * 6, wall_time_after: 1000 + i * 6, event_count_before: raw.condition_events.length };
            raw.condition_events.push({ side: 1, name, daemon: '/kungfu/condition/' + name, phase: 'before', flag: 0,
                state: copy(current[1]), elapsed: hb.elapsed_before + 0.001 });
            const last = i === ticks - 1;
            if (!protectedVictim) {
                charge(1, 'qi', 10); charge(1, 'eff_qi', 5); charge(1, 'jing', 5); charge(1, 'eff_jing', 2);
                if (!last) current[1].conditions[name].remain -= 10;
            } else if (p.target.properties['immune/poison'] === -1) current[1].conditions[name].remain = 0;
            raw.condition_events.push({ side: 1, name, daemon: '/kungfu/condition/' + name, phase: 'after', flag: last ? 0 : 3,
                state: copy(current[1]), elapsed: hb.elapsed_before + 0.002 });
            if (last) current[1].conditions = 0;
            if (options.recovery && last) { current[1].qi += 5; raw.metrics[1].qi_recovery = (raw.metrics[1].qi_recovery ?? 0) + 5; }
            hb.after = copy(current[1]); hb.event_count_after = raw.condition_events.length;
            raw.condition_heartbeats.push(hb); raw.metrics[1].heartbeats = i + 1;
        }
        raw.elapsed = raw.condition_heartbeats.at(-1).elapsed + 0.01;
    }
    raw.after = copy(current);
    return raw;
}
const bad = (c, raw, mutate) => { const r = copy(raw); mutate(r); assert.throws(() => check(r, c)); };

test('hand-written ordinary and common parry paths preserve actual roles, mapped fallback and no command fee', () => {
    for (const [skill, ability, variant] of [['pili-quan', 'ordinary', 'baseline'], ['xiaoyao-jian', 'parry', 'mapped'],
        ['pili-quan', 'ordinary', 'unmapped-control'], ['pili-quan', 'ordinary', 'no-prepare-control']]) {
        const c = select(skill, ability, variant), r = trace(c), e = check(r, c);
        assert.equal(e.command_cost, null); assert.equal(e.actual_calls.attacks, 1);
        bad(c, r, x => { x.command_accepted = 1; }); bad(c, r, x => { x.attacks[0].actor = 1; });
        bad(c, r, x => { x.actions[0].skill = 'invented-skill'; });
    }
    const c = select('xiaoyao-jian', 'parry', 'mapped'), r = trace(c, { hit: true });
    assert.equal(check(r, c).actual_calls.defenses, 1);
    bad(c, r, x => { x.defenses[0].route = 'parry'; });
    bad(c, r, x => { x.dodge_checks[0].phase = 'before'; });
    bad(c, r, x => { x.dodge_checks.pop(); });
    const staff = select('yinhu-zhang', 'ordinary', 'baseline');
    assert.equal(check(trace(staff), staff).ordinary_invocations, 1);
});
test('direct practice original fees and raw learned null remain separate from public growth', () => {
    const c = select('pili-quan', 'practice_skill', 'minimum'), r = trace(c, { qi: 55, neili: 45 });
    assert.equal(check(r, c).resources[0].qi.decrease, 55);
    bad(c, r, x => { x.after[0].neili += 45; x.immediate[0].neili += 45; x.interface_steps[0].after.neili += 45;
        x.metrics[0].neili_cost = 0; x.immediate_metrics[0].neili_cost = 0; });
    const denied = select('pili-quan', 'practice_skill', 'qi-below');
    assert.equal(check(trace(denied, { result: 0 }), denied).commands_accepted, 1);
});
test('public practice source chain and hand-calculated level200 gain13', () => {
    const c = select('pili-quan', 'public_practice', 'basic-plus-one');
    const r = trace(c, { qi: 55, neili: 45, gain: 13, cost: 476 });
    const e = check(r, c); assert.equal(e.practice.gain, 13); assert.equal(e.command_cost, 476);
    assert.equal(e.commands_accepted, 1); assert.equal(e.practice.learned_before_kind, 'undefined');
    bad(c, r, x => { x.command_context.command_source = '/tests/fake'; });
    bad(c, r, x => { x.after[0].learned_kind = 'int'; });
    const no = select('pili-quan', 'public_practice', 'basic-equal-refusal');
    assert.equal(check(trace(no, { cost: 0 }), no).practice.completed, 0);
});
test('valid_learn is a query with no resource/growth; failed return is not failed outer command', () => {
    for (const [variant, result] of [['minimum', 1], ['force-below', 0]]) {
        const c = select('pili-quan', 'valid_learn', variant), r = trace(c, { result });
        const e = check(r, c); assert.equal(e.interface_result, result); assert.equal(e.commands_accepted, 1);
        bad(c, r, x => { x.interfaces[0].implemented_by = '/tests/actor'; });
        bad(c, r, x => { x.interface_steps[0].return_actor = x.before[1].object; });
    }
});
test('original hit_ob poison keeps actual text, level/remain/id and zero return types', () => {
    for (const skill of Object.keys(poison)) {
        const c = select(skill, 'poison', 'legal-level200'), r = trace(c, { result: 1 });
        assert.equal(check(r, c).poison_seeds, 1);
        bad(c, r, x => { x.passives[0].result = 1; x.interfaces[0].result = 1; x.interface_steps[0].result = 1; });
        bad(c, r, x => { x.passives[0].after[1].conditions[poison[skill][0]].id = 'right'; });
        bad(c, r, x => { x.passives[0].after[1].conditions[poison[skill][0]].remain = 1; });
        const no = select(skill, 'poison', 'zero-incoming');
        for (const result of [0, null]) assert.equal(check(trace(no, { result }), no).poison_seeds, 0);
    }
});
test('Xiaoyao zero-incoming still succeeds; actual busy request and80 fee must agree', () => {
    const c = select('xiaoyao-jian', 'busy_passive', 'zero-incoming'), r = trace(c, { result: 1 });
    assert.equal(check(r, c).resources[0].neili.decrease, 80);
    bad(c, r, x => { x.passives[0].result = 0; x.interfaces[0].result = 0; x.interface_steps[0].result = 0; });
    bad(c, r, x => { x.busy_calls[0].requested = 1000; });
    const no = select('xiaoyao-jian', 'busy_passive', 'target-busy'); assert.equal(check(trace(no, { result: 0 }), no).interface_result, 0);
});
test('condition no-seed retains actual invocation but never claims completed lifecycle', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal'), r = trace(c);
    const e = check(r, c); assert.equal(e.lifecycle.complete, false); assert.equal(e.lifecycle.elapsed, null);
    bad(c, r, x => { x.condition_lifecycle_complete = 1; });
    bad(c, r, x => { x.condition_terminal = 'removed'; });
});
test('natural condition ticks remain on victim original HB, clear after callback, recovery and gross costs separate', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal'), r = trace(c, { seed: true, recovery: true });
    const e = check(r, c); assert.equal(e.lifecycle.tick_count, 4); assert.equal(e.lifecycle.heartbeat_count, 4);
    assert.deepEqual(e.lifecycle.resources[1].natural.qi, { decrease: 40, recovery: 5, net_decrease: 35 });
    bad(c, r, x => { x.condition_heartbeats[0].side = 0; });
    bad(c, r, x => { x.condition_events[0].daemon = '/tests/fake'; });
    bad(c, r, x => { x.condition_heartbeats[0].event_count_after = 0; });
    bad(c, r, x => { x.condition_events.at(-1).state.conditions = 0; });
});
test('condition update clocks reject compressed and infeasible integer time intervals', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal');
    for (const bounds of [
        [[1000, 1000], [1000, 1000], [1000, 1000], [1000, 1000]],
        [[1000, 1000], [1003, 1003], [1006, 1006], [1009, 1009]],
        [[1000, 1002], [1003, 1004], [1012, 1012], [1018, 1018]],
        [[1000, 1000], [1004, 1006], [1008, 1009], [1018, 1018]],
    ]) {
        const r = trace(c, { seed: true, recovery: true });
        const compressed = bounds.every(([start, end]) => start === 1000 && end === 1000);
        r.condition_heartbeats.forEach((hb, i) => {
            [hb.wall_time_before, hb.wall_time_after] = bounds[i];
            hb.elapsed_before = compressed ? 0.1 + i * 0.01 : hb.wall_time_before - 999;
            hb.elapsed = compressed ? hb.elapsed_before + 0.003 : hb.wall_time_after - 999 + 0.01;
            r.condition_events[2 * i].elapsed = hb.elapsed_before + 0.001;
            r.condition_events[2 * i + 1].elapsed = hb.elapsed_before + 0.002;
        });
        r.elapsed = r.condition_heartbeats.at(-1).elapsed + 0.01;
        assert.throws(() => check(r, c), /original condition update clock has no feasible time/);
    }
});
test('condition clocks use internal integer-time feasibility, not before time or elapsed five-second gaps', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal');
    for (const bounds of [
        [[1000, 1002, 1.1, 3.1], [1004, 1005, 5.1, 6.1], [1009, 1012, 10.1, 13.1], [1014, 1015, 15.1, 16.1]],
        [[1000, 1001, 1.999, 2.001], [1005, 1005, 6.001, 6.004], [1011, 1011, 12.001, 12.004], [1017, 1017, 18.001, 18.004]],
        [[2000, 2000, 0.02, 0.03], [2030, 2030, 30.02, 30.03], [2060, 2060, 60.02, 60.03], [2090, 2090, 90.02, 90.03]],
    ]) {
        const r = trace(c, { seed: true, recovery: true });
        r.condition_heartbeats.forEach((hb, i) => {
            [hb.wall_time_before, hb.wall_time_after, hb.elapsed_before, hb.elapsed] = bounds[i];
            r.condition_events[2 * i].elapsed = hb.elapsed - 0.0002;
            r.condition_events[2 * i + 1].elapsed = hb.elapsed - 0.0001;
        });
        r.elapsed = r.condition_heartbeats.at(-1).elapsed + 0.01;
        assert.equal(check(r, c).lifecycle.complete, true);
    }
    const r = trace(c, { seed: true }), previous = r.condition_heartbeats[0];
    r.condition_heartbeats.splice(1, 0, { side: 1, before: copy(previous.after), after: copy(previous.after),
        elapsed_before: 3, elapsed: 3.01, wall_time_before: 1002, wall_time_after: 1002,
        event_count_before: 2, event_count_after: 2 });
    r.metrics[1].heartbeats++;
    const e = check(r, c); assert.equal(e.lifecycle.tick_count, 4); assert.equal(e.lifecycle.heartbeat_count, 5);
});
test('flag3 closes all five resources at same-HB after even when the whole ledger is rebalanced', () => {
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'normal');
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const delta of [5, -5]) {
        const r = trace(c, { seed: true, recovery: true });
        assert.equal(r.condition_events[1].flag, 3);
        r.condition_heartbeats[0].after[key] += delta;
        for (const hb of r.condition_heartbeats.slice(1)) { hb.before[key] += delta; hb.after[key] += delta; }
        for (const event of r.condition_events.slice(2)) event.state[key] += delta;
        r.after[1][key] += delta;
        const counter = key + (delta > 0 ? '_recovery' : '_cost');
        r.metrics[1][counter] = (r.metrics[1][counter] ?? 0) + Math.abs(delta);
        assert.equal(r.before[1][key] - r.after[1][key], (r.metrics[1][key + '_cost'] ?? 0) - (r.metrics[1][key + '_recovery'] ?? 0));
        assert.throws(() => check(r, c), /CND_NO_HEAL_UP forbids post-callback resource changes/);
    }
    const r = trace(c, { seed: true, recovery: true }), last = r.condition_heartbeats.at(-1);
    assert.equal(r.condition_events.at(-1).flag, 0);
    assert.equal(last.after.qi - r.condition_events.at(-1).state.qi, 5);
    assert.deepEqual(check(r, c).lifecycle.resources[1].natural.qi, { decrease: 40, recovery: 5, net_decrease: 35 });
});
test('immune/nopoison seed then clear; piyi no seed, no invented periodic damage', () => {
    for (const mode of ['immune', 'nopoison']) {
        const c = select('hanbing-mianzhang', 'poison_lifecycle', mode), r = trace(c, { seed: true });
        const e = check(r, c); assert.equal(e.lifecycle.tick_count, 1); assert.equal(e.lifecycle.resources[1].natural.qi.decrease, 0);
    }
    const c = select('hanbing-mianzhang', 'poison_lifecycle', 'piyi'); assert.equal(check(trace(c), c).lifecycle.seeded, false);
    assert.throws(() => check(trace(c, { seed: true }), c));
});
test('sparse zero metrics require the original mapping; missing and null cannot become observed zero', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum'), r = trace(c);
    for (const value of [undefined, null, [], 0]) bad(c, r, x => { x.metrics[0] = value; });
    for (const value of [null, -1, 0.1, '0', true]) bad(c, r, x => { x.metrics[0].qi_cost = value; });
    bad(c, r, x => { delete x.before[0].learned_raw; }); bad(c, r, x => { delete x.before[0].conditions; });
});
test('positive integer cost preserves value; absent/null/fractional/unsafe/negative fail', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum');
    for (const cost of [1, 23, 476]) assert.equal(check(trace(c, { cost }), c).command_cost, cost);
    for (const cost of [null, -1, 1.2, Number.MAX_SAFE_INTEGER + 1, '1', true, 0]) {
        const r = trace(c); r.command_accepted = cost; assert.throws(() => check(r, c));
    }
});
test('metadata/identity/qualification pollution rejected; diagnostics explicit unknown without fake snapshots', () => {
    const c = select('pili-quan', 'valid_learn', 'minimum'), r = trace(c);
    bad(c, r, x => { x.before[0].wizardp = 1; }); bad(c, r, x => { x.after[0].object = x.before[1].object; });
    bad(c, r, x => { x.before[0].cultivation['special_skill/mystery'] = 1; });
    bad(c, r, x => { x.before[1].temp.guarding = 1; });
    bad(c, r, x => { delete x.before[0].cultivation['tattoo/tattoo_int']; });
    bad(c, r, x => { x.after[1].conditions = { invented: 1 }; }); bad(c, r, x => { x.index = c.samples; });
    const d = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 600, outcome: 'error', reason: 'watchdog, not completion' };
    assert.equal(check(d, c), null); bad(c, d, x => { x.reason = ''; }); bad(c, d, x => { delete x.elapsed; });
    const changed = copy(c); changed.parameters.run_mode = 'made-up'; assert.throws(() => check(r, changed));
});
