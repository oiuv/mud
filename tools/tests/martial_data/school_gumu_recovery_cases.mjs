// Independent Gumu records share reviewed public mechanics, not another school's samples.
import assert from 'node:assert/strict';
import { forceRecoveryConditions, validateQuanzhenRecoveryRecord } from './school_quanzhen_recovery_cases.mjs';
import { gumuForces, gumuForceCapacity } from './school_gumu_cultivation_cases.mjs';

export const gumuRecoveryFields = ['improve/neili', 'breakup', 'special_skill/self',
    'special_skill/mystery', 'special_skill/guimai', 'class', 'family/family_name', 'character'];
export const gumuRecoveryFixtureRequirements = [
    'Register and collect new Gumu series only after the frozen batch; keep the shared recovery builder unchanged.',
    'Observe self/character and all capacity fields, basic versus mapped force learning, and the actual public fallback launch.',
    'Reuse original heartbeat continue_action and paired exercise observations; natural healing, conversion and halt are separate, never call exercising directly or accelerate time.',
];

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
function validateSnapshot(state) {
    assert.ok(state && typeof state === 'object' && !Array.isArray(state), '缺少角色快照');
    assert.ok(typeof state.object === 'string' && state.object.length, '缺少原角色身份');
    for (const key of [...resources, 'potential']) assert.ok(Number.isFinite(state[key]), '缺少资源观察：' + key);
    assert.ok(Object.hasOwn(state, 'learned_points') && (state.learned_points === null
        || Number.isFinite(state.learned_points)), '缺少已用潜能观察');
    assert.ok(Object.hasOwn(state, 'busy') && (state.busy === null || state.busy === '<function>'
        || Number.isFinite(state.busy) && state.busy >= 0), '缺少原忙乱观察');
    for (const key of ['skills', 'mappings', 'learned', 'effective_skills', 'cultivation', 'temp'])
        assert.ok(state[key] && typeof state[key] === 'object' && !Array.isArray(state[key]), '缺少映射观察：' + key);
    for (const key of gumuRecoveryFields) assert.ok(Object.hasOwn(state.cultivation, key), '缺少原属性：' + key);
    for (const key of ['userp', 'interactive', 'playerp']) assert.equal(state[key], 1);
    assert.equal(state.wizardp, 0);
}

export function gumuRecoveryConditions(catalog, options = {}) {
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    const rows = forceRecoveryConditions(catalog, {
        school: 'gumu', family: '古墓派', forces: gumuForces, capacity: gumuForceCapacity,
        sources: ['kungfu/skill/suxin-jue.c', 'kungfu/skill/yunv-xinjing.c', 'kungfu/skill/surge-force.c',
            ...['li', 'lin', 'longnv', 'yang'].map(k => `kungfu/class/gumu/${k}.c`)],
    }, options);
    for (const c of rows) {
        c.parameters.actor.properties.str = 45;
        c.parameters.qualification_sources = [...new Set(c.parameters.qualification_sources)];
        c.parameters.qualification_note += '古墓三门恢复均回退公共force入口，记录基本内功熟练度而非冒充特殊内功增长。男性/先天悟性36/膂力45为实验配置；低内力和已有容量状态用于观察已掌握技能，不代表当前能通过学习资格。心经和怒海不同容量只影响原打坐收功，不虚构专属恢复倍率。';
    }
    return rows;
}

