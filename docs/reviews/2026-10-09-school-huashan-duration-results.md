# 紫霞神功：持续增益与自然解除

## 范围与方法

在[华山首批即时效果](2026-10-09-school-huashan-combat-results.md)之外，新增两个150级持续条件，各独立重复两次，四次均观察到原回调撤回增益。它们是确定性生命周期检查，不用两次重复估计随机胜率。

本系列 `school-combat` 完整重跑为 **47条件／4014条**：4008条进入观察分支、6条预期资格拒绝；观察分支仍含两条四成气血下返回成功但无增益的旧边界条件。原45条件／4010条系列保留，不覆盖、不将新旧随机样本混算。后续默认条件扩充见[剑刀拳掌报告](2026-10-09-school-huashan-additional-results.md)，本页数值继续对应本系列原始证据。

持续条件使用真实连接的非巫师USER，经原 `exert powerup`、`exert ziqi` 发动。基本剑／招架／轻功／内功、华山剑法／身法／紫霞神功及武学修养均150；内力与最大内力6000、气血与最大气血10000，实验门派字段“华山派”，装备初始伤害50的演武剑。目标沿用无特殊映射的中性配置；这不是正常养成或师父传授完成证明。

仍使用单次观察，不执行自主攻击或资源恢复心跳。原 `start_call_out()` 正常运行，观察器只在原 `eval_function()` 前后记录状态；不手工调用解除函数，不缩短技能计时。实际观察窗口配置152秒，本次结束快照落在约153.42–153.51秒；隔离实例的game tick及heartbeat配置均1000毫秒。

## 实际数据

| 原入口 | 即时变化 | 到期变化（两次均相同） | 内力：初始→发动后→结束 |
| --- | --- | --- | --- |
| `powerup` | attack、defense各+50，powerup=1 | attack、defense恢复0，powerup清除；伤害仍50、轻功修正仍-1 | 6000→5900→5900 |
| `ziqi` | damage从50到65，sword+15，ziqi=1 | damage恢复50、sword恢复0，ziqi清除；护甲仍100、轻功修正仍-1 | 6000→5800→5800 |

| 条件／重复编号 | 原代码延迟（秒） | 回调开始（秒） | 回调结束（秒） | 最终观察（秒） |
| --- | ---: | ---: | ---: | ---: |
| powerup / 0 | 150 | 151.405858 | 151.406121 | 153.424279 |
| powerup / 1 | 150 | 151.488447 | 151.489084 | 153.513112 |
| ziqi / 0 | 150 | 151.409566 | 151.409754 | 153.426648 |
| ziqi / 1 | 150 | 151.451662 | 151.451811 | 153.475166 |

回调开始前仍有完整加成，结束后及最终快照都恢复原值；每条只有一组原回调前／后观察。内力在发动时分别扣100／200，到期不再次扣费、不返还费用。原设定、回调实测和总观察窗口分列，不能把153秒写成技能设计时长。

源码依据：[powerup调度](../../kungfu/skill/zixia-shengong/powerup.c#L33)及[解除](../../kungfu/skill/zixia-shengong/powerup.c#L38)，[ziqi调度](../../kungfu/skill/zixia-shengong/ziqi.c#L39)及[解除](../../kungfu/skill/zixia-shengong/ziqi.c#L49)，[玩家原回调](../../feature/action.c#L64)。公共战斗的[skill_power](../../adm/daemons/combatd.c#L338)读取attack／defense，但本次不量化这些加成的实战收益。

- powerup SHA-256：`0dd7e762f7ac9fca0c6e3b00e117789b0dd2ce4ee0bba96fa5c9eac52701cf06`。
- ziqi：`eb0208d34600b734620ca360a8826b3e6628f147a2a5df94a76eeba37abdeccb`。
- feature/action：`1950c8cef01eff2364cf981607dd1c254c607961152ae03f12b8a7cc15cd6f7a`。

## 证据与复跑

- 基线仍为源码 `275580a64ae2f535cdf1da2a510c8391f6681677`、mudcore `c1c29f55b94f9ce1df0f5fbfb27066a3d891aa89`；驱动 `20260929-5270e7d6-328aaf10`，SHA-256 `56c5f02398ecc35ee15f3b6b5f897471c1fdb35288d8b04b6681cb437581f135`。
- 烟雾：`C:\Users\oiuv\AppData\Local\Temp\mud-martial-data-JYm9LP/runs/attempt-2RykFf`，92/92、退出0；驱动307.983秒，执行阶段326.89秒。两项持续条件各一次，按原计时完成；确认进程实际退出才启动完整批次。
- 完整：`C:\Users\oiuv\AppData\Local\Temp\mud-martial-data-rzy29H/runs/attempt-CiapFg`，4014/4014、退出0；驱动658.238秒，执行阶段682.87秒；校验错误和残缺尾行均0。时间包含原回调等待，不是游戏运行性能评比。
- 系列指纹：`971298fcd9807389d314213a9ff187bde5dca4d58c9d06280569aef8e5a635f2`；原始记录摘要：`4c610817eabc3dfd10c5776b864cce9778e16c7db197cad710c84da37bb6496a`。
- 完整分布／状态及只读报告：`C:\Users\oiuv\AppData\Local\Temp\mud-school-huashan-duration-20261009`。旧4010条逐项重验，原摘要仍为 `bf8a26e4e23a42a6d96ed7da4844dca1ef0d8401a07a1f6909839e826ad72e50`。

```powershell
# 全部即时条件与两项自然解除；每项持续条件完整重复两次
node tools/collect_martial_data.mjs school-combat

# 单独复跑一项，不代表整个系列完成
node tools/collect_martial_data.mjs school-combat --case school-huashan-qizong-powerup-l150-expiry
node tools/collect_martial_data.mjs school-combat --case school-huashan-qizong-ziqi-l150-expiry

# 只读核验本次原始证据
node tools/tests/martial_data/school_combat_report.mjs C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-rzy29H
```

工具自检215项通过。逐项核对10139项运行期／框架源码及公共字典、29项执行工具hash，与本次采集快照一致。本轮只改JS和文档，没有新增LPC修改或格式化范围；未提交、推送、部署或修改玩家数据。

## 尚未完成

150级单独施展的自然解除已采，不替代200／400／800级全时长、重复施展、两个增益叠加、效果期间升级或更换武器、死亡／断线及实际战斗收益的观察。其他华山武学与其他门派仍须按各自入口采集；OpenSpec 4.2未勾选，整体保持10/17。

继续核对招式时发现的文字及拒绝提示错误归入[MA-061](../architecture/martial-arts-data-findings.md#ma-061华山部分绝招的动作文字与拒绝提示错误)，仅记录未修复。费用门槛与实际扣费不同、飞絮飘渺跨拳／掌读取先列待查，不在采集时擅改原规则。
