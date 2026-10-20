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
import { taohuaControlConditions, taohuaControlSourcePaths,
    validateTaohuaControlRecord } from './school_taohua_control_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaControlConditions(catalog, read);
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

// Explicit synthetic consumer fixtures, not actual samples or a random-frequency oracle.
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
        busy: config.busy ?? null, skills: structuredClone(config.skills), mappings: structuredClone(config.mappings),
        preparations: structuredClone(config.preparations), learned: {}, temp: { apply },
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

function syntheticRecord(condition) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [actorSnapshot(p.actor, 0), actorSnapshot(p.target, 1)];
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        command_accepted: accepted ? 23 : 0, before, immediate: structuredClone(before), after: [],
        metrics: [{}, {}], launches: [], refusals: [], attacks: [], dropped: [], terminals: [],
        callbacks: [], passives: [], defenses: [], interfaces: [], dodge_checks: [], reason: '', elapsed: 0.01 };
    if (accepted) {
        const hit = p.gate_expectation !== 'miss';
        raw.launches.push({ actor: before[0].object, skill: p.skill, argument: p.ability + ' right' });
        raw.metrics[0].ability_launched = 1;
        const fee = p.ability === 'fu' ? (hit ? 100 : 0) : (hit ? 80 : 180);
        if (fee) raw.metrics[0].neili_cost = fee;
        raw.immediate[0].neili -= fee;
        if (p.ability === 'fu') raw.immediate[0].busy = hit ? 1 : 2;
        else if (!hit) raw.immediate[0].busy = 1;
        if (hit) raw.immediate[1].busy = p.ability === 'fu'
            ? Math.trunc(before[0].effective_skills.hand / 30) + 2
            : Math.trunc(before[0].skills[p.skill] / 22) + 1;
        raw.immediate[0].learned[p.skill] = 1;
        raw.immediate[0].temp.notify_fail = '你所使用的外功中没有这种功能。\n';
    } else {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        raw.refusals.push({ actor: before[0].object, reason: raw.reason });
        raw.immediate[0].temp.notify_fail = p.refusal;
    }
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('旧15853完整有序条件不变，仅尾追加纯控制27条件1034/54计划', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-attack', 'taohua-combo', 'taohua-bihai', 'taohua-passive', 'taohua-combination', 'taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout'].includes(c.parameters.collection_group));
        assert.equal(all.length, 15880);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        // Recomputed from the preserved tdd-v1 generator, not the changing shared registry.
        assert.equal(sha256(JSON.stringify(all.slice(0, 15853))), smoke
            ? 'bb1ea4e06e3ca59f46c463b7af9974b70e79eb90c3db91ad6ccf46e92091d92c'
            : '90bde1cd12d3b829a8961fe087c5e017cf053eabf74a59723a8167c4827b227f');
        const tail = all.slice(15853);
        assert.deepEqual(tail, taohuaControlConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? '1d6d039c4af6eee41187809511f35d21822395d8ef0e896c9db365a514cea81b'
            : '4ca1afa364c2b385615aaaeae13016b5da2c945efafc59972f6f8b7cd8896b6f');
        assert.equal(tail.length, 27);
        assert.equal(tail.reduce((sum, c) => sum + c.samples, 0), smoke ? 54 : 1034);
        assert.equal(all.reduce((sum, c) => sum + c.samples, 0), smoke ? 26179 : 415404);
        assert.ok(tail.every(c => !Object.hasOwn(c.parameters, 'qualification_sources')),
            '保留原source_evidence协议，不虚增资格字段');
    }
});

