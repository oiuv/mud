// Original practice command and the remaining active parry control; no gameplay fixes.
import assert from 'node:assert/strict';

// [skill, basic, minimum qi/neili, actual qi/neili cost]. Costs preserve MA-068.
export const quanzhenPracticeProfiles = [
    ['qixing-jian', 'sword', 40, 40, 35, 33],
    ['quanzhen-jian', 'sword', 60, 60, 55, 53],
    ['tonggui-jian', 'sword', 50, 70, 40, 60],
    ['qixing-shou', 'hand', 100, 60, 80, 53],
    ['haotian-zhang', 'strike', 80, 80, 68, 66],
    ['chongyang-shenzhang', 'strike', 70, 65, 60, 0],
    ['zhongnan-zhi', 'finger', 50, 20, 35, 11],
    ['tiangang-chenfa', 'whip', 50, 45, 30, 39],
    ['jinyan-gong', 'dodge', 70, 60, 58, 55],
    ['tianshan-feidu', 'dodge', 50, 0, 40, 0],
    ['jinguan-yusuo', 'parry', 100, 100, 80, 90],
    ['kongming-quan', 'unarmed', 60, 70, 50, 60],
    ['xiantian-gong', 'force', null, null, 0, 0],
    ['xuanmen-neigong', 'force', null, null, 0, 0],
    ['quanzhen-xinfa', 'force', null, null, 0, 0],
];

export function practiceGain(level, basic, intelligence = 36) {
    const raw = Math.trunc((level >= 500 ? basic : level >= 300 ? basic * 3 : basic * 6 + 30)
        / Math.sqrt(intelligence) / 6);
    return 1 + Math.trunc(raw * 100 / (level + 100));
}

