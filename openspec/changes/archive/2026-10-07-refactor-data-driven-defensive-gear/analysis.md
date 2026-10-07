# 四类防具迁移分析

核对日期：2026-10-06；源码基线 `487c98daa21c94bf87c732dd08c3a78123cd6685`。这是实施前静态分析，不是驱动回归或游戏验收结果。工作区现有 `data/e2c_dict.o`、`data/emoted.o` 改动不属于本批，不读写其正文。

## 来源与归并

核对分类宏、直接父类路径、构造函数和回调，在 /d 找到 24 份定义，/clone 另有 5 份；本批不迁移 /clone。所有 /d 候选只包含 `armor.h` 与可选 `ansi.h`，没有物品专用头文件注入。严格初始化解析与人工核对一致：18 份固定初始化、6 份另有行为。

| 分类 | /d 总数 | 本批普通来源 | 拟归并品种 | 保留专用定义 |
| --- | ---: | ---: | ---: | ---: |
| ARMOR | 7 | 6 | 5 | 1 |
| WAIST | 10 | 5 | 3 | 5 |
| SURCOAT | 3 | 3 | 1 | 0 |
| SHIELD | 4 | 4 | 1 | 0 |
| 合计 | **24** | **18** | **10** | **6** |

下列是拟定的唯一规范身份；名称仅去掉表格中的 ANSI 展示控制，颜色仍须原样保存。数值为源文显式设置，不代表最终派生值；缺省 long 不自行补写。

| 规范路径 | 名称 | 旧路径（均省略 .c） | 重量 / 价值 | 关键属性 |
| --- | --- | --- | --- | --- |
| `/d/items/armor/tiejia` | 铁甲 | `/d/beijing/npc/obj/body` | 4000 / 0 | armor=30，dodge=-10 |
| `/d/items/armor/jinhuan_jia` | 金环锁子甲 | `/d/death/obj/armor1` | 20000 / 400000 | armor=30，dodge=-5，steel |
| `/d/items/armor/pangu_kai` | 盘古铠 | `/d/death/sky/npc/obj/pangukai`、`/d/sky/npc/obj/pangukai` | 10000 / 100000 | armor=200，原 material=cloth |
| `/d/items/armor/ruanwei_jia` | 软猬甲 | `/d/taohua/obj/ruanwei` | 1000 / 20000 | armor=75，dodge=-5，copper |
| `/d/items/armor/pi_beixin` | 皮背心 | `/d/zhongzhou/npc/obj/beixin` | 1000 / 1000 | armor=6，leather |
| `/d/items/waist/huyao` | 护腰 | `/d/city/npc/obj/huyao`、`/d/city/obj/huyao`、`/d/jingzhou/obj/huyao` | 500 / 1600 | armor=5，leather |
| `/d/items/waist/tie_huyao` | 铁护腰 | `/d/mingjiao/obj/huyao` | 500 / 6000 | armor=5，原 material=waist，无 shaolin 标记 |
| `/d/items/waist/shaolin_huyao` | 铁护腰 | `/d/shaolin/obj/huyao` | 500 / 6000 | armor=5，原 material=waist，shaolin=1 |
| `/d/items/surcoat/dudai` | 肚带 | `/d/city/npc/obj/surcoat`、`/d/city/obj/surcoat`、`/d/jingzhou/obj/surcoat` | 500 / 800 | dodge=-3，仍属 SURCOAT |
| `/d/items/shield/niupi_dun` | 牛皮盾 | `/d/changan/npc/obj/shield`、`/d/city/npc/obj/shield`、`/d/city/obj/shield`、`/d/jingzhou/obj/shield` | 7000 / 1200 | armor=5，defense=3，leather |

四组重复来源经字段/token 对照相同，各组拟合并为一个身份；实施时仍须对照真实驱动的蓝图和实例。两份铁护腰的 `shaolin` 差异在 `feature/dealer.c` 的售卖检查中生效，不能合并；`shaolin_huyao` 表达实际门派属性，而非历史地区。软猬甲原文没有专用反伤回调，不按小说印象增加反伤。皮背心不与 CLOTH 同名物品合并。

四类父类各在蓝图 setup 设置自己的 `armor_type`，再执行 EQUIP 初始化；`inherit/misc/equip.c` 可按重量生成闪避修正，再进入 `ITEM_D->equip_setup`。不能只抄显式 armor 值而遗漏派生属性与耐久，也不能都降为直接 EQUIP。18 份旧程序由 4 个公共程序、4 张表替代，预计净少 14 个可编译文件、10 个含头文件的定义文件。

## 展示纠错与不变项

两份盘古铠均存在相同笔误，只允许：

- `unit`：`见` → `件`。
- `long`：`一见黑黝黝的铁甲，上面雕有盘古的头像。\n` → `一件黑黝黝的铁甲，上面雕有盘古的头像。\n`。

其他字段、字符串、颜色、输入别名及有效属性按原行为；原 `material=cloth/waist` 不借展示纠错改成其他材质。冻结原文/hash 不变，测试逐字段放行上述精确差异。

## 静态与动态调用

