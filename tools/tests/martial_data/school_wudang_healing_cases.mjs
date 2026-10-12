// Original-heartbeat heal/inspire observations, preserving the game's completion markers.
import assert from 'node:assert/strict';
import { wudangForces } from './school_wudang_cultivation_cases.mjs';

export function wudangHealingConditions(catalog, options) {
    return healingConditions(catalog, options);
}

export function healingConditions(catalog, { smoke = false } = {}, profile = {}) {
    const school = profile.school ?? 'wudang', family = profile.family ?? '武当派';
    const result = [];
    function add(force, ability, level = 200, extra = {}) {
        const source = catalog.skills.find(s => s.id === `force/${ability}`);
        const entry = source?.entries.find(e => e.role === 'exert')?.id;
        assert.ok(entry, '缺少公共疗伤入口：' + ability);
        const key = ability === 'heal' ? 'qi' : 'jing';
        const actor = {
            skills: { force: level, [force]: level, ...profile.skills, ...extra.skills },
            mappings: extra.unmapped ? {} : { force }, preparations: {},
            properties: { qi: 10000, eff_qi: 10000, max_qi: 10000,
                jing: 10000, eff_jing: 10000, max_jing: 10000,
                [key]: 9700, ['eff_' + key]: 9700,
                neili: 6000, max_neili: 6000, str: 36, int: 36, con: 36, dex: 36,
                combat_exp: 100000000, jiali: 0, breakup: ability === 'inspire' ? 1 : 0,
                'special_skill/divine': 0, 'family/family_name': family,
                character: '光明磊落', ...extra.properties },
            ...(extra.busy ? { busy: 2 } : {}), ...(extra.temp ? { temp: extra.temp } : {}),
        };
        result.push({ id: `school-${school}-healing-${force}-${ability}-l${level}${extra.suffix ?? ''}`,
            stage: 'school', entry_id: entry, method: 'healing', samples: smoke ? 1 : 2,
            parameters: { school, family, collection_group: `${school}-healing`,
                combination: extra.suffix ?? 'base', skill: force, usage: 'force', ability, level,
                actor, target: { skills: {}, mappings: {}, preparations: {}, properties: {} },
                named_participants: true, action: `exert ${ability}${extra.other ? ' right' : ''}`,
                fighting: extra.fighting ?? false, observation: 'timed_effect', observe_seconds: 90,
                halt_after: extra.halt ? 1 : 0, expected_end: extra.end ?? 'completed',
                expected: extra.expected ?? 'observed', not_applicable: '',
                qualification_sources: [source.path, `kungfu/skill/${force}.c`,
                    'kungfu/skill/force.c', 'cmds/skill/exert.c', 'cmds/std/halt.c',
                    'inherit/skill/skill.c', 'feature/skill.c', 'feature/action.c',
                    'mudcore/inherit/action.c', 'feature/damage.c', 'inherit/char/char.c',
                    'clone/user/user.c', ...(profile.sources ?? ['kungfu/class/wudang/zhang.c'])],
                qualification_note: '真实非巫师USER经原exert与原心跳continue_action；不直接调用healing/inspiring、不加速。等级、转世和天佑为实验赋值，不证明养成可达。确定性单跳治疗量、自然完成、内力耗尽及原halt各2次，不据此推断时长分布；宿主自然恢复与技能单跳分账。观察原busy结束，不要求错误pending字段清零；MA-080残留原样登记。90秒只作故障看门狗，不是技能持续时间。',
            } });
    }
    for (const force of profile.forces ?? wudangForces) {
        for (const level of [200, 400, 800])
            for (const ability of ['heal', 'inspire']) add(force, ability, level);
        for (const [suffix, properties] of [
            ['divine', { 'special_skill/divine': 1 }], ['breakup', { breakup: 1 }],
            ['both', { breakup: 1, 'special_skill/divine': 1 }],
        ]) add(force, 'heal', 200, { suffix: '-' + suffix, properties });
        for (const [suffix, extra] of [
            ['skill20', { skills: { [force]: 20 }, properties: { qi: 9950, eff_qi: 9950 } }],
            ['fifth', { properties: { qi: 2000, eff_qi: 2000, neili: 50 }, end: 'depleted' }],
            ['divine-severe', { properties: { qi: 1999, eff_qi: 1999, neili: 50, 'special_skill/divine': 1 }, end: 'depleted' }],
            ['neili50', { properties: { neili: 50 }, end: 'depleted' }],
            ['halt', { halt: true, end: 'halted' }],
            ['halt-low-neili', { halt: true, properties: { neili: 100 }, end: 'halted' }],
            ['other', { other: true }],
        ]) add(force, 'heal', 200, { suffix: '-' + suffix, ...extra });
        for (const [suffix, extra] of [
            ['fighting', { fighting: true }], ['busy', { busy: true }], ['unmapped', { unmapped: true }],
            ['tianmo', { temp: { tianmo: 1 } }], ['healthy', { properties: { qi: 10000, eff_qi: 10000 } }],
            ['skill19', { skills: { [force]: 19 } }], ['neili49', { properties: { neili: 49 } }],
            ['severe', { properties: { qi: 1999, eff_qi: 1999 } }],
        ]) add(force, 'heal', 200, { suffix: '-' + suffix, ...extra, expected: 'refused', end: 'refused' });
        for (const [suffix, extra] of [
            ['minimum', { properties: { jing: 9950, eff_jing: 9950, neili: 200 } }],
            ['fourth', { properties: { jing: 2500, eff_jing: 2500, neili: 200 }, end: 'depleted' }],
            ['neili299', { properties: { neili: 299 }, end: 'depleted' }],
            ['halt', { halt: true, end: 'halted' }], ['other', { other: true }],
            ['divine', { properties: { 'special_skill/divine': 1 } }],
        ]) add(force, 'inspire', 200, { suffix: '-' + suffix, ...extra });
        for (const [suffix, extra] of [
            ['not-reborn', { properties: { breakup: 0 } }], ['fighting', { fighting: true }],
            ['busy', { busy: true }], ['unmapped', { unmapped: true }],
            ['skill199', { skills: { [force]: 199 } }], ['healthy', { properties: { jing: 10000, eff_jing: 10000 } }],
            ['neili199', { properties: { neili: 199 } }], ['severe', { properties: { jing: 2499, eff_jing: 2499 } }],
        ]) add(force, 'inspire', 200, { suffix: '-' + suffix, ...extra, expected: 'refused', end: 'refused' });
    }
    if (profile.note) for (const c of result) c.parameters.qualification_note = profile.note;
    return result;
}

