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

调查 SHALL 按证据追踪关键调用、继承、宏、配置、传授入口、分支和替代路径。未命中、局部截断或资料冲突 SHALL 成为后续调查依据；请求仍有效且有授权、可行的调查路径时 MUST 继续，不以固定模型/工具次数或累计任务时长结束。上下文达到模型窗口阈值时 SHALL 按压缩契约继续原调查。不得以要求开发者为每题编写规则接口代替源码调查，也不得执行源码获取答案。

#### Scenario: Contribution threshold is indirect

- **WHEN** 授艺入口调用共享检查函数，贡献要求又来自头文件常量
- **THEN** Agent 定位并读取这些依赖，再解释正确条件和例外，而不猜测阈值

#### Scenario: Documentation disagrees with code

- **WHEN** 旧文档与当前源码条件不同
- **THEN** 回读相关当前源码并核对适用入口，按证据说明差异，未解决冲突不包装为确定结论

#### Scenario: Internal skill identifier has a public name mapping

- **WHEN** 答案需要把技能内部标识转换为玩家可读名称，配置仓库的公共字典存在相关映射
- **THEN** 经现有源码工具查询必要映射并保留证据，准确区分不同技能；未找到映射时说明名称尚未核实，不凭相似标识编造中文名称

### Requirement: CodeGraph-first navigation with verified source evidence

源码调查 SHALL 优先使用已配置且适用的 CodeGraph 定位符号及关系，source.search/read SHALL 保留为不可用、漏检、不适用时的兜底及必要补读。优先策略 MUST NOT 强制每题反复调用无效索引或禁止模型依据当前信息直接选择合适方法。关系图 SHALL 仅作为定位线索；同名函数、继承和动态调用的实际目标仍须结合当前源码判断，MUST NOT 宣称 C 解析器能完整证明 LPC 语义。

CodeGraph 查询 SHALL 经统一 exec 入口进行，Agent SHALL 根据目标自主选择管理员授权的查询操作，不要求每题固定先调用 explore 或遍历全部命令。源码过滤、当前读取及证据登记 MUST 不因入口统一而取消，CLI 输出及调用成功 MUST 不代替原证据和语义准确性验收。

#### Scenario: Agent chooses a focused graph query

- **WHEN** Agent 已知函数名称，需要定位定义或查找调用者，且相关操作已获授权
- **THEN** 可直接经 exec 选择 query、node 或 callers 等适用查询，无须先重复 explore；结果仍须遵守源码及证据边界

#### Scenario: Current source is returned with graph navigation

- **WHEN** exec 的 CodeGraph 查询已通过现有安全读取返回相关当前原文，并登记行范围、hash 和证据关联
- **THEN** Agent 可直接使用该证据，不被强制对同一片段再次调用 source.read；最终引用、版本及提交检查保持不变

#### Scenario: Ambiguous indexed symbols

- **WHEN** 同名函数或近似解析产生多个候选调用目标
- **THEN** Agent 根据文件、对象及相关原文消歧，不把第一条关系当作实际调用；必要时使用文本搜索和读取补查

#### Scenario: LPC extension or syntax is not covered

- **WHEN** .lpc 文件未收录，或 C 解析器未识别影响结论的 LPC 结构
- **THEN** 报告索引覆盖局限并允许回退读取，不以缺少节点认定实现不存在；扩展名映射也不作为完整 LPC 支持的证明

### Requirement: Validate semantic completion and grounded claims

完成结果 MUST 核对主体、动作与入口，以及与原问题相关的关键条件、数值、阈值与实际扣除、替代路径和影响结论的未决问题。内部完成契约 SHALL 保留主体/动作、入口、逐条结论与证据和未决事项，MUST NOT 要求每个任务填满固定分类表或为不相关类别补写占位结论。每项确定规则 SHALL 关联本次授权读取的证据；结构合格、仅存在引用或模型自称正确 MUST 不作为语义正确的充分验证。缺少关键证据时 SHALL 返回缺口供继续调查，实际无法补全时明确未完成；不得通过缩小核查范围省略影响所问结论的条件或依赖。

NPC 与主 Agent 的玩家规则正文和受审查结论 SHALL 来自同一份模型输出的带证据段落，MUST NOT 要求模型分别撰写两份事实答案。程序 SHALL 仅按原顺序拼接正文、提取同源结论并隐藏证据元数据，MUST NOT 再次改写事实。无害角色描写、联想和建议可以保留；原条件、数值、必要证据和缺依赖验收标准 MUST 不因呈现方式变化而降低。

#### Scenario: Player text and grounded conclusions share one source

- **WHEN** NPC 或主 Agent 提交包含规则段落及证据关联的候选答案
- **THEN** 玩家正文与受审查结论使用相同的规则文字、条件和数值，程序只拼接并隐藏证据元数据，不生成第二份事实表述；角色表达保留，证据仍通过原授权读取、版本及提交检查

