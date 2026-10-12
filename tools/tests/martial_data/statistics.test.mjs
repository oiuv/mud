import assert from 'node:assert/strict';
import test from 'node:test';
import { distribution, probability, summarizeSamples, statisticsMarkdown } from './statistics.mjs';

test('分布保留真实零值与未知；分位数使用线性插值', () => {
    const d = distribution([0, 10, 20, 30, null, undefined]);
    assert.equal(d.n, 4); assert.equal(d.unknown, 2); assert.equal(d.mean, 15);
    assert.equal(d.median, 15); assert.ok(Math.abs(d.p10 - 3) < 1e-12); assert.ok(Math.abs(d.p90 - 27) < 1e-12);
    assert.equal(distribution([null]).mean, null);
});

test('样本级 Wilson 区间不把零成功或全成功当作确定概率', () => {
    assert.equal(probability(0, 0).rate, null);
    assert.ok(probability(0, 100).high95 > 0.03);
    assert.ok(probability(100, 100).low95 < 0.97);
    assert.equal(probability(50, 100).rate, 0.5);
    assert.throws(() => probability(2, 1));
});

test('错误/拒绝不混入效果均值；资源与创伤分开，缺失观察不当零', () => {
    const manifest = { fingerprint: 'series', versions: {}, identity: { execution: { smoke: true },
        conditions: [{ id: 'a', samples: 5, method: 'perform', parameters: {}, entry_id: 'source' }] } };
    const records = [
        { condition_id: 'a', index: 0, outcome: 'observed', raw_sha256: 'one', raw: { elapsed: 1,
            metrics: [{ neili_cost: 10, hit: 2 }, { qi_cost: 100, eff_qi_cost: 40 }] } },
        { condition_id: 'a', index: 1, outcome: 'observed', raw_sha256: 'two', raw: { elapsed: 2,
            metrics: [{}, {}] } },
        { condition_id: 'a', index: 2, outcome: 'refused', raw_sha256: 'three', raw: { metrics: [{ neili_cost: 999 }, {}] } },
        { condition_id: 'a', index: 3, outcome: 'error', raw_sha256: 'four', raw: {} },
    ];
    const report = summarizeSamples(manifest, records), c = report.conditions[0];
    assert.equal(c.missing, 1); assert.equal(c.normal_effect_denominator, 2);
    assert.equal(c.sides[0].metrics.neili_cost.mean, 5);
    assert.equal(c.sides[1].metrics.qi_cost.mean, 50); assert.equal(c.sides[1].metrics.eff_qi_cost.mean, 20);
    assert.equal(c.sides[0].any_hit.rate, 0.5); assert.equal(c.sides[0].attack_counts.hit, 2);
    assert.equal(c.sides[0].busy_seconds.n, 0); assert.equal(c.sides[0].busy_seconds.unknown, 2);
    assert.equal(c.evidence.length, 4); assert.match(statisticsMarkdown(report), /仅烟雾/);
});
