# 普通乐器数据化

## Why

继续优先整理 `/d` 中统一维护收益较高的物品。24 份普通乐器只重复固定属性与三套已有演奏入口，适合按琴、箫、筝集中维护，同时保留武器乐器的专用实现。

## What Changes

- 新增 `qin.lpc/qin_data.h`、`xiao.lpc/xiao_data.h`、`zheng.lpc/zheng_data.h`，分别继承原 ITEM 与 MI 演奏能力，使用 `/d/items/<家族>/<id>`。
- **BREAKING**：迁移 11 个消费者中的 27 处引用后，删除 24 份旧定义，不保留运行期旧路径别名。预计净减少 18 个运行期定义文件、21 个可编译源文件。
- 使用简短语义 ID，允许稳定品种编号，数据按 ID 自然排序。仅合并有效属性、显示与行为完全等价的品种；静态分析预计保留 24 个品种。
- 保留原初始化、演奏入口、技能条件、忙时、曲谱效果、货表、房间刷新及 NPC 携带行为，不重写音乐技能规则。
- 精确接入已有存取检查和统一离线记录转换，增加对象、演奏、消费者、恢复与性能回归。
- 更新维护说明、未迁移台账及玩家更新说明；本批不更改显示名、描述与输入别名。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。沿用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle`、`virtual-object-creation`；声明 `skip_specs: true`，不为同一种重构重复新增规范。

## Impact

基线为 `aab4cff1e5b17ecadd0eb36ffd3581d6a7995ec8`；逐项范围见 [analysis.md](analysis.md)。涉及 24 份定义、11 个消费者、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、现有隔离测试设施和相关文档。

不修改通用 ITEM、MI 继承、音乐技能、虚拟对象守护精灵、mudcore、驱动、AI 或存档格式；不迁移 `/clone`，不顺带处理武器乐器和只有外观而不能演奏的物品。不操作正式存档、不代为部署或推送；上线需检查旧路径记录，代码与数据配套回退。
