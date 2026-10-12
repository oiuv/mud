import assert from 'node:assert/strict';
import test from 'node:test';
import { validateTeachingObservation, validateTeachingRecord } from './teaching_observation.mjs';

const badGrant = 'can_perform/tiexian-quan/jia';
const correctGrant = 'can_perform/tiexian-quan/tui';
function fixture(repeat = false) {
    const condition = { method: 'teaching', parameters: {
        teacher: { path: '/kungfu/class/jueqing/chi' }, action: 'ask qiu qianchi about 破甲推山',
        actor: { properties: { gongxian: 100, 'family/family_name': '绝情谷', shen: -60000, str: 30 },
            skills: { 'tiexian-quan': 60, force: 160 }, mappings: {} },
        monitored_grants: [badGrant, correctGrant], known_issue: 'MA-003',
        expected: 'observed',
        teaching_expectations: [{ grant: badGrant, value: 1, contribution_spent: 100, absent_grants: [correctGrant] }],
    } };
    const before = { contribution: 100, jing: 10000, neili: 6000, max_neili: 6000,
        max_jingli: 1000, potential: 1200, learned_points: 200,
        effective_force: 80, effective_dodge: 0, shen: -60000, str: 30,
        grants: { [badGrant]: 0, [correctGrant]: 0 }, skills: { 'tiexian-quan': 60, force: 160 },
        learned: {}, mappings: {}, family: '绝情谷', master_id: null };
    const after = structuredClone(before);
    after.contribution = 0; after.jing -= 12; after.grants[badGrant] = 1;
    after.skills['tiexian-quan'] = 61; after.learned['tiexian-quan'] = 300;
    const first = { student: '/tests/teaching_actor#1', teacher: '/kungfu/class/jueqing/chi#2',
        teacher_program: '/kungfu/class/jueqing/chi', command: condition.parameters.action,
        command_accepted: 1, elapsed: 0.01, before, after,
        message_scope: 'receive_message_apply_input_not_full_transcript', messages: [] };
    const steps = [first];
    if (repeat) {
        condition.parameters.teaching_expectations.push({ grant: badGrant, value: 1, contribution_spent: 0,
            absent_grants: [correctGrant] });
        const second = structuredClone(first);
        second.before = structuredClone(first.after); second.after = structuredClone(first.after);
        second.after.jing -= 15;
        steps.push(second);
    }
    return { condition, steps };
}

test('状态与贡献证明原教学结果，重复询问必须接续同一学生和教师', () => {
    const { condition, steps } = fixture(true);
    const result = validateTeachingObservation(steps, condition);
    assert.deepEqual(result.map(s => s.acquired), [true, false]);
    assert.deepEqual(result.map(s => s.already_known), [false, true]);
    assert.deepEqual(result.map(s => s.contribution_spent), [100, 0]);
    assert.deepEqual(result.map(s => s.jing_spent), [12, 15]);
    assert.equal(result[0].known_issue, 'MA-003');
    assert.match(result[0].note, /不记为正常教学正确/);
    assert.equal(steps[0].after.skills['tiexian-quan'], 61);
});

test('袋数须来自观察且在教学过程保持，旧条件不强制补字段', () => {
    const { condition, steps } = fixture(true);
    validateTeachingObservation(steps, condition);
    condition.parameters.actor.properties['family/beggarlvl'] = 9;
    for (const step of steps) step.before.beggarlvl = step.after.beggarlvl = 9;
    validateTeachingObservation(steps, condition);
    for (const [mutate, message] of [
        [s => { delete s.before.beggarlvl; }, /袋数与条件/],
        [s => { s.before.beggarlvl = 8; }, /袋数与条件/],
        [s => { s.after.beggarlvl = 10; }, /改变了袋数/],
    ]) {
        const changed = structuredClone(steps); mutate(changed[0]);
        assert.throws(() => validateTeachingObservation(changed, condition), message);
    }
});

test('学习许可额外核验经验阅历原值，目标武功仍未学会，旧记录不强制补字段', () => {
    const { condition, steps } = fixture();
    validateTeachingObservation(steps, condition);
    condition.parameters.unchanged_properties = ['combat_exp', 'score'];
    Object.assign(condition.parameters.actor.properties, { combat_exp: 1000000, score: 100000 });
    condition.parameters.teaching_expectations[0].absent_skills = ['qianzhu-wandushou'];
    for (const state of [steps[0].before, steps[0].after]) {
        Object.assign(state, { combat_exp: 1000000, score: 100000 });
    }
    validateTeachingObservation(steps, condition);
    for (const [mutate, message] of [
        [s => { delete s.before.score; }, /属性观察缺失/],
        [s => { s.before.combat_exp--; }, /初始属性不符/],
        [s => { s.after.score--; }, /只作门槛/],
        [s => { s.after.skills['qianzhu-wandushou'] = 1; }, /许可不得当作直接学会/],
    ]) {
        const copy = structuredClone(steps); mutate(copy[0]);
        assert.throws(() => validateTeachingObservation(copy, condition), message);
    }
});

