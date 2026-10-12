# 桃花音乐：原 `play` 有限预检

本页只记录未注册的独立采集准备。当前 **30 条件 / 648 正式计划 / 30 烟雾计划，真实样本 0**；没有启动驱动，没有修改游戏源码、共享采集器、玩家存档或既往证据。离线合成通过只表示输入协议可审，不能称演奏效果已实测。

对应 [条件及校验](../../tools/tests/martial_data/school_taohua_music_cases.mjs)、[离线自检](../../tools/tests/martial_data/school_taohua_music.test.mjs)。接续 [桃花范围预检](2026-10-11-school-taohua-preflight.md)，不是补写旧原件。

## 1. 去重与实际入口

本组是知识类曲谱 [碧海潮生曲](../../kungfu/skill/bihai-chaosheng.c) 和 [桃花怨](../../kungfu/skill/taohua-yuan.c)，不是 [玉箫剑法 `bihai`](../../kungfu/skill/yuxiao-jian/bihai.c)“碧海潮生按玉箫”。后者通过 `perform`、有自己的内力支出、判定与忙乱；不得把两种碧海潮生合并统计。

真实链为乐器 `init → add_action("play_xiao", "play") → MI_XIAO.play_xiao → chuixiao-jifa.play → 曲谱.do_effect`：

- [普通箫实体](../../d/items/xiao.lpc) 76–78 行注册 `play`；[箫剑继承](../../inherit/weapon/xsword.c) 28–30 行也注册。
- [MI_XIAO](../../inherit/misc/_xiao.c) 3–11 行仅处理 `with <id>` 与实际物品别名，再原样调用公共演奏入口。
- [吹箫技法](../../kungfu/skill/chuixiao-jifa.c) 19–32 行依次检查参数、原曲谱等级非零、`valid_enable("chuixiao-jifa")`、忙乱。成功后第 62–65 行原 `start_busy(3 + random(3))`，同步完成 `do_effect`，返回 1。`force_me` 的外层结果仍保存原正整数命令成本，不能硬写成 1。

本组使用原 `/d/items/xiao/zhuxiao`（[数据](../../d/items/xiao_data.h) 52–62 行，600 重、竹质、`xiao` 别名）和原 [桃花玉箫](../../d/taohua/obj/yuxiao.c)（500 重、石质、`init_xsword(45)`）。箫剑继承将武器伤害逐次整除为 40、类型 `sword`、`EDGED=4`；重量不足 3000，不产生装备减闪避。耐久由 [装备初始化](../../adm/daemons/itemd.c) 835–891 行补为 100。

[hand](../../cmds/std/hand.c) 写实际 `handing`；[wield](../../cmds/std/wield.c) 进入原 [装备链](../../feature/equip.c)；[drop](../../cmds/std/drop.c) 128–143 行原 `move` 后仍保留有价值的竹箫。演奏入口本身没有“必须 handing 或 weapon”限制，因此保留携带、手持、装备和原 `drop xiao → play taohua-yuan with xiao` 四种有限诊断。**地上箫是否符合玩法意图未判定**，不绕过原命令来制造成功，也不因练习接口要求手持而虚构演奏限制。

[教学与五书预检](2026-10-12-school-taohua-learning-preflight.md) 已包含普通曲谱学习和书谱取得/研读。音乐组不重复借书、交书、`learn`、`study`。两首曲谱的 `practice_skill` 确实要求实际手持箫、精神至少 80、气血至少 30，并分别消耗精神 45/25、气血 20/10；那是**练习接口**，不计入本组演奏费用，也不声称本轮已经采到练习业务。

## 2. 原公式与观测含义

### 碧海潮生曲

来源：[本体](../../kungfu/skill/bihai-chaosheng.c) 38–88 行、[有效技能](../../feature/skill.c) 135–150 行、[原伤害/创伤](../../feature/damage.c) 26–102 行。

