# 桃花岛「定昆仑」有限采集预检

最新接线与真实代表条件见[采集进度](2026-10-12-school-taohua-ding-progress.md)；以下保留准备阶段记录，不能作为当前实际样本数量。

状态：独立条件与离线校验准备完成，**未注册共享入口、未运行驱动、没有实际样本**。仅新增本页及 [条件模块](../../tools/tests/martial_data/school_taohua_ding_cases.mjs)、[自检](../../tools/tests/martial_data/school_taohua_ding.test.mjs)。不改游戏、存档、既有采集输入或旧证据。

## 1. 范围与去重

原招式中文名为「定昆仑」，入口是 `perform finger.ding right`，不是「弹指破甲」，也不是普通指法攻击。沿用 [桃花岛预检](2026-10-11-school-taohua-preflight.md) 的弹指机制子组。本组不重复已采教师学习、旧兵器入口、参合指／弹指神通动作表空值急修或相邻 [「啸沧海」准备](2026-10-12-school-taohua-xiao-preflight.md)；急修回归不当作本组实战样本。

只验证两个真实连接、非巫师 USER 的单次原命令及一个自然解禁窗口。技能和领悟是实验资格，不声称玩家已经完成黄药师的学习／传授。没有 NPC 对战、连续战斗、自然忙乱解除、次武器独占诊断、死亡目标或跨配装全排列。

## 2. 原入口、作用与整数结算

- [ding.c:15–50](../../kungfu/skill/tanzhi-shentong/ding.c)：先检查领悟、战斗关系、主／副手空手、目标未被禁招、弹指神通与经络学各至少 120、激发与互备、内力上限至少 1500、当前内力至少 300、目标存活。目标忙乱的旧检查是注释，不能恢复成采集前置门槛。
- [公共 perform](../../cmds/skill/perform.c)：施招者忙乱、施招者禁招在 `main()` 早拒绝；未激发 `finger` 在 `do_perform()` 拒绝，根本没有进入 `ding.perform()`。它们与本招内部拒绝分开。原领悟拒绝与未激发拒绝提示不是同一入口。
- [ding.c:55–81](../../kungfu/skill/tanzhi-shentong/ding.c)：`AP = 有效 finger`，`DP = 有效 parry`；`AP/2 + random(AP) > DP` 才命中。命中输入伤害为 `AP/4 + random(AP/2)`，进入 `do_damage(REMOTE_ATTACK, damage, 0, final)`，施招者耗内力 200、忙乱 2；失手耗 150、忙乱 1，但依然返回成功受理。不能把受理分母叫命中分母。
- [ding.c:85–105](../../kungfu/skill/tanzhi-shentong/ding.c)：`final()` 设置目标 `no_perform=1`，由本技能 daemon 的 `call_out("ding_end", 1 + random(5), me, target)` 删除。**禁招不是忙乱**。即时样本没有观察这个解除，不能记成零秒。
- [combatd.c:1002–1179](../../adm/daemons/combatd.c)：REMOTE 不走普通徒手／持器命中回调及相应招架／实物护甲分支。加力满足原内力条件时另扣 `jiali`，增伤 `jiali * damage / 200`；此后还有膂力、悟性和高伤压缩，最终 `receive_damage("qi", ...)` 才是实际掉血。输入伤害、实际气血、有效气血、招式费用、加力费用独立校验。
- [attribute.c:9–70](../../feature/attribute.c)：有效膂力取六门基本徒手最高修为 `/10`，有效根骨含基本内功 `/10`。本组先天值均 36，无纹身、转世或临时膂力；200 级角色的有效膂力是 56，不是 36。
- [combatd.c:1063–1065](../../adm/daemons/combatd.c) 会调用目标的原 `interrupt_me(target, 4 + random(4))`；[mudcore 原动作接口](../../mudcore/inherit/action.c) 在默认 `interrupt=0` 下恢复原忙乱。因此代表条件 `busy=50` 必须仍为 50，不可当作本招额外施加 4–7 秒控制，也不清零迁就校验。
- [原弱熟练链](../../feature/skill.c) 由公共 `perform` 在受理后调用：200 级及最低资格允许原随机的 0／1 点进度，400／800 级本组有效特殊武学已足够，必增 1。拒绝不成长、不升级；该进度另记，不混入伤害。

