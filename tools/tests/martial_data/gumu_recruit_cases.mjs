// Independent preparation: original apprentice -> NPC callback -> recruit.
// This module does not register itself, prepare actors, or execute game commands.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

export const gumuRecruitTeachers = [
    { key: 'lin', id: 'lin chaoying', name: '林朝英', generation: 1 },
    { key: 'longnv', id: 'xiao longnv', name: '小龙女', generation: 3 },
    { key: 'yang', id: 'yang guo', name: '杨过', generation: 3 },
    { key: 'li', id: 'li mochou', name: '李莫愁', generation: 3 },
];
export const gumuRecruitSources = [
    'cmds/skill/apprentice.c', 'cmds/skill/recruit.c', 'feature/apprentice.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/master.c', 'feature/skill.c',
    'mudcore/inherit/dbase.c', 'inherit/char/npc.c', 'inherit/char/char.c',
    'adm/daemons/named.c', 'kungfu/class/gumu/gumu.h',
    ...gumuRecruitTeachers.map(t => `kungfu/class/gumu/${t.key}.c`),
].sort();
export const gumuRecruitReviewed = '278e5df274b1058abd42e5579b960e2ddfecf6c51c54171d79a36983f20d4a3c';
export const gumuRecruitFixtureRequirements = [
    'Append this profile to teaching registration/source and explicit frozen module/test inputs; keep original matrices unchanged and validate the actual global teaching plan after registration.',
    'Reuse Gumu test_interface teacher preparation, exact clone reference, autonomy observation and cleanup; no ordinary-learning enable preload, added student skills, or direct callback substitute.',
    'Extend only gumu-recruit teaching points with gender, raw per, effective_str and effective_per; record original query_int/str/skill(force), not guessed raw equivalents.',
    'Extend only gumu-recruit recruitment points with family_present, detach/betrayer histories, permanent quest and temporary quest; retain original full family/title/class/name/pending states and wall_time.',
    'Observe original apprentice commands in the declared order, including repeated foreign confirmation and cancel; never preset pending objects, reconstruct recruit changes, or refill between steps.',
    'Dispatch the Gumu recruit validator before the older recruit oracle, whose effective-stat assumptions do not apply; extend common Gumu preparation only for nested initial family and actual final family changes.',
    'Use frozen condition.parameters for effects and classify new recruitment from original family changes; greetings, confirmation, business/public refusal and cancellation are separate, not bool command success.',
];

const historyKeys = ['detach/古墓派', 'betrayer/古墓派', 'betrayer/times'];
const flags = { have_letter: 0, apprentice_ok: 0, valid_in_fumoquan: 0 };
const copy = value => structuredClone(value);
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const effective = (a, id) => Math.trunc((a.skills[id] ?? 0) / 2) + (a.skills[a.mappings[id]] ?? 0);
const effectiveInt = a => a.properties.int + Math.trunc((a.skills.literate ?? 0) / 10);
const effectiveStr = a => a.properties.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
    .map(id => a.skills[id] ?? 0)) / 10);
const effectivePer = a => a.properties.per + (a.temp?.['apply/per'] ?? 0);

function initialState(a) {
    return { family: mapping(a.properties.family) ? copy(a.properties.family) : {},
        family_present: mapping(a.properties.family), new_family: false,
        pending_apprentice: false, pending_betrayer: false,
        contribution: a.properties.gongxian, quest: copy(a.properties.quest), temp_quest: copy(a.temp.quest) };
}

