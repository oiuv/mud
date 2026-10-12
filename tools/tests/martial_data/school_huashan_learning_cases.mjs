// Learning through original player commands, and explicit read-only skill queries.
import assert from 'node:assert/strict';

export function huashanLearningConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(ability, level = 200, extra = {}) {
        const method = ability === 'jue' ? 'perform' : ability === 'research' ? 'research' : 'interface';
        const source = catalog.skills.find(s => s.id === (ability === 'jue' ? 'dugu-jiujian/jue' : 'dugu-jiujian'));
        assert.ok(source);
        result.push({ id: `school-huashan-learning-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: ability === 'jue' ? source.entries.find(e => e.role === 'perform').id : source.path,
            method, samples: smoke ? 2 : extra.checks ?? (method === 'interface' ? 2 : samples),
            parameters: { school: 'huashan', family: '华山派', collection_group: 'huashan-learning',
                combination: extra.nothing ? 'nothing' : 'normal', skill: 'dugu-jiujian', usage: 'sword', ability, level,
                observation: 'single_action_immediate',
                actor: {
                    skills: { sword: level, parry: level, 'dugu-jiujian': level, 'martial-cognize': level, ...extra.skills },
                    mappings: { sword: 'dugu-jiujian', parry: 'dugu-jiujian' },
                    properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000,
                        int: 39, con: 36, dex: 36, character: '狡黠多变', combat_exp: 100000000,
                        potential: 10000, learned_points: 0, 'family/family_name': '华山派',
                        'can_learn/dugu-jiujian/nothing': extra.nothing ? 1 : 0, ...extra.properties },
                    ...(extra.unarmed ? {} : { equipment: { type: 'sword', hold: false } }),
                },
                target: { skills: {}, mappings: {}, properties: {} },
                action: ability === 'jue' ? 'perform sword.jue' : ability === 'research'
                    ? 'research dugu-jiujian 1' : 'test_interface',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/dugu-jiujian', function: ability } } : {}),
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '',
                qualification_sources: ['kungfu/skill/dugu-jiujian.c', 'kungfu/skill/dugu-jiujian/jue.c',
                    'cmds/skill/perform.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'feature/damage.c', 'feature/action.c', 'inherit/skill/skill.c'],
                qualification_note: '真实非巫师USER；资格及经验为实验赋值，不证明师承获得；只保留剑法、招架、独孤及武学修养以明确研究的相关技能贡献。接口查询保留真实this_player；精神不足仅观察原命令即时结果，不以关闭自主心跳的夹具推断长期存活。',
                expected: extra.expected ?? 'observed',
            } });
    }
    for (const level of [200, 400, 800]) {
        add('jue', level);
        for (const nothing of [false, true]) add('research', level, { nothing, suffix: nothing ? '-nothing' : '' });
    }
    const edge = (ability, suffix, extra = {}) => add(ability, extra.level ?? 200, { checks: 2, suffix: '-' + suffix, ...extra });
    for (const jing of [0, 40, 41]) edge('jue', 'jing' + jing, { properties: { jing } });
    edge('jue', 'int50', { properties: { int: 50 } });
    edge('jue', 'neili84', { properties: { neili: 84 }, expected: 'refused' });
    edge('jue', 'skill59', { level: 59, expected: 'refused' });
    edge('jue', 'basic199', { skills: { sword: 199 }, expected: 'refused' });
    edge('jue', 'exp799999', { properties: { combat_exp: 799999 }, expected: 'refused' });
    edge('jue', 'fighting', { fighting: true, expected: 'refused' });
    edge('jue', 'unarmed', { unarmed: true, expected: 'refused' });
    for (const nothing of [false, true]) {
        edge('difficult_level', nothing ? 'nothing' : 'normal', { nothing });
        edge('valid_learn', nothing ? 'nothing' : 'normal', { nothing });
    }
    edge('valid_learn', 'int38', { properties: { int: 38 }, expected: 'refused' });
    for (const [suffix, character] of [['ruthless', '心狠手辣'], ['devious', '阴险奸诈'], ['upright', '光明磊落']])
        edge('valid_learn', suffix, { properties: { character }, expected: 'refused' });
    for (const sword of [99, 199]) edge('valid_learn', 'basic' + sword, { skills: { sword }, expected: 'refused' });
    edge('valid_learn', 'unarmed', { unarmed: true, expected: 'refused' });
    edge('valid_learn', 'normal-low-attributes', { properties: { con: 35, dex: 35 } });
    for (const [con, dex] of [[35, 35], [36, 35], [35, 36]]) edge('valid_learn', `nothing-con${con}-dex${dex}`,
        { nothing: true, properties: { con, dex }, expected: con === 35 && dex === 35 ? 'refused' : 'observed' });
    edge('research', 'skill179', { level: 179, expected: 'refused' });
    edge('research', 'potential0', { properties: { potential: 0 }, expected: 'refused' });
    edge('research', 'exp799999', { properties: { combat_exp: 799999 }, expected: 'refused' });
    edge('research', 'jing24', { properties: { jing: 24 }, expected: 'refused' });
    edge('research', 'neili0', { properties: { neili: 0 } });
    return result;
}

// Mirrors integer arithmetic for checking progress bounds, not for replacing gameplay.
export function learnedGain(amount, level, cognition) {
    return 1 + Math.trunc((amount + Math.trunc(amount * cognition / 500)) * 100 / (level + 100));
}

export function validateHuashanLearningRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    const points = skill => (after.learned[skill] ?? 0) - (before.learned[skill] ?? 0);
    assert.equal(before.nothing, p.actor.properties['can_learn/dugu-jiujian/nothing']);
    assert.equal(before.jing, p.actor.properties.jing);
    assert.equal(before.potential, p.actor.properties.potential);
    assert.equal(before.learned_points, 0);
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.deepEqual(after.skills, before.skills, '本轮从零进度开始，不应升整级');
    assert.equal(after.potential, before.potential);
    assert.equal(after.nothing, before.nothing);
    assert.deepEqual(raw.immediate[1], raw.before[1], '非战斗学习不得影响旁观角色');
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability);
        assert.equal(raw.interfaces[0].object, '/kungfu/skill/dugu-jiujian');
        assert.equal(raw.interfaces[0].result, p.ability === 'difficult_level' ? 600 : p.expected === 'observed' ? 1 : 0);
        // The host notify_fail sefun stores its message in temporary player data.
        const actual = structuredClone(after), original = structuredClone(before);
        delete actual.temp.notify_fail;
        delete original.temp.notify_fail;
        assert.deepEqual(actual, original, '除原拒绝提示外，查询不应改变玩家状态');
        assert.equal(raw.launches.length, 0);
        return;
    }
    if (raw.outcome === 'refused') {
        assert.equal(raw.launches.length, 0);
        assert.equal(after.neili, before.neili);
        assert.equal(after.learned_points, 0);
        assert.deepEqual(after.learned, before.learned);
        assert.equal(after.jing, p.ability === 'research' && condition.id.endsWith('-jing24') ? 0 : before.jing);
        assert.ok(raw.reason.length > 0);
        return;
    }
    const level = before.skills['dugu-jiujian'], cognition = before.skills['martial-cognize'];
    if (p.ability === 'jue') {
        assert.equal(raw.launches.length, 1);
        assert.equal(raw.launches[0].skill, 'dugu-jiujian');
        assert.ok(before.neili - after.neili >= 50 && before.neili - after.neili <= 79);
        const jingCost = Math.max(30, 80 - before.int), remaining = before.jing - jingCost;
        assert.equal(after.jing, remaining >= 0 ? remaining : -1, '原receive_damage将负余额设为-1');
        assert.equal(after.learned_points, 0);
        const minimum = learnedGain(10, level, cognition);
        const maximum = learnedGain(10 + Math.trunc((before.int - 1) / 2), level, cognition);
        assert.ok(points('sword') >= minimum && points('sword') <= maximum);
        // perform rolls against query_skill(skill) WITHOUT raw-level flag: at
        // L200 this special skill reports 100, so this bonus is not guaranteed.
        const extra = learnedGain(1, level, cognition);
        const bonus = points('dugu-jiujian') - points('sword');
        assert.ok((before.effective_skills['dugu-jiujian'] >= 120 ? [extra] : [0, extra]).includes(bonus));
        assert.ok(after.busy >= 0 && after.busy <= 2);
    } else {
        assert.equal(raw.launches.length, 0);
        assert.equal(after.neili, before.neili);
        assert.equal(before.jing - after.jing, Math.trunc(1000 / before.int));
        assert.equal(after.learned_points, 1);
        assert.equal(points('sword'), 0);
        // Related basics: sword and parry. Default scale starts 80,120.
        let improve = level * 200 / (level >= 500 ? 2 : 1);
        improve = Math.trunc(Math.trunc(improve / 15) / 700);
        improve += Math.trunc(level / 50) + Math.trunc((before.int / (level >= 500 ? 6 : 12)) ** 2);
        assert.ok(points('dugu-jiujian') >= 1 && points('dugu-jiujian') <= learnedGain(improve - 1, level, cognition));
    }
}
