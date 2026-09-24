# Spec Delta

## Purpose

为游戏中的不同 AI 能力提供统一的异步请求通信，使调用方能够获得关联正确、容量有界、失败可处理的结果。公共接口不依赖 NPC 或在线玩家，并在重传、对象销毁和服务重载时保持明确的生命周期。

## ADDED Requirements

### Requirement: Business-independent request submission
游戏 SHALL 通过统一 AI 客户端提交请求类型、业务数据、结果处理方和有限等待期限；公共接口 MUST 不要求 NPC、玩家身份或在线玩家存在。请求类型与关联编号 MUST 由公共接口控制，业务数据不得覆盖它们。

#### Scenario: Request without a player
- **WHEN** 游戏守护程序提交一个已注册类型的合法请求，业务数据没有 NPC 或玩家字段
- **THEN** 请求正常发送，响应交给该守护程序，不显示 NPC 提示或向玩家输出文字

#### Scenario: Reserved envelope fields
- **WHEN** 业务数据尝试覆盖请求类型或关联编号
- **THEN** 客户端明确拒绝，原始请求未发送，既有待处理请求不受影响

### Requirement: Correlated and validated responses
客户端 MUST 仅接受来自配置服务地址、匹配待处理请求编号及响应类型并通过业务校验的回包。错误响应 SHALL 保留可用关联信息；无效、迟到或重复回包 MUST 不完成另一请求，也不重复调用结果处理方。

#### Scenario: Wrong business identity
- **WHEN** 服务返回相同请求编号但 NPC 或玩家身份不匹配的聊天响应
- **THEN** 原请求继续等待合法结果，不向其他玩家展示回答

#### Scenario: Duplicate and stale response
- **WHEN** 已完成或已超时请求的响应再次到达，或旧客户端实例的响应到达新实例
- **THEN** 不触发新的业务回调或玩家输出

### Requirement: Bounded lifecycle and transport retries
系统 SHALL 限制数据报 UTF-8 字节数、待处理容量、等待时间及重传次数。消息重传 MUST 使用相同编号与内容；成功、超时、通信重载及调用方销毁后 SHALL 清理关联状态与定时器。仍有效的调用方 SHALL 至多收到一次终态通知；业务回调失败 MUST 不泄漏容量或阻断其他请求。

#### Scenario: Lost first request
- **WHEN** 首次数据报丢失，客户端在有限策略内重传
- **THEN** 重传编号和数据不变，成功后只回调一次；始终无回包时有限超时并释放容量

#### Scenario: Callback owner disappears or raises
- **WHEN** 调用方被销毁，或其结果回调抛出异常
- **THEN** 待处理状态最终被清理，其他请求继续工作，系统不尝试重新加载已销毁调用方

#### Scenario: Capacity or byte limit reached
- **WHEN** 提交超过 8 KiB 的数据报，或所属工作容量已满
- **THEN** 请求得到明确失败结果，不截断 JSON、不无限积压，也不影响既有请求

### Requirement: Explicit routing with separate business validation
AI 服务 SHALL 先校验公共消息，再按明确注册的请求类型分发，由业务模块校验自己的字段；未知或无效类型 MUST 返回受限错误，不隐式执行聊天或任意函数。已有省略类型的请求 SHALL 按原有默认聊天行为处理。

#### Scenario: Unknown and malformed type
- **WHEN** 请求类型未知或不是合法字符串
- **THEN** 服务返回格式或类型错误，不调用模型，也不终止接收循环

#### Scenario: Non-NPC handler
- **WHEN** 已注册的非 NPC 处理方接到无玩家字段的请求
- **THEN** 直接使用该业务的校验与处理，不读取 NPC 人设、聊天历史或会话锁

### Requirement: Per-capability deadlines and work capacity
业务 SHALL 能选择适合自己的响应等待期限及有界工作容量，公共入口 MUST 不将全部能力强制放进 NPC 的会话锁与工作容量。公共模型调用的超时 SHALL 与传输等待期限区分；短确认结束的是本次请求，不自动表示后台工作完成。

#### Scenario: Chat pool saturated
- **WHEN** NPC 工作容量占满，另一个具有独立可用容量的已注册处理方收到请求
- **THEN** 该请求仍可处理，不等待 NPC 会话锁或聊天工作槽释放

#### Scenario: Acknowledgement before completion
- **WHEN** 处理方返回任务已接受状态
- **THEN** 公共客户端完成当前请求并交付原始状态，不把它展示为 NPC 回答，也不宣称任务已经生成完成
