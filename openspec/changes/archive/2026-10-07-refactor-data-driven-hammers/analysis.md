# 普通锤类迁移范围与核对依据

日期：2026-10-06。源码基线：`9553790649746e0b8b21ef2b9dcf818fd839f242`。
本轮仅静态规划，未冻结驱动观测、未实施迁移，也未读取正式存档。

## 范围

当前 Git 跟踪的 `d/` 源码中有 60 份直接继承 HAMMER 的定义。42 份满足现有固定武器初始化模式；另 1 份在 create 中连续设置两次重量，核对实际实现后纳入，共 43 份。只替换下表定义，不扩展至 `clone/` 的普通或独特武器。

表内名称均补 `.c`：

| 目录 | 文件 |
| --- | --- |
| `d/beijing/npc/obj/` | `hammer` |
| `d/changan/npc/obj/` | `hammer` |
| `d/city/npc/obj/` | `hammer` |
| `d/city/obj/` | `bone`、`hammer`、`shitou` |
| `d/death/npc/obj/` | `jiasuo` |
| `d/death/obj/` | `weapon11`、`weapon12`、`weapon6`、`weapon7`、`weapon8`、`weapon9` |
| `d/foshan/obj/` | `shikuai` |
| `d/guanwai/npc/obj/` | `tiepipa`、`tongren` |
| `d/hangzhou/obj/` | `shitou` |
| `d/heimuya/npc/obj/` | `dafu`、`leizhendang`、`tongchui` |
| `d/jingzhou/obj/` | `hammer` |
| `d/kunlun/obj/` | `da-shitou` |
| `d/kunming/npc/obj/` | `huoqiang` |
| `d/meizhuang/obj/` | `qipan` |
| `d/mingjiao/obj/` | `shigu` |
| `d/shaolin/obj/` | `muchui` |
| `d/shenfeng/obj/` | `yufu` |
| `d/tulong/tulong/npc/obj/` | `hammer` |
| `d/tulong/tulong/obj/` | `stone` |
| `d/tulong/yitian/npc/obj/` | `tongbo` |
| `d/village/npc/obj/` | `hammer`、`hothammer` |
| `d/wanjiegu/npc/obj/` | `muyu` |
| `d/wudang/obj/` | `shitou` |
| `d/wudu/obj/` | `tiezhui` |
| `d/wuguan/obj/` | `chutou`、`piao`、`saozhou` |
| `d/xiyu/obj/` | `yaochu` |
| `d/xueshan/obj/` | `falun`、`gangchu`、`jinlun`、`yinlun` |

## 属性归并与初始化

- 现有字段静态比较得到 40 组。三份 `d/city/npc/obj/hammer`、`d/city/obj/hammer`、`d/jingzhou/obj/hammer` 等价；`d/city/obj/shitou` 与 `d/hangzhou/obj/shitou` 等价。正式归并须以冻结原文、别名和蓝图/实例真实观测复核；不能把静态分组当成运行验收。
- 铁锤之间仍有价格 3/300、伤害 15/25、显示文案等差异；大石头之间仍有颜色、重量和材质等差异，不仅按名称归并。短 ID 如 `tiechui`、`tiechui2`、`shitou`，最终语义命名在实施中固定且自然排序。
- `d/tulong/tulong/npc/obj/hammer.c` 连续执行 `set_weight(160000)`、`set_weight(20000)`，中间没有依赖重量的操作。`feature/move.c::set_weight` 在无环境的构造阶段直接赋值，因此预期有效重量为 20000，不是 160000 或两者之和；实施时仍分别用原蓝图和克隆验证。去除这次被覆盖的写入是语义等价整理，不是调整重量。
- 全部选定对象以固定 `init_hammer(damage)`、一次 `setup()` 结束。HAMMER 的初始化会忽略克隆，最终虚拟蓝图应先设置定义再调用；继承原默认动作、技能类型和 flag，不照搬 BLADE 的 EDGED 行为。
- 骨头、斧头、石头、金火枪、铁琵琶和水瓢按真实 HAMMER 行为处理，不按名称增加食用、射击、演奏或装水能力。旧材质、`stable`、`no_sell`、`shaolin`、`unequip_msg` 等原值、缺省与拼写均保留。

## 调用核对

