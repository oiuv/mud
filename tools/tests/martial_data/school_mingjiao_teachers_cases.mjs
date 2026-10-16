// Original ordinary learn only. Assigned family / reborn state is an experiment,
// not evidence of recruitment, reincarnation, book acquisition or old ask recovery.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution } from './statistics.mjs';
import { mingjiaoApprenticeLearningSourcePaths } from './school_mingjiao_apprentice_learning_cases.mjs';

const copy = v => structuredClone(v), hash = v => createHash('sha256').update(v).digest('hex');
const group = 'mingjiao-teachers', prefix = 'school-mingjiao-teachers-';
export const mingjiaoTeachersProfile = group;
const table = [
    ['daijisi', 'dai jisi', '黛绮丝', 36, 12, { force: 320, dodge: 300, parry: 300, throwing: 320, staff: 320, cuff: 320,
        'pili-quan': 320, 'duoming-jinhua': 320, 'yinhu-zhang': 320, 'shenghuo-xinfa': 320, 'shenghuo-bu': 300,
        literate: 260, 'martial-cognize': 240 }],
    ['fanyao', 'fan yao', '范遥', 0, 12, { force: 340, 'shenghuo-xinfa': 340, 'shenghuo-shengong': 340, dodge: 340,
        'lingxu-bu': 340, finger: 340, strike: 340, hand: 340, claw: 340, parry: 340, sword: 340, 'xiaoyao-jian': 340,
        'nianhua-zhi': 340, 'sanhua-zhang': 340, 'fengyun-shou': 340, 'longzhua-gong': 340, buddhism: 340, literate: 340 }],
    ['lengqian', 'leng qian', '冷谦', 37, 12, { force: 140, 'shenghuo-xinfa': 140, dodge: 120, 'shenghuo-bu': 120,
        cuff: 140, 'pili-quan': 140, parry: 140, strike: 140, sword: 140, literate: 120, 'martial-cognize': 100 }],
    ['weiyixiao', 'wei yixiao', '韦一笑', 36, 12, { force: 220, dodge: 240, strike: 240, sword: 220, claw: 220,
        'sougu-yingzhua': 220, parry: 220, 'shenghuo-xinfa': 220, 'qingfu-shenfa': 240, 'shenghuo-bu': 240,
        'hanbing-mianzhang': 240, literate: 200, 'martial-cognize': 180 }],
    ['xiaozhao', 'xiao zhao', '小昭', null, 14, { force: 80, dodge: 80, unarmed: 80, sword: 80,
        'taiji-jian': 70, 'taiji-quan': 70, tiyunzong: 50 }],
    ['xiexun', 'xie xun', '谢逊', 36, 12, { force: 280, dodge: 260, parry: 260, hand: 280, cuff: 280,
        'shenghuo-xinfa': 280, 'shenghuo-bu': 260, 'pili-shou': 280, 'pili-quan': 280,
        'qishang-quan': 280, literate: 240, 'martial-cognize': 220 }],
    ['yangxiao', 'yang xiao', '杨逍', 36, 13, { force: 320, dodge: 340, strike: 340, sword: 320, parry: 320,
        cuff: 320, unarmed: 320, 'pili-quan': 320, 'shenghuo-xinfa': 320, 'shenghuo-bu': 340,
        'pomopima-jian': 340, 'xiaoyao-jian': 340, literate: 300, 'martial-cognize': 280 }],
    ['yintianzheng', 'yin tianzheng', '殷天正', 36, 12, { force: 280, dodge: 260, parry: 260, strike: 280,
        cuff: 280, 'pili-quan': 280, finger: 280, 'shenghuo-xinfa': 280, 'shenghuo-bu': 260,
        'yinfeng-dao': 280, 'tougu-zhen': 280, literate: 240, 'martial-cognize': 220 }],
    ['zhangwuji', 'zhang wuji', '张无忌', 36, 12, { force: 360, unarmed: 340, dodge: 340, parry: 340,
        cuff: 340, sword: 340, 'jiuyang-shengong': 360, 'shenghuo-shengong': 360, 'shenghuo-xinfa': 360,
        'qiankun-danuoyi': 360, 'shenghuo-bu': 340, 'qishang-quan': 340, 'taiji-quan': 340,
        'taiji-jian': 340, 'shenghuo-ling': 340 }],
];
const noTeach = { 'jiuyang-shengong': '这个我可不能传你。', 'taiji-jian': '你还是找我太师父吧！',
    'taiji-quan': '你还是找我太师父吧！', 'qishang-quan': '想学七伤拳你还是找我义父谢逊吧！' };
export const mingjiaoTeachers = table.map(([key, id, name, generation, line, levels]) => ({
    key, id, name, generation, line, path: '/kungfu/class/mingjiao/' + key, levels,
    family: generation === null ? null : '明教', no_teach: key === 'zhangwuji' ? noTeach : {},
    recruitable: !['fanyao', 'xiaozhao'].includes(key),
}));
const teachers = new Map(mingjiaoTeachers.map(t => [t.key, t]));
const teacherMaps = {
    daijisi: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', throwing: 'duoming-jinhua', cuff: 'pili-quan', staff: 'yinhu-zhang' },
    fanyao: { dodge: 'lingxu-bu', finger: 'nianhua-zhi', strike: 'sanhua-zhang', hand: 'fengyun-shou',
        claw: 'longzhua-gong', parry: 'nianhua-zhi', sword: 'xiaoyao-jian' },
    lengqian: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', cuff: 'pili-quan', parry: 'pili-quan' },
    weiyixiao: { force: 'shenghuo-xinfa', dodge: 'qingfu-shenfa', strike: 'hanbing-mianzhang', parry: 'hanbing-mianzhang', claw: 'sougu-yingzhua' },
    xiaozhao: { dodge: 'tiyunzong', parry: 'taiji-jian', sword: 'taiji-jian', unarmed: 'taiji-quan' },
    xiexun: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', hand: 'pili-shou', parry: 'qishang-quan', cuff: 'qishang-quan' },
    yangxiao: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', cuff: 'pili-quan', parry: 'xiaoyao-jian', sword: 'xiaoyao-jian' },
    yintianzheng: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', parry: 'yinfeng-dao', finger: 'tougu-zhen', cuff: 'pili-quan', strike: 'yinfeng-dao' },
    zhangwuji: { force: 'shenghuo-shengong', dodge: 'qiankun-danuoyi', unarmed: 'jiuyang-shengong', cuff: 'qishang-quan',
        sword: 'shenghuo-ling', parry: 'qiankun-danuoyi' },
};
const teacherPreps = { daijisi: { cuff: 'pili-quan' }, fanyao: {}, lengqian: { cuff: 'pili-quan' },
    weiyixiao: { strike: 'hanbing-mianzhang' }, xiaozhao: {}, xiexun: { cuff: 'qishang-quan' },
    yangxiao: { cuff: 'pili-quan' }, yintianzheng: { strike: 'yinfeng-dao', finger: 'tougu-zhen' }, zhangwuji: { cuff: 'qishang-quan' } };
