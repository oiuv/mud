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
import { validateTeachingRecord } from './teaching_observation.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { summarizeTeachingRows, validateTeachingPlan } from './teaching_report.mjs';
import { gumuEffectiveAttribute } from './school_gumu_cultivation_cases.mjs';
import { gumuSpecialTeachingLessons, gumuSpecialTeachingSources, gumuSpecialTeachingReviewed,
    gumuSpecialTeachingFixtureRequirements, gumuSpecialTeachingConditions, gumuSpecialTeachingReward,
    validateGumuSpecialTeachingRecord, gumuSpecialTeachingEffects } from './gumu_special_teaching_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const cases = gumuSpecialTeachingConditions(relations, catalog, read);
const smoke = gumuSpecialTeachingConditions(relations, catalog, read, { smoke: true });
const pick = suffix => {
    const c = cases.find(c => c.id === 'teaching-gumu-special-' + suffix); assert.ok(c, suffix); return c;
};
const entries = matrix => [...new Map(matrix.map(c => [c.entry_id, c.parameters.teaching_entry])).values()];

// Fabricated records exercise the readers only. They never enter a sample ledger
// or represent original NPC preparation / real grants / real-driver acceptance.
function fixture(c, cost = 12) {
    const p = c.parameters, a = p.actor, q = a.properties;
    const teacherSkills = Object.fromEntries([...read(p.teacher.path.slice(1) + '.c')
        .matchAll(/set_skill\("([^"]+)",\s*(\d+)\)/g)].map(m => [m[1], Number(m[2])]));
    let before = { contribution: q.gongxian, jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        max_jingli: 0, potential: q.potential, learned_points: q.learned_points,
        effective_force: Math.trunc(a.skills.force / 2), effective_dodge: Math.trunc(a.skills.dodge / 2),
        effective_dex: q.dex + Math.trunc(a.skills.dodge / 10), effective_int: q.int,
        shen: q.shen, str: q.str, con: q.con, int: q.int, dex: q.dex, character: q.character,
        combat_exp: q.combat_exp, grants: Object.fromEntries(p.monitored_grants.map(g => [g, 0])),
        skills: { ...a.skills }, learned: {}, mappings: {}, family: q['family/family_name'],
        master_id: q['family/master_id'], master_name: q['family/master_name'], reborn_family: null };
    const steps = p.teaching_expectations.map(e => {
        const after = structuredClone(before);
        after.contribution -= e.contribution_spent; after.jing -= cost;
        after.skills = { ...e.skills_after }; after.learned = { ...e.learned_after }; after.grants[e.grant] = e.value;
        const step = { teacher: p.teacher.path + '#2', teacher_program: p.teacher.path,
            teacher_skills: { ...teacherSkills },
            student: '/tests/teaching_actor#1', command: e.action, command_accepted: 1, elapsed: 0.001,
            before: structuredClone(before), after, message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: [{ category: 'tell_object', text: e.response_contains ?? '重复询问（合成）' }] };
        before = after; return step;
    });
    const snapshot = (point, side = 0) => ({ object: side ? '/tests/teaching_actor#3' : steps[0].student,
        id: side ? 'right' : 'left', userp: 1, playerp: 1, interactive: 1, wizardp: 0,
        living: 1, ghost: 0, busy: null, qi: 10000, eff_qi: 10000, max_qi: 10000,
        jing: point.jing, eff_jing: 10000, max_jing: 10000, neili: point.neili, max_neili: point.max_neili,
        str: point.str, con: point.con, int: point.int, dex: point.dex, shen: point.shen,
        combat_exp: point.combat_exp, gender: q.gender, jingli: 0,
        potential: point.potential, learned_points: point.learned_points,
        skills: { ...point.skills }, learned: { ...point.learned }, mappings: {}, preparations: {},
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
        skills: { force: 1 }, learned: {} }, 1);
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
        teaching: steps, metrics: [{ jing_cost: cost * steps.length }, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
function validate(raw, c) {
    validateRecord(raw, c); validateTeachingRecord(raw, c); validateGumuSpecialTeachingRecord(raw, c);
}

test('只含林3/龙6/杨4原授招，106条件212正式/106烟雾，不冒充实测', () => {
    assert.equal(gumuSpecialTeachingLessons.length, 13);
    assert.deepEqual(Object.fromEntries(['lin', 'longnv', 'yang'].map(n =>
        [n, gumuSpecialTeachingLessons.filter(l => l.teacher === n).length])), { lin: 3, longnv: 6, yang: 4 });
    assert.equal(cases.length, 106); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 212);
    assert.equal(smoke.length, 106); assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 106);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 40);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 66);
    assert.equal(cases.reduce((n, c) => n + c.parameters.teaching_expectations.length * c.samples, 0), 238);
    assert.equal(gumuSpecialTeachingSources.length, 32); assert.equal(gumuSpecialTeachingFixtureRequirements.length, 4);
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.deepEqual(smoke.map(c => c.parameters), cases.map(c => c.parameters));
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.method, 'teaching');
        assert.equal(c.parameters.teaching_profile, 'gumu-special');
        assert.equal(c.parameters.monitored_grants.length, 13);
        assert.equal(c.parameters.fighting, false); assert.equal(c.parameters.observe_seconds, 0);
        assert.equal(c.parameters.actor.equipment, undefined);
        assert.ok(!c.parameters.teacher.path.endsWith('/li'));
    }
});

