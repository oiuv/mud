// Preparation only: no registry, runner, Record/Effects consumer or native observations.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const copy = value => structuredClone(value);
const sha = value => createHash('sha256').update(value).digest('hex');
const group = 'mingjiao-remaining-perform', prefix = 'school-mingjiao-remaining-perform-';
const skillPath = skill => `kungfu/skill/${skill}.c`;
const entryPath = d => `kungfu/skill/${d.skill}/${d.ability}.c`;
const grantKey = d => `can_perform/${d.skill}/${d.ability}`;
const bare = ['cuff', 'hand', 'finger', 'strike', 'claw'];

// These are command gates, not a declaration that a prepared USER learned the skills naturally.
// FUXUE's minimum is effective finger 150 (basic 100 + special 100), not raw special 150.
const entries = [
    { skill: 'pili-quan', ability: 'jin', usage: 'cuff', line: 10, minimum: 40, level_line: 27,
        neili: 200, neili_line: 30, grant: true, grant_line: 21, prepared: true, prepared_line: 33,
        fighting_line: 24, living_line: 36, mode: 'direct', attack_type: 'UNARMED_ATTACK', percent: 55,
        fees: { outer_hit: 120, outer_miss: 80 }, busy: { actor_hit: [2, 2], actor_miss: [3, 3] },
        npc: 'lengqian', relation_line: 101, relation: 'original_teach_pfm' },
    { skill: 'pili-shou', ability: 'hun', usage: 'hand', line: 10, minimum: 140, level_line: 28,
        neili: 340, neili_line: 37, raw_force: 160, force_line: 31, max_neili: 2400, max_line: 34,
        grant: true, grant_line: 20, prepared: true, prepared_line: 40, fighting_line: 23, living_line: 43,
        mode: 'direct', attack_type: 'UNARMED_ATTACK', percent: 70,
        fees: { outer_hit: 300, outer_miss: 200 }, busy: { actor_hit: [1, 2], actor_miss: [3, 3] },
        npc: 'xiexun', relation_line: 124, relation: 'original_teach_pfm' },
    { skill: 'tougu-zhen', ability: 'feng', usage: 'finger', line: 10, minimum: 100, level_line: 24,
        neili: 350, neili_line: 33, effective_force: 260, force_line: 27, max_neili: 2400, max_line: 30,
        grant: true, grant_line: 16, prepared: true, prepared_line: 36, fighting_line: 21, living_line: 39,
        mode: 'direct_poison', poison: 'tougu_zhen', attack_type: 'UNARMED_ATTACK', percent: 65,
        fees: { outer_hit: 280, outer_miss: 50 }, busy: { actor_hit: [1, 1], actor_miss: [3, 3] },
        npc: 'yintianzheng', relation_line: 116, relation: 'original_teach_pfm' },
    { skill: 'yinfeng-dao', ability: 'jue', usage: 'strike', line: 10, minimum: 140, level_line: 24,
        neili: 400, neili_line: 33, effective_force: 260, force_line: 27, max_neili: 2400, max_line: 30,
        grant: true, grant_line: 16, fighting_line: 21, living_line: 39,
        mode: 'direct_poison', poison: 'yinfeng_dao', attack_type: 'UNARMED_ATTACK', percent: 70,
        fees: { outer_hit: 350, outer_miss: 150 }, busy: { actor_hit: [1, 1], actor_miss: [3, 3] },
        npc: 'yintianzheng', relation_line: 131, relation: 'original_teach_pfm' },
    { skill: 'yinhu-zhang', ability: 'lao', usage: 'staff', line: 8, minimum: 100, level_line: 34,
        neili: 200, neili_line: 31, effective_force: 140, force_line: 28, weapon: 'staff', weapon_line: 24,
        grant: true, grant_line: 13, fighting_line: 21, living_line: 40,
        mode: 'direct', attack_type: 'WEAPON_ATTACK', percent: 75,
        fees: { outer_hit: 180, outer_miss: 100 }, busy: { actor_hit: [3, 3], actor_miss: [4, 4] },
        npc: 'daijisi', relation_line: 117, relation: 'original_teach_pfm' },
    { skill: 'sougu-yingzhua', ability: 'xue', usage: 'claw', line: 8, minimum: 60, level_line: 24,
        neili: 220, neili_line: 36, effective_force: 80, force_line: 33,
        grant: true, grant_line: 13, prepared: true, prepared_line: 30, empty_weapons_line: 21,
        fighting_line: 18, living_line: 39, mode: 'direct', attack_type: 'UNARMED_ATTACK', percent: 55,
        fees: { outer_hit: 200, outer_miss: 100 }, busy: { actor_hit: [3, 3], actor_miss: [4, 4] },
        npc: 'weiyixiao', relation_line: 112, relation: 'original_teach_pfm' },
    { skill: 'sougu-yingzhua', ability: 'ying', usage: 'claw', line: 7, minimum: 150, level_line: 18,
        neili: 800, neili_line: 21, effective_str: 30, str_line: 15, target_busy_line: 24,
        grant: false, fighting_line: 12, living_line: 27, mode: 'control',
        fees: { outer_hit: 150, outer_miss: 0 }, busy: { actor_hit: [0, 0], actor_miss: [4, 4], target_hit: 'raw/22+1' },
        npc: 'weiyixiao', relation_line: 112, relation: 'base_skill_source_not_ying_grant' },
    { skill: 'duoming-jinhua', ability: 'hua', usage: 'throwing', line: 9, minimum: 120, level_line: 32,
        neili: 150, neili_line: 41, effective_force: 150, force_line: 38,
        grant: true, grant_line: 19, fighting_line: 22, living_line: null,
        mode: 'throwing_wound', fees: { accepted: 100 }, busy: { actor: [2, 2] },
        npc: 'daijisi', relation_line: 132, relation: 'original_teach_pfm_name_differs_from_entry' },
    { skill: 'xiaoyao-jian', ability: 'fei', usage: 'sword', line: 8, minimum: 60, level_line: 28,
        neili: 200, neili_line: 37, effective_dodge: 150, dodge_line: 34, weapon: 'sword', weapon_line: 21,
        target_busy_line: 25, grant: true, grant_line: 13, fighting_line: 18, living_line: 40,
        mode: 'control', fees: { accepted: 120 },
        busy: { actor_hit: [0, 1], actor_miss: [2, 2], target_hit: '4+random(effective_sword/25)' },
        npc: 'yangxiao', relation_line: 132, relation: 'original_teach_pfm' },
    { skill: 'xiaoyao-jian', ability: 'kuai', usage: 'sword', line: 8, minimum: 120, level_line: 26,
        neili: 300, neili_line: 32, weapon: 'sword', weapon_line: 22,
        grant: true, grant_line: 14, fighting_line: 19, living_line: 35,
        mode: 'ordinary_combo', fees: { accepted: '30*N', additional_xy_passive_each: 80 },
        busy: { actor: '1+random(N)', target_step: '1 only if originally not busy and random(3)==1',
            target_passive: '2+random(raw/30)' },
        npc: 'yangxiao', relation_line: 143, relation: 'original_teach_pfm_higher_than_perform_minimum' },
    { skill: 'xiaoyao-jian', ability: 'qi', usage: 'sword', line: 8, minimum: 160, level_line: 28,
        neili: 350, neili_line: 40, raw_force: 160, force_line: 34, max_neili: 2200, max_line: 37,
        weapon: 'sword', weapon_line: 24, grant: true, grant_line: 16, fighting_line: 21, living_line: 43,
        mode: 'direct', attack_type: 'WEAPON_ATTACK', percent: 78,
        fees: { outer_hit: 300, outer_miss: 200 }, busy: { actor_hit: [2, 2], actor_miss: [2, 5] },
        npc: 'yangxiao', relation_line: 155, relation: 'original_teach_pfm' },
    { skill: 'nianhua-zhi', ability: 'fuxue', usage: 'finger', line: 7, minimum: 100, level_line: 18,
        effective_minimum: 150, neili: 200, neili_line: 21, effective_force: 150, force_line: 15,
        target_busy_line: 24, grant: false, fighting_line: 12, living_line: 30, mode: 'control',
        fees: { outer_hit: 100, outer_miss: 30 }, busy: { actor_hit: [0, 0], actor_miss: [3, 3], target_hit: 'raw/19+2' },
        npc: 'fanyao', relation_line: 52, relation: 'npc_owned_mapping_not_public_teaching' },
    { skill: 'sanhua-zhang', ability: 'san', usage: 'strike', line: 8, minimum: 135, level_line: 18,
        neili: 200, neili_line: 24, effective_force: 180, force_line: 21,
        grant: false, fighting_line: 15, living_line: 30, mode: 'direct', attack_type: 'UNARMED_ATTACK', percent: 40,
        fees: { outer_hit: 150, outer_miss: 50 }, busy: { actor_hit: [2, 2], actor_miss: [3, 3] },
        npc: 'fanyao', relation_line: 53, relation: 'npc_owned_mapping_not_public_teaching' },
    { skill: 'longzhua-gong', ability: 'zhua', usage: 'claw', line: 8, minimum: 135, level_line: 23,
        neili: 200, neili_line: 26, grant: false, self_selected: true, fighting_line: 18, living_line: 32,
        mode: 'direct', attack_type: 'UNARMED_ATTACK', percent: 45,
        fees: { outer_hit: 180, outer_miss: 60 }, busy: { actor_hit: [2, 2], actor_miss: [3, 3] },
        npc: 'fanyao', relation_line: 55, relation: 'npc_owned_mapping_not_public_teaching' },
    { skill: 'fengyun-shou', ability: 'qinna', usage: 'hand', line: 8, minimum: 120, level_line: 23,
        neili: 100, neili_line: 26, grant: false, self_selected: true, fighting_line: 18, living_line: 32,
        mode: 'direct_control', attack_type: 'UNARMED_ATTACK', percent: 30,
        fees: { outer_hit: 80, outer_miss: 20 }, busy: { actor_hit: [1, 1], actor_miss: [3, 3],
            target_hit: 'effective_hand/25+2 only after a second independent comparison and !busy' },
        npc: 'fanyao', relation_line: 54, relation: 'npc_owned_mapping_not_public_teaching' },
    { skill: 'pomopima-jian', ability: 'zui', usage: 'sword', line: 8, minimum: 120, level_line: 29,
        neili: 250, neili_line: 32, effective_force: 150, force_line: 26, weapon: 'sword', weapon_line: 22,
        grant: true, grant_line: 16, fighting_line: 19, living_line: 38,
        mode: 'direct', attack_type: 'WEAPON_ATTACK', percent: 70,
        fees: { outer_hit: 200, outer_miss: 100 }, busy: { actor_hit: [2, 2], actor_miss: [3, 3] },
        npc: 'yangxiao', relation_line: 121, relation: 'original_teach_pfm' },
    { skill: 'qiankun-danuoyi', ability: 'nuoyi', usage: 'parry', line: 7, minimum: 50, level_line: 23,
        neili: 400, neili_line: 26, grant: false, fighting_line: 20, living_line: 29,
        mode: 'redirect_or_receive', fees: { accepted: 350 }, busy: { actor: [2, 2], redirected_target: [1, 1] },
        npc: 'zhangwuji', relation_line: 54, relation: 'base_skill_source_not_perform_grant' },
];

