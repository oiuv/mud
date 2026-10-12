import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolRelations } from './school_relations.mjs';
import { createSeries, openSeries } from './ledger.mjs';
import { validateRecord, validateExpectedOutcomes } from './execution.mjs';
import { distribution } from './statistics.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { summarizeTeachingRows, validateTeachingPlan } from './teaching_report.mjs';
import { gumuEffectiveAttribute } from './school_gumu_cultivation_cases.mjs';
import { gumuAcquisitionLearningLessons, gumuAcquisitionLearningSources,
    gumuAcquisitionLearningReviewed, gumuAcquisitionLearningFixtureRequirements,
    gumuAcquisitionLearningConditions, gumuAcquisitionLearningDecision,
    validateGumuAcquisitionLearningRecord, gumuAcquisitionLearningEffects } from './gumu_acquisition_learning_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const cases = gumuAcquisitionLearningConditions(relations, catalog, read);
const smoke = gumuAcquisitionLearningConditions(relations, catalog, read, { smoke: true });
const pick = suffix => {
    const c = cases.find(c => c.id === 'teaching-gumu-acquisition-' + suffix); assert.ok(c, suffix); return c;
};
const entries = matrix => [...new Map(matrix.map(c => [c.entry_id, c.parameters.teaching_entry])).values()];
const wall = 'can_learn/yunv-xinjing/wall';

