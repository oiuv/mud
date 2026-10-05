# Proposal

## Why

服装、鞋靴、头饰、手部装备和颈饰已完成数据化，普通护腕仍在地图目录重复定义。继续沿用现有虚拟物品、存取和离线迁移机制，把等价资产统一维护，不改变旧玩法或再建框架。

## What Changes

- 将 `/d` 下 6 份仅初始化的 WRISTS 定义归并为 4 个品种：`huwan`、`shaolin_huwan`、`tie_huwan`、`wanlian`，以 `d/items/wrists.lpc` 和 `wrists_data.h` 维护。
- **BREAKING**：正式入口改为 `/d/items/wrists/<id>`，统一 6 处静态引用及武修文、道相的护腕领取分支；验收后删除这 6 个旧文件，不保留转发壳或运行期别名。既有持久路径通过统一离线转换器迁移。
- 保留少林属性、显示和输入别名、数值及装备行为；鎏金腕链的普通 `weight=200` 不当作实际负重，先用真实驱动核验旧蓝图和克隆。
- 背包仅放行本表已登记路径；复用现有交易、存取、记录转换及隔离测试，补充维护说明。
- 保留绞金腕轮 `d/luoyang/npc/obj/wanlun1.c` 及其死亡销毁回调；不扩大到护腰容器、特殊装备或其他类别。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

无。复用 `game-object-definitions`、`game-object-families`、`game-object-lifecycle` 现有要求；本批是既有行为下的实现迁移，声明 `skip_specs: true`，不为扩批建立重复规范。

## Impact

基线为 `61abfde332b86b286f2cf8ce44d5b502cfbec10e`。影响 6 个旧定义、8 个实际调用文件、`feature/user_storage.c`、`tools/migrate_item_records.mjs`、已有测试及维护文档；新增一个共用程序和一张自然排序的数据表，预计净减少 4 个游戏定义文件。

不改装备父类、mudcore、驱动、AI 或领取资格；除非明确确认 BUG，否则以旧代码实际行为验收。正式部署须停服备份、按需转换并联合切换代码和记录，本规划不授权操作正式数据、重启或推送。
