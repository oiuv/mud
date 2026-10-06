# 数据化物品：普通装备、食物与饮具

本批将 `/d` 下 202 个只有普通 CLOTH 初始化的服装文件归并为 **148 个规范品种**，共用一个行为程序和就近数据表。54 个重复定义不再单独维护；旧文件全部删除，不提供旧路径转发或运行期别名。架构升级兼容实际功能和数据，不保留历史目录造成的重复身份。

后续 BOOTS 批次将 19 个标准鞋靴定义归为 **8 个规范品种**，详见[鞋靴维护说明](data-driven-boots.md)。HEAD 批次将 39 个普通头饰定义归为 **36 个规范品种**，详见[头饰维护说明](data-driven-headwear.md)。HANDS 批次将 28 个初始化定义归为 **20 个规范品种**，详见[手部装备维护说明](data-driven-hands.md)。NECK 批次将 15 个初始化定义归为 **10 个规范品种**，详见[颈饰维护说明](data-driven-neck.md)。WRISTS 批次将 6 个初始化定义归为 **4 个规范品种**，详见[护腕维护说明](data-driven-wrists.md)。FOOD 批次将 167 个普通食物定义归为 **119 个规范品种**。SWORD 批次将 85 个普通剑定义归为 **70 个规范品种**。LIQUID 批次将 74 个普通饮具定义归为 **54 个规范品种**。BLADE 批次将 61 个普通刀定义归为 **52 个规范品种**。

直接 EQUIP 批次将 56 份普通防具定义集中为 **56 个规范品种**，复用原 EQUIP 行为；本批实际属性均有差异，不因同名而合并。HAMMER 批次将 43 份普通锤类定义归为 **40 个规范品种**。STAFF 批次将 37 份普通杖类定义归为 **32 个规范品种**。WHIP 批次将 32 份普通鞭类定义归为 **25 个规范品种**。DAGGER 批次将 23 份普通短兵器定义归为 **22 个规范品种**。十五类保持各自继承和行为，共用以下离线迁移与部署流程；累计 887 个旧定义集中为 30 个共用程序/数据文件，定义文件净减少 **857 个**（不含工具、测试及文档）。

## 未迁移物品与维护台账

已迁移分类并不表示该类别所有物品都已数据化。[剩余物品清单](data-driven-items-pending.md) 按十五个分类列出当前仍保留的实体物品名称、路径、特殊行为及暂缓原因，并区分 `/d` 内保留项与其他目录尚未纳入范围的候选。涉及多类的物品交叉登记、按文件去重统计，不把同名 ITEM 或共享基类算作待迁移装备。

后续每批迁移必须同步维护该清单：补充新分类的保留项，移出已完成项并在批次记录/离线映射中保存去向，更新数量、原因和源码链接。重点检查回调、额外继承、头文件注入、初始化差异、自动携带和存档状态；“特殊”不是永久禁止迁移，但须有保持旧行为的独立验证，不能只迁固定属性。历史快照和归档报告保持原样。

## 创建与维护

各 `*_data.h` 的顶层品种统一按规范 ID 自然升序排列：字母按名称排序，数字后缀按数值排序（如 `chahua1`、`chahua2`、…、`chahua13`）。新增条目插入对应位置；不因排序更换 ID 或编号，不调整品种内部字段、别名及属性数组顺序。离线生成器与审计采用同一规则，历史快照和迁移映射保持不变。

- 行为：`d/items/cloth.lpc`，继续继承 `CLOTH`，沿用装备、撕布、洗涤及晾干行为。
- 数据：`d/items/cloth_data.h`。`name`、`ids`、`weight` 定义名称、输入别名及重量；固定描述、材质、价值和防御等统一放在 `properties`，不设 `instance` 字段。
- 正式入口：`/d/items/cloth/<规范ID>`。例如 `new("/d/items/cloth/buyi")`、`new("/d/items/cloth/baise_changpao")`；蓝图可用同一路径 `load_object()`，同品种重建使用 `new(base_name(ob))`。
- 保留 `/d` 路径是为了维持原来的 Domain UID，不修改安全系统。`create_virtual_object(string key)` 按[通用虚拟对象约定](virtual-objects.md)接入 virtuald；驱动完成虚拟命名后，`virtual_start()` 才设置默认对象并执行一次 `setup()`。
- 不从外部使用 `new("/d/items/cloth", key)`。公共程序无参加载只保存定义，不是可流通商品；未知品种失败，不回退为布衣。

新增前先检查已有品种；实际属性、显示和行为一致时直接复用，确有差异才添加一条数据，不创建 `.c/.lpc` 入口文件。所有迁移数据的规范 ID 应简洁、唯一，能大致识别内容即可；多词使用 `snake_case`，允许有意义的短名称加稳定编号，如 `buyi2`、`xiuhuaxie2`、`chahua13`。不由旧地区目录、`npc/obj` 层级或作者名称拼接，也不强行把全部颜色、重量、价格、描述和限制写进 ID；简短实用的门派等特征可保留。编号不是数组下标，确定后不随排序或新增品种改变。ID 与玩家输入别名是不同概念，命名精简不修改玩家名称、别名或属性。

例如，18 个历史布衣来源归为 `buyi`，保留 `cloth`、`linen` 及历史首字母输入；重量 1000 的 `buyi2` 和价值 5 的 `buyi3` 仍是不同品种。`tie_beixin2` 保留原 `shaolin` 属性，不与没有该属性的 `tie_beixin` 合并。商店各自的售价留在货表配置，不为跨店售价差异复制物品。

