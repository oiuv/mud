// Original single-member interfaces and attacks; not NPC teaching or full combination coverage.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const qianyeMemberSources = {
    'kungfu/skill/qianye-shou.c': 'c4a8ea48fff805d24464ed1193dc07ce1d0bf59c8153ed006a6a40ac9eb3b456',
    'inherit/skill/shaolin.c': '360610bd6c786e10dfb432611a7cc9e33abe5433cbbe4bf601452389b8a016b1',
    'kungfu/class/meizhuang/huang.c': 'd299803e1c478fe23d4b9a44a84ba16063f8f99c1da9bd1d7e5cf99567c07c5c',
    'adm/daemons/combatd.c': '9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6',
};
export const qianyeNames = [[0, '南海礼佛'], [30, '金玉瓦砾'], [60, '人命呼吸'],
    [90, '镜里观影'], [110, '水中捉月'], [130, '浮云去来'], [140, '水泡出没'],
    [150, '梦里明明'], [160, '觉后空空']];
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性' };

export function qianyeMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, hash] of Object.entries(qianyeMemberSources))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), hash,
            '千叶手来源改变，须重新审阅：' + path);
    const source = catalog.skills.find(s => s.id === 'qianye-shou'); assert.ok(source);
    const result = [];
    function add(ability, suffix, extra = {}) {
        const level = extra.level ?? 200, ordinary = ability === 'ordinary';
        const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
        assert.ok(entry, '缺少原千叶手接口：' + ability);
        result.push({ id: `school-s1-qianye-${ability}-${suffix}`, stage: 'school', entry_id: entry,
            method: ordinary ? 'ordinary' : 'interface', samples: smoke ? 2 : ordinary ? samples : 2,
            parameters: { school: 'meizhuang', family: '梅庄', collection_group: 's1-qianye',
                skill: 'qianye-shou', usage: 'hand', ability, level,
                actor: { skills: { force: 400, hand: level, 'qianye-shou': level,
                    dodge: level, parry: level, sword: 200, ...extra.skills },
                    mappings: ordinary ? { hand: 'qianye-shou' } : {},
                    preparations: ordinary ? { hand: 'qianye-shou' } : {},
                    properties: { ...properties, 'family/family_name': '梅庄', ...extra.properties },
                    ...(extra.equipment ? { equipment: extra.equipment } : {}) },
                target: { skills: { force: 600, dodge: 600, parry: 600 }, mappings: {}, preparations: {},
                    properties: { ...properties } }, action: ordinary ? 'ordinary' : 'test_interface',
                fighting: ordinary, observation: 'single_action_immediate', observe_seconds: 0,
                expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                expected_result: extra.value ?? 1, not_applicable: '',
                ...(!ordinary ? { interface: { object: '/kungfu/skill/qianye-shou', function: ability,
                    ...(Object.hasOwn(extra, 'argument') ? { argument: extra.argument } : {}),
                    ...(extra.combo ? { combo: extra.combo } : {}) } } : {}),
                source_evidence: { ...qianyeMemberSources },
                qualification_sources: [...Object.keys(qianyeMemberSources), 'inherit/skill/skill.c',
                    'feature/skill.c', 'feature/attack.c', 'feature/damage.c', 'feature/equip.c',
                    'feature/action.c', 'feature/attribute.c', 'include/combat.h', 'inherit/char/char.c'],
                qualification_note: '梅庄组为valid_combine允许的实验扩展，黄钟公未配置千叶手且no_teach拒授龙爪功，不冒充原NPC搭配或教学。真实非巫师USER单备千叶手，无特殊内功激发，三档加力0/50分列。学习有效内功用未映射基本功一半；主手原wield，副手为实际剑诊断初态。practice_skill只验原费用，不冒公开practice熟练增长；名称查询>=与普通选招>分开，不冒充绝招或完整组合覆盖。',
            } });
    }
    for (const level of [200, 400, 800]) for (const jiali of [0, 50])
        add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
    for (const argument of ['hand', 'parry', 'sword'])
        add('valid_enable', argument, { argument, value: Number(argument !== 'sword') });
    for (const combo of ['longzhua-gong', 'jinyu-quan'])
        add('valid_combine', combo, { combo, value: Number(combo === 'longzhua-gong') });
    add('valid_learn', 'baseline');
    for (const effective of [39, 40]) add('valid_learn', 'force' + effective,
        { skills: { force: effective * 2 }, ...(effective < 40 ? { value: 0,
            refusal: '你的内功火候不够，无法学如来千叶手。\n' } : {}) });
    for (const max_neili of [199, 200]) add('valid_learn', 'max-neili' + max_neili,
        { properties: { max_neili }, ...(max_neili < 200 ? { value: 0,
            refusal: '你的内力太弱，无法练如来千叶手。\n' } : {}) });
    for (const hand of [199, 200]) add('valid_learn', 'basic' + hand,
        { skills: { hand }, ...(hand < 200 ? { value: 0,
            refusal: '你的基本手法水平有限，无法领会更高深的如来千叶手。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '练如来千叶手必须空手。\n' });
    add('practice_skill', 'baseline');
    for (const qi of [74, 75]) add('practice_skill', 'qi' + qi, { properties: { qi },
        ...(qi < 75 ? { value: 0, refusal: '你的体力太低了。\n' } : {}) });
    for (const neili of [69, 70]) add('practice_skill', 'neili' + neili, { properties: { neili },
        ...(neili < 70 ? { value: 0, refusal: '你的内力不够练如来千叶手。\n' } : {}) });
    for (const slot of ['weapon', 'secondary_weapon']) add('practice_skill', slot,
        { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
            value: 0, refusal: '你必须空手练习！\n' });
    for (const argument of [...qianyeNames.map(([level]) => level), 29, 800])
        add('query_skill_name', 'l' + argument, { argument,
            value: qianyeNames.filter(([level]) => level <= argument).at(-1)[1] });
    return result;
}

const n = v => v ?? 0;
const plain = state => {
    const v = structuredClone(state);
    if (v.temp) {
        delete v.temp.notify_fail; delete v.temp.fight;
        for (const k of Object.keys(v.temp.apply ?? {})) if (!v.temp.apply[k]) delete v.temp.apply[k];
    }
    return v;
};
export function validateQianyeMemberRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.skill, 'qianye-shou'); assert.equal(p.collection_group, 's1-qianye');
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
        assert.equal(attack.attack_skill, 'qianye-shou'); assert.equal(attack.attack_usage, 'hand');
        assert.ok([0, -1, -2].includes(attack.result));
        assert.equal(raw.passives.length, Number(hit));
        for (const call of raw.passives) {
            assert.equal(call.route, 'martial'); assert.equal(call.skill, 'qianye-shou');
            assert.equal(call.actor, 0); assert.equal(call.target, 1);
            assert.equal(call.factor, 0); assert.equal(n(call.result), 0);
        }
        assert.equal(n(raw.metrics[0].neili_cost), 0);
        assert.equal(n(raw.metrics[1].qi_cost), attack.damage);
        assert.ok(n(raw.metrics[1].eff_qi_cost) >= 0 && n(raw.metrics[1].eff_qi_cost) <= attack.damage);
        target.qi = v.qi; target.eff_qi = v.eff_qi;
    } else {
        assert.deepEqual(raw.attacks, []); assert.deepEqual(raw.passives, []); assert.equal(raw.interfaces.length, 1);
        const call = raw.interfaces[0];
        assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
        let permitted;
        if (p.ability === 'query_skill_name') {
            assert.equal(call.argument, p.interface.argument);
            permitted = qianyeNames.filter(([level]) => level <= call.argument).at(-1)[1];
        } else if (p.ability === 'valid_enable') {
            assert.equal(call.argument, p.interface.argument); permitted = Number(['hand', 'parry'].includes(call.argument));
        } else if (p.ability === 'valid_combine') {
            assert.equal(call.combo, p.interface.combo); permitted = Number(call.combo === 'longzhua-gong');
        } else if (p.ability === 'valid_learn') permitted = Number(b.weapon === 'none' && b.secondary_weapon === 'none'
            && b.effective_skills.force >= 40 && b.max_neili >= 200 && b.skills.hand >= b.skills['qianye-shou']);
        else { assert.equal(p.ability, 'practice_skill'); permitted = Number(b.weapon === 'none'
            && b.secondary_weapon === 'none' && b.qi >= 75 && b.neili >= 70); }
        assert.equal(p.expected_result, permitted); assert.equal(call.result, permitted);
        if (p.expected === 'refused') {
            const prefix = '\x1b[256D\x1b[K';
            assert.equal(raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason, p.refusal);
        }
        if (p.ability === 'practice_skill' && permitted) {
            expected.qi -= 68; expected.neili -= 64;
            assert.equal(raw.metrics[0].qi_cost, 68); assert.equal(raw.metrics[0].neili_cost, 64);
        }
    }
    assert.deepEqual(plain(a), expected, '仅原费用、受击、通知和战斗统计变化');
    assert.deepEqual(plain(v), target);
}
