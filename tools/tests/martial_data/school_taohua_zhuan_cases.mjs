// Offline preparation only. Register after the running series' shared-input freeze ends.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/zhuan';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const fingers = [skill, 'lianhua-zhi', 'qixing-zhi', 'qilian-zhi', 'duoluoye-zhi', 'tianzhu-fuzhi'];
const pool = { qi: 100000, eff_qi: 100000, max_qi: 100000,
    jing: 100000, eff_jing: 100000, max_jing: 100000, neili: 10000, max_neili: 10000,
    combat_exp: 100000001, str: 36, int: 36, con: 36, dex: 34, shen: 0, jiali: 0,
    gender: '男性', potential: 1000, learned_points: 0,
    score: 0, experience: 0, learned_experience: 0 };

export const taohuaZhuanSourcePaths = [
    'kungfu/skill/tanzhi-shentong/zhuan.c', 'kungfu/skill/tanzhi-shentong.c',
    'kungfu/skill/qimen-wuxing.c', 'kungfu/skill/mathematics.c', 'kungfu/skill/finger.c',
    'kungfu/skill/force.c', ...fingers.slice(1).map(id => 'kungfu/skill/' + id + '.c'),
    'kungfu/class/taohua/huang.c', 'cmds/skill/perform.c', 'inherit/skill/skill.c',
    'feature/sserver.c', 'feature/skill.c', 'feature/attack.c', 'feature/damage.c',
    'feature/attribute.c', 'feature/dbase.c', 'feature/equip.c', 'feature/action.c',
    'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c', 'inherit/char/char.c',
    'inherit/weapon/sword.c', 'inherit/misc/equip.c', 'adm/daemons/combatd.c',
    'adm/single/simul_efun/message.c', 'clone/user/user.c', 'feature/condition.c',
    'd/death/gate.c', 'd/death/npc/bai.c', 'clone/misc/corpse.c', 'feature/move.c',
    'adm/daemons/chard.c', 'adm/daemons/chinesed.c', 'adm/daemons/race/human.c',
    'data/e2c_dict.o', 'include/login.h', 'include/globals.h', 'include/combat.h', 'mudcore/include/ansi.h',
];

export const taohuaZhuanFixtureRequirements = [
    'No shared registration, driver or current-series edits until the running input freeze ends. Freeze game, fixtures, finite conditions and tool bytes in a new independent series.',
    'Run original perform finger.zhuan right on connected nonwizard USERs via original set_name/present aliases, not direct skill calls; retain actual launch/refusal events.',
    'Add this group grant, actual secondary_weapon/details, fighting_opponent and skill_order=keys(query_skills()) to snapshots. The order is the original LPC mapping order, never JSON insertion order or a sorted replacement.',
    'The secondary-only refusal is a labelled diagnostic slot state, not a claim that ordinary wield commands create that state. Do not grant primary weapon properties to it.',
    'Reuse original do_damage entry observations for directs; do not insert rolls or call query_action again. A UNARMED_ATTACK calls char.hit_ob for gloves/poison, not automatically the mapped martial hit_ob.',
    'Unconscious preparation runs original unconcious with original killing relationships, records preparation state/terminal, then resets measurement counters.',
    'Direct death runs the original target.die(actor), original corpse/equipment/death-room path. Record synchronous terminal and death metadata before the later death-room callouts; no revive, fake terminal, blanket room cleanup or player save I/O.',
    'Observe exact corpse identity returned by original make_corpse and the exact target sword ownership/equipped flag. Cleanup only test-owned objects/callouts after the sample; keep death and ordinary damage denominators separate.',
    'Death snapshots must retain whether query_learned() was originally a mapping, original conditions, PK/experience counters and weapon ownership; query_learned() || ([]) alone cannot prove the skill-death branch.',
];

