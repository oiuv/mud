# 普通鞭类物品数据化

## Why

普通杖类已完成并经用户全量编译验收；继续沿用现有分类迁移方式，优先减少同一行为下的重复定义。当前 `/d` 的普通鞭类有 32 份可复用初始化，比剩余普通匕首、棍类多，并包含六份相同拂尘和三份相同长鞭，统一维护收益明确。

## What Changes

- 新增 `d/items/whip.lpc`、`whip_data.h`，直接继承既有 WHIP；以 `/d/items/whip/<id>` 创建物品。32 份候选静态预分为 25 个品种，最终归并须由旧物品真实驱动观测核实。
- ID 使用简短物品名及必要的稳定编号，数据自然排序；原名称、属性、别名、动作及使用行为保持，不按物品外观重新分类或顺便改历史数据。
- **BREAKING**：迁移全部实际调用并删除 32 份旧定义，不保留转发壳或运行期别名。预计净减 30 个运行期定义文件、31 个可编译源文件。
- 同步钱正伦、副将、道尘三个动态分支、王方平十一件商品、两处房间陈设和其余 NPC 配装；保留三渡仅在独特黑索已被占用时创建普通长鞭的逻辑。
- 复用精确虚拟品种存取检查和离线记录转换工具，增加 32 条旧路径映射；正式备份、转换与部署仍单独执行。
- 扩充既有审计、编译、驱动回归和性能入口，同步开发文档；洛阳赤金鞭的死亡销毁回调及本批未选对象不动。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无规范级行为变更。复用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 与 `virtual-object-creation` 的现有要求；本变更以 `skip_specs: true` 明确不新增增量规范。

## Impact

基线为杖类提交 `da7027046add7e68a2ca38f04611c3c0cd745498`。静态核对见 [analysis.md](analysis.md)：29 处精确引用、19 个静态消费者，加三个动态消费者，共 22 个文件；具体实施后复核数量。

涉及 `d/items/`、选定旧物品和调用方、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、就近测试夹具及 `docs/architecture/data-driven-items.md`。不修改公共 WHIP/EQUIP 父类、虚拟守护精灵、mudcore、FluffOS 或 AI；不读取正式存档、运行期目录或改动现有背包规则。
