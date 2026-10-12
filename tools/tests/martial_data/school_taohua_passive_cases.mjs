// Independent, unregistered preparation for the original yuxiao-jian::hit_ob.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { distribution, probability } from './statistics.mjs';

const skill = 'yuxiao-jian';
const sourcePath = `kungfu/skill/${skill}.c`;
const sha = text => createHash('sha256').update(text).digest('hex');
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const zero = value => value === null || value === 0;
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 800, max_neili: 3000,
    combat_exp: 100000000, jiali: 0, str: 36, int: 36, con: 36, dex: 36,
    gender: '男性', shen: 0, character: '光明磊落' };

export const taohuaPassiveSourcePaths = [
    sourcePath, 'kungfu/skill/chuixiao-jifa.c', 'kungfu/skill/sword.c',
    'kungfu/skill/force.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c',
    'feature/skill.c', 'feature/attribute.c', 'feature/damage.c', 'feature/attack.c',
    'feature/equip.c', 'feature/command.c', 'feature/dbase.c',
    'mudcore/inherit/dbase.c', 'mudcore/inherit/action.c', 'clone/user/user.c',
    'inherit/char/char.c', 'inherit/skill/skill.c', 'inherit/weapon/sword.c',
    'inherit/misc/equip.c', 'adm/daemons/itemd.c', 'mudcore/include/ansi.h',
];

export const taohuaPassiveFixtureRequirements = [
    'Unregistered preparation only: append these conditions and their validator after the current live series; freeze both new MJS files in a new series.',
    'Reuse the existing test_interface -> original hit_ob call, begin_passive/observe_passive before/after snapshots and original return. Add only this group to those allowlists; no new game probe or RNG replacement.',
    'Reuse connected nonwizard USERs and a real ordinary /tests/sword. Do not fabricate valid_as_xiao, a missing weapon, an extra force mapping, an original perform, or a normal attack.',
    'Use the narrow snapshot allowlists to record character, exact empty secondary slots, and fighting_opponent=0; existing learned/effective skills, query_con, equipment and resources remain authoritative.',
    'Initialize the existing actions/skill_loads/passive_before containers for this group. No dynamic action preloading is needed: this interface never calls query_action.',
    'observe_seconds=0 means immediate observation with no natural heartbeat. A jing/eff_jing value of -1 is not an observed unconsciousness or death.',
    'Resource counters observe actual set() changes, not the receive_wound request. Keep requested wound, hidden craze and last-damage attribution explicitly not_observed; do not reconstruct a clipped request from a net delta.',
    'Pass the frozen condition into the dedicated effects report; never expect raw.parameters. Keep interface calls/no-effect returns separate from command refusal and from ordinary attack hit rate.',
];

