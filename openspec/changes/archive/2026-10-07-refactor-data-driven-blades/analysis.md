# 普通刀类迁移盘点

日期：2026-10-05。基线：`b5e94cd0550cf3c44911457ae5715b9ba4cb6172`。
状态：实施中。原定义及引用已冻结于 `tools/tests/blade/baseline.json`；真实驱动旧行为采集 244 项检查通过，61 份原定义的有效属性确认归并为 52 个品种。最终集成验收另见完成后的 `validation.md`。

## 选择依据

当前源码按词法 token 识别 `/d` 下直接继承，BLADE 67、HAMMER 60、EQUIP 56、STAFF 45、WHIP 33、THROWING 33、DAGGER 24、CLUB 19。数量包含特殊对象，不是可删除数；ITEM、NPC 等混合大类不直接比较为单一行为族，本轮也不扩大到 `/clone`。

刀类数量居剩余标准兵器首位，且可复用已完成剑类的初始化、交易、记录与测试入口，因此先选刀，再按实际普通候选数量评估锤、杖等类别。历史总盘点仅作线索，不复用其中未更新的数量。

CodeGraph 已用于定位 `init_blade()`；索引未收录现有 `d/items/sword.lpc`，该文件及最新调用链直接以工作区源码为准。复用 `cloth_inventory.mjs` 的词法器和引用扫描；只读试解析使用现有严格剑解析器，临时将父类/初始化名归一，另行保留刀的第二个参数。没有改写任何被扫描文件。

## 定义清单

67 份直接定义 = **61 份固定初始化 + 6 份特殊实现**。固定初始化中，58 份只有伤害参数，3 份另有整数标志 110；均调用一次 `setup()`，实际蓝图/克隆行为仍须驱动核验。

下表列出全部 61 份候选；路径相对仓库，末尾统一省略 `.c`。连续编号是当前真实存在的文件范围，不是未来规范 ID。

| 目录 | 文件 | 数量 |
| --- | --- | ---: |
| `d/baituo/obj/` | `chaidao`、`dadao` | 2 |
| `d/beijing/npc/obj/` | `blade`、`blade1`、`blade2`、`blade3` | 4 |
| `d/beijing/obj/` | `dandao`、`zijinblade` | 2 |
| `d/changan/npc/obj/` | `blade`、`gangdao` | 2 |
| `d/city/npc/obj/`、`d/city/obj/` | 各自的 `gangdao` | 2 |
| `d/dali/npc/obj/` | `kandao`、`mandao` | 2 |
| `d/death/obj/` | `weapon40` 至 `weapon59` | 20 |
| `d/foshan/npc/obj/` | `caidao` | 1 |
| `d/guanwai/obj/` | `cwbdao`、`lengyue` | 2 |
| `d/guiyun/npc/obj/` | `jiandao` | 1 |
| `d/heimuya/npc/obj/` | `dadao` | 1 |
| `d/jingzhou/npc/obj/`、`d/jingzhou/obj/` | 各自的 `gangdao` | 2 |
| `d/kaifeng/npc/obj/` | `caidao` | 1 |
| `d/kunming/npc/obj/` | `gangdao` | 1 |
| `d/mingjiao/obj/` | `gangdao`、`jiedao`、`mutang` | 3 |
| `d/quanzhen/npc/obj/` | `gangdao` | 1 |
| `d/quanzhou/npc/obj/` | `wodao` | 1 |
| `d/shaolin/obj/` | `jiedao`、`mudao` | 2 |
| `d/shenfeng/npc/obj/` | `duandao` | 1 |
| `d/shenfeng/obj/` | `yudao` | 1 |
| `d/tiezhang/obj/` | `gangdao` | 1 |
| `d/tulong/obj/` | `duan2` | 1 |
| `d/wuguan/obj/` | `chaidao`、`juzi` | 2 |
| `d/xiakedao/obj/` | `knife` | 1 |
| `d/xiangyang/npc/obj/` | `mudao` | 1 |
| `d/xiaoyao/npc/obj/`、`d/xiaoyao/obj/` | 各自的 `blade` | 2 |
| `d/zhongzhou/npc/obj/` | `gangdao` | 1 |

固定数据初分 52 组（比较名称/颜色、重量、伤害、标志、属性，不以历史输入别名阻止归并）。可见重复包括两处柴刀、三处同款钢刀、另六处同款钢刀、明教的两把同款戒刀。真实品种数必须由旧蓝图/克隆的有效值验证，不能将该静态分组直接宣布为验收结果。

ID 采用 `gangdao`、`gangdao2`、`qing_tianyu1` 等物品含义与稳定编号的短名风格，实际命名在观测后确定；不从旧目录生成 ID，也不把长描述完整拼入名字。

## 特殊实现与初始化差异

