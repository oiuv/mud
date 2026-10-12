// Original learn with all 22 Quanzhen NPCs; declarations are candidates, not grants.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const knowledge = new Set(['literate', 'taoism', 'jingluo-xue', 'zuoyou-hubo']);
const common = ['cmds/skill/learn.c', 'feature/apprentice.c', 'feature/attribute.c',
    'feature/master.c', 'feature/skill.c', 'inherit/char/npc.c',
    'inherit/skill/force.c', 'inherit/skill/skill.c', 'kungfu/class/quanzhen/quanzhen.h'];
const reviewed = '72af6bd10579bf569a743c9fb11a714a458369a8f5a07df7fde530461886e36e';
export const quanzhenLearningSources = [...common,
    ...'chen cheng cui fang hao ji li liu ma pi qi qiu shen sun tan wang wangchuyi wangzhi yin zhang zhao zhou'
        .split(' ').map(id => `kungfu/class/quanzhen/${id}.c`),
    ...('force quanzhen-xinfa dodge tianshan-feidu parry sword qixing-jian finger zhongnan-zhi literate taoism '
        + 'martial-cognize strike chongyang-shenzhang xuanmen-neigong quanzhen-jian hand qixing-shou jinyan-gong '
        + 'haotian-zhang whip tiangang-chenfa jinguan-yusuo tonggui-jian unarmed xiantian-gong yiyang-zhi '
        + 'jingluo-xue yijin-duangu shexing-lifan kongming-quan zuoyou-hubo').split(' ').map(id => `kungfu/skill/${id}.c`)];

