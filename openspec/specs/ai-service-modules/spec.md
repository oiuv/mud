# ai-service-modules Specification

## Purpose

将 AI 服务作为游戏可选组件运行，使 NPC 对话和后续业务共用模型接入与基础配置，同时保持各自的输入、状态和结果处理。升级必须保留当前 NPC 体验、已有数据及日常启动方式，并提供清晰可验证的路径迁移方法。

## Requirements

### Requirement: Preserve NPC interaction behavior
NPC 模块 SHALL 保持现有提问长度限制、玩家在线校验、同一玩家与 NPC 的重复提问限制、等待提示、回答格式及失败提示。现有聊天调用入口 SHALL 可继续使用；重传 MUST 不重复显示等待提示，玩家对象失效后 MUST 不向同名的新玩家会话投递旧回复。

#### Scenario: Existing NPC and shadow entry points
- **WHEN** 玩家通过周不通、其他已有 AI NPC 或影子对象提问
- **THEN** 先显示玩家提问，再显示一次对应 NPC 的等待提示，成功后输出一次回答

#### Scenario: Duplicate question and reconnect
- **WHEN** 玩家重复向尚未回答的同一 NPC 提问，随后原玩家对象销毁并重新登录
- **THEN** 重复提问被提示等待，旧请求回复不会投递给新玩家对象

### Requirement: Preserve NPC knowledge and persistence
NPC 对话 SHALL 保留人设、BM25 与向量混合检索、重排降级、摘要、记忆和关系规则。成功聊天的历史、关系更新和去重结果 MUST 保持原子提交；失败或离线演示 MUST 不写入真实对话或推进关系。

#### Scenario: Duplicate after service restart
- **WHEN** 已成功提交的请求在原去重有效期内因丢包或服务重启再次发送
- **THEN** 返回原结果，不再次调用模型、不重复保存对话或增加关系

#### Scenario: Failed or simulated completion
- **WHEN** 模型失败、响应超时，或缺少密钥而使用已有离线演示
- **THEN** 保持原有失败或演示体验，真实对话和关系数据不被污染

#### Scenario: Retrieval service unavailable
- **WHEN** 向量或重排服务不可用，但已有本地知识库
- **THEN** 按原有回退路径完成检索，不因模块移动丢失 BM25 能力

### Requirement: Reusable model calls without NPC context
其他 AI 能力 SHALL 能使用同一模型配置完成调用，并明确指定有限超时、截止期限及输出上限，无需构造 NPC 身份或聊天历史。模型失败、空白或截断输出 MUST 返回可区分的失败；公共调用 MUST 不自动加入 NPC 提示词、记忆或检索内容。

#### Scenario: Independent model operation
- **WHEN** 非 NPC 调用方提供自己的消息和限制
- **THEN** 模型收到这些消息与有效配置，不附带玩家数据、NPC 人设或知识库内容

#### Scenario: Remaining deadline and failure
- **WHEN** 调用剩余时间少于业务指定超时，或者响应为空白或被截断
- **THEN** 实际等待不超过剩余期限，失败不会被作为成功文本交付

### Requirement: Configuration continuity
服务 SHALL 继续接受现有环境变量及角色配置，进程环境变量优先于服务目录的 .env，相对路径以服务根目录解析。目录迁移 MUST 不隐式切换模型、端点、超时或所使用的数据集；诊断日志 MUST 不输出密钥、完整提示词或包含敏感响应的异常正文。

#### Scenario: Start from another working directory
- **WHEN** 从项目外的目录使用绝对路径启动已迁移的服务
- **THEN** 读取 ai 目录下的配置与相对数据路径，并保留进程环境变量的优先级

#### Scenario: Existing explicit paths
- **WHEN** 原配置中包含绝对路径或明确指向旧目录的自定义路径
- **THEN** 服务尊重显式配置，迁移说明要求部署者核对这些路径，不静默创建另一份空数据替代旧数据

### Requirement: Data-preserving directory migration
服务 SHALL 从 ai 目录启动，提供从 npc_ai 迁移及回退的说明；配置、角色、知识库、对话数据库和日志 MUST 被保留，已有 SQLite 数据结构不得仅因目录改名而重建。迁移过程 MUST 不覆盖目标已有配置或合并两份来源不明的数据。

#### Scenario: Upgrade an existing installation
- **WHEN** 停止旧服务并按说明迁移运行数据，在新路径重建虚拟环境后启动
- **THEN** 原 NPC 角色、索引、历史、记忆和有效去重结果可继续使用，配置不被示例覆盖

#### Scenario: Both directories contain data
- **WHEN** 新旧目录均有独立配置或数据库
- **THEN** 不自动覆盖、删除或合并，迁移说明要求先确认使用的数据来源

### Requirement: Preserve launcher and game integration behavior
Windows 和 Linux 启动入口 SHALL 保留已有命令、重复启动识别、停止时的进程身份检查及启动前知识库更新。游戏启动 SHALL 只提示单独启动 AI 服务；全量 LPC 编译 MUST 排除 ai 服务目录并继续跳过点号开头的目录。

#### Scenario: Game startup and compilation
- **WHEN** 启动游戏并执行全量编译
- **THEN** 游戏提示当前项目下的 AI 启动路径而不启动服务，编译不遍历 Python 服务及虚拟环境

#### Scenario: Service restart
- **WHEN** 使用迁移后的服务脚本启动、查看状态、停止或重启
- **THEN** 保持原命令语义，检查目标进程身份，按原有策略更新知识库并保留已有配置
