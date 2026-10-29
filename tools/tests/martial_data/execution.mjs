import assert from 'node:assert/strict';
import { emeiNpcBoutConditions } from './school_emei_npc_bout_cases.mjs';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { applyProbes } from '../../bench_weapon_balance.mjs';
import { buildInventory, collectVersions, isInside, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { coverage, coverageMarkdown, createSeries, digest, openSeries } from './ledger.mjs';
import { observedEffectSources } from './observed_effect_sources.mjs';
import { attemptImporter, jsonlTail, missingJobs, sampleImporter, seriesLock, verifyAttemptStopped, verifyResume } from './continuation.mjs';
import { weaponConditions, profiles } from './weapon_cases.mjs';
import { abilityConditions, validateAbilityRecord } from './ability_cases.mjs';
import { boutConditions, validateBoutRecord } from './bout_cases.mjs';
import { weaponSpecialConditions, validateWeaponSpecialRecord } from './weapon_special_cases.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { mingjiaoCombinationConditions, mingjiaoCombinationSourcePaths } from './school_mingjiao_combination_cases.mjs';
import { npcEntries } from './school_emei_npc_cases.mjs';
import { taohuaNpcEntries } from './school_taohua_npc_cases.mjs';
import { schoolTeamConditions, validateSchoolTeamRecord } from './school_team_cases.mjs';
import { schoolSceneConditions, sceneEntries, validateSchoolSceneRecord } from './school_scene_cases.mjs';
import { miaoStudyConditions, miaoStudySourcePaths } from './school_miao_study_cases.mjs';
import { npcBoutHeartbeatProbes, npcBoutChatProbes, npcBoutTerminalProbes,
    npcBoutCorpseProbes } from './npc_bout_probes.mjs';
import { taohuaDingTimerProbes } from './taohua_ding_probes.mjs';
import { taohuaDingSourcePaths } from './school_taohua_ding_cases.mjs';
import { taohuaXiaoSourcePaths } from './school_taohua_xiao_cases.mjs';
import { taohuaPoSourcePaths } from './school_taohua_po_cases.mjs';
import { taohuaZhuanSourcePaths } from './school_taohua_zhuan_cases.mjs';
import { taohuaDirectSourcePaths, taohuaDirectMoves } from './school_taohua_direct_cases.mjs';
import { taohuaControlSourcePaths } from './school_taohua_control_cases.mjs';
import { taohuaAttackSourcePaths, taohuaAttacks } from './school_taohua_attack_cases.mjs';
import { taohuaComboSourcePaths } from './school_taohua_combo_cases.mjs';
import { taohuaBihaiSourcePaths } from './school_taohua_bihai_cases.mjs';
import { taohuaPassiveSourcePaths } from './school_taohua_passive_cases.mjs';
import { taohuaCombinationSourcePaths, taohuaCombinationPairs, taohuaCombinationSkills } from './school_taohua_combination_cases.mjs';
import { skillMusicSourcePaths } from './skill_music_cases.mjs';
import { skillInheritedSourcePaths } from './skill_inherited_cases.mjs';
import { publicSpecialSourcePaths } from './public_special_cases.mjs';
import { mingjiaoCoreSourcePaths } from './school_mingjiao_core_cases.mjs';
import { mingjiaoQishangSourcePaths } from './school_mingjiao_qishang_cases.mjs';
import { mingjiaoXinfaSourcePaths, mingjiaoXinfaAbsentPaths } from './school_mingjiao_xinfa_cases.mjs';
import { mingjiaoMovementSourcePaths } from './school_mingjiao_movement_cases.mjs';
import { mingjiaoShengongSourcePaths, mingjiaoShengongAbsentPaths } from './school_mingjiao_shengong_cases.mjs';
import { mingjiaoShenghuoSourcePaths } from './school_mingjiao_shenghuo_cases.mjs';
import { mingjiaoLingLearningSourcePaths, mingjiaoLingLearningAbsentPaths } from './school_mingjiao_ling_learning_cases.mjs';
import { mingjiaoLingPerformSourcePaths, mingjiaoLingPerformAbsentPaths } from './school_mingjiao_ling_perform_cases.mjs';
import { mingjiaoApprenticeLearningSourcePaths, mingjiaoApprenticeLearningAbsentPaths } from './school_mingjiao_apprentice_learning_cases.mjs';
import { mingjiaoPublicForceSourcePaths, mingjiaoPublicForceAbsentPaths, mingjiaoPublicForceReviewedSourceHash,
    mingjiaoPublicForceEntryIds } from './school_mingjiao_public_force_cases.mjs';
import { mingjiaoTeachersSourcePaths, mingjiaoTeachersAbsentPaths, mingjiaoTeachersReviewedSourceHash,
    validateMingjiaoTeachersCondition } from './school_mingjiao_teachers_cases.mjs';
import { mingjiaoRecruitSourcePaths, validateMingjiaoRecruitCondition } from './school_mingjiao_recruit_cases.mjs';
import { mingjiaoGiftSourcePaths, validateMingjiaoGiftCondition } from './school_mingjiao_gift_cases.mjs';
import { mingjiaoBookSourcePaths, validateMingjiaoBookCondition } from './school_mingjiao_book_cases.mjs';
import { mingjiaoQkdSourcePaths, validateMingjiaoQkdCondition } from './school_mingjiao_qkd_cases.mjs';
import { mingjiaoJiuyangSourcePaths, validateMingjiaoJiuyangCondition } from './school_mingjiao_jiuyang_cases.mjs';
import { mingjiaoJiuyangLearningSourcePaths, validateMingjiaoJiuyangLearningCondition } from './school_mingjiao_jiuyang_learning_cases.mjs';
import { mingjiaoJiuyangDirectSourcePaths, mingjiaoJiuyangDirectAbsentPaths, validateMingjiaoJiuyangDirectCondition } from './school_mingjiao_jiuyang_direct_cases.mjs';
import { mingjiaoJiuyangRemainingSourcePaths, mingjiaoJiuyangRemainingAbsentPaths, validateMingjiaoJiuyangRemainingCondition } from './school_mingjiao_jiuyang_remaining_cases.mjs';
import { mingjiaoJiuyangExertSourcePaths, mingjiaoJiuyangExertAbsentPaths, validateMingjiaoJiuyangExertCondition } from './school_mingjiao_jiuyang_exert_cases.mjs';
import { mingjiaoJiuyangCapacitySourcePaths, validateMingjiaoJiuyangCapacityCondition } from './school_mingjiao_jiuyang_capacity_cases.mjs';
import { mingjiaoJiuyangResearchSourcePaths, validateMingjiaoJiuyangResearchCondition } from './school_mingjiao_jiuyang_research_cases.mjs';
import { mingjiaoJiuyangFusionSourcePaths, validateMingjiaoJiuyangFusionCondition } from './school_mingjiao_jiuyang_fusion_cases.mjs';
import { mingjiaoJiuyangFusionProbes, mingjiaoJiuyangFusionProbePath } from './school_mingjiao_jiuyang_fusion_probes.mjs';
import { mingjiaoRemainingPerformSourcePaths, mingjiaoRemainingPerformAbsentPaths,
    validateMingjiaoRemainingPerformCondition } from './school_mingjiao_remaining_perform_cases.mjs';
import { mingjiaoRemainingBaseSourcePaths,
    validateMingjiaoRemainingBaseCondition } from './school_mingjiao_remaining_base_cases.mjs';
import { mingjiaoForceRemainingSourcePaths, mingjiaoForceRemainingAbsentPaths,
    validateMingjiaoForceRemainingCondition } from './school_mingjiao_force_remaining_cases.mjs';
import { mingjiaoRouteConditions, mingjiaoRouteSourcePaths,
    validateMingjiaoRouteCondition } from './school_mingjiao_route_cases.mjs';

const git = (root, args) => execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024,
}).trim();
const put = (path, content) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); };
const save = (path, value) => put(path, JSON.stringify(value, null, 2) + '\n');

export function collectionInput(jobs, fault, execution = {}) {
    const connections = jobs.some(job => job.parameters?.extra_target) ? 3 : 2;
    const fusion = jobs.filter(job => job.parameters?.collection_group === 'mingjiao-jiuyang-fusion');
    if (fusion.length) {
        assert.equal(execution.fusion_watchdog_seconds, 30, '融合需要可信执行身份中的独立 watchdog');
        assert.equal(typeof execution.smoke, 'boolean');
        for (const job of fusion) assert.equal(job.parameters.run_mode, execution.smoke ? 'smoke' : 'formal',
            '融合任务模式与原执行身份不同');
    }
    // Formatting is not part of the request contract. Repeated source metadata in
    // a full formal window can exceed V8's string limit when pretty-printed.
    const text = JSON.stringify({ jobs, fault, ...(connections === 3 ? { connections } : {}),
        ...(fusion.length ? { fusion_watchdog_seconds: execution.fusion_watchdog_seconds } : {}) }) + '\n';
    const bytes = Buffer.byteLength(text, 'utf8');
    // read_file otherwise silently stops at the driver's default 256 KiB.
    // These capacities only belong to the temporary collection instance.
    // A full heartbeat/timer record can be much larger than its small request.
    // Reserve output string space independently; keep every original snapshot.
    const limits = {
        'maximum read file size': Math.max(262144, bytes + 1),
        'maximum string length': Math.max(64 * 1024 * 1024, bytes + 1),
        'maximum buffer size': Math.max(1048576, bytes + 1),
        // The LPC JSON decoder grows its temporary array by doubling.
        'maximum array size': Math.max(15000, 2 ** Math.ceil(Math.log2(Math.max(1, jobs.length)))),
    };
    for (const value of Object.values(limits)) assert.ok(Number.isSafeInteger(value)
        && value <= 2147483647, '采集输入超过驱动配置容量');
    return { text, bytes, limits, connections };
}

export function launchProbes(source, kind) {
    assert.ok(['perform', 'exert'].includes(kind), '未知技能调度入口');
    const clauses = kind === 'perform' ? [
        ['        if (SKILL_D(skill)->perform_action(me, arg)) {', 'skill'],
        ['        } else if (SKILL_D(martial)->perform_action(me, arg)) {', 'martial'],
    ] : [
        ['        if (SKILL_D(force)->exert_function(me, arg)) {', 'force'],
        ['        } else if (SKILL_D("force")->exert_function(me, arg)) {', '"force"'],
    ];
    let changed = source;
    const sites = [];
    for (const [anchor, skill] of clauses) {
        assert.equal(source.split(anchor).length, 2, '发动观察锚点不唯一：' + anchor);
        const insert = `\n            "/tests/runner"->observe_launch(me, ${skill}, arg);`;
        changed = changed.replace(anchor, anchor + insert);
        sites.push({ anchor, insert });
    }
    const anchor = kind === 'perform' ? '    result = do_perform(me, arg);'
        : '        }\n        return 0;\n    }';
    const insert = kind === 'perform'
        ? '\n    if (!result) "/tests/runner"->observe_refusal(me, query_notify_fail());'
        : '\n        "/tests/runner"->observe_refusal(me, query_notify_fail());';
    assert.equal(source.split(anchor).length, 2, '拒绝观察锚点不唯一');
    // For exert, insert before the unchanged return; for perform, after evaluation.
    const replacement = kind === 'perform' ? anchor + insert
        : anchor.replace('        return 0;', insert.slice(1) + '\n        return 0;');
    changed = changed.replace(anchor, replacement);
    sites.push({ anchor, replacement });
    let restored = changed;
    for (const site of [...sites].reverse()) restored = restored.replace(site.replacement ?? site.anchor + site.insert, site.anchor);
    assert.equal(restored, source, '观察探针不可改变原表达式/返回值');
    return { changed, sites };
}

// Observe the two original calls separately. Do not split one command into two commands.
export function huboPerformProbes(source) {
    const base = launchProbes(source, 'perform'), sites = [...base.sites];
    let changed = base.changed;
    for (const argument of ['arg', 'and']) {
        const anchor = `    result = do_perform(me, ${argument});`;
        assert.equal(source.split(anchor).length, 2, '互搏逐招观察锚点不唯一');
        const replacement = `    "/tests/runner"->observe_hubo_step(me, ${argument}, "before", 0, 0);\n`
            + anchor + `\n    "/tests/runner"->observe_hubo_step(me, ${argument}, "after", result, query_notify_fail());`;
        changed = changed.replace(anchor, replacement);
        sites.push({ anchor, replacement });
    }
    let restored = changed;
    for (const site of [...sites].reverse())
        restored = restored.replace(site.replacement ?? site.anchor + site.insert, site.anchor);
    assert.equal(restored, source, '互搏观察不得改变原调用、随机、返回和忙乱恢复');
    return { changed, sites };
}

// Record the original requested counter before mutation, and the final stored value.
// A zero request returns early; do_interface reads its actual state after the original call.
export function huboBusyProbes(source) {
    const sites = [
        { anchor: '    object me;\n\n    if (!new_busy) return;',
            replacement: '    object me;\n\n    "/tests/runner"->observe_hubo_busy(this_object(), new_busy, "before");\n    if (!new_busy) return;' },
        { anchor: '    interrupt = new_interrupt;\n    set_heart_beat(1);',
            replacement: '    interrupt = new_interrupt;\n    set_heart_beat(1);\n    "/tests/runner"->observe_hubo_busy(this_object(), new_busy, "after");' },
    ];
    let changed = source;
    for (const { anchor, replacement } of sites) {
        assert.equal(source.split(anchor).length, 2, '原忙乱观察锚点不唯一');
        changed = changed.replace(anchor, replacement);
    }
    for (const { anchor, replacement } of [...sites].reverse())
        assert.equal(changed.split(replacement).length, 2, '忙乱观察替换必须唯一');
    assert.equal(sites.reduceRight((text, site) => text.replace(site.replacement, site.anchor), changed), source,
        '忙乱观察不得替换原减免表达式、零值返回或心跳设置');
    return { changed, sites };
}

// Observe the original skill-object timer; do not replace call_out or its delay.
export function duguTimerProbes(source) {
    const sites = [
        { anchor: 'void poqi_end(object me, object target) {',
            insert: '\n    "/tests/runner"->observe_callback(target, "before");' },
        { anchor: '        target->delete_temp("no_exert");',
            insert: '\n        "/tests/runner"->observe_callback(target, "after");' },
    ];
    let changed = source;
    for (const { anchor, insert } of sites) {
        assert.equal(source.split(anchor).length, 2, '独孤计时观察锚点不唯一');
        changed = changed.replace(anchor, anchor + insert);
    }
    let restored = changed;
    for (const { anchor, insert } of [...sites].reverse()) restored = restored.replace(anchor + insert, anchor);
    assert.equal(restored, source, '计时观察不得改变原回调');
    return { changed, sites };
}

