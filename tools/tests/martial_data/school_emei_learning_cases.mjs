// Qualification and practice use original interfaces; no gameplay correction here.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

// skill, primary usage, force floor (negative = raw), max neili, basic floor,
// qi/neili floor, qi/neili cost. Variable costs are evaluated below.
const rows = [
    ['emei-jian', 'sword', 20, 100, 0, 40, 10, 25, 1],
    ['huifeng-jian', 'sword', -100, 1200, 100, 60, 60, 45, 58],
    ['yanxing-dao', 'blade', 50, 100, 20, 60, 60, 53, 51],
    ['yitian-jian', 'sword', -50, 250, 50, 50, 60, 40, 55],
    ['jieshou-jiushi', 'hand', 100, 500, 0, 70, 70, 55, 51],
    ['jinding-zhang', 'strike', 50, 150, 0, 50, 60, 45, 48],
    ['piaoxue-zhang', 'strike', 200, 2200, 100, 100, 120, 60, 80],
    ['sixiang-zhang', 'strike', 20, 50, 0, 50, 60, 30, 40],
    ['tiangang-zhi', 'finger', 100, 500, 0, 70, 70, 55, 51],
    ['zhutian-bu', 'dodge', 0, 0, 0, 50, 0, 40, 0],
];
export const emeiLearningProfiles = rows.map(([skill, usage, force, maxNeili, basicFloor,
    qiFloor, neiliFloor, qiCost, neiliCost]) => ({ skill, usage, force, maxNeili,
    basicFloor, qiFloor, neiliFloor, qiCost, neiliCost }));
const halfLevel = new Set(['huifeng-jian', 'yitian-jian']);
const weaponUsages = new Set(['sword', 'blade']);

export function emeiPracticeCosts(skill, skills) {
    const d = emeiLearningProfiles.find(x => x.skill === skill);
    assert.ok(d, `未知峨嵋练习技能 ${skill}`);
    if (skill === 'jinding-zhang') return { qi: skills[skill] < 100 ? 30 : 45, neili: 48 };
    if (skill === 'sixiang-zhang') return { qi: skills[skill] < 100 ? 20 : 30, neili: 40 };
    // Preserve the actual cross-skill lookup; do not substitute piaoxue's level.
    if (skill === 'piaoxue-zhang') return (skills['sixiang-zhang'] ?? 0) < 100
        ? { qi: 60, neili: 80 } : { qi: 80, neili: 100 };
    return { qi: d.qiCost, neili: d.neiliCost };
}

