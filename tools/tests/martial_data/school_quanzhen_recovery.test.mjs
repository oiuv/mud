import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from '../../collect_martial_data.mjs';
import { buildInventory } from './inventory.mjs';
import { collectCatalog } from './catalog.mjs';
import { schoolCombatConditions, validateSchoolCombatRecord } from './school_combat_cases.mjs';
import { quanzhenRecoveryConditions, recoveryExpected } from './school_quanzhen_recovery_cases.mjs';
import { schoolRecoveryEffects } from './school_combat_report.mjs';

const catalog = collectCatalog(root, buildInventory(root));
const cases = quanzhenRecoveryConditions(catalog);
const find = suffix => cases.find(c => c.id.endsWith(suffix));

test('153恢复条件2070样本，旧1278条件46068样本保留', () => {
    assert.equal(cases.length, 153); assert.equal(cases.reduce((n, c) => n + c.samples, 0), 2070);
    assert.equal(new Set(cases.map(c => c.id)).size, 153);
    assert.equal(quanzhenRecoveryConditions(catalog, { smoke: true }).reduce((n, c) => n + c.samples, 0), 153);
    assert.equal(cases.filter(c => c.parameters.expected === 'refused').reduce((n, c) => n + c.samples, 0), 90);
    const old = schoolCombatConditions(catalog).filter(c => ['huashan', 'quanzhen'].includes(c.parameters.school)
        && !['quanzhen-recovery', 'quanzhen-combination', 'huashan-combination', 'quanzhen-bout', 'huashan-bout', 'slice-combination', 'gumu-bout-perform', 'emei-bout-perform', 'shaolin-bout-perform', 'wudang-bout-perform', 'mingjiao-bout', 'taohua-bout', 'composite-synthesis', 'gumu-fireice-g6', 'b30-perform', 'public-exert'].includes(c.parameters.collection_group));
    assert.equal(old.length, 1278); assert.equal(old.reduce((n, c) => n + c.samples, 0), 46068);
    assert.ok(cases.filter(c => c.method === 'exercise').every(c => c.samples === 2));
});

function row(c) {
    const p = c.parameters;
    const before = [p.actor, p.target].map(config => ({ ...config.properties, skills: structuredClone(config.skills),
        mappings: structuredClone(config.mappings), learned: {}, weapon: 'none', temp: {}, busy: config.busy ?? 0 }));
    const raw = { before, immediate: structuredClone(before), outcome: p.expected, reason: '原拒绝',
        launches: [], attacks: [], interfaces: [], command_accepted: Number(p.expected === 'observed'), metrics: [{}, {}] };
    const e = recoveryExpected(p, before[0]);
    raw.immediate[0][e.key] += e.heal; raw.immediate[0].neili -= e.cost; raw.immediate[0].busy = e.busy;
    raw.metrics[0].neili_cost = e.cost;
    if (raw.command_accepted) raw.launches.push({ skill: 'force' });
    raw.after = structuredClone(raw.immediate);
    return raw;
}

test('恢复和再生分别保留整数费用、最低费用与部分恢复公式', () => {
    for (const [suffix, cost, heal] of [
        ['recover-l200', 1666, 5000], ['recover-l400', 833, 5000], ['recover-l800', 416, 5000],
        ['regenerate-l200', 1000, 5000], ['regenerate-l400', 500, 5000], ['regenerate-l800', 250, 5000],
        ['recover-l200-gap10', 20, 10], ['recover-l200-both', 816, 5000],
        ['recover-l200-partial', 100, 300], ['regenerate-l200-partial', 100, 500],
    ]) {
        const c = find(suffix), e = recoveryExpected(c.parameters, c.parameters.actor.properties);
        assert.equal(e.cost, cost); assert.equal(e.heal, heal);
    }
    for (const c of cases.filter(c => c.method === 'exert')) validateSchoolCombatRecord(row(c), c);
});

test('战斗恢复与自固的忙乱差异、证据费用篡改均检查', () => {
    for (const [suffix, busy] of [['recover-l200-fighting', 1], ['recover-l200-fighting-self', 0],
        ['regenerate-l200-fighting', 1], ['regenerate-l200-fighting-self', 1]]) {
        const c = find(suffix), r = row(c); assert.equal(r.after[0].busy, busy);
        r.after[0].neili++; assert.throws(() => validateSchoolCombatRecord(r, c));
    }
    const c = find('recover-l200'), r = row(c); r.launches[0].skill = 'xiantian-gong';
    assert.throws(() => validateSchoolCombatRecord(r, c));
});

test('打坐必须通过原心跳continue_action，观察者不直接调用exercising或修改心跳频率', () => {
    const actor = readFileSync(join(root, 'tools/tests/martial_data/actor.lpc'), 'utf8');
    const runner = readFileSync(join(root, 'tools/tests/martial_data/runner.lpc'), 'utf8');
    assert.equal((actor.match(/::continue_action\(\)/g) ?? []).length, 1);
    assert.match(actor, /observe_exercise\(this_object\(\), "before"\)/);
    assert.match(actor, /observe_exercise\(this_object\(\), "after"\)/);
    assert.doesNotMatch(actor + runner, /->(?:exercising|halt_exercise)\s*\(/);
    assert.match(runner, /players\[0\]->force_me\("halt"\)/);
    assert.match(runner, /original heartbeat action watchdog expired without completion/);
    for (const suffix of ['minimum10', 'allowed-room', 'below-cap', 'at-cap', 'above-cap', 'halt'])
        assert.equal(find('exercise-l200-' + suffix).parameters.expected, 'observed');
});

test('受理而无打坐终态不能通过；拒绝不冒充正常完成', () => {
    const c = find('exercise-l200'), r = row(find('recover-l200'));
    r.launches = []; r.immediate[0].temp = { pending: { exercise: 1 } }; r.immediate[0].busy = '<function>';
    assert.throws(() => validateSchoolCombatRecord(r, c));
    const refused = find('exercise-l200-cost9'), rr = row(refused);
    validateSchoolCombatRecord(rr, refused);
    rr.exercise_steps = [{}]; assert.throws(() => validateSchoolCombatRecord(rr, refused));
});

test('统计区分逐跳转换、宿主恢复及最终净值', () => {
    const r = row(find('recover-l200'));
    const e = schoolRecoveryEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(e.qi_net.mean, 5000); assert.equal(e.neili_net.mean, -1666);
    assert.equal(e.exercise_seconds.mean, null); assert.equal(e.exercise_converted.mean, null);
    r.exercise_steps = [{ phase: 'before', state: { qi: 100 } }, { phase: 'after', state: { qi: 70 } }];
    r.exercise_terminal = 'halted'; r.elapsed = 1.2;
    const timed = schoolRecoveryEffects([{ outcome: 'observed', raw: r }]);
    assert.equal(timed.exercise_converted.mean, 30); assert.equal(timed.qi_net.mean, 5000);
    assert.equal(timed.terminals.halted, 1);
});
