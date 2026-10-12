// Original prepare/fight behavior. Pair declarations do not prove teaching access.
import assert from 'node:assert/strict';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';

export const emeiCombinations = {
    'jieshou-jiushi': 'hand', 'jinding-zhang': 'strike', 'tiangang-zhi': 'finger',
};
const names = Object.keys(emeiCombinations);
const other = ['piaoxue-zhang', 'sixiang-zhang'];
const usage = skill => emeiCombinations[skill] ?? (other.includes(skill) ? 'strike' : undefined);
const preparations = skills => Object.fromEntries(skills.map(s => [usage(s), s]));
const command = (action, skills, accepted = 1) => ({ action, accepted, preparations: preparations(skills) });

export function emeiCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const skill of [...names, ...other, 'emei-jian'])
        assert.ok(catalog.skills.some(s => s.id === skill), '缺少峨嵋组合来源：' + skill);
    const result = [];
    function add(id, method, level, steps = [], extra = {}) {
        const skill = extra.skill ?? names[0], source = catalog.skills.find(s => s.id === skill);
        const actor = { skills: { unarmed: level, hand: level, strike: level, finger: level,
            sword: level, 'emei-jian': level, force: 600, parry: level, dodge: extra.dex8 ? 0 : 600,
            ...Object.fromEntries([...names, ...other].map(s => [s, level])), ...extra.skills },
            mappings: { ...Object.fromEntries(names.map(s => [usage(s), s])),
                sword: 'emei-jian', parry: names[0], ...extra.mappings },
            preparations: {}, properties: { str: 36, dex: extra.dex8 ? 8 : 36, jiali: extra.jiali ?? 0,
                neili: 6000, max_neili: 6000, gender: '女性', 'family/family_name': '峨嵋派' },
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}) };
        for (const key of extra.unmapped ?? []) delete actor.mappings[key];
        result.push({ id: `school-emei-combination-${id}-l${level}`, stage: 'school', entry_id: source.path,
            method, samples: smoke ? 2 : method === 'round' ? samples : 2,
            parameters: { school: 'emei', family: '峨嵋派', collection_group: 'emei-combination',
                skill, level, combination: id, ability: method, observation: 'single_action_immediate', actor,
                target: { skills: { unarmed: 600, force: 600, dodge: 600, parry: 600 }, mappings: {},
                    properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                    function: 'valid_combine', combo: extra.combo },
                    combine_result: other.includes(skill) ? null : Number(names.includes(extra.combo) && extra.combo !== skill) }
                    : { prepare_commands: steps }),
                fighting: method === 'round', observe_seconds: 0, not_applicable: '',
                expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
                qualification_sources: ['cmds/skill/prepare.c', 'feature/skill.c', 'feature/action.c',
                    'feature/attack.c', 'feature/attribute.c', 'adm/daemons/combatd.c', 'include/combat.h',
                    'inherit/skill/skill.c', 'feature/clean_up.c', 'kungfu/class/emei/miejue.c',
                    ...[...names, ...other, 'emei-jian', 'sword', 'unarmed'].map(s => 'kungfu/skill/' + s + '.c')],
                qualification_note: '真实非巫师女性USER；灭绝已学五门并实际互备金顶/截手，其他两组依原双向valid_combine作为实验组合，不宣称原NPC全部使用或同培养成本。全部准备/取消经原命令，不预写preparations/action_flag；不激发特殊内功，保留加力原行为。一次原fight不是一击或完整交锋，允许守势、随机双击和反击；按原映射实际keys顺序采招式，不用输入顺序替代。飘雪/四象无互备接口，仍分别观察原单备和单轮攻击，不凭缺接口认定不会出招。',
            } });
    }
    for (const a of [...names, ...other]) for (const b of [...names, ...other, 'not-a-skill'])
        add(`${a}-allows-${b}`, 'interface', 200, [], { skill: a, combo: b });
    for (const level of [200, 400, 800]) for (const a of names) for (const b of names.filter(s => s !== a)) {
        for (const route of ['names', 'basics', 'sequential']) {
            const steps = route === 'sequential'
                ? [command('prepare ' + a, [a]), command('prepare ' + b, [a, b])]
                : [command(`prepare ${route === 'names' ? a + ' ' + b : usage(a) + ' ' + usage(b)}`, [a, b])];
            add(`${a}-${b}-${route}`, 'prepare', level, steps);
        }
    }
    const [a, b, c] = names, pair = [command(`prepare ${a} ${b}`, [a, b])];
    add('cancel-and-replace', 'prepare', 200, [...pair, command('prepare none', []), command('prepare ' + c, [c])]);
    add('third-refused', 'prepare', 200, [...pair, command('prepare ' + c, [a, b], 0)]);
    add('three-at-once', 'prepare', 200, [command(`prepare ${a} ${b} ${c}`, [], 0)]);
    add('pair-while-one', 'prepare', 200, [command('prepare ' + a, [a]), command(`prepare ${b} ${c}`, [a], 0)]);
    add('same-skill', 'prepare', 200, [command(`prepare ${a} ${a}`, [], 0)]);
    add('repeat-one', 'prepare', 200, [command('prepare ' + a, [a]), command('prepare ' + a, [a], 0)]);
    for (const s of other) add(s + '-incompatible', 'prepare', 200,
        [command(`prepare ${s} ${a}`, [], 0)], { skill: s, mappings: { strike: s } });
    add('wrong-type', 'prepare', 200, [command('prepare sword', [], 0)]);
    add('unlearned', 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)], { skills: { [b]: 0 } });
    add('unmapped', 'prepare', 200, [command(`prepare ${a} ${b}`, [], 0)], { unmapped: ['hand', 'strike'] });
    add('cancel-empty', 'prepare', 200, [command('prepare none', [], 0)]);
    add('no-minimum', 'prepare', 1, pair);
    add('armed-prepare', 'prepare', 200, pair, { armed: true });
    const selections = [[], ...[...names, ...other].map(s => [s]),
        ...names.flatMap(a => names.filter(b => b !== a).map(b => [a, b]))];
    for (const level of [200, 400, 800]) for (const selected of selections) for (const jiali of [0, 50])
        add(`${selected.join('-') || 'unprepared'}-jiali${jiali}`, 'round', level,
            selected.length ? [command('prepare ' + selected.join(' '), selected)] : [],
            { jiali, ...(other.includes(selected[0]) ? { skill: selected[0], mappings: { strike: selected[0] } } : {}) });
    add('cancel-round', 'round', 400, [...pair, command('prepare none', [])]);
    add('armed-round', 'round', 400, pair, { armed: true });
    add('busy-target-round', 'round', 400, pair, { targetBusy: true });
    add('dex8-round', 'round', 400, pair, { dex8: true });
    return result;
}

export function validateEmeiCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.method, condition.method); assert.equal(p.school, 'emei');
    assert.deepEqual(p.actor.preparations, {}); assert.equal(p.actor.mappings.force, undefined);
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
        if (Object.hasOwn(raw.metrics[side], 'neili_cost')) assert.ok(Number.isFinite(raw.metrics[side].neili_cost));
    }
    if (p.combination === 'dex8-round') assert.equal(raw.before[0].effective_dex, 8);
    validateWudangCombinationRecord(raw, condition);
    if (condition.method === 'interface') assert.deepEqual(raw.immediate, raw.before, '互备声明查询不修改状态');
    if (condition.method !== 'round') assert.deepEqual(raw.immediate[1], raw.before[1]);
}
