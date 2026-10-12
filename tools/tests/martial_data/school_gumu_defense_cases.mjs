// Original defense interfaces and combat settlement; no game formulas are replaced.
import assert from 'node:assert/strict';
import { primaryDodgeChecks } from './school_quanzhen_auxiliary_cases.mjs';
import { emeiDefenseEffects } from './school_emei_defense_cases.mjs';
import { probability } from './statistics.mjs';

export const gumuDefenseProfiles = Object.entries({
    'yunv-jian': 'sword', 'suxin-jian': 'sword', 'quanzhen-jian': 'sword', 'xuantie-jian': 'sword',
    'yinsuo-jinling': 'whip', 'yunzhou-fufa': 'whip', 'sanwu-shou': 'whip',
    'meinv-quan': 'unarmed', 'tianluo-diwang': 'strike', 'fireice-strike': 'strike',
    'chilian-shenzhang': 'strike', 'wudu-shenzhang': 'strike', 'sad-strike': 'unarmed',
    'yunv-shenfa': 'dodge', 'qixing-bu': 'dodge',
}).map(([skill, usage]) => ({ skill, usage, weapon: ['sword', 'whip'].includes(usage) ? usage : 'none' }));
export const gumuDefenseFixtureRequirements = [
    'Use original public attack, damage and defense interfaces in independent frozen series.',
    'Pass the configured defender to Tianluo valid_enable and record player_side; do not query the attacker this_player by mistake.',
    'Record interface implementation, defense messages, original dodge checks and valid_damage calls; missing interfaces are not missing evidence.',
    'Retain original ripostes and damage settlement; record original unconscious preparation separately, without force mappings or extra skills.',
];
const tianluo = 'tianluo-diwang', tianluoObject = '/kungfu/skill/' + tianluo;
const emptyResult = value => value === 0 || value === null;
const actualWeapon = type => type === 'xsword' ? 'sword' : type;
const callsFor = (raw, skill) => raw.defenses.filter(d => d.actor === 0 && d.target === 1 && d.skill === skill);
const metric = (raw, side, key) => {
    const m = raw.metrics?.[side];
    if (!m || typeof m !== 'object' || Array.isArray(m)) return null;
    return Object.hasOwn(m, key) ? m[key] : 0;
};
export function tianluoParryCoefficient(level, weapon = 'none') {
    if (weapon !== 'none' || level < 60) return 0;
    return level < 160 ? 40 : level < 240 ? 60 : level < 320 ? 80 : 100;
}
export function tianluoDefenseChance(attacker, defender) {
    if (defender.skills[tianluo] < 100 || !defender.living || defender.weapon !== 'none') return 0;
    const ap = attacker.effective_skills.force + (attacker.skills.count ?? 0);
    assert.ok(Number.isSafeInteger(ap) && ap > 0, '只统计本组明确的正AP范围');
    const dp = Math.trunc(defender.skills.parry / 2) + defender.skills[tianluo];
    return Math.min(ap, Math.max(0, dp - Math.trunc(ap / 2))) / ap;
}
export const tianluoNegated = call => call.incoming > 0 && !!call.result
    && typeof call.result === 'object' && !Array.isArray(call.result) && call.result.damage === -call.incoming;