test('先天身法与有效身法分别核验，基本轻功不能用有效轻功代替', () => {
    const { condition, steps } = fixture();
    condition.parameters.actor.properties.dex = 18;
    condition.parameters.actor.skills.dodge = 150;
    for (const state of [steps[0].before, steps[0].after]) {
        state.dex = 18; state.effective_dex = 33;
        state.skills.dodge = 150; state.effective_dodge = 75;
    }
    assert.equal(validateTeachingObservation(steps, condition)[0].acquired, true);
    const missing = structuredClone(steps); delete missing[0].before.effective_dex;
    assert.throws(() => validateTeachingObservation(missing, condition), /有效身法/);
    const raw = structuredClone(steps); raw[0].before.dex = 33;
    assert.throws(() => validateTeachingObservation(raw, condition), /先天身法/);
    const half = structuredClone(steps); half[0].before.effective_dex = 25;
    assert.throws(() => validateTeachingObservation(half, condition), /有效身法/);
    condition.parameters.actor.properties.dex = 17;
    steps[0].before.dex = steps[0].after.dex = 17;
    steps[0].before.effective_dex = steps[0].after.effective_dex = 32;
    assert.equal(validateTeachingObservation(steps, condition).length, 1,
        '读取器核对实际配置，不把有效 32 自行修正成 33；是否授予由具体用例断言');
});

test('负贡献按实际扣费保留，不夹紧到零；重复授课仍必须接续原余额', () => {
    const { condition, steps } = fixture(true), p = condition.parameters;
    const grant = 'can_perform/danding-dao/kou';
    p.teacher.path = '/kungfu/class/riyue/qin';
    p.action = 'ask qin weibang about 环环相扣';
    p.actor.properties = { gongxian: 80, 'family/family_name': '日月神教', shen: -8000, str: 30 };
    p.actor.skills = { 'danding-dao': 80, force: 200 };
    p.monitored_grants = [grant]; p.known_issue = 'MA-020';
    p.teaching_expectations = [100, 0].map(paid => ({ grant, value: 1, contribution_spent: paid }));
    const before = { ...steps[0].before, contribution: 80, shen: -8000, effective_force: 100,
        family: '日月神教', grants: { [grant]: 0 }, skills: { ...p.actor.skills }, learned: {} };
    for (const [i, step] of steps.entries()) {
        step.teacher_program = p.teacher.path; step.teacher = p.teacher.path + '#2';
        step.command = p.action;
        step.before = structuredClone(i ? steps[i - 1].after : before);
        step.after = structuredClone(step.before);
        step.after.grants[grant] = 1; step.after.jing -= 12;
        step.after.contribution -= i ? 0 : 100;
    }
    const result = validateTeachingObservation(steps, condition);
    assert.deepEqual(steps.map(s => s.after.contribution), [-20, -20]);
    assert.deepEqual(result.map(s => s.contribution_spent), [100, 0]);
    assert.ok(result.every(s => s.known_issue === 'MA-020'));
    const clamped = structuredClone(steps); clamped[0].after.contribution = 0;
    assert.throws(() => validateTeachingObservation(clamped, condition), /贡献扣除/);
    const reset = structuredClone(steps); reset[1].before.contribution = 80;
    assert.throws(() => validateTeachingObservation(reset, condition), /重置或注入/);
});

test('真实轻功映射参与有效等级，身法仍只取基本轻功原始等级', () => {
    const { condition, steps } = fixture();
    const p = condition.parameters;
    p.actor.skills.dodge = 220; p.actor.skills['chuanyun-bu'] = 110;
    p.actor.mappings.dodge = 'chuanyun-bu'; p.actor.properties.dex = 23;
    for (const state of [steps[0].before, steps[0].after]) {
        state.skills.dodge = 220; state.skills['chuanyun-bu'] = 110;
        state.mappings.dodge = 'chuanyun-bu'; state.effective_dodge = 220;
        state.dex = 23; state.effective_dex = 45;
    }
    assert.equal(validateTeachingObservation(steps, condition)[0].acquired, true);
    const noMapped = structuredClone(steps); noMapped[0].before.effective_dodge = 110;
    assert.throws(() => validateTeachingObservation(noMapped, condition), /有效轻功/);
    const tooMuchDex = structuredClone(steps); tooMuchDex[0].before.effective_dex = 56;
    assert.throws(() => validateTeachingObservation(tooMuchDex, condition), /有效身法/);
});

