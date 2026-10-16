import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mingjiaoJiuyangConditions as conditions, mingjiaoJiuyangSourcePaths as sources,
    mingjiaoJiuyangReviewedSourceHash as reviewed, validateMingjiaoJiuyangCondition as validate,
    validateMingjiaoJiuyangRecord as record, mingjiaoJiuyangEffects as effects } from './school_mingjiao_jiuyang_cases.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url)), read = p => readFileSync(root + p), sha = x => createHash('sha256').update(x).digest('hex');
const catalog = { skills: [{ id: 'jiuyang-shengong', sha256: sha(read('kungfu/skill/jiuyang-shengong.c')),
    entries: [['valid_enable', 185], ['query_effect_parry', 318], ['valid_damage', 255], ['hit_ob', 300]].map(([fn, n]) =>
        ({ id: `kungfu/skill/jiuyang-shengong.c:${n}:${fn}` })) }] };
const cases = conditions(catalog, read), pick = v => cases.find(c => c.parameters.variant === v), copy = v => structuredClone(v);
test('67 finite conditions retain18 enable12 parry18 defense16 passive3 ordinary and 134 smoke', () => {
    const counts = Object.fromEntries(['valid_enable', 'query_effect_parry', 'valid_damage', 'hit_ob', 'ordinary']
        .map(a => [a, cases.filter(c => c.parameters.ability === a).length]));
    assert.deepEqual(counts, { valid_enable: 18, query_effect_parry: 12, valid_damage: 18, hit_ob: 16, ordinary: 3 });
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 134);
    assert.equal(new Set(cases.map(c => c.id)).size, 67); for (const c of cases) validate(c);
});
test('124-source closure is genuinely rehashed and includes original COMBAT; drift fails closed', () => {
    assert.equal(sources.length, 124); assert.ok(sources.includes('adm/daemons/combatd.c'));
    assert.equal(sha(JSON.stringify(sources.map(p => [p, sha(read(p))]))), reviewed);
    assert.throws(() => conditions(catalog, p => p === 'adm/daemons/combatd.c' ? Buffer.from('changed') : read(p)));
    const bad = copy(catalog); bad.skills[0].entries[0].id = 'kungfu/skill/jiuyang-shengong.c:186:valid_enable'; assert.throws(() => conditions(bad, read));
});
test('fixed parameters, original line identity, counters, mapping and experiment identity cannot drift', () => {
    for (const edit of [c => { c.samples = null; }, c => { c.entry_id += '-wrong'; }, c => { c.parameters.source_entry.line++; },
        c => { c.parameters.actor.properties.reborn = 0; }, c => { c.parameters.actor.skills["jiuyang-shengong"]++; },
        c => { c.parameters.interface.factor = 99; }, c => { delete c.parameters.source_evidence['adm/daemons/combatd.c']; }]) {
        const c = copy(pick('hit-input1000')); edit(c); assert.throws(() => validate(c));
    }
});
test('source guards and bounded fees use raw/effective attributes without inherited force hit behavior', () => {
    const defs = cases.filter(c => c.parameters.ability === 'valid_damage');
    assert.deepEqual(defs.filter(c => c.parameters.variant.startsWith('damage-input')).map(c => c.parameters.interface.damage), [1, 199, 200, 201, 1000]);
    assert.deepEqual([1, 199, 200, 201, 1000].map(n => Math.min(Math.trunc(n / 2), 100)), [0, 99, 100, 100, 100]);
    assert.equal(pick('damage-neili499').parameters.target.properties.neili, 499); assert.equal(pick('damage-neili500').parameters.target.properties.neili, 500);
    assert.equal(pick('hit-neili299').parameters.actor.properties.neili, 299); assert.equal(pick('hit-neili300').parameters.actor.properties.neili, 300);
    const target = pick('hit-con-equal').parameters.target; assert.equal(target.skills.force, 0); assert.equal(target.properties.con, 40);
    assert.equal(Math.trunc(200 / 5), 40); assert.equal(Math.trunc(205 / 5), 41); assert.equal(Math.trunc((205 - 80) / 2), 62);
    assert.equal(pick('hit-input149').parameters.target.properties.con, 29); assert.equal(pick('hit-input150').parameters.target.properties.con, 29);
    assert.deepEqual(pick('hit-input1000').parameters.actor, pick('hit-factor100').parameters.actor);
    assert.deepEqual(pick('hit-input1000').parameters.target, pick('hit-factor100').parameters.target);
    assert.equal(pick('damage-weapon').parameters.actor.equipment.program, '/clone/weapon/gangjian');
});

