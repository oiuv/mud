# 普通暗器数据化

## Why

短兵器迁移后，继续优先整理 `/d` 中数量较多、共同初始化明确的普通物品；`/clone` 暂不迁移。当前 33 份 THROWING 定义中，27 份适合固定数据化，且两份小李飞刀完全相同，可减少分散维护并统一等价身份。

## What Changes

- 新增 `d/items/throwing.lpc` 和自然排序的 `throwing_data.h`，直接继承现有 THROWING；使用 `/d/items/throwing/<id>`，静态预分为 26 个品种，最终以真实驱动观测核实。
- **BREAKING**：更新全部实际消费者后删除 27 份旧定义，不留壳或运行期旧路径别名；预计净减 25 个运行期程序/数据文件、26 个可编译源文件。
- 保持原暗器数量、合堆、拆分、消耗、重量、价格和禁止 wield 行为；不把暗器改成普通装备，也不新增毒性或自动保存。
- 更新已定位的 41 处静态引用（30 个文件）和钱正伦 `throwing` 动态领取分支；验证交易、房间刷新、NPC 携物/持物及奖励。
- 沿用精确虚拟品种存取校验及离线转换器，增加 27 条旧路径映射；仅在临时备份中测试，不操作正式数据。
- 保留针灸银针、可食用茶叶、两种涂毒针、随机丧门钉及凤尾箭共 6 份特殊实现，并同步未迁移物品台账。
- 按已授权的文案纠错边界，仅修正两处“挂这”及一处“沉颠颠”，单独记录文字差异及玩家更新说明；不顺带更改名称、材质、数值或玩法。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 和 `virtual-object-creation`，声明 `skip_specs: true`，不重复创建增量规范。等价身份归并与明确授权的文字纠错均沿用已有约定。

## Impact

涉及本批旧定义与消费者、`d/items/`、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、既有测试入口与新暗器夹具、物品架构说明、未迁移台账及 `help/changelog`。静态范围见 [analysis.md](analysis.md)。

不迁移 `/clone` 物品，不修改公共暗器/叠加物父类、mudcore、驱动、AI 或存档格式，不为保存临时状态新增机制。实施基线为短兵器与台账提交 `55f5e073918809866a411bfbb61c2db718df07a2`；正式上线仍需备份、按需离线转换和代码/记录配套回退。
