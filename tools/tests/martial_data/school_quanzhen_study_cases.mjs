// Original research and research-triggered level changes, separate from practice/teaching.
import assert from 'node:assert/strict';
import { quanzhenPracticeProfiles } from './school_quanzhen_practice_cases.mjs';

export const quanzhenStudyProfiles = quanzhenPracticeProfiles.map(([skill, usage]) => [skill, usage]);

// This cohort contains no action-bearing related special skill or cognition bonus.
export function studyProgressBound(p) {
    assert.notEqual(p.usage, 'force');
    const s = p.actor.skills, level = s[p.skill];
    const usages = p.usage === 'dodge' ? ['dodge', 'move']
        : p.skill === 'tonggui-jian' || p.usage === 'parry' ? [p.usage] : [p.usage, 'parry'];
    const related = usages.map(k => s[k] ?? 0).filter(Boolean).sort((a, b) => b - a);
    const scale = [80, 120, 90, 55, 30, 15, 5, 2, 1];
    let improve = related.reduce((sum, n, i) => sum + Math.trunc(n * scale[i] / (level >= 500 ? 2 : 1)), 0);
    improve = Math.trunc(Math.trunc(improve / 15) / 100);
    improve += Math.trunc(level / 50) + Math.trunc((p.actor.properties.int / (level >= 500 ? 6 : 12)) ** 2);
    return 1 + Math.trunc((improve - 1) * 100 / (level + 100));
}

