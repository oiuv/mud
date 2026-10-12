// Original prepare commands and combat rounds; no game behavior or RNG changes.
import assert from 'node:assert/strict';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';
import { wudangCombinationEffects } from './school_combat_report.mjs';

export const gumuCombinationSkills = {
    'meinv-quan': 'unarmed', 'tianluo-diwang': 'strike', 'fireice-strike': 'strike',
    'chilian-shenzhang': 'strike', 'wudu-shenzhang': 'strike', 'sad-strike': 'unarmed',
};
export const gumuCombinationPairs = ['tianluo-diwang', 'fireice-strike'];
export const gumuCombinationFixtureRequirements = [
    'Register only after the running frozen batch ends; reuse original prepare commands and fight round dispatcher.',
    'Allow valid_combine only for the configured source; preserve the misspelled meinv interface rather than adding an alias.',
    'Capture every prepare step and actual mapping key order; never prefill two preparations or the action flag.',
    'Keep original random guarding, second attack and counterattacks; no special force mapping in this isolation experiment.',
];
const names = Object.keys(gumuCombinationSkills), meinv = 'meinv-quan';
const prep = skills => Object.fromEntries(skills.map(s => [gumuCombinationSkills[s], s]));
const step = (action, skills, accepted = 1) => ({ action, accepted, preparations: prep(skills) });
const pairSteps = (palm, first, route) => {
    const second = first === palm ? meinv : palm;
    if (route === 'sequential') return [step('prepare ' + first, [first]),
        step('prepare ' + second, second === palm ? [first, second] : [first], Number(second === palm))];
    const args = route === 'basics' ? [first, second].map(s => gumuCombinationSkills[s]) : [first, second];
    return [step('prepare ' + args.join(' '), first === palm ? [first, second] : [], Number(first === palm))];
};

