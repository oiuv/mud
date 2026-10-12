# 桃花纯控制：兰花拂穴／随波逐流采集准备

当前已完成[真实采集与独审](2026-10-12-school-taohua-control-results.md)27条件／1034正式／54成功烟雾，[最小接线进度](2026-10-12-school-taohua-control-progress.md)另列；下文保留原准备、自检与未执行时点，实际采集不与合成验证混算。

状态：独立准备，尚未注册共享采集器、启动驱动或取得实际样本。仅推进 `collect-martial-arts-dataset` 的有限离线准备，不代表桃花岛、全部武学或任务 4.2／5.1 已完成。游戏源码、原随机、原费用及正式数据保持不动。

## 1. 范围与源码口径

本组只观察两招的原 `perform` 命令及即时控制，避开普通攻击、互备、教学和自然解忙；不重复旧玉箫「天地情长」或此前公共拒绝大全。实验角色是两名真实非巫师 USER，修为、领悟和桃花岛身份属于明确设置的初态，不是自然教学／养成成本。已有兵器或教学结果不能替代这两个原控制入口。

| 原入口 | 原比较与作用 | 费用及施术者忙乱 |
| --- | --- | --- |
| [兰花拂穴](../../kungfu/skill/lanhua-shou/fu.c) | AP＝有效手法，DP＝有效招架／2；`AP/2 + random(AP) > DP`。命中目标忙乱 `AP/30+2` | 命中扣 100 内力、自忙 1；失手不扣内力、自忙 2；两者都返回 1 |
| [随波逐流](../../kungfu/skill/luoying-shenjian/sui.c) | AP＝有效剑法，DP＝有效招架；同一严格大于比较。命中目标忙乱＝原始落英神剑／22＋1 | 先扣 80；命中不设自忙，失手再扣 100、自忙 1；两者都返回 1 |

公式中的除法均按 LPC 整数截断。目标已有忙乱，两招都先拒绝，不能把初始忙乱 50 统计成本招控制成功。

具体位置：[fu.c:12–42、47–62](../../kungfu/skill/lanhua-shou/fu.c)、[sui.c:13–41、46–65](../../kungfu/skill/luoying-shenjian/sui.c)。兰花要求领悟、空手、原始兰花手和经络学各 120、已激发且已准备手法、内力 100；随波要求领悟、持剑、原始落英神剑 80、已激发剑法、有效内功 100、内力 100。两招均要求战斗中且目标活着。

随波最低内力 100 也可进入失手分支，原累计扣费 180，实际余量可为 **−80**；180 失手则为 0。[`add()`](../../mudcore/inherit/dbase.c) 112–121 行没有归零截断。这里保留原行为，不补款、不修游戏，也不把负内力修正为失败。

[公共命令](../../cmds/skill/perform.c) 115–127 行会在原技能返回 1 后独立尝试弱熟练增长。[有效等级](../../feature/skill.c) 135–150 行及[弱熟练](../../feature/skill.c) 255–308 行仍按原链计算：本组无武学修养，200 级特殊技能的未映射有效值为 100，熟练增量可为 0／1；400、800 级保证 +1。熟练增长不证明控制命中，不允许偷偷升修为。

[原忙乱接口](../../feature/action.c) 7–34 行有互搏／性格修正。本组明确光明磊落、无左右互搏，保留实际整数忙乱；不从这些整数推断秒数或自然解除时间。原 `start_busy`、随机调用及心跳策略不改。

## 2. 有限冻结矩阵

| 组 | 条件 | 正式计划 | 独立烟雾计划 |
| --- | ---: | ---: | ---: |
| 兰花拂穴 | 13 | 516 | 26 |
| 随波逐流 | 14 | 518 | 28 |
| 合计 | 27 | 1034 | 54 |

每招 200／400／800 级各一个代表条件；另有必命中、必失手和最低合法条件。兰花最低条件同时为手法／兰花 120、经络学 120、内力 100；随波最低条件为剑法／落英 80、基础内功 100＋碧波 50＝有效内功 100、内力 100。其余基础内功／碧波为 200／200，有效 300；目标基础招架 600、无特殊招架映射。

200 级原 AP 为 300。兰花必命中目标基础招架 598（DP 149），必失手为 1796（DP 449）；随波分别为 298（DP 149）、898（DP 449）。最低合法的目标基础招架为兰花 356／随波 118。这些是比较支持集边界，不强制随机数或指定有限样本命中比例。

兰花 7 条局部拒绝：无领悟、目标忙乱 50、持剑、兰花 119、经络 119、未准备、内力 99。随波 6 条：无领悟、目标忙乱 50、未持剑、落英 79、有效内功 99、内力 99。随波另外两条为原内力 100／180 的必失手；不扩成配装全排列，不追加公共忙乱／禁招／非战斗等全套拒绝。

每招 3 个代表、1 个必命中、1 个最低合法条件各 100 次；必失手、拒绝及两条内力透支机制条件各 2 次。烟雾每条件 2 次。正式与烟雾仅 `samples` 不同，不改变参数或资格。