复用 `cloth_inventory.mjs::references()`，从当前游戏源码得到 **55 处静态引用、45 个文件**，并有 6 条动态前缀线索。包括 NPC 配装、房间 objects、商店货表、任务工具、奖励替补及随机 NPC 来源。

动态线索逐项处理：

| 文件 | 当前核对结论 |
| --- | --- |
| `d/beijing/npc/qianzhenglun.c` | `yao hammer` 在原白名单内，必须为 hammer 增加规范路径分支；原门派、配额、个人计数、no_sell/value 覆盖均保留 |
| `d/changan/npc/fujiang.c` | 现有随机项没有 hammer，匹配来自目录前缀，不新增装备选项 |
| `d/death/npc/wangfangping.c` | `weapon1` 是已有独立商品，与 weapon11/12 的前缀相同，不是动态拼接；只迁移本批六个明确商品 |
| `d/xiangyang/npc/wuxiuwen.c` | 原询问表只包含防具，没有本批 muchui，不扩展领取入口 |
| `kungfu/class/shaolin/dao-chen.c` | 原询问表没有 muchui，不扩展领取入口 |
| `kungfu/class/shaolin/dao-xiang.c` | 原询问表只包含防具，没有本批 muchui，不扩展领取入口 |

预计修改 46 个实际消费者（45 个静态文件加钱正伦），实施前冻结原文与命中位置，并补查相关目录/文件名及可能的拼接引用。线索扫描不是对任意动态调用完整性的证明。

具体回归重点：
- 冯铁匠的普通铁锤买卖和烧红铁锤配装，仍使用既有 smith 行为，并回归村庄启动。
- 王方平货表中的六个普通锤，保留货表顺序、价格、付款与交付，其余商品不变。
- 武馆武修文的锄草、浇地、扫马房工具，验证领取条件、重复领取拒绝、原输入 ID、使用及归还；不能让同名水瓢成为饮具。
- 黑白子、范松的独特武器仍在 `clone/lonely/`，只迁移普通替代品的创建，不改独特物品获取、归还和识别逻辑。
- 房间刷新、NPC 持用、背包/玩家商店、盟主装备重建均通过原业务入口验收；原有存放限制不放开。

## 明确排除

15 份 HAMMER + F_FOOD 复合食物、1 份 HAMMER + MI_QIN 乐器、1 份死亡销毁武器继续保留原源码，不是永久禁止重构：

- `d/changan/npc/obj/jitui.c`
- `d/chengdu/npc/obj/jitui.c`
- `d/city/npc/obj/jitui.c`
- `d/city/obj/jitui.c`
- `d/dali/npc/obj/yaoqin.c`
- `d/jingzhou/npc/obj/jitui.c`
- `d/jingzhou/obj/jitui.c`
- `d/kunming/npc/obj/jitui.c`
- `d/luoyang/npc/obj/hammer1.c`
- `d/quanzhen/npc/obj/jitui.c`
- `d/wudu/npc/obj/jitui.c`
- `d/wudu/obj/jitui.c`
- `d/xiakedao/npc/obj/jitui.c`
- `d/xiakedao/obj/backleg.c`
- `d/xiakedao/obj/forleg.c`
- `d/xiakedao/obj/zhutou.c`
- `d/zhongzhou/npc/obj/jitui.c`

`d/city/obj/jitui.c::finish_eat()` 原地改变鸡腿名称和重量，不通过 `d/city/obj/bone` 创建残余；迁移静态骨头不改复合食物链路。

## 复用与验收边界

沿用 `d/items/blade.lpc` 的已验证虚拟生命周期方式，但继承 HAMMER；复用严格解析、调用审计、真实驱动测试、调用编译和离线转换工具，不新增通用工厂或第二套执行器。加入本批映射后预计累计 **1,076 条历史路径**；条数不等于规范品种数。

删除 43 份旧定义、新增一份公共程序和一份数据表，预计净减 **41 个运行期定义文件、42 个可编译物品源文件**，不含测试/工具。性能按全部 43 个来源请求、每来源 20 个实例（860 次）做独立驱动新旧对照，分别报告冷加载、热创建、驱动内存估算及共享程序数，不用历史批次数据冒充本批结果。正式存档预览/转换和上线由维护流程另行执行。
