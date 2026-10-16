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
  --case-prefix P teaching/school-combat/school-scene/abilities 新建系列仅采指定 ID 前缀；续跑沿用已保存范围
  --case-group G  仅 school-combat 新建系列按 collection_group 精确选择；与 --case、--case-prefix 两两互斥
                 例：school-combat --case-group mingjiao-remaining-base（338条件，正式15670条，--smoke为676条）；计划不表示已采齐
abilities 核验恢复、控制、增益/解除、弹药、缴械和学习接口，参数不与兵器组混算。skill-music- 前缀为11件公共演奏武学：55个valid_learn边界与39个原play/do_effect条件（含舞蛇曲有效等级49/50补充边界），默认4010计划记录（smoke 149）；演奏每条件默认100次，可用--samples指定。合奏、国歌附加攻击与完整回调另待采集，不以本组代替；只统计收集，不比强弱。
learning- 前缀为六门全武学 valid_learn 接口边界（抽髓掌/冷月神功/轩辕箭/药王妙术/笑傲江湖曲/点沧海），共12条件24计划记录（smoke 24）；直接观察原接口返回与拒绝原句，不冒充教师传授或练功成功，错拼技能键只作缺席核验。
skill-inherited- 前缀为20个纯继承技能的原valid_learn/type/valid_learn_level默认接口，60条件120计划记录（smoke 60）；返回值、真实继承来源及双USER完整状态分别核验，不表示20种玩法或兵器战斗效果已完成。
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
