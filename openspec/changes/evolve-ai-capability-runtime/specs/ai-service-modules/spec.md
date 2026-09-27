# Spec Delta

## MODIFIED Requirements

### Requirement: Preserve NPC knowledge and persistence

NPC 对话 SHALL 保留人设、BM25 与向量混合检索、重排降级、摘要、记忆和关系规则。成功聊天的历史、关系更新和去重结果 MUST 保持原子提交；失败或离线演示 MUST 不写入真实对话或推进关系。NPC 问答与摘要 SHALL 使用独立 Agent 和外置技能；单仓库源码证据 SHALL 可补充或纠正文档，源码能力显式关闭时已有公开知识能力 MUST 保持。未完成调查和澄清 MUST 不作为成功聊天推进关系，摘要 MUST 仅处理所属会话材料并共享根取消状态与用量观测。有效长任务 MUST 不沿用 NPC 80 秒总期限，玩家离线或取消后的迟到结果 MUST 不推进关系。

#### Scenario: Duplicate after service restart

- **WHEN** 已成功提交的请求在原去重有效期内因丢包或服务重启再次发送
- **THEN** 返回原结果，不再次调用模型、不重复保存对话或增加关系

#### Scenario: Failed or simulated completion

- **WHEN** 模型失败、响应超时，或缺少密钥而使用已有离线演示
- **THEN** 保持原有失败或演示体验，真实对话和关系数据不被污染

#### Scenario: Retrieval service unavailable

- **WHEN** 向量或重排服务不可用，但已有本地知识库
- **THEN** 按原有回退路径完成检索，不因模块移动丢失 BM25 能力

#### Scenario: Source access disabled

- **WHEN** 部署显式关闭源码能力，NPC 使用已有公开文档
- **THEN** 仍能按原有知识和人设回答，不重新打开源码访问

#### Scenario: Incomplete investigation

- **WHEN** 源码调查要求澄清或确因资料权限无法完成
- **THEN** 返回符合游戏语境的说明，不写入成功历史或增加关系

### Requirement: Reusable model calls without NPC context

其他 AI 能力 SHALL 能使用同一模型配置完成调用，并明确指定单次 I/O 故障超时、模型窗口和输出上限，无需构造 NPC 身份或聊天历史。短请求或独立业务租约的期限 SHALL 与通用 Agent 任务总时长区分；通用任务 MUST 不另设累计调用或总时长硬上限。模型失败、空白或截断输出 MUST 返回可区分的失败；公共调用 MUST 不自动加入 NPC 提示词、记忆或检索内容。公共模型能力 SHALL 支持区分最终文本、提供方实际返回的可选思考字段、工具请求、用量及停止原因；工具请求和思考内容 MUST 不被旧文本入口误当成最终答案，不支持所需能力时 MUST 明确失败，不静默切换模型或伪造执行。思考字段 SHALL 按模型协议用于本 Agent 续行及显式开启的受限诊断，无字段时兼容原流程，不为诊断增加模型调用。compact SHALL 复用该公共边界，不建立专用模型旁路。

#### Scenario: Independent model operation

- **WHEN** 非 NPC 调用方提供自己的消息和限制
- **THEN** 模型收到这些消息与有效配置，不附带玩家数据、NPC 人设或知识库内容

#### Scenario: JSON and text calls use their own output contracts

- **WHEN** 业务要求 JSON 对象，或仅要求普通文本
- **THEN** JSON 调用发送 `response_format={"type":"json_object"}`、提示词包含 JSON 关键词且不发送 `max_tokens`，结果继续经过已有本地校验；文本调用不启用 JSON 模式，不新增 Schema 转换或模型调用

#### Scenario: Remaining deadline and failure

- **WHEN** 单次模型操作的剩余故障等待时间耗尽，或响应为空白或被截断
- **THEN** 返回可区分的失败而非成功文本，已发生的用量仍记账，不将此期限误用为所有后续调查的任务总时限

#### Scenario: Model requests a tool

- **WHEN** 已声明支持工具调用的模型返回合法工具请求
- **THEN** Agent 得到可校验的调用身份和参数，并经公共工具边界执行；单次文本入口不将其当成回答

#### Scenario: Provider lacks required capability

- **WHEN** 业务要求工具调用或原生 JSON Object，但配置的模型适配不支持
- **THEN** 返回可诊断的能力不匹配结果，不悄悄更换提供方或模型

#### Scenario: Text wrapper receives reasoning and a final answer

- **WHEN** 提供方响应同时包含独立思考字段与最终正文
- **THEN** 结构化适配分开保留二者，旧文本包装只返回正文；NPC 成功历史、世界发布和玩家通信不混入思考内容

### Requirement: Configuration continuity

