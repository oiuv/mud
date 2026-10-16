// Pure, independently calculated fixtures; never label these examples as sampled gameplay.
import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mingjiaoLingPerformConditions, mingjiaoLingPerformSourcePaths,
    mingjiaoLingPerformReviewedSourceHash, mingjiaoLingPerformAbsentPaths,
    validateMingjiaoLingPerformRecord, mingjiaoLingPerformEffects } from './school_mingjiao_ling_perform_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p));
const sha = x => createHash('sha256').update(x).digest('hex'), skill = 'shenghuo-ling';
const lines = { hua: 8, lian: 10, xi: 9 };
const catalog = { skills: [skill, ...Object.keys(lines).map(a => skill + '/' + a)].map(id => {
    const path = 'kungfu/skill/' + id + '.c'; return { id, path, sha256: sha(read(path)),
        entries: id === skill ? [] : [{ role: 'perform', id: `${path}:${lines[id.split('/')[1]]}:perform` }] }; }) };
const cases = mingjiaoLingPerformConditions(catalog, read);
const pick = v => { const c = cases.find(c => c.id.endsWith('-' + v)); assert.ok(c, v); return c; };
const cultivation = ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/divine',
    'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang', 'immune/poison',
    'character', 'env/no_learn', 'env/auto_regenerate', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex',
    ...Object.keys(lines).map(a => 'can_perform/' + skill + '/' + a)];
