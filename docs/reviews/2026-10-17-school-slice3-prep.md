# 门派代表切片第 3 批预研（lingjiu/murong/xingxiu/honghua）

只读调研，未修改游戏代码。拒绝消息为 ANSI 剥离后文本。数据结构对齐 `school_slice2_cases.mjs`。

## schools 对象（可直接抄入 school_slice3_cases.mjs）

```js
lingjiu: {
    skill: 'tianyu-qijian', ability: 'ju', usage: 'sword',
    grant: 'can_perform/tianyu-qijian/ju', forceSkill: 'bahuang-gong',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '灵鹫宫',
    title: '天羽奇剑「聚剑诀」', directType: 'WEAPON', percent: 50,
    gates: [
        { key: 'level', pair: [129, 130], field: 'skill',
            refusal: '你的天羽奇剑不够娴熟，难以施展「聚剑诀」。\n' },
        { key: 'force', pair: [179, 180], field: 'effective-force',
            refusal: '你的内功火候不足，难以施展「聚剑诀」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你现在的真气不足，难以施展「聚剑诀」。\n' },
    ],
    feeHit: 160, feeMiss: 80, hitBusy: 2, missBusy: 4,
    learnGate: { field: 'effective-force', pair: [39, 40],
        refusal: '你的内功火候不够，不能学习天羽奇剑。\n' },
},
murong: {
    skill: 'murong-jian', ability: 'xing', usage: 'sword',
    grant: 'can_perform/murong-jian/xing', forceSkill: 'murong-xinfa',
    kind: 'combo', weapon: 'sword', prepared: 'sword', family: '慕容世家',
    title: '慕容剑法「剑转七星」',
    gates: [
        { key: 'level', pair: [79, 80], field: 'skill',
            refusal: '你的慕容剑法不够娴熟，难以施展「剑转七星」。\n' },
        { key: 'dodge', pair: [239, 240], field: 'dodge', effective: true, threshold: 120,
            refusal: '你的轻功修为不够，无法施展「剑转七星」！\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你目前的真气不够，难以施展「剑转七星」。\n' },
    ],
    fee: 210, meBusy: () => 3 + random(5), comboHits: 7, attackType: 13,
    learnGate: { field: 'max_neili', pair: [149, 150], property: true,
        refusal: '你的内力不够。\n' },
},
xingxiu: {
    skill: 'chousui-zhang', ability: 'shi', usage: 'strike',
    grant: 'can_perform/chousui-zhang/shi', forceSkill: 'huagong-dafa',
    kind: 'direct', weapon: null, prepared: 'strike', family: '星宿派',
    title: '抽髓掌「腐尸毒」', directType: 'REMOTE', percent: 75,
    gates: [
        { key: 'poison', pair: [199, 200], field: 'poison',
            refusal: '你对毒技的了解不够，难以施展「腐尸毒」。\n' },
        { key: 'throwing', pair: [359, 360], field: 'throwing', effective: true, threshold: 180,
            refusal: '你暗器手法火候不够，难以施展「腐尸毒」。\n' },
        { key: 'max_neili', pair: [1199, 1200], field: 'max_neili',
            refusal: '你的内力修为不足，难以施展「腐尸毒」。\n' },
        { key: 'neili', pair: [499, 500], field: 'neili',
            refusal: '你现在的内息不足，难以施展「腐尸毒」。\n' },
    ],
    feeHit: 300, feeMiss: 200, hitBusy: 3, missBusy: 4,
    learnGate: { field: 'poison', pair: [49, 50],
        refusal: '你的基本毒技不足，无法练抽髓掌。\n' },
},
honghua: {
    skill: 'zhuihun-jian', ability: 'zhui', usage: 'sword',
    grant: 'can_perform/zhuihun-jian/zhui', forceSkill: 'honghua-xinfa',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '红花会',
    title: '追魂夺命剑「追魂夺命」', directType: 'WEAPON', percent: 60,
    gates: [
        { key: 'level', pair: [99, 100], field: 'skill',
            refusal: '你的追魂夺命剑还不够娴熟，难以施展「追魂夺命」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你现在真气不够，难以施展「追魂夺命」。\n' },
    ],
    fee: 150, meBusy: 3,
    character: '心狠手辣',
    learnGate: { field: 'dex', pair: [23, 24],
        refusal: '你的先天身法太差，无法学习追魂夺命剑。\n' },
},
```

## 关键约束

1. **honghua character 要求**：valid_learn 须"心狠手辣"或"国士无双"（与 slice2 wudu 同类）。
2. **murong 连击（无 do_damage）**：7×do_attack(type 13)，校验器需 combo 分支。fee 210 一次性，busy 3+random(5)。
3. **xingxiu 尸体门**：lvl<200 时需 CORPSE_OB（每发消耗），基线 250 免尸体。final 带 corpse_poison + jing 伤创。
4. **有效 vs 原始技能**：murong dodge / xingxiu throwing / lingjiu force 为有效值门（pair 已折算）；xingxiu poison / 各 skill 门 / honghua force/sword 为原始值门。
5. **chousui-zhang.c 死代码**：`choushui-zhang` 拼写错误门恒假，不可作测试边界。

## 契约速查

| 派 | 绝招 | kind | type/percent | fee | busy | 命中 |
| --- | --- | --- | --- | --- | --- | --- |
| lingjiu | 聚剑诀 | direct | WEAPON/50 | 160/80 | 2/4 | ap=dp=force 有效 |
| murong | 剑转七星 | combo | 7×attack | 210 平 | 3-7 | 由 do_attack 结算 |
| xingxiu | 腐尸毒 | direct | REMOTE/75 | 300/200 | 3/4 | ap=strike有效+poison原始 |
| honghua | 追魂夺命 | direct | WEAPON/60 | 150 平 | 3 平 | ap=sword有效, dp=dodge有效 |

## 源码路径

绝招+基技能：tianyu-qijian.c+ju.c、murong-jian.c+xing.c、chousui-zhang.c+shi.c、zhuihun-jian.c+zhui.c
内功：bahuang-gong.c、murong-xinfa.c、huagong-dafa.c、honghua-xinfa.c
基础：sword.c、strike.c、force.c、dodge.c、parry.c、poison.c、throwing.c、martial-cognize.c
门派头：lingjiu.h、murong.h、xingxiu.h、honghua.h
