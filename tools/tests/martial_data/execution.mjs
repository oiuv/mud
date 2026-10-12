import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { createConnection, createServer } from 'node:net';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { applyProbes } from '../../bench_weapon_balance.mjs';
import { buildInventory, collectVersions, isInside, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { coverage, coverageMarkdown, createSeries, digest, openSeries } from './ledger.mjs';
import { attemptImporter, jsonlTail, missingJobs, sampleImporter, seriesLock, verifyAttemptStopped, verifyResume } from './continuation.mjs';
import { weaponConditions, profiles } from './weapon_cases.mjs';
import { abilityConditions, validateAbilityRecord } from './ability_cases.mjs';
import { boutConditions, validateBoutRecord } from './bout_cases.mjs';
import { weaponSpecialConditions, validateWeaponSpecialRecord } from './weapon_special_cases.mjs';
import { schoolRelations } from './school_relations.mjs';
import { teachingConditions, teachingEntries } from './teaching_cases.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { npcEntries } from './school_emei_npc_cases.mjs';
import { schoolTeamConditions, validateSchoolTeamRecord } from './school_team_cases.mjs';
import { schoolSceneConditions, sceneEntries, validateSchoolSceneRecord } from './school_scene_cases.mjs';
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

const git = (root, args) => execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024,
}).trim();
const put = (path, content) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); };
const save = (path, value) => put(path, JSON.stringify(value, null, 2) + '\n');

