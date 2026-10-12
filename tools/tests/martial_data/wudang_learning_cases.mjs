// Original NPC + learn; explicit experimental apprenticeship is not recruitment.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const knowledge = new Set(['literate', 'taoism', 'medical', 'wudang-yaoli']);
const common = ['cmds/skill/learn.c', 'cmds/std/ask.c', 'feature/apprentice.c', 'feature/attribute.c',
    'feature/master.c', 'feature/skill.c', 'feature/dbase.c', 'mudcore/inherit/dbase.c',
    'inherit/char/npc.c', 'inherit/skill/force.c', 'inherit/skill/skill.c', 'kungfu/class/wudang/wudang.h'];
const reviewed = 'e5a5a454c5ea0778d9688f40da50aab7c91d2e9a13624a0a50676a85675d0563';
const permission = 'can_learn/jiuyang-shengong/wudang';
export const wudangLearningSources = [...common,
    ...'bagua daotong famu guxu mingyue mo qingfeng qingxu shan shouyuan song wuxing xi xiaosong yan yin yu zhang zhike zhixiang'
        .split(' ').map(id => `kungfu/class/wudang/${id}.c`),
    ...('blade claw cuixin-zhang dodge force furong-jinzhen hand huzhua-shou jiuyin-baiguzhao liangyi-jian '
        + 'literate martial-cognize medical paiyun-shou parry raozhi-roujian rouyun-jian shenmen-jian shexing-lifan '
        + 'strike sword taiji-dao taiji-jian taiji-quan taiji-shengong taoism throwing tiyunzong unarmed '
        + 'wudang-jian wudang-jiuyang wudang-xinfa wudang-yaoli wudang-zhang xuangong-quan xuanxu-dao '
        + 'yijin-duangu yitian-zhang zhenshan-zhang').split(' ').map(id => `kungfu/skill/${id}.c`)];

