# 字段、动作及补充文案子项状态

## 范围与证据

本表仅记录本分工负责的子项，不代表原台账144组全部关闭。原台账为 `docs/architecture/martial-arts-data-findings.md`，修前基线为 `e54a7cd8847206c4e33581251c7dbaf4dda9bf3e`；原发现、原样本与原指纹保持原样。下列“子项”说明是本次工作定位标签，不重新编号历史缺陷。

- 主 Agent 提供的最新真实隔离驱动证据：`mud-martial-audit-NxL4YS`，fields **537项检查、0失败**。它证明对应夹具断言通过，不是全库或平衡性验收。
- 文案合并守卫：**215条规则／149文件，132纯文案文件token精确一致，17混合文件**。混合文件仍需对应功能回归，不因文案守卫通过而认定逻辑正确。
- 本分工没有连接正式服、修改玩家存档或重采历史武学数据。本表未启动驱动，运行结果由主 Agent 串行执行并交付。
- `tools/tests/martial_audit/field_fixes.lpc` 以下简称“fields”；静态文案规则分别见 `text_fixes.json`、`text_extra_fixes.json`、`npc_text_fixes.json`（均位于同一夹具目录）。
- 本表中列为“已实现／对应断言通过”的行以明确断言为边界。纯文案静态一致不冒称全部客户端文字已显示；未在fields中独立覆盖的分支明确说明。

## 逻辑及字段子项

以下未写完整前缀的技能路径均相对 `kungfu/skill/`。