test('实际冻结新增四文件及既有依赖，15文件48位点探针保持不变', () => {
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
    for (const name of ['school_taohua_control_cases.mjs', 'school_taohua_control.test.mjs',
        'taohua_control_integration.test.mjs', 'school_taohua_control_report.test.mjs',
        'runner.lpc', 'execution.mjs', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs',
        ...remainingMingjiaoFiles]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    const attackFiles = ['school_taohua_attack_cases.mjs', 'school_taohua_attack.test.mjs',
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
    assert.equal(Object.keys(state.files).filter(path => path !== 'help/notice' && !(attackFiles.includes(path) || ['tools/tests/martial_data/school_taohua_force_cases.mjs', 'tools/tests/martial_data/school_taohua_force.test.mjs', 'tools/tests/martial_data/school_taohua_force_report.test.mjs', 'tools/tests/martial_data/school_taohua_learning_cases.mjs', 'tools/tests/martial_data/school_taohua_learning.test.mjs', 'tools/tests/martial_data/school_slice1_cases.mjs', 'tools/tests/martial_data/school_slice1_cases.test.mjs', 'tools/tests/martial_data/school_slice1_preparation.test.mjs', 'tools/tests/martial_data/school_slice2_cases.mjs', 'tools/tests/martial_data/school_slice2_cases.test.mjs', 'tools/tests/martial_data/school_slice2_preparation.test.mjs', 'tools/tests/martial_data/school_slice3_cases.mjs', 'tools/tests/martial_data/school_slice3_cases.test.mjs', 'tools/tests/martial_data/school_slice3_preparation.test.mjs', 'tools/tests/martial_data/school_slice4_cases.mjs', 'tools/tests/martial_data/school_slice4_cases.test.mjs', 'tools/tests/martial_data/school_slice4_preparation.test.mjs', 'tools/tests/martial_data/school_slice5_cases.mjs', 'tools/tests/martial_data/school_slice5_cases.test.mjs', 'tools/tests/martial_data/school_slice5_preparation.test.mjs', 'tools/tests/martial_data/school_slice6_cases.mjs', 'tools/tests/martial_data/school_slice6_cases.test.mjs', 'tools/tests/martial_data/school_slice6_preparation.test.mjs', 'tools/tests/martial_data/school_slice7_cases.mjs', 'tools/tests/martial_data/school_slice7_cases.test.mjs', 'tools/tests/martial_data/school_slice7_preparation.test.mjs', 'tools/tests/martial_data/school_slice8_cases.mjs', 'tools/tests/martial_data/school_slice8_cases.test.mjs', 'tools/tests/martial_data/school_slice8_preparation.test.mjs', 'tools/tests/martial_data/public_special_cases.mjs', 'tools/tests/martial_data/public_special_cases.test.mjs', 'tools/tests/martial_data/b1_perform_cases.mjs', 'tools/tests/martial_data/b1_perform_cases.test.mjs', 'tools/tests/martial_data/b2_perform_cases.mjs', 'tools/tests/martial_data/b2_perform_cases.test.mjs', 'tools/tests/martial_data/b3_perform_cases.mjs', 'tools/tests/martial_data/b3_perform_cases.test.mjs', 'tools/tests/martial_data/b4_perform_cases.mjs', 'tools/tests/martial_data/b4_perform_cases.test.mjs', 'tools/tests/martial_data/b5_perform_cases.mjs', 'tools/tests/martial_data/b5_perform_cases.test.mjs', 'tools/tests/martial_data/b6_perform_cases.mjs', 'tools/tests/martial_data/b6_perform_cases.test.mjs', 'tools/tests/martial_data/b7_perform_cases.mjs', 'tools/tests/martial_data/b7_perform_cases.test.mjs', 'tools/tests/martial_data/b8_perform_cases.mjs', 'tools/tests/martial_data/b8_perform_cases.test.mjs', 'tools/tests/martial_data/b9_perform_cases.mjs', 'tools/tests/martial_data/b9_perform_cases.test.mjs', 'tools/tests/martial_data/b10_perform_cases.mjs', 'tools/tests/martial_data/b10_perform_cases.test.mjs', 'tools/tests/martial_data/b11_perform_cases.mjs', 'tools/tests/martial_data/b11_perform_cases.test.mjs', 'tools/tests/martial_data/b12_perform_cases.mjs', 'tools/tests/martial_data/b12_perform_cases.test.mjs', 'tools/tests/martial_data/b13_perform_cases.mjs', 'tools/tests/martial_data/b13_perform_cases.test.mjs', 'tools/tests/martial_data/b14_perform_cases.mjs', 'tools/tests/martial_data/b14_perform_cases.test.mjs', 'tools/tests/martial_data/b15_perform_cases.mjs', 'tools/tests/martial_data/b15_perform_cases.test.mjs', 'tools/tests/martial_data/b16_perform_cases.mjs', 'tools/tests/martial_data/b16_perform_cases.test.mjs', 'tools/tests/martial_data/b17_perform_cases.mjs', 'tools/tests/martial_data/b17_perform_cases.test.mjs', 'tools/tests/martial_data/b18_perform_cases.mjs', 'tools/tests/martial_data/b18_perform_cases.test.mjs', 'tools/tests/martial_data/b19_perform_cases.mjs', 'tools/tests/martial_data/b19_perform_cases.test.mjs', 'tools/tests/martial_data/b20_perform_cases.mjs', 'tools/tests/martial_data/b20_perform_cases.test.mjs', 'tools/tests/martial_data/b21_perform_cases.mjs', 'tools/tests/martial_data/b21_perform_cases.test.mjs', 'tools/tests/martial_data/b22_perform_cases.mjs', 'tools/tests/martial_data/b22_perform_cases.test.mjs', 'tools/tests/martial_data/b23_perform_cases.mjs', 'tools/tests/martial_data/b23_perform_cases.test.mjs', 'tools/tests/martial_data/b24_perform_cases.mjs', 'tools/tests/martial_data/b24_perform_cases.test.mjs', 'tools/tests/martial_data/b25_perform_cases.mjs', 'tools/tests/martial_data/b25_perform_cases.test.mjs', 'tools/tests/martial_data/b26_perform_cases.mjs', 'tools/tests/martial_data/b26_perform_cases.test.mjs', 'tools/tests/martial_data/b27_perform_cases.mjs', 'tools/tests/martial_data/b27_perform_cases.test.mjs', 'tools/tests/martial_data/b28_perform_cases.mjs', 'tools/tests/martial_data/b28_perform_cases.test.mjs', 'tools/tests/martial_data/b29_perform_cases.mjs', 'tools/tests/martial_data/b29_perform_cases.test.mjs'].includes(path))).length, 10376);
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
    assert.equal(taohuaControlSourcePaths.length, 28);
    assert.equal(new Set(taohuaControlSourcePaths).size, 28);
    for (const c of conditions) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaControlSourcePaths);
        assert.equal(sha256(JSON.stringify(c.parameters.source_evidence)),
            '5f59018a931cfbdee9066385ae2f8601617964468d07695ea141cc367c642f9c');
    }
    validateQualificationSources(conditions, state.files);
});

