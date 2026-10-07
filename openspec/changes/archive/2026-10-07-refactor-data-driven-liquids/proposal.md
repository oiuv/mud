# Proposal

## Why

普通剑器完成后，继续优先迁移文件多、共用行为明确的类别。当前 `/d` 下 75 个饮具程序中，74 个只有固定初始化，比尚未迁移的直接 BLADE（67 个）、HAMMER（60 个）等单一类别更集中，适合继续减少重复维护。

## What Changes

- 将 74 份普通 `ITEM + F_LIQUID` 定义迁入 `d/items/liquid.lpc` 与 `liquid_data.h`，复用现有液体、饮用、装水及附加效果逻辑。
- **BREAKING**：统一使用 `/d/items/liquid/<id>` 创建品种，替换已定位的 87 个调用文件、99 处静态引用，并删除旧定义；不保留转发壳或运行期旧路径别名。
- 按实际名称、描述、属性和行为归并等价品种。ID 简洁、有意义，允许稳定编号，数据按 ID 自然排序。
- 保留初始液体、余量、容量、醉酒效果、显示、价格、权限和调用方覆盖属性的行为；各实例的液体与附加效果独立。没有已确认 BUG，不改旧参数和规则。
- 扩展现有离线路径转换、引用审计和隔离驱动回归；饮具仍不能存入背包，不新增状态快照或持久化能力。
- 玉蜂蜜 `d/gumu/obj/fengmi.c` 有专用效果，保留原实现；`/clone` 饮具和其他物品类别不在本批范围。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 的既有要求；本批为保持行为的实现重构，声明 `skip_specs: true`，不新增重复规范。

## Impact

基线为 `719a96ecd0bb9d0e24cc08eed6449184a01d0c9a`。74 份旧定义替换为 2 个共用程序/数据文件，预计净减少 **72 个运行期定义文件**，工具、测试和文档另计。静态表达式暂分 54 组，最终品种数须经真实驱动有效属性和行为核对。

涉及对应商店、房间刷新、厨房领取、宴席及搜寻奖励调用，背包精确路径识别、`tools/migrate_item_records.mjs`、既有回归工具和 `docs/architecture/data-driven-items.md`。不改虚拟对象守护精灵、mudcore、驱动、AI、饮用规则或存档结构。正式数据转换、部署和推送不包含在本次实施授权中。盘点依据见 [analysis.md](analysis.md)。
