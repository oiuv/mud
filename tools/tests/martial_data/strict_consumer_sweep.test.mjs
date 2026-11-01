// Adversarial mutation sweep for the strict consumers: every fabricated copy
// must be rejected. A mutation that still validates is a consumer gap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { s1LearningConditions, validateS1LearningRecord } from './school_s1_learning_cases.mjs';
import { validateHuashanSchoolDefenseRecord } from './school_huashan_school_defense_cases.mjs';
import { validateSchoolCombatRecord } from './school_combat_cases.mjs';

const read = p => readFileSync(join(root, p), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const s1 = s1LearningConditions(catalog, read);
const s1find = suffix => s1.find(c => c.id.endsWith(suffix));

// ---- S1 builders (mirror school_s1_learning.test.mjs) ----
function s1Snapshot(p, state) {
    const skills = { ...(state.skills ?? p.actor.skills) };
    return {
        grants: { ...(p.permission_grant ? { [p.permission_grant]: state.grant ?? 0 } : {}) },
        skills,
        learned: { ...(state.learned ?? {}) },
        jing: state.jing ?? 10000,
        neili: state.neili ?? 6000,
        learned_points: state.points ?? 0,
        int: 30,
        s1_marks: { has_asked: state.hasAsked ?? 0, daobaifeng: state.daobf ?? 0 },
    };
}

function s1Progress(p, state) {
    const skills = state.skills ?? p.actor.skills;
    const level = skills[p.skill];
    return {
        ...state,
        skills: { ...skills, [p.skill]: level + 1 },
        learned: { ...state.learned, [p.skill]: (state.learned?.[p.skill] ?? 0) + 4 },
        jing: (state.jing ?? 10000) - Math.floor((100 + level * 2) / 30),
        points: (state.points ?? 0) + 1,
    };
}

function s1Step(p, before, after, { i = 0, accepted = 1, notifyFail = '', texts = [], noTeach = { kind: 'expression' } } = {}) {
    return {
        student: '/tests/teaching_actor#1',
        teacher: p.teacher.path + '#2',
        teacher_program: p.teacher.path,
        command: p.teaching_expectations[i].action,
        command_accepted: accepted,
        notify_fail: notifyFail,
        teacher_no_teach: noTeach,
        messages: texts.map(text => ({ category: 'vision', text })),
        before: s1Snapshot(p, before),
        after: s1Snapshot(p, after),
    };
}

function s1Record(variant) {
    const steps = [];
    let outcome, reason = '原教学未增加领悟或学习进度，详见逐步状态及消息';
    if (variant === 'repeat') {
        const p = s1find('miao-chongtian-real-repeat').parameters;
        const first = { grant: 0 };
        const mid = s1Progress(p, { ...first, grant: 1 });
        const end = s1Progress(p, { ...mid });
        steps.push(s1Step(p, first, mid, { texts: ['今日我就传你白鹤冲天掌'] }));
        steps.push(s1Step(p, mid, end, { i: 1 }));
        outcome = 'observed'; reason = '';
    } else if (variant === 'string') {
        const c = s1find('honghua-zhao-taiji-quan-string-refusal');
        const p = c.parameters;
        steps.push(s1Step(p, {}, {}, { texts: [p.refusal_text], noTeach: { kind: 'string', value: p.refusal_text } }));
        outcome = 'refused';
    } else if (variant === 'exp100001') {
        const p = s1find('miao-chongtian-exp100001').parameters;
        const before = { grant: 0 };
        const after = s1Progress(p, { ...before, grant: 1 });
        steps.push(s1Step(p, before, after, { texts: ['今日我就传你白鹤冲天掌'] }));
        outcome = 'observed'; reason = '';
    } else {
        const p = s1find('duan-daobf-feifeng-bian-success').parameters;
        const before = { daobf: 0 };
        const after = { ...s1Progress(p, before), daobf: 1 };
        steps.push(s1Step(p, before, after, { texts: ['今日我就教你好了'], noTeach: { kind: 'none' } }));
        outcome = 'observed'; reason = '';
    }
    return { teaching: steps, outcome, reason, before: [{ object: '/tests/teaching_actor#1' }] };
}

function sweep(name, build, validate, mutations) {
    test(name, () => {
        validate(build());
        for (const [label, mutate] of mutations) {
            const wrong = structuredClone(build());
            mutate(wrong);
            assert.throws(() => validate(wrong), undefined, label);
        }
    });
}

const s1Mutations = [
    ['逐步记录数', r => { r.teaching.pop(); }],
    ['计划原命令', r => { r.teaching[0].command = 'look'; }],
    ['计划原命令', r => { r.teaching[0].command = 'learn someone else skill 1'; }],
    ['真实学生角色', r => { for (const s of r.teaching) s.student = '/tests/actor#1'; }],
    ['原教师程序', r => { r.teaching[0].teacher_program = '/kungfu/class/other'; }],
    ['原教师实例', r => { r.teaching[0].teacher = '/kungfu/class/other#1'; }],
    ['原命令返回值', r => { r.teaching[0].command_accepted = 0; }],
    ['学习进度增长', r => {
        const s = r.teaching[0];
        s.after.skills = { ...s.before.skills }; s.after.learned = {};
    }],
    ['精神支出为原公式费用', r => { r.teaching[0].after.jing = r.teaching[0].before.jing; }],
    ['潜能支出一次', r => { r.teaching[0].after.learned_points = r.teaching[0].before.learned_points; }],
    ['内力不支出', r => { r.teaching[0].after.neili = r.teaching[0].before.neili - 1; }],
    ['许可后快照', r => {
        const s = r.teaching[0];
        if (s.after.grants && Object.keys(s.after.grants).length) s.after.grants[Object.keys(s.after.grants)[0]] = 0;
        else s.after.s1_marks.daobaifeng = 0;
    }],
    ['精神支出为原公式费用', r => { r.teaching[0].before.int = 15; }],
    ['真实对象', r => { r.before[0].object = '/tests/teaching_actor#42'; }],
    ['零许可字段', r => {
        const g = r.teaching[0].before.grants;
        delete g[Object.keys(g)[0]];
    }],
    ['必需字段', r => { delete r.teaching[0].after.jing; }],
];

sweep('S1：单步变体伪造副本一律拒绝', () => s1Record('exp100001'),
    r => validateS1LearningRecord(r, s1find('miao-chongtian-exp100001')), s1Mutations);

sweep('S1：字符串拒绝变体伪造副本一律拒绝', () => s1Record('string'),
    r => validateS1LearningRecord(r, s1find('honghua-zhao-taiji-quan-string-refusal')), [
        ['原拒绝句', r => { r.teaching[0].messages = []; }],
        ['原 no_teach 为字符串拒绝', r => { r.teaching[0].teacher_no_teach = { kind: 'expression' }; }],
        ['逐步记录数', r => { r.teaching.push(structuredClone(r.teaching[0])); }],
        ['真实学生角色', r => { r.teaching[0].student = '/tests/actor#1'; }],
    ]);

sweep('S1：续行/认徒变体伪造副本一律拒绝', () => s1Record('repeat'),
    r => validateS1LearningRecord(r, s1find('miao-chongtian-real-repeat')), [
        ['逐步记录数', r => { r.teaching.pop(); }],
        ['计划原命令', r => { r.teaching[1].command = 'look'; }],
        ['计划原命令', r => { r.teaching[1].command = 'learn miao renfeng chongtian-zhang 3'; }],
        ['步间标记连续', r => { r.teaching[1].before.s1_marks.has_asked = 1; }],
        ['精神支出为原公式费用', r => { r.teaching[1].after.jing = r.teaching[1].before.jing - 999; }],
        ['学习进度增长', r => { r.teaching[1].after.learned = {}; r.teaching[1].after.skills = { ...r.teaching[1].before.skills }; }],
        ['同一学生续行', r => { r.teaching[1].student = '/tests/teaching_actor#7'; }],
    ]);

sweep('S1：认徒成功变体伪造副本一律拒绝', () => s1Record('success'),
    r => validateS1LearningRecord(r, s1find('duan-daobf-feifeng-bian-success')), [
        ['认徒标记后快照', r => { r.teaching[0].after.s1_marks.daobaifeng = 0; }],
        ['原认徒原话送达', r => { r.teaching[0].messages = []; }],
        ['该技能无 no_teach 声明', r => { r.teaching[0].teacher_no_teach = { kind: 'string', value: 'x' }; }],
        ['学习进度增长', r => { r.teaching[0].after.learned = {}; r.teaching[0].after.skills = { ...r.teaching[0].before.skills }; }],
    ]);

// ---- recast builders (mirror school_huashan_duration.test.mjs) ----
function baseSnapshot(config, tempApply) {
    return {
        ...config.properties,
        skills: { ...config.skills },
        mappings: { ...config.mappings },
        preparations: {},
        temp: { apply: { ...tempApply } },
    };
}

function recastRecord(ability = 'powerup', level = 200) {
    const windowCost = ability === 'powerup' ? 100 : 200;
    const fields = ability === 'powerup' ? ['attack', 'defense'] : ['damage', 'sword'];
    const buff = ability === 'powerup' ? Math.floor(level / 3) : Math.floor(level / 10);
    const p = recastCondition(ability, level).parameters;
    const before = [baseSnapshot(p.actor, { damage: 50 }), baseSnapshot(p.target, {})];
    const immediate = structuredClone(before);
    immediate[0].neili -= windowCost; immediate[0].temp[ability] = 1;
    for (const key of fields) immediate[0].temp.apply[key] = (before[0].temp.apply[key] ?? 0) + buff;
    const afterFirst = structuredClone(immediate); delete afterFirst[0].temp[ability];
    for (const key of fields) afterFirst[0].temp.apply[key] = before[0].temp.apply[key] ?? 0;
    const after = structuredClone(afterFirst);
    after[0].neili = immediate[0].neili - windowCost;
    const record = {
        kind: 'sample', method: 'exert', outcome: 'observed', reason: '',
        before, immediate, after: structuredClone(after),
        launches: [{ skill: 'zixia-shengong' }, { skill: 'zixia-shengong' }],
        metrics: [{ neili_cost: 2 * windowCost }, {}], elapsed: 2 * (level + 2) + 0.2,
        callbacks: [
            { side: 0, phase: 'before', elapsed: level + 0.1, state: structuredClone(immediate[0]) },
            { side: 0, phase: 'after', elapsed: level + 0.11, state: structuredClone(afterFirst[0]) },
        ],
        active_repeat: {
            accepted: 0, notify_fail: ability === 'powerup' ? '你已经在运功中了。' : '你已经在运起紫气东来了。',
            before: [structuredClone(immediate[0]), structuredClone(immediate[1])],
            after: [structuredClone(immediate[0]), structuredClone(immediate[1])],
        },
        recast: { accepted: 1, before: structuredClone(afterFirst), immediate: (() => {
            const rel = structuredClone(afterFirst);
            rel[0].neili -= windowCost; rel[0].temp[ability] = 1;
            for (const key of fields) rel[0].temp.apply[key] = (before[0].temp.apply[key] ?? 0) + buff;
            return rel;
        })() },
    };
    record.callbacks.push({ side: 0, phase: 'before', elapsed: 2 * level + 1, state: structuredClone(record.recast.immediate[0]) },
        { side: 0, phase: 'after', elapsed: 2 * level + 1.01, state: structuredClone(record.after[0]) });
    return record;
}

function recastCondition(ability, level) {
    return { id: `school-huashan-recast-${ability}-l${level}`, method: 'exert',
        parameters: { school: 'huashan', family: '华山派', collection_group: 'huashan-duration',
            combination: 'qizong', ability, level, observation: 'timed_effect',
            recast_after_expiry: 1, fighting: false,
            actor: { skills: { 'zixia-shengong': level }, mappings: { force: 'zixia-shengong' },
                properties: { neili: 6000, max_neili: 6000 }, equipment: { type: 'sword', hold: false } },
            target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 }, mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
            action: 'exert ' + ability, observe_seconds: level + 2, not_applicable: '',
            expected: 'observed', effect_expected: ability } };
}

