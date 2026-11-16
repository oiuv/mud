// 6.1 three-layer statistics: dedup'd by series+condition+slot via collection-time
// coverage.json counts; planned/recorded/outcomes/missing per corpus and school group.
// Run from repo root. Output: tools/martial_summary/a61_stats.json (committed deliverable).
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const OUT = 'tools/martial_summary/a61_stats.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const dirs = readdirSync(E, { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(`${E}/${d.name}/series.json`));
const corpora = {}; // family -> aggregate
const schools = {};  // school prefix (from condition id) -> aggregate (school-combat only)
const seriesRows = [];
for (const d of dirs) {
    const dir = `${E}/${d.name}`;
    let s, cov;
    try { s = json(`${dir}/series.json`); } catch { continue; }
    try { cov = json(`${dir}/coverage.json`); } catch { cov = null; }
    const coll = s.identity.execution.collection ?? '?';
    const fam = /perform-probe/.test(d.name) ? 'probe-perform-exert'
        : /school-team/.test(d.name) ? 'school-team'
        : coll;
    const agg = corpora[fam] ??= { series: 0, conditions: 0, planned: 0, recorded: 0,
        observed: 0, refused: 0, error: 0, not_applicable: 0, missing: 0, sample_files: 0 };
    agg.series++;
    if (cov?.conditions) {
        for (const c of cov.conditions) {
            agg.conditions++;
            agg.planned += c.planned ?? 0;
            agg.recorded += c.recorded ?? 0;
            agg.observed += c.counts?.observed ?? 0;
            agg.refused += c.counts?.refused ?? 0;
            agg.error += c.counts?.error ?? 0;
            agg.not_applicable += c.counts?.not_applicable ?? 0;
            agg.missing += (c.missing ?? []).length;
            if (fam === 'school-combat') {
                const m = /^school-([a-z0-9]+)-/.exec(c.id);
                const key = m ? m[1] : 'other';
                const g = schools[key] ??= { series: new Set(), conditions: 0, planned: 0, recorded: 0, observed: 0, refused: 0, error: 0 };
                g.series.add(d.name); g.conditions++; g.planned += c.planned ?? 0; g.recorded += c.recorded ?? 0;
                g.observed += c.counts?.observed ?? 0; g.refused += c.counts?.refused ?? 0; g.error += c.counts?.error ?? 0;
            }
        }
    }
    try { agg.sample_files += readdirSync(`${dir}/samples`).length; } catch {}
    seriesRows.push({ dir: d.name, fam, coll, conditions: cov?.conditions?.length ?? s.identity.conditions.length });
}
for (const g of Object.values(schools)) g.series = g.series.size;
// catalog stats
const cat = json(`${E}/perform-probe-formal-20261103-v4/catalog.json`);
const roles = {};
for (const sk of cat.skills) for (const e of sk.entries) roles[e.role] = (roles[e.role] ?? 0) + 1;
// weapon usage per skill from parent source valid_enable literals
const weaponSet = ['axe', 'blade', 'club', 'dagger', 'hammer', 'pin', 'spear', 'staff', 'sword', 'throwing', 'whip', 'xsword'];
const weaponSkills = {};
let scanned = 0, unreadable = 0;
for (const sk of cat.skills) {
    const parent = 'kungfu/skill/' + sk.id.split('/')[0] + (sk.id.split('/').length === 1 ? '' : '');
    // parent source candidates
    let src = null;
    for (const cand of [`kungfu/skill/${sk.id.split('/')[0]}.c`, `kungfu/skill/${sk.id.split('/')[0]}.lpc`]) {
        if (existsSync(cand)) { try { src = readFileSync(cand, 'utf8'); break; } catch {} }
    }
    if (!src) { unreadable++; continue; }
    scanned++;
    const usages = new Set();
    for (const w of weaponSet) if (new RegExp('valid_enable[^}]{0,200}["\']' + w + '["\']').test(src) || src.includes('"' + w + '"')) {
        // conservative: usage literal appears near valid_enable context; refined below
    }
    // better: parse valid_enable body
    const body = /valid_enable\s*\([^)]*\)\s*\{([\s\S]*?)\}/.exec(src);
    if (body) for (const w of weaponSet) if (body[1].includes('"' + w + '"')) usages.add(w);
    const key = [...usages].sort().join('+') || (body ? 'other-usage' : 'no-valid_enable');
    weaponSkills[key] = (weaponSkills[key] ?? 0) + 1;
}
writeFileSync(OUT, JSON.stringify({ corpora, schools, catalog: { skills: cat.skills.length, roles, source_fingerprint: cat.source_fingerprint }, weaponSkills, scanned, unreadable, seriesRows }, null, 1));
console.log('corpora:', JSON.stringify(corpora, null, 1));
console.log('schools:', JSON.stringify(schools, null, 1));
console.log('catalog:', cat.skills.length, 'skills; roles:', JSON.stringify(roles));
console.log('weapon usage groups:', JSON.stringify(weaponSkills));
console.log('scanned parents:', scanned, 'unreadable:', unreadable);
