// Emei's original learning/capacity interfaces and research command; not a game implementation.
import assert from 'node:assert/strict';

export const emeiForces = ['emei-xinfa', 'linji-zhuang', 'emei-jiuyang'];
export const emeiKnowledge = ['mahayana', 'buddhism'];
export const emeiCultivationFields = ['sex', 'guilty', 'emei-jiuyang', 'improve/neili', 'breakup',
    'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name'];
// Keep the uncovered legacy branches explicit; never manufacture a loadable game skill.
export const emeiCultivationPending = ['valid_learn', 'research'].map(ability => ({
    skill: 'emei-jiuyang', ability, dependency: 'yinyang-shiertian', status: 'unmeasured_legacy_state',
    sources: ['kungfu/skill/emei-jiuyang.c', 'feature/skill.c'],
    reason: '同名主技能.c/.lpc不存在，原set_skill不能授予；可能为历史存档检查，不推定应删除，也不补假技能。遗留状态分支未实测。',
}));
const capacityFunctions = ['query_neili_limit', 'query_current_neili_limit'];

// Expected values only: real samples must still call the unmodified LPC interfaces.
export function emeiForceBonus(skill, level, properties = {}) {
    assert.ok(emeiForces.includes(skill));
    if (skill === 'emei-xinfa' || skill === 'linji-zhuang' && properties.sex) return 0;
    const factor = skill === 'linji-zhuang' ? 21 : 15;
    return Math.trunc(Math.trunc(level * level * 15 * factor / 100) / 200)
        + (skill === 'linji-zhuang' ? 500 : 0);
}

export function emeiForceCapacity(actor, current) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const eligible = current ? [actor.mappings.force].filter(Boolean) : emeiForces.filter(k => s[k]);
    let value = Math.max(base, ...eligible.map(k => base + s[k] * 10 + emeiForceBonus(k, s[k], p)));
    value += Math.trunc(value * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) value += 500;
    return value;
}

