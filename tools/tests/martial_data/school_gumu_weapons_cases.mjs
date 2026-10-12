// Original ordinary attacks and isolated hit_ob observations; no gameplay changes.
import assert from 'node:assert/strict';
import { distribution, probability } from './statistics.mjs';

export const gumuWeapons = [
    { skill: 'yunv-jian', usage: 'sword', teacher: 'lin' },
    { skill: 'suxin-jian', usage: 'sword', teacher: 'longnv', dynamic: 250 },
    { skill: 'xuantie-jian', usage: 'sword', teacher: 'yang', force: 'surge-force' },
    { skill: 'yinsuo-jinling', usage: 'whip', teacher: 'longnv', dynamic: 300 },
    { skill: 'yunzhou-fufa', usage: 'whip', teacher: 'li', dodge: 'qixing-bu' },
    { skill: 'sanwu-shou', usage: 'whip', teacher: 'li', dodge: 'qixing-bu', dynamic: 300 },
];
export const gumuWeaponFixtureRequirements = [
    'Capture the action returned by the original query_action inside do_attack; never call it again for observation.',
    'Record original first-load player, raw/effective skills, source hash and run-local load_id for each context-dependent program; do not reload it between samples.',
    'Capture both sides immediately before/after each original force/martial hit_ob, preserving existing result and call order.',
    'Extend only the explicit original hit_ob interface allowlist; record no-trigger numeric returns as observations, not command refusals.',
    'Capture can_learn/yunv-xinjing/wall, character, living, effective attributes and sparse resource counters; do not force RNG or hits.',
];
const health = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const wall = 'can_learn/yunv-xinjing/wall';
const resources = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 36, int: 36, con: 36, dex: 36, shen: 0, gender: '女性', character: '光明磊落' };

