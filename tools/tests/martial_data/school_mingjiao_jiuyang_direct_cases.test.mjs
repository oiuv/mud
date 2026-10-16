import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mingjiaoJiuyangDirectConditions as conditions, mingjiaoJiuyangDirectSourcePaths as sources,
    mingjiaoJiuyangDirectReviewedSourceHash as reviewed, mingjiaoJiuyangDirectAbsentPaths as absent,
    validateMingjiaoJiuyangDirectCondition as condition, validateMingjiaoJiuyangDirectRecord as record,
    mingjiaoJiuyangDirectEffects as effects } from './school_mingjiao_jiuyang_direct_cases.mjs';
import { validateRecord as general } from './execution.mjs';
import { validateSchoolCombatRecord as school } from './school_combat_cases.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p), copy = v => structuredClone(v);
const hash = b => createHash('sha256').update(b).digest('hex'), skill = 'jiuyang-shengong';
const catalog = { skills: ['hun', 'po', 'pi'].map(a => { const path = `kungfu/skill/${skill}/perform/${a}.c`;
    return { path, sha256: hash(read(path)), entries: [{ id: `${path}:${a === 'hun' ? 8 : 10}:perform` }] }; }) };
const cases = conditions(catalog, read), pick = (a, v = '400') => { const c = cases.find(c => c.parameters.ability === a && c.parameters.variant === v); assert.ok(c); return c; };
function weapon(cfg, serial) {
    return { object: `${cfg.program}#${serial}`, program: cfg.program, skill_type: cfg.type, flag: cfg.type === 'dagger' ? 6 : 4,
        weight: cfg.type === 'blade' ? 7000 : 6000, material: 'steel', rigidity: null, consistence: 100,
        damage: cfg.type === 'dagger' ? 13 : 25, no_wield: null, stable: 37, is_item_make: 0 };
}
function state(cfg, side, p, awake = false) {
    const s = { object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, wizardp: 0, ghost: 0,
        living: 1, busy: cfg.busy ?? null, conditions: null, fighting_opponent: Number(p.fighting), killing_opponent: Number(p.fighting),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        cultivation: Object.fromEntries(['improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine', 'special_skill/guimai'].map(k => [k, null])),
        temp: { user_setup: 1, apply: cfg.equipment ? { armor: 100, damage: 25, dodge: -2 } : { armor: 100 }, ...(cfg.temp ?? {}) },
        craze: 0, max_craze: 5000, weapon: cfg.equipment?.type ?? 'none', weapon_damage: cfg.equipment ? 25 : 0,
        weapon_flag: cfg.equipment ? 4 : 0, weapon_details: cfg.equipment ? weapon(cfg.equipment, 200) : {},
        secondary_weapon: cfg.secondary_equipment?.type ?? 'none', secondary_weapon_details: cfg.secondary_equipment ? weapon(cfg.secondary_equipment, 201) : {},
        handing: 'none', handing_details: {}, environment: '/tests/runner', inventory: [], encumbrance: 0, max_encumbrance: 89000 };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'reborn', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    if (cfg.equipment) { s.temp.weapon = s.weapon_details.object; s.inventory.push(s.weapon_details.object); s.encumbrance += s.weapon_details.weight; }
    if (cfg.secondary_equipment) { s.temp.secondary_weapon = s.secondary_weapon_details.object; s.inventory.push(s.secondary_weapon_details.object); s.encumbrance += s.secondary_weapon_details.weight; }
    const active = k => cfg.mappings[k] === skill && (k === 'force' || cfg.properties.reborn
        && (['unarmed', 'parry'].includes(k) || cfg.properties['can_learn/jiuyang-shengong/enable_weapon'] && ['sword', 'blade'].includes(k)));
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (active(k) ? cfg.skills[skill] : 0) + (s.temp.apply[k] ?? 0)]));
    s.effective_str = s.str + Math.trunc(cfg.skills.unarmed / 10); s.effective_int = s.int;
    s.effective_con = s.con + Math.trunc(cfg.skills.force / 10); s.effective_dex = s.dex + Math.trunc(cfg.skills.dodge / 10);
    if (side && p.target_state && !awake) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
