# 游戏 AI 服务

独立 Python 服务，通过本机 UDP 为游戏提供 NPC 人设对话、帮助检索、对话摘要、关系记录及幻境场景创作，要求 Python 3.10+。

游戏统一使用 `AI_CLIENT_D` 发送异步请求，`AI_NPC_D` 负责 NPC 的玩家校验与对话展示。Python 在 `main.py:create_server()` 按请求类型注册业务，各业务拥有独立工作容量和期限。

| 模块 | 职责 |
| --- | --- |
| `src/udp_server.py`、`src/protocol.py` | UDP、报文校验、请求关联和并发分发 |
| `src/llm.py` | 模型客户端、单次调用期限和错误处理 |
| `src/npc/` | NPC 人设、会话、记忆、关系及原子持久化 |
| `src/world/` | 冻结房间事实、持久任务和正文发布 |
| `src/agents/router.py` | 通用主 Agent，直接处理目标或按需委派 |
| `src/knowledge_*.py` | BM25、向量混合检索和知识库同步 |
| `src/runtime/`、`src/tools/`、`skills/` | 共用 Agent 执行、工具、专业指导及 Hook |

默认 `ENABLED_MODULES=npc,world` 注册 `chat`、`memory`、`config`、`world_describe` 和 `world_status`。设置 `ENABLED_MODULES=npc` 可不加载世界模块；`WORLD_ENABLED=false` 则保留世界路由并返回停用状态。

