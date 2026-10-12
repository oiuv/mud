// Registered school group: original research and a separately labelled weak-mode primer.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';
import { gumuWeaponLearningProfiles, gumuWeaponLearningAllowed } from './school_gumu_weapon_learning_cases.mjs';
import { gumuUnarmedLearningProfiles, gumuUnarmedLearningAllowed } from './school_gumu_unarmed_learning_cases.mjs';

export const gumuResearchProfiles = [...gumuWeaponLearningProfiles, ...gumuUnarmedLearningProfiles]
    .map(([skill, usage]) => ({ skill, usage, difficult: skill === 'xuantie-jian' ? 500 : 0 }));
export const gumuResearchFixtureRequirements = [
    'Register only gumu-research and freeze this module plus its direct imports; pass the frozen condition to validation and reporting.',
    'Use the existing real non-wizard USER and original research command; record raw/effective skills, progress, resources, character and room restrictions.',
    'Prepare the six dynamic skill tables through original enable in the configured USER context before mappings/wield/snapshot; preserve the first table and original RNG.',
    'Add only this group to the existing upgrade route: original improve_skill(skill,10000000,1), before/primed snapshots, then one original research; never call skill_improved directly.',
    'Record actual no_fight/pigging/research_improve room values and clear them between samples; keep preparation, partial study and refused commands separate.',
];
const group = 'gumu-research';
const fields = ['character', 'family/family_name', 'special_skill/wuxing', 'env/no_learn',
    'tattoo/tattoo_str', 'reborn/str', 'tattoo/tattoo_dex', 'reborn/dex'];
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
const dynamicSkills = ['suxin-jian', 'quanzhen-jian', 'yinsuo-jinling', 'sanwu-shou', 'wudu-shenzhang', 'sad-strike'];
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const idle = value => value === null ? 0 : value;
const profile = skill => { const d = gumuResearchProfiles.find(p => p.skill === skill); assert.ok(d, skill); return d; };

export function gumuResearchAllowed(p) {
    return (gumuWeaponLearningProfiles.some(d => d[0] === p.skill)
        ? gumuWeaponLearningAllowed : gumuUnarmedLearningAllowed)(p, 'valid_learn');
}

// These fifteen special skills only use the configured basic usage and (except needles)
// basic parry as related study skills. No action-bearing sibling skill is configured.
export function gumuResearchBound(p) {
    const d = profile(p.skill), s = p.actor.skills, q = p.actor.properties, level = s[p.skill];
    const related = [s[d.usage], ...(d.usage === 'throwing' ? [] : [s.parry])]
        .filter(n => n > 0).sort((a, b) => b - a);
    let bound = related.reduce((sum, n, i) => sum + Math.trunc(n * [80, 120][i] / (level >= 500 ? 2 : 1)), 0);
    bound = Math.trunc(Math.trunc(bound / 15) / (100 + d.difficult));
    bound += Math.trunc(level / 50) + Math.trunc((q.int / (level >= 500 ? 6 : 12)) ** 2);
    if (q['special_skill/wuxing']) bound += Math.trunc(bound * 20 / 100);
    bound += Math.trunc(bound * (p.room.research_improve ?? 0) / 100);
    assert.ok(Number.isSafeInteger(bound) && bound > 0);
    return bound;
}

export function gumuResearchProgress(p, amount) {
    assert.ok(Number.isSafeInteger(amount) && amount >= 0);
    amount += Math.trunc(amount * (p.actor.skills['martial-cognize'] ?? 0) / 500);
    return 1 + Math.trunc(amount * 100 / (p.actor.skills[p.skill] + 100));
}

// Static oracle for the original command. Return 1 alone does not imply any study.
export function gumuResearchPlan(p) {
    const a = p.actor, q = a.properties, level = a.skills[p.skill], cost = Math.trunc(1000 / q.int);
    assert.ok(cost > 0);
    let command_return = 0, completed = 0, clear_jing = false, entered_loop = false;
    const gate = !p.room.pigging && !a.busy && !p.fighting && !p.room.no_fight
        && p.repetitions >= 1 && p.repetitions <= 100 && level >= 180 && gumuResearchAllowed(p)
        && !q['env/no_learn'] && q.potential - q.learned_points >= p.repetitions && q.eff_jing >= cost;
    if (gate) {
        command_return = 1;
        if (q.combat_exp >= Math.trunc(level ** 3 / 10)) {
            entered_loop = true;
            completed = Math.min(p.repetitions, Math.trunc(q.jing / cost));
            clear_jing = completed < p.repetitions;
        }
    }
    return { command_return, completed, clear_jing, entered_loop, expected: completed ? 'observed' : 'refused' };
}

