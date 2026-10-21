// A separate, current-consumer report; original series files remain immutable.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { reviewDefinitions, reviewSeries, reviewToolHashes, summarizeSeriesCoverage } from './tests/martial_data/collection_review.mjs';

export async function main(args) {
    if (args.includes('--help') || args.length === 0) {
        console.log('Usage: node tools/review_martial_data.mjs [--out NEW.json] SERIES_DIR ...');
        console.log('Read-only replay of B1-B29, slices, combinations and registered school bouts; no driver or new samples.');
        console.log('Reports missing/error/N/A separately; exits 1 for incomplete or failed evidence. --out never overwrites.');
        return;
    }
    let output;
    const directories = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--out') {
            if (output || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error('Expected one new output path');
            output = resolve(args[++i]);
        } else if (args[i].startsWith('--')) throw new Error(`Unknown option: ${args[i]}`);
        else directories.push(resolve(args[i]));
    }
    if (!directories.length || new Set(directories).size !== directories.length)
        throw new Error('Supply distinct series directories');
    const root = fileURLToPath(new URL('../', import.meta.url));
    const report = { format: 1, node: process.version, created: new Date().toISOString(),
        tool_sha256: reviewToolHashes(root), definitions: await reviewDefinitions(), series: [],
        limitation: 'Replay plus formal slot union, not full 4.2 acceptance. Execution cohorts and smoke remain separate.' };
    for (const directory of directories) {
        console.error(`Reviewing ${directory}`);
        try { report.series.push(await reviewSeries(directory)); }
        catch (error) { report.series.push({ directory, complete: false, integrity_error: error.message }); }
    }
    report.coverage = summarizeSeriesCoverage(report.series);
    const text = JSON.stringify(report, null, 2) + '\n';
    if (output) writeFileSync(output, text, { flag: 'wx' });
    else console.log(text);
    for (const s of report.series)
        console.error(`${s.complete ? 'PASS' : 'INCOMPLETE'} ${s.directory}: ${s.passed ?? 0}/${s.replayed ?? 0} replay, ${s.missing_samples ?? '?'} missing, ${s.pending?.length ?? '?'} pending, ${s.integrity_error ?? ''}`);
    if (report.series.some(s => !s.complete)) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url)
    main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
