# 普通棍类迁移盘点

日期：2026-10-06。状态：只读盘点和规划，尚未迁移、采集运行时观测或执行本批回归。源码基线为 `f4d88805d088d554fb59cdb60d1fb40f1d596484`；此前暗器批次用户 `updateall /` 实测为 10,078 个档案。

## 范围选择

当前 `/d` 直接继承 CLUB 的 19 份源码已逐份核对：18 份为固定初始化，1 份有死亡销毁回调。用既有严格武器解析器做只读归一化检查，18 份形成 17 组属性/显示签名；仅明教和少林齐眉棍相同。静态签名不代替蓝图/克隆实际观测，实施时继续核实。

书籍的 41 份 `skill` 属性候选包含随机标题/条件、自动加载、复合装备和自定义研读流程，不是同一种固定初始化；普通 ITEM 也尚未形成单一行为类。本批先完成可复用现有装备与迁移工具的棍类，书籍等随后独立分组，不因总数较多整类强迁。

CodeGraph 已用于定位父类；最终范围按当前 Git 跟踪源码、头文件、严格解析和 token 级引用分析核对，不把索引调用关系视为完整 LPC 语义证明。

## 18 个候选与短 ID

下表为源码常量及拟定 ID，不是运行实测。路径均省略 `.c`，迁移目标统一为 `/d/items/club/<id>`。

| 原路径 | 名称 | 规范 ID | set_weight | init_club |
| --- | --- | --- | ---: | ---: |
| `/d/beijing/npc/obj/mace` | 熟铜锏 | `tongjian` | 5000 | 25 |
| `/d/death/obj/weapon1` | 如意盘龙棍 | `panlong_gun` | 8000 | 50 |
| `/d/death/obj/weapon10` | 定海神针·破九域 | `dinghai_zhen` | 20000 | 220 |
| `/d/death/obj/weapon2` | 方天画戟 | `fangtian_ji` | 15000 | 75 |
| `/d/death/obj/weapon3` | 天雷神挡 | `tianlei_dang` | 10000 | 120 |
| `/d/death/obj/weapon4` | 玄天棍·鬼虐 | `xuantian_gun` | 20000 | 200 |
| `/d/death/obj/weapon5` | 如意棍·千钧 | `ruyi_gun` | 20000 | 160 |
| `/d/guiyun/npc/obj/gancheng` | 杆秤 | `gancheng` | 5000 | 5 |
| `/d/hangzhou/honghua/obj/tiejiang` | 铁桨 | `tiejiang` | 3000 | 30 |
| `/d/heimuya/npc/obj/shutonggun` | 熟铜棍 | `shutong_gun` | 2000 | 60 |
| `/d/huanghe/npc/obj/fork` | 三股叉 | `sangu_cha` | 5000 | 15 |
| `/d/huanghe/npc/obj/tieqiao` | 铁锹 | `tieqiao` | 7000 | 2 |
| `/d/lingjiu/npc/obj/diaogan` | 钓竿 | `diaogan` | 3000 | 35 |
| `/d/mingjiao/obj/qimeigun` | 齐眉棍 | `qimei_gun` | 3000 | 15 |
| `/d/shaolin/obj/qimeigun` | 齐眉棍 | `qimei_gun` | 3000 | 15 |
| `/d/tulong/tulong/npc/obj/flag` | 大旗 | `daqi` | 15000 | 10 |
| `/d/tulong/yitian/npc/obj/spear` | 镔铁长枪 | `bintie_qiang` | 15000 | 10 |
| `/d/xiangyang/npc/obj/mugun` | 木棍 | `mugun` | 500 | 3 |

18 个旧程序换为 1 个 `.lpc` 和 1 个 `.h`，预计净减 16 个定义文件、17 个可编译源文件。没有静态消费者的熟铜锏也保留为可创建品种，不擅自删除物品。

## 父类与实际行为边界

