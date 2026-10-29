// Two source-declared Yunlong combination members; preserve their different usages.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const yunlongMemberSources = {
    'kungfu/skill/yunlong-shou.c': '06f60b4851a13bb8e2a0990ccb9f01483d0f8400bd8c5b510eb868e0f62a35d8',
    'kungfu/skill/yunlong-zhua.c': '300335fe8dde084f9e124d9329f13862edc66d72b5986d387286b8de9daeac47',
    'kungfu/skill/yunlong-shengong.c': '6f4a3785688ca6a79145ae6a48f7e1fb5eb25efc4a1f08b04468dc06f4ca257b',
    'kungfu/class/yunlong/xuanzhen.c': 'ac2cd4678cf69325b9e66c2bcae6c4f4616e06d5950fd5c3875d6a210b2689d6',
    'kungfu/class/yunlong/tiandihui.h': 'd42ae547dfce095ff7eabf6345b9196d8ed69de3c8153d81507cbef9e4245b24',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};
const definitions = {
    'yunlong-shou': { usage: 'hand', other: 'yunlong-zhua', name: '云龙手', max: 700,
        valid: ['hand', 'parry'], qiCost: 62, neiliCost: 59,
        names: [[0, '草木皆兵'], [169, '如烟往事'], [170, null], [800, null]] },
    'yunlong-zhua': { usage: 'claw', other: 'yunlong-shou', name: '云龙爪', max: 800,
        valid: ['claw', 'unarmed'], qiCost: 55, neiliCost: 62,
        names: [[0, null], [180, null], [800, null]] },
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性', character: '光明磊落' };

export function yunlongMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries(yunlongMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '云龙成员来源改变，须重新审阅：' + path);
    const result = [];
    for (const [skill, cfg] of Object.entries(definitions)) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source);
        assert.ok(!catalog.skills.some(s => s.id.startsWith(skill + '/')),
            '原无子目录的成员新增入口，须重新核查绝招范围');
        function add(ability, suffix, extra = {}) {
            const level = extra.level ?? 200, ordinary = ability === 'ordinary', usage = extra.usage ?? cfg.usage;
            const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
            assert.ok(entry, '缺少原云龙接口：' + ability);
            result.push({ id: `school-s1-yunlong-${skill}-${ability}-${suffix}`, stage: 'school', entry_id: entry,
                method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : ordinary ? samples : 2,
                parameters: { school: 'yunlong', family: '云龙门', collection_group: 's1-yunlong',
                    skill, usage, ability, level,
                    actor: { skills: { force: 400, dodge: level, parry: level, sword: 200, unarmed: level,
                        [cfg.usage]: level, [skill]: level, ...(ordinary ? { 'yunlong-shengong': level } : {}), ...extra.skills },
                        mappings: ordinary ? { [usage]: skill, force: 'yunlong-shengong' } : {},
                        preparations: ordinary ? { [usage]: skill } : {},
                        properties: { ...properties, 'family/family_name': '云龙门', ...extra.properties },
                        ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                    target: { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
                        properties: { ...properties } }, action: ordinary ? 'ordinary' : 'test_interface',
                    fighting: ordinary, observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    expected_result: extra.value ?? 1, not_applicable: '',
                    ...(ability === 'query_skill_name' ? { expected_name: extra.name } : {}),
                    ...(!ordinary ? { interface: { object: '/kungfu/skill/' + skill, function: ability,
                        ...(extra.argument !== undefined ? { argument: extra.argument } : {}),
                        ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                    source_evidence: { ...yunlongMemberSources },
                    qualification_sources: [...Object.keys(yunlongMemberSources), 'inherit/skill/skill.c',
                        'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                        'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                    qualification_note: '玄贞原配置明确映射/互备云龙手与云龙爪并激发云龙神功，本批拆开观察，不复制NPC完整属性或证明可传授。真实非巫师USER，基本内功400，同档云龙神功；三档与加力0/50分列。云龙爪claw/unarmed两路单独观察，不强行开放parry；学习不激发基本功。练习只原接口费用，不冒充公开practice增长。主手经原wield，副手是实际剑对象诊断初态。名称查询原样保存0，不修skills_name错键、不把缺名称当零伤害。两原技能没有子目录，不补造绝招。',
                } });
        }
        for (const usage of cfg.valid.filter(u => u !== 'parry'))
            for (const level of [200, 400, 800]) for (const jiali of [0, 50])
                add('ordinary', `${usage}-l${level}-jiali${jiali}`, { usage, level, properties: { jiali } });
        for (const argument of [cfg.usage, 'parry', 'unarmed', 'sword'])
            add('valid_enable', argument, { argument, value: Number(cfg.valid.includes(argument)) });
        for (const combo of [cfg.other, 'jinyu-quan'])
            add('valid_combine', combo, { combo, value: Number(combo === cfg.other) });
        add('valid_learn', 'baseline');
        for (const force of [99, 100]) add('valid_learn', 'force' + force,
            { skills: { force: force * 2 }, ...(force < 100 ? { value: 0,
                refusal: `你的云龙神功火候不够，无法学${cfg.name}。\n` } : {}) });
        for (const max_neili of [cfg.max - 1, cfg.max]) add('valid_learn', 'max-neili' + max_neili,
            { properties: { max_neili }, ...(max_neili < cfg.max ? { value: 0,
                refusal: `你的内力太弱，无法练${cfg.name}。\n` } : {}) });
        for (const basic of [99, 100]) add('valid_learn', 'minimum-basic' + basic,
            { skills: { [cfg.usage]: basic, [skill]: 100 }, ...(basic < 100 ? { value: 0,
                refusal: `你的基本${cfg.usage === 'hand' ? '手' : '爪'}法火候不够，无法学${cfg.name}。\n` } : {}) });
        for (const basic of [199, 200]) add('valid_learn', 'basic' + basic,
            { skills: { [cfg.usage]: basic }, ...(basic < 200 ? { value: 0,
                refusal: `你的基本${cfg.usage === 'hand' ? '手' : '爪'}法水平有限，无法继续学${cfg.name}。\n` } : {}) });
        for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
            { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
                value: 0, refusal: `练${cfg.name}必须空手。\n` });
        add('practice_skill', 'baseline');
        for (const qi of [69, 70]) add('practice_skill', 'qi' + qi, { properties: { qi },
            ...(qi < 70 ? { value: 0, refusal: '你的体力太低了。\n' } : {}) });
        for (const neili of [69, 70]) add('practice_skill', 'neili' + neili, { properties: { neili },
            ...(neili < 70 ? { value: 0, refusal: `你的内力不够练${cfg.name}。\n` } : {}) });
        for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
            { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) } });
        for (const [level, name] of cfg.names) add('query_skill_name', 'level' + level, { argument: level, name });
    }
    return result;
}

