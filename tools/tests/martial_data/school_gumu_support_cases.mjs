// Independent Gumu support observations; original public mechanics and matrices stay frozen.
import assert from 'node:assert/strict';
import { healingConditions, validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { dispelConditions, validateWudangDispelRecord } from './school_wudang_dispel_cases.mjs';
import { buffConditions, validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { healingEffects, dispelEffects, buffSequenceEffects } from './school_public_force_report.mjs';

const forces = ['suxin-jue', 'yunv-xinjing', 'surge-force'];
export const gumuSupportFixtureRequirements = [
    'Register in a new frozen series, reusing original healing heartbeat callbacks, condition snapshots and buff steps.',
    'Capture real USER identity, family/character, actual effective levels and resources; no NPC or foreign-school exemptions.',
    'Record original halt, natural regeneration, pending residue and explicit refills separately; storage probes do not prove login/death lifecycle.',
];

const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function validateSnapshot(state, original) {
    assert.ok(mapping(state), '缺少原角色快照');
    assert.ok(typeof state.object === 'string' && state.object.length, '缺少原角色身份');
    if (original) assert.equal(state.object, original.object, '观察角色不能更换');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1);
    assert.equal(state.wizardp, 0);
    for (const key of [...resources, 'con', 'effective_con'])
        assert.ok(Number.isFinite(state[key]), '缺少实际资源或根骨：' + key);
    assert.ok(Object.hasOwn(state, 'busy') && (state.busy === null || state.busy === '<function>'
        || Number.isSafeInteger(state.busy) && state.busy >= 0), '缺少原忙乱观察');
    assert.ok(Object.hasOwn(state, 'conditions') && (state.conditions === null
        || state.conditions === 0 || mapping(state.conditions)), '缺少原异常状态观察');
    for (const key of ['skills', 'mappings', 'effective_skills', 'cultivation', 'learned', 'temp'])
        assert.ok(mapping(state[key]), '缺少映射观察：' + key);
    assert.ok(mapping(state.temp.apply), '缺少装备及强化属性观察');
    for (const values of [state.skills, state.learned])
        for (const value of Object.values(values))
            assert.ok(Number.isSafeInteger(value) && value >= 0, '原技能/熟练度不是已知非负整数');
    for (const value of Object.values(state.temp.apply))
        assert.ok(Number.isSafeInteger(value), '未知属性加成不能补零');
    for (const key of Object.keys(state.skills))
        assert.equal(state.effective_skills[key], Math.trunc(state.skills[key] / 2)
            + (state.skills[state.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), '实际有效等级：' + key);
    assert.equal(state.effective_con, state.con + Math.trunc((state.skills.force ?? 0) / 10)
        + (state.temp.apply.con ?? 0), '固定无刺青/转世角色的实际根骨');
    if (original) {
        assert.deepEqual(state.skills, original.skills);
        assert.deepEqual(state.mappings, original.mappings);
        assert.deepEqual(state.cultivation, original.cultivation);
    }
}

// Only explicit native empty values are adapted for the older shared oracle.
// Missing fields are rejected above; the original raw evidence is never rewritten.
function normalizedRecord(raw) {
    const result = structuredClone(raw);
    const states = ['before', 'immediate', 'after'].flatMap(key => result[key]);
    states.push(...(result.healing_steps ?? []).map(step => step.state));
    if (result.healing_halt) states.push(result.healing_halt.before, result.healing_halt.after);
    for (const step of result.buff_steps ?? []) states.push(step.before, step.after);
    for (const state of states) {
        if (state.busy === null) state.busy = 0;
        if (state.conditions === null || state.conditions === 0) state.conditions = {};
    }
    return result;
}

export function gumuSupportConditions(catalog, options = {}) {
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    for (const id of [...forces, 'yunv-jian']) assert.ok(catalog.skills.some(s => s.id === id), id);
    const profile = { school: 'gumu', family: '古墓派', forces, sword: 'yunv-jian',
        sources: ['kungfu/class/gumu/lin.c', 'kungfu/class/gumu/yang.c', 'inherit/skill/force.c'] };
    const common = '真实非巫师USER经原exert回退公共force；三门古墓内功分别采集，不加入大乘或禅宗豁免。技能/性格/邪气/门派及辅助资格为实验赋值，不证明当前学习资格或师承可得。';
    const result = [
        ...healingConditions(catalog, options, { ...profile,
            note: common + 'heal/inspire沿原心跳，不直接调用或加速；breakup是打通任督二脉而非reborn。单跳治疗、自然恢复、耗尽与原halt分账；MA-080结束标记残留原样观察。90秒只作故障看门狗，不作疗伤时长。' }),
        ...dispelConditions(catalog, options, { ...profile,
            note: common + '异常由原apply_condition准备，不是自然染病或施毒证据；医毒、免毒、天佑和任督资格分列。只采即时驱除，不混入异常发作/过期心跳；受理、清除、部分减轻和不变独立统计。' }),
        ...buffConditions(catalog, options, { ...profile,
            note: common + '原power/tianmo序列的refill_neili是明确实验补给，不是自然恢复；额外枪斧锤映射不证明古墓教学。无心跳、不手工清标记或构造到期；临时save_object/restore_object只测nosave存储语义，不代替登录、断线、死亡全链。' }),
    ];
    for (const c of result) {
        c.id = c.id.replace('school-gumu-', 'school-gumu-support-');
        Object.assign(c.parameters.actor.properties, { gender: '男性', character: '光明磊落' });
    }
    return result;
}

export function validateGumuSupportRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'gumu'); assert.equal(p.family, '古墓派'); assert.ok(forces.includes(p.skill));
    assert.equal(raw.method, condition.method); assert.equal(raw.outcome, p.expected);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0, '缺少实际观察耗时');
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2);
    for (const key of ['attacks', 'interfaces', 'callbacks', 'launches']) assert.ok(Array.isArray(raw[key]));
    assert.equal(raw.attacks.length, 0); assert.equal(raw.interfaces.length, 0); assert.equal(raw.callbacks.length, 0);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], m = raw.metrics[side];
        for (const phase of ['before', 'immediate', 'after']) validateSnapshot(raw[phase][side], b);
        assert.equal(b.busy ?? 0, cfg.busy ?? 0);
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.mappings, cfg.mappings);
        assert.deepEqual(b.conditions === null || b.conditions === 0 ? {} : b.conditions, cfg.conditions ?? {});
        assert.deepEqual(b.temp.apply, { armor: 100 }, '固定初始属性不得混入未知加成');
        for (const [key, value] of Object.entries(cfg.temp ?? {})) assert.equal(b.temp[key], value);
        assert.ok(mapping(m));
        for (const value of Object.values(m))
            assert.ok(Number.isSafeInteger(value) && value >= 0, '未知观测不可补零');
        if (condition.method !== 'healing' || side || p.expected === 'refused') assert.equal(m.heartbeats ?? 0, 0);
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || ['breakup', 'character'].includes(key) ? b.cultivation[key] : b[key], value, key);
        assert.equal(b.effective_skills.force ?? 0, Math.trunc((cfg.skills.force ?? 0) / 2) + (cfg.skills[cfg.mappings.force] ?? 0));
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili'])
            assert.equal(raw.after[side][key] - b[key], (m[key + '_recovery'] ?? 0) - (m[key + '_cost'] ?? 0),
                '资源净变化必须与原事件账一致：' + key);
    }
    let argumentsExpected;
    if (p.collection_group === 'gumu-buffs') {
        assert.ok(Array.isArray(raw.buff_steps));
        for (const step of raw.buff_steps) {
            validateSnapshot(step.before, raw.before[0]); validateSnapshot(step.after, raw.before[0]);
        }
        argumentsExpected = raw.buff_steps.filter(step => step.accepted === 1).map(step => step.operation.command.slice(6));
    } else argumentsExpected = p.expected === 'observed' ? [p.action.slice(6)] : [];
    assert.deepEqual(raw.launches.map(launch => {
        assert.equal(launch.actor, raw.before[0].object); assert.equal(launch.skill, 'force');
        return launch.argument;
    }), argumentsExpected, '原exert回退及指定对象不能由参数推定');
    assert.equal(raw.metrics[0].ability_launched ?? 0, raw.launches.length);
    assert.equal(raw.metrics[1].ability_launched ?? 0, 0);
    if (p.collection_group === 'gumu-healing') {
        assert.ok(Array.isArray(raw.healing_steps), '缺少原疗伤回调');
        let previous = 0;
        for (const step of raw.healing_steps) {
            validateSnapshot(step.state, raw.before[0]);
            assert.ok(Number.isFinite(step.elapsed) && step.elapsed >= previous && step.elapsed <= raw.elapsed,
                '原回调时钟必须位于实际观察窗口内');
            previous = step.elapsed;
        }
        if (p.expected === 'observed') assert.equal(raw.metrics[0].heartbeats, raw.healing_steps.length / 2);
        if (p.halt_after && p.expected === 'observed') {
            validateSnapshot(raw.healing_halt?.before, raw.before[0]);
            validateSnapshot(raw.healing_halt?.after, raw.before[0]);
        }
        if (p.expected === 'observed') {
            const flag = p.ability === 'heal' ? 'healing' : 'inspiring';
            for (const state of [raw.immediate[0], raw.after[0], ...raw.healing_steps.map(step => step.state),
                ...(p.halt_after ? [raw.healing_halt.before, raw.healing_halt.after] : [])])
                assert.ok([0, 1].includes(state.temp.pending?.[flag]), '原疗伤标记缺项不等于已清零');
        }
        return validateWudangHealingRecord(normalizedRecord(raw), condition);
    }
    if (p.collection_group === 'gumu-dispel') return validateWudangDispelRecord(normalizedRecord(raw), condition);
    assert.equal(p.collection_group, 'gumu-buffs');
    return validateWudangBuffRecord(normalizedRecord(raw), condition);
}

// The caller supplies the frozen condition parameters: runner deliberately omits raw.parameters.
// Strict reports reject missing evidence instead of silently manufacturing zero effects.
export function gumuSupportEffects(rows, parameters) {
    const method = parameters.collection_group === 'gumu-healing' ? 'healing' : 'exert';
    const checked = rows.filter(row => ['observed', 'refused'].includes(row.outcome)).map(row => {
        assert.equal(row.outcome, row.raw?.outcome);
        validateGumuSupportRecord(row.raw, { method, parameters });
        return { ...row, raw: normalizedRecord(row.raw) };
    });
    if (parameters.collection_group === 'gumu-healing') return healingEffects(checked, parameters.ability);
    if (parameters.collection_group === 'gumu-dispel') return dispelEffects(checked, parameters);
    assert.equal(parameters.collection_group, 'gumu-buffs');
    return buffSequenceEffects(checked);
}
