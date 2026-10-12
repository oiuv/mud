// Observe original snake movement defense and practice; never replace game formulas.
import assert from 'node:assert/strict';
import { practiceGain } from './school_quanzhen_practice_cases.mjs';
import { emeiDefenseEffects } from './school_emei_defense_cases.mjs';
import { probability, distribution } from './statistics.mjs';

const skill = 'shexing-lifan', object = '/kungfu/skill/' + skill;
export const shexingGroup = 'emei-shexing';

export function shexingChance(attacker, defender) {
    if ((defender.skills[skill] ?? 0) < 100 || !defender.living) return 0;
    const ap = attacker.effective_skills.dodge + (attacker.skills.count ?? 0);
    const dp = Math.trunc(defender.skills.dodge * 2 / 5) + defender.skills[skill];
    assert.ok(ap > 0, '本批只采正 AP，不能为未知随机边界填概率');
    return Math.min(ap, Math.max(0, dp - Math.trunc(ap / 2))) / ap;
}

export function emeiShexingConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const source = catalog.skills.find(s => s.id === skill); assert.ok(source, '缺少蛇行狸翻源码');
    const result = [];
    function add(ability, level = 400, suffix = '', extra = {}) {
        const learning = ['practice', 'practice_skill', 'valid_learn'].includes(ability);
        const actor = learning ? {
            skills: { dodge: level + 1, [skill]: level, ...extra.skills },
            mappings: extra.unmapped ? {} : { dodge: skill },
            properties: { qi: 10000, jing: 10000, neili: 10000, max_neili: 10000,
                int: 36, str: 36, dex: 36, jiali: 0, combat_exp: 100000000, ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
        } : {
            skills: { unarmed: 600, force: 600, parry: 600, dodge: 600, count: extra.count ?? 0,
                ...(extra.mathematics ? { mathematics: extra.mathematics } : {}) },
            mappings: {}, properties: { str: 36, dex: 36, jiali: 0, neili: 6000, max_neili: 6000 },
        };
        const target = learning ? { skills: {}, mappings: {}, properties: {} } : {
            skills: { unarmed: 600, force: 600, parry: 600, dodge: level, [skill]: level },
            mappings: extra.unmapped ? {} : { dodge: skill },
            properties: { str: 36, dex: 36, jiali: 0, neili: extra.neili ?? 6000, max_neili: 6000 },
            ...(extra.busy ? { busy: 2 } : {}),
        };
        if (extra.weapon) actor.equipment = { type: 'sword', hold: false };
        const method = ability === 'ordinary' ? 'ordinary' : ability === 'practice' ? 'practice' : 'interface';
        const expected = extra.expected ?? 'observed', repetitions = extra.times ?? 1;
        const random = ['ordinary', 'direct', 'query_dodge_msg'].includes(ability)
            || (ability === 'valid_damage' && level >= 100 && !extra.unconscious);
        result.push({ id: `school-emei-shexing-${ability}-l${level}${suffix ? '-' + suffix : ''}`,
            stage: 'school', entry_id: source.path, method, samples: smoke ? (random ? 2 : 1) : random ? samples : 2,
            parameters: { school: 'emei', collection_group: shexingGroup, skill, usage: 'dodge', level, ability,
                combination: learning ? 'practice' : 'single-defense', actor, target,
                observation: 'single_action_immediate', observation_role: learning ? 'learning' : 'defense',
                action: method === 'ordinary' ? 'ordinary' : method === 'practice' ? `practice dodge ${repetitions}` : 'test_interface',
                ...(method === 'interface' ? { interface: { object: ability === 'direct' ? '/adm/daemons/combatd' : object,
                    function: ability === 'direct' ? 'do_damage' : ability,
                    ...(['direct', 'valid_damage'].includes(ability) ? { damage: 1000 } : {}),
                    ...(ability === 'direct' ? { attack_type: 0 } : {}),
                    ...(ability === 'valid_enable' ? { usage: extra.queryUsage } : {}) } } : {}),
                ...(method === 'practice' ? { repetitions, completed: extra.completed ?? (expected === 'refused' ? 0 : repetitions) } : {}),
                ...(extra.unconscious ? { target_state: 'unconscious' } : {}),
                fighting: ['ordinary', 'direct'].includes(ability) || !!extra.fighting,
                observe_seconds: 0, expected, not_applicable: '',
                qualification_sources: [source.path, 'kungfu/class/emei/zhou.c', 'inherit/skill/skill.c',
                    'adm/daemons/combatd.c', 'feature/skill.c', 'feature/damage.c', 'feature/action.c',
                    'cmds/skill/practice.c', 'cmds/skill/learn.c', 'kungfu/skill/dodge.c', 'kungfu/skill/unarmed.c'],
                qualification_note: '真实非巫师USER，原技能与普通攻击／公共直伤／练习命令分别采集；NPC来源不是取得资格的证明。额外化解只在原路径到达时登记，不重抽随机；count与mathematics分开。接口调用不冒充正常战斗触发率，昏迷用原unconcious准备。拒绝与部分练习不丢弃，原玩法不修。',
            } });
    }
    for (const level of [99, 100, 200, 400, 800]) {
        for (const count of [0, 99, 100, 400, 1200]) add('valid_damage', level, 'count' + count, { count });
        for (const count of [0, 400]) add('ordinary', level, 'count' + count, { count });
    }
    for (const level of [200, 400, 800]) {
        add('ordinary', level, 'unmapped', { unmapped: true }); add('direct', level);
        for (const ability of ['valid_learn', 'practice', 'practice_skill']) add(ability, level);
    }
    for (const ability of ['valid_damage', 'ordinary']) {
        add(ability, 400, 'busy', { busy: true }); add(ability, 400, 'neili0', { neili: 0 });
        add(ability, 400, 'armed', { weapon: true });
        add(ability, 200, 'mathematics1200', { mathematics: 1200 });
    }
    add('valid_damage', 400, 'unconscious', { unconscious: true });
    for (const queryUsage of ['parry', 'dodge', 'move']) add('valid_enable', 400, queryUsage, { queryUsage });
    for (const ability of ['query_effect_dodge', 'query_dodge_msg', 'query_action']) add(ability);
    add('valid_learn', 0, 'zero-resources', { skills: { dodge: 0 }, properties: { qi: 0, neili: 0 } });
    for (const ability of ['practice', 'practice_skill']) for (const [key, value] of [['qi', 149], ['qi', 150], ['neili', 199], ['neili', 200]])
        add(ability, 200, key + value, { properties: { [key]: value }, expected: value === 149 || value === 199 ? 'refused' : 'observed' });
    for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
        ['unmapped', { unmapped: true }], ['equal-basic', { skills: { dodge: 200 } }],
        ['low-exp', { properties: { combat_exp: 799999 } }], ['times0', { times: 0 }], ['times51', { times: 51 }]])
        add('practice', 200, suffix, { ...extra, expected: 'refused' });
    add('practice', 200, 'times50', { times: 50 });
    add('practice', 200, 'armed', { weapon: true });
    add('practice', 200, 'partial-qi', { properties: { qi: 230 }, times: 3, completed: 2 });
    add('practice', 200, 'partial-neili', { properties: { neili: 320 }, times: 3, completed: 2 });
    for (const level of [299, 300, 499, 500]) add('practice', level, 'gain-boundary');
    return result;
}

