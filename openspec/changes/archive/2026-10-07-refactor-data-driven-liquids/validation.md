# 普通饮具迁移验证记录

日期：2026-10-05。源码基线：`719a96ecd0bb9d0e24cc08eed6449184a01d0c9a`。
环境：Windows、Node.js v24.21.0、本地 FluffOS `20260929-5270e7d6-4dd319f0`。
所有驱动及记录测试使用系统临时目录中的隔离 MUDLIB 和合成记录，不读取正式存档、不操作正式服务。

## 范围与实现

- `/d` 下 75 份直接继承 F_LIQUID 的原定义中，74 份普通定义按真实蓝图/克隆观测归并为 **54 个品种**；玉蜂蜜的专用实现及 SHA-256 不变。
- 删除 74 个旧 `.c`，新增 `d/items/liquid.lpc` 与 `liquid_data.h`，本批运行期定义文件净减少 **72**。九类累计 635 份旧定义变为 18 个公共程序/数据文件，净减少 **617**；工具、冻结基线和文档另计。
- 87 个调用文件的 99 处引用全部切换，无同文件配置键归并冲突；四条动态前缀线索不创建饮具，保持原分支。
- 公共程序仍继承 ITEM + F_LIQUID，沿用通用虚拟对象生命周期；`virtual_start()` 初始化最终身份。固定属性来自蓝图，液体由原定义的独立副本初始化，实例之间及后续新品不共享余量或毒效。
- 保留原 4 份调用 `setup()`、70 份不调用的差异。权限夹具复现本库 `creator_file()` 对 `/d` 返回 Domain 的规则，分别核对蓝图与克隆 UID/EUID；不修改正式安全系统。
- 初始余量超过容量、酒水类型、字段拼写、饮用/装水/末口清除顺序按原实现保留。背包仅增加精确路径识别，仍给出原饮食拒存提示，不新增持久化、自动加载或旧路径别名。

## 已执行验证

```powershell
node tools/tests/liquid_inventory.mjs
node tools/tests/audit_liquid_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --liquid
node tools/tests/test_cloth_objects.mjs bin/driver.exe --liquid --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --liquid --bench
node --test tools/tests/test_item_records.mjs
node --test tools/tests/test_liquid_inventory.mjs tools/tests/test_sword_inventory.mjs tools/tests/test_item_ids.mjs tools/tests/test_item_references.mjs

foreach ($family in 'cloth','boots','headwear','hands','neck','wrists','food','sword','liquid') {
    node "tools/tests/audit_${family}_migration.mjs"
}
node tools/tests/test_cloth_objects.mjs bin/driver.exe --all
foreach ($family in 'boots','headwear','hands','neck','wrists','food','sword') {
    node tools/tests/test_cloth_objects.mjs bin/driver.exe "--$family" --all
}
node tools/tests/test_cloth_objects.mjs bin/driver.exe --village-startup
node tools/tests/test_cloth_objects.mjs bin/driver.exe --clone-command
openspec validate --all --strict --no-interactive
```

| 验证项 | 结果 |
| --- | --- |
| 独立旧版行为基线 | 370 项通过；观测保存在 `tools/tests/liquid/baseline.json` |
| LIQUID 全量真实驱动行为与消费者 | 最终 **8,797** 项通过，0 失败；前轮 8,796，少林饭厅随机菜品重合会使实例检查数差 1 |
| 全部调用方及相关程序编译 | **102/102**；构造函数体编译，不执行业务 |
| 九类定义、引用、归并及删除范围审计 | 全部通过；916 条历史路径不再作为运行期引用 |
| CLOTH / BOOTS / HEAD / HANDS | 28,382 / 2,612 / 5,669 / 4,360 项通过 |
| NECK / WRISTS / FOOD / SWORD | 2,481 / 1,079 / 13,458 / 22,200 项通过 |
| 实际 village 启动 / clone 命令 | 7 / 54 项通过 |
| Node 合成记录转换 | **18/18** 通过，含全部 74 个饮具旧身份及九类混合记录 |
| Node 解析、ID 排序及引用回归 | **13/13** 通过 |
| 本次 LPC/头文件格式化及 `--check` | **94** 个文件通过 |
| 本次 JavaScript 语法 / 差异检查 | 19 个文件通过；`git diff --check` 通过（排除无关编辑器配置） |
| OpenSpec 严格校验 | **19/19** 通过 |

逐定义比较原/新蓝图及实例的显示、别名、全部属性、重量和权限，验证 `new(base_name(ob))`、未知键、直接构造拒绝、初始化幂等和定义查询的深拷贝。特意修改蓝图液体后再创建，确认新品从未修改的定义恢复；`query("liquid")` 仍返回自身可变 mapping，实际 `fill` 可直接修改。