test('命令返回 1 或成功文案不能代替领悟/贡献证据', () => {
    const { condition, steps } = fixture();
    steps[0].after.grants[badGrant] = 0;
    steps[0].messages.push({ category: 'vision', text: '你学会了破甲推山。' });
    assert.throws(() => validateTeachingObservation(steps, condition), /实际领悟/);
    steps[0].after.grants[badGrant] = 1;
    steps[0].after.contribution = 1;
    assert.throws(() => validateTeachingObservation(steps, condition), /贡献扣除/);
});

test('保留原错误领悟，不接受夹具纠正或提前授予', () => {
    const { condition, steps } = fixture();
    steps[0].after.grants[correctGrant] = 1;
    assert.throws(() => validateTeachingObservation(steps, condition), /悄悄纠正/);
    steps[0].after.grants[correctGrant] = 0;
    steps[0].before.grants[badGrant] = 1;
    assert.throws(() => validateTeachingObservation(steps, condition), /预写未声明领悟/);
});

test('重复询问不能重置贡献/学习进度、换人或靠缺样本通过', () => {
    const base = fixture(true);
    for (const mutate of [
        rows => { rows[1].before.contribution = 100; },
        rows => { rows[1].before.learned = {}; },
        rows => { rows[1].student = '/tests/teaching_actor#9'; },
        rows => { rows[1].teacher = '/kungfu/class/jueqing/chi#9'; },
    ]) {
        const rows = structuredClone(base.steps); mutate(rows);
        assert.throws(() => validateTeachingObservation(rows, base.condition), /重置或注入|换了/);
    }
    assert.throws(() => validateTeachingObservation(base.steps.slice(1), base.condition), /询问次数/);
});

test('拒绝样本保留消息与状态，未传授不应增加技能或熟练度', () => {
    const { condition, steps } = fixture();
    condition.parameters.expected = 'refused';
    condition.parameters.teaching_expectations = [{ grant: badGrant, value: 0, contribution_spent: 0,
        absent_grants: [correctGrant], response_contains: '贡献不够' }];
    steps[0].after = structuredClone(steps[0].before); steps[0].after.jing -= 10;
    steps[0].messages = [{ category: 'vision', text: '你作出的贡献不够，这招暂时还不能传你。' }];
    assert.equal(validateTeachingObservation(steps, condition)[0].acquired, false);
    steps[0].after.learned['tiexian-quan'] = 1;
    assert.throws(() => validateTeachingObservation(steps, condition), /未传授却改变学习进度/);
    steps[0].after.learned = {}; steps[0].messages = [];
    assert.throws(() => validateTeachingObservation(steps, condition), /拒绝原因/);
});

test('缺状态、错误教师、精神成本和配置差异明确失败，不填零', () => {
    const base = fixture();
    for (const mutate of [
        row => { delete row.after.grants[correctGrant]; },
        row => { delete row.after.learned; },
        row => { row.teacher_program = '/kungfu/class/riyue/zhao'; },
        row => { row.command = 'test_direct_teacher'; },
        row => { row.after.jing = row.before.jing; },
        row => { row.before.effective_force = 160; },
        row => { row.before.skills.force = 159; },
        row => { delete row.before.max_neili; },
    ]) {
        const rows = structuredClone(base.steps); mutate(rows[0]);
        assert.throws(() => validateTeachingObservation(rows, base.condition));
    }
});

test('区分已配置的当前内力与最大内力，缺观察或把两者混用时拒绝', () => {
    const { condition, steps } = fixture();
    condition.parameters.actor.properties.max_neili = 2000;
    condition.parameters.actor.properties.neili = 3000;
    steps[0].before.max_neili = steps[0].after.max_neili = 2000;
    steps[0].before.neili = steps[0].after.neili = 3000;
    assert.equal(validateTeachingObservation(steps, condition)[0].acquired, true);
    steps[0].before.max_neili = 3000;
    assert.throws(() => validateTeachingObservation(steps, condition), /初始内力与条件不同/);
});

