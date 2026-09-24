# Module Contracts

## Purpose

使新 MUD 和已有 MUD 能依据明确的组件依赖、生命周期与覆盖约定选择 mudcore 能力。提供与现有完整组合并存的最小玩家接入方式，并以可执行的组合验证保证未选组件不会成为隐藏的运行前提。

## ADDED Requirements

### Requirement: Standalone framework contract documentation

mudcore SHALL 独立携带架构规范和公共组件依赖矩阵，说明必需与可选依赖、宿主扩展入口、驱动能力、初始化/清理责任；关键角色、命令、移动及存取接口 SHALL 说明输入、返回、错误与调用时序。新增或变更公共能力 SHALL 同步这些规范和相应契约测试。

#### Scenario: Contributor integrates a component without the parent repository

- **WHEN** 接入者仅检出 mudcore 并按其文档选择属性、房间、命令或玩家组件
- **THEN** 能找到实际需要的组件、服务、宿主方法和驱动能力，不必依赖主仓库的 OpenSpec 文件才能理解使用契约
- **AND** 尚有组合依赖的组件被明确标注，不被描述为可脱离所有其他文件独立运行

### Requirement: Existing defaults remain compatible

框架 SHALL 保留现有完整角色组合、公共对象路径、宿主别名覆盖、公共签名、默认角色策略及存档字段。新最小组合 SHALL 由宿主显式采用，不能自动改变已有游戏的角色能力。

#### Scenario: Existing host upgrades without opting into new composition

- **WHEN** 宿主未修改原有宏和对象覆盖而采用本次框架更新
- **THEN** 原有默认命令、角色创建、存档恢复和重连仍按既有契约工作
- **AND** 战斗、任务、组队和 GMCP 不因本变更被移除

#### Scenario: Host keeps its overridden property component

- **WHEN** 宿主采用自定义属性别名并使用框架组合对象
- **THEN** 对应组合仍调用宿主实现，不绕过别名强制调用框架默认属性实现

### Requirement: Explicit minimal player composition

框架 SHALL 提供不继承战斗、状态、组队、战斗记录、任务或 GMCP 的最小玩家组件组合，并提供完整接入示例，列明命令配置、角色生命周期及初始化策略的配套要求。

#### Scenario: Minimal host runs without unselected modules

- **WHEN** 临时宿主按最小示例配置，未提供上述可选模块，且未提供已禁用的表情、频道和 parser 模块
- **THEN** 玩家可以注册、登录、执行满足依赖的基础命令、移动、保存恢复及断线重连
- **AND** 不加载、不调用缺席的组件，不自动写入被宿主省略的等级、经验或 HP 初始属性

### Requirement: Optional collaboration is distinct from suppressed errors

基础移动和清理 SHALL 在可选协议或持久化协作者缺席时正常完成；协作者存在时 SHALL 保持既有通知和清理行为。必需接口缺失及已启用协作者的真实错误 MUST NOT 被静默吞掉。

#### Scenario: Moving an interactive player without GMCP

- **WHEN** 未提供 GMCP 组件的交互玩家移动到合法环境
- **THEN** 移动和原有按条件执行的观察行为正常完成，不因缺少 GMCP 失败

#### Scenario: Moving an interactive player with GMCP

- **WHEN** 同一移动路径发生在提供 GMCP 的交互玩家上
- **THEN** 仍发送既有房间通知，不能因为引入最小组合而全局关闭该能力

### Requirement: Generic capabilities and validation boundaries are preserved

框架 SHALL 保留通用网络、存储、外部命令和协议能力，由宿主提供业务配置并决定启用；本变更的组合测试 SHALL 使用隔离数据与本机通信。验证报告 SHALL 区分临时宿主结果与真实游戏验收，不能把编译关闭选项等同于已测试裁剪驱动。

#### Scenario: Running architecture regressions

- **WHEN** 执行默认、覆盖和最小组合回归
- **THEN** 不读取实际玩家存档、宿主凭据或调用具体外部运营服务
- **AND** 报告使用的驱动、通过的组合及未验证的实际宿主范围