export function emeiLearningConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const { skill } = d, usage = extra.usage ?? d.usage, practice = ability === 'practice';
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, `缺少峨嵋武学 ${skill}`);
        const actor = {
            skills: { force: 600, 'linji-zhuang': 400, mahayana: 400,
                [d.usage]: level + 1, [usage]: level + 1, [skill]: level, ...extra.skills },
            mappings: { force: 'linji-zhuang', [usage]: skill },
            properties: { qi: 10000, jing: 10000, jingli: 10000, neili: 6000, max_neili: 6000,
                int: 36, con: 36, dex: 36, str: 36, shen: 200000, jiali: 0, gender: '女性',
                combat_exp: 100000000, 'family/family_name': '峨嵋派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const weapon = extra.weapon ?? (weaponUsages.has(d.usage) ? d.usage : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        if (extra.unmappedForce) delete actor.mappings.force;
        if (extra.unmapped) delete actor.mappings[usage];
        const repetitions = extra.times ?? 1;
        result.push({ id: `school-emei-learning-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: practice ? 'practice' : 'interface', samples: smoke ? 1 : 2,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-learning',
                combination: practice ? 'practice' : 'qualification', skill, usage, ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice ${usage} ${repetitions}` : 'test_interface',
                ...(!practice ? { interface: { object: `/kungfu/skill/${skill}`, function: 'valid_learn' } }
                    : { repetitions, completed: extra.completed ?? (extra.expected === 'refused' ? 0 : repetitions) }),
                observation: 'single_action_immediate', fighting: extra.fighting ?? false, observe_seconds: 0,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [...new Set([source.path, `kungfu/skill/${d.usage}.c`,
                    ...(usage !== d.usage ? [`kungfu/skill/${usage}.c`] : []),
                    ...(skill === 'piaoxue-zhang' ? ['kungfu/skill/sixiang-zhang.c'] : []),
                    'kungfu/class/emei/miejue.c', 'kungfu/skill/linji-zhuang.c', 'kungfu/skill/mahayana.c',
                    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'feature/skill.c', 'feature/damage.c'])],
                qualification_note: '原valid_learn与practice，真实非巫师USER；技能、身份和资源是实验输入，NPC来源不代替实际拜师或教师上限。零起始进度，基本功默认高一级；保留回风/倚天有效等级、飘雪读取四象和部分完成。招架练习仍保留原主类别基本功与持器条件。正式确定性各2次、烟雾各1次，不修改原公式。',
            } });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(emeiLearningProfiles.find(d => d.skill === skill),
        ability, extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const d of emeiLearningProfiles) {
        const { skill, usage, force, maxNeili, basicFloor, qiFloor, neiliFloor } = d;
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'practice']) add(d, ability, level);
        for (const basic of [199, 200]) edge(skill, 'valid_learn', 'basic' + basic, {
            skills: { [usage]: basic }, expected: basic < 200 && !halfLevel.has(skill)
                && !['piaoxue-zhang', 'zhutian-bu'].includes(skill) ? 'refused' : 'observed' });
        if (halfLevel.has(skill)) for (const basic of [199, 200]) edge(skill, 'valid_learn', 'half-level-basic' + basic, {
            level: 400, skills: { [usage]: basic }, expected: basic < 200 ? 'refused' : 'observed' });
        if (force) for (const value of [Math.abs(force) - 1, Math.abs(force)]) edge(skill, 'valid_learn', 'force' + value, {
            skills: { force: force < 0 ? value : value * 2 }, unmappedForce: force > 0,
            expected: value < Math.abs(force) ? 'refused' : 'observed' });
        else edge(skill, 'valid_learn', 'zero-force', { skills: { force: 0 }, unmappedForce: true });
        if (maxNeili) for (const value of [maxNeili - 1, maxNeili]) edge(skill, 'valid_learn', 'maxneili' + value, {
            properties: { max_neili: value, neili: value }, expected: value < maxNeili ? 'refused' : 'observed' });
        else edge(skill, 'valid_learn', 'zero-maxneili', { properties: { max_neili: 0, neili: 0 } });
        if (basicFloor) for (const value of [basicFloor - 1, basicFloor]) edge(skill, 'valid_learn', 'basic-floor' + value, {
            level: 1, skills: { [usage]: value }, expected: value < basicFloor ? 'refused' : 'observed' });
        for (const ability of ['valid_learn', 'practice']) {
            if (weaponUsages.has(usage)) for (const weapon of ['none', usage === 'sword' ? 'blade' : 'sword'])
                edge(skill, ability, 'weapon-' + weapon, { weapon,
                    expected: ability === 'practice' ? 'refused' : 'observed' });
            else edge(skill, ability, 'armed', { weapon: 'sword', expected: usage === 'dodge' ? 'observed' : 'refused' });
        }
        for (const [suffix, properties] of [['male', { gender: '男性' }], ['other-family', { 'family/family_name': '武当派' }]])
            edge(skill, 'valid_learn', suffix, { properties });
        edge(skill, 'practice', 'equal-basic', { skills: { [usage]: 200 }, expected: 'refused' });
        edge(skill, 'practice', 'times50', { times: 50 });
        const cost = emeiPracticeCosts(skill, { [skill]: 200 });
        edge(skill, 'practice', 'low-qi', { properties: { qi: qiFloor - 1 }, expected: 'refused' });
        edge(skill, 'practice', 'minimum-qi', { properties: { qi: qiFloor } });
        edge(skill, 'practice', 'partial-qi', { times: 3, completed: 2, properties: { qi: qiFloor + cost.qi } });
        if (neiliFloor) {
            edge(skill, 'practice', 'low-neili', { properties: { neili: neiliFloor - 1 }, expected: 'refused' });
            edge(skill, 'practice', 'minimum-neili', { properties: { neili: neiliFloor } });
            edge(skill, 'practice', 'partial-neili', { times: 3, completed: 2, properties: { neili: neiliFloor + cost.neili } });
        } else edge(skill, 'practice', 'zero-neili', { properties: { neili: 0 } });
        if (usage !== 'dodge') for (const level of [200, 400, 800]) edge(skill, 'practice', 'parry', { level, usage: 'parry' });
    }
    for (const [key, floor] of [['con', 28], ['str', 32]]) for (const value of [floor - 1, floor])
        edge('piaoxue-zhang', 'valid_learn', key + value, { properties: { [key]: value },
            expected: value < floor ? 'refused' : 'observed' });
    for (const sixiang of [0, 99, 100, 201, 202]) for (const ability of ['valid_learn', 'practice'])
        edge('piaoxue-zhang', ability, 'sixiang' + sixiang, { skills: { 'sixiang-zhang': sixiang },
            expected: sixiang > 201 ? 'refused' : 'observed' });
    for (const ability of ['valid_learn', 'practice']) edge('piaoxue-zhang', ability, 'own800-sixiang200-basic201', {
        level: 800, skills: { strike: 201, 'sixiang-zhang': 200 }, expected: ability === 'practice' ? 'refused' : 'observed' });
    for (const [suffix, properties] of [['partial-qi-sixiang100', { qi: 180 }],
        ['partial-neili-sixiang100', { neili: 220 }]]) edge('piaoxue-zhang', 'practice', suffix, {
        skills: { 'sixiang-zhang': 100 }, properties, times: 3, completed: 2 });
    for (const skill of ['jinding-zhang', 'sixiang-zhang']) for (const level of [99, 100])
        edge(skill, 'practice', 'fee-boundary', { level });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['unmapped', { unmapped: true }], ['no-learn', { properties: { 'env/no_learn': 'emei-jian' } }],
        ['low-exp', { properties: { combat_exp: 799999 } }], ['zero-skill', { skills: { 'emei-jian': 0 } }],
        ['zero-basic', { skills: { sword: 0 } }], ['times0', { times: 0 }], ['times51', { times: 51 }]])
        edge('emei-jian', 'practice', suffix, { ...extra, expected: 'refused' });
    for (const level of [299, 300, 499, 500]) edge('emei-jian', 'practice', 'gain-boundary', { level });
    return result;
}

