# Spec Delta

## Purpose

为已经由游戏规则确定的幻境房间提供后台 AI 创作，以自然合理的细节和文学表达改善沉浸感、地点辨识度与探索体验，而非仅改写规则模板。玩家首次探索立即获得可用描述，后续重访看到持久保存的文字。控制成本和失败影响，保持既定地图与玩法事实、不打断终端输出，也不依赖玩家一直在线。

## ADDED Requirements

### Requirement: Shared AI service integration
场景创作 SHALL 接入统一 AI 服务及游戏的公共请求客户端，使用独立业务类型与短确认。请求 MUST 不依赖 NPC 身份、聊天历史或玩家持续在线；消息确认和后台生成 SHALL 有独立期限，任务只有持久受理后才能报告已接受。

#### Scenario: Submit scene facts without NPC fields
- **WHEN** 世界模块提交合法房间事实且没有 NPC 或玩家聊天字段
- **THEN** 请求交给世界处理方，持久受理后返回短确认，不进入 NPC 对话流程

#### Scenario: Acknowledgement completes before generation
- **WHEN** 请求已得到受理确认但模型尚未完成场景创作
- **THEN** 游戏结束本次消息等待并继续使用默认描写，后台任务按自身期限继续执行

### Requirement: Real visits trigger asynchronous creation
系统 SHALL 仅在真实在线玩家进入合法房间且尚无有效描写时申请创作；首次显示 MUST 使用立即可用的默认描写。编译、预载、NPC 移动、地图检查和普通重复查看 MUST 不触发新的付费创作。

#### Scenario: First player visit
- **WHEN** 玩家进入尚未创作的房间
- **THEN** 玩家立即看到规则描写，系统异步申请该房间创作，移动和战斗不等待完成

#### Scenario: Administrative compilation
- **WHEN** 管理员执行 updateall、加载房间模板或生成调试地图
- **THEN** 没有产生新的 AI 创作任务或模型调用

### Requirement: Canonical scene facts constrain prose
AI 描写 SHALL 以已确定的生态、场景共有事实、房间角色和邻域关系为基础，并允许不与这些事实冲突的环境细节、局部地形、感官描写及文学比喻；未在输入中逐项列出 MUST NOT 单独成为拒绝理由。稳定房间名、空间结构和玩法由规则确定；正文 MUST 不执行代码、改变出口或通行性、承诺不存在的可交互对象与奖励，或将临时玩家状态写入公共存档。

#### Scenario: Plausible scenery enriches sparse facts
- **WHEN** 岩坡松岗的正文补充岩缝、盘根、局部陡峭岩面、风声或松脂气息，而规则未逐项列出这些细节
- **THEN** 这些补充可用于正文，只要与已知环境、场景结构和实际通行性一致，不要求为每个修辞细节提供事实字段

#### Scenario: Metaphor is not a gameplay promise
- **WHEN** 松树姿态被比作角力，或文字用“仿佛劲敌窥伺”营造气氛，但没有断言真实敌人、目标或操作存在
- **THEN** 按自然文学表达评估，不仅因出现刀剑或敌人相关词语就拒绝；明确声称有可攻击伏兵、可拾取宝物或可进入暗道仍须有玩法依据

#### Scenario: Added terrain contradicts known movement
- **WHEN** 正文明言一面绝壁封死了规则中可通行的道路，或将已知湿地改写成沙漠
- **THEN** 该内容因实际事实冲突不被接受，而非因使用了未列出的形容词被拒绝

#### Scenario: Two rooms share a landmark
- **WHEN** 旧村井台与村口分别生成描写
- **THEN** 两处使用同一村名和井台事实，提到的方位符合实际坐标，不能各自创造另一个村名或移动井台

#### Scenario: Dynamic portal is present
- **WHEN** 房间有已由游戏定义的离境门和已保存 AI 描写
- **THEN** 系统仍显示门及有效离境命令，AI 描写不覆盖门信息，也不承诺不存在的出口或奖励

### Requirement: Validate before publication
系统 MUST 在保存可见描写前验证结构、长度、世界身份和事实引用；格式错误、超长内容、终端控制字符及不允许的字段 MUST 被拒绝。被拒绝的结果 SHALL 保持默认描述并遵守有限重试策略，不得发布半截或未经验证的文字。

结构校验 SHALL 与文案审读分开：前者检查输出契约，后者按自然性、游戏语境、空间一致性和实际交互承诺评价；结构校验 MUST NOT 被解释为完整语义证明，也不能退化为只允许复述输入的词语白名单。

#### Scenario: Invalid model response
- **WHEN** 模型返回代码块、未知字段、错误房间身份、非法控制字符或引用不在允许集合中的地标
- **THEN** 结果不对玩家可见，并记录可诊断的失败原因

#### Scenario: Cache is corrupt or mismatched
- **WHEN** 已保存内容不可解析，或其世界、事实摘要与当前房间不匹配
- **THEN** 游戏继续显示默认描写，记录问题并请求修复，不把错误内容应用于其他房间

### Requirement: Published descriptions are durable and reusable
系统 SHALL 对世界与房间事实对应的已发布内容长期复用；重复访问、玩家更换、进程重启、提示词或模型更换 MUST 不自动覆盖已发布内容或再次付费生成。AI 停服时，已落盘的有效描写 SHALL 仍可显示。

#### Scenario: Return after service restart
- **WHEN** 房间已有有效落盘描写，随后游戏和 AI 服务均重启
- **THEN** 重访显示原文，且不产生该房间的新模型调用

#### Scenario: Generation finishes after departure
- **WHEN** 玩家离开或断线后后台创作完成
- **THEN** 内容照常保存，没有向该玩家或所在房间插入消息，后续查看或重访能够读取

### Requirement: Durable deduplicated jobs with bounded failure handling
已接受的创作任务 SHALL 持久化并按稳定内容键去重；同一键 MUST 最多存在一个正在执行的任务。服务异常、请求或确认丢失 SHALL 可恢复，失败重试 SHALL 有上限与退避。对模型调用完成但尚未持久化即崩溃的窗口，系统 SHALL 允许有限补偿重试，不宣称外部调用恰好一次。

#### Scenario: Duplicate visits and lost acknowledgement
- **WHEN** 多名玩家请求同一房间，或者请求确认丢失导致重发
- **THEN** 系统返回同一任务状态，不创建并发重复创作

#### Scenario: Restart with unfinished work
- **WHEN** 服务在排队、模型调用或发布文件时重启
- **THEN** 已完成内容恢复发布，未完成任务在租约与重试限制内恢复，已发布内容保持不变

### Requirement: Generation budgets and chat isolation
系统 SHALL 限制队列、并发、每玩家提交速率、每日外部调用次数及存档空间；重试 SHALL 消耗预算。后台模型调用 MUST 不占用 NPC 聊天工作线程，预算耗尽或存储失败 SHALL 仅停止新创作，不阻断默认地图和已保存内容。

#### Scenario: Budget or queue exhausted
- **WHEN** 玩家继续探索但创作队列、每日调用额度或存档容量已满
- **THEN** 新房间正常可玩并显示默认描述，任务不无限堆积；满足重试条件后的后续真实访问可再次申请

#### Scenario: NPC chat arrives during map creation
- **WHEN** 地图创作任务正在请求模型且玩家与周不通聊天
- **THEN** 聊天使用自己的工作容量和原有处理路径，不等待地图任务持有的工作线程或数据库长事务
