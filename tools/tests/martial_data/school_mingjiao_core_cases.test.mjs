import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { scanSource } from './inventory.mjs';
import { mingjiaoCoreConditions, mingjiaoCoreSourcePaths, mingjiaoCoreActions,
    validateMingjiaoCoreRecord, mingjiaoCoreEffects } from './school_mingjiao_core_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const hash = value => createHash('sha256').update(value).digest('hex');
const skill = 'hanbing-mianzhang', grant = `can_perform/${skill}/jue`;
const copy = structuredClone;
const catalog = { skills: [skill, `${skill}/jue`].map(id => {
    const path = `kungfu/skill/${id}.c`, text = read(path), parsed = scanSource(text);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: hash(text), entries: parsed.functions.filter(f => ['perform', 'query_action'].includes(f.name))
        .map(f => ({ id: `${path}:${f.line}:${f.name}`, role: f.name })) };
}) };
const cases = mingjiaoCoreConditions(catalog, read), smoke = mingjiaoCoreConditions(catalog, read, { smoke: true });
const pick = (method = 'perform', variant = 'baseline', level = 200) => {
    const c = cases.find(c => c.id === `school-mingjiao-core-${method}-l${level}-${variant}`);
    assert.ok(c); return c;
};
function snapshot(cfg, side, fighting) {
    const special = k => k.includes('/') || k === 'character';
    const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !special(k))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => special(k))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: Number(fighting), killing_opponent: Number(fighting),
        busy: null, skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations),
        preparation_order: Object.keys(cfg.preparations), learned: {}, temp: { apply }, conditions: null,
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, level]) =>
            [key, Math.trunc(level / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc((cfg.skills.strike ?? 0) / 10),
        effective_con: cfg.properties.con + Math.trunc(cfg.skills.force / 10),
        weapon: cfg.equipment ? 'sword' : 'none', weapon_damage: cfg.equipment ? 50 : 0, weapon_flag: cfg.equipment ? 4 : 0,
        weapon_details: cfg.equipment ? { object: '/tests/sword#202', program: '/tests/sword', skill_type: 'sword',
            weight: 3000, flag: 4, damage: 50, consistence: 100 } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {} };
}
// Synthetic source-reachable records test only the validator. No real combat/model is claimed here.
function trace(c, options = {}) {
    const p = c.parameters, accepted = p.expected === 'observed', perform = c.method === 'perform';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, outcome: p.expected,
        before, immediate: copy(before), after: [], metrics: [{}, {}],
        actions: [], attacks: [], dodge_checks: [], passives: [], launches: [], refusals: [], defenses: [],
        interfaces: [], dropped: [], terminals: [], callbacks: [], skill_loads: [], reason: '', elapsed: 0.01 };
    const [a, t] = raw.immediate;
    if (perform) raw.command_accepted = accepted ? 476 : 0;
    if (!accepted) {
        const text = p.refusal_scope === 'command' ? '你现在的掌法(strike)' + p.refusal : p.refusal;
        raw.reason = '\x1b[256D\x1b[K' + text; a.temp.notify_fail = text;
        raw.refusals = [{ actor: a.object, reason: raw.reason }];
    } else {
        const n = perform ? options.n ?? 3 : 1;
        const ap = a.effective_skills.strike, reachable = Math.trunc(ap / 2) + ap - 1 > t.effective_skills.parry;
        const bonus = perform && reachable && options.gate !== false ? Math.trunc(ap / 2) : 0;
        if (perform) {
            raw.launches = [{ actor: a.object, skill, argument: 'jue right' }];
            raw.metrics[0].ability_launched = 1; raw.metrics[0].neili_cost = 30 * n; a.neili -= 30 * n;
            a.temp.apply.attack = bonus; a.temp.apply.damage = Math.trunc(bonus / 2);
            a.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        }
        for (let i = 0; i < n; i++) {
            if (perform && !(t.busy ?? 0) && i % 2 === 0) t.busy = 1;
            const eligible = mingjiaoCoreActions.filter(x => p.actor.skills[skill] > x.lvl).slice(-6);
            const action = copy(eligible[options.actionIndex ?? 0]);
            a.temp.fight = { attack: null, dodge: action.dodge, parry: action.parry };
            raw.actions.push({ actor: 0, target: 1, skill, action });
            for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1,
                type: 0, phase, ap: 1000, dp: phase === 'settled' && t.busy ? 100 : 300, busy: t.busy, skill: null });
            const force = a.effective_str + Math.trunc(action.force * a.effective_str / 100), incoming = Math.trunc(force / 3);
            const result = options.results?.[i] ?? 0;
            let damage = incoming + Math.trunc(incoming * (a.str * 2 + a.effective_str) / 300);
            damage = damage > 400 ? Math.trunc((damage - 400) / 4) + 300 : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
            if (result !== 0 || options.zeroDamage?.includes(i)) damage = 0;
            if (result === 0) raw.passives.push({ actor: 0, target: 1, skill, incoming, factor: 0, route: 'martial', result: null,
                before: copy([a, t]), after: copy([a, t]), neili_after: a.neili,
                target_eff_qi_after: t.eff_qi, target_busy_after: t.busy });
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage, attack_usage: 'strike', attack_skill: skill,
                action_flag: null, apply_attack: a.temp.apply.attack ?? null, apply_damage: a.temp.apply.damage ?? null,
                apply_unarmed_damage: null, neili: a.neili });
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) { raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage; t.qi -= damage; t.busy = 0; }
        }
        if (perform) { a.temp.apply.attack = 0; a.temp.apply.damage = 0; a.busy = options.busy ?? 1;
            if ((options.progress ?? 1) > 0) a.learned[skill] = options.progress ?? 1; }
    }
    raw.after = copy(raw.immediate); return raw;
}
function reject(c, mutate, options) { const raw = trace(c, options); mutate(raw); raw.after = copy(raw.immediate);
    assert.throws(() => validateMingjiaoCoreRecord(raw, c)); }