export function validateEmeiLearningRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(raw.outcome, p.expected);
    for (const [state, config] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili', 'max_neili'])
            assert.ok(Number.isFinite(state[key]), key + ' must be observed');
        // The driver serializes an unset LPC property as null. Keep that actual
        // observation, but never accept a missing field or coerce it to zero.
        for (const key of ['jingli', 'learned_points', 'force_attribute']) {
            assert.ok(Object.hasOwn(state, key), key + ' must be observed');
            assert.ok(state[key] === null || Number.isFinite(state[key]), key + ' must be numeric or unset');
        }
        assert.deepEqual(state.mappings, config.mappings);
        for (const [skill, value] of Object.entries(config.skills)) assert.equal(state.skills[skill] ?? 0, value);
        for (const key of ['qi', 'jing', 'jingli', 'neili', 'max_neili', 'int', 'con', 'dex', 'str', 'shen', 'combat_exp', 'jiali', 'gender'])
            if (Object.hasOwn(config.properties, key)) assert.equal(state[key], config.properties[key]);
        if (Object.hasOwn(config.properties, 'family/family_name'))
            assert.equal(state.cultivation['family/family_name'], config.properties['family/family_name']);
        if (Object.hasOwn(config.skills, 'force')) assert.equal(state.effective_skills.force,
            Math.trunc(config.skills.force / 2) + (config.skills[config.mappings.force] ?? 0));
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.deepEqual(after.skills, before.skills, '本批进度不足以升级');
    assert.deepEqual(after.mappings, before.mappings);
    assert.deepEqual(raw.immediate[1], raw.before[1]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.equal(raw.interfaces[0].function, 'valid_learn');
        assert.equal(raw.interfaces[0].result, Number(p.expected === 'observed'));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b, '学习资格查询不改变状态');
    } else {
        assert.equal(raw.interfaces.length, 0);
        const cost = emeiPracticeCosts(p.skill, before.skills);
        assert.equal(after.qi, before.qi - p.completed * cost.qi);
        assert.equal(after.neili, before.neili - p.completed * cost.neili);
        for (const key of ['jing', 'jingli', 'eff_qi', 'eff_jing', 'max_neili', 'learned_points', 'force_attribute', 'weapon'])
            assert.equal(after[key], before[key], key + ' unchanged');
        const learned = structuredClone(before.learned);
        const gain = p.completed * practiceGain(p.level, before.skills[p.usage], before.int);
        if (gain) learned[p.skill] = (learned[p.skill] ?? 0) + gain;
        const actual = Object.fromEntries(Object.entries(after.learned).filter(([, value]) => value !== 0));
        assert.deepEqual(actual, Object.fromEntries(Object.entries(learned).filter(([, value]) => value !== 0)));
        assert.equal(raw.command_accepted, Number(p.completed === p.repetitions && p.completed > 0));
    }
    if (raw.outcome === 'refused') assert.ok(raw.reason.length > 0);
}
