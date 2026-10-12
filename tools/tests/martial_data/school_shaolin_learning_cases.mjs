// Reviewed weapon qualification and practice only; original game behavior stays unchanged.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';

// skill, basic, effective force, max neili, raw basic floor, qi floor,
// current neili floor, qi cost, neili cost, teacher. Weituo-chu is special below.
export const shaolinLearningProfiles = [
    ['damo-jian', 'sword', 60, 300, 0, 70, 70, 62, 69, 'cheng-shang'],
    ['cibei-dao', 'blade', 30, 100, 0, 60, 60, 55, 58, 'cheng-xing'],
    ['xiuluo-dao', 'blade', 30, 100, 0, 70, 80, 65, 69, 'cheng-xin2'],
    ['zui-gun', 'club', 50, 250, 0, 65, 65, 58, 54, 'cheng-ling'],
    ['weituo-gun', 'club', 50, 250, 0, 70, 70, 62, 61, 'cheng-ji'],
    ['weituo-chu', 'staff', 0, 1500, 0, 0, 70, 0, 0, 'cheng-ji'],
    ['yecha-gun', 'club', 100, 500, 100, 70, 60, 55, 45, 'cheng-ji'],
    ['hongye-daofa', 'blade', 0, 1000, 80, 50, 80, 25, 40, 'cheng-xing'],
    ['jiechen-dao', 'blade', 0, 1500, 100, 70, 50, 60, 35, 'cheng-xin2'],
    ['ranmu-daofa', 'blade', 250, 2000, 100, 80, 90, 75, 85, 'da-mo'],
    ['qingliang-jian', 'sword', 0, 500, 50, 50, 0, 35, 0, 'cheng-he'],
    ['leiming-bian', 'whip', 40, 100, 0, 50, 0, 15, 0, 'cheng-zhi2'],
    ['qingyun-bian', 'whip', 0, 500, 0, 50, 0, 30, 0, 'cheng-zhi2'],
];
const relativeBasic = new Set(['damo-jian', 'cibei-dao', 'xiuluo-dao', 'zui-gun', 'weituo-gun', 'yecha-gun', 'ranmu-daofa']);
const armedLearning = new Set(['yecha-gun', 'ranmu-daofa', 'leiming-bian', 'qingyun-bian']);

