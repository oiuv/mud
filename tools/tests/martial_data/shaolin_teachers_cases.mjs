// Remaining Shaolin NPCs. Experimental apprenticeship is not recruitment;
// Wuming, Kongjian and Jueyuan always execute their original recognition path.
import assert from 'node:assert/strict';
import { sha256 } from './inventory.mjs';

const common = ['cmds/skill/learn.c', 'cmds/std/give.c', 'feature/apprentice.c',
    'feature/attribute.c', 'feature/master.c', 'feature/skill.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'inherit/char/npc.c', 'inherit/skill/force.c',
    'inherit/skill/skill.c', 'inherit/skill/shaolin.c', 'inherit/misc/equip.c',
    'd/items/book.lpc', 'd/items/book_data.h', 'adm/daemons/virtuald.c',
    ...'dao du hui qing shaolin xuan xuan-ku xuan-nan'.split(' ').map(n => `kungfu/class/shaolin/${n}.h`)];
const names = ('da-mo dao-chen dao-cheng dao-guo dao-jue dao-pin dao-xiang dao-xiang2 dao-yi dao-zheng '
    + 'du-e du-jie du-nan du-yuan hui-he hui-jie hui-kong hui-ming hui-ru hui-se hui-xiu hui-xu hui-zhen '
    + 'jue-yuan kong-jian qing-fa qing-guan qing-le qing-shan qing-wei qing-wen qing-wu qing-xiao qing-yuan '
    + 'tuoboseng wuming xingzhe xu-ming xu-tong xuan-bei xuan-ci xuan-ji xuan-ku xuan-nan xuan-tong').split(' ');
const skills = ('banruo-zhang blade buddhism cibei-dao claw club cuff dacheng-fosuo dacidabei-shou damo-jian '
    + 'dodge duoluoye-zhi emei-jiuyang fengyun-shou finger force fuhu-quan fumo-jian hand hongye-daofa '
    + 'huilong-zhang hunyuan-yiqi jiasha-fumogong jiechen-dao jimie-zhua jingang-buhuaiti jingang-quan jingang-zhi '
    + 'jingluo-xue jiuyang-shengong leiming-bian literate liuhe-bian longxing-jian longzhua-gong luohan-fumogong '
    + 'luohan-gun luohan-jian luohan-quan martial-cognize medical nianhua-zhi parry pixie-jian pona-gong pudu-zhang '
    + 'qianye-shou qingliang-jian qingyun-bian qinna-shibada qixing-gun qufannao-zhi qujing-gunfa ranmu-daofa '
    + 'riyue-bian rulai-zhang ruying-suixingtui sanhua-zhang sanscrit shaolin-jiuyang shaolin-shenfa shaolin-tantui '
    + 'shaolin-xinfa shaolin-yishu shenfeng-bian shenzhang-bada staff strike sword tianzhu-fuzhi unarmed '
    + 'weituo-chu weituo-gun whip woshi-zhang wuchang-zhang wudang-jiuyang wuxiang-zhi xiuluo-dao xiuluo-zhi '
    + 'xumishan-zhang yecha-gun yijinjing yingzhua-gong yintuoluo-zhua yipai-liangsan yiwei-dujiang '
    + 'yizhi-chan zui-gun zuiquan-sanda').split(' ');
export const shaolinTeachersSources = [...common, ...names.map(n => `kungfu/class/shaolin/${n}.c`),
    ...skills.map(s => `kungfu/skill/${s}.c`)];
const reviewed = '415daa77974a02f1d1314c8a6f5e27449816c03a3e58d385af7aa4715eb79c69';
const knowledge = new Set(['buddhism', 'literate', 'medical', 'jingluo-xue', 'sanscrit', 'shaolin-yishu']);
const special = new Set(['wuming', 'kong-jian', 'jue-yuan']);
const held = { 'yecha-gun': 'club', 'qujing-gunfa': 'club', 'ranmu-daofa': 'blade',
    'dacheng-fosuo': 'whip', 'leiming-bian': 'whip', 'qingyun-bian': 'whip',
    'riyue-bian': 'whip', 'shenfeng-bian': 'whip' };