// Observe entry after declarations; keep original call_out(0), guards and RNG intact.
export function fireiceFollowupProbe(source) {
    const anchor = 'int perform2(object me, object target) {\n    string msg;\n    int damage;';
    const insert = '\n    "/tests/runner"->observe_fireice_followup(me, target);';
    assert.equal(source.split(anchor).length, 2, '冰火回调观察锚点不唯一');
    const changed = source.replace(anchor, anchor + insert);
    assert.equal(changed.replace(anchor + insert, anchor), source, '不得改变原冰火回调');
    return { changed, sites: [{ anchor, insert }] };
}

// Observe entry only: original weapon effects, poison and returns are untouched.
export function needleHitProbe(source) {
    const anchor = 'mixed hit_ob(object me, object victim, int damage_bonus) {\n    mixed foo;';
    const insert = '\n    "/tests/runner"->observe_needle_hit(this_object(), me, victim, damage_bonus);';
    assert.equal(source.split(anchor).length, 2, '针具命中观察锚点不唯一');
    const changed = source.replace(anchor, anchor + insert);
    assert.equal(changed.replace(anchor + insert, anchor), source, '不得改变原针具效果');
    return { changed, sites: [{ anchor, insert }] };
}

// Preserve the random call_out expression verbatim; inspect its registered remaining time.
export function needleRestoreProbes(source) {
    const sites = [
        { anchor: '            call_out("back", 2 + random(skill / 15), target);',
            insert: '\n            "/tests/runner"->observe_needle_restore(target, "scheduled", find_call_out("back"));' },
        { anchor: 'void back(object target) {',
            insert: '\n    "/tests/runner"->observe_needle_restore(target, "before", 0);' },
        { anchor: '        target->delete_temp("bingpo");',
            insert: '\n        "/tests/runner"->observe_needle_restore(target, "after", 0);' },
    ];
    let changed = source;
    for (const { anchor, insert } of sites) {
        assert.equal(changed.split(anchor).length, 2, '寒冰自然恢复观察锚点不唯一');
        changed = changed.replace(anchor, anchor + insert);
    }
    assert.equal(sites.reduce((text, { anchor, insert }) => text.replace(anchor + insert, anchor), changed), source);
    return { changed, sites };
}

// Observe each original return once, without re-evaluating the random defense.
export function combatDefenseProbes(source) {
    const base = applyProbes(source), sites = [...base.sites];
    let changed = base.changed;
    for (const [anchor, call] of [
        ['            foo = SKILL_D(parry_skill)->valid_damage(me, victim, damage, weapon);',
            'me, victim, parry_skill, damage, foo, "ordinary"'],
        ['            foo = SKILL_D(skill)->valid_damage(me, target, damage, weapon);',
            'me, target, skill, damage, foo, "direct"'],
    ]) {
        assert.equal(source.split(anchor).length, 2, '防御观察锚点不唯一');
        const insert = `\n            "/tests/runner"->observe_defense(${call});`;
        changed = changed.replace(anchor, anchor + insert);
        sites.push({ anchor, insert, position: 'after' });
    }
    let restored = changed;
    for (const site of sites.slice(base.sites.length).reverse())
        restored = restored.replace(site.anchor + site.insert, site.anchor);
    assert.equal(restored, base.changed, '防御观察不得改变原调用、返回或分支');
    return { changed, sites };
}

export function combatPassiveProbes(source) {
    const base = combatDefenseProbes(source), sites = [...base.sites];
    let changed = base.changed;
    for (const [anchor, call] of [
        ['                    foo = SKILL_D(force_skill)->hit_ob(me, victim, damage_bonus, my["jiali"]);',
            'me, victim, force_skill, damage_bonus, my["jiali"], foo, "force"'],
        ['                    foo = SKILL_D(martial_skill)->hit_ob(me, victim, damage);',
            'me, victim, martial_skill, damage, 0, foo, "martial"'],
    ]) {
        assert.equal(source.split(anchor).length, 2, '附加伤害观察锚点不唯一');
        const insert = `\n                    "/tests/runner"->observe_passive(${call});`;
        changed = changed.replace(anchor, anchor + insert);
        sites.push({ anchor, insert, position: 'after' });
    }
    let restored = changed;
    for (const site of sites.slice(base.sites.length).reverse()) restored = restored.replace(site.anchor + site.insert, site.anchor);
    assert.equal(restored, base.changed, '附加伤害观察不得改变原参数、返回及扣费');
    return { changed, sites };
}

// Read already-computed AP/DP. No extra skill call, random draw or formula replacement.
export function combatDodgeProbes(source) {
    const base = combatPassiveProbes(source), sites = [...base.sites];
    let changed = base.changed;
    for (const [anchor, phase] of [
        ['    dp = skill_power(victim, "dodge", SKILL_USAGE_DEFENSE, 0);', 'base'],
        ['    if (victim->is_busy())\n        dp /= 3;', 'settled'],
    ]) {
        assert.equal(source.split(anchor).length, 2, '闪避观察锚点不唯一');
        const insert = `\n    "/tests/runner"->observe_dodge(me, victim, attack_type, ap, dp, "${phase}");`;
        changed = changed.replace(anchor, anchor + insert);
        sites.push({ anchor, insert, position: 'after' });
    }
    let restored = changed;
    for (const site of sites.slice(base.sites.length).reverse()) restored = restored.replace(site.anchor + site.insert, site.anchor);
    assert.equal(restored, base.changed, '闪避观察不得改变原公式、分支与随机数');
    return { changed, sites };
}

// Observe original Taiji entry, temporary bonuses and cleanup in the copy only.
export function combatSceneProbes(source) {
    const base = combatDodgeProbes(source), sites = [...base.sites];
    let changed = base.changed;
    for (const [anchor, phase, skill] of [
        ['    if (environment(me)->query("no_fight")) {', 'enter', '""'],
        ['    // (1) Find out what action the offenser will take.', 'selected', 'attack_skill'],
    ]) {
        assert.equal(source.split(anchor).length, 2, '场景攻击观察锚点不唯一');
        const insert = `    "/tests/runner"->observe_scene_attack(me, victim, weapon, ${skill}, "${phase}", previous_object());\n`;
        changed = changed.replace(anchor, insert + anchor);
        sites.push({ anchor, insert, position: 'before' });
    }
    let restored = changed;
    for (const { anchor, insert } of sites.slice(base.sites.length).reverse())
        restored = restored.replace(insert + anchor, anchor);
    assert.equal(restored, base.changed, '场景观察不得改变攻击参数、选择和分支');
    return { changed, sites };
}

export function taijiPassiveProbes(source) {
    const sites = [
        { anchor: '    time = me->query_temp("combat_time");', phase: 'enter' },
        { anchor: '        me->add_temp("apply/unarmed_damage", time * 3);', phase: 'boosted' },
        { anchor: '        me->delete_temp("action_flag");', phase: 'restored' },
    ].map(({ anchor, phase }) => ({ anchor,
        insert: `\n    "/tests/runner"->observe_taiji(me, victim, "${phase}");` }));
    let changed = source;
    for (const { anchor, insert } of sites) {
        assert.equal(source.split(anchor).length, 2, '太极蓄力观察锚点不唯一');
        changed = changed.replace(anchor, anchor + insert);
    }
    let restored = changed;
    for (const { anchor, insert } of [...sites].reverse()) restored = restored.replace(anchor + insert, anchor);
    assert.equal(restored, source, '蓄力观察不得改变原计数、随机、攻击或恢复');
    return { changed, sites };
}

// Bracket the original daemon call only. The host heartbeat still schedules,
// clears conditions and heals; observation never calls update_condition itself.
export function conditionTickProbes(source) {
    const anchor = '        flag = call_other(cnd_d, "update_condition", this_object(), conditions[cnd[i]]);';
    assert.equal(source.split(anchor).length, 2, '异常更新观察锚点不唯一');
    const replacement = '        "/tests/runner"->observe_condition_tick(this_object(), cnd[i], cnd_d, "before", 0);\n'
        + anchor + '\n        "/tests/runner"->observe_condition_tick(this_object(), cnd[i], cnd_d, "after", flag);';
    const changed = source.replace(anchor, replacement);
    assert.equal(changed.replace(replacement, anchor), source, '异常观察不得修改原调度、随机、返回及清除');
    return { changed, sites: [{ anchor, replacement }] };
}

// Keep prior probes intact; this extra site observes the already-returned dodge
// value, and the runner records it only for the snake-defense collection.
export function combatExtraDodgeProbes(source) {
    const base = combatSceneProbes(source);
    const anchor = '                    foo = SKILL_D(dodge_skill)->valid_damage(me, victim, damage, weapon);';
    const insert = '\n                    "/tests/runner"->observe_defense(me, victim, dodge_skill, damage, foo, "ordinary-dodge");';
    assert.equal(source.split(anchor).length, 2, '轻功化解观察锚点不唯一');
    const changed = base.changed.replace(anchor, anchor + insert);
    assert.equal(changed.replace(anchor + insert, anchor), base.changed);
    return { changed, sites: [...base.sites, { anchor, insert, position: 'after' }] };
}

// Observe the original selected action and bracket hit_ob without another skill call.
export function combatActionProbes(source) {
    const base = combatExtraDodgeProbes(source), sites = [...base.sites];
    const direct = '    "/tests/runner"->observe_direct(me, target);\n';
    const directArgs = '    "/tests/runner"->observe_direct(me, target, type, damage, percent);\n';
    const directIndex = sites.findIndex(site => Array.isArray(site) && site[1] === direct);
    assert.ok(directIndex >= 0, '复用唯一原 do_damage 观察点');
    assert.equal(base.changed.split(direct).length, 2, '原 do_damage 观察点不唯一');
    sites[directIndex] = [sites[directIndex][0], directArgs];
    let changed = base.changed.replace(direct, directArgs);
    for (const [anchor, insert] of [
        ['    if (me->query_temp("action_flag") == 0)',
            '    "/tests/runner"->observe_selected_action(me, victim, attack_skill, action);\n'],
        ['                    foo = SKILL_D(force_skill)->hit_ob(me, victim, damage_bonus, my["jiali"]);',
            '                    "/tests/runner"->begin_passive(me, victim, "force");\n'],
        ['                    foo = SKILL_D(martial_skill)->hit_ob(me, victim, damage);',
            '                    "/tests/runner"->begin_passive(me, victim, "martial");\n'],
    ]) {
        assert.equal(source.split(anchor).length, 2, '原选招／附伤前观察锚点不唯一');
        changed = changed.replace(anchor, insert + anchor);
        sites.push({ anchor, insert, position: 'before' });
    }
    let restored = changed;
    for (const { anchor, insert } of sites.slice(base.sites.length).reverse())
        restored = restored.replace(insert + anchor, anchor);
    restored = restored.replace(directArgs, direct);
    assert.equal(restored, base.changed, '不得重选招式、改参数或改变原回调顺序');
    return { changed, sites };
}

// Insert observations inside the three original branches, never redraw RNG or
// replace affect_by's expression. Only the temporary copy receives these sites.
export function tanResultProbes(source) {
    assert.equal(sha256(source), observedEffectSources['exert:hamagong/tan'].sha256,
        'tan source changed; review branch probes');
    const sites = [
        ['        target->query("neili")) {', 'blocked'],
        ['        if (ap / 2 + random(ap) < target->query_skill("dodge") * 3 / 2) {', 'dodged'],
        ['            target->affect_by(du->query("poison_type"), du->query("poison"));', 'hit'],
    ].map(([anchor, branch]) => ({ anchor,
        insert: `\n            "/tests/runner"->observe_tan_result(me, target, du, "${branch}");` }));
    let changed = source;
    for (const { anchor, insert } of sites) {
        assert.equal(source.split(anchor).length, 2, 'tan branch anchor must be unique');
        changed = changed.replace(anchor, anchor + insert);
    }
    assert.equal(sites.reduceRight((s, site) => s.replace(site.anchor + site.insert, site.anchor), changed), source);
    return { changed, sites };
}