test('15 frozen conditions / 814 formal / 30 smoke; explicit USER route and asymmetric gate target', () => {
    assert.equal(cases.length, 15); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 814);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 30);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 7);
    assert.deepEqual(smoke.map(({ samples, ...c }) => c), cases.map(({ samples, ...c }) => c));
    assert.equal(new Set(cases.map(c => c.id)).size, 15);
    for (const c of cases) { const p = c.parameters;
        assert.equal(p.actor.properties.jiali, 0); assert.equal(p.target.properties.jiali, 0);
        assert.equal(p.target.skills.parry, p.level * 3); assert.deepEqual(p.target.mappings, {});
        assert.equal(p.actor.properties['family/family_name'], '明教');
        assert.equal(p.actor.temp, undefined); assert.equal(p.target.temp, undefined);
        assert.equal(p.observe_seconds, 0); assert.equal(p.named_participants, true);
        assert.equal(p.actor.properties.max_neili, 6000);
    }
});
test('all original source bytes / catalog entry / static text and strict prefix frozen', () => {
    for (const c of cases) for (const path of mingjiaoCoreSourcePaths) assert.equal(c.parameters.source_evidence[path], hash(read(path)));
    const text = read(`kungfu/skill/${skill}.c`);
    for (const action of mingjiaoCoreActions) for (const [key, value] of Object.entries(action))
        assert.ok(text.includes(`"${key}": ${typeof value === 'number' ? value : JSON.stringify(value)}`), key + '/' + value);
    assert.match(text, /level > action\[i - 1\]\["lvl"\]/);
    assert.match(read(`kungfu/skill/${skill}/jue.c`), /add_temp\("apply\/damage", count \/ 2\)/);
    assert.throws(() => mingjiaoCoreConditions(catalog, path => read(path) + (path.endsWith('combatd.c') ? '\n' : '')));
    for (const bad of [c => c.skills[0].sha256 = '0'.repeat(64), c => c.skills[1].entries = [],
        c => c.skills[1].path = 'wrong.c', c => c.skills[1].entries[0].id += ':other']) {
        const broken = copy(catalog); bad(broken); assert.throws(() => mingjiaoCoreConditions(broken, read));
    }
    for (const samples of [0, -1, NaN, 0.5, Infinity, '100']) assert.throws(() => mingjiaoCoreConditions(catalog, read, { samples }));
});
test('every synthetic condition closes resource/identity/transient effects without mutating evidence', () => {
    for (const c of cases) { const raw = trace(c), frozen = JSON.stringify(raw);
        assert.equal(validateMingjiaoCoreRecord(raw, c).accepted, c.parameters.expected === 'observed');
        assert.equal(JSON.stringify(raw), frozen);
    }
    for (const n of [3, 4, 5, 6, 7]) for (const gate of [true, false]) {
        const c = pick(), raw = trace(c, { n, gate, results: [0, -1, -2, 0, 0, -1, 0], zeroDamage: [3] });
        const out = validateMingjiaoCoreRecord(raw, c); assert.equal(out.attacks, n);
        assert.equal(out.attack_bonus, gate ? 150 : 0); assert.equal(out.neili_cost, n * 30);
    }
    for (const method of ['ordinary', 'perform']) for (const level of [200, 400, 800]) {
        const c = pick(method, 'baseline', level);
        for (const actionIndex of [0, 5]) validateMingjiaoCoreRecord(trace(c, { actionIndex }), c);
    }
});
test('counterexamples reject missing observation, invented extra damage/poison, lost restoration and gate/resource drift', () => {
    const c = pick();
    for (const key of ['actions', 'passives', 'dodge_checks', 'skill_loads', 'command_accepted']) reject(c, r => delete r[key]);
    for (const key of ['apply_attack', 'apply_damage', 'apply_unarmed_damage', 'neili']) reject(c, r => delete r.attacks[0][key]);
    for (const mutate of [r => r.before[0].wizardp = 1, r => r.before[0].userp = 0,
        r => r.before[0].cultivation[grant] = 0, r => r.before[1].effective_skills.parry--,
        r => r.before[0].jiali = 10, r => r.immediate[0].temp.apply.attack = 150,
        r => r.immediate[0].temp.apply.damage = 75, r => r.immediate[0].temp.apply.unarmed_damage = 75,
        r => r.attacks[0].apply_damage = 76, r => r.attacks[0].apply_unarmed_damage = 75,
        r => r.attacks[1].apply_attack = 0, r => r.attacks[0].neili++,
        r => r.attacks[0].damage++, r => r.passives[0].incoming = 999,
        r => r.passives[0].after[1].conditions = { ice_poison: 10 },
        r => r.passives[0].after[1].temp.poison = { ice_poison: 10 },
        r => r.passives[0].result = 'poison triggered', r => r.metrics[0].neili_cost--,
        r => r.immediate[1].qi--, r => r.immediate[0].busy = 0,
        r => r.immediate[0].busy = 4, r => r.immediate[0].learned[skill] = 2,
        r => r.immediate[0].fighting_opponent = 0, r => r.immediate[1].temp.unexplained = 1,
        r => r.actions[0].action.lvl = 0, r => r.dodge_checks[1].dp = 300,
        r => r.attacks.pop(), r => r.passives.pop(), r => r.launches[0].argument = 'jue',
        r => r.attacks[0].attack_usage = 'sword', r => r.metrics[1].hit = 1]) reject(c, mutate);
    for (const cost of [null, false, '1', -1, 0, 0.5, NaN, Infinity]) reject(c, r => r.command_accepted = cost);
    const ordinary = pick('ordinary'); reject(ordinary, r => r.immediate[0].learned[skill] = 1);
    reject(ordinary, r => r.immediate[0].busy = 1); reject(ordinary, r => r.metrics[0].quick = 1);
    reject(ordinary, r => r.attacks[0].apply_attack = 150);
    for (const refused of cases.filter(c => c.parameters.expected === 'refused')) {
        reject(refused, r => r.command_accepted = 1); reject(refused, r => r.launches.push({}));
        reject(refused, r => r.immediate[0].temp.unrelated = 1); reject(refused, r => r.reason = 'no');
    }
});
test('jue count0 still attacks/charges, ordinary no command/gate accounting; errors stay unknown', () => {
    const c = pick(), records = [trace(c, { gate: false }), trace(c, { gate: true, n: 7 })];
    const out = mingjiaoCoreEffects(records, c);
    assert.equal(out.counts.observed, 2); assert.equal(out.unknown_effect_samples, 0);
    assert.equal(out.poison_effect_samples, 0); assert.equal(out.actor_neili_cost.n, 2);
    const ordinary = pick('ordinary'), raw = trace(ordinary);
    assert.equal(validateMingjiaoCoreRecord(raw, ordinary).gate_bonus, null);
    const unknown = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: 'error' };
    assert.equal(mingjiaoCoreEffects([unknown], c).unknown_effect_samples, 1);
    assert.throws(() => mingjiaoCoreEffects([{ condition_id: c.id, outcome: 'observed', raw: unknown }], c));
});

