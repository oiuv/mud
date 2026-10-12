import test from 'node:test';
import assert from 'node:assert/strict';
import { publicForceEffects, healingEffects } from './school_public_force_report.mjs';

const state = () => ({ qi: 5000, eff_qi: 5000, max_qi: 10000, jing: 5000, eff_jing: 5000, max_jing: 10000,
    neili: 6000, busy: 0, mappings: { force: 'wudang-xinfa' }, temp: { apply: { armor: 100 } } });
function row() {
    const before = [state(), state()];
    return { outcome: 'observed', raw: { outcome: 'observed', before, after: structuredClone(before),
        metrics: [{}, {}], command_accepted: 1, launches: [{ skill: 'force' }], elapsed: 2.1 } };
}

test('公共统计区分命令受理、发动、实际资源与状态变化', () => {
    const none = row(), paid = row(), refused = row();
    paid.raw.after[0].neili -= 100; paid.raw.metrics[0].neili_cost = 100; paid.raw.after[0].busy = 1;
    refused.outcome = refused.raw.outcome = 'refused'; refused.raw.command_accepted = 0; refused.raw.launches = [];
    const r = publicForceEffects([none, paid, refused, { outcome: 'error' }]);
    assert.equal(r.attempts, 3); assert.equal(r.command_accepted, 2); assert.equal(r.launched, 2);
    assert.equal(r.accepted_without_measured_change, 1);
    assert.equal(r.sides[0].cost.neili.mean, 100 / 3); assert.equal(r.sides[0].net.neili.mean, -100 / 3);
});

test('lifeheal当前值与有效值、自损、apply加成都独立，不加总成伤害', () => {
    const x = row(); x.raw.after[1].qi += 110; x.raw.after[1].eff_qi += 160;
    x.raw.after[0].qi -= 100; x.raw.after[0].eff_qi -= 60;
    x.raw.after[0].temp.apply.force = 40; x.raw.after[0].temp.power = 1;
    const r = publicForceEffects([x]);
    assert.equal(r.sides[1].net.qi.mean, 110); assert.equal(r.sides[1].net.eff_qi.mean, 160);
    assert.equal(r.sides[0].net.qi.mean, -100); assert.equal(r.sides[0].net.eff_qi.mean, -60);
    assert.equal(r.apply_delta[0].force.mean, 40); assert.equal(r.flags_after.power, 1);
    assert.equal(r.accepted_without_measured_change, 0);
});

test('稀疏计数为零，缺少计数映射为未知；没有状态证据不能报无效果', () => {
    const x = row(), absent = row(); delete absent.raw.metrics; delete absent.raw.after;
    const r = publicForceEffects([x, absent]);
    assert.equal(r.sides[0].cost.neili.n, 1); assert.equal(r.sides[0].cost.neili.unknown, 1);
    assert.equal(r.sides[0].net.neili.unknown, 1); assert.equal(r.accepted_without_measured_change, 1);
});

function healingRow(ability = 'heal') {
    const x = row(), r = x.raw, flag = ability === 'heal' ? 'healing' : 'inspiring';
    const eff = ability === 'heal' ? 'eff_qi' : 'eff_jing';
    const b = structuredClone(r.before[0]); b.busy = '<function>'; b.temp.pending = { [flag]: 1 };
    const a = structuredClone(b); a[eff] += 110; a.neili -= 50;
    r.healing_steps = [{ phase: 'before', state: b }, { phase: 'after', state: a }];
    r.healing_halt = { before: structuredClone(a), after: structuredClone(a) };
    r.healing_halt.after.neili -= 100; r.healing_halt.after.busy = 0;
    r.healing_halt.after.temp.pending[flag] = 0;
    r.after[0] = structuredClone(r.healing_halt.after); r.metrics[0].neili_cost = 150;
    r.healing_terminal = 'halted'; return x;
}

test('疗伤统计保留原回调、halt、宿主恢复与净值的不同口径', () => {
    const x = healingRow(); x.raw.after[0].eff_qi += 2; x.raw.after[0].neili += 10;
    x.raw.metrics[0].neili_recovery = 10;
    const r = healingEffects([x], 'heal');
    assert.equal(r.callback_count.mean, 1); assert.equal(r.treatment_callbacks.mean, 1);
    assert.equal(r.callback_curing.mean, 110); assert.equal(r.callback_neili_cost.mean, 50);
    assert.equal(r.halt_neili_cost.mean, 100); assert.equal(r.sides[0].cost.neili.mean, 150);
    assert.equal(r.sides[0].net.neili.mean, -140); assert.equal(r.effective_gain_outside_callbacks.mean, 2);
    assert.equal(r.terminals.halted, 1); assert.equal(r.pending_residual, 0);
});

test('inspire标记残留单列，未执行与拒绝不混入疗伤时长均值', () => {
    const x = healingRow('inspire'), raw = x.raw;
    raw.healing_terminal = 'busy_ended'; delete raw.healing_halt;
    const b = structuredClone(raw.healing_steps[1].state);
    b.neili = 50; const a = structuredClone(b); a.busy = 0;
    raw.healing_steps.push({ phase: 'before', state: b }, { phase: 'after', state: a });
    raw.after[0] = a;
    const noTrace = row(); noTrace.outcome = 'refused'; noTrace.raw.command_accepted = 0;
    const r = healingEffects([x, noTrace], 'inspire');
    assert.equal(r.attempts, 2); assert.equal(r.traced, 1); assert.equal(r.elapsed.n, 1);
    assert.equal(r.terminals.depleted, 1); assert.equal(r.pending_residual, 1);
    assert.equal(healingEffects([noTrace], 'inspire').callback_curing.mean, null);
    assert.throws(() => healingEffects([], 'recover'));
});
