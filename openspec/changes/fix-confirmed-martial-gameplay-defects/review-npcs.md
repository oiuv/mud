# NPC与场景缺陷复核

状态：源码修复与专用夹具已交付主 Agent，真实驱动回归由主 Agent 串行运行。本文不将“已改代码”写成“已验收”；以下效果须以实际输出补录。原台账、样本及源码指纹未改写。

## 当前处置

| 编号/子项 | 当前依据与处置 | 验证/剩余边界 |
| --- | --- | --- |
| MA-008.01 | 生成者华山分支已有 huashan-jian，修正招架错名 | npc_fixes 控制原 family selector 的索引2，检查原分支初始化及有效映射 |
| MA-008.02 | 丛不弃已学华山心法120，修正内功错名 | 原NPC初始化、有效技能加成 |
| MA-008.03 | 裘千尺已学飞龙杖，staff应映射 feilong-zhang | 主 Agent 负责 chi.c 与 teaching 夹具；本Agent未触碰该文件 |
| MA-008.04～09 | 范遥、老道、潘秀达、无崖子、乌旺阿普两处已有正确技能，修正对应错名 | 原NPC初始化与有效技能贡献逐项断言，不补技能等级 |
| MA-021 | 后生获胜分支改小于；顺手去除“还是是”重复字 | 原 player_win，广播边界观察；胜者20/40/60、对手40 |
| MA-022 | 反向归属读取改 query_temp | 原 actual_combat.auto_fight，真隔离连接；正向/反向/无归属三对照；不得用combat spy代替 |
| MA-031 | 阴风刀未学，不能唯一决定换哪套招架或补几级 | 待决策，不修改黛绮丝配武学 |
| MA-032 | ben.h 两入口查找改枯荣真实ID kurong | 已改源码；实际四僧 accept_hit/accept_kill 支援链尚待专门回归，不记已验证 |
| MA-033 | 死亡消息读取实际 die(killer) 参数，移除未赋值 kob | 已改源码；随机掉谱、真实频道人名尚待专门回归，不记已验证 |
| MA-035 | 询问剃度及跪拜均复核原 permit_recruit；跪拜消费自身邀请标记 | 原ask、apprentice、kneel路径，叛师拒绝与取得邀请后资格变化；尚需同门正常完整剃度正向 |
| MA-037.01～02 | 目标ID均已明确为百损；全库唯一房间创建引用为玄冥峰，同门鹿杖客已有相同援助配置，故替换为该真实目的地 | 原鹤笔翁/乌旺房间触发kill_enemy，检查百损赶到、杀敌及原回程，待执行 |
| MA-038.01～05 | 五个NPC已学 zhaixing-gong，统一映射该已学技能，不合并两门技能 | 五个原NPC的映射与有效轻功断言 |
| MA-040 | moving_ob 无实现，无法从缺失名称唯一推导应移动谁/去哪 | 待决策，不补任意回调或删除玩法 |
| MA-042 | 嵩山拳准备到 cuff，保留掌法strike | 原狄修初始化两个准备键 |
| MA-043 | 目标ID已明确左冷禅；全库唯一房间创建该class对象的是封禅台，替换为该真实目的地 | 原狄修房间触发kill_enemy，检查左冷禅赶到、杀敌及原回程，待执行 |
| MA-044.01 | 米为义已学/持剑映射均 henshan-jian，招架改同技能 | 原NPC有效招架 |
| MA-044.02 | 费彬只有基本轻功，缺特殊轻功等级 | 待决策，不补任意等级 |
| MA-046 | 丁坚求援ID改黑白子真实ID heibai zi | 已改源码；护庄援助实际触发尚待专项回归 |
| MA-047四项 | 四位庄主只为低于10者补到10，保留已有高等级 | 原ask日月神教，未学/9/10/20、重复、外门拒绝；原付费严格比较不改 |
| MA-049 | 桑土公招架目标未学，补学或换配没有唯一依据 | 待决策 |
| MA-050 | 珍珑收徒读写同一 betrayer/times，保留原恢复意图 | 显式提供已过珍珑这一输入条件，原apprentice两次确认与recruit；不声称测试完整下棋养成；单门派叛师计数不变 |
| MA-052 | titile改title，create_family不再覆盖正确自定义头衔 | 原慕容复初始化查询真实展示字段 |
| MA-053 | 拒学对白补say前缀，原拒绝返回-1不变 | 原 no_teach 回调、正神拒绝消息；尚需完整learn命令验证 |
| MA-056 | reset回填领取路径实际读取的temp库存 | 5次原ask领尽、空库存拒绝、reset后再次领取；900秒规则不改 |
| MA-057 | 八阵掌/八卦掌均真实存在，不能仅从类别错配决定采用哪一套 | 待决策 |
| MA-059 | move失败立即反馈，不输出得到书信或扣2200贡献 | 原ask天刀八势，负重失败/成功/重复及实际书信归属 |
| MA-065 | difficult_level读取本次this_player，冷上下文兜底原600 | 角色实际命令上下文无招许可1000/有招600；完整research成本分布未重采 |
| MA-066 | qi/po领悟达到100后不再追加通晓奖励 | 两项100/101边界，原 skill_improved；99首次跨界与原improve_skill连续升级尚待补回归 |
| MA-067 | 主Agent已负责，不再修改 | 见 teaching 组 |
| MA-091 | 无名僧内功与自动绝招资格冲突，改配招或换内功没有唯一依据 | 待决策，不更改武学本身的资格 |
| MA-103两处 | 等待计数作为回调参数传递；到300后返回且不再安排waiting | 原waiting 300边界检查do_back唯一；原实际300秒等待、就绪转换仍需主Agent补长回归 |
| MA-104 | 两位罗汉各增加唯一阵法查找别名1/2，原ID/别名保留；玄难名单对应唯一别名 | 原banruo1/6创建与原do_back两轮归位；18位各出手一次及全程挑战尚待补回归 |
| MA-105 | 低经验弟子被送出后立即返回 | 真interactive连接、原room init，99999送出无标记无攻击；100000正向仍九击获许可 |
| MA-106 | 九次攻击均从相应施招僧人取当前武器 | 原room init，三位各三击，spy只观察参数等于实际装备，不冒称完整伤害结算已测 |
| MA-108 | 三个错误招名的替代及鞭装备需要整体配招决定 | 待决策，不猜招/补装备 |
| MA-112 | 护体缺大伏魔拳与激发；补技能或移除护体需决定 | 待决策 |
| MA-113林朝英 | 剑法映射与剑/鞭三绝招不匹配，如何切换实物武器未定 | 待决策 |
| MA-113小龙女 | twice必须由perform命令解析，自动闭包改走现有command入口 | 原NPC、原闭包；控制原互搏随机条件后应两次feng共四次伤害边界调用；不补武器或技能 |
| MA-119 | 青布袍调用既有setup初始化耐久，不改原装备属性 | 原物品耐久100、真实wear/unequip加减护甲；林/杨真实配装仍需补核对 |
| MA-129 | 原密室/甬道出口不互返；改路由与保留单向门方案有不同玩法含义 | 待决策，不擅自改密室出口或mudcore门系统 |
| MA-143 | 两个带路入口保存真实起点对象并返回，不依赖未初始化startroom | 原tao_in创建教师、原ask学艺；未提供许可不带路、拜师入口往返尚待补回归 |

