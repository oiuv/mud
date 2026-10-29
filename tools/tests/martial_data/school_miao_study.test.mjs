import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { miaoStudyConditions, miaoStudyAfter, validateMiaoStudyRecord } from './school_miao_study_cases.mjs';
import { validateSchoolSceneRecord, sceneEntries } from './school_scene_cases.mjs';
const read = p => readFileSync(join(root, p), 'utf8');
const cases = miaoStudyConditions(null, read), find = suffix => cases.find(c => c.id.endsWith(suffix));
function row(c, granted = true, busy = 1) {
    const p = c.parameters, before = [p.actor, p.target].map((cfg, i) => ({
        ...structuredClone(cfg.properties), object: '/tests/' + (i ? 'actor#1' : 'teaching_actor#0'),
        cultivation: { 'family/family_name': cfg.properties['family/family_name'] },
        userp: 1, playerp: 1, interactive: 1, living: 1, ghost: 0, wizardp: 0,
        skills: structuredClone(cfg.skills), learned: {}, mappings: {}, preparations: {},
        busy: cfg.busy ?? null, temp: { apply: { armor: 100 } },
        tan_grant: cfg.properties['can_perform/panlong-zhao/tan'],
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([k, v]) => [k, Math.trunc(v / 2)])),
        effective_str: cfg.properties.str + Math.trunc(Math.max(...['claw', 'strike'].map(k => cfg.skills[k] ?? 0)) / 10),
    }));
    const a = miaoStudyAfter(before[0], p, granted, busy), r = {
        method: 'scene', outcome: p.expected, before, immediate: [a, structuredClone(before[1])],
        launches: [], attacks: [], passives: [], interfaces: [], directs: [],
        metrics: [{ jing_cost: p.expected === 'refused' ? 0 : p.ability === 'canwu' ? 25 : 30 }, {}],
        reason: p.refusal, command_accepted: Number(p.expected === 'observed'),
        study_setup: { room_before: '/tests/runner', room_after: p.room, move_result: 1,
            before: structuredClone(before[0]), after: structuredClone(before[0]) },
        study_step: { command: p.action, room: p.room, function_owner: p.room + '.c',
            accepted: Number(p.expected === 'observed'), reason: p.refusal, messages: [],
            before: structuredClone(before[0]), after: structuredClone(a) },
    };
    r.after = structuredClone(r.immediate); return r;
}
function alterAfter(r, fn) {
    fn(r.immediate[0]); r.study_step.after = structuredClone(r.immediate[0]); r.after = structuredClone(r.immediate);
}
test('书房30条件1726正式/60烟雾，两原房间入口独立且场景消费者有实际接线', () => {
    assert.equal(cases.length, 30); assert.equal(cases.reduce((s, c) => s + c.samples, 0), 1726);
    assert.equal(miaoStudyConditions(null, read, { smoke: true }).reduce((s, c) => s + c.samples, 0), 60);
    assert.equal(sceneEntries(cases).length, 2);
    for (const c of cases) validateSchoolSceneRecord(row(c), c);
    assert.throws(() => miaoStudyConditions(null, p => read(p) + ' '), /重新审阅/);
    const execution = read('tools/tests/martial_data/execution.mjs');
    assert.match(execution, /startsWith\('school-scene-miao-study-'\)/);
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.match(runner, /finite original Miao room command/);
    assert.match(runner, /step\["accepted"\] = result/);
});
test('参悟两随机分支都扣25精神/10潜能且忙乱2，不强制每次领悟', () => {
    const c = find('canwu-l200');
    const failure = row(c, false); validateMiaoStudyRecord(failure, c);
    assert.equal(failure.immediate[0].tan_grant, 0);
    assert.deepEqual(failure.immediate[0].learned, {});
    assert.equal(failure.immediate[0].learned_points - failure.before[0].learned_points, 10);
    const success = row(c); validateMiaoStudyRecord(success, c);
    assert.equal(success.immediate[0].skills.claw, 203);
    assert.equal(success.immediate[0].skills['panlong-zhao'], 203);
    assert.equal(success.immediate[0].skills['martial-cognize'], 1);
    for (const mutate of [r => alterAfter(r, a => { a.jing++; }), r => alterAfter(r, a => { a.learned_points--; }),
        r => alterAfter(r, a => { a.busy = 1; }), r => alterAfter(r, a => { a.skills.claw = 204; })]) {
        const r = row(c); mutate(r); assert.throws(() => validateMiaoStudyRecord(r, c));
    }
});
test('原经验上限逐次检查、余量清零和800级部分熟练不能机械替换为固定升三级', () => {
    const high = row(find('canwu-l800'));
    assert.equal(high.immediate[0].skills.claw, 800);
    assert.equal(high.immediate[0].learned.claw, 500001);
    const blocked = row(find('canwu-growth-blocked'));
    assert.equal(blocked.immediate[0].skills.claw, 200);
    assert.equal(blocked.immediate[0].learned.claw, undefined);
    assert.equal(blocked.immediate[0].skills['martial-cognize'], 1, '原无条件修养提升仍保留');
    const old = row(find('canwu-cognize500')); assert.equal(old.immediate[0].skills['martial-cognize'], 500);
    assert.equal(old.immediate[0].learned['martial-cognize'], 250001);
});
test('观图原先天悟性/修养加成、150级分别封顶和无进度支出要独立', () => {
    const basic = row(find('think-l100')); assert.equal(basic.immediate[0].learned.strike, 28);
    const cognize = row(find('think-cognize500')); assert.equal(cognize.immediate[0].learned.strike, 55);
    const one = row(find('think-only-basic')); assert.equal(one.immediate[0].learned['chongtian-zhang'], undefined);
    assert.equal(one.immediate[0].learned.strike, 22);
    const blocked = row(find('think-growth-blocked')); assert.deepEqual(blocked.immediate[0].learned, {});
    assert.equal(blocked.metrics[0].jing_cost, 30);
    for (const busy of [0, 1]) validateMiaoStudyRecord(row(find('think-l30'), false, busy), find('think-l30'));
    const r = row(find('think-l30')); alterAfter(r, a => { a.busy = 2; });
    assert.throws(() => validateMiaoStudyRecord(r, find('think-l30')));
});
test('错误房间/来源/初态、重复赋值、旁观者变化和隐藏攻击不能当作原始学习', () => {
    const c = find('canwu-l200');
    for (const mutate of [r => { r.study_step.function_owner = '/tests/fake'; },
        r => { r.study_step.room = '/tests/runner'; }, r => { r.study_step.command = 'study book'; },
        r => { r.study_setup.after.tan_grant = 1; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.directs.push({ damage: 1 }); }, r => { r.before[0].wizardp = 1; },
        r => { r.immediate[1].jing--; r.after = structuredClone(r.immediate); }]) {
        const r = row(c); mutate(r); assert.throws(() => validateMiaoStudyRecord(r, c));
    }
    const no = find('canwu-jing29'), r = row(no); alterAfter(r, a => { a.tan_grant = 1; });
    assert.throws(() => validateMiaoStudyRecord(r, no));
});