function snapshot(cfg, side, p) {
    const s = { ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => !k.includes('/') && k !== 'character')),
        cultivation: { ...Object.fromEntries(cultivation.map(k => [k, null])),
            ...Object.fromEntries(Object.entries(cfg.properties).filter(([k]) => k.includes('/') || k === 'character')) },
        object: '/tests/actor#' + (900 + side), id: side ? 'right' : 'left', userp: 1, playerp: 1,
        interactive: 1, wizardp: 0, ghost: 0, living: 1, conditions: {}, busy: cfg.busy ?? null,
        fighting_opponent: Number(p.fighting), killing_opponent: Number(p.fighting), craze: 0, max_craze: 5000,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings), preparations: {}, learned: {},
        effective_str: 56, effective_int: 40, effective_dex: 56, effective_con: 36 + Math.trunc(cfg.skills.force / 10),
        weapon: 'none', weapon_details: {}, weapon_damage: 0, weapon_flag: 0, handing: 'none', handing_details: {},
        secondary_weapon: 'none', secondary_weapon_details: {}, ammunition: 0,
        environment: '/tests/runner', inventory: [], encumbrance: 0, max_encumbrance: 89000,
        temp: { user_setup: 1, apply: { armor: 100 } } };
    if (cfg.equipment) {
        const e = cfg.equipment;
        s.weapon = e.type; s.weapon_damage = 25; s.weapon_flag = 4;
        s.weapon_details = { object: e.program + '#' + (700 + side), program: e.program, skill_type: e.type,
            flag: 4, weight: e.type === 'sword' ? 6000 : 7000, material: 'steel', damage: 25,
            stable: 37, is_item_make: 0, consistence: 100, rigidity: null, no_wield: null };
        s.inventory = [s.weapon_details.object]; s.encumbrance = s.weapon_details.weight;
        s.temp.weapon = s.weapon_details.object; s.temp.apply.damage = 25; s.temp.apply.dodge = -2;
    }
    if (!side && p.actor_free_capacity !== undefined) s.max_encumbrance = s.encumbrance + p.actor_free_capacity;
    s.effective_skills = Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) =>
        [k, Math.trunc(v / 2) + (cfg.skills[cfg.mappings[k]] ?? 0) + (s.temp.apply[k] ?? 0)]));
    return s;
}
export function syntheticLingPerformTrace(c, { success = true, wear = false, weak = 1, input,
    intBonus = false, armorRoll = 0, loaded = 1 } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed'; success &&= accepted;
    const before = [snapshot(p.actor, 0, p), snapshot(p.target, 1, p)];
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', index: 0, outcome: p.expected,
        before, immediate: [], after: [], metrics: [{}, {}], elapsed: 0.01, command_accepted: Number(accepted), reason: '',
        actions: [], attacks: [], passives: [], defenses: [], dodge_checks: [], interfaces: [], directs: [],
        launches: [], refusals: [], busy_calls: [], callbacks: [], terminals: [], dropped: [], skill_messages: [],
        skill_load_context: { actor: before[0].object, already_loaded: loaded, skills: structuredClone(p.actor.skills), command: 'enable sword ' + skill } };
    if (p.target_state === 'unconscious') {
        const awake = structuredClone(before[1]); before[1].living = 0; before[1].qi = 0; before[1].jing = 0;
        before[1].temp.block_msg = { all: 1 };
        raw.preparation = { before: awake, after: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
    }
    const [b, t] = before; raw.immediate = structuredClone(before); const [a, target] = raw.immediate;
    const xi = p.ability === 'xi', lian = p.ability === 'lian';
    if (xi) raw.ling_equipment = { target_weapon: { before: p.target.equipment
        ? { ...structuredClone(t.weapon_details), environment: t.object, equipped: 'wielded' } : {} } };
    if (!accepted) {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal; a.temp.notify_fail = p.refusal;
        raw.refusals = [{ actor: b.object, reason: raw.reason }];
    } else {
        raw.launches = [{ actor: b.object, skill, argument: p.ability + ' right' }];
        a.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        raw.metrics[0].ability_launched = 1;
        const fee = success ? xi ? 240 : 300 : p.ability === 'hua' ? 150 : 100;
        a.neili -= fee; raw.metrics[0].neili_cost = fee;
        a.busy = success ? lian ? 3 : 2 : 4;
        raw.busy_calls = [{ side: 0, caller_side: 0, requested: a.busy, before: null, after: a.busy }];
        if (weak) a.learned[skill] = weak;
    }
    if (success && !xi) {
        const ap = b.effective_skills.sword + (lian ? 0 : b.effective_skills.force);
        input ??= lian ? Math.trunc(b.skills[skill] / 2) : ap;
        raw.directs = [{ actor: 0, target: 1, type: lian ? 2 : 1, damage: input, percent: lian ? 0 : 80,
            weapon: 'sword', weapon_object: b.weapon_details.object }]; raw.metrics[0].direct = 1;
        // Independent original formula; querySTR56/rawSTR36 => strength128, factor47.
        const starting = input + (lian ? 0 : 25);
        let damage = starting + Math.trunc(starting * 47 / 50);
        if (intBonus) damage += Math.trunc(damage * 4 / 40);
        if (damage > 1500) damage = Math.trunc((damage - 1500) / 4) + 1000;
        else if (damage > 500) damage = Math.trunc((damage - 500) / 2) + 500;
        let wound = Math.trunc((damage - armorRoll) * (lian ? 0 : 80) / 100);
        wound -= Math.trunc(wound * 20 / 100); wound -= Math.trunc(wound * 26 / 100);
        wound = Math.max(0, wound);
        target.qi -= damage; target.eff_qi -= wound;
        if (wound) target.qi = Math.min(target.qi, target.eff_qi);
        target.craze = (damage > 150 ? Math.trunc(damage / 5) : 0) + (wound > 150 ? Math.trunc(wound / 3) : 0);
        raw.metrics[1].qi_cost = t.qi - target.qi; raw.metrics[1].eff_qi_cost = wound;
        if (lian) {
            const jing = Math.trunc(input / 2), eff = Math.trunc(input / 4);
            target.jing -= jing; target.eff_jing -= eff; target.busy = 1;
            raw.metrics[1].jing_cost = jing; raw.metrics[1].eff_jing_cost = eff;
            raw.busy_calls.push({ side: 1, caller_side: 0, requested: 1, before: null, after: 1 });
        } else if (wear) a.weapon_details.consistence = 99;
    }
    if (xi) {
        const old = raw.ling_equipment.target_weapon.before;
        const now = structuredClone(old);
        if (success) {
            const heavy = b.encumbrance + old.weight > b.max_encumbrance;
            now.environment = heavy ? b.environment : b.object; now.equipped = null;
            target.weapon = 'none'; target.weapon_details = {}; target.weapon_flag = 0; target.weapon_damage = 0;
            delete target.temp.weapon; delete target.temp.secondary_weapon;
            target.temp.apply.damage = 0; target.temp.apply.dodge = 0; target.effective_skills.dodge += 2;
            target.inventory = []; target.encumbrance = 0;
            if (!heavy) { a.inventory.push(old.object); a.encumbrance += old.weight; }
            else raw.dropped = [{ object: old.object, name: '钢剑', type: 'sword', no_wield: null }];
        }
        raw.ling_equipment.target_weapon.immediate = now;
        raw.ling_equipment.target_weapon.after = structuredClone(now);
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });
const change = (raw, side, f) => { f(raw.immediate[side]); raw.after = structuredClone(raw.immediate); };
function reject(v, f, options) { const c = pick(v), raw = syntheticLingPerformTrace(c, options); f(raw);
    assert.throws(() => validateMingjiaoLingPerformRecord(raw, c)); }

