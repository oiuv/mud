# AI 服务高级配置

日常配置见 `ai/.env.example`。下面保留精简前的完整选项和默认值，按需复制对应行，不必全部配置。进程环境优先于 `ai/.env`，路径以 `ai/` 为基准；本次未修改正式配置或默认行为。实际字段定义见 `ai/src/settings.py`。

新增 CLI 配置：`CODEGRAPH_OPERATIONS` 默认为 `explore`；明确启用七项查询可设为 `explore,query,callers,callees,impact,node,files`。`CLI_PROGRAMS_FILE` 默认为空，配置其他程序见[授权 CLI 工具](ai-cli-tools.md)。旧 CodeGraph 显式路径及关闭状态不变；工具上限中的旧 `codegraph.explore` 须由管理员明确改为 `exec`，不会自动改写权限列表。

以下为完整配置参考，不是要求启用所有能力。更换模型须同时检查工具/JSON Object 能力、上下文窗口、最大输出及单次调用超时。

文本生成与知识库检索独立配置：`OPENAI_API_KEY` / `OPENAI_BASE_URL` 用于文本生成；`DASHSCOPE_API_KEY` 供向量和重排共用，地址分别为 `EMBEDDING_BASE_URL` 和完整 `RERANK_URL`。两组密钥不自动回退，使用同一百炼密钥时须分别填写；检索密钥留空时使用本地 BM25。

`DASHSCOPE_WORKSPACE_ID` 是可选的百炼北京业务空间配置，会同时生成文本生成、向量和重排的默认地址，各自显式配置的 URL 优先。混用不同服务商或地域时直接配置相应 URL，不能只修改聊天地址就认为检索也随之切换。

