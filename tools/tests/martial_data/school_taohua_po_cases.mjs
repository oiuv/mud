// Independent preparation only: not registered, sampled, or a balance assessment.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/po';
const flower = '/d/items/throwing/taohua_ban';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 10000, max_neili: 10000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 34, shen: 0, gender: '男性' };

export const taohuaPoFixtureRequirements = [
    'Register only after shared inputs are unfrozen; preserve old ordered conditions. Freeze this module, all command/game/fixture dependencies and the new finite matrix in a new series.',
    'Use two connected nonwizard USERs and original set_name/present aliases left/right, original fighting relations and perform finger.po right or throwing.po right; never bypass the original command or set a success flag.',
    'Extend only this group snapshot with the po grant, fighting_opponent, secondary_weapon/details and held stable. Hand the exact original virtual flower through hand flower leaf; permit the existing test sword as target equipment separately from the actor-only needle whitelist.',
    'Reuse the existing original unconcious preparation and separate preparation before/after/terminals from measurement counters. Do not prewrite a dead/living flag or invoke a synthetic timer.',
    'Reuse the existing weapon hit_ob probe for needle_hits, not the martial passive or COMBAT_D damage probe. Record the live flower identity/amount/daub before and immediately after the command, even at amount zero.',
    'Retain the exact target main-weapon reference before the command. Add po_equipment actor_room/target_room and target_weapon before/immediate/after snapshots: equipment_snapshot plus actual environment and equipped. This is read-only carrier evidence, not a new stored item-owner field.',
    'Reuse original zero-delay combined-item destruction and deferred finish_sample; record ammo_cleanup and final held state without manually destroying, re-equipping or moving anything. A missing observation must fail, not be inferred from a missing weapon slot.',
    'Report each frozen condition through taohuaPoEffects(rows, condition). Separate accepted/hit/disarm denominators, wound from its qi clamp, gross costs/recoveries/net changes, learned growth and natural empty-stack cleanup. Last-ammo plus twice is a separate unrun candidate, never a normal sample here.',
];

export const taohuaPoSourcePaths = [
    'kungfu/skill/tanzhi-shentong/po.c', 'kungfu/skill/tanzhi-shentong.c',
    'kungfu/skill/finger.c', 'kungfu/skill/throwing.c', 'kungfu/skill/force.c',
    'kungfu/skill/bibo-shengong.c', 'kungfu/class/taohua/huang.c',
    'cmds/skill/perform.c', 'cmds/std/hand.c', 'inherit/skill/skill.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/equip.c', 'feature/move.c',
    'feature/action.c', 'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c',
    'inherit/char/char.c', 'inherit/weapon/sword.c', 'inherit/misc/equip.c',
    'inherit/weapon/throwing.c', 'inherit/item/combined.c', 'd/items/throwing.lpc',
    'd/items/throwing_data.h', 'adm/daemons/itemd.c', 'adm/daemons/combatd.c',
    'adm/single/master/object.c', 'adm/daemons/virtuald.c',
    'adm/single/simul_efun/message.c', 'kungfu/skill/eff_msg.h',
    'include/globals.h', 'include/combat.h', 'include/weapon.h', 'mudcore/include/ansi.h',
];