const resourceKeys = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const value = x => x ?? 0;
const pending = (state, key) => value(state.temp?.pending?.[key]);
function sameResources(a, b, except = []) {
    for (const key of resourceKeys.filter(k => !except.includes(k))) assert.equal(b[key], a[key], key);
}

// An oracle for comparing a captured original callback, never used to operate the player.
export function healingStepExpected(ability, state) {
    assert.ok(['heal', 'inspire'].includes(ability));
    const key = ability === 'heal' ? 'qi' : 'jing', eff = 'eff_' + key, max = 'max_' + key;
    const fee = ability === 'heal' ? 50 : 100;
    if (!state.mappings.force) return { stop: 'unmapped', key, gain: 0, cost: 0 };
    if (state[eff] >= state[max]) return { stop: 'completed', key, gain: 0, cost: 0 };
    if (state.neili < fee) return { stop: 'depleted', key, gain: 0, cost: 0 };
    const force = state.effective_skills.force;
    let gain = ability === 'heal' ? 10 + Math.trunc(force / 3) : 5 + Math.trunc(force / 6);
    if (ability === 'heal') {
        if (state.cultivation['special_skill/divine']) gain += state.effective_con * 2;
        if (state.cultivation.breakup) gain *= 3;
    }
    return { stop: '', key, gain: Math.min(state[max] - state[eff], gain), cost: fee };
}

