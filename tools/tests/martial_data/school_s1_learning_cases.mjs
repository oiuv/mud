// S1 learning callback conditions (普通学习回调).
// 21 named conditions exactly implement E/prep-s1-learning-callback-20261029-v1/matrix.json
// (per-case actor skills, exp boundaries, actions and expected semantics); the four
// daobf conditions exercise recognize_apprentice gates and are pinned to daobf.c.
// Source: E/prep-s1-learning-callback-20261029-v1/matrix.json
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const s1LearningGroup = 's1-learning';

// Teacher definitions with source hash verification
const teachers = {
    'zhao-banshan': {
        name: '赵半山', id: 'zhao banshan', family: '红花会', generation: 4,
        path: '/kungfu/class/honghua/zhao', sha256: 'e76e8cb3fc7da87b5f42ec9dbdd0f48c02edad816844ccc140b02ec3b79eb5cb',
    },
    'huangzhong-gong': {
        name: '黄钟公', id: 'huangzhong gong', family: '梅庄', generation: 1,
        path: '/kungfu/class/meizhuang/huang', sha256: 'd299803e1c478fe23d4b9a44a84ba16063f8f99c1da9bd1d7e5cf99567c07c5c',
    },
    'su-xinghe': {
        name: '苏星河', id: 'su xinghe', family: '逍遥派', generation: 2,
        path: '/kungfu/class/xiaoyao/suxingh', sha256: '3d0b2717d58f40fa46b87735ed250682fd8ceed7558046698459794ec5ed5707',
    },
    'hebi-weng': {
        name: '鹤笔翁', id: 'hebi weng', family: '玄冥谷', generation: 2,
        path: '/kungfu/class/xuanming/he', sha256: '35d6c81376b053c3d70eb49b7fe677a54aa8a280aa61461cd3b41c10a0d8542c',
    },
    'luzhang-ke': {
        name: '鹿杖客', id: 'luzhang ke', family: '玄冥谷', generation: 2,
        path: '/kungfu/class/xuanming/lu', sha256: 'a9b6808f61ed85651ead98bcab545df10c52038b7bba44db0243afddb9ea83c8',
    },
    'miao-renfeng': {
        name: '苗人凤', id: 'miao renfeng', family: '中原苗家', generation: 7,
        path: '/kungfu/class/miao/miao', sha256: 'acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a',
    },
    'murong-bo': {
        name: '慕容博', id: 'murong bo', family: '慕容世家', generation: 16,
        path: '/kungfu/class/murong/murongbo', sha256: '62fafa908fbfa57973317f05eda6ef72ba96094e68f2560370cdd4b3b30d7be5',
    },
    'dao-baifeng': {
        name: '刀白凤', id: 'dao baifeng', family: '段氏皇族', generation: 4,
        path: '/kungfu/class/duan/daobf', sha256: '144fe2413ca00386b496287242c56ee6092bc9e7ba052afc24eabb4ac2eb25b5',
    },
};

// Exact refusal strings of the original no_teach declarations (matrix expected.original_no_teach).
const refusalTexts = {
    'zhao-taiji-quan': '嗯……你还是学点其它的吧。',
    'huang-longzhua-gong': '龙爪功乃昔日方证大师所授的少林绝学，老夫略之一二，并不授教。',
    'su-liuyang-zhang': '这天山六阳掌向来只能由逍遥派掌门传功，我不便教授。',
    'su-zhemei-shou': '逍遥折梅手乃本门神功，只能由掌门人传授。',
    'he-dulong-shenzhua': '这个你还是找我师兄鹿杖客吧，他比我厉害多了！',
    'he-xuanming-zhang': '玄冥神掌要我师父亲自传授，你还是去找他老人家吧！',
    'lu-xuanming-zhang': '玄冥神掌要我师父亲自传授，你还是去找他老人家吧！',
    miaoRefusal: '这套白鹤冲天掌过于繁杂，我还是先教你些简单的武功吧。',
    miaoGrant: '今日我就传你白鹤冲天掌',
    murongFirst: '据说少林的武功学了对身体有害',
    murongLater: '你还是安心学本门功夫吧。',
    daobfFamily: '我与阁下素不相识',
    daobfGender: '你还是去跟你爹爹学吧',
    daobfExp: '你现在经验尚浅',
    daobfGrant: '今日我就教你好了',
    forceRefusal: '内功火候不够',
};

