# 普通锤类数据化迁移

## Why

已完成十一类普通物品的数据化迁移；当前 `d/` 仍有 43 份可按原 HAMMER 行为复用的固定定义。将其集中维护可继续减少重复源码，同时沿用现有虚拟对象、存档转换和验收机制。

## What Changes

- 新增 `d/items/hammer.lpc` 与 `hammer_data.h`，为 [analysis.md](analysis.md) 列明的 43 份定义提供 `/d/items/hammer/<id>` 规范入口；继承原 HAMMER，不改变伤害、重量、价格、描述、持用和存取规则。
- 合并实际等价物品，保留真实差异；ID 简短、唯一、稳定并自然排序。静态预分组为 40 个品种，最终按真实驱动观测核实。
- **BREAKING**：同步全部实际调用并删除这 43 份旧实体文件，不保留运行期别名；通过既有离线转换器保留旧存档中的身份、数量和有效价格。
- 同步严格解析/调用审计、现有真实驱动回归、性能对照及开发维护文档；预计净减少 41 个运行期定义文件、42 个可编译物品源文件。
- 本批不迁移复合食物、乐器、死亡销毁或独特武器；不顺带修复旧数值、文案、父类行为或存储规则，不操作正式数据。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。本批为保持行为的数据化重构，复用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 和既有虚拟对象约定；不改变规范级要求，`.openspec.yaml` 声明 `skip_specs: true`，不创建重复增量规范。

## Impact

- 以已提交的 `9553790649746e0b8b21ef2b9dcf818fd839f242` 为基线；43 个旧对象和当前识别的 46 个实际消费者，包括商店、房间、NPC 配装与领取/任务入口。
- 精确扩展 `feature/user_storage.c` 的已登记虚拟品种检查，以及 `tools/migrate_item_records.mjs` 的获准路径映射；玩家、商店、显式旧袋及 `npc/meng-zhu.o` 的既有字段边界不变。
- 复用 `tools/tests/` 的隔离驱动与调用编译工具，新增锤类元数据/夹具并保持旧十一类快照不变；更新 `docs/architecture/data-driven-items.md`。
- 不修改 mudcore、FluffOS、AI、公共武器父类或正式存档；不提高最低驱动版本。上线前须备份并预览受影响记录，按需转换后配套冷启动，回退代码与存档须成对恢复。
