# Spec Delta

## Purpose

为 AI 运行提供覆盖直接、委派及上下文压缩路径的生命周期观测及有限干预，使调用用量、失败和策略决策可追溯，同时确保回调不能扩大权限、篡改记账或取消状态以及泄露敏感资料。

## ADDED Requirements

### Requirement: Consistent lifecycle coverage

生命周期 SHALL 覆盖运行开始、模型调用前后、工具调用前后、业务提交前、正常结束和错误结束。直接、委派、compact 及兼容入口 MUST 使用相同边界；委派事件 SHALL 可关联父子运行，向量、重排及压缩请求 SHALL 同样具有模型边界观测。compact SHALL 可区分操作类型并记录压缩前后 token、结果和用量，不将压缩成功冒充业务运行完成。实际进入执行的操作 SHALL 在成功、失败、超时或取消时具有一次关联的后置事件；前置拒绝 SHALL 标明未执行。运行错误 SHALL 可由 run_error 诊断，每次运行 MUST 只有一个携带最终状态的 run_end，不重复宣告业务成功。

#### Scenario: Direct request invokes retrieval

- **WHEN** 直接问答调用知识工具并触发外部向量和重排
- **THEN** 可按同一根请求关联模型、工具及用量事件，无需先经过主 Agent

#### Scenario: Delegated leaf fails

- **WHEN** 叶子业务执行失败
- **THEN** 记录带父子关联的失败事件，主 Agent 收到受限失败信息，不把它记录为成功提交

#### Scenario: Operation fails or is cancelled

- **WHEN** 已进入模型或工具执行的操作抛出异常、超时或被取消
- **THEN** 后置事件仍记录对应状态、调用关联和已知实际用量，不漏记结束、不伪造成功；迟到结果不产生第二次结束或成功提交

#### Scenario: Pre-call intervention rejects execution

- **WHEN** 调用前校验或 Hook 拒绝操作
- **THEN** 记录未执行及安全原因，不执行处理函数，不声称已发生外部调用或收费

#### Scenario: Compaction succeeds or fails

- **WHEN** 达到上下文阈值并实际发起压缩模型操作
- **THEN** 按同一根请求记录关联的前后事件、实际用量与压缩结果，不提前发业务 completed；失败时不覆盖原上下文

### Requirement: Observers cannot change execution

普通观测 Hook SHALL 仅接收按目的脱敏的只读事件；失败或超时 SHALL 隔离并计数，不能改变权限、阻断业务或递归触发自身。Hook SHALL 来自受信任部署配置，模型和技能 MUST 不能安装回调。显式启用的受限思考诊断 SHALL 与普通观测数据分离，不广播原始思考内容。

#### Scenario: Metrics observer raises

- **WHEN** 指标回调抛出异常
- **THEN** 业务按原策略继续，记录受限观测故障，不反复调用故障回调

### Requirement: Restricted intervention and mandatory revalidation

干预 Hook SHALL 仅允许放行、拒绝、取消及修改契约明确允许的字段。before_model SHALL 最多追加通过外发检查的有界上下文，不替换整份消息历史或系统安全协议；before_tool SHALL 仅调整该工具契约允许的参数。after_model、after_tool 和 before_commit SHALL 只能放行、拒绝后续使用或取消，不覆盖原始响应、事实、证据、用量或业务结果；run_error 和 run_end SHALL 仅观测。身份、权限上界、受众、关联身份、用量、取消状态、配置的模型容量及单次操作故障期限 MUST 不可由 Hook 扩大或重置。干预前后 MUST 检查参数、大小、外发、授权、取消及完整请求的 token 容量；追加内容需要压缩时 SHALL 先按上下文契约处理，不能发送越限请求。必需干预超时或失败 MUST 阻止相关操作。同一事件 SHALL 按固定注册顺序处理，拒绝或取消 MUST 不被后续放行覆盖。运行时的受控 compact MUST 不赋予 Hook 任意历史替换权限。

#### Scenario: Intervention broadens a source request

- **WHEN** 回调将工具参数改为未授权目录或加入越权上下文
- **THEN** 最终检查拒绝执行，不接受回调结果作为新的授权

#### Scenario: Mandatory pre-call hook fails

- **WHEN** 必需的调用前策略回调超时或抛出异常
- **THEN** 不发起该模型或工具操作，并返回可诊断的策略失败

#### Scenario: Hook attempts wholesale replacement

