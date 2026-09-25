# 游戏 AI 服务

独立 Python 服务，通过本机 UDP 为游戏提供 AI 能力，要求 Python 3.10+。提供 NPC 人设对话、游戏帮助检索、对话摘要和关系记录，以及默认关闭的幻境场景创作。

游戏统一使用 `AI_CLIENT_D` 发送异步请求；`AI_NPC_D` 负责 NPC 的玩家校验与对话展示。Python 在 `main.py:create_server()` 按请求类型注册业务，各业务拥有独立工作容量和期限。

| 模块 | 职责 |
| --- | --- |
| `src/udp_server.py`、`src/protocol.py` | UDP、公共报文校验、请求关联、有限并发分发 |
| `src/llm.py` | 公共模型客户端、单次调用及期限、模型错误 |
| `src/npc/` | NPC 人设、会话锁、聊天/记忆/角色查询及原子持久化 |
| `src/world/` | 静态房间事实、持久去重任务、独立模型 worker 和本地正文发布 |
| `src/knowledge_*.py` | BM25、向量混合检索和知识库同步 |
| `src/runtime/`、`src/tools/`、`skills/` | 正在接入业务的共享 Agent/Tool/Skill/Hook；不是第二套 socket 服务 |

服务明确注册 `chat`、`memory`、`config`、`world_describe`、`world_status`；世界能力不要求 NPC/玩家聊天字段。禁用创作时世界路由返回 `retry_later`，不创建模型客户端或后台任务。接口与扩展约定见 [AI 客户端文档](../docs/daemons/ai_client_d.md)。

默认 `ENABLED_MODULES=npc,world` 保持以上行为；只需要 NPC 时设置 `ENABLED_MODULES=npc`，世界模块不会加载。`WORLD_ENABLED=false` 仅停用创作并保留原路由，不能与“不注册模块”混淆。

## 独立部署与适配原则

以当前 MUD 的服务为主，避免强耦合，不为通用性额外增加抽象。其他 MUD 优先修改 `HELP_DIR`、`NPC_ROLES_FILE`、`DATA_DIR` 等配置接入；专业提示词后续迁为可独立修改的 Skill，不要求复制本库目录或使用相同驱动。当前 Skill/Agent 重构尚未完成，见 [架构与迁移说明](../docs/architecture/ai-service.md)。

不需要文档检索的部署可设置 `KNOWLEDGE_UPDATE_ENABLED=false`，启动脚本跳过同步；显式建库命令仍可运行。无限世界的共享目录和清单/正文格式只属于该可选业务，并非所有 AI 功能的前置条件。单独部署时复制服务源码、安装依赖并创建自己的配置/数据；一个实例服务一个游戏，不复用原游戏密钥或玩家历史。本机 UDP 不提供远程管理员认证。

### 新运行时开发验证

新运行时的 Skill 按 `SKILLS_DIR` 扫描，向 Agent 仅提供授权名称和描述；正文及参考资料都经唯一的 `skill(name, path?)` 工具加载，直接预加载也使用该入口。Tool 和 Hook 均由受信任部署代码注册，不接受模型安装，不提供写文件或执行代码能力。现有 NPC/世界尚未迁入，完整边界及接入方法见架构文档。

`python ai/scripts/verify_runtime.py` 默认只显示测试计划。取得真实模型调用授权后加 `--execute`：使用临时合成规则验证发现/加载/读取和直接预加载两条路径，整批最多 6 次模型调用，无自动重试，不读取游戏源码、玩家数据或业务数据库。`--model` 仅覆盖本次模型选择。实际记录见 [阶段验收报告](../docs/architecture/ai-runtime-validation.md)，不能将少量链路测试当作源码调查质量验收。

## 启动

以下命令从仓库根目录执行；从其他目录启动时，配置和数据路径仍以 ai 为基准。

~~~sh
python -m pip install -r ai/requirements.txt
# 首次部署复制；已有文件请直接编辑，不要覆盖：
cp ai/.env.example ai/.env
cp ai/config/npc_roles.example.json ai/config/npc_roles.json

python ai/scripts/setup_basic.py
python ai/scripts/setup_qwen.py
python ai/main.py -d
~~~

PowerShell 可用 Copy-Item 代替 cp。生产环境不需要 -d。

