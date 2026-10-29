// Read-only school combat report. No runtime/parameter changes or rankings.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput, root } from '../../collect_martial_data.mjs';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { sha256, buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { gumuNpcBoutReport, gumuNpcBoutMarkdown } from './school_gumu_npc_bout_report.mjs';
import { emeiNpcBoutReport, emeiNpcBoutMarkdown } from './school_emei_npc_bout_report.mjs';
import { taohuaDingReport, taohuaDingMarkdown } from './school_taohua_ding_report.mjs';
import { taohuaXiaoReport, taohuaXiaoMarkdown } from './school_taohua_xiao_report.mjs';
import { taohuaPoEffects } from './school_taohua_po_cases.mjs';
import { taohuaZhuanEffects } from './school_taohua_zhuan_cases.mjs';
import { taohuaDirectEffects, taohuaDirectMoves } from './school_taohua_direct_cases.mjs';
import { taohuaControlEffects } from './school_taohua_control_cases.mjs';
import { taohuaAttackEffects, taohuaAttacks } from './school_taohua_attack_cases.mjs';
import { taohuaComboEffects } from './school_taohua_combo_cases.mjs';
import { taohuaBihaiEffects } from './school_taohua_bihai_cases.mjs';
import { taohuaPassiveEffects, taohuaPassiveSourcePaths } from './school_taohua_passive_cases.mjs';
import { taohuaCombinationEffects, taohuaCombinationPairs, taohuaCombinationSourcePaths } from './school_taohua_combination_cases.mjs';
import { taohuaForceEffects, taohuaForceSourcePaths, taohuaForceAbsentPaths } from './school_taohua_force_cases.mjs';
import { taohuaMusicEffects, taohuaMusicSourcePaths } from './school_taohua_music_cases.mjs';
import { taohuaNpcEffects, taohuaNpcSources, taohuaNpcAbsentSources } from './school_taohua_npc_cases.mjs';
import { mingjiaoCoreEffects } from './school_mingjiao_core_cases.mjs';
import { slice1Effects } from './school_slice1_cases.mjs';
import { slice2Effects } from './school_slice2_cases.mjs';
import { slice3Effects } from './school_slice3_cases.mjs';
import { slice4Effects } from './school_slice4_cases.mjs';
import { slice5Effects } from './school_slice5_cases.mjs';
import { slice6Effects } from './school_slice6_cases.mjs';
import { slice7Effects } from './school_slice7_cases.mjs';
import { slice8Effects } from './school_slice8_cases.mjs';
import { b1Effects } from './b1_perform_cases.mjs';
import { b2Effects } from './b2_perform_cases.mjs';
import { b3Effects } from './b3_perform_cases.mjs';
import { b4Effects } from './b4_perform_cases.mjs';
import { b5Effects } from './b5_perform_cases.mjs';
import { b6Effects } from './b6_perform_cases.mjs';
import { b7Effects } from './b7_perform_cases.mjs';
import { b8Effects } from './b8_perform_cases.mjs';
import { b9Effects } from './b9_perform_cases.mjs';
import { b10Effects } from './b10_perform_cases.mjs';
import { b11Effects } from './b11_perform_cases.mjs';
import { b12Effects } from './b12_perform_cases.mjs';
import { b13Effects } from './b13_perform_cases.mjs';
import { b14Effects } from './b14_perform_cases.mjs';
import { b15Effects } from './b15_perform_cases.mjs';
import { b16Effects } from './b16_perform_cases.mjs';
import { b17Effects } from './b17_perform_cases.mjs';
import { b18Effects } from './b18_perform_cases.mjs';
import { b19Effects } from './b19_perform_cases.mjs';
import { b20Effects } from './b20_perform_cases.mjs';
import { b21Effects } from './b21_perform_cases.mjs';
import { b22Effects } from './b22_perform_cases.mjs';
import { b23Effects } from './b23_perform_cases.mjs';
import { b24Effects } from './b24_perform_cases.mjs';
import { b25Effects } from './b25_perform_cases.mjs';
import { b26Effects } from './b26_perform_cases.mjs';
import { b27Effects } from './b27_perform_cases.mjs';
import { b28Effects } from './b28_perform_cases.mjs';
import { b29Effects } from './b29_perform_cases.mjs';
import { mingjiaoQishangEffects, validateMingjiaoQishangLoads } from './school_mingjiao_qishang_cases.mjs';
import { mingjiaoXinfaEffects } from './school_mingjiao_xinfa_cases.mjs';
import { mingjiaoMovementEffects } from './school_mingjiao_movement_cases.mjs';
import { mingjiaoShengongEffects } from './school_mingjiao_shengong_cases.mjs';
import { mingjiaoShenghuoEffects, validateMingjiaoShenghuoLoads } from './school_mingjiao_shenghuo_cases.mjs';
import { mingjiaoLingLearningEffects } from './school_mingjiao_ling_learning_cases.mjs';
import { mingjiaoLingPerformEffects } from './school_mingjiao_ling_perform_cases.mjs';
import { mingjiaoApprenticeLearningEffects } from './school_mingjiao_apprentice_learning_cases.mjs';
import { mingjiaoTeachersEffects } from './school_mingjiao_teachers_cases.mjs';
import { mingjiaoRecruitEffects } from './school_mingjiao_recruit_cases.mjs';
import { mingjiaoGiftEffects } from './school_mingjiao_gift_cases.mjs';
import { mingjiaoBookEffects } from './school_mingjiao_book_cases.mjs';
import { mingjiaoQkdReport, mingjiaoQkdMarkdown } from './school_mingjiao_qkd_report.mjs';
import { mingjiaoJiuyangReport, mingjiaoJiuyangMarkdown } from './school_mingjiao_jiuyang_report.mjs';
import { mingjiaoJiuyangLearningReport, mingjiaoJiuyangLearningMarkdown } from './school_mingjiao_jiuyang_learning_report.mjs';
import { mingjiaoJiuyangDirectReport, mingjiaoJiuyangDirectMarkdown } from './school_mingjiao_jiuyang_direct_report.mjs';
import { mingjiaoJiuyangRemainingReport, mingjiaoJiuyangRemainingMarkdown } from './school_mingjiao_jiuyang_remaining_report.mjs';
import { mingjiaoJiuyangExertReport, mingjiaoJiuyangExertMarkdown } from './school_mingjiao_jiuyang_exert_report.mjs';
import { mingjiaoJiuyangCapacityReport, mingjiaoJiuyangCapacityMarkdown } from './school_mingjiao_jiuyang_capacity_report.mjs';
import { mingjiaoJiuyangResearchReport, mingjiaoJiuyangResearchMarkdown } from './school_mingjiao_jiuyang_research_report.mjs';
import { mingjiaoJiuyangFusionReport, mingjiaoJiuyangFusionMarkdown } from './school_mingjiao_jiuyang_fusion_report.mjs';
import { mingjiaoRemainingPerformReport, mingjiaoRemainingPerformMarkdown } from './school_mingjiao_remaining_perform_report.mjs';
import { mingjiaoRemainingBaseReport, mingjiaoRemainingBaseMarkdown } from './school_mingjiao_remaining_base_report.mjs';
import { mingjiaoCombinationReport, mingjiaoCombinationMarkdown } from './school_mingjiao_combination_report.mjs';
import { mingjiaoForceRemainingReport, mingjiaoForceRemainingMarkdown } from './school_mingjiao_force_remaining_report.mjs';
import { summarizeSamples, distribution, probability } from './statistics.mjs';
import { validateRecord } from './execution.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { primaryDefenses, negated } from './school_huashan_defense_cases.mjs';
import { quanzhenDefenses, xiantianPassives } from './school_quanzhen_defense_cases.mjs';
import { wudangDefenses } from './school_wudang_defense_cases.mjs';
import { taijiEvents, taijiExtraAttacks } from './school_wudang_passive_cases.mjs';
import { rewardBranches } from './school_huashan_upgrade_cases.mjs';
import { primaryDodgeChecks } from './school_quanzhen_auxiliary_cases.mjs';
import { publicForceEffects, healingEffects, dispelEffects, buffSequenceEffects } from './school_public_force_report.mjs';
import { lookupEffects } from './school_wudang_lookup_cases.mjs';
import { conditionEffects } from './school_wudang_condition_cases.mjs';
import { shaolinSwordEffects } from './school_shaolin_sword_cases.mjs';
import { shaolinWeaponEffects } from './school_shaolin_weapons_cases.mjs';
import { shaolinAdditionalEffects } from './school_shaolin_additional_cases.mjs';
import { shaolinFistEffects } from './school_shaolin_fists_cases.mjs';
import { shaolinPalmEffects } from './school_shaolin_palms_cases.mjs';
import { shaolinFingerEffects } from './school_shaolin_fingers_cases.mjs';
import { shaolinHandEffects } from './school_shaolin_hands_cases.mjs';
import { shaolinExertEffects } from './school_shaolin_exert_cases.mjs';
import { shaolinBacklashEffects } from './school_shaolin_backlash_cases.mjs';
import { shaolinRoarEffects } from './school_shaolin_public_force_cases.mjs';
import { shaolinDefenseEffects } from './school_shaolin_defense_cases.mjs';
import { emeiWeaponEffects } from './school_emei_weapons_cases.mjs';
import { emeiUnarmedEffects } from './school_emei_unarmed_cases.mjs';
import { emeiJiuyinEffects } from './school_emei_jiuyin_cases.mjs';
import { emeiJiuyinBuffEffects } from './school_emei_jiuyin_buff_cases.mjs';
import { emeiExertEffects } from './school_emei_exert_cases.mjs';
import { emeiDefenseEffects } from './school_emei_defense_cases.mjs';
import { shexingEffects } from './school_emei_shexing_cases.mjs';
import { jiuyinLearningEffects } from './school_emei_jiuyin_learning_cases.mjs';
import { jiuyinPassiveEffects } from './school_emei_jiuyin_passive_cases.mjs';
import { npcEffects } from './school_emei_npc_cases.mjs';
import { shenmenPassives, shenmenTriggered, shenmenEligible } from './school_wudang_shenmen_cases.mjs';
import { gumuControlEffects } from './school_gumu_control_cases.mjs';
import { gumuDirectEffects } from './school_gumu_direct_cases.mjs';
import { gumuAdvancedEffects } from './school_gumu_advanced_cases.mjs';
import { gumuUnarmedEffects, validateGumuUnarmedLoads } from './school_gumu_unarmed_cases.mjs';
import { gumuComboEffects } from './school_gumu_combo_cases.mjs';
import { gumuFireiceEffects } from './school_gumu_fireice_cases.mjs';
import { gumuPoisonEffects, validateGumuPoisonLoads } from './school_gumu_poison_cases.mjs';
import { gumuWeaponEffects, validateGumuWeaponLoads } from './school_gumu_weapons_cases.mjs';
import { gumuUnarmedAttackEffects, validateGumuUnarmedAttackLoads } from './school_gumu_unarmed_attack_cases.mjs';
import { gumuThrowingEffects } from './school_gumu_throwing_cases.mjs';
import { gumuNeedleLifecycleEffects } from './school_gumu_needle_lifecycle_cases.mjs';
import { gumuCombinationEffects } from './school_gumu_combination_cases.mjs';
import { gumuDefenseEffects } from './school_gumu_defense_cases.mjs';
import { gumuHuboEffects } from './school_gumu_hubo_cases.mjs';
import { gumuCultivationEffects } from './school_gumu_cultivation_cases.mjs';
import { gumuMovementEffects } from './school_gumu_movement_cases.mjs';
import { gumuExertEffects } from './school_gumu_exert_cases.mjs';
import { gumuSupportEffects } from './school_gumu_support_cases.mjs';
import { gumuWeaponLearningEffects } from './school_gumu_weapon_learning_cases.mjs';
import { gumuUnarmedLearningEffects } from './school_gumu_unarmed_learning_cases.mjs';
import { gumuZhiEffects, validateGumuZhiLoads } from './school_gumu_zhi_cases.mjs';
import { gumuQuanzhenEffects, validateGumuQuanzhenLoads } from './school_gumu_quanzhen_cases.mjs';
import { gumuResearchEffects } from './school_gumu_research_cases.mjs';
import { gumuNpcEffects } from './school_gumu_npc_cases.mjs';
import { gumuTemporalEffects } from './school_gumu_temporal_cases.mjs';
import { gumuBoutEffects, validateGumuBoutLoads } from './school_gumu_bout_cases.mjs';

export function wudangCombinationEffects(rows) {
    const rounds = rows.filter(r => r.raw.method === 'round').map(r => r.raw);
    const strikes = raw => raw.attacks.filter(a => a.actor === 0 && a.target === 1);
    const commands = rows.flatMap(r => r.raw.prepare_steps ?? []);
    const attacks = rounds.flatMap(strikes);
    return { commands: commands.length, accepted: commands.filter(s => s.accepted).length,
        rejected: commands.filter(s => !s.accepted).length,
        prepare_only_samples: rows.filter(r => r.raw.method === 'prepare').length,
        rounds: rounds.length, primary_attacks: attacks.length,
        guarding_rounds: rounds.filter(r => strikes(r).length === 0).length,
        attacking_rounds: rounds.filter(r => strikes(r).length > 0).length,
        attacks_per_round: distribution(rounds.map(r => strikes(r).length)),
        double_rounds: probability(rounds.filter(r => strikes(r).length === 2).length, rounds.length),
        double_given_attack: probability(rounds.filter(r => strikes(r).length === 2).length,
            rounds.filter(r => strikes(r).length > 0).length),
        by_usage: Object.fromEntries([...new Set(attacks.map(a => a.attack_usage))].sort().map(usage => [usage,
            Object.fromEntries([['all', attacks.filter(a => a.attack_usage === usage).length],
                ...[0, -1, -2].map(result => [String(result), attacks.filter(a => a.attack_usage === usage && a.result === result).length])])])),
        final_preparations: [...new Set(rows.map(r => JSON.stringify(Object.entries(r.raw.immediate[0].preparations).sort())))],
    };
}

export function schoolBoutEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return {
        actual_first: [0, 1].map(side => raw.filter(r => r.first_actor === side).length),
        terminals: Object.fromEntries(['time_limit', 'unconscious', 'death'].map(state =>
            [state, raw.filter(r => r.terminal === state).length])),
        sides: [0, 1].map(side => ({
            attack_rounds: distribution(raw.map(r => r.attack_rounds.filter(a => a.actor === side && a.result).length)),
            attacks: distribution(raw.map(r => r.attacks.filter(a => a.actor === side).length)),
            force_calls: distribution(raw.map(r => r.passives.filter(e => e.actor === side && e.route === 'force').length)),
            net_qi_loss: distribution(raw.map(r => r.before[side].qi - r.after[side].qi)),
            net_neili_loss: distribution(raw.map(r => r.before[side].neili - r.after[side].neili)),
            // These callbacks belong to the defender (target), not the attacker (actor).
            defense_calls: distribution(raw.map(r => r.defenses.filter(e => e.target === side).length)),
            damage_negated: distribution(raw.map(r => r.defenses.filter(e => e.target === side
                && e.incoming > 0 && typeof e.result === 'object' && e.result !== null
                && Number.isFinite(e.result.damage) && e.result.damage <= -e.incoming).length)),
        })),
    };
}

export function wudangBoutEffects(rows) {
    return { ...schoolBoutEffects(rows), taiji: wudangPassiveEffects(rows) };
}

export function gumuSchoolBoutEffects(rows, condition) {
    return { ...schoolBoutEffects(rows), gumu: gumuBoutEffects(rows, condition) };
}

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const key = row => row.condition_id + '.' + row.index;

export function validateSchoolCombatPlan(saved, catalog) {
    const reviewed = new Map(schoolCombatConditions(catalog).map(c => [c.id, c]));
    assert.ok(saved.length > 0);
    assert.equal(new Set(saved.map(c => c.id)).size, saved.length);
    for (const condition of saved) {
        assert.ok(reviewed.has(condition.id), '未核对门派配置');
        assert.equal(digest(condition), digest(reviewed.get(condition.id)), '门派条件与原审阅版本不同');
    }
}

export function schoolCombatEffects(rows) {
    const observed = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const busy = state => state?.busy === null ? 0 : Number.isFinite(state?.busy) ? state.busy : null;
    return {
        target_busy: distribution(observed.map(raw => busy(raw.immediate[1]))),
        actor_busy: distribution(observed.map(raw => busy(raw.immediate[0]))),
        target_controlled: probability(observed.filter(raw => busy(raw.immediate[1]) > 0).length, observed.length),
        direct_resolution: probability(observed.filter(raw => (raw.metrics[0].direct ?? 0) > 0).length, observed.length),
        weapon_dropped: probability(observed.filter(raw => raw.before[0].weapon !== 'none'
            && raw.immediate[0].weapon === 'none').length, observed.length),
        target_weapon_dropped: probability(observed.filter(raw => raw.before[1]?.weapon
            && raw.before[1].weapon !== 'none' && raw.immediate[1].weapon === 'none').length, observed.length),
        target_no_exert: probability(observed.filter(raw => raw.immediate[1].temp?.no_exert).length, observed.length),
        powerup: probability(observed.filter(raw => raw.immediate[0].temp.powerup).length, observed.length),
        ziqi: probability(observed.filter(raw => raw.immediate[0].temp.ziqi).length, observed.length),
        // Empty callback data stays unknown, never "0 seconds" for immediate runs.
        callback_start_seconds: distribution(observed.flatMap(raw =>
            (raw.callbacks ?? []).filter(c => c.side === 0 && c.phase === 'before').map(c => c.elapsed))),
        callback_end_seconds: distribution(observed.flatMap(raw =>
            (raw.callbacks ?? []).filter(c => c.side === 0 && c.phase === 'after').map(c => c.elapsed))),
        target_callback_start_seconds: distribution(observed.flatMap(raw =>
            (raw.callbacks ?? []).filter(c => c.side === 1 && c.phase === 'before').map(c => c.elapsed))),
        target_callback_end_seconds: distribution(observed.flatMap(raw =>
            (raw.callbacks ?? []).filter(c => c.side === 1 && c.phase === 'after').map(c => c.elapsed))),
    };
}

// PO uses receive_wound and the held flower's hit_ob, not a normal attack or
// COMBAT_D direct hit. Keep that effect beside, never in place of, generic sides.
export function taohuaPoReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-po');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.equal(p.skill, 'tanzhi-shentong'); assert.equal(p.ability, 'po');
    assert.ok(['finger', 'throwing'].includes(p.usage));
    assert.equal(p.action, `perform ${p.usage}.po right`);
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaPoEffects(rows, condition);
    const known = rows.filter(row => row.outcome !== 'error');
    const accepted = known.filter(row => row.outcome === 'observed').map(row => row.raw);
    const refused = known.filter(row => row.outcome === 'refused').map(row => row.raw);
    return {
        collection_group: 'taohua-po', condition_id: condition.id,
        commands: {
            accepted_execution_cost: distribution(accepted.map(raw => raw.command_accepted)),
            refused_execution_cost: distribution(refused.map(raw => raw.command_accepted)) },
        // The validator requires both apply mappings and validates their sparse
        // integer counters. An absent key here is their real zero, not missing data.
        target_apply_delta: Object.fromEntries(['damage', 'dodge', 'parry', 'armor'].map(key => [key,
            distribution(accepted.map(raw => (raw.immediate[1].temp.apply[key] ?? 0)
                - (raw.before[1].temp.apply[key] ?? 0)))])),
        exceptional, refusals, effects,
    };
}

// Direct death resets USER resources and moves the original sword into a corpse.
// It is not a COMBAT_D damage result; retain its own settlement denominator.
export function taohuaZhuanReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-zhuan');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.equal(p.skill, 'tanzhi-shentong'); assert.equal(p.ability, 'zhuan');
    assert.equal(p.usage, 'finger');
    assert.equal(p.action, p.variant === 'missing-target'
        ? 'perform finger.zhuan missing' : 'perform finger.zhuan right');
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaZhuanEffects(rows, condition);
    const accepted = rows.filter(row => row.outcome === 'observed');
    const refused = rows.filter(row => row.outcome === 'refused');
    const deaths = accepted.filter(row => row.raw.immediate[1].ghost === 1);
    // These fields have just been checked by the original per-record validator.
    // Missing observations must fail there, never become synthetic zero losses.
    return {
        collection_group: 'taohua-zhuan', condition_id: condition.id,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        commands: {
            accepted_execution_cost: distribution(accepted.map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(refused.map(row => row.raw.command_accepted)) },
        death: {
            samples: deaths.length,
            target_net_loss: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili',
                'max_neili', 'combat_exp', 'potential'].map(key => [key,
                distribution(deaths.map(row => row.raw.before[1][key] - row.raw.immediate[1][key]))])),
            killer_delta: Object.fromEntries(['pks', 'wanted_pks', 'experience'].map(key => [key,
                distribution(deaths.map(row => row.raw.zhuan_death['killer_' + key + '_delta']))])),
            ownership: deaths.map(row => ({ index: row.index, target: row.raw.zhuan_death.target,
                killer: row.raw.zhuan_death.killer, corpse: row.raw.zhuan_death.corpse,
                weapon: structuredClone(row.raw.zhuan_death.weapon),
                target_environment: row.raw.zhuan_death.target_environment })) },
        exceptional, refusals, effects,
    };
}

// These four original performs resolve through COMBAT_D.do_damage. Its input is
// not the target's final qi/wound loss, and command cost is not skill neili cost.
export function taohuaDirectReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-direct');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    const move = taohuaDirectMoves.find(d => d.skill === p.skill && d.ability === p.ability);
    assert.ok(move, '四项直伤必须绑定原技能与绝招');
    assert.equal(p.usage, move.usage); assert.equal(p.action, `perform ${move.usage}.${move.ability} right`);
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaDirectEffects(rows, condition);
    assert.equal(effects.validated, counts.observed + counts.refused);
    assert.equal(effects.unknown_or_unobserved, counts.error);
    const accepted = rows.filter(row => row.outcome === 'observed');
    const refused = rows.filter(row => row.outcome === 'refused');
    const hits = accepted.filter(row => row.raw.directs.length === 1);
    return {
        collection_group: 'taohua-direct', condition_id: condition.id, name: move.name,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: {
            accepted_execution_cost: distribution(accepted.map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(refused.map(row => row.raw.command_accepted)) },
        // The original validator has checked the exact sword and permits only
        // its hit-time durability decrease. No martial hit_ob is invoked here.
        ordinary_sword_wear_when_hit: move.usage === 'sword'
            ? distribution(hits.map(row => row.raw.before[0].weapon_details.consistence
                - row.raw.immediate[0].weapon_details.consistence)) : null,
        exceptional, refusals, effects,
    };
}

// Pure control is reported from the original condition, not raw.parameters or
// the generic target-busy counter (which also counts pre-existing busy 50).
export function taohuaControlReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-control');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    const move = { fu: ['lanhua-shou', 'hand', '兰花拂穴'], sui: ['luoying-shenjian', 'sword', '随波逐流'] }[p.ability];
    assert.ok(move, '纯控制必须绑定原技能与绝招');
    assert.equal(p.skill, move[0]); assert.equal(p.usage, move[1]);
    assert.equal(p.action, `perform ${p.usage}.${p.ability} right`);
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.equal(p.named_participants, true); assert.equal(p.fighting, true); assert.equal(p.target_state, 'living');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaControlEffects(rows, condition);
    assert.deepEqual(effects.counts, counts);
    assert.equal(effects.known_command_samples, counts.observed + counts.refused);
    assert.equal(effects.unknown_effect_samples, counts.error);
    return {
        collection_group: 'taohua-control', condition_id: condition.id, name: move[2],
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: {
            accepted_execution_cost: distribution(rows.filter(row => row.outcome === 'observed').map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(rows.filter(row => row.outcome === 'refused').map(row => row.raw.command_accepted)) },
        exceptional, refusals, effects,
    };
}

export function taohuaAttackReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-attack');
    assert.equal(condition.method, 'ordinary');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    const skill = taohuaAttacks.find(d => d.skill === p.skill);
    assert.ok(skill, '六门普攻必须绑定原武学');
    assert.equal(condition.entry_id, `kungfu/skill/${skill.skill}.c`);
    assert.equal(p.usage, skill.usage); assert.equal(p.ability, 'ordinary'); assert.equal(p.action, 'ordinary');
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.equal(p.expected, 'observed'); assert.equal(p.not_applicable, '');
    assert.equal(p.named_participants, true); assert.equal(p.fighting, true); assert.equal(p.target_state, 'living');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome !== 'observed') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const effects = taohuaAttackEffects(rows, condition);
    assert.equal(effects.samples, counts.observed);
    assert.equal(effects.unknown_or_unobserved, counts.error + counts.not_applicable);
    const known = rows.filter(row => row.outcome === 'observed').map(row => row.raw);
    const hits = known.filter(raw => raw.attacks[0].result === 0);
    const callbacks = known.flatMap(raw => raw.passives);
    const extra = known.filter(raw => raw.actions[0].action.weapon === '兰花指');
    // This is an observed hit/entry subset, not a count of item hit_ob calls.
    const wearWindow = hits.filter(raw => raw.passives.length === 1);
    return {
        collection_group: 'taohua-attack', condition_id: condition.id, skill: skill.skill,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, static_action_entries: skill.levels.length,
        selected_action_texts: Object.keys(effects.move_counts).length,
        dodge: probability(known.filter(raw => raw.attacks[0].result === -1).length, known.length),
        parry: probability(known.filter(raw => raw.attacks[0].result === -2).length, known.length),
        extra_action: skill.skill === 'lanhua-shou' ? {
            samples: extra.length,
            hit: extra.filter(raw => raw.attacks[0].result === 0).length,
            dodge: extra.filter(raw => raw.attacks[0].result === -1).length,
            parry: extra.filter(raw => raw.attacks[0].result === -2).length,
            actor_neili_cost: distribution(extra.map(raw => raw.before[0].neili - raw.immediate[0].neili)),
        } : null,
        martial_callback: {
            reached: callbacks.length,
            returned_zero: callbacks.filter(e => e.result === 0).length,
            returned_null: callbacks.filter(e => e.result === null).length,
            not_reached: known.length - callbacks.length,
            hits_without_callback: hits.filter(raw => raw.passives.length === 0).length,
        },
        ordinary_sword: skill.usage === 'sword' ? {
            samples: known.length, hit_samples: hits.length, hit_reached_martial_samples: wearWindow.length,
            wear_when_hit_and_martial_reached: distribution(wearWindow.map(raw =>
                raw.before[0].weapon_details.consistence - raw.immediate[0].weapon_details.consistence)),
            changed_samples: known.filter(raw => raw.immediate[0].weapon_details.consistence
                < raw.before[0].weapon_details.consistence).length,
            item_callback_calls: null,
        } : null,
        exceptional, effects,
    };
}

export function taohuaComboReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-combo');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    const move = { kuang: ['xuanfeng-tui', 'unarmed', '狂风绝技'], fei: ['lanhua-shou', 'hand', '影落飞花'] }[p.ability];
    assert.ok(move, '连击必须绑定原技能与绝招');
    assert.equal(p.skill, move[0]); assert.equal(p.usage, move[1]);
    assert.equal(p.action, `perform ${p.usage}.${p.ability} right`);
    assert.equal(condition.entry_id, p.ability_source?.entry_id);
    assert.equal(p.ability_source.path, `kungfu/skill/${p.skill}/${p.ability}.c`);
    assert.equal(p.base_source?.path, `kungfu/skill/${p.skill}.c`);
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.equal(p.named_participants, true); assert.equal(p.fighting, true); assert.equal(p.target_state, 'living');
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (['error', 'not_applicable'].includes(row.outcome)) {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaComboEffects(rows, condition);
    assert.deepEqual(effects.counts, counts);
    assert.equal(effects.unknown_effect_samples, counts.error + counts.not_applicable);
    assert.equal(effects.acceptance.trials, counts.observed + counts.refused);
    const accepted = rows.filter(row => row.outcome === 'observed').map(row => row.raw);
    const attacks = accepted.flatMap(raw => raw.attacks), callbacks = accepted.flatMap(raw => raw.passives);
    const extras = accepted.flatMap(raw => raw.actions.flatMap((event, i) =>
        Object.hasOwn(event.action, 'lvl') ? [] : [raw.attacks[i]]));
    assert.equal(effects.hit_given_attack.trials, attacks.length);
    assert.equal(effects.lanhua_surcharge_given_eligible_action.successes, extras.length);
    return {
        collection_group: 'taohua-combo', condition_id: condition.id, name: move[2],
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: {
            accepted: counts.observed, refused: counts.refused,
            accepted_execution_cost: distribution(accepted.map(raw => raw.command_accepted)),
            refused_execution_cost: distribution(rows.filter(row => row.outcome === 'refused').map(row => row.raw.command_accepted)) },
        attacks: { total: attacks.length, hit: attacks.filter(a => a.result === 0).length,
            dodge: attacks.filter(a => a.result === -1).length, parry: attacks.filter(a => a.result === -2).length,
            zero_damage_hits: attacks.filter(a => a.result === 0 && a.damage === 0).length,
            short_combos: accepted.filter(raw => raw.attacks.length < 6).length },
        extra_action: { selected: extras.length, hit: extras.filter(a => a.result === 0).length,
            dodge: extras.filter(a => a.result === -1).length, parry: extras.filter(a => a.result === -2).length },
        martial_callback: { reached: callbacks.length, returned_zero: callbacks.filter(e => e.result === 0).length,
            returned_null: callbacks.filter(e => e.result === null).length, not_reached: attacks.length - callbacks.length },
        exceptional, refusals, effects,
    };
}

// BIHAI observes the total mental effect, not the four internal random gates.
export function taohuaBihaiReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-bihai');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.equal(p.skill, 'yuxiao-jian'); assert.equal(p.ability, 'bihai'); assert.equal(p.usage, 'sword');
    assert.equal(p.action, 'perform sword.bihai right');
    assert.equal(condition.entry_id, p.ability_source?.entry_id);
    assert.match(condition.entry_id, /^kungfu\/skill\/yuxiao-jian\/bihai\.c:\d+:perform$/);
    assert.equal(p.ability_source.path, 'kungfu/skill/yuxiao-jian/bihai.c');
    assert.equal(p.base_source?.path, 'kungfu/skill/yuxiao-jian.c');
    for (const source of [p.ability_source, p.base_source]) {
        assert.match(source.sha256, /^[0-9a-f]{64}$/);
        assert.equal(p.source_evidence?.[source.path], source.sha256);
    }
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.equal(p.named_participants, true); assert.equal(typeof p.fighting, 'boolean');
    assert.ok(['living', 'unconscious'].includes(p.target_state));
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaBihaiEffects(rows, condition);
    assert.deepEqual(effects.counts, counts);
    assert.equal(effects.accepted_samples, counts.observed);
    assert.equal(effects.refused_samples, counts.refused);
    assert.equal(effects.unknown_effect_samples, counts.error);
    assert.equal(effects.positive_effect.trials, counts.observed);
    return {
        collection_group: 'taohua-bihai', condition_id: condition.id, name: '碧海潮生按玉箫',
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: {
            accepted: counts.observed, refused: counts.refused,
            acceptance: probability(counts.observed, counts.observed + counts.refused),
            accepted_execution_cost: distribution(rows.filter(row => row.outcome === 'observed').map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(rows.filter(row => row.outcome === 'refused').map(row => row.raw.command_accepted)) },
        exceptional, refusals, effects,
    };
}