## 驱动输入与观察边界

- npc_fixes.lpc 与 referee_probe.lpc 是独立夹具，不修改共用actor或回归入口。
- referee_probe仅观察原广播边界；actual_combat必须为修前/修后原combatd完整源码副本，不继承spy。
- 原生成器只控制 family selector 的随机输入为2；原私有 from_huashan 方法、技能初始化均执行。
- 小龙女原 perform 命令及 feng 招式的随机输入使用既有control，避免把互搏200级随机失败当断言不稳定；动作体不替换。
- 本Agent按主Agent分工未启动驱动，不声称上述断言已经运行通过。

## 精确修前负对照文件清单

基线 `e54a7cd8847206c4e33581251c7dbaf4dda9bf3e`。仅下列游戏源码进入本组负对照；夹具总使用当前版本。

```json
[
  "adm/npc/referee.c",
  "adm/daemons/combatd.c",
  "clone/cloth/qingyi.c",
  "d/shaolin/fumoquan.c",
  "kungfu/class/generate/chinese.c",
  "kungfu/class/huashan/cong-buqi.c",
  "kungfu/class/mingjiao/fanyao.c",
  "kungfu/class/misc/laodao.c",
  "kungfu/class/wudu/panxiuda.c",
  "kungfu/class/xiaoyao/wuyazi.c",
  "kungfu/class/xuanming/wuwang.c",
  "kungfu/class/xuanming/he.c",
  "kungfu/class/songshan/di.c",
  "kungfu/class/henshan/mi.c",
  "kungfu/class/meizhuang/ding.c",
  "kungfu/class/meizhuang/danqing.c",
  "kungfu/class/meizhuang/tubi.c",
  "kungfu/class/meizhuang/heibai.c",
  "kungfu/class/meizhuang/huang.c",
  "kungfu/class/xingxiu/azi.c",
  "kungfu/class/xingxiu/chuchen.c",
  "kungfu/class/xingxiu/dizi.c",
  "kungfu/class/xingxiu/shihou.c",
  "kungfu/class/xingxiu/tianlang.c",
  "kungfu/class/ouyang/ouyangke.c",
  "kungfu/class/murong/murongfu.c",
  "kungfu/class/murong/murongbo.c",
  "kungfu/class/xuedao/shanyong.c",
  "kungfu/class/shang/ming.c",
  "kungfu/class/taohua/feng.c",
  "kungfu/class/shaolin/xuan-nan.h",
  "kungfu/class/shaolin/xuan-ku.h",
  "kungfu/class/shaolin/cheng-xin.c",
  "kungfu/class/shaolin/cheng-xin2.c",
  "kungfu/class/tianlongsi/ben.h",
  "kungfu/class/tianlongsi/kurong.c",
  "kungfu/skill/dugu-jiujian.c",
  "kungfu/class/gumu/longnv.c"
]
```