test('原39完整保留、末尾独立超重：40/1452/80、14随机26拒绝', () => {
    assert.equal(cases.length, 40); assert.equal(new Set(cases.map(c => c.id)).size, 40);
    assert.equal(cases.filter(c => c.parameters.random_effects).length, 14);
    assert.equal(cases.slice(0, 39).reduce((n, c) => n + c.samples, 0), 1352);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 1452);
    assert.equal(mingjiaoLingPerformConditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 80);
    assert.equal(cases.at(-1).parameters.variant, 'overweight'); assert.equal(cases.at(-1).parameters.actor_free_capacity, 5999);
    for (const c of cases.slice(0, 39)) assert.equal(c.parameters.actor_free_capacity, undefined);
    for (const c of cases) assert.equal(c.parameters.capture_skill_loads, undefined);
    for (const a of ['hua', 'lian', 'xi']) for (const v of ['200', '400', '800', 'minimum']) assert.ok(pick(a + '-' + v));
});
test('53真实来源及F_SSERVER/移动/伤害/装备冻结；source/catalognames/hash漂移拒绝', () => {
    assert.equal(mingjiaoLingPerformSourcePaths.length, 53); assert.deepEqual(mingjiaoLingPerformAbsentPaths, []);
    assert.equal(sha(JSON.stringify(mingjiaoLingPerformSourcePaths.map(p => [p, sha(read(p))]))), mingjiaoLingPerformReviewedSourceHash);
    for (const p of ['feature/sserver.c', 'feature/move.c', 'feature/equip.c', 'adm/daemons/combatd.c',
        'adm/daemons/chard.c', 'adm/daemons/itemd.c', 'include/combat.h']) assert.ok(mingjiaoLingPerformSourcePaths.includes(p));
    assert.throws(() => mingjiaoLingPerformConditions(catalog, p => p === 'feature/move.c' ? Buffer.from('drift') : read(p)));
    const broken = structuredClone(catalog); broken.skills[1].sha256 = '0'.repeat(64);
    assert.throws(() => mingjiaoLingPerformConditions(broken, read));
    const c = structuredClone(cases[0]); c.parameters.source_evidence['feature/sserver.c'] = '0'.repeat(64);
    assert.throws(() => validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c), c));
});
test('全部40纯示例按原契约，14正常分支成功/失手均支持，不冒实采', () => {
    for (const c of cases) {
        validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c), c);
        if (c.parameters.random_effects) validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c, { success: false }), c);
    }
});
test('最低140/150、max1500/1600、current340/350/300；不套2400学习门', () => {
    for (const [ability, low, max, current] of [['hua', 140, 1500, 340], ['lian', 150, 1600, 350], ['xi', 140, 1500, 300]]) {
        const c = pick(ability + '-minimum'); assert.equal(c.parameters.actor.skills[skill], low);
        assert.equal(c.parameters.actor.properties.max_neili, max); assert.equal(c.parameters.actor.properties.neili, current);
        validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c), c);
        for (const v of ['grant0', 'not-fighting', 'no-weapon', 'blade', 'level-low', 'max-low', 'current-low', 'unconscious'])
            assert.equal(validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(pick(ability + '-' + v)), pick(ability + '-' + v)).accepted, false);
    }
    for (const v of ['hua-grant0', 'lian-max-low', 'xi-current-low']) reject(v, r => { r.refusals[0].reason += '错'; });
    reject('xi-current-low', r => { r.reason = r.refusals[0].reason = r.reason.replace('真气', '内力'); });
});
test('HUA type1/80与原apply25，公共D/W/怒气联合支持，错误类型/假Qi拒绝', () => {
    const c = pick('hua-200'), raw = syntheticLingPerformTrace(c);
    assert.equal(raw.directs[0].damage, 600); assert.equal(raw.metrics[1].qi_cost, 856); assert.equal(raw.metrics[1].eff_qi_cost, 406);
    validateMingjiaoLingPerformRecord(raw, c);
    validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c, { intBonus: true, armorRoll: 99 }), c);
    for (const f of [r => { r.directs[0].type = 0; }, r => { r.directs[0].percent = 100; },
        r => { r.directs[0].damage = 900; }, r => { r.directs[0].weapon_object = r.before[1].object; },
        r => { r.metrics[1].qi_cost++; change(r, 1, a => { a.qi--; }); },
        r => change(r, 1, a => { a.craze++; }), r => { r.metrics[1].eff_qi_cost = 0; change(r, 1, a => { a.eff_qi = 10000; }); }]) reject('hua-200', f);
});
test('LIAN同步精神取原input不是公共D，REMOTE2/percent0仍Qi>0，无callback', () => {
    const c = pick('lian-200'), raw = syntheticLingPerformTrace(c), v = validateMingjiaoLingPerformRecord(raw, c);
    assert.equal(v.input_damage, 100); assert.equal(v.target_costs.qi, 194); assert.equal(v.target_costs.eff_qi, 0);
    assert.equal(v.target_costs.jing, 50); assert.equal(v.target_costs.eff_jing, 25);
    assert.equal(v.target_busy, 1); assert.deepEqual(raw.callbacks, []);
    for (const f of [r => { r.directs[0].type = 1; }, r => { r.directs[0].damage = 99; },
        r => { r.metrics[1].jing_cost = 97; change(r, 1, a => { a.jing = 9903; }); },
        r => { r.metrics[1].eff_qi_cost = 1; change(r, 1, a => { a.eff_qi--; }); },
        r => { r.callbacks.push({ phase: 'final' }); }, r => change(r, 1, a => { a.busy = 0; }),
        r => { r.metrics[1].jing_cost = 0; change(r, 1, a => { a.jing = 10000; }); },
        r => { r.metrics[1].qi_cost = 0; change(r, 1, a => { a.qi = 10000; a.craze = 0; }); }]) reject('lian-200', f);
});
test('拒绝拿有效根骨减伤或漏武器apply25的完整伪造账', () => {
    reject('hua-200', r => {
        r.metrics[1].qi_cost = 832; r.metrics[1].eff_qi_cost = 394;
        change(r, 1, t => { t.qi = 9168; t.eff_qi = 9606; t.craze = 297; });
    });
    reject('hua-200', r => {
        r.metrics[1].eff_qi_cost = 77;
        change(r, 1, t => { t.eff_qi = 9923; t.craze = 171; });
    });
    reject('lian-400', r => {
        r.metrics[1].jing_cost = 194; r.metrics[1].eff_jing_cost = 97;
        change(r, 1, t => { t.jing = 9806; t.eff_jing = 9903; });
    });
});
test('自然100→99耐久只准HUA成功一次，stable37/制作标记不伪造', () => {
    validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(pick('hua-400'), { wear: true }), pick('hua-400'));
    reject('hua-400', r => change(r, 0, a => { a.weapon_details.consistence = 98; }));
    reject('hua-400', r => change(r, 0, a => { a.weapon_details.consistence = 99; }), { success: false });
    reject('lian-400', r => change(r, 0, a => { a.weapon_details.consistence = 99; }));
    reject('xi-400', r => change(r, 0, a => { a.weapon_details.consistence = 99; }));
    reject('hua-400', r => { for (const phase of ['before', 'immediate', 'after']) delete r[phase][0].weapon_details.stable; });
    reject('hua-400', r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].weapon_details.is_item_make = 1; });
});
test('XI同一钢剑/钢刀取得但不自动装备，靶卸装属性与负重闭账', () => {
    for (const v of ['xi-400', 'xi-target-blade']) {
        const c = pick(v), raw = syntheticLingPerformTrace(c), result = validateMingjiaoLingPerformRecord(raw, c);
        assert.equal(result.transfer_location, 'actor'); assert.equal(raw.immediate[0].weapon_details.object, raw.before[0].weapon_details.object);
        assert.deepEqual(raw.immediate[1].temp.apply, { armor: 100, damage: 0, dodge: 0 });
        assert.equal(raw.immediate[0].encumbrance, v.endsWith('blade') ? 13000 : 12000);
    }
    for (const f of [r => { r.ling_equipment.target_weapon.immediate.object += 'x'; r.ling_equipment.target_weapon.after.object += 'x'; },
        r => { r.ling_equipment.target_weapon.immediate.equipped = 'wielded'; r.ling_equipment.target_weapon.after.equipped = 'wielded'; },
        r => change(r, 1, a => { a.temp.apply.damage = 25; }), r => change(r, 1, a => { a.temp.apply.dodge = -2; }),
        r => change(r, 0, a => { a.encumbrance = 6000; }), r => change(r, 0, a => { a.inventory.pop(); }),
        r => change(r, 0, a => { a.weapon_details = structuredClone(r.before[1].weapon_details); }),
        r => change(r, 1, a => { a.effective_skills.dodge -= 2; })]) reject('xi-400', f);
    reject('xi-target-no-weapon', r => change(r, 1, a => { a.inventory.push('/fake'); }));
});
test('独立XI超重原落房间：max11999/自身encumb6000，不伪成功纳入物品栏', () => {
    const c = pick('xi-overweight'), raw = syntheticLingPerformTrace(c), v = validateMingjiaoLingPerformRecord(raw, c);
    assert.equal(raw.before[0].max_encumbrance, 11999); assert.equal(v.transfer_location, 'room'); assert.equal(v.actor_neili_cost, 240);
    assert.equal(raw.immediate[0].encumbrance, 6000); assert.equal(raw.immediate[1].encumbrance, 0);
    assert.equal(raw.dropped[0].object, raw.before[1].weapon_details.object);
    assert.equal(raw.ling_equipment.target_weapon.immediate.environment, '/tests/runner');
    for (const f of [r => { r.dropped = []; }, r => { r.dropped[0].object = r.before[0].weapon_details.object; },
        r => { r.ling_equipment.target_weapon.immediate.environment = r.before[0].object; r.ling_equipment.target_weapon.after.environment = r.before[0].object; },
        r => change(r, 0, a => { a.inventory.push(r.before[1].weapon_details.object); a.encumbrance += 6000; }),
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].max_encumbrance = 12000; }]) reject('xi-overweight', f);
    validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(c, { success: false }), c);
});
test('原weak技能等级/2门与+1，成功和失手均增熟练，高档必1，拒绝必0', () => {
    for (const v of ['hua-200', 'lian-minimum', 'xi-minimum']) for (const success of [true, false]) for (const weak of [0, 1])
        validateMingjiaoLingPerformRecord(syntheticLingPerformTrace(pick(v), { success, weak }), pick(v));
    for (const v of ['hua-400', 'lian-800', 'xi-overweight']) reject(v, r => change(r, 0, a => { a.learned = {}; }));
    reject('hua-200', r => change(r, 0, a => { a.learned[skill] = 11; }));
    reject('hua-grant0', r => change(r, 0, a => { a.learned[skill] = 1; }));
    reject('lian-200', r => change(r, 0, a => { a.learned.force = 1; }));
});
test('真实USER首载/三时点/昏迷杀意准备/忙乱与命令拒绝，缺字段非0', () => {
    const c = pick('lian-unconscious'), raw = syntheticLingPerformTrace(c);
    validateMingjiaoLingPerformRecord(raw, c); assert.equal(raw.before[1].living, 0); assert.deepEqual(raw.terminals, []);
    for (const f of [r => { delete r.preparation; }, r => { r.preparation.terminals = []; },
        r => { r.preparation.before.qi = 0; }, r => { r.preparation.after.eff_qi--; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].killing_opponent = 0; }]) reject('lian-unconscious', f);
    for (const k of ['actions', 'directs', 'busy_calls', 'callbacks', 'skill_load_context', 'metrics', 'skill_messages']) reject('hua-200', r => { delete r[k]; });
    for (const f of [r => { r.skill_load_context.actor = r.before[1].object; }, r => { r.skill_load_context.command = 'enable parry ' + skill; },
        r => { r.skill_load_context.already_loaded = 2; }, r => { r.skill_load_context.skills.sword = 999; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.after[0].neili++; },
        r => { r.busy_calls[0].caller_side = 1; }, r => { r.metrics[0].neili_cost = null; },
        r => { r.skill_loads = []; }, r => { r.command_accepted = 0; },
        r => { for (const phase of ['before', 'immediate', 'after']) r[phase][0].wizardp = 1; }]) reject('hua-200', f);
    reject('hua-busy1', r => { r.refusals = []; }); reject('hua-busy1', r => { r.busy_calls.push({ side: 0, requested: 1 }); });
});
test('Effects分母：失手不算拒绝、磨损只HUA成功、错误未知、XI正常/落地分列', () => {
    const c = pick('hua-200'), ok = row(syntheticLingPerformTrace(c, { wear: true })), miss = row(syntheticLingPerformTrace(c, { success: false }));
    const error = row({ kind: 'sample', condition_id: c.id, method: 'perform', index: 0,
        elapsed: 0.01, outcome: 'error', reason: 'Synthetic runtime failure, not a real sample.' });
    const v = mingjiaoLingPerformEffects([ok, miss, error], c);
    assert.deepEqual(v.counts, { observed: 2, refused: 0, error: 1, not_applicable: 0 });
    assert.equal(v.accepted.trials, 2); assert.equal(v.accepted.successes, 2); assert.equal(v.gate.rate, 0.5);
    assert.equal(v.wear.trials, 1); assert.equal(v.wear.successes, 1); assert.equal(v.input_damage.n, 1); assert.equal(v.input_damage.unknown, 2);
    assert.equal(v.actor_neili_cost.mean, 225); assert.equal(v.actor_neili_cost.unknown, 1);
    const refused = pick('hua-grant0'), refusal = mingjiaoLingPerformEffects([row(syntheticLingPerformTrace(refused))], refused);
    assert.equal(refusal.accepted.rate, 0); assert.equal(refusal.gate.trials, 0); assert.equal(refusal.input_damage.mean, null);
    const xi = pick('xi-overweight'), x = mingjiaoLingPerformEffects([row(syntheticLingPerformTrace(xi)), row(syntheticLingPerformTrace(xi, { success: false }))], xi);
    assert.deepEqual(x.transfer, { actor: 0, room: 1, target: 1 }); assert.equal(x.input_damage.mean, null); assert.equal(x.target_costs.qi.mean, 0);
    assert.equal(mingjiaoLingPerformEffects([], c).actor_neili_cost.mean, null);
    assert.throws(() => mingjiaoLingPerformEffects([{ ...ok, outcome: 'refused' }], c));
});
test('原运行错误可留痕但绝招效果未知，非法身份/编号/耗时/原因仍拒绝', () => {
    const c = pick('hua-200');
    const trace = outcome => ({ kind: 'sample', condition_id: c.id, method: c.method,
        index: 0, elapsed: 0.01, outcome, reason: 'Synthetic runtime failure, not a real sample.' });
    for (const outcome of ['error', 'not_applicable']) {
        assert.equal(validateMingjiaoLingPerformRecord(trace(outcome), c), null);
        for (const edit of [r => { delete r.kind; }, r => { r.condition_id += '-other'; },
            r => { r.method = 'ordinary'; }, r => { delete r.index; }, r => { r.index = null; },
            r => { r.index = -1; }, r => { r.index = 0.5; }, r => { r.index = c.samples; },
            r => { r.index = '0'; }, r => { delete r.elapsed; }, r => { r.elapsed = -1; },
            r => { r.elapsed = Infinity; }, r => { delete r.reason; }, r => { r.reason = '  '; }]) {
            const bad = trace(outcome); edit(bad);
            assert.throws(() => validateMingjiaoLingPerformRecord(bad, c));
            assert.throws(() => mingjiaoLingPerformEffects([row(bad)], c));
        }
    }
    const effects = mingjiaoLingPerformEffects(['error', 'not_applicable'].map(o => row(trace(o))), c);
    assert.equal(effects.validated, 0); assert.equal(effects.unknown, 2);
    assert.equal(effects.actor_neili_cost.n, 0); assert.equal(effects.actor_neili_cost.mean, null);
    assert.equal(effects.actor_neili_cost.unknown, 2); assert.equal(effects.accepted.trials, 0);
});
