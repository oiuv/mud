import assert from 'node:assert/strict';
import test from 'node:test';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingObservation } from './teaching_observation.mjs';
import { flowerSubskills } from './chen_learning_cases.mjs';

const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const all = teachingConditions(schoolRelations(inventory, catalog), catalog)
    .filter(c => !['feng', 'quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'shaolin-recruit', 'shaolin-promotion', 'shaolin-tonsure', 'shaolin-formation', 'shaolin-challenge', 'emei-teachers', 'emei-recruit', 'emei-special', 'emei-tonsure', 'gumu-teachers', 'gumu-special', 'gumu-recruit', 'gumu-item-acquisition', 'gumu-acquisition-learning', 'taohua-learning'].includes(c.parameters.teaching_profile))
    .filter(c => !['mingjiao', 'duan', 'tianlongsi', 'xueshan', 'xuedao', 'xingxiu', 'xuanming', 'tiezhang', 'shenlong', 'henshan', 'songshan', 'lingxiao', 'meizhuang', 'lingjiu', 'xiaoyao', 'miao', 'murong', 'ouyang', 'shang', 'zhenyuan'].some(g => c.parameters.teacher.path.includes('/' + g + '/')));
const cases = all.filter(c => c.id.startsWith('teaching-chen-learn-'));
const get = suffix => structuredClone(cases.find(c => c.id === 'teaching-chen-learn-' + suffix));

// Artificial observations test validation only. Actual teaching uses FluffOS.
function fixture(suffix) {
    const condition = get(suffix), p = condition.parameters, props = p.actor.properties;
    let before = { grants: { [p.monitored_grants[0]]: 0 }, skills: { ...p.actor.skills }, learned: {}, mappings: {},
        contribution: 0, jing: props.jing ?? 10000, neili: props.neili, max_neili: props.max_neili,
        max_jingli: 0, potential: props.potential, learned_points: 0,
        effective_force: Math.trunc(p.actor.skills.force / 2), effective_dodge: 0,
        dex: props.dex, effective_dex: props.dex, str: props.str, shen: props.shen,
        con: props.con, int: props.int, effective_int: props.int, character: props.character,
        family: props['family/family_name'], master_id: props['family/master_id'],
        master_name: props['family/master_name'], reborn_family: props['reborn/family_name'] ?? 0 };
    const steps = p.teaching_expectations.map(e => {
        const after = structuredClone(before); Object.assign(after.skills, e.skills_after);
        const step = { teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
            student: '/tests/teaching_actor#1', command: p.action, command_accepted: e.command_accepted,
            elapsed: 0.001, before, after, messages: [],
            message_scope: 'receive_message_apply_input_not_full_transcript' };
        before = after; return step;
    });
    return { condition, steps };
}

test('陈家洛原 learn 新增 21 条条件，历史 1386 条和询问范围保持独立', () => {
    assert.equal(cases.length, 21); assert.equal(all.length, 1407);
    assert.equal(teachingEntries(cases).length, 1); assert.equal(teachingEntries(all).length, 161);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 5);
    const source = inventory.files.find(f => f.path === 'kungfu/class/honghua/chen.c');
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(c.samples, 2); assert.equal(c.status, 'configured_not_executed');
        assert.equal(p.action, 'learn chen jialuo baihua-cuoquan 1');
        assert.equal(p.teaching_kind, 'ordinary_learning');
        assert.ok(!Object.keys(p.actor.properties).some(k => k.startsWith('can_')));
        assert.ok(source.functions.some(f => f.name === p.teaching_entry.function && f.line === p.teaching_entry.line));
        assert.ok(p.qualification_sources.includes('mudcore/inherit/dbase.c'));
        assert.ok(p.qualification_sources.includes('kungfu/skill/baihua-cuoquan.c'));
        for (const e of p.teaching_expectations) {
            assert.equal(e.value, 0); assert.equal(e.contribution_spent, 0);
            assert.equal(e.jing_spent, 0); assert.equal(e.learned_points_spent, 0);
        }
    }
});