- .env 自动加载，系统环境变量优先；不会读取游戏的 data/.env。
- OPENAI_API_KEY 使用百炼密钥，用于对话和历史摘要；DASHSCOPE_API_KEY 用于向量与重排。
- 缺少聊天密钥时明确显示离线演示话术，不保存模拟对话、不增加关系。
- 未构建新向量或向量接口不可用时继续使用本地 BM25。
- setup_basic.py 不调用远程 API；setup_qwen.py 为缺失文档块生成向量，会使用模型额度。
- 配置在服务启动时读取，修改后重启生效。

## Linux 服务器启动脚本

建议使用固定的普通用户运行，服务器需安装 Python 3.10+、venv 和 util-linux（提供 flock）。
从仓库根目录执行：

~~~sh
# 首次部署：创建 ai/.venv、安装依赖、复制缺失的配置
bash ai/start.sh setup
# 编辑模型密钥；已有 .env 和 NPC 角色配置不会被 setup 覆盖
nano ai/.env

# 启动前自动同步 BM25；配置 DASHSCOPE_API_KEY 后自动补齐缺失向量
bash ai/start.sh start
bash ai/start.sh status
bash ai/start.sh logs
bash ai/start.sh restart
bash ai/start.sh stop
~~~

不传命令时默认后台启动。可以从任意目录用绝对路径调用脚本；
后台进程通过 nohup 运行，关闭 SSH 后继续运行。日志追加到 ai/logs/ai.log，
PID 和启动标识保存在 ai/.run/，这些运行文件已加入忽略规则。

- start/restart/run 支持 -d；run 在前台运行，适合调试或交给 systemd 等进程管理器托管。
- setup 可用 AI_PYTHON=/usr/bin/python3.12 指定解释器；日常启动自动更新知识库，不会安装依赖。
- setup 更新依赖前要求停止服务；升级依赖后再 start。
- 重复 start 不会重复启动；知识库更新完成后，服务启动两秒内退出会显示日志并返回失败。status 检查的是进程状态，实际端口监听和请求处理情况请看日志或使用 test_client.py 验证。
- stop 发送 SIGTERM，等待正在处理的请求结束；默认最多等 90 秒。超时保留进程及 PID 文件，restart 也会中止，可设置 AI_STOP_TIMEOUT=120 后重试。
- 脚本核对进程启动时间和系统启动标识，忽略旧 PID 文件，避免误停复用相同 PID 的进程。
- 此脚本不自动注册开机启动或崩溃重启；有需要时可由 systemd 使用 run 命令托管。
- 脚本管理的启动请统一使用该脚本；直接运行 main.py 的进程不在其管理范围内。

## Windows 启动脚本

安装 Python 3.10+ 后，在仓库根目录用 PowerShell 或 CMD 执行：

~~~powershell
# 直接启动：首次自动准备虚拟环境、安装依赖并补齐配置模板
.\ai\start.bat
# 如需修改模型密钥，编辑后重启
notepad .\ai\.env
.\ai\start.bat status
.\ai\start.bat logs
.\ai\start.bat restart
.\ai\start.bat stop
~~~

start.bat 调用同目录的 start.ps1，兼容 Windows PowerShell 5.1+；
只为本次脚本进程设置执行策略，不修改系统策略。
不传命令默认后台启动，后台运行不弹出窗口。也可直接在 PowerShell 中调用 start.ps1。
在 ai 目录内，直接运行 .\start.bat 或 .\start.ps1 即可，无需先手动 setup。
支持 setup/start/stop/restart/status/logs/run，start/restart/run 可加 -d；
run 使用当前控制台前台运行。日志追加到 logs/ai.log。

- start/restart/run 在缺少虚拟环境时自动创建 .venv\Scripts\python.exe、安装依赖并复制缺失的配置模板；已有 .env 和 NPC 角色配置不会被覆盖。
- 首次安装需要联网下载 Python 依赖；失败时停止启动，下次执行会重试未完成的安装。成功准备后，日常启动只更新知识库，不会重复安装依赖。
- setup 保留为手动准备环境或更新依赖的命令，服务运行时不能执行。需要先配置模型密钥再启动时，可先运行 start.bat setup，编辑 .env 后再 start。
- 可设置 $env:AI_PYTHON 指定安装时的 Python 路径；不同操作系统需各自创建虚拟环境，不能复制复用 .venv。
- stop 通过每次启动独有的本地停止文件请求退出，服务结束当前工作后关闭；默认等 90 秒，可设置 $env:AI_STOP_TIMEOUT。
- 记录 PID 和进程创建时间，避免旧记录误认其他进程；启动、停止与更新依赖命令互斥执行。
- 关闭启动命令窗口后后台服务继续运行；本脚本不注册 Windows 服务、登录自动启动或故障自动重启。

