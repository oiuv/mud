# Spec Delta

## Purpose

为通用任务系统提供可选的结果式奖励完成契约，使宿主能在奖品交付失败时保留未完成状态，同时兼容既有任务和宿主覆盖，不将具体游戏的物品、负重或奖励算法写入框架。

## ADDED Requirements

### Requirement: Opted in rewards control completion

主动选择结果式奖励接口的任务 SHALL 在条件满足后执行一次回调；仅成功结果 SHALL 导致移除待办、标记完成、保存及完成消息。拒绝或异常 MUST NOT 标记成功或回退调用旧奖励接口。失败回调 SHALL 由宿主保证不发放部分奖励，框架不承诺回滚任意业务副作用。

#### Scenario: A reward callback declines delivery
- **WHEN** 无交物需求的合格任务回调因奖品无法交付返回失败
- **THEN** 待办与已完成状态不变，不显示成功消息，玩家之后可以重试

#### Scenario: A reward callback succeeds
- **WHEN** 同一任务回调交付奖品并返回成功
- **THEN** 完成状态和奖励一起进入随后保存的玩家状态，不再次执行旧奖励入口

#### Scenario: A callback throws
- **WHEN** 选择的新回调抛出异常
- **THEN** 不吞错宣称成功，不调用另一奖励入口重试，不将任务标记完成

### Requirement: Legacy quest integrations remain compatible

未选择新接口的任务 SHALL 保留现有奖励接口及宿主覆盖分派，缺少新回调 MUST NOT 被视为奖励失败。框架 MUST NOT 引入本游戏角色、奖品、奖额、负重规则或离线补发存储。

#### Scenario: Existing host uses legacy rewards and overrides
- **WHEN** 旧任务仅提供现有奖励接口，或宿主覆盖既有任务完成方法
- **THEN** 原公开入口、旧名称桥接和父实现调用继续正常，新接口不会使旧奖励被跳过或执行两次