```dotenv
# 复制为 ai/.env 后填写；进程环境变量优先于此文件。
# 下方路径均相对于 ai/ 目录解析，不受启动目录影响。
# 文本生成服务密钥，用于 NPC 问答、主 Agent、幻境文案及摘要。
# OPENAI_ 表示 OpenAI 兼容接口，不限于 OpenAI 的模型。
OPENAI_API_KEY=
# 可选：指定聊天接口地址；默认使用北京地域或工作空间对应的地址。
# OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen3.8-flash
# 模型的输入与输出合计上下文窗口，单位 token；默认 1M = 1000000。
# 更换模型时务必按该模型实际规格同步修改；默认值不代表所有模型都支持 1M。
# 估算达到 80% 或输出预留不足时自动 compact；不是任务累计消耗上限。
OPENAI_CONTEXT_WINDOW_TOKENS=1000000
# 纯文本生成的输出 token 上限；摘要和 compact 保持文本模式。
OPENAI_MAX_TOKENS=2048
# 模型支持的最大输出容量，用于 JSON Object 请求的上下文预留，不是累计预算。
# JSON 请求不发送 max_tokens；更换模型须同步核对这个值和上下文窗口。
OPENAI_MODEL_MAX_OUTPUT_TOKENS=131072
# 是否支持原生 JSON Object；仅明确要求 JSON 的业务使用，不支持时明确报错。
CHAT_SUPPORTS_JSON_OBJECT=true
# 部署模型是否支持工具调用；不支持时设为 false，多步能力会明确报不支持。
# 这是部署声明，不会自动切换模型；真实工具效果仍须单独验收。
CHAT_SUPPORTS_TOOLS=true
# 关闭通义千问的思考模式，直接生成回复；其他服务商可能需要设为 {}。
# 此处只放提供方附加选项，不覆盖运行时管理的 response_format 或输出 token 参数。
CHAT_EXTRA_BODY={"enable_thinking":false}
# 是否将提供方实际返回的 reasoning_content 带入本 Agent 后续请求；不用于开启思考模式。
# 默认 true；更换为不接受该历史字段的提供方时设为 false，诊断仍可查看实际返回的字段。
# Qwen 支持型号的 preserve_thinking 另按官方协议配置在 CHAT_EXTRA_BODY 中，不自动添加。
CHAT_REASONING_HISTORY=true
# 可选思考诊断：默认均关闭。文件路径相对 ai/；先创建仅开发者/服务账号可读的目录。
# 建议使用 logs/reasoning.jsonl（已被 Git 忽略）；不得放入公开目录或源码工具授权范围。
# 内容可能含授权源码及会话资料；Windows 须核对目录 ACL，Linux 新文件权限为 0600。
REASONING_TRACE_FILE=
# 仅开发终端需要时开启；不会因 DEBUG=true 自动开启，也不向游戏客户端发送。
REASONING_TRACE_CONSOLE=false
# 可选费用估算：键为“chat/embedding/rerank:模型名”，单价单位为每百万 token。
# 按部署实际账单设置，不预置价格；缺少单价或服务商用量时，报告中的费用为 null（未知）。
# input 为非缓存输入价，output 为输出价；提供 cached_input 才区分缓存折扣。
# 不提供 cached_input 时，明确按 input 统一估算全部输入；缓存 token 是输入子集，不重复相加。
# 这是观测配置，不是消费上限；更换模型须同步配置对应键，不继承旧模型价格。
# 结构示例（数值仅为演示，不代表当前报价）：
# MODEL_PRICES_PER_MILLION={"chat:example-model":{"input":1,"cached_input":0.1,"output":2},"embedding:example-vector":{"input":0.5}}
MODEL_PRICES_PER_MILLION={}
COST_CURRENCY=CNY

# 知识库检索：向量与重排共用百炼密钥；不自动复用 OPENAI_API_KEY。
# 留空时使用本地 BM25；使用同一百炼密钥时，两处分别填写。
DASHSCOPE_API_KEY=
# 向量：独立的 OpenAI 兼容接口地址，地址地域须与密钥所属地域一致。
# EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=qwen3.7-text-embedding-flash
EMBEDDING_DIMENSIONS=1024
# 重排：DashScope 原生接口的完整地址。
# RERANK_URL=https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank
RERANK_MODEL=qwen3.7-text-rerank
RERANK_ENABLED=true

# 可选：百炼北京业务空间，同时生成聊天、向量和重排的默认地址。
# 各自显式配置的 URL 优先；不改变上述两组密钥的独立配置。
# DASHSCOPE_WORKSPACE_ID=

# 下列限制按 UTF-8 字节数保守估算，不是模型分词后的 token 数。
# 对应接口 token 上限：向量 128000；重排每条 30000、每次请求合计 120000。
EMBEDDING_MAX_BYTES=128000
RERANK_MAX_BYTES=30000
RERANK_TOTAL_BYTES=120000

CHUNK_SIZE=3000
CHUNK_OVERLAP=200
RETRIEVAL_CANDIDATES=12
RETRIEVAL_TOP_K=3
KNOWLEDGE_MAX_CHARS=10000
HISTORY_MAX_CHARS=24000
VECTOR_CACHE_SIZE=512
VECTOR_CACHE_TTL=1800

# 修改监听地址或端口时，须同步 LPC 的 AI_SERVER_HOST / AI_SERVER_PORT。
SERVER_HOST=127.0.0.1
SERVER_PORT=9999
# 向量与重排请求超时（秒）；聊天和摘要使用各自的时限。
API_TIMEOUT=20
# 单次 NPC 模型与历史摘要调用的故障超时；不是任务累计运行上限。
# 覆盖该次请求的完整等待（含思考与生成），并非仅网络空闲时间；慢模型须按实测延迟调整。
CHAT_TIMEOUT=60
SUMMARY_TIMEOUT=20
# 仅用于旧客户端/短请求（秒），保留 <=80 的旧协议约束。
# 新 NPC 长请求不使用此总期限：每 5 秒续约，30 秒无有效通信确认失联。
# 有效续约可持续执行；玩家离线或取消后停止新操作，compact 不重置取消状态。
REQUEST_TIMEOUT=80
# NPC 工作线程数；其他业务独立注册处理容量。
MAX_WORKERS=8
MAX_MESSAGE_CHARS=1000
MAX_RESPONSE_CHARS=1600
REQUEST_CACHE_SIZE=1024
REQUEST_CACHE_TTL=300
DEBUG=false

# 注册哪些内置业务；逗号分隔。保留 npc,world 与旧版本行为一致。
# 只需要 NPC 时设为 npc；留空可由受信任的程序入口注册自有业务。
ENABLED_MODULES=npc,world
# 可选主 Agent 路由，默认关闭；只处理显式 agent_run，不接管原 chat/世界请求。
# 简单目标直接处理；提供已配置的 npc_id 才可委派该角色，世界须由宿主绑定冻结事实。
# 使用 OPENAI_* 模型及窗口配置；独立容量不绕过被委派业务的容量与权限。
MAIN_AGENT_ENABLED=false
MAIN_AGENT_WORKERS=2
# 可信部署权限上限（JSON），仅收紧各入口已有权限，不会绕过源码开关或启用主 Agent。
# 省略字段沿用入口权限；指定空数组则全部禁止。适用于 NPC、世界、主 Agent 和本地诊断。
# 可限制 tools/skills/scopes/egress_scopes/agents，以及公开知识相对路径 knowledge_paths。
# 示例只让检索看到 wudang、newbie 文档；不是设置源码目录：
# RUNTIME_POLICY={"knowledge_paths":["wudang","newbie"],"version":"public-v1"}
RUNTIME_POLICY={}
# 默认允许 NPC 和已启用的主 Agent 只读当前仓库，并将回答所需片段交给配置的模型。
# 只配置一个仓库根目录，不按目录、NPC、Agent 或玩家/管理员分别授权。
# 相对路径以 ai/ 服务目录为基准，与启动目录无关；其他 MUD 可改为其仓库绝对路径。
# 始终排除密钥、玩家数据、数据库、日志、隐藏目录、生成缓存及实际配置的私有目录。
# 不会上传整个仓库，也不提供写入、删除或任意 Shell 工具；关闭后仍可使用文档问答。
SOURCE_ENABLED=true
SOURCE_ROOT=..
# 可选 CodeGraph 符号/关系定位：通过统一 exec 工具，未启用时用文字搜索/读取。
# 先由维护者在 SOURCE_ROOT 建索引；模型不能安装、建库或主动同步。默认不启用。
# CodeGraph 自行维护索引缓存，我们不干预其内部行为；不等于授予模型源码/游戏数据写权限。
# 管理员的 CODEGRAPH_* 进程配置会传给 CLI；服务不强制关闭工具自身的下载或维护。
CODEGRAPH_ENABLED=false
# 程序名或路径；Windows 支持正常安装的 codegraph.cmd，无需找包内 Node/JS。
# 也可填写管理员提供的 JSON argv 数组（不是 Shell 命令），不支持 .ps1。
CODEGRAPH_COMMAND=codegraph
# 升级时移除旧 SOURCE_SCOPES_FILE 和角色 source_scopes；残留配置会明确报错，不能静默迁移。
# 启动脚本是否同步知识库。只用自有业务或不需文档检索时可关闭。
# 关闭同步不会删除已有索引，也不会禁止显式运行建库命令。
KNOWLEDGE_UPDATE_ENABLED=true

DATA_DIR=data
HELP_DIR=../help
NPC_ROLES_FILE=config/npc_roles.json
# 业务技能包目录；只扫描该目录，不读取 .agents/skills 等开发工具的私有技能。
# NPC、摘要与世界生成均从此目录加载专业指导；缺少必需技能时不会回退源码内提示词。
SKILLS_DIR=skills

# 可选幻境文案创作，默认关闭；复用 OPENAI_* 配置，不占用 NPC 工作线程。
WORLD_ENABLED=false
WORLD_CONTENT_DIR=../data/illusion_world
WORLD_TIMEOUT=90
WORLD_LEASE=180
WORLD_SHORT_TIMEOUT=3
WORLD_SHORT_WORKERS=2
WORLD_QUEUE_LIMIT=256
# 按 UTC 自然日统计，失败和重试均计入；这是调用次数上限，不是金额上限。
WORLD_DAILY_LIMIT=300
WORLD_STORAGE_BYTES=1073741824
WORLD_DISK_HEADROOM=67108864
```
