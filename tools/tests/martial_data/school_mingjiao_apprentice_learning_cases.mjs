// Original Zhang Wuji apprentice/recruit and finite ordinary-learning window.
// Prerequisite skills are experimental inputs, not a completed cultivation chain.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution } from './statistics.mjs';
import { mingjiaoLingLearningSourcePaths } from './school_mingjiao_ling_learning_cases.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const copy = value => structuredClone(value);
const skill = 'shenghuo-ling', group = 'mingjiao-apprentice-learning';
const prefix = 'school-mingjiao-apprentice-learning-';
const teacher = { key: 'zhangwuji', id: 'zhang wuji', name: '张无忌', generation: 36,
    path: '/kungfu/class/mingjiao/zhangwuji' };
const history = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
const qualifications = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const grants = ['can_perform/shenghuo-ling/hua', 'can_perform/shenghuo-ling/lian',
    'can_perform/shenghuo-ling/xi', 'can_perform/shenghuo-ling/can'];
export const mingjiaoApprenticeLearningSourcePaths = [...new Set([
    ...mingjiaoLingLearningSourcePaths,
    'kungfu/class/mingjiao/zhangwuji.c', 'kungfu/class/mingjiao/mingjiao.h',
    'kungfu/skill/shenghuo-xinfa.c', 'cmds/skill/apprentice.c', 'cmds/skill/recruit.c',
    'feature/apprentice.c', 'feature/master.c', 'feature/coagent.c', 'feature/quester.c',
    'inherit/char/npc.c', 'include/login.h',
    'adm/daemons/chard.c', 'adm/daemons/race/human.c', 'feature/move.c', 'include/armor.h',
    'd/items/cloth.lpc', 'd/items/cloth_data.h', 'inherit/armor/cloth.c',
    'adm/daemons/virtuald.c', 'adm/single/master/object.c',
])];
export const mingjiaoApprenticeLearningReviewedSourceHash = '6aabe56de9ad24d797fa57584ba653b20a78aa428f107e3635fe827e15adad90';
export const mingjiaoApprenticeLearningAbsentPaths = [];
const sourceHash = e => sha(JSON.stringify(mingjiaoApprenticeLearningSourcePaths.map(path => [path, e[path]])));
const peer = family_name => ({ family_name, generation: 37, master_id: 'other master', master_name: '别位师父' });
const pool = { name: '试侠', gender: '男性', class: '', title: '普通百姓', character: '光明磊落',
    str: 36, int: 40, dex: 36, con: 36, shen: 90000, combat_exp: 800000,
    qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
    neili: 1000, max_neili: 2400, jingli: 1000, max_jingli: 1000,
    potential: 10000, learned_points: 0, gongxian: 4321, weiwang: 123, jiali: 0,
    quest: { name: '实验旧任务', count: 7 }, 'reborn/family_name': 0,
    ...Object.fromEntries([...history, ...qualifications, ...grants].map(k => [k, 0])) };
const actor = (family = null) => ({ skills: { force: 180, 'shenghuo-xinfa': 180,
    sword: 200, unarmed: 200, dodge: 200, parry: 200 }, mappings: {}, preparations: {},
    properties: { ...copy(pool), ...(family ? { family: copy(family) } : {}) },
    temp: { quest: { name: '实验临时任务', count: 3 } } });
const apprentice = () => ({ command_kind: 'apprentice', teacher_key: 'zhangwuji', action: 'apprentice zhang wuji' });
const cancel = () => ({ command_kind: 'apprentice', teacher_key: null, action: 'apprentice cancel' });
const learn = times => ({ command_kind: 'learn', teacher_key: 'zhangwuji', skill, times,
    action: `learn zhang wuji ${skill} ${times}` });
