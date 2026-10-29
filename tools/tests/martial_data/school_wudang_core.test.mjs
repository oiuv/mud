import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangCoreEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const all = preOctober29SchoolConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)).filter(c => !['wudang-defense', 'wudang-passive', 'wudang-special', 'wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group)),
    cases = all.filter(c => c.parameters.collection_group === 'wudang-core');
const by = (move, level = 200, suffix = '') => cases.find(c => c.id === `school-wudang-core-${move}-l${level}${suffix}`);
function record(c) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000, neili: 6000,
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: config.preparations ?? {}, effective_skills: { force: 300, unarmed: 300 },
        temp: {}, weapon: config.equipment?.type ?? 'none', busy: config.busy ?? 0,
    }));
    return { outcome: c.parameters.expected, before, immediate: structuredClone(before),
        launches: [{ skill: c.parameters.skill }], metrics: [{}, {}], attacks: [], callbacks: [], reason: '' };
}

test('太极拳/神功112条件2772样本；旧1502条件50338样本不变', () => {
    assert.equal(cases.length, 112); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 2772);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 61);
    assert.equal(all.length - cases.length, 1502);
    assert.equal(all.filter(c => !['wudang-core', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group)).reduce((s, c) => s + c.samples, 0), 50338);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const entries = new Set(catalog.skills.flatMap(s => [s.path, ...s.entries.map(e => e.id)]));
    assert.ok(cases.every(c => entries.has(c.entry_id)));
    assert.equal(preOctober29SchoolConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-core')
        .reduce((s, c) => s + c.samples, 0), 222);
});

test('太极图等级和十层领悟、精力、内功/道学边界明确，不用200级拒绝冒充效果', () => {
    assert.equal(by('tu').parameters.expected, 'refused');
    assert.equal(by('tu', 400).parameters.actor.properties['can_perform/taiji-quan/tu'], 10);
    const min = by('tu', 300, '-minimum').parameters.actor;
    assert.equal(min.skills['taiji-quan'], 250); assert.equal(min.skills.taoism, 300);
    assert.equal(min.skills['taiji-shengong'], 300); assert.equal(min.properties.jingli, 1000);
    assert.equal(by('tu', 400, '-low-jingli').parameters.actor.properties.jingli, 999);
});

test('疗伤增加有效值而不是当前值，保留原stary_busy错误的实际行为', () => {
    const c = by('dian'), r = record(c);
    r.metrics[0] = { neili_cost: 800, qi_cost: 100, jing_cost: 50 };
    r.immediate[0].busy = 10; r.immediate[1].eff_qi += 1000; r.immediate[1].eff_jing += 400;
    validateSchoolCombatRecord(r, c);
    r.after = structuredClone(r.immediate);
    const report = wudangCoreEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(report.target_health_delta.eff_qi.mean, 1000); assert.equal(report.target_health_delta.qi.mean, 0);
    r.immediate[1].busy = 2; assert.throws(() => validateSchoolCombatRecord(r, c));
    r.immediate[1].busy = 0; r.immediate[1].qi++; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('太极图原receive_damage有实际伤害，直接结算计数仍是零，扣内力不低于零', () => {
    const c = by('tu', 400, '-target-neili100'), r = record(c);
    r.metrics = [{ neili_cost: 1000 }, { qi_cost: 600, eff_qi_cost: 300, jing_cost: 200, eff_jing_cost: 100 }];
    r.immediate[0].jingli -= 1000; r.immediate[0].busy = 4; r.immediate[1].busy = 3; r.immediate[1].neili = 0;
    validateSchoolCombatRecord(r, c);
    r.after = structuredClone(r.immediate);
    assert.equal(wudangCoreEffects([{ outcome: 'observed', raw: r }]).actor_jingli_spent.mean, 1000);
    r.immediate[1].neili = -400; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('神功原50秒到期撤属性；缺回调或残留增益均拒绝', () => {
    for (const ability of ['powerup', 'shield']) {
        const c = by(ability, 50, '-expiry'), r = record(c), fields = ability === 'powerup' ? ['attack', 'defense'] : ['armor'];
        r.metrics[0].neili_cost = 100; r.immediate[0].neili -= 100; r.immediate[0].busy = 2;
        r.immediate[0].temp = { [ability]: 1, apply: Object.fromEntries(fields.map(k => [k, ability === 'powerup' ? 16 : 25])) };
        r.after = structuredClone(r.immediate); r.after[0].temp = {}; r.elapsed = 52.1;
        r.callbacks = [{ side: 0, phase: 'before', elapsed: 49.9, state: r.immediate[0] },
            { side: 0, phase: 'after', elapsed: 49.91, state: r.after[0] }];
        validateSchoolCombatRecord(r, c);
        const noCallback = structuredClone(r); noCallback.callbacks = []; assert.throws(() => validateSchoolCombatRecord(noCallback, c));
        r.after[0].temp[ability] = 1; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('拒绝无资源变动，notify_fail消息不当作增益', () => {
    const c = by('ji', 200, '-no-grant'), r = record(c); r.launches = []; r.reason = '未领悟';
    r.immediate[0].temp.notify_fail = '未领悟'; validateSchoolCombatRecord(r, c);
    r.immediate[0].jingli--; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('拳法判定失败仍可合法发动；费用、忙乱及精神分别核对', () => {
    for (const move of ['ji', 'yin', 'zhan', 'zhen']) for (const direct of [0, 1]) {
        const c = by(move), r = record(c);
        r.metrics[0] = { direct, neili_cost: move === 'zhen' ? 50
            : direct ? (move === 'yin' ? 80 : 30) : (move === 'yin' ? 60 : 10) };
        r.immediate[0].busy = move === 'zhen' ? 3 : direct ? (move === 'yin' ? 1 : 2) : move === 'ji' ? 4 : 3;
        if (move === 'ji' && direct) r.metrics[1] = { jing_cost: 100, eff_jing_cost: 100 };
        if (['yin', 'zhan'].includes(move) && direct) r.immediate[1].busy = move === 'yin' ? 12 : 7;
        validateSchoolCombatRecord(r, c);
        r.metrics[0].neili_cost++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('太极图未伤害分支仍扣目标200内力；预期拒绝不并入统计', () => {
    const c = by('tu', 400), r = record(c);
    r.metrics[0].neili_cost = 1000; r.immediate[0].jingli -= 1000;
    r.immediate[0].busy = 4; r.immediate[1].neili -= 200; r.after = structuredClone(r.immediate);
    validateSchoolCombatRecord(r, c);
    const report = wudangCoreEffects([{ outcome: 'observed', raw: r }, { outcome: 'refused', raw: {} }]);
    assert.equal(report.target_health_delta.neili.mean, -200); assert.equal(report.target_damage_branch.successes, 0);
    assert.equal(report.target_damage_branch.trials, 1);
    r.immediate[1].neili += 200; assert.throws(() => validateSchoolCombatRecord(r, c));
});
