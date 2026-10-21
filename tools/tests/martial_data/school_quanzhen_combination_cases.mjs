// Original prepare commands and fight rounds. Pair declarations are not teaching proof.
import assert from 'node:assert/strict';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';

// Two independent bidirectional pairs plus one unarmed skill without valid_combine.
export const quanzhenPairs = [
    ['chongyang-shenzhang', 'strike', 'zhongnan-zhi', 'finger'],
    ['haotian-zhang', 'strike', 'qixing-shou', 'hand'],
];
export const quanzhenSingles = { 'kongming-quan': 'unarmed' };
const pairSkills = quanzhenPairs.flat().filter((_, i) => i % 2 === 0);
const usageOf = skill => {
    for (const [a, au, b, bu] of quanzhenPairs) if (skill === a) return au; else if (skill === b) return bu;
    return quanzhenSingles[skill];
};
const partnerOf = skill => {
    for (const [a, , b] of quanzhenPairs) if (skill === a) return b; else if (skill === b) return a;
    return undefined;
};
const allSkills = [...pairSkills, ...Object.keys(quanzhenSingles)];
const prep = skills => Object.fromEntries(skills.map(s => [usageOf(s), s]));
const command = (action, skills, accepted = 1) => ({ action, accepted, preparations: prep(skills) });

function stepsFor(pair, first, route) {
    const [a, , b] = pair;
    const second = first === a ? b : a;
    if (route === 'sequential') return [command('prepare ' + first, [first]),
        command('prepare ' + second, [first, second])];
    const args = route === 'basics' ? [first, second].map(s => usageOf(s)) : [first, second];
    return [command('prepare ' + args.join(' '), [first, second])];
}