主 Agent 默认关闭，设置 `MAIN_AGENT_ENABLED=true` 后注册 `agent_run`，容量由 `MAIN_AGENT_WORKERS` 控制（默认 2）。它仅处理显式请求，不接管现有 NPC 或世界入口。接入方式见 [通信契约](../docs/daemons/ai_client_d.md) 和 [socket 示例](scripts/README.md#独立-socket-接入示例)。

## 独立部署与适配原则

每个服务实例面向一个游戏，使用独立端口、配置和数据目录。其他 MUD 可配置 `HELP_DIR`、`NPC_ROLES_FILE`、`DATA_DIR`、`SKILLS_DIR` 及 `SOURCE_ROOT`，按业务 Skill 调整角色与专业指导。本机 UDP 要求可信游戏端，不提供远程玩家或管理员认证。

不需要文档检索时可设置 `KNOWLEDGE_UPDATE_ENABLED=false` 跳过启动同步；显式建库命令仍可用。世界共享目录仅为启用幻境创作时所需。

### 运行时与开发文档

NPC、摘要、世界及主 Agent 共用 Runner、Tool、Skill 和 Hook。模型负责调查与生成，程序负责权限、证据核验、取消、用量与业务提交。专业委派仅支持单层顺序调用，父子各自管理上下文并共享用量与取消。

NPC 与主 Agent 使用带证据的 `parts` 生成玩家正文；摘要和 compact 使用文本。修改业务协议时须同步代码和 `skills/`，自定义 `SKILLS_DIR` 也须匹配当前格式。

- [架构与接入规范](../docs/architecture/ai-service.md)：执行、委派、提交、compact、用量及升级回退。
- [源码范围配置](../docs/architecture/ai-source-access.md)：仓库访问、公共名称字典、证据核验与可选 CodeGraph。
- [高级配置](../docs/architecture/ai-configuration.md)与[授权 CLI](../docs/architecture/ai-cli-tools.md)：模型、权限及外部程序配置。
- [脚本指南](scripts/README.md)：运维、诊断、验证、性能测试和接入示例。
- [真实源码评测](evals/README.md)：题集、模型调用授权、人工审核及质量与成本对照。

## 启动

以下命令从仓库根目录执行；从其他目录启动时，配置和数据路径仍以 ai 为基准。

~~~sh
python -m pip install -r ai/requirements.txt
# 首次部署复制；已有文件请直接编辑，不要覆盖：
cp ai/.env.example ai/.env
cp ai/config/npc_roles.example.json ai/config/npc_roles.json

python ai/scripts/ops_build_bm25.py
python ai/scripts/ops_build_vectors.py
python ai/main.py -d
~~~

PowerShell 可用 Copy-Item 代替 cp。生产环境不需要 -d。

- .env 自动加载，系统环境变量优先；不会读取游戏的 data/.env。
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` 配置文本生成（NPC、主 Agent、幻境及摘要），采用 OpenAI 兼容接口；默认接入百炼。
- `DASHSCOPE_API_KEY` 供知识库向量和重排共用，分别使用 `EMBEDDING_BASE_URL` 和完整 `RERANK_URL`，不跟随聊天地址。两组密钥不自动回退；使用同一百炼密钥时须分别填写，检索密钥留空时使用本地 BM25。
- 缺少聊天密钥时明确显示离线演示话术，不保存模拟对话、不增加关系。
- 未构建新向量或向量接口不可用时继续使用本地 BM25。
- ops_build_bm25.py 不调用远程 API；ops_build_vectors.py 为缺失文档块生成向量，会使用模型额度。
- 配置在服务启动时读取，修改后重启生效。

## Linux 服务器启动脚本

建议使用固定的普通用户运行，服务器需安装 Python 3.10+、venv 和 util-linux（提供 flock）。
从仓库根目录执行：

~~~sh
# 首次部署：创建 ai/.venv、安装依赖、复制缺失的配置
bash ai/run.sh setup
# 编辑模型密钥；已有 .env 和 NPC 角色配置不会被 setup 覆盖
nano ai/.env

# 启动前自动同步 BM25；配置 DASHSCOPE_API_KEY 后自动补齐缺失向量
bash ai/run.sh start
bash ai/run.sh status
bash ai/run.sh logs
bash ai/run.sh restart
bash ai/run.sh stop
~~~

不传命令时默认后台启动。可以从任意目录用绝对路径调用脚本；
后台进程通过 nohup 运行，关闭 SSH 后继续运行。日志追加到 ai/logs/ai.log，
PID 和启动标识保存在 ai/.run/，这些运行文件已加入忽略规则。

- start/restart/run 支持 -d；run 在前台运行，适合调试或交给 systemd 等进程管理器托管。
- setup 可用 AI_PYTHON=/usr/bin/python3.12 指定解释器；日常启动自动更新知识库，不会安装依赖。
- setup 更新依赖前要求停止服务；升级依赖后再 start。
- 重复 start 不会重复启动；知识库更新完成后，服务启动两秒内退出会显示日志并返回失败。status 检查的是进程状态，实际端口监听和请求处理情况请看日志或使用 debug_socket.py 验证。
- stop 发送 SIGTERM，等待正在处理的请求结束；默认最多等 90 秒。超时保留进程及 PID 文件，restart 也会中止，可设置 AI_STOP_TIMEOUT=120 后重试。
- 脚本核对进程启动时间和系统启动标识，忽略旧 PID 文件，避免误停复用相同 PID 的进程。
- 此脚本不自动注册开机启动或崩溃重启；有需要时可由 systemd 使用 run 命令托管。
- 脚本管理的启动请统一使用该脚本；直接运行 main.py 的进程不在其管理范围内。

## Windows 启动脚本

安装 Python 3.10+ 后，在仓库根目录用 PowerShell 或 CMD 执行：

~~~powershell
# 直接启动：首次自动准备虚拟环境、安装依赖并补齐配置模板
.\ai\run.bat
# 如需修改模型密钥，编辑后重启
notepad .\ai\.env
.\ai\run.bat status
.\ai\run.bat logs
.\ai\run.bat restart
.\ai\run.bat stop
~~~

run.bat 调用同目录的 run.ps1，兼容 Windows PowerShell 5.1+；
只为本次脚本进程设置执行策略，不修改系统策略。
不传命令默认后台启动，后台运行不弹出窗口。也可直接在 PowerShell 中调用 run.ps1。
在 ai 目录内，直接运行 .\run.bat 或 .\run.ps1 即可，无需先手动 setup。
支持 setup/start/stop/restart/status/logs/run，start/restart/run 可加 -d；
run 使用当前控制台前台运行。日志追加到 logs/ai.log。

- start/restart/run 在缺少虚拟环境时自动创建 .venv\Scripts\python.exe、安装依赖并复制缺失的配置模板；已有 .env 和 NPC 角色配置不会被覆盖。
- 首次安装需要联网下载 Python 依赖；失败时停止启动，下次执行会重试未完成的安装。成功准备后，日常启动只更新知识库，不会重复安装依赖。
- setup 保留为手动准备环境或更新依赖的命令，服务运行时不能执行。需要先配置模型密钥再启动时，可先运行 run.bat setup，编辑 .env 后再 start。
- 可设置 $env:AI_PYTHON 指定安装时的 Python 路径；不同操作系统需各自创建虚拟环境，不能复制复用 .venv。
- stop 通过每次启动独有的本地停止文件请求退出，服务结束当前工作后关闭；默认等 90 秒，可设置 $env:AI_STOP_TIMEOUT。
- 记录 PID 和进程创建时间，避免旧记录误认其他进程；启动、停止与更新依赖命令互斥执行。
- 关闭启动命令窗口后后台服务继续运行；本脚本不注册 Windows 服务、登录自动启动或故障自动重启。

## 启动时自动更新知识库

两套启动脚本的 start/restart/run 都会在服务启动前调用 scripts/ops_update_knowledge.py。
已在运行时重复 start 只显示状态，不会再次更新或重复启动。

1. 扫描配置的 HELP_DIR（默认 help/），检测新增、修改、删除和重命名，包含分块配置的变化。
2. 文档块内容与元数据均未变化时，保留 BM25 数据与版本；有变化时原子更新语料，删除已移除的文档。
3. 配置了 DASHSCOPE_API_KEY 时，仅生成当前模型、端点和维度下缺失的向量；未变化的文档块复用已有向量，不调用嵌入 API。
4. 每个成功的向量立即保存；网络失败后保留已完成的工作，下次启动仅补齐缺失部分。
5. 未配置密钥或向量更新失败时，显示提示并使用 BM25 启动。首次构建或大量文件变化时启动需要等待向量生成，并消耗模型额度。
6. 本地帮助目录缺失、无法读取或数据库更新失败时停止启动并报错，保留之前成功提交的数据。

也可手动运行 python ai/scripts/ops_update_knowledge.py。
直接运行 main.py 时仍需自行同步知识库；自动更新由启动脚本负责。
更新知识库不会重新生成对话摘要，也不会删除玩家历史或关系数据。

## 模型和端点

`OPENAI_CONTEXT_WINDOW_TOKENS` 指模型输入与输出合计窗口，默认 **1,000,000 tokens**；
更换 `OPENAI_MODEL` 时须核对并同步调整容量，不会自动查询模型规格。
`OPENAI_MAX_TOKENS` 用于纯文本输出；JSON 请求不发送 `max_tokens`，按
`OPENAI_MODEL_MAX_OUTPUT_TOKENS` 预留最大输出空间。进程环境优先于 `.env`；
显式空值、非正整数、输出不能留下输入和安全空间的配置会拒绝启动。

完整请求在 Hook 追加后计量，涵盖系统提示、Skill、工具定义、历史及工具结果。
当前未内置各模型分词器，使用 `utf8_conservative_v1` 保守估算（完整 JSON 的 UTF-8
字节数加消息/工具封装余量），再预留输出和窗口 1%（至少 64 tokens）的安全空间；
中文通常明显高估，不是精确 token 数或计费用量。真实用量仍取服务商响应。
模型配置、工具定义和消息前缀不变时，后续请求可采用 `provider_anchor_utf8_delta_v1`，
以服务商实际输入用量为基准，仅估算新增内容；前缀改写、模型切换或缺少用量时回退。
各模型适配器绑定自身配置，父子调用不共享窗口容量；业务报文、工具输出上限另行保留。
详见 [运行时上下文边界](../docs/architecture/ai-service.md#模型上下文窗口)。

上下文达到窗口 80% 或输出预留不足时自动 compact。NPC 长任务在压缩期间继续由
socket 收包循环维持存活，完整协议见 [AI_CLIENT_D](../docs/daemons/ai_client_d.md)。

~~~dotenv
OPENAI_MODEL=qwen3.8-flash
OPENAI_CONTEXT_WINDOW_TOKENS=1000000
OPENAI_MAX_TOKENS=2048
CHAT_EXTRA_BODY={"enable_thinking":false}
EMBEDDING_MODEL=qwen3.7-text-embedding-flash
EMBEDDING_DIMENSIONS=1024
RERANK_MODEL=qwen3.7-text-rerank
RERANK_ENABLED=true
~~~

默认问答、历史摘要和幻境文案模型均为 `qwen3.8-flash`，关闭思考模式；模型和额外请求参数仍可通过 `.env` 覆盖。向量和重排模型独立配置，不随聊天模型切换。参数依据[百炼深度思考文档](https://help.aliyun.com/zh/model-studio/deep-thinking)。

提供方返回的 `reasoning_content` 与正文分开，默认 `CHAT_REASONING_HISTORY=true`，在本 Agent 多轮调用中保留并参与容量/compact；不接受该历史字段的提供方应设为 `false`。它不启用思考模式，也不代替提供方的 `preserve_thinking` 等参数。玩家回复、成功历史、缓存及父 Agent 交付不包含思考。

开发测试可设置 `REASONING_TRACE_FILE=logs/reasoning.jsonl`，或显式 `REASONING_TRACE_CONSOLE=true` 在开发终端查看；默认均关闭，`DEBUG=true` 不会自动开启。先准备受保护的日志目录，Windows 核对目录 ACL，Linux 新文件为 `0600`；日志可能含源码和会话资料，不放公开目录/源码授权范围，不提交仓库。诊断不改变模型历史保留或增加模型调用。字段含义、故障处理及测试见[受限思考诊断](../docs/architecture/ai-service.md#受限思考诊断)。

默认使用北京 DashScope 公共地址。使用业务空间域名时配置 DASHSCOPE_WORKSPACE_ID，会生成问答、向量与重排端点；其他地域或网关可显式配置 OPENAI_BASE_URL、EMBEDDING_BASE_URL 和完整 RERANK_URL，显式配置优先。端点必须与 API Key 和模型可用地域一致。

向量调用使用 OpenAI 兼容 /embeddings，传递 model、dimensions、input、encoding_format。
重排使用 DashScope 原生 input/parameters 请求体及 output.results 响应格式；qwen3-rerank 的另一套兼容接口不适用此适配器。

官方规格（2026-09-18核对）：向量模型输入为128,000 tokens；qwen3.7-text-rerank接口为单条30,000 tokens，建议请求总量120,000 tokens。代码使用保守 UTF-8 字节预算，避免将字符数直接当作token数；这不是精确的模型分词计数。

- [向量API](https://help.aliyun.com/zh/model-studio/text-embedding-synchronous-api/)
- [重排API](https://help.aliyun.com/zh/model-studio/text-rerank-api)

## 检索流程

1. 递归读取 help/，清理颜色码，以3000字符分块、200字符重叠；保留全文。
2. BM25 使用中文双字片段与英文指令词匹配，不依赖额外分词字典；例如“请问武当派如何拜师”可以召回武当帮助。
3. 获取 BM25 和向量两路候选，按文档块ID去重，通过 RRF 融合排名。
4. 使用重排模型评估融合候选，返回默认3条资料，限制注入提示词的总字符数。
5. 向量失败或结果为空仍保留 BM25；重排超时、报错、结果损坏时返回融合排名。
6. 查询向量使用有容量和TTL限制的LRU缓存；错误和零向量不进入缓存。

两路召回及重排在有界工具线程内依次执行，共用请求期限与用量账本。
向量以模型、端点、维度的指纹隔离，文档块ID包含内容哈希。换模型或维度后，启动脚本会自动补齐新向量；也可手动运行 ops_build_vectors.py。
不同模型的索引不混用；文件变更后重启服务会自动更新，也可手动运行构建脚本。
重排候选按配置的单条和整请求字节预算限制；超出预算的低排名候选不送入重排。

knowledge_threshold 控制向量召回相似度；BM25不使用该阈值。设置为1会禁用该NPC的整个知识检索。

`RUNTIME_POLICY` 是可信部署权限上限，默认 `{}` 保持入口能力；只能收紧，不能靠填写工具名绕过源码开关或启用主 Agent。可指定 `tools/skills/scopes/egress_scopes/agents` 名称数组、`knowledge_paths` 文档路径模式及 `version`。省略字段不额外限制，空数组全部禁止；示例见 `.env.example`。修改后重启服务，错误配置会阻止启动，不静默放宽。

源码读取默认启用：`SOURCE_ENABLED=true`、`SOURCE_ROOT=..`，相对路径以 `ai/` 为基准，与启动目录无关。NPC 和已启用的主 Agent 共用该仓库，允许向配置的模型发送回答所需片段；统一排除密钥、玩家数据、数据库、日志、隐藏目录及生成缓存，不上传整库。设置 `SOURCE_ENABLED=false` 可关闭源码且保留文档问答；世界和摘要没有源码工具。升级须移除旧 `SOURCE_SCOPES_FILE` 及角色 `source_scopes`，残留会明确报错，旧配置文件不会自动删除。沿用 `npc_dialogue` 多轮调查，按需加载统一 `skill`，核对多文件依赖和引用，提交前重新验证文件；不新增专用模型循环，不强制闲谈走调查。玩家只接收游戏语境正文；本机管理员诊断可检查获授权的证据快照，但不证明实服已加载该版本。配置、用量、缓存与安全限制见 [源码范围配置](../docs/architecture/ai-source-access.md)。

在 `ai/` 内运行 `python scripts/debug_source.py "入门需要多少贡献？"` 仅预览，不读源码、不调用模型。确认实际目录和外发授权后，才添加 `--execute --audience admin --report <受保护目录>/新报告.json`；报告父目录须事先限制 OS 访问，已有报告不会覆盖。整个报告只供维护者使用，不是可直接发送给玩家的载荷；不新增网络管理员入口。

`python scripts/eval_source.py` 默认预览 [20 题本游戏真实源码评测](evals/README.md)，结论已逐项对照源码。`--check-sources` 只在本机验证固定的 16 文件快照；`--execute --allow-source-egress --report <新报告>` 才按明确授权把这些文件的临时快照用于模型测试，不修改正式源码或服务权限。合成材料通过 `--suite synthetic` 用于自动回归。

评测默认 `--route direct`；`--route coordinated` 走真实主 Agent，按需委派同一 NPC，临时授权范围不变且不启用正式主入口。报告分别记录主/子/compact 的模型配置、用量、上下文峰值和最终引用；父账本已含子过程，不重复累计。`--compare <直达报告> <协调报告>` 离线对照同题同模型结果，可加 `--reviews <直达审核> <协调审核>`；没有完整人工验收不宣称等质或成本收益。详见[对照步骤](evals/README.md#直达与主-agent-对照)。

## 角色和游戏接入

角色配置位于 config/npc_roles.json，以 NPC 的AI角色ID为键。支持 name/title/role/personality/background/greeting/topics/speech_style/knowledge_base/relationship_tips 字段。

~~~json
{
  "li bai": {
    "name": "李白",
    "title": "诗仙",
    "role": "诗人",
    "personality": "豪爽洒脱",
    "background": "诗酒风流，游历江湖",
    "greeting": "少侠可愿共饮？",
    "topics": ["诗词", "剑术"],
    "speech_style": "诗意文雅",
    "knowledge_base": ["诗酒与江湖"],
    "knowledge_threshold": 0.4,
    "memory_capacity": 100
  }
}
~~~

`knowledge_base` 是角色背景知识文本，不是权限白名单。需要限制某角色可检索的文档时，另加 `"knowledge_paths": ["wudang", "newbie"]`：匹配帮助索引中的相对文件名，区分大小写，支持 `*`、`?`、`[]` 通配（`*` 可跨 `/`）；不填沿用部署公开范围，`[]` 禁止所有文档。角色范围与部署、父调用范围取交集，过滤发生在候选召回和外部重排之前，私密文件仍始终排除。

本机 UDP 的 `player_id` 由可信游戏端提供，不是玩家认证；不得对不可信网络开放。载荷自报 `admin`、`policy` 或 `scope` 不授予权限。成功缓存同时核对会话与有效权限；权限改变后不会重放旧答案，也不会自动重新付费生成。旧版本无权限元数据的缓存仅能在关闭源码且其余公开直接入口策略未变时重放。

NPC通过 accept_talk 调用 AI_CLIENT_D->send_chat_request(npcId, playerId, playerName, message, context)。
context 为字符串；参考 u/mudren/npc/ai_npc_template.c。ai_npc_id 必须匹配角色配置，但不再要求与 find_living 注册名称一致。

~~~text
talk libai 如何学习剑法？
talk li bai about 你会作诗吗？
chat @butong 武当派如何拜师？
aitest li bai about 你好
~~~

最后一项为管理员测试指令。李白模板兼容 ask；周不通的原任务询问逻辑保留。

## 历史与关系

- conversations.db 保留完整原始提问和回复；一轮对应2条消息，100条容量约50轮。
- 最近历史按 ID 倒序取出指定条数，再按对话顺序提供给模型。
- 达到消息容量或历史字符预算时单独调用摘要模型，将累计摘要保存到 summaries；原问题随后正常回答。
- 摘要失败不推进摘要位置、不删除原历史，当前问题继续处理。
- memory_capacity=0 仅关闭历史上下文和摘要，仍保存成功对话和关系；不代表禁止持久化。
- 首次启动把 memories.json 导入同一SQLite数据库的 player_memories，保留原文件；后续不再读写该JSON。
- 对话两条记录、关系变化、请求去重结果在同一个事务中提交。
- 保留现有按互动次数增长的关系规则；礼物、忌讳等仍是角色提示信息，不会自动触发游戏奖励或数值变化。

## 通信与运维

正式心魔幻境由游戏侧选择冻结世界，`illusion entry huanjing-v1` 与 `illusion ai on/off` 分别控制入口及创作申请，设置保存在忽略提交的 `data/illusion_world/runtime.json`，重启自动校验并恢复。Python 仍独立使用 `WORLD_ENABLED` 开关和 `WORLD_CONTENT_DIR` 共享目录；测试世界与正式世界不互相覆盖。模板见 `adm/etc/illusion.example.json`，完整运维命令见下文链接。

幻境的启用、限额、存档与真实试验步骤见 [无限世界 AI 创作](../docs/systems/illusion-world-ai.md)。`WORLD_ENABLED=false` 为默认值；地图、默认描述和已发布正文均不依赖服务在线。启用后复用 `OPENAI_*` 模型配置，但任务、线程和 SQLite 与 NPC 独立，不使用 NPC 记忆或检索。停止服务会等待已经开始的模型调用结束，必要时将启动器的停止等待设为 120 秒或更长；HTTP 读超时不是强制终止线程的硬计时器。

- 当前 NPC 模块提供 chat / memory / config；后两者只读。公共分发层不要求 NPC 或玩家字段，业务自行校验。
- 响应回显 request_id；NPC 业务回显适用的 npc_id、player_id。错误带 type=error、code、error。
- LPC按原玩家对象交付回复，验证来源地址、请求编号及身份；迟到或重复回复忽略。
- 游戏端同一玩家对同一 NPC 只允许一个待处理请求。新版聊天使用显式长任务模式：握手后每 5 秒续约，通信健康时没有 90 秒总等待限制；连续 30 秒失联才结束等待。旧短请求仍按其超时/重传选项处理，详见[长任务协议](../docs/daemons/ai_client_d.md#长任务协议)。
- 提问成功发出后，仅向提问玩家显示“NPC正在思索你的问题，请稍候……”；位于玩家提问回显之后，自动重传不重复提示。直接通信测试没有NPC对象时显示“对方”。
- Python 按注册业务限制工作容量，过载立即返回 busy；NPC 容量由 MAX_WORKERS 设置，同一 NPC/玩家会话串行处理。其他能力使用独立工作池。
- 成功请求结果在SQLite中缓存，默认最多1024条、保存300秒；进程重启后仍能在有效期内去重。
- API 不做隐式 SDK 重试；NPC 检索与摘要默认 20 秒、问答默认 60 秒，均为单次 I/O 故障超时。长请求没有固定总期限，调用方失效或取消后不会保存迟到结果；旧短请求仍受 `REQUEST_TIMEOUT` 约束。
- 单条提问上限1000字符，回复上限1600字符；数据报限制8192字节。
- 服务退出等待正在处理的工作结束；启动失败返回非零退出码。

数据只在服务实际启动/构建时迁移；不要同时运行多个实例读写同一份会话数据库。
改 SERVER_HOST/PORT 时同步修改 adm/daemons/ai_client_d.c 中的常量；默认仅绑定本机。
完整参数参见 .env.example。

## 问答超时排查

问答、检索和摘要使用独立超时配置：

~~~dotenv
API_TIMEOUT=20
CHAT_TIMEOUT=60
SUMMARY_TIMEOUT=20
REQUEST_TIMEOUT=80
~~~

`API_TIMEOUT` 用于单次向量和重排，`CHAT_TIMEOUT` 用于单次 NPC 模型调用，`SUMMARY_TIMEOUT` 用于单次历史摘要。`REQUEST_TIMEOUT` 只约束旧客户端/短请求，保留不超过 80 秒的兼容约束；长请求没有任务总期限，使用独立存活/取消状态。单次工具超时反馈给 Agent 调整方法，已发出的迟到调用可能仍消耗资源，但不会成为成功结果。配置修改后重启生效；升级须同时更新 Python 服务与游戏端 `AI_CLIENT_D`/`AI_NPC_D`，勿只解除一侧期限。

HTTP 超时按网络操作计算，并非严格的整次调用计时器；超过整轮截止时间的回复或摘要不会被接受。问答失败不保存该轮玩家对话或增加关系，超时会向玩家返回专门的超时提示。

看到 embeddings 返回 200，只能证明向量接口调用成功。问答与向量可配置不同主机、密钥和模型，需单独验证问答接口。启动日志会显示实际模型、主机和各阶段超时；失败日志含 `operation`、`timeout_s`、`elapsed_s`、`input_chars`、`error`、`cause` 和 HTTP `status`，不记录密钥、玩家输入或原始错误响应。检查服务进程的环境变量是否覆盖了 `.env`。

在 `ai` 目录执行独立诊断，无需启动游戏或 AI 服务：

~~~sh
# Linux：只显示脱敏配置，不调用 API
.venv/bin/python scripts/debug_chat.py --config-only
# 使用原 20 秒限制，对比默认 60 秒；每条命令真实调用一次问答模型
.venv/bin/python scripts/debug_chat.py --timeout 20
.venv/bin/python scripts/debug_chat.py --timeout 60
~~~

~~~powershell
# Windows
.\.venv\Scripts\python.exe .\scripts\debug_chat.py --config-only
.\.venv\Scripts\python.exe .\scripts\debug_chat.py --timeout 60
~~~

诊断脚本经统一 Runner 和模型适配执行，最多调用模型一次、禁止工具与委派，并记录 Hook 和实际用量。默认发送一句简短问题，也可在命令末尾传入自定义问题；不加载知识库、人设或玩家历史，不保存对话。简短请求成功后，再用 `scripts/debug_socket.py chat "li bai" "武当派如何拜师？"` 测试已启动服务的完整流程；该客户端会按正常规则保存测试玩家的对话。

- `cause=ConnectTimeout`：连接阶段超时，检查线上机器对问答主机的网络、代理和连通性。
- `cause=ReadTimeout`：等待响应数据超时，检查网关、模型耗时和输入长度；可对比 20 秒与 60 秒的诊断结果。
- 有 HTTP 状态码时按状态排查鉴权、模型权限、限流或服务端错误。
- 本地成功不代表线上网络和服务进程环境一致；同一诊断命令也应在出问题的服务器执行。

## 查看提问的知识库召回

在 `ai` 目录运行。无需启动游戏或 AI 服务；省略问题参数即可连续输入不同问题，输入 `/quit` 或 `/exit` 退出。

Windows PowerShell：

~~~powershell
# 连续提问，按李白的知识库阈值检索
.\.venv\Scripts\python.exe .\scripts\debug_retrieval.py --npc "li bai"

# 单次问题，显示前 5 条结果及完整文档块正文
.\.venv\Scripts\python.exe .\scripts\debug_retrieval.py "武当派如何拜师？" --npc "li bai" --top-k 5 --full

# 仅测试本地 BM25，不调用远程 API
.\.venv\Scripts\python.exe .\scripts\debug_retrieval.py --bm25
~~~

Linux：

~~~sh
.venv/bin/python scripts/debug_retrieval.py --npc "li bai"
.venv/bin/python scripts/debug_retrieval.py "少林派有什么武功？" --bm25 --full
~~~

每条结果显示标题、文件相对路径、文档块 ID、召回来源、分数和正文。默认预览前 600 字，`--full` 显示整个命中文档块。混合结果保留 BM25 分数、向量余弦相似度和 RRF 融合分数；实际完成重排时还显示重排分数，各类分数不可直接比较。

默认读取 `.env` 和当前知识库索引，通过统一 `knowledge.search` 工具复用混合检索（BM25 + 向量召回、RRF 融合、按配置重排）。单次查询最多 2 个外部请求、1 个工具步骤；工具执行上限 30 秒，不再叠加隐式 `REQUEST_TIMEOUT` 总期限。`--bm25` 同样经过工具权限与 Hook，但禁止任何外部请求。脚本不调用问答模型、不写玩家对话；检索内容会先按公共资料范围过滤。

本地诊断保留 `--top-k 1..500`、召回分数及 `--full`，但证据正文合计至多 16,000 字、工具结果不超过 64 KiB。达到上限会明确显示“部分资料”，`--full` 不解除安全限制。更高条数与分数仅由受信任 CLI 装配提供，不开放给网络 Agent（仍最多 5 条）。脚本使用宿主机账户权限，请限制服务配置、知识索引和管理脚本的 OS 访问权限；不是新增的管理员网络接口。

`--npc` 使用对应 NPC 的 `knowledge_threshold`；未指定时为 0.4。`--threshold` 可覆盖阈值，1 按游戏规则关闭全部召回。`--top-k` 默认读取 `RETRIEVAL_TOP_K`。

首次使用空的本地知识库时会从 `HELP_DIR` 构建 BM25 索引；脚本不生成文档向量。更新帮助文件或更换向量模型后，先用同一 Python 执行 `scripts/ops_update_knowledge.py` 更新索引。没有匹配当前模型的向量或远程检索失败时，会保留可用的 BM25 结果并显示提示。

## 验证

~~~sh
# 包含旧版升级演练，须有 Git 及本地基线提交 2f8192a5356af2e2306392132a7406715a85c44b
python -m unittest discover -s ai/tests -v
# 离线旧版/当前版升级与回退；本地须有基线提交，不接触正式数据
python ai/scripts/verify_upgrade.py
# 真实驱动 + 假模型 UDP 闭环；默认 bin/driver.exe，可传驱动与 Python 路径
node ai/scripts/verify_lpc.mjs
# 世界事实/真实房间 + UDP + SQLite + 假模型；另有 Python world 测试
node tools/tests/test_illusion_world.mjs
python ai/scripts/bench_retrieval.py
python ai/scripts/debug_socket.py config "li bai"
python ai/scripts/debug_socket.py chat "li bai" "如何拜师"
~~~

自动回归使用临时数据和模拟模型，不消耗API额度；UDP测试使用随机本机端口。Linux/Windows 启动器测试在对应平台执行；驱动测试隔离编译通信层、NPC 适配和原 NPC 聊天入口，覆盖普通/影子 NPC、通用回调、重传、超时与重载。

升级演练包含保持原文档问答能力（显式关闭源码）的旧版写入、升级、回退及再升级，以及默认开启源码后拒绝旧权限缓存的独立检查。它不自动下载 Git 历史，不因缓存拒绝重新调用模型，也不替代实际游戏验收。

`verify_upgrade.py` 独立于 unittest 执行：在临时目录实际运行 `2f8192a5` 与当前服务代码，四阶段检查聊天、摘要、关系、去重、世界正文/额度/待恢复任务及取消提交；各阶段独立进程、前一进程退出后才复制数据。它不读取密钥、玩家数据或修改工作区，也不能代替正式停机备份及实服验证。旧版不具备新版权限与长任务语义，回退须配套停用新入口，见[迁移与回退](../docs/architecture/ai-service.md#迁移与回退)。

`bench_retrieval.py` 默认只测本地 BM25；`--remote` 使用 6 个固定问题，共享用量账本而非调用数/总时长上限。当前检索链每题至多一次向量和一次重排，这是流程规模，不是通用 Agent 预算；报告缓存/失败/未知用量及按配置估算的费用。
`bench_cache.py` 通过同一工具的受信任向量诊断模式测试缓存；3 轮共 9 个工具步骤，最多 9 个外部请求（正常缓存命中时只有 3 次）。先完成索引构建；两者均输出实际累计计数并释放所持有的客户端。

游戏回归：正常对话；首次提问立即显示等待提示且位于提问回显之后，5秒重传不重复提示，其他玩家看不到等待提示；连续提问的忙碌提示；配置ID不同于living ID的NPC；服务停止后的超时；模型失败后的错误提示；容量达到10条时第6轮原问题仍被回答。检查 log/debug.log 和 log/error.log。
