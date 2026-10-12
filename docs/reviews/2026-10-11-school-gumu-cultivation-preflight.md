# 古墓内功与公共知识采集预检

初次预检时仅复核离线用例，以下保留接入前记录。2026-10-11后续已完成共享夹具接入、407条独立烟雾及7150条正式采集，见[结果报告](2026-10-11-school-gumu-cultivation-results.md)。条件矩阵仍为 **341 条件**，游戏提交为 `c44de8f2`；游戏源码与正式数据未修改。

## 范围与计划

覆盖素心诀、玉女心经、怒海狂涛，以及公共的读书识字、医术、道学心法、武学修养。来源包括古墓四位教师、原技能和继承、玩家属性与内力容量、学习和研究命令；实验赋予的技能与资源不代表自然拜师或教师实际可传授的最高等级。

| 观察方式 | 条件 | 正式计划记录 | 预计观察／拒绝 |
| --- | ---: | ---: | ---: |
| 原接口 | 225 | 450 | 384／66 |
| 原 `research` 命令 | 116 | 6700 | 6600／100 |
| 合计 | 341 | 7150 | 6984／166 |

66 个可研究的随机条件各100次，其余条件各2次；独立烟雾计划407条。修改前后完整正式条件 JSON 的 SHA-256 均为 `c5f516e4c33feadc3c7a6675af0e9b858e580629092d0b280196d126f9e94ffd`，没有改条件、技能公式、随机边界、样本量或既有证据。

## 源码核对

- [素心诀](../../kungfu/skill/suxin-jue.c)继承基本内功至少10；[玉女心经](../../kungfu/skill/yunv-xinjing.c)检查非无性、基本内功150、先天悟性32、最大内力2000，不限定女性；[怒海狂涛](../../kungfu/skill/surge-force.c)检查男性、基本内功150及有效膂力45。
- [有效属性](../../feature/attribute.c)中，膂力使用六种基本徒手技能的最高值除10，而非相加；悟性使用识字除10，再叠加对应纹身、转世和临时属性。心经的资格仍读取先天悟性，不能用这些加成代替。
- [公共学习](../../cmds/skill/learn.c)先检查候选内功的通配兼修许可，否则检查已有内功是否允许候选；不是只读候选的名单。原 `valid_force()` 返回0只表示该方向不兼容，属于有效查询结果，不是接口调用失败。
- [总内力容量与激发容量](../../clone/user/user.c)分别取已学内功最大候选和当前映射；保留整数除法及修养、突破、神秘、鬼脉、限定门派僧人加成的顺序。查询不更改已有最大内力，也不授予学习资格。
- [研究命令](../../cmds/skill/research.c)中，200／400／800级、499／500分段、心经难度400、鬼脉／武星和[武学修养的熟练度加成](../../feature/skill.c)分别核对。悟性36时每次研究消耗27精神、已用潜能加1；总潜能和内力不变。精神60请求3次只完成2次且余下精神清零。经验或精神不足时可以返回1但无增长，仍须记为无进展。
- [医术](../../kungfu/skill/medical.c)通过 `replace_program` 复用[识字](../../kungfu/skill/literate.c)，不伪造独立医术实现；识字、医术、[道学](../../kungfu/skill/taoism.c)是知识类，原研究命令先行拒绝。[武学修养](../../kungfu/skill/martial-cognize.c)类型虽是 `martial`，独立学习与研究资格均拒绝。继承的 `valid_research()` 允许，不代表知识类可通过完整研究命令。

## 本次离线修正与验证

1. 校验器复用既有快照的 `effective_str`，对应增加 `effective_int` 观察要求；不再要求尚未实现的 `effective_attributes` 映射。
2. 缺失 lfun 的返回值可能序列化为 `null`。旧峨嵋真实记录 `mud-martial-data-QN8jVr/runs/attempt-dcCDeK/mudlib/log/events.jsonl` 中的 `school-emei-cultivation-emei-xinfa-difficult_level-l200` 已证实该形态；本组对明确存在的 `result: null` 按LPC零值核对，并保留明确的空归属（`implemented_by`为0／null，本组实际为0）。缺少字段、伪造归属及非零接口返回null仍失败。旧记录仅作为序列化依据，不计入古墓实测。
3. 增加空闲 `busy: null`、缺失接口null、结果／归属缺失的反例；两种有效属性缺失或被改动均拒绝。Node 专项 **13/13 通过**，两份MJS语法检查与 `git diff --check` 通过。

自检入口：`node --test tools/tests/martial_data/school_gumu_cultivation.test.mjs`。合成记录只验证校验器，绝不保存为驱动观察。

## 最小接入项

以下为预检时的接入清单，后续均已完成并通过独立烟雾：

- `snapshot()`：复用 `effective_str`；本组增加 `effective_int = ob->query_int()`，并在 `cultivation` 中补 `tattoo/tattoo_str`、`reborn/str`、`tattoo/tattoo_int`、`reborn/int`、`env/no_learn`。已有修养字段继续保留。
- `do_interface()`：显式分发 `valid_research(players[0])`、`valid_force(spec["argument"])`、`can_learn(players[0], spec["argument"])`，不落入仅调用 `valid_learn` 的默认分支；将输入 `argument` 同步写入接口观察。
- 对本组每次接口记录 `function_exists` 的实际归属；容量接口的对象为真实 `players[0]`，不能执行 `load_object("player")`。缺失方法保留零／null及空归属，继承方法保留原定义路径。
- 原接口拒绝识别补充 `valid_research`、`can_learn`；`valid_force`、容量及缺失难度接口的零返回仍是正常观察。原研究命令受理与学习进度的现有判断继续复用。
- 条件注册、快照工具清单、分组校验和报告只加入本组模块；重新创建独立烟雾与正式系列，不能将上述预检或其他门派结果计入古墓完成量。接入时将自检中的“尚未注册”断言同步改为本组完整注册比对。

本预检未改变这341个条件资格或公式；后续已由真实记录确认派发、方法归属和资源账。完整条件JSON指纹仍为上述值，旧13154条件／366062计划完整内容保持。定向12份测试134/134通过，后续全套1100/1100通过；OpenSpec全门派／全武学任务保持未完成。
