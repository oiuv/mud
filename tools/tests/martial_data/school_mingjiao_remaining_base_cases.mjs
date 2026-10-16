// Unregistered finite preparation. No driver, RNG, samples, game writes or raw-record validator.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const copy = value => structuredClone(value);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const group = 'mingjiao-remaining-base';
const pathOf = skill => `kungfu/skill/${skill}.c`;
// Actual practice cost differs from its gate. In particular pili-shou consumes qi 6, not 60.
// Columns: id, usage, action line (0 = absent), enable/learn/practice lines, qi/neili gates,
// qi/neili costs, practice equipment guard, learn equipment guard, force gate, raw force?,
// max_neili gate, minimum basic level, original NPC source.
const rows = [
    ['pili-quan', 'cuff', 68, 36, 42, 76, 80, 80, 55, 45, '', 'empty', 20, false, 100, 20, 'lengqian'],
    ['pili-shou', 'hand', 129, 99, 103, 137, 80, 80, 6, 64, '', 'empty', 120, false, 900, 80, 'xiexun'],
    ['tougu-zhen', 'finger', 87, 57, 61, 95, 100, 100, 80, 80, '', 'empty', 200, false, 1400, 100, 'yintianzheng'],
    ['yinfeng-dao', 'strike', 86, 56, 60, 94, 100, 100, 80, 80, '', 'empty', 200, false, 1400, 100, 'yintianzheng'],
    ['yinhu-zhang', 'staff', 111, 78, 82, 120, 80, 80, 75, 78, 'staff', 'staff', 140, true, 200, 60, 'daijisi'],
    ['sougu-yingzhua', 'claw', 94, 69, 71, 102, 70, 70, 60, 67, 'empty', 'empty', 50, false, 250, 0, 'weiyixiao'],
    ['duoming-jinhua', 'throwing', 0, 18, 3, 22, 40, 50, 35, 48, '', '', 80, false, 500, 0, 'daijisi'],
    ['xiaoyao-jian', 'sword', 181, 128, 130, 189, 60, 90, 50, 82, 'sword', '', 120, true, 2500, 120, 'yangxiao'],
    ['nianhua-zhi', 'finger', 130, 103, 107, 138, 70, 70, 50, 64, 'empty', 'empty', 60, false, 300, 0, 'fanyao'],
    ['sanhua-zhang', 'strike', 68, 44, 48, 72, 70, 70, 65, 66, 'empty', 'empty', 60, true, 300, 0, 'fanyao'],
    ['longzhua-gong', 'claw', 159, 132, 136, 168, 70, 80, 60, 69, 'empty', 'empty', 50, false, 250, 0, 'fanyao'],
    ['fengyun-shou', 'hand', 117, 90, 94, 125, 70, 80, 65, 69, 'empty', 'empty', 40, false, 200, 0, 'fanyao'],
    ['pomopima-jian', 'sword', 101, 79, 81, 110, 60, 60, 55, 55, 'sword', '', 20, false, 100, 0, 'yangxiao'],
];
export const mingjiaoRemainingBaseProfiles = Object.freeze(rows.map(r => Object.freeze({
    skill: r[0], usage: r[1], action_line: r[2], enable_line: r[3], learn_line: r[4], practice_line: r[5],
    qi_gate: r[6], neili_gate: r[7], qi_cost: r[8], neili_cost: r[9], practice_equipment: r[10],
    learn_equipment: r[11], force_gate: r[12], raw_force_gate: r[13], max_neili_gate: r[14],
    basic_gate: r[15], npc: r[16], weapon: ['sword', 'staff'].includes(r[1]) ? r[1] : '',
})));
const profiles = mingjiaoRemainingBaseProfiles;
const cold = Object.freeze({ skill: 'hanbing-mianzhang', usage: 'strike', action_line: 129,
    enable_line: 99, learn_line: 103, practice_line: 137, npc: 'weiyixiao', weapon: '' });