const murongSkills = ['banruo-zhang', 'yizhi-chan', 'nianhua-zhi', 'sanhua-zhang', 'fengyun-shou', 'yingzhua-gong'];

// Condition definitions: the 21 matrix cases plus 4 daobf recognize_apprentice cases.
const conditionDefs = [
    // 1-7: String refusal conditions (original no_teach string entries)
    { id: 's1-learning-honghua-zhao-taiji-quan-string-refusal', teacher: 'zhao-banshan', skill: 'taiji-quan', teacherLevel: 220, variant: 'string-refusal', refusalKey: 'zhao-taiji-quan', skills: { force: 200, unarmed: 60, 'taiji-quan': 50 } },
    { id: 's1-learning-meizhuang-huang-longzhua-gong-string-refusal', teacher: 'huangzhong-gong', skill: 'longzhua-gong', teacherLevel: 200, variant: 'string-refusal', refusalKey: 'huang-longzhua-gong', skills: { force: 200, claw: 60, 'longzhua-gong': 50 } },
    { id: 's1-learning-xiaoyao-suxingh-liuyang-zhang-string-refusal', teacher: 'su-xinghe', skill: 'liuyang-zhang', teacherLevel: 240, variant: 'string-refusal', refusalKey: 'su-liuyang-zhang', skills: { force: 200, strike: 60, 'liuyang-zhang': 50 } },
    { id: 's1-learning-xiaoyao-suxingh-zhemei-shou-string-refusal', teacher: 'su-xinghe', skill: 'zhemei-shou', teacherLevel: 240, variant: 'string-refusal', refusalKey: 'su-zhemei-shou', skills: { force: 200, hand: 60, 'zhemei-shou': 50 } },
    { id: 's1-learning-xuanming-he-dulong-shenzhua-string-refusal', teacher: 'hebi-weng', skill: 'dulong-shenzhua', teacherLevel: 240, variant: 'string-refusal', refusalKey: 'he-dulong-shenzhua', skills: { force: 200, claw: 60, 'dulong-shenzhua': 50 } },
    { id: 's1-learning-xuanming-he-xuanming-zhang-string-refusal', teacher: 'hebi-weng', skill: 'xuanming-zhang', teacherLevel: 260, variant: 'string-refusal', refusalKey: 'he-xuanming-zhang', skills: { force: 200, strike: 60, 'xuanming-zhang': 50 } },
    { id: 's1-learning-xuanming-lu-xuanming-zhang-string-refusal', teacher: 'luzhang-ke', skill: 'xuanming-zhang', teacherLevel: 280, variant: 'string-refusal', refusalKey: 'lu-xuanming-zhang', skills: { force: 200, strike: 60, 'xuanming-zhang': 50 } },
    // 8-10: Miao family experience boundaries (try_to_learn_chongtianzhang: combat_exp > 100000)
    { id: 's1-learning-miao-chongtian-exp99999', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'exp-threshold-refusal', exp: 99999, skills: { force: 200, strike: 60, 'chongtian-zhang': 50 } },
    { id: 's1-learning-miao-chongtian-exp100000', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'exp-threshold-refusal', exp: 100000, skills: { force: 200, strike: 60, 'chongtian-zhang': 50 } },
    { id: 's1-learning-miao-chongtian-exp100001', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'exp-threshold', exp: 100001, skills: { force: 200, strike: 60, 'chongtian-zhang': 50 } },
    // 11-13: Miao family permission conditions
    { id: 's1-learning-miao-chongtian-existing-permission', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'existing-permission', exp: 99999, preGrant: true, skills: { force: 200, strike: 60, 'chongtian-zhang': 50 } },
    { id: 's1-learning-miao-chongtian-permission-before-force-refusal', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'permission-before-skill-refusal', exp: 100001, skills: { force: 198, strike: 60, 'chongtian-zhang': 50 } },
    { id: 's1-learning-miao-chongtian-real-repeat', teacher: 'miao-renfeng', skill: 'chongtian-zhang', teacherLevel: 260, variant: 'same-student-repeat', exp: 100001, interval: 2, steps: 2, skills: { force: 200, strike: 60, 'chongtian-zhang': 50 } },
    // 14-19: Murong shaolin skill first refusals (try_learn_sk: -1 then string)
    { id: 's1-learning-murong-banruo-zhang-first-refusal', teacher: 'murong-bo', skill: 'banruo-zhang', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, strike: 60, 'banruo-zhang': 50 } },
    { id: 's1-learning-murong-yizhi-chan-first-refusal', teacher: 'murong-bo', skill: 'yizhi-chan', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, finger: 60, 'yizhi-chan': 50 } },
    { id: 's1-learning-murong-nianhua-zhi-first-refusal', teacher: 'murong-bo', skill: 'nianhua-zhi', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, finger: 60, 'nianhua-zhi': 50 } },
    { id: 's1-learning-murong-sanhua-zhang-first-refusal', teacher: 'murong-bo', skill: 'sanhua-zhang', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, strike: 60, 'sanhua-zhang': 50 } },
    { id: 's1-learning-murong-fengyun-shou-first-refusal', teacher: 'murong-bo', skill: 'fengyun-shou', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, hand: 60, 'fengyun-shou': 50 } },
    { id: 's1-learning-murong-yingzhua-gong-first-refusal', teacher: 'murong-bo', skill: 'yingzhua-gong', teacherLevel: 240, variant: 'first-callback-refusal', skills: { force: 200, claw: 60, 'yingzhua-gong': 50 } },
    // 20-21: Murong shared has_asked mark across commands and skills
    { id: 's1-learning-murong-repeat', teacher: 'murong-bo', skill: 'banruo-zhang', teacherLevel: 240, variant: 'repeat', steps: 2, skills: { force: 200, strike: 60, 'banruo-zhang': 50, 'yizhi-chan': 50, finger: 60, 'nianhua-zhi': 50, 'sanhua-zhang': 50, 'fengyun-shou': 50, hand: 60, 'yingzhua-gong': 50, claw: 60 } },
    { id: 's1-learning-murong-cross-skill-shared-mark', teacher: 'murong-bo', skill: 'banruo-zhang', teacherLevel: 240, variant: 'cross-skill-chain', chainSkills: murongSkills, skills: { force: 200, strike: 60, 'banruo-zhang': 50, 'yizhi-chan': 50, finger: 60, 'nianhua-zhi': 50, 'sanhua-zhang': 50, 'fengyun-shou': 50, hand: 60, 'yingzhua-gong': 50, claw: 60 } },
    // 22-25: Feifeng-bian (daobf) recognize_apprentice gates (family/gender/exp), not in the 21-condition matrix
    { id: 's1-learning-duan-daobf-feifeng-bian-wrong-family', teacher: 'dao-baifeng', skill: 'feifeng-bian', teacherLevel: 160, variant: 'recognize-family-refusal', exp: 30000, gender: '女性', familyName: '其他门派', apprentice: false, skills: { force: 200, whip: 60, 'feifeng-bian': 50 } },
    { id: 's1-learning-duan-daobf-feifeng-bian-wrong-gender', teacher: 'dao-baifeng', skill: 'feifeng-bian', teacherLevel: 160, variant: 'recognize-gender-refusal', exp: 30000, gender: '男性', apprentice: false, skills: { force: 200, whip: 60, 'feifeng-bian': 50 } },
    { id: 's1-learning-duan-daobf-feifeng-bian-low-exp', teacher: 'dao-baifeng', skill: 'feifeng-bian', teacherLevel: 160, variant: 'recognize-exp-refusal', exp: 29999, gender: '女性', apprentice: false, skills: { force: 200, whip: 60, 'feifeng-bian': 50 } },
    { id: 's1-learning-duan-daobf-feifeng-bian-success', teacher: 'dao-baifeng', skill: 'feifeng-bian', teacherLevel: 160, variant: 'recognize-success', exp: 30000, gender: '女性', apprentice: false, whip: true, skills: { force: 200, whip: 60, 'feifeng-bian': 50 } },
];

