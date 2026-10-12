# 少林十八罗汉普通学习采集

2026-10-10，源码基线 `61d92f7c`。本批覆盖18位罗汉、57种技能的208条教师／技能关系，共 **749条件、7084条正式样本**：6556条增加学习进度、528条无进度，0运行／校验错误或残缺。游戏源码、公式、教师配置、玩家数据及正式服务均未修改。

## 方法与范围

使用隔离真实FluffOS、原USER与非巫师连接、原NPC及原 `learn`；不替换学习许可、随机进度或资源扣除。每条样本独立准备，保留教师实际等级、学生师承、技能／熟练度、精神、内力、潜能已用值及命令返回。条件和预期见[采集模块](../../tools/tests/martial_data/shaolin_learning_cases.mjs)，校验器单测不计入真实样本。

学生为少林男性僧人、指定教师的弟子，先天属性36、正气100000、经验1亿、精神10000、当前／最大内力6000、潜能10000、已用潜能0；基础技能、禅宗心法、混元一气与少林心法400，散花掌／伏魔剑80，目标技能等级另设。除目标基本内功外激发混元一气；不加武学修养或转世许可。夜叉棍持棍，大乘佛索、雷鸣鞭与青云鞭持鞭，装备实际属性亦纳入校验。

这些师承与前置技能是实验赋值，**不代表已经走完推荐信、拜师或自然养成流程**。本批仅含 `kungfu/class/shaolin/cheng-*.c`，少林目录63个NPC中的另外45个尚未在本批测试；不能把NPC自用技能直接宣布为玩家正常可学技能。

| 分组 | 条件数 | 样本数 | 有进度／无进度 |
| --- | ---: | ---: | ---: |
| 208条关系的10级、上限前一级、上限级 | 624 | 1248 | 832／416 |
| 18位教师的师父ID／姓名不匹配 | 36 | 72 | 0／72 |
| 57种技能50级单次学习随机分布 | 57 | 5700 | 5700／0 |
| 资源、叛师、戒律与持器对照 | 32 | 64 | 24／40 |

确定性边界各2次，随机分布各100次；独立烟雾749条不混入正式分母。7084条均执行一次学习命令，部分命令请求多次学习；实际消耗学习点合计6956，不能把命令数当学习次数或升级数。

## 教师与上限

下表为 `create()` 最终自身技能赋值去重后的关系数与等级范围。全部208条关系在本批合格前置下，10级及上限前一级均有进度、达到教师等级均拒绝。这些教师的技能等级均低于200，因此本批**没有验证**普通弟子的武学200级限制。

| 教师 | 文件 | 技能关系数 | 等级范围 |
| --- | --- | ---: | ---: |
| 澄观 | [cheng-guan.c](../../kungfu/class/shaolin/cheng-guan.c) | 10 | 85–90 |
| 澄和 | [cheng-he.c](../../kungfu/class/shaolin/cheng-he.c) | 12 | 80–95 |
| 澄寂 | [cheng-ji.c](../../kungfu/class/shaolin/cheng-ji.c) | 14 | 80–95 |
| 澄坚 | [cheng-jian.c](../../kungfu/class/shaolin/cheng-jian.c) | 11 | 85–90 |
| 澄净 | [cheng-jing.c](../../kungfu/class/shaolin/cheng-jing.c) | 11 | 85–90 |
| 澄灵 | [cheng-ling.c](../../kungfu/class/shaolin/cheng-ling.c) | 10 | 85–95 |
| 澄灭 | [cheng-mie.c](../../kungfu/class/shaolin/cheng-mie.c) | 11 | 80–95 |
| 澄明 | [cheng-ming.c](../../kungfu/class/shaolin/cheng-ming.c) | 11 | 85–90 |
| 澄尚 | [cheng-shang.c](../../kungfu/class/shaolin/cheng-shang.c) | 10 | 85–95 |
| 澄识 | [cheng-shi.c](../../kungfu/class/shaolin/cheng-shi.c) | 10 | 85–90 |
| 澄思 | [cheng-si.c](../../kungfu/class/shaolin/cheng-si.c) | 13 | 80–90 |
| 澄心 | [cheng-xin.c](../../kungfu/class/shaolin/cheng-xin.c) | 10 | 85–90 |
| 澄信 | [cheng-xin2.c](../../kungfu/class/shaolin/cheng-xin2.c) | 12 | 80–95 |
| 澄行 | [cheng-xing.c](../../kungfu/class/shaolin/cheng-xing.c) | 12 | 80–95 |
| 澄意 | [cheng-yi.c](../../kungfu/class/shaolin/cheng-yi.c) | 12 | 80–95 |
| 澄欲 | [cheng-yu.c](../../kungfu/class/shaolin/cheng-yu.c) | 10 | 85–95 |
| 澄知 | [cheng-zhi.c](../../kungfu/class/shaolin/cheng-zhi.c) | 14 | 80–95 |
| 澄志 | [cheng-zhi2.c](../../kungfu/class/shaolin/cheng-zhi2.c) | 15 | 80–90 |