test('原单击伤口整数支持与相邻快照闭合，不能用总伤害上界放过不可能创伤', () => {
    const c = pick('ordinary'), raw = trace(c), [actor, target] = raw.before;
    const incoming = raw.passives[0].incoming;
    let wound = incoming + Math.trunc(incoming * (actor.str * 2 + actor.effective_str) / 300);
    // Reachable original draws: no INT bonus, armor draw 0, wound branch entered.
    wound = wound > 400 ? Math.trunc((wound - 400) / 4) + 300
        : wound > 200 ? Math.trunc((wound - 200) / 2) + 200 : wound;
    wound -= Math.trunc(wound * 20 / 100);
    wound -= Math.trunc(wound * (target.con - 10) / 100);
    assert.ok(wound > 0);
    raw.metrics[1].eff_qi_cost = wound;
    raw.immediate[1].eff_qi -= wound;
    raw.after = copy(raw.immediate);
    assert.equal(validateMingjiaoCoreRecord(raw, c).wound, wound);
    const impossible = copy(raw), invented = raw.attacks[0].damage;
    assert.ok(invented > wound);
    impossible.metrics[1].eff_qi_cost = invented;
    impossible.immediate[1].eff_qi = target.eff_qi - invented;
    impossible.after = copy(impossible.immediate);
    assert.throws(() => validateMingjiaoCoreRecord(impossible, c), /per-hit wound support/);
    const missing = copy(raw); delete missing.passives[0].before[1].eff_qi;
    assert.throws(() => validateMingjiaoCoreRecord(missing, c));
});
