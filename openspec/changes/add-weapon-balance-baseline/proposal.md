# Proposal

## Why

已确认的四项武学状态、资源和分发缺陷已在 `1f8dcdbd` 修复，但功能回归不能回答兵器与武学是否平衡。先建立不改变正式玩法的同条件真实驱动评测，分清伤害、控制、资源和忙乱代价，再决定是否需要差异化或数值调整。

## What Changes

- 增加独立的隔离评测入口，复用现有源码副本、真实角色继承及驱动启动方式，不连接正式服、加载玩家存档或调用 AI。
- 首批仅比较盘古七势／撼山锤法、中平枪法／胡家刀法、打狗棒法／缠魂索三组。分别记录已激发武学的普通攻击、单次绝招和短时交锋，保留实际资格检查、随机行为和结算。
- 固定角色、兵器与防具条件，记录基础、特殊及有效技能的不同口径；零加力与指定正加力分开，不把额外内功或武器钩子的成本漏算为零。
- 输出逐样本记录、汇总及中文分析，说明统计误差、未覆盖的玩家养成/门派配装与实服差异。遇到确定缺陷独立报告，不在本批调正式公式。
- 核验工具本身的数据完整性、隔离和统计口径，完整评测不纳入每次核心玩法快速回归。

## Capabilities

### New Capabilities

无游戏能力新增。本批是离线评测工具及开发报告，使用 `skip_specs: true`，不为测试实现增设游戏主规范。

### Modified Capabilities

无。`martial-arts-effects` 和 `weapon-combat-consistency` 的正式行为保持，已有缺陷回归不由统计评测替代。

## Impact

- 计划增加 `tools/bench_weapon_balance.mjs`、`tools/tests/weapon_balance/` 夹具及工具自检；参考现有 `tools/tests/test_weapon_combat.mjs`，不把其中强制命中/随机替换复制进平衡采样。
- 新增 `docs/architecture/weapon-balance-benchmark.md` 说明口径，实际运行后在 `docs/reviews/` 保存结果；原始日志与 JSON 保留在系统临时目录或显式指定的仓库外输出目录。
- 生产源码、mudcore、兵器类别和标志、NPC 教学、技能获取、玩家存档及正式配置全部不变。没有面向玩家的变化，不新增 `help/changelog` 条目。
- 不实现 `EDGED/POINTED/LONG` 被动，不优化 AI 效果，不恢复物品迁移，不把御剑飞升或小李飞刀纳入普通流派排名。
- 依据：[兵器审查](../../../docs/reviews/2026-10-07-weapons-martial-balance.md)、[已归档武学修复](../archive/2026-10-07-fix-martial-state-and-resource-boundaries/verification.md)。本方案不代表评测已实施或平衡已通过。
