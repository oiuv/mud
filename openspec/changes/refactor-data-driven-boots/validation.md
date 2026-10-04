# 普通鞋靴数据化验收

日期：2026-10-04。实现对照基线：主仓库 `09e371bb`，mudcore `ecea802a`。
本次验收未改 mudcore、FluffOS、AI 服务或正式数据，未发布或重启正式服。

## 实现与审计

- 19 份旧 BOOTS 定义归为 8 个规范品种；源码原文、SHA-256、17 处静态引用与 4 条动态调查线索固定在 `tools/tests/boots/baseline.json`。
- 15 个调用文件完成 17 处静态替换、2 处动态入口迁移。钱正伦的 `feet` 与道相的 `sengxie` 保留原口令和业务判断；另外两条动态线索未选择、文件保持原字节。
- 19 个旧物品源文件已删除，可从基线 Git 历史恢复；无逐品种文件、旧路径转发或运行期映射。审计确认本批没有两条不同商品键合并造成的库存/价格配置冲突。
- 差异品种保留：两种绣花鞋的颜色/描述/价值不同，两种僧鞋的 `shaolin` 标记不同。`wood`、`boots` 材质不改数值；3 份未调用 setup 的麻鞋及直接 EQUIP 鞋保留原实现。
- 游戏运行只读 `boots_data.h`，不依赖离线基线；存取仅增加已登记 BOOTS 路径，不放开其他虚拟对象。
- 统一转换器为 `tools/migrate_item_records.mjs`，旧入口已删除。原 CLOTH 的 404 条历史映射不变，加入 19 条 BOOTS 映射；自动发现只扫描显式备份中的 user/shop，历史袋仍须显式选择。

## 实际验证

环境：Windows，Node.js `v24.21.0`；驱动启动日志为 `fluffos 20260929-5270e7d6-795eb371`。
使用现有现代驱动验证，不代表另外重测过最低版本二进制；本次不引入比已用生命周期更晚的游戏特性。

| 验证 | 命令 | 结果 |
| --- | --- | --- |
| 原始基线 | `node tools/tests/boots_inventory.mjs` | 19 份逐一对照 Git/哈希，8 组一致 |
| 调用及数据 | `node tools/tests/audit_boots_migration.mjs` | 15 文件、17 静态/2 动态，无旧入口和配置键冲突 |
| 原服装调用 | `node tools/tests/audit_cloth_migration.mjs` | 744 文件、769 静态/2 动态；保留旧基线并核对后续鞋靴替换 |
| 鞋靴运行 | `node tools/tests/test_boots_objects.mjs bin/driver.exe --all` | 2,612 项断言，0 失败，退出 0 |
| 原服装运行 | `node tools/tests/test_cloth_objects.mjs bin/driver.exe --all` | 28,382 项断言，0 失败；原迁移包装器回归通过，退出 0 |
| 备份工具 | `node --test tools/tests/test_item_records.mjs` | 8 组测试通过，退出 0 |
| 受影响调用编译 | `node tools/tests/compile_boots_callers.mjs bin/lpcc.exe` | 18/18，退出 0 |
| LPC 格式化 | 对本次 21 个 `.c/.lpc/.h` 运行项目 formatter 及 `--check` | 全部通过 |
| JavaScript 语法 | 对本次 9 个 `.mjs` 运行 `node --check` | 全部通过 |
| 规范/差异 | `openspec validate refactor-data-driven-boots --strict`、`git diff --check` | 通过 |

鞋靴运行测试覆盖：逐原定义名称/ANSI/描述/有效属性/别名/重量对照，蓝图与克隆身份、UID/EUID、默认对象、setup 一次及幂等，mapping/嵌套数组隔离、描述覆盖与恢复，性别/湿物穿戴、洗涤晾干、无撕布能力，以及实际货币/交易/存取/刷新函数。