const basic = ['force', 'dodge', 'parry', 'sword', 'cuff', 'staff', 'throwing', 'strike', 'claw', 'hand', 'finger', 'unarmed'];
const allSkills = [...new Set(table.flatMap(t => Object.keys(t[5])))];
const knowledge = new Set(['literate', 'buddhism']);
const flags = ['env/no_learn', 'env/auto_regenerate', 'special_skill/wuxing', 'tattoo/tattoo_str', 'reborn/str',
    'tattoo/tattoo_int', 'reborn/int', 'tattoo/tattoo_dex', 'reborn/dex'];
const sword = { type: 'sword', program: '/clone/weapon/gangjian' };
const dagger = { type: 'dagger', program: '/clone/weapon/dagger' };
const staff = { type: 'staff', program: '/d/items/staff/muzhang' };
export const mingjiaoTeachersSourcePaths = [...new Set([
    ...mingjiaoApprenticeLearningSourcePaths,
    ...mingjiaoTeachers.map(t => t.path.slice(1) + '.c'), ...allSkills.map(s => 'kungfu/skill/' + s + '.c'),
    'kungfu/skill/huashan-xinfa.c', 'inherit/skill/shaolin.c', 'feature/unique.c', 'feature/guarder.c',
    'clone/weapon/dagger.c', 'inherit/weapon/dagger.c', 'inherit/weapon/staff.c',
    'd/items/staff.lpc', 'd/items/staff_data.h',
    'clone/misc/cloth.c', 'inherit/char/char.c', 'feature/condition.c', 'kungfu/condition/qiankun-except.c',
])];
export const mingjiaoTeachersAbsentPaths = [];
export const mingjiaoTeachersReviewedSourceHash = 'b50d0201fc4fb2fcd0572b436c61c31e62d43ac5872be607b9d2961b7ac3586d';
const sourceHash = e => hash(JSON.stringify(mingjiaoTeachersSourcePaths.map(p => [p, e[p]])));
const family = t => ({ family_name: '明教', generation: (t.generation ?? 36) + 1,
    master_id: t.id, master_name: t.name });
const peer = () => ({ family_name: '明教', generation: 37, master_id: 'other master', master_name: '别位师父' });
function actor(t, skill, level = 10, reborn = false) {
    const a = { skills: Object.fromEntries(basic.map(s => [s, 600])), mappings: {}, preparations: {},
        properties: { name: '试侠', class: '', title: '普通百姓', gender: '男性', character: '光明磊落',
            str: 36, int: 40, con: 36, dex: 36, shen: 100000, combat_exp: 100000000,
            qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
            neili: 12000, max_neili: 12000, jingli: 1000, max_jingli: 1000,
            potential: 10000, learned_points: 0, gongxian: 4321, weiwang: 123, jiali: 0, guilty: 0,
            family: t.recruitable ? family(t) : peer(), 'reborn/family_name': reborn ? '明教' : 0,
            'betrayer/times': 0, 'detach/明教': 0, 'betrayer/明教': 0,
            ...Object.fromEntries(flags.map(k => [k, 0])) } };
    a.skills[skill] = level;
    if (skill === 'yinhu-zhang') a.equipment = copy(staff);
    if (skill === 'qiankun-danuoyi') a.skills.force = 900;
    return a;
}
const pairAllowed = (t, s, reborn) => (t.recruitable || t.key === 'fanyao' && reborn)
    && s !== 'martial-cognize' && !Object.hasOwn(t.no_teach, s);
const qualifiedTeacher = s => mingjiaoTeachers.find(t => t.recruitable && Object.hasOwn(t.levels, s)
    && !Object.hasOwn(t.no_teach, s)) ?? teachers.get('fanyao');