function sweepCondition(name, build, condition, mutations) {
    test(name, () => {
        validateSchoolCombatRecord(build(), condition);
        for (const [label, mutate] of mutations) {
            const wrong = structuredClone(build());
            mutate(wrong);
            assert.throws(() => validateSchoolCombatRecord(wrong, condition), undefined, label);
        }
    });
}

const recastMutations = [
    ['活跃期重施按原活跃闸口拒绝', r => { r.active_repeat.accepted = 1; }],
    ['活跃期重施为原拒绝句', r => { r.active_repeat.notify_fail = '其他'; }],
    ['活跃期重施不改变原增量', r => { const a = r.active_repeat.after[0].temp.apply; a.attack = (a.attack ?? 0) + 1; a.damage = (a.damage ?? 0) + 1; }],
    ['活跃期重施不扣费', r => { r.active_repeat.after[0].neili -= 1; }],
    ['活跃期重施按原活跃闸口拒绝', r => { delete r.active_repeat.before[0].temp.powerup; delete r.active_repeat.before[0].temp.ziqi; }],
    ['到期后再次施放被原闸口受理', r => { r.recast.accepted = 0; }],
    ['第二窗回调', r => { r.callbacks.splice(2, 1); }],
    ['仅两次原施放', r => { r.launches.pop(); }],
    ['两次原费用', r => { r.metrics[0].neili_cost = 100; }],
    ['第二窗须经原级数计时', r => { r.callbacks[2].elapsed = r.callbacks[1].elapsed + 1; }],
    ['重施按原增量重新生效', r => { const a = r.recast.immediate[0].temp.apply; a.attack = (a.attack ?? 0) + 1; a.damage = (a.damage ?? 0) + 1; }],
    ['重施再扣原费用', r => { r.recast.immediate[0].neili += 1; }],
    ['到期后须恢复原属性', r => { const a = r.recast.before[0].temp.apply; a.attack = (a.attack ?? 0) + 1; a.damage = (a.damage ?? 0) + 1; }],
    ['第二窗增益标记必须由原回调清除', r => { r.after[0].temp.powerup = 1; r.after[0].temp.ziqi = 1; }],
    ['解除不额外扣费或退还内力', r => { r.after[0].neili += 1; }],
    ['轮次不得撤回原增益增量', r => { const a = r.immediate[0].temp.apply; a.attack = (a.attack ?? 0) - 1; a.damage = (a.damage ?? 0) - 1; }],
    ['双窗原计时不缩时', r => { r.elapsed = 10; }],
    ['回调开始前仍保持增益', r => { delete r.callbacks[0].state.temp.powerup; delete r.callbacks[0].state.temp.ziqi; }],
];

