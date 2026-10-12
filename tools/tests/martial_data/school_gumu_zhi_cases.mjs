// Registered school group: original sanwu-shou/zhi plus its original hit_ob.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';
import { validateGumuAttackLoads } from './school_gumu_weapons_cases.mjs';

const skill = 'sanwu-shou', grant = 'can_perform/sanwu-shou/zhi';
const wall = 'can_learn/yunv-xinjing/wall';
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const pool = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 36, shen: 0, gender: '女性', character: '心狠手辣' };

export const gumuZhiFixtureRequirements = [
    'Register this group and frozen-condition report only after the current batch; include this module and its existing load-validator dependency in frozen tools.',
    'Reuse original first-load capture and selected-action observations for sanwu-shou (plus yinsuo-jinling in wrong-map); retain the first actual global table across levels, never reload or re-query actions.',
    'Allow only this group initial apply/attack and observe cultivation.character, the zhi grant, the wall grant, and actual fighting_opponent for both real USERs.',
    'Reuse existing before/after martial hit_ob snapshots and per-attack observation; add actual apply_attack only for this group, without new probes or changed original expressions.',
    'For the one unconscious target, call original unconcious after original kill relationships; retain preparation snapshots/terminals separately, then clear only preparation observation counters.',
    'Keep immediate resources, launch, planned prepaid cost, resolved attacks and passive cost distinct; allow actual partial execution, do not equate observed attacks with planned fee.',
];

