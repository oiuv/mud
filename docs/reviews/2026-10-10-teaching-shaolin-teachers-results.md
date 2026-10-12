# 少林其余教师普通学习与特殊认可采集

2026-10-10，源码基线 `61d92f7c`。本批覆盖此前十八罗汉以外的45个少林NPC、90种技能、722条最终初始化技能关系，共 **2356条件、13140条正式样本**，0运行错误、校验错误或残缺。11218条有学习或许可进展、1922条无进展；实际增加目标技能熟练度的是11214条，另4条只有赠书取得的许可／奖励，不能当作目标武学学成。

与[十八罗汉批次](2026-10-10-teaching-shaolin-luohan-results.md)合计覆盖少林63个NPC、930条初始化技能关系的普通学习。本页不代表拜师、罗汉阵、全部特殊授课或完整门派交锋已完成；游戏代码、教师配置、公式、正式服务和玩家数据均未修改。

## 方法与条件

通过隔离真实FluffOS、原USER和非巫师连接执行原NPC、`learn`、`give`。每条样本独立准备，保留原许可判断、学习冷却、随机进度及资源扣除；条件见[独立采集模块](../../tools/tests/martial_data/shaolin_teachers_cases.mjs)。

42个普通教师采用实验师承；无名僧、空见、觉远不设为实验师父，而是走原 `recognize_apprentice`。其他前置通常为400级，先天悟性36、根骨40、正气100000、经验1亿、当前／最大内力6000、精神10000、潜能10000；除目标基本内功外激发混元一气。青云鞭高等级按原规则提高正气；辟邪剑学生为无性、心狠手辣；八门持器技能配实际刀、棍或鞭。这些是有依据的实验初态，**不证明玩家已完成自然养成或拜师流程**。

| 条件组 | 条件数 | 样本数 | 有进展／无进展 | 实际学习步数 |
| --- | ---: | ---: | ---: | ---: |
| 722条关系各10级 | 722 | 1444 | 1304／140 | 1304 |
| 各关系上限前一级 | 722 | 1444 | 1304／140 | 1304 |
| 各关系达到上限 | 722 | 1444 | 2／1442 | 0 |
| 42位教师的师父ID／姓名不符 | 84 | 168 | 0／168 | 0 |
| 86种可学技能100级随机分布 | 86 | 8600 | 8600／0 | 8600 |
| 认可、赠书、重复及缺武器对照 | 20 | 40 | 8／32 | 6 |
| 合计 | 2356 | 13140 | 11218／1922 | 11214 |

确定性条件各2次，随机分布各100次；2356条成功烟雾及两轮失败烟雾另存，不混入分母。13140条样本包含13258个命令步骤，其中赠书114步、学习13144步；部分样本有多个步骤，不能混算命令数、学习次数和升级数。

## 教师关系与上限

以下关系来自 `create()` 最终自身技能赋值去重，不是可传授清单。普通弟子的武学上限取教师等级与200的较小值；知识类仍按教师等级。特殊认可另按原NPC规则，不套实验弟子限制。

