# Spec Delta

## MODIFIED Requirements

### Requirement: Preserve NPC knowledge and persistence

NPC 对话 SHALL 保留人设、BM25 与向量混合检索、重排降级、摘要、记忆和关系规则。成功聊天的历史、关系更新和去重结果 MUST 保持原子提交；失败或离线演示 MUST 不写入真实对话或推进关系。NPC 问答与摘要 SHALL 使用独立 Agent 和外置技能；授权源码证据 SHALL 可补充或纠正文档，但无源码授权时已有公开知识能力 MUST 保持。未完成调查和澄清 MUST 不作为成功聊天推进关系，摘要 MUST 仅处理所属会话材料并受根期限约束。

#### Scenario: Duplicate after service restart

- **WHEN** 已成功提交的请求在原去重有效期内因丢包或服务重启再次发送
- **THEN** 返回原结果，不再次调用模型、不重复保存对话或增加关系

#### Scenario: Failed or simulated completion

- **WHEN** 模型失败、响应超时，或缺少密钥而使用已有离线演示
- **THEN** 保持原有失败或演示体验，真实对话和关系数据不被污染

#### Scenario: Retrieval service unavailable

- **WHEN** 向量或重排服务不可用，但已有本地知识库
- **THEN** 按原有回退路径完成检索，不因模块移动丢失 BM25 能力

#### Scenario: Source permission absent

- **WHEN** NPC 仅获准检索已有公开文档
- **THEN** 仍能按原有知识和人设回答，不自动打开源码范围

#### Scenario: Incomplete investigation

- **WHEN** 源码调查要求澄清或确因资料权限无法完成
- **THEN** 返回符合游戏语境的说明，不写入成功历史或增加关系

### Requirement: Reusable model calls without NPC context

其他 AI 能力 SHALL 能使用同一模型配置完成调用，并明确指定有限超时、截止期限及输出上限，无需构造 NPC 身份或聊天历史。模型失败、空白或截断输出 MUST 返回可区分的失败；公共调用 MUST 不自动加入 NPC 提示词、记忆或检索内容。公共模型能力 SHALL 支持区分最终文本、工具请求、用量及停止原因；工具请求 MUST 不被旧文本入口误当成最终答案，不支持所需能力时 MUST 明确失败，不静默切换模型或伪造执行。

#### Scenario: Independent model operation

- **WHEN** 非 NPC 调用方提供自己的消息和限制
- **THEN** 模型收到这些消息与有效配置，不附带玩家数据、NPC 人设或知识库内容

#### Scenario: Remaining deadline and failure

- **WHEN** 调用剩余时间少于业务指定超时，或者响应为空白或被截断
- **THEN** 实际等待不超过剩余期限，失败不会被作为成功文本交付

#### Scenario: Model requests a tool

- **WHEN** 已声明支持工具调用的模型返回合法工具请求
- **THEN** Agent 得到可校验的调用身份和参数，并经公共工具边界执行；单次文本入口不将其当成回答

#### Scenario: Provider lacks required capability

- **WHEN** 业务要求工具调用但配置的模型适配不支持
- **THEN** 返回可诊断的能力不匹配结果，不悄悄更换提供方或模型

### Requirement: Configuration continuity

服务 SHALL 继续接受现有环境变量及角色配置，进程环境变量优先于服务目录的 .env，相对路径以服务根目录解析。目录迁移 MUST 不隐式切换模型、端点、超时或所使用的数据集；诊断日志 MUST 不输出密钥、完整提示词或包含敏感响应的异常正文。新增配置 SHALL 使用中文说明；源码范围和主 Agent 入口 MUST 默认关闭，独立业务可选启用，旧配置 MUST 不因新架构被隐式扩大权限。本项目路径默认值可保留，但显式配置 MUST 覆盖它们。

#### Scenario: Start from another working directory

- **WHEN** 从项目外的目录使用绝对路径启动已迁移的服务
- **THEN** 读取 ai 目录下的配置与相对数据路径，并保留进程环境变量的优先级

#### Scenario: Existing explicit paths

- **WHEN** 原配置中包含绝对路径或明确指向旧目录的自定义路径
- **THEN** 服务尊重显式配置，迁移说明要求部署者核对这些路径，不静默创建另一份空数据替代旧数据

#### Scenario: Existing deployment upgrades

- **WHEN** 使用旧配置启动新架构服务
- **THEN** 不自动开放源码或主 Agent，不改变现有模型和世界创作开关

## ADDED Requirements

### Requirement: Portable service with optional game integration

AI 服务 SHALL 可独立于本 MUDLIB 运行；其他游戏可用约定协议、角色、知识及路径配置接入，不要求本库的 LPC 对象名、驱动或 mudcore。通用执行、模型及基础工具 MUST 不依赖具体游戏业务；游戏差异 SHALL 优先通过配置解决，只有不同业务语义由可选模块或适配承担。被禁用的业务 MUST 不要求相应游戏目录存在；独立部署 MUST 不暗含多租户或远程认证能力。

#### Scenario: Standalone alternative-game deployment

- **WHEN** 将服务放入没有本 MUDLIB 的临时目录，配置另一套角色和知识并禁用无限世界
- **THEN** 普通 socket 客户端可完成假模型问答和摘要，不读取本库隐含路径、不需要启动 FluffOS

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

架构迁移 SHALL 保留已提交基线中的世界内容键、冻结事实、持久任务、额度、有限重试、短确认、状态查询、正文及原子发布。直接世界描写默认 SHALL 保持单次模型生成、90 秒单次上限及至多三次业务尝试；不得额外调用主 Agent 或审稿模型。技能或模型升级 MUST 不触发旧成功正文重生成，缺少世界目录或禁用世界创作 MUST 不阻止其他能力运行。

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
