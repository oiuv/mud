// Read-only statement-level attribution review for declarations whose exact
// entry anchor has no teaching record but whose teacher file carries
// alternative-anchored evidence. Two attribution checks:
//   span_attribution     - some condition's teaching_evidence span lies inside the
//                          declaration's own source span (the condition exercised
//                          a statement within this very function/statement)
//   flow_evidence        - recruit/learn command flows exist for the same teacher
//                          (apprentice/learn actions; gates reached through those
//                          commands like recognize_apprentice/attempt_apprentice)
//   topic_not_in_curriculum / flow_not_exercised - no attribution found in scope
// It never triggers collection and never rewrites originals.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput, root as repoRoot } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const objectPath = path => typeof path === 'string' ? path.replace(/^\//, '').replace(/\.(c|lpc)$/, '') : null;
const countBy = (rows, key) => rows.reduce((a, r) => (a[r[key]] = (a[r[key]] ?? 0) + 1, a), {});

export function reviewAttribution(evidenceRoot, crosswalkPath, reconcilePath) {
    const crosswalk = json(crosswalkPath);
    const reconcile = json(reconcilePath);
    const reviewSet = reconcile.items.filter(i => i.disposition === 'alternative_anchor_review');
    const byId = new Map(crosswalk.items.map(i => [i.id, i]));
    const searchRoots = [evidenceRoot, ...['preserve-temp-20261016', 'preserve-temp-20261024',
        'continuation-20261011T135158498Z', 'review-20261013-preserved', 'review-repair-20261021']
        .map(name => join(evidenceRoot, name)).filter(existsSync)];
    const dirs = searchRoots.flatMap(parent => readdirSync(parent, { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => join(parent, d.name))).sort();
    const spansByPath = new Map(), flowsByPath = new Map();
    const dirBySeries = new Map(dirs.map(d => [basename(d), d]));
    let seriesScanned = 0;
    for (const directory of dirs) {
        if (!existsSync(join(directory, 'series.json'))) continue;
        let manifest;
        try { manifest = json(join(directory, 'series.json')); } catch { continue; }
        seriesScanned++;
        for (const c of manifest.identity?.conditions ?? []) {
            const p = c.parameters ?? {};
            const entry = p.teaching_entry, evidence = p.teaching_evidence;
            if (entry && evidence && typeof evidence.start === 'number') {
                const key = entry.path;
                if (!spansByPath.has(key)) spansByPath.set(key, []);
                spansByPath.get(key).push({ start: evidence.start, end: evidence.end,
                    entry_function: entry.function, condition: c.id,
                    series: basename(directory) });
            }
            const actions = (p.teaching_expectations ?? []).map(e => e.action ?? '')
                .concat(p.action ? [p.action] : []);
            const recruitFlow = ['recruit', 'apprenticeship', 'ordination'].includes(p.teaching_kind)
                || /recruit|tonsure|apprentice/.test(p.teaching_profile ?? '');
            if (actions.some(a => /^apprentice |^learn /.test(a)) || recruitFlow) {
                const key = (p.teacher?.path ? objectPath(p.teacher.path) + '.c' : entry?.path) ?? '';
                if (key) {
                    if (!flowsByPath.has(key)) flowsByPath.set(key, []);
                    flowsByPath.get(key).push({ condition: c.id,
                        series: basename(directory),
                        actions: actions.filter(a => /^apprentice |^learn /.test(a)),
                        kind: recruitFlow ? 'recruit_flow' : 'command_flow' });
                }
            }
        }
    }
    // Distinctive source strings of each gate (message literals) for observation matching.
    const gateStrings = record => {
        const item = byId.get(record.id);
        try {
            const src = readFileSync(join(repoRoot, item.source.path), 'utf8');
            const body = src.slice(item.source.start, item.source.end);
            return body.split('"').filter((_, i) => i % 2 === 1)
                .filter(s => s.length >= 6 && /[一-鿿]/.test(s));
        } catch { return []; }
    };
    const textCache = new Map();
    const sampleTexts = flow => {
        const cacheKey = flow.series + '|' + flow.condition;
        if (textCache.has(cacheKey)) return textCache.get(cacheKey);
        const dir = dirBySeries.get(flow.series);
        const texts = [];
        if (dir) {
            try {
                const sampleDir = join(dir, 'samples');
                if (existsSync(sampleDir)) {
                    for (const f of readdirSync(sampleDir)) {
                        if (!f.startsWith(flow.condition + '.')) continue;
                        try {
                            const rec = json(join(sampleDir, f));
                            for (const t of rec.raw?.teaching ?? [])
                                for (const msg of t.messages ?? []) texts.push(msg.text ?? '');
                            for (const msg of rec.raw?.messages ?? []) texts.push(msg.text ?? '');
                        } catch {}
                    }
                }
            } catch {}
        }
        textCache.set(cacheKey, texts);
        return texts;
    };
    const stateCache = new Map();
    const flowStateSnapshots = flow => {
        const cacheKey = 'state|' + flow.series + '|' + flow.condition;
        if (stateCache.has(cacheKey)) return stateCache.get(cacheKey);
        const dir = dirBySeries.get(flow.series);
        const snaps = [];
        if (dir) {
            try {
                const sampleDir = join(dir, 'samples');
                for (const f of readdirSync(sampleDir)) {
                    if (!f.startsWith(flow.condition + '.')) continue;
                    try {
                        const rec = json(join(sampleDir, f));
                        for (const t of rec.raw?.teaching ?? []) {
                            const before = t.before ?? {}, after = t.after ?? {};
                            snaps.push({ before: { master_id: before.master_id, master_name: before.master_name },
                                after: { master_id: after.master_id, master_name: after.master_name } });
                        }
                    } catch {}
                }
            } catch {}
        }
        stateCache.set(cacheKey, snaps);
        return snaps;
    };
    const items = reviewSet.map(record => {
        const item = byId.get(record.id);
        const spans = spansByPath.get(item.source.path) ?? [];
        const inside = spans.filter(s => s.start >= item.source.start && s.end <= item.source.end);
        const flows = flowsByPath.get(item.source.path) ?? [];
        const out = { id: record.id, kind: record.kind, teacher: item.teacher, group: record.group,
            function: item.function, declaration: item.grant, disposition: record.disposition };
        if (inside.length) {
            out.attribution = 'span_attribution';
            out.span_refs = inside.slice(0, 10);
        } else if (flows.length && ['recognize_apprentice', 'attempt_apprentice', 'accept_apprentice',
            'permit_recruit', 'ask_for_join', 'ask_for_quit'].some(n => (item.function || '').startsWith(n))) {
            out.attribution = 'flow_evidence';
            out.flow_refs = flows.slice(0, 10);
            // Observation-level anchor check: the gate's own message strings must
            // appear in the flow records' observations to propose re-anchoring.
            const strings = gateStrings(record).map(s => {
                let core = s;
                for (const verb of ['say ', 'tell ', 'shout ', 'exclaim ', 'reply ', 'ask '])
                    if (core.startsWith(verb)) { core = core.slice(verb.length); break; }
                const nl = String.fromCharCode(92) + 'n';
                return core.split(nl)[0].trim();
            }).filter(s => s.length >= 6);
            let matched = null;
            for (const flow of flows) {
                for (const text of sampleTexts(flow)) {
                    const hit = strings.find(s => text.includes(s));
                    if (hit) { matched = { series: flow.series, condition: flow.condition, matched_string: hit }; break; }
                }
                if (matched) break;
            }
            if (matched) {
                out.observation_check = 'verified_by_flow_records';
                out.observation_match = matched;
            } else {
                // Behavior-level fallback: recruitment/state transitions in the flow
                // records also count as gate-effect coverage (e.g. attempt_apprentice
                // success shows as a master/family transition in the same records).
                let stateHit = null;
                for (const flow of flows) {
                    for (const snap of flowStateSnapshots(flow)) {
                        const changed = snap.after.master_id !== snap.before.master_id
                            || snap.after.master_name !== snap.before.master_name;
                        if (changed && (snap.after.master_id || snap.after.master_name)) {
                            stateHit = { series: flow.series, condition: flow.condition,
                                master_id: snap.after.master_id, master_name: snap.after.master_name };
                            break;
                        }
                    }
                    if (stateHit) break;
                }
                out.observation_check = stateHit ? 'covered_by_flow_state'
                    : 'flow_records_present_behavior_unverified';
                if (stateHit) out.observation_match = stateHit;
            }
            out.gate_strings_checked = strings.length;
        } else {
            out.attribution = (item.function || '').startsWith('ask_') || (item.function || '').startsWith('accept_')
                ? 'topic_not_in_curriculum' : 'flow_not_exercised';
        }
        return out;
    });
    return {
        format: 1, kind: 'teaching_attribution_review',
        crosswalk: crosswalkPath, crosswalk_sha256: sha256(readFileSync(crosswalkPath)),
        reconcile: reconcilePath, reconcile_sha256: sha256(readFileSync(reconcilePath)),
        evidence_root: evidenceRoot, search_roots: searchRoots,
        scan: { series_scanned: seriesScanned, teacher_paths_with_spans: spansByPath.size,
            teacher_paths_with_flows: flowsByPath.size },
        totals: { items: items.length, attributions: countBy(items, 'attribution'),
            observation_checks: countBy(items.filter(i => i.observation_check), 'observation_check') },
        items,
        limitations: [
            'span_attribution 表示候选条件的语句跨度落在声明范围内，是归属核对候选；须再核观察内容方可换锚关联。',
            'flow_evidence 表示同教师存在 apprentice/learn 命令流条件，是闸口类声明的天然原件线索；不等于该闸口分支已全覆盖。',
            'topic_not_in_curriculum / flow_not_exercised 只表示扫描范围内无归属线索，不证明其他位置没有。',
            '本工具不启动采集、不改写原件。',
        ],
    };
}

export function attributionMarkdown(report) {
    const t = report.totals.attributions;
    const lines = ['# 教学声明语句归属核对', '',
        `来源：\`${report.crosswalk}\`（SHA \`${report.crosswalk_sha256}\`）、`
        + `\`${report.reconcile}\`（SHA \`${report.reconcile_sha256}\`）。扫描 ${report.scan.series_scanned} 个系列。`, '',
        '## 归属统计', '',
        '| 归属 | 条目数 |', '| --- | ---: |',
        '| span_attribution | ' + (t.span_attribution ?? 0) + ' |',
        '| flow_evidence | ' + (t.flow_evidence ?? 0) + ' |',
        '| topic_not_in_curriculum | ' + (t.topic_not_in_curriculum ?? 0) + ' |',
        '| flow_not_exercised | ' + (t.flow_not_exercised ?? 0) + ' |', '',
        '完整逐条索引见同目录 attribution.json。', '',
        ...report.limitations.map(s => '- ' + s), ''];
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 6,
            'Usage: node teaching_attribution_review.mjs EVIDENCE_ROOT CROSSWALK_JSON RECONCILE_JSON NEW_OUTPUT');
        const report = reviewAttribution(resolve(process.argv[2]), resolve(process.argv[3]), resolve(process.argv[4]));
        const output = newOutput(process.argv[5]);
        writeFileSync(join(output, 'attribution.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'attribution.md'), attributionMarkdown(report), { flag: 'wx' });
        mkdirSync(join(output, 'consumer-snapshots'), { recursive: true });
        writeFileSync(join(output, 'consumer-snapshots', 'teaching_attribution_review.mjs'),
            readFileSync(new URL(import.meta.url)), { flag: 'wx' });
        console.log(JSON.stringify({ output, sha256: sha256(readFileSync(join(output, 'attribution.json'))),
            totals: report.totals, scan: report.scan }));
    } catch (e) { console.error(e.message); process.exitCode = 1; }
}