设 `M = raw(吹箫)/2 + raw(曲谱)`，每个整数除法按原位置截断。`no_fight`、`skybook` 或 `M < 150` 都在 `play` 已受理并产生忙乱后提前结束效果，不是命令拒绝。

`A = (M/5 + effective(force))/2`。原房间 `all_inventory` 中逐一排除非人物、自己、非 living、`die_guard`、曲谱抵抗较高者。曲谱抵抗条件为 `caster_effective_song * 2 / 3 >= listener_effective_song`；随后逐人抽 `random(A)`，仅当 `A + random(A) >= listener_effective_force` 且 `max_neili` 差至少 500 才施效。

成功时请求精神伤害为 `max_neili 差 / 10`，请求精神创伤为伤害再 `/3`。**请求值不是实际资源损失**：`receive_damage` 负值钳为 -1，`receive_wound` 同样钳有效精神并可压低当前精神。正式计量复用原 `set` 差额，分别保留 `jing_cost` 与 `eff_jing_cost`，不相加。

三个全新中立 USER 的实际敌对变化按 [原攻击接口](../../feature/attack.c) 75–99、102–194、196–213 行验证：演奏者对受影响者增加 `wants` 和 `enemies`；受影响者对演奏者增加 `killers` 和 `enemies`。不凭文案声称命中，不替换为预设的双方 kill 上下文。

基准固定基础内功 600、不映射特殊内功，因此有效内功为 300；两位旁听者内功亦为 300。演奏者 `max_neili=6000`，旁听者为 3000。下表是**源公式支持集，不是实测命中率**：

| 曲谱/吹箫原等级 | M | A | 每位旁听者原比较通过支持数 | 请求精神/创伤 |
| ---: | ---: | ---: | ---: | ---: |
| 200 | 300 | 180 | 60 / 180 | 300 / 100 |
| 400 | 600 | 210 | 120 / 210 | 300 / 100 |
| 800 | 1200 | 270 | 240 / 270 | 300 / 100 |

### 桃花怨

来源：[本体](../../kungfu/skill/taohua-yuan.c) 40–55 行。`M < 100` 时同步无效果；否则对同房除演奏者外的整个对象数组调用 `receive_heal("jing", random(M) + 10)`。没有碧海潮生曲的人物、living、死亡保护、敌我、场地限制。当前有限矩阵会观察中立 USER、原昏迷 USER、`die_guard` USER 和地上原竹箫，不据源码推断为“已实测所有种类/敌对关系”。

`random(M)+10` 作为一次已求值实参传给数组各对象，范围 `[10, M+9]`；不是每人另抽一次。`receive_heal` 只恢复当前精神到 `eff_jing`，不恢复创伤、不恢复演奏者，也不自动唤醒昏迷者。两位旁听者未封顶时恢复相同；封顶时分别验证原上限和同一个实参可满足的交集。全封顶而无法确定实参时记未知，不能用净恢复猜请求恢复量。

数组实参依据为实测二进制对应 FluffOS **328aaf10** 的 `src/packages/core/efuns_main.cc:226` 与 `src/vm/internal/base/interpret.cc:4982–5020`：`call_all_other` 将栈上同一组实参逐对象 `push_svalue`，没有重算表达式；无对应方法的非人物不执行该方法。`function_exists` 的公开返回会在 `efuns_main.cc:675–714` 去掉 `.c/.lpc` 并加 `/`，所以乐器 `play_owner` 应为 `/inherit/misc/_xiao`。这两份对应提交的源文件 SHA-256 分别为：

```text
src/packages/core/efuns_main.cc
9be44d074a0f6d02954c193e55bac115a7a041d1eaebd2d9fc6151208a2e992f
src/vm/internal/base/interpret.cc
ba023b722b5b9eb4805484b6f0029b49a4e7b636b3d820c9fd2a642c55cb0006
```

不使用当前另一个驱动 checkout 的版本冒充此依据。原消息分类字面量为 `"visoin"`，本组尚未实测其客户端显示影响，先保留来源事实，不编号为确定玩法缺陷。