export function gumuWeaponConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(skill, suffix, extra = {}) {
        const d = gumuWeapons.find(x => x.skill === skill); assert.ok(d, skill);
        const source = catalog.skills.find(x => x.id === skill); assert.ok(source, skill);
        const force = d.force ?? 'yunv-xinjing', dodge = d.dodge ?? 'yunv-shenfa';
        const level = extra.level ?? 200, method = extra.method ?? 'interface';
        const actor = { skills: { [d.usage]: level, [skill]: level, parry: level,
            force: level, [force]: level, dodge: level, [dodge]: level, ...extra.skills },
        mappings: { [d.usage]: skill, parry: skill, force, dodge }, preparations: {},
        properties: { ...resources, gender: force === 'surge-force' ? '男性' : '女性',
            character: d.teacher === 'li' ? '国士无双' : '光明磊落', [wall]: 0,
            'family/family_name': '古墓派', ...extra.properties },
        ...(extra.noWeapon ? {} : { equipment: { type: d.usage, hold: false } }) };
        if (extra.noMap) delete actor.mappings[d.usage];
        const target = { skills: { force: 600, dodge: 600, parry: 600, sword: 200, ...extra.targetSkills },
            mappings: {}, preparations: {}, properties: { ...resources, ...extra.targetProperties },
            equipment: { type: 'sword', hold: false } };
        const hitSkill = extra.hitSkill ?? skill;
        const hitSource = catalog.skills.find(x => x.id === hitSkill); assert.ok(hitSource, hitSkill);
        result.push({ id: `school-gumu-weapons-${skill}-${suffix}`, stage: 'school',
            entry_id: method === 'interface' ? hitSource.path : source.path, method,
            samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'gumu', collection_group: 'gumu-weapons', skill, usage: d.usage, level,
                ability: method === 'ordinary' ? 'ordinary' : 'hit_ob', combination: `${skill}+${force}+${dodge}`,
                actor, target, action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                fighting: method === 'ordinary', observation: 'single_action_immediate', observe_seconds: 0,
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + hitSkill,
                    function: 'hit_ob', damage: extra.damage ?? 200, factor: extra.factor ?? 0 } } : {}),
                capture_skill_loads: d.dynamic ? [{ skill, path: source.path, sha256: source.sha256 }] : [],
                expected: 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, hitSource.path, `kungfu/skill/${force}.c`,
                    `kungfu/skill/${dodge}.c`, `kungfu/class/gumu/${d.teacher}.c`, 'kungfu/class/gumu/gumu.h',
                    'feature/skill.c', 'feature/attack.c', 'feature/attribute.c', 'feature/equip.c', 'feature/damage.c',
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'inherit/char/char.c',
                    'include/combat.h', 'adm/daemons/combatd.c'])],
                qualification_note: '真实非巫师USER、统一普通装备及中性对手；技能、口诀和资源为实验初态，不等同原NPC配装、合法学习或培养成本。普攻走原do_attack，接口输入伤害不冒充最终掉血。原force/martial回调分别记账，玉女心经不套用公共加力固定扣费。素心剑读取首次加载者有效技能，银索/三无读取原始技能；保留当时原随机值，不按每个样本重新加载或重新选招。共享全真剑、学习、实战交锋另采。',
            } });
    }
    const ordinary = (d, level, jiali, suffix = '', extra = {}) => add(d.skill,
        `ordinary-l${level}-j${jiali}${suffix}`, { method: 'ordinary', level,
            ...extra, properties: { jiali, ...extra.properties } });
    for (const d of gumuWeapons) {
        for (const level of [200, 400, 800]) for (const jiali of [0, 50]) {
            ordinary(d, level, jiali);
            if (['suxin-jian', 'yinsuo-jinling'].includes(d.skill))
                ordinary(d, level, jiali, '-wall', { properties: { [wall]: 1 } });
            if (d.skill === 'sanwu-shou') ordinary(d, level, jiali, '-good-target', { targetProperties: { shen: 1 } });
        }
        if (d.dynamic) for (const level of [d.dynamic, d.dynamic + 1]) ordinary(d, level, 0, '-action-boundary');
    }
    for (const level of [99, 100, 101]) ordinary(gumuWeapons[1], level, 0, '-action-order');
    const heavy = (suffix, extra = {}) => add('xuantie-jian', 'hit-' + suffix, extra);
    for (const level of [159, 160, 200, 400, 800]) heavy('level' + level, { level, ...(level < 160 ? { checks: 2 } : {}) });
    for (const damage of [0, 119, 120, 121]) heavy('damage' + damage, { damage, ...(damage < 120 ? { checks: 2 } : {}) });
    for (const neili of [499, 500]) heavy('neili' + neili, { properties: { neili }, ...(neili < 500 ? { checks: 2 } : {}) });
    for (const parry of [99, 100, 299, 300]) heavy('parry' + parry, { targetSkills: { parry } });
    heavy('no-map', { noMap: true, checks: 2 });
    const whip = (suffix, extra = {}) => add('sanwu-shou', 'hit-' + suffix,
        { ...extra, targetProperties: { shen: 1, ...extra.targetProperties } });
    for (const level of [119, 120, 200, 400, 800]) whip('level' + level, { level, ...(level < 120 ? { checks: 2 } : {}) });
    for (const neili of [199, 200]) whip('neili' + neili, { properties: { neili }, ...(neili < 200 ? { checks: 2 } : {}) });
    for (const shen of [-1, 0, 1]) whip('shen' + shen, { targetProperties: { shen }, ...(shen <= 0 ? { checks: 2 } : {}) });
    for (const damage of [0, 1, 201]) whip('damage' + damage, { damage });
    const force = (suffix, extra = {}, skill = 'suxin-jian') => add(skill, 'force-' + suffix,
        { ...extra, hitSkill: 'yunv-xinjing', properties: { [wall]: 1, ...extra.properties } });
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) for (const level of [149, 150, 200, 400, 800])
        force('level' + level, { level, ...(level < 150 ? { checks: 2 } : {}) }, skill);
    for (const [suffix, extra] of [
        ['no-wall', { properties: { [wall]: 0 } }], ['no-weapon', { noWeapon: true }],
        ['no-map', { noMap: true }], ['high-con', { targetProperties: { con: 100000 } }],
        ['low-effective-force', { skills: { force: 2, 'yunv-xinjing': 150 } }],
        ['neili299', { properties: { neili: 299 } }],
    ]) force(suffix, { ...extra, checks: 2 });
    force('neili300', { properties: { neili: 300 } });
    for (const factor of [0, 100000]) force('factor' + factor, { factor });
    for (const damage of [0, 100000]) force('damage' + damage, { damage });
    force('con0', { targetProperties: { con: 0 } });
    return result;
}

