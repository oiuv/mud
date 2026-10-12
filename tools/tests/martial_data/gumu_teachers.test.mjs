import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { validateExpectedOutcomes, validateRecord } from './execution.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { summarizeTeachingRows } from './teaching_report.mjs';
import { gumuEffectiveAttribute } from './school_gumu_cultivation_cases.mjs';
import { gumuTeachersSources, gumuTeachersReviewed, gumuTeachersFixtureRequirements,
    gumuTeachersConditions, gumuTeacherCanLearn, gumuTeacherExpectation } from './gumu_teachers_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog), cases = gumuTeachersConditions(relations, catalog, read);
const get = suffix => {
    const c = cases.find(c => c.id === 'teaching-gumu-learn-' + suffix);
    assert.ok(c, suffix); return c;
};
const expected = suffix => get(suffix).parameters.teaching_expectations[0];

test('四教师82最终关系33技能闭合，328条件4576计划，不当作实测', () => {
    assert.equal(cases.length, 328); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 4576);
    assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
    assert.equal(new Set(cases.map(c => c.parameters.skill)).size, 33);
    for (const variant of ['level10', 'below-cap', 'at-cap'])
        assert.equal(cases.filter(c => c.parameters.variant === variant).length, 82);
    for (const [name, count] of [['li', 20], ['lin', 19], ['longnv', 21], ['yang', 22]])
        assert.equal(cases.filter(c => c.id.startsWith(`teaching-gumu-learn-${name}-`)
            && c.parameters.variant === 'level10').length, count);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 205);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 123);
    assert.equal(gumuTeachersFixtureRequirements.length, 4);
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed');
        assert.equal(c.parameters.teaching_profile, 'gumu-teachers');
        assert.match(c.parameters.note, /不证明正常拜师或初次学会/);
        assert.deepEqual(c.parameters.monitored_grants, []);
        assert.equal(c.method, 'teaching');
    }
});

test('烟雾独立计划，统一授课入口注册同一矩阵并冻结依赖', () => {
    const smoke = gumuTeachersConditions(relations, catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 328);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    assert.equal(sha256(JSON.stringify(cases)), 'fe5dd60ff81f53f3dc722e07505995686e0e03fb570862e14ca53405ddd02f1c');
    assert.equal(sha256(JSON.stringify(smoke)), 'c0a4f8d7316f34d79adbfe1b529d4d896a5a8b99c579066a202f0bcbd989b816');
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    for (const p of ['tools/tests/martial_data/teaching_cases.mjs', 'tools/tests/martial_data/execution.mjs'])
        assert.ok(read(p).includes('gumu_teachers_cases'), p);
    const all = teachingConditions(relations, catalog);
    assert.deepEqual(all.filter(c => c.parameters.teaching_profile === 'gumu-teachers'), cases);
    const prior = all.slice(0, 11481);
    assert.equal(prior.length, 11481); assert.equal(prior.reduce((n, c) => n + c.samples, 0), 49516);
    assert.equal(sha256(JSON.stringify(prior)), 'f7a4c88466a8da6d044d3588397dd1696a8545f5307946a5323dd0fc1199f416');
});

test('学校战斗旧15378条件及正式和烟雾计划保持完整JSON不变', () => {
    for (const [smoke, count, fingerprint] of [
        [false, 396578, '923372129137cf270f21ab854b3b1d0a9d16dc77fa18881d6ff6dfe0913bec90'],
        [true, 25539, '33d125d253cacf0759843fa1a86e723e79125c707816acaca4196b635247c8a6'],
    ]) {
        const matrix = schoolCombatConditions(catalog, { smoke }).slice(0, 15378);
        assert.equal(matrix.length, 15378); assert.equal(matrix.reduce((n, c) => n + c.samples, 0), count);
        assert.equal(sha256(JSON.stringify(matrix)), fingerprint);
    }
});