// An observed passive return of 0/null is not a refused command or a missed attack.
export function taohuaPassiveReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-passive');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.method, 'interface');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.equal(p.skill, 'yuxiao-jian'); assert.equal(p.ability, 'hit_ob'); assert.equal(p.usage, 'sword');
    assert.equal(p.action, 'test_interface');
    assert.match(condition.entry_id, /^kungfu\/skill\/yuxiao-jian\.c:[1-9]\d*:hit_ob$/);
    assert.equal(p.interface?.object, '/kungfu/skill/yuxiao-jian');
    assert.equal(p.interface.function, 'hit_ob'); assert.equal(p.interface.factor, 0);
    assert.ok(Number.isSafeInteger(p.interface.damage) && p.interface.damage >= 0);
    assert.deepEqual(p.qualification_sources, taohuaPassiveSourcePaths);
    assert.deepEqual(Object.keys(p.source_evidence ?? {}).sort(), [...taohuaPassiveSourcePaths].sort());
    for (const path of taohuaPassiveSourcePaths) assert.match(p.source_evidence[path], /^[0-9a-f]{64}$/);
    assert.equal(p.observation, 'hit_ob_immediate'); assert.equal(p.observe_seconds, 0);
    assert.equal(p.expected, 'observed'); assert.equal(p.not_applicable, '');
    assert.equal(p.named_participants, true); assert.equal(p.fighting, false); assert.equal(p.target_state, 'living');
    assert.deepEqual(p.capture_skill_loads, []);
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome !== 'observed') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const effects = taohuaPassiveEffects(rows, condition);
    assert.equal(effects.interface_calls, counts.observed);
    assert.equal(effects.unknown_or_unobserved, counts.error + counts.not_applicable);
    const known = rows.filter(row => row.outcome === 'observed').map(row => row.raw);
    const returns = {
        zero: known.filter(raw => raw.passives[0].result === 0).length,
        null: known.filter(raw => raw.passives[0].result === null).length,
        triggered: known.filter(raw => typeof raw.passives[0].result === 'string').length,
    };
    assert.equal(returns.zero + returns.null, effects.no_effect_returns);
    assert.equal(returns.triggered, effects.trigger_per_call.successes);
    assert.equal(effects.guard_no_effect + effects.eligible_calls, effects.interface_calls);
    return {
        collection_group: 'taohua-passive', condition_id: condition.id, name: '玉箫剑法命中被动',
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: { accepted: counts.observed, refused: 0,
            execution_cost: distribution(known.map(raw => raw.command_accepted)) },
        returns, eligible_no_effect: effects.eligible_calls - returns.triggered,
        exceptional, effects,
    };
}

// The original prepare command returns an evaluation cost, not an accepted count.
export function taohuaCombinationReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-combination');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.stage, 'school');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(['prepare', 'round'].includes(condition.method));
    assert.equal(p.ability, condition.method); assert.equal(p.level, 400);
    assert.ok(taohuaCombinationPairs.some(pair => JSON.stringify(pair) === JSON.stringify(p.pair)));
    assert.ok(p.pair.includes(p.skill)); assert.equal(condition.entry_id, `kungfu/skill/${p.skill}.c`);
    assert.ok((condition.method === 'prepare' && p.combination === 'pair-prepare')
        || (condition.method === 'round' && ['solo-round', 'pair-round'].includes(p.combination)));
    assert.equal(p.action, condition.method === 'round' ? 'fight_round' : 'prepare_sequence');
    assert.equal(p.fighting, condition.method === 'round');
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.equal(p.expected, 'observed'); assert.equal(p.not_applicable, '');
    assert.deepEqual(p.qualification_sources, taohuaCombinationSourcePaths);
    assert.deepEqual(Object.keys(p.source_evidence ?? {}).sort(), [...taohuaCombinationSourcePaths].sort());
    for (const path of taohuaCombinationSourcePaths) assert.match(p.source_evidence[path], /^[0-9a-f]{64}$/);
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome !== 'observed') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const effects = taohuaCombinationEffects(rows, condition);
    assert.equal(effects.samples, counts.observed);
    assert.equal(effects.unknown_samples, counts.error + counts.not_applicable);
    assert.equal(effects.prepare_only_samples + effects.rounds, counts.observed);
    const known = rows.filter(row => row.outcome === 'observed').map(row => row.raw);
    const steps = known.flatMap(raw => raw.prepare_steps), attacks = known.flatMap(raw => raw.attacks);
    const hit = attacks.filter(attack => attack.result === 0).length;
    const dodge = attacks.filter(attack => attack.result === -1).length;
    const parry = attacks.filter(attack => attack.result === -2).length;
    assert.equal(hit + dodge + parry, effects.primary_attacks);
    assert.equal(steps.length, effects.commands);
    assert.equal(effects.accepted + effects.rejected, effects.commands);
    return {
        collection_group: 'taohua-combination', condition_id: condition.id, variant: p.combination,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, commands: { steps: effects.commands, accepted: effects.accepted, refused: effects.rejected,
            execution_cost: distribution(steps.map(step => step.accepted)) },
        attacks: { count: attacks.length, hit, dodge, parry,
            hit_rate: { successes: hit, trials: attacks.length, rate: attacks.length ? hit / attacks.length : null },
            zero_damage_hits: attacks.filter(attack => attack.result === 0 && attack.damage === 0).length },
        actor_neili_cost: distribution(known.map(raw => Object.hasOwn(raw.metrics[0], 'neili_cost')
            ? raw.metrics[0].neili_cost : 0)),
        exceptional, effects,
    };
}

export function taohuaForceReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-force');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.stage, 'school');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(['exert', 'interface', 'research', 'practice'].includes(condition.method));
    assert.ok(condition.method === 'interface' ? p.action === 'test_interface'
        : typeof p.action === 'string' && p.action.startsWith(condition.method + ' '));
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation));
    assert.equal(p.observe_seconds, condition.method === 'exert' && p.variant === 'a7-expiry' ? 52 : 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.deepEqual(p.qualification_sources, taohuaForceSourcePaths);
    assert.deepEqual(Object.keys(p.source_evidence ?? {}).sort(), [...taohuaForceSourcePaths].sort());
    for (const path of taohuaForceSourcePaths) assert.match(p.source_evidence[path], /^[0-9a-f]{64}$/);
    assert.deepEqual(p.absent_sources, taohuaForceAbsentPaths);
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, condition.method);
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome === 'error' || row.outcome === 'not_applicable') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaForceEffects(rows, condition);
    assert.equal(effects.samples, rows.length);
    assert.equal(effects.validated_samples, counts.observed + counts.refused);
    assert.equal(effects.unknown_samples, counts.error + counts.not_applicable);
    // The validated per-record checks already separated interface returns, command
    // acceptance, gross costs/recovery and callback pairs; never merge denominators.
    return {
        collection_group: 'taohua-force', condition_id: condition.id, variant: p.variant,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, exceptional, refusals, effects,
    };
}

export function taohuaMusicReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-music');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.stage, 'school'); assert.equal(condition.method, 'music');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(['bihai', 'yuan'].includes(p.song));
    assert.ok(['hand', 'weapon', 'ground', 'carry'].includes(p.instrument?.mode));
    assert.ok(['single_action_immediate', 'timed_effect'].includes(p.observation));
    assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected)); assert.equal(p.not_applicable, '');
    assert.deepEqual(Object.keys(p.source_evidence ?? {}).sort(), [...taohuaMusicSourcePaths].sort());
    for (const path of taohuaMusicSourcePaths) assert.match(p.source_evidence[path], /^[0-9a-f]{64}$/);
    assert.ok(p.ability_source?.entry_id?.endsWith(':do_effect'));
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], refusals = [];
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, 'music');
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome === 'error' || row.outcome === 'not_applicable') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaMusicEffects(rows, condition);
    assert.equal(effects.counts.error, counts.error);
    assert.equal(effects.counts.refused, counts.refused);
    // Listener damage/heal and shared-heal arguments keep their own eligible
    // denominators; acceptance is never treated as an effect.
    return {
        collection_group: 'taohua-music', condition_id: condition.id,
        song: p.song, variant: p.variant, instrument_mode: p.instrument.mode,
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, exceptional, refusals, effects,
    };
}

export function taohuaNpcReport(rows, condition) {
    const p = condition?.parameters;
    assert.equal(p?.collection_group, 'taohua-npc');
    assert.equal(p.school, 'taohua'); assert.equal(p.family, '桃花岛');
    assert.equal(condition.stage, 'school'); assert.equal(condition.method, 'npc');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(p.npc && typeof p.npc.path === 'string' && p.npc.path.startsWith('/kungfu/class/taohua/'));
    assert.equal(p.action, 'observe_npc');
    assert.equal(p.not_applicable, '');
    const npcEvidence = Array.isArray(p.source_evidence) ? p.source_evidence : [];
    assert.deepEqual(npcEvidence.map(e => e.path).sort(), [...new Set([...taohuaNpcSources])].sort());
    for (const e of npcEvidence) assert.match(e.sha256, /^[0-9a-f]{64}$/);
    assert.deepEqual(p.absent_sources, taohuaNpcAbsentSources);
    assert.ok(Array.isArray(rows));
    const seen = new Set(), exceptional = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row?.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.kind, 'sample'); assert.equal(row.raw.method, 'npc');
        assert.ok(Number.isSafeInteger(row.index) && row.index >= 0 && row.index < condition.samples);
        assert.equal(row.raw.index, row.index); assert.ok(!seen.has(row.index)); seen.add(row.index);
        assert.ok(['observed', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.raw.outcome, row.outcome);
        assert.equal(typeof row.reason, 'string'); assert.equal(row.reason, row.raw.reason);
        counts[row.outcome]++;
        if (row.outcome !== 'observed') {
            assert.ok(row.reason.trim(), '错误或未适用必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const effects = taohuaNpcEffects(rows.filter(r => r.raw.outcome !== 'error'), condition);
    // Loadout snapshots and closure calls are separate denominators; a returned
    // 0 from the original closure is not a collection failure or a miss.
    return {
        collection_group: 'taohua-npc', condition_id: condition.id,
        npc: { id: p.npc.id, path: p.npc.path, effect: p.npc.effect },
        planned: condition.samples, recorded: rows.length, missing: condition.samples - rows.length,
        counts, exceptional, effects,
    };
}

export function wudangUnarmedEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return {
        shen_cost: distribution(raw.map(r => r.before[0].shen - r.immediate[0].shen)),
        ammunition_cost: distribution(raw.map(r => r.before[0].ammunition - r.immediate[0].ammunition)),
        regular_attacks: distribution(raw.map(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length)),
        wounded: probability(raw.filter(r => (r.metrics[1].eff_qi_cost ?? 0) > 0).length, raw.length),
    };
}

export function wudangSwordEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const delta = (r, state, key) => (r[state][0].temp.apply?.[key] ?? 0) - (r.before[0].temp.apply?.[key] ?? 0);
    return {
        regular_attacks: distribution(raw.map(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length)),
        jing_cost: distribution(raw.map(r => r.metrics[1].jing_cost ?? 0)),
        eff_jing_cost: distribution(raw.map(r => r.metrics[1].eff_jing_cost ?? 0)),
        apply: Object.fromEntries(['attack', 'defense'].map(key => [key, distribution(raw.map(r => delta(r, 'immediate', key)))])),
        after_apply: Object.fromEntries(['attack', 'defense'].map(key => [key, distribution(raw.map(r => delta(r, 'after', key)))])),
        sui_active: raw.filter(r => r.after[0].temp.tjj_sui).length,
    };
}

export function wudangCoreEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const apply = (state, key) => distribution(raw.map(r =>
        (r[state][0].temp.apply?.[key] ?? 0) - (r.before[0].temp.apply?.[key] ?? 0)));
    return {
        actor_jingli_spent: distribution(raw.map(r => r.before[0].jingli - r.immediate[0].jingli)),
        target_health_delta: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(key =>
            [key, distribution(raw.map(r => r.immediate[1][key] - r.before[1][key]))])),
        target_damage_branch: probability(raw.filter(r => (r.metrics[1].qi_cost ?? 0) > 0).length, raw.length),
        apply: Object.fromEntries(['attack', 'defense', 'armor'].map(key => [key, apply('immediate', key)])),
        after_apply: Object.fromEntries(['attack', 'defense', 'armor'].map(key => [key, apply('after', key)])),
    };
}

export function wudangPassiveEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const events = raw.flatMap(taijiEvents), entries = events.filter(e => e.phase === 'enter');
    const eligible = entries.filter(e => e.combat_time > 10 && !e.action_flag);
    const boosts = events.filter(e => e.phase === 'boosted'), attacks = raw.flatMap(taijiExtraAttacks);
    // Calls within the same bout are clustered, not independent trial samples.
    const observedRatio = (successes, trials) => ({ successes, trials, rate: trials ? successes / trials : null });
    return {
        entries: entries.length, eligible_entries: eligible.length,
        guarded_entries: entries.filter(e => e.action_flag).length,
        triggers: boosts.length, restored: events.filter(e => e.phase === 'restored').length,
        trigger_per_eligible_call: observedRatio(boosts.length, eligible.length),
        samples_with_trigger: probability(raw.filter(r => taijiEvents(r).some(e => e.phase === 'boosted')).length, raw.length),
        extra_attacks: attacks.length, extra_hits: observedRatio(attacks.filter(a => a.result === 0).length, attacks.length),
        extra_types: Object.fromEntries([10, 30].map(type => [type, attacks.filter(a => a.type === type).length])),
        boosted_counter: distribution(boosts.map(e => e.combat_time)),
        boosted_apply: Object.fromEntries(['attack', 'parry', 'unarmed_damage'].map(key => [key, distribution(boosts.map(e => e.apply[key]))])),
        attack_rounds: distribution(raw.map(r => r.attack_rounds.filter(s => s.actor === 0 && s.result).length)),
        final_counter: distribution(raw.map(r => r.after[0].temp.combat_time ?? 0)),
        terminals: Object.fromEntries(['time_limit', 'unconscious', 'death'].map(state => [state, raw.filter(r => r.terminal === state).length])),
    };
}

export function wudangSpecialEffects(rows) {
    const raw = rows.map(r => r.raw), steps = raw.flatMap(r => r.repeat_steps ?? []);
    return {
        initially_unconscious: raw.filter(r => !r.before[1].living).length,
        awakened: raw.filter(r => !r.before[1].living && r.after[1].living).length,
        target_health_delta: Object.fromEntries(['qi', 'eff_qi', 'jing', 'eff_jing'].map(k => [k,
            distribution(raw.map(r => r.after[1][k] - r.before[1][k]))])),
        command_steps: steps.length, accepted_steps: steps.filter(s => s.accepted).length,
        refused_steps: steps.filter(s => !s.accepted).length,
        natural_callbacks: raw.reduce((sum, r) => sum + r.callbacks.filter(c => c.side === 0 && c.phase === 'after').length, 0),
        targets: [1, 2].map(side => {
            const samples = side === 1 ? raw : raw.filter(r => r.extra_target_before);
            const metrics = samples.map(r => side === 1 ? r.metrics[1] : r.extra_target_metrics);
            return { side, samples: samples.length,
                damaged: metrics.filter(m => (m.qi_cost ?? 0) > 0).length,
                metrics: Object.fromEntries(['qi_cost', 'eff_qi_cost', 'jing_cost', 'eff_jing_cost', 'neili_cost', 'neili_recovery']
                    .map(k => [k, distribution(metrics.map(m => m[k] ?? 0))])),
                neili_net_loss: distribution(samples.map(r => side === 1
                    ? r.before[1].neili - r.after[1].neili : r.extra_target_before.neili - r.extra_target_after.neili)) };
        }),
    };
}

export function schoolLearningEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const progress = skill => distribution(raw.map(r =>
        (r.immediate[0].learned[skill] ?? 0) - (r.before[0].learned[skill] ?? 0)));
    return {
        // All completed attempts, including refusals, to retain research's jing=0 case.
        attempts: raw.length,
        sword_progress: progress('sword'), skill_progress: progress('dugu-jiujian'),
        potential_spent: distribution(raw.map(r => r.immediate[0].learned_points - r.before[0].learned_points)),
        remaining_jing: distribution(raw.map(r => r.immediate[0].jing)),
        neili_cost: distribution(raw.map(r => r.metrics[0].neili_cost ?? 0)),
        difficulty: distribution(raw.flatMap(r => r.interfaces.filter(i => i.function === 'difficult_level').map(i => i.result))),
    };
}

export function schoolQualificationEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const results = raw.map(r => r.interfaces.find(i => i.function === 'valid_learn')?.result);
    return { attempts: raw.length, accepted: results.filter(v => v === 1).length,
        results: distribution(results) };
}

export function schoolPracticeEffects(rows, skill) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    return {
        attempts: raw.length,
        command_accepted: raw.filter(r => r.command_accepted).length,
        partial_progress: raw.filter(r => !r.command_accepted && r.outcome === 'observed').length,
        progress: distribution(raw.map(r => (r.immediate[0].learned[skill] ?? 0) - (r.before[0].learned[skill] ?? 0))),
        levels: distribution(raw.map(r => r.immediate[0].skills[skill] - r.before[0].skills[skill])),
        qi_cost: distribution(raw.map(r => r.metrics[0].qi_cost ?? 0)),
        neili_cost: distribution(raw.map(r => r.metrics[0].neili_cost ?? 0)),
        force_attribute_delta: distribution(raw.map(r => r.immediate[0].force_attribute - r.before[0].force_attribute)),
        jing_net_cost: distribution(raw.map(r => r.before[0].jing - r.immediate[0].jing)),
        jingli_net_cost: distribution(raw.map(r => r.before[0].jingli - r.immediate[0].jingli)),
    };
}

export function schoolCultivationEffects(rows, skill) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    return {
        attempts: raw.length,
        command_accepted: raw.filter(r => r.command_accepted).length,
        progress: distribution(raw.map(r => (r.immediate[0].learned[skill] ?? 0) - (r.before[0].learned[skill] ?? 0))),
        potential_used: distribution(raw.map(r => r.immediate[0].learned_points - r.before[0].learned_points)),
        jing_cost: distribution(raw.map(r => r.before[0].jing - r.immediate[0].jing)),
        neili_cost: distribution(raw.map(r => r.before[0].neili - r.immediate[0].neili)),
        interface_result: distribution(raw.flatMap(r => r.interfaces.map(i => i.result ?? 0))),
    };
}

export function schoolAuxiliaryEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const base = raw.flatMap(r => primaryDodgeChecks(r, 'base'));
    const settled = raw.flatMap(r => primaryDodgeChecks(r, 'settled'));
    const attacks = raw.flatMap(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0));
    const values = raw.flatMap(r => r.interfaces.map(i => i.result ?? 0));
    const text = values.filter(v => typeof v === 'string');
    return {
        attempts: raw.length, ap: distribution(settled.map(c => c.ap)),
        base_dp: distribution(base.map(c => c.dp)), settled_dp: distribution(settled.map(c => c.dp)),
        formula_probability: distribution(settled.map(c => c.dp / (c.ap + c.dp))),
        primary_dodge: probability(attacks.filter(a => a.result === -1).length, attacks.length),
        interface_numbers: distribution(values.filter(v => typeof v === 'number')),
        interface_texts: Object.fromEntries([...new Set(text)].sort().map(t => [t, text.filter(v => v === t).length])),
        implemented_by: [...new Set(raw.flatMap(r => r.interfaces.filter(i => 'implemented_by' in i).map(i => i.implemented_by ?? null)))],
        defender_neili_cost: distribution(raw.map(r => r.metrics[1].neili_cost ?? 0)),
    };
}

export function schoolStudyEffects(rows, skill) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    return { ...schoolCultivationEffects(rows, skill),
        command_accepted: raw.filter(r => r.upgrades?.length
            ? r.upgrades.every(s => s.accepted === 1) : r.command_accepted === 1).length,
        level_gain: distribution(raw.map(r => r.immediate[0].skills[skill] - r.before[0].skills[skill])),
        upgrade_attempts: raw.filter(r => r.upgrades?.length).length,
        implemented_by: [...new Set(raw.flatMap(r => (r.upgrades ?? []).map(s => s.implemented_by)))],
    };
}

export function schoolRecoveryEffects(rows) {
    const raw = rows.filter(r => ['observed', 'refused'].includes(r.outcome)).map(r => r.raw);
    const timed = raw.filter(r => r.exercise_steps?.length);
    return {
        attempts: raw.length, command_accepted: raw.filter(r => r.command_accepted === 1).length,
        qi_net: distribution(raw.map(r => r.after[0].qi - r.before[0].qi)),
        jing_net: distribution(raw.map(r => r.after[0].jing - r.before[0].jing)),
        neili_net: distribution(raw.map(r => r.after[0].neili - r.before[0].neili)),
        max_neili_net: distribution(raw.map(r => r.after[0].max_neili - r.before[0].max_neili)),
        neili_cost: distribution(raw.map(r => r.metrics[0].neili_cost ?? 0)),
        qi_regeneration: distribution(raw.map(r => r.metrics[0].qi_recovery ?? 0)),
        // Callback conversion excludes the original USER's passive regeneration.
        exercise_converted: distribution(timed.map(r => r.exercise_steps.reduce((n, s, i, a) =>
            n + (s.phase === 'after' ? a[i - 1].state.qi - s.state.qi : 0), 0))),
        exercise_steps: distribution(timed.map(r => r.exercise_steps.length / 2)),
        exercise_seconds: distribution(timed.map(r => r.elapsed)),
        terminals: Object.fromEntries(['completed', 'halted'].map(t => [t, timed.filter(r => r.exercise_terminal === t).length])),
    };
}

export function schoolDefenseEffects(rows, select = primaryDefenses) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const calls = raw.flatMap(select);
    return {
        attempts: raw.length,
        coefficient: distribution(raw.flatMap(r => r.interfaces.filter(i => i.function === 'query_effect_parry').map(i => i.result))),
        // Calling the interface is not the same as ordinary parry, nor taking zero damage.
        calls: calls.length,
        // Calls inside one initiating attack may be correlated through ripostes.
        // Keep a descriptive rate; Wilson intervals belong to sample-level events.
        negated_per_call: { successes: calls.filter(negated).length, trials: calls.length,
            rate: calls.length ? calls.filter(negated).length / calls.length : null },
        samples_with_negation: probability(raw.filter(r => select(r).some(negated)).length, raw.length),
        attacker_busy: distribution(raw.map(r => r.immediate[0].busy || 0)),
        defender_qi_cost: distribution(raw.map(r => r.metrics[1].qi_cost ?? 0)),
        // Values 0/-1/-2 are source-pinned RESULT_HIT/DODGE/PARRY, NOT valid_damage.
        primary_attack_results: Object.fromEntries([['hit', 0], ['dodge', -1], ['parry', -2]].map(([name, result]) =>
            [name, raw.flatMap(r => r.attacks).filter(a => a.actor === 0 && a.target === 1 && a.type === 0 && a.result === result).length])),
    };
}

export function quanzhenPassiveEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const calls = raw.flatMap(xiantianPassives);
    return {
        attempts: raw.length,
        samples_with_effect: probability(raw.filter(r => xiantianPassives(r).some(c => typeof c.result === 'string' && c.result.length)).length, raw.length),
        routes: Object.fromEntries(['interface', 'force', 'martial'].map(route => {
            const selected = calls.filter(c => c.route === route), triggered = selected.filter(c => typeof c.result === 'string' && c.result.length);
            return [route, { calls: selected.length, triggered: triggered.length,
                incoming: distribution(selected.map(c => c.incoming)),
                // A source expression, NOT an extra receive_wound call or total wound measure.
                source_wound_on_trigger: distribution(triggered.map(c => Math.trunc((c.incoming - 100) / 3))) }];
        })),
    };
}

export function shenmenPassiveEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const calls = raw.flatMap(r => shenmenPassives(r).map(call => ({ call, eligible: shenmenEligible(r, call) })));
    const triggered = calls.filter(({ call }) => shenmenTriggered(call));
    return {
        attempts: raw.length, calls: calls.length, eligible_calls: calls.filter(c => c.eligible).length,
        triggers: triggered.length,
        samples_with_effect: probability(raw.filter(r => shenmenPassives(r).some(shenmenTriggered)).length, raw.length),
        // Descriptive call rate; the independent unit is the initiating sample.
        trigger_per_eligible_call: calls.some(c => c.eligible) ? triggered.length / calls.filter(c => c.eligible).length : null,
        incoming: distribution(calls.map(({ call }) => call.incoming)),
        source_wound_on_trigger: distribution(triggered.map(({ call }) => Math.trunc((call.incoming - 100) / 4))),
        target_eff_qi_at_callback: distribution(calls.map(({ call }) => call.target_eff_qi_after)),
        target_busy_at_callback: distribution(calls.map(({ call }) => call.target_busy_after || 0)),
        busy_retained_on_trigger: raw.filter(r => shenmenPassives(r).some(shenmenTriggered) && r.immediate[1].busy === 2).length,
        busy_cleared_on_trigger: raw.filter(r => shenmenPassives(r).some(shenmenTriggered) && !r.immediate[1].busy).length,
        primary_hits: raw.flatMap(r => r.attacks).filter(a => a.actor === 0 && a.target === 1 && a.type === 0 && a.result === 0).length,
    };
}

export function schoolUpgradeEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const steps = raw.flatMap(r => r.upgrades);
    return {
        attempts: raw.length, steps: steps.length,
        qi_gain: distribution(raw.map(r => r.immediate[0].dugu_grants.qi - r.before[0].dugu_grants.qi)),
        po_gain: distribution(raw.map(r => r.immediate[0].dugu_grants.po - r.before[0].dugu_grants.po)),
        skill_levels: distribution(raw.map(r => r.immediate[0].skills['dugu-jiujian'] - r.before[0].skills['dugu-jiujian'])),
        cognition_levels: distribution(raw.map(r => r.immediate[0].skills['martial-cognize'] - r.before[0].skills['martial-cognize'])),
        cognition_progress: distribution(raw.map(r => (r.immediate[0].learned['martial-cognize'] ?? 0) - (r.before[0].learned['martial-cognize'] ?? 0))),
        // Source-correlated reward branches, not extra model/probe invocations.
        rewards: steps.reduce((n, s) => n + rewardBranches(s).length, 0),
        rewards_from_already100: steps.reduce((n, s) => n + rewardBranches(s).filter(g => s.before.dugu_grants[g] === 100).length, 0),
        repeated_within_sample: raw.filter(r => ['qi', 'po'].some(g =>
            r.upgrades.filter(s => rewardBranches(s).includes(g)).length > 1)).length,
    };
}

export function quanzhenSwordEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return {
        // Includes original death penalty; not just the skill's explicit cost.
        max_neili_loss: [0, 1].map(side => distribution(raw.map(r =>
            r.before[side].max_neili - r.immediate[side].max_neili))),
        deaths: [0, 1].map(side => probability(raw.filter(r => r.immediate[side].ghost === 1).length, raw.length)),
        mutual_deaths: probability(raw.filter(r => r.immediate.every(s => s.ghost === 1)).length, raw.length),
        death_calls: [0, 1].map(side => raw.reduce((n, r) =>
            n + r.terminals.filter(t => t.side === side && t.state === 'death').length, 0)),
        // All actual left-to-right do_attack results, preserving original types.
        // Lian deliberately passes TYPE_RIPOSTE (1) for its first two strikes.
        actor_attack_calls: distribution(raw.map(r => r.attacks.filter(a => a.actor === 0 && a.target === 1).length)),
    };
}

export function quanzhenBasicEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return {
        direct_calls: distribution(raw.map(r => r.metrics[0].direct ?? 0)),
        regular_attack_calls: distribution(raw.map(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0).length)),
        apply_delta: Object.fromEntries(['attack', 'dodge', 'parry'].map(field => [field,
            distribution(raw.map(r => (r.immediate[0].temp.apply?.[field] ?? 0) - (r.before[0].temp.apply?.[field] ?? 0)))])),
        // Timed and immediate observations stay distinct; zero does not prove expiry.
        final_powerup: probability(raw.filter(r => r.after[0].temp.powerup).length, raw.length),
    };
}

export function quanzhenAdvancedEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    return {
        ...quanzhenBasicEffects(rows),
        terminal: quanzhenSwordEffects(rows),
        healing: Object.fromEntries(['qi', 'eff_qi'].map(field => [field,
            distribution(raw.map(r => r.metrics[0][field + '_recovery'] ?? 0))])),
        armor_delta: distribution(raw.map(r => (r.immediate[0].temp.apply?.armor ?? 0) - (r.before[0].temp.apply?.armor ?? 0))),
        final_shield: probability(raw.filter(r => r.after[0].temp.shield).length, raw.length),
        // Never call death-reset resource changes attack damage.
        surviving_target_qi_cost: distribution(raw.filter(r => !r.immediate[1].ghost).map(r => r.metrics[1].qi_cost ?? 0)),
    };
}

// A caught game error deliberately stops this driver; the collector continues only
// unsampled jobs in a fresh process. This is reportable evidence, never a pass.
export function validateSchoolRun(result, output, records, includeErrors = false) {
    assert.equal(result.interrupted, false);
    assert.equal(result.process.signal, null);
    assert.equal(result.validation_errors.length, 0);
    assert.equal(result.incomplete_bytes, 0);
    assert.equal(result.imported, records.length);
    const errors = records.filter(r => r.outcome === 'error');
    if (includeErrors && result.process.code === 1) {
        assert.equal(errors.length, 1, '仅接受留存了单条原运行错误的受控退出');
        assert.equal(records.at(-1), errors[0], '运行错误必须为进程最后一条');
        assert.ok(typeof errors[0].reason === 'string' && errors[0].reason.length);
        assert.match(output, /DATA SAMPLE ERROR/);
        assert.doesNotMatch(output, /DATA COMPLETE/);
    } else {
        assert.equal(result.process.code, 0, '本报告默认不混入错误批次；诊断须显式--include-errors');
        assert.equal(errors.length, 0);
        assert.match(output, /DATA COMPLETE/);
        assert.doesNotMatch(output, /DATA SAMPLE ERROR/);
    }
}

