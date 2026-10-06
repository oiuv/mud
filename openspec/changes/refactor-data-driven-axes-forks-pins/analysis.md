# 斧、叉、针迁移分析

核对日期：2026-10-06。源码基线：`3c7bd13cd324fe61c580c57bc865ce63fe91143a`。本页是实施前静态分析，不是迁移或真实驱动验收结果。工作区已有 `weapon.h` 注释纠正与装备优先级文档修改，不计为本批物品实现。

## 范围与品种

核对 `/d` 的宏继承、武器路径继承及 `init_axe/init_fork/init_pin` 调用，得到 7 斧、1 叉、1 针。9 份文件均只有 `create()`：设置名称、实际重量、克隆默认对象、蓝图属性，调用对应初始化与 `setup()`；未发现额外物品回调。

拟采用下列短 ID；实施时冻结原文、hash 及真实驱动蓝图/实例观测，再确认有效属性。表中所有斧均为钢材，钢叉为 iron，绣花针为 steel；数值、单位和限制均按原行为保留。

| 原路径（省略 `.c`） | 名称 | 规范路径 | 重量 | 伤害 | 价值 | 显式标志 |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `/d/beijing/npc/obj/axe` | 大板斧 | `/d/items/axe/dabanfu` | 6000 | 25 | 1100 | TWO_HANDED |
| `/d/changan/npc/obj/axe` | 板斧 | `/d/items/axe/banfu` | 6000 | 25 | 500 | TWO_HANDED |
| `/d/guanwai/obj/axe` | 斧头 | `/d/items/axe/futou` | 10000 | 30 | 1000 | TWO_HANDED |
| `/d/guiyun/npc/obj/axe` | 砍柴斧 | `/d/items/axe/kanchai_fu` | 5000 | 5 | 1500 | 0 |
| `/d/huanghe/npc/obj/axe` | 丧门斧 | `/d/items/axe/sangmen_fu` | 5000 | 15 | 1500 | 0 |
| `/d/huanghe/npc/obj/futou` | 大斧头 | `/d/items/axe/da_futou` | 7000 | 5 | 1000 | 0 |
| `/d/tiezhang/obj/axe` | 大板斧 | `/d/items/axe/dabanfu2` | 6000 | 35 | 500 | TWO_HANDED |
| `/d/beijing/npc/obj/fork` | 钢叉 | `/d/items/fork/gangcha` | 8000 | 25 | 1000 | 0 |
| `/d/quanzhou/obj/xiuhua` | 绣花针 | `/d/items/pin/xiuhua_zhen` | 5 | 10 | 80 | 0 |

同名大板斧的伤害和价值不同，板斧的显示名也不同，当前不合并。长安板斧的重复输入别名 `axe` 可去重，不改变任何原输入匹配。针与已有 `/d/items/sword/xiuhua_zhen` 分属不同父类，不能因同名而合并。

9 份旧 `.c` 拟替换为 3 份 `.lpc` 与 3 份数据头文件，净少 3 个运行期定义文件、6 个可编译程序文件。文件数量不是本批取舍依据；实际编译数以验收记录为准。

## 消费者与关联业务

复用 `tools/tests/cloth_inventory.mjs` 的 `references()` 对当前跟踪 LPC/头文件只读扫描，得到 **6 处静态引用、6 个文件、2 处动态线索**：

| 文件 | 处理 |
| --- | --- |
| `d/beijing/npc/hu.c` | 绣花针货表路径替换；其余商品、顺序、价格及交易逻辑不变。 |
| `d/guanwai/npc/hadani.c` | 斧头货表路径替换；钢锯和原询问词不变。 |
| `d/quanzhou/npc/chen.c` | 绣花针货表路径替换；问答及问候不变。 |
| `d/guiyun/npc/nanxiren.c` | 创建并装备砍柴斧。 |
| `d/huanghe/npc/qian.c` | 创建并装备丧门斧。 |
| `d/huanghe/npc/qiaofu.c` | 创建并装备大斧头。 |
| `d/changan/npc/fujiang.c` | `determine_data()` 的 random(5) 最后一支为 axe；只增加该值的规范路径分支，保留五种装备的选择及随机时机。 |
| `d/beijing/npc/qianzhenglun.c` | 原 `do_yao()` 白名单不接受 axe/fork，目录拼接线索不可达；保持源码和拒绝行为，不新增领取能力。 |

