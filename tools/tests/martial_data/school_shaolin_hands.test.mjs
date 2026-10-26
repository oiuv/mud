import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinHandConditions, shaolinHandEffects } from './school_shaolin_hands_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinHandConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) =>
    cases.find(c => c.id === `school-shaolin-hands-${skill}-${ability}-l${level}${suffix}`);

// Synthetic records validate the collector only; real game evidence is separate.
function record(c, hit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, i) => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, eff_jing: 10000,
        neili: 6000, max_neili: 6000, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations ?? {}), weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? null,
        effective_skills: { hand: 300, force: 300 },
        temp: { apply: { armor: 100 + (cfg.cloth?.armor ?? 0) } },
        cloth: cfg.cloth ? { object: '/tests/cloth#1', armor: cfg.cloth.armor, equipped: 1, location: 'actor', value: 100, name: '演武衣' } : {},
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], attacks: [], launches: [], reason: '', terminals: [], immediate_attack_count: 0 };
    if (p.expected === 'refused') { r.reason = '原资格拒绝'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1 }); r.immediate_attack_count = 1; return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    const a = r.immediate[0], t = r.immediate[1]; let cost;
    if (p.ability === 'chixue') {
        cost = hit ? p.target_heartbeat ? 500 : 400 : 100;
        r.metrics[0].direct = +(cost === 400); a.busy = hit ? 3 : 4;
        r.attacks = Array.from({ length: 4 }, () => ({ actor: 0, target: 1 }));
        r.immediate_attack_count = 4;
        t.busy = 0;
        if (cost === 500) {
            t.eff_qi = -1; t.eff_jing = 0; r.terminals.push({ side: 1, state: 'death' });
            r.after = structuredClone(r.immediate); r.after[1].ghost = 1; r.elapsed = 2;
            r.observation_terminal = 'death';
        }
    } else if (p.ability === 'yin') {
        const damage = Math.trunc(a.skills[p.skill] / 40) * (a.jiali + 1);
        cost = 200 + (hit ? a.jiali + 1 : 0); a.busy = 2;
        r.metrics[1].qi_cost = hit ? damage : 0; r.metrics[1].eff_qi_cost = hit ? Math.trunc(damage / 3) : 0;
        t.qi -= r.metrics[1].qi_cost; t.eff_qi -= r.metrics[1].eff_qi_cost;
        if (p.target.cloth && hit && damage > 500 && p.target.cloth.armor < 200) {
            Object.assign(t.cloth, { armor: 0, equipped: 0, location: 'room', value: 0, name: '破碎的演武衣' });
            t.temp.apply.armor = 100;
        }
    } else {
        r.metrics[0].direct = +hit;
        cost = { zhua: [60, 180], wuwo: [20, 200], qinna: [20, 80], qianye: [30, 100] }[p.ability][+hit];
        a.busy = hit ? ['qinna', 'qianye'].includes(p.ability) ? 1 : 2 : 3;
        if (hit && ['qinna', 'qianye'].includes(p.ability) && !p.target.busy) t.busy = 14;
    }
    a.neili -= cost; r.metrics[0].neili_cost = cost;
    return r;
}

test('八门手爪徒手139条件6652样本；历史4884条件131414样本不变', () => {
    assert.equal(cases.length, 139); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 6652);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 41);
    assert.equal(shaolinHandConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 278);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4884); assert.equal(old.reduce((n, c) => n + c.samples, 0), 131414);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-hands'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
});

test('全部原拒绝条件无扣费无伤害，不把未领悟统一判拒绝', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    assert.equal(pick('longzhua-gong', 'zhua', '-armed').parameters.expected, 'observed');
    assert.equal(pick('dacidabei-shou', 'yin', '-no-grant').parameters.expected, 'observed');
    assert.equal(pick('yintuoluo-zhua', 'chixue', '-no-grant').parameters.expected, 'refused');
});

