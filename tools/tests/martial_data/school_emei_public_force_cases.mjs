// Immediate shared force commands under actual Emei mappings, not exclusive abilities.
import assert from 'node:assert/strict';
import { publicForceConditions, validateWudangPublicForceRecord } from './school_wudang_public_force_cases.mjs';
import { emeiForces } from './school_emei_cultivation_cases.mjs';

export function emeiPublicForceConditions(catalog, options = {}) {
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    for (const skill of [...emeiForces, 'emei-jian'])
        assert.ok(catalog.skills.some(s => s.id === skill), '缺少峨嵋公共运功来源：' + skill);
    const conditions = publicForceConditions(catalog, options, {
        school: 'emei', family: '峨嵋派', forces: emeiForces, sword: 'emei-jian',
        sources: ['kungfu/class/emei/miejue.c', 'inherit/skill/force.c'],
        refusedAbilities: ['roar', 'shot'],
        note: '真实非巫师女性USER经原exert回退公共force，分别记录峨嵋心法/临济/峨嵋九阳，不借用完整九阳神功。等级、映射、邪气和资源为实验赋值，不证明实际师承或正常门派养成。lifeheal使用存活受伤目标；dispel仅无异常和原受理无作用分支，不代表毒伤已测；power/tianmo仅即时效果，不声称自然解除。天魔负神气是独立合法实验输入，正神气异常另查；roar/shot按本三门映射白名单拒绝，不冒充效果成功。',
    });
    for (const c of conditions) {
        c.parameters.actor.properties.gender = '女性';
        // Isolate max_neili's gate without giving this low-capacity actor 6000 neili.
        if (c.id.endsWith('lifeheal-l200-max-neili299')) c.parameters.actor.properties.neili = 299;
    }
    return conditions;
}

export function validateEmeiPublicForceRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'emei'); assert.ok(emeiForces.includes(p.skill));
    assert.equal(raw.command_accepted, Number(p.expected === 'observed'));
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], metrics = raw.metrics?.[side];
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1); assert.equal(state.wizardp, 0);
        assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺失资源观测不等于零');
        for (const value of Object.values(metrics)) assert.ok(Number.isFinite(value), '计数未知不能伪造为零');
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') ? state.cultivation[key] : state[key], value);
        assert.equal(state.effective_skills.force, Math.trunc(config.skills.force / 2)
            + (config.skills[config.mappings.force] ?? 0));
    }
    validateWudangPublicForceRecord(raw, condition);
    if (p.expected === 'refused' && ['roar', 'shot'].includes(p.ability))
        assert.match(raw.reason, /没有这种功能/, '白名单拒绝不能被其他夹具失败代替');
}
