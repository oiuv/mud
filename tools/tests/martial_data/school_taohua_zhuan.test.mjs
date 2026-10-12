import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from './inventory.mjs';
import { validateRecord } from './execution.mjs';
import { validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { taohuaZhuanConditions, taohuaZhuanSourcePaths, taohuaZhuanFixtureRequirements,
    taohuaZhuanPower, taohuaZhuanDamageSupport, validateTaohuaZhuanRecord, taohuaZhuanEffects } from './school_taohua_zhuan_cases.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const digest = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const skill = 'tanzhi-shentong', grant = 'can_perform/tanzhi-shentong/zhuan';
const catalog = { skills: [skill, skill + '/zhuan'].map(id => {
    const path = 'kungfu/skill/' + id + '.c', source = readFileSync(join(root, path), 'utf8'), parsed = scanSource(source);
    assert.deepEqual(parsed.lexical_issues, []);
    return { id, path, sha256: digest(source), entries: parsed.functions.filter(x => x.name === 'perform')
        .map(x => ({ id: `${path}:${x.line}:${x.name}`, role: 'perform' })) };
}) };
const cases = taohuaZhuanConditions(catalog), smoke = taohuaZhuanConditions(catalog, { smoke: true });
function pick(tag = 'baseline', level = 220) {
    const c = cases.find(x => x.id === `school-taohua-zhuan-l${level}-${tag}`); assert.ok(c); return c;
}
function snapshot(cfg, side, fighting) {
    const primary = !!cfg.equipment && cfg.equipment.slot !== 'secondary_weapon';
    const secondary = cfg.equipment?.slot === 'secondary_weapon';
    const apply = { armor: 100, ...(primary ? { damage: 50, dodge: -1 } : {}) };
    const details = { object: '/tests/sword#' + (200 + side), program: '/tests/sword', skill_type: 'sword',
        weight: 3000, damage: 50, flag: 4, consistence: 100 };
    return { ...Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => !key.includes('/'))),
        cultivation: Object.fromEntries(Object.entries(cfg.properties).filter(([key]) => key.includes('/'))),
        object: '/tests/actor#' + (100 + side), id: side ? 'right' : 'left',
        userp: 1, playerp: 1, interactive: 1, wizardp: 0, living: 1, ghost: 0,
        fighting_opponent: Number(fighting), busy: cfg.busy ?? null,
        skills: structuredClone(cfg.skills), mappings: structuredClone(cfg.mappings),
        preparations: structuredClone(cfg.preparations), learned: {}, skill_order: Object.keys(cfg.skills), temp: { apply },
        effective_skills: Object.fromEntries(Object.entries(cfg.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])),
        effective_str: cfg.properties.str + Math.trunc((cfg.skills.finger ?? 0) / 10),
        weapon: primary ? 'sword' : 'none', weapon_damage: primary ? 50 : 0, weapon_flag: primary ? 4 : 0,
        weapon_details: primary ? details : {}, secondary_weapon: secondary ? 'sword' : 'none',
        secondary_weapon_details: secondary ? details : {}, handing: 'none', handing_details: {} };
}