同品种共用蓝图，每件衣物仍是独立克隆，通过 `set_default_object()` 读取品种默认值，并非驱动自动复制所有属性。名称缓存和重量按现有接口初始化，可变复合属性由实例持有独立副本；实例 `set("long", ...)` 可覆盖默认描述而不影响其他物品，`delete("long")` 恢复蓝图默认值。原 28 份在重量设置前写入的 `long` 均为固定字符串（含 ANSI 文本），已统一并入蓝图，未保留历史初始化位置造成的额外数据层。需要随机或专用初始化的新行为应按实际需求实现，不预设通用实例属性层。

保留有实际意义的 0/未设置、ANSI 颜色、描述与初始化次序差异。本轮只确认普通布衣 `value=0` 与未设置在现有交易链中等价；不推广为全库零值归一规则。

纯展示文案中的明确错别字和病句可以随维护修正，保持原意，不改变身份、输入别名、存档字段或玩法；例如持用提示中的“一股杀气直聂九霄”已修正为“一股杀气直慑九霄”。生成器同步采用修正文案，历史源码与驱动观测快照不重写；回归仅对已确认的字段和文本差异调整预期，不忽略其他属性。

带独有回调、F_NOCLONE 或不同父类的物品不套进此表。特别是直接 EQUIP 衣物不会因此获得 CLOTH 的撕布和洗涤行为。后续优先评估无回调、固定初始化的防具或兵器；食物、饮具、书籍分别按消耗、容量、阅读行为分组，先验证代表，不承诺一次迁完所有类别。

## 直接 EQUIP 防具

`d/items/equip.lpc` 直接继承原 `EQUIP`，定义在 `equip_data.h`。例如 `new("/d/items/equip/magua")` 创建马褂，`load_object("/d/items/equip/magua")` 查询其蓝图，`new(base_name(ob))` 重建同品种；公共 `/d/items/equip` 不是商品，外部直接克隆和未知品种均拒绝。

56 个品种按 ID 自然排序，名称如 `magua2`、`xiuhuaxie3`，不带旧目录地区信息。字段仍为 `name`、`ids`、`weight`、`properties`，仅原来有初始化的 25 项写 `"setup": 1`，其余 31 项省略。不要根据名称改成 CLOTH、BOOTS 或其他父类：`armor_type` 原槽位分别为 cloth 39、feet 7、head 6、waist 4；此类不增加洗涤、晾干或撕布能力。

驱动完成虚拟命名后，蓝图在 `virtual_start()` 设置固定属性；克隆绑定默认蓝图并独立复制可变复合属性，再按定义选择是否执行一次 `setup()`。重复初始化不刷新耐久，实例属性覆盖不改变其他物品；无需 `instance` 层。31 项原本没有 setup、没有初始耐久，因此旧版和新版均拒绝穿戴，**本次保留这一既有行为**；玩家命令的性别检查与 NPC 直接 `wear()` 仍各走原入口。缺省材质和原穿脱提示也不借本批修正。

曾柔保留原 24 项商品、顺序、售价和交易冷却，未出售的品种不补入货表；NPC 配装仅替换路径。此批是内部维护升级，不新增玩法，因此不增加玩家更新条目。任何耐久或玩法修正另立明确改动。

## 普通食物

`d/items/food.lpc` 直接继承 `ITEM + F_FOOD`，数据在 `food_data.h`，不继承装备能力。使用 `new("/d/items/food/baozi")` 创建食物，`load_object("/d/items/food/baozi")` 查询蓝图，`new(base_name(ob))` 重建完整新品。公共 `/d/items/food` 只管理品种，不能作为商品或带参克隆入口。

167 份旧定义经真实驱动比较名称、颜色、描述、实际重量、属性及 UID/EUID 后，归并为 119 个品种。例如九处相同包子共用 `baozi`；不同土豆保留 `tudou`、`tudou2`。表按 ID 自然排序，编号固定。新条目仍只使用以下字段，插入对应排序位置；先确认没有可复用品种，不再创建独立入口文件：

```c
"baozi": ([
    "name": "包子",
    "ids": ({ "baozi", "dumpling" }),
    "weight": 80,
    "properties": ({
        ({ "long", "一个香喷喷的肉包子。\n" }),
        ({ "unit", "个" }),
        ({ "value", 50 }),
        ({ "food_remaining", 3 }),
        ({ "food_supply", 20 }),
    }),
]),
```

上述示例取自现有 `baozi` 定义。固定属性放蓝图，不增加 `instance` 层。13 份原先未设置重量的食物保留实际负重 0；原材质拼写及分支不修正。`setup()` 仅执行原 ITEM 的 EUID 初始化，已逐项验证权限等价。

剩余口数、`base_value` 和临时附加效果属于独立实例。吃东西仍使用原 `eat` 命令与 `F_FOOD`：不改饱食、战斗/忙碌限制、`plant` 分支和吃完销毁。15 份兼作兵器的食物、明教变鱼骨的大白鱼、洛阳可种植花种保持原文件和行为，本表不承载特殊回调。

## 普通剑

