// Build the 4.3 acceptance package: a per-declaration coverage-disposition
// table for all teaching declarations, pulling exact links, observation-level
// re-anchors, single-listed gaps and collection candidates from the crosswalk /
// reconcile / attribution outputs. Documentation only: no collection, no
// rewriting of frozen evidence, no acceptance decision.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput, root as repoRoot } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const countBy = (rows, key) => rows.reduce((a, r) => (a[r[key]] = (a[r[key]] ?? 0) + 1, a), {});

const sourceCache = new Map();
function sourceLiveness(item) {
    if (!item?.source?.path) return {};
    let text;
    if (sourceCache.has(item.source.path)) text = sourceCache.get(item.source.path);
    else {
        try { text = readFileSync(join(repoRoot, item.source.path), 'utf8'); } catch { text = ''; }
        sourceCache.set(item.source.path, text);
    }
    const name = item.function ?? '';
    const occurrences = name ? text.split(name).length - 1 : 0;
    const routed = occurrences > 1;
    const fn_class = frameworkFns.test(name) ? 'framework_callback' : 'routed_topic';
    let statement = '';
    try { statement = text.slice(item.source.start, item.source.end).replace(/\s+/g, ' ').trim(); } catch {}
    return { source_statement: statement.slice(0, 240), function_references_in_file: occurrences,
        routed_in_file: routed, fn_class, fn_name: name, self_path: item.source.path,
        ...repoWideReferences(name, join(repoRoot, item.source.path)) };
}

const frameworkFns = /^(attempt_apprentice|accept_apprentice|recognize_apprentice|permit_recruit|valid_)/;
const repoRefCache = new Map();
function repoWideReferences(fnName, selfPath) {
    if (!fnName) return { repo_references: 0 };
    if (repoRefCache.has(fnName)) return repoRefCache.get(fnName);
    const out = { repo_references: 0, reference_files: [] };
    const walk = dir => {
        let entries = [];
        try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
            if (e.name === '.git' || e.name === 'fluffos' || e.name === 'node_modules'
                || e.name === 'www' || e.name === 'ai') continue;
            const full = join(dir, e.name);
            if (e.isDirectory()) { walk(full); continue; }
            if (!/\.(c|h|lpc)$/.test(e.name)) continue;
            try {
                const body = readFileSync(full, 'utf8');
                const n = body.split(fnName).length - 1;
                if (n > 0) {
                    out.repo_references += n;
                    if (full !== selfPath && out.reference_files.length < 8)
                        out.reference_files.push(full.replace(repoRoot, '').replace(/^[\/]/, ''));
                }
            } catch {}
        }
    };
    walk(repoRoot);
    repoRefCache.set(fnName, out);
    return out;
}

function livenessDisposition(live, hadFlowChecks, fnName) {
    if (frameworkFns.test(fnName ?? ''))
        return hadFlowChecks
            ? '框架回调（learn/apprentice 命令外部调用，文件内无引用属正常）：决定性观察缺失，定点补该闸口分支观察或经核实后不适用留证'
            : '框架回调（命令机械外部调用）：定点补招收/learn 流观察，或经核实后不适用留证';
    if (live.routed_in_file)
        return hadFlowChecks
            ? 'ask 类函数在教师文件内有引用/路由但决定性观察缺失：定点补该话题观察，或经核实后不适用留证'
            : 'ask 类函数在教师文件内有引用/路由（活跃话题）：定点补采该话题教学，或经核实后不适用留证';
    const wide = repoWideReferences(live.fn_name, live.self_path);
    if (wide.repo_references <= 1 && (!wide.reference_files || !wide.reference_files.length))
        return 'ask 类函数仓库级仅定义无引用：死配置已核实（无任何外部路由），按不适用处置留证，不排新采';
    return 'ask 类函数文件内无路由但仓库级有引用（' + (wide.reference_files ?? []).join(', ') + '）：外部路由待核，定点补采或有依据处置';
}

