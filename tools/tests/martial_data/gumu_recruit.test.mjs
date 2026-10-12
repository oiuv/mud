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
import { teachingConditions } from './teaching_cases.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validateTeachingPlan, summarizeTeachingRows } from './teaching_report.mjs';
import { gumuRecruitTeachers, gumuRecruitSources, gumuRecruitReviewed,
    gumuRecruitFixtureRequirements, gumuRecruitConditions, gumuRecruitDecision,
    validateGumuRecruitRecord, gumuRecruitEffects } from './gumu_recruit_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const inventory = buildInventory(root), catalog = collectCatalog(root, inventory);
const relations = schoolRelations(inventory, catalog);
const cases = gumuRecruitConditions(relations, catalog, read);
const smoke = gumuRecruitConditions(relations, catalog, read, { smoke: true });
const copy = value => structuredClone(value);
const pick = suffix => {
    const c = cases.find(c => c.id === 'teaching-gumu-recruit-' + suffix); assert.ok(c, suffix); return c;
};
const entries = matrix => [...new Map(matrix.map(c => [c.entry_id, c.parameters.teaching_entry])).values()];
const historyKeys = ['detach/古墓派', 'betrayer/古墓派', 'betrayer/times'];

// Synthetic reader tests only. No runtime NPC, command, sample or completed
// driver evidence is created. Common Gumu preparation is a later integration gate.
function fixture(c) {
    const p = c.parameters, a = p.actor, q = a.properties, teacher = p.teacher.path + '#10';
    const effective = id => Math.trunc((a.skills[id] ?? 0) / 2) + (a.skills[a.mappings[id]] ?? 0);
    const family = q.family && typeof q.family === 'object' ? copy(q.family) : {};
    let point = { jing: q.jing, neili: q.neili, max_neili: q.max_neili, max_jingli: q.max_jingli,
        potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp,
        weiwang: q.weiwang, shen: q.shen, str: q.str, int: q.int, con: q.con, dex: q.dex,
        gender: q.gender, per: q.per, effective_int: q.int + Math.trunc(a.skills.literate / 10),
        effective_str: q.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
            .map(id => a.skills[id] ?? 0)) / 10),
        effective_per: q.per + (a.temp?.['apply/per'] ?? 0), effective_force: effective('force'),
        effective_dodge: effective('dodge'), skills: copy(a.skills), mappings: copy(a.mappings), learned: {}, grants: {},
        reborn_family: q['reborn/family_name'] || null,
        family: family.family_name ?? null, master_id: family.master_id ?? null, master_name: family.master_name ?? null,
        contribution: q.gongxian, balance: 0, score: 0,
        recruitment: { family, family_present: q.family ? 1 : 0, name: q.name, class: q.class, title: q.title,
            pending_apprentice: '', pending_betrayer: '',
            flags: { have_letter: 0, apprentice_ok: 0, valid_in_fumoquan: 0 },
            history: Object.fromEntries(historyKeys.map(k => [k, q[k] || null])),
            quest: copy(q.quest), temp_quest: copy(a.temp.quest) } };
    let entered;
    const steps = p.teaching_expectations.map((e, index) => {
        const before = copy(point), after = copy(point), wall = 2000 + index;
        if (e.recruited) entered = wall;
        after.recruitment = { ...after.recruitment, family: copy(e.family_after), family_present: e.family_present ? 1 : 0,
            name: e.name_after, class: e.class_after, title: e.title_after, flags: copy(e.flags_after),
            pending_apprentice: e.pending_apprentice ? teacher : '', pending_betrayer: e.pending_betrayer ? teacher : '',
            quest: copy(e.quest_after), temp_quest: copy(e.temp_quest_after) };
        if (e.created_family_in_sample) after.recruitment.family.enter_time = entered;
        after.contribution = e.contribution_after;
        for (const [key, field] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
            after[key] = after.recruitment.family[field] ?? null;
        point = after;
        return { student: '/tests/teaching_actor#1', teacher, teacher_program: p.teacher.path,
            command: e.action, command_accepted: e.command_accepted, elapsed: 0.001, wall_time: wall,
            teacher_family: copy(p.teacher_family), teacher_pending_recruit: '', before, after,
            message_scope: 'receive_message_apply_input_not_full_transcript', messages: [] };
    });
    const snapshot = (point, side = 0) => ({ object: side ? '/tests/teaching_actor#2' : steps[0].student,
        userp: 1, playerp: 1, interactive: 1, living: 1, wizardp: 0, ghost: null,
        busy: side ? null : a.busy ?? null, qi: 10000, eff_qi: 10000, jing: point.jing, eff_jing: 10000,
        neili: point.neili, max_neili: point.max_neili, str: point.str,
        skills: copy(point.skills), learned: copy(point.learned), mappings: copy(point.mappings) });
    const bystander = snapshot({ ...steps[0].before, jing: 10000, neili: 6000, max_neili: 6000,
        skills: { force: 1 }, learned: {}, mappings: {} }, 1);
    return { kind: 'sample', condition_id: c.id, method: 'teaching', outcome: p.expected, elapsed: 0.002,
        before: [snapshot(steps[0].before), copy(bystander)], after: [snapshot(steps.at(-1).after), copy(bystander)],
        teaching: steps, metrics: [{}, {}], launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
const validate = (raw, c) => { validateRecord(raw, c); return validateGumuRecruitRecord(raw, c); };
const rejected = (suffix, mutate) => {
    const c = pick(suffix), raw = fixture(c); mutate(raw, c); assert.throws(() => validate(raw, c));
};

function integratedFixture(c) {
    const raw = fixture(c), p = c.parameters, a = p.actor, q = a.properties;
    for (const step of raw.teaching) for (const point of [step.before, step.after])
        point.effective_dex = q.dex + Math.trunc(a.skills.dodge / 10);
    for (const [boundary, point] of [[raw.before[0], raw.teaching[0].before], [raw.after[0], raw.teaching.at(-1).after]]) {
        const flags = ['character', 'family/family_name', 'family/master_id', 'family/master_name',
            'special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn'];
        Object.assign(boundary, { id: 'left', ghost: 0, max_qi: 10000, max_jing: 10000, jingli: 10000,
            gender: q.gender, con: q.con, int: q.int, dex: q.dex, shen: q.shen, combat_exp: q.combat_exp,
            potential: q.potential, learned_points: q.learned_points, preparations: {},
            effective_skills: Object.fromEntries(Object.entries(a.skills).map(([k, v]) =>
                [k, Math.trunc(v / 2) + (a.skills[a.mappings[k]] ?? 0)])),
            effective_str: point.effective_str, effective_int: point.effective_int,
            effective_dex: point.effective_dex, effective_con: q.con + Math.trunc(a.skills.force / 20),
            cultivation: Object.fromEntries(flags.map(k => [k, k.startsWith('family/')
                ? point.recruitment.family[k.slice(7)] ?? null : q[k] ?? null])),
            weapon: 'none', weapon_details: {}, weapon_damage: 0, weapon_flag: 0,
            handing: 'none', handing_details: {}, temp: { apply: { damage: 0, armor: 100 } },
        });
    }
    const teacher = raw.teaching[0].teacher, autonomy = heartbeat => ({ heartbeat,
        blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] });
    const loaded = Object.fromEntries(['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling',
        'sanwu-shou', 'wudu-shenzhang', 'sad-strike'].map(k => [k, 1]));
    const state = { object: teacher, id: p.teacher.id, playerp: null, living: 1, skills: { force: 200 } };
    raw.teacher_preparation = { command: 'test_interface', teacher, teacher_program: p.teacher.path,
        entry_actor: raw.before[0].object, return_actor: raw.before[0].object, initializer_actor: 'not_observed',
        before: copy(raw.before[0]), after: copy(raw.before[0]), loaded_before: loaded, loaded_after: copy(loaded),
        autonomy_before: autonomy(1), autonomy_after: autonomy(0), teacher_state: state };
    raw.teacher_final = { state: copy(state), autonomy: autonomy(0) };
    raw.teacher_cleanup = { pending: 0, object_exists: 0 };
    for (const step of raw.teaching) { step.teacher_skills = copy(state.skills); step.resolved_teacher = teacher; }
    return raw;
}

test('真实共享注册尾部拜师57条完全同原矩阵；计划拒绝修改师承输入', () => {
    const registered = teachingConditions(relations, catalog);
    assert.deepEqual(registered.filter(c => c.parameters.teaching_profile === 'gumu-recruit'), cases);
    validateTeachingPlan(cases, registered);
    const bad = copy(cases); bad[0].parameters.actor.properties.family.generation++;
    assert.throws(() => validateTeachingPlan(bad, registered), /条件与核对版本不同/);
});

test('57条完整共享观察、原busy5和nested family，frozen-condition报告不把请安受理算成长', () => {
    const rows = cases.flatMap(c => Array.from({ length: c.samples }, (_, index) => ({
        condition_id: c.id, index, outcome: c.parameters.expected, raw: integratedFixture(c), raw_sha256: 'synthetic' })));
    const before = JSON.stringify(rows);
    for (const c of cases) validateTeachingRecord(rows.find(r => r.condition_id === c.id).raw, c);
    const report = summarizeTeachingRows({ identity: { conditions: cases } }, rows);
    assert.equal(report.conditions.length, 57);
    assert.equal(report.conditions.reduce((n, c) => n + c.recruited_steps, 0), 38);
    assert.equal(report.conditions.reduce((n, c) => n + c.advanced_steps, 0), 38);
    assert.equal(JSON.stringify(rows), before);
});

test('共享负例：准备改资格、非同一教师、缺family/任务、忙乱变化、额外资源及清理失败拒绝', () => {
    const c = cases.find(c => c.parameters.variant === 'first-join') ?? cases[0];
    for (const change of [
        r => { delete r.teaching[0].resolved_teacher; }, r => { r.teaching[0].resolved_teacher += '9'; },
        r => { r.teacher_preparation.after.str++; }, r => { delete r.before[0].cultivation['family/master_id']; },
        r => { r.after[0].cultivation['family/master_id'] = 'wrong'; }, r => { delete r.teaching[0].after.recruitment.family_present; },
        r => { delete r.teaching[0].after.recruitment.quest; }, r => { delete r.teaching[0].after.recruitment.temp_quest; },
        r => { r.metrics[0].jing_cost = 1; }, r => { r.after[0].busy = 1; },
        r => { r.teacher_cleanup.object_exists = 1; }, r => { r.teacher_final.autonomy.heartbeat = 1; },
    ]) { const raw = integratedFixture(c); change(raw); assert.throws(() => validateTeachingRecord(raw, c)); }
});

test('四原教师57条件/114正式/57烟雾；受理命令和新拜师分别计数', () => {
    assert.equal(cases.length, 57); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 114);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 57);
    assert.equal(gumuRecruitTeachers.length, 4); assert.equal(gumuRecruitSources.length, 16);
    assert.equal(gumuRecruitFixtureRequirements.length, 7);
    assert.equal(cases.filter(c => c.parameters.expected === 'observed').length, 19);
    assert.deepEqual(Object.fromEntries(gumuRecruitTeachers.map(t => [t.key, cases.filter(c => c.parameters.teacher_key === t.key).length])),
        { lin: 11, longnv: 21, yang: 11, li: 14 });
    const steps = cases.flatMap(c => c.parameters.teaching_expectations);
    assert.equal(steps.length, 69);
    assert.deepEqual(Object.fromEntries(['first_join', 'same_family_transfer', 'greeted', 'confirmation', 'business_refused', 'public_refused', 'cancelled']
        .map(k => [k, steps.filter(e => e.result === k).length])),
        { first_join: 5, same_family_transfer: 14, greeted: 6, confirmation: 5, business_refused: 32, public_refused: 5, cancelled: 2 });
    validateExpectedOutcomes(cases); validateExpectedOutcomes(smoke);
    assert.deepEqual(cases.map(c => c.parameters), smoke.map(c => c.parameters));
    for (const c of cases) {
        assert.equal(c.status, 'configured_not_executed'); assert.equal(c.parameters.fighting, false);
        assert.equal(c.parameters.observe_seconds, 0); assert.equal(c.parameters.actor.equipment, undefined);
        assert.equal(c.parameters.teaching_kind, 'apprenticeship');
    }
});

