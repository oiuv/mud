# AI 服务脚本

所有命令行辅助脚本统一放在 `ai/scripts/`，采用单层目录和 `用途_对象.py` 命名。服务入口仍为 `ai/main.py`，启动器仍为 `ai/start.sh`、`start.bat` / `start.ps1`；自动测试及夹具放在 `ai/tests/`，固定效果题集放在 `ai/evals/`。

## 分类与命名

| 前缀 | 用途 | 约定 |
| --- | --- | --- |
| `ops_` | 部署与运维 | 建索引、启动辅助、业务数据维护；执行前确认目标配置与数据 |
| `debug_` | 开发与故障诊断 | 检查模型、检索或通信；不是自动回归测试 |
| `verify_` | 功能与集成验证 | 检查机制及契约；真实模型探针与离线验证分别说明 |
| `bench_` | 性能基准 | 测量耗时、缓存和用量，不代表回答质量 |
| `eval_` | 效果评测 | 固定题、审核、计分和同条件对照 |
| `example_` | 独立接入示例 | 尽量仅依赖标准库，方便其他 MUD 复制接入 |

新增脚本沿用现有类别和 `snake_case`，不要再用 `test_*` 命名人工诊断入口；`test_*` 留给 `ai/tests/` 的自动测试。修改路径时同步启动器、导入、测试、帮助和文档。不为改名保留重复实现或额外分发器。

## 运维脚本

| 脚本 | 功能 | 数据与外部调用 |
| --- | --- | --- |
| `ops_build_bm25.py` | 构建本地知识索引 | 写知识库索引；不调用远程 API |
| `ops_build_vectors.py` | 补齐文档块与当前模型向量 | 写知识库；会使用远程向量额度 |
| `ops_update_knowledge.py` | 启动前增量更新知识库 | 启动器自动调用；向量失败降级，受更新开关控制 |
| `ops_run_service.py` | Windows 后台启动与日志重定向 | 由 `start.ps1` 调用；会启动服务，不是独立验证 |
| `ops_world_content.py` | 幻境正文状态、修复、备份、恢复及测试生成 | `status` 只查询；其余操作可能写数据，`describe --live` 会调用模型 |

优先通过启动器管理服务。世界备份、恢复及修复遵循[世界运维说明](../../docs/systems/illusion-world-ai.md)，确认服务停机和目标目录后再执行，不将这些入口注册为 Agent 工具。

## 诊断、验证与评测

| 脚本 | 功能 | 默认行为 / 注意事项 |
| --- | --- | --- |
| `debug_chat.py` | 单次模型连通性 | 默认会调用模型；`--config-only` 仅显示脱敏配置 |
| `debug_retrieval.py` | 查看召回片段与阈值效果 | 默认可能调用向量/重排；`--bm25` 离线，可构建本地索引 |
| `debug_source.py` | 本机源码问答诊断 | 默认预览；`--execute --report` 才调查并调用模型 |
| `debug_socket.py` | 已启动服务的短请求烟测 | 直接发送；`chat` 可能计费并保存测试角色历史，不用作长任务客户端 |
| `verify_runtime.py` | 技能发现、工具循环与单次预加载 | 默认预览；`--execute` 用合成资料调用模型 |
| `verify_business_agents.py` | NPC、摘要、重放与世界发布联调 | 默认预览；`--execute` 使用临时库与真实模型 |
| `verify_source_agent.py` | 源码调查小样本与评测共用执行 | 默认预览合成资料；`--execute` 调用模型 |
| `verify_context_window.py` | token 估算与实际用量对照 | 默认预览；`--execute` 调用模型 |
| `verify_compaction.py` | 文本 compact 与任务续行 | 默认预览；`--execute` 调用模型 |
| `verify_codegraph.py` | 隔离 LPC 索引与七项 CLI 查询 | 默认预览；`--execute` 调用本机 CLI、维护临时索引，不调用模型 |
| `verify_upgrade.py` | 旧版/当前版升级回退 | 直接运行隔离演练，创建临时副本，不读正式数据或调用模型 |
| `verify_lpc.mjs` | 真实驱动与假模型 UDP 回归 | 直接启动临时驱动/后端，需要可用 FluffOS 与 Python，不连接正式游戏 |
| `bench_cache.py` | 查询向量缓存基准 | 直接调用远程向量 API，可能写本地缓存 |
| `bench_retrieval.py` | 检索耗时基准 | 默认本地 BM25；`--remote` 调用远程向量/重排 |
| `eval_source.py` | 固定源码题、人工审核与计分 | 默认预览；真实运行需 `--execute --allow-source-egress`；离线审核/计分不调用模型 |
| `example_socket.py` | 可复制的标准库客户端 | 默认预览；`--execute` 才发送，支持长任务续约与取消 |

