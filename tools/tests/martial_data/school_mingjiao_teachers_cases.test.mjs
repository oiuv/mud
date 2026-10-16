// Pure synthetic protocol tests. Nothing here is a real MUD collection result.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { mingjiaoTeachersConditions as conditions, mingjiaoTeachersSourcePaths as paths,
    mingjiaoTeachersReviewedSourceHash as reviewed, mingjiaoTeachers as teachers,
    validateMingjiaoTeachersCondition as validateCondition, validateMingjiaoTeachersRecord as validate,
    mingjiaoTeachersEffects as effects } from './school_mingjiao_teachers_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = p => readFileSync(join(root, p)), hash = v => createHash('sha256').update(v).digest('hex');
const copy = v => structuredClone(v);
const catalog = { skills: paths.filter(p => /^kungfu\/skill\/[^/]+\.c$/.test(p)).map(path => ({
    id: path.slice(13, -2), path, sha256: hash(read(path)) })) };
const cases = conditions(catalog, read);
const pick = suffix => { const c = cases.find(c => c.id === 'school-mingjiao-teachers-' + suffix); assert.ok(c, suffix); return c; };
const flags = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
function gear(cfg, side, secondary = false) {
    if (!cfg) return {};
    const types = { sword: [6000, 25, 4, 'iron sword'], dagger: [6000, 13, 6, 'dagger'], staff: [1000, 60, 16, 'mu zhang'] };
    const [weight, damage, flag, id] = types[cfg.type];
    return { object: cfg.program + '#' + (secondary ? 556 : 555), program: cfg.program, skill_type: cfg.type,
        flag, weight, damage, id, material: cfg.type === 'staff' ? 'wood' : 'steel', rigidity: 75,
        consistence: 100, no_wield: 0, environment: '/tests/teaching_actor#' + side, equipped: 'wielded' };
}
function point(c, a, student = '/tests/teaching_actor#1') {
    const q = a.properties, skills = copy(a.skills), temp_apply = !a.equipment ? { armor: 100 }
        : a.equipment.type === 'staff' ? { armor: 100, damage: 60 } : { armor: 100, damage: 25, dodge: -2 };
    const effective_skills = Object.fromEntries(Object.entries(skills).map(([k, n]) => [k,
        Math.trunc(n / 2) + (skills[a.mappings[k]] ?? 0) + (temp_apply[k] ?? 0)]));
    return { contribution: q.gongxian, jing: q.jing, neili: q.neili, max_neili: q.max_neili, max_jingli: q.max_jingli,
        potential: q.potential, learned_points: q.learned_points, combat_exp: q.combat_exp, shen: q.shen, weiwang: q.weiwang,
        str: q.str, int: q.int, dex: q.dex, con: q.con, gender: q.gender, guilty: q.guilty, character: q.character,
        effective_int: q.int + Math.trunc((skills.literate ?? 0) / 10),
        effective_dex: q.dex + Math.trunc((skills.dodge ?? 0) / 10),
        effective_str: q.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => skills[k] ?? 0)) / 10),
        skills, learned: copy(a.learned ?? {}), mappings: copy(a.mappings), preparations: copy(a.preparations),
        effective_skills, effective_force: effective_skills.force, effective_dodge: effective_skills.dodge,
        temp_apply, busy: a.busy ?? null, fighting: Number(c.parameters.fighting), conditions: copy(a.conditions ?? {}),
        grants: {}, reborn_family: q['reborn/family_name'], family: q.family.family_name,
        master_id: q.family.master_id, master_name: q.family.master_name,
        recruitment: { family: copy(q.family), family_present: 1, name: q.name, class: q.class, title: q.title,
            history: Object.fromEntries(['detach/明教', 'betrayer/明教', 'betrayer/times'].map(k => [k, q[k]])),
            quest: 0, temp_quest: 0, pending_apprentice: '', pending_betrayer: '' },
        qualification: { ...Object.fromEntries(flags.map(k => [k, q[k]])), guilty: q.guilty,
            pigging: c.parameters.room_properties.pigging ?? 0, 'qiankun-except': a.conditions?.['qiankun-except'] ?? 0,
            'reborn/family_name': q['reborn/family_name'] }, room_pigging: c.parameters.room_properties.pigging ?? 0,
        weapon: a.equipment?.type ?? 'none', weapon_details: gear(a.equipment, 1),
        secondary_weapon: a.secondary_equipment?.type ?? 'none', secondary_weapon_details: gear(a.secondary_equipment, 1, true),
        encumbrance: (a.equipment ? a.equipment.type === 'staff' ? 1000 : 6000 : 0) + (a.secondary_equipment ? 6000 : 0) };
}
function boundary(c, a, pointState) {
    return { ...copy(a.properties), object: '/tests/teaching_actor#1', id: 'left', userp: 1, playerp: 1,
        interactive: 1, living: 1, wizardp: 0, ghost: 0, skills: copy(pointState.skills), learned: copy(pointState.learned),
        mappings: copy(pointState.mappings), preparations: copy(pointState.preparations), effective_skills: copy(pointState.effective_skills),
        busy: pointState.busy, conditions: Object.keys(pointState.conditions).length ? copy(pointState.conditions) : null,
        effective_int: pointState.effective_int, effective_str: pointState.effective_str, effective_dex: pointState.effective_dex,
        weapon: pointState.weapon, weapon_details: copy(pointState.weapon_details), weapon_damage: a.equipment ? a.equipment.type === 'staff' ? 60 : 25 : 0,
        weapon_flag: a.equipment ? a.equipment.type === 'staff' ? 16 : 4 : 0, encumbrance: pointState.encumbrance,
        secondary_weapon: pointState.secondary_weapon, secondary_weapon_details: copy(pointState.secondary_weapon_details),
        handing: 'none', handing_details: {}, temp: { apply: copy(pointState.temp_apply) },
        cultivation: { class: a.properties.class, 'family/family_name': a.properties.family.family_name,
            ...Object.fromEntries([...flags, 'guilty', 'reborn/family_name'].map(k => [k, a.properties[k]])) } };
}
function teacherState(c) {
    const p = c.parameters, t = teachers.find(t => t.key === p.teacher.key), text = read(t.path.slice(1) + '.c').toString();
    const maps = Object.fromEntries([...text.matchAll(/\bmap_skill\("([^"]+)",\s*"([^"]+)"\)/g)]
        .filter(m => Object.hasOwn(t.levels, m[2])).map(m => [m[1], m[2]]));
    const preparations = t.key === 'fanyao' ? {} : Object.fromEntries([...text.matchAll(/\bprepare_skill\("([^"]+)",\s*"([^"]+)"\)/g)]
        .map(m => [m[1], m[2]]));
    return { object: t.path + '#222', id: t.id, living: 1, playerp: 0, skills: copy(t.levels), mappings: maps, preparations,
        family: t.family === null ? {} : { family_name: '明教', generation: t.generation, privs: -1,
            title: t.key === 'zhangwuji' ? '教主' : t.key === 'fanyao' ? '光明右使' : '弟子' },
        family_present: Number(t.family !== null), no_teach: copy(t.no_teach), env_no_teach: p.teacher_properties['env/no_teach'] ?? 0,
        recognize_source: 0 };
}
function fixture(c) {
    const p = c.parameters, a = copy(p.actor), student = '/tests/teaching_actor#1';
    const before = point(c, a), rawBefore = boundary(c, a, before), npc = teacherState(c);
    const accepted = p.expected === 'observed' || ['no-teach', 'martial-cap', 'teacher-no-teach', 'exp-low', 'jing-low'].includes(p.refusal_kind);
    let jingCost = 0;
    if (p.expected === 'observed') {
        const level = a.skills[p.skill], fee = Math.trunc((100 + 2 * level) / a.properties.int);
        // One allowed original RNG input (4), computed independently of the module helper.
        const cognize = a.skills[['literate', 'buddhism'].includes(p.skill) ? 'culture-cognize' : 'martial-cognize'] ?? 0;
        const amount = 4 + Math.trunc(4 * cognize / 500), gain = 1 + Math.trunc(amount * 100 / (level + 100));
        a.learned = { [p.skill]: gain }; a.properties.learned_points++;
        a.properties.jing -= fee; jingCost = fee;
    } else if (p.refusal_kind === 'jing-low') { jingCost = a.properties.jing; a.properties.jing = 0; }
    const after = point(c, a), rawAfter = boundary(c, a, after), unrelated = { object: '/tests/teaching_actor#2', marker: 'unchanged' };
    const messages = p.refusal_kind === 'no-teach' ? [{ category: 'vision', text: npc.no_teach[p.skill] + '\n' }]
        : p.refusal_kind === 'jing-low' ? [{ category: 'write', text: '然而你今天太累了，无法再进行任何学习了。\n' }] : [];
    return { kind: 'sample', method: 'teaching', condition_id: c.id, index: 0, outcome: p.expected,
        before: [rawBefore, unrelated], after: [rawAfter, copy(unrelated)], metrics: [{ jing_cost: jingCost }, {}],
        teaching: [{ student, teacher: npc.object, resolved_teacher: npc.object, teacher_program: p.teacher.path,
            teacher_skills: copy(p.teacher_levels), teacher_before: copy(npc), teacher_after: copy(npc),
            command: p.action, command_accepted: accepted ? 99 : 0, elapsed: 0.01, wall_time: 1791990000,
            before, after, message_scope: 'receive_message_apply_input_not_full_transcript', messages }],
        teacher_preparations: [{ key: p.teacher.key, command: 'test_interface', entry_actor: student, return_actor: student,
            initializer_actor: 'not_observed', teacher: npc.object, teacher_program: p.teacher.path, teacher_state: copy(npc),
            before: copy(rawBefore), after: copy(rawBefore),
            autonomy_before: { heartbeat: 1, blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] },
            autonomy_after: { heartbeat: 0, blueprint: p.teacher.path, blueprint_heartbeat: 0, callbacks: [] } }],
        teacher_cleanups: [{ object: npc.object, pending: 0, object_exists: 0 }],
        skill_load_contexts: ['shenghuo-ling', 'qishang-quan'].map((skill, i) => ({ skill, actor: student, already_loaded: 1,
            skills: copy(p.actor.skills), command: 'test_interface', function: 'valid_enable', argument: i ? 'cuff' : 'sword', result: 1 })),
        launches: [], attacks: [], defenses: [], passives: [], callbacks: [], terminals: [] };
}
const bad = (c, mutate) => { const r = fixture(c); mutate(r); assert.throws(() => validate(r, c)); };
const row = raw => ({ format: 1, fingerprint: 'pure-only', condition_id: raw.condition_id, condition_sha: 'not-evidence',
    index: raw.index, outcome: raw.outcome, reason: '', raw, raw_sha: 'not-evidence', recorded: 'pure-only' });

