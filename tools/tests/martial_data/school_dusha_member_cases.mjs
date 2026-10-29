// Original single-action/body interfaces. Poison lifecycle and actual teaching are separate windows.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const dushaMemberSources = {
    'kungfu/skill/dusha-zhang.c': '34f0479963c80cc972b0885da860d7e49231b3f239126d8b0c01b8e4342e752d',
    'kungfu/skill/shennong-xinjing.c': '0e4b82d99c347cc1be16f33bc16282b33bc621d1b09493fcfab26f95f8ae308d',
    'kungfu/class/lingjiu/sang.c': '9dbe09e7514fad1a02d54853939778897fe8e54af365ece17a6ddaa861070868',
    'feature/condition.c': '55f0458cc9a28ce961b3aa80ffe2365cdaf3eb562d133fe89d1ce77169eb461b',
    'inherit/condition/poison.c': 'a0e191025ec3f103b666e09f0b546958c8882b017d4c607998aed00988c4fabb',
    'kungfu/condition/sha_poison.c': '4221c3db7d326f4b7aedb2778aab83bc6eede66b72695073abbbaa483f4912e0',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000, eff_jing: 10000,
    max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0, combat_exp: 100000000,
    str: 30, int: 36, con: 30, dex: 30, gender: '男性' };
export function dushaMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(dushaMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '毒砂掌来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === 'dusha-zhang'); assert.ok(source);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? 200, ordinary = ability === 'ordinary';
        const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
        assert.ok(entry, '缺少原毒砂掌接口：' + ability);
        result.push({ id: `school-s1-dusha-${ability}-${suffix}`, stage: 'school', entry_id: entry,
            method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : ordinary ? samples : 2,
            parameters: { school: 'lingjiu', family: '碧磷洞', collection_group: 's1-dusha',
                skill: 'dusha-zhang', usage: 'strike', ability, level,
                actor: { skills: { force: 400, dodge: level, parry: level, sword: 200,
                    strike: level, 'dusha-zhang': level, ...(ordinary ? { 'shennong-xinjing': level } : {}), ...extra.skills },
                    mappings: ordinary ? { strike: 'dusha-zhang', force: 'shennong-xinjing' } : {},
                    preparations: ordinary ? { strike: 'dusha-zhang' } : {},
                    properties: { ...properties, 'family/family_name': '碧磷洞', ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                target: { skills: { force: extra.targetForce ?? 600, dodge: 600, parry: 600 },
                    mappings: {}, preparations: {}, properties: { ...properties } },
                action: ordinary ? 'ordinary' : 'test_interface', fighting: ordinary,
                observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                expected_result: extra.value ?? 1, not_applicable: '',
                ...(!ordinary ? { interface: { object: '/kungfu/skill/dusha-zhang', function: ability,
                    ...(extra.argument ? { argument: extra.argument } : {}),
                    ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                source_evidence: { ...dushaMemberSources },
                qualification_sources: [...Object.keys(dushaMemberSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '桑土公原配置毒砂掌/拦杀手互备，神农心经内功。本批真实非巫师USER单备毒砂掌，碧磷洞实验身份不冒灵鹫教师认可或授课。三档200/400/800与加力0/9/10/50独立，79/80和低/高对手内功只选择原判定窗口，不强制随机或命中。砂毒仅观察原命中回调和即时种子，不手动调用毒发/心跳，不冒完整生命周期。学习原双手检查；practice_skill原接口没有持器检查，不强加规则，也不冒公开practice命令熟练增长。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 9, 10, 50])
        add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const level of [79, 80]) add('ordinary', `gate-l${level}-jiali10`,
        { level, properties: { jiali: 10 }, targetForce: 0 });
    for (const targetForce of [0, 2000]) add('ordinary', 'target-force' + targetForce,
        { properties: { jiali: 50 }, targetForce });
    for (const argument of ['strike', 'parry', 'sword'])
        add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
    for (const combo of ['lansha-shou', 'jinyu-quan'])
        add('valid_combine', combo, { combo, value: Number(combo === 'lansha-shou') });
    add('valid_learn', 'baseline');
    for (const effective of [99, 100]) add('valid_learn', 'force' + effective,
        { skills: { force: effective * 2 }, ...(effective < 100 ? { value: 0,
            refusal: '你的内功火候不够，无法练毒砂掌。\n' } : {}) });
    for (const max_neili of [449, 450]) add('valid_learn', 'max-neili' + max_neili,
        { properties: { max_neili }, ...(max_neili < 450 ? { value: 0,
            refusal: '你的内力太弱，无法练毒砂掌。\n' } : {}) });
    for (const basic of [199, 200]) add('valid_learn', 'basic' + basic,
        { skills: { strike: basic }, ...(basic < 200 ? { value: 0,
            refusal: '你的基本掌法水平有限，无法领会更高深的毒砂掌。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '练毒砂掌必须空手。\n' });
    add('practice_skill', 'baseline');
    for (const level of [49, 50]) add('practice_skill', 'level' + level, { level });
    for (const qi of [59, 60]) add('practice_skill', 'qi' + qi, { properties: { qi },
        ...(qi < 60 ? { value: 0, refusal: '你的体力太低了，先休息一下吧。\n' } : {}) });
    for (const neili of [69, 70]) add('practice_skill', 'neili' + neili, { properties: { neili },
        ...(neili < 70 ? { value: 0, refusal: '你的内力不够练毒砂掌。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) } });
    return result;
}

const n = v => v ?? 0;
const strip = v => v.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '');
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) {
        delete v.temp.notify_fail; delete v.temp.fight;
        for (const key of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[key]) delete v.temp.apply[key];
    }
    return v;
};
export function validateDushaMemberRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.skill, 'dusha-zhang'); assert.equal(p.collection_group, 's1-dusha');
    assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(b[k], 1);
        assert.equal(b.wizardp, 0); assert.equal(b.ghost, 0); assert.equal(n(b.conditions), 0);
        assert.deepEqual(b.skills, config.skills); assert.deepEqual(b.mappings, config.mappings);
        assert.deepEqual(b.preparations, config.preparations);
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? b.cultivation[key] : b[key], value, '实际初态：' + key);
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const k of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][k + '_recovery']), 0);
    }
    const [b, t] = raw.before, [a, v] = raw.immediate, expected = plain(b), target = plain(t);
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    assert.equal(b.secondary_weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none');
    if (b.secondary_weapon !== 'none') assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    if (p.ability === 'ordinary') {
        assert.deepEqual(raw.interfaces, []); assert.equal(raw.attacks.length, 1);
        const attack = raw.attacks[0], hit = attack.result === 0;
        assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
        assert.equal(attack.attack_skill, 'dusha-zhang'); assert.equal(attack.attack_usage, 'strike');
        assert.ok([0, -1, -2].includes(attack.result));
        const force = raw.passives.filter(e => e.route === 'force'), martial = raw.passives.filter(e => e.route === 'martial');
        assert.equal(force.length, b.jiali && hit ? 1 : 0); assert.equal(martial.length, Number(hit));
        assert.equal(raw.passives.length, force.length + martial.length);
        for (const call of force) {
            assert.equal(call.skill, 'shennong-xinjing'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, b.jiali); assert.ok(Number.isInteger(call.result) && call.result >= 0 && call.result <= 100);
        }
        const poison = v.conditions?.sha_poison, call = martial[0];
        const eligible = hit && b.skills['dusha-zhang'] >= 80 && b.jiali >= 10 && n(call.incoming) !== 0;
        const min = b.jiali * 2, max = min + b.skills['dusha-zhang'] - 1, dp = t.effective_skills.force;
        if (!eligible || max <= dp) assert.ok(!poison, '原资格/判定不允许砂毒');
        if (eligible && min > dp) assert.ok(poison, '原判定支持集内必经施毒');
        if (hit) {
            assert.equal(call.skill, 'dusha-zhang'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.ok(Number.isSafeInteger(call.incoming) && call.incoming >= 0);
            if (poison) {
                assert.deepEqual(Object.keys(v.conditions), ['sha_poison']);
                assert.deepEqual(Object.keys(poison).sort(), ['id', 'level', 'name', 'remain']);
                assert.ok(Number.isSafeInteger(poison.level) && poison.level >= b.jiali && poison.level < b.jiali * 2);
                assert.equal(poison.id, b.id); assert.equal(poison.name, '砂毒');
                const duration = poison.remain / poison.level;
                assert.ok(Number.isSafeInteger(duration) && duration >= Math.trunc(b.skills['dusha-zhang'] / 50)
                    && duration < Math.trunc(b.skills['dusha-zhang'] / 50) + Math.trunc(b.skills['dusha-zhang'] / 20));
                assert.equal(strip(call.result), '$n忽然感到一股莫名的恶心，全身瘫软，嘴皮乌紫。\n');
                target.conditions = v.conditions;
            } else assert.equal(n(call.result), 0);
        }
        const fee = force.length * b.jiali; expected.neili -= fee;
        assert.equal(n(raw.metrics[0].neili_cost), fee);
        assert.equal(n(raw.metrics[1].qi_cost), attack.damage);
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= attack.damage);
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    } else {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []); assert.equal(raw.interfaces.length, 1);
        const call = raw.interfaces[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let permitted;
        if (p.ability === 'valid_enable') {
            assert.equal(call.argument, p.interface.argument); permitted = ['strike', 'parry'].includes(call.argument);
        } else if (p.ability === 'valid_combine') {
            assert.equal(call.combo, p.interface.combo); permitted = call.combo === 'lansha-shou';
        } else if (p.ability === 'valid_learn') permitted = b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.effective_skills.force >= 100 && b.max_neili >= 450 && b.skills.strike >= b.skills['dusha-zhang'];
        else { assert.equal(p.ability, 'practice_skill'); permitted = b.qi >= 60 && b.neili >= 70; }
        assert.equal(p.expected_result, Number(permitted)); assert.equal(call.result, Number(permitted));
        if (p.expected === 'refused') assert.equal(strip(raw.reason), p.refusal);
        if (p.ability === 'practice_skill' && permitted) {
            const qi = b.skills['dusha-zhang'] < 50 ? 30 : 40;
            expected.qi -= qi; expected.neili -= 60;
            assert.equal(raw.metrics[0].qi_cost, qi); assert.equal(raw.metrics[0].neili_cost, 60);
        }
    }
    assert.deepEqual(plain(a), expected, '仅原费用、受击、通知和战斗统计变化');
    assert.deepEqual(plain(v), target);
}
