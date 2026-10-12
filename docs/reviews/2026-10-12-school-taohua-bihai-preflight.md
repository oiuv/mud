# 桃花岛碧海潮生按玉箫有限补采预检

当前[正式结果](2026-10-12-school-taohua-bihai-results.md)已完成原23条件732正式、46独立烟雾及三路终审；[接线进度](2026-10-12-school-taohua-bihai-progress.md)保留真实双槽箫、原昏迷准备和分阶段门禁。下文未注册／0样本保持原准备时点，不作为当前共享入口或采集状态。

2026-10-12。独立准备 **23 条件／732 正式计划／46 烟雾计划**。本次只新增条件模块、原记录校验及合成自检，**尚未注册共享入口、未启动驱动，真实采集数为 0**。不改变全局已采数量或 OpenSpec 任务状态。

## 范围与来源

本组是玉箫剑法的原命令 `perform sword.bihai right`，入口为 [bihai.c](../../kungfu/skill/yuxiao-jian/bihai.c#L8)。四次随机比较累加一个精神损伤总量，最后调用一次 `receive_damage("jing", D)` 和一次 `receive_wound("jing", 2D/3)`；不经过 COMBAT 气血直伤接口。

它不是[碧海潮生曲的 `do_effect()`](../../kungfu/skill/bihai-chaosheng.c#L38)，也不是 `play` 演奏、玉箫剑法普通攻击或 `hit_ob()`。本组不触发这些入口，不把四次比较计为四次普通攻击，不增加 RNG 探针，也不从一个总伤害反推各段命中。

[黄药师](../../kungfu/class/taohua/huang.c#L135)的询问“碧海潮生”和原战斗闭包 `sword.bihai` 提供实际使用来源。[`ask_skill6()`](../../kungfu/class/taohua/huang.c#L531)传授的是“碧海潮生按玉箫”，要求桃花岛、未领悟、贡献 1000，以及玉箫剑法、碧波神功、碧海潮生曲各 180；教学会设置领悟、扣贡献并尝试多项熟练奖励。此处只配置必要资格，不实际拜师、传招、扣贡献或重新统计那些奖励。

[既有桃花预查](2026-10-11-school-taohua-preflight.md)继续作为关系索引。[历史证据可用性](2026-10-11-martial-evidence-availability.md)记录旧教学及交书系列的证据缺口；本组不重采以填旧目录，不把新效果样本混入旧教学分母。与[啸沧海](2026-10-12-school-taohua-xiao-preflight.md)、[定昆仑](2026-10-12-school-taohua-ding-preflight.md)及[原 NPC 配装／闭包](2026-10-12-school-taohua-npc-preflight.md)各自独立，不表示桃花岛全部完成。

独立文件：

- [school_taohua_bihai_cases.mjs](../../tools/tests/martial_data/school_taohua_bihai_cases.mjs)：条件、原件校验、按冻结条件统计。
- [school_taohua_bihai.test.mjs](../../tools/tests/martial_data/school_taohua_bihai.test.mjs)：有限合成自检及来源、矩阵摘要。

前缀 `school-taohua-bihai-`，`collection_group=taohua-bihai`，方法 `perform`。来源基线为 MUDLIB `c44de8f2605101bf27ed8c3e46a78fe8a52be561`，泥核 `67e0bace181ec162e17b0f422813af2862a133ea`；既有隔离采集驱动为 `328aaf10635ef8ce636b2b6cebd549bb165e462d`，本次未运行该二进制。

## 输入与真实持器

两个角色是相连、非巫师的原 USER 夹具，使用原 `set_name()` 建立 `left/right` 别名，并以 `present("right", room)` 验证确切靶；只改 `id` 不足以保证原命令能找到对象。除“未交战”拒绝外，保留原交战关系。

施术者基本剑法、玉箫剑法、基本内功、碧波神功、吹箫技法和碧海潮生曲均随三档取 200／400／800，分别激发 `sword→yuxiao-jian`、`force→bibo-shengong`、`chuixiao-jifa→bihai-chaosheng`，不准备空手武功。最大及当前内力 10000，气血和精神的当前／有效／最大值均 100000，经验 100000000，加力 0，先天膂力／悟性／根骨 36、身法 34，无武学修养和强化。领悟值 1 是实验资格，不冒充实际教学经历。

基本剑法和吹箫技法不低于对应特殊技能；最大内力和有效内功也符合[玉箫剑法学习门槛](../../kungfu/skill/yuxiao-jian.c#L149)。180 级最低组的六项技能均为 180。等级不表示玩家自然养成成本，100000 资源池只用于避免本次总伤害触发死亡或精神夹制。

靶基本内功、招架、闪躲各 600，吹箫技法显式为 0，无特殊映射、准备或武器；资源池同上。夹具原护甲 100，不影响此精神损伤公式。

默认只手持现有生成夹具 `/tests/xsword`，不持主手武器。它来自现有[兵器模板](../../tools/tests/weapon_balance/weapon.lpc)的 XSWORD 替换，真实继承 [XSWORD](../../inherit/weapon/xsword.c#L12) 和 [MI_XIAO](../../inherit/misc/_xiao.c)：`valid_as_xiao()` 原返回 1。`init_xsword(50)` 经原 90% 转换后**实际伤害为 45**，重量 3000、标志 4、耐久 100。作为手持物时不应用武器属性；主手持用时才应用伤害 45、闪躲 -1。不能把初始化实参 50 当作最终伤害，也不能给普通剑加一个模拟箫函数。

无效乐器对照使用 `/tests/sword`：真实伤害 50、重量 3000、标志 4、耐久 100，不实现 `valid_as_xiao()`。不取用原黄药师的单例玉箫。本组只用这两种真实继承的现有测试物件。

[原能力的持器顺序](../../kungfu/skill/yuxiao-jian/bihai.c#L25)是手持物有效则使用，否则检查主手；没有副手回退。组合条件分别验证“有效手持＋无效主手”“无效手持＋有效主手”“仅有效主手”。两物件条件要求不同的确切对象，不能让同一物件同时占两槽。原 [hand](../../cmds/std/hand.c#L23) 与 [wield](../../feature/equip.c) 的限制仍生效；接入时先将唯一手持物移入角色并原命令 `hand practice weapon`，核对精确引用，然后再建立及原法持用主手，避免两个同名物件使 `present()` 选择含混。

快照须增加本组只读 `valid_as_xiao` 及 `valid_as_xiao_source`，读取物件原返回和 `function_exists()`，不覆写函数。已直接核对采集驱动 `328aaf10:src/packages/core/efuns_main.cc:675` 的实现：返回路径去掉 `.c/.lpc` 后加前导 `/`，因此真实来源是 `/inherit/misc/_xiao`。普通剑这两个明确不存在的字段只接受已存在键的 0／null；缺键及其他假值不当成零。

## 固定矩阵

所有短烟雾条件各两次，烟雾不纳入正式统计；正式长样本只用于随机总效果，短样本检验有限资格及持器分支。

| 后缀／配置 | 条件数 | 正式计划 | 变化与目的 |
| --- | ---: | ---: | --- |
| `l200/l400/l800-baseline` | 3 | 300 | 三档各 100，其他配置一致 |
| `force0` | 1 | 100 | 只改靶基本内功为 0，四段比较源码保证成立，总伤害仍随机 |
| `force2200` | 1 | 2 | 只改靶基本内功为 2200，源码保证总效果为 0；仍受理扣费 |
| `l180-minimum` | 1 | 100 | 六项技能均降至 180，三项绝招门槛恰好满足 |
| `neili300` | 1 | 2 | 只改当前内力至最低 300，受理后剩 100 |
| `no-music-map` | 1 | 100 | 仅取消曲谱激发；原碧海修为仍 200，允许施展但 AP 降低 |
| `target-music400` | 1 | 100 | 只将靶基本吹箫技法改成 400，提高原 DP |
| `valid-hand-invalid-primary` | 1 | 2 | 手持 XSWORD＋主手普通剑 |
| `invalid-hand-valid-primary` | 1 | 2 | 手持普通剑＋主手 XSWORD |
| `primary-only` | 1 | 2 | 只持主手 XSWORD |
| `no-grant/no-fight/no-instrument/invalid-hand-only/invalid-primary-only/yuxiao179/bibo179/bihai179/no-sword-map/neili299/unconscious-target` | 11 | 22 | 各两次确定拒绝；不把拒绝当零效果受理 |
| 合计 | **23** | **732** | 烟雾 **46** |

正式计划分类为 710 受理观察／22 拒绝；烟雾为 24／22。受理观察数不是正效果数，更不是四段命中数。三档比较用于固定输入的总效果，不在这批构造“武器伤害×内功×吹箫×门派”的全排列。

完整有序 `JSON.stringify(conditions)` 字节摘要：

- 正式：`d5046d8c95e6a655fccfb0b00c310515e5c192ea77cf9e5f2de9151a5e8b5794`。
- 烟雾：`f90cc6ab9c72930625e7e814a34e381ffa4fbea7e9b15483cf493f60a8d9b3be`。

这是条件摘要，不是运行 fingerprint、原事件摘要或完成证明。条件中 `source_evidence` 保存 36 条实际来源的 SHA-256；包括命令、技能／曲谱、教学、损伤、原装备、消息／名称处理及 `data/e2c_dict.o` 精确例外，未读取其他存档。

关键来源摘要如下；实际运行仍须冻结整套源码／夹具及工具，不能用本表代替完整清单。

| 来源 | SHA-256 |
| --- | --- |
| `kungfu/skill/yuxiao-jian/bihai.c` | `0ab7bf01f3d23ddf2dc02676c0fa20eb00ba75a6918a90dc98ab5b28c46c1ec8` |
| `kungfu/skill/yuxiao-jian.c` | `b688cdfddd376375832eb3ad08a5895e529d5caa3119e1f78d4a51f26efd5607` |
| `kungfu/skill/bihai-chaosheng.c` | `663e390676e21c06cdd97331b4161fc02e5c7e98ed54c1d333e52c4ab6d4a606` |
| `kungfu/skill/chuixiao-jifa.c` | `1392f3747e58e8cded99c177bdf66a6bcd3c76b735df982fe593e86f353b5417` |
| `inherit/weapon/xsword.c` | `dd03202f950b36b68824e2a68652830d140db17577ebe86cf78184de73c35569` |
| `inherit/misc/_xiao.c` | `cb862d73c6fc197f2b82c1c18272473f56f45e9afdf5dfa1d28cb42e9d197df9` |
| `cmds/std/hand.c` | `7c41bba44d0c31639a0f65ba292c5154754719dc250c5b8c77ce311858952882` |
| `cmds/skill/perform.c` | `7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054` |

## 总效果、资源与分母

依[原有效技能](../../feature/skill.c#L135)，原公式中：

```text
A = 原始玉箫剑法 + 原始碧波神功 + 有效吹箫技法
P = 靶有效内功 + 靶有效招架 + trunc(靶有效吹箫技法 / 2)
```

常规三档 A 为 700／1400／2800，P 均为 600。取消曲谱激发仅令 A 从 700 降为 500；靶基本吹箫 400 时，其有效吹箫 200，P 从 600 增至 700。这里不能错用原始吹箫值，也不能漏掉最后一次整数除 2。

四个独立整数比较及成立后的累加项均来自 [bihai.c:66](../../kungfu/skill/yuxiao-jian/bihai.c#L66)：

| 比较 | 成立时累加 |
| --- | --- |
| `A + random(A) > P` | `trunc(A/5) + random(trunc(A/5))` |
| `A + random(trunc(A/2)) > P` | `trunc(A/4) + random(trunc(A/4))` |
| `trunc(A/2) + random(A) > P` | `trunc(A/3) + random(trunc(A/3))` |
| `trunc(A/2) + random(trunc(A/2)) > P` | `trunc(A/2) + random(trunc(A/2))` |

校验器仅把各比较在冻结输入下可成立／可不成立的整数区间相加、合并为**总量可达集合**。不生成逐段观测字段，不假定预计命中频率，不因一批合法随机结果偏高或偏低拒收。例：200 级基准总量 315–1792；400 级 1796–3588；800 级 3593–7182。未激发曲谱时允许 0 或 100–779，1–99 不可达，不能只用总最大值放行。

最终总量 D 的含义和消耗如下：

| 项目 | 任一受理样本（包括 D=0） | 资格拒绝 |
| --- | --- | --- |
| 目标精神毛扣／净减少 | D | 0 |
| 目标有效精神毛扣／净减少 | `trunc(2D/3)` | 0 |
| 目标内力变化 | 0 | 0 |
| 施术者内力毛扣／净减少 | 200 | 0 |
| 施术者即时 busy | 1、2 或 3 | 0 |
| 原命令熟练 | 180／200 级为 0 或 1；400／800 级为 1 | 0 |

高精神池下[原 `receive_wound()`](../../feature/damage.c#L60)不再夹制当前精神，`max_jing` 不变。资源计数须同时核毛扣、恢复和前后快照；本组没有恢复、归零修正或额外气血收费，不能用额外扣费＋等量恢复掩盖错误。

原 [perform](../../cmds/skill/perform.c#L119)受理后另检查 `random(120)<有效玉箫剑法` 并调用[原弱模式熟练增长](../../feature/skill.c#L255)。本组没有武学修养，增量为 1，原等级不变；总效果为 0 也可增长，不是教学的 1500000 奖励。目标不得增长熟练。

`no-sword-map` 在原公共 `do_perform` 先被拒绝，原文为 `你现在的(sword)中并没有这种外功。`，不伪装成已经进入能力文件后的“没有激发玉箫剑法”。其他拒绝保持原颜色去除后的文字、标点和换行；代码中的“拿萧”和 ASCII 逗号不在本轮改写。

`taohuaBihaiEffects(rows, frozenCondition)` 分列受理、总效果正值／零值、拒绝、错误；正效果率分母为受理样本，沿用现有 Wilson 区间。它不是每段命中率、战斗胜率或普通攻击数。总伤害、创伤、双方内力费用、即时忙乱直方图及熟练独立统计。整数 busy 不是已观察的自然秒数。错误样本效果未知，不补零费用；空分母为 null。不读取 `raw.parameters`。

## 原件契约与待接共享清单

本次只列最小接点，未动共享代码：

1. 追加 generator／validator／报告 effects，保护旧有序矩阵；新系列冻结 36 条来源及完整工具依赖并实际保全字节。工具、报告、统计和词法依赖不能仅有摘要就称可独立重放。
2. 复用两连接 USER、原 `force_me`、原 command 返回及发动／拒绝观察。快照补本组领悟、实际交战、副手；原别名须验证确切对象。
3. 仅本组支持 `handing_equipment` 加可选原 `equipment`，先原命令手持、后原法持主手，均核精确归属；现有 `equipment.hold` 的“必须没有主手”断言不能全局放宽。只读快照补两项原箫能力／来源，不替换原对象方法。样本结束统一按确切引用清理，不能复用上条物件或单例。
4. 本组加入既有原 `unconcious()` 准备及隔离白名单；保留原对象、准备前后和唯一 `side=1/unconscious`，准备后必须等于样本 before，随后才计本招资源。不得把准备的精神／气血归零算作碧海伤害。
5. 复用已有单向资源和状态观察，无新增 RNG、普通攻击或自然计时探针。`attacks/passives/defenses/dodge_checks/interfaces/dropped/terminals/callbacks` 本次实际观察为空；双方 `direct/quick/riposte/heartbeats/hit/dodge/parry` 计数也必须为零，空事件列表不能掩盖矛盾计数。计数沿用已知稀疏协议，缺省为零但不回写字段或补造事件；显式 null、负数和正值均不接受。未启用的 `actions/directs` 缺席不被伪装成“观察到空数组”。如有非空附加事件则不能混进本组。
6. 专用报告按冻结条件调用 effects，单列精神总量与费用。继续保留请求、原件、账本、驱动身份、冻结／探针副本、日志和结束标记，不用合成通过替代真实验收。

每份记录还须验证两角色身份、原始／有效技能、激发／准备、全套资格、主手／手持物前后同对象及属性、固定护甲／武器 apply、原资源和熟练映射、发动的 `actor/skill/argument="bihai right"`。缺键、undefined、字符串、数组和布尔值不得冒充无忙乱、无领悟或无函数。仅明确缺席的已存在字段接受 0／null，已配置数值资源和技能仍须是整数。

## 离线验证与下一门禁

首版 `node --test tools/tests/martial_data/school_taohua_bihai.test.mjs` 为 17/17 通过，0 失败，0.258 秒。独立复核另发现采集器遗漏了双方 `hit/dodge/parry` 零计数校验：即使 `attacks=[]`，虚构 `actor.hit=99` 或 `target.parry=1` 仍可通过。此为采集器校验缺口，不是游戏代码错误或真实运行样本；本轮仅补既有计数循环与合成反例，23／732／46 条件及两份矩阵摘要保持不变。

修订后自检 **18/18 通过，0 失败**，0.294 秒。覆盖全部 23 条件、整数总量端点与不连续区间、保证总空／总成、零效果仍扣费、三档忙乱、毛扣／恢复伪造、真实箫继承与 50→45、手持和主手、不存在函数的明确空值、11 项拒绝、昏迷准备隔离、原熟练及错误／空分母；新增受理／拒绝两类记录中双方三项计数的缺省零、显式零、正值、null、负值和不回写检查。

此结果仅证明独立校验和有限预期自洽；共享尚未注册，公开 `validateRecord` 接线、真实 create/open、实际 JSON 空值和原命令结果均待后续验证。必须先用全新系列跑 46 条真实烟雾并通过原件、来源和日志复核，再跑同版 732 条正式。任何失败旧系列保留原样，不回填新字段，不晋升成功或混入正式分母。

## 命令返回值契约补正（未采样）

此前合成自检只使用成功值 `1`，遗漏了原 [force_me](../../feature/command.c#L117) 直接返回 `command()` 正执行成本的语义；成功值并不固定为 `1`。这是独立采集校验器的错误，不是武学或驱动行为错误。本次只修正单命令 `raw.command_accepted`：键必须存在、值必须为非负安全整数，以大于零表示受理，以零表示拒绝；原始成本不归一化，也不与技能资源消耗混算。NPC 闭包返回值、聚合命令字段及游戏代码均未调整。

新增两项离线自检覆盖全部固定条件：成功成本 `1/23/476`、缺键／未定义／null／错误类型／负数／非整数／非有限值／超安全整数，以及成功零成本和拒绝正成本的反例。相同原记录在三种合法成本下得到相同统计，受理分母不累计执行成本，验证及统计不回写原记录。本组现为 **20/20 通过**；七组串行合计 **122/122 通过、退出 0**，不是 122 条真实游戏样本。

原有 23 条件／732 正式计划／46 烟雾计划和两份完整有序条件 JSON 指纹保持不变，旧准备文件已由主控另行保全。上述历史自检结果保留；当前仍未注册共享执行，也未启动驱动或采集真实样本，后续烟雾／正式门槛不变。
