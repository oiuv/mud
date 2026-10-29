// Read-only Zhou report; never use the outside bystander as the combat target.
import assert from 'node:assert/strict';
import { emeiNpcBoutGroup, validateEmeiNpcBoutRecord } from './school_emei_npc_bout_cases.mjs';
import { zhouCallbacks } from './school_emei_npc_cases.mjs';
import { distribution } from './statistics.mjs';
const resources = ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'];
export function emeiNpcBoutReport(rows, condition) {
    assert.equal(condition.parameters.collection_group, emeiNpcBoutGroup);
    const seen = new Set();
    for (const row of rows) {
        assert.equal(row.index, row.raw.index); assert.equal(row.condition_id, condition.id);
        assert.equal(row.outcome, row.raw.outcome); assert.ok(!seen.has(row.index)); seen.add(row.index);
        validateEmeiNpcBoutRecord(row.raw, condition);
    }
    const raw = rows.map(r => r.raw), sum = f => raw.reduce((s, r) => s + f(r), 0);
    const metric = (r, side, key) => (side === -1 ? r.npc_bout.npc_metrics : r.metrics[0])[key] ?? 0;
    const net = (r, k, terminal) => {
        const n = r.npc_observation;
        const end = terminal ? r.npc_bout.terminal_events.filter(e => e.actor === -1).at(-1)?.state_before : n.after;
        return end && typeof end === 'object' ? n.before.properties[k] - end.properties[k] : null;
    };
    return { collection_group: emeiNpcBoutGroup, condition_id: condition.id,
        coverage: { planned: condition.samples, observed: raw.length, missing: condition.samples - raw.length },
        duration_limit_seconds: condition.parameters.observe_seconds, elapsed: distribution(raw.map(r => r.elapsed)),
        terminals: Object.fromEntries(['time_limit', 'death', 'unconscious'].map(k => [k, sum(r => +(r.npc_bout.terminal === k))])),
        winners: Object.fromEntries(['none', 'user', 'npc'].map(k => [k, sum(r => +(r.npc_bout.winner === k))])),
        npc_gross_resources: 'not_observed',
        npc_endpoint_net_loss: Object.fromEntries(resources.map(k => [k, distribution(raw.map(r => net(r, k, false)))])),
        npc_preterminal_net_loss: Object.fromEntries(resources.map(k => [k, distribution(raw.map(r => net(r, k, true)))])),
        user_net_loss: Object.fromEntries(resources.map(k => [k, distribution(raw.map(r => r.before[0][k] - r.after[0][k]))])),
        user_gross: Object.fromEntries(resources.map(k => [k, {
            cost: distribution(raw.map(r => metric(r, 0, k + '_cost'))),
            recovery: distribution(raw.map(r => metric(r, 0, k + '_recovery'))) } ])),
        choices: zhouCallbacks.map((argument, index) => {
            const events = raw.flatMap(r => r.npc_bout.chat_choices).filter(e => e.index === index);
            return { index, argument, attempts: events.length,
                returned_one: events.filter(e => e.return_observation === 'observed' && e.result === 1).length,
                returned_zero: events.filter(e => e.return_observation === 'observed' && e.result === 0).length,
                returned_null: events.filter(e => e.return_observation === 'observed' && e.result === null).length,
                return_unknown: events.filter(e => e.return_observation !== 'observed').length,
                immediate_neili_net_loss: distribution(events.map(e => e.after_state ? e.before_state.properties.neili - e.after_state.properties.neili : null)) };
        }),
        sides: Object.fromEntries([['npc', -1], ['user', 0]].map(([name, side]) => [name, {
            heartbeats: sum(r => metric(r, side, 'heartbeats')),
            attacks: sum(r => r.attacks.filter(e => e.actor === side).length),
            results: Object.fromEntries([0, -1, -2].map(result => [result, sum(r => r.attacks.filter(e => e.actor === side && e.result === result).length)])),
            direct_calls: sum(r => r.npc_direct.filter(e => e.actor === side).length),
            passive_routes: Object.fromEntries(['force', 'martial'].map(route => [route, sum(r => r.passives.filter(e => e.actor === side && e.route === route).length)])),
            rounds: sum(r => r.attack_rounds.filter(e => e.actor === side).length),
            busy_seconds: distribution(raw.map(r => r.npc_bout.busy_seconds[name])) } ])),
        limitation: '固定原周芷若与中性持剑USER的有限窗口；原互列敌对建立也可能攻击，不将整场攻击当纯心跳频率。NPC毛支出未知、净差与恢复分开；时限未决不是胜利，随机未选不补施，未验证完整增益/毒自然到期。',
        evidence: rows.map(r => ({ index: r.index, raw_sha256: r.raw_sha256 })) };
}

export function emeiNpcBoutMarkdown(report) {
    assert.equal(report.collection_group, emeiNpcBoutGroup);
    const f = d => d.mean === null ? '未知' : `${d.mean.toFixed(2)} [${d.p10.toFixed(2)}, ${d.p90.toFixed(2)}]；n=${d.n}，未知=${d.unknown}`;
    return ['## 原周芷若自然心跳交锋', '',
        `观察 ${report.coverage.observed}/${report.coverage.planned} 场；每场最多 ${report.duration_limit_seconds} 秒。`, '',
        `时限未决 ${report.terminals.time_limit}，死亡 ${report.terminals.death}，昏迷 ${report.terminals.unconscious}；未决不算胜利。`, '',
        '| 原闭包 | 自然选择 | 返回1 | 返回0 | 返回null | 返回未知 |',
        '| --- | ---: | ---: | ---: | ---: | ---: |',
        ...report.choices.map(e => `| ${e.argument} | ${e.attempts} | ${e.returned_one} | ${e.returned_zero} | ${e.returned_null} | ${e.return_unknown} |`), '',
        '选择次数不是发动率或命中率；原错误入口、已生效增益和无须恢复均保留实际拒绝，不合并为一类故障。', '',
        '| 资源 | NPC末态净损失 | NPC终态入口前净损失 | USER净损失 | USER毛支出 | USER毛恢复 |',
        '| --- | --- | --- | --- | --- | --- |',
        ...resources.map(k => `| ${k} | ${f(report.npc_endpoint_net_loss[k])} | ${f(report.npc_preterminal_net_loss[k])} | ${f(report.user_net_loss[k])} | ${f(report.user_gross[k].cost)} | ${f(report.user_gross[k].recovery)} |`), '',
        'NPC毛支出与毛恢复未观察；不从净差反推。气血、有效气血及恢复分别列出，不相加作伤害。场外旁观USER不用于对方计损。', '',
        '| 主体 | 原心跳 | 攻击轮 | 实际攻击 | 命中/闪避/招架 | 直伤调用 | force/martial回调 | 忙乱秒 |',
        '| --- | ---: | ---: | ---: | --- | ---: | --- | --- |',
        ...Object.entries(report.sides).map(([k, s]) => `| ${k} | ${s.heartbeats} | ${s.rounds} | ${s.attacks} | ${[0, -1, -2].map(r => s.results[r]).join('/')} | ${s.direct_calls} | ${s.passive_routes.force}/${s.passive_routes.martial} | ${f(s.busy_seconds)} |`), '',
        report.limitation, '逐条原始证据编号与SHA256保存在JSON中；空报告仍不构成实采通过。', ''].join('\n');
}
