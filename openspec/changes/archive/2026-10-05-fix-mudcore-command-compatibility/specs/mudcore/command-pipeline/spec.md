# Spec Delta

## MODIFIED Requirements

### Requirement: Parser has an explicit capability boundary

框架 SHALL 提供默认启用、可显式关闭的 parser 配置。关闭时，相关命令及登录路径 SHALL 不引用需要编译解析的 parser efun、不初始化 parser、不加载或重载谓词服务；内置 `which` 的普通命令未命中也 SHALL 遵守此边界。显式选择不可用 parser SHALL 报告能力配置错误。启用时 SHALL 保留普通命令优先和宿主谓词服务覆盖，实际服务异常不得被伪装为普通未命中。

#### Scenario: Parser is disabled before compilation

- **WHEN** 宿主编译配置关闭 parser 且未提供谓词对象
- **THEN** 命令和登录组件可以加载，普通命令与登录正常工作，谓词服务不被访问

#### Scenario: Parser is requested but unavailable

- **WHEN** 宿主选择 parser 阶段而驱动能力或框架配置不允许使用它
- **THEN** 报告明确错误，不声称该阶段已启用，也不悄悄改变路由

#### Scenario: Which misses a command with parser disabled

- **WHEN** parser 关闭且谓词服务文件不存在，维护者查询一个未知命令
- **THEN** 正常显示未找到，不加载、调用或重载谓词服务

#### Scenario: Which uses an enabled host verb service

- **WHEN** parser 启用且普通命令未命中，宿主提供了谓词服务覆盖
- **THEN** 查询进入该服务并正确显示其结果，服务抛错可被诊断而不伪装为未找到
