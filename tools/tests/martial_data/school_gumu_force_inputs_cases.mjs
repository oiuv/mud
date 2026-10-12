// Follow up the explicitly untriggered input contrasts without rewriting old samples.
import assert from 'node:assert/strict';
import { gumuWeaponConditions } from './school_gumu_weapons_cases.mjs';

export const gumuForceInputReviewed = 'b77f545a2ef8f4f2e32d1cdb18e65d903c8bfb25173b247adcae8d8e7bb45e81';
export const gumuForceInputVariants = ['baseline', 'damage0', 'damage100000', 'factor100000', 'neili300', 'con0'];

export function gumuForceInputConditions(catalog, { smoke = false } = {}) {
    assert.equal(typeof smoke, 'boolean');
    assert.equal(catalog.skills.find(s => s.id === 'yunv-xinjing')?.sha256, gumuForceInputReviewed,
        '玉女心经原命中接口改变，须重新核对输入对照');
    const original = gumuWeaponConditions(catalog, { smoke, samples: 100 }), result = [];
    for (const skill of ['suxin-jian', 'yinsuo-jinling']) {
        const baseline = original.find(c => c.id === `school-gumu-weapons-${skill}-force-level800`);
        assert.ok(baseline, '缺少已核对的800级原接口基准');
        for (const variant of gumuForceInputVariants) {
            const c = structuredClone(baseline), p = c.parameters;
            c.id = `school-gumu-force-inputs-${skill}-${variant}`;
            c.status = 'configured_not_executed';
            if (variant === 'damage0') p.interface.damage = 0;
            if (variant === 'damage100000') p.interface.damage = 100000;
            if (variant === 'factor100000') p.interface.factor = 100000;
            if (variant === 'neili300') p.actor.properties.neili = 300;
            if (variant === 'con0') p.target.properties.con = 0;
            p.qualification_note = '补采旧200级对照被有效根骨挡住的缺口；剑与鞭分别使用800级原命中接口，'
                + '每次只改变输入伤害、factor、当前内力或目标先天根骨之一。真实随机与首次加载保持，'
                + '不保证触发、不强制命中；先天根骨0不等于有效根骨0。实验口诀与配功不证明师承或自然养成。'
                + '复用gumu-weapons原观察/校验/报告；新系列不覆盖旧样本，不作为普通攻击、绝招或整场伤害统计。';
            result.push(c);
        }
    }
    return result;
}
