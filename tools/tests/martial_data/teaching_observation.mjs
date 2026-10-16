// Validate observed state, not ask's return value or a success-looking message.
// Fake records test this reader; only the shared runner supplies real samples.
import assert from 'node:assert/strict';
import { validateFengObservation } from './feng_teaching_cases.mjs';
import { validateRecruitObservation } from './recruit_observation.mjs';
import { validatePromotionObservation } from './promotion_observation.mjs';
import { validateTonsureObservation } from './tonsure_observation.mjs';
import { validateFormationObservation } from './formation_observation.mjs';
import { validateChallengeObservation, validateChallengeRecord } from './challenge_observation.mjs';
import { gumuEffectiveAttribute } from './school_gumu_cultivation_cases.mjs';
import { validateGumuSpecialTeachingRecord } from './gumu_special_teaching_cases.mjs';
import { validateGumuAcquisitionLearningRecord } from './gumu_acquisition_learning_cases.mjs';
import { validateGumuItemAcquisitionRecord } from './gumu_item_acquisition_cases.mjs';
import { validateGumuRecruitRecord } from './gumu_recruit_cases.mjs';
import { validateTaohuaLearningRecord } from './school_taohua_learning_cases.mjs';

function state(value, grants) {
    assert.ok(value && typeof value === 'object', '教学状态缺失');
    for (const key of ['contribution', 'jing', 'neili', 'max_neili', 'effective_force', 'effective_dodge', 'shen', 'str',
        'max_jingli', 'potential', 'learned_points']) {
        assert.ok(Number.isSafeInteger(value[key]), '教学数值缺失：' + key);
    }
    for (const key of ['grants', 'skills', 'learned', 'mappings']) {
        assert.ok(value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]),
            '教学映射缺失：' + key);
    }
    for (const key of grants) assert.ok(Number.isSafeInteger(value.grants[key]), '领悟观察缺失：' + key);
    for (const field of ['skills', 'learned']) for (const v of Object.values(value[field])) {
        assert.ok(Number.isSafeInteger(v), '技能等级/进度不是实际整数');
    }
}