test('正式与烟雾完整通过真实台账建档和重开，非法ID仍被公共契约拒绝', () => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-teachers-ledger-test-'));
    for (const smoke of [false, true]) {
        const matrix = gumuTeachersConditions(relations, catalog, read, { smoke });
        const path = join(directory, smoke ? 'smoke' : 'formal');
        const manifest = createSeries(path, { inventory, catalog, conditions: matrix,
            teachingEntries: teachingEntries(matrix), execution: { fixture: 'synthetic-no-driver' } });
        assert.deepEqual(openSeries(path, manifest.identity), JSON.parse(JSON.stringify(manifest)));
        assert.deepEqual(manifest.identity.conditions, matrix);
    }
    const invalid = structuredClone(cases[0]); invalid.id += '-无效';
    assert.throws(() => createSeries(join(directory, 'invalid'), { inventory, catalog, conditions: [invalid],
        teachingEntries: teachingEntries([invalid]), execution: { fixture: 'synthetic-no-driver' } }), /条件 ID/);
});

test('教师组不能冒用其他门派或把未接入的观察器当作实测完成', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.teaching_profile, 'gumu-teachers');
        assert.equal(p.teaching_kind, 'ordinary_learning');
        assert.equal(p.observe_seconds, 0); assert.equal(p.fighting, false);
        assert.equal(p.teacher.path, '/' + p.teaching_entry.path.slice(0, -2));
        assert.deepEqual(p.monitored_grants, []);
        assert.equal(p.teaching_expectations.length, 1);
        assert.equal(p.expected, p.teaching_expectations[0].may_improve_skills ? 'observed' : 'refused');
        assert.equal(p.teaching_expectations[0].contribution_spent, 0);
    }
});

test('武学上限、教师自身上限、叛师与无师承分别处理', () => {
    assert.equal(expected('lin-force-at-cap').command_accepted, 1);
    assert.equal(expected('lin-force-at-cap').learned_points_spent, 0);
    assert.equal(expected('lin-literate-at-cap').command_accepted, 0);
    assert.equal(get('lin-literate-below-cap').parameters.level, 299);
    assert.equal(get('lin-force-below-cap').parameters.level, 199);
    assert.equal(expected('lin-literate-betrayer-l297').learned_points_spent, 1);
    assert.equal(expected('lin-literate-betrayer-l298').command_accepted, 0);
    for (const name of ['li', 'lin', 'longnv', 'yang']) for (const suffix of ['other-master', 'other-name']) {
        const e = expected(`${name}-force-${suffix}`);
        assert.equal(e.command_accepted, 0); assert.equal(e.learned_points_spent, 0); assert.equal(e.jing_spent, 0);
    }
    for (const c of cases.filter(c => c.parameters.skill === 'martial-cognize'))
        assert.equal(c.parameters.expected, 'refused');
});

test('左右互搏区分先天/有效悟性、天道、count、循影、内功与性别边界', () => {
    const p = get('longnv-zuoyou-hubo-level10').parameters;
    assert.equal(p.actor.properties.int, 15);
    assert.equal(gumuEffectiveAttribute(p.actor, 'int'), 55);
    assert.equal(p.expected, 'observed');
    for (const variant of ['int16', 'count1', 'qinzong', 'force148', 'eunuch50'])
        assert.equal(get('longnv-zuoyou-hubo-' + variant).parameters.expected, 'refused', variant);
    for (const variant of ['tiandao', 'force150', 'eunuch49'])
        assert.equal(get('longnv-zuoyou-hubo-' + variant).parameters.expected, 'observed', variant);
    assert.equal(get('longnv-zuoyou-hubo-count1').parameters.actor.skills.count, 1);
    assert.ok(!Object.hasOwn(p.actor.skills, 'mathematics'));
});