## 启动时自动更新知识库

两套启动脚本的 start/restart/run 都会在服务启动前调用 scripts/update_knowledge.py。
已在运行时重复 start 只显示状态，不会再次更新或重复启动。

1. 扫描配置的 HELP_DIR（默认 help/），检测新增、修改、删除和重命名，包含分块配置的变化。
2. 文档块内容与元数据均未变化时，保留 BM25 数据与版本；有变化时原子更新语料，删除已移除的文档。
3. 配置了 DASHSCOPE_API_KEY 时，仅生成当前模型、端点和维度下缺失的向量；未变化的文档块复用已有向量，不调用嵌入 API。
4. 每个成功的向量立即保存；网络失败后保留已完成的工作，下次启动仅补齐缺失部分。
5. 未配置密钥或向量更新失败时，显示提示并使用 BM25 启动。首次构建或大量文件变化时启动需要等待向量生成，并消耗模型额度。
6. 本地帮助目录缺失、无法读取或数据库更新失败时停止启动并报错，保留之前成功提交的数据。

也可手动运行 python ai/scripts/update_knowledge.py。
直接运行 main.py 时仍需自行同步知识库；自动更新由启动脚本负责。
更新知识库不会重新生成对话摘要，也不会删除玩家历史或关系数据。

## 模型和端点

~~~dotenv
OPENAI_MODEL=qwen3.8-flash
CHAT_EXTRA_BODY={"enable_thinking":false}
EMBEDDING_MODEL=qwen3.7-text-embedding-flash
EMBEDDING_DIMENSIONS=1024
RERANK_MODEL=qwen3.7-text-rerank
RERANK_ENABLED=true
~~~

