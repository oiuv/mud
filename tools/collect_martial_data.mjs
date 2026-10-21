import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildInventory, collectVersions, inventoryMarkdown, isInside } from './tests/martial_data/inventory.mjs';
import { collectCatalog } from './tests/martial_data/catalog.mjs';
import { coverage, coverageMarkdown } from './tests/martial_data/ledger.mjs';
import { runWeapons, runAbilities, runBouts, runWeaponSpecial, runTeaching, runSchoolCombat, runSchoolTeam, runSchoolScene, resumeCollection } from './tests/martial_data/execution.mjs';
import { collectStatistics, statisticsMarkdown } from './tests/martial_data/statistics.mjs';
import { gumuNpcBoutReport, gumuNpcBoutMarkdown } from './tests/martial_data/school_gumu_npc_bout_report.mjs';

export const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const help = `武学数据采集（只读游戏源码，不做平衡调整）
用法：node tools/collect_martial_data.mjs inventory [选项]
      node tools/collect_martial_data.mjs coverage --input 系列目录
      node tools/collect_martial_data.mjs weapons [--smoke] [选项]
      node tools/collect_martial_data.mjs weapon-special [--smoke] [选项]
      node tools/collect_martial_data.mjs abilities [--smoke] [选项]
      node tools/collect_martial_data.mjs teaching [--smoke] [--case ID] [选项]
      node tools/collect_martial_data.mjs school-combat [--smoke] [--case ID] [选项]
      node tools/collect_martial_data.mjs school-team [--smoke] [--case ID] [选项]
      node tools/collect_martial_data.mjs school-scene [--smoke] [--case ID] [选项]
      node tools/collect_martial_data.mjs bouts [--smoke] [--bouts N] [--level N] [选项]
      node tools/collect_martial_data.mjs resume --input 系列目录 [--driver PATH] [--case ID]
      node tools/collect_martial_data.mjs statistics --input 系列目录 [--output 新报告目录]
  --help          只显示帮助
  --driver PATH   默认 bin/driver.exe；inventory 仅取版本，weapons 启动隔离测试服
  --output PATH   新的仓库外目录；默认系统临时目录，不覆盖历史记录
  --input PATH    已有系列；coverage 只读，resume 核对版本后执行缺项并追加记录
  --smoke         weapons 每条件 2 次，含资格拒绝检查，不作统计结论
  --samples N     单次效果完整条件样本数，默认 100
  --level N       weapons/bouts 实验基础/特殊武学等级，默认 200
  --bouts N       交锋每条件场数，默认 20，每场 30 秒；smoke 为 2 场、每场 3 秒
  --case ID       只采一个精确条件；新建系列或续缺项，不冒充整组完成
  --case-prefix P teaching/school-combat/school-scene/abilities 新建系列仅采指定 ID 前缀；resume 不接受本参数（续跑自动沿用已保存范围，精确续跑用 --case）
  --case-group G  仅 school-combat 新建系列按 collection_group 精确选择；与 --case、--case-prefix 两两互斥
                 例：school-combat --case-group mingjiao-remaining-base（338条件，正式15670条，--smoke为676条）；计划不表示已采齐
abilities 核验恢复、控制、增益/解除、弹药、缴械和学习接口，参数不与兵器组混算。skill-music- 前缀为11件公共演奏武学：55个valid_learn边界与39个原play/do_effect条件（含舞蛇曲有效等级49/50补充边界），默认4010计划记录（smoke 149）；演奏每条件默认100次，可用--samples指定。合奏、国歌附加攻击与完整回调另待采集，不以本组代替；只统计收集，不比强弱。
learning- 前缀为六门全武学 valid_learn 接口边界（抽髓掌/冷月神功/轩辕箭/药王妙术/笑傲江湖曲/点沧海），共12条件24计划记录（smoke 24）；直接观察原接口返回与拒绝原句，不冒充教师传授或练功成功，错拼技能键只作缺席核验。
school-slice1- 前缀为门派代表切片首批（gaibang/xiaoyao/kunlun/duan）；collection_group 形如 slice1-gaibang，可配 --case-group 精确选择；只采代表切片，不冒充全门派覆盖。
school-slice2- 前缀为门派代表切片第二批（wudu/tiezhang/shenlong/xuanming）；collection_group 形如 slice2-wudu，可配 --case-group 精确选择；wudu 双掌 count 依赖、shenlong 三段命中、xuanming 双 do_damage 按原分支记账，只采代表切片。
school-slice3- 前缀为门派代表切片第三批（lingjiu/murong/xingxiu/honghua）；collection_group 形如 slice3-lingjiu，可配 --case-group 精确选择；murong 连击 7×do_attack、xingxiu 尸体毒 final 带 corpse_poison 与精神伤创、honghua 需心狠手辣，只采代表切片。
school-slice4- 前缀为门派代表切片第四批（xueshan/xuedao/riyue/jueqing）；collection_group 形如 slice4-xueshan，可配 --case-group 精确选择；xuedao/riyue 绝招在 perform 子目录、xuedao 自映射折叠且命中/落空均自伤创 qi50、riyue 交叉授权 can_perform/pixie-jian/po 且命中附 no_perform、jueqing 全原始 ap/dp 与命中忙乱 1-2，只采代表切片。
school-slice5- 前缀为门派代表切片第五批（henshan/songshan/lingxiao/tianlongsi）；collection_group 形如 slice5-henshan，可配 --case-group 精确选择；songshan 命中忙乱 2-3/落空 2-4、lingxiao 非标准命中 random(cuff)>dodge/2、tianlongsi 无 can_perform 授权门且 valid_learn 需男性、henshan percent=10，只采代表切片。
school-slice6- 前缀为门派代表切片第六批（meizhuang/miao/ouyang/zhenyuan）；collection_group 形如 slice6-meizhuang，可配 --case-group 精确选择；meizhuang 双免疫支且 actor max_neili≥target+500、miao skill<260 掉剑且费用两分支均 500、ouyang 目标忙乱 1、zhenyuan 非标准命中 random(strike)>dodge/2，只采代表切片。
school-slice7- 前缀为门派代表切片第七批（shang/hu/none+ultra 合并小切片）；collection_group 形如 slice7-shang，可配 --case-group 精确选择；hu 四分位命中 ap/4+random(ap/2)>dp、none 无 can_perform 授权且两分支零内力、ultra 反向命中（等号算命中）且绝招在 perform 子目录，只采代表切片。
school-slice8- 前缀为门派代表切片第八批（tangmen/xiakedao/yunlong）；collection_group 形如 slice8-tangmen，可配 --case-group 精确选择；tangmen 为 receive 类（wound=100%伤害+hit_ob）、xiakedao percentRange 80-84 且反向命中（等号算命中）、yunlong 非标准命中 random(force)>目标force/2 且 hit 转向有 1/250 失手率，只采代表切片。
b1- 前缀为慕容×少林共享 perform 批量（20 招/100 条件）；collection_group 为 b1-perform，families 记 ['慕容世家','少林派'] 两派销账；kind 分发 direct 11/control 2/buff 4/combo 3，直伤按 combatd 原支持集校验；达摩清心/乱气教师键互换（MA-017）按源码原样记录，大金刚神通与八仙醉打的少林内功硬约束、清心剑目标 powerup 前置与清零 apply、八仙醉打与 powerup 互斥、缠绕诀零费用均按原分支记账；只收集数据，不比较强弱。
b2- 前缀为太极系四派共享 perform 批量（10 招/53 条件）；collection_group 为 b2-perform，families 记 ['红花会','明教','神龙教','武当'] 四派销账；kind 分发 direct 7/control 1/buff 1/combo 1，直伤按 combatd 原支持集校验，太极图为 receive_damage 直伤（无 do_damage）；太极图 can_perform≥10 且需太极神功/道学双300门槛，随字诀 buff 有到期回调，驾字诀需目标持器、驾/引需目标非忙，震字诀命中判定为 force 对 force，均按原分支记账；只收集数据，不比较强弱。
b3- 前缀为天龙×血刀×雪山共享 perform 批量（10 招/55 条件）；collection_group 为 b3-perform，families 记 ['大理段家','血刀门','大轮寺'] 三派销账；kind 分发 direct 6/control 1/combo 3，直伤按 combatd 原支持集校验；象跌势与真·般若极的内力碾压即倒分支、龙吞势临时标记防连发、若悲按战斗经验判定且零费用、修罗降世残血爆发、般若极破护体真气均按原分支记账；只收集数据，不比较强弱。
b4- 前缀为华山共享 perform 批量（8 招/45 条件）；collection_group 为 b4-perform，families 按技能分别记辟邪剑法['华山派','日月神教','少林派']与华山剑法['华山派','日月神教','慕容世家','神龙教']多派销账；kind 分发 direct 4/control 2/combo 2，直伤按 combatd 原支持集校验；鬼影夺目致盲、破元剑闪封招、天外飞龙掷剑落场、夺命连环三仙剑三段直伤、群邪辟易与剑掌五连环临时加成均按原分支记账；只收集数据，不比较强弱。
b5- 前缀为段真×绝铁共享 perform 批量（15 招/约80 条件）；collection_group 为 b5-perform，families 按簇分别记先天功/一阳指['大理段家','全真教']与铁掌/穿心/飞龙/铁线['绝情谷','铁掌帮']两派销账；kind 分发 direct 7/combo 5/control 1/heal 1，直伤按 combatd 原支持集校验；神威浩荡与五阴焚灭的内力碾压即倒、神威浩荡碎甲、阳关三叠三段与三中封内、阴阳磨寒热掌劲、龙飞势掷杖落场、九穹绝刹掌自伤气血与铁线拳互背约束、起死回生非战斗疗伤均按原分支记账；只收集数据，不比较强弱。
b6- 前缀为商家×镇远与杂簇共享 perform 批量（19 招/约91 条件）；collection_group 为 b6-perform，families 按簇分别记八卦系['商家堡','八卦门']、打狗棒['丐帮','桃花岛']、胡家刀['关外胡家','中原苗家']及六合/六阳/折梅/泼墨杂簇两派销账；kind 分发 direct 14/combo 3/control 1/buff 1（含掌中夹镖 receive 直伤），直伤按 combatd 原支持集校验；绊字诀内力碾压即倒、掌中夹镖暗器消耗、八卦震与神卦天印非标准命中、生死符寒毒与精神创伤、封字诀临时招架增益均按原分支记账；只收集数据，不比较强弱。
b7- 前缀为少林独有 perform 批量（21 招/约120 条件）；collection_group 为 b7-perform，families 记 ['少林派'] 派 perform 销账；kind 分发 direct 17/combo 2/control 1/buff 1（含凌空指穴与大手印 receive 直伤），直伤按 combatd 原支持集校验；万佛朝宗与赤血重爪内力碾压、燃木真焰临时增益、拈花拂穴按经验判定、菩提寂灭自伤、凌空指穴与大手印直接伤血均按原分支记账；只收集数据，不比较强弱。
b8- 前缀为少林独有尾批 perform 批量（15 招/约90 条件）；collection_group 为 b8-perform，families 记 ['少林派'] 派 perform 销账；kind 分发 direct 4/combo 6/buff 4/control 1（含慈悲字诀 receive 直伤），直伤按 combatd 原支持集校验；避云遮日内力碾压即倒、神龙再现/金刚不坏/即世即空/一苇渡江临时增益、缠绕诀按经验判定、慈悲字诀直接伤血与后续连击均按原分支记账；只收集数据，不比较强弱。
b9- 前缀为日月独有 perform 批量（16 招/约90 条件）；collection_group 为 b9-perform，families 记 ['日月神教'] 派 perform 销账；kind 分发 direct 10/combo 4/control 2（含星罗棋布暗器散射 receive 直伤），直伤按 combatd 原支持集校验；大智若愚与反璞归真掌力直伤（反璞归真另有后续连击）、天蝎藏针与断脉破岳连击、绝命七杀与天旋地转连击带攻击加成、大巧若拙与跗骨缠魂目标忙乱、星罗棋布暗器散射直接伤血与消耗、百鬼恸哭非标准命中均按原分支记账；只收集数据，不比较强弱。
b10- 前缀为绝情独有 perform 批量（15 招/约70 条件）；collection_group 为 b10-perform，families 记 ['绝情谷'] 派 perform 销账；kind 分发 direct 6/combo 4/control 5，直伤按 combatd 原支持集校验；落雷式与破阳刀与魂飞魄散与破碎虚空与泰山压顶直伤、狂风式与寒冰环与万念俱灰与日月无华与天绝锁目标忙乱、横空出世直伤高百分比、阴阳环与九星连珠与天刀落云式与千山孤鸿影连击（阴阳环与千山孤鸿影命中带攻击加成）均按原分支记账；只收集数据，不比较强弱。
b11- 前缀为丐帮独有 perform 批量（13 招/约68 条件）；collection_group 为 b11-perform，families 记 ['丐帮'] 派 perform 销账；kind 分发 direct 9/multi 1/control 2/combo 1（含金针渡劫 receive 直伤），直伤按 combatd 原支持集校验；亢龙有悔三掌连击、震惊百里与绝命一踢与焚阳剑与傲尘剑与五丁开山直伤、双龙取水夺械、飞龙在天连击、观日神诀直伤后九剑连击、缠丝擒拿命中忙乱、铁爪锁喉内力碾压即倒、仙游诀目标忙乱、金针渡劫暗器散射直接伤血与消耗均按原分支记账；只收集数据，不比较强弱。
b12- 前缀为红花会独有 perform 批量（13 招/约66 条件）；collection_group 为 b12-perform，families 记 ['红花会'] 派 perform 销账；kind 分发 direct 8/combo 2/control 1/multi 1/buff 1，直伤按 combatd 原支持集校验；战神轰天诀与诛天刹神内力碾压即倒、百花错乱命中忙乱、百花错易与夺命连环连击、缚字诀与千头万绪鞭索控制、化蝶临时身法增益、催魂掌毒伤、刀影重重与雷霆万钧与追魂夺命直伤、诛天刹神夺械、掌藏龙暗器散射直接伤血与消耗均按原分支记账；只收集数据，不比较强弱。
b13- 前缀为华山独有 11 + 段氏独有尾 2 perform 批量（13 招/约58 条件）；collection_group 为 b13-perform，families 记 ['华山派'] 或 ['大理段家'] 派 perform 销账；kind 分发 direct 6/combo 2/control 2/multi 1/buff 1/array 1，直伤按 combatd 原支持集校验；宁氏一剑与风起云涌与惊天一剑与破石一击与混元无极与苍松式直伤、华岳三神峰三段连斩、封闭手与飞絮飘渺目标忙乱、雷动九天临时力道身法增益、风扫落叶与五绝连环连击均按原分支记账；双剑和壁须两人组队，本批只记原无队伍拒绝，成功刀阵由 school_team 批次覆盖；只收集数据，不比较强弱。
b14- 前缀为嵩山独有 11 + 玄冥独有 11 perform 批量（22 招/115 条件）；collection_group 为 b14-perform，families 记 ['嵩山派'] 或 ['玄冥谷'] 派 perform 销账；kind 分发 direct 8/combo 5/control 8/multi 1，直伤按 combatd 原支持集校验；踏雪无痕与神光再现与如梦如幻与无影掌与蛟龙抱与卷字决与残月刺目标忙乱、极天寒掌与破山斧与剑气冲霄与皓月穿空与通天彻地与只手遮天与真龙聚直伤、千掌环与九曲十八弯与缤纷雪舞与掌打飞花与内点乾坤连击均按原分支记账；天外玉龙含 real_perform 精髓分支（费用/百分比/忙乱窗口按原两模式记账），只手遮天含内力碾压反噬分支（反噬时自伤并自中寒毒、跳过直伤），惊涛骇浪两掌连击分段扣费并各自施加玄冥寒毒；只收集数据，不比较强弱。
b15- 前缀为全真独有 10 + 衡山独有 9 perform 批量（19 招/92 条件）；collection_group 为 b15-perform，families 记 ['全真教'] 或 ['衡山派'] 派 perform 销账；kind 分发 direct 9/combo 4/control 4/multi 1/sacrifice 1，直伤按 combatd 原支持集校验；玄门金锁与空明若玄与流云叠影与烟云锁身目标忙乱、朝拜天罡与三花聚顶与剑指南山与群星璀璨与空空如也与紫盖回翔与排山倒海与青天揽日月与乱剑覆花直伤、重阳连环掌与峰连碧罗与落英纷飞与一剑落九雁连击、破穹云蛟三掌各自判定均按原分支记账；玉石俱焚含内力碾压同归分支（先扣最大内力50，命中后清空真气并再损最大内力，死亡分支按原逻辑记账），烟云锁身含夺械分支（内力碾压且目标持械时夺械，否则目标忙乱）；只收集数据，不比较强弱。
b16- 前缀为苗家独有 9 + 五毒独有 9 perform 批量（18 招/88 条件）；collection_group 为 b16-perform，families 记 ['中原苗家'] 或 ['五毒教'] 派 perform 销账；kind 分发 direct 10/combo 3/control 2/multi 1/duo 1/throwing 1，直伤按 combatd 原支持集校验；云边摘月与盘鹰诀目标忙乱、丹阳劲与翅展九州与残阳劲与魁星点元与黄龙吐珠与搏虎诀与腾蛇诀与毒蟾掌与夺命连环直伤、五岳为开与剑舞千秋与锁龙诀连击、毒龙双锥两剑各自判定均按原分支记账；金钩夺魄含内力碾压即死与夺械分支（先扣50再按命中分支记账），无影针消耗十枚暗器并按战斗经验判定；只收集数据，不比较强弱。
b17- 前缀为胡家独有 8 + 欧阳独有 8 + 昆仑独有 8 perform 批量（24 招/约85 条件）；collection_group 为 b17-perform，families 记 ['关外胡家'] 或 ['欧阳世家'] 或 ['昆仑派'] 派 perform 销账；kind 分发 direct 9/control 4/combo 2/multi 1/throwing 2/buff 2/sacrifice 1/special 3，直伤按 combatd 原支持集校验；风卷霹雳上九天与雄霸群山与横扫千军与千蛇万噬与柔字诀与石破天惊与无声无色与损筋诀与逆转乾坤直伤、奔拳快打与灵蛇缠身与点字诀与日入空山目标忙乱、千蛇出洞与日月乾坤连击、蟾震九天三掌各自判定、星光闪烁与流星电闪暗器消耗、作茧自缚与飞天神行临时增益均按原分支记账；玉碎昆冈含内力碾压同归分支（先扣最大内力50，命中后清空真气并再损最大内力，死亡分支按原逻辑记账），蛇毒奇巧仅对蛇类目标生效（非蛇目标按原拒绝记账）；只收集数据，不比较强弱。
b20- 前缀为星宿独有 5 + 铁掌独有 5 + 血刀独有 5 + 逍遥独有 5 perform 批量（20 招/约80 条件）；collection_group 为 b20-perform，families 记 ['星宿派'] 或 ['铁掌帮'] 或 ['血刀门'] 或 ['逍遥派'] 派 perform 销账；kind 分发 direct 10/control 2/combo 5/special 2/buff 1，直伤按 combatd 原支持集校验；炼心弹与腐尸毒直伤含火毒/尸毒、掌心雷与春雷炸空与孤雁出群与血浪滔天与祭血神刀与捕风捉影与攀阳邀月与流月剑诀直伤、如蛆附骨与无影神刀目标忙乱、冰雪纷飞与五雷连闪与赤炼神刀与流星火雨与如意六刀连击、碧焰滔天自损内力上限、噬血穹苍直伤后连击、洛神凌波临时身法增益均按原分支记账；只收集数据，不比较强弱。
b21- 前缀为镇远独有 4 + 商家独有 4 + 云龙独有 4 + 峨嵋独有 4 + 雪山独有 4 perform 批量（20 招/约80 条件）；collection_group 为 b21-perform，families 记 ['八卦门'] 或 ['商家堡'] 或 ['云龙门'] 或 ['峨嵋派'] 或 ['大轮寺'] 派 perform 销账；kind 分发 direct 9/combo 5/control 1/buff 1/throwing 2/multi 1/special 2，直伤按 combatd 原支持集校验；镖中现掌与背心钉与混沌初开与犀牛望月转回还与佛光初现与灭剑与云龙三现直伤、乾坤一掷与金莲幻生暗器消耗、缠字诀目标忙乱、翻卦连环掌与天残剑诀与疾电与缤纷雪舞与五轮连转连击、圆满势临时招架增益、绝剑多段直伤、破元通虚封内、截筋断脉含精神伤与目标忙乱均按原分支记账；只收集数据，不比较强弱。
b22- 前缀为凌霄独有 2 + 桃花独有 2 + 灵鹫/逍遥尾 3 + none 3 perform 批量（10 招/约50 条件）；collection_group 为 b22-perform，families 记 ['凌霄城'] 或 ['桃花岛'] 或 ['灵鹫宫'] 或 ['逍遥派'] 或 ['侠客盟'] 派 perform 销账；kind 分发 direct 3/combo 2/multi 1/special 3/practice 1，直伤按 combatd 原支持集校验；神倒鬼跌三连环三段直伤、冷剑决与天诛龙蛟诀与云霞幻生直伤、夺命催心含催心标记与招架削弱、化妖功含内力碾压即死与收伤分支、破气式封内、天升剑诀与总破式连击、总诀式演练均按原分支记账；只收集数据，不比较强弱。
b23- 前缀为多段直伤 21 招 perform 批量（21 招/约105 条件）；collection_group 为 b23-perform，families 记 ['少林寺'] 或 ['大理段家'] 或 ['慕容世家'] 或 ['丐帮'] 或 ['凌霄城'] 或 ['梅庄'] 或 ['衡山派'] 或 ['峨嵋派'] 或 ['玄冥教'] 或 ['神龙教'] 或 ['侠客盟'] 派 perform 销账；kind 均为 multi_stage，直伤按 combatd 原支持集校验；真·六道轮回与六合连环诀与无形剑气与万剑纵横与参合剑气与亢龙有悔与清流剑与风雷四击与五神朝元势与西子捧心与玄冥双行与神龙再现与三板斧与刀剑七重天与金蛇噬天与夺命连环爪与无双无对与海市蜃楼与风神诀与御剑飞升与剑芒多段直伤均按原分支记账，各段独立判定；只收集数据，不比较强弱。
b24- 前缀为连击 13 招 perform 批量（13 招/约62 条件）；collection_group 为 b24-perform，families 记 ['少林派'] 或 ['武当派'] 或 ['慕容世家'] 或 ['古墓派'] 或 ['云龙门'] 或 ['桃花岛'] 或 ['侠客盟'] 派 perform 销账；kind 均为 combo，连击按原分支记账、逐击经原普通攻击结算；达摩三绝剑与狂风落叶与三环套月与北斗七星剑与迅雷击与玉女连环剑与断字诀与狂风绝技与附骨缠身与蛇影万道与落字诀与西洋连环剑与百花错乱均按原分支记账；只收集数据，不比较强弱。
b25- 前缀为即死 5 + 治疗 2 perform 批量（7 招/约35 条件）；collection_group 为 b25-perform，families 记 ['逍遥派'] 或 ['灵鹫宫'] 或 ['大理段家'] 或 ['侠客盟'] 派 perform 销账；kind 分发 instant_death 5/heal 2；化妖功含内力碾压即死、五阴焚灭与天打雷劈含经验判定与即死分支、小李飞刀必杀并消耗暗器、归去来兮两段掌劲各自判定、起死回生与一阳指运功疗伤非战斗恢复均按原分支记账；只收集数据，不比较强弱。
b26- 前缀为控制/缴械未覆盖集 perform 批量（5 招/约25 条件）；collection_group 为 b26-perform，families 记 ['全真教'] 或 ['丐帮'] 或 ['衡山派'] 派 perform 销账；kind 分发 control 4/disarm 1；全真剑缠字诀与打狗棒缠字诀与五神剑回峰蜿蜒势与天罡凌空指穴目标忙乱、降龙十八掌擒龙手夺械，均按原分支记账，只收纯控制/纯缴械（无 do_damage），不重采已按门派入账的旧招；只收集数据，不比较强弱。
b27- 前缀为杂项 perform 批量（15 招/约75 条件）；collection_group 为 b27-perform，families 记 ['侠客盟'] 或 ['明教'] 或 ['慕容世家'] 或 ['星宿派'] 或 ['大理段家'] 或 ['古墓派'] 或 ['血刀门'] 或 ['凌霄城'] 派 perform 销账；kind 分发 control 12/buff 2/multi 1；碧海清波与缠字诀与牧野鹰扬与七星指穴与锁魂势与纵横与飞剑诀与蛇困愁城与卷字诀与幻影与风回雪舞与千姿百媚非标准控制目标忙乱、虚无缥缈与金钟罩临时增益标记、五遁绝杀多轮攻击均按原分支记账；只收集数据，不比较强弱。
b28- 前缀为 generate/misc 桶 perform 批量（18 招/约90 条件）；collection_group 为 b28-perform，families 记 ['侠客盟'] 派 perform 销账；kind 分发 direct 8/combo 6/control 1/instant_death 1/special 2；东洋刀法乱刀诀与迎风一刀斩、降龙十八掌雷霆一击与龙翔九天、迷踪猴拳破釜沉舟、不败神功天地绝灭与天打雷劈与破字诀与天花乱坠与晴空万里与御策诀、圣骑士戟冲刺攻击与旋转卷刺、天长掌法地老天荒、衡山五神剑千剑纵横势、西洋剑术刺剑、血刀祭血神刀与血雨均按原分支记账；generate/misc 桶无正式派归属，只收集数据，不比较强弱。
b29- 前缀为无 grant 公共/任务武学 perform 批量（55 个声明、47 个生成项、8 个待复核项）；collection_group 为 b29-perform，families 记 ['侠客盟'] 派 perform 销账；kind 分发 direct/combo/control/instant_death/special/buff/multi_stage 多类；南海玄功七式、独孤九剑三式、六脉神剑四式、金蛇剑掌锥七式、玉女剑与无双无对、御剑飞升、百步穿杨、神照经二式、中平枪法、独孤九剑（dugu）四式、葵花魔功五式、九阳神功五式、太玄功五式、蟾震九天、大挪移、小李飞刀、五遁绝杀、金刚不坏护体、凝血疾电、乾坤神剑三式均按原分支记账；六脉神剑 zongheng 运行期经 liumai-shenjian 目录分发（zongheng 仅在 six-finger 目录，该入口及夹具/窗口不足项均保留待复核，不作为已验收 N/A）；公共/任务武学无正式派归属，只收集数据，不比较强弱。
b19- 前缀为武当独有 7 + 天龙独有 6 + 侠客独有 5 + ultra 独有 5 perform 批量（23 招/约95 条件）；collection_group 为 b19-perform，families 记 ['武当派'] 或 ['大理段家'] 或 ['侠客岛'] 或 ['侠客盟'] 派 perform 销账；kind 分发 direct 9/combo 5/control 3/multi 2/receive 1/special 1/throwing 1，直伤按 combatd 原支持集校验；隔山打牛与太极初升与乱环诀与柔月穿空与绝户神抓与焚身与无形剑气与赤焰暴长与晴空万里直伤、谁与争锋与天寰神炎与六脉剑气与太玄激劲与破字诀连击、神门刺与神指点穴与天花乱坠目标忙乱、万剑纵横与白首太玄经多段直伤、乘风破浪直接伤血、御策诀暗器消耗、天打雷劈含经验判定与即死分支均按原分支记账；只收集数据，不比较强弱。
b18- 前缀为唐门独有 7 + 灵鹫独有 7 + 梅庄独有 7 + 神龙独有 7 perform 批量（28 招/约120 条件）；collection_group 为 b18-perform，families 记 ['唐门世家'] 或 ['灵鹫宫'] 或 ['梅庄'] 或 ['神龙教'] 派 perform 销账；kind 分发 direct 10/control 3/combo 5/multi 1/throwing 5/buff 2/special 4，直伤按 combatd 原支持集校验；七子刚镖与散花天女与幻遁寒星与射日诀暗器消耗、心有千千结与云雾暗点与闪剑诀目标忙乱、流花掠影与幻剑诀与七弦连环诛与诗意纵横与飞仙术连击、归去来兮两段掌劲各自判定、回梦与破靛神砂与海渊式与冰坚地狱与摧心断肠与辣手化骨与神龙初现与电光四射与神笔封穴直伤均按原分支记账；破神诀含内力碾压即死分支，唱仙法吼字决含内力比较与先扣费后拒绝分支，七弦无形音含精神伤与免疫分支，随风而舞含经验判定与自伤离场；只收集数据，不比较强弱。
skill-inherited- 前缀为20个纯继承技能的原valid_learn/type/valid_learn_level默认接口，60条件120计划记录（smoke 60）；返回值、真实继承来源及双USER完整状态分别核验，不表示20种玩法或兵器战斗效果已完成。
public-special- 前缀为七弦无形剑的精确资格门槛与独立 hit_ob 特殊效果新系列（填补 skill-music-results 未覆盖缺口，不改旧 public-music 矩阵）：learn 3 个 raw 边界对（unarmed/sword 179-180、tanqin 99-100，固定前序门）、hit_ob 4 个资格门边界对（raw/max_neili/damage/对手 max_neili）并核验 busy/内力/qi 伤创原公式，共 14 条件 28 计划记录（smoke 14）；接口原始返回与即窗效果分列，不冒充完整交锋或自然养成。国歌附加攻击、双人合奏与自然解除另待新夹具采集，不以本组代替。
school-mingjiao-core- 前缀为韦一笑路线寒冰绵掌普通攻击与连绵不绝的首个战斗切片；分200/400/800级及资格边界。实验靶基本招架为3倍等级且无映射，仅为观察原绝招两分支，不作同级胜率或公平强弱比较；加力0不覆盖寒毒，不代表明教全派完成。
school-mingjiao-qishang-main- 为谢逊七伤拳普通攻击、魂魄飞扬、伤字诀及资格／反噬保护边界；首次200级加载的共享原缓存单列。cold400-／cold800-须分别使用新系列和独立驱动，不能与main混算；靶基础内功／招架为3倍等级且无映射，不作同成本强弱排名。
school-mingjiao-xinfa- 为圣火心法学习资格、兼修／容量、原强化及公共调息有限切片，24条件146计划记录（smoke 48）；低等级即时强化100次观察随机熟练，32秒自然到期条件2次只验证生命周期，不能混算为概率或全明教完成。
school-mingjiao-movement- 为圣火步、青蝠身法及范遥自用凌虚步的有限学习／练习与防御观察，86条件2622计划记录（smoke 172）；确定性练习、闪避加成台阶、随机消息与化解分列。青蝠副作用消息原样记录，公共直伤不调用轻功化解，不以接口效果冒充实战概率或本派教学资格。
school-mingjiao-shengong- 为圣火神功资格、研究、容量、强化、护体及公共恢复的有限切片，51条件788计划记录（smoke 102）；研究收费和精神不足清零另账，20／40级原自然到期不代表全等级，暂不采圣火令联动连击或完整NPC教学。
school-mingjiao-shenghuo-main- 为圣火令普攻、残血令与圣火神功命中联动的40条件1942计划记录（smoke 80）；cold400-／cold800-各100（smoke各2），须分别使用独立系列和驱动。原攻击、追加、附伤、公共创伤及忙乱请求分账，保留首载缓存；42条件不代表圣火令全部绝招或明教完成。
school-mingjiao-ling-learning- 为圣火令学习资格与真实practice的40条件80计划记录（smoke 80）；接口返回0、拒绝及部分练习进度分列。无激发副作用预加载，沿真实USER上下文加载；不代表自然教学、其余绝招或完整明教。
school-mingjiao-ling-perform- 为光华令、敛心令、吸焰令原命令的40条件1452计划记录（smoke 80）；原39项之外明确追加吸焰令超重条件。气血／精神／创伤、实际费用、弱熟练及同对象卸装／落点分别核验，不把失手当拒绝、成功提示当背包交付，也不代表自然教学或完整明教。
  school-mingjiao-apprentice-learning- 为张无忌自然拜师与圣火令普通授课的有限19条件430计划记录（smoke 38）；先天／有效属性、实际师承、取消／重复拜师、普通授课上限与部分学习分列，不以拜师准备成功冒充学习增长。
school-mingjiao-recruit- 为六教师自然拜师及范遥／小昭原入口限制的85条件170计划记录（smoke 170），302原apprentice/cancel命令；实际新师承、转世请安、意向／叛师确认、拒绝和取消分账，不代表前置自然养成、普通授课或全部明教完成。
school-mingjiao-gift- 为杨逍原询问赠幻灵剑的16条件32计划记录（smoke 32），34次原ask；唯一物品身份、资格、实际到手／超重落地、已持有和询问费用分列，不代表自然拜师、装备效果或明教完成。
 school-mingjiao-book- 为原密室领书、取书及乾坤秘籍研读的26条件52计划记录（smoke 52），56次原命令；物品出现／取得、原学习进度／升级、精神费用／余量清零分列。资格与初始位置为实验输入，石门路线、冷加载及完整明教另行采集。
school-mingjiao-qkd- 为乾坤大挪移招架及原定时反击的39条件3430计划记录（smoke 78）；普通化解、实际排队、反击与离战早退分列，仅实际排队时等待，不代表全门派或自然养成。
school-mingjiao-jiuyang- 为九阳被动、防御与徒手普攻的67条件2094计划记录（smoke 134）；转世/兵器许可用法、招架系数、原取消费用和原创伤分别观察。五perform、三exert、修养与完整交锋另待采，不把实验转世资格当自然养成。
school-mingjiao-learning-jiuyang- 为九阳原学习资格、难度与禁止练习的37条件74计划记录（smoke 74），82次原命令；首次兵器许可与同角色重复资格分步观察，不冒充教师授课或实际成长。
school-mingjiao-direct-jiuyang- 为混沌一阳、金阳破岭、骄阳劈天的54条件1186计划记录（smoke 108）；直接伤害、创伤、同步扣内力及原弱熟练分账，实验配功不冒自然养成。
school-mingjiao-remaining-jiuyang- 为九曦混阳、魔光日无极的53条件2556计划记录（smoke 106）；九次普通攻击与被动附伤、双敌群攻及旁观者分别观察，内力毛消耗/恢复/净变化分账；三exert和修养尚待独立采集。
school-mingjiao-exert-jiuyang- 为九阳powerup/shield/roar的独立运功条件；即时属性、逐敌损伤、拒绝前扣费与真实关系分列，自然解除保持原delay另采，不以即时结果代替生命周期；计划不表示已采齐。
school-mingjiao-remaining-perform- 为明教剩余17个原绝招的328条件16532计划记录（smoke 656）；原命令、费用、普通攻击被动、即时控制和毒种、三角色挪移及真实花瓣分别观察。毒种不表示自然毒发或解除，实验资格不证明自然师承；计划数量不是已采数量。
  weapon-special 独立采集普通／白绸鞭材质及加力对照，固定 200 级，不与旧中性系列混算。
teaching 经原 ask/give/learn 与真实 NPC 采集授课、交书许可、学习进度和扣费；确定性条件 2 次，随机条件按计划增加，smoke 为 1 次。
teaching-emei-learn- 前缀为28个峨嵋NPC的466条已学关系，1497条件5836计划记录；smoke为1497条。原learn、禁授、上限与实际进度分开，实验预设师承不证明NPC可拜师或正常养成可得。
teaching-emei-recruit- 前缀为28个峨嵋NPC的原apprentice/recruit链路，验证门槛、改名、完整师承、意向、重复与取消；实验资格不证明自然养成。
teaching-emei-special- 前缀为风陵两项原询问传招；门槛、重复、双招连续取得及经验封顶时的附带奖励分别采集，不代表自然拜师或施展成功。
teaching-emei-tonsure- 前缀为峨嵋剃度、未配置入口及还俗拒绝；原法名、身份、记录与资源分列，不以临时标记代替还俗成功。
school-combat 采集已核对的华山组合、独孤／冲灵及全真剑法、徒手、尘法、玄门／先天增益恢复、金关／空明防御、先天附加、玄门金锁、原命令练习／研究与研究升级、内力上限、轻功判定、道学接口、公共恢复与原心跳打坐，以及武当太极剑／拳普攻与绝招、被动化解／招架系数、太极神功增益／疗伤；带 expiry 的解除及打坐终态条件沿用原计时、完整重复 2 次（smoke 1 次）。非全门派完成。
school-team 采集反两仪刀阵的双玩家组阵、移动和离队；原命令逐步记录，每条件 2 次（smoke 1 次），不手动修正解除状态。
school-gumu-advanced- 前缀为连环剑、卷字诀、大江东去与迅雷击，共101条件3828计划记录（smoke 202）；计划剑数、实际攻击、重量、打造身份、碎兵与属性恢复分开观察，不代表已完成全古墓采集。
school-gumu-unarmed- 原绝招组为幽居、天罗地网与千幻神诀，70条件2884计划记录（smoke 140）；该前缀也会匹配下述attack组，单独复跑旧绝招请沿用已保存系列，不将两组混算。
school-gumu-unarmed-attack- 为六门普通拳掌与独立命中附伤，98条件6272计划记录（smoke 196）；保留首次加载、实际有效膂力和动作顺序，五毒普通创伤不冒充绝招持续毒，接口与普攻分列。
school-gumu-throwing- 为玉蜂针／冰魄神针原绝招与原针具，77条件5740计划记录（smoke 154）；手持、耗针、附毒、寒冰减益及最后一枚自然销毁分别观察，不将即时状态当作后续毒伤或恢复。
school-gumu-needle-lifecycle- 为原针毒自然发作及寒冰恢复，28条件56计划机制记录（smoke 28）；保留原施招与定时器，原心跳毒伤和自然恢复分别记账，不代表完整交锋或概率分布。
school-gumu-combination- 为原互备命令与单次攻击轮，198条件8432计划记录（smoke 396）；保留美女拳法原接口错名、准备顺序、守势与随机双击，不映射特殊内功，不代表完整交锋。
school-gumu-defense- 为十五门招架／轻功与两门针法声明，362条件19442计划记录（smoke 724）；原普通攻防、公共直伤与天罗额外化解分列，count不等于mathematics，不把防御系数当概率。
school-gumu-hubo- 为左右互搏知识资格、忙乱减免与原双招命令，166条件5624计划记录（smoke 332）；命令受理、逐招尝试、实际发动及第二招拒绝分别采集，忙乱计数不折算秒，不证明正常养成可达。
school-gumu-combo- 前缀为赤心连环决、黯然销魂与拖泥带水，共75条件2796计划记录（smoke 150）；正常领悟与错键诊断分列，保留属性残留、预扣内力与原时钟冷却，不修原游戏。
school-gumu-fireice- 前缀为冰火二重天两阶段与九阳化解，共35条件2128计划记录（smoke 70）；保留原零延迟回调，每次观察1秒，首掌、回调进入、第二掌及费用独立记账。
school-gumu-poison- 前缀为万毒噬体施招及原心跳毒发，共54条件2852计划记录（smoke 108）；直伤、精神创伤、施毒与后续毒伤分列，原命令种毒和预置异常分开，不代替完整交锋。
school-gumu-weapons- 前缀为古墓六门剑鞭普攻及命中附加，共114条件9734计划记录（smoke 228）；保留实际选招及首次加载上下文，公共攻击与独立hit_ob接口分列，不重新选招或改写全局动作表。
school-shaolin-bout- 前缀为少林六套普通交锋组合，400级、加力0/50，共12条件240场；每场原时钟30秒、交替先手，smoke仅24场各3秒，不当作正式结果。
school-emei-weapons- 前缀为峨嵋四门兵器普攻与五个绝招，97条件3330计划记录；smoke为194条，拒绝与实际效果分列，不代表峨嵋全派完成。
school-emei-unarmed- 前缀为峨嵋五门徒手普攻与绝招，105条件3150计划记录；smoke为210条，复合损伤／控制／普通连击分列，佛光普照仅采未强化拒绝。
school-emei-cultivation- 前缀为峨嵋三门内功与两门知识，263条件5720计划记录；smoke为316条，资格／容量查询／研究进度分列，不补缺失的历史技能。
school-emei-yijin- 为易筋锻骨资格、容量与原研究／练习；性格普通属性与实际技能分开核验，兼修取最大容量、不修原代码。
school-emei-shexing- 为蛇行狸翻额外化解、普通攻击／直伤路径及原练习；count与mathematics分开，接口概率不冒充正常战斗触发率。
school-emei-jiuyin-learning- 为白骨爪／催心掌／银龙鞭学习与练习，原头颅／尸体标记、随机进度和负内力分列；不改游戏行为。
school-emei-jiuyin-passive- 为白骨爪附伤／催心异常，独立接口、原普攻、叠加与自然心跳分列；不改随机或时钟。
school-emei-npc- 为28个原NPC即时配装快照及周芷若8条原战斗闭包，36条件216记录；smoke为36条。逐条调用不等同自然选招或完整交锋，不改NPC数据、不补装备或技能。
school-emei-bout- 为16套峨嵋实验玩家普通交锋组合，400级、加力0/50，共32条件640场；每场原时钟30秒、交替先手，smoke为64场各3秒。原NPC及教学资格分开，不自动施展绝招。
school-gumu-control- 为古墓四个控制绝招，71条件2102计划记录；smoke为142条。原perform命令的资格、实际扣费及双方忙乱分别记录；忙乱计数不等同墙钟秒数，不代表本派其他武学已采齐。
school-gumu-direct- 为古墓四个直伤／缴械绝招，93条件4008计划记录；smoke为186条。原资格、直伤调用、实际伤势、分支费用和缴械实物分别记录；不改随机或将两段直伤视为两个独立施展样本。
school-emei-exert- 为临济强化32条件652计划记录；school-emei-zhao- 为原强化后佛光普照35条件658计划记录；前置／绝招费用分列，含原50秒自然到期，smoke分别38／70条。
school-emei-learning- 为峨嵋十门武学的资格与练习，318条件636计划记录；smoke为318条。原资格查询与原practice分别记录，部分完成保留真实消耗和进度，不代表拜师或教师授课通过。
school-emei-defense- 为九门招架与诸天化身步，182条件8498计划记录；smoke为364条。普攻闪避／招架、公共直伤、缺失接口及原始文本分列，不把反击或未知值混作防御成功。
school-emei-combination- 为峨嵋三组双向互备，174条件7796计划记录；smoke为348条。原准备命令、守势零击、单击／双击及实际选招顺序分列，不把一次攻击轮当完整交锋。
school-quanzhen-combination- 为全真两组独立双向互备与空明拳缺接口对照，142条件4596计划记录（smoke 284）；重阳神掌／终南指法与昊天掌／七星手跨组组合按原valid_combine拒绝，空明拳单备出招不要求互备门槛。原准备命令、守势零击、单击／双击及实际选招顺序分列，不把一次攻击轮当完整交锋。
school-huashan-combination- 为华山三组独立双向互备，198条件5688计划记录（smoke 396）；劈石破玉拳／混元掌、华山拳／华山掌、华山拳法／华山掌法跨组组合按原valid_combine拒绝，华山拳法valid_enable为cuff而非unarmed。原准备命令、守势零击、单击／双击及实际选招顺序分列，不把一次攻击轮当完整交锋。
school-emei-public-force- 为峨嵋三门映射的公共内功即时作用，183条件2718计划记录；smoke为366条。替人疗伤、无异常驱除、聚气与天魔自损分列，不把受理当作生效或即时观测当作完整生命周期。
school-emei-recovery- 为峨嵋三门内功的恢复与原心跳打坐，153条件2070计划记录；smoke为153条。自然恢复、打坐转换、内力封顶和主动收功分列，不用两条边界样本估计长期修炼速度。
school-emei-support- 为峨嵋原心跳疗伤、实际异常驱除与公共强化序列，477条件9186计划记录；smoke为840条。自然恢复、技能单跳、原halt、部分驱除及显式补给分账；存储探针不替代登录或死亡全链。
school-emei-jiuyin- 为周芷若额外三门攻招的实验玩家采集，普攻、四入口、资格、费用、直接死亡与原催心减益解除分别统计；不代表NPC原配装或其余两门额外能力完成。
school-emei-buff-jiuyin- 为易筋锻骨强化、护体和九阴归元的实验玩家采集，分别记录临时字段、实际属性与原时钟解除；不混入攻招前缀，不代表原NPC配装或防御能力完成。
school-mingjiao-public-force- 为圣火心法／圣火神功公共运功即时作用，122条件1812计划记录（smoke 244）；替人疗伤、无异常驱除、聚气与天魔自损分列，roar/shot为原白名单拒绝。受控技能搭配不证明NPC自用、自然师承或完整生命周期。
school-mingjiao-teachers- 为九位明教NPC其余普通授课与原资格边界，363条件11604计划记录（smoke 726）；普通／转世身份、知识教师上限、拒教、资源和真实装备分列。原learn1不清节流、不预写熟练；实验师承不证明自然收徒，不重复已采张无忌令法。
school-taohua-force- 为碧波神功强化／恢复与暗影浮香练习／研究，29条件352计划记录（smoke 58）；原接口资格、容量查询、强化50秒到期、原研究／练习与部分进度分别记录，不改原游戏或时间。
teaching-taohua- 前缀为桃花岛普通学习／拜师／五书取得和研读，187条件3608计划记录；smoke为187条。原learn、许可、随机进度、正式拜师、转介与原单例书载体链分开，实验师承/持书不证明自然养成；study无教师路线只扩展既有观察器，不制造NPC。
school-scene 采集伏魔圈原go入场、退出及再入场；资格条件2次、含随机攻击条件100次（smoke 1次）。failure前缀另采低气血失败，followup条件按原时钟等待105/5秒并尝试退出。仅记录原行为，不把场景许可当作学会武功。
  school-scene-mingjiao-route-main- 前缀另采原石门 break 门槛、实际扣费、5秒自然关门、密道行走和秘籍取得，共8条件16条（smoke 8）。返回1、开门、进入和物品交付分别统计，不造出口、不手动关门回调、不钳负内力。
  school-scene-mingjiao-route-cold-9-mishi-0、school-scene-mingjiao-route-cold-mishi-9-0、school-scene-mingjiao-route-cold-0-mishi-9 各须用 --case 单独系列、单样本、独立驱动记录原房间首载顺序，不能合批或把预加载当玩家行走。
gifts 前缀通过原 ask/give/drop/get 采集三件宝物的经验门槛、唯一归属、重复领取及归还；2次豁免条件与100次普通入场条件分列。
special 前缀另采缺席／昏迷守阵者、大宗师及辈分优先级、双玩家原give转交；每条件2次，初态布置和原命令分别留证，不预写入场许可。
例：node tools/collect_martial_data.mjs inventory
当前 inventory 只生成公开源码的词法清单，不启动游戏或测量战斗效果。
只额外读取公共名称字典 data/e2c_dict.o，不读取其他存档、正式配置和密钥。
输出 inventory.json、catalog.json 与 summary.md；教学和适用类别仍需实测。
weapons/weapon-special/abilities/teaching/school-combat/school-team/school-scene/bouts/resume 会在临时 MUDLIB 启动真实驱动和两个回环连接，不连接正式服或模型。
resume 不覆盖旧样本；错误/拒绝仍保留，条件改变或修复夹具后须新建系列。
statistics 只读原记录，打印均值摘要；指定 --output 时另存 JSON 完整分布及 Markdown，不改原系列。
`;