function state(cfg, side, p) {
    const s = { object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1,
        wizardp: 0, ghost: 0, living: 1, busy: null, conditions: null, fighting_opponent: Number(p.fighting),
        skills: copy(cfg.skills), mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
            'special_skill/guimai', 'wudang-jiuyang', 'immune/poison'].map(k => [k, null])), temp: { user_setup: 1, apply: { armor: 100 } },
        craze: 0, max_craze: 5000, weapon: 'none', weapon_damage: 0, weapon_flag: 0, weapon_details: {}, handing: 'none', handing_details: {} };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['reborn', 'character', 'class', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    const usable = k => cfg.mappings[k] === 'jiuyang-shengong' && (k === 'force' || !!cfg.properties.reborn && (['unarmed', 'parry'].includes(k)
        || cfg.properties['can_learn/jiuyang-shengong/enable_weapon'] && ['sword', 'blade'].includes(k)));
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (usable(k) ? cfg.skills['jiuyang-shengong'] : 0)]));
    s.effective_int = s.int; s.effective_str = s.str + Math.trunc(s.skills.unarmed / 10);
    s.effective_dex = s.dex + Math.trunc(s.skills.dodge / 10); s.effective_con = s.con + Math.trunc(s.skills.force / 10);
    if (cfg.equipment) { s.temp.apply.damage = 25; s.temp.apply.dodge = -2; s.effective_skills.dodge -= 2;
        s.weapon = 'sword'; s.weapon_damage = 25; s.weapon_flag = 4;
        s.weapon_details = { object: '/clone/weapon/gangjian#300', program: '/clone/weapon/gangjian', weight: 6000 }; }
    if (side && p.target_state) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
