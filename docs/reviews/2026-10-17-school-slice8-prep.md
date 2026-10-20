# 门派代表切片第 8 批预研（tangmen/xiakedao/yunlong）

只读调研。tangmen=唐门世家、xiakedao=侠客岛、yunlong=云龙门。

## schools 对象（可直接抄入 school_slice8_cases.mjs）

```js
tangmen: {
    skill: 'tangmen-throwing', ability: 'hua', usage: 'throwing',
    grant: null, forceSkill: 'biyun-xinfa',
    kind: 'receive', weapon: null, prepared: null, family: '唐门世家',
    title: '唐门暗器「唐花」', directType: null, percent: null, baseLevel: 250,
    hold: true,
    learnSkills: { 'boyun-suowu': 250 },
    gates: [
        { key: 'level', pair: [179, 180], field: 'skill',
            refusal: '你的唐门暗器不够娴熟，难以施展唐花。\n' },
        { key: 'boyun', pair: [179, 180], field: 'boyun-suowu',
            refusal: '你的拨云锁雾不够娴熟，无法施展唐花。\n' },
        { key: 'force', pair: [199, 200], field: 'effective-force',
            refusal: '你的内功修为不足，难以施展唐花。\n' },
        { key: 'max_neili', pair: [1199, 1200], field: 'max_neili',
            refusal: '你的内力修为不足，难以施展唐花。\n' },
        { key: 'neili', pair: [149, 150], field: 'neili',
            refusal: '你现在真气不足，难以施展唐花。\n' },
    ],
    feeHit: 100, feeMiss: 100, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'dex', pair: [29, 30], property: true,
        refusal: '你的身法不够灵巧，无法学习唐门暗器。\n' },
},
xiakedao: {
    skill: 'taixuan-gong', ability: 'hun', abilityPath: 'perform/hun', usage: 'unarmed',
    grant: 'can_perform/taixuan-gong/hun', forceSkill: 'taixuan-gong',
    kind: 'direct', weapon: null, prepared: 'unarmed', family: '侠客岛',
    title: '太玄功「混天一气」', directType: 'UNARMED', percent: 80, baseLevel: 250,
    percentRange: [80, 84],
    gates: [
        { key: 'level', pair: [199, 200], field: 'skill',
            refusal: '你的太玄功还不够娴熟，难以施展「混天一气」。\n' },
        { key: 'neili', pair: [599, 600], field: 'neili',
            refusal: '你的内力不够，难以施展「混天一气」。\n' },
    ],
    feeHit: 600, feeMiss: 300, hitBusy: 3, missBusy: 2,
    learnGate: { field: 'int', pair: [37, 38], property: true,
        refusal: '你若有所悟，然而总是有点不明白。\n' },
},
yunlong: {
    skill: 'yunlong-jian', ability: 'xian', usage: 'sword',
    grant: null, forceSkill: 'yunlong-shengong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '云龙门',
    title: '云龙剑法「云龙三现」', directType: 'WEAPON', percent: 30, baseLevel: 250,
    gates: [
        { key: 'level', pair: [49, 50], field: 'skill',
            refusal: '你的云龙剑法不够娴熟，不会使用「云龙三现」！\n' },
        { key: 'force', pair: [119, 120], field: 'effective-force',
            refusal: '你的内功火候不够，不能使用「云龙三现」。\n' },
        { key: 'neili', pair: [299, 300], field: 'neili',
            refusal: '你现在真气不够，不能使用「云龙三现」！\n' },
    ],
    feeHit: 180, feeMiss: 100, hitBusy: 2, missBusy: 4,
    learnGate: { field: 'max_neili', pair: [899, 900], property: true,
        refusal: '你的内力不够。\n' },
},
```

## 关键约束

1. **tangmen kind=receive**：无 do_damage，wound=伤害 100% + weapon hit_ob。需新校验分支。夹具须 handing 通用暗器（hold:true）。
2. **xiakedao 严禁 literate**：valid_enable/perform_action_file 均拒绝有 literate 的角色。percent 80+random(5)。反向命中等号成立。fee 不对称 600/300。
3. **yunlong 非标准命中**：`random(我force) > 目标force/2`。hit 转向有 1/250 失手率（random 上界为 force 有效值，得 0 失手）。
4. **tangmen 无 grant**、xiakedao 有 grant、yunlong 无 grant。
