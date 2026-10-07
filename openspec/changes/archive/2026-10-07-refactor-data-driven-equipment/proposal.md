# Proposal

## Why

刀类迁移后，按可减少文件数与维护收益继续处理直接继承 EQUIP 的普通防具。当前 `/d` 下 56 份均为固定初始化，数量多于普通锤类候选；它们虽含衣服、鞋帽和腰带，但共享同一父类行为，适合单独数据化，不能混入 CLOTH 等能力不同的已迁移类别。

## What Changes

- 新增 `d/items/equip.lpc`、`equip_data.h`，集中维护 56 份直接 EQUIP 定义，保持原身体、脚、头、腰四种装备槽位及全部属性。
- **BREAKING**：统一使用 `/d/items/equip/<id>`，迁移当前 25 个调用文件中的 64 处静态引用，删除 56 份旧源码，不保留转发壳或运行期旧路径别名。
- 按实际显示、属性和行为确定品种，使用简短语义 ID 与稳定编号，数据自然排序。静态比较暂为 56 组，真实驱动确认等价后才决定最终归并。
- 保留 25 份调用一次 `setup()`、31 份不调用的初始化差异；不补耐久、不修旧文案、不改变已有性别限制，也不增加洗涤、晾干或撕布能力。
- 接入现有精确虚拟品种存取及离线映射，保持原资格和记录结构；适配鞋靴回归对即将删除文件的依赖，保留旧基线。
- 验证实际穿脱、商店、NPC 配装、记录恢复及性能，更新维护文档和适用的玩家更新说明。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle`，只替换定义与引用的实现；声明 `skip_specs: true`，不新增重复规范。

## Impact

基线为 `beef12eae82f6d52e836cdf729ac6465e5b594b7`。范围是 `d/city/npc/cloth/` 的 25 份、`d/wanjiegu/npc/obj/` 的 28 份及 `d/taohua/obj/` 的 3 份直接 EQUIP 防具，清单与依据见 [analysis.md](analysis.md)。56 个旧定义替换为两个公共程序/数据文件，预计净减少 **54 个运行期定义文件**、**55 个可编译物品源文件**，不含测试与文档。

涉及对应 NPC/商店、`feature/user_storage.c`、`tools/migrate_item_records.mjs` 和现有测试入口。新增 56 条离线路径后共 1,033 条，仍只对明确选定的备份操作。不改父类、mudcore、FluffOS、AI、权限或正式存档，不迁移锤杖等其他类别，不增加通用物品框架；提交、推送与部署另行授权。