// Fabricated records test only the offline reader; never append them to a raw
// sample ledger or call them original NPC preparation / real driver acceptance.
function fixture(c, cost = 12) {
    const p = c.parameters, a = p.actor, q = a.properties;
    const teacherSkills = Object.fromEntries([...read(p.teacher.path.slice(1) + '.c')
        .matchAll(/set_skill\("([^"]+)",\s*(\d+)\)/g)].map(m => [m[1], Number(m[2])]));
    const effective = id => Math.trunc((a.skills[id] ?? 0) / 2) + (a.skills[a.mappings[id]] ?? 0);
    let before = { contribution: q.gongxian, balance: 0, score: 0,
        jing: q.jing, neili: q.neili, max_neili: q.max_neili, max_jingli: 0,
        potential: q.potential, learned_points: q.learned_points,
        effective_force: effective('force'), effective_dodge: effective('dodge'),
        effective_dex: q.dex + Math.trunc(a.skills.dodge / 10),
        effective_int: q.int + Math.trunc(a.skills.literate / 10),
        effective_str: q.str + Math.trunc(a.skills.unarmed / 10),
        shen: q.shen, str: q.str, con: q.con, int: q.int, dex: q.dex,
        gender: q.gender, sadly: q['static/sadly'], character: q.character,
        combat_exp: q.combat_exp, grants: Object.fromEntries(p.monitored_grants.map(g => [g, q[g] ?? 0])),
        skills: { ...a.skills }, learned: {}, mappings: { ...a.mappings }, family: q['family/family_name'],
        master_id: q['family/master_id'], master_name: q['family/master_name'], reborn_family: null };
    let total = 0;
    const steps = p.teaching_expectations.map(e => {
        const after = structuredClone(before), spent = e.result === 'public_refused' ? 0 : cost;
        after.jing -= spent; total += spent;
        after.skills = { ...e.skills_after }; after.learned = { ...e.learned_after };
        after.grants = { ...e.grants_after };
        const step = { teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
            teacher_skills: { ...teacherSkills },
            student: '/tests/teaching_actor#1', command: e.action, command_accepted: 1, elapsed: 0.001,
            before: structuredClone(before), after, message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: [{ category: e.result === 'public_refused' ? 'write' : 'say', text: e.response_contains }] };
        before = after; return step;
    });
    const snapshot = (point, side = 0) => ({ object: side ? '/tests/teaching_actor#3' : steps[0].student,
        id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, wizardp: 0,
        living: 1, ghost: 0, busy: null, qi: 10000, eff_qi: 10000, max_qi: 10000,
        jing: point.jing, eff_jing: 10000, max_jing: 10000, neili: point.neili, max_neili: point.max_neili,
        str: point.str, con: point.con, int: point.int, dex: point.dex, shen: point.shen,
        combat_exp: point.combat_exp, gender: point.gender, jingli: 0,
        potential: point.potential, learned_points: point.learned_points,
        skills: { ...point.skills }, learned: { ...point.learned }, mappings: { ...point.mappings }, preparations: {},
        effective_str: gumuEffectiveAttribute({ ...a, skills: point.skills }, 'str'),
        effective_int: point.effective_int, effective_dex: point.effective_dex,
        effective_con: point.con + Math.trunc((point.skills.force ?? 0) / 10),
        effective_skills: { force: point.effective_force, dodge: point.effective_dodge },
        cultivation: Object.fromEntries(['character', 'family/family_name', 'family/master_id', 'family/master_name',
            'special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn']
            .map(k => [k, Object.hasOwn(q, k) ? q[k] : null])),
        temp: { apply: { armor: 100 } }, handing: 'none', handing_details: {},
        weapon: 'none', weapon_flag: 0, weapon_damage: 0, weapon_details: {} });
    const bystander = snapshot({ ...steps[0].before, jing: 10000, neili: 6000, max_neili: 6000,
        skills: { force: 1 }, learned: {}, mappings: {} }, 1);
    const initial = snapshot(steps[0].before), teacherState = { object: steps[0].teacher,
        id: p.teacher.id, playerp: null, living: 1, skills: teacherSkills };
    const loaded = Object.fromEntries(['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling',
        'sanwu-shou', 'wudu-shenzhang', 'sad-strike'].map(k => [k, 1]));
    const autonomy = heartbeat => ({ heartbeat, blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] });
    return { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: p.expected, elapsed: 0.002,
        before: [initial, structuredClone(bystander)],
        after: [snapshot(steps.at(-1).after), structuredClone(bystander)],
        teacher_preparation: { command: 'test_interface', entry_actor: steps[0].student, return_actor: steps[0].student,
            initializer_actor: 'not_observed', before: structuredClone(initial), after: structuredClone(initial),
            teacher: steps[0].teacher, teacher_program: p.teacher.path, teacher_state: teacherState,
            loaded_before: { ...loaded }, loaded_after: { ...loaded }, autonomy_before: autonomy(1), autonomy_after: autonomy(0) },
        teacher_final: { state: structuredClone(teacherState), autonomy: autonomy(0) },
        teacher_cleanup: { pending: 0, object_exists: 0 },
        teaching: steps, metrics: [total ? { jing_cost: total } : {}, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
function validate(raw, c) {
    validateRecord(raw, c); validateTeachingRecord(raw, c); validateGumuAcquisitionLearningRecord(raw, c);
}

test('只准备两入口25条件/50正式/25烟雾；状态和精神成本分母各自明确', () => {
    assert.equal(gumuAcquisitionLearningLessons.length, 2);
    assert.equal(cases.length, 25); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 50);
    assert.equal(smoke.length, 25); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 25);
    assert.deepEqual(Object.fromEntries(['lin', 'yang'].map(id => [id, cases.filter(c => c.parameters.lesson === id).length])),
        { lin: 8, yang: 17 });
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 7);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 18);
    const asks = cases.flatMap(c => c.parameters.teaching_expectations.flatMap(e => Array(c.samples).fill(e)));
    assert.equal(asks.length, 54);
    assert.deepEqual(Object.fromEntries(['acquired', 'already_known', 'business_refused', 'public_refused']
        .map(result => [result, asks.filter(e => e.result === result).length])),
        { acquired: 14, already_known: 10, business_refused: 28, public_refused: 2 });
    assert.equal(gumuAcquisitionLearningSources.length, 19); assert.equal(gumuAcquisitionLearningFixtureRequirements.length, 6);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.method, 'teaching');
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.equipment, undefined);
        assert.deepEqual(c.parameters.monitored_grants, [wall, 'can_perform/sad-strike/xiao', 'can_perform/sad-strike/tuo']);
    }
});

