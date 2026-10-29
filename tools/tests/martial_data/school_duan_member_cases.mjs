// Independent abilities of the two source-declared Duan combination members.
// Teaching and natural acquisition are deliberately not inferred from these inputs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export const duanMemberReviewedSources = {
    'kungfu/skill/jinyu-quan.c': 'd168eb1f5ac90038e0fab414300ec2e2784d28d7b917172cac362e9b12f620c1',
    'kungfu/skill/wuluo-zhang.c': '1e8a3f6bd60c82dca36695ab4fe43e73d9e8b66ce40560c7e890d740b473e708',
    'kungfu/class/duan/ba.c': 'dfa0bcebeaea4236567ff921fb826fc2cd0d0634903fab37d293f2a1094c58e7',
};
const forceSources = {
    'kungfu/skill/duanshi-xinfa.c': '1b2fdc69e12934d5db97f25c519b32f2b1fdb75fdc342b70173616db3b4fdfb3',
    'inherit/skill/force.c': '36735e9c04ed4f67007ad53e0f155d84323aa6e7acab77eb80e00586cd600d69',
};
const definitions = {
    'jinyu-quan': { usage: 'cuff', force: 100, max: 500, qiCost: 35, neiliCost: 21,
        learnForce: '你的内功火候不够，无法练金玉拳。\n',
        learnMax: '你的内力太弱，无法练金玉拳。\n',
        learnBasic: '你的基本拳法火候水平有限，无法领会更高深的金玉拳。\n',
        learnArmed: '练金玉拳必须空手。\n',
        practiceQi: '你的体力太低了。\n', practiceNeili: '你的内力不够练金玉拳。\n' },
    'wuluo-zhang': { usage: 'strike', force: 20, max: 100, qiCost: 40, neiliCost: 13,
        learnForce: '你的内功火候不够，无法学越爪功。\n',
        learnMax: '你的内力修为太弱，无法练越爪功。\n',
        learnBasic: '你的基本掌法火候有限，无法领会更高深的五罗轻烟掌。\n',
        learnArmed: '练五罗轻烟掌必须空手。\n',
        practiceQi: '你的体力太差了，不能练五罗轻烟掌。\n',
        practiceNeili: '你的内力太差了，不能练五罗轻烟掌。\n' },
};
const properties = { qi: 10000, eff_qi: 10000, max_qi: 10000, jing: 10000,
    eff_jing: 10000, max_jing: 10000, neili: 6000, max_neili: 6000, jiali: 0,
    combat_exp: 100000000, str: 30, int: 36, con: 30, dex: 30, gender: '男性' };

