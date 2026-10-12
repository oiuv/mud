// Original Yijin learning, capacity and research observations, not a game correction.
import assert from 'node:assert/strict';

export const yijinFields = ['character', 'yijin-duangu', 'sex', 'improve/neili', 'breakup',
    'special_skill/mystery', 'special_skill/guimai', 'special_skill/wuxing', 'class', 'family/family_name'];
export const yijinCharacterLimits = [['xinhen', '心狠手辣', 199], ['jiaoxia', '狡黠多变', 169], ['yinxian', '阴险奸诈', 139]];
const capacity = ['query_neili_limit', 'query_current_neili_limit'];

export function yijinBonus(level) {
    return Math.trunc(Math.trunc(level * level * 15 * 18 / 100) / 200);
}

export function yijinCapacity(actor, current = false) {
    const s = actor.skills, p = actor.properties, base = Math.trunc(s.force / 2) * 10;
    const forces = current ? [actor.mappings.force].filter(Boolean)
        : ['yijin-duangu', 'linji-zhuang', 'huashan-xinfa'].filter(k => s[k]);
    const bonus = k => k === 'yijin-duangu' ? yijinBonus(s[k]) : k === 'linji-zhuang'
        ? (p.sex ? 0 : Math.trunc(Math.trunc(s[k] * s[k] * 15 * 21 / 100) / 200) + 500) : 0;
    let n = Math.max(base, ...forces.map(k => base + s[k] * 10 + bonus(k)));
    n += Math.trunc(n * (p['improve/neili'] ?? 0) / 100);
    if (p.breakup) n += Math.trunc(n * 4 / 10);
    if (p['special_skill/mystery']) n += p.con * 15;
    if (p['special_skill/guimai']) n += Math.trunc(n * 3 / 20);
    if (p.class === 'bonze' && ['大轮寺', '少林派', '峨嵋派', '血刀门'].includes(p['family/family_name'])) n += 500;
    return n;
}

export function yijinResearchBound(p) {
    const s = p.actor.skills, props = p.actor.properties, level = s['yijin-duangu'];
    // The reviewed related force skills have no numerical query_action coefficients.
    const related = [s.force, ...['linji-zhuang', 'huashan-xinfa'].filter(k => s[k]).map(k => s[k])].sort((a, b) => b - a);
    const scale = [150, 120, 50, 40, 20, 8, 5, 2, 1];
    let n = related.reduce((sum, v, i) => sum + Math.trunc(v * scale[i] / (level >= 500 ? 2 : 1)), 0);
    n = Math.trunc(Math.trunc(n / 15) / 100);
    n += Math.trunc(level / 50) + Math.trunc((props.int / (level >= 500 ? 6 : 12)) ** 2);
    if (props['special_skill/guimai']) n += Math.trunc(n * 30 / 100);
    if (props['special_skill/wuxing']) n += Math.trunc(n * 20 / 100);
    return 1 + Math.trunc((n - 1) * 100 / (level + 100));
}

