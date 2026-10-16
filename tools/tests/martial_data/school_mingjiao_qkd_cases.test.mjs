import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { mingjiaoQkdConditions as conditions, mingjiaoQkdSourcePaths as sources,
    mingjiaoQkdReviewedSourceHash as reviewed, validateMingjiaoQkdCondition as validate,
    validateMingjiaoQkdRecord as record, mingjiaoQkdEffects as effects } from './school_mingjiao_qkd_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(root + p), sha = v => createHash('sha256').update(v).digest('hex'), copy = v => structuredClone(v);
const catalog = { skills: [{ id: 'qiankun-danuoyi', sha256: sha(read('kungfu/skill/qiankun-danuoyi.c')),
    entries: [['valid_enable', 26], ['query_parry_msg', 30], ['valid_damage', 83], ['query_effect_parry', 264]].map(([fn, n]) =>
        ({ id: `kungfu/skill/qiankun-danuoyi.c:${n}:${fn}` })) }] };
const cases = conditions(catalog, read), pick = v => cases.find(c => c.parameters.variant === v);
const parry = '$N一招击在$n身上，却被$n暗运乾坤大挪移，将内力尽数移入地下。\n';
// Explicit synthetic records for pure checks only; no driver or sampled evidence.
function state(cfg, side, p) {
    const s = { cultivation: Object.fromEntries(['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
        'special_skill/guimai', 'wudang-jiuyang', 'immune/poison'].map(k => [k, null])), object: '/tests/actor#' + (100 + side),
        id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: 0,
        busy: cfg.busy ?? null, conditions: null, fighting_opponent: Number(p.fighting), skills: copy(cfg.skills),
        mappings: copy(cfg.mappings), preparations: copy(cfg.preparations), learned: {},
        temp: { user_setup: 1, apply: { armor: 100, ...(cfg.equipment ? { damage: 25, dodge: -2 } : {}) }, ...copy(cfg.temp ?? {}) },
        weapon: cfg.equipment ? 'sword' : 'none', weapon_damage: cfg.equipment ? 25 : 0, weapon_flag: cfg.equipment ? 4 : 0,
        weapon_details: cfg.equipment ? { object: '/clone/weapon/gangjian#200', program: '/clone/weapon/gangjian', weight: 6000 } : {},
        handing: 'none', handing_details: {}, craze: 0, max_craze: 5000 };
    for (const [k, v] of Object.entries(cfg.properties)) if (!['name', 'race'].includes(k)) {
        if (k.includes('/') || ['character', 'class', 'doing'].includes(k)) s.cultivation[k] = v; else s[k] = v;
    }
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (cfg.equipment && k === 'dodge' ? -2 : 0)]));
    s.effective_str = 36 + Math.trunc(Math.max(0, ...['unarmed', 'strike', 'finger', 'hand', 'claw', 'cuff'].map(k => cfg.skills[k] ?? 0)) / 10);
    s.effective_int = 40; s.effective_dex = 36 + Math.trunc((cfg.skills.dodge ?? 0) / 10); s.effective_con = 36 + Math.trunc((cfg.skills.force ?? 0) / 10);
    if (side && p.target_state) { s.living = 0; s.qi = s.jing = 0; s.temp.block_msg = { all: 1 }; }
    return s;
}
export function syntheticQkdTrace(c, { cancel = false, queued = false, callback = 'miss' } = {}) {
    const p = c.parameters, before = [state(p.actor, 0, p), state(p.target, 1, p)];
    const point = (time, pending = []) => ({ wall_time: time, fighting: [Number(p.fighting), Number(p.fighting)], pending });
    const raw = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: queued ? 2.1 : .01,
        outcome: 'observed', reason: '', before, immediate: copy(before), after: [], metrics: [{}, {}],
        actions: [], directs: [], attacks: [], passives: [], defenses: [], defense_messages: [], dodge_checks: [],
        interfaces: [], launches: [], refusals: [], callbacks: [], dropped: [], terminals: [], busy_calls: [],
        bhinfo: { before: null, after: null, cleared: null },
        qkd_queue: { before: point(100), immediate: point(100), final: point(queued ? 102 : 100) } };
    if (p.target_state) { raw.preparation = { before: state(p.target, 1, { ...p, target_state: undefined }), after: copy(before[1]) };
        raw.terminals = [{ side: 1, state: 'unconscious' }]; }
    let value = null;
    if (p.ability === 'valid_enable') value = Number(p.interface.argument === 'parry');
    if (p.ability === 'query_effect_parry') { const l = p.level;
        value = p.target.properties['family/family_name'] !== '明教' || l < 80 ? 0 : l < 200 ? 40 : l < 280 ? 60 : l < 350 ? 80 : 100; }
    if (p.ability === 'query_parry_msg') value = parry;
    if (p.ability === 'valid_damage') {
        if (cancel || queued) value = { damage: -1000, msg: queued ? '\n$N一招攻出，却见$n迎身而上，冷笑道：「区区'
            + (p.actor.equipment ? '逍遥剑法' : '寒冰绵掌') + '，能奈我何？」\n$n当即运起乾坤大挪移第七层心法，企图挪移$N的攻势。\n\n' : parry };
        raw.defenses = [{ actor: 0, target: 1, skill: 'qiankun-danuoyi', incoming: 1000, result: value, route: 'interface' }];
    }
    raw.command_accepted = 1;
    raw.interfaces = [{ object: p.interface.object, function: p.ability, result: value, implemented_by: '/kungfu/skill/qiankun-danuoyi',
        ...(Object.hasOwn(p.interface, 'argument') ? { argument: p.interface.argument } : {}) }];
    if (queued) {
        raw.immediate[1].busy = 2; raw.immediate[1].temp.nuoyi = { left: 1 };
        raw.qkd_queue.immediate.pending = [{ owner: before[1].object, function: 'eval_function', tuple_size: 3, remaining: 1 }];
        raw.busy_calls = [{ side: 1, caller_side: 0, requested: 2, before: null, after: 2 }];
    }
    raw.after = copy(raw.immediate);
    if (queued && p.fighting) {
        raw.busy_calls.push({ side: 1, caller_side: -1, requested: 2, before: 2, after: 2 }); delete raw.after[1].temp.nuoyi;
        if (callback === 'hit') {
            const input = raw.immediate[1].effective_skills.parry + raw.immediate[0].effective_skills.force;
            raw.directs = [{ actor: 1, target: 0, type: 2, damage: input, percent: 300, weapon: 'none', weapon_object: '' }];
            // Independent source calculation: sender raw36/effective96 -> k57; no int bonus, armor roll0.
            const pre = input + Math.trunc(input * 57 / 50);
            const d = pre > 1500 ? Math.trunc((pre - 1500) / 4) + 1000 : pre > 500 ? Math.trunc((pre - 500) / 2) + 500 : pre;
            let w = d * 3; w -= Math.trunc(w * .2); w -= Math.trunc(w * .26);
            raw.after[0].eff_qi -= w; raw.after[0].qi = Math.min(10000 - d, raw.after[0].eff_qi);
            raw.after[0].craze = Math.min(5000, Math.trunc(d / 5) + Math.trunc(w / 3));
            raw.metrics[1].direct = 1; raw.metrics[0] = { qi_cost: 10000 - raw.after[0].qi, eff_qi_cost: w };
        }
    }
    if (queued) raw.callbacks = ['before', 'after'].map((phase, i) => ({ side: 1, phase, elapsed: 1.01,
        state: copy((i ? raw.after : raw.immediate)[1]), qkd: { ...point(101.01), owner: before[1].object,
            function: 'eval_function', states: copy(i ? raw.after : raw.immediate) } }));
    return raw;
}
function bad(c, r, edit) { const wrong = copy(r); edit(wrong); assert.throws(() => record(wrong, c)); }
test('fixed39/3430/78 and124 hashed original sources remain exact', () => {
    assert.equal(cases.length, 39); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 3430);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 78);
    assert.equal(sources.length, 124); assert.equal(sha(JSON.stringify(sources.map(p => [p, sha(read(p))]))), reviewed);
    for (const c of cases) validate(c);
    const c = copy(pick('direct-parry400')); c.parameters.direct_source_entry.sha256 = undefined; assert.throws(() => validate(c));
    assert.throws(() => conditions(catalog, p => p.endsWith('combatd.c') ? Buffer.from('changed') : read(p)));
});
test('deterministic USER interfaces and parry tiers have positive complete traces', () => {
    for (const v of ['enable-parry', 'enable-dodge', 'effect-79', 'effect-80', 'effect-199', 'effect-200', 'effect-279', 'effect-280', 'effect-349', 'effect-350', 'effect-outsider350', 'parry-message', 'damage-skill99', 'damage-unconscious100']) {
        const c = pick(v); assert.ok(record(syntheticQkdTrace(c), c));
    }
});
test('original steel sword preserves weight-derived dodge minus two', () => {
    const c = pick('damage-weapon200'), r = syntheticQkdTrace(c, { cancel: true });
    assert.equal(r.before[0].temp.apply.dodge, -2);
    assert.equal(r.before[0].effective_skills.dodge, 298);
    record(r, c);
    bad(c, r, x => { delete x.before[0].temp.apply.dodge; });
    bad(c, r, x => { x.before[0].effective_skills.dodge = 300; });
});

