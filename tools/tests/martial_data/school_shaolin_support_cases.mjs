// School-specific inputs through the original shared force interfaces, without replacing effects.
import assert from 'node:assert/strict';
import { healingConditions, validateWudangHealingRecord } from './school_wudang_healing_cases.mjs';
import { dispelConditions, validateWudangDispelRecord } from './school_wudang_dispel_cases.mjs';
import { buffConditions, validateWudangBuffRecord } from './school_wudang_buffs_cases.mjs';
import { shaolinForces } from './school_shaolin_cultivation_cases.mjs';

export function shaolinSupportConditions(catalog, options = {}) {
    const profile = { school: 'shaolin', family: '少林派', forces: shaolinForces,
        sword: 'damo-jian', skills: { buddhism: 800 },
        sources: ['kungfu/class/shaolin/da-mo.c', 'kungfu/class/shaolin/du-e.c',
            'kungfu/class/shaolin/du-yuan.c', 'inherit/skill/force.c', 'kungfu/skill/buddhism.c'] };
    const common = '真实非巫师USER经原exert；四门少林内功各自施展，佛学800隔离已另测的运功反噬。等级、门派、资源及辅助资格为实验赋值，不证明自然养成或师承可达。';
    const result = [
        ...healingConditions(catalog, options, { ...profile,
            note: common + 'heal/inspire由原心跳continue_action推进，不直接调用、不加速；breakup指打通任督二脉，非reborn转世。单跳治疗、自然恢复、耗尽和halt分账；原MA-080结束标记残留不修改。90秒为故障看门狗，不是持续时间或时长分布结论。' }),
        ...dispelConditions(catalog, options, { ...profile,
            note: common + '异常经原apply_condition准备，非自然染病或施毒证明；辅助医毒、打通任督二脉、天佑及免毒各自设定。只测即时异常驱除，不运行异常发作或过期心跳；受理、清除、部分减轻及不变分列，忙乱原单位不换算成秒。' }),
        ...buffConditions(catalog, options, { ...profile,
            note: common + '原power/tianmo序列含显式refill_neili补给并独立记账，不当自然恢复。邪气及额外枪斧锤映射不代表少林教学；无心跳、不手工清标记、不构造过期。原save_object/restore_object仅验证nosave存储语义，临时测试文件不含正式存档，不代替登录、断线、死亡全链。' }),
    ];
    for (const c of result) c.id = c.id.replace('school-shaolin-', 'school-shaolin-support-');
    return result;
}

export function validateShaolinSupportRecord(raw, condition) {
    const p = condition.parameters;
    assert.equal(p.school, 'shaolin'); assert.equal(p.family, '少林派');
    assert.ok(shaolinForces.includes(p.skill));
    assert.equal(raw.before[0].userp, 1); assert.equal(raw.before[0].wizardp, 0);
    assert.equal(raw.before[0].skills.buddhism, 800);
    assert.deepEqual(raw.before[0].skills, p.actor.skills);
    if (p.collection_group === 'shaolin-healing') return validateWudangHealingRecord(raw, condition);
    if (p.collection_group === 'shaolin-dispel') return validateWudangDispelRecord(raw, condition);
    assert.equal(p.collection_group, 'shaolin-buffs');
    return validateWudangBuffRecord(raw, condition);
}
