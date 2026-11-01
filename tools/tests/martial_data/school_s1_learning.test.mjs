import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { s1LearningConditions, s1LearningGroup, validateS1LearningRecord } from './school_s1_learning_cases.mjs';
import { schoolCombatConditions } from './school_combat_cases.mjs';

const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const cases = s1LearningConditions(catalog, read);
const find = suffix => cases.find(c => c.id.endsWith(suffix));

const miaoRefusal = '这套白鹤冲天掌过于繁杂，我还是先教你些简单的武功吧。';
const miaoGrant = '今日我就传你白鹤冲天掌';
const murongFirst = '据说少林的武功学了对身体有害';
const murongLater = '你还是安心学本门功夫吧。';

function snapshot(p, state) {
    const skills = { ...(state.skills ?? p.actor.skills) };
    return {
        grants: { ...(p.permission_grant ? { [p.permission_grant]: state.grant ?? 0 } : {}) },
        skills,
        learned: { ...(state.learned ?? {}) },
        jing: state.jing ?? 10000,
        neili: state.neili ?? 6000,
        learned_points: state.points ?? 0,
        int: 30,
        s1_marks: { has_asked: state.hasAsked ?? 0, daobaifeng: state.daobf ?? 0 },
    };
}

function progressState(p, state) {
    const skills = state.skills ?? p.actor.skills;
    const level = skills[p.skill];
    const jingCost = Math.floor((100 + level * 2) / 30);
    return {
        ...state,
        skills: { ...skills, [p.skill]: level + 1 },
        learned: { ...state.learned, [p.skill]: (state.learned?.[p.skill] ?? 0) + 4 },
        jing: (state.jing ?? 10000) - jingCost,
        points: (state.points ?? 0) + 1,
    };
}

function step(p, before, after, { i = 0, accepted = 1, notifyFail = '', texts = [], noTeach = { kind: 'expression' } } = {}) {
    return {
        student: '/tests/teaching_actor#1',
        teacher: p.teacher.path + '#2',
        teacher_program: p.teacher.path,
        command: p.teaching_expectations[i].action,
        command_accepted: accepted,
        notify_fail: notifyFail,
        teacher_no_teach: noTeach,
        messages: texts.map(text => ({ category: 'vision', text })),
        before: snapshot(p, before),
        after: snapshot(p, after),
    };
}

function compliantRecord(c) {
    const p = c.parameters;
    const steps = [];
    const noTeachNone = { kind: 'none' };
    switch (p.variant) {
        case 'string-refusal':
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, {}, {}, { texts: [p.refusal_text], noTeach: { kind: 'string', value: p.refusal_text } }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'exp-threshold-refusal':
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, {}, {}, { texts: [miaoRefusal] }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'exp-threshold': {
            const before = { grant: 0 };
            const after = progressState(p, { ...before, grant: 1 });
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, before, after, { texts: [miaoGrant] }));
            return { teaching: steps, outcome: 'observed', reason: '', before: [{ object: '/tests/teaching_actor#1' }] };
        }
        case 'existing-permission': {
            const before = { grant: 1 };
            const after = progressState(p, { ...before, grant: 1 });
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, before, after));
            return { teaching: steps, outcome: 'observed', reason: '', before: [{ object: '/tests/teaching_actor#1' }] };
        }
        case 'permission-before-skill-refusal':
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, { grant: 0 }, { grant: 1 }, {
                    accepted: 0, notifyFail: '你的内功火候不够，无法练白鹤冲天掌。', texts: [miaoGrant],
                }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'same-student-repeat': {
            const first = { grant: 0 };
            const mid = progressState(p, { ...first, grant: 1 });
            const end = progressState(p, { ...mid });
            steps.push(step(p, first, mid, { texts: [miaoGrant] }));
            steps.push(step(p, mid, end, { i: 1 }));
            return { teaching: steps, outcome: 'observed', reason: '', before: [{ object: '/tests/teaching_actor#1' }] };
        }
        case 'first-callback-refusal':
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, { hasAsked: 0 }, { hasAsked: 1 }, { texts: [murongFirst] }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'repeat':
            steps.push(step(p, { hasAsked: 0 }, { hasAsked: 1 }, { texts: [murongFirst] }));
            steps.push(step(p, { hasAsked: 1 }, { hasAsked: 1 }, { texts: [murongLater], i: 1 }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'cross-skill-chain':
            steps.push(step(p, { hasAsked: 0 }, { hasAsked: 1 }, { texts: [murongFirst] }));
            for (let i = 1; i < p.teaching_expectations.length; i++)
                steps.push(step(p, { hasAsked: 1 }, { hasAsked: 1 }, { texts: [murongLater], i }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        case 'recognize-family-refusal':
        case 'recognize-gender-refusal':
        case 'recognize-exp-refusal': {
            const gate = p.variant === 'recognize-family-refusal' ? '我与阁下素不相识'
                : p.variant === 'recognize-gender-refusal' ? '你还是去跟你爹爹学吧' : '你现在经验尚浅';
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, { daobf: 0 }, { daobf: 0 }, { texts: [gate], noTeach: noTeachNone }));
            return { teaching: steps, outcome: 'refused', reason: '原教学未增加领悟或学习进度，详见逐步状态及消息', before: [{ object: '/tests/teaching_actor#1' }] };
        }
        case 'recognize-success': {
            const before = { daobf: 0 };
            const after = { ...progressState(p, before), daobf: 1 };
            for (let i = 0; i < p.teaching_expectations.length; i++)
                steps.push(step(p, before, after, { texts: ['今日我就教你好了'], noTeach: noTeachNone }));
            return { teaching: steps, outcome: 'observed', reason: '', before: [{ object: '/tests/teaching_actor#1' }] };
        }
        default:
            throw new Error('未知变体 ' + p.variant);
    }
}