| 原编号／具体子项 | 路径 | 当前修复与行为依据 | 验证及限定 |
|---|---|---|---|
| MA-001 吹箫贡献 | `yuxiao-jian/qing.c` | 拼错技法ID改真实chuixiao-jifa，沿用原AP与双方内力公式 | fields `check_qing`：技法0/400，自耗120/500、对手内力0/1100 |
| MA-002 拒学技能名 | `jiuyin-shengong.c` | 提示数组改为资格判断实际使用的usage_skills2，避免提示另一门技能；实际检查三项原始基本技能，不依赖force映射 | 新增`check_jiuyin_learning_message`：其余条件恰满足，对unarmed/dodge/force分别199拒绝、200恢复通过，完整提示必须分别为基本拳脚/基本轻功/基本内功，不含误读的基本掌法/基本爪法；这些新增断言待下一次串行驱动验证，不计入既有537/0 |
| MA-005 抽髓相对门槛 | `chousui-zhang.c` | choushui-zhang改chousui-zhang，读自身等级 | `check_growth_and_learning`：基本80/自身81拒绝，80/80通过 |
| MA-005 扶桑成长 | `fushang-neigong.c` | fushang-shengong改fushang-neigong | 原成长公式在0/100/200精确输出 |
| MA-005 金刚不坏护体 | `jingang-buhuaiti/jingang.c` | jingang-buhuai改jingang-buhuaiti，保留技能贡献一半 | `check_guards_and_attacks`：有效force700及护甲、重复拒绝、原增量清理 |
| MA-005／MA-092 经络门槛及伤害 | `jingang-zhi/san.c` | jinluo-xue改jingluo-xue；同一修复关联两组，不重复算两次源码修复 | 经络200/400的原公式输入精确核验 |
| MA-005 井中八法命中 | `jingzhong-bafa/bafa.c` | 去掉ID末尾多余右括号 | 原8击，命中17+200/3，结束还原17 |
| MA-005 九阴九击增益 | `jiuyin-shengong/perform/zhang.c` | jiujin-shengong改jiuyin-shengong | 原9击、300/5增益及撤销、原费用 |
| MA-005 冷月无性限制 | `lengyue-shengong.c` | lenyue-shengong改lengyue-shengong | 49通过、50拒绝；基本内功条件不变 |
| MA-005 乾坤超级目标防御 | `qiankun-danuoyi/nuoyi.c` | matrial-cognize改martial-cognize | 修养0/400对照原半血伤害路线 |
| MA-005 一阳指气血恢复读取 | `sun-finger/heal.c` | 第一处sun_finger改sun-finger | `check_heal`原气血创伤恢复公式，技能0/200 |
| MA-005 一阳指精神恢复读取 | `sun-finger/heal.c` | 第二处sun_finger改sun-finger | 同夹具原精神创伤恢复公式；忙乱拼写另属状态组 |
| MA-005 笑傲吹箫资格 | `xiaoao-jianghu.c` | cuhixiao-jifa改chuixiao-jifa | 吹箫100通过/99拒绝；比较曲门槛原样保留 |
| MA-005 夕阳成长 | `xiyang-neigong.c` | xiyang-shengong改xiyang-neigong | 原成长公式0/100/200 |
| MA-005 轩辕箭法相对门槛 | `xuanyuan-arrow.c` | xuanyuan-arror改xuanyuan-arrow | 基本20/自身21拒绝、20通过 |
| MA-005 药王妙术相对门槛 | `yaowang-miaoshu.c` | yaowang-mishu改yaowang-miaoshu | 基本100/自身101拒绝、100通过 |
| MA-010 冰蚕五式 | `bingcan-duzhang.c` | 五个dmage改damage，原值不变 | `check_action_fields`逐项52/67/82/95/105，且无dmage |
| MA-010 抽髓五式 | `chousui-zhang.c` | 五个dmage改damage，原值不变 | 同夹具逐项32/47/60/65/75；动作参数不等同最终伤害 |
| MA-011 互备入口 | `meinv-quan.c` | vliad_combine改公共接口valid_combine | `check_combine`原prepare命令，两掌法、双实参顺序、已有掌追加拳均检查实际准备表 |
| MA-068 练习消耗字段 | `chongyang-shenzhang.c` | 扣neili而非普通force属性 | 原门槛65、扣55，64拒绝且不扣qi，force普通属性不变 |
| MA-079 无性限制 | `wudang-jiuyang.c` | 读取技能等级，不读同名普通属性 | 9通过/10拒绝 |
| MA-082 poison remain类型 | `inherit/condition/poison.c` | intp作用于remain本身 | `check_conditions`错误remain拒绝无伤害 |
| MA-082 poison id类型 | 同上 | stringp单独校验id | 错误id拒绝无伤害；合法条件仍生效 |
| MA-082 damo remain类型 | `inherit/condition/damo.c` | intp作用于remain本身 | 错误remain拒绝无伤害 |
| MA-082 damo id类型 | 同上 | stringp单独校验id | 错误id拒绝无伤害；合法条件仍生效 |
| MA-083 气血创伤 | `inherit/condition/damo.c` | 补qw=qd/2，与精神分支及公共毒伤一致；保留上限 | 原当前qi扣值、eff_qi半值精确断言 |
| MA-089 三实参命中回调 | `rulai-zhang.c` | 第三形参接伤害，循环变量改局部 | `check_rulai`四掌、240创伤、149拒绝；先清双方busy避免假拒绝 |
| MA-089 唤醒分支费用安全 | 同上 | 先扣原固定200，保留四掌及其合法加力；末尾原时点判断体质且余额至少80才再扣80并创伤，不足80则不透支、不免费创伤；原600启动门槛不变 | 首击前扣200，spy无额外耗费时创伤净280/非创伤净200；真实combat内力600/加力350等由主Agent专门验证，不能用spy替代；替代旧280预留方案后的新断言待重跑，不计入旧537/0 |
| MA-095 精神消耗匹配 | `weituo-chu.c` | 原70门槛检查实际消耗jing，提示精神 | jing59拒绝；jing70且jingli0通过、扣60；200/201等级原内力差异 |
| MA-097 气血消耗匹配 | `fuhu-quan.c` | 原30门槛检查实际消耗qi | qi24拒绝；qi30且jingli0通过，扣25qi/5neili |
| MA-102 闪避描述 | `shaolin-tantui.c` | 既有dodge支持补缺失query_dodge_msg，数值不改 | `check_skill_names`直接回调返回弹腿语境；不是完整随机战斗显示验收 |
| MA-111 身法 | `shexing-lifan/guiyuan.c` | 同时维护普通防御读取的根层dex与有效身法读取的apply/dex，各自撤回本次增量 | `check_guiyuan`有效身法及原实际combat.skill_power防御前/中/后，独立增量保留、重施拒绝、重复清理幂等；最新fields 560/0 |
| MA-111 力量残留作用 | 同上 | **依明确决定保留原临时str加减**；combatd直接读取旧str，有真实消费者 | 测旧str7→11→7且query_str不变；不称整组力量字段已规范化或整招原来完全无效 |
| MA-114 性格判断 | `xuantie-jian/dong.c` | 国土无双改实际国士无双 | `check_character`三合法性格伤害输入、原随机边界、费用400 |
| MA-118 素心候选门槛 | `suxin-jian.c` | 每项按原严格level>lvl过滤；原次序/公式不变 | 70/71/99/100/101/160/161逐候选lvl严格小于实际等级 |
| MA-118 黯然候选门槛 | `sad-strike.c` | 同上，不排序或改等级 | 同组逐候选断言 |
| MA-121 蒹葭相对门槛 | `jian-jia.c` | 比较自身而不是秋月籁 | 自身高拒绝；秋月800但自身不超技法通过 |
| MA-124 蛇毒增量参数 | `wushe-qu.c` | add传字段及独立增量，不拼数字进字段名 | `check_snake`原蛇120+59=179；无level59，保留原召唤费用 |
| MA-126 失败消息fallthrough | `qingfu-shenfa.c` | case0加break，保留随机概率及失败返回0 | `check_qingfu_text`真实COMBAT_D bhinfo两分支互斥：精通易理/巧妙无方 |
| MA-132 徒手选招长度 | `jiuyang-shengong.c` | 徒手用actionf长度，不误用actionw | 第六徒手式可达，兵器仍原末式 |
| MA-135 打狗极意 | `dagou-bang.c` | 加载不读this_player；当次query_action复制计算五项，保留有效技能口径 | cold_load无玩家；两角色交替、随机上下界、先前mapping不漂移 |
| MA-135 乾坤极意 | `qiankun-jian.c` | 同上，保留原raw技能口径 | 同五项原公式断言 |
| MA-135 一阳极意 | `yiyang-zhi.c` | 同上，保留原指法与杖法分支/阈值差异 | 同五项原公式及两角色断言 |
| MA-135同类补修 抽髓极意 | `chousui-zhang.c` | 同类首次加载依赖改当次复制计算，不新编号历史发现 | 同冷载及动态五字段断言 |
| MA-137 箭数提示 | `xuanyuan-arrow/baibu.c` | 提示一支改三支，真实三支门槛不变 | `check_perform_text`1/2拒绝无成本，3支通过后余2支/内力-80 |
| MA-138 默认对手 | `lingyuan-xinfa/break.c` | 先解析实际目标再取其兵器 | `check_break`默认目标武器落地，自身兵器保持 |
| MA-138 显式对手 | 同上 | 不再预取默认对象武器 | 显式目标实际武器落地 |
| MA-138 仅副手 | 同上 | 无主手时再取目标副手，先objectp | 仅副手路线实际兵器落地 |
| MA-139 内功拒学 | `wuluo-zhang.c` | 越爪功改实际五罗轻烟掌 | `check_learning_text`低内功实际拒绝消息 |
| MA-139 最大内力拒学 | 同上 | 第二处同名纠正，不改100门槛 | 最大内力99实际拒绝消息 |
| MA-140 五罗失败描述 | `wuluo-zhang/bian.c` | 凝神顿气→凝神运气；重复标点修复 | 真实连接旁观者捕获原广播，失败消息及内力-50 |
| MA-140 飘絮同句 | `piaoxu-zhang/piao.c` | 同源错误同样修复 | 同消息/费用检查，原三击不改 |
| MA-141 盘龙命中描述 | `panlong-zhao/tan.c` | 双抓→双爪、更本→根本 | 原命中分支真实旁观消息，费用150/busy1 |
| MA-141 盘龙招架描述 | 同上 | 去掉“的看破”的多余的 | 原失败分支真实旁观消息，费用50/busy3 |