export function createSandbox(root, output, { observeTan = false } = {}) {
    const sandbox = output ? join(output, 'mudlib') : null, files = {}, probes = [];
    const putCopy = (path, content) => { if (sandbox) put(join(sandbox, path), content); };
    const excluded = /^(?:u|backup|bin|binaries|data|doc|docs|dump|fluffos|grant|help|log|ai|openspec|temp|version|www|tools)\//;
    const paths = new Set([...git(root, ['ls-files', '-z']).split('\0'),
        ...git(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
        ...git(join(root, 'mudcore'), ['ls-files', '-z']).split('\0').map(path => 'mudcore/' + path)]);
    for (const path of [...paths].sort()) {
        if (!/\.(c|lpc|h)$/.test(path) || excluded.test(path) || !existsSync(join(root, path))
            || path.split('/').some(part => part === 'tests' || part.startsWith('.'))) continue;
        const actual = realpathSync(join(root, path));
        assert.ok(isInside(root, actual) && !excluded.test(relative(root, actual).replaceAll('\\', '/')),
            '公开源码链接越界：' + path);
        const bytes = readFileSync(actual);
        files[path] = sha256(bytes); putCopy(path, bytes);
    }
    const copy = (from, to) => {
        const bytes = readFileSync(join(root, from)); files[from] = sha256(bytes); putCopy(to, bytes);
    };
    copy('data/e2c_dict.o', 'data/e2c_dict.o');
    // Original USER heartbeats read this public notice before periodic saving.
    copy('help/notice', 'help/notice');
    // Public, versioned weather text required by original outdoor room look/move.
    copy('adm/etc/nature/day_phase', 'adm/etc/nature/day_phase');
    // Natural midnight callbacks select one of these public, versioned tables.
    // Do not freeze the clock or copy private data to keep a long test running.
    for (const season of ['spring', 'summer', 'autumn', 'winter'])
        for (const weather of ['rain', 'sun', 'wind']) {
            const path = `adm/etc/nature/${season}_${weather}`;
            copy(path, path);
        }
    copy('tools/tests/weapon_balance/actor.lpc', 'tests/base_actor.lpc');
    copy('tools/tests/weapon_balance/master.lpc', 'tests/base_master.lpc');
    for (const name of ['master', 'runner', 'throwing', 'actor', 'cloth', 'teaching_actor', 'teaching_observer', 'formation_observer', 'challenge_observer', 'scene_observer', 'route_observer', 'team_observer', 'team_room', 'bystander_room', 'npc_observer']) copy(`tools/tests/martial_data/${name}.lpc`, `tests/${name}.lpc`);
    copy('tools/tests/martial_data/npc_bout_receivers.h', 'tests/npc_bout_receivers.h');
    copy('tools/tests/martial_data/taohua_ding_receivers.h', 'tests/taohua_ding_receivers.h');
    copy('tools/tests/martial_data/taohua_xiao_receivers.h', 'tests/taohua_xiao_receivers.h');
    copy('tools/tests/martial_data/taohua_po_receivers.h', 'tests/taohua_po_receivers.h');
    copy('tools/tests/martial_data/taohua_zhuan_receivers.h', 'tests/taohua_zhuan_receivers.h');
    copy('tools/tests/martial_data/jiuyang_fusion_receivers.h', 'tests/jiuyang_fusion_receivers.h');
    const template = readFileSync(join(root, 'tools/tests/weapon_balance/weapon.lpc'), 'utf8');
    files['tools/tests/weapon_balance/weapon.lpc'] = sha256(template);
    for (const type of profiles.map(p => p.type).filter(type => type !== 'throwing')) {
        putCopy(`tests/${type}.lpc`, template.replaceAll('AXE', type.toUpperCase()).replaceAll('init_axe', 'init_' + type));
    }
    const craftedPath = 'tools/tests/martial_data/crafted_weapon.lpc';
    // Special item fixtures for pending G3/5.3 entries
    copy('tools/tests/martial_data/jinshe_zhui_weapon.lpc', 'tests/jinshe_zhui_weapon.lpc');
    copy('tools/tests/martial_data/xuanyuan_arrow_weapon.lpc', 'tests/xuanyuan_arrow_weapon.lpc');
    copy('tools/tests/martial_data/poison_item.lpc', 'tests/poison_item.lpc');
    const crafted = readFileSync(join(root, craftedPath), 'utf8');
    files[craftedPath] = sha256(crafted);
    for (const type of ['sword', 'hammer'])
        putCopy(`tests/crafted_${type}.lpc`, crafted.replaceAll('AXE', type.toUpperCase()).replaceAll('init_axe', 'init_' + type));
    for (const path of ['tools/collect_martial_data.mjs', 'tools/bench_weapon_balance.mjs',
        ...['execution', 'continuation', 'inventory', 'catalog', 'ledger', 'weapon_cases', 'ability_cases', 'learning_cases', 'skill_music_cases', 'school_slice1_cases', 'school_slice1_cases.test', 'school_slice1_preparation.test', 'school_slice2_cases', 'school_slice2_cases.test', 'school_slice2_preparation.test', 'school_slice3_cases', 'school_slice3_cases.test', 'school_slice4_cases', 'school_slice4_cases.test', 'school_slice5_cases', 'school_slice5_cases.test', 'school_slice6_cases', 'school_slice6_cases.test', 'school_slice7_cases', 'school_slice7_cases.test', 'school_slice8_cases', 'school_slice8_cases.test', 'b1_perform_cases', 'b1_perform_cases.test', 'b2_perform_cases', 'b2_perform_cases.test', 'b3_perform_cases', 'b3_perform_cases.test', 'b4_perform_cases', 'b4_perform_cases.test', 'b5_perform_cases', 'b5_perform_cases.test', 'b6_perform_cases', 'b6_perform_cases.test', 'b7_perform_cases', 'b7_perform_cases.test', 'b8_perform_cases', 'b8_perform_cases.test', 'b9_perform_cases', 'b9_perform_cases.test', 'b10_perform_cases', 'b10_perform_cases.test', 'b11_perform_cases', 'b11_perform_cases.test', 'b12_perform_cases', 'b12_perform_cases.test', 'b13_perform_cases', 'b13_perform_cases.test', 'b14_perform_cases', 'b14_perform_cases.test', 'b15_perform_cases', 'b15_perform_cases.test', 'b16_perform_cases', 'b16_perform_cases.test', 'b17_perform_cases', 'b17_perform_cases.test', 'b18_perform_cases', 'b18_perform_cases.test', 'b19_perform_cases', 'b19_perform_cases.test', 'b20_perform_cases', 'b20_perform_cases.test', 'b21_perform_cases', 'b21_perform_cases.test', 'b22_perform_cases', 'b22_perform_cases.test', 'b23_perform_cases', 'b23_perform_cases.test', 'b24_perform_cases', 'b24_perform_cases.test', 'b25_perform_cases', 'b25_perform_cases.test', 'b26_perform_cases', 'b26_perform_cases.test', 'b27_perform_cases', 'b27_perform_cases.test', 'b28_perform_cases', 'b28_perform_cases.test', 'b29_perform_cases', 'b29_perform_cases.test', 'bout_cases', 'weapon_special_cases',
            'school_relations', 'school_dependencies', 'teaching_cases', 'teaching_report', 'statistics', 'skill_inherited_cases', 'public_special_cases', 'hong_learning_cases', 'chen_learning_cases', 'quanzhen_learning_cases', 'wudang_learning_cases', 'shaolin_learning_cases', 'shaolin_teachers_cases', 'shaolin_recruit_cases', 'recruit_observation', 'shaolin_promotion_cases', 'promotion_observation',
            'shaolin_tonsure_cases', 'tonsure_observation', 'emei_teachers_cases', 'emei_recruit_cases', 'emei_special_cases', 'emei_tonsure_cases', 'gumu_teachers_cases',
            'shaolin_formation_cases', 'formation_observation',
            'shaolin_challenge_cases', 'shaolin_challenge_failure_cases', 'challenge_observation', 'school_scene_cases',
            'meizhuang_intro_cases', 'shang_letter_cases', 'feng_teaching_cases', 'teaching_observation', 'school_combat_cases', 'school_combat_report', 'school_team_cases',
            'school_huashan_advanced_cases', 'school_huashan_learning_cases', 'school_huashan_defense_cases',
            'school_huashan_upgrade_cases', 'school_quanzhen_sword_cases', 'school_quanzhen_basic_cases', 'school_quanzhen_advanced_cases', 'school_quanzhen_defense_cases', 'school_quanzhen_practice_cases', 'school_quanzhen_cultivation_cases', 'school_quanzhen_auxiliary_cases', 'school_quanzhen_study_cases', 'school_quanzhen_recovery_cases']
            .map(name => `tools/tests/martial_data/${name}.mjs`), 'tools/tests/martial_data/school_wudang_sword_cases.mjs',
            'tools/tests/martial_data/school_wudang_core_cases.mjs',
            'tools/tests/martial_data/school_wudang_defense_cases.mjs',
            'tools/tests/martial_data/school_wudang_passive_cases.mjs',
            'tools/tests/martial_data/school_wudang_special_cases.mjs',
            'tools/tests/martial_data/school_wudang_weapons_cases.mjs',
            'tools/tests/martial_data/school_wudang_shenmen_cases.mjs',
            'tools/tests/martial_data/school_wudang_unarmed_cases.mjs',
            'tools/tests/martial_data/school_wudang_learning_cases.mjs',
            'tools/tests/martial_data/school_wudang_cultivation_cases.mjs',
            'tools/tests/martial_data/school_wudang_study_cases.mjs',
            'tools/tests/martial_data/school_wudang_recovery_cases.mjs',
            'tools/tests/martial_data/school_wudang_combination_cases.mjs',
            'tools/tests/martial_data/school_wudang_bout_cases.mjs',
            'tools/tests/martial_data/school_wudang_public_force_cases.mjs',
            'tools/tests/martial_data/school_wudang_healing_cases.mjs',
            'tools/tests/martial_data/school_wudang_dispel_cases.mjs',
            'tools/tests/martial_data/school_wudang_buffs_cases.mjs',
            'tools/tests/martial_data/school_wudang_lookup_cases.mjs',
            'tools/tests/martial_data/school_wudang_condition_cases.mjs',
            'tools/tests/martial_data/school_shaolin_sword_cases.mjs',
            'tools/tests/martial_data/school_shaolin_weapons_cases.mjs',
            'tools/tests/martial_data/school_shaolin_additional_cases.mjs',
            'tools/tests/martial_data/school_shaolin_fists_cases.mjs',
            'tools/tests/martial_data/school_shaolin_palms_cases.mjs',
            'tools/tests/martial_data/school_shaolin_fingers_cases.mjs',
            'tools/tests/martial_data/school_shaolin_hands_cases.mjs',
            'tools/tests/martial_data/school_shaolin_learning_cases.mjs',
            'tools/tests/martial_data/school_shaolin_unarmed_learning_cases.mjs',
            'tools/tests/martial_data/school_shaolin_cultivation_cases.mjs',
            'tools/tests/martial_data/school_shaolin_exert_cases.mjs',
            'tools/tests/martial_data/school_shaolin_recovery_cases.mjs',
            'tools/tests/martial_data/school_shaolin_backlash_cases.mjs',
            'tools/tests/martial_data/school_shaolin_public_force_cases.mjs',
            'tools/tests/martial_data/school_shaolin_support_cases.mjs',
            'tools/tests/martial_data/school_emei_support_cases.mjs',
            'tools/tests/martial_data/school_emei_jiuyin_cases.mjs',
            'tools/tests/martial_data/school_emei_jiuyin_buff_cases.mjs',
            'tools/tests/martial_data/school_shaolin_combination_cases.mjs',
            'tools/tests/martial_data/school_shaolin_defense_cases.mjs',
            'tools/tests/martial_data/school_shaolin_bout_cases.mjs',
            'tools/tests/martial_data/school_emei_weapons_cases.mjs',
            'tools/tests/martial_data/school_emei_unarmed_cases.mjs',
            'tools/tests/martial_data/school_emei_cultivation_cases.mjs',
            'tools/tests/martial_data/school_emei_yijin_cases.mjs',
            'tools/tests/martial_data/school_emei_shexing_cases.mjs',
            'tools/tests/martial_data/school_emei_jiuyin_learning_cases.mjs',
            'tools/tests/martial_data/school_emei_jiuyin_passive_cases.mjs',
            'tools/tests/martial_data/school_emei_npc_cases.mjs',
            'tools/tests/martial_data/school_emei_bout_cases.mjs',
            'tools/tests/martial_data/school_gumu_control_cases.mjs',
            'tools/tests/martial_data/school_gumu_direct_cases.mjs',
            'tools/tests/martial_data/school_gumu_advanced_cases.mjs',
            'tools/tests/martial_data/school_gumu_unarmed_cases.mjs',
            'tools/tests/martial_data/school_gumu_combo_cases.mjs',
            'tools/tests/martial_data/school_gumu_fireice_cases.mjs',
            'tools/tests/martial_data/school_gumu_poison_cases.mjs',
            'tools/tests/martial_data/school_gumu_weapons_cases.mjs',
            'tools/tests/martial_data/school_gumu_unarmed_attack_cases.mjs',
            'tools/tests/martial_data/school_gumu_throwing_cases.mjs',
            'tools/tests/martial_data/school_gumu_needle_lifecycle_cases.mjs',
            'tools/tests/martial_data/school_gumu_combination_cases.mjs',
            'tools/tests/martial_data/school_gumu_defense_cases.mjs',
            'tools/tests/martial_data/school_gumu_hubo_cases.mjs',
            'tools/tests/martial_data/school_gumu_cultivation_cases.mjs',
            'tools/tests/martial_data/school_gumu_movement_cases.mjs',
            'tools/tests/martial_data/school_gumu_recovery_cases.mjs',
            'tools/tests/martial_data/school_gumu_exert_cases.mjs',
            'tools/tests/martial_data/school_gumu_public_force_cases.mjs',
            'tools/tests/martial_data/school_gumu_support_cases.mjs',
            'tools/tests/martial_data/school_gumu_weapon_learning_cases.mjs',
            'tools/tests/martial_data/school_gumu_unarmed_learning_cases.mjs',
            'tools/tests/martial_data/school_gumu_zhi_cases.mjs',
            'tools/tests/martial_data/school_gumu_zhi.test.mjs',
            'tools/tests/martial_data/school_gumu_quanzhen_cases.mjs',
            'tools/tests/martial_data/school_gumu_quanzhen.test.mjs',
            'tools/tests/martial_data/school_gumu_research_cases.mjs',
            'tools/tests/martial_data/school_gumu_research.test.mjs',
            'tools/tests/martial_data/gumu_special_teaching_cases.mjs',
            'tools/tests/martial_data/gumu_special_teaching.test.mjs',
            'tools/tests/martial_data/gumu_acquisition_learning_cases.mjs',
            'tools/tests/martial_data/gumu_acquisition_learning.test.mjs',
            'tools/tests/martial_data/gumu_item_acquisition_cases.mjs',
            'tools/tests/martial_data/gumu_item_acquisition.test.mjs',
            'tools/tests/martial_data/gumu_recruit_cases.mjs',
            'tools/tests/martial_data/gumu_recruit.test.mjs',
            'tools/tests/martial_data/school_gumu_force_inputs_cases.mjs',
            'tools/tests/martial_data/school_gumu_force_inputs.test.mjs',
            'tools/tests/martial_data/school_gumu_npc_cases.mjs',
            'tools/tests/martial_data/school_gumu_npc.test.mjs',
            'tools/tests/martial_data/school_gumu_temporal_cases.mjs',
            'tools/tests/martial_data/school_gumu_temporal.test.mjs',
            'tools/tests/martial_data/school_gumu_bout_cases.mjs',
            'tools/tests/martial_data/school_gumu_bout.test.mjs',
            'tools/tests/weapon_balance/statistics.mjs',
            'tools/tests/martial_data/school_public_force_report.mjs',
            'tools/tests/martial_data/school_emei_exert_cases.mjs',
            'tools/tests/martial_data/school_emei_learning_cases.mjs',
            'tools/tests/martial_data/school_emei_defense_cases.mjs',
            'tools/tests/martial_data/school_emei_combination_cases.mjs',
            'tools/tests/martial_data/school_quanzhen_combination_cases.mjs',
            'tools/tests/martial_data/school_huashan_combination_cases.mjs',
            'tools/tests/martial_data/school_taohua_bout.test.mjs',
            'tools/tests/martial_data/school_taohua_bout_cases.mjs',
            'tools/tests/martial_data/school_mingjiao_bout.test.mjs',
            'tools/tests/martial_data/school_mingjiao_bout_cases.mjs',
            'tools/tests/martial_data/school_huashan_bout.test.mjs',
            'tools/tests/martial_data/school_huashan_bout_cases.mjs',
            'tools/tests/martial_data/school_quanzhen_bout.test.mjs',
            'tools/tests/martial_data/school_quanzhen_bout_cases.mjs',
            'tools/tests/martial_data/school_slice_combination_cases.mjs',
            'tools/tests/martial_data/school_slice_combination.test.mjs',
            'tools/tests/martial_data/school_composite_synthesis_cases.mjs',
            'tools/tests/martial_data/school_composite_synthesis.test.mjs',
            'tools/tests/martial_data/school_composite_synthesis_validation.test.mjs',
            'tools/tests/martial_data/school_npc_grant_cases.mjs',
            'tools/tests/martial_data/school_public_exert_cases.mjs',
            'tools/tests/martial_data/observed_effects.mjs',
            'tools/tests/martial_data/observed_effect_sources.mjs',
            'tools/tests/martial_data/observed_effects_test_fixture.mjs',
            'tools/tests/martial_data/school_npc_grant_cases.test.mjs',
            'tools/tests/martial_data/school_public_exert_cases.test.mjs',
            'tools/tests/martial_data/school_bout_perform_cases.mjs',
            'tools/tests/martial_data/school_bout_perform.test.mjs',
            'tools/tests/martial_data/school_emei_public_force_cases.mjs',
            'tools/tests/martial_data/school_emei_recovery_cases.mjs']) {
        files[path] = sha256(readFileSync(join(root, path)));
    }
    for (const name of ['school_gumu_npc_bout_cases.mjs', 'school_gumu_npc_bout.test.mjs',
        'npc_bout_probes.mjs', 'npc_bout_probes.test.mjs', 'npc_observer_phase.test.mjs',
        'school_gumu_npc_bout_report.mjs', 'school_gumu_npc_bout_report.test.mjs',
        'npc_bout_integration.test.mjs', 'school_taohua_ding_cases.mjs', 'school_taohua_ding.test.mjs',
        'taohua_ding_probes.mjs', 'taohua_ding_probes.test.mjs', 'taohua_ding_receivers.test.mjs',
        'taohua_ding_integration.test.mjs', 'school_taohua_ding_report.mjs', 'school_taohua_ding_report.test.mjs',
        'school_taohua_xiao_cases.mjs', 'school_taohua_xiao.test.mjs',
        'taohua_xiao_integration.test.mjs', 'school_taohua_xiao_report.mjs', 'school_taohua_xiao_report.test.mjs',
        'school_taohua_po_cases.mjs', 'school_taohua_po.test.mjs',
        'taohua_po_integration.test.mjs', 'taohua_po_report_integration.test.mjs',
        'school_taohua_zhuan_cases.mjs', 'school_taohua_zhuan.test.mjs',
        'school_taohua_zhuan_report.test.mjs', 'taohua_zhuan_integration.test.mjs',
        'school_taohua_direct_cases.mjs', 'school_taohua_direct.test.mjs',
        'school_taohua_direct_report.test.mjs', 'taohua_direct_integration.test.mjs',
        'school_taohua_control_cases.mjs', 'school_taohua_control.test.mjs',
        'school_taohua_control_report.test.mjs', 'taohua_control_integration.test.mjs',
        'school_taohua_attack_cases.mjs', 'school_taohua_attack.test.mjs',
        'school_taohua_attack_report.test.mjs', 'taohua_attack_integration.test.mjs',
        'school_taohua_combo_cases.mjs', 'school_taohua_combo.test.mjs',
        'school_taohua_combo_report.test.mjs', 'taohua_combo_integration.test.mjs',
        'school_taohua_bihai_cases.mjs', 'school_taohua_bihai.test.mjs',
        'school_taohua_bihai_report.test.mjs', 'school_taohua_bihai_integration.test.mjs',
        'school_taohua_passive_cases.mjs', 'school_taohua_passive.test.mjs',
        'school_taohua_passive_report.test.mjs', 'school_taohua_passive_integration.test.mjs',
        'school_taohua_combination_cases.mjs', 'school_taohua_combination.test.mjs',
        'school_taohua_combination_report.test.mjs', 'school_taohua_combination_integration.test.mjs',
        'school_taohua_force_cases.mjs', 'school_taohua_force.test.mjs',
        'school_taohua_force_report.test.mjs',
        'school_taohua_learning_cases.mjs', 'school_taohua_learning.test.mjs',
        'school_taohua_music_cases.mjs', 'school_taohua_music.test.mjs',
        'school_taohua_npc_cases.mjs', 'school_taohua_npc.test.mjs',
        'skill_music_cases.test.mjs', 'skill_inherited_cases.test.mjs',
        'school_mingjiao_core_cases.mjs', 'school_mingjiao_core_cases.test.mjs',
        'school_mingjiao_core_integration.test.mjs',
        'school_mingjiao_qishang_cases.mjs', 'school_mingjiao_qishang_cases.test.mjs',
        'school_mingjiao_qishang_integration.test.mjs',
        'school_mingjiao_xinfa_cases.mjs', 'school_mingjiao_xinfa_cases.test.mjs',
        'school_mingjiao_xinfa_integration.test.mjs',
        'school_mingjiao_movement_cases.mjs', 'school_mingjiao_movement_cases.test.mjs',
        'school_mingjiao_movement_integration.test.mjs',
        'school_mingjiao_shengong_cases.mjs', 'school_mingjiao_shengong_cases.test.mjs',
        'school_mingjiao_shengong_integration.test.mjs',
        'school_mingjiao_shenghuo_cases.mjs', 'school_mingjiao_shenghuo_cases.test.mjs',
        'school_mingjiao_shenghuo_integration.test.mjs',
        'school_mingjiao_ling_learning_cases.mjs', 'school_mingjiao_ling_learning_cases.test.mjs',
        'school_mingjiao_ling_learning_integration.test.mjs',
        'school_mingjiao_ling_perform_cases.mjs', 'school_mingjiao_ling_perform_cases.test.mjs',
        'school_mingjiao_ling_perform_integration.test.mjs',
        'school_mingjiao_apprentice_learning_cases.mjs', 'school_mingjiao_apprentice_learning.test.mjs',
        'school_mingjiao_apprentice_learning_integration.test.mjs',
        'school_mingjiao_public_force_cases.mjs', 'school_mingjiao_public_force_cases.test.mjs',
        'school_mingjiao_public_force_integration.test.mjs',
        'school_mingjiao_teachers_cases.mjs', 'school_mingjiao_teachers_cases.test.mjs',
        'school_mingjiao_teachers_integration.test.mjs',
        'school_mingjiao_recruit_cases.mjs', 'school_mingjiao_recruit_cases.test.mjs',
        'school_mingjiao_recruit_integration.test.mjs', 'school_mingjiao_recruit_report.test.mjs',
        'school_mingjiao_gift_cases.mjs', 'school_mingjiao_gift_cases.test.mjs',
        'school_mingjiao_gift_integration.test.mjs', 'school_mingjiao_gift_report.test.mjs',
        'school_mingjiao_book_cases.mjs', 'school_mingjiao_book_cases.test.mjs',
        'school_mingjiao_book_integration.test.mjs', 'school_mingjiao_book_report.test.mjs',
        'school_mingjiao_route_cases.mjs', 'school_mingjiao_route_cases.test.mjs',
        'school_mingjiao_route_integration.test.mjs', 'school_mingjiao_route_report.mjs',
        'school_mingjiao_route_report.test.mjs',
        'school_mingjiao_qkd_cases.mjs', 'school_mingjiao_qkd_cases.test.mjs',
        'school_mingjiao_qkd_integration.test.mjs', 'school_mingjiao_qkd_report.mjs',
        'school_mingjiao_qkd_report.test.mjs',
        'school_mingjiao_jiuyang_cases.mjs', 'school_mingjiao_jiuyang_cases.test.mjs',
        'school_mingjiao_jiuyang_integration.test.mjs', 'school_mingjiao_jiuyang_report.mjs',
        'school_mingjiao_jiuyang_report.test.mjs',
        'school_mingjiao_jiuyang_learning_cases.mjs', 'school_mingjiao_jiuyang_learning_cases.test.mjs',
        'school_mingjiao_jiuyang_learning_integration.test.mjs', 'school_mingjiao_jiuyang_learning_report.mjs',
        'school_mingjiao_jiuyang_learning_report.test.mjs',
        'school_mingjiao_jiuyang_direct_cases.mjs', 'school_mingjiao_jiuyang_direct_cases.test.mjs',
        'school_mingjiao_jiuyang_direct_integration.test.mjs', 'school_mingjiao_jiuyang_direct_report.mjs',
        'school_mingjiao_jiuyang_direct_report.test.mjs',
        'school_mingjiao_jiuyang_remaining_cases.mjs', 'school_mingjiao_jiuyang_remaining_cases.test.mjs',
        'school_mingjiao_jiuyang_remaining_integration.test.mjs', 'school_mingjiao_jiuyang_remaining_report.mjs',
        'school_mingjiao_jiuyang_remaining_report.test.mjs',
        'school_mingjiao_jiuyang_exert_cases.mjs', 'school_mingjiao_jiuyang_exert_cases.test.mjs',
        'school_mingjiao_jiuyang_exert_integration.test.mjs', 'school_mingjiao_jiuyang_exert_report.mjs',
        'school_mingjiao_jiuyang_exert_report.test.mjs',
        'school_mingjiao_jiuyang_capacity_cases.mjs', 'school_mingjiao_jiuyang_capacity_cases.test.mjs',
        'school_mingjiao_jiuyang_capacity_observation.mjs', 'school_mingjiao_jiuyang_capacity_observation.test.mjs',
        'school_mingjiao_jiuyang_capacity_report.mjs', 'school_mingjiao_jiuyang_capacity_report.test.mjs',
        'school_mingjiao_jiuyang_capacity_integration.test.mjs',
        'school_mingjiao_jiuyang_research_cases.mjs', 'school_mingjiao_jiuyang_research_cases.test.mjs',
        'school_mingjiao_jiuyang_research_observation.mjs', 'school_mingjiao_jiuyang_research_observation.test.mjs',
        'school_mingjiao_jiuyang_research_report.mjs', 'school_mingjiao_jiuyang_research_report.test.mjs',
        'school_mingjiao_jiuyang_research_integration.test.mjs',
        'school_mingjiao_jiuyang_fusion_cases.mjs', 'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs', 'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs', 'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs', 'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs', 'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'school_mingjiao_remaining_perform_cases.mjs', 'school_mingjiao_remaining_perform_cases.test.mjs',
        'school_mingjiao_remaining_perform_record.mjs', 'school_mingjiao_remaining_perform_record.test.mjs',
        'school_mingjiao_remaining_perform_report.mjs', 'school_mingjiao_remaining_perform_report.test.mjs',
        'school_mingjiao_remaining_perform_integration.test.mjs',
        'school_mingjiao_remaining_base_cases.mjs', 'school_mingjiao_remaining_base_cases.test.mjs',
        'school_mingjiao_remaining_base_record.mjs', 'school_mingjiao_remaining_base_record.test.mjs',
        'school_mingjiao_remaining_base_report.mjs', 'school_mingjiao_remaining_base_report.test.mjs',
        'school_mingjiao_remaining_base_integration.test.mjs',
        'school_mingjiao_combination_cases.mjs', 'school_mingjiao_combination_cases.test.mjs',
        'school_mingjiao_combination_record.mjs', 'school_mingjiao_combination_record.test.mjs',
        'school_mingjiao_combination_report.mjs', 'school_mingjiao_combination_report.test.mjs',
        'school_mingjiao_force_remaining_cases.mjs', 'school_mingjiao_force_remaining_cases.test.mjs',
        'school_mingjiao_force_remaining_record.mjs', 'school_mingjiao_force_remaining_record.test.mjs',
        'school_mingjiao_force_remaining_report.mjs', 'school_mingjiao_force_remaining_report.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        files[path] = sha256(readFileSync(join(root, path)));
    }
    for (const name of ['school_panlong_member_cases.mjs', 'school_panlong_member.test.mjs',
        'school_panlong_tan_cases.mjs', 'school_panlong_tan.test.mjs',
        'school_miao_study_cases.mjs', 'school_miao_study.test.mjs',
        'school_dusha_member_cases.mjs', 'school_dusha_member.test.mjs',
        'school_dusha_lifecycle_cases.mjs', 'school_dusha_lifecycle.test.mjs',
        'school_qianye_member_cases.mjs', 'school_qianye_member.test.mjs',
        'school_sanyin_member_cases.mjs', 'school_sanyin_member.test.mjs',
        'school_mizong_member_cases.mjs', 'school_mizong_member.test.mjs',
        'school_emei_npc_bout_cases.mjs', 'school_emei_npc_bout.test.mjs', 'school_emei_npc_bout_report.mjs',
        'school_huashan_duration.test.mjs', 'historical_school_conditions.mjs',
        'historical_school_conditions.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        files[path] = sha256(readFileSync(join(root, path)));
    }
    putCopy('adm/etc/wizlist', '# No wizard accounts in the isolated test.\n');
    for (const path of ['adm/daemons/combatd.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c', 'kungfu/skill/dugu-jiujian/qi.c',
        'kungfu/skill/taiji-quan.c', 'feature/condition.c', 'kungfu/skill/fireice-strike/binghuo.c', 'feature/equip.c',
        'kungfu/skill/bingpo-shenzhen/bing.c', 'feature/action.c', 'inherit/char/char.c',
        'inherit/char/npc.c', 'feature/damage.c', 'adm/daemons/chard.c', 'kungfu/skill/tanzhi-shentong/ding.c',
        mingjiaoJiuyangFusionProbePath]) {
        const original = readFileSync(join(root, path), 'utf8');
        assert.equal(sha256(original), files[path], '快照复制期间源码改变：' + path);
        const probe = path === mingjiaoJiuyangFusionProbePath
            ? mingjiaoJiuyangFusionProbes(original, { collectionGroup: 'mingjiao-jiuyang-fusion' })
            : path === 'kungfu/skill/tanzhi-shentong/ding.c' ? taohuaDingTimerProbes(original)
            : path === 'inherit/char/char.c' ? npcBoutHeartbeatProbes(original)
            : path === 'inherit/char/npc.c' ? npcBoutChatProbes(original)
            : path === 'feature/damage.c' ? npcBoutTerminalProbes(original)
            : path === 'adm/daemons/chard.c' ? npcBoutCorpseProbes(original)
            : path === 'feature/equip.c' ? needleHitProbe(original)
            : path === 'feature/action.c' ? huboBusyProbes(original)
            : path === 'cmds/skill/perform.c' ? huboPerformProbes(original)
            : path.endsWith('bingpo-shenzhen/bing.c') ? needleRestoreProbes(original)
            : path === 'feature/condition.c' ? conditionTickProbes(original)
            : path.endsWith('fireice-strike/binghuo.c') ? fireiceFollowupProbe(original)
            : path.includes('combatd') ? combatActionProbes(original)
            : path.endsWith('taiji-quan.c') ? taijiPassiveProbes(original)
            : path.endsWith('dugu-jiujian/qi.c') ? duguTimerProbes(original)
                : launchProbes(original, path.includes('perform') ? 'perform' : 'exert');
        putCopy(path, probe.changed);
        probes.push({ path, before: sha256(original), after: sha256(probe.changed), sites: probe.sites });
    }
    if (observeTan) {
        const path = observedEffectSources['exert:hamagong/tan'].path;
        const original = readFileSync(join(root, path), 'utf8');
        assert.equal(sha256(original), files[path], 'tan source changed during snapshot');
        const probe = tanResultProbes(original);
        putCopy(path, probe.changed);
        probes.push({ path, before: sha256(original), after: sha256(probe.changed), sites: probe.sites });
    }
    if (sandbox) mkdirSync(join(sandbox, 'log'), { recursive: true });
    return { sandbox, files, probes };
}

async function freePort() {
    const server = createServer();
    await new Promise((ok, fail) => { server.once('error', fail); server.listen(0, '127.0.0.1', ok); });
    const port = server.address().port;
    await new Promise(ok => server.close(ok));
    return port;
}

export function validateRecord(raw, condition) {
    assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
    assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(raw.outcome), '记录缺少终态');
    if (raw.outcome === 'error') return;
    assert.equal(raw.before.length, 2); assert.equal(raw.after.length, 2);
    for (let side = 0; side < 2; side++) {
        const before = raw.before[side], after = raw.after[side], metrics = raw.metrics[side];
        assert.ok(before.userp && before.interactive && before.playerp && !before.wizardp, '必须是真实非巫师玩家');
        assert.equal(before.object, after.object, '样本角色被替换');
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            assert.equal(after[resource], before[resource] - (metrics[resource + '_cost'] ?? 0)
                + (metrics[resource + '_recovery'] ?? 0), '资源账不闭合：' + resource);
        }
    }
    if (['perform', 'exert', 'refusal'].includes(condition.method) && raw.outcome === 'observed') assert.ok(raw.launches.length > 0, '没有真实发动证据');
    if (condition.method === 'interface') assert.ok(raw.interfaces.length > 0, '没有真实接口调用证据');
    const equipment = condition.parameters?.actor?.equipment;
    if (equipment) {
        const secondary = ['gumu-unarmed-learning', 'taohua-zhuan', 'quanzhen-defense', 's1-duan-members', 's1-duan-perform', 's1-piaoxu', 's1-yunlong', 's1-panlong', 's1-panlong-tan', 's1-dusha', 's1-qianye', 's1-sanyin', 's1-mizong'].includes(condition.parameters.collection_group)
            && equipment.slot === 'secondary_weapon';
        const details = raw.before[0][secondary ? 'secondary_weapon_details' : equipment.hold ? 'handing_details' : 'weapon_details'];
        const crafted = condition.parameters.collection_group === 'gumu-advanced' && equipment.item_make;
        const originalNeedle = ['gumu-throwing', 'gumu-needle-lifecycle'].includes(condition.parameters.collection_group);
        const originalPo = condition.parameters.collection_group === 'taohua-po';
        const originalShenghuo = ['mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform'].includes(condition.parameters.collection_group);
        const originalMingjiaoTeacher = condition.parameters.collection_group === 'mingjiao-teachers';
        const originalDefenseSword = ['mingjiao-qkd', 'mingjiao-jiuyang'].includes(condition.parameters.collection_group);
        const originalJiuyangDirect = ['mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining'].includes(condition.parameters.collection_group);
        const originalRemainingFlower = condition.parameters.collection_group === 'mingjiao-remaining-perform'
            && equipment.program === '/clone/weapon/flower_leaf';
        if (originalRemainingFlower) {
            assert.equal(condition.parameters.ability, 'hua');
            assert.equal(equipment.type, 'throwing');
            assert.equal(equipment.hold, true);
        }
        if (originalJiuyangDirect) {
            assert.ok(!equipment.hold);
            assert.ok(['/clone/weapon/gangjian', '/clone/weapon/gangdao'].includes(equipment.program));
        }
        if (originalDefenseSword) {
            assert.equal(equipment.program, '/clone/weapon/gangjian');
            assert.equal(equipment.type, 'sword');
            assert.ok(!equipment.hold);
        }
        if (originalMingjiaoTeacher) {
            assert.ok(!equipment.hold);
            assert.ok(['/clone/weapon/gangjian', '/d/items/staff/muzhang'].includes(equipment.program));
        }
        if (originalPo) {
            assert.equal(equipment.hold, true, 'PO演员必须通过原hand持物');
            assert.ok(['/d/items/throwing/taohua_ban', '/tests/sword'].includes(equipment.program),
                'PO演员原物品路径不在明确清单');
        }
        // Use explicit equipment.program when set (e.g. jinshe_zhui_weapon,
        // xuanyuan_arrow_weapon, poison_item); otherwise derive from type.
        assert.equal(details.program,
            originalNeedle || originalPo || originalShenghuo || originalMingjiaoTeacher
            || originalDefenseSword || originalJiuyangDirect || originalRemainingFlower
            || (['b29-perform', 'public-exert'].includes(condition.parameters.collection_group)
                && equipment.program)
                ? equipment.program
                : '/tests/' + (crafted ? 'crafted_' : '') + equipment.type, '装备初始化类别不符');
        assert.ok(Number.isFinite(details.weight) && details.weight > 0, '缺少实际装备重量');
        if (!equipment.hold && !secondary) {
            assert.equal(details.flag, raw.before[0].weapon_flag);
            assert.equal(details.damage, raw.before[0].weapon_damage);
        }
    }
    if (raw.outcome === 'refused') {
        if (condition.parameters?.collection_group === 'emei-zhao' && condition.parameters.powerup_before_combat) {
            // The refused main action may follow a successful, separately recorded powerup.
            const step = raw.powerup;
            assert.equal(step?.action, 'exert powerup');
            assert.ok(step.accepted === 0 || step.accepted === 1);
            assert.equal(step.launches_before, 0);
            assert.equal(step.launches_after, step.accepted);
            assert.equal(raw.launches.length, step.launches_after);
            if (step.accepted) assert.deepEqual([raw.launches[0].skill, raw.launches[0].argument], ['linji-zhuang', 'powerup']);
            assert.equal(raw.command_accepted, 0);
        } else assert.equal(raw.launches.length, 0);
    }
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
}

export const runWeapons = (root, output, options) => runCollection(root, output, options, 'weapons');
export const runAbilities = (root, output, options) => runCollection(root, output, options, 'abilities');
export const runBouts = (root, output, options) => runCollection(root, output, options, 'bouts');
export const runWeaponSpecial = (root, output, options) => runCollection(root, output, options, 'weapon-special');
export const runTeaching = (root, output, options) => runCollection(root, output, options, 'teaching');
export const runSchoolCombat = (root, output, options) => runCollection(root, output, options, 'school-combat');
export const runSchoolTeam = (root, output, options) => runCollection(root, output, options, 'school-team');
export const runSchoolScene = (root, output, options) => runCollection(root, output, options, 'school-scene');
export const resumeCollection = (root, output, options) => runCollection(root, output, options, null);

export function selectConditions(conditions, options) {
    assert.ok(!(options.case && options.casePrefix), '精确条件和前缀不能同用');
    if (options.caseGroup !== undefined)
        assert.ok(typeof options.caseGroup === 'string' && /^[a-z][a-z0-9_-]*$/.test(options.caseGroup), '条件组无效');
    assert.ok(!(options.caseGroup && (options.case || options.casePrefix)), '条件组与精确条件、前缀不能同用');
    return options.case ? conditions.filter(c => c.id === options.case)
        : options.casePrefix ? conditions.filter(c => c.id.startsWith(options.casePrefix))
        : options.caseGroup ? conditions.filter(c => c.parameters?.collection_group === options.caseGroup) : conditions;
}

export function validateExpectedOutcomes(conditions) {
    for (const condition of conditions) {
        const expected = [].concat(condition.parameters?.expected ?? []);
        assert.ok(expected.length && expected.every(value =>
            ['observed', 'refused', 'error', 'not_applicable'].includes(value)),
        '采集条件缺少有效结果声明：' + condition.id);
    }
}

export function validateQualificationSources(conditions, files, sourceContext) {
    const combinationGroups = ['mingjiao-combination', 'mingjiao-npc-bout'];
    if (conditions.some(c => combinationGroups.includes(c.parameters.collection_group)))
        assert.ok(conditions.every(c => combinationGroups.includes(c.parameters.collection_group)),
            '明教互备／原NPC须独立选定 case-group，不能混入其他条件或裁剪原 manifest');
    const combinationPlans = new Map();
    for (const condition of conditions) {
        if (condition.parameters.collection_group === 'emei-npc-bout') {
            assert.ok(sourceContext?.catalog && typeof sourceContext.readSource === 'function');
            const smoke = condition.parameters.observe_seconds === 3;
            assert.deepEqual(condition, emeiNpcBoutConditions(sourceContext.catalog, sourceContext.readSource, { smoke })[0],
                '周芷若原NPC条件不得改配装或任选闭包');
        }
        if (['mingjiao-combination', 'mingjiao-npc-bout'].includes(condition.parameters.collection_group)) {
            assert.ok(sourceContext?.catalog && typeof sourceContext.readSource === 'function');
            const mode = condition.parameters.run_mode;
            assert.ok(['formal', 'smoke'].includes(mode));
            if (!combinationPlans.has(mode)) combinationPlans.set(mode, new Map(mingjiaoCombinationConditions(
                sourceContext.catalog, sourceContext.readSource, { smoke: mode === 'smoke' }).map(c => [c.id, c])));
            assert.deepEqual(condition, combinationPlans.get(mode).get(condition.id), '原37项明教互备／原NPC条件');
            const p = condition.parameters;
            assert.deepEqual(p.qualification_sources, mingjiaoCombinationSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教互备／原NPC来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-force-remaining') {
            const p = validateMingjiaoForceRemainingCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoForceRemainingSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoForceRemainingAbsentPaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教剩余内功资格来源字节改变：' + path);
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '明教剩余内功回退入口不再缺席：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-remaining-base') {
            const p = validateMingjiaoRemainingBaseCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoRemainingBaseSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教剩余普通武学资格来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-remaining-perform') {
            const p = validateMingjiaoRemainingPerformCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoRemainingPerformSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoRemainingPerformAbsentPaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教剩余绝招资格来源字节改变：' + path);
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '明教剩余绝招回退入口不再缺席：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-fusion') {
            const p = validateMingjiaoJiuyangFusionCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangFusionSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳融合资格来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-research') {
            const p = validateMingjiaoJiuyangResearchCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangResearchSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳研究资格来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-capacity') {
            const p = validateMingjiaoJiuyangCapacityCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangCapacitySourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳容量资格来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-exert') {
            const p = validateMingjiaoJiuyangExertCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangExertSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoJiuyangExertAbsentPaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳运功资格来源字节改变：' + path);
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '九阳运功基础回退入口不再缺席：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-remaining') {
            const p = validateMingjiaoJiuyangRemainingCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangRemainingSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoJiuyangRemainingAbsentPaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳连击/群攻资格来源字节改变：' + path);
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '九阳连击/群攻基础回退入口不再缺席：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-direct') {
            const p = validateMingjiaoJiuyangDirectCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangDirectSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoJiuyangDirectAbsentPaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳直伤资格来源字节改变：' + path);
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '九阳直伤基础回退入口不再缺席：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang-learning') {
            const p = validateMingjiaoJiuyangLearningCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangLearningSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳学习资格来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-jiuyang') {
            const p = validateMingjiaoJiuyangCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoJiuyangSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '九阳被动/防御来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-qkd') {
            const p = validateMingjiaoQkdCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoQkdSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教乾坤防御来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-route') {
            const p = validateMingjiaoRouteCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoRouteSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教原石门路线来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-book') {
            const p = validateMingjiaoBookCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoBookSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教秘籍来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-gift') {
            const p = validateMingjiaoGiftCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoGiftSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教赠剑来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-recruit') {
            const p = validateMingjiaoRecruitCondition(condition);
            assert.deepEqual(p.qualification_sources, mingjiaoRecruitSourcePaths);
            for (const [path, hash] of Object.entries(p.source_evidence))
                assert.equal(files[path], hash, '明教自然拜师来源字节改变：' + path);
        } else if (condition.parameters.collection_group === 'mingjiao-teachers') {
            validateMingjiaoTeachersCondition(condition);
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoTeachersSourcePaths);
            assert.deepEqual(p.qualification_sources, mingjiaoTeachersSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoTeachersAbsentPaths);
            assert.equal(p.reviewed_source_hash, mingjiaoTeachersReviewedSourceHash);
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/);
                assert.equal(files[path], hash, '明教普通授课来源字节改变：' + path);
            }
            assert.equal(p.teaching_entry.id, condition.entry_id);
            assert.equal(p.teacher.sha256, evidence[p.teacher.path.slice(1) + '.c']);
            assert.equal(p.teaching_profile, 'mingjiao-teachers');
            assert.equal(condition.method, 'teaching');
            assert.equal(p.teaching_expectations.length, 1);
            assert.equal(p.teaching_expectations[0].action, `learn ${p.teacher.id} ${p.skill} 1`);
            assert.equal(p.actor.temp, undefined); assert.equal(p.actor.learned, undefined);
        } else if (condition.parameters.collection_group === 'mingjiao-public-force') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoPublicForceSourcePaths);
            assert.deepEqual(p.qualification_sources, mingjiaoPublicForceSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoPublicForceAbsentPaths);
            assert.equal(p.reviewed_source_hash, mingjiaoPublicForceReviewedSourceHash);
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/);
                assert.equal(files[path], hash, '明教公共内功来源字节改变：' + path);
            }
            for (const path of p.absent_sources) assert.equal(files[path], undefined,
                '明教公共回退的专属能力已存在：' + path);
            assert.equal(condition.method, 'exert'); assert.equal(p.school, 'mingjiao');
            assert.equal(p.usage, 'force');
            assert.ok(['shenghuo-xinfa', 'shenghuo-shengong'].includes(p.skill));
            assert.ok(['lifeheal', 'power', 'dispel', 'tianmo', 'roar', 'shot'].includes(p.ability));
            assert.equal(p.action, `exert ${p.ability}${p.other ? ' right' : ''}`);
            assert.equal(condition.entry_id, mingjiaoPublicForceEntryIds[p.ability]);
            assert.equal(p.observe_seconds, 0); assert.equal(p.observation, 'single_action_immediate');
            assert.equal(p.actor.equipment, undefined); assert.equal(p.target.equipment, undefined);
            assert.equal(p.actor.temp, undefined); assert.equal(p.target.temp, undefined);
            assert.equal(p.interface, undefined);
        } else if (condition.parameters.collection_group === 'mingjiao-apprentice-learning') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoApprenticeLearningSourcePaths);
            assert.deepEqual(p.qualification_sources, mingjiaoApprenticeLearningSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoApprenticeLearningAbsentPaths);
            assert.equal(p.school, 'mingjiao'); assert.equal(p.skill, 'shenghuo-ling');
            assert.equal(condition.method, 'teaching');
            assert.equal(p.teaching_profile, 'mingjiao-apprentice-learning');
            assert.equal(p.teacher.path, '/kungfu/class/mingjiao/zhangwuji');
            assert.equal(p.teacher.key, 'zhangwuji'); assert.equal(p.teacher.id, 'zhang wuji');
            assert.equal(p.teacher.sha256, evidence['kungfu/class/mingjiao/zhangwuji.c']);
            assert.equal(p.action, p.teaching_expectations[0].action);
            assert.equal(p.teaching_entry.id, condition.entry_id);
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, '明教自然教学来源未复制或字节改变：' + path);
            }
            for (const step of p.teaching_expectations) {
                assert.ok(['apprentice', 'learn'].includes(step.command_kind));
                assert.ok(['apprentice zhang wuji', 'apprentice cancel',
                    'learn zhang wuji shenghuo-ling 1', 'learn zhang wuji shenghuo-ling 3'].includes(step.action));
                assert.equal(step.teacher_key, step.action === 'apprentice cancel' ? null : 'zhangwuji');
            }
            for (const field of ['capture_skill_loads', 'interface', 'book_setup', 'item_setup', 'actor_free_capacity'])
                assert.equal(p[field], undefined, '本有限教学不接受额外准备：' + field);
            for (const cfg of [p.actor, p.target]) {
                assert.equal(cfg.equipment, undefined); assert.equal(cfg.handing_equipment, undefined);
                assert.equal(cfg.learned, undefined); assert.deepEqual(cfg.preparations, {});
                assert.deepEqual(cfg.mappings, {});
            }
            assert.deepEqual(p.actor.temp, { quest: { name: '实验临时任务', count: 3 } });
            assert.equal(p.target.temp, undefined);
        } else if (condition.parameters.collection_group === 'mingjiao-ling-perform') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoLingPerformSourcePaths, 'LING三绝招来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoLingPerformSourcePaths);
            assert.deepEqual(p.absent_sources, mingjiaoLingPerformAbsentPaths);
            assert.equal(p.school, 'mingjiao'); assert.equal(p.skill, 'shenghuo-ling');
            assert.equal(p.usage, 'sword'); assert.equal(condition.method, 'perform');
            assert.ok(['hua', 'lian', 'xi'].includes(p.ability));
            assert.equal(p.action, `perform sword.${p.ability} right`);
            assert.equal(p.capture_skill_loads, undefined);
            assert.equal(p.interface, undefined);
            const path = `kungfu/skill/shenghuo-ling/${p.ability}.c`;
            assert.equal(p.ability_source.path, path);
            assert.equal(p.ability_source.sha256, evidence[path]);
            assert.equal(p.ability_source.entry_id, condition.entry_id);
            assert.ok(condition.entry_id.startsWith(path));
            assert.equal(p.base_source.path, 'kungfu/skill/shenghuo-ling.c');
            assert.equal(p.base_source.sha256, evidence[p.base_source.path]);
            for (const [source, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[source], h, 'LING三绝招来源未复制或字节改变：' + source);
            }
            for (const [side, cfg] of [p.actor, p.target].entries()) {
                assert.equal(cfg.temp, undefined);
                assert.deepEqual(cfg.preparations, {});
                if (!cfg.equipment) continue;
                const gear = cfg.equipment;
                assert.deepEqual(Object.keys(gear).sort(), ['program', 'type']);
                assert.ok([['sword', '/clone/weapon/gangjian'], ['blade', '/clone/weapon/gangdao']]
                    .some(([type, program]) => gear.type === type && gear.program === program));
                assert.ok(!side || p.ability === 'xi');
            }
            if (p.actor_free_capacity !== undefined) {
                assert.equal(p.ability, 'xi'); assert.equal(p.level, 400);
                assert.equal(p.variant, 'overweight'); assert.equal(p.actor_free_capacity, 5999);
            }
        } else if (condition.parameters.collection_group === 'mingjiao-ling-learning') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoLingLearningSourcePaths, 'LING学习来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoLingLearningSourcePaths, 'LING学习资格来源不完整');
            assert.deepEqual(p.absent_sources, mingjiaoLingLearningAbsentPaths);
            assert.equal(p.school, 'mingjiao');
            assert.equal(p.skill, 'shenghuo-ling');
            assert.equal(p.usage, 'sword');
            assert.equal(condition.entry_id, 'kungfu/skill/shenghuo-ling.c');
            assert.ok(['interface', 'practice'].includes(condition.method));
            assert.equal(p.capture_skill_loads, undefined, 'LING学习不可用激发副作用预加载');
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, 'LING学习来源未复制或字节改变：' + path);
            }
            if (condition.method === 'practice') {
                assert.equal(p.ability, 'practice');
                assert.match(p.action, /^practice sword [1-3]$/);
            } else {
                assert.equal(p.action, 'test_interface');
                assert.equal(p.interface?.object, '/kungfu/skill/shenghuo-ling');
                assert.equal(p.interface?.function, p.ability);
                assert.ok(['valid_enable', 'valid_learn', 'type', 'valid_learn_level'].includes(p.ability));
                if (p.ability === 'valid_enable') assert.ok(['sword', 'parry', 'force'].includes(p.interface.argument));
            }
            if (p.actor.equipment) {
                const gear = p.actor.equipment;
                assert.ok([['sword', '/clone/weapon/gangjian'], ['blade', '/clone/weapon/gangdao']]
                    .some(([type, program]) => gear.type === type && gear.program === program));
                assert.ok(!gear.hold && !gear.item_make && !gear.slot);
            }
        } else if (condition.parameters.collection_group === 'mingjiao-shenghuo') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoShenghuoSourcePaths, 'SHENGHUO来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoShenghuoSourcePaths, 'SHENGHUO资格来源不完整');
            assert.equal(p.school, 'mingjiao');
            assert.ok(['ordinary', 'perform', 'interface'].includes(condition.method));
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, 'SHENGHUO来源未复制或字节改变：' + path);
            }
            for (const descriptor of p.capture_skill_loads ?? []) {
                assert.equal(descriptor.skill, 'shenghuo-ling');
                assert.equal(descriptor.path, 'kungfu/skill/shenghuo-ling.c');
                assert.equal(descriptor.sha256, evidence[descriptor.path]);
            }
            assert.equal(p.capture_skill_loads?.length, 1, 'SHENGHUO原首载证据缺失');
            if (condition.method === 'ordinary') {
                assert.equal(p.action, 'ordinary');
                assert.equal(condition.entry_id, 'kungfu/skill/shenghuo-ling.c');
            } else if (condition.method === 'perform') {
                assert.equal(p.action, 'perform sword.can right');
                assert.match(condition.entry_id, /^kungfu\/skill\/shenghuo-ling\/can\.c:\d+:perform$/);
            } else {
                assert.equal(p.action, 'test_interface');
                assert.equal(p.interface?.object, '/kungfu/skill/shenghuo-shengong');
                assert.equal(p.interface.function, 'hit_ob');
                assert.ok(Number.isSafeInteger(p.interface.damage) && p.interface.damage >= 0);
                assert.equal(p.interface.factor, 50);
            }
            if (p.actor.equipment) {
                const gear = p.actor.equipment;
                assert.ok([['sword', '/clone/weapon/gangjian'], ['blade', '/clone/weapon/gangdao']]
                    .some(([type, program]) => gear.type === type && gear.program === program));
                assert.ok(!gear.hold && !gear.item_make && !gear.slot);
            }
        } else if (condition.parameters.collection_group === 'mingjiao-shengong') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoShengongSourcePaths, 'SHENGONG来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoShengongSourcePaths, 'SHENGONG资格来源不完整');
            assert.deepEqual(p.absent_sources, mingjiaoShengongAbsentPaths, 'SHENGONG缺席入口清单不完整');
            for (const path of mingjiaoShengongAbsentPaths)
                assert.ok(!Object.hasOwn(files, path), 'SHENGONG缺席入口被复制：' + path);
            assert.equal(p.school, 'mingjiao');
            assert.equal(p.usage, 'force');
            assert.equal(p.skill, 'shenghuo-shengong');
            assert.ok(['exert', 'interface', 'practice', 'research'].includes(condition.method));
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, 'SHENGONG来源未复制或字节改变：' + path);
            }
            const entryPath = condition.method === 'exert'
                ? `kungfu/skill/${['recover', 'regenerate'].includes(p.ability) ? 'force' : 'shenghuo-shengong'}/${p.ability}.c`
                : 'kungfu/skill/shenghuo-shengong.c';
            if (condition.method === 'exert') assert.match(condition.entry_id, new RegExp(`^${entryPath}:\\d+:exert$`));
            else assert.equal(condition.entry_id, entryPath, 'SHENGONG所属技能不符');
            if (condition.method === 'interface') {
                assert.equal(p.action, 'test_interface');
                assert.equal(p.interface?.function, p.ability);
                assert.equal(p.interface.object, p.ability === 'query_current_neili_limit'
                    ? 'player' : '/kungfu/skill/shenghuo-shengong');
                assert.ok(['valid_enable', 'valid_learn', 'valid_research', 'type',
                    'valid_learn_level', 'query_neili_improve', 'query_current_neili_limit'].includes(p.ability));
            } else if (condition.method === 'exert') {
                assert.ok(['powerup', 'shield', 'recover', 'regenerate'].includes(p.ability));
                assert.match(p.action, new RegExp(`^exert ${p.ability}(?: right)?$`));
            } else assert.match(p.action, new RegExp(`^${condition.method} ${condition.method === 'research' ? 'shenghuo-shengong' : 'force'} [1-3]$`));
        } else if (condition.parameters.collection_group === 'mingjiao-movement') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoMovementSourcePaths, 'MOVEMENT来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoMovementSourcePaths, 'MOVEMENT资格来源不完整');
            assert.equal(p.school, 'mingjiao');
            assert.equal(p.usage, 'dodge');
            assert.ok(['shenghuo-bu', 'qingfu-shenfa', 'lingxu-bu'].includes(p.skill));
            assert.ok(['ordinary', 'interface', 'practice'].includes(condition.method));
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, 'MOVEMENT来源未复制或字节改变：' + path);
            }
            assert.equal(condition.entry_id, `kungfu/skill/${p.skill}.c`, 'MOVEMENT所属轻功不符');
            if (condition.method === 'ordinary') assert.equal(p.action, 'ordinary');
            else if (condition.method === 'practice') assert.match(p.action, /^practice dodge [1-3]$/);
            else {
                assert.equal(p.action, 'test_interface');
                assert.equal(p.interface?.object, p.ability === 'do_damage' ? '/adm/daemons/combatd' : `/kungfu/skill/${p.skill}`);
                assert.equal(p.interface?.function, p.ability);
            }
        } else if (condition.parameters.collection_group === 'mingjiao-xinfa') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.deepEqual(Object.keys(evidence ?? {}), mingjiaoXinfaSourcePaths, 'XINFA来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoXinfaSourcePaths, 'XINFA资格来源不完整');
            assert.deepEqual(p.absent_sources, mingjiaoXinfaAbsentPaths, 'XINFA缺席入口清单不完整');
            for (const path of mingjiaoXinfaAbsentPaths)
                assert.ok(!Object.hasOwn(files, path), 'XINFA缺席入口被复制：' + path);
            assert.equal(p.school, 'mingjiao');
            assert.equal(p.usage, 'force');
            assert.ok(['shenghuo-xinfa', 'shenghuo-shengong'].includes(p.skill));
            assert.ok(['exert', 'interface', 'practice'].includes(condition.method));
            for (const [path, h] of Object.entries(evidence)) {
                assert.match(h, /^[a-f0-9]{64}$/);
                assert.equal(files[path], h, 'XINFA来源未复制或字节改变：' + path);
            }
            const path = condition.method === 'exert' ? p.ability === 'powerup'
                ? 'kungfu/skill/shenghuo-xinfa/powerup.c' : 'kungfu/skill/force/recover.c'
                : `kungfu/skill/${p.skill}.c`;
            assert.ok(condition.entry_id.startsWith(path), 'XINFA入口来源不符');
        } else if (condition.parameters.collection_group === 'mingjiao-qishang') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'QISHANG缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), mingjiaoQishangSourcePaths, 'QISHANG来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoQishangSourcePaths, 'QISHANG资格来源清单不完整');
            assert.equal(p.skill, 'qishang-quan', 'QISHANG技能不符');
            assert.equal(p.school, 'mingjiao', 'QISHANG门派不符');
            assert.equal(p.usage, 'cuff', 'QISHANG用途不符');
            assert.ok(['ordinary', 'perform'].includes(condition.method), 'QISHANG调用方式不符');
            assert.ok(condition.method === 'ordinary' ? p.ability === 'ordinary' : ['fei', 'shang'].includes(p.ability), 'QISHANG能力不符');
            assert.equal(p.action, condition.method === 'ordinary' ? 'ordinary' : `perform cuff.${p.ability} right`, 'QISHANG原命令不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'QISHANG来源摘要无效：' + path);
                assert.equal(files[path], hash, 'QISHANG来源未复制或字节改变：' + path);
            }
            const path = condition.method === 'ordinary' ? 'kungfu/skill/qishang-quan.c'
                : `kungfu/skill/qishang-quan/${p.ability}.c`;
            assert.ok(condition.entry_id.startsWith(path), 'QISHANG入口来源不符');
        } else if (condition.parameters.collection_group === 'mingjiao-core') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'MINGJIAO缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), mingjiaoCoreSourcePaths, 'MINGJIAO来源清单不完整');
            assert.deepEqual(p.qualification_sources, mingjiaoCoreSourcePaths, 'MINGJIAO资格来源清单不完整');
            assert.equal(p.skill, 'hanbing-mianzhang', 'MINGJIAO技能不符');
            assert.equal(p.school, 'mingjiao', 'MINGJIAO门派不符');
            assert.equal(p.usage, 'strike', 'MINGJIAO用途不符');
            assert.ok(['ordinary', 'perform'].includes(condition.method), 'MINGJIAO调用方式不符');
            assert.equal(p.ability, condition.method === 'ordinary' ? 'ordinary' : 'jue', 'MINGJIAO能力不符');
            assert.equal(p.action, condition.method === 'ordinary' ? 'ordinary' : 'perform strike.jue right', 'MINGJIAO原命令不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'MINGJIAO来源摘要无效：' + path);
                assert.equal(files[path], hash, 'MINGJIAO来源未复制或字节改变：' + path);
            }
            const path = condition.method === 'ordinary' ? 'kungfu/skill/hanbing-mianzhang.c'
                : 'kungfu/skill/hanbing-mianzhang/jue.c';
            assert.ok(condition.entry_id.startsWith(path), 'MINGJIAO入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-combination') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'COMBINATION缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaCombinationSourcePaths, 'COMBINATION来源清单不完整');
            assert.deepEqual(p.qualification_sources, taohuaCombinationSourcePaths, 'COMBINATION资格来源清单不完整');
            assert.ok(Object.hasOwn(taohuaCombinationSkills, p.skill), 'COMBINATION技能不符');
            assert.ok(['prepare', 'round'].includes(condition.method), 'COMBINATION调用方式不符');
            assert.equal(p.ability, condition.method, 'COMBINATION能力不符');
            assert.equal(p.action, condition.method === 'round' ? 'fight_round' : 'prepare_sequence', 'COMBINATION原命令不符');
            assert.equal(condition.entry_id, `kungfu/skill/${p.skill}.c`, 'COMBINATION入口来源不符');
            assert.ok(taohuaCombinationPairs.some(pair => JSON.stringify(pair) === JSON.stringify(p.pair)), 'COMBINATION配对不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'COMBINATION来源摘要无效：' + path);
                assert.equal(files[path], hash, 'COMBINATION来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'taohua-passive') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'PASSIVE缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaPassiveSourcePaths, 'PASSIVE来源清单不完整');
            assert.deepEqual(p.qualification_sources, taohuaPassiveSourcePaths, 'PASSIVE资格来源清单不完整');
            assert.equal(p.skill, 'yuxiao-jian', 'PASSIVE技能不符');
            assert.equal(p.ability, 'hit_ob', 'PASSIVE能力不符');
            assert.equal(p.usage, 'sword', 'PASSIVE用法不符');
            assert.equal(condition.method, 'interface', 'PASSIVE调用方式不符');
            assert.equal(p.action, 'test_interface', 'PASSIVE原入口命令不符');
            assert.equal(p.interface?.object, '/kungfu/skill/yuxiao-jian', 'PASSIVE接口对象不符');
            assert.equal(p.interface.function, 'hit_ob', 'PASSIVE接口函数不符');
            assert.equal(p.interface.factor, 0, 'PASSIVE接口因子不符');
            assert.ok(Number.isSafeInteger(p.interface.damage) && p.interface.damage >= 0, 'PASSIVE接口伤害无效');
            assert.match(condition.entry_id, /^kungfu\/skill\/yuxiao-jian\.c:\d+:hit_ob$/);
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'PASSIVE来源摘要无效：' + path);
                assert.equal(files[path], hash, 'PASSIVE来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'taohua-bihai') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'BIHAI缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaBihaiSourcePaths, 'BIHAI来源清单不完整');
            assert.equal(p.skill, 'yuxiao-jian', 'BIHAI技能不符');
            assert.equal(p.ability, 'bihai', 'BIHAI能力不符');
            assert.equal(p.usage, 'sword', 'BIHAI用法不符');
            assert.equal(condition.method, 'perform', 'BIHAI调用方式不符');
            assert.equal(p.action, 'perform sword.bihai right', 'BIHAI原命令不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'BIHAI来源摘要无效：' + path);
                assert.equal(files[path], hash, 'BIHAI来源未复制或字节改变：' + path);
            }
            for (const [source, path] of [[p.ability_source, 'kungfu/skill/yuxiao-jian/bihai.c'],
                [p.base_source, 'kungfu/skill/yuxiao-jian.c']]) {
                assert.equal(source?.path, path, 'BIHAI能力来源路径不符');
                assert.equal(source.sha256, evidence[path], 'BIHAI能力来源摘要不符');
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'BIHAI入口来源不符');
            assert.match(condition.entry_id, /^kungfu\/skill\/yuxiao-jian\/bihai\.c:\d+:perform$/);
        } else if (condition.parameters.collection_group === 'taohua-combo') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'COMBO缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaComboSourcePaths, 'COMBO来源清单不完整');
            assert.deepEqual(p.qualification_sources, taohuaComboSourcePaths, 'COMBO资格来源清单不完整');
            const move = { kuang: { skill: 'xuanfeng-tui', usage: 'unarmed' },
                fei: { skill: 'lanhua-shou', usage: 'hand' } }[p.ability];
            assert.ok(move, 'COMBO入口不在两项明确清单');
            assert.equal(p.skill, move.skill, 'COMBO技能不符');
            assert.equal(p.usage, move.usage, 'COMBO用法不符');
            assert.equal(condition.method, 'perform', 'COMBO调用方式不符');
            assert.equal(p.action, `perform ${move.usage}.${p.ability} right`, 'COMBO原命令不符');
            assert.equal(p.nonlethal, p.variant === 'low-qi' ? true : undefined, 'COMBO切磋范围不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'COMBO来源摘要无效：' + path);
                assert.equal(files[path], hash, 'COMBO来源未复制或字节改变：' + path);
            }
            for (const [source, path] of [[p.ability_source, `kungfu/skill/${move.skill}/${p.ability}.c`],
                [p.base_source, `kungfu/skill/${move.skill}.c`]]) {
                assert.equal(source?.path, path, 'COMBO能力来源路径不符');
                assert.equal(source.sha256, evidence[path], 'COMBO能力来源摘要不符');
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'COMBO入口来源不符');
            assert.match(condition.entry_id, new RegExp('^' + p.ability_source.path.replace(/\./g, '\\.') + ':\\d+:perform$'));
        } else if (condition.parameters.collection_group === 'taohua-attack') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'ATTACK缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaAttackSourcePaths, 'ATTACK来源清单不完整');
            assert.deepEqual(p.qualification_sources, taohuaAttackSourcePaths, 'ATTACK资格来源清单不完整');
            const move = taohuaAttacks.find(move => move.skill === p.skill && move.usage === p.usage);
            assert.ok(move, 'ATTACK入口不在六项明确清单');
            assert.equal(condition.entry_id, `kungfu/skill/${move.skill}.c`, 'ATTACK入口来源不符');
            assert.equal(condition.method, 'ordinary', 'ATTACK调用方式不符');
            assert.equal(p.ability, 'ordinary', 'ATTACK能力不符');
            assert.equal(p.action, 'ordinary', 'ATTACK动作不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'ATTACK来源摘要无效：' + path);
                assert.equal(files[path], hash, 'ATTACK来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'taohua-control') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'CONTROL缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaControlSourcePaths, 'CONTROL来源清单不完整');
            const move = { fu: { skill: 'lanhua-shou', usage: 'hand' },
                sui: { skill: 'luoying-shenjian', usage: 'sword' } }[p.ability];
            assert.ok(move, 'CONTROL入口不在两项明确清单');
            assert.equal(p.skill, move.skill, 'CONTROL技能不符');
            assert.equal(p.usage, move.usage, 'CONTROL用法不符');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'CONTROL来源摘要无效：' + path);
                assert.equal(files[path], hash, 'CONTROL来源未复制或字节改变：' + path);
            }
            for (const [source, path] of [[p.ability_source, `kungfu/skill/${move.skill}/${p.ability}.c`],
                [p.base_source, `kungfu/skill/${move.skill}.c`]]) {
                assert.equal(source?.path, path, 'CONTROL能力来源路径不符');
                assert.equal(source.sha256, evidence[path], 'CONTROL能力来源摘要不符');
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'CONTROL入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-direct') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'DIRECT缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaDirectSourcePaths, 'DIRECT来源清单不完整');
            const move = taohuaDirectMoves.find(move => move.skill === p.skill
                && move.ability === p.ability && move.usage === p.usage);
            assert.ok(move, 'DIRECT入口不在四项明确清单');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'DIRECT来源摘要无效：' + path);
                assert.equal(files[path], hash, 'DIRECT来源未复制或字节改变：' + path);
            }
            for (const [source, path] of [[p.ability_source, `kungfu/skill/${move.skill}/${move.ability}.c`],
                [p.base_source, `kungfu/skill/${move.skill}.c`]]) {
                assert.equal(source?.path, path, 'DIRECT能力来源路径不符');
                assert.equal(source.sha256, evidence[path], 'DIRECT能力来源摘要不符');
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'DIRECT入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-ding') {
            const evidence = condition.parameters.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'DING缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), taohuaDingSourcePaths, 'DING来源清单不完整');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, 'DING来源摘要无效：' + path);
                assert.equal(files[path], hash, 'DING来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'taohua-xiao') {
            const p = condition.parameters;
            assert.deepEqual(p.qualification_sources, taohuaXiaoSourcePaths, 'XIAO来源清单不完整');
            for (const path of p.qualification_sources)
                assert.match(files[path] ?? '', /^[a-f0-9]{64}$/, 'XIAO来源未复制：' + path);
            for (const [source, path] of [[p.ability_source, taohuaXiaoSourcePaths[0]],
                [p.base_source, taohuaXiaoSourcePaths[1]]]) {
                assert.equal(source?.path, path, 'XIAO能力来源路径不符');
                assert.match(source.sha256, /^[a-f0-9]{64}$/, 'XIAO能力来源摘要无效');
                assert.equal(files[path], source.sha256, 'XIAO能力来源字节改变：' + path);
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'XIAO入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-po') {
            const p = condition.parameters;
            assert.deepEqual(p.qualification_sources, taohuaPoSourcePaths, 'PO来源清单不完整');
            for (const path of p.qualification_sources)
                assert.match(files[path] ?? '', /^[a-f0-9]{64}$/, 'PO来源未复制：' + path);
            for (const [source, path] of [[p.ability_source, taohuaPoSourcePaths[0]],
                [p.base_source, taohuaPoSourcePaths[1]]]) {
                assert.equal(source?.path, path, 'PO能力来源路径不符');
                assert.match(source.sha256, /^[a-f0-9]{64}$/, 'PO能力来源摘要无效');
                assert.equal(files[path], source.sha256, 'PO能力来源字节改变：' + path);
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'PO入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-zhuan') {
            const p = condition.parameters;
            assert.deepEqual(p.qualification_sources, taohuaZhuanSourcePaths, 'ZHUAN来源清单不完整');
            for (const path of p.qualification_sources)
                assert.match(files[path] ?? '', /^[a-f0-9]{64}$/, 'ZHUAN来源未复制：' + path);
            for (const [source, path] of [[p.ability_source, taohuaZhuanSourcePaths[0]],
                [p.base_source, taohuaZhuanSourcePaths[1]]]) {
                assert.equal(source?.path, path, 'ZHUAN能力来源路径不符');
                assert.match(source.sha256, /^[a-f0-9]{64}$/, 'ZHUAN能力来源摘要无效');
                assert.equal(files[path], source.sha256, 'ZHUAN能力来源字节改变：' + path);
            }
            assert.equal(p.ability_source.entry_id, condition.entry_id, 'ZHUAN入口来源不符');
        } else if (condition.parameters.collection_group === 'public-inherited') {
            const evidence = condition.parameters.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), '公共继承缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), [...skillInheritedSourcePaths], '公共继承来源清单不完整');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/);
                assert.equal(files[path], hash, '公共继承来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'public-music') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), '公共演奏缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), skillMusicSourcePaths, '公共演奏来源清单不完整');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, '公共演奏来源摘要无效：' + path);
                assert.equal(files[path], hash, '公共演奏来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'public-special') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), '公共特殊效果缺少来源摘要');
            assert.deepEqual(Object.keys(evidence), [...publicSpecialSourcePaths], '公共特殊效果来源清单不完整');
            for (const [path, hash] of Object.entries(evidence)) {
                assert.match(hash, /^[a-f0-9]{64}$/, '公共特殊效果来源摘要无效：' + path);
                assert.equal(files[path], hash, '公共特殊效果来源未复制或字节改变：' + path);
            }
        } else if (condition.parameters.collection_group === 'taohua-music') {
            const p = condition.parameters, evidence = p.source_evidence;
            assert.ok(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'MUSIC缺少来源摘要');
            for (const path of Object.keys(evidence)) {
                assert.match(evidence[path], /^[a-f0-9]{64}$/, 'MUSIC来源摘要无效');
                assert.ok(files[path], 'MUSIC资格来源未复制：' + path);
                assert.equal(files[path], evidence[path], 'MUSIC来源字节改变：' + path);
            }
            assert.ok(p.ability_source?.entry_id?.endsWith(':do_effect'), 'MUSIC入口来源不符');
        } else if (condition.parameters.collection_group === 'taohua-npc') {
            const p = condition.parameters, evidence = p.source_evidence;
            const lower = Object.fromEntries(Object.keys(files).map(k => [k.toLowerCase(), k]));
            assert.ok(Array.isArray(evidence) && evidence.length > 0, 'NPC缺少来源摘要');
            for (const row of evidence) {
                assert.ok(row && typeof row.path === 'string' && row.path, 'NPC来源路径无效');
                assert.match(row.sha256, /^[a-f0-9]{64}$/, 'NPC来源摘要无效');
                const actual = lower[row.path.toLowerCase()];
                assert.ok(actual, 'NPC资格来源未复制：' + row.path);
                assert.equal(files[actual], row.sha256, 'NPC来源字节改变：' + row.path);
            }
        } else {
            for (const path of condition.parameters.qualification_sources)
                assert.ok(files[path], '资格来源未复制：' + path);
        }
    }
}

