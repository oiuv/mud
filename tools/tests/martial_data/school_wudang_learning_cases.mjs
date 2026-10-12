// Actual skill qualification queries and player practice commands; no game changes.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

// skill, basic, effective-force floor, max-neili floor, raw-basic floor,
// practice qi/neili floors, actual qi/neili costs. Shenmen uses CURRENT neili.
export const wudangLearningProfiles = [
    ['taiji-jian', 'sword', 200, 1500, 100, 100, 75, 50, 64],
    ['taiji-dao', 'blade', 100, 500, 0, 60, 60, 45, 43],
    ['wudang-jian', 'sword', 20, 100, 0, 40, 10, 25, 10],
    ['shenmen-jian', 'sword', 60, 0, 0, 65, 65, 52, 58],
    ['liangyi-jian', 'sword', 30, 200, 60, 50, 30, 40, 25],
    ['raozhi-roujian', 'sword', 20, 100, 0, 40, 40, 35, 30],
    ['rouyun-jian', 'sword', 120, 800, 80, 60, 70, 50, 62],
    ['xuanxu-dao', 'blade', 100, 500, 0, 60, 60, 45, 43],
    ['taiji-quan', 'unarmed', 180, 1000, 100, 70, 70, 35, 59],
    ['zhenshan-zhang', 'strike', 100, 450, 0, 60, 60, 50, 54],
    ['huzhua-shou', 'claw', 50, 250, 0, 70, 80, 60, 69],
    ['xuangong-quan', 'unarmed', 100, 800, 60, 60, 60, 40, 50],
    ['yitian-zhang', 'strike', 120, 750, 80, 70, 70, 55, 62],
    ['paiyun-shou', 'hand', 40, 250, 0, 50, 40, 37, 25],
    ['wudang-zhang', 'strike', 30, 100, 0, 100, 80, 80, 50],
    ['furong-jinzhen', 'throwing', 0, 0, 40, 80, 60, 70, 50],
    ['tiyunzong', 'dodge', 0, 800, 80, 70, 60, 58, 55],
];