## 格式化

已对上述源码和 npc_fixes/referee_probe 运行项目格式化及 --check；新增夹具后仍需主Agent整合时重跑。没有改存档、历史采样、驱动或子模块，没有提交。

## 隔离首轮诊断

主Agent首轮 `mud-martial-audit-HczlDP` 为154检查、4失败，不能计通过。已定位为两处夹具错误及一项公开表依赖遗漏：

- 生成者蓝图 `load_object` 的首次 create 先消费了控制用的族系索引2，实际 clone 随后选默认0。先加载蓝图、再提供clone的索引输入；未改原族系函数。
- 带路角色离开演武场后，原夹具的 `invoke` 依赖演武场注册的动作，导致学艺询问根本未执行。非演武场场景改走角色原命令分发 `force_me("ask ...")`，继续核验真实角色与教师位置，不放宽回程断言。
- 真连接角色移动触发原 `look`，再触发 `natured` 读取缺失的公开表 `/adm/etc/nature/day_phase`，最终 `explode(0)`。由主Agent补复制原公开天气表，不修改游戏守护精灵、不用伪造天气绕过。

三者均不是新的游戏缺陷，也不新增 MA 编号；首轮失败原件保留，修正后需要重新执行。

## 补充真实入口回归（待主 Agent 执行）

