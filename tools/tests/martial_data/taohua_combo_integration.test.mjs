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
import { taohuaComboActions, taohuaComboExtraAction, taohuaComboConditions, taohuaComboSourcePaths,
    validateTaohuaComboRecord, taohuaComboEffects } from './school_taohua_combo_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const catalog = collectCatalog(root, buildInventory(root));
const conditions = taohuaComboConditions(catalog, read);
const copy = structuredClone;
let frozen;
const snapshot = () => frozen ??= createSandbox(root);
const pick = (ability, variant = 'baseline', level = 200) => {
    const condition = conditions.find(c => c.id === `school-taohua-combo-${ability}-l${level}-${variant}`);
    assert.ok(condition);
    return condition;
};
const body = (source, name) => {
    const match = new RegExp('(?:private\\s+)?(?:int|void|mapping)\\s+' + name
        + '\\([^;]*?\\)\\s*\\{').exec(source);
    assert.ok(match, 'actual definition: ' + name);
    const end = source.indexOf('\n}\n', match.index);
    assert.ok(end > match.index, 'complete function: ' + name);
    return source.slice(match.index, end + 3);
};

// Consumer fixtures only: no original command, RNG or heartbeat is executed here.
function actorSnapshot(config, side, nonlethal) {
    const qualified = key => key.includes('/') || key === 'character';
    const equipped = !!config.equipment;
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    const unarmed = Math.max(0, ...['unarmed', 'hand', 'finger', 'strike', 'claw', 'cuff']
        .map(key => config.skills[key] ?? 0));
    return {
        ...Object.fromEntries(Object.entries(config.properties).filter(([key]) => !qualified(key))),
        cultivation: Object.fromEntries(Object.entries(config.properties).filter(([key]) => qualified(key))),
        object: `/tests/actor#${100 + side}`, id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: 1, killing_opponent: nonlethal ? 0 : 1, busy: config.busy ?? null,
        skills: copy(config.skills), mappings: copy(config.mappings), preparations: copy(config.preparations),
        preparation_order: Object.keys(config.preparations), learned: {}, conditions: null, temp: { apply },
        effective_str: config.properties.str + Math.trunc(unarmed / 10),
        effective_con: config.properties.con + Math.trunc(config.skills.force / 10),
        effective_skills: Object.fromEntries(Object.entries(config.skills).map(([key, level]) => [key,
            Math.trunc(level / 2) + (config.skills[config.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        weapon: equipped ? 'sword' : 'none', weapon_damage: equipped ? 50 : 0, weapon_flag: equipped ? 4 : 0,
        weapon_details: equipped ? { object: `/tests/sword#${200 + side}`, program: '/tests/sword',
            skill_type: 'sword', damage: 50, flag: 4, weight: 3000, consistence: 100,
            material: null, rigidity: null, no_wield: null } : {},
        secondary_weapon: 'none', secondary_weapon_details: {}, handing: 'none', handing_details: {},
    };
}

function syntheticRecord(condition, options = {}) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    const before = [actorSnapshot(p.actor, 0, p.nonlethal), actorSnapshot(p.target, 1, p.nonlethal)];
    const raw = { kind: 'sample', condition_id: condition.id, method: 'perform', outcome: p.expected,
        before, immediate: copy(before), after: [], metrics: [{}, {}],
        command_accepted: accepted ? (options.cost ?? 23) : 0,
        actions: [], attacks: [], dodge_checks: [], passives: [], launches: [], refusals: [], defenses: [],
        interfaces: [], dropped: [], terminals: [], callbacks: [], skill_loads: [], reason: '', elapsed: 0.01 };
    const [actor, target] = raw.immediate;
    if (!accepted) {
        raw.reason = '\x1b[256D\x1b[K' + p.refusal;
        actor.temp.notify_fail = p.refusal;
        raw.refusals = [{ actor: actor.object, reason: raw.reason }];
    } else {
        const kuang = p.ability === 'kuang', fee = kuang ? 100 : 150;
        const bonus = kuang ? (p.actor.properties['family/family_name'] === '桃花岛'
            ? Math.trunc(p.actor.skills[p.skill] / 4) : 0)
            : p.variant === 'gate-miss' ? 0 : Math.trunc(p.actor.skills[p.skill] / 5);
        actor.neili -= fee;
        actor.temp.notify_fail = '你所使用的外功中没有这种功能。\n';
        actor.temp.apply.attack = bonus;
        if (kuang) actor.temp.apply.unarmed_damage = Math.trunc(bonus / 2);
        raw.launches = [{ actor: actor.object, skill: p.skill, argument: `${p.ability} right` }];
        raw.metrics[0] = { ability_launched: 1, neili_cost: fee };
        const results = options.results ?? [-1, -1, -1, -1, -1, -1];
        for (let i = 0; i < results.length; i++) {
            if (!actor.fighting_opponent) break;
            if (kuang && !(target.busy ?? 0) && i % 2 === 0) target.busy = 1;
            if (!kuang) actor.temp.action_flag = before[0].preparation_order.indexOf('hand');
            const surcharge = options.surchargeAt?.includes(i);
            // NewRandom(n, 20, level / 5) selects only the last six unlocked actions here.
            const available = taohuaComboActions[p.skill].filter(action => p.actor.skills[p.skill] > action.lvl);
            const action = copy(surcharge ? taohuaComboExtraAction : available[Math.max(0, available.length - 6)]);
            if (surcharge) { actor.neili -= 300; raw.metrics[0].neili_cost += 300; }
            raw.actions.push({ actor: 0, target: 1, skill: p.skill, action });
            actor.temp.fight = { attack: action.attack ?? null, dodge: action.dodge, parry: action.parry ?? null };
            for (const phase of ['base', 'settled']) raw.dodge_checks.push({ actor: 0, target: 1,
                type: 0, phase, ap: 1000, dp: phase === 'settled' && target.busy ? 100 : 300,
                busy: target.busy, skill: null });
            const result = results[i], unarmed = actor.temp.apply.unarmed_damage ?? 0;
            const first = Math.trunc(unarmed / 2);
            const force = actor.effective_str + Math.trunc(action.force * actor.effective_str / 100);
            const incoming = first + Math.trunc(action.damage * first / 100) + Math.trunc(force / 3);
            let damage = incoming + Math.trunc(incoming * (actor.str * 2 + actor.effective_str) / 300);
            damage = damage > 400 ? Math.trunc((damage - 400) / 4) + 300
                : damage > 200 ? Math.trunc((damage - 200) / 2) + 200 : damage;
            if (result !== 0 || options.zeroDamage?.includes(i)) damage = 0;
            if (result === 0) raw.passives.push({ actor: 0, target: 1, skill: p.skill,
                incoming, factor: 0, route: 'martial', result: options.passiveResult ?? null,
                before: copy([actor, target]), after: copy([actor, target]),
                neili_after: actor.neili, target_eff_qi_after: target.eff_qi, target_busy_after: target.busy });
            raw.attacks.push({ actor: 0, target: 1, type: 0, result, damage,
                attack_usage: p.usage, attack_skill: p.skill, action_flag: actor.temp.action_flag ?? null,
                apply_attack: actor.temp.apply.attack ?? null,
                apply_unarmed_damage: actor.temp.apply.unarmed_damage ?? null, neili: actor.neili });
            const metric = result === 0 ? 'hit' : result === -1 ? 'dodge' : 'parry';
            raw.metrics[0][metric] = (raw.metrics[0][metric] ?? 0) + 1;
            if (damage) {
                target.qi -= damage;
                raw.metrics[1].qi_cost = (raw.metrics[1].qi_cost ?? 0) + damage;
                target.busy = 0;
                if (p.nonlethal && target.qi * 3 <= target.max_qi) {
                    actor.fighting_opponent = 0;
                    target.fighting_opponent = 0;
                }
            }
        }
        actor.temp.apply.attack = 0;
        if (kuang) actor.temp.apply.unarmed_damage = 0;
        actor.busy = kuang ? 4 : 2;
        actor.learned[p.skill] = 1;
    }
    raw.after = copy(raw.immediate);
    return raw;
}

function consume(raw, condition) {
    const original = JSON.stringify(raw);
    validateRecord(raw, condition);
    const result = validateSchoolCombatRecord(raw, condition);
    assert.deepEqual(result, validateTaohuaComboRecord(raw, condition));
    assert.equal(JSON.stringify(raw), original, '三层消费不得修改原记录');
    return result;
}

test('旧15905完整有序矩阵保持，仅尾追加两招24条件1420/48计划', () => {
    for (const smoke of [false, true]) {
        const all = schoolCombatConditions(catalog, { smoke })
            .filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && !['taohua-bihai', 'taohua-passive', 'taohua-combination', 'taohua-force', 'taohua-music', 'taohua-npc', 'mingjiao-core', 'mingjiao-qishang', 'mingjiao-xinfa', 'mingjiao-movement', 'mingjiao-shengong', 'mingjiao-shenghuo', 'mingjiao-ling-learning', 'mingjiao-ling-perform', 'mingjiao-apprentice-learning', 'mingjiao-public-force', 'mingjiao-teachers', 'mingjiao-recruit', 'mingjiao-gift', 'mingjiao-book', 'mingjiao-qkd', 'mingjiao-jiuyang', 'mingjiao-jiuyang-learning', 'mingjiao-jiuyang-direct', 'mingjiao-jiuyang-remaining', 'mingjiao-jiuyang-exert', 'mingjiao-jiuyang-capacity', 'mingjiao-jiuyang-research', 'mingjiao-jiuyang-fusion', 'mingjiao-remaining-perform', 'mingjiao-remaining-base', 'mingjiao-force-remaining', 'mingjiao-combination', 'mingjiao-npc-bout', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
        assert.equal(all.length, 15929);
        assert.equal(new Set(all.map(c => c.id)).size, all.length);
        // Independently rebuilt from preserved tatk-v1 modules and tatk-f1/catalog.json.
        assert.equal(sha256(JSON.stringify(all.slice(0, 15905))), smoke
            ? '43d9b5f1baf18603eb6a923a4cc571534fe5791bbf13a91ff7e0f2ef331f9582'
            : '4b2b9101e53d88ac9139dbbe1055a5764cbaad670f68fa4ea1beda3833b61d8d');
        const tail = all.slice(15905);
        assert.deepEqual(tail, taohuaComboConditions(catalog, read, { smoke }));
        assert.equal(sha256(JSON.stringify(tail)), smoke
            ? 'a34becd237a5cb3a99459e924d391b241bda13777a8e42b4465d574005b0412a'
            : 'c2232aaf06dc8b3bdc49ab1071d98e1d92ef59587e5c5a87f5e6868c413d595c');
        assert.equal(tail.length, 24);
        assert.equal(tail.reduce((n, c) => n + c.samples, 0), smoke ? 48 : 1420);
        assert.equal(all.reduce((n, c) => n + c.samples, 0), smoke ? 26252 : 418932);
        assert.equal(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.expected === 'observed').length, 14);
        assert.deepEqual(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.nonlethal).map(c => [c.parameters.ability, c.parameters.variant]),
            [['kuang', 'low-qi'], ['fei', 'low-qi']]);
        assert.ok(tail.filter(c => !c.parameters?.collection_group?.startsWith('slice1-') && !c.parameters?.collection_group?.startsWith('slice2-') && !c.parameters?.collection_group?.startsWith('slice3-') && !c.parameters?.collection_group?.startsWith('slice4-') && !c.parameters?.collection_group?.startsWith('slice5-') && !c.parameters?.collection_group?.startsWith('slice6-') && !c.parameters?.collection_group?.startsWith('slice7-') && !c.parameters?.collection_group?.startsWith('slice8-') && !c.parameters?.collection_group?.startsWith('b1-') && !c.parameters?.collection_group?.startsWith('b2-') && !c.parameters?.collection_group?.startsWith('b3-') && !c.parameters?.collection_group?.startsWith('b4-') && !c.parameters?.collection_group?.startsWith('b5-') && !c.parameters?.collection_group?.startsWith('b6-') && !c.parameters?.collection_group?.startsWith('b7-') && !c.parameters?.collection_group?.startsWith('b8-') && !c.parameters?.collection_group?.startsWith('b9-') && !c.parameters?.collection_group?.startsWith('b10-') && !c.parameters?.collection_group?.startsWith('b11-') && !c.parameters?.collection_group?.startsWith('b12-') && !c.parameters?.collection_group?.startsWith('b13-') && !c.parameters?.collection_group?.startsWith('b14-') && !c.parameters?.collection_group?.startsWith('b15-') && !c.parameters?.collection_group?.startsWith('b16-') && !c.parameters?.collection_group?.startsWith('b17-') && !c.parameters?.collection_group?.startsWith('b18-') && !c.parameters?.collection_group?.startsWith('b19-') && !c.parameters?.collection_group?.startsWith('b20-') && !c.parameters?.collection_group?.startsWith('b21-') && !c.parameters?.collection_group?.startsWith('b22-') && !c.parameters?.collection_group?.startsWith('b23-') && !c.parameters?.collection_group?.startsWith('b24-') && !c.parameters?.collection_group?.startsWith('b25-') && !c.parameters?.collection_group?.startsWith('b26-') && !c.parameters?.collection_group?.startsWith('b27-') && !c.parameters?.collection_group?.startsWith('b28-') && !c.parameters?.collection_group?.startsWith('b29-') && c.parameters.variant !== 'low-qi')
            .every(c => !Object.hasOwn(c.parameters, 'nonlethal')));
    }
});

test('实际冻结四新增工具和33来源，保留15文件48原探针且只建一次快照', () => {
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
    for (const name of ['school_taohua_combo_cases.mjs', 'school_taohua_combo.test.mjs',
        'school_taohua_combo_report.test.mjs', 'taohua_combo_integration.test.mjs',
        'runner.lpc', 'execution.mjs', 'school_combat_cases.mjs', 'school_combat_report.mjs', 'statistics.mjs',
        ...remainingMingjiaoFiles]) {
        const path = 'tools/tests/martial_data/' + name;
        assert.equal(state.files[path], sha256(read(path)), path);
    }
    const laterFiles = ['school_taohua_bihai_cases.mjs', 'school_taohua_bihai.test.mjs',
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
    assert.equal(Object.keys(state.files).filter(path => path !== 'help/notice' && !(laterFiles.includes(path) || ['tools/tests/martial_data/school_taohua_force_cases.mjs', 'tools/tests/martial_data/school_taohua_force.test.mjs', 'tools/tests/martial_data/school_taohua_force_report.test.mjs', 'tools/tests/martial_data/school_taohua_learning_cases.mjs', 'tools/tests/martial_data/school_taohua_learning.test.mjs', 'tools/tests/martial_data/school_slice1_cases.mjs', 'tools/tests/martial_data/school_slice1_cases.test.mjs', 'tools/tests/martial_data/school_slice1_preparation.test.mjs', 'tools/tests/martial_data/school_slice2_cases.mjs', 'tools/tests/martial_data/school_slice2_cases.test.mjs', 'tools/tests/martial_data/school_slice2_preparation.test.mjs', 'tools/tests/martial_data/school_slice3_cases.mjs', 'tools/tests/martial_data/school_slice3_cases.test.mjs', 'tools/tests/martial_data/school_slice3_preparation.test.mjs', 'tools/tests/martial_data/school_slice4_cases.mjs', 'tools/tests/martial_data/school_slice4_cases.test.mjs', 'tools/tests/martial_data/school_slice4_preparation.test.mjs', 'tools/tests/martial_data/school_slice5_cases.mjs', 'tools/tests/martial_data/school_slice5_cases.test.mjs', 'tools/tests/martial_data/school_slice5_preparation.test.mjs', 'tools/tests/martial_data/school_slice6_cases.mjs', 'tools/tests/martial_data/school_slice6_cases.test.mjs', 'tools/tests/martial_data/school_slice6_preparation.test.mjs', 'tools/tests/martial_data/school_slice7_cases.mjs', 'tools/tests/martial_data/school_slice7_cases.test.mjs', 'tools/tests/martial_data/school_slice7_preparation.test.mjs', 'tools/tests/martial_data/school_slice8_cases.mjs', 'tools/tests/martial_data/school_slice8_cases.test.mjs', 'tools/tests/martial_data/school_slice8_preparation.test.mjs', 'tools/tests/martial_data/public_special_cases.mjs', 'tools/tests/martial_data/public_special_cases.test.mjs', 'tools/tests/martial_data/b1_perform_cases.mjs', 'tools/tests/martial_data/b1_perform_cases.test.mjs', 'tools/tests/martial_data/b2_perform_cases.mjs', 'tools/tests/martial_data/b2_perform_cases.test.mjs', 'tools/tests/martial_data/b3_perform_cases.mjs', 'tools/tests/martial_data/b3_perform_cases.test.mjs', 'tools/tests/martial_data/b4_perform_cases.mjs', 'tools/tests/martial_data/b4_perform_cases.test.mjs', 'tools/tests/martial_data/b5_perform_cases.mjs', 'tools/tests/martial_data/b5_perform_cases.test.mjs', 'tools/tests/martial_data/b6_perform_cases.mjs', 'tools/tests/martial_data/b6_perform_cases.test.mjs', 'tools/tests/martial_data/b7_perform_cases.mjs', 'tools/tests/martial_data/b7_perform_cases.test.mjs', 'tools/tests/martial_data/b8_perform_cases.mjs', 'tools/tests/martial_data/b8_perform_cases.test.mjs', 'tools/tests/martial_data/b9_perform_cases.mjs', 'tools/tests/martial_data/b9_perform_cases.test.mjs', 'tools/tests/martial_data/b10_perform_cases.mjs', 'tools/tests/martial_data/b10_perform_cases.test.mjs', 'tools/tests/martial_data/b11_perform_cases.mjs', 'tools/tests/martial_data/b11_perform_cases.test.mjs', 'tools/tests/martial_data/b12_perform_cases.mjs', 'tools/tests/martial_data/b12_perform_cases.test.mjs', 'tools/tests/martial_data/b13_perform_cases.mjs', 'tools/tests/martial_data/b13_perform_cases.test.mjs', 'tools/tests/martial_data/b14_perform_cases.mjs', 'tools/tests/martial_data/b14_perform_cases.test.mjs', 'tools/tests/martial_data/b15_perform_cases.mjs', 'tools/tests/martial_data/b15_perform_cases.test.mjs', 'tools/tests/martial_data/b16_perform_cases.mjs', 'tools/tests/martial_data/b16_perform_cases.test.mjs', 'tools/tests/martial_data/b17_perform_cases.mjs', 'tools/tests/martial_data/b17_perform_cases.test.mjs', 'tools/tests/martial_data/b18_perform_cases.mjs', 'tools/tests/martial_data/b18_perform_cases.test.mjs', 'tools/tests/martial_data/b19_perform_cases.mjs', 'tools/tests/martial_data/b19_perform_cases.test.mjs', 'tools/tests/martial_data/b20_perform_cases.mjs', 'tools/tests/martial_data/b20_perform_cases.test.mjs', 'tools/tests/martial_data/b21_perform_cases.mjs', 'tools/tests/martial_data/b21_perform_cases.test.mjs', 'tools/tests/martial_data/b22_perform_cases.mjs', 'tools/tests/martial_data/b22_perform_cases.test.mjs', 'tools/tests/martial_data/b23_perform_cases.mjs', 'tools/tests/martial_data/b23_perform_cases.test.mjs', 'tools/tests/martial_data/b24_perform_cases.mjs', 'tools/tests/martial_data/b24_perform_cases.test.mjs', 'tools/tests/martial_data/b25_perform_cases.mjs', 'tools/tests/martial_data/b25_perform_cases.test.mjs', 'tools/tests/martial_data/b26_perform_cases.mjs', 'tools/tests/martial_data/b26_perform_cases.test.mjs', 'tools/tests/martial_data/b27_perform_cases.mjs', 'tools/tests/martial_data/b27_perform_cases.test.mjs', 'tools/tests/martial_data/b28_perform_cases.mjs', 'tools/tests/martial_data/b28_perform_cases.test.mjs', 'tools/tests/martial_data/b29_perform_cases.mjs', 'tools/tests/martial_data/b29_perform_cases.test.mjs', 'tools/tests/martial_data/school_quanzhen_combination_cases.mjs', 'tools/tests/martial_data/school_huashan_combination_cases.mjs', 'tools/tests/martial_data/school_slice_combination.test.mjs', 'tools/tests/martial_data/school_slice_combination_cases.mjs', 'tools/tests/martial_data/school_bout_perform.test.mjs', 'tools/tests/martial_data/school_bout_perform_cases.mjs', 'tools/tests/martial_data/school_taohua_bout.test.mjs', 'tools/tests/martial_data/school_taohua_bout_cases.mjs', 'tools/tests/martial_data/school_mingjiao_bout.test.mjs', 'tools/tests/martial_data/school_mingjiao_bout_cases.mjs', 'tools/tests/martial_data/school_huashan_bout.test.mjs', 'tools/tests/martial_data/school_huashan_bout_cases.mjs', 'tools/tests/martial_data/school_quanzhen_bout.test.mjs', 'tools/tests/martial_data/school_quanzhen_bout_cases.mjs', 'tools/tests/martial_data/school_npc_grant_cases.mjs', 'tools/tests/martial_data/school_public_exert_cases.mjs'].includes(path))).length, 10389 + 5, 'five appended effect/consumer test inputs');
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
    assert.equal(taohuaComboSourcePaths.length, 33);
    assert.equal(new Set(taohuaComboSourcePaths).size, 33);
    for (const c of conditions) {
        assert.deepEqual(Object.keys(c.parameters.source_evidence), taohuaComboSourcePaths);
        assert.deepEqual(c.parameters.qualification_sources, taohuaComboSourcePaths);
        assert.equal(c.parameters.ability_source.entry_id, c.entry_id);
    }
    validateQualificationSources(conditions, state.files);
});

test('执行器严格拒绝来源缺项或漂移、两招能力本体与入口命令错绑', () => {
    const files = snapshot().files;
    for (const ability of ['kuang', 'fei']) {
        const condition = pick(ability);
        for (const path of taohuaComboSourcePaths) {
            const missing = copy(condition);
            delete missing.parameters.source_evidence[path];
            assert.throws(() => validateQualificationSources([missing], files), path);
            const absentQualification = copy(condition);
            absentQualification.parameters.qualification_sources = taohuaComboSourcePaths.filter(p => p !== path);
            assert.throws(() => validateQualificationSources([absentQualification], files));
            const changed = copy(condition);
            changed.parameters.source_evidence[path] = '0'.repeat(64);
            assert.throws(() => validateQualificationSources([changed], files));
            const absentCopy = { ...files };
            delete absentCopy[path];
            assert.throws(() => validateQualificationSources([condition], absentCopy));
            assert.throws(() => validateQualificationSources([condition], { ...files, [path]: '0'.repeat(64) }));
        }
        for (const mutate of [
            c => { c.parameters.source_evidence = null; },
            c => { c.parameters.source_evidence['kungfu/skill/unknown.c'] = '0'.repeat(64); },
            c => { delete c.parameters.qualification_sources; },
            c => { c.parameters.qualification_sources.reverse(); },
            c => { c.parameters.qualification_sources.push('kungfu/skill/unknown.c'); },
            c => { c.parameters.ability = 'unknown'; }, c => { c.parameters.skill = 'unknown'; },
            c => { c.parameters.usage = 'finger'; }, c => { c.method = 'ordinary'; },
            c => { c.parameters.action = 'perform hand.fei left'; },
            c => { c.parameters.ability_source.path = c.parameters.base_source.path; },
            c => { c.parameters.base_source.path = c.parameters.ability_source.path; },
            c => { c.parameters.ability_source.sha256 = '0'.repeat(64); },
            c => { c.parameters.base_source.sha256 = 'not-a-sha256'; },
            c => { delete c.parameters.ability_source; }, c => { delete c.parameters.base_source; },
            c => { c.parameters.ability_source.entry_id += ':other'; },
            c => { c.entry_id = c.parameters.base_source.path; },
            c => { c.entry_id = c.parameters.ability_source.entry_id = c.parameters.ability_source.path + ':1:exert'; },
            c => { c.parameters.nonlethal = true; },
        ]) {
            const bad = copy(condition);
            mutate(bad);
            assert.throws(() => validateQualificationSources([bad], files));
        }
        const badLowQi = copy(pick(ability, 'low-qi'));
        delete badLowQi.parameters.nonlethal;
        assert.throws(() => validateQualificationSources([badLowQi], files));
    }
});

test('全部24条件实际经过公共、学校分派与本组消费，不把合成当真实攻击', () => {
    for (const condition of conditions) {
        const raw = syntheticRecord(condition);
        assert.equal(consume(raw, condition).accepted, condition.parameters.expected === 'observed');
        assert.equal(Object.hasOwn(raw, 'parameters'), false, '消费使用冻结条件，不依赖回填参数');
    }
    for (const ability of ['kuang', 'fei']) for (const result of [0, -1, -2]) {
        const condition = pick(ability);
        const raw = syntheticRecord(condition, { results: Array(6).fill(result) });
        consume(raw, condition);
    }
    const armed = pick('kuang', 'weapon'), badPublic = syntheticRecord(armed);
    badPublic.before[0].weapon_details.program = '/tests/unknown';
    assert.throws(() => validateRecord(badPublic, armed), '公共装备校验没有被专用分派跳过');
});

test('三层保留正command成本、显式空值和字段归属，受理分母不累加成本', () => {
    for (const ability of ['kuang', 'fei']) {
        const condition = pick(ability), records = [1, 23, 476].map(cost => syntheticRecord(condition, { cost }));
        for (const raw of records) consume(raw, condition);
        const rows = records.map(raw => ({ condition_id: condition.id, outcome: raw.outcome, raw }));
        assert.deepEqual(taohuaComboEffects(rows, condition), taohuaComboEffects(rows.map(row => ({ ...row,
            raw: { ...row.raw, command_accepted: 1 } })), condition));
        for (const cost of [0, null, undefined, -1, 0.5, '1', true, {}, [], NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
            const bad = syntheticRecord(condition);
            bad.command_accepted = cost;
            assert.throws(() => validateSchoolCombatRecord(bad, condition));
        }
        const missing = syntheticRecord(condition);
        delete missing.command_accepted;
        assert.throws(() => validateSchoolCombatRecord(missing, condition));
        const refusal = pick(ability, 'no-grant');
        for (const cost of [1, 23, 476]) {
            const bad = syntheticRecord(refusal);
            bad.command_accepted = cost;
            assert.throws(() => validateSchoolCombatRecord(bad, refusal));
        }
    }
    const condition = pick('fei'), options = { results: [0, 0, 0, 0, 0, 0], zeroDamage: [0] };
    for (const value of [0, null]) {
        const raw = syntheticRecord(condition, options);
        for (const attack of raw.attacks) attack.apply_unarmed_damage = value;
        for (const event of raw.passives) event.result = value;
        consume(raw, condition);
        assert.equal(raw.attacks[0].damage, 0);
        assert.equal(raw.passives.length, 6, '零最终伤害也有原命中回调');
    }
    for (const mutate of [
        r => { r.condition_id = 'other'; }, r => { r.method = 'ordinary'; },
        r => { r.before[0].wizardp = 1; }, r => { r.before[1].interactive = 0; },
        r => { delete r.before[0].preparation_order; }, r => { delete r.before[1].killing_opponent; },
        r => { delete r.immediate[0].secondary_weapon; }, r => { delete r.immediate[1].conditions; },
        r => { r.immediate[0].temp.apply.attack = 1; }, r => { r.immediate[0].temp.other = 1; },
        r => { r.attacks[0].actor = 1; }, r => { r.attacks[0].attack_usage = 'unarmed'; },
        r => { delete r.attacks[0].apply_unarmed_damage; }, r => { r.attacks[0].apply_unarmed_damage = undefined; },
        r => { delete r.attacks[0].neili; }, r => { r.attacks[0].neili = null; },
        r => { r.attacks[0].neili++; }, r => { r.attacks[0].action_flag = 1; },
        r => { r.actions[0].action = copy(taohuaComboActions['lanhua-shou'][0]); },
        r => { r.metrics[0].hit = 99; }, r => { r.metrics[1].hit = 1; },
        r => { r.metrics[0].heartbeats = 1; }, r => { r.metrics[0].neili_recovery = 1; },
        r => { r.passives[0].route = 'force'; }, r => { delete r.passives[0].result; },
        r => { r.passives[0].result = 1; }, r => { r.passives[0].after[0].neili++; },
        r => { r.dodge_checks[0].busy = 50; }, r => { r.callbacks.push({}); },
    ]) {
        const bad = syntheticRecord(condition, options);
        mutate(bad);
        bad.after = copy(bad.immediate);
        assert.throws(() => validateSchoolCombatRecord(bad, condition));
        assert.throws(() => validateTaohuaComboRecord(bad, condition));
    }
});

test('两条真实切磋配置允许短连，逐击兰花附费不被最终命中或净值抹去', () => {
    for (const ability of ['kuang', 'fei']) {
        const condition = pick(ability, 'low-qi');
        const short = syntheticRecord(condition, { results: [0, 0, 0, 0, 0, 0] });
        const detail = consume(short, condition);
        assert.equal(detail.early_stop, true);
        assert.ok(detail.attacks > 0 && detail.attacks < 6);
        assert.ok(short.immediate.every(s => s.fighting_opponent === 0 && s.killing_opponent === 0));
        const fullMiss = syntheticRecord(condition);
        assert.equal(consume(fullMiss, condition).attacks, 6, '全失手时不能强制提前收招');
        const forgedKilling = copy(short);
        forgedKilling.before[0].killing_opponent = 1;
        assert.throws(() => validateSchoolCombatRecord(forgedKilling, condition));
        const forgedFighting = copy(short);
        forgedFighting.immediate[1].fighting_opponent = 1;
        forgedFighting.after = copy(forgedFighting.immediate);
        assert.throws(() => validateSchoolCombatRecord(forgedFighting, condition));
    }
    const surcharge = pick('fei', 'jingluo-surcharge');
    const raw = syntheticRecord(surcharge, { surchargeAt: [0, 1] });
    const detail = consume(raw, surcharge);
    assert.equal(detail.hits, 0);
    assert.equal(detail.base_cost, 150);
    assert.equal(detail.action_surcharge_cost, 600);
    assert.equal(detail.neili_cost, 750);
    assert.deepEqual(raw.attacks.map(a => a.neili), [2550, 2250, 2250, 2250, 2250, 2250]);
    const missedFee = copy(raw);
    missedFee.metrics[0].neili_cost = 150;
    assert.throws(() => validateSchoolCombatRecord(missedFee, surcharge));
    const zeroGate = consume(syntheticRecord(pick('fei', 'gate-miss')), pick('fei', 'gate-miss'));
    assert.equal(zeroGate.accepted, true);
    assert.equal(zeroGate.attack_bonus, 0);
    assert.equal(zeroGate.attacks, 6);
    assert.equal(zeroGate.base_cost, 150);
});

test('runner仅复用原命令与只读观察，切磋范围限两lowqi且不增加探针或补打', () => {
    const runner = read('tools/tests/martial_data/runner.lpc'), take = body(runner, 'snapshot');
    const branch = /if \(current\["parameters"\]\["collection_group"\] == "taohua-combo"\)\s*\{([\s\S]*?)\n    \}/.exec(take);
    assert.ok(branch, 'COMBO限定快照');
    for (const key of ['character', 'can_perform/xuanfeng-tui/kuang', 'can_perform/lanhua-shou/fei'])
        assert.ok(branch[1].includes('"' + key + '"'), key);
    assert.match(branch[1], /result\["cultivation"\]\[key\] = ob->query\(key\)/);
    assert.match(branch[1], /result\["killing_opponent"\] = objectp\(opponent\) && !!ob->is_killing\(opponent->query\("id"\)\)/);
    assert.match(branch[1], /result\["preparation_order"\] = keys\(ob->query_skill_prepare\(\) \|\| \(\[\]\)\)/);
    assert.match(branch[1], /result\["secondary_weapon_details"\] = equipment_snapshot\(secondary\)/);
    assert.doesNotMatch(branch[1], /ob->(?:set|add|delete|query_action|start_busy|stop_busy)\(/);
    assert.match(take, /"taohua-combo"[\s\S]*?result\["fighting_opponent"\]/);
    for (const name of ['observe_selected_action', 'begin_passive', 'observe_passive']) {
        const observe = body(runner, name);
        assert.match(observe, /member_array\(current\["parameters"\]\["collection_group"\],[\s\S]*?"taohua-combo"/);
        assert.doesNotMatch(observe, /->(?:query_action|do_attack|force_me|hit_ob)\(/);
    }
    assert.match(body(runner, 'observe_selected_action'), /"action": serializable\(action\)/);
    assert.match(body(runner, 'begin_passive'), /passive_before\[route\] = \(\{ snapshot\(me\), snapshot\(target\) \}\)/);
    const attack = body(runner, 'observe_attack');
    assert.match(attack, /"taohua-combo"[\s\S]*?value\["attack_usage"\]/);
    assert.match(attack, /"taohua-combo"[\s\S]*?value\["apply_attack"\] = me->query_temp\("apply\/attack"\)/);
    assert.match(attack, /value\["apply_unarmed_damage"\] = me->query_temp\("apply\/unarmed_damage"\)/);
    assert.match(attack, /value\["neili"\] = me->query\("neili"\)/);
    assert.doesNotMatch(attack, /->(?:query_action|do_attack|force_me|hit_ob)\(/);
    const perform = body(runner, 'perform_sample');
    const fighting = /if \(parameters\["collection_group"\] == "taohua-combo" && parameters\["nonlethal"\]\)\s*\{([\s\S]*?)\} else \{([\s\S]*?)\}/.exec(perform);
    assert.ok(fighting, '仅COMBO显式nonlethal沿原fight_ob，其余保持kill_ob');
    for (const [side, other] of [[0, 1], [1, 0]]) {
        assert.ok(fighting[1].includes(`players[${side}]->fight_ob(players[${other}]);`));
        assert.ok(fighting[2].includes(`players[${side}]->kill_ob(players[${other}]);`));
    }
    assert.match(perform, /players\[0\]->force_me\(action\)/);
    assert.doesNotMatch(fighting[1] + fighting[2], /force_me|do_attack|query_action|start_busy|call_out|random\(|for\s*\(/);
    const prepare = body(runner, 'prepare_actor');
    assert.match(prepare, /current\["parameters"\]\["named_participants"\]/);
    assert.match(prepare, /ob->set_name\([\s\S]*?side \? "right" : "left"/);
    assert.match(prepare, /ob->observation_heartbeat\(0\)/);
    assert.match(body(runner, 'advance'), /"taohua-combo"[\s\S]*?current\["actions"\] = \(\{\}\)/);
    assert.doesNotMatch(body(runner, 'observe_direct'), /"taohua-combo"/);
    assert.doesNotMatch(runner, /#include\s+["<]taohua_combo_receivers\.h[">]/);
});