test('原始轻功与有效轻功分别观察，不能把 240 原始等级当作 240 有效等级', () => {
    const { condition, steps } = fixture(true);
    condition.parameters.actor.skills.dodge = 240;
    for (const step of steps) for (const state of [step.before, step.after]) {
        state.skills.dodge = 240;
        state.effective_dodge = 120;
    }
    assert.equal(validateTeachingObservation(steps, condition).length, 2);
    const wrong = structuredClone(steps); wrong[0].before.effective_dodge = 240;
    assert.throws(() => validateTeachingObservation(wrong, condition), /有效轻功/);
    const missing = structuredClone(steps); delete missing[0].after.effective_dodge;
    assert.throws(() => validateTeachingObservation(missing, condition), /教学数值缺失/);
    const reset = structuredClone(steps); reset[1].before.effective_dodge = 119;
    assert.throws(() => validateTeachingObservation(reset, condition), /重置或注入/);
});

function sampleFixture() {
    const { condition, steps } = fixture(true);
    condition.id = 'teaching-fixture-repeat';
    const state = value => ({ object: steps[0].student,
        ...Object.fromEntries(['jing', 'neili', 'max_neili', 'str', 'skills', 'mappings']
            .map(key => [key, structuredClone(value[key])])) });
    return { condition, raw: {
        kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: 'observed',
        teaching: steps, before: [state(steps[0].before)], after: [state(steps.at(-1).after)],
        metrics: [{ jing_cost: 27 }],
    } };
}

test('教学分步状态必须与同一原始样本身份、首尾状态和公共资源账闭合', () => {
    const { raw, condition } = sampleFixture();
    assert.equal(validateTeachingRecord(raw, condition).length, 2);
    for (const [mutate, message] of [
        [r => { r.before[0].object = '/tests/teaching_actor#99'; }, /同一玩家/],
        [r => { r.after[0].jing++; }, /状态不一致/],
        [r => { r.after[0].skills['tiexian-quan'] = 100; }, /状态不一致/],
        [r => { r.metrics[0].jing_cost = 0; }, /公共资源账/],
        [r => { r.outcome = 'refused'; }, /样本终态/],
        [r => { r.teaching = r.teaching.slice(0, 1); }, /询问次数/],
    ]) {
        const changed = structuredClone(raw); mutate(changed);
        assert.throws(() => validateTeachingRecord(changed, condition), message);
    }
});

test('询问返回成功但未获领悟仍为拒绝；错误原样留存而不伪造成正常状态', () => {
    const { raw, condition } = sampleFixture();
    condition.parameters.teaching_expectations = [{ grant: badGrant, value: 0, contribution_spent: 0,
        absent_grants: [correctGrant], response_contains: '贡献不够' }];
    condition.parameters.expected = 'refused';
    raw.teaching.length = 1;
    const first = raw.teaching[0];
    first.after = structuredClone(first.before); first.after.jing -= 11;
    first.messages = [{ category: 'vision', text: '你作出的贡献不够。' }];
    raw.after = [{ object: first.student, ...structuredClone(first.after) }];
    raw.metrics[0].jing_cost = 11; raw.outcome = 'refused';
    assert.equal(validateTeachingRecord(raw, condition)[0].acquired, false);
    raw.outcome = 'observed';
    assert.throws(() => validateTeachingRecord(raw, condition), /样本终态/);
    assert.equal(validateTeachingRecord({ kind: 'sample', method: 'teaching',
        condition_id: condition.id, outcome: 'error' }, condition), undefined);
});

