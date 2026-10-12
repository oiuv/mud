# 桃花岛七原 NPC 配装与战斗闭包预检

2026-10-12，**独立准备，尚未注册共享采集入口；真实样本为 0**。本页及对应条件、自检是三份新增文件，不修改游戏、共享执行器或既有系列，不启动 FluffOS。依 [门派预查](2026-10-11-school-taohua-preflight.md) 收敛为原配装和原闭包的即时观察，不含拜师、教学、自然心跳选择、完整交锋或门派强弱排名。

## 范围与分母

七对象原有 42 个战斗闭包全部保留。每个条件创建新原对象，只调用该条件指定的一个原闭包；不能把上一招的忙乱、扣费、毒或提示带入下一条件。八个配装条件不调用闭包，其中黄药师包含玉箫未占用／已占用两种原构造结果。

| 原 NPC | 条件 | 正式计划 | 烟雾计划 | 固定输入下原方法可受理／返回 0 的条件数 |
| --- | ---: | ---: | ---: | --- |
| [陈玄风](../../kungfu/class/taohua/chen.c) | 5 | 10 | 5 | 3／1，另 1 配装 |
| [冯默风](../../kungfu/class/taohua/feng.c) | 7 | 210 | 7 | 2／4，另 1 配装 |
| [黄药师](../../kungfu/class/taohua/huang.c) | 13 | 614 | 13 | 6／5，另 2 配装 |
| [陆乘风](../../kungfu/class/taohua/lu.c) | 7 | 210 | 7 | 2／4，另 1 配装 |
| [梅超风](../../kungfu/class/taohua/mei.c) | 7 | 14 | 7 | 2／4，另 1 配装 |
| [曲灵风](../../kungfu/class/taohua/qu.c) | 7 | 112 | 7 | 1／5，另 1 配装 |
| [黄蓉](../../kungfu/class/taohua/rong.c) | 6 | 306 | 6 | 4／1，另 1 配装 |
| 合计 | **52** | **1476** | **52** | **20／24，另 8 配装** |

正式计划为 14 个随机效果条件各 100 次，其余 38 条各 2 次；烟雾各 1 次。14 条为冯、陆各 `dai/kuang`，曲 `tao`，黄药师玉箫状态 `bihai/ding/xiao/zhuan/powerup`、花瓣状态 `po`，黄蓉 `fei/strike.zhuan/powerup`。陈、梅九阴五个可达闭包各 2 次，只补原 NPC 配功和身份，不重做既有九阴百次机制矩阵。黄蓉 `fu` 固定靶下比较必过，也仅 2 次。

`outcome=observed` 表示完整取得原调用结果，**原方法返回 0 仍是有效观察，不计成执行错误或硬改为成功**。无运行错误的计划分解为：正式 16 配装、1460 次方法调用（原资格受理预计 1412、原返回 0 预计 48）；烟雾 8 配装、44 调用（20／24）。这些是依据原门槛确定的预期，不是实际完成量，也不是命中数量。随机命中分布不强迫符合某个预计比例。

## 原状态与入口