// Ordered, reviewed source set for this finite experiment. It is not a self-contained MUDLIB.
export const mingjiaoRemainingPerformSourcePaths = Object.freeze([...new Set([
    ...entries.map(entryPath), ...entries.map(d => skillPath(d.skill)),
    ...entries.map(d => `kungfu/class/mingjiao/${d.npc}.c`),
    'kungfu/skill/shenghuo-xinfa.c', 'kungfu/skill/shenghuo-bu.c', 'kungfu/skill/eff_msg.h',
    ...['force', 'dodge', 'parry', 'cuff', 'hand', 'finger', 'strike', 'claw', 'sword', 'staff',
        'throwing', 'martial-cognize'].map(skillPath),
    'cmds/skill/perform.c', 'cmds/skill/enable.c', 'cmds/skill/prepare.c',
    'cmds/std/hand.c', 'cmds/std/wield.c', 'cmds/std/unwield.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/char/npc.c',
    'inherit/skill/skill.c', 'inherit/skill/force.c', 'inherit/skill/shaolin.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attribute.c', 'feature/command.c',
    'feature/action.c', 'mudcore/inherit/action.c', 'feature/attack.c', 'feature/damage.c',
    'feature/condition.c', 'feature/equip.c', 'feature/move.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'feature/message.c', 'feature/name.c',
    'adm/daemons/combatd.c', 'adm/daemons/masterd.c', 'adm/daemons/itemd.c',
    'clone/weapon/flower_leaf.c', 'inherit/weapon/throwing.c', 'inherit/item/combined.c',
    'inherit/weapon/sword.c', 'inherit/weapon/staff.c', 'inherit/item/item.c', 'inherit/misc/equip.c',
    'inherit/condition/poison.c', 'kungfu/condition/tougu_zhen.c', 'kungfu/condition/yinfeng_dao.c',
    'include/globals.h', 'include/combat.h', 'include/weapon.h', 'include/armor.h',
    'include/skill.h', 'include/command.h', 'include/dbase.h', 'include/name.h',
    'mudcore/include/ansi.h', 'adm/single/simul_efun/message.c', 'mudcore/system/kernel/simul_efun/file.c',
])]);
export const mingjiaoRemainingPerformReviewedSourceHash = '3526c574c5f2329bf8a61d310987855496fc4d6fc0880da3e8e7d4fd53193abe';
export const mingjiaoRemainingPerformAbsentPaths = Object.freeze([...new Set([
    ...entries.flatMap(d => ['c', 'lpc'].map(ext => `kungfu/skill/${d.usage}/${d.ability}.${ext}`)),
    ...entries.map(d => entryPath(d).replace(/\.c$/, '.lpc')),
    ...entries.map(d => skillPath(d.skill).replace(/\.c$/, '.lpc')),
])]);
const evidenceHash = evidence => sha(JSON.stringify(
    mingjiaoRemainingPerformSourcePaths.map(path => [path, evidence[path]])));