因此实际需更新 **7 个消费者**。未发现本批房间刷新表的静态引用；北京大板斧、钢叉、铁掌大板斧暂未发现可达静态/上述动态消费者，仍保留其品种及显式创建、旧记录恢复能力，不新增 NPC 发放入口。

`d/guanwai/famu.c` 的 `start_work()` 和工作第 8 步以装备的 `skill_type == "axe"` 判断斧头，不识别实体路径；代码不改，隔离回归覆盖装备新品种仍被识别以及无斧时原拒绝。不是给斧头新增 `famu` 回调。

## 初始化与测试风险

- 父类均在蓝图阶段写入武器属性，实例 `init_*` 直接返回；新 provider 必须在 `virtual_start()` 获得最终身份后初始化一次，不能把中间克隆当最终实例而漏掉属性。
- AXE/PIN 默认追加 EDGED，FORK 默认追加 POINTED。4 份斧显式 TWO_HANDED，其他物品不得凭形制增加双手要求；主副手和持物限制仍由原装备系统处理。
- PIN 保留 `skill_type=pin`，不在本批改为 sword；已有战斗中的 pin→sword 处理也不改。FORK 保留 fork，CLUB 下的枪保持 club。
- 现有 `parseBlade()` 只识别数字初始化标志；本批解析需显式识别已核对的 TWO_HANDED 常量并保留原文/hash，不能泛化执行任意 LPC 表达式。
- 商店、默认蓝图、实例复合字段隔离、未知 ID、直接构造、重复初始化、UID/EUID、装备增减、旧记录恢复按现有回归验证。性能仅报告冷加载、热创建和内存真实值，不设文件数量门槛。

## 展示纠错白名单

仅以下字段允许在属性对照时出现指定差异；不改名称、ID、输入别名、单位字段、数值和行为，原快照保持原文：

1. `sangmen_fu` 的 long：`这是一杆三尖开刃的三股叉。\n` → `这是一柄锋利的丧门斧。\n`。原名称、父类和初始化都明确为斧，修正误用的叉类描述，不据此改继承。
2. `kanchai_fu` 的 wield_msg：`$N抽出一根$n握在手中。\n` → `$N抽出一柄$n握在手中。\n`。仅修正斧头量词。

## 保留项及后续顺序

`/clone` 不纳入本轮：`clone/lonely/kuihuazhen.c`、`clone/misc/pin.c`、`clone/misc/spin.c`、`clone/tattoo/npc_item2.c`；`kungfu/class/riyue/dongfang/zhen.c` 同样保留。实施时核对它们的回调与头文件，并将具体资料补入统一台账，不只写排除数量。本批三类 `/d` 候选全部选入；实际验收后才能在台账写剩余 0。

装备迁移后续先补齐 ARMOR、WAIST、SURCOAT、SHIELD，再按已迁移分类台账评估特殊装备，包括 XSWORD；复合行为不能塞进普通武器或纯乐器数据表。非装备类别后置，不扩大到 `/clone`。

## 延后独立调整：FORK → SPEAR

用户确认先保持玩法迁移，后续以更常用的 `SPEAR`（枪类）替代 `FORK` 类别命名，并评估将枪、矛、叉纳入该体系。该方向另立方案：一并核对宏与继承类、skill_type、基本/特殊武学激发及装备检查、NPC 技能配置、玩家技能/映射与装备记录和部署回退；不只替换一个 inherit。

本批不新增 SPEAR，不改中平枪法、不把当前 CLUB 枪改成 FORK，也不预先添加兼容别名。现有枪、矛、叉的具体纳入清单及数据转换留给独立变更核定。