复用现有 `references()` 对 Git 跟踪的运行期 LPC/头文件扫描，识别绝对路径、__DIR__、常量拼接及前缀线索：**17 处静态引用、10 个静态消费者、5 条动态线索**。四条动态线索需要适配，一条为无关分支；计划共 **14 个消费者**。

| 静态消费者 | 使用方式 |
| --- | --- |
| `d/changan/npc/liu.c` | 商店售卖牛皮盾 |
| `d/city/npc/yang.c` | 商店售卖肚带、牛皮盾、护腰 |
| `d/death/npc/yinchangsheng.c` | 商店售卖金环锁子甲 |
| `d/luoyang/npc/xiao.c` | 商店售卖肚带、牛皮盾、护腰 |
| `d/luoyang/npc/zhu.c` | 商店售卖牛皮盾、护腰 |
| `d/xiangyang/npc/gaoli.c` | 商店售卖肚带、牛皮盾、护腰 |
| `d/death/sky/npc/li2.c`、`d/sky/npc/li2.c` | NPC 穿盘古铠 |
| `d/xiangyang/npc/guofu.c`、`kungfu/class/taohua/rong.c` | NPC 穿软猬甲 |

动态逐项结论：

1. 钱正伦 `do_yao("body")`：改为铁甲规范路径；保留八卦门条件、按口令计数、护甲三件上限、实例 `no_sell` 文案和 value=50 覆盖，不改全局铁甲价值。
2. 武修文 `ask_me_1("huyao")`：仍领取少林版本，保留持有检查和共享库存；原未要求少林身份，不新增门派限制。
3. 道相 `ask_me_1("huyao")`：同一少林品种，仍要求少林派，保留持有检查与库存。
4. 道尘 `ask_me("huyao")`：当前 inquiry 没有护腰，但公开函数按此参数仍可构造该物品；替换该既有公开参数路径，保留少林资格及原武器库存扣减，不新增玩家 inquiry。
5. 长安副将 `weapon_file`：仅有五种已迁兵器，不含 shield；保留源码/hash 和装备行为，不给副将增加盾牌。

对无当前消费者的旧定义仍保留 18 条完整离线映射，因为静态无引用不证明玩家或商店存档不存在旧路径。后续实际审计若发现更多有效引用，须解释来源并保持同一迁移范围，不能靠运行期旧入口掩盖。

## /d 保留项：后续特殊装备

本轮建立普通类别入口，不声称已迁完以下功能。保留原文件、原调用与行为：

| 名称 | 路径 | 特殊行为及后续验证重点 |
| --- | --- | --- |
| 银甲 | `d/death/npc/obj/armor1.c` | `owner_is_killed()` 销毁；与同名 armor1 的金环锁子甲不同。 |
| 皮腰带 | `d/emei/obj/yaodai.c` | 容量 1000、`is_container()`，不是普通护腰。 |
| 皮腰带 | `d/mingjiao/obj/yaodai.c` | 同类容量/容器行为；可在后续容器装备批次核对与峨眉版本归并。 |
| 皮腰带 | `d/shaolin/obj/yaodai.c` | 容量 1000、容器、shaolin=1；不能丢掉门派售卖限制。 |
| 竹篓 | `d/wudu/obj/zhulou.c` | 容量 15000、容器、专用穿脱文案。 |
| 竹篓 | `d/wudu/obj/zhulou2.c` | 相同容器外观，但克隆按多次 random 分支装入不同数量药材/毒囊；不是空篓同品种。 |

解析器拒绝上述代码不是永久不迁的理由；这里按“先普通、后特殊”的批次边界保留。后续可抽取固定容量容器的共有行为，再分别处理随机装载与死亡回调，不新增通用脚本执行字段。

## /clone 范围外项

| 名称 | 路径 | 实际行为 |
| --- | --- | --- |
| 腰带 | `clone/cloth/yaodai.c` | 固定初始化、female_only=1；候选但 /clone 暂不迁移。 |
| 真丝宝甲 | `clone/lonely/baojia.c` | 克隆自毁，不可改成普通任意复制品种。 |
| 龙象袈裟 | `clone/lonely/jiasha.c` | F_DBSAVE、克隆自毁、研读、do_force/valid_damage 及力道次数保存恢复。 |
| 含沙射影 | `clone/lonely/sheying.c` | 克隆自毁、shot 命令、毒针次数、伤害/中毒和忙碌。 |
| 真丝宝甲 | `clone/weapon/jsbaojia.c` | create 主动 move 至北京密室，与 lonely 版本不能因属性相似合并。 |

以上五份已核对源码与 include。实施更新总台账时须去重：已归为研读物的龙象袈裟等不能重复计为新增独立文件。

## 验收落点

- 原蓝图/实例 vs 新品种：名称、别名、颜色、属性、实际重量、权限、槽位、派生加成、耐久、setup 次数及状态隔离。
- 六家商店、四个 NPC、四个公开领取分支；包含少林拒售、钱正伦实例覆盖、道相/武修文资格差异及副将负例。
- 四类精确存取入口，18 条旧路径的玩家/商店/显式旧袋/盟主字段转换；同品同价合计、冲突拒绝、幂等、原字节回退。
- 全库编译、累计消费者/旧类别回归、三轮相同逻辑样本的性能，所有结果实际运行后记录；规划阶段不打完成勾。
