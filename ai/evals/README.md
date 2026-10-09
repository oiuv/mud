# 源码调查固定题

真实题集保留两个独立版本：`game-source-questions.json`（`--suite game`，兼容默认）为原 20 题、16 份公开源码；`game-source-questions-v2.json`（`--suite game-dictionary`）保留全部原题、原结论、源码 hash 和预期终态，仅补入公共 `data/e2c_dict.o`，并为互搏题追加名称映射证据。新版本仍排除缺依赖题的 `feature/skill.c`，不借新增资料补齐计算实现。后续含字典对照明确指定新版本；旧报告继续用原版本审核，不混算。

题集记录经源码核对的结论、必要证据行列、预期终态及文件 hash/行数。模型答案须逐题审核；涉及实服状态的问题另行核验。

`source-questions.json` 为自动测试及计分器使用的合成夹具，通过 `--suite synthetic` 选择；真实问答效果使用游戏源码题集。

### 2026-09-27 标准答案勘误

经源码复核并获确认，`hubo_threshold` 标准中的“算术等级”更正为“count 技能等级”：`cmds/skill/perform.c:37` 检查 `count`；`kungfu/skill/count.c:19–23` 区分它与算术 `mathematics`，不能混称。只改这一处标准文字，原题、20 题集合、16 文件快照及 hash、证据范围、数值和预期终态均不变，不把具体技能限制扩大为任意杂学。固定快照没有中文名称映射，不要求模型猜中文译名。

更正前报告的题集摘要为 `b6e24269f209f3ac14ad728effbddf34e5026900b4ecab1ac28f57c3e7356657`，更正后为 `378a641b206f3f2c6f2bf1a256291025d84d067af8effc03f75ae513db803073`。保留原报告、原回答及用量，不覆盖或改写摘要来套用新评分。旧说明中“漏掉算术”不能作为缺陷依据，其他表达泛化、证据缺项和无依据肯定分别复核。新题集摘要用于后续评测，旧审核不能直接沿用。

## 覆盖范围

| 题目 | 重点 |
| --- | --- |
| `hong_chan_learning` / `hong_contribution_boundary` | 洪七公：门贡300、侠义80000、打狗棒法60；成功扣300 |
| `hong_effective_force` | 有效内功100，不等于基本内功原始等级100 |
| `hong_repeat_question` | 已学不再扣门贡，但普通问话仍可能耗精神 |
| `dagou_chan_perform_cost` | 打狗缠字诀：内力门槛100、扣50，未缠住也扣 |
| `zhang_chan_learning` / `taiji_learning_vs_perform` | 张三丰传授和太极剑施展条件不能混淆 |
| `taiji_threshold_not_cost` | 太极缠字诀：内力门槛60、扣30 |
| `wang_chan_learning` / `quanzhen_chan_cost` | 王处一门贡200；全真剑施展内力100、扣50 |
| `ambiguous_chan` / `chan_command_routing` | 同名消歧及当前激发武功、继承分发 |
| `wang_alternative_force` | 王处一拜师：两种内功择一80，头文件中的门派限制仍有效 |
| `taiji_skill_vs_special` | 学太极剑法与解锁缠字诀是不同入口 |
| `hubo_threshold` | 左右互搏必须超过100；360免该项随机失误，不代表招式必中 |
| `current_player_unknown` | 源码不能提供当前玩家实际门贡 |
| `learn_help_conflict` | learn 帮助与当前耗精公式不一致 |
| `retry_misspelt_chan` | 从“缠字决”改查真实“缠字诀” |
| `restricted_effective_force` | 排除真实技能计算实现后，不能靠经验补成已证实结论 |
| `hong_no_elder_rank_gate` | 不把其他传授入口的九袋身份条件套给缠字诀 |

## 执行与审核

验收按核心答案、必要证据及终态判断。允许不影响正确结论的题外展开、角色发挥、联想和建议，不因发散、篇幅或额外调查本身判失败；补充内容若虚构门槛、扣费、奖励或成功保证仍属错误。耗时、模型轮次和检索时间单独报告。

资料确实不足时，允许明确标注的推测或条件假设，说明依据或假设条件及未核实部分；不因推测本身拒绝答案。`unsupported_claims` 统计冒充事实的无依据断言，不包含与已知证据一致、始终明确标注的推断。标成“推测”却与已知规则矛盾，或后文把未知值说成确定事实，仍按对应标准判错。审核须看完整玩家正文，不能只看内部有证据的结论；程序不靠关键词判定语义正确。