test('不足潜能不做部分授课，精神不足保留实际两次与清零余量', () => {
    for (const skill of ['meinv-quan', 'literate']) {
        for (const v of ['potential0', 'potential2-times3', 'no-learn']) {
            const e = expected(`lin-${skill}-${v}`);
            assert.equal(e.command_accepted, 0); assert.equal(e.jing_spent, 0); assert.equal(e.learned_points_spent, 0);
        }
        assert.equal(expected(`lin-${skill}-jing7`).command_accepted, 1);
        assert.equal(expected(`lin-${skill}-jing7`).jing_spent, 7);
        assert.equal(expected(`lin-${skill}-jing7`).learned_points_spent, 0);
        const partial = expected(`lin-${skill}-partial3`);
        assert.equal(partial.command_accepted, 1); assert.equal(partial.jing_spent, 17);
        assert.equal(partial.learned_points_spent, 2);
        assert.equal(expected(`lin-${skill}-times50`).learned_points_spent, 50);
        assert.equal(expected(`lin-${skill}-times100`).learned_points_spent, 100);
    }
    assert.equal(expected('lin-meinv-quan-exp0').command_accepted, 1);
    assert.equal(expected('lin-meinv-quan-exp0').learned_points_spent, 0);
    assert.equal(expected('lin-literate-exp0').learned_points_spent, 1);
});

test('32技能随机分布配置均合资格；修养加成不套知识，玄铁资格带来的加成单列', () => {
    const distributions = cases.filter(c => c.parameters.variant === 'distribution');
    assert.equal(distributions.length, 32);
    for (const c of distributions) {
        assert.equal(c.samples, 100); assert.equal(c.parameters.expected, 'observed', c.id);
        const p = c.parameters, e = p.teaching_expectations[0];
        assert.equal(e.learned_points_spent, 1);
        assert.ok(e.learning_progress[p.skill][1] > e.learning_progress[p.skill][0]);
    }
    // rand=48, max amount=51, cognize bonus=floor(51*220/500)=22;
    // improvement=1+floor((51+22)*100/200)=37.
    assert.deepEqual(expected('yang-xuantie-jian-distribution').learning_progress['xuantie-jian'], [3, 37]);
    assert.deepEqual(expected('lin-meinv-quan-cognize500').learning_progress['meinv-quan'], [5, 52]);
    assert.deepEqual(expected('lin-literate-cognize500').learning_progress.literate,
        expected('lin-literate-times50').learning_progress.literate.map(n => n / 50));
    assert.ok(expected('lin-meinv-quan-wuxing').learning_progress['meinv-quan'][1]
        > expected('lin-meinv-quan-times50').learning_progress['meinv-quan'][1] / 50);
});

test('资格拒绝保留，原NPC自己会不等于本角色条件够', () => {
    for (const suffix of ['lin-suxin-jue-force9', 'lin-yunv-xinjing-int31', 'yang-surge-force-female',
        'longnv-suxin-jian-male', 'longnv-suxin-jian-unarmed', 'longnv-yinsuo-jinling-dex27',
        'li-sanwu-shou-upright', 'li-wudu-shenzhang-upright', 'yang-sad-strike-female',
        'yang-xuantie-jian-cognize219', 'li-bingpo-shenzhen-dodge198', 'longnv-yufeng-zhen-dodge158']) {
        const e = expected(suffix);
        assert.equal(e.command_accepted, 0, suffix); assert.equal(e.learned_points_spent, 0);
    }
    assert.equal(get('yang-fireice-strike-level10').parameters.teacher_level, 380);
    assert.equal(get('li-yunv-jian-level10').parameters.actor.equipment.type, 'sword');
    assert.ok(!get('li-meinv-quan-level10').parameters.actor.equipment);
    assert.throws(() => gumuTeacherCanLearn('unknown', get('lin-force-level10').parameters.actor));
});

