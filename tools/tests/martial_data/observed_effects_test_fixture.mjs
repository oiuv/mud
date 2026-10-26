// Synthetic point-window records for consumer mutation tests, never native evidence.
export function pointRecord(condition) {
    const p = condition.parameters;
    const state = (cfg, side) => {
        const s = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
            max_jing: 10000, neili: 8000, max_neili: 8000, ...cfg.properties,
            object: `/tests/actor#${side + 1}`, userp: 1, playerp: 1, interactive: 1, wizardp: 0,
            living: 1, ghost: 0, busy: null, weapon: cfg.equipment?.type ?? 'none',
            temp: { apply: {} }, skills: structuredClone(cfg.skills),
            mappings: structuredClone(cfg.mappings), preparations: structuredClone(cfg.preparations) };
        s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0)]));
        return s;
    };
    const before = [state(p.actor, 0), state(p.target, 1)];
    return { kind: 'sample', condition_id: condition.id, method: condition.method, index: 0, elapsed: 0,
        outcome: p.expected, before, after: structuredClone(before), metrics: [{ neili_cost: 0 }, { neili_cost: 0 }],
        command_accepted: p.expected === 'observed' ? 1 : 0,
        launches: p.expected === 'observed' ? [{ actor: before[0].object, skill: p.skill, argument: p.ability }] : [],
        attacks: [], passives: [], dropped: [], reason: p.expected === 'refused' ? '未领悟' : '' };
}

export function canheYouRecord(condition) {
    const raw = pointRecord(condition);
    if (condition.parameters.expected === 'refused') return raw;
    raw.metrics[0].neili_cost = 300; raw.after[0].neili -= 300; raw.after[0].busy = 1;
    raw.attacks = Array.from({ length: 6 }, () => ({ actor: 0, target: 1, result: -2, damage: 0, type: 0 }));
    return raw;
}

export function bahuangPowerupRecord(condition) {
    const raw = pointRecord(condition), level = raw.before[0].skills['bahuang-gong'];
    raw.metrics[0].neili_cost = 100; raw.after[0].neili -= 100;
    raw.after[0].temp = { powerup: 1, apply: { attack: Math.trunc(level / 2),
        dodge: Math.trunc(level / 3), parry: Math.trunc(level / 3) } };
    return raw;
}