师父ID与姓名任一不匹配的72条对照均无进度；其他师承／转世例外未测，不外推为游戏仅有这一种学习权限。

## 50级单次学习分布

每种技能100次。进度是熟练度增量，不是升了多少级；下表展示均值及实测最小—最大值，完整分位数保留在原始报告。每次实际学习扣精神5、潜能已用值加1，贡献和内力不变。

| 技能 | ID | 教师文件（省略cheng-） | 均值 | 实测范围 |
| --- | --- | --- | ---: | ---: |
| 般若掌 | banruo-zhang | ming | 10.11 | 3–18 |
| 基本刀法 | blade | xin2 | 9.89 | 3–18 |
| 禅宗心法 | buddhism | guan | 10.39 | 3–18 |
| 慈悲刀 | cibei-dao | xing | 10.18 | 3–18 |
| 基本爪法 | claw | jing | 11.06 | 3–18 |
| 基本棍法 | club | ji | 10.82 | 3–18 |
| 基本拳法 | cuff | yi | 10.72 | 3–18 |
| 大乘佛索 | dacheng-fosuo | zhi2 | 10.96 | 3–18 |
| 达摩剑 | damo-jian | shang | 10.65 | 3–18 |
| 基本轻功 | dodge | guan | 11.06 | 3–18 |
| 风云手 | fengyun-shou | guan | 11.18 | 3–18 |
| 基本指法 | finger | jian | 10.69 | 4–18 |
| 基本内功 | force | guan | 10.66 | 3–18 |
| 伏虎拳 | fuhu-quan | yi | 10.40 | 3–18 |
| 伏魔剑 | fumo-jian | he | 10.62 | 3–18 |
| 基本手法 | hand | guan | 9.97 | 3–18 |
| 红叶刀法 | hongye-daofa | xin2 | 10.39 | 3–18 |
| 回龙杖法 | huilong-zhang | si | 11.08 | 3–18 |
| 混元一气功 | hunyuan-yiqi | guan | 10.92 | 3–18 |
| 戒尘刀法 | jiechen-dao | xin2 | 10.19 | 3–18 |
| 寂灭爪 | jimie-zhua | jing | 11.31 | 3–18 |
| 大金刚拳 | jingang-quan | zhi | 10.89 | 3–18 |
| 雷鸣鞭法 | leiming-bian | zhi2 | 10.31 | 3–18 |
| 读书写字 | literate | guan | 11.38 | 3–19 |
| 六合鞭法 | liuhe-bian | zhi2 | 10.92 | 3–18 |
| 龙爪功 | longzhua-gong | jing | 11.14 | 3–18 |
| 十八罗汉棍 | luohan-gun | ji | 10.49 | 3–18 |
| 罗汉剑法 | luohan-jian | he | 11.35 | 3–18 |
| 罗汉拳 | luohan-quan | yi | 10.85 | 3–18 |
| 拈花指 | nianhua-zhi | jian | 9.88 | 3–18 |
| 基本招架 | parry | guan | 9.99 | 3–18 |
| 破衲功 | pona-gong | zhi | 10.08 | 3–18 |
| 普渡杖 | pudu-zhang | yu | 10.14 | 3–18 |
| 如来千叶手 | qianye-shou | xin | 10.53 | 3–18 |
| 清凉剑法 | qingliang-jian | he | 10.41 | 3–18 |
| 青云鞭法 | qingyun-bian | zhi2 | 11.12 | 3–18 |
| 擒拿十八打 | qinna-shibada | zhi | 10.92 | 3–18 |
| 去烦恼指 | qufannao-zhi | jian | 11.63 | 3–18 |
| 散花掌 | sanhua-zhang | si | 11.35 | 3–18 |
| 少林身法 | shaolin-shenfa | guan | 10.06 | 3–18 |
| 少林弹腿 | shaolin-tantui | zhi | 10.17 | 3–17 |
| 少林心法 | shaolin-xinfa | guan | 10.62 | 3–18 |
| 基本杖法 | staff | ji | 10.87 | 3–18 |
| 基本掌法 | strike | ming | 10.54 | 3–18 |
| 基本剑法 | sword | he | 10.58 | 3–18 |
| 基本拳脚 | unarmed | zhi | 11.32 | 3–18 |
| 韦陀杵 | weituo-chu | ji | 10.05 | 3–18 |
| 韦陀棍 | weituo-gun | ji | 10.60 | 3–18 |
| 基本鞭法 | whip | zhi2 | 10.75 | 3–18 |
| 握石掌 | woshi-zhang | ming | 10.34 | 3–18 |
| 无常杖 | wuchang-zhang | mie | 10.95 | 3–18 |
| 修罗刀 | xiuluo-dao | xin2 | 11.15 | 3–18 |
| 夜叉棍法 | yecha-gun | ji | 10.17 | 3–18 |
| 鹰爪功 | yingzhua-gong | shi | 11.39 | 3–18 |
| 一指禅 | yizhi-chan | zhi2 | 10.47 | 3–18 |
| 少林醉棍 | zui-gun | ling | 10.52 | 3–18 |
| 醉拳三打 | zuiquan-sanda | yi | 10.55 | 3–18 |