test('完整矩阵指纹固定；真实create/openSeries校验ID和原构造来源，不启动驱动', () => {
    assert.equal(sha256(JSON.stringify(cases)), '3741eab53936228816a3e9e90534aa563aba14447ed07c10673d47fa6d9025d8');
    assert.equal(sha256(JSON.stringify(smoke)), 'ba5204451b1de6cb906b569e235a38f0f39fa5bf95ffc2f58eaf9ee12995b004');
    const directory = mkdtempSync(join(tmpdir(), 'mud-gumu-recruit-test-'));
    try {
        for (const [label, matrix] of [['formal', cases], ['smoke', smoke]]) {
            const path = join(directory, label), manifest = createSeries(path, { inventory, catalog, conditions: matrix,
                teachingEntries: entries(matrix), execution: { synthetic: true, driver_started: false } });
            assert.deepEqual(openSeries(path, manifest.identity), JSON.parse(JSON.stringify(manifest)));
            assert.deepEqual(manifest.identity.conditions, matrix);
        }
        const badId = copy(cases[0]); badId.id += '-非法';
        assert.throws(() => createSeries(join(directory, 'bad-id'), { inventory, catalog, conditions: [badId],
            teachingEntries: entries([badId]), execution: { synthetic: true } }), /条件 ID/);
        const badEntry = copy(cases[0]); badEntry.entry_id += '-missing';
        assert.throws(() => createSeries(join(directory, 'bad-entry'), { inventory, catalog, conditions: [badEntry],
            teachingEntries: entries([badEntry]), execution: { synthetic: true } }), /源码清单/);
        const source = copy(entries([cases[0]])); source[0].path = 'kungfu/class/gumu/missing.c';
        source[0].id = `${source[0].path}:${source[0].line}:${source[0].function}`;
        const missing = copy(cases[0]); missing.entry_id = source[0].id;
        assert.throws(() => createSeries(join(directory, 'missing-source'), { inventory, catalog,
            conditions: [missing], teachingEntries: source, execution: { synthetic: true } }), /源码快照/);
    } finally {
        assert.ok(basename(directory).startsWith('mud-gumu-recruit-test-'));
        assert.equal(resolve(directory, '..'), resolve(tmpdir())); rmSync(directory, { recursive: true, force: true });
    }
});

