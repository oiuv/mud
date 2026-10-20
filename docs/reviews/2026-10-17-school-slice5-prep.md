# 门派代表切片第 5 批预研（henshan/songshan/lingxiao/tianlongsi）

只读调研。命名辨析：henshan=衡山派（henshan-jian）、songshan=嵩山派、lingxiao=凌霄城（lingxiao-quan）、tianlongsi=大理段家（sun-finger）。

## schools 对象（可直接抄入 school_slice5_cases.mjs）

```js
henshan: {
    skill: 'henshan-jian', ability: 'huan', usage: 'sword',
    grant: 'can_perform/henshan-jian/huan', forceSkill: 'henshan-xinfa',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '衡山派',
    title: '衡山剑法「幻剑式」', directType: 'WEAPON', percent: 10, baseLevel: 250,
    gates: [
        { key: 'level', pair: [59, 60], field: 'skill',
            refusal: '你衡山剑法不够娴熟，难以施展「幻剑式」。\n' },
        { key: 'force', pair: [79, 80], field: 'effective-force',
            refusal: '你的内功火候不够，难以施展「幻剑式」。\n' },
        { key: 'neili', pair: [49, 50], field: 'neili',
            refusal: '你现在的真气不够，难以施展「幻剑式」。\n' },
    ],
    feeHit: 50, feeMiss: 30, hitBusy: 2, missBusy: 2,
    learnGate: { field: 'max_neili', pair: [79, 80], property: true,
        refusal: '你目前的内力修为不够，没有办法练衡山剑法。\n' },
},
songshan: {
    skill: 'songshan-quan', ability: 'chui', usage: 'cuff',
    grant: 'can_perform/songshan-quan/chui', forceSkill: 'songshan-xinfa',
    kind: 'direct', weapon: null, prepared: 'cuff', family: '嵩山派',
    title: '嵩山拳法「千斤锤」', directType: 'UNARMED', percent: 35, baseLevel: 250,
    gates: [
        { key: 'level', pair: [29, 30], field: 'skill',
            refusal: '你嵩山拳法不够娴熟，难以施展「千斤锤」。\n' },
        { key: 'force', pair: [39, 40], field: 'effective-force',
            refusal: '你的内功修为不够，难以施展「千斤锤」。\n' },
        { key: 'neili', pair: [119, 120], field: 'neili',
            refusal: '你现在的真气不够，难以施展「千斤锤」。\n' },
    ],
    feeHit: 100, feeMiss: 30, hitBusy: [2, 3], missBusy: [2, 5],
    learnGate: { field: 'max_neili', pair: [199, 200], property: true,
        refusal: '你的内力修为太弱，无法练嵩山拳法。\n' },
},
lingxiao: {
    skill: 'lingxiao-quan', ability: 'jue', usage: 'cuff',
    grant: 'can_perform/lingxiao-quan/jue', forceSkill: 'xueshan-neigong',
    kind: 'direct', weapon: null, prepared: 'cuff', family: '凌霄城',
    title: '凌霄拳法「凌宵总诀」', directType: 'UNARMED', percent: 20, baseLevel: 250,
    gates: [
        { key: 'level', pair: [59, 60], field: 'skill',
            refusal: '你的凌霄拳法不够娴熟，难以施展「凌宵总诀」。\n' },
        { key: 'force', pair: [99, 100], field: 'effective-force',
            refusal: '你的内功修为不够，难以施展「凌宵总诀」。\n' },
        { key: 'neili', pair: [99, 100], field: 'neili',
            refusal: '你现在真气不够，难以施展「凌宵总诀」。\n' },
    ],
    feeHit: 50, feeMiss: 30, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'effective-force', pair: [29, 30],
        refusal: '你的内功火候不够，无法学凌霄拳法。\n' },
},
tianlongsi: {
    skill: 'sun-finger', ability: 'qiankun', usage: 'finger',
    grant: null, forceSkill: 'duanshi-xinfa',
    kind: 'direct', weapon: null, prepared: 'finger', family: '大理段家',
    title: '一阳指「一指乾坤」', directType: 'UNARMED', percent: 66, baseLevel: 250,
    gates: [
        { key: 'level', pair: [99, 100], field: 'skill',
            refusal: '你的一阳指修为不够，目前还不能施展一指乾坤绝技！\n' },
        { key: 'force', pair: [159, 160], field: 'effective-force',
            refusal: '你内功火候不够，难以施展一指乾坤！\n' },
        { key: 'neili', pair: [499, 500], field: 'neili',
            refusal: '你的真气不够，无法施展「一指乾坤」！\n' },
    ],
    feeHit: 200, feeMiss: 50, hitBusy: 1, missBusy: 3,
    learnGate: { field: 'str', pair: [33, 34], property: true,
        refusal: '你的先天膂力孱弱，无法领会一阳指。\n' },
},
```

## 关键约束

1. **tianlongsi grant=null**：qiankun.c 无 can_perform 授权门（无 userp grant 检查）。
2. **lingxiao 非标准命中**：`random(cuff_eff) > target dodge_eff/2`（非 ap/2+random）。
3. **tianlongsi 性别门**：valid_learn 首门 gender="男性"（fixture 须男性）+ str≥34 + dex≥30。
4. **songshan busy 随机区间**：hit 2+random(2)=[2,3]、miss 2+random(3)=[2,4]。
5. **henshan percent=10**（全库第二低）。
6. **lingxiao 仅查主手 weapon**（不查 secondary_weapon）。
7. **songshan 只查 prepared 不查 mapped**。

## 契约速查

| 派 | 绝招 | type/percent | fee hit/miss | busy hit/miss | 命中 |
| --- | --- | --- | --- | --- | --- |
| henshan | 幻剑式 | WEAPON/10 | 50/30 | 2/2 | ap=sword_eff |
| songshan | 千斤锤 | UNARMED/35 | 100/30 | [2,3]/[2,4] | ap=cuff_eff |
| lingxiao | 凌宵总诀 | UNARMED/20 | 50/30 | 2/3 | random(cuff)>dodge/2 |
| tianlongsi | 一指乾坤 | UNARMED/66 | 200/50 | 1/3 | ap=finger_eff+force_eff |