export function gumuZhiConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === `${skill}/zhi`);
    const entry = source?.entries.find(e => e.role === 'perform')?.id;
    assert.ok(entry, '缺少无所不至原 perform 入口');
    const loads = names => names.map(name => {
        const found = catalog.skills.find(s => s.id === name);
        assert.ok(found?.path && /^[a-f0-9]{64}$/.test(found.sha256), '缺少原加载来源：' + name);
        return { skill: name, path: found.path, sha256: found.sha256 };
    });
    const result = [];
    function add(tag, level = 200, extra = {}) {
        const actor = { skills: { whip: level, [skill]: level, parry: level, force: level,
            'yunv-xinjing': level, dodge: level, 'qixing-bu': level, ...extra.skills },
        mappings: { whip: skill, parry: skill, force: 'yunv-xinjing', dodge: 'qixing-bu' }, preparations: {},
        properties: { ...pool, 'family/family_name': '古墓派', [grant]: 1, [wall]: 0,
            neili: extra.normal ? 6000 : 140, ...extra.properties },
        ...(extra.noWeapon ? {} : { equipment: { type: extra.weapon ?? 'whip', hold: false } }),
        ...(extra.busy ? { busy: extra.busy } : {}), ...(extra.temp ? { temp: extra.temp } : {}) };
        if (extra.noMap) delete actor.mappings.whip;
        if (extra.wrongMap) { actor.skills['yinsuo-jinling'] = level; actor.mappings.whip = 'yinsuo-jinling'; }
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...pool, gender: '男性', ...extra.targetProperties },
            equipment: { type: 'sword', hold: false } };
        const capture = loads(extra.wrongMap ? [skill, 'yinsuo-jinling'] : [skill]);
        result.push({ id: `school-gumu-zhi-l${level}-${tag}`, stage: 'school', entry_id: entry, method: 'perform',
            samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-zhi', skill,
                ability: 'zhi', usage: 'whip', level, combination: 'sanwu-shou+yunv-xinjing+qixing-bu',
                actor, target, fighting: extra.fighting ?? true, action: 'perform whip.zhi',
                target_state: extra.targetState ?? 'living', observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.expected ?? 'observed', not_applicable: '',
                low_neili_control: actor.properties.neili === 140,
                gate_expectation: extra.gate ?? 'random', capture_skill_loads: capture,
                qualification_sources: [...new Set([source.path, ...capture.map(x => x.path),
                    'kungfu/skill/yunv-xinjing.c', 'kungfu/skill/qixing-bu.c',
                    'kungfu/class/gumu/li.c', 'kungfu/class/gumu/gumu.h', 'cmds/skill/perform.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/attribute.c', 'feature/action.c',
                    'feature/dbase.c', 'feature/damage.c', 'feature/equip.c', 'mudcore/inherit/action.c',
                    'inherit/skill/skill.c', 'inherit/weapon/whip.c', 'inherit/weapon/sword.c',
                    'inherit/char/char.c', 'include/combat.h', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师 USER、心狠手辣、加力0；技能与领悟仅为实验资格。低140内力为排除命中附伤的干净分支组，不代表全部实战；正常6000内力单列。原招按计划4/5至7击先扣费，失败分支仍连击，实际可提前结束；三无命中附伤另扣30，不拿总耗费直接除20。正邪10%与非女性15%依原顺序整数截断。保留第一次真实玩家加载的全局动作及原随机值，不按每档重建。未激发／错映射拒绝走原命令解析，不冒充已执行 zhi 内部检查。',
            } });
    }
    for (const level of [200, 400, 800]) {
        add('low140', level);
        add('normal6000', level, { normal: true });
    }
    add('low140-female-low-dodge', 200, { targetSkills: { dodge: 2 }, targetProperties: { gender: '女性' }, gate: 'success' });
    add('low140-good-low-dodge', 200, { targetSkills: { dodge: 2 }, targetProperties: { shen: 1 }, gate: 'success' });
    add('normal6000-good', 200, { normal: true, targetProperties: { shen: 1 } });
    for (const [gender, label] of [['女性', 'female'], ['男性', 'male']]) for (const shen of [-1, 0, 1])
        add(`failed-${label}-shen${shen}`, 200, { checks: 2, targetSkills: { dodge: 100000 },
            targetProperties: { gender, shen }, gate: 'failure' });
    add('failed-asexual', 200, { checks: 2, targetSkills: { dodge: 100000 },
        targetProperties: { gender: '无性' }, gate: 'failure' });
    for (const success of [true, false]) add('existing-attack-' + (success ? 'success' : 'failure'), 200,
        { checks: 2, temp: { 'apply/attack': 17 }, targetSkills: { dodge: success ? 2 : 100000 },
            gate: success ? 'success' : 'failure' });
    const check = (tag, extra = {}) => add(tag, 200, { checks: 2, expected: 'refused', ...extra });
    check('skill99', { skills: { [skill]: 99 } });
    check('skill100', { skills: { [skill]: 100 }, expected: 'observed' });
    check('neili139', { properties: { neili: 139 } });
    check('no-grant', { properties: { [grant]: 0 } });
    check('no-weapon', { noWeapon: true });
    check('sword', { weapon: 'sword' });
    check('no-map', { noMap: true });
    check('wrong-map', { wrongMap: true });
    check('busy', { busy: 2 });
    check('no-fight', { fighting: false });
    check('unconscious-target', { targetState: 'unconscious' });
    return result;
}

function mapping(value, label) {
    assert.ok(value && typeof value === 'object' && !Array.isArray(value), label);
    return value;
}
function integer(value, label) { assert.ok(Number.isSafeInteger(value), label); return value; }
function count(metrics, key) {
    mapping(metrics, '缺少原指标映射');
    const value = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效计数：' + key); return value;
}
function idle(state) {
    assert.ok(Object.hasOwn(state, 'busy'), '缺少真实忙乱');
    const value = state.busy === null ? 0 : state.busy;
    assert.ok(Number.isSafeInteger(value) && value >= 0, '无效忙乱'); return value;
}
function apply(state, key) {
    const values = mapping(state.temp?.apply, '缺少实际 apply 映射');
    return integer(Object.hasOwn(values, key) ? values[key] : 0, '无效 apply/' + key);
}
function identity(state) {
    assert.ok(typeof state?.object === 'string' && state.object.length > 0, '缺少原角色身份');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
    assert.equal(state.wizardp, 0);
    for (const key of ['living', 'ghost', 'fighting_opponent']) assert.ok([0, 1].includes(state[key]), key);
    idle(state); mapping(state.temp?.apply, '缺少实际 apply 映射');
    for (const key of health) integer(state[key], key);
}