const all = [...profiles, cold];
const find = skill => all.find(p => p.skill === skill);
const hitLines = { 'hanbing-mianzhang': 149, 'yinfeng-dao': 106, 'tougu-zhen': 107, 'xiaoyao-jian': 159 };
const poisons = [
    { skill: 'hanbing-mianzhang', condition: 'ice_poison', base_divisor: 50, random_divisor: 20 },
    { skill: 'yinfeng-dao', condition: 'yinfeng_dao', base_divisor: 100, random_divisor: 10 },
    { skill: 'tougu-zhen', condition: 'tougu_zhen', base_divisor: 100, random_divisor: 10 },
];
export const mingjiaoRemainingBaseSourcePaths = Object.freeze([...new Set([
    ...all.map(p => pathOf(p.skill)), 'kungfu/skill/shenghuo-xinfa.c',
    ...['daijisi', 'fanyao', 'lengqian', 'weiyixiao', 'xiaozhao', 'xiexun', 'yangxiao', 'yintianzheng', 'zhangwuji']
        .map(n => `kungfu/class/mingjiao/${n}.c`), 'kungfu/class/mingjiao/mingjiao.h',
    ...['cuff', 'hand', 'finger', 'strike', 'claw', 'staff', 'sword', 'throwing', 'unarmed', 'parry', 'dodge', 'force', 'martial-cognize']
        .map(pathOf), ...poisons.map(p => `kungfu/condition/${p.condition}.c`),
    'inherit/condition/poison.c', 'inherit/skill/skill.c', 'inherit/skill/shaolin.c', 'inherit/skill/force.c',
    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'cmds/skill/enable.c', 'cmds/skill/prepare.c',
    'feature/skill.c', 'feature/attack.c', 'feature/action.c', 'feature/damage.c', 'feature/condition.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/equip.c', 'feature/name.c', 'feature/command.c',
    'feature/message.c', 'feature/move.c', 'mudcore/inherit/action.c', 'mudcore/inherit/dbase.c',
    'clone/user/user.c', 'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/weapon/staff.c',
    'inherit/misc/equip.c', 'adm/daemons/combatd.c', 'adm/daemons/race/human.c',
    'adm/single/simul_efun/message.c', 'adm/single/simul_efun/chinese.c', 'adm/daemons/chinesed.c',
    'data/e2c_dict.o', 'include/globals.h', 'include/command.h', 'include/skill.h', 'include/combat.h',
    'include/condition.h', 'include/weapon.h', 'mudcore/include/ansi.h',
])]);
export const mingjiaoRemainingBaseReviewedSourceHash = '9640518d8ee98b6ba03a8d84d55be902510ac89c19c25b8b31b047f0fa1940d1';
const evidenceHash = e => sha(JSON.stringify(mingjiaoRemainingBaseSourcePaths.map(p => [p, e[p]])));
const pool = {
    name: '试侠', gender: '男性', race: '人类', character: '光明磊落', class: '',
    str: 36, int: 40, con: 36, dex: 34, combat_exp: 100000000, shen: 0,
    qi: 1000000, eff_qi: 1000000, max_qi: 1000000, jing: 1000000, eff_jing: 1000000, max_jing: 1000000,
    neili: 9000, max_neili: 9000, jingli: 1000, max_jingli: 1000, jiali: 0,
    potential: 10000, learned_points: 0, reborn: 0, breakup: 0, doing: 0,
    'family/family_name': '明教', 'env/auto_regenerate': 0, 'env/no_learn': 0,
    'immune/poison': 0, 'special_skill/piyi': 0,
};
const neutral = level => ({ skills: { unarmed: level, parry: level, dodge: level,
    force: Math.max(300, level), 'shenghuo-xinfa': Math.max(300, level), 'martial-cognize': 100 },
    mappings: { force: 'shenghuo-xinfa' }, preparations: {}, properties: copy(pool) });