| 教师程序 | 初始化技能关系 | NPC自用等级范围 | 本批条件／样本 |
| --- | ---: | ---: | ---: |
| [da-mo.c](../../kungfu/class/shaolin/da-mo.c) | 56 | 280–600 | 227／5550 |
| [dao-chen.c](../../kungfu/class/shaolin/dao-chen.c) | 11 | 50–50 | 35／70 |
| [dao-cheng.c](../../kungfu/class/shaolin/dao-cheng.c) | 12 | 50–52 | 38／76 |
| [dao-guo.c](../../kungfu/class/shaolin/dao-guo.c) | 12 | 50–50 | 38／76 |
| [dao-jue.c](../../kungfu/class/shaolin/dao-jue.c) | 12 | 50–55 | 38／76 |
| [dao-pin.c](../../kungfu/class/shaolin/dao-pin.c) | 12 | 50–54 | 38／76 |
| [dao-xiang.c](../../kungfu/class/shaolin/dao-xiang.c) | 12 | 50–50 | 38／76 |
| [dao-xiang2.c](../../kungfu/class/shaolin/dao-xiang2.c) | 10 | 50–50 | 32／64 |
| [dao-yi.c](../../kungfu/class/shaolin/dao-yi.c) | 11 | 50–50 | 35／70 |
| [dao-zheng.c](../../kungfu/class/shaolin/dao-zheng.c) | 12 | 50–50 | 38／76 |
| [du-e.c](../../kungfu/class/shaolin/du-e.c) | 38 | 280–400 | 123／932 |
| [du-jie.c](../../kungfu/class/shaolin/du-jie.c) | 37 | 280–400 | 113／226 |
| [du-nan.c](../../kungfu/class/shaolin/du-nan.c) | 37 | 280–400 | 113／226 |
| [du-yuan.c](../../kungfu/class/shaolin/du-yuan.c) | 22 | 240–300 | 69／236 |
| [hui-he.c](../../kungfu/class/shaolin/hui-he.c) | 12 | 68–80 | 38／76 |
| [hui-jie.c](../../kungfu/class/shaolin/hui-jie.c) | 12 | 70–77 | 38／76 |
| [hui-kong.c](../../kungfu/class/shaolin/hui-kong.c) | 10 | 70–70 | 32／64 |
| [hui-ming.c](../../kungfu/class/shaolin/hui-ming.c) | 12 | 70–74 | 38／76 |
| [hui-ru.c](../../kungfu/class/shaolin/hui-ru.c) | 10 | 70–70 | 32／64 |
| [hui-se.c](../../kungfu/class/shaolin/hui-se.c) | 12 | 70–74 | 38／76 |
| [hui-xiu.c](../../kungfu/class/shaolin/hui-xiu.c) | 12 | 70–76 | 38／76 |
| [hui-xu.c](../../kungfu/class/shaolin/hui-xu.c) | 12 | 69–78 | 38／76 |
| [hui-zhen.c](../../kungfu/class/shaolin/hui-zhen.c) | 14 | 70–100 | 44／88 |
| [jue-yuan.c](../../kungfu/class/shaolin/jue-yuan.c) | 12 | 100–400 | 41／180 |
| [kong-jian.c](../../kungfu/class/shaolin/kong-jian.c) | 13 | 180–280 | 44／186 |
| [qing-fa.c](../../kungfu/class/shaolin/qing-fa.c) | 11 | 30–50 | 35／70 |
| [qing-guan.c](../../kungfu/class/shaolin/qing-guan.c) | 9 | 30–30 | 29／58 |
| [qing-le.c](../../kungfu/class/shaolin/qing-le.c) | 9 | 30–30 | 29／58 |
| [qing-shan.c](../../kungfu/class/shaolin/qing-shan.c) | 9 | 30–35 | 29／58 |
| [qing-wei.c](../../kungfu/class/shaolin/qing-wei.c) | 9 | 30–30 | 29／58 |
| [qing-wen.c](../../kungfu/class/shaolin/qing-wen.c) | 9 | 30–35 | 29／58 |
| [qing-wu.c](../../kungfu/class/shaolin/qing-wu.c) | 9 | 30–30 | 29／58 |
| [qing-xiao.c](../../kungfu/class/shaolin/qing-xiao.c) | 9 | 30–35 | 29／58 |
| [qing-yuan.c](../../kungfu/class/shaolin/qing-yuan.c) | 9 | 30–30 | 29／58 |
| [tuoboseng.c](../../kungfu/class/shaolin/tuoboseng.c) | 7 | 41–42 | 23／46 |
| [wuming.c](../../kungfu/class/shaolin/wuming.c) | 44 | 300–450 | 137／372 |
| [xingzhe.c](../../kungfu/class/shaolin/xingzhe.c) | 8 | 50–50 | 26／52 |
| [xu-ming.c](../../kungfu/class/shaolin/xu-ming.c) | 9 | 30–30 | 29／58 |
| [xu-tong.c](../../kungfu/class/shaolin/xu-tong.c) | 9 | 20–20 | 29／58 |
| [xuan-bei.c](../../kungfu/class/shaolin/xuan-bei.c) | 18 | 180–200 | 56／112 |
| [xuan-ci.c](../../kungfu/class/shaolin/xuan-ci.c) | 36 | 180–200 | 122／1420 |
| [xuan-ji.c](../../kungfu/class/shaolin/xuan-ji.c) | 14 | 150–180 | 45／188 |
| [xuan-ku.c](../../kungfu/class/shaolin/xuan-ku.c) | 33 | 180–200 | 114／1208 |
| [xuan-nan.c](../../kungfu/class/shaolin/xuan-nan.c) | 18 | 125–180 | 56／112 |
| [xuan-tong.c](../../kungfu/class/shaolin/xuan-tong.c) | 18 | 140–180 | 56／112 |

