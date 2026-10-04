# 游戏对象定义与构造增量

## MODIFIED Requirements

### Requirement: Equivalent definitions share one canonical identity

经核对实际属性、显示和行为等价的物品 SHALL 合并为一个规范 ID、一份数据定义和一个正式虚拟路径。全部已迁移物品的规范 ID SHALL 按共用资产本身的含义使用 snake_case 命名，MUST NOT 从旧目录转换或携带仅表示来源地区、npc/obj 层级、作者的信息；真实差异采用有意义的限定。历史对应关系仅用于离线迁移与审计，MUST NOT 成为运行期别名或重复定义。

#### Scenario: Identical clothes originated in different regions

- **WHEN** 不同旧目录中的布衣经核对为相同物品
- **THEN** 它们的调用方都使用同一个描述布衣本身的规范路径，共用同一份定义，不保留地区前缀或多条运行期入口

#### Scenario: A unique definition still has a directory-derived ID

- **WHEN** 某件衣物没有重复定义，但现有 ID 由旧目录拼接而成
- **THEN** 仍按物品自身含义改为规范 ID，原来源信息只保留在离线对应及历史核对资料中

#### Scenario: Equivalent footwear shares a canonical identity

- **WHEN** 不同地区的普通鞋靴属性、显示和行为等价，仅历史输入别名不同
- **THEN** 共用一个语义命名的品种，历史输入别名仍可用，所有创建和交易引用统一到该品种

#### Scenario: Similar footwear has a real sect distinction

- **WHEN** 两件僧鞋只有一件带有实际生效的门派标记
- **THEN** 保留不同品种及标记，允许以真实门派特征命名，不因外观相似而合并
