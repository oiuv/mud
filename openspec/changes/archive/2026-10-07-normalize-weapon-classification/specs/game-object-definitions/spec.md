# 游戏对象定义与构造变更

## MODIFIED Requirements

### Requirement: Virtual paths select the intended variety

迁移的普通物品 SHALL 以规范品种虚拟路径作为唯一正式商品入口。公共类内部 SHALL 用参数选择类内品种数据；普通数据迁移中有真实属性、显示或行为差异的品种 MUST NOT 仅因公共程序相同而失去对象路径区分。明确批准的武器规范化 SHALL 允许核对并消除同名同用途品种中无必要的细微差异，统一后只保留一个规范品种；保留必要差异的品种 SHALL 继续分别标识。不同历史文件不必对应不同规范品种。

#### Scenario: Two varieties share one program

- **WHEN** 调用方分别对两个有真实且需要保留的差异的有效规范品种路径执行 new
- **THEN** 得到对应物品，base_name 分别为各自品种路径；直接带参构造不被作为另一套等价商品入口

#### Scenario: Approved normalization removes unnecessary variants

- **WHEN** 两个同名普通武器品种按明确清单统一为相同的目标定义
- **THEN** 全部当前调用使用唯一规范路径，不为已消除的历史差异保留第二个商品身份

### Requirement: Equivalent definitions share one canonical identity

经核对实际属性、显示和行为等价的物品 SHALL 合并为一个规范 ID、一份数据定义和一个正式虚拟路径。明确批准的武器规范化中，同名同用途且仅有无必要细微差异的普通武器 SHALL 允许先统一到有依据的目标定义再合并；合并 SHALL 列明原值、目标值、用途及理由，不以同名自动合并，也不一律选取各项最高属性。具有必要任务身份、限制、独有行为或装备档次差异的品种 SHALL 保留区分。全部已迁移物品及后续数据迁移的规范 ID SHALL 简洁、唯一、有意义，以共用资产本身命名；多词使用 snake_case，允许有意义的物品名称加稳定品种编号，如 `chahua1`、`chahua13`、`hong_meigui2`。MUST NOT 从旧目录转换或携带仅表示来源地区、npc/obj 层级、作者的信息，也不为区分品种强行拼接长限定词；需要保留的真实差异可以采用简洁限定或稳定编号。编号 SHALL 在确定后保持稳定，不随排序或新增数据重新分配；等价物品 MUST NOT 用不同编号保留重复定义。单纯精简 ID MUST NOT 改变玩家名称、输入别名、描述、属性或行为。历史对应关系仅用于离线迁移与审计，MUST NOT 成为运行期别名或重复定义。

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

#### Scenario: A meaningful item name uses stable variety numbers

- **WHEN** 多个花饰具有真实差异，而将品种名称或描述修饰词完整拼入 ID 会造成冗长命名
- **THEN** 允许使用 `chahua1` 至 `chahua13` 等有意义名称加稳定编号，仍分别保留各品种的玩家名称、输入别名、描述、属性和行为

#### Scenario: Reordering or adding definitions preserves existing IDs

- **WHEN** 维护者调整数据表顺序或新增一个品种
- **THEN** 已有编号不变、不分配给其他品种；新增等价物品复用已有 ID，有真实且需保留差异的新物品使用未占用的规范 ID

#### Scenario: Similar weapons have an intentional distinction

- **WHEN** 两件同名武器分别承担普通装备和特殊任务信物用途，或存在必要的档次、门派及能力区别
- **THEN** 保留可识别的品种及差异，不因其他数值接近而合并

#### Scenario: Minor historical values are unified without free upgrades

- **WHEN** 经用途核对可合并的同名武器只有细微伤害、重量或价格差异
- **THEN** 使用清单中有依据的一套目标值及唯一身份，原调用和相关交易同步，不把最高伤害、最低重量和其他优势机械拼接
