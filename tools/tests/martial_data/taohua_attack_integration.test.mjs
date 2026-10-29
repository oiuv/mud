import { preOctober29SchoolConditions } from './historical_school_conditions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, sha256 } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { mingjiaoJiuyangFusionProbes, restoreMingjiaoJiuyangFusionProbes }
    from './school_mingjiao_jiuyang_fusion_probes.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { createSandbox, validateQualificationSources, validateRecord } from './execution.mjs';
import { taohuaAttacks, taohuaAttackConditions, taohuaAttackSourcePaths,
    validateTaohuaAttackRecord } from './school_taohua_attack_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaAttackConditions(catalog, read);
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

// Consumer fixtures only: these are not actual attacks or random-frequency evidence.
function actorSnapshot(config, side) {
    const equipped = !!config.equipment;
    const qualification = key => key.includes('/') || key === 'character';
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const unarmed = Math.max(...['unarmed', 'finger', 'strike', 'hand', 'claw', 'cuff']
        .map(key => config.skills[key] ?? 0));
    return {
        ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualification(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualification(key))),
        object: `/tests/actor#${side + 100}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0, fighting_opponent: 1,
        busy: null, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, conditions: null, temp: { apply },
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) => [key,
            Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: `/tests/sword#${side + 200}`, program: '/tests/sword',
            skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100,
            material: null, rigidity: null, no_wield: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
    };
}

