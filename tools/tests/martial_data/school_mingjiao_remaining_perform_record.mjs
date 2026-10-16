// Evidence consumer only: no execution, random draw, expected-outcome substitution or damage solver.
import assert from 'node:assert/strict';
import { validateMingjiaoRemainingPerformCondition } from './school_mingjiao_remaining_perform_cases.mjs';

const copy = value => structuredClone(value);
const own = (value, key) => { assert.ok(Object.hasOwn(value, key), 'missing ' + key); return value[key]; };
const map = value => { assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'mapping required'); return value; };
const int = value => { assert.ok(Number.isSafeInteger(value), 'safe integer required'); return value; };
const nonnegative = value => { assert.ok(int(value) >= 0, 'negative value'); return value; };
const zero = value => { assert.ok(value === 0 || value === null, 'explicit empty LPC value required'); };
const bit = value => { assert.ok(value === 0 || value === 1, 'LPC boolean required'); return value; };
const text = value => { assert.equal(typeof value, 'string'); return value; };
const array = value => { assert.ok(Array.isArray(value), 'array required'); return value; };
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const stable = ['id', 'userp', 'playerp', 'interactive', 'wizardp', 'ghost', 'max_qi', 'max_jing',
    'max_neili', 'jingli', 'max_jingli', 'str', 'int', 'con', 'dex', 'gender', 'combat_exp', 'jiali',
    'potential', 'learned_points', 'shen', 'character', 'skills', 'mappings', 'preparations', 'cultivation'];
const cultivationKeys = ['class', 'family/family_name', 'reborn', 'breakup', 'doing', 'env/no_learn',
    'env/auto_regenerate', 'special_skill/wuxing', 'tattoo/tattoo_str', 'tattoo/tattoo_int',
    'tattoo/tattoo_con', 'tattoo/tattoo_dex'];