export function taohuaPoConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本量须为正整数');
    const source = catalog.skills.find(s => s.id === skill + '/po');
    const base = catalog.skills.find(s => s.id === skill);
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    for (const [s, path] of [[source, taohuaPoSourcePaths[0]], [base, taohuaPoSourcePaths[1]]]) {
        assert.equal(s?.path, path, '必须是原弹指神通来源');
        assert.match(s.sha256, /^[a-f0-9]{64}$/);
    }
    assert.ok(entry?.startsWith(source.path + ':'), '缺少破九域原 perform 入口');
    const result = [];
    function add(tag, extra = {}) {
        const level = extra.level ?? 200, usage = extra.usage ?? 'finger';
        const actor = { skills: { finger: level, throwing: level, [skill]: level,
            force: 200, 'bibo-shengong': 200, ...extra.skills },
        mappings: { finger: skill, throwing: skill, force: 'bibo-shengong' },
        preparations: extra.noPrepare ? {} : { finger: skill },
        properties: { ...pool, neili: 800, max_neili: 2500, 'family/family_name': '桃花岛',
            [grant]: 1, ...extra.properties },
        ...(extra.noHeld ? {} : { equipment: { type: extra.wrongHeld ? 'sword' : 'throwing', hold: true,
            program: extra.wrongHeld ? '/tests/sword' : flower,
            hand_id: extra.wrongHeld ? 'practice weapon' : 'flower leaf',
            ...(extra.wrongHeld ? {} : { amount: extra.amount ?? 50 }) } }) };
        if (extra.noFingerMap) delete actor.mappings.finger;
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool, ...extra.targetProperties },
            ...(extra.unarmedTarget ? {} : { equipment: { type: 'sword', hold: false } }) };
        const refused = !!extra.refusal;
        result.push({ id: `school-taohua-po-${tag}`, stage: 'school', entry_id: entry,
            method: 'perform', samples: smoke ? (refused ? 1 : 2) : refused ? 2 : samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-po',
                skill, ability: 'po', usage, level, variant: tag, actor, target, named_participants: true,
                fighting: extra.fighting ?? true, target_state: extra.unconscious ? 'unconscious' : 'living',
                action: `perform ${usage}.po right`, observation: 'single_action_immediate', observe_seconds: 0,
                expected: refused ? 'refused' : 'observed', not_applicable: '', refusal: extra.refusal ?? '',
                gate_expectation: extra.gate ?? 'random',
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_sources: [...taohuaPoSourcePaths],
                qualification_note: '真实非巫师USER，经原perform命令和原hand命令手持未涂毒桃花瓣。实验资格不冒充黄药师新授或赠物；联合下限2400最大内力低于原教学2500门槛。受理、命中、命中后的缴械及熟练增长分开；有效气血创伤与当前气血夹制不可相加作两次伤害。保留原随机，不强迫频率。最后一枚普通施展观察原同步amount0与自然销毁，不包含互搏重入。',
            } });
    }
    add('baseline');
    add('jiali50', { properties: { jiali: 50 } });
    add('throwing-command', { usage: 'throwing' });
    add('last-ammo', { amount: 1 });
    add('unarmed-target', { unarmedTarget: true });
    add('target-qi9000', { targetProperties: { qi: 9000 } });
    add('dodge1200', { targetSkills: { dodge: 1200 }, gate: 'miss' });
    add('joint-minimum', { level: 180, properties: { max_neili: 2400, neili: 500 } });
    const refused = (tag, refusal, extra = {}) => add(tag, { ...extra, refusal });
    refused('no-grant', '你所使用的外功中没有这种功能。\n', { properties: { [grant]: 0 } });
    refused('no-fight', '「破九域」只能对战斗中的对手使用。\n', { fighting: false });
    refused('no-held', '你手中没有拿着暗器，难以施展「破九域」。\n', { noHeld: true });
    refused('wrong-held', '你手中没有拿着暗器，难以施展「破九域」。\n', { wrongHeld: true });
    refused('skill179', '你弹指神通修为不够，难以施展「破九域」。\n', { skills: { [skill]: 179 } });
    refused('throwing179', '你基本暗器修为不够，难以施展「破九域」。\n', { skills: { throwing: 179 } });
    refused('no-finger-map', '你没有激发弹指神通，难以施展「破九域」。\n', { usage: 'throwing', noFingerMap: true });
    refused('no-prepare', '你没有准备弹指神通，难以施展「破九域」。\n', { noPrepare: true });
    refused('max-neili2399', '你的内力修为不足，难以施展「破九域」。\n', { properties: { max_neili: 2399 } });
    refused('neili499', '你现在的真气不够，难以施展「破九域」。\n', { properties: { neili: 499 } });
    refused('unconscious-target', '对方都已经这样了，用不着这么费力吧？\n', { unconscious: true });
    return result;
}

