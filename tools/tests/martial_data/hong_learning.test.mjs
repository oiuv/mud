import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingObservation, validateTeachingRecord } from './teaching_observation.mjs';
import { dragonSubskills } from './hong_learning_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile))
    .filter(c => !['honghua', 'mingjiao', 'duan', 'tianlongsi', 'xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => c.parameters.teaching_kind === 'ordinary_learning');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-hong-learn-' + suffix));

// Artificial observations only test the validator; not driver evidence.
function fixture(suffix) {
    const condition = get(suffix), p = condition.parameters, properties = p.actor.properties;
    let before = { grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])),
        contribution: properties.gongxian, jing: 10000, neili: properties.neili,
        max_neili: properties.max_neili, max_jingli: 0, potential: properties.potential,
        learned_points: 0, skills: { ...p.actor.skills }, learned: {}, mappings: {},
        effective_force: Math.trunc(p.actor.skills.force / 2), effective_dodge: 0,
        dex: properties.dex, effective_dex: properties.dex, str: properties.str,
        con: properties.con, int: properties.int, effective_int: properties.int,
        character: properties.character, shen: properties.shen,
        family: properties['family/family_name'], master_id: properties['family/master_id'],
        master_name: properties['family/master_name'], beggarlvl: properties['family/beggarlvl'] };
    const steps = p.teaching_expectations.map(expected => {
        const after = structuredClone(before);
        after.grants[expected.grant] = expected.value;
        Object.assign(after.skills, expected.skills_after);
        Object.assign(after.learned, expected.learned_after);
        for (const [skill, [minimum]] of Object.entries(expected.learning_progress)) {
            after.learned[skill] = (before.learned[skill] ?? 0) + minimum;
        }
        after.jing -= expected.jing_spent; after.learned_points += expected.learned_points_spent;
        const step = { teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
            student: '/tests/teaching_actor#1', command: p.action,
            command_accepted: expected.command_accepted, elapsed: 0.001, before, after,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = after; return step;
    });
    return { condition, steps };
}

test('普通学习独立追加 26 条条件，不改变 1236 条询问/交书历史范围', () => {
    assert.equal(cases.length, 26); assert.equal(all.length, 1262);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 10);
    assert.equal(teachingEntries(cases).length, 2);
    assert.equal(teachingEntries(all).length, 144);
    for (const c of cases) {
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.match(c.parameters.action, /^learn hong qigong (dagou-bang|xianglong-zhang) 1$/);
        assert.ok(c.parameters.qualification_sources.includes('cmds/skill/learn.c'));
        assert.ok(!Object.keys(c.parameters.actor.properties).some(k => k.startsWith('can_')));
        const entry = c.parameters.teaching_entry;
        assert.ok(inventory.files.find(f => f.path === entry.path).functions
            .some(f => f.name === entry.function && f.line === entry.line));
    }
});

test('原门槛区分丐帮袋数、侠义、有效内功和先天资质；不预写许可', () => {
    assert.equal(get('db-rank-low').parameters.actor.properties['family/beggarlvl'], 6);
    assert.equal(get('ds-rank-low').parameters.actor.properties['family/beggarlvl'], 8);
    assert.equal(get('ds-force-low').parameters.actor.skills.force, 599);
    assert.equal(get('ds-success').parameters.actor.skills.force, 600);
    assert.equal(get('db-dex-low').parameters.actor.properties.dex, 25);
    const partial = get('db-max-neili-low').parameters;
    assert.equal(partial.expected, 'observed');
    assert.equal(partial.teaching_expectations[0].value, 1);
    assert.equal(partial.teaching_expectations[0].command_accepted, 0);
    assert.equal(partial.teaching_expectations[0].learned_points_spent, 0);
});

test('十八路补到 10 级、已有高等级不回退，重复不重置或补写主技能', () => {
    assert.equal(dragonSubskills.length, 18);
    const skills = get('ds-success').parameters.teaching_expectations[0].skills_after;
    assert.equal(Object.keys(skills).length, 18); assert.ok(Object.values(skills).every(v => v === 10));
    assert.ok(!Object.hasOwn(skills, 'xianglong-zhang'));
    assert.equal(get('ds-partial-existing').parameters.teaching_expectations[0].skills_after[dragonSubskills[0]], 20);
    assert.equal(get('ds-repeat').parameters.teaching_expectations.length, 2);
});

test('人工记录逐项检查实际学习和许可的不同进展，不当作真实测试证据', () => {
    for (const c of cases) {
        const { condition, steps } = fixture(c.id.slice('teaching-hong-learn-'.length));
        const rows = validateTeachingObservation(steps, condition);
        assert.equal(rows.some(r => r.advanced), condition.parameters.expected === 'observed');
    }
    const partial = fixture('db-max-neili-low');
    const [row] = validateTeachingObservation(partial.steps, partial.condition);
    assert.equal(row.permission_advanced, true); assert.equal(row.skill_advanced, false);
    const repeat = fixture('ds-repeat');
    const rows = validateTeachingObservation(repeat.steps, repeat.condition);
    assert.equal(rows[0].skill_advanced, true); assert.equal(rows[0].acquired, false);
    assert.equal(rows[1].advanced, false);
});

test('缺分招、伪造进度或消耗、额外技能、换人重置均拒绝', () => {
    const bad = (suffix, change, match) => {
        const { condition, steps } = fixture(suffix); change(steps, condition);
        assert.throws(() => validateTeachingObservation(steps, condition), match);
    };
    bad('ds-success', s => delete s[0].after.skills[dragonSubskills[0]], /技能状态不符/);
    bad('ds-success', s => { s[0].after.skills['xianglong-zhang'] = 10; }, /未声明技能/);
    bad('db-success', s => { s[0].after.learned['dagou-bang'] = 0; }, /进度不在/);
    bad('db-success', s => { s[0].after.learned_points = 0; }, /学习点支出/);
    bad('db-success', s => { s[0].after.jing++; }, /精神扣除/);
    bad('db-max-neili-low', s => { s[0].command_accepted = 1; }, /受理状态/);
    bad('ds-repeat', s => { s[1].student = '/tests/teaching_actor#3'; }, /换了学生/);
});

test('零消耗的真实稀疏计数按零核验，整个观察缺失不能填零', () => {
    const { condition, steps } = fixture('ds-success');
    const sample = { kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: 'observed',
        teaching: steps, before: [{ ...steps[0].before, object: steps[0].student }],
        after: [{ ...steps[0].after, object: steps[0].student }], metrics: [{}] };
    validateTeachingRecord(sample, condition);
    sample.metrics[0].jing_cost = 1;
    assert.throws(() => validateTeachingRecord(sample, condition), /公共资源账/);
    sample.metrics[0].jing_cost = null;
    assert.throws(() => validateTeachingRecord(sample, condition), /公共资源账/);
    delete sample.metrics;
    assert.throws(() => validateTeachingRecord(sample, condition), /公共资源观察缺失/);
});
