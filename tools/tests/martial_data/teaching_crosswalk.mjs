// Evidence reconciliation only: no driver, no rewriting of frozen series.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, newOutput } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';
import { digest, openSeries, readSamples } from './ledger.mjs';
import { schoolRelations } from './school_relations.mjs';
import { validateRecord } from './execution.mjs';
import { reviewSeries, reviewToolHashes, validatorFor } from './collection_review.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const objectPath = path => typeof path === 'string' ? path.replace(/^\//, '').replace(/\.(c|lpc)$/, '') : null;
const sourceKey = e => `${e.path}:${e.sha256}:${e.function}`;
const countBy = (rows, key) => rows.reduce((a, r) => (a[r[key]] = (a[r[key]] ?? 0) + 1, a), {});
export function teachingProcessComplete(runs) {
    return runs.some(r => r.process?.code === 0 && r.process?.signal === null
        && (r.validation_errors === 0 || Array.isArray(r.validation_errors) && r.validation_errors.length === 0)
        && r.incomplete_bytes === 0);
}
export const legacyPendingSkills = [
    'feifeng-bian', 'qiantian-zhi', 'yuezhao-gong', 'qingliang-daxuefa', 'fengmo-zhang',
    'fumo-zhang', 'xunlei-jian', 'kunlun-jian', 'wuliang-jian', 'yunhe-jian',
    'longcheng-shendao', 'douzhuan-xingyi', 'qixing-quan', 'guyue-chan', 'feixing-shu',
    'xueshan-dao', 'kuimang-dao', 'zuixian-bu',
];

export function crosswalkItems(relations) {
    return relations.objects.flatMap(o => [
        ...o.gates.map(g => ({ kind: 'gate', teacher: o.path, group: o.group,
            function: g.function, source: { ...g.evidence, text: undefined }, grant: null })),
        ...o.grants.map(g => ({ kind: 'grant', teacher: o.path, group: o.group,
            function: g.function, role: g.role, grant: g.grant,
            source: { ...g.evidence, text: undefined }, entries: g.entries,
            authorization_reads: g.authorization_reads, resolution: g.resolution })),
    ].map(r => ({ ...r, id: `${r.kind}:${o.path}:${r.source.path}:${r.source.start}`,
        teaching: [], effect: [] })));
}

// Exact function + teacher + source version, not matching a skill name anywhere.
export function linkTeaching(items, condition, reference) {
    const p = condition.parameters, entry = p.teaching_entry;
    if (p.teaching_profile === 'probe') return; // Discovery does not prove the declared callback/lesson was reached.
    if (!entry || reference.smoke !== false || reference.process_complete !== true
        || !reference.complete || !reference.passed) return;
    for (const item of items) {
        if (objectPath(item.teacher) !== objectPath(p.teacher?.path)
            || sourceKey({ ...item.source, function: item.function }) !== sourceKey(entry)) continue;
        // A function-level observation links its gate, not every grant in that function.
        if (item.kind === 'gate') item.teaching.push(reference);
        else {
            const e = p.teaching_evidence;
            if (e?.path === item.source.path && e.sha256 === item.source.sha256
                && e.start === item.source.start && e.end === item.source.end
                && p.monitored_grants?.includes(item.grant)) item.teaching.push(reference);
        }
    }
}

export function linkEffect(items, condition, reference, catalog) {
    if (reference.smoke !== false || !reference.complete || !reference.passed_observed) return;
    const p = condition.parameters, ability = p.ability_source;
    const skill = catalog.skills.find(s => s.path === ability?.path);
    if (!skill || skill.sha256 !== ability.sha256) return;
    const key = `can_perform/${p.skill}/${p.ability}`;
    for (const item of items.filter(i => i.kind === 'grant' && i.grant === key)) {
        if (!item.authorization_reads.some(e => e.path === ability.path && e.sha256 === ability.sha256)) continue;
        item.effect.push({ ...reference, evidence_kind: 'preconfigured_grant_perform_not_teacher_acquisition' });
    }
}