钱正伦与道相直接提取工作区实际领取函数执行，固定库存与测试角色便于复核门派、个人配额、库存、持有判定及实例覆盖。麒麟靴另测 `ask_xue()` 的任务门槛与 `load_object` 蓝图归属，未把它当成普通克隆路径。蓝图在 NPC 与玩家间的转交使用夹具，不声称覆盖正式 `give` 命令交互。

备份测试只用临时合成记录：CLOTH/BOOTS/规范路径混用、同品同价数量合并、价格冲突整批拒绝、其他字段及 CRLF 不变、哈希/原字节备份、重复转换零变更、目录边界/链接/重复文件/空范围/部分清单，以及文档 CLI 的三种模式。不可读场景使用 EACCES 故障注入，不修改 Windows ACL。仅生成清单的测试拦截正文读取，确认不依赖驱动。混合记录同时由真实 LPC 恢复并重建物品数量。

测试发现并修复转换器原有缺陷：`restore_variable()` 可能将无效文本返回为 0；现在只有明确保存的 `0` 可当空值，错误文本不再被报告为无需转换。合法空值、无目标字段及正常历史记录继续通过。

初轮测试有两个夹具问题，已修正并复测：修改护甲后的 extra_long 不能直接与未改蓝图比较；嵌套数组写入须先取到 LPC 局部变量。未为通过测试修改真实物品属性或原标准。

## 性能：独立进程各三轮

`node tools/tests/test_boots_objects.mjs bin/driver.exe --bench`，6 个独立驱动进程，顺序旧/新、新/旧、旧/新，退出 0。每轮相同 19 个来源请求、380 个实例；旧为 19 蓝图，新为 8 蓝图与 1 provider。性能分支不注入 setup 计数，逐轮原值见同目录 `benchmark.json`。

| 指标 | 旧版 | 数据化版 |
| --- | ---: | ---: |
| 冷加载中位数 | 40.823 ms | 24.610 ms |
| 380 实例热创建中位数 | 3.538 ms | 39.134 ms |
| 每实例平均热创建（由中位数计算） | 0.0093 ms | 0.1030 ms |
| 蓝图阶段驱动内存增量 | 94,638 B | 56,521 B |
| 380 实例阶段驱动内存增量 | 310,520 B | 429,840 B |

热创建约慢 11.1 倍，但每实例平均仍约 0.103 ms；实例阶段多约 116.5 KiB，连同蓝图阶段净增约 79.3 KiB。维护定义从 19 份降到 8 份，不等于实例创建更快或更省内存。`memory_info()` 是驱动估值而非 OS RSS；这只是本机小批量样本，不是正式服负载或单次延迟上限。

本机日志位于受限 `%TEMP%`：最终鞋靴 `mud-cloth-7zwjDh`、CLOTH `mud-cloth-WOrdBD`、编译 `mud-cloth-compile-ccTNXO`、性能 `mud-cloth-qMJXvW`。临时文件不提交；可按命令复现。

提交前再次复核：鞋靴 2,612 项、CLOTH 28,382 项、备份工具 8 组、18/18 调用编译、21 文件格式检查、9 个 JavaScript 语法检查及双类迁移审计均通过；OpenSpec 全部 16 项严格校验通过。复测日志分别位于 `%TEMP%` 的 `mud-cloth-XkBRK8`、`mud-cloth-pcyT4k`、`mud-record-tests-6AvarN`、`mud-cloth-compile-TBGrrI`，未重跑性能基准，表内仍为上次六轮实测。

## 切换边界

开发验收不是正式迁移。维护者仍须正常保存停服、备份匹配代码和记录、对备份预览并按需生成转换副本，核对数量/价格后部署并冷启动。代码回退须配套恢复原记录，上线后交易另外核对。操作入口见 `docs/architecture/data-driven-items.md`，鞋靴内容维护见 `data-driven-boots.md`；本轮不附加要求维护者继续完成的游戏测试任务。
