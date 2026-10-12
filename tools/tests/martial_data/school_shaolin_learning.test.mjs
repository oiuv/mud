import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinLearningConditions, shaolinLearningProfiles } from './school_shaolin_learning_cases.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { schoolPracticeEffects, schoolQualificationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinLearningConditions(catalog);
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林13兵器343条件686确定性样本；旧5023条件138066样本不变', () => {
    assert.equal(shaolinLearningProfiles.length, 13); assert.equal(cases.length, 343);
    assert.equal(cases.filter(c => c.method === 'interface').length, 165);
    assert.equal(cases.filter(c => c.method === 'practice').length, 178);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 123);
    assert.equal(cases.reduce((s, c) => s + c.samples, 0), 686);
    assert.equal(shaolinLearningConditions(catalog, { smoke: true }).reduce((s, c) => s + c.samples, 0), 343);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-weapon-learning', 'shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 5023); assert.equal(old.reduce((s, c) => s + c.samples, 0), 138066);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
    for (const d of shaolinLearningProfiles) assert.ok(readFileSync(join(root, `kungfu/class/shaolin/${d[9]}.c`), 'utf8')
        .includes(`set_skill("${d[0]}"`), `教师须实际声明技能 ${d[0]}`);
});

// Synthetic records test only collector invariants; they are not game evidence.
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, jing: 10000, jingli: 10000,
        ...cfg.properties, skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        learned: {}, learned_points: 0, force_attribute: 0, temp: {}, weapon: cfg.equipment?.type ?? 'none',
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        reason: p.expected === 'refused' ? '原条件拒绝' : '', attacks: [], launches: [], interfaces: [], metrics: [{}, {}] };
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, result: Number(p.expected === 'observed') });
    else {
        const d = shaolinLearningProfiles.find(d => d[0] === p.skill), a = r.immediate[0], chu = p.skill === 'weituo-chu';
        a.qi -= p.completed * d[7]; a.neili -= p.completed * (chu && p.level > 200 ? 20 : d[8]);
        if (chu) a.jing = Math.max(-1, a.jing - p.completed * 60);
        a.learned[p.skill] = p.completed * practiceGain(p.level, before[0].skills[p.usage], before[0].int);
        r.command_accepted = Number(p.completed === p.repetitions);
        r.metrics[0].qi_cost = before[0].qi - a.qi; r.metrics[0].neili_cost = before[0].neili - a.neili;
    }
    return r;
}

test('全部条件验证资源与进度，资格拒绝除提示外无副作用', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('damo-jian-valid_learn-l200-int29'), r = row(c);
    r.immediate[0].temp.notify_fail = '悟性不足'; validateSchoolCombatRecord(r, c);
    r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('韦陀杵按原代码检查精力但消耗精神，低精神仍完成三次', () => {
    assert.equal(find('weituo-chu-practice-l200-jingli69').parameters.expected, 'refused');
    const c = find('weituo-chu-practice-l200-jing59-times3'), r = row(c);
    assert.equal(r.immediate[0].jing, -1); assert.equal(r.immediate[0].jingli, 10000);
    assert.equal(r.immediate[0].learned['weituo-chu'], 36);
    validateSchoolCombatRecord(r, c);
    r.immediate[0].jingli -= 180; assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('韦陀杵200/201内力扣费分界及部分完成不被当作零进度', () => {
    for (const [level, completed, cost] of [[200, 3, 0], [201, 1, 20]]) {
        const c = find(`weituo-chu-practice-l${level}-neili70-times3`), r = row(c);
        assert.equal(c.parameters.completed, completed); assert.equal(r.metrics[0].neili_cost, cost);
        validateSchoolCombatRecord(r, c);
    }
    const c = find('weituo-chu-practice-l201-partial-neili'), r = row(c);
    const report = schoolPracticeEffects([{ outcome: r.outcome, raw: r }], 'weituo-chu');
    assert.equal(report.partial_progress, 1); assert.equal(report.progress.mean, 24);
    assert.equal(report.jing_net_cost.mean, 120); assert.equal(report.jingli_net_cost.mean, 0);
    assert.equal(report.neili_cost.mean, 40);
});

test('青云正气分段保留10/11和150/151断点，不推定连续增长', () => {
    assert.equal(find('qingyun-bian-valid_learn-l10-shen-1000000').parameters.expected, 'observed');
    for (const [level, threshold] of [[11, 20], [150, 20], [151, 62100], [800, 711100]]) {
        assert.equal(find(`qingyun-bian-valid_learn-l${level}-shen${threshold - 1}`).parameters.expected, 'refused');
        assert.equal(find(`qingyun-bian-valid_learn-l${level}-shen${threshold}`).parameters.expected, 'observed');
    }
});

test('学习接口不等于练习或教师许可，雷鸣有效内功40可学100才可练', () => {
    assert.equal(find('leiming-bian-valid_learn-l200-force40').parameters.expected, 'observed');
    assert.equal(find('leiming-bian-practice-l200-force99').parameters.expected, 'refused');
    for (const [skill] of shaolinLearningProfiles)
        assert.equal(find(`${skill}-practice-l200-equal-basic`).parameters.expected, 'refused');
    assert.equal(find('weituo-chu-valid_learn-l200-basic199').parameters.expected, 'observed');
    assert.equal(find('damo-jian-valid_learn-l200-basic199').parameters.expected, 'refused');
});

test('报告对缺失资格返回记未知，不把低资源拒绝混作练习成功', () => {
    const c = find('qingyun-bian-valid_learn-l151-shen62099'), r = row(c);
    const rows = [{ outcome: r.outcome, raw: r }];
    assert.equal(schoolQualificationEffects(rows).accepted, 0);
    delete r.interfaces[0].result; assert.equal(schoolQualificationEffects(rows).results.unknown, 1);
    const practice = find('damo-jian-practice-l200-low-qi'), bad = row(practice);
    bad.immediate[0].learned['damo-jian'] = 12;
    assert.throws(() => validateSchoolCombatRecord(bad, practice));
});
