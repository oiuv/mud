// Qualification, practice and research are separate from the existing defense group.
import assert from 'node:assert/strict';
import { distribution } from './statistics.mjs';

export const gumuMovementProfiles = [
    { skill: 'yunv-shenfa', qiFloor: 50, neiliFloor: 0, qiCost: 40, neiliCost: 0 },
    { skill: 'qixing-bu', qiFloor: 40, neiliFloor: 30, qiCost: 35, neiliCost: 24 },
];
export const gumuMovementFixtureRequirements = [
    'Register a new movement-learning group after the frozen batch; do not reuse prior defense or teacher samples.',
    'Record raw/effective skills and intelligence, env/no_learn, room bonuses and resource counters; retain explicit null idle and partial completion despite command return zero.',
    'Dispatch valid_enable with its string argument and valid_research with the real player; record implementation ownership for all queried interfaces.',
];
const fields = ['special_skill/wuxing', 'env/no_learn', 'family/family_name'];
const profile = skill => { const p = gumuMovementProfiles.find(p => p.skill === skill); assert.ok(p, skill); return p; };
const idle = value => value === null ? 0 : value;

export function gumuMovementGain(p, research = false) {
    const s = p.actor.skills, q = p.actor.properties, level = s[p.skill], basic = s.dodge;
    let value;
    if (research) {
        // The target is a named special skill, so query_scale uses default's first coefficient 80.
        // The other special dodge does not valid_enable this skill's name and is not a related force.
        value = Math.trunc(Math.trunc(Math.trunc(basic * 80 / (level >= 500 ? 2 : 1)) / 15) / 100);
        value += Math.trunc(level / 50) + Math.trunc((q.int / (level >= 500 ? 6 : 12)) ** 2);
    } else value = Math.trunc((level >= 500 ? basic : level >= 300 ? basic * 3 : basic * 6 + 30) / Math.sqrt(q.int) / 6);
    if (q['special_skill/wuxing']) value += Math.trunc(value * 20 / 100);
    value += Math.trunc(value * (p.room[research ? 'research_improve' : 'practice_improve'] ?? 0) / 100);
    if (research) value = Math.max(0, value - 1);
    value += Math.trunc(value * (s['martial-cognize'] ?? 0) / 500);
    return 1 + Math.trunc(value * 100 / (level + 100));
}

