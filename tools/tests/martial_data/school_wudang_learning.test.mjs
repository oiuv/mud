import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { wudangLearningProfiles } from './school_wudang_learning_cases.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { schoolPracticeEffects, schoolQualificationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school));
const cases = all.filter(c => c.parameters.collection_group === 'wudang-learning');
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('武当17技能409条件818确定性样本，旧2056条件74494样本保持', () => {
    assert.equal(wudangLearningProfiles.length, 17); assert.equal(cases.length, 409);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 818);
    assert.equal(cases.filter(c => c.method === 'interface').length, 192);
    assert.equal(cases.filter(c => c.method === 'practice').length, 217);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 140);
    const old = all.filter(c => !['wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel', 'wudang-buffs', 'wudang-lookup', 'wudang-condition', 'shaolin-sword', 'shaolin-weapons', 'shaolin-additional', 'shaolin-fists', 'shaolin-palms', 'shaolin-fingers', 'shaolin-hands', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 2056); assert.equal(old.reduce((n, c) => n + c.samples, 0), 74494);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
});

function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(config => ({
        ...config.properties, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        learned: {}, learned_points: 0, force_attribute: 0, temp: {},
        weapon: config.equipment?.type ?? 'none',
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        reason: p.expected === 'refused' ? '原条件拒绝' : '', launches: [], attacks: [], interfaces: [], metrics: [{}, {}] };
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, result: Number(p.expected === 'observed') });
    else {
        const profile = wudangLearningProfiles.find(v => v[0] === p.skill), after = r.immediate[0];
        const qiCost = p.skill === 'zhenshan-zhang' && p.level < 50 ? 30 : profile[7];
        after.qi -= p.completed * qiCost; after.neili -= p.completed * profile[8];
        r.command_accepted = Number(p.completed === p.repetitions);
        after.learned[p.skill] = p.completed * practiceGain(p.level, before[0].skills[p.usage], before[0].int);
        r.metrics[0].qi_cost = p.completed * qiCost; r.metrics[0].neili_cost = p.completed * profile[8];
    }
    return r;
}

test('每项真实接口/命令条件可验证，资格查询拒绝只允许notify_fail变化', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('taiji-jian-valid_learn-l200-int25'), r = row(c);
    r.immediate[0].temp.notify_fail = '悟性太差'; validateSchoolCombatRecord(r, c);
    r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('神门学习检查当前内力300，练习内部65不代表整条入口只需65', () => {
    assert.equal(find('shenmen-jian-valid_learn-l200-neili299').parameters.expected, 'refused');
    assert.equal(find('shenmen-jian-valid_learn-l200-maxneili1').parameters.expected, 'observed');
    assert.equal(find('shenmen-jian-practice-l200-inner-minimum65').parameters.expected, 'refused');
    const c = find('shenmen-jian-practice-l200-partial-neili'), r = row(c);
    assert.equal(r.immediate[0].neili, 10); assert.equal(r.command_accepted, 0);
    assert.equal(r.immediate[0].learned['shenmen-jian'], 60);
    validateSchoolCombatRecord(r, c);
    r.immediate[0].learned['shenmen-jian'] = 0; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('虎爪明确区分有效与基本等级，不机械当作基本30门槛', () => {
    assert.equal(find('huzhua-shou-valid_learn-l1-effective-basic30').parameters.expected, 'refused');
    const c = find('huzhua-shou-valid_learn-l20-effective-basic20');
    assert.equal(c.parameters.expected, 'observed'); assert.equal(c.parameters.actor.skills.claw, 20);
    assert.equal(find('huzhua-shou-valid_learn-l1-effective-basic60').parameters.expected, 'observed');
});

test('资格同级可行不代表可练，排云/梯云自己的接口不限制基本低于特殊', () => {
    for (const [skill] of wudangLearningProfiles) {
        assert.equal(find(`${skill}-valid_learn-l200-basic200`).parameters.expected, 'observed');
        assert.equal(find(`${skill}-practice-l200-equal-basic`).parameters.expected, 'refused');
    }
    for (const skill of ['paiyun-shou', 'tiyunzong']) assert.equal(find(`${skill}-valid_learn-l200-basic199`).parameters.expected, 'observed');
    for (const skill of ['furong-jinzhen', 'tiyunzong']) assert.equal(find(`${skill}-practice-l200-wrong-weapon`).parameters.expected, 'observed');
});

test('震山50级体力断点、进度300/500断点、武当掌百花已学拒绝保持原样', () => {
    for (const [level, cost] of [[49, 30], [50, 50]]) {
        const c = find(`zhenshan-zhang-practice-l${level}-qi-break`), r = row(c);
        assert.equal(r.metrics[0].qi_cost, cost); validateSchoolCombatRecord(r, c);
    }
    assert.deepEqual([299, 300, 499, 500].map(level => row(find(`wudang-jian-practice-l${level}-gain-break`))
        .immediate[0].learned['wudang-jian']), [13, 7, 7, 3]);
    for (const ability of ['valid_learn', 'practice']) assert.equal(find(`wudang-zhang-${ability}-l200-baihua-known`).parameters.expected, 'refused');
});

test('资格报告保留拒绝与返回值，缺失返回不能当零', () => {
    const cs = [find('taiji-jian-valid_learn-l200-int25'), find('taiji-jian-valid_learn-l200-int26')];
    const rs = cs.map(c => ({ outcome: c.parameters.expected, raw: row(c) }));
    const report = schoolQualificationEffects(rs);
    assert.equal(report.attempts, 2); assert.equal(report.accepted, 1); assert.equal(report.results.mean, 0.5);
    delete rs[0].raw.interfaces[0].result;
    assert.equal(schoolQualificationEffects(rs).results.n, 1);
    assert.equal(schoolQualificationEffects(rs).results.unknown, 1);
});

test('练习摘要保留中途停止的实际进度和费用', () => {
    const c = find('shenmen-jian-practice-l200-partial-neili'), r = row(c);
    const report = schoolPracticeEffects([{ outcome: r.outcome, raw: r }], 'shenmen-jian');
    assert.equal(report.partial_progress, 1); assert.equal(report.progress.mean, 60);
    assert.equal(report.qi_cost.mean, 260); assert.equal(report.neili_cost.mean, 290);
});
