# B2 太极系四派共享 10 招预研

一次采集四派销账。kind 分布：direct 7/control 1/buff 1/combo 1。

## 关键约束

1. **太极图 can_perform≥10**：`tu.c` 用 `query("can_perform/taiji-quan/tu") < 10` 判断，领悟键须 ≥10 而非仅存在
2. **太极图双 300 门槛**：太极神功 ≥300、道学 ≥300，且须同时激发 force=taiji-shengong 与 unarmed=taiji-quan
3. **随字诀 buff 带到期回调**：`tjj_sui` 临时标记，`apply/defense +level/3`、`apply/attack -level/6`，到期自动恢复
4. **驾字诀需目标持器**：目标 `query_temp("weapon")` 须有兵器，否则拒绝
5. **驾/引需目标非忙**：目标 `is_busy()` 时拒绝
6. **震字诀命中判定为 force 对 force**：`random(me_force) > target_force/2`，非标准 ap/dp
7. **sui.c 文案错字**："你没有激发太极剑法，，难以施展" 双逗号，按源码原样记录（MA 候选）

## 绝招清单

| 招 | kind | type/percent | fee | 命中 |
| --- | --- | --- | --- | --- |
| taiji-jian/chan | control | 无 | 30 | random(level)>parry/2 |
| taiji-jian/jia | direct | WEAPON/10 | 80/60 | ap/2+rand(ap*4/3)>dp |
| taiji-jian/sui | buff | 无 | 100 | 无 |
| taiji-jian/zhenwu | direct | WEAPON/85 | 50 | ap*3/5+rand(ap)>dp |
| taiji-jian/zhuan | combo | 5-10×attack | 20×n | ap/2+rand(ap*2)>dp |
| taiji-quan/ji | direct | REMOTE/0 | 30/10 | ap/2+rand(ap)>dp |
| taiji-quan/tu | direct(receive) | 无 do_damage | 1000/1000jingli | ap/2+rand(ap)>dp |
| taiji-quan/yin | direct | UNARMED/0 | 80/60 | ap/2+rand(ap*4/3)>dp |
| taiji-quan/zhan | direct | UNARMED/20 | 30/10 | ap/2+rand(ap*4/3)>dp |
| taiji-quan/zhen | direct | UNARMED/50 | 50 | rand(force)>force/2 |

## 源码路径

绝招：taiji-jian/{chan,jia,sui,zhenwu,zhuan}.c、taiji-quan/{ji,tu,yin,zhan,zhen}.c

母技能：taiji-jian.c、taiji-quan.c、taiji-shengong.c、taoism.c、tiyunzong.c
基本技能：sword.c、unarmed.c、force.c、parry.c、dodge.c、martial-cognize.c

## 条件矩阵

53 条件（smoke 106）：每招 baseline + 主门（level）边界对 + hit/miss（dpSkills），特殊约束另列。
- chan：+target-busy
- jia：+target-busy +no-weapon
- sui：+already-active
- yin：+target-busy

## 基线排除同步

- `school_combat_report.mjs` 过滤器加 `!c.b1 && !c.b2`
- `school_mingjiao_remaining_base_integration.test.mjs` 正则加 `(?:!c\.b1 && )?(?:!c\.b2 && )?`，条件排除加 `b2-`
