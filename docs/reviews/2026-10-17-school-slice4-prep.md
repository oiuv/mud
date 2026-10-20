# 门派代表切片第 4 批预研（xueshan/xuedao/riyue/jueqing）

只读调研。拒绝消息 ANSI 剥离后文本。命名辨析：xueshan=凌霄城（xueshan-jian）、xuedao=血刀门、riyue=日月神教（kuihua-mogong）、jueqing=绝情谷。

## schools 对象（可直接抄入 school_slice4_cases.mjs）

```js
xueshan: {
    skill: 'xueshan-jian', ability: 'feng', usage: 'sword',
    grant: 'can_perform/xueshan-jian/feng', forceSkill: 'xueshan-neigong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '凌霄城',
    title: '雪山剑法「剑气封喉」', directType: 'WEAPON', percent: 90, baseLevel: 250,
    gates: [
        { key: 'level', pair: [159, 160], field: 'skill',
            refusal: '你的雪山剑法修为不够，难以施展「剑气封喉」。\n' },
        { key: 'force', pair: [239, 240], field: 'effective-force',
            refusal: '你的内功的修为不够，难以施展「剑气封喉」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你的真气不够，难以施展「剑气封喉」。\n' },
    ],
    feeHit: 100, feeMiss: 50, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'effective-force', pair: [149, 150],
        refusal: '你的内功火候不到，无法学习雪山剑法。\n' },
},
xuedao: {
    skill: 'xuedao-dafa', ability: 'xue', usage: 'blade',
    grant: 'can_perform/xuedao-dafa/xue', forceSkill: 'xuedao-dafa',
    kind: 'direct', weapon: 'blade', prepared: 'blade', family: '血刀门',
    title: '血刀大法「祭血神刀」', directType: 'WEAPON', percent: 80, baseLevel: 250,
    gates: [
        { key: 'level', pair: [219, 220], field: 'skill',
            refusal: '你的内功火候不够，难以施展「祭血神刀」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你目前真气不足，难以施展「祭血神刀」。\n' },
    ],
    feeHit: 150, feeMiss: 100, hitBusy: 2, missBusy: 2, selfWound: 50,
    character: '心狠手辣',
    learnGate: { field: 'str', pair: [27, 28],
        refusal: '你先天膂力孱弱，无法修炼血刀大法。\n' },
},
riyue: {
    skill: 'kuihua-mogong', ability: 'bian', usage: 'sword',
    grant: 'can_perform/pixie-jian/po', forceSkill: 'kuihua-mogong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '日月神教',
    title: '葵花魔功「无边无际」', directType: 'REMOTE', percent: 90, baseLevel: 300,
    gates: [
        { key: 'level', pair: [259, 260], field: 'skill',
            refusal: '你的葵花魔功不够娴熟，难以施展「无边无际」。\n' },
        { key: 'max_neili', pair: [3699, 3700], field: 'max_neili',
            refusal: '你的内力修为不足，难以施展「无边无际」。\n' },
        { key: 'neili', pair: [299, 300], field: 'neili',
            refusal: '你的真气不够，难以施展「无边无际」。\n' },
    ],
    feeHit: 200, feeMiss: 150, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'dex', pair: [37, 38],
        refusal: '你觉得自己的身法不够灵动，不可能掌握这么飘缈玄奇的葵花魔功。\n' },
},
jueqing: {
    skill: 'jueqing-jian', ability: 'liu', usage: 'sword',
    grant: 'can_perform/jueqing-jian/liu', forceSkill: 'jueqing-xinfa',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '绝情谷',
    title: '绝情剑法「流水无情」', directType: 'WEAPON', percent: 24,
    gates: [
        { key: 'level', pair: [59, 60], field: 'skill',
            refusal: '你绝情剑法不够娴熟，难以施展「流水无情」。\n' },
        { key: 'force', pair: [79, 80], field: 'effective-force',
            refusal: '你的内功火候不够，难以施展「流水无情」。\n' },
        { key: 'neili', pair: [59, 60], field: 'neili',
            refusal: '你现在的真气不够，难以施展「流水无情」。\n' },
    ],
    feeHit: 60, feeMiss: 30, hitBusy: () => 1 + random(2), missBusy: 2,
    learnGate: { field: 'max_neili', pair: [99, 100], property: true,
        refusal: '你目前的内力修为不够，没有办法练绝情剑法。\n' },
},
```

## 关键约束

1. **character 覆盖**：xuedao 拒"光明磊落"→ actor 用"心狠手辣"；riyue 同。jueqing/xueshan 无门。
2. **xuedao 自映射折叠**：force+blade 都映射 xuedao-dafa → skill 门拒绝文案不可达，level 对用 force 文案。
3. **riyue 交叉授权**：`can_perform/pixie-jian/po`（bian.c:19）非本技能路径。双重击 double_attack()=1。
4. **自伤创**：xuedao 两分支后 `receive_wound("qi", 50)` 记入 actor。
5. **原始 vs 有效**：jueqing ap/dp 全原始（`query_skill(...,1)`）；riyue ap=原始+有效混合。
6. **perform 子目录**：xuedao/riyue 的 ability 在 `perform/` 子目录（`kungfu/skill/<skill>/perform/<a>.c`）。
7. **riyue 有效学习门**：character 三选一 + dex≥38 + int≥34 + combat_exp≥300万 + mc≥150 + 五基本同步。

## 契约速查

| 派 | 绝招 | type/percent | fee hit/miss | busy hit/miss | 命中 |
| --- | --- | --- | --- | --- | --- |
| xueshan | 剑气封喉 | WEAPON/90 | 100/50 | 2/3 | ap=sword有效+force有效 |
| xuedao | 祭血神刀 | WEAPON/80 | 150/100 | 2/2 | ap=blade有效；自伤创qi50 |
| riyue | 无边无际 | REMOTE/90 | 200/150 | 2/3 | ap=skill原始+dodge有效；final no_perform |
| jueqing | 流水无情 | WEAPON/24 | 60/30 | 1+rand(2)/2 | ap=skill原始, dp=parry原始 |