export function validateGumuRecoveryRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-recovery'); assert.equal(p.school, 'gumu');
    assert.ok(gumuForces.includes(p.skill)); assert.equal(raw.outcome, p.expected);
    assert.equal(raw.method, condition.method, '原调用方式');
    for (const k of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[k]?.length, 2);
    for (const k of ['attacks', 'launches', 'interfaces', 'callbacks']) assert.ok(Array.isArray(raw[k]));
    assert.equal(raw.interfaces.length, 0);
    for (const m of raw.metrics) {
        assert.ok(m && typeof m === 'object' && !Array.isArray(m));
        for (const value of Object.values(m)) assert.ok(Number.isFinite(value) && value >= 0, '未知计量不得当零');
    }
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side];
        for (const phase of ['before', 'immediate', 'after']) {
            const state = raw[phase][side]; validateSnapshot(state);
            assert.equal(state.object, b.object, '观察角色不可更换');
            assert.deepEqual(state.cultivation, b.cultivation);
        }
        assert.equal(b.busy ?? 0, config.busy ?? 0);
        assert.deepEqual(b.skills, config.skills); assert.deepEqual(b.mappings, config.mappings);
        assert.deepEqual(raw.after[side].mappings, b.mappings);
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(gumuRecoveryFields.includes(key) ? b.cultivation[key] : b[key], value, key);
        // The original observer is a sparse event ledger: absent counters mean no
        // event, but an absent ledger/snapshot or a null counter is not zero.
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
            assert.equal(raw.after[side][key] - b[key],
                (raw.metrics[side][key + '_recovery'] ?? 0) - (raw.metrics[side][key + '_cost'] ?? 0),
                '资源净值与原事件账不符：' + key);
    }
    const before = raw.before[0], after = raw.after[0];
    for (const key of gumuRecoveryFields) {
        assert.ok(Object.hasOwn(before.cultivation, key), '缺少原属性：' + key);
        assert.equal(before.cultivation[key] ?? 0, p.actor.properties[key] ?? 0, key);
    }
    assert.equal(before.effective_skills.force, Math.trunc(p.actor.skills.force / 2)
        + (p.actor.mappings.force ? p.actor.skills[p.actor.mappings.force] : 0));
    assert.deepEqual(after.cultivation, before.cultivation);
    validateQuanzhenRecoveryRecord(raw, condition);
    if (p.expected === 'refused') assert.ok(raw.reason);
    if (condition.method === 'exert') {
        assert.ok(before.learned && after.learned);
        for (const k of new Set([...Object.keys(before.learned), ...Object.keys(after.learned), 'force', p.skill]))
            assert.equal((after.learned[k] ?? 0) - (before.learned[k] ?? 0),
                k === 'force' && p.expected === 'observed' ? 1 : 0, '公共回退的熟练度：' + k);
    }
    if (condition.method === 'exercise') {
        assert.ok(Array.isArray(raw.exercise_steps), '缺少打坐回调观察');
        assert.deepEqual(after.learned, before.learned, '打坐不冒充武学熟练度增长');
        if (p.expected === 'observed') {
            assert.equal(raw.immediate[0].temp.exercise_cost, p.exercise_cost, '原打坐请求量');
            for (const key of resources) assert.equal(raw.immediate[0][key], before[key], '入口不得提前转换：' + key);
        }
    }
    let converted = 0, elapsed = 0;
    for (const [i, step] of (raw.exercise_steps ?? []).entries()) {
        validateSnapshot(step.state);
        assert.equal(step.state.object, before.object, '回调归属');
        assert.deepEqual(step.state.skills, before.skills);
        assert.deepEqual(step.state.mappings, before.mappings);
        assert.deepEqual(step.state.cultivation, before.cultivation);
        assert.equal(step.state.effective_skills.force, before.effective_skills.force);
        assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= elapsed, '原回调时钟'); elapsed = step.elapsed;
        assert.ok(Number.isFinite(step.state.temp.exercise_cost), '缺少剩余耗气观察');
        assert.ok(Number.isFinite(step.state.temp.pending?.exercise), '缺少打坐状态观察');
        assert.equal(step.limit, gumuForceCapacity(p.actor, true));
        if (!(i % 2)) {
            assert.equal(step.state.temp.pending.exercise, 1);
            assert.equal(step.state.temp.exercise_cost, i ? raw.exercise_steps[i - 1].state.temp.exercise_cost : p.exercise_cost,
                '逐跳剩余耗气连续');
        }
        if (i % 2) converted += raw.exercise_steps[i - 1].state.qi - step.state.qi;
    }
    if (raw.exercise_steps?.length) {
        assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= elapsed, '缺少完整观察耗时');
        assert.equal(raw.metrics[0].qi_cost, converted, '逐跳耗气与原事件账');
        assert.ok(raw.metrics[0].neili_recovery >= converted, '转换不得混成自然回血');
        assert.ok(Number.isFinite(after.temp.exercise_cost), '缺少终态剩余耗气');
        assert.ok(Number.isFinite(after.temp.pending?.exercise), '缺少终态打坐状态');
        assert.equal(after.temp.exercise_cost, raw.exercise_steps.at(-1).state.temp.exercise_cost);
        if (!p.halt_after) assert.equal(raw.exercise_steps.at(-1).state.temp.pending.exercise, 0, '原收功回调须完成');
        assert.equal(after.max_neili, raw.exercise_steps.at(-1).state.max_neili, '自然恢复/中断不能增加额外容量');
    }
}