export function emeiResearchBound(p) {
    assert.ok(emeiForces.includes(p.skill));
    const s = p.actor.skills, props = p.actor.properties, level = s[p.skill];
    // Emei Jiuyang's action text has no numerical force/damage/attack/parry/dodge coefficients.
    const related = [s.force, ...[...emeiForces, 'huashan-xinfa'].filter(k => k !== p.skill && s[k]).map(k => s[k])];
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let value = related.sort((a, b) => b - a).reduce((sum, n, i) =>
        sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    value = Math.trunc(Math.trunc(value / 15) / 100);
    value += Math.trunc(level / 50) + Math.trunc((props.int / (level >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) value += Math.trunc(value * 30 / 100);
    if (props['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    return 1 + Math.trunc((value - 1) * 100 / (level + 100));
}

export function emeiCultivationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少峨嵋修养源码：' + skill);
        const research = ability === 'research', knowledge = emeiKnowledge.includes(skill);
        const expected = extra.expected ?? (ability === 'practice_skill' || research && knowledge ? 'refused' : 'observed');
        const actor = {
            skills: { force: level, mahayana: Math.max(200, level), [skill]: level, ...extra.skills },
            mappings: extra.unmapped || knowledge ? {} : { force: extra.mapping ?? skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                int: 36, con: 36, shen: 200000, gender: '女性', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '峨嵋派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const times = extra.times ?? 1;
        result.push({ id: `school-emei-cultivation-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : 'interface',
            samples: research && expected === 'observed' ? (smoke ? 2 : samples) : (smoke ? 1 : 2),
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-cultivation',
                combination: extra.suffix ?? 'single-skill', skill, usage: knowledge ? 'knowledge' : 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: research ? `research ${skill} ${times}` : 'test_interface',
                ...(!research ? { interface: { object: capacityFunctions.includes(ability) ? 'player' : '/kungfu/skill/' + skill, function: ability } } : {}),
                repetitions: times, completed: extra.completed ?? (research && expected === 'observed' ? times : 0),
                command_return: extra.commandReturn ?? (research && expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false, observation: 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: 0, expected, not_applicable: '',
                qualification_sources: [...new Set([source.path,
                    ...[...emeiForces, ...emeiKnowledge, 'force', 'jiuyang-shengong', 'huashan-xinfa'].map(k => `kungfu/skill/${k}.c`),
                    'kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h',
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'clone/user/user.c'])],
                qualification_note: '真实非巫师USER，原技能/USER接口及research命令。女性、技能和资源为实验赋值，不代表自然师承；临济女性资格、sex属性和大乘200级分界独立，峨嵋九阳普通属性错读保留原状。兼修取最大容量而非相加，查询不调整max_neili；知识拒绝研究不等于不可学习。大乘无practice_skill独立实现，不虚构其练习入口。',
            } });
    }
    for (const skill of [...emeiForces, ...emeiKnowledge]) for (const level of [200, 400, 800]) {
        for (const ability of ['valid_learn', 'type', 'valid_learn_level', 'difficult_level', 'research']) add(skill, ability, level);
        if (skill !== 'mahayana') add(skill, 'practice_skill', level);
        if (emeiForces.includes(skill)) {
            for (const ability of ['query_neili_improve', ...capacityFunctions]) add(skill, ability, level);
            add(skill, 'research', level, { suffix: '-all-forces', skills: Object.fromEntries(emeiForces.map(k => [k, level])) });
        }
    }
    for (const skill of emeiForces) {
        for (const level of [499, 500]) add(skill, 'research', level);
        add(skill, 'research', 200, { suffix: '-neili0', properties: { neili: 0 } });
        add(skill, 'research', 200, { suffix: '-times100', times: 100 });
        add(skill, 'research', 200, { suffix: '-partial', times: 3, completed: 2, clearJing: true, properties: { jing: 60 } });
        const edge = (suffix, extra) => add(skill, 'research', 200, { suffix: '-' + suffix, expected: 'refused', ...extra });
        edge('busy', { busy: true }); edge('fighting', { fighting: true });
        edge('skill179', { skills: { [skill]: 179 } });
        edge('potential0', { properties: { potential: 0 } });
        edge('exp799999', { properties: { combat_exp: 799999 }, commandReturn: 1 });
        edge('jing26', { properties: { jing: 26 }, commandReturn: 1, clearJing: true });
        edge('eff-jing26', { properties: { jing: 26, eff_jing: 26 } });
        edge('no-learn', { properties: { 'env/no_learn': skill } });
        edge('huashan-known', { skills: { 'huashan-xinfa': 200 },
            expected: skill === 'emei-jiuyang' ? 'observed' : 'refused', commandReturn: skill === 'emei-jiuyang' ? 1 : 0 });
        for (const [suffix, properties] of [['guimai', { 'special_skill/guimai': 1 }], ['wuxing', { 'special_skill/wuxing': 1 }],
            ['both', { 'special_skill/guimai': 1, 'special_skill/wuxing': 1 }]]) add(skill, 'research', 200, { suffix: '-' + suffix, properties });
    }
    const learn = (skill, suffix, extra = {}) => add(skill, 'valid_learn', extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const force of [9, 10]) learn('emei-xinfa', 'force' + force, { skills: { force }, expected: force < 10 ? 'refused' : 'observed' });
    learn('emei-xinfa', 'eunuch-low-resources', { properties: { gender: '无性', max_neili: 0, neili: 0, con: 1 } });
    for (const force of [39, 40]) for (const ability of ['valid_learn', 'research']) add('linji-zhuang', ability, 200, {
        suffix: '-force' + force, skills: { force }, expected: force < 40 ? 'refused' : 'observed',
    });
    for (const gender of ['男性', '无性']) for (const ability of ['valid_learn', 'research']) add('linji-zhuang', ability, 200, {
        suffix: gender === '男性' ? '-male' : '-eunuch', properties: { gender }, expected: 'refused',
    });
    for (const [level, mahayana] of [[100, 100], [100, 101], [199, 198], [199, 199], [199, 200], [200, 199], [200, 200], [800, 200]]) {
        for (const ability of level < 180 ? ['valid_learn'] : ['valid_learn', 'research']) add('linji-zhuang', ability, level, {
            suffix: '-mahayana' + mahayana, skills: { mahayana }, expected: mahayana <= level && mahayana < 200 ? 'refused' : 'observed',
        });
    }
    for (const ability of ['valid_learn', 'research']) add('linji-zhuang', ability, 200, { suffix: '-sex', properties: { sex: 1 } });
    for (const level of [200, 400, 800]) for (const ability of ['query_neili_improve', ...capacityFunctions]) add('linji-zhuang', ability, level, {
        suffix: '-sex', properties: { sex: 1 },
    });
    for (const force of [99, 100]) for (const ability of ['valid_learn', 'research']) add('emei-jiuyang', ability, 200, {
        suffix: '-force' + force, skills: { force }, expected: force < 100 ? 'refused' : 'observed',
    });
    for (const con of [33, 34]) for (const ability of ['valid_learn', 'research']) add('emei-jiuyang', ability, 200, {
        suffix: '-con' + con, properties: { con }, expected: con < 34 ? 'refused' : 'observed',
    });
    for (const max_neili of [1199, 1200]) for (const ability of ['valid_learn', 'research']) add('emei-jiuyang', ability, 200, {
        suffix: '-maxneili' + max_neili, properties: { max_neili, neili: max_neili }, expected: max_neili < 1200 ? 'refused' : 'observed',
    });
    for (const ability of ['valid_learn', 'research']) add('emei-jiuyang', ability, 200, {
        suffix: '-known-jiuyang-shengong', skills: { 'jiuyang-shengong': 1 }, expected: 'refused',
    });
    for (const level of [9, 10, 200, 800]) learn('emei-jiuyang', 'eunuch-no-attribute', {
        level, skills: { force: 100 }, properties: { gender: '无性' },
    });
    for (const attribute of [9, 10]) for (const ability of ['valid_learn', 'research']) add('emei-jiuyang', ability, 200, {
        suffix: '-eunuch-attribute' + attribute, properties: { gender: '无性', 'emei-jiuyang': attribute }, expected: attribute > 9 ? 'refused' : 'observed',
    });
    add('emei-jiuyang', 'research', 200, { suffix: '-eunuch-no-attribute', properties: { gender: '无性' } });
    learn('emei-jiuyang', 'female-attribute10', { properties: { 'emei-jiuyang': 10 } });
    for (const guilty of [0, 1]) learn('buddhism', 'guilty' + guilty, { properties: { guilty }, expected: guilty ? 'refused' : 'observed' });
    for (const shen of [-1, 0, 1]) learn('mahayana', shen < 0 ? 'evil1' : 'shen' + shen, {
        properties: { shen }, expected: shen < 0 ? 'refused' : 'observed',
    });
    for (const ability of capacityFunctions) {
        for (const mapping of [...emeiForces, null]) add('linji-zhuang', ability, 400, {
            suffix: '-all-' + (mapping ?? 'unmapped'), mapping, unmapped: !mapping,
            skills: Object.fromEntries(emeiForces.map(k => [k, 400])),
        });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze', { class: 'bonze' }], ['bonze-other-family', { class: 'bonze', 'family/family_name': '武当派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1, class: 'bonze' }]])
            add('linji-zhuang', ability, 400, { suffix: '-' + suffix, properties });
        add('emei-xinfa', ability, 201);
    }
    return result;
}

export function emeiCultivationInterface(p) {
    const knowledge = emeiKnowledge.includes(p.skill);
    switch (p.ability) {
    case 'valid_learn': return Number(p.expected === 'observed');
    case 'type': return knowledge ? 'knowledge' : 'martial';
    case 'valid_learn_level': return knowledge ? 999 : 200;
    case 'difficult_level': case 'practice_skill': return 0;
    case 'query_neili_improve': return emeiForceBonus(p.skill, p.actor.skills[p.skill], p.actor.properties);
    default:
        assert.ok(capacityFunctions.includes(p.ability));
        return emeiForceCapacity(p.actor, p.ability === 'query_current_neili_limit');
    }
}

export function validateEmeiCultivationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-cultivation');
    assert.ok([...emeiForces, ...emeiKnowledge].includes(p.skill));
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2);
    for (const key of ['attacks', 'launches', 'interfaces']) assert.ok(Array.isArray(raw[key]));
    const [before, target] = raw.before, [after, finalTarget] = raw.immediate;
    assert.equal(raw.outcome, p.expected); assert.equal(before.weapon, 'none');
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.equal(before.userp, 1); assert.equal(before.interactive, 1); assert.equal(before.wizardp, 0);
    assert.ok(Object.hasOwn(before, 'busy'), '缺少忙乱观察');
    assert.equal(before.busy === null ? 0 : before.busy, p.actor.busy ?? 0);
    assert.deepEqual(before.skills, p.actor.skills); assert.deepEqual(before.mappings, p.actor.mappings);
    assert.deepEqual(finalTarget, target);
    for (const key of ['int', 'con', 'shen', 'jing', 'eff_jing', 'gender', 'combat_exp', 'potential', 'learned_points', 'neili', 'max_neili'])
        assert.equal(before[key], p.actor.properties[key], key);
    for (const key of emeiCultivationFields) {
        assert.ok(Object.hasOwn(before.cultivation, key), '缺少原始修养字段：' + key);
        assert.equal(before.cultivation[key] ?? 0, p.actor.properties[key] ?? 0, key);
    }
    assert.deepEqual(after.cultivation, before.cultivation);
    assert.deepEqual(after.skills, before.skills, '本批不跨级'); assert.deepEqual(after.mappings, before.mappings);
    for (const key of ['neili', 'max_neili', 'potential', 'qi', 'eff_qi', 'eff_jing']) assert.equal(after[key], before[key]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const r = raw.interfaces[0];
        assert.equal(r.function, p.ability); assert.equal(r.object, p.interface.object);
        assert.ok(Object.hasOwn(r, 'result')); assert.equal(r.result ?? 0, emeiCultivationInterface(p));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b); return;
    }
    assert.equal(condition.method, 'research');
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return);
    assert.equal(after.learned_points - before.learned_points, p.completed);
    assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
    const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * emeiResearchBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    for (const skill of Object.keys(before.skills).filter(k => k !== p.skill))
        assert.equal(after.learned[skill] ?? 0, before.learned[skill] ?? 0);
}
