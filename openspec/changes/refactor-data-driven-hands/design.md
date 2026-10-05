# Design

## Context

动机与影响范围见 [proposal.md](proposal.md)。基线 `0265d361` 已提供 CLOTH、BOOTS、HEAD 的品种虚拟路径、精确存取、统一离线转换和隔离测试。本批直接沿用，不增加物品框架。

2026-10-05 只读检查 `/d` 中 31 个直接继承 HANDS 的程序：28 个仅含初始化，3 个另有行为。逐组核对原文后，28 个候选预计为 20 个品种；这是静态分组，实际有效值仍须旧/新驱动对照。

### 迁移名单与固定短 ID

以下来源相对 `d/`，省略 `.c`；每个列出的来源均在本批范围。编号固定，不按排序生成，显示名与输入别名不因内部 ID 改变。

| 规范 ID | 历史来源 | 主要区别 |
| --- | --- | --- |
| `baijie` | `changan/npc/obj/baijie` | 白金戒指 |
| `baojie` | `changan/npc/obj/baojie` | 宝石戒指 |
| `jinjie2` | `changan/npc/obj/jinjie` | 价值 10000，魅力加成，普通 weight 属性 |
| `zijin_jie` | `changan/npc/obj/ring` | 紫金戒指 |
| `yinjie` | `changan/npc/obj/yinjie` | 银戒指 |
| `zuanjie` | `changan/npc/obj/zuanjie` | 钻石戒指 |
| `jinjie` | `city/npc/obj/goldring`、`city/obj/goldring`、`yanziwu/npc/obj/goldring` | 价值 2000，实际重量 400 |
| `shoutao` | `city/npc/obj/shoutao`、`city/obj/shoutao`、`jingzhou/obj/shoutao` | 价值 4000，leather 材质 |
| `tieshou` | `city/npc/obj/tieshou`、`city/obj/tieshou`、`jingzhou/obj/tieshou` | 价值 900，掌形护具描写 |
| `zhitao` | `city/npc/obj/zhitao`、`city/obj/zhitao` | 普通指套 |
| `zhitao2` | `jingzhou/obj/zhitao` | 额外 unarmed_damage=5 |
| `canxue_shoutao` | `death/sky/npc/obj/hands`、`sky/npc/obj/hands` | 残血手套，rigidity=8000 |
| `shoutao2` | `mingjiao/obj/shoutao` | 价值 6000，hands 材质 |
| `tieshou2` | `mingjiao/obj/tieshou` | 价值 5，无固定 long |
| `zhitao3` | `mingjiao/obj/zhitao` | 铁指套，finger 材质 |
| `shaolin_shoutao` | `shaolin/obj/shoutao` | 少林标记与拳掌加成 |
| `shaolin_tieshou` | `shaolin/obj/tieshou` | 少林标记与手掌伤害加成 |
| `shaolin_zhitao` | `shaolin/obj/zhitao` | 少林标记与指法伤害加成 |
| `panlong_gong` | `tulong/yitian/npc/obj/gong` | 名为弓，实际按 HANDS 穿戴 |
| `jinsi_shoutao` | `xiyu/obj/shoutao` | 禁售，星宿后洞识别其输入 ID |

“普通”指仅初始化的行为族，不是价格或强度等级。残血手套没有特殊回调，不因名字像神器另建框架。两件黄金装备 `luoyang/npc/obj/hand.c`、`finger.c` 有 `owner_is_killed()`；`lingxiao/obj/book-iron.c` 有 `init/do_study` 且未调用 setup。本批保持这 3 件原路径与行为，后续可按共同回调提取子类，并非永久不能迁移。`clone/book/book-iron.c` 也是不同的研读实现，不在 `/d` 本批范围。

## Goals / Non-Goals

**Goals:**

- 每个实际品种一份数据，调用简单，原等价物品统一身份，不兼容重复代码。
- 保留蓝图与实例的可见属性、重量、派生数值和装备行为，以及外部 NPC/房间的实际交互。
- 在同一转换入口中处理四类混合旧记录，保持明确范围、原始备份和联合回退。

**Non-Goals:**

- 不重写装备父类、通用穿戴或物品守护精灵，不新建类型注册服务。
- 不修正历史 weight 写法、材质、文案、装备槽位或平衡；不赋予防毒、弓箭或读书新能力。
- 不读取正式数据、不发布服务，不改 mudcore、驱动及 AI，不提前迁移其他类别。

## Decisions

### 1. 独立 HANDS 程序，复用既有构造约定

新增 `d/items/hands.lpc`、`hands_data.h`，公开路径 `/d/items/hands/<id>`。直接继承 HANDS，provider 内部创建克隆，最终身份下初始化一次，克隆默认对象指向同品种蓝图；复合属性独立复制。无参 provider 不可交付，未知品种拒绝，不创建逐品种文件。

不用 HEAD/CLOTH 作为父类，避免错误槽位或新增洗涤/撕布能力；当前少量构造相似不值得抽出万能装备工厂。数据沿用 `name/ids/weight/properties`，固定属性仍单层，不恢复 `instance` mapping。

### 2. 普通 weight 属性不是实际负重