export function syntheticJiuyangTrace(c, { cancel = false, index = 0 } = {}) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index, elapsed: .01, outcome: 'observed', reason: '',
        before, immediate: copy(before), after: [], metrics: [{}, {}], interfaces: [], actions: [], attacks: [], directs: [],
        passives: [], defenses: [], defense_messages: [], dodge_checks: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [],
        bhinfo: { before: null, after: null, cleared: null } };
    if (p.target_state) { raw.preparation = { before: state(p.target, 1, { ...p, target_state: undefined }), after: copy(before[1]) };
        raw.terminals = [{ side: 1, state: 'unconscious' }]; }
    const [b, t] = before; let value = null;
    if (p.ability === 'valid_enable') value = Number(p.interface.argument === 'force' || !!p.actor.properties.reborn
        && (['unarmed', 'parry'].includes(p.interface.argument) || !!p.actor.properties['can_learn/jiuyang-shengong/enable_weapon'] && ['sword', 'blade'].includes(p.interface.argument)));
    if (p.ability === 'query_effect_parry') value = p.level < 150 ? 0 : p.level < 200 ? 50 : p.level < 250 ? 60 : p.level < 300 ? 70 : p.level < 350 ? 80 : p.level < 400 ? 90 : 100;
    if (p.ability === 'valid_damage') {
        value = cancel ? { damage: -p.interface.damage, msg: '$n默念九阳神功总诀，收敛内劲，承下$N这一招，$N只觉犹如石沉大海，丝毫不起作用。\n' } : null;
        const fee = cancel ? Math.min(Math.trunc(p.interface.damage / 2), 100) : 0;
        raw.immediate[1].neili -= fee; if (fee) raw.metrics[1].neili_cost = fee;
        raw.defenses.push({ actor: 0, target: 1, skill: 'jiuyang-shengong', incoming: p.interface.damage, result: value, route: 'interface' });
    }
    if (p.ability === 'hit_ob') {
        const incoming = p.interface.damage;
        const trigger = incoming >= 150 && b.skills['jiuyang-shengong'] >= 150 && b.neili >= 300 && b.cultivation.reborn
            && b.mappings.force === 'jiuyang-shengong' && b.mappings.unarmed === 'jiuyang-shengong' && b.preparations.unarmed === 'jiuyang-shengong'
            && Math.trunc(incoming / 5) > t.effective_con;
        if (trigger) { const w = Math.trunc((incoming - 80) / 2); value = '只见$N九阳内劲自体内迸发，真气随招式而荡漾，摧毁了$n的真元！\n';
            raw.immediate[0].neili -= 50; raw.immediate[1].eff_qi -= w; raw.immediate[1].qi = raw.immediate[1].eff_qi;
            raw.immediate[1].craze = w > 150 ? Math.trunc(w / 3) : 0;
            raw.metrics = [{ neili_cost: 50 }, { qi_cost: w, eff_qi_cost: w }]; }
        raw.passives.push({ actor: 0, target: 1, skill: 'jiuyang-shengong', incoming, factor: p.interface.factor, result: value,
            route: 'interface', before: copy(before), after: copy(raw.immediate) });
    }
    raw.command_accepted = 1;
    raw.interfaces.push({ object: '/kungfu/skill/jiuyang-shengong', function: p.ability, implemented_by: '/kungfu/skill/jiuyang-shengong', result: value,
        ...(p.interface.argument ? { argument: p.interface.argument } : {}) });
    raw.after = copy(raw.immediate); return raw;
}
const reject = (c, raw, edit) => { const bad = copy(raw); edit(bad); assert.throws(() => record(bad, c)); };
test('normal interfaces bind both real USER identities, raw/effective state and missing fields', () => {
    for (const c of cases.filter(c => c.method !== 'ordinary')) assert.ok(record(syntheticJiuyangTrace(c), c));
    const c = pick('hit-input1000'), r = syntheticJiuyangTrace(c);
    for (const k of ['before', 'after', 'immediate', 'metrics', 'passives', 'interfaces', 'bhinfo']) reject(c, r, bad => { delete bad[k]; });
    for (const index of [null, -1, c.samples, '0', false]) reject(c, r, bad => { bad.index = index; });
    reject(c, r, bad => { bad.interfaces[0].implemented_by = '/inherit/skill/force'; });
    reject(c, r, bad => { bad.before[0].object = '/tests/teaching_actor#100'; });
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: 0, outcome: 'error', reason: 'retained diagnostic' };
    assert.equal(record(error, c), null); assert.equal(effects([{ raw: error }], c).qi_cost, null);
    reject(c, error, bad => { delete bad.reason; }); reject(c, error, bad => { bad.elapsed = null; });
});
test('cancel original coin/inner support and fee0/99/100 are distinct from no-cancel', () => {
    for (const n of [1, 199, 200, 201, 1000]) { const c = pick('damage-input' + n), r = syntheticJiuyangTrace(c, { cancel: true });
        assert.equal(record(r, c).canceled, 1); assert.equal(record(r, c).defense_neili_cost, Math.min(Math.trunc(n / 2), 100)); }
    for (const v of ['raw149', 'neili499', 'nonreborn', 'unmapped-force', 'unmapped-unarmed', 'unmapped-parry', 'weapon', 'unconscious', 'inner-impossible']) {
        const c = pick('damage-' + v); assert.throws(() => record(syntheticJiuyangTrace(c, { cancel: true }), c)); }
    const c = pick('damage-input199'), r = syntheticJiuyangTrace(c, { cancel: true });
    reject(c, r, bad => { bad.immediate[1].neili--; bad.after = copy(bad.immediate); bad.metrics[1].neili_cost++; });
});
test('fixed passive50 and original wound/craze close jointly; object-valued frequencies cannot overwrite', () => {
    const c = pick('hit-input1000'), r = syntheticJiuyangTrace(c), v = record(r, c);
    assert.equal(v.triggered, 1); assert.equal(v.passive_wound, 460); assert.equal(v.passive_neili_cost, 50);
    reject(c, r, bad => { bad.after[1].eff_qi--; bad.immediate = copy(bad.after); bad.passives[0].after = copy(bad.after); bad.metrics[1].eff_qi_cost++; });
    const d = pick('damage-input1000'), a = syntheticJiuyangTrace(d, { cancel: true }), b = syntheticJiuyangTrace(d, { cancel: true, index: 1 });
    b.interfaces[0].result.msg = '$N一招击中$n上身，可却犹如击在棉花上一般，力道顿时消失得无影无踪。\n'; b.defenses[0].result = copy(b.interfaces[0].result);
    const summary = effects([{ raw: a }, { raw: b }], d); assert.equal(Object.keys(summary.interface_values).length, 2);
    assert.equal(Object.values(summary.interface_values).reduce((n, v) => n + v, 0), 2);
});
