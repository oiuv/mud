import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mingjiaoTeachers, mingjiaoTeachersSourcePaths, mingjiaoTeachersReviewedSourceHash } from './school_mingjiao_teachers_cases.mjs';

const copy = v => structuredClone(v), sha = v => createHash('sha256').update(v).digest('hex');
const group = 'mingjiao-recruit', prefix = 'school-mingjiao-recruit-';
export const mingjiaoRecruitProfile = group;
export const mingjiaoRecruitSourcePaths = [...mingjiaoTeachersSourcePaths];
export const mingjiaoRecruitReviewedSourceHash = mingjiaoTeachersReviewedSourceHash;
export const mingjiaoRecruitAbsentPaths = [];
const hashSources = e => sha(JSON.stringify(mingjiaoRecruitSourcePaths.map(p => [p, e[p]])));
const roster = new Map(mingjiaoTeachers.map(t => [t.key, t]));
const history = ['detach/明教', 'betrayer/明教', 'betrayer/times'];
const qualifications = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const gates = {
    lengqian: { shen: 0 }, weiyixiao: { shen: 10000, xinfa: 100, dodge: 100 },
    xiexun: { shen: 40000, xinfa: 140, exp: 380000 },
    daijisi: { shen: 60000, xinfa: 180, exp: 450000 },
    yintianzheng: { shen: 60000, xinfa: 180, exp: 450000 },
    yangxiao: { shen: 80000, xinfa: 160, dodge: 160, exp: 700000 },
};
const teacherClass = t => t.key === 'lengqian' ? 'fighter' : t.key === 'fanyao' ? 'bonze' : '';
const teacherTitles = { lengqian: '明教五散人', weiyixiao: '明教青翼蝠王', xiexun: '明教金毛狮王',
    daijisi: '明教紫衫龙王', yintianzheng: '明教白眉鹰王', yangxiao: '明教光明左使',
    fanyao: '明教光明右使', xiaozhao: '' };
const peer = (t, family = '明教', generation = t.generation + 1) => ({ family_name: family,
    generation, master_id: 'other master', master_name: '别位师父' });