// Synthetic records test evidence validation only, not game teaching behavior.
function bookFixture({ wrong = false, refuse = false } = {}) {
    const { condition, steps: original } = fixture();
    const p = condition.parameters, perform = 'can_perform/jiuyin-shengong/zhi';
    const permits = ['zhi', 'shou', 'zhang'].map(s => `can_learn/jiuyin-shengong/${s}`);
    p.teacher.path = '/kungfu/class/taohua/huang';
    p.action = 'ask huang yaoshi about 九阴神指';
    p.monitored_grants = [perform, ...permits];
    p.actor.properties.gongxian = 0;
    p.known_issue = null;
    p.expected = wrong ? 'refused' : 'observed';
    const offer = { path: '/clone/lonely/book/zhenjing' + (wrong ? 2 : 1),
        id: 'zhenjing ' + (wrong ? 'xiace' : 'shangce'), consumed: !wrong };
    p.teaching_expectations = [{ action: `give ${offer.id} to huang yaoshi`, offer,
        grant: permits[0], value: wrong ? 0 : 1, contribution_spent: 0, may_improve_skills: false,
        grants_after: Object.fromEntries(permits.map(key => [key, wrong ? 0 : 1])) },
    { grant: perform, value: wrong || refuse ? 0 : 1, contribution_spent: 0 }];
    let current = { ...original[0].before, contribution: 0,
        grants: Object.fromEntries(p.monitored_grants.map(key => [key, 0])) };
    const steps = p.teaching_expectations.map((e, i) => {
        const before = structuredClone(current), after = structuredClone(current);
        after.grants[e.grant] = e.value;
        Object.assign(after.grants, e.grants_after);
        if (i) after.jing -= 12;
        const step = { ...original[0], teacher_program: p.teacher.path, teacher: p.teacher.path + '#2',
            before, after, command: e.action ?? p.action };
        if (e.offer) step.offered_item = { program: offer.path, object: offer.path, clone: 0,
            holder_before: step.student, exists_after: wrong ? 1 : 0,
            holder_after: wrong ? step.student : '' };
        current = after;
        return step;
    });
    return { condition, steps, permits, perform };
}

test('交书与询问分别观察，三项许可不冒充三项绝招；错书保留原物', () => {
    const success = bookFixture();
    const result = validateTeachingObservation(success.steps, success.condition);
    assert.deepEqual(result.map(s => s.command_kind), ['give', 'ask']);
    assert.deepEqual(result.map(s => s.jing_spent), [0, 12]);
    assert.equal(success.steps[0].after.grants[success.perform], 0);
    assert.equal(success.steps[1].after.grants[success.perform], 1);
    const partial = bookFixture({ refuse: true });
    assert.deepEqual(validateTeachingObservation(partial.steps, partial.condition).map(s => s.advanced), [true, false]);
    const wrong = bookFixture({ wrong: true });
    assert.deepEqual(validateTeachingObservation(wrong.steps, wrong.condition).map(s => s.advanced), [false, false]);
    assert.equal(wrong.steps[0].offered_item.holder_after, wrong.steps[0].student);
});

test('交书缺观察、伪克隆、未收书、缺许可或夹带奖励均不能通过', () => {
    const base = bookFixture();
    for (const [mutate, pattern] of [
        [s => { delete s[0].offered_item; }, /缺少物品观察/],
        [s => { s[0].offered_item.object += '#9'; }, /唯一秘籍/],
        [s => { s[0].offered_item.clone = 1; }, /不是克隆/],
        [s => { s[0].offered_item.exists_after = 1; }, /消耗状态/],
        [s => { s[0].offered_item.holder_before = '/tests/other#9'; }, /不在学生/],
        [s => { s[0].after.grants[base.permits[1]] = 0; }, /许可写入/],
        [s => { s[0].after.grants[base.perform] = 1; }, /非目标领悟/],
        [s => { s[0].after.jing--; }, /不扣精神/],
        [s => { s[0].after.neili--; }, /不扣内力/],
        [s => { s[0].after.skills.force++; }, /技能等级/],
        [s => { s[1].before.grants[base.permits[0]] = 0; }, /重置或注入/],
        [s => { s[1].offered_item = s[0].offered_item; }, /未声明的交书/],
    ]) {
        const steps = structuredClone(base.steps); mutate(steps);
        assert.throws(() => validateTeachingObservation(steps, base.condition), pattern);
    }
    const wrong = bookFixture({ wrong: true });
    wrong.steps[0].offered_item.holder_after = '';
    assert.throws(() => validateTeachingObservation(wrong.steps, wrong.condition), /拒收秘籍/);
});

