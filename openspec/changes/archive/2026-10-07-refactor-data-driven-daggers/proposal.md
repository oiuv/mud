# 普通短兵器数据化

## Why

鞭类迁移已经提交并通过用户全量编译验收，继续优先整理数量较多、共同初始化明确的类别。当前 `/d` 下有 23 份普通 DAGGER 定义，其中两份普通匕首等价，可沿用现有分类体系减少重复文件和维护入口。

## What Changes

- 新增 `d/items/dagger.lpc`、`dagger_data.h`，直接继承既有 DAGGER，以 `/d/items/dagger/<id>` 创建品种；静态预分为 22 组，最终以原对象真实驱动观测确认。
- 使用简短物品名和必要的稳定编号，数据按 ID 自然排序；等价物品统一身份，真实差异保留。扇、笔、箫仍保持旧短兵器行为，不按名称重分类。
- **BREAKING**：迁移全部实际调用并删除 23 份旧定义，不保留转发壳或运行期旧路径别名。预计净减 21 个运行期定义文件、22 个可编译源文件。
- 更新 25 处静态引用及钱正伦 `dagger` 动态领取分支；验证两个商店、书室刷新、NPC 配装与手持展示，保留副手装备规则。
- 复用精确虚拟品种存取检查、离线记录转换及现有测试入口；增加 23 条历史路径映射，正式数据操作和部署不在开发范围内。
- 按用户已授权的文案纠错范围修正三处明确错漏，清单见 `analysis.md`；旧源码与观测不改写，文字修正单独验证并更新 `help/changelog`。
- 保留洛阳赤金匕首的死亡销毁回调及未选类别，不改公共武器父类、mudcore 或驱动。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。复用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 与 `virtual-object-creation`，以 `skip_specs: true` 不新增增量规范。主规范的玩法与数据保留要求继续适用；三处用户授权的文字纠错作为明确修复例外，不扩大为修改名称、材质、数值或功能。

## Impact

基线为 `6ad10eeeec22acc6e7190a72352b3e59c2d68840`。静态核对见 [analysis.md](analysis.md)：23 份候选、22 个预分品种、15 个静态消费者，加一个动态消费者，共 16 个文件；实施后复核实际数量。

涉及 `d/items/`、选定旧定义及消费者、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、既有测试与夹具、`docs/architecture/data-driven-items.md`、`help/changelog`。不读取或修改正式存档、不放宽背包资格，不改 AI、公共父类、虚拟分派或子模块；保留工作区已有无关修改。