export function taohuaZhuanConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, '样本量须为正整数');
    const source = catalog.skills.find(s => s.id === skill + '/zhuan');
    const base = catalog.skills.find(s => s.id === skill);
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    for (const [s, path] of [[source, taohuaZhuanSourcePaths[0]], [base, taohuaZhuanSourcePaths[1]]]) {
        assert.equal(s?.path, path); assert.match(s.sha256, /^[a-f0-9]{64}$/);
    }
    assert.ok(entry?.startsWith(source.path + ':'), '缺少转乾坤原入口');
    const result = [];
    function add(tag, level = 220, extra = {}) {
        const actor = { skills: { finger: level, [skill]: level, force: 200,
            'qimen-wuxing': 200, ...extra.skills },
        mappings: extra.noMap ? {} : { finger: skill }, preparations: extra.noPrepare ? {} : { finger: skill },
        properties: { ...pool, max_neili: 3500, neili: 800,
            'family/family_name': '桃花岛', [grant]: 1, ...extra.properties },
        ...(extra.weapon ? { equipment: { type: 'sword', hold: false,
            ...(extra.weapon === 'secondary' ? { slot: 'secondary_weapon' } : {}) } } : {}),
        ...(extra.busy ? { busy: extra.busy } : {}) };
        const target = { skills: { force: 600, parry: 600, dodge: 600, sword: 200,
            ...extra.targetSkills }, mappings: {}, preparations: {},
        properties: { ...pool, ...extra.targetProperties }, equipment: { type: 'sword', hold: false } };
        result.push({ id: `school-taohua-zhuan-l${level}-${tag}`, stage: 'school', method: 'perform', entry_id: entry,
            samples: smoke ? 1 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-zhuan',
                skill, ability: 'zhuan', usage: 'finger', level, variant: tag, actor, target,
                named_participants: true, fighting: extra.fighting ?? true,
                action: extra.action ?? 'perform finger.zhuan right',
                target_state: extra.unconscious ? 'unconscious' : 'living',
                observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                refusal_layer: extra.refusal ? extra.layer ?? 'skill' : '',
                not_applicable: '', gate_expectation: extra.gate ?? 'random',
                ability_source: { path: source.path, sha256: source.sha256, entry_id: entry },
                base_source: { path: base.path, sha256: base.sha256 },
                qualification_sources: [...taohuaZhuanSourcePaths],
                qualification_note: '原命令及随机；真实非巫师USER，技能与领悟为实验资格，不冒充实际拜师成本。经验100000001避开整数立方浮点边界。只计原LPC技能keys顺序中前5项可激发指法，不按JSON顺序或名称重排。普通直伤与原die分支分账；死亡原结算不是伤害数字。副手单槽为显式诊断，不表示正常持器方式。',
            } });
    }
    for (const level of [220, 400, 800]) add('baseline', level);
    const low = { force: 2, parry: 1 };
    for (const mathematics of [19, 20]) add('mathematics' + mathematics, 220,
        { skills: { mathematics }, targetSkills: low, gate: 'hit' });
    for (const count of [5, 6]) add('finger-styles' + count, 400,
        { skills: Object.fromEntries(fingers.slice(1, count).map((id, i) => [id, 100 + i * 20])),
            targetSkills: low, gate: 'hit' });
    for (const max_neili of [3999, 4000, 4001]) add('max-ratio' + max_neili, 220,
        { properties: { max_neili }, targetProperties: { max_neili: 2000, neili: 2000 },
            targetSkills: low, gate: 'hit', checks: 2 });
    add('forced-miss', 220, { targetSkills: { parry: 100000 }, gate: 'miss', checks: 2 });
    const refusal = (tag, message, extra = {}) => add(tag, 220, { ...extra, refusal: message, checks: 2 });
    refusal('no-grant', '你所使用的外功中没有这种功能。\n', { properties: { [grant]: 0 } });
    refusal('no-fight', '「转乾坤」只能对战斗中的对手使用。\n', { fighting: false });
    refusal('missing-target', '这里没有missing。\n', { action: 'perform finger.zhuan missing', layer: 'dispatch' });
    refusal('sword', '「转乾坤」只能空手施展。\n', { weapon: 'main' });
    refusal('secondary', '「转乾坤」只能空手施展。\n', { weapon: 'secondary' });
    refusal('skill219', '你的弹指神通不够娴熟，难以施展「转乾坤」。\n', { skills: { [skill]: 219 } });
    refusal('qimen199', '你的奇门五行修为不够，难以施展「转乾坤」。\n', { skills: { 'qimen-wuxing': 199 } });
    refusal('no-map', '你现在的(finger)中并没有这种外功。\n', { noMap: true, layer: 'command' });
    refusal('no-prepare', '你没有准备弹指神通，难以施展「转乾坤」。\n', { noPrepare: true });
    refusal('max-neili3499', '你的内力修为不足，难以施展「转乾坤」。\n', { properties: { max_neili: 3499 } });
    refusal('neili799', '你现在的真气不够，难以施展「转乾坤」。\n', { properties: { neili: 799 } });
    refusal('unconscious-target', '对方都已经这样了，用不着这么费力吧？\n', { unconscious: true });
    refusal('busy', '( 你上一个动作还没有完成，不能施用外功。)\n', { busy: 2, layer: 'command' });
    return result;
}

