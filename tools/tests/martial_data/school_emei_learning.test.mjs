import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { emeiLearningProfiles, emeiLearningConditions, emeiPracticeCosts,
    validateEmeiLearningRecord } from './school_emei_learning_cases.mjs';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { schoolPracticeEffects, schoolQualificationEffects } from './school_combat_report.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { validateSchoolCombatPlan } from './school_combat_report.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const catalog = collectCatalog(root, buildInventory(root)), cases = emeiLearningConditions(catalog);
const pick = suffix => { const c = cases.find(x => x.id === 'school-emei-learning-' + suffix); assert.ok(c, suffix); return c; };

// These synthetic records validate the collector, not the original game behavior.
function row(c) {
    const p = c.parameters, before = [p.actor, p.target].map(cfg => ({
        userp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000,
        jingli: 10000, neili: 6000, max_neili: 6000, learned_points: 0, force_attribute: 0,
        ...cfg.properties, skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        effective_skills: { force: Math.trunc((cfg.skills.force ?? 0) / 2) + (cfg.skills[cfg.mappings.force] ?? 0) },
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        learned: {}, temp: {}, weapon: cfg.equipment?.type ?? 'none',
    }));
    const r = { before, immediate: structuredClone(before), outcome: p.expected,
        reason: p.expected === 'refused' ? '原条件拒绝' : '', attacks: [], launches: [], interfaces: [], metrics: [{}, {}] };
    if (c.method === 'interface') r.interfaces.push({ ...p.interface, result: Number(p.expected === 'observed') });
    else {
        const cost = emeiPracticeCosts(p.skill, before[0].skills), a = r.immediate[0];
        a.qi -= p.completed * cost.qi; a.neili -= p.completed * cost.neili;
        a.learned[p.skill] = p.completed * practiceGain(p.level, before[0].skills[p.usage], before[0].int);
        r.command_accepted = Number(p.completed === p.repetitions && p.completed > 0);
        r.metrics[0].qi_cost = before[0].qi - a.qi; r.metrics[0].neili_cost = before[0].neili - a.neili;
    }
    return r;
}

test('峨嵋十门318条件636计划记录；当前来源与唯一ID闭合', () => {
    assert.equal(emeiLearningProfiles.length, 10); assert.equal(cases.length, 318);
    assert.equal(cases.filter(c => c.method === 'interface').length, 144);
    assert.equal(cases.filter(c => c.method === 'practice').length, 174);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 91);
    assert.equal(cases.reduce((s, c) => s + c.samples, 0), 636);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(emeiLearningConditions(catalog, { smoke: true }).reduce((s, c) => s + c.samples, 0), 318);
    const teacher = readFileSync(join(root, 'kungfu/class/emei/miejue.c'), 'utf8');
    for (const d of emeiLearningProfiles) assert.ok(teacher.includes(`set_skill("${d.skill}"`), d.skill);
    for (const c of cases) {
        for (const p of c.parameters.qualification_sources) assert.ok(existsSync(join(root, p)), p);
        assert.ok(c.parameters.actor.properties.neili <= c.parameters.actor.properties.max_neili, c.id);
        validateEmeiLearningRecord(row(c), c);
    }
    assert.throws(() => emeiLearningConditions({ skills: [] }));
    assert.throws(() => emeiPracticeCosts('not-a-skill', {}));
});

test('峨嵋学习条件接入既有注册与校验，烟雾和正式样本量独立', () => {
    const selected = schoolCombatConditions(catalog).filter(c => c.parameters.collection_group === 'emei-learning');
    assert.deepEqual(selected, cases); validateSchoolCombatPlan(selected, catalog);
    const smoke = schoolCombatConditions(catalog, { smoke: true }).filter(c => c.parameters.collection_group === 'emei-learning');
    assert.deepEqual(smoke, emeiLearningConditions(catalog, { smoke: true }));
    for (const c of selected) validateSchoolCombatRecord(row(c), c);
});

