// Original exert and heartbeat-driven exercise; no recovery formula replaces gameplay.
import assert from 'node:assert/strict';
import { quanzhenForces, expectedForceCapacity } from './school_quanzhen_cultivation_cases.mjs';

export function quanzhenRecoveryConditions(catalog, options) {
    return forceRecoveryConditions(catalog, {
        school: 'quanzhen', family: '全真教', forces: quanzhenForces, capacity: expectedForceCapacity,
        sources: ['kungfu/class/quanzhen/wang.c', 'kungfu/class/quanzhen/qiu.c', 'kungfu/class/quanzhen/yin.c'],
    }, options);
}

// Shared condition matrix only; actual commands, callbacks and randomness stay in LPC.
export function forceRecoveryConditions(catalog, profile, { smoke = false, samples = 100 } = {}) {
    const result = [];
    function add(skill, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === skill); assert.ok(source);
        const exercise = ability === 'exercise';
        const actor = { skills: { force: level, [skill]: level },
            mappings: extra.unmapped ? {} : { force: skill },
            properties: { qi: exercise ? 10000 : 5000, eff_qi: 10000, max_qi: 10000,
                jing: exercise ? 10000 : 5000, eff_jing: 10000, max_jing: 10000,
                neili: 6000, max_neili: 6000, int: 36, con: 36, jiali: 0,
                combat_exp: 100000000, 'family/family_name': profile.family,
                character: '光明磊落', gender: '男性', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}) };
        if (extra.capacity) {
            actor.properties.max_neili = profile.capacity(actor, true) + extra.capacity;
            actor.properties.neili = 2 * actor.properties.max_neili - 10;
        }
        if (extra.capacity === 0) {
            actor.properties.max_neili = profile.capacity(actor, true);
            actor.properties.neili = 2 * actor.properties.max_neili - 10;
        }
        result.push({ id: `school-${profile.school}-recovery-${skill}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: source.path, method: exercise ? 'exercise' : 'exert',
            samples: smoke ? 1 : extra.checks ?? (exercise ? 2 : samples),
            parameters: { school: profile.school, family: profile.family, collection_group: `${profile.school}-recovery`,
                combination: extra.suffix ?? 'base', skill, usage: 'force', ability, level, actor,
                target: { skills: {}, mappings: {}, properties: {} },
                action: exercise ? `exercise ${extra.cost ?? 100}` : `exert ${ability}`,
                room: extra.room ?? {}, exercise_cost: extra.cost ?? 100,
                halt_after: extra.halt ? 1 : 0,
                observation: exercise ? 'timed_effect' : 'single_action_immediate',
                fighting: extra.fighting ?? false, observe_seconds: exercise ? 30 : 0,
                not_applicable: '', expected: extra.expected ?? 'observed',
                qualification_sources: [source.path, 'kungfu/skill/force.c', 'inherit/skill/force.c',
                    'inherit/skill/skill.c', 'kungfu/skill/force/recover.c', 'kungfu/skill/force/regenerate.c',
                    'cmds/skill/exercise.c', 'cmds/skill/exert.c', 'cmds/std/halt.c',
                    'feature/action.c', 'mudcore/inherit/action.c', 'feature/damage.c',
                    'feature/skill.c', 'inherit/char/char.c', 'clone/user/user.c',
                    ...profile.sources],
                qualification_note: '真实USER原exert与exercise，原心跳/忙乱回调不加速。即时恢复每分布100次；确定转换终态与边界各2次，不据此估计随机每跳效率。原始/有效内功分开；资格为实验配置，不证明拜师或自然养成。打坐允许宿主原heal_up，逐跳转换与最终净值分列。',
            } });
    }
    for (const skill of profile.forces) {
        for (const level of [200, 400, 800])
            for (const ability of ['recover', 'regenerate', 'exercise']) add(skill, ability, level);
        for (const ability of ['recover', 'regenerate']) {
            const resource = ability === 'recover' ? 'qi' : 'jing';
            for (const [suffix, extra] of [
                ['gap9', { properties: { [resource]: 9991 }, expected: 'refused' }],
                ['gap10', { properties: { [resource]: 9990 } }],
                ['neili19', { properties: { neili: 19 }, expected: 'refused' }],
                ['neili20', { properties: { neili: 20 } }],
                ['partial', { properties: { neili: 100 } }],
                ['breakup', { properties: { breakup: 1 } }],
                ['self', { properties: { 'special_skill/self': 1 } }],
                ['both', { properties: { breakup: 1, 'special_skill/self': 1 } }],
                ['fighting', { fighting: true }],
                ['fighting-self', { fighting: true, properties: { 'special_skill/self': 1 } }],
                ['busy', { busy: true, expected: 'refused' }],
                ['unmapped', { unmapped: true, expected: 'refused' }],
            ]) add(skill, ability, 200, { suffix: '-' + suffix, checks: 2, ...extra });
        }
        for (const [suffix, extra] of [
            ['minimum10', { cost: 10 }], ['cost9', { cost: 9, expected: 'refused' }],
            ['qi9', { cost: 10, properties: { qi: 9 }, expected: 'refused' }],
            ['jing6999', { properties: { jing: 6999 }, expected: 'refused' }],
            ['jing7000', { cost: 10, properties: { jing: 7000 } }],
            ['busy', { busy: true, expected: 'refused' }],
            ['fighting', { fighting: true, expected: 'refused' }],
            ['unmapped', { unmapped: true, expected: 'refused' }],
            ['no-fight', { room: { no_fight: 1 }, expected: 'refused' }],
            ['allowed-room', { cost: 10, room: { no_fight: 1, can_dazuo: 1 } }],
            ['below-cap', { cost: 10, capacity: -1 }],
            ['at-cap', { cost: 10, capacity: 0 }],
            ['above-cap', { cost: 10, capacity: 1 }],
            ['below-threshold', { cost: 10, properties: { max_neili: 1000, neili: 1989 } }],
            ['at-threshold', { cost: 10, properties: { max_neili: 1000, neili: 1990 } }],
            ['room-bonus', { room: { exercise_improve: 100 }, cost: 100 }],
            ['halt', { cost: 1000, halt: true }],
            ['halt-overcharge', { cost: 1000, halt: true, properties: { neili: 12001 } }],
        ]) add(skill, 'exercise', 200, { suffix: '-' + suffix, ...extra });
    }
    return result;
}

export function recoveryExpected(p, before) {
    const props = p.actor.properties;
    const force = Math.trunc(p.actor.skills.force / 2) + p.actor.skills[p.skill];
    const key = p.ability === 'recover' ? 'qi' : 'jing';
    let heal = before['eff_' + key] - before[key], cost;
    if (p.expected === 'refused') return { key, cost: 0, heal: 0, busy: p.actor.busy ?? 0 };
    if (p.ability === 'recover') {
        cost = Math.trunc(100 * heal / force);
        if (props.breakup) cost = Math.trunc(cost * 7 / 10);
        cost = Math.max(20, cost);
        if (props['special_skill/self']) cost = Math.trunc(cost * 7 / 10);
        if (before.neili < cost) { heal = Math.trunc(heal * before.neili / cost); cost = before.neili; }
    } else {
        cost = Math.trunc(heal * 60 / force);
        if (props.breakup) cost = Math.trunc(cost * 7 / 10);
        cost = Math.max(20, cost);
        if (cost > before.neili) { cost = before.neili; heal = Math.trunc(cost * force / 60); }
        cost = Math.max(20, cost);
    }
    return { key, cost, heal, busy: p.fighting && !(p.ability === 'recover' && props['special_skill/self']) ? 1 : 0 };
}

export function validateQuanzhenRecoveryRecord(raw, condition) {
    const p = condition.parameters, before = raw.before[0], immediate = raw.immediate[0], after = raw.after[0];
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.equal(raw.attacks.length, 0); assert.deepEqual(raw.before[1], raw.after[1]);
    assert.deepEqual(after.skills, before.skills);
    assert.equal(after.potential, before.potential); assert.equal(after.learned_points, before.learned_points);
    assert.equal(after.weapon, 'none');
    if (condition.method === 'exert') {
        const e = recoveryExpected(p, before);
        assert.equal(immediate[e.key] - before[e.key], e.heal, '原恢复量');
        assert.equal(before.neili - immediate.neili, e.cost, '原内力费用');
        assert.equal(raw.metrics[0].neili_cost ?? 0, e.cost);
        assert.equal(immediate.busy ?? 0, e.busy);
        for (const k of ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'max_neili'])
            if (k !== e.key) assert.equal(immediate[k], before[k], k);
        assert.equal(raw.launches.length, p.expected === 'observed' ? 1 : 0);
        if (raw.launches.length) assert.equal(raw.launches[0].skill, 'force', '原公共恢复回退');
        assert.deepEqual(after, immediate); return;
    }
    assert.equal(raw.launches.length, 0);
    if (p.expected === 'refused') {
        assert.equal((raw.exercise_steps ?? []).length, 0);
        for (const k of ['qi', 'neili', 'max_neili', 'jing']) assert.equal(after[k], before[k]);
        return;
    }
    assert.equal(immediate.temp.pending.exercise, 1); assert.equal(immediate.busy, '<function>');
    assert.ok(raw.exercise_steps?.length > 0, '须有真实心跳执行，不以受理代替完成');
    const pairs = raw.exercise_steps;
    assert.equal(pairs.length % 2, 0);
    let converted = 0;
    for (let i = 0; i < pairs.length; i += 2) {
        const a = pairs[i], b = pairs[i + 1];
        assert.equal(a.phase, 'before'); assert.equal(b.phase, 'after');
        assert.ok(a.elapsed >= 0 && b.elapsed >= a.elapsed);
        const x = a.state, y = b.state, gain = x.qi - y.qi;
        const base = Math.trunc(x.effective_skills.force / 5), bonus = p.room.exercise_improve ?? 0;
        assert.ok(gain >= Math.min(x.temp.exercise_cost, x.qi, 1 + Math.trunc(base / 2) + bonus));
        assert.ok(gain <= Math.min(x.temp.exercise_cost, x.qi, Math.trunc(base / 2) + base + bonus));
        converted += gain;
        if (y.temp.pending?.exercise) {
            assert.equal(y.neili - x.neili, gain); assert.equal(y.max_neili, x.max_neili);
        } else {
            const reached = x.neili + gain >= x.max_neili * 2;
            const increase = reached && x.max_neili < a.limit;
            assert.equal(y.max_neili, x.max_neili + Number(increase));
            assert.equal(y.neili, reached ? y.max_neili : x.neili + gain);
        }
        assert.equal(y.temp.exercise_cost ?? 0, Math.max(0, x.temp.exercise_cost - gain));
    }
    assert.equal(after.temp.pending?.exercise ?? 0, 0); assert.equal(after.busy ?? 0, 0);
    if (p.halt_after) {
        assert.equal(raw.exercise_terminal, 'halted'); assert.equal(raw.halt_accepted, 1);
        assert.equal(pairs.length, 2); assert.ok(converted < p.exercise_cost);
        assert.equal(after.max_neili, before.max_neili);
        assert.ok(after.neili <= after.max_neili * 2);
    } else {
        assert.equal(raw.exercise_terminal, 'completed');
        assert.equal(converted, p.exercise_cost); assert.equal(after.temp.exercise_cost ?? 0, 0);
    }
}
