# 游戏对象既有生命周期

## Purpose

保证局部参数化或初始化复用保持游戏对象原有身份、创建、交易、数量及存取契约。需要另建身份适配或资产格式迁移的类别保留原实现，不把简化对象代码扩大成全局业务改造。

## ADDED Requirements

### Requirement: Existing path identities remain valid

具有路径依赖的对象 SHALL 保留原具体程序路径、蓝图和创建入口；原生对象命名、查找、唯一性与权限语义 MUST NOT 被改写。原文件 SHALL 继续作为正式入口，不因本次重构被安排退出。

#### Scenario: An NPC creates a weapon through its existing path

- **WHEN** NPC 按原路径创建一个仅提取了公共初始化的兵器
- **THEN** 创建、装备与其程序身份保持原样，无需增加定义解析或兼容分支

#### Scenario: A unique or singleton object is referenced

- **WHEN** 原有唯一物品或任务单例按路径加载、查找或计算实例数
- **THEN** 其原有身份与行为不受局部改造影响

### Requirement: Spawn and commerce retain existing behavior

已选类别 SHALL 保留原有生成数量、位置、归属、刷新及装备行为，也 SHALL 保留商品展示、价格、库存、交易匹配和付款规则。需要修改公共生成或交易机制才能接入的候选 MUST 保持原实现。

#### Scenario: Two similar products are sold

- **WHEN** 两个显示名相近但原路径不同的商品共用了局部初始化
- **THEN** 原商店和玩家交易仍能区分它们，价格、库存及交付不串货

#### Scenario: Room reset replaces a missing object

- **WHEN** 房间按既有规则补充一个采用局部复用的对象
- **THEN** 原数量、home、归位及装备约定继续生效，不需要新种类的刷新引用

### Requirement: Stacking splitting and persistence keep their formats

采用局部复用的物品 SHALL 保持原有合堆、拆分、数量、存储资格和存取结果；仓库与自动加载 SHALL 继续使用原记录格式及路径身份。需要新增品种比较、复制适配或存档字段才能正确工作的候选 MUST 保持原实现。

#### Scenario: A stack is split through the old creation path

- **WHEN** 一种保留路径的叠加物提取了重复初始化，玩家随后拆分部分数量
- **THEN** 原复制入口仍得到同一品种，数量及允许状态与改造前一致，不误合并其他品种

#### Scenario: An existing warehouse record is restored

- **WHEN** 用改造前的临时仓库记录恢复一个保留路径的品种
- **THEN** 原记录直接恢复对应物品与数量，无需转换格式或增加新的记录类型

#### Scenario: An item remains ineligible for storage

- **WHEN** 原本不允许入库或下线保留的物品只修改了初始化实现
- **THEN** 其存取资格不扩大，不额外承诺保存原先不保存的实例属性

### Requirement: Direct parameterization stays within an independent lifecycle

直接参数化 SHALL 仅用于完整生命周期及可达出口不需要新增公共机制适配的对象。若对象可进入交易、合堆、存档或其他依赖品种路径的流程，并因此需要额外适配，该对象 MUST 保留原实现或采用保持原路径的局部复用。

#### Scenario: A supposedly isolated reward can enter player storage

- **WHEN** 审查发现任务内创建的对象可以被带走存入按路径恢复的仓库，而合并程序后无法原样恢复品种
- **THEN** 不部署该直接参数化方案，不为它新增存档格式或身份兼容层

#### Scenario: A local object never needs path-based variety matching

- **WHEN** 一个获准参数化的对象只在已核实的独立功能中创建、使用和销毁
- **THEN** 该功能能直接按参数使用它，不要求其他游戏系统接受新的对象引用格式
