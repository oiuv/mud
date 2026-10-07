# auction-settlement Specification

## Purpose

规范玩家拍卖中拍品资格、竞价归属与钱物结算的可观察行为。在卖家继续持有拍品的模式下，保证失败不吞钱、不擅自取走第三人物品，且只有完整交付才报告成交。

## Requirements

### Requirement: Auction listings require current seller possession

拍卖 SHALL 在上架、接受竞价和结算前确认拍品仍由该卖家直接持有且满足原可售条件。已销毁、转交他人、放到地上或不再可售的拍品 MUST 使记录失效，MUST NOT 被强制取回出售。拍卖仍 SHALL 保持卖家持有模式，不因取消记录而移动物品。

#### Scenario: A listed item is transferred to another player

- **WHEN** 卖家上架后把拍品交给第三人，随后收到竞价或到达结算时刻
- **THEN** 拍卖失效，第三人继续持有拍品，买家不被扣款，卖家不获得货款

#### Scenario: A listed item becomes unavailable for sale

- **WHEN** 拍品被销毁、离开卖家直接物品栏，或后来带有禁止出售或丢弃的状态
- **THEN** 该记录停止竞价和结算，不发布成功成交消息，也不替卖家重新创建同类物品

#### Scenario: A seller cancels a valid listing

- **WHEN** 卖家取消尚未成交的有效拍卖
- **THEN** 只撤销记录，拍品保持原位置，双方没有新的钱物变动

### Requirement: Each auction resolves its own bidder

每笔拍卖 SHALL 仅使用本记录的竞价者和价格；无竞价者或竞价者已退出时 MUST NOT 继承其他拍卖的买家。处理多条记录的顺序 MUST NOT 改变各自归属、扣款或无人竞价结果。

#### Scenario: An unbid listing follows a listing with a buyer

- **WHEN** 同一次检查处理一笔有买家的到期拍卖和一笔无人竞价的到期拍卖
- **THEN** 后者按无人竞价取消，不向前者买家交付或收钱；调换处理顺序结果相同

#### Scenario: One bidder has logged out

- **WHEN** 两笔拍卖分别绑定不同买家，其中一位买家已退出
- **THEN** 失效买家不参与结算，另一笔继续使用自己的买家和价格

### Requirement: Settlement succeeds only after payment and delivery

拍卖 SHALL 保持成交价及向下取整的 4% 卖家佣金；卖家仍须自备佣金，不改为从货款抵扣。佣金为零时 SHALL 免收而非调用非法付款。付款、佣金或交付失败 SHALL 取消本笔结算并返还已扣款项，拍品不被当作已售；成功消息及卖家货款 SHALL 只在钱物交付条件全部成立后发出。普通失败 MUST NOT 丢钱、复制物品或把未送达报成成功。

#### Scenario: A normal auction completes

- **WHEN** 买家可支付成交价，卖家可支付佣金且拍品成功交付
- **THEN** 买家净支出成交价并得到拍品，卖家净收入成交价减佣金，拍卖结束且只报告一次成交

#### Scenario: A low price has zero commission

- **WHEN** 合法成交价为 24 文且其他条件满足
- **THEN** 买家支付 24 文、卖家收到 24 文且得到零佣金待遇，公共付款的非正费用拒绝规则不被放宽

#### Scenario: Funds become insufficient before settlement

- **WHEN** 买家花掉货款或卖家花掉佣金，导致结算时不能付款
- **THEN** 不完成交易；任何已成功扣除的本笔款项均退还，拍品留在卖家处，不发布成交消息

#### Scenario: Delivery is refused after payment

- **WHEN** 买家负重不足或物品拒绝移动导致交付失败
- **THEN** 买卖双方本笔已扣费用退还，卖家不额外获得货款，拍品仍可由卖家取得，不把强制丢在地上当成交付成功

#### Scenario: A stack merges on successful delivery

- **WHEN** 拍品为允许拍卖的堆叠物并与买家已有同类物合并
- **THEN** 买家总量恰好增加成交数量，正常合并不被误判为丢失后重复退款或补发
