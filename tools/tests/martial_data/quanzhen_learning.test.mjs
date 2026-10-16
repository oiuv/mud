import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { quanzhenLearningConditions } from './quanzhen_learning_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog)
    .filter(c => !['wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
const cases = all.filter(c => c.parameters.teaching_profile === 'quanzhen');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-quanzhen-learn-' + suffix));

// Synthetic state validates only the reader. It is never written as driver evidence.
function fixture(condition) {
    const p = condition.parameters, props = p.actor.properties;
    const before = { ...props, grants: {}, contribution: props.gongxian,
        skills: { ...p.actor.skills }, learned: {}, mappings: { ...p.actor.mappings },
        max_jingli: 0, family: props['family/family_name'], master_id: props['family/master_id'],
        master_name: props['family/master_name'],
        effective_force: Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2) - Number(p.actor.equipment?.type === 'whip'),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10),
        effective_int: props.int + Math.trunc((p.actor.skills.literate ?? 0) / 10) };
    const e = p.teaching_expectations[0], after = structuredClone(before);
    after.jing -= e.jing_spent; after.learned_points += e.learned_points_spent;
    for (const [id, bounds] of Object.entries(e.learning_progress)) after.learned[id] = bounds[0];
    return [{ before, after, teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
        teacher_skills: { [p.skill]: p.teacher_level }, student: '/tests/teaching_actor#1',
        command: p.action, command_accepted: e.command_accepted, elapsed: 0.001,
        messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' }];
}

test('22个NPC、358条初始技能关系分别尝试，不把NPC自用等同于传授', () => {
    assert.equal(cases.length, 1179);
    assert.equal(cases.reduce((n, c) => n + c.samples, 0), 5102);
    assert.equal(teachingEntries(cases).length, 22);
    for (const variant of ['level10', 'below-cap', 'at-cap'])
        assert.equal(cases.filter(c => c.parameters.variant === variant).length, 358);
    assert.equal(cases.filter(c => c.samples === 100).length, 28);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 32);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    for (const c of cases) {
        const p = c.parameters, e = p.teaching_entry;
        assert.equal(c.status, 'configured_not_executed');
        assert.ok(inventory.files.find(f => f.path === e.path).functions
            .some(f => f.name === e.function && f.line === e.line));
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        assert.deepEqual(p.monitored_grants, []);
    }
});

test('原3222条件8698样本保持独立，新普通学习不改变旧教学批次', () => {
    const old = all.filter(c => c.parameters.teaching_profile !== 'quanzhen');
    assert.equal(old.length, 3222); assert.equal(old.reduce((n, c) => n + c.samples, 0), 8698);
    assert.equal(all.length, 4401); assert.equal(all.reduce((n, c) => n + c.samples, 0), 13800);
});

test('禁授、知识类上限、师承与纯属性资格保留原含义', () => {
    assert.equal(get('wang-yiyang-zhi-level10').parameters.expected, 'refused');
    for (const skill of ['xiantian-gong', 'yijin-duangu', 'shexing-lifan'])
        assert.equal(get(`zhou-${skill}-level10`).parameters.expected, 'refused');
    assert.equal(get('wang-xiantian-gong-level10').parameters.expected, 'observed');
    assert.equal(get('wang-taoism-below-cap').parameters.level, 399);
    assert.equal(get('wang-force-below-cap').parameters.level, 199);
    assert.equal(get('wang-force-at-cap').parameters.teaching_expectations[0].command_accepted, 1);
    assert.equal(get('zhou-force-other-master').parameters.teaching_expectations[0].command_accepted, 1);
    assert.equal(get('wang-force-other-master').parameters.teaching_expectations[0].command_accepted, 0);
    assert.equal(get('zhou-zuoyou-hubo-count1').parameters.expected, 'refused');
    assert.equal(get('zhou-zuoyou-hubo-mathematics1').parameters.expected, 'observed');
});

test('人工记录覆盖每个条件，只检验读数契约而非实际游戏成功', () => {
    for (const c of cases) {
        const [step] = validateTeachingObservation(fixture(c), c);
        assert.equal(step.advanced, c.parameters.expected === 'observed', c.id);
        assert.equal(step.acquired, false); assert.equal(step.permission_advanced, false);
    }
});

test('实际老师等级、识字悟性、进度和资源不允许误报', () => {
    function bad(suffix, change, message) {
        const c = get(suffix), steps = fixture(c); change(steps[0]);
        assert.throws(() => validateTeachingObservation(steps, c), message);
    }
    bad('wang-quanzhen-jian-level10', s => { s.teacher_skills['quanzhen-jian']--; }, /真实NPC/);
    bad('wang-literate-level10', s => { s.before.effective_int--; }, /识字/);
    bad('wang-quanzhen-jian-level10', s => { s.after.learned['quanzhen-jian'] = 0; }, /进度不在/);
    bad('wang-quanzhen-jian-level10', s => { s.after.neili--; }, /不扣内力/);
    bad('wang-quanzhen-jian-partial', s => { s.after.jing = 3; }, /精神扣除/);
    bad('wang-force-at-cap', s => { s.command_accepted = 0; }, /受理状态/);
    bad('wang-tiangang-chenfa-level10', s => { s.before.effective_dodge++; }, /有效轻功/);
});

test('固定源码变动要重审，不静默复用旧条件', () => {
    assert.throws(() => quanzhenLearningConditions(relations, catalog,
        path => readFileSync(root + '/' + path, 'utf8') + (path.endsWith('learn.c') ? '\n' : '')), /源码变化/);
});