export function gumuResearchConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const result = [];
    function add(skill, level = 200, extra = {}) {
        const d = profile(skill), source = catalog.skills.find(s => s.id === skill);
        assert.ok(source?.path && /^[a-f0-9]{64}$/.test(source.sha256), '缺少研究原技能：' + skill);
        const weapon = extra.weapon ?? (['sword', 'whip'].includes(d.usage) ? d.usage : 'none');
        const actor = { skills: { force: Math.max(600, level + 1), 'suxin-jue': 400, dodge: 400,
            'yunv-shenfa': 400, parry: level + 1, [d.usage]: Math.max(skill === 'sad-strike' ? 200 : 0, level + 1),
            [skill]: level, ...(skill === 'xuantie-jian' ? { 'martial-cognize': 220 } : {}), ...extra.skills },
        mappings: { force: 'suxin-jue', dodge: 'yunv-shenfa', [d.usage]: skill }, preparations: {},
        properties: { qi: 10000, eff_qi: 10000, jing: 10000, eff_jing: 10000, neili: 6000, max_neili: 6000,
            str: 36, int: 36, con: 36, dex: 36, gender: skill === 'sad-strike' ? '男性' : '女性',
            character: ['sanwu-shou', 'wudu-shenzhang'].includes(skill) ? '心狠手辣' : '光明磊落',
            combat_exp: 100000000, potential: 10000, learned_points: 0, 'family/family_name': '古墓派', ...extra.properties },
        ...(extra.busy ? { busy: 2 } : {}) };
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        if (extra.unmapped) delete actor.mappings[d.usage];
        const upgrade = !!extra.upgrade;
        const p = { school: 'gumu', family: '古墓派', collection_group: group, skill, usage: d.usage, level,
            ability: upgrade ? 'skill_improved' : 'research', combination: extra.suffix ?? 'baseline', actor,
            target: { skills: {}, mappings: {}, preparations: {}, properties: {} }, room: extra.room ?? {},
            repetitions: extra.times ?? 1, action: `research ${skill} ${extra.times ?? 1}`,
            ...(upgrade ? { primer: { skill, amount: 10000000, weak_mode: 1 }, cycles: 1 } : {}),
            observation: 'single_action_immediate', observe_seconds: 0, fighting: !!extra.fighting, not_applicable: '',
            qualification_sources: [...new Set([source.path, 'cmds/skill/research.c', 'cmds/skill/learn.c',
                'cmds/skill/enable.c', 'feature/skill.c', 'feature/attribute.c', 'feature/equip.c',
                'inherit/skill/skill.c', 'include/globals.h', 'clone/user/user.c', 'kungfu/skill/suxin-jue.c',
                'kungfu/skill/yunv-shenfa.c', 'kungfu/skill/force.c', 'kungfu/skill/parry.c',
                'kungfu/skill/dodge.c', 'kungfu/skill/' + d.usage + '.c',
                ...(actor.skills['martial-cognize'] ? ['kungfu/skill/martial-cognize.c'] : []),
                ...(actor.skills.literate ? ['kungfu/skill/literate.c'] : [])])],
            qualification_note: '真实非巫师USER执行原research；基本功/招架通常高目标一级，内功至少600/素心诀400，轻功400/玉女身法400，先天四维36、经验一亿；玄铁显式修养220。仅配置一门兵器或徒手，不补外派资格；200/400/800为归一化观察而非师父教学上限。升级仅用原improve_skill弱模式预置进度后执行原research，预置不计自然修炼收益。15门均继承空skill_improved，不虚构奖励。',
        };
        Object.assign(p, gumuResearchPlan(p));
        if (upgrade) assert.equal(p.completed, 1, '跨级条件必须实际可研究');
        result.push({ id: `school-gumu-research-${skill}-${upgrade ? 'upgrade' : 'study'}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method: upgrade ? 'upgrade' : 'research',
            samples: smoke ? 1 : extra.baseline ? samples : 2, parameters: p });
    }
    for (const { skill, usage } of gumuResearchProfiles) {
        for (const level of [200, 400, 800]) add(skill, level, { baseline: true });
        for (const level of [179, 180]) add(skill, level);
        add(skill, 200, { suffix: 'learn-gate', ...(skill === 'yunv-jian' ? { weapon: 'none' } : { skills: { [usage]: 199 } }) });
        add(skill, 199, { upgrade: true });
    }
    for (const skill of ['yunv-jian', 'xuantie-jian']) for (const level of [499, 500]) add(skill, level);
    const check = (suffix, extra = {}) => add('yunv-jian', 200, { suffix, ...extra });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['pigging', { room: { pigging: 1 } }], ['no-fight', { room: { no_fight: 1 } }],
        ['no-learn', { properties: { 'env/no_learn': 'yunv-jian' } }]]) check(suffix, extra);
    for (const times of [0, 101, 100]) check('times' + times, { times });
    check('potential0', { properties: { potential: 0 } });
    for (const potential of [2, 3]) check('times3-potential' + potential, { times: 3, properties: { potential } });
    for (const eff_jing of [26, 27]) check('eff-jing' + eff_jing, { properties: { eff_jing, jing: eff_jing } });
    for (const jing of [26, 27]) check('jing' + jing, { properties: { jing } });
    check('partial', { times: 3, properties: { jing: 60 } });
    for (const combat_exp of [799999, 800000]) check('exp' + combat_exp, { properties: { combat_exp } });
    check('unmapped', { unmapped: true });
    check('low-body', { properties: { qi: 1, neili: 0 } });
    check('wuxing', { properties: { 'special_skill/wuxing': 1 } });
    check('cognize500', { skills: { 'martial-cognize': 500 } });
    check('room50', { room: { research_improve: 50 } });
    check('all-bonuses', { properties: { 'special_skill/wuxing': 1 }, skills: { 'martial-cognize': 500 }, room: { research_improve: 50 } });
    check('no-parry', { skills: { parry: 0 } });
    check('effective-int', { skills: { literate: 500 } });
    check('int35', { properties: { int: 35 } });
    for (const level of [399, 799]) add('xuantie-jian', level, { upgrade: true });
    return result;
}

function stable(state) {
    const s = structuredClone(state);
    for (const key of ['skills', 'learned', 'effective_skills', 'jing', 'learned_points']) delete s[key];
    delete s.temp.notify_fail;
    if (mapping(s.temp.time)) { delete s.temp.time.research; if (!Object.keys(s.temp.time).length) delete s.temp.time; }
    return s;
}

export function validateGumuResearchRecord(raw, condition) {
    const p = condition.parameters, d = profile(p.skill), upgrade = condition.method === 'upgrade';
    assert.equal(p.collection_group, group); assert.equal(raw.outcome, p.expected);
    assert.ok(['research', 'upgrade'].includes(condition.method));
    for (const [key, value] of Object.entries(gumuResearchPlan(p))) assert.equal(p[key], value, '原研究预期：' + key);
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2, key);
    assert.deepEqual(raw.after, raw.immediate);
    for (const key of ['attacks', 'launches', 'interfaces', 'callbacks', 'terminals']) assert.deepEqual(raw[key], [], key);
    assert.ok(mapping(raw.research_room), '必须采实际房间状态');
    for (const key of ['no_fight', 'pigging', 'research_improve']) {
        assert.ok(Object.hasOwn(raw.research_room, key));
        assert.equal(raw.research_room[key] ?? 0, p.room[key] ?? 0, key);
    }
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], a = raw.immediate[side], m = raw.metrics[side];
        for (const state of [b, a]) {
            assert.ok(typeof state.object === 'string' && state.object.length > 0); assert.equal(state.object, b.object);
            for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1, key);
            assert.equal(state.wizardp, 0);
            assert.ok(Object.hasOwn(state, 'busy') && Number.isSafeInteger(idle(state.busy)) && idle(state.busy) >= 0, 'busy缺失不是空闲');
            for (const key of resources) assert.ok(Number.isSafeInteger(state[key]) && state[key] >= 0, '未知资源：' + key);
            for (const key of ['skills', 'learned', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'temp', 'weapon_details']) assert.ok(mapping(state[key]), key);
            for (const key of ['skills', 'learned', 'effective_skills']) for (const value of Object.values(state[key])) assert.ok(Number.isSafeInteger(value), key + '未知数值');
            for (const value of Object.values(state.learned)) assert.ok(value >= 0);
            for (const key of fields) assert.ok(Object.hasOwn(state.cultivation, key), '遗漏属性：' + key);
        }
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.learned, {});
        assert.deepEqual(b.mappings, cfg.mappings); assert.deepEqual(b.preparations, cfg.preparations);
        assert.equal(idle(b.busy), cfg.busy ?? 0); assert.equal(a.busy, b.busy);
        for (const [key, value] of Object.entries(cfg.properties)) assert.equal(fields.includes(key) ? b.cultivation[key] : b[key], value, key);
        for (const key of fields) assert.equal(b.cultivation[key] ?? 0, cfg.properties[key] ?? 0, key);
        const apply = { armor: 100, ...(cfg.equipment ? { damage: 50, dodge: -1 } : {}) };
        assert.ok(mapping(b.temp.apply));
        for (const key of new Set([...Object.keys(apply), ...Object.keys(b.temp.apply)])) {
            if (Object.hasOwn(b.temp.apply, key)) assert.ok(Number.isSafeInteger(b.temp.apply[key]), key);
            assert.equal(b.temp.apply[key] ?? 0, apply[key] ?? 0, '装备加成：' + key);
        }
        for (const state of [b, a]) assert.deepEqual(state.effective_skills, Object.fromEntries(Object.entries(state.skills).map(([key, value]) =>
            [key, Math.trunc(value / 2) + (state.skills[cfg.mappings[key]] ?? 0) + (apply[key] ?? 0)])));
        assert.equal(b.weapon, cfg.equipment?.type ?? 'none');
        if (cfg.equipment) {
            const w = b.weapon_details;
            assert.ok(typeof w.object === 'string' && w.object.length > 0);
            assert.equal(w.program, '/tests/' + cfg.equipment.type); assert.equal(w.skill_type, cfg.equipment.type);
            assert.equal(w.weight, 3000); assert.equal(w.damage, 50); assert.equal(b.temp.weapon, w.object);
            assert.equal(b.weapon_damage, w.damage); assert.equal(b.weapon_flag, w.flag);
        } else assert.deepEqual(b.weapon_details, {});
        assert.ok(mapping(m));
        for (const [key, value] of Object.entries(m)) {
            assert.ok(Number.isSafeInteger(value) && value >= 0, '未知计量：' + key);
            if (key !== 'jing_cost') assert.equal(value, 0, '本组没有其它战斗/回复计量：' + key);
        }
        for (const key of resources) {
            assert.equal(m[key + '_cost'] ?? 0, b[key] - a[key], '单向资源账：' + key);
            assert.equal(m[key + '_recovery'] ?? 0, 0, key);
        }
    }
    const b = raw.before[0], a = raw.immediate[0];
    assert.deepEqual(raw.immediate[1], raw.before[1]); assert.ok(Object.values(raw.metrics[1]).every(n => n === 0));
    assert.equal(b.effective_int, b.int + Math.trunc((b.skills.literate ?? 0) / 10));
    assert.equal(b.effective_dex, b.dex + Math.trunc((b.skills.dodge ?? 0) / 10));
    assert.equal(b.effective_str, b.str + Math.trunc(Math.max(0, ...['unarmed', 'cuff', 'finger', 'strike', 'hand', 'claw'].map(k => b.skills[k] ?? 0)) / 10));
    assert.deepEqual(stable(a), stable(b), '研究和继承空升级回调不得附送属性/领悟或改变其它状态');
    assert.equal(a.learned_points - b.learned_points, p.completed);
    assert.equal(a.jing, p.clear_jing ? 0 : b.jing - p.completed * Math.trunc(1000 / b.int));
    if (p.entered_loop) assert.ok(Number.isSafeInteger(a.temp.time?.research) && a.temp.time.research > 0, '真实研究时间须来自原命令');
    else assert.equal(a.temp.time?.research, b.temp.time?.research, '早退不得伪造研究时间');
    const expectedSkills = { ...b.skills, [p.skill]: b.skills[p.skill] + Number(upgrade) };
    assert.deepEqual(a.skills, expectedSkills);
    if (upgrade) {
        assert.equal(raw.upgrades?.length, 1);
        const step = raw.upgrades[0], primed = structuredClone(b);
        assert.deepEqual(p.primer, { skill: p.skill, amount: 10000000, weak_mode: 1 }); assert.equal(p.cycles, 1);
        primed.learned[p.skill] = gumuResearchProgress(p, p.primer.amount);
        assert.deepEqual(step.before, b); assert.deepEqual(step.primed, primed, '原弱模式只预置进度，不提前升级/奖励');
        assert.ok(primed.learned[p.skill] > (p.level + 1) ** 2);
        assert.equal(step.implemented_by, '/inherit/skill/skill'); assert.equal(step.action, p.action);
        assert.equal(step.accepted, 1); assert.deepEqual(step.after, a); assert.deepEqual(a.learned, { [p.skill]: 0 });
    } else {
        if (Object.hasOwn(raw, 'upgrades')) assert.deepEqual(raw.upgrades, []);
        assert.equal(raw.command_accepted, p.command_return);
        if (p.completed) {
            assert.deepEqual(Object.keys(a.learned), [p.skill]);
            assert.ok(a.learned[p.skill] >= p.completed
                && a.learned[p.skill] <= p.completed * gumuResearchProgress(p, gumuResearchBound(p) - 1), '熟练度必须来自原random/improve公式');
        } else assert.deepEqual(a.learned, {});
    }
    if (dynamicSkills.includes(p.skill)) {
        const load = raw.skill_load_context;
        assert.ok(mapping(load), '动态招式表的原玩家加载上下文不可缺失');
        assert.equal(load.actor, b.object); assert.equal(load.command, `enable ${d.usage} ${p.skill}`);
        assert.ok([0, 1].includes(load.already_loaded)); assert.deepEqual(load.skills, p.actor.skills);
        assert.ok(p.actor.skills[d.usage] > 0, '不为通过enable暗补基础武功');
    }
    if (p.expected === 'refused') assert.ok(typeof raw.reason === 'string' && raw.reason.trim());
}

// Normalized ledger rows for one frozen condition; raw rows intentionally have no parameters.
export function gumuResearchEffects(rows, condition) {
    const p = condition?.parameters, known = rows.filter(r => ['observed', 'refused'].includes(r.outcome));
    const raws = known.map(r => r.raw), valid = p?.collection_group === group;
    const delta = (r, key) => Number.isFinite(r.before?.[0]?.[key]) && Number.isFinite(r.immediate?.[0]?.[key])
        ? r.immediate[0][key] - r.before[0][key] : null;
    const value = (r, phase, key) => valid && mapping(r[phase]?.[0]?.[key])
        ? Object.hasOwn(r[phase][0][key], p.skill) ? r[phase][0][key][p.skill] : 0 : null;
    const difference = (r, key) => {
        const b = value(r, 'before', key), a = value(r, 'immediate', key);
        return Number.isFinite(b) && Number.isFinite(a) ? a - b : null;
    };
    const accepted = r => condition?.method === 'upgrade' ? r.upgrades?.[0]?.accepted : r.command_accepted;
    return { ability: valid ? p.ability : 'unknown_ability', attempts: known.length,
        observed: known.filter(r => r.outcome === 'observed').length, refused: known.filter(r => r.outcome === 'refused').length,
        errors: rows.filter(r => r.outcome === 'error').length,
        command_accepted: valid ? raws.filter(r => accepted(r) === 1).length : null,
        accepted_without_growth: valid ? raws.filter(r => accepted(r) === 1 && delta(r, 'learned_points') === 0).length : null,
        partial_research: valid ? raws.filter(r => delta(r, 'learned_points') > 0 && delta(r, 'learned_points') < p.repetitions).length : null,
        completed_repetitions: distribution(raws.map(r => delta(r, 'learned_points'))),
        learned_points_delta: distribution(raws.map(r => delta(r, 'learned_points'))),
        skill_level_delta: distribution(raws.map(r => difference(r, 'skills'))),
        learned_net_delta: distribution(raws.map(r => difference(r, 'learned'))),
        study_progress_gain: distribution(raws.map(r => condition?.method === 'research' ? difference(r, 'learned') : null)),
        primer_progress: distribution(raws.map(r => valid && condition.method === 'upgrade' ? r.upgrades?.[0]?.primed?.learned?.[p.skill] ?? null : null)),
        jing_cost: distribution(raws.map(r => mapping(r.metrics?.[0]) ? Object.hasOwn(r.metrics[0], 'jing_cost') ? r.metrics[0].jing_cost : 0 : null)),
        jing_net_delta: distribution(raws.map(r => delta(r, 'jing'))),
        potential_balance_delta: distribution(raws.map(r => {
            const potential = delta(r, 'potential'), spent = delta(r, 'learned_points');
            return Number.isFinite(potential) && Number.isFinite(spent) ? potential - spent : null;
        })),
    };
}
