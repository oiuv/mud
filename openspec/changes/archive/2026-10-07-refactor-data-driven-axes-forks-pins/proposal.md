# 斧、叉、针类物品数据化

## Why

后续优先完成 `/d` 的武器与防具迁移，不再按文件数量选择类别。斧、叉、针尚未建立数据化入口，当前 9 份物品均为固定初始化，可以沿用已有虚拟物品方案集中维护。

## What Changes

- 新增 `d/items/axe.lpc`、`fork.lpc`、`pin.lpc` 及各自 `*_data.h`，分别继承原 AXE、FORK、PIN；使用 `/d/items/<分类>/<id>` 作为唯一品种入口。
- **BREAKING**：同步静态及动态消费者后删除本批 9 份旧定义，不留旧路径壳或运行期别名。静态核对为 9 个有实际差异的品种，最终以真实驱动观测复核，不为减少数量强行合并。
- 保留双手限制、实际重量、伤害、价格、动作、技能类型和 PIN 在现有战斗中的处理；保留商店、NPC 随机装备及伐木用斧判定。
- 扩充既有精确存取检查、离线映射和隔离回归，不处理正式存档，不扩展原存取资格。
- 同步维护文档和剩余物品台账；只修正分析中列明的两处纯展示文字错误，其他字段不变，展示修正同步 `help/changelog`。
- 后续另立变更，将 `FORK` 调整为以 `SPEAR` 命名的枪类，并评估现有枪、矛、叉及枪法归属。本批不引入 SPEAR、不迁移技能数据，不改现有 CLUB 枪类物品。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle`、`virtual-object-creation`，声明 `skip_specs: true`，不重复创建增量规范。

## Impact

涉及本批 9 份物品、实际消费者、`d/items/`、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、既有测试入口与本批夹具、维护台账及展示纠错日志。来源基线为 `3c7bd13cd324fe61c580c57bc865ce63fe91143a`；物品、调用和验证依据见 [analysis.md](analysis.md)。

不修改公共武器/装备基类、战斗或武学规则、驱动、mudcore、AI；不迁移 `/clone`、`/b`、`kungfu/class` 的物品，不操作正式服，不归档其他变更。装备剩余防具和特殊装备后续分批处理，不将本批通过报告为装备全部完成。