test('原源码、教师身份和全部资格证据漂移必须拒绝生成', () => {
    assert.equal(sha256(JSON.stringify(gumuRecruitSources.map(p => [p, sha256(read(p))]))), gumuRecruitReviewed);
    for (const path of gumuRecruitSources) assert.throws(() => gumuRecruitConditions(relations, catalog,
        p => read(p) + (p === path ? '\n// changed\n' : '')), /源码变化/);
    const bad = copy(relations); bad.objects = bad.objects.filter(o => o.path !== 'kungfu/class/gumu/lin.c');
    assert.throws(() => gumuRecruitConditions(bad, catalog, read), /教师来源/);
    for (const c of cases) {
        assert.equal(c.parameters.recruit_callback.function, 'attempt_apprentice');
        assert.equal(c.parameters.teaching_entry.function, 'create');
        assert.ok(read(c.parameters.recruit_callback.path).split('\n')[c.parameters.recruit_callback.line - 1].includes('void attempt_apprentice'));
    }
});

test('57组合成记录通过通用原始记录与专属读取器；非运行接受证据', () => {
    for (const c of cases) {
        const raw = fixture(c); assert.equal(raw.parameters, undefined); validate(raw, c);
        for (const side of [0, 1]) if (raw.before[side].busy === null) {
            raw.before[side].busy = 0; raw.after[side].busy = 0;
        }
        validate(raw, c);
    }
});