## 动作名数据逐文件清点

| 原编号／文件 | 具体项数及处理 | 对应断言 |
|---|---|---|
| MA-013 `dulong-shenzhua.c` | 8个skills_name→skill_name，原名不变 | fields冻结原8名和等级，逐条query_skill_name |
| MA-013 `jimie-zhua.c` | 8个同类错键 | 同8项 |
| MA-013 `sougu-yingzhua.c` | 6个同类错键 | 同6项 |
| MA-013 `yingzhua-gong.c` | 8个同类错键 | 同8项 |
| MA-013 `yintuoluo-zhua.c` | 6个同类错键 | 同6项 |
| MA-013 `yunlong-shou.c` | 最后170级我心依旧1个错键 | 单项原名/阈值 |
| MA-013 `yunlong-zhua.c` | 10个同类错键 | 同10项 |
| MA-013 `huashan-jian.c` | 6个name→skill_name | 同6项 |
| MA-013 `chongling-jian.c` | 4个name→skill_name | 同4项 |
| MA-072 `kongming-quan.c` | 6个原动作中的明确招名补字段；逆序查询i-1改i | 原6名/阈值，199我心空明/200极意 |
| MA-078 `raozhi-roujian.c` | 8个原文已有招名补字段 | 原8名/阈值 |
| MA-078 `yinlong-bian.c` | 8个原文已有招名补字段 | 原8名/阈值 |
| MA-078 `xuanxu-dao.c` | 6个原文已有招名补字段 | 原6名/阈值；不改诗句中的疑义字 |
| MA-078 `paiyun-shou.c` | **待决策**：10个动作没有唯一原招名来源，未发明新名、未伪装全部修复 | 查询仍无独立招名；其如钩如戢错字按MA-077修复，不等于名称问题解决 |

