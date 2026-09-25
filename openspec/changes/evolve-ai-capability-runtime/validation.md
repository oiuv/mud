# 实施验证记录

仅记录已执行检查；任务清单和效果验收分开。自动测试使用临时数据及假模型；用户已另行授权真实模型测试，调用情况单独记录。未修改实际 `.env` 或启动正式游戏。

## 2026-09-25：基线与独立部署

| 检查 | 结果 |
| --- | --- |
| 基线 `python -m unittest discover -s ai/tests -v` | 122 项，0 失败，8 项 Linux 专属跳过 |
| 基线 `node ai/scripts/test_lpc.mjs` | 163 项，0 失败；临时目录 `mud-ai-lpc-sQN7Se` |
| 基线 `node tools/tests/test_illusion_world.mjs` | 141,287 项，0 失败；重启通过，7 组跨语言向量；1 次假模型调用；临时目录 `mud-illusion-SNGEaK` |
| `python -m unittest ai.tests.test_portable ai.tests.test_lifecycle -v` | 12 项，全部通过 |

新增 `legacy_chat.json` 固定旧省略类型报文，验证重启后缓存重放、历史与关系不重复。世界沿用既有 `test_world` 的持久任务、恢复和原子发布夹具。

独立部署测试只复制服务 `main.py` 和 `src/`，不复制本 MUDLIB、密钥、索引或玩家数据；使用临时星港角色和知识目录，经真实本机 UDP 完成六轮对话及一次摘要。空业务装配不导入 NPC/世界模块；关闭知识同步后不要求帮助目录存在。

这些检查不代表新 Agent 运行时、源码调查或真实模型效果已完成，也不替代实服和 Linux 验收。

## 共享运行时基础

- 新增结构化模型响应，旧文本包装保持；工具请求不能当作文本，能力不匹配不切换模型，迟到响应仍保留用量。
- `python -m unittest ai.tests.test_model_tools ai.tests.test_dispatch ai.tests.test_chat_timeout ai.tests.test_portable -v`：26 项通过。
- `python -m unittest ai.tests.test_runtime ai.tests.test_model_tools -q`：25 项通过，覆盖多轮失败恢复、缺证据继续调查、五类终态、重复工具 ID、父子权限交集、并发预算、取消、Hook 超时/扩权/提交前重验及日志脱敏。
- 此基础阶段执行器仅由离线夹具接入；后续业务接入见下方记录，不能把基础测试当成完整迁移验收。

## 共享检索与源码访问基础

- `python -m unittest ai.tests.test_tools -v`：8 项通过。覆盖受信任工具发现、猜测名称不获授权、参数验证、候选预过滤、向量缓存受众/会话隔离、向量与重排计账、本地回退和 Hook 拒绝后实际用量保留。
- `python -m unittest ai.tests.test_source_tools ai.tests.test_tools ai.tests.test_runtime ai.tests.test_model_tools -q`：45 项全部通过。Windows 临时目录中实际创建符号链接、junction、硬链接，并验证叶文件和父目录替换竞争；未知平台拒绝访问。
- `python -m unittest discover -s ai/tests -q`：173 项，0 失败，8 项既有 Linux 专属测试跳过，用时 90.970 秒。该结果不包含 Linux 源码安全验收。
- 源码范围仍未向现有业务开放；工具的配置装配、完成验证和实服迁移待后续任务。未授权任何真实源码目录或外发。
- 此时五个中文 Skill 包为初稿。随后按用户确认方案实现唯一 `skill(name, path?)`，自动注入授权名称/描述；没有 `action` 分发，也没有三个操作入口，见当前设计与运行时验收报告。

## 2026-09-25—26：业务迁移

- 基础阶段已提交 `0da0c7ab`，未推送。后续 NPC、摘要与世界业务改为统一 Agent/Tool/Skill/Hook；旧入口、存储、成功缓存及世界内容键保留。
- NPC 共享期限、摘要/模型/检索预算和事务终态；世界保持一次尝试一次生成、三次持久尝试、额度、429 退避、租约及原子发布，Skill 升级不重做旧正文。
- 最终 `python -m unittest discover -s ai/tests -q`：246 项，238 通过、8 项 Linux 专属跳过，135.002 秒；运行时进入失败不再误终结父调用或清除其待提交候选。
- `node ai/scripts/test_lpc.mjs`：163 项检查通过；`node tools/tests/test_illusion_world.mjs`：141,287 项通过，7 组跨语言向量及异步发布回退通过；`node tools/tests/test_illusion_encounters.mjs`：通过。
- 无 MUDLIB 独立部署使用另一个目录的角色、知识和 Skill，六次知识问答、一次摘要经真实环回 UDP 通过，未读取正式游戏目录。
- 合成资料真实业务联调最终批次 4 次调用、5,558 tokens；另两批的报告问题与额度边界如实记录在 [运行时验收记录](../../../docs/architecture/ai-runtime-validation.md)。仅为小样本链路验证，不是源码 20 题准确率验收。
- 本阶段未改 LPC、mudcore、FluffOS 或正式运行数据；未勾选无限世界剩余玩法验收。旧诊断脚本旁路、源码/主 Agent、Linux 与实服验收仍待继续。
- `openspec validate evolve-ai-capability-runtime --strict` 通过；`openspec validate --all --strict` 8 项通过。任务清单 21/39，不归档本变更。