function syntheticRecord(condition, { extra = false, result = 0, passive = true, passiveResult = null } = {}) {
    const p = condition.parameters, before = [actorSnapshot(p.actor, 0), actorSnapshot(p.target, 1)];
    const immediate = structuredClone(before);
    const action = extra ? { action: '兰花额外动作合成夹具', weapon: '兰花指', force: 200,
        attack: 100, dodge: 300, parry: 300, damage: 100, damage_type: '点穴' }
        : { action: '普通选招合成夹具', lvl: 0, force: 100, damage: 1, damage_type: '瘀伤' };
    immediate[0].neili -= extra ? 300 : 0;
    const passiveBefore = structuredClone(immediate);
    if (result === 0) { immediate[1].qi -= 100; immediate[1].eff_qi -= 10; }
    const metrics = [{ [result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry']: 1 }, {}];
    for (const side of [0, 1]) for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
        const cost = before[side][key] - immediate[side][key];
        if (cost) metrics[side][key + '_cost'] = cost;
    }
    return { kind: 'sample', condition_id: condition.id, method: 'ordinary', outcome: 'observed',
        before, immediate, after: structuredClone(immediate), metrics, elapsed: 0.01,
        actions: [{ actor: 0, target: 1, skill: p.skill, action }],
        attacks: [{ actor: 0, target: 1, type: 0, result }],
        passives: result === 0 && passive ? [{ actor: 0, target: 1, route: 'martial', skill: p.skill,
            incoming: 100, factor: 0, result: passiveResult,
            before: passiveBefore, after: structuredClone(passiveBefore) }] : [],
        interfaces: [], launches: [], dropped: [], skill_loads: [], refusals: [], terminals: [],
        callbacks: [], defenses: [], dodge_checks: [], reason: '' };
}

test('旧15880完整有序矩阵不变，仅尾追加六门普攻25条件2108/25计划', () => {
    for (const smoke of [false, true]) {
        const all = preOctober29SchoolConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-combo', 'taohua-bihai', 'taohua-passive', 'taohua-combination', 'taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        assert.equal(all.length, 15905);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        // Independently regenerated with preserved tctl-v1 modules and its original F1 catalog.
        assert.equal(sha256(JSON.stringify(all.slice(0, 15880))), smoke
            ? '04e2cb7c1001ee8c559cf047df06b1c46aa3a4a32130a27a8931af0acc5e9753'
            : 'ace805b7b1796125e1bd1c3ce3a238469f736ff97a921f19eb578c5d7942ed5e');
        const tail = all.slice(15880);
        assert.deepEqual(tail, taohuaAttackConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '5bf0d38e682b40a71f223ba3ba1061df671e6f4fbee7418f39d1498322e61fad'
            : 'dab363b293a8da013c5d948872d2e21efc7ddb2d4b2fe489c56b20a16b8acc5f');
        assert.equal(tail.length, 25);
        assert.equal(tail.reduce((n, c) => n + c.samples, 0), smoke ? 25 : 2108);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26204 : 417512);
        assert.ok(tail.every(c => c.method === 'ordinary' && c.parameters.action === 'ordinary'));
    }
});

test('实际冻结新增四文件和34来源，15文件48锚点探针没有扩张', () => {
    const state = snapshot();
    const remainingMingjiaoFiles = [
        'school_mingjiao_remaining_base_cases.mjs',
        'school_mingjiao_remaining_base_cases.test.mjs',
        'school_mingjiao_remaining_base_record.mjs',
        'school_mingjiao_remaining_base_record.test.mjs',
        'school_mingjiao_remaining_base_report.mjs',
        'school_mingjiao_remaining_base_report.test.mjs',
        'school_mingjiao_remaining_base_integration.test.mjs',
        'school_mingjiao_force_remaining_cases.mjs',
        'school_mingjiao_force_remaining_cases.test.mjs',
        'school_mingjiao_force_remaining_record.mjs',
        'school_mingjiao_force_remaining_record.test.mjs',
        'school_mingjiao_force_remaining_report.mjs',
        'school_mingjiao_force_remaining_report.test.mjs',
        'school_mingjiao_combination_cases.mjs',
        'school_mingjiao_combination_cases.test.mjs',
        'school_mingjiao_combination_record.mjs',
        'school_mingjiao_combination_record.test.mjs',
        'school_mingjiao_combination_report.mjs',
        'school_mingjiao_combination_report.test.mjs'];
    for (const name of ['school_taohua_attack_cases.mjs', 'school_taohua_attack.test.mjs',
        'school_taohua_attack_report.test.mjs', 'taohua_attack_integration.test.mjs',
        'runner.lpc', 'execution.mjs', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs',
        ...remainingMingjiaoFiles]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    const comboFiles = ['school_taohua_combo_cases.mjs', 'school_taohua_combo.test.mjs',
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
        'learning_cases.mjs',
        'skill_music_cases.mjs',
        'school_taohua_music_cases.mjs', 'school_taohua_music.test.mjs',
        'school_taohua_npc_cases.mjs', 'school_taohua_npc.test.mjs',
        'skill_music_cases.test.mjs', 'skill_inherited_cases.mjs', 'skill_inherited_cases.test.mjs',
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
        'route_observer.lpc', 'school_mingjiao_route_cases.mjs', 'school_mingjiao_route_cases.test.mjs',
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
        'school_mingjiao_jiuyang_research_cases.mjs',
        'school_mingjiao_jiuyang_research_cases.test.mjs',
        'school_mingjiao_jiuyang_research_observation.mjs',
        'school_mingjiao_jiuyang_research_observation.test.mjs',
        'school_mingjiao_jiuyang_research_report.mjs',
        'school_mingjiao_jiuyang_research_report.test.mjs',
        'school_mingjiao_jiuyang_research_integration.test.mjs',
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
        'school_mingjiao_remaining_perform_cases.mjs',
        'school_mingjiao_remaining_perform_cases.test.mjs',
        'school_mingjiao_remaining_perform_record.mjs',
        'school_mingjiao_remaining_perform_record.test.mjs',
        'school_mingjiao_remaining_perform_report.mjs',
        'school_mingjiao_remaining_perform_report.test.mjs',
        'school_mingjiao_remaining_perform_integration.test.mjs', ...remainingMingjiaoFiles]
        .map(name => 'tools/tests/martial_data/' + name);
    assert.equal(state.files['help/notice'], sha256(read('help/notice')), 'new public notice outside legacy snapshot');
    const slice1Files = ['tools/tests/martial_data/school_slice1_cases.mjs', 'tools/tests/martial_data/school_slice1_cases.test.mjs', 'tools/tests/martial_data/school_slice1_preparation.test.mjs', 'tools/tests/martial_data/school_slice2_cases.mjs', 'tools/tests/martial_data/school_slice2_cases.test.mjs', 'tools/tests/martial_data/school_slice2_preparation.test.mjs', 'tools/tests/martial_data/school_slice3_cases.mjs', 'tools/tests/martial_data/school_slice3_cases.test.mjs', 'tools/tests/martial_data/school_slice3_preparation.test.mjs', 'tools/tests/martial_data/school_slice4_cases.mjs', 'tools/tests/martial_data/school_slice4_cases.test.mjs', 'tools/tests/martial_data/school_slice4_preparation.test.mjs', 'tools/tests/martial_data/school_slice5_cases.mjs', 'tools/tests/martial_data/school_slice5_cases.test.mjs', 'tools/tests/martial_data/school_slice5_preparation.test.mjs', 'tools/tests/martial_data/school_slice6_cases.mjs', 'tools/tests/martial_data/school_slice6_cases.test.mjs', 'tools/tests/martial_data/school_slice6_preparation.test.mjs', 'tools/tests/martial_data/school_slice7_cases.mjs', 'tools/tests/martial_data/school_slice7_cases.test.mjs', 'tools/tests/martial_data/school_slice7_preparation.test.mjs', 'tools/tests/martial_data/school_slice8_cases.mjs', 'tools/tests/martial_data/school_slice8_cases.test.mjs', 'tools/tests/martial_data/school_slice8_preparation.test.mjs', 'tools/tests/martial_data/public_special_cases.mjs', 'tools/tests/martial_data/public_special_cases.test.mjs', 'tools/tests/martial_data/b1_perform_cases.mjs', 'tools/tests/martial_data/b1_perform_cases.test.mjs', 'tools/tests/martial_data/b2_perform_cases.mjs', 'tools/tests/martial_data/b2_perform_cases.test.mjs', 'tools/tests/martial_data/b3_perform_cases.mjs', 'tools/tests/martial_data/b3_perform_cases.test.mjs', 'tools/tests/martial_data/b4_perform_cases.mjs', 'tools/tests/martial_data/b4_perform_cases.test.mjs', 'tools/tests/martial_data/b5_perform_cases.mjs', 'tools/tests/martial_data/b5_perform_cases.test.mjs', 'tools/tests/martial_data/b6_perform_cases.mjs', 'tools/tests/martial_data/b6_perform_cases.test.mjs', 'tools/tests/martial_data/b7_perform_cases.mjs', 'tools/tests/martial_data/b7_perform_cases.test.mjs', 'tools/tests/martial_data/b8_perform_cases.mjs', 'tools/tests/martial_data/b8_perform_cases.test.mjs', 'tools/tests/martial_data/b9_perform_cases.mjs', 'tools/tests/martial_data/b9_perform_cases.test.mjs', 'tools/tests/martial_data/b10_perform_cases.mjs', 'tools/tests/martial_data/b10_perform_cases.test.mjs', 'tools/tests/martial_data/b11_perform_cases.mjs', 'tools/tests/martial_data/b11_perform_cases.test.mjs', 'tools/tests/martial_data/b12_perform_cases.mjs', 'tools/tests/martial_data/b12_perform_cases.test.mjs', 'tools/tests/martial_data/b13_perform_cases.mjs', 'tools/tests/martial_data/b13_perform_cases.test.mjs', 'tools/tests/martial_data/b14_perform_cases.mjs', 'tools/tests/martial_data/b14_perform_cases.test.mjs', 'tools/tests/martial_data/b15_perform_cases.mjs', 'tools/tests/martial_data/b15_perform_cases.test.mjs', 'tools/tests/martial_data/b16_perform_cases.mjs', 'tools/tests/martial_data/b16_perform_cases.test.mjs', 'tools/tests/martial_data/b17_perform_cases.mjs', 'tools/tests/martial_data/b17_perform_cases.test.mjs', 'tools/tests/martial_data/b18_perform_cases.mjs', 'tools/tests/martial_data/b18_perform_cases.test.mjs', 'tools/tests/martial_data/b19_perform_cases.mjs', 'tools/tests/martial_data/b19_perform_cases.test.mjs', 'tools/tests/martial_data/b20_perform_cases.mjs', 'tools/tests/martial_data/b20_perform_cases.test.mjs', 'tools/tests/martial_data/b21_perform_cases.mjs', 'tools/tests/martial_data/b21_perform_cases.test.mjs', 'tools/tests/martial_data/b22_perform_cases.mjs', 'tools/tests/martial_data/b22_perform_cases.test.mjs', 'tools/tests/martial_data/b23_perform_cases.mjs', 'tools/tests/martial_data/b23_perform_cases.test.mjs', 'tools/tests/martial_data/b24_perform_cases.mjs', 'tools/tests/martial_data/b24_perform_cases.test.mjs', 'tools/tests/martial_data/b25_perform_cases.mjs', 'tools/tests/martial_data/b25_perform_cases.test.mjs', 'tools/tests/martial_data/b26_perform_cases.mjs', 'tools/tests/martial_data/b26_perform_cases.test.mjs', 'tools/tests/martial_data/b27_perform_cases.mjs', 'tools/tests/martial_data/b27_perform_cases.test.mjs', 'tools/tests/martial_data/b28_perform_cases.mjs', 'tools/tests/martial_data/b28_perform_cases.test.mjs', 'tools/tests/martial_data/b29_perform_cases.mjs', 'tools/tests/martial_data/b29_perform_cases.test.mjs', 'tools/tests/martial_data/school_quanzhen_combination_cases.mjs', 'tools/tests/martial_data/school_huashan_combination_cases.mjs', 'tools/tests/martial_data/school_slice_combination.test.mjs', 'tools/tests/martial_data/school_slice_combination_cases.mjs', 'tools/tests/martial_data/school_bout_perform.test.mjs', 'tools/tests/martial_data/school_bout_perform_cases.mjs', 'tools/tests/martial_data/school_taohua_bout.test.mjs', 'tools/tests/martial_data/school_taohua_bout_cases.mjs', 'tools/tests/martial_data/school_mingjiao_bout.test.mjs', 'tools/tests/martial_data/school_mingjiao_bout_cases.mjs', 'tools/tests/martial_data/school_huashan_bout.test.mjs', 'tools/tests/martial_data/school_huashan_bout_cases.mjs', 'tools/tests/martial_data/school_quanzhen_bout.test.mjs', 'tools/tests/martial_data/school_quanzhen_bout_cases.mjs', 'tools/tests/martial_data/school_npc_grant_cases.mjs', 'tools/tests/martial_data/school_public_exert_cases.mjs'];
    assert.equal(Object.keys(state.files).filter(path => path !== 'help/notice' && !(comboFiles.includes(path) || slice1Files.includes(path))).length, 10385 + 6 + 22, 'six effect inputs plus 22 named collection and snapshot-test inputs');
    for (const name of ['school_taohua_music_cases.mjs', 'school_taohua_music.test.mjs',
        'school_taohua_npc_cases.mjs', 'school_taohua_npc.test.mjs', 'skill_music_cases.test.mjs',
        'skill_inherited_cases.mjs', 'skill_inherited_cases.test.mjs',
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
        'route_observer.lpc', 'school_mingjiao_route_cases.mjs', 'school_mingjiao_route_cases.test.mjs',
        'school_mingjiao_route_integration.test.mjs', 'school_mingjiao_route_report.mjs',
        'school_mingjiao_route_report.test.mjs']) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    // Only the separately reviewed yanlian probe is projected out of the old 15/48 baseline.
    const fusionPath = 'cmds/skill/yanlian.c';
    const fusionProbes = state.probes.filter(p => p.path === fusionPath);
    assert.equal(fusionProbes.length, 1);
    const fusionSource = read(fusionPath);
    const prepared = mingjiaoJiuyangFusionProbes(fusionSource, { collectionGroup: 'mingjiao-jiuyang-fusion' });
    assert.equal(prepared.sites.length, 17);
    assert.deepEqual(fusionProbes[0], { path: fusionPath, before: sha256(fusionSource),
        after: sha256(prepared.changed), sites: prepared.sites });
    assert.equal(state.files[fusionPath], sha256(fusionSource));
    assert.equal(restoreMingjiaoJiuyangFusionProbes(prepared.changed), fusionSource);
    for (const name of [
        'school_mingjiao_jiuyang_fusion_cases.mjs',
        'school_mingjiao_jiuyang_fusion_cases.test.mjs',
        'school_mingjiao_jiuyang_fusion_observation.mjs',
        'school_mingjiao_jiuyang_fusion_observation.test.mjs',
        'school_mingjiao_jiuyang_fusion_probes.mjs',
        'school_mingjiao_jiuyang_fusion_probes.test.mjs',
        'school_mingjiao_jiuyang_fusion_record.mjs',
        'school_mingjiao_jiuyang_fusion_record.test.mjs',
        'school_mingjiao_jiuyang_fusion_report.mjs',
        'school_mingjiao_jiuyang_fusion_report.test.mjs',
        'school_mingjiao_jiuyang_fusion_integration.test.mjs',
        'jiuyang_fusion_receivers.h',
    ]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    const historicalProbes = state.probes.filter(p => p.path !== fusionPath);
    assert.equal(historicalProbes.length, 15);
    assert.equal(historicalProbes.reduce((n, p) => n + p.sites.length, 0), 48);
    assert.equal(sha256(JSON.stringify(historicalProbes)),
        'f348cc66c355fe076d78cbf6d897ec962168f3c6e4d8369caf9248dda9deac6a');
    assert.equal(taohuaAttackSourcePaths.length, 34);
    assert.equal(new Set(taohuaAttackSourcePaths).size, 34);
    for (const c of conditions) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaAttackSourcePaths);
        assert.deepEqual(c.parameters.qualification_sources, taohuaAttackSourcePaths);
        assert.equal(sha256(JSON.stringify(Object.entries(c.parameters.source_evidence))),
            '7c3db68228cb7aef8d73bb8d068b7a0ef233224a7f507e3619784c69ebb623f5');
        assert.equal(c.entry_id, `kungfu/skill/${c.parameters.skill}.c`);
    }
    validateQualificationSources(conditions, state.files);
});

test('34项来源和原ordinary入口拒绝缺项、换序、漂移与错绑', () => {
    const files = snapshot().files, original = conditions[0];
    for (const path of taohuaAttackSourcePaths) {
        const missing = structuredClone(original);
        delete missing.parameters.source_evidence[path];
        assert.throws(() => validateQualificationSources([missing], files), '缺少来源 ' + path);
        const missingQualification = structuredClone(original);
        missingQualification.parameters.qualification_sources = taohuaAttackSourcePaths.filter(p => p !== path);
        assert.throws(() => validateQualificationSources([missingQualification], files), '缺少资格来源 ' + path);
        for (const value of ['not-a-sha256', '0'.repeat(64)]) {
            const changed = structuredClone(original);
            changed.parameters.source_evidence[path] = value;
            assert.throws(() => validateQualificationSources([changed], files), '来源漂移 ' + path);
        }
        const absentCopy = { ...files };
        delete absentCopy[path];
        assert.throws(() => validateQualificationSources([original], absentCopy), '未复制 ' + path);
        assert.throws(() => validateQualificationSources([original], { ...files, [path]: '0'.repeat(64) }),
            '实际副本摘要漂移 ' + path);
    }
    for (const mutate of [
        c => { c.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64); },
        c => { c.parameters.qualification_sources.push('kungfu/skill/unknown.c'); },
        c => { c.parameters.qualification_sources.reverse(); },
        c => { delete c.parameters.qualification_sources; },
        c => { c.parameters.source_evidence = null; },
        c => { c.parameters.skill = 'unknown'; },
        c => { c.parameters.usage = 'axe'; },
        c => { c.parameters.ability = 'perform'; },
        c => { c.parameters.action = 'perform hand.fu right'; },
        c => { c.method = 'perform'; },
        c => { c.entry_id += ':query_action'; },
    ]) {
        const bad = structuredClone(original);
        mutate(bad);
        assert.throws(() => validateQualificationSources([bad], files));
    }
});