test('十三路入门与百级合成分开；已有二十级保留、九级补十、不创建主技能', () => {
    assert.equal(flowerSubskills.length, 13);
    const skills = get('success').parameters.teaching_expectations[0].skills_after;
    assert.deepEqual(Object.keys(skills), flowerSubskills); assert.ok(Object.values(skills).every(v => v === 10));
    assert.ok(!Object.hasOwn(skills, 'baihua-cuoquan'));
    assert.equal(get('partial-existing').parameters.teaching_expectations[0].skills_after[flowerSubskills[0]], 20);
    assert.equal(get('partial-existing').parameters.actor.skills[flowerSubskills[1]], 9);
    assert.equal(get('repeat').parameters.teaching_expectations.length, 2);
    assert.equal(get('combined-above-basic').parameters.actor.skills['baihua-cuoquan'], 151);
    const source = inventory.files.find(f => f.path === 'kungfu/skill/baihua-cuoquan.c');
    const valid = source.functions.find(f => f.name === 'valid_learn').text;
    for (const text of ['query("int") < 28', 'query("dex") < 23', 'query("max_neili") < 3000',
        'query_skill("force") < 250', 'query_skill("unarmed", 1) < 150',
        'query_skill("cuff", 1) < 100', 'query_skill("claw", 1) < 100', 'query_skill("strike", 1) < 100']) {
        assert.ok(valid.includes(text), text);
    }
    assert.doesNotMatch(valid, /martial-cognize/);
});

test('低门槛、原转世师承例外及持器拒绝明确配置，不按返回值判断已传授', () => {
    assert.equal(get('force-low').parameters.actor.skills.force, 499);
    assert.equal(get('success').parameters.actor.skills.force, 500);
    assert.equal(get('shen-low').parameters.teaching_expectations[0].command_accepted, 1);
    for (const suffix of ['int-low', 'dex-low', 'max-neili-low', 'force-low', 'unarmed-low',
        'cuff-low', 'claw-low', 'strike-low', 'weapon-equipped', 'master-other', 'master-name-other']) {
        assert.equal(get(suffix).parameters.teaching_expectations[0].command_accepted, 0);
    }
    assert.equal(get('reborn-master-other').parameters.actor.properties['reborn/family_name'], '红花会');
    assert.equal(get('reborn-master-other').parameters.expected, 'refused');
    assert.equal(get('reborn-name-other').parameters.expected, 'observed');
    assert.deepEqual(get('weapon-equipped').parameters.actor.equipment, { type: 'sword' });
    for (const k of ['potential', 'jing', 'neili']) assert.equal(get('no-learning-resources').parameters.actor.properties[k], 0);
});

test('所有人工观察均验证，缺分招、降级、额外主技能、扣费与重复伪造都拒绝', () => {
    for (const c of cases) {
        const { condition, steps } = fixture(c.id.slice('teaching-chen-learn-'.length));
        assert.equal(validateTeachingObservation(steps, condition).some(r => r.advanced),
            condition.parameters.expected === 'observed');
    }
    for (const [suffix, corrupt, match] of [
        ['success', s => { delete s[0].after.skills[flowerSubskills[0]]; }, /技能状态不符/],
        ['partial-existing', s => { s[0].after.skills[flowerSubskills[0]] = 10; }, /技能状态不符/],
        ['success', s => { s[0].after.skills['baihua-cuoquan'] = 10; }, /未声明技能/],
        ['success', s => { s[0].after.jing--; }, /精神扣除/],
        ['success', s => { s[0].after.learned_points++; }, /学习点支出/],
        ['repeat', s => { s[1].student = '/tests/teaching_actor#3'; }, /换了学生/],
    ]) {
        const { condition, steps } = fixture(suffix); corrupt(steps);
        assert.throws(() => validateTeachingObservation(steps, condition), match);
    }
});