test('S1学习25条件按矩阵采样：矩阵21条件336正式，daobf四条件8正式，烟雾50', () => {
    assert.equal(cases.length, 25);
    const matrix = cases.filter(c => !c.id.includes('duan-daobf'));
    assert.equal(matrix.length, 21);
    assert.equal(matrix.reduce((n, c) => n + c.samples, 0), 336, '矩阵正式计划336');
    const daobf = cases.filter(c => c.id.includes('duan-daobf'));
    assert.equal(daobf.length, 4);
    assert.equal(daobf.reduce((n, c) => n + c.samples, 0), 8);
    assert.equal(cases.filter(c => c.samples === 100).length, 3, '随机进度三条件各100');
    const smoke = s1LearningConditions(catalog, read, { smoke: true });
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 50);
    assert.equal(new Set(cases.map(c => c.id)).size, 25);
    const all = schoolCombatConditions(catalog);
    assert.deepEqual(all.filter(c => c.parameters.collection_group === s1LearningGroup), cases,
        's1-learning条件经school-combat入口原样分发');
});

test('夹具与原资格一致：基本技能60、内功198变体、真实双次动作、同学生间隔2秒', () => {
    for (const c of cases) {
        const p = c.parameters;
        assert.equal(p.observation, 'original_learn_command');
        assert.equal(p.teaching_kind, 'ordinary_learning');
        assert.equal(p.expected_command_results.length, p.teaching_expectations.length);
        assert.equal(p.actor.properties.learned_points, 0);
    }
    const exp = find('miao-chongtian-exp100001');
    assert.equal(exp.parameters.exp, 100001);
    assert.equal(exp.parameters.actor.skills.strike, 60, '基本掌法60满足原valid_learn');
    assert.equal(exp.parameters.actor.skills.force, 200);
    assert.equal(exp.parameters.permission_grant, 'can_learn/miao/chongtian-zhang');
    assert.equal(exp.parameters.s1_pre_grant, 0, '自然取得不得预置许可');
    const permission = find('miao-chongtian-existing-permission');
    assert.equal(permission.parameters.s1_pre_grant, 1);
    assert.equal(permission.parameters.exp, 99999, '预许可条件不靠经验阈值放行');
    const refusal = find('miao-chongtian-permission-before-force-refusal');
    assert.equal(refusal.parameters.actor.skills.force, 198, '有效内功99触发原火候拒绝');
    assert.equal(refusal.parameters.expected, 'refused');
    const repeat = find('miao-chongtian-real-repeat');
    assert.equal(repeat.parameters.minimum_step_interval_seconds, 2);
    assert.equal(repeat.parameters.teaching_expectations.length, 2);
    const chain = find('murong-cross-skill-shared-mark');
    assert.equal(chain.parameters.teaching_expectations.length, 6, '六路少林技能共享询问标记');
    const success = find('duan-daobf-feifeng-bian-success');
    assert.equal(success.parameters.actor.equipment.program, '/clone/weapon/changbian');
    assert.equal(success.parameters.actor.properties.family.master_id, undefined, '非原拜师认徒条件');
});

