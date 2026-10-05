# 游戏对象定义与构造

## Purpose

通过共用行为类和品种数据减少重复，使用原生虚拟对象保留路径式创建能力，不保留旧品种文件或引入第二套商品身份。

## Requirements

### Requirement: Virtual paths select the intended variety

迁移的普通物品 SHALL 以规范品种虚拟路径作为唯一正式商品入口。公共类内部 SHALL 用参数选择类内品种数据；有真实属性、显示或行为差异的品种 MUST NOT 因公共程序相同而失去对象路径区分。不同历史文件不必对应不同规范品种。

#### Scenario: Two varieties share one program

- **WHEN** 调用方分别对两个有真实差异的有效规范品种路径执行 new
- **THEN** 得到对应物品，base_name 分别为各自品种路径；直接带参构造不被作为另一套等价商品入口

### Requirement: Equivalent definitions share one canonical identity

经核对实际属性、显示和行为等价的物品 SHALL 合并为一个规范 ID、一份数据定义和一个正式虚拟路径。全部已迁移物品及后续数据迁移的规范 ID SHALL 简洁、唯一、有意义，以共用资产本身命名；多词使用 snake_case，允许有意义的物品名称加稳定品种编号，如 `chahua1`、`chahua13`、`hong_meigui2`。MUST NOT 从旧目录转换或携带仅表示来源地区、npc/obj 层级、作者的信息，也不为区分品种强行拼接长限定词；真实差异可以采用简洁限定或稳定编号。编号 SHALL 在确定后保持稳定，不随排序或新增数据重新分配；等价物品 MUST NOT 用不同编号保留重复定义。单纯精简 ID MUST NOT 改变玩家名称、输入别名、描述、属性或行为。历史对应关系仅用于离线迁移与审计，MUST NOT 成为运行期别名或重复定义。

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
- **THEN** 已有编号不变、不分配给其他品种；新增等价物品复用已有 ID，有真实差异的新物品使用未占用的规范 ID

### Requirement: Mutable instance state remains independent

共用类 SHALL 保持实例可变状态独立，不污染其他实例或默认品种数据。

#### Scenario: One instance changes a nested value

- **WHEN** 两个原来使用不同历史路径的调用方通过同一规范品种创建实例，且只修改其中一个实例的嵌套状态
- **THEN** 另一个实例和后续创建的物品不受影响

### Requirement: Unknown varieties are rejected

虚拟创建 SHALL 拒绝未知品种和无效路径，不回退为其他物品或产生可流通半成品。品种数据 MUST NOT 提供任意代码执行或新增权限。

#### Scenario: An unknown key is requested

- **WHEN** 创建请求使用类中不存在的品种键
- **THEN** 请求明确失败，不产生其他品种，也不向玩家暴露内部异常原文

### Requirement: Blueprint and instance initialization preserve behavior

实现 SHALL 按驱动虚拟对象生命周期完成初始化，保持品种蓝图、名称缓存、属性查找、派生数值、随机时机和权限。不重复 setup，也不让无参公共程序充当可交付品种。迁移 SHALL 分别保留原蓝图与克隆的有效重量；原有差异 MUST NOT 因共用数据或默认对象绑定而被抹平。

#### Scenario: A shop reads two virtual blueprints

- **WHEN** 商店读取两个虚拟品种蓝图的名称、价格和默认属性
- **THEN** 结果分别对应原品种，后加载的品种不会覆盖前者

#### Scenario: The driver loads the shared program

- **WHEN** 驱动无参加载公共程序而尚未指定品种
- **THEN** 不将其作为有效物品放入游戏，不产生移动、库存或存档副作用

#### Scenario: A headwear blueprint and its clone have different weights

- **WHEN** 一个获准迁移的头饰在原蓝图和原克隆中具有不同有效重量，包括克隆有效重量为零
- **THEN** 新蓝图和新克隆分别保持各自原重量，携带负重及依赖重量的派生属性不因迁移改变，不以蓝图值覆盖有效的零值

### Requirement: Hand equipment preserves independent weight values

迁移的手部装备 SHALL 分别保持实际重量与名为 weight 的普通属性，不因属性同名而互相替代。蓝图、克隆、详情、携带负重及重量相关派生数值 SHALL 与原品种一致；内部短 ID 的归并或编号 MUST NOT 改变这些有效值。

#### Scenario: A ring has a weight attribute but no physical weight

- **WHEN** 原戒指的普通 weight 属性为正数，而实际重量为零
- **THEN** 新品种仍能查询原普通属性值，实际重量与携带负重保持零，不把该属性作为实际重量初始化

#### Scenario: A different ring has physical weight

- **WHEN** 另一件同名戒指原来具有非零实际重量和不同价格
- **THEN** 保留独立规范品种、原重量和价格，蓝图与克隆均正确，不与前一戒指合并
