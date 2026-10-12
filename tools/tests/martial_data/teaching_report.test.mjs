import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeTeachingRows, teachingMarkdown, validateTeachingPlan } from './teaching_report.mjs';

test('后续扩展教学范围不改写旧系列，但旧条件本身仍必须严格一致', () => {
    const old = [{ id: 'old', samples: 2, parameters: { threshold: 10 } }];
    const expanded = [...structuredClone(old), { id: 'new', samples: 2 }];
    validateTeachingPlan(old, expanded);
    validateTeachingPlan(expanded, expanded);
    assert.throws(() => validateTeachingPlan([], expanded), /为空/);
    assert.throws(() => validateTeachingPlan([...old, ...old], expanded), /重复/);
    assert.throws(() => validateTeachingPlan([{ id: 'unknown' }], expanded), /未核对/);
    const changed = structuredClone(old); changed[0].parameters.threshold = 9;
    assert.throws(() => validateTeachingPlan(changed, expanded), /版本不同/);
    assert.throws(() => validateTeachingPlan([{ ...old[0], samples: 1 }], expanded), /版本不同/);
});

function fixture() {
    const grant = 'can_perform/example/test';
    const condition = { id: 'teaching-fixture-grant', entry_id: 'teacher:ask', samples: 1,
        method: 'teaching', parameters: { topic: '测试招式', teacher: { path: '/kungfu/class/example/teacher' },
            action: 'ask teacher about 测试招式', expected: 'observed', known_issue: 'MA-test',
            actor: { properties: { gongxian: 100, 'family/family_name': '测试门派', shen: 100, str: 30 },
                skills: { force: 100 }, mappings: {} }, monitored_grants: [grant],
            teaching_expectations: [{ grant, value: 1, contribution_spent: 100 }] } };
    const before = { contribution: 100, jing: 1000, neili: 1000, max_neili: 1000,
        max_jingli: 1000, potential: 1000, learned_points: 0, effective_force: 50,
        effective_dodge: 0, shen: 100, str: 30, grants: { [grant]: 0 },
        skills: { force: 100 }, learned: {}, mappings: {}, family: '测试门派' };
    const after = structuredClone(before); after.contribution = 0; after.jing = 988; after.grants[grant] = 1;
    const snapshot = value => ({ ...structuredClone(value), object: '/tests/teaching_actor#1',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, qi: 1000, eff_qi: 1000, eff_jing: 1000 });
    const raw = { kind: 'sample', condition_id: condition.id, method: 'teaching', outcome: 'observed', elapsed: 0.01,
        before: [snapshot(before), snapshot(before)], after: [snapshot(after), snapshot(before)],
        metrics: [{ jing_cost: 12 }, {}], teaching: [{ student: '/tests/teaching_actor#1',
            teacher: '/kungfu/class/example/teacher#2', teacher_program: condition.parameters.teacher.path,
            command: condition.parameters.action, command_accepted: 1, elapsed: 0.01, before, after,
            messages: [], message_scope: 'receive_message_apply_input_not_full_transcript' }] };
    return { manifest: { fingerprint: 'test', identity: { conditions: [condition] } },
        rows: [{ condition_id: condition.id, index: 0, outcome: 'observed', raw, raw_sha256: 'test' }] };
}

test('教学摘要区分样本、询问、教师与已知错误，不将授课报告当武学效果', () => {
    const { manifest, rows } = fixture();
    const report = summarizeTeachingRows(manifest, rows);
    assert.deepEqual(report.totals, { teachers: 1, groups: 1, topics: 1,
        conditions: 1, samples: 1, observed: 1, refused: 0, steps: 1, asks: 1, gives: 0, learns: 0, learning_steps: 0 });
    assert.deepEqual(report.teachers[0].issues, ['MA-test']);
    assert.deepEqual(report.kinds, [{ kind: 'ability_grant', conditions: 1, samples: 1, observed: 1, refused: 0 }]);
    assert.equal(report.conditions[0].contribution_spent_per_step.mean, 100);
    assert.equal(report.conditions[0].jing_spent_per_step.mean, 12);
    assert.match(teachingMarkdown(report), /不代表正常学会或能够施展/);
});

test('获得许可单列，不能把其样本误报为绝招领悟或实际学习', () => {
    const { manifest, rows } = fixture();
    manifest.identity.conditions[0].parameters.teaching_kind = 'learning_permission';
    const report = summarizeTeachingRows(manifest, rows);
    assert.equal(report.conditions[0].kind, 'learning_permission');
    assert.deepEqual(report.kinds, [{ kind: 'learning_permission', conditions: 1, samples: 1, observed: 1, refused: 0 }]);
    assert.match(teachingMarkdown(report), /不证明技能已学会/);
});

test('交书计数与询问分列，许可样本不能统称学会绝招', () => {
    const { manifest, rows } = fixture();
    const p = manifest.identity.conditions[0].parameters, raw = rows[0].raw;
    const permit = 'can_learn/example/test', book = '/clone/lonely/book/zhenjing1';
    p.teaching_kind = 'book_teaching';
    p.action = 'give zhenjing shangce to teacher';
    p.monitored_grants = [permit];
    p.teaching_expectations = [{ grant: permit, value: 1, contribution_spent: 0,
        offer: { path: book, id: 'zhenjing shangce', consumed: true }, may_improve_skills: false }];
    const step = raw.teaching[0]; step.command = p.action;
    step.before.grants = { [permit]: 0 }; step.after.grants = { [permit]: 1 };
    step.after.jing = step.before.jing; step.after.contribution = step.before.contribution;
    step.offered_item = { program: book, object: book, clone: 0, holder_before: step.student,
        exists_after: 0, holder_after: '' };
    raw.after[0].jing = step.after.jing; raw.metrics[0].jing_cost = 0;
    const report = summarizeTeachingRows(manifest, rows);
    assert.equal(report.totals.steps, 1);
    assert.equal(report.totals.asks, 0);
    assert.equal(report.totals.gives, 1);
    assert.equal(report.teachers[0].gives, 1);
    assert.equal(report.kinds[0].kind, 'book_teaching');
    assert.match(teachingMarkdown(report), /授课被拒也属于部分进展/);
});

test('教学摘要拒绝缺样本、重复、资源不符和错标终态', () => {
    const { manifest, rows } = fixture();
    assert.throws(() => summarizeTeachingRows(manifest, []), /尚未采满/);
    const repeated = structuredClone(manifest); repeated.identity.conditions[0].samples = 2;
    assert.throws(() => summarizeTeachingRows(repeated, [...rows, ...rows]), /重复/);
    const changed = structuredClone(rows); changed[0].raw.metrics[0].jing_cost = 1;
    assert.throws(() => summarizeTeachingRows(manifest, changed), /资源账/);
    const wrong = structuredClone(rows); wrong[0].outcome = 'refused';
    assert.throws(() => summarizeTeachingRows(manifest, wrong), /终态/);
});