const permission = 'can_learn/jiuyang-shengong/shaolin';
const short = t => t.path.split('/').at(-1).slice(0, -2);
const assignments = t => [...new Map(t.skill_assignments.filter(s => !s.receiver && s.function === 'create')
    .map(s => [s.id, s])).values()];
const declaration = (t, skill) => assignments(t).find(s => s.id === skill);
const noTeach = (t, skill) => ['du-e', 'du-jie', 'du-nan'].includes(short(t)) && skill === 'shaolin-jiuyang';
const allowed = (t, skill) => !noTeach(t, skill) && (short(t) === 'wuming'
    ? ['strike', 'unarmed', 'rulai-zhang', 'ruying-suixingtui'].includes(skill)
    : short(t) === 'kong-jian' ? skill === 'jingang-buhuaiti'
        : short(t) === 'jue-yuan' ? skill === 'shaolin-jiuyang' : true);

export function shaolinTeachersConditions(relations, catalog, readSource) {
    const teachers = relations.objects.filter(t => t.group === 'shaolin' && !t.path.includes('/cheng-'));
    if (teachers.every(t => t.learning_permissions === undefined)) return [];
    assert.deepEqual(teachers.map(short).sort(), [...names].sort(), '少林剩余教师范围变化，须重新核对');
    const paths = [...new Set([...common, ...teachers.map(t => t.path),
        ...teachers.flatMap(t => t.skill_assignments.map(s => s.skill_source.path))])].sort();
    const versions = paths.map(path => [path, sha256(readSource(path))]);
    assert.equal(sha256(JSON.stringify(versions)), reviewed, '少林剩余教师源码变化，须重新核对');
    const evidence = versions.map(([path, sha256]) => ({ path, sha256 }));
    const result = [], named = name => teachers.find(t => short(t) === name);
    function add(teacher, skill, level, variant, extra = {}) {
        const assignment = declaration(teacher, skill), source = catalog.skills.find(s => s.id === skill);
        assert.ok(assignment && source); assert.equal(assignment.level.kind, 'integer');
        const naming = teacher.names.find(n => n.function === 'create'), name = short(teacher);
        const npc = /^\(\{\s*"([^"]+)"/.exec(naming.args[1].raw)?.[1];
        assert.ok(npc);
        const line = readSource(teacher.path).split('\n').findIndex(s => /^void create\(/.test(s)) + 1;
        assert.ok(line > 0);
        const entry = { id: `${teacher.path}:${line}:create`, path: teacher.path,
            sha256: teacher.sha256, function: 'create', line, role: 'teaching' };
        const actor = { skills: { force: 400, unarmed: 400, cuff: 400, sword: 400, blade: 400,
            club: 400, staff: 400, whip: 400, claw: 400, strike: 400, finger: 400, hand: 400,
            dodge: 400, parry: 400, buddhism: 400, literate: 400, medical: 400,
            'hunyuan-yiqi': 400, 'shaolin-xinfa': 400, 'ruying-suixingtui': 400,
            'sanhua-zhang': 80, 'fumo-jian': 80, [skill]: level, ...extra.skills }, mappings: {},
            properties: { 'family/family_name': '少林派',
                'family/master_id': special.has(name) ? 'other master' : npc,
                'family/master_name': special.has(name) ? '别位师父' : naming.values[0],
                gender: skill === 'pixie-jian' ? '无性' : '男性', class: 'bonze',
                shen: skill === 'qingyun-bian' ? Math.max(100000, 11100 + (level - 100) * 1000) : 100000,
                str: 36, con: 40, dex: 36, int: 36,
                character: skill === 'pixie-jian' ? '心狠手辣' : '光明磊落', combat_exp: 100000000,
                max_neili: 6000, neili: 6000, jing: 10000, eff_jing: 10000,
                potential: 10000, learned_points: 0, gongxian: 0, ...extra.properties } };
        if (skill !== 'force') actor.mappings.force = 'hunyuan-yiqi';
        if (held[skill] && !extra.noWeapon) actor.equipment = { type: held[skill], hold: false };
        let recognition = 1;
        if (name === 'wuming' && (actor.properties['family/family_name'] !== '少林派'
            || actor.properties.shen < 50000 || !allowed(teacher, skill)
            || ['strike', 'unarmed'].includes(skill) && level >= 180)) recognition = -1;
        if (name === 'kong-jian') recognition = actor.properties['family/family_name'] !== '少林派'
            || skill !== 'jingang-buhuaiti' ? 0 : actor.skills.buddhism < 250 ? -1 : 1;
        if (name === 'jue-yuan' && (!extra.acquire || extra.noKunlun || skill !== 'shaolin-jiuyang')) recognition = -1;
        const apprentice = actor.properties['family/master_id'] === npc
            && actor.properties['family/master_name'] === naming.values[0];
        if (!special.has(name) && !apprentice) recognition = 0;
        const cap = apprentice && !knowledge.has(skill) && level >= 200;
        const blocked = recognition !== 1 || noTeach(teacher, skill) || cap
            || level >= assignment.level.value || skill === 'martial-cognize';
        const completed = extra.completed ?? (blocked ? 0 : extra.times ?? 1);
        const accepted = extra.accepted ?? (recognition !== 1 ? Number(recognition === -1)
            : noTeach(teacher, skill) || cap ? 1 : blocked ? 0 : 1);
        const cost = Math.trunc((100 + level * 2) / actor.properties.int);
        const rand = Math.trunc((actor.properties.int + Math.trunc((actor.skills.literate ?? 0) / 10)
            + Math.trunc(level / 5)) / 2);
        const progress = amount => 1 + Math.trunc(amount * 100 / (level + 100));
        const flags = { wuming: Number(name === 'wuming' && recognition === 1),
            kongjian: Number(name === 'kong-jian' && recognition === 1) };
        const expected = { command_kind: 'learn', command_accepted: accepted, contribution_spent: 0,
            jing_spent: extra.clearJing ? actor.properties.jing : cost * completed,
            learned_points_spent: completed, skills_after: {}, learning_progress: completed
                ? { [skill]: [progress(4) * completed, progress(4 + rand - 1) * completed] } : {},
            may_improve_skills: completed > 0, shaolin_flags: flags,
            ...(extra.acquire ? { grant: permission, value: extra.noKunlun ? 0 : 1 } : {}) };
        const steps = [];
        if (extra.acquire) {
            assert.equal(name, 'jue-yuan');
            if (!extra.noKunlun) actor.properties['can_learn/jiuyang-shengong/kunlun'] = 1;
            const offer = { path: '/d/items/book/lengjia_jing', id: 'lengjia jing', consumed: true };
            steps.push({ command_kind: 'give', action: `give lengjia jing to ${npc}`, offer,
                grant: permission, value: extra.noKunlun ? 0 : 1, contribution_spent: 0,
                learned_points_spent: 0, may_improve_skills: !extra.noKunlun,
                skills_after: extra.noKunlun ? {} : { 'martial-cognize': 1 },
                learned_after: extra.noKunlun ? {} : { 'martial-cognize': 0 },
                shaolin_flags: { wuming: 0, kongjian: 0 } });
            if (extra.repeatOffer) steps.push({ ...steps[0], may_improve_skills: false });
        }
        steps.push(expected);
        if (extra.repeatLearn) steps.push({ ...expected });
        const qualification = evidence.filter(e => common.includes(e.path) || e.path === teacher.path
            || Object.keys(actor.skills).some(s => e.path === `kungfu/skill/${s}.c`));
        result.push({ id: `teaching-shaolin-teachers-${name}-${skill}-${variant}`,
            stage: 'school', method: 'teaching', entry_id: entry.id, samples: extra.samples ?? 2,
            status: 'configured_not_executed', parameters: {
                teacher: { path: '/' + teacher.path.slice(0, -2), id: npc, sha256: teacher.sha256 },
                topic: `${source.dictionary_name?.name ?? skill}普通学习`, skill, level,
                teacher_level: assignment.level.value, teaching_profile: 'shaolin-teachers',
                teaching_kind: 'ordinary_learning', action: `learn ${npc} ${skill} ${extra.times ?? 1}`,
                actor, target: { skills: {}, mappings: {}, properties: {} },
                teaching_entry: entry, teaching_evidence: assignment.evidence,
                qualification_sources: qualification.map(e => e.path), qualification_evidence: qualification,
                fighting: false, observe_seconds: 0, not_applicable: '',
                monitored_grants: extra.acquire ? [permission] : [], unchanged_properties: ['combat_exp'],
                known_issue: null, teaching_expectations: steps,
                expected: extra.acquire && !extra.noKunlun || completed ? 'observed' : 'refused', variant,
                note: '剩余45个少林NPC、722条最终技能关系；普通师承及前置技能为实验赋值，不证明拜师养成。无名、空见、觉远不伪设为师父；经原recognize检查。觉远交书仅预设昆仑许可，少林许可与修养奖励由原give取得；许可不等于学会。未改原NPC、learn、资格或随机。',
            } });
    }
    for (const teacher of teachers) {
        for (const { id, level } of assignments(teacher)) {
            const cap = short(teacher) === 'wuming' && ['strike', 'unarmed'].includes(id) ? 180
                : special.has(short(teacher)) || knowledge.has(id) ? level.value : Math.min(200, level.value);
            const extra = short(teacher) === 'jue-yuan' && id === 'shaolin-jiuyang' ? { acquire: true } : {};
            add(teacher, id, 10, 'level10', extra);
            add(teacher, id, cap - 1, 'below-cap', extra);
            add(teacher, id, cap, 'at-cap', extra);
        }
        if (!special.has(short(teacher))) for (const [variant, properties] of [
            ['other-master', { 'family/master_id': 'other master' }],
            ['other-name', { 'family/master_name': '别位师父' }],
        ]) add(teacher, 'force', 10, variant, { properties });
    }
    for (const skill of skills) {
        if (skill === 'martial-cognize') continue;
        const teacher = teachers.filter(t => declaration(t, skill) && allowed(t, skill))
            .sort((a, b) => declaration(b, skill).level.value - declaration(a, skill).level.value
                || a.path.localeCompare(b.path))[0];
        if (!teacher) continue; // Known by Jueyuan but expressly not taught.
        add(teacher, skill, Math.min(100, declaration(teacher, skill).level.value - 1), 'distribution',
            { samples: 100, acquire: short(teacher) === 'jue-yuan' });
    }
    const check = (teacher, skill, variant, extra = {}) => add(named(teacher), skill, extra.level ?? 100, variant, extra);
    for (const teacher of ['wuming', 'kong-jian']) {
        const skill = teacher === 'wuming' ? 'rulai-zhang' : 'jingang-buhuaiti';
        check(teacher, skill, 'other-family', { properties: { 'family/family_name': '武当派' } });
        // Recognition occurs before potential checking. Zero potential lets us
        // observe its repeat branch without bypassing learn's one-second gate.
        check(teacher, skill, 'recognize-repeat', { repeatLearn: true,
            properties: { potential: 0 }, completed: 0, accepted: 0 });
    }
    for (const shen of [49999, 50000]) check('wuming', 'rulai-zhang', 'shen' + shen, { properties: { shen } });
    for (const buddhism of [249, 250]) check('kong-jian', 'jingang-buhuaiti', 'buddhism' + buddhism,
        { skills: { buddhism } });
    check('jue-yuan', 'shaolin-jiuyang', 'no-permit');
    check('jue-yuan', 'shaolin-jiuyang', 'no-kunlun', { acquire: true, noKunlun: true });
    check('jue-yuan', 'shaolin-jiuyang', 'offer-repeat', { acquire: true, repeatOffer: true });
    check('jue-yuan', 'force', 'permit-not-this-skill', { acquire: true });
    for (const [skill, teacher] of Object.keys(held).map(s => [s, teachers.find(t => declaration(t, s) && allowed(t, s))]))
        check(short(teacher), skill, 'no-weapon', { level: 10, noWeapon: true, completed: 0, accepted: 0 });
    return result;
}