export function validateTeachingObservation(steps, condition) {
    const p = condition.parameters;
    const acquisition = p.teaching_profile === 'gumu-acquisition-learning';
    assert.equal(condition.method, 'teaching');
    assert.ok(Array.isArray(p.teaching_expectations) && p.teaching_expectations.length > 0,
        '逐步授课预期缺失');
    assert.ok(Array.isArray(steps) && steps.length === p.teaching_expectations.length, '实际询问次数不完整');
    if (p.teaching_profile === 'feng') return validateFengObservation(steps, condition);
    if (['shaolin-recruit', 'emei-recruit'].includes(p.teaching_profile)) return validateRecruitObservation(steps, condition);
    if (p.teaching_profile === 'shaolin-promotion') return validatePromotionObservation(steps, condition);
    if (['shaolin-tonsure', 'emei-tonsure'].includes(p.teaching_profile)) return validateTonsureObservation(steps, condition);
    if (p.teaching_profile === 'shaolin-formation') return validateFormationObservation(steps, condition);
    if (p.teaching_profile === 'shaolin-challenge') return validateChallengeObservation(steps, condition);
    const summaries = [];
    const completeAt = p.grant_completion_value ?? 1;
    assert.ok(Number.isSafeInteger(completeAt) && completeAt > 0, '领悟完成层数无效');
    let previous;
    for (const [i, step] of steps.entries()) {
        const expected = p.teaching_expectations[i];
        const teacher = expected.teacher ?? p.teacher;
        const introductory = p.teaching_kind === 'introductory_teaching';
        const letter = p.teaching_kind === 'letter_teaching';
        if (expected.teacher) {
            assert.ok(introductory || letter, '跨教师询问必须属于已核对的入门或书信教学');
            assert.equal(expected.teaching_entry?.path, teacher.path.slice(1) + '.c', '后续教师与函数来源不符');
            assert.equal(expected.teaching_entry.sha256, teacher.sha256, '后续教师版本不符');
            assert.ok(p.qualification_evidence.some(s => s.path === expected.teaching_entry.path
                && s.sha256 === teacher.sha256), '后续教师缺少源码证据');
        }
        const commandKind = expected.command_kind ?? (expected.offer ? 'give' : 'ask');
        const ordinaryProfile = ['quanzhen', 'wudang', 'shaolin-luohan', 'shaolin-teachers', 'emei-teachers', 'gumu-teachers'].includes(p.teaching_profile);
        assert.ok(['ask', 'give', 'learn'].includes(commandKind), '未支持的教学命令');
        if (commandKind === 'learn') assert.equal(p.teaching_kind, 'ordinary_learning');
        assert.equal(step.teacher_program, teacher.path, '教师来源不符');
        assert.match(step.teacher, new RegExp('^' + teacher.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '#\\d+$'));
        assert.equal(step.command, expected.action ?? p.action, '未使用原教学交互命令');
        assert.ok(step.command.startsWith(commandKind + ' '), '教学交互类型不符');
        assert.equal(step.command_accepted, expected.command_accepted ?? 1, '教学命令受理状态不符');
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= 0, '询问耗时缺失');
        state(step.before, p.monitored_grants); state(step.after, p.monitored_grants);
        if (commandKind === 'learn') {
            for (const field of ['con', 'int', 'character']) {
                assert.equal(step.before[field], p.actor.properties[field], '学习资质初值不符：' + field);
                assert.equal(step.after[field], step.before[field], '学习改变先天资质：' + field);
            }
            assert.equal(step.before.effective_int, p.actor.properties.int
                + (ordinaryProfile ? Math.trunc((step.before.skills.literate ?? 0) / 10) : 0),
                '普通学习纳入识字加成，无转世或临时悟性加成');
            if (ordinaryProfile) {
                assert.equal(step.teacher_skills?.[p.skill], p.teacher_level, '真实NPC的目标技能等级不符');
                if (['quanzhen', 'shaolin-luohan', 'emei-teachers', 'gumu-teachers'].includes(p.teaching_profile))
                    assert.deepEqual(p.monitored_grants, [], '本组普通学习不注入或模拟教学许可');
                for (const key of ['max_neili', 'max_jingli', 'mappings', 'shen', 'str'])
                    assert.deepEqual(step.after[key], step.before[key], '普通学习改变未声明状态：' + key);
            }
        }
        if (Object.hasOwn(p.actor.properties, 'family/beggarlvl')) {
            assert.equal(step.before.beggarlvl, p.actor.properties['family/beggarlvl'], '初始袋数与条件不同');
            assert.equal(step.after.beggarlvl, step.before.beggarlvl, '询问改变了袋数');
        }
        // Only new conditions requesting these measurements require them;
        // older frozen evidence did not expose these fields and stays readable.
        for (const property of p.unchanged_properties ?? []) {
            assert.ok(['combat_exp', 'score'].includes(property), '未支持的教学观察属性');
            assert.ok(Number.isSafeInteger(step.before[property]), '教学属性观察缺失：' + property);
            assert.equal(step.before[property], p.actor.properties[property], '教学初始属性不符：' + property);
            assert.equal(step.after[property], step.before[property], '教学改变了只作门槛的属性：' + property);
        }
        if (previous) {
            assert.deepEqual(step.before, previous.after, '重复询问之间状态被重置或注入');
            assert.equal(step.student, previous.student, '重复询问换了学生');
            if (step.teacher_program === previous.teacher_program)
                assert.equal(step.teacher, previous.teacher, '重复询问换了教师');
            else assert.ok(expected.teacher, '未经配置换了教师');
        } else {
            assert.equal(step.before.contribution, p.actor.properties.gongxian, '初始贡献与条件不同');
            for (const key of p.monitored_grants) {
                const initial = acquisition && key === 'can_learn/yunv-xinjing/wall'
                    ? p.actor.properties[key] ?? 0 : 0;
                assert.ok(initial === 0 || initial === 1, '初始口诀许可必须属于冻结条件');
                assert.equal(step.before.grants[key], initial, '不允许预写未声明领悟');
            }
            assert.equal(step.before.family, p.actor.properties['family/family_name']);
            if (Object.hasOwn(p.actor.properties, 'family/master_id')) {
                assert.equal(step.before.master_id, p.actor.properties['family/master_id']);
            }
            for (const [field, property] of [['master_name', 'family/master_name'], ['reborn_family', 'reborn/family_name']]) {
                if (Object.hasOwn(p.actor.properties, property)) {
                    assert.equal(step.before[field], p.actor.properties[property], '初始师承与条件不同：' + property);
                }
            }
            for (const [key, value] of Object.entries(p.actor.skills)) {
                assert.equal(step.before.skills[key], value, '初始技能与条件不同：' + key);
            }
            assert.deepEqual(step.before.mappings, p.actor.mappings);
            const effective = id => Math.trunc((p.actor.skills[id] ?? 0) / 2)
                + (p.actor.skills[p.actor.mappings[id]] ?? 0);
            assert.equal(step.before.effective_force, effective('force'));
            if (Object.hasOwn(p.actor.skills, 'dodge')) {
                // Standard fixture whip weighs 3000: inherit/misc/equip.c setup
                // contributes -1 dodge through the original equipment pipeline.
                const equipmentDodge = (['quanzhen', 'shaolin-luohan', 'shaolin-teachers'].includes(p.teaching_profile)
                    && ['whip', 'club', 'blade'].includes(p.actor.equipment?.type)
                    || p.teaching_profile === 'gumu-teachers' && ['sword', 'whip'].includes(p.actor.equipment?.type)) ? -1 : 0;
                assert.equal(step.before.effective_dodge, effective('dodge') + equipmentDodge,
                    '初始有效轻功与条件不同');
            }
            if (Object.hasOwn(p.actor.properties, 'dex')) {
                // These source-pinned cases have no tattoo, reborn or temporary
                // bonuses. Raw dodge, not effective dodge, contributes dexterity.
                assert.equal(step.before.dex, p.actor.properties.dex, '初始先天身法与条件不同');
                assert.equal(step.before.effective_dex,
                    p.actor.properties.dex + Math.trunc((p.actor.skills.dodge ?? 0) / 10),
                    '初始有效身法与条件不同');
            }
            if (p.teaching_profile !== 'gumu-teachers' || Object.hasOwn(p.actor.properties, 'shen'))
                assert.equal(step.before.shen, p.actor.properties.shen);
            assert.equal(step.before.str, p.actor.properties.str);
            for (const key of ['neili', 'max_neili']) if (Object.hasOwn(p.actor.properties, key)) {
                assert.equal(step.before[key], p.actor.properties[key], '初始内力与条件不同：' + key);
            }
            for (const key of ['max_jingli', 'potential', 'learned_points']) {
                if (Object.hasOwn(p.actor.properties, key)) {
                    assert.equal(step.before[key], p.actor.properties[key], '初始教学资源与条件不同：' + key);
                }
            }
        }
        if (expected.grant !== undefined)
            assert.equal(step.after.grants[expected.grant], expected.value, '实际领悟不同于原源码预期');
        else assert.ok(ordinaryProfile && commandKind === 'learn' || acquisition,
            '授课领悟观察缺失');
        for (const key of expected.absent_grants ?? []) {
            assert.equal(step.after.grants[key], 0, '测试不得悄悄纠正错误领悟');
        }
        for (const key of Object.keys(expected.grants_after ?? {})) {
            assert.ok(p.monitored_grants.includes(key), '许可变化未纳入观察');
            assert.ok(expected.offer && key.startsWith('can_learn/')
                || introductory && /^(can_learn|can_perform)\//.test(key), '额外写入必须是已核对的教学许可或领悟');
            assert.equal(step.after.grants[key], expected.grants_after[key], '交书许可写入不完整或不符');
        }
        for (const key of p.monitored_grants) if (key !== expected.grant) {
            if (Object.hasOwn(expected.grants_after ?? {}, key)) continue;
            assert.equal(step.after.grants[key], step.before.grants[key], '非目标领悟被改写：' + key);
        }
        for (const key of ['family', 'master_id', 'master_name', 'reborn_family']) {
            assert.deepEqual(step.after[key], step.before[key], '询问改变了师承状态：' + key);
        }
        for (const [expectedField, observedState, observedField] of [
            ['skills_before', 'before', 'skills'], ['skills_after', 'after', 'skills'],
            ['learned_after', 'after', 'learned'],
        ]) {
            for (const [skill, value] of Object.entries(expected[expectedField] ?? {})) {
                assert.equal(step[observedState][observedField][skill], value,
                    '连续教学技能状态不符：' + expectedField + '/' + skill);
            }
        }
        for (const skill of expected.absent_skills ?? []) {
            assert.equal(step.before.skills[skill] ?? 0, 0, '询问前不应已学会目标技能');
            assert.equal(step.after.skills[skill] ?? 0, 0, '许可不得当作直接学会技能');
        }
        const contribution = step.before.contribution - step.after.contribution;
        assert.equal(contribution, expected.contribution_spent, '贡献扣除与原规则不同');
        if (p.teaching_profile === 'emei-special') {
            assert.deepEqual(step.after.skills, expected.skills_after, '风陵奖励等级或未声明技能变化不符');
            assert.deepEqual(step.after.learned, expected.learned_after, '风陵奖励进度或未声明进度变化不符');
            for (const key of ['neili', 'max_neili', 'max_jingli', 'potential', 'learned_points',
                'mappings', 'shen', 'str'])
                assert.deepEqual(step.after[key], step.before[key], '风陵询问改变未声明资源：' + key);
        }
        if (p.teaching_profile === 'shaolin-teachers') {
            if (!previous) assert.deepEqual(step.before.shaolin_flags, { wuming: 0, kongjian: 0 }, '不预设少林认可');
            assert.deepEqual(step.after.shaolin_flags, expected.shaolin_flags, '原少林认可标记不符');
        }
        if (p.teaching_profile === 'wudang' && commandKind === 'ask'
            || p.teaching_profile === 'shaolin-teachers' && commandKind === 'give') {
            assert.deepEqual(step.after.skills, { ...step.before.skills, ...expected.skills_after },
                '九阳询问改变未声明技能');
            assert.deepEqual(step.after.learned, { ...step.before.learned, ...expected.learned_after },
                '九阳询问改变未声明进度');
            for (const key of ['neili', 'max_neili', 'max_jingli', 'mappings', 'shen', 'str'])
                assert.deepEqual(step.after[key], step.before[key], '九阳询问改变未声明属性：' + key);
        }
        if (introductory) {
            assert.equal(commandKind, 'ask');
            if (acquisition) {
                assert.equal(step.after.balance, step.before.balance, '口诀或初授不改变存款');
            } else {
                for (const value of [step.before.balance, step.after.balance, expected.balance_spent])
                    assert.ok(Number.isSafeInteger(value), '存款观察或扣费预期缺失');
                if (!previous) assert.equal(step.before.balance, p.actor.properties.balance, '初始存款不符');
                assert.equal(step.before.balance - step.after.balance, expected.balance_spent, '存款扣除不符');
            }
            assert.deepEqual(step.after.skills, { ...step.before.skills, ...expected.skills_after },
                '入门技能写入或原等级变化不符');
            assert.deepEqual(step.after.learned, step.before.learned, '入门设置等级不应改学习进度');
            for (const key of ['neili', 'max_neili', 'max_jingli', 'potential', 'learned_points',
                'shen', 'str', 'mappings']) assert.deepEqual(step.after[key], step.before[key], '入门修改未声明属性：' + key);
        }
        const jing = step.before.jing - step.after.jing;
        let itemAcquired = false;
        if (letter) {
            assert.ok(!expected.offer && !step.offered_item, '书信只能通过原询问取得，不得注入');
            assert.deepEqual(p.tracked_item, { path: '/clone/special/sjmletter', id: 'sjm letter' });
            for (const boundary of ['before', 'after']) {
                const wanted = expected['item_' + boundary], actual = step['item_' + boundary];
                assert.ok(['absent', 'student', 'teacher'].includes(wanted), '书信预期缺失');
                assert.deepEqual(actual, wanted === 'absent'
                    ? { exists: 0, object: '', program: '', holder: '', clone: 0 }
                    : { exists: 1, object: p.tracked_item.path, program: p.tracked_item.path,
                        holder: wanted === 'teacher' ? step.teacher : step.student, clone: 0 }, '书信身份或持有者不符：' + boundary);
            }
            if (previous) assert.deepEqual(step.item_before, previous.item_after, '书信在步骤之间被替换或注入');
            else assert.equal(step.item_before.exists, 0, '不得预先提供书信');
            itemAcquired = step.item_after.holder === step.student && step.item_before.holder !== step.student;
            assert.equal(step.after.neili, step.before.neili, '领信交信不扣内力');
            if (commandKind === 'give') assert.equal(jing, 0, '原交信不扣精神');
            else { assert.equal(commandKind, 'ask'); assert.ok(jing >= 10 && jing <= 19, '原 ask 精神扣除未观察到'); }
        } else if (commandKind === 'learn') {
            assert.ok(!step.offered_item, '普通学习不得夹杂交书');
            assert.equal(jing, expected.jing_spent, '原学习精神扣除不符');
            assert.equal(step.after.neili, step.before.neili, '原学习不扣内力');
            // Every changed field is reviewed; a permit alone cannot excuse
            // unrelated skill writes or an absent actual learning increment.
            const skills = { ...step.before.skills, ...expected.skills_after };
            assert.deepEqual(step.after.skills, skills, '实际学习等级或未声明技能变化不符');
            const learned = { ...step.before.learned, ...expected.learned_after };
            for (const [skill, bounds] of Object.entries(expected.learning_progress ?? {})) {
                const delta = (step.after.learned[skill] ?? 0) - (step.before.learned[skill] ?? 0);
                assert.ok(delta >= bounds[0] && delta <= bounds[1], '实际学习进度不在原公式范围内');
                learned[skill] = step.after.learned[skill];
            }
            assert.deepEqual(step.after.learned, learned, '实际学习进度或未声明进度变化不符');
        } else if (expected.offer) {
            assert.equal(jing, 0, '原交书不扣精神');
            assert.equal(step.after.neili, step.before.neili, '原交书不扣内力');
            const item = step.offered_item;
            assert.ok(item, '交书缺少物品观察');
            assert.equal(item.program, expected.offer.path, '所交秘籍来源不符');
            assert.equal(item.object, expected.offer.path, '须使用原唯一秘籍而非替身或克隆');
            assert.equal(item.clone, 0, '唯一秘籍不是克隆');
            assert.equal(item.holder_before, step.student, '交书前物品不在学生身上');
            assert.equal(item.exists_after, expected.offer.consumed ? 0 : 1, '秘籍消耗状态不符');
            assert.equal(item.holder_after, expected.offer.consumed ? '' : step.student, '拒收秘籍没有留在学生身上');
        } else {
            assert.ok(!step.offered_item, '询问不得夹杂未声明的交书');
            if (acquisition && step.before.jing < 30)
                assert.equal(jing, 0, '原 ask 精神不足时不调用业务且不扣精神');
            else assert.ok(jing >= 10 && jing <= 19, '原 ask 精神扣除未观察到或夹杂其他行为');
        }
        assert.equal(step.message_scope, 'receive_message_apply_input_not_full_transcript');
        assert.ok(Array.isArray(step.messages), '消息观察缺失');
        for (const message of step.messages) {
            assert.equal(typeof message.category, 'string'); assert.equal(typeof message.text, 'string');
        }
        if (expected.response_contains) {
            assert.ok(step.messages.some(m => m.text.includes(expected.response_contains)), '未观察到对应拒绝原因');
        }
        const beforeGrant = expected.grant === undefined ? 0 : step.before.grants[expected.grant];
        const afterGrant = expected.grant === undefined ? 0 : step.after.grants[expected.grant];
        const skillAdvanced = (commandKind === 'learn' || acquisition) && ['skills', 'learned'].some(field =>
            Object.entries(step.after[field]).some(([key, value]) => value > (step.before[field][key] ?? 0)));
        const acquisitionBefore = !acquisition ? 0 : p.acquisition === 'initial_skill'
            ? step.before.skills[p.skill] ?? 0 : step.before.grants['can_learn/yunv-xinjing/wall'];
        const acquisitionAfter = !acquisition ? 0 : p.acquisition === 'initial_skill'
            ? step.after.skills[p.skill] ?? 0 : step.after.grants['can_learn/yunv-xinjing/wall'];
        const advanced = afterGrant > beforeGrant || skillAdvanced || itemAcquired
            || acquisition && acquisitionAfter > acquisitionBefore;
        const acquired = acquisition ? acquisitionBefore === 0 && acquisitionAfter > 0
            : beforeGrant < completeAt && afterGrant >= completeAt;
        if (Object.hasOwn(expected, 'learned_points_spent')) {
            assert.equal(step.after.learned_points - step.before.learned_points,
                expected.learned_points_spent, '潜能学习点支出与原规则不同');
            assert.equal(step.after.potential, step.before.potential, '传授错误地改变总潜能');
        }
        if (!(expected.may_improve_skills ?? advanced)) {
            assert.deepEqual(step.after.skills, step.before.skills, '未传授却改变技能等级');
            assert.deepEqual(step.after.learned, step.before.learned, '未传授却改变学习进度');
        }
        if (expected.reward_skill) {
            const skill = expected.reward_skill;
            assert.ok(step.after.skills[skill] !== step.before.skills[skill]
                || step.after.learned[skill] !== step.before.learned[skill], '未观察到技能奖励：' + skill);
        }
        summaries.push({ command_kind: commandKind, acquired, advanced,
            already_known: acquisition ? acquisitionBefore > 0 : beforeGrant >= completeAt,
            ...(letter ? { item_acquired: itemAcquired } : {}),
            grant_before: beforeGrant, grant_after: afterGrant,
            complete: acquisition ? acquisitionAfter > 0 : afterGrant >= completeAt,
            ...(commandKind === 'learn' || acquisition ? { skill_advanced: skillAdvanced,
                permission_advanced: acquisition ? p.acquisition === 'wall_permission'
                    && acquisitionAfter > acquisitionBefore : afterGrant > beforeGrant } : {}),
            ...(Object.hasOwn(expected, 'learned_points_spent') ? {
                learned_points_spent: step.after.learned_points - step.before.learned_points,
                remaining_potential: step.after.potential - step.after.learned_points } : {}),
            contribution_spent: contribution, jing_spent: jing, known_issue: p.known_issue,
            ...(introductory && !acquisition ? { balance_spent: step.before.balance - step.after.balance } : {}),
            note: '写入领悟不证明施展资格；已知错误按原行为记录，不记为正常教学正确。' });
        previous = step;
    }
    return summaries;
}

