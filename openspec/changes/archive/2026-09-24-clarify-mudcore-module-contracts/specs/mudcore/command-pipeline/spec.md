# Command Pipeline

## Purpose

使宿主能够在保留既有命令入口和安全边界的前提下选择及重排命令处理阶段。明确阶段的短路、失败和可选服务依赖，避免只使用传统命令的游戏被迫加载表情、频道或自然语言 parser。

## ADDED Requirements

### Requirement: Default dispatch remains stable

框架 SHALL 保持默认的方向移动、action 命令、表情、频道、parser 顺序和首个已处理阶段短路行为，并保留命令别名、参数、调用者及失败提示语义。

#### Scenario: A default command is handled before later stages

- **WHEN** 默认 action 阶段成功处理命令
- **THEN** 后续表情、频道和 parser 不再处理该输入
- **AND** action 收到正确玩家对象与原参数

#### Scenario: No stage accepts the input

- **WHEN** 默认各阶段均不接受输入或最后阶段返回失败提示
- **THEN** 未处理结果或失败提示与原有命令入口约定一致

### Requirement: Host-selectable dispatch stages

宿主 SHALL 能通过局部覆盖选择阶段子集、重排阶段以及定制单阶段行为，无须复制完整入口。阶段配置 SHALL 拒绝未知或重复名称，且不能将玩家输入解析为任意方法调用。

#### Scenario: Host prioritizes a selected stage

- **WHEN** 宿主调整已知阶段顺序并覆盖其中一个处理钩子
- **THEN** 实际执行顺序与配置一致，成功后停止，其他阶段保留其原有实现

#### Scenario: Invalid configuration is rejected before activation

- **WHEN** 宿主提供未知或重复阶段
- **THEN** 启用时报告可定位错误，不注册部分可用的命令入口或遗留半初始化状态

### Requirement: Omitted services are not accessed

未选用的表情或频道阶段 SHALL 不加载、调用对应服务；已选阶段的缺失实现或异常 SHALL 明确暴露，不能被当作正常未处理结果掩盖。

#### Scenario: Action-only host omits optional services

- **WHEN** 宿主仅选择方向与 action，且表情和频道对象不存在
- **THEN** 基础命令可正常工作，不尝试加载不存在的服务

#### Scenario: Enabled service fails

- **WHEN** 被选中的服务抛出错误或不存在
- **THEN** 错误可以被测试和宿主定位，不静默路由到后续阶段假装成功

### Requirement: Parser has an explicit capability boundary

框架 SHALL 提供默认启用、可显式关闭的 parser 配置。关闭时，相关命令及登录路径 SHALL 不引用需要编译解析的 parser efun、不初始化 parser、不加载或重载谓词服务。显式选择不可用 parser SHALL 报告能力配置错误。

#### Scenario: Parser is disabled before compilation

- **WHEN** 宿主编译配置关闭 parser 且未提供谓词对象
- **THEN** 命令和登录组件可以加载，普通命令与登录正常工作，谓词服务不被访问

#### Scenario: Parser is requested but unavailable

- **WHEN** 宿主选择 parser 阶段而驱动能力或框架配置不允许使用它
- **THEN** 报告明确错误，不声称该阶段已启用，也不悄悄改变路由