// Ordered guards mirror each original valid_learn. Raw and effective force are distinct.
const guards = [
    ['pili-quan', ['weapon', 'effective-force20', 'max100', 'cuff20', 'relative-cuff']],
    ['duoming-jinhua', ['max500', 'effective-force80', 'relative-throwing']],
    ['yinhu-zhang', ['staff-required', 'max200', 'force140', 'staff60', 'relative-staff']],
    ['sougu-yingzhua', ['weapon', 'effective-force50', 'max250', 'relative-claw']],
    ['hanbing-mianzhang', ['weapon', 'effective-force120', 'max800', 'strike80', 'relative-strike']],
    ['pili-shou', ['weapon', 'effective-force120', 'max900', 'hand80', 'relative-hand']],
    ['qishang-quan', ['weapon', 'force120', 'max1800', 'cuff120', 'relative-cuff']],
    ['yinfeng-dao', ['weapon', 'effective-force200', 'max1400', 'strike100', 'relative-strike']],
    ['tougu-zhen', ['weapon', 'effective-force200', 'max1400', 'finger100', 'relative-finger']],
    ['pomopima-jian', ['max100', 'effective-force20', 'relative-sword']],
    ['xiaoyao-jian', ['int30', 'max2500', 'force120', 'dodge120', 'sword120', 'relative-sword']],
    ['qingfu-shenfa', ['dex26', 'dodge100']], ['shenghuo-xinfa', ['sexless-god101', 'force10']],
    ['shenghuo-shengong', ['sexless50', 'int32', 'force180']],
    ['qiankun-danuoyi', ['sexless50', 'qiankun-except', 'int30', 'max5000', 'effective-force450', 'relative-parry', 'relative-force']],
    ['nianhua-zhi', ['weapon', 'effective-force60', 'max300', 'relative-finger']],
    ['sanhua-zhang', ['weapon', 'force60', 'max300', 'relative-strike']],
    ['fengyun-shou', ['weapon', 'effective-force40', 'max200', 'relative-hand']],
    ['longzhua-gong', ['weapon', 'effective-force50', 'max250', 'relative-claw']], ['buddhism', ['guilty']],
];
function guardActor(t, s, tag) {
    const a = actor(t, s, 10, t.key === 'fanyao');
    if (tag === 'weapon' || tag === 'staff-required') a.equipment = copy(sword);
    else if (tag.startsWith('max')) { a.properties.max_neili = +tag.slice(3) - 1; a.properties.neili = a.properties.max_neili; }
    else if (tag.startsWith('effective-force')) a.skills.force = +tag.slice(15) * 2 - 1;
    else if (/^(force|cuff|staff|strike|finger|hand|dodge|sword)\d+$/.test(tag)) {
        const [, id, threshold] = /^(\D+)(\d+)$/.exec(tag); a.skills[id] = +threshold - 1;
    } else if (tag.startsWith('relative-')) {
        const id = tag.slice(9); a.skills[s] = 190; a.skills[id] = 189;
        if (s === 'qiankun-danuoyi') a.skills.force = 900; // effective-force gate precedes parry
        if (s === 'qiankun-danuoyi' && id === 'force') {
            a.skills.force = 189; a.skills['shenghuo-shengong'] = 400; a.mappings.force = 'shenghuo-shengong';
        }
    } else if (/^(int|dex)\d+$/.test(tag)) {
        const [, key, threshold] = /^(\D+)(\d+)$/.exec(tag); a.properties[key] = +threshold - 1;
    } else if (tag === 'sexless-god101') { a.properties.gender = '无性'; a.skills['shenghuo-shengong'] = 101; }
    else if (tag === 'sexless50') { a.properties.gender = '无性'; a.skills[s] = 50; }
    else if (tag === 'guilty') a.properties.guilty = 1;
    else if (tag === 'qiankun-except') a.conditions = { 'qiankun-except': 10 };
    else assert.fail(tag);
    if (s === 'qiankun-danuoyi' && tag !== 'effective-force450' && tag !== 'relative-force') a.skills.force = 900;
    return a;
}

