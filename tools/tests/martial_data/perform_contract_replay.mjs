// Versioned review attachment: replay perform/exert evidence against effect contracts.
//
// Integrity-first design (addresses independent review finding #4):
//  - Uses ledger.openSeries + readSamples, which enforce series fingerprint,
//    per-sample condition_sha256, raw_sha256, slot range, duplicate slots and
//    filename identity. No condition is ever reconstructed from sample content.
//  - Validation runs against the REAL frozen condition from the manifest, with
//    only effect_contract / refusal_side_effects merged in from the contract file.
//  - A contract whose source_sha256 does not match the CURRENT source is BLOCKED:
//    it never participates in replay, and the affected conditions are reported as
//    hash_blocked rather than silently passed or failed.
//  - Missing slots are reported per condition; nothing is inferred or backfilled.
//  - Exits non-zero when any failure, missing slot or blocked contract remains
//    unhandled, and writes the COMPLETE failure list (not a truncated prefix).
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { openSeries, readSamples } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validatePerformEffectRecord } from './perform_effect_consumer.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));

// Resolve contract for a frozen condition. Returns { contract, status } where
// status is 'ok' | 'hash_mismatch' | 'no_contract'. hash_mismatch BLOCKS replay.
export function resolveContract(condition, contracts, readSource) {
    const entryId = condition.entry_id;
    const contract = contracts[entryId];
    if (!contract) return { contract: null, status: 'no_contract' };
    let currentHash;
    try { currentHash = sha256(readSource(contract.path)); }
    catch { return { contract, status: 'hash_mismatch', reason: 'source unreadable' }; }
    if (currentHash !== contract.source_sha256)
        return { contract, status: 'hash_mismatch', expected: contract.source_sha256, actual: currentHash };
    return { contract, status: 'ok' };
}

// Replay one series. Returns per-condition results with full integrity accounting.
export function replaySeries(seriesDir, contracts, readSource) {
    const manifest = openSeries(seriesDir);          // fingerprint == digest(identity)
    const rows = readSamples(seriesDir, manifest);    // full per-sample integrity
    const rowsByCondition = new Map();
    for (const row of rows) {
        if (!rowsByCondition.has(row.condition_id)) rowsByCondition.set(row.condition_id, []);
        rowsByCondition.get(row.condition_id).push(row);
    }

    const result = { series: seriesDir, fingerprint: manifest.fingerprint,
        source_fingerprint: manifest.identity.source_fingerprint,
        conditions: [], totals: { conditions: 0, planned: 0, recorded: 0, missing: 0,
            passed: 0, passed_observed: 0, passed_refused: 0, failed: 0,
            hash_blocked: 0, no_contract: 0, not_applicable: 0 } };

    for (const condition of manifest.identity.conditions) {
        const condRows = rowsByCondition.get(condition.id) ?? [];
        const planned = condition.samples;
        const recordedIndices = new Set(condRows.map(r => r.index));
        const missing = Array.from({ length: planned }, (_, i) => i).filter(i => !recordedIndices.has(i));
        const { contract, status, reason, expected, actual } = resolveContract(condition, contracts, readSource);

        const entry = { id: condition.id, entry_id: condition.entry_id, planned,
            recorded: condRows.length, missing, contract_status: status };
        if (status === 'hash_mismatch') { entry.hash_mismatch = { reason, expected, actual }; }

        let passed = 0, failed = 0, blocked = 0, na = 0;
        let passedObserved = 0, passedRefused = 0;
        const failures = [];
        for (const row of condRows) {
            // error / not_applicable are explicit outcomes, never silently passed
            if (row.outcome === 'error' || row.outcome === 'not_applicable') { na++; continue; }
            if (status === 'hash_blocked' || status === 'hash_mismatch') { blocked++; continue; }
            if (status === 'no_contract') { blocked++; continue; }
            // Merge ONLY contract fields onto the real frozen condition.
            const merged = { ...condition, parameters: { ...condition.parameters,
                effect_contract: contract.effect_contract,
                refusal_side_effects: contract.refusal_side_effects ?? condition.parameters.refusal_side_effects } };
            try {
                validatePerformEffectRecord(row, merged);
                passed++;
                // Observed-effect passes and legal-refusal passes are tracked separately
                // (R03: a validated refusal is NOT effect evidence).
                if (row.outcome === 'observed') passedObserved++;
                else passedRefused++;
            }
            catch (e) { failed++; failures.push({ slot: `${row.condition_id}.${row.index}`, outcome: row.outcome, reason: e.message }); }
        }

        entry.passed = passed; entry.passed_observed = passedObserved;
        entry.passed_refused = passedRefused;
        entry.failed = failed; entry.blocked = blocked;
        entry.not_applicable = na; entry.failures = failures;
        result.conditions.push(entry);
        result.totals.conditions++;
        result.totals.planned += planned;
        result.totals.recorded += condRows.length;
        result.totals.missing += missing.length;
        result.totals.passed += passed;
        result.totals.passed_observed = (result.totals.passed_observed ?? 0) + passedObserved;
        result.totals.passed_refused = (result.totals.passed_refused ?? 0) + passedRefused;
        result.totals.failed += failed;
        result.totals.not_applicable += na;
        if (status === 'hash_mismatch') result.totals.hash_blocked += condRows.length;
        else if (status === 'no_contract') result.totals.no_contract += condRows.length;
    }
    return result;
}