test('完整JSON指纹和真实create/openSeries入口台账；拒绝非法ID和缺源码入口', () => {
    assert.equal(sha256(JSON.stringify(cases)), '32b2ad9dd516ecc317145bd3c2f3b4cd732d804f15caccac3aa45bbefe4e9f39');
    assert.equal(sha256(JSON.stringify(smoke)), 'b35dff177c96b51df4ccdc6a54193c7af25377336598f8e819118435d23d5d64');
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-acquisition-learning-test-'));
    try {
        for (const [label, conditions] of [['formal', cases], ['smoke', smoke]]) {
            const path = join(directory, label);
            const manifest = createSeries(path, { inventory, catalog, conditions,
                teachingEntries: teachingEntries(conditions), execution: { synthetic: true, driver_started: false } });
            assert.deepEqual(openSeries(path, manifest.identity), JSON.parse(JSON.stringify(manifest)));
            assert.deepEqual(manifest.identity.conditions, conditions);
        }
        const badId = structuredClone(cases[0]); badId.id += '-非法';
        assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog, conditions: [badId],
            teachingEntries: entries([badId]), execution: { synthetic: true } }), /条件 ID/);
        const badEntry = structuredClone(cases[0]); badEntry.entry_id += '-missing';
        assert.throws(() => createSeries(join(directory, 'bad-entry'), { inventory, catalog, conditions: [badEntry],
            teachingEntries: entries([badEntry]), execution: { synthetic: true } }), /源码清单/);
        const missingSource = structuredClone(entries([cases[0]])); missingSource[0].path = 'kungfu/class/gumu/missing.c';
        missingSource[0].id = `${missingSource[0].path}:${missingSource[0].line}:${missingSource[0].function}`;
        const missingCondition = structuredClone(cases[0]); missingCondition.entry_id = missingSource[0].id;
        assert.throws(() => createSeries(join(directory, 'missing-source'), { inventory, catalog,
            conditions: [missingCondition], teachingEntries: missingSource, execution: { synthetic: true } }));
    } finally {
        assert.ok(basename(directory).startsWith('mud-gumu-acquisition-learning-test-'));
        assert.equal(resolve(directory, '..'), resolve(tmpdir())); rmSync(directory, { recursive: true, force: true });
    }
});

test('完整25组合成资料通过共同原始记录与本组校验；null忙乱和缺零计数合法', () => {
    for (const c of cases) for (const cost of [10, 19]) {
        const raw = fixture(c, cost); assert.equal(raw.parameters, undefined); assert.equal(raw.before[0].busy, null);
        validate(raw, c);
    }
});

test('原始悟性/臂力34不能被有效53冒充；映射内功与无映射640按原有效320', () => {
    for (const [variant, rawKey, effectiveKey] of [['raw-int-low', 'int', 'effective_int'], ['raw-str-low', 'str', 'effective_str']]) {
        const c = pick('yang-' + variant), raw = fixture(c);
        assert.equal(raw.teaching[0].before[rawKey], 33); assert.equal(raw.teaching[0].before[effectiveKey], 53);
        assert.equal(c.parameters.expected, 'refused'); validate(raw, c);
    }
    assert.equal(fixture(pick('yang-effective-force-low')).teaching[0].before.effective_force, 319);
    for (const id of ['yang-grant', 'yang-unmapped-force-exact'])
        assert.equal(fixture(pick(id)).teaching[0].before.effective_force, 320);
    const noGates = pick('yang-no-extra-gates'); assert.equal(noGates.parameters.expected, 'observed');
    assert.equal(noGates.parameters.actor.properties.neili, 0); assert.equal(noGates.parameters.actor.properties.gongxian, -1);
});

