# Spec Delta

## Purpose

为 MUD 的独立 AI 业务提供共用、目标驱动且受权限保护的执行能力，以任务完成而非固定调用额度为目标，通过用量观测和上下文压缩支持持续调查，并保持直接与委派入口的业务行为、数据隔离和完成标准一致。

## ADDED Requirements

### Requirement: Independent capabilities with equivalent entry paths

每项 AI 业务 SHALL 声明稳定身份、目标、输入输出、完成条件、技能、允许工具、绑定模型容量及故障/取消策略。直接路由与主 Agent 委派 MUST 使用同一业务验证、执行和提交契约；直接路由 MUST 不额外调用主 Agent，也不削减业务 Agent 的多步能力。NPC 人设 SHALL 继续作为配置数据，摘要 SHALL 默认仅由所属会话内部调用。

#### Scenario: Direct multi-step investigation

- **WHEN** 已授权的 NPC 直接请求需要多次搜索和读取才能回答
- **THEN** 该 Agent 持续调查，不经过主 Agent，也不因直接调用而被限制为单轮问答

#### Scenario: Internal summary isolation

- **WHEN** 主 Agent 发现可委派能力
- **THEN** 默认不列出内部摘要能力，猜测其身份也不能取得其他玩家的历史或调用权限

### Requirement: Goal-driven investigation and completion

通用 Agent SHALL 充分利用模型能力，默认自主规划、行动、观察并调整；仅业务明确要求的场景 SHALL 指定工作流。提示词 SHALL 围绕目标、可用能力和必要边界，MUST 不把固定调查步骤、必填计划或某道评测题的专用规则作为通用要求。验收 SHALL 检查结论和必要证据，不要求复现固定工具顺序或调用次数。

Agent SHALL 根据目标、已确认事实、证据、待解决问题和工具反馈决定后续行动。候选结果 MUST 经过业务完成条件验证；缺口仍有授权且可行的补查路径时 SHALL 继续。首次检索无结果、一次可恢复工具失败或模型自称完成 MUST 不单独构成任务完成依据。可信任务状态 MUST 不依赖模型复述思维链，也不从提供方返回的思考内容重建授权、证据或完成状态；思考字段的模型上下文保留与受限诊断 SHALL 遵守各自契约。

运行时 SHALL 检测连续无进展并提供调整策略的反馈，MUST 不仅因等价行动达到固定次数阈值就终止任务。新的调用 ID、时间戳或模型自称取得进展 MUST 不单独重置检测。有效新证据、相关资料变化及已验证的缺口减少 SHALL 被识别为进展；首次无命中、正常跨文件调查或合理重读 MUST 不单独触发停止。完成、需要澄清、实际不可解决的资料/权限阻碍、不可恢复故障或取消 SHALL 决定对应终态，不能以计数代替这些事实。

#### Scenario: Recoverable search failure

- **WHEN** 首次关键词未命中但还有可行的授权查询且请求仍有效
- **THEN** Agent 更换关键词、入口或调查路径，继续收集证据而不是立即拒答

#### Scenario: Candidate fails completion checks

- **WHEN** 候选答案缺少关键条件的证据或引用未读资料
- **THEN** 结果不作为成功提交，Agent 获得具体缺口并在允许范围内继续调查

#### Scenario: Equivalent actions repeatedly make no progress

- **WHEN** 模型重复等价行动、没有新证据或已解决缺口
- **THEN** 指出重复事实及缺口并支持调整方法，不仅因固定重复次数终止，不自动重提有副作用操作，不强制输出成功答案

#### Scenario: Investigation makes observable progress

- **WHEN** Agent 沿相关依赖获取新证据，或因资料变化执行必要重读
- **THEN** 在授权内继续，不因工具名称相同或问题跨文件而误判为重复停滞

### Requirement: Bounded main-agent coordination

主 Agent SHALL 能发现授权业务、顺序委派、检查结果并继续决策；首期 MUST 禁止递归委派及祖先调用环，委派深度至多一层。委派 MUST 不绕过业务容量、身份和持久任务入口。短确认 SHALL 仅证明任务受理，不代表后台业务完成；目标不明确时 SHALL 请求澄清。

主 Agent SHALL 能使用自身已授权能力直接完成简单任务，复杂任务按专业子目标需要委派；MUST 不要求每次主 Agent 请求调用子 Agent，也不因使用工具或多轮处理就强制拆分。直接处理与委派 SHALL 遵守同一权限、完成验证和提交边界。

#### Scenario: Main agent handles a simple request directly