test('28项来源拒绝缺项、多项、错误摘要和副本漂移，入口及两来源绑定', () => {
    const files = snapshot().files, original = conditions[0];
    for (const path of taohuaControlSourcePaths) {
        const missing = structuredClone(original);
        delete missing.parameters.source_evidence[path];
        assert.throws(() => validateQualificationSources([missing], files), '缺少 ' + path);
        for (const value of ['not-a-sha256', '0'.repeat(64)]) {
            const changed = structuredClone(original);
            changed.parameters.source_evidence[path] = value;
            assert.throws(() => validateQualificationSources([changed], files), '来源漂移 ' + path);
        }
        const absentCopy = { ...files };
        delete absentCopy[path];
        assert.throws(() => validateQualificationSources([original], absentCopy), '未复制 ' + path);
        assert.throws(() => validateQualificationSources([original], { ...files, [path]: '0'.repeat(64) }),
            '副本漂移 ' + path);
    }
    const extra = structuredClone(original);
    extra.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64);
    assert.throws(() => validateQualificationSources([extra], files));
    for (const ability of ['fu', 'sui']) {
        const condition = conditions.find(c => c.parameters.ability === ability);
        for (const mutate of [
            c => { c.parameters.ability_source.sha256 = '0'.repeat(64); },
            c => { c.parameters.base_source.sha256 = '0'.repeat(64); },
            c => { c.parameters.ability_source.path = c.parameters.base_source.path; },
            c => { c.parameters.base_source.path = c.parameters.ability_source.path; },
            c => { c.parameters.ability_source.entry_id += ':wrong'; },
            c => { c.entry_id += ':wrong'; },
        ]) {
            const bad = structuredClone(condition);
            mutate(bad);
            assert.throws(() => validateQualificationSources([bad], files), ability);
        }
    }
});

test('27条件原形合成记录经公共、school分派、专用三层消费且不回写', () => {
    for (const condition of conditions) {
        const raw = syntheticRecord(condition), before = JSON.stringify(raw);
        validateRecord(raw, condition);
        const dispatched = validateSchoolCombatRecord(raw, condition);
        const dedicated = validateTaohuaControlRecord(raw, condition);
        assert.deepEqual(dispatched, dedicated, condition.id);
        assert.equal(dedicated.accepted, condition.parameters.expected === 'observed');
        assert.equal(JSON.stringify(raw), before, '消费者不可改写原记录 ' + condition.id);
        if (condition.parameters.variant === 'target-busy50') {
            assert.equal(dedicated.accepted, false);
            assert.equal(dedicated.acquired, null);
            assert.equal(dedicated.target_busy_before, 50);
            assert.equal(dedicated.target_busy_after, 50);
            assert.equal(dedicated.target_busy_gain, 0);
        }
        if (condition.parameters.variant === 'miss-neili100') {
            assert.equal(dedicated.accepted, true);
            assert.equal(dedicated.acquired, false);
            assert.equal(dedicated.actor_neili_cost, 180);
            assert.equal(dedicated.actor_neili_remaining, -80);
        }
    }
});

