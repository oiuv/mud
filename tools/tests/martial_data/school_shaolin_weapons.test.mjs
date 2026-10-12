import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinWeapons, shaolinWeaponConditions, shaolinWeaponEffects } from './school_shaolin_weapons_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = shaolinWeaponConditions(catalog);
const pick = (skill, suffix = '', level = 200, ability = shaolinWeapons.find(d => d.skill === skill).ability) =>
    cases.find(c => c.id === `school-shaolin-weapons-${skill}-${ability}-l${level}${suffix}`);

// Synthetic records verify the observer, never stand in for real game results.
function raw(c, direct = 0) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(cfg => {
        const temp = { apply: { attack: 0, damage: 50, dodge: -1 } };
        for (const [k, v] of Object.entries(cfg.temp ?? {})) temp[k] = v;
        return { userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000,
            jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000, str: 36, dex: 36, shen: 0,
            ...cfg.properties, effective_str: cfg.properties.str ?? 36, effective_dex: 56,
            skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
            conditions: structuredClone(cfg.conditions ?? {}), temp, busy: cfg.busy ?? 0,
            effective_skills: { club: 300 }, weapon: cfg.equipment?.type ?? 'none', weapon_damage: 50,
            weapon_details: { rigidity: 0 },
        };
    });
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{ direct }, {}], attacks: [], launches: [], callbacks: [], dropped: [], reason: '' };
    if (p.expected === 'refused') { r.reason = '条件不满足'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1, type: 0 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const a = r.immediate[0], t = r.immediate[1];
    const cost = { sheshen: 100, zuida: 150, jishi: 300 }[p.ability] ??
        { suoming: [60, 180], fumo: [100, 300], hongxia: [130, 200] }[p.ability][direct];
    r.metrics[0].neili_cost = cost; a.neili -= cost;
    const d = shaolinWeapons.find(d => d.skill === p.skill);
    if (!d.buff) { a.busy = direct ? p.ability === 'hongxia' ? 1 : 2 : 3; return r; }
    a.busy = p.ability === 'jishi' ? 1 : p.fighting ? 2 : 0; a.temp[d.buff] = 1;
    if (p.ability === 'sheshen') { a.temp.apply.attack += Math.trunc(p.actor.skills[p.skill] / 3); a.temp.apply.dodge -= Math.trunc(p.actor.skills[p.skill] / 5); }
    if (p.ability === 'zuida') { a.temp.str = 36; a.temp.dex = 36; }
    if (p.ability === 'jishi') {
        const requested = Math.trunc((p.actor.skills[p.skill] + p.actor.skills.buddhism) / 6);
        a.temp.apply.attack += Math.min(requested, 100); a.temp.apply.damage += Math.min(requested, 100);
        a.weapon_details.rigidity += requested <= 100 ? 1 : 0;
    }
    return r;
}

test('六门三档与边界独立追加，历史4267条件107542样本不变', () => {
    assert.equal(cases.length, 119); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4256);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4267); assert.equal(old.reduce((n, c) => n + c.samples, 0), 107542);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-weapons'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.equal(shaolinWeaponConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 235);
});

test('内力门槛不是费用，原本不查持棍与战斗的入口不擅加检查', () => {
    for (const d of shaolinWeapons) {
        assert.equal(pick(d.skill, '-low-neili').parameters.actor.properties.neili, d.neili - 1);
        assert.equal(pick(d.skill, '-minimum-neili').parameters.actor.properties.neili, d.neili);
    }
    assert.equal(pick('yecha-gun', '-no-weapon').parameters.expected, 'observed');
    assert.equal(pick('zui-gun', '-no-fight').parameters.expected, 'observed');
    assert.equal(pick('weituo-chu', '-low-max-neili').parameters.actor.properties.max_neili, 1500);
    assert.equal(pick('weituo-chu', '-minimum-max-neili').parameters.actor.properties.max_neili, 1501);
    assert.equal(pick('zui-gun', '-drunk-30').parameters.actor.conditions.drunk, 30);
});

test('三类即时判定按实际分支核对费用与忙乱，不以受理代替直伤', () => {
    for (const skill of ['xiuluo-dao', 'weituo-gun', 'yecha-gun']) for (const hit of [0, 1]) {
        const c = pick(skill), r = raw(c, hit); validateSchoolCombatRecord(r, c);
        const bad = structuredClone(r); bad.immediate[0].busy++;
        assert.throws(() => validateSchoolCombatRecord(bad, c));
    }
    const c = pick('yecha-gun'), r = raw(c, 1); r.immediate[1].busy = 12; validateSchoolCombatRecord(r, c);
    r.immediate[1].busy = 11; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('增益核对写入位置、实际有效属性与刚性，不把字段增量伪造成属性增量', () => {
    for (const d of shaolinWeapons.filter(d => d.buff)) {
        const c = pick(d.skill), r = raw(c); validateSchoolCombatRecord(r, c);
        r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = pick('zui-gun'), r = raw(c); r.immediate[0].effective_str++;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    for (const level of [200, 400, 800]) {
        const c = pick('weituo-chu', '', level), r = raw(c); validateSchoolCombatRecord(r, c);
        r.immediate[0].weapon_details.rigidity++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('拒绝不扣费不改目标；原buff到期需要终态，不伪造普通call_out为角色回调', () => {
    for (const d of shaolinWeapons) {
        const c = pick(d.skill, '-low-neili'), r = raw(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    for (const d of shaolinWeapons.filter(d => d.buff)) {
        const c = pick(d.skill, '-expiry'), r = raw(c);
        r.elapsed = c.parameters.observe_seconds; r.after = structuredClone(r.immediate);
        r.after[0].temp = structuredClone(r.before[0].temp);
        if (d.ability !== 'jishi') r.callbacks = [
            { side: 0, phase: 'before', elapsed: r.elapsed - 2, state: r.immediate[0] },
            { side: 0, phase: 'after', elapsed: r.elapsed - 1.99, state: r.after[0] },
        ];
        validateSchoolCombatRecord(r, c);
        r.after[0].temp[d.buff] = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('增益与实际属性分开统计，缺测不补零', () => {
    const r = raw(pick('zui-gun'));
    const e = shaolinWeaponEffects([{ outcome: 'observed', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.attributes.str.mean, 36); assert.equal(e.effective_str_delta.mean, 0);
    assert.equal(e.callbacks_finished.mean, null); assert.equal(e.applied.rate, 1);
    assert.equal(shaolinWeaponEffects([]).attributes.str.mean, null);
});

test('无异常和无忙乱的原null编码可用，缺失有效属性不能冒充相等', () => {
    const c = pick('zui-gun', '-no-fight'), r = raw(c);
    r.before[0].conditions = null; r.before[1].conditions = null;
    r.immediate[0].busy = null;
    validateSchoolCombatRecord(r, c);
    delete r.before[0].effective_dex; delete r.immediate[0].effective_dex;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    const j = pick('weituo-chu', '', 400), jr = raw(j);
    jr.before[0].weapon_details.rigidity = null; jr.immediate[0].weapon_details.rigidity = null;
    validateSchoolCombatRecord(jr, j);
    delete jr.immediate[0].weapon_details.rigidity;
    assert.throws(() => validateSchoolCombatRecord(jr, j));
});