MA-013共57条错字段；加空明6条及MA-078三门22条，共85条冻结原招名断言。计数区分字段条目、文件和测试，不重复算规则总量。

## 补充纯文案逐规则清单

以下每行对应 `text_extra_fixes.json` 中一个精确规则；同一规则若在文件多处出现，均按原上下文替换。未改数值、条件、输入别名或存档字段。语义特殊点：韦陀棍只改neili拒绝分支；一指禅只改qi拒绝分支；寂灭/美女/五毒的攻守占位符按目标身份修正。

| 原编号 | 完整路径 | 原文 → 修正文案／结构 | 证据 |
|---|---|---|---|
| MA-025／规则1 | `kungfu/class/taohua/feng.c` | `全全笼罩` → `团团笼罩` | 文案守卫精确替换；完整参数见JSON |
| MA-030／规则1 | `kungfu/class/mingjiao/daijisi.c` | `"name": "绝杀"` → `"name": "天外飞花"` | 文案守卫精确替换；完整参数见JSON |
| MA-107／规则1 | `d/shaolin/fumoquan.c` | `镇定不若` → `镇定自若` | 文案守卫精确替换；完整参数见JSON |
| MA-107／规则2 | `d/shaolin/fumoquan.c` | `笔自的兵刃` → `笔直的兵刃` | 文案守卫精确替换；完整参数见JSON |
| MA-073／规则1 | `kungfu/skill/tianshan-feidu.c` | `身行` → `身形` | 文案守卫精确替换；完整参数见JSON |
| MA-073／规则2 | `kungfu/skill/tianshan-feidu.c` | `功势` → `攻势` | 文案守卫精确替换；完整参数见JSON |
| MA-076／规则1 | `kungfu/skill/taiji-quan.c` | `左右格档` → `左右格挡` | 文案守卫精确替换；完整参数见JSON |
| MA-076／规则2 | `kungfu/skill/taiji-quan/yin.c` | `微微一楞` → `微微一愣` | 文案守卫精确替换；完整参数见JSON |
| MA-076／规则3 | `kungfu/skill/taiji-quan/zhan.c` | `的看破了` → `看破了` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则1 | `kungfu/skill/shenmen-jian.c` | `只幌得` → `只晃得` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则2 | `kungfu/skill/shenmen-jian.c` | `眼花撩乱` → `眼花缭乱` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则3 | `kungfu/skill/huzhua-shou.c` | `如钩如戢` → `如钩如戟` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则4 | `kungfu/skill/paiyun-shou.c` | `如钩如戢` → `如钩如戟` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则5 | `kungfu/skill/huzhua-shou.c` | `费神扑上` → `飞身扑上` | 文案守卫精确替换；完整参数见JSON |
| MA-077／规则6 | `kungfu/skill/huzhua-shou.c` | `虎抓绝户手` → `虎爪绝户手` | 文案守卫精确替换；完整参数见JSON |
| MA-087／规则1 | `kungfu/skill/leiming-bian/cibei.c` | `强$N的攻击` → `将$N的攻击` | 文案守卫精确替换；完整参数见JSON |
| MA-087／规则2 | `kungfu/skill/qingyun-bian/duan.c` | `扑天盖地` → `铺天盖地` | 文案守卫精确替换；完整参数见JSON |
| MA-087／规则3 | `kungfu/skill/jiechen-dao/xiuluo.c` | `攻势大胜` → `攻势大盛` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则1 | `kungfu/skill/xiuluo-zhi.c` | `百汇大穴` → `百会大穴` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则2 | `kungfu/skill/xiuluo-zhi.c` | `讯雷` → `迅雷` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则3 | `kungfu/skill/xiuluo-zhi.c` | `速度功向` → `速度攻向` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则4 | `kungfu/skill/duoluoye-zhi.c` | `一屡` → `一缕` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则5 | `kungfu/skill/duoluoye-zhi.c` | `三屡` → `三缕` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则6 | `kungfu/skill/wuxiang-zhi.c` | `一屡劲风` → `一缕劲风` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则7 | `kungfu/skill/tianzhu-fuzhi.c` | `拂向向` → `拂向` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则8 | `kungfu/skill/qufannao-zhi.c` | `参和指` → `去烦恼指` | 文案守卫精确替换；完整参数见JSON |
| MA-093／规则9 | `kungfu/skill/yizhi-chan.c` | `你的内力太低了。` → `你的体力太低了。` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则1 | `kungfu/skill/longzhua-gong.c` | `如钩如戢` → `如钩如戟` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则2 | `kungfu/skill/jimie-zhua.c` | `身行` → `身形` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则3 | `kungfu/skill/yintuoluo-zhua/chixue.c` | `爪行` → `爪形` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则4 | `kungfu/skill/pona-gong.c` | `身行急闪直$n身前` → `身形急闪至$n身前` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则5 | `kungfu/skill/pona-gong.c` | `暴豆` → `爆豆` | 文案守卫精确替换；完整参数见JSON |
| MA-094／规则6 | `kungfu/skill/jimie-zhua/wuwo.c` | `CYN "$P见来势凶猛"` → `CYN "见来势凶猛"` | 文案守卫精确替换；完整参数见JSON |
| MA-096／规则1 | `kungfu/skill/weituo-gun.c` | `if ((int)me->query("neili") < 70) ⏎         return notify_fail("你的体力不够练韦陀棍。` → `if ((int)me->query("neili") < 70) ⏎         return notify_fail("你的内力不够练韦陀棍。` | 文案守卫精确替换；完整参数见JSON |
| MA-096／规则2 | `kungfu/skill/jiechen-dao.c` | `你的体力不够，练不了戒尘刀。` → `你的体力或内力不够，练不了戒尘刀。` | 文案守卫精确替换；完整参数见JSON |
| MA-098／规则1 | `kungfu/skill/yintuoluo-zhua.c` | `内力不够因陀罗爪` → `内力不够练因陀罗爪` | 文案守卫精确替换；完整参数见JSON |
| MA-098／规则2 | `kungfu/skill/dacidabei-shou.c` | `禅宗心法知识的知识` → `禅宗心法知识` | 文案守卫精确替换；完整参数见JSON |
| MA-098／规则3 | `kungfu/skill/shaolin-shenfa.c` | `手无足措` → `手足无措` | 文案守卫精确替换；完整参数见JSON |
| MA-109／规则1 | `kungfu/skill/jiuyin-baiguzhao/duo.c` | `迅论无比` → `迅疾无比` | 文案守卫精确替换；完整参数见JSON |
| MA-109／规则2 | `kungfu/skill/jiuyin-baiguzhao.c` | `九阴白骨抓` → `九阴白骨爪` | 文案守卫精确替换；完整参数见JSON |
| MA-109／规则3 | `kungfu/skill/shexing-lifan.c` | `身行` → `身形` | 文案守卫精确替换；完整参数见JSON |
| MA-109／规则4 | `kungfu/skill/huifeng-jian/jue.c` | `这一招堪勘不能奏效` → `这一招未能奏效` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则1 | `kungfu/skill/tianluo-diwang.c` | `水平水平` → `水平` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则2 | `kungfu/skill/sad-strike.c` | `黯然消魂掌` → `黯然销魂掌` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则3 | `kungfu/skill/sad-strike.c` | `脚步朗舱` → `脚步踉跄` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则4 | `kungfu/skill/suxin-jian.c` | `只幌得` → `只晃得` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则5 | `kungfu/skill/suxin-jian.c` | `眼花撩乱` → `眼花缭乱` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则6 | `kungfu/skill/suxin-jian.c` | `抚琴按萧` → `抚琴按箫` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则7 | `kungfu/skill/suxin-jian.c` | `孤云出釉` → `孤云出岫` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则8 | `kungfu/skill/surge-force/roar.c` | `令人发耳欲聩` → `令人震耳欲聋` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则9 | `kungfu/skill/meinv-quan/you.c` | `正迟疑间， $N` → `正迟疑间，$n` | 文案守卫精确替换；完整参数见JSON |
| MA-115／规则10 | `kungfu/skill/wudu-shenzhang/shi.c` | `侧身一跳$P` → `侧身一跳，` | 文案守卫精确替换；完整参数见JSON |
| MA-122／规则1 | `kungfu/skill/guangling-san.c` | `所有有限` → `水平有限` | 文案守卫精确替换；完整参数见JSON |
| MA-122／规则2 | `kungfu/skill/qingxin-pushan.c` | `所有有限` → `水平有限` | 文案守卫精确替换；完整参数见JSON |
| MA-122／规则3 | `kungfu/skill/qiuyue-lai.c` | `所有有限` → `水平有限` | 文案守卫精确替换；完整参数见JSON |
| MA-125／规则1 | `kungfu/skill/qishang-quan/shang.c` | `"飞了出去，重重的摔在地上` → `"打飞了出去，重重的摔在地上` | 文案守卫精确替换；完整参数见JSON |
| MA-127／规则1 | `kungfu/skill/qingfu-shenfa.c` | `这一招。。\n" ⏎ ` → `这一招。\n", ⏎ ` | 文案守卫精确替换；完整参数见JSON |