test('49份来源与证据完整且漂移必须停止，超出已核对预期范围不蒙混计算', () => {
    assert.equal(gumuTeachersSources.length, 49);
    assert.equal(sha256(JSON.stringify(gumuTeachersSources.map(p => [p, sha256(read(p))]))), gumuTeachersReviewed);
    assert.equal(new Set(cases.flatMap(c => c.parameters.qualification_sources)).size, 49);
    for (const c of cases) {
        const p = c.parameters;
        assert.deepEqual(p.qualification_sources, p.qualification_evidence.map(e => e.path));
        for (const e of p.qualification_evidence) assert.equal(e.sha256, sha256(read(e.path)));
        assert.equal(p.teacher.sha256, sha256(read(p.teaching_entry.path)));
        assert.equal(p.teaching_entry.sha256, p.teacher.sha256);
    }
    assert.throws(() => gumuTeachersConditions(relations, catalog, p => read(p) + (p.endsWith('/yang.c') ? '\n' : '')));
    assert.throws(() => gumuTeachersConditions({ ...relations,
        objects: relations.objects.filter(t => t.path !== 'kungfu/class/gumu/li.c') }, catalog, read));
    const p = get('lin-meinv-quan-level10').parameters;
    assert.throws(() => gumuTeacherExpectation(p.skill, p.actor, { teacherLevel: 320, times: 0 }));
    assert.throws(() => gumuTeacherExpectation(p.skill, p.actor, { teacherLevel: 320, times: 101 }));
    assert.throws(() => gumuTeacherExpectation(p.skill, p.actor, { teacherLevel: 320, times: 100 }));
});

// Collector-only synthetic records. No field below is real-driver evidence.
function fixture(c) {
    const p = c.parameters, props = p.actor.properties, e = p.teaching_expectations[0];
    const dynamic = { 'suxin-jian': 'sword', 'quanzhen-jian': 'sword', 'yinsuo-jinling': 'whip',
        'sanwu-shou': 'whip', 'wudu-shenzhang': 'strike', 'sad-strike': 'unarmed' };
    const before = { ...props, grants: {}, contribution: props.gongxian, skills: { ...p.actor.skills },
        learned: {}, mappings: { ...p.actor.mappings }, max_jingli: 0, shen: 37,
        family: props['family/family_name'], master_id: props['family/master_id'], master_name: props['family/master_name'],
        reborn_family: 0, effective_force: Math.trunc(p.actor.skills.force / 2)
            + (p.actor.skills[p.actor.mappings.force] ?? 0),
        effective_dodge: Math.trunc(p.actor.skills.dodge / 2) - (p.actor.equipment ? 1 : 0),
        effective_int: props.int + Math.trunc(p.actor.skills.literate / 10),
        effective_dex: props.dex + Math.trunc(p.actor.skills.dodge / 10) };
    const after = structuredClone(before);
    after.jing -= e.jing_spent; after.learned_points += e.learned_points_spent;
    for (const [skill, bounds] of Object.entries(e.learning_progress)) after.learned[skill] = bounds[0];
    const student = '/tests/teaching_actor#1', teacher = p.teacher.path + '#2';
    const equipment = p.actor.equipment;
    const snapshot = state => ({ ...structuredClone(state), object: student, id: 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, busy: null,
        qi: 10000, eff_qi: 10000, max_qi: 10000, max_jing: 10000, jingli: 0,
        preparations: {}, effective_skills: { force: state.effective_force, dodge: state.effective_dodge },
        effective_str: props.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
            .map(skill => p.actor.skills[skill] ?? 0)) / 10), effective_con: props.con,
        cultivation: Object.fromEntries(['character', 'family/family_name', 'family/master_id', 'family/master_name',
            'special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn']
            .map(k => [k, Object.hasOwn(props, k) ? props[k] : null])),
        temp: { apply: { armor: 100, ...(equipment ? { damage: 50, dodge: -1 } : {}) } },
        weapon: equipment?.type ?? 'none', weapon_damage: equipment ? 50 : 0,
        weapon_flag: equipment?.type === 'sword' ? 4 : equipment ? null : 0,
        weapon_details: equipment ? { program: '/tests/' + equipment.type, object: '/tests/' + equipment.type + '#3',
            id: 'practice weapon', skill_type: equipment.type, weight: 3000, damage: 50,
            flag: equipment.type === 'sword' ? 4 : null } : {}, handing: 'none', handing_details: {},
    });
    const a = snapshot(before), b = snapshot(after), target = { ...structuredClone(a), object: '/tests/actor#4' };
    const teacherState = { object: teacher, id: p.teacher.id, playerp: null, living: 1, skills: { [p.skill]: p.teacher_level } };
    const autonomy = heartbeat => ({ heartbeat, blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] });
    const loaded = Object.fromEntries(Object.keys(dynamic).map(k => [k, 1]));
    return { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: p.expected, elapsed: 0.01,
        before: [a, target], after: [b, structuredClone(target)], metrics: [{ jing_cost: e.jing_spent }, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [],
        teaching: [{ student, teacher, teacher_program: p.teacher.path, teacher_skills: structuredClone(teacherState.skills),
            command: p.action, command_accepted: e.command_accepted, elapsed: 0.01, before, after,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [] }],
        teacher_preparation: { command: 'test_interface', entry_actor: student, return_actor: student,
            before: structuredClone(a), after: structuredClone(a), initializer_actor: 'not_observed',
            teacher, teacher_program: p.teacher.path, teacher_state: teacherState,
            loaded_before: { ...loaded }, loaded_after: { ...loaded }, autonomy_before: autonomy(1), autonomy_after: autonomy(0) },
        teacher_final: { state: structuredClone(teacherState), autonomy: autonomy(0) },
        teacher_cleanup: { pending: 0, object_exists: 0 },
        ...(dynamic[p.skill] ? { skill_load_context: { actor: student, already_loaded: 1,
            skills: structuredClone(a.skills), command: `enable ${dynamic[p.skill]} ${p.skill}` } } : {}),
    };
}

