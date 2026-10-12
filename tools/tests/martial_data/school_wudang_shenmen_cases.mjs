// Original passive calls and ordinary attacks have different denominators.
import assert from 'node:assert/strict';

export const shenmenPassives = raw => raw.passives.filter(c => c.actor === 0 && c.target === 1 && c.skill === 'shenmen-jian');
export const shenmenTriggered = call => typeof call.result === 'string' && call.result.length > 0;
export function shenmenEligible(raw, call) {
    const [actor, target] = raw.before;
    return target.weapon !== 'none' && !!target.living && !target.busy
        && Math.trunc(actor.max_neili / 2) >= target.max_neili && call.incoming >= 100
        && call.neili_after >= 500 && actor.skills['shenmen-jian'] >= 80;
}

export function wudangShenmenConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const source = catalog.skills.find(s => s.id === 'shenmen-jian');
    assert.ok(source, '缺少神门剑原源码');
    const result = [];
    function add(method, level, extra = {}) {
        result.push({ id: `school-wudang-shenmen-${method}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method, samples: smoke ? 2 : extra.checks ?? samples,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-shenmen',
                combination: 'shenmen-jian+taiji-shengong', skill: 'shenmen-jian', usage: 'sword', level,
                ability: method === 'ordinary' ? 'ordinary' : 'hit_ob',
                observation: 'single_action_immediate', observation_role: 'offensive-passive',
                action: method === 'ordinary' ? 'ordinary' : 'test_interface',
                actor: { skills: { sword: level, 'shenmen-jian': level, force: level, 'taiji-shengong': level,
                    dodge: level, tiyunzong: level, parry: level, taoism: level, 'martial-cognize': level, ...extra.skills },
                    mappings: { sword: 'shenmen-jian', parry: 'shenmen-jian', force: 'taiji-shengong', dodge: 'tiyunzong', ...extra.mappings },
                    preparations: {}, properties: { neili: 6000, max_neili: 6000, jiali: 0,
                        combat_exp: 100000000, int: 36, con: 36, 'family/family_name': '武当派', ...extra.properties },
                    ...(extra.noWeapon ? {} : { equipment: { type: 'sword', hold: false } }),
                    ...(extra.actorBusy ? { busy: 2 } : {}) },
                target: { skills: { sword: 200, force: 600, dodge: 600, parry: 600 }, mappings: {},
                    properties: { neili: 3000, max_neili: extra.targetMax ?? 3000 },
                    ...(extra.unarmed ? {} : { equipment: { type: 'sword', hold: false } }),
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                ...(extra.unconscious ? { target_state: 'unconscious' } : {}),
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/shenmen-jian', function: 'hit_ob',
                    damage: extra.damage ?? 1000, factor: 0 } } : {}),
                fighting: method === 'ordinary', observe_seconds: 0, not_applicable: '', expected: 'observed',
                qualification_sources: [source.path, 'kungfu/class/wudang/zhang.c', 'kungfu/class/wudang/yin.c',
                    'kungfu/skill/taiji-shengong.c', 'kungfu/skill/tiyunzong.c', 'adm/daemons/combatd.c',
                    'feature/damage.c', 'feature/skill.c', 'feature/attack.c', 'feature/action.c',
                    'mudcore/inherit/action.c', 'inherit/misc/equip.c'],
                qualification_note: '真实非巫师USER；原hit_ob接口与原普攻分开。实验赋值不证明教学或同培养成本；目标上限3000满足施术者6000的一半门槛，6000目标为独立阻断对照。接口不代表普攻可绕过持器/映射；单次普攻保留原反击、装备和随机判定，不强制命中。昏迷通过原unconcious准备。',
            } });
    }
    for (const level of [200, 400, 800]) {
        add('interface', level);
        for (const jiali of [0, 50]) for (const targetMax of [3000, 6000])
            add('ordinary', level, { properties: { jiali }, targetMax, suffix: `-jiali${jiali}-target${targetMax}` });
    }
    for (const damage of [99, 100, 103, 104, 107]) add('interface', 400,
        { damage, suffix: '-damage' + damage, ...(damage < 100 ? { checks: 2 } : {}) });
    for (const [suffix, extra] of [
        ['skill79', { skills: { 'shenmen-jian': 79 }, checks: 2 }],
        ['skill80', { skills: { 'shenmen-jian': 80 } }],
        ['neili499', { properties: { neili: 499 }, checks: 2 }],
        ['neili500', { properties: { neili: 500 } }],
        ['max5999', { properties: { max_neili: 5999 }, checks: 2 }],
        ['max6001', { properties: { max_neili: 6001 } }],
        ['target3001', { targetMax: 3001, checks: 2 }],
        ['target-unarmed', { unarmed: true, checks: 2 }],
        ['target-busy', { targetBusy: true, checks: 2 }],
        ['target-unconscious', { unconscious: true, checks: 2 }],
        ['actor-unarmed', { noWeapon: true }],
        ['actor-busy', { actorBusy: true }],
        ['wrong-mapping', { skills: { 'wudang-jian': 400 }, mappings: { sword: 'wudang-jian' } }],
    ]) add('interface', 400, { ...extra, suffix: '-' + suffix });
    return result;
}

export function validateWudangShenmenRecord(raw, condition) {
    const p = condition.parameters, [actor, target] = raw.before, calls = shenmenPassives(raw);
    assert.equal(actor.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(target.weapon, p.target.equipment?.type ?? 'none');
    assert.equal(Boolean(target.living), p.target_state !== 'unconscious');
    assert.equal(raw.launches.length, 0);
    if (p.target_state === 'unconscious') {
        assert.equal(raw.preparation.before.living, 1); assert.equal(raw.preparation.after.living, 0);
    }
    for (const call of calls) {
        assert.equal(call.route, condition.method === 'interface' ? 'interface' : 'martial');
        assert.ok(call.result === 0 || call.result === null || shenmenTriggered(call));
        if (!shenmenEligible(raw, call)) assert.ok(!shenmenTriggered(call));
        assert.equal(call.target_eff_qi_after, target.eff_qi - (shenmenTriggered(call) ? Math.trunc((call.incoming - 100) / 4) : 0));
        assert.equal(call.target_busy_after || 0, shenmenTriggered(call) ? 2 : target.busy || 0);
    }
    // This batch invokes one initiating attack, so no repeated-passive attribution is needed.
    assert.ok(calls.length <= 1);
    const success = calls.some(shenmenTriggered);
    assert.equal(raw.dropped.length, success ? 1 : 0);
    assert.equal(raw.immediate[1].weapon, success ? 'none' : target.weapon);
    if (condition.method === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        assert.equal(attacks.length, 1);
        // COMBAT_D interrupts after settlement when damage > 0, even on this new busy.
        assert.equal(raw.immediate[1].busy || 0, success && attacks[0].damage <= 0 ? 2 : 0);
        return;
    }
    assert.equal(raw.immediate[1].busy || 0, success ? 2 : target.busy || 0);
    assert.equal(calls.length, 1); assert.equal(calls[0].incoming, p.interface.damage);
    assert.equal(raw.interfaces.length, 1); assert.deepEqual(raw.interfaces[0].result, calls[0].result);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.metrics[0].neili_cost ?? 0, 0);
    assert.equal(raw.immediate[0].neili, actor.neili); assert.equal(calls[0].neili_after, actor.neili);
    const wound = success ? Math.trunc((p.interface.damage - 100) / 4) : 0;
    assert.equal(raw.metrics[1].eff_qi_cost ?? 0, wound);
    assert.equal(raw.metrics[1].qi_cost ?? 0, wound, '满血目标的当前气血同步压低，不是另一次攻击');
}