export function emeiYijinConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === 'yijin-duangu');
    assert.ok(source, '缺少易筋锻骨源码');
    const rows = [];
    function add(ability, level = 200, suffix = '', extra = {}) {
        const research = ability === 'research', practice = ability === 'practice';
        const expected = extra.expected ?? (['practice_skill', 'practice'].includes(ability) ? 'refused' : 'observed');
        const actor = {
            skills: { force: level + 1, 'yijin-duangu': level, ...extra.skills },
            mappings: extra.unmapped ? {} : { force: extra.mapping ?? 'yijin-duangu' },
            properties: { qi: 10000, jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000,
                int: 36, con: 36, str: 36, dex: 36, gender: '女性', character: '光明磊落', shen: 200000,
                combat_exp: 100000000, potential: 10000, learned_points: 0, jiali: 0,
                'family/family_name': '峨嵋派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const times = extra.times ?? 1;
        rows.push({ id: `school-emei-yijin-${ability}-l${level}${suffix ? '-' + suffix : ''}`,
            stage: 'school', entry_id: source.path, method: research ? 'research' : practice ? 'practice' : 'interface',
            samples: research && expected === 'observed' ? (smoke ? 2 : samples) : (smoke ? 1 : 2),
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-yijin',
                combination: suffix || 'single-skill', skill: 'yijin-duangu', usage: 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: research ? `research yijin-duangu ${times}` : practice ? `practice force ${times}` : 'test_interface',
                ...(!research && !practice ? { interface: { object: capacity.includes(ability) ? 'player' : '/kungfu/skill/yijin-duangu', function: ability } } : {}),
                repetitions: times, completed: extra.completed ?? (research && expected === 'observed' ? times : 0),
                command_return: extra.commandReturn ?? (expected === 'refused' ? 0 : 1),
                clear_jing: extra.clearJing ?? false, observation: 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: 0, expected, not_applicable: '',
                qualification_sources: [source.path, 'kungfu/class/emei/zhou.c', 'kungfu/skill/force.c',
                    'kungfu/skill/linji-zhuang.c', 'kungfu/skill/huashan-xinfa.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'cmds/skill/research.c', 'cmds/skill/learn.c', 'cmds/skill/practice.c',
                    'feature/skill.c', 'clone/user/user.c'],
                qualification_note: '真实非巫师USER，原资格/容量接口及research、practice命令；初始技能、性格、身份和资源为实验输入，不代替周芷若传授或自然养成。性格门槛按原普通属性读取，无性门槛按原技能读取；不修原错误。容量取最大而非叠加，不修改max_neili；正式成功研究每条件100次，其余确定性2次，烟雾独立。',
            } });
    }
    for (const level of [200, 400, 800]) {
        for (const ability of ['valid_learn', 'type', 'valid_learn_level', 'difficult_level', 'practice_skill',
            'practice', 'query_neili_improve', ...capacity, 'research']) add(ability, level);
        add('research', level, 'compatible-forces', { skills: { 'linji-zhuang': level, 'huashan-xinfa': level } });
    }
    for (const level of [49, 50, 200, 800]) add('valid_learn', level, 'eunuch', { properties: { gender: '无性' },
        skills: { force: 100 }, expected: level > 49 ? 'refused' : 'observed' });
    add('research', 200, 'eunuch', { properties: { gender: '无性' }, expected: 'refused' });
    for (const [id, character, limit] of yijinCharacterLimits) {
        for (const level of [limit, limit + 1, 800]) add('valid_learn', level, id + '-no-attribute', { properties: { character } });
        for (const attribute of [limit, limit + 1]) for (const ability of ['valid_learn', 'research'])
            add(ability, 200, id + '-attribute' + attribute, { properties: { character, 'yijin-duangu': attribute },
                expected: attribute > limit ? 'refused' : 'observed' });
        add('research', 800, id + '-no-attribute', { properties: { character } });
    }
    for (const ability of ['valid_learn', 'research']) {
        for (const con of [29, 30]) add(ability, 200, 'con' + con, { properties: { con }, expected: con < 30 ? 'refused' : 'observed' });
        for (const force of [99, 100]) add(ability, 200, 'force' + force, { skills: { force }, expected: force < 100 ? 'refused' : 'observed' });
        add(ability, 200, 'male', { properties: { gender: '男性' } });
        add(ability, 200, 'other-family', { properties: { 'family/family_name': '武当派' } });
        add(ability, 200, 'maxneili0', { properties: { neili: 0, max_neili: 0 } });
        add(ability, 200, 'unmapped', { unmapped: true });
        add(ability, 200, 'irrelevant-attribute800', { properties: { 'yijin-duangu': 800 } });
    }
    for (const level of [179, 180, 499, 500]) add('research', level, '', { expected: level < 180 ? 'refused' : 'observed' });
    for (const [suffix, extra] of [
        ['busy', { busy: true }], ['fighting', { fighting: true }], ['potential0', { properties: { potential: 0 } }],
        ['exp799999', { properties: { combat_exp: 799999 }, commandReturn: 1 }],
        ['jing26', { properties: { jing: 26 }, commandReturn: 1, clearJing: true }],
        ['eff-jing26', { properties: { jing: 26, eff_jing: 26 } }],
        ['no-learn', { properties: { 'env/no_learn': 'yijin-duangu' } }],
    ]) add('research', 200, suffix, { expected: 'refused', ...extra });
    add('research', 200, 'exp800000', { properties: { combat_exp: 800000 } });
    add('research', 200, 'neili0', { properties: { neili: 0 } });
    add('research', 200, 'times100', { times: 100 });
    add('research', 200, 'partial', { times: 3, completed: 2, clearJing: true, properties: { jing: 60 } });
    for (const [suffix, properties] of [['guimai', { 'special_skill/guimai': 1 }], ['wuxing', { 'special_skill/wuxing': 1 }],
        ['both', { 'special_skill/guimai': 1, 'special_skill/wuxing': 1 }]]) add('research', 200, suffix, { properties });
    for (const ability of capacity) {
        for (const mapping of ['yijin-duangu', 'linji-zhuang', 'huashan-xinfa', null])
            add(ability, 400, 'mixed-' + (mapping ?? 'unmapped'), { mapping, unmapped: !mapping,
                skills: { 'linji-zhuang': 400, 'huashan-xinfa': 400 } });
        for (const [suffix, properties] of [['improve10', { 'improve/neili': 10 }], ['breakup', { breakup: 1 }],
            ['mystery', { 'special_skill/mystery': 1 }], ['guimai', { 'special_skill/guimai': 1 }],
            ['bonze', { class: 'bonze' }], ['bonze-other-family', { class: 'bonze', 'family/family_name': '武当派' }],
            ['combined', { 'improve/neili': 10, breakup: 1, 'special_skill/mystery': 1, 'special_skill/guimai': 1, class: 'bonze' }]])
            add(ability, 400, suffix, { properties });
        add(ability, 201);
    }
    add('query_neili_improve', 201);
    return rows;
}

