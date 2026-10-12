// Research, learning qualification and real USER capacity queries, never gameplay replacements.
import assert from 'node:assert/strict';

export const quanzhenForces = ['xiantian-gong', 'xuanmen-neigong', 'quanzhen-xinfa'];
const capacityFunctions = ['query_neili_limit', 'query_current_neili_limit'];

export function forceBonus(skill, level, sex = 0) {
    const multiplier = skill === 'xiantian-gong' ? (sex ? 0 : 22) : skill === 'xuanmen-neigong' ? 8 : 0;
    return Math.trunc(Math.trunc(level * level * 15 * multiplier / 100) / 200);
}

export function expectedForceCapacity(actor, current) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const eligible = current ? [actor.mappings.force].filter(Boolean) : quanzhenForces.filter(k => s[k]);
    let value = Math.max(base, ...eligible.map(k => base + s[k] * 10 + forceBonus(k, s[k], p.sex)));
    value += Math.trunc(value * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) value += Math.trunc(value * 4 / 10);
    if (p['special_skill/mystery']) value += p.con * 15;
    if (p['special_skill/guimai']) value += Math.trunc(value * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) value += 500;
    return value;
}

// Only this batch's related skills: basic force/unarmed and non-action-compatible forces.
export function forceResearchBound(p) {
    const s = p.actor.skills, props = p.actor.properties, level = s[p.skill];
    const related = [s.force];
    if (p.skill === 'xiantian-gong' && level >= 180) related.push(s.unarmed);
    for (const k of quanzhenForces) if (k !== p.skill && s[k]) {
        assert.notEqual(k, 'xiantian-gong', '本批不以固定值代替先天功随机招式加成');
        related.push(s[k]);
    }
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let value = related.sort((a, b) => b - a).reduce((sum, n, i) => sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    value = Math.trunc(Math.trunc(value / 15) / (p.skill === 'xiantian-gong' ? 600 : 100));
    value += Math.trunc(level / 50) + Math.trunc((props.int / (level >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) value += Math.trunc(value * 30 / 100);
    if (props['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    return 1 + Math.trunc((value - 1) * 100 / (level + 100));
}

export function quanzhenCultivationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const research = ability === 'research';
        const actor = {
            skills: { force: level, unarmed: level, taoism: Math.max(320, level), [skill]: level, ...extra.skills },
            mappings: extra.unmapped ? {} : { force: extra.mapping ?? skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                int: 36, con: 36, gender: '男性', character: '光明磊落', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '全真教', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const times = extra.times ?? 1, expected = extra.expected ?? 'observed';
        result.push({ id: `school-quanzhen-cultivation-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : 'interface',
            samples: smoke ? 2 : extra.checks ?? (research && expected === 'observed' ? samples : 2),
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-cultivation',
                combination: extra.suffix ?? 'single-force', skill, usage: 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: research ? `research ${skill} ${times}` : 'test_interface',
                ...(!research ? { interface: { object: capacityFunctions.includes(ability) ? 'player' : '/kungfu/skill/' + skill, function: ability } } : {}),
                repetitions: times, completed: extra.completed ?? (expected === 'refused' ? 0 : times),
                command_return: extra.commandReturn ?? (research && expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false,
                observation: 'single_action_immediate', fighting: extra.fighting ?? false,
                observe_seconds: 0, not_applicable: '', expected,
                qualification_sources: [...new Set([source.path, ...quanzhenForces.map(s => `kungfu/skill/${s}.c`),
                    'kungfu/skill/force.c', 'kungfu/skill/huashan-xinfa.c', 'inherit/skill/skill.c',
                    'cmds/skill/research.c', 'cmds/skill/learn.c', 'feature/skill.c', 'clone/user/user.c',
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/wang.c', 'kungfu/class/quanzhen/yin.c'])],
                qualification_note: '真实非巫师USER原research及原学习/内力上限查询；基础内功、拳脚与特殊同级，道学至少320，悟性根骨36、经验1亿为实验资格。默认无修养/转世/房间研究加成。兼修对照只增加无随机招式的相容内功；不以同级代表同培养成本。上限查询不修改max_neili，也不证明可从师父学到该级；所有参数均留证。',
            } });
    }
    for (const skill of quanzhenForces) {
        for (const level of [200, 400, 800]) {
            add(skill, 'research', level);
            const other = skill === 'quanzhen-xinfa' ? 'xuanmen-neigong' : 'quanzhen-xinfa';
            add(skill, 'research', level, { suffix: '-compatible', skills: { [other]: level } });
            for (const ability of ['valid_learn', 'query_neili_improve', ...capacityFunctions]) add(skill, ability, level);
        }
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
        edge('eff-jing26', { properties: { eff_jing: 26, jing: 26 } });
        edge('incompatible', { skills: { 'huashan-xinfa': 200 } });
        edge('no-learn', { properties: { 'env/no_learn': skill } });
        add(skill, 'difficult_level');
    }
    const learn = (skill, suffix, extra) => add(skill, 'valid_learn', extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const [suffix, properties] of [['int33', { int: 33 }], ['con33', { con: 33 }],
        ['female', { gender: '女性' }], ['eunuch', { gender: '无性' }],
        ['ruthless', { character: '心狠手辣' }], ['neili3499', { max_neili: 3499 }]])
        learn('xiantian-gong', suffix, { properties, expected: 'refused' });
    for (const k of ['force', 'unarmed', 'taoism']) learn('xiantian-gong', k + '199', { skills: { [k]: 199 }, expected: 'refused' });
    learn('xiantian-gong', 'minimum', { skills: { taoism: 200 }, properties: { int: 34, con: 34, max_neili: 3500 } });
    learn('xiantian-gong', 'noble', { properties: { character: '国士无双' } });
    for (const k of ['force', 'unarmed', 'taoism']) learn('xiantian-gong', k + '299', { level: 300, skills: { [k]: 299 }, expected: 'refused' });
    learn('xiantian-gong', 'taoism319', { level: 400, skills: { taoism: 319 }, expected: 'refused' });
    learn('xiantian-gong', 'taoism320', { level: 800, skills: { taoism: 320 } });
    for (const force of [59, 60]) learn('xuanmen-neigong', 'force' + force, { skills: { force }, expected: force === 59 ? 'refused' : 'observed' });
    for (const level of [29, 30]) learn('xuanmen-neigong', 'eunuch', { level, skills: { force: 60 }, properties: { gender: '无性' }, expected: level === 30 ? 'refused' : 'observed' });
    learn('xuanmen-neigong', 'female', { properties: { gender: '女性' } });
    learn('quanzhen-xinfa', 'minimal', { level: 1, properties: { gender: '无性', max_neili: 0 } });
    for (const ability of ['query_neili_improve', ...capacityFunctions])
        add('xiantian-gong', ability, 400, { suffix: '-sex1', properties: { sex: 1 } });
    for (const ability of capacityFunctions) {
        for (const mapping of [...quanzhenForces, null]) add('xiantian-gong', ability, 400, {
            suffix: '-all-' + (mapping ?? 'unmapped'), mapping, unmapped: !mapping,
            skills: Object.fromEntries(quanzhenForces.map(s => [s, 400])),
        });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze', { class: 'bonze', 'family/family_name': '少林派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1 }]])
            add('xiantian-gong', ability, 400, { suffix: '-' + suffix, properties });
        add('quanzhen-xinfa', ability, 201);
    }
    return result;
}

export function validateQuanzhenCultivationRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(before.weapon, 'none'); assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.deepEqual(raw.before[1], raw.immediate[1]);
    for (const key of ['int', 'con', 'jing', 'eff_jing', 'gender', 'combat_exp', 'potential', 'learned_points'])
        assert.equal(before[key], p.actor.properties[key]);
    for (const key of ['sex', 'improve/neili', 'breakup', 'special_skill/mystery', 'special_skill/guimai', 'class', 'family/family_name'])
        assert.equal(before.cultivation[key] ?? 0, p.actor.properties[key] ?? 0);
    assert.deepEqual(after.cultivation, before.cultivation);
    assert.deepEqual(after.skills, before.skills, '本批无跨级样本');
    for (const key of ['neili', 'max_neili', 'potential', 'qi', 'eff_jing']) assert.equal(after[key], before[key]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].function, p.ability); assert.equal(raw.interfaces[0].object, p.interface.object);
        const expected = p.ability === 'valid_learn' ? Number(p.expected === 'observed')
            : p.ability === 'difficult_level' ? (p.skill === 'xiantian-gong' ? 500 : 0)
                : p.ability === 'query_neili_improve' ? forceBonus(p.skill, before.skills[p.skill], p.actor.properties.sex)
                    : expectedForceCapacity(p.actor, p.ability === 'query_current_neili_limit');
        assert.equal(raw.interfaces[0].result ?? 0, expected);
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b); return;
    }
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return);
    assert.equal(after.learned_points - before.learned_points, p.completed);
    assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
    const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * forceResearchBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    for (const skill of Object.keys(before.skills).filter(k => k !== p.skill))
        assert.equal(after.learned[skill] ?? 0, before.learned[skill] ?? 0);
}
