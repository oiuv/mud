# Proposal

## Why

2026-10-07 审查确认两处身份校验缺陷（SEC-01、SEC-02），以及实物交付失败、延迟回调丢奖两类任务结算缺陷（WL-02、WL-03）。本批修复这四项，不将剩余武学数值问题或权限体系迁移混入。

## What Changes

- 可信身份刷新时同步撤销失效的驱动巫师标记，保留既有六级角色、命令路径和 UID/EUID。
- 补齐 `quest2 <id> <编号> -s` 的管理身份检查，保持玩家查询自己任务的功能。
- 铁匠与宝镜实物奖品须成功交到玩家手中才结算；超重则保留任务进度、交付物和数值，不落地代领，整理行囊后可重试。
- 为 mudcore 任务完成流程增加可选的成功结果回调，铁匠任务选择接入；旧 `reward()` 任务和宿主覆盖保留兼容。
- 运送任务在接受货物时结算数值奖励，不再依靠玩家稍后仍存在且清醒的回调；保留奖额公式、衰减和上限，不新增离线奖励平台。
- 增加隔离真实驱动回归、旧代码负对照和必要文档，接入统一玩法测试入口。

## Capabilities

### New Capabilities

- `player-management-authorization`：可信身份更新与他人任务信息访问边界。
- `quest-reward-settlement`：任务奖励交付、失败重试及运送奖励结算。
- `mudcore/quest-completion`：可选结果式任务奖励回调与旧宿主接口兼容。

### Modified Capabilities

无。已核对 `game-object-lifecycle`：其现有物品迁移、交易和背包要求保持，本次任务结算建立独立能力边界。

## Impact

- 宿主：`feature/command.c`、`cmds/usr/quest2.c`、`adm/daemons/quest/_0_smith.c`、`adm/daemons/task/set_task.c`、`clone/quest/deliver.c`；复用 `GIFT_D`，不全局改写奖励算法。
- 框架：`mudcore/system/daemons/quest_d.c`、对应框架文档与回归；不得内置铁匠、宝镜或本游戏身份策略。
- 测试与文档：`tools/tests/`、`tools/test_gameplay.mjs`、权限及任务说明、原审查报告、`help/changelog`。
- 不读取或修改正式玩家存档，不补发历史损失，不操作正式服务，不自动提交、推送或发布。已完成时钟批次与 AI 效果任务保持独立。
