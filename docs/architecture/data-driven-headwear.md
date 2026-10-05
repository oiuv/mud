# 普通头饰数据化

头盔、帽子、头巾和花饰共用 HEAD 行为，使用头部槽位，不继承衣服或鞋靴的洗涤、晾干和撕布能力。
开发入口为 `d/items/headwear.lpc` 与 `headwear_data.h`，以无扩展名路径创建，如
`new("/d/items/headwear/gangkui")`。等价物品复用现有 ID，实际属性或显示不同才增加数据定义；
ID 简洁、唯一、能识别大致物品即可，允许短名称加稳定编号；不拼接整段品种名或描述修饰词，
不携带仅表示来源的地区或目录信息。命名通则见[物品维护约定](data-driven-items.md)。

新增普通头饰时，在 `headwear_definitions()` 中添加一个语义 ID，填写 `name`、`ids`、`weight`
及 `properties` 的属性键值对。例如现有 `gangkui` 使用重量 800、`material=steel`、
`armor_prop/armor=5`；需要同样钢盔的 NPC 直接引用该 ID，不复制数据。只有确有蓝图/克隆
重量差异才填写 `clone_weight`；有特殊回调的物品另按实际行为处理。新增品种同步补测试，
不要修改历史基线来掩盖数值变化。

## 构造约定

`create_virtual_object(key)` 返回内部克隆，驱动赋予最终虚拟身份后通过 `virtual_start()`
初始化一次。蓝图保存 `properties` 固定属性，实例独立覆盖；不要直接带参数克隆 provider，
不要创建逐品种文件或运行期旧路径别名。嵌套可变属性与默认数据隔离。

重量不是普通属性：`weight` 指定蓝图和默认克隆重量，可选 `clone_weight` 只表达原有的实例重量差异，
有效零值不能用真假判断忽略。没有 `instance` 属性层，不借数据化修改历史平衡或文案。

隔离真实驱动已确认：13 种茶花、3 种佛山花饰及翠羽的旧蓝图重量为 10，旧克隆重量为 0；
数据保留这一差异。它们的完整详情包含重量，因此蓝图与克隆的详情原本就可能不同。

## 范围与命名

39 份旧定义归为 36 个品种，共用一个 LPC 程序及一张数据表。两份钢盔共用 `gangkui`；
三份铁头盔共用 `tie_toukui`。其余品种存在实际差异，不为减少数据条数强行合并。

- 玫瑰按颜色及实际差异区分：`hong_meigui` 是普通红色玫瑰，`hong_meigui3` 保留高价值、禁售及彩色描述，`hong_meigui2` 对应奔放文风的红玫瑰；`huang_meigui2` 保留女性限制及含情描写，不与另一种 `huang_meigui` 混同。
- 茶花 ID 使用 `chahua1` 至 `chahua13`，一一对应原茶花品种编号；“落第秀才”“十八学士”等玩家名称及属性不变。编号固定，不随表的排序或新增品种改变。
- `jindai` 与 `jindai2` 的描述和性别限制不同；`shaolin_toukui` 保留实际 `shaolin` 标记，不与 `toukui` 合并。
- `zangseng_mao` 根据僧帽实际描述命名，保留原 `xueshan` 标记；所有玩家可见文字和原有属性键保持。

45 处静态引用以及钱正伦 `helmet` 动态领取入口统一到规范路径，领取口令、共享护具限额、
库存和领取后价格/禁售覆盖不变。2 件死亡销毁装备仍保留原文件：
`d/death/npc/obj/armor2.c`、`d/luoyang/npc/obj/head1.c`。它们可在后续按共同回调抽取子类，
本批不把死亡销毁能力混入普通头饰。

背包只放行表内精确头饰路径，原拒存条件不变。旧路径仅保存在 Git 基线、离线映射及测试资料中，
不上线运行期别名；上线流程见[统一物品迁移](data-driven-items.md#离线转换与部署)。

命名精简涉及 19 个 HEAD ID，新旧对应保存在 `tools/tests/item_id_renames.json`，只供离线迁移和审计；
原 39 份源码快照及其旧 ID 保持不变。读取测试基线时只投影当前目标路径，不改写原文或哈希。

## 验证

`node tools/tests/headwear_inventory.mjs` 只读核对历史源码与分组，不读取正式存档。
`node tools/tests/test_headwear_objects.mjs bin/driver.exe` 在临时 MUDLIB 对照代表品种；
加 `--all --baseline-only` 仅验证全部原对象重量及头部槽位，观察值保存在测试输出目录的
`tests/weight-baseline.json`。隔离测试不启动正式游戏。

完整功能回归加 `--all`，覆盖原对象逐项对照及实际装备、移动、交易、刷新、领取、存取和记录重建。
`node tools/tests/audit_headwear_migration.mjs` 验证归并数据、允许的调用替换、无旧文件和未选对象不变；
`node tools/tests/compile_headwear_callers.mjs bin/lpcc.exe` 在临时源码副本中只编译，不执行 NPC 构造。
`node --test tools/tests/test_item_records.mjs` 验证三类混合备份的预览、副本、数量/价格、冲突及恢复。

性能测试：`node tools/tests/test_headwear_objects.mjs bin/driver.exe --bench`。
旧/新使用独立进程，各三轮；每轮同样 39 个来源请求、780 个实例，分别报告冷加载、热创建及驱动
`memory_info()`，后者不是 OS RSS。文件减少不代表热创建一定更快，使用绝对值评估影响。

本批实测与验收边界见[验证报告](../../openspec/changes/archive/2026-10-05-refactor-data-driven-headwear/validation.md)。

本批范围及实施状态见 [OpenSpec 设计](../../openspec/changes/archive/2026-10-05-refactor-data-driven-headwear/design.md)
和 [任务清单](../../openspec/changes/archive/2026-10-05-refactor-data-driven-headwear/tasks.md)。上线须使用统一离线迁移工具
核对停服备份、按需转换旧记录，并配套切换代码；开发测试不代表正式数据已经迁移。