const pool = {
    name: '试侠', gender: '男性', race: '人类', class: '', character: '光明磊落',
    str: 36, int: 40, con: 36, dex: 34, shen: 90000, combat_exp: 100000000,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000,
    jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000,
    jiali: 0, potential: 10000, learned_points: 0, reborn: 0, breakup: 0, doing: 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0,
    'special_skill/wuxing': 0, 'tattoo/tattoo_str': 0, 'tattoo/tattoo_int': 0,
    'tattoo/tattoo_con': 0, 'tattoo/tattoo_dex': 0,
};
const standard = type => ({ type, hold: false });
const petals = amount => ({ type: 'throwing', hold: true, program: '/clone/weapon/flower_leaf',
    hand_id: 'flower leaf', amount });
function actor(d, level) {
    const force = Math.max(300, level);
    const a = { skills: { force, 'shenghuo-xinfa': force, parry: level, dodge: level,
        'shenghuo-bu': level, 'martial-cognize': 100, [d.usage]: level, [d.skill]: level },
    mappings: { force: 'shenghuo-xinfa', dodge: 'shenghuo-bu', [d.usage]: d.skill },
    preparations: bare.includes(d.usage) ? { [d.usage]: d.skill } : {}, properties: copy(pool) };
    if (d.grant) a.properties[grantKey(d)] = 1;
    if (d.weapon) a.equipment = standard(d.weapon);
    if (d.ability === 'hua') a.equipment = petals(50);
    return a;
}
function effective(a, usage) {
    let value = Math.trunc((a.skills[usage] ?? 0) / 2) + (a.skills[a.mappings[usage]] ?? 0);
    if (usage === 'dodge' && a.equipment && !a.equipment.hold) value -= 1; // standard 3000-weight primary
    return value;
}
function power(d, a) {
    const main = effective(a, d.usage);
    if (d.ability === 'nuoyi') {
        const level = a.skills[d.skill];
        return level + Math.trunc(effective(a, 'force') * 2 / 3) + (level >= 300 ? level : 0);
    }
    if (['hun', 'feng', 'jue', 'xue', 'zhua'].includes(d.ability)) return main + effective(a, 'force');
    if (d.ability === 'qi') return main + effective(a, 'dodge');
    return main;
}
function target(d, a) {
    const ap = power(d, a), level = a.skills[d.skill];
    const t = { skills: { force: 0, unarmed: 200, parry: 2 * ap, dodge: 0, 'martial-cognize': 100 },
        mappings: {}, preparations: {}, properties: { ...copy(pool), name: '试客' } };
    if (['fei', 'san'].includes(d.ability)) t.skills.dodge = 2 * effective(a, d.usage);
    if (d.ability === 'kuai') t.skills.dodge = level;
    if (d.ability === 'fuxue') t.properties.combat_exp = 150000000;
    if (d.ability === 'hua') t.properties.combat_exp = Math.trunc(
        (a.properties.combat_exp + Math.trunc(level * level / 10) * level) / 2);
    if (d.ability === 'nuoyi') t.skills.dodge = Math.trunc(ap / 2);
    return t;
}
function minimumActor(d) {
    const a = actor(d, d.minimum);
    // The FEI command minimum is below the body's raw basic-learning floors. Keep those floors.
    if (d.ability === 'fei') {
        a.skills.sword = 120; a.skills.dodge = 120; a.skills['shenghuo-bu'] = 91;
    }
    return a;
}
function sourceGate(d, name, line) { return { path: entryPath(d), line, guard: name }; }
const commandGate = (name, line) => ({ path: 'cmds/skill/perform.c', line, guard: name });
function observationPlan(d) {
    const needed = ['exact_USER_identity_and_command_return', 'actual_dispatch_and_refusal_message',
        'before_immediate_after_resources_and_raw_learned_type', 'gross_cost_wound_clamp_and_net_separately',
        'exact_equipment_and_busy_start_calls', 'original_action_and_passive_events_no_extra_query_action'];
    if (d.self_selected) needed.push('single_original_enemy_and_actual_selected_target');
    if (d.poison) needed.push('original_final_target_condition_level_remain_and_owner');
    if (d.ability === 'hua') needed.push('same_original_petals_before_immediate_after',
        'amount_zero_then_original_zero_delay_destruction', 'each_original_item_hit_ob_not_a_synthetic_direct');
    if (d.ability === 'kuai') needed.push('planned_N_vs_actual_attacks', 'XY_passive_cost80_and_busy_separate');
    if (d.ability === 'nuoyi') needed.push('actual_enemy_list_and_role1_to_role2_attacks',
        'independent_outer_comparisons_without_RNG_probe', 'direct_receive_vs_ordinary_redirect');
    return { status: 'unregistered_preparation', record_validator: 'not_implemented',
        required_existing_or_future_evidence: needed, command_cost: 'actual_nonnegative_safe_integer_not_boolean',
        accepted_denominator: 'one_original_command_if_cost_positive', rng: 'original_calls_only_no_forced_distribution',
        natural_busy_release: 'not_prepared_not_observed', natural_poison_lifetime: 'not_prepared_not_observed',
        missing_actual_values: 'unknown_not_zero', original_clock: 'unchanged_no_manual_callback_or_busy_clear' };
}
function mechanics(d) {
    return { source_derived_not_measured: true, mode: d.mode,
        direct_type: d.attack_type ?? null, direct_percent: d.percent ?? null,
        perform_neili_fees: copy(d.fees), busy_support: copy(d.busy), busy_unit: 'original_heartbeat_count_not_seconds',
        costs_exclude: ['public_jiali', 'ordinary_action', 'weapon_hit_ob', 'other_passive', 'natural_recovery'],
        growth: 'original_perform_command_weak_improve_only_if_its_random_gate_passes; retain_raw_type_and_actual_gross',
        poison: d.poison ? { name: d.poison, final_ignores_jiali10_gate: true,
            level: 'jiali+random(jiali)', duration: 'raw/50+random(raw/20)',
            zero_jiali: 'possible_level0_remain0_condition_not_poison_free',
            lifetime: 'unknown_until_separate_original_natural_update_window' } : null };
}
const note = '只准备固定USER原perform输入，尚未注册、没有Record/Effects或真实样本。预存技能/领悟/映射/准备不证明已自然养成、可教学或兼修；范遥四项仅原NPC自用映射依据。200/400/800统一光明磊落、raw36/40/36/34、force/圣火心法max(300,L)，标准剑杖不是原NPC物件。靶参数是分支可达校准，不是同级公平战斗。最低施展与valid_learn/教学门槛分别解释。原命令成本不当布尔，受理不等于命中；精神/气血毛损伤、创伤夹制、毛资源/恢复/净差、弱熟练和拒绝须独立观测。未补自然解控/毒发协议，不冒完整生命周期；jiali0不等无毒。';