export function quanzhenCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const id of allSkills) assert.ok(catalog.skills.some(s => s.id === id), id);
    const result = [];
    function add(id, method, level, steps = [], extra = {}) {
        const skill = extra.skill ?? pairSkills[0], source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少互备源码：' + skill);
        const skills = { unarmed: level, strike: level, finger: level, hand: level, claw: level,
            sword: level, 'quanzhen-jian': level, force: 600, parry: level,
            dodge: extra.dex8 ? 0 : 600,
            ...Object.fromEntries(allSkills.map(s => [s, level])), ...extra.skills };
        // Only the active pair/skill is mapped: both palms share the strike usage.
        const active = extra.active ?? [skill, partnerOf(skill)].filter(Boolean);
        const mappings = { ...Object.fromEntries(active.map(s => [usageOf(s), s])),
            sword: 'quanzhen-jian', parry: skill, ...extra.mappings };
        const actor = { skills, mappings, preparations: {},
            properties: { str: 36, dex: extra.dex8 ? 8 : 36, neili: 6000, max_neili: 6000,
                jiali: extra.jiali ?? 0, gender: '男性', 'family/family_name': '全真教' },
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}) };
        for (const key of extra.unmapped ?? []) delete actor.mappings[key];
        result.push({ id: `school-quanzhen-combination-${id}-l${level}`, stage: 'school',
            entry_id: source.path, method,
            samples: smoke ? 2 : method === 'round' ? samples : 2,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-combination',
                skill, level, combination: id, ability: method, observation: 'single_action_immediate',
                actor, target: { skills: { unarmed: 600, force: 600, dodge: 600, parry: 600 },
                    mappings: {}, properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
                ...(method === 'interface' ? {
                    interface: { object: '/kungfu/skill/' + skill, function: 'valid_combine', combo: extra.combo },
                    combine_result: extra.allowed,
                } : { prepare_commands: steps }),
                fighting: method === 'round', observe_seconds: 0, not_applicable: '',
                expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
                qualification_sources: ['cmds/skill/prepare.c', 'feature/skill.c', 'feature/action.c',
                    'feature/attack.c', 'feature/attribute.c', 'adm/daemons/combatd.c', 'include/combat.h',
                    'inherit/skill/skill.c', 'kungfu/skill/quanzhen-jian.c',
                    ...allSkills.map(s => 'kungfu/skill/' + s + '.c'),
                    'kungfu/class/quanzhen/li.c', 'kungfu/class/quanzhen/yin.c',
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/tan.c',
                    'kungfu/class/quanzhen/ma.c', 'kungfu/class/quanzhen/zhou.c'],
                qualification_note: '真实非巫师USER，等级与映射为实验赋值，不证明从师可学或同养成成本。'
                    + '重阳神掌／终南指法与昊天掌／七星手为两组独立双向互备，空明拳无互备接口但仍可单备出招。'
                    + '全部准备经原命令，不预填prepare/action_flag；原fight仅一轮，保留守势、随机双击、反击与选招次序，不是完整交锋。'
                    + '基本内功600未映射，隔离内功被动；加力不代表正常门派完整配置。李处玄／尹志平与丘处机／谭处端／马钰的原prepare_skill配组只作源码依据，不移植到实验对象。',
            } });
    }
    for (const pair of quanzhenPairs) {
        const [a, au, b, bu] = pair;
        const active = [a, b];
        for (const first of [a, b]) {
            const partner = first === a ? b : a;
            for (const combo of [partner, first, 'not-a-skill', ...allSkills.filter(s => s !== first && s !== partner)])
                add(`${first}-allows-${combo}`, 'interface', 200, [], {
                    skill: first, combo, active,
                    allowed: Number(combo === partner),
                });
        }
        for (const level of [200, 400, 800]) {
            for (const first of [a, b]) for (const route of ['names', 'basics', 'sequential'])
                add(`${a}-${b}-${first}-${route}`, 'prepare', level, stepsFor(pair, first, route), { active, skill: first });
            for (const first of [a, b]) {
                add(`${a}-${b}-${first}-solo`, 'round', level, [command('prepare ' + first, [first])],
                    { active, skill: first });
                add(`${a}-${b}-${first}-pair`, 'round', level, stepsFor(pair, first, 'names'),
                    { active, skill: first });
            }
        }
        const accepted = stepsFor(pair, a, 'names');
        for (const [id, extra] of [['pair-jiali50', { jiali: 50 }], ['armed-round', { armed: true }],
            ['dex8-round', { dex8: true }], ['busy-target-round', { targetBusy: true }]])
            add(`${a}-${b}-${id}`, 'round', 400, accepted, { active, skill: a, ...extra });
        add(`${a}-${b}-cancel-round`, 'round', 400, [...accepted, command('prepare none', [])],
            { active, skill: a });
        add(`${a}-${b}-cancel-and-replace`, 'prepare', 200, [...accepted, command('prepare none', []),
            command('prepare ' + a, [a])], { active, skill: a });
        add(`${a}-${b}-third-refused`, 'prepare', 200, [...accepted,
            command('prepare kongming-quan', [a, b], 0)], { active, skill: a });
        add(`${a}-${b}-three-at-once`, 'prepare', 200,
            [command(`prepare ${a} ${b} kongming-quan`, [], 0)], { active, skill: a });
        add(`${a}-${b}-pair-while-one`, 'prepare', 200, [command('prepare ' + a, [a]),
            command(`prepare ${a} ${b}`, [a], 0)], { active, skill: a });
        add(`${a}-${b}-same-skill`, 'prepare', 200, [command(`prepare ${a} ${a}`, [], 0)],
            { active, skill: a });
        add(`${a}-${b}-repeat-one`, 'prepare', 200, [command('prepare ' + a, [a]),
            command('prepare ' + a, [a], 0)], { active, skill: a });
        add(`${a}-${b}-unlearned`, 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)],
            { active, skill: a, skills: { [b]: 0 } });
        add(`${a}-${b}-unmapped`, 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)],
            { active, skill: a, unmapped: [au, bu] });
        add(`${a}-${b}-cancel-empty`, 'prepare', 200, [command('prepare none', [], 0)],
            { active, skill: a });
        add(`${a}-${b}-no-minimum`, 'prepare', 1, accepted, { active, skill: a });
        add(`${a}-${b}-armed-prepare`, 'prepare', 200, accepted, { active, skill: a, armed: true });
        add(`${a}-${b}-wrong-type`, 'prepare', 200, [command('prepare sword', [], 0)],
            { active, skill: a });
    }
    // Cross-pair mixes stay refused: the two pairs are independent declarations.
    for (const [a] of quanzhenPairs) for (const [c] of quanzhenPairs) {
        if (a === c) continue;
        const b = partnerOf(a), d = partnerOf(c);
        const active = s => (usageOf(s[0]) === usageOf(s[1]) ? [s[0]] : s);
        add(`${a}-${c}-cross-incompatible`, 'prepare', 200, [command(`prepare ${a} ${c}`, [], 0)],
            { skill: a, active: active([a, c]) });
        add(`${b}-${d}-cross-incompatible`, 'prepare', 200, [command(`prepare ${b} ${d}`, [], 0)],
            { skill: b, active: active([b, d]) });
    }
    for (const skill of Object.keys(quanzhenSingles)) {
        const id = skill, partnerless = allSkills.filter(s => s !== skill);
        for (const combo of [...partnerless, 'not-a-skill'])
            add(`${id}-allows-${combo}`, 'interface', 200, [], { skill, combo, active: [skill], allowed: null });
        for (const level of [200, 400, 800]) {
            add(`${id}-single-prepare`, 'prepare', level, [command('prepare ' + skill, [skill])],
                { skill, active: [skill] });
            add(`${id}-solo`, 'round', level, [command('prepare ' + skill, [skill])],
                { skill, active: [skill] });
        }
        for (const other of partnerless.slice(0, 2))
            add(`${id}-${other}-incompatible`, 'prepare', 200,
                [command(`prepare ${skill} ${other}`, [], 0)],
                { skill, active: usageOf(skill) === usageOf(other) ? [skill] : [skill, other] });
        add(`${id}-cancel-round`, 'round', 400,
            [command('prepare ' + skill, [skill]), command('prepare none', [])], { skill, active: [skill] });
        add(`${id}-armed-round`, 'round', 400, [command('prepare ' + skill, [skill])],
            { skill, active: [skill], armed: true });
        add(`${id}-busy-target-round`, 'round', 400, [command('prepare ' + skill, [skill])],
            { skill, active: [skill], targetBusy: true });
        add(`${id}-dex8-round`, 'round', 400, [command('prepare ' + skill, [skill])],
            { skill, active: [skill], dex8: true });
    }
    for (const level of [200, 400, 800]) add('unprepared', 'round', level, []);
    return result;
}