test('保留原驱动未设属性的null编码，缺失和异常值仍拒绝，已配置字段须相符', () => {
    for (const c of [pick('emei-jian-practice-l200'), pick('zhutian-bu-valid_learn-l200')]) {
        const r = row(c);
        for (const states of [r.before, r.immediate]) {
            for (const s of states) { s.learned_points = null; s.force_attribute = null; }
            states[1].jingli = null;
        }
        validateEmeiLearningRecord(r, c);
        for (const change of [x => { delete x.before[1].jingli; }, x => { delete x.before[0].force_attribute; },
            x => { x.before[1].learned_points = 'unknown'; }, x => { x.before[0].jingli = null; },
            x => { x.immediate[0].force_attribute = 0; }]) {
            const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiLearningRecord(bad, c));
        }
    }
});

test('学习资格不扣费；缺失观测、伪造身份、假进度或静默改映射均拒绝', () => {
    const c = pick('piaoxue-zhang-valid_learn-l200-con27'), r = row(c);
    r.immediate[0].temp.notify_fail = '根骨不足'; validateEmeiLearningRecord(r, c);
    for (const change of [x => { x.immediate[0].neili--; }, x => { x.before[0].userp = 0; },
        x => { delete x.before[1].jingli; }, x => { delete x.interfaces[0].result; },
        x => { x.interfaces[0].object = '/kungfu/skill/sixiang-zhang'; },
        x => { x.immediate[1].qi--; }, x => { x.launches.push({}); }]) {
        const bad = structuredClone(r); change(bad); assert.throws(() => validateEmeiLearningRecord(bad, c));
    }
    const p = pick('emei-jian-practice-l200-low-qi');
    for (const change of [x => { x.immediate[0].learned['emei-jian'] = 1; },
        x => { x.immediate[0].mappings.sword = 'huifeng-jian'; },
        x => { x.immediate[0].learned['linji-zhuang'] = 5; },
        x => { x.immediate[0].force_attribute = 1; }]) {
        const bad = row(p); change(bad); assert.throws(() => validateEmeiLearningRecord(bad, p));
    }
});

test('回风倚天保留半级有效值，学习与practice的基本功门槛不混同', () => {
    for (const skill of ['huifeng-jian', 'yitian-jian']) {
        assert.equal(pick(`${skill}-valid_learn-l200-basic199`).parameters.expected, 'observed');
        assert.equal(pick(`${skill}-valid_learn-l400-half-level-basic199`).parameters.expected, 'refused');
        assert.equal(pick(`${skill}-valid_learn-l400-half-level-basic200`).parameters.expected, 'observed');
        assert.equal(pick(`${skill}-practice-l200-equal-basic`).parameters.expected, 'refused');
    }
    const raw = pick('huifeng-jian-valid_learn-l200-force99').parameters;
    assert.equal(raw.actor.skills.force, 99); assert.equal(raw.actor.mappings.force, 'linji-zhuang');
    const effective = pick('emei-jian-valid_learn-l200-force20').parameters;
    assert.equal(effective.actor.skills.force, 40); assert.equal(effective.actor.mappings.force, undefined);
    const c = pick('emei-jian-valid_learn-l200-force20'), r = row(c);
    r.before[0].effective_skills.force = 40; assert.throws(() => validateEmeiLearningRecord(r, c));
});

test('飘雪保留四象等级交叉读取，不按本技能800级擅自提高费用或资格', () => {
    for (const sixiang of [0, 99, 100, 201, 202]) {
        const c = pick(`piaoxue-zhang-practice-l200-sixiang${sixiang}`), r = row(c);
        assert.equal(c.parameters.expected, sixiang > 201 ? 'refused' : 'observed');
        const expected = sixiang > 201 ? [0, 0] : sixiang < 100 ? [60, 80] : [80, 100];
        assert.deepEqual([r.metrics[0].qi_cost, r.metrics[0].neili_cost], expected);
        validateEmeiLearningRecord(r, c);
    }
    assert.deepEqual(emeiPracticeCosts('piaoxue-zhang', { 'piaoxue-zhang': 800 }), { qi: 60, neili: 80 });
    assert.equal(pick('piaoxue-zhang-valid_learn-l800-own800-sixiang200-basic201').parameters.expected, 'observed');
    assert.equal(pick('piaoxue-zhang-practice-l800-own800-sixiang200-basic201').parameters.expected, 'refused');
    const c = pick('piaoxue-zhang-practice-l200-sixiang99'), bad = row(c);
    bad.immediate[0].neili -= 20; assert.throws(() => validateEmeiLearningRecord(bad, c));
});

