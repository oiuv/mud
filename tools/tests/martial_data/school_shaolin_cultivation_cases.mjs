// Read original skill/USER interfaces and run original research; never replace game rules.
import assert from 'node:assert/strict';

export const shaolinForces = ['shaolin-xinfa', 'hunyuan-yiqi', 'yijinjing', 'shaolin-jiuyang'];
export const shaolinCultivationFields = ['sex', 'guilty', 'couple/have_couple', 'shaolin-jiuyang',
    'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing',
    'class', 'family/family_name'];
const capacityFunctions = ['query_neili_limit', 'query_current_neili_limit'];

export function shaolinForceBonus(skill, level, properties = {}) {
    if (skill === 'hunyuan-yiqi' && properties.sex) return 0;
    const coefficient = ['hunyuan-yiqi', 'yijinjing'].includes(skill) ? 21 : skill === 'shaolin-jiuyang' ? 15 : 0;
    return Math.trunc(Math.trunc(level * level * 15 * coefficient / 100) / 200);
}

export function shaolinForceCapacity(actor, current) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const eligible = current ? [actor.mappings.force].filter(Boolean) : shaolinForces.filter(k => s[k]);
    let value = Math.max(base, ...eligible.map(k => base + s[k] * 10 + shaolinForceBonus(k, s[k], p)));
    value += Math.trunc(value * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) value += 500;
    return value;
}

