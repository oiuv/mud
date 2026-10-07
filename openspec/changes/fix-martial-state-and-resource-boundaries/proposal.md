## Why

第二轮玩法审查剩余的 WB-01～04 是确定的状态取值、资源检查和绝招分发缺陷，不是兵器强弱的设计选择。先消除这些错误，才能在可信的行为基线上开展后续兵器差异化与平衡评测。

## What Changes

- 玉箫剑法“极意”的五项动态数值改为按本次施招者计算；共享动作定义不读取首次加载玩家，也不保存角色专属随机结果。保留原公式、等级条件及动作选择规则。
- 胡家刀法“八方藏刀势”在施展前检查足够支付原有 220 内力；不改变攻击次数、增幅、忙乱与其他资格条件。
- 回风落雁剑练习检查足够支付原有 50 内力和 40 气血，拒绝时不产生消耗；不改变原学习条件和练习收益。
- 持针且未指定武功类别时，`perform` 与普通攻击一样按剑法映射分发；显式指定类别及其他兵器行为保持。
- 顺手修正上述相关文件中确定的错字、攻防对象占位符和资源提示，不新增文案描述之外的效果。
- 扩展现有隔离真实驱动回归，记录修复前负对照、修复后断言和未覆盖项，并同步玩家更新说明及审查状态。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `martial-arts-effects`：补充共享动作按实际角色生成及练习资源足额检查，扩展主动绝招内力边界验收。
- `weapon-combat-consistency`：补充针类武器默认绝招与既有剑法映射一致的分发契约。

## Impact

- 实现涉及 `kungfu/skill/yuxiao-jian.c`、`kungfu/skill/hujia-daofa/cang.c`、`kungfu/skill/luoyan-jian.c`、`cmds/skill/perform.c`；沿用既有对象和调用接口。
- 回归优先扩展 `tools/tests/test_martial_audit.mjs`、`tools/tests/test_weapon_combat.mjs` 及其 LPC 夹具，由 `tools/test_gameplay.mjs` 继续统一执行，不新建测试框架。
- 文档涉及 `docs/reviews/2026-10-07-weapons-martial-balance.md`、审查总览和 `help/changelog`；实施后才记录修复及验证结果。
- 不迁移玩家技能、装备或存档，不修改 mudcore，不改变兵器分类、通用被动、招式成本、伤害倍率或普通攻击规则，不操作正式服务。
- 依据：[第二轮兵器审查](../../../docs/reviews/2026-10-07-weapons-martial-balance.md)。本提案不代表缺陷已经修复或测试通过。
