# Spec Delta

## ADDED Requirements

### Requirement: Default needle performances use the sword mapping

角色持针且未显式指定绝招类别时，系统 SHALL 使用既有剑法映射，与针类普通攻击的武学归属一致。显式指定类别、其他兵器和空手的分发 SHALL 保持；本项 MUST NOT 绕过绝招原有持器、领悟、资源、目标或忙乱限制，也不新增基本针法。

#### Scenario: A needle user omits the category

- **WHEN** 持针角色已激发剑法且满足原绝招资格，分别输入省略类别及显式 `sword.` 的同一绝招
- **THEN** 两者到达相同的剑法绝招入口并使用相同的资格检查，默认分发不再因查找针法映射而失败

#### Scenario: Explicit selection and invalid qualifications are preserved

- **WHEN** 玩家明确指定其他类别，或未激发剑法、未领悟绝招、资源不足、目标不符或处于忙乱
- **THEN** 仍按原显式类别及资格规则处理，不因默认针类映射而允许原本不合法的施展

#### Scenario: Other weapons and dual performances retain their behavior

- **WHEN** 角色改持剑、刀或空手执行默认绝招，或在合法左右互搏中使用针类绝招
- **THEN** 其他类别的原分发不变；针类每次省略类别的分发一致，左右互搏保留既有两次施展及较长忙乱的规则