async function runCollection(root, output, options, collection) {
    root = realpathSync(root); output = realpathSync(output);
    assert.ok(!isInside(root, output), '执行证据目录必须在仓库外');
    const existing = collection ? null : openSeries(output);
    collection ??= existing.identity.execution.collection;
    assert.ok(['weapons', 'abilities', 'bouts', 'weapon-special', 'teaching', 'school-combat', 'school-team', 'school-scene'].includes(collection), '旧系列未记录采集入口，不原地迁移或续跑');
    const release = seriesLock(output);
    try { return await executeCollection(root, output, options, collection, existing); }
    finally { release(); }
}

export function validateMingjiaoRouteSelection(conditions) {
    if (!conditions.some(c => c.parameters.collection_group === 'mingjiao-route')) return;
    assert.ok(conditions.every(c => c.parameters.collection_group === 'mingjiao-route'),
        '原石门路线不得与其他场景混合');
    for (const condition of conditions) validateMingjiaoRouteCondition(condition);
    if (conditions.some(c => c.parameters.route_mode === 'cold'))
        assert.ok(conditions.length === 1 && conditions[0].samples === 1,
            '首载条件须单独系列、单样本、独立驱动，不能合批');
}

export function replayHistoricalSamples(runs, manifest, importer) {
    const evidence = new Map();
    for (const name of readdirSync(runs).sort()) {
        const directory = join(runs, name);
        verifyAttemptStopped(directory);
        const request = JSON.parse(readFileSync(join(directory, 'request.json'), 'utf8'));
        assert.equal(request.fingerprint, manifest.fingerprint, '历史运行不属于当前系列');
        const tail = jsonlTail(join(directory, 'mudlib/log/events.jsonl'),
            attemptImporter(request.jobs, raw => {
                importer.accept(raw);
                evidence.set(raw.condition_id + '.' + raw.index, digest(raw));
            }));
        tail.drain();
        assert.equal(tail.errors.length, 0, '历史完整记录验证失败，保留现场，不自动重跑');
    }
    // An empty interrupted attempt is recoverable, but cached ledger rows are not
    // proof that their original, request-bound event records are still present.
    for (const row of importer.rows)
        assert.equal(evidence.get(row.condition_id + '.' + row.index), row.raw_sha256,
            '台账缺少对应完整原始记录，保留现场，不自动重跑：' + row.condition_id + '.' + row.index);
}

