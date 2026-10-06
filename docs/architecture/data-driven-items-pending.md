# 已迁移分类的剩余物品清单

## 范围与口径

核对日期：2026-10-06。以普通棍类批次实施后的当前源码为准。用户已反馈本批 `updateall /` 全量编译成功，共 **10,061** 个档案，比上一批暗器的 10,078 个减少 17。本页是开发维护台账，不是玩家物品图鉴，也不表示这些旧物品功能失效。

覆盖已建立 `d/items/*_data.h` 的 **17 个分类**，按真实继承/行为而非显示名称归类。扫描 Git 跟踪且仍存在的游戏 `.c/.lpc`，核对分类宏、静态继承、构造函数、回调及相关头文件；排除共享基类、已迁移 provider、测试和子模块，不读取玩家存档。此为源码清单，不是线上持有量或动态调用覆盖报告。

目前共有 **259 个不同实体源码文件**：

- **/d 内 63 个**：原普通物品批次保留的特殊行为或初始化差异，下文逐项记录原因。
- **其他目录 196 个**：`clone/` 184、`b/` 10、`kungfu/` 2，未纳入此前以 /d 为主的普通物品批次；其中既有特殊物品，也有后续可评估的初始化候选，不能统称为“因特殊功能无法迁移”。
- 其中 16 个物品同时属于 FOOD 和 HAMMER（/d 内 15 个、clone 内 1 个），两类表均列出，**分类合计 275 项，去重文件数 259**。

“初始化候选”只表示当前文件仅见构造初始化、尚未完成迁移评估，不承诺与现有品种等价；还需检查调用者、属性覆盖、持久记录及跨目录 UID/EUID。特殊物品也不是永久禁止数据化，但不得为塞入普通数据表丢掉玩法或放开克隆限制。

## 分类汇总

| 分类 | /d 内保留 | 其他目录待评估 | 分类合计 |
| --- | ---: | ---: | ---: |
| 服装 `CLOTH` | 4 | 46 | 50 |
| 鞋靴 `BOOTS` | 3 | 8 | 11 |
| 头饰 `HEAD` | 2 | 16 | 18 |
| 手部装备 `HANDS` | 3 | 3 | 6 |
| 颈饰 `NECK` | 0 | 0 | 0 |
| 护腕 `WRISTS` | 1 | 0 | 1 |
| 食物 `FOOD` | 17 | 10 | 27 |
| 饮具 `LIQUID` | 1 | 5 | 6 |
| 剑 `SWORD` | 7 | 34 | 41 |
| 刀 `BLADE` | 6 | 17 | 23 |
| 直接防具 `EQUIP` | 0 | 1 | 1 |
| 锤类 `HAMMER` | 17 | 9 | 26 |
| 杖类 `STAFF` | 8 | 12 | 20 |
| 鞭类 `WHIP` | 1 | 13 | 14 |
| 短兵器 `DAGGER` | 1 | 4 | 5 |
| 暗器 `THROWING` | 6 | 12 | 18 |
| 棍类 `CLUB` | 1 | 7 | 8 |

## 后续维护要求

当前只优先推进 `/d` 的其他普通物品分类，`/clone` 暂不处理；其他目录清单是资料，不是当前实施范围。`/d` 的历史重复往往涉及同物多处定义，而 `/clone` 已集中提供公共物品，重复初始化代码不等于物品本身等价。

每一批物品迁移在同一变更中更新本页，不只在临时分析或归档提案中写“排除若干件”：

1. 按分类登记每个保留物品的名称、完整源码路径、关键行为/回调、暂缓原因；包含头文件注入的功能。区分特殊行为、初始化差异和未纳入范围。
2. 核对创建/领取/商店/任务引用与存档身份；功能和数据按旧行为保持，不为消除冗余改玩法。食物、饮具仍遵守现有拒存及剩余次数规则。
3. 同步数量、交叉分类和路径。已迁移条目移出当前待办，在批次验证记录或离线映射中保留旧路径→新身份及验证依据；删除、改名和确认不属于此分类的条目同样说明去向。
4. 原始源码快照、历史报告与已冻结映射不为更新台账而重写。新加入的分类也须登记所有未选物品；没有剩余项则明确写 0。
5. 后续优先从可复用的初始化候选或已有明确行为分组入手；特殊玩法单独制定验证范围，不添加通用回调框架来掩盖行为差异。

下表名称省略 ANSI 颜色，保留源码用字；同名不同路径不表示属性相同。源码链接可直接定位，完整数值和条件以链接源码为准，不在台账复制另一份属性表。

## 服装（CLOTH）

### /d 内保留（4）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 金丝甲 | [d/city/npc/obj/jinsijia.c](../../d/city/npc/obj/jinsijia.c) | `query_autoload()` 自动携带；`owner_is_killed()` 销毁。普通 CLOTH 表不承载这两个生命周期回调。 |
| 金环锁子甲 | [d/luoyang/npc/obj/armor1.c](../../d/luoyang/npc/obj/armor1.c) | `owner_is_killed()` 销毁；须保留持有者死亡后的处理。 |
| 金刚罩 | [d/shaolin/obj/jingang-zhao.c](../../d/shaolin/obj/jingang-zhao.c) | 额外继承 `F_NOCLONE`，创建末尾 `check_clone()`；不能改成可任意新建的普通服装。 |
| 孔雀羽衣 | [d/wanjiegu/npc/obj/feature.c](../../d/wanjiegu/npc/obj/feature.c) | `query_autoload()` 自动携带；实例设置禁拿/禁丢，须核对恢复及绑定行为。 |

