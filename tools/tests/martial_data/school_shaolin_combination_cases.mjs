// Original prepare commands and fight rounds; declared combinations are not teaching proof.
import assert from 'node:assert/strict';
import { validateWudangCombinationRecord } from './school_wudang_combination_cases.mjs';

export const shaolinPairs = [
    ['luohan-quan', 'cuff', 'qinna-shibada', 'unarmed'],
    ['banruo-zhang', 'strike', 'yizhi-chan', 'finger'],
    ['sanhua-zhang', 'strike', 'nianhua-zhi', 'finger'],
    ['xumishan-zhang', 'strike', 'jingang-zhi', 'finger'],
    ['shenzhang-bada', 'strike', 'wuxiang-zhi', 'finger'],
    ['longzhua-gong', 'claw', 'qianye-shou', 'hand'],
    ['fengyun-shou', 'hand', 'yingzhua-gong', 'claw'],
];
export const shaolinAsymmetricPair = ['pona-gong', 'unarmed', 'hunyuan-zhang', 'strike'];

export function shaolinCombinationConditions(catalog, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(pair, id, method, level, steps = [], extra = {}) {
        const [a, au, b, bu] = pair;
        const skill = extra.skill ?? a, source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少互备源码：' + skill);
        const actor = {
            skills: { unarmed: level, cuff: level, strike: level, finger: level, hand: level, claw: level,
                [a]: level, [b]: level, sword: level, 'damo-jian': level, 'jingang-quan': level,
                force: 600, parry: level, dodge: extra.dex8 ? 0 : 600, ...extra.skills },
            mappings: { [au]: a, [bu]: b, sword: 'damo-jian', parry: a },
            preparations: {}, properties: { jiali: extra.jiali ?? 0, str: extra.str ?? 36,
                dex: extra.dex8 ? 8 : 36, neili: 6000, max_neili: 6000, 'family/family_name': '少林派' },
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}),
        };
        for (const usage of extra.unmapped ?? []) delete actor.mappings[usage];
        // Even set_skill(missing, 0) resolves the original skill object. Leave it absent.
        if (b === 'qinlong-shou') delete actor.skills[b];
        result.push({ id: `school-shaolin-combination-${a}-${b}-${id}-l${level}`,
            stage: 'school', entry_id: source.path, method,
            samples: smoke ? 2 : method === 'round' ? samples : 2,
            parameters: { school: 'shaolin', family: '少林派', collection_group: 'shaolin-combination',
                skill, level, combination: id, ability: method, observation: 'single_action_immediate',
                actor, target: { skills: { unarmed: 600, force: 600, parry: 600, dodge: 600 },
                    mappings: {}, properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
                    ...(extra.targetBusy ? { busy: 2 } : {}) },
                action: method === 'interface' ? 'test_interface' : method === 'round' ? 'fight_round' : 'prepare_sequence',
                ...(method === 'interface' ? { interface: { object: '/kungfu/skill/' + skill,
                    function: 'valid_combine', combo: extra.combo }, combine_result: extra.allowed }
                    : { prepare_commands: steps }),
                fighting: method === 'round', observe_seconds: 0, not_applicable: '',
                expected: method === 'prepare' && !steps.some(s => s.accepted) ? 'refused' : 'observed',
                qualification_sources: [source.path, ...[a, b].filter(s => catalog.skills.some(k => k.id === s))
                    .map(s => 'kungfu/skill/' + s + '.c'), 'cmds/skill/prepare.c', 'feature/skill.c',
                    'feature/action.c', 'feature/attribute.c', 'adm/daemons/combatd.c', 'include/combat.h',
                    'inherit/skill/shaolin.c', 'inherit/skill/skill.c', 'kungfu/skill/damo-jian.c',
                    'kungfu/class/shaolin/da-mo.c', 'kungfu/class/shaolin/cheng-shi.c',
                    'kungfu/class/shaolin/cheng-yi.c', 'kungfu/class/shaolin/cheng-zhi.c'],
                qualification_note: '真实非巫师USER，等级与映射为实验赋值，不证明从师可学或同养成成本。七组双向互备、破衲/混元单向声明、伏虎停用历史注释分开；外部混元掌不归成少林传授。全部准备经原命令，不预填prepare/action_flag；原fight仅一轮，保留守势、随机、反击与选招次序，不是完整交锋。基本内功600未映射，隔离内功被动；加力不代表正常门派完整配置。',
            } });
    }
    function stepsFor(pair, first, route, allowed = true) {
        const [a, au, b, bu] = pair, usage = { [a]: au, [b]: bu };
        const second = first === a ? b : a;
        const prep = names => Object.fromEntries(names.map(s => [usage[s], s]));
        if (route === 'sequential') {
            // The second skill is the caller of valid_combine in this command form.
            const accept = pair === shaolinAsymmetricPair ? second === a : allowed;
            return [{ action: 'prepare ' + first, accepted: 1, preparations: prep([first]) },
                { action: 'prepare ' + second, accepted: Number(accept), preparations: prep(accept ? [first, second] : [first]) }];
        }
        return [{ action: `prepare ${route === 'basics' ? usage[first] + ' ' + usage[second] : first + ' ' + second}`,
            accepted: Number(allowed), preparations: prep(allowed ? [first, second] : []) }];
    }
    for (const pair of [...shaolinPairs, shaolinAsymmetricPair]) {
        const [a, au, b, bu] = pair, asymmetric = pair === shaolinAsymmetricPair;
        const prep = names => Object.fromEntries(names.map(s => [s === a ? au : bu, s]));
        for (const first of [a, b]) for (const combo of [first === a ? b : a, first, 'not-a-skill'])
            add(pair, `${first}-allows-${combo}`, 'interface', 200, [], {
                skill: first, combo, allowed: Number(combo !== first && combo !== 'not-a-skill' && (!asymmetric || first === a)),
            });
        for (const level of [200, 400, 800]) {
            for (const first of [a, b]) for (const route of ['names', 'basics', 'sequential'])
                add(pair, `${first}-${route}`, 'prepare', level, stepsFor(pair, first, route, !asymmetric || first === a));
            for (const first of [a, b]) add(pair, first + '-solo', 'round', level,
                [{ action: 'prepare ' + first, accepted: 1, preparations: prep([first]) }]);
            for (const first of [a, b]) add(pair, first + '-pair', 'round', level,
                stepsFor(pair, first, 'names', !asymmetric || first === a));
        }
        const acceptedPair = stepsFor(pair, a, 'names');
        for (const [id, extra] of [['pair-jiali50', { jiali: 50 }], ['armed-round', { armed: true }],
            ['dex8-round', { dex8: true }], ['busy-target-round', { targetBusy: true }]])
            add(pair, id, 'round', 400, acceptedPair, extra);
        add(pair, 'cancel-round', 'round', 400, [...acceptedPair,
            { action: 'prepare none', accepted: 1, preparations: {} }]);
        for (const [id, extra] of [['unlearned', { skills: { [b]: 0 } }], ['unmapped', { unmapped: [au, bu] }]])
            add(pair, id, 'prepare', 200, [{ action: `prepare ${a} ${b}`, accepted: 0, preparations: {} }], extra);
        add(pair, 'third-refused', 'prepare', 200, [...acceptedPair,
            { action: 'prepare jingang-quan', accepted: 0, preparations: prep([a, b]) }]);
    }
    const missing = ['fuhu-quan', 'cuff', 'qinlong-shou', 'hand'];
    assert.ok(!catalog.skills.find(s => s.id === 'fuhu-quan').entries.some(e => e.function === 'valid_combine'),
        '伏虎历史互备代码已启用，须重新核对实际接口');
    assert.ok(!catalog.skills.some(s => s.id === 'qinlong-shou'), '缺失依赖已改变，须重查伏虎互备');
    for (const str of [32, 33]) {
        const zero = { unarmed: 0, cuff: 0, finger: 0, hand: 0, claw: 0, strike: 0, 'qinlong-shou': 0 };
        for (const combo of ['qinlong-shou', 'luohan-quan']) add(missing, `str${str}-${combo}`, 'interface', 200, [],
            { combo, str, skills: zero, unmapped: ['hand'], allowed: null });
        add(missing, 'str' + str + '-missing-target', 'prepare', 200,
            [{ action: 'prepare fuhu-quan qinlong-shou', accepted: 0, preparations: {} }],
            { str, skills: zero, unmapped: ['hand'] });
    }
    return result;
}

export function validateShaolinCombinationRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'shaolin');
    assert.deepEqual(p.actor.preparations, {});
    assert.equal(p.actor.mappings.force, undefined);
    if (p.skill === 'fuhu-quan') assert.equal(raw.before[0].effective_str, p.actor.properties.str);
    validateWudangCombinationRecord(raw, condition);
}