async function executeCollection(root, output, options, collection, existing) {
    console.log('隔离武学采集：' + output);
    const inventory = buildInventory(root);
    inventory.versions = collectVersions(root, options.driver, output);
    const catalog = collectCatalog(root, inventory);
    const relations = collection === 'teaching' ? schoolRelations(inventory, catalog) : null;
    const makeConditions = { weapons: weaponConditions, abilities: abilityConditions, bouts: boutConditions,
        'weapon-special': weaponSpecialConditions,
        'school-combat': schoolCombatConditions,
        'school-team': schoolTeamConditions,
        'school-scene': (catalog, settings) => {
            if ((settings.case ?? settings.casePrefix ?? '').startsWith('school-scene-miao-study-')) {
                const readSource = path => {
                    assert.ok(miaoStudySourcePaths.includes(path), '未声明的苗家研习来源');
                    const actual = realpathSync(join(root, path));
                    assert.ok(isInside(root, actual), '苗家研习来源链接越界：' + path);
                    return readFileSync(actual, 'utf8');
                };
                return miaoStudyConditions(catalog, readSource, settings);
            }
            const routeScope = (settings.case ?? settings.casePrefix ?? '')
                .startsWith('school-scene-mingjiao-route-');
            if (!routeScope) return schoolSceneConditions(catalog, settings);
            const readSource = path => {
                assert.ok(mingjiaoRouteSourcePaths.includes(path), '未声明的路线来源');
                const actual = realpathSync(join(root, path));
                assert.ok(isInside(root, actual), '路线来源链接越界：' + path);
                return readFileSync(actual, 'utf8');
            };
            return mingjiaoRouteConditions(catalog, readSource, settings);
        },
        teaching: () => teachingConditions(relations, catalog).map(c => ({ ...c,
            samples: options.smoke ? 1 : c.samples })) }[collection];
    const allConditions = existing?.identity.conditions ?? makeConditions(catalog, options);
    const conditions = existing ? allConditions : selectConditions(allConditions, options);
    assert.ok(conditions.length, '条件不存在：' + (options.case ?? options.casePrefix ?? options.caseGroup));
    validateMingjiaoRouteSelection(conditions);
    validateExpectedOutcomes(conditions);
    // Hash without writing first. A refused resume never changes old snapshots.
    const snapshotOptions = { observeTan: conditions.some(c => c.parameters.collection_group === 'public-exert'
        && c.parameters.skill === 'hamagong' && c.parameters.ability === 'tan') };
    const snapshot = createSandbox(root, undefined, snapshotOptions);
    const sourceContext = { catalog, readSource: path => readFileSync(join(root, path), 'utf8') };
    validateQualificationSources(conditions, snapshot.files, sourceContext);
    for (const file of inventory.files) assert.equal(snapshot.files[file.path], file.sha256,
        '快照与清单期间源码改变：' + file.path);
    const execution = { collection, driver: inventory.versions.driver,
        node: inventory.versions.node, tokenizer: inventory.versions.tokenizer,
        source_files: snapshot.files, probes: snapshot.probes, gametick_ms: 1000, heartbeat_ms: 1000,
        smoke: existing?.identity.execution.smoke ?? options.smoke,
        injected_fault: existing?.identity.execution.injected_fault ?? options.injectedFault ?? null,
        ...(conditions.some(c => c.parameters.collection_group === 'mingjiao-jiuyang-fusion')
            ? { fusion_watchdog_seconds: 30 } : {}) };
    if (existing) verifyResume(existing, inventory, catalog, execution);
    const manifest = existing ?? createSeries(output, { inventory, catalog, conditions, execution,
        teachingEntries: collection === 'teaching' ? teachingEntries(conditions)
            : collection === 'school-combat' ? teachingEntries(conditions.filter(c => c.method === 'teaching')) : [],
        npcEntries: collection === 'school-combat' ? [...npcEntries(conditions), ...taohuaNpcEntries(conditions),
            ...conditions.filter(c => c.parameters.collection_group === 'mingjiao-npc-bout').map(c => c.parameters.npc.source)] : [],
        sceneEntries: collection === 'school-scene' ? sceneEntries(conditions) : [],
        commandEntries: [...new Map(conditions.filter(c => c.parameters.collection_group === 'mingjiao-jiuyang-fusion'
            && c.method === 'yanlian').map(c => [c.entry_id, c.parameters.source_entry])).values()] });
    if (!existing) {
        save(join(output, 'inventory.json'), inventory); save(join(output, 'catalog.json'), catalog);
        if (relations) save(join(output, 'school-relations.json'), relations);
    }
    const importer = sampleImporter(output, manifest, (raw, condition) => {
        validateRecord(raw, condition);
        if (collection === 'abilities' && raw.outcome !== 'error') validateAbilityRecord(raw, condition);
        if (collection === 'bouts') validateBoutRecord(raw, condition);
        if (collection === 'weapon-special' && raw.outcome !== 'error') validateWeaponSpecialRecord(raw, condition);
        if (collection === 'teaching') validateTeachingRecord(raw, condition);
        if (collection === 'school-combat') validateSchoolCombatRecord(raw, condition, sourceContext);
        if (collection === 'school-team') validateSchoolTeamRecord(raw, condition);
        if (collection === 'school-scene') validateSchoolSceneRecord(raw, condition);
    });
    const runs = join(output, 'runs'); mkdirSync(runs, { recursive: true });
    // A killed collector may have left complete raw rows not yet imported.
    replayHistoricalSamples(runs, manifest, importer);
    let jobs = missingJobs(manifest, importer.rows, options.case);
    const started = Date.now();
    while (jobs.length) {
        const run = mkdtempSync(join(runs, 'attempt-'));
        save(join(run, 'request.json'), { fingerprint: manifest.fingerprint, created: new Date().toISOString(),
            jobs: jobs.map(job => ({ condition_id: job.condition_id, index: job.index })),
            interrupt_after: options.interruptAfter ?? null });
        const current = createSandbox(root, run, snapshotOptions);
        assert.equal(digest(current.files), digest(snapshot.files), '启动前文件变化，必须新建系列');
        assert.equal(digest(current.probes), digest(snapshot.probes), '启动前探针变化');
        const before = importer.imported;
        const result = await runAttempt(current.sandbox, options, jobs, execution.injected_fault,
            attemptImporter(jobs, raw => importer.accept(raw)), execution);
        put(join(run, 'driver-output.txt'), result.text);
        save(join(run, 'result.json'), { elapsed_seconds: result.elapsed, process: { pid: result.pid, code: result.code,
            signal: result.signal }, interrupted: result.interrupted, validation_errors: result.errors,
            incomplete_bytes: result.incomplete, imported: importer.imported - before,
            driver_output_sha256: sha256(result.text), fixture_metadata: result.fixture_metadata });
        const report = coverage(output);
        save(join(output, 'coverage.json'), report); put(join(output, 'summary.md'), coverageMarkdown(report));
        assert.equal(result.errors.length, 0, '原始记录验证失败，查看本次 result.json');
        if (result.interrupted) throw new Error('采集已中断；已完成样本保留，可用 resume 补缺项');
        assert.equal(result.incomplete, 0, '原始记录尾行未写完整；保留现场，可续跑缺项');
        jobs = missingJobs(manifest, importer.rows, options.case);
        if (result.code === 0) {
            assert.match(result.text, /DATA COMPLETE/);
            assert.equal(jobs.length, 0, '驱动提前结束，未误报完成');
        } else {
            // A recorded sample failure ends this driver. Continue in a clean copy.
            assert.ok(/DATA SAMPLE ERROR/.test(result.text) && importer.imported > before,
                '隔离驱动异常退出且未取得可续行的错误样本；使用 resume 重试缺项');
            console.log('错误样本已保留；其余样本改用新的隔离进程继续。');
        }
    }
    const report = coverage(output);
    save(join(output, 'coverage.json'), report); put(join(output, 'summary.md'), coverageMarkdown(report));
    assert.equal(report.totals.errors, 0, '样本已收齐但含运行错误，不算效果通过；错误记录不覆盖');
    for (const row of importer.rows) assert.ok([].concat(conditions.find(c => c.id === row.condition_id).parameters.expected).includes(row.outcome),
        '实际资格/采集结果与配置预期不同：' + row.condition_id);
    console.log(`本次执行结束：累计 ${report.totals.recorded_samples}/${report.totals.planned_samples} 条；`
        + `${((Date.now() - started) / 1000).toFixed(2)} 秒；${execution.smoke ? '仅烟雾' : '既定条件'}`);
    return { output, manifest, report };
}