本组两方性格固定为「光明磊落」，目标没有特殊招架／内功映射、实体护甲或主动行为，仅有原夹具 `apply/armor=100`，不触发狡黠性格的忙乱减免。本组 `percent=0` 实际无创伤，但**不外推成所有目标与所有公共回调状态下都无创伤**。所有随机保留，不强行追求某次命中。

公共未激发提示存在一处静态描述候选：`to_chinese("finger")` 从公共字典原样得到「基本指法」，原 `[4..7]` 在所测驱动提交 `328aaf10635ef8ce636b2b6cebd549bb165e462d` 的 `src/packages/ops/ops.cc:659–746` 使用 `EGCSmartIterator`，索引从 0 开始，四字以外的区间为空。因此预期原串是 `你现在的(finger)中并没有这种外功。\n`，不是「你现在的指法…」。本模块按此源码推导校验原拒绝同源，不修改游戏提示；实际原串仍待后续烟雾核对，未宣称实测复现。字典与两层中文转换来源也已纳入完整 SHA。该提交 `ops.cc` 的 Git blob 为 `31d4d54c25b12951c7796f8bd211bff75e5ceb4a`，原字节 SHA256 为 `a640641fe57655b77a72ea45be8b91af2716a54b7340471581ea65f923b4c2a1`。

## 3. 固定小矩阵

共 **22 条件／730 正式计划／44 烟雾计划**；烟雾仅将每条次数改为 2，参数不变。

| 条件 | 条数 | 正式数 | 核对边界 |
| --- | ---: | ---: | --- |
| 基准 200／400／800 | 3 | 300 | 基础与特殊指法同级，有效 AP 为 300／600／1200；目标有效招架 300 |
| 合并最低合法资格 | 1 | 100 | 基本指法／弹指 120、经络 120、上限 1500、内力 300；目标有效招架 89，原判定必过 |
| 原判定必命中 | 1 | 100 | 200 级，目标原招架 298 → 有效 149 |
| 原判定必失手 | 1 | 2 | 200 级，目标原招架 898 → 有效 449 |
| 加力 50 | 1 | 100 | 必命中，内力总扣 250 = 招式 200 + 加力 50 |
| 目标原忙乱 50 | 1 | 100 | 必命中，禁招置位而原忙乱保留 |
| 原 `ding_end` 自然解除 | 1 | 2 | 必命中，原随机 1–5 秒调度；六秒观察窗只验机制 |
| 本招内部拒绝 | 10 | 20 | 未领悟、不在战斗、持剑、目标已有禁招、特殊 119、经络 119、未互备、上限 1499、内力 299、原昏迷目标 |
| 公共命令拒绝 | 3 | 6 | 未激发、施招者忙乱 2、施招者已有禁招 |

所有伤害观察的初始气血／精神池均为 10000，不借助死亡、钳位或低血修正通过。正常条件施招者当前内力 300；目标持夹具测试剑，只用于固定装备快照，不攻击、不磨损。原昏迷准备单列前后快照与准备终态，正式窗口不计准备损失。

完整有序条件的 SHA256 口径为 UTF-8 `JSON.stringify(conditions)`，不是台账递归排序的 `digest()`：

- 正式：`0fc7550bd2d034e5557e9eaba77d1d7e87de9e3c6baaedfd53363b8246950c11`
- 烟雾：`60b1984b8a1c996afb99ee0d7594b3a0b9b4aa23e88df5f2ff06e26cb5cdf624`

准备中的第一版摘要为正式 `23593f12042eb042bdaefcc7ba30bbc48e188637fe8da5095881357934f0e7cf`、烟雾 `99a3d1d6335dcb5002c8894c5a69f1990e2e68577ffbe45cc0883394f1ebea0b`。追加中文转换／字典三份来源 SHA 后得到上述最终摘要，22 条数值、资格、顺序、时钟、样本量未变；两版都不是已运行系列，不回写旧证据。