function plans() {
    const out = [];
    const add = (variant, a, steps, expected, random = false) => out.push({
        id: prefix + variant, stage: 'school', method: 'teaching', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, teaching_profile: group,
            teaching_kind: steps.some(s => s.command_kind === 'learn') ? 'ordinary-learning' : 'apprenticeship',
            variant, skill, usage: 'sword', level: a.skills[skill] ?? 0, actor: a,
            target: { skills: {}, mappings: {}, preparations: {}, properties: { qi: 10000,
                eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
                neili: 1000, max_neili: 2400, str: 36, int: 40, dex: 36, con: 36 } },
            teacher: copy(teacher), teaching_expectations: steps, action: steps[0].action,
            monitored_grants: grants, qualification_sources: mingjiaoApprenticeLearningSourcePaths,
            named_participants: true, fighting: false, observe_seconds: 0, not_applicable: '',
            expected, random_observation: random,
            note: '原非巫师USER拜师/原NPC收徒和普通learn。前置修为为显式实验输入；不预写本组师承/领悟，不代表完整养成或四ask证据恢复。' } });
    add('apprentice-new-repeat', actor(), [apprentice(), apprentice()], 'observed');
    add('apprentice-peer-repeat', actor(peer('明教')), [apprentice(), apprentice()], 'observed');
    for (const [variant, key] of [['detach', history[0]], ['betrayer', history[1]], ['betrayer-times', history[2]]]) {
        const a = actor(peer('明教')); a.properties[key] = 1;
        add('apprentice-' + variant, a, [apprentice()], 'refused');
    }
    add('apprentice-foreign-confirm', actor(peer('武当派')), [apprentice(), apprentice()], 'refused');
    for (const [variant, edit] of [
        ['shen89999', a => { a.properties.shen = 89999; }],
        ['xinfa179', a => { a.skills['shenghuo-xinfa'] = 179; }],
        ['force179', a => { a.skills.force = 179; }],
        ['exp799999', a => { a.properties.combat_exp = 799999; }],
        ['busy', a => { a.busy = 1; }],
    ]) { const a = actor(peer('明教')); edit(a); add('apprentice-' + variant, a, [apprentice()], 'refused'); }
    const abandoned = actor(peer('明教')); abandoned.properties.shen = 89999;
    add('apprentice-cancel', abandoned, [apprentice(), cancel()], 'refused');
    const learningActor = level => { const a = actor(peer('明教')); a.skills.force = 200;
        if (level) a.skills[skill] = level;
        a.properties.combat_exp = 10000000; return a; };
    for (const level of [0, 179, 199]) add('learn-' + level, learningActor(level), [apprentice(), learn(1)], 'observed', true);
    const partial = learningActor(199); partial.properties.jing = 24;
    add('learn-partial3', partial, [apprentice(), learn(3)], 'observed', true);
    add('learn-cap200', learningActor(200), [apprentice(), learn(1)], 'refused');
    add('learn-other-master', learningActor(179), [learn(1)], 'refused');
    const poor = learningActor(179); poor.properties.potential = 0;
    add('learn-no-potential', poor, [apprentice(), learn(1)], 'refused');
    return out;
}