sweepCondition('华山重施：伪造副本一律拒绝（powerup）', () => recastRecord('powerup', 200),
    recastCondition('powerup', 200), recastMutations);
sweepCondition('华山重施：伪造副本一律拒绝（ziqi）', () => recastRecord('ziqi', 400),
    recastCondition('ziqi', 400), recastMutations);

// ---- school defense builders (mirror school_huashan_school_defense.test.mjs) ----
function defenseRecord(type = 'sword', level = 400) {
    const buff = Math.floor(level / 3);
    const p = defenseCondition(type, level).parameters;
    const before = [
        { ...baseSnapshot(p.actor, {}), weapon: type,
            weapon_details: type === 'none' ? {} : { program: '/tests/' + type }, busy: 0 },
        { ...baseSnapshot(p.target, { armor: 100 }), weapon: 'sword',
            weapon_details: { program: '/tests/sword' }, busy: 0 },
    ];
    const preBefore = structuredClone(before);
    const preAfter = structuredClone(before);
    preAfter[1].neili -= 100; preAfter[1].temp.powerup = 1;
    preAfter[1].temp.apply.attack = buff; preAfter[1].temp.apply.defense = buff;
    return {
        kind: 'sample', method: 'ordinary', outcome: 'observed', reason: '',
        before, immediate: structuredClone(preAfter), after: structuredClone(preAfter),
        launches: [{ skill: 'zixia-shengong', argument: 'powerup' }],
        interfaces: [], metrics: [{}, {}], elapsed: 0.2,
        powerup: { action: 'exert powerup', actor_side: 1, accepted: 1, before: preBefore, after: preAfter },
        attacks: [{ actor: 0, target: 1, type: 0, result: 1 }],
        defenses: [], passives: [], refusals: [], dropped: [],
        dodge_checks: [
            { actor: 0, target: 1, type: 0, phase: 'base', skill: 'huashan-shenfa', ap: 1, dp: 1, busy: null },
            { actor: 0, target: 1, type: 0, phase: 'settled', skill: 'huashan-shenfa', ap: 1, dp: 1, busy: null },
        ],
    };
}

