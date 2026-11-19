# Spec Delta

## Purpose

保证角色通过正常教学和领物入口时，资格、所获许可、武学奖励、资源扣除及实际交付对应同一项已存在的能力。重复询问和失败路径不得造成重复奖励、额外扣费或已有修为降低，修复不自动改写历史玩家记录。

## ADDED Requirements

### Requirement: Teaching grants the requested existing ability

系统 SHALL 将已确认教学错配修正为对应真实能力的许可和武学奖励；MUST NOT 声称传授成功却写入无关许可或奖励另一门武学。重复传授不得重复给予本次奖励或扣除本次贡献。

#### Scenario: First and repeated learning
- **WHEN** 合格玩家首次询问已修复的破甲推山或谁与争锋，再次询问相同绝招
- **THEN** 首次取得实际施展所需许可、奖励正确武学并扣既定贡献；再次不重复该奖励或贡献扣除，正常询问自身的成本保持

### Requirement: Qualification and delivery preserve player resources

系统 SHALL 在教学、拜师及物品交付前执行其明确的原资格与完整成本检查。拒绝或交付失败 MUST NOT 发放对应奖励、扣除交付成本或写入成功标记；补授 MUST NOT 降低已高于补授标准的修为。

#### Scenario: Qualification or delivery fails
- **WHEN** 悟性、门派、贡献或其他明确前置不合格，或物品无法交付
- **THEN** 本次业务拒绝，不留下成功许可、扣费或通过标记；反馈指出实际失败原因

#### Scenario: Advanced player receives supplementary teaching
- **WHEN** 玩家已有武学高于补授目标等级
- **THEN** 补授不降低已有等级，其他资格和一次性规则保持

### Requirement: Teacher routes and help match actual teaching

已修复教师的展示目录、自动动作及往返流程 SHALL 使用实际存在并与其资格一致的能力、角色及地点。面向玩家的教学文本 MUST 正确指明技能、人物及要求，不暴露内部实现。

#### Scenario: Guided access completes
- **WHEN** 合格玩家由冯默风带路至学艺入口
- **THEN** 玩家到达原定地点，带路教师可返回其原房间，不因缺失出生地记录遗留在终点

#### Scenario: Legal combat and learning paths
- **WHEN** 玩家取得裘千尺无影掌领悟、修习靛沧海，或NPC按已修配招进入战斗
- **THEN** 无影掌按其真实许可与原教学级别施展单掌，靛沧海用真实基本内功进阶；自动配招与角色已有武学、兵器及内功相符，不开放神照经旧徒手绝招
