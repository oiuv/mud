# Spec Delta

## Purpose

提供可发现、可复用且有明确授权和单次操作边界的 AI 工具，使不同业务共享知识检索、文档及源码读取和授权 CLI 调用等能力并准确记录用量，同时阻止模型越权访问数据、任意执行脚本或代码，以及绕过业务层修改游戏状态。

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

模型和可信业务代码复用工具时 SHALL 使用同一参数验证、权限、用量观测、取消、Hook 和单次结果限制，前置 Hook 调整参数后 MUST 重新验证和授权。结果 SHALL 包含可关联的调用 ID、安全错误类别及可恢复性；非法参数、未知工具、单次故障超时、取消、未授权、无匹配、文件变化和部分结果 SHALL 可区分，非法尝试 SHALL 记录诊断但 MUST 不伪造实际外部调用或收费。实际执行的调用 SHALL 在成功或失败时均具有结束记录；未执行的拒绝 MUST 不伪造执行结果。相同调用 ID MUST 不重复执行，相同 ID 的不同内容 MUST 报冲突。单轮多工具请求 SHALL 对每项独立授权。取消 MUST 终止运行，不作为普通可恢复错误继续调用；累计工具次数 MUST 不单独导致任务终止。

#### Scenario: Mixed authorized and unauthorized calls

- **WHEN** 同一轮同时请求公开知识检索和无权读取的源码
- **THEN** 每项分别判定，无权操作不执行，合法结果也不能成为额外授权依据

#### Scenario: Duplicate tool call identity

- **WHEN** 模型再次返回已经处理的调用 ID
- **THEN** 同内容返回已有结果或明确重复状态，不再次执行；不同内容返回冲突

#### Scenario: Recoverable tool error guides investigation

- **WHEN** 搜索无匹配、结果被截断或文件在读取时发生变化
- **THEN** Agent 获得可区分的有界结果并能在有效授权内调整查询或重读，不将这些状态统一解释为资料不存在

#### Scenario: Cancellation stops waiting but not the underlying operation

- **WHEN** 底层操作不支持强制停止，运行在等待期间取消或该单次操作发生故障超时
- **THEN** 明确记录取消或超时，不交付该操作的迟到成功，不声称底层线程或外部请求已被终止；取消时不启动新操作，单次可恢复超时则反馈给有效任务调整方法

### Requirement: Reusable knowledge retrieval with scoped egress

知识检索 SHALL 保留 BM25、向量融合、重排和故障回退，并供多个 Agent 或程序直接复用。候选资料、缓存及结果 MUST 按受众和权限隔离；发送外部向量或重排请求前 MUST 完成资料外发校验，相关调用及已知用量 MUST 纳入根账本，不隐藏在本地工具计数中。

#### Scenario: Restricted candidate in a public query

- **WHEN** 玩家查询可能匹配仅供管理员查看的资料
- **THEN** 该资料不进入玩家候选、缓存结果或外部重排请求

#### Scenario: Remote retrieval unavailable

- **WHEN** 向量或重排调用失败而本地授权知识可用
- **THEN** 返回有界的本地回退结果，保留证据来源和降级状态

### Requirement: Single-repository source access with sensitive exclusions

源码搜索和读取 SHALL 默认启用，以可信部署配置中的单一仓库根目录为边界；本项目默认根目录 SHALL 为当前 MUD 仓库，并可被显式配置覆盖或通过全局开关关闭。初版 MUST NOT 要求逐目录、逐 Agent 或玩家/管理员分别配置源码范围；工具调用 SHALL 使用仓库相对路径和有界查询，不能自行选择根目录。统一工具授权 SHALL 保留，不因源码默认启用向无关业务增加工具。

回答问题所需的源码片段 SHALL 可发送给当前配置的模型，当前仓库已授权使用配置的 Qwen；此授权 MUST 不被解释为整库上传、任意地址外发或读取仓库外文件。密钥、环境私密配置、玩家数据、日志、数据库、版本库内部数据、生成文件及服务私有运行资料 MUST 对所有源码调用统一排除，包括实际配置的数据及诊断路径；不能仅依赖默认目录名。

