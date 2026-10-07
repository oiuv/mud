# Spec Delta

## ADDED Requirements

### Requirement: Container placement conserves stack quantity

普通容器放入 SHALL 在拆分前验证容器和物品准入；拒收、创建候选失败或移动失败 SHALL 保留玩家原有数量，MUST NOT 留下不可取回的无环境临时物或额外副本。成功放入及合并 SHALL 恰好转移请求数量；全量放入与批量放入继续遵守原准入规则，不放宽仓库或背包限制。

#### Scenario: A partial stack targets a non-container

- **WHEN** 玩家持有多枚钱币，尝试把其中一枚放进普通衣物
- **THEN** 操作明确拒绝，玩家持有总量不变，不创建遗留的无环境钱币

#### Scenario: A partial stack is refused by an existing rule

- **WHEN** 目标是专用仓库入口、容器件数已满，或待放物品禁止放入
- **THEN** 给出原用途的提示或拒绝，原数量和目标内容均不变

#### Scenario: Movement fails after validation

- **WHEN** 准入检查通过，但容器负重不足或物品移动返回失败
- **THEN** 本次拆分不造成数量损失，目标不增加数量，玩家可继续使用原有全部物品

#### Scenario: A partial stack is placed successfully

- **WHEN** 玩家把五件堆叠物中的两件放入合法容器，可能与其中已有同类物合并
- **THEN** 玩家剩三件、容器净增两件，合并不会造成重复创建或错误补偿

#### Scenario: Whole-stack and bulk placement still work

- **WHEN** 玩家放入整个堆叠，或批量放入多件物品
- **THEN** 每件物品独立按既有资格处理，成功数量与实际转移一致，拒绝项仍由玩家持有