## 4. 后续最小共享接线（本轮未实施）

1. 在既有 school-combat 注册本组，严格重建／核对冻结条件；显式冻结模块、测试、报告、statistics 及其实际依赖。旧条件完整有序摘要不动。报告调用 `taohuaDingEffects(rows, condition)`，不能读取被删去的 `raw.parameters`，不覆盖公共 `sides`。
2. `prepare_actor` 仅为本组复用原 `set_name`，断言 `present("right")` 与实际 target 对象一致；复用已存在的合法原 `enable finger tanzhi-shentong` 冷加载／激发恢复路径，不补技能、不直接执行本招冒充玩家命令。首个合法条件的基本指法已配置。基础动作表并不参与本次 REMOTE 伤害计算，不把其首载数值当作本招效果。
3. `snapshot` 本组扩展：实际领悟、性格、战斗关系、主／副手详情，以及显式 `no_perform` 读取。键已存在的 `null`／整数 `0` 表示未设置假值，缺键或未知类型不能补成零；资源、计数与数量仍要求原整数。仅允许本矩阵已有的 `no_perform=1` 与 busy 初态，保留原 `start_busy` 默认中断器。
4. 复用原 `unconcious()` 准备及杀意关系保留，记录准备前／后和终态，在正式计数前隔离。不得把目标唤醒或清忙乱来避免拒绝。正式 `before`、`immediate`、`after` 都保留身份、原始／有效修为、激发、互备、资源、武器、禁招与忙乱。
5. 复用现有 `launchProbes` 和失败证据。公共 `main()` 的忙乱／禁招早退发生在既有 `do_perform` 失败观察之前，仅为本组补一次实际 `query_notify_fail()`／既有原失败读取路径，保留原提示；没有进本招就不能记录技能 launch。不得以空 reason 填推断文案。
6. 复用已存在 `do_damage` 实参观察与资源计数，不添加第二个伤害探针。`directs` 必须含原 actor/target、type=2、damage、percent=0、weapon 与 weapon_object；实际 `qi_cost` 和 `neili_cost` 来自原计数。REMOTE 窗口不允许伪造普通 attacks、passives、defenses。
7. 仅在隔离副本的 `ding_end` 入口／原 return 前增加唯一、可逆的前后观察，复用 `observe_callback`；本组字段为 `owner`（原 daemon）、`function=ding_end`、side、phase、elapsed、原 target snapshot。原 `call_out` 行、函数正文、随机与延迟不改。只接受本样本精确 target，忽略已销毁旧 target 的残留回调；不得为了过测移除当前有效回调。
8. 六秒自然窗复用现有 finish 调度；`strategy` 对非 bout 的普通战斗心跳保持原有抑制，不改角色原忙乱、不合成解禁事件。此处证明 daemon 自然删除 `no_perform`，**不证明角色忙乱自然结束**。回调必须成对同源，实际时间有序并位于观察窗内；除该字段外，目标回调前后状态严格相同。

计时依据额外核对所用驱动对应提交 `328aaf10`，而非当前可能不同的 FluffOS checkout：`src/packages/core/call_out.cc:146–155` 使用 gametick 目标；`src/backend.cc:42–44` 按配置 tick 向上换算。原声明延迟与 `time_ns` 实际测时分开，不能硬要求每个一秒调度都等于整一秒墙钟；本组不强制时间、不估延迟分布，也不替换为 `call_out_walltime`。

## 5. 离线验收与未证明项

执行：

```powershell
node --check tools/tests/martial_data/school_taohua_ding_cases.mjs
node --check tools/tests/martial_data/school_taohua_ding.test.mjs
node --test tools/tests/martial_data/school_taohua_ding.test.mjs
```

