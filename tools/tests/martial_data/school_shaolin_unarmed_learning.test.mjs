import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { shaolinUnarmedLearningConditions, shaolinUnarmedLearningProfiles } from './school_shaolin_unarmed_learning_cases.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { schoolPracticeEffects, schoolQualificationEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root)), cases = shaolinUnarmedLearningConditions(catalog);
const find = suffix => { const c = cases.find(c => c.id.endsWith(suffix)); assert.ok(c, suffix); return c; };

test('少林28门684条件1368样本；旧5366条件138752计划样本不变', () => {
    assert.equal(shaolinUnarmedLearningProfiles.length, 28); assert.equal(cases.length, 684);
    assert.equal(cases.filter(c => c.method === 'interface').length, 337);
    assert.equal(cases.filter(c => c.method === 'practice').length, 347);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 241);
    assert.equal(cases.reduce((s, c) => s + c.samples, 0), 1368);
    assert.equal(shaolinUnarmedLearningConditions(catalog, { smoke: true }).reduce((s, c) => s + c.samples, 0), 684);
    const all = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen', 'wudang', 'shaolin'].includes(c.parameters.school)), old = all.filter(c => !['shaolin-unarmed-learning', 'shaolin-cultivation', 'shaolin-exert', 'shaolin-recovery', 'shaolin-backlash', 'shaolin-public-force', 'shaolin-healing', 'shaolin-dispel', 'shaolin-buffs', 'shaolin-combination', 'shaolin-defense', 'shaolin-bout'].includes(c.parameters.collection_group));
    assert.equal(old.length, 5366); assert.equal(old.reduce((s, c) => s + c.samples, 0), 138752);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    for (const c of cases) for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
    for (const d of shaolinUnarmedLearningProfiles) assert.ok(readFileSync(join(root, `kungfu/class/shaolin/${d.teacher}.c`), 'utf8')
        .includes(`set_skill("${d.skill}"`), `NPC须实际声明技能 ${d.skill}`);
});

// Synthetic collector tests only; the game evidence is separately collected with FluffOS.
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
        const d = shaolinUnarmedLearningProfiles.find(d => d.skill === p.skill), a = r.immediate[0];
        a.qi = Math.max(-1, a.qi - p.completed * d.qiCost); a.neili -= p.completed * d.neiliCost;
        a.learned[p.skill] = p.completed * practiceGain(p.level, before[0].skills[p.usage], before[0].int);
        r.command_accepted = Number(p.completed === p.repetitions);
        r.metrics[0].qi_cost = before[0].qi - a.qi; r.metrics[0].neili_cost = before[0].neili - a.neili;
    }
    return r;
}

test('全部条件核对资格、资源和进度；拒绝不能改资源或冒充获得进度', () => {
    for (const c of cases) validateSchoolCombatRecord(row(c), c);
    const c = find('rulai-zhang-valid_learn-l200-con31'), r = row(c);
    r.immediate[0].temp.notify_fail = '根骨不足'; validateSchoolCombatRecord(r, c);
    r.immediate[0].neili--; assert.throws(() => validateSchoolCombatRecord(r, c));
    const p = find('yizhi-chan-practice-l200-low-qi'), bad = row(p);
    bad.immediate[0].learned['yizhi-chan'] = 12; assert.throws(() => validateSchoolCombatRecord(bad, p));
});

test('基础内功门槛保留激发；有效内功测试用无激发原等级的一半', () => {
    const raw = find('sanhua-zhang-valid_learn-l200-force59').parameters;
    assert.equal(raw.actor.skills.force, 59); assert.equal(raw.actor.mappings.force, 'hunyuan-yiqi');
    assert.equal(raw.expected, 'refused');
    const effective = find('nianhua-zhi-valid_learn-l200-force60').parameters;
    assert.equal(effective.actor.skills.force, 120); assert.equal(effective.actor.mappings.force, undefined);
    assert.equal(effective.expected, 'observed');
});

