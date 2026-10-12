// Read-only evidence report: recording an unchanged bad state is not a game pass.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { sha256 } from './inventory.mjs';
import { validateRecord } from './execution.mjs';
import { schoolTeamConditions, validateSchoolTeamRecord, teamEffects } from './school_team_cases.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const key = row => row.condition_id + '.' + row.index;

export function readSchoolTeam(directory) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory), conditions = manifest.identity.conditions;
    assert.equal(manifest.identity.execution.collection, 'school-team');
    assert.equal(manifest.identity.execution.smoke, false, '烟雾不能冒充完整重复');
    const catalog = json(join(directory, 'catalog.json'));
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    const reviewed = new Map(schoolTeamConditions(catalog).map(c => [c.id, c]));
    for (const condition of conditions) {
        assert.ok(reviewed.has(condition.id));
        assert.equal(digest(condition), digest(reviewed.get(condition.id)), '条件与审阅版本不同');
    }
    const rows = readSamples(directory, manifest), evidence = new Map(), runs = [];
    for (const name of readdirSync(join(directory, 'runs')).sort()) {
        const run = join(directory, 'runs', name), result = json(join(run, 'result.json'));
        assert.equal(result.process.code, 0, '错误批次不能当正常报告');
        assert.equal(result.validation_errors.length, 0); assert.equal(result.incomplete_bytes, 0);
        const output = readFileSync(join(run, 'driver-output.txt'), 'utf8');
        assert.equal(sha256(output), result.driver_output_sha256); assert.match(output, /DATA COMPLETE/);
        const request = json(join(run, 'request.json'));
        assert.equal(request.fingerprint, manifest.fingerprint);
        const allowed = new Set(request.jobs.map(key));
        const log = readFileSync(join(run, 'mudlib/log/events.jsonl'), 'utf8');
        assert.ok(log.endsWith('\n'));
        for (const text of log.split('\n').filter(s => s.trim())) {
            const raw = JSON.parse(text), id = key(raw), hash = digest(raw);
            assert.ok(allowed.has(id));
            assert.ok(!evidence.has(id) || evidence.get(id) === hash, '原始样本冲突');
            evidence.set(id, hash);
        }
        runs.push({ name, ...result });
    }
    for (const row of rows) {
        const condition = conditions.find(c => c.id === row.condition_id);
        validateRecord(row.raw, condition); validateSchoolTeamRecord(row.raw, condition);
        assert.equal(evidence.get(key(row)), row.raw_sha256, '日志与台账不符');
    }
    return { directory, fingerprint: manifest.fingerprint,
        evidence_sha256: digest(rows.map(r => [key(r), r.raw_sha256]).sort()), runs,
        totals: { conditions: conditions.length, samples: rows.length,
            observed: rows.filter(r => r.outcome === 'observed').length,
            refused: rows.filter(r => r.outcome === 'refused').length },
        conditions: conditions.map(condition => {
            const samples = rows.filter(r => r.condition_id === condition.id);
            assert.equal(samples.length, condition.samples, '条件未采满');
            return { id: condition.id, samples: samples.map(row => ({ index: row.index,
                outcome: row.outcome, elapsed: row.raw.elapsed, steps: teamEffects(row.raw),
                interfaces: { form_array: row.raw.team_steps[0].form_array_owner,
                    dismiss_array: row.raw.team_steps[0].dismiss_array_owner },
                refusals: row.raw.refusals })) };
        }) };
}

export function schoolTeamMarkdown(report) {
    const lines = ['# 反两仪刀阵：双玩家命令观察', '',
        `系列：\`${report.fingerprint}\`；证据摘要：\`${report.evidence_sha256}\`。`, '',
        `${report.totals.conditions} 条件／${report.totals.samples} 样本；实际成阵 ${report.totals.observed}、未成阵 ${report.totals.refused}。`, '',
        '每条为独立双玩家状态；每条件两次确定性重复，不是随机胜率。observed 只表示成功发动过，不代表离队/解散正确。', '',
        '| 条件 | 重复 | 末步 | 双方队伍人数 | 双方刀阵等级 | 双方 no_quit |',
        '| --- | ---: | --- | --- | --- | --- |'];
    for (const condition of report.conditions) for (const sample of condition.samples) {
        const last = sample.steps.at(-1);
        lines.push(`| ${condition.id} | ${sample.index + 1} | ${last.action} | ${last.actors.map(a => a.team_size).join('/')} | ${last.actors.map(a => a.array?.level ?? 0).join('/')} | ${last.actors.map(a => a.no_quit).join('/')} |`);
    }
    lines.push('', '四项 apply 增量、环境、发动次数及原拒绝文本见 JSON 的逐步数据；所有资源收支由原始样本校验。',
        '未进行三人队伍、战斗收益、退出/死亡/断线或所有阵法验收。游戏代码及正式数据均未修改。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/school_team_report.mjs 系列目录 [新的仓库外报告目录]');
        const report = readSchoolTeam(process.argv[2]), markdown = schoolTeamMarkdown(report);
        if (process.argv[3]) {
            const output = newOutput(process.argv[3]);
            writeFileSync(join(output, 'school-team.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
            writeFileSync(join(output, 'school-team.md'), markdown, { flag: 'wx' });
            console.log(JSON.stringify({ output, totals: report.totals, fingerprint: report.fingerprint, evidence: report.evidence_sha256 }));
        } else console.log(markdown);
    } catch (error) { console.error('刀阵报告失败：' + error.message); process.exitCode = 1; }
}
