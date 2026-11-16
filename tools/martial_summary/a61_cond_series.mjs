// 条件→系列索引（probe 正式 12 系列）：同一条件 ID 跨系列出现（补采/取代对）时
// primary 取系列名最新者，also 列出其余系列；供报告引用抽查定位。
// Run from repo root. Output: tools/martial_summary/a61_cond_series.json (committed deliverable).
import { readFileSync, writeFileSync } from 'node:fs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const OUT = 'tools/martial_summary/a61_cond_series.json';
const json = p => JSON.parse(readFileSync(p, 'utf8'));
const SERIES = ['perform-probe-formal-20261103-v4', 'perform-probe-formal-20261103-v5',
    'perform-probe-formal-20261104-v6', 'perform-probe-formal-20261109-gapfill',
    'perform-probe-formal-20261109-gapfill2', 'perform-probe-formal-20261109-gapfill3',
    'perform-probe-formal-20261114-chousui', 'perform-probe-formal-20261114-gapfill4',
    'perform-probe-formal-20261114-dispel', 'perform-probe-formal-20261115-gapfill5',
    'perform-probe-formal-20261115-gapfill6', 'perform-probe-formal-20261115-gapfill7'];
const seen = new Map(); // condition -> [series...]
for (const name of SERIES) {
    const cov = json(`${E}/${name}/coverage.json`);
    for (const c of cov.conditions ?? []) {
        const list = seen.get(c.id) ?? [];
        list.push(name);
        seen.set(c.id, list);
    }
}
const out = {};
for (const [id, list] of seen) {
    const sorted = [...new Set(list)].sort(); // 字典序，新系列名在后
    out[id] = { primary: sorted[sorted.length - 1], also: sorted.slice(0, -1) };
}
writeFileSync(OUT, JSON.stringify(out, null, 1));
let dup = 0;
for (const v of Object.values(out)) if (v.also.length) dup++;
console.log('conditions:', Object.keys(out).length, '| cross-series duplicated:', dup);