- **WHEN** 请求已进入主 Agent，且其自身已授权能力足以完成该简单目标
- **THEN** 主 Agent 直接处理并验证结果，子 Agent 调用次数为零，不为了架构形式额外委派

#### Scenario: Delegated result leaves a gap

- **WHEN** 叶子 Agent 返回部分结果，另一个授权调查可解决目标中的剩余问题
- **THEN** 主 Agent 在授权内继续委派或补查，用量汇总到同一根请求，不仅转发第一个回答

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

子任务 SHALL 返回有界摘要、必要业务结论、成果/证据引用、限制及未完成事项。原始参考资料、技能正文、检索列表、完整工具过程和中间草稿 MUST 不自动回灌父上下文；必要条件、数值、例外和阻碍 MUST 不因压缩被丢弃或改成成功。主 Agent SHALL 能根据交付结果判断覆盖情况，并在原授权内补查或继续委派，不要求默认重做完整调查。隔离 MUST 不重置权限、根用量账本或取消状态；父子 SHALL 按各自绑定的模型窗口管理上下文，简单直接任务 MUST 不被强制增加委派或压缩交付结果的模型回合。

#### Scenario: Large professional context stays in the child

- **WHEN** 子 Agent 为完成任务加载大量授权参考资料并经历多轮工具调用
- **THEN** 父 Agent 后续模型请求仅包含约定的有界交付结果，不自动包含子消息历史、技能全文或原始工具输出；子调用及其 compact 用量仍计入根账本

#### Scenario: Compact handoff preserves decision-critical facts

- **WHEN** 子任务结果包含门槛与消耗的不同数值、适用例外或尚未解决的条件
- **THEN** 交付结果保留这些必要结论、证据引用和阻碍，不仅返回不可核查的成功摘要；父 Agent 不将部分完成视为整体完成

### Requirement: Goal execution with shared usage and cancellation

通用 Agent MUST 不以累计模型/工具/委派次数、累计 token/费用/字节或任务总时长硬上限终止正常调查，也不因“最后一次调用”禁用工具并强制收尾。一次目标执行及其子任务 SHALL 共享准确的用量观测和取消状态；模型、摘要、compact、检索内向量/重排及失败调用 SHALL 计入根账本并可分别诊断，未知用量 MUST 不冒充零消耗。该策略 MUST 不取消权限、既有业务日额度/重试、单次 I/O 故障超时、并发容量或报文/工具结果契约。根请求取消或调用方失效后 MUST 不发起新操作或提交迟到结果，MUST 不再沿用 NPC 80 秒任务总期限。

#### Scenario: Investigation exceeds former call and duration caps

- **WHEN** 有效调查已超过旧模型/工具调用次数或 80 秒总时长，但仍有可行调查路径
- **THEN** 继续授权操作并累计实际用量，不因旧额度终止、关掉工具或伪造完成

#### Scenario: Late provider response

- **WHEN** 请求已取消或调用方已失效，已经发出的外部调用随后返回
- **THEN** 记录实际用量但不启动下一轮，不更新业务成功状态或玩家关系

### Requirement: Provider reasoning continuity within an agent

模型适配 SHALL 将提供方实际返回的可选思考字段与业务正文、工具调用分开。当前 Agent 后续调用 SHALL 按提供方/模型协议保留所需字段，工具续行和候选校验失败后的调查 MUST 不因只复制正文而丢失该字段；没有返回字段时 SHALL 兼容原流程，不补造思考或新增模型调用。关闭诊断记录 MUST 不影响协议保留，开启记录 MUST 不改变模型消息或工具执行。

思考内容 MUST 不进入玩家响应、业务成功历史、业务响应缓存或父 Agent 的业务交付，不作为源码证据、权限或完成依据。实际回传字段 SHALL 纳入完整请求计量；compact 保留近期完整助手/工具组及协议所需字段，较早内容随所属历史压缩，不要求摘要逐字复述，也不从诊断文件恢复旧历史。用量 SHALL 按提供方口径计入根账本，不遗漏思考消耗或重复累加已计入总量的细项。

#### Scenario: Tool continuation preserves provider fields

- **WHEN** 支持历史思考字段的模型返回思考与工具调用，工具执行后继续同一 Agent
- **THEN** 下一请求按协议保留对应助手字段及工具结果；玩家、父 Agent 和业务成功记录只得到约定业务内容

#### Scenario: Provider returns no reasoning field

- **WHEN** 模型响应没有思考字段，或部署未启用思考模式
- **THEN** 原有文本和工具流程正常执行，不伪造字段、不增加模型调用，不因诊断设置隐式切换模型或模式