function map(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label); return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function count(metrics, key) {
    map(metrics, '缺少原指标'); const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key); return value;
}
function busy(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少真实忙乱');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱'); return value;
}
function apply(state, key) {
    const values = map(state.temp?.apply, '缺少原apply');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, '无效apply/' + key);
}
function learned(state) {
    const value = map(state.learned, '缺少原熟练映射');
    for (const n of Object.values(value)) assert.ok(Number.isSafeInteger(n) && n >= 0);
    return value;
}
function identity(state) {
    assert.ok(typeof state.object === 'string' && state.object.length > 0);
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0);
    for (const key of ['living', 'ghost', 'fighting_opponent']) assert.ok([0, 1].includes(state[key]), key);
    for (const key of health) integer(state[key], key);
    busy(state); learned(state); map(state.temp?.apply, '缺少真实apply');
}

export function taohuaZhuanPower(actor, target) {
    const order = actor.skill_order;
    assert.ok(Array.isArray(order) && order.every(x => typeof x === 'string'), '缺少LPC原技能顺序');
    assert.equal(new Set(order).size, order.length, '技能顺序重复');
    assert.deepEqual([...order].sort(), Object.keys(actor.skills).sort(), '技能顺序与原表不闭合');
    const selected = order.filter(key => fingers.includes(key)).slice(0, 5);
    const sum = selected.reduce((n, key) => n + integer(actor.skills[key], key), 0);
    const exp = integer(actor.combat_exp, '经验'), lvls = Math.trunc(Math.trunc(Math.pow(exp * 10, 1 / 3)) * 4 / 5);
    assert.ok(lvls > 0, '本组不以零经验除数伪造正常效果');
    const base = integer(actor.effective_skills.finger, '有效指法')
        + integer(actor.skills['qimen-wuxing'], '奇门五行') + integer(actor.skills[skill], '弹指神通');
    const ap = base + Math.trunc(base * (sum * 5 / 100 / lvls));
    const dp = integer(target.effective_skills.force, '目标有效内功')
        + integer(target.skills.parry, '目标基本招架') + (target.skills['qimen-wuxing'] ?? 0);
    return { ap, dp, base, lvls, selected, sum };
}

