// Original USER queries and research command; no substituted game rules.
import assert from 'node:assert/strict';

export const wudangForces = ['wudang-xinfa', 'wudang-jiuyang', 'taiji-shengong'];
export const wudangKnowledge = ['taoism', 'wudang-yaoli'];
const capacityFunctions = ['query_neili_limit', 'query_current_neili_limit'];

export function wudangForceBonus(skill, level) {
    const multiplier = skill === 'wudang-jiuyang' ? 15 : skill === 'taiji-shengong' ? 18 : 0;
    return Math.trunc(Math.trunc(level * level * 15 * multiplier / 100) / 200);
}

export function wudangForceCapacity(actor, current) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const eligible = current ? [actor.mappings.force].filter(Boolean) : wudangForces.filter(k => s[k]);
    let value = Math.max(base, ...eligible.map(k => base + s[k] * 10 + wudangForceBonus(k, s[k])));
    value += Math.trunc(value * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) value += 500;
    return value;
}

export function wudangResearchBound(p) {
    const s = p.actor.skills, props = p.actor.properties, level = s[p.skill];
    // Jiuyang's two random actions both omit all five numerical coefficients.
    const related = [s.force, ...[...wudangForces, 'huashan-xinfa'].filter(k => k !== p.skill && s[k]).map(k => s[k])];
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let value = related.sort((a, b) => b - a).reduce((sum, n, i) => sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    value = Math.trunc(Math.trunc(value / 15) / 100);
    value += Math.trunc(level / 50) + Math.trunc((props.int / (level >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) value += Math.trunc(value * 30 / 100);
    if (props['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    return 1 + Math.trunc((value - 1) * 100 / (level + 100));
}

export function wudangCultivationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const research = ability === 'research', knowledge = wudangKnowledge.includes(skill);
        const expected = extra.expected ?? (ability === 'practice_skill' || (research && knowledge) ? 'refused' : 'observed');
        const actor = {
            skills: { force: level, medical: Math.max(100, level), taoism: Math.max(320, level), [skill]: level, ...extra.skills },
            mappings: extra.unmapped || knowledge ? {} : { force: extra.mapping ?? skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                int: 36, con: 36, gender: '男性', combat_exp: 100000000, potential: 10000,
                learned_points: 0, 'family/family_name': '武当派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const times = extra.times ?? 1;
        result.push({ id: `school-wudang-cultivation-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : 'interface',
            samples: smoke ? 2 : research && expected === 'observed' ? samples : 2,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-cultivation',
                combination: extra.suffix ?? 'single-skill', skill, usage: knowledge ? 'knowledge' : 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: research ? `research ${skill} ${times}` : 'test_interface',
                ...(!research ? { interface: { object: capacityFunctions.includes(ability) ? 'player' : '/kungfu/skill/' + skill, function: ability } } : {}),
                repetitions: times, completed: extra.completed ?? (research && expected === 'observed' ? times : 0),
                command_return: extra.commandReturn ?? (research && expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false, observation: 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '', expected,
                qualification_sources: [...new Set([source.path,
                    ...[...wudangForces, ...wudangKnowledge, 'force', 'medical', 'jiuyang-shengong', 'huashan-xinfa'].map(k => `kungfu/skill/${k}.c`),
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'clone/user/user.c'])],
                qualification_note: '真实非巫师USER、原research及原查询接口。技能/资源为实验资格，不证明师承可获得；五技能分别记录学习资格、类型、直接practice接口和研究。内力上限不改变max_neili；兼修取原USER最大值，不相加。武当九阳无性限制保留原query属性取值，通过普通属性与真实技能等级的对照留证，不修源码。无修养/房间加成，未设置项默认零；原始随机保留。',
            } });
    }
    for (const skill of [...wudangForces, ...wudangKnowledge]) {
        for (const level of [200, 400, 800]) {
            for (const ability of ['valid_learn', 'type', 'valid_learn_level', 'difficult_level', 'practice_skill', 'research']) add(skill, ability, level);
            if (wudangForces.includes(skill)) {
                for (const ability of ['query_neili_improve', ...capacityFunctions]) add(skill, ability, level);
                add(skill, 'research', level, { suffix: '-all-forces', skills: Object.fromEntries(wudangForces.map(k => [k, level])) });
            }
        }
    }
    for (const skill of wudangForces) {
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
        edge('huashan-known', { skills: { 'huashan-xinfa': 200 }, expected: skill === 'wudang-jiuyang' ? 'observed' : 'refused', commandReturn: skill === 'wudang-jiuyang' ? 1 : 0 });
        for (const [suffix, properties] of [['guimai', { 'special_skill/guimai': 1 }], ['wuxing', { 'special_skill/wuxing': 1 }],
            ['both', { 'special_skill/guimai': 1, 'special_skill/wuxing': 1 }]]) add(skill, 'research', 200, { suffix: '-' + suffix, properties });
    }
    const learn = (skill, suffix, extra) => add(skill, 'valid_learn', extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const force of [9, 10]) learn('wudang-xinfa', 'force' + force, { skills: { force }, expected: force === 9 ? 'refused' : 'observed' });
    learn('wudang-xinfa', 'eunuch-low-resources', { properties: { gender: '无性', max_neili: 0, con: 1 } });
    for (const skill of ['taiji-shengong', 'wudang-jiuyang']) {
        for (const force of [99, 100]) learn(skill, 'force' + force, { skills: { force }, expected: force === 99 ? 'refused' : 'observed' });
        learn(skill, 'female', { properties: { gender: '女性' } });
    }
    for (const con of [33, 34]) learn('wudang-jiuyang', 'con' + con, { properties: { con }, expected: con === 33 ? 'refused' : 'observed' });
    for (const max_neili of [1199, 1200]) learn('wudang-jiuyang', 'maxneili' + max_neili, { properties: { max_neili }, expected: max_neili === 1199 ? 'refused' : 'observed' });
    learn('wudang-jiuyang', 'main-known', { skills: { 'jiuyang-shengong': 1 }, expected: 'refused' });
    add('wudang-jiuyang', 'research', 200, { suffix: '-main-known', skills: { 'jiuyang-shengong': 1 }, expected: 'refused' });
    for (const level of [9, 10, 200, 800]) learn('wudang-jiuyang', 'eunuch-no-attribute', { level, skills: { force: 100 }, properties: { gender: '无性' } });
    for (const attribute of [9, 10]) for (const ability of ['valid_learn', 'research']) add('wudang-jiuyang', ability, 200, {
        suffix: '-eunuch-attribute' + attribute, properties: { gender: '无性', 'wudang-jiuyang': attribute }, expected: attribute === 10 ? 'refused' : 'observed',
    });
    add('wudang-jiuyang', 'research', 200, { suffix: '-eunuch-no-attribute', properties: { gender: '无性' } });
    for (const skill of ['taiji-shengong', 'taoism']) for (const level of [19, 20]) learn(skill, 'eunuch', {
        level, skills: { force: 100 }, properties: { gender: '无性' }, expected: level === 20 ? 'refused' : 'observed',
    });
    for (const taoism of [99, 100, 199, 200, 319, 320]) learn('taiji-shengong', 'taoism' + taoism, {
        level: taoism < 199 ? 100 : taoism < 319 ? 200 : 400, skills: { taoism }, expected: [99, 199, 319].includes(taoism) ? 'refused' : 'observed',
    });
    learn('taiji-shengong', 'taoism320', { level: 800, skills: { taoism: 320 } });
    for (const medical of [99, 100, 199, 200, 319, 320]) learn('wudang-yaoli', 'medical' + medical, {
        level: medical < 199 ? 1 : medical < 319 ? 200 : 400, skills: { medical }, expected: [99, 199, 319, 320].includes(medical) ? 'refused' : 'observed',
    });
    learn('wudang-yaoli', 'medical400', { level: 400, skills: { medical: 400 } });
    for (const ability of capacityFunctions) {
        for (const mapping of [...wudangForces, null]) add('taiji-shengong', ability, 400, {
            suffix: '-all-' + (mapping ?? 'unmapped'), mapping, unmapped: !mapping,
            skills: Object.fromEntries(wudangForces.map(k => [k, 400])),
        });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze', { class: 'bonze', 'family/family_name': '少林派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1 }]])
            add('taiji-shengong', ability, 400, { suffix: '-' + suffix, properties });
        add('wudang-xinfa', ability, 201);
    }
    return result;
}

export function wudangCultivationInterface(p) {
    const knowledge = wudangKnowledge.includes(p.skill);
    switch (p.ability) {
    case 'valid_learn': return Number(p.expected === 'observed');
    case 'type': return knowledge ? 'knowledge' : 'martial';
    case 'valid_learn_level': return knowledge ? 999 : 200;
    case 'difficult_level': case 'practice_skill': return 0;
    case 'query_neili_improve': return wudangForceBonus(p.skill, p.actor.skills[p.skill]);
    default:
        assert.ok(capacityFunctions.includes(p.ability));
        return wudangForceCapacity(p.actor, p.ability === 'query_current_neili_limit');
    }
}

export function validateWudangCultivationRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(before.weapon, 'none'); assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.deepEqual(raw.before[1], raw.immediate[1]);
    for (const key of ['int', 'con', 'jing', 'eff_jing', 'gender', 'combat_exp', 'potential', 'learned_points']) assert.equal(before[key], p.actor.properties[key]);
    for (const key of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name', 'wudang-jiuyang'])
        assert.equal(before.cultivation[key] ?? 0, p.actor.properties[key] ?? 0);
    assert.deepEqual(after.cultivation, before.cultivation);
    assert.deepEqual(after.skills, before.skills, '本批无跨级样本');
    for (const key of ['neili', 'max_neili', 'potential', 'qi', 'eff_jing']) assert.equal(after[key], before[key]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability); assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.ok(Object.hasOwn(raw.interfaces[0], 'result'));
        assert.equal(raw.interfaces[0].result ?? 0, wudangCultivationInterface(p));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b); return;
    }
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return);
    assert.equal(after.learned_points - before.learned_points, p.completed);
    assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
    const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * wudangResearchBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    for (const skill of Object.keys(before.skills).filter(k => k !== p.skill)) assert.equal(after.learned[skill] ?? 0, before.learned[skill] ?? 0);
}