const zero = x => x === null || x === 0;
const metric = (r, side, key) => r.metrics[side][key] ?? 0;
export const shexingCalls = r => r.defenses.filter(d => d.actor === 0 && d.target === 1 && d.skill === skill);
export const shexingNegated = d => d.result && typeof d.result === 'object' && d.result.damage === -d.incoming;

export function validateEmeiShexingRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(raw.outcome, p.expected); assert.equal(raw.launches.length, 0);
    for (const k of ['before', 'immediate', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['defenses', 'attacks', 'interfaces', 'defense_messages']) assert.ok(Array.isArray(raw[k]));
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        assert.equal(b.userp, 1); assert.equal(b.interactive, 1); assert.equal(b.wizardp, 0);
        assert.deepEqual(b.mappings, cfg.mappings);
        for (const [key, value] of Object.entries(cfg.skills)) assert.equal(b.skills[key] ?? 0, value);
        for (const [key, value] of Object.entries(cfg.properties)) assert.equal(b[key], value);
        assert.equal(b.weapon, cfg.equipment?.type ?? 'none');
        assert.equal(b.busy || 0, p.target_state && side === 1 ? b.busy || 0 : cfg.busy ?? 0);
        assert.equal(Number(!!b.living), Number(!(side === 1 && p.target_state === 'unconscious')));
    }
    const calls = shexingCalls(raw), q = p.observation_role === 'defense' ? shexingChance(...raw.before) : null;
    for (const call of calls) {
        assert.ok(Object.hasOwn(call, 'result')); assert.ok(call.incoming > 0);
        assert.equal(call.route, p.ability === 'ordinary' ? 'ordinary-dodge' : 'interface');
        assert.ok(zero(call.result) || shexingNegated(call));
        if (shexingNegated(call)) assert.equal(typeof call.result.msg, 'string');
        if (q === 0) assert.ok(zero(call.result));
        if (q === 1) assert.ok(shexingNegated(call));
    }
    if (p.ability === 'ordinary') {
        assert.equal(raw.interfaces.length, 0);
        const attacks = raw.attacks.filter(a => a.actor === 0 && a.target === 1 && a.type === 0);
        assert.equal(attacks.length, 1); assert.ok([0, -1, -2].includes(attacks[0].result));
        assert.ok(calls.length <= 1);
        if (!p.target.mappings.dodge || attacks[0].result !== 0) assert.equal(calls.length, 0);
        if (calls.some(shexingNegated)) assert.equal(metric(raw, 1, 'qi_cost'), 0);
        assert.equal(metric(raw, 1, 'neili_cost'), 0); return;
    }
    if (p.ability === 'direct') {
        assert.equal(calls.length, 0); assert.equal(raw.interfaces.length, 1);
        assert.equal(raw.interfaces[0].implemented_by, '/adm/daemons/combatd');
        assert.equal(metric(raw, 0, 'direct'), 1); assert.ok(metric(raw, 1, 'qi_cost') > 0); return;
    }
    assert.equal(raw.attacks.length, 0);
    const b = raw.before[0], a = raw.immediate[0];
    if (condition.method === 'practice' || p.ability === 'practice_skill') {
        const completed = condition.method === 'practice' ? p.completed : Number(p.expected === 'observed');
        assert.equal(a.qi, b.qi - completed * 80); assert.equal(a.neili, b.neili - completed * 120);
        assert.deepEqual(a.skills, b.skills); assert.deepEqual(a.mappings, b.mappings);
        for (const k of ['eff_qi', 'jing', 'eff_jing', 'max_neili', 'jingli']) assert.equal(a[k], b[k]);
        assert.deepEqual(raw.before[1], raw.immediate[1]); assert.equal(calls.length, 0);
        if (condition.method === 'practice') {
            assert.equal(raw.interfaces.length, 0);
            assert.equal((a.learned[skill] ?? 0) - (b.learned[skill] ?? 0), completed * practiceGain(p.level, b.skills.dodge, b.int));
            assert.equal(raw.command_accepted, Number(completed > 0 && completed === p.repetitions));
        } else {
            assert.equal(raw.interfaces.length, 1); assert.equal(raw.interfaces[0].result ?? 0, completed);
            assert.deepEqual(a.learned, b.learned);
        }
        if (!completed) assert.ok(raw.reason); return;
    }
    assert.deepEqual(raw.before, raw.immediate);
    assert.equal(raw.interfaces.length, 1); const i = raw.interfaces[0];
    assert.equal(i.object, p.interface.object); assert.equal(i.function, p.interface.function);
    assert.ok(Object.hasOwn(i, 'result')); assert.ok(Object.hasOwn(i, 'implemented_by'));
    assert.equal(i.implemented_by || null, p.ability === 'query_effect_dodge' ? null : object);
    assert.equal(calls.length, p.ability === 'valid_damage' ? 1 : 0);
    if (p.ability === 'valid_damage') assert.deepEqual(i.result, calls[0].result);
    else if (p.ability === 'valid_enable') assert.equal(i.result ?? 0, Number(['dodge', 'move'].includes(p.interface.usage)));
    else if (p.ability === 'valid_learn') assert.equal(i.result, 1);
    else if (p.ability === 'query_effect_dodge') assert.ok(zero(i.result));
    else if (p.ability === 'query_action') assert.ok(i.result.action.includes('身行'));
    else assert.equal(typeof i.result, 'string');
}

export function shexingEffects(rows) {
    const calls = rows.flatMap(r => shexingCalls(r.raw)), negated = calls.filter(shexingNegated);
    return { ...emeiDefenseEffects(rows), defense_calls: calls.length, negated: negated.length,
        negated_given_called: probability(negated.length, calls.length),
        incoming: distribution(calls.map(c => c.incoming)),
        negate_texts: [...new Set(negated.map(c => c.result.msg))] };
}
