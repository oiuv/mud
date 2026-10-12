import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { shaolinTeachingConditions } from './shaolin_learning_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';
import { summarizeTeachingRows } from './teaching_report.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-luohan');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-shaolin-luohan-' + suffix));

// Reader tests only: synthetic observations are never driver evidence.
function fixture(condition) {
    const p = condition.parameters, props = p.actor.properties;
    const before = { ...props, grants: {}, contribution: props.gongxian,
        skills: { ...p.actor.skills }, learned: {}, mappings: { ...p.actor.mappings }, max_jingli: 0,
        family: props['family/family_name'], master_id: props['family/master_id'], master_name: props['family/master_name'],
        effective_force: Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2) - Number(Boolean(p.actor.equipment)),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10),
        effective_int: props.int + Math.trunc((p.actor.skills.literate ?? 0) / 10) };
    const e = p.teaching_expectations[0], after = structuredClone(before);
    after.jing -= e.jing_spent; after.learned_points += e.learned_points_spent;
    for (const [skill, bounds] of Object.entries(e.learning_progress)) after.learned[skill] = bounds[0];
    return [{ before, after, teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
        teacher_skills: { [p.skill]: p.teacher_level }, student: '/tests/teaching_actor#1',
        command: p.action, command_accepted: e.command_accepted, elapsed: 0.001,
        messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' }];
}

test('十八罗汉208条技能关系三点闭合，57项随机分布不冒充63名NPC完成', () => {
    assert.equal(cases.length, 749); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 7084);
    assert.equal(teachingEntries(cases).length, 18);
    assert.equal(relations.objects.filter(t => t.group === 'shaolin').length, 63);
    for (const variant of ['level10', 'below-cap', 'at-cap'])
        assert.equal(cases.filter(c => c.parameters.variant === variant).length, 208);
    assert.equal(cases.filter(c => c.samples === 100).length, 57);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 57);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed');
        assert.deepEqual(c.parameters.monitored_grants, []);
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => /^(can_|reborn)/.test(k)));
        assert.ok(c.parameters.qualification_evidence.every(e => e.sha256 === sha256(readFileSync(e.path))));
        validateTeachingObservation(fixture(c), c);
    }
});

test('既有5344条件19410样本内容哈希不变', () => {
    const old = all.filter(c => c.parameters.teaching_profile !== 'shaolin-luohan' && c.parameters.teaching_profile !== 'shaolin-teachers' && c.parameters.teaching_profile !== 'shaolin-recruit' && c.parameters.teaching_profile !== 'shaolin-promotion' && !['shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers'].includes(c.parameters.teaching_profile));
    assert.equal(old.length, 5344); assert.equal(old.reduce((n, c) => n + c.samples, 0), 19410);
    assert.equal(sha256(JSON.stringify(old)), '9a4280134434a9ffb42417dbaab7180f1b1ee93f6e1eb6546229367b475523e7');
});

test('源码改变须复核，不静默沿用旧门槛', () => {
    assert.throws(() => shaolinTeachingConditions(relations, catalog, path => readFileSync(path, 'utf8')
        + (path.endsWith('/cheng.h') ? '\n// changed' : '')), /源码变化/);
});

test('教师上限、师承不符、部分学习和资源账分别核验', () => {
    for (const suffix of ['cheng-shang-damo-jian-at-cap', 'cheng-guan-force-other-master',
        'cheng-shang-buddhism-partial', 'cheng-zhi2-qingyun-bian-no-weapon']) {
        const c = get(suffix), steps = fixture(c);
        assert.ok(validateTeachingObservation(steps, c));
        steps[0].after.learned_points++;
        assert.throws(() => validateTeachingObservation(steps, c));
    }
    const c = get('cheng-guan-force-level10');
    for (const mutate of [s => s.teacher_skills.force++, s => s.after.neili--,
        s => s.after.skills.force++, s => s.after.learned.force = 99999,
        s => s.before.master_id = '假师父']) {
        const steps = fixture(c); mutate(steps[0]);
        assert.throws(() => validateTeachingObservation(steps, c));
    }
});

test('报告保留学习分布，受理但无进展不能变成学会', () => {
    const c = get('cheng-shang-buddhism-jing4'); c.samples = 1;
    const teaching = fixture(c), before = teaching[0].before, after = teaching[0].after;
    const snapshot = value => ({ ...structuredClone(value), object: '/tests/teaching_actor#1',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, qi: 10000, eff_qi: 10000, eff_jing: 10000 });
    const raw = { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: 'refused', elapsed: 0.01,
        reason: '精神不足', launches: [], before: [snapshot(before), snapshot(before)],
        after: [snapshot(after), snapshot(before)], metrics: [{ jing_cost: before.jing - after.jing }, {}], teaching };
    const result = summarizeTeachingRows({ fingerprint: 'test', identity: { conditions: [c] } },
        [{ condition_id: c.id, index: 0, raw, outcome: 'refused', raw_sha256: 'test' }]);
    assert.equal(result.conditions[0].command_accepted, 1);
    assert.equal(result.conditions[0].learning_progress_per_step.max, 0);
});