// Sample counts follow the matrix: random-progress conditions carry 100 formal
// samples, deterministic gates 2; smoke is 2 per condition. The daobf additions
// stay at 2/2 (gate checks only).
const randomProgressVariants = new Set(['exp-threshold', 'existing-permission', 'same-student-repeat']);
// Variants whose original command actually grants learning progress.
const progressVariants = new Set(['exp-threshold', 'existing-permission', 'same-student-repeat', 'recognize-success']);

function actorFixture(def, teacher) {
    const family = { family_name: def.familyName || teacher.family, generation: def.generation ?? teacher.generation };
    if (def.apprentice !== false) {
        family.master_id = teacher.id;
        family.master_name = teacher.name;
    }
    const properties = {
        gender: def.gender || '男性',
        character: '光明磊落',
        str: 30, con: 30, int: 30, dex: 30, shen: 0,
        combat_exp: def.exp ?? 1000000,
        potential: 10000,
        learned_points: 0,
        gongxian: 0,
        qi: 10000, eff_qi: 10000, max_qi: 10000,
        jing: 10000, eff_jing: 10000, max_jing: 10000,
        neili: 6000, max_neili: 6000, jingli: 1000, max_jingli: 1000, jiali: 0,
        family,
    };
    const actor = { skills: { ...def.skills }, mappings: {}, preparations: {}, properties };
    if (def.whip) actor.equipment = { program: '/clone/weapon/changbian', type: 'whip' };
    return actor;
}

