// First Shaolin teacher batch: all eighteen Luohan, not all 63 Shaolin NPCs.
// Original learn/NPC/skill code executes in the shared isolated runner.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const common = ['cmds/skill/learn.c', 'feature/apprentice.c', 'feature/attribute.c',
    'feature/master.c', 'feature/skill.c', 'inherit/char/npc.c', 'inherit/skill/force.c',
    'inherit/skill/skill.c', 'inherit/skill/shaolin.c', 'inherit/misc/equip.c',
    'kungfu/class/shaolin/cheng.h', 'kungfu/class/shaolin/shaolin.h'];
const names = 'guan he ji jian jing ling mie ming shang shi si xin xin2 xing yi yu zhi zhi2'.split(' ');
const skills = ('banruo-zhang blade buddhism cibei-dao claw club cuff dacheng-fosuo damo-jian dodge '
    + 'fengyun-shou finger force fuhu-quan fumo-jian hand hongye-daofa huilong-zhang hunyuan-yiqi '
    + 'jiechen-dao jimie-zhua jingang-quan leiming-bian literate liuhe-bian longzhua-gong luohan-gun '
    + 'luohan-jian luohan-quan nianhua-zhi parry pona-gong pudu-zhang qianye-shou qingliang-jian '
    + 'qingyun-bian qinna-shibada qufannao-zhi sanhua-zhang shaolin-shenfa shaolin-tantui shaolin-xinfa '
    + 'staff strike sword unarmed weituo-chu weituo-gun whip woshi-zhang wuchang-zhang xiuluo-dao '
    + 'yecha-gun yingzhua-gong yizhi-chan zui-gun zuiquan-sanda').split(' ');
export const shaolinLearningSources = [...common,
    ...names.map(n => `kungfu/class/shaolin/cheng-${n}.c`), ...skills.map(s => `kungfu/skill/${s}.c`)];
const reviewed = '8a02b4bcd9c11f7387d87fa1eb3b5e869c0eb2366beaa67382444afbb0b16c73';
const knowledge = new Set(['buddhism', 'literate']);
const held = { 'yecha-gun': 'club', 'dacheng-fosuo': 'whip', 'leiming-bian': 'whip', 'qingyun-bian': 'whip' };

