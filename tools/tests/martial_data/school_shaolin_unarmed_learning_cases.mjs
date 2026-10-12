// Hand-reviewed original qualification and practice data, not a condition solver.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

// id, basic, effective force floor (negative = raw floor), max neili,
// qi floor, current neili floor, qi cost, neili cost, representative NPC source.
const rows = [
    ['luohan-quan', 'cuff', 20, 50, 35, 10, 25, 6, 'cheng-yi'],
    ['jingang-quan', 'cuff', 30, 100, 70, 70, 59, 58, 'cheng-zhi'],
    ['fuhu-quan', 'cuff', 0, 1000, 0, 20, 25, 5, 'cheng-yi'],
    ['zuiquan-sanda', 'cuff', 20, 50, 35, 30, 25, 20, 'cheng-yi'],
    ['qinna-shibada', 'unarmed', 0, 1000, 50, 50, 40, 35, 'cheng-zhi'],
    ['banruo-zhang', 'strike', 30, 100, 70, 70, 65, 64, 'cheng-ming'],
    ['sanhua-zhang', 'strike', -60, 300, 70, 70, 65, 66, 'cheng-si'],
    ['woshi-zhang', 'strike', -80, 800, 60, 70, 55, 50, 'cheng-ming'],
    ['xumishan-zhang', 'strike', -200, 2000, 90, 90, 80, 75, 'du-yuan'],
    ['shenzhang-bada', 'strike', 300, 3000, 100, 80, 90, 70, 'xuan-ci'],
    ['rulai-zhang', 'strike', 300, 3500, 200, 220, 180, 200, 'wuming'],
    ['nianhua-zhi', 'finger', 60, 300, 70, 70, 50, 64, 'cheng-jian'],
    ['yizhi-chan', 'finger', 60, 300, 70, 70, 62, 68, 'cheng-zhi2'],
    ['jingang-zhi', 'finger', 60, 300, 70, 70, 60, 64, 'xuan-ci'],
    ['duoluoye-zhi', 'finger', 150, 1500, 130, 110, 110, 100, 'xuan-ci'],
    ['wuxiang-zhi', 'finger', 60, 300, 70, 70, 50, 30, 'xuan-ci'],
    ['xiuluo-zhi', 'finger', 200, 800, 100, 100, 80, 80, 'xuan-ci'],
    ['tianzhu-fuzhi', 'finger', 30, 300, 70, 70, 55, 51, 'xuan-ci'],
    ['qufannao-zhi', 'finger', 0, 0, 50, 50, 20, 20, 'cheng-jian'],
    ['longzhua-gong', 'claw', 50, 250, 70, 80, 60, 69, 'xuan-ci'],
    ['yintuoluo-zhua', 'claw', 250, 2500, 70, 70, 60, 60, 'xuan-ci'],
    ['jimie-zhua', 'claw', 0, 600, 50, 40, 40, 30, 'xuan-ci'],
    ['fengyun-shou', 'hand', 40, 200, 70, 80, 65, 69, 'xuan-ci'],
    ['dacidabei-shou', 'hand', 250, 3500, 100, 100, 60, 70, 'xuan-ci'],
    ['qianye-shou', 'hand', 40, 200, 75, 70, 68, 64, 'cheng-xin'],
    ['pona-gong', 'unarmed', 0, 1500, 30, 20, 30, 10, 'cheng-zhi'],
    ['shaolin-tantui', 'unarmed', -80, 300, 80, 70, 45, 50, 'cheng-zhi'],
    ['shaolin-shenfa', 'dodge', 0, 0, 50, 0, 40, 0, 'cheng-guan'],
];
export const shaolinUnarmedLearningProfiles = rows.map(([skill, usage, force, maxNeili,
    qiFloor, neiliFloor, qiCost, neiliCost, teacher]) => ({ skill, usage, force, maxNeili,
    qiFloor, neiliFloor, qiCost, neiliCost, teacher }));
