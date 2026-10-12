import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fingerprint, probability } from '../weapon_balance/statistics.mjs';
import { readBaseline, compareBaselineReports, singleMeanContrasts, baselineMarkdown } from './baseline_report.mjs';

const manifest = (overrides = {}) => {
    const value = { status: 'passed', started: 'one', commit: 'source', mudcore: 'core',
        driver_sha256: 'driver', files: {}, probes: [], elapsed_seconds: 12,
        parameters: { smoke: false, samples: 100, bouts: 20, duration: 30 }, ...overrides };
    value.fingerprint = fingerprint(value);
    return value;
};

const singleSummary = makeSide => Array.from({ length: 7 }, (_, index) =>
    ['ordinary', 'perform'].flatMap(mode => [0, 50].map(jiali => ({
        condition: `${mode}:${index}:jiali${jiali}`, sides: [makeSide(index, mode, jiali), makeSide(0, mode, jiali)],
    })))).flat();

test('基线报告拒绝未完成、烟雾及损坏指纹，不把进度文件当完整证据', t => {
    const directory = mkdtempSync(join(tmpdir(), 'mud-baseline-reader-test-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const save = value => writeFileSync(join(directory, 'manifest.json'), JSON.stringify(value));
    save(manifest({ status: 'running' }));
    assert.throws(() => readBaseline(directory), /尚未完成/);
    save(manifest({ parameters: { smoke: true, samples: 2, bouts: 2, duration: 3 } }));
    assert.throws(() => readBaseline(directory), /烟雾/);
    save({ ...manifest(), fingerprint: 'changed' });
    assert.throws(() => readBaseline(directory), /指纹不符/);
});

test('两个批次必须独立且参数、源码指纹相同', () => {
    const a = { directory: 'a', manifest: manifest() };
    const b = { directory: 'b', manifest: manifest({ started: 'two' }) };
    assert.deepEqual(compareBaselineReports(a, b), { a, b });
    assert.throws(() => compareBaselineReports(a, a), /独立运行/);
    assert.throws(() => compareBaselineReports(a, { ...b, manifest: a.manifest }), /独立启动/);
    assert.throws(() => compareBaselineReports(a, { ...b, manifest: manifest({ started: 'two', commit: 'other' }) }), /不能混算/);
});

test('基线摘要分列批次与净伤害、创伤、成本，未决不计胜利', () => {
    const side = n => ({ qi_loss_inflicted: { mean: n }, eff_qi_loss_inflicted: { mean: n / 2 },
        neili_cost: { mean: 20 }, wins: probability(n, 20),
        ordinary_counts: { hit: 8 }, direct_calls: 0, final_busy: { mean: 1 } });
    const summary = [
        ...singleSummary(() => side(10)),
        { condition: 'bout:0:ordinary:jiali0', sides: [side(1), side(2)], censored: 17, elapsed: { median: 30 } },
    ];
    const a = { directory: 'a', manifest: manifest(), summary };
    const b = { directory: 'b', manifest: manifest({ started: 'two' }), summary };
    const text = baselineMarkdown(compareBaselineReports(a, b));
    assert.match(text, /10\.00 \/ 10\.00/);
    assert.match(text, /5\.00 \/ 5\.00/);
    assert.match(text, /20\.00 \/ 20\.00/);
    assert.match(text, /1\/2\/17/);
    assert.match(text, /不把到时未决计成胜利/);
    assert.match(text, /不是十二类兵器/);
    assert.match(text, /没有激发特殊内功/);
    assert.match(text, /不能把普攻两档的随机差异当作加力收益/);
    assert.match(text, /剩余状态，不是控制触发率/);
    assert.match(text, /不是配对试验或显著性检验/);
    assert.match(text, /普通攻击命中 A\/B/);
    assert.match(text, /0\.9%–23\.6%/); // One observed win out of twenty, not 5% certainty.
    assert.match(text, /不是无限时长胜率/);
});

test('两批均值方向保持独立，反向、零差异和缺条件均明确处理', () => {
    const row = value => ({ qi_loss_inflicted: { mean: value } });
    const a = { summary: singleSummary(index => row(index * 10)) };
    const b = { summary: singleSummary(index => row(index * 20)) };
    let comparisons = singleMeanContrasts({ a, b });
    assert.equal(comparisons.length, 16);
    assert.deepEqual(comparisons[0], { left: 0, right: 1, mode: 'ordinary', jiali: 0,
        deltaA: 10, deltaB: 20, direction: '同向' });
    const change = (batch, index, value) => {
        batch.summary.find(c => c.condition === `ordinary:${index}:jiali0`).sides[0] = row(value);
    };
    change(b, 1, -20);
    assert.equal(singleMeanContrasts({ a, b })[0].direction, '反向波动');
    change(b, 1, 0);
    assert.equal(singleMeanContrasts({ a, b })[0].direction, '一批无差异');
    change(a, 1, 0);
    assert.equal(singleMeanContrasts({ a, b })[0].direction, '两批相同');
    b.summary.pop();
    assert.throws(() => singleMeanContrasts({ a, b }), /比较缺少条件/);
});