// The new profile records preparation separately. Earlier frozen teacher samples
// did not expose this evidence and retain their original validation contract.
function validateGumuTeacherPreparation(raw, condition) {
    const p = condition.parameters, step = raw.teaching[0], prep = raw.teacher_preparation;
    const a = raw.before?.[0], b = raw.after?.[0], teacher = prep?.teacher_state;
    const mapping = (v, name) => assert.ok(v && typeof v === 'object' && !Array.isArray(v), name);
    const number = (v, name) => assert.ok(Number.isSafeInteger(v), name);
    mapping(prep, '原教师准备记录缺失'); mapping(teacher, '原教师实际状态缺失');
    assert.equal(prep.command, 'test_interface');
    assert.equal(prep.entry_actor, step.student); assert.equal(prep.return_actor, step.student);
    assert.equal(prep.initializer_actor, 'not_observed', '不得从入口身份推断构造内部动作表初始化身份');
    assert.equal(prep.teacher, step.teacher); assert.equal(prep.teacher_program, p.teacher.path);
    assert.equal(teacher.object, step.teacher); assert.equal(teacher.id, p.teacher.id);
    assert.ok(Object.hasOwn(teacher, 'playerp') && (teacher.playerp === null || teacher.playerp === 0),
        '原NPC须有实际非玩家标记，不能缺失或为未知类型');
    assert.equal(teacher.living, 1);
    for (const observed of raw.teaching)
        assert.deepEqual(teacher.skills, observed.teacher_skills, '教学必须使用准备的同一原教师技能');
    const stable = ['object', 'id', 'userp', 'interactive', 'playerp', 'wizardp', 'living', 'ghost', 'busy',
        'qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili', 'jingli',
        'potential', 'learned_points', 'skills', 'learned', 'mappings', 'preparations',
        'gender', 'str', 'con', 'int', 'dex', 'shen', 'combat_exp', 'cultivation',
        'effective_skills', 'effective_str', 'effective_con', 'effective_int', 'effective_dex',
        'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details', 'handing', 'handing_details'];
    for (const key of stable) {
        assert.ok(Object.hasOwn(prep.before, key) && Object.hasOwn(prep.after, key)
            && Object.hasOwn(a, key), '准备前后真实状态缺失：' + key);
        assert.deepEqual(prep.after[key], prep.before[key], '教师准备改变学生：' + key);
        assert.deepEqual(a[key], prep.after[key], '准备后至学习前状态漂移：' + key);
    }
    const flags = ['character', 'family/family_name', 'family/master_id', 'family/master_name',
        'special_skill/tiandao', 'special_skill/qinzong', 'special_skill/wuxing', 'betrayer/times', 'env/no_learn'];
    for (const [boundary, point] of [[a, step.before], [b, raw.teaching.at(-1).after]]) {
        for (const key of ['userp', 'interactive', 'playerp', 'living']) assert.equal(boundary[key], 1);
        assert.equal(boundary.wizardp, 0); assert.equal(boundary.ghost, 0);
        if (p.teaching_profile === 'gumu-recruit' && p.actor.busy)
            assert.equal(boundary.busy, p.actor.busy, '拜师保持原冻结忙乱');
        else assert.ok(boundary.busy === null || boundary.busy === 0, '普通学习不得预置忙乱');
        for (const key of ['shen', 'str', 'con', 'int', 'dex', 'effective_int', 'effective_dex']) {
            number(boundary[key], '真实属性缺失：' + key);
            assert.equal(boundary[key], point[key], '整段快照与教学观察不符：' + key);
        }
        assert.equal(boundary.gender, p.actor.properties.gender);
        assert.equal(boundary.effective_str,
            gumuEffectiveAttribute({ ...p.actor, skills: boundary.skills }, 'str'));
        assert.deepEqual(boundary.preparations, {});
        mapping(boundary.cultivation, '资格字段缺失');
        for (const key of flags) {
            assert.ok(Object.hasOwn(boundary.cultivation, key), '真实资格字段缺失：' + key);
            if (p.teaching_profile === 'gumu-recruit' && key.startsWith('family/')) {
                const value = point.recruitment.family[key.slice('family/'.length)];
                if (value !== undefined) assert.equal(boundary.cultivation[key], value);
                else assert.ok(boundary.cultivation[key] === null || boundary.cultivation[key] === 0);
            } else if (Object.hasOwn(p.actor.properties, key))
                assert.equal(boundary.cultivation[key], p.actor.properties[key], '资格字段不符：' + key);
            else assert.ok(boundary.cultivation[key] === null || boundary.cultivation[key] === 0,
                '未设置资格必须保留实际null/0，不能缺失或为未知类型：' + key);
        }
        const equipment = p.actor.equipment, detail = boundary.weapon_details;
        mapping(detail, '实际兵器记录缺失'); mapping(boundary.temp?.apply, '实际装备加成缺失');
        assert.equal(boundary.handing, 'none'); assert.deepEqual(boundary.handing_details, {});
        assert.equal(boundary.weapon, equipment?.type ?? 'none');
        assert.equal(boundary.weapon_damage, equipment ? 50 : 0);
        assert.ok(Object.hasOwn(boundary, 'weapon_flag'), '实际兵器旗标缺失');
        if (equipment?.type === 'whip')
            assert.ok(boundary.weapon_flag === null || boundary.weapon_flag === 0,
                '原鞭未设旗标须保留实际null/0，不接受未知类型或附加旗标');
        else assert.equal(boundary.weapon_flag, equipment?.type === 'sword' ? 4 : 0);
        if (equipment) {
            assert.equal(detail.program, '/tests/' + equipment.type);
            assert.match(detail.object, new RegExp('^/tests/' + equipment.type + '#\\d+$'));
            assert.equal(detail.id, 'practice weapon'); assert.equal(detail.skill_type, equipment.type);
            assert.equal(detail.weight, 3000); assert.equal(detail.damage, 50);
            assert.ok(Object.hasOwn(detail, 'flag'), '实际兵器详情旗标缺失');
            assert.equal(detail.flag, boundary.weapon_flag, '兵器旗标与同一实际兵器详情不一致');
        } else assert.deepEqual(detail, {});
        assert.equal(boundary.temp.apply.damage ?? 0, equipment ? 50 : 0);
        assert.equal(boundary.temp.apply.dodge ?? 0, equipment ? -1 : 0);
    }
    assert.equal(b.shen, a.shen, '未指定正气必须保留实际观察，不默认零');
    const dynamic = { 'suxin-jian': 'sword', 'quanzhen-jian': 'sword', 'yinsuo-jinling': 'whip',
        'sanwu-shou': 'whip', 'wudu-shenzhang': 'strike', 'sad-strike': 'unarmed' };
    for (const name of ['loaded_before', 'loaded_after']) {
        mapping(prep[name], '原动态武学加载状态缺失');
        assert.deepEqual(Object.keys(prep[name]).sort(), Object.keys(dynamic).sort());
        for (const v of Object.values(prep[name])) assert.ok(v === 0 || v === 1);
    }
    for (const skill of Object.keys(dynamic))
        assert.ok(prep.loaded_after[skill] >= prep.loaded_before[skill], '准备不得销毁原动态武学');
    if (p.teaching_profile === 'gumu-teachers' && Object.hasOwn(dynamic, p.skill)) {
        const load = raw.skill_load_context;
        mapping(load, '目标武学真实玩家冷加载记录缺失');
        assert.equal(load.actor, step.student);
        assert.equal(load.command, `enable ${dynamic[p.skill]} ${p.skill}`);
        assert.ok(load.already_loaded === 0 || load.already_loaded === 1);
        assert.deepEqual(load.skills, a.skills, '不得为冷加载给学生补学技能');
        assert.equal(prep.loaded_before[p.skill], 1); assert.equal(prep.loaded_after[p.skill], 1);
    }
    const autonomy = (value, heartbeat) => {
        mapping(value, '教师自主行为状态缺失'); assert.equal(value.heartbeat, heartbeat);
        assert.equal(value.blueprint, p.teacher.path); assert.equal(value.blueprint_heartbeat, 0);
        assert.deepEqual(value.callbacks, [], '原教师待执行回调须保留并拒绝，不能悄悄清除');
    };
    autonomy(prep.autonomy_before, 1); autonomy(prep.autonomy_after, 0);
    autonomy(raw.teacher_final?.autonomy, 0);
    if (p.teaching_profile === 'gumu-item-acquisition') {
        const first = step.item_before.carriers.teacher, last = raw.teaching.at(-1).item_after.carriers.teacher;
        const final = raw.teacher_final.state;
        for (const observed of raw.teaching) assert.equal(observed.resolved_teacher, teacher.object,
            '原命令必须实际解析到同一个教师对象');
        assert.deepEqual(teacher.temp.apply, first.apply);
        assert.deepEqual(final.temp.apply, last.apply);
        if (first.weapon !== last.weapon) {
            assert.equal(first.weapon, '/clone/lonely/yinsuo'); assert.equal(last.weapon, 'none');
            assert.equal(teacher.weapon, 'whip'); assert.equal(teacher.weapon_details.object, first.weapon);
            assert.equal(final.weapon, 'none'); assert.deepEqual(final.weapon_details, {});
            assert.equal(final.weapon_damage, 0); assert.equal(final.weapon_flag, 0);
            assert.equal(teacher.temp.weapon, first.weapon);
            assert.ok(!Object.hasOwn(final.temp, 'weapon'), '原卸下银索须清除武器槽');
            const expectedTemp = structuredClone(teacher.temp);
            delete expectedTemp.weapon; expectedTemp.apply = structuredClone(last.apply);
            assert.deepEqual(final.temp, expectedTemp, '只允许已观察到的原卸下操作');
            assert.deepEqual({ ...final, weapon: teacher.weapon, weapon_details: teacher.weapon_details,
                weapon_damage: teacher.weapon_damage, weapon_flag: teacher.weapon_flag, temp: teacher.temp }, teacher);
        } else assert.deepEqual(final, teacher, '未转移装备不改变教师实际状态');
        assert.deepEqual(raw.item_cleanup, { previous_teacher_exists: 0, owned_remaining: 0, singleton_exists: 0 });
    } else {
        assert.deepEqual(raw.teacher_final.state, teacher, '普通教学不改变原教师实际状态');
        if (p.teaching_profile === 'gumu-recruit')
            for (const observed of raw.teaching) assert.equal(observed.resolved_teacher, teacher.object,
                '原拜师命令必须实际解析到准备的教师');
    }
    assert.deepEqual(raw.teacher_cleanup, { pending: 0, object_exists: 0 });
    for (const key of ['attacks', 'defenses', 'passives', 'callbacks', 'terminals'])
        assert.deepEqual(raw[key], [], '普通教学不得夹杂战斗或自然回调：' + key);
}

