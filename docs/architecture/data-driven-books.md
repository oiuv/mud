# 普通研读物数据化维护

## 范围与入口

`/d` 的 36 份普通经书、秘籍、竹片等定义集中为 **28 个品种**，由 `d/items/book.lpc` 和 `book_data.h` 管理，运行期定义文件净减少 **34 个**。相同有效属性与随机规则才归并；旧文件已删除，不保留旧路径别名。完整对应关系保存在 `tools/tests/book/baseline.json`，不是运行期配置。

```c
object book, blueprint, another;
book = new("/d/items/book/daodejing1");
blueprint = load_object("/d/items/book/daodejing1");
another = new(base_name(book));
```

公共 `/d/items/book` 仅提供定义与虚拟创建入口，不能作为商品直接克隆；未知 ID 不回退为其他书籍。最终虚拟身份确定后，在 `virtual_start()` 初始化一次，克隆绑定对应蓝图，复合属性独立复制。继续继承原 **ITEM**，不新增 `setup()`、`is_book()`、`extra_long()` 或自动携带能力；可研读并不意味着必须继承 BOOK。

## 数据规范

品种按 ID 自然升序排列，使用简短名称及稳定编号，如 `bojuan`、`shiban`、`fojing1`～`fojing5`、`daodejing1`/`daodejing2`；不附加旧地区路径，不随排序改号。

基本字段为 `name`、`ids`、`weight`、`properties`。描述、价值、材质、完整 `skill`/`need` 等固定属性放在 `properties`；没有 `instance` 层。仅已有行为需要时使用以下三个字段，不允许任意表达式、回调或通用策略配置：

| 字段 | 初始化与共享规则 |
| --- | --- |
| `name_choices` | 替代 name；蓝图和每个克隆分别选择书名，保留候选顺序、重复权重及单元素池。 |
| `skill_choices` | 石板每次初始化抽样，但只有蓝图保存选定技能；克隆沿用蓝图的技能，不用本次抽样覆盖它。 |
| `jing_cost_random` | 道德经两卷的上界分别为 10/20，仅蓝图保存 `20 + random(上界)`，实例沿用。 |

建表、查询和重复初始化不抽样；重新加载蓝图可抽样，与旧实现一致。存取仍按原路径式重建，不保证保留原来就没有写入存档的随机书名或蓝图随机值。

保留容易误改的旧行为：刀法/拳法简介的字段仍叫 `sen_cost`，实际 study 的缺省最低消耗仍为 10；百变神通两次设置 value 的最终值为 100。少林与峨嵋教授不同技能的佛经不合并。凌霄两次选书遇到同一 mapping 键时仍可能只有一本，不借迁移修改数量。

## 业务与保留项

书痴售书、藏经房间刷新、萧员外奖励、全真领书、油布包开包和天空 NPC 携书统一使用规范路径。道尘、道相、武修文的公开领取函数仍接受原四个 fojing 参数，但不新增玩家 inquiry；门派、库存、价格和持有检查不变。

千字文自动携带、紫盖剑谱克隆自毁、两仪剑心得自定义研读、铁手掌装备/战斗研读、毒经上篇配方展示均保留。扩大台账扫描另发现 12 件 `/d` 自定义阅读物，也只登记、不迁移。所有剩余书籍、医书、穿戴式秘籍与范围外候选见[未迁移清单](data-driven-items-pending.md)，`/clone` 本批不改。

只修正 long 中的三处用字：四季剑法“奥决→奥诀”、薄绢“吐呐→吐纳”、石板“园园→圆圆”。玩家名称、别名和数值不改；原始源码与观测快照保留。

## 记录与部署

存取仅放行 provider 确认的真实品种，未知 ID 和其他虚拟路径不因此放行；原拒存条件保持。不新增自动载入或实例快照。

统一转换器追加 36 条映射，覆盖既有玩家、商店、显式旧袋及精确盟主字段协议。部署前停止游戏并备份代码与记录，再对**备份副本**预览；不要仅凭编译通过判断无需转换：

```powershell
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items --output C:/mud-backup/items-converted
```

输入不覆盖，输出目录必须全新；仅部署完整成功报告的 converted 副本。同品同价库存合计，价格冲突拒绝整批，实例记录与无关字段保留。回退须同时恢复对应代码及原字节备份，不能只撤回新代码。完整范围、报告含义和清单方式见[统一部署流程](data-driven-items.md#离线转换与部署)。本批只验证合成记录，未检查或转换正式存档。

## 验证入口

```sh
node --test tools/tests/test_book_inventory.mjs
node tools/tests/audit_book_migration.mjs
node tools/tests/book_remaining_inventory.mjs
node tools/tests/test_cloth_objects.mjs bin/driver.exe --book --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --book --bench
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --book --all-migrations
node --test tools/tests/test_item_records.mjs
node tools/tests/check_lpc_warnings.mjs bin/lpcc.exe
```

需要基线 `ea5f6afd1d95f22c5dc47fe23081a927ee64e11a` 和支持测试参数的本地驱动。隔离测试运行实际 study、存取、交易及相关业务片段；角色基础设施、技能服务和随机数使用明确夹具，不代表完整 NPC 战斗/任务验收。性能按 36 个来源各创建 20 次，三轮新旧独立驱动对照；实际结果见[本批验证报告](../../openspec/changes/refactor-data-driven-books/validation.md)。
