# 峨嵋原 NPC 配装与自动出招入口采集

2026-10-11，原游戏代码、NPC 属性及技能配置均不改。**36 条件、216 条正式记录；最终烟雾 36 条独立记录；运行／校验错误均为 0。**“观察成功”指记录完整，不能理解为所有绝招成功。

## 范围与方法

- 28 个原 NPC 各创建两次，共 56 个配装快照。沿用原 create/setup、虚拟物品加载和装备初始化，不把教师换成实验玩家、不补武器或技能。
- 周芷若原 `chat_msg_combat` 中八条闭包各调用 20 次，共 160 条。每次使用新原对象，只与真实测试玩家互列敌对；该玩家基本内功／闪躲／招架原始等级600、无特殊映射、气血10000、内力6000，未持器，测试护甲100。
- 直接调用原闭包，只观察同一轮执行中的即时状态，不等待 NPC 自然心跳、不强制随机。不模拟随机选招、技能冷却后的循环、受伤恢复或完整交锋；健康状态下 recover 返回0不能算恢复故障。
- 正式库不连接；所有实例、公开源码副本与记录在临时目录。原 NPC 在每条记录结束前销毁。玩家资源账与 NPC 前后状态分别保留。

## 原始配装

共 **12 名持剑、10 名持刀、6 名空手**。表内等级为该 NPC 的原始特殊内功等级，不是统一实验等级；未激发不是不会基本功。完整属性、技能表、实际装备属性及闭包原文在 JSON 中。

| NPC / 文件名 | 实际主手 | 内功 / 原始级别 | 招架激发 | 准备 | 战斗闭包数 |
| --- | --- | --- | --- | --- | ---: |
| 贝锦仪 (bei) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 静道师太 (dao) | none | emei-xinfa / 140 | emei-jian | hand: jieshou-jiushi、finger: tiangang-zhi | 4 |
| 道明小师父 (daoming) | none | 未激发 / — | 未激发 | 无 | 0 |
| 丁敏君 (ding) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 方碧琳 (fang) | blade | emei-xinfa / 120 | yanxing-dao | strike: jinding-zhang | 4 |
| 静风师太 (feng) | none | emei-xinfa / 140 | emei-jian | hand: jieshou-jiushi、finger: tiangang-zhi | 4 |
| 风陵师太 (fengling) | none | emei-jiuyang / 320 | jinding-zhang | strike: piaoxue-zhang | 5 |
| 郭襄 (guoxiang) | none | emei-jiuyang / 320 | jinding-zhang | strike: piaoxue-zhang | 5 |
| 静和师太 (he) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静慧师太 (hui) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 纪晓芙 (ji) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 静迦师太 (jia) | sword | emei-xinfa / 180 | yanxing-dao | strike: jinding-zhang、finger: tiangang-zhi | 5 |
| 静空师太 (kong) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 李明霞 (li) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 赵灵珠 (ling) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 灭绝师太 (miejue) | sword | linji-zhuang / 260 | yitian-jian | strike: jinding-zhang、hand: jieshou-jiushi | 7 |
| 苏梦清 (su) | sword | emei-xinfa / 120 | emei-jian | strike: sixiang-zhang | 4 |
| 文方小师太 (wenfang) | sword | 未激发 / — | 未激发 | 无 | 0 |
| 文晖小师太 (wenhui) | sword | 未激发 / — | 未激发 | 无 | 0 |
| 文清小师太 (wenqing) | sword | 未激发 / — | 未激发 | 无 | 0 |
| 文音小师太 (wenyin) | sword | 未激发 / — | 未激发 | 无 | 0 |
| 静闲师太 (xian) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静心师太 (xin) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静虚师太 (xu) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静玄师太 (xuan) | blade | emei-xinfa / 180 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静照师太 (zhao) | blade | emei-xinfa / 160 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 静真师太 (zhen) | blade | emei-xinfa / 160 | yanxing-dao | hand: jieshou-jiushi、finger: tiangang-zhi | 5 |
| 周芷若 (zhou) | none | yijin-duangu / 260 | yinlong-bian | strike: cuixin-zhang、claw: jiuyin-baiguzhao | 8 |

其中[灭绝](../../kungfu/class/emei/miejue.c)实际持普通长剑、招架激发倚天剑，并准备金顶／截手；[周芷若](../../kungfu/class/emei/zhou.c)只有淡烟衫、未持鞭，激发银龙鞭招架，准备催心掌／白骨爪。这是原配置，不按名称或武学类别替她们改装备，也不直接将混用招架判为缺陷。

## 周芷若八条原闭包

每行 20 次，独立新实例、原属性。原始基本／特殊内功各260、内力6000、加力200；有效力量48、身法50。

| 原入口 | 返回1 / 0 | NPC 实际内力消耗 | 观察 |
| --- | ---: | --- | --- |
| claw.duo | 20 / 0 | 250×7、300×9、450×4，均值312.5 | 首次命中9、变招命中4、两次未中7；公共直伤共13次 |
| claw.jie | 0 / 20 | 0 | 原动作文件不存在，未产生直伤或目标损伤 |
| strike.cuixin | 0 / 20 | 0 | 原动作文件不存在，未产生直伤或目标损伤 |
| whip.jiao | 0 / 20 | 0 | 原动作文件不存在；尚未进入招式，不把这次返回归因为持器门槛 |
| dodge.guiyuan | 20 / 0 | 200 | 临时 str/dex各+5，有效力量／身法仍48／50；不等于所有伤害收益为零 |
| recover | 0 / 20 | 0 | 满气血初态；未测试受伤后的恢复 |
| powerup | 20 / 0 | 100 | powerup=1，apply/attack增加130 |
| shield | 0 / 20 | 0 | 缺大伏魔拳及其激发，未产生护体标记 |

