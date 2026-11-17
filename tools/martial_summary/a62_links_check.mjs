// 6.2 集成审查：采集交付文档的相对链接与关键外部证据路径检查。
// 从仓库根目录运行：node tools/martial_summary/a62_links_check.mjs
// 只读检查；缺路径如实报告并以非零退出，不用跳过制造通过。
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { migrated_reference, evidence_exists } from './evidence_reference.mjs';
const E = 'C:/tools/msys64/home/oiuv/mud-evidence/martial-data';
const DOCS = [
    'docs/reviews/2026-11-15-6.1-three-layer-summary-final.md',
    'docs/reviews/2026-11-16-6.1-self-audit.md',
    'docs/reviews/2026-11-17-6.1-codex-closeout.md',
    'docs/reviews/2026-11-17-6.2-final-integration-review.md',
    'docs/reviews/2026-11-15-5.3-codex-closeout.md',
    'openspec/changes/archive/2026-11-18-collect-martial-arts-dataset/tasks.md',
];
let miss = 0, links = 0;
for (const f of DOCS) {
    const doc = readFileSync(f, 'utf8');
    for (const m of doc.matchAll(/\]\(([^)]+)\)/g)) {
        const l = m[1];
        if (/^https?:/.test(l)) continue;
        links++;
        const target = resolve(dirname(f), l.replace(/#.*$/, ''));
        if (!existsSync(target)) { console.log('MISS-LINK', f, '->', l); miss++; }
    }
}
// 关键外部证据路径；通配符须有实际匹配，历史说明不冒充已迁移路径。
const refs = new Set();
for (const f of DOCS) {
    const doc = readFileSync(f, 'utf8');
    for (const m of doc.matchAll(/(?:^|[^A-Za-z0-9_.])((?:E|temp)\/[A-Za-z0-9_.\-/*{},]+)/g)) refs.add(m[1]);
}
let emiss = 0, migrated = 0, historical = 0;
for (const r of refs) {
    // 只有显式登记且目标存在的条目才称为已迁移。
    const relocation=migrated_reference(r);
    if (relocation) {
        console.log(relocation.status,r,'->',relocation.target);
        if(relocation.status==='MISSING')emiss++;
        else if(relocation.status==='MIGRATED')migrated++;
        else historical++;
        continue;
    }
    const p = r.startsWith('E/') ? E + '/' + r.slice(2) : r;
    if (/[*{]/.test(p)) {
        // 验证至少一个实际匹配；具体槽位的语义另由原件检查负责。
        if (!evidence_exists(p)) { console.log('MISS-EVIDENCE-GLOB', r); emiss++; }
        continue;
    }
    if (!existsSync(p)) { console.log('MISS-EVIDENCE', r); emiss++; }
}
console.log('relative links:', links, 'missing:', miss, '| evidence refs:', refs.size, 'missing:', emiss, '| migrated-verified:', migrated, '| historical-only:',historical);
console.log(miss + emiss === 0 ? 'LINKS/EVIDENCE PASS' : 'LINKS/EVIDENCE FAIL');
process.exit(miss + emiss ? 1 : 0);
