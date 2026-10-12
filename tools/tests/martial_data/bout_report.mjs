// Read-only snapshots of the twelve-category series. No mutation or restart.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { digest, openSeries, readSamples } from './ledger.mjs';
import { boutConditions, validateBoutRecord } from './bout_cases.mjs';
import { validateRecord } from './execution.mjs';
import { distribution, summarizeSamples } from './statistics.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const sampleKey = row => `${row.condition_id}.${row.index}`;

export function completeJsonl(bytes) {
    const end = bytes.lastIndexOf(10);
    if (end < 0) return { rows: [], incomplete_bytes: bytes.length };
    return { rows: bytes.subarray(0, end + 1).toString('utf8').split(/\r?\n/)
        .filter(line => line.trim()).map(line => JSON.parse(line)),
    incomplete_bytes: bytes.length - end - 1 };
}

export function summarizeBouts(manifest, rows, runs) {
    const summary = summarizeSamples(manifest, rows);
    const conditions = summary.conditions.map(c => {
        const values = rows.filter(r => r.condition_id === c.id && r.outcome === 'observed').map(r => r.raw);
        const counter = (r, key) => r.metrics?.[0] ? r.metrics[0][key] ?? 0 : null;
        const actorEvents = (r, key) => typeof r.before?.[0]?.object === 'string' && Array.isArray(r[key])
            ? r[key].filter(event => event.actor === r.before[0].object).length : null;
        return { ...c,
            state: c.counts.error || c.counts.refused ? 'requires_review' : c.missing ? 'incomplete'
                : c.counts.not_applicable === c.planned ? 'not_applicable'
                : c.counts.observed === c.planned ? 'sampled' : 'requires_review',
            actual_first: { left: values.filter(r => r.first_actor === 0).length,
                right: values.filter(r => r.first_actor === 1).length },
            performer: { attempts: distribution(values.map(r => counter(r, 'perform_attempts'))),
                launches: distribution(values.map(r => actorEvents(r, 'launches'))),
                refusals: distribution(values.map(r => actorEvents(r, 'refusals'))) },
            net_qi_loss: [0, 1].map(side => distribution(values.map(r => {
                const before = r.before?.[side]?.qi, after = r.after?.[side]?.qi;
                return Number.isFinite(before) && Number.isFinite(after) ? before - after : null;
            }))),
        };
    });
    const planned = conditions.reduce((n, c) => n + c.planned, 0);
    const last = runs.at(-1);
    const exitedCleanly = !!last?.complete && last.validation_errors === 0 && last.incomplete_bytes === 0;
    const complete = rows.length === planned && conditions.every(c => ['sampled', 'not_applicable'].includes(c.state))
        && exitedCleanly;
    return { ...summary, kind: 'weapon_bout_snapshot', snapshot_at: new Date().toISOString(),
        state: complete ? 'complete' : 'partial_snapshot', conditions, runs,
        totals: { planned_samples: planned, recorded_samples: rows.length,
            sampled_conditions: conditions.filter(c => c.state === 'sampled').length,
            not_applicable_conditions: conditions.filter(c => c.state === 'not_applicable').length,
            incomplete_conditions: conditions.filter(c => c.state === 'incomplete').length,
            requires_review_conditions: conditions.filter(c => c.state === 'requires_review').length,
            execution_completed: exitedCleanly },
        evidence_snapshot_sha256: digest(rows.map(r => [sampleKey(r), r.raw_sha256]).sort((a, b) => a[0].localeCompare(b[0]))),
        limitations: [...summary.limitations,
            '正文只汇总样本齐全且无错误/拒绝的条件；未完成部分单列，不据中途均值做结论。',
            '普通攻击包含原生恢复；净气血下降、总支出和恢复分别报告，不将净值冒充总伤害。',
            '绝招策略可能多次尝试，受资源、忙乱和冷却限制；尝试、实际发动和拒绝分别统计。',
            '双方每个完整条件各先手十场；30 秒未决保留，不从剩余血量指定胜者。',
            '部分武学的全局动作初始化依赖加载上下文；本系列保留原行为，不代表所有系数逐击重算。',
            '快照不探测进程存活；缺少最终运行结果不自动解释为进程停止或失败。'] };
}

