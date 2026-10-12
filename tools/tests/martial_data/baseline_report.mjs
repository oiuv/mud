// Read the unchanged six-skill benchmark. Never rewrite its historical files.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareBatches, fingerprint, summarize, validateRun } from '../weapon_balance/statistics.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const names = ['盘古七势／斧', '撼山锤法／锤', '中平枪法／枪', '胡家刀法／刀',
    '打狗棒法／杖', '缠魂索／鞭（中性）', '缠魂索／鞭（毒技、白绸）'];
const pairs = ['盘古七势—撼山锤法', '中平枪法—胡家刀法', '打狗棒法—缠魂索'];

export function readBaseline(directory) {
    directory = realpathSync(directory);
    const manifest = json(join(directory, 'manifest.json'));
    assert.equal(manifest.status, 'passed', '基线尚未完成或失败');
    assert.equal(manifest.fingerprint, fingerprint(manifest), '基线清单指纹不符');
    assert.equal(manifest.parameters.smoke, false, '烟雾不能替代完整基线');
    assert.equal(manifest.parameters.samples, 100);
    assert.equal(manifest.parameters.bouts, 20);
    assert.equal(manifest.parameters.duration, 30);
    const records = json(join(directory, 'records.json'));
    const raw = readFileSync(join(directory, 'mudlib/log/events.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.deepEqual(records, raw, '汇入记录与原始 JSONL 不一致');
    const text = readFileSync(join(directory, 'driver-output.txt'), 'utf8');
    const diagnostics = text + readFileSync(join(directory, 'mudlib/log/debug.log'), 'utf8');
    validateRun({ result: { code: manifest.process.exit_code, text }, diagnostics, records, parameters: manifest.parameters });
    const summary = summarize(records);
    assert.deepEqual(json(join(directory, 'summary.json')), summary, '保存汇总与重算结果不同');
    return { directory, manifest, records, summary };
}

export function compareBaselineReports(a, b) {
    assert.notEqual(a.directory, b.directory, '必须是两次独立运行，不能重复传入同一目录');
    assert.notEqual(a.manifest.started, b.manifest.started, '不是独立启动批次');
    compareBatches(a.manifest, b.manifest);
    return { a, b };
}

// Descriptive differences between independent samples, not paired-trial tests.
export function singleMeanContrasts({ a, b }) {
    const comparisons = [[0, 1], [2, 3], [4, 5], [5, 6]];
    const result = [];
    for (const [left, right] of comparisons) for (const mode of ['ordinary', 'perform']) {
        for (const jiali of [0, 50]) {
            const read = (batch, index) => {
                const condition = `${mode}:${index}:jiali${jiali}`;
                const row = batch.summary.find(c => c.condition === condition);
                assert.ok(row, '比较缺少条件：' + condition);
                const value = row.sides[0].qi_loss_inflicted.mean;
                assert.ok(Number.isFinite(value), '比较均值不可用：' + condition);
                return value;
            };
            const deltaA = read(a, right) - read(a, left);
            const deltaB = read(b, right) - read(b, left);
            const direction = deltaA === 0 || deltaB === 0
                ? (deltaA === 0 && deltaB === 0 ? '两批相同' : '一批无差异')
                : (Math.sign(deltaA) === Math.sign(deltaB) ? '同向' : '反向波动');
            result.push({ left, right, mode, jiali, deltaA, deltaB, direction });
        }
    }
    return result;
}

export function baselineMarkdown({ a, b }) {
    const f = x => x === null ? '不适用' : x.toFixed(2);
    const lines = ['# 六门武学固定条件采集', '', '仅记录当前人工标准档；不是十二类兵器、完整门派或同养成成本的强弱排行。', '',
        `源码：\`${a.manifest.commit}\`；共同指纹：\`${a.manifest.fingerprint}\`。`, '',
        `A：\`${a.directory}\`，${f(a.manifest.elapsed_seconds)} 秒。`,
        `B：\`${b.directory}\`，${f(b.manifest.elapsed_seconds)} 秒。`, '',
        '每批 28 组单次条件 × 100，加 12 组交锋 × 20，共 3040 条；两批 6080 条。原始记录、诊断及汇总均已重新校验。', '',
        '## 单次观察', '',
        '下列为 A / B 均值；对方气血净减少与创伤分列，自身内力为总支出。成功发动不等于命中。', '',
        '| 武学／兵器 | 模式 | 加力 | 对方气血净减少 A/B | 对方创伤 A/B | 自身内力支出 A/B |',
        '| --- | --- | ---: | ---: | ---: | ---: |'];
    for (const ca of a.summary.filter(c => !c.condition.startsWith('bout:'))) {
        const cb = b.summary.find(c => c.condition === ca.condition), [mode, index, jiali] = ca.condition.split(':');
        const x = ca.sides[0], y = cb.sides[0];
        lines.push(`| ${names[Number(index)]} | ${mode === 'ordinary' ? '普通攻击' : '单次绝招'} | ${jiali.slice(5)} | `
            + `${f(x.qi_loss_inflicted.mean)} / ${f(y.qi_loss_inflicted.mean)} | `
            + `${f(x.eff_qi_loss_inflicted.mean)} / ${f(y.eff_qi_loss_inflicted.mean)} | `
            + `${f(x.neili_cost.mean)} / ${f(y.neili_cost.mean)} |`);
    }
    lines.push('', '## 单次绝招的路径与剩余忙乱', '',
        '每条件每批 100 次；攻击命中为普通攻击链的累计次数，直接结算另列，不把两者相加作命中率。',
        '忙乱列为施展结束时的平均剩余计数，既不是秒，也不是控制触发次数。', '',
        '| 武学／兵器 | 加力 | 普通攻击命中 A/B | 直接结算次数 A/B | 自忙 A/B | 目标忙乱 A/B |',
        '| --- | ---: | ---: | ---: | ---: | ---: |');
    for (const ca of a.summary.filter(c => c.condition.startsWith('perform:'))) {
        const cb = b.summary.find(c => c.condition === ca.condition), [, index, jiali] = ca.condition.split(':');
        const x = ca.sides[0], y = cb.sides[0];
        lines.push(`| ${names[Number(index)]} | ${jiali.slice(5)} | `
            + `${x.ordinary_counts.hit} / ${y.ordinary_counts.hit} | ${x.direct_calls} / ${y.direct_calls} | `
            + `${f(x.final_busy.mean)} / ${f(y.final_busy.mean)} | `
            + `${f(ca.sides[1].final_busy.mean)} / ${f(cb.sides[1].final_busy.mean)} |`);
    }
    lines.push('', '## 两批差异方向', '',
        '只比较同模式、同加力的“后者减前者”气血净减少均值；这不是配对试验或显著性检验。',
        '同向仅表示两批观察方向一致，不证明类别优势；纯控制招式与伤害招式的此项差值不能当作总收益。', '',
        '| 前者 → 后者 | 模式 | 加力 | A 差值 | B 差值 | 方向 |',
        '| --- | --- | ---: | ---: | ---: | --- |');
    for (const row of singleMeanContrasts({ a, b })) {
        lines.push(`| ${names[row.left]} → ${names[row.right]} | ${row.mode === 'ordinary' ? '普通攻击' : '单次绝招'} | `
            + `${row.jiali} | ${f(row.deltaA)} | ${f(row.deltaB)} | ${row.direction} |`);
    }
    lines.push('', '## 三组交锋', '', '每场最多 30 秒、交替先手，原心跳含恢复；“左胜／右胜／未决”不把到时未决计成胜利。', '',
        '| 左—右 | 策略 | 加力 | A 左胜/右胜/未决 | B 左胜/右胜/未决 | A/B 时长中位数（秒） |',
        '| --- | --- | ---: | --- | --- | ---: |');
    for (const ca of a.summary.filter(c => c.condition.startsWith('bout:'))) {
        const cb = b.summary.find(c => c.condition === ca.condition), [, index, mode, jiali] = ca.condition.split(':');
        const wins = c => [c.sides[0].wins.successes, c.sides[1].wins.successes, c.censored].join('/');
        lines.push(`| ${pairs[Number(index)]} | ${mode === 'ordinary' ? '纯普攻' : '普攻＋指定绝招'} | ${jiali.slice(5)} | `
            + `${wins(ca)} | ${wins(cb)} | ${f(ca.elapsed.median)} / ${f(cb.elapsed.median)} |`);
    }
    const interval = event => event.wilson95
        ? event.wilson95.map(value => (value * 100).toFixed(1) + '%').join('–') : '不适用';
    lines.push('', '### 交锋样本的不确定性', '',
        '以下为每批 20 场中“30 秒内左胜／右胜”的 95% Wilson 区间，不是无限时长胜率，也不是均值差的置信区间。',
        '0/20 或 20/20 仍有采样不确定性；两批单独列出，不合并掩盖时序与随机波动。', '',
        '| 左—右 | 策略／加力 | A 左胜区间 | A 右胜区间 | B 左胜区间 | B 右胜区间 |',
        '| --- | --- | --- | --- | --- | --- |');
    for (const ca of a.summary.filter(c => c.condition.startsWith('bout:'))) {
        const cb = b.summary.find(c => c.condition === ca.condition), [, index, mode, jiali] = ca.condition.split(':');
        lines.push(`| ${pairs[Number(index)]} | ${mode === 'ordinary' ? '纯普攻' : '普攻＋指定绝招'}／${jiali.slice(5)} | `
            + `${interval(ca.sides[0].wins)} | ${interval(ca.sides[1].wins)} | `
            + `${interval(cb.sides[0].wins)} | ${interval(cb.sides[1].wins)} |`);
    }
    lines.push('', '## 解读边界', '',
        '- 不合并两批均值掩盖波动；每条件中位数、P10/P90、资源恢复、控制占比和概率区间见各批 summary.json。',
        '- 交锋气血净减少已受原生恢复影响，不等同总伤害。原汇总也保留气血总支出与恢复，成本不能只看净内力。',
        '- 单次结束时的忙乱是剩余状态，不是控制触发率；连招中先施加的整数忙乱可能被后续命中打断。未采集的中间控制事件不从最终快照补算。',
        '- 本标准档没有激发特殊内功；普通攻击的加力内功钩子因此不执行。不能把普攻两档的随机差异当作加力收益，或将此处零内力支出推广到完整门派配装。直接伤害另有独立加力结算，以实测总成本为准。',
        '- 打狗“缠”在本标准档不可能缠中基础轻功 600 的对手；这不是该招没有控制能力，独立弱闪避机制测试另列。',
        '- 白绸／毒技为额外条件，不是鞭类免费增益；三组交锋使用中性缠魂，不混入扩展档。',
        '- 原汇总包含攻击级 Wilson 区间；连击相关，因此不能将该区间当作完全独立攻击试验的精确不确定性。',
        '- 20 场交锋及这些人工组合只支持当前条件，不证明完整门派胜率、线上培养成本或最优装备；不据此调数值。', '');
    return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.equal(process.argv.length, 4, '用法：node tools/tests/martial_data/baseline_report.mjs 批次A目录 批次B目录');
        console.log(baselineMarkdown(compareBaselineReports(readBaseline(process.argv[2]), readBaseline(process.argv[3]))));
    } catch (error) { console.error('基线报告失败：' + error.message); process.exitCode = 1; }
}