test('原资格顺序：林先师承再已知；杨已学1级优先所有资格且200级不降级', () => {
    assert.equal(pick('lin-known-low').parameters.teaching_expectations[0].result, 'already_known');
    assert.equal(pick('lin-known-other-master').parameters.teaching_expectations[0].result, 'business_refused');
    for (const id of ['yang-known-one', 'yang-known-high']) {
        const c = pick(id), e = c.parameters.teaching_expectations[0];
        assert.equal(e.result, 'already_known'); assert.equal(c.parameters.expected, 'refused');
        assert.deepEqual(e.skills_after, c.parameters.actor.skills); assert.deepEqual(e.learned_after, {});
    }
    const y = gumuAcquisitionLearningLessons.find(l => l.id === 'yang');
    const a = structuredClone(pick('yang-grant').parameters.actor); a.properties.gender = '女性'; a.properties.int = 1;
    assert.ok(gumuAcquisitionLearningDecision(y, a).response_contains.includes('男性'));
});

test('同人同师重复保留首次状态、不制造修为熟练度奖励或附带绝招', () => {
    for (const name of ['lin', 'yang']) {
        const c = pick(name + '-repeat'), raw = fixture(c);
        assert.deepEqual(raw.teaching[1].before, raw.teaching[0].after);
        assert.deepEqual(c.parameters.teaching_expectations.map(e => e.result), ['acquired', 'already_known']);
        assert.deepEqual(raw.after[0].learned, {}); validate(raw, c);
        const refill = structuredClone(raw); refill.teaching[1].before.jing += 12;
        assert.throws(() => validate(refill, c));
        const otherTeacher = structuredClone(raw); otherTeacher.teaching[1].teacher = c.parameters.teacher.path + '#9';
        assert.throws(() => validate(otherTeacher, c), /同一教师|换了教师/);
    }
    const c = pick('yang-grant'), raw = fixture(c);
    assert.equal(raw.before[0].skills['sad-strike'], undefined); assert.equal(raw.after[0].skills['sad-strike'], 10);
    raw.teaching[0].after.grants['can_perform/sad-strike/xiao'] = 1;
    assert.throws(() => validate(raw, c), /grants|许可写入/);
});

test('jing29零扣费且业务不执行；jing30能授予并降到11–20而非补足30', () => {
    const low = pick('lin-jing29'); assert.equal(low.parameters.expected, 'refused');
    const exact = pick('lin-jing30'); assert.equal(exact.parameters.expected, 'observed');
    for (const cost of [10, 19]) {
        const refused = fixture(low, cost); validate(refused, low);
        assert.equal(refused.after[0].jing, 29); assert.deepEqual(refused.metrics[0], {});
        const accepted = fixture(exact, cost); validate(accepted, exact);
        assert.equal(accepted.after[0].jing, 30 - cost);
    }
    const wrong = fixture(low); wrong.teaching[0].command_accepted = 0;
    assert.throws(() => validate(wrong, low), /返回1|受理状态/);
});

test('拒绝缺失/显式null必需观察、错误学生/教师归属和响应', () => {
    const c = pick('yang-grant');
    for (const key of ['gender', 'sadly', 'effective_str', 'effective_int', 'effective_force', 'grants', 'skills', 'learned']) {
        for (const missing of [true, false]) {
            const raw = fixture(c);
            if (missing) delete raw.teaching[0].before[key]; else raw.teaching[0].before[key] = null;
            assert.throws(() => validate(raw, c), key);
        }
    }
    for (const mutate of [r => { r.teaching[0].student = '/tests/unrelated#9'; },
        r => { r.teaching[0].teacher_program = '/kungfu/class/gumu/lin'; },
        r => { r.teaching[0].teacher = '/tests/unrelated#9'; },
        r => { r.teaching[0].messages = []; }, r => { r.after[1].jing--; }]) {
        const raw = fixture(c); mutate(raw); assert.throws(() => validate(raw, c));
    }
});

