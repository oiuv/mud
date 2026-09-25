# AI 运行时阶段验收记录

日期：2026-09-25。OpenSpec：`evolve-ai-capability-runtime`；既有业务迁移基线：`2f8192a5`。

## 本阶段完成范围

- 固定 Hook 事件、不可变观测、受控追加上下文、工具参数重验；失败、超时和取消均有后置记录。
- 持久化候选与业务提交分离，提交后唯一终态；提交失败不提前报告成功，终态观察失败不重复提交。
- 工具发现、注册表快照、结果上限、共享预算、取消和有界等待；调用 ID 去重包含权限、受众及会话，迟到结果不注册证据。
- 自动发现业务 Skill；只注入授权目录，唯一 `skill(name, path?)` 入口；预加载复用同一边界，正文与资源 hash 在运行内固定。

主要回归：`test_runtime.py`、`test_runtime_lifecycle.py`、`test_skills.py`、`test_tools.py`、`test_source_tools.py`、`test_runtime_probe.py`。使用假模型和临时目录，不读取玩家数据。

## 自动回归结果

本次在 Windows 执行；测试使用现有 `bin/driver.exe`，隔离驱动日志记录版本为 `fluffos 20260729-19ffcc7a-6cf257ce (Microsoft Windows)`。

| 命令 | 结果 |
| --- | --- |
| `python -m unittest discover -s ai/tests -q` | 217 项，209 通过、8 跳过，98.797 秒；跳过项为要求 Linux/flock 的启动器测试 |
| `node ai/scripts/test_lpc.mjs` | 163 项检查，0 失败 |
| `node tools/tests/test_illusion_world.mjs` | 141,287 项检查，0 失败；重启复用、7 组 LPC/Python 内容向量、异步发布/回退通过 |
| `node tools/tests/test_illusion_encounters.mjs` | 遭遇 token 基线通过 |
| `openspec validate evolve-ai-capability-runtime --strict` | 通过 |
| `openspec validate --all --strict` | 8 项通过，0 失败 |

LPC 测试在临时 MUDLIB 运行；世界测试中的“1 model call”来自假模型计数，不计入下节的真实 API 调用。地图预览仅生成在系统临时目录，未加入仓库。Windows 驱动日志提示平台不支持 eval limit，因此本轮不作为 Linux eval 成本验收，也不代替实服联调。本次没有修改 LPC 文件。

## 真实模型链路验证

经用户授权执行一次 `python ai/scripts/verify_runtime.py --execute`，使用部署配置的 `qwen3.8-flash`。仅发送脚本生成的虚构霞门规则，不发送游戏源码、玩家历史或真实世界数据。

| 测试 | 模型调用 | 工具调用 | 耗时 | Token | 结果 |
| --- | ---: | ---: | ---: | ---: | --- |
| 发现 Skill → 加载正文 → 读取包内参考资料 → 回答 | 3 | 2 | 3.336 秒 | 2,004 | 通过 |
| 程序通过统一工具预加载 → 单次生成 | 1 | 1 | 1.255 秒 | 199 | 通过 |
| 合计 | 4 | 3 | 4.591 秒 | 2,203 | 两条路径均通过 |

两条路径均区分“入门贡献门槛 200”和“成功后扣除 50”；调查路径实际读取了参考文件，不因碰巧猜中答案而通过。调用和工具均记录后置事件，每次运行只有一个完成事件。用量为接口返回值；耗时是本次样本，不代表稳定延迟或成本上限。

## 验收边界与下一步

本记录验证共享机制，不代表整个架构重构完成。既有 NPC、内部摘要及世界生成尚未接入该运行时；下一步须保留其历史、关系、成功去重、持久队列和正文发布契约，逐项迁移并核对提交终态。

尚未完成：实际源码调查及至少 20 题评测、主 Agent 路由/委派、Linux 专属安全与部署项、游戏联调及临时数据升级/回退演练。真实模型调用授权不等于开放任意源码或玩家数据的读取/外发权限，实际 scope、受众仍须明确配置。不得据此勾选无限世界玩法验收、归档整个变更或自动重生成旧正文。
