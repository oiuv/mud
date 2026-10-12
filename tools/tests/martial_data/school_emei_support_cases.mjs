// Emei inputs reuse the original shared force commands and existing observation methods.
import assert from 'node:assert/strict';
import { healingConditions, validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { dispelConditions, validateWudangDispelRecord } from './school_wudang_dispel_cases.mjs';
import { buffConditions, validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { emeiForces } from './school_emei_cultivation_cases.mjs';

export function emeiSupportConditions(catalog, options = {}) {
    assert.ok(Number.isSafeInteger(options.samples ?? 100) && (options.samples ?? 100) > 0);
    for (const skill of [...emeiForces, 'emei-jian', 'mahayana'])
        assert.ok(catalog.skills.some(s => s.id === skill), '缺少峨嵋辅助来源：' + skill);
    const profile = { school: 'emei', family: '峨嵋派', forces: emeiForces,
        sword: 'emei-jian', sources: ['kungfu/class/emei/miejue.c', 'kungfu/class/emei/emei.h',
            'inherit/skill/force.c', 'kungfu/skill/mahayana.c'] };
    const common = '真实非巫师女性USER经原exert；三门峨嵋内功分别施展。等级、门派、资源、大乘和辅助资格为实验赋值，不证明自然养成或师承可达。';
    const result = [
        ...healingConditions(catalog, options, { ...profile,
            note: common + 'heal/inspire由原心跳continue_action推进，不直接调用、不加速；breakup指打通任督二脉，非reborn转世。单跳治疗、自然恢复、耗尽和halt分账；原MA-080结束标记残留不修改。90秒为故障看门狗，不是持续时间或时长分布结论。' }),
        ...dispelConditions(catalog, options, { ...profile,
            note: common + '异常经原apply_condition准备，非自然染病或施毒证明；辅助医毒、打通任督二脉、天佑及免毒各自设定。只测即时异常驱除，不运行异常发作或过期心跳；受理、清除、部分减轻及不变分列，忙乱原单位不换算成秒。' }),
        ...buffConditions(catalog, options, { ...profile,
            note: common + '原power/tianmo序列含显式refill_neili补给并独立记账，不当自然恢复。邪气及额外枪斧锤映射不代表峨嵋教学；无心跳、不手工清标记、不构造过期。原save_object/restore_object仅验证nosave存储语义，临时测试文件不含正式存档，不代替登录、断线、死亡全链。' }),
    ];
    for (const c of result) {
        c.id = c.id.replace('school-emei-', 'school-emei-support-');
        c.parameters.actor.properties.gender = '女性';
        c.parameters.actor.skills.mahayana = Math.max(200, c.parameters.level);
    }
    return result;
}

export function validateEmeiSupportRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'emei'); assert.equal(p.family, '峨嵋派');
    assert.ok(emeiForces.includes(p.skill));
    for (const [side, config] of [[0, p.actor], [1, p.target]]) {
        const state = raw.before[side], metrics = raw.metrics?.[side];
        assert.equal(state.userp, 1); assert.equal(state.interactive, 1);
        assert.equal(state.playerp, 1); assert.equal(state.wizardp, 0);
        assert.deepEqual(state.skills, config.skills); assert.deepEqual(state.mappings, config.mappings);
        assert.ok(metrics && typeof metrics === 'object' && !Array.isArray(metrics), '缺失资源观测不等于零');
        for (const value of Object.values(metrics)) assert.ok(Number.isFinite(value), '计数未知不能伪造为零');
        for (const [key, value] of Object.entries(config.properties))
            assert.equal(key.includes('/') || ['breakup', 'character'].includes(key)
                ? state.cultivation[key] : state[key], value, key);
        assert.equal(state.effective_skills.force ?? 0, Math.trunc((config.skills.force ?? 0) / 2)
            + (config.skills[config.mappings.force] ?? 0));
    }
    assert.equal(raw.before[0].gender, '女性');
    assert.equal(raw.before[0].skills.mahayana, Math.max(200, p.level));
    if (p.collection_group === 'emei-healing') return validateWudangHealingRecord(raw, condition);
    if (p.collection_group === 'emei-dispel') return validateWudangDispelRecord(raw, condition);
    assert.equal(p.collection_group, 'emei-buffs');
    return validateWudangBuffRecord(raw, condition);
}