export function parseArgs(args) {
    if (args.length === 0 || args.includes('--help')) return { help: true };
    assert.ok(['inventory', 'coverage', 'weapons', 'weapon-special', 'abilities', 'teaching', 'school-combat', 'school-team', 'school-scene', 'bouts', 'resume', 'statistics'].includes(args[0]), '当前子命令：inventory / coverage / weapons / weapon-special / abilities / teaching / school-combat / school-team / school-scene / bouts / resume / statistics');
    const options = { command: args[0], driver: join(root, 'bin/driver.exe'), smoke: false, samples: 100, bouts: 20, level: 200 }, seen = new Set();
    for (let i = 1; i < args.length; i++) {
        const key = args[i];
        if (key === '--smoke' && ['weapons', 'weapon-special', 'abilities', 'teaching', 'school-combat', 'school-team', 'school-scene', 'bouts'].includes(options.command)) { options.smoke = true; continue; }
        const allowed = options.command === 'inventory' ? ['--output', '--driver'] : options.command === 'coverage'
            ? ['--input'] : options.command === 'statistics' ? ['--input', '--output']
                : options.command === 'resume' ? ['--input', '--driver', '--case']
                : options.command === 'bouts' ? ['--output', '--driver', '--bouts', '--level', '--case']
                : ['teaching', 'school-team', 'school-scene'].includes(options.command) ? ['--output', '--driver', '--case',
                    ...(['teaching', 'school-scene'].includes(options.command) ? ['--case-prefix'] : [])]
                : ['--output', '--driver', '--samples', '--case', ...(options.command === 'weapons' ? ['--level'] : []),
                    ...(['school-combat', 'abilities'].includes(options.command) ? ['--case-prefix'] : []),
                    ...(options.command === 'school-combat' ? ['--case-group'] : [])];
        assert.ok(allowed.includes(key) && args[i + 1] && !args[i + 1].startsWith('--'), `无效参数：${key}`);
        assert.ok(!seen.has(key), `重复参数：${key}`); seen.add(key);
        const value = args[++i];
        if (['--samples', '--level', '--bouts'].includes(key)) {
            assert.ok(/^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0, '须为正整数：' + key);
            options[key.slice(2)] = Number(value);
        } else if (key === '--case' || key === '--case-prefix') {
            assert.ok(/^[a-z][a-z0-9_-]*$/.test(value), '条件 ID 无效'); options[key === '--case' ? 'case' : 'casePrefix'] = value;
        } else if (key === '--case-group') {
            assert.ok(/^[a-z][a-z0-9_-]*$/.test(value), '条件组无效'); options.caseGroup = value;
        } else options[key.slice(2)] = resolve(value);
    }
    if (['coverage', 'resume', 'statistics'].includes(options.command)) assert.ok(options.input, options.command + ' 需要 --input 系列目录');
    assert.ok(!(options.case && options.casePrefix), '--case 与 --case-prefix 不能同用');
    assert.ok(!(options.caseGroup && (options.case || options.casePrefix)), '--case-group 与 --case、--case-prefix 不能同用');
    return options;
}

