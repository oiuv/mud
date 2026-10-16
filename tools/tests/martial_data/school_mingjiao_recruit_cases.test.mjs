import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoTeachers } from './school_mingjiao_teachers_cases.mjs';
import { mingjiaoRecruitConditions as conditions, mingjiaoRecruitSourcePaths as sources,
    validateMingjiaoRecruitCondition, validateMingjiaoRecruitRecord as validate,
    mingjiaoRecruitEffects as effects } from './school_mingjiao_recruit_cases.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const read = p => fs.readFileSync(path.join(root, p));
const hash = v => createHash('sha256').update(v).digest('hex');
const catalog = { skills: [{ id: 'shenghuo-ling', sha256: hash(read('kungfu/skill/shenghuo-ling.c')) }] };
const cases = conditions(catalog, read), copy = v => structuredClone(v);
const get = (key, variant) => cases.find(c => c.parameters.teacher.key === key && c.parameters.variant === variant);
const student = '/tests/teaching_actor#1';
const histories = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
const quals = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const names = { lengqian: '明教五散人', weiyixiao: '明教青翼蝠王', xiexun: '明教金毛狮王', daijisi: '明教紫衫龙王',
    yintianzheng: '明教白眉鹰王', yangxiao: '明教光明左使', fanyao: '明教光明右使', xiaozhao: '' };