export function shaolinResearchBound(p) {
    const s = p.actor.skills, props = p.actor.properties, level = s[p.skill];
    // Shaolin Jiuyang actions have no numerical force/damage/attack/parry/dodge coefficients.
    const related = [s.force, ...[...shaolinForces, 'huashan-xinfa'].filter(k => k !== p.skill && s[k]).map(k => s[k])];
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let value = related.sort((a, b) => b - a).reduce((sum, n, i) => sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    value = Math.trunc(Math.trunc(value / 15) / 100);
    value += Math.trunc(level / 50) + Math.trunc((props.int / (level >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) value += Math.trunc(value * 30 / 100);
    if (props['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    return 1 + Math.trunc((value - 1) * 100 / (level + 100));
}

export function shaolinCultivationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const research = ability === 'research', knowledge = skill === 'buddhism';
        const expected = extra.expected ?? (ability === 'practice_skill' || (research && knowledge) ? 'refused' : 'observed');
        const actor = {
            skills: { force: level, buddhism: Math.max(300, level), [skill]: level, ...extra.skills },
            mappings: extra.unmapped || knowledge ? {} : { force: extra.mapping ?? skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                int: 36, con: 36, gender: '男性', combat_exp: 100000000, potential: 10000,
                learned_points: 0, 'family/family_name': '少林派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const times = extra.times ?? 1;
        result.push({ id: `school-shaolin-cultivation-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : 'interface',
            samples: research && expected === 'observed' ? (smoke ? 2 : samples) : (smoke ? 1 : 2),
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-cultivation',
                combination: extra.suffix ?? 'single-skill', skill, usage: knowledge ? 'knowledge' : 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: research ? `research ${skill} ${times}` : 'test_interface',
                ...(!research ? { interface: { object: capacityFunctions.includes(ability) ? 'player' : '/kungfu/skill/' + skill, function: ability } } : {}),
                repetitions: times, completed: extra.completed ?? (research && expected === 'observed' ? times : 0),
                command_return: extra.commandReturn ?? (research && expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false, observation: 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: 0, not_applicable: '', expected,
                qualification_sources: [...new Set([source.path,
                    ...[...shaolinForces, 'buddhism', 'force', 'jiuyang-shengong', 'huashan-xinfa'].map(k => `kungfu/skill/${k}.c`),
                    'inherit/skill/force.c', 'inherit/skill/skill.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'clone/user/user.c'])],
                qualification_note: '真实非巫师USER、原research和原技能/USER查询。资格为实验赋值，不证明NPC自然授课；原随机和兼修许可不变。混元sex、婚配、犯戒分别观察；少林九阳同名普通属性与实际技能等级分开留证，不修其错误。内力上限为查询，不修改max_neili；不将禅宗拒绝研究视为没有学习价值。',
            } });
    }
    for (const skill of [...shaolinForces, 'buddhism']) for (const level of [200, 400, 800]) {
        for (const ability of ['valid_learn', 'type', 'valid_learn_level', 'difficult_level', 'practice_skill', 'research']) add(skill, ability, level);
        if (shaolinForces.includes(skill)) {
            for (const ability of ['query_neili_improve', ...capacityFunctions]) add(skill, ability, level);
            add(skill, 'research', level, { suffix: '-all-forces', skills: Object.fromEntries(shaolinForces.map(k => [k, level])) });
        }
    }
    for (const skill of shaolinForces) {
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
        edge('huashan-known', { skills: { 'huashan-xinfa': 200 }, expected: skill === 'shaolin-jiuyang' ? 'observed' : 'refused', commandReturn: skill === 'shaolin-jiuyang' ? 1 : 0 });
        for (const [suffix, properties] of [['guimai', { 'special_skill/guimai': 1 }], ['wuxing', { 'special_skill/wuxing': 1 }],
            ['both', { 'special_skill/guimai': 1, 'special_skill/wuxing': 1 }]]) add(skill, 'research', 200, { suffix: '-' + suffix, properties });
    }
    const learn = (skill, suffix, extra) => add(skill, 'valid_learn', extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const force of [9, 10]) learn('shaolin-xinfa', 'force' + force, { skills: { force }, expected: force === 9 ? 'refused' : 'observed' });
    learn('shaolin-xinfa', 'eunuch-low-resources', { properties: { gender: '无性', max_neili: 0, con: 1 } });
    for (const [skill, minimum] of [['hunyuan-yiqi', 30], ['yijinjing', 100], ['shaolin-jiuyang', 100]]) {
        for (const force of [minimum - 1, minimum]) learn(skill, 'force' + force, {
            level: minimum, skills: { force }, expected: force < minimum ? 'refused' : 'observed',
        });
    }
    for (const skill of ['hunyuan-yiqi', 'yijinjing']) {
        for (const force of [199, 200]) learn(skill, 'force' + force, { skills: { force }, expected: force < 200 ? 'refused' : 'observed' });
        add(skill, 'research', 200, { suffix: '-force199', skills: { force: 199 }, expected: 'refused' });
    }
    for (const skill of [...shaolinForces, 'buddhism']) for (const gender of ['女性', '无性']) learn(skill, gender === '女性' ? 'female' : 'eunuch', {
        properties: { gender }, expected: ['hunyuan-yiqi', 'yijinjing'].includes(skill) ? 'refused' : 'observed',
    });
    for (const [level, buddhism] of [[200, 199], [200, 200], [400, 299], [400, 300], [800, 300]]) {
        const expected = buddhism < 300 && buddhism < level ? 'refused' : 'observed';
        for (const ability of ['valid_learn', 'research']) add('hunyuan-yiqi', ability, level, {
            suffix: '-buddhism' + buddhism, skills: { buddhism }, expected,
        });
    }
    for (const skill of ['hunyuan-yiqi', 'buddhism']) for (const guilty of [0, 1]) learn(skill, 'guilty' + guilty, {
        properties: { guilty }, expected: guilty ? 'refused' : 'observed',
    });
    for (const [suffix, properties] of [['married', { 'couple/have_couple': 1 }], ['sex', { sex: 1 }], ['guilty', { guilty: 1 }]]) {
        for (const ability of ['valid_learn', 'research']) add('hunyuan-yiqi', ability, 200, {
            suffix: '-' + suffix, properties, expected: suffix === 'sex' ? 'observed' : 'refused',
        });
    }
    for (const skill of ['shaolin-xinfa', 'yijinjing', 'shaolin-jiuyang', 'buddhism']) learn(skill, 'married-sex', {
        properties: { 'couple/have_couple': 1, sex: 1 },
    });
    for (const con of [33, 34]) learn('shaolin-jiuyang', 'con' + con, { properties: { con }, expected: con < 34 ? 'refused' : 'observed' });
    for (const max_neili of [1199, 1200]) learn('shaolin-jiuyang', 'maxneili' + max_neili, { properties: { max_neili }, expected: max_neili < 1200 ? 'refused' : 'observed' });
    for (const ability of ['valid_learn', 'research']) add('shaolin-jiuyang', ability, 200, {
        suffix: '-main-known', skills: { 'jiuyang-shengong': 1 }, expected: 'refused',
    });
    for (const level of [9, 10, 200, 800]) learn('shaolin-jiuyang', 'eunuch-no-attribute', { level, skills: { force: 100 }, properties: { gender: '无性' } });
    for (const attribute of [9, 10]) for (const ability of ['valid_learn', 'research']) add('shaolin-jiuyang', ability, 200, {
        suffix: '-eunuch-attribute' + attribute, properties: { gender: '无性', 'shaolin-jiuyang': attribute }, expected: attribute > 9 ? 'refused' : 'observed',
    });
    add('shaolin-jiuyang', 'research', 200, { suffix: '-eunuch-no-attribute', properties: { gender: '无性' } });
    for (const ability of capacityFunctions) {
        for (const mapping of [...shaolinForces, null]) add('yijinjing', ability, 400, {
            suffix: '-all-' + (mapping ?? 'unmapped'), mapping, unmapped: !mapping,
            skills: Object.fromEntries(shaolinForces.map(k => [k, 400])),
        });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze', { class: 'bonze' }], ['bonze-other-family', { class: 'bonze', 'family/family_name': '武当派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1, class: 'bonze' }]])
            add('yijinjing', ability, 400, { suffix: '-' + suffix, properties });
        add('shaolin-xinfa', ability, 201);
    }
    for (const level of [200, 400, 800]) for (const ability of ['query_neili_improve', ...capacityFunctions]) add('hunyuan-yiqi', ability, level, {
        suffix: '-sex', properties: { sex: 1 },
    });
    return result;
}

export function shaolinCultivationInterface(p) {
    const knowledge = p.skill === 'buddhism';
    switch (p.ability) {
    case 'valid_learn': return Number(p.expected === 'observed');
    case 'type': return knowledge ? 'knowledge' : 'martial';
    case 'valid_learn_level': return knowledge ? 999 : 200;
    case 'difficult_level': case 'practice_skill': return 0;
    case 'query_neili_improve': return shaolinForceBonus(p.skill, p.actor.skills[p.skill], p.actor.properties);
    default:
        assert.ok(capacityFunctions.includes(p.ability));
        return shaolinForceCapacity(p.actor, p.ability === 'query_current_neili_limit');
    }
}

export function validateShaolinCultivationRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(raw.outcome, p.expected);
    assert.equal(before.weapon, 'none'); assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.equal(before.userp, 1); assert.equal(before.wizardp, 0);
    assert.deepEqual(before.skills, p.actor.skills); assert.deepEqual(before.mappings, p.actor.mappings);
    assert.deepEqual(raw.before[1], raw.immediate[1]);
    for (const key of ['int', 'con', 'jing', 'eff_jing', 'gender', 'combat_exp', 'potential', 'learned_points', 'neili', 'max_neili'])
        assert.equal(before[key], p.actor.properties[key]);
    for (const key of shaolinCultivationFields) assert.equal(before.cultivation[key] ?? 0, p.actor.properties[key] ?? 0);
    assert.deepEqual(after.cultivation, before.cultivation);
    assert.deepEqual(after.skills, before.skills, '本批无跨级样本');
    assert.deepEqual(after.mappings, before.mappings);
    for (const key of ['neili', 'max_neili', 'potential', 'qi', 'eff_qi', 'eff_jing']) assert.equal(after[key], before[key]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability); assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.ok(Object.hasOwn(raw.interfaces[0], 'result'));
        assert.equal(raw.interfaces[0].result ?? 0, shaolinCultivationInterface(p));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b); return;
    }
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return);
    assert.equal(after.learned_points - before.learned_points, p.completed);
    assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
    const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * shaolinResearchBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    for (const skill of Object.keys(before.skills).filter(k => k !== p.skill)) assert.equal(after.learned[skill] ?? 0, before.learned[skill] ?? 0);
}
