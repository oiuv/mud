# 门派代表切片第 7 批预研（shang/hu/none+ultra 合并小切片）

只读调研。shang=商家堡、hu=关外胡家、none+ultra=侠客盟合并。

## schools 对象（可直接抄入 school_slice7_cases.mjs）

```js
shang: {
    skill: 'shangjia-dao', ability: 'juan', usage: 'blade',
    grant: 'can_perform/shangjia-dao/juan', forceSkill: 'shangjia-neigong',
    kind: 'direct', weapon: 'blade', prepared: 'blade', family: '商家堡',
    title: '商家刀法「寒芒暴卷」', directType: 'WEAPON', percent: 35, baseLevel: 250,
    gates: [
        { key: 'level', pair: [49, 50], field: 'skill',
            refusal: '你的商家刀法还不到家，难以施展「寒芒暴卷」。\n' },
        { key: 'force', pair: [79, 80], field: 'effective-force',
            refusal: '你的内功火候不够，难以施展「寒芒暴卷」。\n' },
        { key: 'neili', pair: [99, 100], field: 'neili',
            refusal: '你的真气不够，难以施展「寒芒暴卷」。\n' },
    ],
    feeHit: 80, feeMiss: 30, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'max_neili', pair: [349, 350], property: true,
        refusal: '你的内力不够。\n' },
},
hu: {
    skill: 'hujia-daofa', ability: 'zhui', usage: 'blade',
    grant: 'can_perform/hujia-daofa/zhui', forceSkill: 'lengyue-shengong',
    kind: 'direct', weapon: 'blade', prepared: 'blade', family: '关外胡家',
    title: '胡家刀法「卸甲锥心势」', directType: 'WEAPON', percent: 65, baseLevel: 250,
    gates: [
        { key: 'level', pair: [139, 140], field: 'skill',
            refusal: '你的胡家刀法还不到家，难以施展「卸甲锥心势」。\n' },
        { key: 'force', pair: [199, 200], field: 'effective-force',
            refusal: '你的内功火候不够，难以施展「卸甲锥心势」。\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你的真气不够，难以施展「卸甲锥心势」。\n' },
    ],
    feeHit: 150, feeMiss: 50, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'max_neili', pair: [1399, 1400], property: true,
        refusal: '你的内力不够。\n' },
},
none: {
    skill: 'dugu-jiujian', ability: 'yi', usage: 'sword',
    grant: null, forceSkill: 'bingxin-jue',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '侠客盟',
    title: '独孤九剑「弘意式」', directType: 'WEAPON', percent: 50, baseLevel: 200,
    actorProperties: { character: '狡黠多变' },
    learnSkills: { 'martial-cognize': 200 },
    gates: [
        { key: 'level', pair: [89, 90], field: 'skill',
            refusal: '你所使用的外功中没有这种功能。\n' },
    ],
    feeHit: 0, feeMiss: 0, hitBusy: 2, missBusy: 3,
    learnGate: { field: 'int', pair: [38, 39], property: true,
        refusal: '你的天资不足，无法理解独孤九剑的剑意。\n' },
},
ultra: {
    skill: 'never-defeated', ability: 'perform/juemie', usage: 'sword',
    grant: null, forceSkill: 'never-defeated',
    kind: 'direct', weapon: 'sword', prepared: 'sword', family: '侠客盟',
    title: '不败神功「天地绝灭」', directType: 'WEAPON', percent: 40, baseLevel: 250,
    actorProperties: { character: '狡黠多变' },
    learnSkills: { blade: 250, whip: 250, throwing: 250, 'martial-cognize': 250 },
    gates: [
        { key: 'level', pair: [119, 120], field: 'skill',
            refusal: '你的不败神功还不够娴熟，不能使用天地绝灭！\n' },
        { key: 'neili', pair: [199, 200], field: 'neili',
            refusal: '你的内力不够，不能使用天地绝灭！\n' },
    ],
    feeHit: 120, feeMiss: 50, hitBusy: 2, missBusy: 2,
    learnGate: { field: 'int', pair: [21, 22], property: true,
        refusal: '你觉得不败神功过于深奥，绝非自己的智力所能理解。\n' },
},
```

## 关键约束

1. **none/ultra 都须覆盖 character="狡黠多变"**（slice 默认"光明磊落"被拒）。
2. **none 无 grant**：skill<90 与"无招"标记都返回通用 grant 文案。夹具不得设 can_learn/dugu-jiujian/nothing。
3. **ultra 反向命中判定**：`ap/2+random(ap) >= dp`（等号算命中）。ap 含 int×20、dp 含目标 dex×20。
4. **ultra learnSkills 折叠**：7 基本技+mc ≥ skill 级（原始）。
5. **hu 命中四分位**：`ap/4+random(ap/2) > dp`（最紧）。
6. **none 无费用**：feeHit/feeMiss 均 0。
7. **ultra ability 路径**：`perform/juemie`（嵌套子目录）。

## 契约速查

| 派 | 绝招 | type/percent | fee | busy | 命中 |
| --- | --- | --- | --- | --- | --- |
| shang | 寒芒暴卷 | WEAPON/35 | 80/30 | 2/3 | ap=blade_eff vs parry |
| hu | 卸甲锥心势 | WEAPON/65 | 150/50 | 2/3 | ap/4+rand vs force |
| none | 弘意式 | WEAPON/50 | 0/0 | 2/3 | ap=sword_eff+mc vs parry+mc+九剑 |
| ultra | 天地绝灭 | WEAPON/40 | 120/50 | 2/2 | ap>=dp（反向判定） |