test('金顶与四象练习费用在本技能100级分段，50次仍不升级', () => {
    for (const [skill, costs] of [['jinding-zhang', [30, 45]], ['sixiang-zhang', [20, 30]]])
        for (const [i, level] of [99, 100].entries()) {
            const c = pick(`${skill}-practice-l${level}-fee-boundary`), r = row(c);
            assert.equal(r.metrics[0].qi_cost, costs[i]); validateEmeiLearningRecord(r, c);
        }
    for (const d of emeiLearningProfiles) {
        const c = pick(`${d.skill}-practice-l200-times50`), r = row(c);
        assert.equal(r.immediate[0].learned[d.skill], 600);
        assert.equal(r.immediate[0].skills[d.skill], 200);
        assert.equal(r.command_accepted, 1); validateEmeiLearningRecord(r, c);
    }
});

test('持器、招架练习及轻功规则分别保留，不假设所有技能都要求空手', () => {
    for (const d of emeiLearningProfiles) {
        if (['sword', 'blade'].includes(d.usage)) {
            assert.equal(pick(`${d.skill}-valid_learn-l200-weapon-none`).parameters.expected, 'observed');
            assert.equal(pick(`${d.skill}-practice-l200-weapon-none`).parameters.expected, 'refused');
        } else assert.equal(pick(`${d.skill}-practice-l200-armed`).parameters.expected,
            d.usage === 'dodge' ? 'observed' : 'refused');
        assert.equal(pick(`${d.skill}-valid_learn-l200-male`).parameters.expected, 'observed');
        assert.equal(pick(`${d.skill}-valid_learn-l200-other-family`).parameters.expected, 'observed');
        if (d.usage !== 'dodge') {
            const p = pick(`${d.skill}-practice-l400-parry`).parameters;
            assert.equal(p.action, 'practice parry 1'); assert.equal(p.actor.skills[d.usage], 401);
            assert.equal(p.actor.skills.parry, 401);
        }
    }
    const p = pick('zhutian-bu-practice-l200-zero-neili'), r = row(p);
    assert.equal(r.immediate[0].neili, 0); assert.equal(r.metrics[0].qi_cost, 40);
    validateEmeiLearningRecord(r, p);
});

test('部分完成与完全拒绝单独计量，未知接口值不伪造为零', () => {
    for (const suffix of ['partial-qi', 'partial-neili', 'partial-qi-sixiang100', 'partial-neili-sixiang100']) {
        const c = pick('piaoxue-zhang-practice-l200-' + suffix), r = row(c);
        assert.equal(r.command_accepted, 0); assert.equal(r.outcome, 'observed');
        const report = schoolPracticeEffects([{ outcome: r.outcome, raw: r }], 'piaoxue-zhang');
        assert.equal(report.partial_progress, 1); assert.equal(report.progress.mean, 24);
        assert.equal(report.neili_cost.mean, suffix.endsWith('sixiang100') ? 200 : 160);
        validateEmeiLearningRecord(r, c);
    }
    const q = row(pick('emei-jian-valid_learn-l200-basic199'));
    delete q.interfaces[0].result;
    assert.equal(schoolQualificationEffects([{ outcome: q.outcome, raw: q }]).results.unknown, 1);
    for (const suffix of ['busy', 'fighting', 'unmapped', 'no-learn', 'low-exp', 'zero-skill', 'zero-basic', 'times0', 'times51']) {
        const c = pick('emei-jian-practice-l200-' + suffix), r = row(c);
        assert.equal(r.command_accepted, 0); assert.equal(r.metrics[0].qi_cost, 0);
        validateEmeiLearningRecord(r, c);
    }
});
