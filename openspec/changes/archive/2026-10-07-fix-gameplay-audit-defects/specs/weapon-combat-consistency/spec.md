## ADDED Requirements

### Requirement: Riposte and remote enforcement use actual combat state

反击 SHALL 使用反击时的实际主武器或空手状态，结算与动作一致。远程加力 SHALL 在足额扣内力后将对应加成加入伤害，非远程原抵抗规则保持。

#### Scenario: Armed and unarmed ripostes
- **WHEN** 持械或空手角色因对手失误反击，包括主武器变化之后
- **THEN** 使用当前合法武器/技能、伤害与命中回调，不读取无关持久属性

#### Scenario: Remote enforcement is affordable
- **WHEN** 相同远程攻击分别在零加力、足额正加力及内力不足时结算
- **THEN** 足额时扣费且增加伤害，不足时不扣额外费或产生加成，非远程抵抗仍生效

### Requirement: Dual performance preserves the longer busy state

左右互搏 SHALL 临时解除第一招忙乱以施展第二招，并保留应有的较长忙乱；恢复 MUST NOT 再次施加忙乱减免。第二招失败不得取消第一招忙乱；函数型动作状态不被错误当作数值覆盖。

#### Scenario: Second performance changes the busy duration
- **WHEN** 第二招失败、忙乱较短或较长
- **THEN** 最终保留第一招或第二招应有的较长忙乱，既不清零也不重复打折
