# B6 共享 19 招预研

一次采集多派销账。kind 分布：direct 14/combo 3/control 1/buff 1（含掌中夹镖 receive 直伤）。

## 簇与 families

| 簇 | 招 | families |
| --- | --- | --- |
| 商家×镇远八卦系 | bagua-dao/mang·sha·tian、bagua-quan/gua、bagua-zhang/jia、bazhen-zhang/yin、wai-bagua/zhen | 商家堡、八卦门 |
| 丐帮×桃花打狗棒 | dagou-bang/ban·chuo·feng·tian | 丐帮、桃花岛 |
| 胡×苗家刀 | hujia-daofa/cang·xian | 关外胡家、中原苗家 |
| 杂簇六合 | liuhe-dao/shan、liuhe-zhang/tan | 丐帮、关外胡家 |
| 杂簇六阳/折梅 | liuyang-zhang/huan·zhong、zhemei-shou/zhe | 灵鹫宫、逍遥派 |
| 杂簇泼墨 | pomopima-jian/zui | 梅庄、明教 |

杂簇 6 招自预研表多派共授余量选取：六合刀/掌（gaibang×hu）、天山六阳掌两式与折梅手（lingjiu×xiaoyao）、泼墨披麻剑（meizhuang×mingjiao），均为已有 direct/combo/control/buff 契约可覆盖的招式。

## 关键约束

1. **绊字诀内力碾压即倒**：`ban.c` 在 `max_neili > 目标*2` 时直接 `unconcious`，扣 50 内力、自身忙乱 1，不走 do_damage
2. **掌中夹镖暗器消耗**：`jia.c` 须手持 throwing 暗器，命中走 receive_damage/receive_wound + `hit_ob`，无 do_damage；每次消耗 1 发暗器
3. **八卦震无条件扣费**：`zhen.c` 在命中判定前固定扣 50 内力；命中判定 `random(force) > 目标force/2` 非标准
4. **神卦天印非标准命中**：`yin.c` 命中判定 `random(strike) > 目标parry/2`
5. **生死符寒毒与精神创伤**：`zhong.c` 须 strike+throwing 双映射；命中附加 `receive_wound(jing, 10+random(5))` 与 `ss_poison`，费用为 0
6. **封字诀临时招架**：`feng.c` 置 `feng_zijue` 标记，`apply/parry += skill/3`，带到期回调；已激活时拒绝
7. **折梅式目标忙乱拒绝**：`zhe.c` 目标 `is_busy()` 时拒绝；命中目标忙乱 `hand/30+2`
8. **天下无狗袋数加成**：`tian.c` 攻击数 5-9（按计划数扣 30/次），`count` 含 `family/beggarlvl*10`

## 绝招清单

| 招 | kind | type/percent | fee | 命中 |
| --- | --- | --- | --- | --- |
| bagua-dao/mang | direct | WEAPON/75 | 150/60 | ap/2+rand>dp |
| bagua-dao/sha | direct | WEAPON/85 | 200/100 | ap/2+rand>dp |
| bagua-dao/tian | combo | 8×attack | 250 | 无 |
| bagua-quan/gua | direct | UNARMED/20 | 100/50 | ap/2+rand>dp |
| bagua-zhang/jia | direct(receive) | 无 do_damage | 100 | ap/2+rand>dp |
| bazhen-zhang/yin | direct | UNARMED/45 | 250/100 | rand(strike)>parry/2 |
| wai-bagua/zhen | direct | UNARMED/30 | 50 | rand(force)>force/2 |
| dagou-bang/ban | direct | WEAPON/70 | 200/100 | ap/2+rand>dp + 碾压 |
| dagou-bang/chuo | direct | WEAPON/50 | 100/50 | ap/2+rand>dp |
| dagou-bang/feng | buff | 无 | 150 | 无 |
| dagou-bang/tian | combo | 5-9×attack | 30×n | ap/2+rand>dp |
| hujia-daofa/cang | combo | 8×attack | 220 | 无 |
| hujia-daofa/xian | direct | WEAPON/25 | 150/50 | ap/4+rand>dp |
| liuhe-dao/shan | direct | WEAPON/35 | 100/50 | ap/2+rand>dp |
| liuhe-zhang/tan | direct | UNARMED/20 | 50/30 | rand(strike)>dodge/2 |
| liuyang-zhang/huan | direct | UNARMED/40 | 150/50 | ap/2+rand>dp |
| liuyang-zhang/zhong | direct | REMOTE/50 | 0 | ap/3+rand>dp |
| zhemei-shou/zhe | control | 无 | 110/80 | ap/2+rand>dp |
| pomopima-jian/zui | direct | WEAPON/70 | 200/100 | ap/2+rand>dp |

## 源码路径

绝招：bagua-dao/{mang,sha,tian}.c、bagua-quan/gua.c、bagua-zhang/jia.c、bazhen-zhang/yin.c、wai-bagua/zhen.c、dagou-bang/{ban,chuo,feng,tian}.c、hujia-daofa/{cang,xian}.c、liuhe-dao/shan.c、liuhe-zhang/tan.c、liuyang-zhang/{huan,zhong}.c、zhemei-shou/zhe.c、pomopima-jian/zui.c

母技能：bagua-dao.c、bagua-quan.c、bagua-zhang.c、bagua-biao.c、bazhen-zhang.c、wai-bagua.c、nei-bagua.c、dagou-bang.c、hujia-daofa.c、liuhe-dao.c、liuhe-zhang.c、liuyang-zhang.c、zhemei-shou.c、pomopima-jian.c
基本技能：blade/cuff/hand/staff/strike/sword/throwing/unarmed、force/parry/dodge、begging/medical、martial-cognize

## 条件矩阵

91 条件（smoke 91）：每招 baseline + 主门（level）边界对 + hit/miss（dpSkills），特殊约束另列。
- feng：+already-active
- jia：+no-throwing
- zhe：+target-busy
- ban：+instant-death

## 基线排除同步

- `school_combat_report.mjs` 过滤器加 `!c.b6`
- `school_mingjiao_remaining_base_integration.test.mjs` 正则加 `(?:!c\.b6 && )?`，条件排除加 `b6-`，legacy 清单加 b6 两文件
- 各集成测试 `startsWith('b5-')` 后追加 `startsWith('b6-')`