export function quanzhenLearningConditions(relations, catalog, readSource) {
    const teachers = relations.objects.filter(o => o.group === 'quanzhen');
    if (teachers.every(o => o.learning_permissions === undefined)) return [];
    assert.equal(teachers.length, 22, '全真教师范围变化，须重新核对');
    const paths = [...new Set([...common, ...teachers.map(o => o.path),
        ...teachers.flatMap(o => o.skill_assignments.map(s => s.skill_source.path))])].sort();
    const versions = paths.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), reviewed, '全真学习源码变化，须重新核对');
    const evidence = versions.map(([path, sha256]) => ({ path, sha256 })), result = [];
    const assignments = teacher => [...new Map(teacher.skill_assignments
        .filter(s => !s.receiver && s.function === 'create').map(s => [s.id, s])).values()];
    const declaration = (teacher, skill) => assignments(teacher).find(s => s.id === skill);
    const denied = (teacher, skill) => teacher.no_teach_declarations.some(d => d.skill === skill);
    const teacherNamed = name => teachers.find(o => o.path === `kungfu/class/quanzhen/${name}.c`);
    function add(teacher, skill, level, variant, extra = {}) {
        const assignment = declaration(teacher, skill), source = catalog.skills.find(s => s.id === skill);
        assert.ok(assignment && source); assert.equal(assignment.level.kind, 'integer');
        const masterLevel = assignment.level.value;
        const naming = teacher.names.find(n => n.function === 'create');
        const npc = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        assert.ok(npc, 'NPC 原身份不是已核对的字面量');
        const line = readSource(teacher.path).split('\n').findIndex(s => /^void create\(/.test(s)) + 1;
        assert.ok(line > 0, '教师初始化入口缺失');
        const entry = { id: `${teacher.path}:${line}:create`, path: teacher.path,
            sha256: teacher.sha256, function: 'create', line, role: 'teaching' };
        const force = ['quanzhen-xinfa', 'xuanmen-neigong', 'xiantian-gong', 'yijin-duangu'].includes(skill)
            ? skill : 'xuanmen-neigong';
        const actor = { skills: { force: 400, unarmed: 400, sword: 400, strike: 400,
            finger: 400, hand: 400, dodge: 400, parry: 400, whip: 400, taoism: 400,
            [force]: 400, [skill]: level, ...extra.skills }, mappings: {},
            properties: { 'family/family_name': '全真教', 'family/master_id': npc,
                'family/master_name': naming.values[0], gender: '男性', shen: 100000,
                str: 36, con: 36, dex: 36, int: skill === 'zuoyou-hubo' ? 15 : 36,
                character: '光明磊落', combat_exp: 100000000, max_neili: 6000, neili: 6000,
                jing: 10000, eff_jing: 10000, potential: 10000, learned_points: 0,
                gongxian: 0, ...extra.properties }, ...(extra.busy ? { busy: 2 } : {}) };
        // Keep effective force high without importing an incompatible extra force.
        if (skill !== 'force') actor.mappings.force = force;
        if (skill === 'tiangang-chenfa') actor.equipment = { type: 'whip', hold: false };
        for (const id of Object.keys(actor.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
        const noTeach = denied(teacher, skill), martialCap = !knowledge.has(skill) && level >= 200;
        const blocked = noTeach || martialCap || level >= masterLevel || skill === 'martial-cognize';
        const completed = extra.completed ?? (blocked ? 0 : extra.times ?? 1);
        const accepted = extra.accepted ?? (noTeach || martialCap ? 1 : blocked ? 0 : 1);
        const cost = Math.trunc((100 + level * 2) / actor.properties.int);
        const effectiveInt = actor.properties.int + Math.trunc((actor.skills.literate ?? 0) / 10);
        let rand = Math.trunc((effectiveInt + Math.trunc(level / 5)) / 2);
        if (actor.properties['special_skill/wuxing']) rand += Math.trunc(rand * 20 / 100);
        const progress = amount => 1 + Math.trunc(amount * 100 / (level + 100));
        const expected = { command_kind: 'learn', command_accepted: accepted,
            contribution_spent: 0, jing_spent: extra.clearJing ? actor.properties.jing : cost * completed,
            learned_points_spent: completed, skills_after: {}, learning_progress: completed
                ? { [skill]: [progress(4) * completed, progress(4 + rand - 1) * completed] } : {},
            may_improve_skills: completed > 0 };
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || e.path === source.path || e.path === `kungfu/skill/${force}.c`);
        result.push({ id: `teaching-quanzhen-learn-${teacher.path.split('/').at(-1).slice(0, -2)}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level,
                teacher_level: masterLevel, teaching_profile: 'quanzhen', teaching_kind: 'ordinary_learning',
                action: `learn ${npc} ${skill} ${extra.times ?? 1}`, actor,
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                target: { skills: {}, mappings: {}, properties: {} },
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                monitored_grants: [], unchanged_properties: ['combat_exp'], known_issue: null,
                teaching_expectations: [expected], expected: completed ? 'observed' : 'refused',
                note: '师承与前置技能为显式实验赋值，不代表完成拜师养成；原NPC、learn、valid_learn和improve_skill不替换。22个NPC的全部初始化技能逐项尝试；无进展如实保留。无转世权限注入、无认知加成；特殊条件另注明。',
                variant,
            } });
    }
    for (const teacher of teachers) {
        for (const { id, level } of assignments(teacher)) {
            const cap = knowledge.has(id) ? level.value : Math.min(200, level.value);
            add(teacher, id, 10, 'level10');
            add(teacher, id, cap - 1, 'below-cap');
            add(teacher, id, cap, 'at-cap');
        }
        for (const [variant, properties, completed, accepted] of [
            ['other-master', { 'family/master_id': 'other master' }, 0, teacher.path.endsWith('/zhou.c') ? 1 : 0],
            ['other-name', { 'family/master_name': '别位师父' }, 0, teacher.path.endsWith('/zhou.c') ? 1 : 0],
        ]) add(teacher, 'force', 10, variant, { properties, completed, accepted });
    }
    // Same formula, one 100-sample distribution per actually teachable skill.
    const ids = [...new Set(teachers.flatMap(o => assignments(o).map(s => s.id)))];
    for (const skill of ids) {
        if (skill === 'martial-cognize') continue;
        const candidates = teachers.filter(t => declaration(t, skill) && !denied(t, skill))
            .sort((a, b) => declaration(b, skill).level.value - declaration(a, skill).level.value
                || a.path.localeCompare(b.path));
        if (candidates.length) add(candidates[0], skill, 100, 'distribution', { samples: 100 });
    }
    const wang = teacherNamed('wang'), zhou = teacherNamed('zhou');
    const check = (skill, variant, extra) => add(skill === 'zuoyou-hubo' ? zhou : wang, skill,
        extra.level ?? 100, variant, extra);
    for (const skill of ['quanzhen-jian', 'taoism']) {
        check(skill, 'potential0', { properties: { potential: 0 }, completed: 0, accepted: 0 });
        check(skill, 'exp0', { properties: { combat_exp: 0 }, completed: knowledge.has(skill) ? 1 : 0 });
        check(skill, 'jing7', { properties: { jing: 7 }, completed: 0, clearJing: true });
        check(skill, 'jing8', { properties: { jing: 8 } });
        check(skill, 'partial', { properties: { jing: 19 }, times: 3, completed: 2, clearJing: true });
        check(skill, 'times100', { times: 100, completed: 100 });
        check(skill, 'busy', { busy: true, completed: 0, accepted: 0 });
        check(skill, 'fighting', { fighting: true, completed: 0, accepted: 0 });
        check(skill, 'no-learn', { properties: { 'env/no_learn': skill }, completed: 0, accepted: 0 });
        check(skill, 'neili0', { properties: { neili: 0 } });
    }
    for (const level of [19, 20]) check('taoism', `asexual${level}`,
        { level, properties: { gender: '无性' }, completed: level < 20 ? 1 : 0, accepted: level < 20 ? 1 : 0 });
    for (const level of [49, 50]) check('zuoyou-hubo', `asexual${level}`,
        { level, properties: { gender: '无性' }, completed: level < 50 ? 1 : 0, accepted: level < 50 ? 1 : 0 });
    check('zuoyou-hubo', 'int16', { properties: { int: 16 }, completed: 0, accepted: 0 });
    check('zuoyou-hubo', 'count1', { skills: { count: 1 }, completed: 0, accepted: 0 });
    check('zuoyou-hubo', 'mathematics1', { skills: { mathematics: 1 } });
    check('zuoyou-hubo', 'qinzong', { properties: { 'special_skill/qinzong': 1 }, completed: 0, accepted: 0 });
    check('zuoyou-hubo', 'tiandao-int36', { properties: { int: 36, 'special_skill/tiandao': 1 } });
    for (const force of [149, 150]) check('zuoyou-hubo', `force${force}`, {
        skills: { force, 'xuanmen-neigong': 0 }, completed: force < 150 ? 0 : 1, accepted: force < 150 ? 0 : 1 });
    // Knowledge uses the teacher's level and betrayal reduction, not the martial 200 cap.
    for (const level of [397, 398]) check('taoism', `betrayer-${level}`, {
        level, properties: { 'betrayer/times': 1 }, completed: level < 398 ? 1 : 0, accepted: level < 398 ? 1 : 0 });
    return result;
}