test('单向原账须精确：不许净值冒充额外相抵、null计数、贡献费或伪造熟练度', () => {
    const c = pick('yang-grant');
    for (const mutate of [r => { r.metrics[0].jing_cost++; r.metrics[0].jing_recovery = 1; },
        r => { r.metrics[0].neili_cost = 1; r.metrics[0].neili_recovery = 1; },
        r => { r.metrics[0].qi_cost = null; }, r => { r.metrics[0].jing_cost = null; },
        r => { r.teaching[0].after.contribution--; },
        r => { r.teaching[0].after.learned['sad-strike'] = 1; },
        r => { r.teaching[0].after.skills['martial-cognize']++; },
        r => { r.callbacks.push({ phase: 'fabricated_reward' }); }]) {
        const raw = fixture(c); mutate(raw); assert.throws(() => validate(raw, c));
    }
    for (const cost of [9, 20]) assert.throws(() => validate(fixture(c, cost), c), /10–19|精神扣除/);
});

test('报告只读冻结条件，首次/已知/业务/公共拒绝及收费分母不混合', () => {
    const reports = cases.map(c => gumuAcquisitionLearningEffects([10, 19].map(cost =>
        ({ condition_id: c.id, raw: fixture(c, cost) })), c));
    assert.equal(reports.reduce((n, r) => n + r.samples, 0), 50);
    assert.equal(reports.reduce((n, r) => n + r.asks, 0), 54);
    assert.equal(reports.reduce((n, r) => n + r.charged_asks, 0), 52);
    assert.equal(reports.reduce((n, r) => n + r.uncharged_asks, 0), 2);
    assert.equal(reports.reduce((n, r) => n + r.wall_permissions_acquired, 0), 6);
    assert.equal(reports.reduce((n, r) => n + r.initial_sad_skills_acquired, 0), 8);
    assert.ok(reports.every(r => r.contribution_spent === 0 && r.learned_points_spent === 0));
    const repeat = reports[cases.indexOf(pick('yang-repeat'))];
    assert.deepEqual(repeat.result_counts, { acquired: 2, already_known: 2, business_refused: 0, public_refused: 0 });
    assert.deepEqual(repeat.charged_jing_spent, distribution([10, 10, 19, 19]));
    const low = reports[cases.indexOf(pick('lin-jing29'))];
    assert.deepEqual(low.charged_jing_spent, distribution([]));
    assert.deepEqual(low.all_asks_jing_spent, distribution([0, 0]));
    assert.throws(() => gumuAcquisitionLearningEffects([{ condition_id: 'wrong', raw: fixture(cases[0]) }], cases[0]));
    assert.throws(() => gumuAcquisitionLearningEffects([{ condition_id: cases[0].id,
        raw: { condition_id: cases[0].id, method: 'teaching', outcome: 'error' } }], cases[0]), /错误样本/);
});

test('来源漂移、缺文件、跨catalog快照或删除原启蒙语句均不能建立有效条件', () => {
    assert.equal(sha256(JSON.stringify(gumuAcquisitionLearningSources.map(path => [path, sha256(read(path))]))),
        gumuAcquisitionLearningReviewed);
    assert.throws(() => gumuAcquisitionLearningConditions(relations, catalog,
        path => read(path) + (path === 'cmds/std/ask.c' ? '\n' : '')), /源码变化/);
    assert.throws(() => gumuAcquisitionLearningConditions(relations, catalog, path => {
        if (path === 'kungfu/class/gumu/lin.c') throw new Error('source unavailable'); return read(path);
    }), /source unavailable/);
    assert.throws(() => gumuAcquisitionLearningConditions({ ...relations, source_fingerprint: 'wrong' }, catalog, read));
    const missing = structuredClone(relations);
    missing.objects.find(t => t.path === 'kungfu/class/gumu/yang.c').skill_assignments = [];
    assert.throws(() => gumuAcquisitionLearningConditions(missing, catalog, read), /首次启蒙来源不唯一/);
});

