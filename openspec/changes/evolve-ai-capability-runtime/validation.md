# 实施验证记录

仅记录已执行检查；任务清单和效果验收分开。所有自动测试使用临时数据及假模型，未修改实际 `.env`、未启动正式游戏或调用付费模型。

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
- 执行器目前仅由离线夹具接入，现有业务迁移仍待完成；不能把基础测试当成完整迁移验收。

## 共享检索与源码访问基础

- `python -m unittest ai.tests.test_tools -v`：8 项通过。覆盖受信任工具发现、猜测名称不获授权、参数验证、候选预过滤、向量缓存受众/会话隔离、向量与重排计账、本地回退和 Hook 拒绝后实际用量保留。
- `python -m unittest ai.tests.test_source_tools ai.tests.test_tools ai.tests.test_runtime ai.tests.test_model_tools -q`：45 项全部通过。Windows 临时目录中实际创建符号链接、junction、硬链接，并验证叶文件和父目录替换竞争；未知平台拒绝访问。
- `python -m unittest discover -s ai/tests -q`：173 项，0 失败，8 项既有 Linux 专属测试跳过，用时 90.970 秒。该结果不包含 Linux 源码安全验收。
- 源码范围仍未向现有业务开放；工具的配置装配、完成验证和实服迁移待后续任务。未授权任何真实源码目录或外发。
- 五个中文 Skill 包和加载器已写成初稿，尚未完成其专项测试和业务接入。按用户最新要求，待同步将三个通用操作入口合并为单一 `skill` 工具，以 `action` 和技能名选择操作；不创建逐 Skill 入口。
