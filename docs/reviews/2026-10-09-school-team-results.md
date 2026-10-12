# 反两仪刀阵：双玩家组阵与解除观察

本批为门派采集任务4.2的独立补充，不改游戏代码或数值。21个条件各两次，共42条完整记录：28条实际发动过刀阵、14条未成阵、0运行异常。**记录完整不等于游戏功能全部正确**：发现两项明确问题，已登记MA-062／063，留待后续统一处理。

## 方法与条件

复用现有隔离执行器、真实FluffOS及两个回环连接，角色均为非巫师USER。每条重建独立角色，使用原 `team with`、`perform`、`team form`、`go`、`team dismiss`；不调用解除函数或手动扣回属性。逐步保存双方对象身份、资源、技能、装备、队伍、所在房间、临时属性及真实发动次数。

实验赋予基本刀法、反两仪刀法及相应映射，持中性测试刀；默认当前／最大内力6000，不模拟拜师学习成本。没有战斗或自主心跳，观察命令返回后的状态，不能解释为实战伤害、胜率或正式服性能。

成阵的原检查要求两名同场活人、会对应刀法、原始刀法至少30、最大内力至少50、持刀、刀法映射正确且不在阵中。两人互相 `team with` 后，左侧为队长并施展 `perform blade.makearray`。

## 等级与资源结果

原整数公式为 `floor((floor((L+R)/2)+5*L)/(abs(L-R)+1))`，L为施展者等级（本批也是队长），R为队员等级。所得值同时加到双方 `apply/attack`、`defense`、`damage`、`armor`；表中为相对原值的增量，不是气血伤害。

| 队长／队员原始刀法 | 每人四项属性各增加 | 独立重复 |
| --- | ---: | ---: |
| 30／30 | 180 | 2 |
| 200／200 | 1200 | 2 |
| 400／400 | 2400 | 2 |
| 800／800 | 4800 | 2 |
| 200／201 | 600 | 2 |
| 200／400 | 6 | 2 |
| 400／200 | 11 | 2 |

另两项各两次：队员最大内力50／当前50可以成阵；双方当前内力0而最大内力6000也可以成阵。全42条双方气血、有效气血、精神、有效精神和内力支出／恢复均0；原代码不扣成阵费用，不因此擅自判定必须收费。同级／异级增量差距属于原公式数据，不直接列为平衡BUG。

以下六个条件各两次均由原perform入口拒绝，未发动、未取得加成：未组队、队员刀法29、最大内力49、未持刀、未激发刀法、成阵前分处不同房间。重复成阵另有两条：首次发动成功，再次提示已在刀阵中，没有叠加第二份属性。

## 发现的明确问题

### MA-062：文档中的组阵入口失效

同等合格双人配置下，`team form fanliangyi-dao` 两次均返回0，无刀阵状态或属性变化；顶层武学的 `function_exists("form_array", skill)` 实测为0。相同资格通过 `perform blade.makearray` 可以成阵。

原因是[组阵命令](../../cmds/std/team/form.c#L16)调用顶层武学的 `form_array()`，而[顶层旧实现](../../kungfu/skill/fanliangyi-dao.c#L65)已被注释，有效成阵实现在[perform文件](../../kungfu/skill/fanliangyi-dao/makearray.c#L13)。这是入口不一致，不是角色门槛不足。

### MA-063：移动、离队与解散后未撤回刀阵加成

本组均为双方200级、首次成阵各加1200；四个条件各两次，结果一致：

| 成阵后的原命令 | 实际队伍／位置变化 | 双方刀阵与四项增量 |
| --- | --- | --- |
| 队长 `go east` | 队员自动跟随，两人均到东侧房间 | 都仍为1200 |
| 队员 `go east` | 仍在同队，但两人分处不同房间 | 都仍为1200 |
| 队长 `team dismiss` | 双方队伍人数均0 | 都仍为1200 |
| 队员 `team dismiss` | 原队长人数1，离队者人数0 | 都仍为1200 |

八条双方还都保留 `no_quit=1`。本批未执行quit，不能仅凭字段名断言无法退出。[team帮助](../../cmds/std/team.c#L43)明确说领队移动即解除阵形；[perform内的解除函数](../../kungfu/skill/fanliangyi-dao/makearray.c#L94)虽定义了撤回逻辑，但上述原命令未撤回。未手动调用该函数来掩盖问题，也不建议现在据此调整加成大小。

这些是命令后的即时残留证据，不证明经过任意时长、死亡／断线／重登后仍永久存在。残留会污染后续战斗比较，不能把本组数据当作刀阵全生命周期正常或可公平比较的持续增益。

## 原始证据与复跑

- 源码 `275580a64ae2f535cdf1da2a510c8391f6681677`，mudcore `c1c29f55b94f9ce1df0f5fbfb27066a3d891aa89`，驱动 `20260929-5270e7d6-328aaf10`；驱动SHA-256 `56c5f02398ecc35ee15f3b6b5f897471c1fdb35288d8b04b6681cb437581f135`。
- 烟雾：`C:\Users\oiuv\AppData\Local\Temp\mud-martial-data-KoOFXg/runs/attempt-G0VqmN`，21/21，退出0；确认进程结束后再完整运行。
- 完整：`C:\Users\oiuv\AppData\Local\Temp\mud-martial-data-AuFTuL/runs/attempt-BK2kXj`，42/42，退出0；驱动1.537秒，执行阶段11.46秒，校验错误和残缺尾行均0。
- 系列指纹 `387369d86d3e3e849f7bb44ee4f5f62c33978f598d766511f9c055539e7641ed`；原日志与台账摘要 `6dbcef07f6ca010088bbf6d8dcc65e7cd14010a5ab61d6198f4c0895c29ff579`；驱动输出hash `1f44be01972be5d4f212e480000556c9e4e9844c9559c594a94dba1298fd184c`。
- 完整逐步报告：`C:\Users\oiuv\AppData\Local\Temp\mud-school-team-20261009`。系列中的 `findings/ma062.json` 和 `ma063.json` 分别引用2条／8条真实样本并保存源码hash；全部状态为待处理，不改写旧样本。

```powershell
node tools/collect_martial_data.mjs school-team --smoke
node tools/collect_martial_data.mjs school-team
node tools/tests/martial_data/school_team_report.mjs C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-AuFTuL
node --test tools/tests/martial_data/school_team_cases.test.mjs
```

不覆盖三人队伍、非队长施展、死亡／断线、其他阵法、实际战斗收益或教学获取；没有因此完成全部华山或全门派采集。任务4.2／4.3仍待办，整体10/17。错误详情集中在[缺陷台账](../architecture/martial-arts-data-findings.md)。