export function taohuaPassiveConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    assert.equal(typeof readSource, 'function');
    const evidence = Object.fromEntries(taohuaPassiveSourcePaths.map(path => {
        const text = readSource(path);
        assert.ok(typeof text === 'string' && text.trim().length > 0, '缺少原源码：' + path);
        return [path, sha(text)];
    }));
    const source = catalog.skills.find(row => row.id === skill);
    assert.equal(source?.path, sourcePath);
    assert.equal(source.sha256, evidence[sourcePath]);
    const entry = source.entries.find(row => row.function === 'hit_ob');
    assert.ok(entry && Number.isSafeInteger(entry.evidence?.line) && entry.evidence.line > 0, '缺少原 hit_ob 入口');
    assert.equal(entry.role, 'combat_interface');
    assert.equal(entry.id, `${sourcePath}:${entry.evidence.line}:hit_ob`);
    assert.equal(entry.evidence.path, sourcePath); assert.equal(entry.evidence.sha256, source.sha256);
    const rows = [];
    function add(level, variant, extra = {}) {
        const actor = { skills: { sword: level, [skill]: level, force: 400,
            dodge: 600, parry: 600, ...(extra.noChuixiao ? {} : { 'chuixiao-jifa': extra.chuixiao ?? 200 }) },
            mappings: extra.unmapped ? {} : { sword: skill }, preparations: {},
            properties: { ...pool, 'family/family_name': '桃花岛', ...extra.actorProperties },
            equipment: { type: 'sword', hold: false } };
        const target = { skills: { force: 600, dodge: 600, parry: 600, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool, ...extra.targetProperties } };
        rows.push({ id: `school-taohua-passive-${skill}-l${level}-${variant}`, stage: 'school',
            entry_id: entry.id, method: 'interface', samples: smoke ? 1 : extra.checks ?? samples,
            parameters: { school: 'taohua', family: '桃花岛', collection_group: 'taohua-passive',
                skill, usage: 'sword', ability: 'hit_ob', level, variant, actor, target,
                combination: 'yuxiao-jian+basic-force', named_participants: true, fighting: false,
                target_state: 'living', action: 'test_interface', observation: 'hit_ob_immediate',
                interface: { object: '/kungfu/skill/yuxiao-jian', function: 'hit_ob', damage: extra.incoming ?? 600, factor: 0 },
                observe_seconds: 0, expected: 'observed', not_applicable: '', capture_skill_loads: [],
                source_evidence: { ...evidence }, qualification_sources: [...taohuaPassiveSourcePaths],
                qualification_note: '已学实验 USER 的原命中被动接口，不是普攻、绝招或自然养成。普通剑保留原形，不补箫资格；无特殊内功映射、加力或自然心跳。标准目标原根骨36、基本内功600，实际 query_con=96。返回0仍是已观察接口，不记成命令拒绝；精神创伤请求仅有源码支持区间，夹制后的两项实际精神损失不得相加或倒推为请求量。未映射条件只诊断接口守卫，不冒充正常普攻可达路径。',
            } });
    }
    for (const level of [200, 400, 800]) add(level, 'baseline');
    add(159, 'level159', { checks: 2 });
    add(160, 'level160');
    add(200, 'neili499', { actorProperties: { neili: 499 }, checks: 2 });
    add(200, 'neili500', { actorProperties: { neili: 500 } });
    add(200, 'incoming119-con19', { incoming: 119, targetSkills: { force: 100 }, targetProperties: { con: 9 }, checks: 2 });
    add(200, 'incoming120-con19', { incoming: 120, targetSkills: { force: 100 }, targetProperties: { con: 9 } });
    add(200, 'incoming581-con96', { incoming: 581, checks: 2 });
    add(200, 'incoming582-con96', { incoming: 582 });
    add(200, 'unmapped', { unmapped: true, checks: 2 });
    add(200, 'chuixiao-absent', { noChuixiao: true });
    add(200, 'chuixiao400', { chuixiao: 400 });
    add(200, 'jing-below-eff', { targetProperties: { jing: 2000 } });
    add(200, 'eff-jing-clipped', { targetProperties: { jing: 100, eff_jing: 200 } });
    return rows;
}

function count(metrics, key) {
    assert.ok(object(metrics), '缺少实际计数映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key);
    return value;
}

function initial(state, cfg, side) {
    assert.ok(object(state));
    for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(state[key], 1, key);
    for (const key of ['wizardp', 'ghost', 'fighting_opponent']) assert.equal(state[key], 0, key);
    assert.match(state.object, /^\/tests\/actor#\d+$/);
    assert.equal(state.id, side ? 'right' : 'left');
    assert.ok(Object.hasOwn(state, 'busy') && zero(state.busy), '缺少或非零忙乱');
    assert.deepEqual(state.skills, cfg.skills);
    assert.deepEqual(state.mappings, cfg.mappings);
    assert.deepEqual(state.preparations, cfg.preparations);
    assert.deepEqual(state.learned, {});
    assert.ok(Object.hasOwn(state, 'conditions'));
    assert.ok(zero(state.conditions) || object(state.conditions) && Object.keys(state.conditions).length === 0);
    assert.equal(state.secondary_weapon, 'none'); assert.deepEqual(state.secondary_weapon_details, {});
    assert.equal(state.handing, 'none'); assert.deepEqual(state.handing_details, {});
    assert.equal(state.ammunition, 0);
    const equipped = !!cfg.equipment;
    const apply = { armor: 100, ...(equipped ? { damage: 50, dodge: -1 } : {}) };
    assert.deepEqual(state.temp?.apply, apply);
    assert.equal(state.weapon, equipped ? 'sword' : 'none');
    assert.equal(state.weapon_damage, equipped ? 50 : 0);
    assert.equal(state.weapon_flag, equipped ? 4 : 0);
    if (equipped) {
        assert.match(state.weapon_details?.object ?? '', /^\/tests\/sword#\d+$/);
        assert.deepEqual({ ...state.weapon_details, object: '' }, { object: '', program: '/tests/sword',
            skill_type: 'sword', weight: 3000, damage: 50, flag: 4, consistence: 100,
            material: null, rigidity: null, no_wield: null });
    } else assert.deepEqual(state.weapon_details, {});
    for (const [key, value] of Object.entries(cfg.properties))
        assert.equal(key.includes('/') || key === 'character' ? state.cultivation?.[key] : state[key], value, key);
    const effective = Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) => [key,
        Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)]));
    assert.deepEqual(state.effective_skills, effective);
    assert.equal(state.effective_con, cfg.properties.con + Math.trunc(cfg.skills.force / 10));
    assert.equal(state.effective_str, cfg.properties.str);
}