服务 SHALL 继续接受现有业务环境变量及角色配置，进程环境变量优先于服务目录的 .env，相对路径以服务根目录解析。目录迁移 MUST 不隐式切换模型、端点、单次故障超时或所使用的数据集；取消旧任务总期限的配置迁移 SHALL 明确记录，不能保留旧参数暗中截断长任务。诊断日志 MUST 不输出密钥、完整提示词或包含敏感响应的异常正文。新增配置 SHALL 使用中文说明；主 Agent 入口 MUST 默认关闭，独立业务可选启用。本项目路径默认值可保留，但显式配置 MUST 覆盖它们。

ai/.env.example SHALL 只列常用连接、模型与容量、服务接入及主要能力开关，按用途分组并使用中文说明；高级调优 SHALL 在使用文档中按需说明。精简 MUST 不删除已有配置能力、改变现有默认行为或覆盖部署者的 .env；省略项使用现有配置默认值，模型切换时同步核对窗口和最大输出容量的说明 MUST 保留。

CLI 程序、允许的操作、工作目录及用法说明 SHALL 由管理员通过可信配置提供，经统一 exec 入口调用；模型、Skill 和 socket 请求 MUST 不能改写该配置或自行授权。旧 CodeGraph 配置及工具授权 SHALL 有明确的中文迁移说明，MUST 不被静默忽略或自动扩大为其他程序、全部操作或通用 Shell 权限。未启用 CLI 的部署 MUST 不要求相应可执行程序或索引存在；禁用 CodeGraph 时 SHALL 保持原 source.search/read 回退及其他已授权能力。配置迁移 MUST 不覆盖正式 .env、不隐式切换模型或放宽资料边界。

源码能力 SHALL 按本次明确的策略修订默认启用，使用单一可配置仓库根目录、全局关闭开关和统一敏感排除，不要求多 scope 或逐目录、逐 Agent、逐角色配置。中文迁移说明 SHALL 明示该默认值变化、必要源码片段外发、排除范围及关闭方法，并指导旧 scope 配置迁移；MUST 不静默忽略旧显式配置。该源码策略变化 MUST 不自动开放主 Agent 入口或世界创作，不放宽知识库及会话权限，也不视为正式玩家功能验收通过。

模型窗口 SHALL 可通过环境变量配置，默认 1000000 token，未设置使用默认值、显式非法值报错；输出容量 SHALL 单独配置并核验能与完整输入共同适配模型窗口。纯文本按本次输出上限预留，原生 JSON 按环境变量声明的模型最大输出容量预留；输出格式说明与配置 SHALL 计入完整请求开销，不沿用较小的文本预留。更换模型的说明 SHALL 要求同步核对窗口和输出配置，独立模型 SHALL 绑定各自容量，不能在执行器中假定所有模型均支持 1M。

思考诊断 SHALL 由可信本地配置或诊断命令显式开启，默认不在普通日志输出正文；中文说明 SHALL 包含开启方式、受限输出位置、OS 权限及敏感数据处理。诊断 MUST 不由 socket 载荷启用，也不改变模型思考模式、协议字段保留或业务提交。思考记录 SHALL 使用独立受保护输出，不放宽普通日志禁止敏感异常原文的规则。

#### Scenario: Start from another working directory

- **WHEN** 从项目外的目录使用绝对路径启动已迁移的服务
- **THEN** 读取 ai 目录下的配置与相对数据路径，并保留进程环境变量的优先级

#### Scenario: Minimal example preserves effective defaults

- **WHEN** 在清洁环境使用精简后的示例，未填写高级调优项
- **THEN** 规范化路径后的有效默认配置与精简前一致，已有显式环境覆盖仍生效；无需填满所有可选参数，也不修改正式部署配置

#### Scenario: Existing explicit paths

- **WHEN** 原配置中包含绝对路径或明确指向旧目录的自定义路径
- **THEN** 服务尊重显式配置，迁移说明要求部署者核对这些路径，不静默创建另一份空数据替代旧数据

#### Scenario: Existing deployment upgrades

- **WHEN** 使用旧配置启动新架构服务
- **THEN** 按已说明的单仓库源码默认策略及显式覆盖/关闭配置处理；旧 scope 配置有明确迁移处理，不被静默忽略；不自动开放主 Agent，不改变现有模型和世界创作开关

#### Scenario: Existing CodeGraph deployment migrates to exec

- **WHEN** 使用原 CodeGraph 配置和授权的部署升级到统一 CLI 入口
- **THEN** 提供明确迁移处理，保留其显式程序路径、仓库绑定及关闭状态，不自动授权新增程序或操作，不静默忽略旧值，也不覆盖原配置

#### Scenario: CLI configuration is absent or disabled