// Socket errors and stdio are separate event streams. Decide only after close()
// has delivered the full driver output and the final raw tail has been drained.
export function classifyInteractiveClose({ code, signal, interrupted, text, saved, planned, errors, incomplete }) {
    if (interrupted) return 'cancelled';
    if (signal !== null || incomplete !== 0 || errors !== 0) return 'unexpected';
    if (code === 0 && /(?:^|\n)DATA COMPLETE(?:\r?\n|$)/.test(text) && saved === planned)
        return 'complete';
    if (Number.isInteger(code) && code !== 0 && /(?:^|\n)DATA SAMPLE ERROR(?:[ :]|\r?\n|$)/.test(text)
        && saved > 0) return 'recorded_error';
    return 'unexpected';
}

// A real empty input line updates the driver's interactive last_time. It is not
// a gameplay command or proof of business acceptance. Do not change actor state,
// query_idle(), heartbeat scheduling, or the recorded sample metrics instead.
export function startInteractiveInput(client, onWrite, intervalMs = 60000) {
    assert.ok(Number.isInteger(intervalMs) && intervalMs > 0 && intervalMs <= 60000,
        '真实连接空行间隔须为 1..60000 毫秒');
    const started = Date.now();
    let timer, stopped = false;
    const stop = () => {
        if (stopped) return;
        stopped = true;
        clearInterval(timer);
        client.removeListener('connect', connected);
        client.removeListener('end', stop);
        client.removeListener('close', stop);
        client.removeListener('error', failed);
    };
    const failed = error => {
        onWrite({ kind: 'error', elapsed_seconds: (Date.now() - started) / 1000,
            code: error.code ?? null, message: error.message });
        stop();
    };
    const send = () => {
        if (stopped) return;
        try {
            const available = client.write('\n');
            onWrite({ kind: 'write', elapsed_seconds: (Date.now() - started) / 1000,
                bytes: 1, writable_buffer_available: available });
        } catch (error) {
            // The normal socket error handler remains responsible for failing
            // the attempt; synchronous write failures must follow that path too.
            client.destroy(error);
        }
    };
    const connected = () => {
        send();
        if (!stopped && !client.destroyed) timer = setInterval(send, intervalMs);
    };
    client.once('connect', connected);
    client.once('end', stop);
    client.once('close', stop);
    client.once('error', failed);
    return stop;
}