test('328合成完整协议均通过，缺raw.parameters和实际非零正气不影响冻结条件归属', () => {
    for (const c of cases) {
        const raw = fixture(c);
        assert.ok(!Object.hasOwn(raw, 'parameters'));
        validateRecord(raw, c); validateTeachingRecord(raw, c);
    }
});

test('39个动态目标均有原激发所需已学基本技能，不为教师创建给学生补学', () => {
    const dynamic = cases.filter(c => fixture(c).skill_load_context);
    assert.equal(dynamic.length, 39);
    for (const c of dynamic) {
        const raw = fixture(c), usage = raw.skill_load_context.command.split(' ')[1];
        assert.ok(c.parameters.actor.skills[usage] > 0);
        assert.ok(c.parameters.actor.skills[c.parameters.skill] > 0);
        raw.skill_load_context.skills['unlearned-skill'] = 1;
        assert.throws(() => validateTeachingRecord(raw, c), /补学技能/);
    }
});

test('基本拳脚低于600时仍按六类基本徒手最高值增加膂力，不只取unarmed', () => {
    for (const variant of ['level10', 'below-cap', 'at-cap']) {
        const c = get('li-unarmed-' + variant), raw = fixture(c);
        assert.equal(raw.before[0].effective_str, 96);
        validateTeachingRecord(raw, c);
        raw.after[0].effective_str = 36 + Math.trunc(c.parameters.actor.skills.unarmed / 10);
        assert.throws(() => validateTeachingRecord(raw, c));
    }
});