export function duanMemberConditions(catalog, readSource, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    for (const [path, expected] of Object.entries({ ...duanMemberReviewedSources, ...forceSources }))
        assert.equal(createHash('sha256').update(readSource(path)).digest('hex'), expected,
            '段氏成员来源已改变，须重新审阅：' + path);
    const result = [];
    for (const [skill, cfg] of Object.entries(definitions)) {
        const source = catalog.skills.find(s => s.id === skill);
        assert.ok(source, '缺少段氏成员原文件：' + skill);
        assert.equal(source?.sha256, duanMemberReviewedSources[source?.path]);
        function add(ability, suffix, extra = {}) {
            const level = extra.level ?? 200, ordinary = ability === 'ordinary';
            const actor = { skills: { force: 400, dodge: level, parry: level, sword: 200,
                [cfg.usage]: level, [skill]: level,
                ...(extra.mappedForce ? { 'duanshi-xinfa': level } : {}), ...extra.skills },
                mappings: ordinary ? { [cfg.usage]: skill,
                    ...(extra.mappedForce ? { force: 'duanshi-xinfa' } : {}) } : {},
                preparations: ordinary ? { [cfg.usage]: skill } : {},
                properties: { ...properties, 'family/family_name': '段氏皇族', ...extra.properties },
                ...(extra.equipment ? { equipment: extra.equipment } : {}) };
            const entry = ordinary ? source.path : source.entries.find(e => e.function === ability)?.id;
            assert.ok(entry, '缺少原成员接口：' + skill + '/' + ability);
            result.push({ id: `school-s1-duan-${extra.mappedForce ? 'force-' : ''}${skill}-${ability}-${suffix}`,
                stage: 'school', method: ordinary ? 'ordinary' : 'interface', entry_id: entry,
                samples: smoke ? 2 : ordinary ? samples : 2,
                parameters: { school: 'duan', family: '段氏皇族', collection_group: 's1-duan-members',
                    skill, usage: cfg.usage, ability, level, actor,
                    target: { skills: { force: 600, dodge: 600, parry: 600 },
                        mappings: {}, preparations: {}, properties: { ...properties } },
                    action: ordinary ? 'ordinary' : 'test_interface', fighting: ordinary,
                    observation: 'single_action_immediate', observe_seconds: 0,
                    expected: extra.refusal ? 'refused' : 'observed', refusal: extra.refusal ?? '',
                    expected_result: extra.value ?? 1, not_applicable: '',
                    ...(extra.mappedForce ? { mapped_force: 'duanshi-xinfa' } : {}),
                    ...(ordinary ? {} : { interface: { object: '/kungfu/skill/' + skill,
                        function: ability, ...(extra.argument ? { argument: extra.argument } : {}) } }),
                    source_evidence: { ...duanMemberReviewedSources, ...(extra.mappedForce ? forceSources : {}) },
                    qualification_sources: [...Object.keys(duanMemberReviewedSources),
                        ...(extra.mappedForce ? Object.keys(forceSources) : []),
                        'feature/skill.c', 'feature/attack.c', 'feature/equip.c',
                        'adm/daemons/combatd.c', 'include/combat.h'],
                    qualification_note: '巴天石原配置明确会、映射并互备金玉拳与五罗轻烟掌。本批拆开测试两成员，不复制NPC配装或证明拜师/实际授课。属性、修为、门派是显式实验输入；普攻单备、基本内功400'
                        + (extra.mappedForce ? '同时激发与主技能同档段氏心法' : '无特殊内功')
                        + '，三档200/400/800及加力0/50分列。学习检查不激发拳掌，基本功有效值为原始/2；practice_skill仅原接口费用与拒绝，不冒充practice命令的实际进度。副手剑是显式诊断初态，非正常wield路径；旧组合/绝招证据不重采或混算。',
                } });
        }
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add('ordinary', `l${level}-jiali${jiali}`, { level, properties: { jiali } });
        for (const argument of [cfg.usage, 'parry', 'sword'])
            add('valid_enable', argument, { argument, value: argument === 'sword' ? 0 : 1 });
        add('valid_learn', 'baseline');
        for (const effective of [cfg.force - 1, cfg.force])
            add('valid_learn', 'force' + effective, { skills: { force: effective * 2 },
                ...(effective < cfg.force ? { refusal: cfg.learnForce, value: 0 } : {}) });
        for (const max of [cfg.max - 1, cfg.max])
            add('valid_learn', 'max-neili' + max, { properties: { max_neili: max },
                ...(max < cfg.max ? { refusal: cfg.learnMax, value: 0 } : {}) });
        for (const basic of [199, 200]) add('valid_learn', 'basic' + basic,
            { skills: { [cfg.usage]: basic }, ...(basic < 200 ? { refusal: cfg.learnBasic, value: 0 } : {}) });
        for (const slot of ['weapon', 'secondary_weapon']) add('valid_learn', slot,
            { equipment: { type: 'sword', hold: false, ...(slot === 'secondary_weapon' ? { slot } : {}) },
                refusal: cfg.learnArmed, value: 0 });
        if (skill === 'jinyu-quan') for (const basic of [39, 40])
            add('valid_learn', 'minimum-basic' + basic, { skills: { cuff: basic, [skill]: 20 },
                ...(basic < 40 ? { refusal: '你的基本拳法等级太低，无法练金玉拳。\n', value: 0 } : {}) });
        add('practice_skill', 'baseline');
        for (const qi of [49, 50]) add('practice_skill', 'qi' + qi, { properties: { qi },
            ...(qi < 50 ? { refusal: cfg.practiceQi, value: 0 } : {}) });
        for (const neili of [29, 30]) add('practice_skill', 'neili' + neili, { properties: { neili },
            ...(neili < 30 ? { refusal: cfg.practiceNeili, value: 0 } : {}) });
        for (const level of [200, 400, 800]) for (const jiali of [0, 50])
            add('ordinary', `l${level}-jiali${jiali}`, { level, mappedForce: true, properties: { jiali } });
    }
    return result;
}

