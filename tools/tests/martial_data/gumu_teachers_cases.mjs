// Registered with the shared teaching runner. Real-driver acceptance remains
// separate; these fixed expectations are never emitted as observations.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';
import { gumuForces, gumuCultivationSkills, gumuCultivationCanLearn,
    gumuEffectiveAttribute } from './school_gumu_cultivation_cases.mjs';
import { gumuUnarmedLearningProfiles, gumuUnarmedLearningAllowed } from './school_gumu_unarmed_learning_cases.mjs';
import { gumuWeaponLearningProfiles, gumuWeaponLearningAllowed } from './school_gumu_weapon_learning_cases.mjs';

const common = ['cmds/skill/learn.c', 'feature/apprentice.c', 'feature/attribute.c',
    'feature/master.c', 'feature/skill.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'inherit/char/npc.c', 'inherit/skill/force.c', 'inherit/skill/skill.c', 'kungfu/class/gumu/gumu.h'];
const names = ['li', 'lin', 'longnv', 'yang'];
const skills = ('bingpo-shenzhen chilian-shenzhang dodge fireice-strike force literate martial-cognize medical '
    + 'meinv-quan parry qixing-bu quanzhen-jian sad-strike sanwu-shou strike surge-force suxin-jian suxin-jue '
    + 'sword taoism throwing tianluo-diwang unarmed whip wudu-shenzhang xuantie-jian yinsuo-jinling yufeng-zhen '
    + 'yunv-jian yunv-shenfa yunv-xinjing yunzhou-fufa zuoyou-hubo').split(' ');
export const gumuTeachersSources = [...common, ...names.map(n => `kungfu/class/gumu/${n}.c`),
    ...skills.map(s => `kungfu/skill/${s}.c`), 'kungfu/skill/count.c'].sort();
export const gumuTeachersReviewed = 'a6587ed6e1fe7da8da4b5d49e36fe5ee806089a012899746cdcb69b9924ca70c';
export const gumuTeachersFixtureRequirements = [
    'Use the existing teaching runner/validator under gumu-teachers, never the Emei profile.',
    'Create original NPCs through the real student command; record entry/return identity, not an inferred mid-create initializer. Preserve original learn, equipment and randomness.',
    'Observe raw/effective attributes, count, special_skill flags, betrayer/times, weapon and apprenticeship as configured; do not infer learnability from set_skill.',
    'Report ordinary continued learning separately from initial grants, recruitment and special teaching; command acceptance is not learning progress.',
];
const knowledge = new Set(['literate', 'medical', 'taoism', 'zuoyou-hubo']);
const short = t => t.path.split('/').at(-1).slice(0, -2);
const assignments = t => [...new Map(t.skill_assignments.filter(s => !s.receiver && s.function === 'create')
    .map(s => [s.id, s])).values()];
const declaration = (t, s) => assignments(t).find(a => a.id === s);

export function gumuTeacherCanLearn(skill, actor) {
    assert.ok(skills.includes(skill), skill);
    if (gumuCultivationSkills.includes(skill)) return gumuCultivationCanLearn(skill, actor);
    if (gumuUnarmedLearningProfiles.some(p => p[0] === skill))
        return gumuUnarmedLearningAllowed({ skill, actor }, 'valid_learn');
    if (gumuWeaponLearningProfiles.some(p => p[0] === skill))
        return gumuWeaponLearningAllowed({ skill, actor }, 'valid_learn');
    if (skill === 'zuoyou-hubo') {
        const p = actor.properties, s = actor.skills;
        return !(p.gender === '无性' && s[skill] >= 50) && !(s.count || p['special_skill/qinzong'])
            && (p.int <= 15 || !!p['special_skill/tiandao'])
            && Math.trunc((s.force ?? 0) / 2) + (s[actor.mappings.force] ?? 0) >= Math.trunc(s[skill] * 3 / 4);
    }
    return true; // Reviewed basic skills and the two movement skills.
}

// This mirrors the reviewed positive-level, single-command experiment only.
// The full LPC command remains authoritative and must be invoked by the runner.
export function gumuTeacherExpectation(skill, actor, { teacherLevel, apprentice = true, times = 1 } = {}) {
    assert.ok(skills.includes(skill)); assert.ok(Number.isSafeInteger(teacherLevel) && teacherLevel > 0);
    assert.ok(Number.isSafeInteger(times) && times >= 1 && times <= 100);
    const q = actor.properties, s = actor.skills, level = s[skill], martial = !knowledge.has(skill);
    assert.ok(Number.isSafeInteger(level) && level > 0 && q.int > 0);
    let accepted = 1, completed = 0, clearJing = false;
    const cap = martial && level >= 200;
    if (!apprentice) accepted = 0;
    else if (!cap) {
        if (level >= teacherLevel || level >= teacherLevel - (q['betrayer/times'] ?? 0) * 2
            || q['env/no_learn'] === skill || !gumuTeacherCanLearn(skill, actor)
            || q.potential - q.learned_points < times) accepted = 0;
        else if (!martial || Math.trunc(level ** 3 / 10) <= q.combat_exp) {
            const cost = Math.trunc((100 + 2 * level) / q.int);
            completed = cost ? Math.min(times, Math.trunc(q.jing / cost)) : times;
            clearJing = completed < times;
        }
    }
    const cost = Math.trunc((100 + 2 * level) / q.int);
    let rand = Math.trunc((gumuEffectiveAttribute(actor, 'int') + Math.trunc(level / 5)) / 2);
    if (q['special_skill/wuxing']) rand += Math.trunc(rand * 20 / 100);
    const gain = amount => {
        if (martial) amount += Math.trunc(amount * (s['martial-cognize'] ?? 0) / 500);
        return 1 + Math.trunc(amount * 100 / (level + 100));
    };
    const bounds = [gain(4) * completed, gain(4 + Math.max(0, rand - 1)) * completed];
    assert.ok(bounds[1] <= (level + 1) ** 2, 'This preparation does not model level-up during a lesson.');
    return { command_kind: 'learn', command_accepted: accepted, contribution_spent: 0,
        jing_spent: clearJing ? q.jing : cost * completed, learned_points_spent: completed,
        skills_after: {}, learning_progress: completed ? { [skill]: bounds } : {}, may_improve_skills: completed > 0 };
}

export function gumuTeachersConditions(relations, catalog, readSource, { smoke = false } = {}) {
    const teachers = relations.objects.filter(t => t.group === 'gumu');
    assert.deepEqual(teachers.map(short).sort(), names, '古墓NPC范围变化，须重新核对');
    const actualSkills = [...new Set(teachers.flatMap(t => assignments(t).map(s => s.id)))].sort();
    assert.deepEqual(actualSkills, skills);
    assert.deepEqual(teachers.map(t => assignments(t).length), [20, 19, 21, 22]);
    const versions = gumuTeachersSources.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), gumuTeachersReviewed, '古墓授课源码变化，须重新核对');
    const evidence = versions.map(([path, sha256]) => ({ path, sha256 })), result = [];
    function add(teacher, skill, level, variant, extra = {}) {
        const assignment = declaration(teacher, skill), source = catalog.skills.find(s => s.id === skill);
        assert.ok(assignment && source); assert.equal(assignment.level.kind, 'integer');
        const naming = teacher.names.find(n => n.function === 'create');
        const npc = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        assert.ok(npc);
        const line = readSource(teacher.path).split('\n').findIndex(s => /^void create\(/.test(s)) + 1;
        assert.ok(line > 0);
        const entry = { id: `${teacher.path}:${line}:create`, path: teacher.path,
            sha256: teacher.sha256, function: 'create', line, role: 'teaching' };
        const force = gumuForces.includes(skill) ? skill : 'suxin-jue';
        const actor = { skills: { force: 600, dodge: 600, sword: 600, whip: 600,
            unarmed: 600, strike: 600, throwing: 600, parry: 600, literate: 400,
            [force]: 400, ...(skill === 'xuantie-jian' ? { 'martial-cognize': 220 } : {}),
            [skill]: level, ...extra.skills }, mappings: {}, properties: {
                'family/family_name': '古墓派', 'family/master_id': npc, 'family/master_name': naming.values[0],
                gender: ['sad-strike', 'surge-force'].includes(skill) ? '男性' : '女性', character: '国士无双',
                str: 36, con: 36, dex: 36, int: skill === 'zuoyou-hubo' ? 15 : 36,
                combat_exp: 100000000, max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, gongxian: 0, ...extra.properties } };
        if (skill !== 'force' && !extra.unmappedForce) actor.mappings.force = force;
        const weapon = gumuWeaponLearningProfiles.find(p => p[0] === skill);
        if (weapon?.[5] && !extra.unarmed) actor.equipment = { type: weapon[1], hold: false };
        for (const id of Object.keys(actor.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
        const apprentice = actor.properties['family/master_id'] === npc
            && actor.properties['family/master_name'] === naming.values[0];
        const expected = gumuTeacherExpectation(skill, actor, { teacherLevel: assignment.level.value,
            apprentice, times: extra.times ?? 1 });
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || Object.keys(actor.skills).some(s => e.path === `kungfu/skill/${s}.c`));
        result.push({ id: `teaching-gumu-learn-${short(teacher)}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: smoke ? 1 : extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level,
                teacher_level: assignment.level.value, teaching_profile: 'gumu-teachers',
                teaching_kind: 'ordinary_learning', action: `learn ${npc} ${skill} ${extra.times ?? 1}`,
                actor, target: { skills: {}, mappings: {}, properties: {} },
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                unchanged_properties: ['combat_exp'], known_issue: null,
                teaching_expectations: [expected], expected: expected.may_improve_skills ? 'observed' : 'refused', variant,
                note: '四位原NPC的82条最终已学关系；师承、已学等级及辅助资格是实验赋值，不证明正常拜师或初次学会。普通继续学习与特殊启蒙、传招分列。受理不等于增长，精神清零余量、潜能、原随机及修养加成分别记录。',
            } });
    }
    for (const teacher of teachers) {
        for (const { id, level } of assignments(teacher)) {
            const cap = knowledge.has(id) ? level.value : Math.min(200, level.value);
            add(teacher, id, 10, 'level10');
            add(teacher, id, cap - 1, 'below-cap');
            add(teacher, id, cap, 'at-cap');
        }
        for (const [variant, properties] of [['other-master', { 'family/master_id': 'other master' }],
            ['other-name', { 'family/master_name': '别位师父' }]]) add(teacher, 'force', 10, variant, { properties });
    }
    for (const skill of skills.filter(s => s !== 'martial-cognize')) {
        const teacher = teachers.filter(t => declaration(t, skill)).sort((a, b) =>
            declaration(b, skill).level.value - declaration(a, skill).level.value || a.path.localeCompare(b.path))[0];
        add(teacher, skill, 100, 'distribution', { samples: 100 });
    }
    const check = (name, skill, variant, extra = {}) => add(teachers.find(t => short(t) === name),
        skill, extra.level ?? 100, variant, extra);
    for (const skill of ['meinv-quan', 'literate']) {
        check('lin', skill, 'potential0', { properties: { potential: 0 } });
        check('lin', skill, 'potential2-times3', { times: 3, properties: { potential: 2 } });
        check('lin', skill, 'exp0', { properties: { combat_exp: 0 } });
        check('lin', skill, 'jing7', { properties: { jing: 7 } });
        check('lin', skill, 'partial3', { times: 3, properties: { jing: 17 } });
        check('lin', skill, 'times50', { times: 50, samples: 100 });
        check('lin', skill, 'times100', { times: 100, samples: 100 });
        check('lin', skill, 'no-learn', { properties: { 'env/no_learn': skill } });
        check('lin', skill, 'wuxing', { properties: { 'special_skill/wuxing': 1 }, samples: 100 });
        check('lin', skill, 'cognize500', { skills: { 'martial-cognize': 500 }, samples: 100 });
    }
    for (const level of [297, 298]) check('lin', 'literate', 'betrayer-l' + level,
        { level, properties: { 'betrayer/times': 1 } });
    for (const [teacher, skill, variant, extra] of [
        ['lin', 'suxin-jue', 'force9', { skills: { force: 9 } }],
        ['lin', 'yunv-xinjing', 'int31', { properties: { int: 31 } }],
        ['yang', 'surge-force', 'female', { properties: { gender: '女性' } }],
        ['longnv', 'suxin-jian', 'male', { properties: { gender: '男性' } }],
        ['longnv', 'suxin-jian', 'unarmed', { unarmed: true }],
        ['longnv', 'yinsuo-jinling', 'dex27', { properties: { dex: 27 } }],
        ['li', 'sanwu-shou', 'upright', { properties: { character: '光明磊落' } }],
        ['li', 'wudu-shenzhang', 'upright', { properties: { character: '光明磊落' } }],
        ['yang', 'sad-strike', 'female', { properties: { gender: '女性' } }],
        ['yang', 'xuantie-jian', 'cognize219', { skills: { 'martial-cognize': 219 } }],
        ['li', 'bingpo-shenzhen', 'dodge198', { skills: { dodge: 198 } }],
        ['longnv', 'yufeng-zhen', 'dodge158', { skills: { dodge: 158 } }],
    ]) check(teacher, skill, variant, extra);
    for (const [variant, extra] of [
        ['int16', { properties: { int: 16 } }],
        ['tiandao', { properties: { int: 36, 'special_skill/tiandao': 1 } }],
        ['count1', { skills: { count: 1 } }],
        ['qinzong', { properties: { 'special_skill/qinzong': 1 } }],
        ['force148', { skills: { force: 148 }, unmappedForce: true }],
        ['force150', { skills: { force: 150 }, unmappedForce: true }],
        ['eunuch49', { level: 49, properties: { gender: '无性' } }],
        ['eunuch50', { level: 50, properties: { gender: '无性' } }],
    ]) check('longnv', 'zuoyou-hubo', variant, extra);
    assert.equal(new Set(result.map(c => c.id)).size, result.length);
    return result;
}