async function runAttempt(sandbox, options, jobs, fault, accept, execution) {
    const input = collectionInput(jobs, fault, execution);
    put(join(sandbox, 'tests/options.json'), input.text);
    const port = await freePort();
    put(join(sandbox, 'driver.cfg'), ['name : Martial Data Collection', 'mud ip : 127.0.0.1', `port number : ${port}`,
        // The driver starts with cwd=sandbox. A relative root avoids old
        // config parsers truncating long absolute evidence-directory lines.
        'mudlib directory : .', 'log directory : /log', 'debug log file : debug.log',
        'master file : /tests/master', 'simulated efun file : /adm/single/simul_efun',
        'include directories : /include:/mudcore/include', 'global include file : <globals.h>',
        ...Object.entries(input.limits).map(([key, value]) => `${key} : ${value}`),
        'gametick msec : 1000', 'heartbeat interval msec : 1000', ''].join('\n'));
    const started = Date.now();
    const tail = jsonlTail(join(sandbox, 'log/events.jsonl'), accept);
    return await new Promise((done) => {
        const child = spawn(options.driver, ['driver.cfg'], { cwd: sandbox, windowsHide: true });
        let text = '', pending = '', connected = false, interrupted = false, saved = 0;
        const clients = [];
        const clientResets = [];
        let resetGrace;
        const inputStops = [];
        const fixtureInput = { interval_ms: 60000, payload: '\n',
            meaning: 'Socket write calls only; not proof of delivery or gameplay acceptance.', clients: [] };
        let inputStopped = false;
        const stopInput = () => { inputStopped = true; inputStops.forEach(stop => stop()); };
        const allowedSeconds = 120 + jobs.reduce((n, job) => n + 3
            + (job.parameters.collection_group === 'mingjiao-jiuyang-fusion'
                ? execution.fusion_watchdog_seconds : job.parameters.observe_seconds), 0);
        const watchdog = setTimeout(() => { stopInput(); text += '\nDATA WATCHDOG'; child.kill(); }, allowedSeconds * 1000);
        const cancel = () => { stopInput(); interrupted = true; text += '\nDATA CANCELLED'; child.kill(); };
        process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
        const receive = data => {
            text += data; pending += data;
            const lines = pending.split(/\r?\n/); pending = lines.pop();
            for (const line of lines) {
                if (/^DATA SAVED/.test(line)) {
                    try { tail.drain(); } catch (error) { tail.errors.push({ error: error.message }); }
                    saved++;
                    if (tail.errors.length) child.kill();
                    if (options.interruptAfter && saved >= options.interruptAfter && !interrupted) cancel();
                } else if (/DATA|FAIL:|error:|warning:/i.test(line)) console.log(line);
            }
            if (!connected && !inputStopped && text.includes('DATA WAITING') && text.includes('Initializations complete.')) {
                connected = true;
                for (let i = 0; i < input.connections; i++) {
                    const client = createConnection({ host: '127.0.0.1', port }); clients.push(client);
                    const inputRecord = { client: i, write_count: 0, events: [] };
                    fixtureInput.clients.push(inputRecord);
                    inputStops.push(startInteractiveInput(client, event => {
                        if (event.kind === 'write') inputRecord.write_count++;
                        inputRecord.events.push(event);
                    }, fixtureInput.interval_ms));
                    client.on('data', () => {});
                    client.on('error', error => {
                        stopInput();
                        text += '\nClient error: ' + error.code + '\n';
                        if (error.code === 'ECONNRESET') {
                            clientResets.push({ error: 'Client error: ECONNRESET', client: i });
                            // Allow a bounded stdio/close delivery race, not a lost
                            // client during a live collection. Final classification
                            // still requires the real exit and complete raw tail.
                            resetGrace ??= setTimeout(() => {
                                if (!interrupted && !/DATA (COMPLETE|FAIL|SAMPLE ERROR)/.test(text)
                                    && child.exitCode === null && child.signalCode === null) child.kill();
                            }, 1000);
                            return;
                        }
                        tail.errors.push({ error: 'Client error: ' + (error.code ?? error.message), client: i });
                        child.kill();
                    });
                }
            }
        };
        child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
        child.stdout.on('data', receive); child.stderr.on('data', receive);
        child.once('spawn', () => {
            try { save(join(dirname(sandbox), 'process.json'), { pid: child.pid,
                driver: options.driver, started: new Date(started).toISOString() }); }
            catch (error) { tail.errors.push({ error: '无法保存隔离进程身份：' + error.message }); child.kill(); }
        });
        const cleanup = () => { clearTimeout(watchdog); clearTimeout(resetGrace); stopInput(); clients.forEach(client => client.destroy());
            process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); };
        child.once('error', error => { text += '\nSpawn error: ' + error.code; });
        child.once('close', (code, signal) => {
            cleanup();
            try { tail.drain(); } catch (error) { tail.errors.push({ error: error.message }); }
            const resetOutcome = classifyInteractiveClose({ code, signal, interrupted, text,
                saved, planned: jobs.length, errors: tail.errors.length, incomplete: tail.incompleteBytes });
            fixtureInput.connection_resets = clientResets.map(error => ({ ...error, classification: resetOutcome }));
            if (resetOutcome === 'unexpected') tail.errors.push(...clientResets);
            done({ code, signal, text, pid: child.pid ?? null, interrupted, errors: tail.errors,
                incomplete: tail.incompleteBytes, elapsed: (Date.now() - started) / 1000,
                fixture_metadata: { interactive_input: fixtureInput } });
        });
    });
}
