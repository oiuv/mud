# Spec Delta

## Purpose

为 MUD 的独立 AI 业务提供共用、目标驱动且受权限和资源限制的执行能力，使明确请求可直接调用，开放目标可由主 Agent 协调，并保持两种入口的业务行为、数据隔离和完成标准一致。

## ADDED Requirements

### Requirement: Independent capabilities with equivalent entry paths

每项 AI 业务 SHALL 声明稳定身份、目标、输入输出、完成条件、技能、允许工具和资源限制。直接路由与主 Agent 委派 MUST 使用同一业务验证、执行和提交契约；直接路由 MUST 不额外调用主 Agent，也不削减业务 Agent 的多步能力。NPC 人设 SHALL 继续作为配置数据，摘要 SHALL 默认仅由所属会话内部调用。

#### Scenario: Direct multi-step investigation

- **WHEN** 已授权的 NPC 直接请求需要多次搜索和读取才能回答
- **THEN** 该 Agent 持续调查，不经过主 Agent，也不因直接调用而被限制为单轮问答

#### Scenario: Internal summary isolation

- **WHEN** 主 Agent 发现可委派能力
- **THEN** 默认不列出内部摘要能力，猜测其身份也不能取得其他玩家的历史或调用权限

### Requirement: Goal-driven investigation and completion

Agent SHALL 根据目标、已确认事实、证据、待解决问题和工具反馈决定后续行动。候选结果 MUST 经过业务完成条件验证；缺口仍可在授权范围和预算内补查时 SHALL 继续。首次检索无结果、一次工具失败或模型自称完成 MUST 不单独构成任务完成依据。任务状态 MUST 不要求或保存模型私有思维链。

#### Scenario: Recoverable search failure

- **WHEN** 首次关键词未命中但还有可行的授权查询和剩余预算
- **THEN** Agent 更换关键词、入口或调查路径，继续收集证据而不是立即拒答

#### Scenario: Candidate fails completion checks

- **WHEN** 候选答案缺少关键条件的证据或引用未读资料
- **THEN** 结果不作为成功提交，Agent 获得具体缺口并在允许范围内继续调查

### Requirement: Bounded main-agent coordination

主 Agent SHALL 能发现授权业务、顺序委派、检查结果并继续决策；首期 MUST 禁止递归委派及祖先调用环，委派深度至多一层。委派 MUST 不绕过业务容量、身份和持久任务入口。短确认 SHALL 仅证明任务受理，不代表后台业务完成；目标不明确时 SHALL 请求澄清。

#### Scenario: Delegated result leaves a gap

- **WHEN** 叶子 Agent 返回部分结果，另一个授权调查可解决目标中的剩余问题
- **THEN** 主 Agent 在共享预算内继续委派或补查，不仅转发第一个回答

#### Scenario: World narration accepted asynchronously

- **WHEN** 授权世界任务通过委派被受理但尚未生成正文
- **THEN** 返回可关联的待完成凭据，不同步抢占生成、不重复发布，也不将原目标标记为正文已完成

### Requirement: Non-escalating authority and isolated context

运行权限 SHALL 来自可信部署和入口绑定，并受当前 Agent、父调用、受众、会话及 NPC 知识范围共同限制。子任务、技能、模型输出和 Hook MUST 不能扩大权限。委派 SHALL 只传递目标所需且已授权的资料；缓存及证据 MUST 按有效权限和会话隔离。

#### Scenario: Delegation requests broader authority

- **WHEN** 主 Agent 尝试委派一个允许更大目录范围的业务
- **THEN** 子任务仍仅能访问父请求允许的交集，不能利用业务定义获取额外资料

#### Scenario: Another player uses the same question

- **WHEN** 两名玩家提出相同问题但拥有不同会话资料或知识范围
- **THEN** 不复用包含越权资料的上下文、证据或结果缓存

### Requirement: Shared budgets deadlines and cancellation