test('矩阵完整JSON指纹、真实入口台账建档/重开及非法ID/来源拒绝', () => {
    assert.equal(sha256(JSON.stringify(cases)), '8cd576b555098027d8ada14bf0cc5fbba7d17a2995b912ba8f42aaf6d5fcad85');
    assert.equal(sha256(JSON.stringify(smoke)), 'abd6f77e77c21dfde1fcd8b32411a44891abbc6167be46c67e86f79b44c412ca');
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-special-ledger-test-'));
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
    } finally {
        assert.ok(basename(directory).startsWith('mud-gumu-special-ledger-test-'));
        assert.equal(resolve(directory, '..'), resolve(tmpdir())); rmSync(directory, { recursive: true, force: true });
    }
});

test('全部合成资料通过共用和本组校验，null忙乱/缺失零计数不造原始parameters', () => {
    for (const c of cases) for (const cost of [10, 19]) {
        const raw = fixture(c, cost); assert.equal(raw.parameters, undefined); assert.equal(raw.before[0].busy, null);
        validate(raw, c);
    }
});

test('各原门槛独立拒绝，免费仅免门派/费用而不放开负贡献', () => {
    for (const l of gumuSpecialTeachingLessons) {
        for (const variant of ['contribution-low', 'skill-zero', 'skill-low'])
            assert.equal(pick(l.id + '-' + variant).parameters.expected, 'refused');
        for (const [key, variant] of [['force', 'force-low'], ['dodge', 'dodge-low'], ['max_neili', 'max-neili-low']])
            if (l[key]) assert.equal(pick(l.id + '-' + variant).parameters.expected, 'refused');
        assert.equal(pick(l.id + '-family-other').parameters.expected, l.free ? 'observed' : 'refused');
        const grant = pick(l.id + '-grant').parameters.teaching_expectations[0];
        assert.equal(grant.value, 1); assert.equal(grant.contribution_spent, l.contribution);
        if (l.free) {
            assert.equal(pick(l.id + '-contribution-low').parameters.actor.properties.gongxian, -1);
            assert.equal(grant.contribution_spent, 0);
        }
    }
});

test('授招不套普通学习/施展资格，三个代表保留非直系师承和零当前内力', () => {
    for (const id of ['lin-lian', 'longnv-mei', 'yang-xiao']) {
        const c = pick(id + '-no-extra-gates'); assert.equal(c.parameters.expected, 'observed');
        assert.equal(c.parameters.actor.properties.neili, 0);
        assert.equal(c.parameters.actor.properties['family/master_id'], 'other teacher');
        validate(fixture(c), c);
    }
    // Yang's sad-strike baseline is female: ordinary learning rejects this, but teach_pfm does not.
    assert.equal(pick('yang-xiao-grant').parameters.actor.properties.gender, '女性');
    assert.equal(pick('yang-xiao-grant').parameters.expected, 'observed');
    // Longnv's tianluo lesson does not impose the ordinary force >=80 condition.
    assert.equal(pick('longnv-wang-grant').parameters.actor.skills.force, 0);
});

