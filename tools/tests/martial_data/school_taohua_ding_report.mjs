import assert from 'node:assert/strict';
import { taohuaDingEffects } from './school_taohua_ding_cases.mjs';
import { distribution } from './statistics.mjs';

const group = 'taohua-ding';
const count = value => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, '缺少已观察的非负整数');
    return value;
};
const text = value => {
    assert.equal(typeof value, 'string', '缺少报告文本');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replace(/\r\n|\r|\n/g, '<br>');
};
const number = value => {
    assert.ok(Number.isFinite(value), '未知数值不得补零');
    return Number(value.toFixed(3)).toString();
};
function spread(value) {
    count(value.n); count(value.unknown);
    const keys = ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max'];
    if (!value.n) {
        for (const key of keys) assert.equal(value[key], null);
        return `未观察（n=0，未知=${value.unknown}）`;
    }
    for (const key of keys) assert.ok(Number.isFinite(value[key]));
    return `${number(value.mean)} [${number(value.p10)}, ${number(value.p90)}]；n=${value.n}，未知=${value.unknown}`;
}
function hitRate(value) {
    count(value.successes); count(value.trials);
    assert.ok(value.successes <= value.trials);
    if (!value.trials) {
        for (const key of ['rate', 'low95', 'high95']) assert.equal(value[key], null);
        return '未知（受理分母为0）';
    }
    for (const key of ['rate', 'low95', 'high95']) assert.ok(Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 1);
    return `${number(value.rate * 100)}%（Wilson 95%：${number(value.low95 * 100)}%–${number(value.high95 * 100)}%）`;
}
const table = (headers, rows) => [
    '| ' + headers.join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |'),
].join('\n');

// The caller verifies series/source hashes. Only the frozen condition supplies context;
// raw.parameters is neither required nor used, and no raw field is filled or rewritten.
export function taohuaDingReport(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, group);
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(Array.isArray(rows));
    const p = condition.parameters, seen = new Set();
    assert.equal(p.skill, 'tanzhi-shentong'); assert.equal(p.ability, 'ding');
    assert.equal(p.action, 'perform finger.ding right');
    assert.ok(p.observe_seconds === 0 || p.observe_seconds === 6);
    const exceptional = [];
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        assert.equal(row.condition_id, condition.id, '外层条件不符');
        assert.equal(row.raw.condition_id, condition.id, '原件条件不符');
        count(row.index); assert.ok(row.index < condition.samples, '编号超出冻结计划');
        assert.equal(row.index, row.raw.index, '内外编号不同');
        assert.ok(!seen.has(row.index), '重复记录不能进入分母'); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error', 'not_applicable'].includes(row.outcome));
        assert.equal(row.outcome, row.raw.outcome, '内外结果不同');
        assert.equal(typeof row.reason, 'string');
        assert.equal(row.reason, row.raw.reason, '原理由不同');
        if (['error', 'not_applicable'].includes(row.outcome)) {
            assert.ok(row.reason.trim(), '未知结果必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        }
    }
    const effects = taohuaDingEffects(rows, condition);
    const known = rows.filter(row => ['observed', 'refused'].includes(row.outcome));
    const accepted = known.filter(row => row.outcome === 'observed');
    const refused = known.filter(row => row.outcome === 'refused');
    return {
        collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, ability: p.ability, level: p.level, variant: p.variant,
            action: p.action, observe_seconds: p.observe_seconds, qualification_note: p.qualification_note },
        coverage: { planned: condition.samples, recorded: rows.length, accepted: effects.observed,
            refused: effects.refused, errors: effects.errors, not_applicable: effects.not_applicable,
            missing: condition.samples - rows.length },
        exceptional,
        commands: { known: known.length, accepted: accepted.length, refused: refused.length,
            unknown: exceptional.length,
            execution_cost: distribution(known.map(row => row.raw.command_accepted)),
            accepted_execution_cost: distribution(accepted.map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(refused.map(row => row.raw.command_accepted)) },
        control: { applied: effects.hit.successes, missed: effects.observed - effects.hit.successes,
            release_observed: effects.release_observed, release_unobserved: effects.release_unobserved,
            not_triggered: known.length - effects.hit.successes, unknown: exceptional.length },
        effects,
    };
}

