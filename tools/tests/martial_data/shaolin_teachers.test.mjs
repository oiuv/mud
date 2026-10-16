import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions } from './teaching_cases.mjs';
import { shaolinTeachersConditions } from './shaolin_teachers_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), all = teachingConditions(relations, catalog);
const cases = all.filter(c => c.parameters.teaching_profile === 'shaolin-teachers');
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-shaolin-teachers-' + suffix));

// Synthetic reader contracts only, never used as source or driver evidence.
function fixture(c) {
    const p = c.parameters, props = p.actor.properties;
    let before = { ...props, grants: Object.fromEntries(p.monitored_grants.map(k => [k, 0])),
        contribution: props.gongxian, skills: { ...p.actor.skills }, learned: {},
        mappings: { ...p.actor.mappings }, max_jingli: 0, shaolin_flags: { wuming: 0, kongjian: 0 },
        family: props['family/family_name'], master_id: props['family/master_id'], master_name: props['family/master_name'],
        effective_force: Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2) - Number(Boolean(p.actor.equipment)),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10),
        effective_int: props.int + Math.trunc((p.actor.skills.literate ?? 0) / 10) };
    return p.teaching_expectations.map(e => {
        const after = structuredClone(before);
        if (e.grant) after.grants[e.grant] = e.value;
        Object.assign(after.skills, e.skills_after); Object.assign(after.learned, e.learned_after);
        after.jing -= e.jing_spent ?? 0; after.learned_points += e.learned_points_spent;
        after.shaolin_flags = { ...e.shaolin_flags };
        for (const [s, bounds] of Object.entries(e.learning_progress ?? {})) after.learned[s] = (after.learned[s] ?? 0) + bounds[0];
        const row = { before, after, teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
            teacher_skills: { [p.skill]: p.teacher_level }, student: '/tests/teaching_actor#1',
            command: e.action ?? p.action, command_accepted: e.command_accepted ?? 1, elapsed: 0.001,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript',
            ...(e.offer ? { offered_item: { object: e.offer.path, program: e.offer.path, clone: 0,
                holder_before: '/tests/teaching_actor#1', exists_after: 0, holder_after: '' } } : {}) };
        before = structuredClone(after);
        return row;
    });
}

test('45教师722关系90技能闭合，旧6093条件不变', () => {
    assert.equal(new Set(cases.map(c => c.parameters.teacher.path)).size, 45);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 90);
    for (const v of ['level10', 'below-cap', 'at-cap']) assert.equal(cases.filter(c => c.parameters.variant === v).length, 722);
    assert.equal(cases.length, 2356);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    const prior = all.filter(c => c.parameters.teaching_profile !== 'shaolin-teachers' && c.parameters.teaching_profile !== 'shaolin-recruit' && c.parameters.teaching_profile !== 'shaolin-promotion' && !['shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile));
    assert.equal(prior.length, 6093);
    assert.equal(sha256(JSON.stringify(prior)), 'be56bb6ef2eab38c5f054dfe72e08ec5faf3d8325df7deaafe5c2ecbad916a64');
    for (const c of cases) validateTeachingObservation(fixture(c), c);
});

test('不假设三位特殊教师已收徒，不将自用或禁授技能当成传授', () => {
    for (const name of ['wuming', 'kong-jian', 'jue-yuan']) {
        for (const c of cases.filter(c => c.parameters.teacher.path.endsWith('/' + name))) {
            assert.equal(c.parameters.actor.properties['family/master_id'], 'other master');
            assert.ok(!c.parameters.actor.properties['can_learn/jiuyang-shengong/shaolin']);
        }
    }
    for (const suffix of ['du-e-shaolin-jiuyang-level10', 'du-jie-shaolin-jiuyang-level10',
        'du-nan-shaolin-jiuyang-level10', 'jue-yuan-jiuyang-shengong-level10',
        'wuming-buddhism-level10', 'kong-jian-force-level10']) {
        assert.equal(get(suffix).parameters.expected, 'refused');
    }
    assert.equal(get('wuming-strike-below-cap').parameters.level, 179);
    assert.equal(get('wuming-rulai-zhang-below-cap').parameters.level, 299);
    assert.equal(get('da-mo-sword-below-cap').parameters.level, 199);
});

test('真实认可、交书、重复授课及许可与技能进展分别核验', () => {
    for (const suffix of ['wuming-rulai-zhang-recognize-repeat', 'kong-jian-jingang-buhuaiti-recognize-repeat',
        'jue-yuan-shaolin-jiuyang-offer-repeat', 'jue-yuan-shaolin-jiuyang-no-kunlun',
        'jue-yuan-force-permit-not-this-skill']) {
        const c = get(suffix), rows = fixture(c);
        validateTeachingObservation(rows, c);
        rows.at(-1).after.learned_points++;
        assert.throws(() => validateTeachingObservation(rows, c));
    }
    const c = get('jue-yuan-shaolin-jiuyang-at-cap');
    const summaries = validateTeachingObservation(fixture(c), c);
    assert.equal(summaries[0].advanced, true); assert.equal(summaries[1].skill_advanced, false);
    for (const mutate of [s => s.before.shaolin_flags.wuming = 1,
        s => s.after.skills.force++, s => s.offered_item.exists_after = 1]) {
        const rows = fixture(c); mutate(rows[0]); assert.throws(() => validateTeachingObservation(rows, c));
    }
});

test('合法分布单列86技能，青云高等级补足正气，持器资格未替换', () => {
    assert.equal(cases.filter(c => c.samples === 100).length, 86);
    const c = get('da-mo-qingyun-bian-below-cap');
    assert.equal(c.parameters.actor.properties.shen, 110100);
    for (const c of cases.filter(c => c.parameters.variant === 'no-weapon')) {
        assert.ok(!c.parameters.actor.equipment); assert.equal(c.parameters.expected, 'refused');
    }
});

test('经书或教师版本改变必须重新复核', () => {
    assert.throws(() => shaolinTeachersConditions(relations, catalog, path => readFileSync(path, 'utf8')
        + (path.endsWith('book_data.h') ? '\n// changed' : '')), /源码变化/);
});