const n = v => v ?? 0;
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) {
        delete v.temp.notify_fail; delete v.temp.fight;
        for (const key of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[key]) delete v.temp.apply[key];
    }
    return v;
};
export function validateYunlongMemberRecord(raw, condition) {
    const p = condition.parameters, cfg = definitions[p.skill];
    assert.ok(cfg); assert.equal(p.collection_group, 's1-yunlong'); assert.equal(raw.method, condition.method);
    assert.equal(raw.outcome, p.expected); assert.deepEqual(raw.after, raw.immediate);
    assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        for (const key of ['userp', 'playerp', 'interactive', 'living']) assert.equal(state[key], 1);
        assert.equal(state.wizardp, 0); assert.equal(state.ghost, 0);
        assert.deepEqual(state.skills, config.skills); assert.deepEqual(state.mappings, config.mappings);
        assert.deepEqual(state.preparations, config.preparations);
        for (const key of ['qi', 'jing', 'eff_qi', 'neili', 'max_neili', 'jiali', 'str', 'int', 'con', 'dex', 'combat_exp', 'character'])
            assert.equal(state[key], config.properties[key]);
        assert.equal(n(raw.metrics[side].heartbeats), 0);
        for (const r of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) assert.equal(n(raw.metrics[side][r + '_recovery']), 0);
    }
    const [b, t] = raw.before, [a, v] = raw.immediate, expected = plain(b), target = plain(t);
    assert.equal(b.cultivation['family/family_name'], '云龙门');
    assert.equal(b.weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'none' : p.actor.equipment?.type ?? 'none');
    assert.equal(b.secondary_weapon, p.actor.equipment?.slot === 'secondary_weapon' ? 'sword' : 'none');
    if (b.secondary_weapon !== 'none') assert.equal(b.secondary_weapon_details.program, '/tests/sword');
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0); assert.equal(raw.attacks.length, 1);
        const attack = raw.attacks[0];
        assert.equal(attack.actor, 0); assert.equal(attack.target, 1); assert.equal(attack.type, 0);
        assert.equal(attack.attack_skill, p.skill); assert.equal(attack.attack_usage, p.usage);
        assert.ok(cfg.valid.includes(p.usage) && p.usage !== 'parry');
        assert.ok([0, -1, -2].includes(attack.result));
        const hit = attack.result === 0, force = raw.passives.filter(e => e.route === 'force');
        const martial = raw.passives.filter(e => e.route === 'martial');
        assert.equal(force.length, b.jiali && hit ? 1 : 0); assert.equal(martial.length, Number(hit));
        assert.equal(raw.passives.length, force.length + martial.length);
        for (const call of force) {
            assert.equal(call.skill, 'yunlong-shengong'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, b.jiali); assert.ok(Number.isInteger(call.result) && call.result >= 0 && call.result <= 100);
        }
        for (const call of martial) {
            assert.equal(call.skill, p.skill); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.equal(n(call.result), 0);
        }
        const fee = force.length * b.jiali; expected.neili -= fee;
        assert.equal(n(raw.metrics[0].neili_cost), fee);
        assert.equal(n(raw.metrics[1].qi_cost), attack.damage);
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= attack.damage);
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    } else {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []);
        assert.equal(raw.interfaces.length, 1); const call = raw.interfaces[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let permitted;
        if (p.ability === 'query_skill_name') {
            assert.equal(call.argument, p.interface.argument); assert.ok(Object.hasOwn(call, 'result'));
            if (p.expected_name === null) assert.ok(call.result === null || call.result === 0,
                '缺名称须记录显式LPC零，不接受空字符串或补造名称');
            else assert.equal(call.result, p.expected_name);
            assert.equal(raw.outcome, 'observed');
        } else {
            if (p.ability === 'valid_enable') {
                assert.equal(call.argument, p.interface.argument); permitted = cfg.valid.includes(call.argument);
            } else if (p.ability === 'valid_combine') {
                assert.equal(call.combo, p.interface.combo); permitted = call.combo === cfg.other;
            } else if (p.ability === 'valid_learn') permitted = b.weapon === 'none' && b.secondary_weapon === 'none'
                && b.effective_skills.force >= 100 && b.max_neili >= cfg.max
                && b.skills[cfg.usage] >= 100 && b.skills[cfg.usage] >= b.skills[p.skill];
            else { assert.equal(p.ability, 'practice_skill'); permitted = b.qi >= 70 && b.neili >= 70; }
            assert.equal(p.expected_result, Number(permitted)); assert.equal(call.result, Number(permitted));
            if (p.expected === 'refused') {
                const prefix = '\x1b[256D\x1b[K';
                const reason = raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason;
                assert.equal(reason, p.refusal);
            }
            if (p.ability === 'practice_skill' && permitted) {
                expected.qi -= cfg.qiCost; expected.neili -= cfg.neiliCost;
                assert.equal(raw.metrics[0].qi_cost, cfg.qiCost); assert.equal(raw.metrics[0].neili_cost, cfg.neiliCost);
            }
        }
    }
    assert.deepEqual(plain(a), expected, '只允许原费用/通知变化，不伪造名称或熟练增长');
    assert.deepEqual(plain(v), target);
}
