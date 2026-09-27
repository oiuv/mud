# Spec Delta

## Purpose

使各 AI 业务的专业指导、行动方法和验收样例可独立维护，通过统一的受限接口按需提供给模型或直接调用入口，避免提示词散落在源码中，同时保持技能版本可追溯且不具备额外执行权限。

## ADDED Requirements

### Requirement: Independently maintained professional skill packages

专业指导 SHALL 以独立技能包维护，声明名称和适用场景，按实际任务提供必要指导。方法、检查清单和正反例 SHALL 按需提供，不作为所有技能的必备内容。明确具体场景的 Skill MAY 指定固定工作流；其他任务 SHALL 由 Agent 根据目标、工具观察和专业指导自主规划、调整步骤，不把特定场景的流程作为通用要求。首批 SHALL 覆盖 NPC 对话、源码调查、摘要、世界描写和主 Agent 协调。本项目技能说明 SHALL 使用中文；角色身份和部署模型 MUST 不固化在通用指导中。

#### Scenario: Update professional guidance

- **WHEN** 维护者更新世界描写的专业指导而不改变业务契约
- **THEN** 无需修改模型调用源码或另建提示词分支，后续运行可使用新版本，已有正文不自动重生成

#### Scenario: Guidance does not impose an unrelated workflow

- **WHEN** Agent 加载未要求固定工作流的专业 Skill
- **THEN** 根据当前目标自主选择步骤，不因缺少检查清单或正反例拒绝技能，也不要求任务遍历无关检查项；明确场景仍可按该 Skill 的工作流执行

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

### Requirement: Skill loading and professional execution have distinct responsibilities

统一 `skill(name, path?)` SHALL 只负责在当前 Agent 上下文中加载授权指导和资源，不暗中启动模型或嵌套工具循环。需要隔离专业过程的任务 SHALL 由已注册业务 Agent 承担，通过 `agent.invoke` 委派并复用共享 Runner；专业 Agent SHALL 在自己的上下文中使用同一个 skill 工具、声明的模型配置及授权工具。一个 Agent 可复用多个 Skill，一个 Skill 可被多个 Agent 使用，新增技能 MUST 不要求新增逐技能执行器。

专业任务的技能正文、参考资料和工具过程 MUST 不自动返回主 Agent；回传 SHALL 遵守业务结果、证据和未完成事项契约。直接入口的预加载 MUST 保持无额外模型调用，世界单次生成及摘要 MUST 不因技能加载增加主 Agent、审稿或结果压缩调用。独立执行 MUST 不形成另一套模型、权限或用量观测通道。上下文 compact SHALL 属于运行时内部维护：直接加载独立提示词并在达到阈值时调度，不经过 skill 工具、不作为业务技能发布，也不要求业务 Agent 具有 skill 权限。

#### Scenario: Professional agent uses a skill privately within its task

- **WHEN** 主 Agent 委派专业任务，子 Agent 加载技能及引用资料并使用工具完成工作
- **THEN** 这些材料留在子任务上下文，主 Agent 只接收约定结果；加载本身不调用模型，专业模型调用统一记入运行时根用量账本

#### Scenario: Simple task only needs local skill guidance

- **WHEN** 当前 Agent 可以在已有上下文内完成任务，仅需加载专业指导
- **THEN** 经统一 skill 工具直接加载，不强制创建子 Agent 或额外专业模型调用

#### Scenario: Runtime compaction does not load a business skill

- **WHEN** 运行时准备执行上下文压缩，包括当前 Agent 没有 skill 权限的情况
- **THEN** 直接读取固定版本的内部提示词，不调用 skill 或新增模型可调用入口；真正压缩调用仍使用公共模型、外发授权、用量及 Hook 边界，业务 Skill 的统一入口保持不变

### Requirement: Skills do not grant authority

技能声明和正文 MUST 不授予工具、源码目录、受众或外发权限；工具声明至多收紧已有授权。技能资源 MUST 限于当前授权包并接受路径、文件大小和内容外发检查。服务 MUST 不执行技能附带脚本，不允许技能引用开发者私有技能目录或任意宿主路径。

Skill SHALL 能提供已获授权 CLI 的用途及参数指导，由 Agent 经统一 exec 自主选择调用；加载 Skill MUST 不自动执行命令，也不新增程序、操作或目录权限。CLI 可用范围 SHALL 仍由可信配置及运行时授权决定，MUST 不因技能包含命令示例或 allowed-tools 声明而扩大。

#### Scenario: Skill explains an authorized CLI

- **WHEN** 当前 Agent 已获 CodeGraph 查询授权，并加载相关用法指导
- **THEN** 可根据目标经 exec 选择获准查询，Skill 加载本身不运行 CLI、不新增逐命令工具，也不改变现有权限

#### Scenario: Skill asks for a forbidden tool

- **WHEN** 技能正文或工具声明要求执行未授权命令、附带脚本，或访问密钥
- **THEN** 不增加工具、程序、操作或目录权限，操作被拒绝，不能借 exec 绕过限制

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

问答及主 Agent 的技能指导 SHALL 允许不影响正确结论的题外展开、角色发挥、联想和建议，不以无发散或严格短答作为通用完成条件。核心答案准确且补充内容不误导时 SHALL 允许通过；确定的游戏规则仍须准确，不把创作或建议冒充可操作的既有玩法。

真正缺少资料时，Skill SHALL 允许明确标注的推测或假设，并指导区分已核实事实与未知事项；MUST NOT 以一律拒答代替有帮助的解释，也不得以“推测”为名掩盖与已有证据矛盾的规则。复用现有答案及未决事项，不新增推断字段、审稿模型或固定调查流程。需要中文名称时 SHALL 优先利用可用的公共名称资料，不凭内部标识编造译名或在 Skill 中硬编码评测题的映射。

世界描写技能迁移 SHALL 保持允许合理补白的创作目标，区分真实事实冲突、误导操作与一般文风问题；未逐项列出的景物细节 MUST 不单独成为拒绝理由。技能升级 MUST 不改变地理规则、内容键或已发布正文，事实结构验证与文风审读 SHALL 分开记录。

#### Scenario: Helpful conversational elaboration

- **WHEN** 问答已准确说明玩家所问规则，并以角色口吻延伸联想或给出不歪曲规则的建议
- **THEN** 不因内容超出最短答案而拒绝结果或要求删减；涉及确定门槛、扣费、奖励及成功保证的补充仍须符合真实玩法

#### Scenario: Missing material permits a clearly qualified inference

- **WHEN** 决定性资料确实无法取得，Agent 在已确认事实之外给出明确标注的推测
- **THEN** 不因推测本身拒绝答案；说明依据或假设及未核实部分，不冒充确定规则，也不自动将尚未完成的原问题标为 completed

#### Scenario: Natural descriptive addition

- **WHEN** 描写增加符合环境的松脂气息或局部岩缝且不违背既定事实
- **THEN** 不因输入未逐项列出该细节而拒绝，继续按结构和业务事实校验

#### Scenario: Invented actionable exit

- **WHEN** 描写明确承诺一个规则未提供的可进入暗道
- **THEN** 验收将其视为玩法误导而不是单纯文风偏好，不通过架构迁移放宽该业务约束
