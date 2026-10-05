# Spec Delta

## MODIFIED Requirements

### Requirement: Families follow shared behavior

分类 SHALL 核对继承、头文件及特殊回调，共有特殊行为 SHALL 可以提取为子类；独有行为 SHALL 允许保留专用实现。不能仅按文件名、显示名或是否存在自定义函数决定归并。已迁移鞋靴 SHALL 保留原足部穿戴、性别限制、洗涤与晾干能力；已迁移头饰 SHALL 保留头部槽位、护甲及魅力等有效加成、原穿戴限制和文案。各类 MUST NOT 从其他物品类别获得原来没有的功能；未选对象的初始化与行为 SHALL 保持现状。

#### Scenario: Clothing parents provide different capabilities

- **WHEN** 一批衣服继承 CLOTH，另一批仅继承 EQUIP
- **THEN** 按实际行为分别处理，不让后一批凭空获得撕布或洗涤能力

#### Scenario: Several items share a callback

- **WHEN** 多个物品具有经核实相同的使用回调
- **THEN** 可以形成同一行为子类，而非一律判为不可抽取；原效果和触发条件保持一致

#### Scenario: Migrated boots are washed and worn

- **WHEN** 玩家穿戴、洗涤及晾干一个已迁移鞋靴品种
- **THEN** 足部槽位、原材质影响、湿物禁穿和性别限制与原对象一致，不增加撕布等服装专属操作

#### Scenario: A similar shoe remains outside the selected batch

- **WHEN** 本批标准鞋靴完成迁移，游戏同时创建尚未选择的麻鞋或异父类绣花鞋
- **THEN** 未选对象保持原路径与行为，不因名称相近而改写初始化、赋予新能力或放宽资格

#### Scenario: A player equips a migrated flower or helmet

- **WHEN** 玩家穿戴或卸下本批花饰、帽子、头巾或头盔
- **THEN** 它占用原头部槽位，属性增减、性别限制和实际穿脱文案与原对象一致，不获得原来没有的洗涤、晾干或撕布能力

#### Scenario: Similar headwear has a real gameplay distinction

- **WHEN** 两件头饰同名但有效价格、禁售、性别限制、显示或门派标记不同
- **THEN** 保留独立品种及真实差异；经核对完全等价的跨目录头盔则归为同一身份，历史输入别名仍可用

#### Scenario: Death-triggered headwear remains outside this batch

- **WHEN** 本批普通头饰迁移完成，原主人死亡时销毁的两件特殊头饰继续使用
- **THEN** 两件特殊头饰的原路径和死亡销毁行为保持，不把该回调加到普通头饰，也不删除特殊物品的触发逻辑