推断复用 `parts` 的无证据段落，不计入已核实规则，也不代替原题所需的证据、当前玩家状态或预期终态。已知部分准确且如实保留决定性缺口的 `incomplete/needs_input` 可以通过相应缺资料题；可回答题不能借谨慎拒答刷通过率。旧报告按此口径的复核另记结果，不改写旧答案；含公共字典的新快照另存题集版本，不能与原 16 文件题集混算。

CodeGraph 对照使用 `eval_source.py --codegraph --execute --allow-source-egress --report <新报告>`，可配合 `--case`。仅在每题允许的固定文件副本上建立临时索引，不借主仓库索引补齐缺依赖题。省略 `--codegraph` 明确使用文字搜索基线，即使正式环境开关不同；两组须固定模型参数及 Skill 快照。报告保存索引版本、`.lpc` 映射和建库耗时（不计入问答耗时），原有 `runs.calls` 和 `tool_events` 分别保留模型与工具时间。子集和单次提速都不代表完整题集通过。

`python ai/scripts/verify_codegraph.py` 默认预览；加 `--execute --command <程序名、Windows.cmd路径或JSON前缀> --report <新报告>` 可在临时目录验证 `.c/.lpc`、同名函数、动态调用线索与行号漂移，不调用模型或操作正式索引。

在仓库根目录运行。默认预览只读题单，不读取游戏源码、不加载密钥、不调用模型。另提供本机快照核对，确认引用的源码未变化，同样不调用模型：

```sh
python ai/scripts/eval_source.py
python ai/scripts/eval_source.py --check-sources

# 新版仅补公共字典，命令不加载密钥或调用模型
python ai/scripts/eval_source.py --suite game-dictionary --check-sources
```

取得题集中固定源码清单的外发及模型调用授权后，使用已存在的本地报告目录和新的文件名。不会扫描整个仓库，也不读取配置、玩家存档或日志：

```sh
python ai/scripts/eval_source.py --execute --allow-source-egress --report ai/logs/probes/source-suite-01.json
python ai/scripts/eval_source.py --review-template ai/logs/probes/source-suite-01.json --report ai/logs/probes/source-review-01.json

# 含字典版本；文本基线省略 --codegraph，协调路由另加 --route coordinated
python ai/scripts/eval_source.py --suite game-dictionary --codegraph --execute --allow-source-egress --report ai/logs/probes/source-dictionary-01.json
```

可用 `--case taiji_threshold_not_cost` 定向运行；子集不能通过完整 20 题验收。`--repository` 可指定仓库根目录，文件必须与固定 hash/行数一致；变更时先重新核对结论及引用，不自动刷新 hash 来掩盖漂移。源码经过安全只读打开验证，再放入临时目录供同一 NPC Agent/Skill/Tool/Runner 调查；每题各自隔离，受限题不会继承其他题的资料。标准答案只用于报告，不进入模型消息。

修改 Skill 前先复制整份技能目录为基线，修改后再复制候选快照；分别设置进程环境 `SKILLS_DIR` 为两份快照的绝对路径，固定其他模型参数、题目和源码。评测脚本沿用该设置，不强制加载工作区 `ai/skills/`。检查诊断中实际加载的 Skill 版本/hash，不能仅凭报告文件名认定使用了旧版或新版。快照和报告一起放在受保护的忽略目录，测试过程中不修改快照；缺失包不得静默回退到工作区。

没有累计调用/时长硬限，保留单次 I/O、取消及完成检查；已有报告不覆盖，失败批次不自动重跑。源码检查只是本机静态验证，不能当作外发授权；`--allow-source-egress` 只允许这份明确清单，不改变正式服务授权配置。

执行时还会独占新建 `<报告路径>.events.jsonl`，逐步追加模型用量、工具操作参数/结果元数据和完成校验缺口，并即时刷新；中断前的轨迹不再依赖最终答案才能保存。主报告的 `inflight` 只是最近观测，不是最终账单。记录不含工具返回的源码正文、完整模型消息、权限上下文或私有推理；搜索词和委派参数仍可能含业务资料，报告与轨迹都应放在受保护的忽略目录中。

需要分析模型思考时，可另外设置进程环境 `REASONING_TRACE_FILE=logs/probes/source-suite-01.reasoning.jsonl`（相对 `ai/`），或显式开启 `REASONING_TRACE_CONSOLE=true` 在开发终端的 stderr 查看。该受限 JSONL 与默认 `.events.jsonl` 分开，通过 `run_id` / `call_id` 关联同一模型操作；记录实际返回的思考、正文、工具请求、Skill 版本及模型参数指纹，不额外调用模型。关闭记录不影响 `CHAT_REASONING_HISTORY` 所控制的协议保留；开启记录也不自动开启提供方思考模式。未返回字段标为不可用，SDK 故障不转储异常正文。