// Explicit source oracle for these inputs only. It does not execute or replace LPC.
export function gumuRecruitDecision(teacher, actor, state, action = `apprentice ${teacher.id}`) {
    assert.ok(gumuRecruitTeachers.some(t => t.key === teacher.key && t.id === teacher.id && t.name === teacher.name));
    const q = actor.properties, s = actor.skills, next = copy(state);
    const done = (result, accepted, reason) => ({ result, command_accepted: accepted, reason, state: next });
    if (actor.busy) return done('public_refused', 0, 'busy');
    if (action === 'apprentice cancel') {
        if (!state.pending_apprentice) return done('public_refused', 0, 'no_pending_apprentice');
        next.pending_apprentice = false;
        return done('cancelled', 1, 'cancel_pending_apprentice');
    }
    assert.equal(action, `apprentice ${teacher.id}`);
    const f = state.family;
    if (state.family_present && ((f.master_id === teacher.id && f.master_name === teacher.name)
        || q['reborn/family_name'] === '古墓派')) return done('greeted', 1, 'is_apprentice_of');
    if (state.family_present && typeof f.master_name === 'string' && f.family_name === '古墓派') {
        if (teacher.generation > f.generation) return done('public_refused', 0, 'student_senior');
        if (teacher.generation === f.generation) return done('public_refused', 0, 'same_generation');
    }
    if (state.family_present && f.family_name !== '古墓派' && !state.pending_betrayer) {
        next.pending_betrayer = true;
        return done('confirmation', 1, 'foreign_family_confirmation');
    }
    if (state.pending_apprentice) return done('public_refused', 0, 'already_pending_apprentice');
    next.pending_apprentice = true;
    if (q['detach/古墓派'] || q['betrayer/古墓派']) return done('business_refused', 1, 'left_gumu');
    if (q['betrayer/times']) return done('business_refused', 1, 'betrayer_history');
    if (f.family_name && f.family_name !== '古墓派') return done('business_refused', 1, 'foreign_family');
    const gates = teacher.key === 'lin' ? [
        [f.master_name === '李莫愁', 'li_apprentice'], [effectiveInt(actor) < 35, 'effective_int'],
        [(s['yunv-xinjing'] ?? 0) < 120, 'yunv_xinjing'],
    ] : teacher.key === 'longnv' ? [[q.per < 26, 'raw_per']]
        : teacher.key === 'yang' ? [[effectiveStr(actor) < 45, 'effective_str'],
            [(s['yunv-xinjing'] ?? 0) < 120, 'yunv_xinjing'], [q.max_neili < 2000, 'max_neili']]
            : [[q.gender === '男性', 'male'], [q.shen > -70000, 'shen'], [q.combat_exp < 400000, 'combat_exp'],
                [effective(actor, 'force') < 160, 'effective_force'], [(s.strike ?? 0) < 120, 'basic_strike']];
    for (const [refused, reason] of gates) if (refused) return done('business_refused', 1, reason);
    const first = !state.family_present;
    if (first) { next.contribution = 0; next.quest = null; next.temp_quest = null; }
    next.family = { family_name: '古墓派', generation: teacher.generation + 1,
        master_id: teacher.id, master_name: teacher.name, title: '传人', privs: 0 };
    next.family_present = true; next.new_family = true; next.pending_apprentice = false;
    return done(first ? 'first_join' : 'same_family_transfer', 1, 'recruited');
}

function expectations(teacher, actor, actions) {
    let state = initialState(actor);
    return actions.map(action => {
        const previous = state, decision = gumuRecruitDecision(teacher, actor, state, action);
        state = decision.state;
        return { command_kind: 'apprentice', action, result: decision.result, reason: decision.reason,
            command_accepted: decision.command_accepted, recruited: ['first_join', 'same_family_transfer'].includes(decision.result),
            family_after: copy(state.family), family_present: state.family_present,
            created_family_in_sample: state.new_family, name_after: actor.properties.name,
            class_after: actor.properties.class,
            title_after: state.new_family ? `古墓派第${teacher.generation === 1 ? '二' : '四'}代传人` : actor.properties.title,
            flags_after: { ...flags }, pending_apprentice: state.pending_apprentice, pending_betrayer: state.pending_betrayer,
            contribution_after: state.contribution, contribution_spent: previous.contribution - state.contribution,
            quest_after: copy(state.quest), temp_quest_after: copy(state.temp_quest) };
    });
}