### 文案边界及专门逻辑

- MA-127青蝠的末行逗号不仅是改句号：原两条相邻字符串被编译器连接为一个数组项。补逗号后3→4；fields `check_qingfu_dodge_entries` 控制四个索引，分别检查四个原招名、不得混入其余三个名字、无重复句号，并核验随机上界4。该文件另有MA-126控制流修复，所以标混合文件。
- MA-122另一部分：`kungfu/skill/jian-jia.c`“所有有限”→“水平有限”随MA-121改；`kungfu/skill/xiaoao-jianghu.c`消息类别visoin→vision随MA-005改。不能只统计上表三首琴曲而漏这两个已实施子项。
- 本组文案混合文件11个：`kungfu/class/taohua/feng.c`（MA-143返回起点）、`d/shaolin/fumoquan.c`（MA-105/106）、`jimie-zhua.c`及`yintuoluo-zhua.c`（MA-013）、`jiuyin-baiguzhao.c`（成本组MA-085）、`sad-strike.c`及`suxin-jian.c`（MA-118）、`qingfu-shenfa.c`（MA-126/127）、`qingyun-bian/duan.c`（MA-085/086）、`jiechen-dao/xiuluo.c`及`wudu-shenzhang/shi.c`（MA-085）。其中未写完整前缀的路径均在kungfu/skill。
- 新增清单没有替代主清单；如MA-076太极剑/随字诀、MA-109已修的回风/四象等、MA-115已修的银索/三无等，仍由主文案清单逐行定位，不按本组新增规则重复记数。
- 占位符修正仅限明确目标身份：寂灭无我失败句保留$p主语；古墓幽居中拳者改$n；万毒噬体闪避句去掉误拼的$P，保留$p作为闪避者。没有改变判定、伤害参数或结果含义。