先创建受 OS 权限保护的日志目录，Windows 核对 ACL，Linux 新文件为 `0600`；内容可能包含源码和会话资料，不放公开目录/源码授权范围，不提交。思考文件采用追加写，固定题对照建议每次选择新的文件名，避免混淆批次。思考可辅助定位误读、遗漏和提示干扰，但不是正确性证据；仍须核对实际答案、源码和终态。详见[受限诊断](../../docs/architecture/ai-service.md#受限思考诊断)。

需要人工结束诊断时，可创建 `<报告路径>.cancel` 空文件（例如 PowerShell：`New-Item ai/logs/probes/source-suite-01.json.cancel -ItemType File`）。探针通过既有 Hook 在模型/工具/提交前触发共享取消，保留已知用量与轨迹，不开始下一题；正在执行的单次 I/O 仍受原超时约束。取消不是固定任务预算，也不代表效果通过。脚本不删除取消标记、不自动重跑；强制终止进程时可能仍有未知费用，不能把最后观测当作最终结算。合成诊断 `verify_source_agent.py` 使用同样的记录和取消方式。

开发者负责先根据真实源码建立并检查基准，不把虚构题的核对工作推给游戏维护者。实际模型运行后，再对照基准检查其回答、必要条件/例外/数值、引用及调查轨迹；与实服状态有关且源码不能证实的部分才需要补充运行证据。最终人工效果验收使用审核表：

- `reviewer`：真实核对者；工具不自动填写。
- `gold_verified`：该题标准结论/必要证据/终态经核对正确才填 `true`；错误应修订题集并重做相应评测，不能改成无条件通过。
- `criteria`：逐项判断实际答案，填 `true` / `false`，不以“有引用”代替语义核对。
- `unsupported_claims`：确定性但无依据的结论数量；没有才填 `0`，未审保持 `null`。
- `notes`：问题、误判和判断依据。

审核表绑定题集及运行报告的内容摘要；更改题目或回答后旧审核不能套用。填写完成再离线计分：

```sh
python ai/scripts/eval_source.py --score ai/logs/probes/source-suite-01.json --review ai/logs/probes/source-review-01.json --report ai/logs/probes/source-score-01.json
```

## 直达与主 Agent 对照

默认 `--route direct` 调用原 NPC 业务；`--route coordinated` 使用真实 `RouterService`，由主 Agent 按需调用同一个 NPC 业务。两者使用相同题单、固定源码、模型配置和专业 Skill，每题均使用新的临时数据。单仓库配置下，主 Agent 与 NPC 共用同一临时源码仓库，可直接调查或按需委派，不以强制工具调用提示词制造委派。题目、标准结论和固定源码/Skill 快照保持不变，排除的依赖不复制进临时仓库。报告 `source_access.mode=pinned_snapshot`、`policy_version=repository-source-v2` 区分本次配置迁移；旧报告的逐 Agent 权限策略不同，不混作同条件对照。全仓库诊断标记 `mode=repository`，也不能替代固定题结果；`--compare` 拒绝范围/策略版本不同的报告。报告记录实际委派次数，不能把“选了协调入口”当作一定发生委派。

第二条路径是额外一批真实模型测试，沿用明确源码外发及模型调用授权；默认预览不调用，已有报告不覆盖、失败不自动重跑。不修改正式 `MAIN_AGENT_ENABLED`、源码授权或游戏入口：

```sh
python ai/scripts/eval_source.py --route coordinated
python ai/scripts/eval_source.py --execute --route coordinated --allow-source-egress --report ai/logs/probes/source-coordinated-01.json
python ai/scripts/eval_source.py --review-template ai/logs/probes/source-coordinated-01.json --report ai/logs/probes/source-coordinated-review-01.json
```

报告的 `runs` 按运行 ID 分开主/子过程，保留模型/窗口/输出预留、每次调用的已知或未知用量、运行时估算的上下文峰值、compact、终态及安全工具轨迹。`budget` 和批次 `total` 已包含子过程，不能再把父子账本相加。上下文峰值不是累计 token 或提供方精确分词；压缩调用也单独标记。

每题 `elapsed_s` 计入业务处理、调查、委派和提交，不计临时夹具部署/服务装配；不是冷启动耗时。每次模型操作的耗时保留在 `runs.calls` 中，不把它们简单相加当作端到端延迟。

执行时每次模型操作结束会输出并保存一条安全进度（`inflight`：Agent、错误类别、该次用量及批次累计账本），不打印提示词、源码或私有推理。完整题目报告在该题结束后保存；`inflight` 只是最近观测，不是最终消费结算。进程被强制杀死时不能把尚未落盘的在途用量当成零，优先创建 `<报告>.cancel` 协作取消；交互终端也可用 Ctrl+C。命令运行器停止不保证 Python 子进程已经退出，须核对该批次的进程和报告终态，不能因观察超时就另起收费批次。

业务完成校验返回缺口时，探针也记录 `completion_check` 安全代码及当前账本，便于区别模型调用成功与业务结果尚未合格；不记录被拒答案或私有过程，不改变实际校验。模型失败日志带本地分类代码，例如 `truncated`，不只报告含义不明的 `ValueError`。

最终原样交付的成果保留子结果的原始依据；主 Agent 汇总结论时，仅展开它实际引用的已提交成果。报告为这些证据增加请求内命名空间，不向父模型回灌源码。未引用的子资料只出现在子运行诊断中，不计入最终答案证据；父任务失败仍算失败，不因子任务成功而通过。人工审核仍须判断被引用成果是否真的支持该条总结。

两份报告可先离线对照；未填审核表时只提供观测数据，正确率和每个正确答案成本保持未知。实际人工审核后传入各自的审核表：

```sh
python ai/scripts/eval_source.py --compare ai/logs/probes/source-suite-01.json ai/logs/probes/source-coordinated-01.json --reviews ai/logs/probes/source-review-01.json ai/logs/probes/source-coordinated-review-01.json --report ai/logs/probes/source-comparison-01.json
```

比较要求相同题集摘要、题目集合、声明的模型/窗口/输出上限及 `model_options_fingerprint`；不混用旧审核。指纹覆盖提供方地址、完整附加参数（包括思考开关）、工具支持模式、思考历史回传配置和单次 I/O 超时，仅保存规范化摘要，不输出地址、附加参数原文或 API 密钥。API 密钥与诊断目的地不参与指纹，轮换密钥或开关诊断不会单独改变模型执行配置身份。缺少有效指纹的旧报告仍可单独审核/计分，但不能认定为同配置对照；不根据当前配置补写历史指纹，也不自动重跑收费任务。

原生 JSON Object 接入后，指纹还包含 JSON 能力声明与模型最大输出容量。JSON 请求不发送 `max_tokens`，运行记录的 `reserved_output_tokens` 才是实际预留；旧报告顶层 `max_tokens` 是文本配置，不能将它解读为新版 JSON 请求的截断上限。修改输出模式或工具反馈后应另建批次，不能与旧版报告称为仅 Skill 变化的同条件对照。

只有两边完整题集均通过，`equal_quality_verified` 才为真，不因更少调用或更低费用推断等质。单次对照不能证明统计显著优势；模型版本、供应商负载和缓存也会影响延迟/费用，必要时另行授权同条件复测，不自动挑选“赢家”。

## 计分口径

正确必须同时满足预期终态、所有结论人工通过、必要行范围由真实引用覆盖、文件 hash 与夹具一致、无无依据结论。只读过文件、搜索命中、程序结束或模型自称正确均不算通过；可回答题拒答也不通过。不强制固定调查顺序或无用调用。

纯澄清题可以不作具体规则断言、直接询问缺少的门派或玩家状态，不要求为凑引用先搜索；其必要证据列表可为空。只要回答同时提出了具体规则或数值，就仍需核对实际读取证据，不能借澄清状态绕过依据检查。

报告分别列出可回答题完成率、全题正确率、存在无依据结论的题目比例、总/平均/P95 耗时、模型调用和 compact 次数、完整分组用量及费用估算。未跑题仍在完整题集分母中；尚未全部人工核对时，正确率、无依据比例和每个成功任务成本为 `null`，不拿已审小样本冒充全套验收。费用包含失败尝试，缺价/缺用量仍未知。

真实题集的 `acceptance_passed` 只表示该组源码快照题全部通过，不证明实服已加载这些版本，也不替代主/子 Agent 对照；合成题通过更不能冒充真实游戏效果。报告保存在被忽略的运行目录，不提交到仓库；只提交题集、工具和脱敏验收总结。

2026-09-26 已获授权开展真实 16 文件测试；首轮 20 题覆盖及发现的实质缺陷见[质量复核](../../docs/architecture/ai-source-eval-20260926.md)。其中原批次中断后进行了独立定向补测，不能包装为一个完整通过批次；Skill v7 的局部改善也不替代全套重新验收。