function plans() {
    const out = [], positive = [];
    function add(t, s, variant, a, expected = 'observed', extra = {}) {
        const random = expected === 'observed';
        out.push({ id: prefix + t.key + '-' + s + '-' + variant, stage: 'school', method: 'teaching', parameters: {
            school: 'mingjiao', family: '明教', collection_group: group, teaching_profile: group,
            teaching_kind: 'ordinary-learning', variant, skill: s, level: a.skills[s] ?? 0,
            actor: a, target: { skills: {}, mappings: {}, preparations: {}, properties: {
                qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000, max_jing: 10000,
                neili: 12000, max_neili: 12000, str: 36, int: 40, dex: 36, con: 36 } },
            teacher: { key: t.key, id: t.id, name: t.name, path: t.path, generation: t.generation },
            teacher_properties: extra.teacher_properties ?? {}, room_properties: extra.room_properties ?? {},
            teaching_expectations: [{ command_kind: 'learn', teacher_key: t.key, skill: s, times: 1,
                action: `learn ${t.id} ${s} 1` }], action: `learn ${t.id} ${s} 1`, monitored_grants: [],
            qualification_sources: mingjiaoTeachersSourcePaths, named_participants: true,
            fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
            expected, random_observation: random, refusal_kind: extra.refusal_kind ?? null,
            experimental_identity: a.properties.family?.master_id === t.id && a.properties.family?.master_name === t.name
                ? 'assigned-master-family' : a.properties['reborn/family_name'] === t.family && t.family !== null
                    ? 'assigned-reborn-family' : 'peer-family',
            qualification_note: '原非巫师USER普通learn；师承/转世、前置修为、装备与资源是实验配置，不代表自然拜师或转世养成。'
                + '七位教师逐技能和范遥原转世认师例外分列；小昭不伪写师父身份。既有张无忌圣火令教学、旧ask统计/证据恢复不计新增。'
                + '只观察一次learn及同步状态，不代表秘籍取得、研究、练习、自然NPC战斗或完整养成。',
        } });
        return out.at(-1);
    }
    for (const t of mingjiaoTeachers) for (const s of Object.keys(t.levels)) {
        if (t.key === 'zhangwuji' && s === 'shenghuo-ling') continue;
        const ok = pairAllowed(t, s, false);
        add(t, s, 'base', actor(t, s), ok ? 'observed' : 'refused', { refusal_kind: ok ? null :
            !t.recruitable ? 'not-apprentice' : Object.hasOwn(t.no_teach, s) ? 'no-teach' : 'skill-qualification' });
        if (ok) positive.push([t, s, false]);
    }
    const fan = teachers.get('fanyao');
    for (const s of Object.keys(fan.levels)) { add(fan, s, 'reborn', actor(fan, s, 10, true)); positive.push([fan, s, true]); }
    for (const [t, s, reborn] of positive) add(t, s, reborn ? 'reborn-cap' : 'cap', actor(t, s,
        Math.min(t.levels[s], knowledge.has(s) ? 999 : 200), reborn), 'refused', {
        refusal_kind: !knowledge.has(s) && t.levels[s] >= 200 ? 'martial-cap' : 'teacher-cap' });
    for (const [key, s, level] of [['lengqian', 'shenghuo-bu', 119], ['lengqian', 'shenghuo-xinfa', 139],
        ['lengqian', 'literate', 119], ['xiexun', 'qishang-quan', 199], ['fanyao', 'literate', 339], ['fanyao', 'buddhism', 339]]) {
        const t = teachers.get(key); add(t, s, 'cap-minus-one', actor(t, s, level, key === 'fanyao'));
    }
    for (const [s, tags] of guards) {
        const t = qualifiedTeacher(s);
        for (const tag of tags) add(t, s, 'guard-' + tag, guardActor(t, s, tag), 'refused', { refusal_kind: 'skill-qualification' });
        if (tags.includes('weapon')) { const a = guardActor(t, s, 'weapon'); a.secondary_equipment = copy(dagger);
            add(t, s, 'guard-dual-wielded', a, 'refused', { refusal_kind: 'skill-qualification' }); }
    }
    { const t = teachers.get('daijisi'), a = actor(t, 'yinhu-zhang'); delete a.equipment;
        add(t, 'yinhu-zhang', 'guard-no-staff', a, 'refused', { refusal_kind: 'skill-qualification' }); }
    for (const [s, lv, god] of [['shenghuo-xinfa', 10, 100], ['shenghuo-shengong', 49, 0], ['qiankun-danuoyi', 49, 0]]) {
        const t = qualifiedTeacher(s), a = actor(t, s, lv, t.key === 'fanyao'); a.properties.gender = '无性';
        if (god) a.skills['shenghuo-shengong'] = god;
        if (s === 'qiankun-danuoyi') a.skills.force = 900;
        add(t, s, 'sexless-positive', a);
    }
    for (const [s, existing, expected] of [['shenghuo-xinfa', 'shenghuo-shengong', 'observed'],
        ['shenghuo-xinfa', 'jiuyang-shengong', 'observed'], ['shenghuo-shengong', 'jiuyang-shengong', 'observed'],
        ['shenghuo-xinfa', 'huashan-xinfa', 'refused'], ['shenghuo-shengong', 'huashan-xinfa', 'refused']]) {
        const t = qualifiedTeacher(s), a = actor(t, s, 10, t.key === 'fanyao'); a.skills[existing] = 1;
        add(t, s, 'existing-' + existing, a, expected, { refusal_kind: expected === 'refused' ? 'incompatible-force' : null });
    }
    for (const t of mingjiaoTeachers.filter(t => t.recruitable)) {
        const a = actor(t, 'force'); a.properties.family = peer();
        add(t, 'force', 'other-master', a, 'refused', { refusal_kind: 'not-apprentice' });
    }
    for (const t of mingjiaoTeachers.filter(t => t.key !== 'xiaozhao')) {
        const a = actor(t, 'buddhism', 10, t.key === 'fanyao');
        const s = t.key === 'fanyao' ? 'pili-quan' : 'buddhism'; a.skills[s] = 10;
        add(t, s, 'unknown-to-teacher', a, 'refused', { refusal_kind: 'missing-teacher-skill' });
    }
    const leng = teachers.get('lengqian');
    for (const tag of ['busy', 'fighting', 'pigging', 'no-learn', 'teacher-no-teach', 'exp-low', 'jing-low']) {
        const a = actor(leng, 'shenghuo-xinfa'), extra = { refusal_kind: tag };
        if (tag === 'busy') a.busy = 1;
        if (tag === 'fighting') extra.fighting = true;
        if (tag === 'pigging') extra.room_properties = { pigging: 1 };
        if (tag === 'no-learn') a.properties['env/no_learn'] = 'shenghuo-xinfa';
        if (tag === 'teacher-no-teach') extra.teacher_properties = { 'env/no_teach': 1 };
        if (tag === 'exp-low') a.properties.combat_exp = 0;
        if (tag === 'jing-low') a.properties.jing = 2;
        add(leng, 'shenghuo-xinfa', tag, a, 'refused', extra);
    }
    for (const int of [29, 30]) { const t = teachers.get('zhangwuji'), a = actor(t, 'qiankun-danuoyi');
        a.properties.family = { ...peer(), family_name: '武当派' }; a.properties['reborn/family_name'] = '明教';
        a.skills.force = 900; a.properties.int = int;
        add(t, 'qiankun-danuoyi', 'outsider-int' + int, a, int === 30 ? 'observed' : 'refused', { refusal_kind:
            int === 29 ? 'skill-qualification' : null });
    }
    assert.equal(out.length, 363, JSON.stringify({ positives: positive.length, variants: Object.fromEntries(
        [...new Set(out.map(c => c.parameters.variant))].map(k => [k, out.filter(c => c.parameters.variant === k).length])) }));
    assert.equal(out.filter(c => c.parameters.random_observation).length, 111);
    return out;
}