export function quanzhenStudyConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, usage, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source);
        const upgrade = extra.upgrade === true, basic = level + Number(upgrade);
        const force = usage === 'force' ? skill : 'xuanmen-neigong';
        const actor = {
            skills: { force: Math.max(400, basic), unarmed: Math.max(400, basic),
                taoism: Math.max(400, basic), [force]: usage === 'force' ? level : 400,
                [usage]: basic, [skill]: level, ...extra.skills },
            mappings: { force, [usage]: skill },
            properties: { jiali: 0, qi: 10000, jing: 10000, eff_jing: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, gender: '男性',
                character: '光明磊落', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '全真教', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.unmapped) delete actor.mappings[usage];
        for (const learned of Object.keys(actor.skills))
            assert.ok(catalog.skills.some(s => s.id === learned), '实验技能必须有真实定义：' + learned);
        const weapon = extra.weapon ?? (['sword', 'whip'].includes(usage) ? usage : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        const expected = extra.expected ?? 'observed', times = extra.times ?? 1;
        result.push({ id: `school-quanzhen-study-${skill}-${upgrade ? 'upgrade' : 'research'}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: upgrade ? 'upgrade' : 'research',
            samples: smoke ? 2 : extra.checks ?? (upgrade || expected === 'refused' ? 2 : samples),
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-study',
                combination: extra.suffix ?? 'single-skill', skill, usage, level,
                ability: upgrade ? 'skill_improved' : 'research', actor,
                target: { skills: {}, mappings: {}, properties: {} }, action: `research ${skill} ${times}`,
                ...(upgrade ? { primer: { skill, amount: 10000000, weak_mode: 1 }, cycles: 1 } : {}),
                repetitions: times, completed: extra.completed ?? (expected === 'refused' ? 0 : times),
                command_return: extra.commandReturn ?? Number(expected !== 'refused'), clear_jing: extra.clearJing ?? false,
                observation: 'single_action_immediate', fighting: extra.fighting ?? false,
                observe_seconds: 0, not_applicable: '', expected,
                qualification_sources: [...new Set([source.path, 'cmds/skill/research.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'inherit/skill/skill.c', 'inherit/skill/force.c', 'include/globals.h', 'kungfu/skill/force.c',
                    'kungfu/skill/xuanmen-neigong.c', 'clone/user/user.c'])],
                qualification_note: '真实非巫师USER经原research；普通样本基本功与目标技能同级，研究升级样本基本功高一等级；其余内功、拳脚、道学至少400，辅助玄门400，先天悟性根骨36、经验1亿。无修养、转世、房间加成，不代表同培养成本或师父能教授到该级。升级样本先经原improve_skill弱模式预置超阈值进度，保留快照，再执行一次原研究，不直接调用升级回调。',
            } });
    }
    for (const [skill, usage] of quanzhenStudyProfiles) {
        for (const level of [199, 399, 799]) add(skill, usage, level, { upgrade: true });
        if (usage === 'force') continue; // Full non-upgrade force research is a separate frozen series.
        for (const level of [200, 400, 800]) add(skill, usage, level);
        for (const level of [499, 500]) add(skill, usage, level, { checks: 2 });
        add(skill, usage, 200, { suffix: '-unmapped', unmapped: true, checks: 2 });
        add(skill, usage, 200, { suffix: '-neili0', properties: { neili: 0 }, checks: 2 });
        add(skill, usage, 200, { suffix: '-times100', times: 100, checks: 2 });
        add(skill, usage, 200, { suffix: '-partial', times: 3, completed: 2, clearJing: true, properties: { jing: 60 }, checks: 2 });
        const edge = (suffix, extra) => add(skill, usage, 200, { suffix: '-' + suffix, expected: 'refused', ...extra });
        edge('busy', { busy: true }); edge('fighting', { fighting: true });
        edge('skill179', { skills: { [skill]: 179 } });
        edge('potential0', { properties: { potential: 0 } });
        edge('exp799999', { properties: { combat_exp: 799999 }, commandReturn: 1 });
        edge('jing26', { properties: { jing: 26 }, commandReturn: 1, clearJing: true });
        edge('eff-jing26', { properties: { eff_jing: 26, jing: 26 } });
        edge('no-learn', { properties: { 'env/no_learn': skill } });
        if (!['jinyan-gong', 'tianshan-feidu'].includes(skill)) edge('basic199', { skills: { [usage]: 199 } });
        if (['hand', 'strike', 'finger', 'unarmed'].includes(usage)) edge('armed', { weapon: 'sword' });
        if (usage === 'whip') edge('unarmed', { weapon: 'none' });
    }
    const check = (skill, suffix, extra) => add(skill, quanzhenStudyProfiles.find(p => p[0] === skill)[1], 200,
        { suffix: '-' + suffix, checks: 2, ...extra });
    for (const [skill, minimum] of [['qixing-jian', 100], ['quanzhen-jian', 1000], ['tonggui-jian', 1000],
        ['qixing-shou', 800], ['haotian-zhang', 800], ['chongyang-shenzhang', 800], ['zhongnan-zhi', 250],
        ['tiangang-chenfa', 200], ['jinyan-gong', 500], ['jinguan-yusuo', 1800], ['kongming-quan', 1500]])
        for (const max_neili of [minimum - 1, minimum]) check(skill, 'maxneili' + max_neili,
            { properties: { max_neili }, expected: max_neili < minimum ? 'refused' : 'observed' });
    for (const [skill, minimum] of [['quanzhen-jian', 150], ['qixing-shou', 100], ['haotian-zhang', 100],
        ['chongyang-shenzhang', 100], ['zhongnan-zhi', 40], ['tiangang-chenfa', 30], ['kongming-quan', 150]])
        for (const effective of [minimum - 1, minimum]) check(skill, 'effective-force' + effective,
            { skills: { force: 2, 'xuanmen-neigong': effective - 1 }, expected: effective < minimum ? 'refused' : 'observed' });
    for (const force of [99, 100]) check('tonggui-jian', 'raw-force' + force,
        { skills: { force }, expected: force < 100 ? 'refused' : 'observed' });
    for (const taoism of [149, 150]) check('jinguan-yusuo', 'taoism' + taoism,
        { skills: { taoism }, expected: taoism < 150 ? 'refused' : 'observed' });
    check('jinguan-yusuo', 'force199', { skills: { force: 199 }, expected: 'refused' });
    for (const dodge of [49, 50]) check('jinyan-gong', 'dodge' + dodge,
        { skills: { dodge }, expected: dodge < 50 ? 'refused' : 'observed' });
    // "move" is an enable slot, not a learnable basic skill in this repository.
    check('qixing-jian', 'related-basic', { skills: { parry: 200 }, checks: samples });
    return result;
}

export function validateQuanzhenStudyRecord(raw, condition, progressBound = studyProgressBound) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    for (const key of ['int', 'con', 'jing', 'eff_jing', 'gender', 'combat_exp', 'potential', 'learned_points'])
        assert.equal(before[key], p.actor.properties[key]);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0); assert.equal(raw.interfaces.length, 0);
    assert.deepEqual(raw.immediate[1], raw.before[1]);
    const upgraded = condition.method === 'upgrade';
    if (upgraded) {
        assert.equal(raw.upgrades.length, 1);
        const step = raw.upgrades[0], expected = structuredClone(before);
        assert.deepEqual(step.before, before);
        expected.learned[p.skill] = (before.learned[p.skill] ?? 0) + 1 + Math.trunc(p.primer.amount * 100 / (p.level + 100));
        assert.deepEqual(step.primed, expected, '弱模式预置不能提前升级或改变其他状态');
        assert.ok(step.primed.learned[p.skill] > (p.level + 1) ** 2);
        assert.equal(step.implemented_by, '/inherit/skill/skill');
        assert.equal(step.action, p.action); assert.equal(step.accepted, 1);
        assert.deepEqual(step.after, after);
    } else assert.equal(raw.command_accepted, p.command_return);
    assert.equal(after.learned_points - before.learned_points, p.completed);
    assert.equal(after.jing, p.clear_jing ? 0 : before.jing - p.completed * Math.trunc(1000 / before.int));
    const expectedSkills = { ...before.skills, [p.skill]: before.skills[p.skill] + Number(upgraded) };
    assert.deepEqual(after.skills, expectedSkills);
    const gain = (after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0);
    if (upgraded) assert.equal(after.learned[p.skill], 0);
    else if (p.completed) assert.ok(gain >= p.completed && gain <= p.completed * progressBound(p));
    else { assert.equal(gain, 0); assert.ok(raw.reason); }
    const expectedLearned = { ...before.learned };
    if (Object.hasOwn(after.learned, p.skill)) expectedLearned[p.skill] = after.learned[p.skill];
    assert.deepEqual(after.learned, expectedLearned);
    if (before.effective_skills) for (const [key, n] of Object.entries(before.effective_skills)) {
        const delta = !upgraded ? 0 : key === p.skill ? Math.trunc((p.level + 1) / 2) - Math.trunc(p.level / 2)
            : p.actor.mappings[key] === p.skill ? 1 : 0;
        assert.equal(after.effective_skills[key], n + delta, key);
    }
    const stable = state => {
        const s = structuredClone(state);
        for (const key of ['skills', 'learned', 'effective_skills', 'jing', 'learned_points']) delete s[key];
        delete s.temp.notify_fail;
        if (s.temp.time) { delete s.temp.time.research; if (!Object.keys(s.temp.time).length) delete s.temp.time; }
        return s;
    };
    assert.deepEqual(stable(after), stable(before), '研究或继承空升级回调不得改变其他已观察状态');
}