// Synthetic validator inputs only. These are never written to events or a sample ledger.
function trace(c, { hit, progress = 1, input, percent = 100, fee, supportIndex = 0, order } = {}) {
    const p = c.parameters, accepted = p.expected === 'observed';
    const before = [snapshot(p.actor, 0, p.fighting), snapshot(p.target, 1, p.fighting)];
    if (order) before[0].skill_order = order;
    let preparation;
    if (p.target_state === 'unconscious') {
        preparation = { before: structuredClone(before[1]), terminals: [{ side: 1, state: 'unconscious' }] };
        Object.assign(before[1], { living: 0, qi: 0, jing: 0 }); preparation.after = structuredClone(before[1]);
    }
    const raw = { kind: 'sample', condition_id: c.id, method: 'perform', outcome: p.expected,
        before, immediate: structuredClone(before), after: [], metrics: [{}, {}],
        command_accepted: Number(accepted), launches: [], refusals: [], directs: [], attacks: [], passives: [],
        defenses: [], dodge_checks: [], interfaces: [], dropped: [], terminals: [], callbacks: [],
        elapsed: 0.01, reason: '', ...(preparation ? { preparation } : {}) };
    const [b, t] = before, [a, end] = raw.immediate, power = taohuaZhuanPower(b, t);
    if (accepted) {
        hit ??= p.gate_expectation !== 'miss' && Math.trunc(power.ap / 2) + power.ap - 1 > power.dp;
        const death = hit && b.max_neili > t.max_neili * 2;
        raw.launches = [{ actor: b.object, skill, argument: 'zhuan right' }]; raw.metrics[0].ability_launched = 1;
        a.busy = hit && !death ? 3 : 2;
        if (progress) a.learned[skill] = progress;
        if (death) {
            for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing']) { end[key] = 1; raw.metrics[1][key + '_cost'] = t[key] - 1; }
            end.ghost = 1; end.max_neili -= 20; end.combat_exp -= Math.trunc(t.combat_exp * 3 / 100);
            end.potential -= Math.trunc((t.potential - t.learned_points) / 2);
            a.fighting_opponent = 0; end.fighting_opponent = 0;
            end.skills = Object.fromEntries(Object.entries(t.skills).filter(([, n]) => n > 1).map(([key, n]) => [key, n - 1]));
            end.mappings = {}; end.preparations = {}; end.temp.apply.damage = 0; end.temp.apply.dodge = 0;
            end.effective_skills = Object.fromEntries(Object.entries(end.skills).map(([key, n]) => [key, Math.trunc(n / 2)]));
            end.weapon = 'none'; end.weapon_details = {}; end.weapon_damage = 0; end.weapon_flag = 0;
            raw.terminals = [{ side: 1, state: 'death' }];
            raw.dropped = [{ object: '/clone/misc/corpse#300', name: '右侧武者的尸体', type: null, no_wield: null }];
            raw.zhuan_death = { target: t.object, killer: b.object, corpse: '/clone/misc/corpse#300',
                weapon: { ...t.weapon_details, environment: '/clone/misc/corpse#300', equipped: null },
                target_environment: '/d/death/gate', learned_was_mapping: 0,
                conditions_before: {}, conditions_after: { die_guard: 6000 },
                killer_pks_delta: 1, killer_wanted_pks_delta: 0, killer_experience_delta: 0 };
        } else {
            fee ??= 200; raw.metrics[0].neili_cost = fee; a.neili -= fee;
            if (hit) {
                input ??= power.ap;
                raw.directs = [{ actor: 0, target: 1, type: 0, damage: input, percent, weapon: 'none', weapon_object: '' }];
                raw.metrics[0].direct = 1;
                const support = taohuaZhuanDamageSupport(b, t, input, percent)[supportIndex];
                raw.metrics[1].qi_cost = support.damage; raw.metrics[1].eff_qi_cost = support.wound;
                end.qi -= support.damage; end.eff_qi -= support.wound;
            }
        }
    } else {
        raw.reason = p.refusal;
        raw.refusals = [{ actor: b.object, reason: raw.reason }];
    }
    raw.after = structuredClone(raw.immediate); return raw;
}
function invalid(c, operation, options) {
    const raw = trace(c, options); operation(raw); raw.after = structuredClone(raw.immediate);
    assert.throws(() => validateTaohuaZhuanRecord(raw, c));
}
const row = raw => ({ condition_id: raw.condition_id, outcome: raw.outcome, raw });

test('全24条件覆盖真实公共/门派/专用消费路径，原样校验不回填', () => {
    for (const condition of cases) {
        const raw = trace(condition);
        const before = JSON.stringify(raw);
        validateRecord(raw, condition);
        validateSchoolCombatRecord(raw, condition);
        validateTaohuaZhuanRecord(raw, condition);
        assert.equal(JSON.stringify(raw), before, condition.id);
    }
    const secondary = pick('secondary');
    const bad = trace(secondary);
    bad.before[0].secondary_weapon_details.program = '/tests/unknown';
    assert.throws(() => validateRecord(bad, secondary));
    const other = structuredClone(secondary);
    other.parameters.collection_group = 'taohua-xiao';
    assert.throws(() => validateRecord(trace(secondary), other), '不能扩大其他组副手权限');
});

test('单命令正执行成本1/23/476均受理，统计不累加成本且原记录不改写', () => {
    for (const condition of cases.filter(item => item.parameters.expected === 'observed')) {
        const records = [1, 23, 476].map(cost => {
            const raw = trace(condition); raw.command_accepted = cost; return raw;
        });
        const before = records.map(raw => JSON.stringify(raw));
        for (const raw of records) assert.equal(validateTaohuaZhuanRecord(raw, condition).accepted, true);
        const wrap = raw => ({ condition_id: condition.id, outcome: raw.outcome, raw });
        assert.deepEqual(taohuaZhuanEffects(records.map(wrap), condition),
            taohuaZhuanEffects(records.map(raw => wrap({ ...raw, command_accepted: 1 })), condition));
        assert.deepEqual(records.map(raw => JSON.stringify(raw)), before, '原成本不可归一化或回填');
    }
});

