// Original player commands; flags represent explicit experimental qualifications.
import assert from 'node:assert/strict';

export function huashanAdvancedConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, level, ability, extra = {}) {
        const method = ability === 'ordinary' ? 'ordinary' : 'perform';
        const source = catalog.skills.find(s => s.id === (method === 'ordinary' ? skill : `${skill}/${ability}`));
        assert.ok(source, '华山进阶能力缺少原源码');
        const entry = method === 'ordinary' ? source.path : source.entries.find(e => e.role === 'perform')?.id;
        assert.ok(entry, '华山进阶能力缺少原入口');
        const nothing = Boolean(extra.nothing);
        result.push({ id: `school-huashan-advanced-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method,
            samples: smoke ? (extra.duration ? 1 : 2) : extra.checks ?? samples,
            parameters: {
                school: 'huashan', family: '华山派', collection_group: 'huashan-advanced',
                combination: nothing ? 'nothing' : 'normal', skill, usage: 'sword', ability, level,
                observation: extra.duration ? 'timed_effect' : 'single_action_immediate',
                actor: {
                    skills: { sword: level, parry: level, dodge: level, force: level,
                        [skill]: level, 'feiyan-huixiang': level, 'huashan-xinfa': level,
                        'martial-cognize': level, ...(skill === 'chongling-jian' ? { 'huashan-jian': 100 } : {}),
                        ...extra.skills },
                    mappings: { sword: skill, parry: skill, dodge: 'feiyan-huixiang', force: 'huashan-xinfa' },
                    properties: { jiali: 0, neili: 6000, max_neili: 6000, int: 39, con: 36, dex: 36,
                        character: '狡黠多变', 'family/family_name': '华山派',
                        ...(skill === 'dugu-jiujian' ? { 'can_perform/dugu/qi': 100, 'can_perform/dugu/po': 100,
                            'can_learn/dugu-jiujian/nothing': nothing ? 1 : 0 } : {}),
                        ...extra.properties },
                    equipment: { type: 'sword', hold: false },
                },
                target: { skills: { force: extra.duration ? 20 : 600, dodge: 600,
                    parry: extra.duration ? 20 : 600, sword: 200 }, mappings: {}, properties: {},
                    equipment: { type: 'sword', hold: false } },
                action: method === 'ordinary' ? 'ordinary' : `perform sword.${ability}`,
                fighting: true, observe_seconds: extra.duration ? 34 : 0, not_applicable: '',
                qualification_sources: [...new Set([`kungfu/skill/${skill}.c`, source.path,
                    'kungfu/skill/feiyan-huixiang.c', 'kungfu/skill/huashan-xinfa.c',
                    'kungfu/class/huashan/feng.c', 'kungfu/class/huashan/linghu.c',
                    'cmds/skill/perform.c', 'feature/skill.c', 'feature/action.c', 'adm/daemons/combatd.c'])],
                qualification_note: '两个真实非巫师USER；技能/破气总破领悟/无招许可为实验赋值，不证明拜师教学或同培养成本。以华山心法、飞燕回翔作明示参考，不复制NPC专属加成；狡黠多变保留原随机忙乱减免，无招与有招只变许可，破剑知识另列。',
                expected: extra.expected ?? 'observed',
            } });
    }
    for (const level of [200, 400, 800]) {
        add('chongling-jian', level, 'ordinary');
        add('dugu-jiujian', level, 'ordinary');
        add('dugu-jiujian', level, 'ordinary', { nothing: true, suffix: '-nothing' });
        for (const ability of ['yi', 'qi', 'po']) add('dugu-jiujian', level, ability);
        add('dugu-jiujian', level, 'po', { suffix: '-known-sword',
            properties: { 'can_perform/dugu-jiujian': ['sword'] } });
    }
    for (const [ability, minimum] of [['yi', 90], ['qi', 120], ['po', 150]]) {
        add('dugu-jiujian', minimum - 1, ability, { suffix: '-low-level', checks: 2, expected: 'refused' });
        add('dugu-jiujian', 200, ability, { suffix: '-nothing', nothing: true, checks: 2, expected: 'refused' });
        add('dugu-jiujian', 200, ability, { suffix: '-neili0', properties: { neili: 0 }, checks: 2 });
        if (ability !== 'yi') add('dugu-jiujian', 200, ability, { suffix: '-grant99',
            properties: { [`can_perform/dugu/${ability}`]: 99 }, checks: 2, expected: 'refused' });
    }
    // At L120, ap=360, damage=360..719, delay=10..32 seconds. No artificial timer changes.
    add('dugu-jiujian', 120, 'qi', { suffix: '-expiry', duration: true, checks: 2 });
    return result;
}

export function validateHuashanAdvancedRecord(raw, condition) {
    const p = condition.parameters, actor = raw.immediate[0], target = raw.immediate[1];
    const cost = raw.metrics[0].neili_cost ?? 0, direct = raw.metrics[0].direct ?? 0;
    assert.equal(raw.before[0].weapon, 'sword');
    if (condition.method === 'ordinary') {
        assert.equal(raw.launches.length, 0);
        assert.ok(!actor.temp.dugu?.lian, '无招连击的递归标记须由原函数撤回');
        return;
    }
    assert.equal(raw.launches.length, 1);
    assert.equal(raw.launches[0].skill, 'dugu-jiujian');
    assert.equal(cost, 0, '原三式没有内力检查/扣费，不能代填');
    if (p.ability === 'po') {
        assert.equal(direct, 0);
        assert.ok(actor.busy >= 1 && actor.busy <= 13);
        return;
    }
    assert.ok(direct === 0 || direct === 1);
    const requestedBusy = p.ability === 'yi' ? (direct ? 2 : 3) : (direct ? 3 : 4);
    assert.ok([requestedBusy - 1, requestedBusy].includes(actor.busy), '原性格有40%概率减1忙乱');
    if (p.ability === 'qi') assert.equal(Boolean(target.temp.no_exert), Boolean(direct));
    if (p.observation === 'timed_effect') {
        assert.equal(p.ability, 'qi');
        assert.equal(p.observe_seconds, 34);
        assert.equal(direct, 1, '持续条件的弱内功目标必须命中破气');
        // call_out uses game ticks, not walltime. Keep a one-tick tolerance;
        // actual recovery still requires the two original callback observations.
        assert.ok(raw.elapsed >= 33);
        assert.deepEqual(raw.callbacks.map(c => [c.side, c.phase]), [[1, 'before'], [1, 'after']]);
        const [enter, exit] = raw.callbacks;
        assert.ok(enter.elapsed >= 9 && enter.elapsed <= raw.elapsed);
        assert.ok(exit.elapsed >= enter.elapsed && exit.elapsed <= raw.elapsed);
        assert.equal(enter.state.temp.no_exert, 1);
        assert.ok(!exit.state.temp.no_exert && !raw.after[1].temp.no_exert);
        for (const resource of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
            assert.equal(raw.after[1][resource], target[resource], '原解除不改变目标资源');
    }
}
