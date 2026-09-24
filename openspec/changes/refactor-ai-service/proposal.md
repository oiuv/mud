# Proposal

## Why

现有 `npc_ai` 服务已具备稳定的 NPC 对话、检索和数据保存能力，但 LPC 客户端、Python UDP 入口和模型调用都绑定了 NPC 聊天。无限世界将增加无需玩家等待的场景创作；先提取统一 AI 通信与模型调用接口，可以让后续能力独立接入并保持现有聊天行为。

## What Changes

- **BREAKING（部署路径）**：将 `npc_ai/` 更名为 `ai/`，服务统一称为 AI 服务；同步启动脚本、路径引用、编译排除项和操作说明，保留配置、知识库及聊天数据。
- 保留 `adm/daemons/ai_client_d.c` 作为游戏唯一 AI Socket 请求入口，提供按类型提交、关联回包、超时、有限重传和结果回调的公共接口。
- 将玩家在线校验、NPC 等待提示、同一玩家与 NPC 的重复提问限制、回答展示移到游戏侧 NPC 适配层；已有 `send_chat_request()` 保留薄兼容入口。
- Python 按请求类型分发到业务模块；现有 `chat/memory/config` 归属 NPC 模块，公共入口不再要求 NPC 或玩家身份。
- 提取公共模型客户端与调用期限计算，业务模块明确传入超时和输出上限；保留现有模型、认证、环境变量优先级和 NPC 调用预算。
- 保持 NPC 人设、混合检索、摘要、记忆、关系、离线演示和数据库事务语义，增加非 NPC 请求及回调生命周期回归。
- 作为 `add-wuxia-infinite-world` 的前置变更：本次完成接入边界，持久场景队列、预算与内容发布由无限世界变更实现。

## Capabilities

### New Capabilities

- `ai-request-transport`：与 NPC 无关的 LPC 请求接口、公共 UDP 请求分发、关联验证、有限重传及回调清理。
- `ai-service-modules`：公共模型调用、独立 NPC 业务模块、原有行为和数据兼容，以及 `ai/` 的启动与迁移约定。

### Modified Capabilities

无。现有正式规格仅覆盖 `mudcore`；本次能力属于游戏工程，不为框架引入外部服务依赖。

## Impact

- `adm/daemons/ai_client_d.c`，新增游戏侧 NPC 适配守护程序及宏；核对 `shadow/ai.c` 与 `u/mudren/npc/` 的现有调用。
- `npc_ai/` 全目录迁移到 `ai/`，重组 `src/udp_server.py`、`src/npc_manager.py` 的职责，更新相关脚本和测试导入。
- `run.ps1`、`tools/tests/test_run_windows.py`、`cmds/adm/updateall.c`、`.editorconfig`、忽略规则、`AGENTS.md`、`docs/daemons/ai_client_d.md` 和服务 README。
- 部署需先停止旧服务、保留运行数据、在新路径重建虚拟环境，并更新外部托管路径；游戏启动仍仅提示单独启动 AI 服务。
- 继续使用本机 UDP/UTF-8 JSON、当前默认端口和 Python 依赖；不修改 FluffOS 或 `mudcore`，不增加服务进程、消息中间件或动态插件框架。
- 同步无限世界规划中的服务路径、依赖顺序及公共层与世界业务的任务划分。本变更当前仅创建规划。
