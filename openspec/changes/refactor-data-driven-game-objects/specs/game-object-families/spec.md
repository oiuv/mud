# 游戏对象分类复用

## Purpose

按共同的实际行为抽取类，用数据表达差异，保证物品功能不变并减少不必要的实体文件。以长期维护是否更简单判断收益，不以本次需修改的文件数量限制改造。

## ADDED Requirements

### Requirement: Selected varieties retain their gameplay properties

获准迁移的品种 SHALL 保持名称、颜色、别名、描述、数值、材质、使用效果及限制。原文件路径 SHALL 允许替换，不作为玩法等价的必要条件。

#### Scenario: Similar clothes have different attributes

- **WHEN** 相似名称的衣服迁移到共用类
- **THEN** 各自重量、护甲、性别限制、穿脱文案及未设置属性仍与原物品一致

### Requirement: Families follow shared behavior

分类 SHALL 核对继承、头文件及特殊回调，共有特殊行为 SHALL 可以提取为子类；独有行为 SHALL 允许保留专用实现。不能仅按文件名、显示名或是否存在自定义函数决定归并。

#### Scenario: Clothing parents provide different capabilities

- **WHEN** 一批衣服继承 CLOTH，另一批仅继承 EQUIP
- **THEN** 按实际行为分别处理，不让后一批凭空获得撕布或洗涤能力

#### Scenario: Several items share a callback

- **WHEN** 多个物品具有经核实相同的使用回调
- **THEN** 可以形成同一行为子类，而非一律判为不可抽取；原效果和触发条件保持一致

### Requirement: Partial adoption preserves unrelated features

每批 SHALL 在其他类别继续运行的条件下接入。传统地图、货币、自制装备及本批未选的独特任务对象 SHALL 保持现状；游戏重构 MUST NOT 要求 mudcore 或驱动加入本游戏的数据体系。

#### Scenario: Ordinary clothes are migrated first

- **WHEN** 普通服装采用虚拟品种入口
- **THEN** 同步其实际调用方后可独立验收，不要求兵器、食物、NPC 和整个地图同时转换