6 枚长安戒指使用 `set("weight", 100/400)`，而 `feature/move.c` 的实际重量是独立 `nosave int weight`，只由 `set_weight` 改变；静态推断这些戒指蓝图和克隆实际重量均为 0。实施先用旧源码与真实驱动核对，再填数据：构造元数据 `weight=0`，普通属性 `properties` 保留原 `"weight"` 值；不得把 100/400 填入实际重量去“纠错”。同时测试查询普通属性、详情、携带负重和 setup 的派生数值。

不用批量替换原文的方式把 `set("weight")` 转为 `set_weight`。审计解析器需显式识别这两种已知写法，保留原文/哈希与实际观测，不改变历史快照。若驱动行为与静态推断不同，以原实现实际行为为准，不借此改玩法。

其他 22 个来源采用正常 `set_weight`，仍逐一核对。无 long、无 material、特殊属性拼写保持实际语义，不人为补默认文案或材质。

### 3. 按实际槽位和外部使用判断行为

HANDS 父类 setup 设置 `armor_type=hands`；戒指、指套和点金盘龙弓仍保留这一槽位，不按物品名称改为 finger 或武器。点金盘龙弓的 14 个调用均使用 `wear()`，NPC 的箭及其他战斗逻辑保持。

`d/xiyu/houdong.c` 的移桌、取鼎检查 `armor/hands` 和 `query("id") == "jinsi shoutao"`。保留该主输入别名，测试穿戴金丝手套成功、未穿戴或其他手套失败的原行为；不把描述扩展为全局免毒。房间原则上不需改实现，但须加入业务回归。

### 4. 调用替换保持领取规则与概率

现有扫描定位 30 个文件、49 处静态引用，涵盖商店、NPC、房间及奖励池。另有 4 个动态目录拼接线索：

- `d/xiangyang/npc/wuxiuwen.c`：`shoutao`、`zhitao` 两分支改为少林规范品种；原持有检查、共享库存不变，不新增少林身份门槛。
- `kungfu/class/shaolin/dao-xiang.c`：同样两分支迁移；少林身份、原持有检查、共享库存不变；已迁移 `sengxie` 和 CLOTH 分支继续有效。
- 长安副将只选武器、道尘只发武器；保持现状，不按目录前缀全部改写。

`d/shaolin/npc/datie-seng.c` 的奖励池为 9 项普通铁手掌加 1 项研读铁手掌；只替换前者路径，保留 10 项及 9:1 权重，不将数组“去重”。实际领取的身上/地上持有检查、240 秒冷却、20 份库存与 reset 仍须隔离回归；可在测试副本固定随机选择验证两个分支，不能改正式概率。

静态范围 30 文件加动态 2 文件预计共 32 个实际调用文件。实施继续检查路径比较、宏和其他拼接；计数是可复核起点，不以凑齐计数替代引用审计。

### 5. 精确存取与离线转换不扩权

在 `feature/user_storage.c` 仅增加本批已登记 HANDS 路径，不放行任意虚拟物品；原临时状态、独特、穿戴、禁存限制继续生效。扩展 `tools/migrate_item_records.mjs` 的路径表，保留前三类 541 条历史映射；新增 28 条原路径直接指向本批规范身份，不增加第二个转换工具。

临时玩家、商店和明确选定的旧袋混合四类记录；同品同价合计数量，价格冲突整批拒绝，不合并玩家分立实例记录，不修改未知字段。默认预览、全新目录输出、原字节备份、幂等与明确检查范围保持。删除旧文件后仍可从 Git 和冻结基线复核，不加入运行期旧路径别名。

### 6. 沿用测试设施，不增加评测平台

先冻结 28 份旧源码、哈希、调用与归并映射，真实驱动验证代表金戒指两类、少林手套、金丝手套；再覆盖全部品种与真实业务函数。旧/新逐项比较，测试数据不读正式玩家。前三类审计只接受本批明确的引用替换，保留原基线与业务断言。

性能采用独立旧/新进程、相同 28 个来源请求、相同实例数量、至少三轮；分别报告冷加载、热创建、驱动内存和文件减少，不设定必须加速的门槛。报告绝对耗时，不沿用头饰数字。

## Risks / Trade-offs

- [混淆普通属性与负重导致数值变化] → 同时核对两类重量、蓝图/克隆与实际携带/装备派生值。
- [同名误合并或重新分配编号] → 固定上述短 ID；按显示、属性、行为合并，保留真实差异与原别名。
- [漏动态分支或改变奖励概率] → 核对两位 NPC 四个分支，保留奖励池重复项并运行原函数测试。
- [只搬物品忽略房间识别] → 验证后洞原操作依赖，未知手套不能冒充金丝手套。
- [旧记录指向已删文件] → 停服备份预览、转换副本、代码/数据联合切换和回退。
- [文件更少但创建更慢] → 本批独立性能对照，结合绝对开销与维护收益判断。

## Migration Plan

1. 固定并核对旧定义、分组与实际调用，完成旧运行基线和代表品种验证。
2. 完成共用程序/数据、全部调用、存取及离线映射，删除本批 28 个旧定义。
3. 运行四类回归、全部调用编译、格式化/检查、迁移与性能验证，同步维护文档；仅据实际证据勾选。
4. 维护者在停服备份上预览，按需转换并核对数量/价格，再配套部署代码和记录。零变更只对已检查范围有效。
5. 回退恢复对应代码与原始记录备份；开发测试通过不代表正式服已转换或已上线。