| 保留文件 | 原行为及允许改动 |
| --- | --- |
| `d/death/npc/obj/blade1.c` | 主人死亡销毁；原文不变 |
| `d/luoyang/npc/obj/blade1.c` | 主人死亡销毁；原文不变 |
| `d/death/sky/npc/obj/jingzhongyue.c` | 特殊命中损伤；原文不变 |
| `d/sky/npc/obj/jingzhongyue.c` | 特殊命中损伤；原文不变 |
| `d/jingzhou/obj/xblade.c` | 自有 wield 命令及武功加成；原文不变 |
| `d/tulong/obj/tulongdao.c` | F_UNIQUE、F_NOCLONE、特殊命中和对砍；只允许产出 `duan2` 的路径替换及项目格式化，其他 token 不变 |

`inherit/weapon/blade.c` 的 `init_blade(damage, flag)` 在克隆阶段直接返回；蓝图设置伤害、`flag | EDGED`、`skill_type=blade` 和默认动作。三件北京刀的 110 是实际参数，不是文本噪声；`feature/equip.c` 会读取武器标志处理装备。保留完整整数及实际装备结果，不删除未识别位、不依据直觉修正规则。

`d/beijing/npc/obj/blade.c` 还使用 `unequip_msg`，其他品种可能使用 `unwield_msg`；保留原键，不借此次迁移统一拼写。公共类只复用 BLADE 与既有 EQUIP 初始化，不复制战斗实现。

## 已定位调用与回归重点

静态扫描发现 **102 处引用，分布于 82 个文件**，包括普通 NPC 配刀、房间刷新、王方平和荆州铁匠商店、屠龙刀产出断刀。统一扫描绝对/根相对/目录相对路径、宏和常量拼接；实现时固定原文和替换位置，并重新检查实际引用。

七条动态线索已逐一核查：

| 位置 | 结论 |
| --- | --- |
| `d/beijing/npc/qianzhenglun.c:do_yao` | 迁移 `blade` 分支，保留八卦门资格、总库存、个人三件限制、禁售与售价覆盖；其他装备分支不变 |
| `d/changan/npc/fujiang.c:create` | 迁移五选一中的 `gangdao`，保留随机分布和其余四分支；已迁移剑器继续正确创建 |
| `kungfu/class/shaolin/dao-chen.c:ask_me` | 迁移 `jiedao`，保留少林资格、持有检查、共享库存；其他询问分支不变 |
| `d/xiangyang/npc/wuxiuwen.c`、`kungfu/class/shaolin/dao-xiang.c` | 实际入口只发护具，不创建本批刀；不改动 |
| `d/death/npc/wangfangping.c` 的 `weapon4`、`weapon5` | 两条较短字面路径被扫描器作为前缀线索，不是动态拼接；它们不是本批 `weapon40..59`，保持不变 |

屠龙刀的 `do_open()` 是普通断刀的真实消费者：成功时生成断剑、断刀及三份书卷，然后销毁原刀剑；失败条件仍按原代码。回归应调用隔离副本中的原方法，核对数量、移动、产物及销毁，而非只测试手工 new 断刀。原判断表达式即使看似可简化也不改。

现有 `tools/tests/sword/fixtures.mjs` 会从工作区复制旧北京钢刀与长安钢刀。删除这些定义时须在旧行为测试的临时副本恢复冻结原文，并让新版调用测试使用最新实现；不能将历史夹具重新放回运行期目录，也不能靠遗漏测试掩盖依赖。

## 存档与验证边界

复用 `feature/user_storage.c` 的已登记虚拟品种检查，不放宽持用中、临时状态、禁存或食物饮具拒存。沿用 `tools/migrate_item_records.mjs` 的显式备份范围和字段：玩家背包、商店、已选旧袋、精确 `npc/meng-zhu.o` 的 weapon/armor；不扫描正式存档、不增加运行期别名或新的持久状态。

本批预计增加 61 条历史路径映射，在已提交的 916 条基础上达到 977 条；必须用合成记录复核十类共存、价格冲突、数量、幂等和回退。性能对照采用相同 61 个来源请求、每来源 20 个实例（1,220 个），至少三组独立驱动交替测量，报告绝对冷加载、热创建、内存与程序数量，不从其他类别推导成绩。

目前已完成基线采集，不声称已完成集成验收、正式存档迁移或线上部署。`data/e2c_dict.o`、`data/emoted.o` 的现有修改不属于本方案。

## 迁移中核实的历史行为

道尘以 `present("jiedao", player)` 检查是否已经持有，而原戒刀别名为 `jie dao`、`dao`、`blade`，因此正常戒刀不会命中该检查，仍可重复领取直至共享库存耗尽。新代码保留此结果；测试另构造精确别名验证既有持有检查分支，不为通过测试修改游戏别名或资格规则。
