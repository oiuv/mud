// Evidence consumer only. A successful synthetic test is not native gameplay evidence.
import assert from 'node:assert/strict';
import { validateMingjiaoRemainingBaseCondition } from './school_mingjiao_remaining_base_cases.mjs';

const own = (x, k) => { assert.ok(Object.hasOwn(x, k), 'missing ' + k); return x[k]; };
const map = x => { assert.ok(x && typeof x === 'object' && !Array.isArray(x), 'mapping required'); return x; };
const list = x => { assert.ok(Array.isArray(x), 'array required'); return x; };
const integer = x => { assert.ok(Number.isSafeInteger(x), 'safe integer required'); return x; };
const count = x => { assert.ok(integer(x) >= 0); return x; };
const finite = x => { assert.ok(Number.isFinite(x) && x >= 0); return x; };
const text = x => { assert.equal(typeof x, 'string'); return x; };
const zero = x => assert.ok(x === 0 || x === null, 'explicit LPC zero required');
const bit = x => { assert.ok(x === 0 || x === 1); return x; };
const empty = x => x === 0 || x === null ? {} : map(x);
const clone = x => structuredClone(x);
const metric = (m, k) => Object.hasOwn(m, k) ? count(m[k]) : 0;
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const props = [...resources, 'max_qi', 'max_jing', 'max_neili', 'jingli', 'max_jingli',
    'str', 'int', 'con', 'dex', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen'];
const cultivation = ['class', 'family/family_name', 'reborn', 'breakup', 'doing', 'env/no_learn',
    'env/auto_regenerate', 'immune/poison', 'special_skill/piyi'];
const poisonSources = {
    'hanbing-mianzhang': { name: 'ice_poison', label: '寒冰掌毒', a: 50, b: 20,
        result: '$n忽然神色大变，一个寒战，退了几步。\n' },
    'yinfeng-dao': { name: 'yinfeng_dao', label: '阴风刮骨之扰', a: 100, b: 10,
        result: '$n只感一阵刮骨之痛，看来是受了对方阴风刀内劲的干扰。\n' },
    'tougu-zhen': { name: 'tougu_zhen', label: '透骨寒针之扰', a: 100, b: 10,
        result: '$n只感到从伤口处传来一阵切骨之痛，看来是受了对方透骨针内劲的干扰。\n' },
};

function learned(s) {
    const kind = own(s, 'learned_kind'), raw = own(s, 'learned_raw');
    if (kind === 'undefined') zero(raw);
    else if (kind === 'int') assert.equal(integer(raw), 0);
    else { assert.equal(kind, 'mapping'); Object.values(map(raw)).forEach(count); }
    const shown = map(own(s, 'learned'));
    assert.deepEqual(shown, kind === 'mapping' ? raw : {}, 'learned raw type/view mismatch');
    return shown;
}
function equipment(e) {
    map(e); if (!Object.keys(e).length) return;
    assert.match(text(own(e, 'object')), /^\/tests\/(?:sword|staff)#\d+$/);
    assert.equal(own(e, 'program'), e.object.replace(/#\d+$/, ''));
    assert.equal(own(e, 'skill_type'), e.program.slice('/tests/'.length));
    count(own(e, 'flag')); count(own(e, 'weight'));
    for (const key of ['damage', 'consistence', 'rigidity']) { const v = own(e, key); if (v !== null) integer(v); }
    zero(own(e, 'no_wield')); own(e, 'material');
    // Base uses ordinary templates, not a held combined/ammunition object.
    if (Object.hasOwn(e, 'amount')) zero(e.amount);
    if (Object.hasOwn(e, 'daub')) assert.deepEqual(map(e.daub), {});
}
function state(s, side, identity) {
    map(s); assert.match(text(own(s, 'object')), /^\/tests\/actor#\d+$/);
    if (identity !== undefined) assert.equal(s.object, identity, 'different USER');
    assert.equal(own(s, 'id'), ['left', 'right'][side]);
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(s, k), 1);
    for (const k of ['wizardp', 'ghost']) assert.equal(own(s, k), 0);
    zero(own(s, 'not_living'));
    for (const k of ['fighting_opponent', 'killing_opponent']) bit(own(s, k));
    if (own(s, 'busy') !== null) count(s.busy);
    props.forEach(k => integer(own(s, k)));
    for (const k of ['skills', 'mappings', 'preparations', 'effective_skills', 'temp', 'cultivation']) map(own(s, k));
    Object.values(s.skills).forEach(count); Object.values(s.effective_skills).forEach(integer);
    integer(own(s, 'effective_int')); integer(own(s, 'effective_dex'));
    text(own(s, 'gender')); text(own(s, 'character')); learned(s); empty(own(s, 'conditions'));
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
        text(own(s, slot)); const e = own(s, slot + '_details'); equipment(e);
        assert.equal(s[slot], Object.keys(e).length ? e.skill_type : 'none');
    }
    assert.equal(own(s, 'weapon_flag'), s.weapon_details.flag ?? 0);
    assert.equal(own(s, 'weapon_damage'), s.weapon_details.damage ?? 0);
    assert.equal(own(s, 'ammunition'), 0);
    return s;
}
function initial(s, config) {
    for (const k of [...props, 'gender', 'character']) assert.equal(s[k], config.properties[k], 'initial ' + k);
    for (const k of ['skills', 'mappings', 'preparations']) assert.deepEqual(s[k], config[k]);
    assert.deepEqual(learned(s), {}); assert.deepEqual(empty(s.conditions), {});
    config.busy ? assert.equal(s.busy, config.busy) : zero(s.busy);
    for (const k of cultivation) assert.equal(own(s.cultivation, k), config.properties[k]);
    for (const k of ['special_skill/wuxing', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai',
        'tattoo/tattoo_str', 'tattoo/tattoo_int', 'tattoo/tattoo_con', 'tattoo/tattoo_dex']) zero(own(s.cultivation, k));
    if (config.temp?.nopoison) assert.equal(own(s.temp, 'nopoison'), config.temp.nopoison);
    else if (Object.hasOwn(s.temp, 'nopoison')) zero(s.temp.nopoison);
    for (const k of ['guarding', 'twice', 'no_perform', 'no_exert', 'no_force'])
        if (Object.hasOwn(s.temp, k)) zero(s.temp[k]);
    for (const [k, v] of Object.entries(config.temp ?? {})) assert.equal(own(s.temp, k), v);
    assert.equal(s.effective_int, config.properties.int + Math.trunc((config.skills.literate ?? 0) / 10));
    assert.equal(s.effective_dex, config.properties.dex + Math.trunc(config.skills.dodge / 10));
    for (const [k, v] of Object.entries(config.skills)) assert.equal(own(s.effective_skills, k),
        Math.trunc(v / 2) + (config.skills[config.mappings[k]] ?? 0) - Number(k === 'dodge' && !!config.equipment));
    assert.equal(s.handing, 'none'); assert.equal(s.secondary_weapon, 'none');
    if (!config.equipment) assert.equal(s.weapon, 'none');
    else {
        assert.equal(s.weapon, config.equipment.type); assert.equal(s.weapon_details.program, '/tests/' + config.equipment.type);
        assert.equal(s.weapon_details.weight, 3000); assert.equal(s.weapon_details.damage, 50);
        assert.equal(s.weapon_details.flag, config.equipment.type === 'sword' ? 4 : 16);
        assert.equal(s.weapon_details.consistence, 100);
    }
}
function stable(a, b, natural = false) {
    for (const k of ['id', 'character', 'gender', 'str', 'int', 'con', 'dex', 'combat_exp', 'jiali',
        'potential', 'learned_points', 'shen', 'max_qi', 'max_jing', 'max_neili', 'max_jingli',
        'skills', 'mappings', 'preparations', 'cultivation']) assert.deepEqual(b[k], a[k], 'unexpected mutation ' + k);
    if (!natural) assert.equal(b.jingli, a.jingli);
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
        assert.equal(b[slot], a[slot]);
        const { consistence: aw, ...ae } = a[slot + '_details'], { consistence: bw, ...be } = b[slot + '_details'];
        assert.deepEqual(be, ae, 'same original equipment');
        if (aw === undefined || aw === null) assert.equal(bw, aw);
        else assert.ok(count(bw) <= aw, 'equipment cannot be repaired by this action');
    }
}
function account(before, after, metrics) {
    Object.values(map(metrics)).forEach(count);
    return Object.fromEntries(resources.map(k => {
        const decrease = metric(metrics, k + '_cost'), recovery = metric(metrics, k + '_recovery');
        assert.equal(before[k] - after[k], decrease - recovery, 'resource ledger ' + k);
        return [k, { decrease, recovery, net_decrease: before[k] - after[k] }];
    }));
}
function poisonSeed(seed, skill, actor) {
    const spec = poisonSources[skill]; assert.ok(spec, 'foreign poison'); map(seed);
    assert.deepEqual(Object.keys(seed).sort(), ['id', 'level', 'name', 'remain']);
    assert.equal(seed.id, actor.id); assert.equal(seed.name, spec.label);
    const level = count(seed.level), remain = count(seed.remain), raw = actor.skills[skill], jiali = actor.jiali;
    assert.ok(raw >= 80 && jiali >= 10);
    assert.ok(level >= jiali && level < 2 * jiali);
    const duration = remain / level; integer(duration);
    assert.ok(duration >= Math.trunc(raw / spec.a) && duration < Math.trunc(raw / spec.a) + Math.trunc(raw / spec.b));
}
function passive(x, p, before, busyCalls) {
    assert.equal(own(x, 'actor'), 0); assert.equal(own(x, 'target'), 1);
    const skill = text(own(x, 'skill')), route = text(own(x, 'route')), result = own(x, 'result');
    assert.ok(['interface', 'martial', 'force'].includes(route)); integer(own(x, 'incoming'));
    const factor = own(x, 'factor'); if (factor !== null) integer(factor);
    for (const phase of ['before', 'after']) {
        assert.equal(list(own(x, phase)).length, 2);
        x[phase].forEach((s, side) => {
            state(s, side, before[side].object); stable(before[side], s);
            assert.deepEqual(s.learned_raw, before[side].learned_raw);
            assert.equal(s.learned_kind, before[side].learned_kind);
        });
    }
    const [a, t] = x.before, [aa, tt] = x.after;
    assert.equal(own(x, 'neili_after'), aa.neili); assert.equal(own(x, 'target_eff_qi_after'), tt.eff_qi);
    assert.deepEqual(own(x, 'target_busy_after'), tt.busy);
    if (route === 'interface') assert.equal(skill, p.skill);
    else assert.ok(Object.values(a.mappings).includes(skill), 'passive outside actual mapping');
    if (route === 'martial') assert.equal(factor, 0);
    if (poisonSources[skill]) {
        assert.ok(route === 'martial' || route === 'interface');
        for (const k of resources) { assert.equal(a[k], aa[k]); assert.equal(t[k], tt[k]); }
        const spec = poisonSources[skill], old = empty(t.conditions), now = empty(tt.conditions);
        if (result === null || result === 0) assert.deepEqual(now, old);
        else {
            assert.equal(result, spec.result, 'original poison hit_ob text');
            assert.ok(x.incoming > 0 && !t.cultivation['special_skill/piyi']);
            assert.ok(a.jiali * 2 + a.skills[skill] - 1 > t.effective_skills.force);
            assert.deepEqual(Object.keys(old), []); assert.deepEqual(Object.keys(now), [spec.name]);
            poisonSeed(now[spec.name], skill, a);
        }
        return { kind: 'poison', skill, proc: typeof result === 'string', result: clone(result) };
    }
    if (skill === 'xiaoyao-jian') {
        assert.ok(route === 'martial' || route === 'interface'); bit(result);
        assert.equal(a.neili - aa.neili, result * 80);
        for (const k of resources.filter(k => k !== 'neili')) assert.equal(a[k], aa[k]);
        for (const k of resources) assert.equal(t[k], tt[k]);
        if (result) {
            const level = a.skills[skill];
            assert.ok(level >= 130 && a.neili >= 150 && a.skills.dodge >= 180 && a.skills.force >= 150);
            zero(t.busy); assert.ok(Math.trunc(level / 2) + level - 1 >= t.skills.dodge);
            assert.ok(busyCalls.some(call => call.side === 1 && call.requested >= 2
                && call.requested <= 1 + Math.trunc(level / 30) && call.after === tt.busy), 'missing actual busy call');
        } else assert.deepEqual(tt.busy, t.busy);
        return { kind: 'busy', skill, proc: !!result, result, requested: busyCalls.filter(c => c.side === 1).map(c => c.requested), actual: tt.busy };
    }
    if (route === 'force') {
        assert.equal(skill, 'shenghuo-xinfa');
        // Fixed neutral USER pools cannot reach FORCE's negative-damage reflection mapping.
        if (result !== null) integer(result);
        assert.equal(a.neili - aa.neili, factor ?? 0, 'original FORCE jiali cost');
    } else zero(result); // Inherited empty hit_ob for the other reviewed bodies.
    return { kind: route, skill, result: clone(result) };
}
function lifecycle(raw, p, before, immediate, after, metrics, immediateMetrics) {
    const seed = map(own(raw, 'condition_seed')), name = p.requirements.condition_name;
    assert.equal(own(seed, 'condition_name'), name); bit(own(seed, 'seeded'));
    const seedState = own(seed, 'state'), visible = empty(immediate[1].conditions);
    if (seed.seeded) { assert.deepEqual(seedState, own(visible, name)); poisonSeed(seedState, p.skill, before[0]); }
    else { zero(seedState); assert.deepEqual(visible, {}); }
    assert.deepEqual(own(seed, 'combat_stopped_after_seed'), [1, 1]);
    assert.deepEqual(own(seed, 'enemy_counts'), [0, 0]); assert.deepEqual(own(seed, 'killer_counts'), [0, 0]);
    finite(own(seed, 'elapsed')); assert.ok(seed.elapsed <= raw.elapsed);
    const events = list(own(raw, 'condition_events')), beats = list(own(raw, 'condition_heartbeats'));
    const terminal = own(raw, 'condition_terminal'), complete = bit(own(raw, 'condition_lifecycle_complete'));
    assert.equal(metric(metrics[0], 'heartbeats'), 0); assert.equal(metric(metrics[1], 'heartbeats'), beats.length);
    assert.equal(metric(immediateMetrics[0], 'heartbeats'), 0); assert.equal(metric(immediateMetrics[1], 'heartbeats'), 0);
    if (!seed.seeded) {
        assert.equal(terminal, 'no_seed'); assert.equal(complete, 0); assert.deepEqual(events, []); assert.deepEqual(beats, []);
    } else {
        assert.equal(terminal, 'removed'); assert.equal(complete, 1); assert.ok(beats.length > 0);
        assert.ok(events.length > 0 && events.length % 2 === 0);
        let eventIndex = 0, previousElapsed = seed.elapsed, previousState = immediate[1], previousUpdateLower = null;
        for (const hb of beats) {
            assert.equal(own(hb, 'side'), 1);
            for (const phase of ['before', 'after']) state(own(hb, phase), 1, before[1].object);
            assert.deepEqual(hb.before, previousState, 'original consecutive victim heartbeat states');
            assert.ok(finite(own(hb, 'elapsed_before')) >= previousElapsed);
            assert.ok(finite(own(hb, 'elapsed')) >= hb.elapsed_before && hb.elapsed <= raw.elapsed);
            count(own(hb, 'wall_time_before')); assert.ok(count(own(hb, 'wall_time_after')) >= hb.wall_time_before);
            assert.equal(own(hb, 'event_count_before'), eventIndex);
            const end = count(own(hb, 'event_count_after')); assert.ok(end === eventIndex || end === eventIndex + 2);
            if (end !== eventIndex) {
                // char.c reads its integer t inside this HB, not at the before observation.
                // Each later update needs a feasible t >= the previous update's t + 5.
                const updateLower = previousUpdateLower === null ? hb.wall_time_before
                    : Math.max(hb.wall_time_before, previousUpdateLower + 5);
                assert.ok(updateLower <= hb.wall_time_after, 'original condition update clock has no feasible time');
                previousUpdateLower = updateLower;
                const a = events[eventIndex], b = events[eventIndex + 1];
                for (const [event, phase] of [[a, 'before'], [b, 'after']]) {
                    map(event); assert.equal(own(event, 'side'), 1); assert.equal(own(event, 'phase'), phase);
                    assert.equal(own(event, 'name'), name); assert.equal(own(event, 'daemon'), '/kungfu/condition/' + name);
                    state(own(event, 'state'), 1, before[1].object);
                    assert.ok(finite(own(event, 'elapsed')) >= hb.elapsed_before && event.elapsed <= hb.elapsed);
                }
                zero(own(a, 'flag')); assert.ok([0, 3].includes(own(b, 'flag')));
                const old = own(empty(a.state.conditions), name), next = own(empty(b.state.conditions), name);
                assert.equal(old.id, seedState.id); assert.equal(old.name, seedState.name); assert.equal(old.level, seedState.level);
                assert.equal(next.id, old.id); assert.equal(next.name, old.name); assert.equal(next.level, old.level);
                count(old.remain); count(next.remain);
                if (p.target.temp?.nopoison) {
                    assert.equal(b.flag, 0); assert.deepEqual(next, old);
                    for (const k of resources) assert.equal(a.state[k], b.state[k]);
                } else if (p.target.properties['immune/poison'] === -1) {
                    assert.equal(b.flag, 0); assert.equal(next.remain, 0);
                    for (const k of resources) assert.equal(a.state[k], b.state[k]);
                } else {
                    assert.equal(b.flag, old.remain <= old.level ? 0 : 3);
                    assert.equal(next.remain, b.flag ? old.remain - old.level : old.remain);
                    assert.ok(b.state.qi < a.state.qi && b.state.jing < a.state.jing,
                        'normal poison tick must actually damage both resources');
                    assert.ok(b.state.eff_qi < a.state.eff_qi && b.state.eff_jing < a.state.eff_jing);
                }
                if (b.flag === 0) {
                    assert.equal(end, events.length); assert.equal(hb, beats.at(-1));
                    assert.deepEqual(empty(hb.after.conditions), {}, 'clear follows callback, not before it');
                } else {
                    assert.deepEqual(empty(hb.after.conditions)[name], next);
                    for (const k of resources) assert.equal(hb.after[k], b.state[k],
                        'CND_NO_HEAL_UP forbids post-callback resource changes: ' + k);
                }
            }
            eventIndex = end; previousState = hb.after; previousElapsed = hb.elapsed;
        }
        assert.equal(eventIndex, events.length); assert.deepEqual(beats.at(-1).after, after[1]);
    }
    assert.deepEqual(empty(after[1].conditions), {});
    for (const s of [...immediate, ...after]) { assert.equal(s.fighting_opponent, 0); assert.equal(s.killing_opponent, 0); }
    const phaseResources = before.map((s, side) => {
        const seedAccount = account(s, immediate[side], immediateMetrics[side]);
        const remaining = {};
        for (const k of new Set([...Object.keys(metrics[side]), ...Object.keys(immediateMetrics[side])]))
            remaining[k] = count(metric(metrics[side], k) - metric(immediateMetrics[side], k));
        return { seed: seedAccount, natural: account(immediate[side], after[side], remaining) };
    });
    return { seeded: !!seed.seeded, terminal, complete: !!complete, heartbeat_count: beats.length,
        tick_count: events.length / 2, elapsed: seed.seeded ? raw.elapsed - seed.elapsed : null,
        original_seed: clone(seedState), resources: phaseResources };
}

export function validateMingjiaoRemainingBaseRecord(raw, condition) {
    const p = validateMingjiaoRemainingBaseCondition(condition);
    map(raw); assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), condition.method); assert.ok(count(own(raw, 'index')) < condition.samples);
    finite(own(raw, 'elapsed')); text(own(raw, 'reason'));
    assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(own(raw, 'outcome')));
    if (['error', 'not_applicable'].includes(raw.outcome)) { assert.ok(raw.reason.trim()); return null; }
    const phases = {};
    for (const phase of ['before', 'immediate', 'after']) {
        const values = list(own(raw, phase)); assert.equal(values.length, 2);
        phases[phase] = values.map((s, side) => state(s, side, phase === 'before' ? undefined : phases.before[side].object));
        assert.notEqual(values[0].object, values[1].object);
    }
    const { before, immediate, after } = phases, natural = condition.method === 'condition';
    before.forEach((s, side) => initial(s, [p.actor, p.target][side]));
    before.forEach(s => { assert.equal(s.fighting_opponent, Number(p.fighting)); assert.equal(s.killing_opponent, Number(p.fighting)); });
    for (const states of [immediate, after]) states.forEach((s, side) => stable(before[side], s, natural));
    const metrics = list(own(raw, 'metrics')), immediateMetrics = list(own(raw, 'immediate_metrics'));
    assert.equal(metrics.length, 2); assert.equal(immediateMetrics.length, 2);
    const accounts = before.map((s, side) => account(s, after[side], metrics[side]));
    before.forEach((s, side) => account(s, immediate[side], immediateMetrics[side]));
    if (!natural) metrics.forEach(m => assert.equal(metric(m, 'heartbeats'), 0));
    const lists = Object.fromEntries(['actions', 'attacks', 'directs', 'passives', 'defenses', 'dodge_checks',
        'interfaces', 'busy_calls', 'skill_messages', 'launches', 'refusals', 'terminals'].map(k => [k, list(own(raw, k))]));
    for (const k of ['directs', 'launches', 'refusals', 'terminals']) assert.deepEqual(lists[k], [], 'unexpected ' + k);
    for (const m of metrics) { assert.equal(metric(m, 'direct'), 0); assert.equal(metric(m, 'ability_launched'), 0); }
    for (const x of lists.skill_messages) { assert.ok(count(own(x, 'side')) < 2); text(own(x, 'type')); text(own(x, 'text')); }
    for (const x of lists.busy_calls) {
        assert.equal(own(x, 'side'), 1);
        assert.equal(own(x, 'caller_side'), ['ordinary', 'condition'].includes(condition.method) ? raw.ordinary_step?.caller_side : 0);
        count(own(x, 'requested'));
        for (const k of ['before', 'after']) if (own(x, k) !== null) count(x[k]);
    }
    const combat = ['ordinary', 'condition'].includes(condition.method);
    let commandCost = null, commandsAccepted = null, interfaceResult = null, practice = null;
    if (combat) {
        assert.ok(!Object.hasOwn(raw, 'command_accepted'), 'COMBAT call is not a USER command cost');
        const call = map(own(raw, 'ordinary_step')); assert.equal(own(call, 'actor'), 0); assert.equal(own(call, 'target'), 1);
        assert.ok([-1, 0, 1].includes(own(call, 'caller_side')), 'actual ordinary caller, not a fabricated USER command');
        assert.equal(own(call, 'type'), 0); if (own(call, 'result') !== null) integer(call.result);
        assert.equal(raw.outcome, 'observed'); assert.equal(raw.reason, ''); assert.deepEqual(lists.interfaces, []);
        assert.equal(lists.attacks.length, 1, 'one original ordinary invocation; no guarding in fixed setup');
        assert.equal(lists.actions.length, 1);
    } else {
        commandCost = count(own(raw, 'command_accepted')); commandsAccepted = Number(commandCost > 0);
        const context = map(own(raw, 'command_context'));
        assert.equal(own(context, 'action'), p.action); assert.equal(own(context, 'actor'), before[0].object);
        assert.equal(own(context, 'force_me_source'), '/feature/command');
        assert.deepEqual(lists.attacks, []); assert.deepEqual(lists.actions, []);
        assert.deepEqual(lists.defenses, []); assert.deepEqual(lists.dodge_checks, []);
    }
    for (const x of lists.attacks) {
        assert.equal(own(x, 'actor'), 0); assert.equal(own(x, 'target'), 1); assert.equal(own(x, 'type'), 0);
        assert.ok([0, -1, -2].includes(own(x, 'result'))); count(own(x, 'damage'));
    }
    for (const x of lists.actions) {
        assert.equal(own(x, 'actor'), 0); assert.equal(own(x, 'target'), 1); map(own(x, 'action'));
        const usage = before[0].weapon !== 'none' ? before[0].weapon : Object.keys(before[0].preparations)[0] ?? 'unarmed';
        const expected = before[0].mappings[usage];
        if (expected) assert.equal(own(x, 'skill'), expected); else zero(own(x, 'skill'));
    }
    metrics.forEach((m, side) => {
        for (const [key, value] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(metric(m, key), lists.attacks.filter(x => x.actor === side && x.result === value).length);
        for (const key of ['quick', 'riposte']) assert.equal(metric(m, key), 0);
    });
    const passives = lists.passives.map(x => passive(x, p, before, lists.busy_calls));
    assert.equal(lists.busy_calls.length, passives.filter(x => x.kind === 'busy' && x.proc).length);
    if (combat && lists.attacks[0].result === 0 && lists.attacks[0].damage > 0) {
        const a = before[0], usage = a.weapon !== 'none' ? a.weapon : Object.keys(a.preparations)[0] ?? 'unarmed';
        assert.equal(lists.passives.filter(x => x.route === 'force').length, Number(a.jiali > 0 && a.neili > a.jiali));
        assert.equal(lists.passives.filter(x => x.route === 'martial').length, Number(!!a.mappings[usage]));
    }
    for (const x of lists.defenses) {
        assert.equal(own(x, 'actor'), 0); assert.equal(own(x, 'target'), 1); integer(own(x, 'incoming'));
        assert.equal(own(x, 'route'), 'ordinary');
        assert.equal(own(x, 'skill'), before[1].mappings.parry); zero(own(x, 'result'));
    }
    assert.ok(lists.defenses.length <= 1);
    assert.deepEqual(lists.dodge_checks.map(x => own(x, 'phase')), combat ? ['base', 'settled'] : []);
    for (const x of lists.dodge_checks) {
        assert.equal(own(x, 'actor'), 0); assert.equal(own(x, 'target'), 1); assert.equal(own(x, 'type'), 0);
        count(own(x, 'ap')); count(own(x, 'dp'));
        if (own(x, 'busy') !== null) count(x.busy);
        zero(own(x, 'skill'));
    }
    if (condition.method === 'interface') {
        assert.equal(commandsAccepted, 1, 'real test_interface command must be accepted'); assert.equal(lists.interfaces.length, 1);
        const call = lists.interfaces[0], spec = p.interface;
        assert.equal(own(call, 'object'), spec.object); assert.equal(own(call, 'function'), spec.function);
        assert.equal(own(call, 'implemented_by'), spec.object); interfaceResult = own(call, 'result');
        const steps = list(own(raw, 'interface_steps')); assert.equal(steps.length, 1); const step = steps[0];
        assert.equal(own(step, 'command'), 'test_interface'); assert.equal(own(step, 'entry_actor'), before[0].object);
        assert.equal(own(step, 'return_actor'), before[0].object); assert.equal(own(step, 'implemented_by'), spec.object);
        assert.deepEqual(own(step, 'before'), before[0]); assert.deepEqual(own(step, 'after'), immediate[0]);
        assert.deepEqual(own(step, 'result'), interfaceResult); text(own(step, 'reason')); list(own(step, 'messages'));
        if (spec.function === 'hit_ob') {
            assert.equal(own(call, 'damage'), spec.damage);
            const f = own(call, 'factor'); Object.hasOwn(spec, 'factor') ? assert.equal(f, spec.factor) : zero(f);
            assert.equal(passives.length, 1); assert.equal(lists.passives[0].route, 'interface');
            assert.equal(lists.passives[0].incoming, spec.damage); assert.deepEqual(lists.passives[0].result, interfaceResult);
            assert.equal(raw.outcome, 'observed'); assert.equal(raw.reason, '');
        } else {
            bit(interfaceResult); assert.equal(interfaceResult, p.requirements.expected_return);
            assert.equal(raw.outcome, interfaceResult ? 'observed' : 'refused');
            assert.deepEqual(passives, []); assert.deepEqual(lists.busy_calls, []);
            const costs = spec.function === 'practice_skill' ? p.requirements : {};
            for (const [side, values] of accounts.entries()) for (const k of resources) {
                assert.equal(values[k].decrease, side === 0 ? costs[k + '_cost'] ?? 0 : 0); assert.equal(values[k].recovery, 0);
            }
        }
    } else if (condition.method === 'practice') {
        assert.deepEqual(lists.interfaces, []); assert.deepEqual(passives, []); assert.deepEqual(lists.busy_calls, []);
        const context = map(own(raw, 'command_context')), step = map(own(raw, 'practice_step'));
        assert.equal(own(context, 'action'), p.action); assert.equal(own(context, 'actor'), before[0].object);
        assert.equal(own(context, 'force_me_source'), '/feature/command'); assert.equal(own(context, 'command_source'), '/cmds/skill/practice.c');
        assert.equal(own(step, 'accepted'), commandCost); assert.deepEqual(own(step, 'before'), before);
        assert.deepEqual(own(step, 'after'), immediate); assert.equal(text(own(step, 'reason')), raw.reason);
        assert.equal(commandsAccepted, p.requirements.command_return);
        for (const [side, values] of accounts.entries()) for (const k of resources) {
            assert.equal(values[k].decrease, side === 0 ? p.requirements[k + '_cost'] ?? 0 : 0); assert.equal(values[k].recovery, 0);
        }
        const level = before[0].skills[p.skill], basic = before[0].skills[p.usage], intelligence = before[0].int;
        let amount = Math.trunc((level >= 500 ? basic : level >= 300 ? basic * 3 : basic * 6 + 30) / Math.sqrt(intelligence) / 6);
        amount += Math.trunc(amount * (before[0].skills['martial-cognize'] ?? 0) / 500);
        const gain = commandsAccepted ? 1 + Math.trunc(amount * 100 / (level + 100)) : 0;
        assert.deepEqual(learned(after[0]), gain ? { [p.skill]: gain } : {});
        assert.equal(raw.outcome, gain ? 'observed' : 'refused');
        practice = { completed: commandsAccepted, gain, skill_level_change: 0, learned_before_kind: before[0].learned_kind,
            learned_after_kind: after[0].learned_kind, learned_before: clone(before[0].learned_raw), learned_after: clone(after[0].learned_raw) };
    }
    for (const side of [0, 1]) {
        if (condition.method === 'practice' && side === 0) continue;
        assert.deepEqual(after[side].learned_raw, before[side].learned_raw); assert.equal(after[side].learned_kind, before[side].learned_kind);
    }
    if (raw.outcome === 'refused') assert.ok(raw.reason.trim());
    else assert.equal(raw.reason, '');
    const allowedPoison = poisonSources[p.skill]?.name;
    for (const phase of [immediate, after]) for (const side of [0, 1]) {
        const names = Object.keys(empty(phase[side].conditions));
        assert.ok(names.length <= 1 && names.every(name => side === 1 && name === allowedPoison), 'foreign condition pollution');
    }
    const life = natural ? lifecycle(raw, p, before, immediate, after, metrics, immediateMetrics) : null;
    if (!natural) {
        for (const side of [0, 1]) assert.deepEqual(after[side], immediate[side], 'no natural interval in immediate sample');
        if (Object.hasOwn(raw, 'condition_events')) assert.deepEqual(raw.condition_events, []);
        if (Object.hasOwn(raw, 'condition_heartbeats')) assert.deepEqual(raw.condition_heartbeats, []);
    }
    const seeds = passives.filter(x => x.kind === 'poison' && x.proc).length;
    if (p.ability === 'poison') assert.equal(seeds, Number(p.requirements.expected_condition === 'present'));
    if (p.ability === 'busy_passive' && p.requirements.guard_blocks) assert.equal(interfaceResult, 0);
    return { matched: raw.outcome === p.expected, category: p.ability, command_cost: commandCost,
        commands_accepted: commandsAccepted, ordinary_invocations: Number(combat), interface_result: clone(interfaceResult),
        actual_calls: { attacks: lists.attacks.length, passives: passives.length, defenses: lists.defenses.length,
            hits: lists.attacks.filter(x => x.result === 0).length, dodges: lists.attacks.filter(x => x.result === -1).length,
            parries: lists.attacks.filter(x => x.result === -2).length },
        resources: accounts, practice, passives, poison_seeds: seeds, lifecycle: life,
        original_learned: before.map((s, side) => ({ before_kind: s.learned_kind, before: clone(s.learned_raw),
            after_kind: after[side].learned_kind, after: clone(after[side].learned_raw) })),
        unknown: { requested_damage: null, requested_wound: null, independent_defense_hook: null,
            busy_duration_seconds: null, random_draws: null } };
}