10级和上限前一级各有652条关系能实际学习，另外70条各自拒绝。拒绝包含NPC虽自用却不教、三渡禁止传授少林九阳、武学修养自身 `valid_learn` 拒绝；不是采集缺失。全部722条达到本批设定上限均无目标技能进度。上限组的2条“有进展”仅因先向觉远交书获得许可／奖励。

## 100级学习随机分布

每项100次，均实际增加目标熟练度；表中是熟练度而非等级增量。实际学习每次扣精神8、增加已用潜能1，不扣贡献或内力。觉远先交书的步骤精神消耗为0，不能把赠书和学习平均后的4点当作学习费用。

| 技能 | ID | 教师程序 | 均值 | 实测范围 |
| --- | --- | --- | ---: | ---: |
| 般若掌 | banruo-zhang | da-mo | 13.89 | 3–26 |
| 基本刀法 | blade | da-mo | 15.48 | 3–26 |
| 禅宗心法 | buddhism | da-mo | 14.78 | 3–26 |
| 慈悲刀 | cibei-dao | da-mo | 15.04 | 3–26 |
| 基本爪法 | claw | da-mo | 13.75 | 3–26 |
| 基本棍法 | club | da-mo | 14.95 | 3–26 |
| 基本拳法 | cuff | da-mo | 14.05 | 3–26 |
| 大乘佛索 | dacheng-fosuo | xuan-ku | 14.74 | 3–26 |
| 大慈大悲手 | dacidabei-shou | da-mo | 14.29 | 3–26 |
| 达摩剑 | damo-jian | da-mo | 14.16 | 3–26 |
| 基本轻功 | dodge | da-mo | 13.39 | 3–26 |
| 多罗叶指 | duoluoye-zhi | xuan-ci | 14.95 | 3–26 |
| 风云手 | fengyun-shou | da-mo | 13.96 | 3–26 |
| 基本指法 | finger | da-mo | 14.62 | 3–26 |
| 基本内功 | force | da-mo | 15.17 | 3–26 |
| 伏虎拳 | fuhu-quan | xuan-ci | 13.63 | 3–26 |
| 伏魔剑 | fumo-jian | da-mo | 13.82 | 3–26 |
| 基本手法 | hand | da-mo | 12.80 | 3–25 |
| 红叶刀法 | hongye-daofa | xuan-ku | 16.00 | 3–26 |
| 回龙杖法 | huilong-zhang | xuan-ku | 14.75 | 3–26 |
| 混元一气功 | hunyuan-yiqi | du-e | 13.55 | 3–26 |
| 袈裟伏魔功 | jiasha-fumogong | da-mo | 14.38 | 3–26 |
| 戒尘刀法 | jiechen-dao | xuan-ku | 15.44 | 3–26 |
| 寂灭爪 | jimie-zhua | da-mo | 14.58 | 3–26 |
| 金刚不坏体 | jingang-buhuaiti | kong-jian | 14.60 | 3–26 |
| 大金刚拳 | jingang-quan | da-mo | 13.88 | 3–26 |
| 金刚指 | jingang-zhi | du-e | 15.34 | 3–26 |
| 经络学 | jingluo-xue | da-mo | 15.85 | 3–26 |
| 雷鸣鞭法 | leiming-bian | xuan-ku | 13.74 | 3–26 |
| 读书写字 | literate | da-mo | 10.49 | 3–19 |
| 六合鞭法 | liuhe-bian | xuan-ku | 14.30 | 3–26 |
| 龙形剑法 | longxing-jian | da-mo | 14.11 | 3–26 |
| 龙爪功 | longzhua-gong | da-mo | 13.72 | 3–26 |
| 罗汉伏魔神功 | luohan-fumogong | du-e | 15.10 | 3–26 |
| 十八罗汉棍 | luohan-gun | xuan-ku | 14.80 | 3–26 |
| 罗汉剑法 | luohan-jian | xuan-ku | 14.16 | 3–26 |
| 罗汉拳 | luohan-quan | da-mo | 15.90 | 3–26 |
| 基本医术 | medical | da-mo | 14.62 | 3–26 |
| 拈花指 | nianhua-zhi | da-mo | 14.09 | 3–26 |
| 基本招架 | parry | du-e | 15.04 | 3–26 |
| 辟邪剑法 | pixie-jian | du-yuan | 14.07 | 3–26 |
| 破衲功 | pona-gong | xuan-ci | 13.80 | 3–26 |
| 普渡杖 | pudu-zhang | da-mo | 14.87 | 3–26 |
| 如来千叶手 | qianye-shou | da-mo | 14.60 | 3–26 |
| 清凉剑法 | qingliang-jian | xuan-ku | 13.93 | 3–26 |
| 青云鞭法 | qingyun-bian | da-mo | 14.52 | 3–26 |
| 擒拿十八打 | qinna-shibada | xuan-ci | 13.76 | 3–26 |
| 七星罗刹棍 | qixing-gun | da-mo | 14.69 | 3–26 |
| 去烦恼指 | qufannao-zhi | xuan-ci | 13.97 | 3–26 |
| 取经棍法 | qujing-gunfa | da-mo | 14.49 | 3–26 |
| 燃木刀法 | ranmu-daofa | da-mo | 14.52 | 3–26 |
| 日月鞭法 | riyue-bian | du-e | 15.74 | 3–26 |
| 千手如来掌 | rulai-zhang | wuming | 14.36 | 3–26 |
| 如影随行腿 | ruying-suixingtui | du-e | 15.37 | 3–26 |
| 散花掌 | sanhua-zhang | da-mo | 15.15 | 3–26 |
| 梵文 | sanscrit | da-mo | 13.77 | 3–26 |
| 少林九阳功 | shaolin-jiuyang | jue-yuan | 14.27 | 3–26 |
| 少林身法 | shaolin-shenfa | da-mo | 13.92 | 3–26 |
| 少林弹腿 | shaolin-tantui | xuan-ci | 14.85 | 3–26 |
| 少林心法 | shaolin-xinfa | da-mo | 14.13 | 3–26 |
| 少林医术 | shaolin-yishu | da-mo | 13.50 | 3–26 |
| 神风鞭法 | shenfeng-bian | da-mo | 14.62 | 3–26 |
| 神掌八打 | shenzhang-bada | xuan-ci | 15.29 | 3–26 |
| 基本杖法 | staff | da-mo | 15.58 | 3–26 |
| 基本掌法 | strike | da-mo | 13.97 | 3–26 |
| 基本剑法 | sword | da-mo | 14.46 | 3–26 |
| 天竺拂指 | tianzhu-fuzhi | xuan-ci | 14.28 | 3–26 |
| 基本拳脚 | unarmed | da-mo | 14.97 | 3–26 |
| 韦陀杵 | weituo-chu | da-mo | 15.24 | 3–26 |
| 韦陀棍 | weituo-gun | da-mo | 14.21 | 3–26 |
| 基本鞭法 | whip | du-e | 14.63 | 3–26 |
| 握石掌 | woshi-zhang | xuan-ci | 14.96 | 3–26 |
| 无常杖 | wuchang-zhang | da-mo | 14.59 | 3–26 |
| 无相指法 | wuxiang-zhi | xuan-ci | 15.19 | 3–26 |
| 修罗刀 | xiuluo-dao | da-mo | 14.36 | 3–26 |
| 修罗指 | xiuluo-zhi | xuan-ci | 16.21 | 3–26 |
| 须弥山掌 | xumishan-zhang | da-mo | 14.02 | 3–26 |
| 夜叉棍法 | yecha-gun | xuan-ku | 14.41 | 3–26 |
| 易筋经神功 | yijinjing | da-mo | 15.00 | 3–26 |
| 鹰爪功 | yingzhua-gong | da-mo | 14.32 | 3–26 |
| 因陀罗爪 | yintuoluo-zhua | da-mo | 13.67 | 3–26 |
| 一拍两散 | yipai-liangsan | xuan-ji | 14.37 | 3–26 |
| 一苇渡江 | yiwei-dujiang | da-mo | 15.22 | 3–26 |
| 一指禅 | yizhi-chan | da-mo | 14.68 | 3–26 |
| 少林醉棍 | zui-gun | da-mo | 13.62 | 3–26 |
| 醉拳三打 | zuiquan-sanda | xuan-ci | 16.30 | 3–26 |

