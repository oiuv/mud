# 古墓针具与银索领取：有限采集预检

日期：2026-10-12。状态：**已完成27条件54正式、27独立成功烟雾，原件及严格报告独立复核通过**，见[结果](2026-10-12-school-gumu-item-acquisition-results.md)。首轮房间负重读取契约失败仍独立保留；下文保留准备与修订依据，不将旧失败系列追认为成功。

本页落实[获取入口预检](2026-10-12-gumu-acquisition-preflight.md)中的针具与唯一银索，不含拜师、针毒战斗、自然补货、物品存档或游戏修复。[条件与校验](../../tools/tests/martial_data/gumu_item_acquisition_cases.mjs)和[离线自检](../../tools/tests/martial_data/gumu_item_acquisition.test.mjs)已接入既有教学采集链，原27条条件、游戏文件和历史原始记录未改；成功系列另建为 `gitem-s2` 与 `gitem-f1`，原 `gitem-s1` 仍为失败／0导入。

## 1. 固定规模与原行为

| 子组 | 条件 | 正式计划 | 烟雾计划 | 最小代表 |
| --- | ---: | ---: | ---: | --- |
| 小龙女玉蜂针 | 8 | 16 | 8 | 99/100 级、外派、空库存、1 份连续 2 问、3 份连续 4 问、原 reset、容量 25000/24999、落地与已有针堆合并 |
| 李莫愁冰魄银针 | 5 | 10 | 5 | 正确技能 99/100/400 级、错误师承、原 reset 后仍按原错键拒绝 |
| 唯一银索金铃 | 14 | 28 | 14 | 未学/149/150 级、外派/非直传、首次领取再问、本人/同门/外人/容器/地面/另一原教师占有、容量 1300/1299 |
| 合计 | **27** | **54** | **27** | 每套矩阵 32 次 ask；正式计划 64 次 ask，烟雾计划 32 次 ask |

每条件正式重复 2 次、烟雾 1 次，仅核确定性资格、归属和账目，不估计 `ask` 精神费用或 `reset` 的完整随机分布。静态预期为 7 个有授物行为的条件、20 个拒绝或已持有条件；这不是实测统计。授物但容量不足落地仍单列，不记为玩家取得。