export function gumuRecruitConditions(relations, catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    assert.equal(relations.source_fingerprint, catalog.source_fingerprint);
    const evidence = gumuRecruitSources.map(path => ({ path, sha256: sha256(readSource(path)) }));
    assert.equal(sha256(JSON.stringify(evidence.map(e => [e.path, e.sha256]))), gumuRecruitReviewed,
        '古墓拜师源码变化，须重新核对');
    const result = [];
    for (const teacher of gumuRecruitTeachers) {
        const path = `kungfu/class/gumu/${teacher.key}.c`, t = relations.objects.find(o => o.path === path);
        assert.equal(t?.sha256, evidence.find(e => e.path === path).sha256, '原教师来源不同');
        const source = readSource(path), naming = t.names.find(n => n.function === 'create');
        assert.equal(naming.values[0], teacher.name);
        assert.equal(/^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1], teacher.id);
        assert.ok(source.includes(`create_family("古墓派", ${teacher.generation}, `));
        const create = source.indexOf('void create() {'), callback = source.indexOf('void attempt_apprentice(object ob) {');
        assert.ok(create >= 0 && callback >= 0, '缺少原构造或拜师入口');
        const line = source.slice(0, create).split('\n').length;
        const entry = { id: `${path}:${line}:create`, path, sha256: t.sha256, function: 'create', line, role: 'teaching' };
        const family = { family_name: '古墓派', generation: teacher.generation + 1,
            master_id: 'old master', master_name: '前师', title: '门人', privs: 7, enter_time: 1000 };
        const actor = { skills: { force: 80, 'yunv-xinjing': 120, unarmed: 150, strike: 120,
            literate: 150, dodge: 150, parry: 150 }, mappings: { force: 'yunv-xinjing' },
            properties: { name: '测试', class: 'scholar', title: '原有称号', family,
                gender: teacher.key === 'yang' ? '男性' : '女性', age: 20, str: 30, int: 20, con: 30, dex: 30,
                per: 26, shen: -70000, combat_exp: 400000, gongxian: 77, weiwang: 100,
                max_neili: 2000, neili: 2000, jing: 10000, max_jingli: 1000,
                potential: 1000, learned_points: 0, 'reborn/family_name': 0,
                'detach/古墓派': 0, 'betrayer/古墓派': 0, 'betrayer/times': 0,
                quest: { name: '实验旧任务', count: 7 } }, temp: { quest: { next_level: 3 } } };
        function add(variant, mutate = () => {}, sequence = ['apprentice']) {
            const a = copy(actor); mutate(a);
            for (const id of Object.keys(a.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
            const action = `apprentice ${teacher.id}`;
            const steps = expectations(teacher, a, sequence.map(s => s === 'cancel' ? 'apprentice cancel' : action));
            result.push({ id: `teaching-gumu-recruit-${teacher.key}-${variant}`, stage: 'school', method: 'teaching',
                entry_id: entry.id, samples: smoke ? 1 : 2, status: 'configured_not_executed', parameters: {
                    teacher: { path: '/' + path.slice(0, -2), id: teacher.id, sha256: t.sha256 },
                    topic: '拜师', teaching_profile: 'gumu-recruit', teaching_kind: 'apprenticeship',
                    teacher_key: teacher.key, teacher_family: { family_name: '古墓派', generation: teacher.generation },
                    recruit_callback: { path, sha256: t.sha256, function: 'attempt_apprentice',
                        line: source.slice(0, callback).split('\n').length },
                    teaching_entry: entry, teaching_evidence: naming.evidence,
                    qualification_sources: evidence.map(e => e.path), qualification_evidence: evidence,
                    action: steps[0].action, actor: a, target: { skills: { force: 1 }, mappings: {}, properties: {} },
                    named_participants: true, fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                    variant, expected: steps.some(e => e.recruited) ? 'observed' : 'refused', teaching_expectations: steps,
                    known_issue: variant.startsWith('foreign') ? 'MA-110' : null,
                    note: '原拜师/收徒命令；技能、属性、师承、离派史、任务及转世门派为明示实验前提。首次清理与同门转拜分开，不代表自然养成；不补意向、不重置重复步骤。',
                } });
        }
        add('baseline'); add('first-join', a => { a.properties.family = 0; });
        add('repeat', undefined, ['apprentice', 'apprentice']);
        for (const [variant, field] of [['detach', historyKeys[0]], ['betrayer', historyKeys[1]], ['betrayer-times', historyKeys[2]]])
            add(variant, a => { a.properties[field] = 1; });
        add('foreign-confirm', a => { a.properties.family.family_name = '武当派'; }, ['apprentice', 'apprentice']);
        if (teacher.key === 'lin') {
            add('int34', a => { a.properties.int = 19; });
            add('xinjing119', a => { a.skills['yunv-xinjing'] = 119; });
            add('li-master', a => { a.properties.family.master_name = '李莫愁'; a.properties.family.master_id = 'li mochou'; });
            add('male', a => { a.properties.gender = '男性'; });
        } else if (teacher.key === 'yang') {
            add('str44', a => { a.properties.str = 29; });
            add('xinjing119', a => { a.skills['yunv-xinjing'] = 119; });
            add('max-neili1999', a => { a.properties.max_neili = 1999; a.properties.neili = 1999; });
            add('female', a => { a.properties.gender = '女性'; });
        } else if (teacher.key === 'li') {
            add('shen-high', a => { a.properties.shen = -69999; });
            add('exp-low', a => { a.properties.combat_exp = 399999; });
            add('force-low', a => { a.skills.force = 79; });
            add('strike119', a => { a.skills.strike = 119; });
            add('male', a => { a.properties.gender = '男性'; });
            add('sexless', a => { a.properties.gender = '无性'; });
            add('unmapped-force320', a => { a.skills.force = 320; a.mappings = {}; });
        } else {
            add('per25', a => { a.properties.per = 25; });
            add('per25-boost', a => { a.properties.per = 25; a.temp['apply/per'] = 20; });
            add('male', a => { a.properties.gender = '男性'; });
            add('sexless', a => { a.properties.gender = '无性'; });
            add('busy', a => { a.busy = 5; });
            add('same-generation', a => { a.properties.family.generation = teacher.generation; });
            add('senior-generation', a => { a.properties.family.generation = teacher.generation - 1; });
            add('known-invalid', a => {
                a.properties.family.master_id = teacher.id; a.properties.family.master_name = teacher.name;
                a.properties.per = 25; a.properties['detach/古墓派'] = 1;
            });
            add('reborn-known', a => { a.properties['reborn/family_name'] = '古墓派'; a.properties.family.family_name = '武当派'; });
            add('reborn-no-family', a => { a.properties['reborn/family_name'] = '古墓派'; a.properties.family = 0; });
            add('repeat-refusal', a => { a.properties.per = 25; }, ['apprentice', 'apprentice']);
            add('cancel-refusal', a => { a.properties.per = 25; }, ['apprentice', 'cancel']);
            add('foreign-cancel', a => { a.properties.family.family_name = '武当派'; }, ['apprentice', 'apprentice', 'cancel']);
            add('cancel-empty', undefined, ['cancel']);
        }
    }
    return result;
}

function zero(value) { return value === null || value === 0; }
function present(object, key) { assert.ok(mapping(object) && Object.hasOwn(object, key), '缺观察字段：' + key); return object[key]; }
function equalEmpty(value, expected, label) {
    if (expected === 0 || expected === null) assert.ok(zero(value), label);
    else assert.deepEqual(value, expected, label);
}
function checkPoint(point, p, label) {
    const a = p.actor, q = a.properties;
    for (const [key, value] of Object.entries({ jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        max_jingli: q.max_jingli, potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp,
        weiwang: q.weiwang, shen: q.shen, str: q.str, int: q.int, con: q.con, dex: q.dex,
        gender: q.gender, per: q.per, effective_int: effectiveInt(a), effective_str: effectiveStr(a),
        effective_per: effectivePer(a), effective_force: effective(a, 'force'), effective_dodge: effective(a, 'dodge') }))
        assert.equal(present(point, key), value, label + '.' + key);
    for (const [key, value] of Object.entries({ skills: a.skills, mappings: a.mappings, learned: {}, grants: {} }))
        assert.deepEqual(present(point, key), value, label + '.' + key);
    equalEmpty(present(point, 'reborn_family'), q['reborn/family_name'], label + '.reborn_family');
    const r = present(point, 'recruitment'); assert.ok(mapping(r));
    assert.ok(mapping(present(r, 'family')));
    for (const key of ['name', 'class', 'title', 'pending_apprentice', 'pending_betrayer'])
        assert.equal(typeof present(r, key), 'string', label + '.' + key);
    assert.equal(r.name, q.name); assert.equal(r.class, q.class);
    assert.deepEqual(present(r, 'flags'), flags);
    const history = present(r, 'history'); assert.ok(mapping(history));
    assert.deepEqual(Object.keys(history).sort(), [...historyKeys].sort());
    for (const key of historyKeys) equalEmpty(history[key], q[key], label + '.history.' + key);
    for (const key of ['family_present', 'quest', 'temp_quest']) present(r, key);
    for (const [key, field] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
        equalEmpty(present(point, key), r.family[field] ?? 0, label + '.' + key);
}

// Called in addition to the generic record and Gumu preparation validators after
// future registration; old Shaolin/Emei recruitment assumptions are not weakened.
export function validateGumuRecruitRecord(raw, condition) {
    const p = condition.parameters, teacher = gumuRecruitTeachers.find(t => t.key === p.teacher_key);
    assert.equal(p.teaching_profile, 'gumu-recruit'); assert.equal(p.teaching_kind, 'apprenticeship'); assert.ok(teacher);
    assert.equal(p.teacher.path, `/kungfu/class/gumu/${teacher.key}`); assert.equal(p.teacher.id, teacher.id);
    assert.deepEqual(p.teacher_family, { family_name: '古墓派', generation: teacher.generation });
    assert.equal(raw.condition_id, condition.id); assert.equal(raw.method, 'teaching');
    if (raw.outcome === 'error') return;
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.before.length, 2); assert.equal(raw.after.length, 2);
    assert.ok(Array.isArray(raw.teaching)); assert.equal(raw.teaching.length, p.teaching_expectations.length);
    assert.ok(raw.teaching.length > 0);
    const student = raw.before[0].object, actualTeacher = raw.teaching[0].teacher;
    assert.ok(typeof student === 'string' && student.length > 0);
    for (const state of [raw.before[0], raw.after[0]]) {
        assert.equal(state.object, student);
        for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(present(state, key), 1);
        for (const key of ['wizardp', 'ghost']) assert.ok(zero(present(state, key)));
        equalEmpty(present(state, 'busy'), p.actor.busy ?? 0, '拜师不改变原忙乱');
    }
    let logical = initialState(p.actor), previous;
    const results = [];
    for (const [i, step] of raw.teaching.entries()) {
        const e = p.teaching_expectations[i], b = step.before, a = step.after;
        assert.equal(step.student, student); assert.equal(step.teacher_program, p.teacher.path);
        assert.ok(typeof step.teacher === 'string' && step.teacher.startsWith(p.teacher.path + '#'));
        assert.equal(step.teacher, actualTeacher, '不得更换原教师');
        assert.equal(step.command, e.action); assert.equal(e.command_kind, 'apprentice');
        assert.equal(step.command_accepted, e.command_accepted);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0);
        assert.ok(Number.isSafeInteger(step.wall_time) && step.wall_time > 0);
        assert.deepEqual(step.teacher_family, p.teacher_family); assert.equal(step.teacher_pending_recruit, '');
        checkPoint(b, p, `step${i}.before`); checkPoint(a, p, `step${i}.after`);
        if (previous) assert.deepEqual(b, previous, '重复/确认/取消不得中途重置');
        else {
            assert.deepEqual(b.recruitment.family, logical.family);
            equalEmpty(b.recruitment.family_present, logical.family_present ? 1 : 0, '原family映射存在性');
            assert.equal(b.recruitment.title, p.actor.properties.title);
            assert.equal(b.recruitment.pending_apprentice, ''); assert.equal(b.recruitment.pending_betrayer, '');
            assert.equal(present(b, 'contribution'), logical.contribution);
            assert.deepEqual(b.recruitment.quest, logical.quest); assert.deepEqual(b.recruitment.temp_quest, logical.temp_quest);
        }
        const decision = gumuRecruitDecision(teacher, p.actor, logical, step.command);
        logical = decision.state;
        assert.equal(e.result, decision.result); assert.equal(e.reason, decision.reason);
        assert.equal(e.command_accepted, decision.command_accepted);
        const recruited = ['first_join', 'same_family_transfer'].includes(decision.result);
        assert.equal(e.recruited, recruited); assert.deepEqual(e.family_after, logical.family);
        assert.equal(e.family_present, logical.family_present); assert.equal(e.created_family_in_sample, logical.new_family);
        const actualFamily = { ...a.recruitment.family };
        if (logical.new_family) {
            assert.ok(Number.isSafeInteger(actualFamily.enter_time) && actualFamily.enter_time > 0, '必须观察真实入门时间');
            if (recruited) assert.ok(actualFamily.enter_time >= step.wall_time && actualFamily.enter_time <= step.wall_time + Math.ceil(step.elapsed) + 1);
            else assert.equal(actualFamily.enter_time, b.recruitment.family.enter_time, '请安不得重写入门时间');
            delete actualFamily.enter_time;
        }
        assert.deepEqual(actualFamily, logical.family, '原师承结果不符');
        equalEmpty(a.recruitment.family_present, logical.family_present ? 1 : 0, 'family映射存在性');
        const title = logical.new_family ? `古墓派第${teacher.generation === 1 ? '二' : '四'}代传人` : p.actor.properties.title;
        assert.equal(e.title_after, title); assert.equal(a.recruitment.title, title);
        assert.equal(e.name_after, p.actor.properties.name); assert.equal(a.recruitment.name, e.name_after);
        assert.equal(e.class_after, p.actor.properties.class); assert.equal(a.recruitment.class, e.class_after);
        assert.deepEqual(e.flags_after, flags); assert.deepEqual(a.recruitment.flags, flags);
        for (const key of ['pending_apprentice', 'pending_betrayer']) {
            assert.equal(e[key], logical[key]); assert.equal(a.recruitment[key], logical[key] ? actualTeacher : '');
        }
        assert.equal(present(a, 'contribution'), logical.contribution); assert.equal(e.contribution_after, logical.contribution);
        assert.equal(b.contribution - a.contribution, e.contribution_spent);
        for (const key of ['quest', 'temp_quest']) {
            equalEmpty(a.recruitment[key], logical[key], '原任务清理/保留：' + key);
            assert.deepEqual(e[key + '_after'], logical[key]);
        }
        assert.deepEqual({ ...a, contribution: b.contribution, recruitment: b.recruitment,
            family: b.family, master_id: b.master_id, master_name: b.master_name }, b, '拜师改变未声明状态');
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages));
        for (const m of step.messages) { assert.equal(typeof m.category, 'string'); assert.equal(typeof m.text, 'string'); }
        results.push({ result: decision.result, recruited, command_accepted: step.command_accepted,
            contribution_cleared: e.contribution_spent, permanent_quest_cleared: decision.result === 'first_join',
            temporary_quest_cleared: decision.result === 'first_join' });
        previous = a;
    }
    assert.equal(results.some(r => r.recruited) ? 'observed' : 'refused', raw.outcome, '受理/请安不等于新拜师');
    const first = raw.teaching[0].before, last = raw.teaching.at(-1).after;
    for (const [s, point] of [[raw.before[0], first], [raw.after[0], last]]) {
        for (const key of ['jing', 'neili', 'max_neili', 'str']) assert.equal(s[key], point[key]);
        for (const key of ['skills', 'learned', 'mappings']) assert.deepEqual(s[key], point[key]);
    }
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        assert.ok(Number.isInteger(raw.before[0][key])); assert.equal(raw.after[0][key], raw.before[0][key]);
    }
    assert.deepEqual(raw.after[1], raw.before[1], '拜师不得改变旁观者');
    assert.ok(Array.isArray(raw.metrics)); assert.equal(raw.metrics.length, 2);
    for (const metric of raw.metrics) {
        assert.ok(mapping(metric));
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const direction of ['cost', 'recovery']) {
            const key = `${resource}_${direction}`;
            if (Object.hasOwn(metric, key)) assert.ok(Number.isInteger(metric[key]), '原账不可为null：' + key);
            assert.equal(metric[key] ?? 0, 0, '拜师无额外相抵费用：' + key);
        }
    }
    for (const key of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals'])
        assert.deepEqual(raw[key], [], '拜师不得引入攻击/回调：' + key);
    return results;
}

export function gumuRecruitEffects(rows, condition) {
    assert.equal(condition.parameters.teaching_profile, 'gumu-recruit');
    const steps = rows.flatMap(row => {
        assert.equal(row.condition_id, condition.id); assert.notEqual(row.raw.outcome, 'error');
        return validateGumuRecruitRecord(row.raw, condition);
    });
    return { samples: rows.length, commands: steps.length,
        command_accepted: steps.filter(s => s.command_accepted === 1).length,
        new_apprenticeships: steps.filter(s => s.recruited).length,
        results: Object.fromEntries(['first_join', 'same_family_transfer', 'greeted', 'confirmation', 'business_refused', 'public_refused', 'cancelled']
            .map(result => [result, steps.filter(s => s.result === result).length])),
        contribution_cleared: steps.reduce((n, s) => n + s.contribution_cleared, 0),
        permanent_quests_cleared: steps.filter(s => s.permanent_quest_cleared).length,
        temporary_quests_cleared: steps.filter(s => s.temporary_quest_cleared).length,
        resource_cost: 0, resource_recovery: 0 };
}