test('命令成本必须显式非负安全整数，拒绝只允许0且不能以缺值冒充', () => {
    const invalid = [undefined, null, false, true, '1', {}, [], -1, 0.5, NaN, Infinity,
        Number.MAX_SAFE_INTEGER + 1];
    for (const condition of cases) {
        const missing = trace(condition); delete missing.command_accepted;
        assert.throws(() => validateTaohuaZhuanRecord(missing, condition), condition.id);
        for (const cost of invalid) {
            const raw = trace(condition); raw.command_accepted = cost;
            assert.throws(() => validateTaohuaZhuanRecord(raw, condition), condition.id + ': ' + String(cost));
        }
        if (condition.parameters.expected === 'observed') {
            const raw = trace(condition); raw.command_accepted = 0;
            assert.throws(() => validateTaohuaZhuanRecord(raw, condition), '已受理不可记0成本');
        } else {
            const zero = trace(condition); zero.command_accepted = 0;
            assert.equal(validateTaohuaZhuanRecord(zero, condition).accepted, false);
            for (const cost of [1, 23, 476]) {
                const raw = trace(condition); raw.command_accepted = cost;
                assert.throws(() => validateTaohuaZhuanRecord(raw, condition), '拒绝不可记正成本');
            }
        }
    }
});

test('24有限条件/734正式/24烟雾；未共享注册，所有来源必须实际存在', () => {
    assert.equal(cases.length, 24); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 734);
    assert.equal(smoke.reduce((n, c) => n + c.samples, 0), 24);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').length, 13);
    assert.equal(new Set(cases.map(c => c.id)).size, 24);
    assert.deepEqual(smoke.map(c => ({ ...c, samples: 0 })), cases.map(c => ({ ...c, samples: 0 })));
    assert.ok(taohuaZhuanFixtureRequirements.length >= 8);
    for (const path of taohuaZhuanSourcePaths) assert.ok(existsSync(join(root, path)), path);
    assert.throws(() => taohuaZhuanConditions(catalog, { samples: 0 }));
    assert.throws(() => taohuaZhuanConditions({ skills: [] }));
});

test('全部条件的合成分支自检并非驱动样本', () => {
    for (const c of cases) assert.equal(validateTaohuaZhuanRecord(trace(c), c).accepted, c.parameters.expected === 'observed');
});

test('220/400/800原AP整数和浮点边界独立已知值', () => {
    for (const [level, ap] of [[220, 760], [400, 1230], [800, 2310]]) {
        const raw = trace(pick('baseline', level)), p = taohuaZhuanPower(...raw.before);
        assert.equal(p.ap, ap); assert.equal(p.dp, 900); assert.equal(p.lvls, 800);
    }
    assert.equal(taohuaZhuanPower(...trace(pick('finger-styles5', 400)).before).ap, 1269);
});

test('第六门指法不按JS键序伪造，必须保留原LPC顺序和前5项', () => {
    const c = pick('finger-styles6', 400), raw = trace(c), order = raw.before[0].skill_order;
    const alternate = [...order].reverse(), alt = trace(c, { order: alternate });
    const p = validateTaohuaZhuanRecord(raw, c), q = validateTaohuaZhuanRecord(alt, c);
    assert.equal(p.selected.length, 5); assert.equal(q.selected.length, 5); assert.notEqual(p.sum, q.sum);
    assert.notEqual(p.ap, q.ap);
    for (const operation of [r => delete r.before[0].skill_order,
        r => r.before[0].skill_order.push('finger'), r => r.before[0].skill_order.pop(),
        r => r.before[0].skill_order.push('invented')]) invalid(c, operation);
});

test('100%创伤不是原始AP：独立手算膂力/悟性/压缩/根骨支持集', () => {
    const raw = trace(pick()), support = taohuaZhuanDamageSupport(...raw.before, 760, 100);
    assert.ok(support.some(x => x.damage === 987 && x.wound === 731));
    assert.ok(support.some(x => x.damage === 1065 && x.wound === 789));
    assert.deepEqual([...new Set(support.map(x => x.damage))], [987, 1065]);
    const c = pick('mathematics20');
    for (const supportIndex of [0, 99, 100, 199]) for (const percent of [100, 101])
        assert.equal(validateTaohuaZhuanRecord(trace(c, { supportIndex, percent }), c).hit, true);
});