test('八门普攻均走原攻击，破衲和弹腿不伪造主动入口', () => {
    for (const c of cases.filter(c => c.method === 'ordinary')) {
        const r = record(c); validateSchoolCombatRecord(r, c);
        r.attacks.push({ actor: 0, target: 1 }); r.immediate_attack_count++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    for (const s of ['pona-gong', 'shaolin-tantui']) assert.equal(cases.filter(c => c.parameters.skill === s).length, 3);
});

test('神龙抓、众生无我与两种控制按成功和失手费用核验', () => {
    for (const [skill, ability] of [['longzhua-gong', 'zhua'], ['jimie-zhua', 'wuwo'], ['fengyun-shou', 'qinna'], ['qianye-shou', 'qianye']])
        for (const hit of [false, true]) {
            const c = pick(skill, ability), r = record(c, hit); validateSchoolCombatRecord(r, c);
            r.metrics[0].neili_cost++; assert.throws(() => validateSchoolCombatRecord(r, c));
        }
});

test('赤血无论首击成败仍四次追击，临时攻击和伤害加成必须复原', () => {
    const c = pick('yintuoluo-zhua', 'chixue', '-target-busy');
    for (const hit of [false, true]) {
        const r = record(c, hit); validateSchoolCombatRecord(r, c);
        r.immediate[0].temp.apply.attack = 100; assert.throws(() => validateSchoolCombatRecord(r, c));
        delete r.immediate[0].temp.apply.attack;
        r.attacks.pop(); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('赤血双严格大于边界分别列出，仅重创条件观察原心跳死亡', () => {
    for (const max of [12000, 12001]) for (const neili of [500, 501]) {
        const c = pick('yintuoluo-zhua', 'chixue', `-max${max}-neili${neili}`, 800);
        assert.equal(!!c.parameters.target_heartbeat, max === 12001 && neili === 501);
    }
    const c = pick('yintuoluo-zhua', 'chixue', '-max12001-neili501', 800), r = record(c, true);
    validateSchoolCombatRecord(r, c);
    assert.equal(shaolinHandEffects([{ outcome: 'observed', raw: r }], true).target_death.rate, 1);
    r.terminals = []; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('大手印伤血/伤势与破甲阈值独立，不毁灭对象或漏掉原属性变化', () => {
    for (const armor of [199, 200]) for (const jiali of [99, 100]) {
        const c = pick('dacidabei-shou', 'yin', `-cloth${armor}-jiali${jiali}`), r = record(c, true);
        validateSchoolCombatRecord(r, c);
        const effects = shaolinHandEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(effects.cloth_broken.successes, armor === 199 && jiali === 100 ? 1 : 0);
        r.immediate[1].cloth.object = ''; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = pick('dacidabei-shou', 'yin', '-cloth199-miss'), r = record(c, false);
    validateSchoolCombatRecord(r, c); r.immediate[1].cloth.armor = 0; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('不穿衣、未开原心跳和拒绝样本不能当作零破甲率或零死亡率', () => {
    const c = pick('dacidabei-shou', 'yin'), r = record(c, true);
    const e = shaolinHandEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused', raw: {} }]);
    assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    assert.equal(e.cloth_broken.rate, null); assert.equal(e.target_death.rate, null);
    assert.equal(shaolinHandEffects([]).target_busy.mean, null);
});

test('重创后原恢复可以存活，观察窗结束不伪报死亡或无限生存', () => {
    const c = pick('yintuoluo-zhua', 'chixue', '-max12001-neili501', 800), r = record(c, true);
    r.observation_terminal = 'window_complete'; r.elapsed = 30.2; r.after[1].ghost = 0; r.terminals = [];
    r.attacks.push({ actor: 1, target: 0 });
    validateSchoolCombatRecord(r, c);
    const e = shaolinHandEffects([{ outcome: 'observed', raw: r }], true);
    assert.equal(e.target_death.rate, 0); assert.equal(e.initial_attacks.mean, 4);
    assert.equal(e.observation_window_completed, 1);
    r.elapsed = 3; assert.throws(() => validateSchoolCombatRecord(r, c));
});
