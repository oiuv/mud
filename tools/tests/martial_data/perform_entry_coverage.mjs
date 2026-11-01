// Read-only entry coverage: declarations, smoke and refusals are not formal effects.
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { newOutput, root } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';
import { digest, openSeries } from './ledger.mjs';
import { resolveEntryReference, reviewSeries, reviewToolHashes } from './collection_review.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const states = ['formal', 'smoke', 'refused_only', 'unverified', 'config_only', 'none'];
const key = e => `${e.path}:${e.sha256}:${e.function ?? e.kind}`;

export function classifyConditionEvidence(ref, { successfulExit, discovery }) {
    const complete = ref.recorded === ref.planned
        && ref.passed_observed + ref.passed_refused === ref.planned;
    if (complete && successfulExit && !discovery && ref.passed_observed > 0
        && typeof ref.smoke === 'boolean') return ref.smoke ? 'smoke' : 'formal';
    if (ref.passed_refused && !ref.passed_observed) return 'refused_only';
    return ref.recorded ? 'unverified' : 'config_only';
}

export function successfulProcessExit(run) {
    return run.process?.code === 0 && run.process.signal === null
        && (run.validation_errors === 0
            || (Array.isArray(run.validation_errors) && run.validation_errors.length === 0))
        && run.incomplete_bytes === 0;
}

function seriesDirectories(root) {
    const roots = [root, ...['preserve-temp-20261016', 'preserve-temp-20261024',
        'continuation-20261011T135158498Z', 'review-20261013-preserved', 'review-repair-20261021']
        .map(name => join(root, name)).filter(existsSync)];
    return [...new Set(roots.flatMap(parent => readdirSync(parent, { withFileTypes: true })
        .filter(d => d.isDirectory() && existsSync(join(parent, d.name, 'series.json')))
        .map(d => realpathSync(join(parent, d.name)))))].sort();
}

// options.directories bounds an audit; it never implies an all-root audit.
export async function buildPerformEntryCoverage(evidenceRoot, catalogPath, options = {}) {
    const consumerHashes = reviewToolHashes(root);
    const catalog = json(catalogPath);
    const entries = catalog.skills.flatMap(s => s.entries
        .filter(e => ['perform', 'exert'].includes(e.function))
        .map(e => ({ id: e.id, skill: s.id, kind: e.function, path: s.path, sha256: s.sha256,
            line: e.evidence?.line, coverage: 'none', evidence: [] })));
    const bySource = new Map(entries.map(e => [key(e), e]));
    const directories = options.directories ?? seriesDirectories(evidenceRoot);
    const diagnostics = [];
    let scanned = 0;
    for (const directory of directories) {
        let manifest, frozenCatalog;
        try {
            manifest = openSeries(directory);
            frozenCatalog = json(join(directory, 'catalog.json'));
            assert.equal(frozenCatalog.source_fingerprint, manifest.identity.source_fingerprint,
                '冻结目录与系列源码身份不一致');
        } catch (error) {
            diagnostics.push({ directory, reason: error.message });
            continue;
        }
        scanned++;
        const matched = manifest.identity.conditions.flatMap(c => {
            if (!['perform', 'exert'].includes(c.method)) return [];
            const entry = resolveEntryReference(c, frozenCatalog);
            const target = entry?.binding_valid !== false && entry && bySource.get(key(entry));
            if (!target) return [];
            if (!manifest.entries.some(e => e.id === entry.id && e.path === entry.path && e.sha256 === entry.sha256)) {
                diagnostics.push({ directory, condition: c.id, reason: '目录入口与冻结系列清单不一致' });
                return [];
            }
            const ref = { directory, condition: c.id, fingerprint: manifest.fingerprint,
                smoke: manifest.identity.execution.smoke ?? null, status: 'config_only',
                planned: c.samples, recorded: 0, passed_observed: 0, passed_refused: 0 };
            target.evidence.push(ref);
            return [{ condition: c, ref }];
        });
        if (!matched.length) continue;
        let review;
        try {
            review = await reviewSeries(directory);
            assert.equal(review.fingerprint, manifest.fingerprint, '复核期间系列身份改变');
        }
        catch (error) {
            for (const { ref } of matched) ref.status = 'unverified';
            diagnostics.push({ directory, reason: error.message });
            continue;
        }
        const successfulExit = review.runs.some(successfulProcessExit);
        const byId = new Map(review.conditions.map(c => [c.id, c]));
        for (const { condition, ref } of matched) {
            const checked = byId.get(condition.id);
            ref.recorded = checked.recorded_indices.length;
            ref.passed_observed = checked.passed_observed;
            ref.passed_refused = checked.passed_refused;
            const prefix = condition.id + '.';
            ref.validation_failures = review.failures.filter(f => f.slot.startsWith(prefix));
            ref.pending = review.pending.filter(f => f.slot.startsWith(prefix));
            ref.complete_condition = ref.recorded === ref.planned
                && ref.passed_observed + ref.passed_refused === ref.planned;
            ref.status = classifyConditionEvidence(ref,
                { successfulExit, discovery: condition.parameters.variant === 'probe' });
        }
    }
    for (const entry of entries) {
        entry.coverage = states.find(state => entry.evidence.some(ref => ref.status === state)) ?? 'none';
        entry.formal_count = entry.evidence.filter(ref => ref.status === 'formal').length;
        entry.smoke_count = entry.evidence.filter(ref => ref.status === 'smoke').length;
    }
    assert.equal(digest(reviewToolHashes(root)), digest(consumerHashes), '复核期间消费者文件改变，不能发布');
    return { format: 2, kind: 'perform_entry_coverage', consumer_hashes: consumerHashes,
        source: { catalog: resolve(catalogPath), catalog_sha256: sha256(readFileSync(catalogPath)) },
        scan: { directories, series_scanned: scanned, scope: options.directories ? 'explicit' : 'configured_roots' },
        totals: { entries: entries.length, coverage: Object.fromEntries(states
            .map(state => [state, entries.filter(e => e.coverage === state).length])) },
        entries, diagnostics,
        limitations: [
            'formal/smoke require source-matched ledger integrity, generic and dedicated replay, a complete condition and successful process exit.',
            'Refusals, generic probes, missing/invalid samples and unsupported consumers never establish formal effects.',
            'Entry touch is not acceptance of every callback, lifecycle, branch, school or the entire Goal.',
            'Unbound legacy references are not relabelled; diagnostics and the explicit search scope are preserved.',
        ] };
}

