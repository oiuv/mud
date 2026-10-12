// Original Taiji defensive interfaces, with settlement observed separately.
import assert from 'node:assert/strict';
import { negated } from './school_huashan_defense_cases.mjs';

export const wudangDefenses = raw => raw.defenses.filter(d => d.actor === 0 && d.target === 1
    && ['taiji-quan', 'taiji-jian'].includes(d.skill));
const actualWeapon = type => type === 'xsword' ? 'sword' : type;
export function taijiParryCoefficient(skill, level, weapon) {
    if (skill === 'taiji-quan' ? weapon !== 'none' : weapon !== 'sword') return 0;
    return level < 80 ? 0 : level < 200 ? 50 : level < 280 ? 80 : level < 350 ? 100 : 120;
}

export function wudangDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少太极防御源码：' + skill);
        const type = extra.type ?? (skill === 'taiji-quan' ? 'none' : 'sword');
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        result.push({ id: `school-wudang-defense-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : extra.checks ?? (ability === 'query_effect_parry' ? 2 : samples),
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-defense',
                combination: 'neutral-attacker', skill, usage: 'parry', ability, level,
                observation: 'single_action_immediate', observation_role: 'defense',
                actor: { skills: { unarmed: 600, sword: 600, parry: 600, dodge: 600,
                    force: extra.force ?? 600, count: extra.count ?? 0,
                    ...(extra.mappedForce ? { 'xuanmen-neigong': 600 } : {}) },
                    mappings: extra.mappedForce ? { force: 'xuanmen-neigong' } : {},
                    properties: { jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.unarmed ? {} : { equipment: { type: 'sword', hold: false } }) },
                target: { skills: { sword: level, unarmed: level, parry: level, [skill]: level,
                    dodge: 600, force: 600 },
                    mappings: { [skill === 'taiji-quan' ? 'unarmed' : 'sword']: skill, parry: skill },
                    properties: { jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000 },
                    ...(type === 'none' ? {} : { equipment: { type, hold: false } }),
                    ...(extra.busy ? { busy: 2 } : {}) },
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: {
                    object: ability === 'direct' ? '/adm/daemons/combatd' : `/kungfu/skill/${skill}`,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(ability === 'query_effect_parry' ? {} : { damage: 1000 }),
                    ...(ability === 'direct' ? { attack_type: extra.unarmed ? 0 : 1 } : {}),
                } } : {}),
                fighting: ['ordinary', 'direct'].includes(ability), observe_seconds: 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'kungfu/class/wudang/zhang.c',
                    'adm/daemons/combatd.c', 'feature/skill.c', 'feature/action.c', 'feature/damage.c',
                    'include/combat.h', 'kungfu/skill/sword.c', 'kungfu/skill/unarmed.c',
                    'kungfu/skill/xuanmen-neigong.c', 'inherit/weapon/xsword.c', 'inherit/weapon/pin.c'],
                qualification_note: '左方固定中性进攻者，右方受测太极招架；真实非巫师USER，资格为实验赋值，不复制完整NPC。太极按攻击者有效内功加count判定，不沿用独孤的有效招架或忙乱限制。系数查询不是概率；valid_damage仅保存返回，direct经原UNARMED/WEAPON_ATTACK结算，ordinary保留反击。99/100级以攻击者基本内功200构造确定性资格边界；不证明同养成成本或完整门派胜率。',
            } });
    }
    for (const skill of ['taiji-quan', 'taiji-jian']) {
        for (const ability of ['valid_damage', 'direct', 'ordinary']) for (const level of [200, 400, 800])
            for (const [suffix, extra] of [['-basic-force-count0', {}], ['-basic-force-count300', { count: 300 }],
                ['-mapped-force-count0', { mappedForce: true }]]) add(skill, ability, level, { ...extra, suffix });
        for (const level of [99, 100]) add(skill, 'valid_damage', level, { force: 200, checks: 2, suffix: '-force200' });
        for (const [suffix, extra] of [['-busy', { busy: true }], ['-neili0', { neili: 0 }],
            ['-attacker-unarmed', { unarmed: true }]]) for (const ability of ['valid_damage', 'direct'])
            add(skill, ability, 200, { ...extra, suffix });
        const types = skill === 'taiji-quan' ? ['sword', 'blade', 'pin', 'xsword'] : ['none', 'blade', 'pin', 'xsword'];
        for (const type of types) for (const ability of ['valid_damage', 'direct']) add(skill, ability, 200,
            { type, suffix: '-' + type, ...(skill === 'taiji-jian' && type === 'xsword' ? {} : { checks: 2 }) });
        for (const level of [79, 80, 199, 200, 279, 280, 349, 350, 800]) add(skill, 'query_effect_parry', level);
        for (const type of types) add(skill, 'query_effect_parry', 200, { type, suffix: '-' + type });
    }
    return result;
}

export function validateWudangDefenseRecord(raw, condition) {
    const p = condition.parameters, [attacker, defender] = raw.before;
    for (const [side, config] of [[attacker, p.actor], [defender, p.target]]) {
        assert.equal(side.weapon, actualWeapon(config.equipment?.type ?? 'none'));
        if (config.equipment) assert.equal(side.weapon_details.program, '/tests/' + config.equipment.type);
        assert.equal(side.busy || 0, config.busy ?? 0);
    }
    assert.equal(attacker.effective_skills.force,
        Math.trunc(p.actor.skills.force / 2) + (p.actor.skills[p.actor.mappings.force] ?? 0));
    assert.equal(raw.launches.length, 0);
    const calls = wudangDefenses(raw);
    if (p.ability === 'query_effect_parry') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability);
        assert.equal(raw.interfaces[0].result, taijiParryCoefficient(p.skill, p.level, defender.weapon));
        assert.deepEqual(raw.before, raw.immediate);
        assert.equal(calls.length, 0); assert.equal(raw.attacks.length, 0); return;
    }
    for (const call of calls) {
        assert.equal(call.skill, p.skill);
        assert.equal(call.route, p.ability === 'valid_damage' ? 'interface' : p.ability);
        assert.ok(Number.isInteger(call.incoming) && call.incoming > 0);
        assert.ok(call.result === 0 || call.result === null || negated(call));
        if (negated(call)) assert.equal(typeof call.result.msg, 'string');
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0));
        // Retain original ripostes and equipment changes; pre-action state cannot prove every later call's eligibility.
        return;
    }
    assert.equal(calls.length, 1); assert.equal(raw.interfaces.length, 1);
    assert.equal(raw.interfaces[0].function, p.ability === 'direct' ? 'do_damage' : p.ability);
    assert.equal(raw.attacks.length, 0);
    const success = Boolean(negated(calls[0]));
    const enabled = p.level >= 100 && defender.living
        && (p.skill === 'taiji-quan' ? defender.weapon === 'none' : defender.weapon === 'sword');
    if (!enabled) assert.equal(success, false);
    else {
        // Validate only deterministic endpoints, never force observed random rates to match the expectation.
        const ap = attacker.effective_skills.force + attacker.skills.count;
        const dp = Math.trunc(defender.skills.parry / 2) + defender.skills[p.skill];
        if (Math.trunc(ap / 2) >= dp) assert.equal(success, false);
        if (Math.trunc(ap / 2) + ap - 1 < dp) assert.equal(success, true);
    }
    if (p.ability === 'valid_damage') {
        assert.equal(calls[0].incoming, 1000);
        assert.deepEqual(raw.interfaces[0].result, calls[0].result);
        assert.deepEqual(raw.immediate, raw.before, '化解查询本身不扣血、扣内力或增加忙乱');
    } else {
        const apply = attacker.temp.apply ?? {};
        assert.equal(calls[0].incoming, 1000 + ((p.interface.attack_type ? apply.damage : apply.unarmed_damage) ?? 0));
        assert.equal(raw.metrics[0].direct, 1);
        assert.equal((raw.metrics[1].qi_cost ?? 0) === 0, success, '隔离直伤由原公共结算落实化解');
        if (success) assert.equal(raw.metrics[1].eff_qi_cost ?? 0, 0);
        assert.equal(raw.metrics[1].neili_cost ?? 0, 0);
    }
}