`d/items/sword.lpc` 继承原 `SWORD`，定义集中在 `sword_data.h`。85 份旧定义按真实蓝图/实例的属性、显示、重量、动作及 UID/EUID 对照后归为 70 个品种。笛、钩、剪等原本使用 SWORD 的普通物品仍保留剑类行为，不按名称改变类型；七件有回调、额外继承或克隆自毁逻辑的特殊对象保留原实现。

```c
object sword, blueprint, second;

sword = new("/d/items/sword/changjian");
blueprint = load_object("/d/items/sword/changjian");
second = new(base_name(sword));
```

创建入口与其他类别相同，不使用 `new("/d/items/sword", id)`。短 ID 如 `changjian`、`changjian2`、`zhujian1`，编号表示稳定品种，不随排序改变；相同名称但重量、伤害、价格或描述不同的剑不强行合并，历史输入别名保留。

新增普通品种仅在表内相应自然排序位置增加数据，先确认不能复用已有品种。除 `name`、`ids`、`weight`、`properties` 外，剑增加整数 `damage` 字段，用于原 `init_sword()`；无需独立实体文件、`instance` 或空 `flags`。固定描述、材质、价值、持用/收起消息及原有特殊数值仍写在 `properties`，不复制武器基类的动作代码。

`init_sword()` 遇到克隆直接返回，因此公共程序的 `create()` 不提前初始化武器；最终虚拟蓝图在 `virtual_start()` 中先设置属性，再调用 `init_sword(damage)` 和一次 `setup()`。实例绑定该蓝图，复制可变复合默认值，再执行一次 `setup()`，保留伤害、EDGED、剑技能、默认动作、重量闪避修正和材质耐久。持用、卸下、磨损及交易继续走现有功能，不增加战斗或存储机制。

## 普通刀

`d/items/blade.lpc` 继承原 `BLADE`，数据集中在 `blade_data.h`。61 份原定义经真实驱动蓝图/实例对照，归并为 52 个品种。使用 `new("/d/items/blade/gangdao")` 创建、`load_object()` 查询同路径蓝图、`new(base_name(ob))` 重建新品。公共程序不是商品，未知 ID 或外部直接带参克隆被拒绝；旧路径不留转发文件。

短 ID 如 `gangdao2`、`qing_tianyu1`、`duan_tulong`，仅真实属性差异才分品种，稳定编号不随自然排序改变。字段沿用 `name`、`ids`、`weight`、`damage`、`properties`；三件原本 `init_blade(damage, 110)` 的品种额外保留 `"flags": 110`，其他条目省略，按零传入。不要根据标志名称猜测后丢弃其他位，也不把最终 `flag` 重复写入 `properties`。

最终虚拟蓝图先设置定义，再调用原 `init_blade(damage, flags)` 和一次 `setup()`；实例绑定蓝图、复制复合默认值并执行一次 setup。保留 EDGED 合并、刀技能、默认动作、主副手、重量修正、耐久及 Domain UID/EUID；实例覆盖不污染新品。原 `unequip_msg` 和 `unwield_msg` 各自保留，不借迁移修正历史键名。

六份特殊刀仍用原实现。屠龙刀只改普通断刀的生成路径，原对砍条件、断剑与三份书卷产物和销毁逻辑不变；另五份特殊源码原文不变。道尘原持有检查使用 `jiedao`，戒刀别名却是 `jie dao`，因此允许重复领取直到库存耗尽；这项既有行为未在本批修复。

## 普通锤类物品

`d/items/hammer.lpc` 继承原 `HAMMER`，固定数据在自然排序的 `hammer_data.h`。43 份旧定义归为 40 个品种：如 `new("/d/items/hammer/tiechui")` 创建铁锤，`load_object()` 查询同路径蓝图，`new(base_name(ob))` 重建新品。公共程序不是商品，不支持外部带参克隆或未知 ID；旧路径只存在于离线映射。

字段为 `name`、`ids`、`weight`、`damage` 和 `properties`。最终虚拟蓝图设置属性后调用原 `init_hammer(damage, flags)` 和一次 `setup()`；本批全部省略 flags，以零传入，不增加 EDGED。实例绑定默认蓝图、独立复制复合值，再执行一次 setup；重复初始化不刷新耐久。短 ID 如 `tiechui2`、`qixing_chui1`、`shuipiao`，编号不随排序变动。

按实际行为分类，而不是按名称改父类：骨头、石块、棋盘、斧、药锄、水瓢和西瓜继续使用原锤类技能与动作，不因此获得食用、演奏或装水功能。碧绿西瓜两次重量赋值最终为 20000，迁移表保存该有效值；材质、稳定性、`unequip_msg` 等旧值和键名照旧。带食用、演奏或死亡销毁逻辑的 17 份对象保持独立实现。

钱正伦的门派、配额、个人计数和领取后的价格/禁售覆盖不变；武馆仍使用原工具别名、工作和归还条件；冯铁匠及王方平的货表、售价和交易冷却不变。黑白子、范松仅替换普通备用兵器路径，独特兵器规则保持原样。本批不新增玩家玩法。

## 普通杖类物品

`d/items/staff.lpc` 直接继承原 `STAFF`，`staff_data.h` 按 ID 自然排序。37 份旧定义经蓝图、克隆的全部有效属性和显示核对后归为 32 个品种；例如 `new("/d/items/staff/chanzhang")`、`load_object("/d/items/staff/shouzhang")`、`new(base_name(ob))`。短 ID 如 `zhubang2`、`qixing_zhang1` 表示稳定品种，不带旧目录信息；相同名称但重量、伤害、材质或描述不同的物品不合并。