test('全部25原形合成经公共、school分派、专用三层且不改写记录', () => {
    for (const condition of conditions) {
        const extra = ['extra-enabled', 'minimum-extra'].includes(condition.parameters.variant);
        const raw = syntheticRecord(condition, { extra }), original = JSON.stringify(raw);
        validateRecord(raw, condition);
        assert.deepEqual(validateSchoolCombatRecord(raw, condition), validateTaohuaAttackRecord(raw, condition));
        assert.equal(JSON.stringify(raw), original, '消费者不可改写原记录 ' + condition.id);
        assert.equal(Object.hasOwn(raw, 'command_accepted'), false,
            '普通攻击直接走原do_attack，不捏造command成本');
    }
    for (const style of taohuaAttacks) {
        const condition = conditions.find(c => c.parameters.skill === style.skill);
        for (const result of [0, -1, -2]) {
            const raw = syntheticRecord(condition, { result });
            validateRecord(raw, condition);
            validateSchoolCombatRecord(raw, condition);
            validateTaohuaAttackRecord(raw, condition);
        }
        const noPassive = syntheticRecord(condition, { passive: false });
        validateRecord(noPassive, condition);
        validateSchoolCombatRecord(noPassive, condition);
    }
});

test('实际三层消费保留空回调、选招前费用、资源身份及有限磨损约束', () => {
    const condition = conditions.find(c => c.parameters.skill === 'lanhua-shou'
        && c.parameters.variant === 'extra-enabled');
    for (const result of [0, -1, -2]) for (const passiveResult of [0, null]) {
        const raw = syntheticRecord(condition, { extra: true, result, passiveResult });
        validateRecord(raw, condition);
        validateSchoolCombatRecord(raw, condition);
        assert.equal(raw.metrics[0].neili_cost, 300, '原选招扣费不能按最后命中回滚');
        assert.equal(raw.before[0].neili - raw.immediate[0].neili, 300);
    }
    for (const mutate of [
        r => { r.condition_id = 'other'; }, r => { r.method = 'perform'; },
        r => { r.before[0].wizardp = 1; }, r => { r.before[0].fighting_opponent = 0; },
        r => { r.before[0].cultivation['family/family_name'] = '其他门派'; },
        r => { delete r.before[0].secondary_weapon; }, r => { delete r.immediate[1].conditions; },
        r => { r.actions.push(structuredClone(r.actions[0])); }, r => { r.actions[0].skill = 'another'; },
        r => { r.attacks[0].type = 2; }, r => { r.attacks[0].result = 1; },
        r => { r.metrics[0].hit = 99; }, r => { r.metrics[0].hit = null; },
        r => { r.metrics[0].hit = -1; }, r => { delete r.metrics[0].hit; },
        r => { r.metrics[1].hit = 1; }, r => { r.metrics[0].quick = 1; },
        r => { r.metrics[1].riposte = 1; }, r => { r.metrics[0].heartbeats = 1; },
        r => { r.metrics[0].neili_cost = 0; }, r => { r.metrics[0].neili_recovery = 1; },
        r => { r.passives[0].actor = 1; }, r => { r.passives[0].route = 'force'; },
        r => { delete r.passives[0].result; }, r => { r.passives[0].result = 1; },
        r => { r.passives[0].after[0].neili++; },
        r => { delete r.before[1].weapon_details.rigidity; },
        r => { delete r.before[1].weapon_details.no_wield; },
    ]) {
        const bad = syntheticRecord(condition, { extra: true });
        mutate(bad);
        bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateSchoolCombatRecord(bad, condition));
        assert.throws(() => validateTaohuaAttackRecord(bad, condition));
    }
    const armed = conditions.find(c => c.parameters.skill === 'luoying-shenjian');
    const badPublic = syntheticRecord(armed);
    badPublic.before[0].weapon_details.program = '/tests/unknown';
    assert.throws(() => validateRecord(badPublic, armed), '公共装备校验仍实际执行');
    const worn = syntheticRecord(armed);
    worn.immediate[0].weapon_details.consistence = 99;
    worn.after = structuredClone(worn.immediate);
    validateRecord(worn, armed);
    validateSchoolCombatRecord(worn, armed);
    for (const [result, side] of [[-1, 0], [-2, 0], [0, 1]]) {
        const invalidWear = syntheticRecord(armed, { result });
        invalidWear.immediate[side].weapon_details.consistence = 99;
        invalidWear.after = structuredClone(invalidWear.immediate);
        assert.throws(() => validateSchoolCombatRecord(invalidWear, armed));
    }
});

