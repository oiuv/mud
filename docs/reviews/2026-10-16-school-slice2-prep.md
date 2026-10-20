# 门派代表切片第 2 批预研（wudu/tiezhang/shenlong/xuanming）

只读调研，未修改游戏代码。数据结构对齐 `school_slice1_cases.mjs`。拒绝消息为 ANSI 剥离后文本。

## schools 对象（可直接抄入 school_slice2_cases.mjs）

```js
wudu: {
    skill: 'wudu-shenzhang', ability: 'shi', usage: 'strike',
    grant: 'can_perform/wudu-shenzhang/shi', forceSkill: 'wudu-xinfa',
    kind: 'direct', weapon: null, prepared: 'strike', family: '五毒教',
    title: '五毒神掌「万毒噬体」', directType: 'REMOTE', percent: 70 + count,
    gates: [
        { key: 'force', pair: [199, 200], field: 'effective-force',
            refusal: '你的内功不够火候，难以施展「万毒噬体」。\n' },
        { key: 'level', pair: [149, 150], field: 'skill',
            refusal: '你的五毒神掌不够娴熟，难以施展「万毒噬体」。\n' },
        { key: 'neili', pair: [119, 120], field: 'neili',
            refusal: '你的真气不够，难以施展「万毒噬体」。\n' },
    ],
    feeHit: count, feeMiss: 0, hitBusy: () => 1 + random(3),
    character: '心狠手辣',
    learnGate: { field: 'effective-force', pair: [149, 150],
        refusal: '你的内功火候不够，无法练五毒神掌。\n' },
},
tiezhang: {
    skill: 'tie-zhang', ability: 'lei', usage: 'strike',
    grant: 'can_perform/tie-zhang/lei', forceSkill: 'tiezhang-xinfa',
    kind: 'direct', weapon: null, prepared: 'strike', family: '铁掌帮',
    title: '铁掌掌法「掌心雷」', directType: 'UNARMED', percent: 65,
    gates: [
        { key: 'level', pair: [159, 160], field: 'skill',
            refusal: '你铁掌掌法火候不够，难以施展「掌心雷」。\n' },
        { key: 'force', pair: [219, 220], field: 'effective-force',
            refusal: '你的内功修为不够，难以施展「掌心雷」。\n' },
        { key: 'max_neili', pair: [2199, 2200], field: 'max_neili',
            refusal: '你的内力修为不够，难以施展「掌心雷」。\n' },
        { key: 'neili', pair: [299, 300], field: 'neili',
            refusal: '你现在的真气不足，难以施展「掌心雷」。\n' },
    ],
    feeHit: 250, feeMiss: 100,
    learnGate: { field: 'str', pair: [31, 32],
        refusal: '你的先天臂力孱弱，难以修炼铁掌掌法。\n' },
},
shenlong: {
    skill: 'shedao-qigong', ability: 'xian', usage: 'staff',
    grant: 'can_perform/shedao-qigong/xian', forceSkill: 'shenlong-xinfa',
    kind: 'direct', weapon: 'staff', prepared: 'staff', family: '神龙教',
    title: '蛇岛奇功「神龙再现」', directType: 'REMOTE', percent: 50,
    gates: [
        { key: 'level', pair: [119, 120], field: 'skill',
            refusal: '你的蛇岛奇功修为有限，不能使用「神龙再现」！\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你的真气不够，无法运用「神龙再现」！\n' },
    ],
    feeParryHit: 150, feeDodgeHit: 180, feeMiss: 100,
    learnGate: { field: 'shenlong-bashi', pair: [99, 100], sameLevel: true,
        refusal: '你的神龙八式火候不够，无法学蛇岛奇功。\n' },
},
xuanming: {
    skill: 'xuanming-zhang', ability: 'xing', usage: 'strike',
    grant: 'can_perform/xuanming-zhang/xing', forceSkill: 'xuanming-shengong',
    kind: 'direct', weapon: null, prepared: 'strike', family: '玄冥谷',
    title: '玄冥神掌「玄冥双行」', directType: 'UNARMED', percent: [60, 80],
    gates: [
        { key: 'shengong', pair: [219, 220], field: 'xuanming-shengong',
            refusal: '你的玄冥神功火候不够，无法施展「玄冥双行」。\n' },
        { key: 'level', pair: [219, 220], field: 'skill',
            refusal: '你的玄冥神掌不够熟练，无法施展「玄冥双行」。\n' },
        { key: 'max_neili', pair: [3999, 4000], field: 'max_neili',
            refusal: '你的内力修为不足，无法施展「玄冥双行」。\n' },
        { key: 'neili', pair: [799, 800], field: 'neili',
            refusal: '你的真气不够，无法施展「玄冥双行」。\n' },
    ],
    feePalm1: [200, 100], feePalm2: [300, 150], meBusy: 4,
    character: '心狠手辣',
    learnGate: { field: 'con', pair: [33, 34],
        refusal: '你先天根骨不足，无法修炼玄冥神掌。\n' },
},
```

## 关键约束

1. **character 冲突**：wudu 要求"心狠手辣"或"国士无双"；xuanming 禁"光明磊落"。两派 actor 须覆盖 defaults。
2. **双 do_damage**：xuanming xing 有两个 directs（掌1 percent 60 + 掌2 percent 80），校验器须支持 `directs.length <= 2`。
3. **UNARMED directType**：不加 apply/damage（与 REMOTE 同路），`slice1SupportSet` 可直接复用。
4. **count 依赖**：wudu percent=70+count（count 随目标 shen/gender）。固定目标 profile 使 count=30 → percent=100。
5. **feeMiss=0**：wudu 未命中不扣内。
6. **shenlong 两段命中**：先 parry（percent 50），失败再 dodge（percent 55）。
7. **shenlong valid_learn 半角句号**：`无法学蛇岛奇功.\n`（注意 `.` 不是 `。`）。

## 源码路径清单

绝招+基技能：wudu-shenzhang.c + shi.c、tie-zhang.c + lei.c、shedao-qigong.c + xian.c、xuanming-zhang.c + xing.c
内功：wudu-xinfa.c、tiezhang-xinfa.c、shenlong-xinfa.c、xuanming-shengong.c
基础：strike.c、staff.c、force.c、dodge.c、parry.c
门派头：wudu.h、tiezhang.h、shenlong.h、xuanming.h
分发/结算：perform.c、learn.c、skill.c、attack.c、damage.c、combatd.c、combat.h

## 各派绝招入口

| 派 | 绝招 | 入口 | 类型 | percent | fee |
| --- | --- | --- | --- | --- | --- |
| wudu | 万毒噬体 | wudu-shenzhang/shi.c:10 | REMOTE | 70+count | hit=count/miss=0 |
| tiezhang | 掌心雷 | tie-zhang/lei.c:8 | UNARMED | 65 | hit=250/miss=100 |
| shenlong | 神龙再现 | shedao-qigong/xian.c:8 | REMOTE | 50/55 | 150/180/100 |
| xuanming | 玄冥双行 | xuanming-zhang/xing.c:12 | UNARMED | 60/80 | 200/100+300/150 |
