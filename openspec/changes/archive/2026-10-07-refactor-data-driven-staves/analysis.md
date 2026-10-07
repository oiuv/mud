# 普通杖类迁移范围与核对依据

日期：2026-10-06。源码基线：`32f587a5c46c10193ad3974069ce76e07b91a2a3`。
以下范围首先由静态规划确定；实施核对结果见文末和 validation.md。正式存档未读取或修改。

## 范围与选择依据

当前受 Git 跟踪的 `d/` 源码有 45 份直接继承 STAFF 的定义，其中 37 份满足既有固定兵器初始化模式。其余 8 份的特殊行为见后文，保留原实现；本批不扩展至 `clone/` 的普通或独特兵器。

同口径初筛中，WHIP 有 32 份固定定义、DAGGER 有 23 份、CLUB 有 18 份；STAFF 的固定初始化候选数量较多，且可复用已完成的兵器生命周期及测试入口。暗器还涉及叠加数量和消耗，不能以未通过普通刀解析器判为不可迁移，也不并入本批。普通 ITEM、书籍等继续按实际行为细分，不将其总文件数当成一个同质类别的收益。

选定的 37 份文件如下，表内名称均补 `.c`：

| 目录 | 文件 |
| --- | --- |
| `d/beijing/npc/obj/` | `staff` |
| `d/changan/npc/obj/` | `gangzhang`、`shawei` |
| `d/city/npc/obj/` | `zhubang` |
| `d/city/obj/` | `zhubang` |
| `d/death/obj/` | `weapon13`、`weapon14`、`weapon15`、`weapon16`、`weapon17`、`weapon18`、`weapon19`、`weapon20`、`weapon21` |
| `d/gaibang/npc/obj/` | `staff` |
| `d/guiyun/npc/obj/` | `biandan` |
| `d/jingzhou/obj/` | `zhubang` |
| `d/kaifeng/npc/obj/` | `chaihe1`、`chuihuo`、`tiebian`、`tiejiang` |
| `d/lanzhou/npc/obj/` | `stick` |
| `d/lanzhou/obj/` | `stick` |
| `d/mingjiao/obj/` | `chanzhang`、`langyabang`、`muzhang` |
| `d/quanzhen/npc/obj/` | `stick` |
| `d/quanzhou/npc/obj/` | `huoqiang` |
| `d/shaolin/obj/` | `chanzhang` |
| `d/tiezhang/obj/` | `gangzhang` |
| `d/tulong/yitian/npc/obj/` | `tiezhang` |
| `d/village/npc/obj/` | `stick` |
| `d/xueshan/obj/` | `mugun`、`senggun` |
| `d/zhongzhou/npc/obj/` | `kusang`、`lingpai`、`zhaohun` |

## 初始化与属性归并

- 静态比较名称、重量、伤害、初始化 flag 及属性表达式后得到 **32 组**。等价预分组为：city/jingzhou 的两份 `obj/zhubang`；lanzhou 的两份 `stick` 加 quanzhen/village 的两份 `npc/obj/stick`；mingjiao/shaolin 的两份 `obj/chanzhang`。其余暂为独立品种，最终必须按原蓝图和克隆真实观测核对，不能强行凑成预估数。
- `inherit/weapon/staff.c:13` 的 `init_staff()` 忽略克隆，给蓝图设置伤害、`skill_type="staff"`、默认动作和动词；`flag` 使用参数按位或 `LONG`。选定源码均未额外传 flag，但**有效标志不是 HAMMER 的零值**，也不添加 BLADE 的 EDGED。共用程序必须继承 STAFF 并调用原初始化。
- 37 份均采用固定名称/重量、克隆绑定默认蓝图、蓝图设置属性、`init_staff(damage)` 和一次 `setup()`；没有本地使用回调。解析阶段继续严格拒绝额外继承、函数、动态表达式和初始化副作用，不因复用其他解析器而误接受异类。
- 同名竹棒仍有伤害 5/10/25、颜色、重量和价格等区别；同名禅杖有重量及 `shaolin` 等差异。长安与铁掌的钢杖也不能只按名称、重量、伤害合并，应比较全部有效数据。
- 保留原 `shaolin` 标记、材质、文案、默认值及实际数值，包括明教目录里已有的少林标记。荷兰火枪、铁鞭、柴禾、吹火管仍只有原 STAFF 能力，不从名称推导射击、鞭法、点火或吸烟功能。
- 新 ID 以简短资产名称及必要的稳定编号表达，如 `chanzhang`、`chanzhang2`、`zhubang`、`shouzhang`；这里只给命名示例，最终身份在实施基线观测后固定。数据自然排序，历史输入别名保留，来源目录只留在离线映射中。

## 调用核对

复用 `tools/tests/cloth_inventory.mjs::references()` 扫描当前游戏源码，发现 **49 处静态引用、41 个文件**，以及 **7 条动态/前缀线索**。逐项核对后三个动态入口需要迁移，预计共修改 **44 个实际消费者**：