[原学习随机公式](../../cmds/skill/learn.c#L172)经[公共进度换算](../../feature/skill.c#L255)：通常有效悟性36，50级理论进度3–18，均值约10.652；识字50级使有效悟性为41，理论进度3–19、均值11.32。因此不能按这100次随机均值给武学或教师排强弱，也不能直接与此前100级采样作等条件比较。

## 资源与资格边界

- 7084次命令中6562次返回1，但只有6556条增加学习进度。多出的6条是零经验学习达摩剑2条、精神4学习达摩剑／禅宗心法4条；报告不把“已受理”当学会。
- 达摩剑／禅宗心法50级：精神4时清零且无进度；精神5时完成1次；精神14请求3次只完成2次，已用潜能加2、精神清零。各自请求100次均完成，扣精神500、学习点100，仍未升级。
- 潜能不足、忙乱、战斗和玩家主动禁止学习分别拒绝。零经验达摩剑无进度，禅宗心法仍可学；当前内力0可学，但最大内力仍6000，不解释为没有内功前置。
- 澄尚禅宗心法85级、叛师1次时，学生82级可学、83级拒绝；同样82／83级的达摩剑均可学，其教师等级95。这只是达摩剑对照，未采其叛师后的92／93级临界点。
- 澄观的混元一气和禅宗心法均因 `guilty=1` 拒绝；女性、已婚的混元一气学习对照均拒绝。只记录这几个实际分支，不声称穷尽少林戒律或全部身份限制。
- 夜叉棍、大乘佛索、雷鸣鞭、青云鞭缺所需兵器时均拒绝；没有改变兵器属性或实际类别来绕过门槛。

本批未新增明确游戏缺陷。既有[问题台账](../architecture/martial-arts-data-findings.md)102组仍保留待后续统一处理，不以本批无异常证明全项目无错误。

## 证据与验证

- 正式系列：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-bWsS7m/runs/attempt-ZLrAyZ`，7084/7084；PID7736退出0，驱动183.648秒、含准备228.79秒。采集期间同时运行工具回归，耗时不作为性能基线。
- 烟雾系列：`C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-RJTW4Q/runs/attempt-IImv2J`，749/749；PID4252退出0，驱动11.682秒。烟雾不能作为正式随机分布报告，报告器保持拒绝该用途。
- 正式JSON／Markdown：`C:/Users/oiuv/AppData/Local/Temp/mud-shaolin-luohan-learning-20261010/teaching.{json,md}`，严格报告校验通过。
- 系列指纹：`4f3127e1e3b74fa4166ed4d1da985f2c23b254aa5eced6dfbac0338f2eb0f794`；证据摘要：`c6a5d2180a64c028e28f18303b4a233d799e8173834ee0a73a572bce372fc31c`。
- 驱动输出hash：`f6f99ecab7192cd5ecd4d34ad246ae6aa8bf0129ac88c722da57b79f044e58e4`；报告器hash：`56d0742795a9be24b45874885316ec18967497eca67e4b527cca02c0d57dabc0`。
- 10230项冻结输入（10143公开文件、87工具）与当前文件逐项hash一致；公开隔离副本对应原hash或6份既有探针after hash，没有新增游戏探针。十八罗汉相关87份源码组合hash亦固定在采集模块中。
- 全套工具 **616/616通过**，0失败／取消／跳过，126.495秒。历史测试只排除新增组，保留原数量断言；原5344条件／19410计划样本的完整JSON指纹不变。

当前教学计划6093条件／26494样本，与另一个 `school-combat` 计划8928条件／228098样本分开统计，均不当成全库已执行量。OpenSpec整体仍 **10/17**；4.2、5.2继续进行。下一批应补其余少林教师与特殊认可／授课；完整交锋、其他门派和全武学覆盖仍待完成。未提交、推送或部署。