export function gumuCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const id of [...names, 'yunv-jian']) assert.ok(catalog.skills.some(s => s.id === id), id);
    const rows = [];
    function add(id, method, level, steps = [], extra = {}) {
        const skill = extra.skill ?? meinv, source = catalog.skills.find(s => s.id === skill);
        const actor = { skills: { unarmed: level, strike: level, sword: level, 'yunv-jian': level,
            ...Object.fromEntries(names.map(s => [s, level])), force: 600, parry: level,
            dodge: extra.dex8 ? 0 : 600, ...extra.skills },
            mappings: { unarmed: meinv, strike: extra.palm ?? 'tianluo-diwang', parry: meinv,
                sword: 'yunv-jian', ...extra.mappings }, preparations: {},
            properties: { str: 36, dex: extra.dex8 ? 8 : 36, neili: 6000, max_neili: 6000,
                jiali: extra.jiali ?? 0, gender: '女性', 'family/family_name': '古墓派' },
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}) };
        for (const key of extra.unmapped ?? []) delete actor.mappings[key];
        rows.push({ id: `school-gumu-combination-${id}-l${level}`, stage: 'school', entry_id: source.path,
            method, samples: smoke ? 2 : method === 'round' ? samples : 2,
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-combination', skill, level,
                combination: id, ability: method, observation: 'single_action_immediate', actor,
                target: { skills: { unarmed: 600, force: 600, dodge: 600, parry: 600 }, mappings: {},
                    properties: { str: 36, dex: 36, neili: 6000, max_neili: 6000, jiali: 0 },
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                    function: 'valid_combine', combo: extra.combo },
                    combine_result: gumuCombinationPairs.includes(skill) ? Number(extra.combo === meinv) : null }
                    : { prepare_commands: steps }),
                fighting: method === 'round', observe_seconds: 0, not_applicable: '',
                expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
                qualification_sources: ['cmds/skill/prepare.c', 'feature/skill.c', 'feature/action.c', 'feature/attack.c',
                    'feature/attribute.c', 'adm/daemons/combatd.c', 'include/combat.h', 'inherit/skill/skill.c',
                    'feature/clean_up.c', 'kungfu/class/gumu/lin.c', 'kungfu/class/gumu/longnv.c',
                    'kungfu/class/gumu/yang.c', 'kungfu/class/gumu/li.c', 'kungfu/class/gumu/gumu.h',
                    ...[...names, 'yunv-jian', 'unarmed', 'sword'].map(s => 'kungfu/skill/' + s + '.c')],
                qualification_note: '真实非巫师USER，技能为实验赋值而非向教师学到。两掌各与美女拳法的互备有源码及原教学来源；MA-011拼写错误原样保留。'
                    + '双参数检查第一门，分步检查新加入一门；失败后的原准备状态必须继续保留，不绕过命令。'
                    + '其余三门只查互备声明及单备，不将缺接口当作不能单独使用。单轮只测美女／天罗／冰火及原持剑对照，五毒／黯然附伤另组采。'
                    + '基本内功600不映射特殊内功，隔离互备；加力不冒充正常完整配功。原fight保留守势、反击、随机双击与实际keys顺序，不是完整交锋。',
            } });
    }
    for (const a of names) for (const b of [...names, 'not-a-skill'])
        add(`${a}-allows-${b}`, 'interface', 200, [], { skill: a, combo: b });
    for (const palm of gumuCombinationPairs) {
        const addPair = (id, method, level, steps, extra = {}) =>
            add(palm + '-' + id, method, level, steps, { palm, ...extra });
        const accepted = pairSteps(palm, palm, 'names');
        for (const level of [200, 400, 800]) {
            for (const first of [meinv, palm]) for (const route of ['names', 'basics', 'sequential'])
                addPair(`${first}-${route}`, 'prepare', level, pairSteps(palm, first, route));
            for (const jiali of [0, 50]) {
                for (const first of [meinv, palm]) {
                    addPair(`${first}-solo-j${jiali}`, 'round', level, [step('prepare ' + first, [first])], { jiali });
                    for (const route of ['names', 'sequential'])
                        addPair(`${first}-${route}-j${jiali}`, 'round', level, pairSteps(palm, first, route), { jiali });
                }
            }
        }
        addPair('cancel-and-replace', 'prepare', 200, [...accepted, step('prepare none', []),
            step('prepare ' + palm, [palm])]);
        addPair('third-refused', 'prepare', 200, [...accepted, step('prepare wudu-shenzhang', [palm, meinv], 0)]);
        addPair('three-at-once', 'prepare', 200, [step(`prepare ${palm} ${meinv} wudu-shenzhang`, [], 0)]);
        addPair('pair-while-one', 'prepare', 200, [step('prepare ' + palm, [palm]),
            step(`prepare ${palm} ${meinv}`, [palm], 0)]);
        addPair('same-skill', 'prepare', 200, [step(`prepare ${palm} ${palm}`, [], 0)]);
        addPair('repeat-one', 'prepare', 200, [step('prepare ' + palm, [palm]), step('prepare ' + palm, [palm], 0)]);
        addPair('unlearned', 'prepare', 200, [step(`prepare ${palm} ${meinv}`, [], 0)], { skills: { [meinv]: 0 } });
        addPair('unmapped', 'prepare', 200, [step(`prepare ${palm} ${meinv}`, [], 0)], { unmapped: ['unarmed', 'strike'] });
        addPair('cancel-empty', 'prepare', 200, [step('prepare none', [], 0)]);
        addPair('no-minimum', 'prepare', 1, accepted);
        addPair('no-minimum-reverse', 'prepare', 1, pairSteps(palm, meinv, 'names'));
        addPair('armed-prepare', 'prepare', 200, accepted, { armed: true });
        for (const [id, extra] of [['armed-round', { armed: true }], ['busy-target-round', { targetBusy: true }],
            ['dex8-round', { dex8: true }]]) addPair(id, 'round', 400, accepted, extra);
        addPair('cancel-round', 'round', 400, [...accepted, step('prepare none', [])]);
    }
    for (const skill of names) add(skill + '-single-prepare', 'prepare', 200,
        [step('prepare ' + skill, [skill])], { skill, mappings: { [gumuCombinationSkills[skill]]: skill } });
    for (const s of ['chilian-shenzhang', 'wudu-shenzhang', 'sad-strike']) for (const [a, b] of [[s, meinv], [meinv, s]])
        add(`${a}-${b}-incompatible`, 'prepare', 200, [step(`prepare ${a} ${b}`, [], 0)],
            { skill: s, mappings: { [gumuCombinationSkills[s]]: s } });
    for (const [a, b] of [gumuCombinationPairs, [...gumuCombinationPairs].reverse()])
        add(`${a}-${b}-incompatible`, 'prepare', 200, [step(`prepare ${a} ${b}`, [], 0)]);
    add('unprepared-mapped', 'round', 400);
    add('unprepared-basic', 'round', 400, [], { unmapped: ['unarmed'] });
    return rows;
}