- **WHEN** 回调要求替换完整系统消息、工具证据或提交结果
- **THEN** 拒绝该未声明操作，不用改写后的内容绕过完成验证或伪造来源

#### Scenario: Later hook allows a denied operation

- **WHEN** 一个回调或硬性权限检查已拒绝操作，另一个回调返回允许
- **THEN** 拒绝仍然有效，处理函数不会执行，不按异步完成先后覆盖决定

### Requirement: Commit-time cancellation and accurate cost reporting

提交前 SHALL 重新确认业务身份、调用方有效性、取消状态和结果有效性，具有业务租约的任务 SHALL 另行核验租约；拒绝或取消 MUST 阻止新的业务成功提交。需要持久化的运行 SHALL 在业务提交结果确定后才记录 run_end；生成候选时 MUST 不提前宣告 completed。调用后拒绝 MUST 不被解释为已经发生的模型调用未收费，也不能声称撤销已经完成的外部操作。

#### Scenario: Cancellation before persistence

- **WHEN** 模型返回后、保存历史或正文前请求被取消
- **THEN** 不推进成功历史、关系或正文状态，仍保留实际模型用量

#### Scenario: Persistence fails after generation

- **WHEN** 候选结果已经通过完成验证，但可信业务提交失败
- **THEN** 记录提交失败及唯一的失败终态，不先发成功终态，不通过再次生成掩盖提交失败

#### Scenario: Terminal observer fails after commit

- **WHEN** 业务已成功提交，run_end 观测回调发生异常
- **THEN** 隔离观测故障，不改变已确定的业务成功、不重复提交或发出第二个 run_end

### Requirement: Minimal and non-secret audit data

审计 SHALL 记录关联 ID、Agent/模型/技能/策略版本、终态、证据标识、延迟、用量和错误类别。默认日志与普通观测回调 MUST 不包含密钥、完整提示词、玩家私密历史、原始源码或思考内容。必要的原始资料检查 SHALL 仅交给明确授权的本地干预回调；提供方实际返回的思考字段可按受限诊断契约记录。Hook MUST 不接收原始模型客户端、数据库连接或完整密钥配置。

#### Scenario: Provider error contains private text

- **WHEN** 提供方异常正文含密钥、提示词或玩家资料
- **THEN** 仅记录受限错误类别和关联信息，不将正文写入日志或玩家响应

### Requirement: Explicit protected reasoning diagnostics

开发与测试 SHALL 能通过可信本地配置或诊断命令显式开启提供方思考字段记录，写入独立受限文件或明确启用的开发终端输出。记录 SHALL 关联请求、父子运行、模型调用、模型配置指纹、Skill 版本、工具步骤及最终结果；未返回的思考 MUST 不被补造。普通日志默认 SHALL 只保留元数据；玩家请求、Skill 和模型输出 MUST 不能开启诊断、指定日志路径或取得记录。

思考日志可能包含授权源码或会话资料，SHALL 按敏感运行数据保护，使用 OS 访问权限并排除源码提交、公共网页和模型源码读取范围。记录 MUST 不转储密钥配置、SDK 对象或 SDK 异常原文，MUST 不混入玩家响应、业务成功历史或父 Agent 上下文。诊断开关 MUST 不改变模型执行和上下文保留；写入故障 SHALL 按观测故障隔离，报告安全错误，不重跑模型或改写业务终态。不新增模型可调用工具、Skill 或日志平台。

#### Scenario: Developer enables a local reasoning trace

- **WHEN** 已获授权的开发测试显式开启诊断且提供方返回思考字段
- **THEN** 在受限本地输出中可关联查看思考、工具步骤和最终答案；普通观察者和游戏客户端均不获得思考正文

#### Scenario: Trace is disabled or requested by a player

- **WHEN** 本地诊断未开启，或游戏请求试图开启诊断及选择文件
- **THEN** 不产生思考正文诊断输出、不扩大权限；当前 Agent 仍按模型协议保留后续调用所需字段

#### Scenario: Diagnostic output cannot be written

- **WHEN** 已启用的诊断输出发生写入故障
- **THEN** 报告安全的观测错误且不递归泄露原文，业务按原结果和策略继续，不为补日志重复模型调用或提交

#### Scenario: Reasoning appears plausible but contradicts evidence

- **WHEN** 思考记录提出了看似合理但没有源码依据的推断
- **THEN** 仅将其作为质量诊断线索，仍按原证据与标准答案判断结果，不能替代完成验证或效果验收
