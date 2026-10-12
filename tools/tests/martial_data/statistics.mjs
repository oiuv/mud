// Descriptive data only: no ranking, balance target, or parameter adjustment.
import assert from 'node:assert/strict';
import { digest, openSeries, readSamples } from './ledger.mjs';

export function distribution(values) {
    const known = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!known.length) return { n: 0, unknown: values.length, mean: null, median: null,
        p10: null, p90: null, p95: null, min: null, max: null };
    const quantile = p => {
        const i = (known.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i);
        return known[lo] + (known[hi] - known[lo]) * (i - lo);
    };
    return { n: known.length, unknown: values.length - known.length,
        mean: known.reduce((a, b) => a + b, 0) / known.length, median: quantile(0.5),
        p10: quantile(0.1), p90: quantile(0.9), p95: quantile(0.95), min: known[0], max: known.at(-1) };
}

// Wilson 95% interval for sample-level events, not independent attack counts.
export function probability(successes, trials) {
    assert.ok(Number.isSafeInteger(successes) && Number.isSafeInteger(trials)
        && successes >= 0 && trials >= successes);
    if (!trials) return { successes, trials, rate: null, low95: null, high95: null };
    const z = 1.959963984540054, p = successes / trials, denominator = 1 + z * z / trials;
    const center = (p + z * z / (2 * trials)) / denominator;
    const radius = z * Math.sqrt(p * (1 - p) / trials + z * z / (4 * trials * trials)) / denominator;
    return { successes, trials, rate: p, low95: Math.max(0, center - radius), high95: Math.min(1, center + radius) };
}

export function summarizeSamples(manifest, records, { npcBoutReport } = {}) {
    const conditions = manifest.identity.conditions.map(condition => {
        const rows = records.filter(r => r.condition_id === condition.id);
        const observed = rows.filter(r => r.outcome === 'observed').map(r => r.raw);
        const first = rows.find(r => r.outcome === 'observed');
        const counts = Object.fromEntries(['observed', 'refused', 'error', 'not_applicable']
            .map(key => [key, rows.filter(r => r.outcome === key).length]));
        if (condition.parameters.collection_group === 'gumu-npc-bout') {
            assert.equal(typeof npcBoutReport, 'function', '原NPC交锋须使用具名专用报告入口');
            return { id: condition.id, entry_id: condition.entry_id, method: condition.method,
                parameters: condition.parameters, planned: condition.samples, recorded: rows.length,
                counts, missing: condition.samples - rows.length, normal_effect_denominator: observed.length,
                elapsed: distribution(observed.map(row => row.elapsed)), sides: null, bouts: null,
                npc_bout_effects: npcBoutReport(rows, condition),
                evidence: rows.map(row => ({ id: row.condition_id + '.' + row.index, sha256: row.raw_sha256 })) };
        }
        // A present observer mapping uses sparse zero counters. A missing mapping
        // is unknown, never synthesized into a successful zero-cost sample.
        const metric = (row, side, key) => row.metrics?.[side] ? row.metrics[side][key] ?? 0 : null;
        const sides = [0, 1].map(side => {
            const metrics = {};
            for (const key of ['qi_cost', 'qi_recovery', 'eff_qi_cost', 'eff_qi_recovery',
                'jing_cost', 'jing_recovery', 'eff_jing_cost', 'eff_jing_recovery',
                'neili_cost', 'neili_recovery', 'hit', 'dodge', 'parry', 'direct', 'quick', 'riposte', 'heartbeats']) {
                metrics[key] = distribution(observed.map(row => metric(row, side, key)));
            }
            const attackSamples = observed.filter(row => row.metrics?.[side]);
            const attackCounts = Object.fromEntries(['hit', 'dodge', 'parry'].map(key =>
                [key, attackSamples.reduce((sum, row) => sum + metric(row, side, key), 0)]));
            return { metrics, attack_counts: attackCounts,
                // Strikes in a combo are correlated. No binomial CI across strikes.
                any_hit: probability(attackSamples.filter(row => metric(row, side, 'hit') > 0).length, attackSamples.length),
                busy_seconds: distribution(observed.map(row => row.busy_seconds?.[side])),
                remaining_neili: distribution(observed.map(row => row.after?.[side]?.neili)),
                remaining_qi: distribution(observed.map(row => row.after?.[side]?.qi)) };
        });
        const bouts = observed.filter(row => row.method === 'bout');
        return { id: condition.id, entry_id: condition.entry_id, method: condition.method,
            parameters: condition.parameters, planned: condition.samples, recorded: rows.length, counts,
            missing: condition.samples - rows.length, normal_effect_denominator: observed.length,
            initial_state_example: first ? { sample: first.condition_id + '.' + first.index,
                state: first.raw.before ?? null } : null,
            elapsed: distribution(observed.map(row => row.elapsed)), sides,
            bouts: { n: bouts.length,
                left_wins: probability(bouts.filter(row => row.winner === 0).length, bouts.length),
                right_wins: probability(bouts.filter(row => row.winner === 1).length, bouts.length),
                undecided: bouts.filter(row => row.winner === -1).length },
            evidence: rows.map(row => ({ id: row.condition_id + '.' + row.index, sha256: row.raw_sha256 })) };
    });
    return { format: 1, kind: 'martial_data_statistics', fingerprint: manifest.fingerprint,
        conditions_sha256: digest(manifest.identity.conditions), versions: manifest.versions,
        smoke: manifest.identity.execution.smoke === true, conditions,
        limitations: ['仅汇总本系列既定条件，拒绝/错误/不适用不混入正常效果分母。',
            '气血支出、有效气血支出与恢复分别列出，不相加作伤害。支出可能包含反伤、自损等来源。',
            '命中/闪避/招架为攻击次数；连击有关联，概率区间仅用于样本级事件。',
            '控制、辅助和资源削减不以零伤害定强弱；未知不填零。',
            '30 秒未决不是胜利；实验资格不等于可学条件或培养成本。'] };
}