### 其他目录待评估（46）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 波斯明教教服 | [b/tulong/npc/obj/bosi.c](../../b/tulong/npc/obj/bosi.c) | 初始化候选。 |
| 天鹰教服 | [b/tulong/npc/obj/jiaofu.c](../../b/tulong/npc/obj/jiaofu.c) | 初始化候选。 |
| 「葵花宝典」 | [clone/book/kuihua.c](../../clone/book/kuihua.c) | 克隆自毁；`init/do_du` 提供辟邪剑法研读及消耗/风险，保留书与衣物的复合身份。 |
| 血棋衣 | [clone/book/zhanyi.c](../../clone/book/zhanyi.c) | 以 CLOTH 承载 `skill` 指法学习数据；需验证阅读链，而不只核对防御。 |
| 白袍 | [clone/cloth/baipao.c](../../clone/cloth/baipao.c) | 初始化候选。 |
| 青布袍 | [clone/cloth/bupao.c](../../clone/cloth/bupao.c) | 初始化候选。 |
| 青色袈裟 | [clone/cloth/c-jiasha.c](../../clone/cloth/c-jiasha.c) | 初始化候选。 |
| 波斯长袍 | [clone/cloth/changpao.c](../../clone/cloth/changpao.c) | 初始化候选。 |
| 布衣 | [clone/cloth/cloth.c](../../clone/cloth/cloth.c) | 初始化候选。 |
| 棉衣 | [clone/cloth/cuttonp.c](../../clone/cloth/cuttonp.c) | `wear_msg` 使用 `do_wear` 闭包，按角色生成穿戴文案；`query_autoload()` 自动携带。 |
| 青色道袍 | [clone/cloth/dao-cloth.c](../../clone/cloth/dao-cloth.c) | 初始化候选。 |
| 花格道袍 | [clone/cloth/daogu-cloth.c](../../clone/cloth/daogu-cloth.c) | 初始化候选。 |
| 粉红绸衫 | [clone/cloth/female1-cloth.c](../../clone/cloth/female1-cloth.c) | 初始化候选。 |
| 白绸衫 | [clone/cloth/female2-cloth.c](../../clone/cloth/female2-cloth.c) | 初始化候选。 |
| 湖绿长裙 | [clone/cloth/female3-cloth.c](../../clone/cloth/female3-cloth.c) | 初始化候选。 |
| 鹅黄夹袄 | [clone/cloth/female4-cloth.c](../../clone/cloth/female4-cloth.c) | 初始化候选。 |
| 青衫小袖 | [clone/cloth/female5-cloth.c](../../clone/cloth/female5-cloth.c) | 初始化候选。 |
| 天青小袂 | [clone/cloth/female6-cloth.c](../../clone/cloth/female6-cloth.c) | 初始化候选。 |
| 散花衣 | [clone/cloth/female7-cloth.c](../../clone/cloth/female7-cloth.c) | 初始化候选。 |
| 紫纱小夹衫 | [clone/cloth/female8-cloth.c](../../clone/cloth/female8-cloth.c) | 初始化候选。 |
| 锦缎 | [clone/cloth/jinduan.c](../../clone/cloth/jinduan.c) | 初始化候选。 |
| 军服 | [clone/cloth/junfu.c](../../clone/cloth/junfu.c) | 初始化候选。 |
| 布衣 | [clone/cloth/male1-cloth.c](../../clone/cloth/male1-cloth.c) | 初始化候选。 |
| 青衫 | [clone/cloth/male2-cloth.c](../../clone/cloth/male2-cloth.c) | 初始化候选。 |
| 黑色劲装 | [clone/cloth/male3-cloth.c](../../clone/cloth/male3-cloth.c) | 初始化候选。 |
| 短打劲装 | [clone/cloth/male4-cloth.c](../../clone/cloth/male4-cloth.c) | 初始化候选。 |
| 紫蟒袍 | [clone/cloth/male5-cloth.c](../../clone/cloth/male5-cloth.c) | 初始化候选。 |
| 蓝马褂 | [clone/cloth/male6-cloth.c](../../clone/cloth/male6-cloth.c) | 初始化候选。 |
| 明黄锦袍 | [clone/cloth/male7-cloth.c](../../clone/cloth/male7-cloth.c) | 初始化候选。 |
| 天蓝长袍 | [clone/cloth/male8-cloth.c](../../clone/cloth/male8-cloth.c) | 初始化候选。 |
| 青布缁衣 | [clone/cloth/ni-cloth.c](../../clone/cloth/ni-cloth.c) | 初始化候选。 |
| 灰布袈裟 | [clone/cloth/seng-cloth.c](../../clone/cloth/seng-cloth.c) | 初始化候选。 |
| 铁甲 | [clone/cloth/tiejia.c](../../clone/cloth/tiejia.c) | 初始化候选。 |
| 维吾尔族长袍 | [clone/cloth/wcloth.c](../../clone/cloth/wcloth.c) | 初始化候选。 |
| 黄色袈裟 | [clone/cloth/y-jiasha.c](../../clone/cloth/y-jiasha.c) | 初始化候选。 |
| 银铠甲 | [clone/cloth/yinjia.c](../../clone/cloth/yinjia.c) | 初始化候选。 |
| 云裳 | [clone/cloth/yunshang.c](../../clone/cloth/yunshang.c) | 初始化候选。 |
| 袈裟 | [clone/lonely/book/kuihua1.c](../../clone/lonely/book/kuihua1.c) | 克隆自毁；`init/do_du/do_yanjiu` 研读与研究。 |
| 袈裟 | [clone/lonely/book/kuihua2.c](../../clone/lonely/book/kuihua2.c) | 克隆自毁；`init/do_du/do_yanjiu` 研读与研究。 |
| 袈裟 | [clone/lonely/book/kuihua3.c](../../clone/lonely/book/kuihua3.c) | 克隆自毁；`init/do_du/do_yanjiu` 研读与研究。 |
| 飞驼金甲 | [clone/lonely/feituo.c](../../clone/lonely/feituo.c) | `F_NOCLONE/check_clone`。 |
| 锦襕袈裟 | [clone/lonely/jinlan.c](../../clone/lonely/jinlan.c) | 克隆自毁。 |
| 软猬甲 | [clone/lonely/ruanwei.c](../../clone/lonely/ruanwei.c) | 克隆自毁；`valid_damage` 受击处理。 |
| 布衣 | [clone/misc/cloth.c](../../clone/misc/cloth.c) | 初始化候选。 |
| 铁甲 | [clone/weapon/tiejia.c](../../clone/weapon/tiejia.c) | 初始化候选。 |
| 红色长袍 | [kungfu/class/riyue/dongfang/changpao.c](../../kungfu/class/riyue/dongfang/changpao.c) | 初始化候选。 |

## 鞋靴（BOOTS）

