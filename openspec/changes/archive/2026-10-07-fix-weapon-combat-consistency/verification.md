# 武器战斗一致性修复验收

日期：2026-10-07。实现基线：`007a3953`，结果对应本变更未提交工作区。
使用本机 `bin/driver.exe`、`bin/lpcc.exe`；驱动启动版本为
`fluffos 20260929-5270e7d6-328aaf10 (Microsoft Windows)`。

## 实施与证据对应

| 任务 | 实施及验收证据 |
| --- | --- |
| 1.1 | 新建 `test_weapon_combat.mjs` 和五份 LPC 夹具；修复前最小装备用例 10 项中 5 项失败，见下方基线。 |
| 1.2–1.3 | `feature/equip.c` 与 `hand` 先验后写；装备组 44 项通过，覆盖双手正反顺序、第三项占用、失败换持、转主手及实际短兵招式。 |
| 1.4 | 同步 `wield/unwield/hand` 帮助、`help/skills_weapon`、开发契约与更新日志；明确副手不叠加属性、不额外攻击。 |
| 2.1–2.2 | COMBAT_D 在命中、闪避、招架分支设置独立结果，第五参数交付；真实 `do_attack()` 驱动 31 项回调检查。 |
| 2.3 | 当前运行期源码登记的回调仅默认钝击及暗器两组，均更新签名；原重量、刚性、基础膂力比较、随机范围和分支阈值未改。 |
| 3.1 | 两绝招仅将内力判断 400 改为 500；真实伤害组核对 399/400/499 拒绝、500 命中和落空的余额、忙乱及持器/激发/等级要求；分类回归补充教学、领悟与原公式证据。 |
| 3.2 | 双方共享本次棍阵状态，使用真实 `apply/str`、`apply/dex`；75 项武学检查包含封顶/未封顶公式、原消耗、清理、过期回调及真实定时撤销。 |
| 3.3 | 同步两绝招内力、棍阵效果与消耗说明，不宣称全局属性或类别平衡已修复。 |
| 4.1 | 完整新回归、分类、实际对象启动、五组物品回归、源码清单测试及完整继承链编译均通过，结果见下表。 |
| 4.2 | 最终 17 份 LPC/头文件格式化及 `--check` 通过；检查差异、数据范围及 OpenSpec，部署注意事项见末节。 |

## 修复前基线与旧预期修正

最小装备复现保存在 OS 临时目录 `mud-weapon-combat-Wg82ix`：

- 双手主武器未拒绝副武器、副手位置仍被写入。
- 卸主手后副手未接替、相应主手伤害加成未生效。
- 换拿超重物品失败后，原手持位置丢失。

共 10 项检查、5 项失败。之后扩展夹具覆盖本方案全部机制；不能将扩展后的断言数当作修复前缺陷数。

旧匕首回归曾有 120 项失败，全部来自明确保留旧缺陷的断言：46 项要求副手不转持、46 项要求主手卸下后无伤害加成、28 项要求无闪避加成。当前夹具显式改为批准的新转持规则，并追加最终卸下后的属性归零检查；未改物品冻结快照或历史验收报告。

真实棍阵验证还发现原 `receive_damage("jingli"/"neili", ...)` 调用了只接受气血/精气的接口，会运行时报错。现改用 `add()` 扣原精力 100、内力 300，没有调整费用或资格门槛；这是恢复方案要求的原消耗，不是额外减免。

## 实际执行结果

以下均从仓库根目录执行，退出码为 0。临时目录位于操作系统临时目录，各目录保留原始输出，不纳入 Git。

