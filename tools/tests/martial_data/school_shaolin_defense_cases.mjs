// Single-skill defense observations; no game formulas or random branches replaced.
import assert from 'node:assert/strict';
import { shaolinLearningProfiles } from './school_shaolin_learning_cases.mjs';
import { shaolinUnarmedLearningProfiles } from './school_shaolin_unarmed_learning_cases.mjs';
import { primaryDodgeChecks } from './school_quanzhen_auxiliary_cases.mjs';
import { distribution, probability } from './statistics.mjs';

export const shaolinDefenseProfiles = [
    ...shaolinLearningProfiles.map(([skill, usage, , , , , , , , teacher]) => ({ skill, usage, teacher, weapon: usage })),
    ...shaolinUnarmedLearningProfiles.map(({ skill, usage, teacher }) => ({ skill, usage, teacher, weapon: 'none' })),
    { skill: 'yingzhua-gong', usage: 'claw', teacher: 'cheng-shi', weapon: 'none' },
];
export function shaolinDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(profile, usage, ability, level = 400, extra = {}) {
        const { skill, teacher, weapon } = profile;
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少少林防御源码：' + skill);
        const type = extra.type ?? (usage === 'dodge' ? 'none' : weapon);
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        result.push({ id: `school-shaolin-defense-${skill}-${usage}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : ['ordinary', 'direct', 'query_dodge_msg'].includes(ability) ? samples : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-defense',
                skill, usage, ability, level, combination: extra.unmapped ? 'unmapped-control' : 'single-defense',
                observation: 'single_action_immediate', observation_role: 'defense',
                actor: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600 }, mappings: {},
                    properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 } },
                target: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600,
                    [profile.usage]: level, [usage]: level, [skill]: level },
                    mappings: extra.unmapped ? {} : { [usage]: skill },
                    properties: { str: 36, dex: 36, jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000 },
                    ...(type === 'none' ? {} : { equipment: { type, hold: false } }),
                    ...(extra.busy ? { busy: 2 } : {}) },
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: { object: ability === 'direct'
                    ? '/adm/daemons/combatd' : '/kungfu/skill/' + skill,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(['valid_damage', 'direct'].includes(ability) ? { damage: 1000 } : {}),
                    ...(ability === 'direct' ? { attack_type: 0 } : {}),
                    ...(ability === 'valid_enable' ? { usage: extra.queryUsage } : {}),
                } } : {}),
                fighting: ['ordinary', 'direct'].includes(ability), observe_seconds: 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, `kungfu/class/shaolin/${teacher}.c`,
                    'inherit/skill/shaolin.c', 'inherit/skill/skill.c', 'adm/daemons/combatd.c',
                    'feature/skill.c', 'feature/action.c', 'feature/damage.c', 'include/combat.h',
                    'kungfu/skill/unarmed.c', 'kungfu/skill/dodge.c', 'kungfu/skill/parry.c'],
                qualification_note: '真实非巫师USER，左方固定中性基本拳脚600；右方只激发一项招架或轻功，未激发特殊内功或进攻武学，保留原反击。等级为实验赋值，不代表从师可学或完整门派配装。接口不存在与返回零分开记录；direct为原公共直伤结算，不是绝招。普通招架率分母为未闪避的主攻击，不能与无条件概率混淆；文本不证明控制。',
            } });
    }
    for (const p of shaolinDefenseProfiles) {
        const usage = p.skill === 'shaolin-shenfa' ? 'dodge' : 'parry';
        for (const queryUsage of ['parry', 'dodge', 'move'])
            add(p, usage, 'valid_enable', 400, { queryUsage, suffix: '-' + queryUsage });
        if (usage !== 'parry') continue;
        for (const level of [200, 400, 800]) {
            add(p, usage, 'ordinary', level);
            for (const ability of ['query_effect_parry', 'valid_damage']) add(p, usage, ability, level);
        }
        for (const [suffix, extra] of [['unmapped', { unmapped: true }], ['busy', { busy: true }],
            ['neili0', { neili: 0 }], ['opposite-equipment', { type: p.weapon === 'none' ? 'sword' : 'none' }]])
            add(p, usage, 'ordinary', 400, { ...extra, suffix: '-' + suffix });
        add(p, usage, 'direct');
        add(p, usage, 'query_parry_msg');
    }
    for (const p of shaolinDefenseProfiles.filter(p => ['shaolin-shenfa', 'shaolin-tantui'].includes(p.skill))) {
        for (const level of [200, 400, 800]) {
            for (const unmapped of [false, true]) add(p, 'dodge', 'ordinary', level,
                { unmapped, suffix: unmapped ? '-unmapped' : '' });
            add(p, 'dodge', 'query_effect_dodge', level);
        }
        for (const [suffix, extra] of [['busy', { busy: true }], ['neili0', { neili: 0 }], ['armed', { type: 'sword' }]])
            add(p, 'dodge', 'ordinary', 400, { ...extra, suffix: '-' + suffix });
        add(p, 'dodge', 'query_dodge_msg');
    }
    return result;
}

export function validateShaolinDefenseRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected);
    assert.equal(raw.launches.length, 0);
    assert.ok(Array.isArray(raw.defense_messages), '须保留实际战斗显示');
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        assert.deepEqual(raw.before[side].mappings, config.mappings);
        for (const [skill, level] of Object.entries(config.skills)) assert.equal(raw.before[side].skills[skill], level);
        for (const [key, value] of Object.entries(config.properties)) assert.equal(raw.before[side][key], value);
        assert.equal(raw.before[side].weapon, config.equipment?.type ?? 'none');
        if (config.equipment) assert.equal(raw.before[side].weapon_details.program, '/tests/' + config.equipment.type);
        assert.equal(raw.before[side].busy || 0, config.busy ?? 0);
        assert.equal(raw.before[side].effective_skills.force, 300);
    }
    assert.equal(raw.before[1].effective_skills[p.usage], Math.trunc(p.level / 2)
        + (p.target.mappings[p.usage] ? p.level : 0) + (raw.before[1].temp.apply?.[p.usage] ?? 0));
    const calls = raw.defenses.filter(d => d.actor === 0 && d.target === 1);
    for (const call of calls) {
        assert.equal(call.skill, p.skill); assert.ok(!call.result, '本组无独立化解返回');
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const base = primaryDodgeChecks(raw, 'base'), settled = primaryDodgeChecks(raw, 'settled');
        const primary = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        assert.equal(primary.length, 1); assert.equal(base.length, 1); assert.equal(settled.length, 1);
        assert.equal(settled[0].ap, base[0].ap);
        assert.equal(settled[0].dp, p.target.busy ? Math.trunc(Math.max(1, base[0].dp) / 3) : Math.max(1, base[0].dp));
        assert.equal(settled[0].skill || null, p.target.mappings.dodge ?? null);
        assert.ok([0, -1, -2].includes(primary[0].result));
        if (primary[0].result !== 0) assert.equal(calls.length, 0);
        assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
        return;
    }
    assert.equal(raw.interfaces.length, 1); assert.equal(raw.attacks.length, 0);
    const i = raw.interfaces[0];
    assert.equal(i.function, p.interface.function); assert.equal(i.object, p.interface.object);
    assert.ok('implemented_by' in i, '缺失接口不能当作已实现且返回零');
    if (p.ability === 'direct') {
        assert.equal(i.implemented_by, '/adm/daemons/combatd');
        assert.equal(raw.metrics[0].direct, 1); assert.equal(calls.length, 1);
        assert.ok(raw.metrics[1].qi_cost > 0); assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
        return;
    }
    assert.deepEqual(raw.before, raw.immediate, '防御查询本身不改变状态');
    assert.equal(calls.length, p.ability === 'valid_damage' ? 1 : 0);
    const implemented = p.ability === 'valid_enable' || p.ability === 'query_dodge_msg' && p.skill === 'shaolin-shenfa';
    assert.equal(i.implemented_by || null, implemented ? '/kungfu/skill/' + p.skill : null);
    if (p.ability === 'valid_enable') {
        const allowed = p.skill === 'shaolin-shenfa' ? ['dodge', 'move']
            : p.skill === 'shaolin-tantui' ? ['parry', 'dodge'] : ['parry'];
        assert.equal(i.result || 0, Number(allowed.includes(p.interface.usage)));
    } else if (implemented) {
        assert.equal(typeof i.result, 'string'); assert.ok(i.result.includes('$n'));
    } else assert.ok(!i.result);
}

export function shaolinDefenseEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const attacks = raw.flatMap(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0));
    const n = outcome => attacks.filter(a => a.result === outcome).length;
    const interfaces = raw.flatMap(r => r.interfaces);
    return { samples: raw.length, primary_attacks: attacks.length,
        hit: n(0), dodge: probability(n(-1), attacks.length), parry: probability(n(-2), attacks.length),
        parry_given_not_dodged: probability(n(-2), n(0) + n(-2)),
        base_dp: distribution(raw.flatMap(r => primaryDodgeChecks(r, 'base').map(c => c.dp))),
        settled_dp: distribution(raw.flatMap(r => primaryDodgeChecks(r, 'settled').map(c => c.dp))),
        interfaces: interfaces.length, missing_interfaces: interfaces.filter(i => !i.implemented_by).length,
        implemented_by: [...new Set(interfaces.map(i => i.implemented_by || null))],
        // Do not mix absent hooks with implemented hooks returning numeric zero.
        interface_numbers: distribution(interfaces.filter(i => i.implemented_by && typeof i.result === 'number').map(i => i.result)),
        interface_texts: [...new Set(interfaces.filter(i => typeof i.result === 'string').map(i => i.result))],
        defender_qi_cost: distribution(raw.map(r => r.metrics[1].qi_cost ?? 0)),
        defender_neili_cost: distribution(raw.map(r => r.metrics[1].neili_cost ?? 0)),
    };
}
