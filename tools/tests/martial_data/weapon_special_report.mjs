// Independent material comparison; reads the shared executor's evidence only.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { newOutput } from '../../collect_martial_data.mjs';
import { openSeries, readSamples, digest } from './ledger.mjs';
import { validateRecord } from './execution.mjs';
import { weaponSpecialConditions, validateWeaponSpecialRecord } from './weapon_special_cases.mjs';
import { distribution, probability, summarizeSamples } from './statistics.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const key = row => row.condition_id + '.' + row.index;

export function summarizeMaterialSamples(manifest, rows) {
    const report = summarizeSamples(manifest, rows);
    for (const condition of manifest.identity.conditions) {
        const selected = rows.filter(row => row.condition_id === condition.id);
        assert.equal(selected.length, condition.samples, '材质条件尚未采满');
        assert.equal(new Set(selected.map(key)).size, selected.length, '重复样本');
        const observations = selected.map(row => validateWeaponSpecialRecord(row.raw, condition));
        const hits = observations.filter(o => o.hit), controls = observations.filter(o => o.controlled);
        const summary = report.conditions.find(c => c.id === condition.id);
        summary.material = condition.parameters.actor.equipment.properties.material ?? null;
        summary.damage_branch = probability(hits.length, observations.length);
        summary.control = probability(controls.length, observations.length);
        summary.control_given_hit = probability(controls.length, hits.length);
        summary.initial_target_busy = distribution(observations.map(o => o.initial_busy));
        summary.controlled_target_busy = distribution(controls.map(o => o.initial_busy));
    }
    return report;
}

export function readWeaponSpecial(directory) {
    directory = realpathSync(directory);
    const manifest = openSeries(directory);
    assert.equal(manifest.identity.execution.collection, 'weapon-special');
    assert.equal(manifest.identity.execution.smoke, false, '烟雾不是完整材质采集');
    const catalog = json(join(directory, 'catalog.json'));
    assert.equal(catalog.source_fingerprint, manifest.identity.source_fingerprint);
    assert.equal(digest(manifest.identity.conditions), digest(weaponSpecialConditions(catalog)),
        '不是已核对的四项材质条件');
    const rows = readSamples(directory, manifest), evidence = new Map();
    assert.equal(rows.length, 400);
    for (const row of rows) {
        const condition = manifest.identity.conditions.find(c => c.id === row.condition_id);
        assert.ok(condition, '未知条件');
        assert.equal(row.outcome, row.raw.outcome);
        assert.equal(row.index, row.raw.index);
        validateRecord(row.raw, condition);
    }
    const attempts = readdirSync(join(directory, 'runs'));
    assert.ok(attempts.length, '没有真实驱动运行');
    for (const name of attempts) {
        const attempt = join(directory, 'runs', name), result = json(join(attempt, 'result.json'));
        assert.equal(result.process.code, 0, '未正常退出');
        assert.equal(result.validation_errors.length, 0);
        assert.equal(result.incomplete_bytes, 0);
        assert.match(readFileSync(join(attempt, 'driver-output.txt'), 'utf8'), /DATA COMPLETE/);
        const request = json(join(attempt, 'request.json'));
        assert.equal(request.fingerprint, manifest.fingerprint);
        const allowed = new Set(request.jobs.map(key));
        for (const line of readFileSync(join(attempt, 'mudlib/log/events.jsonl'), 'utf8').split('\n').filter(s => s.trim())) {
            const raw = JSON.parse(line), id = key(raw), hash = digest(raw);
            assert.ok(allowed.has(id), '原始记录不属于本次请求');
            assert.ok(!evidence.has(id) || evidence.get(id) === hash, '相同样本的原始日志冲突');
            evidence.set(id, hash);
        }
    }
    for (const row of rows) assert.equal(evidence.get(key(row)), row.raw_sha256, '原始日志与台账不一致');
    return { ...summarizeMaterialSamples(manifest, rows), directory,
        evidence_sha256: digest(rows.map(row => [key(row), row.raw_sha256]).sort()) };
}

export function materialMarkdown(report) {
    const n = value => Number.isFinite(value) ? value.toFixed(2) : '未知';
    const lines = ['# 夺魂势：白绸材质对照', '',
        `系列：\`${report.fingerprint}\`；证据摘要：\`${report.evidence_sha256}\`。`, '',
        '四条件各 100 次。只改变实验鞭的材质及加力档；不补毒技、不强制随机，保留原伤害和控制分支。', '',
        '| 材质 | 加力 | 命中 / 样本 | 控制 / 样本 | 控制 / 命中 | 对方气血支出均值 | 自身内力支出均值 | 控制成功时初始忙乱均值 |',
        '| --- | ---: | --- | --- | --- | ---: | ---: | ---: |'];
    for (const c of report.conditions) lines.push(`| ${c.material ?? '未设置'} | ${c.parameters.actor.properties.jiali}`
        + ` | ${c.damage_branch.successes}/${c.damage_branch.trials} | ${c.control.successes}/${c.control.trials}`
        + ` | ${c.control_given_hit.successes}/${c.control_given_hit.trials}`
        + ` | ${n(c.sides[1].metrics.qi_cost.mean)} | ${n(c.sides[0].metrics.neili_cost.mean)}`
        + ` | ${n(c.controlled_target_busy.mean)} |`);
    lines.push('', '普通材质没有控制分支；白绸命中后仍须通过第二次判定。零次命中时，条件控制率为未知，不记为零。',
        '初始忙乱是施展后立即读取的整数，不冒充完整持续时间。气血支出、创伤与恢复分列，完整分布及 95% Wilson 区间见 JSON。',
        '固定资格与目标仅用于材质机制比较，不代表真实配装收益、全部鞭法或同成本门派强弱。旧中性系列保留，未合并重新统计。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        assert.ok(process.argv.length === 3 || process.argv.length === 4,
            '用法：node tools/tests/martial_data/weapon_special_report.mjs 系列目录 [新的仓库外报告目录]');
        const report = readWeaponSpecial(process.argv[2]), markdown = materialMarkdown(report);
        if (process.argv[3]) {
            const output = newOutput(process.argv[3]);
            writeFileSync(join(output, 'weapon-material.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
            writeFileSync(join(output, 'weapon-material.md'), markdown, { flag: 'wx' });
            console.log('材质报告：' + output);
        } else console.log(markdown);
    } catch (error) { console.error('材质报告失败：' + error.message); process.exitCode = 1; }
}
