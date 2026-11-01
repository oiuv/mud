// Evidence reconciliation only: no driver, no rewriting of frozen series.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, newOutput } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';
import { digest, openSeries, readSamples } from './ledger.mjs';
import { schoolRelations } from './school_relations.mjs';
import { validateRecord } from './execution.mjs';
import { validateTeachingRecord } from './teaching_observation.mjs';
import { validateS1LearningRecord } from './school_s1_learning_cases.mjs';
import { reviewSeries } from './collection_review.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const objectPath = path => typeof path === 'string' ? path.replace(/^\//, '').replace(/\.(c|lpc)$/, '') : null;
const sourceKey = e => `${e.path}:${e.sha256}:${e.function}`;
const countBy = (rows, key) => rows.reduce((a, r) => (a[r[key]] = (a[r[key]] ?? 0) + 1, a), {});
const consumerFiles = ['teaching_crosswalk.mjs', 'teaching_observation.mjs', 'execution.mjs',
    'ledger.mjs', 'school_relations.mjs', 'collection_review.mjs', 'school_npc_grant_cases.mjs',
    'school_s1_learning_cases.mjs', 'probe_observation.mjs'];
const consumerHashes = Object.fromEntries(consumerFiles.map(name => [name,
    sha256(readFileSync(new URL(name, import.meta.url)))]));
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
    if (!entry || reference.smoke !== false || !reference.complete || !reference.passed) return;
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

async function inspectTeaching(directory, manifest, items) {
    const conditions = manifest.identity.conditions.filter(c => c.method === 'teaching');
    const rows = readSamples(directory, manifest), byId = new Map(conditions.map(c => [c.id, c]));
    const results = new Map(conditions.map(c => [c.id, { planned: c.samples, passed: 0, observed: 0,
        refused: 0, errors: [], references: [] }]));
    for (const row of rows.filter(r => byId.has(r.condition_id))) {
        const c = byId.get(row.condition_id), result = results.get(c.id);
        try {
            assert.ok(['observed', 'refused'].includes(row.outcome), 'error/N/A is not verified teaching');
            validateRecord(row.raw, c);
            if (c.parameters.teaching_profile === 'probe')
                throw new Error('discovery_only: 通用教学探测不作为已验收教学关联');
            if (c.parameters.teaching_profile === 's1-learning')
                // S1 ordinary learning now has its own strict contract: permission and
                // mark transitions, per-step proficiency and exact resource costs.
                validateS1LearningRecord(row.raw, c);
            else
                validateTeachingRecord(row.raw, c);
            result.passed++; result[row.outcome]++;
            result.references.push({ index: row.index, raw_sha256: row.raw_sha256 });
        } catch (e) { result.errors.push({ index: row.index, reason: e.message.slice(0,400) }); }
    }
    const summaries = [];
    for (const c of conditions) {
        const r = results.get(c.id), complete = r.passed === r.planned && r.errors.length === 0;
        const ref = { directory, fingerprint: manifest.fingerprint, condition: c.id, condition_sha256: digest(c),
            smoke: manifest.identity.execution.smoke ?? null, complete, ...r,
            ...(c.parameters.teaching_profile === 's1-learning' ? { contract: 's1_strict_consumer' } : {}) };
        linkTeaching(items, c, ref); summaries.push(ref);
    }
    return { directory, fingerprint: manifest.fingerprint, conditions: summaries };
}

export async function reconcileTeaching(evidenceRoot, baseline) {
    const inventory = json(join(baseline, 'inventory.json')), catalog = json(join(baseline, 'catalog.json'));
    const relations = schoolRelations(inventory, catalog);
    const items = crosswalkItems(relations), inputs = [], inspected = [], rejected = [];
    // Validate every indexed source version before claiming a current-source crosswalk.
    for (const path of new Set(items.map(i => i.source.path))) {
        const file = inventory.files.find(f => f.path === path);
        assert.equal(sha256(readFileSync(join(root,path))), file.sha256, `current source changed: ${path}`);
    }
    const searchRoots = [evidenceRoot, ...['preserve-temp-20261016', 'preserve-temp-20261024',
        'continuation-20261011T135158498Z', 'review-20261013-preserved', 'review-repair-20261021']
        .map(name => join(evidenceRoot,name)).filter(existsSync)];
    const dirs = searchRoots.flatMap(parent => readdirSync(parent, { withFileTypes: true })
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
                inspected.push(await inspectTeaching(directory, manifest, items));
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
    const finished = finalizeItems(items);
    const changedConsumers = consumerFiles.filter(name =>
        sha256(readFileSync(new URL(name, import.meta.url))) !== consumerHashes[name]);
    assert.equal(changedConsumers.length, 0, 'consumer changed during replay: ' + changedConsumers.join(','));
    return { format: 1, kind: 'teaching_evidence_crosswalk', baseline, evidence_root: evidenceRoot,
        consumer_hashes: consumerHashes, search_roots: searchRoots,
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
            'Injected can_perform + successful perform is effect evidence, never actual teacher acquisition.',
            'S1 ordinary learning records link only through their strict permission/proficiency/resource contract; older weak-consumer records stay unlinked.',
            'Unlinked under exact-entry matching only: it does not prove the data is absent everywhere, and it does not by itself justify bulk recollection.',
            'No aggregate distribution or full task acceptance is inferred from reference counts.'] };
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length,5,'Usage: node teaching_crosswalk.mjs EVIDENCE_ROOT BASELINE NEW_OUTPUT');
        const report = await reconcileTeaching(resolve(process.argv[2]),resolve(process.argv[3]));
        const output = newOutput(process.argv[4]);
        writeFileSync(join(output,'crosswalk.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
        writeFileSync(join(output,'crosswalk.md'),crosswalkMarkdown(report),{flag:'wx'});
        // Preserve byte copies of every frozen consumer alongside the report.
        mkdirSync(join(output,'consumer-snapshots'),{recursive:true});
        for (const name of consumerFiles)
            writeFileSync(join(output,'consumer-snapshots',name),
                readFileSync(new URL(name,import.meta.url)),{flag:'wx'});
        console.log(JSON.stringify({ output, sha256:sha256(readFileSync(join(output,'crosswalk.json'))),
            totals:report.totals, series:report.inputs.length, rejected:report.rejected.length }));
    } catch(e) { console.error(e.message); process.exitCode=1; }
}