function point(s, id) {
    const q = s.q;
    return { contribution: q.gongxian, jing: q.jing, neili: q.neili, max_neili: q.max_neili,
        max_jingli: q.max_jingli, potential: q.potential, learned_points: q.learned_points,
        combat_exp: q.combat_exp, shen: q.shen, weiwang: q.weiwang,
        str: q.str, int: q.int, dex: q.dex, con: q.con, character: q.character,
        gender: q.gender, busy: s.busy, born_family: 0,
        effective_str: q.str + Math.trunc(s.skills.unarmed / 10), effective_int: q.int,
        effective_dex: q.dex + Math.trunc(s.skills.dodge / 10), effective_force: Math.trunc(s.skills.force / 2),
        effective_dodge: Math.trunc(s.skills.dodge / 2), skills: copy(s.skills), learned: {}, mappings: {}, grants: {},
        reborn_family: q['reborn/family_name'], family: q.family?.family_name ?? 0,
        master_id: q.family?.master_id ?? 0, master_name: q.family?.master_name ?? 0,
        qualification: Object.fromEntries(quals.map(k => [k, q[k]])), recruitment: {
            family: copy(q.family ?? {}), family_present: Number(!!q.family), name: q.name, class: q.class, title: q.title,
            history: Object.fromEntries(histories.map(k => [k, q[k]])), quest: copy(q.quest ?? 0), temp_quest: copy(s.quest),
            pending_apprentice: s.pending ? id : '', pending_betrayer: s.betrayer ? id : '' } };
}
function snapshot(s, id) {
    const v = point(s, id), q = s.q;
    return { object: student, id: 'left', userp: 1, playerp: 1, interactive: 1, living: 1,
        wizardp: 0, ghost: 0, busy: s.busy,
        ...Object.fromEntries(['jing', 'neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'dex', 'con',
            'combat_exp', 'effective_str', 'effective_int', 'effective_dex'].map(k => [k, v[k]])),
        ...Object.fromEntries(['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli'].map(k => [k, q[k]])),
        skills: copy(s.skills), effective_skills: Object.fromEntries(Object.entries(s.skills).map(([k, n]) => [k, Math.trunc(n / 2)])),
        learned: {}, mappings: {}, preparations: {}, weapon: 'none', handing: 'none', secondary_weapon: 'none',
        weapon_details: {}, handing_details: {}, secondary_weapon_details: {}, weapon_damage: 0, weapon_flag: 0,
        temp: { apply: { armor: 100 } }, cultivation: { class: q.class, born_family: 0, 'family/family_name': q.family?.family_name ?? 0 } };
}
function npc(t, id) {
    return { object: id, id: t.id, living: 1, playerp: 0, skills: copy(t.levels),
        class: t.key === 'lengqian' ? 'fighter' : t.key === 'fanyao' ? 'bonze' : '', born_family: 0,
        inherit_title: 0, attempt_source: ['fanyao', 'xiaozhao'].includes(t.key) ? 0 : t.path,
        title: names[t.key], family_present: Number(t.family !== null),
        family: t.family === null ? {} : { family_name: '明教', generation: t.generation,
            title: t.key === 'fanyao' ? '光明右使' : '弟子', privs: -1 } };
}
// Pure synthetic source endpoints. These fixtures do not create objects or prove gameplay.
function fixture(c) {
    const p = c.parameters, t = mingjiaoTeachers.find(t => t.key === p.teacher.key), id = t.path + '#3';
    const s = { q: copy(p.actor.properties), skills: copy(p.actor.skills), quest: copy(p.actor.temp.quest),
        pending: false, betrayer: false, busy: p.actor.busy ?? 0 };
    const before = snapshot(s, id), steps = [], teacherState = npc(t, id), wall = 1791990000;
    for (const [i, cmd] of p.teaching_expectations.entries()) {
        const b = point(s, id); let accepted = 7, message = '';
        if (s.busy || ['same-generation', 'older-generation', 'no-family'].includes(p.variant)) accepted = 0;
        else if (cmd.teacher_key === null) {
            if (!s.pending) accepted = 0;
            else { s.pending = false; message = '你改变主意不想拜' + t.name + '为师了。'; }
        } else if (p.variant === 'reborn-recognition' || s.q.family?.master_id === t.id) message = '师父！';
        else if (p.variant === 'foreign-confirm-cancel' && !s.betrayer) {
            s.betrayer = true; message = '如果你下了决心，就再输入一次这条命令。';
        } else if (s.pending) accepted = 0;
        else if (['new-repeat', 'peer-repeat'].includes(p.variant)) {
            if (!s.q.family) { s.q.gongxian = 0; delete s.q.quest; s.quest = 0; }
            const generation = t.generation + 1, chinese = generation === 38 ? '三十八' : '三十七';
            s.q.family = { master_id: t.id, master_name: t.name, family_name: '明教', generation,
                enter_time: wall, title: '传人', privs: 0 };
            if (t.key === 'lengqian') s.q.class = 'fighter';
            s.q.title = '明教第' + chinese + '代传人'; message = '恭喜您成为明教的第' + chinese + '代弟子。';
        } else {
            s.pending = true;
            if (['detach', 'betrayer'].includes(p.variant)) message = '我们明教教规你还记得吗，你还有脸回来！';
            else if (p.variant === 'betrayer-times') message = '哼，阁下不忠不信，我们明教可不会收留。';
            else if (p.variant === 'foreign-confirm-cancel') message = '阁下既有了师承，还来我们明教做什么？';
            else if (p.variant === 'shen-below-retry') message = t.key === 'lengqian'
                ? '阁下身染邪气，还是及早回头得好。' : '你行侠仗义的事做得还不够，还是请回吧。';
            else if (p.variant === 'xinfa-below') message = '你圣火心法不够娴熟，还是下去多练习一下吧！';
            else if (p.variant === 'dodge-below') message = t.key === 'weiyixiao'
                ? '你基本轻功火候不够，怎么学我的青蝠身法！' : '你基本轻功火候不够，怎么学我的逍遥剑法！';
            else if (p.variant === 'exp-below') message = t.key === 'yangxiao'
                ? '你江湖经验尚浅，还是去多闯荡一下吧！' : '你江湖经验不足，还是多磨练一下吧！';
        }
        const hasTeacher = cmd.teacher_key !== null;
        steps.push({ student, teacher: hasTeacher ? id : 'none', resolved_teacher: hasTeacher ? id : 'none',
            teacher_program: hasTeacher ? t.path : 'none', teacher_skills: hasTeacher ? copy(t.levels) : {},
            teacher_family: hasTeacher && t.family ? { family_name: t.family, generation: t.generation } : {},
            ...(hasTeacher ? { teacher_before: copy(teacherState), teacher_after: copy(teacherState) } : {}),
            teacher_pending_recruit_before: '', teacher_pending_recruit: '', command: cmd.action,
            command_accepted: accepted, wall_time: wall, elapsed: 0.001, before: b, after: point(s, id),
            message_scope: 'receive_message_apply_input_not_full_transcript',
            messages: message ? [{ category: 'vision', text: message }] : [] });
    }
    const autonomy = heartbeat => ({ heartbeat, blueprint: t.path, blueprint_heartbeat: 0, callbacks: [] });
    return { kind: 'sample', condition_id: c.id, index: 0, method: 'teaching', outcome: p.expected, elapsed: 0.01,
        before: [before, { object: '/tests/teaching_actor#2' }], after: [snapshot(s, id), { object: '/tests/teaching_actor#2' }],
        teaching: steps, skill_load_context: { actor: student, already_loaded: 0, skills: copy(p.actor.skills),
            command: 'test_interface', function: 'valid_enable', argument: 'sword', result: 1 },
        teacher_preparations: [{ key: t.key, command: 'test_interface', entry_actor: student, return_actor: student,
            initializer_actor: 'not_observed', teacher: id, teacher_program: t.path, teacher_state: teacherState,
            before: copy(before), after: copy(before), autonomy_before: autonomy(1), autonomy_after: autonomy(0) }],
        teacher_cleanups: [{ object: id, pending: 0, object_exists: 0 }], metrics: [{}, {}],
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
const bad = (c, edit) => { const raw = fixture(c); edit(raw); assert.throws(() => validate(raw, c)); };
test('85 finite conditions/170 samples/302 original commands and 116 frozen public sources', () => {
    assert.equal(cases.length, 85); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 170);
    assert.equal(cases.reduce((n, c) => n + c.samples * c.parameters.teaching_expectations.length, 0), 302);
    assert.equal(conditions(catalog, read, { smoke: true }).reduce((n, c) => n + c.samples, 0), 170);
    assert.equal(sources.length, 116); assert.equal(new Set(cases.map(c => c.id)).size, 85);
    assert.equal(cases.filter(c => c.parameters.teacher.key === 'zhangwuji').length, 0);
    assert.equal(cases.filter(c => ['xinfa-below', 'dodge-below', 'exp-below'].includes(c.parameters.variant)).length, 11);
    assert.throws(() => conditions(catalog, p => p === 'feature/apprentice.c' ? Buffer.concat([read(p), Buffer.from('\n')]) : read(p)));
});
test('all 85 synthetic finite traces validate; no driver/model/gameplay executed', () => {
    for (const c of cases) validate(fixture(c), c);
});
test('first join clears contribution and both quests; peers retain them and weiwang', () => {
    for (const key of ['lengqian', 'weiyixiao', 'xiexun', 'daijisi', 'yintianzheng', 'yangxiao']) {
        const first = get(key, 'new-repeat'), peer = get(key, 'peer-repeat');
        bad(first, r => { r.teaching[0].after.contribution = 4321; });
        bad(first, r => { r.teaching[0].after.recruitment.quest = { name: '实验旧任务', count: 7 }; });
        bad(first, r => { r.teaching[0].after.recruitment.temp_quest = { name: '实验临时任务', count: 3 }; });
        bad(peer, r => { r.teaching[0].after.contribution = 0; });
        bad(first, r => { r.teaching[0].after.weiwang = 0; });
    }
});
test('class/generation/title/time are exact original teacher-dependent transitions', () => {
    const c = get('lengqian', 'new-repeat');
    bad(c, r => { r.teaching[0].after.recruitment.family.generation = 37; });
    bad(c, r => { r.teaching[0].after.recruitment.class = ''; });
    bad(c, r => { r.teaching[0].after.recruitment.family.title = '弟子'; });
    bad(c, r => { r.teaching[0].after.recruitment.family.enter_time = 1; });
    bad(get('weiyixiao', 'new-repeat'), r => { r.teaching[0].after.recruitment.class = 'fighter'; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.born_family = '没有'; });
});
test('no fake success for same/older generations, private gates or busy', () => {
    for (const c of cases.filter(c => c.parameters.expected === 'refused')) {
        bad(c, r => { r.outcome = 'observed'; });
    }
    bad(get('weiyixiao', 'dodge-below'), r => { r.teaching[0].command_accepted = 0; });
    bad(get('weiyixiao', 'busy'), r => { r.teaching[0].command_accepted = 1; });
});
test('foreign confirmation retains betrayer intent; cancel clears only apprentice intent', () => {
    const c = get('yangxiao', 'foreign-confirm-cancel');
    bad(c, r => { r.teaching[0].after.recruitment.pending_betrayer = ''; });
    bad(c, r => { r.teaching[1].after.recruitment.pending_apprentice = ''; });
    bad(c, r => { r.teaching[3].after.recruitment.pending_betrayer = ''; });
    bad(c, r => { r.teaching[3].after.recruitment.history['betrayer/times'] = 1; });
    bad(c, r => { r.teaching[4].command_accepted = 1; });
});
test('reborn recognition is greeting only and missing callback/family remains real refusal', () => {
    const c = get('weiyixiao', 'reborn-recognition');
    assert.equal(validate(fixture(c), c)[0].greeting, 1);
    bad(c, r => { r.teaching[0].after.recruitment.family.master_id = 'wei yixiao'; });
    const fan = get('fanyao', 'missing-callback-cancel-retry');
    assert.equal(validate(fixture(fan), fan).filter(v => v.recruited).length, 0);
    bad(fan, r => { r.teaching[0].after.recruitment.class = 'bonze'; });
    bad(get('xiaozhao', 'no-family'), r => { r.teaching[0].command_accepted = 1; });
});
test('strict real USER/NPC preparation, original cold command and no invented cancel teacher', () => {
    const c = get('lengqian', 'new-repeat');
    bad(c, r => { r.before[0].wizardp = 1; });
    bad(c, r => { r.skill_load_context.actor = '/tests/runner'; });
    bad(c, r => { r.skill_load_context.argument = 'force'; });
    bad(c, r => { r.teacher_preparations[0].autonomy_after.heartbeat = 1; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.class = ''; });
    bad(c, r => { delete r.teaching[0].teacher_after; });
    bad(get('lengqian', 'bare-cancel'), r => { r.teaching[0].teacher_before = {}; });
});
test('missing index/outcome/metadata or invented resources/callbacks cannot validate', () => {
    const c = get('lengqian', 'new-repeat');
    for (const index of [null, -1, 2, '0', false]) bad(c, r => { r.index = index; });
    bad(c, r => { delete r.index; });
    bad(c, r => { r.metrics[0].jing_cost = 1; });
    bad(c, r => { r.callbacks.push({ name: 'fake' }); });
    bad(c, r => { r.teaching[0].after.learned_points = 1; });
    const wrong = copy(c); wrong.entry_id = wrong.entry_id.replace(':12:', ':13:');
    assert.throws(() => validateMingjiaoRecruitCondition(wrong));
    const drift = copy(c); drift.parameters.actor.properties.shen++;
    assert.throws(() => validateMingjiaoRecruitCondition(drift));
});
test('exact source messages are required on accepted gates/cancel/greeting', () => {
    for (const [key, variant, i] of [['lengqian', 'new-repeat', 0], ['yangxiao', 'shen-below-retry', 0],
        ['lengqian', 'reborn-recognition', 0], ['fanyao', 'missing-callback-cancel-retry', 2]])
        bad(get(key, variant), r => { r.teaching[i].messages = []; });
    bad(get('lengqian', 'new-repeat'), r => { delete r.teaching[0].after.qualification['reborn/int']; });
});
test('effects keep 24 genuine joins/36 greetings separate from command acceptance and unknowns', () => {
    const summaries = cases.map(c => effects([0, 1].map(i => { const raw = fixture(c); raw.index = i;
        return { condition_id: c.id, outcome: raw.outcome, raw }; }), c));
    assert.equal(summaries.reduce((n, x) => n + x.commands, 0), 302);
    assert.equal(summaries.reduce((n, x) => n + x.formal_apprenticeships, 0), 24);
    assert.equal(summaries.reduce((n, x) => n + x.first_joins, 0), 12);
    assert.equal(summaries.reduce((n, x) => n + x.repeated_greetings, 0), 36);
    assert.ok(summaries.every(x => x.jing_cost === 0 && x.learned_iterations === 0));
    const c = get('lengqian', 'new-repeat'), raw = fixture(c); raw.outcome = 'error'; raw.reason = 'isolated diagnostic failure'; delete raw.teaching;
    const unknown = effects([{ condition_id: c.id, outcome: 'error', raw }], c);
    assert.equal(unknown.unknown, 1); assert.equal(unknown.validated, 0); assert.equal(unknown.formal_apprenticeships, null);
    assert.throws(() => effects([{ condition_id: c.id, outcome: 'observed', raw }], c));
});
test('finite elapsed and nonempty error/NA reason are mandatory, unknown never enters normal state', () => {
    const c = get('lengqian', 'new-repeat');
    for (const elapsed of [null, -1, Infinity, NaN, '0', false]) bad(c, r => { r.elapsed = elapsed; });
    bad(c, r => { delete r.elapsed; });
    for (const outcome of ['error', 'not_applicable']) {
        const raw = fixture(c); raw.outcome = outcome; raw.reason = 'actual isolated diagnostic'; delete raw.before; delete raw.teaching;
        assert.deepEqual(validate(raw, c), []);
        for (const reason of [null, '', '  ', 0, false]) {
            const wrong = copy(raw); wrong.reason = reason; assert.throws(() => validate(wrong, c));
        }
        const missing = copy(raw); delete missing.reason; assert.throws(() => validate(missing, c));
    }
});
test('student/teacher birth fields and original attempt source cannot be missing or forged', () => {
    const c = get('lengqian', 'new-repeat');
    bad(c, r => { delete r.teaching[0].before.born_family; });
    bad(c, r => { r.teaching[0].after.born_family = '没有'; });
    bad(c, r => { delete r.before[0].cultivation.born_family; });
    bad(c, r => { r.after[0].cultivation.born_family = '明教'; });
    bad(c, r => { delete r.teacher_preparations[0].teacher_state.inherit_title; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.inherit_title = '虚构称号'; });
    bad(c, r => { r.teacher_preparations[0].teacher_state.attempt_source = '/tests/runner'; });
    bad(get('fanyao', 'missing-callback-cancel-retry'), r => { r.teacher_preparations[0].teacher_state.attempt_source = '/kungfu/class/mingjiao/fanyao'; });
    bad(get('xiaozhao', 'no-family'), r => { delete r.teacher_preparations[0].teacher_state.attempt_source; });
});
