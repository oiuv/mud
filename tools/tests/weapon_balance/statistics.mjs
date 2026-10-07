import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

export function distribution(values) {
    assert.ok(values.every(Number.isFinite), '统计值必须有限');
    if (!values.length) return { n: 0, mean: null, median: null, p10: null, p90: null };
    const sorted = [...values].sort((a, b) => a - b);
    const quantile = p => {
        const index = p * (sorted.length - 1), lower = Math.floor(index);
        return sorted[lower] + (sorted[Math.ceil(index)] - sorted[lower]) * (index - lower);
    };
    return { n: values.length, mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: quantile(0.5), p10: quantile(0.1), p90: quantile(0.9) };
}
export function probability(successes, total) {
    assert.ok(Number.isInteger(total) && Number.isInteger(successes) && successes >= 0 && total >= successes);
    if (!total) return { successes, total, rate: null, wilson95: null };
    const p = successes / total, z = 1.959963984540054, d = 1 + z * z / total;
    const middle = (p + z * z / (2 * total)) / d;
    const half = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / d;
    return { successes, total, rate: p, wilson95: [Math.max(0, middle - half), Math.min(1, middle + half)] };
}
export const efficiency = (damage, cost) => cost > 0 ? damage / cost : null;
export function fingerprint(manifest) {
    return createHash('sha256').update(JSON.stringify({ commit: manifest.commit, mudcore: manifest.mudcore,
        driver: manifest.driver_sha256, parameters: manifest.parameters, files: manifest.files, probes: manifest.probes })).digest('hex');
}
export function compareBatches(a, b) {
    assert.equal(a.status, 'passed'); assert.equal(b.status, 'passed');
    assert.equal(a.fingerprint, b.fingerprint, '批次源码、驱动或参数不同，不能混算');
}
export function validateRun({ result, diagnostics, records, parameters }) {
    assert.equal(result.code, 0, '驱动异常退出');
    assert.ok(result.text.includes('BALANCE PASS'), '驱动没有完成标志');
    assert.ok(!diagnostics.split(/\r?\n/).some(line => /\bwarning:|\berror:|FAIL:|WATCHDOG|CANCELLED/i.test(line)
        && !/^WARNING: Platform doesn't support eval limit!$/.test(line.trim())), '驱动诊断或超时失败');
    assert.ok(records.some(r => r.kind === 'preflight' && r.ok), '缺少资格与边界自检');
    const samples = records.filter(r => r.kind === 'sample');
    const expected = 28 * parameters.samples + 12 * parameters.bouts;
    assert.equal(samples.length, expected, '缺少采样');
    const ids = new Set();
    for (const sample of samples) {
        assert.ok(!ids.has(sample.id), '重复样本'); ids.add(sample.id);
        assert.equal(sample.error, '', '采样异常');
        assert.ok(sample.fresh, '状态残留');
        assert.ok(sample.elapsed >= 0 && sample.before.length === 2 && sample.after.length === 2);
        for (const side of [0, 1]) {
            assert.ok(sample.busy_seconds[side] >= 0 && sample.busy_seconds[side] <= sample.elapsed + 0.001, '忙乱时间无效');
            if (parameters.probes !== false) for (const resource of ['neili', 'qi', 'eff_qi', 'jing', 'eff_jing']) {
                assert.equal((sample.metrics[side][resource + '_cost'] || 0) - (sample.metrics[side][resource + '_recovery'] || 0),
                    sample.before[side][resource] - sample.after[side][resource], '资源账不平：' + sample.id + ':' + side + ':' + resource);
            }
        }
        if (sample.mode === 'bout') {
            assert.equal(sample.first, sample.index % 2, '先手没有交替');
            if (sample.first_actor !== -1) assert.equal(sample.first_actor, sample.first, '真实心跳先手不符');
            assert.ok(['time_limit', 'unconscious', 'death'].includes(sample.terminal), '无效终态');
            if (sample.terminal === 'time_limit') assert.equal(sample.winner, -1, '截尾不得计胜利');
        }
    }
    const counts = new Map();
    for (const sample of samples) counts.set(sample.condition, (counts.get(sample.condition) || 0) + 1);
    assert.equal(counts.size, 40, '条件矩阵不完整');
    for (const [condition, count] of counts) assert.equal(count, condition.startsWith('bout:') ? parameters.bouts : parameters.samples);
}
export function summarize(records) {
    const groups = new Map();
    for (const sample of records.filter(r => r.kind === 'sample')) {
        if (!groups.has(sample.condition)) groups.set(sample.condition, []);
        groups.get(sample.condition).push(sample);
    }
    return [...groups].map(([condition, samples]) => ({
        condition, n: samples.length, elapsed: distribution(samples.map(s => s.elapsed)),
        launched: probability(samples.filter(s => s.launched > 0).length, samples.length),
        refused: samples.filter(s => s.launched === 0).length,
        errors: samples.filter(s => s.error).length,
        censored: samples.filter(s => s.terminal === 'time_limit').length,
        sides: [0, 1].map(side => {
            const sum = key => samples.reduce((n, s) => n + (s.metrics[side][key] || 0), 0);
            const damage = samples.map(s => s.before[1 - side].qi - s.after[1 - side].qi);
            const costs = samples.map(s => s.metrics[side].neili_cost || 0);
            return {
                wins: probability(samples.filter(s => s.winner === side && s.mode === 'bout').length, samples.filter(s => s.mode === 'bout').length),
                qi_loss_inflicted: distribution(damage),
                eff_qi_loss_inflicted: distribution(samples.map(s => s.before[1 - side].eff_qi - s.after[1 - side].eff_qi)),
                neili_cost: distribution(costs), neili_recovery: distribution(samples.map(s => s.metrics[side].neili_recovery || 0)),
                qi_cost: distribution(samples.map(s => s.metrics[side].qi_cost || 0)),
                qi_recovery: distribution(samples.map(s => s.metrics[side].qi_recovery || 0)),
                eff_qi_cost: distribution(samples.map(s => s.metrics[side].eff_qi_cost || 0)),
                eff_qi_recovery: distribution(samples.map(s => s.metrics[side].eff_qi_recovery || 0)),
                jing_cost: distribution(samples.map(s => s.metrics[side].jing_cost || 0)),
                jing_recovery: distribution(samples.map(s => s.metrics[side].jing_recovery || 0)),
                ordinary_hit: probability(sum('hit'), sum('hit') + sum('parry') + sum('dodge')),
                ordinary_counts: { hit: sum('hit'), parry: sum('parry'), dodge: sum('dodge'), riposte: sum('riposte'), quick: sum('quick') },
                direct_calls: sum('direct'), perform_attempts: sum('perform_attempts'), perform_launched: sum('perform_launched'),
                direct_per_launched: probability(sum('direct'), sum('perform_launched')),
                final_busy: distribution(samples.map(s => s.after[side].busy)),
                busy_seconds: distribution(samples.map(s => s.busy_seconds[side])),
                busy_fraction: distribution(samples.filter(s => s.elapsed > 0 && s.mode === 'bout').map(s => s.busy_seconds[side] / s.elapsed)),
                heartbeats: distribution(samples.map(s => s.metrics[side].heartbeats || 0)),
                damage_per_neili: efficiency(damage.reduce((a, b) => a + b, 0), costs.reduce((a, b) => a + b, 0)),
            };
        }),
    }));
}
