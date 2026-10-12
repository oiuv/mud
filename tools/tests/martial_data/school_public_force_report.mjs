// Summaries consume already-validated observations; no success is inferred from an exert return alone.
import { isDeepStrictEqual } from 'node:util';
import { distribution } from './statistics.mjs';

const states = rows => rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
const metric = (r, side, name) => r.metrics?.[side] ? r.metrics[side][name] ?? 0 : null;
const resourceKeys = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const net = (r, side, key) => r.after?.[side]?.[key] - r.before?.[side]?.[key];

function sides(raw) {
    return [0, 1].map(side => ({
        net: Object.fromEntries(resourceKeys.map(key => [key, distribution(raw.map(r => net(r, side, key)))])),
        cost: Object.fromEntries(resourceKeys.map(key => [key, distribution(raw.map(r => metric(r, side, key + '_cost')))])),
        recovery: Object.fromEntries(resourceKeys.map(key => [key, distribution(raw.map(r => metric(r, side, key + '_recovery')))])),
    }));
}

export function publicForceEffects(rows) {
    const raw = states(rows);
    const accepted = raw.filter(r => r.command_accepted === 1);
    const keys = [...new Set(raw.flatMap(r => [0, 1].flatMap(side => [
        ...Object.keys(r.before?.[side]?.temp?.apply ?? {}), ...Object.keys(r.after?.[side]?.temp?.apply ?? {}),
    ])))].sort();
    return { attempts: raw.length, command_accepted: accepted.length,
        launched: raw.filter(r => r.launches?.length).length,
        // Restricted to these measured fields, not an assertion about all possible gameplay effects.
        accepted_without_measured_change: accepted.filter(r => [0, 1].every(side => {
            const b = r.before?.[side], a = r.after?.[side];
            return b && a && resourceKeys.every(k => Number.isFinite(b[k]) && b[k] === a[k])
                && b.busy === a.busy && isDeepStrictEqual(b.conditions, a.conditions)
                && isDeepStrictEqual(b.temp?.apply, a.temp?.apply)
                && ['power', 'tianmo'].every(k => (b.temp?.[k] ?? 0) === (a.temp?.[k] ?? 0));
        })).length,
        sides: sides(raw),
        apply_delta: [0, 1].map(side => Object.fromEntries(keys.map(key => [key,
            distribution(raw.map(r => r.before?.[side] && r.after?.[side]
                ? (r.after[side].temp?.apply?.[key] ?? 0) - (r.before[side].temp?.apply?.[key] ?? 0) : null)),
        ]))),
        flags_after: Object.fromEntries(['power', 'tianmo'].map(key => [key,
            raw.filter(r => r.after?.[0]?.temp?.[key] === 1).length])),
    };
}

export function dispelEffects(rows, parameters) {
    const raw = states(rows), side = parameters.other ? 1 : 0, name = parameters.condition_name;
    const outcomes = { cleared: 0, partial: 0, unchanged: 0, other_change: 0, unknown: 0 };
    const remain = [], actorBusy = [], targetBusy = [];
    for (const r of raw) {
        const b = r.before?.[side], a = r.after?.[side];
        actorBusy.push(r.after?.[0]?.busy === null ? 0 : r.after?.[0]?.busy);
        targetBusy.push(r.after?.[1]?.busy === null ? 0 : r.after?.[1]?.busy);
        if (!b || !a || !Object.hasOwn(b, 'conditions') || !Object.hasOwn(a, 'conditions')
            || !Object.hasOwn(b.conditions || {}, name)) { outcomes.unknown++; remain.push(null); continue; }
        const before = b.conditions[name], after = (a.conditions || {})[name];
        if (after === undefined) { outcomes.cleared++; remain.push(0); }
        else {
            remain.push(typeof after === 'number' ? after : after.remain);
            if (isDeepStrictEqual(before, after)) outcomes.unchanged++;
            else if (typeof before === 'object' && typeof after === 'object'
                && Number.isInteger(after.remain) && after.remain > 0
                && after.remain < (before.remain === -1 ? 10000 : before.remain)) outcomes.partial++;
            else outcomes.other_change++;
        }
    }
    return { attempts: raw.length, command_accepted: raw.filter(r => r.command_accepted === 1).length,
        outcomes, remaining_value: distribution(remain), actor_busy: distribution(actorBusy),
        target_busy: distribution(targetBusy), sides: sides(raw) };
}

export function buffSequenceEffects(rows) {
    const raw = states(rows), steps = raw.flatMap(r => r.buff_steps ?? []);
    const commands = steps.filter(s => s.operation?.command), probes = raw.filter(r => r.persistence);
    return { attempts: raw.length, command_steps: commands.length,
        accepted_steps: commands.filter(s => s.accepted === 1).length,
        refused_steps: commands.filter(s => s.accepted === 0).length,
        experimental_refills: steps.filter(s => s.operation?.refill_neili !== undefined).length,
        persistence_probes: probes.length,
        restored_without_buff: probes.filter(r => r.persistence.restored === 1
            && r.persistence.after && Object.hasOwn(r.persistence.after, 'temp')
            && !r.persistence.after.temp?.power && !r.persistence.after.temp?.tianmo).length,
        ...publicForceEffects(rows) };
}

export function healingEffects(rows, ability) {
    if (!['heal', 'inspire'].includes(ability)) throw new Error('未知疗伤入口');
    const raw = states(rows), key = ability === 'heal' ? 'qi' : 'jing', eff = 'eff_' + key;
    const flag = ability === 'heal' ? 'healing' : 'inspiring';
    const traced = raw.filter(r => r.outcome === 'observed' && r.healing_steps?.length);
    const cycles = r => r.healing_steps.filter(s => s.phase === 'after').map((s, i) => ({
        before: r.healing_steps[i * 2].state, after: s.state,
    }));
    const gain = r => cycles(r).reduce((n, s) => n + s.after[eff] - s.before[eff], 0);
    const cost = r => cycles(r).reduce((n, s) => n + s.before.neili - s.after.neili, 0);
    const terminal = r => {
        if (r.healing_terminal === 'halted') return 'halted';
        const last = cycles(r).at(-1);
        if (!last || last.after.busy !== 0) return 'unknown';
        if (!last.before.mappings.force) return 'unmapped';
        if (last.before[eff] >= last.before['max_' + key]) return 'completed';
        if (last.before.neili < (ability === 'heal' ? 50 : 100)) return 'depleted';
        return 'unknown';
    };
    return { attempts: raw.length, command_accepted: raw.filter(r => r.command_accepted === 1).length,
        traced: traced.length, sides: sides(raw),
        callback_count: distribution(traced.map(r => cycles(r).length)),
        treatment_callbacks: distribution(traced.map(r => cycles(r).filter(s => s.before.neili > s.after.neili).length)),
        callback_curing: distribution(traced.map(gain)), callback_neili_cost: distribution(traced.map(cost)),
        halt_neili_cost: distribution(traced.filter(r => r.healing_terminal === 'halted').map(r =>
            r.healing_halt?.before?.neili - r.healing_halt?.after?.neili)),
        effective_gain_outside_callbacks: distribution(traced.map(r => net(r, 0, eff) - gain(r))),
        elapsed: distribution(traced.map(r => r.elapsed)),
        terminals: Object.fromEntries(['completed', 'depleted', 'halted', 'unmapped', 'unknown']
            .map(t => [t, traced.filter(r => terminal(r) === t).length])),
        pending_residual: traced.filter(r => r.after?.[0]?.temp?.pending?.[flag] === 1).length,
    };
}