test('奖励遵循特殊→可激发基本→修养顺序，经验只阻奖励，修养不经can_improve', () => {
    for (const v of ['experience-zero', 'experience-low']) {
        const p = pick('lin-lian-' + v).parameters, e = p.teaching_expectations[0];
        assert.equal(e.value, 1); assert.equal(e.skills_after['suxin-jian'], 120);
        assert.equal(e.skills_after.sword, 120); assert.equal(e.skills_after.parry, 120);
        assert.equal(e.skills_after['martial-cognize'], 101);
        assert.deepEqual(e.learned_after, { 'martial-cognize': 0 });
    }
    const exact = pick('lin-lian-experience-floor').parameters.teaching_expectations[0];
    for (const s of ['suxin-jian', 'sword', 'parry']) assert.equal(exact.skills_after[s], 121);
    const missing = pick('longnv-wang-missing-basics').parameters.teaching_expectations[0];
    assert.equal(missing.skills_after.strike, 1); assert.equal(missing.skills_after.parry, 1);
    assert.equal(missing.skills_after['tianluo-diwang'], 61);
    assert.equal(pick('lin-lian-basic-reward-capped').parameters.teaching_expectations[0].skills_after.sword, 800);
    assert.equal(pick('lin-lian-special-reward-capped').parameters.teaching_expectations[0].skills_after['suxin-jian'], 800);
    const high = pick('lin-lian-high-level-progress').parameters.teaching_expectations[0];
    for (const s of ['suxin-jian', 'sword', 'parry']) {
        assert.equal(high.skills_after[s], 800); assert.equal(high.learned_after[s], 200001);
    }
    const yang = pick('yang-xiao-grant').parameters.teaching_expectations[0];
    assert.equal(yang.skills_after.unarmed, 151); assert.equal(yang.skills_after.strike, undefined);
});

test('重复询问继承原领悟/奖励/零余额，不再扣贡献或重复奖励；ask仍扣精神', () => {
    for (const l of gumuSpecialTeachingLessons) {
        const c = pick(l.id + '-repeat'), raw = fixture(c), [first, second] = raw.teaching;
        validate(raw, c); assert.deepEqual(second.before, first.after);
        assert.equal(second.before.contribution, 0); assert.equal(second.after.contribution, 0);
        assert.deepEqual(second.after.skills, first.after.skills); assert.deepEqual(second.after.learned, first.after.learned);
        assert.equal(second.before.jing - second.after.jing, 12); assert.equal(second.after.grants[l.grant], 1);
    }
});

test('缺字段、串授、错误身份、额外相抵成本、奖励遗漏与重复扣费均拒绝', () => {
    const c = pick('lin-lian-repeat');
    for (const mutate of [
        r => delete r.teaching[0].after.learned,
        r => r.teaching[0].after.skills['suxin-jian']++,
        r => r.teaching[0].after.learned.unrelated = 0,
        r => r.teaching[0].after.grants['can_perform/yinsuo-jinling/feng'] = 1,
        r => r.teaching[1].student = '/tests/other#12',
        r => r.teaching[1].teacher = c.parameters.teacher.path + '#34',
        r => r.teaching[0].teacher_program = '/kungfu/class/gumu/li',
        r => r.teaching[1].before.jing++,
        r => r.teaching[1].after.contribution--,
        r => r.teaching[0].after.neili--,
        r => delete r.teaching[0].before.character,
        r => r.metrics[0].jing_cost = 0,
        r => { r.metrics[0].neili_cost = 1; r.metrics[0].neili_recovery = 1; },
        r => { r.metrics[0].eff_jing_cost = 1; r.metrics[0].eff_jing_recovery = 1; },
        r => r.metrics[1].qi_cost = null,
        r => delete r.metrics[1],
        r => r.after[1].skills.force++,
        r => delete r.callbacks,
        r => r.outcome = 'refused',
    ]) { const raw = fixture(c); mutate(raw); assert.throws(() => validate(raw, c)); }
    const refused = pick('lin-lian-skill-low'), raw = fixture(refused);
    raw.teaching[0].messages = []; assert.throws(() => validate(raw, refused), /拒绝原因/);
    for (const cost of [0, 9, 20]) assert.throws(() => validate(fixture(c, cost), c), /精神/);
});

test('统计只读取冻结condition，授予/询问/费用/技能变化分母分开', () => {
    const c = pick('lin-lian-repeat'), raw = fixture(c), row = { condition_id: c.id, index: 0, outcome: raw.outcome, raw };
    const effects = gumuSpecialTeachingEffects([row], c);
    assert.equal(effects.samples, 1); assert.equal(effects.asks, 2); assert.equal(effects.acquired, 1);
    assert.equal(effects.contribution_spent, 600); assert.equal(effects.jing_spent.n, 2); assert.equal(effects.jing_spent.mean, 12);
    assert.deepEqual(Object.keys(effects.reward_changes[0]), ['suxin-jian', 'sword', 'parry', 'martial-cognize']);
    assert.deepEqual(effects.reward_changes[1], {}); assert.equal(raw.parameters, undefined);
    assert.throws(() => gumuSpecialTeachingEffects([{ ...row, condition_id: 'wrong' }], c));
});