**分类不等于无副作用。** 沿用各脚本现有参数和默认行为，不要批量执行全部脚本或假设每个脚本都支持 `--help`。真实调用须获授权；报告、思考诊断、索引和运行数据不提交 Git。质量评测方法见 [evals/README.md](../evals/README.md)。

## 常用命令

以下从仓库根目录执行，使用服务虚拟环境的 Python；在 `ai/` 下运行时去掉路径的 `ai/` 前缀。

```sh
# 安全预览 / 脱敏配置，不调用模型
python ai/scripts/debug_chat.py --config-only
python ai/scripts/debug_source.py "入门需要多少贡献？"
python ai/scripts/eval_source.py --suite game-dictionary
python ai/scripts/verify_runtime.py

# 自动离线回归 / 隔离驱动联调
python -m unittest discover -s ai/tests -v
node ai/scripts/verify_lpc.mjs

# 本地索引维护，会写索引但不调用模型
python ai/scripts/ops_build_bm25.py
```

## 旧命令迁移

本次只整理名称和引用，参数、业务协议及默认行为保持。请更新本地计划任务和个人脚本；旧文件入口不再保留。旧评测报告中的命令记录保留当时名称，不代表当前可执行路径。

| 旧名称（原 `ai/scripts/`，另注除外） | 当前名称（统一在 `ai/scripts/`） |
| --- | --- |
| `setup_basic.py` | `ops_build_bm25.py` |
| `setup_qwen.py` | `ops_build_vectors.py` |
| `update_knowledge.py` | `ops_update_knowledge.py` |
| `run_service.py` | `ops_run_service.py` |
| `world_content.py` | `ops_world_content.py` |
| `diagnose_chat.py` | `debug_chat.py` |
| `diagnose_source.py` | `debug_source.py` |
| `test_retrieval.py` | `debug_retrieval.py` |
| `test_client.py` | `debug_socket.py` |
| `test_lpc.mjs` | `verify_lpc.mjs` |
| `benchmark_cache.py` | `bench_cache.py` |
| `performance_test.py` | `bench_retrieval.py` |
| `evaluate_source.py` | `eval_source.py` |
| `ai/examples/socket_client.py` | `example_socket.py` |

其余 `verify_*.py` 名称不变，原 `ai/examples/README.md` 的接入说明合并如下。

## 独立 socket 接入示例

`example_socket.py` 只依赖 Python 标准库，可单独复制到其他 MUD 的接入进程，不需要导入本服务或加载任何 LPC 对象。调用前启动受信任的本机服务；默认只预览，加 `--execute` 才发送，生成请求可能产生模型费用。

```sh
# 短查询，沿用原接口
python ai/scripts/example_socket.py '{"type":"config","npc_id":"li bai"}' --execute
# 主 Agent 须先在服务配置设置 MAIN_AGENT_ENABLED=true，再重启
python ai/scripts/example_socket.py '{"type":"agent_run","request_id":"example-001","player_id":"test_player","goal":"你好"}' --long --execute
```

从自己的 Python 游戏适配层使用：

```python
import threading
from example_socket import request

cancelled = threading.Event()  # 玩家离线/宿主失效时由游戏调用 cancelled.set()
response = request(
    {"type": "agent_run", "request_id": "example-002", "player_id": "test_player",
     "npc_id": "li bai", "goal": "请查明如何拜入武当"},
    ("127.0.0.1", 9999), long_mode=True, cancelled=cancelled,
)
```

`npc_id` 可省略；提供时必须属于已启用 NPC 的角色配置，并绑定该玩家会话。示例编号只作说明，业务须为新目标生成新编号，为同一目标重传保留原编号与内容。游戏负责认证玩家和选择角色，不能将玩家输入直接展开成全部报文字段；本机 UDP 不提供远程认证，token 只关联长请求。

主响应包含 `status`、玩家正文 `answer` 和后台业务 `receipts`。`completed` 表示本次目标完成；`needs_input` 需要新问题补充信息；`incomplete` 表示尚未完成。世界 `accepted/pending` 凭据不代表正文已发布，宿主按世界状态协议继续查询。`error` 是安全失败；不要将内部凭据、错误代码直接显示给玩家。

客户端自动处理在途消息、5 秒续约及30秒失联检测，只返回一次终态；长请求不使用 `timeout` 作为任务总期限。握手前最多重发一次原报文，握手后仅续约。失败、`request_gone` 或进程重启后不自动创建新收费任务；成功响应可在业务缓存有效期内用原编号/内容重放。取消停止续约并尽力发送取消报文，不保证已发生的模型消费回退。

完整字段、信任与去重边界见 [协议说明](../../docs/daemons/ai_client_d.md)。离线 socket 测试使用临时知识库、假模型和随机本机端口，不连接正式游戏或外部模型。