function actor(p, level) {
    const a = neutral(level); a.skills[p.usage] = level; a.skills[p.skill] = level;
    a.mappings[p.usage] = p.skill;
    if (p.action_line) a.mappings.parry = p.skill;
    if (p.weapon) a.equipment = { type: p.weapon, hold: false };
    else if (p.usage !== 'throwing') a.preparations[p.usage] = p.skill;
    return a;
}
function sourceEntry(p, fn) {
    const line = fn === 'hit_ob' ? hitLines[p.skill] : p[{
        query_action: 'action_line', valid_enable: 'enable_line', valid_learn: 'learn_line', practice_skill: 'practice_line',
    }[fn]];
    assert.ok(Number.isSafeInteger(line) && line > 0, `no original ${p.skill}.${fn}`);
    return { function: fn, line, entry_id: `${pathOf(p.skill)}:${line}:${fn}` };
}
function plans() {
    const out = [];
    function add(p, kind, variant, level, a, options = {}) {
        const method = options.method ?? 'interface';
        const fn = options.fn ?? (method === 'ordinary' ? kind === 'parry' ? 'valid_enable' : 'query_action'
            : method === 'condition' ? 'hit_ob' : method === 'practice' ? 'practice_skill' : kind);
        const entry = sourceEntry(p, fn), randomized = options.randomized ?? method === 'ordinary';
        const action = method === 'ordinary' ? 'ordinary' : method === 'practice' ? `practice ${p.usage} 1`
            : method === 'condition' ? 'original_condition_heartbeat' : 'test_interface';
        out.push({ id: `school-mingjiao-remaining-${p.skill}-${kind}-l${level}-${variant}`,
            stage: 'school', method, entry_id: method === 'ordinary' ? pathOf(p.skill) : entry.entry_id,
            parameters: {
                school: 'mingjiao', family: '明教', collection_group: group, skill: p.skill, usage: p.usage,
                ability: kind, variant, level, actor: copy(a), target: copy(options.target ?? neutral(level)),
                named_participants: true, fighting: ['ordinary', 'condition'].includes(method), room: {}, action,
                ...(kind === 'parry' ? { observation_role: 'defense' } : {}),
                observation: method === 'condition' ? 'original_condition_heartbeat' : 'single_action_immediate',
                observe_seconds: method === 'condition' ? 600 : 0,
                randomized, formal_samples: randomized ? 100 : 2,
                expected: options.refused ? 'refused' : 'observed', not_applicable: '',
                source_entry: entry, npc_source: `kungfu/class/mingjiao/${p.npc}.c`,
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + p.skill,
                    function: fn, ...options.interface } } : {}),
                requirements: copy(options.requirements ?? {}),
                integration: { registered: false, native_samples: 'not_collected',
                    missing: ['collection_registration', 'case_dispatch', 'strict_raw_record_and_effect_validation',
                        ...(method === 'practice' ? ['original_public_practice_command_observation'] : []),
                        ...(kind === 'poison' || kind === 'busy_passive' ? ['original_hit_ob_observation_binding'] : []),
                        ...(method === 'condition' ? ['original_ordinary_seed', 'victim_side_1_condition_and_heartbeat_observation',
                            'post_clear_snapshot', 'seed_miss_not_lifecycle_completion'] : [])] },
                qualification_sources: [...mingjiaoRemainingBaseSourcePaths],
                qualification_note: '仅有限未注册条件准备，不是原生采集或runner已支持。真实非巫师USER；无绝招许可、互搏、虚构组合和默认特殊天赋。'
                    + '等级和资源为实验初态，不代表自然师承；仅指定守卫对照偏离基础/特殊同级及force+心法max(300,L)。'
                    + 'practice_skill接口不代替公开practice的映射、valid_learn、can_learn和经验资格。'
                    + '普通招架走公共combatd，不调用不存在的防御hook。来源预测不是观察；未提供的实际记录不能补零。'
                    + '生命周期只允许原普通命中作种子，无主动feng/jue/final，无直接注入condition、强选随机、重试直到成功或加速心跳；600秒仅故障看门狗，超时不算解除。',
            } });
    }
    for (const p of profiles) {
        if (p.action_line) {
            for (const l of [200, 400, 800]) {
                add(p, 'ordinary', 'baseline', l, actor(p, l), { method: 'ordinary' });
                const t = actor(p, l); t.mappings = { force: 'shenghuo-xinfa', parry: p.skill }; t.preparations = {};
                add(p, 'parry', 'mapped', l, neutral(l), { method: 'ordinary', target: t,
                    requirements: { observation_role: 'defense', entry: 'original_common_parry', independent_defense_hook: false } });
                if (l === 200) {
                    const u = copy(t); delete u.mappings.parry;
                    add(p, 'parry', 'unmapped-control', l, neutral(l), { method: 'ordinary', target: u,
                        requirements: { observation_role: 'defense', entry: 'original_common_parry', independent_defense_hook: false } });
                }
            }
            const a = actor(p, 200); delete a.mappings[p.usage];
            add(p, 'ordinary', 'unmapped-control', 200, a, { method: 'ordinary',
                requirements: { selected_action: 'observe_original_fallback_not_special_skill' } });
            if (!p.weapon) {
                const bare = actor(p, 200); bare.preparations = {};
                add(p, 'ordinary', 'no-prepare-control', 200, bare, { method: 'ordinary',
                    requirements: { selected_action: 'observe_original_unarmed_fallback_not_special_skill' } });
            }
        }
        // Own practice interface: no implicit command, valid_learn or learning progression.
        for (const [v, qi, neili, ok] of [
            ['minimum', p.qi_gate, p.neili_gate, true], ['qi-below', p.qi_gate - 1, p.neili_gate, false],
            ['neili-below', p.qi_gate, p.neili_gate - 1, false],
        ]) {
            const a = actor(p, 200); Object.assign(a.properties, { qi, neili });
            add(p, 'practice_skill', v, 200, a, { refused: !ok,
                requirements: { expected_return: Number(ok), qi_cost: ok ? p.qi_cost : 0,
                    neili_cost: ok ? p.neili_cost : 0, learned_gain: 0, gate_scope: 'skill_interface_only' } });
        }
        if (p.practice_equipment) {
            const a = actor(p, 200);
            if (p.practice_equipment === 'empty') a.equipment = { type: 'sword', hold: false };
            else delete a.equipment;
            add(p, 'practice_skill', 'equipment-refusal', 200, a, { refused: true,
                requirements: { expected_return: 0, qi_cost: 0, neili_cost: 0, learned_gain: 0, gate_scope: 'skill_interface_only' } });
        }
        // Public practice requires basic > special, not the ordinary-combat equality baseline.
        for (const l of [200, 400, 800]) {
            const a = actor(p, l); a.skills[p.usage] = l + 1;
            add(p, 'public_practice', 'basic-plus-one', l, a, { method: 'practice',
                requirements: { command_return: 1, completed: 1, qi_cost: p.qi_cost, neili_cost: p.neili_cost,
                    gates: ['mapped_basic', 'basic_gt_special', 'valid_learn', 'can_learn', 'can_improve_skill'],
                    learned_gain: 'observe_original_practice_and_improve_skill' } });
        }
        add(p, 'public_practice', 'basic-equal-refusal', 200, actor(p, 200), { method: 'practice', refused: true,
            requirements: { command_return: 0, completed: 0, qi_cost: 0, neili_cost: 0, learned_gain: 0,
                gate: 'cmds/skill/practice.c:57' } });
        // Minimum source learning conditions; does not invent apprenticeships or can_learn grants.
        const minimum = actor(p, 200); minimum.properties.max_neili = p.max_neili_gate;
        minimum.properties.neili = p.max_neili_gate;
        if (p.raw_force_gate) minimum.skills.force = p.force_gate;
        else { minimum.skills.force = 2 * p.force_gate; delete minimum.mappings.force; }
        if (p.skill === 'xiaoyao-jian') { minimum.properties.int = 30; minimum.skills.dodge = 120; }
        for (const [v, change] of [['minimum', () => {}], ['max-neili-below', a => { a.properties.max_neili--; a.properties.neili--; }],
            ['force-below', a => { a.skills.force -= p.raw_force_gate ? 1 : 2; }],
            ['basic-below-special', a => { a.skills[p.usage] = 199; }]]) {
            const a = copy(minimum); change(a);
            add(p, 'valid_learn', v, 200, a, { refused: v !== 'minimum',
                requirements: { expected_return: Number(v === 'minimum'), qi_cost: 0, neili_cost: 0,
                    gate_scope: 'original_valid_learn_only', force_gate_kind: p.raw_force_gate ? 'basic' : 'effective' } });
        }
        if (p.learn_equipment) {
            const a = copy(minimum);
            if (p.learn_equipment === 'empty') a.equipment = { type: 'sword', hold: false };
            else delete a.equipment;
            add(p, 'valid_learn', 'equipment-refusal', 200, a, { refused: true,
                requirements: { expected_return: 0, gate_scope: 'original_valid_learn_only' } });
        }
    }
    // Direct original hit_ob boundary calls are NOT normal attack/qualification evidence.
    for (const poison of poisons) {
        const p = find(poison.skill);
        const support = (level, jiali) => ({ condition_name: poison.condition,
            level_range: [jiali, 2 * jiali - 1], duration_base: Math.trunc(level / poison.base_divisor),
            duration_random_bound: Math.trunc(level / poison.random_divisor),
            duration_expression: `lvl/${poison.base_divisor}+random(lvl/${poison.random_divisor})`,
            source: `${pathOf(p.skill)}:${hitLines[p.skill]}`, claim: 'source_support_not_observed' });
        const iface = (variant, level, jiali, blocked = '', edit = () => {}) => {
            const a = actor(p, level), t = neutral(level); a.properties.jiali = jiali;
            t.skills.force = 0; delete t.mappings.force;
            const i = { damage: 100, factor: 0 }; edit(a, t, i);
            add(p, 'poison', variant, level, a, { fn: 'hit_ob', target: t, interface: i,
                randomized: !blocked, requirements: { layer: 'direct_original_hit_ob', guard: blocked || 'eligible',
                    expected_condition: blocked ? 'absent' : 'present',
                    ...(blocked ? { expected_return: 0 } : { poison_support: support(level, jiali) }),
                    not_proof_of: ['ordinary_hit', 'player_learning_qualification', 'condition_tick_or_removal'] } });
        };
        iface('level79-jiali10', 79, 10, 'level_below_80');
        iface('level80-jiali0', 80, 0, 'jiali_below_10');
        iface('level80-jiali9', 80, 9, 'jiali_below_10');
        iface('level80-jiali10', 80, 10);
        for (const l of [200, 400, 800]) iface('legal-level' + l, l, 10);
        iface('zero-incoming', 200, 10, 'zero_damage', (a, t, i) => { i.damage = 0; });
        iface('force-blocks', 200, 10, 'force_gate', (a, t) => { t.skills.force = 440; });
        iface('piyi', 200, 10, 'piyi', (a, t) => { t.properties['special_skill/piyi'] = 1; });
        iface('immune-still-seeded', 200, 10, '', (a, t) => { t.properties['immune/poison'] = -1; });
        iface('nopoison-still-seeded', 200, 10, '', (a, t) => { t.temp = { nopoison: 1 }; });
        for (const l of [200, 400, 800]) {
            const a = actor(p, l), t = neutral(l); a.properties.jiali = 10;
            t.skills.force = 80; delete t.mappings.force;
            add(p, 'ordinary_poison', 'nonzero-jiali', l, a, { method: 'ordinary', target: t,
                requirements: { layer: 'original_ordinary_hit_ob', poison_support: support(l, 10),
                    eligible_only_after: 'original_hit_and_positive_damage',
                    condition_tick_or_removal_observed: false, effect_not_guaranteed: true } });
        }
        for (const mode of ['normal', 'immune', 'nopoison', 'piyi']) {
            const a = actor(p, 200), t = neutral(200); a.properties.jiali = 10;
            t.skills.force = 80; delete t.mappings.force; // effective40: successful poison always decays on its original ticks.
            if (mode === 'immune') t.properties['immune/poison'] = -1;
            if (mode === 'piyi') t.properties['special_skill/piyi'] = 1;
            if (mode === 'nopoison') t.temp = { nopoison: 1 };
            add(p, 'poison_lifecycle', mode, 200, a, { method: 'condition', target: t, randomized: true,
                requirements: { seed_mode: 'original_ordinary', seed_side: 0, victim_side: 1, seed_attempts: 1,
                    seed_action: 'ordinary', stop_combat_after_seed: true, heartbeat_side: 1,
                    condition_name: poison.condition, poison_support: support(200, 10),
                    tick_clock: 'original_char_next_beat', completion: 'original_condition_removal',
                    allow_seed_miss: true, seed_miss_completes_lifecycle: false,
                    after_seed_when_absent: 'record_no_seed_no_fabricated_tick',
                    expected_mode: mode === 'normal' ? 'original_damage_and_natural_removal'
                        : mode === 'piyi' ? 'no_condition_at_seed' : 'seed_then_clear_on_original_tick',
                    required_raw: ['seed_attacks', 'seed_passives', 'immediate_condition', 'condition_events',
                        'victim_original_heartbeats', 'after_clear_conditions', 'gross_resource_metrics'],
                    watchdog_seconds: 600, watchdog_is_effect_duration: false, preset_condition: false } });
        }
    }
    const sword = find('xiaoyao-jian');
    const busy = (v, level, edit = () => {}, blocked = false) => {
        const a = actor(sword, level), t = neutral(level); const i = { damage: 100 };
        edit(a, t, i);
        add(sword, 'busy_passive', v, level, a, { fn: 'hit_ob', target: t, interface: i,
            randomized: !blocked, requirements: { layer: 'direct_original_hit_ob', guard_blocks: blocked,
                fee_on_proc: 80, minimum_neili: 150, minimum_basic_dodge: 180, minimum_basic_force: 150,
                minimum_special: 130, proc_test: 'lvl/2+random(lvl)>=target_basic_dodge',
                busy_argument: `2+random(${Math.trunc(level / 30)})`,
                returned_integer_on_proc: 1, common_combat_adds_returned_damage: true,
                public_busy_result: 'observe_original_start_busy_not_argument_as_duration',
                ...(blocked ? { expected_return: 0, neili_cost: 0, target_busy_unchanged: true } : {}) } });
    };
    for (const l of [200, 400, 800]) busy('baseline', l);
    busy('level129', 129, () => {}, true);
    busy('level130-qualified', 130, (a, t) => { a.skills.dodge = 180; t.skills.dodge = 0; });
    for (const [field, gate] of [['neili', 150], ['dodge', 180], ['force', 150]]) {
        for (const below of [true, false]) busy(`${field}-${below ? 'below' : 'minimum'}`, 200, (a, t) => {
            (field === 'neili' ? a.properties : a.skills)[field] = gate - Number(below); t.skills.dodge = 0;
        }, below);
    }
    busy('target-busy', 200, (a, t) => { t.busy = 2; }, true);
    busy('dodge-impossible', 200, (a, t) => { t.skills.dodge = 300; }, true);
    busy('dodge-boundary-possible', 200, (a, t) => { t.skills.dodge = 299; });
    // This original function does not gate damage_bonus. Do not copy the poison zero-damage gate here.
    busy('zero-incoming', 200, (a, t, i) => { i.damage = 0; t.skills.dodge = 0; });
    assert.equal(new Set(out.map(c => c.id)).size, out.length);
    return out;
}

