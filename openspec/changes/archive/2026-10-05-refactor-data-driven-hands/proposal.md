# Proposal

## Why

服装、鞋靴和普通头饰已采用共用程序与品种数据。下一批处理普通手部装备，归并散落各地图的重复手套、指套、掌套和戒指，继续减少定义文件，同时保持游戏功能与已有记录。

## What Changes

- 迁移 `/d` 中 28 份普通 HANDS 初始化定义，静态核对预计归为 20 个品种；完整名单和短 ID 见 design.md。等价品种合并，真实差异保留，允许有意义的名称加固定编号。
- 新增 `d/items/hands.lpc` 与 `hands_data.h`，沿用 `create_virtual_object` / `virtual_start`、品种蓝图及单层 `properties`，不新增通用工厂或运行期别名。
- 保留 HANDS 实际槽位、有效加成、显示、价格、材质和限制；6 枚戒指的普通 `weight` 属性与实际负重分别保留，不将 `set("weight", ...)` 当作 `set_weight(...)` 修正。
- **BREAKING**：替换全部实际调用，删除选中的 28 个旧定义；目前定位 30 个文件中的 49 处静态引用，以及武修文、道相各两个动态领取分支。同步背包精确放行及既有统一离线迁移工具。
- 保留打铁僧的奖励概率与冷却、星宿后洞对金丝手套的识别，以及点金盘龙弓的实际护具行为。不按描述补出新能力。
- 排除两件有主人死亡销毁回调的洛阳装备，以及可研读的凌霄铁手掌；其他类别、mudcore、驱动、AI 和正式数据不动。

## Capabilities

### New Capabilities

无，扩展现有物品能力。

### Modified Capabilities

- `game-object-definitions`：补充 HANDS 品种的实际重量与同名普通属性分离验收。
- `game-object-families`：补充手部槽位、品种真实差异及外部互动保持要求。
- `game-object-lifecycle`：补充手部动态领取、奖励池权重和四类混合离线记录转换要求。

## Impact

代码基线为已推送的 `0265d3615c4429fe0a718a3a09f8766306f35494`；mudcore 为 `ecea802adc5075f1b86e55ee7c4b11f541f714c4`。头饰变更已完成实现但仍保留在活动变更目录；本提案不改写其验收历史或重复修订其要求。

预计修改本批物品调用、`feature/user_storage.c`、`tools/migrate_item_records.mjs`，复用现有隔离驱动及记录测试，新增 HANDS 基线、回归和维护说明。现有 CLOTH/BOOTS/HEAD 审计须能区分后续获准的路径替换，不放松旧属性与业务断言。

本轮仅规划，计数与分组尚非运行验收。实施不读取正式存档、不重启服务、不自动发布；上线由维护者先预览停服备份，按需转换后配套切换代码与记录。
