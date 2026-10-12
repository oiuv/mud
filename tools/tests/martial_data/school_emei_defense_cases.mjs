// Isolated observations of the existing defense chain, not balance changes.
import assert from 'node:assert/strict';
import { emeiLearningProfiles } from './school_emei_learning_cases.mjs';
import { primaryDodgeChecks } from './school_quanzhen_auxiliary_cases.mjs';
import { distribution, probability } from './statistics.mjs';

export const emeiDefenseProfiles = emeiLearningProfiles.map(({ skill, usage }) => ({
    skill, usage, weapon: ['sword', 'blade'].includes(usage) ? usage : 'none',
}));

export function emeiDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0, 'samples must be positive');
    const result = [];
    function add(profile, usage, ability, level = 400, extra = {}) {
        const { skill } = profile, source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, `缺少峨嵋防御源码 ${skill}`);
        const weapon = extra.weapon ?? (usage === 'dodge' ? 'none' : profile.weapon);
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        result.push({ id: `school-emei-defense-${skill}-${usage}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : ['ordinary', 'direct', 'query_dodge_msg'].includes(ability) ? samples : 2,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-defense',
                skill, usage, ability, level, combination: extra.unmapped ? 'unmapped-control' : 'single-defense',
                observation: 'single_action_immediate', observation_role: 'defense',
                actor: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600 }, mappings: {},
                    properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 } },
                target: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600,
                    [profile.usage]: level, [usage]: level, [skill]: level },
                    mappings: extra.unmapped ? {} : { [usage]: skill },
                    properties: { str: 36, dex: 36, jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000,
                        gender: '女性', 'family/family_name': '峨嵋派' },
                    ...(weapon === 'none' ? {} : { equipment: { type: weapon, hold: false } }),
                    ...(extra.busy ? { busy: 2 } : {}) },
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: {
                    object: ability === 'direct' ? '/adm/daemons/combatd' : '/kungfu/skill/' + skill,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(['valid_damage', 'direct'].includes(ability) ? { damage: 1000 } : {}),
                    ...(ability === 'direct' ? { attack_type: 0 } : {}),
                    ...(ability === 'valid_enable' ? { usage: extra.queryUsage } : {}),
                } } : {}),
                fighting: ['ordinary', 'direct'].includes(ability), observe_seconds: 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'kungfu/class/emei/miejue.c', 'inherit/skill/skill.c',
                    'feature/clean_up.c', 'adm/daemons/combatd.c', 'feature/skill.c', 'feature/action.c',
                    'feature/damage.c', 'include/combat.h', 'kungfu/skill/unarmed.c',
                    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c'],
                qualification_note: '真实非巫师USER，左方固定基本拳脚600，右方只激发一项招架或轻功，无特殊进攻/内功映射；NPC来源仅证明本派配置。原接口、原公共攻击和实际文本分别观察，保留装备修正及反击，不强制随机。缺失接口不是零效果实现；direct是公共直伤、并非绝招，轻功配置不伪造为该路径的招架化解。条件概率排除先前闪避，未知不填零。',
            } });
    }
    for (const p of emeiDefenseProfiles) {
        const usage = p.usage === 'dodge' ? 'dodge' : 'parry';
        for (const queryUsage of ['parry', 'dodge', 'move'])
            add(p, usage, 'valid_enable', 400, { queryUsage, suffix: '-' + queryUsage });
        if (usage === 'dodge') continue;
        for (const level of [200, 400, 800]) for (const ability of ['ordinary', 'query_effect_parry', 'valid_damage'])
            add(p, usage, ability, level);
        for (const [suffix, extra] of [['unmapped', { unmapped: true }], ['busy', { busy: true }],
            ['neili0', { neili: 0 }], ['opposite-equipment', { weapon: p.weapon === 'none' ? 'sword' : 'none' }]])
            add(p, usage, 'ordinary', 400, { ...extra, suffix: '-' + suffix });
        add(p, usage, 'direct');
        add(p, usage, 'query_parry_msg');
    }
    const dodge = emeiDefenseProfiles.find(p => p.skill === 'zhutian-bu');
    for (const level of [200, 400, 800]) {
        for (const unmapped of [false, true]) add(dodge, 'dodge', 'ordinary', level,
            { unmapped, suffix: unmapped ? '-unmapped' : '' });
        for (const ability of ['query_effect_dodge', 'valid_damage']) add(dodge, 'dodge', ability, level);
    }
    for (const [suffix, extra] of [['busy', { busy: true }], ['neili0', { neili: 0 }], ['armed', { weapon: 'sword' }]])
        add(dodge, 'dodge', 'ordinary', 400, { ...extra, suffix: '-' + suffix });
    add(dodge, 'dodge', 'query_dodge_msg');
    add(dodge, 'dodge', 'direct');
    return result;
}

function metric(raw, side, name) {
    const values = raw.metrics?.[side];
    return values && typeof values === 'object' && !Array.isArray(values)
        ? Object.hasOwn(values, name) ? values[name] : 0 : null;
}

export function validateEmeiDefenseRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected); assert.equal(raw.launches.length, 0);
    assert.ok(Array.isArray(raw.defense_messages), '缺失实际战斗显示记录');
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, config.mappings);
        for (const [skill, level] of Object.entries(config.skills)) assert.equal(state.skills[skill], level);
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value);
        assert.equal(state.weapon, config.equipment?.type ?? 'none');
        if (config.equipment) assert.equal(state.weapon_details.program, '/tests/' + config.equipment.type);
        assert.equal(state.busy || 0, config.busy ?? 0);
        assert.equal(state.effective_skills.force, 300);
        assert.ok(Number.isFinite(metric(raw, side, 'neili_cost')), '缺失内力观测不是零支出');
    }
    assert.equal(raw.before[1].effective_skills[p.usage], Math.trunc(p.level / 2)
        + (p.target.mappings[p.usage] ? p.level : 0) + (raw.before[1].temp.apply?.[p.usage] ?? 0));
    const calls = raw.defenses.filter(d => d.actor === 0 && d.target === 1);
    for (const call of calls) {
        assert.equal(call.skill, p.skill); assert.ok(Object.hasOwn(call, 'result'));
        assert.ok(call.result === null || call.result === 0, '本组无独立化解实现');
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const base = primaryDodgeChecks(raw, 'base'), settled = primaryDodgeChecks(raw, 'settled');
        const primary = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        assert.equal(primary.length, 1); assert.equal(base.length, 1); assert.equal(settled.length, 1);
        assert.ok(Number.isSafeInteger(base[0].ap) && base[0].ap > 0 && Number.isSafeInteger(base[0].dp));
        assert.equal(settled[0].ap, base[0].ap);
        assert.equal(settled[0].dp, p.target.busy ? Math.trunc(Math.max(1, base[0].dp) / 3) : Math.max(1, base[0].dp));
        assert.equal(settled[0].skill || null, p.target.mappings.dodge ?? null);
        assert.ok([0, -1, -2].includes(primary[0].result));
        if (primary[0].result !== 0) assert.equal(calls.length, 0);
        assert.equal(metric(raw, 1, 'neili_cost'), 0);
        return;
    }
    assert.equal(raw.interfaces.length, 1); assert.equal(raw.attacks.length, 0);
    const i = raw.interfaces[0];
    assert.equal(i.function, p.interface.function); assert.equal(i.object, p.interface.object);
    assert.ok(Object.hasOwn(i, 'implemented_by') && Object.hasOwn(i, 'result'), '缺失接口与观测字段须区分');
    if (p.ability === 'direct') {
        assert.equal(i.implemented_by, '/adm/daemons/combatd');
        assert.equal(metric(raw, 0, 'direct'), 1);
        // Original do_damage consults parry, not the mapped dodge skill.
        assert.equal(calls.length, p.usage === 'parry' ? 1 : 0);
        assert.ok(metric(raw, 1, 'qi_cost') > 0); assert.equal(metric(raw, 1, 'neili_cost'), 0);
        return;
    }
    assert.deepEqual(raw.before, raw.immediate, '纯防御查询不改状态');
    assert.equal(calls.length, p.ability === 'valid_damage' ? 1 : 0);
    const implemented = p.ability === 'valid_enable' || p.ability === 'query_dodge_msg';
    assert.equal(i.implemented_by || null, implemented ? '/kungfu/skill/' + p.skill : null);
    if (p.ability === 'valid_enable') assert.equal(i.result || 0,
        Number((p.skill === 'zhutian-bu' ? ['dodge', 'move'] : ['parry']).includes(p.interface.usage)));
    else if (implemented) { assert.equal(typeof i.result, 'string'); assert.ok(i.result.includes('$n')); }
    else assert.ok(i.result === null || i.result === 0);
}

export function emeiDefenseEffects(rows) {
    const raw = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
    const attacks = raw.flatMap(r => r.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0));
    const n = outcome => attacks.filter(a => a.result === outcome).length;
    const interfaces = raw.flatMap(r => r.interfaces);
    return { samples: raw.length, primary_attacks: attacks.length, hit: n(0),
        dodge: probability(n(-1), attacks.length), parry: probability(n(-2), attacks.length),
        parry_given_not_dodged: probability(n(-2), n(0) + n(-2)),
        base_dp: distribution(raw.flatMap(r => primaryDodgeChecks(r, 'base').map(c => c.dp))),
        settled_dp: distribution(raw.flatMap(r => primaryDodgeChecks(r, 'settled').map(c => c.dp))),
        interfaces: interfaces.length,
        missing_interfaces: interfaces.filter(i => Object.hasOwn(i, 'implemented_by') && !i.implemented_by).length,
        unknown_interfaces: interfaces.filter(i => !Object.hasOwn(i, 'implemented_by')).length,
        implemented_by: [...new Set(interfaces.filter(i => Object.hasOwn(i, 'implemented_by')).map(i => i.implemented_by || null))],
        interface_numbers: distribution(interfaces.filter(i => i.implemented_by && typeof i.result === 'number').map(i => i.result)),
        interface_texts: [...new Set(interfaces.filter(i => typeof i.result === 'string').map(i => i.result))],
        defender_qi_cost: distribution(raw.map(r => metric(r, 1, 'qi_cost'))),
        defender_neili_cost: distribution(raw.map(r => metric(r, 1, 'neili_cost'))),
    };
}
