import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinAdditional, shaolinAdditionalConditions, shaolinAdditionalEffects } from './school_shaolin_additional_cases.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = shaolinAdditionalConditions(catalog);
const pick = (skill, ability, suffix = '', level = 200) =>
    cases.find(c => c.id === `school-shaolin-additional-${skill}-${ability}-l${level}${suffix}`);

// Synthetic observer checks; these are not measured gameplay results.
function record(c, hit = false) {
    const p = c.parameters;
    const before = [p.actor, p.target].map((cfg, side) => ({
        userp: 1, interactive: 1, wizardp: 0, object: `/tests/actor#${side}`,
        qi: 10000, neili: 6000, max_neili: 6000, jiali: 0, ...cfg.properties,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        weapon: cfg.equipment?.type ?? 'none', busy: cfg.busy ?? null,
        temp: { apply: { attack: 0, damage: 50, defense: 0, armor: 100, dodge: -1 }, ...cfg.temp },
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        metrics: [{}, {}], attacks: [], launches: [], callbacks: [], dropped: [], reason: '' };
    if (p.skill === 'qingyun-bian') r.skill_load_context = { actor: before[0].object,
        already_loaded: 1, max_neili: before[0].max_neili, shen: before[0].shen };
    if (p.expected === 'refused') { r.reason = '原条件拒绝'; return r; }
    if (c.method === 'ordinary') { r.attacks.push({ actor: 0, target: 1 }); return r; }
    r.launches.push({ skill: p.skill, argument: p.ability });
    let cost = 0, count = 0, direct = 0, busy = 0;
    switch (p.ability) {
        case 'kuang': cost = 300; count = 6; busy = 2; break;
        case 'leiting': direct = +hit; count = 1 - direct; cost = direct * 50; busy = 1; break;
        case 'xiuluo': cost = 600; count = 4; busy = 1; break;
        case 'huo': direct = +hit; cost = 200 * (direct + 1); busy = 2; break;
        case 'ming': direct = +hit; cost = 20 * (direct + 1); busy = hit ? 2 : 3; break;
        case 'cibei': cost = hit ? 300 : 200; count = hit ? 3 : 0; busy = hit ? 2 : 0; break;
        case 'duan': cost = p.level === 800 ? 400 : 150; count = 2; busy = 2; break;
        case 'zhenyan': {
            cost = 400; busy = p.fighting ? 2 : 0;
            const a = r.immediate[0]; a.temp.zhen_yan = 1;
            for (const key of ['attack', 'defense', 'damage']) a.temp.apply[key] += Math.trunc(p.actor.skills[p.skill] * (key === 'damage' ? 1 / 4 : 2 / 5));
            break;
        }
    }
    r.metrics[0] = { neili_cost: cost, direct }; r.immediate[0].neili -= cost; r.immediate[0].busy = busy;
    r.attacks = Array.from({ length: count }, () => ({ actor: 0, target: 1 }));
    return r;
}

test('六门八招145条件4994样本独立追加，旧4386条件111798样本不变', () => {
    assert.equal(cases.length, 145); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4994);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 4386); assert.equal(old.reduce((n, c) => n + c.samples, 0), 111798);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === 'shaolin-additional'), cases);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    for (const c of cases) {
        assert.ok(entries.has(c.entry_id));
        for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    }
    assert.equal(shaolinAdditionalConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 289);
});

test('基本技能、有效内功、有效根骨与武学等级门槛不混淆', () => {
    assert.equal(pick('jiechen-dao', 'xiuluo', '-con-13').parameters.actor.properties.con + 20, 33);
    assert.equal(pick('jiechen-dao', 'xiuluo', '-con-14').parameters.expected, 'observed');
    assert.equal(pick('ranmu-daofa', 'huo', '-minimum-force').parameters.actor.skills['hunyuan-yiqi'], 249);
    assert.equal(pick('qingyun-bian', 'duan', '-force-minimum').parameters.actor.skills.force, 100);
    assert.equal(pick('qingyun-bian', 'duan', '-no-weapon').parameters.expected, 'observed');
    assert.equal(pick('ranmu-daofa', 'zhenyan', '-no-fight').parameters.expected, 'observed');
});

test('八个原入口及两个随机分支核对发动、费用、连击和状态恢复', () => {
    for (const d of shaolinAdditional) for (const [ability] of d.moves) for (const hit of [false, true]) {
        const c = pick(d.skill, ability), r = record(c, hit); validateSchoolCombatRecord(r, c);
        r.immediate[0].jiali++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('普攻的燃木耗内、雷鸣被动耗内不强行判为零费用', () => {
    for (const [skill, cost] of [['ranmu-daofa', 100], ['leiming-bian', 50]]) {
        const c = pick(skill, 'ordinary'), r = record(c); r.metrics[0].neili_cost = cost; r.immediate[0].neili -= cost;
        validateSchoolCombatRecord(r, c); r.metrics[0].neili_cost++; r.immediate[0].neili--;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('拒绝不得扣费或改写目标；缺少实际玩家身份不能通过', () => {
    for (const d of shaolinAdditional) for (const [ability] of d.moves) {
        const c = pick(d.skill, ability, '-low-neili'), r = record(c); validateSchoolCombatRecord(r, c);
        r.immediate[1].qi--; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = pick('hongye-daofa', 'kuang'), r = record(c); delete r.before[0].userp;
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('青云低内力负终态是待调查数据，不由采集器钳制或丢弃', () => {
    const c = pick('qingyun-bian', 'duan', '-minimum-neili', 800), r = record(c);
    validateSchoolCombatRecord(r, c); assert.equal(r.immediate[0].neili, -199);
    const e = shaolinAdditionalEffects([{ outcome: 'observed', raw: r }, { outcome: 'error', raw: {} }]);
    assert.equal(e.negative_neili.successes, 1); assert.equal(e.samples, 1); assert.equal(e.unknown_or_unobserved, 1);
    delete r.skill_load_context.actor; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('雷鸣缴械允许原卸器带来的目标轻功变化，断云仍须归还临时减益', () => {
    const c = pick('leiming-bian', 'cibei'), r = record(c, true);
    r.immediate[1].weapon = 'none'; r.immediate[1].temp.apply.dodge++;
    validateSchoolCombatRecord(r, c);
    const d = pick('qingyun-bian', 'duan'), dr = record(d);
    dr.immediate[1].temp.apply.dodge++;
    assert.throws(() => validateSchoolCombatRecord(dr, d));
});

test('真焰持续效果必须观察原回调和属性归还，未到期不报解除', () => {
    const c = pick('ranmu-daofa', 'zhenyan', '-expiry'), r = record(c);
    r.elapsed = c.parameters.observe_seconds; r.after = structuredClone(r.immediate);
    r.after[0].temp = structuredClone(r.before[0].temp);
    r.callbacks = [{ side: 0, phase: 'before', elapsed: 200 }, { side: 0, phase: 'after', elapsed: 200 }];
    validateSchoolCombatRecord(r, c); r.after[0].temp.apply.attack++;
    assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(shaolinAdditionalEffects([]).attributes.attack.mean, null);
});