export function gumuZhiAttackPower(actor, target) {
    let ap = integer(actor.effective_skills?.whip, '缺少原有效鞭法');
    integer(target.shen, '缺少原正邪值'); assert.equal(typeof target.gender, 'string');
    if (target.shen > 0) ap += Math.trunc(ap * 10 / 100);
    if (target.gender !== '女性') ap += Math.trunc(ap * 15 / 100);
    return ap;
}

function validateLoads(raw, p) {
    assert.equal(raw.skill_loads?.length, p.capture_skill_loads.length);
    for (const expected of p.capture_skill_loads) {
        const found = raw.skill_loads.filter(x => x.skill === expected.skill); assert.equal(found.length, 1);
        const load = found[0];
        assert.equal(load.path, expected.path); assert.equal(load.sha256, expected.sha256);
        assert.ok(typeof load.load_id === 'string' && load.load_id.length > 0);
        assert.ok(typeof load.run_id === 'string' && load.run_id.length > 0);
        assert.ok(typeof load.state?.object === 'string' && load.state.object.length > 0);
        assert.equal(load.state.userp, 1); assert.equal(load.state.playerp, 1);
        assert.equal(load.state.interactive, 1); assert.equal(load.state.wizardp, 0);
        for (const kind of ['skills', 'effective_skills']) for (const key of ['force', 'whip', 'dodge', 'parry'])
            assert.ok(Number.isSafeInteger(load.state[kind]?.[key]) && load.state[kind][key] >= 0, key);
    }
    for (const event of raw.actions) {
        assert.equal(event.actor, 0); assert.equal(event.target, 1); assert.equal(event.skill, skill);
        const action = mapping(event.action, '缺少原动作');
        assert.ok(typeof action.action === 'string' && action.action.length > 0);
        assert.ok([0, 30, 60, 90, 120, 150, 200, 300].includes(action.lvl) && action.lvl < p.actor.skills[skill]);
        if (action.lvl !== 300) continue;
        const s = raw.skill_loads.find(x => x.skill === skill).state.skills;
        const base = { force: Math.trunc(s.force / 2), attack: Math.trunc(s.whip / 4),
            dodge: Math.trunc(s.dodge / 6), parry: Math.trunc(s.parry / 6), damage: Math.trunc(s.force / 4) };
        const span = { force: s.force, attack: Math.trunc(s.whip / 2), dodge: Math.trunc(s.force / 3),
            parry: Math.trunc(s.parry / 3), damage: Math.trunc(s.whip / 2) };
        for (const key of Object.keys(base)) assert.ok(Number.isSafeInteger(action[key])
            && action[key] >= base[key] && action[key] <= base[key] + Math.max(0, span[key] - 1), key);
    }
}

// The existing cross-record oracle retains one real first-load and one global dynamic action per run.
export const validateGumuZhiLoads = rows => validateGumuAttackLoads(rows.filter(row => (row.raw ?? row).outcome !== 'error'),
    [{ skill, usage: 'whip', dynamic: 300 }, { skill: 'yinsuo-jinling', usage: 'whip', dynamic: 300 }]);

function validatePassive(event, raw) {
    assert.equal(event.actor, 0); assert.equal(event.target, 1);
    assert.equal(event.route, 'martial'); assert.equal(event.skill, skill);
    assert.equal(event.before?.length, 2); assert.equal(event.after?.length, 2);
    integer(event.incoming, '缺少原传入伤害'); assert.ok(event.incoming > 0);
    assert.ok(Object.hasOwn(event, 'result'), '缺少原 hit_ob 返回值');
    const [b, t] = event.before, [a, end] = event.after;
    for (const side of [0, 1]) for (const phase of ['before', 'after']) {
        const s = event[phase][side]; identity(s);
        assert.equal(s.object, raw.before[side].object, '附伤状态归属错误');
        assert.deepEqual(s.skills, raw.before[side].skills);
        assert.deepEqual(s.mappings, raw.before[side].mappings);
        assert.equal(s.shen, raw.before[side].shen); assert.equal(s.gender, raw.before[side].gender);
    }
    const triggered = typeof event.result === 'string' && event.result.length > 0;
    const eligible = !!t.living && b.neili >= 200 && b.skills[skill] >= 120;
    if (triggered) assert.ok(eligible && t.shen > 0, '原附伤门槛不符');
    else assert.equal(event.result, eligible ? 1 : 0, '原整数附加伤害不是布尔占位');
    const cost = triggered ? 30 : 0;
    assert.equal(a.neili, b.neili - cost);
    for (const key of health.filter(x => x !== 'neili')) assert.equal(a[key], b[key]);
    for (const key of ['jing', 'eff_jing', 'neili']) assert.equal(end[key], t[key]);
    assert.equal(end.eff_qi, triggered ? Math.max(-1, t.eff_qi - event.incoming) : t.eff_qi);
    assert.equal(end.qi, triggered ? Math.min(t.qi, end.eff_qi) : t.qi);
    assert.equal(event.neili_after, a.neili); assert.equal(event.target_eff_qi_after, end.eff_qi);
    assert.ok(Object.hasOwn(event, 'target_busy_after'));
    assert.equal(event.target_busy_after, end.busy);
    assert.equal(apply(a, 'attack'), apply(b, 'attack'));
    return { cost, triggered };
}

