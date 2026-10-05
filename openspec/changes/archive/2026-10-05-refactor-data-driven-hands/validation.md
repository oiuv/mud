# 手部装备数据化验证报告

日期：2026-10-05。源码基线 `0265d3615c4429fe0a718a3a09f8766306f35494`，mudcore
`ecea802adc5075f1b86e55ee7c4b11f541f714c4` 未改动。环境：Windows、Node.js v24.21.0，
实际驱动版本 `fluffos 20260929-5270e7d6-91de2eaf`。以下是本批开发验收，不代表正式部署。

## 实施结果

- 28 个 HANDS 初始化文件归为 20 个规范品种，共用 `d/items/hands.lpc` 与 `hands_data.h`。
  保留真实属性、文字、价格、材质和加成差异；短 ID 与固定编号按 design.md 名单实施。
- 32 个调用文件完成 49 处静态替换与 4 个动态分支；武修文、道相的领取口令、各自身份要求、
  原持有检查、共享护具库存和原 CLOTH/BOOTS 分支保持。打铁僧的十项奖励池仍为 9:1。
- 背包只精确登记本表路径；统一转换器增加 28 条映射，与前三类合计 569 条。
- 删除全部 28 个旧定义，无转发壳、逐品种文件或运行期别名。原文、SHA-256、属性与调用
  冻结在 `tools/tests/hands/baseline.json`，也可从 Git 基线恢复。
- 三件未选 HANDS 对象、原研读奖励与后洞业务保持；没有修改 mudcore、驱动、AI 或正式数据。
- 本批游戏源码/头文件由 28 个变为 2 个，净减少 26 个；连同前三批累计 288 个旧定义改为
  8 个共用程序/数据文件，净减少 280 个。测试、迁移资料和文档不计入该口径。

## 原重量观测

先在隔离驱动运行全部 28 个旧对象，再接入四个代表品种，通过后才扩批。
六枚长安戒指实测如下，蓝图和克隆结果相同：

| 旧文件名 | 实际 query_weight() | 普通 query("weight") |
| --- | ---: | ---: |
| baijie、baojie、jinjie、yinjie、zuanjie | 0 | 400 |
| ring | 0 | 100 |

新品种保留这两个独立值；其他 22 个来源的重量也逐一对照，携带负重和穿戴派生值保持。
未因名为戒指、指套、盘龙弓而改变 `hands` 槽位或扩展能力。

## 命令与结果

从仓库根目录执行，最终通过的命令如下。对象回归在临时 MUDLIB 中运行；不启动正式游戏。

