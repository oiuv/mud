# 游戏对象生命周期与迁移

## Purpose

允许更换品种路径，同时保持生成、使用、交易和存取功能。以新品种虚拟路径复用现有路径式机制，不保留旧文件壳或运行期路径别名。

## ADDED Requirements

### Requirement: Canonical virtual identity supports reconstruction

迁移后的普通物品 SHALL 使用新品种虚拟路径进行创建、查找、蓝图读取和品种比较，new(base_name(ob)) SHALL 创建同品种的新实例。所有实际引用 SHALL 同步迁移，本批全部被替代的原物品源码 SHALL 在迁移完成时删除，MUST NOT 留下转发文件或运行期旧路径别名。品种 SHALL 以共用类中的数据或同类数据文件中的记录维护，不再为每个品种建立独立入口文件。

#### Scenario: An NPC creates a migrated item

- **WHEN** NPC 通过更新后的品种路径创建装备
- **THEN** 得到原属性与使用效果的物品，继续按原方式移动并穿戴，物品名无需对应实体源文件

#### Scenario: A migrated family is accepted

- **WHEN** 一批物品完成抽象并准备验收
- **THEN** 迁移清单内的旧源码全部不存在，实际调用方均使用新入口，运行期没有旧路径兼容文件或别名；新增同类普通品种只需增加数据记录

### Requirement: Spawn and commerce retain gameplay behavior

迁移 SHALL 保持数量、位置、归属、刷新、商品展示、价格、库存、品种匹配与付款规则；可修改引用和必要接入检查，不建立第二套商品识别协议。

#### Scenario: Two products share a class

- **WHEN** 同一个公共类提供两种原本可区分的商品
- **THEN** 商店和玩家交易继续区分各自价格、库存及交付对象，不串货

#### Scenario: A room replenishes an item

- **WHEN** 房间刷新配置使用新品种路径
- **THEN** 补充数量、归位与装备行为不变

### Requirement: Persistence retains eligibility and record structure

物品存取 SHALL 保留原资格、数量和恢复结果，记录继续使用现有路径字段；必要的加载检查 SHALL 正确支持本批虚拟物品，不因缺少实体 .c 文件拒绝，也不无条件放开任意虚拟对象。未有的自动保存和实例快照能力 MUST NOT 顺带新增。

#### Scenario: A valid virtual item is stored and retrieved

- **WHEN** 一个符合原存放条件的虚拟品种被存入后取出
- **THEN** 按保存的新路径恢复对应品种和数量，记录结构不增加通用品种字段

#### Scenario: An item remains ineligible

- **WHEN** 物品仍有原禁止存放条件
- **THEN** 即使它采用虚拟路径，存取规则也不被放宽

### Requirement: Historical references are migrated without runtime aliases

删除原路径前 SHALL 核对持久引用；需要转换的记录 SHALL 通过一次性、字段明确的迁移保留对应品种与数量，不依赖运行期别名。验证 SHALL 使用临时记录，正式数据转换 SHALL 纳入部署备份与回退步骤。

#### Scenario: An old warehouse record references a removed file

- **WHEN** 临时旧记录经过本批路径转换后恢复
- **THEN** 得到对应新品种与原数量；无关字段保持原样，再次转换不改变结果

#### Scenario: Deployment is rolled back

- **WHEN** 已切换路径和记录的版本需要回退
- **THEN** 按对应代码与记录备份回退，不把仅撤销代码宣称为完整恢复