test('算术19/20的随机费和百分比分界各自核对，不采用浮点百分比', () => {
    for (const [math, maxPercent] of [[19, 100], [20, 101]]) {
        const c = pick('mathematics' + math);
        for (const fee of [200, 199 + math]) assert.equal(validateTaohuaZhuanRecord(trace(c, { fee, percent: maxPercent }), c).actor_neili_cost, fee);
        assert.throws(() => validateTaohuaZhuanRecord(trace(c, { fee: 200 + math }), c));
        assert.throws(() => validateTaohuaZhuanRecord(trace(c, { percent: maxPercent + 1 }), c));
    }
});

test('最大内力倍数严格大于：3999/4000普通伤害，4001原die', () => {
    for (const max of [3999, 4000, 4001]) {
        const c = pick('max-ratio' + max), raw = trace(c), result = validateTaohuaZhuanRecord(raw, c);
        assert.equal(result.direct_death, max === 4001); assert.equal(result.hit, true);
        assert.equal(result.actor_neili_cost, max === 4001 ? 0 : 200);
        assert.equal(result.ordinary_qi_damage === null, max === 4001);
    }
    invalid(pick('max-ratio4000'), r => r.immediate[1].ghost = 1);
    invalid(pick('max-ratio4001'), r => r.immediate[1].ghost = 0);
});

test('直接死亡的ghost/living、资源、掉级删除、原尸体物权不可互换', () => {
    const c = pick('max-ratio4001');
    for (const operation of [r => r.immediate[1].living = 0,
        r => r.immediate[1].max_neili++, r => r.immediate[1].neili = 1980,
        r => r.immediate[1].skills.parry = 0, r => r.immediate[1].skills.force = 2,
        r => r.immediate[1].effective_skills.force = 1,
        r => r.immediate[1].mappings.sword = skill,
        r => r.immediate[1].potential++, r => r.immediate[1].combat_exp++,
        r => r.immediate[1].busy = 2, r => r.immediate[1].temp.apply = {},
        r => r.zhuan_death.learned_was_mapping = 1,
        r => r.zhuan_death.weapon.object = '/tests/sword#999',
        r => r.zhuan_death.weapon.environment = '/tests/runner',
        r => r.zhuan_death.weapon.equipped = 'wielded',
        r => r.zhuan_death.weapon.weight++, r => r.zhuan_death.weapon.damage++,
        r => r.zhuan_death.weapon.consistence--, r => r.zhuan_death.weapon.flag = 0,
        r => delete r.before[0].score, r => r.before[0].experience = 1,
        r => r.dropped = [], r => r.dropped.push(structuredClone(r.dropped[0])),
        r => r.dropped[0].object = '/clone/misc/corpse#999', r => delete r.dropped[0].name,
        r => r.dropped[0].name = '', r => delete r.dropped[0].type,
        r => delete r.dropped[0].no_wield, r => r.dropped[0].type = 'sword',
        r => r.dropped[0].no_wield = false,
        r => r.zhuan_death.target_environment = '/d/city/kedian',
        r => r.zhuan_death.conditions_after.die_guard--,
        r => r.zhuan_death.killer_experience_delta = 1,
        r => r.zhuan_death.killer_wanted_pks_delta = 1,
        r => r.terminals = [], r => r.terminals[0].side = 0,
        r => delete r.zhuan_death]) invalid(c, operation);
});

test('拒绝与受理失手分开，公共拒绝保持同源原文', () => {
    const miss = pick('forced-miss'), r = validateTaohuaZhuanRecord(trace(miss), miss);
    assert.equal(r.accepted, true); assert.equal(r.hit, false); assert.equal(r.actor_neili_cost, 200);
    const noMap = pick('no-map');
    assert.equal(validateTaohuaZhuanRecord(trace(noMap), noMap).accepted, false);
    invalid(noMap, r => { r.reason = '你现在的指法(finger)中并没有这种外功。\n'; r.refusals[0].reason = r.reason; });
    invalid(noMap, r => r.refusals[0].reason = 'other');
    invalid(noMap, r => { r.reason = '不允许操作。'; r.refusals[0].reason = r.reason; });
    invalid(pick('no-grant'), r => r.launches.push({}));
    invalid(miss, r => { r.metrics[0].neili_cost = 0; r.immediate[0].neili = r.before[0].neili; });
});

test('原直伤入参、主人/目标/type/装备与损伤观察一致', () => {
    const c = pick('mathematics20');
    for (const operation of [r => r.directs[0].actor = 1, r => r.directs[0].target = 0,
        r => r.dropped = [{ object: '/clone/misc/corpse#300', name: '尸体', type: null, no_wield: null }],
        r => r.directs[0].type = 2, r => r.directs[0].weapon = 'sword',
        r => r.directs[0].damage = 1, r => r.directs[0].percent = 100.5,
        r => r.metrics[0].direct = 2, r => r.metrics[1].direct = 1,
        r => { r.metrics[1].qi_cost = 1; r.immediate[1].qi = r.before[1].qi - 1; },
        r => { r.metrics[1].eff_qi_cost = 0; r.immediate[1].eff_qi = r.before[1].eff_qi; }]) invalid(c, operation);
});

