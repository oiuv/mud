# Character Creation Policy

## Purpose

允许宿主在认证流程不变的情况下定制角色名称、性别和初始属性策略。把中文 RPG 的默认选择与必须保持的认证、身份导出和连接交接约束区分开，使不同玩法的 MUD 无需复制整套登录状态机。

## ADDED Requirements

### Requirement: Default character creation remains compatible

未提供新策略的宿主 SHALL 保持现有中文名称规则、长度与禁用词检查、姓名查重、默认性别输入含义，以及现有初始属性和激活扩展入口。

#### Scenario: Default host creates a character

- **WHEN** 默认宿主完成正常账号认证并输入合法中文名称和原有性别选项
- **THEN** 按既有流程创建、初始化、保存并进入世界
- **AND** 默认非法名称和无效性别输入仍被拒绝或重新提示

### Requirement: Host controls presentation and character choices

宿主 SHALL 能局部覆盖名称提示与校验、性别选项及提示，而不重写认证流程。空性别选项 SHALL 表示明确省略该步骤；错误或冲突选项 SHALL 在创建角色前被拒绝。

#### Scenario: Custom name and gender choices

- **WHEN** 宿主允许非中文名称并提供自定义性别选项，玩家输入满足该策略
- **THEN** 提示、校验及保存值遵循宿主规则，不额外施加默认中文或 m/f 限制

#### Scenario: Host omits gender

- **WHEN** 宿主显式配置空性别选项并完成合法名称输入
- **THEN** 不询问性别、不写入框架默认性别，仍通过相同受保护流程完成角色创建

#### Scenario: Invalid policy input does not advance state

- **WHEN** 输入被名称策略拒绝、性别未匹配或选项配置畸形
- **THEN** 显示对应错误或重新提示，不创建可进入世界的半成品角色，不转移连接

### Requirement: Character policy cannot grant authentication

策略定制 MUST NOT 修改认证状态的所有权或绕过登录对象、保留身份、玩家 UID、调用来源及宿主权限检查；未经认证的外部调用 MUST NOT 因新钩子或收尾入口获得创建身份、进入世界或接管连接的能力。

#### Scenario: Unauthenticated caller invokes creation helpers

- **WHEN** 未认证对象尝试利用新的角色创建路径或现有交接接口创建/接管玩家
- **THEN** 请求被拒绝，不导出玩家身份或转移连接

#### Scenario: Host denies identity assignment

- **WHEN** 名称和性别策略接受输入，但宿主 master 拒绝所需 UID 操作
- **THEN** 创建失败并清理失败对象，登录服务身份恢复，不进入世界

### Requirement: Attribute initialization remains a host policy

框架 SHALL 继续使用既有角色初始化扩展入口，而不是新增强制 RPG 数据模型。最小宿主 SHALL 能不初始化等级、经验或 HP，仍完成登录、存档和重连。

#### Scenario: Non-RPG character initializes once

- **WHEN** 宿主初始属性策略只设置其自身字段，玩家创建后再保存、登录和重连
- **THEN** 不补写未声明的 RPG 字段，不重复执行仅针对新角色的初始化，仍执行约定的每次激活行为
