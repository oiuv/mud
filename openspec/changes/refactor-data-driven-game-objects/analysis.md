# 游戏对象参数化：代码盘点与简化边界

状态：分析与规划，尚未实施。日期：2026-09-29。

## 1. 范围与方法

游戏基线 `aba7d1ea710a2fca8e8b3ee7a7beed9c684756b9`，mudcore 基线 `d2f2b92067bb40481283f93eff4503765a7bcb92`。

扫描 Git 跟踪的游戏 `.c/.lpc`，以本地 `fluffos/tools/lpc-syntax/tokenizer.mjs` 去除注释，识别直接继承和本文件函数，合计 **10,771 个文件，0 个词法错误**。另人工阅读相关头文件、公共组件、代表对象及创建/使用/交易/存取调用链。词法扫描不等于编译，更不等于每个函数都经过行为验证。

| 目录 | 文件数 | 分析侧重 |
| --- | ---: | --- |
| d | 6978 | 分散在地图中的物品、NPC；传统 ROOM 留存 |
| kungfu | 1969 | 门派/生成 NPC、技能和状态边界 |
| clone | 1002 | 物品、动物、任务、书籍、药品 |
| cmds | 331 | 拆分、交易、使用及管理 |
| adm | 199 | 商店、物品、任务、缓存与创建服务 |
| b | 106 | 副本及专属物品/NPC |
| inherit | 95 | 行为基类 |
| feature | 49 | 存取、装备、名称、默认属性与唯一性 |
| u | 30 | 旧幻境和开发区域，只盘点，不默认迁移 |
| world | 6 | AREA、建筑示例 |
| shadow / std | 各 3 | 行为组件、框架入口 |

[scan-summary.json](scan-summary.json) 保存计数；[candidate-inventory.csv](candidate-inventory.csv) 是 **4,130 个内容文件的复核索引**，不是迁移名单。它排除按直接继承识别的 ROOM、玩家连接对象及幻境主入口，保留特殊行为、待分类和应保留对象，其中 270 个没有命中分类信号。间接继承的房间仍可能位于待分类项。

索引字段：`path`、`categories`、`direct_inherits`、`local_functions`、`review_flags`。分类可重叠；`create_only` 只说明本文件识别到 create，不能证明无随机、副作用、继承行为或头文件逻辑。扫描不展开宏/头文件/条件编译，不求解动态字符串引用；实施前每批须逐文件核对，不运行自动全库转换。

扫描只读受版本管理的源码，没有读取玩家存档、数据库、凭据、生成装备或日志；没有启动正式游戏或调用 AI。FluffOS 与 mudcore 不计入游戏内容数，分别作为驱动语义和框架契约依据。

## 2. 各类候选与当前判断

以下是复核机会，不是迁移承诺。最终决定以“不增加系统复杂度”为前提；静态属性相似不足以证明适合合并程序。