- `inherit/weapon/club.c` 的 `init_club` 跳过克隆，写入伤害、`flag | LONG`、`skill_type=club` 及默认动作。本批均无第二实参，LONG 在 `include/weapon.h` 中为 16。
- `inherit/misc/equip.c::setup()` 按实际重量派生躲闪属性并调用 ITEM_D。虚拟蓝图与克隆均需保持原 setup 时序，不能从静态 weight 自行重新设计派生值。
- `feature/equip.c` 分别判断 TWO_HANDED、SECONDARY 等标志。LONG 不等于强制双手，不能给棍类新增双手限制；须验证与副手武器的原切换、主手加成和卸下结果。
- 原名为木棍、桦木钓竿、熟铜棍的若干物品材质仍为 steel，镔铁长枪为 silk；保留有效字段，不根据描述“修正”数值。
- 钓竿与齐眉棍的 `shaolin=1` 保留。天雷神挡的显示名称和输入别名不改名；棍类中出现旗、枪、秤、桨不意味着新钓鱼、称重、划船或刺击功能。
- `F_VENDOR` 与 `F_DEALER` 都在 `include/globals.h` 指向 `/feature/dealer.c`。测试三家店应使用该实际父类，不误用历史 `feature/vendor.c`。

## 静态消费者

共 27 处引用、21 个文件；行号是本次规划位置，后续以冻结源码及 token 范围为准。

| 消费者 | 原行号 | 相关行为 |
| --- | --- | --- |
| `d/death/npc/wangfangping.c` | 30、31、32、33、34、39 | 六件棍类商品，保留完整混合货表 |
| `d/guiyun/npc/quanjinfa.c` | 61 | 携带并 wield 杆秤 |
| `d/hangzhou/honghua/jiang.c` | 51 | 携带并 wield 铁桨 |
| `d/huanghe/npc/caishiren.c` | 19 | 携带并 wield 铁锹 |
| `d/huanghe/npc/hou.c` | 34 | 携带并 wield 三股叉 |
| `d/huanghe/npc/sha.c` | 37 | 携带并 wield 铁桨 |
| `d/luoyang/npc/lu.c` | 21 | 鲁开货表中的齐眉棍 |
| `d/mingjiao/npc/wensong.c` | 53 | 携带并 wield 齐眉棍 |
| `d/tulong/tulong/npc/jiaozhong1.c` | 20 | 携带并 wield 大旗 |
| `d/tulong/tulong/npc/jiaozhong2.c` | 20 | 携带并 wield 大旗 |
| `d/tulong/yitian/npc/bing1.c` | 24 | 携带并 wield 镔铁长枪 |
| `d/tulong/yitian/npc/bing2.c` | 32 | 携带并 wield 镔铁长枪 |
| `d/xiangyang/npc/mujiang.c` | 21 | 木匠货表中的木棍 |
| `kungfu/class/duan/fu.c` | 65 | 携带并 wield 熟铜棍 |
| `kungfu/class/lingjiu/li.c` | 73 | 携带并 wield 钓竿 |
| `kungfu/class/riyue/feng.c` | 100、202 | 张乘风备用兵器及神木交付后重新装备 |
| `kungfu/class/riyue/yun.c` | 82 | 携带并 wield 熟铜棍 |
| `kungfu/class/shaolin/cheng-ji.c` | 64 | 携带并 wield 齐眉棍 |
| `kungfu/class/shaolin/cheng-ling.c` | 60 | 携带并 wield 齐眉棍 |
| `kungfu/class/shaolin/hui-jie.c` | 62 | 携带并 wield 齐眉棍 |
| `kungfu/class/shaolin/hui-xu.c` | 63 | 携带并 wield 齐眉棍 |

分类为三家商店、17 个普通 NPC 的携物语句、张乘风两处业务创建。没有直接房间陈设引用；不编造房间刷新迁移数量。

## 动态线索逐项判断

| 文件/函数 | 现状 | 本批处理 |
| --- | --- | --- |
| `kungfu/class/shaolin/dao-chen.c::ask_me` | inquiry 明确将“齐眉棍”映射到 qimeigun，剩余目录拼接创建 | 增加 qimeigun 的规范路径分支；其余四种兵器、门派/持有判断、15 件总库存不变 |
| `kungfu/class/shaolin/dao-xiang.c::ask_me_1` | 玩家 inquiry 仅护具，但公开函数对 name 使用相同目录拼接，无武器参数白名单 | 仅将 qimeigun 原本可创建的路径换为规范路径，保持函数行为；不新增 inquiry，不把它描述为现有玩家领取入口 |
| `d/xiangyang/npc/wuxiuwen.c::ask_me_1` | 同类公开通用函数，inquiry 仅护具；无道相的少林门派限制 | 同上，仅精确路径分支，不增加门派限制或新询问词；原库存/其他护具分支不变 |
| `d/beijing/npc/qianzhenglun.c::do_yao` | 目录前缀命中 mace 所在目录，但入参白名单不含 mace 或 club | 不修改；测试 mace/club 仍被原逻辑拒绝，不能把扫描线索当实际入口 |