冻结指纹（UTF-8 无额外换行）：

- 正式有序 `JSON.stringify(conditions)`：`4ca1afa364c2b385615aaaeae13016b5da2c945efafc59972f6f8b7cd8896b6f`。
- 烟雾有序 JSON：`1d6d039c4af6eee41187809511f35d21822395d8ef0e896c9db365a514cea81b`。
- 原台账递归键排序摘要：正式 `0e66de1c3ee3d2c07e302f3ad6926493bcf0e3a8f0444b7ba51b82ae807207e7`；烟雾 `6058a3a5eda16885954239600bf845e675d7188290a56a8f79ff4c1bcdce0af7`。
- 28 项有序 `source_evidence` JSON：`5f59018a931cfbdee9066385ae2f8601617964468d07695ea141cc367c642f9c`；完整逐文件 SHA 见第 5 节及每条条件。

## 3. 原记录校验与统计

[条件／校验模块](../../tools/tests/martial_data/school_taohua_control_cases.mjs)保留原状态，不回写 raw。核验实际对象、USER、战斗关系、技能／映射／准备、有效属性、光明磊落和领悟、真实剑重量 3000／伤害 50／锋刃标记 4／耐久 100（穿戴修正 dodge −1），以及全部原资源和临时属性。即时前后仅允许本招内力、原忙乱、原命令弱熟练及原 `notify_fail` 的已核变化，其他状态深比较不变。

无忙乱、明确零领悟可接受键存在的原 null／整数 0；缺键、字符串、错误类型不是零。实际计数映射存在时允许原稀疏零计数，缺映射不补零。纯控制窗口不能有攻击、被动、直伤计数、自然心跳、终态或回调。未启用的详细 `actions/directs` 数组不虚构成“已观察为零”，如果确有数组则必须空。

原临时提示与终端理由分账：[消息实现](../../adm/single/simul_efun/message.c) 267–270 行保存不带终端前缀的原文，终端追加固定 `ESC[256D ESC[K`。保留色码、正文和换行；拒绝时二者必须同源，只在核对已冻结中文理由时去显示转义。成功时也保留公共命令设置的默认提示，不吞掉其他临时字段。

`taohuaControlEffects(rows, frozenCondition)` 使用冻结条件，不依赖被执行器删除的 `raw.parameters`。分别报告已知命令／受理／拒绝分母、**受理后的新增控制率**、已知命令总体控制率、目标原忙乱／结束忙乱、新增控制量、原费用／剩余内力／负内力比例、施术者忙乱及熟练进度。目标忙乱 50 的拒绝只记已有状态；空样本或错误的未知效果不填成零费用或零命中率。

## 4. 最小共享接线（尚未实施）

1. 在后续唯一写入窗口注册 `taohuaControlConditions(catalog, readSource, options)`，绑定 `validateTaohuaControlRecord`；新增执行清单冻结本组两模块、统计／报告实际依赖及来源，不能回填旧系列。
2. 沿原 `perform hand.fu right`／`perform sword.sui right` 与 `named_participants`；原 `set_name`／`present(right)` 须对应精确目标，不改为省略目标绕过别名。
3. runner 仅为本组补快照读取两个对应领悟键、`character`、`fighting_opponent`、`secondary_weapon/details`。已有资源／装备／有效属性／熟练／临时数据观察复用，无新增游戏探针或执行器。
4. 沿已有目标 `start_busy(50)` 准备和准备后计数清零；不清掉目标忙乱、不补内力。两招无延迟回调，仍为原单命令即时窗口，不开展自然解忙。
5. 报告调用 `taohuaControlEffects(rows, condition)`，嵌入独立组数据，不覆盖公共 `sides`；按两招和每条冻结条件分别分母，不把不同防御初态混成实战胜率。

共享入口、runner、execution、report 均未在本准备中修改。后续须由主控在新系列完成真实烟雾、正式与原件／版本审核，才可报告效果。

离线入口：`node --test tools/tests/martial_data/school_taohua_control.test.mjs`。最终 15/15、退出 0（485.9691 ms）；两份 MJS 均经 `node --check` 通过。包含真实 `createSeries/openSeries` 临时台账、非法 ID／入口／重写反例和合成原协议，未启动驱动。11 条相对文档链接均有效，指定文件 `git diff --check` 无报错（新文件另查 UTF-8／LF／尾空白）；没有修改 LPC，LPC 格式化不适用，不把合成正例称为实测。

## 5. 来源字节

下列是实际文件 SHA256，每条条件完整冻结相同来源映射；最上方源码引用的路径均从本文所在 `docs/reviews/` 相对仓库根解析。