通过真实 `drink/fill/pour` 覆盖忙碌、战斗、饱水、空饮具、正常及最后一口、自动丢空饮具、醉酒和下毒。末口先执行毒效再清除，且不叠加醉酒；`fill` 保留原效果变量行为，不借迁移修正旧规则。测试下毒只用确定参数的药粉夹具，绑定和饮用执行实际命令。

四个宴席的实际 `create_water/create_wine` 方法、华山厨房领取/离开/刷新、素素供茶/库存、搜寻四档奖励均做原/新对照。当前少林饭厅实际创建并补刷饮具和食物，交易使用原 dealer、货币与物品移动代码。无关角色、网络和部分显示辅助使用隔离夹具，不能把此结果称为实服全量启动验证。

合成记录覆盖全部 74 条饮具路径与原八类混合、原字段和无关文本保留、同价库存合计、每个旧身份的异价冲突整批拒绝、原字节备份/回退及幂等。已有精确 `npc/meng-zhu.o` 两字段流程也通过；不扩大 NPC 扫描范围。只转换已有路径，不声称恢复原来未保存的剩余液体或毒效。

开发中修正了两处夹具问题：静态词法器把 `([` 分为两个 token；最小测试 master 起初未提供 `pour` 所需的 `valid_bind()`。已修正词法断言及仅限隔离下毒测试的授权后重跑；没有放宽正式权限或更改饮用命令。

## 独立进程性能对照

三组旧/新分别使用独立驱动，交替先后顺序；每次加载相同 74 个来源请求，再每来源创建 20 次，共 **1,480 个实例**。旧版为 74 个品种蓝图，新版为 54 个。性能测试不插入 setup 计数，最终三组未与本次其他回归并行。初轮与其他测试重叠的探索数据不参与以下结论。

原始数据见 [benchmark.json](benchmark.json)，时间单位如下表为 ms，`version=0` 表示旧版，`1` 表示新版。

| 组 | 旧冷加载 | 新冷加载 | 旧热创建总计 | 新热创建总计 |
| --- | ---: | ---: | ---: | ---: |
| 1 | 131.047 | 42.152 | 5.550 | 150.553 |
| 2 | 80.191 | 27.723 | 5.641 | 154.815 |
| 3 | 98.085 | 31.250 | 7.591 | 147.712 |

- 冷加载中位数 **98.085 → 31.250 ms**。
- 每实例平均热创建耗时（三轮取中位数）**0.00381 → 0.10173 ms**，绝对增加约 **0.09791 ms**。这是总耗时除以实例数，不是逐次延迟分位数；不宣称批量创建更快。
- 蓝图阶段驱动内存增量 **286,710 → 182,539 字节**，减少 104,171 字节。
- 1,480 个实例内存增量 **1,698,320 → 1,818,940 字节**，增加 120,620 字节；本负载两阶段净增加 **16,449 字节，约 16.1 KiB**。三个样本的内存读数一致，不推广为其他物品比例或规模的固定增量。
- 加载阶段新增程序块 **81 → 9**（含公共依赖），克隆阶段均不新增程序块。
- `memory_info()` 和 `mud_status(1)` 是驱动统计，不是 OS RSS，不代表正式服峰值、吞吐或玩家延迟。亚毫秒的热创建成本不作为继续增加缓存/框架的理由。

## 交付与部署边界

维护说明及 `help/changelog` 已同步。旧源文件可从 Git 基线与冻结测试原文恢复，但正式回退必须恢复配套代码与对应原始记录，不能仅还原文件名。

开发代理未读取/转换正式存档，未重启、部署、推送或执行实服 `updateall`。上线仍按既有流程停服备份，对显式备份预览、按需转换，再联合切换代码与记录并冷启动；背包拒存不等于历史商店或其他获准字段必然没有旧路径。

2026-10-05，维护者另行反馈实服 `updateall /` 全量编译成功：**10,423 → 10,350**，减少 **73** 个编译档案，与删除 74 个 `.c`、新增 1 个 `.lpc` 一致；新增 `.h` 不单独编译，因此磁盘定义文件净减少仍为 72。此记录来自维护者提供的游戏输出，不代表开发代理执行了正式部署，也不证明历史存档已完成转换。

本机原始测试输出保存在临时目录：基线 `mud-cloth-yuzPEu`，饮具最终回归 `mud-cloth-WyyPKN`（前轮 `mud-cloth-Z7jd81`），编译 `mud-cloth-compile-PpLQQi`，记录 `mud-record-tests-KFqggu`，最终基准 `mud-cloth-UohEQ9`。输出日志不提交，仓库只保留可重跑的测试、冻结源码/观测及非敏感性能样本。另有 `.vscode/settings.json` 的无关修改，未纳入本次实现。
