# Proposal

## Why

本轮玩法修复已有五组独立隔离回归，最近一次共通过 788 项检查，但维护者仍需逐条执行并人工汇总。增加一个薄封装入口，使后续核心玩法修改能方便地复验，不改变现有测试断言和隔离边界。

## What Changes

- 新增 `node tools/test_gameplay.mjs`，默认顺序执行交易与背包、公共战斗、具体武学、AI LPC 通信、NPC 重连五组正向回归。
- 支持显式指定驱动和 Python，检查必要运行依赖；不自动安装依赖、不启动正式服务或调用模型。
- 保留各组输出、失败信息和临时日志路径，汇总实测检查数、状态及耗时；任一失败或结果不完整均返回非零退出码，普通单组失败不跳过剩余组。
- 用 Node 内置测试验证编排、统计和失败语义，再通过统一入口复跑真实驱动；同步开发说明和测试入口索引。

## Capabilities

### New Capabilities

无。本次是既有回归的开发工具封装，不新增游戏或 AI 业务能力。

### Modified Capabilities

无。现有业务规范与测试质量标准保持不变，设置 `skip_specs: true`，不为工具封装增加业务规范。

## Impact

- 预计新增 `tools/test_gameplay.mjs` 及其 Node 编排单元测试，复用 `tools/tests/test_{commerce_audit,weapon_combat,martial_audit}.mjs` 和 `ai/scripts/verify_{lpc,npc_reconnect}.mjs`。
- 文档范围为 `AGENTS.md` 的测试入口说明、`docs/architecture/gameplay-audit-fixes.md` 和 `ai/scripts/README.md`；不在项目介绍或玩家更新日志中添加开发工具内容。
- 使用现有 Node、Git、FluffOS、Python；不增加 npm/Python 依赖，不重写五组测试、不新增测试框架、持续服务或 CI 平台配置。
- 不改游戏逻辑、存档、mudcore、模型配置；不归档其他变更。本次工作区已有的 `data/e2c_dict.o`、`data/emoted.o` 修改保持原样。
- 用户已反馈重启后 `updateall /` 成功编译 9,989 个档案；这属于本轮修复的实服编译证据，不代替新入口的实施验收。