### /d 内保留（3）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 麻鞋 | [d/lanzhou/npc/obj/shoes.c](../../d/lanzhou/npc/obj/shoes.c) | 旧 `create()` 不调用 `setup()`；不能套用当前 BOOTS 表必做 setup 的初始化。 |
| 麻鞋 | [d/lanzhou/obj/shoes.c](../../d/lanzhou/obj/shoes.c) | 旧 `create()` 不调用 `setup()`；不能套用当前 BOOTS 表必做 setup 的初始化。 |
| 麻鞋 | [d/village/npc/obj/shoes.c](../../d/village/npc/obj/shoes.c) | 旧 `create()` 不调用 `setup()`；不能套用当前 BOOTS 表必做 setup 的初始化。 |

### 其他目录待评估（8）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 麻鞋 | [clone/cloth/dao-xie.c](../../clone/cloth/dao-xie.c) | 初始化候选。 |
| 绣花小鞋 | [clone/cloth/female-shoe.c](../../clone/cloth/female-shoe.c) | 初始化候选。 |
| 凉鞋 | [clone/cloth/liang-xie.c](../../clone/cloth/liang-xie.c) | `query_autoload()` 自动携带；需核对保存恢复。 |
| 皮靴 | [clone/cloth/male-shoe.c](../../clone/cloth/male-shoe.c) | 初始化候选。 |
| 青布尼鞋 | [clone/cloth/ni-xie.c](../../clone/cloth/ni-xie.c) | 初始化候选。 |
| 僧鞋 | [clone/cloth/seng-xie.c](../../clone/cloth/seng-xie.c) | 初始化候选。 |
| 仙履 | [clone/cloth/xianlv.c](../../clone/cloth/xianlv.c) | 初始化候选。 |
| 神草结 | [clone/lonely/caojie.c](../../clone/lonely/caojie.c) | 克隆自毁。 |

## 头饰（HEAD）

### /d 内保留（2）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 金盔 | [d/death/npc/obj/armor2.c](../../d/death/npc/obj/armor2.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 琉金盔 | [d/luoyang/npc/obj/head1.c](../../d/luoyang/npc/obj/head1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |

### 其他目录待评估（16）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 玛瑙 | [clone/gift/agate.c](../../clone/gift/agate.c) | `query_autoload()` 自动携带宝石。 |
| 玛瑙残片 | [clone/gift/cagate.c](../../clone/gift/cagate.c) | `query_autoload()` 自动携带宝石。 |
| 水晶残片 | [clone/gift/ccrystal.c](../../clone/gift/ccrystal.c) | `query_autoload()` 自动携带宝石。 |
| 钻石碎粒 | [clone/gift/cdiamond.c](../../clone/gift/cdiamond.c) | `query_autoload()` 自动携带宝石。 |
| 翡翠残片 | [clone/gift/cjade.c](../../clone/gift/cjade.c) | `query_autoload()` 自动携带宝石。 |
| 水晶 | [clone/gift/crystal.c](../../clone/gift/crystal.c) | `query_autoload()` 自动携带宝石。 |
| 钻石 | [clone/gift/diamond.c](../../clone/gift/diamond.c) | `query_autoload()` 自动携带宝石。 |
| 稀世玛瑙 | [clone/gift/fagate.c](../../clone/gift/fagate.c) | `query_autoload()` 自动携带宝石。 |
| 稀世水晶 | [clone/gift/fcrystal.c](../../clone/gift/fcrystal.c) | `query_autoload()` 自动携带宝石。 |
| 精美钻石 | [clone/gift/fdiamond.c](../../clone/gift/fdiamond.c) | `query_autoload()` 自动携带宝石。 |
| 稀世翡翠 | [clone/gift/fjade.c](../../clone/gift/fjade.c) | `query_autoload()` 自动携带宝石。 |
| 翡翠 | [clone/gift/jade.c](../../clone/gift/jade.c) | `query_autoload()` 自动携带宝石。 |
| 神之玛瑙 | [clone/gift/magate.c](../../clone/gift/magate.c) | `query_autoload()` 自动携带宝石；蓝图 `magic/power` 随机初始化。 |
| 神之水晶 | [clone/gift/mcrystal.c](../../clone/gift/mcrystal.c) | `query_autoload()` 自动携带宝石；蓝图 `magic/power` 随机初始化。 |
| 神之钻石 | [clone/gift/mdiamond.c](../../clone/gift/mdiamond.c) | `query_autoload()` 自动携带宝石；蓝图 `magic/power` 随机初始化。 |
| 神之翡翠 | [clone/gift/mjade.c](../../clone/gift/mjade.c) | `query_autoload()` 自动携带宝石；蓝图 `magic/power` 随机初始化。 |

## 手部装备（HANDS）