function diagramFixture(length = 11, availablePotential = 1000) {
    const grant = 'can_perform/taiji-quan/tu';
    const p = { teacher: { path: '/kungfu/class/wudang/zhang' },
        action: 'ask zhang sanfeng about 太极图',
        actor: { properties: { gongxian: 3000, 'family/family_name': '武当派', shen: 250000,
            str: 30, max_jingli: 1000, potential: 200 + availablePotential, learned_points: 200 },
            skills: { 'taiji-quan': 250, 'taiji-shengong': 300, taoism: 300, force: 0 }, mappings: {} },
        monitored_grants: [grant], known_issue: null, grant_completion_value: 10,
        teaching_expectations: [], expected: availablePotential >= 100 ? 'observed' : 'refused' };
    const condition = { id: 'diagram-manual-fixture', method: 'teaching', parameters: p };
    let current = { contribution: 3000, jing: 10000, neili: 6000, max_neili: 6000,
        max_jingli: 1000, potential: p.actor.properties.potential, learned_points: 200,
        effective_force: 0, effective_dodge: 0, shen: 250000, str: 30, grants: { [grant]: 0 },
        skills: structuredClone(p.actor.skills), learned: {}, mappings: {}, family: '武当派', master_id: null };
    const steps = [];
    for (let i = 0; i < length; i++) {
        const before = structuredClone(current), after = structuredClone(current);
        const advances = before.grants[grant] < 10 && before.potential - before.learned_points >= 100;
        if (advances) { after.grants[grant]++; after.learned_points += 100; }
        const improves = advances && after.grants[grant] === 10;
        if (improves) {
            after.contribution -= 3000;
            after.skills['taiji-quan']++; after.learned['taiji-quan'] = 1000;
        }
        after.jing -= 12;
        p.teaching_expectations.push({ grant, value: after.grants[grant],
            contribution_spent: improves ? 3000 : 0, learned_points_spent: advances ? 100 : 0,
            may_improve_skills: improves });
        steps.push({ student: '/tests/teaching_actor#1', teacher: '/kungfu/class/wudang/zhang#2',
            teacher_program: p.teacher.path, command: p.action, command_accepted: 1, elapsed: 0.01,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [], before, after });
        current = after;
    }
    const sampleState = value => ({ object: steps[0].student,
        ...Object.fromEntries(['jing', 'neili', 'max_neili', 'str', 'skills', 'mappings']
            .map(key => [key, structuredClone(value[key])])) });
    const raw = { kind: 'sample', method: 'teaching', condition_id: condition.id, outcome: p.expected,
        teaching: steps, before: [sampleState(steps[0].before)], after: [sampleState(steps.at(-1).after)],
        metrics: [{ jing_cost: length * 12 }] };
    return { condition, steps, raw, grant };
}

test('递进领悟区分进展与完成，第十层才授予完整效果、再次询问不扣资源', () => {
    const { condition, raw } = diagramFixture();
    const summaries = validateTeachingRecord(raw, condition);
    assert.equal(summaries.filter(s => s.advanced).length, 10);
    assert.equal(summaries.filter(s => s.acquired).length, 1);
    assert.ok(summaries[9].acquired);
    assert.ok(summaries.slice(0, 9).every(s => !s.complete && !s.already_known));
    assert.ok(summaries[10].already_known && summaries[10].complete);
    assert.equal(summaries.reduce((sum, s) => sum + s.learned_points_spent, 0), 1000);
    assert.equal(summaries.reduce((sum, s) => sum + s.contribution_spent, 0), 3000);
    assert.equal(summaries[10].remaining_potential, 0);
    assert.equal(raw.teaching[10].after.learned_points, 1200);
});

test('九层后潜能不足仍保留九层，不把命令受理、部分进展或零消息当完整学会', () => {
    const partial = diagramFixture(10, 900);
    const summaries = validateTeachingRecord(partial.raw, partial.condition);
    assert.equal(summaries.filter(s => s.advanced).length, 9);
    assert.ok(summaries.every(s => !s.acquired && !s.complete));
    assert.equal(summaries.at(-1).grant_after, 9);
    assert.equal(summaries.at(-1).learned_points_spent, 0);
    assert.ok(summaries.every(s => s.contribution_spent === 0));
    assert.equal(partial.raw.outcome, 'observed');
    const insufficient = diagramFixture(1, 99);
    assert.equal(validateTeachingRecord(insufficient.raw, insufficient.condition)[0].advanced, false);
    assert.equal(insufficient.raw.outcome, 'refused');
    assert.equal(insufficient.steps[0].command_accepted, 1);
    assert.deepEqual(insufficient.steps[0].messages, [], '不把原 write 的提示伪填进消息 apply');
});

test('递进教学不接受预写层数、少扣潜能、改总潜能、提前奖励或扣贡献', () => {
    const base = diagramFixture();
    for (const [mutate, pattern] of [
        [s => { s[0].before.grants[base.grant] = 9; }, /预写未声明领悟/],
        [s => { s[0].after.learned_points--; }, /潜能学习点支出/],
        [s => { s[0].after.potential -= 100; }, /总潜能/],
        [s => { s[0].after.contribution--; }, /贡献扣除/],
        [s => { s[0].after.skills['taiji-quan']++; }, /技能等级/],
        [s => { s[0].after.learned['taiji-quan'] = 1; }, /学习进度/],
        [s => { delete s[0].before.max_jingli; }, /数值缺失/],
        [s => { s[0].before.learned_points = 0; }, /初始教学资源/],
        [s => { s[10].after.learned_points += 100; }, /潜能学习点支出/],
    ]) {
        const steps = structuredClone(base.steps); mutate(steps);
        assert.throws(() => validateTeachingObservation(steps, base.condition), pattern);
    }
});