- [小龙女 ask_zhen](../../kungfu/class/gumu/longnv.c#L127)先核古墓派、基本玉蜂针等级 ≥100，再核库存。原构造设置 `yfzhen_count=3`；本组先记录实际构造后库存，再显式设置已冻结的 0/1/3 边界。直接 [reset](../../kungfu/class/gumu/longnv.c#L231)条件仅原样调用一次，观察 4 或 5，调用前后库存、所属对象和函数路径均留证；不称为自然定时补货。
- [李莫愁 ask_zhen](../../kungfu/class/gumu/li.c#L249)先核 `family/master_name=李莫愁`，随后错误查询 `bingpo-zhen`。本组只给予实际存在的 `bingpo-shenzhen`，不注入错误技能键来强行成功。后续库存扣减／发针不可由这些合法输入到达，标为未采，不伪造“全部针具分支通过”。
- [玉蜂针](../../d/gumu/obj/yufeng-zhen.c#L19)及[冰魄银针](../../d/gumu/obj/bingpo-zhen.c#L19)每次构造为 **50 根**，每根重 500，整份重 25000；库存扣减单位是 1 份。保留真实毒源、毒型、余量与原物品路径，不把“一根”的提示当作数量。李的合法拒绝条件不生成冰魄银针。
- [combined.move](../../inherit/item/combined.c#L42)按相同 `base_name` 合并：新克隆保留，旧堆被销毁。连续三份应形成 50→100→150 根；落地与地上原有 50 根合并应为 100 根，正式增加量仍是 50。
- [MASTER_D give_item](../../adm/daemons/masterd.c#L319)用于银索：同门、直传、银索金铃 ≥150；没有额外贡献／正邪门槛。沿完整环境链找到首个人物或最外层物件：自己已持有、同门占有、外人占有、地面／地面容器分别保留原分支。由于开头已要求同派，不人为构造本入口不可达的“你派但非我派”分支。
- [原银索](../../clone/lonely/yinsuo.c#L6)是重 1300、伤害 150 的非克隆单例。首次空闲由[原小龙女 create](../../kungfu/class/gumu/longnv.c#L98)自行拿取并 wield；已有归属时原构造使用[普通长鞭](../../clone/weapon/changbian.c#L4)回退，伤害 25。银索不能用测试鞭替代，也不能克隆。
- [原 move](../../feature/move.c#L56)先 [unequip](../../feature/equip.c#L135)，再做容量检查；`move(student, 1)` 超重会放到学生所在房间。银索落地时教师武器槽及 150 点持器加成已撤除，玩家不会自动 wield。`add_encumbrance` 向祖先传播，只对实际继承 `F_MOVE` 的人物／容器核对整数负重账；最外层房间没有这份计数接口，不能将实际 `null`／0 伪造为零重量或传播成功。
- [原 ask](../../cmds/std/ask.c#L62)在这些高精神、非战斗输入下每次消耗 10–19 精神；业务拒绝、已持有和库存用尽也扣费。命令返回 1 不证明获得物品。重复 ask 使用同一学生、同一教师和剩余资源，不回填。

## 2. 初态与证据边界

物品初态是显式实验输入，不是正常养成结果。银索“冷空闲”在准备阶段加载原单例并观察其无环境，随后由原 NPC 构造接手；只读观察器不得为了查询而加载它。本人／同门／外人／地面及容器占有分别在构造教师前一次性安排，正式 ask 之间不移动、清理或补发。

容器复用 `/inherit/item/item` 的隔离克隆，准备阶段一次性命名、设重、设容量及放置，不新增游戏物品或通用执行框架。同门／外人优先复用现有第二观察角色；其实际人物标记、门派、对象路径和归属链必须记录。容器是非人物，归属判定不能停在容器本身。

“另一原教师持有”保留两个不同的小龙女克隆：第一位从空闲取得原银索，第二位构造后持普通长鞭。两位均复用真实学生 `test_interface` 准备，分别记录入口／返回身份、学生完整前后快照、原心跳 1→0、蓝图心跳 0 与空回调列表；构造内部初始化主体仍为 `not_observed`。正式观察前不清理第一位，也不夺回银索。

本组保留真实 `null` 与 0：未设置旗标、未装备、未忙乱可接受显式假值，但缺键、字符串、数组等不能当作零。库存、数量、物品重量、容量、人物／容器负重和资源计数必须是实际整数；毒源等 mapping 缺失不可用空映射兜底。房间缺少负重接口的显式假值只表示不适用，不是 0 重量。未观测的自然刷新在效果统计中为 `not_observed`，不是 0 次。

## 3. 共享接线与证据边界

已在既有教学采集链内增加受本组限定的分支，不添加执行器或游戏探针；运行时仍须逐项核验以下契约：

| 复用入口 | 必须补的有限内容 |
| --- | --- |
| `teachingConditions` / 原计划台账 | 追加 `teaching-gumu-items-` 条件与 3 个原 NPC 函数入口；共享校验、冻结文件清单和报告注册限定 `gumu-item-acquisition`。原 27 条参数不改 |
| 原教师准备 | 复用现有确切引用、普通 USER 命令上下文、心跳与回调审计。仅本组一次性设置库存边界及相对空余容量；直接 reset 保留函数归属和前后数值。第二教师复用同一准备入口且保存两份原证据，不能提前调用清理 |
| `teaching_observer` | 仍执行原 `ask`，保留既有 `before/after` 教学状态及消息；每步另读 `item_before/item_after` 和旧引用 `destroyed_items`。不以 `teaching_item` 的单封书信观察替代针堆／银索 |
| 物品点快照 | `stock`；有限 `carriers`（学生、教师、房间及该条件需要的容器／持有人），每个记录对象、程序、环境、人物／门派、容量／负重、完整直接 inventory、主副手和 apply；`items` 记录原对象、程序、克隆标记、直接环境、完整 owner_chain、数量／重量、类别／旗标／耐久、装备和毒源 |
| 准备与窗口 | `item_preparation` 只记本组库存来源、原 reset、单例构造前后归属和必要的第一教师准备；其他教师证据继续用已有 `teacher_preparation`。准备安排与正式窗口分开，观察中不得改资格、物品或资源 |
| 校验与报告 | 调 `validateGumuItemAcquisitionRecord(raw, condition)` 和 `gumuItemAcquisitionEffects(rows, condition)`；统计使用冻结 condition，不读已删除的 `raw.parameters`。分开受理、授物、库存份数、根数、玩家取得、落地、合并、已持有、拒绝和精神费用 |
| 清理 | 最后一步及异常后才清理本批确切物品／教师／容器引用；旧合并堆先 `objectp` 检查。单例不在步骤间销毁重建，第二原教师即使未成功入房也须回收；不按名称删除无关对象 |

公共教学状态断言对旧组继续要求原教师不变，仅本组通过独立点快照核验库存扣减及卸下银索；其余教师身份／技能、玩家真实 USER／资格／资源和非战斗约束不变。同名双教师的每次正式命令要求原 `present()` 精确返回本步原教师引用。最后一步及异常清理使用本批确切引用，不在步骤间回收银索或第一位教师；未知回调或必需字段缺失仍失败。

不适用／无对象的环境、库存键、原 reset、单例构造及前教师证据，只有键存在时可接受 `null` 或整数 0；库存份数、数量、负重、容量和精神费用仍要求实际整数。依据是 [JSON 编码](../../mudcore/system/kernel/simul_efun/json.c#L338)区分 `undefined` 与整数，以及[解码](../../mudcore/system/kernel/simul_efun/json.c#L274)将 `null` 还原为 LPC 0。读取器不改写原始值，缺键、非零值或错误类型不能借此过关。

新系列的显式冻结清单包括这两份 MJS、六份共享接线文件以及实际使用的 `teaching_report.mjs`、`statistics.mjs`；不会向历史系列补写工具清单或重新解释旧结果。

## 4. 离线验证与指纹

独立准备阶段执行 `node --test tools/tests/martial_data/gumu_item_acquisition.test.mjs`：15/15，退出 0。包含全部 27 条合成资料、10/19 精神费用、4/5 reset、两类真实 `createSeries/openSeries` 计划建档、非法 ID／缺入口、误判受理、缺字段／错误类型、换物品、漏销毁、错数量／毒源、错归属链、额外装备／资源变化和第二教师准备反例。临时台账明确 `synthetic: true`、`driver_started: false`，测试结束仅清理本测试新建且验证过路径的目录。

共享接入后，两组自检一并执行：本组 19 项、拜师组 18 项，合计 **37/37、退出 0**，包括全部 84 条完整共享合成记录、冻结条件报告、全局计划校验及真实 `createSeries/openSeries` 临时建档。本组新增同名教师错属、准备／清理缺失、资源错账及非适用字段的显式 `null`／0 正例与缺键／类型反例；原始记录无 `parameters` 时仍从冻结条件统计。两个修改的 LPC 夹具已分别格式化并通过 `--check`。这些均为离线验收，不证明真实对象构造或领取已经成功。

首轮真实烟雾 `gitem-s1/attempt-REztsf` 在第 1 条校验失败后由采集器发送 `SIGTERM`，导入 0 条；不是驱动自然退出 1。原记录显示学生负重 0→25000、容量 25000，教师 3300→3300，房间负重全程为 `null`。原校验器把全部载体都当作 `F_MOVE` 对象，错误要求房间负重为整数；合成资料也重复了该假设。实际继承链是 `runner → ROOM → CORE_ROOM`，[CORE_ROOM](../../mudcore/inherit/room.c#L26)仅继承清理、数据和名称接口，[宿主房间](../../inherit/room/room.c#L22)只有容量 `100000000000`，没有负重计数接口。

修订仅限定确切 `/tests/runner` 房间的显式 `encumbrance=null/0` 及原固定容量，并不对该不适用字段计算传播增量；其余人物／容器和有效祖先继续按原移动／合并严格对账。新增全部 27 条的两种显式形状正例，以及缺键、错误类型、伪造房间累计重量、错误容量／身份和人物／容器负重错差反例。游戏、LPC 观察器、条件及失败原件不改，后续须建立 `gitem-s2` 新系列。失败事件 SHA-256 为 `37611e32cfa1d6927cb0f3d650374bc66a1937eb22e01030614f370c12341b2f`，不得将用新校验器重验视为旧系列已通过。

局部修订后本组定向自检 **20/20、退出 0（22.645 秒）**，其中新增 54 个显式房间形状正例及 41 个精确反例；两份 MJS 语法检查通过。失败原事件在不修改任何字节的情况下通过新本组／共享校验器，第一问实际授予 50 根且扣 16 精神，第二问库存不足且扣 10 精神。旧结果仍为 0 导入／1 校验失败，未重写旧台账或报告。原正式／烟雾矩阵及旧 11940 条完整有序 JSON 摘要保持。

首轮曾发现入口定位正则遗漏 `string ask_zhen()`，在新模块内补全 `string` 返回类型后复验；未放宽公共入口规范。合成资料只验证读取器，不能替代真实烟雾、正式记录、物品创建或原 NPC 验收。未采李莫愁错键之后的发针路径、自然定时补货、战斗毒性、存档恢复与拜师。

- 正式条件完整 `sha256(JSON.stringify(conditions))`：`acfaeffca2c61b7313828fe8172cf34c4782ac59251252429e03299dcd40b2da`。
- 烟雾同口径：`f63270f7d0bf69c90bbb0d90e5a26e7a83c139385362689424aabed2a27be882`。
- 27 份源文件按路径排序的 `[path, sha256]` 数组同口径摘要：`398f2fb81e5528dd409d54f1dda312188f8d9f51625d9d0866cfac7bce974bff`。每个条件保留完整 `qualification_evidence`，不是只记总摘要。

### 源文件逐份 SHA-256

| 文件 | SHA-256 |
| --- | --- |
| `adm/daemons/itemd.c` | `0e25cc75d98d5a443f198f258af9a560d4a8abe87c709061ef7a589bbb325864` |
| `adm/daemons/masterd.c` | `32b6b5667152b09a902ce4ed7798c0538810a2f9030c1854b508717ad5f5ae95` |
| `adm/single/simul_efun/message.c` | `3ea8d542bd6a764764f11e28c393883b1e97ecd7758b11b9ddcaf477c1133036` |
| `clone/lonely/yinsuo.c` | `56de5569798a90361b575aa33e20f42c45d34ae9dc73520394baee734b9f7a23` |
| `clone/weapon/changbian.c` | `17dc6becca008527a053209645b23c9900d2ab24af3a912d4b5e113613070dea` |
| `cmds/std/ask.c` | `568ca1c612f6efda4af6ee54e2712a56ff7ba66aa44c42024978a06b5e5836c2` |
| `d/gumu/obj/bingpo-zhen.c` | `767c7755714be9825abbe01f0b3c6dca0b7b9a2bfd2894eb0db17618d7c6482e` |
| `d/gumu/obj/yufeng-zhen.c` | `454fc142539d5cc0718d25203ee917104f961e205087d173af216899ca78e537` |
| `feature/attribute.c` | `1374357d87d48d6373d6f88cb84f0a3c5e4ebcf3b78a9c57d63148d6944f3924` |
| `feature/dbase.c` | `92199b08fca9830e3d734c5777ec1991fc8ea1085861d0f4646af4b3bd281faf` |
| `feature/equip.c` | `11f3cec8438a9fdd514cfeb9f8f4287ec1927e3235f4b10106a089acaace4f27` |
| `feature/move.c` | `94f9652a26101c1cf6dd84ba62de2153732e706f1435582669b94506ca150ac3` |
| `feature/skill.c` | `99e9deecee6444d364b4643f67f5a1db0b20dca9fb78b000a083deb6caf534a8` |
| `inherit/char/char.c` | `3936e5d65d00059fc0db268d6a4e74c6863ebc542152616d8a9ac34b46c224d2` |
| `inherit/char/npc.c` | `a76a597c0b4068032b9be1716cb24b05035e25a379765a3eaba9c193d5e61384` |
| `inherit/item/combined.c` | `428de755aa249d20823ee6db29a4f5b665b344f5d53370a34aafa7e2bca05f8a` |
| `inherit/item/item.c` | `793b35504ffa07810f033d44e4b471ecf194c9a55228caf747c8ef53fb0b23ed` |
| `inherit/misc/equip.c` | `2c27d3bc81c41204be8f4771e59561319f3f3c36aa00118465cb6ccdd3092e2b` |
| `inherit/weapon/throwing.c` | `3e24ca5fabaa6dfc81a401699e33d41546ed273441e4aee38a4391f61848bfa6` |
| `inherit/weapon/whip.c` | `e7edb20f99f0a4bd9751a2d281a756a8b1202c5c851e61ed3458f120608bc991` |
| `kungfu/class/gumu/gumu.h` | `4958e651daf36ad90b2e08d8c9d9eae84ffd1922a4a635536180f23bc09358c8` |
| `kungfu/class/gumu/li.c` | `b84e1b228ab22876aa9cd5efdda4b23b6139b6aac3691180a8adf86b25d9343c` |
| `kungfu/class/gumu/longnv.c` | `11bafbfafd407470ce22f24bcc8daed605a7910a6a46facb1b5e4920b2dc32d9` |
| `kungfu/skill/bingpo-shenzhen.c` | `2c390d330ddad975f21adcafa6af505066e31b160dd1b0b8036deacf60414d74` |
| `kungfu/skill/yinsuo-jinling.c` | `840859b638ad84f511cd841a69f14816ef7c05c31ecf424a2cd4ac6de894ff3d` |
| `kungfu/skill/yufeng-zhen.c` | `60dd2d3353684752dfa3104556cfc0af3f3f0c41247d57f6e98c3006a3524f3c` |
| `mudcore/inherit/dbase.c` | `097f1341d9a2be2d47798bef5400f4a7fdcbf413fe06b724581e76a512cbe8b3` |