### /d 内保留（3）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 铁手掌 | [d/lingxiao/obj/book-iron.c](../../d/lingxiao/obj/book-iron.c) | `init/do_study` 提供战斗中研习招架；带 `skill` 数据且无 setup，不能只迁穿戴属性。 |
| 黄金指套 | [d/luoyang/npc/obj/finger.c](../../d/luoyang/npc/obj/finger.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 黄金手掌 | [d/luoyang/npc/obj/hand.c](../../d/luoyang/npc/obj/hand.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |

### 其他目录待评估（3）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 铁手掌 | [clone/book/book-iron.c](../../clone/book/book-iron.c) | `init/do_study` 战斗研习招架，带 `skill` 属性；与凌霄版本的初始化及学习收益不同，不能按同名合并。 |
| 琥珀神环 | [clone/lonely/hupohuan.c](../../clone/lonely/hupohuan.c) | 克隆自毁。 |
| 逍遥神仙环 | [clone/lonely/zhihuan.c](../../clone/lonely/zhihuan.c) | 克隆自毁。 |

## 颈饰（NECK）

当前扫描无剩余该类实体物品。`d/tulong/tulong/obj/xuantie-ling.c` 虽与已迁移颈饰同名，但实际继承 `ITEM`，不是 NECK，故不计入本类；不能按名称合并。

## 护腕（WRISTS）

### /d 内保留（1）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 绞金腕轮 | [d/luoyang/npc/obj/wanlun1.c](../../d/luoyang/npc/obj/wanlun1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |

## 食物（FOOD）

### /d 内保留（17）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 炸鸡腿 | [d/changan/npc/obj/jitui.c](../../d/changan/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/chengdu/npc/obj/jitui.c](../../d/chengdu/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/city/npc/obj/jitui.c](../../d/city/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/city/obj/jitui.c](../../d/city/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/jingzhou/npc/obj/jitui.c](../../d/jingzhou/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/jingzhou/obj/jitui.c](../../d/jingzhou/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/kunming/npc/obj/jitui.c](../../d/kunming/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 花种 | [d/luoyang/npc/obj/huazhong.c](../../d/luoyang/npc/obj/huazhong.c) | `init/do_zhonghua` 检查地点、经验和任务状态，播种后销毁种子并消耗精力；兼有食用能力。 |
| 大白鱼 | [d/mingjiao/obj/fish.c](../../d/mingjiao/obj/fish.c) | `finish_eat()` 改名为鱼骨、改变重量/单位/描述并保留对象，不是普通食物吃完销毁。 |
| 烤鸡腿 | [d/quanzhen/npc/obj/jitui.c](../../d/quanzhen/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤山鸡腿 | [d/wudu/npc/obj/jitui.c](../../d/wudu/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤山鸡腿 | [d/wudu/obj/jitui.c](../../d/wudu/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/xiakedao/npc/obj/jitui.c](../../d/xiakedao/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 后腿 | [d/xiakedao/obj/backleg.c](../../d/xiakedao/obj/backleg.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 猪腿 | [d/xiakedao/obj/forleg.c](../../d/xiakedao/obj/forleg.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 猪头 | [d/xiakedao/obj/zhutou.c](../../d/xiakedao/obj/zhutou.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 炸鸡腿 | [d/zhongzhou/npc/obj/jitui.c](../../d/zhongzhou/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |

### 其他目录待评估（10）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 包子 | [clone/food/baozi.c](../../clone/food/baozi.c) | 初始化候选；原 create 无 setup。 |
| 菜肴 | [clone/food/dish.c](../../clone/food/dish.c) | 初始化候选；原 create 无 setup。 |
| 烤鱼 | [clone/food/fish.c](../../clone/food/fish.c) | 初始化候选；原 create 无 setup。 |
| 烤鸡腿 | [clone/food/jitui.c](../../clone/food/jitui.c) | FOOD + HAMMER；`finish_eat()` 食毕留骨，兼有武器属性。 |
| 烤肉 | [clone/food/meat.c](../../clone/food/meat.c) | 初始化候选；原 create 无 setup。 |
| 五香花生 | [clone/food/peanut.c](../../clone/food/peanut.c) | 初始化候选；原 create 无 setup。 |
| 翡翠豆腐 | [clone/food/tofu.c](../../clone/food/tofu.c) | 初始化候选；原 create 无 setup。 |
| 烤虾 | [clone/food/xia.c](../../clone/food/xia.c) | 初始化候选；原 create 无 setup。 |
| 头颅 | [clone/misc/head.c](../../clone/misc/head.c) | `set_from/do_cut/finish_eat/eat_effect`：从生物生成头颅、切割、食用及变骨；有 `F_CUTABLE/F_SILENTDEST`。 |
| 残肢 | [clone/misc/part.c](../../clone/misc/part.c) | `set_from/long/finish_eat/eat_effect`：按来源生成残肢及描述、食用效果；有 `F_CUTABLE/F_SILENTDEST`。 |

侠客岛三件猪肉还共用 [pigpart.h](../../d/xiakedao/obj/pigpart.h)：只扫描物品自身的 `finish_eat()` 会漏掉禁止生吃和烤熟行为。各地鸡腿的名称、别名和饱食补给存在差异，后续按实际值归并，不因同一回调而全部合为一个品种。

## 饮具（LIQUID）

### /d 内保留（1）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 玉蜂蜜 | [d/gumu/obj/fengmi.c](../../d/gumu/obj/fengmi.c) | `only_do_effect/do_effect` 使用独立 `mi_count` 次数；补食水、解除玉蜂毒，不走普通液体余量契约。 |

### 其他目录待评估（5）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 聖杯 | [clone/fam/etc/prize4.c](../../clone/fam/etc/prize4.c) | `query_autoload()` 自动携带；独立液体初始状态且无 setup，需核对奖品恢复。 |
| 牛皮水袋 | [clone/fam/pill/water.c](../../clone/fam/pill/water.c) | 初始化候选；原 create 无 setup。 |
| 牛皮酒袋 | [clone/food/jiudai.c](../../clone/food/jiudai.c) | 初始化候选；原 create 无 setup。 |
| 果汁 | [clone/game/fruit.c](../../clone/game/fruit.c) | 初始化候选；原 create 无 setup。 |
| 薄荷冰 | [clone/game/mint.c](../../clone/game/mint.c) | 初始化候选；原 create 无 setup。 |

## 剑（SWORD）

### /d 内保留（7）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 无间闪电 | [d/death/obj/wujian.c](../../d/death/obj/wujian.c) | `hit_ob()` 额外造成精力伤害与创伤；迁移须连同战斗效果核对，不能只复制面板伤害。 |
| 金蛇剑 | [d/jinshe/obj/jinshe-jian.c](../../d/jinshe/obj/jinshe-jian.c) | `create()` 对克隆直接 `destruct()`，保留实体蓝图使用语义，不能改为普通可克隆商品。 |
| 赤金剑 | [d/luoyang/npc/obj/sword1.c](../../d/luoyang/npc/obj/sword1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 檀木琴 | [d/meizhuang/obj/qin.c](../../d/meizhuang/obj/qin.c) | 额外继承 `MI_QIN`，`init()` 绑定 `play_qin/play`；既是 SWORD，又可演奏。 |
| 鱼肠剑 | [d/tiezhang/obj/ycj.c](../../d/tiezhang/obj/ycj.c) | 覆盖空 `setup()`、禁止普通拾取；`init/do_jian` 触发昏迷及移往山路的陷阱。 |
| 倚天剑 | [d/tulong/obj/yitianjian.c](../../d/tulong/obj/yitianjian.c) | `hit_ob()` 扣对手内力；也是屠龙刀 `duikan` 的配对对象，须联合验证。 |
| 圣火令 | [d/tulong/tulong/obj/ling1.c](../../d/tulong/tulong/obj/ling1.c) | `init/do_du` 绑定研究命令，检查识字、梵文、经验等并学习圣火令；是可研究的兵器。 |

### 其他目录待评估（34）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 镔铁令 | [b/tulong/npc/obj/ling.c](../../b/tulong/npc/obj/ling.c) | 初始化候选。 |
| 倚天剑 | [b/yitian/npc/obj/jian.c](../../b/yitian/npc/obj/jian.c) | 初始化候选。 |
| 圣火令 | [clone/book/ling1.c](../../clone/book/ling1.c) | 克隆自毁；`skill` 承载圣火令学习条件，须保留实体蓝图与研读行为。 |
| 圣火令 | [clone/book/ling2.c](../../clone/book/ling2.c) | 克隆自毁并继承 `F_UNIQUE`；`skill` 承载不同阶段学习条件，不能与其他令牌按同名合并。 |
| 圣火令 | [clone/book/ling3.c](../../clone/book/ling3.c) | 克隆自毁并继承 `F_UNIQUE`；`skill` 承载不同阶段学习条件，不能与其他令牌按同名合并。 |
| 白龙剑 | [clone/lonely/bailongjian.c](../../clone/lonely/bailongjian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 残阳宝剑 | [clone/lonely/canyang.c](../../clone/lonely/canyang.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 神聖長劍 | [clone/lonely/godsword.c](../../clone/lonely/godsword.c) | 克隆自毁；`hit_ob` 额外命中效果；`init/do_cast/remove_effect` 施法和效果撤销。 |
| 黑剑 | [clone/lonely/heijian.c](../../clone/lonely/heijian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 幻灵剑 | [clone/lonely/huanlingjian.c](../../clone/lonely/huanlingjian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 金蛇剑 | [clone/lonely/jinshejian.c](../../clone/lonely/jinshejian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 金蜈钩 | [clone/lonely/jinwugou.c](../../clone/lonely/jinwugou.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 君子剑 | [clone/lonely/junzijian.c](../../clone/lonely/junzijian.c) | 克隆自毁。 |
| 两极剑 | [clone/lonely/liangjijian.c](../../clone/lonely/liangjijian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 圣火令 | [clone/lonely/ling1.c](../../clone/lonely/ling1.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 圣火令 | [clone/lonely/ling2.c](../../clone/lonely/ling2.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 圣火令 | [clone/lonely/ling3.c](../../clone/lonely/ling3.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 墨剑 | [clone/lonely/mojian.c](../../clone/lonely/mojian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 无名剑 | [clone/lonely/noname.c](../../clone/lonely/noname.c) | 克隆自毁。 |
| 淑女剑 | [clone/lonely/shunvjian.c](../../clone/lonely/shunvjian.c) | 克隆自毁。 |
| 腾龙剑 | [clone/lonely/tenglongjian.c](../../clone/lonely/tenglongjian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 铁琴剑 | [clone/lonely/tieqin.c](../../clone/lonely/tieqin.c) | 克隆自毁；`hit_ob` 额外命中效果；`MI_QIN/init` 演奏。 |
| 玄铁重剑 | [clone/lonely/xuantiejian.c](../../clone/lonely/xuantiejian.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 白玉瑶琴 | [clone/lonely/yaoqin.c](../../clone/lonely/yaoqin.c) | 克隆自毁；`hit_ob` 额外命中效果；`MI_QIN/init` 演奏。 |
| 倚天剑 | [clone/lonely/yitianjian.c](../../clone/lonely/yitianjian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 真武剑 | [clone/lonely/zhenwu.c](../../clone/lonely/zhenwu.c) | 克隆自毁；`hit_ob` 额外命中效果；`do_wield` 持用回调；`do_unwield` 卸下回调。 |
| 镇岳尚方 | [clone/lonely/zhenyue.c](../../clone/lonely/zhenyue.c) | 克隆自毁；`hit_ob` 额外命中效果；`skill` 学习数据。 |
| 长剑 | [clone/weapon/changjian.c](../../clone/weapon/changjian.c) | 初始化候选。 |
| 短剑 | [clone/weapon/duanjian.c](../../clone/weapon/duanjian.c) | 初始化候选。 |
| 钢剑 | [clone/weapon/gangjian.c](../../clone/weapon/gangjian.c) | 初始化候选。 |
| 凝碧剑 | [clone/weapon/green_sword.c](../../clone/weapon/green_sword.c) | 初始化候选。 |
| 剑气 | [clone/weapon/jianqi.c](../../clone/weapon/jianqi.c) | `init_sword(query("power"))` 从属性计算伤害；非单纯常量伤害，须核对技能创建及实例覆盖。 |
| 西洋剑 | [clone/weapon/xiyang-sword.c](../../clone/weapon/xiyang-sword.c) | 初始化候选。 |
| 竹剑 | [clone/weapon/zhujian.c](../../clone/weapon/zhujian.c) | 初始化候选。 |

## 刀（BLADE）

### /d 内保留（6）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 枯骨刀 | [d/death/npc/obj/blade1.c](../../d/death/npc/obj/blade1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 井中月 | [d/death/sky/npc/obj/jingzhongyue.c](../../d/death/sky/npc/obj/jingzhongyue.c) | `hit_ob()` 附加精力伤害；普通 BLADE 表没有此命中回调。 |
| 血刀 | [d/jingzhou/obj/xblade.c](../../d/jingzhou/obj/xblade.c) | `init/do_wield` 截获持用，符合血刀技能映射时增加临时伤害；不得丢掉额外加成。 |
| 赤金刀 | [d/luoyang/npc/obj/blade1.c](../../d/luoyang/npc/obj/blade1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 井中月 | [d/sky/npc/obj/jingzhongyue.c](../../d/sky/npc/obj/jingzhongyue.c) | `hit_ob()` 附加精力伤害；同名不等于可跳过属性、调用及身份核对。 |
| 屠龙刀 | [d/tulong/obj/tulongdao.c](../../d/tulong/obj/tulongdao.c) | `F_UNIQUE + F_NOCLONE/check_clone`，额外 `hit_ob`；`duikan/do_open` 毁刀剑并发放断刃、秘籍。普通产物路径虽已迁移，主体仍未迁移。 |

### 其他目录待评估（17）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 紫金八卦刀 | [clone/lonely/baguadao.c](../../clone/lonely/baguadao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 厚背紫金刀 | [clone/lonely/houbeidao.c](../../clone/lonely/houbeidao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 黄金锯齿刀 | [clone/lonely/juchidao.c](../../clone/lonely/juchidao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 闯王军刀 | [clone/lonely/jundao.c](../../clone/lonely/jundao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 冷月宝刀 | [clone/lonely/lengyuedao.c](../../clone/lonely/lengyuedao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 屠龙刀 | [clone/lonely/tulongdao.c](../../clone/lonely/tulongdao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 绿波香露刀 | [clone/lonely/xiangludao.c](../../clone/lonely/xiangludao.c) | 克隆自毁；`hit_ob` 额外命中效果；`do_wield` 持用回调；`poison` 毒效。 |
| 血刀 | [clone/lonely/xuedao.c](../../clone/lonely/xuedao.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 钢刀 | [clone/weapon/blade.c](../../clone/weapon/blade.c) | 初始化候选。 |
| 柴刀 | [clone/weapon/chaidao.c](../../clone/weapon/chaidao.c) | 初始化候选。 |
| 大刀 | [clone/weapon/dadao.c](../../clone/weapon/dadao.c) | 初始化候选。 |
| 钢刀 | [clone/weapon/gangdao.c](../../clone/weapon/gangdao.c) | 初始化候选。 |
| 戒刀 | [clone/weapon/jiedao.c](../../clone/weapon/jiedao.c) | 初始化候选。 |
| 东洋刀 | [clone/weapon/jpn-dao.c](../../clone/weapon/jpn-dao.c) | 初始化候选。 |
| 木刀 | [clone/weapon/mudao.c](../../clone/weapon/mudao.c) | 初始化候选。 |
| 屠刀 | [clone/weapon/tudao.c](../../clone/weapon/tudao.c) | 初始化候选。 |
| 阿拉伯弯刀 | [clone/weapon/wandao.c](../../clone/weapon/wandao.c) | 初始化候选。 |

## 直接防具（EQUIP）

### 其他目录待评估（1）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 青布袍 | [clone/cloth/qingyi.c](../../clone/cloth/qingyi.c) | 初始化候选；原 create 无 setup。 |

## 锤类（HAMMER）

### /d 内保留（17）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 炸鸡腿 | [d/changan/npc/obj/jitui.c](../../d/changan/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/chengdu/npc/obj/jitui.c](../../d/chengdu/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/city/npc/obj/jitui.c](../../d/city/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/city/obj/jitui.c](../../d/city/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 瑶琴 | [d/dali/npc/obj/yaoqin.c](../../d/dali/npc/obj/yaoqin.c) | 额外继承 `MI_QIN`；`init()` 绑定 `play_qin/play`，保留 HAMMER 与演奏两种行为。 |
| 烤鸡腿 | [d/jingzhou/npc/obj/jitui.c](../../d/jingzhou/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/jingzhou/obj/jitui.c](../../d/jingzhou/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/kunming/npc/obj/jitui.c](../../d/kunming/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 赤金锤 | [d/luoyang/npc/obj/hammer1.c](../../d/luoyang/npc/obj/hammer1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 烤鸡腿 | [d/quanzhen/npc/obj/jitui.c](../../d/quanzhen/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤山鸡腿 | [d/wudu/npc/obj/jitui.c](../../d/wudu/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤山鸡腿 | [d/wudu/obj/jitui.c](../../d/wudu/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 烤鸡腿 | [d/xiakedao/npc/obj/jitui.c](../../d/xiakedao/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |
| 后腿 | [d/xiakedao/obj/backleg.c](../../d/xiakedao/obj/backleg.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 猪腿 | [d/xiakedao/obj/forleg.c](../../d/xiakedao/obj/forleg.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 猪头 | [d/xiakedao/obj/zhutou.c](../../d/xiakedao/obj/zhutou.c) | FOOD + HAMMER；`pigpart.h` 的 `setup/do_effect/broil` 禁止生吃、支持烤熟；`finish_eat()` 留下骨头。须覆盖生→熟→骨头及兵器状态。 |
| 炸鸡腿 | [d/zhongzhou/npc/obj/jitui.c](../../d/zhongzhou/npc/obj/jitui.c) | FOOD + HAMMER；`finish_eat()` 根据兵器属性变成骨头，改名、重量和描述并保留对象。须同时验证食用与持用。 |

### 其他目录待评估（9）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 碧绿西瓜 | [b/tulong/npc/obj/hammer.c](../../b/tulong/npc/obj/hammer.c) | 初始化候选。 |
| 大石头 | [b/tulong/obj/stone.c](../../b/tulong/obj/stone.c) | 初始化候选。 |
| 铜钹 | [b/yitian/npc/obj/tongbo.c](../../b/yitian/npc/obj/tongbo.c) | 初始化候选。 |
| 烤鸡腿 | [clone/food/jitui.c](../../clone/food/jitui.c) | FOOD + HAMMER；`finish_eat()` 食毕留骨，兼有武器属性。 |
| 黄金斧 | [clone/lonely/huangjinfu.c](../../clone/lonely/huangjinfu.c) | 克隆自毁；`hit_ob` 额外命中效果；`init/do_pick` 从斧柄取竹简。 |
| 日月金轮 | [clone/lonely/jinlun.c](../../clone/lonely/jinlun.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 破阳神斧 | [clone/lonely/poyangfu.c](../../clone/lonely/poyangfu.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 玄铁棋盘 | [clone/lonely/qipan.c](../../clone/lonely/qipan.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 铁锤 | [clone/weapon/hammer.c](../../clone/weapon/hammer.c) | 初始化候选。 |

本类的 16 件兼用食物已在 FOOD 节列出；不是另外 16 个文件。迁移时同时更新两个分类，并覆盖食用前后仍能否持用以及吃完是否留骨。

## 杖类（STAFF）

### /d 内保留（8）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 灵蛇杖 | [d/baituo/obj/lingshezhang.c](../../d/baituo/obj/lingshezhang.c) | `init/convert` 绑定 `bian`；检查门派、精力及驭兽，生成灵蛇后销毁杖，保留毒效属性。 |
| 蛇杖 | [d/baituo/obj/shezhang.c](../../d/baituo/obj/shezhang.c) | `init/convert` 绑定 `bian`；检查门派、精力及驭兽，生成毒蛇后销毁杖。 |
| 大树枝 | [d/city/obj/shuzhi.c](../../d/city/obj/shuzhi.c) | `fire()` 检查环境温度、生成篝火并销毁树枝；不等同于仅能持用的木杖。 |
| 大树枝 | [d/foshan/obj/shuzhi.c](../../d/foshan/obj/shuzhi.c) | `fire()` 检查环境温度、生成篝火并销毁树枝；须一起核对点火调用方。 |
| 大树枝 | [d/hangzhou/obj/shuzhi.c](../../d/hangzhou/obj/shuzhi.c) | `fire()` 检查环境温度、生成篝火并销毁树枝；须一起核对点火调用方。 |
| 水烟筒 | [d/kunming/npc/obj/yantong.c](../../d/kunming/npc/obj/yantong.c) | `init/do_fire` 消耗水烟、回复精力并造成忙碌；不只是 STAFF 初始化。 |
| 赤金杖 | [d/luoyang/npc/obj/staff1.c](../../d/luoyang/npc/obj/staff1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |
| 伏魔杖 | [d/shaolin/obj/fumo-zhang.c](../../d/shaolin/obj/fumo-zhang.c) | 额外继承 `F_NOCLONE`，末尾 `check_clone()`；须保留克隆限制。 |

### 其他目录待评估（12）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 精铁杖 | [b/yitian/npc/obj/tiezhang.c](../../b/yitian/npc/obj/tiezhang.c) | 初始化候选。 |
| 九环锡杖 | [clone/lonely/jiuhuan.c](../../clone/lonely/jiuhuan.c) | 克隆自毁。 |
| 鹿头杖 | [clone/lonely/lutouzhang.c](../../clone/lonely/lutouzhang.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 神农锏 | [clone/lonely/shennongjian.c](../../clone/lonely/shennongjian.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 玉竹杖 | [clone/lonely/yuzhu.c](../../clone/lonely/yuzhu.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 人骨 | [clone/misc/bone.c](../../clone/misc/bone.c) | 初始化候选。 |
| 金钱帮权杖 | [clone/special/mace-jq.c](../../clone/special/mace-jq.c) | `owner/author/expell` 等帮会管理动作；`query_autoload/autoload` 保存恢复管理身份。 |
| 聊天帮权杖 | [clone/special/mace-lt.c](../../clone/special/mace-lt.c) | `owner/author/expell` 等帮会管理动作；`query_autoload/autoload` 保存恢复管理身份。 |
| 权力帮权杖 | [clone/special/mace-ql.c](../../clone/special/mace-ql.c) | `owner/author/expell` 等帮会管理动作；`query_autoload/autoload` 保存恢复管理身份。 |
| 发呆帮权杖 | [clone/special/mace.c](../../clone/special/mace.c) | `owner/author/expell` 等帮会管理动作；`query_autoload/autoload` 保存恢复管理身份。 |
| 钢杖 | [clone/weapon/gangzhang.c](../../clone/weapon/gangzhang.c) | 初始化候选。 |
| 竹棒 | [clone/weapon/zhubang.c](../../clone/weapon/zhubang.c) | 初始化候选。 |

## 鞭类（WHIP）

### /d 内保留（1）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 赤金鞭 | [d/luoyang/npc/obj/whip1.c](../../d/luoyang/npc/obj/whip1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |

### 其他目录待评估（13）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 赤龙金索 | [clone/lonely/chilongsuo.c](../../clone/lonely/chilongsuo.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 黑龙鞭 | [clone/lonely/heilongbian.c](../../clone/lonely/heilongbian.c) | 克隆自毁。 |
| 黑索 | [clone/lonely/heisuo1.c](../../clone/lonely/heisuo1.c) | 克隆自毁。 |
| 黑索 | [clone/lonely/heisuo2.c](../../clone/lonely/heisuo2.c) | 克隆自毁。 |
| 黑索 | [clone/lonely/heisuo3.c](../../clone/lonely/heisuo3.c) | 克隆自毁。 |
| 剑盾珠索 | [clone/lonely/jiansuo.c](../../clone/lonely/jiansuo.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 柔丝索 | [clone/lonely/rousisuo.c](../../clone/lonely/rousisuo.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 银蛟鞭 | [clone/lonely/yinjiaobian.c](../../clone/lonely/yinjiaobian.c) | 克隆自毁。 |
| 银索金铃 | [clone/lonely/yinsuo.c](../../clone/lonely/yinsuo.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 软红蛛索 | [clone/lonely/zhusuo.c](../../clone/lonely/zhusuo.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 羊鞭 | [clone/weapon/bian.c](../../clone/weapon/bian.c) | 初始化候选。 |
| 长鞭 | [clone/weapon/changbian.c](../../clone/weapon/changbian.c) | 初始化候选。 |
| 柔丝索 | [clone/weapon/rousisuo.c](../../clone/weapon/rousisuo.c) | 初始化候选。 |

## 短兵器（DAGGER）

### /d 内保留（1）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 赤金匕首 | [d/luoyang/npc/obj/dagger1.c](../../d/luoyang/npc/obj/dagger1.c) | `owner_is_killed()` 销毁；普通数据表没有该死亡回调，须先保留并验证销毁链。 |

### 其他目录待评估（4）

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 玄铁匕首 | [clone/lonely/bishou.c](../../clone/lonely/bishou.c) | 克隆自毁。 |
| 鹤形笔 | [clone/lonely/hexingbi.c](../../clone/lonely/hexingbi.c) | 克隆自毁；`hit_ob` 额外命中效果。 |
| 鱼肠剑 | [clone/lonely/yuchang.c](../../clone/lonely/yuchang.c) | 克隆自毁。 |
| 普通匕首 | [clone/weapon/dagger.c](../../clone/weapon/dagger.c) | 初始化候选。 |


## 暗器（THROWING）

### /d 内保留（6）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 银针 | [d/beijing/obj/yinzhen.c](../../d/beijing/obj/yinzhen.c) | `init/do_heal` 注册针灸，涉及技能门槛、治疗、针数消耗和失败伤害。 |
| 茶叶 | [d/chengdu/npc/obj/tea-leaf.c](../../d/chengdu/npc/obj/tea-leaf.c) | `do_effect` 消耗一片、回复精并进入忙状态；唐槐货表继续出售原对象。 |
| 冰魄银针 | [d/gumu/obj/bingpo-zhen.c](../../d/gumu/obj/bingpo-zhen.c) | 初始化 `daub/*` 临时毒性、余量和来源；普通表不承担毒性状态恢复。 |
| 玉蜂针 | [d/gumu/obj/yufeng-zhen.c](../../d/gumu/obj/yufeng-zhen.c) | 初始化另一套 `daub/*` 毒性和来源；不得只迁固定属性而丢失临时状态。 |
| 丧门钉 | [d/kunlun/obj/sangmending.c](../../d/kunlun/obj/sangmending.c) | 初始数量为 `random(5) + 10`，另有原毒性字段；不是固定数量品种。 |
| 凤尾箭 | [d/mingjiao/yuan/obj/arrow.c](../../d/mingjiao/yuan/obj/arrow.c) | `is_arrow()` 标识、伤害比例及 setup 后实例属性，须按箭矢行为单独验证。 |

### 其他目录待评估（12）

以下仅登记，`/clone` 不在当前迁移范围；名称相同也不意味着与本批品种等价。

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 回龙璧 | [clone/lonely/huilongbi.c](../../clone/lonely/huilongbi.c) | 固定初始化、`no_sell`；本体无克隆自毁，赵半山按唯一蓝图的持有者决定领取与备用暗器，不能仅看 lonely 目录推断克隆限制。 |
| 羽箭 | [clone/weapon/arrow.c](../../clone/weapon/arrow.c) | `is_arrow()`、wound_percent=80，setup 后写 no_wield；按箭矢行为评估。 |
| 刺骨箭 | [clone/weapon/ciguarrow.c](../../clone/weapon/ciguarrow.c) | `is_arrow()`、伤害和伤口比例，setup 后写 no_wield。 |
| 飞蝗石 | [clone/weapon/feihuangshi.c](../../clone/weapon/feihuangshi.c) | 初始化候选；别名、伤害与本批飞石有差异。 |
| 凤尾箭 | [clone/weapon/fengweiarrow.c](../../clone/weapon/fengweiarrow.c) | `is_arrow()`、伤口比例，setup 后写 no_wield。 |
| 花瓣 | [clone/weapon/flower_leaf.c](../../clone/weapon/flower_leaf.c) | 初始化候选；保留本文件显示、damage 与材质缺省值，未套用 /d 文案修正。 |
| 铁蒺藜 | [clone/weapon/jili.c](../../clone/weapon/jili.c) | 初始化候选；“淬毒”描述不等于初始化了毒性状态。 |
| 铁莲子 | [clone/weapon/lianzi.c](../../clone/weapon/lianzi.c) | 初始化候选；数量 50、base_value=1，须比较实际属性而非同名合并。 |
| 茶叶 | [clone/weapon/tea-leaf.c](../../clone/weapon/tea-leaf.c) | 仅固定初始化，无 /d 茶叶的 do_effect；不可因同名补入服用功能。 |
| 铁莲子 | [clone/weapon/tielianzi.c](../../clone/weapon/tielianzi.c) | 初始化候选；数量 30、init_throwing(12)，与其他铁莲子区分。 |
| 狼牙箭 | [clone/weapon/wolfarrow.c](../../clone/weapon/wolfarrow.c) | `is_arrow()`、wound_percent=90，setup 后写 no_wield。 |
| 子母回魂镖 | [kungfu/class/tangmen/obj/huihun.c](../../kungfu/class/tangmen/obj/huihun.c) | 固定初始化候选，来源不在 /d；需另核对跨目录身份及技能调用。 |

## 棍类（CLUB）

### /d 内保留（1）

| 物品名称 | 源码 | 特殊行为与保留原因 |
| --- | --- | --- |
| 赤金棍 | [d/luoyang/npc/obj/club1.c](../../d/luoyang/npc/obj/club1.c) | `owner_is_killed()` 销毁；保留持有者死亡回调，不套入普通定义表。 |

### 其他目录待评估（7）

以下仅登记，不扩大本批 /d 迁移范围；均直接继承 CLUB，头文件未注入额外物品行为。

| 物品名称 | 源码 | 已发现行为 / 审查线索 |
| --- | --- | --- |
| 大旗 | [b/tulong/npc/obj/flag.c](../../b/tulong/npc/obj/flag.c) | 初始化候选，long 的颜色与 /d 大旗不同，不能仅因同名合并。 |
| 镔铁长枪 | [b/yitian/npc/obj/spear.c](../../b/yitian/npc/obj/spear.c) | 初始化候选，虽与本批 /d 来源相同，/b 仍在范围外。 |
| 南海神木 | [clone/lonely/shenmu.c](../../clone/lonely/shenmu.c) | 克隆自毁、唯一蓝图；`hit_ob` 按金猿棍法和随机结果附加伤害，张乘风另有所有权判断。 |
| 长枪 | [clone/weapon/changqiang.c](../../clone/weapon/changqiang.c) | 初始化候选，名称及别名不同；/clone 暂不处理。 |
| 齐眉棍 | [clone/weapon/qimeigun.c](../../clone/weapon/qimeigun.c) | 初始化候选，value=200，不等同本批 value=50 的 qimei_gun。 |
| 圣骑士戟 | [clone/weapon/qishiji.c](../../clone/weapon/qishiji.c) | 初始化候选，银材质、重量 30000，保留真实差异。 |
| 铁棍 | [clone/weapon/tiegun.c](../../clone/weapon/tiegun.c) | 初始化候选，实际直接 CLUB；注释中的 STAFF 不计作继承。 |