test('原始/有效门槛不同：林悟性35、杨膂力45、李有效内功160、小龙女只看原容貌', () => {
    const step = suffix => pick(suffix).parameters.teaching_expectations[0];
    assert.equal(step('lin-baseline').result, 'same_family_transfer'); assert.equal(step('lin-int34').reason, 'effective_int');
    assert.equal(step('yang-baseline').result, 'same_family_transfer'); assert.equal(step('yang-str44').reason, 'effective_str');
    assert.equal(step('li-force-low').reason, 'effective_force'); assert.equal(step('li-unmapped-force320').result, 'same_family_transfer');
    assert.equal(step('longnv-per25-boost').reason, 'raw_per');
    const raw = fixture(pick('longnv-per25-boost')); assert.equal(raw.teaching[0].before.per, 25);
    assert.equal(raw.teaching[0].before.effective_per, 45);
    rejected('lin-baseline', r => { r.teaching[0].before.effective_int = 20; });
    rejected('yang-baseline', r => { r.teaching[0].before.str = 45; });
    rejected('li-baseline', r => { r.teaching[0].before.effective_force = 40; });
    rejected('longnv-per25-boost', r => { r.teaching[0].before.per = 45; });
});

test('原性别判定不是全门派女性限制，李只拒男性', () => {
    for (const suffix of ['lin-male', 'yang-female', 'longnv-male', 'longnv-sexless', 'li-sexless'])
        assert.equal(pick(suffix).parameters.expected, 'observed');
    assert.equal(pick('li-male').parameters.teaching_expectations[0].reason, 'male');
    for (const suffix of ['li-shen-high', 'li-exp-low', 'li-strike119', 'lin-li-master', 'lin-xinjing119', 'yang-xinjing119', 'yang-max-neili1999'])
        assert.equal(pick(suffix).parameters.expected, 'refused');
});

