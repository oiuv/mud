# 游戏对象定义与构造

## Purpose

通过共用行为类和品种数据减少重复，使用原生虚拟对象保留路径式创建能力，不保留旧品种文件或引入第二套商品身份。

## ADDED Requirements

### Requirement: Virtual paths select the intended variety

迁移的普通物品 SHALL 以新的品种虚拟路径作为唯一正式商品入口。公共类内部 SHALL 用参数选择类内品种数据；不同品种 MUST NOT 因公共程序相同而失去对象路径区分。

#### Scenario: Two varieties share one program

- **WHEN** 调用方分别对两个有效新品种路径执行 new
- **THEN** 得到对应物品，base_name 分别为各自品种路径；直接带参构造不被作为另一套等价商品入口

### Requirement: Mutable instance state remains independent

共用类 SHALL 保持实例可变状态独立，不污染其他实例或默认品种数据。

#### Scenario: One instance changes a nested value

- **WHEN** 同品种创建两个实例后只修改一个实例的嵌套状态
- **THEN** 另一个实例和后续创建的物品不受影响

### Requirement: Unknown varieties are rejected

虚拟创建 SHALL 拒绝未知品种和无效路径，不回退为其他物品或产生可流通半成品。品种数据 MUST NOT 提供任意代码执行或新增权限。

#### Scenario: An unknown key is requested

- **WHEN** 创建请求使用类中不存在的品种键
- **THEN** 请求明确失败，不产生其他品种，也不向玩家暴露内部异常原文

### Requirement: Blueprint and instance initialization preserve behavior

实现 SHALL 按驱动虚拟对象生命周期完成初始化，保持品种蓝图、名称缓存、属性查找、派生数值、随机时机和权限。不重复 setup，也不让无参公共程序充当可交付品种。

#### Scenario: A shop reads two virtual blueprints

- **WHEN** 商店读取两个虚拟品种蓝图的名称、价格和默认属性
- **THEN** 结果分别对应原品种，后加载的品种不会覆盖前者

#### Scenario: The driver loads the shared program

- **WHEN** 驱动无参加载公共程序而尚未指定品种
- **THEN** 不将其作为有效物品放入游戏，不产生移动、库存或存档副作用
