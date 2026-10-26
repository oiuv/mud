import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shenmenPassiveEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-shenmen');
const by = suffix => cases.find(c => c.id === 'school-wudang-shenmen-' + suffix);

test('神门被动33条件2516样本；旧1914条件67056样本保持', () => {
    assert.equal(cases.length, 33); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2516);
    const old = all.filter(c => !['wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1914); assert.equal(old.reduce((n, c) => n + c.samples, 0), 67056);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    assert.equal(cases.filter(c => c.method === 'ordinary').length, 12);
    for (const c of cases) for (const path of c.parameters.qualification_sources) assert.ok(existsSync(join(root, path)), path);
    assert.equal(schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'wudang-shenmen')
        .reduce((n, c) => n + c.samples, 0), 66);
});

function row(c, success = false) {
    const before = [c.parameters.actor, c.parameters.target].map(config => ({
        ...config.properties, skills: config.skills, mappings: config.mappings,
        living: 1, busy: config.busy ?? 0, qi: 10000, eff_qi: 10000,
        weapon: config.equipment?.type ?? 'none',
    }));
    const r = { outcome: 'observed', before, immediate: structuredClone(before), passives: [],
        launches: [], interfaces: [], attacks: [], dropped: [], metrics: [{}, {}] };
    const wound = success ? Math.trunc((c.parameters.interface?.damage - 100) / 4) : 0;
    if (c.parameters.target_state === 'unconscious') {
        r.preparation = { before: { living: 1 }, after: { living: 0 } };
        r.before[1].living = r.immediate[1].living = 0;
    }
    if (c.method === 'interface') {
        const result = success ? '原缴械描述' : 0;
        r.passives = [{ actor: 0, target: 1, skill: 'shenmen-jian', incoming: c.parameters.interface.damage,
            route: 'interface', result, neili_after: before[0].neili, target_eff_qi_after: 10000 - wound,
            target_busy_after: success ? 2 : before[1].busy }];
        r.interfaces = [{ result }];
    }
    if (success) {
        r.immediate[1].weapon = 'none'; r.immediate[1].busy = 2; r.dropped = [{}];
        r.metrics[1].qi_cost = r.metrics[1].eff_qi_cost = wound;
    }
    return r;
}

test('满足资格仍允许随机不触发，零创伤缴械不能误判失败', () => {
    for (const suffix of ['interface-l400', 'interface-l400-damage100', 'interface-l400-damage103',
        'interface-l400-damage104', 'interface-l400-skill80', 'interface-l400-neili500', 'interface-l400-max6001',
        'interface-l400-actor-unarmed', 'interface-l400-actor-busy', 'interface-l400-wrong-mapping']) {
        const c = by(suffix);
        validateSchoolCombatRecord(row(c, false), c); validateSchoolCombatRecord(row(c, true), c);
    }
});

test('原边界阻断不得伪造缴械，当前内力与上限分开', () => {
    for (const suffix of ['damage99', 'skill79', 'neili499', 'max5999', 'target3001',
        'target-unarmed', 'target-busy', 'target-unconscious']) {
        const c = by('interface-l400-' + suffix);
        validateSchoolCombatRecord(row(c), c);
        assert.throws(() => validateSchoolCombatRecord(row(c, true), c));
    }
});

test('接口的物品落地、忙乱、创伤与费用必须一致', () => {
    const c = by('interface-l400');
    for (const mutate of [r => r.dropped.pop(), r => r.immediate[1].busy = 0,
        r => r.metrics[1].eff_qi_cost++, r => r.metrics[0].neili_cost = 1,
        r => r.passives[0].target_eff_qi_after++, r => r.passives[0].incoming++]) {
        const r = row(c, true); mutate(r); assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});

test('实际普攻允许没到被动接口，调用率和样本触发率分别统计', () => {
    const c = by('ordinary-l400-jiali0-target3000'), r = row(c);
    r.attacks = [{ actor: 0, target: 1, type: 0, result: -1 }];
    validateSchoolCombatRecord(r, c);
    const hit = row(by('interface-l400-damage100'), true);
    const report = shenmenPassiveEffects([{ outcome: 'observed', raw: r }, { outcome: 'observed', raw: hit }]);
    assert.equal(report.attempts, 2); assert.equal(report.calls, 1); assert.equal(report.eligible_calls, 1);
    assert.equal(report.samples_with_effect.rate, 0.5); assert.equal(report.trigger_per_eligible_call, 1);
    assert.equal(report.source_wound_on_trigger.mean, 0);
    assert.equal(shenmenPassiveEffects([{ outcome: 'observed', raw: r }]).trigger_per_eligible_call, null);
});

test('普攻结算后中断新忙乱，不把被动时状态冒充最终控制', () => {
    const c = by('ordinary-l400-jiali0-target3000');
    for (const damage of [0, 179]) {
        const r = row(by('interface-l400'), true);
        r.passives[0].route = 'martial'; r.interfaces = [];
        r.attacks = [{ actor: 0, target: 1, type: 0, damage, result: 0 }];
        r.immediate[1].busy = damage ? 0 : 2;
        validateSchoolCombatRecord(r, c);
        const stats = shenmenPassiveEffects([{ outcome: 'observed', raw: r }]);
        assert.equal(stats.target_busy_at_callback.mean, 2);
        assert.equal(stats.busy_cleared_on_trigger, damage ? 1 : 0);
        assert.equal(stats.busy_retained_on_trigger, damage ? 0 : 1);
        r.immediate[1].busy = damage ? 2 : 0;
        assert.throws(() => validateSchoolCombatRecord(r, c));
    }
});