// Enumerate possible existing combatd outcomes without sampling or replacing its RNG.
export function taohuaZhuanDamageSupport(actor, target, input, percent) {
    integer(input, '原直伤入参'); integer(percent, '原创伤百分比');
    const strength = actor.str * 2 + actor.effective_str;
    let damage = input + apply(actor, 'unarmed_damage');
    const factor = strength < 40 ? strength : strength < 70
        ? Math.trunc((strength - 30) / 2) + 20 : Math.trunc((strength - 60) / 4) + 30;
    damage += Math.trunc(damage * factor / 50);
    const intellect = actor.int;
    const enhanced = damage + Math.trunc(damage * (intellect < 16 ? 10 : intellect < 40 ? 7 : 4) / intellect);
    const values = [];
    for (let d of new Set([damage, enhanced])) {
        if (d > 1500) d = Math.trunc((d - 1500) / 4) + 1000;
        else if (d > 500) d = Math.trunc((d - 500) / 2) + 500;
        for (let armorRoll = 0; armorRoll < Math.max(1, apply(target, 'armor')); armorRoll++) {
            let wound = Math.trunc((d - armorRoll) * percent / 100);
            wound -= Math.trunc(wound * (target.con - 10) / 100);
            values.push({ damage: d, wound: Math.max(wound, 0) });
        }
    }
    return values;
}