function plans() {
    const out = [];
    const add = (d, variant, a, t = target(d, a), extra = {}) => {
        const p = { school: 'mingjiao', family: '明教', collection_group: group,
            skill: d.skill, ability: d.ability, usage: d.usage, level: a.skills[d.skill], variant,
            actor: copy(a), target: copy(t), named_participants: true, fighting: true, room: {},
            target_state: 'living', action: `perform ${d.usage}.${d.ability}${d.self_selected ? '' : ' right'}`,
            observation: 'single_action_immediate', observe_seconds: 0, expected: 'observed',
            not_applicable: '', random_effects: true, formal_samples: 100,
            target_calibration: 'source_branch_support_not_equal_strength',
            qualification_sources: [...mingjiaoRemainingPerformSourcePaths], qualification_note: note,
            relation_source: { path: `kungfu/class/mingjiao/${d.npc}.c`, line: d.relation_line, kind: d.relation },
            preparation_scope: 'experimental_preload_not_natural_acquisition',
            mechanics: mechanics(d), observation_plan: observationPlan(d), ...copy(extra) };
        out.push({ id: `${prefix}${d.skill}-${d.ability}-${variant}`, stage: 'school', method: 'perform', parameters: p });
    };
    for (const d of entries) {
        for (const level of [200, 400, 800]) add(d, `level${level}`, actor(d, level));
        const min = minimumActor(d), mt = target(d, min), lower = copy(min);
        lower.skills[d.skill]--;
        add(d, 'minimum', min, mt, { gate_evidence: sourceGate(d, d.effective_minimum ? 'effective_skill_minimum' : 'raw_skill_minimum', d.level_line) });
        add(d, 'below-minimum', lower, mt, { expected: 'refused', random_effects: false, formal_samples: 2,
            gate_evidence: sourceGate(d, d.effective_minimum ? 'effective_skill_minimum' : 'raw_skill_minimum', d.level_line) });
        const a = actor(d, 400), t = target(d, a);
        const changed = (variant, edit, accepted, gate, extra = {}) => {
            const next = copy(a); edit(next);
            add(d, variant, next, t, { expected: accepted ? 'observed' : 'refused', random_effects: accepted,
                formal_samples: accepted ? 100 : 2, gate_evidence: gate, ...extra });
        };
        for (const n of [d.neili, d.neili - 1]) changed('neili' + n, v => { v.properties.neili = n; },
            n === d.neili, sourceGate(d, 'current_neili', d.neili_line));
        changed('not-fighting', () => {}, false, sourceGate(d, 'fighting', d.fighting_line), { fighting: false });
        changed('unmapped', v => { delete v.mappings[d.usage]; }, false, commandGate('mapped_dispatch', 116));
        changed('actor-busy1', v => { v.busy = 1; }, false, commandGate('busy', 18));
        changed('no-perform', v => { v.temp = { no_perform: 1 }; }, false, commandGate('no_perform', 24));
        changed('unconscious-target', () => {}, d.living_line === null,
            sourceGate(d, d.living_line === null ? 'no_living_gate_in_original' : 'living_target', d.living_line ?? 22),
            { target_state: 'unconscious' });
        for (const resistant of [false, true]) {
            const tt = copy(t);
            tt.skills.parry = resistant ? 20000 : 0;
            tt.skills.dodge = resistant ? 20000 : 0;
            if (['ying', 'fuxue', 'hua'].includes(d.ability)) tt.properties.combat_exp = resistant ? 1000000000 : 1;
            add(d, resistant ? 'resistant-target' : 'weak-target', a, tt,
                { target_calibration: 'explicit_branch_target_only_not_guaranteed_damage' });
        }
        if (d.grant) changed('grant0', v => { v.properties[grantKey(d)] = 0; }, false, sourceGate(d, 'grant', d.grant_line));
        if (bare.includes(d.usage)) changed('unprepared', v => { v.preparations = {}; }, !d.prepared,
            sourceGate(d, d.prepared ? 'prepared_skill' : 'no_prepared_gate_in_original', d.prepared_line ?? d.line));
        if (d.raw_force) for (const n of [d.raw_force, d.raw_force - 1]) changed('raw-force' + n,
            v => { v.skills.force = n; }, n === d.raw_force, sourceGate(d, 'raw_force', d.force_line));
        if (d.effective_force) for (const n of [d.effective_force, d.effective_force - 1]) changed('effective-force' + n,
            v => { delete v.mappings.force; v.skills.force = 2 * n; }, n === d.effective_force,
            sourceGate(d, 'effective_force_unmapped_pair', d.force_line));
        if (d.max_neili) for (const n of [d.max_neili, d.max_neili - 1]) changed('max-neili' + n,
            v => { v.properties.max_neili = n; v.properties.neili = d.neili; }, n === d.max_neili,
            sourceGate(d, 'max_neili_perform_not_body_learning', d.max_line));
        if (d.weapon) {
            changed('no-primary', v => { delete v.equipment; }, false, sourceGate(d, 'primary_weapon', d.weapon_line));
            changed('wrong-primary', v => { v.equipment = standard(d.weapon === 'sword' ? 'staff' : 'sword'); },
                false, sourceGate(d, 'primary_weapon_type', d.weapon_line));
        }
        if (d.target_busy_line || ['qinna', 'kuai'].includes(d.ability)) {
            const tt = copy(t); tt.busy = 2;
            add(d, 'target-busy2', a, tt, { expected: d.target_busy_line ? 'refused' : 'observed',
                random_effects: !d.target_busy_line, formal_samples: d.target_busy_line ? 2 : 100,
                gate_evidence: sourceGate(d, d.target_busy_line ? 'target_busy' : 'busy_does_not_refuse_command', d.target_busy_line ?? d.line) });
        }
        if (d.ability === 'xue') changed('primary-sword', v => { v.equipment = standard('sword'); },
            false, sourceGate(d, 'both_weapon_slots_empty', d.empty_weapons_line));
        if (d.ability === 'fei') for (const n of [150, 149]) changed('effective-dodge' + n,
            v => { delete v.mappings.dodge; v.skills.dodge = 2 * (n + 1); }, n === 150,
            sourceGate(d, 'effective_dodge_includes_standard_sword_minus1', d.dodge_line));
        if (d.ability === 'ying') for (const n of [30, 29]) {
            const aa = actor(d, 200); aa.properties.str = n - 20;
            add(d, 'effective-str' + n, aa, target(d, aa), { expected: n === 30 ? 'observed' : 'refused',
                random_effects: n === 30, formal_samples: n === 30 ? 100 : 2,
                gate_evidence: sourceGate(d, 'query_str_includes_basic_claw200_div10', d.str_line) });
        }
        if (d.poison) changed('jiali50-poison-seed', v => { v.properties.jiali = 50; }, true,
            sourceGate(d, 'final_callback_poison_not_ordinary_hit_ob_gate', 68),
            { poison_window: 'synchronous_seed_only_natural_damage_and_expiry_not_prepared' });
        if (d.ability === 'hua') {
            changed('no-held-item', v => { delete v.equipment; }, false, sourceGate(d, 'handing_throwing', 25));
            changed('wrong-held-item', v => { v.equipment = { type: 'sword', hold: true,
                program: '/tests/sword', hand_id: 'practice weapon' }; }, false, sourceGate(d, 'handing_throwing', 25));
            for (const amount of [9, 10, 11]) changed('petals' + amount, v => { v.equipment.amount = amount; },
                amount >= 10, sourceGate(d, 'original_amount_minimum10', 29),
                { item_window: amount === 10 ? 'needs_immediate_zero_and_original_callout0_destroy_evidence'
                    : 'needs_same_original_item_and_amount_before_immediate_after' });
        }
        if (d.ability === 'kuai') {
            const tt = copy(t); tt.skills.dodge = 3 * a.skills[d.skill];
            add(d, 'xy-passive-impossible', a, tt, { gate_evidence: { path: skillPath(d.skill), line: 166,
                guard: 'target_raw_dodge_exceeds_half_plus_random_support' } });
            for (const [key, n, label] of [[d.skill, 129, 'xy-raw129'], [d.skill, 130, 'xy-raw130'],
                ['dodge', 179, 'xy-dodge179'], ['dodge', 180, 'xy-dodge180'],
                ['force', 149, 'xy-force149'], ['force', 150, 'xy-force150']]) {
                const aa = copy(a), passiveTarget = copy(t);
                aa.skills[key] = n; passiveTarget.skills.dodge = 0;
                add(d, label, aa, passiveTarget, { gate_evidence: { path: skillPath(d.skill), line: 159,
                    guard: 'ordinary_XY_passive_boundary_not_perform_refusal' },
                passive_target_calibration: 'raw_dodge0_does_not_mask_boundary; original_busy_and_hit_path_still_required' });
            }
        }
        if (d.ability === 'nuoyi') {
            for (const level of [299, 300]) add(d, 'ap-tier' + level, actor(d, level));
            for (const level of [200, 400, 800]) {
                const aa = actor(d, level), tt = target(d, aa), third = copy(tt);
                third.properties.name = '试伴';
                add(d, 'third-enemy-level' + level, aa, tt, { extra_target: third, extra_target_fighting: true,
                    role_contract: 'original_actor_enemies_1_and_2; actual_role1_attack_role2_only_after_original_branch' });
            }
            const tt = copy(t); tt.skills.force = 0; tt.skills.dodge = 2 * Math.trunc(power(d, a) / 3) - 1;
            add(d, 'middle-no-third', a, tt, { branch_support: 'self_hit_impossible; original_second_random_allows_resist_or_no_other_enemy' });
            const third = copy(tt); third.properties.name = '试伴';
            add(d, 'middle-with-third', a, tt, { branch_support: 'self_hit_impossible; original_second_random_allows_resist_or_actual_redirect',
                extra_target: third, extra_target_fighting: true,
                role_contract: 'original_actor_enemies_1_and_2; actual_role1_attack_role2; loop_redraw_each_comparison' });
        }
    }
    assert.equal(out.length, 328);
    assert.equal(new Set(out.map(c => c.id)).size, out.length);
    return out;
}
const reviewedPlans = new Map(plans().map(c => [c.id, c]));

