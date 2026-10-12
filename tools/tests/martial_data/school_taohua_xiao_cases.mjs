// Finite original XIAO conditions and raw-record validation; not a balance assessment.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/xiao';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性' };

export const taohuaXiaoFixtureRequirements = [
    'Register only after the current shared-input freeze ends; freeze this module, its dependencies, the exact game/LPC fixtures and the finite conditions in a new series.',
    'Reuse the original perform finger.xiao right command on two connected nonwizard USERs; named_participants must use original set_name/present aliases, not just set id.',
    'Extend only this group snapshot with the xiao grant, actual secondary_weapon/details, and fighting_opponent; retain all original skill, learned, mapping, preparation, equipment and resource snapshots.',
    'Allow this group through the existing original unconcious preparation, including killing relationships, before/after/terminals and counter isolation; do not call revive or a synthetic busy timer.',
    'Reuse existing launch/refusal and resource observations, no new probe: jing damage and eff_jing wound are not COMBAT_D do_damage; do not require unobserved actions/directs arrays to look empty.',
    'Keep gross target neili deduction, original set(0) correction, net loss and final value separate; the correction is not healing and zero net loss does not mean zero attempted deduction.',
    'Report each frozen condition via taohuaXiaoEffects(rows, condition), with accepted/hit/refused and learned progress denominators separate; do not read raw.parameters or combine historical missing evidence.',
];

export const taohuaXiaoSourcePaths = [
    'kungfu/skill/tanzhi-shentong/xiao.c', 'kungfu/skill/tanzhi-shentong.c',
    'kungfu/skill/finger.c', 'kungfu/skill/force.c', 'kungfu/skill/bibo-shengong.c',
    'kungfu/skill/jingluo-xue.c', 'kungfu/class/taohua/huang.c',
    'cmds/skill/perform.c', 'inherit/skill/skill.c', 'feature/sserver.c', 'feature/skill.c',
    'feature/attack.c', 'feature/damage.c', 'feature/attribute.c', 'feature/dbase.c',
    'feature/equip.c', 'feature/action.c', 'mudcore/inherit/dbase.c',
    'mudcore/inherit/action.c', 'inherit/char/char.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/single/simul_efun/message.c',
    'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];

export function taohuaXiaoConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本量须为正整数');
    const source = catalog.skills.find(s => s.id === skill + '/xiao');
    const base = catalog.skills.find(s => s.id === skill);
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    for (const [s, path] of [[source, taohuaXiaoSourcePaths[0]], [base, taohuaXiaoSourcePaths[1]]]) {
        assert.equal(s?.path, path, '必须是原弹指神通来源');
        assert.match(s.sha256, /^[a-f0-9]{64}$/);
    }
    assert.ok(entry?.startsWith(source.path + ':'), '缺少啸沧海原 perform 入口');
    const result = [];
    function add(tag, level = 200, extra = {}) {
        const actor = { skills: { finger: level, [skill]: level, 'jingluo-xue': 200,
            force: 200, 'bibo-shengong': 200, ...extra.skills },
        mappings: { finger: skill, force: 'bibo-shengong' },
        preparations: extra.noPrepare ? {} : { finger: skill },
        properties: { ...pool, neili: 800, max_neili: 3000, 'family/family_name': '桃花岛',
            [grant]: 1, ...extra.properties },
        ...(extra.weapon ? { equipment: { type: 'sword', hold: false } } : {}) };
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200,
            ...extra.targetSkills }, mappings: {}, preparations: {},
        properties: { ...pool, ...extra.targetProperties }, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-taohua-xiao-l${level}-${tag}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-xiao',
                skill, ability: 'xiao', usage: 'finger', level, variant: tag,
                actor, target, named_participants: true, fighting: extra.fighting ?? true,
                target_state: extra.unconscious ? 'unconscious' : 'living',
                action: 'perform finger.xiao right', observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', not_applicable: '',
                refusal: extra.refusal ?? '', gate_expectation: extra.gate ?? 'random',
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_sources: [...taohuaXiaoSourcePaths],
                qualification_note: '真实非巫师USER、原命令、加力0；技能及领悟仅为实验资格，不重跑黄药师教学。受理不等于命中。保留原随机与整数截断，受理后原命令的熟练增长另计。精神损伤并非COMBAT_D直伤；靶内力毛扣、归零修正及净差分别核对。即时窗口不代表忙乱的自然解除时间或实战胜率。',
            } });
    }
    for (const level of [200, 400, 800]) add('baseline', level);
    add('force298', 200, { targetSkills: { force: 298 }, gate: 'hit' });
    add('force898', 200, { targetSkills: { force: 898 }, gate: 'miss', checks: 2 });
    for (const neili of [0, 899, 900]) add('target-neili' + neili, 200,
        { targetSkills: { force: 298 }, targetProperties: { neili }, gate: 'hit' });
    const refused = (tag, refusal, extra = {}) => add(tag, 200, { ...extra, refusal, checks: 2 });
    refused('no-grant', '你所使用的外功中没有这种功能。\n', { properties: { [grant]: 0 } });
    refused('no-fight', '「啸沧海」只能对战斗中的对手使用。\n', { fighting: false });
    refused('sword', '「啸沧海」只能空手施展。\n', { weapon: true });
    refused('skill199', '你的弹指神通不够娴熟，难以施展「啸沧海」。\n', { skills: { [skill]: 199 } });
    refused('jingluo199', '你对经络学的了解不够，难以施展「啸沧海」。\n', { skills: { 'jingluo-xue': 199 } });
    refused('no-prepare', '你没有准备弹指神通，难以施展「啸沧海」。\n', { noPrepare: true });
    refused('max-neili2999', '你的内力修为不足，难以施展「啸沧海」。\n', { properties: { max_neili: 2999 } });
    refused('neili799', '你现在的真气不够，难以施展「啸沧海」。\n', { properties: { neili: 799 } });
    refused('unconscious-target', '对方都已经这样了，用不着这么费力吧？\n', { unconscious: true });
    return result;
}