export function gumuMovementConditions(catalog, { smoke = false, samples = 100 } = {}) {
    assert.ok(Number.isSafeInteger(samples) && samples > 0);
    const rows = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source);
        const d = profile(skill), practice = ability === 'practice', research = ability === 'research';
        const actor = { skills: { dodge: level + 1, [skill]: level, ...extra.skills },
            mappings: extra.unmapped ? {} : { dodge: skill },
            properties: { qi: 10000, eff_qi: 10000, neili: 6000, max_neili: 6000, jing: 10000, eff_jing: 10000,
                int: 36, con: 36, jiali: 0, gender: '女性', combat_exp: 100000000,
                potential: 10000, learned_points: 0, 'family/family_name': '古墓派', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}),
            ...(extra.armed ? { equipment: { type: 'sword', hold: false } } : {}) };
        const times = extra.times ?? 1, expected = extra.expected ?? 'observed';
        const completed = practice || research ? extra.completed ?? (expected === 'refused' ? 0 : times) : 0;
        const iface = !practice && !research;
        rows.push({ id: `school-gumu-movement-${skill}-${ability}-l${level}${extra.suffix ? '-' + extra.suffix : ''}`,
            stage: 'school', entry_id: source.path, method: iface ? 'interface' : ability,
            samples: research && completed ? (smoke ? 2 : samples) : (smoke ? 1 : 2),
            parameters: { school: 'gumu', family: '古墓派', collection_group: 'gumu-movement', skill, usage: 'dodge',
                ability, level, actor, target: { skills: {}, mappings: {}, properties: {} },
                action: practice ? `practice dodge ${times}` : research ? `research ${skill} ${times}` : 'test_interface',
                ...(iface ? { interface: { object: '/kungfu/skill/' + skill, function: ability,
                    ...(ability === 'valid_enable' ? { argument: extra.argument } : {}) } } : {}),
                room: extra.room ?? {}, repetitions: times, completed,
                command_return: extra.commandReturn ?? Number(practice ? completed === times : research ? expected === 'observed' : true),
                clear_jing: extra.clearJing ?? false, observation: 'single_action_immediate', observe_seconds: 0,
                fighting: extra.fighting ?? false, expected, not_applicable: '',
                qualification_sources: [...new Set(['yunv-shenfa', 'qixing-bu', 'dodge', 'literate', 'martial-cognize'].map(k => `kungfu/skill/${k}.c`)
                    .concat(['inherit/skill/skill.c', 'cmds/skill/practice.c', 'cmds/skill/research.c', 'cmds/skill/learn.c',
                        'feature/skill.c', 'feature/damage.c', 'kungfu/class/gumu/lin.c', 'kungfu/class/gumu/yang.c']))],
                qualification_note: '原技能资格/直接练习与公共practice/research分开；基本轻功默认比特殊高一级，不预置内功，零初始熟练度。角色状态为实验配置，不证明师承可得；原资源门槛/实际费用、部分练习、原先天悟性公式保持不改。move仅查声明，不创建本库不存在的move技能；防御和实战另组。',
                costs: { qi: d.qiCost, neili: d.neiliCost },
            } });
    }
    for (const d of gumuMovementProfiles) {
        const skill = d.skill;
        for (const level of [200, 400, 800]) for (const ability of ['valid_learn', 'valid_research', 'type', 'valid_learn_level', 'practice_skill', 'practice', 'research']) add(skill, ability, level);
        for (const argument of ['dodge', 'move', 'parry']) add(skill, 'valid_enable', 200, { suffix: argument, argument });
        add(skill, 'valid_learn', 200, { suffix: 'no-resources', properties: { qi: 1, neili: 0, max_neili: 0, int: 1, combat_exp: 0 }, skills: { dodge: 0 } });
        for (const ability of ['practice_skill', 'practice']) {
            add(skill, ability, 200, { suffix: 'low-qi', properties: { qi: d.qiFloor - 1 }, expected: 'refused' });
            add(skill, ability, 200, { suffix: 'minimum-qi', properties: { qi: d.qiFloor } });
            add(skill, ability, 200, { suffix: 'neili0', properties: { neili: 0 }, expected: d.neiliFloor ? 'refused' : 'observed' });
            if (d.neiliFloor) for (const neili of [29, 30]) add(skill, ability, 200, { suffix: 'neili' + neili, properties: { neili }, expected: neili < 30 ? 'refused' : 'observed' });
        }
        for (const ability of ['practice', 'research']) {
            add(skill, ability, 200, { suffix: 'armed', armed: true });
            for (const [suffix, extra] of [['busy', { busy: true }], ['fighting', { fighting: true }],
                ['no-fight', { room: { no_fight: 1 } }], ['no-learn', { properties: { 'env/no_learn': skill } }],
                ['low-exp', { properties: { combat_exp: 799999 }, ...(ability === 'research' ? { commandReturn: 1 } : {}) }]])
                add(skill, ability, 200, { suffix, expected: 'refused', ...extra });
            for (const int of [9, 16, 64]) add(skill, ability, 200, { suffix: 'int' + int, properties: { int } });
            add(skill, ability, 200, { suffix: 'effective-int', skills: { literate: 500 } });
            add(skill, ability, 200, { suffix: 'wuxing', properties: { 'special_skill/wuxing': 1 } });
            add(skill, ability, 200, { suffix: 'cognize500', skills: { 'martial-cognize': 500 } });
            add(skill, ability, 200, { suffix: 'room50', room: { [ability + '_improve']: 50 } });
            add(skill, ability, 200, { suffix: 'all-bonuses', room: { [ability + '_improve']: 50 }, skills: { 'martial-cognize': 500 }, properties: { 'special_skill/wuxing': 1 } });
            add(skill, ability, 200, { suffix: 'unmapped', unmapped: true, expected: ability === 'practice' ? 'refused' : 'observed' });
        }
        for (const level of [299, 300, 499, 500]) add(skill, 'practice', level);
        add(skill, 'practice', 200, { suffix: 'basic-equal', skills: { dodge: 200 }, expected: 'refused' });
        add(skill, 'practice', 200, { suffix: 'basic0', skills: { dodge: 0 }, expected: 'refused' });
        add(skill, 'practice', 200, { suffix: 'times50', times: 50 });
        add(skill, 'practice', 200, { suffix: 'partial-qi', times: 3, completed: 2, properties: { qi: d.qiFloor + d.qiCost } });
        if (d.neiliFloor) add(skill, 'practice', 200, { suffix: 'partial-neili', times: 3, completed: 2, properties: { neili: d.neiliFloor + d.neiliCost } });
        for (const level of [179, 180, 499, 500]) add(skill, 'research', level, level < 180 ? { expected: 'refused' } : {});
        add(skill, 'research', 200, { suffix: 'potential0', properties: { potential: 0 }, expected: 'refused' });
        add(skill, 'research', 200, { suffix: 'jing26', properties: { jing: 26 }, expected: 'refused', commandReturn: 1, clearJing: true });
        add(skill, 'research', 200, { suffix: 'eff-jing26', properties: { jing: 26, eff_jing: 26 }, expected: 'refused' });
        add(skill, 'research', 200, { suffix: 'partial', times: 3, completed: 2, properties: { jing: 60 }, clearJing: true });
        add(skill, 'research', 200, { suffix: 'times100', times: 100 });
        add(skill, 'research', 200, { suffix: 'other-dodge', skills: { [gumuMovementProfiles.find(p => p.skill !== skill).skill]: 800 } });
        add(skill, 'research', 200, { suffix: 'no-basic', skills: { dodge: 0 } });
        add(skill, 'research', 200, { suffix: 'low-body-resources', properties: { qi: 1, neili: 0, max_neili: 0 } });
    }
    return rows;
}