## 明确保留及不扩张结论

| 原编号／范围 | 保留理由 | 当前状态 |
|---|---|---|
| MA-078 排云手招名 | 原十动作无唯一明确招名，不能凭相似武功或自创名称填表 | 追加裁定采用武学名回退；见 [原未决16组处置](remaining-decisions.md) |
| MA-111 力量字段统一 | 旧temp/str有combatd直接消费，不能机械改apply/str造成增伤重复或消失 | 依本批明确决定保留，测试原加减；身法修复不意味着力量已迁移 |
| MA-073 天山“矫矢苍龙” | 原台账已明确仅待审校，没有唯一替换决定 | 保留；本批只修身行/功势 |
| MA-127 凌虚“一狐冲天” | 陌生招名不能仅凭字面认定错字 | 保留；明确错字已修 |
| MA-115 小龙女“双剑合壁”询问主题 | 输入主题不是纯展示文本，需要全部调用及兼容意图决定 | 本分工不改输入主题；NPC组状态独立列出 |
| 原台账其他编号及子项 | 不属本分工，不能从fields537/0或静态文案215条推定关闭 | 由主矩阵与其他分组各自记录 |

本表是局部验收证据索引，而非“144/144修复”声明。正式上线、全量编译、真实公共COMBAT边界、长期运行及未决玩法的状态由主Agent统一报告；纯文案静态守卫不代替这些验证。