const triggered = e => typeof e.result === 'string' && e.result.length > 0;
const count = (metrics, key) => {
    assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺少计数映射');
    const v = Object.hasOwn(metrics, key) ? metrics[key] : 0;
    assert.ok(Number.isSafeInteger(v) && v >= 0, '未知或无效计数：' + key); return v;
};
function validateHit(e) {
    assert.equal(e.actor, 0); assert.equal(e.target, 1);
    assert.equal(e.before?.length, 2); assert.equal(e.after?.length, 2);
    const [b, bt] = e.before, [a, t] = e.after;
    const applied = triggered(e), cost = b.neili - a.neili, wound = bt.eff_qi - t.eff_qi;
    const same = keys => { for (const k of keys) assert.equal(t[k], bt[k], k); };
    for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing']) assert.equal(a[k], b[k], k);
    same(['jing', 'eff_jing', 'neili']);
    if (['yunv-jian', 'suxin-jian', 'yinsuo-jinling', 'yunzhou-fufa',
        'meinv-quan', 'tianluo-diwang', 'chilian-shenzhang', 'fireice-strike'].includes(e.skill)) {
        assert.ok(['martial', 'interface'].includes(e.route));
        assert.ok(e.result === null || e.result === 0, '原缺失hit_ob返回明确null或0，不接受缺字段');
        assert.equal(cost, 0);
        same(['qi', 'eff_qi']);
    } else if (e.skill === 'xuantie-jian') {
        const level = b.skills[e.skill], parry = bt.skills.parry;
        const gate = e.incoming >= 120 && level >= 160 && b.neili >= 500 && b.mappings.sword === e.skill;
        const canHit = gate && Math.trunc(level / 2) + level - 1 > parry;
        if (applied) assert.ok(canHit, '玄铁附伤不满足原门槛');
        else {
            assert.ok(Number.isSafeInteger(e.result));
            if (!gate || Math.trunc(level / 2) > parry) assert.equal(e.result, Math.trunc(e.incoming / 4));
            else assert.ok([0, Math.trunc(e.incoming / 4)].includes(e.result));
        }
        assert.equal(cost, applied ? 120 : 0);
        assert.equal(wound, applied ? Math.trunc(e.incoming * 4 / 5) : 0);
        assert.equal(t.qi, Math.min(bt.qi, t.eff_qi));
    } else if (e.skill === 'sanwu-shou' || e.skill === 'wudu-shenzhang') {
        const gate = bt.living && b.neili >= 200 && b.skills[e.skill] >= 120;
        const targetEligible = e.skill === 'sanwu-shou' ? bt.shen > 0 : bt.gender !== '女性';
        if (applied) assert.ok(gate && targetEligible, '命中附伤不满足原门槛');
        else assert.equal(e.result, gate ? 1 : 0, '原返回1是数值附伤，不是布尔假');
        assert.equal(cost, applied ? 30 : 0); assert.equal(wound, applied ? e.incoming : 0);
        assert.equal(t.qi, Math.min(bt.qi, t.eff_qi));
    } else if (e.skill === 'sad-strike') {
        assert.ok(Number.isSafeInteger(bt.effective_str));
        const applies = e.incoming >= 150 && Math.trunc(e.incoming / 5) > bt.effective_str;
        assert.equal(applied, applies, '黯然附伤为严格膂力比较，不附加原代码没有的等级／内力门槛');
        if (!applied) assert.equal(e.result, 0);
        assert.equal(cost, 0); assert.equal(wound, applies ? Math.trunc((e.incoming - 100) / 2) : 0);
        assert.equal(t.qi, Math.min(bt.qi, t.eff_qi));
    } else if (e.skill === 'yunv-xinjing') {
        const level = b.skills[e.skill], usage = b.weapon;
        const linked = usage === 'sword' && b.mappings.sword === 'suxin-jian'
            || usage === 'whip' && b.mappings.whip === 'yinsuo-jinling';
        const randomRange = Math.trunc(b.effective_skills.force / 6);
        const gate = level >= 150 && b.neili >= 300 && linked && b.cultivation[wall]
            && Math.max(0, randomRange - 1) >= bt.effective_con;
        if (applied) {
            assert.ok(gate, '心经联动不满足原门槛');
            const base = Math.trunc(level / (usage === 'sword' ? 5 : 4)), damage = bt.qi - t.qi;
            assert.ok(damage >= base && damage < base * 2);
            assert.equal(wound, Math.trunc(damage * 2 / 3));
        } else { assert.equal(e.result, 0); same(['qi', 'eff_qi']); }
        assert.equal(cost, applied ? 50 : 0, '心经覆写原hit_ob，不按factor固定扣费');
    } else {
        assert.equal(e.skill, 'surge-force'); assert.equal(e.route, 'force');
        assert.ok(Number.isSafeInteger(e.result)); assert.equal(cost, e.factor);
        same(['qi', 'eff_qi']);
    }
}