export function performCoverageMarkdown(report) {
    return ['# perform/exert 入口证据复核', '',
        `目录范围：${report.scan.directories.length}；有效清单：${report.scan.series_scanned}；诊断：${report.diagnostics.length}。`, '',
        '| 状态 | perform | exert | 合计 |', '| --- | ---: | ---: | ---: |',
        ...states.map(state => `| ${state} | ${report.entries.filter(e => e.kind === 'perform' && e.coverage === state).length} | ${report.entries.filter(e => e.kind === 'exert' && e.coverage === state).length} | ${report.totals.coverage[state]} |`),
        '', ...report.limitations.map(s => '- ' + s), ''].join('\n');
}

const isMain = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
const usage = 'Usage: node perform_entry_coverage.mjs EVIDENCE_ROOT CATALOG NEW_OUTPUT [SERIES_DIR ...]';
if (isMain && process.argv[2] === '--help') console.log(usage);
else if (isMain) {
    try {
        const [,, evidenceRoot, catalog, target, ...directories] = process.argv;
        if (!evidenceRoot || !catalog || !target) throw new Error(usage);
        const report = await buildPerformEntryCoverage(resolve(evidenceRoot), resolve(catalog),
            directories.length ? { directories: directories.map(d => resolve(d)) } : {});
        const output = newOutput(target);
        for (const [path, hash] of Object.entries(report.consumer_hashes)) {
            const bytes = readFileSync(join(root, path));
            assert.equal(sha256(bytes), hash, '消费者在副本保全前改变：' + path);
            const destination = join(output, 'consumer-snapshots', path);
            mkdirSync(dirname(destination), { recursive: true });
            writeFileSync(destination, bytes, { flag: 'wx' });
        }
        writeFileSync(join(output, 'perform-coverage.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'perform-coverage.md'), performCoverageMarkdown(report), { flag: 'wx' });
        console.log(JSON.stringify({ output, totals: report.totals, diagnostics: report.diagnostics.length }));
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