const emptyMapping = value => value === null || value === 0 ? {} : map(value);
const counter = (metrics, key) => Object.hasOwn(metrics, key) ? nonnegative(metrics[key]) : 0;
function learned(state) {
    const kind = own(state, 'learned_kind'), raw = own(state, 'learned_raw');
    if (kind === 'undefined') zero(raw);
    else if (kind === 'int') assert.equal(int(raw), 0);
    else { assert.equal(kind, 'mapping', 'unexpected original learned type'); map(raw); Object.values(raw).forEach(nonnegative); }
    const shown = map(own(state, 'learned'));
    assert.deepEqual(shown, kind === 'mapping' ? raw : {}, 'raw learned and normalized view differ');
    return kind === 'mapping' ? raw : {};
}
function equipment(value) {
    map(value);
    if (!Object.keys(value).length) return;
    assert.match(text(own(value, 'object')), /^\/(?:tests\/[a-z_]+|clone\/weapon\/flower_leaf)#\d+$/);
    assert.equal(own(value, 'program'), value.object.replace(/#\d+$/, ''));
    text(own(value, 'skill_type'));
    for (const key of ['flag', 'weight']) nonnegative(own(value, key));
    for (const key of ['damage', 'consistence', 'rigidity', 'amount']) {
        const v = own(value, key); if (v !== null) int(v);
    }
    const noWield = own(value, 'no_wield');
    if (value.program === '/clone/weapon/flower_leaf') {
        // Original THROWING setup stores a refusal string, not an integer flag.
        assert.equal(noWield, '暗器不是用来装备的。\n');
        assert.equal(value.consistence, 100);
    } else zero(noWield);
    own(value, 'material'); map(own(value, 'daub'));
}
function snapshot(state, side, identity, p) {
    map(state);
    const object = text(own(state, 'object')); assert.match(object, /^\/tests\/actor#\d+$/);
    if (identity !== undefined) assert.equal(object, identity, 'different USER');
    assert.equal(own(state, 'id'), ['left', 'right', 'third'][side]);
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(own(state, key), 1);
    for (const key of ['wizardp', 'ghost']) assert.equal(own(state, key), 0);
    for (const key of ['living', 'fighting_opponent', 'killing_opponent']) bit(own(state, key));
    zero(own(state, 'not_living'));
    const busy = own(state, 'busy'); if (busy !== null) nonnegative(busy);
    for (const key of [...resources, 'max_qi', 'max_jing', 'max_neili', 'jingli', 'max_jingli',
        'str', 'int', 'con', 'dex', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen', 'effective_int', 'effective_dex']) int(own(state, key));
    for (const key of ['skills', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'temp']) map(own(state, key));
    Object.values(state.skills).forEach(nonnegative); Object.values(state.effective_skills).forEach(int);
    learned(state); emptyMapping(own(state, 'conditions')); text(own(state, 'character')); text(own(state, 'gender'));
    for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
        text(own(state, slot)); equipment(own(state, slot + '_details'));
        assert.equal(state[slot], Object.keys(state[slot + '_details']).length ? state[slot + '_details'].skill_type : 'none');
    }
    assert.equal(own(state, 'weapon_flag'), state.weapon_details.flag ?? 0);
    assert.equal(own(state, 'weapon_damage'), state.weapon_details.damage ?? 0);
    const ammunition = own(state, 'ammunition');
    if (side === 0 && p.ability === 'hua' && p.variant === 'wrong-held-item'
        && p.actor.equipment?.hold === true && p.actor.equipment.program === '/tests/sword') {
        // The original non-COMBINED sword has no amount; retain its explicit LPC empty value.
        assert.equal(state.handing, 'sword');
        assert.equal(state.handing_details.program, '/tests/sword');
        zero(own(state.handing_details, 'amount'));
        assert.equal(ammunition, state.handing_details.amount, 'same original held amount');
    } else nonnegative(ammunition);
    return state;
}
function initial(state, config, side, p, awake = false) {
    const unconscious = side === 1 && p.target_state === 'unconscious' && !awake;
    for (const key of ['skills', 'mappings', 'preparations']) assert.deepEqual(state[key], config[key]);
    for (const key of [...resources, 'max_qi', 'max_jing', 'max_neili', 'jingli', 'max_jingli',
        'str', 'int', 'con', 'dex', 'gender', 'combat_exp', 'jiali', 'potential', 'learned_points', 'shen', 'character']) {
        assert.equal(state[key], unconscious && ['qi', 'jing'].includes(key) ? 0 : config.properties[key], 'initial ' + side + '/' + key);
    }
    assert.equal(state.living, unconscious ? 0 : 1);
    if (config.busy) assert.equal(state.busy, config.busy); else zero(state.busy);
    assert.deepEqual(learned(state), {}); assert.deepEqual(emptyMapping(state.conditions), {});
    for (const key of cultivationKeys) assert.equal(own(state.cultivation, key), config.properties[key]);
    const grant = `can_perform/${p.skill}/${p.ability}`;
    if (Object.hasOwn(config.properties, grant)) assert.equal(own(state.cultivation, grant), config.properties[grant]);
    else zero(own(state.cultivation, grant));
    for (const [key, value] of Object.entries(config.temp ?? {})) assert.equal(own(state.temp, key), value);
    assert.equal(state.effective_int, config.properties.int + Math.trunc((config.skills.literate ?? 0) / 10));
    assert.equal(state.effective_dex, config.properties.dex + Math.trunc((config.skills.dodge ?? 0) / 10));
    for (const [key, value] of Object.entries(config.skills)) {
        const expected = Math.trunc(value / 2) + (config.skills[config.mappings[key]] ?? 0)
            - (key === 'dodge' && config.equipment && !config.equipment.hold ? 1 : 0);
        assert.equal(own(state.effective_skills, key), expected, 'initial effective skill ' + key);
    }
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    const cfg = config.equipment, slot = cfg?.hold ? 'handing' : 'weapon', other = cfg?.hold ? 'weapon' : 'handing';
    assert.equal(state[other], 'none'); assert.deepEqual(state[other + '_details'], {});
    if (!cfg) { assert.equal(state[slot], 'none'); assert.deepEqual(state[slot + '_details'], {}); }
    else {
        assert.equal(state[slot], cfg.type);
        const item = state[slot + '_details'];
        assert.equal(item.program, cfg.program ?? '/tests/' + cfg.type);
        if (cfg.program === '/clone/weapon/flower_leaf') {
            assert.equal(item.amount, cfg.amount); assert.equal(state.ammunition, cfg.amount);
        } else { assert.equal(item.weight, 3000); assert.equal(item.damage, 50); assert.equal(item.consistence, 100); }
        assert.deepEqual(item.daub, {});
    }
    if (!cfg?.hold) assert.equal(state.ammunition, 0);
}
function pair(event, roles, nuoyiRedirect = false) {
    map(event); nonnegative(own(event, 'actor')); nonnegative(own(event, 'target'));
    assert.ok(event.actor < roles && event.target < roles && event.actor !== event.target, 'foreign combat role');
    // The original self branch only calls receive_damage/wound. Ordinary calls redirect
    // right to third; COMBAT may reverse that pair for an original quick/riposte.
    if (nuoyiRedirect) assert.ok(roles === 3 && event.actor > 0 && event.target > 0,
        'NUOYI ordinary calls require the exact right/third pair');
}
function resourceAccount(before, after, metrics) {
    map(metrics); Object.values(metrics).forEach(nonnegative);
    const result = {};
    for (const key of resources) {
        const cost = counter(metrics, key + '_cost'), recovery = counter(metrics, key + '_recovery');
        assert.equal(before[key] - after[key], cost - recovery, 'unclosed actual set delta ' + key);
        result[key] = { decrease: cost, recovery, net_decrease: before[key] - after[key] };
    }
    assert.equal(counter(metrics, 'heartbeats'), 0, 'this is not a natural combat/poison lifecycle');
    return result;
}
function flower(raw, p, before, immediate, after, accepted) {
    if (p.ability !== 'hua') { assert.ok(!Object.hasOwn(raw, 'flower')); return null; }
    const f = map(own(raw, 'flower')), original = text(own(f, 'original_object'));
    const source = before.handing_details;
    assert.equal(original, source.object ?? '');
    for (const [phase, state] of [['before', before], ['immediate', immediate], ['after', after]]) {
        const point = map(own(f, phase)); bit(own(point, 'exists')); bit(own(point, 'same_held'));
        equipment(own(point, 'item')); equipment(own(point, 'handing'));
        assert.deepEqual(point.handing, state.handing_details);
        if (point.exists) assert.equal(point.item.object, original);
        else assert.deepEqual(point.item, {});
        assert.equal(point.same_held, Number(!!point.exists && point.handing.object === original));
    }
    assert.equal(f.before.exists, Number(!!original)); assert.deepEqual(f.before.item, source);
    if (!accepted) { assert.deepEqual(f.immediate, f.before); assert.deepEqual(f.after, f.before); return { consumed: 0, destroyed_after_return: 0 }; }
    assert.equal(source.program, '/clone/weapon/flower_leaf');
    assert.equal(f.immediate.exists, 1); assert.equal(f.immediate.item.amount, source.amount - 10);
    assert.equal(f.immediate.same_held, 1);
    if (source.amount === 10) {
        assert.equal(f.after.exists, 0); assert.equal(f.after.same_held, 0); assert.deepEqual(f.after.handing, {});
        assert.equal(after.ammunition, 0);
    } else {
        assert.equal(f.after.exists, 1); assert.equal(f.after.same_held, 1);
        assert.deepEqual(f.after.item, f.immediate.item);
    }
    return { consumed: 10, destroyed_after_return: Number(source.amount === 10) };
}

export function validateMingjiaoRemainingPerformRecord(raw, condition) {
    const p = validateMingjiaoRemainingPerformCondition(condition);
    map(raw); assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), condition.method);
    const index = nonnegative(own(raw, 'index')); assert.ok(index < condition.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(own(raw, 'outcome')));
    text(own(raw, 'reason'));
    if (['error', 'not_applicable'].includes(raw.outcome)) { assert.ok(raw.reason.trim()); return null; }
    const configs = [p.actor, p.target, ...(p.extra_target ? [p.extra_target] : [])], roles = configs.length;
    const phases = {};
    for (const phase of ['before', 'immediate', 'after']) {
        const states = array(own(raw, phase)); assert.equal(states.length, 2);
        phases[phase] = [...states];
        if (roles === 3) phases[phase].push(own(raw, 'extra_target_' + phase));
        else assert.ok(!Object.hasOwn(raw, 'extra_target_' + phase));
        phases[phase].forEach((s, side) => snapshot(s, side, phase === 'before' ? undefined : phases.before[side].object, p));
        assert.equal(new Set(phases[phase].map(s => s.object)).size, roles);
    }
    const { before, immediate, after } = phases;
    before.forEach((s, side) => initial(s, configs[side], side, p));
    for (let side = 0; side < roles; side++) for (const state of [immediate[side], after[side]]) {
        for (const key of stable) assert.deepEqual(own(state, key), before[side][key], 'unexpected mutation ' + side + '/' + key);
        for (const slot of ['weapon', 'handing', 'secondary_weapon']) {
            if (p.ability === 'hua' && side === 0 && slot === 'handing') continue;
            assert.equal(state[slot], before[side][slot]);
            const old = before[side][slot + '_details'], current = state[slot + '_details'];
            if (!Object.keys(old).length) assert.deepEqual(current, old);
            else {
                const { consistence: oldWear, ...oldItem } = old, { consistence: wear, ...item } = current;
                assert.deepEqual(item, oldItem, 'same original equipped object');
                if (oldWear === null) assert.equal(wear, null);
                else assert.ok(nonnegative(wear) <= oldWear, 'original wear cannot repair equipment');
            }
        }
    }
    if (p.target_state === 'unconscious') {
        const prep = map(own(raw, 'preparation'));
        snapshot(own(prep, 'before'), 1, before[1].object, p); initial(prep.before, p.target, 1, p, true);
        assert.deepEqual(own(prep, 'after'), before[1]);
        const terminals = array(own(prep, 'terminals')); assert.ok(terminals.length > 0, 'missing original unconscious preparation');
    }
    const metrics = array(own(raw, 'metrics')); assert.equal(metrics.length, 2);
    const allMetrics = [...metrics]; if (roles === 3) allMetrics.push(own(raw, 'extra_target_metrics'));
    else assert.ok(!Object.hasOwn(raw, 'extra_target_metrics'));
    const account = before.map((s, side) => resourceAccount(s, after[side], allMetrics[side]));
    const cost = nonnegative(own(raw, 'command_accepted')), accepted = Number(cost > 0);
    const context = map(own(raw, 'command_context'));
    assert.equal(own(context, 'action'), p.action); assert.equal(own(context, 'actor'), before[0].object);
    assert.equal(own(context, 'force_me_source'), '/feature/command');
    const lists = {};
    for (const name of ['launches', 'refusals', 'perform_steps', 'actions', 'attacks', 'directs', 'passives',
        'busy_calls', 'skill_messages', 'needle_hits', 'terminals']) lists[name] = array(own(raw, name));
    assert.deepEqual(lists.terminals, [], 'sample terminal is not a preparation terminal');
    assert.ok(lists.perform_steps.length <= 1, 'one original do_perform only');
    if (lists.perform_steps.length) {
        const s = lists.perform_steps[0];
        assert.equal(own(s, 'argument'), p.action.slice('perform '.length));
        assert.equal(own(s, 'owner'), '/cmds/skill/perform'); assert.equal(own(s, 'caller_side'), 0);
        assert.equal(bit(own(s, 'accepted')), accepted); text(own(s, 'reason'));
        assert.deepEqual(own(s, 'before'), before); assert.deepEqual(own(s, 'after'), immediate);
        if (accepted) assert.equal(s.reason, '');
    } else assert.equal(accepted, 0, 'accepted command missing original step');
    lists.launches.forEach(x => {
        assert.equal(own(x, 'actor'), before[0].object); assert.equal(own(x, 'skill'), p.skill);
        assert.equal(own(x, 'argument'), p.action.slice(('perform ' + p.usage + '.').length));
    });
    assert.equal(lists.launches.length, accepted, 'actual successful dispatch/command mismatch');
    assert.equal(raw.outcome, accepted ? 'observed' : 'refused', 'actual command outcome, not planned expectation');
    lists.refusals.forEach(x => { assert.equal(own(x, 'actor'), before[0].object); assert.ok(text(own(x, 'reason')).trim()); });
    if (!accepted) {
        assert.ok(lists.refusals.length); assert.equal(raw.reason, lists.refusals.at(-1).reason);
    } else assert.equal(raw.reason, '');
    const enemies = map(own(raw, 'enemy_context'));
    for (const phase of ['before', 'immediate', 'after']) {
        const values = array(own(enemies, phase)); assert.equal(new Set(values).size, values.length);
        values.forEach(side => { nonnegative(side); assert.ok(side > 0 && side < roles); });
    }
    assert.deepEqual([...enemies.before].sort(), p.fighting ? (roles === 3 ? [1, 2] : [1]) : []);
    for (const x of lists.attacks) {
        pair(x, roles, p.ability === 'nuoyi');
        const type = own(x, 'type');
        if (type === null) assert.ok(p.ability === 'nuoyi' && roles === 3 && x.actor === 1 && x.target === 2,
            'only original NUOYI forward call omits attack_type');
        else assert.ok([0, 1, 2].includes(type));
        assert.ok([0, -1, -2].includes(own(x, 'result')));
        nonnegative(own(x, 'damage')); int(own(x, 'neili'));
        const apply = own(x, 'apply_attack'); if (apply !== null) int(apply);
    }
    for (const x of lists.directs) {
        pair(x, roles); assert.equal(x.actor, 0); assert.equal(x.target, 1);
        assert.equal(own(x, 'type'), p.mechanics.direct_type === 'WEAPON_ATTACK' ? 1 : 0);
        assert.ok(p.mechanics.direct_type !== null, 'unexpected COMBAT direct input');
        assert.equal(own(x, 'percent'), p.mechanics.direct_percent); nonnegative(own(x, 'damage'));
        assert.equal(own(x, 'weapon'), before[x.actor].weapon);
        assert.equal(own(x, 'weapon_object'), before[x.actor].weapon_details.object ?? '');
    }
    for (const x of lists.actions) {
        pair(x, roles, p.ability === 'nuoyi'); map(own(x, 'action'));
        const skill = own(x, 'skill'), mappings = before[x.actor].mappings;
        if (skill === null || skill === 0) assert.equal(Object.keys(mappings).length, 0, 'unmapped real actor only');
        else { text(skill); assert.ok(Object.values(mappings).includes(skill), 'selected skill outside actual mappings'); }
    }
    for (const x of lists.passives) {
        pair(x, roles, p.ability === 'nuoyi'); text(own(x, 'skill')); text(own(x, 'route'));
        assert.ok(Object.values(before[x.actor].mappings).includes(x.skill), 'passive skill outside original actor mappings');
        for (const key of ['incoming', 'factor', 'neili_after', 'target_eff_qi_after']) int(own(x, key));
        const result = own(x, 'result');
        assert.equal(p.ability, 'kuai', 'only KUAI reaches mapped ordinary passives in this fixed group');
        assert.equal(x.actor, 0); assert.equal(x.target, 1);
        if (x.skill === 'xiaoyao-jian') {
            assert.equal(x.route, 'martial');
            assert.ok(result === 0 || result === 1, 'original Xiaoyao explicit return');
        } else if (x.skill === 'shenghuo-xinfa') {
            assert.equal(x.route, 'force');
            // Current frozen target has force 0 and no force mapping. FORCE's reflection mapping
            // requires a strictly stronger target; it is not reachable in these prepared roles.
            assert.equal(x.actor, 0); assert.equal(before[x.target].skills.force, 0);
            assert.ok(!before[x.target].mappings.force);
            if (result !== null) int(result);
        } else assert.fail('unreachable mapped passive in this fixed group');
        const busy = own(x, 'target_busy_after'); if (busy !== null) nonnegative(busy);
        for (const phase of ['before', 'after']) {
            const states = array(own(x, phase)); assert.equal(states.length, 2);
            snapshot(states[0], x.actor, before[x.actor].object, p); snapshot(states[1], x.target, before[x.target].object, p);
        }
        assert.equal(x.neili_after, x.after[0].neili);
        assert.equal(x.target_eff_qi_after, x.after[1].eff_qi);
        assert.deepEqual(x.target_busy_after, x.after[1].busy);
        if (x.skill === 'xiaoyao-jian') {
            const a = x.before[0], t = x.before[1], level = a.skills['xiaoyao-jian'];
            assert.equal(a.neili - x.after[0].neili, result ? 80 : 0);
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(a[key], x.after[0][key]);
            for (const key of resources) assert.equal(t[key], x.after[1][key]);
            if (result) {
                assert.ok(level >= 130 && a.neili >= 150 && a.skills.dodge >= 180 && a.skills.force >= 150);
                zero(t.busy);
                assert.ok(Math.trunc(level / 2) + level - 1 >= t.skills.dodge, 'original random support');
                assert.ok(x.after[1].busy >= 2 && x.after[1].busy <= 1 + Math.trunc(level / 30));
            } else assert.deepEqual(x.after[1].busy, t.busy);
        }
    }
    for (const x of lists.busy_calls) {
        assert.ok(nonnegative(own(x, 'side')) < roles); assert.equal(own(x, 'caller_side'), 0);
        nonnegative(own(x, 'requested'));
        for (const phase of ['before', 'after']) { const b = own(x, phase); if (b !== null) nonnegative(b); }
        if (x.requested === 0) { assert.equal(own(x, 'zero_return'), 1); assert.deepEqual(x.after, x.before); }
        else assert.ok(!Object.hasOwn(x, 'zero_return'));
    }
    for (const x of lists.skill_messages) { assert.ok(nonnegative(own(x, 'side')) < roles); text(own(x, 'type')); text(own(x, 'text')); }
    for (const x of lists.needle_hits) {
        pair(x, roles); assert.equal(p.ability, 'hua'); assert.equal(x.actor, 0); assert.equal(x.target, 1);
        assert.equal(own(x, 'program'), '/clone/weapon/flower_leaf'); assert.equal(own(x, 'object'), before[0].handing_details.object);
        nonnegative(own(x, 'damage_bonus'));
    }
    allMetrics.forEach((m, side) => {
        for (const [name, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
            assert.equal(counter(m, name), lists.attacks.filter(a => a.actor === side && a.result === result).length);
        for (const [name, type] of [['quick', 2], ['riposte', 1]])
            assert.equal(counter(m, name), lists.attacks.filter(a => a.actor === side && a.type === type).length);
        assert.equal(counter(m, 'direct'), lists.directs.filter(a => a.actor === side).length);
        assert.equal(counter(m, 'ability_launched'), side === 0 ? lists.launches.length : 0);
    });
    const petals = flower(raw, p, before[0], immediate[0], after[0], accepted);
    assert.ok(lists.directs.length <= 1);
    if (!accepted) {
        for (const key of ['actions', 'attacks', 'directs', 'passives', 'busy_calls', 'needle_hits']) assert.deepEqual(lists[key], []);
        for (const side of account) for (const resource of Object.values(side)) {
            assert.equal(resource.decrease, 0); assert.equal(resource.recovery, 0);
        }
    } else {
        const fees = p.mechanics.perform_neili_fees, observedFee = account[0].neili.decrease;
        assert.equal(account[0].neili.recovery, 0, 'no natural recovery in this immediate window');
        if (p.ability === 'kuai') {
            const extra = lists.passives.filter(x => x.skill === 'xiaoyao-jian' && x.result === 1).length * 80;
            const base = observedFee - extra;
            assert.ok(base >= 120 && base <= 270 && base % 30 === 0, 'original KUAI fee support, not an observed planned N');
        } else if (typeof fees.accepted === 'number') assert.equal(observedFee, fees.accepted, 'original accepted fee');
        else if (p.mechanics.direct_type !== null)
            assert.equal(observedFee, (lists.directs.length ? fees.outer_hit : fees.outer_miss)
                + lists.directs.length * before[0].jiali, 'original direct branch fee plus observed public jiali');
        else assert.ok([fees.outer_hit, fees.outer_miss].includes(observedFee), 'original control fee support');
    }
    const poison = after.map((s, side) => {
        const values = emptyMapping(s.conditions), names = Object.keys(values);
        for (const name of names) {
            assert.equal(side, 1); assert.equal(name, p.mechanics.poison?.name);
            const seed = map(values[name]); assert.equal(own(seed, 'id'), before[0].id);
            nonnegative(own(seed, 'level')); nonnegative(own(seed, 'remain'));
            const jiali = before[0].jiali;
            assert.ok(seed.level >= jiali && seed.level <= Math.max(0, jiali * 2 - 1));
            assert.equal(lists.directs.length, 1, 'final poison needs the original direct call');
            if (seed.level === 0) assert.equal(seed.remain, 0);
            else {
                const duration = seed.remain / seed.level, level = before[0].skills[p.skill];
                int(duration);
                assert.ok(duration >= Math.trunc(level / 50)
                    && duration <= Math.trunc(level / 50) + Math.trunc(level / 20) - 1, 'original final poison duration support');
            }
        }
        return copy(values);
    });
    const learnedNet = before.map((s, side) => {
        const a = learned(s), b = learned(after[side]);
        return Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(k => [k, (b[k] ?? 0) - (a[k] ?? 0)]));
    });
    return { outcome: raw.outcome, matched: raw.outcome === p.expected, command_cost: cost, commands_accepted: accepted,
        roles: before.map(s => ({ object: s.object, id: s.id })), resources: account,
        target_new_control: before.slice(1).map((s, side) => ({ side: side + 1,
            increased: Number((after[side + 1].busy ?? 0) > (s.busy ?? 0)) })),
        actual_calls: { attacks: lists.attacks.length, direct_inputs: lists.directs.length, selected_actions: lists.actions.length,
            passives: lists.passives.length, busy_requests: lists.busy_calls.length, equipment_hit_ob: lists.needle_hits.length },
        attack_results: { hit: lists.attacks.filter(a => a.result === 0).length, dodge: lists.attacks.filter(a => a.result === -1).length,
            parry: lists.attacks.filter(a => a.result === -2).length },
        direct_inputs: copy(lists.directs), busy_requests: copy(lists.busy_calls), poison_seed: poison, flower: petals,
        learned_net: learnedNet, learned_raw_types: { before: before.map(s => s.learned_kind), after: after.map(s => s.learned_kind) },
        unknown: { requested_gross_damage: null, requested_gross_wound: null, planned_kuai_attacks: null,
            learned_gross: null, poison_natural_lifecycle: null, busy_natural_release: null },
    };
}