字段为 `name`、`ids`、`weight`、`damage` 和 `properties`，固定描述及持用消息留在蓝图。最终虚拟蓝图调用原 `init_staff(damage, flags)`，其自动附加 `LONG` 长兵器标志；本批省略 flags，不等于有效标志为零，也不另加 EDGED。实例绑定该蓝图、隔离复合属性并执行一次 setup；未知 ID、外部直接带参克隆和重复初始化规则与其他类别一致。

火枪、铁鞭、柴禾、吹火管仍保留原杖类行为，不按名称添加射击、鞭法、点火或吸烟能力。原材质、少林标记和数值照旧。两种化蛇杖、三处可燃树枝、烟筒、死亡销毁杖及伏魔杖共 8 份特殊对象保留原文件。

钱正伦、道尘的资格、配额、库存、原持有检查及实例覆盖不变；副将五种兵器的选择分支和技能不变。南希仁仍只携带扁担，不额外持用。商店沿用原货表顺序和交易方法，房间沿用原陈设及刷新，不增加玩家玩法。部署前仍须预览备份，按需转换旧身份后配套冷启动，不仅是替换源码。

## 普通鞭类物品

`d/items/whip.lpc` 直接继承原 `WHIP`，固定数据在自然排序的 `whip_data.h`。32 份旧定义按完整蓝图/克隆观测归并为 25 个品种；例如 `new("/d/items/whip/shebian")` 创建蛇鞭，`load_object("/d/items/whip/fuchen2")` 查询拂尘蓝图，`new(base_name(ob))` 重建同品种。公共程序不是商品，未知 ID 和外部直接带参克隆均拒绝。

短 ID 如 `fuchen2`、`changbian2`、`shenjiao_si1` 使用稳定品种编号，不拼接旧地区。六份相同拂尘、三份相同长鞭分别共用品种；重量或伤害不同的三种拂尘、两种长鞭仍分开。字段沿用 `name`、`ids`、`weight`、`damage`、`properties`，不增加实例数据层。

最终虚拟蓝图设置属性后调用原 `init_whip(damage, flags)` 及一次 setup；本批 flags 省略，以零传入，**不附加 STAFF 的 LONG 或剑刀的 EDGED**。克隆绑定蓝图、隔离复合默认值并执行一次 setup；重复初始化不刷新耐久。流星锤、钓杆仍为 WHIP，原“馄饨灵索”名称、九节鞭 `material="steal"`、黑索 `no_sell/stable` 和钓杆 `rigidity` 保持，不借迁移修改旧数据。

王方平十一件商品、两处房间和十三处普通 NPC 携物语句只改物品路径；李莫愁仍只携带拂尘、不持用。钱正伦、道尘和副将的原资格、库存、选择及实例覆盖不变；三渡仅在各自独特黑索被占用时改用规范普通长鞭，独特物品规则不变。洛阳赤金鞭死亡销毁回调留在原文件。此批不新增玩法，部署仍须预览备份并按需转换旧记录后配套冷启动。

## 普通短兵器

`d/items/dagger.lpc` 直接继承原 `DAGGER`，固定数据位于自然排序的 `dagger_data.h`。23 份来源按完整蓝图/克隆观测归为 22 个品种：`new("/d/items/dagger/bishou2")` 创建普通匕首，`load_object("/d/items/dagger/panguanbi")` 查询判官笔蓝图。同品种实例共用蓝图，但可变复合属性独立；未知 ID 拒绝创建。

最终蓝图调用原 `init_dagger(damage, flags)`，本批省略的 flags 以零传入，父类添加 `EDGED | SECONDARY`（有效值 6）。原主副手切换、加成、耐久和动作保持；扇、笔、箫不按名称改成其他类别或新增能力。两份同属性普通匕首共用 `bishou2`，伤害不同的 `bishou`、`bishou3` 分开；材质、别名、单位和刚性照旧。

刘素素七种扇及王方平三件商品保留原交易规则；刘素素自身团扇只登记 `handing`，盈盈仅在独特鱼肠剑被持有时取得普通月牙匕。书室陈设数量、钱正伦资格及额度不变。赤金匕首独有死亡销毁行为留在原文件。三处纯文案纠错分别为“看起来”“团扇”“放回”，冻结原文不改写，测试仅对对应字段应用精确例外。

旧短兵器路径只保留在离线映射及测试中，不提供运行期别名。部署前预览明确备份；如有旧记录，按下述统一流程转换并与代码配套冷启动。

## 普通饮具

`d/items/liquid.lpc` 继承原 `ITEM + F_LIQUID`，数据在 `liquid_data.h`，包含茶、水、酒、汤及其饮具，不按显示名称改变原类型。74 份旧定义经真实驱动核对后归为 54 个品种，保留原别名、描述、容量、初始余量、效果字段和 UID/EUID。玉蜂蜜的解毒回调留在 `d/gumu/obj/fengmi.c`，不纳入普通表。

```c
object drink, blueprint, fresh;

drink = new("/d/items/liquid/qingshui_hulu");
blueprint = load_object("/d/items/liquid/qingshui_hulu");
fresh = new(base_name(drink));
```