test('runner仅复用已选动作和被动快照，普通攻击一次且不重选或加新探针', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), take = body(runner, 'snapshot');
    for (const name of ['observe_selected_action', 'begin_passive', 'observe_passive']) {
        const observe = body(runner, name);
        assert.match(observe, /member_array\(current\["parameters"\]\["collection_group"\],[\s\S]*?"taohua-attack"/);
        assert.doesNotMatch(observe, /->(?:query_action|do_attack|force_me|hit_ob)\(/);
    }
    assert.match(body(runner, 'observe_selected_action'), /"action": serializable\(action\)/);
    assert.match(body(runner, 'begin_passive'), /passive_before\[route\] = \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    assert.match(body(runner, 'observe_passive'), /"result": serializable\(result\)/);
    assert.match(body(runner, 'observe_passive'), /current\["passives"\]\[<1\]\["before"\] = passive_before\[route\]/);
    assert.match(take, /member_array\(current\["parameters"\]\["collection_group"\],[\s\S]*?"taohua-attack"[\s\S]*?result\["fighting_opponent"\]/);
    assert.match(take, /result\["conditions"\] = serializable\(ob->query_condition\(\)\)/);
    const branch = /member_array\(current\["parameters"\]\["collection_group"\],\s+\(\{ "taohua-attack", "taohua-passive", "taohua-combination"[^}]*\}\)\) != -1\)\s*\{([\s\S]*?)\n    \}/.exec(take);
    assert.ok(branch, '独立只读ATTACK快照分支');
    assert.match(branch[1], /result\["cultivation"\]\["character"\] = ob->query\("character"\)/);
    assert.match(branch[1], /secondary = ob->query_temp\("secondary_weapon"\)/);
    assert.match(branch[1], /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(branch[1], /ob->(?:set|add|delete|query_action|start_busy|stop_busy)\(/);
    const prepare = body(runner, 'prepare_actor');
    assert.match(prepare, /current\["parameters"\]\["named_participants"\]/);
    assert.match(prepare, /ob->set_name\([\s\S]*?side \? "right" : "left"/);
    assert.match(prepare, /ob->observation_heartbeat\(0\)/);
    const perform = body(runner, 'perform_sample');
    const ordinary = /if \(action == "ordinary"\)\s*\{([\s\S]*?)\n    \} else \{/.exec(perform);
    assert.ok(ordinary, '保留公共普通攻击分支');
    assert.equal((ordinary[1].match(/COMBAT_D->do_attack\(/g) ?? []).length, 1);
    assert.match(ordinary[1], /COMBAT_D->do_attack\(\s*players\[0\],\s*players\[1\],\s*players\[0\]->query_temp\("weapon"\),\s*TYPE_REGULAR\s*\)/);
    assert.doesNotMatch(ordinary[1], /query_action|force_me|random\(|call_out\(/);
    assert.doesNotMatch(body(runner, 'observe_direct'), /"taohua-attack"/);
    assert.doesNotMatch(runner, /#include\s+["<]taohua_attack_receivers\.h[">]/);
});
