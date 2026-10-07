# martial-arts-effects Specification

## Purpose

保证武学施展、练习和恢复使用真实技能及角色状态，按既定成本消耗资源，并使不同角色的持续效果互不干扰。以可重复的状态断言验证功能正确性，不把普通强弱差异当成实现缺陷。

## Requirements

### Requirement: Martial effects use the intended participant and statistic

武学 SHALL 使用实际受击目标、真实技能等级和公共属性接口计算命中、反制、增幅与恢复，不以布尔比较或不存在的技能/属性替代数值。

#### Scenario: Counter and enhancement effects use actual skills
- **WHEN** 参合、太玄、抽髓及如影随形在合法条件下施展
- **THEN** 反制等级差、内功贡献及力量身法增幅真实生效，结束后原有其他增幅保持

#### Scenario: Cold and healing effects execute
- **WHEN** 冰心诀攻击或醉酒、先天功、血刀恢复效果发生
- **THEN** 攻击判定使用敌方防御、削减而非增加敌方内力，恢复效果实际增加预定当前精气且不超过有效上限

### Requirement: Inner energy costs cannot be overdrawn

本次修复的练习、主动绝招及额外命中特效 SHALL 正确扣除内力。主动施展不足完整成本时 MUST 在效果前拒绝；可选额外特效不足支付时 MUST 不触发。MUST NOT 以负内力或事后钳零代替足额支付。

#### Scenario: Energy is just below or equal to cost
- **WHEN** 神行百变、碧云心法、袈裟及参合路径的内力低于或等于实际成本
- **THEN** 不足时拒绝相应动作/额外特效，足额时保留原效果并精确扣费；轻功练习扣真正内力而非新增拼写错误字段

### Requirement: Timed effects recover independently

持续效果 SHALL 按目标独立解除；其他人的施展 MUST NOT 取消本人的恢复或反噬。重复效果不得让旧回调提前解除新效果；疗伤结束和中断 SHALL 清除自己的活动状态。

#### Scenario: Multiple targets overlap
- **WHEN** 两个目标在不同时间受摄心，或两人先后触发碧焰反噬
- **THEN** 各自效果在各自期限解除或执行，不相互取消，目标销毁不破坏其他目标的任务