function canonicalFuture(path) {
    path = resolve(path);
    if (existsSync(path)) return realpathSync(path);
    const parent = dirname(path);
    assert.notEqual(parent, path, '无法定位输出目录');
    return join(canonicalFuture(parent), relative(parent, path));
}

export function newOutput(path) {
    if (!path) return mkdtempSync(join(tmpdir(), 'mud-martial-data-'));
    const actual = canonicalFuture(path);
    assert.ok(!isInside(root, actual), '证据目录必须位于仓库外');
    assert.ok(!existsSync(actual), '不覆盖已有证据目录');
    mkdirSync(actual, { recursive: true });
    return actual;
}

export function runInventory(options) {
    const output = newOutput(options.output);
    console.log('只读武学清单：' + output);
    const inventory = buildInventory(root);
    inventory.versions = collectVersions(root, options.driver, output);
    inventory.created = new Date().toISOString();
    const catalog = collectCatalog(root, inventory);
    writeFileSync(join(output, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n', { flag: 'wx' });
    writeFileSync(join(output, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n', { flag: 'wx' });
    writeFileSync(join(output, 'summary.md'), inventoryMarkdown(inventory), { flag: 'wx' });
    console.log(JSON.stringify(inventory.totals));
    console.log(JSON.stringify(catalog.totals));
    console.log('清单完成；实测覆盖尚未开始。');
    return { output, inventory };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    try {
        const options = parseArgs(process.argv.slice(2));
        if (options.help) console.log(help);
        else if (options.command === 'coverage') console.log(coverageMarkdown(coverage(options.input)));
        else if (options.command === 'weapons') await runWeapons(root, newOutput(options.output), options);
        else if (options.command === 'weapon-special') await runWeaponSpecial(root, newOutput(options.output), options);
        else if (options.command === 'abilities') await runAbilities(root, newOutput(options.output), options);
        else if (options.command === 'teaching') await runTeaching(root, newOutput(options.output), options);
        else if (options.command === 'school-combat') await runSchoolCombat(root, newOutput(options.output), options);
        else if (options.command === 'school-team') await runSchoolTeam(root, newOutput(options.output), options);
        else if (options.command === 'school-scene') await runSchoolScene(root, newOutput(options.output), options);
        else if (options.command === 'bouts') await runBouts(root, newOutput(options.output), options);
        else if (options.command === 'statistics') {
            const report = collectStatistics(options.input, { npcBoutReport: gumuNpcBoutReport });
            const markdown = statisticsMarkdown(report, { npcBoutMarkdown: gumuNpcBoutMarkdown });
            console.log(markdown);
            if (options.output) {
                const output = newOutput(options.output);
                writeFileSync(join(output, 'statistics.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
                writeFileSync(join(output, 'statistics.md'), markdown, { flag: 'wx' });
                console.log('统计报告：' + output);
            }
        }
        else if (options.command === 'resume') await resumeCollection(root, options.input, options);
        else runInventory(options);
    } catch (error) { console.error('采集失败：' + error.message); process.exitCode = 1; }
}