test('complete real nine-NPC roster is 116 pairs / 41 skills; corrected 363/11604/726 budget', () => {
    assert.deepEqual(teachers.map(t => Object.keys(t.levels).length), [13, 18, 11, 13, 7, 12, 14, 13, 15]);
    assert.equal(teachers.reduce((n, t) => n + Object.keys(t.levels).length, 0), 116);
    assert.equal(new Set(teachers.flatMap(t => Object.keys(t.levels))).size, 41);
    const smoke = conditions(catalog, read, { smoke: true });
    assert.equal(cases.length, 363); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 11604);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 726);
    assert.equal(cases.filter(c => c.parameters.random_observation).length, 111);
    assert.equal(cases.filter(c => c.parameters.variant === 'base').length, 115);
    assert.ok(!cases.some(c => c.parameters.teacher.key === 'zhangwuji' && c.parameters.skill === 'shenghuo-ling'));
    for (const [i, c] of cases.entries()) { assert.deepEqual(c.parameters, smoke[i].parameters); validate(fixture(c), c); }
});
test('116 current dependencies and exact nine source rosters fail closed, never accept new source or fake levels', () => {
    assert.equal(paths.length, 116); assert.equal(hash(JSON.stringify(paths.map(p => [p, hash(read(p))]))), reviewed);
    for (const t of teachers) {
        const path = t.path.slice(1) + '.c';
        assert.throws(() => conditions(catalog, p => p === path ? Buffer.concat([read(p), Buffer.from('\n// mutation')]) : read(p)));
        const c = copy(cases.find(c => c.parameters.teacher.key === t.key)); c.parameters.teacher_levels.force++;
        assert.throws(() => validateCondition(c));
    }
    const c = copy(cases[0]); c.parameters.actor.temp = { weapon: 'fake' }; assert.throws(() => validateCondition(c));
    const d = copy(cases[0]); d.parameters.action = 'eval 1'; assert.throws(() => validateCondition(d));
});
test('Fan original reborn recognition is separate from standard refusal; Xiao is not a forged teacher', () => {
    assert.equal(cases.filter(c => c.parameters.teacher.key === 'fanyao' && c.parameters.variant === 'reborn').length, 18);
    const c = pick('fanyao-buddhism-reborn'); validate(fixture(c), c);
    assert.equal(pick('zhangwuji-qiankun-danuoyi-outsider-int30').parameters.experimental_identity, 'assigned-reborn-family');
    assert.equal(pick('lengqian-force-other-master').parameters.experimental_identity, 'peer-family');
    bad(c, r => { r.teaching[0].before.reborn_family = 0; });
    const x = pick('xiaozhao-taiji-jian-base'); validate(fixture(x), x);
    bad(x, r => { r.teaching[0].teacher_before.family = { family_name: '明教' }; });
    bad(c, r => { r.teaching[0].teacher_after.mappings.force = 'shenghuo-shengong'; });
});
test('knowledge teacher caps and lower martial caps are distinct from the general 200 cap', () => {
    const lit = pick('fanyao-literate-reborn-cap'), force = pick('fanyao-force-reborn-cap');
    assert.equal(lit.parameters.level, 340); assert.equal(force.parameters.level, 200);
    assert.equal(fixture(lit).teaching[0].command_accepted, 0); assert.ok(fixture(force).teaching[0].command_accepted > 0);
    for (const s of ['jiuyang-shengong', 'taiji-jian', 'taiji-quan', 'qishang-quan']) {
        const c = pick('zhangwuji-' + s + '-base'); validate(fixture(c), c);
        bad(c, r => { r.teaching[0].messages = []; });
    }
});
test('legal sword plus SECONDARY dagger retains only main weapon properties; staff uses actual virtual identity', () => {
    const c = pick('daijisi-pili-quan-guard-dual-wielded'); validate(fixture(c), c);
    assert.equal(c.parameters.actor.secondary_equipment.program, '/clone/weapon/dagger');
    bad(c, r => { r.teaching[0].before.temp_apply.damage = 38; });
    bad(c, r => { r.teaching[0].before.secondary_weapon_details.flag = 4; });
    bad(c, r => { r.teaching[0].before.encumbrance = 6000; });
    bad(c, r => { r.teaching[0].after.secondary_weapon_details.object = '/clone/weapon/dagger#other'; });
    const s = pick('daijisi-yinhu-zhang-base'); validate(fixture(s), s);
    assert.deepEqual(fixture(s).teaching[0].before.temp_apply, { armor: 100, damage: 60 });
    bad(s, r => { r.teaching[0].before.temp_apply.dodge = 0; });
    bad(s, r => { r.teaching[0].after.temp_apply.dodge = 0; });
    bad(s, r => { r.before[0].temp.apply.dodge = 0; });
    bad(s, r => { r.after[0].temp.apply.dodge = 0; });
    bad(s, r => { r.teaching[0].before.weapon_details.program = '/clone/weapon/gangjian'; });
});
test('raw qualification versus effective prerequisites and original QKD condition are separately measured', () => {
    const a = pick('zhangwuji-qiankun-danuoyi-guard-relative-force');
    assert.equal(a.parameters.actor.skills.force, 189); assert.equal(a.parameters.actor.skills['shenghuo-shengong'], 400);
    assert.deepEqual(a.parameters.actor.mappings, { force: 'shenghuo-shengong' }); validate(fixture(a), a);
    bad(a, r => { r.teaching[0].before.effective_force = 189; });
    const c = pick('zhangwuji-qiankun-danuoyi-guard-qiankun-except'); validate(fixture(c), c);
    bad(c, r => { r.teaching[0].before.conditions = {}; });
    bad(c, r => { delete r.teaching[0].before.qualification['qiankun-except']; });
});
test('literate-derived actual intelligence drives learn RNG; fees still use raw intelligence', () => {
    const c = pick('fanyao-literate-cap-minus-one'), r = fixture(c); validate(r, c);
    assert.equal(r.teaching[0].before.effective_int, 73); assert.equal(r.metrics[0].jing_cost, 19);
    bad(c, x => { x.teaching[0].before.effective_int = 40; });
    bad(c, x => { x.teaching[0].after.learned.literate = 100; });
    bad(c, x => { x.metrics[0].jing_cost = 10; });
});
test('jing exhaustion is original accepted SET0 writeoff, not a fabricated normal learning fee', () => {
    const c = pick('lengqian-shenghuo-xinfa-jing-low'), r = fixture(c), v = validate(r, c)[0];
    assert.equal(v.completed, 0); assert.equal(v.jing_cost, 2); assert.equal(v.jing_writeoff, 2); assert.equal(v.accepted, 1);
    bad(c, x => { x.metrics[0].jing_cost = 3; }); bad(c, x => { x.teaching[0].after.jing = 1; });
    bad(c, x => { x.teaching[0].messages = []; });
});
test('command costs are nonnegative safe integers; positive cost is acceptance, not its count', () => {
    for (const c of [cases[0], pick('lengqian-shenghuo-xinfa-jing-low')]) {
        for (const cost of [1, 23, 476]) {
            const r = fixture(c); r.teaching[0].command_accepted = cost;
            const original = copy(r), value = validate(r, c)[0], result = effects([row(r)], c);
            assert.equal(value.accepted, 1); assert.equal(value.execution_cost, cost);
            assert.equal(result.commands_accepted, 1); assert.equal(result.command_execution_cost, cost);
            assert.deepEqual(r, original, 'validation and effects must preserve original command cost');
        }
        bad(c, r => { r.teaching[0].command_accepted = 0; });
    }
    const refused = pick('xiaozhao-taiji-jian-base'), r = fixture(refused);
    assert.equal(r.teaching[0].command_accepted, 0);
    assert.equal(validate(r, refused)[0].accepted, 0);
    assert.equal(effects([row(r)], refused).commands_accepted, 0);
    for (const cost of [1, 23, 476]) bad(refused, x => { x.teaching[0].command_accepted = cost; });
    for (const c of [cases[0], refused]) {
        for (const cost of [1.5, Number.MAX_SAFE_INTEGER + 1, NaN, Infinity, -1, null, undefined, '1', {}, [], true]) {
            bad(c, x => { x.teaching[0].command_accepted = cost; });
        }
        bad(c, x => { delete x.teaching[0].command_accepted; });
    }
});
test('original USER preparation, identities and cleanup plural cannot be forged', () => {
    const c = cases[0];
    bad(c, r => { r.before[0].object = '/tests/actor#1'; });
    bad(c, r => { r.teacher_preparations[0].entry_actor = r.before[1].object; });
    bad(c, r => { r.skill_load_contexts[1].argument = 'force'; });
    bad(c, r => { r.teacher_cleanup = r.teacher_cleanups; delete r.teacher_cleanups; });
    bad(c, r => { r.teacher_cleanups[0].object_exists = 1; });
    bad(c, r => { r.teaching[0].teacher_skills.force = 999; });
});
test('all observed stage keys required; no heartbeat, invented resources or cross-stage progression', () => {
    const c = cases[0];
    for (const k of ['before', 'after', 'metrics', 'teacher_preparations', 'skill_load_contexts', 'teaching']) bad(c, r => { delete r[k]; });
    bad(c, r => { r.metrics[0].heartbeats = 1; }); bad(c, r => { r.metrics[1].jing_cost = 1; });
    bad(c, r => { r.index = null; });
    bad(c, r => { r.after[0].qi--; }); bad(c, r => { r.teaching[0].after.learned_points++; });
    bad(c, r => { r.callbacks.push({ phase: 'invented' }); });
    bad(c, r => { r.teaching[0].after.potential--; });
});
test('real ledger rows use raw.method; errors and empty series remain unknown, not zero effects', () => {
    const c = cases[0], r = fixture(c), good = row(r), e = effects([good], c);
    assert.equal(e.samples, 1); assert.equal(e.validated, 1); assert.equal(e.learned_iterations, 1);
    const unknown = row({ kind: 'sample', condition_id: c.id, index: 0, method: 'teaching', outcome: 'error' });
    const noapp = row({ ...unknown.raw, outcome: 'not_applicable' });
    assert.equal(effects([unknown, noapp], c).unknown, 2);
    assert.equal(effects([unknown], c).jing_cost, null); assert.equal(effects([], c).learned_net.mean, null);
    const wrong = copy(good); wrong.raw.method = 'interface'; assert.throws(() => effects([wrong], c));
    const before = copy(good); effects([good], c); assert.deepEqual(good, before);
});
