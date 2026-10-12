// Registered only for new frozen series; preserve earlier conditions and evidence.
import assert from 'node:assert/strict';
import { publicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';

export const gumuPublicForceFixtureRequirements = [
    'Register only in a new frozen series; preserve original exert fallback and public-force launch provenance.',
    'Observe real nonwizard USER identities, character/family, effective levels and not_living; do not substitute NPC exemptions.',
    'Reuse immediate resource/apply observations; actual conditions, busy healing and buff lifecycle belong to separate groups.',
];
const forces = ['suxin-jue', 'yunv-xinjing', 'surge-force'];
const resources = ['qi', 'eff_qi', 'max_qi', 'jing', 'eff_jing', 'max_jing', 'neili', 'max_neili'];
const mapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function validateSnapshot(state, original) {
    assert.ok(mapping(state), '缺少实际角色快照');
    assert.ok(typeof state.object === 'string' && state.object.length, '缺少原角色身份');
    assert.equal(state.object, original.object, '观察角色不能更换');
    for (const key of ['userp', 'playerp', 'interactive']) assert.equal(state[key], 1);
    assert.equal(state.wizardp, 0);
    for (const key of resources) assert.ok(Number.isFinite(state[key]), '缺少实际资源：' + key);
    assert.ok(Object.hasOwn(state, 'busy') && (state.busy === null
        || Number.isSafeInteger(state.busy) && state.busy >= 0), '缺少原忙乱观察');
    assert.ok(Object.hasOwn(state, 'not_living') && [null, 0, 1].includes(state.not_living));
    assert.ok(Object.hasOwn(state, 'conditions') && (state.conditions === null
        || state.conditions === 0 || mapping(state.conditions)), '缺少原异常状态观察');
    for (const key of ['skills', 'mappings', 'preparations', 'effective_skills', 'cultivation', 'learned', 'temp'])
        assert.ok(mapping(state[key]), '缺少映射观察：' + key);
    assert.ok(mapping(state.temp.apply), '缺少属性加成观察');
    for (const values of [state.skills, state.learned])
        for (const value of Object.values(values)) assert.ok(Number.isSafeInteger(value) && value >= 0);
    for (const value of Object.values(state.temp.apply)) assert.ok(Number.isSafeInteger(value));
    for (const key of Object.keys(state.skills))
        assert.equal(state.effective_skills[key], Math.trunc(state.skills[key] / 2)
            + (state.skills[state.mappings[key]] ?? 0) + (state.temp.apply[key] ?? 0), '实际有效等级：' + key);
    for (const key of ['skills', 'mappings', 'preparations', 'cultivation', 'conditions', 'not_living'])
        assert.deepEqual(state[key], original[key], '即时观察不能混入状态变化：' + key);
}

export function gumuPublicForceConditions(catalog, options = {}) {
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    for (const id of [...forces, 'yunv-jian']) assert.ok(catalog.skills.some(s => s.id === id), id);
    const result = publicForceConditions(catalog, options, {
        school: 'gumu', family: '古墓派', forces, sword: 'yunv-jian',
        sources: ['kungfu/class/gumu/lin.c', 'kungfu/class/gumu/yang.c', 'inherit/skill/force.c'],
        note: '真实非巫师USER经原exert回退公共force；三门古墓映射分别采集。已掌握技能、邪气、性格和资源为实验输入，不证明教师可授或当前学习资格。'
            + 'lifeheal区分当前/有效气血，dispel这里只采无异常及受理无作用；power/tianmo只采即时增益/自损，不据此声称自然解除。'
            + '怒海的roar有专属入口，排除本组且由黯然吟组覆盖；素心/心经的roar与三门shot按公共白名单拒绝，不冒充效果成功。',
    }).filter(c => !(c.parameters.skill === 'surge-force' && c.parameters.ability === 'roar'));
    for (const c of result) {
        Object.assign(c.parameters.actor.properties, { gender: '男性', character: '光明磊落' });
        if (c.id.endsWith('lifeheal-l200-max-neili299')) c.parameters.actor.properties.neili = 299;
    }
    return result;
}

export function validateGumuPublicForceRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.collection_group, 'gumu-public-force'); assert.equal(p.school, 'gumu');
    assert.ok(forces.includes(p.skill));
    assert.equal(raw.method, condition.method);
    assert.ok(Number.isFinite(raw.elapsed) && raw.elapsed >= 0, '缺少实际观察耗时');
    assert.ok(!(p.skill === 'surge-force' && p.ability === 'roar'), '黯然吟不是公共拒绝入口');
    for (const key of ['before', 'immediate', 'after', 'metrics']) assert.equal(raw[key]?.length, 2);
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    for (const key of ['attacks', 'interfaces', 'launches', 'callbacks', 'terminals']) assert.ok(Array.isArray(raw[key]));
    assert.equal(raw.callbacks.length, 0); assert.equal(raw.terminals.length, 0);
    for (const [side, cfg] of [[0, p.actor], [1, p.target]]) {
        const b = raw.before[side], m = raw.metrics[side];
        for (const phase of ['before', 'immediate', 'after']) validateSnapshot(raw[phase][side], b);
        assert.deepEqual(b.skills, cfg.skills); assert.deepEqual(b.mappings, cfg.mappings);
        assert.deepEqual(b.preparations, cfg.preparations); assert.deepEqual(b.learned, {});
        assert.deepEqual(b.temp.apply, { armor: 100 }, '本组不混入额外装备或强化');
        assert.equal(b.not_living ?? 0, cfg.properties.not_living ?? 0);
        assert.ok(mapping(m));
        for (const value of Object.values(m))
            assert.ok(Number.isSafeInteger(value) && value >= 0, '未知指标不可补零');
        assert.equal(m.heartbeats ?? 0, 0);
        for (const [key, value] of Object.entries(cfg.properties))
            assert.equal(key.includes('/') || key === 'character' ? b.cultivation[key] : b[key], value, key);
        assert.equal(b.effective_skills.force, Math.trunc(cfg.skills.force / 2) + (cfg.skills[cfg.mappings.force] ?? 0));
        assert.equal(b.busy ?? 0, cfg.busy ?? 0);
        const learned = side === 0 && p.expected === 'observed' ? { force: 1 } : {};
        for (const phase of ['immediate', 'after']) assert.deepEqual(raw[phase][side].learned, learned);
        for (const key of ['qi', 'eff_qi', 'jing', 'eff_jing', 'neili']) {
            const delta = raw.after[side][key] - b[key];
            let cost = Math.max(0, -delta), recovery = Math.max(0, delta);
            if (side === 1 && key === 'qi' && p.expected === 'observed' && p.ability === 'lifeheal') {
                // The game adds qi before clamping it to the newly cured eff_qi.
                // Keep both observed movements; clamping is not treatment damage.
                const force = raw.before[0].effective_skills.force;
                const limit = Math.min(b.max_qi, b.eff_qi + 10 + Math.trunc(force / 2));
                recovery = 10 + Math.trunc(force / 3);
                cost = Math.max(0, b.qi + recovery - limit);
            }
            assert.equal(m[key + '_cost'] ?? 0, cost, '即时下降量须与原事件账一致：' + key);
            assert.equal(m[key + '_recovery'] ?? 0, recovery, '即时上升量须与原事件账一致：' + key);
            assert.equal(recovery - cost, delta, '事件净变化须等于前后资源差：' + key);
        }
    }
    assert.deepEqual(raw.launches.map(launch => {
        assert.equal(launch.actor, raw.before[0].object); assert.equal(launch.skill, 'force');
        return launch.argument;
    }), p.expected === 'observed' ? [p.action.slice(6)] : [], '公共回退与指定对象须有实际发动证据');
    assert.equal(raw.metrics[0].ability_launched ?? 0, raw.launches.length);
    assert.equal(raw.metrics[1].ability_launched ?? 0, 0);
    validateWudangPublicForceRecord(raw, condition);
    if (p.expected === 'refused' && ['roar', 'shot'].includes(p.ability))
        assert.match(raw.reason, /没有这种功能/, '不能由缺目标或缺工具伪装白名单拒绝');
    if (p.expected === 'observed' && ['power', 'tianmo'].includes(p.ability))
        assert.equal(raw.immediate[0].busy ?? 0, p.fighting ? 3 : 0, '本组无互搏或狡黠减忙');
}
