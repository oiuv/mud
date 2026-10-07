## ADDED Requirements

### Requirement: Commerce conserves quantity and payment

购买数量、收费及商品售价 SHALL 为合法正整数；无效输入 MUST 在钱、物或库存变化前拒绝。NPC 商店、玩家商铺及摆摊 SHALL 使用一致的堆叠基本单位；创建时的默认数量 MUST NOT 增加成交或取回数量。

#### Scenario: Invalid payment or quantity
- **WHEN** 玩家输入零、负数或溢出数量/售价，或公共付款函数收到非正费用
- **THEN** 操作失败且资产与库存不变，不除零、不反向付款

#### Scenario: A stack has a default quantity above one
- **WHEN** 默认生成 50 颗的铁莲子上架一颗，再取回或被购买
- **THEN** 成交/取回恰好一颗，双方库存与持有总量守恒

### Requirement: Storage failure leaves assets intact

背包 SHALL 在拆分物品前检查准入；拒收或交付失败 MUST 保留原数量与记录且不留下不可取回的临时物。成功存取 SHALL 支持合法 `.c`、`.lpc` 实体物品和既有获准虚拟品种，保留原食物、临时状态等禁存边界。

#### Scenario: Rejected partial deposit
- **WHEN** 玩家尝试存入部分黄金、食物或带禁存状态的堆叠物
- **THEN** 明确拒绝，原物品数量不变，背包不增加记录

#### Scenario: Overweight withdrawal
- **WHEN** 玩家取出堆叠物时超重导致交付失败
- **THEN** 原背包数量保持，玩家收到失败反馈，不虚报成功或遗失物品

#### Scenario: A normal LPC book is stored
- **WHEN** 合法的 `.lpc` 枪法入门被存入后取出
- **THEN** 操作成功且品种数量不变，不放宽其他禁存规则