export function gumuMovementInterface(p) {
    if (p.ability === 'type') return 'martial';
    if (p.ability === 'valid_learn_level') return 200;
    if (p.ability === 'valid_enable') return Number(['dodge', 'move'].includes(p.interface.argument));
    if (p.ability === 'practice_skill') return Number(p.expected === 'observed');
    assert.ok(['valid_learn', 'valid_research'].includes(p.ability)); return 1;
}

export function validateGumuMovementRecord(raw, c) {
    const p = c.parameters, d = profile(p.skill);
    assert.equal(p.collection_group, 'gumu-movement'); assert.equal(raw.outcome, p.expected);
    assert.ok(raw.movement_room && typeof raw.movement_room === 'object');
    for (const k of ['no_fight', 'practice_improve', 'research_improve']) {
        assert.ok(Object.hasOwn(raw.movement_room, k), '实际房间条件缺项：' + k);
        assert.equal(raw.movement_room[k] ?? 0, p.room[k] ?? 0, k);
    }
    for (const k of ['before', 'immediate', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['interfaces', 'launches', 'attacks']) assert.ok(Array.isArray(raw[k]));
    assert.equal(raw.launches.length, 0); assert.equal(raw.attacks.length, 0);
    for (const m of raw.metrics) {
        assert.ok(m && typeof m === 'object' && !Array.isArray(m));
        for (const value of Object.values(m)) assert.ok(Number.isSafeInteger(value) && value >= 0, '未知计量不得当零');
    }
    for (const side of [0, 1]) for (const phase of ['before', 'immediate']) {
        const state = raw[phase][side];
        assert.equal(state.userp, 1); assert.equal(state.playerp, 1);
        assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.ok(Object.hasOwn(state, 'busy'), '显式 null 空闲和快照缺项不可混同');
        assert.ok(state.cultivation && state.skills && state.learned && state.mappings);
        assert.equal(typeof state.learned, 'object');
        assert.ok(!Array.isArray(state.learned), '熟练度必须为原映射');
        for (const value of Object.values(state.learned))
            assert.ok(Number.isSafeInteger(value) && value >= 0, '熟练度未知值不能当零');
    }
    const b = raw.before[0], a = raw.immediate[0];
    assert.equal(idle(b.busy), p.actor.busy ?? 0); assert.equal(idle(a.busy), idle(b.busy));
    assert.deepEqual(b.learned, {});
    assert.equal(b.weapon, p.actor.equipment?.type ?? 'none'); assert.equal(a.weapon, b.weapon);
    if (p.actor.equipment) {
        for (const state of [b, a]) {
            assert.equal(state.weapon_details?.program, '/tests/sword');
            assert.equal(state.weapon_details.skill_type, 'sword');
            assert.equal(state.weapon_details.weight, 3000);
            assert.equal(state.weapon_details.damage, 50);
        }
        assert.deepEqual(a.weapon_details, b.weapon_details, '练习和研究保持原测试剑');
    }
    for (const [k, v] of Object.entries(p.actor.properties)) assert.equal(fields.includes(k) ? b.cultivation[k] : b[k], v, k);
    for (const k of fields) { assert.ok(Object.hasOwn(b.cultivation, k)); assert.equal(b.cultivation[k] ?? 0, p.actor.properties[k] ?? 0); }
    assert.deepEqual(a.cultivation, b.cultivation); assert.deepEqual(b.skills, p.actor.skills); assert.deepEqual(a.skills, b.skills);
    assert.deepEqual(b.mappings, p.actor.mappings); assert.deepEqual(a.mappings, b.mappings);
    assert.ok(b.temp?.apply && typeof b.temp.apply === 'object' && !Array.isArray(b.temp.apply));
    for (const value of Object.values(b.temp.apply))
        assert.ok(Number.isSafeInteger(value), '装备加成未知值不能当零');
    assert.deepEqual(a.temp?.apply, b.temp.apply, '练习和研究不得改变装备加成');
    const effective = Object.fromEntries(Object.entries(p.actor.skills).map(([k, value]) => {
        // The frozen sword weighs 3000: original EQUIP::setup applies dodge -1.
        // query_skill includes this modifier even when merely practising/researching.
        const applied = b.temp.apply[k] ?? 0;
        assert.equal(applied, k === 'dodge' && p.actor.equipment ? -1 : 0, k + ' 实际装备加成');
        return [k, Math.trunc(value / 2) + (p.actor.skills[p.actor.mappings[k]] ?? 0) + applied];
    }));
    assert.deepEqual(b.effective_skills, effective, '有效等级来自原 query_skill，不用原始等级冒充');
    assert.deepEqual(a.effective_skills, b.effective_skills);
    assert.equal(b.effective_int, b.int + Math.trunc((p.actor.skills.literate ?? 0) / 10));
    assert.equal(a.effective_int, b.effective_int, '先天悟性与有效悟性分别观察');
    assert.deepEqual(raw.immediate[1], raw.before[1]);
    for (const k of ['max_neili', 'eff_qi', 'eff_jing', 'potential', 'int', 'con']) assert.equal(a[k], b[k]);
    const direct = c.method === 'interface' && p.ability === 'practice_skill';
    const completed = direct ? Number(p.expected === 'observed') : c.method === 'practice' ? p.completed : 0;
    assert.equal(b.qi - a.qi, completed * d.qiCost); assert.equal(b.neili - a.neili, completed * d.neiliCost);
    if (c.method === 'interface') {
        assert.equal(raw.interfaces.length, 1); const i = raw.interfaces[0];
        for (const [k, v] of Object.entries(p.interface)) assert.equal(i[k], v);
        assert.ok(Object.hasOwn(i, 'result')); assert.ok(Object.hasOwn(i, 'implemented_by'));
        assert.equal(i.result, gumuMovementInterface(p));
        assert.equal(i.implemented_by, ['type', 'valid_learn_level', 'valid_research'].includes(p.ability)
            ? '/inherit/skill/skill' : '/kungfu/skill/' + p.skill);
    } else { assert.equal(raw.interfaces.length, 0); assert.equal(raw.command_accepted, p.command_return); }
    const gain = (a.learned[p.skill] ?? 0) - (b.learned[p.skill] ?? 0);
    if (c.method === 'practice') assert.equal(gain, p.completed * gumuMovementGain(p));
    else if (c.method === 'research' && p.completed) assert.ok(gain >= p.completed && gain <= p.completed * gumuMovementGain(p, true));
    else assert.equal(gain, 0);
    for (const k of new Set([...Object.keys(b.learned), ...Object.keys(a.learned)]))
        if (k !== p.skill) assert.equal(a.learned[k] ?? 0, b.learned[k] ?? 0);
    assert.equal(a.learned_points - b.learned_points, c.method === 'research' ? p.completed : 0);
    assert.equal(a.jing, c.method === 'research' ? p.clear_jing ? 0 : b.jing - p.completed * Math.trunc(1000 / b.int) : b.jing);
    for (const k of ['qi', 'neili', 'jing', 'eff_qi', 'eff_jing']) {
        assert.ok(Number.isFinite(b[k]) && Number.isFinite(a[k]), '资源快照缺项：' + k);
        // This group has no recovery; set("jing", 0) on exhausted research is
        // actual spending too, including the unusable final remainder.
        assert.equal(raw.metrics[0][k + '_cost'] ?? 0, b[k] - a[k], k + ' 原资源计量');
        assert.equal(raw.metrics[0][k + '_recovery'] ?? 0, 0);
    }
    assert.equal(raw.metrics[0].heartbeats ?? 0, 0);
    assert.ok(Object.values(raw.metrics[1]).every(value => value === 0), '旁观者不得产生计量');
    if (p.expected === 'refused') assert.ok(raw.reason);
}

export function gumuMovementEffects(rows, condition) {
    const p = condition?.parameters;
    const delta = (r, key) => Number.isFinite(r.before?.[0]?.[key]) && Number.isFinite(r.immediate?.[0]?.[key])
        ? r.immediate[0][key] - r.before[0][key] : null;
    const gain = r => {
        const b = r.before?.[0]?.learned, a = r.immediate?.[0]?.learned;
        return p?.skill && b && a ? (a[p.skill] ?? 0) - (b[p.skill] ?? 0) : null;
    };
    const count = r => {
        const m = r.metrics?.[0];
        if (r.method === 'research') return delta(r, 'learned_points');
        if (r.method !== 'practice' || !p?.costs?.qi || !m || typeof m !== 'object' || Array.isArray(m)) return null;
        const qi = Object.hasOwn(m, 'qi_cost') ? m.qi_cost : 0;
        return Number.isFinite(qi) ? qi / p.costs.qi : null;
    };
    const commands = rows.filter(r => ['practice', 'research'].includes(r.method));
    return {
        practice_samples: rows.filter(r => r.method === 'practice').length,
        research_samples: rows.filter(r => r.method === 'research').length,
        accepted: commands.filter(r => r.command_accepted === 1).length,
        progressed: commands.filter(r => gain(r) > 0).length,
        partial_practice: rows.filter(r => r.method === 'practice' && r.command_accepted === 0 && gain(r) > 0).length,
        completed_repetitions: distribution(commands.map(count)),
        learned_gain: distribution(rows.map(gain)),
        learned_points_delta: distribution(rows.map(r => delta(r, 'learned_points'))),
        qi_delta: distribution(rows.map(r => delta(r, 'qi'))),
        neili_delta: distribution(rows.map(r => delta(r, 'neili'))),
        jing_delta: distribution(rows.map(r => delta(r, 'jing'))),
    };
}