本游戏公共名称字典 `data/e2c_dict.o` SHALL 作为精确文件例外，通过现有 source.search/read 获取回答所需片段，并允许经统一模型入口外发。例外 MUST 仅解除该公共文件的目录及扩展名过滤，不开放其他 data 文件或全部 .o 文件，不覆盖实际私有运行目录、仓库边界及链接等检查。读取 SHALL 保留来源和版本证据，不整份预加载、不执行其内容、不增加专用工具或权限配置框架；源码全局关闭仍须生效。

#### Scenario: Default deployment

- **WHEN** 本项目服务使用默认源码配置启动，具有源码工具能力的 Agent 调查一个跨目录问题
- **THEN** 可搜索和读取仓库内未被排除的源码及其必要依赖，无需另加目录或角色授权；不预加载或上传整个仓库

#### Scenario: Repository root is explicitly overridden

- **WHEN** 部署配置指定另一游戏的仓库根目录
- **THEN** 搜索和读取仅使用该目录与统一排除规则，不回读本项目默认目录，也不能由请求参数扩大范围

#### Scenario: Source access is explicitly disabled

- **WHEN** 部署通过全局开关关闭源码能力
- **THEN** NPC 和主 Agent 均不能搜索或读取源码，已有公开文档问答仍可用，委派或技能不能重新开启该能力

#### Scenario: Necessary source egress

- **WHEN** Agent 为回答问题读取了仓库内未被排除的相关源码片段
- **THEN** 可经统一模型入口将必要片段发送给当前配置模型，不需逐文件再次授权，不获得整库上传或任意外发能力

#### Scenario: Public name dictionary uses existing source tools

- **WHEN** Agent 需要查询配置仓库内 data/e2c_dict.o 的技能名称映射
- **THEN** 可用现有搜索和读取工具取得所需片段及版本证据，并发送给当前配置模型；同目录其他私密文件和其他 .o 文件仍不可读，不能借链接或改根目录绕过检查

#### Scenario: Alternative repository has no public dictionary

- **WHEN** 显式指定另一游戏仓库且其中没有该公共字典
- **THEN** 不回读本项目字典、不编造映射，其他授权源码调查仍可进行；源码全局关闭时也不能用字典例外恢复读取

#### Scenario: Secret discovery attempt

- **WHEN** 玩家或管理员调用尝试直接读取、搜索或借助链接发现被排除的私密资料
- **THEN** 内容、结果、计数、文件名和错误均不泄露这些资料，管理员身份也不放宽源码工具的统一排除

### Requirement: Filesystem boundary integrity

搜索枚举和内容读取 MUST 验证实际访问对象仍位于授权范围，拒绝绝对路径、目录穿越、UNC/设备路径、Windows ADS，以及通过符号链接、目录联接、reparse point 或硬链接绕过隔离。无法可靠确认最终访问对象及文件替换竞争安全性时 MUST 拒绝访问，不仅依赖路径字符串前缀。

#### Scenario: Link or replacement escapes the root

- **WHEN** 授权目录内的路径指向范围外对象，或在校验和读取之间被替换
- **THEN** 不返回范围外内容，返回安全拒绝或文件变化结果

#### Scenario: Unsupported safe-open guarantee

- **WHEN** 当前平台无法证明文件访问满足隔离要求
- **THEN** 关闭受影响的源码访问并给出受限诊断，不降级为不安全读取

### Requirement: Bounded current evidence and untrusted content

搜索和读取 SHALL 限制扫描文件数、字节、结果数、行范围、返回规模和执行时间；词面搜索回退 SHALL 使用字面量查询，不执行任意正则或 Shell。截断 MUST 明确标记，读取 SHALL 返回来源范围、行号、内容 hash 及读取时刻。资料和注释 MUST 仅作为证据，不能改变工具权限或运行指令。