export function quanzhenPracticeConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, usage, level, extra = {}) {
        const control = extra.control === true, ability = control ? 'suo' : 'practice';
        const source = catalog.skills.find(s => s.id === (control ? skill + '/suo' : skill));
        assert.ok(source, '缺少全真原源码：' + skill);
        const force = usage === 'force' ? skill : 'xuanmen-neigong';
        const actor = {
            skills: { force: Math.max(400, level + 1), unarmed: Math.max(400, level + 1),
                taoism: Math.max(400, level + 1), [force]: usage === 'force' ? level : 400,
                [usage]: level + 1, [skill]: level, ...extra.skills },
            mappings: { force, [usage]: skill },
            properties: { jiali: 0, qi: 10000, neili: 6000, max_neili: 6000, int: 36, con: 36,
                character: '光明磊落', combat_exp: 100000000,
                ...(control ? { 'can_perform/jinguan-yusuo/suo': 1 } : {}), ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const weapon = extra.weapon ?? (['sword', 'whip'].includes(usage) ? usage : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        if (extra.unmapped) delete actor.mappings[usage];
        const repetitions = extra.times ?? 1;
        result.push({ id: `school-quanzhen-practice-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: control ? source.entries.find(e => e.role === 'perform').id : source.path,
            method: control ? 'perform' : 'practice',
            samples: extra.naturalBusy ? (smoke ? 1 : 2) : smoke ? 2 : control ? extra.checks ?? samples : 2,
            parameters: { school: 'quanzhen', family: '全真教', collection_group: 'quanzhen-practice',
                combination: control ? 'active-parry' : 'practice', skill, usage, ability, level,
                actor, target: { skills: { parry: extra.naturalBusy ? 0 : 600 }, mappings: {}, properties: {},
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: control ? 'perform parry.suo' : `practice ${usage} ${repetitions}`,
                observation: extra.naturalBusy ? 'timed_effect' : 'single_action_immediate',
                fighting: extra.fighting ?? control,
                observe_seconds: extra.naturalBusy ? Math.trunc(level / 16) * 3 + 15 : 0,
                ...(extra.naturalBusy ? { target_busy_lifecycle: true } : {}),
                not_applicable: '', expected: extra.expected ?? 'observed',
                ...(!control ? { repetitions, completed: extra.completed ?? (extra.expected === 'refused' ? 0 : repetitions) } : {}),
                qualification_sources: [...new Set([source.path, `kungfu/skill/${skill}.c`,
                    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'cmds/skill/perform.c', 'feature/skill.c',
                    'kungfu/skill/force.c', 'kungfu/skill/xuanmen-neigong.c',
                    'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/yin.c',
                    'kungfu/class/quanzhen/wang.c', 'kungfu/class/quanzhen/zhou.c',
                    ...(extra.naturalBusy ? ['feature/action.c', 'mudcore/inherit/action.c',
                        'inherit/char/char.c', 'feature/condition.c'] : [])])],
                qualification_note: '真实非巫师USER经原practice/perform；经验1亿、先天悟性根骨36、男性、正派性格，基本功高于特殊一级，辅助内功/道学等至少400为实验资格，不代表教师可教至此或同培养成本。不设武学修养、转世和房间练习加成；不强制随机或修正原扣费。记录原返回、实际进度与普通dbase/force，部分练成不等于完全拒绝。'
                    + (extra.naturalBusy ? '金锁只施展一次，目标基本招架0但原随机仍可能落空；施展者心跳关闭，仅受控目标运行原USER心跳直到忙乱清零。逐跳记录真实计数和墙钟，不手动continue_action、不重施、不打断；这是独立控制解除窗口，不是完整战斗或施展者忙乱解除。落空记录not_applied，不冒充解除。'
                        : '只观察即时忙乱值，不换算秒数。'),
            } });
    }
    for (const [skill, usage, qi, neili, qiCost] of quanzhenPracticeProfiles) {
        const supported = qi !== null;
        for (const level of [200, 400, 800]) add(skill, usage, level, supported ? {} : { expected: 'refused' });
        if (!supported) continue;
        const refuse = (suffix, extra) => add(skill, usage, 200, { suffix: '-' + suffix, expected: 'refused', ...extra });
        refuse('low-qi', { properties: { qi: qi - 1 } });
        if (neili) refuse('low-neili', { properties: { neili: neili - 1 } });
        refuse('equal-basic', { skills: { [usage]: 200 } });
        add(skill, usage, 200, { suffix: '-times50', times: 50 });
        add(skill, usage, 200, { suffix: '-partial', times: 3, completed: 2, properties: { qi: qi + qiCost } });
        if (['sword', 'whip', 'hand', 'strike', 'finger', 'unarmed'].includes(usage))
            refuse('wrong-weapon', { weapon: ['sword', 'whip'].includes(usage) ? 'none' : 'sword' });
    }
    const edge = (skill, usage, suffix, extra) => add(skill, usage, 200, { suffix: '-' + suffix, ...extra });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['unmapped', { unmapped: true }], ['no-learn', { properties: { 'env/no_learn': 'qixing-jian' } }],
        ['low-exp', { properties: { combat_exp: 799999 } }]])
        edge('qixing-jian', 'sword', suffix, { expected: 'refused', ...extra });
    for (const level of [299, 300, 499, 500]) add('qixing-jian', 'sword', level);
    add('jinguan-yusuo', 'parry', 199, { expected: 'refused' });
    edge('tianshan-feidu', 'dodge', 'neili0', { properties: { neili: 0 } });
    edge('chongyang-shenzhang', 'strike', 'neili65-times50', { properties: { neili: 65 }, times: 50 });
    for (const level of [200, 400, 800]) add('jinguan-yusuo', 'parry', level, { control: true });
    add('jinguan-yusuo', 'parry', 400, { control: true, suffix: '-armed', weapon: 'sword' });
    for (const [suffix, extra] of [['no-grant', { properties: { 'can_perform/jinguan-yusuo/suo': 0 } }],
        ['low-skill', { skills: { 'jinguan-yusuo': 149 } }],
        ['low-force', { skills: { force: 2, 'xuanmen-neigong': 198 } }],
        ['low-neili', { properties: { neili: 499 } }], ['target-busy', { targetBusy: true }],
        ['not-fighting', { fighting: false }], ['actor-busy', { busy: true }]])
        add('jinguan-yusuo', 'parry', 400, { control: true, suffix: '-' + suffix, checks: 2, expected: 'refused', ...extra });
    for (const level of [200, 400, 800])
        add('jinguan-yusuo', 'parry', level, { control: true, naturalBusy: true, suffix: '-natural-expiry' });
    return result;
}

export function validateQuanzhenPracticeRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(after.max_neili, before.max_neili);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.metrics[0].direct ?? 0, 0);
    if (p.ability === 'suo') {
        if (raw.outcome === 'refused') {
            assert.equal(raw.launches.length, 0); assert.equal(after.neili, before.neili);
            assert.ok(raw.reason.length > 0); return;
        }
        assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'jinguan-yusuo');
        const controlled = raw.immediate[1].busy > 0;
        if (Math.trunc(raw.before[1].skills.parry / 2) >= p.level - 1) assert.ok(!controlled);
        assert.equal(raw.immediate[1].busy || 0, controlled ? Math.trunc(p.level / 16) : 0);
        assert.equal(after.busy, controlled ? 1 : 2);
        assert.equal(before.neili - after.neili, controlled ? 100 : 50);
        assert.equal(before.qi, after.qi); assert.equal(raw.before[1].qi, raw.immediate[1].qi);
        if (p.target_busy_lifecycle) validateGoldLockLifecycle(raw, condition, controlled);
        return;
    }
    const profile = quanzhenPracticeProfiles.find(([skill]) => skill === p.skill), completed = p.completed;
    assert.equal(raw.launches.length, 0); assert.equal(raw.interfaces.length, 0);
    assert.equal(before.int, 36); assert.equal(before.combat_exp, p.actor.properties.combat_exp);
    assert.equal(before.force_attribute ?? 0, 0);
    assert.deepEqual(after.skills, before.skills, '本批零起始进度，不跨升级阈值');
    assert.deepEqual(raw.immediate[1], raw.before[1], '练习不得改变旁观角色');
    assert.equal((after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0),
        completed * practiceGain(p.level, before.skills[p.usage], before.int));
    assert.equal(before.qi - after.qi, completed * profile[4]);
    assert.equal(before.neili - after.neili, completed * profile[5]);
    assert.equal((after.force_attribute ?? 0) - (before.force_attribute ?? 0), p.skill === 'chongyang-shenzhang' && completed ? -55 * completed : 0);
    assert.equal(after.learned_points, before.learned_points);
    assert.equal(raw.command_accepted, Number(completed === p.repetitions));
    if (!completed) assert.ok(raw.reason.length > 0);
}

export function validateGoldLockLifecycle(raw, condition, controlled) {
    const p = condition.parameters, steps = raw.busy_heartbeats;
    assert.ok(Array.isArray(steps));
    assert.equal(p.observation, 'timed_effect');
    assert.ok(raw.elapsed >= 0 && raw.elapsed < p.observe_seconds);
    assert.equal(raw.metrics[0].heartbeats ?? 0, 0, 'caster heartbeat remains disabled');
    assert.equal(raw.launches[0].argument, 'suo');
    assert.deepEqual(raw.after[0], raw.immediate[0], 'no later caster action or heartbeat');
    const initial = raw.immediate[1].busy || 0;
    if (!controlled) {
        assert.equal(raw.busy_terminal, 'not_applied');
        assert.deepEqual(steps, []);
        assert.equal(raw.metrics[1].heartbeats ?? 0, 0);
        assert.deepEqual(raw.after, raw.immediate);
        return;
    }
    assert.equal(raw.busy_terminal, 'released');
    assert.equal(steps.length, initial, 'one original heartbeat per integer decrement');
    assert.equal(raw.metrics[1].heartbeats, steps.length);
    let previous = raw.immediate[1], elapsed = 0;
    for (const step of steps) {
        assert.equal(step.side, 1); assert.equal(step.driver_heartbeat, 1);
        assert.deepEqual(step.before, previous, 'no busy/state rewrite between heartbeats');
        assert.equal(step.after.busy, step.before.busy - 1);
        assert.ok(step.elapsed_before >= elapsed && step.elapsed >= step.elapsed_before);
        elapsed = step.elapsed; previous = step.after;
    }
    assert.deepEqual(raw.after[1], previous);
    assert.equal(raw.after[1].busy, 0);
    assert.equal(raw.metrics[1].qi_cost ?? 0, 0);
    assert.equal(raw.metrics[1].eff_qi_cost ?? 0, 0);
    assert.ok(raw.elapsed >= elapsed);
}
