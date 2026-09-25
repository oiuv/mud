# Spec Delta

## Purpose

提供可发现、可复用且有明确授权和资源上限的 AI 工具，使不同业务共享知识检索、文档及源码读取等能力，同时阻止模型越权访问数据、执行代码或绕过业务层修改游戏状态。

## ADDED Requirements

### Requirement: Trusted discovery separate from authorization

工具 SHALL 仅从受信任部署包发现，并声明稳定身份、说明、版本、参数与结果 schema、权限和资源范围、只读性、并发安全性、超时/取消语义、输出上限及成本类别。新增合法部署包 SHALL 无需修改中央分发分支即可被发现；发现 MUST 不自动授予访问权。工具重名、无效契约或不可信加载来源 MUST 被拒绝。元数据 MUST 不代替运行时授权；首版 SHALL 顺序执行工具，不因声明并发安全而隐式增加并行执行。

#### Scenario: New ungranted tool

- **WHEN** 管理员部署一个合法工具但未授予当前 Agent 使用权
- **THEN** 运行时能识别该工具，但模型的工具清单不显示它，直接猜测名称调用也被拒绝

#### Scenario: Model supplies an import path

- **WHEN** 输入、资料或模型输出要求加载任意程序路径或网络插件
- **THEN** 不加载或执行该内容，仅能使用已部署的授权工具

### Requirement: One bounded tool execution contract

模型和可信业务代码复用工具时 SHALL 使用同一参数验证、权限、预算、Hook 和结果限制，前置 Hook 调整参数后 MUST 重新验证和授权。结果 SHALL 包含可关联的调用 ID、安全错误类别及可恢复性；非法参数、未知工具、超时、取消、未授权、无匹配、文件变化和部分结果 SHALL 可区分，非法尝试 MUST 消耗步骤预算。实际执行的调用 SHALL 在成功或失败时均具有结束记录；未执行的拒绝 MUST 不伪造执行结果。相同调用 ID MUST 不重复执行，相同 ID 的不同内容 MUST 报冲突。单轮多工具请求 SHALL 对每项独立授权。取消或根预算耗尽 MUST 终止运行，不作为普通可恢复错误继续调用。

#### Scenario: Mixed authorized and unauthorized calls

- **WHEN** 同一轮同时请求公开知识检索和无权读取的源码
- **THEN** 每项分别判定，无权操作不执行，合法结果也不能成为额外授权依据

#### Scenario: Duplicate tool call identity

- **WHEN** 模型再次返回已经处理的调用 ID
- **THEN** 同内容返回已有结果或明确重复状态，不再次执行；不同内容返回冲突

#### Scenario: Recoverable tool error guides investigation

- **WHEN** 搜索无匹配、结果被截断或文件在读取时发生变化
- **THEN** Agent 获得可区分的有界结果并能在剩余授权和预算内调整查询或重读，不将这些状态统一解释为资料不存在

#### Scenario: Cancellation stops waiting but not the underlying operation

- **WHEN** 底层操作不支持强制停止，运行在等待期间取消或到期
- **THEN** 明确记录取消或超时，不启动下一轮、不交付迟到成功，不声称底层线程或已经发送的外部请求已被终止

### Requirement: Reusable knowledge retrieval with scoped egress

知识检索 SHALL 保留 BM25、向量融合、重排和故障回退，并供多个 Agent 或程序直接复用。候选资料、缓存及结果 MUST 按受众和权限隔离；发送外部向量或重排请求前 MUST 完成资料外发校验，相关调用 MUST 纳入预算。

#### Scenario: Restricted candidate in a public query

- **WHEN** 玩家查询可能匹配仅供管理员查看的资料
- **THEN** 该资料不进入玩家候选、缓存结果或外部重排请求

#### Scenario: Remote retrieval unavailable

- **WHEN** 向量或重排调用失败而本地授权知识可用
- **THEN** 返回有界的本地回退结果，保留证据来源和降级状态

### Requirement: Explicit read scopes and deny-by-default source access

源码搜索和读取 SHALL 仅接受部署配置中的 scope 别名、相对路径和有界查询。scope SHALL 指定根目录、包含/排除规则、文件类型、Agent、受众和外发许可；默认 MUST 不启用实际源码范围。读取授权 MUST 不被解释为任意外发授权。密钥、环境私密配置、玩家数据、日志、数据库、版本库对象及服务私有运行资料 MUST 始终排除。

#### Scenario: Default deployment

- **WHEN** 未配置任何源码 scope 的服务启动
- **THEN** 已有公开知识问答仍可用，源码工具无法读取仓库内容

#### Scenario: Readable but not exportable

- **WHEN** 资料允许受限本地诊断读取但不允许发送到外部模型
- **THEN** 外部模型调用前拒绝携带该资料，不能靠隐藏最终引用绕过

#### Scenario: Secret discovery attempt

- **WHEN** 查询尝试通过另一 scope 或搜索匹配发现被排除的私密资料
- **THEN** 结果、计数、文件名和错误均不泄露这些资料

### Requirement: Filesystem boundary integrity

搜索枚举和内容读取 MUST 验证实际访问对象仍位于授权范围，拒绝绝对路径、目录穿越、UNC/设备路径、Windows ADS，以及通过符号链接、目录联接、reparse point 或硬链接绕过隔离。无法可靠确认最终访问对象及文件替换竞争安全性时 MUST 拒绝访问，不仅依赖路径字符串前缀。

#### Scenario: Link or replacement escapes the root

- **WHEN** 授权目录内的路径指向范围外对象，或在校验和读取之间被替换
- **THEN** 不返回范围外内容，返回安全拒绝或文件变化结果

#### Scenario: Unsupported safe-open guarantee

- **WHEN** 当前平台无法证明文件访问满足隔离要求
- **THEN** 关闭受影响的源码访问并给出受限诊断，不降级为不安全读取

### Requirement: Bounded current evidence and untrusted content

搜索和读取 SHALL 限制扫描文件数、字节、结果数、行范围、返回规模和执行时间，默认搜索为字面量查询，不执行任意正则或 Shell。截断 MUST 明确标记，读取 SHALL 返回来源范围、行号、内容 hash 及读取时刻。资料和注释 MUST 仅作为证据，不能改变工具权限或运行指令。

#### Scenario: Search reaches a bound

- **WHEN** 搜索达到文件数或时间上限
- **THEN** 返回部分结果标记，不声称整个范围没有其他匹配

#### Scenario: Instruction embedded in source

- **WHEN** 读取内容要求忽略规则、读取密钥或执行命令
- **THEN** 内容保持资料身份，不改变权限，不产生相应未授权操作

### Requirement: No model-visible mutation or execution tools

模型工具集 MUST 不提供文件写入、删除、Shell、代码执行、任意网络请求或直接修改游戏数值能力。业务结果的必要持久化 SHALL 由可信业务代码在验证后完成，不接受模型提供的任意写入目标。技能发现和 Agent 委派 MUST 服从相同边界。

#### Scenario: Request to modify game source

- **WHEN** 玩家或模型提出修改绝招条件并保存源码
- **THEN** 没有可执行该动作的工具，源码和游戏数值保持不变