使用短且稳定的 ID，例如 `jiudai2`、`suanmei_tang`；新增前检查已有等价品种，再按自然排序插入。数据沿用 `name`、`ids`、`weight`、`properties`，初始 `liquid` mapping 也放在 `properties`。仅原本调用 ITEM `setup()` 的四种饮具带 `"setup": 1`，其他条目省略；这不是可配置回调，不增加 `instance` 层或按旧目录命名的入口。

固定属性由品种蓝图提供。每次创建时，初始 `liquid` 从独立的定义副本设置到对象自身，而不是借用蓝图当前已消耗或装水后的液体；原有 `liquid_type` 同样按定义设置。`query("liquid")` 返回当前对象的可变 mapping，使原 `fill` 直接修改生效。附加毒效继续由 `F_LIQUID` 按对象保存，不复制到其他或后续新建实例。重复 `virtual_start()` 不刷新余量，`new(base_name(ob))` 则是完整新品，不是已饮用状态的复制品。

饮用、装水和下毒仍使用原 `drink/fill/pour`。保留初始余量超过容量、酒水类型及 `drunk_apply/drunk_supply/supply` 的旧值与拼写；末口先触发效果再清除、不再叠加醉酒，`fill` 也不借本次迁移改变原效果清除行为。宴席调用方仍可覆盖杯名、描述及液体名称，不影响其他杯子。公共 `/d/items/liquid` 不是商品入口，未知品种及外部直接带参构造均拒绝。

## 存储边界

背包入口识别十五张表已登记的精确虚拟路径，但这不等于存放资格。FOOD、LIQUID 继续给出原“食物饮水存背包里会变质”的提示并拒存，`store all` 也排除食物和饮具。其余十三类（含直接 EQUIP、HAMMER、STAFF、WHIP 和 DAGGER）的穿戴/持用中、临时状态、`no_put/no_store`、独特物品、装有其他物品等拒存条件不变。不会无条件接纳虚拟对象或所有 `.lpc` 文件。存取沿用旧物品重建行为，不新增磨损或附魔状态快照，也不借迁移修订原存储规则。

普通 CLOTH 未开启自动加载。旧乾坤袋的 `store/take` 命令本来已禁用，本次不重新启用；只为管理员确认需要保留的历史袋记录提供离线转换。

| 持久记录 | 仅转换的字段 |
| --- | --- |
| `data/user/<首字母>/<账号>.o` | `my_depot/itemN/file` |
| `data/shop/<店铺>.o` | `dbase/vendor_goods` 与 `dbase/vendor_goods_num` 的路径键 |
| `data/dbased.o` 中明确选定的旧袋对象 | `save_dbase/<对象路径>/itemN/file` |
| `data/npc/meng-zhu.o` | `dbase/weapon`、`dbase/armor` |

背包和旧袋逐条保留名称、别名、数量及其他字段，不因规范身份相同而吞并带不同状态的记录。同店同品同价库存合计数量，单价、库存总数、余额及其他玩家文本不变；价格冲突明确失败，不覆盖任一价格。采购中的 `pending` 是临时状态，通过维护重启结束，不增加存档格式。排行榜 SQLite 缓存不保存这些物品字段，不在转换范围。

## 离线转换与部署

工具：`tools/migrate_item_records.mjs`，已取代旧 `migrate_cloth_records.mjs`，不保留旧命令壳。`tools/tests/cloth/baseline.json` 保留源码基线 `ed10c535` 的 202 份原定义、哈希与第一版路径；`boots/baseline.json` 保存 `09e371bb` 的 19 份鞋靴，`headwear/baseline.json` 保存 `b081c7ff` 的 39 份头饰。原始快照和旧报告不改写，当前规范 ID 由离线元数据映射。

此前对 192 个已迁移品种审查后精简 79 个 ID（CLOTH 57、BOOTS 3、HEAD 19），其余 113 个保持。完整对应表为 `tools/tests/item_id_renames.json`，只用于离线迁移与测试，不是运行期别名。`hands/baseline.json` 另保留 `0265d361` 的 28 份原手部装备及哈希，`neck/baseline.json` 保留 `57f106f8` 的 15 份颈饰及哈希。`wrists/baseline.json` 保留 `61abfde3` 的 6 份护腕及哈希，`food/baseline.json` 保留 `1c35e24c` 的 167 份食物原文、哈希、实际属性及规范身份。`sword/baseline.json` 保留 `3c572f18` 的 85 份普通剑、134 处静态引用、动态线索、特殊对象哈希及真实驱动属性。`liquid/baseline.json` 保存 `719a96ec` 的 74 份普通饮具、99 处引用、setup 差异、玉蜂蜜哈希和真实驱动观测。`blade/baseline.json` 保存 `b5e94cd0` 的 61 份普通刀、102 处静态引用、三处动态调用、六份特殊对象哈希及真实驱动观测。`equip/baseline.json` 保存 `beef12ea` 的 56 份直接 EQUIP 防具、64 处引用、setup 选择及真实驱动观测。`hammer/baseline.json` 保存 `95537906` 的 43 份锤类原文、55 处静态引用、钱正伦动态分支、17 份排除对象 hash 和真实驱动观测。`staff/baseline.json` 保存 `32f587a5` 的 37 份杖类原文、49 处静态引用、三个动态入口、8 份排除对象 hash 及真实驱动观测。`whip/baseline.json` 保存 `da702704` 的 32 份鞭类原文、29 处静态引用、三个动态入口、赤金鞭 hash 及真实驱动观测。`dagger/baseline.json` 保存 `6ad10eee` 的 23 份短兵器原文、25 处静态引用、钱正伦动态入口、赤金匕首 hash 及真实驱动观测。一次转换覆盖 **1,168 条历史路径**（CLOTH 461、BOOTS 22、HEAD 58、HANDS 28、NECK 15、WRISTS 6、FOOD 167、SWORD 85、LIQUID 74、BLADE 61、EQUIP 56、HAMMER 43、STAFF 37、WHIP 32、DAGGER 23），全部直接到达最终路径，不需逐版本转换；未选特殊物品不转换。游戏只读十五张品种表，共 **696 个品种**，不读取历史映射。