// Complements the existing two-player/resource validator. Do not infer a grant
// from command_accepted or from a message when joining it to the sample ledger.
export function validateTeachingRecord(raw, condition) {
    assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, 'teaching');
    if (raw.outcome === 'error') return;
    const steps = raw.teaching;
    const profile = condition.parameters.teaching_profile;
    const summaries = profile === 'gumu-item-acquisition'
        ? validateGumuItemAcquisitionRecord(raw, condition).map(s => ({ ...s,
            command_kind: 'ask', advanced: s.result === 'granted', acquired: s.result === 'granted', contribution_spent: 0 }))
        : profile === 'gumu-recruit'
            ? validateGumuRecruitRecord(raw, condition).map(s => ({ ...s,
                command_kind: 'apprentice', advanced: s.recruited, acquired: false, contribution_spent: 0, jing_spent: 0 }))
            : profile === 'taohua-learning'
                ? validateTaohuaLearningRecord(raw, condition).map(s => ({ ...s,
                    advanced: s.progressed || s.permission_added || s.recruited || s.acquired,
                    jing_spent: s.jing_cost, contribution_spent: 0 }))
                : validateTeachingObservation(steps, condition);
    assert.equal(raw.outcome, summaries.some(s => s.advanced) ? 'observed' : 'refused',
        '样本终态不能以询问受理代替实际领悟');
    for (const [stateName, stepState] of [['before', steps[0].before], ['after', steps.at(-1).after]]) {
        const sampleState = raw[stateName]?.[0];
        assert.ok(sampleState, '样本缺少教学玩家状态');
        assert.equal(sampleState.object, steps[0].student, '教学记录与样本不是同一玩家');
        // The common snapshot does not expose family/shen/contribution; those
        // remain in the teaching point observation and its qualification check.
        for (const key of ['jing', 'neili', 'max_neili', 'str', 'skills', 'mappings']) {
            assert.deepEqual(sampleState[key], stepState[key], '教学与样本状态不一致：' + stateName + '/' + key);
        }
    }
    // The actual actor's counters start empty and only record nonzero events.
    // Require the observation mapping; only its absent event key means zero.
    assert.ok(raw.metrics?.[0] && typeof raw.metrics[0] === 'object'
        && !Array.isArray(raw.metrics[0]), '教学公共资源观察缺失');
    const jingCost = Object.hasOwn(raw.metrics[0], 'jing_cost') ? raw.metrics[0].jing_cost : 0;
    const jingRecovery = Object.hasOwn(raw.metrics[0], 'jing_recovery') ? raw.metrics[0].jing_recovery : 0;
    assert.ok(Number.isSafeInteger(jingCost) && jingCost >= 0
        && Number.isSafeInteger(jingRecovery) && jingRecovery >= 0, '公共资源账计数无效');
    assert.equal(jingCost
        - (['shaolin-promotion', 'shaolin-challenge'].includes(condition.parameters.teaching_profile) ? jingRecovery : 0),
        summaries.reduce((total, step) => total + step.jing_spent, 0), '教学精神支出与公共资源账不一致');
    if (condition.parameters.teaching_profile === 'shaolin-challenge')
        summaries[0].challenge = validateChallengeRecord(raw, condition);
    if (['gumu-teachers', 'gumu-special', 'gumu-acquisition-learning', 'gumu-item-acquisition', 'gumu-recruit'].includes(profile))
        validateGumuTeacherPreparation(raw, condition);
    if (condition.parameters.teaching_profile === 'gumu-special')
        validateGumuSpecialTeachingRecord(raw, condition);
    if (condition.parameters.teaching_profile === 'gumu-acquisition-learning')
        validateGumuAcquisitionLearningRecord(raw, condition);
    return summaries;
}
