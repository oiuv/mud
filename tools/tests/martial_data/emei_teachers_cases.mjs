// Original Emei NPCs and learn command. Prepared apprenticeship is an
// experiment, not proof that an NPC accepts recruits (notably Guo Xiang).
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const common = ['cmds/skill/learn.c', 'feature/apprentice.c', 'feature/attribute.c',
    'feature/master.c', 'feature/skill.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'inherit/char/npc.c', 'inherit/skill/force.c', 'inherit/skill/skill.c', 'kungfu/class/emei/emei.h'];
const names = 'bei dao daoming ding fang feng fengling guoxiang he hui ji jia kong li ling miejue su wenfang wenhui wenqing wenyin xian xin xu xuan zhao zhen zhou'.split(' ');
const skills = ('blade claw dodge finger force hand parry strike sword unarmed whip buddhism literate mahayana martial-cognize '
    + 'emei-jian emei-jiuyang emei-xinfa huifeng-jian jieshou-jiushi jinding-zhang linji-zhuang piaoxue-zhang '
    + 'sixiang-zhang tiangang-zhi yanxing-dao yitian-jian zhutian-bu cuixin-zhang jiuyin-baiguzhao shexing-lifan yijin-duangu yinlong-bian').split(' ');
export const emeiTeachersSources = [...common, ...names.map(n => `kungfu/class/emei/${n}.c`),
    ...skills.map(s => `kungfu/skill/${s}.c`)];
const reviewed = '8fc2ac7e45b9e8af9dd6a8f2ab830bc8edc0e38f67da5a665bc02b1a815c3d58';
const knowledge = new Set(['buddhism', 'literate', 'mahayana']);
const short = t => t.path.split('/').at(-1).slice(0, -2);
const assignments = t => [...new Map(t.skill_assignments.filter(s => !s.receiver && s.function === 'create')
    .map(s => [s.id, s])).values()];
const declaration = (t, skill) => assignments(t).find(s => s.id === skill);
const denied = (t, s) => s === 'emei-jiuyang' && ['miejue', 'fengling'].includes(short(t))
    || s === 'linji-zhuang' && 'he hui jia kong xian xin xu xuan zhao zhen zhou'.split(' ').includes(short(t))
    || short(t) === 'zhou' && ['shexing-lifan', 'yijin-duangu', 'cuixin-zhang', 'jiuyin-baiguzhao', 'yinlong-bian'].includes(s);

export function emeiTeachersConditions(relations, catalog, readSource) {
    const teachers = relations.objects.filter(t => t.group === 'emei');
    if (teachers.every(t => t.learning_permissions === undefined)) return [];
    assert.deepEqual(teachers.map(short).sort(), [...names].sort(), '峨嵋NPC范围变化，须重新核对');
    const paths = [...new Set([...common, ...teachers.map(t => t.path),
        ...teachers.flatMap(t => t.skill_assignments.map(s => s.skill_source.path))])].sort();
    const versions = paths.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), reviewed, '峨嵋授课源码变化，须重新核对');
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
        const force = ['emei-xinfa', 'emei-jiuyang', 'linji-zhuang', 'yijin-duangu'].includes(skill)
            ? skill : 'linji-zhuang';
        const actor = { skills: { force: 400, unarmed: 400, sword: 400, blade: 400, strike: 400,
            claw: 400, hand: 400, finger: 400, whip: 400, dodge: 400, parry: 400,
            buddhism: 400, mahayana: 400, literate: 400, [force]: 400, [skill]: level, ...extra.skills },
            mappings: {}, properties: { 'family/family_name': '峨嵋派', 'family/master_id': npc,
                'family/master_name': naming.values[0], gender: '女性', class: 'bonze', shen: 100000,
                str: 36, con: 36, dex: 36, int: 36, character: '光明磊落', combat_exp: 100000000,
                max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, gongxian: 0, ...extra.properties } };
        if (skill !== 'force') actor.mappings.force = force;
        for (const id of Object.keys(actor.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
        const apprentice = actor.properties['family/master_id'] === npc
            && actor.properties['family/master_name'] === naming.values[0];
        const noTeach = denied(teacher, skill), cap = !knowledge.has(skill) && level >= 200;
        const blocked = !apprentice || noTeach || cap || level >= assignment.level.value || skill === 'martial-cognize';
        const completed = extra.completed ?? (blocked ? 0 : extra.times ?? 1);
        const accepted = extra.accepted ?? (!apprentice ? 0 : noTeach || cap ? 1 : blocked ? 0 : 1);
        const cost = Math.trunc((100 + level * 2) / actor.properties.int);
        const rand = Math.trunc((actor.properties.int + Math.trunc((actor.skills.literate ?? 0) / 10)
            + Math.trunc(level / 5)) / 2);
        const progress = amount => 1 + Math.trunc(amount * 100 / (level + 100));
        const expected = { command_kind: 'learn', command_accepted: accepted, contribution_spent: 0,
            jing_spent: extra.clearJing ? actor.properties.jing : cost * completed,
            learned_points_spent: completed, skills_after: {}, learning_progress: completed
                ? { [skill]: [progress(4) * completed, progress(4 + rand - 1) * completed] } : {},
            may_improve_skills: completed > 0 };
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || Object.keys(actor.skills).some(s => e.path === `kungfu/skill/${s}.c`));
        result.push({ id: `teaching-emei-learn-${short(teacher)}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level,
                teacher_level: assignment.level.value, teaching_profile: 'emei-teachers',
                teaching_kind: 'ordinary_learning', action: `learn ${npc} ${skill} ${extra.times ?? 1}`,
                actor, target: { skills: {}, mappings: {}, properties: {} },
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                fighting: false, observe_seconds: 0, not_applicable: '', monitored_grants: [],
                unchanged_properties: ['combat_exp'], known_issue: null,
                teaching_expectations: [expected], expected: completed ? 'observed' : 'refused', variant,
                note: '28个原NPC的最终已学关系逐项尝试；师承和辅助技能为实验赋值，不证明可拜师。郭襄明确拒收徒及五位小师父无收徒入口另列，不把实验师承当线上养成。禁授、学习上限、资格、资源和随机均沿用原learn；不预写进度或领悟。',
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
    for (const skill of skills) {
        if (skill === 'martial-cognize') continue;
        const teacher = teachers.filter(t => declaration(t, skill) && !denied(t, skill))
            .sort((a, b) => declaration(b, skill).level.value - declaration(a, skill).level.value
                || a.path.localeCompare(b.path))[0];
        if (teacher) add(teacher, skill, Math.min(100, declaration(teacher, skill).level.value - 1),
            'distribution', { samples: 100 });
    }
    const check = (name, skill, variant, extra = {}) => add(teachers.find(t => short(t) === name),
        skill, extra.level ?? 100, variant, extra);
    for (const skill of ['emei-jian', 'mahayana']) {
        check('miejue', skill, 'potential0', { properties: { potential: 0 }, completed: 0, accepted: 0 });
        check('miejue', skill, 'exp0', { properties: { combat_exp: 0 }, completed: knowledge.has(skill) ? 1 : 0 });
        check('miejue', skill, 'jing7', { properties: { jing: 7 }, completed: 0, clearJing: true });
        check('miejue', skill, 'partial3', { times: 3, properties: { jing: 17 }, completed: 2, clearJing: true });
        check('miejue', skill, 'times50', { times: 50, samples: 100 });
    }
    for (const [skill, teacher, properties, actorSkills] of [
        ['linji-zhuang', 'miejue', { gender: '男性' }, {}],
        ['linji-zhuang', 'miejue', {}, { mahayana: 100 }],
        ['emei-jiuyang', 'guoxiang', { con: 33 }, {}],
        ['emei-jiuyang', 'guoxiang', { max_neili: 1199, neili: 1199 }, {}],
        ['mahayana', 'miejue', { shen: -1 }, {}],
        ['buddhism', 'miejue', { guilty: 1 }, {}],
    ]) check(teacher, skill, 'qualification' + Object.keys(properties).join('-')
        + Object.keys(actorSkills).join('-'), { properties, skills: actorSkills, completed: 0, accepted: 0 });
    return result;
}
