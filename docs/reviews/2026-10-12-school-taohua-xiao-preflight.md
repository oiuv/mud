# 桃花岛啸沧海有限补采预检

最新共享接线和实测状态见[采集进度](2026-10-12-school-taohua-xiao-progress.md)；下文保留准备阶段记录，不能用旧“未注册”状态或自检数量代替当前实测状态。

2026-10-12。独立准备 **17 条件／720 正式计划／34 烟雾计划**；目前仅新增条件、原记录校验、合成自检和本页，尚未注册共享入口，未启动驱动，**本组真实采集数为 0**。本页不表示桃花岛完成，也不改变 `collect-martial-arts-dataset` 的 10/17 任务状态。

## 范围与既有证据

本组只执行原命令 `perform finger.xiao right`，即弹指神通“啸沧海”。它直接造成精神损伤、有效精神创伤和目标内力变化，不经过 `COMBAT_D->do_damage()`；不因俗称“直接攻击”而混入既有气血直伤统计。

- [桃花岛既有预查](2026-10-11-school-taohua-preflight.md)提供门派和教学来源关系；[历史证据可用性](2026-10-11-martial-evidence-availability.md)已记录旧桃花教学 `Llkk2C/dG5RVN`、九阴交书 `jxdG9I/rWmRgC` 缺根元数据及原事件。保留原报告，不称其原件已经重新核验，不为补目录重采，也不把新样本加进旧系列分母。
- [弹指定向急修](2026-10-11-tanzhi-action-fix.md)已修动态“极意”初始化。本组采用 `c44de8f2605101bf27ed8c3e46a78fe8a52be561` 基线；不执行普通 `query_action()`、`hit_ob()`、`valid_damage()` 的效果测试，不以这 720 条计划重复宣称 166 项急修验收。
- 不重复原 95 条件／190 样本传招和 45 条件／90 样本交书教学，不加入 `ding/po/zhuan`、自然解忙、原 NPC 闭包或门派交锋。黄药师资格仅作为输入依据，本次不实际扣贡献或发放授课奖励。

独立模块为 [school_taohua_xiao_cases.mjs](../../tools/tests/martial_data/school_taohua_xiao_cases.mjs)，自检为 [school_taohua_xiao.test.mjs](../../tools/tests/martial_data/school_taohua_xiao.test.mjs)。前缀 `school-taohua-xiao-`，`collection_group=taohua-xiao`，方法 `perform`。

## 真实来源与必要输入

