// Build the targeted-collection execution plan for the verified 699 candidates:
// group by school/teacher/entry kind, assign batch series and sample counts per
// the established sampling rules (deterministic gates 2, random-progress 100,
// smoke 2), and estimate totals. Planning only: no collection is started.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { sha256 } from './inventory.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));

// Sampling rule mirrors the established matrix: deterministic refusals/gates 2,
// random-progress dialog outcomes 100. Ask dialogs with teach_pfm grants have
// random skill-growth observations → 100; pure refusal gates → 2.
function samplesFor(fnName, kind) {
    if (kind === 'single_listed_gap') return 2;
    if (/^(attempt_apprentice|accept_apprentice|recognize_apprentice|permit_recruit)/.test(fnName ?? ''))
        return 2;
    return 100;
}

export function buildCollectionPlan(acceptancePath) {
    const pack = json(acceptancePath);
    const candidates = pack.items.filter(i =>
        i.coverage === 'targeted_collection_candidate' || i.coverage === 'single_listed_gap');
    const batches = new Map();
    for (const item of candidates) {
        const group = item.group ?? 'unknown';
        if (!batches.has(group)) batches.set(group, []);
        const samples = samplesFor(item.function, item.coverage);
        batches.get(group).push({
            declaration: item.id,
            kind: item.kind,
            function: item.function,
            grant: item.grant,
            coverage: item.coverage,
            samples,
            plan_condition: /^(attempt_apprentice|accept_apprentice|recognize_apprentice|permit_recruit)/.test(item.function ?? '')
                ? `recruit-flow observation on ${item.teacher}`
                : `ask-topic lesson on ${item.teacher} (${item.function})`,
            disposition_hint: item.disposition,
        });
    }
    const groupPlans = [...batches.entries()].sort((a, b) => b[1].length - a[1].length)
        .map(([group, rows]) => ({
            group,
            declarations: rows.length,
            formal_samples: rows.reduce((n, r) => n + r.samples, 0),
            smoke_samples: rows.length * 2,
            entry_kind: rows.every(r => /recruit-flow/.test(r.plan_condition)) ? 'recruit_flow'
                : rows.every(r => /ask-topic/.test(r.plan_condition)) ? 'ask_topic' : 'mixed',
            rows,
        }));
    return {
        format: 1,
        kind: 'teaching_collection_plan',
        source: { acceptance: acceptancePath, acceptance_sha256: sha256(readFileSync(acceptancePath)) },
        sampling_rule: {
            deterministic_gate: 2,
            random_progress_dialog: 100,
            smoke: 2,
            note: '随机进度话题 100（技能增长分布）、确定性闸口 2、烟雾每条件 2；沿既有矩阵规则，不改旧条件身份。',
        },
        totals: {
            batches: groupPlans.length,
            declarations: groupPlans.reduce((n, g) => n + g.declarations, 0),
            formal_samples: groupPlans.reduce((n, g) => n + g.formal_samples, 0),
            smoke_samples: groupPlans.reduce((n, g) => n + g.smoke_samples, 0),
        },
        batches: groupPlans,
        limitations: [
            '本计划为定点补采执行方案（分批/条件/样本量），不启动任何采集。',
            '执行前提：维护者确认补采范围与批次；确认前不生成驱动输入、不启动系列。',
            '样本量沿既有规则；个别条件若属随机进度/确定性之别由维护者确认时调整。',
            '计划不改写旧条件身份，不将计划数当覆盖率。',
        ],
    };
}

export function planMarkdown(report) {
    const t = report.totals;
    const lines = ['# 4.3 定点补采执行计划', '',
        `来源：\`${report.source.acceptance}\`（SHA \`${report.source.acceptance_sha256}\`）。`, '',
        '## 采样规则', '',
        `- 确定性闸口（招收/认徒/许可类）：每条件 ${report.sampling_rule.deterministic_gate} 条`,
        `- 随机进度话题（授技对话）：每条件 ${report.sampling_rule.random_progress_dialog} 条`,
        `- 烟雾：每条件 ${report.sampling_rule.smoke} 条`, '',
        '## 总量', '',
        `| 批次（按门派分组） | 声明数 | 正式样本 | 烟雾样本 |`, '| --- | ---: | ---: | ---: |',
        ...report.batches.map(b => `| ${b.group}（${b.entry_kind}） | ${b.declarations} | ${b.formal_samples} | ${b.smoke_samples} |`),
        `| **合计** | **${t.declarations}** | **${t.formal_samples}** | **${t.smoke_samples}** |`, '',
        '逐条条件与处置建议见同目录 plan.json。', '',
        ...report.limitations.map(s => '- ' + s), ''];
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 4, 'Usage: node teaching_collection_plan.mjs ACCEPTANCE_JSON NEW_OUTPUT');
        const report = buildCollectionPlan(resolve(process.argv[2]));
        const output = newOutput(process.argv[3]);
        writeFileSync(join(output, 'plan.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
        writeFileSync(join(output, 'plan.md'), planMarkdown(report), { flag: 'wx' });
        mkdirSync(join(output, 'consumer-snapshots'), { recursive: true });
        writeFileSync(join(output, 'consumer-snapshots', 'teaching_collection_plan.mjs'),
            readFileSync(new URL(import.meta.url)), { flag: 'wx' });
        console.log(JSON.stringify({ output, sha256: sha256(readFileSync(join(output, 'plan.json'))),
            totals: report.totals }));
    } catch (e) { console.error(e.message); process.exitCode = 1; }
}