一次目标执行及其子任务 SHALL 共享累计模型请求、工具调用、上下文规模、委派次数及截止期限限制。检索内的外部向量和重排调用 MUST 纳入外部请求预算，失败尝试也计数；委派、摘要或重试 MUST 不重置根预算。取消或到期后 MUST 不发起新操作或提交迟到结果。默认交互预算 SHALL 支持多步调查，但 NPC 总期限 MUST 不超过 80 秒。

#### Scenario: Child and retrieval exhaust the root budget

- **WHEN** 检索及前一个子任务已消耗可用外部调用额度
- **THEN** 下一个子任务不能创建新额度继续调用，结果明确记录预算不足

#### Scenario: Late provider response

- **WHEN** 请求已取消或到期，已经发出的外部调用随后返回
- **THEN** 记录实际用量但不启动下一轮，不更新业务成功状态或玩家关系

### Requirement: Explicit outcomes and trusted business commits

运行结果 SHALL 区分 completed、needs_input、incomplete、failed 和 cancelled，并保留可诊断原因及已完成部分。只有满足完成契约的结果 SHALL 进入成功提交；业务提交 MUST 由可信业务层执行，不能由模型指定任意写入目标。调查中间态、澄清和部分结果 MUST 不冒充成功对话或推进关系。

候选生成和业务运行结束 SHALL 分开：无需持久化的能力在完成验证后结束，需要持久化的能力 MUST 等待可信业务提交结果确定后再宣告终态。运行时 SHALL 提供统一验证、Hook 和结束边界，具体事务与发布实现 SHALL 保留在业务适配层，不反向导入通用执行器。模型自称完成或输出格式正确 MUST 不单独证明业务成功。

#### Scenario: Missing live player information

- **WHEN** 回答需要未提供的实时修为，且没有授权工具可查询
- **THEN** 返回需要补充信息的结果并说明所需信息，不猜测数值或写入成功历史

#### Scenario: World creation is disabled

- **WHEN** Agent 尝试委派世界创作但业务开关关闭
- **THEN** 拒绝创建任务，不能通过直接生成或其他提交路径绕过开关

#### Scenario: Valid candidate is not yet persisted

- **WHEN** 需要保存的候选结果已生成且通过验证，但业务提交尚未完成
- **THEN** 不提前宣告运行成功；提交失败时返回失败，提交成功时只完成一次运行，不额外调用模型重新生成

### Requirement: Replay safety without automatic autonomous recovery

相同有效请求的并发重传 SHALL 共享在途工作；持久成功结果在有效期内重传 MUST 不重复调用模型或提交。不同内容使用同一编号 MUST 被拒绝，业务命名空间 MUST 防止跨业务缓存冲突。普通 Agent 请求中断后 MUST 不自行跨重启续跑；世界持久任务仍按已有业务恢复机制处理，不承诺崩溃窗口内外部调用恰好一次。

#### Scenario: Successful request replay after restart

- **WHEN** 已持久成功的 Agent 请求在有效期内重传
- **THEN** 返回原结果，不重新付费、不重复展示或提交

#### Scenario: Interrupted uncached general request

- **WHEN** 服务重启且上次通用请求没有持久成功结果
- **THEN** 不主动恢复模型调用；调用方重新提交时遵守正常预算和去重规则，诊断说明先前结果不确定

### Requirement: Uniform extension contract

新增 AI 功能 SHALL 交付业务目标与完成标准、输入输出及状态归属、工具授权、中文技能及样例、模型和资源限制、双入口与提交责任、测试和运维说明。新增能力 MUST 复用公共模型、工具、权限及 Hook 契约，不建立旁路；这些规范 SHALL 同样适用于迁移后的既有能力。

#### Scenario: Register a test capability

- **WHEN** 开发者按规范注册一个临时测试业务
- **THEN** 可通过授权入口使用它并获得一致的预算、工具和 Hook 行为，无须复制执行循环或修改已有业务实现