#### Scenario: Search reaches a bound

- **WHEN** 搜索达到文件数或时间上限
- **THEN** 返回部分结果标记，不声称整个范围没有其他匹配

#### Scenario: Instruction embedded in source

- **WHEN** 读取内容要求忽略规则、读取密钥或执行命令
- **THEN** 内容保持资料身份，不改变权限，不产生相应未授权操作

### Requirement: One configured CLI execution tool

服务 SHALL 通过唯一的 `exec(program, args)` 工具调用管理员配置并授权的 CLI；`program` SHALL 为已配置的程序别名，`args` SHALL 为参数数组而非 Shell 命令字符串。程序入口、允许的操作、工作目录及简要用法 SHALL 由可信部署配置绑定，模型 SHALL 仅获得有效授权内的程序及操作说明，并自主选择适合目标的调用。新增授权程序或子命令 MUST 不要求新增模型工具或命令列举工具，不引入 MCP 或另一套执行框架；知识检索、源码读取和 Agent 委派 SHALL 保持各自契约。

CLI 调用 SHALL 复用既有工具授权、参数验证、Hook、用量观测、取消、单次故障超时和输出限制。授权 MUST 覆盖操作及参数中影响访问目标、仓库或输出位置的选项，不能只检查程序名。Hook 修改参数后 MUST 重新验证，调用前拒绝 MUST 不启动程序。模型 MUST 不能通过参数指定其他程序、工作目录、任意脚本、管道、重定向或命令拼接；Hook 放行 MUST 不被描述为操作系统沙箱或取消既有资料边界。

#### Scenario: Authorized commands share one entry

- **WHEN** 管理员配置并授权多个 CLI 程序或查询操作
- **THEN** 模型得到获准程序和操作的说明，并通过同一个 exec 工具选择调用；不为每个程序或操作发布独立 Tool，未授权操作仍不可执行

#### Scenario: Program or arguments exceed the configured authority

- **WHEN** 模型请求未配置的程序、未授权操作，或通过参数覆盖绑定的仓库、工作目录或访问目标
- **THEN** 调用在启动前被拒绝，不因程序名已获授权就执行越界参数，不泄露配置或敏感异常原文

#### Scenario: Hook rejects or changes a CLI request

- **WHEN** 调用前 Hook 拒绝请求，或将参数改为超出既有授权范围的值
- **THEN** 拒绝时不启动程序，参数改写后重新验证及授权；Hook 不能扩大可用程序、操作或目录范围

#### Scenario: CLI operation is cancelled or times out

- **WHEN** CLI 运行期间请求被取消或发生单次故障超时
- **THEN** 记录对应状态，不交付迟到成功；取消后不启动新操作，不将可恢复的单次超时当作任务总期限，也不把停止等待冒充外部进程已经终止

### Requirement: Configured read-only CodeGraph integration

CodeGraph SHALL 作为统一 exec 的首个 CLI 接入，替代原 codegraph.explore 模型入口，MUST NOT 并列发布两个入口或为其各子命令新增 Tool。服务 SHALL 支持管理员授权的 explore、query、callers、callees、impact、node、files 查询；模型可自主选择获准操作，但 MUST 不能改变绑定的仓库根目录。explore SHALL 实际调用同名 CLI 操作，不得以 context 代替。服务 MUST NOT 向模型开放建库、同步或修改配置等索引管理操作。查询触发的工具内部缓存维护不受此限制；服务 SHALL 调用授权接口，不干预工具内部行为，不要求索引零写入。调用 SHALL 复用既有授权、Hook、取消、单次超时和结果限制；发现或配置启用 MUST NOT 自动绕过源码全局关闭或工具授权。

Windows 启动适配 SHALL 支持正常 npm/pnpm 安装提供的 .cmd 入口，包括 PATH 解析及管理员显式指定的路径，不要求用户寻找包内 Node/JS 文件。原生程序及可信 argv 配置 SHALL 保持可用。模型查询 MUST 作为数据参数完整传递，不得经批处理解释变为附加命令、变量展开或其他操作；支持该启动入口 MUST 不向模型开放 Shell，取消及单次故障处理仍遵循既有契约。