test('准备上下文、真实学生前后、NPC对象及自主行为证据不可缺失或伪造', () => {
    const c = get('li-unarmed-level10');
    for (const mutate of [
        r => delete r.teacher_preparation,
        r => r.teacher_preparation.entry_actor = r.teaching[0].teacher,
        r => r.teacher_preparation.return_actor = r.teaching[0].teacher,
        r => r.teacher_preparation.initializer_actor = r.teaching[0].student,
        r => r.teacher_preparation.before.skills.force--,
        r => r.teacher_preparation.after.jing--,
        r => r.teacher_preparation.after.mappings.parry = 'wudu-shenzhang',
        r => r.teacher_preparation.teacher_state.id = 'another teacher',
        r => r.teacher_preparation.teacher_state.object += '0',
        r => r.teacher_preparation.autonomy_before.callbacks.push({ object: r.teaching[0].teacher, function: 'chat', delay: 1 }),
        r => r.teacher_preparation.autonomy_after.heartbeat = 1,
        r => r.teacher_final.autonomy.blueprint_heartbeat = 1,
        r => r.teacher_final.state.skills.force = 1,
        r => r.teacher_cleanup.pending = 1,
        r => r.callbacks.push({ phase: 'after' }),
        r => delete r.teacher_preparation.loaded_before['sad-strike'],
    ]) { const raw = fixture(c); mutate(raw); assert.throws(() => validateTeachingRecord(raw, c)); }
});

test('原NPC与未设资格的显式null或0可以验收，但缺键/未知类型/已配置资格不放宽', () => {
    const c = get('li-unarmed-level10');
    for (const empty of [null, 0]) {
        const raw = fixture(c);
        raw.teacher_preparation.teacher_state.playerp = empty; raw.teacher_final.state.playerp = empty;
        for (const state of [raw.before[0], raw.after[0], raw.teacher_preparation.before, raw.teacher_preparation.after])
            for (const key of ['special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn'])
                state.cultivation[key] = empty;
        validateTeachingRecord(raw, c);
    }
    for (const value of [undefined, false, '', '0', 1, {}, []]) {
        const raw = fixture(c); raw.teacher_preparation.teacher_state.playerp = value;
        assert.throws(() => validateTeachingRecord(raw, c));
        const qualification = fixture(c); qualification.after[0].cultivation['special_skill/tiandao'] = value;
        assert.throws(() => validateTeachingRecord(qualification, c));
    }
    const missing = fixture(c); delete missing.teacher_preparation.teacher_state.playerp;
    assert.throws(() => validateTeachingRecord(missing, c));
    const noField = fixture(c); delete noField.after[0].cultivation['env/no_learn'];
    assert.throws(() => validateTeachingRecord(noField, c));
    const configured = get('longnv-zuoyou-hubo-tiandao'), raw = fixture(configured);
    raw.after[0].cultivation['special_skill/tiandao'] = null;
    assert.throws(() => validateTeachingRecord(raw, configured));
    const student = fixture(c); student.after[0].playerp = null;
    assert.throws(() => validateTeachingRecord(student, c));
});

test('实际属性、性别、特殊资格、装备3000重量和负闪避必须匹配而非回填配置', () => {
    const c = get('longnv-suxin-jian-level10');
    for (const mutate of [
        r => delete r.before[0].shen,
        r => r.before[0].shen = null,
        r => r.after[0].shen++,
        r => r.after[0].gender = '男性',
        r => r.after[0].effective_str++,
        r => delete r.after[0].cultivation['special_skill/tiandao'],
        r => r.after[0].cultivation['special_skill/qinzong'] = 1,
        r => r.after[0].cultivation['betrayer/times'] = 1,
        r => r.after[0].weapon_details.weight = 0,
        r => r.after[0].weapon_details.id = 'another weapon',
        r => r.after[0].temp.apply.dodge = 0,
        r => r.after[0].temp.apply.damage = 0,
    ]) { const raw = fixture(c); mutate(raw); assert.throws(() => validateTeachingRecord(raw, c)); }
});

