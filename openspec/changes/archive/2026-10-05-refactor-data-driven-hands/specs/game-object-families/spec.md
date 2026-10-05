# Spec Delta

## ADDED Requirements

### Requirement: Hand equipment preserves its actual slot and interactions

获准迁移的手部装备 SHALL 保持原手部槽位、穿脱文案、属性增减、别名、限制及原外部互动条件；MUST NOT 因名为戒指、指套或弓就更改类别，也不将描述扩展为新的能力。具有真实价格、材质、显示或门派加成差异的品种 SHALL 分开维护，等价跨地区定义 SHALL 合并；未选研读和死亡销毁装备 SHALL 保持原行为。

#### Scenario: A ring and a bow are used as hand armor

- **WHEN** 玩家或 NPC 按原方式穿戴本批戒指或点金盘龙弓
- **THEN** 仍占用原手部槽位并提供原加成，不改成独立戒指槽、可发射武器或其他装备能力

#### Scenario: Golden silk gloves allow the existing cave interaction

- **WHEN** 角色穿戴金丝手套并操作原有移桌、取鼎流程
- **THEN** 保持原手套识别与成功结果；未穿戴或戴其他手套仍触发原失败后果，不获得额外全局免毒能力

#### Scenario: Specialized hand equipment remains outside the batch

- **WHEN** 原研读铁手掌或两件主人死亡时销毁的黄金装备被使用
- **THEN** 原路径与读书、销毁行为保持，普通手部装备不获得这些能力
