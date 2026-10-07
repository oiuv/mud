# player-management-authorization Specification

## Purpose

约束游戏运行期管理身份的可信刷新以及玩家任务信息的访问边界，确保角色降级后不残留管理能力，同时保留旧角色等级、命令路径和玩家查询自身任务的正常功能。

## Requirements

### Requirement: Refreshed identity revokes stale privileges

可信身份刷新 SHALL 同步授予或撤销对应的驱动巫师标记，不因对象过去拥有管理身份而保留现已失效的权限。现有角色等级、命令路径及 UID/EUID 策略 MUST 保持，不允许业务参数自行授予身份。

#### Scenario: An online wizard becomes a player
- **WHEN** 在线角色经现有可信流程降为普通玩家并刷新身份
- **THEN** 巫师标记被清除，管理入口拒绝访问，普通玩家命令仍可使用

#### Scenario: Existing roles refresh repeatedly
- **WHEN** 普通玩家或仍具合法管理身份的旧等级角色重复初始化或重新登录
- **THEN** 标记符合当前可信身份，各自原有命令路径和授权不变，不修改其他在线角色的标记

### Requirement: Other players quest details require management authority

查询他人任务列表及详情 SHALL 先验证管理身份，未授权者 MUST NOT 获得目标玩家任务内容；玩家查询自己的任务、已完成详情及放弃任务 SHALL 保持正常。

#### Scenario: A player requests another players solved detail
- **WHEN** 普通玩家提交 `quest2 <id> <编号> -s`
- **THEN** 请求被拒绝，不输出他人的任务名称、条件或奖励详情

#### Scenario: Authorized and self queries remain usable
- **WHEN** 管理员查询他人任务，或普通玩家通过不带他人 ID 的格式查询自己的任务
- **THEN** 按原规则显示相应信息；在线降级后的角色不再通过管理员分支
