# Spec Delta

## ADDED Requirements

### Requirement: Shared martial actions use the current practitioner

玉箫剑法“极意”的动态攻防数值 SHALL 按本次施招者的有效技能和原随机公式计算，不依赖首次加载者或其他角色的状态。技能在无当前玩家时 SHALL 能正常加载；一次施招结果 MUST NOT 被后续其他角色的施招改写。原普通招式、等级资格和选择规则 SHALL 保持。

#### Scenario: Two practitioners alternate the same action

- **WHEN** 技能等级不同的两个角色交替施展“极意”，并交换技能对象的首次加载顺序
- **THEN** 每次五项动态数值均使用当次角色的有效技能，先前返回的动作结果不被后续调用改写

#### Scenario: A practitioner improves after the skill was loaded

- **WHEN** 技能已加载，角色相关技能等级发生变化后再次施展“极意”
- **THEN** 数值按当前等级计算，不沿用加载时或上次施招的结果

#### Scenario: Cold loading and ordinary actions remain usable

- **WHEN** 无当前玩家时加载技能，随后合格角色执行普通招式及“极意”
- **THEN** 加载无运行错误，普通招式数值保持，玉箫剑法自身等级为 200 时不进入原要求高于 200 的“极意”选择范围，超过该等级时仍按原规则选择

### Requirement: Sword practice checks every consumed resource

回风落雁剑练习 SHALL 在消耗前同时检查至少 50 内力及 40 气血；任一不足 MUST 拒绝且不扣除另一项资源。足额时 SHALL 保留原持剑资格、练习结果和每次扣除 50 内力、40 气血的行为，不通过负值或事后钳零结算。

#### Scenario: One resource is insufficient

- **WHEN** 其余条件合格而内力为 49，或气血为 39
- **THEN** 练习失败，两项资源均不变，提示指出实际不足的资源

#### Scenario: Resources exactly cover one practice

- **WHEN** 角色持用合格剑且内力为 50、气血为 40
- **THEN** 本次练习成功并分别扣至 0，不额外增加资源预留要求；再次练习因不足而拒绝

#### Scenario: Repeated practice cannot overdraw

- **WHEN** 角色连续练习，或在资源足够时改持不合格武器
- **THEN** 每次成功只扣原成本，剩余任一资源不足或武器不符时拒绝且不继续扣费

## MODIFIED Requirements

### Requirement: Inner energy costs cannot be overdrawn

本次修复的练习、主动绝招及额外命中特效 SHALL 正确扣除内力。主动施展不足完整成本时 MUST 在效果前拒绝；可选额外特效不足支付时 MUST 不触发。MUST NOT 以负内力或事后钳零代替足额支付。

#### Scenario: Energy is just below or equal to cost
- **WHEN** 神行百变、碧云心法、袈裟及参合路径的内力低于或等于实际成本
- **THEN** 不足时拒绝相应动作/额外特效，足额时保留原效果并精确扣费；轻功练习扣真正内力而非新增拼写错误字段

#### Scenario: Hidden blade performance requires its full cost

- **WHEN** 胡家刀法“八方藏刀势”的其余条件合格，当前内力分别低于、等于或高于 220
- **THEN** 不足时拒绝且不产生本招扣费、攻击、临时增幅或忙乱；足额时本招直接扣费仍为 220，原八次攻击上限、增幅撤销、目标限制及忙乱规则保持