食物和饮具通常不能存入背包，但不据此假定历史存档没有引用。记录转换保留原字段、状态和数量，不赋予存放资格，也不补录原来没有保存的液体余量或毒效；新建满液体不代表恢复了旧实例。先预览显式备份，受影响才转换；不能仅拉取新代码便认定无需迁移。转换器会按选定批次的请求大小配置临时驱动的 JSON 解析容量，不修改正式服配置。

即使之前已完成服装或鞋靴迁移，也需要重新预览停服备份：记录里可能保存改名前的规范 ID。只更新代码而不转换受影响记录会导致这些物品无法加载。没有受影响记录时，无须执行转换。

工具不加载玩家对象、不连接正式游戏，不猜测正式 `data/`。管理员必须给出备份根目录或清单；当前游戏使用未压缩 UTF-8 存档，其他格式须先在备份副本中按相应流程还原。

1. 安排维护，正常保存并停止游戏，备份代码与相关存档。不要用 `updateall` 代替切换：内存中的旧实例、临时订单和默认对象也需要重建。
2. 备份根目录直接包含 `user/` 与 `shop/`，并在原服存在盟主存档时一并备份 `npc/meng-zhu.o`。推荐通过 `--backup-root` 自动发现两目录内全部普通 `.o` 文件，并纳入存在的这份盟主存档；不遍历其他 NPC 文件、不跟随链接。缺少 user/shop 目录、不可读或链接导致范围不完整时失败；盟主文件可不存在，但工具不能判断是否漏备，需维护者核对备份范围。也可先保存清单以人工审阅，无需枚举账号：

```powershell
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items --write-manifest C:/mud-backup/items/manifest.json
```

`--write-manifest` 仅枚举路径，不读取存档正文或启动驱动；不能同时指定 `--driver`/`--output`，且不覆盖已有清单。清单放备份根目录，路径相对此目录并使用 `/`。仍可手工提供原有格式的部分清单，没有目标字段的记录保持原样：

```json
{
  "files": [
    { "file": "user/t/tester.o", "kind": "backpack" },
    { "file": "shop/test_shop.o", "kind": "shop" }
  ]
}
```

若需要保留旧袋记录，另加 `kind: "legacy_bags"` 的 `dbased.o` 条目及 `bag_objects` 数组。管理员必须先确认这些对象确实使用 `clone/misc/depot_ob.h` 的记录结构；不能把所有 dbased 条目当作袋子处理。未选对象不变，所选对象不存在或结构异常则失败。

手工清单若含盟主备份，增加 `{ "file": "npc/meng-zhu.o", "kind": "mengzhu_equipment" }`。该类型只接受这一个精确文件，仅转换已登记旧路径的 `dbase/weapon`、`dbase/armor`，不修改姓名、武功、经验或其他字段；空值及未迁移的特殊装备保持原样。盟主恢复时会直接加载这两个装备路径，不能只改 NPC 默认配装而漏掉旧存档。本工具不扫描或修改正式文件，也不提供运行期旧路径别名。

3. 先预览，再输出转换副本。`--output` 的父目录必须存在，目标目录必须全新且不在输入目录内；输入永不覆盖。

```powershell
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items
node tools/migrate_item_records.mjs --backup-root C:/mud-backup/items --output C:/mud-backup/items-converted
# 手工清单与 --backup-root 互斥；仅检查所列文件，不表示全备份覆盖。
node tools/migrate_item_records.mjs --manifest C:/mud-backup/items/manifest.json
```

Linux 或其他驱动位置使用 `--driver <driver路径>`。未指定 `--output` 仅预览；指定后产生原字节 `backup/`、新文件 `converted/`、清单和包含前后 SHA-256 的 `report.json`。只有完整成功报告的输出才可部署。

报告包含 `input_mode`、`input`、`coverage`、`checked_files`、`affected_files` 和总 `changes`；逐文件保留变更数与哈希。`no_changes_in_checked_scope` 只说明已检查范围没有需要转换的路径；`empty_scope` 明确表示没有记录，不能声称全服无影响。`paths_only` 仅表示生成清单，尚未检查内容。副本只在全部成功后发布；I/O 失败留下的 `.item-migration-*` 暂存目录不能用于上线。