export function readSchoolCombat(directory, { includeErrors = false } = {}) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory), conditions = manifest.identity.conditions;
    assert.equal(manifest.identity.execution.collection, 'school-combat');
    assert.equal(manifest.identity.execution.smoke, false, '烟雾不是完整统计');
    const catalog = json(join(directory, 'catalog.json'));
    const sourceContext = { catalog, readSource: path => readFileSync(join(root, path), 'utf8') };
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    validateSchoolCombatPlan(conditions, catalog);
    const rows = readSamples(directory, manifest), evidence = new Map();
    for (const name of readdirSync(join(directory, 'runs')).sort()) {
        const run = join(directory, 'runs', name), result = json(join(run, 'result.json'));
        const output = readFileSync(join(run, 'driver-output.txt'), 'utf8');
        assert.equal(sha256(output), result.driver_output_sha256);
        const request = json(join(run, 'request.json'));
        assert.equal(request.fingerprint, manifest.fingerprint);
        const allowed = new Set(request.jobs.map(key));
        const log = readFileSync(join(run, 'mudlib/log/events.jsonl'), 'utf8');
        assert.ok(log.endsWith('\n'));
        const records = log.split('\n').filter(line => line.trim()).map(text => JSON.parse(text));
        validateSchoolRun(result, output, records, includeErrors);
        const qishangRecords = records.filter(r => r.condition_id?.startsWith('school-mingjiao-qishang-'));
        if (qishangRecords.length) validateMingjiaoQishangLoads(qishangRecords);
        const shenghuoRecords = records.filter(r => r.condition_id?.startsWith('school-mingjiao-shenghuo-'));
        if (shenghuoRecords.length) validateMingjiaoShenghuoLoads(shenghuoRecords);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-unarmed-')
            && !r.condition_id.startsWith('school-gumu-unarmed-attack-')))
            validateGumuUnarmedLoads(records);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-poison-')))
            validateGumuPoisonLoads(records);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-weapons-')
            || r.condition_id?.startsWith('school-gumu-force-inputs-')))
            validateGumuWeaponLoads(records);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-unarmed-attack-')))
            validateGumuUnarmedAttackLoads(records);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-zhi-')))
            validateGumuZhiLoads(records);
        if (records.every(r => r.condition_id?.startsWith('school-gumu-qz-')))
            validateGumuQuanzhenLoads(records);
        const gumuBoutRecords = records.filter(r => r.condition_id?.startsWith('school-gumu-bout-'));
        if (gumuBoutRecords.length) validateGumuBoutLoads(gumuBoutRecords);
        for (const raw of records) {
            const id = key(raw), hash = digest(raw);
            assert.ok(allowed.has(id));
            assert.ok(!evidence.has(id) || evidence.get(id) === hash, '原始样本冲突');
            evidence.set(id, hash);
        }
    }
    for (const row of rows) {
        const condition = conditions.find(c => c.id === row.condition_id);
        validateRecord(row.raw, condition);
        validateSchoolCombatRecord(row.raw, condition, sourceContext);
        assert.equal(evidence.get(key(row)), row.raw_sha256, '原始日志与台账不符');
    }
    const report = summarizeSamples(manifest, rows, { npcBoutReport: gumuNpcBoutReport, emeiNpcBoutReport });
    for (const condition of report.conditions) {
        assert.equal(condition.missing, 0, '门派条件尚未采满');
        if (['mingjiao-combination', 'mingjiao-npc-bout'].includes(condition.parameters.collection_group)) {
            condition.effects = null;
            condition.sides = null;
            condition.bouts = null;
            condition.mingjiao_combination = mingjiaoCombinationReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest,
                sourceContext);
        } else if (condition.parameters.collection_group === 'mingjiao-force-remaining') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_force_remaining = mingjiaoForceRemainingReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-remaining-base') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_remaining_base = mingjiaoRemainingBaseReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-remaining-perform') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_remaining_perform = mingjiaoRemainingPerformReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-fusion') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_fusion = mingjiaoJiuyangFusionReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-research') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_research = mingjiaoJiuyangResearchReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-capacity') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_capacity = mingjiaoJiuyangCapacityReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id), manifest);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-exert') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_exert = mingjiaoJiuyangExertReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-direct') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_direct = mingjiaoJiuyangDirectReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-remaining') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_remaining = mingjiaoJiuyangRemainingReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-learning') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang_learning = mingjiaoJiuyangLearningReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_jiuyang = mingjiaoJiuyangReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-qkd') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_qkd = mingjiaoQkdReport(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-book') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_book = mingjiaoBookEffects(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-gift') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_gift = mingjiaoGiftEffects(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-recruit') {
            condition.effects = null;
            condition.sides = null;
            condition.mingjiao_recruit = mingjiaoRecruitEffects(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-teachers') {
            condition.effects = null;
            condition.mingjiao_teachers = mingjiaoTeachersEffects(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-apprentice-learning') {
            condition.effects = null;
            condition.mingjiao_apprentice_learning = mingjiaoApprenticeLearningEffects(
                rows.filter(r => r.condition_id === condition.id), conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-ling-perform') {
            condition.effects = null;
            condition.mingjiao_ling_perform = mingjiaoLingPerformEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-ling-learning') {
            condition.effects = null;
            condition.mingjiao_ling_learning = mingjiaoLingLearningEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-shenghuo') {
            condition.effects = null;
            condition.mingjiao_shenghuo = mingjiaoShenghuoEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-shengong') {
            condition.effects = null;
            condition.mingjiao_shengong = mingjiaoShengongEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-movement') {
            condition.effects = null;
            condition.mingjiao_movement = mingjiaoMovementEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-xinfa') {
            condition.effects = null;
            condition.mingjiao_xinfa = mingjiaoXinfaEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-qishang') {
            condition.effects = null;
            condition.mingjiao_qishang = mingjiaoQishangEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'mingjiao-core') {
            condition.effects = null;
            condition.mingjiao_core = mingjiaoCoreEffects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice1-')) {
            condition.effects = null;
            condition.slice1 = slice1Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice2-')) {
            condition.effects = null;
            condition.slice2 = slice2Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice3-')) {
            condition.effects = null;
            condition.slice3 = slice3Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice4-')) {
            condition.effects = null;
            condition.slice4 = slice4Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice5-')) {
            condition.effects = null;
            condition.slice5 = slice5Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice6-')) {
            condition.effects = null;
            condition.slice6 = slice6Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice7-')) {
            condition.effects = null;
            condition.slice7 = slice7Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group?.startsWith('slice8-')) {
            condition.effects = null;
            condition.slice8 = slice8Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b1-perform') {
            condition.effects = null;
            condition.b1 = b1Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b2-perform') {
            condition.effects = null;
            condition.b2 = b2Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b3-perform') {
            condition.effects = null;
            condition.b3 = b3Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b4-perform') {
            condition.effects = null;
            condition.b4 = b4Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b5-perform') {
            condition.effects = null;
            condition.b5 = b5Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b6-perform') {
            condition.effects = null;
            condition.b6 = b6Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b7-perform') {
            condition.effects = null;
            condition.b7 = b7Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b8-perform') {
            condition.effects = null;
            condition.b8 = b8Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b9-perform') {
            condition.effects = null;
            condition.b9 = b9Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b10-perform') {
            condition.effects = null;
            condition.b10 = b10Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b11-perform') {
            condition.effects = null;
            condition.b11 = b11Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b12-perform') {
            condition.effects = null;
            condition.b12 = b12Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b13-perform') {
            condition.effects = null;
            condition.b13 = b13Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b14-perform') {
            condition.effects = null;
            condition.b14 = b14Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b15-perform') {
            condition.effects = null;
            condition.b15 = b15Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b16-perform') {
            condition.effects = null;
            condition.b16 = b16Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'b19-perform') {
            condition.b19 = b19Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b20-perform') {
            condition.b20 = b20Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b21-perform') {
            condition.b21 = b21Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b22-perform') {
            condition.b22 = b22Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b23-perform') {
            condition.b23 = b23Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b24-perform') {
            condition.b24 = b24Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b25-perform') {
            condition.b25 = b25Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b26-perform') {
            condition.b26 = b26Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b27-perform') {
            condition.b27 = b27Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b28-perform') {
            condition.b28 = b28Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b29-perform') {
            condition.b29 = b29Effects(rows.filter(r => r.condition_id === condition.id),
                condition);
        } else if (condition.parameters.collection_group === 'b17-perform') {
            condition.effects = null;
            condition.b17 = b17Effects(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        } else if (condition.parameters.collection_group === 'taohua-combo') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-bihai') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-passive') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-combination') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-force') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-music') condition.effects = null;
        else if (condition.parameters.collection_group === 'taohua-npc') condition.effects = null;
        else condition.effects = condition.npc_bout_effects || ['taohua-zhuan', 'taohua-control'].includes(condition.parameters.collection_group) ? null
            : condition.parameters.collection_group === 'taohua-attack' ? null
            : schoolCombatEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'taohua-ding')
            condition.taohua_ding = taohuaDingReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-xiao')
            condition.taohua_xiao = taohuaXiaoReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-po')
            condition.taohua_po = taohuaPoReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-zhuan')
            condition.taohua_zhuan = taohuaZhuanReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-direct')
            condition.taohua_direct = taohuaDirectReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-control')
            condition.taohua_control = taohuaControlReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-attack')
            condition.taohua_attack = taohuaAttackReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-combo')
            condition.taohua_combo = taohuaComboReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-bihai')
            condition.taohua_bihai = taohuaBihaiReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-passive')
            condition.taohua_passive = taohuaPassiveReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-npc')
            condition.taohua_npc = taohuaNpcReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-music')
            condition.taohua_music = taohuaMusicReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-force')
            condition.taohua_force = taohuaForceReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'taohua-combination')
            condition.taohua_combination = taohuaCombinationReport(rows.filter(r => r.condition_id === condition.id),
                conditions.find(c => c.id === condition.id));
        if (condition.parameters.collection_group === 'gumu-control')
            condition.gumu_control = gumuControlEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-direct')
            condition.gumu_direct = gumuDirectEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-advanced')
            condition.gumu_advanced = gumuAdvancedEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-unarmed')
            condition.gumu_unarmed = gumuUnarmedEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-combo')
            condition.gumu_combo = gumuComboEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-fireice')
            condition.gumu_fireice = gumuFireiceEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-poison')
            condition.gumu_poison = gumuPoisonEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-weapons')
            condition.gumu_weapons = gumuWeaponEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-unarmed-attack')
            condition.gumu_unarmed_attack = gumuUnarmedAttackEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-throwing')
            condition.gumu_throwing = gumuThrowingEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-needle-lifecycle')
            condition.gumu_needle_lifecycle = gumuNeedleLifecycleEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-combination')
            condition.combination_effects = gumuCombinationEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-defense')
            condition.gumu_defense = gumuDefenseEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-hubo')
            condition.gumu_hubo = gumuHuboEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-cultivation')
            condition.gumu_cultivation = gumuCultivationEffects(rows.filter(r => r.condition_id === condition.id
                && ['observed', 'refused'].includes(r.outcome)).map(r => r.raw), condition);
        if (condition.parameters.collection_group === 'gumu-movement')
            condition.gumu_movement = gumuMovementEffects(rows.filter(r => r.condition_id === condition.id
                && ['observed', 'refused'].includes(r.outcome)).map(r => r.raw), condition);
        if (condition.parameters.collection_group === 'gumu-exert')
            condition.gumu_exert = gumuExertEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-weapon-learning')
            condition.gumu_weapon_learning = gumuWeaponLearningEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-unarmed-learning')
            condition.gumu_unarmed_learning = gumuUnarmedLearningEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-zhi')
            condition.gumu_zhi = gumuZhiEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-quanzhen')
            condition.gumu_quanzhen = gumuQuanzhenEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-research')
            condition.gumu_research = gumuResearchEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-npc')
            condition.gumu_npc = gumuNpcEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'gumu-temporal')
            condition.gumu_temporal = gumuTemporalEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (condition.parameters.collection_group === 'emei-shexing')
            condition.shexing = shexingEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-jiuyin-learning')
            condition.jiuyin_learning = jiuyinLearningEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-jiuyin-passive')
            condition.jiuyin_passive = jiuyinPassiveEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-npc')
            condition.npc = npcEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-weapons')
            condition.emei_weapons = emeiWeaponEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-unarmed')
            condition.emei_unarmed = emeiUnarmedEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-jiuyin')
            condition.emei_jiuyin = emeiJiuyinEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-jiuyin-buff')
            condition.emei_jiuyin_buff = emeiJiuyinBuffEffects(rows.filter(r => r.condition_id === condition.id));
        if (['emei-exert', 'emei-zhao'].includes(condition.parameters.collection_group))
            condition.emei_exert = emeiExertEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-backlash') {
            const own = rows.filter(r => r.condition_id === condition.id);
            condition.shaolin_backlash = shaolinBacklashEffects(own);
            if (condition.method !== 'interface' && condition.parameters.expected === 'observed')
                condition.recovery = schoolRecoveryEffects(own);
        }
        if (condition.parameters.collection_group === 'shaolin-exert')
            condition.shaolin_exert = shaolinExertEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-hands')
            condition.shaolin_hands = shaolinHandEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters.target_heartbeat);
        if (condition.parameters.collection_group === 'shaolin-fingers')
            condition.shaolin_fingers = shaolinFingerEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-palms')
            condition.shaolin_palms = shaolinPalmEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-fists')
            condition.shaolin_fists = shaolinFistEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-additional')
            condition.shaolin_additional = shaolinAdditionalEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-weapons')
            condition.shaolin_weapons = shaolinWeaponEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-sword')
            condition.shaolin_sword = shaolinSwordEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-sword')
            condition.wudang_sword = wudangSwordEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-core')
            condition.wudang_core = wudangCoreEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-defense')
            condition.defense = schoolDefenseEffects(rows.filter(r => r.condition_id === condition.id), wudangDefenses);
        if (condition.parameters.collection_group === 'wudang-passive')
            condition.wudang_passive = wudangPassiveEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-special')
            condition.wudang_special = wudangSpecialEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-shenmen')
            condition.shenmen_passive = shenmenPassiveEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-unarmed')
            condition.wudang_unarmed = wudangUnarmedEffects(rows.filter(r => r.condition_id === condition.id));
        if (['wudang-combination', 'shaolin-combination', 'emei-combination'].includes(condition.parameters.collection_group))
            condition.combination_effects = wudangCombinationEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-bout')
            condition.bout_effects = wudangBoutEffects(rows.filter(r => r.condition_id === condition.id));
        if (['shaolin-bout', 'emei-bout'].includes(condition.parameters.collection_group))
            condition.bout_effects = schoolBoutEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-bout')
            condition.bout_effects = gumuSchoolBoutEffects(rows.filter(r => r.condition_id === condition.id), condition);
        if (['wudang-public-force', 'shaolin-public-force', 'emei-public-force', 'gumu-public-force', 'mingjiao-public-force'].includes(condition.parameters.collection_group))
            condition.public_force = publicForceEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-public-force' && condition.parameters.ability === 'roar')
            condition.roar = shaolinRoarEffects(rows.filter(r => r.condition_id === condition.id));
        if (['wudang-healing', 'shaolin-healing', 'emei-healing'].includes(condition.parameters.collection_group))
            condition.healing = healingEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters.ability);
        if (['wudang-dispel', 'shaolin-dispel', 'emei-dispel'].includes(condition.parameters.collection_group))
            condition.dispel = dispelEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters);
        if (['wudang-buffs', 'shaolin-buffs', 'emei-buffs'].includes(condition.parameters.collection_group))
            condition.buffs = buffSequenceEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'gumu-healing')
            condition.healing = gumuSupportEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters);
        if (condition.parameters.collection_group === 'gumu-dispel')
            condition.dispel = gumuSupportEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters);
        if (condition.parameters.collection_group === 'gumu-buffs')
            condition.buffs = gumuSupportEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters);
        if (condition.parameters.collection_group === 'wudang-lookup')
            condition.lookup = lookupEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'wudang-condition')
            condition.condition_ticks = conditionEffects(rows.filter(r => r.condition_id === condition.id));
        if (['quanzhen-recovery', 'wudang-recovery', 'shaolin-recovery', 'emei-recovery', 'gumu-recovery'].includes(condition.parameters.collection_group))
            condition.recovery = schoolRecoveryEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'quanzhen-auxiliary')
            condition.auxiliary = schoolAuxiliaryEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'shaolin-defense')
            condition.shaolin_defense = shaolinDefenseEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'emei-defense')
            condition.emei_defense = emeiDefenseEffects(rows.filter(r => r.condition_id === condition.id));
        if (['quanzhen-study', 'wudang-study'].includes(condition.parameters.collection_group))
            condition.study = schoolStudyEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters.skill);
        if (['quanzhen-cultivation', 'wudang-cultivation', 'shaolin-cultivation', 'emei-cultivation', 'emei-yijin', 'gumu-cultivation'].includes(condition.parameters.collection_group))
            condition.cultivation = schoolCultivationEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters.skill);
        if (['wudang-cultivation', 'shaolin-cultivation', 'emei-cultivation', 'emei-yijin', 'gumu-cultivation'].includes(condition.parameters.collection_group) && condition.method === 'interface')
            condition.auxiliary = schoolAuxiliaryEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.method === 'practice')
            condition.practice = schoolPracticeEffects(rows.filter(r => r.condition_id === condition.id), condition.parameters.skill);
        if (['wudang-learning', 'shaolin-weapon-learning', 'shaolin-unarmed-learning', 'emei-learning'].includes(condition.parameters.collection_group) && condition.method === 'interface')
            condition.qualification = schoolQualificationEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'huashan-learning')
            condition.learning = schoolLearningEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'huashan-defense')
            condition.defense = schoolDefenseEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'huashan-upgrade')
            condition.upgrade = schoolUpgradeEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'quanzhen-sword')
            condition.quanzhen_sword = quanzhenSwordEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'quanzhen-basic')
            condition.quanzhen_basic = quanzhenBasicEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'quanzhen-advanced')
            condition.quanzhen_advanced = quanzhenAdvancedEffects(rows.filter(r => r.condition_id === condition.id));
        if (condition.parameters.collection_group === 'quanzhen-defense') {
            const selected = rows.filter(r => r.condition_id === condition.id);
            if (condition.parameters.observation_role === 'defense') condition.defense = schoolDefenseEffects(selected, quanzhenDefenses);
            else condition.passive = quanzhenPassiveEffects(selected);
        }
    }
    return { ...report, directory, evidence_sha256: digest(rows.map(r => [key(r), r.raw_sha256]).sort()),
        runtime_errors: rows.filter(r => r.outcome === 'error').map(r => ({
            condition_id: r.condition_id, index: r.index, reason: r.raw.reason, raw_sha256: r.raw_sha256,
        })),
        totals: { conditions: conditions.length, samples: rows.length,
            observed: rows.filter(r => r.outcome === 'observed').length,
            refused: rows.filter(r => r.outcome === 'refused').length,
            errors: rows.filter(r => r.outcome === 'error').length } };
}