// Only clearly-labelled synthetic records, using independent original public formulas.
export function syntheticJiuyangDirectTrace(c, { hit = true, weak = 1, wear = false, intBoost = false, armorRoll = 0, busy = 2, index = 0 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed', hun = p.ability === 'hun'; hit = accepted && hit;
    const before = [state(p.actor, 0, p), state(p.target, 1, p)], raw = { kind: 'sample', condition_id: c.id, method: 'perform', index,
        elapsed: .01, outcome: p.expected, reason: '', before, immediate: copy(before), after: [], metrics: [{}, {}], interfaces: [],
        actions: [], attacks: [], passives: [], defenses: [], dodge_checks: [], callbacks: [], dropped: [], terminals: [], skill_messages: [], busy_calls: [],
        launches: [], refusals: [], directs: [], command_accepted: Number(accepted) };
    if (p.target_state) raw.preparation = { before: state(p.target, 1, p, true), after: copy(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    const [b, t] = before, [a, end] = raw.immediate;
    if (!accepted) { raw.reason = '\x1b[256D\x1b[K' + p.refusal; raw.refusals = [{ actor: b.object, reason: raw.reason }]; a.temp.notify_fail = p.refusal; }
    else {
        a.temp.notify_fail = '你所使用的外功中没有这种功能。\n'; raw.launches = [{ actor: b.object, skill, argument: p.ability + ' right' }];
        const fee = hun ? hit ? 250 : 50 : hit ? 350 : 150; a.neili -= fee; a.busy = hun ? hit ? 1 : 3 : busy;
        raw.busy_calls = [{ side: 0, caller_side: 0, requested: a.busy, before: null, after: a.busy }];
        raw.metrics[0] = { ability_launched: 1, neili_cost: fee };
        if (weak) a.learned = { [skill]: weak };
        if (hit) {
            const ap = hun ? b.skills[skill] * 2 + b.con * 10 + b.skills['martial-cognize'] : b.effective_skills[p.usage] + b.skills.force;
            const input = hun ? Math.trunc(ap / 2) : ap, percent = hun ? 50 : 85;
            raw.directs = [{ actor: 0, target: 1, type: hun ? 0 : 1, damage: input, percent,
                weapon: b.weapon, weapon_object: hun ? '' : b.weapon_details.object }]; raw.metrics[0].direct = 1;
            const strength = b.str * 2 + b.effective_str;
            const scale = strength < 40 ? strength : strength < 70 ? Math.trunc((strength - 30) / 2) + 20 : Math.trunc((strength - 60) / 4) + 30;
            const adjusted = input + (hun ? 0 : 25); let d = adjusted + Math.trunc(adjusted * scale / 50);
            if (intBoost) d += Math.trunc(d * 4 / b.int);
            d = d > 1500 ? Math.trunc((d - 1500) / 4) + 1000 : d > 500 ? Math.trunc((d - 500) / 2) + 500 : d;
            let w = Math.trunc((d - armorRoll) * percent / 100); w -= Math.trunc(w * 20 / 100); w -= Math.trunc(w * 26 / 100);
            end.qi -= d; end.eff_qi -= w; end.qi = Math.min(end.qi, end.eff_qi);
            end.craze = Math.min(5000, (d > 150 ? Math.trunc(d / 5) : 0) + (w > 150 ? Math.trunc(w / 3) : 0));
            raw.metrics[1] = { qi_cost: t.qi - end.qi, eff_qi_cost: w };
            if (!hun) { const fee = Math.trunc(input / 4) + Math.trunc(input / 8); end.neili -= fee; raw.metrics[1].neili_cost = fee;
                if (wear) a.weapon_details.consistence = 99; }
        }
        const text = hun ? hit ? '气团射得更快，只听一声惨叫，鲜血飞溅！\n' : '然而试客全力抵挡，终于将你发出的气团拨开。\n'
            : hit ? '顿觉内息散乱。\n' : '可是试客看透此招之中的破绽。\n';
        raw.skill_messages = [{ side: 0, type: 'vision', text }];
    }
    raw.after = copy(raw.immediate); return raw;
}
const reject = (c, r, edit) => { const bad = copy(r); edit(bad); assert.throws(() => record(bad, c)); };
test('fixed54:hun16/po19/pi19,11 random100+43det2=1186;108 separate smoke', () => {
    assert.equal(cases.length, 54); assert.equal(new Set(cases.map(c => c.id)).size, 54);
    assert.deepEqual(['hun', 'po', 'pi'].map(a => cases.filter(c => c.parameters.ability === a).length), [16, 19, 19]);
    assert.equal(cases.filter(c => c.parameters.random_effects).length, 11); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1186);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 108); for (const c of cases) condition(c);
});
test('129 full source hashes, original perform identities and six absent fallbacks fail closed', () => {
    assert.equal(sources.length, 129); assert.equal(hash(JSON.stringify(sources.map(p => [p, hash(read(p))]))), reviewed);
    assert.equal(absent.length, 6); assert.throws(() => conditions(catalog, p => p === absent[0] ? Buffer.from('new') : read(p)));
    assert.throws(() => conditions(catalog, p => p === 'adm/daemons/combatd.c' ? Buffer.from('drift') : read(p)));
    const wrong = copy(catalog); wrong.skills[0].entries[0].id = 'kungfu/skill/jiuyang-shengong/perform/hun.c:9:perform'; assert.throws(() => conditions(wrong, read));
    const c = copy(pick('po')); c.parameters.source_entry.line++; assert.throws(() => condition(c));
    c.parameters.source_entry.line--; c.parameters.actor.skills.force++; assert.throws(() => condition(c));
});
test('all54 complete synthetic records pass original general/school/special three consumers with correct gear/preparation', () => {
    for (const c of cases) { const r = syntheticJiuyangDirectTrace(c); general(r, c); school(r, c); assert.ok(record(r, c)); }
    const dual = syntheticJiuyangDirectTrace(pick('hun', 'dual')); assert.equal(dual.before[0].secondary_weapon_details.flag, 6);
    assert.equal(dual.before[0].temp.apply.damage, 25); assert.equal(dual.before[0].encumbrance, 12000);
    const r = syntheticJiuyangDirectTrace(pick('po', 'unconscious')); assert.deepEqual(r.terminals, []);
    assert.deepEqual(r.preparation.terminals, [{ side: 1, state: 'unconscious' }]);
});
test('all11 accepted commands admit both natural gate branches, input-driven target final and original busy/weak', () => {
    for (const c of cases.filter(c => c.parameters.random_effects)) for (const hit of [false, true]) {
        const r = syntheticJiuyangDirectTrace(c, { hit, busy: 3, wear: hit }); const e = record(r, c);
        assert.equal(e.gate_hit, hit); assert.equal(e.actor_neili_cost, c.parameters.ability === 'hun' ? hit ? 250 : 50 : hit ? 350 : 150);
        if (hit && c.parameters.ability !== 'hun') assert.equal(e.target_neili_cost, Math.trunc(e.input_damage / 4) + Math.trunc(e.input_damage / 8));
        else assert.equal(e.target_neili_cost, 0);
    }
    for (const a of ['hun', 'po', 'pi']) { const c = pick(a, 'minimum'); assert.ok(record(syntheticJiuyangDirectTrace(c, { weak: 0 }), c)); }
    const c = pick('hun'); reject(c, syntheticJiuyangDirectTrace(c), r => { delete r.immediate[0].learned[skill]; r.after = copy(r.immediate); });
});
test('public direct damage uses dynamic strength, two int branches, rawcon wound reduction and joint craze', () => {
    for (const a of ['hun', 'po', 'pi']) for (const v of ['minimum', '400', '800']) {
        const c = pick(a, v); for (const intBoost of [false, true]) for (const armorRoll of [0, 99]) assert.ok(record(syntheticJiuyangDirectTrace(c, { intBoost, armorRoll }), c));
    }
    const c = pick('hun', '800'), r = syntheticJiuyangDirectTrace(c);
    assert.equal(r.before[0].effective_str, 116); assert.equal(r.directs[0].type, 0);
    for (const edit of [x => { x.directs[0].type = 1; }, x => { x.directs[0].percent = 85; },
        x => { x.metrics[0].neili_cost += 50; x.immediate[0].neili -= 50; x.after = copy(x.immediate); },
        x => { x.immediate[1].craze = 0; x.after = copy(x.immediate); }, x => { x.directs[0].damage--; }]) reject(c, r, edit);
});
test('steel hit wear and simultaneous input-based drain cannot use public D or async fake callbacks', () => {
    const c = pick('po'), r = syntheticJiuyangDirectTrace(c, { wear: true }); assert.equal(record(r, c).weapon_wear, 1);
    for (const edit of [x => { x.immediate[0].weapon_details.consistence = 98; x.after = copy(x.immediate); },
        x => { const wrong = Math.trunc(x.metrics[1].qi_cost / 4) + Math.trunc(x.metrics[1].qi_cost / 8); x.metrics[1].neili_cost = wrong;
            x.immediate[1].neili = x.before[1].neili - wrong; x.after = copy(x.immediate); },
        x => { x.callbacks.push({ side: 1, phase: 'after' }); }, x => { x.before[0].weapon_details.stable = 100; },
        x => { x.before[0].weapon_details.is_item_make = 1; }, x => { x.passives.push({ skill, incoming: 1000 }); }]) reject(c, r, edit);
    const m = syntheticJiuyangDirectTrace(c, { hit: false }); reject(c, m, x => { x.immediate[0].weapon_details.consistence = 99; x.after = copy(x.immediate); });
});
test('missing fields and false metadata/source/USER/program/counter/busy/message cannot pass', () => {
    const c = pick('pi'), r = syntheticJiuyangDirectTrace(c);
    for (const k of ['before', 'immediate', 'after', 'metrics', 'directs', 'busy_calls', 'skill_messages', 'launches', 'refusals', 'command_accepted']) reject(c, r, x => { delete x[k]; });
    for (const edit of [x => { x.index = null; }, x => { x.index = 100; }, x => { x.elapsed = null; }, x => { x.elapsed = -1; },
        x => { x.before[0].object = '/tests/teaching_actor#100'; }, x => { x.before[0].wizardp = 1; },
        x => { x.busy_calls[0].caller_side = 1; }, x => { x.directs[0].weapon_object = ''; }, x => { x.skill_messages = []; },
        x => { x.metrics[1].neili_recovery = 1; }, x => { x.metrics[0].heartbeats = 1; }, x => { x.immediate[0].busy = 4; }]) reject(c, r, edit);
});
test('all43 refusals preserve exact original scope/messages/resources and cannot become accepted effects', () => {
    for (const c of cases.filter(c => !c.parameters.random_effects)) { const r = syntheticJiuyangDirectTrace(c); assert.equal(record(r, c).accepted, false);
        reject(c, r, x => { x.reason += 'x'; }); reject(c, r, x => { x.metrics[0].neili_cost = 1; }); }
    const c = pick('po', 'weapon-flag0'), r = syntheticJiuyangDirectTrace(c);
    assert.equal(c.parameters.refusal_scope, 'dispatch'); assert.equal(r.reason.replace(/\x1b\[256D\x1b\[K/, ''), '你现在的(sword)中并没有这种外功。\n');
});
test('diagnostic records retain unknown after strict identity/index/elapsed/reason validation', () => {
    const c = pick('hun'), r = { kind: 'sample', condition_id: c.id, method: 'perform', index: 0, elapsed: 0, outcome: 'error', reason: 'native error' };
    assert.equal(record(r, c), null); for (const edit of [x => { x.index = null; }, x => { x.elapsed = NaN; }, x => { x.reason = ' '; }, x => { delete x.reason; }, x => { x.method = 'interface'; }]) reject(c, r, edit);
    const e = effects([{ raw: r }], c); assert.equal(e.unknown, 1); assert.equal(e.accepted_commands, null); assert.equal(e.qi_cost, null);
    assert.equal(e.public_damage.mean, null);
});
test('accepted commands/gate misses and three damage distributions have honest distinct denominators', () => {
    const c = pick('po'), rows = [true, false].map((hit, index) => ({ raw: syntheticJiuyangDirectTrace(c, { hit, index }) }));
    const e = effects(rows, c); assert.equal(e.accepted_commands, 2); assert.equal(e.refused_commands, 0); assert.equal(e.gate_hits, 1);
    assert.equal(e.gate_misses, 1); assert.equal(e.direct_calls, 1); assert.equal(e.gate_probability.trials, 2);
    assert.equal(e.input_damage.n, 1); assert.equal(e.public_damage.n, 1); assert.equal(e.public_wound.n, 1);
    assert.equal(e.actor_neili_cost, 500); assert.equal(e.weak_gain, 2);
    const refused = pick('hun', 'grant0'), summary = effects([{ raw: syntheticJiuyangDirectTrace(refused) }], refused);
    assert.equal(summary.gate_probability.trials, 0); assert.equal(summary.refused_commands, 1); assert.equal(summary.actor_neili_cost, 0);
});
