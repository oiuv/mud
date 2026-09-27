# Spec Delta

## MODIFIED Requirements

### Requirement: Explicit routing with separate business validation

AI 服务 SHALL 先校验公共消息，再按明确注册的请求类型分发，由业务模块校验自己的字段；未知或无效类型 MUST 返回受限错误，不隐式执行聊天或任意函数。已有省略类型的请求 SHALL 按原有默认聊天行为处理。新增主 Agent 请求 SHALL 使用显式、默认关闭的 agent_run 类型；既有明确业务 MUST 直接路由，不隐式经主 Agent 分类。通信契约 SHALL 可由其他游戏客户端实现，不要求依赖本库对象。

#### Scenario: Unknown and malformed type

- **WHEN** 请求类型未知或不是合法字符串
- **THEN** 服务返回格式或类型错误，不调用模型，也不终止接收循环

#### Scenario: Non-NPC handler

- **WHEN** 已注册的非 NPC 处理方接到无玩家字段的请求
- **THEN** 直接使用该业务的校验与处理，不读取 NPC 人设、聊天历史或会话锁

#### Scenario: Explicit main-agent entry

- **WHEN** 调用者发送 agent_run 请求
- **THEN** 仅当该入口已明确启用且请求合法时执行主 Agent；禁用时明确拒绝，不改走聊天

#### Scenario: Legacy direct request

- **WHEN** 调用者使用原有聊天或世界请求报文
- **THEN** 按原业务字段和响应语义处理，不增加主 Agent 模型调用

### Requirement: Per-capability deadlines and work capacity

业务 SHALL 能选择短响应或显式支持的长任务生命周期及有界工作容量，公共入口 MUST 不将全部能力强制放进 NPC 的会话锁与工作容量。单次模型/工具故障超时、短请求等待、长任务存活检测 SHALL 与任务累计运行时间区分；短确认不自动表示后台工作完成。主 Agent SHALL 有独立有界容量，委派 MUST 遵守子业务容量及根取消状态，不绕过容量或死锁等待自身。通信存活且请求有效的长任务 MUST 不因固定总等待期限终止。

#### Scenario: Chat pool saturated

- **WHEN** NPC 工作容量占满，另一个具有独立可用容量的已注册处理方收到请求
- **THEN** 该请求仍可处理，不等待 NPC 会话锁或聊天工作槽释放

#### Scenario: Acknowledgement before completion

- **WHEN** 处理方返回任务已接受状态
- **THEN** 公共客户端完成当前请求并交付原始状态，不把它展示为 NPC 回答，也不宣称任务已经生成完成

#### Scenario: Main request delegates to a saturated business

- **WHEN** 主 Agent 尚有容量但目标业务已满
- **THEN** 获得受限忙碌结果并在有效授权及取消契约内处理，不绕过子业务容量或死锁等待

## ADDED Requirements

### Requirement: Long-running request liveness and cancellation

长任务 SHALL 在现有请求关联与 socket 契约上支持非终态在途状态、调用方存活续约与取消，不引入任务总时长硬上限。长任务模式 SHALL 由双方显式支持，旧短请求及世界受理/查询响应语义 MUST 保持。非终态状态 MUST 不触发终态回调、成功提交或新模型运行；存活探测 SHALL 独立于模型输出速度，同编号同内容的重传 SHALL 继续关联同一运行。

玩家/回调宿主失效、显式取消、服务停止或经存活检测确认通信失联时 SHALL 停止后续操作并拒绝迟到成功提交/投递。存活检测 SHALL 容忍正常的短暂丢包，MUST 不只依赖最后一份取消报文送达。续约 SHALL 验证原调用关联，MUST 不改变权限、会话或复活终态。单次连接及失联检测期限 SHALL 保留故障含义，MUST 不被固定 80/90 秒任务总期限替代。

#### Scenario: Healthy investigation lasts beyond the old timeout

- **WHEN** 调查或 compact 持续超过旧 NPC/客户端总等待时间，双方仍保持存活且请求有效
- **THEN** 继续同一任务并保留最终回调资格，在途状态不显示为最终答案、不重复收费执行

#### Scenario: Model produces no text while the connection is alive

- **WHEN** 单次模型操作仍在其有效故障超时内，但没有文本输出
- **THEN** 通信存活仍由独立机制维持，不因没有模型文本误判调用方离线

#### Scenario: Cancellation message is lost

- **WHEN** 调用方离线或取消后停止续约，最后的取消报文未送达
- **THEN** 服务通过失联检测撤销运行资格，停止新调用，迟到结果不更新成功记录或玩家关系

#### Scenario: Progress packets are duplicated or arrive late

- **WHEN** 重复在途报文、重传或终态后的续约到达
- **THEN** 不新建任务、不重复投递终态、不复活已结束请求，原授权与请求指纹规则仍生效

### Requirement: Trusted authority binding at the entry

入口 SHALL 由服务端可信配置绑定受众、权限和会话范围；本机 UDP MUST 不被当作管理员认证。请求载荷中的角色、文件根路径、策略、工具定义及授权声明 MUST 不能提升权限。管理员诊断 SHALL 使用受操作系统权限保护的入口；默认网络请求只可取得固定的玩家级授权，不新增未认证管理路由。

#### Scenario: Forged administrator payload

- **WHEN** socket 请求自报管理员并指定额外源码根目录
- **THEN** 不赋予额外权限，拒绝违规字段或操作，不能访问管理资料

#### Scenario: Request claims another session

- **WHEN** 委派参数试图改用不属于当前授权上下文的玩家会话
- **THEN** 业务适配层拒绝越界，不读取其历史或推进其关系

### Requirement: Agent response correlation and replay limits

agent_run SHALL 沿用公共请求关联、数据报大小、有限重传及至多一次终态投递契约，并明确任务终态或后台业务受理凭据。相同成功请求在缓存有效期内重传 MUST 不重复执行；不同内容复用编号 MUST 被拒绝。大型证据和内部轨迹 MUST 不直接塞入玩家数据报，超限 MUST 明确失败而不是截断 JSON。

#### Scenario: Agent reply exceeds transport size

- **WHEN** 内部调查产生超过公共数据报容量的证据记录
- **THEN** 只交付符合契约的有界业务响应，受限证据另供管理诊断，不能泄露或截断内部记录

#### Scenario: Agent response replay

- **WHEN** 调用方重传已成功请求或收到重复响应
- **THEN** 服务复用有效结果，客户端仅交付一次，既有请求关联规则保持不变