- **WHEN** 部署未配置或未启用外部 CLI
- **THEN** 服务不要求安装 CodeGraph 或准备索引，不向模型发布不可用命令；源码开启时可用 source.search/read，其他已授权业务不受影响

#### Scenario: Explicit source root and disable configuration

- **WHEN** 部署指定另一仓库根目录，或显式关闭源码能力
- **THEN** 根目录覆盖默认值且不回读本库路径；关闭时不要求源码目录存在，公开文档问答保持可用，进程环境变量仍优先

#### Scenario: Deployment switches to a smaller model

- **WHEN** 部署者更换模型并通过环境变量配置更小的窗口及相容输出上限
- **THEN** 不修改执行器即可按新窗口的 80% 触发 compact，进程环境优先于 .env，不继续套用旧模型容量

#### Scenario: Context setting is omitted or malformed

- **WHEN** 窗口变量未设置，或显式值为空、非正整数或与输出预留不相容
- **THEN** 未设置采用 1000000 token 默认值，显式非法配置明确报错，不静默退回 1M 并发送可能越限的请求

## ADDED Requirements

### Requirement: Portable service with optional game integration

AI 服务 SHALL 可独立于本 MUDLIB 运行；其他游戏可用约定协议、角色、知识及路径配置接入，不要求本库的 LPC 对象名、驱动或 mudcore。通用执行、模型及基础工具 MUST 不依赖具体游戏业务；游戏差异 SHALL 优先通过配置解决，只有不同业务语义由可选模块或适配承担。被禁用的业务 MUST 不要求相应游戏目录存在；独立部署 MUST 不暗含多租户或远程认证能力。

#### Scenario: Standalone alternative-game deployment

- **WHEN** 将服务放入没有本 MUDLIB 的临时目录，配置另一套角色和知识、覆盖源码根目录或关闭源码，并禁用无限世界
- **THEN** 普通 socket 客户端可完成假模型问答和摘要；源码启用时只使用指定仓库，关闭时不访问源码目录，不读取本库隐含路径、不需要启动 FluffOS

#### Scenario: Generic runtime has no game import

- **WHEN** 仅启用一个与 NPC 和无限世界无关的测试能力
- **THEN** 可执行通用模型、工具、技能、权限和 Hook 流程，无须加载这两个游戏模块

### Requirement: Explicit game and service ownership

接入契约 SHALL 区分游戏端对在线对象、玩法规则和游戏数值的权威，与服务对 AI 结果及自身持久数据的责任。特定世界的清单校验、内容身份和共享文件发布 SHALL 限于该可选业务，不成为通用 Agent 前置条件；文档 MUST 明确共享目录依赖，而非称所有业务均仅依赖 socket。

#### Scenario: World publication integration

- **WHEN** 本游戏启用无限世界模块
- **THEN** 按该模块公开契约配置共享目录并发布结果，其他 Agent 不要求该目录存在或解释其清单

#### Scenario: Different game owns its result application

- **WHEN** 其他 MUD 收到模型结果
- **THEN** 由该游戏的接入层校验并应用，服务不能通过模型工具任意修改该游戏规则或数值

### Requirement: Preserve world narration data and lifecycle

架构迁移 SHALL 保留已提交基线中的世界内容键、冻结事实、持久任务、日额度、有限重试、短确认、状态查询、正文及原子发布。直接世界描写默认 SHALL 保持单次模型生成、90 秒单次操作故障超时及至多三次持久业务尝试；不得额外调用主 Agent 或审稿模型。未达到上下文阈值的普通生成 MUST 不新增 compact 调用，必要压缩的实际用量 SHALL 独立记录，不冒充新世界内容或重置业务额度。技能或模型升级 MUST 不触发旧成功正文重生成，缺少世界目录或禁用世界创作 MUST 不阻止其他能力运行。

#### Scenario: Ready content survives migration

- **WHEN** 升级后查询已有成功内容键
- **THEN** 返回原正文；必要时只重新发布，不调用模型，不重置历史额度

#### Scenario: Interrupted task recovery

- **WHEN** 迁移后恢复已有未完成世界任务
- **THEN** 遵守原租约、退避、尝试次数及日额度，不因创建 Agent 运行而重复计费或重置次数

### Requirement: Data-preserving staged rollout and rollback

迁移 SHALL 逐业务验证并提供回退说明，保持旧 NPC 去重键和数据可读；新增通用请求缓存 SHALL 与旧业务隔离。回退 MUST 保留数据库、正文和必要审计，不删库、不覆盖配置、不同时启动共享数据的两个写入方。运行数据和真实模型产物 MUST 不纳入源码提交。

#### Scenario: Roll back migrated assembly

- **WHEN** 停止接收新请求并处理在途工作后回退至已验证业务装配
- **THEN** 已有历史、关系、有效去重及世界正文仍可用，不需要重新生成或重建数据
