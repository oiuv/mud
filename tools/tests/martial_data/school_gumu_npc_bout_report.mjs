import assert from 'node:assert/strict';
import { gumuNpcBoutEffects, gumuNpcBoutGroup } from './school_gumu_npc_bout_cases.mjs';

const resources = { qi: '气血', eff_qi: '有效气血', jing: '精神', eff_jing: '有效精神', neili: '内力' };
const count = value => {
    assert.ok(Number.isSafeInteger(value) && value >= 0, '报告计数必须是已观察的非负整数');
    return value;
};
const text = value => {
    assert.equal(typeof value, 'string', '缺少报告文本');
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
        .replaceAll('|', '\\|').replaceAll('`', '&#96;').replace(/\r\n|\r|\n/g, '<br>');
};
const number = value => {
    if (value === null) return '未知';
    assert.ok(Number.isFinite(value), '未知数值不能补零');
    return Number(value.toFixed(3)).toString();
};
function distribution(value) {
    assert.ok(value && typeof value === 'object', '缺少实际分布');
    count(value.n); count(value.unknown);
    if (!value.n) {
        for (const key of ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max']) assert.equal(value[key], null);
        return `未观察（n=0，未知=${value.unknown}）`;
    }
    for (const key of ['mean', 'median', 'p10', 'p90', 'p95', 'min', 'max']) assert.ok(Number.isFinite(value[key]));
    return `${number(value.mean)} [${number(value.p10)}, ${number(value.p90)}]；n=${value.n}，未知=${value.unknown}`;
}
const table = (header, rows) => [
    '| ' + header.join(' | ') + ' |', '| ' + header.map(() => '---').join(' | ') + ' |',
    ...rows.map(row => '| ' + row.join(' | ') + ' |'),
].join('\n');

// Accept ledger rows and the frozen condition, never parameters reconstructed from raw.
// The caller retains the series/byte provenance checks; this helper validates this group's records.
export function gumuNpcBoutReport(rows, condition) {
    assert.equal(condition?.parameters?.collection_group, gumuNpcBoutGroup);
    assert.equal(condition.method, 'bout');
    assert.ok(typeof condition.id === 'string' && condition.id);
    assert.ok(Number.isSafeInteger(condition.samples) && condition.samples > 0);
    assert.ok(Array.isArray(rows));
    const p = condition.parameters, seen = new Set();
    assert.ok(typeof p.npc.original.name === 'string' && p.npc.original.name);
    assert.ok(Number.isFinite(p.observe_seconds) && p.observe_seconds > 0);
    for (const row of rows) {
        assert.ok(row && row.raw && typeof row.raw === 'object');
        count(row.index); assert.equal(row.index, row.raw.index, '外层编号与原始记录不一致');
        assert.ok(!seen.has(row.index), '重复样本不能进入分母'); seen.add(row.index);
        if (row.outcome === 'error') assert.ok(typeof row.reason === 'string' && row.reason.trim(), '错误必须保留原理由');
    }
    const effects = gumuNpcBoutEffects(rows, condition);
    const observed = rows.filter(row => row.outcome === 'observed').map(row => row.raw);
    const errors = rows.filter(row => row.outcome === 'error').map(row => ({ index: row.index, reason: row.reason }));
    const totalSeconds = observed.length ? observed.reduce((sum, raw) => sum + raw.elapsed, 0) : null;
    assert.ok(totalSeconds === null || Number.isFinite(totalSeconds));
    return {
        collection_group: gumuNpcBoutGroup, condition_id: condition.id,
        npc: { id: p.npc.id, name: p.npc.original.name, path: p.npc.path },
        coverage: { planned: condition.samples, recorded: rows.length, observed: effects.observed,
            errors: errors.length, missing: condition.samples - rows.length },
        errors,
        clock: { observed_samples: observed.length, total_seconds: totalSeconds },
        terminals: Object.fromEntries(['death', 'unconscious', 'time_limit']
            .map(kind => [kind, observed.filter(raw => raw.npc_bout.terminal === kind).length])),
        attack_types: Object.fromEntries([['npc', -1], ['user', 0]].map(([role, actor]) => [role,
            Object.fromEntries([0, 1, 2].map(type => [type,
                observed.flatMap(raw => raw.attacks).filter(attack => attack.actor === actor && attack.type === type).length]))])),
        effects,
    };
}

export function gumuNpcBoutMarkdown(summary) {
    assert.equal(summary?.collection_group, gumuNpcBoutGroup);
    const e = summary.effects, coverage = summary.coverage;
    for (const value of Object.values(coverage)) count(value);
    assert.equal(coverage.recorded, coverage.observed + coverage.errors);
    assert.equal(coverage.planned, coverage.recorded + coverage.missing);
    assert.equal(e.samples, coverage.recorded); assert.equal(e.observed, coverage.observed);
    assert.equal(summary.errors.length, coverage.errors);
    assert.equal(summary.clock.observed_samples, coverage.observed);
    if (coverage.observed) assert.ok(Number.isFinite(summary.clock.total_seconds) && summary.clock.total_seconds > 0);
    else assert.equal(summary.clock.total_seconds, null);
    assert.equal(e.npc_gross_resources, 'not_observed');
    const lines = [
        `### 古墓原 NPC 自然交锋：${text(summary.npc.name)} / ${text(e.combination)}`,
        '', `条件：${text(summary.condition_id)}。原 NPC 对战中性 USER0；USER1 只在场外旁观，不作对手计损。`,
        '', `计划 ${coverage.planned} 场，已记录 ${coverage.recorded} 场：观察 ${coverage.observed}、错误 ${coverage.errors}；缺样本 ${coverage.missing}。错误和缺样本不进入效果分布，不代表零效果。`,
        '', `冻结条件每场限时 ${number(e.duration_limit_seconds)} 秒；${summary.clock.observed_samples} 场已观察时钟合计 ${number(summary.clock.total_seconds)} 秒。实际时长：${distribution(e.elapsed)}。胜负按原死亡/昏迷入口记录，不等价于死亡处理全部完成；限时未结束单列未决。`,
        '', table(['NPC 胜', 'USER 胜', '未决', '死亡入口终止', '昏迷入口终止', '限时终止'], [[
            count(e.npc_wins), count(e.user_wins), count(e.undecided), count(summary.terminals.death),
            count(summary.terminals.unconscious), count(summary.terminals.time_limit),
        ]]),
        '', '资源分布用“均值 [P10, P90]；已知 n、未知数”表示。净损失 = 初态 − 对应观察点；负数表示净增长。气血与有效气血、精神与有效精神分别记账，不相加。',
        '', table(['资源', 'NPC 末态净损失', 'NPC 终态入口前净损失', 'USER 净损失', 'USER 毛消耗', 'USER 毛恢复'],
            Object.entries(resources).map(([key, label]) => [label,
                distribution(e.npc_endpoint_net_loss[key]), distribution(e.npc_preterminal_net_loss[key]),
                distribution(e.user_net_loss[key]), distribution(e.user_gross[key].cost), distribution(e.user_gross[key].recovery),
            ])),
        '', 'NPC 毛消耗与毛恢复未观察；不能从净差反推。NPC 销毁后的末态未知；终态入口前只在该 NPC 有原终态前快照时可知，不是死亡处理完成后的剩余资源。USER 毛账来自实际资源计数器，不套用旁观者损失。',
        '', table(['主体', '攻击轮尝试 / 实返 / 未知', '实际攻击', '普通0 / 反击1 / 快攻2', '命中0 / 闪避−1 / 招架−2', '直伤调用', '忙乱秒'],
            [['npc', '原 NPC'], ['user', 'USER0']].map(([role, label]) => {
                const side = e.sides[role], types = summary.attack_types[role];
                return [label, [side.rounds.attempts, side.rounds.returns_observed, side.rounds.returns_not_observed].map(count).join(' / '),
                    count(side.attacks), [0, 1, 2].map(type => count(types[type])).join(' / '),
                    [0, -1, -2].map(result => count(side.attack_results[result])).join(' / '), count(side.direct_calls), distribution(side.busy_seconds)];
            })),
        '', '以下是原随机选招的尝试与真实返回。方法返回 0 / null / 1 分列；command 返回是原执行成本，不是布尔值。未观察返回保留在尝试分母，不算 0、null 或成功；这些返回不能解释为命中率或技能成功率。',
        '', table(['原闭包索引与入口', '尝试', '实返', '返回未知', '方法返回 0 / null / 1', 'command 执行成本'],
            e.choices.map(choice => [
                `${count(choice.index)}：${text(choice.entry)} ${text(choice.argument)}`, count(choice.calls),
                count(choice.returns_observed), count(choice.returns_not_observed),
                choice.entry === 'command' ? '不适用' : [choice.method_zero, choice.method_null, choice.method_one].map(count).join(' / '),
                choice.entry === 'command' ? `${distribution(choice.command_evaluation_cost)}；成本未知=${count(choice.command_evaluation_cost_not_observed)}` : '不适用',
            ])),
        '', table(['原被动路由（两方合计）', '已观察调用', '调用前后施术者内力净损失'],
            e.passives.map(passive => [text(passive.route), count(passive.calls), distribution(passive.immediate_neili_net_loss)])),
        '', '被动回调数不是触发成功数；同步内力净差不是毛费用。首次动态动作表内部加载者未观察，不以构造时上下文冒充。',
        '', text(e.limitation),
    ];
    if (summary.errors.length) lines.push('', '错误记录（保留原理由，不重新计成观察成功）：', '',
        table(['样本编号', '原理由'], summary.errors.map(error => [count(error.index), text(error.reason)])));
    return lines.join('\n') + '\n';
}