export function validateGumuZhiRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-zhi'); assert.equal(condition.method, 'perform');
    assert.equal(raw.method, condition.method); assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.outcome, p.expected);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'passives', 'actions', 'launches', 'interfaces', 'dropped', 'terminals', 'callbacks'])
        assert.ok(Array.isArray(raw[key]), key);
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.dropped.length, 0); assert.equal(raw.callbacks.length, 0);
    assert.deepEqual(raw.after, raw.immediate, '即时采集不混入后续心跳／回调');
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0);
    const [b, t] = raw.before, [a, end] = raw.immediate, accepted = p.expected === 'observed';
    assert.notEqual(b.object, t.object); assert.equal(raw.command_accepted, Number(accepted));
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], final = raw.immediate[side];
        for (const phase of ['before', 'immediate', 'after']) {
            identity(raw[phase][side]); assert.equal(raw[phase][side].object, state.object);
        }
        assert.deepEqual(state.skills, cfg.skills); assert.deepEqual(state.mappings, cfg.mappings);
        assert.deepEqual(state.preparations, cfg.preparations);
        assert.equal(state.weapon, cfg.equipment?.type ?? 'none'); assert.equal(idle(state), cfg.busy ?? 0);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(state.effective_skills[key],
            Math.trunc(value / 2) + (cfg.skills[cfg.mappings[key]] ?? 0) + apply(state, key), key);
        for (const [key, value] of Object.entries(cfg.properties)) {
            const expected = side === 1 && p.target_state === 'unconscious' && ['qi', 'jing'].includes(key) ? 0 : value;
            assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], expected, key);
        }
        for (const key of health) {
            const cost = count(raw.metrics[side], key + '_cost'), recovery = count(raw.metrics[side], key + '_recovery');
            assert.equal(final[key] - state[key], recovery - cost, key + '资源账不闭合');
            assert.equal(recovery, 0, '本组原调用没有恢复：' + key);
            if (side === 0 && key !== 'neili' || side === 1 && final.living && ['jing', 'eff_jing', 'neili'].includes(key))
                assert.equal(cost, 0);
        }
        for (const key of ['direct', 'quick', 'riposte', 'heartbeats']) assert.equal(count(raw.metrics[side], key), 0);
    }
    assert.equal(b.living, 1); assert.equal(a.living, 1); assert.equal(b.ghost, 0); assert.equal(a.ghost, 0);
    assert.equal(t.living, p.target_state === 'unconscious' ? 0 : 1); assert.equal(t.ghost, 0);
    assert.equal(b.fighting_opponent, Number(p.fighting));
    if (p.target_state === 'unconscious') {
        const prep = mapping(raw.preparation, '缺少原昏迷准备');
        assert.deepEqual(prep.terminals, [{ side: 1, state: 'unconscious' }]);
        for (const s of [prep.before, prep.after]) { identity(s); assert.equal(s.object, t.object); assert.equal(s.ghost, 0); }
        assert.equal(prep.before.living, 1); assert.equal(prep.after.living, 0);
        assert.equal(prep.before.qi, p.target.properties.qi); assert.equal(prep.before.jing, p.target.properties.jing);
        assert.deepEqual(prep.after, t);
    } else assert.equal(Object.hasOwn(raw, 'preparation'), false);
    assert.equal(apply(b, 'attack'), p.actor.temp?.['apply/attack'] ?? 0);
    assert.equal(apply(a, 'attack'), apply(b, 'attack'), '原攻击加成未恢复');
    const otherApply = s => Object.fromEntries(Object.entries(s.temp.apply).filter(([k]) => k !== 'attack'));
    assert.deepEqual(otherApply(a), otherApply(b)); assert.deepEqual(a.skills, b.skills);
    assert.deepEqual(a.mappings, b.mappings); assert.deepEqual(a.preparations, b.preparations);
    assert.equal(a.weapon, b.weapon); assert.equal(a.max_neili, b.max_neili);
    assert.equal(raw.launches.length, Number(accepted));
    assert.equal(count(raw.metrics[0], 'ability_launched'), Number(accepted));
    assert.equal(count(raw.metrics[1], 'ability_launched'), 0);
    validateLoads(raw, p);
    if (!accepted) {
        assert.ok(typeof raw.reason === 'string' && raw.reason.length > 0);
        for (const key of ['attacks', 'passives', 'actions', 'terminals']) assert.equal(raw[key].length, 0);
        for (const side of [0, 1]) {
            for (const key of health) assert.equal(count(raw.metrics[side], key + '_cost'), 0);
            for (const key of ['hit', 'dodge', 'parry']) assert.equal(count(raw.metrics[side], key), 0);
            assert.equal(idle(raw.immediate[side]), idle(raw.before[side]));
            assert.equal(raw.immediate[side].fighting_opponent, raw.before[side].fighting_opponent);
        }
        assert.deepEqual(end, t);
        return { accepted: false };
    }
    const launch = raw.launches[0];
    assert.equal(launch.actor, b.object); assert.equal(launch.skill, skill); assert.equal(launch.argument, 'zhi');
    for (const terminal of raw.terminals) {
        assert.equal(terminal.side, 1); assert.ok(['unconscious', 'death'].includes(terminal.state));
    }
    const passive = raw.passives.map(event => validatePassive(event, raw));
    const extraCost = passive.reduce((sum, event) => sum + event.cost, 0);
    if (p.low_neili_control) {
        assert.equal(b.neili, 140); assert.equal(extraCost, 0);
        for (const event of raw.passives) assert.equal(event.result, 0);
    }
    const totalCost = count(raw.metrics[0], 'neili_cost'), prepaid = totalCost - extraCost, planned = prepaid / 20;
    const base = t.gender === '女性' ? 4 : 5, ap = gumuZhiAttackPower(b, t);
    assert.ok(Number.isSafeInteger(planned) && planned >= base && planned <= 7, '原计划预扣不是实际出手数');
    assert.ok(idle(a) >= 1 && idle(a) <= planned, '原1+random(计划击数)忙乱');
    assert.ok(raw.attacks.length <= planned); assert.ok(raw.actions.length >= raw.attacks.length && raw.actions.length <= planned);
    assert.ok(raw.attacks.length > 0 || !end.living || !a.fighting_opponent, '没有实际攻击或失活观察');
    let branch = null;
    for (const hit of raw.attacks) {
        assert.equal(hit.actor, 0); assert.equal(hit.target, 1);
        assert.ok(Object.hasOwn(hit, 'type')); assert.equal(hit.type === null ? 0 : hit.type, 0);
        assert.ok([0, -1, -2].includes(hit.result)); assert.ok(Number.isSafeInteger(hit.damage) && hit.damage >= 0);
        const delta = integer(hit.apply_attack, '缺少实际攻击期 apply/attack') - apply(b, 'attack');
        const selected = delta === Math.trunc(ap / 8) ? 'success' : delta === Math.trunc(ap / 15) ? 'failure' : null;
        assert.ok(selected, '实际攻击期加成不符合原分支');
        if (branch !== null) assert.equal(selected, branch, '一次发动不能混用两分支加成');
        branch = selected;
    }
    for (const side of [0, 1]) for (const [key, result] of [['hit', 0], ['dodge', -1], ['parry', -2]])
        assert.equal(count(raw.metrics[side], key), raw.attacks.filter(x => x.actor === side && x.result === result).length);
    // Original martial hit_ob precedes the defender's innate dex roll, which can zero final damage.
    assert.ok(raw.passives.length >= raw.attacks.filter(x => x.result === 0 && x.damage > 0).length);
    assert.ok(raw.passives.length <= raw.attacks.filter(x => x.result === 0).length);
    const dp = integer(t.effective_skills.dodge, '缺少目标原有效闪避');
    const guaranteed = Math.trunc(ap / 2) > dp ? 'success'
        : Math.trunc(ap / 2) + Math.max(0, ap * 2 - 1) <= dp ? 'failure' : 'random';
    if (p.gate_expectation !== 'random') assert.equal(guaranteed, p.gate_expectation, '确定性初态不应依赖强制随机');
    if (branch !== null && guaranteed !== 'random') assert.equal(branch, guaranteed);
    if (branch === 'failure' || guaranteed === 'failure') assert.equal(planned, base);
    else assert.ok(planned <= Math.min(7, base + Math.max(0, Math.trunc(ap / 45) - 1)));
    let remaining = b.neili - prepaid;
    for (const event of raw.passives) {
        assert.equal(event.before[0].neili, remaining, '附伤前应已完成原计划预扣');
        if (branch !== null) assert.equal(apply(event.before[0], 'attack'), apply(b, 'attack')
            + Math.trunc(ap / (branch === 'success' ? 8 : 15)));
        remaining = event.after[0].neili;
    }
    assert.equal(a.neili, remaining, '不能把附伤额外扣费混入计划连击');
    return { accepted: true, ap, branch, planned, prepaid, passive_cost: extraCost, total_cost: totalCost,
        actual_attacks: raw.attacks.length, passive_calls: raw.passives.length,
        passive_triggers: passive.filter(x => x.triggered).length,
        numeric_damage_returns: raw.passives.filter(x => x.result === 1).length,
        partial: raw.attacks.length < planned, target_inactive: !end.living || !a.fighting_opponent,
        remaining_neili: a.neili, target_qi_cost: count(raw.metrics[1], 'qi_cost'),
        target_eff_qi_cost: count(raw.metrics[1], 'eff_qi_cost'),
        busy: idle(a), attack_residual: apply(a, 'attack') - apply(b, 'attack') };
}