14 项定向测试覆盖：22 条合成协议；2,580 组输入伤害与悟性整数支持集；资源毛扣／净差；有效膂力与根骨；原忙乱 50；显式 null／0 与缺字段；普通攻击／错类型／错对象／磨损拒绝；原昏迷准备；弱熟练；禁招回调归属／顺序／时间／同源状态；公共与内部拒绝分母；冻结 condition 报告；真实 `createSeries`／`openSeries` 的正式与烟雾计划及非法 ID／入口／变更身份负例。测试只创建新的临时计划台账，不写合成样本到正式证据目录。

首轮测试仅因误导入台账私有函数 `validateConditions` 失败，已改为真实公开 `createSeries/openSeries` 验证，不扩大台账接口。最终定向 **14/14、退出 0**（Node 测试摘要 782.309 ms），两份 MJS 语法检查通过，三文件 UTF-8／LF／尾空格与 13 个文档链接检查通过。未修改任何 `.c/.lpc/.h`，本轮无 LPC 格式化对象。

接线前有限复审发现旧 14 项合成用例只给 `command_accepted=1`，没有覆盖原 `force_me()`／`command()` 成功返回正执行成本的边界。校验器此前把成功值硬锁为 1，这是离线工具预期缺陷，不是游戏错误。现仅改为要求键存在且值为非负安全整数，以 `>0` 判受理、以 `0` 判拒绝；不改写实际成本，统计仍按受理样本数而非成本之和计数。新增 `1/23/476` 正例及缺键、非法类型、负值、非整数、超出安全整数、成功零值和拒绝正值反例；22／730／44 与两份完整矩阵 SHA 不变。

独立探针模块 [taohua_ding_probes.mjs](../../tools/tests/martial_data/taohua_ding_probes.mjs) 和 [对应离线测试](../../tools/tests/martial_data/taohua_ding_probes.test.mjs) 已准备，但尚未注册。它只在临时 `ding.c` 的 `ding_end` 实际入口及无条件 `return` 前插入两次 `observe_callback(target, phase)`；原 `perform`／`final`、目标判定、消息、删除、随机和 `call_out` 行保持逐字节。两锚点必须唯一，完整／部分重复注入及锚点漂移被拒绝，逆变换必须精确恢复原完整源码。`owner`／函数／目标身份和快照由后续接收层实际读取、校验，不由探针填造；纯 Node 词法检查不等同于 LPC 编译或自然回调实测。

上述增量已执行 `node --test tools/tests/martial_data/school_taohua_ding.test.mjs tools/tests/martial_data/taohua_ding_probes.test.mjs`，**23/23、退出 0**（16 项本组契约＋7 项探针，Node 摘要 485.2705 ms）。没有启动驱动或写入游戏源码；原 14 项通过记录保留，但不代表曾覆盖正执行成本边界。

尚未证明：共享接线通过、真实 USER 初态／拒绝序列化、实际伤害分布、自然 daemon 回调和无诊断日志。这些必须后续新系列独立烟雾／正式验证，不能拿离线通过代替。

## 未注册接收层准备补记

另有仅供后续共享窗口接入的[接收头](../../tools/tests/martial_data/taohua_ding_receivers.h)及[结构自检](../../tools/tests/martial_data/taohua_ding_receivers.test.mjs)：只读确切USER的许可、性格、师承、实际交战对象、副手和禁招；禁招假值仍保留实际0／null，不补造未知字段。自然回调只记录当前确切目标，未来`observe_callback`必须在自己的入口帧读取真正`previous_object()`与`call_stack(2)[1]`，再传给私有helper核对；不能在多出一个lfun帧后仍读索引1，也不能以常量伪造来源。

接收头未include到Runner、未进入执行输入或运行副本。项目格式化与`--check`通过，3项结构自检通过；与上述十四组整体自检同跑6/6退出0，4.812秒。词法／结构检查不等于LPC编译、实际调用栈或自然解除已验收，后续仍须新系列烟雾和正式采样。

## 6. 全部游戏来源 SHA256

条件的 `source_evidence` 保存以下实际文件完整字节摘要，每次建条件核对两份目录入口 SHA。驱动版本另由真实运行系列冻结。