| 来源 | SHA256 |
| --- | --- |
| `kungfu/skill/lanhua-shou/fu.c` | `26fb68458078658719659944497449dc8b564e82ed092be20644b74ce656e98f` |
| `kungfu/skill/lanhua-shou.c` | `0062061b1a9d4512e6371e0e64fbf0312e1f71a3fd1cfe9a24db8c7534bebd30` |
| `kungfu/skill/luoying-shenjian/sui.c` | `459a1d75543579960a7994250e69054ab0507e988d14580a8817217d7922b8a7` |
| `kungfu/skill/luoying-shenjian.c` | `9761954cfb95512bd591fca36cbc39582afd863e5263c2d1cbb4efba0d182a95` |
| `kungfu/skill/hand.c` | `d6ac218642824b5b99748dc8ad7b89934159efd3d62957bec8a7d6025a8daa6f` |
| `kungfu/skill/sword.c` | `e5ab23fef7d3512584f9c00022c1ad1bf83d1b5ea8658dd0148702af64c87032` |
| `kungfu/skill/force.c` | `d851b531a263720e8382ea0292ef2990e0246b59abcaa0362cbc0c4c6bb1abae` |
| `kungfu/skill/bibo-shengong.c` | `5b5fa0a7d37b67773d32f4764c2f75625e077dffb59cd29874e1c49222f001ee` |
| `kungfu/skill/jingluo-xue.c` | `dc51ccb66a6e68d158dad783993e10118ffec9785971392b4e4059775f2cbd23` |
| `cmds/skill/perform.c` | `7bb9b93d1ce1bccf5587c942f2d7c30c8f3e1b5cb96c25719e0aef1032d20054` |
| `inherit/skill/skill.c` | `891da821f84c26820c1e540822dba751f218441cc03f2b95a1fcfcc3923294cd` |
| `feature/sserver.c` | `53ebb8c42b734b1123c373aa4a1bc3824b0056f155e6b429e5817a8d91d9fe31` |
| `feature/skill.c` | `99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8` |
| `feature/action.c` | `1950c8cef01eff2364cf981607dd1c254c607961152ae03f12b8a7cc15cd6f7a` |
| `mudcore/inherit/action.c` | `1ae2a04f0ecc46efa863bc0ca4281d897f26b6161de381cb2b23a39a33a9f2fe` |
| `feature/dbase.c` | `92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf` |
| `mudcore/inherit/dbase.c` | `097f1341d9a2be2d47798bef5400f4a7fdcbf413fe06b724581e76a512cbe8b3` |
| `feature/attack.c` | `1a23acd9a65ea55ff22eb88a802d5aab8c0b3084b6452a7b3c3553c6c8365103` |
| `feature/attribute.c` | `1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924` |
| `feature/equip.c` | `11f3cec8438a9fdd514cfeb9f8f4287ec1927e3235f4b10106a089acaace4f27` |
| `feature/name.c` | `5c7866f4ef8a9240b067bd75798433ad6f8eaae0ebc6b9cf3c88f974ca997d50` |
| `inherit/char/char.c` | `3936e5d65d00059fc0db268d6a4e74c6863ebc542152616d8a9ac34b46c224d2` |
| `inherit/weapon/sword.c` | `394e34677205e2b4d085ef348265f52ae89e90f60f5cc7ae40f0b207086c2349` |
| `inherit/misc/equip.c` | `2c27d3bc81c41204be8f4771e59561319f3f3c36aa00118465cb6ccdd3092e2b` |
| `adm/single/simul_efun/message.c` | `3ea8d542bd6a764764f11e28c393883b1e97ecd7758b11b9ddcaf477c1133036` |
| `include/globals.h` | `99e896f351cf614172d20a86deb3d7a8470fa215ba2ba90b2f0fb394d4fcf98b` |
| `include/combat.h` | `9b19065431f965beae165fd630c301bb7b5f5f24086a1eb99d8611696eb9612d` |
| `mudcore/include/ansi.h` | `4c061aef02f253f4af424d08dd2feaf3e7185b7e15b4e10f53ed5f6937a77a22` |

## 命令返回值契约补正（未采样）

此前合成自检只使用成功值 `1`，遗漏了原 [force_me](../../feature/command.c#L117) 直接返回 `command()` 正执行成本的语义；成功值并不固定为 `1`。这是独立采集校验器的错误，不是武学或驱动行为错误。本次只修正单命令 `raw.command_accepted`：键必须存在、值必须为非负安全整数，以大于零表示受理，以零表示拒绝；原始成本不归一化，也不与技能资源消耗混算。NPC 闭包返回值、聚合命令字段及游戏代码均未调整。

新增两项离线自检覆盖全部固定条件：成功成本 `1/23/476`、缺键／未定义／null／错误类型／负数／非整数／非有限值／超安全整数，以及成功零成本和拒绝正成本的反例。相同原记录在三种合法成本下得到相同统计，受理分母不累计执行成本，验证及统计不回写原记录。本组现为 **17/17 通过**；七组串行合计 **122/122 通过、退出 0**，不是 122 条真实游戏样本。

原有 27 条件／1034 正式计划／54 烟雾计划和两份完整有序条件 JSON 指纹保持不变，旧准备文件已由主控另行保全。上述历史自检结果保留；当前仍未注册共享执行，也未启动驱动或采集真实样本，后续烟雾／正式门槛不变。