export function mingjiaoTeachersConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean');
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const evidence = Object.fromEntries(mingjiaoTeachersSourcePaths.map(p => [p, hash(readSource(p))]));
    assert.equal(sourceHash(evidence), mingjiaoTeachersReviewedSourceHash, 'sources changed; re-review required');
    for (const t of mingjiaoTeachers) {
        const source = readSource(t.path.slice(1) + '.c').toString();
        const levels = Object.fromEntries([...source.matchAll(/\bset_skill\("([^"\n]+)",\s*(\d+)\)/g)].map(m => [m[1], +m[2]]));
        assert.deepEqual(levels, t.levels, 'actual NPC assignments differ: ' + t.key);
        assert.ok(source.includes(`set_name("${t.name}",`) && source.includes(`"${t.id}"`));
    }
    return plans().map(c => {
        const p = c.parameters, t = teachers.get(p.teacher.key), path = t.path.slice(1) + '.c';
        for (const s of Object.keys(p.actor.skills)) {
            const item = catalog.skills.find(v => v.id === s); assert.ok(item, s);
            assert.equal(item.sha256, evidence['kungfu/skill/' + s + '.c']);
        }
        const entry = { id: `${path}:${t.line}:create`, path, line: t.line, function: 'create',
            role: 'teaching', sha256: evidence[path] };
        return { ...c, entry_id: entry.id, samples: smoke || !p.random_observation ? 2 : samples,
            status: 'prepared_not_sampled', parameters: { ...p, teacher: { ...p.teacher, sha256: evidence[path] },
                teacher_levels: copy(t.levels), teaching_entry: entry, source_evidence: copy(evidence),
                qualification_evidence: mingjiaoTeachersSourcePaths.map(path => ({ path, sha256: evidence[path] })),
                reviewed_source_hash: mingjiaoTeachersReviewedSourceHash, absent_sources: [] } };
    });
}

// Validator and report are source-backed observations; pure fixtures are not evidence.
const map = v => { assert.ok(v && typeof v === 'object' && !Array.isArray(v), 'mapping required'); return v; };
const own = (v, k) => { assert.ok(Object.hasOwn(map(v), k), 'missing observation ' + k); return v[k]; };
const num = v => { if (v === null) return 0; assert.ok(Number.isSafeInteger(v), 'integer required'); return v; };
const equal = (v, expected) => expected === 0 ? assert.equal(num(v), 0) : assert.deepEqual(v, expected);
const plain = v => { assert.equal(typeof v, 'string'); return v.replace(/\x1b\[(?:[0-9;]*m|256D|K)/g, ''); };
let planIndex;
function parameters(c) {
    planIndex ??= new Map(plans().map(v => [v.id, v]));
    const expected = planIndex.get(c.id); assert.ok(expected, 'unknown condition');
    assert.equal(c.stage, 'school'); assert.equal(c.method, 'teaching');
    assert.ok(Number.isSafeInteger(c.samples) && c.samples > 0);
    if (!expected.parameters.random_observation) assert.equal(c.samples, 2);
    const { source_evidence: e, qualification_evidence, reviewed_source_hash, absent_sources,
        teacher_levels, teaching_entry, teacher, ...actual } = map(c.parameters);
    const { teacher: plannedTeacher, ...rest } = expected.parameters;
    assert.deepEqual(actual, rest); assert.deepEqual(Object.keys(map(e)), mingjiaoTeachersSourcePaths);
    for (const h of Object.values(e)) assert.match(h, /^[a-f0-9]{64}$/);
    assert.equal(sourceHash(e), mingjiaoTeachersReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoTeachersReviewedSourceHash); assert.deepEqual(absent_sources, []);
    assert.deepEqual(qualification_evidence, mingjiaoTeachersSourcePaths.map(path => ({ path, sha256: e[path] })));
    const t = teachers.get(teacher.key), path = t.path.slice(1) + '.c';
    assert.deepEqual(teacher, { ...plannedTeacher, sha256: e[path] }); assert.deepEqual(teacher_levels, t.levels);
    assert.deepEqual(teaching_entry, { id: `${path}:${t.line}:create`, path, line: t.line,
        function: 'create', role: 'teaching', sha256: e[path] }); assert.equal(c.entry_id, teaching_entry.id);
    return c.parameters;
}
export function validateMingjiaoTeachersCondition(condition) { return parameters(condition); }
// Light muzhang never defines weapon_prop/dodge: setup only adds it at weight >=3000.
// Keep the actual missing key, rather than manufacturing a stored zero.
const applyFor = a => !a.equipment ? { armor: 100 } : a.equipment.type === 'staff'
    ? { armor: 100, damage: 60 } : { armor: 100, damage: 25, dodge: -2 };
const effective = (skills, mappings, apply) => Object.fromEntries(Object.entries(skills).map(([id, n]) =>
    [id, Math.trunc(n / 2) + (skills[mappings[id]] ?? 0) + (apply[id] ?? 0)]));
const effectiveInt = s => s.properties.int + Math.trunc((s.skills.literate ?? 0) / 10);
const effectiveDex = s => s.properties.dex + Math.trunc((s.skills.dodge ?? 0) / 10);
const effectiveStr = s => s.properties.str + Math.trunc(Math.max(...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw']
    .map(k => s.skills[k] ?? 0)) / 10);

// Finite endpoint support; these are possible original outcomes, never hidden RNG observations.
export function mingjiaoTeachersProgress(a, skill) {
    const level = a.skills[skill] ?? 0, cognize = a.skills[knowledge.has(skill) ? 'culture-cognize' : 'martial-cognize'] ?? 0;
    let range = Math.trunc((effectiveInt(a) + Math.trunc(level / 5)) / 2);
    if (a.properties['special_skill/wuxing']) range += Math.trunc(range * 20 / 100);
    assert.ok(range > 0); const result = [];
    for (let input = 4; input < 4 + range; input++) {
        const adjusted = input + Math.trunc(input * cognize / 500), gross = 1 + Math.trunc(adjusted * 100 / (level + 100));
        const upgraded = gross > (level + 1) ** 2;
        result.push({ level: level + Number(upgraded), learned: upgraded ? 0 : gross, gross, upgraded: Number(upgraded) });
    }
    return result;
}
function decision(p) {
    const refusal = p.refusal_kind;
    if (p.expected === 'refused') return { completed: 0, accepted: Number(['no-teach', 'martial-cap', 'teacher-no-teach',
        'exp-low', 'jing-low'].includes(refusal)), jing_cost: refusal === 'jing-low' ? p.actor.properties.jing : 0,
        jing_writeoff: refusal === 'jing-low' ? p.actor.properties.jing : 0, result: refusal };
    const level = p.actor.skills[p.skill] ?? 0, fee = Math.trunc((100 + level * 2) / p.actor.properties.int) * (level ? 1 : 2);
    assert.ok(p.actor.properties.jing >= fee && p.actor.properties.potential - p.actor.properties.learned_points >= 1);
    return { completed: 1, accepted: 1, jing_cost: fee, jing_writeoff: 0, result: 'learned' };
}
function weapon(detail, type, program, student) {
    assert.ok(map(detail)); assert.equal(own(detail, 'program'), program); assert.equal(own(detail, 'skill_type'), type);
    const id = own(detail, 'object'); assert.equal(typeof id, 'string'); assert.ok(id.startsWith(program + '#'));
    assert.equal(own(detail, 'equipped'), 'wielded'); assert.equal(own(detail, 'environment'), student);
    equal(own(detail, 'consistence'), 100);
    const properties = { sword: { weight: 6000, damage: 25, flag: 4 }, dagger: { weight: 6000, damage: 13, flag: 6 },
        staff: { weight: 1000, damage: 60, flag: 16 } }[type];
    for (const [k, v] of Object.entries(properties)) equal(own(detail, k), v);
    return id;
}
function point(v, a, student) {
    const q = a.properties;
    for (const [field, key] of [['contribution', 'gongxian'], ['jing', 'jing'], ['neili', 'neili'], ['max_neili', 'max_neili'],
        ['max_jingli', 'max_jingli'], ['potential', 'potential'], ['learned_points', 'learned_points'], ['combat_exp', 'combat_exp'],
        ['shen', 'shen'], ['weiwang', 'weiwang'], ['str', 'str'], ['int', 'int'], ['dex', 'dex'], ['con', 'con'],
        ['character', 'character'], ['gender', 'gender'], ['guilty', 'guilty']]) equal(own(v, field), q[key]);
    assert.equal(own(v, 'effective_int'), effectiveInt(a)); assert.equal(own(v, 'effective_dex'), effectiveDex(a));
    assert.equal(own(v, 'effective_str'), effectiveStr(a));
    const apply = applyFor(a), eff = effective(a.skills, a.mappings, apply);
    assert.deepEqual(own(v, 'skills'), a.skills); assert.deepEqual(own(v, 'learned'), a.learned ?? {});
    assert.deepEqual(own(v, 'mappings'), a.mappings); assert.deepEqual(own(v, 'preparations'), a.preparations);
    assert.deepEqual(own(v, 'effective_skills'), eff); assert.deepEqual(own(v, 'temp_apply'), apply);
    assert.equal(own(v, 'effective_force'), eff.force); assert.equal(own(v, 'effective_dodge'), eff.dodge);
    equal(own(v, 'busy'), a.busy ?? 0); assert.equal(own(v, 'fighting'), Number(!!a.fighting));
    assert.deepEqual(own(v, 'conditions'), a.conditions ?? {}); assert.deepEqual(own(v, 'grants'), {});
    equal(own(v, 'reborn_family'), q['reborn/family_name']);
    for (const [field, key] of [['family', 'family_name'], ['master_id', 'master_id'], ['master_name', 'master_name']])
        equal(own(v, field), q.family?.[key] ?? 0);
    const r = own(v, 'recruitment'); assert.deepEqual(own(r, 'family'), q.family ?? {});
    equal(own(r, 'family_present'), Number(!!q.family));
    for (const k of ['name', 'class', 'title']) assert.equal(own(r, k), q[k]);
    assert.equal(own(r, 'pending_apprentice'), ''); assert.equal(own(r, 'pending_betrayer'), '');
    assert.deepEqual(Object.keys(map(own(r, 'history'))).sort(), ['detach/明教', 'betrayer/明教', 'betrayer/times'].sort());
    for (const k of ['detach/明教', 'betrayer/明教', 'betrayer/times']) equal(own(r.history, k), q[k]);
    equal(own(r, 'quest'), 0); equal(own(r, 'temp_quest'), 0);
    const qualification = own(v, 'qualification');
    const expectedKeys = [...flags, 'pigging', 'guilty', 'qiankun-except', 'reborn/family_name'];
    assert.deepEqual(Object.keys(map(qualification)).sort(), expectedKeys.sort());
    for (const key of flags) equal(own(qualification, key), q[key]);
    equal(own(qualification, 'guilty'), q.guilty);
    equal(own(qualification, 'reborn/family_name'), q['reborn/family_name']);
    equal(own(qualification, 'qiankun-except'), a.conditions?.['qiankun-except'] ?? 0);
    equal(own(qualification, 'pigging'), a.room_properties?.pigging ?? 0);
    equal(own(v, 'room_pigging'), a.room_properties?.pigging ?? 0);
    assert.equal(own(v, 'encumbrance'), (a.equipment ? a.equipment.type === 'staff' ? 1000 : 6000 : 0)
        + (a.secondary_equipment ? 6000 : 0));
    for (const [cfg, slot, details] of [[a.equipment, 'weapon', 'weapon_details'],
        [a.secondary_equipment, 'secondary_weapon', 'secondary_weapon_details']]) {
        assert.equal(own(v, slot), cfg?.type ?? 'none');
        if (cfg) weapon(own(v, details), cfg.type, cfg.program, student);
        else assert.deepEqual(own(v, details), {});
    }
}
function teacherState(npc, p, teacherId) {
    const t = teachers.get(p.teacher.key);
    assert.equal(own(npc, 'object'), teacherId); assert.equal(own(npc, 'id'), t.id);
    assert.equal(own(npc, 'living'), 1); equal(own(npc, 'playerp'), 0);
    assert.deepEqual(own(npc, 'skills'), t.levels);
    assert.deepEqual(own(npc, 'mappings'), teacherMaps[t.key]); assert.deepEqual(own(npc, 'preparations'), teacherPreps[t.key]);
    const f = own(npc, 'family'); equal(own(npc, 'family_present'), Number(t.family !== null));
    if (t.family === null) assert.deepEqual(f, {});
    else assert.deepEqual(f, { family_name: '明教', generation: t.generation, privs: -1,
        title: t.key === 'fanyao' ? '光明右使' : t.key === 'zhangwuji' ? '教主' : '弟子' });
    assert.deepEqual(own(npc, 'no_teach'), t.no_teach);
    equal(own(npc, 'env_no_teach'), p.teacher_properties['env/no_teach'] ?? 0);
    equal(own(npc, 'recognize_source'), 0);
}
function preparation(raw, p, student) {
    const preps = own(raw, 'teacher_preparations'), clean = own(raw, 'teacher_cleanups');
    assert.ok(Array.isArray(preps) && preps.length === 1); assert.ok(Array.isArray(clean) && clean.length === 1);
    const prep = preps[0], teacherId = own(prep, 'teacher');
    assert.equal(own(prep, 'key'), p.teacher.key); assert.equal(own(prep, 'command'), 'test_interface');
    assert.ok(teacherId.startsWith(p.teacher.path + '#')); assert.equal(own(prep, 'teacher_program'), p.teacher.path);
    assert.equal(own(prep, 'entry_actor'), student); assert.equal(own(prep, 'return_actor'), student);
    assert.equal(own(prep, 'initializer_actor'), 'not_observed');
    teacherState(own(prep, 'teacher_state'), p, teacherId);
    assert.deepEqual(own(prep, 'before'), own(prep, 'after'));
    for (const k of ['object', 'id', 'userp', 'playerp', 'interactive', 'skills', 'learned', 'mappings',
        'qi', 'jing', 'neili', 'max_neili', 'potential', 'learned_points']) assert.deepEqual(own(prep.before, k), own(raw.before[0], k));
    for (const [k, hb] of [['autonomy_before', 1], ['autonomy_after', 0]]) {
        const v = own(prep, k); assert.equal(own(v, 'heartbeat'), hb); assert.equal(own(v, 'blueprint'), p.teacher.path);
        equal(own(v, 'blueprint_heartbeat'), 0); assert.deepEqual(own(v, 'callbacks'), []);
    }
    assert.equal(own(clean[0], 'object'), teacherId); equal(own(clean[0], 'pending'), 0); equal(own(clean[0], 'object_exists'), 0);
    const contexts = own(raw, 'skill_load_contexts'); assert.ok(Array.isArray(contexts) && contexts.length === 2);
    for (const [i, ctx] of contexts.entries()) {
        assert.deepEqual(Object.keys(map(ctx)).sort(), ['skill', 'actor', 'already_loaded', 'skills', 'command', 'function', 'argument', 'result'].sort());
        assert.equal(ctx.skill, i ? 'qishang-quan' : 'shenghuo-ling'); assert.equal(ctx.actor, student);
        assert.ok([0, 1].includes(ctx.already_loaded)); assert.deepEqual(ctx.skills, p.actor.skills);
        assert.equal(ctx.command, 'test_interface'); assert.equal(ctx.function, 'valid_enable');
        assert.equal(ctx.argument, i ? 'cuff' : 'sword'); assert.equal(ctx.result, 1);
    }
    return teacherId;
}
function boundary(b, pointState, p, student) {
    assert.equal(own(b, 'object'), student); assert.equal(own(b, 'id'), 'left');
    for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(own(b, k), 1);
    for (const k of ['wizardp', 'ghost']) equal(own(b, k), 0);
    for (const k of ['jing', 'neili', 'max_neili', 'potential', 'learned_points', 'str', 'int', 'con', 'dex', 'combat_exp',
        'skills', 'learned', 'mappings', 'preparations', 'effective_skills', 'effective_str', 'effective_int', 'effective_dex',
        'weapon', 'weapon_details', 'secondary_weapon', 'secondary_weapon_details', 'busy', 'encumbrance'])
        assert.deepEqual(own(b, k), own(pointState, k));
    for (const k of ['qi', 'eff_qi', 'max_qi', 'eff_jing', 'max_jing', 'jingli', 'max_jingli'])
        assert.equal(own(b, k), p.actor.properties[k]);
    assert.equal(own(b, 'handing'), 'none'); assert.deepEqual(own(b, 'handing_details'), {});
    assert.equal(own(b, 'weapon_damage'), p.actor.equipment ? p.actor.equipment.type === 'staff' ? 60 : 25 : 0);
    assert.equal(own(b, 'weapon_flag'), p.actor.equipment ? p.actor.equipment.type === 'staff' ? 16 : 4 : 0);
    assert.deepEqual(own(own(b, 'temp'), 'apply'), pointState.temp_apply);
    const c = own(b, 'cultivation');
    equal(own(c, 'class'), p.actor.properties.class); equal(own(c, 'family/family_name'), pointState.family);
    for (const k of [...flags, 'guilty', 'reborn/family_name']) equal(own(c, k), p.actor.properties[k]);
    const cond = own(b, 'conditions');
    if (Object.keys(pointState.conditions).length) assert.deepEqual(cond, pointState.conditions);
    else assert.ok(cond === null || cond === 0 || Object.keys(map(cond)).length === 0);
}
export function validateMingjiaoTeachersRecord(raw, condition) {
    const p = parameters(condition);
    assert.equal(own(raw, 'kind'), 'sample'); assert.equal(own(raw, 'condition_id'), condition.id);
    assert.equal(own(raw, 'method'), 'teaching');
    const index = own(raw, 'index'); assert.ok(Number.isSafeInteger(index) && index >= 0 && index < condition.samples);
    const outcome = own(raw, 'outcome'); if (['error', 'not_applicable'].includes(outcome)) return [];
    assert.equal(outcome, p.expected);
    for (const k of ['before', 'after', 'metrics']) assert.ok(Array.isArray(own(raw, k)) && raw[k].length === 2);
    const student = own(raw.before[0], 'object'); assert.match(student, /^\/tests\/teaching_actor#\d+$/);
    const teacherId = preparation(raw, p, student), steps = own(raw, 'teaching'); assert.ok(Array.isArray(steps) && steps.length === 1);
    const step = steps[0], instruction = p.teaching_expectations[0];
    assert.equal(own(step, 'student'), student); assert.equal(own(step, 'teacher'), teacherId);
    assert.equal(own(step, 'resolved_teacher'), teacherId); assert.equal(own(step, 'teacher_program'), p.teacher.path);
    assert.deepEqual(own(step, 'teacher_skills'), p.teacher_levels); assert.equal(own(step, 'command'), instruction.action);
    assert.ok(Number.isFinite(own(step, 'elapsed')) && step.elapsed >= 0); assert.ok(Number.isSafeInteger(own(step, 'wall_time')) && step.wall_time > 0);
    teacherState(own(step, 'teacher_before'), p, teacherId); teacherState(own(step, 'teacher_after'), p, teacherId);
    assert.deepEqual(step.teacher_after, step.teacher_before, 'ordinary learn cannot mutate original NPC');
    const a = copy(p.actor); a.learned = {}; a.fighting = p.fighting; a.room_properties = p.room_properties;
    point(own(step, 'before'), a, student); const d = decision(p);
    const cost = own(step, 'command_accepted'); assert.ok(Number.isSafeInteger(cost) && cost >= 0);
    assert.equal(Number(cost > 0), d.accepted);
    let matches = [];
    if (d.completed) {
        matches = mingjiaoTeachersProgress(a, p.skill).filter(v => v.level === step.after.skills?.[p.skill] && v.learned === step.after.learned?.[p.skill]);
        assert.ok(matches.length, 'learning endpoint outside finite original RNG support');
        a.skills[p.skill] = matches[0].level; a.learned[p.skill] = matches[0].learned;
    }
    a.properties.jing -= d.jing_cost; a.properties.learned_points += d.completed;
    point(own(step, 'after'), a, student);
    const before = copy(step.before), after = copy(step.after);
    for (const k of ['jing', 'learned_points', 'skills', 'learned', 'effective_skills', 'effective_force', 'effective_dodge',
        'effective_str', 'effective_int', 'effective_dex']) { delete before[k]; delete after[k]; }
    assert.deepEqual(after, before, 'unrelated point state drift');
    assert.equal(own(step, 'message_scope'), 'receive_message_apply_input_not_full_transcript');
    assert.ok(Array.isArray(own(step, 'messages'))); const texts = step.messages.map(m => {
        assert.equal(typeof own(m, 'category'), 'string'); return plain(own(m, 'text'));
    }).join('');
    if (p.refusal_kind === 'no-teach') assert.ok(texts.includes(teachers.get(p.teacher.key).no_teach[p.skill]));
    if (p.refusal_kind === 'jing-low') assert.ok(texts.includes('然而你今天太累了，无法再进行任何学习了。\n'));
    boundary(raw.before[0], step.before, p, student); boundary(raw.after[0], step.after, p, student);
    assert.deepEqual(raw.after[1], raw.before[1], 'unrelated USER must be unchanged');
    const bb = copy(raw.before[0]), ba = copy(raw.after[0]);
    for (const k of ['jing', 'learned_points', 'skills', 'learned', 'effective_skills', 'effective_str', 'effective_int', 'effective_dex', 'temp']) { delete bb[k]; delete ba[k]; }
    assert.deepEqual(ba, bb);
    const oldTemp = copy(raw.before[0].temp), nextTemp = copy(raw.after[0].temp);
    for (const k of ['notify_fail', 'time']) { delete oldTemp[k]; delete nextTemp[k]; }
    assert.deepEqual(nextTemp, oldTemp, 'only original notice and learn throttle may change temp');
    for (const [side, m] of raw.metrics.entries()) {
        for (const [k, value] of Object.entries(map(m))) {
            assert.ok(Number.isSafeInteger(value) && value >= 0); assert.equal(value, side === 0 && k === 'jing_cost' ? d.jing_cost : 0);
        }
        assert.equal(m.jing_cost ?? 0, side === 0 ? d.jing_cost : 0);
    }
    for (const k of ['launches', 'attacks', 'defenses', 'passives', 'callbacks', 'terminals']) assert.deepEqual(own(raw, k), []);
    return [{ skill: p.skill, teacher: p.teacher.key, result: d.result, accepted: d.accepted, execution_cost: cost,
        completed: d.completed, jing_cost: d.jing_cost, jing_writeoff: d.jing_writeoff, upgraded: matches[0]?.upgraded ?? 0,
        learned_net: (step.after.learned[p.skill] ?? 0) - (step.before.learned[p.skill] ?? 0),
        gross_learned: matches.length ? matches[0].gross : 0, experimental_identity: p.experimental_identity }];
}
export function mingjiaoTeachersEffects(rows, condition) {
    const values = []; let unknown = 0;
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw.method, condition.method); assert.equal(row.outcome, row.raw.outcome);
        const observed = validateMingjiaoTeachersRecord(row.raw, condition);
        if (['error', 'not_applicable'].includes(row.outcome)) { unknown++; continue; }
        values.push(...observed);
    }
    const sum = k => values.length ? values.reduce((n, v) => n + v[k], 0) : null;
    return { samples: rows.length, validated: values.length, unknown, teacher: condition.parameters.teacher.key,
        skill: condition.parameters.skill, experimental_identity: condition.parameters.experimental_identity,
        commands: values.length, commands_accepted: sum('accepted'), command_execution_cost: sum('execution_cost'),
        learned_iterations: sum('completed'), learned_points: sum('completed'), jing_cost: sum('jing_cost'),
        jing_writeoff: sum('jing_writeoff'), upgrades: sum('upgraded'), learned_net: distribution(values.map(v => v.learned_net)),
        gross_learned: distribution(values.map(v => v.gross_learned)),
        results: Object.fromEntries([...new Set(values.map(v => v.result))].sort().map(k => [k, values.filter(v => v.result === k).length])),
        unknown_scopes: ['assigned master/reborn state is not natural recruitment or reincarnation',
            'no old ask evidence restoration or new ask coverage', 'no book acquisition, practice, research or combat observation',
            'dual equipped refusal does not isolate the secondary-only empty-hand predicate'] };
}