export function gumuZhiEffects(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, 'gumu-zhi', '统计必须传入冻结条件，raw不携带参数');
    const observations = [], counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    for (const row of rows) {
        assert.ok(Object.hasOwn(counts, row.outcome)); counts[row.outcome]++;
        assert.equal(row.raw?.outcome, row.outcome);
        assert.equal(row.raw.condition_id, condition.id); assert.equal(row.raw.method, condition.method);
        if (row.outcome === 'error') continue;
        const observation = validateGumuZhiRecord(row.raw, condition);
        if (observation.accepted) observations.push(observation);
    }
    validateGumuZhiLoads(rows);
    const values = key => distribution(observations.map(x => x[key]));
    return { samples: rows.length, counts, low_neili_control: condition.parameters.low_neili_control,
        normal_effect_denominator: observations.length,
        branch: { success: observations.filter(x => x.branch === 'success').length,
            failure: observations.filter(x => x.branch === 'failure').length,
            unknown: observations.filter(x => x.branch === null).length },
        any_passive: probability(observations.filter(x => x.passive_triggers > 0).length, observations.length),
        partial_samples: observations.filter(x => x.partial).length,
        target_inactive_samples: observations.filter(x => x.target_inactive).length,
        ...Object.fromEntries(['ap', 'planned', 'actual_attacks', 'prepaid', 'passive_cost', 'total_cost',
            'passive_calls', 'passive_triggers', 'numeric_damage_returns', 'remaining_neili',
            'target_qi_cost', 'target_eff_qi_cost', 'busy', 'attack_residual'].map(k => [k, values(k)])) };
}