const withoutNotify = state => {
    const value = structuredClone(state);
    if (value.temp) delete value.temp.notify_fail;
    return value;
};
export function validateDuanMemberRecord(raw, condition) {
    const p = condition.parameters, cfg = definitions[p.skill];
    assert.ok(cfg); assert.equal(p.collection_group, 's1-duan-members');
    assert.equal(raw.outcome, p.expected); assert.equal(raw.method, condition.method);
    assert.equal(raw.launches.length, 0); assert.deepEqual(raw.after, raw.immediate);
    for (const [side, configured] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side];
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.skills, configured.skills);
        assert.deepEqual(state.mappings, configured.mappings);
        assert.deepEqual(state.preparations, configured.preparations);
        for (const [key, value] of Object.entries(configured.properties))
            assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value, '初态：' + key);
    }
    const before = raw.before[0];
    assert.equal(before.cultivation['family/family_name'], '段氏皇族');
    if (p.actor.equipment?.slot === 'secondary_weapon') {
        assert.equal(before.weapon, 'none'); assert.equal(before.secondary_weapon, 'sword');
        assert.equal(before.secondary_weapon_details.program, '/tests/sword');
    } else assert.equal(before.weapon, p.actor.equipment?.type ?? 'none');
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const hits = raw.attacks.filter(a => a.actor === 0 && a.target === 1);
        assert.equal(hits.length, 1);
        assert.equal(hits[0].attack_usage, cfg.usage); assert.equal(hits[0].attack_skill, p.skill);
        assert.equal(hits[0].type, 0); assert.ok([0, -1, -2].includes(hits[0].result));
        if (p.mapped_force) {
            const calls = raw.passives.filter(e => e.route === 'force');
            const expected = before.jiali && hits[0].result === 0 ? 1 : 0;
            assert.equal(calls.length, expected, '原内功仅在普通命中且加力非零时调用');
            for (const call of calls) {
                assert.equal(call.skill, 'duanshi-xinfa'); assert.equal(call.actor, 0); assert.equal(call.target, 1);
                assert.equal(call.factor, before.jiali);
                assert.ok(Number.isInteger(call.result) && call.result >= 0 && call.result <= 100);
            }
            assert.equal(raw.metrics[0].neili_cost ?? 0, expected * before.jiali,
                '相同经验无20倍豁免，原FORCE逐次扣加力');
        }
        return;
    }
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 1);
    const permitted = p.ability === 'valid_enable'
        ? [cfg.usage, 'parry'].includes(p.interface.argument)
        : p.ability === 'practice_skill' ? before.qi >= 50 && before.neili >= 30
            : before.weapon === 'none' && (before.secondary_weapon ?? 'none') === 'none'
                && Math.trunc(before.skills.force / 2) >= cfg.force && before.max_neili >= cfg.max
                && (p.skill !== 'jinyu-quan' || Math.trunc(before.skills.cuff / 2) >= 20)
                && before.skills[cfg.usage] >= before.skills[p.skill];
    assert.equal(p.expected_result, Number(permitted), '声明结果必须符合原接口条件');
    const call = raw.interfaces[0];
    assert.equal(call.object, p.interface.object); assert.equal(call.function, p.ability);
    assert.equal(call.result, p.expected_result);
    if (p.ability === 'valid_enable') assert.equal(call.argument, p.interface.argument);
    if (p.expected === 'refused') {
        const prefix = '\x1b[256D\x1b[K';
        const reason = raw.reason.startsWith(prefix) ? raw.reason.slice(prefix.length) : raw.reason;
        assert.equal(reason, p.refusal, '仅去掉原notify_fail终端清行前缀，拒绝正文必须精确匹配');
    }
    const expected = withoutNotify(before), after = withoutNotify(raw.immediate[0]);
    if (p.ability === 'practice_skill' && p.expected_result) {
        expected.qi -= cfg.qiCost; expected.neili -= cfg.neiliCost;
        assert.equal(raw.metrics[0].qi_cost, cfg.qiCost);
        assert.equal(raw.metrics[0].neili_cost, cfg.neiliCost);
    }
    assert.deepEqual(after, expected, '接口只能产生原练习费用或拒绝通知');
    assert.deepEqual(raw.immediate[1], raw.before[1]);
}
