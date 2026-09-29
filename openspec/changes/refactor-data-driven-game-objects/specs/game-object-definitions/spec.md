# 游戏对象局部定义与构造

## Purpose

约束通过局部参数化复用行为的游戏对象，让开发者用清楚的参数描述同类差异，保证构造结果正确、实例状态独立且不扩大执行权限；不要求建立统一品种目录或全库身份系统。

## ADDED Requirements

### Requirement: Local parameters select the intended object

采用直接参数化的类别 SHALL 按其公开构造参数生成对应对象，并保留所属类别的使用接口。使用定义键时，该键 SHALL 在所属类范围内明确对应数据，不能用中文名称或玩家别名猜测品种。

#### Scenario: Two valid parameter sets create different varieties

- **WHEN** 一个获准参数化的类分别收到两组合法品种参数
- **THEN** 得到对应属性与行为的两个对象，不因显示名或别名相同而混淆

### Requirement: Mutable instance state remains independent

局部复用后的对象 SHALL 保持各实例应有的状态隔离；修改实例的可变数组、映射或消耗状态 MUST NOT 污染其他实例或后续创建所用的默认数据。

#### Scenario: One instance consumes or changes a nested value

- **WHEN** 同样参数创建两个对象，随后只修改第一个的嵌套状态或剩余用量
- **THEN** 第二个与后续新建对象的初始状态不受影响

### Requirement: Invalid parameters do not create usable partial objects

直接参数化构造 SHALL 拒绝缺失的必要参数、未知的局部定义键和错误类型，不静默替换为另一个品种。参数与数据 MUST NOT 赋予调用者任意文件加载、代码执行或新增权限；玩家可见失败反馈 SHALL 符合游戏语境。

#### Scenario: An unknown definition is requested

- **WHEN** 一个实际实例的创建请求指定不存在的局部定义键
- **THEN** 创建明确失败，不产生可使用、交付或交易的半成品

#### Scenario: Parameters try to select executable behavior

- **WHEN** 调用方通过数据传入该类未提供的执行目标或权限设置
- **THEN** 不执行该目标，不绕过现有权限，玩家也不看到内部路径或异常原文

### Requirement: Loading and construction preserve lifecycle behavior

局部复用 SHALL 保持原有蓝图展示、实例初始化顺序及随机生成时机。直接参数化的公共程序在未创建具体实例时 MUST NOT 误触发该实例的移动、库存、计时器或存档行为。

#### Scenario: An existing variety remains a blueprint

- **WHEN** 一个保留路径的品种提取了公共初始化，商店仍读取其原蓝图
- **THEN** 名称、别名、价格及默认属性与改造前一致，其他品种不覆盖其默认值

#### Scenario: A parameterized program is loaded without instance parameters

- **WHEN** 驱动加载公共程序，但尚未创建带参数的具体实例
- **THEN** 不把公共程序当成一个有效品种放进游戏，也不产生实例业务副作用