function validateLoads(raw, p, descriptors) {
    assert.equal(raw.skill_loads?.length, p.capture_skill_loads.length);
    for (const expected of p.capture_skill_loads) {
        const load = raw.skill_loads.find(x => x.skill === expected.skill); assert.ok(load);
        assert.equal(load.path, expected.path); assert.equal(load.sha256, expected.sha256);
        assert.ok(typeof load.load_id === 'string' && load.load_id.length > 0);
        assert.ok(typeof load.run_id === 'string' && load.run_id.length > 0);
        assert.equal(load.state.userp, 1); assert.equal(load.state.wizardp, 0);
        for (const kind of ['skills', 'effective_skills']) for (const key of ['force', p.usage, 'dodge', 'parry'])
            assert.ok(Number.isSafeInteger(load.state[kind]?.[key]) && load.state[kind][key] >= 0);
    }
    for (const e of raw.actions) {
        assert.equal(e.actor, 0); assert.equal(e.target, 1); assert.equal(e.skill, p.skill);
        assert.ok(e.action && typeof e.action.action === 'string' && e.action.action.length > 0);
        // MA-118: suxin has 100 before 99; sad has 160 before 70. Preserve the prefix,
        // rather than "fixing" source order or rejecting a real faulty result.
        const d = descriptors.find(x => x.skill === p.skill); assert.ok(d);
        if (d.action_levels) {
            const last = d.action_levels.findLastIndex(n => p.actor.skills[p.skill] > n);
            assert.ok(last >= 0 && d.action_levels.slice(0, last + 1).includes(e.action.lvl), '原动作候选前缀不匹配');
        } else {
            const knownOrderError = p.skill === 'suxin-jian' && p.level === 100 && e.action.lvl === 100;
            assert.ok(Number.isSafeInteger(e.action.lvl) && (e.action.lvl < p.actor.skills[p.skill] || knownOrderError));
        }
        if (d.dynamic !== e.action.lvl) continue;
        const load = raw.skill_loads.find(x => x.skill === d.skill); assert.ok(load);
        const suxin = d.skill === 'suxin-jian', s = load.state[suxin ? 'effective_skills' : 'skills'];
        const base = { force: Math.trunc(s.force / 2), attack: Math.trunc(s[d.usage] / 4),
            dodge: Math.trunc(s.dodge / (suxin ? 4 : 6)), parry: Math.trunc(s.parry / (suxin ? 4 : 6)),
            damage: Math.trunc(s.force / (suxin ? 3 : 4)) };
        const span = { force: s.force, attack: Math.trunc(s[d.usage] / 2), dodge: Math.trunc(s.force / 3),
            parry: Math.trunc(s.parry / 3), damage: Math.trunc(s[d.usage] / (suxin ? 3 : 2)) };
        if (d.skill === 'sad-strike') {
            base.force = Math.trunc(s.force / 3); span.force = load.state.effective_skills.force;
            delete base.parry; delete span.parry;
            assert.ok(!Object.hasOwn(e.action, 'parry'), '黯然极意原表没有parry字段');
        }
        for (const key of Object.keys(base)) assert.ok(Number.isSafeInteger(e.action[key])
            && e.action[key] >= base[key] && e.action[key] <= base[key] + Math.max(0, span[key] - 1), key);
    }
}