function map(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label);
    return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function count(metrics, key) {
    map(metrics, '缺少原计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key); return value;
}
function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少真实忙乱');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱'); return value;
}
function apply(state, key) {
    const values = map(state.temp?.apply, '缺少真实 apply 映射');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, '无效 apply/' + key);
}
function learned(state) {
    const values = map(state.learned, '缺少原熟练映射');
    for (const value of Object.values(values)) assert.ok(Number.isSafeInteger(value) && value >= 0, '无效熟练值');
    return values;
}
function identity(state) {
    assert.ok(typeof state?.object === 'string' && state.object.length > 0, '缺少原角色身份');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0);
    for (const key of ['living', 'ghost', 'fighting_opponent']) assert.ok([0, 1].includes(state[key]), key);
    busy(state); learned(state); map(state.temp?.apply, '缺少真实 apply');
    for (const key of health) integer(state[key], key);
}
function equipment(state, config) {
    assert.equal(state.weapon, config.equipment?.type ?? 'none');
    assert.equal(state.secondary_weapon, 'none');
    assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    const details = map(state.weapon_details, '缺少主手物品快照');
    assert.equal(state.weapon_damage, config.equipment ? 50 : 0);
    assert.equal(state.weapon_flag, config.equipment ? 4 : 0);
    if (!config.equipment) assert.deepEqual(details, {});
    else {
        assert.equal(details.program, '/tests/sword');
        assert.match(details.object, /^\/tests\/sword#\d+$/);
        assert.equal(details.skill_type, 'sword'); assert.equal(details.weight, 3000);
        assert.equal(details.damage, 50); assert.equal(details.flag, 4);
        assert.equal(details.consistence, 100);
    }
}

export function validateTaohuaXiaoRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'taohua-xiao'); assert.equal(condition.method, 'perform');
    assert.equal(raw.method, condition.method); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) {
        assert.ok(Array.isArray(raw[key]), key); assert.equal(raw[key].length, 2, key);
    }
    // These arrays are actually observed for every sample. actions/directs are group-specific,
    // so their absence is not converted to a claim of observed zero detailed events.
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'terminals', 'callbacks'])
        assert.deepEqual(raw[key], [], '本组即时窗口不应有这些事件：' + key);
    for (const key of ['launches', 'refusals']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['actions', 'directs']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], []);
    assert.deepEqual(raw.after, raw.immediate, '不混入后续心跳或回调');
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate, accepted = p.expected === 'observed';
    assert.notEqual(b.object, t.object);
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], final = raw.immediate[side];
        for (const phase of ['before', 'immediate', 'after']) {
            identity(raw[phase][side]); assert.equal(raw[phase][side].object, state.object);
        }
        assert.equal(state.id, side ? 'right' : 'left');
        assert.equal(state.living, side && p.target_state === 'unconscious' ? 0 : 1);
        assert.equal(state.ghost, 0); assert.equal(state.fighting_opponent, Number(p.fighting));
        assert.equal(busy(state), 0); equipment(state, cfg);
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations); assert.deepEqual(learned(state), {});
        assert.equal(apply(state, 'finger'), 0); assert.equal(apply(state, 'force'), 0);
        assert.equal(apply(state, skill), 0);
        const effective = map(state.effective_skills, '缺少实际有效等级');
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(effective[key],
            Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key), key);
        for (const [key, value] of Object.entries(cfg.properties)) {
            const expected = side === 1 && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value;
            if (key.includes('/')) {
                const cultivation = map(state.cultivation, '缺少原资格');
                assert.ok(Object.hasOwn(cultivation, key), '缺少原资格字段：' + key);
                if (key === grant && expected === 0) assert.ok(cultivation[key] === 0 || cultivation[key] === null);
                else assert.equal(cultivation[key], expected, key);
            } else assert.equal(state[key], expected, key);
        }
        for (const key of ['id', 'living', 'ghost', 'fighting_opponent', 'skills', 'mappings', 'preparations',
            'cultivation', 'effective_skills', 'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details',
            'secondary_weapon', 'secondary_weapon_details', 'handing', 'handing_details'])
            assert.deepEqual(final[key], state[key], '即时原状态变化：' + key);
        for (const key of Object.keys(cfg.properties).filter(k => !health.includes(k) && !k.includes('/')))
            assert.deepEqual(final[key], state[key], key);
        assert.deepEqual(final.temp.apply, state.temp.apply, '没有原临时属性增减');
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats'])
            assert.equal(count(raw.metrics[side], key), 0, key);
    }
    assert.equal(busy(end), busy(t));
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '缺少原昏迷准备');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        identity(prep.before); identity(prep.after);
        assert.equal(prep.before.object, t.object); assert.equal(prep.before.id, t.id);
        assert.equal(prep.before.living, 1); assert.equal(prep.before.ghost, 0);
        assert.equal(prep.before.fighting_opponent, 1);
        for (const key of health) assert.equal(prep.before[key], p.target.properties[key]);
        assert.deepEqual(prep.before.skills, t.skills); assert.deepEqual(prep.before.mappings, t.mappings);
        assert.deepEqual(prep.after, t, '准备结束才开始本次测量');
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    const clean = text => text.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill, argument: 'xiao right' }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
    } else {
        assert.deepEqual(raw.launches, []); assert.equal(typeof raw.reason, 'string');
        assert.equal(clean(raw.reason), p.refusal, '原拒绝路径不符');
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
    }
    const ap = b.effective_skills.finger, dp = t.effective_skills.force;
    const hit = accepted ? busy(a) === 3 : null;
    let damageDraw = null, jingDamage = 0, jingWound = 0, neiliGross = 0, correction = 0;
    if (accepted) {
        assert.ok([3, 4].includes(busy(a)), '原命中3／失手4忙乱');
        const minimum = Math.trunc(ap / 2), maximum = minimum + ap - 1;
        if (minimum > dp) assert.equal(hit, true, '原比较保证命中');
        if (maximum <= dp) assert.equal(hit, false, '原比较保证失手');
        if (p.gate_expectation !== 'random') assert.equal(hit ? 'hit' : 'miss', p.gate_expectation);
        if (hit) {
            neiliGross = count(raw.metrics[1], 'neili_cost');
            assert.equal(neiliGross % 3, 0, '原内力毛扣必须为3D');
            damageDraw = neiliGross / 3;
            assert.ok(damageDraw >= ap && damageDraw < 2 * ap, '原随机伤害支持区间');
            jingDamage = Math.trunc(damageDraw * 4 / 3); jingWound = Math.trunc(damageDraw / 3);
            correction = Math.max(neiliGross - t.neili, 0);
        }
    } else assert.equal(busy(a), 0);
    for (const side of [0, 1]) for (const key of health) {
        const cost = side === 0 ? 0 : { jing: jingDamage, eff_jing: jingWound, neili: neiliGross }[key] ?? 0;
        const recovery = side === 1 && key === 'neili' ? correction : 0;
        assert.equal(count(raw.metrics[side], key + '_cost'), cost, key + '毛扣不符');
        assert.equal(count(raw.metrics[side], key + '_recovery'), recovery, key + '修正/恢复不符');
        assert.equal(raw.immediate[side][key], raw.before[side][key] - cost + recovery, key + '原资源账不闭合');
    }
    const progress = learned(a);
    assert.ok(Object.keys(progress).every(key => key === skill), '只允许原绝招对应熟练增长');
    const learnedDelta = Object.hasOwn(progress, skill) ? progress[skill] : 0;
    if (!accepted) assert.equal(learnedDelta, 0, '拒绝不能增加熟练');
    else if (b.effective_skills[skill] >= 120) assert.equal(learnedDelta, 1, '原命令保证触发熟练');
    else assert.ok([0, 1].includes(learnedDelta), '原命令随机熟练只能0或1');
    assert.deepEqual(learned(end), learned(t), '目标熟练不能增长');
    return { accepted, hit, ap, dp, damage_draw: damageDraw, jing_damage: jingDamage, jing_wound: jingWound,
        target_neili_gross_cost: neiliGross, target_neili_zero_correction: correction,
        target_neili_net_loss: t.neili - end.neili, target_neili_remaining: end.neili,
        actor_neili_cost: count(raw.metrics[0], 'neili_cost'), busy: busy(a), learned_delta: learnedDelta };
}

export function taohuaXiaoEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, 'taohua-xiao');
    const observations = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue; // Unknown effects are not invented as zero-cost samples.
        const observation = validateTaohuaXiaoRecord(row.raw, condition);
        if (observation.accepted) observations.push(observation);
    }
    const hits = observations.filter(x => x.hit).length;
    return { samples: rows.length, counts, accepted_samples: observations.length,
        hit: probability(hits, observations.length), misses: observations.length - hits,
        refused_samples: counts.refused, unknown_effect_samples: counts.error,
        learned_progress: probability(observations.filter(x => x.learned_delta > 0).length, observations.length),
        ...Object.fromEntries(['ap', 'dp', 'damage_draw', 'jing_damage', 'jing_wound',
            'target_neili_gross_cost', 'target_neili_zero_correction', 'target_neili_net_loss',
            'target_neili_remaining', 'actor_neili_cost', 'busy', 'learned_delta']
            .map(key => [key, distribution(observations.map(x => x[key]))])) };
}
