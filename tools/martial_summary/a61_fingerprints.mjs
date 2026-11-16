// Per-source_fingerprint corpus stats + cross-version consistency proof for
// the martial-arts sources (compare skill source sha256 in each series catalog).
// Run from repo root. Output: tools/martial_summary/a61_fingerprints.json (committed deliverable).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const OUT = 'tools/martial_summary/a61_fingerprints.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const dirs = readdirSync(E, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(`${E}/${d.name}/series.json`));
const byFp = {};
for (const d of dirs) {
    let s;
    try { s = json(`${E}/${d.name}/series.json`); } catch { continue; }
    const fp = s.identity.source_fingerprint;
    const g = byFp[fp] ??= { series: 0, conditions: 0, planned: 0, recorded: 0, sample_files: 0 };
    g.series++;
    try {
        const cov = json(`${E}/${d.name}/coverage.json`);
        for (const c of cov.conditions ?? []) {
            g.conditions++;
            g.planned += c.planned ?? 0;
            g.recorded += c.recorded ?? 0;
        }
    } catch {}
    try { g.sample_files += readdirSync(`${E}/${d.name}/samples`).length; } catch {}
}
console.log('fingerprint groups:');
for (const [fp, g] of Object.entries(byFp)) console.log(fp.slice(0, 12), JSON.stringify(g));
// Cross-version consistency: compare kungfu skill source hashes between catalogs
// of the minority fingerprint and the majority one.
const fps = Object.keys(byFp).sort((a, b) => byFp[b].series - byFp[a].series);
if (fps.length >= 2) {
    const major = fps[0], minor = fps[1];
    const skillHashes = fp => {
        const out = new Map();
        for (const d of dirs) {
            let s; try { s = json(`${E}/${d.name}/series.json`); } catch { continue; }
            if (s.identity.source_fingerprint !== fp) continue;
            const cp = `${E}/${d.name}/catalog.json`;
            if (!existsSync(cp)) continue;
            try {
                const cat = json(cp);
                for (const sk of cat.skills ?? [])
                    if (/^kungfu\/skill\//.test(sk.path) && sk.sha256 && !out.has(sk.id)) out.set(sk.id, sk.sha256);
            } catch {}
        }
        return out;
    };
    const A = skillHashes(major), B = skillHashes(minor);
    let same = 0, diff = [], onlyMinor = 0;
    for (const [id, h] of B) {
        if (!A.has(id)) { onlyMinor++; continue; }
        if (A.get(id) === h) same++; else diff.push(id);
    }
    console.log('cross-version: minor-snapshot kungfu skills compared:', B.size, '| identical hashes:', same, '| differing:', diff.length, '| only-in-minor:', onlyMinor);
    if (diff.length) console.log('differing skills:', diff.slice(0, 20).join(', '));
    writeFileSync(OUT, JSON.stringify({ byFp, cross: { major, minor, compared: B.size, same, diff, onlyMinor } }, null, 1));
} else {
    writeFileSync(OUT, JSON.stringify({ byFp }, null, 1));
}
