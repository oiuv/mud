# 游戏对象分类复用

## Purpose

按共同的实际行为抽取类，用数据表达差异，保证物品功能不变并减少不必要的实体文件。以长期维护是否更简单判断收益，不以本次需修改的文件数量限制改造。

## Requirements

### Requirement: Selected varieties retain their gameplay properties

普通数据迁移的品种 SHALL 保持实际名称、颜色、描述、数值、材质、使用效果及限制。等价物品的历史输入别名 SHALL 允许去重合并，并保持原输入可用；原文件路径、旧商品 ID 和无实际影响的源码写法 SHALL 允许替换，不作为玩法等价的必要条件。兼容目标是功能和已有数据，MUST NOT 以兼容为由保留历史代码冗余。明确批准的武器分类规范化 SHALL 按正确类别调整直接相关玩法；同名同用途且无必要的细微属性差异 SHALL 允许核对后统一。此类变化 SHALL 单独列出对象、原值、目标值、理由与关联影响，不以“普通数据迁移”名义改动其他功能，也不以旧错误必须保留阻止规范化。

#### Scenario: Similar clothes have different attributes

- **WHEN** 相似名称的衣服迁移到共用类
- **THEN** 各自重量、护甲、性别限制、穿脱文案及实际默认值语义保持不变，有真实差异的物品仍分别定义

#### Scenario: Equivalent clothes differ only in historical spelling

- **WHEN** 衣物只存在历史输入别名、设置顺序或显式零值等写法差异，且已核实这些差异不改变实际功能或有效数据
- **THEN** 统一为一个规范品种，原输入别名仍可使用，不以源码、别名数组或内部 mapping 必须逐字相同阻止归并

#### Scenario: An explicitly approved weapon correction changes its category

- **WHEN** 经确认原来使用锤类的实际斧类武器归入斧类
- **THEN** 武器类别、直接关联武学和教学按新规范一致更新，清单外的伤害、取得规则和特殊行为不借机改动

#### Scenario: Historical minor differences have no design purpose

- **WHEN** 已核对的同名普通武器只有无必要的细微重量、价格或伤害差异
- **THEN** 允许按记录的合理基准合并，测试明确验证新目标值和关联用途，而非因原值不完全相等强制保留重复品种

### Requirement: Families follow shared behavior

分类 SHALL 核对继承、头文件及特殊回调，共有特殊行为 SHALL 可以提取为子类；独有行为 SHALL 允许保留专用实现。不能仅按文件名、显示名或是否存在自定义函数决定归并。已迁移鞋靴 SHALL 保留原足部穿戴、性别限制、洗涤与晾干能力；已迁移头饰 SHALL 保留头部槽位、护甲及魅力等有效加成、原穿戴限制和文案。普通数据迁移中各类 MUST NOT 从其他物品类别获得原来没有的功能；明确批准的武器分类修正 SHALL 只调整已列明的类别及其直接关联能力。未选对象的初始化与行为 SHALL 保持现状，不以同名或相似形制为由自动扩展范围。

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
- **THEN** 它占用原头部槽位，属性增减、性别限制、实际穿脱文案与原对象一致，不获得原来没有的洗涤、晾干或撕布能力

#### Scenario: Similar headwear has a real gameplay distinction

- **WHEN** 两件头饰同名但有效价格、禁售、性别限制、显示或门派标记不同
- **THEN** 保留独立品种及真实差异；经核对完全等价的跨目录头盔则归为同一身份，历史输入别名仍可用

#### Scenario: Death-triggered headwear remains outside this batch

- **WHEN** 本批普通头饰迁移完成，原主人死亡时销毁的两件特殊头饰继续使用
- **THEN** 两件特殊头饰的原路径和死亡销毁行为保持，不把该回调加到普通头饰，也不删除特殊物品的触发逻辑

#### Scenario: A special weapon keeps its independent lifecycle

- **WHEN** 一件独占兵器被确认需要纠正战斗类别
- **THEN** 只修改类别及已确认的关联行为，原独占及特殊交互继续存在，不因为与普通斧同类就合并成普通商品

### Requirement: Partial adoption preserves unrelated features

每批 SHALL 在其他类别继续运行的条件下接入。传统地图、货币、自制装备及本批未选的独特任务对象 SHALL 保持现状；游戏重构 MUST NOT 要求 mudcore 或驱动加入本游戏的数据体系。

#### Scenario: Ordinary clothes are migrated first

- **WHEN** 普通服装采用虚拟品种入口
- **THEN** 同步其实际调用方后可独立验收，不要求兵器、食物、NPC 和整个地图同时转换

### Requirement: Hand equipment preserves its actual slot and interactions

获准迁移的手部装备 SHALL 保持原手部槽位、穿脱文案、属性增减、别名、限制及原外部互动条件；MUST NOT 因名为戒指、指套或弓就更改类别，也不将描述扩展为新的能力。具有真实价格、材质、显示或门派加成差异的品种 SHALL 分开维护，等价跨地区定义 SHALL 合并；未选研读和死亡销毁装备 SHALL 保持原行为。

#### Scenario: A ring and a bow are used as hand armor

- **WHEN** 玩家或 NPC 按原方式穿戴本批戒指或点金盘龙弓
- **THEN** 仍占用原手部槽位并提供原加成，不改成独立戒指槽、可发射武器或其他装备能力

#### Scenario: Golden silk gloves allow the existing cave interaction

- **WHEN** 角色穿戴金丝手套并操作原有移桌、取鼎流程
- **THEN** 保持原手套识别与成功结果；未穿戴或戴其他手套仍触发原失败后果，不获得额外全局免毒能力

#### Scenario: Specialized hand equipment remains outside the batch

- **WHEN** 原研读铁手掌或两件主人死亡时销毁的黄金装备被使用
- **THEN** 原路径与读书、销毁行为保持，普通手部装备不获得这些能力
