# 数据化物品：普通 CLOTH 服装

本批将 `/d` 下 202 个只有普通 CLOTH 初始化的服装文件归并为 **148 个规范品种**，共用一个行为程序和就近数据表。54 个重复定义不再单独维护；旧文件全部删除，不提供旧路径转发或运行期别名。架构升级兼容实际功能和数据，不保留历史目录造成的重复身份。

## 创建与维护

- 行为：`d/items/cloth.lpc`，继续继承 `CLOTH`，沿用装备、撕布、洗涤及晾干行为。
- 数据：`d/items/cloth_data.h`。`name`、`ids`、`weight` 定义名称、输入别名及重量；固定描述、材质、价值和防御等统一放在 `properties`，不设 `instance` 字段。
- 正式入口：`/d/items/cloth/<规范ID>`。例如 `new("/d/items/cloth/buyi")`、`new("/d/items/cloth/baise_changpao")`；蓝图可用同一路径 `load_object()`，同品种重建使用 `new(base_name(ob))`。
- 保留 `/d` 路径是为了维持原来的 Domain UID，不修改安全系统。`create_virtual_object(string key)` 按[通用虚拟对象约定](virtual-objects.md)接入 virtuald；驱动完成虚拟命名后，`virtual_start()` 才设置默认对象并执行一次 `setup()`。
- 不从外部使用 `new("/d/items/cloth", key)`。公共程序无参加载只保存定义，不是可流通商品；未知品种失败，不回退为布衣。

新增前先检查已有品种；实际属性、显示和行为一致时直接复用，确有差异才添加一条数据，不创建 `.c/.lpc` 入口文件。所有 ID 按物品含义使用 `snake_case`，不由地区目录、`npc/obj` 层级或作者名称拼接；门派、产地只有确属物品自身特征时才可作限定。ID 与玩家输入别名是不同概念。

例如，18 个历史布衣来源归为 `buyi`，保留 `cloth`、`linen` 及历史首字母输入；重量 1000 的 `buyi_qingxing` 和价值 5 的 `buyi_shoumai` 仍是不同品种。`tie_beixin_sengmen` 保留原 `shaolin` 属性，不与没有该属性的 `tie_beixin` 合并。商店各自的售价留在货表配置，不为跨店售价差异复制物品。

同品种共用蓝图，每件衣物仍是独立克隆，通过 `set_default_object()` 读取品种默认值，并非驱动自动复制所有属性。名称缓存和重量按现有接口初始化，可变复合属性由实例持有独立副本；实例 `set("long", ...)` 可覆盖默认描述而不影响其他物品，`delete("long")` 恢复蓝图默认值。原 28 份在重量设置前写入的 `long` 均为固定字符串（含 ANSI 文本），已统一并入蓝图，未保留历史初始化位置造成的额外数据层。需要随机或专用初始化的新行为应按实际需求实现，不预设通用实例属性层。

保留有实际意义的 0/未设置、ANSI 颜色、描述与初始化次序差异。本轮只确认普通布衣 `value=0` 与未设置在现有交易链中等价；不推广为全库零值归一规则。

带独有回调、F_NOCLONE 或不同父类的物品不套进此表。特别是直接 EQUIP 衣物不会因此获得 CLOTH 的撕布和洗涤行为。后续优先评估无回调、固定初始化的防具或兵器；食物、饮具、书籍分别按消耗、容量、阅读行为分组，先验证代表，不承诺一次迁完所有类别。

## 存储边界

背包仅额外放行本表已登记的精确虚拟路径；穿戴中、带临时状态、`no_put/no_store`、装有其他物品等原拒存条件不变。不会无条件接纳虚拟对象或所有 `.lpc` 文件。

普通 CLOTH 未开启自动加载。旧乾坤袋的 `store/take` 命令本来已禁用，本次不重新启用；只为管理员确认需要保留的历史袋记录提供离线转换。

| 持久记录 | 仅转换的字段 |
| --- | --- |
| `data/user/<首字母>/<账号>.o` | `my_depot/itemN/file` |
| `data/shop/<店铺>.o` | `dbase/vendor_goods` 与 `dbase/vendor_goods_num` 的路径键 |
| `data/dbased.o` 中明确选定的旧袋对象 | `save_dbase/<对象路径>/itemN/file` |

背包和旧袋逐条保留名称、别名、数量及其他字段，不因规范身份相同而吞并带不同状态的记录。同店同品同价库存合计数量，单价、库存总数、余额及其他玩家文本不变；价格冲突明确失败，不覆盖任一价格。采购中的 `pending` 是临时状态，通过维护重启结束，不增加存档格式。排行榜 SQLite 缓存不保存这些物品字段，不在转换范围。

## 离线转换与部署