export function wudangTeachingConditions(relations, catalog, readSource) {
    const teachers = relations.objects.filter(o => o.group === 'wudang');
    if (teachers.every(o => o.learning_permissions === undefined)) return [];
    assert.equal(teachers.length, 20, '武当NPC范围变化，须重新核对');
    const paths = [...new Set([...common, ...teachers.map(o => o.path),
        ...teachers.flatMap(o => o.skill_assignments.map(s => s.skill_source.path))])].sort();
    const versions = paths.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), reviewed, '武当学习源码变化，须重新核对');
    const evidence = versions.map(([path, sha256]) => ({ path, sha256 })), result = [];
    // Last assignment wins, notably shouyuan's taiji-dao 40 -> 25.
    const assignments = teacher => [...new Map(teacher.skill_assignments
        .filter(s => !s.receiver && s.function === 'create').map(s => [s.id, s])).values()];
    const declaration = (teacher, skill) => assignments(teacher).find(s => s.id === skill);
    const named = name => teachers.find(o => o.path === `kungfu/class/wudang/${name}.c`);
    const short = teacher => teacher.path.split('/').at(-1).slice(0, -2);
    // The current static relation table does not expand set("no_teach", mapping).
    // These reviewed literals and the Jiuyang closure are pinned by the source hash.
    const denied = (teacher, skill) => ['mo', 'shan', 'song', 'xi', 'yan', 'yin', 'yu'].includes(short(teacher))
        && ['taiji-shengong', 'taiji-jian', 'taiji-quan'].includes(skill);
    function add(teacher, skill, level, variant, extra = {}) {
        const assignment = declaration(teacher, skill), source = catalog.skills.find(s => s.id === skill);
        assert.ok(assignment && source); assert.equal(assignment.level.kind, 'integer');
        const masterLevel = assignment.level.value, naming = teacher.names.find(n => n.function === 'create');
        const npc = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        assert.ok(npc, 'NPC原身份不是已核对的字面量');
        const line = readSource(teacher.path).split('\n').findIndex(s => /^void create\(/.test(s)) + 1;
        assert.ok(line > 0);
        const entry = { id: `${teacher.path}:${line}:create`, path: teacher.path,
            sha256: teacher.sha256, function: 'create', line, role: 'teaching' };
        const force = ['wudang-xinfa', 'wudang-jiuyang', 'taiji-shengong', 'yijin-duangu'].includes(skill)
            ? skill : 'taiji-shengong';
        const actor = { skills: { force: 400, unarmed: 400, sword: 400, blade: 400, strike: 400,
            claw: 400, hand: 400, dodge: 400, parry: 400, throwing: 400, taoism: 400, medical: 400,
            'taiji-quan': 100, [force]: 400, [skill]: level, ...extra.skills }, mappings: {},
            properties: { 'family/family_name': '武当派', 'family/master_id': npc,
                'family/master_name': naming.values[0], gender: '男性', shen: 100000,
                str: 36, con: 36, dex: 36, int: 36, character: '光明磊落', combat_exp: 100000000,
                max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, gongxian: 0, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}) };
        if (skill !== 'force') actor.mappings.force = force;
        for (const id of Object.keys(actor.skills)) assert.ok(catalog.skills.some(s => s.id === id), id);
        const noTeach = denied(teacher, skill) || skill === 'wudang-jiuyang'
            && (!extra.acquire || Math.trunc(level / 2) > 180 || actor.properties.shen < 0);
        const apprentice = actor.properties['family/master_id'] === npc
            && actor.properties['family/master_name'] === naming.values[0];
        const martialCap = apprentice && !knowledge.has(skill) && level >= 200;
        const blocked = noTeach || martialCap || level >= masterLevel || skill === 'martial-cognize';
        const completed = extra.completed ?? (blocked ? 0 : extra.times ?? 1);
        const accepted = extra.accepted ?? (noTeach || martialCap ? 1 : blocked ? 0 : 1);
        const cost = Math.trunc((100 + level * 2) / actor.properties.int);
        const effectiveInt = actor.properties.int + Math.trunc((actor.skills.literate ?? 0) / 10);
        const rand = Math.trunc((effectiveInt + Math.trunc(level / 5)) / 2);
        // Acquiring Jiuyang at zero cognition awards exactly level 1, no carried
        // learning progress. Its tiny cognition bonus is still calculated here.
        const progress = amount => 1 + Math.trunc((amount
            + (extra.acquire && !knowledge.has(skill) ? Math.trunc(amount / 500) : 0)) * 100 / (level + 100));
        const expected = { command_kind: 'learn', command_accepted: accepted,
            contribution_spent: 0, jing_spent: extra.clearJing ? actor.properties.jing : cost * completed,
            learned_points_spent: completed, skills_after: {}, learning_progress: completed
                ? { [skill]: [progress(4) * completed, progress(4 + rand - 1) * completed] } : {},
            may_improve_skills: completed > 0,
            ...(extra.acquire ? { grant: permission, value: 1 } : {}) };
        const steps = [];
        if (extra.acquire) {
            actor.properties['can_learn/jiuyang-shengong/kunlun'] = 1;
            actor.properties['can_learn/jiuyang-shengong/shaolin'] = 1;
            steps.push({ command_kind: 'ask', action: `ask ${npc} about 九阳真经`, grant: permission,
                value: 1, contribution_spent: 0, learned_points_spent: 0, may_improve_skills: true,
                skills_after: { 'martial-cognize': 1 }, learned_after: { 'martial-cognize': 0 },
                reward_skill: 'martial-cognize' });
            if (extra.repeatAsk) steps.push({ command_kind: 'ask', action: `ask ${npc} about 九阳真经`,
                grant: permission, value: 1, contribution_spent: 0, learned_points_spent: 0, may_improve_skills: false });
        }
        steps.push(expected);
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || e.path === source.path || e.path === `kungfu/skill/${force}.c`
            || e.path === 'kungfu/skill/taiji-quan.c' || e.path === 'kungfu/skill/literate.c');
        result.push({ id: `teaching-wudang-learn-${short(teacher)}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level, teacher_level: masterLevel,
                teaching_profile: 'wudang', teaching_kind: 'ordinary_learning',
                action: `learn ${npc} ${skill} ${extra.times ?? 1}`, actor,
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                target: { skills: {}, mappings: {}, properties: {} },
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                monitored_grants: extra.acquire ? [permission] : [], unchanged_properties: ['combat_exp'],
                known_issue: null, teaching_expectations: steps, expected: extra.acquire || completed ? 'observed' : 'refused',
                note: '20个原NPC的最终初始化技能逐项尝试；师承及辅助技能为实验赋值，不证明该NPC可拜师。原learn/认可/禁授/资格/进度均不替换。九阳许可链仅预设已获昆仑与少林许可，武当许可及修养奖励经原询问取得；许可进展不等于学习成功。',
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
        for (const [variant, properties] of [
            ['other-master', { 'family/master_id': 'other master' }],
            ['other-name', { 'family/master_name': '别位师父' }],
        ]) add(teacher, 'force', 10, variant, { properties, completed: 0, accepted: short(teacher) === 'zhang' ? 1 : 0 });
    }
    for (const skill of [...new Set(teachers.flatMap(o => assignments(o).map(s => s.id)))]) {
        if (skill === 'martial-cognize') continue;
        const candidates = teachers.filter(t => declaration(t, skill) && !denied(t, skill))
            .sort((a, b) => declaration(b, skill).level.value - declaration(a, skill).level.value
                || a.path.localeCompare(b.path));
        if (candidates.length) add(candidates[0], skill, 100, 'distribution',
            { samples: 100, acquire: skill === 'wudang-jiuyang' });
    }
    const zhang = named('zhang');
    const check = (skill, variant, extra = {}) => add(zhang, skill, extra.level ?? 100, variant, extra);
    for (const skill of ['taiji-jian', 'taoism']) {
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
    for (const level of [397, 398]) check('taoism', `betrayer-${level}`, {
        level, properties: { 'betrayer/times': 1 }, completed: level < 398 ? 1 : 0, accepted: level < 398 ? 1 : 0 });
    for (const level of [179, 180, 181, 199, 200, 361, 362]) for (const outsider of [false, true])
        check('wudang-jiuyang', `permit-${outsider ? 'outsider' : 'disciple'}-${level}`, { level, acquire: true,
            ...(outsider ? { properties: { 'family/family_name': '', 'family/master_id': '', 'family/master_name': '' } } : {}) });
    check('wudang-jiuyang', 'permit-repeat', { acquire: true, repeatAsk: true });
    for (const shen of [-1, 0]) check('wudang-jiuyang', `permit-shen${shen}`, { acquire: true, properties: { shen } });
    check('taoism', 'permit-outsider-other-skill', { acquire: true,
        properties: { 'family/family_name': '', 'family/master_id': '', 'family/master_name': '' }, completed: 0, accepted: 1 });
    return result;
}