| 命令 | 检查结果 | 原始输出目录 |
| --- | --- | --- |
| `node tools/tests/test_weapon_combat.mjs bin/driver.exe --equipment` | 44 项，0 失败 | `mud-weapon-combat-7AHPFy` |
| `node tools/tests/test_weapon_combat.mjs bin/driver.exe --callbacks` | 31 项，0 失败 | `mud-weapon-combat-nD1NTM` |
| `node tools/tests/test_weapon_combat.mjs bin/driver.exe --skills` | 75 项，0 失败 | `mud-weapon-combat-hnOwB3` |
| `node tools/tests/test_weapon_combat.mjs bin/driver.exe` | 150 项，0 失败 | `mud-weapon-combat-ywlaMM` |
| `node tools/tests/test_weapon_classification.mjs bin/driver.exe` | 2,100 项，0 失败 | `mud-weapon-classification-zpEaR3` |
| `node tools/tests/test_weapon_startup.mjs bin/driver.exe` | 289 项，0 失败 | `mud-weapon-startup-yQ0NKe` |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --dagger` | 7,889 项，0 失败 | `mud-cloth-qfjbHa` |
| 同上，`--sword` | 24,923 项，0 失败 | `mud-cloth-NKFeGW` |
| 同上，`--throwing` | 4,850 项，0 失败 | `mud-cloth-VRpsKv` |
| 同上，`--hammer` | 13,130 项，0 失败 | `mud-cloth-48FppC` |
| 同上，`--equip` | 18,816 项，0 失败 | `mud-cloth-Cwhf6S` |
| `node tools/tests/check_lpc_warnings.mjs bin/lpcc.exe` 加下列 9 个文件 | 9/9，0 LPC 警告、0 错误 | `mud-warning-check-3HmuqH` |

编译文件为 `feature/equip.c`、`cmds/std/hand.c`、`cmds/std/wield.c`、
`cmds/std/unwield.c`、`adm/daemons/combatd.c`、`adm/daemons/weapond.c`、
`kungfu/skill/pangu-qishi/kai.c`、`kungfu/skill/hanshan-chuifa/zhen.lpc`、
`kungfu/skill/luohan-gun/shibaluohan.c`；`include/combat.h` 随依赖编译。
Windows 驱动提示不支持 eval limit 属于平台提示，单独记录，不混称 LPC 警告。

游戏内补充验收：用户已确认 `updateall /` 全量编译成功，共 9,989 个档案。
该记录证明全量编译通过，不替代上述战斗行为回归或全类别平衡验证。

补充执行：

```sh
node --check tools/tests/test_weapon_combat.mjs
node --test tools/tests/test_dagger_inventory.mjs tools/tests/test_sword_inventory.mjs tools/tests/test_hammer_inventory.mjs tools/tests/test_throwing_inventory.mjs tools/tests/test_equip_inventory.mjs tools/tests/test_weapon_migration_expectations.mjs
```

源码清单与冻结预期测试共 30 项通过，`git diff --check` 与
`openspec validate fix-weapon-combat-consistency --strict` 均通过。公共字典仍包含 `spear → 基本枪法`、
`hanshan-chuifa → 撼山锤法`，不重复写入或覆盖其本地修改。

## 测试边界

- 新回归复制当前源码和必要公共字典到临时 MUDLIB，使用真实 NPC、属性、装备、物品生命周期及 COMBAT_D。测试 master 禁止外部 socket、数据库和外部命令；不读取正式玩家存档，不启动正式服务。
- 仅在临时源码副本替换四个随机决策点：闪避、招架、攻击者敏捷清零伤害、钝击比较；原始替换表保存于 `tests/random-patches.json`。其中敏捷点用于稳定到达所需伤害分支，不表示该全局疑点已经修正。
- 默认动作由真实 WEAPON_D 提供，捕获回调参数后继续执行原回调。招架、脱手、损坏和自制保护通过完整 `do_attack()` 验收，不以直接调用 `bash_weapon` 冒充战斗链路。
- 护甲夹具通过既有 `valid_damage` 钩子构造零/负伤害；暗器夹具只在自身解除 `no_wield` 以覆盖旧默认 throw 回调，正式暗器的不可持用规则不变。角色死亡夹具设置真实 NPC 的 ghost 字段，不制造正式尸体或奖励。
- 普通物品与分类旧夹具包含战斗/玩家身份等替身，用于属性、数量、存取和教学规则回归；真实战斗正确性由新回归另行证明。完整对象启动测试使用真实构造和继承，但不是全仓库 `updateall /`。
- 编译检查重命名构造函数以不执行启动副作用，验证完整继承链语法；它不替代真实对象启动和机制测试。没有进行线上玩家对战、长期负载或十二类兵器强度对照。

## 差异范围与交付

- 代码只修改方案内的装备、命令、战斗回调和三份武学，另同步对应测试及帮助。用户追加要求的 README 整理、2025-09 至 2026-10 玩家更新补录也已完成；它们不是战斗测试的证据。
- `data/e2c_dict.o`、`data/emoted.o` 的原有本地变动保留，不作为本次修复产物；用户在全量编译通过后授权一并提交这两份公共字典及其他现有文档更新。mudcore、FluffOS、物品定义、玩家存档、凭据及临时测试产物不纳入本批。
- 上线须完整重载依赖或在维护窗口重启，避免旧装备实例、旧阵法回调和新守护精灵混用。本次没有自行提交、推送或部署。
- 回退需回退完整依赖并重新加载；已发生的物品折损、掉落或资源消耗不会因代码回退自动恢复。
- 未修复事项保持独立：攻击者 dex/con 的全局归属疑点、历史 flags 异常、新 EDGED/POINTED/LONG 被动、小李飞刀死亡特例、定岳七方控制文案，以及十二类武器强度平衡。