// Private canonical values only; factories still return fresh plans. Every supplied
// condition is checked again, including inputs mutated after a previous validation.
const reviewedPlansById = new Map(plans().map(condition => [condition.id, condition]));

function bindings(catalog, evidence) {
    assert.ok(Array.isArray(catalog?.skills));
    for (const p of all) {
        const matching = catalog.skills.filter(s => s.id === p.skill); assert.equal(matching.length, 1, p.skill);
        const s = matching[0]; assert.equal(s.path, pathOf(p.skill)); assert.equal(s.sha256, evidence[s.path]);
        for (const fn of ['valid_enable', 'valid_learn', 'practice_skill', ...(p.action_line ? ['query_action'] : []),
            ...(hitLines[p.skill] ? ['hit_ob'] : [])]) {
            const wanted = sourceEntry(p, fn), entries = s.entries?.filter(e => e.function === fn);
            assert.equal(entries?.length, 1, `catalog entry ${p.skill}.${fn}`);
            const e = entries[0]; assert.equal(e.id, wanted.entry_id);
            assert.equal(e.evidence?.line, wanted.line); assert.equal(e.evidence?.path, s.path);
            assert.equal(e.evidence?.sha256, s.sha256);
        }
        if (!p.action_line) assert.ok(!s.entries.some(e => e.function === 'query_action'), 'no invented duoming action');
    }
}
export function mingjiaoRemainingBaseConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.equal(typeof readSource, 'function'); assert.equal(typeof smoke, 'boolean');
    assert.equal(samples, 100, 'reviewed independent formal distribution is 100; smoke is separate');
    const evidence = Object.fromEntries(mingjiaoRemainingBaseSourcePaths.map(path => {
        const bytes = readSource(path); assert.ok((typeof bytes === 'string' || Buffer.isBuffer(bytes)) && bytes.length, path);
        return [path, sha(bytes)];
    }));
    assert.equal(evidenceHash(evidence), mingjiaoRemainingBaseReviewedSourceHash, 'source drift: review required');
    bindings(catalog, evidence);
    return plans().map(c => ({ ...c, status: 'prepared_not_sampled', samples: smoke ? 2 : c.parameters.formal_samples,
        parameters: { ...c.parameters, run_mode: smoke ? 'smoke' : 'formal', source_evidence: copy(evidence),
            reviewed_source_hash: mingjiaoRemainingBaseReviewedSourceHash,
            base_source: { id: c.parameters.skill, path: pathOf(c.parameters.skill), sha256: evidence[pathOf(c.parameters.skill)] },
            qualification_evidence: mingjiaoRemainingBaseSourcePaths.map(path => ({ path, sha256: evidence[path] })) } }));
}
export function validateMingjiaoRemainingBaseCondition(condition) {
    assert.ok(condition && typeof condition === 'object' && !Array.isArray(condition));
    assert.deepEqual(Object.keys(condition).sort(), ['entry_id', 'id', 'method', 'parameters', 'samples', 'stage', 'status']);
    const plan = reviewedPlansById.get(condition.id); assert.ok(plan, 'unreviewed remaining-base condition');
    for (const key of ['entry_id', 'stage', 'method']) assert.equal(condition[key], plan[key]);
    assert.equal(condition.status, 'prepared_not_sampled');
    const { run_mode, source_evidence, reviewed_source_hash, base_source, qualification_evidence, ...p } = condition.parameters;
    assert.ok(['smoke', 'formal'].includes(run_mode));
    assert.equal(condition.samples, run_mode === 'smoke' ? 2 : plan.parameters.formal_samples);
    assert.deepEqual(p, plan.parameters, 'reviewed conditions changed');
    assert.deepEqual(Object.keys(source_evidence), [...mingjiaoRemainingBaseSourcePaths]);
    for (const value of Object.values(source_evidence)) assert.match(value, /^[a-f0-9]{64}$/);
    assert.equal(evidenceHash(source_evidence), mingjiaoRemainingBaseReviewedSourceHash);
    assert.equal(reviewed_source_hash, mingjiaoRemainingBaseReviewedSourceHash);
    assert.deepEqual(base_source, { id: p.skill, path: pathOf(p.skill), sha256: source_evidence[pathOf(p.skill)] });
    assert.deepEqual(qualification_evidence, mingjiaoRemainingBaseSourcePaths.map(path => ({ path, sha256: source_evidence[path] })));
    return condition.parameters;
}
