import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { emeiTeachersConditions } from './emei_teachers_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';
import { summarizeTeachingRows } from './teaching_report.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'emei-teachers');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-emei-learn-' + suffix));

// Synthetic state tests exercise the collector only, not original LPC behavior.
function fixture(c) {
    const p = c.parameters, props = p.actor.properties, expected = p.teaching_expectations[0];
    const before = { ...props, grants: {}, contribution: props.gongxian, skills: { ...p.actor.skills },
        learned: {}, mappings: { ...p.actor.mappings }, max_jingli: 0,
        family: props['family/family_name'], master_id: props['family/master_id'], master_name: props['family/master_name'],
        effective_force: Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10),
        effective_int: props.int + Math.trunc(p.actor.skills.literate / 10) };
    const after = structuredClone(before);
    after.jing -= expected.jing_spent; after.learned_points += expected.learned_points_spent;
    for (const [s, bounds] of Object.entries(expected.learning_progress)) after.learned[s] = bounds[0];
    return [{ before, after, teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
        teacher_skills: { [p.skill]: p.teacher_level }, student: '/tests/teaching_actor#1',
        command: p.action, command_accepted: expected.command_accepted, elapsed: 0.001,
        messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' }];
}

test('峨嵋28个NPC466关系33技能闭合，1497条件5836记录且旧9369条件不变', () => {
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 28);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 33);
    for (const variant of ['level10', 'below-cap', 'at-cap'])
        assert.equal(cases.filter(c => c.parameters.variant === variant).length, 466);
    assert.equal(cases.length, 1497); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5836);
    assert.equal(cases.filter(c => c.samples === 100).length, 29);
    assert.equal(new Set(all.map(c => c.id)).size, all.length);
    const prior = all.filter(c => !['emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length, 9369); assert.equal(prior.reduce((n, c) => n + c.samples, 0), 41568);
    assert.equal(sha256(JSON.stringify(prior)), 'dc9b2387aaf1b957d958d1784d5e99caa858bbdc5e27f7f2a901a59cd502b476');
    for (const c of cases) validateTeachingObservation(fixture(c), c);
});

test('禁授、师承不符、修养不可直接学与等级上限分别保留', () => {
    for (const suffix of ['miejue-emei-jiuyang-level10', 'fengling-emei-jiuyang-level10',
        'he-linji-zhuang-level10', 'zhou-linji-zhuang-level10', 'zhou-yinlong-bian-level10',
        'zhou-yijin-duangu-level10', 'zhou-cuixin-zhang-level10', 'zhou-jiuyin-baiguzhao-level10',
        'zhou-shexing-lifan-level10', 'miejue-force-other-master', 'miejue-force-other-name',
        'guoxiang-martial-cognize-level10', 'miejue-force-at-cap']) {
        assert.equal(get(suffix).parameters.expected, 'refused', suffix);
    }
    assert.equal(get('guoxiang-emei-jiuyang-level10').parameters.expected, 'observed');
    assert.equal(get('guoxiang-emei-jiuyang-below-cap').parameters.level, 199);
    assert.equal(get('guoxiang-mahayana-below-cap').parameters.level, 299);
    for (const c of cases) {
        assert.deepEqual(c.parameters.monitored_grants, []);
        assert.match(c.parameters.note, /不证明可拜师/);
        assert.match(c.parameters.note, /郭襄明确拒收徒/);
    }
});

test('正常、资源不足与多次授课保留实际费用和学习进度', () => {
    for (const skill of ['emei-jian', 'mahayana']) {
        const partial = get(`miejue-${skill}-partial3`), e = partial.parameters.teaching_expectations[0];
        assert.equal(e.jing_spent, 17); assert.equal(e.learned_points_spent, 2);
        assert.equal(partial.parameters.expected, 'observed');
        const rows = fixture(partial); validateTeachingObservation(rows, partial);
        rows[0].after.learned_points++; assert.throws(() => validateTeachingObservation(rows, partial));
        assert.equal(get(`miejue-${skill}-times50`).parameters.teaching_expectations[0].learned_points_spent, 50);
        assert.equal(get(`miejue-${skill}-potential0`).parameters.expected, 'refused');
    }
    assert.equal(get('miejue-emei-jian-exp0').parameters.expected, 'refused');
    assert.equal(get('miejue-mahayana-exp0').parameters.expected, 'observed');
});

test('资格拒绝不预写成功，学习不得改变不相干状态', () => {
    const rows = cases.filter(c => c.parameters.variant.startsWith('qualification'));
    assert.equal(rows.length, 6);
    for (const c of rows) { assert.equal(c.parameters.expected, 'refused'); validateTeachingObservation(fixture(c), c); }
    // Distribution teacher is chosen from the actual highest declaration.
    const sample = cases.find(c => c.parameters.variant === 'distribution');
    for (const mutate of [r => r.before.master_id = 'forged', r => r.after.skills.force++,
        r => r.after.neili--, r => r.teacher_skills[sample.parameters.skill]++,
        r => delete r.after.learned, r => r.after.learned.unarmed = 1]) {
        const record = fixture(sample); mutate(record[0]); assert.throws(() => validateTeachingObservation(record, sample));
    }
});

test('来源改变或教师范围不完整不得继续生成旧条件', () => {
    const read = path => readFileSync(root + '/' + path, 'utf8');
    assert.throws(() => emeiTeachersConditions(relations, catalog, path => read(path)
        + (path === 'kungfu/class/emei/zhou.c' ? '\n// changed\n' : '')));
    assert.throws(() => emeiTeachersConditions({ ...relations,
        objects: relations.objects.filter(t => t.path !== 'kungfu/class/emei/bei.c') }, catalog, read));
    assert.ok(read('tools/tests/martial_data/execution.mjs').includes("'emei_teachers_cases'"));
});

test('峨嵋普通学习报告保留原等级、精神、潜能及进度，不能只报授课受理', () => {
    const c = get('miejue-emei-jian-times50');
    c.samples = 1;
    const teaching = fixture(c), step = teaching[0];
    const snapshot = state => ({ ...structuredClone(state), object: step.student,
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, qi: 1000, eff_qi: 1000, eff_jing: 10000 });
    const raw = { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: 'observed', elapsed: 0.01,
        before: [snapshot(step.before), snapshot(step.before)],
        after: [snapshot(step.after), snapshot(step.before)],
        metrics: [{ jing_cost: 400 }, {}], teaching };
    const report = summarizeTeachingRows({ fingerprint: 'synthetic', identity: { conditions: [c] } },
        [{ condition_id: c.id, index: 0, outcome: 'observed', raw, raw_sha256: 'synthetic' }]);
    const row = report.conditions[0];
    assert.equal(row.skill, 'emei-jian'); assert.equal(row.level, 100); assert.equal(row.teacher_level, 260);
    assert.equal(row.command_accepted, 1); assert.equal(row.learning_steps, 1);
    assert.equal(row.learned_points_spent_per_step.mean, 50);
    assert.equal(row.learning_progress_per_step.mean, 150);
    assert.equal(row.jing_spent_per_step.mean, 400);
});