export function taohuaPassiveBounds(actor, target, incoming) {
    assert.ok(Number.isSafeInteger(incoming) && incoming >= 0);
    assert.ok(object(actor.skills) && object(actor.effective_skills) && object(actor.mappings));
    assert.ok(Number.isSafeInteger(actor.skills[skill]) && actor.skills[skill] >= 0);
    assert.ok(Number.isSafeInteger(actor.neili) && Number.isSafeInteger(target.effective_con));
    const present = Object.hasOwn(actor.skills, 'chuixiao-jifa');
    assert.equal(Object.hasOwn(actor.effective_skills, 'chuixiao-jifa'), present);
    const flute = present ? actor.effective_skills['chuixiao-jifa'] : 0;
    assert.ok(Number.isSafeInteger(flute) && flute >= 0, '吹箫有效值缺失或无效');
    const eligible = incoming >= 120 && actor.skills[skill] >= 160 && actor.neili >= 500
        && actor.mappings.sword === skill && Math.trunc(incoming / 6) > target.effective_con;
    const min = Math.trunc(incoming * 2 / 3), max = min + Math.max(0, Math.trunc(flute / 2) - 1);
    return { eligible, effective_chuixiao: flute, source_wound_min: min, source_wound_max: max };
}

export function validateTaohuaPassiveRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'taohua-passive'); assert.equal(p.skill, skill);
    assert.equal(condition.method, 'interface'); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.outcome, 'observed'); assert.equal(raw.reason, '');
    // force_me preserves command() evaluation cost, not the return value of hit_ob.
    assert.ok(Number.isSafeInteger(raw.command_accepted) && raw.command_accepted > 0);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['passives', 'interfaces']) assert.equal(raw[key]?.length, 1, key);
    for (const key of ['actions', 'attacks', 'defenses', 'dodge_checks', 'launches', 'refusals',
        'callbacks', 'terminals', 'dropped', 'skill_loads']) assert.deepEqual(raw[key], [], key);
    for (const key of ['directs', 'attack_rounds']) if (Object.hasOwn(raw, key)) assert.deepEqual(raw[key], [], key);
    initial(raw.before[0], p.actor, 0); initial(raw.before[1], p.target, 1);
    assert.notEqual(raw.before[0].object, raw.before[1].object);
    assert.deepEqual(raw.after, raw.immediate);
    const event = raw.passives[0], observed = raw.interfaces[0];
    assert.equal(event.actor, 0); assert.equal(event.target, 1);
    assert.equal(event.route, 'interface'); assert.equal(event.skill, skill);
    assert.equal(event.incoming, p.interface.damage); assert.equal(event.factor, p.interface.factor);
    assert.deepEqual(event.before, raw.before); assert.deepEqual(event.after, raw.immediate);
    assert.equal(observed.object, p.interface.object); assert.equal(observed.function, 'hit_ob');
    for (const value of [event, observed]) assert.ok(Object.hasOwn(value, 'result'), '缺少原返回');
    assert.deepEqual(observed.result, event.result);
    const triggered = typeof event.result === 'string';
    if (triggered) assert.equal(event.result,
        '\x1b[1;37m$N\x1b[1;37m手中演武兵器\x1b[1;37m发出阵阵箫音，让$n\x1b[1;37m感到难受至极。\n\x1b[0m');
    else assert.ok(zero(event.result), '原未触发返回只能是显式 0/null');
    const [before, targetBefore] = raw.before, [after, targetAfter] = raw.immediate;
    const bounds = taohuaPassiveBounds(before, targetBefore, event.incoming);
    if (triggered) assert.ok(bounds.eligible, '原触发门槛未满足');
    assert.equal(after.neili, before.neili - (triggered ? 60 : 0));
    if (triggered) {
        const low = Math.max(-1, targetBefore.eff_jing - bounds.source_wound_max);
        const high = Math.max(-1, targetBefore.eff_jing - bounds.source_wound_min);
        assert.ok(Number.isSafeInteger(targetAfter.eff_jing)
            && targetAfter.eff_jing >= low && targetAfter.eff_jing <= high, '精神创伤不在原支持区间');
        assert.equal(targetAfter.jing, Math.min(targetBefore.jing, targetAfter.eff_jing));
    } else {
        assert.equal(targetAfter.eff_jing, targetBefore.eff_jing);
        assert.equal(targetAfter.jing, targetBefore.jing);
    }
    assert.equal(event.neili_after, after.neili);
    assert.equal(event.target_eff_qi_after, targetAfter.eff_qi);
    assert.ok(Object.hasOwn(event, 'target_busy_after'));
    assert.equal(event.target_busy_after, targetAfter.busy);
    const unchanged = ['object', 'id', 'userp', 'playerp', 'interactive', 'wizardp', 'living', 'ghost',
        'busy', 'fighting_opponent', 'skills', 'effective_skills', 'mappings', 'preparations', 'learned',
        'cultivation', 'conditions', 'effective_con', 'effective_str', 'weapon', 'weapon_details',
        'weapon_damage', 'weapon_flag', 'secondary_weapon', 'secondary_weapon_details', 'handing',
        'handing_details', 'ammunition', 'max_qi', 'max_jing', 'max_neili', 'qi', 'eff_qi',
        'combat_exp', 'jiali', 'str', 'int', 'con', 'dex', 'gender', 'shen'];
    for (const side of [0, 1]) {
        const b = raw.before[side], a = raw.immediate[side], m = raw.metrics[side];
        for (const key of unchanged) assert.deepEqual(a[key], b[key], key);
        assert.deepEqual(a.temp?.apply, b.temp.apply);
        if (side) assert.equal(a.neili, b.neili);
        else for (const key of ['jing', 'eff_jing']) assert.equal(a[key], b[key]);
        for (const key of resources) {
            assert.equal(count(m, key + '_recovery'), 0, '不允许费用和恢复相抵');
            assert.equal(count(m, key + '_cost'), b[key] - a[key], '实际资源账：' + key);
        }
        for (const key of ['hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats', 'ability_launched']) assert.equal(count(m, key), 0, key);
    }
    return { ...bounds, triggered, neili_cost: before.neili - after.neili,
        eff_jing_loss: targetBefore.eff_jing - targetAfter.eff_jing,
        jing_loss: targetBefore.jing - targetAfter.jing, clipped: triggered && targetAfter.eff_jing === -1 };
}

