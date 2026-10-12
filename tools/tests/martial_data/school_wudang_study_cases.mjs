// Research through the original command, and upgrades through original improve_skill.
import assert from 'node:assert/strict';
import { wudangLearningProfiles } from './school_wudang_learning_cases.mjs';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';
import { validateQuanzhenStudyRecord } from './school_quanzhen_study_cases.mjs';

export const wudangStudyProfiles = [...wudangLearningProfiles.map(([skill, usage]) => [skill, usage]),
    ...wudangForces.map(skill => [skill, 'force'])];

// No related action-bearing special skill or cognition in this non-force cohort.
export function wudangStudyBound(p) {
    assert.notEqual(p.usage, 'force');
    const s = p.actor.skills, level = s[p.skill];
    const slots = p.usage === 'dodge' ? ['dodge', 'move']
        : p.usage === 'throwing' ? ['throwing'] : [p.usage, 'parry'];
    const related = slots.map(k => s[k] ?? 0).filter(Boolean).sort((a, b) => b - a);
    const scale = [80, 120, 90, 55, 30, 15, 5, 2, 1];
    let value = related.reduce((sum, n, i) => sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    value = Math.trunc(Math.trunc(value / 15) / 100);
    value += Math.trunc(level / 50) + Math.trunc((p.actor.properties.int / (level >= 500 ? 6 : 12)) ** 2);
    if (p.actor.properties['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    return 1 + Math.trunc((value - 1) * 100 / (level + 100));
}

export function wudangStudyConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, usage, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少武当原技能：' + skill);
        const upgrade = extra.upgrade === true, basic = level + Number(upgrade);
        const force = usage === 'force' ? skill : 'taiji-shengong';
        const actor = {
            skills: { force: Math.max(400, basic), taoism: Math.max(400, basic),
                [force]: usage === 'force' ? level : 400,
                ...(skill === 'taiji-jian' ? { 'taiji-quan': 100 } : {}),
                [usage]: basic, [skill]: level, ...extra.skills },
            mappings: { force, [usage]: skill },
            properties: { jiali: 0, qi: 10000, jing: 10000, eff_jing: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, gender: '男性',
                character: '光明磊落', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '武当派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.unmapped) delete actor.mappings[usage];
        if (extra.unmappedForce) delete actor.mappings.force;
        for (const learned of Object.keys(actor.skills))
            assert.ok(catalog.skills.some(s => s.id === learned), '实验技能必须有真实定义：' + learned);
        const weapon = extra.weapon ?? (['sword', 'blade'].includes(usage) ? usage : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        const expected = extra.expected ?? 'observed', times = extra.times ?? 1;
        result.push({ id: `school-wudang-study-${skill}-${upgrade ? 'upgrade' : 'research'}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: upgrade ? 'upgrade' : 'research',
            samples: smoke ? 2 : extra.checks ?? (upgrade || expected === 'refused' ? 2 : samples),
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-study',
                combination: extra.suffix ?? 'single-skill', skill, usage, level,
                ability: upgrade ? 'skill_improved' : 'research', actor,
                target: { skills: {}, mappings: {}, properties: {} }, action: `research ${skill} ${times}`,
                ...(upgrade ? { primer: { skill, amount: 10000000, weak_mode: 1 }, cycles: 1 } : {}),
                repetitions: times, completed: extra.completed ?? (expected === 'refused' ? 0 : times),
                command_return: extra.commandReturn ?? Number(expected !== 'refused'), clear_jing: extra.clearJing ?? false,
                observation: 'single_action_immediate', fighting: extra.fighting ?? false,
                observe_seconds: 0, not_applicable: '', expected,
                qualification_sources: [...new Set([source.path, 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'inherit/skill/skill.c', 'inherit/skill/force.c', 'include/globals.h',
                    'kungfu/skill/force.c', 'kungfu/skill/taiji-shengong.c', 'kungfu/skill/taiji-quan.c',
                    'kungfu/skill/baihua-cuoquan.c', 'clone/user/user.c'])],
                qualification_note: '真实非巫师USER经原research；普通样本基本功与目标技能同级，升级样本基本功高一级。非内功研究仅配太极神功400，道学至少400，太极剑另配太极拳100；内功只测升级，不混入已冻结修养批次。先天悟性根骨36、经验1亿，无修养/房间加成，转世只在显式武星条件开启。不代表同培养成本或教师可教上限。升级先经原improve_skill弱模式预置超阈值进度并留快照，再研究一次，不直接调用回调。',
            } });
    }
    for (const [skill, usage] of wudangStudyProfiles) {
        for (const level of [199, 399, 799]) add(skill, usage, level, { upgrade: true });
        if (usage === 'force') continue;
        for (const level of [200, 400, 800]) add(skill, usage, level);
        for (const level of [499, 500]) add(skill, usage, level, { checks: 2 });
        const check = (suffix, extra = {}) => add(skill, usage, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        check('unmapped', { unmapped: true });
        check('neili0', { properties: { neili: 0 }, expected: skill === 'shenmen-jian' ? 'refused' : 'observed' });
        check('times100', { times: 100 });
        check('partial', { times: 3, completed: 2, clearJing: true, properties: { jing: 60 } });
        check('weapon', { weapon: ['unarmed', 'strike', 'claw', 'hand'].includes(usage) ? 'sword' : 'none',
            expected: ['unarmed', 'strike', 'claw', 'hand'].includes(usage) ? 'refused' : 'observed' });
        check('basic199', { skills: { [usage]: 199 },
            expected: ['paiyun-shou', 'tiyunzong'].includes(skill) ? 'observed' : 'refused' });
        check('related-parry', { skills: { parry: 200 },
            checks: ['wudang-jian', 'furong-jinzhen', 'tiyunzong'].includes(skill) ? samples : 2 });
        const refuse = (suffix, extra = {}) => check(suffix, { expected: 'refused', ...extra });
        refuse('busy', { busy: true }); refuse('fighting', { fighting: true });
        refuse('skill179', { skills: { [skill]: 179 } });
        refuse('potential0', { properties: { potential: 0 } });
        refuse('exp799999', { properties: { combat_exp: 799999 }, commandReturn: 1 });
        refuse('jing26', { properties: { jing: 26 }, commandReturn: 1, clearJing: true });
        refuse('eff-jing26', { properties: { eff_jing: 26, jing: 26 } });
        refuse('no-learn', { properties: { 'env/no_learn': skill } });
        const profile = wudangLearningProfiles.find(p => p[0] === skill);
        if (profile[2]) for (const value of [profile[2] - 1, profile[2]]) check('effective-force' + value, {
            skills: { force: value * 2 }, unmappedForce: true, expected: value < profile[2] ? 'refused' : 'observed' });
        if (profile[3]) for (const value of [profile[3] - 1, profile[3]]) check('maxneili' + value, {
            properties: { max_neili: value }, expected: value < profile[3] ? 'refused' : 'observed' });
    }
    const check = (skill, suffix, extra = {}) => add(skill, wudangStudyProfiles.find(p => p[0] === skill)[1], 200,
        { suffix: '-' + suffix, checks: 2, ...extra });
    for (const skill of ['taiji-jian', 'taiji-quan']) for (const int of [25, 26]) check(skill, 'int' + int,
        { properties: { int }, expected: int < 26 ? 'refused' : 'observed' });
    for (const level of [99, 100]) check('taiji-jian', 'quan' + level,
        { skills: { 'taiji-quan': level }, expected: level < 100 ? 'refused' : 'observed' });
    for (const neili of [299, 300]) check('shenmen-jian', 'neili' + neili,
        { properties: { neili }, expected: neili < 300 ? 'refused' : 'observed' });
    check('wudang-zhang', 'baihua-known', { skills: { 'baihua-cuoquan': 1 }, expected: 'refused' });
    check('wudang-jian', 'wuxing', { properties: { 'special_skill/wuxing': 1 }, checks: samples });
    return result;
}

export function validateWudangStudyRecord(raw, condition) {
    // The same invariant checks apply to the inherited empty upgrade callback.
    validateQuanzhenStudyRecord(raw, condition, wudangStudyBound);
}