// Hand-authored records exercise the reader only, not the original teacher.
function damoFixture(order) {
    const key = s => 'can_perform/damo-jian/' + s;
    const qingxin = { action: 'ask da mo about 达摩清心剑', grant: key('luan'), value: 1,
        contribution_spent: 0, may_improve_skills: true, reward_skill: 'force', absent_grants: [key('qingxin')] };
    const luan = { action: 'ask da mo about 达摩乱气剑', grant: key('qingxin'), value: 1,
        contribution_spent: 0, may_improve_skills: true, reward_skill: 'sword' };
    const expectations = order === 'qingxin-repeat' ? [qingxin, structuredClone(qingxin)]
        : order === 'qingxin-luan' ? [qingxin, luan]
            : [luan, { action: qingxin.action, grant: key('luan'), value: 0,
                contribution_spent: 0, may_improve_skills: false }];
    const p = { teacher: { path: '/kungfu/class/shaolin/da-mo' }, action: expectations[0].action,
        actor: { skills: { force: 100, sword: 100, 'damo-jian': 200 }, mappings: {}, properties: {
            gongxian: 0, shen: 120000, str: 30, 'family/family_name': '少林派',
            'family/master_id': 'da mo', 'family/master_name': '达摩老祖', 'reborn/family_name': 0 } },
        monitored_grants: ['qingxin', 'luan', 'shang', 'zhe'].map(key),
        known_issue: 'MA-017', expected: 'observed', teaching_expectations: expectations };
    const condition = { method: 'teaching', parameters: p };
    let current = { ...fixture().steps[0].before, contribution: 0, shen: 120000, effective_force: 50,
        grants: Object.fromEntries(p.monitored_grants.map(g => [g, 0])), skills: structuredClone(p.actor.skills),
        family: '少林派', master_id: 'da mo', master_name: '达摩老祖', reborn_family: 0 };
    const steps = [];
    for (const e of expectations) {
        const before = structuredClone(current), after = structuredClone(current);
        after.grants[e.grant] = e.value;
        after.jing -= 12;
        if (e.reward_skill) after.skills[e.reward_skill]++;
        after.effective_force = Math.trunc(after.skills.force / 2);
        steps.push({ student: '/tests/teaching_actor#1', teacher: '/kungfu/class/shaolin/da-mo#2',
            teacher_program: p.teacher.path, command: e.action, command_accepted: 1, elapsed: 0.01,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [], before, after });
        current = after;
    }
    return { condition, steps, key };
}

test('不同主题连续询问保留同一角色状态，错位和重复奖励不等于新领悟', () => {
    const forward = damoFixture('qingxin-luan');
    assert.deepEqual(validateTeachingObservation(forward.steps, forward.condition).map(s => s.advanced), [true, true]);
    const reverse = damoFixture('luan-qingxin');
    assert.deepEqual(validateTeachingObservation(reverse.steps, reverse.condition).map(s => s.advanced), [true, false]);
    assert.equal(reverse.steps[1].after.grants[reverse.key('luan')], 0);
    const repeat = damoFixture('qingxin-repeat');
    assert.deepEqual(validateTeachingObservation(repeat.steps, repeat.condition).map(s => s.advanced), [true, false]);
    assert.equal(repeat.steps[1].after.skills.force - repeat.steps[0].before.skills.force, 2);
    assert.equal(repeat.steps[1].after.grants[repeat.key('qingxin')], 0);
});

test('私有教学核对师父姓名与转世资格；拒绝省略奖励、换主题或改写其他领悟', () => {
    const base = damoFixture('qingxin-luan');
    for (const [mutate, pattern] of [
        [s => { delete s[0].before.master_name; }, /初始师承/],
        [s => { s[0].before.reborn_family = '少林派'; }, /初始师承/],
        [s => { s[0].after.master_name = '另一人'; }, /改变了师承/],
        [s => { s[1].command = s[0].command; }, /原教学交互命令/],
        [s => { s[1].after.grants[base.key('luan')] = 0; }, /非目标领悟/],
        [s => { s[0].after.skills.force = s[0].before.skills.force; }, /技能奖励/],
        [s => { s[1].before.grants[base.key('luan')] = 0; }, /重置或注入/],
    ]) {
        const steps = structuredClone(base.steps); mutate(steps);
        assert.throws(() => validateTeachingObservation(steps, base.condition), pattern);
    }
    const repeat = damoFixture('qingxin-repeat');
    repeat.steps[1].after.skills.force = repeat.steps[1].before.skills.force;
    assert.throws(() => validateTeachingObservation(repeat.steps, repeat.condition), /技能奖励/);
});