默认问答、历史摘要和幻境文案模型均为 `qwen3.8-flash`，关闭思考模式；模型和额外请求参数仍可通过 `.env` 覆盖。向量和重排模型独立配置，不随聊天模型切换。参数依据[百炼深度思考文档](https://help.aliyun.com/zh/model-studio/deep-thinking)。

默认使用北京 DashScope 公共地址。使用业务空间域名时配置 DASHSCOPE_WORKSPACE_ID，会生成问答、向量与重排端点；其他地域或网关可显式配置 OPENAI_BASE_URL、EMBEDDING_BASE_URL 和完整 RERANK_URL，显式配置优先。端点必须与 API Key 和模型可用地域一致。

向量调用使用 OpenAI 兼容 /embeddings，传递 model、dimensions、input、encoding_format。
重排使用 DashScope 原生 input/parameters 请求体及 output.results 响应格式；qwen3-rerank 的另一套兼容接口不适用此适配器。

官方规格（2026-09-18核对）：向量模型输入为128,000 tokens；qwen3.7-text-rerank接口为单条30,000 tokens，建议请求总量120,000 tokens。代码使用保守 UTF-8 字节预算，避免将字符数直接当作token数；这不是精确的模型分词计数。

- [向量API](https://help.aliyun.com/zh/model-studio/text-embedding-synchronous-api/)
- [重排API](https://help.aliyun.com/zh/model-studio/text-rerank-api)

## 检索流程

1. 递归读取 help/，清理颜色码，以3000字符分块、200字符重叠；保留全文。
2. BM25 使用中文双字片段与英文指令词匹配，不依赖额外分词字典；例如“请问武当派如何拜师”可以召回武当帮助。
3. 同时获取 BM25 和向量两路候选，按文档块ID去重，通过 RRF 融合排名。
4. 使用重排模型评估融合候选，返回默认3条资料，限制注入提示词的总字符数。
5. 向量失败或结果为空仍保留 BM25；重排超时、报错、结果损坏时返回融合排名。
6. 查询向量使用有容量和TTL限制的LRU缓存；错误和零向量不进入缓存。

“同时”指两路均参与召回；网络调用在当前请求线程内依次完成。
向量以模型、端点、维度的指纹隔离，文档块ID包含内容哈希。换模型或维度后，启动脚本会自动补齐新向量；也可手动运行 setup_qwen.py。
不同模型的索引不混用；文件变更后重启服务会自动更新，也可手动运行构建脚本。
重排候选按配置的单条和整请求字节预算限制；超出预算的低排名候选不送入重排。

knowledge_threshold 控制向量召回相似度；BM25不使用该阈值。设置为1会禁用该NPC的整个知识检索。

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
- 查询最近历史按ID稳定排序；不会返回最早的N条冒充最新记录。
- 达到消息容量或历史字符预算时单独调用摘要模型，将累计摘要保存到 summaries；原问题随后正常回答。
- 摘要失败不推进摘要位置、不删除原历史，当前问题继续处理。
- memory_capacity=0 仅关闭历史上下文和摘要，仍保存成功对话和关系；不代表禁止持久化。
- 首次启动把 memories.json 导入同一SQLite数据库的 player_memories，保留原文件；后续不再读写该JSON。
- 对话两条记录、关系变化、请求去重结果在同一个事务中提交。
- 保留现有按互动次数增长的关系规则；礼物、忌讳等仍是角色提示信息，不会自动触发游戏奖励或数值变化。

## 通信与运维

幻境的启用、限额、存档与真实试验步骤见 [无限世界 AI 创作](../docs/systems/illusion-world-ai.md)。`WORLD_ENABLED=false` 为默认值；地图、默认描述和已发布正文均不依赖服务在线。启用后复用 `OPENAI_*` 模型配置，但任务、线程和 SQLite 与 NPC 独立，不使用 NPC 记忆或检索。停止服务会等待已经开始的模型调用结束，必要时将启动器的停止等待设为 120 秒或更长；HTTP 读超时不是强制终止线程的硬计时器。

- 当前 NPC 模块提供 chat / memory / config；后两者只读。公共分发层不要求 NPC 或玩家字段，业务自行校验。
- 响应回显 request_id；NPC 业务回显适用的 npc_id、player_id。错误带 type=error、code、error。
- LPC按原玩家对象交付回复，验证来源地址、请求编号及身份；迟到或重复回复忽略。
- 游戏端同一玩家对同一NPC只允许一个待处理请求；5秒后重传一次，90秒超时提示。
- 提问成功发出后，仅向提问玩家显示“NPC正在思索你的问题，请稍候……”；位于玩家提问回显之后，自动重传不重复提示。直接通信测试没有NPC对象时显示“对方”。
- Python 按注册业务限制工作容量，过载立即返回 busy；NPC 容量由 MAX_WORKERS 设置，同一 NPC/玩家会话串行处理。其他能力使用独立工作池。
- 成功请求结果在SQLite中缓存，默认最多1024条、保存300秒；进程重启后仍能在有效期内去重。
- API不做隐式SDK重试；NPC 检索与摘要默认20秒，问答默认60秒，整请求预算80秒。HTTP库超时按网络操作执行，结果超出总预算时不会保存对话。
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

`API_TIMEOUT` 用于向量和重排，`CHAT_TIMEOUT` 用于 NPC 问答，`SUMMARY_TIMEOUT` 用于历史摘要。每次调用同时受 NPC 整轮剩余预算限制，`REQUEST_TIMEOUT` 不超过 80 秒；调整后重启生效。公共模型调用允许其他业务传入自己的期限，不受 NPC 的整轮预算限制。

HTTP 超时按网络操作计算，并非严格的整次调用计时器；超过整轮截止时间的回复或摘要不会被接受。问答失败不保存该轮玩家对话或增加关系，超时会向玩家返回专门的超时提示。

看到 embeddings 返回 200，只能证明向量接口调用成功。问答与向量可配置不同主机、密钥和模型，需单独验证问答接口。启动日志会显示实际模型、主机和各阶段超时；失败日志含 `operation`、`timeout_s`、`elapsed_s`、`input_chars`、`error`、`cause` 和 HTTP `status`，不记录密钥、玩家输入或原始错误响应。检查服务进程的环境变量是否覆盖了 `.env`。

在 `ai` 目录执行独立诊断，无需启动游戏或 AI 服务：

~~~sh
# Linux：只显示脱敏配置，不调用 API
.venv/bin/python scripts/diagnose_chat.py --config-only
# 使用原 20 秒限制，对比默认 60 秒；每条命令真实调用一次问答模型
.venv/bin/python scripts/diagnose_chat.py --timeout 20
.venv/bin/python scripts/diagnose_chat.py --timeout 60
~~~

~~~powershell
# Windows
.\.venv\Scripts\python.exe .\scripts\diagnose_chat.py --config-only
.\.venv\Scripts\python.exe .\scripts\diagnose_chat.py --timeout 60
~~~

诊断脚本复用公共模型调用和问答参数，默认发送一句简短问题，也可在命令末尾传入自定义问题；不加载知识库、人设或玩家历史，不保存对话。简短请求成功后，再用 `scripts/test_client.py chat "li bai" "武当派如何拜师？"` 测试已启动服务的完整流程；该客户端会按正常规则保存测试玩家的对话。

- `cause=ConnectTimeout`：连接阶段超时，检查线上机器对问答主机的网络、代理和连通性。
- `cause=ReadTimeout`：等待响应数据超时，检查网关、模型耗时和输入长度；可对比 20 秒与 60 秒的诊断结果。
- 有 HTTP 状态码时按状态排查鉴权、模型权限、限流或服务端错误。
- 本地成功不代表线上网络和服务进程环境一致；同一诊断命令也应在出问题的服务器执行。

## 查看提问的知识库召回

在 `ai` 目录运行。无需启动游戏或 AI 服务；省略问题参数即可连续输入不同问题，输入 `/quit` 或 `/exit` 退出。

Windows PowerShell：

~~~powershell
# 连续提问，按李白的知识库阈值检索
.\.venv\Scripts\python.exe .\scripts\test_retrieval.py --npc "li bai"

# 单次问题，显示前 5 条结果及完整文档块正文
.\.venv\Scripts\python.exe .\scripts\test_retrieval.py "武当派如何拜师？" --npc "li bai" --top-k 5 --full

# 仅测试本地 BM25，不调用远程 API
.\.venv\Scripts\python.exe .\scripts\test_retrieval.py --bm25
~~~

Linux：

~~~sh
.venv/bin/python scripts/test_retrieval.py --npc "li bai"
.venv/bin/python scripts/test_retrieval.py "少林派有什么武功？" --bm25 --full
~~~

每条结果显示标题、文件相对路径、文档块 ID、召回来源、分数和正文。默认预览前 600 字，`--full` 显示整个命中文档块。混合结果保留 BM25 分数、向量余弦相似度和 RRF 融合分数；实际完成重排时还显示重排分数，各类分数不可直接比较。

默认读取 `.env` 和当前知识库索引，复用游戏中的 `hybrid_search`（BM25 + 向量召回、RRF 融合、按配置重排），可能调用向量和重排 API。脚本仅展示检索结果，不调用问答模型，也不写玩家对话记录；展示的正文尚未经过问答提示词的总长度截断。

`--npc` 使用对应 NPC 的 `knowledge_threshold`；未指定时为 0.4。`--threshold` 可覆盖阈值，1 按游戏规则关闭全部召回。`--top-k` 默认读取 `RETRIEVAL_TOP_K`。

首次使用空的本地知识库时会从 `HELP_DIR` 构建 BM25 索引；脚本不生成文档向量。更新帮助文件或更换向量模型后，先用同一 Python 执行 `scripts/update_knowledge.py` 更新索引。没有匹配当前模型的向量或远程检索失败时，会保留可用的 BM25 结果并显示提示。

## 验证

~~~sh
python -m unittest discover -s ai/tests -v
# 真实驱动 + 假模型 UDP 闭环；默认 bin/driver.exe，可传驱动与 Python 路径
node ai/scripts/test_lpc.mjs
# 世界事实/真实房间 + UDP + SQLite + 假模型；另有 Python world 测试
node tools/tests/test_illusion_world.mjs
python ai/scripts/performance_test.py
python ai/scripts/test_client.py config "li bai"
python ai/scripts/test_client.py chat "li bai" "如何拜师"
~~~

自动回归使用临时数据和模拟模型，不消耗API额度；UDP测试使用随机本机端口。Linux/Windows 启动器测试在对应平台执行；驱动测试隔离编译通信层、NPC 适配和原 NPC 聊天入口，覆盖普通/影子 NPC、通用回调、重传、超时与重载。
performance_test.py 默认只测本地BM25，--remote 才调用外部检索API。
benchmark_cache.py 会调用外部向量API；先完成索引构建。

游戏回归：正常对话；首次提问立即显示等待提示且位于提问回显之后，5秒重传不重复提示，其他玩家看不到等待提示；连续提问的忙碌提示；配置ID不同于living ID的NPC；服务停止后的超时；模型失败后的错误提示；容量达到10条时第6轮原问题仍被回答。检查 log/debug.log 和 log/error.log。