function sourceEntry(d, evidence) {
    const path = entryPath(d);
    return { id: `${path}:${d.line}:perform`, path, line: d.line, function: 'perform', role: 'perform', sha256: evidence[path] };
}
function baseSource(d, evidence) { return { path: skillPath(d.skill), sha256: evidence[skillPath(d.skill)] }; }
function plain(value) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'expected mapping');
    return value;
}
function verifyCatalog(catalog, evidence) {
    assert.ok(Array.isArray(catalog?.skills), 'missing actual catalog');
    for (const d of entries) {
        const e = sourceEntry(d, evidence), matches = catalog.skills.filter(s => s.path === e.path);
        assert.equal(matches.length, 1, 'ambiguous/missing perform source ' + e.path);
        const s = matches[0];
        assert.equal(s.sha256, e.sha256); assert.equal(s.base_skill, d.skill);
        assert.equal(s.id, `${d.skill}/${d.ability}`); assert.equal(s.top_level, false);
        assert.ok(Array.isArray(s.entries));
        const found = s.entries.filter(x => x.id === e.id || x.function === 'perform');
        assert.equal(found.length, 1, 'ambiguous/missing original perform entry');
        const original = found[0];
        assert.equal(original.id, e.id); assert.equal(original.function, e.function); assert.equal(original.role, e.role);
        for (const key of ['path', 'line', 'sha256']) assert.equal(original.evidence?.[key], e[key]);
        const bases = catalog.skills.filter(x => x.path === skillPath(d.skill));
        assert.equal(bases.length, 1, 'ambiguous/missing base source');
        assert.equal(bases[0].id, d.skill); assert.equal(bases[0].base_skill, d.skill);
        assert.equal(bases[0].top_level, true); assert.equal(bases[0].sha256, evidence[skillPath(d.skill)]);
    }
}
export function mingjiaoRemainingPerformConditions(catalog, readSource, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean'); assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(mingjiaoRemainingPerformSourcePaths.map(path => {
        const bytes = readSource(path);
        assert.ok((Buffer.isBuffer(bytes) || typeof bytes === 'string') && bytes.length > 0, 'missing source bytes ' + path);
        return [path, sha(bytes)];
    }));
    assert.equal(evidenceHash(evidence), mingjiaoRemainingPerformReviewedSourceHash, 'source changed: review required');
    for (const path of mingjiaoRemainingPerformAbsentPaths) {
        let absent = false;
        try { readSource(path); } catch (error) { if (error?.code === 'ENOENT') absent = true; else throw error; }
        assert.ok(absent, 'basic fallback appeared or absence not evidenced: ' + path);
    }
    verifyCatalog(catalog, evidence);
    return [...reviewedPlans.values()].map(plan => {
        const c = copy(plan);
        const d = entries.find(x => x.skill === c.parameters.skill && x.ability === c.parameters.ability);
        const e = sourceEntry(d, evidence);
        return { ...c, entry_id: e.id, status: 'prepared_not_sampled', samples: smoke ? 2 : c.parameters.formal_samples,
            parameters: { ...c.parameters, run_mode: smoke ? 'smoke' : 'formal',
                source_entry: e, base_source: baseSource(d, evidence),
                source_evidence: copy(evidence), reviewed_source_hash: mingjiaoRemainingPerformReviewedSourceHash,
                qualification_evidence: mingjiaoRemainingPerformSourcePaths.map(path => ({ path, sha256: evidence[path] })),
                absent_sources: [...mingjiaoRemainingPerformAbsentPaths] } };
    });
}
export function validateMingjiaoRemainingPerformCondition(condition) {
    plain(condition);
    assert.deepEqual(Object.keys(condition).sort(), ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = reviewedPlans.get(condition.id); assert.ok(plan, 'unreviewed condition');
    assert.equal(condition.stage, plan.stage); assert.equal(condition.method, plan.method);
    assert.equal(condition.status, 'prepared_not_sampled');
    const { run_mode, source_entry, base_source, source_evidence, reviewed_source_hash, qualification_evidence, absent_sources,
        ...parameters } = plain(condition.parameters);
    assert.ok(['formal', 'smoke'].includes(run_mode), 'missing or invalid collection mode');
    assert.equal(condition.samples, run_mode === 'smoke' ? 2 : plan.parameters.formal_samples,
        'sample count does not match the explicit collection mode');
    assert.deepEqual(parameters, plan.parameters, 'fixed parameters drifted');
    plain(source_evidence);
    assert.deepEqual(Object.keys(source_evidence), [...mingjiaoRemainingPerformSourcePaths]);
    for (const digest of Object.values(source_evidence)) {
        assert.equal(typeof digest, 'string'); assert.match(digest, /^[a-f0-9]{64}$/);
    }
    assert.equal(evidenceHash(source_evidence), mingjiaoRemainingPerformReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoRemainingPerformReviewedSourceHash);
    assert.deepEqual(qualification_evidence,
        mingjiaoRemainingPerformSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    assert.deepEqual(absent_sources, [...mingjiaoRemainingPerformAbsentPaths]);
    const d = entries.find(x => x.skill === parameters.skill && x.ability === parameters.ability);
    assert.deepEqual(source_entry, sourceEntry(d, source_evidence)); assert.equal(condition.entry_id, source_entry.id);
    assert.deepEqual(base_source, baseSource(d, source_evidence));
    return condition.parameters;
}
