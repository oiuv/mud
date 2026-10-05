# Spec Delta

## ADDED Requirements

### Requirement: Hand equipment distribution and records survive canonicalization

手部装备迁移 SHALL 保持原 NPC 领取口令、各自资格、持有检查、库存、冷却及奖励分布；相同奖励的重复条目用于概率权重时 MUST NOT 因品种归并而去重。现有统一离线预览与转换 SHALL 同时覆盖服装、鞋靴、头饰和手部装备，保持旧路径到规范路径的恢复、原数量与价格、无关字段、幂等、冲突拒绝及原始备份；存取资格不因新路径放宽。

#### Scenario: Two suppliers hand out the same varieties under different rules

- **WHEN** 玩家向武修文或道相领取皮手套、铁指套
- **THEN** 均得到对应规范品种，分别保持原门槛、持有判断和共享库存，不给武修文新增道相的门派限制，其他护具分支不受影响

#### Scenario: An existing weighted reward pool is migrated

- **WHEN** 打铁僧在原条件下发放铁手掌
- **THEN** 普通品种与研读品种仍保持原 9:1 权重，原冷却、身上及地上持有判断和库存恢复不变

#### Scenario: Four item families appear in one backup

- **WHEN** 临时玩家、商店或已明确选择的旧袋记录混用四类旧路径与新规范路径
- **THEN** 同一次预览和转换保持各品种及数量，同品同价商店库存合计，价格冲突整批拒绝；未选物品和字段不变，原字节可恢复，再次转换零变更
