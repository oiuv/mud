# Spec Delta

## ADDED Requirements

### Requirement: Hand equipment preserves independent weight values

迁移的手部装备 SHALL 分别保持实际重量与名为 weight 的普通属性，不因属性同名而互相替代。蓝图、克隆、详情、携带负重及重量相关派生数值 SHALL 与原品种一致；内部短 ID 的归并或编号 MUST NOT 改变这些有效值。

#### Scenario: A ring has a weight attribute but no physical weight

- **WHEN** 原戒指的普通 weight 属性为正数，而实际重量为零
- **THEN** 新品种仍能查询原普通属性值，实际重量与携带负重保持零，不把该属性作为实际重量初始化

#### Scenario: A different ring has physical weight

- **WHEN** 另一件同名戒指原来具有非零实际重量和不同价格
- **THEN** 保留独立规范品种、原重量和价格，蓝图与克隆均正确，不与前一戒指合并