function expectedResults(def, actionCount) {
    if (def.variant === 'permission-before-skill-refusal') return [0];
    return new Array(actionCount).fill(1);
}

export function s1LearningConditions(catalog, readSource, { smoke = false } = {}) {
    // Verify source hashes
    for (const [key, teacher] of Object.entries(teachers)) {
        if (teacher.sha256 !== 'PENDING') {
            const source = readSource(teacher.path + '.c');
            assert.ok(source, 'missing teacher source: ' + teacher.path);
            assert.equal(createHash('sha256').update(source).digest('hex'), teacher.sha256,
                'teacher source hash ' + teacher.path);
        }
    }

    const result = [];
    for (const def of conditionDefs) {
        const teacher = teachers[def.teacher];
        assert.ok(teacher, 'unknown teacher: ' + def.teacher);

        const samples = smoke ? 2 : (randomProgressVariants.has(def.variant) ? 100 : 2);
        const actor = actorFixture(def, teacher);
        const skillList = def.chainSkills || [def.skill];
        const actions = skillList.map(skill => `learn ${teacher.id} ${skill} 1`);
        if (def.variant === 'same-student-repeat' || def.variant === 'repeat')
            actions.push(`learn ${teacher.id} ${def.skill} 1`);
        const grant = def.teacher === 'miao-renfeng' ? `can_learn/miao/${def.skill}` : '';

        result.push({
            id: def.id,
            stage: 'school',
            entry_id: `${teacher.path.replace(/^\//, '')}.c:1:learn`,
            method: 'teaching',
            samples,
            parameters: {
                school: 's1-learning',
                family: def.familyName || teacher.family,
                collection_group: s1LearningGroup,
                teacher: { id: teacher.id, name: teacher.name, path: teacher.path, sha256: teacher.sha256 },
                teacher_level: def.teacherLevel,
                skill: def.skill,
                variant: def.variant,
                exp: def.exp ?? 0,
                gender: def.gender || '男性',
                refusal_text: def.refusalKey ? refusalTexts[def.refusalKey] : '',
                teaching_profile: 's1-learning',
                teaching_kind: 'ordinary_learning',
                monitored_grants: grant ? [grant] : [],
                permission_grant: grant,
                s1_pre_grant: def.preGrant ? 1 : 0,
                minimum_step_interval_seconds: def.interval ?? 0,
                expected_command_results: expectedResults(def, actions.length),
                teaching_expectations: actions.map(action => ({
                    teacher_key: def.teacher,
                    action,
                    command_kind: 'learn',
                })),
                actor,
                target: {
                    skills: { force: 200, dodge: 200, parry: 200 },
                    mappings: {}, preparations: {},
                    properties: { str: 30, int: 30, con: 30, dex: 30, combat_exp: 100000, qi: 10000, max_qi: 10000 },
                },
                named_participants: true,
                fighting: false,
                expected: progressVariants.has(def.variant) ? 'observed' : 'refused',
                not_applicable: '',
                observation: 'original_learn_command',
                observe_seconds: 0,
                qualification_note: `S1 普通学习回调：${teacher.name} 传授 ${def.skill}（${def.variant}）。`
                    + `原 learn 命令触发许可回调，区分首次/后续/字符串拒绝/许可授予。`,
                qualification_sources: [teacher.path.replace(/^\//, '') + '.c', 'cmds/skill/learn.c', 'feature/apprentice.c', 'feature/skill.c'],
                s1_teacher_paths: { [def.teacher]: teacher.path },
                s1_teacher_families: { [def.teacher]: teacher.family },
                teaching_entry: {
                    id: `${teacher.path.replace(/^\//, '')}.c:1:learn`,
                    path: teacher.path.replace(/^\//, '') + '.c',
                    sha256: teacher.sha256,
                    role: 'teaching',
                    function: 'learn',
                    line: 1,
                },
                qualification_evidence: [
                    { path: teacher.path.replace(/^\//, '') + '.c', sha256: teacher.sha256 },
                ],
            },
        });
    }
    return result;
}

function stepMessages(step) {
    return (step.messages || []).map(m => m.text || '').join('\n');
}

function assertNoProgress(step, skills) {
    for (const skill of skills) {
        assert.equal(step.after.skills[skill], step.before.skills[skill], `技能无增长 ${skill}`);
        assert.equal(step.after.learned[skill] ?? 0, step.before.learned[skill] ?? 0, `领悟无增长 ${skill}`);
    }
    assert.equal(step.after.jing, step.before.jing, '精神不支出');
    assert.equal(step.after.neili, step.before.neili, '内力不支出');
    assert.equal(step.after.learned_points, step.before.learned_points, '潜能不支出');
}

function assertProgress(step, skill) {
    assert.ok(step.after.skills[skill] > step.before.skills[skill] ||
        (step.after.learned[skill] ?? 0) > (step.before.learned[skill] ?? 0), `学习进度增长 ${skill}`);
    const level = step.before.skills[skill];
    const jingCost = Math.floor((100 + level * 2) / step.before.int);
    assert.equal(step.before.jing - step.after.jing, jingCost, '精神支出为原公式费用');
    assert.equal(step.after.learned_points - step.before.learned_points, 1, '潜能支出一次');
    assert.equal(step.after.neili, step.before.neili, '内力不支出');
}

function assertGrant(step, grant, before, after) {
    assert.equal(step.before.grants[grant] ?? 0, before, `许可前快照 ${grant}`);
    assert.equal(step.after.grants[grant] ?? 0, after, `许可后快照 ${grant}`);
}

function mark(snapshot, name) {
    return snapshot.s1_marks?.[name] ?? 0;
}

export function validateS1LearningRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, s1LearningGroup);
    const steps = raw.teaching || [];
    assert.equal(steps.length, p.teaching_expectations.length, '逐步记录数与计划动作一致');
    assert.equal(raw.outcome, p.expected);
    const realStudent = raw.before?.[0]?.object;
    assert.ok(realStudent, '样本须有真实学生对象');
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        assert.equal(step.student, realStudent, '学生绑定样本真实对象');
        assert.equal(step.student, steps[0].student, '同一学生续行');
        assert.match(step.student, /^\/tests\/teaching_actor#\d+$/, '真实学生角色');
        assert.equal(step.teacher_program, p.teacher.path, '原教师程序');
        assert.ok(step.teacher.startsWith(p.teacher.path + '#'), '原教师实例');
        assert.equal(step.command, p.teaching_expectations[i].action, '逐步绑定计划原命令');
        for (const state of [step.before, step.after]) {
            // Required observation fields must exist; a missing field is not a zero.
            assert.ok(state && typeof state === 'object', '逐步前后快照存在');
            for (const key of ['jing', 'neili', 'learned_points', 'int'])
                assert.ok(Object.hasOwn(state, key) && state[key] !== undefined, '必需字段存在：' + key);
            assert.ok(state.skills && typeof state.skills === 'object', '必需字段存在：skills');
            assert.ok(state.learned && typeof state.learned === 'object', '必需字段存在：learned');
            assert.ok(state.grants && typeof state.grants === 'object', '必需字段存在：grants');
            assert.ok(state.s1_marks && typeof state.s1_marks === 'object', '必需字段存在：s1_marks');
            if (p.permission_grant)
                assert.ok(Object.hasOwn(state.grants, p.permission_grant), '零许可字段须显式观察');
        }
        if (i > 0) {
            // Adjacent states must chain: no resource resurrection or field edits between steps.
            const prev = steps[i - 1].after, cur = step.before;
            assert.equal(cur.jing, prev.jing, '步间精神连续');
            assert.equal(cur.neili, prev.neili, '步间内力连续');
            assert.equal(cur.learned_points, prev.learned_points, '步间潜能连续');
            assert.deepEqual(cur.skills, prev.skills, '步间技能连续');
            assert.deepEqual(cur.learned, prev.learned, '步间领悟连续');
            assert.deepEqual(cur.grants, prev.grants, '步间许可连续');
            assert.deepEqual(cur.s1_marks, prev.s1_marks, '步间标记连续');
        }
    }
    const skill = p.skill;
    const grant = p.permission_grant;
    const noTeach = steps[0].teacher_no_teach || { kind: 'none' };

    switch (p.variant) {
        case 'string-refusal': {
            assert.equal(noTeach.kind, 'string', '原 no_teach 为字符串拒绝');
            assert.equal(noTeach.value, p.refusal_text, '原拒绝句一致');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(p.refusal_text), '原拒绝句原样送达');
                assertNoProgress(step, [skill]);
                assertGrant(step, grant, 0, 0);
            }
            break;
        }
        case 'exp-threshold-refusal': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(refusalTexts.miaoRefusal), '经验不足拒绝句原样送达');
                assertNoProgress(step, [skill]);
                assertGrant(step, grant, 0, 0);
            }
            break;
        }
        case 'exp-threshold': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(refusalTexts.miaoGrant), '自然取得许可时教师原话送达');
                assertGrant(step, grant, 0, 1);
                assertProgress(step, skill);
            }
            break;
        }
        case 'existing-permission': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(!stepMessages(step).includes(refusalTexts.miaoGrant), '预许可不再重复授予');
                assertGrant(step, grant, 1, 1);
                assertProgress(step, skill);
            }
            break;
        }
        case 'permission-before-skill-refusal': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            for (const step of steps) {
                assert.equal(step.command_accepted, 0, '技能资格拒绝返回原命令失败');
                assert.ok(stepMessages(step).includes(refusalTexts.miaoGrant), '许可先于技能检查授予');
                assert.ok((step.notify_fail || '').includes(refusalTexts.forceRefusal), '原内功火候拒绝句');
                assertGrant(step, grant, 0, 1);
                assertNoProgress(step, [skill]);
            }
            break;
        }
        case 'same-student-repeat': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            assert.equal(steps.length, 2);
            assert.ok(stepMessages(steps[0]).includes(refusalTexts.miaoGrant), '首次自然取得许可');
            assert.ok(!stepMessages(steps[1]).includes(refusalTexts.miaoGrant), '同学生续行不重复授予');
            assertGrant(steps[0], grant, 0, 1);
            assertGrant(steps[1], grant, 1, 1);
            assertProgress(steps[0], skill);
            assertProgress(steps[1], skill);
            break;
        }
        case 'first-callback-refusal': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(refusalTexts.murongFirst), '首次少林禁教原话送达');
                assert.equal(mark(step.before, 'has_asked'), 0, '询问标记前快照 0');
                assert.equal(mark(step.after, 'has_asked'), 1, '询问标记后快照 1');
                assertNoProgress(step, [skill]);
            }
            break;
        }
        case 'repeat': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            assert.equal(steps.length, 2);
            assert.ok(stepMessages(steps[0]).includes(refusalTexts.murongFirst), '首次少林禁教原话送达');
            assert.ok(stepMessages(steps[1]).includes(refusalTexts.murongLater), '后续拒绝句原样送达');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assertNoProgress(step, [skill]);
            }
            assert.equal(mark(steps[0].before, 'has_asked'), 0, '询问标记前快照 0');
            assert.equal(mark(steps[0].after, 'has_asked'), 1, '首次后标记 1');
            assert.equal(mark(steps[1].after, 'has_asked'), 1, '后续保持标记 1');
            break;
        }
        case 'cross-skill-chain': {
            assert.equal(noTeach.kind, 'expression', '原 no_teach 为许可回调');
            assert.equal(steps.length, p.teaching_expectations.length, '六路少林技能完整链');
            assert.ok(stepMessages(steps[0]).includes(refusalTexts.murongFirst), '首次少林禁教原话送达');
            for (const step of steps.slice(1)) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(refusalTexts.murongLater), '跨技能共享询问标记拒绝');
            }
            for (const step of steps) assertNoProgress(step, murongSkills);
            assert.equal(mark(steps[0].before, 'has_asked'), 0, '询问标记前快照 0');
            assert.equal(mark(steps.at(-1).after, 'has_asked'), 1, '询问标记后快照 1');
            break;
        }
        case 'recognize-family-refusal':
        case 'recognize-gender-refusal':
        case 'recognize-exp-refusal': {
            const expectedText = p.variant === 'recognize-family-refusal' ? refusalTexts.daobfFamily
                : p.variant === 'recognize-gender-refusal' ? refusalTexts.daobfGender : refusalTexts.daobfExp;
            assert.equal(noTeach.kind, 'none', '该技能无 no_teach 声明');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(expectedText), '原拜师资格拒绝原话送达');
                assertNoProgress(step, [skill]);
                assert.equal(mark(step.before, 'daobaifeng'), 0, '认徒标记未授予');
                assert.equal(mark(step.after, 'daobaifeng'), 0, '认徒标记仍未授予');
            }
            break;
        }
        case 'recognize-success': {
            assert.equal(noTeach.kind, 'none', '该技能无 no_teach 声明');
            for (const step of steps) {
                assert.equal(step.command_accepted, 1);
                assert.ok(stepMessages(step).includes(refusalTexts.daobfGrant), '原认徒原话送达');
                assert.equal(mark(step.before, 'daobaifeng'), 0, '认徒标记前快照 0');
                assert.equal(mark(step.after, 'daobaifeng'), 1, '认徒标记后快照 1');
                assertProgress(step, skill);
            }
            break;
        }
        default:
            assert.fail('未知 S1 学习变体: ' + p.variant);
    }

    for (let i = 0; i < steps.length; i++)
        assert.equal(steps[i].command_accepted, p.expected_command_results[i], `原命令返回值 ${i}`);
}