#### Scenario: Reasoning contributes to context growth

- **WHEN** 实际回传的思考字段使完整请求达到 compact 条件
- **THEN** 按绑定模型窗口压缩后续行，近期工具组和协议字段完整、可信证据与状态不变，关闭诊断也不漏算该上下文或用量

### Requirement: Model-specific context configuration and compaction

模型上下文窗口 SHALL 通过对应模型配置的环境变量声明，配置默认值 SHALL 为 1000000 token（1M）；未设置使用默认值，显式非法值 MUST 报错而非静默回退。不同模型 SHALL 使用各自绑定的容量，部署切换模型时 SHALL 同步核对窗口、输出长度及计量适配。1M 默认值 MUST 不被描述为对任意模型真实容量的自动识别，执行器 MUST 不硬编码该容量。

完整模型请求输入达到其窗口 80% 时 SHALL compact 后继续同一任务，且输入与预留输出及计量安全余量 SHALL 始终适配窗口，必要时提前压缩。计量 SHALL 包含提示、历史、Skill、工具定义/结果和 Hook 追加内容，MUST 不把字符数或 UTF-8 字节数直接冒充 token 数。使用保守估算时 SHALL 明确其口径并验证安全性。80% SHALL 仅作为维护触发点；压缩已有效缩短且完整请求能适配窗口时，MUST 不仅因仍高于该比例而判失败或终止任务。

compact SHALL 保留目标、系统约束、关键事实与条件/数值、证据引用、未决事项、必要近期交互及完整工具调用/结果组。权限、证据记录、用量、取消、去重及提交状态 MUST 保持可信，不由模型摘要重建或覆盖。压缩 SHALL 由运行时直接调度，指导 SHALL 从独立内部提示词文件加载并固定内容版本，不经过 Tool/Skill，不要求业务 Agent 具有 skill 权限，也不新增模型可调用工具或第二套工具循环。压缩调用 SHALL 经过同一模型、外发授权及 Hook 边界并独立记账。未到阈值的普通短任务 MUST 不增加压缩调用。

模型 SHALL 生成文本工作摘要，不要求固定标题、严格 JSON 或完整复制证据 ID 数组。运行时 SHALL 从可信记录直接保留被压缩材料的证据关联和必要任务状态，不从摘要提取或重建授权、证据和完成状态；MUST 不因文本摘要没有复述这些元数据而触发格式修复调用。最终业务答案的引用及完成条件 SHALL 仍按原始证据与业务契约核验，格式或引用 ID 齐全 MUST 不被视为语义正确的证明。

压缩失败、取消或校验不通过时 MUST 保留原上下文；压缩输入本身 SHALL 满足窗口约束。取得非空、未截断且无工具调用的文本后，SHALL 检查运行时证据关联和受保护状态未变、消息/工具组完整，以及重建后的完整请求容量合规且实际缩短，再替换旧消息。确实无法容纳受保护内容时 SHALL 明确报告上下文阻碍，MUST 不静默截断、丢失证据或反复执行同一无效压缩。

#### Scenario: Context reaches the compaction threshold

- **WHEN** 包含工具定义及 Hook 内容的完整输入达到绑定模型窗口的 80%
- **THEN** 压缩较早过程后继续原目标和运行身份，保留关键事实/证据与近期工具组，累计调用次数不重置也不构成停止条件

#### Scenario: Output reservation requires earlier compaction

- **WHEN** 输入尚未达到 80%，但加预留输出与计量余量后将超出模型窗口
- **THEN** 提前处理上下文，不发送超出窗口的请求，不把输出最大长度当作额外输入空间

#### Scenario: Different models use different windows

- **WHEN** 主 Agent 与专业 Agent 使用不同模型及各自环境变量配置的窗口
- **THEN** 各自按对应窗口触发压缩，修改部署配置即可调整容量，无须改执行器；子压缩过程不自动回灌父上下文

#### Scenario: Default and invalid capacity values

- **WHEN** 容量变量未设置，或被显式设置为空、非整数、非正数或不相容的输入/输出容量
- **THEN** 未设置时采用 1000000 token 默认值；显式非法配置明确失败，不静默假定模型能容纳请求

#### Scenario: Text summary does not repeat evidence metadata

- **WHEN** 模型返回有效工作摘要，但没有输出 JSON 或逐项复制证据 ID
- **THEN** 由运行时直接保留原证据关联和必要任务状态，不额外调用模型修复格式或复述元数据；通过容量及状态检查后可继续原任务，最终答案仍须核验原证据