按[原学习公式](../../cmds/skill/learn.c#L172)和[进度换算](../../feature/skill.c#L255)，通常有效悟性76，理论进度范围3–26；目标读书写字100级时有效悟性46，范围3–19。教师按已有技能和合法教学关系选取，不把随机均值差异当教师强弱排名，也不与十八罗汉50级批次混作同条件比较。90种自用技能中武学修养不能这样学习，九阳神功、峨嵋九阳、武当九阳仅觉远持有但不传授，因此不伪造这4种技能的合法分布。

## 特殊认可与资源边界

- [无名僧](../../kungfu/class/shaolin/wuming.c#L134)：仅少林、正气至少50000，教授基本掌法、基本拳脚、千手如来掌和如影随形腿。实测49999拒绝、50000允许；基本掌法／拳脚179级可学、180级拒绝。其他技能即使NPC自用也不据此获得教学权。
- [空见](../../kungfu/class/shaolin/kong-jian.c#L89)：只认可少林弟子学习金刚不坏体，禅宗心法249拒绝、250允许；其他技能／外派拒绝。原临时认可标记在调用前后单独核对。
- 两位特殊教师的重复认可用零潜能执行两次原学习入口：认可可保留，但学习均拒绝；**不是两次连续学习成功**，没有绕过原1秒冷却。临时认可标记本身不计为目标学习进度。
- [觉远](../../kungfu/class/shaolin/jue-yuan.c#L91)：只预设昆仑九阳许可，经原 `give` 交付[楞伽经定义](../../d/items/book_data.h#L317)，由原代码取得少林九阳许可和武学修养奖励。使用原虚拟书对象，不替换收书回调或提前写少林许可。
- 没有昆仑许可时书仍被原逻辑收走，但不授少林许可、不能学；已有许可重复交书不重复发修养奖励。正常取得许可后仅少林九阳可学，到180级不再增加进度；取得许可后询问基本内功仍不能学。修养奖励不是少林九阳等级，不能混算。
- 42位实验师父的ID／姓名任一不匹配均无进度。夜叉棍、取经棍、燃木刀、大乘佛索、雷鸣鞭、青云鞭、日月鞭、神风鞭缺所需武器的16条均拒绝。这里不穷举所有师承、转世、资源或身份组合。
- 学习命令11884步返回受理，但只有11214步实际增加目标进度；正常拒学有的原命令仍返回1。本报告按技能、熟练度、资源和许可实际变化判断，不能把接口返回值当学会。

## 明确问题只记录

核对教师公共头文件时新增[MA-103](../architecture/martial-arts-data-findings.md#ma-103罗汉阵等待计数器每次回调重置超时分支不可达)：玄苦、玄难的等待计数为局部变量，每次回调重置，300秒超时分支不可达。此为静态确认，未运行300秒阵法流程，也不推断满足条件后阵法无法开始。缺陷台账共103组，全部留待后续处理；本批学习采集没有修复游戏逻辑。

## 证据与复核

下列临时目录统一前缀为 `C:/Users/oiuv/AppData/Local/Temp/`；原始数据没有提交，清理临时目录前应另行保留需要长期追溯的证据。

- 正式：`mud-martial-data-M57rm7/runs/attempt-l0sS6N`，13140/13140，PID25520退出0，驱动264.127秒、含准备324.44秒。采集与工具回归并行，耗时不作游戏性能基线。
- 成功烟雾：`mud-martial-data-mFT5PX/runs/attempt-NMQRrY`，2356/2356，PID66472退出0，驱动49.219秒、含准备73.86秒；0校验错误或残缺。
- 失败烟雾：`mud-martial-data-rnTVQI/runs/attempt-rPdb5V`，175条导入，1条校验失败；青云鞭199级需要正气110100，实验初态原为100000。只修夹具前置，未改游戏门槛。
- 失败烟雾：`mud-martial-data-wbD5PK/runs/attempt-eqx0Rz`，2344条导入，2条校验失败；原学习冷却阻止即时第二次成功学习。改为上述零潜能重复认可对照，保留冷却与失败记录。
- 正式报告：`mud-shaolin-teachers-learning-20261010/teaching.{json,md}`，严格校验通过；系列指纹 `5b902ffb02a90fc1968871f59d3323582cfec7ee16361d1318a316d20f70a8c8`，证据摘要 `b916ee41bbdd94df76751a2426a7713cfb3163fe9208e29aab5c91ef309f956b`。
- 驱动输出hash：`8e02aa42bc9e51a3674b94f1e67d2041dbf6814c10f2ff0efc317c9075d8152a`；报告器hash：`a3ea654f86b4a5ed11c91a620a9d6c8260ac8b4d332e14e0bffe083b4d9b9b10`。
- 10231项冻结输入（10143公开文件、88工具）与当前文件逐项一致，公开隔离副本对应原hash或6份既有探针after hash，没有新增游戏探针；本批159份相关源码组合hash为 `415daa77974a02f1d1314c8a6f5e27449816c03a3e58d385af7aa4715eb79c69`。
- 新增5项工具自检通过，全套工具 **621/621通过**（0失败／取消／跳过，203.941秒）；181份JavaScript语法检查通过，测试LPC观察器格式化及check通过。旧6093条件完整JSON指纹仍为 `be56bb6ef2eab38c5f054dfe72e08ec5faf3d8325df7deaafe5c2ecbad916a64`；旧十八罗汉7084条严格只读重验通过，证据摘要不变。

重采时以下两条分别创建新的隔离系列，不覆盖旧数据；第二条为完整批次，最后一条只读校验已存在的正式系列。

```powershell
node tools/collect_martial_data.mjs teaching --case-prefix teaching-shaolin-teachers- --smoke
node tools/collect_martial_data.mjs teaching --case-prefix teaching-shaolin-teachers-
node tools/tests/martial_data/teaching_report.mjs C:/Users/oiuv/AppData/Local/Temp/mud-martial-data-M57rm7
```

当前教学计划8449条件／39634样本，34目录分组、213教师程序、1983教师／主题组合；与 `school-combat` 计划8928条件／228098样本分开，均不代表全库已执行量。OpenSpec仍 **10/17**，不提前勾选4.2或5.2。后续继续少林尚未覆盖的特殊教学／拜师与完整配置交锋，再推进其他门派和全武学。未提交、推送或部署。