#### Scenario: Focused question does not require a fixed checklist

- **WHEN** 问题只涉及一个明确检查，当前授权读取已支撑该检查的完整结论，且没有影响它的未决依赖
- **THEN** 结果保留主体/动作、入口及逐条结论与证据，不因缺少不相关类别的调查记录而要求补查；答案不将局部检查结论扩展为整个行为必然成功

#### Scenario: Structurally valid result is semantically wrong

- **WHEN** 候选结果结构合格且引用来自真实读取，但遗漏影响所问行为的条件或给出错误数值
- **THEN** 不以格式或引用检查通过认定答案正确；固定题评测按原条件、数值和必要证据标准判定该题未通过

#### Scenario: Harmless elaboration preserves a correct answer

- **WHEN** 核心问题的条件、数值、必要证据和终态正确，回答还含题外展开、角色发挥、联想或建议，且没有歪曲规则或误导玩家
- **THEN** 该题可通过，不因发散、篇幅或额外调查本身判失败；耗时和调用数单独记录，角色创作或建议不作为确定规则的无依据断言计数

#### Scenario: Elaboration invents actionable rules

- **WHEN** 核心结论正确，但补充内容给出错误门槛、扣费、虚构奖励或把局部条件满足说成整个行为必然成功
- **THEN** 按实质玩法误导判未通过，不以允许发散为理由豁免确定规则的真实性与证据要求

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

证据 SHALL 带有配置仓库身份、相对路径、行范围、内容 hash 和读取时刻；可信部署 revision 可用时 SHALL 记录。索引只作为定位线索，确定结论 MUST 根据当前读取内容验证；文件变化导致证据不一致时 SHALL 重读或报告变化。源码规则 MUST 不被冒充为正在运行的驱动版本或玩家实时状态。compact 后 SHALL 仍可核验原证据，MUST 不将摘要中的路径或自称已读转成真实读取记录，关键条件、数值及未决冲突 MUST 保留。

#### Scenario: Stale search index

- **WHEN** 搜索定位结果与回读的文件内容不同
- **THEN** 使用当前可核对的内容重新调查，不沿用旧片段中的数值

#### Scenario: Stale symbol line range

- **WHEN** CodeGraph 的旧行号已不对应当前目标符号
- **THEN** 重新核对定位或回退搜索，不把旧行号下的其他代码标成该符号的已验证证据

#### Scenario: Deployment revision unknown

- **WHEN** 可以回答源码规则但无法确认游戏已加载相同版本
- **THEN** 诊断明确证据对应源码快照，不承诺运行中的对象或当前玩家必然满足条件

#### Scenario: Investigation continues after compaction

- **WHEN** 跨文件调查达到上下文阈值并完成 compact
- **THEN** 继续处理原待查项，条件/数值和引用仍关联本次原始授权记录；压缩不能把搜索线索改成已读证据，也不能将未决冲突标成已解决

### Requirement: Evidence access precedes presentation filtering

玩家与管理员的源码调查 SHALL 使用同一配置仓库及统一敏感排除，不维护各自的源码目录权限。私密资料 MUST 在搜索或读取时被排除，不能先送入模型再仅过滤最终显示。内部结果 SHALL 保留答案、证据和不确定项；受限管理诊断可查看证据路径，玩家展示 MUST 使用符合角色的游戏表达，不泄露内部路径、函数、工具或异常原文。源码范围简化 MUST 不改变知识库受众权限或玩家会话隔离。

#### Scenario: Investigation requests sensitive data

- **WHEN** 玩家或管理员的调查需要被统一排除的私密配置、玩家数据或日志
- **THEN** 源码工具均不读取或外发这些资料，按真实缺口处理；玩家说明使用游戏语境，不因管理员诊断入口放开读取

#### Scenario: Cross-directory dependency is ordinary source

- **WHEN** 调查沿调用链从武学目录进入 NPC、公共检查、头文件或框架源码，且这些文件均在配置仓库内并未被排除
- **THEN** 可继续读取并核对依赖，不因目录不同或玩家与管理员身份不同而要求新增源码权限配置

### Requirement: Honest incomplete outcomes without premature refusal

实际遇到权限限制、必要资料确实缺失、实时信息缺失、需要澄清、不可恢复故障或取消时 SHALL 区分原因，保留已验证部分和待查项；不得把未知数值当作已核实事实。真正缺资料时 MAY 提供明确标注的推测或假设，说明依据或假设条件及未核实部分，MUST NOT 与已取得的证据矛盾。推断 SHALL 复用现有答案和未决事项，不伪造证据、不新增专用字段或审稿模型。终态 SHALL 按原目标的完成情况判定，附带推测 MUST 不自动补齐决定性证据或玩家实时状态。仅首次搜索无结果、问题跨文件、固定次数或累计时长 MUST 不作为拒答依据。完成率 SHALL 单独评估，谨慎拒答不能替代可完成任务的正确答案。