CodeGraph 的候选路径、符号、关系、正文和诊断 SHALL 遵守现有仓库边界与敏感排除，在进入模型前完成过滤。统一 CLI 调用 MUST 不取消该结果适配；适配器 SHALL 复用当前文件安全读取与证据登记，可在一次 exec 调用中返回原文和证据。索引关系、CLI 原始输出或命令成功本身 MUST NOT 被登记为已核验的源码事实。

#### Scenario: Configured CodeGraph query

- **WHEN** 部署已启用 CodeGraph、仓库存在索引且当前 Agent 获得相应 CLI 和源码能力授权
- **THEN** 模型通过 exec 调用获准查询，得到过滤后的定位线索及适用的当前源码证据，无需 Shell 权限，也不再看到独立的 codegraph.explore 入口

#### Scenario: Each authorized CodeGraph operation reaches the matching command

- **WHEN** 管理员授权 explore、query、callers、callees、impact、node、files，模型选择其中任一查询
- **THEN** 执行对应 CLI 操作，保留其查询语义并经过原有资料过滤；explore 不被替换为 context，其他操作不被隐式改成 explore

#### Scenario: CodeGraph cannot bypass disabled source access

- **WHEN** 源码全局关闭或当前 Agent 无相应调用授权，即使本机已安装 CodeGraph
- **THEN** 不能经 exec 查询源码，调用和能力说明遵守同一授权范围；其他已授权且不依赖源码的功能保持可用

#### Scenario: Standard Windows installation launches successfully

- **WHEN** 管理员启用本机正常安装的 CodeGraph，命令从 PATH 解析到 .cmd 或配置为带空格的 .cmd 路径
- **THEN** 能通过 exec 调用获准查询，不因扩展名拒绝，也不要求改用包内入口；适用的原文经过读取及证据登记，实际 Windows 验收覆盖启动、超时和取消

#### Scenario: Query contains shell metacharacters

- **WHEN** 合法查询含中文、空格、引号或 Shell 元字符
- **THEN** CodeGraph 接收到原查询参数，不执行附加命令、不展开查询中的环境变量，也不改变已获准的操作和绑定仓库；Hook 拒绝时不启动外部程序

#### Scenario: Query performs internal cache maintenance

- **WHEN** 获准的 CodeGraph 查询触发工具自身缓存维护
- **THEN** 不因内部维护拒绝查询或拦截其实现，也不因此向模型开放建库、同步或修改配置等管理操作

#### Scenario: Private or out-of-root indexed candidate

- **WHEN** 索引返回被排除或越出仓库的路径、符号或关联边
- **THEN** 不将相关名称、内容、统计或异常原文交给模型，不因已进入索引而放宽现有读取边界

#### Scenario: Index or query is unsuitable

- **WHEN** CodeGraph 不可用、缺少索引、未命中或不能可靠覆盖查询所需的 LPC 语法
- **THEN** 反馈可区分的状态，保留 source.search/read 回退，不把工具缺失或索引无结果解释为代码不存在，也不由模型自动安装或重建索引

### Requirement: No model-visible mutation or arbitrary execution

模型工具集 MUST 不提供文件写入、删除、任意 Shell/脚本或代码执行、任意网络请求或直接修改游戏数值能力。管理员授权的 CLI 调用 SHALL 遵守相同边界，MUST 不因提供 exec 就开放通用 Shell 或代码解释器。业务结果的必要持久化 SHALL 由可信业务代码在验证后完成，不接受模型提供的任意写入目标。技能发现和 Agent 委派 MUST 服从相同边界。

#### Scenario: Request to modify game source

- **WHEN** 玩家或模型提出修改绝招条件并保存源码
- **THEN** 没有可执行该动作的工具，源码和游戏数值保持不变