function equipment(state, config) {
    const primary = config.equipment && config.equipment.slot !== 'secondary_weapon';
    const secondary = config.equipment?.slot === 'secondary_weapon';
    assert.equal(state.weapon, primary ? 'sword' : 'none');
    assert.equal(state.secondary_weapon, secondary ? 'sword' : 'none');
    assert.equal(state.weapon_damage, primary ? 50 : 0); assert.equal(state.weapon_flag, primary ? 4 : 0);
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    for (const [key, present] of [['weapon_details', primary], ['secondary_weapon_details', secondary]]) {
        const details = map(state[key], key);
        if (!present) { assert.deepEqual(details, {}); continue; }
        assert.equal(details.program, '/tests/sword'); assert.match(details.object, /^\/tests\/sword#\d+$/);
        for (const [key, value] of Object.entries({ skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100 }))
            assert.equal(details[key], value, key);
    }
}

export function validateTaohuaZhuanRecord(raw, condition) {
    const p = condition.parameters, accepted = p.expected === 'observed';
    assert.equal(p.collection_group, 'taohua-zhuan'); assert.equal(condition.method, 'perform');
    assert.equal(raw.method, condition.method); assert.equal(raw.condition_id, condition.id); assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['launches', 'refusals', 'directs', 'terminals', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'callbacks'])
        assert.deepEqual(raw[key], [], key);
    assert.deepEqual(raw.after, raw.immediate, '仅同步命令窗口，不混入后续死亡回调或心跳');
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.notEqual(b.object, t.object);
    assert.ok(Object.hasOwn(raw, 'command_accepted'), '缺少原命令执行成本');
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted >= 0,
        '原命令执行成本必须是非负安全整数');
    assert.equal(raw.command_accepted > 0, accepted, '命令受理按正成本判定，拒绝必须为零');
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) { identity(raw[phase][side]); assert.equal(raw[phase][side].object, state.object); }
        assert.equal(state.id, side ? 'right' : 'left'); assert.equal(state.ghost, 0);
        assert.equal(state.living, side && p.target_state === 'unconscious' ? 0 : 1);
        assert.equal(state.fighting_opponent, Number(p.fighting)); assert.equal(busy(state), cfg.busy ?? 0);
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations); assert.deepEqual(learned(state), {}); equipment(state, cfg);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.effective_skills[key],
            Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key), key);
        assert.equal(state.effective_str, state.str + Math.trunc((cfg.skills.finger ?? 0) / 10));
        for (const key of ['finger', skill, 'str', 'unarmed_damage']) assert.equal(apply(state, key), 0, key);
        assert.equal(apply(state, 'armor'), 100);
        for (const [key, value] of Object.entries(cfg.properties)) {
            const expected = side && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value;
            if (key.includes('/')) {
                assert.ok(Object.hasOwn(map(state.cultivation, '缺少资格'), key), key);
                if (key === grant && value === 0) assert.ok(state.cultivation[key] === 0 || state.cultivation[key] === null);
                else assert.equal(state.cultivation[key], value, key);
            } else assert.equal(state[key], expected, key);
        }
        for (const key of ['quick', 'riposte', 'heartbeats', 'hit', 'dodge', 'parry']) assert.equal(count(raw.metrics[side], key), 0, key);
    }
    if (p.target_state === 'unconscious') {
        const prep = map(raw.preparation, '缺少原昏迷准备');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        identity(prep.before); identity(prep.after); assert.equal(prep.before.object, t.object);
        assert.equal(prep.before.living, 1); assert.equal(prep.before.ghost, 0);
        for (const key of health) assert.equal(prep.before[key], p.target.properties[key]);
        assert.deepEqual(prep.after, t);
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    const power = taohuaZhuanPower(b, t);
    const died = end.ghost === 1, hit = accepted ? died || raw.directs.length === 1 : null;
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    assert.equal(count(raw.metrics[0], 'direct'), raw.directs.length); assert.equal(count(raw.metrics[1], 'direct'), 0);
    if (accepted) {
        assert.deepEqual(raw.launches, [{ actor: b.object, skill, argument: 'zhuan right' }]);
        assert.deepEqual(raw.refusals, []); assert.equal(raw.reason, '');
        if (Math.trunc(power.ap / 2) > power.dp) assert.equal(hit, true);
        if (Math.trunc(power.ap / 2) + power.ap - 1 <= power.dp) assert.equal(hit, false);
        if (p.gate_expectation !== 'random') assert.equal(hit ? 'hit' : 'miss', p.gate_expectation);
        assert.equal(died, hit && b.max_neili > 2 * t.max_neili, '原倍数比较严格大于');
        assert.equal(busy(a), hit && !died ? 3 : 2);
    } else {
        assert.deepEqual(raw.launches, []); assert.equal(typeof raw.reason, 'string');
        const reason = raw.reason.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
        // Driver EGC slicing [4..7] of the four-character 基本指法 produces an empty substring.
        // Source-derived expectation; the independent smoke must still verify the real output.
        assert.equal(reason, p.refusal);
        assert.deepEqual(raw.refusals, [{ actor: b.object, reason: raw.reason }]);
        assert.equal(busy(a), busy(b)); assert.equal(died, false);
    }
    let input = null, percent = null;
    const actorCost = count(raw.metrics[0], 'neili_cost'), mathematics = b.skills.mathematics ?? 0;
    if (hit && !died) {
        assert.equal(raw.directs.length, 1);
        const event = raw.directs[0];
        assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.type, 0);
        assert.equal(event.weapon, 'none'); assert.equal(event.weapon_object, '');
        input = integer(event.damage, '直伤入参'); percent = integer(event.percent, '创伤百分比');
        assert.ok(input >= power.ap && input < power.ap * 2);
        assert.ok(percent >= 100 && percent <= 100 + Math.max(0, Math.trunc(mathematics / 10) - 1));
        assert.ok(actorCost >= 200 && actorCost <= 200 + Math.max(0, mathematics - 1));
        const cost = count(raw.metrics[1], 'qi_cost'), wound = count(raw.metrics[1], 'eff_qi_cost');
        assert.ok(taohuaZhuanDamageSupport(b, t, input, percent).some(x => x.damage === cost && x.wound === wound),
            '实际损伤不在原膂力/悟性/护甲/根骨整数支持集内');
    } else { assert.deepEqual(raw.directs, []); assert.equal(actorCost, accepted && !died ? 200 : 0); }
    for (const side of [0, 1]) for (const key of health) {
        const cost = count(raw.metrics[side], key + '_cost'), recovery = count(raw.metrics[side], key + '_recovery');
        assert.equal(raw.immediate[side][key] - raw.before[side][key], recovery - cost, key + '资源账不闭合');
        assert.equal(recovery, 0, '同步窗口无恢复');
        if (side === 0 && key !== 'neili' || side === 1 && key === 'neili') assert.equal(cost, 0);
        if (side === 1 && !died && (!hit || ['jing', 'eff_jing'].includes(key))) assert.equal(cost, 0);
    }
    const progress = learned(a);
    assert.ok(Object.keys(progress).every(key => key === skill));
    const learnedDelta = progress[skill] ?? 0;
    if (!accepted) assert.equal(learnedDelta, 0);
    else if (b.effective_skills[skill] >= 120) assert.equal(learnedDelta, 1);
    else assert.ok([0, 1].includes(learnedDelta));
    for (const key of ['id', 'living', 'ghost', 'skills', 'mappings', 'preparations', 'cultivation',
        'effective_skills', 'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details',
        'secondary_weapon', 'secondary_weapon_details', 'handing', 'handing_details', 'max_neili'])
        assert.deepEqual(a[key], b[key], '施术者同步状态：' + key);
    assert.deepEqual(a.temp.apply, b.temp.apply);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const mutable = side && died ? ['max_neili', 'combat_exp', 'potential'] : [];
        for (const key of Object.keys(cfg.properties).filter(key => !health.includes(key)
            && !key.includes('/') && !mutable.includes(key)))
            assert.deepEqual(raw.immediate[side][key], raw.before[side][key], '非效果字段不应变化：' + key);
    }
    if (died) {
        validateDeath(raw);
    } else {
        assert.deepEqual(raw.terminals, []); assert.equal(Object.hasOwn(raw, 'zhuan_death'), false);
        assert.deepEqual(raw.dropped, [], '普通命中/失手/拒绝不产生尸体或落物');
        assert.equal(a.fighting_opponent, b.fighting_opponent); assert.equal(a.combat_exp, b.combat_exp);
        for (const key of ['id', 'living', 'ghost', 'fighting_opponent', 'skills', 'mappings', 'preparations',
            'cultivation', 'effective_skills', 'learned', 'weapon', 'weapon_damage', 'weapon_flag', 'weapon_details',
            'secondary_weapon', 'secondary_weapon_details', 'handing', 'handing_details',
            'busy', 'max_neili', 'max_qi', 'max_jing', 'combat_exp', 'potential', 'learned_points'])
            assert.deepEqual(end[key], t[key], '靶同步状态：' + key);
        assert.deepEqual(end.temp.apply, t.temp.apply);
        if (Object.hasOwn(raw, 'actions')) assert.deepEqual(raw.actions, []);
    }
    return { accepted, hit, direct_death: died, ...power, direct_input: input, wound_percent: percent,
        actor_neili_cost: actorCost, actor_busy: busy(a), learned_delta: learnedDelta,
        ordinary_qi_damage: hit && !died ? count(raw.metrics[1], 'qi_cost') : hit ? null : 0,
        ordinary_qi_wound: hit && !died ? count(raw.metrics[1], 'eff_qi_cost') : hit ? null : 0,
        target_qi_net_loss: t.qi - end.qi, target_max_neili_loss: t.max_neili - end.max_neili };
}

