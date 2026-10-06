# 普通棍类数据化

## Why

暗器批次已提交且用户全量编译通过，继续整理 `/d` 中可集中维护的普通物品。当前 19 份 CLUB 定义中有 18 份固定初始化，可复用已验证的武器迁移流程；两份齐眉棍完全相同，预计归并为 17 个品种。

## What Changes

- 新增 `d/items/club.lpc`、`club_data.h`，直接继承 CLUB；以 `/d/items/club/<id>` 为唯一品种入口，使用简短名称和自然排序，最终归并以真实驱动观测为准。
- **BREAKING**：同步消费者后删除 18 份旧定义，不留转发壳或运行期别名；预计净减 16 个运行期定义文件、17 个可编译源文件。
- 保持原重量、价值、材质、LONG 标志、装备加成和领取条件；钓竿、铁桨、旗、枪仍按原 CLUB 行为，不按显示名称改类别或赋予新功能。
- 迁移 27 处静态引用（21 个文件）和三个齐眉棍动态路径函数，共 24 个消费者；不改变 inquiry 配置，不新增玩家入口。钱正伦不支持领取 mace，扫描命中只作线索，代码保持不变。
- 增加精确存取检查和 18 条离线路径映射；使用合成记录验证，不处理正式数据。
- 保留赤金棍死亡销毁回调；`/clone`、`/b` 只盘点，不迁移；按现有规范更新未迁移台账。
- 仅修正 analysis.md 列出的展示文字错误，保持名称、输入别名、数值和玩法；旧快照不改写，玩家可见纠错同步 `help/changelog`。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle`、`virtual-object-creation`；声明 `skip_specs: true`，不重复创建增量规范。

## Impact

涉及 18 份物品定义及其实际消费者、`d/items/`、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、既有测试入口与本批夹具、物品维护文档及玩家更新说明。冻结基线为暗器提交 `f4d88805d088d554fb59cdb60d1fb40f1d596484`；具体清单见 [analysis.md](analysis.md)。

不修改公共装备行为、技能规则、驱动、mudcore、AI 或存档格式，不迁移 `/clone`、`/b` 物品，不新增通用物品框架。正式部署仍需备份、按需离线转换及代码/记录配套回退，另行授权。
