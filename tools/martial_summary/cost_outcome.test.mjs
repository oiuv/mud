import test from 'node:test';
import assert from 'node:assert/strict';
import { cost_outcome } from './cost_outcome.mjs';
const sample = () => ({ before: [{ qi: 10000, living: 1 }, {}],
    after: [{ qi: 9900, living: 1 }, {}], metrics: [{}, {}] });
test('successful treatment retains normal qi cost, not backlash', () => {
    const d = sample(); d.metrics[1].eff_qi_recovery = 1450;
    assert.equal(cost_outcome('kungfu/skill/taiji-shengong/dian.c:5:exert', d), 'normal');
});
test('roar resistance is no-effect, not reflected self-injury', () => {
    assert.equal(cost_outcome('kungfu/skill/surge-force/roar.c:7:exert', sample()), 'miss');
    const d = sample(); d.metrics[1].jing_cost = 600;
    assert.equal(cost_outcome('kungfu/skill/surge-force/roar.c:7:exert', d), 'normal');
});
test('normal self-cost alone never establishes backlash', () => {
    assert.equal(cost_outcome('already-verified-buff', sample()), 'normal');
});
test('tao backlash requires the actual incapacitation event', () => {
    const d = sample();
    assert.equal(cost_outcome('kungfu/skill/chousui-zhang/tao.c:9:perform', d), 'normal');
    d.after[0] = { qi: 0, living: 0 };
    assert.equal(cost_outcome('kungfu/skill/chousui-zhang/tao.c:9:perform', d), 'backlash');
});
