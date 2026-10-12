// Attacker is side 0, Dugu defender is side 1 in ALL defense conditions.
import assert from 'node:assert/strict';

export function huashanDefenseConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const source = catalog.skills.find(s => s.id === 'dugu-jiujian');
    assert.ok(source);
    const result = [];
    function add(ability, level, extra = {}) {
        const type = extra.type ?? 'sword', nothing = extra.nothing ?? false;
        const method = ability === 'ordinary' ? 'ordinary' : 'interface';
        result.push({ id: `school-huashan-defense-${ability}-l${level}${nothing ? '-nothing' : ''}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : extra.checks ?? (ability === 'query_effect_parry' ? 2 : samples),
            parameters: { school: 'huashan', family: '华山派', collection_group: 'huashan-defense',
                combination: nothing ? 'nothing' : 'normal', skill: 'dugu-jiujian', usage: 'parry',
                ability, level, observation: 'single_action_immediate',
                actor: { skills: { sword: 600, parry: 600, dodge: 600, force: 600, count: extra.count ?? 0 },
                    mappings: {}, properties: { jiali: 0, neili: 6000, max_neili: 6000 },
                    equipment: { type: 'sword', hold: false }, ...(extra.attackerBusy ? { busy: 2 } : {}) },
                target: { skills: { sword: level, parry: level, 'dugu-jiujian': level, dodge: 600, force: 600 },
                    mappings: { sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
                    properties: { jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000,
                        'family/family_name': '华山派', 'can_learn/dugu-jiujian/nothing': Number(nothing) },
                    ...(type === 'none' ? {} : { equipment: { type, hold: false } }),
                    ...(extra.busy ? { busy: 2 } : {}) },
                action: ability === 'ordinary' ? 'ordinary' : 'test_interface',
                ...(method === 'interface' ? { interface: {
                    object: ability === 'direct' ? '/adm/daemons/combatd' : '/kungfu/skill/dugu-jiujian',
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(ability === 'query_effect_parry' ? {} : { damage: 1000 }),
                } } : {}),
                fighting: ['ordinary', 'direct'].includes(ability), observe_seconds: 0, not_applicable: '',
                qualification_sources: [source.path, 'adm/daemons/combatd.c', 'feature/skill.c',
                    'feature/action.c', 'feature/damage.c', 'include/combat.h', 'kungfu/skill/sword.c',
                    'inherit/weapon/sword.c', 'inherit/weapon/xsword.c', 'inherit/weapon/pin.c'],
                qualification_note: '左方固定中性进攻者，右方独孤防守者；真实非巫师USER，资格为实验赋值。查询系数不是成功率；valid_damage只观察返回，不代替伤害结算。ordinary调用原TYPE_REGULAR并保留反击，direct经原WEAPON_ATTACK结算1000基础伤害；不声称为某绝招的命中率或完整门派交锋。',
                expected: 'observed',
            } });
    }
    for (const level of [89, 90, 99, 100, 124, 125, 149, 150, 174, 175, 199, 200,
        224, 225, 249, 250, 274, 275, 324, 325, 349, 350, 800]) add('query_effect_parry', level);
    for (const type of ['none', 'blade', 'pin', 'xsword']) add('query_effect_parry', 200, { type, suffix: '-' + type });
    for (const ability of ['valid_damage', 'ordinary', 'direct']) for (const level of [200, 400, 800])
        for (const nothing of [false, true]) for (const count of [0, 300])
            add(ability, level, { nothing, count, suffix: '-count' + count });
    for (const nothing of [false, true]) {
        add('valid_damage', 119, { nothing, checks: 2 });
        add('valid_damage', 200, { nothing, checks: 2, busy: true, suffix: '-busy' });
        for (const type of ['none', 'blade', 'pin', 'xsword'])
            add('valid_damage', 200, { nothing, ...(type === 'xsword' ? {} : { checks: 2 }), type, suffix: '-' + type });
        add('valid_damage', 200, { nothing, neili: 0, suffix: '-neili0' });
    }
    add('valid_damage', 200, { nothing: true, attackerBusy: true, suffix: '-attacker-busy' });
    return result;
}

export function parryCoefficient(level, type = 'sword') {
    if (type !== 'sword') return 0;
    const thresholds = [[90, 0], [100, 50], [125, 55], [150, 60], [175, 65], [200, 70],
        [225, 75], [250, 80], [275, 90], [325, 100], [350, 110]];
    return thresholds.find(([upper]) => level < upper)?.[1] ?? 120;
}

export const primaryDefenses = raw => raw.defenses.filter(d =>
    d.actor === 0 && d.target === 1 && d.skill === 'dugu-jiujian');
export const negated = defense => defense.incoming > 0 && defense.result
    && typeof defense.result === 'object' && defense.result.damage === -defense.incoming;

export function validateHuashanDefenseRecord(raw, condition) {
    const p = condition.parameters, [attacker, defender] = raw.before;
    const configuredType = p.target.equipment?.type ?? 'none';
    assert.equal(defender.weapon, configuredType === 'xsword' ? 'sword' : configuredType);
    if (p.target.equipment) assert.equal(defender.weapon_details.program, '/tests/' + p.target.equipment.type);
    assert.equal(defender.nothing, p.target.properties['can_learn/dugu-jiujian/nothing']);
    assert.equal(defender.busy || 0, p.target.busy ?? 0);
    assert.equal(attacker.busy || 0, p.actor.busy ?? 0);
    assert.equal(raw.launches.length, 0);
    const calls = primaryDefenses(raw);
    if (p.ability === 'query_effect_parry') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability);
        assert.equal(raw.interfaces[0].result, parryCoefficient(p.level, defender.weapon));
        assert.deepEqual(raw.immediate, raw.before, '系数查询不得改变角色');
        assert.equal(raw.defenses.length, 0);
        assert.equal(raw.attacks.length, 0);
        return;
    }
    for (const call of calls) {
        assert.equal(call.route, p.ability === 'valid_damage' ? 'interface' : p.ability);
        assert.ok(Number.isInteger(call.incoming) && call.incoming > 0);
        assert.ok(call.result === 0 || call.result === null || negated(call), '保留原零值、未定义或全额化解返回');
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        assert.ok(raw.attacks.some(a => a.actor === 0 && a.target === 1 && a.type === 0), '须经过原常规攻击');
        // Ripostes remain enabled: don't equate one initiating action with one hit.
        return;
    }
    assert.equal(raw.interfaces.length, 1);
    assert.equal(raw.interfaces[0].function, p.ability === 'direct' ? 'do_damage' : p.ability);
    assert.equal(calls.length, 1);
    const call = calls[0], success = Boolean(negated(call));
    const enabled = p.level >= 120 && defender.weapon === 'sword' && !defender.busy;
    if (!enabled) assert.equal(success, false);
    if (enabled) {
        // Only assert deterministic bounds of the ORIGINAL condition, not random rates.
        const ap = attacker.effective_skills.parry + attacker.skills.count;
        const dp = Math.trunc(defender.skills.parry / 2) + defender.skills['dugu-jiujian'];
        const minimum = defender.nothing ? Math.trunc(defender.effective_skills.sword * 3 / 4) : Math.trunc(ap / 2);
        if (defender.nothing && minimum > attacker.effective_skills.parry) assert.ok(success);
        if (!defender.nothing && minimum >= dp) assert.equal(success, false);
        if (!defender.nothing && minimum + ap - 1 < dp) assert.ok(success);
    }
    assert.equal(raw.attacks.length, 0);
    if (p.ability === 'valid_damage') {
        assert.equal(call.incoming, 1000);
        assert.deepEqual(raw.interfaces[0].result, call.result);
        assert.deepEqual(raw.immediate[1], defender, '接口不直接扣除防守者气血或内力');
        const after = structuredClone(raw.immediate[0]), before = structuredClone(attacker);
        assert.equal(after.busy || 0, before.busy || (success && defender.nothing ? after.busy : 0));
        if (success && defender.nothing && !before.busy) assert.ok([1, 2].includes(after.busy));
        delete after.busy; delete before.busy;
        assert.deepEqual(after, before, '接口只允许原无招分支改变攻击者忙乱');
    } else {
        assert.equal(call.incoming, 1000 + attacker.temp.apply.damage);
        assert.equal(raw.metrics[0].direct, 1);
        const damage = raw.metrics[1].qi_cost ?? 0;
        assert.equal(damage === 0, success, '原公共结算须落实化解结果');
        if (success) assert.equal(raw.metrics[1].eff_qi_cost ?? 0, 0);
    }
}