export function validateGumuWeaponRecord(raw, c) {
    return validateGumuAttackRecord(raw, c, 'gumu-weapons', gumuWeapons);
}

// Shared observation accounting for the separately prepared weapon/unarmed groups.
export function validateGumuAttackRecord(raw, c, group, descriptors) {
    const p = c.parameters; assert.equal(p.collection_group, group);
    assert.equal(raw.method, c.method);
    assert.equal(raw.outcome, 'observed');
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['passives', 'interfaces', 'actions', 'attacks', 'launches', 'dropped']) assert.ok(Array.isArray(raw[key]), key);
    assert.equal(raw.launches.length, 0); assert.equal(raw.dropped.length, 0);
    const [b, bt] = raw.before, [a, t] = raw.immediate;
    for (const [state, cfg] of [[b, p.actor], [bt, p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.equal(state.living, 1); assert.equal(state.weapon, cfg.equipment?.type ?? 'none');
        assert.deepEqual(state.mappings, cfg.mappings); assert.deepEqual(state.preparations, cfg.preparations);
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? state.cultivation[key] : state[key], value, key);
        for (const [key, value] of Object.entries(cfg.skills)) {
            assert.equal(state.skills[key], value);
            assert.equal(state.effective_skills[key], Math.trunc(value / 2)
                + (cfg.skills[cfg.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), key);
        }
    }
    for (const side of [0, 1]) {
        assert.equal(count(raw.metrics[side], 'direct'), 0);
        for (const key of health) {
            assert.equal(count(raw.metrics[side], key + '_recovery'), 0);
            assert.equal(raw.before[side][key] - raw.immediate[side][key], count(raw.metrics[side], key + '_cost'));
            assert.equal(raw.after[side][key], raw.immediate[side][key]);
        }
        assert.deepEqual(raw.before[side].temp.apply, raw.immediate[side].temp.apply);
        assert.equal(raw.immediate[side].busy, raw.before[side].busy);
        assert.equal(raw.immediate[side].weapon, raw.before[side].weapon);
    }
    validateLoads(raw, p, descriptors);
    let remaining = b.neili, previousWound = bt.eff_qi;
    for (const e of raw.passives) {
        for (const side of [0, 1]) {
            assert.deepEqual(e.before?.[side]?.skills, raw.before[side].skills);
            assert.deepEqual(e.before?.[side]?.mappings, raw.before[side].mappings);
        }
        validateHit(e);
        assert.equal(e.before[0].neili, remaining); remaining = e.after[0].neili;
        assert.equal(e.before[1].eff_qi, previousWound); previousWound = e.after[1].eff_qi;
    }
    assert.equal(a.neili, remaining); assert.equal(t.neili, bt.neili);
    if (c.method === 'interface') {
        assert.equal(raw.attacks.length, 0); assert.equal(raw.actions.length, 0);
        assert.equal(raw.passives.length, 1); assert.equal(raw.interfaces.length, 1);
        const e = raw.passives[0]; assert.equal(e.route, 'interface');
        assert.equal(e.skill, p.interface.object.split('/').at(-1));
        assert.equal(e.incoming, p.interface.damage); assert.equal(e.factor, p.interface.factor);
        assert.deepEqual(e.before, raw.before); assert.deepEqual(e.after, raw.immediate);
        assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.equal(raw.interfaces[0].function, 'hit_ob'); assert.deepEqual(raw.interfaces[0].result, e.result);
    } else {
        assert.equal(c.method, 'ordinary'); assert.equal(raw.interfaces.length, 0);
        assert.equal(raw.attacks.length, 1); assert.equal(raw.actions.length, 1);
        const hit = raw.attacks[0]; assert.equal(hit.actor, 0); assert.equal(hit.target, 1); assert.equal(hit.type, 0);
        assert.ok([0, -1, -2].includes(hit.result));
        if (hit.result !== 0) assert.equal(raw.passives.length, 0, '闪避／招架不是命中附伤');
        const force = raw.passives.filter(e => e.route === 'force'), martial = raw.passives.filter(e => e.route === 'martial');
        assert.equal(force.length + martial.length, raw.passives.length);
        assert.ok(force.length <= 1 && martial.length <= 1);
        for (const e of force) {
            assert.equal(e.skill, b.mappings.force); assert.equal(e.factor, b.jiali);
            assert.ok(b.jiali > 0 && b.neili > b.jiali);
        }
        for (const e of martial) { assert.equal(e.skill, p.skill); assert.equal(e.factor, 0); }
        // Absent hit_ob still returns 0 through LPC call_other; keep it in the trace.
        if (!b.jiali) assert.equal(force.length, 0);
        if (force.length && martial.length) assert.equal(raw.passives[0].route, 'force');
        assert.ok(t.eff_qi <= previousWound);
    }
}

// Cross-record audit: observed dynamic actions must retain their original load values.
export function validateGumuWeaponLoads(rows) {
    return validateGumuAttackLoads(rows, gumuWeapons);
}

export function validateGumuAttackLoads(rows, descriptors) {
    const loads = new Map(), actions = new Map();
    for (const row of rows) {
        const raw = row.raw ?? row;
        for (const load of raw.skill_loads ?? []) {
            const key = `${load.run_id}:${load.skill}`;
            if (loads.has(key)) assert.deepEqual(load, loads.get(key), '首次加载证据被改写');
            else loads.set(key, load);
        }
        for (const event of raw.actions ?? []) {
            const d = descriptors.find(x => x.skill === event.skill);
            if (!d?.dynamic || event.action.lvl !== d.dynamic) continue;
            const load = raw.skill_loads.find(x => x.skill === d.skill); assert.ok(load);
            const key = `${d.skill}:${load.load_id}`;
            if (actions.has(key)) assert.deepEqual(event.action, actions.get(key), '全局动作值被当成每次重新求值');
            else actions.set(key, event.action);
        }
    }
    return { loads: loads.size, observed_dynamic_actions: actions.size };
}

export function gumuWeaponEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed' && r.raw).map(r => r.raw);
    const methods = {};
    for (const method of ['ordinary', 'interface']) {
        const records = raw.filter(r => r.method === method), measured = records.filter(r => Array.isArray(r.passives));
        const calls = measured.flatMap(r => r.passives), groups = {};
        for (const key of [...new Set(calls.map(e => e.route + ':' + e.skill))]) {
            const events = calls.filter(e => e.route + ':' + e.skill === key);
            groups[key] = { calls: events.length, triggered: probability(events.filter(triggered).length, events.length),
                numeric_returns: distribution(events.filter(e => Number.isFinite(e.result)).map(e => e.result)),
                incoming: distribution(events.map(e => e.incoming)),
                neili_cost: distribution(events.map(e => e.before?.[0] && e.after?.[0] ? e.before[0].neili - e.after[0].neili : null)) };
        }
        methods[method] = { samples: records.length, unknown_passive_samples: records.length - measured.length,
            groups, target_loss: Object.fromEntries(health.map(k => [k, distribution(records.map(r =>
                r.before?.[1] && r.immediate?.[1] ? r.before[1][k] - r.immediate[1][k] : null))])) };
    }
    return { samples: raw.length, unknown_or_unobserved: rows.length - raw.length, methods };
}