合计 24 个待迁移消费者（21 静态 + 3 动态），另保留钱正伦为未改动的负面验证。动态函数只替换原已可创建的对象，不开放任意目录或新增玩家能力。

张乘风构造优先获取 `/clone/lonely/shenmu` 的唯一蓝图，无主时持用，有主时用熟铜棍。`ask_gun` 检查日月门派、任我行/向问天师承、负神及金猿棍法，按实际持有者返回、交付神木，再创建熟铜棍。须测试这些实际分支，不以编译代替行为，也不修改神木本体。

## 保留清单与台账计划

本批 `/d` 保留 1 项，另有 5 个 `/clone`、2 个 `/b` CLUB 定义不迁移；实施后加入既有台账，其他分类记录不丢失。

| 源码 | 名称 | 保留原因/区别 |
| --- | --- | --- |
| `d/luoyang/npc/obj/club1.c` | 赤金棍 | `owner_is_killed()` 销毁物品；保持专用实现和 hash |
| `clone/lonely/shenmu.c` | 南海神木 | 克隆立即销毁，唯一蓝图持有；`hit_ob` 根据金猿棍法和随机结果附加伤害；本批不迁移 |
| `clone/weapon/changqiang.c` | 长枪 | 固定初始化，/clone 范围外，显示及别名不同 |
| `clone/weapon/qimeigun.c` | 齐眉棍 | 价值 200，不等同本批价值 50 的齐眉棍；/clone 范围外 |
| `clone/weapon/qishiji.c` | 圣骑士戟 | 固定初始化，银材质、重量 30000，/clone 范围外 |
| `clone/weapon/tiegun.c` | 铁棍 | 固定初始化，直接 CLUB；注释中的 STAFF 不是实际继承，/clone 范围外 |
| `b/tulong/npc/obj/flag.c` | 大旗 | /b 范围外；long 含颜色，与 /d 版本不能直接按名称合并 |
| `b/yitian/npc/obj/spear.c` | 镔铁长枪 | /b 范围外，虽与 /d 初始化相同仍不扩大本批来源范围 |

## 限定展示文字纠错

仅修以下字段，保留旧快照；以精确旧值→新值验证，不能忽略整段描述差异。

- 两份齐眉棍 long 中“白腊棍”→“白蜡棍”，其他内容不变；不改材质或据此推断木材功能。
- 杆秤 long：“一杆闹市货物常用的杆秤。\n”→“这是一杆称量货物用的杆秤。\n”，只修不通顺语句。
- `d/death/obj/weapon4.c`、`weapon5.c`、`weapon10.c` 的 wield_msg：“刹时雷声轰鸣”→“霎时雷声轰鸣”；保留已修正的“直慑九霄”。
- 张乘风 `ask_gun` 的对话“扬扬咋们日月神教的威风”→“扬扬咱们日月神教的威风”；不改发放流程。

## 验证与数据边界

实施基线已冻结于 `tools/tests/club/baseline.json`：18 份原文/hash、27 处静态引用、4 条动态线索（3 个实际迁移函数及钱正伦负例）、24 个消费者和 9 个保留文件 hash。隔离驱动 `mud-cloth-rWHv5s` 采集全部蓝图/克隆观测，72 项检查通过；有效属性分组确认 17 品种，两份齐眉棍等价，其余有真实差异。运行期已迁移 27 处静态引用及三个精确动态分支，移除 18 份旧定义，不保留旧路径壳。

复用严格解析、真实驱动对象对照、实际装备/交易/存取函数、精确盟主记录恢复及累计十六类审计，扩为十七类。候选均无随机初始化；消费者随机或无关 NPC 基础设施仅在临时夹具隔离，并在最终报告注明替身与未覆盖范围。

性能按 18 个原路径各创建 20 次（360 实例），旧/新、新/旧、旧/新三个独立驱动组测量。结果实际执行后记录，不用预计文件数推断线上性能。正式存档、游戏进程、mudcore/FluffOS 子模块和用户无关改动均不动。