export function schoolCombatMarkdown(report, manifest, rows, sourceContext) {
    const expectedCombination = manifest?.identity?.conditions?.filter(c =>
        ['mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group)) ?? [];
    for (const original of expectedCombination) {
        const summaries = report.conditions.filter(c => c.id === original.id);
        assert.equal(summaries.length, 1, '原明教条件须有唯一报告，不以摘要标志省略源码校验');
        assert.ok(summaries[0].mingjiao_combination, '原明教条件须重算原 manifest/rows');
    }
    const combination = report.conditions.filter(c => c.mingjiao_combination);
    // Keep the legacy common table unchanged; these conditions have their own
    // original-row recomputed section instead of fabricated two-USER effects.
    if (combination.length) report = { ...report,
        conditions: report.conditions.filter(c => !c.mingjiao_combination) };
    if (combination.length && !sourceContext) sourceContext = {
        catalog: collectCatalog(root, buildInventory(root)),
        readSource: path => readFileSync(join(root, path), 'utf8') };
    const f = value => value === null ? '未知' : value.toFixed(2);
    const lines = ['# 门派组合：效果统计', '',
        `系列：\`${report.fingerprint}\`；证据摘要：\`${report.evidence_sha256}\`。`, '',
        `${report.totals.conditions} 条件、${report.totals.samples} 样本；正常观察 ${report.totals.observed}、拒绝 ${report.totals.refused}、运行错误 ${report.totals.errors ?? 0}。`, '',
        ...(report.runtime_errors?.length ? ['本报告含原游戏运行错误，只表示证据采齐，不表示效果通过；错误不进入正常效果分母。', '',
            ...report.runtime_errors.map(r => `- 错误样本：\`${r.condition_id}.${r.index}\`；原错误与hash见JSON及系列台账。`), ''] : []),
        '气血/创伤分列，不相加。即时忙乱与掉剑为样本次数，不等于中途触发次数；expiry/打坐与原心跳交锋按各条件时钟观察，其他条件只观察即时状态。不将即时结果当作持续实战收益。', '',
        '| 条件 | 正常/拒绝 | 对方气血支出均值 | 对方创伤均值 | 自身内力支出均值 | 对方即时忙乱样本 | 掉剑样本 |',
        '| --- | ---: | ---: | ---: | ---: | ---: | ---: |'];
for (const c of report.conditions.filter(c => !c.slice1 && !c.slice2 && !c.slice3 && !c.slice4 && !c.slice5 && !c.slice6 && !c.slice7 && !c.slice8 && !c.b1 && !c.b2 && !c.b3 && !c.b4 && !c.b5 && !c.b6 && !c.b7 && !c.b8 && !c.b9 && !c.b10 && !c.b11 && !c.b12 && !c.b13 && !c.b14 && !c.b15 && !c.b16 && !c.b17 && !c.b18 && !c.b19 && !c.b20 && !c.b21 && !c.b22 && !c.b23 && !c.b24 && !c.b25 && !c.b26 && !c.b27 && !c.b28 && !c.b29 && !c.mingjiao_force_remaining && !c.mingjiao_remaining_base && !c.mingjiao_remaining_perform && !c.mingjiao_teachers && !c.mingjiao_apprentice_learning && !c.mingjiao_ling_perform && !c.mingjiao_ling_learning && !c.mingjiao_shenghuo && !c.mingjiao_shengong && !c.mingjiao_movement && !c.mingjiao_xinfa && !c.mingjiao_qishang && !c.mingjiao_core && !c.taohua_combo && !c.taohua_bihai && !c.taohua_passive && !c.taohua_combination && !c.taohua_force && !c.taohua_music && !c.taohua_npc && !c.taohua_attack && !c.taohua_control && !c.taohua_direct && !c.taohua_zhuan && !c.taohua_xiao && !c.taohua_ding && !c.taohua_po && !c.npc_bout_effects && !c.gumu_npc && !c.gumu_temporal && !c.gumu_zhi && !c.gumu_quanzhen && !c.gumu_research && !c.gumu_unarmed_learning && !c.gumu_weapon_learning && !c.gumu_exert && !c.gumu_movement && !c.gumu_hubo && !c.npc && !c.emei_defense && !c.shaolin_defense && !c.learning && !c.defense && !c.upgrade && !c.practice && !c.cultivation && !c.auxiliary && !c.study && !c.recovery && !c.bout_effects && !c.public_force && !c.healing && !c.dispel && !c.buffs && !c.lookup && !c.condition_ticks && !c.shaolin_exert && !c.shaolin_backlash && !c.mingjiao_recruit && !c.mingjiao_gift && !c.mingjiao_book && !c.mingjiao_jiuyang && !c.mingjiao_qkd && !c.mingjiao_jiuyang_learning && !c.mingjiao_jiuyang_direct && !c.mingjiao_jiuyang_remaining && !c.mingjiao_jiuyang_exert && !c.mingjiao_jiuyang_capacity && !c.mingjiao_jiuyang_research && !c.mingjiao_jiuyang_fusion)) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
        + ` | ${f(c.sides[1].metrics.qi_cost.mean)} | ${f(c.sides[1].metrics.eff_qi_cost.mean)}`
        + ` | ${f(c.sides[0].metrics.neili_cost.mean)} | ${c.effects.target_controlled.successes} | ${c.effects.weapon_dropped.successes} |`);
    for (const c of combination)
        lines.push('', mingjiaoCombinationMarkdown(c.mingjiao_combination, manifest,
            rows.filter(r => r.condition_id === c.id), sourceContext));
    for (const c of report.conditions.filter(c => c.npc_bout_effects))
        lines.push('', (c.parameters.collection_group === 'emei-npc-bout' ? emeiNpcBoutMarkdown : gumuNpcBoutMarkdown)(c.npc_bout_effects));
    for (const c of report.conditions.filter(c => c.taohua_ding))
        lines.push('', taohuaDingMarkdown(c.taohua_ding));
    for (const c of report.conditions.filter(c => c.taohua_xiao))
        lines.push('', taohuaXiaoMarkdown(c.taohua_xiao));
    const taohuaPo = report.conditions.filter(c => c.taohua_po);
    if (taohuaPo.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·弹指神通「破九域」：创伤与缴械', '',
            '本招不是破甲：原路径为创伤、桃花瓣命中回调及可选缴械，不调用普通攻击或公共直伤。普攻计数为零不能当作绝招失手；命中与缴械各用实际分母，括号区间为 Wilson 95%。数值分布为均值 [P10, P90]，完整分布见 JSON。', '',
            '| 条件 | 已记录/计划 | 受理/拒绝/错误/不适用/缺样本 | 原命令成本：受理/拒绝 | 普攻/普攻命中/公共直伤均次 | 命中/受理 | 缴械/持兵命中 | 缴械/受理 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaPo) {
            const s = c.taohua_po, e = s.effects, m = c.sides[0].metrics;
            const attacks = m.hit.n ? m.hit.mean + m.dodge.mean + m.parry.mean : null;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}/${c.counts.not_applicable}/${c.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${f(attacks)}/${f(m.hit.mean)}/${f(m.direct.mean)}`
                + ` | ${rate(e.hit)} | ${rate(e.disarm_among_armed_hits)} | ${rate(e.disarm_per_accepted)} |`);
        }
        lines.push('', '原命令正整数是执行成本，不是内力费用或命中次数。错误与缺样本保持未知，拒绝不进入正常效果分母；无持兵命中时缴械条件概率未知。', '',
            '| 条件 | 创伤：受理/命中分布 | 当前气血夹制/净减少均值 | 自身内力毛扣/净减少均值 | 目标内力毛扣/净减少均值 | 耗片均值 | 桃花瓣回调均次/实参分布 | 弱熟练增长/受理 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaPo) {
            const e = c.taohua_po.effects;
            lines.push(`| ${text(c.id)} | ${spread(e.wound)} / ${spread(e.wound_on_hit)}`
                + ` | ${f(e.qi_clamp.mean)}/${f(e.target_qi_net_loss.mean)}`
                + ` | ${f(e.actor_neili_cost.mean)}/${f(e.actor_neili_net_loss.mean)}`
                + ` | ${f(e.target_neili_cost.mean)}/${f(e.target_neili_net_loss.mean)} | ${f(e.ammunition_cost.mean)}`
                + ` | ${f(e.needle_calls.mean)} / ${spread(e.hit_bonus)} | ${rate(e.learned_progress)} |`);
        }
        lines.push('', '有效气血创伤与当前气血夹制分列，不相加作两次伤害；目标已有伤时可以命中而当前气血不降。回调实参 jiali+300 不是额外实伤；受理后的失手同样耗内力与弹药，也可增长弱熟练度。', '',
            '| 条件 | 目标卸兵属性净变均值：伤害/闪避/招架/护甲 | 自身/目标即时忙乱原值均值 | 最后一片自然销毁/末枚受理 |',
            '| --- | --- | --- | --- |');
        for (const c of taohuaPo) {
            const s = c.taohua_po, e = s.effects;
            lines.push(`| ${text(c.id)} | ${['damage', 'dodge', 'parry', 'armor'].map(k => f(s.target_apply_delta[k].mean)).join('/')}`
                + ` | ${f(e.busy.mean)}/${f(c.effects.target_busy.mean)} | ${rate(e.natural_empty_cleanup)} |`);
        }
        lines.push('', '卸兵仅在原物确实移到同房间后计入，测试剑失去伤害加成并恢复闪避，不是护甲或招架减益。忙乱 2/3 为即时状态值，未测自然解除秒数。最后一片先同步减到 0，随后原零延迟回调自然销毁；只核销毁事实，不把调用延迟或样本耗时当成实测清理时长。');
        for (const c of taohuaPo)
            for (const [label, entries] of [['拒绝', c.taohua_po.refusals], ['错误', c.taohua_po.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaZhuan = report.conditions.filter(c => c.taohua_zhuan);
    if (taohuaZhuan.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·弹指神通「转乾坤」：普通直伤与直接死亡', '',
            '原命令执行成本、内力支出、命中与直接死亡分别统计。原 die(actor) 分支没有公共直伤调用、技能内力费用为 0；死亡后气血归 1 是死亡结算，不是普通招式伤害。数值为均值 [P10, P90]，概率区间为 Wilson 95%；错误和缺样本不补零。', '',
            '| 条件 | 已记录/计划 | 受理/拒绝/错误/缺样本 | 原命令成本：受理/拒绝 | 命中/受理 | 直接死亡/受理 | 受理失手 | 弱熟练增长/受理 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaZhuan) {
            const s = c.taohua_zhuan, e = s.effects;
            lines.push(`| ${text(c.id)} | ${s.recorded}/${s.planned} | ${e.accepted_samples}/${e.refused_samples}/${e.counts.error}/${s.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${rate(e.hit)} | ${rate(e.direct_death)} | ${e.misses} | ${rate(e.learned_progress)} |`);
        }
        lines.push('', '| 条件 | 原AP/DP/前五指法等级总和均值 | 普通直伤样本 | 直伤入参/创伤百分比分布 | 普通实际气血/有效气血损伤分布 | 受理内力支出分布 | 自身即时忙乱均值 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaZhuan) {
            const e = c.taohua_zhuan.effects;
            lines.push(`| ${text(c.id)} | ${f(e.ap.mean)}/${f(e.dp.mean)}/${f(e.sum.mean)} | ${e.ordinary_damage_samples}`
                + ` | ${spread(e.direct_input)} / ${spread(e.wound_percent)}`
                + ` | ${spread(e.ordinary_qi_damage)} / ${spread(e.ordinary_qi_wound)}`
                + ` | ${spread(e.actor_neili_cost)} | ${f(e.actor_busy.mean)} |`);
        }
        lines.push('', '普通损伤分布仅纳入非死亡命中；失手及直接死亡没有直伤入参，保留未知计数。前五门指法按原 LPC 技能 keys 顺序选取，不按报告名称排序。受理后即使失手也可能有弱熟练增长；忙乱 2/3 只是同步状态，不是实测解除秒数。', '',
            '| 条件 | 直接死亡样本 | 死亡结算净减少：气血/有效气血/精神/有效精神/内力均值 | 最大内力/战斗经验/潜能损失均值 | 杀人/通缉/实战经验实际增量均值 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of taohuaZhuan) {
            const d = c.taohua_zhuan.death;
            lines.push(`| ${text(c.id)} | ${d.samples}`
                + ` | ${['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'].map(k => f(d.target_net_loss[k].mean)).join('/')}`
                + ` | ${['max_neili', 'combat_exp', 'potential'].map(k => f(d.target_net_loss[k].mean)).join('/')}`
                + ` | ${['pks', 'wanted_pks', 'experience'].map(k => f(d.killer_delta[k].mean)).join('/')} |`);
        }
        lines.push('', '直接死亡仍走原 USER 掉级、尸体、卸装和阴司入口；上述净差不冒充单向技能伤害。确切尸体、原剑对象及归属保存在 JSON death.ownership；原已学技能变化保留于样本前后快照。没有死亡样本时，损失和奖励均未知，不当作零。同步窗口未观察复活或自然后续。');
        for (const c of taohuaZhuan)
            for (const [label, entries] of [['拒绝', c.taohua_zhuan.refusals], ['错误', c.taohua_zhuan.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaDirect = report.conditions.filter(c => c.taohua_direct);
    if (taohuaDirect.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·四项直伤：原输入与实际结算', '',
            '碧浪滔天、披星戴月、奇门五转与天外清音分别按冻结条件统计，不作强弱排名。命中指本招实际进入公共直伤；普攻 hit/dodge/parry 为零不能当作绝招失手。原命令正整数是执行成本，不是内力费用或命中次数。分布为均值 [P10, P90]，概率区间为 Wilson 95%。', '',
            '| 条件 | 绝招 | 已记录/计划 | 受理/拒绝/错误/缺样本 | 原命令成本：受理/拒绝 | 命中/受理 | 受理失手 | 弱熟练增量：受理分布 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaDirect) {
            const s = c.taohua_direct, e = s.effects;
            lines.push(`| ${text(c.id)} | ${text(s.name)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${rate(e.hit_when_accepted)} | ${e.accepted - e.hit_when_accepted.successes} | ${spread(e.learned_delta)} |`);
        }
        lines.push('', '| 条件 | 直伤入参：仅命中分布 | 实际气血/创伤：受理分布 | 自身内力支出：受理分布 | 自身/目标即时忙乱：受理分布 | 普通剑耐久减少：仅命中分布 |',
            '| --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaDirect) {
            const s = c.taohua_direct, e = s.effects;
            lines.push(`| ${text(c.id)} | ${spread(e.direct_input_when_hit)}`
                + ` | ${spread(e.qi_damage)} / ${spread(e.qi_wound)} | ${spread(e.actor_neili_cost)}`
                + ` | ${spread(e.actor_busy)} / ${spread(e.target_busy)}`
                + ` | ${s.ordinary_sword_wear_when_hit === null ? '不适用（徒手）' : spread(s.ordinary_sword_wear_when_hit)} |`);
        }
        lines.push('', '直伤入参不等于最终损血，气血与创伤分列且不相加。仅命中分布不含失手；受理分布包含原失手的零伤害、实际费用及可能的弱熟练增长。拒绝、错误与缺样本不进入受理分母；没有命中时入参和剑耐久分布未知，不补零。', '',
            '天外清音使用原测试普通剑，其命中耐久减少是物品 hit_ob 行为，不是玉箫剑法被动，也不要求箫资格。其余三招徒手，剑耐久不适用。忙乱为同步状态值，不是实测解除秒数；本组没有自然心跳、回调或完整交锋观察。');
        for (const c of taohuaDirect)
            for (const [label, entries] of [['拒绝', c.taohua_direct.refusals], ['错误', c.taohua_direct.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaControl = report.conditions.filter(c => c.taohua_control);
    if (taohuaControl.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·兰花拂穴／随波逐流：即时纯控制', '',
            '两招分别按冻结条件统计，不作强弱排名。受理不等于控制命中：命中只计本次新增的目标忙乱；已有忙乱 50 导致的拒绝不是控制成功。原命令正整数是执行成本，不是内力费用或命中次数。分布为均值 [P10, P90]，概率区间为 Wilson 95%。', '',
            '| 条件 | 绝招 | 已记录/计划 | 受理/拒绝/错误/缺样本 | 原命令成本：受理/拒绝 | 控制/受理 | 控制/已知命令 | 受理失手 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaControl) {
            const s = c.taohua_control, e = s.effects;
            lines.push(`| ${text(c.id)} | ${text(s.name)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${rate(e.control_given_accepted)} | ${rate(e.control_per_known_command)} | ${e.accepted_misses} |`);
        }
        lines.push('', '| 条件 | 目标初始/结束忙乱：已知命令分布 | 新增忙量：仅控制命中 | 自身忙乱：受理分布 | 原内力毛扣/剩余内力：受理分布 | 负内力/受理 | 弱熟练增长/受理及增量分布 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaControl) {
            const e = c.taohua_control.effects;
            lines.push(`| ${text(c.id)} | ${spread(e.target_busy_initial)} / ${spread(e.target_busy_final)}`
                + ` | ${spread(e.acquired_busy)} | ${spread(e.actor_busy)}`
                + ` | ${spread(e.actor_neili_cost)} / ${spread(e.actor_neili_remaining)}`
                + ` | ${rate(e.negative_neili)} | ${rate(e.learned_progress)} / ${spread(e.learned_delta)} |`);
        }
        lines.push('', '已知命令分母包含受理与拒绝，错误和缺样本不进入该分母；内力、自忙和熟练分布只含受理，新增忙量只含控制命中。没有受理或命中时相关分布未知，不补零；拒绝原命令成本 0 不代表已观察正常效果。', '',
            '兰花失手原内力费用为 0；随波失手原累计毛扣 180，入场内力 100 时实际剩余 −80，保留原负值而不归零补款。受理后失手仍可增长弱熟练，不能当作控制成功。目标初忙 50 原样保留；忙乱整数是即时状态，不是实测解除秒数。本组没有直伤、自然心跳、回调或自然解忙观察。');
        for (const c of taohuaControl)
            for (const [label, entries] of [['拒绝', c.taohua_control.refusals], ['错误', c.taohua_control.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaAttack = report.conditions.filter(c => c.taohua_attack);
    if (taohuaAttack.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·六门普攻：实际选招与一次攻击', '',
            `六门共 ${taohuaAttacks.reduce((n, d) => n + d.levels.length, 0)} 条普通动作静态条目，兰花额外动作另计；这不是本批已选中或已命中的条目数。每条正常样本只调用一次原 do_attack，报告原 query_action 的实际选择，不重新选招。各冻结条件分别统计，不排名；分布为均值 [P10, P90]，攻击结果与额外选招比例区间为 Wilson 95%。`, '',
            '| 条件 | 已记录/计划 | 正常/拒绝/错误/未适用/缺样本 | 本门静态条目/实际动作文本种数 | 命中/攻击 | 闪避/攻击 | 招架/攻击 | 实际选招次数 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaAttack) {
            const s = c.taohua_attack, e = s.effects;
            lines.push(`| ${text(c.id)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.counts.not_applicable}/${s.missing}`
                + ` | ${s.static_action_entries}/${s.selected_action_texts}`
                + ` | ${rate(e.hit)} | ${rate(s.dodge)} | ${rate(s.parry)}`
                + ` | ${Object.entries(e.move_counts).map(([name, count]) => `${text(name)}：${count}`).join('<br>') || '未观察'} |`);
        }
        lines.push('', '| 条件 | 对方实际气血支出/创伤：正常分布 | 自身内力毛扣：正常分布 | 兰花额外选中/攻击 | 额外选中后的命中/闪避/招架；选中数 | 额外选中时内力毛扣 | 武学回调：到达；返回0/null；未到达；其中命中未到达 | 普通主手剑耐久观察 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaAttack) {
            const s = c.taohua_attack, e = s.effects, a = s.extra_action, m = s.martial_callback, w = s.ordinary_sword;
            lines.push(`| ${text(c.id)} | ${spread(e.target_qi_loss)} / ${spread(e.target_wound)}`
                + ` | ${spread(e.actor_neili_cost)} | ${e.lanhua_extra_action ? rate(e.lanhua_extra_action) : '不适用'}`
                + ` | ${a ? `${a.hit}/${a.dodge}/${a.parry}；${a.samples}` : '不适用'}`
                + ` | ${a ? spread(a.actor_neili_cost) : '不适用'}`
                + ` | ${m.reached}；${m.returned_zero}/${m.returned_null}；${m.not_reached}；${m.hits_without_callback}`
                + ` | ${w ? `持剑 ${w.samples}；命中 ${w.hit_samples}；命中且到达武学回调 ${w.hit_reached_martial_samples}；该子集耐久减少 ${spread(w.wear_when_hit_and_martial_reached)}；已见减1 ${w.changed_samples}` : '攻击方未持剑'} |`);
        }
        lines.push('', '动作文本种数不是静态条目覆盖率。兰花额外动作在选招时先扣 300 内力，随后即使闪避或招架也不退款；选中次数不是命中次数。边界的两次样本仅核原门槛和实际结果，不能当作完整随机分布。', '',
            '命中按原 attack.result=0 计，不要求实际损血大于0；气血支出与创伤不相加。本窗口无恢复，因此经原资源账核对的净减少等于毛扣；错误、未适用和缺样本不进入正常攻击或费用分母，空分母保持未知。', '',
            '六门无自有 hit_ob；到达原武学调用后的实际 0/null 返回与未到达调用分开。命中可能在零伤害分支提前返回，不能强制每次命中都有回调；未到达不补成返回0。剑耐久100→99是原普通物品行为，表中命中且到达武学回调只是耐久观察子集，不是独立 item.hit_ob 调用次数或触发概率；物品回调次数未观察。本组没有自然心跳、持续交锋或自然DPS数据。');
        for (const c of taohuaAttack)
            for (const entry of c.taohua_attack.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaCombo = report.conditions.filter(c => c.taohua_combo);
    if (taohuaCombo.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·狂风绝技与影落飞花：原六击循环', '',
            '每次受理调用原连击循环，实际出手 1–6 次；不是六次独立命令。影落飞花的攻击加成判定失败仍受理、仍连击并扣基础内力。各条件独立统计，不排名；分布为均值 [P10, P90]，比例区间为 Wilson 95%，同一次连击内的逐击观察不视为彼此独立的实战成功率。', '',
            '| 条件 | 绝招 | 已记录/计划 | 受理/拒绝/错误/未适用/缺样本 | 原命令成本：受理/拒绝 | 飞花有加成/受理 | 实际击数：受理分布 | 命中/攻击；命中/闪避/招架次数 | 原切磋收招/受理；短连次数 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaCombo) {
            const s = c.taohua_combo, e = s.effects, a = s.attacks;
            lines.push(`| ${text(c.id)} | ${text(s.name)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.counts.not_applicable}/${s.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${c.parameters.ability === 'fei' ? rate(e.bonus_given_accepted) : '不适用'}`
                + ` | ${spread(e.attacks_per_accepted)} | ${rate(e.hit_given_attack)}；${a.hit}/${a.dodge}/${a.parry}`
                + ` | ${rate(e.early_stop_given_accepted)}；${a.short_combos} |`);
        }
        lines.push('', '| 条件 | 对方实际气血支出/创伤：受理分布 | 基础/逐击额外/总内力毛扣：已知命令分布 | 兰花额外选中/有资格选招 | 额外选中后的命中/闪避/招架；选中数 | 弱熟练增量：已知命令分布 |',
            '| --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaCombo) {
            const s = c.taohua_combo, e = s.effects, a = s.extra_action;
            lines.push(`| ${text(c.id)} | ${spread(e.damage_per_accepted)} / ${spread(e.wound_per_accepted)}`
                + ` | ${spread(e.base_cost)} / ${spread(e.action_surcharge_cost)} / ${spread(e.actor_neili_cost)}`
                + ` | ${c.parameters.ability === 'fei' ? rate(e.lanhua_surcharge_given_eligible_action) : '不适用'}`
                + ` | ${a.hit}/${a.dodge}/${a.parry}；${a.selected} | ${spread(e.learned_delta)} |`);
        }
        lines.push('', '| 条件 | 逐击攻击加成：受理分布 | 狂风实际置忙/可置忙攻击 | 自身即时忙乱：已知命令分布 | 目标初始/最终忙乱：已知命令分布 | 武学回调：到达；返回0/null；未到达 | 命中但实际伤害0次数 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaCombo) {
            const s = c.taohua_combo, e = s.effects, m = s.martial_callback;
            lines.push(`| ${text(c.id)} | ${spread(e.attack_bonus)}`
                + ` | ${c.parameters.ability === 'kuang' ? rate(e.kuang_busy_given_available_attack) : '不适用'}`
                + ` | ${spread(e.actor_busy)} | ${spread(e.target_busy_initial)} / ${spread(e.target_busy_final)}`
                + ` | ${m.reached}；${m.returned_zero}/${m.returned_null}；${m.not_reached} | ${s.attacks.zero_damage_hits} |`);
        }
        lines.push('', '原命令正整数是执行成本，不是受理次数或内力费用。已知命令分母包含受理与拒绝；攻击、伤害和加成分布只含受理。错误、未适用和缺样本不补成零消耗、零伤害或失败，空分母保持未知；拒绝的已知零费用仍单独保留。', '',
            '狂风基础费 100、飞花基础费 150。兰花逐次选招先按当时的等级、经络与剩余内力判断资格，额外动作一旦选中即扣 300，随后闪避或招架不退款；选中不是命中，不能固定用每次六击作资格分母。气血支出与创伤分别记账，不相加；本窗口无恢复，内力毛扣与经原资源账核对的净减少相等。弱熟练增长也可发生在加成失败或全失手后，不代表命中。', '',
            '狂风桃花门人按原等级/4加攻击及其一半徒手伤害，非桃花仍可受理但没有该加成；飞花成功按原等级/5加攻击，结束均回收。可置忙机会、实际置忙和最终忙乱分开：原普通命中造成正伤害会打断整数忙乱，初忙 50 也可能被打断，不能从最终值倒推置忙次数。忙乱为即时计数，不换算解除秒数。', '',
            '仅两条低气血条件使用原切磋关系；达到原收招条件可短于六击，全失手则仍可能六击。不人为停止循环。两门无自有 hit_ob，原调用的 0/null 返回与未到达分列；本组没有自然心跳、持续交锋或自然DPS观察。');
        for (const c of taohuaCombo)
            for (const [label, entries] of [['拒绝', c.taohua_combo.refusals], ['错误/未适用', c.taohua_combo.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaBihai = report.conditions.filter(c => c.taohua_bihai);
    if (taohuaBihai.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·碧海潮生按玉箫：即时总精神效果', '',
            '只统计原绝招一次命令的总精神损失及有效精神创伤，不是普通气血攻击，也不是碧海潮生曲演奏。正效果率为总精神损失大于零的受理样本比例；四段内部随机判定未逐段观察，不由总量反推四段命中率。各条件独立统计，不排名；分布为均值 [P10, P90]，比例区间为 Wilson 95%。', '',
            '| 条件 | 已记录/计划 | 受理/拒绝/错误/缺样本 | 原命令成本：受理/拒绝 | 受理/已知命令 | 总效果正值/受理；零值次数 | 精神损失/有效精神创伤：受理分布 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaBihai) {
            const s = c.taohua_bihai, e = s.effects;
            lines.push(`| ${text(c.id)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.missing}`
                + ` | ${spread(s.commands.accepted_execution_cost)} / ${spread(s.commands.refused_execution_cost)}`
                + ` | ${rate(s.commands.acceptance)} | ${rate(e.positive_effect)}；${e.zero_effects}`
                + ` | ${spread(e.jing_damage)} / ${spread(e.jing_wound)} |`);
        }
        lines.push('', '| 条件 | 实际AP/DP：受理分布 | 自身/对方内力毛扣：受理分布 | 自身即时忙乱：分布；1/2/3次数 | 弱熟练增量；增长/受理 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of taohuaBihai) {
            const s = c.taohua_bihai, e = s.effects;
            lines.push(`| ${text(c.id)} | ${spread(e.ap)} / ${spread(e.dp)}`
                + ` | ${spread(e.actor_neili_cost)} / ${spread(e.target_neili_cost)}`
                + ` | ${spread(e.busy)}；${e.busy_histogram[1]}/${e.busy_histogram[2]}/${e.busy_histogram[3]}`
                + ` | ${spread(e.learned_delta)}；${rate(e.learned_progress)} |`);
        }
        lines.push('', '效果、费用、忙乱和弱熟练分布均以受理为分母，真实零效果仍保留。拒绝的零费用与零增长经原资源账校验，拒绝不充作已受理零效果；错误和缺样本不补成零，空分母保持未知，错误原因另列。原命令正整数是执行成本，不是受理次数或内力费用。', '',
            '受理固定扣除自身 200 内力，即使总精神效果为零也扣费；对方内力毛扣为 0、内力保持不变，并非归零。对方精神损失与有效精神创伤分别为原总量 D 和整数截断的 2D/3，不相加为单一损伤。本组无资源恢复，已核对前后净减少与原毛扣一致。', '',
            '自身忙乱为原即时 1–3 计数，不换算自然解除秒数；弱模式熟练增长可出现在零总效果后，不代表命中、教学奖励或技能升级。原手持有效箫优先、否则回退主手有效箫，不给普通剑补箫资格；没有普通攻击、兵器磨损或武学命中被动。本组不观察自然心跳、完整交锋或自然DPS。');
        for (const c of taohuaBihai)
            for (const [label, entries] of [['拒绝', c.taohua_bihai.refusals], ['错误', c.taohua_bihai.exceptional]])
                for (const entry of entries) lines.push('', `${label} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaPassive = report.conditions.filter(c => c.taohua_passive);
    if (taohuaPassive.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}，未知=${value.unknown}）`
            : `未观察（n=0，未知=${value.unknown}）`;
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·玉箫剑法命中被动：一次原接口与精神创伤', '',
            '每条正常样本只调用一次原 hit_ob，不执行普通攻击。实际返回 0/null 仍是已观察接口，不是命令拒绝或普攻失手；字符串返回才计被动触发。未满足确定性守卫与满足守卫但随机未触发分列，不能由空返回推断实际随机调用次数。各条件独立统计，不排名；分布为均值 [P10, P90]，触发比例区间为 Wilson 95%。', '',
            '| 条件 | 已记录/计划 | 接口观察/错误/未适用/缺样本 | 原命令执行成本 | 守卫无效/满足守卫未触发 | 原返回0/null/触发文本 | 触发/全部调用 | 触发/满足守卫调用 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaPassive) {
            const s = c.taohua_passive, e = s.effects;
            lines.push(`| ${text(c.id)} | ${s.recorded}/${s.planned}`
                + ` | ${s.counts.observed}/${s.counts.error}/${s.counts.not_applicable}/${s.missing}`
                + ` | ${spread(s.commands.execution_cost)} | ${e.guard_no_effect}/${s.eligible_no_effect}`
                + ` | ${s.returns.zero}/${s.returns.null}/${s.returns.triggered}`
                + ` | ${rate(e.trigger_per_call)} | ${rate(e.trigger_when_eligible)} |`);
        }
        lines.push('', '| 条件 | 自身内力实际支出：全部/触发 | 对方当前精神净减：全部/触发 | 对方有效精神创伤：全部/触发 | 即时夹制至−1次数 | 请求量观察；触发时源码支持区间 |',
            '| --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaPassive) {
            const s = c.taohua_passive, e = s.effects, support = e.requested_wound.source_support_if_triggered;
            lines.push(`| ${text(c.id)} | ${spread(e.actor_neili_cost)} / ${spread(e.triggered_neili_cost)}`
                + ` | ${spread(e.target_jing_loss)} / ${spread(e.triggered_jing_loss)}`
                + ` | ${spread(e.target_eff_jing_loss)} / ${spread(e.triggered_eff_jing_loss)}`
                + ` | ${e.immediate_clipped} | not_observed；${support.min}..${support.max} |`);
        }
        lines.push('', '原命令正整数是执行成本，不是内力费用、接口次数或触发次数。满足守卫仍需通过原 random(2)；触发才扣 60 内力。所有正常调用（包括真实无触发）与触发子集分别列分布，错误、未适用和缺样本不补零，空分母保持未知。', '',
            '精神创伤请求仅给源码支持区间，实际请求未直接观察，不把区间均值当实测均值。原 receive_wound 先减少有效精神，再将当前精神夹到新上限，最低为 −1；两项实际损失不可相加。当前精神低于新上限时可不减少；有效精神200/当前精神100被夹至−1时实际损失201/101，不能倒推原请求。本组无资源恢复，原实际计数与各自前后净减少核对一致。', '',
            '普通剑保持原装备，不补箫资格；这里没有物品命中回调或耐久损耗，也没有普攻命中率。观察窗口为即时0秒，无自然心跳，−1不等于已观察昏迷或死亡；原请求、craze、最后伤害归属与后续昏迷/死亡均为 not_observed。不外推自然交锋收益或自然DPS；未映射条件仅诊断接口守卫，不冒充正常普攻可达路径。');
        for (const c of taohuaPassive)
            for (const entry of c.taohua_passive.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaCombination = report.conditions.filter(c => c.taohua_combination);
    if (taohuaCombination.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => {
            const unknown = Object.hasOwn(value, 'unknown') ? `，未知=${value.unknown}` : '';
            return value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}${unknown}）`
                : `未观察（n=0${unknown}）`;
        };
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        const frequency = value => value.trials ? `${value.successes}/${value.trials}；${f(value.rate * 100)}%` : '未知（分母0）';
        lines.push('', '## 桃花岛·互备：原准备命令与单次攻击轮', '',
            '旋风扫叶腿与劈空掌、兰花拂穴手与落英神剑掌分别统计；仅准备、单备一轮和双备一轮不是同一分母。每个出招样本只调用一次原 fight，双备不保证双击，实际出手次序取原 preparations 的 keys 顺序，不按命令参数顺序推断。各条件独立，不排名。分布为均值 [P10, P90]，双击率区间为 Wilson 95%；相关出招的命中频率不报独立试验区间。', '',
            '| 条件 | 类型 | 已记录/计划；正常/错误/未适用/缺样本 | 准备受理/拒绝步骤 | 原命令执行成本 | 仅准备/攻击轮/出招轮 | 出招数；单击轮/双击轮 | 双击/全部轮 | 双击/出招轮 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaCombination) {
            const s = c.taohua_combination, e = s.effects;
            const label = { 'pair-prepare': '仅准备', 'solo-round': '单备一轮', 'pair-round': '双备一轮' }[s.variant];
            lines.push(`| ${text(c.id)} | ${label} | ${s.recorded}/${s.planned}；${s.counts.observed}/${s.counts.error}/${s.counts.not_applicable}/${s.missing}`
                + ` | ${s.commands.accepted}/${s.commands.refused} | ${spread(s.commands.execution_cost)}`
                + ` | ${e.prepare_only_samples}/${e.rounds}/${e.attacking_rounds}`
                + ` | ${e.primary_attacks}；${e.attacking_rounds - e.double_rounds.successes}/${e.double_rounds.successes}`
                + ` | ${rate(e.double_rounds)} | ${rate(e.double_given_attack)} |`);
        }
        lines.push('', '| 条件 | 命中/闪躲/招架；命中但0伤 | 命中/实际出招 | 对方气血支出/创伤 | 自身内力实际支出 | 实际准备次序 | 按基本技能：出招/命中/闪躲/招架 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaCombination) {
            const s = c.taohua_combination, e = s.effects;
            const usages = Object.entries(e.by_usage).map(([usage, n]) => `${usage}：${n.all}/${n['0']}/${n['-1']}/${n['-2']}`).join('；');
            lines.push(`| ${text(c.id)} | ${s.attacks.hit}/${s.attacks.dodge}/${s.attacks.parry}；${s.attacks.zero_damage_hits}`
                + ` | ${frequency(s.attacks.hit_rate)} | ${spread(e.target_qi_loss)} / ${spread(e.target_wound)}`
                + ` | ${spread(s.actor_neili_cost)} | ${e.actual_preparation_orders.map(text).join('；') || '未观察'}`
                + ` | ${text(usages) || '未观察'} |`);
        }
        lines.push('', '原准备命令的正整数是执行成本；受理按一次命令计数，不能把成本和内力支出、样本数或出招次数相加。错误、未适用和缺样本不补零；仅准备样本的攻击轮及命中率分母为0，保持未知，不解释成战斗失败。', '',
            '本组固定初态没有目标守势，膂力保证进入攻击分支，因此不采守势零击或反击；命中但最终0伤仍按原命中结果记账。原气血支出与有效气血创伤分列，不相加。最后 fight 表仅核原可达末六项，不等于逐击选招文本已观察。', '',
            '基本内功未映射特殊内功，加力0、无经络学，兰花额外选招及300内力扣费在本配置不可达；观测到零内力支出不能外推为这些武学普遍零成本。窗口仅即时0秒，没有自然心跳、持续交锋、自然DPS或养成成本证据。');
        for (const c of taohuaCombination)
            for (const entry of c.taohua_combination.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaForce = report.conditions.filter(c => c.taohua_force);
    if (taohuaForce.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => {
            const unknown = Object.hasOwn(value, 'unknown') ? `，未知=${value.unknown}` : '';
            return value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}${unknown}）`
                : `未观察（n=0${unknown}）`;
        };
        lines.push('', '## 桃花岛·碧波神功强化/恢复与暗影浮香研修', '',
            '强化、恢复、资格/容量接口、原研究与原练习分别计量；接口返回、命令执行成本、发动、进度和毛费用各有分母，不相加也不互相冒充。部分练习返回0仍保留已完成进度。强化到期沿原绑定回调与52秒窗口，不加速时钟。实验配功为输入，不代表师承或自然养成。', '',
            '| 条件 | 方法 | 已记录/计划；正常/拒绝/错误/缺样本 | 接口返回分布 | 命令受理/尝试 | 发动 | 精神/气血毛恢复 | 内力毛扣 | 技能增长分布 | 到期回调对/秒 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaForce) {
            const s = c.taohua_force, e = s.effects;
            lines.push(`| ${text(c.id)} | ${text(c.id.split('-')[3])} | ${s.recorded}/${s.planned}；${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.missing}`
                + ` | ${spread(e.interface_result)} | ${e.commands_accepted}/${e.command_attempts} | ${e.launches}`
                + ` | ${spread(e.recovery.jing)}/${spread(e.recovery.qi)} | ${spread(e.costs.neili)}`
                + ` | ${spread(e.learned_gain)} | ${e.callback_pairs}/${spread(e.expiry_seconds)} |`);
        }
        lines.push('', '| 条件 | 精神/气血/内力净差分布 | 忙乱 0/1/2/3 | 强化判定净变：攻/防/招架 | 部分练习样本 | 有进度样本 | 研究进度点分布 |',
            '| --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaForce) {
            const e = c.taohua_force.effects;
            lines.push(`| ${text(c.id)} | ${spread(e.net.jing)}/${spread(e.net.qi)}/${spread(e.net.neili)}`
                + ` | ${[0, 1, 2, 3].map(v => e.busy_histogram[v]).join('/')}`
                + ` | ${spread(e.powers_delta.attack)}/${spread(e.powers_delta.dodge)}/${spread(e.powers_delta.parry)}`
                + ` | ${e.partial_practice_samples} | ${e.progressed_samples} | ${spread(e.learned_points)} |`);
        }
        lines.push('', '毛费用与恢复是原计量计数，净值是前后差；负净值可能来自恢复，二者不合成。忙乱是即时整数状态，不折算自然结束秒数。强化判定为原 skill_power 读数之差，不是伤害或胜率。容量接口的数值是原查询返回，不证明培养成本或可学条件。', '');
        for (const c of taohuaForce)
            for (const entry of c.taohua_force.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaMusic = report.conditions.filter(c => c.taohua_music);
    if (taohuaMusic.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => {
            const unknown = Object.hasOwn(value, 'unknown') ? `，未知=${value.unknown}` : '';
            return value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}${unknown}）`
                : `未观察（n=0${unknown}）`;
        };
        const rate = value => value.trials
            ? `${value.successes}/${value.trials}；${f(value.rate * 100)}% [${f(value.low95 * 100)}, ${f(value.high95 * 100)}]%`
            : '未知（分母0）';
        lines.push('', '## 桃花岛·碧海潮生曲与桃花怨：原乐器演奏', '',
            '原 play 命令经真实非巫师 USER 执行，不直接调用 do_effect；do_effect 只作入口来源证据。三位参与者（奏者、右试、旁试）分列，受理、命中资格、实际精神损伤/恢复和共享恢复参数各有分母；受理不等于生效。乐器准备（手持/佩带/置地/携带）与测量窗口分开，窗口内不搬人物或乐器。忙乱为即时整数，不折算秒。', '',
            '| 条件 | 曲/方式 | 已记录/计划；正常/拒绝/错误/缺样本 | 受理/拒绝 | 受理中有任一效果 | 奏者忙乱分布 | 奏者精神/内力毛扣 | 共享恢复参数 | halt尝试 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaMusic) {
            const s = c.taohua_music, e = s.effects;
            lines.push(`| ${text(c.id)} | ${text(s.song)}/${text(s.instrument_mode)} | ${s.recorded}/${s.planned}；${s.counts.observed}/${s.counts.refused}/${s.counts.error}/${s.missing}`
                + ` | ${rate(e.acceptance)} | ${e.accepted_without_effect} 无效果/${e.any_effect_given_accepted.successes} 有`
                + ` | ${[0, 1, 2, 3].map(v => (e.actor_busy.values ?? []).filter(n => n === v).length).join('/')}`
                + ` | ${spread(e.actor_costs.jing)}/${spread(e.actor_costs.neili)}`
                + ` | ${e.shared_heal_argument.n ? spread(e.shared_heal_argument) : '不适用'}`
                + ` | ${e.halt_rejected_after_completed_play} |`);
        }
        lines.push('', '| 条件 | 听者 | 受理范围样本 | 源码可达判定 | 损伤/合格 | 损伤/受理 | 精神损伤分布 | 精神创伤分布 | 精神恢复分布 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaMusic) {
            for (const l of c.taohua_music.effects.listeners)
                lines.push(`| ${text(c.id)} | ${text(l.id)} | ${l.accepted_scope_samples} | ${l.source_reachable_force_checks}`
                    + ` | ${rate(l.damage_given_eligible)} | ${rate(l.any_effect_given_accepted)}`
                    + ` | ${spread(l.jing_damage)} | ${spread(l.jing_wound)} | ${spread(l.jing_recovery)} |`);
        }
        lines.push('', '碧海潮生的内力差判定、奏者/听者有效曲艺比较与房间/存活/保护门槛为源码条件；合格而未伤、或判定不可达而未伤均保留为不同分母，不并成“失手”。桃花怨恢复上限取同次原数组调用的共享参数，逐人恢复不重抽；恢复与创伤分列，不抵消。', '');
        for (const c of taohuaMusic)
            for (const entry of c.taohua_music.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const taohuaNpc = report.conditions.filter(c => c.taohua_npc);
    if (taohuaNpc.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const spread = value => {
            const unknown = Object.hasOwn(value, 'unknown') ? `，未知=${value.unknown}` : '';
            return value.n ? `${f(value.mean)} [${f(value.p10)}, ${f(value.p90)}]（n=${value.n}${unknown}）`
                : `未观察（n=0${unknown}）`;
        };
        lines.push('', '## 桃花岛·原 NPC 配装与闭包', '',
            '取确切原 NPC 与固定高资源靶、旁观 USER；配装快照与闭包调用分列，原方法返回 0/1 与命中、直伤输入分列。物品身份/属性只允许原单枚花瓣消耗；不改 NPC 数据、不补装备，不采自然心跳交锋。', '',
            '| 条件 | NPC/效果 | 已记录/计划；正常/错误/缺样本 | 配装/闭包调用 | 返回0/1 | 普攻/直伤 | 直伤输入分布 | NPC内力净减 | 靶忙乱分布 |',
            '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of taohuaNpc) {
            const s = c.taohua_npc, e = s.effects;
            lines.push(`| ${text(c.id)} | ${text(s.npc.id)}/${text(s.npc.effect)} | ${s.recorded}/${s.planned}；${s.counts.observed}/${s.counts.error}/${s.missing}`
                + ` | ${e.loadouts}/${e.callbacks} | ${e.method_returned_zero}/${e.method_returned_one}`
                + ` | ${e.ordinary_attacks}/${e.direct_calls} | ${spread(e.direct_damage_input)}`
                + ` | ${spread(e.npc_net_neili_spent)} | ${spread(e.target_busy)} |`);
        }
        for (const c of taohuaNpc)
            for (const entry of c.taohua_npc.exceptional)
                lines.push('', `${entry.outcome === 'error' ? '错误' : '未适用'} ${text(c.id)}.${entry.index}：${text(entry.reason)}`);
    }
    const gumuNpc = report.conditions.filter(c => c.gumu_npc);
    if (gumuNpc.length) {
        lines.push('', '## 古墓原 NPC：配装与逐条闭包', '',
            '攻击方取确切原 NPC，side 0 是防御靶、side 1 是旁观者。完整观察不等于招式成功；原方法返回 0/1 与 command 的评估成本分列，子招以实际步骤计数。资源为前后净差，不冒充单向耗费；NPC 单向总耗费未观察，直伤输入不是最终损血。本组不采自然心跳交锋或强化自然解除。', '',
            '| 条件 | 完整观察/闭包调用 | 原方法返回 0/1 | command 评估成本均值 | 子招受理/步骤 | 普攻/直伤次数 | NPC 净内力减少均值 | 靶方净气血/创伤减少均值 | 直伤输入均值 |',
            '| --- | --- | --- | ---: | --- | --- | ---: | --- | ---: |');
        for (const c of gumuNpc) {
            const e = c.gumu_npc;
            lines.push(`| ${c.id} | ${e.observed}/${e.callbacks}`
                + ` | ${e.npc_method_returned_zero}/${e.npc_method_returned_one}`
                + ` | ${f(e.command_evaluation_cost.mean)} | ${e.command_steps_accepted}/${e.command_steps}`
                + ` | ${e.attacks}/${e.direct_calls} | ${f(e.npc_net_neili_spent.mean)}`
                + ` | ${f(e.target_net_resource_loss.qi.mean)}/${f(e.target_net_resource_loss.eff_qi.mean)}`
                + ` | ${f(e.direct_damage_input.mean)} |`);
        }
    }
    const gumuCooldown = report.conditions.filter(c => c.gumu_temporal?.mechanism_only);
    if (gumuCooldown.length) {
        lines.push('', '## 古墓自然时序：拖泥带水冷却', '',
            '只验证原时钟、真实心跳下的首次发动、提前拒绝与到期重施。命令费用分布包含三次实际命令（含提前拒绝的零费用），不是单次成功发动的成本；等待期间费用和全程内力恢复另列，不能把整段交锋损益当作绝招效果。', '',
            '| 条件 | 有效/未知/错误 | 完成序列/提前拒绝 | 到期重施距首次秒数均值 | 三次命令费用均值/最小/最大（次数） | 等待内力费用均值 | 全程内力恢复均值 |',
            '| --- | --- | --- | ---: | --- | ---: | ---: |');
        for (const c of gumuCooldown) {
            const e = c.gumu_temporal, cost = e.command_neili_cost;
            lines.push(`| ${c.id} | ${e.valid}/${e.unknown}/${e.errors}`
                + ` | ${e.completed_sequences}/${e.early_cooldown_refusals} | ${f(e.cooldown_age_seconds.mean)}`
                + ` | ${f(cost.mean)}/${f(cost.min)}/${f(cost.max)}（${cost.n}）`
                + ` | ${f(e.waiting_neili_cost.mean)} | ${f(e.total_neili_recovery.mean)} |`);
        }
    }
    const gumuTargets = report.conditions.filter(c => c.gumu_temporal && !c.gumu_temporal.mechanism_only);
    if (gumuTargets.length) {
        lines.push('', '## 古墓双目标互搏：两次原施展分别观察', '',
            '两目标尝试与实际发动分列；主目标和第三人的控制分母各自只含该子招受理次数。第二招拒绝不抹去第一招的忙乱和费用，忙乱计数不换算为秒；缺失观察仍为未知。', '',
            '| 条件 | 有效/未知/错误 | 两目标尝试 | 发动次数均值 | 第二招拒绝 | 主目标控制/受理 | 第三人控制/受理 | 内力费用均值 | 自身即时忙乱均值 |',
            '| --- | --- | ---: | ---: | ---: | --- | --- | ---: | ---: |');
        for (const c of gumuTargets) {
            const e = c.gumu_temporal, [target, third] = e.targets;
            lines.push(`| ${c.id} | ${e.valid}/${e.unknown}/${e.errors} | ${e.dual_attempts}`
                + ` | ${f(e.launches.mean)} | ${e.second_refused}`
                + ` | ${target.controlled.successes}/${target.controlled.trials}`
                + ` | ${third.controlled.successes}/${third.controlled.trials}`
                + ` | ${f(e.neili_cost.mean)} | ${f(e.actor_busy.mean)} |`);
        }
    }
    const zhi = report.conditions.filter(c => c.gumu_zhi);
    if (zhi.length) {
        lines.push('', '## 三无三不手：原计划连击与实际出手', '',
            '正常效果只计已发动样本。计划预扣、实际出手、附伤追加内力及目标失活分账；低内力控制仍走原判定，不替换随机数。分支未知表示没有足够实际攻击观察，不据此判成功或失败。', '',
            '| 条件 | 观察/拒绝 | 成功/失败/未知分支 | 计划/实际击数均值 | 预扣/附伤/总内力均值 | 部分出手/目标失活 | 对方气血/创伤均值 |',
            '| --- | ---: | --- | --- | --- | --- | --- |');
        for (const c of zhi) {
            const e = c.gumu_zhi;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${e.branch.success}/${e.branch.failure}/${e.branch.unknown}`
                + ` | ${f(e.planned.mean)}/${f(e.actual_attacks.mean)}`
                + ` | ${f(e.prepaid.mean)}/${f(e.passive_cost.mean)}/${f(e.total_cost.mean)}`
                + ` | ${e.partial_samples}/${e.target_inactive_samples}`
                + ` | ${f(e.target_qi_cost.mean)}/${f(e.target_eff_qi_cost.mean)} |`);
        }
    }
    const gumuQz = report.conditions.filter(c => c.gumu_quanzhen);
    if (gumuQz.length) {
        lines.push('', '## 古墓所用全真剑：原施展与兼修边界', '',
            '原古墓组合、已学外派内功的诊断组合及教师参考条件按冻结 scope 分列，不能合并为古墓自然可学收益。直伤输入不是最终损血；普通攻击、直伤、附伤和两次判定分别记录，三连环的 TYPE_RIPOSTE 不当作快攻。', '',
            '| 条件 | 范围 | 观察/拒绝 | 普通攻击/直伤次数均值 | 直伤原输入均值 | 招式/附伤内力均值 | 对方气血/创伤均值 | 自身/对方忙乱均值 |',
            '| --- | --- | ---: | --- | ---: | --- | --- | --- |');
        for (const c of gumuQz) {
            const e = c.gumu_quanzhen;
            lines.push(`| ${c.id} | ${e.scope} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${f(e.actual_attacks.mean)}/${f(e.direct_calls.mean)} | ${f(e.direct_input_damage.mean)}`
                + ` | ${f(e.ability_cost.mean)}/${f(e.passive_cost.mean)}`
                + ` | ${f(e.target_qi_cost.mean)}/${f(e.target_eff_qi_cost.mean)}`
                + ` | ${f(e.busy.mean)}/${f(e.target_busy.mean)} |`);
        }
    }
    const gumuStudies = report.conditions.filter(c => c.gumu_research);
    if (gumuStudies.length) {
        lines.push('', '## 古墓兵器与徒手研究：原命令及升级回调', '',
            '完整命令受理、实际研究次数、部分完成和拒绝分开统计。原弱模式预置只用于触发升级，不计为自然研究收益；熟练度净差也不代替研究增量。精神清余量按原资源账计入。', '',
            '| 条件 | 入口 | 观察/拒绝 | 受理/无增长/部分完成 | 完成次数均值 | 研究进度/弱模式预置均值 | 等级增量均值 | 精神支出均值 |',
            '| --- | --- | ---: | --- | ---: | --- | ---: | ---: |');
        for (const c of gumuStudies) {
            const e = c.gumu_research;
            lines.push(`| ${c.id} | ${e.ability} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${e.command_accepted}/${e.accepted_without_growth}/${e.partial_research}`
                + ` | ${f(e.completed_repetitions.mean)} | ${f(e.study_progress_gain.mean)}/${f(e.primer_progress.mean)}`
                + ` | ${f(e.skill_level_delta.mean)} | ${f(e.jing_cost.mean)} |`);
        }
    }
    const gumuExert = report.conditions.filter(c => c.gumu_exert);
    if (gumuExert.length) {
        lines.push('', '## 古墓运功：强化判定与群体精神影响', '',
            '强化记录原 skill_power 的增量，不是命中率、伤害或胜率；解除秒数只来自自然回调。黯然吟分列原敌对判定、精神及精神伤势变化，零伤害仍可能建立敌对。命令拒绝不进入正常效果分母；未观察字段保持未知。', '',
            '| 条件 | 观察/拒绝 | 强化判定增量：攻击/闪避/招架 | 原解除秒 | 主目标受影响/已知 | 主目标精神/伤势净变 | 第三人受影响/已知 | 第三人精神/伤势净变 |',
            '| --- | ---: | --- | ---: | --- | --- | --- | --- |');
        for (const c of gumuExert) {
            const e = c.gumu_exert, [target, third] = e.roar;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${['attack', 'dodge', 'parry'].map(k => f(e.buff.powers[k].mean)).join('/')}`
                + ` | ${f(e.buff.expiry_seconds.mean)}`
                + ` | ${target.affected.successes}/${target.affected.trials}`
                + ` | ${f(target.jing_net.mean)}/${f(target.eff_jing_net.mean)}`
                + ` | ${third.affected.successes}/${third.affected.trials}`
                + ` | ${f(third.jing_net.mean)}/${f(third.eff_jing_net.mean)} |`);
        }
    }
    const hubo = report.conditions.filter(c => c.gumu_hubo);
    if (hubo.length) {
        lines.push('', '## 左右互搏：资格、忙乱减免与双招分别观察', '',
            'count不是算术mathematics；学习条件不冒充施展条件。忙乱数值为原计数，不换算秒。命令受理不表示两招都发动；随机分心失败、第二招资源不足及目标已忙乱分别保留。原接口返回、逐次忙乱请求和技能领悟提示见JSON原始记录。', '',
            '| 条件 | 观察/拒绝 | 原接口次数 | 命令受理/样本 | 有发动/样本 | 两招发动/双招样本 | 第二招拒绝 | 自身忙乱/内力支出均值 |',
            '| --- | ---: | ---: | --- | --- | --- | ---: | --- |');
        for (const c of hubo) {
            const e = c.gumu_hubo;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${e.qualification_and_busy_interfaces}`
                + ` | ${e.accepted.successes}/${e.accepted.trials} | ${e.any_launch.successes}/${e.any_launch.trials}`
                + ` | ${e.two_launches.successes}/${e.two_launches.trials} | ${e.second_refused}`
                + ` | ${f(e.actor_busy.mean)}/${f(e.neili_cost.mean)} |`);
        }
    }
    const npc = report.conditions.filter(c => c.npc);
    if (npc.length) {
        lines.push('', '## 原 NPC 配装与逐条闭包', '',
            '保留原 create/setup；逐条调用不是自然随机选招。观察成功不代表闭包施展成功；0返回原因须结合原门槛解释。', '',
            '| 条件 | 快照 | 调用 | 返回1 / 0 | NPC内力支出范围 |',
            '| --- | ---: | ---: | ---: | --- |');
        for (const c of npc) {
            const n = c.npc;
            lines.push(`| ${c.id} | ${n.snapshots} | ${n.callbacks} | ${n.returned_one} / ${n.returned_zero} | ${Math.min(...n.neili_spent)}–${Math.max(...n.neili_spent)} |`);
        }
    }
    const emeiWeapons = report.conditions.filter(c => c.emei_weapons);
    if (emeiWeapons.length) {
        lines.push('', '## 峨嵋兵器：直伤与普通连击', '',
            '公共直伤调用不等于普通攻击命中；绝剑各段独立判定，雁行记录实际普通攻击次数。气血损伤、创伤与内力消耗分列；拒绝不填作零伤害样本。', '',
            '| 条件 | 观察/拒绝 | 直伤调用/普通攻击均值 | 对方气血/创伤损失均值 | 自身内力支出均值 |',
            '|---|---:|---|---|---:|');
        for (const c of emeiWeapons) {
            const e = c.emei_weapons;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.direct_calls.mean)}/${f(e.regular_attacks.mean)}`
                + ` | ${f(e.target_loss.qi.mean)}/${f(e.target_loss.eff_qi.mean)} | ${f(c.sides[0].metrics.neili_cost.mean)} |`);
        }
    }
    const emeiUnarmed = report.conditions.filter(c => c.emei_unarmed);
    const jiuyinBuff = report.conditions.filter(c => c.emei_jiuyin_buff);
    if (jiuyinBuff.length) {
        lines.push('\n## 九阴运功：临时字段与实际属性分列\n',
            '| 条件 | 观察/拒绝 | 内力均耗 | 攻击/护甲均增 | 临时膂力/身法均增 | 有效膂力/身法均增 | 原解除回调秒 |',
            '| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
        for (const c of jiuyinBuff) {
            const e = c.emei_jiuyin_buff;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.cost.mean)}`
                + ` | ${f(e.apply.attack.mean)}/${f(e.apply.armor.mean)}`
                + ` | ${f(e.attributes.str.temporary.mean)}/${f(e.attributes.dex.temporary.mean)}`
                + ` | ${f(e.attributes.str.effective.mean)}/${f(e.attributes.dex.effective.mean)}`
                + ` | ${f(e.callback_seconds.mean)} |`);
        }
    }
    const jiuyin = report.conditions.filter(c => c.emei_jiuyin);
    if (jiuyin.length) {
        lines.push('\n## 峨嵋额外九阴攻招：直伤、直接死亡与招架减益分列\n',
            '此为实验玩家，不是周芷若原配装或师承可达性；死亡后的资源变化含原死亡处理。',
            '| 条件 | 观察条数 | 直伤均次 | 内力均耗 | 死亡次数 | 即时／结束招架偏移 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of jiuyin) {
            const e = c.emei_jiuyin, n = value => Number.isFinite(value) ? value.toFixed(2) : '未知';
            lines.push(`| ${c.id} | ${e.samples} | ${n(e.direct.mean)} | ${n(e.neili_cost.mean)} | ${e.deaths.successes} | ${n(e.parry_delta.mean)}／${n(e.after_parry_delta.mean)} |`);
        }
    }
    if (emeiUnarmed.length) {
        lines.push('', '## 峨嵋徒手：复合损伤、控制与普通连击', '',
            '精神与气血、损伤与创伤分别记账，不重复相加；控制不等于伤害。目标原有忙乱与施展后忙乱分列，不把忙乱值换算为秒。佛光普照未强化拒绝不代表完整联动已测。', '',
            '| 条件 | 观察/拒绝 | 直伤/普通攻击均值 | 目标气血/创伤损失 | 目标精神/创伤损失 | 目标忙乱前/后 | 自身内力支出 |',
            '|---|---:|---|---|---|---|---:|');
        for (const c of emeiUnarmed) {
            const e = c.emei_unarmed;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.direct_calls.mean)}/${f(e.regular_attacks.mean)}`
                + ` | ${f(e.target_loss.qi.mean)}/${f(e.target_loss.eff_qi.mean)}`
                + ` | ${f(e.target_loss.jing.mean)}/${f(e.target_loss.eff_jing.mean)}`
                + ` | ${f(e.target_busy_before.mean)}/${f(e.target_busy_after.mean)} | ${f(c.sides[0].metrics.neili_cost.mean)} |`);
        }
    }
    for (const [field, school] of [['shaolin_defense', '少林'], ['emei_defense', '峨嵋']]) {
        const defenseRows = report.conditions.filter(c => c[field]);
        if (!defenseRows.length) continue;
        lines.push('', `## ${school}防御接口与原普通攻击`, '',
            '招架条件概率的分母为没有闪避的主攻击；缺失接口不当作已实现的零系数。DP是探针实测，未采PP不填零。直伤不经过普通命中判定，单列条件；文本不证明控制或战斗效果。', '',
            '| 条件 | 观察 | 命中/闪避/招架 | 招架/未闪避 | 基础/结算DP均值 | 接口/缺失 | 气血/内力支出均值 |',
            '|---|---:|---|---|---|---|---|');
        for (const c of defenseRows) {
            const e = c[field], q = e.parry_given_not_dodged;
            lines.push(`| ${c.id} | ${e.samples} | ${e.hit}/${e.dodge.successes}/${e.parry.successes} | ${q.successes}/${q.trials} | ${f(e.base_dp.mean)}/${f(e.settled_dp.mean)} | ${e.interfaces}/${e.missing_interfaces} | ${f(e.defender_qi_cost.mean)}/${f(e.defender_neili_cost.mean)} |`);
        }
    }
    const emeiExert = report.conditions.filter(c => c.emei_exert);
    if (emeiExert.length) {
        lines.push('', '## 临济强化与佛光普照', '',
            '强化前置和绝招都调用原命令，不补给或清忙。费用按前置／主动作／合计分列；强化属性不是命中率百分点。无前置的exert显示前置未知，不虚计为零。自然回调另列，普通即时样本不证明持续效果已解除。', '',
            '| 条件 | 观察/拒绝 | 前置/主动作/合计内力支出 | attack/dodge/damage增量 | 原回调秒数均值 |',
            '|---|---|---|---|---|');
        for (const c of emeiExert) {
            const e = c.emei_exert;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.prelude_cost.mean)}/${f(e.action_cost.mean)}/${f(e.total_cost.mean)} | ${f(e.apply.attack.mean)}/${f(e.apply.dodge.mean)}/${f(e.apply.damage.mean)} | ${f(e.callback_seconds.mean)} |`);
        }
    }
    const buffs = report.conditions.filter(c => c.buffs);
    const backlash = report.conditions.filter(c => c.shaolin_backlash);
    if (backlash.length) {
        lines.push('', '## 少林佛学与运功反噬', '',
            '接口返回1是阻止运功，不是恢复成功；命令拒绝也可能已经自损。仅绞痛和紊乱分支计入自伤，打坐转换不当受伤。心烦和异样提示不阻止命令；成功恢复、原心跳终态另表记录。', '',
            '| 条件 | 观察/拒绝 | 原接口阻止次数 | 反噬次数 | 反噬气血/精神损失均值 | 绞痛/紊乱/心烦/异样提示次数 |',
            '|---|---|---|---|---|---|');
        for (const c of backlash) {
            const e = c.shaolin_backlash;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${e.interface_blocks} | ${e.damaged} | ${f(e.damage.qi.mean)}/${f(e.damage.jing.mean)} | ${Object.values(e.messages).join('/')} |`);
        }
    }
    const shaolinExert = report.conditions.filter(c => c.shaolin_exert);
    if (shaolinExert.length) {
        lines.push('', '## 少林内功：加力与易筋通脉', '',
            '加力的attack/defense是临时属性，不是命中率百分点；通脉气血与有效气血净增加分列，不相加。最大内力变化单独记录；原eff_qi先增加后封顶的回扣不当战斗受伤。重复条件按整段计费，原自然回调另见计时表。', '',
            '| 条件 | 观察/拒绝 | attack/defense增量 | 气血净增加 | 有效气血净增加 | 最大内力变化 | 当前内力支出 | 重复步骤受理/拒绝 |',
            '|---|---|---|---|---|---|---|---|');
        for (const c of shaolinExert) {
            const e = c.shaolin_exert;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.apply.attack.mean)}/${f(e.apply.defense.mean)} | ${f(e.qi_gain.mean)} | ${f(e.eff_qi_gain.mean)} | ${f(e.max_neili_delta.mean)} | ${f(c.sides[0].metrics.neili_cost.mean)} | ${e.accepted}/${e.refused} |`);
        }
    }
    const shaolinHands = report.conditions.filter(c => c.shaolin_hands);
    if (shaolinHands.length) {
        lines.push('', '## 少林手爪：原追击、重创及震碎衣甲', '',
            '普通追击、公共直伤与直接伤血分开；仅开启目标原心跳的条件记录30秒内死亡，观察窗结束未死亡不证明无限生存。衣甲破碎按原对象落地、属性和穿戴状态核验，没穿衣的样本不进入其分母。', '',
            '| 条件 | 观察/未观察 | 目标忙乱均值 | 重创 | 衣甲破碎 | 目标死亡/心跳样本 |', '|---|---|---|---|---|---|');
        for (const c of shaolinHands) {
            const e = c.shaolin_hands;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${f(e.target_busy.mean)} | ${e.severe_trauma.successes}/${e.severe_trauma.trials} | ${e.cloth_broken.successes}/${e.cloth_broken.trials} | ${e.target_death.successes}/${e.target_death.trials} |`);
        }
    }
    const shaolinFingers = report.conditions.filter(c => c.shaolin_fingers);
    if (shaolinFingers.length) {
        lines.push('', '## 少林指法：原控制、自伤与直接伤血', '',
            '气血支出与有效气血支出不相加；拈花控制无伤害，菩提失手仍自伤，凌空直接伤血不冒充公共do_damage。忙乱是计数，不是墙钟秒数。', '',
            '| 条件 | 观察/未观察 | 自身气血支出均值 | 对方忙乱均值 | 对方气血受损样本 |',
            '|---|---|---|---|---|');
        for (const c of shaolinFingers) {
            const e = c.shaolin_fingers;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${f(e.self_qi_cost.mean)} | ${f(e.target_busy.mean)} | ${e.qi_loss_samples.successes}/${e.qi_loss_samples.trials} |`);
        }
    }
    const shaolinPalms = report.conditions.filter(c => c.shaolin_palms);
    if (shaolinPalms.length) {
        lines.push('', '## 少林掌法：封魔、连击与原被动调用', '',
            '死亡造成的资源重置单独核查，不把净气血差当完整伤害。被动次数只数原调用，返回零不等于每次都通过被动内部资格；没有补参数或改随机。', '',
            '| 条件 | 观察/未观察 | 攻击/轻功临时增量均值 | 对方死亡样本 | 如来被动调用/非零返回 |',
            '|---|---|---|---|---|');
        for (const c of shaolinPalms) {
            const e = c.shaolin_palms;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${f(e.attack_delta.mean)}/${f(e.dodge_delta.mean)} | ${e.target_death.successes} | ${e.passive_calls}/${e.passive_nonzero} |`);
        }
    }
    const shaolinFists = report.conditions.filter(c => c.shaolin_fists);
    if (shaolinFists.length) {
        lines.push('', '## 少林拳脚：神通强化与舍身', '',
            '正常强化、低气血舍身与纯普攻分别记录；根层临时str/dex不等于query_str/query_dex的增减，公共战斗另行消费。昏迷和最大内力减少不是零伤害能力或正常恢复。', '',
            '| 条件 | 观察/未观察 | 昏迷次数 | 最大内力损失均值 | 根层str/dex增量均值 |',
            '|---|---|---|---|---|');
        for (const c of shaolinFists) {
            const e = c.shaolin_fists;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${e.unconscious.successes} | ${f(e.max_neili_loss.mean)} | ${f(e.root_str.mean)}/${f(e.root_dex.mean)} |`);
        }
    }
    const shaolinAdditional = report.conditions.filter(c => c.shaolin_additional);
    if (shaolinAdditional.length) {
        lines.push('', '## 少林刀剑鞭：连击、缴械及真焰增益', '',
            '连击数只计已观测原do_attack结算；雷鸣慈悲的额外扣血不经过do_damage，不能由direct计数推断其无伤害。负内力原样保留，待另行处理，不混成正常资源收益。', '',
            '| 条件 | 观察/未观察 | 攻击次数均值 | 对方掉兵器次数 | 对方内力净支出均值 | 自身负内力样本 | 真焰样本 | 攻击/防御/伤害临时增量均值 |',
            '|---|---|---|---|---|---|---|---|');
        for (const c of shaolinAdditional) {
            const e = c.shaolin_additional;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${f(e.attacks.mean)}`
                + ` | ${c.effects.target_weapon_dropped.successes} | ${f(e.target_neili_cost.mean)}`
                + ` | ${e.negative_neili.successes} | ${e.buff.successes}`
                + ` | ${['attack', 'defense', 'damage'].map(k => f(e.attributes[k].mean)).join('/')} |`);
        }
    }
    const shaolinWeapons = report.conditions.filter(c => c.shaolin_weapons);
    if (shaolinWeapons.length) {
        lines.push('', '## 少林刀棍杖：增益与属性实际读值', '',
            '即时快照不代表已经观察到期；零伤害增益不作零DPS排名。醉棍根层str/dex与公共有效属性分别记录。', '',
            '| 条件 | 观察/未观察 | 状态生效/分母 | 攻击/伤害/轻功加成均值 | 根层str/dex变化均值 | 有效臂力/身法变化均值 | 武器刚性变化均值 | 角色恢复回调秒均值 |',
            '|---|---|---|---|---|---|---|---|');
        for (const c of shaolinWeapons) {
            const e = c.shaolin_weapons;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved} | ${e.applied.successes}/${e.applied.trials}`
                + ` | ${['apply/attack', 'apply/damage', 'apply/dodge'].map(k => f(e.attributes[k].mean)).join('/')}`
                + ` | ${f(e.attributes.str.mean)}/${f(e.attributes.dex.mean)} | ${f(e.effective_str_delta.mean)}/${f(e.effective_dex_delta.mean)}`
                + ` | ${f(e.rigidity_delta.mean)} | ${f(e.callbacks_finished.mean)} |`);
        }
    }
    const shaolinSword = report.conditions.filter(c => c.shaolin_sword);
    if (shaolinSword.length) {
        lines.push('', '## 少林达摩剑：即时效果与清心恢复', '',
            '异常为原命中回调实际施加；本批不将即时状态量称为已造成的持续伤害。清心目标初态为实验增益，不代表实际运功获得；到期另留原回调证据。', '',
            '| 条件 | 观察/未观察 | 异常施加/分母 | 异常等级均值 | 异常remain均值 | 精神/精神创伤支出均值 | 清心压制次数 | 原恢复回调秒均值 |',
            '|---|---|---|---|---|---|---|---|');
        for (const c of shaolinSword) {
            const e = c.shaolin_sword;
            lines.push(`| ${c.id} | ${e.samples}/${e.unknown_or_unobserved}`
                + ` | ${e.condition_applied.successes}/${e.condition_applied.trials}`
                + ` | ${f(e.condition_level.mean)} | ${f(e.condition_remaining.mean)}`
                + ` | ${f(e.target_loss.jing.mean)}/${f(e.target_loss.eff_jing.mean)}`
                + ` | ${e.qingxin_suppressed.successes} | ${f(e.target_callback_end.mean)} |`);
        }
    }
    const conditionTicks = report.conditions.filter(c => c.condition_ticks);
    if (conditionTicks.length) {
        lines.push('', '## 原心跳异常更新', '',
            '初始异常为实验输入；按真实心跳调度，不证明自然染毒。伤害与更新后恢复分开，气血与创伤不相加。边界两次只验证分支，不估计随机分布；第二次更新属于同一角色，非独立随机样本。', '',
            '| 条件 | 样本/更新/未知 | flag 0/1/3 | 清除样本 | 更新扣气血/伤势均值 | 更新后回血均值 | 首次更新秒数均值 |',
            '|---|---|---|---|---|---|---|');
        for (const c of conditionTicks) {
            const e = c.condition_ticks;
            lines.push(`| ${c.id} | ${e.samples}/${e.ticks}/${e.unknown} | ${Object.values(e.flag_counts).join('/')}`
                + ` | ${e.cleared} | ${f(e.damage.qi.mean)}/${f(e.damage.eff_qi.mean)}`
                + ` | ${f(e.recovery_after_update.qi.mean)} | ${f(e.first_tick_seconds.mean)} |`);
        }
    }
    const lookups = report.conditions.filter(c => c.lookup);
    if (lookups.length) {
        lines.push('', '## 特殊寻人入口', '', '需要实验赋值的 wiz_test 与 quest/id。移动后报告旧位置单列为缺陷，不作为正确定位。', '',
            '| 条件 | 观察/拒绝 | 输出位置 | 实际移动 | 仍报旧位置 | 未知 |', '|---|---|---|---|---|---|');
        for (const c of lookups) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${c.lookup.located} | ${c.lookup.moved} | ${c.lookup.stale_reports} | ${c.lookup.unknown} |`);
    }
    if (buffs.length) {
        lines.push('', '## 公共强化序列与存储语义', '',
            '补给为显式实验操作，不是自然恢复；新对象恢复只验证nosave，不等同登录或死亡清理。资源支出与补给分别统计，不用净内力变化冒充费用。', '',
            '| 条件 | 正常/拒绝/错误 | 指令步接受/拒绝 | 实验补给次数 | 恢复探针/无强化 | 内力总支出均值 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of buffs) {
            const e = c.buffs;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}`
                + ` | ${e.accepted_steps}/${e.refused_steps} | ${e.experimental_refills}`
                + ` | ${e.persistence_probes}/${e.restored_without_buff} | ${f(e.sides[0].cost.neili.mean)} |`);
        }
    }
    const dispel = report.conditions.filter(c => c.dispel);
    if (dispel.length) {
        lines.push('', '## 异常状态驱除', '',
            '从原始前后状态统计，不以指令返回或源码预期填结果。清除、部分减轻和不变分列；忙乱为原query_busy整数单位，非实测秒数。永久remain=-1按原驱除入口的10000基数辨别部分减轻，原值仍保存在证据。', '',
            '| 条件 | 正常/拒绝 | 清除/部分/不变/其他/未知 | 自身内力支出均值 | 异常残值均值 | 自身忙乱均值 | 对方忙乱均值 |',
            '| --- | ---: | --- | ---: | ---: | ---: | ---: |');
        for (const c of dispel) {
            const e = c.dispel;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${Object.values(e.outcomes).join('/')}`
                + ` | ${f(e.sides[0].cost.neili.mean)} | ${f(e.remaining_value.mean)}`
                + ` | ${f(e.actor_busy.mean)} | ${f(e.target_busy.mean)} |`);
        }
    }
    const healing = report.conditions.filter(c => c.healing);
    if (healing.length) {
        lines.push('', '## 原心跳疗伤与振奋', '',
            '确定性边界每条件两次；疗伤量按原回调前后记录，与自然恢复分开。终态由原忙乱、最后回调和halt证据判断，不用预期值填结果；残留pending原样记录。', '',
            '| 条件 | 正常/拒绝 | 完成/耗尽/中止/失去映射/未知 | 治疗回调数均值 | 原回调治疗/内力费均值 | halt内力费均值 | 回调外有效值增量均值 | 耗时均值秒 | pending残留样本 |',
            '| --- | ---: | --- | ---: | --- | ---: | ---: | ---: | ---: |');
        for (const c of healing) {
            const e = c.healing;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${Object.values(e.terminals).join('/')}`
                + ` | ${f(e.treatment_callbacks.mean)} | ${f(e.callback_curing.mean)}/${f(e.callback_neili_cost.mean)}`
                + ` | ${f(e.halt_neili_cost.mean)} | ${f(e.effective_gain_outside_callbacks.mean)}`
                + ` | ${f(e.elapsed.mean)} | ${e.pending_residual} |`);
        }
    }
    const publicForce = report.conditions.filter(c => c.public_force);
    const roars = report.conditions.filter(c => c.roar);
    if (roars.length) {
        lines.push('', '## 狮子吼：精神与敌对分别观察', '',
            '两个房内目标分别统计，敌对不等于造成伤害；精神净变含昏迷重置和原回补。未观察后续普通攻击、复苏或死亡。', '',
            '| 条件 | 目标 | 样本 | 敌对样本 | 新昏迷 | 精神净变化均值 | 有效精神净变化均值 |',
            '| --- | --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of roars) c.roar.forEach((e, i) => lines.push(`| ${c.id} | ${i ? '第三人' : '右方'}`
            + ` | ${e.targets} | ${e.hostile.successes} | ${e.fainted} | ${f(e.jing_net.mean)} | ${f(e.eff_jing_net.mean)} |`));
    }
    if (publicForce.length) {
        lines.push('', '## 公共内功即时作用', '',
            '正常观察与拒绝分列；受理不等于产生作用。资源净变化为结束减开始，含恢复或自损；当前气血与有效气血不相加。这里只观察即时状态，不推定持续时长。', '',
            '| 条件 | 正常/拒绝 | 受理/无可见状态变化 | 自身内力支出均值 | 自身气血/有效气血净变化 | 对方气血/有效气血净变化 | 自身 apply 增量 |',
            '| --- | ---: | ---: | ---: | --- | --- | --- |');
        for (const c of publicForce) {
            const e = c.public_force;
            const delta = Object.entries(e.apply_delta[0]).filter(([, value]) => value.mean !== 0)
                .map(([key, value]) => `${key}:${f(value.mean)}`).join(', ') || (e.attempts ? '无' : '未观测');
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${e.command_accepted}/${e.accepted_without_measured_change} | ${f(e.sides[0].cost.neili.mean)}`
                + ` | ${['qi', 'eff_qi'].map(k => f(e.sides[0].net[k].mean)).join('/')}`
                + ` | ${['qi', 'eff_qi'].map(k => f(e.sides[1].net[k].mean)).join('/')} | ${delta} |`);
        }
    }
    const bouts = report.conditions.filter(c => c.bout_effects);
    if (bouts.length) {
        lines.push('', '## 门派组合：原心跳普通交锋', '',
            '固定30秒、每条件20场交替先手；包含原生恢复，不主动施展绝招。未决不按剩余气血判胜。攻击轮不等于攻击次数，回调调用不等于新增一次攻击。', '',
            '| 条件 | 左/右先手 | 未决/昏迷/死亡 | 对方气血支出/恢复/净下降均值 | 自身内力支出/恢复/净下降均值 | 内功调用均值 | 太极蓄力/追加攻击 |',
            '| --- | ---: | --- | --- | --- | ---: | ---: |');
        for (const c of bouts) {
            const e = c.bout_effects, left = c.sides[0].metrics, right = c.sides[1].metrics;
            lines.push(`| ${c.id} | ${e.actual_first.join('/')} | ${Object.values(e.terminals).join('/')}`
                + ` | ${[right.qi_cost.mean, right.qi_recovery.mean, e.sides[1].net_qi_loss.mean].map(f).join('/')}`
                + ` | ${[left.neili_cost.mean, left.neili_recovery.mean, e.sides[0].net_neili_loss.mean].map(f).join('/')}`
                + ` | ${f(e.sides[0].force_calls.mean)} | ${e.taiji ? e.taiji.triggers + '/' + e.taiji.extra_attacks : '不适用'} |`);
        }
    }
    const gumuBouts = bouts.filter(c => c.bout_effects.gumu);
    if (gumuBouts.length) {
        lines.push('', '### 古墓组合：原被动回调与磨损', '',
            '回调次数与字符串返回单列，不算额外出手或统一触发率；气血与创伤为回调当次净变化，创伤压低当前气血时不得相加。内力支出为回调前后实际差，完整交锋的原生恢复另列于上表。400级与800级玄铁分别统计，不作同成本比较。', '',
            '| 条件 | 回调 | 调用/字符串返回 | 回调内力支出合计 | 当次气血/创伤下降均值 | 左/右武器磨损均值 |',
            '| --- | --- | ---: | ---: | --- | --- |');
        for (const c of gumuBouts) {
            const e = c.bout_effects.gumu;
            for (const passive of e.passives)
                lines.push(`| ${c.id} | ${passive.route} | ${passive.calls}/${passive.message_returns}`
                    + ` | ${passive.neili_spent} | ${[passive.immediate_qi_loss.mean, passive.immediate_wounds.mean].map(f).join('/')}`
                    + ` | ${e.sides.map(s => f(s.weapon_wear.mean)).join('/')} |`);
        }
    }
    const combinations = report.conditions.filter(c => c.combination_effects);
    if (combinations.length) {
        lines.push('', '## 互备：原准备命令与单次攻击轮', '',
            '守势零击、单击和双击分列。全部攻击轮与已出招轮的双击率使用不同分母；两条边界样本不用于概率推断。未激发特殊内功，加力值不是已发生的内力支付。', '',
            '| 条件 | 准备受理/拒绝步骤 | 攻击轮/守势轮 | 出招数 | 双击/全部轮 | 双击/出招轮 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of combinations) {
            const e = c.combination_effects;
            lines.push(`| ${c.id} | ${e.accepted}/${e.rejected} | ${e.rounds}/${e.guarding_rounds}`
                + ` | ${e.primary_attacks} | ${e.double_rounds.successes}/${e.double_rounds.trials}`
                + ` | ${e.double_given_attack.successes}/${e.double_given_attack.trials} |`);
        }
    }
    const unarmed = report.conditions.filter(c => c.wudang_unarmed);
    if (unarmed.length) {
        lines.push('', '## 徒手与暗器：独立代价', '',
            '正气与弹药为前后状态差；创伤次数不等于普通攻击命中次数。纯创伤可能同步压低当前气血，不能相加为两次伤害。', '',
            '| 条件 | 正气消耗均值 | 弹药消耗均值 | 普攻结算次数均值 | 产生创伤样本 |',
            '| --- | ---: | ---: | ---: | ---: |');
        for (const c of unarmed) {
            const e = c.wudang_unarmed;
            lines.push(`| ${c.id} | ${f(e.shen_cost.mean)} | ${f(e.ammunition_cost.mean)} | ${f(e.regular_attacks.mean)} | ${e.wounded.successes}/${e.wounded.trials} |`);
        }
    }
    const learning = report.conditions.filter(c => c.learning);
    const wudangCore = report.conditions.filter(c => c.wudang_core);
    const taijiPassives = report.conditions.filter(c => c.wudang_passive);
    const taijiSpecials = report.conditions.filter(c => c.wudang_special);
    const shenmenPassives = report.conditions.filter(c => c.shenmen_passive);
    if (shenmenPassives.length) {
        lines.push('', '## 神门被动：接口资格与实际普攻', '',
            '入口调用、满足随机判定前资格、缴械次数与样本数分列；无被动调用不当作一次被动判定失败。公共伤害流程可能解除刚设置的忙乱，原接口与攻击结束状态分别统计。', '',
            '| 条件 | 样本 | 调用/资格/触发 | 触发后忙乱保留/解除 | 成功时原附加创伤均值 |',
            '| --- | ---: | ---: | ---: | ---: |');
        for (const c of shenmenPassives) {
            const e = c.shenmen_passive;
            lines.push(`| ${c.id} | ${e.attempts} | ${e.calls}/${e.eligible_calls}/${e.triggers}`
                + ` | ${e.busy_retained_on_trigger}/${e.busy_cleared_on_trigger} | ${f(e.source_wound_on_trigger.mean)} |`);
        }
    }
    if (taijiSpecials.length) {
        lines.push('', '## 太极特殊状态与多目标', '',
            '重复指令受理／拒绝按步骤，不把一条样本当成全部命令成功；疗伤恢复有效值不等于补满当前值。太极图的两名目标独立统计，不将一次施法费用乘以目标数。', '',
            '| 条件 | 昏迷初态/醒来 | 指令步骤受理/拒绝 | 原解除回调 | 目标1/2受伤样本 | 目标1/2气血支出均值 |',
            '| --- | ---: | ---: | ---: | ---: | --- |');
        for (const c of taijiSpecials) {
            const e = c.wudang_special;
            lines.push(`| ${c.id} | ${e.initially_unconscious}/${e.awakened} | ${e.accepted_steps}/${e.refused_steps}`
                + ` | ${e.natural_callbacks} | ${e.targets.map(t => t.damaged).join('/')}`
                + ` | ${e.targets.map(t => f(t.metrics.qi_cost.mean)).join('/')} |`);
        }
    }
    if (taijiPassives.length) {
        lines.push('', '## 太极蓄力：原计数与追加攻击', '',
            'combat_time是attack()选中对手的计数，不是秒；接口点测预置计数，bout独立从零开始。触发不等于命中，hit_ob返回空值不能充当触发指标。10/30原实参保留，不称为TYPE_QUICK。', '',
            '| 条件 | 入口/具备触发条件 | 触发/恢复 | 追加攻击/命中 | 实参10/30 | 最终计数均值 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of taijiPassives) {
            const e = c.wudang_passive;
            lines.push(`| ${c.id} | ${e.entries}/${e.eligible_entries} | ${e.triggers}/${e.restored}`
                + ` | ${e.extra_attacks}/${e.extra_hits.successes} | ${e.extra_types[10]}/${e.extra_types[30]}`
                + ` | ${f(e.final_counter.mean)} |`);
        }
    }
    if (wudangCore.length) {
        lines.push('', '## 太极拳／神功：精力、伤势与增益', '',
            '目标前后差值为正代表增加，为负代表损失；不是累计支出。精力不等于精神；太极图不经do_damage，零直接结算不等于没有造成伤害。', '',
            '| 条件 | 自身精力消耗 | 目标气血/有效气血差值 | 目标精神/有效精神差值 | 目标内力差值 | 即时attack/defense/armor增量 |',
            '| --- | ---: | --- | --- | ---: | --- |');
        for (const c of wudangCore) {
            const e = c.wudang_core, h = e.target_health_delta;
            lines.push(`| ${c.id} | ${f(e.actor_jingli_spent.mean)} | ${f(h.qi.mean)}/${f(h.eff_qi.mean)}`
                + ` | ${f(h.jing.mean)}/${f(h.eff_jing.mean)} | ${f(h.neili.mean)}`
                + ` | ${f(e.apply.attack.mean)}/${f(e.apply.defense.mean)}/${f(e.apply.armor.mean)} |`);
        }
    }
    const wudang = report.conditions.filter(c => c.wudang_sword);
    if (wudang.length) {
        lines.push('', '## 太极剑：连击、精神与攻防增量', '',
            '普通攻击调用数不是命中次数；精神支出与精神创伤分列。随字诀即时状态不代表已到期，只有独立 expiry 条件等待原回调。', '',
            '| 条件 | 普攻调用均值 | 精神/精神创伤支出均值 | 即时attack/defense增量 | 终态attack/defense增量 | 终态随字诀样本 |',
            '| --- | ---: | --- | --- | --- | ---: |');
        for (const c of wudang) {
            const e = c.wudang_sword;
            lines.push(`| ${c.id} | ${f(e.regular_attacks.mean)} | ${f(e.jing_cost.mean)}/${f(e.eff_jing_cost.mean)}`
                + ` | ${f(e.apply.attack.mean)}/${f(e.apply.defense.mean)}`
                + ` | ${f(e.after_apply.attack.mean)}/${f(e.after_apply.defense.mean)} | ${e.sui_active} |`);
        }
    }
    const recovery = report.conditions.filter(c => c.recovery);
    if (recovery.length) {
        lines.push('', '## 恢复与原心跳打坐', '',
            '打坐逐跳转换与最终净值分列；原USER自然恢复保留。打坐每条件2次只核验转换终态，不据此估计随机速度。中止与自然完成分开，不把受理当完成。', '',
            '| 条件 | 观察/拒绝 | 气血/精神净增均值 | 内力/上限净增均值 | 逐跳气血转换均值 | 完成/中止 |',
            '| --- | ---: | --- | --- | ---: | ---: |');
        for (const c of recovery) {
            const e = c.recovery;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.qi_net.mean)}/${f(e.jing_net.mean)}`
                + ` | ${f(e.neili_net.mean)}/${f(e.max_neili_net.mean)} | ${f(e.exercise_converted.mean)}`
                + ` | ${e.terminals.completed}/${e.terminals.halted} |`);
        }
    }
    const study = report.conditions.filter(c => c.study);
    if (study.length) {
        lines.push('', '## 原研究与跨级状态', '',
            '跨级样本经弱模式预置进度，不代表单次研究能升一级；其清零进度不能与常规进度均值混算。原命令返回1也可能没有研究成功。', '',
            '| 条件 | 观察/拒绝 | 进度均值 | 等级增量均值 | 已用潜能增量均值 | 精神/内力支出均值 |',
            '| --- | ---: | ---: | ---: | ---: | --- |');
        for (const c of study) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
            + ` | ${f(c.study.progress.mean)} | ${f(c.study.level_gain.mean)} | ${f(c.study.potential_used.mean)}`
            + ` | ${f(c.study.jing_cost.mean)}/${f(c.study.neili_cost.mean)} |`);
    }
    const auxiliary = report.conditions.filter(c => c.auxiliary);
    if (auxiliary.length) {
        lines.push('', '## 轻功与知识接口', '',
            'AP/DP是原攻击已经计算的值；公式概率不是实测频率。接口文本保留原文，接口无伤害不代表技能无价值。', '',
            '| 条件 | 观察/拒绝 | AP均值 | 加成前/后DP均值 | 公式概率均值 | 实测闪避/尝试 | 接口数值均值 |',
            '| --- | ---: | ---: | --- | ---: | --- | ---: |');
        for (const c of auxiliary) {
            const e = c.auxiliary;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | ${f(e.ap.mean)}`
                + ` | ${f(e.base_dp.mean)}/${f(e.settled_dp.mean)} | ${f(e.formula_probability.mean)}`
                + ` | ${e.primary_dodge.successes}/${e.primary_dodge.trials} | ${f(e.interface_numbers.mean)} |`);
        }
    }
    const cultivation = report.conditions.filter(c => c.cultivation);
    if (cultivation.length) {
        lines.push('', '## 内功研究与内力上限查询', '',
            '研究保留全部尝试；命令返回1不保证取得进度或完成指定次数。上限是原USER查询值，不改变实际max_neili。', '',
            '| 条件 | 观察/拒绝 | 进度均值 | 已用潜能增量均值 | 精神/内力支出均值 | 接口返回均值 |',
            '| --- | ---: | ---: | ---: | --- | ---: |');
        for (const c of cultivation) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
            + ` | ${f(c.cultivation.progress.mean)} | ${f(c.cultivation.potential_used.mean)}`
            + ` | ${f(c.cultivation.jing_cost.mean)}/${f(c.cultivation.neili_cost.mean)} | ${f(c.cultivation.interface_result.mean)} |`);
    }
    const qualification = report.conditions.filter(c => c.qualification);
    const gumuResearch = report.conditions.filter(c => c.gumu_cultivation?.research_samples);
    if (gumuResearch.length) {
        lines.push('', '### 古墓研究：命令受理与实际增长', '',
            '正返回但无进度、精神不足中途停止均按实际记录；公共知识及容量接口不计入研究收益。兼修接口按查询方向解读，不将零返回混作调用失败。', '',
            '| 条件 | 样本 | 命令受理 | 有进展 | 完成次数均值 | 熟练度增量均值 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of gumuResearch) {
            const e = c.gumu_cultivation;
            lines.push(`| ${c.id} | ${e.research_samples} | ${e.accepted} | ${e.progressed}`
                + ` | ${f(e.completed_repetitions.mean)} | ${f(e.learned_gain.mean)} |`);
        }
    }
    if (qualification.length) {
        lines.push('', '## 技能学习资格（不是教师可教资格）', '',
            '| 条件 | 查询次数 | 允许 | 原返回均值 |', '| --- | ---: | ---: | ---: |');
        for (const c of qualification) lines.push(`| ${c.id} | ${c.qualification.attempts} | ${c.qualification.accepted} | ${f(c.qualification.results.mean)} |`);
    }
    for (const [field, heading] of [['gumu_weapon_learning', '古墓兵器学习与练习'],
        ['gumu_unarmed_learning', '古墓徒手学习与练习']]) {
        const learning = report.conditions.filter(c => c[field]);
        if (!learning.length) continue;
        lines.push('', '## ' + heading, '',
            '按冻结条件区分学习资格、直接练习接口与完整练习命令。资格允许不证明教师可教；直接接口扣费不产生熟练度。完整命令返回0仍可能已有部分进度，气血及内力只按实际资源账统计。', '');
        if (field === 'gumu_unarmed_learning') lines.push('仅副手持剑为明确的隔离诊断状态，不代表正常持器或自然成长可达；实际主副手和属性分别核对。', '');
        for (const [ability, title, headers] of [
            ['valid_learn', '学习资格', '| 条件 | 查询/允许 | 气血/内力支出均值 |'],
            ['practice_skill', '直接练习接口', '| 条件 | 观察/拒绝 | 成功调用次数均值 | 熟练度增量均值 | 气血/内力支出均值 |'],
            ['practice', '完整练习命令', '| 条件 | 观察/拒绝 | 命令受理/部分进度样本 | 完成次数均值 | 熟练度增量均值 | 气血/内力支出均值 |'],
        ]) {
            const selected = learning.filter(c => c[field].ability === ability);
            if (!selected.length) continue;
            lines.push('### ' + title, '', headers,
                ability === 'valid_learn' ? '| --- | ---: | --- |' : ability === 'practice_skill'
                    ? '| --- | ---: | ---: | ---: | --- |' : '| --- | ---: | ---: | ---: | ---: | --- |');
            for (const c of selected) {
                const e = c[field];
                lines.push(`| ${c.id} | ` + (ability === 'valid_learn'
                    ? `${e.attempts}/${e.qualification_allowed}`
                    : `${e.observed}/${e.refused}` + (ability === 'practice'
                        ? ` | ${e.command_accepted}/${e.partial_practice}` : '')
                        + ` | ${f(e.completed_repetitions.mean)} | ${f(e.learned_gain.mean)}`)
                    + ` | ${f(e.qi_cost.mean)}/${f(e.neili_cost.mean)} |`);
            }
            lines.push('');
        }
    }
    const movement = report.conditions.filter(c => c.gumu_movement);
    if (movement.length) {
        lines.push('', '### 古墓轻功：资格、练习与研究', '',
            '接口结果与命令受理分别记录；接口不计练习或研究次数。部分练习可返回0但已有进度，研究耗尽精神的余额计入实际支出。房间加成及先天／有效悟性见原始快照，不以条件配置代替观测。', '',
            '| 条件 | 观察/拒绝 | 命令受理/样本 | 有进展 | 部分练习 | 完成次数均值 | 熟练度增量均值 | 气血/内力/精神变化均值 |',
            '| --- | ---: | --- | --- | --- | --- | ---: | --- |');
        for (const c of movement) {
            const e = c.gumu_movement, commands = e.practice_samples + e.research_samples;
            lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
                + ` | ${commands ? e.accepted + '/' + commands : '—'} | ${commands ? e.progressed : '—'}`
                + ` | ${e.practice_samples ? e.partial_practice : '—'} | ${commands ? f(e.completed_repetitions.mean) : '—'}`
                + ` | ${f(e.learned_gain.mean)} | ${f(e.qi_delta.mean)}/${f(e.neili_delta.mean)}/${f(e.jing_delta.mean)} |`);
        }
    }
    const practice = report.conditions.filter(c => c.practice && !c.gumu_movement && !c.gumu_weapon_learning && !c.gumu_unarmed_learning && !c.mingjiao_ling_learning);
    if (practice.length) {
        lines.push('', '## 原命令练习：全部完成与部分进度分列', '',
            '保留零进度拒绝。完成次数是本批经原进度及费用核验的条件，不把命令返回0解释成必然没练成；普通dbase/force不是基本内功，也不是内力。', '',
            '| 条件 | 观察/拒绝 | 全部完成/部分进度样本 | 进度均值 | 气血/内力支出均值 | 精神/精力净支出均值 | 普通force属性变化均值 |',
            '| --- | ---: | ---: | ---: | --- | --- | ---: |');
        for (const c of practice) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused}`
            + ` | ${c.practice.command_accepted}/${c.practice.partial_progress} | ${f(c.practice.progress.mean)}`
            + ` | ${f(c.practice.qi_cost.mean)}/${f(c.practice.neili_cost.mean)}`
            + ` | ${f(c.practice.jing_net_cost.mean)}/${f(c.practice.jingli_net_cost.mean)} | ${f(c.practice.force_attribute_delta.mean)} |`);
    }
    const advanced = report.conditions.filter(c => c.quanzhen_advanced && c.counts.observed);
    if (advanced.length) {
        lines.push('', '## 先天功与空明拳：独立机制', '',
            '总表气血支出包含原死亡重置，不是瞬杀伤害；以下单列目标死亡、存活者支出与恢复。直伤/普通攻击是调用次数，不是必定命中次数。', '',
            '| 条件 | 直伤/普攻调用均值 | 目标死亡 | 存活目标气血支出均值 | 自身气血/有效气血恢复均值 | 护甲增量均值 |',
            '| --- | --- | ---: | ---: | --- | ---: |');
        for (const c of advanced) {
            const a = c.quanzhen_advanced;
            lines.push(`| ${c.id} | ${f(a.direct_calls.mean)}/${f(a.regular_attack_calls.mean)}`
                + ` | ${a.terminal.deaths[1].successes} | ${f(a.surviving_target_qi_cost.mean)}`
                + ` | ${f(a.healing.qi.mean)}/${f(a.healing.eff_qi.mean)} | ${f(a.armor_delta.mean)} |`);
        }
    }
    const basic = report.conditions.filter(c => c.quanzhen_basic && c.counts.observed);
    if (basic.length) {
        lines.push('', '## 全真徒手、尘法与玄门增益', '',
            '破穹云蛟的0至3次直伤、重阳连环掌的四次普通攻击分别记录。增益只列属性增量，不折算伤害或胜率；终态标记与自然到期回调分开核对。', '',
            '| 条件 | 直伤调用均值 | 普攻调用均值 | attack/dodge/parry 增量均值 | 终态powerup样本 |',
            '| --- | ---: | ---: | --- | ---: |');
        for (const c of basic) lines.push(`| ${c.id} | ${f(c.quanzhen_basic.direct_calls.mean)}`
            + ` | ${f(c.quanzhen_basic.regular_attack_calls.mean)} | ${Object.values(c.quanzhen_basic.apply_delta).map(d => f(d.mean)).join('/')}`
            + ` | ${c.quanzhen_basic.final_powerup.successes} |`);
    }
    const quanzhen = report.conditions.filter(c => c.quanzhen_sword && c.parameters.ability === 'fen');
    if (quanzhen.length) {
        lines.push('', '## 玉石俱焚：永久代价与死亡', '',
            '上限损失含原死亡惩罚。死亡以实际ghost终态为证；die调用数另存JSON，不能只看调用或零血量。死亡重置气血产生的支出不当成剑招伤害。', '',
            '| 条件 | 左/右死亡样本 | 同归样本 | 左/右内力上限损失均值 |', '| --- | ---: | ---: | ---: |');
        for (const c of quanzhen) lines.push(`| ${c.id} | ${c.quanzhen_sword.deaths.map(d => d.successes).join('/')}`
            + ` | ${c.quanzhen_sword.mutual_deaths.successes} | ${c.quanzhen_sword.max_neili_loss.map(d => f(d.mean)).join('/')} |`);
    }
    if (learning.length) {
        lines.push('', '## 学习与查询（不作伤害排名）', '',
            '以下均值包含已记录拒绝；完整分布见JSON。进度是query_learned增量，不是武学等级；潜能支出由learned_points增量表示。难度只填实际查询结果，其他条目未知。', '',
            '| 条件 | 观察/拒绝 | 基本剑法进度 | 独孤进度 | 潜能支出 | 剩余精神 | 内力支出 | 查询难度 |',
            '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
        for (const c of learning) lines.push(`| ${c.id} | ${c.counts.observed}/${c.counts.refused} | `
            + ['sword_progress', 'skill_progress', 'potential_spent', 'remaining_jing', 'neili_cost', 'difficulty']
                .map(k => f(c.learning[k].mean)).join(' | ') + ' |');
    }
    const defense = report.conditions.filter(c => c.defense);
    if (defense.length) {
        lines.push('', '## 右方防御（查询、接口与公共结算分开）', '',
            '左方进攻、右方使用条件指定的招架。系数不是百分比成功率；化解次数以原valid_damage返回为证，不由零伤害推断。valid_damage接口不直接结算伤害，ordinary保留反击，direct按条件走原UNARMED/WEAPON_ATTACK。', '',
            '| 条件 | 系数 | 调用/化解 | 有化解的样本 | 防守方气血支出均值 | 攻击方忙乱均值 |',
            '| --- | ---: | ---: | ---: | ---: | ---: |');
        for (const c of defense) lines.push(`| ${c.id} | ${f(c.defense.coefficient.mean)}`
            + ` | ${c.defense.calls}/${c.defense.negated_per_call.successes} | ${c.defense.samples_with_negation.successes}`
            + ` | ${f(c.defense.defender_qi_cost.mean)} | ${f(c.defense.attacker_busy.mean)} |`);
    }
    const passives = report.conditions.filter(c => c.passive);
    if (passives.length) {
        lines.push('', '## 先天功附加：接口与实际攻击分开', '',
            '调用数与触发数分开；气血/创伤总支出仍见总表。接口输入由实验指定，不是一次普攻的输出。内功路线传后天臂力，拳脚路线传当时伤害；不能把两条路线的输入单位混算。', '',
            '| 条件 | 有附加样本 | 接口调用/触发 | 内功调用/触发 | 拳脚调用/触发 |',
            '| --- | ---: | ---: | ---: | ---: |');
        for (const c of passives) lines.push(`| ${c.id} | ${c.passive.samples_with_effect.successes} | `
            + ['interface', 'force', 'martial'].map(route => `${c.passive.routes[route].calls}/${c.passive.routes[route].triggered}`).join(' | ') + ' |');
    }
    const upgrade = report.conditions.filter(c => c.upgrade);
    if (upgrade.length) {
        lines.push('', '## 升级领悟（预置进度，不代表养成速率）', '',
            '每步先通过原weak_mode API累积进度，再经原升级API或总诀式触发回调。等级与剩余进度分列；奖励次数按原分支和前后状态核验，已100奖励及样本内重复另列，不当成正常培养收益。', '',
            '| 条件 | 样本/步骤 | 独孤升级均值 | 破气增量 | 总破增量 | 修养升级均值 | 修养剩余进度 | 奖励/已100奖励 | 样本内重复 |',
            '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
        for (const c of upgrade) lines.push(`| ${c.id} | ${c.upgrade.attempts}/${c.upgrade.steps} | `
            + ['skill_levels', 'qi_gain', 'po_gain', 'cognition_levels', 'cognition_progress']
                .map(k => f(c.upgrade[k].mean)).join(' | ')
            + ` | ${c.upgrade.rewards}/${c.upgrade.rewards_from_already100} | ${c.upgrade.repeated_within_sample} |`);
    }
    const timed = report.conditions.filter(c => c.effects && c.effects.callback_start_seconds.mean !== null);
    if (timed.length) {
        lines.push('', '| 持续条件 | 回调开始秒数均值 | 回调结束秒数均值 |', '| --- | ---: | ---: |');
        for (const c of timed) lines.push(`| ${c.id} | ${f(c.effects.callback_start_seconds.mean)} | ${f(c.effects.callback_end_seconds.mean)} |`);
    }
    const targetTimed = report.conditions.filter(c => c.effects && c.effects.target_callback_start_seconds.mean !== null);
    if (targetTimed.length) {
        lines.push('', '| 目标持续条件 | 回调开始秒数均值 | 回调结束秒数均值 |', '| --- | ---: | ---: |');
        for (const c of targetTimed) lines.push(`| ${c.id} | ${f(c.effects.target_callback_start_seconds.mean)} | ${f(c.effects.target_callback_end_seconds.mean)} |`);
    }
    const mingjiaoBook = report.conditions.filter(c => c.mingjiao_book);
    if (mingjiaoBook.length) {
        const text = value => String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
        const known = e => e.validated > 0 && e.unknown === 0;
        const results = e => e.validated > 0 ? text(Object.entries(e.results)
            .map(([key, n]) => `${key}:${n}`).join(', ')) : '未观测';
        lines.push('', '## 明教乾坤秘籍：原磕头、拾取与有限研读', '',
            '本组仅4个磕头、2个拾取、20个研读条件，52条样本计划对应56次原命令步骤；未采数据不计完成。'
                + '书籍使用原单例取得路径，不把羊皮可以克隆的实现写成禁止克隆。'
                + '密道开门、五秒关闭及三个首载顺序另属后续独立范围，不由本表宣称已测。'
                + '命令受理与实际执行成本分列，受理不等于出书、收书或读成；无教师命令不冒普通授课。', '',
            '### 出书库存与原拾取', '',
            '磕头的耗库存、原单例出现、新遗信和拾取到玩家背包分别统计。'
                + '重复磕头或书已有归属不补发，拾取容量599/600保持原600重量与同对象身份；清理不代替命令结束状态。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误/不适用/缺样 | 命令步数；受理/执行成本 | 磕头/拾取尝试 | 库存耗减/出书/新增遗信 | 收入玩家背包 | 原结果 | 核验/未知 |',
            '| --- | ---: | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoBook.filter(c => c.parameters.teaching_kind === 'item-acquisition')) {
            const e = c.mingjiao_book;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}/${c.counts.not_applicable}/${c.missing}`
                + ` | ${known(e) ? `${e.commands}；${e.commands_accepted}/${e.command_execution_cost}` : '未观测'}`
                + ` | ${known(e) ? `${e.ketou_calls}/${e.get_calls}` : '未观测'}`
                + ` | ${known(e) ? `${e.stock_consumed}/${e.books_created}/${e.letters_created}` : '未观测'}`
                + ` | ${known(e) ? e.player_receipts : '未观测'} | ${results(e)} | ${e.validated}/${e.unknown} |`);
        }
        lines.push('', '### 原研读成长与精神账', '',
            '合法请求次数包含资格拒绝，不能当作实际迭代；非法次数命令独立计数。'
                + '源码推导毛进度只按已核原循环和成长公式计算，不冒直接观测的improve参数；升级与实际净熟练分列。'
                + '零级原强成长升一级并将净熟练归零，不能据此判作没有读成。'
                + '悟性40、识字200的有效悟性60对应199精神费，原判定严格大于成本；精神399三读只完成两次，正常研读费398加直接清零1。'
                + '310级、经验100万通过书籍经验门但仍被技能成长经验门拒绝，不混作311级书籍上限。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误/不适用/缺样 | 命令步数；受理/执行成本 | 研读命令/受理 | 合法请求次数/非法次数命令 | 实际迭代/升级 | 源码推导毛进度/净熟练 | 精神毛扣/研读费/清零损失 | 潜能支出/已用潜能增加 | 原结果 | 核验/未知 |',
            '| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoBook.filter(c => c.parameters.teaching_kind === 'study')) {
            const e = c.mingjiao_book;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}/${c.counts.not_applicable}/${c.missing}`
                + ` | ${known(e) ? `${e.commands}；${e.commands_accepted}/${e.command_execution_cost}` : '未观测'}`
                + ` | ${known(e) ? `${e.study_calls}/${e.study_accepted}` : '未观测'}`
                + ` | ${known(e) ? `${e.study_requested}/${e.study_invalid_times_commands}` : '未观测'}`
                + ` | ${known(e) ? `${e.study_completed}/${e.upgrades}` : '未观测'}`
                + ` | ${known(e) ? `${e.source_derived_gross}/${e.learned_net}` : '未观测'}`
                + ` | ${known(e) ? `${e.jing_cost}/${e.study_fee}/${e.jing_writeoff}` : '未观测'}`
                + ` | ${known(e) ? `${e.potential_cost}/${e.learned_points_added}` : '未观测'}`
                + ` | ${results(e)} | ${e.validated}/${e.unknown} |`);
        }
        lines.push('', '错误、不适用和缺样不补零；含未知样本时合计未观测，原已核结果频数仍独立保留。'
            + '现有修为、库存与书籍位置为实验初态，不证明自然取得前置或全部乾坤玩法。');
    }
    const mingjiaoGift = report.conditions.filter(c => c.mingjiao_gift);
    if (mingjiaoGift.length) {
        const text = value => String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
        const resultNames = { 'jing-low': '精神不足', 'other-family': '异门资格拒绝',
            'other-master': '非直属资格拒绝', shen: '正气不足', unlearned: '未学逍遥剑法',
            'skill-low': '剑法不足', 'already-owned': '本人已持有', 'peer-owned': '同门他人持有',
            'outsider-owned': '异门他人持有', 'room-owned': '远处地面',
            'player-receipt': '进入玩家背包', 'floor-receipt': '超重落地' };
        lines.push('', '## 明教杨逍：幻灵剑原询问与单例交付', '',
            '仅本批16个有限条件，32条样本对应34次原询问步骤；重复询问逐步记录。'
                + '原命令受理、执行成本与精神费用分列，命令受理不等于获得幻灵剑。'
                + '资格通过数按已核原返回分支推导，不是额外函数探针；精神不足未进入资格检查，不计通过。'
                + '可用负重3999时原交付尝试成功但落在所在房间，4000时才进入背包；超重落地不是玩家收剑或资格失败。'
                + '本人容器与本人直接持有都按本人已持有拒绝；同门他人、异门他人及远处地面分别保留原归属。'
                + '师承、修为、单例位置与容量为实验初态，不证明自然养成；不自动装备、不出招、不作兵器强弱排名或完整明教覆盖声明。', '',
            '| 条件 | 初态/对照 | 已采/计划 | 观察/拒绝/错误/不适用/缺样 | 命令步数；受理/执行成本 | 问话精神费/贡献费 | 资格通过/交付尝试 | 玩家收剑/落地 | 本人已持有 | 原结果 | 核验/未知 |',
            '| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoGift) {
            const e = c.mingjiao_gift, known = e.validated > 0;
            const results = Object.entries(e.results).map(([k, v]) => `${resultNames[k] ?? k}:${v}`).join(', ');
            lines.push(`| ${c.id} | ${text(c.parameters.variant)} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}/${c.counts.not_applicable}/${c.missing}`
                + ` | ${known ? `${e.commands}；${e.commands_accepted}/${e.command_execution_cost}` : '未观测'}`
                + ` | ${known ? `${e.jing_cost}/${e.contribution_cost}` : '未观测'}`
                + ` | ${known ? `${e.qualification_passed}/${e.grants_attempted}` : '未观测'}`
                + ` | ${known ? `${e.player_receipts}/${e.floor_receipts}` : '未观测'}`
                + ` | ${known ? e.already_owned : '未观测'}`
                + ` | ${known ? text(results) : '未观测'} | ${e.validated}/${e.unknown} |`);
        }
        lines.push('', '错误、不适用与缺样不补零；原问话费用只核10–19的有限支持，不由两次观察估计概率。'
            + '原教师构造及隐藏动作缓存上下文未观测，物品清理不代替原命令结束时的单例归属。');
    }
    const mingjiaoRecruit = report.conditions.filter(c => c.mingjiao_recruit);
    if (mingjiaoRecruit.length) {
        const text = value => String(value).replaceAll('|', '\\|').replace(/\r?\n/g, ' ');
        lines.push('', '## 明教各教师：原拜师、请安与取消', '',
            '仅本批有限条件下新增的师承计为拜师成功；亲传请安和转世认可不计新师承。'
                + '命令受理与实际执行成本分列，受理不等于收徒；外派确认、取消和原等待状态独立记录。'
                + '前置修为及既有同门／转世标记是实验输入，不证明完整自然养成或转世流程。'
                + '张无忌既有拜师／普通授课另列，本批不重复；不把教师构造入口当作隐藏随机缓存已验证。'
                + '本批不采普通学习、特殊授招或战斗，通用伤害表不适用。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误/不适用/缺样 | 命令步数；受理/执行成本 | 新师承/首次入派 | 请安/取消/外派确认 | 原结果 | 核验/未知 |',
            '| --- | ---: | --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoRecruit) {
            const e = c.mingjiao_recruit, known = e.validated > 0;
            const results = Object.entries(e.results).map(([k, v]) => `${k}:${v}`).join(', ');
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}/${c.counts.not_applicable}/${c.missing}`
                + ` | ${known ? `${e.commands}；${e.commands_accepted}/${e.command_execution_cost}` : '未观测'}`
                + ` | ${known ? `${e.formal_apprenticeships}/${e.first_joins}` : '未观测'}`
                + ` | ${known ? `${e.repeated_greetings}/${e.cancellations}/${e.betrayer_confirmations}` : '未观测'}`
                + ` | ${known ? text(results) : '未观测'}`
                + ` | ${e.validated}/${e.unknown} |`);
        }
        lines.push('', '错误、不适用与缺样不补成零次拜师；销毁教师的清理结果不代替原命令结束时的待拜师状态。');
    }
    const mingjiaoTeachers = report.conditions.filter(c => c.mingjiao_teachers);
    if (mingjiaoTeachers.length) {
        lines.push('', '## 明教各教师：原普通授课', '',
            '逐原教师、技能与资格分列；初始师承／转世身份是实验输入，不证明自然获得。'
                + '命令受理不等于学习增长；武学上限、教师原等级、知识类型、精神清零单列。'
                + '真实双持不证明副手独立分支覆盖，不改原随机或全局动作缓存。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误 | 命令受理/实际执行代价 | 学习次数/已用潜能 | 精神毛扣/写减 | 学习净进度均值 | 原结果 | 核验/未知 |',
            '| --- | ---: | --- | --- | --- | --- | ---: | --- | --- |');
        for (const c of mingjiaoTeachers) {
            const e = c.mingjiao_teachers, known = e.validated > 0;
            const results = Object.entries(e.results).map(([k, v]) => `${k}:${v}`).join(', ');
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}`
                + ` | ${known ? `${e.commands_accepted}/${e.command_execution_cost}` : '未观测'}`
                + ` | ${known ? `${e.learned_iterations}/${e.learned_points}` : '未观测'}`
                + ` | ${known ? `${e.jing_cost}/${e.jing_writeoff}` : '未知'}`
                + ` | ${f(e.learned_net.mean)} | ${known ? results : '未观测'}`
                + ` | ${e.validated}/${e.unknown} |`);
        }
    }
    const mingjiaoApprenticeLearning = report.conditions.filter(c => c.mingjiao_apprentice_learning);
    if (mingjiaoApprenticeLearning.length) {
        lines.push('', '## 明教张无忌：原拜师与圣火令普通授课', '',
            '师承由原非巫师USER的apprentice及原NPC的recruit建立，前置修为仍为实验输入，不代表完整自然养成。'
                + '学习条件的拜师准备成功不等于learn有进展；授课上限、潜能不足和非亲传拒绝独立统计。'
                + '随机增长只记录原终态与有限公式支持，不伪造隐藏随机；伤害表不适用。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误 | 实际新师承（其中学习准备） | 完成学习次数 | 精神毛扣／额外写减 | 学习净进度均值 | 核验／未知 |',
            '| --- | ---: | --- | --- | ---: | --- | ---: | --- |');
        for (const c of mingjiaoApprenticeLearning) {
            const e = c.mingjiao_apprentice_learning;
            const known = e.validated > 0;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${c.counts.observed}/${c.counts.refused}/${c.counts.error}`
                + ` | ${known ? `${e.formal_apprenticeships}（${e.setup_apprenticeships}）` : '未观测'}`
                + ` | ${known ? e.learned_iterations : '未观测'}`
                + ` | ${known ? `${e.jing_cost}/${e.jing_writeoff}` : '未知'}`
                + ` | ${f(e.learned_net.mean)} | ${e.validated}/${e.unknown} |`);
        }
    }
    const mingjiaoLingPerform = report.conditions.filter(c => c.mingjiao_ling_perform);
    if (mingjiaoLingPerform.length) {
        const fraction = value => value.trials ? `${value.successes}/${value.trials}` : '未知（分母0）';
        lines.push('', '## 明教圣火令：光华令、敛心令与吸焰令', '',
            '仅三绝招40个有限原USER条件，39条原草案加末尾超重对照；不冒充完整师承、其他绝招或全明教已采齐。'
                + '命令受理分母为已核验样本，判定分母只含已受理且实际进入判定的样本；拒绝、错误与不适用独立记录。'
                + '光华/敛心直伤输入与实际气血损失、气血创伤、精神损失及精神创伤分列，不相加排名。'
                + '失手或吸焰未调用直伤的输入为空而非数值0；未知不补零。敛心final是原同步处理，不估计自然延时收益。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误；核验/未知 | 命令受理/核验 | 判定成功/实际判定 | 直伤输入均值/输入样本 | 自身内力毛扣均值 | 自身/目标结束忙乱均值 | 弱熟练均值 |',
            '| --- | ---: | --- | --- | --- | --- | ---: | --- | ---: |');
        for (const c of mingjiaoLingPerform) {
            const e = c.mingjiao_ling_perform;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.validated}/${e.unknown}`
                + ` | ${fraction(e.accepted)} | ${fraction(e.gate)} | ${f(e.input_damage.mean)}/${e.input_damage.n}`
                + ` | ${f(e.actor_neili_cost.mean)} | ${f(e.actor_busy.mean)}/${f(e.target_busy.mean)} | ${f(e.weak_gain.mean)} |`);
        }
        lines.push('', '### 气血、精神与装备原落点', '',
            '五类目标资源毛账保留，不把敛心的精神损伤并入气血，也不把直伤输入当作最终扣血。结束忙乱不替代原过程中请求。'
                + '磨损仅以光华成功样本为分母，未抽到磨损不证明永不磨损。'
                + '吸焰位置仅按已核验原武器落点计数，位置比例分母为已记录的三种落点总和；正常与超重条件逐条分开，不合并成统一夺器率。'
                + '资格拒绝后原武器仍在目标只表示原位置，不算受理后的判定失败；判定成功率使用上表独立分母。'
                + '纳入怀中的文案不等于实际取得或自动装备：超重时原武器可能落入房间。', '',
            '| 条件 | 目标气血/气血创伤均值 | 目标精神/精神创伤均值 | 目标内力毛扣均值 | 磨损/光华成功 | 原武器落点：自己/房间/仍在目标 |',
            '| --- | --- | --- | ---: | --- | --- |');
        for (const c of mingjiaoLingPerform) {
            const e = c.mingjiao_ling_perform, positions = e.transfer.actor + e.transfer.room + e.transfer.target;
            const location = positions ? `${e.transfer.actor}/${positions}；${e.transfer.room}/${positions}；${e.transfer.target}/${positions}` : '未记录/不适用（分母0）';
            lines.push(`| ${c.id} | ${f(e.target_costs.qi.mean)}/${f(e.target_costs.eff_qi.mean)}`
                + ` | ${f(e.target_costs.jing.mean)}/${f(e.target_costs.eff_jing.mean)} | ${f(e.target_costs.neili.mean)}`
                + ` | ${fraction(e.wear)} | ${location} |`);
        }
    }
    const mingjiaoLingLearning = report.conditions.filter(c => c.mingjiao_ling_learning);
    if (mingjiaoLingLearning.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        const labels = values => Object.entries(values).map(([value, n]) => `${text(value)} × ${n}`).join('；') || '未知/未调用';
        lines.push('', '## 明教圣火令：资格接口与原练习进度', '',
            '仅40个确定性接口/练习条件，24接口与16练习分别记录；不证明自然拜师、教师上限、完整圣火令或全明教已经采齐。'
                + '接口原数值0/文本返回、资格拒绝及命令返回分别保留，type文本不伪造为数值0。'
                + '原先天悟性与有效膂力/悟性/身法分开核验，资格接口通过不代表已经自然学得对应等级。'
                + '本批不选攻击动作、不估计极意冷载系数；来源/实现归属与实际效果分列，错误及不适用独立未知，不补零。', '',
            '| 接口条件 | 已采/计划 | 观察/拒绝/错误；核验/未知 | 原数值返回均值/数值样本 | 原文本返回及频数 | 实际实现来源及频数 | 原已加载状态均值 | 有效膂力/悟性/身法均值 |',
            '| --- | ---: | --- | --- | --- | --- | ---: | --- |');
        for (const c of mingjiaoLingLearning.filter(c => c.method === 'interface')) {
            const e = c.mingjiao_ling_learning;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.validated}/${e.unknown}`
                + ` | ${f(e.interface.result.mean)}/${e.interface.result.n} | ${labels(e.interface.texts)}`
                + ` | ${labels(e.interface.implemented_by)} | ${f(e.interface.loaded_before.mean)}`
                + ` | ${f(e.effective.str.mean)}/${f(e.effective.int.mean)}/${f(e.effective.dex.mean)} |`);
        }
        lines.push('', '### 原练习：完整与部分完成、真实扣费', '',
            '请求次数、已完成次数、熟练进度和原命令返回分列。返回0不等于零进度：请求三次但只完成两次仍保留部分进度及两次扣费。'
                + '圣火令练习每次检查80点气血/内力，实际扣50点当前气血和70点内力；检查值不冒充收费值，部分完成不退款或补练。'
                + '完成量与原提示用于说明完整/部分/拒绝，不将命令受理称为武学发动；没有攻击，不生成零伤害排名。', '',
            '| 练习条件 | 已采/计划 | 观察/拒绝/错误；核验/未知 | 请求次数/完成均值 | 熟练增量均值 | 原命令返回均值/样本 | 当前气血/内力毛扣均值 | 原提示及频数 |',
            '| --- | ---: | --- | --- | ---: | --- | --- | --- |');
        for (const c of mingjiaoLingLearning.filter(c => c.method === 'practice')) {
            const e = c.mingjiao_ling_learning;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.validated}/${e.unknown}`
                + ` | ${c.parameters.repetitions}/${f(e.practice.completed.mean)} | ${f(e.practice.learned_gain.mean)}`
                + ` | ${f(e.practice.command_accepted.mean)}/${e.practice.command_accepted.n}`
                + ` | ${f(e.practice.qi_cost.mean)}/${f(e.practice.neili_cost.mean)} | ${labels(e.practice.notices)} |`);
        }
    }
    const mingjiaoShenghuo = report.conditions.filter(c => c.mingjiao_shenghuo);
    if (mingjiaoShenghuo.length) {
        const fraction = value => value.trials ? `${value.successes}/${value.trials}` : '未知（分母0）';
        lines.push('', '## 明教圣火令与圣火神功：普通攻击、残血令与被动联动', '',
            '有限实验配功，普通攻击、残血令与直接被动接口分别采集，不冒充自然师承、完整实战或同成本强弱比较。'
                + '主批保留原首次加载200级的全局极意招式；独立400/800级冷载条件不得混作逐样本重置或跨缓存伤害排名。'
                + '残血令两分支均以原hit保护七次普通攻击，max_hit仅成功分支用于附加创伤；判定结果与神功实际调用资格分列。'
                + '加力0、有效圣火令不足或扣费后内力不足的样本不能单独证明连击保护有效；隐藏随机抽签不反推。'
                + '事件计数仅来自已核验的观察执行；普通攻击没有命令回执，接口返回0仍可完成观察，不把执行成功等同神功触发。'
                + '拒绝、错误和未适用独立记录，分母0记未知，不补成零概率。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误；核验/未知 | 观察执行/核验 | 主攻击/追加/计划追加 | 神功调用/合资格/武学调用 | 神功触发/合资格；残血令成功/判定 |',
            '| --- | ---: | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoShenghuo) {
            const e = c.mingjiao_shenghuo;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.validated}/${e.unknown}`
                + ` | ${fraction(e.acceptance)} | ${e.primary_attacks}/${e.additional_attacks}/${e.planned_additional}`
                + ` | ${e.force_calls}/${e.eligible_force_calls}/${e.martial_calls}`
                + ` | ${fraction(e.force_trigger)}；${fraction(e.can_gate)} |`);
        }
        lines.push('', '### 直接附伤、公共伤害与实际资源毛账', '',
            '圣火令hit_ob直接气血损失/创伤与其后的公共攻击气血损失/创伤分列；递归外层记录不重复累计子攻击伤害。'
                + '伤害与攻击次数分布只含已核验受理样本，内力、结束忙乱与弱熟练分布含已核验样本，二者分母不混用。'
                + '五类资源毛扣保留于JSON；内力不虚构每击加力费用。忙乱请求及来源见原始busy_calls，结束忙乱不等于未请求。'
                + 'attacks.after早于原普通攻击的后置忙乱中断，不能据此推定后置状态；本切片无新的自然到期回调。', '',
            '| 条件 | 圣火令气血/创伤均值 | 公共气血/创伤均值 | 主攻击/追加均值 | 最大递归深度均值 | 内力毛扣/结束忙乱/弱熟练均值 | 缓存范围 |',
            '| --- | --- | --- | --- | ---: | --- | --- |');
        for (const c of mingjiaoShenghuo) {
            const e = c.mingjiao_shenghuo;
            lines.push(`| ${c.id} | ${f(e.ling_damage.mean)}/${f(e.ling_wound.mean)}`
                + ` | ${f(e.public_damage.mean)}/${f(e.public_wound.mean)}`
                + ` | ${f(e.primary_per_sample.mean)}/${f(e.additional_per_sample.mean)}`
                + ` | ${f(e.max_depth.mean)} | ${f(e.neili_cost.mean)}/${f(e.busy.mean)}/${f(e.weak_progress.mean)}`
                + ` | ${e.cache_scope} |`);
        }
    }
    const mingjiaoShengong = report.conditions.filter(c => c.mingjiao_shengong);
    if (mingjiaoShengong.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 明教圣火神功：资格、容量、研究与强化', '',
            '普通USER有限配功，不冒充自然拜师或完整NPC教学。资格、内力容量、练习、研究、独有强化和公共恢复分别记录。'
                + '本切片没有攻击，不把空攻击记录当作零伤害强弱结论，也未采圣火令联动hit_ob。'
                + '研究正常费用、精神实际净损与不足时原清零净损分列；未完成研究不等于没有消耗，清零不冒充单次27点收费。'
                + '接口文字/数值及其实现来源保留，未知不补零；非研究条件的研究费与清零量不适用。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误；未知 | 接口返回及样本数 | 命令尝试/受理/发动 | 完成/熟练均值；正进度/已核验 | 精神毛扣/研究费/清零净损均值 | 内力毛扣/当前气血恢复均值 |',
            '| --- | ---: | --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoShengong) {
            const e = c.mingjiao_shengong;
            const interfaces = Object.entries(e.interface_values).map(([value, n]) => `${text(value)} × ${n}`).join('；') || '未知/未调用';
            const progress = e.probability_scope === 'lifecycle_only' ? '仅生命周期'
                : e.validated_samples ? `${e.progressed_samples}/${e.validated_samples}` : '未知（分母0）';
            const research = c.method === 'research' ? `${f(e.research_fee.mean)}/${f(e.jing_writeoff.mean)}` : '不适用/不适用';
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.unknown_samples}`
                + ` | ${interfaces} | ${e.command_attempts}/${e.commands_accepted}/${e.launches}`
                + ` | ${f(e.completed.mean)}/${f(e.learned_gain.mean)}；${progress}`
                + ` | ${f(e.costs.jing.mean)}/${research}`
                + ` | ${f(e.costs.neili.mean)}/${f(e.recovery.qi.mean)} |`);
        }
        lines.push('', '### 真实临时属性与原自然回调', '',
            '临时apply偏移与公共攻击/轻功/招架能力增量分列，apply/armor是属性观测，不推算减伤比例。'
                + '20级powerup与40级shield的有限到期样本只证明对应原记录，不能推广全部等级或估计随机熟练率。'
                + '弱熟练的随机结果由独立即时条件统计；自然回调对数和实际到期秒数不冒充持续实战收益。', '',
            '| 条件 | apply攻击/轻功/招架/armor偏移均值 | 公共攻击/轻功/招架增量均值 | 忙乱0/1/2/3样本 | 回调对数/到期秒数均值 | 接口实现来源 |',
            '| --- | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoShengong) {
            const e = c.mingjiao_shengong;
            lines.push(`| ${c.id} | ${f(e.apply_delta.attack.mean)}/${f(e.apply_delta.dodge.mean)}/${f(e.apply_delta.parry.mean)}/${f(e.apply_delta.armor.mean)}`
                + ` | ${f(e.powers_delta.attack.mean)}/${f(e.powers_delta.dodge.mean)}/${f(e.powers_delta.parry.mean)}`
                + ` | ${[0, 1, 2, 3].map(n => e.busy_histogram[n]).join('/')}`
                + ` | ${e.callback_pairs}/${f(e.expiry_seconds.mean)} | ${e.implemented_by.map(text).join('；') || '未知/未调用'} |`);
        }
    }
    const mingjiaoMovement = report.conditions.filter(c => c.mingjiao_movement);
    if (mingjiaoMovement.length) {
        const fraction = value => value.trials ? `${value.successes}/${value.trials}` : '未知（分母0）';
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 明教三轻功：资格、练习与防御接口', '',
            '圣火步、青蝠身法、凌虚步使用有限实验配功；凌虚步仅按范遥实际自用关系纳入，不冒充自然师承或完整门派。'
                + '接口值、实现来源、原练习命令、完成次数、熟练与资源毛账分列；missing表示函数不存在，零返回不证明接口已实现。'
                + '闪避原文及其频数见JSON，保留冻结原文及已有文字问题，不将描述随机性当作防御成功率。'
                + '事件数仅累计已核验样本，错误或未适用另记未知，不据此推定未知样本零事件。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误；未知 | 接口数值均值 | 命令尝试/受理 | 完成练习/熟练均值 | 自身当前气血/内力毛扣均值 | 接口实现来源及样本数 |',
            '| --- | ---: | --- | ---: | --- | --- | --- | --- |');
        for (const c of mingjiaoMovement) {
            const e = c.mingjiao_movement;
            const implementations = Object.entries(e.implemented_by).map(([source, n]) => `${text(source)} × ${n}`).join('；') || '未知/未调用';
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}；${e.unknown_samples}`
                + ` | ${f(e.interface_result.mean)} | ${e.command_attempts}/${e.commands_accepted}`
                + ` | ${f(e.completed_repetitions.mean)}/${f(e.learned_gain.mean)}`
                + ` | ${f(e.costs.qi.mean)}/${f(e.costs.neili.mean)} | ${implementations} |`);
        }
        lines.push('', '### 普通防御与公共直伤分开观察', '',
            '闪避、招架及普通取消的分母只含该条件已核验的ordinary样本；接口取消与BHinfo可观察副效应的分母只含valid_damage接口样本。'
                + 'BHinfo不是伤害取消：零返回仍可留下可观察消息，不能据此倒推隐藏随机分支。'
                + '直接伤害不并入普通防御率，基础/结算DP与青蝠额外DP百分比分列；不作DPS排名或跨实验配置强弱结论。', '',
            '| 条件 | 原普攻/防御调用/取消调用 | 闪避/普攻；招架/普攻；取消/普攻 | 接口取消/接口；BHinfo副效应/接口 | 基础/结算DP均值 | 额外DP百分比均值 | 目标当前气血/伤势毛扣均值 |',
            '| --- | --- | --- | --- | --- | ---: | --- |');
        for (const c of mingjiaoMovement.filter(c => c.method === 'ordinary'
            || ['valid_damage', 'do_damage'].includes(c.parameters.ability))) {
            const e = c.mingjiao_movement;
            lines.push(`| ${c.id} | ${e.primary_attacks}/${e.defense_calls}/${e.cancellation_calls}`
                + ` | ${fraction(e.dodge)}；${fraction(e.parry)}；${fraction(e.cancel)}`
                + ` | ${fraction(e.interface_cancel)}；${fraction(e.bhinfo_side_effect)}`
                + ` | ${f(e.base_dp.mean)}/${f(e.settled_dp.mean)} | ${f(e.extra_dp_percent.mean)}`
                + ` | ${f(e.target_costs.qi.mean)}/${f(e.target_costs.eff_qi.mean)} |`);
        }
    }
    const mingjiaoXinfa = report.conditions.filter(c => c.mingjiao_xinfa);
    if (mingjiaoXinfa.length) {
        lines.push('', '## 明教圣火心法：强化、资格与容量', '',
            '真实普通USER的实验配功，不冒充自然师承或完整明教。接口返回值、命令尝试、受理、发动、资源毛账与公共能力变化分别记录。'
                + '强化的实际能力增量不等于临时apply数值；恢复调用公共内功入口，不代表圣火心法独有恢复。'
                + '低功力即时条件采集随机熟练；两条自然到期仅核生命周期，不参与随机熟练率。拒绝仍列入已核验样本，未知不填零。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误 | 接口值均值 | 命令尝试/受理/发动 | 内力毛扣/当前气血恢复均值 | 公共攻击/轻功/招架增量均值 | 熟练均值；正进度/已核验 | 到期秒数均值/回调对数 |',
            '| --- | ---: | --- | ---: | --- | --- | --- | --- | --- |');
        for (const c of mingjiaoXinfa) {
            const e = c.mingjiao_xinfa;
            const progress = e.probability_scope === 'lifecycle_only' ? '仅生命周期'
                : e.validated_samples ? `${e.progressed_samples}/${e.validated_samples}` : '未知（分母0）';
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}`
                + ` | ${f(e.interface_result.mean)} | ${e.command_attempts}/${e.commands_accepted}/${e.launches}`
                + ` | ${f(e.costs.neili.mean)}/${f(e.recovery.qi.mean)}`
                + ` | ${f(e.powers_delta.attack.mean)}/${f(e.powers_delta.dodge.mean)}/${f(e.powers_delta.parry.mean)}`
                + ` | ${f(e.learned_gain.mean)}；${progress} | ${f(e.expiry_seconds.mean)}/${e.callback_pairs} |`);
        }
    }
    const qishang = report.conditions.filter(c => c.mingjiao_qishang);
    if (qishang.length) {
        const fraction = value => value.trials ? `${value.successes}/${value.trials}` : '未知（分母0）';
        lines.push('', '## 明教七伤拳：原缓存、直伤与反噬', '',
            'main共享首次200级原加载的极意参数；cold400和cold800分别使用独立驱动，不混作同一成长样本。'
                + '实验靶基本内功与招架为3倍等级、无映射，不作同级胜率比较。伤字诀判定成功仍可能只反噬自身；'
                + '发动、目标伤害、自伤及当前气血恢复分别记账，receive_heal不恢复有效气血。未观察到正恢复不证明随机分支未触发；完整分布和分母见JSON。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误 | 对方气血/伤势毛扣均值 | 自身气血/伤势毛扣均值 | 自身当前气血恢复均值 | 内力支出均值 | 外判成功/发动；自伤/资格；正恢复/资格 |',
            '| --- | ---: | --- | --- | --- | ---: | ---: | --- |');
        for (const c of qishang) {
            const e = c.mingjiao_qishang;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}`
                + ` | ${f(e.target_cost.qi.mean)}/${f(e.target_cost.eff_qi.mean)}`
                + ` | ${f(e.actor_cost.qi.mean)}/${f(e.actor_cost.eff_qi.mean)}`
                + ` | ${f(e.actor_recovery.qi.mean)} | ${f(e.neili_cost.mean)}`
                + ` | ${fraction(e.gate_hit)}；${fraction(e.backlash)}；${fraction(e.recovery)} |`);
        }
    }
    const slice1 = report.conditions.filter(c => c.slice1);
    if (slice1.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片首批（gaibang/xiaoyao/kunlun/duan）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + '控制/增益类按原字段记账；实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice1) {
            const e = c.slice1;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice2 = report.conditions.filter(c => c.slice2);
    if (slice2.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第二批（wudu/tiezhang/shenlong/xuanming）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'wudu 双掌、shenlong 三段、xuanming 双 do_damage 按原分支费用记账。'
            + '实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice2) {
            const e = c.slice2;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice3 = report.conditions.filter(c => c.slice3);
    if (slice3.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第三批（lingjiu/murong/xingxiu/honghua）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'murong 连击按原 do_attack 序列记账，xingxiu 命中带 corpse_poison 与精神伤创。'
            + '实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice3) {
            const e = c.slice3;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice4 = report.conditions.filter(c => c.slice4);
    if (slice4.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第四批（xueshan/xuedao/riyue/jueqing）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'xuedao 命中/落空均带自身气血伤创，riyue 命中附带真气涣散，'
            + 'jueqing 命中忙乱 1-2。实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice4) {
            const e = c.slice4;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice5 = report.conditions.filter(c => c.slice5);
    if (slice5.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第五批（henshan/songshan/lingxiao/tianlongsi）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'songshan 命中忙乱 2-3、落空 2-4，lingxiao 非标准命中判定，'
            + 'tianlongsi 无授权门且需男性。实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice5) {
            const e = c.slice5;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice6 = report.conditions.filter(c => c.slice6);
    if (slice6.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第六批（meizhuang/miao/ouyang/zhenyuan）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'meizhuang 双免疫支、miao skill<260 掉剑且费用两分支均 500，'
            + 'ouyang 目标忙乱 1、zhenyuan 非标准命中判定。实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice6) {
            const e = c.slice6;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice7 = report.conditions.filter(c => c.slice7);
    if (slice7.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第七批（shang/hu/none+ultra）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。直伤类按 combatd 原支持集校验；'
            + 'hu 四分位命中、none 无授权门且零内力、ultra 反向命中且绝招在 perform 子目录。'
            + '实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice7) {
            const e = c.slice7;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const slice8 = report.conditions.filter(c => c.slice8);
    if (slice8.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 门派代表切片第八批（tangmen/xiakedao/yunlong）', '',
            '每派 1 个特有绝招 + 普通攻击代表 + valid_learn 边界；只采代表切片，'
            + '不代表该派全部武学已测，也不作强弱比较。tangmen 为 receive 类（wound=100%伤害），'
            + 'xiakedao percentRange 80-84 且反向命中，yunlong 非标准命中。'
            + '实验修为不代表拜师或自然养成。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of slice8) {
            const e = c.slice8;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b1 = report.conditions.filter(c => c.b1);
    if (b1.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 慕容×少林共享 perform 批量（20 招）', '',
            '两派销账；kind 分发 direct 11/control 2/buff 4/combo 3。'
            + '达摩清心/乱气教师键互换按源码原样记录。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b1) {
            const e = c.b1;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b2 = report.conditions.filter(c => c.b2);
    if (b2.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 太极系四派共享 perform 批量（10 招）', '',
            '红花会/明教/神龙教/武当四派销账；kind 分发 direct 7/control 1/buff 1/combo 1。'
            + '太极图为 receive_damage 直伤。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b2) {
            const e = c.b2;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b3 = report.conditions.filter(c => c.b3);
    if (b3.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 天龙×血刀×雪山共享 perform 批量（10 招）', '',
            '大理段家/血刀门/大轮寺三派销账；kind 分发 direct 6/control 1/combo 3。'
            + '象跌势与真·般若极的内力碾压即倒分支、龙吞势临时标记、若悲零费用按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b3) {
            const e = c.b3;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b4 = report.conditions.filter(c => c.b4);
    if (b4.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 华山共享 perform 批量（8 招）', '',
            '辟邪剑法华山/日月/少林三派销账、华山剑法华山/日月/慕容/神龙四派销账；kind 分发 direct 4/control 2/combo 2。'
            + '鬼影夺目致盲、破元剑闪封招、天外飞龙掷剑落场、夺命连环三仙剑三段直伤均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b4) {
            const e = c.b4;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b5 = report.conditions.filter(c => c.b5);
    if (b5.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 段真×绝铁共享 perform 批量（15 招）', '',
            '先天功/一阳指大理段家与全真教两派销账、铁掌/穿心/飞龙/铁线绝情谷与铁掌帮两派销账；'
            + 'kind 分发 direct 7/combo 5/control 1/heal 1。'
            + '神威浩荡与五阴焚灭的内力碾压即倒、神威浩荡碎甲、阳关三叠三段与三中封内、'
            + '阴阳磨寒热掌劲、龙飞势掷杖落场、九穹绝刹掌自伤气血、起死回生非战斗疗伤均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b5) {
            const e = c.b5;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b6 = report.conditions.filter(c => c.b6);
    if (b6.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 商家×镇远与杂簇共享 perform 批量（19 招）', '',
            '商家堡/八卦门、丐帮/桃花岛、关外胡家/中原苗家及六合/六阳/折梅/泼墨杂簇两派销账；'
            + 'kind 分发 direct 14/combo 3/control 1/buff 1（含掌中夹镖 receive 直伤）。'
            + '绊字诀内力碾压即倒、掌中夹镖暗器消耗、八卦震与神卦天印非标准命中、'
            + '生死符寒毒与精神创伤、封字诀临时招架增益均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b6) {
            const e = c.b6;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b7 = report.conditions.filter(c => c.b7);
    if (b7.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 少林独有 perform 批量（21 招）', '',
            '少林派独有绝招销账；'
            + 'kind 分发 direct 17/combo 2/control 1/buff 1（含凌空指穴与大手印 receive 直伤）。'
            + '万佛朝宗与赤血重爪内力碾压、燃木真焰临时增益、拈花拂穴按经验判定、'
            + '菩提寂灭自伤、凌空指穴与大手印直接伤血均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b7) {
            const e = c.b7;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b8 = report.conditions.filter(c => c.b8);
    if (b8.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 少林独有尾批 perform 批量（15 招）', '',
            '少林派独有尾批绝招销账；'
            + 'kind 分发 direct 4/combo 6/buff 4/control 1（含慈悲字诀 receive 直伤）。'
            + '罗汉降魔与红霞贯日直伤、来去若无形连击、修罗焰多段、慈悲字诀直接伤血与后续连击、'
            + '断云决与金龙疾空与震雷乾坤连击、避云遮日内力碾压、神龙再现与金刚不坏与即世即空与一苇渡江临时增益、'
            + '缠绕诀按经验判定均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b8) {
            const e = c.b8;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b9 = report.conditions.filter(c => c.b9);
    if (b9.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 日月独有 perform 批量（16 招）', '',
            '日月神教独有绝招销账；'
            + 'kind 分发 direct 10/combo 4/control 2（含星罗棋布暗器散射 receive 直伤）。'
            + '惊虹一笔与环环相扣与乾坤一击与开天辟地与无痕杀与天地归元直伤、'
            + '大智若愚与反璞归真掌力直伤（反璞归真另有后续连击）、'
            + '天蝎藏针与断脉破岳连击、绝命七杀与天旋地转连击带攻击加成、'
            + '大巧若拙与跗骨缠魂目标忙乱、星罗棋布暗器散射直接伤血与消耗、'
            + '百鬼恸哭非标准命中均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b9) {
            const e = c.b9;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b10 = report.conditions.filter(c => c.b10);
    if (b10.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 绝情独有 perform 批量（15 招）', '',
            '绝情谷独有绝招销账；'
            + 'kind 分发 direct 6/combo 4/control 5。'
            + '落雷式与破阳刀与魂飞魄散与破碎虚空与泰山压顶直伤、'
            + '狂风式与寒冰环与万念俱灰与日月无华与天绝锁目标忙乱、'
            + '横空出世直伤高百分比、阴阳环与九星连珠与天刀落云式与千山孤鸿影连击'
            + '（阴阳环与千山孤鸿影命中带攻击加成）均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b10) {
            const e = c.b10;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b11 = report.conditions.filter(c => c.b11);
    if (b11.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 丐帮独有 perform 批量（13 招）', '',
            '丐帮独有绝招销账；'
            + 'kind 分发 direct 7/multi 1/control 2/combo 1（含金针渡劫 receive 直伤）。'
            + '亢龙有悔三掌连击、震惊百里与绝命一踢与焚阳剑与傲尘剑与五丁开山直伤、'
            + '双龙取水夺械、飞龙在天连击、观日神诀直伤后九剑连击、'
            + '缠丝擒拿命中忙乱、铁爪锁喉内力碾压即倒、仙游诀目标忙乱、'
            + '金针渡劫暗器散射直接伤血与消耗均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b11) {
            const e = c.b11;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b12 = report.conditions.filter(c => c.b12);
    if (b12.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 红花会独有 perform 批量（13 招）', '',
            '红花会独有绝招销账；'
            + 'kind 分发 direct 8/combo 2/control 1/multi 1/buff 1。'
            + '战神轰天诀与诛天刹神内力碾压即倒、百花错乱命中忙乱、'
            + '百花错易与夺命连环连击、缚字诀与千头万绪鞭索控制、'
            + '化蝶临时身法增益、催魂掌毒伤、刀影重重与雷霆万钧与追魂夺命直伤、'
            + '诛天刹神夺械、掌藏龙暗器散射直接伤血与消耗均按原分支记账。只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b12) {
            const e = c.b12;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b13 = report.conditions.filter(c => c.b13);
    if (b13.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 华山独有 11 + 段氏独有尾 2 perform 批量（13 招）', '',
            '华山独有绝招 11 招与段氏独有尾 2 招销账；'
            + 'kind 分发 direct 6/combo 2/control 2/multi 1/buff 1/array 1。'
            + '宁氏一剑与风起云涌与惊天一剑与破石一击与混元无极与苍松式直伤、'
            + '华岳三神峰三段连斩、封闭手与飞絮飘渺目标忙乱、'
            + '雷动九天临时力道身法增益、风扫落叶与五绝连环连击均按原分支记账；'
            + '双剑和壁须两人组队，本批只记原无队伍拒绝，成功刀阵由 school_team 批次覆盖。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b13) {
            const e = c.b13;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b14 = report.conditions.filter(c => c.b14);
    if (b14.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 嵩山独有 11 + 玄冥独有 11 perform 批量（22 招）', '',
            '嵩山独有绝招 11 招与玄冥独有绝招 11 招销账；'
            + 'kind 分发 direct 8/combo 5/control 8/multi 1。'
            + '踏雪无痕与神光再现与如梦如幻与无影掌与蛟龙抱与卷字决与残月刺目标忙乱、'
            + '极天寒掌与破山斧与剑气冲霄与皓月穿空与通天彻地与只手遮天与真龙聚直伤、'
            + '千掌环与九曲十八弯与缤纷雪舞与掌打飞花与内点乾坤连击均按原分支记账；'
            + '天外玉龙含 real_perform 精髓分支，只手遮天含内力碾压反噬分支，'
            + '惊涛骇浪两掌连击分段扣费并各自施加玄冥寒毒。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b14) {
            const e = c.b14;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b15 = report.conditions.filter(c => c.b15);
    if (b15.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 全真独有 10 + 衡山独有 9 perform 批量（19 招）', '',
            '全真独有绝招 10 招与衡山独有绝招 9 招销账；'
            + 'kind 分发 direct 9/combo 4/control 4/multi 1/sacrifice 1。'
            + '玄门金锁与空明若玄与流云叠影与烟云锁身目标忙乱、'
            + '朝拜天罡与三花聚顶与剑指南山与群星璀璨与空空如也与紫盖回翔与排山倒海与青天揽日月与乱剑覆花直伤、'
            + '重阳连环掌与峰连碧罗与落英纷飞与一剑落九雁连击、破穹云蛟三掌各自判定均按原分支记账；'
            + '玉石俱焚含内力碾压同归分支，烟云锁身含夺械分支。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b15) {
            const e = c.b15;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b16 = report.conditions.filter(c => c.b16);
    if (b16.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 苗家独有 9 + 五毒独有 9 perform 批量（18 招）', '',
            '苗家独有绝招 9 招与五毒独有绝招 9 招销账；'
            + 'kind 分发 direct 10/combo 3/control 2/multi 1/duo 1/throwing 1。'
            + '云边摘月与盘鹰诀目标忙乱、丹阳劲与翅展九州与残阳劲与魁星点元与黄龙吐珠与搏虎诀与腾蛇诀与毒蟾掌与夺命连环直伤、'
            + '五岳为开与剑舞千秋与锁龙诀连击、毒龙双锥两剑各自判定、金钩夺魄三分支、无影针暗器消耗均按原分支记账；'
            + '金钩夺魄含内力碾压即死与夺械分支。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b16) {
            const e = c.b16;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b17 = report.conditions.filter(c => c.b17);
    if (b17.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 胡家独有 8 + 欧阳独有 8 + 昆仑独有 8 perform 批量（24 招）', '',
            '关外胡家独有绝招 8 招、欧阳世家独有绝招 8 招与昆仑派独有绝招 8 招销账；'
            + 'kind 分发 direct 9/control 4/combo 2/multi 1/throwing 2/buff 2/sacrifice 1/special 3。'
            + '风卷霹雳上九天与雄霸群山与横扫千军与千蛇万噬与柔字诀与石破天惊与无声无色与损筋诀与逆转乾坤直伤、'
            + '奔拳快打与灵蛇缠身与点字诀与日入空山目标忙乱、千蛇出洞与日月乾坤连击、蟾震九天三掌各自判定、'
            + '星光闪烁与流星电闪暗器消耗、作茧自缚与飞天神行临时增益、玉碎昆冈内力碾压同归分支均按原分支记账；'
            + '蛇毒奇巧仅对蛇类目标生效，非蛇目标按原拒绝记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b17) {
            const e = c.b17;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const b22 = report.conditions.filter(c => c.b22);
    if (b22.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 凌霄 2 + 桃花 2 + 灵鹫/逍遥尾 3 + none 3 perform 批量（10 招）', '',
            '凌霄城独有绝招 2 招、桃花岛独有绝招 2 招、灵鹫宫与逍遥派尾批绝招 3 招与侠客盟 none 独有绝招 3 招销账；'
            + 'kind 分发 direct 3/combo 2/multi 1/special 3/practice 1。'
            + '神倒鬼跌三连环三段直伤、冷剑决与天诛龙蛟诀与云霞幻生直伤、'
            + '夺命催心含催心标记与招架削弱、化妖功含内力碾压即死与收伤分支、破气式封内、'
            + '天升剑诀与总破式连击、总诀式演练均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b22) {
            const e = c.b22;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b23 = report.conditions.filter(c => c.b23);
    if (b23.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 多段直伤 21 招 perform 批量', '',
            '少林寺 2 + 大理段家 2 + 慕容世家 1 + 丐帮 1 + 凌霄城 1 + 梅庄 1 + 衡山派 1 + 峨嵋派 1'
            + ' + 玄冥教 1 + 神龙教 1 + 侠客盟 8 多段直伤销账；kind 均为 multi_stage。'
            + '真·六道轮回与六合连环诀与无形剑气与万剑纵横与参合剑气与亢龙有悔与清流剑与风雷四击'
            + '与五神朝元势与西子捧心与玄冥双行与神龙再现与三板斧与刀剑七重天与金蛇噬天'
            + '与夺命连环爪与无双无对与海市蜃楼与风神诀与御剑飞升与剑芒多段直伤均按原分支记账，各段独立判定。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b23) {
            const e = c.b23;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b24 = report.conditions.filter(c => c.b24);
    if (b24.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 连击 13 招 perform 批量', '',
            '少林派 2 + 武当派 1 + 慕容世家 1 + 古墓派 2 + 云龙门 1 + 桃花岛 1 + 侠客盟 5 连击销账；kind 均为 combo。'
            + '达摩三绝剑与狂风落叶与三环套月与北斗七星剑与迅雷击与连环剑与断字诀与狂风绝技'
            + '与附骨缠身与蛇影万道与落字诀与西洋连环剑与百花错乱连击均按原分支记账，逐击经原普通攻击结算。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b24) {
            const e = c.b24;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b25 = report.conditions.filter(c => c.b25);
    if (b25.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 即死 5 + 治疗 2 perform 批量', '',
            '逍遥派 1 + 灵鹫宫 1 + 大理段家 2 + 侠客盟 3 即死疗伤销账；kind 分发 instant_death 5/heal 2。'
            + '化妖功含内力碾压即死、五阴焚灭与天打雷劈含经验判定与即死分支、小李飞刀必杀并消耗暗器、'
            + '归去来兮两段掌劲各自判定、起死回生与一阳指运功疗伤非战斗恢复均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b25) {
            const e = c.b25;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b26 = report.conditions.filter(c => c.b26);
    if (b26.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 控制/缴械 perform 批量（未覆盖集）', '',
            '全真教 1 + 丐帮 2 + 衡山派 2 控制缴械销账；kind 分发 control 4/disarm 1。'
            + '缠字诀与回峰蜿蜒势与凌空指穴目标忙乱、擒龙手夺械，均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b26) {
            const e = c.b26;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b27 = report.conditions.filter(c => c.b27);
    if (b27.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 杂项 perform 批量（纯消息/标记/杂项）', '',
            '侠客盟 8 + 明教 2 + 慕容世家 1 + 星宿派 1 + 大理段家 1 + 古墓派 2 + 血刀门 1 + 凌霄城 1 杂项销账；'
            + 'kind 分发 control 12/buff 2/multi 1。'
            + '碧海清波与缠字诀与牧野鹰扬与七星指穴等非标准控制目标忙乱、'
            + '虚无缥缈与金钟罩临时增益标记、五遁绝杀多轮攻击，均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b27) {
            const e = c.b27;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b28 = report.conditions.filter(c => c.b28);
    if (b28.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## generate/misc 桶 perform 批量（无正式派归属 18 招）', '',
            'generate/misc 桶无正式派归属，侠客盟销账；'
            + 'kind 分发 direct 8/combo 6/control 1/instant_death 1/special 2。'
            + '东洋刀法乱刀诀与迎风一刀斩、降龙十八掌雷霆一击与龙翔九天、迷踪猴拳破釜沉舟、'
            + '不败神功天地绝灭与天打雷劈与破字诀与天花乱坠与晴空万里与御策诀、'
            + '圣骑士戟冲刺攻击与旋转卷刺、天长掌法地老天荒、衡山五神剑千剑纵横势、'
            + '西洋剑术刺剑、血刀祭血神刀与血雨均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b28) {
            const e = c.b28;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b29 = report.conditions.filter(c => c.b29);
    if (b29.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 无 grant 公共/任务武学 perform 批量（55 招）', '',
            '公共/任务武学无正式派归属，侠客盟销账；'
            + 'kind 分发见批次说明。'
            + '南海玄功碧海清波与绝戮斩诛仙决与五阴焚灭与玄黄连环掌、独孤九剑总诀式与破字诀与剑意、'
            + '六脉神剑无形剑气与六脉剑气与万剑纵横与纵横、金蛇剑掌锥系、玉女剑与无双无对、御剑飞升、'
            + '百步穿杨、神照经无影拳舞与无影神拳、中平枪法定岳七方、独孤九剑四式、葵花魔功五式、'
            + '九阳神功五式、太玄功五式、蟾震九天、大挪移、小李飞刀、五遁绝杀、金刚不坏护体、凝血疾电、'
            + '乾坤神剑三式均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b29) {
            const e = c.b29;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b21 = report.conditions.filter(c => c.b21);
    if (b21.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 镇远 4 + 商家 4 + 云龙 4 + 峨嵋 4 + 雪山 4 perform 批量（20 招）', '',
            '八卦门独有绝招 4 招、商家堡独有绝招 4 招、云龙门独有绝招 4 招、峨嵋派独有绝招 4 招与大轮寺独有绝招 4 招销账；'
            + 'kind 分发 direct 9/combo 5/control 1/buff 1/throwing 2/multi 1/special 2。'
            + '镖中现掌与背心钉与混沌初开与犀牛望月转回还与佛光初现与灭剑与云龙三现直伤、'
            + '乾坤一掷与金莲幻生暗器消耗、缠字诀目标忙乱、'
            + '翻卦连环掌与天残剑诀与疾电与缤纷雪舞与五轮连转连击、'
            + '圆满势临时招架增益、绝剑多段直伤、破元通虚封内、截筋断脉含精神伤与目标忙乱均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b21) {
            const e = c.b21;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b20 = report.conditions.filter(c => c.b20);
    if (b20.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 星宿 5 + 铁掌 5 + 血刀 5 + 逍遥 5 perform 批量（20 招）', '',
            '星宿派独有绝招 5 招、铁掌帮独有绝招 5 招、血刀门独有绝招 5 招与逍遥派独有绝招 5 招销账；'
            + 'kind 分发 direct 10/control 2/combo 5/special 2/buff 1。'
            + '炼心弹与腐尸毒直伤含火毒/尸毒、掌心雷与春雷炸空与孤雁出群与血浪滔天与祭血神刀与捕风捉影与攀阳邀月与流月剑诀直伤、'
            + '如蛆附骨与无影神刀目标忙乱、冰雪纷飞与五雷连闪与赤炼神刀与流星火雨与如意六刀连击、'
            + '碧焰滔天自损内力上限、噬血穹苍直伤后连击、洛神凌波临时身法增益均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b20) {
            const e = c.b20;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b19 = report.conditions.filter(c => c.b19);
    if (b19.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 武当 7 + 天龙 6 + 侠客 5 + ultra 5 perform 批量（23 招）', '',
            '武当派独有绝招 7 招、大理段家独有绝招 6 招、侠客岛独有绝招 5 招与侠客盟 ultra 独有绝招 5 招销账；'
            + 'kind 分发 direct 9/combo 5/control 3/multi 2/receive 1/special 1/throwing 1。'
            + '隔山打牛与太极初升与乱环诀与柔月穿空与绝户神抓与焚身与无形剑气与赤焰暴长与晴空万里直伤、'
            + '谁与争锋与天寰神炎与六脉剑气与太玄激劲与破字诀连击、神门刺与神指点穴与天花乱坠目标忙乱、'
            + '万剑纵横与白首太玄经多段直伤、乘风破浪直接伤血、御策诀暗器消耗、天打雷劈含经验判定与即死分支均按原分支记账。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b19) {
            const e = c.b19;
            lines.push('| ' + text(c.id) + ' | ' + c.recorded + '/' + c.planned + ' | ' + e.counts.observed + '/' + e.counts.refused
                + ' | ' + (e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—')
                + ' | ' + (e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—') + ' |');
        }
    }
    const b18 = report.conditions.filter(c => c.b18);
    if (b18.length) {
        const text = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;').replaceAll('|', '\\|').replaceAll('`', '&#96;')
            .replaceAll('\x1b', '\\x1b').replace(/\r\n|\r|\n/g, '<br>');
        lines.push('', '## 唐门 7 + 灵鹫 7 + 梅庄 7 + 神龙 7 perform 批量（28 招）', '',
            '唐门世家独有绝招 7 招、灵鹫宫独有绝招 7 招、梅庄独有绝招 7 招与神龙教独有绝招 7 招销账；'
            + 'kind 分发 direct 10/control 3/combo 5/multi 1/throwing 5/buff 2/special 4。'
            + '七子刚镖与散花天女与幻遁寒星与射日诀暗器消耗、心有千千结与云雾暗点与闪剑诀目标忙乱、'
            + '流花掠影与幻剑诀与七弦连环诛与诗意纵横与飞仙术连击、归去来兮两段掌劲各自判定、'
            + '回梦与破靛神砂与海渊式与冰坚地狱与摧心断肠与辣手化骨与神龙初现与电光四射与神笔封穴直伤均按原分支记账；'
            + '破神诀含内力碾压即死分支，唱仙法吼字决含内力比较与先扣费后拒绝分支，'
            + '七弦无形音含精神伤与免疫分支，随风而舞含经验判定与自伤离场。'
            + '只收集数据，不比较强弱。', '',
            '| 条件 | 已记录/计划 | 观察/拒绝 | 命中率 | 直伤输入分布 |',
            '| --- | --- | --- | --- | --- |');
        for (const c of b18) {
            const e = c.b18;
            lines.push(`| ${text(c.id)} | ${c.recorded}/${c.planned} | ${e.counts.observed}/${e.counts.refused}`
                + ` | ${e.hits && e.hits.trials ? f(e.hits.rate * 100) + '%' : '—'}`
                + ` | ${e.inputs.n ? f(e.inputs.mean) + ' [ ' + f(e.inputs.p10) + ', ' + f(e.inputs.p90) + ' ]' : '—'} |`);
        }
    }
    const mingjiaoCore = report.conditions.filter(c => c.mingjiao_core);
    if (mingjiaoCore.length) {
        lines.push('', '## 明教寒冰绵掌：普通攻击与连绵不绝首切片', '',
            '靶基本招架为等级三倍、无映射；这是观察绝招原随机分支的实验条件，不作同级胜率比较。'
                + '加力0不触发寒毒。临时apply/damage不等同徒手实际增伤；命令发动、判定加成和普通命中分列。', '',
            '| 条件 | 已采/计划 | 观察/拒绝/错误 | 原攻击数均值 | 气血/伤势净损均值 | 内力支出均值 | 自身忙乱均值 | 加成成功/判定数 |',
            '| --- | ---: | --- | ---: | --- | ---: | ---: | --- |');
        for (const c of mingjiaoCore) {
            const e = c.mingjiao_core;
            lines.push(`| ${c.id} | ${c.recorded}/${c.planned}`
                + ` | ${e.counts.observed}/${e.counts.refused}/${e.counts.error}`
                + ` | ${f(e.attacks_per_accepted.mean)}`
                + ` | ${f(e.damage_per_accepted.mean)}/${f(e.wound_per_accepted.mean)}`
                + ` | ${f(e.actor_neili_cost.mean)} | ${f(e.actor_busy.mean)}`
                + ` | ${e.bonus_given_accepted.successes}/${e.bonus_given_accepted.trials} |`);
        }
    }
    for (const c of report.conditions.filter(c => c.mingjiao_qkd))
        lines.push('', mingjiaoQkdMarkdown(c.mingjiao_qkd));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang))
        lines.push('', mingjiaoJiuyangMarkdown(c.mingjiao_jiuyang));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_learning))
        lines.push('', mingjiaoJiuyangLearningMarkdown(c.mingjiao_jiuyang_learning));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_direct))
        lines.push('', mingjiaoJiuyangDirectMarkdown(c.mingjiao_jiuyang_direct));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_remaining))
        lines.push('', mingjiaoJiuyangRemainingMarkdown(c.mingjiao_jiuyang_remaining));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_exert))
        lines.push('', mingjiaoJiuyangExertMarkdown(c.mingjiao_jiuyang_exert));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_capacity))
        lines.push('', mingjiaoJiuyangCapacityMarkdown(c.mingjiao_jiuyang_capacity, manifest));
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_research)) {
        assert.ok(Array.isArray(rows), '九阳研究 Markdown 需要原始台账 rows');
        lines.push('', mingjiaoJiuyangResearchMarkdown(c.mingjiao_jiuyang_research, manifest,
            rows.filter(row => row.condition_id === c.id)));
    }
    for (const c of report.conditions.filter(c => c.mingjiao_jiuyang_fusion)) {
        assert.ok(Array.isArray(rows), '九阳融合 Markdown 需要原始台账 rows');
        lines.push('', mingjiaoJiuyangFusionMarkdown(c.mingjiao_jiuyang_fusion, manifest,
            rows.filter(row => row.condition_id === c.id)));
    }
    for (const c of report.conditions.filter(c => c.mingjiao_remaining_perform)) {
        assert.ok(Array.isArray(rows), '明教剩余绝招 Markdown 需要原始台账 rows');
        lines.push('', mingjiaoRemainingPerformMarkdown(c.mingjiao_remaining_perform, manifest,
            rows.filter(row => row.condition_id === c.id)));
    }
    for (const c of report.conditions.filter(c => c.mingjiao_remaining_base)) {
        assert.ok(Array.isArray(rows), '明教剩余普通技能 Markdown 需要原始台账 rows');
        lines.push('', mingjiaoRemainingBaseMarkdown(c.mingjiao_remaining_base, manifest,
            rows.filter(row => row.condition_id === c.id)));
    }
    for (const c of report.conditions.filter(c => c.mingjiao_force_remaining)) {
        assert.ok(Array.isArray(rows), '明教剩余内功 Markdown 需要原始台账 rows');
        lines.push('', mingjiaoForceRemainingMarkdown(c.mingjiao_force_remaining, manifest,
            rows.filter(row => row.condition_id === c.id)));
    }
    lines.push('', '角色资格由实验配置提供，不代表教师当前可传授或同养成成本。旧中性兵器组不混算。',
        '只报告本系列条件；已采某门派部分能力不代表该门派全部技能或完整防御/回调/交锋覆盖。',
        '全局动作表的初始化与缓存保持原实现；未人为重算 this_player() 或随机系数。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        const args = process.argv.slice(2), includeErrors = args.includes('--include-errors');
        if (includeErrors) args.splice(args.indexOf('--include-errors'), 1);
        assert.ok((args.length === 1 || args.length === 2) && args.every(a => !a.startsWith('--')),
            '用法：node tools/tests/martial_data/school_combat_report.mjs 系列目录 [新的仓库外报告目录] [--include-errors]');
        const report = readSchoolCombat(args[0], { includeErrors });
        const manifest = openSeries(args[0]);
        const markdown = schoolCombatMarkdown(report, manifest, readSamples(args[0], manifest));
        if (args[1]) {
            const output = newOutput(args[1]);
            writeFileSync(join(output, 'school-combat.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
            writeFileSync(join(output, 'school-combat.md'), markdown, { flag: 'wx' });
            console.log('门派组合报告：' + output);
            console.log(JSON.stringify({ totals: report.totals, fingerprint: report.fingerprint, evidence: report.evidence_sha256 }));
        } else console.log(markdown);
    } catch (error) { console.error('门派组合报告失败：' + error.message); process.exitCode = 1; }
}