// A historical message match is only a candidate. Re-anchor a gate after the
// complete original condition passes, using a message unique within that NPC.
export function verifyTeachingFlowGate(item, condition, reference, rows, source, literal) {
    assert.equal(item.kind, 'gate', 'flow messages cannot prove a grant statement');
    assert.ok(reference.smoke === false && reference.process_complete === true
        && reference.complete === true && reference.passed > 0, 'flow condition is not verified formal teaching');
    assert.equal(reference.condition, condition.id, 'flow reference identifies another condition');
    assert.equal(reference.condition_sha256, digest(condition), 'flow condition identity changed');
    const p = condition.parameters;
    assert.notEqual(p.teaching_profile, 'probe', 'generic discovery is not teaching acceptance');
    assert.equal(objectPath(p.teacher.path), objectPath(item.teacher));
    assert.equal(p.teaching_entry.path, item.source.path);
    assert.equal(p.teaching_entry.sha256, item.source.sha256);
    assert.equal(sha256(source), item.source.sha256, 'flow source changed');
    assert.ok(typeof literal === 'string' && literal.length >= 6 && /[一-鿿]/.test(literal),
        'missing distinctive source message');
    const body = source.slice(item.source.start, item.source.end);
    assert.ok(body.includes(literal), 'message is not in the claimed gate source');
    assert.ok(!(source.slice(0, item.source.start) + source.slice(item.source.end)).includes(literal),
        'message is ambiguous outside the claimed gate');
    assert.equal(rows.length, condition.samples, 'flow raw records are incomplete');
    const commands = new Set([p.action, ...(p.teaching_expectations ?? []).map(e => e.action)]);
    const matches = [];
    for (const row of rows) {
        assert.equal(row.condition_id, condition.id);
        for (const step of row.raw.teaching ?? []) {
            const text = (step.messages ?? []).map(m => m.text ?? '').join('\n');
            if (!text.includes(literal)) continue;
            assert.equal(step.teacher_program, p.teacher.path);
            assert.ok(step.teacher === p.teacher.path || (step.teacher?.startsWith(p.teacher.path)
                && /^#\d+$/.test(step.teacher.slice(p.teacher.path.length))), 'invalid original teacher identity');
            assert.equal(step.student, row.raw.before[0].object);
            assert.equal(step.student, row.raw.after[0].object);
            assert.ok(commands.has(step.command), 'message from an undeclared command');
            if (item.function === 'recognize_apprentice') assert.ok(step.command.startsWith('learn '));
            if (item.function === 'attempt_apprentice') assert.ok(step.command.startsWith('apprentice '));
            matches.push({ index: row.index, raw_sha256: row.raw_sha256, command: step.command });
        }
    }
    assert.ok(matches.length, 'no original step contains the gate message');
    return { ...reference, link_type: 'unique_gate_message_in_verified_flow',
        matched_string: literal, matching_records: matches,
        limitation: 'Observed gate route only; not every branch and not teacher grant acquisition.' };
}

export function finalizeItems(items) {
    return items.map(item => ({ ...item,
        status: item.role === 'npc_initial_grant' ? 'npc_initialization_not_player_teaching'
            : item.teaching.length ? 'formal_teaching_linked_branch_coverage_not_claimed'
            : item.kind === 'grant' && item.resolution === 'unresolved' ? 'unresolved_source_requires_review'
                : item.effect.length ? 'effect_only_teacher_acquisition_open' : 'no_verified_formal_teaching_link',
    }));
}

export function crosswalkSummary(items) {
    const gates = items.filter(i => i.kind === 'gate'), grants = items.filter(i => i.kind === 'grant');
    return { gates: { total: gates.length, statuses: countBy(gates, 'status') },
        grants: { total: grants.length, statuses: countBy(grants, 'status') },
        teaching_linked: items.filter(i => i.teaching.length).length,
        remaining: items.filter(i => !i.teaching.length).length,
        all_have_formal_teaching_reference: items.length > 0 && items.every(i => i.teaching.length > 0),
        // Function-linked refusal or an unexecuted branch is not full acquisition acceptance.
        task_acceptance: 'not_inferred_from_reference_counts' };
}

export function crosswalkMarkdown(report) {
    const lines = ['# 教师与教学证据逐条台账', '',
        '只统计本轮明确根目录中可校验的证据。功能原文定位、声明关联和真实教学效果分开；未关联不等于全盘没有证据，也不自动视为不适用。', '',
        `源码指纹：\`${report.source_fingerprint}\`。`, '',
        `资格函数 ${report.totals.gates.total}；授权声明 ${report.totals.grants.total}；`
            + `有关联的正式教学条目 ${report.totals.teaching_linked}；尚无该关联 ${report.totals.remaining}。`, '',
        '## 逐条条目', '',
        '| 稳定 ID | 类型 | 教师 | 来源行 | 函数／领悟键 | 当前状态 | 教学条件关联 | 预置领悟绝招关联 |',
        '| --- | --- | --- | ---: | --- | --- | ---: | ---: |'];
    for (const i of report.items) lines.push(`| ${i.id} | ${i.kind} | ${i.teacher} | ${i.source.line} | ${i.grant ?? i.function} | ${i.status} | ${i.teaching.length} | ${i.effect.length} |`);
    lines.push('', '## 历史“23个待采技能”表复核', '',
        '历史表实际列出18个不同技能；不能将23个授权缺口、技能种类和绝招入口当作同一分母。', '',
        '| 技能 | 当前授权声明 | 有正式教学关联 | 有预置领悟绝招关联 |', '| --- | ---: | ---: | ---: |');
    for (const r of report.legacy_pending) lines.push(`| ${r.skill} | ${r.declarations.length} | ${r.declarations.filter(i => i.teaching.length).length} | ${r.declarations.filter(i => i.effect.length).length} |`);
    lines.push('', '预置领悟绝招关联不证明该教师已实际传授；无perform入口也不证明技能没有其他应测能力。', '',
        '全部条件指纹、系列版本、样本编号／原件hash、当前重验失败和完整拒绝原因索引见同目录crosswalk.json。', '',
        ...report.limitations.map(s => '- ' + s), '');
    return lines.join('\n');
}

export function teachingReuseSelection(crosswalk, successfulDirectory) {
    const selected = new Map();
    for (const item of crosswalk.items) {
        const candidates = (item.teaching ?? []).filter(r => r.smoke === false && r.complete
            && r.passed > 0 && successfulDirectory(r.directory))
            .sort((a, b) => Number(b.observed > 0) - Number(a.observed > 0)
                || a.planned - b.planned || a.condition.localeCompare(b.condition));
        const ref = candidates[0];
        if (!ref) continue;
        if (!selected.has(ref.directory)) selected.set(ref.directory, new Set());
        selected.get(ref.directory).add(ref.condition);
    }
    return Object.fromEntries([...selected].map(([directory, ids]) => [directory, [...ids].sort()]));
}

async function inspectTeaching(directory, manifest, items, conditionIds) {
    const wanted = conditionIds && new Set(conditionIds);
    const conditions = manifest.identity.conditions.filter(c => c.method === 'teaching'
        && (!wanted || wanted.has(c.id)));
    if (wanted) assert.equal(conditions.length, wanted.size, '所选教学条件不完整或含非教学条目');
    const runsDir = join(directory, 'runs');
    const runs = existsSync(runsDir) ? readdirSync(runsDir).flatMap(name => {
        const file = join(runsDir, name, 'result.json');
        return existsSync(file) ? [{ attempt: name, ...json(file) }] : [];
    }) : [];
    const process_complete = teachingProcessComplete(runs);
    // Preserve selection metadata without repeatedly replaying known non-formal attempts.
    if (manifest.identity.execution.smoke !== false || !process_complete)
        return { directory, fingerprint: manifest.fingerprint, process_complete,
            replay: 'not_formal_or_no_successful_process', conditions: [] };
    const rows = readSamples(directory, manifest, { conditionIds }), byId = new Map(conditions.map(c => [c.id, c]));
    const entries = new Set(manifest.entries.map(e => sourceKey(e)));
    const results = new Map(conditions.map(c => [c.id, { planned: c.samples, passed: 0, observed: 0,
        refused: 0, errors: [], references: [] }]));
    const validators = new Map();
    for (const c of conditions) validators.set(c.id, await validatorFor(c));
    for (const row of rows.filter(r => byId.has(r.condition_id))) {
        const c = byId.get(row.condition_id), result = results.get(c.id);
        try {
            assert.ok(['observed', 'refused'].includes(row.outcome), 'error/N/A is not verified teaching');
            const entry = c.parameters.teaching_entry;
            assert.ok(entry && entries.has(sourceKey(entry)),
            'teaching entry is not in the frozen source identity');
            validateRecord(row.raw, c);
            if (c.parameters.teaching_profile === 'probe')
                throw new Error('discovery_only: 通用教学探测不作为已验收教学关联');
            validators.get(c.id)(row.raw, c);
            result.passed++; result[row.outcome]++;
            result.references.push({ index: row.index, raw_sha256: row.raw_sha256 });
        } catch (e) { result.errors.push({ index: row.index, reason: e.message.slice(0,400) }); }
    }
    const summaries = [];
    for (const c of conditions) {
        const r = results.get(c.id), complete = r.passed === r.planned && r.errors.length === 0;
        const ref = { directory, fingerprint: manifest.fingerprint, condition: c.id, condition_sha256: digest(c),
            smoke: manifest.identity.execution.smoke ?? null, process_complete, complete, ...r,
            ...(c.parameters.teaching_profile === 's1-learning' ? { contract: 's1_strict_consumer' } : {}) };
        linkTeaching(items, c, ref); summaries.push(ref);
    }
    return { directory, fingerprint: manifest.fingerprint, process_complete, conditions: summaries };
}

export async function reconcileTeaching(evidenceRoot, baseline,
    { directories, conditionSelections, flowCandidates = [] } = {}) {
    const consumerHashes = reviewToolHashes(root);
    const inventory = json(join(baseline, 'inventory.json')), catalog = json(join(baseline, 'catalog.json'));
    const relations = schoolRelations(inventory, catalog);
    const items = crosswalkItems(relations), inputs = [], inspected = [], rejected = [], flowReviews = [];
    // Validate every indexed source version before claiming a current-source crosswalk.
    for (const path of new Set(items.map(i => i.source.path))) {
        const file = inventory.files.find(f => f.path === path);
        assert.equal(sha256(readFileSync(join(root,path))), file.sha256, `current source changed: ${path}`);
    }
    const searchRoots = [evidenceRoot, ...['preserve-temp-20261016', 'preserve-temp-20261024',
        'continuation-20261011T135158498Z', 'review-20261013-preserved', 'review-repair-20261021']
        .map(name => join(evidenceRoot,name)).filter(existsSync)];
    const dirs = directories ?? searchRoots.flatMap(parent => readdirSync(parent, { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => join(parent,d.name))).sort();
    for (const directory of dirs) {
        if (!existsSync(join(directory, 'series.json'))) continue;
        try {
            // Parse only to select candidates. openSeries performs integrity validation afterwards.
            const candidate = json(join(directory,'series.json'));
            const cs = candidate.identity?.conditions ?? [];
            if (!cs.some(c => c.method === 'teaching' || c.parameters?.collection_group === 'b30-perform')) continue;
            const manifest = openSeries(directory);
            inputs.push({ directory, fingerprint: manifest.fingerprint,
                manifest_sha256: sha256(readFileSync(join(directory,'series.json'))),
                smoke: manifest.identity.execution.smoke ?? null });
            if (cs.some(c => c.method === 'teaching')) {
                const result = await inspectTeaching(directory, manifest, items, conditionSelections?.[directory]);
                inspected.push(result);
                const proposals = flowCandidates.filter(p => p.observation_match?.series === directory.split(/[\\/]/).at(-1));
                for (const proposal of proposals) {
                    try {
                        const item = items.find(i => i.id === proposal.id);
                        assert.ok(item && item.teacher === proposal.teacher && item.function === proposal.function,
                            'flow proposal does not identify the current gate');
                        const id = proposal.observation_match.condition;
                        const condition = manifest.identity.conditions.find(c => c.id === id);
                        const ref = result.conditions.find(c => c.condition === id);
                        assert.ok(condition && ref, 'flow condition not selected for complete replay');
                        const rows = readSamples(directory, manifest, { conditionIds: [id] });
                        const link = verifyTeachingFlowGate(item, condition, ref, rows,
                            readFileSync(join(root, item.source.path), 'utf8'), proposal.observation_match.matched_string);
                        item.teaching.push(link);
                        flowReviews.push({ id: item.id, verified: true, reference: link });
                    } catch (e) {
                        flowReviews.push({ id: proposal.id, verified: false, reason: e.message.slice(0,400) });
                    }
                }
            } else {
                const r = await reviewSeries(directory);
                inspected.push({ directory, fingerprint: r.fingerprint, replay: {
                    planned: r.planned, recorded: r.recorded, passed: r.passed, complete: r.complete,
                    failures: r.failures, pending: r.pending, missing_samples: r.missing_samples } });
                for (const c of manifest.identity.conditions) {
                    const cr = r.conditions.find(x => x.id === c.id);
                    linkEffect(items,c,{ directory, fingerprint: r.fingerprint, condition: c.id,
                        condition_sha256: digest(c), smoke: r.smoke, complete: r.complete,
                        passed_observed: cr.passed_observed, passed_refused: cr.passed_refused },catalog);
                }
            }
            console.log(JSON.stringify({ reviewed: directory.split(/[\\/]/).at(-1), smoke: manifest.identity.execution.smoke }));
        } catch(e) { rejected.push({ directory, reason:e.message.slice(0,500) }); }
    }
    for (const proposal of flowCandidates)
        if (!flowReviews.some(r => r.id === proposal.id))
            flowReviews.push({ id: proposal.id, verified: false, reason: 'candidate series outside selected range' });
    const finished = finalizeItems(items);
    const afterHashes = reviewToolHashes(root);
    const changedConsumers = [...new Set([...Object.keys(consumerHashes), ...Object.keys(afterHashes)])]
        .filter(name => consumerHashes[name] !== afterHashes[name]);
    assert.equal(changedConsumers.length, 0, 'consumer changed during replay: ' + changedConsumers.join(','));
    return { format: 1, kind: 'teaching_evidence_crosswalk', baseline, evidence_root: evidenceRoot,
        consumer_hashes: consumerHashes, search_roots: searchRoots, directories: dirs,
        condition_selections: conditionSelections ?? null,
        flow_candidates: flowCandidates, flow_reviews: flowReviews,
        source_fingerprint: inventory.source_fingerprint, relation_totals: relations.totals,
        totals: crosswalkSummary(finished), inputs, rejected, inspected, items: finished,
        unresolved: relations.unresolved,
        legacy_pending: legacyPendingSkills.map(skill => ({ skill,
            declarations: finished.filter(i => i.kind === 'grant' && i.grant?.startsWith(`can_perform/${skill}/`))
                .map(i => ({ id:i.id, teacher:i.teacher, grant:i.grant, status:i.status,
                    teaching:i.teaching.map(r => ({ directory:r.directory,condition:r.condition })), effect:i.effect })) })),
        limitations: ['Only immediate children of the explicit search roots (evidence root and named preservation containers) were searched; no disk-wide recursive scan.',
            'Missing legacy Temp directories were not reconstructed. Rejected, partial and smoke evidence is not formal teaching.',
            'Gate linkage is source/function linkage, not proof of every branch or callback being reached.',
            'Smoke and attempts without a successful complete process are selected but not replayed or promoted to formal teaching.',
            'Injected can_perform + successful perform is effect evidence, never actual teacher acquisition.',
            'S1 ordinary learning records link only through their strict permission/proficiency/resource contract; older weak-consumer records stay unlinked.',
            'Flow re-anchors require complete validated formal conditions and a gate message unique within the exact current teacher source. Ambiguous messages remain unlinked.',
            'Unlinked under exact-entry matching only: it does not prove the data is absent everywhere, and it does not by itself justify bulk recollection.',
            'No aggregate distribution or full task acceptance is inferred from reference counts.'] };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.ok(process.argv.length >= 5,'Usage: node teaching_crosswalk.mjs EVIDENCE_ROOT BASELINE NEW_OUTPUT [SERIES_DIR ...]');
        const args = process.argv.slice(5);
        let conditionSelections;
        let flowCandidates;
        if (args[0] === '--selection') {
            assert.ok(args.length === 2 || args.length === 4, '--selection requires one JSON file');
            conditionSelections = json(resolve(args[1]));
            assert.ok(conditionSelections && typeof conditionSelections === 'object' && !Array.isArray(conditionSelections));
            assert.ok(Object.keys(conditionSelections).length, 'empty selection must not trigger a whole-root scan');
            for (const ids of Object.values(conditionSelections))
                assert.ok(Array.isArray(ids) && ids.length && ids.every(id => typeof id === 'string' && id)
                    && new Set(ids).size === ids.length, 'selection requires nonempty unique condition IDs');
            if (args.length === 4) {
                assert.equal(args[2], '--flow-candidates');
                flowCandidates = json(resolve(args[3])).items.filter(i => i.observation_check === 'verified_by_flow_records');
            }
        }
        const directories = conditionSelections ? Object.keys(conditionSelections) : args.map(p => resolve(p));
        const report = await reconcileTeaching(resolve(process.argv[2]),resolve(process.argv[3]),
            directories.length ? { directories, conditionSelections, flowCandidates } : {});
        const output = newOutput(process.argv[4]);
        writeFileSync(join(output,'crosswalk.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
        writeFileSync(join(output,'crosswalk.md'),crosswalkMarkdown(report),{flag:'wx'});
        // Preserve byte copies of every frozen consumer alongside the report.
        mkdirSync(join(output,'consumer-snapshots'),{recursive:true});
        for (const [name, hash] of Object.entries(report.consumer_hashes)) {
            const bytes = readFileSync(join(root, name));
            assert.equal(sha256(bytes), hash, 'consumer changed during preservation: ' + name);
            const target = join(output,'consumer-snapshots',name);
            mkdirSync(dirname(target), { recursive: true });
            writeFileSync(target,bytes,{flag:'wx'});
        }
        console.log(JSON.stringify({ output, sha256:sha256(readFileSync(join(output,'crosswalk.json'))),
            totals:report.totals, series:report.inputs.length, rejected:report.rejected.length }));
    } catch(e) { console.error(e.message); process.exitCode=1; }
}