export function runContractReplay({ contractsPath, seriesDirs, readSource, outputPath }) {
    const contractFile = json(contractsPath);
    const contracts = contractFile.contracts;
    const seriesResults = seriesDirs.map(dir => replaySeries(dir, contracts, readSource));

    const totals = seriesResults.reduce((acc, r) => {
        for (const k of Object.keys(acc)) acc[k] += r.totals[k];
        return acc;
    }, { conditions: 0, planned: 0, recorded: 0, missing: 0, passed: 0, failed: 0,
        hash_blocked: 0, no_contract: 0, not_applicable: 0,
        passed_observed: 0, passed_refused: 0 });

    // COMPLETE failure list — never truncated.
    const allFailures = seriesResults.flatMap(r =>
        r.conditions.flatMap(c => c.failures.map(f => ({ series: r.series, condition: c.id, ...f }))));
    const allMissing = seriesResults.flatMap(r =>
        r.conditions.filter(c => c.missing.length).map(c => ({ series: r.series, condition: c.id, missing: c.missing })));
    const allHashBlocked = seriesResults.flatMap(r =>
        r.conditions.filter(c => c.contract_status === 'hash_mismatch')
            .map(c => ({ series: r.series, condition: c.id, entry_id: c.entry_id, ...c.hash_mismatch })));
    const allNoContract = seriesResults.flatMap(r =>
        r.conditions.filter(c => c.contract_status === 'no_contract')
            .map(c => ({ series: r.series, condition: c.id, entry_id: c.entry_id })));

    const report = { format: 2, kind: 'perform_contract_replay', created: new Date().toISOString(),
        contracts: { path: contractsPath, total: Object.keys(contracts).length },
        integrity: {
            note: 'openSeries + readSamples enforce series fingerprint, condition_sha256, raw_sha256, slot range, duplicate slots and filename identity. Conditions are the real frozen manifest conditions, never reconstructed from samples.',
            hash_policy: 'A contract whose source_sha256 differs from current source is BLOCKED from replay and reported under hash_blocked, never silently passed.',
        },
        totals, series: seriesResults.map(r => ({ series: r.series, fingerprint: r.fingerprint,
            source_fingerprint: r.source_fingerprint, totals: r.totals,
            conditions: r.conditions.map(c => ({ id: c.id, entry_id: c.entry_id, planned: c.planned,
                recorded: c.recorded, missing: c.missing.length, contract_status: c.contract_status,
                passed: c.passed, passed_observed: c.passed_observed, passed_refused: c.passed_refused,
                failed: c.failed, blocked: c.blocked, not_applicable: c.not_applicable })) })),
        failures: allFailures, missing_slots: allMissing,
        hash_blocked: allHashBlocked, no_contract: allNoContract,
    };

    if (outputPath) {
        mkdirSync(outputPath, { recursive: true });
        writeFileSync(join(outputPath, 'contract-replay.json'), JSON.stringify(report, null, 2) + '\n');
        writeFileSync(join(outputPath, 'contract-replay.md'), replayMarkdown(report));
    }

    // Non-zero exit when anything is unhandled.
    const unhandled = totals.failed + totals.missing + allHashBlocked.length;
    return { report, unhandled, exitCode: unhandled > 0 ? 1 : 0 };
}

function replayMarkdown(report) {
    const t = report.totals;
    return ['# perform 契约重放报告（完整性优先）', '',
        `创建：${report.created}`, '',
        '| 指标 | 数值 |', '| --- | ---: |',
        `| 条件 | ${t.conditions} |`, `| 计划样本 | ${t.planned} |`, `| 已记录 | ${t.recorded} |`,
        `| 缺失槽位 | ${t.missing} |`, `| 通过 | ${t.passed}（observed ${t.passed_observed} / refused ${t.passed_refused}） |`, `| 失败 | ${t.failed} |`,
        `| hash 阻断 | ${t.hash_blocked} |`, `| 无契约 | ${t.no_contract} |`, `| error/not_applicable | ${t.not_applicable} |`,
        '', `完整性：${report.integrity.note}`, '', `hash 策略：${report.integrity.hash_policy}`, '',
        `失败明细：${report.failures.length} 条（完整列表见 JSON）`,
        `缺失槽位：${report.missing_slots.length} 条件`,
        `hash 阻断：${report.hash_blocked.length} 条件`,
        `无契约：${report.no_contract.length} 条件`, ''].join('\n');
}