| 命令 / 检查 | 结果 |
| --- | --- |
| `node tools/tests/hands_inventory.mjs` | 28 份原文、哈希、解析及 20 组核对通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --hands --all --baseline-only` | 84 项旧重量/槽位断言通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --hands`（扩批前） | 401 项代表品种断言通过 |
| `node tools/tests/test_hands_objects.mjs bin/driver.exe --all`（删除与格式化后） | 4360 项断言，零失败 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --all` | 28382 项断言及迁移包装回归通过 |
| `node tools/tests/test_boots_objects.mjs bin/driver.exe --all` | 2612 项断言，零失败 |
| `node tools/tests/test_headwear_objects.mjs bin/driver.exe --all` | 5669 项断言，零失败 |
| `node --test tools/tests/test_item_records.mjs tools/tests/test_item_ids.mjs` | 15 项测试全部通过 |
| `node tools/tests/compile_hands_callers.mjs bin/lpcc.exe` | 38/38，含全部调用、后洞、背包与四类 provider |
| 原三类 `compile_*_callers.mjs bin/lpcc.exe` | CLOTH 746/746、BOOTS 18/18、HEAD 34/34；列表有重叠，不相加为独立文件数 |
| 四类 `audit_*_migration.mjs` | 数据、精确替换、无旧引用/旧文件、未选实现及无键冲突核对通过 |
| 项目 formatter 与 `--check` | 本次 38 个 LPC/头文件通过，最终无待格式化文件 |
| `node --check` | 本次 12 个新增/修改 mjs 通过 |
| `openspec validate refactor-data-driven-hands --strict`、`git diff --check` | 通过 |

四类完整对象回归合计 **41023 项断言，零失败**。包含重复来源与兼容性检查，不表示同等数量
独立场景。编译检查在临时副本重命名构造入口，编译实际函数体但不执行 NPC 构造；不冒充实服启动。

HANDS 对照检查蓝图/克隆身份、UID/EUID、默认对象、初始化一次、未知路径拒绝、嵌套状态
隔离、描述覆盖/回退、穿戴/卸除、槽位互斥和实际负重。交易、货币、房间刷新、背包存取与
记录重建复用游戏实现；原穿戴、临时状态、禁存、独特物品等拒绝条件继续验证。

NPC 和后洞测试复制工作区实际业务函数。打铁僧只在测试副本固定随机选择，逐个执行十项
奖励入口，检查 9 个普通和 1 个原研读物品、持有拒绝、240 秒冷却、库存与 reset。两名 NPC
的四个迁移分支及未选护具/服装/鞋靴分支均实际调用。金丝手套已穿戴时移桌取鼎成功，
未穿戴（包括只随身携带）、错误手套仍触发原后果；重复操作与木鼎已有归属不改变。
角色、显示辅助与木鼎载体使用夹具；死亡只计次数，没有操作真实角色或任务物品。

四类记录测试使用合成备份，覆盖全部 28 条 HANDS 映射与原三类路径，实际执行清单发现、
CLI 默认预览、副本输出、原字节备份恢复及幂等；玩家分立状态/数量、未知字段、未选旧袋
和特殊物品保留，同价库存合计，全部 28 个新映射的价格冲突分别验证整批拒绝。输入不覆盖。

首次代表测试暴露测试方法问题：mapping 的 `save_variable()` 输出顺序可能因复制改变，
但键和值相同。对照改为递归逐键/逐值比较，数组顺序和标量类型仍严格检查，并加反例验证；
不修改物品数值来迎合序列化顺序。武器相关属性同样按原对象比较，不凭名称假定必须为空。
前三类原基线不改写，调用审计先核验本批前状态，再接受本批精确替换，未放宽为任意现状。

可复核临时输出：旧重量 `mud-cloth-PyURZX`、代表 `mud-cloth-ZTKRh3`；最终 HANDS
`mud-cloth-1z5ojp`、CLOTH `mud-cloth-pBaGXa`、BOOTS `mud-cloth-9QUKq9`、HEAD
`mud-cloth-kDJCgR`；记录 `mud-record-tests-95uUr3`；HANDS 编译 `mud-cloth-compile-EHejZN`。
它们位于 Windows 用户临时目录，不提交，可能被系统清理；仓库保留基线与可重复测试代码。

## 排序与提交前补验

排序补验（2026-10-05）：四类 `*_data.h` 共 212 个品种统一按 ID 自然升序排列，
数字后缀按数值排序，不重新编号。逐品种 token 对照确认只改顶层排列，字段、属性、别名、
历史快照与迁移映射不变；生成器、审计和维护规范同步。新增排序回归通过，四类完整驱动
回归重新运行仍为 41023 项断言、零失败，四类迁移审计及四张表的 formatter/--check 通过。
提交前命名与记录测试合计 16 项全部通过；全部 40 个修改/新增 LPC 与头文件完成格式化及
--check，无待格式化文件。排序补验不重测性能，下列性能数据保留原批次结果。

## 性能对照

`node tools/tests/test_hands_objects.mjs bin/driver.exe --bench` 通过。旧/新各三个独立驱动进程，
顺序交替，每轮同样 28 个历史来源请求、560 个实例；setup 计数探针在性能测试中关闭。
原始记录来自 `mud-cloth-AKcbf4/benchmark.json`，保存为本目录 [benchmark.json](benchmark.json)。

| 指标（三轮算术平均） | 旧实现 | 新实现 |
| --- | ---: | ---: |
| 冷加载全部来源 | 59.249 ms | 31.124 ms |
| 热创建 560 实例 | 3.954 ms | 54.454 ms |
| 平均每实例热创建 | 0.00706 ms | 0.09724 ms |
| 蓝图阶段内存增量 | 131737 B | 88706 B |
| 实例阶段内存增量 | 454560 B | 667280 B |
| 品种蓝图数 | 28 | 20 |
| 游戏侧定义文件数 | 28 | 2 |

热创建约为原来的 13.8 倍，但每件绝对增加约 0.090 ms；本次冷加载均值减少约 47.5%。
560 个实例连同蓝图的驱动内存净增加 169689 B（约 165.7 KiB）。内存为各阶段 `memory_info()`
差值，不是 OS RSS；小样本本机数据不能外推整服吞吐量或承诺任何负载下都无影响。
主要收益是等价物品统一维护与净减少 26 个游戏源码文件，代价是虚拟构造和实例隔离开销。

## 文档与部署边界

维护约定见 `docs/architecture/data-driven-hands.md`，统一转换流程和四类范围已同步到
`docs/architecture/data-driven-items.md`。本批未新增通用工厂、实例属性层、CLI 或运行期别名。
proposal/design 保留实施前规划语境，实际结果以本报告和任务勾选为准；三份增量规范均有
上述重量、类别/交互、领取与离线记录测试对应。

未读取或转换正式记录、未停服/重启、未提交或推送。上线由维护者在停服备份上预览；
有旧路径时转换并核对副本，再联合部署代码与记录。零变更只证明已检查范围；回退同样须
同时恢复旧代码与对应原字节备份，不能只回退代码。