export function readBouts(directory, { requireComplete = false } = {}) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory), execution = manifest.identity.execution;
    assert.equal(execution.collection, 'bouts', '不是交锋系列');
    assert.equal(execution.smoke, false, '烟雾不作完整交锋统计');
    const catalog = json(join(directory, 'catalog.json'));
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    const first = manifest.identity.conditions[0];
    const level = first.parameters.actor.skills[first.parameters.profile.skill];
    assert.ok([200, 400, 800].includes(level));
    assert.equal(digest(manifest.identity.conditions), digest(boutConditions(catalog, { level, bouts: 20 })),
        '不是当前十二类固定对照条件');
    // Ledger files are atomically renamed from .pending, so this is one finite
    // list of complete samples even when another process continues appending.
    const rows = readSamples(directory, manifest), byCondition = new Map(manifest.identity.conditions.map(c => [c.id, c]));
    for (const row of rows) {
        const condition = byCondition.get(row.condition_id);
        assert.equal(row.outcome, row.raw.outcome, '台账与原始终态不符');
        assert.equal(row.index, row.raw.index, '台账与原始编号不符');
        validateRecord(row.raw, condition); validateBoutRecord(row.raw, condition);
        if (row.outcome === 'not_applicable') assert.ok(condition.parameters.not_applicable,
            '可用条件被误标不适用');
    }
    const evidence = new Map(), runs = [];
    for (const name of readdirSync(join(directory, 'runs'))) {
        const attempt = join(directory, 'runs', name), request = json(join(attempt, 'request.json'));
        assert.equal(request.fingerprint, manifest.fingerprint, '运行请求来自其他系列');
        const allowed = new Set(request.jobs.map(sampleKey));
        const rawPath = join(attempt, 'mudlib/log/events.jsonl');
        const raw = existsSync(rawPath) ? completeJsonl(readFileSync(rawPath)) : { rows: [], incomplete_bytes: 0 };
        for (const value of raw.rows) {
            assert.ok(allowed.has(sampleKey(value)), '原日志记录不属于本次请求');
            const hash = digest(value), known = evidence.get(sampleKey(value));
            assert.ok(!known || known.sha256 === hash, '相同样本有不同的原始日志');
            evidence.set(sampleKey(value), { sha256: hash, attempt: name });
        }
        const resultPath = join(attempt, 'result.json');
        const result = existsSync(resultPath) ? json(resultPath) : null;
        const outputPath = join(attempt, 'driver-output.txt');
        const output = existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '';
        runs.push({ attempt: name, created: request.created,
            complete: result?.process?.code === 0 && /DATA COMPLETE/.test(output),
            result_recorded: !!result, code: result?.process?.code ?? null,
            validation_errors: result ? result.validation_errors.length : null,
            incomplete_bytes: result?.incomplete_bytes ?? raw.incomplete_bytes,
            raw_complete_records: raw.rows.length });
    }
    for (const row of rows) assert.equal(evidence.get(sampleKey(row))?.sha256, row.raw_sha256,
        '台账缺少一致的驱动原始证据：' + sampleKey(row));
    runs.sort((a, b) => a.created.localeCompare(b.created));
    const report = { ...summarizeBouts(manifest, rows, runs), input: directory, level };
    if (requireComplete) assert.equal(report.state, 'complete', '系列尚未完成或尚未正常退出');
    return report;
}

export function boutMarkdown(report) {
    const num = x => Number.isFinite(x) ? x.toFixed(2) : '未知';
    const lines = ['# 十二类兵器交锋采集快照', '',
        `状态：${report.state === 'complete' ? '本系列已完整核验' : '部分采集，不是最终结论'}。`, '',
        `系列指纹：\`${report.fingerprint}\`；快照时间：${report.snapshot_at}。`, '',
        `已保存 ${report.totals.recorded_samples}/${report.totals.planned_samples} 条；`
            + `完整正常条件 ${report.totals.sampled_conditions}，完整不适用条件 ${report.totals.not_applicable_conditions}，`
            + `未采满 ${report.totals.incomplete_conditions}，需复核 ${report.totals.requires_review_conditions}。`, '',
        '以下仅列完整正常条件，数值为每场均值；双方原生心跳和恢复均保留。', '',
        '| 条件 | 胜 / 负 / 未决 | 双方先手场数 | 对方气血支出 / 恢复 / 净下降 | 自身内力支出 / 恢复 | 自身 / 对方忙乱秒 | 实际发动次数 |',
        '| --- | --- | --- | --- | --- | --- | ---: |'];
    for (const c of report.conditions.filter(c => c.state === 'sampled')) {
        const left = c.sides[0], right = c.sides[1];
        lines.push(`| ${c.id} | ${c.bouts.left_wins.successes} / ${c.bouts.right_wins.successes} / ${c.bouts.undecided}`
            + ` | ${c.actual_first.left} / ${c.actual_first.right}`
            + ` | ${num(right.metrics.qi_cost.mean)} / ${num(right.metrics.qi_recovery.mean)} / ${num(c.net_qi_loss[1].mean)}`
            + ` | ${num(left.metrics.neili_cost.mean)} / ${num(left.metrics.neili_recovery.mean)}`
            + ` | ${num(left.busy_seconds.mean)} / ${num(right.busy_seconds.mean)} | ${num(c.performer.launches.mean)} |`);
    }
    lines.push('', '## 未完成、异常或不适用条件', '', '| 条件 | 已记录 / 计划 | 状态 |', '| --- | ---: | --- |');
    for (const c of report.conditions.filter(c => c.state !== 'sampled')) lines.push(`| ${c.id} | ${c.recorded} / ${c.planned} | ${c.state} |`);
    lines.push('', ...report.limitations.map(s => '- ' + s), '',
        '完整分布、胜率区间、条件与原始记录摘要见 bout-snapshot.json；快照不能覆盖未完成条件的效果。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        const args = process.argv.slice(2), requireComplete = args.includes('--complete');
        const paths = args.filter(a => a !== '--complete');
        assert.ok(paths.length >= 1 && paths.length <= 2 && !paths.some(p => p.startsWith('--')),
            '用法：node tools/tests/martial_data/bout_report.mjs 系列目录 [新的仓库外报告目录] [--complete]');
        const report = readBouts(paths[0], { requireComplete });
        if (paths[1]) {
            const output = newOutput(paths[1]);
            writeFileSync(join(output, 'bout-snapshot.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
            writeFileSync(join(output, 'bout-snapshot.md'), boutMarkdown(report), { flag: 'wx' });
            console.log('交锋快照：' + output);
        } else console.log(boutMarkdown(report));
        console.log(JSON.stringify(report.totals));
    } catch (e) { console.error('交锋核验失败：' + e.message); process.exitCode = 1; }
}