| 文件 | 已核对结论 |
| --- | --- |
| `d/beijing/npc/qianzhenglun.c:113` | `yao staff` 在白名单内，需为 staff 增加规范路径分支；保留八卦门资格、总库存、个人配额、value/no_sell 实例覆盖 |
| `d/changan/npc/fujiang.c:70` | `determine_data()` 的五选一中 case 2 使用 gangzhang；仅迁移此创建分支，保持选择概率、staff 技能及其他四个分支 |
| `kungfu/class/shaolin/dao-chen.c:95` | 询问表中的禅杖传 chanzhang，需迁移此分支；保留少林资格、原输入持有检查、武器库存和交付 |
| `d/death/npc/wangfangping.c:30`、`:31` | weapon1/weapon2 是独立商品名称的前缀命中，不是本批动态创建；只改 weapon13 至 weapon21 的九处精确货表项 |
| `d/xiangyang/npc/wuxiuwen.c:85` | 询问表只供防具，没有 chanzhang，不新增兵器领取 |
| `kungfu/class/shaolin/dao-xiang.c:107` | 询问表只供防具，没有 chanzhang，不新增兵器领取 |

静态调用包括 NPC 配装、房间陈设和货表。重点验证：

- 王方平的九件杖类商品，以及各地货郎的手杖/竹棒：保留原货表顺序、价格、查找、付款、冷却和交付；同品种跨店销售不复制定义。
- `d/city/ma_bingqi`、`d/gaibang/chucang`、`d/kaifeng/caifang`、`d/tiezhang/bqshi`、`d/xueshan/kufang` 五处房间：按原陈设语句顺序执行，验证数量、销毁补刷和物品被携走后的原刷新行为，不修改无关 NPC 陈设。
- 丐帮、少林、归云庄、红花会等实际 NPC 配装语句：保持原属性、持用和加成；只替换规范路径，不改门派/技能/战斗。
- 钱正伦实际领取、道尘实际问询和副将实际选择/创建分支单独执行，不以函数体编译冒充业务验收。
- 其余消费者全部编译实际函数体，并由冻结原文审计每处变更；核对宏、相对路径、常量拼接及同目录动态线索。静态扫描不证明任意动态调用已被完整求解。

## 明确排除

| 文件 | 保留原因 |
| --- | --- |
| `d/baituo/obj/lingshezhang.c` | 化杖为灵蛇，涉及门派、驯兽、精力及随机成功率 |
| `d/baituo/obj/shezhang.c` | 化杖为毒蛇，条件与灵蛇杖不同 |
| `d/city/obj/shuzhi.c` | fire 回调检查环境热度、生成营火并销毁自身 |
| `d/foshan/obj/shuzhi.c` | 同类可燃树枝回调，留待独立行为组评估 |
| `d/hangzhou/obj/shuzhi.c` | 同类可燃树枝回调，留待独立行为组评估 |
| `d/kunming/npc/obj/yantong.c` | 主动吸烟、消耗烟草、恢复精力及 busy |
| `d/luoyang/npc/obj/staff1.c` | owner_is_killed 时销毁 |
| `d/shaolin/obj/fumo-zhang.c` | F_NOCLONE、check_clone 及不同初始化顺序 |

这些是本批范围排除，不是永久禁止重构；共有特殊回调可在另一个获准行为组复用。本批冻结其 hash，保证不顺带变更。

## 实施核对

隔离真实驱动的原蓝图/克隆观测确认 37 份定义可归并为 32 个品种，全部有效 flag 均为 LONG（16）；原文、观测和 hash 固化在 `tools/tests/staff/baseline.json`。49 处静态引用、三个动态入口和 44 个消费者与规划一致，8 份排除对象保持原样。

27 处 NPC 携带语句中，南希仁的扁担只执行 `carry_object()`，后续另持斧；此次仍只携带扁担，不按物品类别自动持用。消费者测试因此按原语句区分携带与持用，而不是假设所有杖类都已装备。九个商店和五处房间的原配置顺序分别执行，三个动态入口使用实际方法；完整覆盖边界及结果见验证报告。

## 复用、记录与验收边界

沿用 `d/items/hammer.lpc` 的虚拟生命周期结构，但直接继承 STAFF，初始化调用 `init_staff`；不抽出跨兵器万能工厂，不改武器父类、命令或驱动。维护文档同步到 `docs/architecture/data-driven-items.md`，不把尚未实现的杖类写成已上线。

`feature/user_storage.c` 只增加精确已登记杖类路径检查；沿用原禁止存放及状态限制，不保存原来未保存的临时状态。统一离线转换器增加 37 条映射，预计累计 **1,113 条历史路径**。仍只处理显式备份中的玩家背包、商店、明确选择的旧袋及精确 `npc/meng-zhu.o` 的两个装备字段；同品同价合并数量、价格冲突拒绝、输入不覆盖、无关字段保持和原字节恢复要求不变。

复用 `test_cloth_objects.mjs`、`compile_cloth_callers.mjs` 的类别入口，新增 `--staff` 选择和就近夹具；旧十二类冻结基线不改，历史审计仅增加本批获准变更层。所有数量与结果须在实际验证后写入 validation.md，规划期不提前勾选。

预计删除 37 份定义、新增一个程序及一张数据表，净减 **35 个运行期定义文件、36 个可编译物品源文件**，不含工具、测试或文档。性能使用三组新旧交替独立驱动、每组 37 个来源各 20 次创建（740 实例），在其他测试结束后单独测量；分别报告冷加载、热创建、驱动内存估算及程序数，不套用锤类结果。
