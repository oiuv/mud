# 普通秘籍与研读物数据化

## Why

已完成十七类普通物品迁移及新版 FluffOS 编译警告清理，继续优先整理 `/d` 中统一维护收益较高的类别。当前 41 份带研读属性的物品中，36 份可复用普通 ITEM 行为，静态核对预计归并为 28 个品种，比继续迁移少量剩余装备更有收益。

## What Changes

- 新增 `d/items/book.lpc`、`book_data.h`，以 `/d/items/book/<id>` 为唯一正式品种入口；仍继承 ITEM，不因类别名为书籍就改成 BOOK 或增加新功能。
- **BREAKING**：更新实际引用后删除获准迁移的 36 份旧定义，不保留转发壳或运行期旧路径别名。预计净减少 34 个运行期定义文件、35 个可编译源文件，最终以实施结果为准。
- 使用简短、稳定的语义 ID，按自然顺序排列；归并相同品种，保留真实显示、研读门槛、消耗、技能与材质差异。
- 保留随机书名的实例级取值，以及石板技能、道德经消耗的蓝图级取值；不把随机值提前固定在公共数据表，也不改为每次研读重新随机。
- 同步 19 处静态引用及已确认可达的动态创建入口，保持商店、房间刷新、领取条件和任务交付。
- 复用精确存取检查和离线路径转换，增加本批回归；不读写正式存档。
- 保留 5 件具有自动载入、自定义研读、装备或克隆销毁行为的特殊物品；更新未迁移台账，`/clone` 暂不迁移。
- 仅纠正分析文档列出的纯描述错字，保留物品名称、别名、属性和玩法；玩家可见纠错同步 `help/changelog`。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 和 `virtual-object-creation`；声明 `skip_specs: true`，不重复增加相同要求。

## Impact

分析基线为 `ea5f6afd1d95f22c5dc47fe23081a927ee64e11a`。涉及 36 份定义、预计 20 个实际消费者、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、现有测试入口及本批夹具、物品维护文档与玩家更新说明；逐项范围见 [analysis.md](analysis.md)。

不修改通用 ITEM/BOOK、study/du 技能规则、虚拟对象守护精灵、mudcore、驱动、AI 或存档格式。不自动修正旧技能字段，不增加自动保存，不迁移 `/clone`、不归档其他任务。正式部署和正式备份转换另行授权，代码与记录须配套回退。
