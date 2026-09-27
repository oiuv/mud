# AI 架构规范对应检查

检查日期：2026-09-26—27。本表对应本变更的 7 份增量规范、53 项 Requirement，不是正式规范同步或归档。测试名是可复查的证据入口，不表示自动测试能证明所有模型语义和实服行为。历史硬预算、JSON compact 和合成题的旧记录不覆盖当前规范。

## 证据口径

当前阶段：**功能实现收尾，回答效果另行优化**。维护者已要求停止本轮内容调优；新增架构、Tool、Skill、Hook 相关功能回归 **170 项全部通过（21.374 秒）**，未新增真实模型调用。维护者随后提供 NPC 回复、重连后新请求及幻境显示/移动记录，并确认阶段提交；实测证据与未覆盖范围见[阶段提交记录](validation.md#2026-09-27维护者游戏实测与阶段提交)。七项效果任务与已知错答保留但不阻塞功能交付；9.6 尚未覆盖全部场景，整个变更不提前完成或归档。此前自动回归见[功能收尾记录](validation.md#2026-09-27功能层收尾效果优化另行开展)。

当前进度 **73/81**：保留原完成历史，9.3 的代表性真实直接/委派、上下文隔离及成果交付证据现已补齐，相关 70 项回归通过；不将核心正确样例中的补充事实缺陷或旧质量题改为全文通过。9.5 的文档对应检查已完成；9.6 实服及七项后续效果任务独立保留。脚本归并后 Windows/WSL 全量各 **681 项**无失败（672/667 通过、9/14 跳过），LPC/UDP **166 检查**通过，属于此前执行的记录。入口迁移见 `test_script_entrypoints.py` 及 [脚本指南](../../../ai/scripts/README.md)。

Max 完整题批次此前已取消；本次只新增两个聚焦能力样例，共 39 次模型调用，均已结束，没有在途请求。原部分结果不改写、不计全题通过。详情见 [真实能力记录](validation.md#2026-09-27代表性真实链路收尾)、[脚本整理记录](validation.md#2026-09-27分阶段验收与脚本目录整理)及[文档收尾记录](validation.md#2026-09-27文档对应与分阶段交付收尾)。

### 既往记录（保留当时进度）

最新补充：进度 **66/76**。增加单次模型等待配置与短请求边界回归，Windows/WSL 全量各 **676 项**无失败（667/662 通过、9/14 跳过）。独立 Max / CodeGraph 180 秒等待配置的两题取得答案，核心规则及证据核对无缺项，但实际最长单次调用未超过 60 秒，不据此认定超时已修复或更改默认值。同配置完整 20 题已启动，未收齐前不统计完整质量通过；固定题、直接/协调与实服验收仍缺完成证据。详见[本阶段记录](validation.md#2026-09-27单次等待回归与完整题集启动)。

当前补充：进度 **66/76**。NPC v9 / 主 Agent v8 白话规则指导复测已收齐 Flash 文字/图两组各四题；开发源码/玩家表达审读分别 3/4、1/4，缺依赖错答、名称证据缺项及实现术语泄露仍未解决，完整质量验收不勾选。Max 同配置四题也已结束，两题单次 I/O 超时无最终答案，其余两题仍有内容/证据缺陷；共 12 题次、147 次模型调用，无本批后台在途请求。Windows/WSL 最新全量各 **674 项**无失败（665/660 通过、9/14 跳过）；固定题全量、直接/协调及实服验收仍待完成。详见[本阶段记录](validation.md#2026-09-27白话规则指导与跨题复测)及[源码效果报告](../../../docs/architecture/ai-source-dictionary-20260927.md#白话规则表达的同题复测)。评分和结构回归不充当语义裁判。

### 历史阶段

14.4 推断指导完成时，源码/NPC/主 Agent 分开表达已知事实和明确标注推断，复用段落及终态，没有新增语义裁判。Windows/WSL 当时全量各 668 项无失败（659/654 通过、9/14 跳过）；新版字典题集另有 38 项专项通过、17 文件快照核对通过。详见[该阶段记录](validation.md#2026-09-27明确标注推断与新版评测准备)。

14.3 公共名称字典已验收时，进度 **65/76**。源码工具支持长行命中附近片段及真实行列证据，NPC/主 Agent 共享精确文件例外与原边界。Windows/WSL 全量各 661 项无失败（652/647 通过、9/14 跳过）；最终评测导出补充后专项各 78 项无失败（WSL 跳过 1 项 Windows 测试）。实际字典只读查询确认名称映射，零模型调用。详见[本阶段记录](validation.md#2026-09-27公共名称字典与长行证据)。

当前补充：14.1、14.2、15.1–15.4 完成，进度 **64/76**。统一 exec 与七项 CodeGraph 实际查询、Windows `.cmd` 启动和取消/超时通过；源码 Skill v17 只更新入口用法。Windows/WSL 均运行 647 项，分别 638/634 通过、9/13 跳过，无失败。Linux 原生 CodeGraph CLI 尚未实测通过，平台范围与失败探针见[本阶段记录](validation.md#2026-09-27统一-execcodegraph-七项查询与配置精简)。公共字典、推断指导、真实效果和实服记录仍待验收；以下为历史结果。

最新补充：单份答案契约已实施，13.1、13.2 已验收，进度 **58/66**。NPC/主 Agent 共用 `parts` 转换，按原文生成玩家正文和内部结论；外部协议、证据与提交检查不变。源码 Skill v15 / NPC v7 / 主 Agent v6 已同步。Windows / WSL 各 626 项无失败（分别 617 / 615 通过，9 / 11 平台跳过）。Flash 五次代表题运行的已关联结论与正文逐字一致，但缺依赖题仍猜测计算、左右互搏题仍有条件表达和证据缺项，13.3 及其他质量项不计通过。复核同时发现题集曾误将 `count` 译为“算术”，已获确认更正标准文字并注明勘误；原题、源码快照及旧报告不变，不据错误译名评分。见[单份答案复测记录](../../../docs/architecture/ai-codegraph-20260927.md#单份答案契约与代表题复测)。

此前补充：CodeGraph 接入与双平台回归完成，12.1、12.2 已验收，进度 **56/63**。Windows / WSL 各 617 项无失败（分别 608 / 606 通过，9 / 11 平台跳过）；实际 CLI 的 LPC 隔离验证通过。工具内部维护不受干预，管理员配置与 Hook 授权职责保留。Flash 的 CodeGraph/文字搜索完整 20 题均已结束，但仍有超时、证据缺项与确定规则错述，不能通过质量验收。主 Agent 格式提示已修正且专项/全量回归通过，真实代表题仍有正文计算错误；Max 对照另行记录。见[CodeGraph 阶段记录](../../../docs/architecture/ai-codegraph-20260927.md)。

此前补充：原生 JSON Object 与简化指导已实施，11.1、11.2 完成，进度 **54/60**。Windows / WSL 各 600 项无失败（分别 591 / 589 通过，9 / 11 平台跳过）；Flash/Max 真实 JSON/工具/思考链路、隔离业务及文本 compact 联调通过。业务回归不等于源码语义验收，固定题效果仍在单独核对；见[本轮记录](../../../docs/architecture/ai-json-object-20260927.md)。以下旧分母和结果均为历史记录。

当前补充（2026-09-27）：单仓库源码任务 10.1–10.4 已验收，进度 **52/57**。后续修正引用反馈、长请求终态竞态，并将真正旧版/当前版升级演练纳入全量测试。最新 Windows / WSL 各 **589 项**，分别 **580 通过 / 9 跳过**和 **578 通过 / 11 跳过**，无失败。LPC/UDP 166 检查、无限世界 141287 检查、冷重启与遭遇基线通过；50 项规范映射及 31 个引用测试模块核对通过。默认仓库访问及离线通过不代表源码回答质量或实服通过；旧 scope、角色授权及旧任务分母保留为历史，不覆盖现行规范。详见[阶段记录](../../../docs/architecture/ai-runtime-validation.md)。

- Python 测试路径均相对于 `ai/tests/`。完整 Windows 516 项（508 通过、8 Linux 专属跳过）、Ubuntu/WSL 516 项（505 通过、11 Windows 专属跳过）；两平台互补，跳过不计通过。具体执行时序见 [阶段记录](../../../docs/architecture/ai-runtime-validation.md)。
- LPC/UDP 166 检查、世界 141287 检查、遭遇基线通过；这些是隔离驱动和假模型，不是当前实服验收。
- `verify_upgrade.py` 在两个平台实际运行旧提交/当前源码的临时数据升级、回退及再升级；不是在当前代码中模拟旧版本。没有真实 API 请求或生产服务操作。
- 表内“机制覆盖”表示离线合同/回归覆盖；真实调查正确性、委派收益、文风与实际游戏行为仍受下文未完成项约束。
- 本次收尾复跑 Windows 全量：516 项、508 通过、8 Linux 专属跳过，100.870 秒。两次严格校验（当前变更 / 全库 8 项）及 `git diff --check` 均通过；核对 48 项规范标题均有映射、27 个引用测试模块和 5 个文档链接目标存在。没有把这些结构检查当作效果验收。
- 后续对照工具及进度落盘完成后，全量增加至 527 项：Windows 519 通过/8 跳过、Ubuntu/WSL 516 通过/11 跳过，均无失败；详见阶段记录。合成真实协调诊断未完成，问题保留在下文 9.3，不以这些自动测试替代效果验收。
- 后续原目标绑定、逐步诊断和引用反馈修正后，全量 542 项：Windows 534 通过/8 跳过、Ubuntu/WSL 531 通过/11 跳过，无失败。固定 16 文件已获外发授权并开始真实测试；单题数值正确仍不替代整套效果和无依据断言审核。
- 最终包含 Skill v7 的同规模全量再次通过（Windows 145.538 秒、WSL 125.620 秒）。20 题已通过基线/独立补测取得实际结果，但发现实质错答；[质量复核](../../../docs/architecture/ai-source-eval-20260926.md)保留错误、部分修复与未通过项，不声明源码能力已可上线。
- 本轮思考字段适配和受限诊断后，全量 **566 项**：Windows 557 通过/9 平台跳过（138.408 秒），WSL 555 通过/11 平台跳过（112.512 秒）。8 条真实思考记录已验证多轮关联，但该题第 9 次调用超时、没有最终答案；不能当作 7.3/9.3 的质量通过证据。任务当前 **47/51**。
- 后续 Skill v8 与范围聚焦回归全量 **567 项**：Windows 558 通过/9 跳过（131.048 秒），WSL 556 通过/11 跳过（113.603 秒）。三题真实复测仍有过度调查、题外泛化及缺依赖未收尾，原质量门槛不变。等待最小证据契约修订确认期间，独立复跑 LPC/UDP **166 检查**、无限世界 **141287 检查**、冷重启/异步发布/兜底及遭遇基线，均通过；5 个 LPC 文件格式检查通过。50 项 Requirement 映射及 30 个引用测试模块存在性核对通过，结构核对不证明语义效果，仍为 **47/51**。

## 规范到测试与文档

下面三段为早期验证沿革，保留当时进度；后面的对应表已按当前 53 项 Requirement 更新。

最新补充：确认最小契约后完成 7.5，进度 **48/53**。Windows / WSL 全量各 **570 项**（分别 561 通过 / 9 跳过、559 通过 / 11 跳过），专项 121 项通过。Skill v9 同配置三题仍有题外边界、执行顺序和 compact 前容量失败，5.5、7.3 / 9.3 不计通过；[质量复核](../../../docs/architecture/ai-source-eval-20260926.md#最小证据契约与-skill-v9-同配置复测)记录具体证据。新的 53 项分母来自已确认的 5.5 / 7.5 两项任务，不改写此前完成历史。

随后已离线复现并修复 compact 的数字证据重复注入问题；专项 100 项、Windows / WSL 各 **571 项**无失败（分别 562 / 560 通过，9 / 11 跳过），真实合成压缩后续行条件/数值/引用正确。它不代表源码问答质量通过，进度仍为 **48/53**；详见[容量复现与修复](../../../docs/architecture/ai-source-eval-20260926.md#compact-容量失败的复现与修复)。

2026-09-27 再修复正常历史分段挤占摘要输出空间的问题。专项 **101 项**、两平台全量各 **572 项**无失败（Windows 563 通过 / 9 跳过，WSL 561 通过 / 11 跳过）。重放已有 25 轮业务历史，仅新增三次真实摘要调用，成功压缩并到达下一业务调用边界；没有执行最终业务回答，不能据此通过源码质量验收。任务保持 **48/53**，详见[长历史复测](../../../docs/architecture/ai-source-eval-20260926.md#2026-09-27真实长历史与分段输出预留)。

长期说明简称：**架构** = [ai-service.md](../../../docs/architecture/ai-service.md)，**通信** = [ai_client_d.md](../../../docs/daemons/ai_client_d.md)，**源码** = [ai-source-access.md](../../../docs/architecture/ai-source-access.md)，**评测** = [evals/README.md](../../../ai/evals/README.md)。标题采用规范原名，方便逐项核对。

### ai-agent-runtime（12 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Independent capabilities with equivalent entry paths | `test_delegation.py`、`test_npc_runtime.py`、`test_world.py` | 架构：直接/委派复用业务；真实效果待验 |
| Goal-driven investigation and completion | `test_runtime.py`、`test_runtime_progress.py`、`test_source_investigation.py` | 架构、源码：缺口反馈/改查；任务状态不以私有思考作为证据 |
| Bounded main-agent coordination | `test_router.py`、`test_delegation.py` | 架构：单层顺序、简单目标零委派、受理不等于完成 |
| Non-escalating authority and isolated context | `test_access.py`、`test_delegation.py` | 架构、源码：权限交集、身份/会话与缓存隔离 |
| Isolated professional execution with bounded result handoff | `test_delegation.py`、`test_router.py`、`test_compaction.py` | 架构：检查实际父子消息；真实成本/质量待验 |
| Goal execution with shared usage and cancellation | `test_runtime.py`、`test_long_requests.py`、`test_usage.py` | 架构、通信：超过旧限制续行，共享取消及未知用量 |
| Provider reasoning continuity within an agent | `test_reasoning.py`、`test_npc_runtime.py`、`test_delegation.py` | 架构：可选协议字段、多轮/候选续行、compact、计量及玩家/父子隔离 |
| Model-specific context configuration and compaction | `test_context_window.py`、`test_compaction.py`、`test_source_investigation.py` | 架构：配置窗口、文本摘要、原证据/工具组及续行 |
| Explicit outcomes and trusted business commits | `test_runtime_lifecycle.py`、`test_npc_runtime.py`、`test_world.py` | 架构：提交后唯一终态，不用候选冒充成功 |
| Authorized delivery by verified result reference | `test_results.py`、`test_router.py`、`test_compaction.py` | 架构：原样交付、未提交/跨身份拒绝、压缩后关联 |
| Replay safety without automatic autonomous recovery | `test_request_cache.py`、`test_router.py`、`test_world.py` | 架构、通信：重放不生成，世界保留原持久恢复 |
| Uniform extension contract | `test_runtime_probe.py`、`test_portable.py`、`test_tools.py` | 架构：新 Agent/Tool/Skill 接入清单及独立装配 |

### ai-request-transport（5 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Explicit routing with separate business validation | `test_router.py`、`test_portable.py`、`test_lifecycle.py` | 通信：默认关闭主路由，旧请求不隐式分类 |
| Per-capability deadlines and work capacity | `test_long_requests.py`、`test_delegation.py`、`test_world.py` | 通信、架构：业务容量独立，单次 I/O 非总期限 |
| Long-running request liveness and cancellation | `test_long_requests.py`、`ai/scripts/verify_lpc.mjs` | 通信：续约/丢包/取消/迟到；实服断线待验 |
| Trusted authority binding at the entry | `test_access.py`、`test_router.py`、`test_source_config.py` | 通信、源码：本机 UDP 不是管理员认证 |
| Agent response correlation and replay limits | `test_router.py`、`test_request_cache.py`、`test_long_requests.py` | 通信、`ai/scripts/README.md`：独立客户端、超限及去重 |

### ai-runtime-hooks（6 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Consistent lifecycle coverage | `test_runtime_lifecycle.py`、`test_tools.py`、`test_compaction.py` | 架构：成功/故障/拒绝/压缩及父子事件 |
| Observers cannot change execution | `test_runtime.py`、`test_runtime_lifecycle.py` | 架构：不可变事件、异常/超时隔离 |
| Restricted intervention and mandatory revalidation | `test_runtime.py`、`test_runtime_lifecycle.py`、`test_source_tools.py` | 架构：限制改写、重验权限、拒绝优先 |
| Commit-time cancellation and accurate cost reporting | `test_npc_runtime.py`、`test_world.py`、`test_usage.py` | 架构：取消/事务失败/终态观察故障不重复提交 |
| Minimal and non-secret audit data | `test_runtime_lifecycle.py`、`test_source_diagnostic.py` | 架构、源码：安全错误和受限元数据；可信回调不是沙箱 |
| Explicit protected reasoning diagnostics | `test_reasoning_trace.py`、`test_reasoning.py` | 架构、评测：可信本地显式开启、OS 权限、调用/Skill 关联、无字段兼容及故障不重跑 |

### ai-service-modules（7 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Preserve NPC knowledge and persistence | `test_npc_runtime.py`、`test_access.py`、`test_long_requests.py` | 架构：摘要/关系/去重、澄清不提交、检索回退 |
| Reusable model calls without NPC context | `test_json_output.py`、`test_model_tools.py`、`test_runtime_probe.py`、`test_diagnostics.py`、`test_reasoning.py` | 架构：显式 JSON Object/默认文本、输出容量与格式开销、工具/思考续行，不使用 Schema 或修复模型 |
| Configuration continuity | `test_config_example.py`、`test_script_entrypoints.py`、`test_context_window.py`、`test_source_config.py`、`test_lifecycle.py`、`test_upgrade.py` | `ai/.env.example`、架构、脚本指南：精简配置与用途命名、路径覆盖、旧 CLI 迁移不扩权、主 Agent 默认关闭、旧缓存策略 |
| Portable service with optional game integration | `test_portable.py`、`test_runtime_probe.py` | 架构：双平台无 MUDLIB/替代配置；另查反向导入 |
| Explicit game and service ownership | `test_world.py`、`test_portable.py`、`test_delegation.py` | 架构、通信：游戏权威、可选世界共享目录 |
| Preserve world narration data and lifecycle | `test_world.py`、`test_upgrade.py` / `verify_upgrade.py`、世界驱动回归 | 架构：内容键/租约/额度/正文、正常一次生成 |
| Data-preserving staged rollout and rollback | `test_npc_runtime.py`、`test_lifecycle.py`、`test_upgrade.py` / `verify_upgrade.py` | 架构：固定旧版/当前版临时数据、保持原能力的四阶段迁移与源码开启的缓存拒绝；实服部分待验 |

### ai-skill-runtime（6 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Independently maintained professional skill packages | `test_skills.py` | 架构、`ai/skills/`：五包中文指导，按场景提供必要方法，不统一强制流程/清单/正反例 |
| Discoverable and progressively loaded skills | `test_skills.py`、`test_runtime_probe.py` | 架构：目录授权、一工具、新包无分支、零额外预载调用 |
| Skill loading and professional execution have distinct responsibilities | `test_skills.py`、`test_delegation.py`、`test_compaction.py` | 架构：Skill 不启动模型，专业过程隔离，compact 非 Skill |
| Skills do not grant authority | `test_skills.py`、`test_access.py` | 架构：权限只能缩小、包边界、脚本不执行 |
| Versioned and reproducible skill loading | `test_skills.py`、`test_world.py` | 架构：版本/hash 固定、必需指导失败不旁路 |
| Preserve creative freedom within business facts | `test_world.py`、`world-narration` 正反例 | 架构：允许合理补白；真实文风/玩法误导仍须审读 |

### ai-source-grounded-answers（8 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Investigate the requested game behavior | `test_source_investigation.py`、真实题集学习/施展/同名题 | 源码、评测：机制覆盖，真实自主定位待验 |
| Follow relevant dependencies and resolve gaps | `test_source_investigation.py`、`test_runtime_progress.py`、真实跨文件题 | 源码、评测：改查/依赖/冲突；不执行源码 |
| CodeGraph-first navigation with verified source evidence | `test_codegraph.py`、`test_codegraph_exec.py`、`verify_codegraph.py`、固定题 CodeGraph 对照 | CodeGraph 阶段记录：统一 exec 对应实际查询、当前源码与证据、同名/过期/漏检回退；真实整体效果仍待验收 |
| Validate semantic completion and grounded claims | `test_answer_parts.py`、`test_npc_runtime.py`、`test_router.py`、`test_source_investigation.py`、`test_source_evaluation.py` | 源码、评测：单份段落原样拼接、同源结论及引用交付；最小契约不要求无关类别，同源/结构/引用有效但语义错误仍不能通过效果评测 |
| Current evidence with deployment limits | `test_source_investigation.py`、`test_source_tools.py`、`test_public_dictionary.py`、`test_compaction.py` | 源码：变更重读、hash/行列范围、原证据续行，不证明已加载 |
| Evidence access precedes presentation filtering | `test_access.py`、`test_source_investigation.py`、`test_source_diagnostic.py` | 源码：读前权限、玩家表达及 OS 本机诊断 |
| Honest incomplete outcomes without premature refusal | `test_answer_parts.py`、`test_source_investigation.py`、`test_router.py`、`test_source_evaluation.py` | 源码、评测：明确标注推断可交付但不升格为事实，缺玩家状态/关键资料保留；全文语义另审，模拟评分不等于效果通过 |
| Human-verified task evaluation | `test_source_evaluation.py`、`test_source_probe.py`、`game-source-questions.json`、`game-source-questions-v2.json` | 评测：原20题/16快照保留，新版只补公共字典；实际回答及人工效果未完成 |

### ai-tool-access（9 项）

| Requirement | 主要验证入口 | 文档 / 边界 |
| --- | --- | --- |
| Trusted discovery separate from authorization | `test_tools.py`、`test_runtime.py`、`test_runtime_lifecycle.py` | 架构：可信包、重名/未授权拒绝、注册表快照 |
| One bounded tool execution contract | `test_runtime.py`、`test_runtime_lifecycle.py`、`test_long_requests.py` | 架构：程序/模型共入口、重验、ID 冲突、迟到结果 |
| Reusable knowledge retrieval with scoped egress | `test_tools.py`、`test_access.py`、`test_npc_runtime.py` | 架构：候选先过滤、缓存隔离、向量/重排账本 |
| Single-repository source access with sensitive exclusions | `test_source_config.py`、`test_source_tools.py`、`test_public_dictionary.py`、`test_source_investigation.py`、`test_router.py`、`test_source_comparison.py` | 源码：默认单仓库、根覆盖、全局关闭、统一私密排除、公共字典精确例外及必要片段外发；固定快照与全库诊断分开 |
| Filesystem boundary integrity | `test_source_tools.py`、`test_source_config.py`（双平台） | 源码：安全打开、链接/替换竞争、无法验证即拒绝 |
| Bounded current evidence and untrusted content | `test_source_config.py`、`test_source_tools.py`、`test_public_dictionary.py`、`test_source_evaluation.py` | 源码：有界字面量搜索/行列读取、部分结果与注入隔离，部分列不计为整行证据 |
| One configured CLI execution tool | `test_exec.py`、`test_codegraph_exec.py`、`test_config_example.py` | 单一 exec、管理员程序/操作配置、Hook 前后校验、取消/超时；旧配置不自动扩权，见 `ai-cli-tools.md` |
| Configured read-only CodeGraph integration | `test_codegraph.py`、`test_codegraph_exec.py`、`verify_codegraph.py` | 七项真实查询、当前源码和证据过滤、源码关闭、缺索引/CLI；NPC/主 Agent 假模型链路见 `test_source_investigation.py`、`test_router.py`；不干预工具内部维护 |
| No model-visible mutation or arbitrary execution | `test_exec.py`、`test_skills.py`、工具注册表检查 | 只有授权 CLI，不提供任意 Shell、写/删或游戏修改；持久化由业务负责 |

## 分阶段交付与当前待办

以下按 2026-09-27 已确认的任务拆分执行；文档对应完成不表示所有机制、模型答案和实际游戏均通过。

| 类别 | 当前证据与边界 | 对应任务 |
| --- | --- | --- |
| 已验证机制 | 双平台 681 项无失败、LPC/UDP 166 检查；覆盖 Tool/Skill/Hook、权限/证据、compact、父子隔离、提交/取消、升级回退和脚本入口。平台跳过不计通过，假模型不证明真实自主调查 | 已完成的实施/回归任务 |
| 真实能力收尾 | 当前配置直达 NPC、主 Agent 自主直接处理及一次真实委派均已完成；核心必要证据、父子独立上下文和成果引用交付核对通过，70 项相关回归通过。补充事实缺陷仍单列，不冒充全文或全部场景通过 | 9.3，已完成 |
| 文档与对应检查 | 7 份规范的 53 项 Requirement 全部对应，39 个测试模块及 68 个本地文档链接目标存在；同步阶段口径、脚本入口与世界恢复顺序，当前及全库严格校验通过。此项只验收对应检查及交付说明，不宣告整项变更完成 | 9.5，已完成 |
| 实际游戏 | 维护者已选择自行测试并提供记录；仍缺 NPC 回复、断线旧回复不投递、世界异步正文及兜底文本的实际操作记录 | 9.6，未完成 |
| 回答效果 | 保留固定题、旧回答和评分；全题质量、检索/路由同条件对照及收益仍待完成，不因非关键解释缺失阻塞已验证能力，也不将实质错误改成通过 | 5.6、7.6、9.7、12.3、13.3、14.6、15.5，未完成 |

仍需保留的实质缺陷包括：必要实现缺失时把猜测公式说成确定规则、未核实的机制解释，以及部分答案暴露内部技能标识/颜色宏。名称映射证据和补充解释缺项分别记录，不将所有缺项混称为错误。修复与复测不得放松证据、权限、取消或提交检查，不为评测题添加专用答案规则。

先交付已验证能力，再按同题同配置优化效果；不据局部样本推算整体准确率、提速或成本收益。既有 Max 全题批次已取消，不自动重跑。运行日志、模型原始输出、数据库、地图生成数据和凭据不纳入源码提交；不自动开放正式入口、同步主规范或归档。

## 分阶段拆分前的验收记录（历史）

以下保留原结果及当时任务编号，不再作为“必须完成全部质量题才能交付能力”的前置要求；当前任务归属以上表和 `tasks.md` 为准。

1. **7.3 / 9.3 真实源码效果**：已由开发阶段对照真实源码建立基准，不再要求游戏维护者核对虚构规则。2026-09-26 用户已明确授权固定 16 源码快照外发，20 题已通过基线/定向补测取得实际结果；不扩大范围，不发送配置或玩家数据，不改正式权限。关键实现缺失时猜公式、调查范围遗漏等实质缺陷尚未解决，整套质量和人工效果验收仍未通过，准确率及每个正确答案成本不得填成已通过。
2. **9.3 直接/协调对照**：`eval_source.py` 已接入直达 NPC 与真实主 Agent 路径，提供逐运行模型/窗口/输出预留、上下文峰值、用量、终态和引用投影，以及同题同配置的离线对照。`test_source_comparison.py` 验证计量不重复、未引用子资料不冒充最终证据、父失败不因子成功通过。实际两批模型运行、回答人工审核和等质比较仍未完成；离线机制测试不替代真实效果。
   - 首次合成真实协调诊断中，子 NPC 提交过成功答案但主过程未结束，运行已被开发者停止，原因尚未查明；完整消费未知、没有自动重跑。已补安全进度输出/持久化，必须继续定位此问题，不能据离线通过宣称主协调已实际验收。
   - 后续离线复现并修复子结论携带私有证据 ID、原样交付提示不完整的问题。新合成样本 `coordinated-handoff-20260926-02.json` 正常完成（160.729 秒、43 次调用），但暴露目标扩张、一次输出截断及文案事实表达问题，不能据此关闭效果门槛；Skill 调整及下一份定向报告须继续复核。详见运行时验收文档的“协调交付引用修复与目标范围复核”。
   - 跨查询证据增量反馈的离线回归已通过，但合成真实报告 `coordinated-evidence-progress-20260926-04.json` 持续调查未交付，开发者已结束并核实无残留进程。最后观测 373 次模型调用不是最终结算，完整轨迹与费用未确定；未自动重跑，不据此宣称优化有效或实际验收通过。
   - 新真实太极剑边界题，Max 直达/委派均正常交付且核心数值正确；协调版仍有无依据机制解释，Flash 提高输出预留仍未收敛。已保存安全轨迹并正常取消未完成诊断，正式配置未改；完整题集、回答审核及等质结论仍未完成。
3. **9.4 实际游戏**：保持原文档能力的临时四阶段升级/回退及源码默认开启的旧缓存拒绝检查，在当前代码上由两平台全量回归重新通过；仍缺实际 NPC 回答、断线后旧回复不投递、房间异步正文和玩家兜底显示记录。不得未经授权重启/回退正式服务或操作玩家数据来补验收。
4. **9.5 最终交付**：本表是对应关系核查，不是所有要求已验收。上述效果/游戏项通过并更新记录后，再复核全量测试、严格规范校验、源码/文档一致性及提交范围；当前不归档、不同步主规范，不提交日志、模型输出、数据库、生成地图或凭据。

源码调查当前还须解决 v9 复测暴露的范围和表达错误；compact 的数字证据重复注入和分段输出预留问题已有复现与修复，但未完成候选缺少依据/阻碍的兜底仍不能冒充诚实收尾。保持原质量标准，不以扩大窗口、去掉证据检查或新增审稿模型替代修复。

## 无限世界的恢复顺序

`add-wuxia-infinite-world` 独立保持 **32/50**，AI 架构任务不代替其验收：

1. 先完成 M2 的 8.2 实际入场/`look` 与 20–30 房间观感、8.3 NPC 问答与场景生成并行及服务退避验证；已有假模型或生成成功率不能替代游戏体验。
2. 再做 M3 的 9.1–9.4：正式区域/过渡/主题与种子、管理命令、查询修复工具、帮助和运维文档。
3. 最后执行 10.1–10.6：多种子连通性、冷热性能、相邻文案/不同玩家路线、AI 关闭与旧入口回退、编译/实玩、清单冻结备份与小范围开放。

不自动开放公共入口，不重生成已发布旧世界；新增玩法仍按该变更逐项实施和记录。
