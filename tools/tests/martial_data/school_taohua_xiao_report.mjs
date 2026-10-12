import assert from 'node:assert/strict';
import { taohuaXiaoEffects } from './school_taohua_xiao_cases.mjs';
import { distribution, probability } from './statistics.mjs';

const group = 'taohua-xiao';
const count = value => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, '缺少已观察的非负整数');
    return value;
};
const text = value => {
    assert.equal(typeof value, 'string', '缺少报告文本');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replaceAll('\x1b', '\\x1b')
        .replace(/\r\n|\r|\n/g, '<br>');
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
function rate(value) {
    assert.deepEqual(value, probability(value.successes, value.trials), '概率必须使用相同的已知分母');
    if (!value.trials) return '未知（受理分母为0）';
    return `${number(value.rate * 100)}%（Wilson 95%：${number(value.low95 * 100)}%–${number(value.high95 * 100)}%）`;
}
const table = (headers, rows) => [
    '| ' + headers.join(' | ') + ' |', '| ' + headers.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |'),
].join('\n');

// Series/source digests are checked by the caller. Context comes only from its frozen
// condition; raw.parameters is neither required nor read, and no record is rewritten.
export function taohuaXiaoReport(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, group);
    assert.equal(condition.method, 'perform');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(Array.isArray(rows));
    const p = condition.parameters, seen = new Set(), exceptional = [], refusals = [];
    assert.equal(p.skill, 'tanzhi-shentong'); assert.equal(p.ability, 'xiao');
    assert.equal(p.usage, 'finger'); assert.equal(p.action, 'perform finger.xiao right');
    assert.equal(p.observation, 'single_action_immediate'); assert.equal(p.observe_seconds, 0);
    assert.ok(['observed', 'refused'].includes(p.expected));
    assert.equal(p.not_applicable, '');
    count(p.level); assert.ok(p.level > 0);
    for (const key of ['variant', 'qualification_note']) assert.equal(typeof p[key], 'string');
    for (const value of [p.actor?.properties?.neili, p.actor?.properties?.max_neili,
        p.target?.properties?.neili]) count(value);
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object' && !Array.isArray(row.raw));
        assert.equal(row.condition_id, condition.id, '外层条件不符');
        assert.equal(row.raw.condition_id, condition.id, '原件条件不符');
        assert.equal(row.raw.method, condition.method, '原入口不同');
        count(row.index); assert.ok(row.index < condition.samples, '编号超出冻结计划');
        assert.equal(row.index, row.raw.index, '内外编号不同');
        assert.ok(!seen.has(row.index), '重复记录不能进入分母'); seen.add(row.index);
        assert.ok(['observed', 'refused', 'error'].includes(row.outcome), '固定矩阵未声明其他结果');
        assert.equal(row.outcome, row.raw.outcome, '内外结果不同');
        assert.equal(typeof row.reason, 'string');
        assert.equal(row.reason, row.raw.reason, '原理由不同');
        if (row.outcome === 'error') {
            assert.ok(row.reason.trim(), '错误必须保留原理由');
            exceptional.push({ index: row.index, outcome: row.outcome, reason: row.reason });
        } else if (row.outcome === 'refused') refusals.push({ index: row.index, reason: row.reason });
    }
    const effects = taohuaXiaoEffects(rows, condition);
    const known = rows.filter(row => row.outcome !== 'error');
    const accepted = known.filter(row => row.outcome === 'observed');
    const refused = known.filter(row => row.outcome === 'refused');
    return {
        collection_group: group, condition_id: condition.id,
        context: { skill: p.skill, ability: p.ability, level: p.level, variant: p.variant,
            action: p.action, observe_seconds: p.observe_seconds, qualification_note: p.qualification_note,
            actor_neili: p.actor.properties.neili, actor_max_neili: p.actor.properties.max_neili,
            target_neili: p.target.properties.neili },
        coverage: { planned: condition.samples, recorded: rows.length,
            accepted: effects.accepted_samples, refused: effects.refused_samples,
            errors: effects.counts.error, not_applicable: effects.counts.not_applicable,
            missing: condition.samples - rows.length },
        commands: { known: known.length, accepted: accepted.length, refused: refused.length,
            unknown: exceptional.length,
            execution_cost: distribution(known.map(row => row.raw.command_accepted)),
            accepted_execution_cost: distribution(accepted.map(row => row.raw.command_accepted)),
            refused_execution_cost: distribution(refused.map(row => row.raw.command_accepted)) },
        exceptional, refusals, effects,
    };
}