- 原调用链是 `chat_msg_combat` 中 `perform_action`／`exert_function` 的函数闭包，经 [NPC 分发](../../inherit/char/npc.c#L420) 和 [技能分发](../../inherit/skill/skill.c) 进入原文件。不是玩家 `perform` 命令，不替换闭包、不补玩家领悟、不增加调用 `accept_fight()` 的前置步骤。保留真实 `function_owner`、索引与表示字符串，按原索引执行一次。
- 七位都保持初生时主副手为空。冯、陆、曲携带长剑但未 `wield`，故 `sword.sui` 返回 0；曲仅准备沧浪指，`strike.dai/unarmed.kuang` 返回 0，冯、陆未准备沧浪指，`finger.tao` 返回 0。
- 冯、陆、曲原 `powerup` 映射落英心法，但该目录及基本内功都没有 `powerup.c/.lpc`，不替换其他运功。梅超风的 `claw.sha/whip.chan/whip.jiao` 仍缺入口，鞭配置仍被注释，不补鞭、不换 `zhua/zhu`。五个缺失路径同时检查两种扩展名，只有明确 `ENOENT` 可作缺项证据，不能把权限错误视为缺失。
- 全部原 `recover` 因气血充足返回 0。黄药师、黄蓉原碧波 `powerup` 可受理，强化量分别 113、80，费用 100；原 NPC 自有撤销计时保留到即时快照后再清理，不采自然到期。
- [黄药师构造](../../kungfu/class/taohua/huang.c) 把原玉箫记为 `handing`，并非主手。[碧海按玉箫](../../kungfu/skill/yuxiao-jian/bihai.c#L25) 接受这个原手持对象；`qing/tian` 则要求主手剑，不能按同名剑法推成可用。玉箫被另一原黄药师占用时，本对象照原构造拿花瓣；额外仅采该配装、`bihai` 返回 0、`po` 可受理三条件，不重排整套闭包。
- 陈玄风原捡取 [九阴真经下册](../../clone/lonely/book/zhenjing2.c) 是非克隆单例。只设未占用情况，记录真实接收归属；占用不影响本组任何闭包资格，因此不追加该重复分支。陈、梅不得同时在战斗房间，避免 [原援助逻辑](../../kungfu/class/taohua/chen.c) 自动拉入另一 NPC；保留其 `kill_ob` 对 `temp/my_killer` 的原登记。

完整原技能、映射、准备来自静态索引中对应 `create()` 声明，运行时还须核对原对象快照；不能把声明本身当最终状态。原装备物理对象、单例、克隆标志、所属对象、主副手／`handing`、耐久、数量、重量、武器／防具属性均需观察。长剑携带的重量不能被错算成装备加成；书未调用装备 `setup()`，其耐久是显式未设置值，不补 100。

原玉箫的 `init_xsword(90)` 经 [箫类初始化](../../inherit/weapon/xsword.c#L19) 的 90% 换算后，实际 `weapon_prop/damage` 是 **81**，不是调用参数 90。当前校验与合成快照按 81，并有填入 90 必须拒绝的反例；此修正只纠正采集期望，不改物品或有限矩阵。

## 固定防御靶及效果边界

复用已连接的非管理员真实 USER 作防御靶，基础内功／招架／轻功各 600，无特殊映射、准备、天赋、主手或守御；有效三项各 300，四维原值各 36，经验 10000000，气血／精神和对应有效上限均 100000，内力／上限 10000，加力 0，测试护甲 100。另一个 USER 只旁观，须前后完全不变。NPC 原资源、门派、技能、装备、加力一律不抬高、不修正。

高靶资源用于保留普通六击完整和避免原直接死亡分支，不是模拟同级玩家；例如陈玄风 `zhua`、黄药师 `zhuan` 的内力上限均不超过靶两倍。本组不覆盖其直接死亡终态。没有人为 `not_living` 或禁用原业务来保证成功；若实际对象不满足该预期，运行应失败并保留证据，不能静默减少攻击次数。

| 原入口 | 本条件需分别观察的事实 |
| --- | --- |
| [夺命／神抓](../../kungfu/skill/jiuyin-baiguzhao/duo.c)、[九阴神抓](../../kungfu/skill/jiuyin-baiguzhao/zhua.c) | 方法受理与 0／1 次直接调用分开；夺命第一／第二段百分比 55／65 和费用不同；神抓在当前上限条件走普通直伤，不当作死亡样本 |
| [催心](../../kungfu/skill/cuixin-zhang/cui.c) | `REMOTE_ATTACK` 输入、40–54 创伤参数、NPC 净费、靶毒层级／余量／来源及招架下降分别核验；原技能所有者撤销回调要精确清理，未采后续毒发 |
| [滔天](../../kungfu/skill/canglang-zhi/tao.c)、[戴月](../../kungfu/skill/pikong-zhang/dai.c)、[奇门五转](../../kungfu/skill/luoying-shenzhang/zhuan.c) | 原比较和输入伤害区间、命中／失手费用、加力及双方忙乱；`do_damage` 输入不能充当最后损血 |
| [狂风](../../kungfu/skill/xuanfeng-tui/kuang.c)、[飞花](../../kungfu/skill/lanhua-shou/fei.c) | 原六次普攻、同轮攻击加成、结束回收、原熟练／潜能增长。兰花 [query_action](../../kungfu/skill/lanhua-shou.c) 可额外扣 300，即使随后攻击被闪避／招架；不能只按命中次数算费用或为观察再调用一次选招 |
| [兰花拂穴](../../kungfu/skill/lanhua-shou/fu.c) | 原黄蓉有效手法 360，最小比较值 180 大于靶招架一半 150，故本条件控制 14，NPC 忙乱 1、费用 100；不把该固定成功率外推为所有对手 |
| [碧海按玉箫](../../kungfu/skill/yuxiao-jian/bihai.c) | AP 1260、DP 600，四次比较在本输入下均成立，精神损伤合计 1617–3230、有效精神创伤为其 2/3 整数截断；NPC 费 200。不把总精神伤害当普通攻击或曲谱 `do_effect()` |
| [定昆仑](../../kungfu/skill/tanzhi-shentong/ding.c) | 原远程加力、NPC 命中费 400／失手 150，命中挂 `no_perform` 但不是 `busy`；靶有效气血不降。原 1–5 秒解除只留注册与精确清理证据，不声称自然解除已测 |
| [啸沧海](../../kungfu/skill/tanzhi-shentong/xiao.c) | NPC 原本零内力费用，靶精神损伤、有效精神创伤、内力损失分别观察；此高内力靶无归零修正。其他低资源／修正分支由 [独立单招准备](2026-10-12-school-taohua-xiao-preflight.md) 承担 |
| [破九域](../../kungfu/skill/tanzhi-shentong/po.c) | 原花瓣 50→49，费用 300，失手也扣费扣一枚；原靶无主手，故不含缴械，亦不是最后一枚自然销毁或互搏重入实验。原创伤与气血夹制分账 |
| [转乾坤](../../kungfu/skill/tanzhi-shentong/zhuan.c) | 原经验／两门指法加成后 AP 1345；普通分支直接输入 1345–2689、百分比 100–134，命中净费 400–749，失手 200。无需也不得修正原 NPC 经验、数学或内力上限 |

NPC 没有 USER 资源探针毛账，报告明确 `npc_gross_resource_accounting=not_observed`，仅列观测前后净内力差；不把 `raw.metrics[0]` 防御靶费用当 NPC 费用。靶资源有公共 USER 账本，后续接入须同时跑公共校验和本组校验。不得凭 NPC 净费余数把“兰花特殊动作触发次数”写成已直接观察；当前只校验原可能费用的 300 整数倍支持区间。

## 最小共享接入清单（本次未实施）

1. 注册 `taohua-npc`、52 固定条件与七条白名单原路径；执行清单保全两 MJS 的实际字节和全部来源哈希。旧矩阵不重排，旧报告不混新分母。
2. 在既有 [NPC 观察器](../../tools/tests/martial_data/npc_observer.lpc) 增加七对象分支，保持原 `this_player`／首次动态加载证据、闭包身份、原 NPC 心跳暂停及蓝图状态。构造不能预先给技能加载对象换身份或覆写原全局表。
3. 快照只读追加 `handing_object`、物品 `amount/weight`。普通物品数量和未调用结果等明确缺席字段必须有键，可接受 LPC/JSON 原样 `0` 或 `null`；缺键、`undefined`、布尔值、空串和非零对象不得混入空值。原书未设置耐久同理。
4. `singletons` 数组记录陈书／黄玉箫的对象、克隆标志、初始及前后归属。黄玉箫占用方必须是本样本新建的另一原黄药师、放在另一测试房间、原状态完全不变；不挪用外部对象。统一清理仅销毁本样本保存的 NPC 与物品精确引用，第二次清理不覆盖第一次证据。
5. 原 `ding_end/cuixin_end` 属于技能对象，不属于 NPC。新增的窄只读接点须在**保持原调用表达式、参数、随机求值次数、延时及返回值**的前提下保存真实 `call_out` 返回句柄、原施术者、原目标与延时。即时快照取原控制／毒状态，再以该句柄移除并记录 `removed_remaining/remaining_after`；不得按名称批量移除，不得把主动清理冒充自然触发。条件协议使用 `effect_callouts`，原件必须含 `owner/function/handle/actor_object/target_object/delay/fired/removed_remaining/remaining_after`。
6. 复用现有 NPC `actor=-1` 普通／直接攻击观察，事件须同时带确切 NPC 和靶身份，不串入旁观 USER 或单例占有者。`callbacks=[]` 限本组不运行自然回调，不是抹掉技能注册证据。
7. 专用统计按冻结 condition 取参数，不读不存在的 `raw.parameters`；将方法 0／1、配装、直接输入／实际靶净损失、普通攻击结果、控制、毒、NPC 成长与成本分开。通用攻击者表不能直接套防御靶。全部原清理路径和新增接点须在新烟雾中验收后再开正式。

实际采集驱动提交 **`328aaf10635ef8ce636b2b6cebd549bb165e462d`** 的 `src/packages/core/call_out.cc:541–599` 已通过 `git -C fluffos show 328aaf10:src/packages/core/call_out.cc` 只读核实：`get_all_call_outs()` 每行实际只分配三列（所有者、函数、剩余延时），没有目标参数和句柄列。此结论来自对应提交的实现，不以当前驱动文档或较新源码替代旧二进制行为；因此不能从 `call_out_info()` 的不存在第四列恢复目标。后续采集仍须记录所用驱动二进制 SHA 和支持接口，不能只引用版本字符串。

## 冻结依据与当前验证

- 游戏 HEAD：`c44de8f2605101bf27ed8c3e46a78fe8a52be561`；mudcore：`67e0bace181ec162e17b0f422813af2862a133ea`。弹指初始化急修在此基线内，不复用旧全局初始化行为。
- [条件模块](../../tools/tests/martial_data/school_taohua_npc_cases.mjs) `taohuaNpcSources` 明列 111 个业务源码，`SHA256(JSON.stringify([[path, source_sha256], ...]))` 为 `be52a72ad6ed70fcd7c1b99366b57ae4f3acfae599a6e4ad73bbb5f959894a71`；另 10 个 `.c/.lpc` 缺席文件逐项断言。这是本组已审业务清单，**不是完整驱动／执行器输入清单或已创建的冻结运行副本**。
- 正式有序条件 JSON SHA256：`9ee4e16d6e3b52f3bd4f1d81d80f0961d0f595c4fb9351b2aeac1f2fbe8976e1`。
- 烟雾有序条件 JSON SHA256：`e7ce42d788679e079a0f585b709fbf8d903f4ab2a23eadfc3bddb47f81d5e72c`。
- [独立自检](../../tools/tests/martial_data/school_taohua_npc.test.mjs)：`node --test tools/tests/martial_data/school_taohua_npc.test.mjs`，15 项合成契约通过；包含 52 条完整构造、随机两侧／夺命第二段、缺字段及非法空值、原闭包身份、配装／单例、全部直接费用与类型、六击／成长／兰花额外费、控制／毒定时清理、错误与未知分母反例。测试不启动驱动、创建 series 或写入采样台账。

来源／矩阵哈希、自检通过只能作为后续接线准入依据。当前没有真实原件、驱动日志、退出摘要或专用效果报告，也未验证新增观察字段会由共享夹具正确产生；不能称 1476 条已采或七位原 NPC 已实服验收。教学旧原件可用性仍以 [证据可用性记录](2026-10-11-martial-evidence-availability.md) 为准，本组不重采教学、不修补历史目录、不把新样本并入旧报告。