test('原鞭旗标显式null或0须与详情一致，剑/无武器和字段完整性不放宽', () => {
    const c = get('li-yunzhou-fufa-level10');
    for (const flag of [null, 0]) {
        const raw = fixture(c);
        for (const state of [raw.before[0], raw.after[0], raw.teacher_preparation.before, raw.teacher_preparation.after]) {
            state.weapon_flag = flag; state.weapon_details.flag = flag;
        }
        validateRecord(raw, c); validateTeachingRecord(raw, c);
    }
    for (const mutate of [
        r => delete r.after[0].weapon_flag,
        r => delete r.after[0].weapon_details.flag,
        r => r.after[0].weapon_flag = 0,
        ...[undefined, false, '', '0', 1, 4, {}, []].map(value => r => {
            r.after[0].weapon_flag = value; r.after[0].weapon_details.flag = value;
        }),
    ]) { const raw = fixture(c); mutate(raw); assert.throws(() => validateTeachingRecord(raw, c)); }
    for (const suffix of ['longnv-suxin-jian-level10', 'li-unarmed-level10']) {
        const condition = get(suffix), raw = fixture(condition); raw.after[0].weapon_flag = null;
        assert.throws(() => validateTeachingRecord(raw, condition));
    }
});

test('报告分别显示受理无增长、资源部分完成和100次增长，计入清零余量且不读raw.parameters', () => {
    for (const suffix of ['lin-meinv-quan-partial3', 'lin-meinv-quan-jing7',
        'lin-meinv-quan-potential2-times3', 'lin-literate-times100']) {
        const c = structuredClone(get(suffix)); c.samples = 1;
        const raw = fixture(c), e = c.parameters.teaching_expectations[0];
        const report = summarizeTeachingRows({ fingerprint: 'synthetic', identity: { conditions: [c] } },
            [{ condition_id: c.id, index: 0, outcome: raw.outcome, raw, raw_sha256: 'synthetic' }]);
        const row = report.conditions[0];
        assert.equal(row.skill, c.parameters.skill); assert.equal(row.level, c.parameters.level);
        assert.equal(row.teacher_level, c.parameters.teacher_level);
        assert.equal(row.command_accepted, e.command_accepted);
        assert.equal(row.learning_steps, Number(e.may_improve_skills));
        assert.equal(row.jing_spent_per_step.mean, e.jing_spent);
        assert.equal(row.learned_points_spent_per_step.mean, e.learned_points_spent);
        assert.equal(row.learning_progress_per_step.mean, e.learning_progress[c.parameters.skill]?.[0] ?? 0);
        if (suffix.endsWith('partial3')) {
            raw.metrics[0].jing_cost = 16;
            assert.throws(() => validateRecord(raw, c), /资源账/);
            assert.throws(() => validateTeachingRecord(raw, c), /资源账/);
        }
    }
});

test('准备一次性消费、精确对象复用和异常清理只作用本组', () => {
    const runner = read('tools/tests/martial_data/runner.lpc');
    const prepare = runner.slice(runner.indexOf('if (gumu_teacher_pending)'), runner.indexOf('spec = current["parameters"]["interface"]'));
    assert.ok(prepare.indexOf('gumu_teacher_pending = 0') < prepare.indexOf('gumu_teacher = new('));
    assert.ok(prepare.includes('member_array(current["parameters"]["teaching_profile"]'));
    assert.match(prepare, /\(\{\s*"gumu-teachers",\s*"gumu-special",\s*"gumu-acquisition-learning",\s*"gumu-item-acquisition",\s*"gumu-recruit"\s*\}\)/);
    assert.ok(runner.includes('if (!side && current["parameters"]["teaching_profile"] == "gumu-teachers"'));
    assert.ok(prepare.includes('evaluate(bind((: set_heart_beat, 0 :), gumu_teacher))'));
    assert.ok(prepare.includes('"initializer_actor": "not_observed"'));
    assert.ok(runner.includes('teacher = gumu_teacher;'));
    const cleanup = runner.slice(runner.indexOf('void clear_gumu_teacher()'), runner.indexOf('int do_interface()'));
    assert.ok(cleanup.includes('deep_inventory(gumu_teacher)'));
    assert.ok(cleanup.includes('destruct(gumu_teacher)'));
    assert.ok(runner.includes('current["teacher_final"]'));
    assert.ok(runner.indexOf('current["teacher_cleanup"]') < runner.indexOf('map_delete(current, "parameters")'));
});
