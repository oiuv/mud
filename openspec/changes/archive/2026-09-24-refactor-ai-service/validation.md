# 验收记录

2026-09-24 完成 `refactor-ai-service`。本记录属于变更历史；`ai/README.md` 只描述当前功能与使用。

## 已运行的验证

| 验证 | 结果 |
| --- | --- |
| 重构前 Python 基线 | 89 项：Windows 81 通过，8 项 Linux 专用跳过 |
| `ai/.venv/Scripts/python.exe -m unittest discover -s ai/tests -q` | 101 项：Windows 93 通过，8 项 Linux 专用跳过 |
| `wsl -d Ubuntu --cd /mnt/c/msys64/home/Administrator/mud -- python3 -m unittest discover -s ai/tests -p test_launcher.py -v` | Linux 启动器 8 项全部通过 |
| `ai/.venv/Scripts/python.exe -m unittest discover -s tools/tests -p test_run_windows.py -v` | 游戏 Windows 启动器 10 项全部通过 |
| `node ai/scripts/test_lpc.mjs` | 真实 FluffOS + 假模型、真实 UDP，163 项检查全部通过 |
| 项目 LPC 格式化及 `--check` | 本次 10 个 LPC/头文件通过 |
| `python -m pip check` | 无依赖冲突 |

闭环使用独立临时 mudlib 和随机本机端口，编译实际客户端、适配层及更新命令，并提取未修改的周不通、李白、模板 NPC 的聊天入口和完整影子入口接到测试宿主。覆盖等待提示、名称、防重复、身份校验、错误来源/类型/编号、字节上限、容量、重传、超时、销毁、回调异常、重载、真实服务停止及恢复。`updateall` 测试目录中放置无效 C 文件，确认 `/ai/` 与隐藏子目录均跳过。

本次没有在真实游戏执行 `updateall /`，没有调用真实模型；自动测试不写真实玩家数据。

## 实现中确认的问题

FluffOS 的 UDP 读错误可能关闭底层 socket，且 DATAGRAM 不注册关闭回调。服务停服后，原客户端可能一直持有失效 fd。客户端现通过 `socket_status()` 检查状态和所有者，在后续发送或重传前重新绑定；真实停止/恢复测试已覆盖，无需修改驱动。

公共模型与 NPC 组件增加明确的资源所有权及初始化失败、关闭异常后的清理。借用客户端由注入方关闭。NPC 历史、关系与去重结果仍在同一个 SQLite 事务提交。

## 本地数据与迁移演练

本地服务原先未运行，整个目录从 `npc_ai/` 移为 `ai/`；原 `.env`、角色、知识库、对话、记忆等 11 个文件的迁移前后 SHA256 全部一致。旧虚拟环境保存在忽略的 `ai/.run/venv-before-rename/`，新 `.venv` 按原依赖版本重建。

临时数据迁移测试另验证：角色与配置不被覆盖，BM25/向量索引可复用，聊天历史和关系保持，成功请求在移动目录及重启后仍去重。显式数据路径继续按原配置使用。

## 部署与回退

1. 停止线上旧服务；保留 `.env`、`config/npc_roles.json`、整个数据目录及日志。数据库应停服后复制；新旧位置均有数据时不要相互覆盖。
2. 部署 `ai/` 代码，迁入运行文件，在新目录执行 `setup` 重建虚拟环境；核对配置中的绝对路径，以及 systemd/计划任务等外部启动路径。
3. 在无在途聊天时更新游戏 AI 守护程序与头文件，确认 `AI_NPC_D` 可加载，然后单独启动 `ai/start.bat` 或 `ai/start.sh`。游戏启动脚本只提示命令。
4. 回退前停止新服务，保留新产生的数据，用同一份兼容数据库恢复旧代码，重新创建旧路径的虚拟环境和外部启动配置；不要同时运行两个实例。

真实模型验收尚未执行。上线后可先运行 `scripts/diagnose_chat.py --config-only` 核对脱敏配置，再单独执行聊天诊断或游戏 `talk butong 武当派如何拜师？`。后者会使用模型额度并保存正常对话。验证一次等待提示、完整回复、连续提问提示，以及停止/恢复服务后的重新提问。详见 [客户端验证步骤](../../../../docs/daemons/ai_client_d.md#验证)。

无限世界仍处于规划阶段，没有添加世界生产路由或实现世界玩法；本次仅提供其接入所需公共接口。
