// Native single-member windows; not NPC teaching, full combination or perform coverage.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const panlongMemberSources = {
    'kungfu/skill/panlong-zhao.c': 'de3ea5187a50df3bce5c57a7cb6552df06fb419e7e7d4b8eb0dad74c6c59e45c',
    'kungfu/skill/miaojia-neigong.c': 'ee360be966fc2e5b27b383607145330d4745957b75d05a22108f471aef844bf6',
    'kungfu/class/miao/miao.c': 'acf54cc38b0713d8daa568b7a7967d49b987b8cc37c800613b96b9ea1a36fa2a',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性' };

export function panlongMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries(panlongMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '盘龙爪来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === 'panlong-zhao'); assert.ok(source);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? 200, ordinary = ability === 'ordinary';
        const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
        assert.ok(entry, '缺少原盘龙爪接口：' + ability);
        result.push({ id: `school-s1-panlong-${ability}-${suffix}`, stage: 'school', entry_id: entry,
            method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : ordinary ? samples : 2,
            parameters: { school: 'miao', family: '中原苗家', collection_group: 's1-panlong',
                skill: 'panlong-zhao', usage: 'claw', ability, level,
                actor: { skills: { force: 400, dodge: level, parry: level, sword: 200,
                    claw: level, 'panlong-zhao': level, ...(ordinary ? { 'miaojia-neigong': level } : {}), ...extra.skills },
                    mappings: ordinary ? { claw: 'panlong-zhao', force: 'miaojia-neigong' } : {},
                    preparations: ordinary ? { claw: 'panlong-zhao' } : {},
                    properties: { ...properties, 'family/family_name': '中原苗家', ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
                    properties: { ...properties } }, action: ordinary ? 'ordinary' : 'test_interface',
                fighting: ordinary, observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                expected_result: extra.value ?? 1, not_applicable: '',
                ...(!ordinary ? { interface: { object: '/kungfu/skill/panlong-zhao', function: ability,
                    ...(extra.argument ? { argument: extra.argument } : {}),
                    ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                source_evidence: { ...panlongMemberSources },
                qualification_sources: [...Object.keys(panlongMemberSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '苗人凤原配置明确映射并互备盘龙爪与冲天掌，激发苗家内功。本批真实非巫师USER单备盘龙爪，不复制NPC属性，不证明实际授课或完整互备效果。三档200/400/800、加力0/50分列；学习未映射爪/内功，区分有效值和原始值。主手经原wield，副手为实际剑诊断初态。练习是原practice_skill接口，不冒充公开命令熟练增长。已有tan子目录另列待采，不将本体窗口冒充绝招完成。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const argument of ['claw', 'parry', 'sword'])
        add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
    for (const combo of ['chongtian-zhang', 'jinyu-quan'])
        add('valid_combine', combo, { combo, value: Number(combo === 'chongtian-zhang') });
    add('valid_learn', 'baseline');
    for (const effective of [49, 50]) add('valid_learn', 'force' + effective,
        { skills: { force: effective * 2 }, ...(effective < 50 ? { value: 0,
            refusal: '你的内功火候不够，无法学越空盘龙爪。\n' } : {}) });
    for (const max_neili of [399, 400]) add('valid_learn', 'max-neili' + max_neili,
        { properties: { max_neili }, ...(max_neili < 400 ? { value: 0,
            refusal: '你的内力太弱，无法练越空盘龙爪。\n' } : {}) });
    for (const effective of [29, 30]) add('valid_learn', 'minimum-basic' + effective,
        { skills: { claw: effective * 2, 'panlong-zhao': 20 }, ...(effective < 30 ? { value: 0,
            refusal: '你的基本爪法等级太低，无法学越空盘龙爪。\n' } : {}) });
    for (const basic of [199, 200]) add('valid_learn', 'basic' + basic,
        { skills: { claw: basic }, ...(basic < 200 ? { value: 0,
            refusal: '你的基本爪法火候水平有限，无法领会更高深的越空盘龙爪。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '练越空盘龙爪必须空手。\n' });
    add('practice_skill', 'baseline');
    for (const qi of [69, 70]) add('practice_skill', 'qi' + qi, { properties: { qi },
        ...(qi < 70 ? { value: 0, refusal: '你的体力太低了。\n' } : {}) });
    for (const neili of [79, 80]) add('practice_skill', 'neili' + neili, { properties: { neili },
        ...(neili < 80 ? { value: 0, refusal: '你的内力不够练越空盘龙爪。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '越空盘龙爪必须空手练习！\n' });
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
export function validatePanlongMemberRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.skill, 'panlong-zhao'); assert.equal(p.collection_group, 's1-panlong');
    assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    assert.deepEqual(raw.after, raw.immediate); assert.deepEqual(raw.launches, []); assert.deepEqual(raw.directs, []);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const k of ['userp', 'playerp', 'interactive', 'living']) assert.equal(b[k], 1);
        assert.equal(b.wizardp, 0); assert.equal(b.ghost, 0);
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
        assert.equal(attack.attack_skill, 'panlong-zhao'); assert.equal(attack.attack_usage, 'claw');
        assert.ok([0, -1, -2].includes(attack.result));
        const force = raw.passives.filter(e => e.route === 'force'), martial = raw.passives.filter(e => e.route === 'martial');
        assert.equal(force.length, b.jiali && hit ? 1 : 0); assert.equal(martial.length, Number(hit));
        assert.equal(raw.passives.length, force.length + martial.length);
        for (const call of force) {
            assert.equal(call.skill, 'miaojia-neigong'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, b.jiali); assert.ok(Number.isInteger(call.result) && call.result >= 0 && call.result <= 100);
        }
        for (const call of martial) {
            assert.equal(call.skill, 'panlong-zhao'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.equal(n(call.result), 0);
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
            assert.equal(call.argument, p.interface.argument); permitted = ['claw', 'parry'].includes(call.argument);
        } else if (p.ability === 'valid_combine') {
            assert.equal(call.combo, p.interface.combo); permitted = call.combo === 'chongtian-zhang';
        } else if (p.ability === 'valid_learn') permitted = b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.effective_skills.force >= 50 && b.max_neili >= 400 && b.effective_skills.claw >= 30
            && b.skills.claw >= b.skills['panlong-zhao'];
        else { assert.equal(p.ability, 'practice_skill'); permitted = b.weapon === 'none'
            && b.secondary_weapon === 'none' && b.qi >= 70 && b.neili >= 80; }
        assert.equal(p.expected_result, Number(permitted)); assert.equal(call.result, Number(permitted));
        if (p.expected === 'refused') {
            const prefix = '\x1b[256D\x1b[K';
            assert.equal(raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason, p.refusal);
        }
        if (p.ability === 'practice_skill' && permitted) {
            expected.qi -= 60; expected.neili -= 69;
            assert.equal(raw.metrics[0].qi_cost, 60); assert.equal(raw.metrics[0].neili_cost, 69);
        }
    }
    assert.deepEqual(plain(a), expected, '仅原费用、受击、通知和战斗统计变化');
    assert.deepEqual(plain(v), target);
}