工具：`tools/migrate_cloth_records.mjs`。`tools/tests/cloth/baseline.json` 保留源码基线 `ed10c535` 的 202 份原定义、哈希与第一版路径，不改写历史；`canonical_ids.json` 记录语义命名，`cloth_canonical.mjs` 形成多对一分组及 **404 个原实体/第一版虚拟入口到规范路径**的离线映射。运行游戏只读 `cloth_data.h`，不加载这些迁移资料。可运行 `node tools/tests/cloth_canonical.mjs` 查看完整映射，不写文件。

工具不加载玩家对象，不连接正式游戏，不自动搜索存档；只读取清单列出的备份 `.o` 文件。当前游戏使用未压缩 UTF-8 存档，其他格式须先在备份副本中按相应流程还原。

1. 安排维护，正常保存并停止游戏，备份代码与相关存档。不要用 `updateall` 代替切换：内存中的旧实例、临时订单和默认对象也需要重建。
2. 在受保护的备份目录建立 `manifest.json`，列全本次备份中的玩家及店铺存档。路径相对清单目录，使用 `/`；没有目标字段的记录保持原样。

```json
{
  "files": [
    { "file": "user/t/tester.o", "kind": "backpack" },
    { "file": "shop/test_shop.o", "kind": "shop" }
  ]
}
```

若需要保留旧袋记录，另加 `kind: "legacy_bags"` 的 `dbased.o` 条目及 `bag_objects` 数组。管理员必须先确认这些对象确实使用 `clone/misc/depot_ob.h` 的记录结构；不能把所有 dbased 条目当作袋子处理。未选对象不变，所选对象不存在或结构异常则失败。

3. 先预览，再输出转换副本。`--output` 的父目录必须存在，目标目录必须全新且不在输入目录内；输入永不覆盖。

```powershell
node tools/migrate_cloth_records.mjs --manifest C:/mud-backup/cloth/manifest.json
node tools/migrate_cloth_records.mjs --manifest C:/mud-backup/cloth/manifest.json --output C:/mud-backup/cloth-converted
```

Linux 或其他驱动位置使用 `--driver <driver路径>`。未指定 `--output` 仅预览；指定后产生原字节 `backup/`、新文件 `converted/`、清单和包含前后 SHA-256 的 `report.json`。只有完整成功报告的输出才可部署。

支持原实体路径、第一版虚拟路径和规范路径混合输入，旧路径直接转到最终规范路径。商店同品同价合并数量；价格冲突或无法安全合计库存时，报告原因和清单文件，整批不发布输出。管理员先在备份副本上核对冲突并明确价格，再重新预览，不由脚本选取任一价格。报告中的 `changes` 是迁移的路径字段/映射键数，不是物品件数；合并后的品种键数减少属正常，仍须核对总件数。

工具使用用户临时目录启动隔离驱动，临时目录含选定记录及转换结果，须由 OS 权限保护；测试结束按本地备份保留策略清理，不提交 Git。它不会外发数据或调用模型。重复预览已转换记录应为 0 项变更。

4. 核对报告、数量和价格，将 `converted/` 内对应文件与新代码一同部署后冷启动；再检查蓝图、购买、存取和刷新。开发回归不会替维护者执行此正式服步骤。
5. 回退时先停服，同时恢复旧代码及同一批 `backup/` 原始记录，再冷启动。不能只回退代码；上线后产生的新物品交易须先核对，不反向替换任意玩家文本。

## 可重复验证

```powershell
node tools/tests/cloth_inventory.mjs --audit-baseline
node tools/tests/cloth_inventory.mjs --check-references
node tools/tests/cloth_canonical.mjs
node tools/tests/audit_cloth_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe
node tools/tests/test_cloth_objects.mjs bin/driver.exe --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --bench
```

需 Node.js、本地 FluffOS 源码、驱动及 `ed10c535` 的 Git 历史。基线审计逐个核对旧源码；调用审计比较允许的路径替换及格式化。批量编译工具需要支持 `--batch` 的本地 lpcc，在临时源码副本中重命名 `create`，编译其函数体但不自动执行，并禁止 LPC 写入与外部 socket；这不是正式服启动测试，也不提高游戏本身的最低驱动要求。

独立驱动回归另用未改构造函数的 202 份原始旧定义与 148 个规范品种逐一对照。历史输入别名须可用；统一主输入名导致的括号内 ID 改变单独核对，不要求别名数组完全相等。显示辅助、测试角色和店主在线状态使用夹具，装备、移动、货币、交易、房间刷新、存取及序列化使用实际代码。交易用例分批跨时钟执行，让原有清理回调正常运行，不提高驱动回调上限。

`--bench` 每轮新启驱动，对照相同的 202 份历史来源请求和 4,040 实例；旧版实际为 202 个蓝图，新版为 148 个规范蓝图。旧/新顺序交替，共三轮。`memory_info()` 是驱动估算，不是 OS RSS。数据化减少源码重复和冷加载开销，但虚拟创建与实例状态隔离有成本；不能推断批量创建更快或实例更省内存。归并前后结果分别记录，不把旧报告冒充当前结果。
