# 门派代表切片第 6 批预研（meizhuang/miao/ouyang/zhenyuan）

只读调研。命名：meizhuang=梅庄、miao=中原苗家、ouyang=白驼山欧阳世家、zhenyuan=八卦门（zhenyuan 目录）。

## schools 对象（可直接抄入 school_slice6_cases.mjs）

```js
meizhuang: {
    skill: 'qixian-wuxingjian', ability: 'shan', usage: 'sword',
    grant: 'can_perform/qixian-wuxingjian/shan', forceSkill: 'xuantian-wujigong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '梅庄',
    title: '七弦无形剑「七弦黄龙闪」', directType: 'REMOTE', percent: 100, baseLevel: 280,
    gates: [
        { key: 'level', pair: [159, 160], field: 'skill',
            refusal: '你的七弦无形剑修为有限，难以施展「七弦黄龙闪」。\n' },
        { key: 'force', pair: [249, 250], field: 'effective-force',
            refusal: '你的内功修为不够，难以施展「七弦黄龙闪」。\n' },
        { key: 'neili', pair: [599, 600], field: 'neili',
            refusal: '你现在的真气不够，难以施展「七弦黄龙闪」。\n' },
    ],
    feeHit: 300, feeMiss: 100, hitBusy: 2, missBusy: 2,
    learnGate: { field: 'max_neili', pair: [2999, 3000], property: true,
        refusal: '你的内力太弱，无法修炼七弦无形剑。\n' },
    learnSkills: { unarmed: 280, 'tanqin-jifa': 280 },
},
miao: {
    skill: 'miaojia-jian', ability: 'gan', usage: 'sword',
    grant: 'can_perform/miaojia-jian/gan', forceSkill: 'miaojia-neigong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '中原苗家',
    title: '苗家剑法「流星赶月」', directType: 'WEAPON', percent: 80, baseLevel: 300,
    gates: [
        { key: 'level', pair: [199, 200], field: 'skill',
            refusal: '你苗家剑法不够娴熟，难以施展「流星赶月」。\n' },
        { key: 'force', pair: [279, 280], field: 'effective-force',
            refusal: '你的内功火候不够，难以施展「流星赶月」。\n' },
        { key: 'max_neili', pair: [2999, 3000], field: 'max_neili',
            refusal: '你的内力修为不够，难以施展「流星赶月」。\n' },
        { key: 'neili', pair: [599, 600], field: 'neili',
            refusal: '你现在真气不够，难以施展「流星赶月」。\n' },
    ],
    feeHit: 500, feeMiss: 500, hitBusy: 3, missBusy: 4,
    learnGate: { field: 'max_neili', pair: [1299, 1300], property: true,
        refusal: '你的内力不够。\n' },
},
ouyang: {
    skill: 'lingshe-zhangfa', ability: 'wuji', usage: 'staff',
    grant: 'can_perform/lingshe-zhangfa/wuji', forceSkill: 'hamagong',
    kind: 'direct', weapon: 'staff', prepared: 'staff', family: '欧阳世家',
    title: '灵蛇杖法「横行无忌」', directType: 'WEAPON', percent: 55, baseLevel: 250,
    gates: [
        { key: 'force', pair: [199, 200], field: 'effective-force',
            refusal: '你的内功火候不够，难以运用使用「横行无忌」！\n' },
        { key: 'neili', pair: [299, 300], field: 'neili',
            refusal: '你现在的真气不够，无法使用「横行无忌」！\n' },
        { key: 'level', pair: [149, 150], field: 'skill',
            refusal: '你的灵蛇杖法还不到家，无法使用「横行无忌」！\n' },
    ],
    feeHit: 200, feeMiss: 80, hitBusy: 3, missBusy: 4, targetBusy: 1,
    learnGate: { field: 'max_neili', pair: [999, 1000], property: true,
        refusal: '你的内力不够。\n' },
},
zhenyuan: {
    skill: 'bagua-zhang', ability: 'ding', usage: 'strike',
    grant: 'can_perform/bagua-zhang/ding', forceSkill: 'nei-bagua',
    kind: 'direct', weapon: null, prepared: 'strike', family: '八卦门',
    title: '八卦掌「背心钉」', directType: 'UNARMED', percent: 20, baseLevel: 250,
    gates: [
        { key: 'force', pair: [119, 120], field: 'effective-force',
            refusal: '你的内功修为不够，难以施展「背心钉」。\n' },
        { key: 'level', pair: [79, 80], field: 'skill',
            refusal: '你的八卦掌不够娴熟，难以施展「背心钉」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你现在真气不够，难以施展「背心钉」。\n' },
    ],
    feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'max_neili', pair: [149, 150], property: true,
        refusal: '你的内力不够，无法练习八卦掌。\n' },
},
```

## 关键约束

1. **meizhuang 双免疫支**：target max_neili<10 或 userp 目标 max_neili+500>actor max_neili → 无直伤、fee 100。actor 须 max_neili ≥ target+500。
2. **meizhuang learn 折叠用 raw**：learnGate 取 max_neili + learnSkills {unarmed, tanqin-jifa}。
3. **miao 掉剑**：skill<260 时武器落地。baseLevel 300 保剑；gate 199/200 样本会掉剑。fee 两分支均 500。
4. **miao valid_learn 首门**：有 daojian-guizhen 直接拒。
5. **zhenyuan 非标准命中**：`random(strike_eff) > dodge_eff/2`（同凌霄 jue）。
6. **zhenyuan family=八卦门**（非镇远镖局）。valid_learn 首门：有 baihua-cuoquan 拒。
7. **ouyang 目标 busy(1)** 两分支都打。
8. **ouyang grant 消息**非通用句式："你还不会使用「横行无忌」。"

## 契约速查

| 派 | 绝招 | type/percent | fee | busy | 命中 |
| --- | --- | --- | --- | --- | --- |
| meizhuang | 七弦黄龙闪 | REMOTE/100 | 300/100 | 2/2 | ap=force有效 vs 目标force |
| miao | 流星赶月 | WEAPON/80 | 500/500 | 3/4 | ap=sword有效 vs 目标dodge |
| ouyang | 横行无忌 | WEAPON/55 | 200/80 | 3/4 | ap=staff有效 vs 目标parry；目标busy1 |
| zhenyuan | 背心钉 | UNARMED/20 | 150/50 | 2/3 | rand(strike)>dodge/2 |