test('原昏迷准备记录与正式资源账隔离；缺观察不能填零', () => {
    const c = pick('unconscious-target');
    for (const operation of [r => delete r.preparation, r => r.preparation.terminals = [],
        r => r.preparation.before.living = 0, r => r.preparation.after.qi = 1,
        r => r.metrics[1].qi_cost = 100000, r => r.terminals = r.preparation.terminals]) invalid(c, operation);
    for (const operation of [r => delete r.metrics, r => r.metrics[0] = null,
        r => r.before[0].interactive = 0, r => r.before[0].busy = undefined,
        r => delete r.before[0].secondary_weapon, r => delete r.before[0].cultivation[grant],
        r => r.before[0].effective_skills.finger++, r => r.before[0].effective_str++,
        r => r.immediate[0].temp.apply.finger = 1, r => r.before[1].weapon_details.weight--]) invalid(pick(), operation);
});

test('原命令熟练增长与命中分开，不制造升级或目标学习', () => {
    const c = pick();
    for (const hit of [false, true]) for (const progress of [0, 1])
        assert.equal(validateTaohuaZhuanRecord(trace(c, { hit, progress }), c).learned_delta, progress);
    for (const level of [400, 800]) assert.throws(() => validateTaohuaZhuanRecord(trace(pick('baseline', level), { progress: 0 }), pick('baseline', level)));
    for (const operation of [r => r.immediate[0].learned[skill] = 2,
        r => r.immediate[0].learned.finger = 1, r => r.immediate[1].learned.sword = 1,
        r => r.immediate[0].skills[skill]++]) invalid(c, operation);
});

test('即时窗口不混入普通攻击、心跳或后续死亡房间回调', () => {
    for (const key of ['attacks', 'passives', 'defenses', 'dodge_checks', 'interfaces', 'dropped', 'callbacks'])
        invalid(pick(), r => r[key].push({}));
    for (const key of ['heartbeats', 'quick', 'riposte', 'hit', 'dodge', 'parry'])
        invalid(pick(), r => r.metrics[0][key] = 1);
    const raw = trace(pick('max-ratio4001')); raw.after[1].ghost = 0;
    assert.throws(() => validateTaohuaZhuanRecord(raw, pick('max-ratio4001')));
});

test('统计的普通伤害、直接死亡、失手/拒绝/错误分别计数，未知不填零', () => {
    const c = pick(), hit = trace(c, { hit: true }), miss = trace(c, { hit: false, progress: 0 });
    hit.parameters = { actor: { skills: { finger: 99999 } } };
    const stats = taohuaZhuanEffects([row(hit), row(miss)], c);
    assert.equal(stats.samples, 2); assert.equal(stats.hit.rate, 0.5); assert.equal(stats.hit.trials, 2);
    assert.equal(stats.ordinary_damage_samples, 1); assert.equal(stats.ordinary_qi_damage.n, 1);
    assert.equal(stats.direct_input.unknown, 1); assert.equal(stats.learned_progress.rate, 0.5);
    const death = pick('max-ratio4001'), d = taohuaZhuanEffects([row(trace(death))], death);
    assert.equal(d.direct_death.rate, 1); assert.equal(d.ordinary_damage_samples, 0);
    assert.equal(d.ordinary_qi_damage.mean, null); assert.equal(d.actor_neili_cost.mean, 0);
    assert.equal(d.target_qi_net_loss.mean, 99999); assert.equal(d.target_max_neili_loss.mean, 20);
    const refusal = pick('no-grant'), f = taohuaZhuanEffects([row(trace(refusal))], refusal);
    assert.equal(f.refused_samples, 1); assert.equal(f.hit.rate, null); assert.equal(f.actor_neili_cost.mean, null);
    const error = { condition_id: c.id, method: c.method, outcome: 'error' };
    const e = taohuaZhuanEffects([row(error)], c); assert.equal(e.unknown_effect_samples, 1);
    assert.equal(e.actor_neili_cost.n, 0); assert.equal(e.hit.rate, null);
    assert.equal(taohuaZhuanEffects([], c).hit.trials, 0);
    assert.throws(() => taohuaZhuanEffects([row(trace(death))], c));
});