export function taohuaPassiveEffects(rows, condition) {
    const measured = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id, '台账条件归属不同');
        assert.ok(['observed', 'error', 'not_applicable'].includes(row.outcome), '未知或不应出现的接口结果');
        assert.equal(row.raw?.condition_id, row.condition_id, '原记录条件不同');
        assert.equal(row.raw.outcome, row.outcome, '原记录结果不同');
        if (row.outcome === 'observed') measured.push(validateTaohuaPassiveRecord(row.raw, condition));
    }
    const eligible = measured.filter(value => value.eligible), positive = measured.filter(value => value.triggered);
    const damage = condition.parameters.interface.damage;
    const flute = Math.trunc((condition.parameters.actor.skills['chuixiao-jifa'] ?? 0) / 2);
    return { records: rows.length, interface_calls: measured.length,
        unknown_or_unobserved: rows.length - measured.length,
        guard_no_effect: measured.filter(value => !value.eligible).length,
        eligible_calls: eligible.length, no_effect_returns: measured.length - positive.length,
        trigger_per_call: probability(positive.length, measured.length),
        trigger_when_eligible: probability(positive.length, eligible.length),
        actor_neili_cost: distribution(measured.map(value => value.neili_cost)),
        target_eff_jing_loss: distribution(measured.map(value => value.eff_jing_loss)),
        target_jing_loss: distribution(measured.map(value => value.jing_loss)),
        triggered_neili_cost: distribution(positive.map(value => value.neili_cost)),
        triggered_eff_jing_loss: distribution(positive.map(value => value.eff_jing_loss)),
        triggered_jing_loss: distribution(positive.map(value => value.jing_loss)),
        immediate_clipped: positive.filter(value => value.clipped).length,
        requested_wound: { observation: 'not_observed', source_support_if_triggered: {
            min: Math.trunc(damage * 2 / 3), max: Math.trunc(damage * 2 / 3) + Math.max(0, Math.trunc(flute / 2) - 1) } },
        craze: 'not_observed', last_damage_attribution: 'not_observed',
        later_unconsciousness_or_death: 'not_observed', ordinary_hit_rate: 'not_observed' };
}