- MA032：原牟尼堂、本因与枯荣，分别调用原 `accept_hit`、`accept_kill`，检查枯荣实际登记攻击者为杀敌。
- MA046：原客厅丁坚调用原 `kill_enemy`，检查后庭黑白子实际赶到、进入援助状态并登记同一攻击者。
- MA104：罗汉堂与般若堂各九名原 NPC，逐房读取、移到对应练武场，再通过玄苦／玄难原 `do_back` 回到各自原房间，重复两轮。不是全程闯阵战斗验收。
- MA119：除独立物品穿脱外，补原林朝英和杨过初始化，检查青衣已穿戴、耐久完整。
- MA103：增加 `run_timed`，原等待函数输入累计 299，隔离 runner 仅将下一次等待的 1 秒调度延迟缩为 0；增量、300 阈值、参数传递和原回位函数不改。实际经驱动调度后检查两名主持回位及清除挑战者记录。这个测试不代表真实等待 300 秒。

- MA033：原枯荣 `die(killer)`、原唯一剑谱及原频道发送，经驱动真实连接角色的 `receive_message` 接收，精确检查实际击杀者名字和夺谱传闻；只控制原随机输入，不替换死亡或频道函数。

上述夹具已经格式化与 `--check`，静态 `git diff --check` 通过；未启动驱动，尚不作为运行通过证据。异步验证期间连接角色暂移至无 NPC 静室，验证后移回；不屏蔽生产守卫函数。

## 同文件明确文案补漏

独立清单为 `tools/tests/martial_audit/npc_text_fixes.json`，25 条替换、16 个文件，记录修复前后文本；确有玩法逻辑同时修改的文件标记 `mixed`，不把整文件宣称纯文案。新增修复涵盖 MA025/039/048/051/054/058/109/115 的剩余明确显示问题，包括量词、代词、错字、重复字和动作标点。戴永明年龄字段仍为35，只将描述改为“三十多岁”。

黄药师询问键旧拼写“玉萧剑法”、以及其他旧输入主题均不改。另一个并行分组负责冯默风、黛绮丝、伏魔圈的对应展示修复，本清单不重复登记。全部本次文案文件已经项目格式化和 `--check`，不以此替代运行交互验证。

## 教学到施展补充夹具

新增 `tools/tests/martial_audit/teaching_perform.lpc`，由主 Agent 接入教学组：MA017/055/142 使用真实驱动连接角色，经原 `ask` 获取许可、原 `perform` 命令与技能路由施展；先验证未授课拒绝，再验证清心剑的目标状态、乱气剑／千蛇万噬的原伤害边界、谁与争锋的四击与固定费用。许可不由夹具直接赋予。

MA067 的“破枪式”是总破式的兵器知识而非独立绝招文件。夹具通过原 `skill_improved` 累积总破式许可，先对真实镔铁长枪执行总破式，再经原风清扬询问教学授予枪系知识，以相同随机输入核对原总破式 AP 翻倍后的七击分支；不创建虚构 `spear` 绝招，不把静态数组变化当作完整效果验证。

以上为新增夹具的验证设计，格式化及 `--check` 已通过，尚待主 Agent 实际运行；原教学组的首次／重复／拒绝测试保持不动。

## 后续隔离失败诊断

- `mud-martial-audit-YBLxUG`：243 检查、7 失败，不能计通过。其中 MA033 原掉谱条件为 `random(15) == 1`，夹具原来提供0未进入该分支，已改为显式随机输入1，原死亡及频道函数保留。其余六项援助失败发现生产前置缺口：通用房间的 `make_inventory` 只设置 `home`，而宿主守卫／枯荣／援助回程读取 `startroom`；现阶段不在夹具中直接设置该字段规避，等待主 Agent 范围确认。
- `mud-martial-audit-eEuEcg`：教学117检查、7失败，原教学87项仍通过。新增施展夹具误以为 `start_busy(0)` 会清除忙乱，但框架函数对此直接返回，导致首招之后被原命令正确拒绝；改用宿主已存在的 `suspend_busy()` 重置独立测试轮次。另真实 NPC 删除时会删除携带物，修正清理顺序为先枪后持枪者，避免随后 `destruct(0)`。未放宽授后效果断言。

两次失败证据保留，以上修正均需重新真实执行才能计通过。