test('全局教学尾部25条件及烟雾与独立冻结稿完全相同，来源白名单和计划门禁实际执行', () => {
    const all = teachingConditions(relations, catalog);
    assert.deepEqual(all.slice(11915, 11940), cases);
    validateTeachingPlan(cases, all); validateTeachingPlan(smoke, all.map(c => ({ ...c, samples: 1 })));
    const wrong = structuredClone(cases); wrong[0].parameters.actor.properties.jing++;
    assert.throws(() => validateTeachingPlan(wrong, all), /核对版本不同/);
    for (const name of ['gumu_acquisition_learning_cases.mjs', 'gumu_acquisition_learning.test.mjs'])
        assert.ok(read('tools/tests/martial_data/execution.mjs').includes(name), name);
});

test('共用报告按实际口诀与0→10判成功，54询问/14首次获取和四种结果分账，不造存款费用', () => {
    const rows = cases.flatMap(c => Array.from({ length: c.samples }, (_, index) =>
        ({ condition_id: c.id, index, outcome: c.parameters.expected, raw: fixture(c), raw_sha256: 'synthetic' })));
    const report = summarizeTeachingRows({ fingerprint: 'synthetic', identity: { conditions: cases } }, rows);
    assert.equal(report.totals.samples, 50); assert.equal(report.totals.observed, 14);
    assert.equal(report.totals.refused, 36); assert.equal(report.totals.asks, 54);
    assert.equal(report.totals.learning_steps, 8);
    const details = report.conditions.map(c => c.gumu_acquisition_learning);
    assert.deepEqual(Object.fromEntries(['acquired', 'already_known', 'business_refused', 'public_refused']
        .map(k => [k, details.reduce((n, d) => n + d.result_counts[k], 0)])),
        { acquired: 14, already_known: 10, business_refused: 28, public_refused: 2 });
    assert.equal(report.conditions.reduce((n, c) => n + c.acquired_steps, 0), 14);
    assert.ok(report.conditions.every(c => !Object.hasOwn(c, 'balance_spent_per_step')));
    assert.equal(details.reduce((n, d) => n + d.charged_asks, 0), 52);
    assert.equal(details.reduce((n, d) => n + d.uncharged_asks, 0), 2);
    const wrong = structuredClone(cases[0]); wrong.parameters.actor.properties.int++;
    assert.throws(() => summarizeTeachingRows({ fingerprint: 'synthetic', identity: { conditions: [wrong] } },
        rows.filter(r => r.condition_id === wrong.id)));
});

test('原教师准备/收尾必须齐全且同源；初授不得强制enable或补学生技能', () => {
    const c = pick('yang-repeat'), raw = fixture(c);
    assert.equal(raw.skill_load_context, undefined); assert.equal(raw.before[0].skills['sad-strike'], undefined);
    assert.equal(raw.teacher_preparation.teacher_state.playerp, null); validate(raw, c);
    for (const mutate of [r => { delete r.teacher_preparation; },
        r => { r.teacher_preparation.entry_actor = '/tests/other#9'; },
        r => { delete r.teacher_preparation.teacher_state.playerp; },
        r => { r.teacher_preparation.after.skills['sad-strike'] = 1; },
        r => { delete r.teaching[1].teacher_skills; },
        r => { r.teacher_final.state.object = '/tests/other#9'; },
        r => { r.teacher_cleanup.pending = 1; }]) {
        const bad = fixture(c); mutate(bad); assert.throws(() => validate(bad, c));
    }
    const runner = read('tools/tests/martial_data/runner.lpc');
    assert.ok(runner.includes('if (!side && current["parameters"]["teaching_profile"] == "gumu-teachers"'));
    const observer = read('tools/tests/martial_data/teaching_observer.lpc');
    assert.ok(observer.includes('profile == "gumu-acquisition-learning"'));
    assert.ok(observer.includes('student->query("static/sadly")'));
});