function knownMetric(m, key) {
    const n = Object.hasOwn(m, key) ? m[key] : 0;
    assert.ok(Number.isSafeInteger(n) && n >= 0, key); return n;
}
export function validateGumuCombinationRecord(raw, c) {
    const p = c.parameters;
    assert.equal(p.school, 'gumu'); assert.equal(p.collection_group, 'gumu-combination');
    assert.equal(raw.method, c.method); assert.deepEqual(p.actor.preparations, {});
    assert.equal(p.actor.mappings.force, undefined);
    for (const key of ['before', 'immediate', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    for (const key of ['attacks', 'interfaces', 'launches', 'prepare_steps']) assert.ok(Array.isArray(raw[key]), key);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], m = raw.metrics[side];
        assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0);
        assert.deepEqual(b.mappings, cfg.mappings);
        for (const [k, n] of Object.entries(cfg.skills)) assert.equal(b.skills[k], n);
        for (const [k, n] of Object.entries(cfg.properties)) assert.equal(k.includes('/') ? b.cultivation[k] : b[k], n);
        assert.equal(b.weapon, cfg.equipment?.type ?? 'none'); assert.equal(b.effective_skills.force, 300);
        const rawUnarmed = Math.max(...['unarmed', 'cuff', 'hand', 'finger', 'claw', 'strike'].map(k => cfg.skills[k] ?? 0));
        assert.equal(b.effective_str, cfg.properties.str + Math.trunc(rawUnarmed / 10));
        assert.equal(b.effective_dex, cfg.properties.dex + Math.trunc(cfg.skills.dodge / 10));
        assert.ok(m && typeof m === 'object' && !Array.isArray(m));
        for (const k of ['neili_cost', 'neili_recovery', 'heartbeats', 'direct']) assert.equal(knownMetric(m, k), 0);
        assert.equal(raw.immediate[side].neili, b.neili);
    }
    validateWudangCombinationRecord(raw, c);
    for (const s of [raw.before[0], ...raw.prepare_steps.flatMap(s => [s.before, s.after]), raw.immediate[0]]) {
        assert.ok(Array.isArray(s.preparation_order));
        assert.deepEqual([...s.preparation_order].sort(), Object.keys(s.preparations).sort(), '实际准备keys不完整');
    }
    if (c.method === 'interface') assert.deepEqual(raw.immediate, raw.before);
    if (c.method !== 'round') assert.deepEqual(raw.immediate[1], raw.before[1]);
    else {
        const hits = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
        if (raw.before[0].effective_dex <= 8 || p.actor.equipment) assert.ok(hits.length <= 1);
        if (raw.before[0].effective_str > Math.max(0, Math.trunc(raw.before[1].effective_str * 3 / 4) - 1))
            assert.ok(hits.length > 0, '原膂力判定必然进攻时不能虚构守势');
        for (const hit of raw.attacks) assert.ok(hit.actor === 0 && hit.target === 1 || hit.actor === 1 && hit.target === 0);
    }
}

export function gumuCombinationEffects(rows) {
    // Do not turn missing records into zero attacks or unsuccessful preparations.
    const usable = rows.filter(r => r.raw && ['observed', 'refused'].includes(r.outcome)
        && Array.isArray(r.raw.prepare_steps) && Array.isArray(r.raw.attacks)
        && r.raw.immediate?.[0]?.preparations);
    return { samples: usable.length, unknown_samples: rows.length - usable.length,
        ...wudangCombinationEffects(usable) };
}