function actor(t, family) {
    const g = gates[t.key] ?? { shen: 90000 };
    return { skills: { force: 180, 'shenghuo-xinfa': g.xinfa ?? 180, sword: 200,
        unarmed: 200, dodge: g.dodge ?? 200, parry: 200 }, mappings: {}, preparations: {},
        properties: { name: '试侠', gender: '男性', class: '', title: '普通百姓', character: '光明磊落',
            str: 36, int: 40, dex: 36, con: 36, shen: g.shen, combat_exp: g.exp ?? 800000,
            qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 1000, max_neili: 2400, jingli: 1000, max_jingli: 1000,
            potential: 10000, learned_points: 0, gongxian: 4321, weiwang: 123, jiali: 0,
            quest: { name: '实验旧任务', count: 7 }, 'reborn/family_name': 0,
            ...Object.fromEntries([...history, ...qualifications].map(k => [k, 0])),
            ...(family ? { family: copy(family) } : {}) }, temp: { quest: { name: '实验临时任务', count: 3 } } };
}
const apprentice = t => ({ command_kind: 'apprentice', teacher_key: t.key, action: 'apprentice ' + t.id });
const cancel = () => ({ command_kind: 'apprentice', teacher_key: null, action: 'apprentice cancel' });
function plans() {
    const result = [];
    const add = (t, variant, a, commands, expected = 'refused') => result.push({
        id: prefix + t.key + '-' + variant, stage: 'school', method: 'teaching', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, teaching_profile: group,
            teaching_kind: 'apprenticeship', variant, skill: 'shenghuo-ling', usage: 'sword', level: 0,
            actor: a, target: { skills: {}, mappings: {}, preparations: {}, properties: {
                qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
                neili: 1000, max_neili: 2400, str: 36, int: 40, dex: 36, con: 36 } },
            teacher: { key: t.key, id: t.id, name: t.name, path: t.path, generation: t.generation },
            teaching_expectations: commands, action: commands[0].action, monitored_grants: [],
            qualification_sources: mingjiaoRecruitSourcePaths, named_participants: true, fighting: false,
            observe_seconds: 0, not_applicable: '', expected, random_observation: false,
            qualification_note: '原非巫师USER apprentice/cancel与原NPC attempt_apprentice/recruit。前置修为和既有同门/转世标记是实验输入，不代表完整自然养成；仅本窗口新增师承才计自然拜师。张无忌旧19/430独立，不混统计。固定116公开构造依赖闭包，不仅13直接源码。' } });
    for (const [key, g] of Object.entries(gates)) {
        const t = roster.get(key), app = () => apprentice(t);
        add(t, 'new-repeat', actor(t), [app(), app()], 'observed');
        add(t, 'peer-repeat', actor(t, peer(t)), [app(), app()], 'observed');
        add(t, 'same-generation', actor(t, peer(t, '明教', t.generation)), [app()]);
        add(t, 'older-generation', actor(t, peer(t, '明教', t.generation - 1)), [app()]);
        const reborn = actor(t, peer(t)); reborn.properties['reborn/family_name'] = '明教';
        add(t, 'reborn-recognition', reborn, [app()]);
        for (const [variant, flag] of [['detach', history[0]], ['betrayer', history[1]], ['betrayer-times', history[2]]]) {
            const a = actor(t, peer(t)); a.properties[flag] = 1; add(t, variant, a, [app()]);
        }
        add(t, 'foreign-confirm-cancel', actor(t, peer(t, '武当派')), [app(), app(), app(), cancel(), cancel()]);
        const busy = actor(t, peer(t)); busy.busy = 1; add(t, 'busy', busy, [app()]);
        const evil = actor(t, peer(t)); evil.properties.shen = g.shen - 1;
        add(t, 'shen-below-retry', evil, [app(), app(), cancel(), cancel(), app()]);
        add(t, 'bare-cancel', actor(t), [cancel()]);
        for (const [gate, minimum] of Object.entries(g).filter(([name]) => name !== 'shen')) {
            const a = actor(t, peer(t));
            if (gate === 'xinfa') a.skills['shenghuo-xinfa'] = minimum - 1;
            else if (gate === 'dodge') a.skills.dodge = minimum - 1;
            else a.properties.combat_exp = minimum - 1;
            add(t, gate + '-below', a, [app()]);
        }
    }
    const fan = roster.get('fanyao'), xiao = roster.get('xiaozhao');
    add(fan, 'missing-callback-cancel-retry', actor(fan), [apprentice(fan), apprentice(fan), cancel(), apprentice(fan), cancel()]);
    add(xiao, 'no-family', actor(xiao), [apprentice(xiao), apprentice(xiao), cancel()]);
    assert.equal(result.length, 85);
    assert.equal(result.reduce((n, c) => n + c.parameters.teaching_expectations.length * 2, 0), 302);
    return result;
}
export function mingjiaoRecruitConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const e = Object.fromEntries(mingjiaoRecruitSourcePaths.map(p => [p, sha(readSource(p))]));
    assert.equal(hashSources(e), mingjiaoRecruitReviewedSourceHash, 'public constructor closure changed; source review required');
    assert.equal(catalog.skills.find(s => s.id === 'shenghuo-ling')?.sha256, e['kungfu/skill/shenghuo-ling.c']);
    return plans().map(c => {
        const t = roster.get(c.parameters.teacher.key), path = t.path.slice(1) + '.c';
        const text = readSource(path).toString();
        assert.equal(text.split('\n').findIndex(s => /^void create\(/.test(s)) + 1, t.line);
        assert.deepEqual(Object.fromEntries([...text.matchAll(/\bset_skill\("([^"\n]+)",\s*(\d+)\)/g)].map(m => [m[1], +m[2]])), t.levels);
        const entry = { id: `${path}:${t.line}:create`, path, line: t.line, function: 'create', role: 'teaching', sha256: e[path] };
        return { ...c, entry_id: entry.id, samples: 2, status: 'prepared_not_sampled', parameters: {
            ...c.parameters, teacher: { ...c.parameters.teacher, sha256: e[path] }, teacher_levels: copy(t.levels),
            teaching_entry: entry, source_evidence: copy(e), reviewed_source_hash: mingjiaoRecruitReviewedSourceHash,
            qualification_evidence: mingjiaoRecruitSourcePaths.map(path => ({ path, sha256: e[path] })), absent_sources: [] } };
    });
}
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing ' + k); return v[k]; };
const num = v => { if (v === null) return 0; assert.ok(Number.isSafeInteger(v)); return v; };
const equal = (v, e) => e === 0 ? assert.equal(num(v), 0) : assert.deepEqual(v, e);
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
let index;
export function validateMingjiaoRecruitCondition(c) {
    index ??= new Map(plans().map(v => [v.id, v]));
    const plan = index.get(c.id); assert.ok(plan, 'unknown finite recruitment condition');
    assert.equal(c.method, 'teaching'); assert.equal(c.stage, 'school'); assert.equal(c.samples, 2);
    const { source_evidence: e, qualification_evidence, reviewed_source_hash, absent_sources,
        teacher_levels, teaching_entry, teacher, ...rest } = map(c.parameters);
    const { teacher: expectedTeacher, ...expected } = plan.parameters; assert.deepEqual(rest, expected);
    assert.deepEqual(Object.keys(map(e)), mingjiaoRecruitSourcePaths);
    for (const h of Object.values(e)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(hashSources(e), mingjiaoRecruitReviewedSourceHash); assert.equal(reviewed_source_hash, mingjiaoRecruitReviewedSourceHash);
    assert.deepEqual(qualification_evidence, mingjiaoRecruitSourcePaths.map(path => ({ path, sha256: e[path] })));
    assert.deepEqual(absent_sources, []);
    const t = roster.get(expectedTeacher.key), path = t.path.slice(1) + '.c';
    assert.deepEqual(teacher, { ...expectedTeacher, sha256: e[path] }); assert.deepEqual(teacher_levels, t.levels);
    assert.deepEqual(teaching_entry, { id: `${path}:${t.line}:create`, path, line: t.line,
        function: 'create', role: 'teaching', sha256: e[path] }); assert.equal(c.entry_id, teaching_entry.id);
    return c.parameters;
}
const state = p => ({ q: copy(p.actor.properties), skills: copy(p.actor.skills), learned: {},
    quest: copy(p.actor.temp.quest), pending: false, betrayer: false });
const chineseGeneration = n => n === 38 ? '三十八' : n === 37 ? '三十七' : assert.fail('unreviewed generation');
// Original command order, not a substitute executor. No result is imported without the real trace.
function decide(s, command, t, busy) {
    const q = s.q, d = { accepted: 1, recruited: 0, first_join: 0, greeting: 0, result: 'refused', notice: '' };
    if (busy) return { ...d, accepted: 0, result: 'busy' };
    if (command.teacher_key === null) {
        if (!s.pending) return { ...d, accepted: 0, result: 'empty-cancel' };
        s.pending = false; return { ...d, result: 'cancelled', notice: '你改变主意不想拜' + t.name + '为师了。' };
    }
    if (q.family && (q.family.master_id === t.id && q.family.master_name === t.name
        || q['reborn/family_name'] === t.family && t.family))
        return { ...d, greeting: 1, result: 'greeting', notice: '师父！' };
    if (t.family === null) return { ...d, accepted: 0, result: 'no-teacher-family' };
    if (q.family?.family_name === t.family && typeof q.family.master_name === 'string') {
        if (t.generation > q.family.generation) return { ...d, accepted: 0, result: 'older-generation' };
        if (t.generation === q.family.generation) return { ...d, accepted: 0, result: 'same-generation' };
    }
    if (q.family && q.family.family_name !== t.family && !s.betrayer) {
        s.betrayer = true; return { ...d, result: 'betrayer-confirmation', notice: '如果你下了决心，就再输入一次这条命令。' };
    }
    if (s.pending) return { ...d, accepted: 0, result: 'pending-refusal' };
    s.pending = true;
    if (t.key === 'fanyao') return { ...d, result: 'missing-attempt-callback', notice: '' };
    if (q[history[0]] || q[history[1]]) return { ...d, result: 'excluded-history', notice: '我们明教教规你还记得吗，你还有脸回来！' };
    if (q[history[2]]) return { ...d, result: 'betrayer-times', notice: '哼，阁下不忠不信，我们明教可不会收留。' };
    if (q.family && q.family.family_name !== t.family) return { ...d, result: 'foreign-family', notice: '阁下既有了师承，还来我们明教做什么？' };
    const g = gates[t.key]; assert.ok(g);
    if (q.shen < g.shen) return { ...d, result: 'shen', notice: t.key === 'lengqian'
        ? '阁下身染邪气，还是及早回头得好。' : '你行侠仗义的事做得还不够，还是请回吧。' };
    if (g.xinfa && s.skills['shenghuo-xinfa'] < g.xinfa)
        return { ...d, result: 'xinfa', notice: '你圣火心法不够娴熟，还是下去多练习一下吧！' };
    if (g.dodge && s.skills.dodge < g.dodge) return { ...d, result: 'dodge', notice: t.key === 'weiyixiao'
        ? '你基本轻功火候不够，怎么学我的青蝠身法！' : '你基本轻功火候不够，怎么学我的逍遥剑法！' };
    if (g.exp && q.combat_exp < g.exp) return { ...d, result: 'experience', notice: t.key === 'yangxiao'
        ? '你江湖经验尚浅，还是去多闯荡一下吧！' : '你江湖经验不足，还是多磨练一下吧！' };
    const first = !q.family;
    if (first) { q.gongxian = 0; delete q.quest; s.quest = 0; }
    if (teacherClass(t)) q.class = teacherClass(t);
    const gen = t.generation + 1;
    q.family = { master_id: t.id, master_name: t.name, family_name: '明教', generation: gen,
        enter_time: 0, title: '传人', privs: 0 };
    q.title = '明教第' + chineseGeneration(gen) + '代传人'; s.pending = false;
    return { ...d, recruited: 1, first_join: Number(first), result: 'recruited',
        notice: '恭喜您成为明教的第' + chineseGeneration(gen) + '代弟子。' };
}
function point(v, s, id) {
    const q = s.q;
    for (const [field, key] of [['contribution', 'gongxian'], ['jing', 'jing'], ['neili', 'neili'],
        ['max_neili', 'max_neili'], ['max_jingli', 'max_jingli'], ['potential', 'potential'],
        ['learned_points', 'learned_points'], ['combat_exp', 'combat_exp'], ['shen', 'shen'],
        ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'], ['dex', 'dex'], ['con', 'con'], ['character', 'character']])
        equal(own(v, field), q[key]);
    assert.equal(own(v, 'effective_str'), q.str + Math.trunc(s.skills.unarmed / 10));
    assert.equal(own(v, 'effective_int'), q.int); assert.equal(own(v, 'effective_dex'), q.dex + Math.trunc(s.skills.dodge / 10));
    assert.equal(own(v, 'effective_force'), Math.trunc(s.skills.force / 2));
    assert.equal(own(v, 'effective_dodge'), Math.trunc(s.skills.dodge / 2));
    assert.equal(own(v, 'gender'), q.gender); equal(own(v, 'busy'), s.busy ?? 0);
    equal(own(v, 'born_family'), 0);
    assert.deepEqual(own(v, 'skills'), s.skills); assert.deepEqual(own(v, 'learned'), {});
    assert.deepEqual(own(v, 'mappings'), {}); assert.deepEqual(own(v, 'grants'), {});
    equal(own(v, 'reborn_family'), q['reborn/family_name']);
    for (const [field, key] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
        equal(own(v, field), q.family?.[key] ?? 0);
    const r = own(v, 'recruitment'); assert.deepEqual(own(r, 'family'), q.family ?? {});
    equal(own(r, 'family_present'), Number(!!q.family));
    for (const k of ['name', 'class', 'title']) assert.equal(own(r, k), q[k]);
    assert.deepEqual(Object.keys(map(own(r, 'history'))).sort(), [...history].sort());
    for (const k of history) equal(own(r.history, k), q[k]);
    equal(own(r, 'quest'), q.quest ?? 0); equal(own(r, 'temp_quest'), s.quest ?? 0);
    assert.equal(own(r, 'pending_apprentice'), s.pending ? id : '');
    assert.equal(own(r, 'pending_betrayer'), s.betrayer ? id : '');
    assert.deepEqual(Object.keys(map(own(v, 'qualification'))).sort(), [...qualifications].sort());
    for (const k of qualifications) equal(own(v.qualification, k), q[k]);
}
function npcPoint(npc, p, id) {
    const t = roster.get(p.teacher.key);
    assert.equal(own(npc, 'object'), id); assert.equal(own(npc, 'id'), t.id);
    assert.equal(own(npc, 'living'), 1); equal(own(npc, 'playerp'), 0);
    assert.deepEqual(own(npc, 'skills'), t.levels); assert.equal(own(npc, 'class'), teacherClass(t));
    equal(own(npc, 'born_family'), 0); // F_APPR tests the TEACHER's born_family, not the student's.
    equal(own(npc, 'inherit_title'), 0);
    equal(own(npc, 'attempt_source'), gates[t.key] ? t.path : 0);
    assert.equal(plain(own(npc, 'title')), teacherTitles[t.key]);
    assert.deepEqual(own(npc, 'family'), t.family ? { family_name: t.family, generation: t.generation,
        title: t.key === 'fanyao' ? '光明右使' : '弟子', privs: -1 } : {});
    equal(own(npc, 'family_present'), Number(!!t.family));
}
function preparation(raw, p, student) {
    const preps = own(raw, 'teacher_preparations'), cleanups = own(raw, 'teacher_cleanups');
    assert.ok(Array.isArray(preps) && preps.length === 1); assert.ok(Array.isArray(cleanups) && cleanups.length === 1);
    const prep = preps[0], t = p.teacher;
    assert.equal(own(prep, 'key'), t.key); assert.equal(own(prep, 'command'), 'test_interface');
    assert.equal(own(prep, 'entry_actor'), student); assert.equal(own(prep, 'return_actor'), student);
    assert.equal(own(prep, 'initializer_actor'), 'not_observed'); assert.equal(own(prep, 'teacher_program'), t.path);
    const id = own(prep, 'teacher'); assert.match(id, new RegExp('^' + t.path + '#[0-9]+$'));
    npcPoint(own(prep, 'teacher_state'), p, id);
    assert.deepEqual(own(prep, 'before'), own(prep, 'after'));
    assert.deepEqual(prep.after, raw.before[0], 'preparation neither grants nor changes student state');
    for (const [key, heartbeat] of [['autonomy_before', 1], ['autonomy_after', 0]]) {
        const a = own(prep, key); assert.equal(own(a, 'heartbeat'), heartbeat);
        assert.equal(own(a, 'blueprint'), t.path); equal(own(a, 'blueprint_heartbeat'), 0); assert.deepEqual(own(a, 'callbacks'), []);
    }
    const cleanup = cleanups[0]; assert.equal(own(cleanup, 'object'), id);
    equal(own(cleanup, 'pending'), 0); equal(own(cleanup, 'object_exists'), 0);
    const load = own(raw, 'skill_load_context');
    assert.deepEqual(Object.keys(map(load)).sort(), ['actor', 'already_loaded', 'skills', 'command', 'function', 'argument', 'result'].sort());
    assert.equal(load.actor, student); assert.ok([0, 1].includes(load.already_loaded)); assert.deepEqual(load.skills, p.actor.skills);
    assert.equal(load.command, 'test_interface'); assert.equal(load.function, 'valid_enable');
    assert.equal(load.argument, 'sword'); assert.equal(load.result, 1);
    return { id, npc: prep.teacher_state };
}
function boundary(v, pointState, p, student) {
    assert.equal(own(v, 'object'), student); assert.equal(own(v, 'id'), 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(v, k), 1);
    for (const k of ['wizardp', 'ghost']) equal(own(v, k), 0);
    equal(own(v, 'busy'), p.actor.busy ?? 0);
    for (const k of ['jing', 'neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'dex', 'con',
        'combat_exp', 'effective_str', 'effective_int', 'effective_dex', 'skills', 'learned', 'mappings'])
        assert.deepEqual(own(v, k), own(pointState, k));
    assert.deepEqual(own(v, 'effective_skills'), Object.fromEntries(Object.entries(p.actor.skills).map(([k, n]) => [k, Math.trunc(n / 2)])));
    assert.deepEqual(own(v, 'preparations'), {});
    for (const k of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli']) assert.equal(own(v, k), p.actor.properties[k]);
    for (const k of ['weapon', 'handing', 'secondary_weapon']) assert.equal(own(v, k), 'none');
    for (const k of ['weapon_details', 'handing_details', 'secondary_weapon_details']) assert.deepEqual(own(v, k), {});
    equal(own(v, 'weapon_damage'), 0); equal(own(v, 'weapon_flag'), 0);
    assert.deepEqual(own(own(v, 'temp'), 'apply'), { armor: 100 });
    equal(own(own(v, 'cultivation'), 'class'), pointState.recruitment.class);
    equal(own(v.cultivation, 'family/family_name'), pointState.family);
    equal(own(v.cultivation, 'born_family'), 0);
}
export function validateMingjiaoRecruitRecord(raw, condition) {
    const p = validateMingjiaoRecruitCondition(condition), t = roster.get(p.teacher.key);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), 'teaching');
    const sampleIndex = own(raw, 'index'); assert.ok(Number.isSafeInteger(sampleIndex) && sampleIndex >= 0 && sampleIndex < condition.samples);
    assert.ok(Number.isFinite(own(raw, 'elapsed')) && raw.elapsed >= 0);
    const outcome = own(raw, 'outcome');
    if (['error', 'not_applicable'].includes(outcome)) {
        const reason = own(raw, 'reason'); assert.ok(typeof reason === 'string' && reason.trim().length > 0);
        return [];
    }
    assert.equal(outcome, p.expected);
    for (const k of ['before', 'after']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2);
    const student = own(raw.before[0], 'object'); assert.match(student, /^\/tests\/teaching_actor#[0-9]+$/);
    const prepared = preparation(raw, p, student), steps = own(raw, 'teaching');
    assert.ok(Array.isArray(steps)); assert.equal(steps.length, p.teaching_expectations.length);
    const s = state(p), values = []; s.busy = p.actor.busy ?? 0; let previous;
    for (const [i, step] of steps.entries()) {
        const instruction = p.teaching_expectations[i], hasTeacher = instruction.teacher_key !== null;
        assert.equal(own(step, 'student'), student); assert.equal(own(step, 'command'), instruction.action);
        for (const k of ['teacher', 'resolved_teacher']) assert.equal(own(step, k), hasTeacher ? prepared.id : 'none');
        assert.equal(own(step, 'teacher_program'), hasTeacher ? t.path : 'none');
        assert.deepEqual(own(step, 'teacher_skills'), hasTeacher ? p.teacher_levels : {});
        assert.deepEqual(own(step, 'teacher_family'), hasTeacher && t.family ? { family_name: t.family, generation: t.generation } : {});
        if (hasTeacher) {
            assert.deepEqual(own(step, 'teacher_before'), prepared.npc); assert.deepEqual(own(step, 'teacher_after'), prepared.npc);
        } else for (const k of ['teacher_before', 'teacher_after']) assert.ok(!Object.hasOwn(step, k), 'no fabricated NPC snapshot for cancel');
        for (const k of ['teacher_pending_recruit_before', 'teacher_pending_recruit']) assert.equal(own(step, k), '');
        assert.ok(Number.isSafeInteger(own(step, 'command_accepted')) && step.command_accepted >= 0);
        assert.ok(Number.isFinite(own(step, 'elapsed')) && step.elapsed >= 0);
        assert.ok(Number.isSafeInteger(own(step, 'wall_time')) && step.wall_time > 0);
        const before = own(step, 'before'), after = own(step, 'after'); point(before, s, prepared.id);
        if (previous) assert.deepEqual(before, previous, 'no inter-command refill or identity rewrite');
        const d = decide(s, instruction, t, p.actor.busy ?? 0);
        assert.equal(Number(step.command_accepted > 0), d.accepted, 'execution cost is not recruitment success');
        if (d.recruited) {
            const time = own(own(own(after, 'recruitment'), 'family'), 'enter_time');
            assert.ok(Number.isSafeInteger(time) && time >= step.wall_time && time <= step.wall_time + Math.ceil(step.elapsed) + 1);
            s.q.family.enter_time = time;
        }
        point(after, s, prepared.id);
        const a = copy(after), b = copy(before);
        for (const k of ['contribution', 'recruitment', 'family', 'master_id', 'master_name']) { delete a[k]; delete b[k]; }
        assert.deepEqual(a, b, 'unrelated observed state changed');
        assert.equal(own(step, 'message_scope'), 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(own(step, 'messages')));
        const message = step.messages.map(m => { assert.equal(typeof own(m, 'category'), 'string'); return plain(own(m, 'text')); }).join('');
        if (d.accepted && d.notice) assert.ok(message.includes(d.notice), 'original accepted-command notice absent');
        values.push({ teacher: t.key, command_kind: instruction.command_kind, result: d.result,
            accepted: d.accepted, execution_cost: step.command_accepted, recruited: d.recruited,
            first_join: d.first_join, greeting: d.greeting, cancelled: Number(d.result === 'cancelled'),
            confirmation: Number(d.result === 'betrayer-confirmation'),
            pending_apprentice: Number(s.pending), pending_betrayer: Number(s.betrayer) });
        previous = after;
    }
    boundary(raw.before[0], steps[0].before, p, student); boundary(raw.after[0], steps.at(-1).after, p, student);
    assert.deepEqual(raw.before[1], raw.after[1]);
    const a = copy(raw.after[0]), b = copy(raw.before[0]);
    for (const k of ['temp', 'cultivation']) { delete a[k]; delete b[k]; } assert.deepEqual(a, b);
    const ac = copy(raw.after[0].cultivation), bc = copy(raw.before[0].cultivation);
    for (const k of ['class', 'family/family_name']) { delete ac[k]; delete bc[k]; } assert.deepEqual(ac, bc);
    const at = copy(raw.after[0].temp), bt = copy(raw.before[0].temp);
    // Only these original command temporaries may differ; both quest states are checked at every point.
    for (const k of ['pending', 'notify_fail', 'quest']) { delete at[k]; delete bt[k]; } assert.deepEqual(at, bt);
    assert.ok(Array.isArray(own(raw, 'metrics')) && raw.metrics.length === 2);
    for (const m of raw.metrics) for (const [k, n] of Object.entries(map(m))) {
        assert.ok(Number.isSafeInteger(n) && n >= 0, k); assert.equal(n, 0, 'no resource/attack/heartbeat event in synchronous recruitment');
    }
    for (const k of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(own(raw, k), []);
    assert.equal(outcome, values.some(v => v.recruited) ? 'observed' : 'refused');
    return values;
}
export function mingjiaoRecruitEffects(rows, condition) {
    const values = []; let unknown = 0;
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.method, condition.method); assert.equal(row.outcome, row.raw.outcome);
        const observed = validateMingjiaoRecruitRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) { unknown++; continue; } values.push(...observed);
    }
    const sum = k => values.length ? values.reduce((n, v) => n + v[k], 0) : null;
    return { samples: rows.length, validated: rows.length - unknown, unknown, teacher: condition.parameters.teacher.key,
        commands: values.length, commands_accepted: sum('accepted'), command_execution_cost: sum('execution_cost'),
        formal_apprenticeships: sum('recruited'), first_joins: sum('first_join'), repeated_greetings: sum('greeting'),
        cancellations: sum('cancelled'), betrayer_confirmations: sum('confirmation'),
        learned_iterations: values.length ? 0 : null, jing_cost: values.length ? 0 : null,
        results: Object.fromEntries([...new Set(values.map(v => v.result))].sort().map(k => [k, values.filter(v => v.result === k).length])),
        unknown_scopes: ['finite natural-recruitment window, not full prerequisite cultivation or reincarnation',
            'reborn recognition/greeting is not a new mastership', 'no ordinary learning or special teaching in this series',
            'Zhang Wuji prior 19/430 series is separate', 'no hidden NPC initializer context inferred from USER entry/return'] };
}