test('公共物品校验与分派保留成本、控制、提示、资源和无攻击门禁', () => {
    for (const ability of ['fu', 'sui']) {
        const condition = conditions.find(c => c.parameters.ability === ability
            && c.parameters.variant === 'guaranteed-hit');
        for (const cost of [1, 476]) {
            const raw = syntheticRecord(condition);
            raw.command_accepted = cost;
            validateRecord(raw, condition);
            assert.equal(validateSchoolCombatRecord(raw, condition).accepted, true);
            assert.equal(raw.command_accepted, cost);
        }
        for (const mutate of [
            r => { r.condition_id = 'other'; },
            r => { r.method = 'exert'; },
            r => { r.command_accepted = 0; },
            r => { r.command_accepted = null; },
            r => { r.command_accepted = -1; },
            r => { r.command_accepted = 0.5; },
            r => { delete r.command_accepted; },
            r => { delete r.before[0].secondary_weapon; },
            r => { r.before[0].wizardp = 1; },
            r => { r.before[0].cultivation['can_perform/' + condition.parameters.skill + '/' + ability] = 0; },
            r => { r.immediate[1].busy++; },
            r => { r.immediate[0].neili++; },
            r => { r.metrics[0].neili_recovery = 1; },
            r => { r.metrics[0].direct = 1; },
            r => { r.metrics[1].heartbeats = 1; },
            r => { r.immediate[0].temp.notify_fail = ''; },
        ]) {
            const bad = syntheticRecord(condition);
            mutate(bad);
            bad.after = structuredClone(bad.immediate);
            assert.throws(() => validateSchoolCombatRecord(bad, condition), ability);
            assert.throws(() => validateTaohuaControlRecord(bad, condition), ability);
        }
        const refused = conditions.find(c => c.parameters.ability === ability
            && c.parameters.variant === 'target-busy50');
        const bad = syntheticRecord(refused);
        bad.immediate[0].temp.notify_fail = '不同的拒绝提示。\n';
        bad.after = structuredClone(bad.immediate);
        assert.throws(() => validateSchoolCombatRecord(bad, refused), '实际拒绝正文必须同源');
    }
    const armed = conditions.find(c => c.parameters.ability === 'sui' && c.parameters.variant === 'baseline');
    const bad = syntheticRecord(armed);
    bad.before[0].weapon_details.program = '/tests/unknown';
    assert.throws(() => validateRecord(bad, armed), '公共夹具校验仍实际执行');
});

test('runner只补原资格与交战快照，保留原目标忙乱准备而不新增直伤机制', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), take = body(runner, 'snapshot');
    assert.match(take, /"gumu-zhi",\s*"gumu-quanzhen",\s*"taohua-direct",\s*"taohua-control"/);
    assert.match(take, /result\["fighting_opponent"\] = objectp\(opponent\) && !!ob->is_fighting\(opponent\)/);
    const branch = /if \(current\["parameters"\]\["collection_group"\] == "taohua-control"\)\s*\{([\s\S]*?)\n    \}/.exec(take);
    assert.ok(branch, '独立的只读CONTROL快照分支');
    const grants = /foreach \(key in \(\{([\s\S]*?)\}\)\)\s*result\["cultivation"\]\[key\] = ob->query\(key\)/.exec(branch[1]);
    assert.ok(grants);
    assert.deepEqual([...grants[1].matchAll(/"([^"]+)"/g)].map(m => m[1]),
        ['character', 'can_perform/lanhua-shou/fu', 'can_perform/luoying-shenjian/sui']);
    assert.match(branch[1], /secondary = ob->query_temp\("secondary_weapon"\)/);
    assert.match(branch[1], /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(branch[1], /ob->(?:set|add|delete|start_busy|stop_busy)\(/);
    const prepare = body(runner, 'prepare_actor');
    assert.match(prepare, /current\["parameters"\]\["named_participants"\]/);
    assert.match(prepare, /ob->set_name\([\s\S]*?side \? "right" : "left"/);
    assert.match(prepare, /foreach \(key, value in config\["properties"\] \|\| \(\[\]\)\) ob->set\(key, value\)/);
    assert.match(prepare, /present\(side \? "right" : "left", this_object\(\)\) == ob,\s*"original CONTROL input resolves to exact USER"/);
    const busyStart = prepare.indexOf('if (config["busy"])');
    const busyEnd = prepare.indexOf('foreach (key, value in config["temp"]', busyStart);
    assert.ok(busyStart >= 0 && busyEnd > busyStart);
    const busyPreparation = prepare.slice(busyStart, busyEnd);
    assert.match(busyPreparation, /else ob->start_busy\(config\["busy"\]\)/);
    assert.doesNotMatch(busyPreparation, /taohua-control/, '不把原忙乱准备改为额外restore分支');
    assert.match(prepare, /ob->observation_heartbeat\(0\)/);
    for (const side of [0, 1]) {
        const prepared = runner.indexOf(`prepare_actor(${side}, parameters["${side ? 'target' : 'actor'}"])`);
        const measuring = runner.indexOf(`players[${side}]->start_observation(${side})`, prepared);
        assert.ok(prepared >= 0 && measuring > prepared, '准备后才开始该角色的计数窗口');
    }
    assert.doesNotMatch(body(runner, 'observe_direct'), /"taohua-control"/);
    assert.doesNotMatch(body(runner, 'advance'), /"taohua-control"/);
    assert.doesNotMatch(runner, /#include\s+["<]taohua_control_receivers\.h[">]/);
});