test('严格消费者接受完整原语义记录', () => {
    for (const c of cases) validateS1LearningRecord(compliantRecord(c), c);
});

test('严格消费者拒绝无许可授予、无进度、错误费用及缺步记录', () => {
    const exp = find('miao-chongtian-exp100001');
    const good = compliantRecord(exp);
    validateS1LearningRecord(good, exp);
    const noGrant = structuredClone(good);
    noGrant.teaching[0].after.grants['can_learn/miao/chongtian-zhang'] = 0;
    assert.throws(() => validateS1LearningRecord(noGrant, exp), /许可后快照/);
    const noProgress = structuredClone(good);
    noProgress.teaching[0].after.skills['chongtian-zhang'] = 50;
    noProgress.teaching[0].after.learned = {};
    assert.throws(() => validateS1LearningRecord(noProgress, exp), /学习进度增长/);
    const wrongCost = structuredClone(good);
    wrongCost.teaching[0].after.jing = 10000;
    assert.throws(() => validateS1LearningRecord(wrongCost, exp), /精神支出/);
    const missingStep = structuredClone(compliantRecord(find('miao-chongtian-real-repeat')));
    missingStep.teaching.pop();
    assert.throws(() => validateS1LearningRecord(missingStep, find('miao-chongtian-real-repeat')), /逐步记录数/);
    const missingMessage = structuredClone(compliantRecord(find('honghua-zhao-taiji-quan-string-refusal')));
    missingMessage.teaching[0].messages = [];
    assert.throws(() => validateS1LearningRecord(missingMessage, find('honghua-zhao-taiji-quan-string-refusal')), /原拒绝句/);
    const missingMark = structuredClone(compliantRecord(find('murong-cross-skill-shared-mark')));
    missingMark.teaching.at(-1).after.s1_marks.has_asked = 0;
    assert.throws(() => validateS1LearningRecord(missingMark, find('murong-cross-skill-shared-mark')), /询问标记/);
});

test('严格消费者拒绝错绑真实对象、删除零许可字段与缺失必需字段', () => {
    const exp = find('miao-chongtian-exp100001');
    const wrongObject = structuredClone(compliantRecord(exp));
    wrongObject.before[0].object = '/tests/teaching_actor#99';
    assert.throws(() => validateS1LearningRecord(wrongObject, exp), /真实对象/);
    const noGrantField = structuredClone(compliantRecord(exp));
    delete noGrantField.teaching[0].before.grants['can_learn/miao/chongtian-zhang'];
    assert.throws(() => validateS1LearningRecord(noGrantField, exp), /零许可字段/);
    const noJing = structuredClone(compliantRecord(exp));
    delete noJing.teaching[0].after.jing;
    assert.throws(() => validateS1LearningRecord(noJing, exp), /必需字段/);
    const noMarks = structuredClone(compliantRecord(exp));
    delete noMarks.teaching[0].before.s1_marks;
    assert.throws(() => validateS1LearningRecord(noMarks, exp), /必需字段|s1_marks/);
});

test('严格消费者拒绝错绑命令、替换学生身份与步间凭空恢复', () => {
    const repeat = find('miao-chongtian-real-repeat');
    const wrongCommand = structuredClone(compliantRecord(repeat));
    wrongCommand.teaching[1].command = 'learn miao renfeng chongtian-zhang 3';
    assert.throws(() => validateS1LearningRecord(wrongCommand, repeat), /计划原命令/);
    const wrongStudent = structuredClone(compliantRecord(repeat));
    wrongStudent.teaching[1].student = '/tests/actor#9';
    assert.throws(() => validateS1LearningRecord(wrongStudent, repeat), /真实对象|同一学生续行/);
    const bothStudents = structuredClone(compliantRecord(repeat));
    for (const step of bothStudents.teaching) step.student = '/tests/actor#9';
    assert.throws(() => validateS1LearningRecord(bothStudents, repeat), /真实对象/);
    const resurrected = structuredClone(compliantRecord(repeat));
    resurrected.teaching[1].before.jing = resurrected.teaching[0].after.jing + 100;
    assert.throws(() => validateS1LearningRecord(resurrected, repeat), /步间精神连续/);
    const chain = find('murong-cross-skill-shared-mark');
    const editedMarks = structuredClone(compliantRecord(chain));
    editedMarks.teaching[2].before.s1_marks.has_asked = 0;
    assert.throws(() => validateS1LearningRecord(editedMarks, chain), /步间标记连续/);
});