function map(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function zero(object, key) {
    assert.ok(Object.hasOwn(object, key), '缺少明确空值：' + key);
    assert.ok(object[key] === 0 || object[key] === null, '应为空值：' + key);
}
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
    assert.ok(Object.hasOwn(state, 'conditions'), '缺少原条件观测');
    if (state.conditions !== null && state.conditions !== 0) assert.deepEqual(state.conditions, {});
    for (const key of ['weapon', 'secondary_weapon', 'handing']) {
        const details = map(state[key + '_details'], '缺少原持物快照：' + key);
        if (Object.keys(details).length) assert.equal(state.temp[key], details.object, '临时槽必须指向原物：' + key);
        else if (Object.hasOwn(state.temp, key)) zero(state.temp, key);
    }
}
function effective(state, cfg) {
    const actual = map(state.effective_skills, '缺少实际有效等级');
    for (const [key, value] of Object.entries(cfg.skills)) assert.equal(actual[key],
        Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key), key);
}
function sword(details) {
    map(details, '缺少原测试剑');
    assert.equal(details.program, '/tests/sword'); assert.match(details.object, /^\/tests\/sword#\d+$/);
    for (const [key, value] of Object.entries({ skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100 }))
        assert.equal(details[key], value, key);
    zero(details, 'material'); zero(details, 'no_wield');
}
function equipment(state, cfg) {
    const held = cfg.equipment?.hold, armed = !!cfg.equipment && !held;
    assert.equal(state.weapon, armed ? 'sword' : 'none');
    assert.equal(state.weapon_damage, armed ? 50 : 0); assert.equal(state.weapon_flag, armed ? 4 : 0);
    if (armed) sword(state.weapon_details); else assert.deepEqual(state.weapon_details, {});
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, held ? cfg.equipment.type : 'none');
    const h = map(state.handing_details, '缺少手持原物品');
    if (!held) { assert.deepEqual(h, {}); assert.equal(state.ammunition, 0); }
    else if (cfg.equipment.type === 'sword') { sword(h); zero(state, 'ammunition'); }
    else {
        assert.equal(h.program, flower); assert.match(h.object, /^\/d\/items\/throwing\/taohua_ban#\d+$/);
        for (const [key, value] of Object.entries({ skill_type: 'throwing', flag: 8, damage: 2,
            material: 'wood', consistence: 100, amount: cfg.equipment.amount, weight: cfg.equipment.amount }))
            assert.equal(h[key], value, key);
        zero(h, 'stable'); assert.deepEqual(h.daub, {});
        assert.equal(h.no_wield, '暗器不是用来装备的。\n');
        assert.equal(state.ammunition, cfg.equipment.amount);
    }
}

export function validateTaohuaPoRecord(raw, condition) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    assert.equal(p.collection_group, 'taohua-po'); assert.equal(condition.method, 'perform');
    assert.equal(raw.method, condition.method); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.outcome, p.expected);
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const key of ['before', 'immediate', 'after', 'metrics']) {
        assert.ok(Array.isArray(raw[key]), key); assert.equal(raw[key].length, 2, key);
    }
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'terminals', 'callbacks'])
        assert.deepEqual(raw[key], [], '本组不应有该事件：' + key);
    for (const key of ['actions', 'directs']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], []);
    for (const key of ['launches', 'refusals', 'needle_hits', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.notEqual(b.object, t.object);
    const ap = b.effective_skills?.finger + b.effective_skills?.throwing;
    const dp = t.effective_skills?.dodge + t.effective_skills?.parry;
    integer(ap, 'AP'); integer(dp, 'DP');
    const wound = t.eff_qi - end.eff_qi, hit = accepted ? wound > 0 : null;
    const armed = !!p.target.equipment, disarmed = armed && end.weapon === 'none';
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
        const expectedApply = { armor: 100, ...(side && armed ? { damage: 50, dodge: -1 } : {}) };
        for (const key of new Set([...Object.keys(state.temp.apply), ...Object.keys(expectedApply)]))
            assert.equal(apply(state, key), expectedApply[key] ?? 0, '初始 apply/' + key);
        effective(state, cfg); effective(final, cfg);
        for (const [key, value] of Object.entries(cfg.properties)) {
            const expected = side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value;
            if (key.includes('/')) {
                const cultivation = map(state.cultivation, '缺少原资格');
                assert.ok(Object.hasOwn(cultivation, key), '缺少原资格字段：' + key);
                if (key === grant && expected === 0) zero(cultivation, key);
                else assert.equal(cultivation[key], expected, key);
            } else assert.equal(state[key], expected, key);
        }
        for (const key of ['id', 'living', 'ghost', 'fighting_opponent', 'skills', 'mappings', 'preparations',
            'cultivation', 'secondary_weapon', 'secondary_weapon_details'])
            assert.deepEqual(final[key], state[key], '即时状态改变：' + key);
        for (const key of Object.keys(cfg.properties).filter(k => !health.includes(k) && !k.includes('/')))
            assert.deepEqual(final[key], state[key], key);
        const finalApply = { ...state.temp.apply };
        if (side && disarmed) { finalApply.damage -= 50; finalApply.dodge += 1; }
        assert.deepEqual(final.temp.apply, finalApply, '原卸兵属性未恢复或有额外加成');
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats'])
            assert.equal(count(raw.metrics[side], key), 0, key);
    }
    assert.equal(busy(end), busy(t));
    assert.deepEqual(raw.after[1], end, '目标状态不混入自然心跳');
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '缺少原昏迷准备');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        identity(prep.before); identity(prep.after);
        assert.equal(prep.before.object, t.object); assert.equal(prep.before.id, t.id);
        assert.equal(prep.before.living, 1); assert.equal(prep.before.ghost, 0);
        assert.equal(prep.before.fighting_opponent, 1);
        for (const key of health) assert.equal(prep.before[key], p.target.properties[key]);
        assert.deepEqual(prep.before.skills, t.skills); assert.deepEqual(prep.before.mappings, t.mappings);
        assert.deepEqual(prep.after, t, '准备结束才开始测量');
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill, argument: 'po right' }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        const lo = Math.trunc(ap / 2);
        if (lo > dp) assert.equal(hit, true);
        if (lo + ap - 1 <= dp) assert.equal(hit, false);
        if (p.gate_expectation !== 'random') assert.equal(hit ? 'hit' : 'miss', p.gate_expectation);
        assert.equal(busy(a), hit ? 2 : 3, '原命中2／失手3忙乱');
        if (hit) assert.ok(Number.isSafeInteger(wound) && wound >= lo && wound <= 2 * lo - 1, '创伤随机区间');
        else assert.equal(wound, 0);
    } else {
        assert.deepEqual(raw.launches, []); assert.equal(typeof raw.reason, 'string');
        assert.equal(raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, ''), p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        assert.equal(busy(a), 0); assert.equal(wound, 0);
    }
    const qiClamp = hit ? Math.max(t.qi - end.eff_qi, 0) : 0;
    for (const side of [0, 1]) for (const key of health) {
        const cost = side === 0 ? (accepted && key === 'neili' ? 300 : 0)
            : key === 'eff_qi' ? wound : key === 'qi' ? qiClamp : 0;
        assert.equal(count(raw.metrics[side], key + '_cost'), cost, '原毛扣：' + key);
        assert.equal(count(raw.metrics[side], key + '_recovery'), 0, '没有资源恢复/归零修正：' + key);
        assert.equal(raw.immediate[side][key], raw.before[side][key] - cost, '资源账未闭合：' + key);
    }
    assert.deepEqual(a.weapon_details, b.weapon_details); assert.equal(a.weapon, b.weapon);
    assert.equal(a.weapon_damage, b.weapon_damage); assert.equal(a.weapon_flag, b.weapon_flag);
    const h = b.handing_details, post = a.handing_details;
    if (accepted) {
        assert.equal(a.handing, 'throwing');
        assert.deepEqual(post, { ...h, amount: h.amount - 1, weight: h.amount > 1 ? h.amount - 1 : h.weight },
            '同步减量不提前销毁；amount0不重算重量');
        assert.equal(a.ammunition, h.amount - 1);
    } else {
        assert.equal(a.handing, b.handing); assert.deepEqual(post, h); assert.equal(a.ammunition, b.ammunition);
    }
    assert.deepEqual(end.handing_details, t.handing_details); assert.equal(end.handing, t.handing);
    assert.equal(end.ammunition, t.ammunition);
    assert.equal(raw.needle_hits.length, hit ? 1 : 0);
    if (hit) assert.deepEqual(raw.needle_hits[0], { actor: 0, target: 1,
        program: flower, object: h.object, damage_bonus: b.jiali + 300 });

    const observation = map(raw.po_equipment, '缺少原缴械物品引用观察');
    assert.match(observation.actor_room, /^\/tests\/runner(?:#\d+)?$/);
    assert.equal(observation.target_room, observation.actor_room);
    const old = map(observation.target_weapon, '缺少原目标武器三时点');
    for (const phase of ['before', 'immediate', 'after']) map(old[phase], '缺少原武器：' + phase);
    assert.deepEqual(old.after, old.immediate);
    if (armed) {
        assert.deepEqual(old.before, { ...t.weapon_details, environment: t.object, equipped: 'wielded' });
        if (disarmed) {
            assert.equal(hit, true, '只能命中后缴械');
            assert.equal(old.immediate.environment, observation.actor_room, '必须原物落在本房间');
            zero(old.immediate, 'equipped');
            assert.deepEqual(old.immediate, { ...old.before, environment: observation.actor_room,
                equipped: old.immediate.equipped }, '缴械不替换、损坏或销毁原剑');
            assert.deepEqual(end.weapon_details, {}); assert.equal(end.weapon_damage, 0); assert.equal(end.weapon_flag, 0);
        } else {
            assert.deepEqual(old.immediate, old.before);
            assert.equal(end.weapon, 'sword'); assert.deepEqual(end.weapon_details, t.weapon_details);
            assert.equal(end.weapon_damage, 50); assert.equal(end.weapon_flag, 4);
        }
        if (hit) {
            const lo = Math.trunc(ap / 3);
            if (lo > dp) assert.equal(disarmed, true);
            if (lo + ap - 1 <= dp) assert.equal(disarmed, false);
        }
    } else {
        for (const phase of ['before', 'immediate', 'after']) assert.deepEqual(old[phase], {});
        assert.equal(disarmed, false); assert.equal(end.weapon, 'none');
        assert.deepEqual(end.weapon_details, {}); assert.equal(end.weapon_damage, 0); assert.equal(end.weapon_flag, 0);
    }
    assert.equal(raw.dropped.length, disarmed ? 1 : 0);
    if (disarmed) {
        assert.equal(raw.dropped[0].object, t.weapon_details.object); assert.equal(raw.dropped[0].type, 'sword');
        assert.ok(typeof raw.dropped[0].name === 'string' && raw.dropped[0].name.length > 0);
        zero(raw.dropped[0], 'no_wield');
    }
    const cleanup = map(raw.ammo_cleanup, '缺少自然减量收尾');
    assert.ok([1, true].includes(cleanup.checked));
    assert.ok([0, 1, false, true].includes(cleanup.object_exists));
    const destroyed = accepted && h.amount === 1, heldExists = !!p.actor.equipment && !destroyed;
    assert.equal(Boolean(cleanup.object_exists), heldExists);
    if (heldExists) assert.equal(cleanup.handing_object, h.object); else zero(cleanup, 'handing_object');
    if (destroyed) {
        const final = raw.after[0];
        assert.equal(final.handing, 'none'); assert.deepEqual(final.handing_details, {}); assert.equal(final.ammunition, 0);
        // A destructed object reference in temp.handing can serialize as 0 or null,
        // or disappear; that one observer field is not a change to gameplay state.
        const normalize = state => {
            const copy = structuredClone(state);
            if (Object.hasOwn(copy.temp, 'handing')) delete copy.temp.handing;
            delete copy.handing; delete copy.handing_details; delete copy.ammunition; return copy;
        };
        if (Object.hasOwn(final.temp, 'handing')) zero(final.temp, 'handing');
        if (Object.hasOwn(a.temp, 'handing')) assert.equal(a.temp.handing, h.object);
        assert.deepEqual(normalize(final), normalize(a), '销毁收尾不能混入其它状态变化');
    } else assert.deepEqual(raw.after[0], a);
    const progress = learned(a);
    assert.ok(Object.keys(progress).every(key => key === skill));
    const learnedDelta = Object.hasOwn(progress, skill) ? progress[skill] : 0;
    if (!accepted) assert.equal(learnedDelta, 0);
    else if (b.effective_skills[skill] >= 120) assert.equal(learnedDelta, 1);
    else assert.ok([0, 1].includes(learnedDelta), '原命令熟练随机0或1');
    assert.deepEqual(learned(end), learned(t));
    return { accepted, hit, disarmed, disarm_eligible: !!hit && armed, ap, dp,
        wound, wound_on_hit: hit ? wound : null, qi_clamp: qiClamp, target_qi_net_loss: t.qi - end.qi,
        actor_neili_cost: count(raw.metrics[0], 'neili_cost'), actor_neili_net_loss: b.neili - a.neili,
        target_neili_cost: count(raw.metrics[1], 'neili_cost'), target_neili_net_loss: t.neili - end.neili,
        ammunition_cost: accepted ? 1 : 0, needle_calls: raw.needle_hits.length,
        hit_bonus: hit ? raw.needle_hits[0].damage_bonus : null,
        naturally_destroyed: destroyed, busy: busy(a), learned_delta: learnedDelta };
}

export function taohuaPoEffects(rows, condition) {
    assert.equal(condition.parameters.collection_group, 'taohua-po');
    const observations = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue;
        const observation = validateTaohuaPoRecord(row.raw, condition);
        if (observation.accepted) observations.push(observation);
    }
    const hits = observations.filter(x => x.hit), eligible = observations.filter(x => x.disarm_eligible);
    return { samples: rows.length, counts, accepted_samples: observations.length,
        refused_samples: counts.refused, unknown_effect_samples: counts.error,
        hit: probability(hits.length, observations.length), misses: observations.length - hits.length,
        disarm_among_armed_hits: probability(eligible.filter(x => x.disarmed).length, eligible.length),
        disarm_per_accepted: probability(observations.filter(x => x.disarmed).length, observations.length),
        natural_empty_cleanup: probability(observations.filter(x => x.naturally_destroyed).length,
            observations.filter(() => condition.parameters.actor.equipment?.amount === 1).length),
        learned_progress: probability(observations.filter(x => x.learned_delta > 0).length, observations.length),
        ...Object.fromEntries(['ap', 'dp', 'wound', 'wound_on_hit', 'qi_clamp', 'target_qi_net_loss',
            'actor_neili_cost', 'actor_neili_net_loss', 'target_neili_cost', 'target_neili_net_loss',
            'ammunition_cost', 'needle_calls', 'hit_bonus', 'busy', 'learned_delta']
            .map(key => [key, distribution(observations.map(x => x[key]))])) };
}