| 类别（直接继承信号） | 文件数 / 仅 create | 已核对代表与公共行为 | 本次处理边界 |
| --- | ---: | --- | --- |
| 兵器 | 498 / 404 | clone/weapon/changjian.c、gangjian.c；北京 sword1..5.c；inherit/weapon/* | 路径与蓝图保留，只评估局部重复初始化；特殊 hit_ob 不合并 |
| 防具服饰 | 424 / 383 | clone/cloth/cloth.c；inherit/armor/cloth.c | 可评估局部属性初始化；保留部位、撕布、洗涤、晾干和装备限制 |
| 食物 | 194 / 174 | clone/food/peanut.c；feature/food.c | 原商店及消耗规则不动；吃完变形等独立行为保留 |
| 饮具/饮料 | 80 / 78 | clone/food/jiudai.c；feature/liquid.c | 仅评估局部复用；初始数据与可变液体隔离，不重做消费流程 |
| 技能书 | 163 / 150 | clone/book/advance-sword.c；inherit/item/book.c | skill 属性相似是候选依据；需保留商品/存档路径及研读条件 |
| 叠加物 | 85 / 49 | clone/quarry/item/baopi.c；inherit/item/combined.c | 现阶段不直接合并品种程序；保持路径，禁止为此改合堆/拆分 |
| 普通 ITEM | 876 / 478 | clone/fam/item/qiankun_stone.c 等 | 宽泛候选，含重复分类；先区分材料、容器、任务和主动行为 |
| NPC | 1555 / 743 | d/beijing/npc/caifan.c、d/city/npc/bing.c | 仅行为相同的小组局部复用；装备/掉落/归位未核实前不直接合并 |
| QUARRY/WORM/SNAKE/POISON_INSECT | 80 / 59 | clone/quarry/bao.c、clone/beast/caihuashe.c | 现有行为族继续使用，捕猎、毒性与死亡规则不改 |
| 公告板 | 61 / 60 | clone/board/baituo_b.c；inherit/misc/bboard.c | board_id 已有独立身份，但加载/移动/restore 有副作用，不能据此认定可直接参数化 |
| ROOM 及直接变体 | 4423 / 3696 | inherit/room/room.c、地图目录 | 本次不迁移，不改地点身份/出口 |

总量不可相加当作节省文件数：`clone/food/jitui.c` 同时继承 HAMMER 和 F_FOOD，吃完还变成骨头。目录和属性相似不能代替行为分类。

### 间接继承及头文件中的系列

- `clone/herb/` 有 53 个内容文件；如当归通过 herb.h 继承叠加物，并获得 is_herb 和数量初始化。复用既有行为即可，不为数据化改合堆身份。
- `clone/fam/pill/` 有 32 个内容文件；人参等已经继承同目录 pill.c，统一药力、冷却、成长与数量恢复。当前抽象已经合理，只考虑剩余重复是否值得局部整理。
- `clone/medicine/` 有 16 个内容文件；如 dieda.c 经 medicine.h 获得存取行为，但治疗/冷却/忙状态由 do_effect 决定。不同药效不能合成一种行为。
- `clone/fam/item/` 有 25 个内容文件；stone1..5 共用 stone.h 的数量/自动加载。clone/gift 混有装备、宝石与礼包，不整目录归并。
- `clone/tattoo/` 有 65 个内容文件；tattoo.c 已统一描述、可刺部位、效果展示和自动加载。无需再加一层统一定义服务。
- `clone/quarry/` 的 72 个内容文件含猎物及猎物材料，不能将目录数视为动物数量。
- `inherit/item/container.c`、`clone/misc/bag.c`、`clone/fam/bag.c` 分别涉及容量、标识与开启行为；名称有“袋”不代表同一种类。

### 已经抽象良好的部分

- 心魔幻境：`d/illusion/world.lpc:17` 使用 `new("/d/illusion/room", identity)`，room.lpc 接收世界/坐标参数。它证明直接带参创建可行，但不能证明现有物品也没有路径依赖。
- `adm/daemons/virtuald.c` 已支持坐标参数创建；保留虚拟对象职责，不扩展成全对象数据库入口。
- `adm/daemons/npcd.c` 与 `kungfu/class/generate/` 已有随机人物和门派生成策略，不另造生成系统。
- `clone/quest/search.c` 与 `inherit/misc/quest.c` 已有任务公共行为；复杂任务不整体重写。
- `mudcore/inherit/DB.c` 接收构造参数，`adm/daemons/cached.c` 使用 SQLite；现有存储能力可用，不意味着物品必须数据库化。
- AREA 已是对象加数据；传统 ROOM/AREA 模型转换不属于本方案。

### 本次保持原样的范围

| 范围 | 原因 |
| --- | --- |
| 技能、perform/exert、条件、特殊能力 | 含公式与流程；不建规则解释器，不改技能 ID/分派路径 |
| 剧情/掌门 NPC | 拜师、任务、事件回调与授艺有独立逻辑 |
| 特殊武器、鸡腿、引踪香 | 命中效果、变形、目标搜索/消耗等专用行为合理存在 |
| 唯一/单例任务物 | children/load_object/find_object 与路径共同表达身份 |
| 玩家自制装备、宠物、持久仓库 | 主人、生成路径与保存策略不能简单替换；本次不设计迁移 |
| 货币 | money_id、支付、找零和路径宏成熟，品种少，维持现状 |
| 命令、daemon、服务、shadow、框架 | 本身已是独立行为，文件数多不是改造理由 |
| 传统房间与地图 | 出口及地点身份已固定，不在本次改造范围 |

## 3. 为什么不能直接把普通物品全改成公共类加 ID

本节记录已有依赖，用于决定哪些对象不动，**不是要求先改造这些系统**。

### 蓝图默认属性

`inherit/weapon/sword.c:15` 的 init_sword 对克隆直接返回；`inherit/armor/cloth.c:10` 只在蓝图设置 armor_type。它们依赖每品种蓝图和 `set_default_object(__FILE__)`。`mudcore/inherit/dbase.c:56` 默认对象要求对象的 query 接口，不是任意 mapping。

因此保留路径的局部提取也必须保留各自默认对象，不能在公共方法里误用公共类的 __FILE__，更不能删除 clonep 判断让所有旧继承者改变行为。为普通剑建立多品种实例初始化与蓝图兼容模式，会扩大改动，本次不做。

ITEM 的 set_name 维护 s_name/s_id 缓存，不能只 set("name")。装备 setup 根据重量计算闪避，再由 ITEM_D 的 equip_setup 初始化耐久和材质稳定性；提取代码时必须按原顺序执行，不顺带改变初始化政策。

### 路径身份与消费者

| 位置 | 现有依赖 | 对本次范围的影响 |
| --- | --- | --- |
| inherit/item/combined.c:39 | base_name 相同就合堆并销毁另一对象 | 叠加品种保留不同原路径，不改合堆机制 |
| cmds/std/get.c:84、put.c:44、give.c:73、drop.c:39 | new(base_name(obj)) 拆分 | 不能共用程序后丢失品种；不加通用复制适配 |
| feature/dealer.c:10、236、349、391 | 路径调用 id/name、读取蓝图、路径价格、new(path) | 原商品入口与蓝图保持，不改商品展示/创建协议 |
| adm/daemons/shopd.c:618、cmds/usr/buy.c:52 | 玩家商店按路径存价格/库存 | 不将品种程序合并成同一个库存键 |
| cmds/std/purchase.c:122、159、214、293 | 玩家报价与履约按路径点货/复制 | 不改订单与履约身份 |
| inherit/weapon/bow.c:73 等 | 箭矢装填、拆卸按路径复制 | 不为参数化新增弓箭复制接口 |
| clone/quest/deliver.c:183 | 按路径复制交付物品 | 保留品种路径和任务行为 |
| adm/daemons/itemd.c:495 | 浸透材料直接比较路径 | 保留匹配方式，不覆盖 efun 或引入全局品种键 |

### 存取有三条不同链路

1. `feature/user_storage.c` 将 file/name/id/amount 保存到 my_depot，恢复时 new(file)。
2. `clone/misc/depot_ob.h` 是另一套连接 DBSAVE 的持久仓库，也按原物品路径恢复。
3. `feature/autoload.c:22` 保存 path[:param]，恢复先 new、move，再调用 autoload。

现有仓库不是完整实例快照，不保存任意耐久/强化。食物饮水、唯一、自制物品等还有存放限制，普通剑也不自动下线保留。这些规则全部保持；不添加 definition_id/state/格式版本，也不扩展存储资格。

三处仍有拼接 .c 的检查。本次保留原具体 .c 路径，避免以此为由启动无关的存取重构；未来若某个新增 .lpc 必须经过这些入口而需要适配，应判定该候选不符合本次局部改造边界，不能忽略兼容问题继续接入。

### 其他创建与身份约定

- 游戏 ROOM 的 make_inventory 继承 CORE_ROOM；本次保持原 objects 路径、数量、home 和归位规则，不新增定义引用格式。
- NPC carry_object 返回对象供 wear/wield 链式调用，现有调用保持原样。
- __DIR__、宏、目录枚举、继承及拼接路径须按实际代码核对；未搜到字面量引用不证明没有依赖。
- unique 使用 children(base_name())；search 使用 load_object/find_object；set_task 枚举任务物文件。共享程序可能改变其语义，因此本次不直接合并。
- 公告板 setup 会 move 与 restore，board_id 决定留言存储位置。虽然有独立 ID，也不能跳过蓝图/实例生命周期检查。
- UID/EUID、master 检查和原生 efun 语义保持不变，不新增高权限创建代理。

## 4. 数据形式的选择

| 方式 | 特点 | 本次决定 |
| --- | --- | --- |
| 普通构造/辅助方法参数 | 差异很少时最直接，类型与用途清楚 | 能满足需要就使用，不强制建表 |
| LPC mapping | 可直接保留 ANSI、中文和嵌套属性 | 数据较多且确实更易维护时使用，放类内或同目录 |
| JSON | 适合纯数据和外部编辑；宏与行为无法直接复制 | 当前无必要，不新增解析/加载流程 |
| SQLite | 适合确有在线编辑/索引查询的场景 | 当前无必要，不新增连接、迁移与备份职责 |

不建立跨类别 catalog、统一 kind/schema、缓存发布、全局 ID/别名或多后端。随机执行、条件和闭包留在行为代码；实例必须独立的 mapping/array 用正常复制处理，不让可变状态污染默认数据。已有蓝图共享机制继续保留，不为所有对象增加完整属性副本。

## 5. 逐类复核路线

| 顺序 | 范围 | 本批只回答的问题 |
| --- | --- | --- |
| 1 | 北京 sword1..5 五把剑 | 保留原路径和蓝图，提取重复初始化是否真的更清楚？否则不改 |
| 2 | 普通防具/其他兵器/技能书 | 同类重复是否足够，现有父类能否直接容纳共用步骤？ |
| 3 | 食物/饮具 | 不改商店与消费规则，是否仍能减少重复并保持实例状态隔离？ |
| 4 | 药材/药品/宝石/刺青 | 已有抽象是否已经够用？不要为了统一再加层 |
| 5 | 动物/简单 NPC/商人守卫 | 是否有真正相同的行为？是否能在本功能内完成复用而不改身份与生命周期？ |
| 6 | 容器/公告板/普通任务物 | 现有身份与副作用是否允许直接复用？需要额外适配就保留 |

每次只选一类中的小组，以“采用局部简化”或“保持原样”结束。后续类别无需全部实施，不把 4,130 个索引项都变成待办，也不设文件减少指标。

两种允许方式及停止条件详见 [design.md](design.md)：独立生命周期可直接参数化；路径依赖类只考虑局部提取。判断包括整个生命周期、所有可达出口及完整差异，不以“临时生成”或“只有 create”代替审查。

## 6. 首个对照样本：北京五把剑

| 文件（d/beijing/npc/obj/） | 名称 | 重量 | 价值 | 伤害 | 材质 |
| --- | --- | ---: | ---: | ---: | --- |
| sword1.c | 长剑 | 10000 | 1000 | 10 | gold |
| sword2.c | HIW 钢剑 | 10000 | 3000 | 20 | gold |
| sword3.c | CYN 镔铁长剑 | 10000 | 1200 | 15 | gold |
| sword4.c | 官府用剑 | 10000 | 2000 | 15 | gold |
| sword5.c | 东厂铸剑 | 10000 | 2000 | 20 | gold |

颜色、别名、描述和材质均按源码保留。即使 gold 看着奇怪，也不顺带改平衡。`clone/weapon/changjian.c` 重量 5000、价值 200、伤害 25；不能因为也叫长剑就合并品种。

已人工见到的调用方包括北京 bing2/bing3、haigonggong、guierniang、ducha、feng、yuqian1/2、zhaoqi、zhangkang。它们使用现有路径或相对路径；局部提取不应要求这些调用方切换接口。

当前结论：**不直接合并这五个程序**。可以在实施获准后用它们评估局部初始化提取，但原 create 已很短；若仅变成五个转发文件加一张表和查询入口，就继续保留现状。它们是有依据的对照样本，不是承诺迁移的试点。

## 7. 与其他规划及验证的关系

`docs/design/virtual_object_system.md` 是旧的 SQLite 全对象/地图规划，目录 README 将其列为未来方案，不能当作已落地功能。本计划不执行其统一对象表、全地图迁移和虚拟寻址，也不在本轮扩大修改旧文档。

`add-wuxia-infinite-world` 与 `evolve-ai-capability-runtime` 保持独立，不代为改任务或协议。参数化不依赖 AI 或其他外部服务。

本次只完成静态盘点和计划审查，没有实现新对象、验证运行等价或测得性能收益。实施时只对获准的小组做实际可达行为回归；频繁创建场景才补相应耗时/内存对照，不先建立测试或性能平台。

## 8. 交付核对

- OpenSpec 提案、设计、三份规格与任务清单统一采用“不增加系统复杂度”的前提。
- 全局目录/工厂、统一身份、交易适配、新存档与旧路径退出不再是实施任务。
- 候选 CSV 保留静态原始事实，不把不适合直接参数化的文件从复核证据中删掉。
- 实施任务尚未勾选；本轮没有修改游戏实现、运行配置、正式规格或 mudcore。
- `openspec validate refactor-data-driven-game-objects --strict` 已通过；12 条规格要求、20 个场景与 15 项未勾选任务保持一致。
- 4,130 条候选路径唯一且实际存在；当前受跟踪的游戏 LPC 总数与盘点的 10,771 一致。内部链接、UTF-8/LF、末尾换行与尾部空白检查通过；这些检查不代表游戏行为已验证。
