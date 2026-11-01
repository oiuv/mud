// Read-only per-item reconciliation for teaching declarations that the exact
// crosswalk could not link. It searches every preserved series for candidate
// originals under the exact and alternative entry anchors (same function with a
// historical source version, or the same grant key), and classifies each item:
//   has_candidate      - a formal or partial series references the exact entry
//   historical_version - same function referenced under another source version
//   grant_key_only     - the grant key is monitored elsewhere without the exact statement span
//   no_reference       - no reference under any anchor in the scanned scope
// It never proves data absence outside the scanned scope and never schedules
// collection; it only produces the reconciliation base for later disposition.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const objectPath = path => typeof path === 'string' ? path.replace(/^\//, '').replace(/\.(c|lpc)$/, '') : null;
const exactKey = (teacher, entry) => `${objectPath(teacher)}|${entry.path}|${entry.sha256}|${entry.function}`;
const fnKey = entry => `${entry.path}|${entry.function}`;
const countBy = (rows, key) => rows.reduce((a, r) => (a[r[key]] = (a[r[key]] ?? 0) + 1, a), {});

export function reconcileTeachingGaps(evidenceRoot, crosswalkPath) {
    const crosswalk = json(crosswalkPath);
    const searchRoots = [evidenceRoot, ...['preserve-temp-20261016', 'preserve-temp-20261024',
        'continuation-20261011T135158498Z', 'review-20261013-preserved', 'review-repair-20261021']
        .map(name => join(evidenceRoot, name)).filter(existsSync)];
    const dirs = searchRoots.flatMap(parent => readdirSync(parent, { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => join(parent, d.name))).sort();
    const exactRefs = new Map(), fnRefs = new Map(), grantRefs = new Map();
    const entryFunctionsByPath = new Map(), learnGrantTeachers = new Set();
    let seriesScanned = 0, seriesWithEntries = 0;
    for (const directory of dirs) {
        if (!existsSync(join(directory, 'series.json'))) continue;
        let manifest;
        try { manifest = json(join(directory, 'series.json')); } catch { continue; }
        seriesScanned++;
        let touched = false;
        for (const c of manifest.identity?.conditions ?? []) {
            const p = c.parameters ?? {};
            const entry = p.teaching_entry;
            const smoke = manifest.identity.execution?.smoke ?? null;
            const ref = { series: directory.split(/[\\/]/).at(-1), condition: c.id, smoke,
                method: c.method ?? null, samples: c.samples ?? null, entry: entry ?? null,
                monitored_grants: p.monitored_grants ?? [], teaching_evidence: p.teaching_evidence ?? null,
                evidence: p.teaching_evidence ?? null };
            if (entry) {
                touched = true;
                const push = (map, key) => { if (!map.has(key)) map.set(key, []); map.get(key).push(ref); };
                push(exactRefs, exactKey(p.teacher?.path, entry));
                push(fnRefs, fnKey(entry));
            }
            if (entry) {
                if (!entryFunctionsByPath.has(entry.path)) entryFunctionsByPath.set(entry.path, new Set());
                entryFunctionsByPath.get(entry.path).add(entry.function);
            }
            for (const grant of p.monitored_grants ?? []) {
                touched = true;
                if (!grantRefs.has(grant)) grantRefs.set(grant, []);
                grantRefs.get(grant).push(ref);
                if (grant.startsWith('can_learn/') && entry) learnGrantTeachers.add(entry.path);
            }
        }
        if (touched) seriesWithEntries++;
    }
    const items = crosswalk.items.map(item => {
        const record = { id: item.id, kind: item.kind, teacher: item.teacher, group: item.group,
            function: item.function, grant: item.grant, status: item.status };
        if (item.teaching?.length || item.status === 'npc_initialization_not_player_teaching'
            || item.status === 'unresolved_source_requires_review') {
            record.category = item.teaching?.length ? 'already_linked' : 'prior_disposition';
            record.disposition = item.teaching?.length ? 'already_linked' : 'prior_disposition';
            return record;
        }
        const exact = exactRefs.get(
            `${objectPath(item.teacher)}|${item.source.path}|${item.source.sha256}|${item.function}`) ?? [];
        const historical = (fnRefs.get(`${item.source.path}|${item.function}`) ?? [])
            .filter(r => r.entry.sha256 !== item.source.sha256);
        const grantKeyed = item.kind === 'grant' ? (grantRefs.get(item.grant) ?? []).filter(r => {
            const e = r.teaching_evidence;
            return !(e && e.path === item.source.path && e.sha256 === item.source.sha256
                && e.start === item.source.start && e.end === item.source.end);
        }) : [];
        record.exact_entry_refs = exact.map(r => ({ series: r.series, condition: r.condition, smoke: r.smoke }));
        record.statement_span_refs = exact.filter(r => r.evidence
            && r.evidence.path === item.source.path && r.evidence.sha256 === item.source.sha256
            && r.evidence.start === item.source.start && r.evidence.end === item.source.end)
            .map(r => ({ series: r.series, condition: r.condition, smoke: r.smoke }));
        record.historical_version_refs = historical.slice(0, 20).map(r => ({ series: r.series,
            condition: r.condition, smoke: r.smoke, entry_sha256: r.entry.sha256 }));
        record.grant_key_refs = grantKeyed.slice(0, 20).map(r => ({ series: r.series, condition: r.condition, smoke: r.smoke }));
        record.category = exact.length ? 'has_candidate'
            : historical.length ? 'historical_version'
                : grantKeyed.length ? 'grant_key_only' : 'no_reference';
        // Disposition taxonomy: evidence under a different entry anchor on the same
        // teacher file is a metadata-linkage gap, not a missing original.
        const alt = [...(entryFunctionsByPath.get(item.source.path) ?? [])].filter(fn => fn !== item.function);
        record.alternative_anchor_functions = alt;
        record.disposition = item.teaching?.length ? 'already_linked'
            : item.status === 'npc_initialization_not_player_teaching' ? 'prior_disposition'
                : alt.length ? 'alternative_anchor_review'
                    : (learnGrantTeachers.has(item.source.path) ? 'learning_layer_evidence' : 'true_no_evidence');
        return record;
    });
    const teachersWithEvidence = new Set(items.filter(i => i.category !== 'no_reference').map(i => i.teacher));
    const noRef = items.filter(i => i.category === 'no_reference');
    const noRefTeachers = new Set(noRef.map(i => i.teacher));
    const groupCounts = countBy(noRef, 'group');
    const disposition = {
        no_reference_items: noRef.length,
        no_reference_teachers: noRefTeachers.size,
        teachers_with_sibling_evidence: [...noRefTeachers].filter(t => teachersWithEvidence.has(t)).length,
        teachers_without_any_reference: [...noRefTeachers].filter(t => !teachersWithEvidence.has(t)).length,
        no_reference_by_group: Object.fromEntries(Object.entries(groupCounts).sort((a, b) => b[1] - a[1])),
        candidates_with_statement_span: items.filter(i => i.category === 'has_candidate'
            && (i.statement_span_refs ?? []).length > 0).length,
        candidates_function_level_only: items.filter(i => i.category === 'has_candidate'
            && !(i.statement_span_refs ?? []).length).length,
    };
    return {
        format: 1, kind: 'teaching_gap_reconciliation', disposition,
        crosswalk: crosswalkPath, crosswalk_sha256: sha256(readFileSync(crosswalkPath)),
        evidence_root: evidenceRoot, search_roots: searchRoots,
        scan: { series_scanned: seriesScanned, series_with_entries: seriesWithEntries,
            exact_entry_keys: exactRefs.size, function_keys: fnRefs.size, grant_keys: grantRefs.size },
        totals: { items: items.length, categories: countBy(items, 'category'),
            dispositions: countBy(items, 'disposition') },
        items,
        limitations: [
            '候选引用按条件入口锚点统计，含烟雾/未完成系列；有候选不等于已通过正式验收。',
            'no_reference 只表示扫描范围内无任何入口锚点引用，不证明其他位置或学习层没有数据。',
            '本工具不启动采集、不改写原件；补采范围须在逐项处置判定后另行确认。',
        ],
    };
}

export function reconcileMarkdown(report) {
    const lines = ['# 教学未关联项逐项对账', '',
        `来源：\`${report.crosswalk}\`（JSON SHA256 \`${report.crosswalk_sha256}\`）。`
        + `扫描范围：证据根目录及具名保全容器直属子目录（${report.scan.series_scanned} 个系列）。`, '',
        '## 分类统计', '',
        '| 分类 | 条目数 | 含义 |', '| --- | ---: | --- |',
        '| already_linked | ' + (report.totals.categories.already_linked ?? 0) + ' | 已有正式教学关联 |',
        '| prior_disposition | ' + (report.totals.categories.prior_disposition ?? 0) + ' | NPC 自用或未解析已有处置 |',
        '| has_candidate | ' + (report.totals.categories.has_candidate ?? 0) + ' | 精确入口存在候选原件（含烟雾/未完成，待按正式口径核） |',
        '| historical_version | ' + (report.totals.categories.historical_version ?? 0) + ' | 同函数有其他源码版本的原件 |',
        '| grant_key_only | ' + (report.totals.categories.grant_key_only ?? 0) + ' | 仅授权键被监控、无精确语句跨度 |',
        '| no_reference | ' + (report.totals.categories.no_reference ?? 0) + ' | 扫描范围内无任何入口锚点引用 |', '',
        '完整逐条索引见同目录 reconcile.json。', '',
        ...report.limitations.map(s => '- ' + s), ''];
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 5,
            'Usage: node teaching_gap_reconcile.mjs EVIDENCE_ROOT CROSSWALK_JSON NEW_OUTPUT');
        const report = reconcileTeachingGaps(resolve(process.argv[2]), resolve(process.argv[3]));
        const output = newOutput(process.argv[4]);
        writeFileSync(join(output, 'reconcile.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'reconcile.md'), reconcileMarkdown(report), { flag: 'wx' });
        console.log(JSON.stringify({ output, sha256: sha256(readFileSync(join(output, 'reconcile.json'))),
            totals: report.totals, scan: report.scan }));
    } catch (e) { console.error(e.message); process.exitCode = 1; }
}