export function collectionInput(jobs, fault) {
    const connections = jobs.some(job => job.parameters?.extra_target) ? 3 : 2;
    const text = JSON.stringify({ jobs, fault, ...(connections === 3 ? { connections } : {}) }, null, 2) + '\n';
    const bytes = Buffer.byteLength(text, 'utf8');
    // read_file otherwise silently stops at the driver's default 256 KiB.
    // These capacities only belong to the temporary collection instance.
    const limits = {
        'maximum read file size': Math.max(262144, bytes + 1),
        'maximum string length': Math.max(1048576, bytes + 1),
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

export function createSandbox(root, output) {
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
    for (const name of ['master', 'runner', 'throwing', 'actor', 'cloth', 'teaching_actor', 'teaching_observer', 'formation_observer', 'challenge_observer', 'scene_observer', 'team_observer', 'team_room', 'bystander_room', 'npc_observer']) copy(`tools/tests/martial_data/${name}.lpc`, `tests/${name}.lpc`);
    copy('tools/tests/martial_data/npc_bout_receivers.h', 'tests/npc_bout_receivers.h');
    copy('tools/tests/martial_data/taohua_ding_receivers.h', 'tests/taohua_ding_receivers.h');
    copy('tools/tests/martial_data/taohua_xiao_receivers.h', 'tests/taohua_xiao_receivers.h');
    copy('tools/tests/martial_data/taohua_po_receivers.h', 'tests/taohua_po_receivers.h');
    copy('tools/tests/martial_data/taohua_zhuan_receivers.h', 'tests/taohua_zhuan_receivers.h');
    const template = readFileSync(join(root, 'tools/tests/weapon_balance/weapon.lpc'), 'utf8');
    files['tools/tests/weapon_balance/weapon.lpc'] = sha256(template);
    for (const type of profiles.map(p => p.type).filter(type => type !== 'throwing')) {
        putCopy(`tests/${type}.lpc`, template.replaceAll('AXE', type.toUpperCase()).replaceAll('init_axe', 'init_' + type));
    }
    const craftedPath = 'tools/tests/martial_data/crafted_weapon.lpc';
    const crafted = readFileSync(join(root, craftedPath), 'utf8');
    files[craftedPath] = sha256(crafted);
    for (const type of ['sword', 'hammer'])
        putCopy(`tests/crafted_${type}.lpc`, crafted.replaceAll('AXE', type.toUpperCase()).replaceAll('init_axe', 'init_' + type));
    for (const path of ['tools/collect_martial_data.mjs', 'tools/bench_weapon_balance.mjs',
        ...['execution', 'continuation', 'inventory', 'catalog', 'ledger', 'weapon_cases', 'ability_cases', 'bout_cases', 'weapon_special_cases',
            'school_relations', 'school_dependencies', 'teaching_cases', 'teaching_report', 'statistics', 'hong_learning_cases', 'chen_learning_cases', 'quanzhen_learning_cases', 'wudang_learning_cases', 'shaolin_learning_cases', 'shaolin_teachers_cases', 'shaolin_recruit_cases', 'recruit_observation', 'shaolin_promotion_cases', 'promotion_observation',
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
        'school_taohua_combination_report.test.mjs', 'school_taohua_combination_integration.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        files[path] = sha256(readFileSync(join(root, path)));
    }
    putCopy('adm/etc/wizlist', '# No wizard accounts in the isolated test.\n');
    for (const path of ['adm/daemons/combatd.c', 'cmds/skill/perform.c', 'cmds/skill/exert.c', 'kungfu/skill/dugu-jiujian/qi.c',
        'kungfu/skill/taiji-quan.c', 'feature/condition.c', 'kungfu/skill/fireice-strike/binghuo.c', 'feature/equip.c',
        'kungfu/skill/bingpo-shenzhen/bing.c', 'feature/action.c', 'inherit/char/char.c',
        'inherit/char/npc.c', 'feature/damage.c', 'adm/daemons/chard.c', 'kungfu/skill/tanzhi-shentong/ding.c']) {
        const original = readFileSync(join(root, path), 'utf8');
        assert.equal(sha256(original), files[path], '快照复制期间源码改变：' + path);
        const probe = path === 'kungfu/skill/tanzhi-shentong/ding.c' ? taohuaDingTimerProbes(original)
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
        const secondary = ['gumu-unarmed-learning', 'taohua-zhuan'].includes(condition.parameters.collection_group)
            && equipment.slot === 'secondary_weapon';
        const details = raw.before[0][secondary ? 'secondary_weapon_details' : equipment.hold ? 'handing_details' : 'weapon_details'];
        const crafted = condition.parameters.collection_group === 'gumu-advanced' && equipment.item_make;
        const originalNeedle = ['gumu-throwing', 'gumu-needle-lifecycle'].includes(condition.parameters.collection_group);
        const originalPo = condition.parameters.collection_group === 'taohua-po';
        if (originalPo) {
            assert.equal(equipment.hold, true, 'PO演员必须通过原hand持物');
            assert.ok(['/d/items/throwing/taohua_ban', '/tests/sword'].includes(equipment.program),
                'PO演员原物品路径不在明确清单');
        }
        assert.equal(details.program, originalNeedle || originalPo ? equipment.program
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
    return options.case ? conditions.filter(c => c.id === options.case)
        : options.casePrefix ? conditions.filter(c => c.id.startsWith(options.casePrefix)) : conditions;
}

export function validateExpectedOutcomes(conditions) {
    for (const condition of conditions) {
        const expected = [].concat(condition.parameters?.expected ?? []);
        assert.ok(expected.length && expected.every(value =>
            ['observed', 'refused', 'error', 'not_applicable'].includes(value)),
        '采集条件缺少有效结果声明：' + condition.id);
    }
}

export function validateQualificationSources(conditions, files) {
    for (const condition of conditions) {
        if (condition.parameters.collection_group === 'taohua-combination') {
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
        'school-scene': schoolSceneConditions,
        teaching: () => teachingConditions(relations, catalog).map(c => ({ ...c,
            samples: options.smoke ? 1 : c.samples })) }[collection];
    const allConditions = existing?.identity.conditions ?? makeConditions(catalog, options);
    const conditions = existing ? allConditions : selectConditions(allConditions, options);
    assert.ok(conditions.length, '条件不存在：' + (options.case ?? options.casePrefix));
    validateExpectedOutcomes(conditions);
    // Hash without writing first. A refused resume never changes old snapshots.
    const snapshot = createSandbox(root);
    validateQualificationSources(conditions, snapshot.files);
    for (const file of inventory.files) assert.equal(snapshot.files[file.path], file.sha256,
        '快照与清单期间源码改变：' + file.path);
    const execution = { collection, driver: inventory.versions.driver,
        node: inventory.versions.node, tokenizer: inventory.versions.tokenizer,
        source_files: snapshot.files, probes: snapshot.probes, gametick_ms: 1000, heartbeat_ms: 1000,
        smoke: existing?.identity.execution.smoke ?? options.smoke,
        injected_fault: existing?.identity.execution.injected_fault ?? options.injectedFault ?? null };
    if (existing) verifyResume(existing, inventory, catalog, execution);
    const manifest = existing ?? createSeries(output, { inventory, catalog, conditions, execution,
        teachingEntries: collection === 'teaching' ? teachingEntries(conditions) : [],
        npcEntries: collection === 'school-combat' ? npcEntries(conditions) : [],
        sceneEntries: collection === 'school-scene' ? sceneEntries(conditions) : [] });
    if (!existing) {
        save(join(output, 'inventory.json'), inventory); save(join(output, 'catalog.json'), catalog);
        if (relations) save(join(output, 'school-relations.json'), relations);
    }
    const importer = sampleImporter(output, manifest, (raw, condition) => {
        validateRecord(raw, condition);
        if (collection === 'abilities' && raw.outcome !== 'error') validateAbilityRecord(raw);
        if (collection === 'bouts') validateBoutRecord(raw, condition);
        if (collection === 'weapon-special' && raw.outcome !== 'error') validateWeaponSpecialRecord(raw, condition);
        if (collection === 'teaching') validateTeachingRecord(raw, condition);
        if (collection === 'school-combat') validateSchoolCombatRecord(raw, condition);
        if (collection === 'school-team') validateSchoolTeamRecord(raw, condition);
        if (collection === 'school-scene') validateSchoolSceneRecord(raw, condition);
    });
    const runs = join(output, 'runs'); mkdirSync(runs, { recursive: true });
    // A killed collector may have left complete raw rows not yet imported.
    for (const name of readdirSync(runs).sort()) {
        const directory = join(runs, name);
        verifyAttemptStopped(directory);
        const request = JSON.parse(readFileSync(join(directory, 'request.json'), 'utf8'));
        assert.equal(request.fingerprint, manifest.fingerprint, '历史运行不属于当前系列');
        const tail = jsonlTail(join(directory, 'mudlib/log/events.jsonl'),
            attemptImporter(request.jobs, raw => importer.accept(raw)));
        tail.drain();
        assert.equal(tail.errors.length, 0, '历史完整记录验证失败，保留现场，不自动重跑');
    }
    let jobs = missingJobs(manifest, importer.rows, options.case);
    const started = Date.now();
    while (jobs.length) {
        const run = mkdtempSync(join(runs, 'attempt-'));
        save(join(run, 'request.json'), { fingerprint: manifest.fingerprint, created: new Date().toISOString(),
            jobs: jobs.map(job => ({ condition_id: job.condition_id, index: job.index })),
            interrupt_after: options.interruptAfter ?? null });
        const current = createSandbox(root, run);
        assert.equal(digest(current.files), digest(snapshot.files), '启动前文件变化，必须新建系列');
        assert.equal(digest(current.probes), digest(snapshot.probes), '启动前探针变化');
        const before = importer.imported;
        const result = await runAttempt(current.sandbox, options, jobs, execution.injected_fault,
            attemptImporter(jobs, raw => importer.accept(raw)));
        put(join(run, 'driver-output.txt'), result.text);
        save(join(run, 'result.json'), { elapsed_seconds: result.elapsed, process: { pid: result.pid, code: result.code,
            signal: result.signal }, interrupted: result.interrupted, validation_errors: result.errors,
            incomplete_bytes: result.incomplete, imported: importer.imported - before,
            driver_output_sha256: sha256(result.text) });
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

async function runAttempt(sandbox, options, jobs, fault, accept) {
    const input = collectionInput(jobs, fault);
    put(join(sandbox, 'tests/options.json'), input.text);
    const port = await freePort();
    put(join(sandbox, 'driver.cfg'), ['name : Martial Data Collection', 'mud ip : 127.0.0.1', `port number : ${port}`,
        'mudlib directory : ' + sandbox.replaceAll('\\', '/'), 'log directory : /log', 'debug log file : debug.log',
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
        const allowedSeconds = 120 + jobs.reduce((n, job) => n + 3 + job.parameters.observe_seconds, 0);
        const watchdog = setTimeout(() => { text += '\nDATA WATCHDOG'; child.kill(); }, allowedSeconds * 1000);
        const cancel = () => { interrupted = true; text += '\nDATA CANCELLED'; child.kill(); };
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
            if (!connected && text.includes('DATA WAITING') && text.includes('Initializations complete.')) {
                connected = true;
                for (let i = 0; i < input.connections; i++) {
                    const client = createConnection({ host: '127.0.0.1', port }); clients.push(client);
                    client.on('data', () => {});
                    client.on('error', error => {
                        if (error.code === 'ECONNRESET' && (/DATA (COMPLETE|FAIL|SAMPLE ERROR)/.test(text) || interrupted)) return;
                        text += '\nClient error: ' + error.code; child.kill();
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
        const cleanup = () => { clearTimeout(watchdog); clients.forEach(client => client.destroy());
            process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); };
        child.once('error', error => { text += '\nSpawn error: ' + error.code; });
        child.once('close', (code, signal) => {
            cleanup();
            try { tail.drain(); } catch (error) { tail.errors.push({ error: error.message }); }
            done({ code, signal, text, pid: child.pid ?? null, interrupted, errors: tail.errors,
                incomplete: tail.incompleteBytes, elapsed: (Date.now() - started) / 1000 });
        });
    });
}