#### Scenario: Authorized dependency cannot be found

- **WHEN** 已执行合理的替代查询仍缺少决定性依赖，且没有可行路径
- **THEN** 明确指出缺失信息和已确认范围；可补充与已知证据一致且明确标注的推断，但不将完整条件或假设数字写成已核实事实

#### Scenario: Qualified inference is useful without pretending certainty

- **WHEN** 资料确实不足，答案准确保留已知事实和未决事项，并将补充解释明确标为推测或条件假设
- **THEN** 不因存在推测本身判未通过，不将该推测计作冒充事实的无依据断言；仍核对它与已知证据是否一致，以及原问题所需的终态和确定结论

#### Scenario: An inference label does not excuse a contradiction

- **WHEN** 回答虽然标注“推测”，却给出与已读取规则矛盾的条件、数值或成功保证
- **THEN** 仍判为实质错误；只在开头说明不确定、后文却把未知值肯定化，也不满足明确标注要求

### Requirement: Human-verified task evaluation

验收 SHALL 分开记录 Agent 功能/机制与回答效果。本轮能力交付 SHALL 有相关回归和授权真实链路的证据；核心结论准确、证据真实且不误导时，解释遗漏、非关键细节或表达不足 MAY 留待后续优化，不作为能力交付的统一阻塞条件。错误数值、规则、影响结论的关键条件遗漏或误导性结论 MUST 仍记为缺陷，MUST NOT 以阶段划分将其标成正确。权限、证据真实性与版本、取消及业务提交要求 MUST 保持，能力验收不改变运行时完成契约。

后续完整效果验收 SHALL 使用至少 20 个有人工核对答案、必要证据和预期终态的固定问题，覆盖跨文件贡献、宏/继承、学习与施展区别、多条路径、门槛与扣除、旧文档冲突、同名消歧、首次无命中及真实不可完成情况。可回答核心题的关键条件、数值和证据 MUST 正确；自动假模型测试 MUST 不被当作真实模型自主调查的证明。旧题、原始结果及缺陷记录 SHALL 保留，尚未通过的完整质量项 MUST NOT 因能力交付被直接勾选通过。

#### Scenario: Noncritical omissions do not block capability delivery

- **WHEN** 相关回归与代表性真实调查链路通过，答案核心结论和必要依据正确，但缺少不改变结论的补充解释或非关键细节
- **THEN** 可验收已证明的 Agent 能力，将遗漏另记为效果优化；不改写原回答、旧评分或宣称完整题集全部通过

#### Scenario: A critical omission is not a presentation issue

- **WHEN** 答案遗漏决定能否学习的关键门槛、写错扣除值，或将未核实规则断言为事实
- **THEN** 该回答仍记为实质缺陷，不作为正确样本或改称普通细节缺失；若同时暴露证据、权限、取消或提交机制失败，对应能力仍不能通过

#### Scenario: Real-model acceptance

- **WHEN** 在用户授权的真实模型调用、目录和外发范围内执行固定题评测
- **THEN** 分别报告准确率、完成率、无依据结论、延迟、调用数、compact 用量及每个成功任务的估算费用；任一核心条件错误或可回答题被无故拒答均不通过对应质量项，不用减少调用数代替任务完成质量，也不将质量未完成写成能力链路未经验证或反之

#### Scenario: Only offline tests completed

- **WHEN** 只有工具循环和安全测试通过，尚无真实模型调查链路记录
- **THEN** 明确标记真实能力验收及效果验收尚未完成，不宣称已证实自主调查能力或正式开放

#### Scenario: Representative capability evidence is not full quality acceptance

- **WHEN** 相关回归和代表性真实任务已验证能力链路，但完整固定题质量评测尚未完成或仍有缺陷
- **THEN** 分别记录能力通过的范围及效果待优化项；可交付已验证能力，保留未通过质量项和实质错误，不宣称全题正确、实服验收通过或自动开放玩家入口

#### Scenario: CLI migration is evaluated without relabeling old results

- **WHEN** 评测统一 exec 下的真实 CodeGraph 查询并与 source.search/read 比较
- **THEN** 使用相同题集版本、源码快照及模型参数，记录实际 CLI 操作、版本、答案和证据质量、模型轮次、检索及总耗时；旧 context 包装报告保留并单独标注，不冒充真正 explore 或新入口的验收，不因命令可用降低原质量标准

#### Scenario: Dictionary coverage creates a new evaluation version

- **WHEN** 固定题加入公共名称字典，或按允许明确标注推断的口径复核旧答案
- **THEN** 含字典的题集另存版本，保留原题、原始源码及旧报告；同条件比较使用相同快照，不能混算新旧资料范围。旧答案的复核另记口径和结论，不改写原文、不豁免已知事实错误，实际验收后才勾选完成