export function shaolinLearningConditions(catalog, { smoke = false } = {}) {
    const result = [];
    function add(d, ability, level = 200, extra = {}) {
        const [skill, usage] = d, practice = ability === 'practice';
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, `缺少少林武学 ${skill}`);
        const actor = {
            skills: { force: 600, 'hunyuan-yiqi': 400, 'shaolin-xinfa': 400,
                [usage]: level + 1, [skill]: level, ...extra.skills },
            mappings: { force: 'hunyuan-yiqi', [usage]: skill },
            properties: { qi: 10000, jing: 10000, jingli: 10000, neili: 6000, max_neili: 6000,
                int: 36, con: 36, dex: 36, str: 36, shen: 1000000, jiali: 0,
                combat_exp: 100000000, 'family/family_name': '少林派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        const weapon = extra.weapon ?? usage;
        if (weapon !== 'none') actor.equipment = { type: weapon, hold: false };
        if (extra.unmapped) delete actor.mappings[usage];
        if (extra.unmappedForce) delete actor.mappings.force;
        const repetitions = extra.times ?? 1;
        result.push({ id: `school-shaolin-weapon-learning-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: practice ? 'practice' : 'interface', samples: smoke ? 1 : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-weapon-learning',
                combination: practice ? 'practice' : 'qualification', skill, usage, ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice ${usage} ${repetitions}` : 'test_interface',
                ...(!practice ? { interface: { object: `/kungfu/skill/${skill}`, function: 'valid_learn' } }
                    : { repetitions, completed: extra.completed ?? (extra.expected === 'refused' ? 0 : repetitions) }),
                observation: 'single_action_immediate', fighting: extra.fighting ?? false, observe_seconds: 0,
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [source.path, `kungfu/class/shaolin/${d[9]}.c`, 'inherit/skill/shaolin.c',
                    'kungfu/skill/hunyuan-yiqi.c', 'kungfu/skill/shaolin-xinfa.c', 'cmds/skill/enable.c',
                    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'feature/skill.c', 'feature/damage.c'],
                qualification_note: '真实非巫师USER，原valid_learn及practice命令；技能/门派/属性为显式实验赋值，不代替教师收徒、可教上限及养成成本。基本功默认高一级，零起始进度；只看即时结果，保留精力与精神字段错配、原门槛和部分完成，不替游戏修复。青云鞭通过原enable建立首次加载上下文，不替换全局动作表。确定性条件正式各2次，烟雾各1次。',
            } });
    }
    const edge = (skill, ability, suffix, extra = {}) => add(shaolinLearningProfiles.find(d => d[0] === skill),
        ability, extra.level ?? 200, { suffix: '-' + suffix, ...extra });
    for (const d of shaolinLearningProfiles) {
        const [skill, usage, force, max, basic, qi, neili, qiCost, neiliCost] = d;
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'practice']) add(d, ability, level);
        for (const value of [199, 200]) edge(skill, 'valid_learn', 'basic' + value, {
            skills: { [usage]: value }, expected: value < 200 && relativeBasic.has(skill) ? 'refused' : 'observed' });
        if (force) for (const value of [force - 1, force]) edge(skill, 'valid_learn', 'force' + value, {
            skills: { force: value * 2 }, unmappedForce: true, expected: value < force ? 'refused' : 'observed' });
        for (const value of [max - 1, max]) edge(skill, 'valid_learn', 'maxneili' + value, {
            properties: { max_neili: value }, expected: value < max ? 'refused' : 'observed' });
        if (basic) for (const value of [basic - 1, basic]) edge(skill, 'valid_learn', 'basic-floor' + value, {
            level: 1, skills: { [usage]: value }, expected: value < basic ? 'refused' : 'observed' });
        edge(skill, 'valid_learn', 'no-weapon', { weapon: 'none', expected: armedLearning.has(skill) ? 'refused' : 'observed' });
        edge(skill, 'practice', 'no-weapon', { weapon: 'none', expected: 'refused' });
        edge(skill, 'practice', 'wrong-weapon', { weapon: usage === 'sword' ? 'club' : 'sword', expected: 'refused' });
        edge(skill, 'practice', 'equal-basic', { skills: { [usage]: 200 }, expected: 'refused' });
        edge(skill, 'practice', 'times50', { times: 50 });
        if (qi) {
            edge(skill, 'practice', 'low-qi', { properties: { qi: qi - 1 }, expected: 'refused' });
            edge(skill, 'practice', 'minimum-qi', { properties: { qi } });
            edge(skill, 'practice', 'partial-qi', { times: 3, completed: 2, properties: { qi: qi + qiCost } });
        }
        if (neili) {
            edge(skill, 'practice', 'low-neili', { properties: { neili: neili - 1 }, expected: 'refused' });
            edge(skill, 'practice', 'minimum-neili', { properties: { neili } });
            if (neiliCost) edge(skill, 'practice', 'partial-neili', {
                times: 3, completed: 2, properties: { neili: neili + neiliCost } });
        } else edge(skill, 'practice', 'zero-neili', { properties: { neili: 0 } });
    }
    for (const [skill, key, floor] of [['damo-jian', 'int', 30], ['yecha-gun', 'dex', 22],
        ['hongye-daofa', 'int', 24], ['jiechen-dao', 'con', 24], ['ranmu-daofa', 'int', 32], ['ranmu-daofa', 'con', 30]])
        for (const value of [floor - 1, floor]) edge(skill, 'valid_learn', key + value, {
            properties: { [key]: value }, expected: value < floor ? 'refused' : 'observed' });
    for (const [skill, key, floor] of [['hongye-daofa', 'hunyuan-yiqi', 80], ['jiechen-dao', 'hunyuan-yiqi', 80],
        ['qingliang-jian', 'shaolin-xinfa', 50], ['qingyun-bian', 'shaolin-xinfa', 80]])
        for (const value of [floor - 1, floor]) edge(skill, 'valid_learn', key + value, {
            skills: { [key]: value }, expected: value < floor ? 'refused' : 'observed' });
    for (const level of [10, 11, 150, 151, 200, 400, 800]) {
        const minimum = level <= 10 ? null : level <= 150 ? 20 : 11100 + (level - 100) * 1000;
        for (const shen of minimum === null ? [-1000000, 0] : [minimum - 1, minimum])
            edge('qingyun-bian', 'valid_learn', 'shen' + shen, { level, properties: { shen },
                expected: minimum !== null && shen < minimum ? 'refused' : 'observed' });
    }
    for (const force of [99, 100]) edge('leiming-bian', 'practice', 'force' + force, {
        skills: { force: force * 2 }, unmappedForce: true, expected: force < 100 ? 'refused' : 'observed' });
    for (const ability of ['valid_learn', 'practice']) edge('weituo-chu', ability, 'other-family', {
        properties: { 'family/family_name': '武当派' }, expected: 'refused' });
    for (const jingli of [69, 70]) edge('weituo-chu', 'practice', 'jingli' + jingli, {
        properties: { jingli }, expected: jingli < 70 ? 'refused' : 'observed' });
    for (const level of [200, 201]) {
        edge('weituo-chu', 'practice', 'neili70-times3', { level, times: 3, completed: level > 200 ? 1 : 3,
            properties: { neili: 70 } });
        edge('weituo-chu', 'practice', 'jing59-times3', { level, times: 3, properties: { jing: 59 } });
    }
    edge('weituo-chu', 'practice', 'partial-neili', { level: 201, times: 3, completed: 2, properties: { neili: 90 } });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['unmapped', { unmapped: true }], ['no-learn', { properties: { 'env/no_learn': 'damo-jian' } }],
        ['low-exp', { properties: { combat_exp: 799999 } }]])
        edge('damo-jian', 'practice', suffix, { ...extra, expected: 'refused' });
    for (const level of [299, 300, 499, 500]) edge('damo-jian', 'practice', 'gain-break', { level });
    return result;
}

export function validateShaolinLearningRecord(raw, condition) {
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
    assert.equal(after.max_neili, before.max_neili);
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
        const d = shaolinLearningProfiles.find(d => d[0] === p.skill), chu = p.skill === 'weituo-chu';
        assert.equal(raw.interfaces.length, 0);
        assert.equal(before.qi - after.qi, p.completed * d[7]);
        assert.equal(before.neili - after.neili, p.completed * (chu && p.level > 200 ? 20 : d[8]));
        assert.equal(after.jingli, before.jingli);
        assert.equal(after.jing, chu ? Math.max(-1, before.jing - 60 * p.completed) : before.jing);
        assert.equal((after.learned[p.skill] ?? 0) - (before.learned[p.skill] ?? 0),
            p.completed * practiceGain(p.level, before.skills[p.usage], before.int));
        assert.equal(after.learned_points, before.learned_points);
        assert.equal(after.force_attribute, before.force_attribute);
        assert.equal(raw.command_accepted, Number(p.completed === p.repetitions));
    }
    if (raw.outcome === 'refused') assert.ok(raw.reason.length > 0);
}