#### Scenario: Compaction fails or trusted evidence changes

- **WHEN** 摘要为空或被截断、请求最终失败、运行被取消、运行时证据被改动，或候选上下文未缩短
- **THEN** 不替换原上下文，不改可信证据/用量/取消状态，按实际故障或可调整的压缩范围处理，不以丢失资料换取继续执行，也不从摘要创建已读证据或成功状态

#### Scenario: Useful compaction remains above the trigger

- **WHEN** 候选上下文已有效缩短、证据与受保护状态不变，完整请求能容纳预留输出及安全余量，但输入仍超过窗口的 80%
- **THEN** 不仅因触发比例判失败，允许继续原任务；后续调用仍按完整请求计量，不把窗口容量检查改成固定任务预算

#### Scenario: Normal investigation continues across multiple compactions

- **WHEN** 正常多步调查先后触发多次 compact，随后获得完成问题所需的资料
- **THEN** 能继续原目标并形成正确答案，关键条件、数值、待查项和证据关联持续可用，不重复已提交业务，也不将压缩成功本身当作任务完成

#### Scenario: Short task needs no compaction

- **WHEN** 简单问答或单次世界/摘要生成的请求始终低于窗口阈值且能预留输出
- **THEN** 不新增压缩或主 Agent 调用，沿用直接处理与原业务完成契约

#### Scenario: Compaction is independent of skill permission

- **WHEN** 没有 skill 权限的 Agent 达到压缩阈值
- **THEN** 运行时仍可直接加载内部压缩提示词，经同一模型与 Hook 边界生成摘要，不给该 Agent 增加技能或工具权限

#### Scenario: Provider usage calibrates an unchanged prefix

- **WHEN** 同一模型返回有效输入用量，下一请求保留相同模型绑定、工具定义和消息前缀
- **THEN** 可用实际输入用量加新增内容的保守估算计量；前缀/模型改变时重新估算，不用累计账本或摘要请求用量代替重建后的上下文大小

### Requirement: Explicit outcomes and trusted business commits

输出默认 SHALL 使用自然语言；仅业务接口明确要求 JSON 对象时 SHALL 通过统一模型适配使用 `json_object`，并复用已有字段、类型、证据和业务校验，不增加 JSON Schema 适配或额外格式修复模型。工具与思考字段续行 SHALL 保持；普通推理、规划、对话、纯文本摘要和 compact MUST 不因使用 Agent 而被强制转换成 JSON。

运行结果 SHALL 区分 completed、needs_input、incomplete、failed 和 cancelled，并保留可诊断原因及已完成部分。只有满足完成契约的结果 SHALL 进入成功提交；业务提交 MUST 由可信业务层执行，不能由模型指定任意写入目标。调查中间态、澄清和部分结果 MUST 不冒充成功对话或推进关系。

候选生成和业务运行结束 SHALL 分开：无需持久化的能力在完成验证后结束，需要持久化的能力 MUST 等待可信业务提交结果确定后再宣告终态。运行时 SHALL 提供统一验证、Hook 和结束边界，具体事务与发布实现 SHALL 保留在业务适配层，不反向导入通用执行器。模型自称完成或输出格式正确 MUST 不单独证明业务成功。

#### Scenario: Missing live player information

- **WHEN** 回答需要未提供的实时修为，且没有授权工具可查询
- **THEN** 返回需要补充信息的结果并说明所需信息，不猜测数值或写入成功历史

#### Scenario: Native JSON generation completes a tool investigation

- **WHEN** JSON 业务经工具调查后返回合法 JSON
- **THEN** 各轮通过同一适配发送 `json_object`，保留工具及思考字段续行；结果仍须通过原本地校验，不因格式正确判定答案正确，也不增加专门收尾调用

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
- **THEN** 不主动恢复模型调用；调用方重新提交时遵守正常授权、存活与去重规则，诊断说明先前结果不确定

### Requirement: Uniform extension contract

新增 AI 功能 SHALL 交付业务目标与完成标准、输入输出及状态归属、工具授权、中文技能及样例、模型容量配置与上下文/用量/取消策略、双入口与提交责任、测试和运维说明。新增能力 MUST 复用公共模型、工具、权限及 Hook 契约，不建立旁路；这些规范 SHALL 同样适用于迁移后的既有能力。

#### Scenario: Register a test capability

- **WHEN** 开发者按规范注册一个临时测试业务
- **THEN** 可通过授权入口使用它并获得一致的上下文、用量、取消、工具和 Hook 行为，无须复制执行循环或修改已有业务实现
