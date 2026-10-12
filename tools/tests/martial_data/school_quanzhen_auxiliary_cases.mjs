// Original dodge and knowledge interfaces; actual attack checks stay in COMBAT_D.
import assert from 'node:assert/strict';

export const jinyanDodgeCoefficient = level => level < 30 ? 0 : level < 50 ? 10
    : level < 100 ? 20 : level < 150 ? 30 : level < 200 ? 40 : 50;
export const primaryDodgeChecks = (raw, phase) => (raw.dodge_checks ?? []).filter(c =>
    c.actor === 0 && c.target === 1 && c.type === 0 && c.phase === phase);

export function quanzhenAuxiliaryConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const ordinary = ability === 'ordinary', method = ordinary ? 'ordinary' : ability === 'research' ? 'research' : 'interface';
        const config = {
            skills: { dodge: level, force: 600, parry: 600, unarmed: 600, [skill]: level, ...extra.skills },
            mappings: skill === 'taoism' || extra.unmapped ? {} : { dodge: skill },
            properties: { jiali: 0, neili: 6000, max_neili: 6000, gender: '男性',
                potential: 10000, learned_points: 0, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}),
        };
        const neutral = { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600 },
            mappings: {}, properties: { jiali: 0, neili: 6000, max_neili: 6000 } };
        const onDefender = ordinary || ability === 'query_effect_dodge';
        result.push({ id: `school-quanzhen-auxiliary-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : ordinary || ability === 'query_dodge_msg' ? samples : 2,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-auxiliary',
                combination: extra.unmapped ? 'unmapped-control' : 'single-skill', skill,
                usage: skill === 'taoism' ? 'knowledge' : 'dodge', ability, level,
                actor: onDefender ? neutral : config, target: onDefender ? config : neutral,
                action: ordinary ? 'ordinary' : method === 'research' ? `research ${skill} 1` : 'test_interface',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill, function: ability } } : {}),
                observation: 'single_action_immediate', fighting: ordinary, observe_seconds: 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [source.path, 'inherit/skill/skill.c', 'feature/skill.c',
                    'adm/daemons/combatd.c', 'kungfu/skill/unarmed.c', 'cmds/skill/research.c',
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/yin.c', 'kungfu/class/quanzhen/wang.c'],
                qualification_note: '真实非巫师USER；单次原普通攻击左方固定基本拳脚600，右方只激发受测轻功，保留原反击。技能等级为实验赋值，不证明教师可传至该级；未激发对照仍持有该技能。接口与原research拒绝独立记录，不代替从师学习或长期实战。心跳关闭，不改公式和随机数。',
            } });
    }
    for (const skill of ['jinyan-gong', 'tianshan-feidu']) {
        for (const level of [200, 400, 800]) for (const unmapped of [false, true])
            add(skill, 'ordinary', level, { unmapped, suffix: unmapped ? '-unmapped' : '' });
        for (const [suffix, extra] of [['busy', { busy: true }], ['neili0', { properties: { neili: 0 } }], ['armed', { armed: true }]])
            add(skill, 'ordinary', 400, { ...extra, suffix: '-' + suffix });
        for (const level of [1, 29, 30, 49, 50, 99, 100, 149, 150, 199, 200, 400, 800])
            add(skill, 'query_effect_dodge', level);
        add(skill, 'query_dodge_msg');
    }
    for (const dodge of [49, 50]) for (const max_neili of [499, 500])
        add('jinyan-gong', 'valid_learn', 1, { suffix: `-dodge${dodge}-neili${max_neili}`,
            skills: { dodge }, properties: { max_neili }, expected: dodge < 50 || max_neili < 500 ? 'refused' : 'observed' });
    for (const level of [1, 800]) add('tianshan-feidu', 'valid_learn', level, { skills: { dodge: 0 }, properties: { max_neili: 0 } });
    for (const [gender, suffix] of [['男性', 'male'], ['女性', 'female'], ['无性', 'eunuch']])
        for (const level of [19, 20, 200, 400, 800]) add('taoism', 'valid_learn', level,
            { suffix: '-' + suffix, properties: { gender }, expected: gender === '无性' && level >= 20 ? 'refused' : 'observed' });
    for (const skill of ['jinyan-gong', 'tianshan-feidu', 'taoism'])
        for (const ability of ['type', 'valid_learn_level']) add(skill, ability);
    for (const level of [200, 400, 800]) for (const ability of ['practice_skill', 'research'])
        add('taoism', ability, level, { expected: 'refused' });
    return result;
}

export function validateQuanzhenAuxiliaryRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.launches.length, 0);
    for (const [side, config] of [[0, p.actor], [1, p.target]])
        assert.equal(raw.before[side].weapon, config.equipment?.type ?? 'none');
    if (condition.method === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const base = primaryDodgeChecks(raw, 'base'), settled = primaryDodgeChecks(raw, 'settled');
        const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        assert.equal(base.length, 1); assert.equal(settled.length, 1); assert.equal(attacks.length, 1);
        const a = base[0], b = settled[0];
        assert.ok(Number.isSafeInteger(a.ap) && a.ap > 0 && Number.isSafeInteger(a.dp) && a.dp > 0);
        assert.equal(b.ap, a.ap);
        assert.equal(b.skill || null, p.target.mappings.dodge ?? null);
        assert.equal(Boolean(b.busy), Boolean(p.target.busy));
        const coefficient = b.skill === 'jinyan-gong' ? jinyanDodgeCoefficient(p.target.skills['jinyan-gong']) : 0;
        let expected = Math.max(1, a.dp + Math.trunc(a.dp / 100) * coefficient);
        if (p.target.busy) expected = Math.trunc(expected / 3);
        assert.equal(b.dp, expected, '原DP按整数先除100再乘系数，忙乱最后除3');
        assert.ok([0, -1, -2].includes(attacks[0].result));
        return;
    }
    assert.equal(raw.attacks.length, 0); assert.equal(raw.dodge_checks.length, 0);
    const a = structuredClone(raw.before), b = structuredClone(raw.immediate);
    for (const states of [a, b]) for (const state of states) delete state.temp.notify_fail;
    assert.deepEqual(b, a, '辅助接口与道学研究拒绝不改变角色属性');
    if (condition.method === 'research') {
        assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, 0);
        assert.equal(raw.outcome, 'refused'); assert.ok(raw.reason); return;
    }
    assert.equal(raw.interfaces.length, 1);
    const i = raw.interfaces[0];
    assert.equal(i.function, p.ability); assert.equal(i.object, p.interface.object);
    if (p.ability === 'query_dodge_msg') {
        assert.equal(typeof i.result, 'string'); assert.ok(i.result.includes('$n')); return;
    }
    const expected = p.ability === 'query_effect_dodge' ? (p.skill === 'jinyan-gong' ? jinyanDodgeCoefficient(p.level) : 0)
        : p.ability === 'type' ? (p.skill === 'taoism' ? 'knowledge' : 'martial')
            : p.ability === 'valid_learn_level' ? (p.skill === 'taoism' ? 999 : 200)
                : Number(p.expected === 'observed');
    assert.equal(i.result ?? 0, expected);
    if (p.ability === 'query_effect_dodge') assert.equal(Boolean(i.implemented_by), p.skill === 'jinyan-gong');
}