[夺命连环爪](../../kungfu/skill/jiuyin-baiguzhao/duo.c#L63)自身扣100，第一段未中再扣150；[公共直伤](../../adm/daemons/combatd.c#L1089)命中时另外扣原 NPC 的加力200。因此不能套用之前加力0的实验玩家费用。本批13次直伤下目标损伤范围789–1188；这不是全游戏伤害上下限，也不是自然战斗胜率。

[归元](../../kungfu/skill/shexing-lifan/guiyuan.c#L47)的字段问题是既有MA-111，本批增加原NPC证据；临时力量仍可能被其他伤害路径直接读取。三个错误动作入口为既有MA-108，本批60次原调用均复现。新增MA-112是原NPC小九阴护体前置缺失，详见[问题台账](../architecture/martial-arts-data-findings.md#ma-112周芷若原自动护体缺少必需武学)。全部只记录、不修复。

## 证据与前置失败

- 正式：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-5j7Jh6/runs/attempt-KWIAle`，PID39040退出0，驱动8.471秒，含准备56.99秒。
- 最终烟雾：`mud-martial-data-1PPp3g/runs/attempt-LAxaAA`，PID15012退出0，驱动2.731秒，含准备52.21秒。
- 严格报告：`C:/Users/oiuv/AppData/Local/Temp/mud-emei-npc-final-20261011/school-combat.json`及同名Markdown。
- 首次烟雾 `nTS2VB/attempt-4KHO8z`：4条校验错误来自把原playerp未设置值（JSON null）误当数字0，未导入成功记录；保留原件。修正后中间烟雾 `ByGjwD/attempt-GOHS8W` 完成36条，不混入最终烟雾分母。
- 首次正式 `Xgy0wy/attempt-TmERqG`：已导入57条，下一条因采集器漏算公共直伤的加力扣费而停止。修正观察／校验后另建上述最终烟雾及正式系列，旧失败不覆盖，也不计为新游戏错误。
- 03:45:56／03:46:01 +08复核正式／最终烟雾各10281项冻结输入、10155份公开副本、6份原观察探针、驱动和两份词法器，一致。旧附伤批2638条原证据摘要仍为 `2b6b7ddc6425bda07643dcc636e3b99161a88826597683c48de83d90fcaa811e`，未改写。

| 指纹 | 正式 | 最终烟雾 |
| --- | --- | --- |
| 系列 | `5e0a586cec8aa8e9b083125b44c15f563dc865155b83b275aa8581e50502fa98` | `997264aecac459a340d9acd1a60fe991f11181060c922008c30dfa8d24de3029` |
| 条件 | `7033739da6d799aa40d39a39a2d4e4067f2d7242720738f076db57a3a306c79d` | `aae087e1fbdc934d72df38901c37eb9280d6041802d1c397d5aefd8c6f67b052` |
| 原证据 | `695643c51a6fcd5bf024a9eeb80fa5ed231ae0445a664d22f4782a51f63fc533` | `2c9c78357190dbbd92232354417f8a645fab390e346ff5f8332a663f9bec122a` |
| 驱动输出 | `8af302763152e3009a2d43d128199934bef9125b74c95cf1be3f7f4bd7e26c12` | `176217c2cc000d96100d9c08ca1bbbb66447ca8d641f3716914d2fba61f9b6ba` |

HEAD `61d92f7c39449289f912c957d9d971daeccd775b`；mudcore `67e0bace181ec162e17b0f422813af2862a133ea`；驱动 `fluffos 20260929-5270e7d6-328aaf10`，SHA-256 `56c5f02398ecc35ee15f3b6b5f897471c1fdb35288d8b04b6681cb437581f135`。

## 复跑与覆盖

运行 `node tools/collect_martial_data.mjs school-combat --case-prefix school-emei-npc- --smoke` 验证小样本，去掉 `--smoke` 采正式；自检为 `node --test tools/tests/martial_data/school_emei_npc.test.mjs`。参见[条件及校验](../../tools/tests/martial_data/school_emei_npc_cases.mjs)、[原对象观察器](../../tools/tests/martial_data/npc_observer.lpc)和[验证记录](../../openspec/changes/collect-martial-arts-dataset/verification.md)。

全套工具838/838通过（433.629秒，0失败／取消／跳过）；随后补加力三分支测试，最终聚焦7/7通过。两份测试LPC格式化及check通过；八份文档1409链接、645源码行号、48标题锚点与112连续缺陷编号核对通过，OpenSpec strict与`git diff --check`通过。工作区398项变更均在tools／docs／openspec，游戏运行期LPC无差异，mudcore干净。旧11544条件289308计划记录指纹不变；当前11580条件289524计划记录不等于全部实测。

峨嵋二十一批累计4818条件69266条正式（65844观察／3422无进展），各批最终烟雾累计6232条。原NPC即时配装已采，但自然自动选招、完整交锋及全库覆盖尚未完成，OpenSpec仍10/17。缺陷112组，51组已有全部／局部驱动证据、61组仅静态，均未修复；不提交或部署。
