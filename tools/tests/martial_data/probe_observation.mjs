// Validate discovery provenance, not per-ability effects or full lifecycle acceptance.
import assert from 'node:assert/strict';

export function validateProbeAbilityRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.variant, 'probe');
    assert.equal(p.probe_contract, 2, '旧通用 probe 缺少已核对配置，只保留为未验收调查原件');
    assert.equal(raw.kind, 'sample');
    assert.equal(raw.condition_id, condition.id);
    assert.equal(raw.method, condition.method);
    assert.ok(['perform', 'exert'].includes(raw.method));
    if (raw.outcome === 'error') return { discovery_only: true };
    const actor = raw.before?.[0];
    assert.ok(actor?.object && raw.after?.[0]?.object === actor.object, '调查玩家身份不一致');
    for (const [skill, level] of Object.entries(p.actor.skills))
        assert.equal(actor.skills[skill], level, '调查技能准备不一致：' + skill);
    assert.deepEqual(actor.mappings, p.actor.mappings, '调查激发与配置不一致');
    const action = raw.method === 'perform'
        ? 'perform ' + p.usage + '.' + p.ability : 'exert ' + p.ability;
    assert.ok(p.action === action || p.action.startsWith(action + ' '), '调查命令路由不一致');
    assert.ok(Array.isArray(raw.launches), '缺少真实发动观察');
    const launches = raw.launches.filter(l => l.actor === actor.object && l.skill === p.skill
        && l.argument.split(' ')[0] === p.ability);
    if (raw.outcome === 'observed') {
        assert.equal(raw.command_accepted, 1, '未受理的命令不能标发动');
        assert.ok(launches.length > 0, '没有目标技能真实发动');
    } else {
        assert.equal(raw.outcome, 'refused');
        assert.equal(launches.length, 0, '实际发动不得标拒绝');
        assert.ok(raw.reason?.trim(), '拒绝缺少原始理由');
    }
    return { discovery_only: true, launches: launches.length };
}