[黄药师](../../kungfu/class/taohua/huang.c#L137)的询问“啸沧海”连接原 `ask_skill8()`；同对象 [战斗闭包](../../kungfu/class/taohua/huang.c#L168)使用 `finger.xiao`。[原传授](../../kungfu/class/taohua/huang.c#L642)要求桃花岛、尚未领悟、贡献 800、有效内功 280、最大内力 3000、弹指及经络学各 200；已学判定与原奖励另属教学记录，不在本组冒充实际取得。

实际链路为 [perform 命令](../../cmds/skill/perform.c#L101) → 激发的弹指神通 → [公共技能分发](../../inherit/skill/skill.c#L109)的 `present("right")` → [xiao.c 原 perform](../../kungfu/skill/tanzhi-shentong/xiao.c#L8)。原命令仍处理拒绝、返回和受理后的随机熟练增长，不用直接调用绝招函数替代玩家入口。

两个角色均为相连、非巫师的真实 USER 夹具；原 `set_name()` 建立 `left/right` 别名，不能只改 `id` 字段。基本输入固定如下：

- 施术者空手且无副手、无手持物；原指法激发并准备弹指神通，内功激发碧波神功。指法及弹指分别为 200／400／800；经络学、基本内功、碧波均为 200。有效内功为 300，满足原传授的 280 条件。`can_perform/tanzhi-shentong/xiao=1` 仅是实验资格。
- 施术者最大内力 3000、当前内力 800；先天膂力／悟性／根骨 36、身法 34，经验 100000000、加力 0，气血及精神各三值均为 10000。身法及基本指法不低于[弹指原学习门槛](../../kungfu/skill/tanzhi-shentong.c#L74)。不配置 `martial-cognize`、强化或毒素。
- 中性靶基本内功／闪躲／招架 600、剑法 200，无特殊映射或准备；气血、精神、内力相应上限和当前值均为 10000。采用现有标准测试剑，重量 3000、伤害 50、耐久 100、标志 4；持剑带来的闪躲 `apply=-1` 按实际有效等级计入。护甲仍是现有夹具的 100。
- 除“未交战”拒绝外，复用原 `kill_ob()` 关系。昏迷拒绝先实际调用原 `unconcious()` 并保存准备前后与唯一昏迷事件，之后才清准备计数并开始本样本；不得把准备导致的气血／精神归零算作啸沧海伤害。

等级仅用于限定输入，不证明玩家自然成长到该等级的可行性或成本。800 级仍采用最小 3000／800 内力资格，不代表该阶段的典型配功。

六份关键来源 SHA-256 已由独立自检核实；完整运行时仍须冻结整套实际游戏依赖、夹具、工具与驱动，不能用本表替代系列清单：

| 来源 | SHA-256 |
| --- | --- |
| `kungfu/skill/tanzhi-shentong.c` | `23b04a8fe57b58d944011d8cce26f9e2afe2228ce2324421586a2183534ece1f` |
| `kungfu/skill/tanzhi-shentong/xiao.c` | `0ddd6ce7977822f455c942a6adbee7359ece66baf541fbda22f7bb85d911eddb` |
| `kungfu/class/taohua/huang.c` | `f5f2ad95ea9bf005b288d81ae9a67457d780b350dbf45865d66c08ec81b9af1e` |
| `feature/skill.c` | `99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8` |
| `feature/damage.c` | `1a57abfa577c4043909cf6f443fd070fb51b3128c4e33ed070809862db200a53` |
| `cmds/skill/perform.c` | `7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054` |

模块列出 26 条实际 `qualification_sources`，包含命令、技能分发、损伤、dbase、忙乱、人物、装备及头文件。`<ansi.h>` 的实际文件是 `mudcore/include/ansi.h`，并非不存在的 `include/ansi.h`。条件保存原能力及本体路径／摘要／入口；共享接入时这些来源必须出现在真实冻结清单中，不仅读取元数据就宣称副本完整。

## 固定矩阵

下表的正式次数只区分随机行为和确定性检查；短烟雾每条件两条，不纳入正式分母。

| 条件后缀 | 条件数 | 正式计划 | 控制变量 |
| --- | ---: | ---: | --- |
| `l200/l400/l800-baseline` | 3 | 300 | 三档各 100；目标基本内功 600，有效 300 |
| `l200-force298` | 1 | 100 | 只改目标基本内功至 298，有效 149，原比较保证命中 |
| `l200-force898` | 1 | 2 | 只改目标基本内功至 898，有效 449，原比较保证失手；仍是受理 |
| `l200-target-neili0/899/900` | 3 | 300 | 相对 `force298` 仅改靶内力，各 100，观察原归零边界 |
| `l200-no-grant/no-fight/sword/skill199/jingluo199/no-prepare/max-neili2999/neili799/unconscious-target` | 9 | 18 | 每次只破坏一项既定资格，各两次原拒绝 |
| 合计 | **17** | **720** | 烟雾 **34** |

计划分类为 702 受理观察／18 拒绝，烟雾为 16／18；**这些不是命中数**。800 级和确保命中条件仍有原随机伤害，不减少为两次。未增加不合法的“无主手但有副手”状态；当前矩阵不穷举命令公共门禁或其他武学错误映射。

完整有序条件的 SHA-256 为 `JSON.stringify(conditions)` 字节摘要，不是任一运行系列的 fingerprint 或原事件摘要：

- 正式：`e6852c55078ec1899c9981b3f259d6f2633e8f5d668ea4fb298cc3e37bd2539d`。
- 烟雾：`fb35782bfa6fbeb886ddf1918d2db2555a63133a1d4205fd73630ac5d54590e4`。

## 原计算与统计口径

依[有效技能](../../feature/skill.c#L135)，`A=有效指法`，`P=目标有效内功`。本组合法空手的 A 分别为 300／600／1200；基准 P 为 300。原 [xiao.c](../../kungfu/skill/tanzhi-shentong/xiao.c#L48)先取 `D=A+random(A)`，再以 `floor(A/2)+random(A)>P` 判定命中：

| 观察量 | 原命中分支 | 原失手分支 |
| --- | --- | --- |
| 命令受理／发动 | 1／1 | 1／1 |
| 施术者即时忙乱 | 3 | 4 |
| 目标精神减少 | `floor(4D/3)` | 0 |
| 目标有效精神减少 | `floor(D/3)` | 0 |
| 目标内力毛扣 | `3D` | 0 |
| 目标内力归零修正 | `max(3D-N,0)`，N 为初始内力 | 0 |
| 目标内力净减少 | `min(3D,N)` | 0 |
| 施术者内力消耗 | 0 | 0 |

[receive_damage／receive_wound](../../feature/damage.c#L26)使用原逻辑；本组高精神池避免伤至负数或有效精神反过来截断当前精神。`max_jing` 不变，精神损伤和有效精神创伤不能合为一个数。

目标原 `add("neili",-3D)` 经 [dbase 的 set](../../mudcore/inherit/dbase.c#L112)进入已有 USER 资源计数；负数再 `set("neili",0)` 会增加 `neili_recovery`。报告将后者明确命名为“归零修正”，不是疗伤。只验证净差会漏掉零内力靶的毛扣，本组同时检查两项单向计数及前后快照。

没有新增随机探针。命中时由已观察的 `neili_cost/3` 反推整数 D，再独立核对精神／创伤及原支持区间 `[A,2A-1]`；失手时 D 虽在源码中先抽取，但没有可据以还原的效果，`damage_draw=null`，不能填 0。基准三档理论命中概率为 149/300、599/600、1，仅是源码推导，不用预计频率拒绝合法随机样本。

[原命令](../../cmds/skill/perform.c#L119)在受理后另以 `random(120)<有效弹指神通` 调用[原弱模式熟练增长](../../feature/skill.c#L255)。本组未配置武学修养，增量为 1；200 级可为 0 或 1，400／800 级保证为 1。失手仍可能增长；拒绝不得增长，原技能等级不得变化。这里不是黄药师传招的 1500000 点奖励。

`taohuaXiaoEffects(rows, frozenCondition)` 只汇总同一冻结条件：

- `observed/refused/error` 分列，命中率分母为已受理样本，使用现有 Wilson 区间；拒绝与错误不算普通失手。
- 精神伤害、创伤、目标内力毛扣、归零修正、净差、剩余内力、施术者消耗、忙乱和熟练各列分布；不是普通攻击次数或连击率。
- 错误样本的效果未知，不制造零费用；空分母为 `null`。失手 D 不可还原，单独计入分布的 unknown。
- 原 `raw` 没有 `parameters`；合成测试即使塞入错误 `raw.parameters`，统计仍必须使用独立传入的冻结 condition。报告还须保留计划、实际数、拒绝和诊断，不能仅展示均值。

## 原始记录契约与最小共享接点

现有两个连接、`force_me`、发动／拒绝观察、`before/immediate/after`、单向资源计数以及原昏迷准备足以覆盖本组；**不新增探针、时间推进或执行框架**。以下只是待单一写者实施的接点清单，本次未修改共享文件：

1. `school_combat_cases.mjs` 追加本组 generator／validator，保护全部旧条件有序摘要；`execution.mjs` 明确冻结本模块及依赖。真实采集前保全实际 MJS 字节和其词法依赖，报告／统计的清单外模块不得漏存或冒充已经在旧清单里。
2. `runner.lpc` 的本组快照只补 `cultivation[can_perform/tanzhi-shentong/xiao]`、`secondary_weapon/details`、实际 `fighting_opponent`。继续使用 `named_participants` 的原 `set_name`；对确切靶检查 `id("right")` 和 `present("right", room)==target`，避免再次将 `set id` 当作别名。
3. 本组加入既有“交战时原昏迷准备”和“准备 terminals 单独保存／清除”白名单；测量前重新计数，不把准备的损伤或终态带入正式窗口。原准备必须记录对象身份、正常到昏迷转换、初始资源、唯一 `side=1/unconscious`，且准备后快照等于样本 before。
4. 报告按冻结 condition 调用本组 effects，单列精神／创伤／内力边界表，不使用假定 actor 气血伤害的通用表替代，也不把整数忙乱解释成已经观察到的自然秒数。

无需新增动作表或 COMBAT 详细事件观察：`attacks/passives/defenses/dodge_checks/interfaces/dropped/terminals/callbacks` 是现有实际记录，本组须为空，公共 `direct/quick/riposte/heartbeats` 计数为零。当前组未启用的 `actions/directs` 明细缺席不被伪造成“已观察空数组”；若出现则不得携带非空事件。

每份有效原件均检查两角色真实身份、实际等级／map／prepare、原装备及前后同物品、资源毛计数、熟练映射、launch 的 `actor/skill/argument="xiao right"`，拒绝的同源原文另核。`null/0` 只用于明确无忙乱或未领悟的已存在字段；缺键、`undefined`、字符串、布尔值、数组和对象不能冒充零。熟练必须为映射，存在项为非负整数。已配置数值资源必须保留实际整数，不能把未观察值补成 0。

## 本轮验证与接续门槛

独立 `node --test tools/tests/martial_data/school_taohua_xiao.test.mjs`：**18/18 通过，0 失败**。测试只对两份明确游戏源码词法定位入口，并核对 26 条资格来源文件；没有全库扫描、旧账本导入、驱动启动或玩家数据读写。

合成自检覆盖全部 17 条件，原比较必达／必失边界、三种整数余数与伤害端点、低内力毛扣和修正、相同净差伪造、九项拒绝、原昏迷准备隔离、明确空值与缺键、实际有效等级／装备不变、原命令熟练、即时与心跳分离、错误／空统计分母。首次自检的唯一失败是资格列表误写 `include/ansi.h`，已更正实际 `mudcore/include/ansi.h` 并复测；不是游戏样本错误，也没有失败系列。

共享接入以后仍必须先在**新独立系列**执行 34 条真实烟雾，核对原 JSON 空值、拒绝串、资源计数、准备事件、别名定位和无附加战斗；通过后才运行同版 720 条正式计划。两轮都须核对冻结源码／夹具副本、驱动身份、原事件／请求／台账、日志诊断与结束标记。合成 18 项不能代替这两轮，当前计划不加入全局已采数量。

## 命令返回值契约补正（未采样）

此前合成自检只使用成功值 `1`，遗漏了原 [force_me](../../feature/command.c#L117) 直接返回 `command()` 正执行成本的语义；成功值并不固定为 `1`。这是独立采集校验器的错误，不是武学或驱动行为错误。本次只修正单命令 `raw.command_accepted`：键必须存在、值必须为非负安全整数，以大于零表示受理，以零表示拒绝；原始成本不归一化，也不与技能资源消耗混算。NPC 闭包返回值、聚合命令字段及游戏代码均未调整。

新增两项离线自检覆盖全部固定条件：成功成本 `1/23/476`、缺键／未定义／null／错误类型／负数／非整数／非有限值／超安全整数，以及成功零成本和拒绝正成本的反例。相同原记录在三种合法成本下得到相同统计，受理分母不累计执行成本，验证及统计不回写原记录。本组现为 **20/20 通过**；七组串行合计 **122/122 通过、退出 0**，不是 122 条真实游戏样本。

原有 17 条件／720 正式计划／34 烟雾计划和两份完整有序条件 JSON 指纹保持不变，旧准备文件已由主控另行保全。上述历史自检结果保留；当前仍未注册共享执行，也未启动驱动或采集真实样本，后续烟雾／正式门槛不变。
