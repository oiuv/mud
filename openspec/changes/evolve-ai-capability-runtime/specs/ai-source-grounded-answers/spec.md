# Spec Delta

## Purpose

让游戏规则问答能够围绕玩家目标自主调查授权的最新源码，追踪影响结论的入口和依赖，验证条件与数值并提供可核查证据；无法完成时明确说明实际缺口，避免片段检索造成误答或过早放弃。

## ADDED Requirements

### Requirement: Investigate the requested game behavior

问答 SHALL 识别目标武功或绝招以及学习、解锁、施展、消耗等所问行为，定位对应入口。发现只描述其他阶段的代码时 SHALL 继续寻找相关入口，不能把施展条件等同于学习条件。同名对象影响结论且无法由上下文消歧时 SHALL 请求澄清。

#### Scenario: Learning question finds only perform logic

- **WHEN** 玩家询问学习条件，首次结果仅包含施展时的内力与武器检查
- **THEN** Agent 继续调查传授、解锁及其相关依赖，不将施展检查直接作为学习答案

#### Scenario: Ambiguous technique name

- **WHEN** 同名绝招对应不同门派且没有足够上下文
- **THEN** 询问必要的门派或武功信息，不任意选择一个并宣告完成

### Requirement: Follow relevant dependencies and resolve gaps

调查 SHALL 按证据追踪关键调用、继承、宏、配置、传授入口、分支和替代路径。未命中、局部截断或资料冲突 SHALL 成为后续调查依据；仍有授权且可行的调查路径和预算时 MUST 继续。不得以要求开发者为每题编写规则接口代替源码调查，也不得执行源码获取答案。

#### Scenario: Contribution threshold is indirect

- **WHEN** 授艺入口调用共享检查函数，贡献要求又来自头文件常量
- **THEN** Agent 定位并读取这些依赖，再解释正确条件和例外，而不猜测阈值

#### Scenario: Documentation disagrees with code

- **WHEN** 旧文档与当前源码条件不同
- **THEN** 回读相关当前源码并核对适用入口，按证据说明差异，未解决冲突不包装为确定结论

### Requirement: Validate semantic completion and grounded claims

完成结果 MUST 核对实体与入口、关键条件、数值、阈值与实际扣除、相关替代路径，以及影响结论的未决问题。每项确定规则 SHALL 关联本次授权读取的证据；仅存在引用或模型自称正确 MUST 不作为充分验证。缺少关键证据时 SHALL 返回缺口供继续调查，实际无法补全时明确未完成。

#### Scenario: Threshold differs from cost

- **WHEN** 代码要求内力至少 60，但成功后只扣除 30
- **THEN** 答案分别说明门槛和消耗，不混为一个数字，并引用支撑两项结论的证据

#### Scenario: Alternative learning path exists

- **WHEN** 另一授权入口允许满足不同条件的学习方式
- **THEN** 与问题相关的替代路径被解释，不将首次发现的路径说成唯一条件

#### Scenario: Fabricated citation

- **WHEN** 候选结果引用未由本次授权工具读取的文件或行
- **THEN** 不作为成功结果交付，要求补查或明确证据缺失

### Requirement: Current evidence with deployment limits

证据 SHALL 带有 scope、相对路径、行范围、内容 hash 和读取时刻；可信部署 revision 可用时 SHALL 记录。索引只作为定位线索，确定结论 MUST 根据当前读取内容验证；文件变化导致证据不一致时 SHALL 重读或报告变化。源码规则 MUST 不被冒充为正在运行的驱动版本或玩家实时状态。

#### Scenario: Stale search index

- **WHEN** 搜索定位结果与回读的文件内容不同
- **THEN** 使用当前可核对的内容重新调查，不沿用旧片段中的数值

#### Scenario: Deployment revision unknown

- **WHEN** 可以回答源码规则但无法确认游戏已加载相同版本
- **THEN** 诊断明确证据对应源码快照，不承诺运行中的对象或当前玩家必然满足条件

### Requirement: Evidence access precedes presentation filtering

玩家与管理员 SHALL 使用各自授权范围，私密资料 MUST 在进入模型前被排除。内部结果 SHALL 保留答案、证据和不确定项；管理诊断可查看授权路径，玩家展示 MUST 使用符合角色的游戏表达，不泄露内部路径、函数、工具或异常原文。

#### Scenario: Player asks about restricted content

- **WHEN** 所需资料仅允许管理员查看
- **THEN** 玩家请求不读取该资料，返回符合游戏语境的说明，而不是先读取再仅隐藏引用

### Requirement: Honest incomplete outcomes without premature refusal

实际遇到权限限制、必要资料缺失、实时信息缺失、需要澄清或预算耗尽时 SHALL 区分原因，保留已验证部分和待查项；不能填入无依据数字。仅首次搜索无结果或问题跨文件 MUST 不作为拒答依据。完成率 SHALL 单独评估，谨慎拒答不能替代可完成任务的正确答案。

#### Scenario: Authorized dependency cannot be found

- **WHEN** 已执行合理的替代查询仍缺少决定性依赖，且没有可行路径
- **THEN** 明确指出缺失信息和已确认范围，不编造完整条件

### Requirement: Human-verified task evaluation

验收 SHALL 使用至少 20 个有人工核对答案、必要证据和预期终态的固定问题，覆盖跨文件贡献、宏/继承、学习与施展区别、多条路径、门槛与扣除、旧文档冲突、同名消歧、首次无命中及真实不可完成情况。可回答核心题的关键条件、数值和证据 MUST 正确；自动假模型测试 MUST 不被当作真实模型自主调查的证明。

#### Scenario: Real-model acceptance

- **WHEN** 在另行授权的目录、外发许可和调用预算内执行真实评测
- **THEN** 分别报告准确率、完成率、无依据结论、延迟与调用数；任一核心条件错误或可回答题被无故拒答均不通过对应任务

#### Scenario: Only offline tests completed

- **WHEN** 工具循环和安全测试通过但尚未完成真实模型固定题评测
- **THEN** 明确标记源码能力效果验收未完成，不宣称已经证实准确自主回答或正式开放