test('首次无family映射加入清贡献/两份任务；同派转师保留，转世不是自然养成', () => {
    for (const teacher of gumuRecruitTeachers) {
        const first = fixture(pick(teacher.key + '-first-join')), transfer = fixture(pick(teacher.key + '-baseline'));
        assert.equal(first.teaching[0].before.recruitment.family_present, 0);
        assert.equal(first.teaching[0].after.contribution, 0); assert.equal(first.teaching[0].after.recruitment.quest, null);
        assert.equal(first.teaching[0].after.recruitment.temp_quest, null);
        assert.equal(transfer.teaching[0].after.contribution, 77);
        assert.deepEqual(transfer.teaching[0].before.recruitment.quest, transfer.teaching[0].after.recruitment.quest);
    }
    assert.equal(pick('longnv-reborn-no-family').parameters.teaching_expectations[0].result, 'first_join');
    rejected('lin-first-join', r => { r.teaching[0].after.recruitment.quest = { name: '实验旧任务', count: 7 }; });
    rejected('yang-first-join', r => { r.teaching[0].after.recruitment.temp_quest = { next_level: 3 }; });
    rejected('li-baseline', r => { r.teaching[0].after.contribution = 0; });
    rejected('longnv-baseline', r => { r.teaching[0].after.recruitment.quest = null; });
});