function renPalmFixture() {
    const key = suffix => `can_perform/guzhuo-zhang/${suffix}`;
    const levels = { 'guzhuo-zhang': 220, strike: 220, 'martial-cognize': 0 };
    const properties = { 'family/family_name': '日月神教', gongxian: 4000, shen: -200000,
        str: 30, max_neili: 3600, neili: 3600 };
    const p = { teacher: { path: '/kungfu/class/riyue/ren' }, action: 'ask ren woxing about 大巧若拙',
        actor: { skills: { ...levels, force: 600 }, mappings: {}, properties },
        monitored_grants: ['zhuo', 'yu', 'zhen'].map(key), known_issue: null,
        expected: 'observed', teaching_expectations: [] };
    let current = { ...fixture().steps[0].before, contribution: 4000, shen: -200000,
        effective_force: 300, neili: 3600, max_neili: 3600, family: '日月神教',
        grants: Object.fromEntries(p.monitored_grants.map(g => [g, 0])),
        skills: structuredClone(p.actor.skills), learned: {} };
    const steps = [];
    for (const [id, topic, paid, increases] of [
        ['zhuo', '大巧若拙', 600, 1], ['yu', '大智若愚', 1200, 1],
        ['zhen', '反璞归真', 2200, 3], ['zhen', '反璞归真', 0, 0],
    ]) {
        const before = structuredClone(current), after = structuredClone(current);
        const beforeLevels = { ...levels };
        levels['guzhuo-zhang'] += increases; levels.strike += increases;
        if (increases) levels['martial-cognize']++;
        const expected = { action: `ask ren woxing about ${topic}`, grant: key(id), value: 1,
            contribution_spent: paid, skills_before: beforeLevels, skills_after: { ...levels },
            ...(increases ? { learned_after: { 'guzhuo-zhang': 0, strike: 0, 'martial-cognize': 0 } } : {}) };
        p.teaching_expectations.push(expected);
        after.contribution -= paid; after.jing -= 12; after.grants[key(id)] = 1;
        Object.assign(after.skills, levels);
        if (increases) Object.assign(after.learned, expected.learned_after);
        steps.push({ student: '/tests/teaching_actor#1', teacher: '/kungfu/class/riyue/ren#2',
            teacher_program: p.teacher.path, command: expected.action, command_accepted: 1, elapsed: 0.01,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [], before, after });
        current = after;
    }
    return { condition: { method: 'teaching', parameters: p }, steps, key };
}

test('连续掌法教学观察前两次奖励与最后三次奖励，不把第三问初态重置为初始等级', () => {
    const { condition, steps, key } = renPalmFixture();
    const result = validateTeachingObservation(steps, condition);
    assert.deepEqual(result.map(s => s.acquired), [true, true, true, false]);
    assert.deepEqual(result.map(s => s.contribution_spent), [600, 1200, 2200, 0]);
    assert.equal(steps[2].before.skills['guzhuo-zhang'], 222);
    assert.equal(steps[2].after.skills['guzhuo-zhang'], 225);
    assert.equal(steps[3].after.contribution, 0);
    assert.equal(steps[2].before.grants[key('zhen')], 0);
    for (const [mutate, message] of [
        [rows => { rows[0].after.skills['guzhuo-zhang'] = 220; }, /连续教学技能状态/],
        [rows => { rows[2].before.skills['guzhuo-zhang'] = 220; }, /重置或注入/],
        [rows => { rows[2].after.skills['guzhuo-zhang'] = 223; }, /连续教学技能状态/],
        [rows => { delete rows[2].after.learned.strike; }, /连续教学技能状态/],
        [rows => { rows[2].before.grants[key('zhuo')] = 0; }, /重置或注入/],
        [rows => { rows[3].after.contribution = -2200; }, /贡献扣除/],
    ]) {
        const copy = structuredClone(steps); mutate(copy);
        assert.throws(() => validateTeachingObservation(copy, condition), message);
    }
});
