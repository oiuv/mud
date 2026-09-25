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

运行时 SHALL 在硬预算外检测连续无进展：等价行动反复产生相同事实、失败或完成缺口时，先提供可调整策略的反馈，达到配置阈值仍无进展则返回 incomplete 及未解决事项。新的调用 ID、时间戳或模型自称取得进展 MUST 不单独重置检测。有效新证据、相关资料变化及已验证的缺口减少 SHALL 被识别为进展；首次无命中、正常跨文件调查或合理重读 MUST 不单独触发停止。

#### Scenario: Recoverable search failure

- **WHEN** 首次关键词未命中但还有可行的授权查询和剩余预算
- **THEN** Agent 更换关键词、入口或调查路径，继续收集证据而不是立即拒答

#### Scenario: Candidate fails completion checks

- **WHEN** 候选答案缺少关键条件的证据或引用未读资料
- **THEN** 结果不作为成功提交，Agent 获得具体缺口并在允许范围内继续调查

#### Scenario: Equivalent actions repeatedly make no progress

- **WHEN** 模型收到调整反馈后仍重复等价行动、没有新证据或已解决缺口，并达到无进展阈值
- **THEN** 返回 incomplete 和实际阻碍，不通过更换调用 ID 无限循环，不强制输出成功答案

#### Scenario: Investigation makes observable progress

- **WHEN** Agent 沿相关依赖获取新证据，或因资料变化执行必要重读
- **THEN** 在剩余权限和预算内继续，不因工具名称相同或问题跨文件而误判为重复停滞

### Requirement: Bounded main-agent coordination

主 Agent SHALL 能发现授权业务、顺序委派、检查结果并继续决策；首期 MUST 禁止递归委派及祖先调用环，委派深度至多一层。委派 MUST 不绕过业务容量、身份和持久任务入口。短确认 SHALL 仅证明任务受理，不代表后台业务完成；目标不明确时 SHALL 请求澄清。

主 Agent SHALL 能使用自身已授权能力直接完成简单任务，复杂任务按专业子目标需要委派；MUST 不要求每次主 Agent 请求调用子 Agent，也不因使用工具或多轮处理就强制拆分。直接处理与委派 SHALL 遵守同一权限、完成验证和提交边界。

#### Scenario: Main agent handles a simple request directly

- **WHEN** 请求已进入主 Agent，且其自身已授权能力足以完成该简单目标
- **THEN** 主 Agent 直接处理并验证结果，子 Agent 调用次数为零，不为了架构形式额外委派

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

### Requirement: Isolated professional execution with bounded result handoff

主 Agent SHALL 负责整体目标、任务拆分、协调及目标完成检查；专业子 Agent SHALL 负责执行其专业任务并验证成果。每次委派 SHALL 复用共享 Runner，但拥有独立消息历史和任务状态；输入 SHALL 仅包含该任务必要且已授权的资料，不复制父运行全部历史。专业 Agent SHALL 能使用声明的模型配置、统一 Skill 工具及内部工具循环，不建立独立的 Skill 执行引擎。

子任务 SHALL 返回有界摘要、必要业务结论、成果/证据引用、限制及未完成事项。原始参考资料、技能正文、检索列表、完整工具过程和中间草稿 MUST 不自动回灌父上下文；必要条件、数值、例外和阻碍 MUST 不因压缩被丢弃或改成成功。主 Agent SHALL 能根据交付结果判断覆盖情况，并在原授权内补查或继续委派，不要求默认重做完整调查。隔离 MUST 不重置权限、根预算、截止时间或取消状态，简单直接任务 MUST 不被强制增加委派或压缩结果的模型回合。

#### Scenario: Large professional context stays in the child

- **WHEN** 子 Agent 为完成任务加载大量授权参考资料并经历多轮工具调用
- **THEN** 父 Agent 后续模型请求仅包含约定的有界交付结果，不自动包含子消息历史、技能全文或原始工具输出；子调用仍计入根预算

#### Scenario: Compact handoff preserves decision-critical facts

- **WHEN** 子任务结果包含门槛与消耗的不同数值、适用例外或尚未解决的条件
- **THEN** 交付结果保留这些必要结论、证据引用和阻碍，不仅返回不可核查的成功摘要；父 Agent 不将部分完成视为整体完成

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

### Requirement: Authorized delivery by verified result reference

较大或需原样交付的成果 SHALL 支持由可信运行时保留并生成结果引用，短结果仍可直接返回。主 Agent SHALL 能选择已授权引用，由可信交付层取得原成果，无需模型重新生成正文。结果引用 MUST 不被解释为文件路径、任意 URL 或访问授权；解析 SHALL 核验根请求、会话/受众、有效权限、来源、完整性和业务完成状态，拒绝伪造、跨请求、失效或未完成引用。首期 SHALL 使用请求内有界结果保存和已有业务凭据，不新增通用成果数据库。

引用交付 MUST 遵守输出契约、大小、受众呈现、证据权限、取消及提交边界，不因持有引用绕过验证。需要持久化的成果 MUST 在业务提交确定成功后才可作为已完成成果交付；后台受理凭据 MUST 不冒充已完成正文。引用解析 MUST 不重新生成或重复提交；成功重放缓存 MUST 不依赖已失效的请求内引用。

#### Scenario: Deliver an existing verified work without rewriting

- **WHEN** 专业 Agent 已产生通过验证且完成必要提交的成果，主 Agent 选择其合法引用
- **THEN** 可信交付层按业务视图交付原成果，不为复述正文增加模型调用，仍检查父目标覆盖与最终输出契约

#### Scenario: Result reference belongs to another request

- **WHEN** 模型提供伪造引用、另一根请求的引用或另一会话的成果标识
- **THEN** 拒绝交付，不泄露目标成果，不把引用本身当作授权

#### Scenario: Referenced candidate is not committed

- **WHEN** 所选引用指向仍待持久化的候选或后台任务受理凭据
- **THEN** 不作为已完成业务成果交付，不因引用存在而重复生成或提前宣告成功

#### Scenario: Successful delivery is replayed after restart

- **WHEN** 原请求的内存成果表已不存在，但持久成功响应仍在有效期内
- **THEN** 复用可重放的最终响应或既有业务凭据，不解析悬空内存引用、不重新调用模型

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