| 文件 | SHA256 |
| --- | --- |
| `kungfu/skill/tanzhi-shentong/ding.c` | `8708ac8606e10111eea5c7c971d704be3fafdf71320904ac916a344a732a4423` |
| `kungfu/skill/tanzhi-shentong.c` | `23b04a8fe57b58d944011d8cce26f9e2afe2228ce2324421586a2183534ece1f` |
| `kungfu/skill/finger.c` | `00c9ce2b468f77311900e2eab2c07ab3cb47d209f7a08906b294d0464e2bf455` |
| `kungfu/skill/force.c` | `d851b531a263720e8382ea0292ef2990e0246b59abcaa0362cbc0c4c6bb1abae` |
| `kungfu/skill/bibo-shengong.c` | `5b5fa0a7d37b67773d32f4764c2f75625e077dffb59cd29874e1c49222f001ee` |
| `kungfu/skill/jingluo-xue.c` | `dc51ccb66a6e68d158dad783993e10118ffec9785971392b4e4059775f2cbd23` |
| `kungfu/class/taohua/huang.c` | `f5f2ad95ea9bf005b288d81ae9a67457d780b350dbf45865d66c08ec81b9af1e` |
| `cmds/skill/perform.c` | `7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054` |
| `inherit/skill/skill.c` | `891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd` |
| `feature/sserver.c` | `53ebb8c42b734b1123c373aa4a1bc3824b0056f155e6b429e5817a8d91d9fe31` |
| `feature/skill.c` | `99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8` |
| `feature/attack.c` | `1a23acd9a65ea55ff22eb88a802d5aab8c0b3084b6452a7b3c3553c6c8365103` |
| `feature/damage.c` | `1a57abfa577c4043909cf6f443fd070fb51b3128c4e33ed070809862db200a53` |
| `feature/attribute.c` | `1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924` |
| `feature/dbase.c` | `92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf` |
| `feature/equip.c` | `11f3cec8438a9fdd514cfeb9f8f4287ec1927e3235f4b10106a089acaace4f27` |
| `feature/action.c` | `1950c8cef01eff2364cf981607dd1c254c607961152ae03f12b8a7cc15cd6f7a` |
| `mudcore/inherit/dbase.c` | `097f1341d9a2be2d47798bef5400f4a7fdcbf413fe06b724581e76a512cbe8b3` |
| `mudcore/inherit/action.c` | `1ae2a04f0ecc46efa863bc0ca4281d897f26b6161de381cb2b23a39a33a9f2fe` |
| `inherit/char/char.c` | `3936e5d65d00059fc0db268d6a4e74c6863ebc542152616d8a9ac34b46c224d2` |
| `inherit/weapon/sword.c` | `394e34677205e2b4d085ef348265f52ae89e90f60f5cc7ae40f0b207086c2349` |
| `inherit/misc/equip.c` | `2c27d3bc81c41204be8f4771e59561319f3f3c36aa00118465cb6ccdd3092e2b` |
| `adm/daemons/combatd.c` | `9cb4ad68b4ad570c4775b64c2589f4d672ff436f7c690ea4f73bbcad263bd0a6` |
| `adm/single/simul_efun/message.c` | `3ea8d542bd6a764764f11e28c393883b1e97ecd7758b11b9ddcaf477c1133036` |
| `adm/single/simul_efun/chinese.c` | `06663114d386f1b2304b697f906b9fb1810d5e25a849883788541d1406e5b030` |
| `adm/daemons/chinesed.c` | `551edc0169c2eb5555b0ead18106a20083e333affed54376b68a14dcd8c81cf8` |
| `data/e2c_dict.o` | `fd8aea85f19c64505f22358cd91a11410edeaa3da67468487d258cc5932f24ba` |
| `include/globals.h` | `99e896f351cf614172d20a86deb3d7a8470fa215ba2ba90b2f0fb394d4fcf98b` |
| `include/combat.h` | `9b19065431f965beae165fd630c301bb7b5f5f24086a1eb99d8611696eb9612d` |
| `mudcore/include/ansi.h` | `4c061aef02f253f4af424d08dd2feaf3e7185b7e15b4e10f53ed5f6937a77a22` |