test('multiple mapping returns accumulate without object-identity key overwrite', () => {
    const c = pick('damage-200');
    const raws = Array.from({ length: 3 }, (_, index) => ({ ...syntheticQkdTrace(c, { cancel: true }), index }));
    const before = copy(raws), e = effects(raws.map(raw => ({ raw })), c);
    assert.equal(e.validated, 3);
    assert.equal(e.canceled, 3);
    assert.equal(Object.values(e.interface_values).reduce((n, count) => n + count, 0), 3);
    assert.equal(Object.keys(e.interface_values).length, 1);
    assert.equal(JSON.parse(Object.keys(e.interface_values)[0]).damage, -1000);
    assert.deepEqual(raws, before);
});

test('metadata missing/index null/out of range and diagnostic reason fail closed', () => {
    const c = pick('enable-parry'), r = syntheticQkdTrace(c);
    for (const index of [null, -1, c.samples, false, '0']) bad(c, r, x => { x.index = index; });
    bad(c, r, x => { delete x.metrics; }); bad(c, r, x => { delete x.qkd_queue.final; });
    bad(c, r, x => { x.before[0].object = '/tests/teaching_actor#100'; });
    const error = { kind: 'sample', condition_id: c.id, method: c.method, index: 0, elapsed: .1, outcome: 'error', reason: 'explicit diagnostic' };
    assert.equal(record(error, c), null); assert.equal(effects([{ raw: error }], c).qi_cost, null);
    bad(c, error, x => { delete x.reason; }); bad(c, error, x => { x.reason = ''; });
});
test('ordinary cancel interfaces bind real incoming and do not permit resource side effects', () => {
    const c = pick('damage-200'), r = syntheticQkdTrace(c, { cancel: true }); assert.equal(record(r, c).canceled, 1);
    bad(c, r, x => { x.defenses[0].incoming = 999; }); bad(c, r, x => { x.interfaces[0].implemented_by = '/inherit/skill/skill'; });
    bad(c, r, x => { x.after[1].neili--; x.metrics[1].neili_cost = 1; });
    bad(c, r, x => { x.interfaces[0].result.damage = -999; });
});
test('seven queue requires every source guard and authentic three-tuple target timer', () => {
    const c = pick('seven-mixed-callback'), r = syntheticQkdTrace(c, { queued: true }); assert.equal(record(r, c).callback_outcome, 'miss');
    bad(c, r, x => { x.qkd_queue.immediate.pending[0].tuple_size = 4; });
    bad(c, r, x => { x.qkd_queue.immediate.pending[0].owner = x.before[0].object; });
    bad(c, r, x => { x.callbacks[0].qkd.function = 'nuoyi'; }); bad(c, r, x => { x.callbacks.pop(); });
    for (const v of ['seven-level350', 'seven-max-equal', 'seven-busy2', 'seven-count100', 'seven-empty-map', 'seven-empty-skills', 'seven-defender-nuoyi', 'seven-attacker-nuoyi']) {
        const blocked = pick(v); assert.throws(() => record(syntheticQkdTrace(blocked, { queued: true }), blocked));
    }
});
test('REMOTE callback input is not actual damage, joint wound may exceed public damage', () => {
    const c = pick('seven-eligible351'), r = syntheticQkdTrace(c, { queued: true, callback: 'hit' }), result = record(r, c);
    assert.equal(result.callback_outcome, 'hit'); assert.ok(result.callback_wound > result.callback_damage);
    bad(c, r, x => { x.directs[0].type = 0; }); bad(c, r, x => { x.directs[0].damage = result.callback_damage; });
    bad(c, r, x => { x.after[0].eff_qi--; x.metrics[0].eff_qi_cost++; });
    assert.equal(effects([{ raw: r }], c).callback_hit, 1);
});
test('no-fight original callback early return leaves tag; cannot count as miss or hit', () => {
    const c = pick('seven-no-fight'), r = syntheticQkdTrace(c, { queued: true });
    assert.equal(record(r, c).callback_outcome, 'early_return'); assert.equal(effects([{ raw: r }], c).callback_miss, 0);
    bad(c, r, x => { delete x.after[1].temp.nuoyi; x.callbacks[1].qkd.states = copy(x.after); x.callbacks[1].state = copy(x.after[1]); });
    bad(c, r, x => { x.metrics[1].heartbeats = 1; });
});