### 费用、忙乱与停止

两首 `do_effect` 和 `play` 都没有精神、气血、内力扣费；与有消耗的练习、玉箫剑绝招分账。原技能等级、学习进度也不在这里增长。实验人物固定“光明磊落”、无左右互搏，故原 [start_busy](../../feature/action.c) 7–34 行不适用其缩短分支，记录的忙乱整数为 3–5，**不能当作秒数**。

两首曲子没有持续演奏 `call_out`。本组不制造“取消回调”。唯一停止观察是同一即时窗口内 `play → halt`：桃花怨已完成恢复，演奏者无敌对但仍忙乱，[halt](../../cmds/std/halt.c) 39–42 行拒绝“你现在停不下来。”；恢复和忙乱均不回滚。不延伸到自然忙乱解除或完整交锋。

## 3. 有限矩阵

全部为三个真实、连接中的非巫师 USER；已掌握技能、门派、资源只是合法实验初态，不是自然培养成本。基础内功不映射，`jiali=0`。正式每个基准随机条件 100 次，其余只做 2 次机制观察；不对 2 次样本估计随机分布。烟雾每条 1 次。

| 子组 | 条件 | 数量 | 正式计划 |
| --- | --- | ---: | ---: |
| 碧海基准 | 曲谱/吹箫 200、400、800 | 3 | 300 |
| 碧海效果门槛 | M149/M150，内功必挡，max_neili 差499/500 | 5 | 10 |
| 碧海范围保护 | no_fight、skybook、右侧die_guard、曲谱抵抗有效67/66、右侧原昏迷 | 5 | 10 |
| 碧海资源与乐器 | 精神/创伤钳至-1，携带竹箫，装备玉箫 | 3 | 6 |
| 公共play拒绝 | 未会曲谱、忙乱50、已会force但不是曲谱、无参数 | 4 | 8 |
| 桃花怨基准 | 曲谱/吹箫 200、400、800 | 3 | 300 |
| 桃花怨有限效果 | M99/M100、差额2/10封顶、保护场地仍恢复、昏迷/死亡保护仍恢复、原drop后的地上箫、play后原halt | 7 | 14 |
| 合计 | 不做笛卡尔积 | **30** | **648** |

M149 使用吹箫100/曲谱99，M150 使用100/100；桃花怨M99使用66/66，M100使用68/66，均保留原学习本体可接受的基础关系。拒绝条件故意不满足相应公开演奏前置，不补技能过关。

原昏迷准备通过 [unconcious](../../feature/damage.c) 170–248 行，将气血/精神归零并保留原解除定时，不在正式观察前填回。原准备快照、终态单列；演奏窗口无心跳/回调/新昏迷，桃花怨只恢复精神但不唤醒。实例清理可移除隔离人物原定时，不能将此称作曲谱取消。2 条昏迷条件只检查即时效果，不交付自然苏醒观察。

## 4. 最小共享接线（尚未实施）