export function taohuaXiaoMarkdown(summary) {
    assert.equal(summary?.collection_group, group);
    const { coverage: c, commands, effects: e, context } = summary;
    for (const value of Object.values(c)) count(value);
    assert.equal(c.recorded, c.accepted + c.refused + c.errors + c.not_applicable);
    assert.equal(c.planned, c.recorded + c.missing);
    assert.equal(c.not_applicable, 0, '本固定矩阵没有不适用条件');
    assert.deepEqual(e.counts, { observed: c.accepted, refused: c.refused, error: c.errors, not_applicable: 0 });
    assert.equal(e.samples, c.recorded); assert.equal(e.accepted_samples, c.accepted);
    assert.equal(e.refused_samples, c.refused); assert.equal(e.unknown_effect_samples, c.errors);
    assert.equal(summary.exceptional.length, c.errors); assert.equal(summary.refusals.length, c.refused);
    assert.equal(commands.known, c.accepted + c.refused);
    assert.equal(commands.accepted, c.accepted); assert.equal(commands.refused, c.refused);
    assert.equal(commands.unknown, c.errors);
    for (const [key, n] of [['execution_cost', commands.known],
        ['accepted_execution_cost', c.accepted], ['refused_execution_cost', c.refused]]) {
        assert.equal(commands[key].n, n); assert.equal(commands[key].unknown, 0);
    }
    assert.equal(e.hit.trials, c.accepted); assert.equal(e.hit.successes + e.misses, c.accepted);
    assert.equal(e.learned_progress.trials, c.accepted);
    assert.equal(e.damage_draw.n, e.hit.successes); assert.equal(e.damage_draw.unknown, e.misses);
    for (const key of ['ap', 'dp', 'jing_damage', 'jing_wound', 'target_neili_gross_cost',
        'target_neili_zero_correction', 'target_neili_net_loss', 'target_neili_remaining',
        'actor_neili_cost', 'busy', 'learned_delta']) {
        assert.equal(e[key].n, c.accepted); assert.equal(e[key].unknown, 0);
    }
    assert.equal(context.observe_seconds, 0);
    const lines = [
        '### 桃花岛·弹指神通「啸沧海」',
        '', `条件：${text(summary.condition_id)}。等级 ${number(context.level)}，${text(context.variant)}；原命令 ${text(context.action)}。`,
        '', text(context.qualification_note),
        '', `冻结初态：施招者内力 ${count(context.actor_neili)}／最大内力 ${count(context.actor_max_neili)}，目标内力 ${count(context.target_neili)}。这些是实验资格与资源，不是自然养成成本。`,
        '', table(['冻结计划', '已记录', '命令受理', '已知拒绝', '错误', '不适用', '缺样本'], [[
            c.planned, c.recorded, c.accepted, c.refused, c.errors, c.not_applicable, c.missing,
        ]]),
        '', '受理按原命令返回值 > 0 判定；原正整数是执行成本，不是技能内力费用、命中次数或固定布尔 1。错误与缺样本不补成失手、零费用或零效果。',
        '', '分布为均值 [P10, P90]，另列已知 n 与未知数；完整 JSON 保留中位数、P95 和极值。',
        '', table(['原命令返回成本分组', '记录数', '成本分布'], [
            ['已校验命令（受理＋拒绝）', commands.known, spread(commands.execution_cost)],
            ['正成本／受理', commands.accepted, spread(commands.accepted_execution_cost)],
            ['零成本／拒绝', commands.refused, spread(commands.refused_execution_cost)],
        ]),
        '', `命令结果未知 ${commands.unknown}；已知拒绝 ${c.refused} 不进入效果分母。未声明的不适用记录直接拒绝，不替换原错误状态。`,
        '', table(['受理分母', '实际命中', '受理后失手', '命中率'], [[
            count(e.hit.trials), count(e.hit.successes), count(e.misses), rate(e.hit),
        ]]),
        '', '命中按原忙乱分支与精神、内力资源账共同核验。本招不调用 COMBAT_D 直伤；精神损伤和有效精神创伤分别报告，不能相加。',
        '', table(['观察量', '统计分母', '实际分布'], [
            ['施招者有效指法 AP', '受理（含失手）', spread(e.ap)],
            ['目标有效内功 DP', '受理（含失手）', spread(e.dp)],
            ['原随机量 D（由命中毛扣反推）', '命中可还原；失手未知', spread(e.damage_draw)],
            ['目标精神毛损伤', '受理（含失手）', spread(e.jing_damage)],
            ['目标有效精神创伤', '受理（含失手）', spread(e.jing_wound)],
            ['目标内力毛扣', '受理（含失手）', spread(e.target_neili_gross_cost)],
            ['目标内力归零修正（原 recovery 计数）', '受理（含失手）', spread(e.target_neili_zero_correction)],
            ['目标内力净减少', '受理（含失手）', spread(e.target_neili_net_loss)],
            ['目标剩余内力', '受理（含失手）', spread(e.target_neili_remaining)],
            ['施招者实际内力消耗', '受理（含失手）', spread(e.actor_neili_cost)],
            ['施招者即时忙乱原值', '受理（含失手）', spread(e.busy)],
            ['弹指神通弱熟练进度', '受理（含失手）', spread(e.learned_delta)],
        ]),
        '', '归零修正来自原 add(-3D) 后 set(0)，不是治疗或回内。零内力目标可以有毛扣及等量修正，而净减少为零；不能只看净差。施招门槛需要内力，不代表本招实际扣除该门槛数值。',
        '', `受理后熟练有增长 ${count(e.learned_progress.successes)}／${count(e.learned_progress.trials)}；比例 ${rate(e.learned_progress)}。失手仍可增长，拒绝不增长；此项不是传招奖励。`,
        '', '仅单次即时窗口；忙乱 3／4 是原状态值，不是实测自然解除秒数。失手前原代码也抽取 D，但没有可反推的效果，保留未知；不强制随机频次，不据本表判断交锋胜率或教学成本。',
    ];
    if (summary.refusals.length) lines.push('', '已知拒绝原文（终端 ESC 写作 \\x1b，其余正文／色码／换行保留）：', '',
        table(['编号', '原理由'], summary.refusals.map(row => [count(row.index), text(row.reason)])));
    if (summary.exceptional.length) lines.push('', '原错误理由（不补造成效果记录）：', '',
        table(['编号', '结果', '原理由'], summary.exceptional.map(row => [count(row.index), text(row.outcome), text(row.reason)])));
    return lines.join('\n') + '\n';
}