function validateDeath(raw) {
    const [b, t] = raw.before, [a, end] = raw.immediate;
    assert.deepEqual(raw.terminals, [{ side: 1, state: 'death' }]);
    assert.equal(a.fighting_opponent, 0); assert.equal(end.fighting_opponent, 0);
    assert.equal(end.ghost, 1); assert.equal(end.living, 1);
    assert.equal(busy(end), 0);
    for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(end[key], 1, key);
    assert.equal(end.neili, t.neili); assert.equal(end.max_neili, t.max_neili - 20);
    assert.equal(end.combat_exp, t.combat_exp - Math.trunc(t.combat_exp * 3 / 100));
    assert.equal(end.potential, t.potential - Math.trunc((t.potential - t.learned_points) / 2));
    for (const key of ['max_qi', 'max_jing', 'learned_points', 'shen']) assert.equal(end[key], t[key], key);
    assert.equal(end.weapon, 'none'); assert.deepEqual(end.weapon_details, {});
    assert.equal(end.weapon_damage, 0); assert.equal(end.weapon_flag, 0);
    assert.equal(end.secondary_weapon, 'none'); assert.deepEqual(end.secondary_weapon_details, {});
    assert.equal(end.handing, 'none'); assert.deepEqual(end.handing_details, {});
    const death = map(raw.zhuan_death, '缺少原同步死亡证据');
    assert.equal(death.target, t.object); assert.equal(death.killer, b.object);
    assert.match(death.corpse, /^\/clone\/misc\/corpse#\d+$/);
    assert.equal(raw.dropped.length, 1, '原死亡房间须保留本次唯一尸体，不隐藏或混入其他物品');
    const dropped = map(raw.dropped[0], '缺少实际尸体落物');
    assert.equal(dropped.object, death.corpse);
    assert.ok(typeof dropped.name === 'string' && dropped.name.length > 0, '缺少原尸体名称');
    for (const key of ['type', 'no_wield']) {
        assert.ok(Object.hasOwn(dropped, key), '缺少原尸体字段：' + key);
        assert.ok(dropped[key] === 0 || dropped[key] === null, '无效原尸体字段：' + key);
    }
    assert.equal(death.weapon.object, t.weapon_details.object); assert.equal(death.weapon.environment, death.corpse);
    assert.ok(death.weapon.equipped === 0 || death.weapon.equipped === null);
    for (const key of ['program', 'skill_type', 'weight', 'damage', 'flag', 'consistence'])
        assert.equal(death.weapon[key], t.weapon_details[key], '原尸体内装备：' + key);
    assert.equal(death.target_environment, '/d/death/gate');
    assert.equal(death.learned_was_mapping, 0, '本组新建靶没有初始化熟练表，不伪造惩罚分支');
    const penalized = Object.fromEntries(Object.entries(t.skills).filter(([, n]) => n > 1).map(([key, n]) => [key, n - 1]));
    assert.deepEqual(end.skills, penalized, '原死亡掉级并删除小于1级的技能');
    for (const key of ['learned', 'mappings', 'preparations']) assert.deepEqual(end[key], {}, key);
    assert.deepEqual(end.temp.apply, { ...t.temp.apply, damage: 0, dodge: 0 });
    assert.deepEqual(end.effective_skills, Object.fromEntries(Object.entries(penalized)
        .map(([key, n]) => [key, Math.trunc(n / 2) + apply(end, key)])));
    assert.deepEqual(death.conditions_before, {}); assert.deepEqual(death.conditions_after, { die_guard: 6000 });
    assert.equal(death.killer_pks_delta, 1); assert.equal(death.killer_wanted_pks_delta, 0);
    assert.equal(a.combat_exp, b.combat_exp, '奖励的experience不是combat_exp');
    assert.equal(death.killer_experience_delta, 0, '原实战经验奖励受本组score0的容量限制');
}

export function taohuaZhuanEffects(rows, condition) {
    const observations = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id); assert.equal(row.raw?.condition_id, condition.id);
        assert.equal(row.raw.method, condition.method); assert.equal(row.raw.outcome, row.outcome);
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        if (row.outcome === 'error') continue;
        const value = validateTaohuaZhuanRecord(row.raw, condition); if (value.accepted) observations.push(value);
    }
    const hits = observations.filter(x => x.hit), ordinary = hits.filter(x => !x.direct_death), deaths = hits.length - ordinary.length;
    return { samples: rows.length, counts, accepted_samples: observations.length, refused_samples: counts.refused,
        unknown_effect_samples: counts.error, hit: probability(hits.length, observations.length),
        direct_death: probability(deaths, observations.length), ordinary_damage_samples: ordinary.length,
        misses: observations.length - hits.length,
        learned_progress: probability(observations.filter(x => x.learned_delta > 0).length, observations.length),
        ...Object.fromEntries(['ap', 'dp', 'sum', 'direct_input', 'wound_percent', 'actor_neili_cost', 'actor_busy',
            'learned_delta', 'target_qi_net_loss', 'target_max_neili_loss']
            .map(key => [key, distribution(observations.map(x => x[key]))])),
        ordinary_qi_damage: distribution(ordinary.map(x => x.ordinary_qi_damage)),
        ordinary_qi_wound: distribution(ordinary.map(x => x.ordinary_qi_wound)) };
}
