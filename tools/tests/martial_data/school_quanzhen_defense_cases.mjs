// Defense interfaces, actual settlement and offensive passives are distinct observations.
import assert from 'node:assert/strict';
import { negated } from './school_huashan_defense_cases.mjs';

export const quanzhenDefenses = raw => raw.defenses.filter(d => d.actor === 0 && d.target === 1
    && ['jinguan-yusuo', 'kongming-quan'].includes(d.skill));
export const xiantianPassives = raw => raw.passives.filter(d => d.actor === 0 && d.target === 1 && d.skill === 'xiantian-gong');
export const kongmingParryCoefficient = (level, armed = false) => armed || level < 80 ? 0
    : level < 200 ? 50 : level < 280 ? 80 : level < 350 ? 100 : 120;

export function quanzhenDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少全真防御原源码：' + skill);
        const passive = skill === 'xiantian-gong', method = ability === 'ordinary' ? 'ordinary' : 'interface';
        const actor = passive ? {
            skills: { unarmed: level, force: level, parry: level, dodge: level, [skill]: level, ...extra.skills },
            mappings: { force: skill, unarmed: skill, parry: skill, ...extra.mappings },
            preparations: extra.unprepared ? {} : { unarmed: skill },
            properties: { str: 30, jiali: 0, neili: 6000, max_neili: 6000, ...extra.properties },
        } : {
            skills: { unarmed: 600, sword: 600, parry: 600, dodge: 600, force: 600, count: extra.count ?? 0,
                ...(extra.mappedForce ? { 'xuanmen-neigong': 600 } : {}) },
            mappings: extra.mappedForce ? { force: 'xuanmen-neigong' } : {},
            properties: { jiali: 0, neili: 6000, max_neili: 6000 },
        };
        if (extra.actorWeapon) actor.equipment = { type: 'sword', hold: false };
        const target = {
            skills: { force: 600, parry: passive ? 600 : level, dodge: 600, unarmed: passive ? 600 : level,
                ...(!passive ? { [skill]: level } : {}) },
            mappings: passive ? {} : { parry: skill },
            properties: { jiali: 0, neili: extra.targetNeili ?? 6000, max_neili: 6000 },
            ...(extra.targetWeapon ? { equipment: { type: 'sword', hold: false } } : {}),
            ...(extra.busy ? { busy: 2 } : {}),
        };
        result.push({ id: `school-quanzhen-defense-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : extra.checks ?? (['hit_ob', 'query_effect_parry'].includes(ability) ? 2 : samples),
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-defense',
                combination: passive ? 'xiantian-force-unarmed' : 'neutral-attacker', skill,
                usage: passive ? 'unarmed' : 'parry', ability, level, actor, target,
                observation: 'single_action_immediate', observation_role: passive ? 'offensive-passive' : 'defense',
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: {
                    object: ability === 'direct' ? '/adm/daemons/combatd' : `/kungfu/skill/${skill}`,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(ability === 'query_effect_parry' ? {} : { damage: extra.damage ?? 1000 }),
                    ...(ability === 'direct' ? { attack_type: extra.actorWeapon ? 1 : 0 } : {}),
                    ...(ability === 'hit_ob' ? { factor: extra.factor ?? 0 } : {}),
                } } : {}),
                fighting: ability === 'ordinary' || ability === 'direct', observe_seconds: 0,
                not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'adm/daemons/combatd.c', 'feature/skill.c',
                    'feature/attribute.c', 'feature/damage.c', 'include/combat.h', 'kungfu/skill/unarmed.c',
                    'kungfu/skill/xuanmen-neigong.c', 'kungfu/class/quanzhen/wang.c', 'kungfu/class/quanzhen/zhou.c'],
                qualification_note: '真实非巫师USER；防御条件左方固定进攻者、右方受测招架，不复制完整NPC。先天附加条件左方同时激发/准备先天功，资格由实验赋值。valid_damage仅查询、direct经原UNARMED/WEAPON_ATTACK结算、ordinary保留原反击；先天hit_ob接口不代替整次攻击。str600是独立人为边界，不证明正常角色可得；同级不代表同养成成本。',
            } });
    }
    for (const skill of ['jinguan-yusuo', 'kongming-quan']) {
        for (const ability of ['valid_damage', 'ordinary', 'direct']) for (const level of [200, 400, 800])
            for (const variant of [false, true]) add(skill, ability, level,
                skill === 'jinguan-yusuo' ? { count: variant ? 300 : 0, suffix: '-count' + (variant ? 300 : 0) }
                    : { mappedForce: variant, suffix: variant ? '-mapped-force' : '-basic-force' });
        add(skill, 'valid_damage', 99, { checks: 2 });
        for (const [suffix, extra] of [['-actor-armed', { actorWeapon: true }],
            ['-target-armed', { targetWeapon: true }], ['-busy', { busy: true }], ['-neili0', { targetNeili: 0 }]])
            for (const ability of ['valid_damage', 'direct']) add(skill, ability, 800,
                { ...extra, suffix, ...(skill === 'kongming-quan' && suffix.includes('armed') ? { checks: 2 } : {}) });
    }
    for (const level of [79, 80, 199, 200, 279, 280, 349, 350, 800]) add('kongming-quan', 'query_effect_parry', level);
    add('kongming-quan', 'query_effect_parry', 800, { targetWeapon: true, suffix: '-armed' });
    for (const damage of [149, 150, 540, 545, 546, 1000]) add('xiantian-gong', 'hit_ob', 400,
        { damage, suffix: '-damage' + damage });
    for (const [suffix, extra] of [['-neili299', { properties: { neili: 299 } }],
        ['-neili300', { properties: { neili: 300 } }], ['-unprepared', { unprepared: true }],
        ['-armed', { actorWeapon: true }], ['-factor500', { factor: 500 }],
        ['-wrong-force', { skills: { 'xuanmen-neigong': 400 }, mappings: { force: 'xuanmen-neigong' } }]])
        add('xiantian-gong', 'hit_ob', 400, { ...extra, suffix });
    for (const level of [200, 400, 800]) for (const jiali of [0, 50]) add('xiantian-gong', 'ordinary', level,
        { properties: { jiali }, suffix: '-jiali' + jiali });
    add('xiantian-gong', 'ordinary', 400, { properties: { str: 600, jiali: 50 }, suffix: '-str600-jiali50' });
    return result;
}

export function validateQuanzhenDefenseRecord(raw, condition) {
    const p = condition.parameters, [attacker, defender] = raw.before;
    assert.equal(raw.launches.length, 0);
    assert.equal(attacker.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(defender.weapon, p.target.equipment?.type ?? 'none');
    if (p.observation_role === 'offensive-passive') {
        const calls = xiantianPassives(raw);
        assert.deepEqual(attacker.preparations, p.actor.preparations);
        assert.equal(defender.effective_con, 90);
        for (const call of calls) {
            assert.ok(['interface', 'force', 'martial'].includes(call.route));
            assert.ok(call.result === 0 || call.result === null || typeof call.result === 'string');
            if (call.result) assert.ok(call.incoming >= 546, '创伤门槛使用后天根骨及整数除法');
        }
        if (p.ability === 'ordinary') {
            assert.equal(raw.interfaces.length, 0);
            assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0));
            if (!attacker.jiali) assert.equal(calls.filter(c => c.route === 'force').length, 0);
            return;
        }
        assert.equal(calls.length, 1); assert.equal(calls[0].route, 'interface');
        assert.equal(raw.interfaces.length, 1); assert.deepEqual(raw.interfaces[0].result, calls[0].result);
        const input = p.interface.damage;
        const success = input >= 150 && p.level >= 180 && attacker.neili >= 300 && attacker.weapon === 'none'
            && attacker.mappings.force === 'xiantian-gong' && attacker.mappings.unarmed === 'xiantian-gong'
            && attacker.preparations.unarmed === 'xiantian-gong' && Math.trunc(input / 6) > defender.effective_con;
        assert.equal(Boolean(calls[0].result), success);
        assert.equal(raw.metrics[0].neili_cost ?? 0, success ? 30 : 0);
        assert.equal(raw.metrics[1].eff_qi_cost ?? 0, success ? Math.trunc((input - 100) / 3) : 0);
        assert.equal(raw.metrics[1].qi_cost ?? 0, success ? Math.trunc((input - 100) / 3) : 0,
            '满血目标由receive_wound同步压低当前气血，不是额外第二次伤害');
        assert.equal(raw.attacks.length, 0);
        return;
    }
    const calls = quanzhenDefenses(raw);
    if (p.ability === 'query_effect_parry') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].result, kongmingParryCoefficient(p.level, defender.weapon !== 'none'));
        assert.deepEqual(raw.before, raw.immediate); assert.equal(calls.length, 0); return;
    }
    for (const call of calls) {
        assert.equal(call.skill, p.skill);
        assert.equal(call.route, p.ability === 'valid_damage' ? 'interface' : p.ability);
        assert.ok(call.result === 0 || call.result === null || negated(call));
        const enabled = p.level >= 100 && defender.living && (p.skill !== 'kongming-quan'
            || (attacker.weapon === 'none' && defender.weapon === 'none'));
        if (!enabled) assert.ok(!negated(call));
        else {
            const ap = p.skill === 'jinguan-yusuo' ? attacker.skills.force + attacker.skills.count : attacker.effective_skills.force;
            const dp = p.skill === 'jinguan-yusuo' ? Math.trunc(p.level * 3 / 4) : Math.trunc(defender.skills.unarmed / 2) + p.level;
            if (Math.trunc(ap / 2) >= dp) assert.ok(!negated(call));
            if (Math.trunc(ap / 2) + ap - 1 < dp) assert.ok(negated(call));
        }
    }
    if (p.ability === 'ordinary') {
        assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0)); return;
    }
    assert.equal(calls.length, 1); assert.equal(raw.interfaces.length, 1);
    assert.equal(raw.attacks.length, 0);
    if (p.ability === 'valid_damage') {
        assert.equal(calls[0].incoming, 1000); assert.deepEqual(raw.interfaces[0].result, calls[0].result);
        assert.deepEqual(raw.immediate, raw.before, '化解接口本身不结算生命值，也不扣内力或加忙');
    } else {
        const apply = attacker.temp.apply ?? {};
        assert.equal(calls[0].incoming, 1000 + ((p.interface.attack_type ? apply.damage : apply.unarmed_damage) ?? 0));
        assert.equal(raw.metrics[0].direct, 1);
        assert.equal((raw.metrics[1].qi_cost ?? 0) === 0, Boolean(negated(calls[0])));
    }
}