export function validateQuanzhenCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'quanzhen');
    assert.equal(p.collection_group, 'quanzhen-combination');
    assert.equal(raw.method, condition.method);
    assert.deepEqual(p.actor.preparations, {});
    assert.equal(p.actor.mappings.force, undefined);
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, config.mappings);
        for (const [key, level] of Object.entries(config.skills)) assert.equal(state.skills[key], level);
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value);
        assert.equal(state.weapon, config.equipment?.type ?? 'none');
        assert.equal(state.effective_skills.force, 300);
        assert.ok(raw.metrics?.[side] && typeof raw.metrics[side] === 'object'
            && !Array.isArray(raw.metrics[side]), '缺失计数不是零');
        if (Object.hasOwn(raw.metrics[side], 'neili_cost'))
            assert.ok(Number.isFinite(raw.metrics[side].neili_cost));
    }
    if (p.combination.endsWith('dex8-round')) assert.equal(raw.before[0].effective_dex, 8);
    validateWudangCombinationRecord(raw, condition);
    if (condition.method === 'interface') assert.deepEqual(raw.immediate, raw.before, '互备声明查询不修改状态');
    if (condition.method !== 'round') assert.deepEqual(raw.immediate[1], raw.before[1]);
    if (condition.method === 'round' && p.combination.endsWith('dex8-round'))
        assert.ok(raw.attacks.filter(a => a.actor === 0 && a.target === 1).length <= 1,
            '低身法分支不双击');
}
