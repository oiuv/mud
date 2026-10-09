# 手部装备数据化

28 个仅初始化的 HANDS 文件归并为 20 个规范品种，共用 `d/items/hands.lpc` 和
`hands_data.h`。使用 `new("/d/items/hands/jinjie")` 创建实例，同路径 `load_object()`
取得蓝图；同品种只有一份定义，每个实例状态仍独立。

## 维护约定

新增前先检查现有品种。显示、属性和行为相同就复用 ID，真实差异才增加定义。
ID 简洁、唯一、有意义，允许稳定编号，不拼接旧目录和长修饰词；编号不随排序改变。
`name/ids/weight` 分别保存名称、输入别名和实际重量；固定描述、价格、材质及加成统一
放在 `properties`，不设置 `instance` 层。未设置的属性保持未设置，不补猜测的默认值。

构造沿用[虚拟对象约定](virtual-objects.md)：provider 返回内部克隆，在最终虚拟身份下
通过 `virtual_start()` 初始化一次；实例默认对象为同品种蓝图，复合属性独立复制。
不直接带参数克隆 provider，不创建逐品种文件、转发壳或运行期历史别名。

## 品种差异

| ID | 保留的差异 |
| --- | --- |
| `jinjie` / `jinjie2` | 前者实际重量 400、价值 2000；后者实际重量 0、价值 10000，另有魅力加成 |
| `baijie`、`baojie`、`zijin_jie`、`yinjie`、`zuanjie` | 各自名称、价格、材质与加成保留，不因都是戒指合并 |
| `shoutao` / `shoutao2` | 前者价值 4000、leather 材质；后者价值 6000、原 hands 材质 |
| `tieshou` / `tieshou2` | 前者价值 900、有掌形护具描写；后者价值 5、原本无固定 long |
| `zhitao` / `zhitao2` / `zhitao3` | 第二种额外伤害加成；第三种显示及原 finger 材质不同 |
| `shaolin_shoutao`、`shaolin_tieshou`、`shaolin_zhitao` | 保留少林标记及各自加成 |
| `canxue_shoutao` | 两个旧来源共用；保留 rigidity=8000 等实际属性 |
| `panlong_gong` | 名为点金盘龙弓，仍按原 HANDS 护具穿戴，不新增弓箭能力 |
| `jinsi_shoutao` | 保留禁售属性、主输入 ID `jinsi shoutao` 及后洞交互 |

真实驱动确认：`jinjie2` 与其他五枚长安戒指原来使用 `set("weight", ...)`，这是普通属性，
不是 `set_weight()`。这些品种实际重量均为 0；`properties` 中的普通 `weight` 仍保留
100（紫金戒指）或 400（其余五种），不能将它们“纠正”为实际负重。另 22 个来源的实际
重量逐一对照。内部品种 ID 与玩家输入 ID 不同，原别名、文字和数值不因迁移改变。

## 行为与存取边界

直接继承 HANDS，戒指、指套与盘龙弓都仍占 `hands` 槽位，互斥穿戴；不增加洗涤、撕布、
读书或全局免毒。金丝手套的防护仍由 `d/xiyu/houdong.c` 原移桌、取鼎逻辑判断：必须穿戴
正确手套；缺失或错误手套仍触发原后果，已被取走的神木王鼎不能重复取得。

32 个调用文件统一到规范路径，含 49 处静态引用及武修文、道相各两个动态领取分支。
玩家仍用 `shoutao/zhitao`；原持有检查、门派条件、共享库存及其他护具/CLOTH/BOOTS
领取分支保留。打铁僧奖励池仍有 10 项：9 项普通铁手掌、1 项原研读物品；240 秒冷却、
身上/地上持有检查与 20 份重置库存不变，不能对奖励池去重。

以下三件原文件不迁移：`d/luoyang/npc/obj/hand.c`、`finger.c` 有死亡销毁回调，
`d/lingxiao/obj/book-iron.c` 有研读行为和不同初始化。`clone/book/book-iron.c` 也保留原实现。

背包仅接受本表已登记的精确路径，穿戴中、临时状态、禁存、独特等拒绝条件不变。
原服装、鞋靴、头饰和实体物品仍可按原规则存取。28 个旧路径只加入现有离线转换器，
与前三类共 569 条历史映射一起处理；部署必须按[统一流程](data-driven-items.md#离线转换与部署)
预览停服备份、按需转换，并联合切换代码和记录。不能只 `git pull` 后忽略旧记录。

## 验证

```powershell
node tools/tests/hands_inventory.mjs
node tools/tests/audit_hands_migration.mjs
node tools/tests/test_hands_objects.mjs bin/driver.exe --all --baseline-only
node tools/tests/test_hands_objects.mjs bin/driver.exe --all
node tools/tests/compile_hands_callers.mjs bin/lpcc.exe
node --test tools/tests/test_item_records.mjs tools/tests/test_item_ids.mjs
node tools/tests/test_hands_objects.mjs bin/driver.exe --bench
```

冻结基线为 `0265d361`，原文、哈希及引用见 `tools/tests/hands/baseline.json`。测试只在临时
MUDLIB 运行，原对象观测保存在输出目录的 `tests/weight-baseline.json`。代表测试不加
`--all`，覆盖两种金戒指、少林手套和金丝手套；完整测试涵盖全部来源及实际业务方法。
角色、显示和神木王鼎载体使用夹具，死亡只记次数；奖励测试仅在副本固定随机选择，
逐个执行原 10 项奖励。mapping 对照按键和值比较，不将哈希桶顺序误当数值差异。

性能旧/新各三个独立进程，每次 28 个来源请求、560 实例；分别报告冷加载、热创建和
驱动 `memory_info()`（不是 OS RSS）。结果及验收边界见
[本批报告](../../openspec/changes/archive/2026-10-05-refactor-data-driven-hands/validation.md)。