export function gumuDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const rows = [];
    function add(profile, ability, level = 400, extra = {}) {
        const { skill } = profile, source = catalog.skills.find(s => s.id === skill); assert.ok(source, skill);
        const usage = profile.usage === 'dodge' ? 'dodge' : 'parry', weapon = extra.weapon ?? profile.weapon;
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        const random = ['ordinary', 'direct', 'query_dodge_msg'].includes(ability)
            || skill === tianluo && ability === 'valid_damage' && level >= 100 && !extra.unconscious;
        rows.push({ id: `school-gumu-defense-${skill}-${usage}-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method, samples: smoke ? 2 : random ? samples : 2,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-defense',
                skill, usage, ability, level, combination: extra.unmapped ? 'unmapped-control' : 'single-defense',
                observation: 'single_action_immediate', observation_role: 'defense',
                actor: { skills: { unarmed: 600, sword: 600, force: extra.force ?? 600, parry: 600, dodge: 600,
                    count: extra.count ?? 0, mathematics: extra.mathematics ?? 0 }, mappings: {},
                    properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.attackerArmed ? { equipment: { type: 'sword', hold: false } } : {}) },
                target: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600,
                    [profile.usage]: level, [usage]: level, [skill]: level },
                    mappings: extra.unmapped || profile.usage === 'throwing' || skill === tianluo && level <= 30
                        ? {} : { [usage]: skill },
                    properties: { str: 36, dex: 36, jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000,
                        gender: skill === 'sad-strike' ? '男性' : '女性', 'family/family_name': '古墓派' },
                    ...(weapon === 'none' ? {} : { equipment: { type: weapon, hold: false } }),
                    ...(extra.busy ? { busy: 2 } : {}) },
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: {
                    object: ability === 'direct' ? '/adm/daemons/combatd' : '/kungfu/skill/' + skill,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(['valid_damage', 'direct'].includes(ability) ? { damage: 1000 } : {}),
                    ...(ability === 'direct' ? { attack_type: extra.attackerArmed ? 1 : 0 } : {}),
                    ...(ability === 'valid_enable' ? { usage: extra.queryUsage,
                        ...(skill === tianluo ? { player_side: 1 } : {}) } : {}),
                } } : {}),
                ...(extra.unconscious ? { target_state: 'unconscious' } : {}),
                fighting: ['ordinary', 'direct'].includes(ability), observe_seconds: 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'kungfu/class/gumu/lin.c', 'kungfu/class/gumu/longnv.c',
                    'kungfu/class/gumu/yang.c', 'kungfu/class/gumu/li.c', 'kungfu/class/gumu/gumu.h',
                    'inherit/skill/skill.c', 'feature/clean_up.c', 'adm/daemons/combatd.c', 'feature/skill.c',
                    'feature/action.c', 'feature/damage.c', 'feature/attack.c', 'include/combat.h',
                    'kungfu/skill/unarmed.c', 'kungfu/skill/sword.c', 'kungfu/skill/whip.c',
                    'kungfu/skill/dodge.c', 'kungfu/skill/parry.c'],
                qualification_note: '真实非巫师USER；左方基本进攻，右方只映射招架或轻功，不映射特殊进攻／内功，隔离防御。'
                    + '等级为实验赋值，不证明能向教师学到或同养成成本。两门针法仅查防御声明，不强行激发招架。'
                    + '天罗按原始等级和主手判定，以攻击者有效内功加count对防守者基本招架一半加天罗；mathematics不是count。'
                    + 'valid_enable显式查右方，接口不冒充战斗触发，系数不是概率；普攻保留闪避／招架／反击，公共直伤只查招架。'
                    + '忙乱、零内力、持器、无映射和原昏迷分别记录，缺接口与缺观测分开，不修改原规则。',
            } });
    }
    for (const p of gumuDefenseProfiles) {
        for (const queryUsage of ['parry', 'dodge', 'move']) add(p, 'valid_enable', 400, { queryUsage, suffix: queryUsage });
        if (p.usage === 'dodge') {
            for (const level of [200, 400, 800]) {
                for (const unmapped of [false, true]) add(p, 'ordinary', level, { unmapped, suffix: unmapped ? 'unmapped' : '' });
                for (const ability of ['query_effect_dodge', 'valid_damage']) add(p, ability, level);
            }
            for (const [suffix, extra] of [['busy', { busy: true }], ['neili0', { neili: 0 }], ['armed', { weapon: 'sword' }]])
                add(p, 'ordinary', 400, { ...extra, suffix });
            add(p, 'query_dodge_msg'); add(p, 'direct');
        } else {
            for (const level of [200, 400, 800]) for (const ability of ['ordinary', 'query_effect_parry', 'valid_damage']) add(p, ability, level);
            for (const [suffix, extra] of [['unmapped', { unmapped: true }], ['busy', { busy: true }], ['neili0', { neili: 0 }],
                ['opposite-equipment', { weapon: p.weapon === 'none' ? 'sword' : 'none' }]]) add(p, 'ordinary', 400, { ...extra, suffix });
            add(p, 'direct'); add(p, 'query_parry_msg');
        }
    }
    for (const skill of ['bingpo-shenzhen', 'yufeng-zhen']) for (const queryUsage of ['parry', 'dodge', 'move'])
        add({ skill, usage: 'throwing', weapon: 'none' }, 'valid_enable', 400, { queryUsage, suffix: queryUsage });
    const p = gumuDefenseProfiles.find(p => p.skill === tianluo);
    for (const level of [30, 31]) for (const queryUsage of ['parry', 'strike'])
        add(p, 'valid_enable', level, { queryUsage, suffix: 'boundary-' + queryUsage });
    for (const level of [0, 59, 60, 159, 160, 239, 240, 319, 320]) add(p, 'query_effect_parry', level, { suffix: 'boundary' });
    add(p, 'query_effect_parry', 400, { weapon: 'sword', suffix: 'armed' });
    for (const level of [99, 100, 200, 400, 800]) for (const count of [0, 79, 80, 300, 1200])
        add(p, 'valid_damage', level, { count, suffix: 'count' + count });
    for (const level of [200, 400, 800]) for (const count of [80, 300, 1200]) for (const ability of ['ordinary', 'direct'])
        add(p, ability, level, { count, suffix: 'count' + count });
    for (const [suffix, extra] of [['busy', { busy: true }], ['neili0', { neili: 0 }],
        ['attacker-armed', { attackerArmed: true }], ['mathematics1200', { mathematics: 1200 }],
        ['defender-armed', { weapon: 'sword' }], ['unmapped', { unmapped: true }],
        ['force200', { force: 200 }], ['force2400', { force: 2400 }]])
        for (const ability of ['ordinary', 'valid_damage', 'direct']) add(p, ability, 200, { ...extra, suffix });
    add(p, 'valid_damage', 400, { unconscious: true, suffix: 'unconscious' });
    return rows;
}

export function validateGumuDefenseRecord(raw, condition) {
    const p = condition.parameters, profile = gumuDefenseProfiles.find(x => x.skill === p.skill);
    assert.equal(p.collection_group, 'gumu-defense'); assert.equal(raw.outcome, 'observed');
    assert.equal(raw.method, condition.method);
    for (const k of ['before', 'immediate', 'metrics']) assert.equal(raw[k]?.length, 2, k);
    for (const k of ['launches', 'interfaces', 'defenses', 'defense_messages', 'dodge_checks', 'attacks']) assert.ok(Array.isArray(raw[k]), k);
    assert.equal(raw.launches.length, 0);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0);
        assert.equal(b.living, side === 1 && p.target_state === 'unconscious' ? 0 : 1);
        assert.deepEqual(b.mappings, cfg.mappings);
        for (const [k, n] of Object.entries(cfg.skills)) assert.equal(b.skills[k], n);
        for (const [k, n] of Object.entries(cfg.properties)) assert.equal(k.includes('/') ? b.cultivation[k] : b[k], n);
        assert.equal(b.weapon, actualWeapon(cfg.equipment?.type ?? 'none'));
        if (cfg.equipment) assert.equal(b.weapon_details.program, '/tests/' + cfg.equipment.type);
        assert.equal(b.busy || 0, cfg.busy ?? 0); assert.equal(b.effective_skills.force, Math.trunc(cfg.skills.force / 2));
        for (const k of ['neili_cost', 'neili_recovery', 'heartbeats']) assert.equal(metric(raw, side, k), 0);
        for (const k of ['qi_cost', 'eff_qi_cost']) assert.ok(Number.isSafeInteger(metric(raw, side, k)) && metric(raw, side, k) >= 0);
        assert.equal(raw.immediate[side].neili, b.neili);
    }
    const [attacker, defender] = raw.before;
    assert.equal(defender.effective_skills[p.usage], Math.trunc(p.level / 2)
        + (p.target.mappings[p.usage] ? p.level : 0) + (defender.temp.apply?.[p.usage] ?? 0));
    const calls = callsFor(raw, p.skill);
    for (const call of calls) {
        assert.ok(Object.hasOwn(call, 'result')); assert.ok(Number.isSafeInteger(call.incoming) && call.incoming > 0);
        assert.equal(call.route, p.ability === 'valid_damage' ? 'interface'
            : p.ability === 'ordinary' && p.usage === 'dodge' ? 'ordinary-dodge' : p.ability);
        assert.ok(emptyResult(call.result) || p.skill === tianluo && tianluoNegated(call));
        if (tianluoNegated(call)) assert.equal(typeof call.result.msg, 'string');
        if (p.skill === tianluo && p.ability !== 'ordinary') {
            const chance = tianluoDefenseChance(attacker, defender);
            if (chance === 0 || chance === 1) assert.equal(tianluoNegated(call), chance === 1);
        }
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0); assert.equal(metric(raw, 0, 'direct'), 0);
        const primary = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        const base = primaryDodgeChecks(raw, 'base'), settled = primaryDodgeChecks(raw, 'settled');
        assert.equal(primary.length, 1); assert.equal(base.length, 1); assert.equal(settled.length, 1);
        assert.ok([0, -1, -2].includes(primary[0].result));
        assert.ok(Number.isSafeInteger(base[0].ap) && base[0].ap > 0 && Number.isSafeInteger(base[0].dp));
        assert.equal(settled[0].ap, base[0].ap);
        assert.equal(settled[0].dp, p.target.busy ? Math.trunc(Math.max(1, base[0].dp) / 3) : Math.max(1, base[0].dp));
        assert.equal(settled[0].skill || null, p.target.mappings.dodge ?? null);
        // This batch has positive base damage, no special force and no earlier damage negation.
        // Both mapped dodge and mapped parry therefore reach their original hook on every hit.
        assert.equal(calls.length, Number(primary[0].result === 0 && !!p.target.mappings[p.usage]));
        // Original ripostes may follow; a nominal hit can still be fully negated.
        for (const a of raw.attacks) assert.ok(a.actor === 0 && a.target === 1 || a.actor === 1 && a.target === 0);
        return;
    }
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 1);
    const i = raw.interfaces[0]; assert.equal(i.object, p.interface.object); assert.equal(i.function, p.interface.function);
    assert.ok(Object.hasOwn(i, 'implemented_by') && Object.hasOwn(i, 'result'));
    if (p.ability === 'direct') {
        assert.equal(i.implemented_by, '/adm/daemons/combatd'); assert.equal(metric(raw, 0, 'direct'), 1);
        assert.equal(calls.length, p.target.mappings.parry ? 1 : 0);
        const negated = calls.some(tianluoNegated);
        if (calls.length) assert.equal(calls[0].incoming, 1000 + (attacker.temp.apply?.[p.interface.attack_type ? 'damage' : 'unarmed_damage'] ?? 0));
        assert.equal(metric(raw, 1, 'qi_cost') === 0, negated);
        if (negated) assert.equal(metric(raw, 1, 'eff_qi_cost'), 0);
        return;
    }
    assert.deepEqual(raw.immediate, raw.before); assert.equal(metric(raw, 0, 'direct'), 0);
    for (const side of [0, 1]) for (const key of ['qi_cost', 'eff_qi_cost']) assert.equal(metric(raw, side, key), 0);
    assert.equal(calls.length, p.ability === 'valid_damage' ? 1 : 0);
    const implemented = p.ability === 'valid_enable' || p.ability === 'query_dodge_msg'
        || p.skill === tianluo && ['valid_damage', 'query_effect_parry'].includes(p.ability);
    assert.equal(i.implemented_by || null, implemented ? '/kungfu/skill/' + p.skill : null);
    if (p.ability === 'valid_enable') {
        if (p.skill === tianluo) { assert.equal(i.player_side, 1); assert.equal(p.interface.player_side, 1); }
        const allowed = !profile ? [] : profile.usage === 'dodge' ? ['dodge', 'move']
            : p.skill === tianluo && p.level <= 30 ? ['strike'] : ['parry', profile.usage];
        assert.equal(i.result || 0, Number(allowed.includes(p.interface.usage)));
    } else if (p.ability === 'query_dodge_msg') {
        assert.equal(typeof i.result, 'string'); assert.ok(i.result.includes('$n'));
    } else if (p.skill === tianluo && p.ability === 'query_effect_parry')
        assert.equal(i.result, tianluoParryCoefficient(p.level, defender.weapon));
    else if (p.ability === 'valid_damage') {
        assert.equal(calls[0].incoming, 1000); assert.deepEqual(i.result, calls[0].result);
    } else assert.ok(emptyResult(i.result));
}

export function gumuDefenseEffects(rows) {
    const usable = rows.filter(r => r.outcome === 'observed' && r.raw
        && ['attacks', 'interfaces', 'defenses', 'dodge_checks'].every(k => Array.isArray(r.raw[k])));
    const calls = usable.flatMap(r => callsFor(r.raw, tianluo));
    const known = calls.filter(d => Object.hasOwn(d, 'result'));
    return { ...emeiDefenseEffects(usable), unknown_samples: rows.length - usable.length,
        tianluo_calls: calls.length, tianluo_unknown: calls.length - known.length,
        tianluo_by_route: Object.fromEntries(['interface', 'ordinary', 'direct'].map(route => {
            const selected = known.filter(d => d.route === route);
            return [route, probability(selected.filter(tianluoNegated).length, selected.length)];
        })) };
}