export function wudangLearningConditions(catalog) {
    const result = [];
    function add(profile, ability, level = 200, extra = {}) {
        const [skill, usage] = profile, practice = ability === 'practice';
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少武当原技能：' + skill);
        const actor = {
            skills: { force: 400, 'taiji-shengong': 400, 'taiji-quan': 100,
                [usage]: level + 1, [skill]: level, ...extra.skills },
            mappings: { force: 'taiji-shengong', [usage]: skill },
            properties: { qi: 10000, jiali: 0, neili: 6000, max_neili: 6000,
                int: 36, con: 36, combat_exp: 100000000, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const weapon = extra.weapon ?? (['sword', 'blade'].includes(usage) ? usage : 'none');
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        if (extra.unmapped) delete actor.mappings[usage];
        if (extra.unmappedForce) delete actor.mappings.force;
        const repetitions = extra.times ?? 1;
        result.push({ id: `school-wudang-learning-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: practice ? 'practice' : 'interface', samples: 2,
            parameters: { school: 'wudang', family: '武当派', collection_group: 'wudang-learning',
                combination: practice ? 'practice' : 'qualification', skill, usage, ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice ${usage} ${repetitions}` : 'test_interface',
                ...(!practice ? { interface: { object: `/kungfu/skill/${skill}`, function: 'valid_learn' } }
                    : { repetitions, completed: extra.completed ?? (extra.expected === 'refused' ? 0 : repetitions) }),
                observation: 'single_action_immediate', fighting: extra.fighting ?? false, observe_seconds: 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [source.path, 'kungfu/skill/taiji-shengong.c', 'kungfu/skill/taiji-quan.c',
                    'kungfu/class/wudang/zhang.c', 'kungfu/class/wudang/yu.c', 'kungfu/class/wudang/song.c',
                    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'feature/skill.c'],
                qualification_note: '真实非巫师USER，原valid_learn接口或practice命令。辅助内功400、太极拳100、经验1亿、先天悟性根骨36是实验资格；只验证技能自己的学习条件，不代替教师收徒/认可与可教上限。基本功默认高一级、零起始进度，不设武学修养/转世/房间加成。确定性查询及练习各重复2次，不与随机伤害100次混算；原命令可能中途停止，按真实进度记部分完成。',
            } });
    }
    for (const profile of wudangLearningProfiles) {
        const [skill, usage, force, maxNeili, basic, qi, neili, qiCost, neiliCost] = profile;
        const unarmed = ['unarmed', 'strike', 'claw', 'hand'].includes(usage);
        const edge = (ability, suffix, extra = {}) => add(profile, ability, extra.level ?? 200, { suffix: '-' + suffix, ...extra });
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'practice']) add(profile, ability, level);
        for (const value of [199, 200]) edge('valid_learn', 'basic' + value, {
            skills: { [usage]: value }, expected: value < 200 && !['paiyun-shou', 'tiyunzong'].includes(skill) ? 'refused' : 'observed' });
        if (force) for (const value of [force - 1, force]) edge('valid_learn', 'force' + value, {
            skills: { force: value * 2 }, unmappedForce: true, expected: value < force ? 'refused' : 'observed' });
        if (maxNeili) for (const value of [maxNeili - 1, maxNeili]) edge('valid_learn', 'maxneili' + value, {
            properties: { max_neili: value }, expected: value < maxNeili ? 'refused' : 'observed' });
        if (basic) for (const value of [basic - 1, basic]) edge('valid_learn', 'basic-floor' + value, {
            level: 1, skills: { [usage]: value }, expected: value < basic ? 'refused' : 'observed' });
        edge('valid_learn', 'weapon', { weapon: unarmed ? 'sword' : 'none', expected: unarmed ? 'refused' : 'observed' });
        edge('practice', 'low-qi', { properties: { qi: qi - 1 }, expected: 'refused' });
        edge('practice', 'minimum-qi', { properties: { qi } });
        const entryNeili = skill === 'shenmen-jian' ? 300 : neili;
        edge('practice', 'low-neili', { properties: { neili: entryNeili - 1 }, expected: 'refused' });
        edge('practice', 'minimum-neili', { properties: { neili: entryNeili } });
        edge('practice', 'equal-basic', { skills: { [usage]: 200 }, expected: 'refused' });
        edge('practice', 'times50', { times: 50 });
        edge('practice', 'partial-qi', { times: 3, completed: 2, properties: { qi: qi + qiCost } });
        edge('practice', 'partial-neili', { times: skill === 'shenmen-jian' ? 6 : 3,
            completed: skill === 'shenmen-jian' ? 5 : 2,
            properties: { neili: skill === 'shenmen-jian' ? 300 : neili + neiliCost } });
        edge('practice', 'wrong-weapon', { weapon: ['sword', 'blade'].includes(usage) ? 'none' : 'sword',
            expected: unarmed || ['sword', 'blade'].includes(usage) ? 'refused' : 'observed' });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(wudangLearningProfiles.find(p => p[0] === skill),
        ability, extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const skill of ['taiji-jian', 'taiji-quan']) for (const int of [25, 26])
        edge(skill, 'valid_learn', 'int' + int, { properties: { int }, expected: int < 26 ? 'refused' : 'observed' });
    for (const level of [99, 100]) edge('taiji-jian', 'valid_learn', 'quan' + level, {
        skills: { 'taiji-quan': level }, expected: level < 100 ? 'refused' : 'observed' });
    for (const neili of [299, 300]) edge('shenmen-jian', 'valid_learn', 'neili' + neili, {
        properties: { neili }, expected: neili < 300 ? 'refused' : 'observed' });
    edge('shenmen-jian', 'valid_learn', 'maxneili1', { properties: { max_neili: 1 } });
    edge('shenmen-jian', 'practice', 'inner-minimum65', { properties: { neili: 65 }, expected: 'refused' });
    for (const [basic, level, unmapped, expected] of [[58, 1, true, 'refused'], [60, 1, true, 'observed'],
        [20, 20, false, 'observed'], [30, 1, true, 'refused']])
        edge('huzhua-shou', 'valid_learn', `effective-basic${basic}`, { level, unmapped, skills: { claw: basic }, expected });
    for (const level of [49, 50]) edge('zhenshan-zhang', 'practice', 'qi-break', { level });
    for (const ability of ['valid_learn', 'practice']) edge('wudang-zhang', ability, 'baihua-known', {
        skills: { 'baihua-cuoquan': 1 }, expected: 'refused' });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['unmapped', { unmapped: true }], ['no-learn', { properties: { 'env/no_learn': 'wudang-jian' } }],
        ['low-exp', { properties: { combat_exp: 799999 } }]])
        edge('wudang-jian', 'practice', suffix, { ...extra, expected: 'refused' });
    for (const level of [299, 300, 499, 500]) edge('wudang-jian', 'practice', 'gain-break', { level });
    return result;
}

export function validateWudangLearningRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(after.max_neili, before.max_neili);
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.deepEqual(after.skills, before.skills, '零起始进度，本批不跨整级');
    assert.deepEqual(raw.immediate[1], raw.before[1], '不改变旁观角色');
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.equal(raw.interfaces[0].function, 'valid_learn');
        assert.equal(raw.interfaces[0].result, Number(p.expected === 'observed'));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b, '资格查询除拒绝提示外不修改状态');
    } else {
        assert.equal(raw.interfaces.length, 0);
        const profile = wudangLearningProfiles.find(v => v[0] === p.skill);
        const qiCost = p.skill === 'zhenshan-zhang' && p.level < 50 ? 30 : profile[7];
        assert.equal(before.qi - after.qi, p.completed * qiCost);
        assert.equal(before.neili - after.neili, p.completed * profile[8]);
        assert.equal((after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0),
            p.completed * practiceGain(p.level, before.skills[p.usage], before.int));
        assert.equal(after.learned_points, before.learned_points);
        assert.equal(raw.command_accepted, Number(p.completed === p.repetitions));
        assert.equal(after.force_attribute, before.force_attribute);
    }
    if (raw.outcome === 'refused') assert.ok(raw.reason.length > 0);
}