支持原实体路径、第一版虚拟路径、改名前规范路径和当前规范路径混合输入，旧路径直接转到最终规范路径。商店同品同价合并数量；价格冲突或无法安全合计库存时，报告原因和清单文件，整批不发布输出。管理员先在备份副本上核对冲突并明确价格，再重新预览，不由脚本选取任一价格。报告中的 `changes` 是迁移的路径字段/映射键数，不是物品件数；合并后的品种键数减少属正常，仍须核对总件数。

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
node tools/tests/test_cloth_objects.mjs bin/driver.exe --village-startup
node tools/tests/test_cloth_objects.mjs bin/driver.exe --bench
node tools/tests/boots_inventory.mjs
node tools/tests/audit_boots_migration.mjs
node tools/tests/compile_boots_callers.mjs bin/lpcc.exe
node tools/tests/test_boots_objects.mjs bin/driver.exe --all
node tools/tests/test_boots_objects.mjs bin/driver.exe --bench
node tools/tests/headwear_inventory.mjs
node tools/tests/audit_headwear_migration.mjs
node tools/tests/compile_headwear_callers.mjs bin/lpcc.exe
node tools/tests/test_headwear_objects.mjs bin/driver.exe --all
node tools/tests/test_headwear_objects.mjs bin/driver.exe --bench
node tools/tests/hands_inventory.mjs
node tools/tests/audit_hands_migration.mjs
node tools/tests/compile_hands_callers.mjs bin/lpcc.exe
node tools/tests/test_hands_objects.mjs bin/driver.exe --all
node tools/tests/test_hands_objects.mjs bin/driver.exe --bench
node tools/tests/neck_inventory.mjs
node tools/tests/audit_neck_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --neck
node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --neck --bench
node tools/tests/wrists_inventory.mjs
node tools/tests/audit_wrists_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --wrists
node tools/tests/test_cloth_objects.mjs bin/driver.exe --wrists --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --wrists --bench
node --test tools/tests/test_item_records.mjs
node --test tools/tests/test_item_ids.mjs
node --test tools/tests/test_item_references.mjs
node tools/tests/food_inventory.mjs
node tools/tests/audit_food_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --food
node tools/tests/test_cloth_objects.mjs bin/driver.exe --food --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --food --bench
node tools/tests/sword_inventory.mjs
node tools/tests/liquid_inventory.mjs
node tools/tests/audit_liquid_migration.mjs
node --test tools/tests/test_liquid_inventory.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --liquid
node tools/tests/test_cloth_objects.mjs bin/driver.exe --liquid --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --liquid --bench
node tools/tests/audit_sword_migration.mjs
node --test tools/tests/test_sword_inventory.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --sword
node tools/tests/test_cloth_objects.mjs bin/driver.exe --sword --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --sword --bench
node tools/tests/blade_inventory.mjs
node tools/tests/audit_blade_migration.mjs
node --test tools/tests/test_blade_inventory.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --blade
node tools/tests/test_cloth_objects.mjs bin/driver.exe --blade --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --blade --bench
node tools/tests/equip_inventory.mjs
node tools/tests/audit_equip_migration.mjs
node --test tools/tests/test_equip_inventory.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --equip
node tools/tests/test_cloth_objects.mjs bin/driver.exe --equip --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --equip --bench
node tools/tests/hammer_inventory.mjs
node tools/tests/audit_hammer_migration.mjs
node --test tools/tests/test_hammer_inventory.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --hammer
node tools/tests/test_cloth_objects.mjs bin/driver.exe --hammer --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --hammer --bench
```

需 Node.js、本地 FluffOS 源码、驱动及 `ed10c535`、`09e371bb`、`b081c7ff`、`0265d361`、`57f106f8`、`61abfde3`、`1c35e24c`、`3c572f18`、`719a96ec` 的 Git 历史。基线审计逐个核对旧源码；调用审计按已批准的各批迁移逐层核对，保留历史基线，再比较允许的路径替换及格式化。批量编译工具需要支持 `--batch` 的本地 lpcc，在临时源码副本中重命名 `create`，编译其函数体但不自动执行，并禁止 LPC 写入与外部 socket；这不是正式服启动测试，也不提高游戏本身的最低驱动要求。

独立驱动回归另用未改构造函数的 202 份原始旧定义与 148 个规范品种逐一对照。历史输入别名须可用；统一主输入名导致的括号内 ID 改变单独核对，不要求别名数组完全相等。显示辅助、测试角色和店主在线状态使用夹具，装备、移动、货币、交易、房间刷新、存取及序列化使用实际代码。交易用例分批跨时钟执行，让原有清理回调正常运行，不提高驱动回调上限。

引用扫描同时覆盖带 `/` 的绝对路径、不带 `/` 的根路径、相对路径、宏和常量拼接；动态前缀只报告线索，不自动替换。`--village-startup` 不复制已删除的历史布衣源码：先复现旧引用的失败，再执行杂货店与李四当前的 `create()`，检查装备和房间补刷。仅无关的 NPC 技能与心跳依赖使用夹具，携物、移动和穿戴使用实际代码；不能以只编译函数体代替创建链路验收。

`--bench` 每轮新启驱动，对照相同的 202 份历史来源请求和 4,040 实例；旧版实际为 202 个蓝图，新版为 148 个规范蓝图。旧/新顺序交替，共三轮。`memory_info()` 是驱动估算，不是 OS RSS。数据化减少源码重复和冷加载开销，但虚拟创建与实例状态隔离有成本；不能推断批量创建更快或实例更省内存。归并前后结果分别记录，不把旧报告冒充当前结果。

剑类使用 `--sword --bench`，同条件为 85 个历史来源请求、每来源 20 次创建（共 1,700 实例）；新版共 70 个虚拟品种。当前测量与实施证据见 [SWORD 验证报告](../../openspec/changes/refactor-data-driven-swords/validation.md)。该报告不代表已转换正式存档或完成线上部署。

饮具使用 `--liquid --bench`，同条件为 74 个历史来源请求、每来源 20 次创建（共 1,480 实例）；新版共 54 个虚拟品种。逐定义对照及真实命令/消费者回归使用 `--liquid --all`，证据与边界见 [LIQUID 验证报告](../../openspec/changes/refactor-data-driven-liquids/validation.md)。测试中的原 `setup()` 次数只在临时副本内计数，不给运行期程序增加统计代码。

刀类使用 `--blade --all` 验证全部定义、装备、交易、存取、供应、屠龙刀对砍和盟主备份恢复；`--blade --bench` 对照 61 个来源请求、1,220 个实例。基线提交为 `b5e94cd0`，旧刀源码仅恢复到临时测试副本。实际结果与测量边界见 [BLADE 验证报告](../../openspec/changes/refactor-data-driven-blades/validation.md)。

直接防具使用 `--equip --all` 对照全部 56 份定义及穿脱、交易、存取和盟主恢复；`--equip --bench` 独立对照 56 个来源、1,120 个实例，三轮旧新交替。此批还需 Git 历史 `beef12ea`。曾柔采用实际构造函数、货表和交易方法；其余 NPC 在隔离角色上按原顺序执行 40 条实际配装语句及原性别/初始加成，不代表无关任务或战斗完整验收。旧鞋靴夹具只在临时副本恢复冻结源码，现行能力检查改用 `/d/items/equip/xiuhuaxie`，仍断言无洗涤/撕布；旧审计按批次逐层核对调用，不改写历史快照。结果见 [EQUIP 验证报告](../../openspec/changes/refactor-data-driven-equipment/validation.md)。

锤类使用 `--hammer --all` 对照全部 43 个来源及持用、交易、存取、实际消费者和盟主恢复；`--hammer --bench` 对照 43 个来源、860 个实例，三轮旧新交替。需 Git 历史 `95537906`。房间测试按原顺序执行实际陈设语句（保留后续覆盖），再调用原 ROOM 刷新；商店使用实际构造函数与 F_DEALER。武馆实际领取/作业/归还方法在可见测试角色上运行，随机数固定；独特兵器本体及命令派发使用测试替身，不声称完整战斗或独特兵器系统验收。实际结果见 [HAMMER 验证报告](../../openspec/changes/refactor-data-driven-hammers/validation.md)。

杖类回归复用相同入口：

```sh
node --test tools/tests/test_staff_inventory.mjs
node tools/tests/audit_staff_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --staff
node tools/tests/test_cloth_objects.mjs bin/driver.exe --staff --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --staff --bench
```

需要 Git 历史 `32f587a5`。功能测试覆盖 37 个来源、三个动态入口、九个商店、五处房间及 27 处携带/持用语句；商店与房间按原语句顺序在隔离角色上执行，复用实际 F_DEALER/ROOM 方法，其他 NPC 基础设施由测试替身隔离，不代表完整战斗和任务系统验收。性能在其余测试结束后单独运行，按同样来源各创建 20 次，共 740 实例，三组新旧交替；不启动正式服、不读取正式存档。实际结果见 [STAFF 验证报告](../../openspec/changes/refactor-data-driven-staves/validation.md)。

鞭类回归复用相同入口：

```sh
node --test tools/tests/test_whip_inventory.mjs
node tools/tests/audit_whip_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --whip
node tools/tests/test_cloth_objects.mjs bin/driver.exe --whip --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --whip --bench
```

需要 Git 历史 `da702704`。功能回归覆盖全部 32 个来源、实际装备与存取、王方平十一件商品、两处房间、十三处携物语句、三个动态入口及三渡的两条武器获取分支。三渡只执行原武器获取代码，独特黑索本体和无关 NPC 基础设施使用临时替身，不代表完整战斗或独特装备验收。旧类别所需历史长鞭/货表源码仅恢复到临时副本，不修改旧快照或恢复运行期旧入口。性能按 32 个来源各创建 20 次，共 640 实例，三组独立驱动新旧交替。实际结果见 [WHIP 验证报告](../../openspec/changes/refactor-data-driven-whips/validation.md)。

短兵器回归复用相同入口：

```sh
node --test tools/tests/test_dagger_inventory.mjs
node tools/tests/audit_dagger_migration.mjs
node tools/tests/compile_cloth_callers.mjs bin/lpcc.exe --dagger
node tools/tests/test_cloth_objects.mjs bin/driver.exe --dagger --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --dagger --bench
```

需要 Git 历史 `6ad10eee`。覆盖 23 个来源、主副手切换及加成、十件商品、书室陈设、普通 NPC 配装、盈盈两条武器获取分支、钱正伦领取及背包/盟主恢复。无关 NPC 基础设施和盈盈独特鱼肠剑本体使用隔离替身，不代表完整战斗或独特兵器验收。旧类别的历史短兵器依赖仅恢复到临时副本，不修改旧快照。性能按 23 个来源各创建 20 次（460 实例），三组独立驱动新旧交替；结果与已知旧行为见 [DAGGER 验证报告](../../openspec/changes/refactor-data-driven-daggers/validation.md)。
