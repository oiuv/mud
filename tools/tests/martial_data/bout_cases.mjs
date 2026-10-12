import assert from 'node:assert/strict';
import { weaponConditions } from './weapon_cases.mjs';

export function boutConditions(catalog, { smoke = false, bouts = 20, level = 200 } = {}) {
    return weaponConditions(catalog, { level }).filter(c => !smoke || c.parameters.actor.properties.jiali === 0)
        .map(c => {
            const p = c.parameters;
            return { ...c, id: c.id.replace('-ordinary-', '-bout-ordinary-').replace('-perform-', '-bout-perform-'),
                method: 'bout', samples: smoke ? 2 : bouts,
                parameters: { ...p, strategy: c.method, target: { ...p.target,
                    properties: { ...p.target.properties, jiali: p.actor.properties.jiali } },
                observe_seconds: smoke ? 3 : 30, first: 'alternating_index',
                note: '固定中性对手仅用原生普通攻击；先手按重复编号交替。原生心跳含恢复，暗器施展组允许原生徒手后续，不冒充暗器普攻。' } };
        });
}

export function validateBoutRecord(raw, condition) {
    if (raw.outcome !== 'observed') return;
    const p = condition.parameters;
    assert.equal(raw.first, raw.index % 2, '计划先手必须交替');
    assert.equal(raw.first_actor, raw.first, '实际先手不符');
    assert.ok(['time_limit', 'unconscious', 'death'].includes(raw.terminal), '交锋缺少真实终态');
    assert.equal(raw.busy_seconds.length, 2);
    for (const value of raw.busy_seconds) assert.ok(value >= 0 && value <= raw.elapsed + 0.001);
    assert.ok(raw.metrics[raw.first].heartbeats > 0, '没有原生心跳');
    if (raw.terminal === 'time_limit') {
        assert.equal(raw.winner, -1, '未决不能计胜');
        assert.ok(raw.elapsed >= p.observe_seconds);
        assert.ok(raw.metrics[0].heartbeats > 0 && raw.metrics[1].heartbeats > 0, '双方心跳均须执行');
    } else {
        assert.ok(raw.winner === 0 || raw.winner === 1);
        assert.ok(raw.terminals.some(t => t.side === 1 - raw.winner && t.state === raw.terminal), '缺少终态回调');
        const loser = raw.after[1 - raw.winner];
        assert.ok(raw.terminal === 'death' ? loser.ghost : !loser.living, '状态与终态不符');
    }
    if (p.strategy === 'perform') assert.ok(raw.launches.some(row => row.actor === raw.before[0].object),
        '绝招交锋组没有实际发动；不能以普攻结果替代');
}