1. 以后在共享 `school_combat_cases` 尾部注册 `taohua-music`；`validateSchoolRecord` 仅对本组进入专属校验。`method=music` 仍用现有原命令分支，不新建执行器。来源 `entry_id` 是原曲谱 `do_effect` 的目录入口，但测量入口必须是 `force_me(play...)`，不是直接调效果函数。
2. 本组才放行既有第三 USER、原条件和原昏迷准备。原 `set_name` 的三个别名以及实际对象引用必须唯一。`snapshot` 复用原资源、技能/有效技能、学习进度、装备、条件、原敌对；仅补本组 `is_character/environment/character` 的现有读取白名单。
3. 准备原竹箫或原玉箫到演奏者，按条件经真实 `hand/wield/drop`。保存 `music_preparation` 的原命令、原正成本、同一物品和演奏者前后；携带条件无准备命令、返回值显式 null。核原 `id("xiao")`、`present` 精确对象、`valid_as_xiao()`、`function_exists("play_xiao")`、物品实际环境、槽位。准备完再启动全部三人的计数。
4. 两个只读 `music_context_before/after` 保存房间实际 no_fight/skybook、`all_inventory` 原对象列表和同一乐器描述，不用参数回显替代。持有/携带场景房间仅三个 USER；地上箫场景另含这一个原乐器。非人物无 `receive_heal` 不伪造资源零记录。
5. `music_steps` 仅一条原 play，或同栈 play 后原 halt；各步记录实际 actor/action/正命令成本或零拒绝、query_notify_fail、三人前后快照。原 `launches` 等 combat/perform 数组为空，不伪造“发动探针”；受理后可能无效果仍是 observed。拒绝保留原提示（可有已核终端固定前缀），不是删除 ANSI/改正文来过测。
6. 复用现有 immediate 结束与 `extra_target_*` 快照/计数；不让原心跳跨入本窗口。严格零攻击/回调/终态、资源逐键对账，敌对与伤害对象对应；仪器损坏/技能增长/目标替换等均拒绝。收尾对本轮精确物品和人物引用操作，地上乐器也要清理，不能漏到下一条范围。
7. 报告调用 `taohuaMusicEffects(rows, frozenCondition)`，不读被剥离的 raw.parameters；外层与原记录 condition_id/outcome 先核同源。分别列两位旁听者的效果、实际精神损失/创伤/恢复；总体概率按样本，不把同一次共同恢复的两个听众当独立抽样。封顶恢复量已知而共同请求不明时只将后者列未知。
8. 新系列显式冻结本模块/测试、实际报告/统计依赖和全部来源；原条件/原件不可回填。当前 13 项自检运行公共 `validateRecord` 与真正 `createSeries/openSeries`，**尚不等于完整共享计划、LPC 冷加载或真实驱动通过**。

不需要修改游戏、增加游戏探针、改变 `random`、挪动旁听者或伪造持续演奏状态。地上箫诊断保留原 `drop` 行为；是否能够从真实环境命令注册链到达，必须以新系列烟雾确认，不能仅凭合成记录认定已验证。

## 5. 冻结与离线验证

下列是有序条件数组直接 `JSON.stringify` 的 UTF-8 SHA-256（不是台账键排序后的 digest）：

```text
formal 30 / 648
c7d9836b34f9a8c572b195ed22802805c0180d6c3190c627c0303427d31c1c58
smoke 30 / 30
ea368725ff48718946a5b98bbe1bd90e7fde72de770d11bfe6cc5c5d1ffc79a2
source_evidence 32 路径按声明顺序组成的映射
49547fdafe071a37015d7561a2d468779820f909cb5982d9ac822a04aab71555
```

32 份逐文件 SHA 保存在每个条件的 `source_evidence`，生成时与读取字节核对，曲谱入口另与关系目录的 hash 同源核验。本页未复制整份来源清单；以条件模块显式数组为准。

离线命令：

```powershell
node --test tools/tests/martial_data/school_taohua_music.test.mjs
node --check tools/tests/martial_data/school_taohua_music_cases.mjs
node --check tools/tests/martial_data/school_taohua_music.test.mjs
```

自检覆盖全部 30 条合成协议、不同合法随机分支/极值、恰好500内力差、精神/创伤-1钳位、共同恢复/封顶、原昏迷与halt准备、持箫/携带/装备/地上归属、缺字段/假身份/额外状态/资源账、外层与raw混组、未知分母，以及真实临时台账建档/重开和非法ID/入口/重写负例。合成数据不是概率估计，不计任何正式样本。

2026-10-12 离线收尾：13/13 自检通过（516.1037 ms），命令真实退出 0；两份 MJS 语法检查通过。三文件 UTF-8、LF、末尾换行与尾空白检查通过，本页 26 个本地链接存在。没有修改 LPC，因此本轮不涉及 LPC 格式化。尚待另一代理独立复核及以后的共享接线/真实烟雾。