export function validateWudangHealingRecord(raw, condition) {
    const p = condition.parameters, b = raw.before[0], first = raw.immediate[0], end = raw.after[0];
    const key = p.ability === 'heal' ? 'qi' : 'jing', eff = 'eff_' + key, max = 'max_' + key;
    const flag = p.ability === 'heal' ? 'healing' : 'inspiring';
    assert.equal(condition.method, 'healing'); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0);
    assert.deepEqual(raw.before[1], raw.after[1], '指定别人也不能把本能力的自疗写成他疗');
    assert.deepEqual(end.skills, b.skills); assert.deepEqual(end.mappings, b.mappings);
    assert.equal(end.weapon, 'none');
    for (const prop of resourceKeys) assert.equal(b[prop], p.actor.properties[prop]);
    for (const prop of ['breakup', 'special_skill/divine'])
        assert.equal(b.cultivation[prop], p.actor.properties[prop]);
    assert.deepEqual(b.mappings, p.actor.mappings);
    for (const [skill, level] of Object.entries(p.actor.skills)) assert.equal(b.skills[skill], level);
    const steps = raw.healing_steps ?? [];
    if (p.expected === 'refused') {
        assert.ok(raw.reason); assert.equal(raw.launches.length, 0); assert.equal(steps.length, 0);
        assert.equal(value(raw.metrics[0].neili_cost), 0); sameResources(b, first); sameResources(b, end);
        assert.equal(end.busy, b.busy); assert.equal(pending(end, flag), pending(b, flag));
        return;
    }
    assert.equal(raw.launches.length, 1); assert.equal(raw.launches[0].skill, 'force');
    assert.equal(pending(first, flag), 1); assert.equal(first.busy, '<function>'); sameResources(b, first);
    assert.ok(steps.length >= 2 && steps.length % 2 === 0, '受理不能代替原心跳疗伤');
    let cost = 0, gained = 0, terminal = '', previous = 0;
    for (let i = 0; i < steps.length; i += 2) {
        const x = steps[i], y = steps[i + 1];
        assert.equal(x.phase, 'before'); assert.equal(y.phase, 'after');
        assert.ok(x.elapsed >= previous && y.elapsed >= x.elapsed); previous = y.elapsed;
        assert.equal(x.state.busy, '<function>'); assert.equal(pending(x.state, flag), 1);
        const e = healingStepExpected(p.ability, x.state);
        assert.equal(y.state[eff] - x.state[eff], e.gain, '原单跳有效值');
        assert.equal(x.state.neili - y.state.neili, e.cost, '原单跳费用');
        sameResources(x.state, y.state, [eff, 'neili']);
        assert.equal(y.state.busy, e.stop ? 0 : '<function>');
        // Preserve MA-080: normal inspire completion and low-neili exit clear unrelated keys.
        const residual = !e.stop || (p.ability === 'inspire' && e.stop !== 'unmapped');
        assert.equal(pending(y.state, flag), Number(residual), '原结束标记不得在夹具修正');
        if (e.stop) {
            assert.equal(i + 2, steps.length, '结束后不得继续执行疗伤回调'); terminal = e.stop;
        }
        cost += e.cost; gained += e.gain;
    }
    if (p.halt_after) {
        assert.equal(steps.length, 2); assert.equal(terminal, '');
        assert.equal(raw.halt_accepted, 1); assert.equal(raw.healing_terminal, 'halted');
        const halt = raw.healing_halt;
        assert.ok(halt?.before && halt?.after, '中止费用须有原halt前后证据');
        assert.equal(halt.before.busy, '<function>'); assert.equal(halt.after.busy, 0);
        const fee = p.ability === 'heal' ? Math.min(halt.before.neili, 100) : 0;
        assert.equal(halt.before.neili - halt.after.neili, fee); sameResources(halt.before, halt.after, ['neili']);
        assert.equal(pending(halt.after, flag), 0); assert.deepEqual(end, halt.after);
        cost += fee; terminal = 'halted';
    } else {
        assert.equal(raw.healing_terminal, 'busy_ended');
        assert.equal(pending(end, flag), p.ability === 'inspire' && terminal !== 'unmapped' ? 1 : 0);
    }
    assert.equal(terminal, p.expected_end); assert.equal(value(end.busy), 0);
    assert.equal(value(raw.metrics[0].neili_cost), cost);
    assert.equal(end.neili - b.neili, value(raw.metrics[0].neili_recovery) - cost, '恢复不能伪装成少扣费');
    assert.ok(end[eff] - b[eff] >= gained, '总有效值变化须容纳观察到的原治疗量');
    if (terminal === 'completed') assert.equal(end[eff], end[max]);
}