const fixedBasic = { 'qinna-shibada': 100, 'qufannao-zhi': 120, 'rulai-zhang': 200, 'tianzhu-fuzhi': 10 };
const noRelativeBasic = new Set(['qinna-shibada', 'woshi-zhang', 'qufannao-zhi', 'jimie-zhua', 'pona-gong', 'shaolin-shenfa']);

export function shaolinUnarmedLearningConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const { skill } = d, usage = extra.usage ?? d.usage, practice = ability === 'practice';
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, `缺少少林武学 ${skill}`);
        const actor = {
            skills: { force: 600, 'hunyuan-yiqi': 400, buddhism: 400, [usage]: level + 1, [skill]: level,
                ...(skill === 'shaolin-tantui' ? { unarmed: level + 1, dodge: level + 1 } : {}),
                ...(skill === 'woshi-zhang' ? { 'sanhua-zhang': 80 } : {}), ...extra.skills },
            mappings: { force: 'hunyuan-yiqi', [usage]: skill },
            properties: { qi: 10000, jing: 10000, jingli: 10000, neili: 6000, max_neili: 6000,
                int: 36, con: 36, dex: 36, str: 36, shen: 1000000, jiali: 0,
                combat_exp: 100000000, 'family/family_name': '少林派', ...extra.properties },
        };
        if (extra.weapon) actor.equipment = { type: 'sword', hold: false };
        if (extra.unmappedForce) delete actor.mappings.force;
        if (extra.unmapped) delete actor.mappings[usage];
        const repetitions = extra.times ?? 1;
        result.push({ id: `school-shaolin-unarmed-learning-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: practice ? 'practice' : 'interface', samples: smoke ? 1 : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-unarmed-learning',
                combination: practice ? 'practice' : 'qualification', skill, usage, ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice ${usage} ${repetitions}` : 'test_interface',
                ...(!practice ? { interface: { object: `/kungfu/skill/${skill}`, function: 'valid_learn' } }
                    : { repetitions, completed: extra.completed ?? (extra.expected === 'refused' ? 0 : repetitions) }),
                observation: 'single_action_immediate', fighting: false, observe_seconds: 0,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [source.path, `kungfu/class/shaolin/${d.teacher}.c`, 'inherit/skill/shaolin.c',
                    'kungfu/skill/hunyuan-yiqi.c', 'cmds/skill/practice.c', 'cmds/skill/learn.c',
                    'feature/skill.c', 'feature/damage.c'],
                qualification_note: '真实非巫师USER，原valid_learn和practice命令；来源NPC仅证明所属配置，不代替实际收徒或教师上限。基本功默认高一级、零起始进度，属性及前置技能显式赋值；保留原基础/有效内功、前置或条件、参合融合拒绝、部分完成及精力/气血错配。只观察即时结果，不推断后续心跳生死。确定性正式2次，烟雾1次。',
            } });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(shaolinUnarmedLearningProfiles.find(d => d.skill === skill),
        ability, extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const d of shaolinUnarmedLearningProfiles) {
        const { skill, usage, force, maxNeili, qiFloor, neiliFloor, qiCost, neiliCost } = d;
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'practice']) add(d, ability, level);
        for (const basic of [199, 200]) edge(skill, 'valid_learn', 'basic' + basic, {
            skills: { [usage]: basic }, expected: basic < 200 && !noRelativeBasic.has(skill) ? 'refused' : 'observed' });
        if (force) for (const value of [Math.abs(force) - 1, Math.abs(force)]) edge(skill, 'valid_learn', 'force' + value, {
            skills: { force: force < 0 ? value : value * 2 }, unmappedForce: force > 0,
            expected: value < Math.abs(force) ? 'refused' : 'observed' });
        else edge(skill, 'valid_learn', 'zero-basic-force', { skills: { force: 0 }, unmappedForce: true });
        if (maxNeili) for (const value of [maxNeili - 1, maxNeili]) edge(skill, 'valid_learn', 'maxneili' + value, {
            properties: { max_neili: value }, expected: value < maxNeili ? 'refused' : 'observed' });
        else edge(skill, 'valid_learn', 'zero-maxneili', { properties: { max_neili: 0 } });
        if (fixedBasic[skill]) for (const value of [fixedBasic[skill] - 1, fixedBasic[skill]])
            edge(skill, 'valid_learn', 'basic-floor' + value, { level: 1, skills: { [usage]: value },
                expected: value < fixedBasic[skill] ? 'refused' : 'observed' });
        for (const ability of ['valid_learn', 'practice']) edge(skill, ability, 'armed', {
            weapon: true, expected: skill === 'shaolin-shenfa' ? 'observed' : 'refused' });
        edge(skill, 'practice', 'equal-basic', { skills: { [usage]: 200 }, expected: 'refused' });
        edge(skill, 'practice', 'times50', { times: 50,
            ...(skill === 'rulai-zhang' ? { properties: { neili: 12000, max_neili: 12000 } } : {}) });
        if (qiFloor) {
            edge(skill, 'practice', 'low-qi', { properties: { qi: qiFloor - 1 }, expected: 'refused' });
            edge(skill, 'practice', 'minimum-qi', { properties: { qi: qiFloor } });
            edge(skill, 'practice', 'partial-qi', { times: 3, completed: 2, properties: { qi: qiFloor + qiCost } });
        }
        if (neiliFloor) {
            edge(skill, 'practice', 'low-neili', { properties: { neili: neiliFloor - 1 }, expected: 'refused' });
            edge(skill, 'practice', 'minimum-neili', { properties: { neili: neiliFloor } });
            edge(skill, 'practice', 'partial-neili', { times: 3, completed: 2, properties: { neili: neiliFloor + neiliCost } });
        } else edge(skill, 'practice', 'zero-neili', { properties: { neili: 0 } });
    }
    for (const [skill, key, floor] of [['shenzhang-bada', 'dex', 26], ['rulai-zhang', 'con', 32], ['rulai-zhang', 'dex', 30],
        ['jingang-zhi', 'str', 30], ['jingang-zhi', 'con', 32], ['qufannao-zhi', 'str', 24],
        ['yintuoluo-zhua', 'dex', 30], ['yintuoluo-zhua', 'str', 30], ['yintuoluo-zhua', 'int', 30],
        ['dacidabei-shou', 'dex', 26], ['dacidabei-shou', 'con', 26]])
        for (const value of [floor - 1, floor]) edge(skill, 'valid_learn', key + value, {
            properties: { [key]: value }, expected: value < floor ? 'refused' : 'observed' });
    for (const [skill, key, floor] of [['fuhu-quan', 'hunyuan-yiqi', 100], ['rulai-zhang', 'buddhism', 300],
        ['yintuoluo-zhua', 'buddhism', 250], ['dacidabei-shou', 'buddhism', 200]])
        for (const value of [floor - 1, floor]) edge(skill, 'valid_learn', key + value, {
            skills: { [key]: value }, expected: value < floor ? 'refused' : 'observed' });
    for (const [level, buddhism, allowed] of [[250, 249, false], [250, 250, true], [400, 299, false], [400, 300, true], [800, 300, true]])
        edge('dacidabei-shou', 'valid_learn', 'buddhism' + buddhism, { level, skills: { buddhism }, expected: allowed ? 'observed' : 'refused' });
    for (const [level, hunyuan, allowed] of [[59, 0, true], [60, 48, false], [60, 49, true], [173, 139, true],
        [174, 139, false], [200, 139, false], [200, 140, true], [800, 140, true]])
        edge('qufannao-zhi', 'valid_learn', 'hunyuan' + hunyuan, { level, skills: { finger: Math.max(120, level + 1),
            'hunyuan-yiqi': hunyuan }, expected: allowed ? 'observed' : 'refused' });
    for (const skill of ['duoluoye-zhi', 'xiuluo-zhi', 'tianzhu-fuzhi']) for (const ability of ['valid_learn', 'practice'])
        edge(skill, ability, 'canhe1', { skills: { 'canhe-zhi': 1 }, expected: 'refused' });
    for (const [sanhua, banruo, allowed] of [[79, 79, false], [80, 0, true], [0, 80, true]])
        edge('woshi-zhang', 'valid_learn', `sanhua${sanhua}-banruo${banruo}`, {
            skills: { 'sanhua-zhang': sanhua, 'banruo-zhang': banruo }, expected: allowed ? 'observed' : 'refused' });
    for (const [unarmed, cuff, allowed] of [[199, 199, false], [200, 199, true], [199, 200, true]])
        edge('zuiquan-sanda', 'valid_learn', `unarmed${unarmed}-cuff${cuff}`, {
            skills: { unarmed, cuff }, expected: allowed ? 'observed' : 'refused' });
    for (const [unarmed, dodge, allowed] of [[199, 201, false], [201, 199, false], [200, 200, true]])
        edge('shaolin-tantui', 'valid_learn', `unarmed${unarmed}-dodge${dodge}`, {
            skills: { unarmed, dodge }, expected: allowed ? 'observed' : 'refused' });
    for (const [skill, usage] of [['zuiquan-sanda', 'unarmed'], ['shaolin-tantui', 'dodge']])
        for (const level of [200, 400, 800]) edge(skill, 'practice', usage, { level, usage });
    for (const jingli of [29, 30]) edge('fuhu-quan', 'practice', 'jingli' + jingli, {
        properties: { jingli }, expected: jingli < 30 ? 'refused' : 'observed' });
    edge('fuhu-quan', 'practice', 'qi24-times3', { times: 3, properties: { qi: 24 } });
    for (const skill of ['qinna-shibada', 'pona-gong']) edge(skill, 'valid_learn', 'zero-hunyuan', {
        skills: { 'hunyuan-yiqi': 0 } });
    for (const level of [299, 300, 499, 500]) edge('luohan-quan', 'practice', 'gain-break', { level });
    return result;
}

export function validateShaolinUnarmedLearningRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], after = raw.immediate[0];
    assert.equal(raw.outcome, p.expected);
    for (const [state, config] of [[before, p.actor], [raw.before[1], p.target]]) {
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.mappings, config.mappings);
        for (const [skill, value] of Object.entries(config.skills)) assert.equal(state.skills[skill] ?? 0, value);
        for (const key of ['qi', 'jing', 'jingli', 'neili', 'max_neili', 'int', 'con', 'dex', 'str', 'shen', 'combat_exp', 'jiali'])
            if (Object.hasOwn(config.properties, key)) assert.equal(state[key], config.properties[key]);
        if (Object.hasOwn(config.properties, 'family/family_name'))
            assert.equal(state.cultivation['family/family_name'], config.properties['family/family_name']);
    }
    assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    assert.equal(raw.attacks.length, 0); assert.equal(raw.launches.length, 0);
    assert.deepEqual(after.skills, before.skills, '零起始进度，不跨级');
    assert.deepEqual(raw.immediate[1], raw.before[1]);
    if (condition.method === 'interface') {
        assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].object, p.interface.object);
        assert.equal(raw.interfaces[0].function, 'valid_learn');
        assert.equal(raw.interfaces[0].result, Number(p.expected === 'observed'));
        const a = structuredClone(after), b = structuredClone(before);
        delete a.temp.notify_fail; delete b.temp.notify_fail;
        assert.deepEqual(a, b, '资格接口不应改变资源');
    } else {
        const d = shaolinUnarmedLearningProfiles.find(d => d.skill === p.skill);
        assert.equal(raw.interfaces.length, 0);
        assert.equal(after.qi, Math.max(-1, before.qi - p.completed * d.qiCost));
        assert.equal(before.neili - after.neili, p.completed * d.neiliCost);
        for (const key of ['jing', 'jingli', 'max_neili', 'eff_qi', 'eff_jing', 'learned_points', 'force_attribute'])
            assert.equal(after[key], before[key], key + ' unchanged');
        assert.equal((after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0),
            p.completed * practiceGain(p.level, before.skills[p.usage], before.int));
        assert.equal(raw.command_accepted, Number(p.completed === p.repetitions));
    }
    if (raw.outcome === 'refused') assert.ok(raw.reason.length > 0);
}
