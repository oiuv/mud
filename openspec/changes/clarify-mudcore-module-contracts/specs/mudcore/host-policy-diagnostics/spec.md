# Host Policy Diagnostics

## Purpose

为宿主提供显式、只读的权限策略来源检查，帮助识别仍沿用框架开发默认值的接入。诊断解释框架与宿主的安全责任，不代替业务权限设计、真实授权测试或完整安全审计，也不自动改变游戏行为。

## ADDED Requirements

### Requirement: Explicit policy origin inspection

框架 SHALL 提供按需调用的权限策略诊断，对文件读写、Socket、UID、绑定及数据库权限入口报告方法名、实现来源和框架默认/宿主定义/未知状态。不能确定来源时 SHALL 返回未知，不假定为宿主已配置。

#### Scenario: Default master is inspected

- **WHEN** 宿主显式检查沿用框架权限实现的 master
- **THEN** 各检查项正确识别来源，并对宽松的文件读写和 Socket 默认行为给出提醒

#### Scenario: Host overrides a policy

- **WHEN** 宿主只覆盖部分权限入口
- **THEN** 逐项区分覆盖与继承默认，不因一个入口被覆盖就将所有入口标记为宿主定义

#### Scenario: A policy source cannot be determined

- **WHEN** 被检查对象不提供某入口或驱动无法确定其实现来源
- **THEN** 对应项返回未知及说明，不报告为验证通过

### Requirement: Inspection has no authority or external side effects

诊断 SHALL 只读取元信息，不尝试文件写入、网络连接、数据库访问、身份切换或以调用权限入口进行试探。诊断 MUST NOT 更改 master 的授权结果、读取凭据/玩家数据或在默认启动路径自动运行。

#### Scenario: Inspection leaves host state unchanged

- **WHEN** 对默认或自定义 master 执行诊断
- **THEN** 不发生上述副作用，原授权行为及宿主状态保持不变
- **AND** 输出不包含凭据和实际玩家数据

### Requirement: Origin reports are not security certification

诊断结果和使用文档 SHALL 明确“宿主定义”仅表示实现来源不同，不证明实现安全；生产路径和网络 ACL SHALL 由宿主制定。框架 MUST NOT 因加入诊断而禁用通用网络能力或全局收紧现有权限默认值。

#### Scenario: Permissive host override is reported accurately

- **WHEN** 宿主自行覆盖权限方法但仍允许所有调用
- **THEN** 诊断只能报告宿主定义及边界说明，不能报告安全通过，也不自动改写该策略