function defenseCondition(type, level) {
    return { id: `school-huashan-school-defense-${type}-l${level}`, method: 'ordinary',
        parameters: { school: 'huashan', family: '华山派', collection_group: 'huashan-school-defense',
            level, attack_type: type, observation: 'single_action_immediate', school_defense_prelude: 1,
            actor: { skills: { force: 600 }, mappings: {}, preparations: {}, properties: { neili: 6000, max_neili: 6000 },
                ...(type === 'none' ? {} : { equipment: { type, hold: false } }) },
            target: { skills: { 'zixia-shengong': level }, mappings: { sword: 'huashan-jian', force: 'zixia-shengong', dodge: 'huashan-shenfa', parry: 'huashan-jian' },
                preparations: {}, properties: { neili: 6000, max_neili: 6000, 'family/family_name': '华山派' }, equipment: { type: 'sword', hold: false } },
            action: 'ordinary', fighting: true, observe_seconds: 0, not_applicable: '',
            expected: 'observed' } };
}

const defenseMutations = [
    ['原增益前置步骤', r => { delete r.powerup; }],
    ['原增益执行方为右方防守者', r => { r.powerup.actor_side = 0; }],
    ['原增益前置受理', r => { r.powerup.accepted = 0; }],
    ['原增益前置增量', r => { r.powerup.after[1].temp.apply.attack += 1; }],
    ['原增益前置扣费100', r => { r.powerup.after[1].neili += 1; }],
    ['前置不改进攻方属性', r => { r.powerup.after[0].temp.apply.armor = 1; }],
    ['增益标记不得落在进攻方', r => { r.immediate[0].temp.powerup = 1; }],
    ['仅原增益前置一次发动', r => { r.launches.pop(); }],
    ['原常规攻击轮', r => { r.attacks = []; }],
    ['原轻功判定轨迹不得缺失', r => { r.dodge_checks = []; }],
    ['原华山身法判定', r => { r.dodge_checks[0].skill = 'other'; }],
    ['base', r => { r.dodge_checks[0].phase = 'settled'; r.dodge_checks[1].phase = 'base'; }],
    ['轮次不得撤回原增益增量', r => { r.immediate[1].temp.apply.attack -= 1; }],
    ['增益窗口未到期', r => { r.after[1].temp.powerup = 0; }],
    ['装备初始化类别不符', r => { r.before[0].weapon = 'blade'; }],
    ['原剑', r => { r.before[1].weapon = 'none'; }],
    ['映射', r => { r.before[1].mappings.dodge = 'other'; }],
];

sweepCondition('华山门派防御：伪造副本一律拒绝（sword）', () => defenseRecord('sword', 400),
    defenseCondition('sword', 400), defenseMutations);
sweepCondition('华山门派防御：伪造副本一律拒绝（none）', () => defenseRecord('none', 200),
    defenseCondition('none', 200), defenseMutations);
