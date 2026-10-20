# B13 华山独有 11 + 段氏独有尾 2 预研

华山独有绝招 11 招与段氏独有尾 2 招批量，一次采集两派 perform 销账。kind 分布：direct 6/combo 2/control 2/multi 1/buff 1/array 1。

## 簇与 families

| 簇 | 招 | families |
| --- | --- | --- |
| 华山剑/刀 | shunv-jian/ning、kuangfeng-jian/sao·yong、fanliangyi-dao/san·makearray | 华山派 |
| 华山拳掌 | hunyuan-zhang/wuji、poyu-quan/feng·lei·po、huashan-quan/song、huashan-zhang/piao | 华山派 |
| 段氏尾批 | duanjia-jian/jing·lian | 大理段家 |

华山独有 11 招按 `kungfu/class/huashan` 唯一 `can_perform` 授技清点（含反两仪刀 makearray）；华山剑法四式为 B4 共享批、独孤九剑为 huashan 升级/进阶批，均不在本批重复。段氏独有尾 2 招取自段氏特有入口清单尾部（一阳指五式已由 B5 与 slice1 销账，六脉另批），duanjia-jian jing/lian 为该清单收尾示意两项。

## 关键约束

1. **华岳三神峰三段连斩不扣费**：`san.c` 只检查 `max_neili≥1800` 与 `neili≥320` 门槛，命中判定 `ap/2+rand<dp` 时跳过该段；三段 percent 50/60/70，自身忙乱恒 3
2. **双剑和壁须两人组队**：`makearray.c` 在 `sizeof(query_team())!=2` 时拒绝；成功刀阵置 `array/name` 与 apply 四维加成。本批只记原无队伍拒绝，成功路径由 `school_team` 批次覆盖
3. **雷动九天临时增益**：`lei.c` 置 `lei` 标记，`temp str/dex += skill/6`，`skill/3` 秒后 `remove_effect` 回滚；已激活时拒绝
4. **封闭手目标忙乱**：`feng.c` 命中判定 `random(cuff)>force/2`，目标忙乱 `cuff/20+2`，失手自身忙乱 1；无 do_damage
5. **飞絮飘渺目标忙乱**：`piao.c` 命中判定同样用 `random(cuff)>force/2`（原实现如此，不改用 strike），目标忙乱 `strike/25+2`，失手自身忙乱 1
6. **惊天一剑费用等于直伤输入**：`jing.c` 命中时 `damage=(force+sword)/5+random`，随后 `neili-=damage` 且 `do_damage(..., damage, 50)`；失手固定扣 100
7. **风起云涌 percent 65–70**：`yong.c` 的 `do_damage` percent 为 `65+random(6)`
8. **苍松式准备检查文案**：`song.c` 的 prepared 失败提示误写为“劈石破玉拳”，本批按原文字节钉住

## 绝招清单

| 招 | kind | type/percent | fee | 命中 |
| --- | --- | --- | --- | --- |
| shunv-jian/ning | direct | WEAPON/65 | 220/120 | ap*11/20+rand>dp |
| fanliangyi-dao/san | multi | WEAPON/50·60·70 | 0 | ap/2+rand<dp 则跳过 |
| fanliangyi-dao/makearray | array | 无 | 0 | 无队伍拒绝 |
| hunyuan-zhang/wuji | direct | UNARMED/80 | 220/120 | ap/2+rand>dp |
| poyu-quan/feng | control | 无 | 40 | rand(cuff)>force/2 |
| poyu-quan/lei | buff | 无 | 400 | 无 |
| poyu-quan/po | direct | UNARMED/80 | 220/120 | ap/2+rand>dp |
| huashan-quan/song | direct | UNARMED/30 | 60/50 | ap/2+rand>dp |
| huashan-zhang/piao | control | 无 | 30 | rand(cuff)>force/2 |
| kuangfeng-jian/sao | combo | 6×attack | 150 | 无 |
| kuangfeng-jian/yong | direct | WEAPON/65–70 | 230/120 | ap/2+rand>dp |
| duanjia-jian/jing | direct | WEAPON/50 | 输入/100 | rand(force)>force/2 |
| duanjia-jian/lian | combo | 5×attack | 100 | 无 |

## 源码路径

绝招：shunv-jian/ning.c、fanliangyi-dao/{san,makearray}.c、hunyuan-zhang/wuji.c、poyu-quan/{feng,lei,po}.c、huashan-quan/song.c、huashan-zhang/piao.c、kuangfeng-jian/{sao,yong}.c、duanjia-jian/{jing,lian}.c

母技能：shunv-jian.c、fanliangyi-dao.c、hunyuan-zhang.c、poyu-quan.c、huashan-quan.c、huashan-zhang.c、kuangfeng-jian.c、duanjia-jian.c

基本技能：sword/blade/cuff/strike/staff、force/parry/dodge、huashan-xinfa、duanshi-xinfa、martial-cognize

## 条件矩阵

58 条件（smoke 58）：每招 baseline + 主门（level 或首个门）边界对，direct/control 补 hit/miss，特殊约束另列。
- lei：+already-active
- feng/piao：+target-busy
- makearray：仅 no-team 拒绝（1 条件）

## 基线排除同步

- `school_combat_report.mjs` 过滤器加 `!c.b13`
- `school_mingjiao_remaining_base_integration.test.mjs` 正则加 `(?:!c\.b13 && )?`，条件排除加 `b13-`，legacy 清单加 b13 两文件
- 各集成测试 `startsWith('b12-')` 后追加 `startsWith('b13-')`