export function taohuaDingMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { coverage: c, commands, control, effects: e, context } = summary;
    for (const value of Object.values(c)) count(value);
    assert.equal(c.recorded, c.accepted + c.refused + c.errors + c.not_applicable);
    assert.equal(c.planned, c.recorded + c.missing);
    assert.equal(c.accepted, e.observed); assert.equal(c.refused, e.refused);
    assert.equal(c.errors, e.errors); assert.equal(c.not_applicable, e.not_applicable);
    assert.equal(summary.exceptional.length, c.errors + c.not_applicable);
    assert.equal(commands.known, c.accepted + c.refused);
    assert.equal(commands.accepted, c.accepted); assert.equal(commands.refused, c.refused);
    assert.equal(commands.unknown, summary.exceptional.length);
    assert.equal(commands.execution_cost.n, commands.known);
    assert.equal(commands.accepted_execution_cost.n, commands.accepted);
    assert.equal(commands.refused_execution_cost.n, commands.refused);
    assert.equal(e.command_refused + e.ability_refused, c.refused);
    assert.equal(e.hit.trials, c.accepted); assert.equal(control.applied, e.hit.successes);
    assert.equal(control.missed + control.applied, c.accepted);
    assert.equal(control.release_observed, e.release_observed);
    assert.equal(control.release_unobserved, e.release_unobserved);
    assert.equal(control.release_observed + control.release_unobserved, control.applied);
    assert.equal(e.release_elapsed.n, control.release_observed);
    assert.equal(control.not_triggered, commands.known - control.applied);
    assert.equal(control.unknown, commands.unknown);
    const lines = [
        '### 桃花岛·弹指神通「定昆仑」',
        '', `条件：${text(summary.condition_id)}。等级 ${number(context.level)}，${text(context.variant)}；原命令 ${text(context.action)}。`,
        '', text(context.qualification_note),
        '', table(['冻结计划', '已记录', '命令受理', '已知拒绝', '错误', '不适用', '缺样本'], [[
            c.planned, c.recorded, c.accepted, c.refused, c.errors, c.not_applicable, c.missing,
        ]]),
        '', '受理按原命令返回值 > 0 判定；原值是执行成本，不是命中次数或布尔 1。错误、不适用和缺样本不计作拒绝、失手、零费用或零效果。',
        '', '分布为均值 [P10, P90]，另列已知 n 与未知数；完整 JSON 保留中位数、P95 和极值。',
        '', table(['原命令返回成本分组', '记录数', '成本分布'], [
            ['已校验命令（受理＋拒绝）', commands.known, spread(commands.execution_cost)],
            ['正成本／受理', commands.accepted, spread(commands.accepted_execution_cost)],
            ['零成本／拒绝', commands.refused, spread(commands.refused_execution_cost)],
        ]),
        '', `公共命令早拒绝 ${count(e.command_refused)}，招式内部拒绝 ${count(e.ability_refused)}；结果未知 ${commands.unknown}。已知拒绝未进入效果分母。`,
        '', table(['受理分母', '命中并新设禁招', '受理后失手', '命中率'], [[
            count(e.hit.trials), count(control.applied), count(control.missed), hitRate(e.hit),
        ]]),
        '', '本组命中以原单次 REMOTE 直伤调用及实际 no_perform 置位共同核验。输入伤害不是最终掉血；气血与创伤分别记录，不相加。',
        '', table(['观察量', '统计分母', '实际分布'], [
            ['REMOTE 输入伤害', '命中', spread(e.input_damage_on_hit)],
            ['目标气血损失', '受理（含失手）', spread(e.qi_loss)],
            ['目标有效气血损失／创伤', '受理（含失手）', spread(e.wound)],
            ['招式内力消耗', '受理（含失手）', spread(e.ability_neili)],
            ['加力内力消耗', '受理（含失手）', spread(e.jiali_neili)],
            ['实际内力总消耗', '受理（含失手）', spread(e.total_neili)],
            ['施招者即时忙乱原值', '受理（含失手）', spread(e.actor_busy)],
            ['目标即时忙乱原值', '受理（含失手）', spread(e.target_busy)],
            ['弹指神通弱熟练进度', '受理（含失手）', spread(e.learned_gain)],
        ]),
        '', '禁招与忙乱不是同一状态。目标已有忙乱按原中断器保留；这里的忙乱值不是自然解除时长。',
        '', `冻结观察窗 ${number(context.observe_seconds)} 秒；即时窗口不观察自然解禁，不能写作零秒解除。`,
        '', table(['原 ding_end 成对观察／解除', '命中但解除未观察', '已知未触发禁招', '结果未知', '实际解除测时（秒）'], [[
            count(control.release_observed), count(control.release_unobserved), count(control.not_triggered),
            count(control.unknown), spread(e.release_elapsed),
        ]]),
        '', ...e.limitations.map(value => '- ' + text(value)),
    ];
    if (summary.exceptional.length) lines.push('', '原错误／不适用理由（不补造成效果记录）：', '',
        table(['编号', '结果', '原理由'], summary.exceptional.map(row => [count(row.index), text(row.outcome), text(row.reason)])));
    return lines.join('\n') + '\n';
}