export function shaolinTeachingConditions(relations, catalog, readSource) {
    const teachers = relations.objects.filter(t => t.path.startsWith('kungfu/class/shaolin/cheng-'));
    if (teachers.every(t => t.learning_permissions === undefined)) return [];
    assert.equal(teachers.length, 18, '十八罗汉范围变化，须重新核对');
    const paths = [...new Set([...common, ...teachers.map(t => t.path),
        ...teachers.flatMap(t => t.skill_assignments.map(s => s.skill_source.path))])].sort();
    const versions = paths.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), reviewed, '少林罗汉学习源码变化，须重新核对');
    const evidence = versions.map(([path, sha256]) => ({ path, sha256 }));
    const assignments = t => [...new Map(t.skill_assignments.filter(s => !s.receiver && s.function === 'create')
        .map(s => [s.id, s])).values()];
    const declaration = (t, skill) => assignments(t).find(s => s.id === skill);
    const named = n => teachers.find(t => t.path === `kungfu/class/shaolin/cheng-${n}.c`);
    const result = [];
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
        const actor = { skills: { force: 400, unarmed: 400, cuff: 400, sword: 400, blade: 400,
            club: 400, staff: 400, whip: 400, claw: 400, strike: 400, finger: 400, hand: 400,
            dodge: 400, parry: 400, buddhism: 400, 'hunyuan-yiqi': 400, 'shaolin-xinfa': 400,
            'sanhua-zhang': 80, 'fumo-jian': 80, [skill]: level, ...extra.skills }, mappings: {},
            properties: { 'family/family_name': '少林派', 'family/master_id': npc,
                'family/master_name': naming.values[0], gender: '男性', class: 'bonze', shen: 100000,
                str: 36, con: 36, dex: 36, int: 36, character: '光明磊落', combat_exp: 100000000,
                max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, gongxian: 0, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}) };
        if (skill !== 'force') actor.mappings.force = 'hunyuan-yiqi';
        if (held[skill] && !extra.noWeapon) actor.equipment = { type: held[skill], hold: false };
        const blocked = level >= assignment.level.value;
        const completed = extra.completed ?? (blocked ? 0 : extra.times ?? 1);
        const accepted = extra.accepted ?? (blocked ? 0 : 1);
        const cost = Math.trunc((100 + level * 2) / actor.properties.int);
        const effectiveInt = actor.properties.int + Math.trunc((actor.skills.literate ?? 0) / 10);
        const rand = Math.trunc((effectiveInt + Math.trunc(level / 5)) / 2);
        const progress = amount => 1 + Math.trunc(amount * 100 / (level + 100));
        const expectation = { command_kind: 'learn', command_accepted: accepted,
            contribution_spent: 0, jing_spent: extra.clearJing ? actor.properties.jing : cost * completed,
            learned_points_spent: completed, skills_after: {}, learning_progress: completed
                ? { [skill]: [progress(4) * completed, progress(4 + rand - 1) * completed] } : {},
            may_improve_skills: completed > 0 };
        // Include every preloaded prerequisite, not just the target skill.
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || Object.keys(actor.skills).some(s => e.path === `kungfu/skill/${s}.c`));
        result.push({ id: `teaching-shaolin-luohan-${teacher.path.split('/').at(-1).slice(0, -2)}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level,
                teacher_level: assignment.level.value, teaching_profile: 'shaolin-luohan',
                teaching_kind: 'ordinary_learning', action: `learn ${npc} ${skill} ${extra.times ?? 1}`,
                actor, target: { skills: {}, mappings: {}, properties: {} },
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                monitored_grants: [], unchanged_properties: ['combat_exp'], known_issue: null,
                teaching_expectations: [expectation], expected: completed ? 'observed' : 'refused', variant,
                note: '少林首批十八罗汉，共208条最终初始技能关系。师承及前置技能为实验赋值，不证明已完成推荐信或拜师养成；无转世许可、无修养加成。原NPC/learn/valid_learn/improve_skill不替换，目标等级不超过原教师上限；另外45个NPC及特殊传授尚待后续采集。',
            } });
    }
    for (const teacher of teachers) {
        for (const { id, level } of assignments(teacher)) {
            add(teacher, id, 10, 'level10');
            add(teacher, id, level.value - 1, 'below-cap');
            add(teacher, id, level.value, 'at-cap');
        }
        for (const [variant, properties] of [
            ['other-master', { 'family/master_id': 'other master' }],
            ['other-name', { 'family/master_name': '别位师父' }],
        ]) add(teacher, 'force', 10, variant, { properties, completed: 0, accepted: 0 });
    }
    for (const skill of skills) {
        const teacher = teachers.filter(t => declaration(t, skill))
            .sort((a, b) => declaration(b, skill).level.value - declaration(a, skill).level.value
                || a.path.localeCompare(b.path))[0];
        add(teacher, skill, 50, 'distribution', { samples: 100 });
    }
    const check = (teacher, skill, variant, extra = {}) => add(named(teacher), skill, extra.level ?? 50, variant, extra);
    for (const skill of ['damo-jian', 'buddhism']) {
        check('shang', skill, 'potential0', { properties: { potential: 0 }, completed: 0, accepted: 0 });
        check('shang', skill, 'exp0', { properties: { combat_exp: 0 }, completed: knowledge.has(skill) ? 1 : 0 });
        check('shang', skill, 'jing4', { properties: { jing: 4 }, completed: 0, clearJing: true });
        check('shang', skill, 'jing5', { properties: { jing: 5 } });
        check('shang', skill, 'partial', { properties: { jing: 14 }, times: 3, completed: 2, clearJing: true });
        check('shang', skill, 'times100', { times: 100 });
        check('shang', skill, 'busy', { busy: true, completed: 0, accepted: 0 });
        check('shang', skill, 'fighting', { fighting: true, completed: 0, accepted: 0 });
        check('shang', skill, 'no-learn', { properties: { 'env/no_learn': skill }, completed: 0, accepted: 0 });
        check('shang', skill, 'neili0', { properties: { neili: 0 } });
        for (const level of [82, 83]) check('shang', skill, 'betrayer-' + level, {
            level, properties: { 'betrayer/times': 1 },
            completed: skill === 'buddhism' && level === 83 ? 0 : 1,
            accepted: skill === 'buddhism' && level === 83 ? 0 : 1 });
    }
    for (const skill of ['hunyuan-yiqi', 'buddhism']) check('guan', skill, 'guilty1', {
        properties: { guilty: 1 }, completed: 0, accepted: 0 });
    for (const [variant, properties] of [['female', { gender: '女性' }], ['married', { 'couple/have_couple': 1 }]])
        check('guan', 'hunyuan-yiqi', variant, { properties, completed: 0, accepted: 0 });
    for (const skill of Object.keys(held)) check(skill === 'yecha-gun' ? 'ji' : 'zhi2', skill, 'no-weapon', {
        noWeapon: true, completed: 0, accepted: 0 });
    return result;
}