test('原教师字段/技能/来源变动须重新核对，13授予之外不混李旧批及其他获取', () => {
    assert.equal(sha256(JSON.stringify(gumuSpecialTeachingSources.map(p => [p, sha256(read(p))]))), gumuSpecialTeachingReviewed);
    assert.throws(() => gumuSpecialTeachingConditions(relations, catalog,
        p => read(p) + (p === 'adm/daemons/masterd.c' ? '\n//changed' : '')), /源码变化/);
    const changed = structuredClone(relations);
    changed.objects.find(t => t.path === 'kungfu/class/gumu/lin.c').grants.find(g => g.grant === 'can_perform/suxin-jian/lian').fields.lv1.value++;
    assert.throws(() => gumuSpecialTeachingConditions(changed, catalog, read), /配置改变/);
    const noSkill = { ...catalog, skills: catalog.skills.filter(s => s.id !== 'sad-strike') };
    assert.throws(() => gumuSpecialTeachingConditions(relations, noSkill, read), /sad-strike/);
    const l = gumuSpecialTeachingLessons[0], skillState = { ...pick('lin-lian-grant').parameters.actor.skills };
    const copy = structuredClone(skillState); gumuSpecialTeachingReward(l, skillState, {}, 10000000);
    assert.deepEqual(skillState, copy, '期望公式不得修改输入');
});

test('两教学仅尾追加131条件；旧11809正式与烟雾完整JSON不变，真实计划校验拒绝漂移', () => {
    const all = teachingConditions(relations, catalog), prior = all.slice(0, 11809);
    assert.equal(all.slice(0, 11940).length, 11940); assert.equal(all.slice(0, 11940).reduce((n, c) => n + c.samples, 0), 54354);
    assert.equal(prior.reduce((n, c) => n + c.samples, 0), 54092);
    assert.equal(sha256(JSON.stringify(prior)), 'afcb958aa41b040ec4e29371c63421847eea6214a5fb91f0c9585464302e936c');
    assert.equal(sha256(JSON.stringify(prior.map(c => ({ ...c, samples: 1 })))),
        'a059cbea855c8ad43fa21030f67687bafe1edc1f242eed4b76d06c996fe77f6b');
    assert.deepEqual(all.slice(11809, 11915), cases);
    validateTeachingPlan(cases, all);
    validateTeachingPlan(smoke, all.map(c => ({ ...c, samples: 1 })));
    const wrong = structuredClone(cases); wrong[0].parameters.actor.skills.force++;
    assert.throws(() => validateTeachingPlan(wrong, all), /核对版本不同/);
    for (const name of ['gumu_special_teaching_cases.mjs', 'gumu_special_teaching.test.mjs'])
        assert.ok(read('tools/tests/martial_data/execution.mjs').includes(name), name);
});

test('共享报告使用冻结condition，计238询问80授予；原教师身份/无干预准备和奖励属性须齐全', () => {
    const rows = cases.flatMap(c => Array.from({ length: c.samples }, (_, index) =>
        ({ condition_id: c.id, index, outcome: c.parameters.expected, raw: fixture(c), raw_sha256: 'synthetic' })));
    const report = summarizeTeachingRows({ fingerprint: 'synthetic', identity: { conditions: cases } }, rows);
    assert.equal(report.totals.samples, 212); assert.equal(report.totals.observed, 80);
    assert.equal(report.totals.refused, 132); assert.equal(report.totals.asks, 238);
    assert.equal(report.conditions.reduce((n, c) => n + c.gumu_special.acquired, 0), 80);
    assert.equal(report.conditions.reduce((n, c) => n + c.gumu_special.asks, 0), 238);
    const c = cases.find(c => c.parameters.teaching_expectations.length === 2);
    for (const mutate of [r => { delete r.teacher_preparation; },
        r => { r.teacher_preparation.return_actor = '/tests/other#9'; },
        r => { delete r.teacher_preparation.teacher_state.playerp; },
        r => { r.teacher_preparation.after.skills.force++; },
        r => { r.teacher_final.autonomy.heartbeat = 1; },
        r => { delete r.teaching[1].teacher_skills; },
        r => { r.teacher_cleanup.object_exists = 1; },
        r => { r.after[0].effective_str++; }]) {
        const raw = fixture(c); mutate(raw); assert.throws(() => validate(raw, c));
    }
    const raw = fixture(cases.find(c => c.parameters.variant === 'skill-zero'));
    assert.equal(raw.skill_load_context, undefined, '授招拒绝不借enable补资格');
    validate(raw, cases.find(c => c.id === raw.condition_id));
});