test('四教师重复请安不再收徒、不改入门时间；已知/转世请安先于业务资格', () => {
    for (const t of gumuRecruitTeachers) {
        const c = pick(t.key + '-repeat'), raw = fixture(c), results = validate(raw, c);
        assert.deepEqual(results.map(r => r.result), ['same_family_transfer', 'greeted']);
        assert.equal(raw.teaching[1].after.recruitment.family.enter_time, raw.teaching[0].after.recruitment.family.enter_time);
    }
    for (const suffix of ['longnv-known-invalid', 'longnv-reborn-known']) {
        const c = pick(suffix); assert.equal(c.parameters.expected, 'refused');
        assert.equal(c.parameters.teaching_expectations[0].result, 'greeted'); validate(fixture(c), c);
    }
    rejected('lin-repeat', r => { r.teaching[1].before.recruitment.pending_apprentice = r.teaching[1].teacher; });
    rejected('yang-repeat', r => { r.teaching[1].after.recruitment.family.enter_time++; });
});

test('离派/叛师拒绝与外派两次确认分开；原拒绝不抹叛师意向', () => {
    for (const t of gumuRecruitTeachers) {
        for (const suffix of ['detach', 'betrayer', 'betrayer-times']) {
            const c = pick(t.key + '-' + suffix); assert.equal(c.parameters.expected, 'refused');
            assert.equal(c.parameters.teaching_expectations[0].command_accepted, 1);
            assert.equal(c.parameters.teaching_expectations[0].pending_apprentice, true);
        }
        const foreign = pick(t.key + '-foreign-confirm');
        assert.deepEqual(foreign.parameters.teaching_expectations.map(e => e.result), ['confirmation', 'business_refused']);
        assert.equal(foreign.parameters.teaching_expectations[1].pending_betrayer, true);
        assert.equal(foreign.parameters.teaching_expectations[1].contribution_after, 77);
    }
    rejected('li-foreign-confirm', r => { r.teaching[1].after.recruitment.pending_betrayer = ''; });
    rejected('lin-detach', r => { r.teaching[0].after.recruitment.history['detach/古墓派'] = 0; });
});

test('忙乱、同代/低辈、重复请求和cancel保留原公共命令返回语义', () => {
    for (const suffix of ['longnv-busy', 'longnv-same-generation', 'longnv-senior-generation', 'longnv-cancel-empty'])
        assert.equal(pick(suffix).parameters.teaching_expectations[0].command_accepted, 0);
    assert.deepEqual(pick('longnv-repeat-refusal').parameters.teaching_expectations.map(e => e.command_accepted), [1, 0]);
    for (const suffix of ['longnv-cancel-refusal', 'longnv-foreign-cancel']) {
        const c = pick(suffix), last = c.parameters.teaching_expectations.at(-1);
        assert.equal(last.result, 'cancelled'); assert.equal(last.pending_apprentice, false); validate(fixture(c), c);
    }
    assert.equal(pick('longnv-foreign-cancel').parameters.teaching_expectations.at(-1).pending_betrayer, true);
    rejected('longnv-busy', r => { r.before[0].busy = null; });
    rejected('longnv-repeat-refusal', r => { r.teaching[1].command_accepted = 1; });
});

test('师承、代数、称号、权限、改名和职业均须为原收徒结果', () => {
    for (const [key, value] of [['master_id', 'fake master'], ['master_name', '假师父'], ['generation', 99], ['privs', 1], ['title', '弟子']])
        rejected('lin-baseline', r => { r.teaching[0].after.recruitment.family[key] = value; });
    for (const [key, value] of [['name', '新姓名'], ['class', 'taoist'], ['title', '假称号']])
        rejected('yang-baseline', r => { r.teaching[0].after.recruitment[key] = value; });
    rejected('li-baseline', r => { r.teaching[0].after.recruitment.family.enter_time = 1; });
    rejected('longnv-baseline', r => { delete r.teaching[0].after.recruitment.family.enter_time; });
    rejected('lin-baseline', r => { r.teaching[0].after.recruitment.flags.have_letter = 1; });
});

