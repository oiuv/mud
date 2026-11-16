// Ground-truth counts for the current probe corpus: sample files = series+condition+slot
// dedup'd; outcomes parsed from each sample. Also reconcile coverage.json counts.
// Run from repo root. Output: tools/martial_summary/a61_probe_truth.json (committed deliverable).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const OUT = 'tools/martial_summary/a61_probe_truth.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const SERIES = ['perform-probe-formal-20261103-v4', 'perform-probe-formal-20261103-v5',
    'perform-probe-formal-20261104-v6', 'perform-probe-formal-20261109-gapfill',
    'perform-probe-formal-20261109-gapfill2', 'perform-probe-formal-20261109-gapfill3',
    'perform-probe-formal-20261114-chousui', 'perform-probe-formal-20261114-gapfill4',
    'perform-probe-formal-20261114-dispel', 'perform-probe-formal-20261115-gapfill5',
    'perform-probe-formal-20261115-gapfill6', 'perform-probe-formal-20261115-gapfill7'];
const rows = [];
for (const name of SERIES) {
    const dir = `${E}/${name}`;
    const files = readdirSync(`${dir}/samples`).filter(f => f.endsWith('.json'));
    const counts = { observed: 0, refused: 0, error: 0, not_applicable: 0 };
    const seen = new Set();
    let dup = 0;
    for (const f of files) {
        const s = json(`${dir}/samples/${f}`);
        counts[s.outcome] = (counts[s.outcome] ?? 0) + 1;
        const key = `${s.condition_id}.${s.index}`;
        if (seen.has(key)) dup++; seen.add(key);
    }
    const cov = existsSync(`${dir}/coverage.json`) ? json(`${dir}/coverage.json`) : null;
    const covCounts = { observed: 0, refused: 0, error: 0, not_applicable: 0, planned: 0, recorded: 0, missing: 0 };
    if (cov?.conditions) for (const c of cov.conditions) {
        covCounts.planned += c.planned ?? 0; covCounts.recorded += c.recorded ?? 0;
        covCounts.observed += c.counts?.observed ?? 0; covCounts.refused += c.counts?.refused ?? 0;
        covCounts.error += c.counts?.error ?? 0; covCounts.not_applicable += c.counts?.not_applicable ?? 0;
        covCounts.missing += (c.missing ?? []).length;
    }
    rows.push({ name, files: files.length, uniqueSlots: seen.size, dup, counts, covCounts });
    console.log(name, 'files:', files.length, 'dup:', dup, JSON.stringify(counts), '| cov:', JSON.stringify(covCounts));
}
const total = rows.reduce((a, r) => {
    a.files += r.files; a.uniqueSlots += r.uniqueSlots; a.dup += r.dup;
    for (const k of ['observed', 'refused', 'error', 'not_applicable']) a[k] += r.counts[k];
    for (const k of Object.keys(rows[0].covCounts)) a['cov_' + k] = (a['cov_' + k] ?? 0) + r.covCounts[k];
    return a;
}, { files: 0, uniqueSlots: 0, dup: 0, observed: 0, refused: 0, error: 0, not_applicable: 0 });
console.log('TOTAL', JSON.stringify(total));
writeFileSync(OUT, JSON.stringify({ rows, total }, null, 1));
