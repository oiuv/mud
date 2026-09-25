# Spec Delta

## Purpose

使各 AI 业务的专业指导、行动方法和验收样例可独立维护，通过统一的受限接口按需提供给模型或直接调用入口，避免提示词散落在源码中，同时保持技能版本可追溯且不具备额外执行权限。

## ADDED Requirements

### Requirement: Independently maintained professional skill packages

专业指导 SHALL 以独立技能包维护，包含名称、适用场景、目标与完成条件、方法、检查清单、输出要求及正反例。首批 SHALL 覆盖 NPC 对话、源码调查、摘要、世界描写和主 Agent 协调。本项目技能说明 SHALL 使用中文；角色身份和部署模型 MUST 不固化在通用指导中。

#### Scenario: Update professional guidance

- **WHEN** 维护者更新世界描写的专业指导而不改变业务契约
- **THEN** 无需修改模型调用源码或另建提示词分支，后续运行可使用新版本，已有正文不自动重生成

### Requirement: Discoverable and progressively loaded skills

服务 SHALL 自动扫描配置的业务技能目录并校验包元数据，在组装 Agent 系统提示词时按有效权限注入可用技能的名称与描述。Agent SHALL 根据任务需要，通过唯一的 `skill` 工具按名称加载技能正文；需要引用资料时 SHALL 通过同一工具指定技能名和包内资源路径读取。技能目录发现 MUST 不要求模型先调用列举工具，接口 MUST 不增加 `list/load/read_resource` 操作分发层，也不为每个技能建立独立工具或路由。

明确路由 SHALL 能通过同一授权工具入口预加载指定技能，不要求额外模型调用。发现阶段 SHALL 仅提供必要元数据，具体指导与引用资料按需加载，不将全部技能全文塞入每次请求。新增合法技能包 SHALL 通过目录扫描被发现，不要求修改中央分发代码；自动发现 MUST 不自动授予使用权。

技能目录、统一 skill 工具可见性及实际加载 SHALL 使用一致的有效授权范围；禁止工具调用时 MUST 不发布可调用技能目录或绕过限制预加载。技能正文及要求完整加载的指导资源 MUST 不静默截断后报告成功，超过加载上限 SHALL 明确拒绝；大篇参考资料可拆分后按需读取，片段 MUST 不冒充完整指导。

#### Scenario: Authorized catalog in the system prompt

- **WHEN** Agent 开始执行且部署目录中存在多个有效技能包
- **THEN** 系统提示词仅包含其已授权技能的名称和描述，不包含未授权技能信息或全部技能正文，模型无需先调用列举工具

#### Scenario: New skill shares the same tool

- **WHEN** 部署者增加一个合法技能包并为当前 Agent 授权
- **THEN** 扫描后其名称和描述可被注入，模型仍使用同一个 `skill` 工具按名称加载，不新增逐技能工具、路由或中央分发分支

#### Scenario: Direct narration skill preload

- **WHEN** 世界描写通过明确入口执行
- **THEN** 加载对应授权技能后直接生成，不为选择技能增加主 Agent 或额外模型轮次

#### Scenario: Model discovers an investigation skill

- **WHEN** Agent 需要源码调查方法且具有对应技能权限
- **THEN** 能从系统提示词中的技能目录识别其用途，通过 `skill` 按名称加载指导，并按需通过同一工具读取本包内授权的示例资料

#### Scenario: Skill tool is unavailable to the agent

- **WHEN** 当前 Agent 的有效权限不允许使用 skill 工具
- **THEN** 不提示模型调用技能，不通过直接预加载绕过限制；必需技能不可用时明确拒绝相应能力

#### Scenario: Required instructions exceed the load limit

- **WHEN** 技能正文或必需完整加载的指导资源超过允许大小
- **THEN** 明确返回加载失败，不将截断内容当作完整指导继续生成成功结果

### Requirement: Skills do not grant authority

技能声明和正文 MUST 不授予工具、源码目录、受众或外发权限；工具声明至多收紧已有授权。技能资源 MUST 限于当前授权包并接受路径、文件大小和内容外发检查。服务 MUST 不执行技能附带脚本，不允许技能引用开发者私有技能目录或任意宿主路径。

#### Scenario: Skill asks for a forbidden tool

- **WHEN** 技能正文或工具声明要求执行命令或访问密钥
- **THEN** 不增加工具或目录权限，操作被拒绝

#### Scenario: Escaping resource reference

- **WHEN** 引用资料通过父路径、绝对路径或链接指向包外
- **THEN** 不读取该资源，不把内容送入模型或日志

### Requirement: Versioned and reproducible skill loading

一次运行 SHALL 固定技能版本与内容 hash，并记录实际加载的资源；中途修改 MUST 不静默混用新旧版本。必需技能缺失、格式错误或资源变化时 SHALL 拒绝受影响的运行或使用明确声明的既有离线回退，不能悄悄回到另一份源码内提示词。

#### Scenario: Skill changes during a run

- **WHEN** 执行过程中技能或引用资料被修改
- **THEN** 继续使用已固定的安全快照或明确报告变化，不混合版本生成成功结果

#### Scenario: Required skill missing

- **WHEN** 已启用 Agent 的必需技能缺失
- **THEN** 该能力的不可用原因可诊断，不绕过专业指导继续生成，其他独立能力不被错误替换

### Requirement: Preserve creative freedom within business facts

世界描写技能迁移 SHALL 保持允许合理补白的创作目标，区分真实事实冲突、误导操作与一般文风问题；未逐项列出的景物细节 MUST 不单独成为拒绝理由。技能升级 MUST 不改变地理规则、内容键或已发布正文，事实结构验证与文风审读 SHALL 分开记录。

#### Scenario: Natural descriptive addition

- **WHEN** 描写增加符合环境的松脂气息或局部岩缝且不违背既定事实
- **THEN** 不因输入未逐项列出该细节而拒绝，继续按结构和业务事实校验

#### Scenario: Invented actionable exit

- **WHEN** 描写明确承诺一个规则未提供的可进入暗道
- **THEN** 验收将其视为玩法误导而不是单纯文风偏好，不通过架构迁移放宽该业务约束
