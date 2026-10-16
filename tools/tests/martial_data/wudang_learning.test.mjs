import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { wudangTeachingConditions } from './wudang_learning_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';
import { summarizeTeachingRows } from './teaching_report.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog)
    .filter(c => c.parameters.teaching_profile !== 'shaolin-luohan' && c.parameters.teaching_profile !== 'shaolin-teachers' && c.parameters.teaching_profile !== 'shaolin-recruit' && c.parameters.teaching_profile !== 'shaolin-promotion' && !['shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
const cases = all.filter(c => c.parameters.teaching_profile === 'wudang');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-wudang-learn-' + suffix));

// Synthetic records exercise the validator only, never saved as driver evidence.
function fixture(condition) {
    const p = condition.parameters, props = p.actor.properties;
    let before = { ...props, grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])),
        contribution: props.gongxian, skills: { ...p.actor.skills }, learned: {}, mappings: { ...p.actor.mappings },
        max_jingli: 0, family: props['family/family_name'], master_id: props['family/master_id'],
        master_name: props['family/master_name'],
        effective_force: Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10),
        effective_int: props.int + Math.trunc((p.actor.skills.literate ?? 0) / 10) };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before), command = e.action ?? p.action;
        after.jing -= e.jing_spent ?? 10; after.learned_points += e.learned_points_spent;
        Object.assign(after.skills, e.skills_after); Object.assign(after.learned, e.learned_after);
        if (e.grant) after.grants[e.grant] = e.value;
        for (const [id, bounds] of Object.entries(e.learning_progress ?? {}))
            after.learned[id] = (before.learned[id] ?? 0) + bounds[0];
        const step = { before, after, teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
            teacher_skills: { [p.skill]: p.teacher_level }, student: '/tests/teaching_actor#1',
            command, command_accepted: e.command_accepted ?? 1, elapsed: 0.001,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = structuredClone(after); return step;
    });
}

test('20个原NPC、275条最终技能关系、39种技能逐项采集，不等同拜师成功', () => {
    assert.equal(cases.length, 943); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5610);
    assert.equal(teachingEntries(cases).length, 20);
    for (const variant of ['level10', 'below-cap', 'at-cap'])
        assert.equal(cases.filter(c => c.parameters.variant === variant).length, 275);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 39);
    assert.equal(cases.filter(c => c.samples === 100).length, 38);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed');
        const e = c.parameters.teaching_entry;
        assert.ok(inventory.files.find(f => f.path === e.path).functions.some(f => f.name === e.function && f.line === e.line));
        assert.equal(c.parameters.actor.properties['can_learn/jiuyang-shengong/wudang'], undefined);
    }
});

test('原4401条件13800样本保持独立，新增批次不覆盖旧证据', () => {
    const old = all.filter(c => c.parameters.teaching_profile !== 'wudang');
    assert.equal(old.length, 4401); assert.equal(old.reduce((n, c) => n + c.samples, 0), 13800);
    assert.equal(all.length, 5344); assert.equal(all.reduce((n, c) => n + c.samples, 0), 19410);
});

test('最终赋值、七侠禁授、知识上限与九阳有效180/原始200边界分别保留', () => {
    assert.equal(get('shouyuan-taiji-dao-below-cap').parameters.teacher_level, 25);
    assert.equal(get('shouyuan-taiji-dao-below-cap').parameters.level, 24);
    for (const npc of ['mo', 'shan', 'song', 'xi', 'yan', 'yin', 'yu'])
        for (const id of ['taiji-shengong', 'taiji-jian', 'taiji-quan'])
            assert.equal(get(`${npc}-${id}-level10`).parameters.expected, 'refused');
    assert.equal(get('zhang-wudang-yaoli-below-cap').parameters.level, 239);
    assert.equal(get('zhang-wudang-jiuyang-level10').parameters.expected, 'refused');
    for (const level of [179, 180, 181, 199, 200, 361, 362]) {
        const p = get(`zhang-wudang-jiuyang-permit-outsider-${level}`).parameters;
        assert.equal(p.teaching_expectations.length, 2);
        assert.equal(p.teaching_expectations[1].learned_points_spent, level >= 200 ? 0 : 1);
        assert.equal(p.teaching_expectations[1].command_accepted, level >= 200 && level < 362 ? 0 : 1);
        assert.equal(p.expected, 'observed', '许可链有进展不等于最后学习成功');
    }
});

test('人工状态核对全部条件及连续询问，不冒充真实游戏记录', () => {
    for (const c of cases) {
        const steps = validateTeachingObservation(fixture(c), c);
        assert.equal(steps.some(s => s.advanced), c.parameters.expected === 'observed', c.id);
    }
});

test('不能接受伪造NPC等级、预注入许可、丢失奖励或中途重置', () => {
    function bad(suffix, change, message) {
        const c = get(suffix), steps = fixture(c); change(steps); assert.throws(() => validateTeachingObservation(steps, c), message);
    }
    bad('shouyuan-taiji-dao-level10', s => { s[0].teacher_skills['taiji-dao'] = 40; }, /真实NPC/);
    bad('zhang-wudang-jiuyang-distribution', s => { s[0].before.grants['can_learn/jiuyang-shengong/wudang'] = 1; }, /预写/);
    bad('zhang-wudang-jiuyang-distribution', s => { s[0].after.skills['martial-cognize'] = 0; }, /技能状态/);
    bad('zhang-wudang-jiuyang-distribution', s => { s[0].after.skills.sword++; }, /未声明/);
    bad('zhang-wudang-jiuyang-distribution', s => { s[1].before.jing++; }, /重置/);
    bad('zhang-taiji-jian-level10', s => { s[0].after.learned['taiji-jian'] = 0; }, /进度不在/);
    bad('zhang-taiji-jian-level10', s => { s[0].before.effective_int++; }, /识字/);
});

test('源码漂移必须重审，不能自动重算预期冒充同版本', () => {
    assert.throws(() => wudangTeachingConditions(relations, catalog,
        path => readFileSync(root + '/' + path, 'utf8') + (path.endsWith('learn.c') ? '\n' : '')), /源码变化/);
});

test('报告只按学习步骤统计进度和支出，不将询问许可混入分母', () => {
    const c = get('zhang-wudang-jiuyang-distribution'); c.samples = 1;
    const teaching = fixture(c), before = teaching[0].before, after = teaching.at(-1).after;
    const snapshot = value => ({ ...structuredClone(value), object: '/tests/teaching_actor#1',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, eff_jing: 10000 });
    const raw = { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: 'observed', elapsed: 0.01,
        before: [snapshot(before), snapshot(before)], after: [snapshot(after), snapshot(before)],
        metrics: [{ jing_cost: before.jing - after.jing }, {}], teaching };
    const report = summarizeTeachingRows({ fingerprint: 'test', identity: { conditions: [c] } },
        [{ condition_id: c.id, index: 0, outcome: 'observed', raw, raw_sha256: 'test' }]);
    const result = report.conditions[0];
    assert.equal(result.asks, 1); assert.equal(result.learns, 1); assert.equal(result.learning_steps, 1);
    assert.equal(result.command_accepted, 1);
    assert.equal(result.learning_progress_per_step.n, 1);
    assert.equal(result.learning_progress_per_step.mean, after.learned[c.parameters.skill]);
    assert.equal(result.learned_points_spent_per_step.mean, 1);
    assert.equal(result.learning_jing_spent_per_step.mean, teaching[1].before.jing - teaching[1].after.jing);
});
