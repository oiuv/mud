# 公共演奏武学采集预研（未启动）

## 范围与定位

`/kungfu/skill` 演奏类共 13 个文件 ID；桃花音乐组已采 2 件（碧海潮生曲、桃花怨），余 11 件为公共演奏武学，属全武学维度（OpenSpec 5.2）的下一批候选。本页只记录预研事实，不代表已排期或已验收；不修改游戏源码。

## 源码精读（2026-10-13 完成，事实栏已补齐）

| 技能 | 技法/乐器 | valid_learn 门槛 | do_effect 门槛与效果 | 已知问题 |
| --- | --- | --- | --- | --- |
| chinese-anthem | chuixiao/tanqin/guzheng 任一 | 无（恒 1） | 原始等级≥200；房间内正在交手且对手 `nation=="日本"` 的角色获得 min(10,(lvl-200)/10) 次额外 do_attack；无此目标时仅消息 | — |
| guangling-san | tanqin / 琴 | 弹琴≥50 且弹琴≥本曲 | lvl=弹琴/2+本曲≥100；同房间他人精神恢复 random(lvl)+10（同次数组调用共享一个随机值） | MA-122 文案 |
| jian-jia | tanqin / 琴 | 弹琴≥30 且弹琴≥**秋月籁**（误读） | 无数值效果，仅消息；`query_temp("love")==奏者 id` 的听者有专属消息 | **MA-121** 逻辑、MA-122 文案 |
| qingxin-pushan | tanqin / 琴 | 弹琴≥50 且弹琴≥本曲 | lvl≥100；他人精神恢复 random(lvl)+10（共享随机） | MA-122 文案 |
| qiuyue-lai | tanqin / 琴 | 弹琴≥50 且弹琴≥本曲 | lvl≥100；他人精神恢复 random(lvl)+10（共享随机） | MA-122 文案 |
| xiaoxiang-yeyu | tanqin / 琴 | 弹琴≥50 且弹琴≥本曲 | lvl≥100；他人气血恢复 random(lvl)+20（共享随机） | — |
| tieqin-yin | tanqin / 琴 | 弹琴≥100 且弹琴≥本曲 | lvl≥150 且非 no_fight/skybook；lvl=lvl/5+有效内功后 /2；同族武功豁免（奏者2/3）、死亡保护豁免、内力判定 lvl+random(lvl)、内力差≥500 → damage/10 精神损伤 2/3 + 创伤 2/9，并建立敌对 | — |
| xiyu-tiezheng | guzheng / 筝 | 古筝≥100 且古筝≥本曲 | 同铁琴音结构（同族 2/3 豁免、内力判定、差≥500 → damage/10；精神损伤 damage、创伤 damage/3）；**无死亡保护豁免** | **MA-123** |
| wushe-qu | guzheng / 筝 | 古筝≥100 且古筝≥本曲 | no_fight 直接返回；lvl<50 无效果消息；内力<50 置 0 并消息；扣内力 20+random(10)；房间 `quarrys` 权重随机召一条 /clone/beast/ 蛇（snake_poison/level+random(lvl/5)） | — |
| xiaoao-jianghu | chuixiao/tanqin 箫或琴 | 弹琴≥50 或吹箫≥50；相对检查读清心普善咒且吹箫键误拼 `cuhixiao-jifa` | 原始等级≥100；单人登记 xajh 标记（30 秒时效）；两人不同 ID 先后演奏触发合奏：apply/attack+dodge = min(本曲等级, 听者有效内功)/6，lvl/2 秒后回调解除 | MA-005.10、MA-009、MA-122 |
| qixian-wuxingjian | unarmed/parry/sword/tanqin（战斗技） | 内功≥270、最大内力≥3000、拳脚≥180、剑法≥180、弹琴≥100；内功/拳脚/剑法≥本曲、弹琴≥本曲/3 | hit_ob（q≥180、内力≥500 等）与 do_effect（同铁琴音结构＋内力<500 与差距<500 双分支、四段精神/气血损伤）均有效果 | — |

演奏链：乐器 `_qin/_zheng/_xiao.c` 的 `play_*` → 技法 `play()`（校验已学/可奏/忙乱，分段消息，`start_busy(3+random(3))`）→ `SKILL_D(曲)->do_effect(me)`。练习另有 `practice_skill` 费用路径。原乐器：箫 `d/items/xiao/zhuxiao`、`d/taohua/obj/yuxiao`；琴虚拟品种 `d/items/qin`（muqin 等）或定物 `d/dali/npc/obj/yaoqin`、`clone/lonely/tieqin`（铁琴剑）、`clone/lonely/yaoqin`（白玉瑶琴）；筝虚拟品种 `d/items/zheng`（guzheng/tiezheng）。

## 采集设计要点（供实施时展开）

- 复用已建成的 method 'music' 执行器与三人观察框架；新增每曲的乐器/技法映射与效果观察口径。
- 环境依赖效果（如 wushe-qu 的 quarrys 召蛇）单列环境条件，不把“空房间无效果”记为失手。
- 共享随机（如广陵散一次数组调用一个随机值）沿桃花怨共享参数的记账方式。
- 与门派批次分开记账；本批只统计收集，不比强弱、不调数值。
- 实施前须逐条精读 11 件源码补齐上表“待逐条核”栏，并建立冻结条件矩阵与离线自检后才接线。

## 当前状态

源码精读完成；用例/冻结矩阵/接线/实采见[结果文档](2026-10-13-skill-music-results.md)（同批交付）。