export function yijinInterface(p) {
    switch (p.ability) {
    case 'valid_learn': return Number(p.expected === 'observed');
    case 'type': return 'martial';
    case 'valid_learn_level': return 200;
    case 'difficult_level': case 'practice_skill': return 0;
    case 'query_neili_improve': return yijinBonus(p.actor.skills['yijin-duangu']);
    default: assert.ok(capacity.includes(p.ability)); return yijinCapacity(p.actor, p.ability === 'query_current_neili_limit');
    }
}

export function validateEmeiYijinRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'emei-yijin'); assert.equal(raw.outcome, p.expected);
    for (const k of ['before', 'immediate', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['attacks', 'launches', 'interfaces']) assert.ok(Array.isArray(raw[k]));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    const [b, target] = raw.before, [a, afterTarget] = raw.immediate;
    assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0); assert.equal(b.weapon, 'none');
    assert.ok(Object.hasOwn(b, 'busy')); assert.equal(b.busy ?? 0, p.actor.busy ?? 0);
    assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(b.mappings, p.actor.mappings);
    assert.deepEqual(target, afterTarget);
    for (const k of ['qi', 'jing', 'eff_jing', 'neili', 'max_neili', 'int', 'con', 'gender', 'combat_exp', 'potential', 'learned_points'])
        assert.equal(b[k], p.actor.properties[k], k);
    for (const k of yijinFields) {
        assert.ok(Object.hasOwn(b.cultivation, k), '缺少字段：' + k);
        assert.equal(b.cultivation[k] ?? 0, p.actor.properties[k] ?? 0, k);
    }
    assert.deepEqual(a.cultivation, b.cultivation); assert.deepEqual(a.skills, b.skills, '本批不跨级');
    assert.deepEqual(a.mappings, b.mappings);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const r = raw.interfaces[0];
        assert.equal(r.function, p.ability); assert.equal(r.object, p.interface.object);
        assert.ok(Object.hasOwn(r, 'result')); assert.equal(r.result ?? 0, yijinInterface(p));
        const x = structuredClone(a), y = structuredClone(b);
        delete x.temp.notify_fail; delete y.temp.notify_fail; assert.deepEqual(x, y); return;
    }
    assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return);
    for (const k of ['qi', 'eff_qi', 'eff_jing', 'neili', 'max_neili', 'potential']) assert.equal(a[k], b[k]);
    assert.equal(a.learned_points - b.learned_points, p.completed);
    assert.equal(a.jing, p.clear_jing ? 0 : b.jing - p.completed * Math.trunc(1000 / b.int));
    const gain = (a.learned[p.skill] ?? 0) - (b.learned[p.skill] ?? 0);
    if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * yijinResearchBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    for (const k of Object.keys(b.skills).filter(k => k !== p.skill)) assert.equal(a.learned[k] ?? 0, b.learned[k] ?? 0);
}
