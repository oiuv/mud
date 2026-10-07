# 普通乐器数据化维护

## 范围与创建

`/d` 的 24 份普通乐器定义集中为 24 个品种，实际属性各有差异，不因同名或同价强行合并。三个处理程序分别继承 **ITEM + MI_QIN / MI_XIAO / MI_ZHENG**，不增加其他演奏能力或武器能力。

| 行为程序 | 数据表 | 品种数 | 创建示例 |
| --- | --- | ---: | --- |
| `d/items/qin.lpc` | `qin_data.h` | 15 | `new("/d/items/qin/muqin")` |
| `d/items/xiao.lpc` | `xiao_data.h` | 7 | `new("/d/items/xiao/zhuxiao")` |
| `d/items/zheng.lpc` | `zheng_data.h` | 2 | `new("/d/items/zheng/guzheng")` |

同路径 `load_object()` 查询品种蓝图，`new(base_name(ob))` 重建同品种。公共程序不作为商品直接克隆，未知 ID 拒绝创建；不保留旧路径转发文件。删除 24 个旧程序、新增 3 个程序及 3 张数据表，运行期定义文件净减少 **18 个**，可编译程序净减少 **21 个**。

## 数据与行为

字段只有 `name/ids/weight/properties`，固定属性放在蓝图，无 `instance` 层。ID 按自然顺序排列，使用简短名称与稳定编号，如 `huqin/huqin2`、`zhuxiao/zhuxiao2/zhuxiao3`；编号不随排序改变。显示名称、描述、别名、价值和材质保持原样。

驱动完成虚拟命名后，`virtual_start()` 初始化一次。克隆绑定对应默认蓝图，复合属性独立复制，蓝图和克隆分别执行一次原 `setup()`；重复初始化不刷新实例状态。继续使用 Domain UID/EUID。

原 `init()` 注册 `play`，经原 MI 调用对应演奏技能。保留 `play <曲名>`、`play <曲名> with <物品别名>`、技能门槛、等级描写、忙碌时间及曲谱效果，包括最低等级档位的原效果调用；胡琴仍按原琴类技能处理。

两家商店、两处房间和七位 NPC 的 27 处引用统一到新路径，售价、顺序、数量、刷新、随机分支和 `handing` 不变。绯胭三本自定义书保持原实现，不新增原未售乐器。

## 保留范围

7 件武器乐器保持原文件：大理瑶琴、梅庄檀木琴、桃花玉萧，以及 `/clone/lonely` 的铁琴剑、白玉瑶琴、绿玉洞箫和玉箫。它们具有 HAMMER/SWORD/XSWORD、克隆限制或战斗回调，不能套用普通 ITEM 表。名称像乐器但没有 MI 的古筝、铜钹、铜鼓、铜号也不获得演奏能力。

逐件路径与暂缓原因见[未迁移台账](data-driven-items-pending.md)。`/clone` 本批未改；副将动态配装没有乐器分支，不修改其代码。

## 存取、迁移与回退

背包只接纳三个 provider 确认的真实品种，其他拒存条件照旧；未知品种和其他虚拟路径不因此放行。不新增自动载入或实例快照，未被旧协议保存的临时状态仍不会保存。

统一转换器追加 24 条旧路径映射，原文和对应关系在 `tools/tests/instrument/baseline.json`。部署前停服并备份匹配版本代码和记录，对**备份副本**预览、按需转换：

```powershell
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items --output C:/mud-backup/items-converted
```

输出目录必须全新，输入不覆盖。沿用既有玩家、商店、显式旧袋和精确盟主字段协议；数量、价格、未知字段保持，同品同价库存合计，价格冲突整批拒绝。仅部署完整成功的输出，回退同时恢复旧代码和原记录。详见[统一部署流程](data-driven-items.md#离线转换与部署)；编译通过不代表正式存档无需转换，本批未检查正式数据。

## 验证

```sh
node --test tools/tests/test_instrument_inventory.mjs
node tools/tests/audit_instrument_migration.mjs
node tools/tests/test_cloth_objects.mjs bin/driver.exe --instrument --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --instrument --bench
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --instrument --all-migrations
node --test tools/tests/test_item_records.mjs
node tools/tests/check_lpc_warnings.mjs bin/lpcc.exe
```

冻结基线 `aab4cff1e5b17ecadd0eb36ffd3581d6a7995ec8`。测试仅运行隔离驱动/临时记录；实际演奏技能、存取和交易入口保留，玩家状态及曲谱效果使用可观测替身，NPC 只执行相关携带语句，不代表完整战斗、任务或真人客户端验收。实测结果与性能见[本批验证报告](../../openspec/changes/archive/2026-10-07-refactor-data-driven-instruments/validation.md)。