export function collectStatistics(directory, options = {}) {
    const manifest = openSeries(directory);
    return summarizeSamples(manifest, readSamples(directory, manifest), options);
}

export function statisticsMarkdown(report, { npcBoutMarkdown } = {}) {
    const format = value => value === null ? '未知' : value.toFixed(2);
    const lines = ['# 武学条件统计', '', `系列：\`${report.fingerprint}\`。${report.smoke ? '仅烟雾验证，不作概率结论。' : '仅代表本系列条件。'}`,
        '', '数值为正常观察样本均值；完整分布、双方状态及原始证据编号见 statistics.json。', ''];
    const legacy = report.conditions.filter(c => !c.npc_bout_effects);
    if (legacy.length) lines.push(
        '| 条件 | 已记录/计划 | 正常/拒绝/错误/不适用 | 对方气血支出 | 对方创伤 | 自身内力支出 | 对方内力支出 |',
        '| --- | ---: | --- | ---: | ---: | ---: | ---: |');
    for (const c of legacy) {
        const left = c.sides[0].metrics, right = c.sides[1].metrics;
        lines.push(`| ${c.id} | ${c.recorded}/${c.planned} | ${Object.values(c.counts).join('/')} | `
            + `${format(right.qi_cost.mean)} | ${format(right.eff_qi_cost.mean)} | ${format(left.neili_cost.mean)} | ${format(right.neili_cost.mean)} |`);
    }
    for (const c of report.conditions.filter(c => c.npc_bout_effects)) {
        assert.equal(typeof npcBoutMarkdown, 'function', '原NPC交锋不能使用通用对方计损表');
        lines.push('', npcBoutMarkdown(c.npc_bout_effects));
    }
    lines.push('', ...report.limitations.map(text => '- ' + text), '');
    return lines.join('\n');
}