export function buildAcceptancePack(crosswalkPath, reconcilePath, attributionPath) {
    const crosswalk = json(crosswalkPath);
    const reconcile = json(reconcilePath);
    const attribution = json(attributionPath);
    const recById = new Map(reconcile.items.map(i => [i.id, i]));
    const attById = new Map(attribution.items.map(i => [i.id, i]));
    const items = crosswalk.items.map(item => {
        const rec = recById.get(item.id) ?? {};
        const att = attById.get(item.id) ?? {};
        const row = { id: item.id, kind: item.kind, teacher: item.teacher, group: item.group,
            function: item.function, grant: item.grant };
        if (item.teaching?.length) {
            row.coverage = 'formal_teaching_linked';
            row.evidence = item.teaching.slice(0, 3).map(r => ({
                series: r.directory?.split(/[\\/]/).at(-1), condition: r.condition, complete: r.complete }));
        } else if (item.status === 'npc_initialization_not_player_teaching') {
            row.coverage = 'npc_initialization_disposition';
            row.evidence = [];
        } else if (item.status === 'unresolved_source_requires_review') {
            row.coverage = 'static_anomaly_disposition';
            row.evidence = [{ note: 'MA-003/004 配置异常登记，见问题台账与归属重叠页' }];
        } else if (att.observation_check === 'verified_by_flow_records') {
            row.coverage = 'formal_teaching_linked';
            row.evidence = [{ ...att.observation_match, link_type: 'flow_evidence_reanchor' }];
        } else if (att.observation_check) {
            row.coverage = 'single_listed_gap';
            row.evidence = {
                checked: ['message_strings', 'master_state_transitions', 'recruit_flow_extension'],
                flow_refs: (att.flow_refs ?? []).slice(0, 3),
                gate_strings_checked: att.gate_strings_checked,
                ...sourceLiveness(item),
            };
            row.disposition = '决定性观察缺失，纳入定点补采批次补该闸口分支观察；'
                + livenessDisposition(sourceLiveness(item), true, item.function);
        } else if (att.attribution === 'topic_not_in_curriculum') {
            row.coverage = 'targeted_collection_candidate';
            row.evidence = { ...sourceLiveness(item), alternative_anchor_functions: rec.alternative_anchor_functions?.slice(0, 6) };
            row.disposition = '话题缺口：同教师其他话题已有教学条件，本话题不在课程清单；'
                + livenessDisposition(row.evidence, false, item.function);
        } else if (att.attribution === 'flow_not_exercised') {
            row.coverage = 'targeted_collection_candidate';
            row.evidence = { ...sourceLiveness(item), alternative_anchor_functions: rec.alternative_anchor_functions?.slice(0, 6) };
            row.disposition = '流缺口：闸口类无招收/learn 流条件；'
                + livenessDisposition(row.evidence, false, item.function);
        } else if (rec.disposition === 'alternative_anchor_review') {
            row.coverage = 'alternative_anchor_pending';
            row.evidence = { alternative_anchor_functions: rec.alternative_anchor_functions?.slice(0, 6) };
            row.disposition = '替代锚点证据待语句归属核对';
        } else {
            row.coverage = 'targeted_collection_candidate';
            row.evidence = sourceLiveness(item);
            row.disposition = rec.disposition === 'learning_layer_evidence'
                ? '学习层证据在案，声明模型未覆盖；' + livenessDisposition(sourceLiveness(item), false, item.function)
                : livenessDisposition(sourceLiveness(item), false, item.function);
        }
        return row;
    });
    return {
        format: 1, kind: 'teaching_acceptance_pack',
        sources: { crosswalk: crosswalkPath, crosswalk_sha256: sha256(readFileSync(crosswalkPath)),
            reconcile: reconcilePath, reconcile_sha256: sha256(readFileSync(reconcilePath)),
            attribution: attributionPath, attribution_sha256: sha256(readFileSync(attributionPath)) },
        totals: { items: items.length, coverage: countBy(items, 'coverage') },
        items,
        limitations: [
            '本包为 4.3 验收材料（覆盖处置表），不是验收决定；勾选与 5.1 申请仍待维护者确认。',
            'formal_teaching_linked 含 flow_evidence_reanchor（闸口原句在流记录中原样出现，经观察内容级核实后换锚关联）。',
            'single_listed_gap 已按”决定性观察缺失即单列”原则处置，纳入定点补采批次补该闸口分支观察。',
            'targeted_collection_candidate 属批量补采范围，执行计划见 audit-43-teaching-collection-plan-20261031-v1。',
        ],
    };
}

export function acceptanceMarkdown(report) {
    const c = report.totals.coverage;
    const lines = ['# 4.3 验收材料包：声明覆盖处置表', '',
        `来源：crosswalk \`${report.sources.crosswalk}\`（SHA \`${report.sources.crosswalk_sha256}\`）、`
        + `reconcile \`${report.sources.reconcile_sha256}\`、attribution \`${report.sources.attribution_sha256}\`。`, '',
        '## 覆盖处置统计', '',
        '| 覆盖处置 | 条目数 |', '| --- | ---: |',
        '| formal_teaching_linked | ' + (c.formal_teaching_linked ?? 0) + ' |',
        '| single_listed_gap | ' + (c.single_listed_gap ?? 0) + ' |',
        '| targeted_collection_candidate | ' + (c.targeted_collection_candidate ?? 0) + ' |',
        '| alternative_anchor_pending | ' + (c.alternative_anchor_pending ?? 0) + ' |',
        '| npc_initialization_disposition | ' + (c.npc_initialization_disposition ?? 0) + ' |',
        '| static_anomaly_disposition | ' + (c.static_anomaly_disposition ?? 0) + ' |', '',
        '逐条索引见同目录 acceptance.json（每条含证据指针与处置建议）。', '',
        ...report.limitations.map(s => '- ' + s), ''];
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 6,
            'Usage: node teaching_acceptance_pack.mjs CROSSWALK_JSON RECONCILE_JSON ATTRIBUTION_JSON NEW_OUTPUT');
        const report = buildAcceptancePack(resolve(process.argv[2]), resolve(process.argv[3]), resolve(process.argv[4]));
        const output = newOutput(process.argv[5]);
        writeFileSync(join(output, 'acceptance.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'acceptance.md'), acceptanceMarkdown(report), { flag: 'wx' });
        mkdirSync(join(output, 'consumer-snapshots'), { recursive: true });
        writeFileSync(join(output, 'consumer-snapshots', 'teaching_acceptance_pack.mjs'),
            readFileSync(new URL(import.meta.url)), { flag: 'wx' });
        console.log(JSON.stringify({ output, sha256: sha256(readFileSync(join(output, 'acceptance.json'))),
            totals: report.totals }));
    } catch (e) { console.error(e.message); process.exitCode = 1; }
}
