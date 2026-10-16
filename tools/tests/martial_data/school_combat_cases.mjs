// Explicit school combinations; acquisition/cultivation costs are not simulated.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { mingjiaoCoreConditions, validateMingjiaoCoreRecord } from './school_mingjiao_core_cases.mjs';
import { mingjiaoQishangConditions, validateMingjiaoQishangRecord } from './school_mingjiao_qishang_cases.mjs';
import { mingjiaoXinfaConditions, validateMingjiaoXinfaRecord } from './school_mingjiao_xinfa_cases.mjs';
import { mingjiaoMovementConditions, validateMingjiaoMovementRecord } from './school_mingjiao_movement_cases.mjs';
import { mingjiaoShengongConditions, validateMingjiaoShengongRecord } from './school_mingjiao_shengong_cases.mjs';
import { mingjiaoShenghuoConditions, validateMingjiaoShenghuoRecord } from './school_mingjiao_shenghuo_cases.mjs';
import { mingjiaoLingLearningConditions, validateMingjiaoLingLearningRecord } from './school_mingjiao_ling_learning_cases.mjs';
import { mingjiaoLingPerformConditions, validateMingjiaoLingPerformRecord } from './school_mingjiao_ling_perform_cases.mjs';
import { mingjiaoApprenticeLearningConditions, validateMingjiaoApprenticeLearningRecord } from './school_mingjiao_apprentice_learning_cases.mjs';
import { mingjiaoPublicForceConditions, validateMingjiaoPublicForceRecord } from './school_mingjiao_public_force_cases.mjs';
import { mingjiaoTeachersConditions, validateMingjiaoTeachersRecord } from './school_mingjiao_teachers_cases.mjs';
import { mingjiaoRecruitConditions, validateMingjiaoRecruitRecord } from './school_mingjiao_recruit_cases.mjs';
import { mingjiaoGiftConditions, validateMingjiaoGiftRecord } from './school_mingjiao_gift_cases.mjs';
import { mingjiaoBookConditions, validateMingjiaoBookRecord } from './school_mingjiao_book_cases.mjs';
import { mingjiaoQkdConditions, validateMingjiaoQkdRecord } from './school_mingjiao_qkd_cases.mjs';
import { mingjiaoJiuyangConditions, validateMingjiaoJiuyangRecord } from './school_mingjiao_jiuyang_cases.mjs';
import { mingjiaoJiuyangLearningConditions, validateMingjiaoJiuyangLearningRecord } from './school_mingjiao_jiuyang_learning_cases.mjs';
import { mingjiaoJiuyangDirectConditions, validateMingjiaoJiuyangDirectRecord } from './school_mingjiao_jiuyang_direct_cases.mjs';
import { mingjiaoJiuyangRemainingConditions, validateMingjiaoJiuyangRemainingRecord } from './school_mingjiao_jiuyang_remaining_cases.mjs';
import { mingjiaoJiuyangExertConditions, validateMingjiaoJiuyangExertRecord } from './school_mingjiao_jiuyang_exert_cases.mjs';
import { mingjiaoJiuyangCapacityConditions } from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { validateMingjiaoJiuyangCapacityRecord } from './school_mingjiao_jiuyang_capacity_observation.mjs';
import { mingjiaoJiuyangResearchConditions } from './school_mingjiao_jiuyang_research_cases.mjs';
import { validateMingjiaoJiuyangResearchRecord } from './school_mingjiao_jiuyang_research_observation.mjs';
import { mingjiaoJiuyangFusionConditions } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { validateMingjiaoJiuyangFusionRecord } from './school_mingjiao_jiuyang_fusion_record.mjs';
import { mingjiaoRemainingPerformConditions } from './school_mingjiao_remaining_perform_cases.mjs';
import { validateMingjiaoRemainingPerformRecord } from './school_mingjiao_remaining_perform_record.mjs';
import { mingjiaoRemainingBaseConditions } from './school_mingjiao_remaining_base_cases.mjs';
import { validateMingjiaoRemainingBaseRecord } from './school_mingjiao_remaining_base_record.mjs';
import { mingjiaoForceRemainingConditions } from './school_mingjiao_force_remaining_cases.mjs';
import { validateMingjiaoForceRemainingRecord } from './school_mingjiao_force_remaining_record.mjs';
import { taohuaDingConditions, validateTaohuaDingRecord } from './school_taohua_ding_cases.mjs';
import { taohuaXiaoConditions, validateTaohuaXiaoRecord } from './school_taohua_xiao_cases.mjs';
import { taohuaPoConditions, validateTaohuaPoRecord } from './school_taohua_po_cases.mjs';
import { taohuaZhuanConditions, validateTaohuaZhuanRecord } from './school_taohua_zhuan_cases.mjs';
import { taohuaDirectConditions, validateTaohuaDirectRecord } from './school_taohua_direct_cases.mjs';
import { taohuaControlConditions, validateTaohuaControlRecord } from './school_taohua_control_cases.mjs';
import { taohuaAttackConditions, validateTaohuaAttackRecord } from './school_taohua_attack_cases.mjs';
import { taohuaComboConditions, validateTaohuaComboRecord } from './school_taohua_combo_cases.mjs';
import { taohuaBihaiConditions, validateTaohuaBihaiRecord } from './school_taohua_bihai_cases.mjs';
import { taohuaPassiveConditions, validateTaohuaPassiveRecord } from './school_taohua_passive_cases.mjs';
import { taohuaCombinationConditions, validateTaohuaCombinationRecord } from './school_taohua_combination_cases.mjs';
import { taohuaForceConditions, validateTaohuaForceRecord } from './school_taohua_force_cases.mjs';
import { taohuaMusicConditions, validateTaohuaMusicRecord } from './school_taohua_music_cases.mjs';
import { taohuaNpcConditions, validateTaohuaNpcRecord } from './school_taohua_npc_cases.mjs';
import { shaolinSwordConditions, validateShaolinSwordRecord } from './school_shaolin_sword_cases.mjs';
import { shaolinWeaponConditions, validateShaolinWeaponRecord } from './school_shaolin_weapons_cases.mjs';
import { shaolinAdditionalConditions, validateShaolinAdditionalRecord } from './school_shaolin_additional_cases.mjs';
import { shaolinFistConditions, validateShaolinFistRecord } from './school_shaolin_fists_cases.mjs';
import { shaolinPalmConditions, validateShaolinPalmRecord } from './school_shaolin_palms_cases.mjs';
import { shaolinFingerConditions, validateShaolinFingerRecord } from './school_shaolin_fingers_cases.mjs';
import { shaolinHandConditions, validateShaolinHandRecord } from './school_shaolin_hands_cases.mjs';
import { shaolinLearningConditions, validateShaolinLearningRecord } from './school_shaolin_learning_cases.mjs';
import { shaolinUnarmedLearningConditions, validateShaolinUnarmedLearningRecord } from './school_shaolin_unarmed_learning_cases.mjs';
import { shaolinCultivationConditions, validateShaolinCultivationRecord } from './school_shaolin_cultivation_cases.mjs';
import { shaolinExertConditions, validateShaolinExertRecord } from './school_shaolin_exert_cases.mjs';
import { huashanAdvancedConditions, validateHuashanAdvancedRecord } from './school_huashan_advanced_cases.mjs';
import { huashanLearningConditions, validateHuashanLearningRecord } from './school_huashan_learning_cases.mjs';
import { huashanDefenseConditions, validateHuashanDefenseRecord } from './school_huashan_defense_cases.mjs';
import { huashanUpgradeConditions, validateHuashanUpgradeRecord } from './school_huashan_upgrade_cases.mjs';
import { quanzhenSwordConditions, validateQuanzhenSwordRecord } from './school_quanzhen_sword_cases.mjs';
import { quanzhenBasicConditions, validateQuanzhenBasicRecord } from './school_quanzhen_basic_cases.mjs';
import { quanzhenAdvancedConditions, validateQuanzhenAdvancedRecord } from './school_quanzhen_advanced_cases.mjs';
import { quanzhenDefenseConditions, validateQuanzhenDefenseRecord } from './school_quanzhen_defense_cases.mjs';
import { quanzhenPracticeConditions, validateQuanzhenPracticeRecord } from './school_quanzhen_practice_cases.mjs';
import { quanzhenCultivationConditions, validateQuanzhenCultivationRecord } from './school_quanzhen_cultivation_cases.mjs';
import { quanzhenAuxiliaryConditions, validateQuanzhenAuxiliaryRecord } from './school_quanzhen_auxiliary_cases.mjs';
import { quanzhenStudyConditions, validateQuanzhenStudyRecord } from './school_quanzhen_study_cases.mjs';
import { quanzhenRecoveryConditions, validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';
import { wudangSwordConditions, validateWudangSwordRecord } from './school_wudang_sword_cases.mjs';
import { wudangCoreConditions, validateWudangCoreRecord } from './school_wudang_core_cases.mjs';
import { wudangDefenseConditions, validateWudangDefenseRecord } from './school_wudang_defense_cases.mjs';
import { wudangPassiveConditions, validateWudangPassiveRecord } from './school_wudang_passive_cases.mjs';
import { wudangSpecialConditions, validateWudangSpecialRecord } from './school_wudang_special_cases.mjs';
import { wudangWeaponConditions, validateWudangWeaponRecord } from './school_wudang_weapons_cases.mjs';
import { wudangShenmenConditions, validateWudangShenmenRecord } from './school_wudang_shenmen_cases.mjs';
import { wudangUnarmedConditions, validateWudangUnarmedRecord } from './school_wudang_unarmed_cases.mjs';
import { wudangLearningConditions, validateWudangLearningRecord } from './school_wudang_learning_cases.mjs';
import { wudangCultivationConditions, validateWudangCultivationRecord } from './school_wudang_cultivation_cases.mjs';
import { wudangStudyConditions, validateWudangStudyRecord } from './school_wudang_study_cases.mjs';
import { wudangRecoveryConditions, validateWudangRecoveryRecord } from './school_wudang_recovery_cases.mjs';
import { wudangCombinationConditions, validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';
import { wudangBoutConditions, validateWudangBoutRecord } from './school_wudang_bout_cases.mjs';
import { wudangPublicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';
import { wudangHealingConditions, validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { wudangDispelConditions, validateWudangDispelRecord } from './school_wudang_dispel_cases.mjs';
import { wudangBuffConditions, validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { wudangLookupConditions, validateWudangLookupRecord } from './school_wudang_lookup_cases.mjs';
import { wudangConditionCases, validateWudangConditionRecord } from './school_wudang_condition_cases.mjs';
import { shaolinRecoveryConditions, validateShaolinRecoveryRecord } from './school_shaolin_recovery_cases.mjs';
import { shaolinBacklashConditions, validateShaolinBacklashRecord } from './school_shaolin_backlash_cases.mjs';
import { shaolinPublicForceConditions, validateShaolinPublicForceRecord } from './school_shaolin_public_force_cases.mjs';
import { shaolinSupportConditions, validateShaolinSupportRecord } from './school_shaolin_support_cases.mjs';
import { shaolinCombinationConditions, validateShaolinCombinationRecord } from './school_shaolin_combination_cases.mjs';
import { shaolinDefenseConditions, validateShaolinDefenseRecord } from './school_shaolin_defense_cases.mjs';
import { shaolinBoutConditions, validateShaolinBoutRecord } from './school_shaolin_bout_cases.mjs';
import { emeiWeaponConditions, validateEmeiWeaponRecord } from './school_emei_weapons_cases.mjs';
import { emeiUnarmedConditions, validateEmeiUnarmedRecord } from './school_emei_unarmed_cases.mjs';
import { emeiCultivationConditions, validateEmeiCultivationRecord } from './school_emei_cultivation_cases.mjs';
import { emeiYijinConditions, validateEmeiYijinRecord } from './school_emei_yijin_cases.mjs';
import { emeiShexingConditions, validateEmeiShexingRecord } from './school_emei_shexing_cases.mjs';
import { emeiJiuyinLearningConditions, validateEmeiJiuyinLearningRecord } from './school_emei_jiuyin_learning_cases.mjs';
import { emeiJiuyinPassiveConditions, validateJiuyinPassiveRecord } from './school_emei_jiuyin_passive_cases.mjs';
import { emeiNpcConditions, validateEmeiNpcRecord } from './school_emei_npc_cases.mjs';
import { emeiBoutConditions, validateEmeiBoutRecord } from './school_emei_bout_cases.mjs';
import { emeiExertConditions, emeiZhaoConditions, validateEmeiExertRecord, validateEmeiZhaoRecord } from './school_emei_exert_cases.mjs';
import { emeiLearningConditions, validateEmeiLearningRecord } from './school_emei_learning_cases.mjs';
import { emeiDefenseConditions, validateEmeiDefenseRecord } from './school_emei_defense_cases.mjs';
import { emeiCombinationConditions, validateEmeiCombinationRecord } from './school_emei_combination_cases.mjs';
import { emeiPublicForceConditions, validateEmeiPublicForceRecord } from './school_emei_public_force_cases.mjs';
import { emeiRecoveryConditions, validateEmeiRecoveryRecord } from './school_emei_recovery_cases.mjs';
import { emeiSupportConditions, validateEmeiSupportRecord } from './school_emei_support_cases.mjs';
import { emeiJiuyinConditions, validateEmeiJiuyinRecord } from './school_emei_jiuyin_cases.mjs';
import { emeiJiuyinBuffConditions, validateEmeiJiuyinBuffRecord } from './school_emei_jiuyin_buff_cases.mjs';
import { gumuControlConditions, validateGumuControlRecord } from './school_gumu_control_cases.mjs';
import { gumuDirectConditions, validateGumuDirectRecord } from './school_gumu_direct_cases.mjs';
import { gumuAdvancedConditions, validateGumuAdvancedRecord } from './school_gumu_advanced_cases.mjs';
import { gumuUnarmedConditions, validateGumuUnarmedRecord } from './school_gumu_unarmed_cases.mjs';
import { gumuComboConditions, validateGumuComboRecord } from './school_gumu_combo_cases.mjs';
import { gumuFireiceConditions, validateGumuFireiceRecord } from './school_gumu_fireice_cases.mjs';
import { gumuPoisonConditions, validateGumuPoisonRecord } from './school_gumu_poison_cases.mjs';
import { gumuWeaponConditions, validateGumuWeaponRecord } from './school_gumu_weapons_cases.mjs';
import { gumuUnarmedAttackConditions, validateGumuUnarmedAttackRecord } from './school_gumu_unarmed_attack_cases.mjs';
import { gumuThrowingConditions, validateGumuThrowingRecord } from './school_gumu_throwing_cases.mjs';
import { gumuNeedleLifecycleConditions, validateGumuNeedleLifecycleRecord } from './school_gumu_needle_lifecycle_cases.mjs';
import { gumuCombinationConditions, validateGumuCombinationRecord } from './school_gumu_combination_cases.mjs';
import { gumuDefenseConditions, validateGumuDefenseRecord } from './school_gumu_defense_cases.mjs';
import { gumuHuboConditions, validateGumuHuboRecord } from './school_gumu_hubo_cases.mjs';
import { gumuCultivationConditions, validateGumuCultivationRecord } from './school_gumu_cultivation_cases.mjs';
import { gumuMovementConditions, validateGumuMovementRecord } from './school_gumu_movement_cases.mjs';
import { gumuRecoveryConditions, validateGumuRecoveryRecord } from './school_gumu_recovery_cases.mjs';
import { gumuExertConditions, validateGumuExertRecord } from './school_gumu_exert_cases.mjs';
import { gumuPublicForceConditions, validateGumuPublicForceRecord } from './school_gumu_public_force_cases.mjs';
import { gumuSupportConditions, validateGumuSupportRecord } from './school_gumu_support_cases.mjs';
import { gumuWeaponLearningConditions, validateGumuWeaponLearningRecord } from './school_gumu_weapon_learning_cases.mjs';
import { gumuUnarmedLearningConditions, validateGumuUnarmedLearningRecord } from './school_gumu_unarmed_learning_cases.mjs';
import { gumuZhiConditions, validateGumuZhiRecord } from './school_gumu_zhi_cases.mjs';
import { gumuQuanzhenConditions, validateGumuQuanzhenRecord } from './school_gumu_quanzhen_cases.mjs';
import { gumuResearchConditions, validateGumuResearchRecord } from './school_gumu_research_cases.mjs';
import { gumuForceInputConditions } from './school_gumu_force_inputs_cases.mjs';
import { gumuNpcConditions, validateGumuNpcRecord } from './school_gumu_npc_cases.mjs';
import { gumuTemporalConditions, validateGumuTemporalRecord } from './school_gumu_temporal_cases.mjs';
import { gumuBoutConditions, validateGumuBoutRecord } from './school_gumu_bout_cases.mjs';
import { gumuNpcBoutConditions, validateGumuNpcBoutRecord } from './school_gumu_npc_bout_cases.mjs';
import { mingjiaoCombinationConditions } from './school_mingjiao_combination_cases.mjs';
import { createMingjiaoCombinationRecordValidator } from './school_mingjiao_combination_record.mjs';

const mingjiaoCombinationValidators = new WeakMap();

const sources = [
    'kungfu/skill/huashan-jian.c', 'kungfu/skill/huashan-shenfa.c',
    'kungfu/skill/huashan-xinfa.c', 'kungfu/skill/zixia-shengong.c',
    'kungfu/skill/kuangfeng-jian.c', 'kungfu/class/huashan/yue-buqun.c',
    'kungfu/class/huashan/feng-buping.c', 'kungfu/class/huashan/cheng-buyou.c',
    'cmds/skill/perform.c', 'cmds/skill/exert.c',
];

function huashanActor(level, combination) {
    const force = combination === 'jianzong' ? 'huashan-xinfa' : 'zixia-shengong';
    const skills = { sword: level, parry: level, dodge: level, 'martial-cognize': level,
        'huashan-jian': level, 'huashan-shenfa': level,
        force: combination === 'jianzong' ? 100 : level,
        [force]: combination === 'jianzong' ? 150 : level };
    if (combination === 'jianqi') skills['kuangfeng-jian'] = level;
    return { skills, mappings: { sword: 'huashan-jian', force, dodge: 'huashan-shenfa',
        parry: combination === 'jianqi' ? 'kuangfeng-jian' : 'huashan-jian' },
        properties: { jiali: 0, 'family/family_name': '华山派',
            max_neili: combination === 'jianzong' ? 2000 : 6000,
            neili: combination === 'jianzong' ? 2000 : 6000,
            ...Object.fromEntries(['jie', 'lian', 'long', 'xian'].map(move =>
                [`can_perform/huashan-jian/${move}`, 1])) },
        equipment: { type: 'sword', hold: false } };
}

export function schoolCombatConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(level, combination, ability, extra = {}) {
        const actor = huashanActor(level, combination);
        const method = ability === 'ordinary' ? 'ordinary'
            : ['powerup', 'ziqi'].includes(ability) ? 'exert' : 'perform';
        const skillId = method === 'ordinary' ? 'huashan-jian'
            : `${method === 'exert' ? 'zixia-shengong' : 'huashan-jian'}/${ability}`;
        const skill = catalog.skills.find(s => s.id === skillId);
        assert.ok(skill, '门派能力不在目录：' + skillId);
        const entry = method === 'ordinary' ? skill.path : skill.entries.find(e => e.role === method)?.id;
        assert.ok(entry, '门派能力缺少真实入口：' + skillId);
        Object.assign(actor.properties, extra.properties ?? {});
        Object.assign(actor.skills, extra.skills ?? {});
        result.push({ id: `school-huashan-${combination}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method, samples: smoke ? (extra.duration ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'huashan', family: '华山派', combination, ability, level,
                observation: extra.duration ? 'timed_effect' : 'single_action_immediate', actor,
                target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
                action: method === 'ordinary' ? 'ordinary' : method === 'exert' ? `exert ${ability}` : `perform sword.${ability}`,
                fighting: true, observe_seconds: extra.duration ? level + 2 : 0, not_applicable: '',
                qualification_sources: [...new Set([...sources, skill.path])],
                qualification_note: '真实非巫师 USER；技能、领悟与资源为实验赋值，不证明当前可向教师获得全部技能/绝招；不复制 NPC 辟邪映射或专属 apply。',
                expected: extra.expected ?? 'observed', effect_expected: extra.effect ?? ability,
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const combination of ['qizong', 'jianzong']) {
            for (const ability of ['ordinary', 'jie', 'lian', 'long', 'xian',
                ...(combination === 'qizong' ? ['powerup', 'ziqi'] : [])]) add(level, combination, ability);
        }
    }
    // Only the parry mapping and its learned skill differ from qizong controls.
    for (const level of [400, 800]) for (const ability of ['ordinary', 'lian']) add(level, 'jianqi', ability);
    add(200, 'qizong', 'powerup', { suffix: '-neili99', properties: { neili: 99 }, checks: 2, expected: 'refused' });
    add(200, 'qizong', 'ziqi', { suffix: '-neili199', properties: { neili: 199 }, checks: 2, expected: 'refused' });
    add(200, 'qizong', 'ziqi', { suffix: '-skill149', skills: { 'zixia-shengong': 149 }, checks: 2, expected: 'refused' });
    add(200, 'qizong', 'ziqi', { suffix: '-qi4000', properties: { qi: 4000 }, checks: 2, effect: 'no_buff' });
    add(200, 'qizong', 'ziqi', { suffix: '-qi4001', properties: { qi: 4001 }, checks: 2 });
    // Deterministic expiry: keep original 150-second callbacks, not 100 repeated waits.
    // Separate IDs/conditions preserve the earlier immediate-only series verbatim.
    for (const ability of ['powerup', 'ziqi'])
        add(150, 'qizong', ability, { suffix: '-expiry', checks: 2, duration: true });
    return [...result, ...huashanAdditionalConditions(catalog, { smoke, samples }),
        ...huashanAdvancedConditions(catalog, { smoke, samples }),
        ...huashanLearningConditions(catalog, { smoke, samples }),
        ...huashanDefenseConditions(catalog, { smoke, samples }),
        ...huashanUpgradeConditions(catalog, { smoke, samples }),
        ...quanzhenSwordConditions(catalog, { smoke, samples }),
        ...quanzhenBasicConditions(catalog, { smoke, samples }),
        ...quanzhenAdvancedConditions(catalog, { smoke, samples }),
        ...quanzhenDefenseConditions(catalog, { smoke, samples }),
        ...quanzhenPracticeConditions(catalog, { smoke, samples }),
        ...quanzhenCultivationConditions(catalog, { smoke, samples }),
        ...quanzhenAuxiliaryConditions(catalog, { smoke, samples }),
        ...quanzhenStudyConditions(catalog, { smoke, samples }),
        ...quanzhenRecoveryConditions(catalog, { smoke, samples }),
        ...wudangSwordConditions(catalog, { smoke, samples }),
        ...wudangCoreConditions(catalog, { smoke, samples }),
        ...wudangDefenseConditions(catalog, { smoke, samples }),
        ...wudangPassiveConditions(catalog, { smoke, samples }),
        ...wudangSpecialConditions(catalog, { smoke, samples }),
        ...wudangWeaponConditions(catalog, { smoke, samples }),
        ...wudangShenmenConditions(catalog, { smoke, samples }),
        ...wudangUnarmedConditions(catalog, { smoke, samples }),
        ...wudangLearningConditions(catalog),
        ...wudangCultivationConditions(catalog, { smoke, samples }),
        ...wudangStudyConditions(catalog, { smoke, samples }),
        ...wudangRecoveryConditions(catalog, { smoke, samples }),
        ...wudangCombinationConditions(catalog, { smoke, samples }),
        ...wudangBoutConditions(catalog, { smoke }),
        ...wudangPublicForceConditions(catalog, { smoke, samples }),
        ...wudangHealingConditions(catalog, { smoke }),
        ...wudangDispelConditions(catalog, { smoke, samples }),
        ...wudangBuffConditions(catalog, { smoke, samples }),
        ...wudangLookupConditions(catalog), ...wudangConditionCases(catalog, { smoke, samples }),
        ...shaolinSwordConditions(catalog, { smoke, samples }), ...shaolinWeaponConditions(catalog, { smoke, samples }),
        ...shaolinAdditionalConditions(catalog, { smoke, samples }), ...shaolinFistConditions(catalog, { smoke, samples }),
        ...shaolinPalmConditions(catalog, { smoke, samples }), ...shaolinFingerConditions(catalog, { smoke, samples }),
        ...shaolinHandConditions(catalog, { smoke, samples }), ...shaolinLearningConditions(catalog, { smoke }),
        ...shaolinUnarmedLearningConditions(catalog, { smoke }), ...shaolinCultivationConditions(catalog, { smoke, samples }),
        ...shaolinExertConditions(catalog, { smoke, samples }), ...shaolinRecoveryConditions(catalog, { smoke, samples }),
        ...shaolinBacklashConditions(catalog, { smoke, samples }),
        ...shaolinPublicForceConditions(catalog, { smoke, samples }),
        ...shaolinSupportConditions(catalog, { smoke, samples }),
        ...shaolinCombinationConditions(catalog, { smoke, samples }),
        ...shaolinDefenseConditions(catalog, { smoke, samples }), ...shaolinBoutConditions(catalog, { smoke }),
        ...emeiWeaponConditions(catalog, { smoke, samples }), ...emeiUnarmedConditions(catalog, { smoke, samples }),
        ...emeiCultivationConditions(catalog, { smoke, samples }),
        ...emeiExertConditions(catalog, { smoke, samples }), ...emeiZhaoConditions(catalog, { smoke, samples }),
        ...emeiLearningConditions(catalog, { smoke }), ...emeiDefenseConditions(catalog, { smoke, samples }),
        ...emeiCombinationConditions(catalog, { smoke, samples }),
        ...emeiPublicForceConditions(catalog, { smoke, samples }),
        ...emeiRecoveryConditions(catalog, { smoke, samples }),
        ...emeiSupportConditions(catalog, { smoke, samples }),
        ...emeiJiuyinConditions(catalog, { smoke, samples }),
        ...emeiJiuyinBuffConditions(catalog, { smoke, samples }),
        ...emeiNpcConditions(catalog, { smoke }),
        ...emeiYijinConditions(catalog, { smoke, samples }),
        ...emeiShexingConditions(catalog, { smoke, samples }),
        ...emeiJiuyinLearningConditions(catalog, { smoke, samples }),
        ...emeiJiuyinPassiveConditions(catalog, { smoke, samples }),
        ...emeiBoutConditions(catalog, { smoke }),
        ...gumuControlConditions(catalog, { smoke, samples }),
        ...gumuDirectConditions(catalog, { smoke, samples }),
        ...gumuAdvancedConditions(catalog, { smoke, samples }),
        ...gumuUnarmedConditions(catalog, { smoke, samples }),
        ...gumuComboConditions(catalog, { smoke, samples }),
        ...gumuFireiceConditions(catalog, { smoke, samples }),
        ...gumuPoisonConditions(catalog, { smoke, samples }),
        ...gumuWeaponConditions(catalog, { smoke, samples }),
        ...gumuUnarmedAttackConditions(catalog, { smoke, samples }),
        ...gumuThrowingConditions(catalog, { smoke, samples }),
        ...gumuNeedleLifecycleConditions(catalog, { smoke }),
        ...gumuCombinationConditions(catalog, { smoke, samples }),
        ...gumuDefenseConditions(catalog, { smoke, samples }),
        ...gumuHuboConditions(catalog, { smoke, samples }),
        ...gumuCultivationConditions(catalog, { smoke, samples }),
        ...gumuMovementConditions(catalog, { smoke, samples }),
        ...gumuRecoveryConditions(catalog, { smoke, samples }),
        ...gumuExertConditions(catalog, { smoke, samples }),
        ...gumuPublicForceConditions(catalog, { smoke, samples }),
        ...gumuSupportConditions(catalog, { smoke, samples }),
        ...gumuWeaponLearningConditions(catalog, { smoke, samples }),
        ...gumuUnarmedLearningConditions(catalog, { smoke, samples }),
        ...gumuZhiConditions(catalog, { smoke, samples }),
        ...gumuQuanzhenConditions(catalog, { smoke, samples }),
        ...gumuResearchConditions(catalog, { smoke, samples }),
        ...gumuForceInputConditions(catalog, { smoke }),
        ...gumuNpcConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...gumuTemporalConditions(catalog, { smoke }),
        ...gumuBoutConditions(catalog, { smoke }),
        ...gumuNpcBoutConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...taohuaDingConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaXiaoConditions(catalog, { smoke, samples }),
        ...taohuaPoConditions(catalog, { smoke, samples }),
        ...taohuaZhuanConditions(catalog, { smoke, samples }),
        ...taohuaDirectConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaControlConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaAttackConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaComboConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaBihaiConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaPassiveConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaCombinationConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...taohuaForceConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaMusicConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...taohuaNpcConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoCoreConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoQishangConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoXinfaConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoMovementConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoShengongConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoShenghuoConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoLingLearningConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoLingPerformConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoApprenticeLearningConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoPublicForceConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoTeachersConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoRecruitConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoGiftConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoBookConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoQkdConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoJiuyangConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoJiuyangLearningConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoJiuyangDirectConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoJiuyangRemainingConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoJiuyangExertConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke, samples }),
        ...mingjiaoJiuyangCapacityConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoJiuyangResearchConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoJiuyangFusionConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoRemainingPerformConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoRemainingBaseConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoCombinationConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke }),
        ...mingjiaoForceRemainingConditions(catalog, path => readFileSync(join(root, path), 'utf8'), { smoke })];
}

export function validateSchoolCombatRecord(raw, condition, sourceContext) {
    if (['mingjiao-combination', 'mingjiao-npc-bout'].includes(condition.parameters.collection_group)) {
        assert.ok(sourceContext?.catalog && typeof sourceContext.readSource === 'function',
            '明教互备／原NPC须绑定实际catalog与源码读取');
        let cached = mingjiaoCombinationValidators.get(sourceContext.catalog);
        if (!cached || cached.readSource !== sourceContext.readSource) {
            cached = { readSource: sourceContext.readSource,
                formal: createMingjiaoCombinationRecordValidator(sourceContext.catalog, sourceContext.readSource),
                smoke: createMingjiaoCombinationRecordValidator(sourceContext.catalog, sourceContext.readSource, { smoke: true }) };
            mingjiaoCombinationValidators.set(sourceContext.catalog, cached);
        }
        return cached[condition.parameters.run_mode](raw, condition);
    }
    if (condition.parameters.collection_group === 'mingjiao-force-remaining')
        return validateMingjiaoForceRemainingRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-remaining-base')
        return validateMingjiaoRemainingBaseRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-remaining-perform')
        return validateMingjiaoRemainingPerformRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-fusion')
        return validateMingjiaoJiuyangFusionRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-research') return validateMingjiaoJiuyangResearchRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-capacity') return validateMingjiaoJiuyangCapacityRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-exert') return validateMingjiaoJiuyangExertRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-remaining') return validateMingjiaoJiuyangRemainingRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-direct') return validateMingjiaoJiuyangDirectRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang-learning') return validateMingjiaoJiuyangLearningRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-jiuyang') return validateMingjiaoJiuyangRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-qkd') return validateMingjiaoQkdRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-book') return validateMingjiaoBookRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-gift') return validateMingjiaoGiftRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-recruit') return validateMingjiaoRecruitRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-teachers') return validateMingjiaoTeachersRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-public-force') return validateMingjiaoPublicForceRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-apprentice-learning') return validateMingjiaoApprenticeLearningRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-ling-perform') return validateMingjiaoLingPerformRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-ling-learning') return validateMingjiaoLingLearningRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-shenghuo') return validateMingjiaoShenghuoRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-shengong') return validateMingjiaoShengongRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-movement') return validateMingjiaoMovementRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-xinfa') return validateMingjiaoXinfaRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-qishang') return validateMingjiaoQishangRecord(raw, condition);
    if (condition.parameters.collection_group === 'mingjiao-core') return validateMingjiaoCoreRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-combination') return validateTaohuaCombinationRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-force') return validateTaohuaForceRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-music') return validateTaohuaMusicRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-npc') return validateTaohuaNpcRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-passive') return validateTaohuaPassiveRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-bihai') return validateTaohuaBihaiRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-combo') return validateTaohuaComboRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-attack') return validateTaohuaAttackRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-control') return validateTaohuaControlRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-direct') return validateTaohuaDirectRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-zhuan') return validateTaohuaZhuanRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-po') return validateTaohuaPoRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-xiao') return validateTaohuaXiaoRecord(raw, condition);
    if (condition.parameters.collection_group === 'taohua-ding') return validateTaohuaDingRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-npc-bout') return validateGumuNpcBoutRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-bout') return validateGumuBoutRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-npc') return validateGumuNpcRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-temporal') return validateGumuTemporalRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-zhi') return validateGumuZhiRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-quanzhen') return validateGumuQuanzhenRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-research') return validateGumuResearchRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-unarmed-learning') return validateGumuUnarmedLearningRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-weapon-learning') return validateGumuWeaponLearningRecord(raw, condition);
    if (['gumu-healing', 'gumu-dispel', 'gumu-buffs'].includes(condition.parameters.collection_group))
        return validateGumuSupportRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-public-force') return validateGumuPublicForceRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-exert') return validateGumuExertRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-recovery') return validateGumuRecoveryRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-movement') return validateGumuMovementRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-cultivation') return validateGumuCultivationRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-hubo') return validateGumuHuboRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-defense') return validateGumuDefenseRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-combination') return validateGumuCombinationRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-needle-lifecycle') return validateGumuNeedleLifecycleRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-unarmed-attack') return validateGumuUnarmedAttackRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-throwing') return validateGumuThrowingRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-weapons') return validateGumuWeaponRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-poison') return validateGumuPoisonRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-fireice') return validateGumuFireiceRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-combo') return validateGumuComboRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-unarmed') return validateGumuUnarmedRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-advanced') return validateGumuAdvancedRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-direct') return validateGumuDirectRecord(raw, condition);
    if (condition.parameters.collection_group === 'gumu-control') return validateGumuControlRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-bout') return validateEmeiBoutRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-npc') return validateEmeiNpcRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-jiuyin-passive') return validateJiuyinPassiveRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-jiuyin-learning') return validateEmeiJiuyinLearningRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-shexing') return validateEmeiShexingRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-yijin') return validateEmeiYijinRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-jiuyin-buff') return validateEmeiJiuyinBuffRecord(raw, condition);
    if (condition.parameters.collection_group === 'emei-jiuyin') return validateEmeiJiuyinRecord(raw, condition);
    if (raw.outcome === 'error') return;
    const p = condition.parameters;
    if (['emei-healing', 'emei-dispel', 'emei-buffs'].includes(p.collection_group))
        return validateEmeiSupportRecord(raw, condition);
    if (p.collection_group === 'emei-recovery') return validateEmeiRecoveryRecord(raw, condition);
    if (p.collection_group === 'emei-public-force') return validateEmeiPublicForceRecord(raw, condition);
    if (p.collection_group === 'emei-combination') return validateEmeiCombinationRecord(raw, condition);
    if (p.collection_group === 'emei-defense') return validateEmeiDefenseRecord(raw, condition);
    if (p.collection_group === 'emei-learning') return validateEmeiLearningRecord(raw, condition);
    if (p.collection_group === 'emei-exert') return validateEmeiExertRecord(raw, condition);
    if (p.collection_group === 'emei-zhao') return validateEmeiZhaoRecord(raw, condition);
    if (p.collection_group === 'emei-unarmed') return validateEmeiUnarmedRecord(raw, condition);
    if (p.collection_group === 'emei-cultivation') return validateEmeiCultivationRecord(raw, condition);
    if (p.collection_group === 'emei-weapons') return validateEmeiWeaponRecord(raw, condition);
    if (p.collection_group === 'shaolin-bout') return validateShaolinBoutRecord(raw, condition);
    if (p.collection_group === 'shaolin-combination') return validateShaolinCombinationRecord(raw, condition);
    if (p.collection_group === 'shaolin-defense') return validateShaolinDefenseRecord(raw, condition);
    if (p.collection_group === 'shaolin-public-force') return validateShaolinPublicForceRecord(raw, condition);
    if (['shaolin-healing', 'shaolin-dispel', 'shaolin-buffs'].includes(p.collection_group))
        return validateShaolinSupportRecord(raw, condition);
    if (p.collection_group === 'shaolin-backlash') return validateShaolinBacklashRecord(raw, condition);
    if (p.collection_group === 'shaolin-recovery') return validateShaolinRecoveryRecord(raw, condition);
    if (p.collection_group === 'shaolin-exert') return validateShaolinExertRecord(raw, condition);
    if (p.collection_group === 'shaolin-cultivation') return validateShaolinCultivationRecord(raw, condition);
    if (p.collection_group === 'shaolin-unarmed-learning') return validateShaolinUnarmedLearningRecord(raw, condition);
    if (p.collection_group === 'shaolin-weapon-learning') return validateShaolinLearningRecord(raw, condition);
    if (p.collection_group === 'shaolin-hands') return validateShaolinHandRecord(raw, condition);
    if (p.collection_group === 'shaolin-fingers') return validateShaolinFingerRecord(raw, condition);
    if (p.collection_group === 'shaolin-palms') return validateShaolinPalmRecord(raw, condition);
    if (p.collection_group === 'shaolin-fists') return validateShaolinFistRecord(raw, condition);
    if (p.collection_group === 'shaolin-additional') return validateShaolinAdditionalRecord(raw, condition);
    if (p.collection_group === 'shaolin-weapons') return validateShaolinWeaponRecord(raw, condition);
    if (p.collection_group === 'shaolin-sword') return validateShaolinSwordRecord(raw, condition);
    if (p.collection_group === 'wudang-condition') return validateWudangConditionRecord(raw, condition);
    if (p.collection_group === 'wudang-lookup') return validateWudangLookupRecord(raw, condition);
    if (p.collection_group === 'wudang-buffs') return validateWudangBuffRecord(raw, condition);
    assert.ok(p.school === 'huashan' || (p.school === 'wudang' && ['wudang-sword', 'wudang-core', 'wudang-defense', 'wudang-passive', 'wudang-special', 'wudang-weapons', 'wudang-shenmen', 'wudang-unarmed', 'wudang-learning', 'wudang-cultivation', 'wudang-study', 'wudang-recovery', 'wudang-combination', 'wudang-bout', 'wudang-public-force', 'wudang-healing', 'wudang-dispel'].includes(p.collection_group)) || (p.school === 'quanzhen' && ['quanzhen-sword', 'quanzhen-basic', 'quanzhen-advanced', 'quanzhen-defense', 'quanzhen-practice', 'quanzhen-cultivation', 'quanzhen-auxiliary', 'quanzhen-study', 'quanzhen-recovery'].includes(p.collection_group)));
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation)
        || (['wudang-passive', 'wudang-bout'].includes(p.collection_group) && p.observation === 'original_heartbeat_bout'));
    assert.equal(raw.outcome, p.expected);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const before = raw.before[side];
        assert.deepEqual(before.mappings, config.mappings);
        for (const [skill, value] of Object.entries(config.skills)) assert.equal(before.skills[skill], value);
        for (const key of ['jiali', 'neili', 'max_neili', 'qi']) {
            if (Object.hasOwn(config.properties, key)) assert.equal(before[key], config.properties[key]);
        }
    }
    if (p.collection_group === 'wudang-sword') return validateWudangSwordRecord(raw, condition);
    if (p.collection_group === 'wudang-core') return validateWudangCoreRecord(raw, condition);
    if (p.collection_group === 'wudang-defense') return validateWudangDefenseRecord(raw, condition);
    if (p.collection_group === 'wudang-passive') return validateWudangPassiveRecord(raw, condition);
    if (p.collection_group === 'wudang-special') return validateWudangSpecialRecord(raw, condition);
    if (p.collection_group === 'wudang-weapons') return validateWudangWeaponRecord(raw, condition);
    if (p.collection_group === 'wudang-shenmen') return validateWudangShenmenRecord(raw, condition);
    if (p.collection_group === 'wudang-unarmed') return validateWudangUnarmedRecord(raw, condition);
    if (p.collection_group === 'wudang-learning') return validateWudangLearningRecord(raw, condition);
    if (p.collection_group === 'wudang-cultivation') return validateWudangCultivationRecord(raw, condition);
    if (p.collection_group === 'wudang-study') return validateWudangStudyRecord(raw, condition);
    if (p.collection_group === 'wudang-recovery') return validateWudangRecoveryRecord(raw, condition);
    if (p.collection_group === 'wudang-combination') return validateWudangCombinationRecord(raw, condition);
    if (p.collection_group === 'wudang-bout') return validateWudangBoutRecord(raw, condition);
    if (p.collection_group === 'wudang-public-force') return validateWudangPublicForceRecord(raw, condition);
    if (p.collection_group === 'wudang-healing') return validateWudangHealingRecord(raw, condition);
    if (p.collection_group === 'wudang-dispel') return validateWudangDispelRecord(raw, condition);
    if (p.collection_group === 'quanzhen-sword') return validateQuanzhenSwordRecord(raw, condition);
    if (p.collection_group === 'quanzhen-basic') return validateQuanzhenBasicRecord(raw, condition);
    if (p.collection_group === 'quanzhen-advanced') return validateQuanzhenAdvancedRecord(raw, condition);
    if (p.collection_group === 'quanzhen-defense') return validateQuanzhenDefenseRecord(raw, condition);
    if (p.collection_group === 'quanzhen-practice') return validateQuanzhenPracticeRecord(raw, condition);
    if (p.collection_group === 'quanzhen-cultivation') return validateQuanzhenCultivationRecord(raw, condition);
    if (p.collection_group === 'quanzhen-auxiliary') return validateQuanzhenAuxiliaryRecord(raw, condition);
    if (p.collection_group === 'quanzhen-study') return validateQuanzhenStudyRecord(raw, condition);
    if (p.collection_group === 'quanzhen-recovery') return validateQuanzhenRecoveryRecord(raw, condition);
    if (p.collection_group === 'huashan-learning') return validateHuashanLearningRecord(raw, condition);
    if (p.collection_group === 'huashan-defense') return validateHuashanDefenseRecord(raw, condition);
    if (p.collection_group === 'huashan-upgrade') return validateHuashanUpgradeRecord(raw, condition);
    const before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0;
    const applyDelta = key => (actor.temp.apply?.[key] ?? 0) - (before.temp.apply?.[key] ?? 0);
    if (raw.outcome === 'refused') {
        assert.equal(cost, 0);
        assert.equal(raw.launches.length, 0);
        assert.ok(!actor.temp.powerup && !actor.temp.ziqi);
        assert.ok(raw.reason.length > 0);
        return;
    }
    if (p.collection_group === 'huashan-advanced') return validateHuashanAdvancedRecord(raw, condition);
    if (p.skill) return validateHuashanAdditionalRecord(raw, condition);
    if (condition.method !== 'ordinary') {
        assert.equal(raw.launches.length, 1);
        assert.equal(raw.launches[0].skill, condition.method === 'exert' ? 'zixia-shengong' : 'huashan-jian');
    }
    switch (p.ability) {
        case 'ordinary':
        case 'lian':
            assert.equal(applyDelta('attack'), 0, '连击的临时攻击增量必须撤回');
            assert.ok(cost >= (p.ability === 'lian' ? 120 : 0));
            break;
        case 'jie':
            assert.equal(cost, 50);
            assert.ok(!target.busy || target.busy === Math.floor(p.level / 22) + 2);
            break;
        case 'long':
            assert.ok([120, 200].includes(cost));
            assert.equal(actor.weapon, 'none');
            assert.equal(raw.dropped.filter(item => item.type === 'sword').length, 1);
            assert.equal(actor.busy, 3);
            break;
        case 'xian':
            assert.equal(cost, 280);
            assert.equal(actor.busy, 3);
            assert.ok((raw.metrics[0].direct ?? 0) <= 3);
            break;
        case 'powerup':
            assert.equal(cost, 100);
            assert.equal(actor.temp.powerup, 1);
            assert.equal(applyDelta('attack'), Math.floor(p.actor.skills['zixia-shengong'] / 3));
            assert.equal(applyDelta('defense'), Math.floor(p.actor.skills['zixia-shengong'] / 3));
            break;
        case 'ziqi': {
            const enabled = p.effect_expected !== 'no_buff';
            assert.equal(cost, enabled ? 200 : 0);
            assert.equal(Boolean(actor.temp.ziqi), enabled);
            assert.equal(applyDelta('damage'), enabled ? Math.floor(p.actor.skills['zixia-shengong'] / 10) : 0);
            assert.equal(applyDelta('sword'), enabled ? Math.floor(p.actor.skills['zixia-shengong'] / 10) : 0);
            assert.equal(actor.busy, 3);
            break;
        }
        default: assert.fail('未知华山能力：' + p.ability);
    }
    if (p.observation === 'timed_effect') {
        const flag = p.ability;
        const fields = flag === 'powerup' ? ['attack', 'defense'] : ['damage', 'sword'];
        assert.ok(['powerup', 'ziqi'].includes(flag));
        assert.equal(p.observe_seconds, p.actor.skills['zixia-shengong'] + 2);
        assert.ok(raw.elapsed >= p.observe_seconds);
        assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
        const [enter, exit] = raw.callbacks;
        assert.ok(enter.elapsed >= p.actor.skills['zixia-shengong']);
        assert.ok(exit.elapsed >= enter.elapsed && exit.elapsed <= raw.elapsed);
        assert.equal(enter.state.temp[flag], 1);
        for (const state of [exit.state, raw.after[0]]) {
            assert.ok(!state.temp[flag], '增益标记必须由原回调清除');
            for (const field of fields) assert.equal(state.temp.apply?.[field] ?? 0,
                before.temp.apply?.[field] ?? 0, '到期后须恢复原属性：' + field);
            assert.equal(state.neili, actor.neili, '解除不额外扣费或退还内力');
        }
        for (const field of fields) assert.equal(enter.state.temp.apply?.[field] ?? 0,
            actor.temp.apply?.[field] ?? 0, '回调开始前仍保持增益：' + field);
    }
}

// Separate configurations retain the original sword-combination conditions verbatim.
const additional = [
    ['kuangfeng-jian', 'sword', ['sao', 'yong'], [180, 250]],
    ['shunv-jian', 'sword', ['ning'], [250]],
    ['fanliangyi-dao', 'blade', ['san'], [320]],
    ['huashan-quan', 'cuff', ['song'], [100]],
    ['huashan-zhang', 'strike', ['piao'], [60]],
    ['poyu-quan', 'cuff', ['feng', 'lei', 'po'], [80, 500, 300]],
    ['hunyuan-zhang', 'strike', ['wuji'], [240]],
];

function huashanAdditionalConditions(catalog, { smoke, samples }) {
    const result = [];
    function add(profile, level, ability, extra = {}) {
        const [skill, usage] = profile, armed = ['sword', 'blade'].includes(usage);
        const lowForce = skill === 'kuangfeng-jian';
        const actor = {
            skills: { [usage]: level, [skill]: level, parry: level, dodge: level,
                'huashan-shenfa': level, 'martial-cognize': level,
                force: lowForce ? 100 : level, 'huashan-xinfa': lowForce ? 150 : level,
                ...(usage === 'strike' ? { cuff: level } : {}), ...extra.skills },
            mappings: { [usage]: skill, parry: skill, dodge: 'huashan-shenfa', force: 'huashan-xinfa' },
            preparations: armed ? {} : { [usage]: skill },
            properties: { jiali: 0, 'family/family_name': '华山派',
                neili: lowForce ? 2000 : 6000, max_neili: lowForce ? 2000 : 6000,
                ...Object.fromEntries(profile[2].map(move => [`can_perform/${skill}/${move}`, 1])),
                ...extra.properties },
            ...(armed ? { equipment: { type: usage, hold: false } } : {}),
        };
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '缺少华山原能力：' + skill + '/' + ability);
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '缺少华山原入口');
        result.push({ id: `school-huashan-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method,
            samples: smoke ? (extra.duration ? 1 : 2) : extra.checks ?? samples,
            parameters: { school: 'huashan', family: '华山派', combination: lowForce ? 'low-force' : 'xinfa',
                skill, usage, ability, level, observation: extra.duration ? 'timed_effect' : 'single_action_immediate',
                actor, target: { skills: { force: 600, dodge: 600, parry: 600, sword: 200 },
                    mappings: {}, properties: {}, equipment: { type: 'sword', hold: false } },
                action: method === 'ordinary' ? 'ordinary' : `perform ${usage}.${ability}`,
                fighting: true, observe_seconds: extra.duration ? Math.floor(level / 3) + 2 : 0,
                not_applicable: '', qualification_sources: [...new Set([
                    `kungfu/skill/${skill}.c`, source.path, 'kungfu/skill/huashan-xinfa.c',
                    'kungfu/skill/huashan-shenfa.c', 'kungfu/class/huashan/yue-wife.c',
                    'kungfu/class/huashan/yue-buqun.c', 'kungfu/class/huashan/cheng-buyou.c',
                    'cmds/skill/perform.c', 'feature/skill.c',
                ])],
                qualification_note: '真实非巫师USER；仅准备当前拳或掌，刀剑使用原类别。技能/领悟为实验赋值，不证明师承或同养成成本；不复制NPC加成。掌法的基本拳法独立记录，不暗加特殊拳法映射。',
                expected: extra.expected ?? 'observed',
            } });
    }
    for (const level of [200, 400, 800]) for (const profile of additional)
        for (const ability of ['ordinary', ...profile[2]]) add(profile, level, ability);
    for (const profile of additional) profile[2].forEach((ability, i) => add(profile, 200, ability, {
        suffix: '-neili-low', properties: { neili: profile[3][i] - 1 }, checks: 2, expected: 'refused',
    }));
    const palm = additional.find(p => p[0] === 'huashan-zhang');
    // Keep strike/force/target fixed; this original move rolls cuff, not strike.
    for (const cuff of [1, 1200]) add(palm, 200, 'piao', { suffix: '-cuff' + cuff, skills: { cuff } });
    add(additional.find(p => p[0] === 'poyu-quan'), 120, 'lei', { suffix: '-expiry', checks: 2, duration: true });
    return result;
}

function validateHuashanAdditionalRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0);
        return;
    }
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, p.skill);
    switch (p.skill + '/' + p.ability) {
        case 'kuangfeng-jian/sao':
            assert.equal(cost, 150);
            assert.equal(actor.temp.apply?.attack ?? 0, before.temp.apply?.attack ?? 0);
            assert.ok(actor.busy >= 1 && actor.busy <= 6);
            break;
        case 'kuangfeng-jian/yong':
        case 'shunv-jian/ning':
        case 'huashan-quan/song':
        case 'poyu-quan/po':
        case 'hunyuan-zhang/wuji': {
            assert.ok(direct === 0 || direct === 1);
            const costs = { yong: [120, 230], ning: [120, 220], song: [50, 60], po: [120, 220], wuji: [120, 220] };
            assert.equal(cost, costs[p.ability][direct]);
            const busy = { yong: [[2], [2]], ning: [[2], [1, 2, 3]], song: [[3], [2]],
                po: [[3], [2]], wuji: [[3], [1, 2]] };
            assert.ok(busy[p.ability][direct].includes(actor.busy));
            break;
        }
        case 'fanliangyi-dao/san':
            assert.equal(cost, 0, '原招只检查内力门槛，不代填扣费');
            assert.ok(Number.isInteger(direct) && direct >= 0 && direct <= 3);
            assert.equal(actor.busy, 3);
            break;
        case 'huashan-zhang/piao':
        case 'poyu-quan/feng': {
            const palm = p.ability === 'piao';
            assert.equal(cost, palm ? 30 : 40);
            assert.equal(direct, 0);
            if (target.busy > 0) {
                assert.equal(target.busy, Math.floor(before.effective_skills[palm ? 'strike' : 'cuff'] / (palm ? 25 : 20)) + 2);
                assert.ok(!actor.busy);
            } else assert.equal(actor.busy, 1);
            break;
        }
        case 'poyu-quan/lei': {
            assert.equal(cost, 400);
            assert.equal(actor.busy, 2);
            assert.equal(actor.temp.lei, 1);
            for (const field of ['str', 'dex']) assert.equal(actor.temp[field] - (before.temp[field] ?? 0), Math.floor(p.level / 6));
            if (p.observation === 'timed_effect') {
                assert.equal(p.observe_seconds, Math.floor(p.level / 3) + 2);
                assert.ok(raw.elapsed >= p.observe_seconds);
                assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[0, 'before'], [0, 'after']]);
                const [enter, exit] = raw.callbacks;
                assert.ok(enter.elapsed >= Math.floor(p.level / 3) && exit.elapsed >= enter.elapsed && exit.elapsed <= raw.elapsed);
                assert.equal(enter.state.temp.lei, 1);
                for (const field of ['str', 'dex']) assert.equal(enter.state.temp[field], actor.temp[field]);
                for (const state of [exit.state, raw.after[0]]) {
                    assert.ok(!state.temp.lei);
                    for (const field of ['str', 'dex']) assert.equal(state.temp[field] ?? 0, before.temp[field] ?? 0);
                    assert.equal(state.neili, actor.neili);
                }
            }
            break;
        }
        default: assert.fail('未核对的华山入口：' + p.skill + '/' + p.ability);
    }
}