const map = value => { assert.ok(value && typeof value === 'object' && !Array.isArray(value)); return value; };
const own = (value, key) => { assert.ok(Object.hasOwn(map(value), key), 'missing ' + key); return value[key]; };
const num = value => { if (value === null) return 0; assert.ok(Number.isSafeInteger(value)); return value; };
const equal = (value, expected) => expected === 0 ? assert.equal(num(value), 0) : assert.deepEqual(value, expected);
const plain = value => { assert.equal(typeof value, 'string'); return value.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
function checkedParameters(c) {
    const plan = plans().find(p => p.id === c.id); assert.ok(plan, 'unknown finite condition');
    assert.equal(c.method, 'teaching'); assert.equal(c.stage, 'school');
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0);
    if (!plan.parameters.random_observation) assert.equal(c.samples, 2);
    const { source_evidence, qualification_evidence, absent_sources, teacher_levels, teaching_entry,
        teacher: actualTeacher, ...rest } = map(c.parameters);
    const { teacher: plannedTeacher, ...expected } = plan.parameters; assert.deepEqual(rest, expected);
    assert.deepEqual(Object.keys(map(source_evidence)), mingjiaoApprenticeLearningSourcePaths);
    for (const hash of Object.values(source_evidence)) assert.match(hash, /^[a-f0-9]{64}$/);
    assert.equal(sourceHash(source_evidence), mingjiaoApprenticeLearningReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoApprenticeLearningSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    assert.deepEqual(absent_sources, []);
    assert.deepEqual(actualTeacher, { ...plannedTeacher, sha256: source_evidence['kungfu/class/mingjiao/zhangwuji.c'] });
    assert.deepEqual(teaching_entry, { id: 'kungfu/class/mingjiao/zhangwuji.c:12:create',
        path: 'kungfu/class/mingjiao/zhangwuji.c', sha256: actualTeacher.sha256,
        line: 12, function: 'create', role: 'teaching' });
    assert.equal(c.entry_id, teaching_entry.id);
    assert.deepEqual(teacher_levels, { force: 360, unarmed: 340, dodge: 340, parry: 340, cuff: 340,
        sword: 340, 'jiuyang-shengong': 360, 'shenghuo-shengong': 360, 'shenghuo-xinfa': 360,
        'qiankun-danuoyi': 360, 'shenghuo-bu': 340, 'qishang-quan': 340, 'taiji-quan': 340,
        'taiji-jian': 340, [skill]: 340 });
    return c.parameters;
}
function state(p) {
    return { q: copy(p.actor.properties), skills: copy(p.actor.skills), learned: {},
        mappings: {}, quest: copy(p.actor.temp.quest), pending: '', betrayer: '', busy: p.actor.busy ?? 0 };
}
function point(actual, s, teacherId) {
    const q = s.q;
    for (const [field, key] of [['contribution', 'gongxian'], ['jing', 'jing'], ['neili', 'neili'],
        ['max_neili', 'max_neili'], ['max_jingli', 'max_jingli'], ['potential', 'potential'],
        ['learned_points', 'learned_points'], ['combat_exp', 'combat_exp'], ['shen', 'shen'],
        ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'], ['dex', 'dex'], ['con', 'con'], ['character', 'character']])
        equal(own(actual, field), q[key]);
    assert.equal(own(actual, 'effective_str'), q.str + Math.trunc(s.skills.unarmed / 10));
    assert.equal(own(actual, 'effective_int'), q.int);
    assert.equal(own(actual, 'effective_dex'), q.dex + Math.trunc(s.skills.dodge / 10));
    assert.equal(own(actual, 'effective_force'), Math.trunc(s.skills.force / 2));
    assert.equal(own(actual, 'effective_dodge'), Math.trunc(s.skills.dodge / 2));
    assert.deepEqual(own(actual, 'skills'), s.skills); assert.deepEqual(own(actual, 'learned'), s.learned);
    assert.deepEqual(own(actual, 'mappings'), s.mappings);
    assert.deepEqual(own(actual, 'grants'), Object.fromEntries(grants.map(k => [k, 0])));
    equal(own(actual, 'reborn_family'), 0);
    const r = map(own(actual, 'recruitment'));
    assert.deepEqual(own(r, 'family'), q.family ?? {}); equal(own(r, 'family_present'), Number(!!q.family));
    for (const key of ['name', 'class', 'title']) assert.equal(own(r, key), q[key]);
    assert.deepEqual(Object.keys(map(own(r, 'history'))).sort(), [...history].sort());
    for (const key of history) equal(own(r.history, key), q[key]);
    equal(own(r, 'quest'), q.quest ?? 0); equal(own(r, 'temp_quest'), s.quest ?? 0);
    assert.equal(own(r, 'pending_apprentice'), s.pending ? teacherId : '');
    assert.equal(own(r, 'pending_betrayer'), s.betrayer ? teacherId : '');
    for (const [field, key] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
        equal(own(actual, field), q.family?.[key] ?? 0);
    assert.deepEqual(Object.keys(map(own(actual, 'qualification'))).sort(), [...qualifications].sort());
    for (const key of qualifications) equal(own(actual.qualification, key), q[key]);
}
// Finite support of original F_SKILL, not a fabricated record of hidden random().
export function mingjiaoApprenticeLearningProgress(level, learned, count) {
    const rand = Math.trunc((40 + Math.trunc(level / 5)) / 2);
    let states = [{ level, learned, gross: 0, upgrades: 0 }];
    for (let n = 0; n < count; n++) {
        const next = new Map();
        for (const s of states) for (let input = 4; input < 4 + rand; input++) {
            const gain = 1 + Math.trunc(input * 100 / (s.level + 100));
            const upgraded = s.learned + gain > (s.level + 1) ** 2;
            const v = { level: s.level + Number(upgraded), learned: upgraded ? 0 : s.learned + gain,
                gross: s.gross + gain, upgrades: s.upgrades + Number(upgraded) };
            next.set(JSON.stringify(v), v);
        }
        states = [...next.values()];
    }
    return states;
}
function decide(s, step) {
    const q = s.q, d = { accepted: 1, recruited: false, completed: 0, jing_cost: 0,
        jing_writeoff: 0, result: 'refused', support: [], skill: null, first_join: false };
    if (step.command_kind === 'apprentice') {
        if (s.busy) return { ...d, accepted: 0, result: 'busy', notice: '你现在正忙着呢。' };
        if (step.action === 'apprentice cancel') {
            assert.ok(s.pending); s.pending = ''; return { ...d, result: 'cancelled', notice: '你改变主意不想拜张无忌为师了。' };
        }
        if (q.family?.master_id === teacher.id && q.family.master_name === teacher.name)
            return { ...d, result: 'greeting', notice: '师父！' };
        if (q.family && q.family.family_name !== '明教' && !s.betrayer) {
            s.betrayer = 'zhangwuji'; return { ...d, result: 'betrayer-confirmation', notice: '如果你下了决心，就再输入一次这条命令。' };
        }
        s.pending = 'zhangwuji';
        if (q[history[0]] || q[history[1]]) return { ...d, notice: '我们明教教规你还记得吗，你还有脸回来！' };
        if (q[history[2]]) return { ...d, notice: '哼，阁下不忠不信，我们明教可不会收留。' };
        if (q.family && q.family.family_name !== '明教') return { ...d, notice: '阁下既有了师承，还来我们明教做什么？' };
        if (q.shen < 90000) return { ...d, notice: '你行侠仗义的事做得还不够，还是请回吧。' };
        if (s.skills['shenghuo-xinfa'] < 180) return { ...d, notice: '你圣火心法不够娴熟，还是下去多练习一下吧！' };
        if (s.skills.force < 180) return { ...d, notice: '你基本内功火候不够，怎么学我明教的圣火神功！' };
        if (q.combat_exp < 800000) return { ...d, notice: '你江湖经验还不够，下去多磨练一下吧！' };
        const first = !q.family;
        if (first) { q.gongxian = 0; delete q.quest; s.quest = 0; }
        q.class = 'fighter'; q.title = '明教第三十七代传人';
        q.family = { master_id: teacher.id, master_name: teacher.name, family_name: '明教',
            generation: 37, enter_time: 0, title: '传人', privs: 0 };
        s.pending = ''; return { ...d, recruited: true, first_join: first, result: 'recruited', notice: '恭喜您成为明教的第三十七代弟子。' };
    }
    assert.equal(step.command_kind, 'learn'); d.skill = skill;
    if (q.family?.master_id !== teacher.id || q.family.master_name !== teacher.name)
        return { ...d, accepted: 0, result: 'not-apprentice', notice: null };
    const level = s.skills[skill] ?? 0;
    if (level >= 200) return { ...d, result: 'learning-cap', notice: '我就不再教你，你自己多研究吧。' };
    assert.ok(s.skills.force >= 200 && s.skills.sword >= 200 && q.max_neili >= 2400
        && q.int >= 32 && q.str + Math.trunc(s.skills.unarmed / 10) >= 35
        && q.int >= 40 && q.dex + Math.trunc(s.skills.dodge / 10) >= 35);
    if (!level) s.skills[skill] = 0; // Original learn set_skill(0) precedes potential guard.
    if (q.potential - q.learned_points < step.times)
        return { ...d, accepted: 0, result: 'no-potential', notice: '你的潜能不够学习这么多次了。' };
    const fee = Math.trunc((100 + level * 2) / q.int) * (level ? 1 : 2);
    const completed = Math.min(step.times, Math.trunc(q.jing / fee));
    const writeoff = completed < step.times ? q.jing - completed * fee : 0;
    const support = mingjiaoApprenticeLearningProgress(level, s.learned[skill] ?? 0, completed);
    q.jing -= completed * fee + writeoff; q.learned_points += completed;
    return { ...d, completed, jing_cost: completed * fee + writeoff, jing_writeoff: writeoff,
        support, result: completed === step.times ? 'learned' : 'partial-learning',
        notice: completed < step.times ? '但是你今天太累了，学习了二次以后只好先停下来。\n' : null };
}

function preparations(raw, p, student) {
    const all = own(raw, 'teacher_preparations'), cleanups = own(raw, 'teacher_cleanups');
    assert.ok(Array.isArray(all)); assert.equal(all.length, 1); assert.ok(Array.isArray(cleanups)); assert.equal(cleanups.length, 1);
    const prep = all[0]; assert.equal(own(prep, 'key'), 'zhangwuji'); assert.equal(own(prep, 'command'), 'test_interface');
    assert.equal(own(prep, 'entry_actor'), student); assert.equal(own(prep, 'return_actor'), student);
    assert.equal(own(prep, 'initializer_actor'), 'not_observed'); assert.equal(own(prep, 'teacher_program'), teacher.path);
    const id = own(prep, 'teacher'); assert.match(id, /^\/kungfu\/class\/mingjiao\/zhangwuji#\d+$/);
    const npc = own(prep, 'teacher_state'); assert.equal(own(npc, 'object'), id); assert.equal(own(npc, 'id'), teacher.id);
    assert.equal(own(npc, 'living'), 1); equal(own(npc, 'playerp'), 0); assert.deepEqual(own(npc, 'skills'), p.teacher_levels);
    assert.deepEqual(own(prep, 'before'), own(prep, 'after'), 'teacher preparation cannot mutate the student');
    for (const key of ['object', 'id', 'userp', 'playerp', 'interactive', 'skills', 'learned', 'mappings',
        'jing', 'qi', 'neili', 'max_neili', 'potential', 'learned_points'])
        assert.deepEqual(own(prep.before, key), own(raw.before[0], key));
    for (const [key, heartbeat] of [['autonomy_before', 1], ['autonomy_after', 0]]) {
        const a = own(prep, key); assert.equal(own(a, 'heartbeat'), heartbeat);
        assert.equal(own(a, 'blueprint'), teacher.path); equal(own(a, 'blueprint_heartbeat'), 0);
        assert.deepEqual(own(a, 'callbacks'), []);
    }
    const cleanup = cleanups[0]; assert.equal(own(cleanup, 'object'), id);
    equal(own(cleanup, 'pending'), 0); equal(own(cleanup, 'object_exists'), 0);
    const load = own(raw, 'skill_load_context');
    assert.deepEqual(Object.keys(map(load)).sort(), ['actor', 'already_loaded', 'skills', 'command', 'function', 'argument', 'result'].sort());
    assert.equal(load.actor, student); assert.ok([0, 1].includes(load.already_loaded));
    assert.deepEqual(load.skills, p.actor.skills); assert.equal(load.command, 'test_interface');
    assert.equal(load.function, 'valid_enable'); assert.equal(load.argument, 'sword'); assert.equal(load.result, 1);
    return id;
}
function boundary(raw, pointState, p, student) {
    assert.equal(own(raw, 'object'), student); assert.equal(own(raw, 'id'), 'left');
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(raw, key), 1);
    for (const key of ['wizardp', 'ghost']) equal(own(raw, key), 0);
    equal(own(raw, 'busy'), p.actor.busy ?? 0);
    for (const key of ['jing', 'neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'con', 'dex', 'combat_exp'])
        assert.deepEqual(own(raw, key), own(pointState, key));
    for (const key of ['skills', 'learned', 'mappings']) assert.deepEqual(own(raw, key), own(pointState, key));
    // The original snapshot queries effective levels for exactly the currently owned skills.
    // This slice has no mappings or skill apply offsets; the new raw level-one entry is effective zero.
    assert.deepEqual(own(raw, 'effective_skills'), Object.fromEntries(Object.entries(pointState.skills)
        .map(([id, level]) => [id, Math.trunc(level / 2)])));
    assert.deepEqual(own(raw, 'preparations'), {});
    for (const key of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli'])
        assert.equal(own(raw, key), p.actor.properties[key]);
    for (const key of ['weapon', 'handing', 'secondary_weapon']) assert.equal(own(raw, key), 'none');
    for (const key of ['weapon_details', 'handing_details', 'secondary_weapon_details']) assert.deepEqual(own(raw, key), {});
    assert.equal(own(raw, 'weapon_damage'), 0); assert.equal(own(raw, 'weapon_flag'), 0);
    assert.deepEqual(own(own(raw, 'temp'), 'apply'), { armor: 100 });
    for (const key of ['effective_str', 'effective_int', 'effective_dex']) assert.equal(own(raw, key), own(pointState, key));
    equal(own(own(raw, 'cultivation'), 'class'), pointState.recruitment.class);
    equal(own(raw.cultivation, 'family/family_name'), pointState.family);
}
export function validateMingjiaoApprenticeLearningRecord(raw, condition) {
    const p = checkedParameters(condition);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), 'teaching');
    const index = own(raw, 'index'); assert.ok(Number.isSafeInteger(index) && index >= 0 && index < condition.samples);
    const outcome = own(raw, 'outcome');
    if (outcome === 'error' || outcome === 'not_applicable') return [];
    assert.equal(outcome, p.expected);
    assert.ok(Array.isArray(own(raw, 'before')) && raw.before.length === 2);
    assert.ok(Array.isArray(own(raw, 'after')) && raw.after.length === 2);
    const student = own(raw.before[0], 'object'); assert.match(student, /^\/tests\/teaching_actor#\d+$/);
    const teacherId = preparations(raw, p, student), steps = own(raw, 'teaching');
    assert.ok(Array.isArray(steps)); assert.equal(steps.length, p.teaching_expectations.length);
    const s = state(p), summaries = []; let previous;
    for (const [index, step] of steps.entries()) {
        const instruction = p.teaching_expectations[index], before = own(step, 'before'), after = own(step, 'after');
        assert.equal(own(step, 'student'), student);
        const hasTeacher = !!instruction.teacher_key;
        for (const key of ['teacher', 'resolved_teacher']) assert.equal(own(step, key), hasTeacher ? teacherId : 'none');
        assert.equal(own(step, 'teacher_program'), hasTeacher ? teacher.path : 'none');
        assert.deepEqual(own(step, 'teacher_skills'), hasTeacher ? p.teacher_levels : {});
        if (instruction.command_kind === 'apprentice') assert.deepEqual(own(step, 'teacher_family'), hasTeacher ? { family_name: '明教', generation: 36 } : {});
        assert.equal(own(step, 'command'), instruction.action);
        equal(own(step, 'teacher_pending_recruit_before'), ''); equal(own(step, 'teacher_pending_recruit'), '');
        assert.ok(Number.isSafeInteger(own(step, 'command_accepted')) && step.command_accepted >= 0);
        assert.ok(Number.isFinite(own(step, 'elapsed')) && step.elapsed >= 0);
        assert.ok(Number.isSafeInteger(own(step, 'wall_time')) && step.wall_time > 0);
        point(before, s, teacherId); if (previous) assert.deepEqual(before, previous, 'no inter-step refill or grants');
        const d = decide(s, instruction);
        assert.equal(Number(step.command_accepted > 0), d.accepted, 'original command execution cost is not its gameplay success');
        if (d.recruited) {
            const time = own(own(own(after, 'recruitment'), 'family'), 'enter_time');
            assert.ok(Number.isSafeInteger(time) && time >= step.wall_time && time <= step.wall_time + Math.ceil(step.elapsed) + 1);
            s.q.family.enter_time = time;
        }
        let matches = [];
        if (d.completed) {
            matches = d.support.filter(v => v.level === after.skills?.[skill] && v.learned === after.learned?.[skill]);
            assert.ok(matches.length > 0, 'progress endpoint outside original integer/random support');
            s.skills[skill] = matches[0].level; s.learned[skill] = matches[0].learned;
        }
        point(after, s, teacherId);
        const a = copy(after), b = copy(before);
        for (const key of ['contribution', 'jing', 'skills', 'learned', 'learned_points', 'recruitment', 'family', 'master_id', 'master_name']) {
            delete a[key]; delete b[key];
        }
        assert.deepEqual(a, b, 'unrelated observed state cannot change');
        assert.equal(own(step, 'message_scope'), 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(own(step, 'messages')));
        const messages = step.messages.map(m => { assert.equal(typeof own(m, 'category'), 'string'); return plain(own(m, 'text')); }).join('');
        // Command-level notify_fail is not guaranteed to be delivered through receive_message.
        if (d.notice && d.accepted) assert.ok(messages.includes(d.notice), 'original source notice absent');
        const gross = [...new Set(matches.map(m => m.gross))];
        summaries.push({ command_kind: instruction.command_kind, result: d.result, accepted: d.accepted,
            execution_cost: step.command_accepted, recruited: d.recruited, first_join: d.first_join,
            tested: p.teaching_kind === 'apprenticeship' || instruction.command_kind === 'learn',
            completed: d.completed, jing_cost: d.jing_cost, jing_writeoff: d.jing_writeoff,
            skill: d.skill, learned_net: d.completed ? s.learned[skill] - (before.learned[skill] ?? 0) : 0,
            upgrades: d.completed ? matches[0].upgrades : 0,
            gross_learned: !d.completed ? 0 : gross.length === 1 ? gross[0] : null });
        previous = after;
    }
    boundary(raw.before[0], steps[0].before, p, student); boundary(raw.after[0], steps.at(-1).after, p, student);
    assert.deepEqual(raw.before[1], raw.after[1], 'unrelated USER unchanged');
    const a = copy(raw.after[0]), b = copy(raw.before[0]);
    for (const key of ['jing', 'skills', 'effective_skills', 'learned', 'learned_points', 'temp', 'cultivation']) { delete a[key]; delete b[key]; }
    assert.deepEqual(a, b, 'sample state outside observed learning/family transition changed');
    const beforeCultivation = copy(raw.before[0].cultivation), afterCultivation = copy(raw.after[0].cultivation);
    for (const key of ['class', 'family/family_name']) { delete beforeCultivation[key]; delete afterCultivation[key]; }
    assert.deepEqual(beforeCultivation, afterCultivation, 'only real apprenticeship may change class/family');
    const beforeTemp = copy(raw.before[0].temp), afterTemp = copy(raw.after[0].temp);
    // Original commands update pending, notify_fail and learn throttle; original recruit may delete quest.
    for (const key of ['pending', 'notify_fail', 'time', 'quest']) { delete beforeTemp[key]; delete afterTemp[key]; }
    assert.deepEqual(beforeTemp, afterTemp);
    assert.ok(Array.isArray(own(raw, 'metrics')) && raw.metrics.length === 2);
    const jing = summaries.reduce((sum, d) => sum + d.jing_cost, 0);
    for (const [side, metrics] of raw.metrics.entries()) {
        for (const [key, value] of Object.entries(map(metrics))) assert.ok(Number.isSafeInteger(value) && value >= 0, key);
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) for (const direction of ['cost', 'recovery'])
            assert.equal(metrics[resource + '_' + direction] ?? 0, side === 0 && resource === 'jing' && direction === 'cost' ? jing : 0);
        for (const key of ['ordinary', 'hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) assert.equal(metrics[key] ?? 0, 0);
        for (const [key, value] of Object.entries(metrics)) if (key !== 'jing_cost' || side !== 0)
            assert.equal(value, 0, 'no unrelated positive metric in synchronous teaching window');
    }
    for (const key of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(own(raw, key), []);
    const advanced = summaries.filter(s => s.tested).some(s => p.teaching_kind === 'ordinary-learning' ? s.completed > 0 : s.recruited);
    assert.equal(raw.outcome, advanced ? 'observed' : 'refused'); return summaries;
}
export function mingjiaoApprenticeLearningEffects(rows, condition) {
    let unknown = 0; const values = [], tested = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.method, condition.method); assert.equal(row.outcome, row.raw.outcome);
        const s = validateMingjiaoApprenticeLearningRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) { unknown++; continue; }
        values.push(...s); tested.push(...s.filter(v => v.tested));
    }
    const sum = key => values.length ? values.reduce((n, s) => n + Number(s[key]), 0) : null;
    const dist = key => distribution(tested.map(s => s[key]).filter(v => v !== null));
    return { package: condition.parameters.teaching_kind, samples: rows.length, validated: rows.length - unknown, unknown,
        commands: values.length, tested_commands: tested.length, commands_accepted: sum('accepted'),
        command_execution_cost: sum('execution_cost'), formal_apprenticeships: sum('recruited'),
        setup_apprenticeships: values.filter(v => !v.tested && v.recruited).length,
        first_join_cleared: values.filter(v => v.first_join).length,
        learned_iterations: sum('completed'), learned_points: sum('completed'), jing_cost: sum('jing_cost'),
        jing_writeoff: sum('jing_writeoff'), upgrades: sum('upgrades'), learned_net: dist('learned_net'),
        gross_learned: dist('gross_learned'), unknown_gross_learned_commands: tested.filter(s => s.gross_learned === null).length,
        results: Object.fromEntries([...new Set(tested.map(v => v.result))].sort().map(result => [result, tested.filter(v => v.result === result).length])),
        unknown_scopes: ['initial prerequisites are experiment inputs, not full natural acquisition',
            'hidden random learning inputs are not observed; gross after upgrade reset can remain ambiguous',
            'four prior ask-topic statistics are historical and not resampled in this slice'] };
}
export function mingjiaoApprenticeLearningConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoApprenticeLearningSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(sourceHash(evidence), mingjiaoApprenticeLearningReviewedSourceHash, '来源改变须重新核对');
    assert.equal(catalog.skills.find(s => s.id === skill)?.sha256, evidence['kungfu/skill/' + skill + '.c']);
    const text = readSource('kungfu/class/mingjiao/zhangwuji.c').toString();
    const teacher_levels = Object.fromEntries([...text.matchAll(/set_skill\("([^"]+)", (\d+)\)/g)].map(m => [m[1], Number(m[2])]));
    assert.equal(Object.keys(teacher_levels).length, 15); assert.equal(teacher_levels[skill], 340);
    const path = 'kungfu/class/mingjiao/zhangwuji.c', line = text.split('\n').findIndex(s => /^void create\(/.test(s)) + 1;
    const entry = { id: `${path}:${line}:create`, path, sha256: evidence[path], line, function: 'create', role: 'teaching' };
    return plans().map(c => ({ ...c, entry_id: entry.id, samples: smoke || !c.parameters.random_observation ? 2 : samples,
        status: 'configured_not_executed', parameters: { ...c.parameters, source_evidence: evidence,
            qualification_evidence: mingjiaoApprenticeLearningSourcePaths.map(path => ({ path, sha256: evidence[path] })),
            absent_sources: [], teacher_levels, teaching_entry: entry,
            teacher: { ...c.parameters.teacher, sha256: evidence[path] } } }));
}