test('握石掌与醉拳是或条件，少林弹腿是双基础且可按轻功练习', () => {
    for (const suffix of ['woshi-zhang-valid_learn-l200-sanhua80-banruo0',
        'woshi-zhang-valid_learn-l200-sanhua0-banruo80', 'zuiquan-sanda-valid_learn-l200-unarmed200-cuff199',
        'zuiquan-sanda-valid_learn-l200-unarmed199-cuff200', 'shaolin-tantui-valid_learn-l200-unarmed200-dodge200'])
        assert.equal(find(suffix).parameters.expected, 'observed');
    for (const suffix of ['woshi-zhang-valid_learn-l200-sanhua79-banruo79', 'zuiquan-sanda-valid_learn-l200-unarmed199-cuff199',
        'shaolin-tantui-valid_learn-l200-unarmed199-dodge201', 'shaolin-tantui-valid_learn-l200-unarmed201-dodge199'])
        assert.equal(find(suffix).parameters.expected, 'refused');
    assert.equal(find('shaolin-tantui-practice-l400-dodge').parameters.action, 'practice dodge 1');
});

test('去烦恼指与大慈大悲手保留分段门槛，不推断持续增长', () => {
    for (const [level, hunyuan, expected] of [[59, 0, 'observed'], [60, 48, 'refused'], [60, 49, 'observed'],
        [173, 139, 'observed'], [174, 139, 'refused'], [800, 140, 'observed']])
        assert.equal(find(`qufannao-zhi-valid_learn-l${level}-hunyuan${hunyuan}`).parameters.expected, expected);
    assert.equal(find('dacidabei-shou-valid_learn-l400-buddhism299').parameters.expected, 'refused');
    assert.equal(find('dacidabei-shou-valid_learn-l800-buddhism300').parameters.expected, 'observed');
});

test('伏虎拳低气血仍可练，精力不扣且净气血消耗不伪造为75', () => {
    const c = find('fuhu-quan-practice-l200-qi24-times3'), r = row(c);
    assert.equal(r.immediate[0].qi, -1); assert.equal(r.immediate[0].jingli, 10000);
    assert.equal(r.metrics[0].qi_cost, 25); assert.equal(r.metrics[0].neili_cost, 15);
    assert.equal(r.immediate[0].learned['fuhu-quan'], 36); validateSchoolCombatRecord(r, c);
    r.immediate[0].jingli -= 75; assert.throws(() => validateSchoolCombatRecord(r, c));
    assert.equal(find('fuhu-quan-practice-l200-jingli29').parameters.expected, 'refused');
    assert.equal(find('fuhu-quan-practice-l200-jingli30').parameters.expected, 'observed');
});

test('融合后的指法拒绝和公共练习限制保留，身法不强行套空手限制', () => {
    for (const skill of ['duoluoye-zhi', 'xiuluo-zhi', 'tianzhu-fuzhi']) for (const ability of ['valid_learn', 'practice'])
        assert.equal(find(`${skill}-${ability}-l200-canhe1`).parameters.expected, 'refused');
    for (const d of shaolinUnarmedLearningProfiles) {
        assert.equal(find(`${d.skill}-practice-l200-equal-basic`).parameters.expected, 'refused');
        assert.equal(find(`${d.skill}-practice-l200-armed`).parameters.expected,
            d.skill === 'shaolin-shenfa' ? 'observed' : 'refused');
    }
    assert.equal(find('qinna-shibada-valid_learn-l200-zero-hunyuan').parameters.expected, 'observed');
});

test('三次只完成两次仍计实际进度和扣费，报告不混为完全拒绝', () => {
    const c = find('rulai-zhang-practice-l200-partial-neili'), r = row(c);
    const report = schoolPracticeEffects([{ outcome: r.outcome, raw: r }], 'rulai-zhang');
    assert.equal(report.partial_progress, 1); assert.equal(report.progress.mean, 24);
    assert.equal(report.neili_cost.mean, 400); assert.equal(report.qi_cost.mean, 360);
    assert.equal(report.jing_net_cost.mean, 0); assert.equal(report.jingli_net_cost.mean, 0);
    const q = row(find('rulai-zhang-valid_learn-l200-con31'));
    delete q.interfaces[0].result;
    assert.equal(schoolQualificationEffects([{ outcome: q.outcome, raw: q }]).results.unknown, 1);
});