test('合法空值不等于缺字段；任务删除及历史0支持null，但不接受遗漏', () => {
    const c = pick('longnv-first-join'), raw = fixture(c);
    raw.teaching[0].before.recruitment.family_present = null;
    raw.teaching[0].after.recruitment.quest = 0; raw.teaching[0].after.recruitment.temp_quest = 0; validate(raw, c);
    for (const key of ['family_present', 'history', 'quest', 'temp_quest', 'pending_apprentice', 'pending_betrayer'])
        rejected('lin-first-join', r => { delete r.teaching[0].after.recruitment[key]; });
    for (const key of ['per', 'gender', 'effective_per', 'effective_str', 'reborn_family', 'grants'])
        rejected('yang-baseline', r => { delete r.teaching[0].before[key]; });
    rejected('li-baseline', r => { r.metrics[0].jing_cost = null; });
});

test('必须真实玩家/原NPC唯一引用，换人、换命令、伪造时点或返回均拒绝', () => {
    rejected('lin-repeat', r => { r.teaching[1].teacher = '/kungfu/class/gumu/lin#99'; });
    rejected('lin-baseline', r => { r.teaching[0].teacher_program = '/tests/fake_teacher'; });
    rejected('yang-baseline', r => { r.teaching[0].student = '/tests/unrelated#1'; });
    rejected('li-baseline', r => { r.before[0].playerp = 0; });
    rejected('longnv-baseline', r => { r.after[0].wizardp = 1; });
    rejected('lin-baseline', r => { r.teaching[0].teacher_pending_recruit = r.before[0].object; });
    rejected('yang-baseline', r => { r.teaching[0].command = 'call attempt_apprentice'; });
    rejected('li-baseline', r => { delete r.teaching[0].wall_time; });
    rejected('longnv-baseline', r => { r.teaching[0].elapsed = NaN; });
});

test('原拜师无资源费用、武学授予和战斗回调；额外相抵账也不能通过', () => {
    rejected('lin-baseline', r => { r.metrics[0].jing_cost = 1; r.metrics[0].jing_recovery = 1; });
    rejected('yang-baseline', r => { r.teaching[0].after.skills['sad-strike'] = 10; });
    rejected('li-baseline', r => { r.teaching[0].after.grants['can_perform/sword/fake'] = 1; });
    rejected('longnv-baseline', r => { r.after[1].neili--; r.metrics[1].neili_cost = 1; });
    for (const field of ['attacks', 'launches', 'defenses', 'passives', 'callbacks', 'terminals'])
        rejected('lin-baseline', r => { r[field].push({ unexpected: true }); });
});

test('统计从冻结condition区分受理/新拜师/清任务，原raw没有parameters', () => {
    const c = pick('lin-repeat'), rows = [0, 1].map(index => ({ condition_id: c.id, index, raw: fixture(c) }));
    const report = gumuRecruitEffects(rows, c);
    assert.equal(report.samples, 2); assert.equal(report.commands, 4); assert.equal(report.command_accepted, 4);
    assert.equal(report.new_apprenticeships, 2); assert.equal(report.results.greeted, 2);
    assert.equal(report.permanent_quests_cleared, 0); assert.equal(report.contribution_cleared, 0);
    const first = pick('yang-first-join'), summary = gumuRecruitEffects([{ condition_id: first.id, raw: fixture(first) }], first);
    assert.equal(summary.contribution_cleared, 77); assert.equal(summary.permanent_quests_cleared, 1);
    assert.equal(summary.temporary_quests_cleared, 1); assert.equal(summary.resource_cost, 0);
    const changed = copy(c); changed.parameters.teaching_expectations[0].recruited = false;
    assert.throws(() => gumuRecruitEffects(rows, changed));
    assert.throws(() => gumuRecruitEffects(rows, first));
    const error = copy(rows); error[0].raw.outcome = 'error'; assert.throws(() => gumuRecruitEffects(error, c));
    assert.throws(() => gumuRecruitDecision({ ...gumuRecruitTeachers[0], id: 'fake' }, c.parameters.actor,
        { family: {}, family_present: false }, 'apprentice fake'));
});
