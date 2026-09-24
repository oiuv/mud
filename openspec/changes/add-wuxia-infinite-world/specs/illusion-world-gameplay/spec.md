# Spec Delta

## Purpose

把程序化世界接入现有心魔幻境入口和任务流程，保留玩家熟悉的战斗与奖励规则，并明确地图查看、离境、重连和版本切换的体验。通过管理工具和可重复验收确保新玩法可以逐步开放，且能独立关闭 AI 或退回旧入口。

## ADDED Requirements

### Requirement: Existing entry and quest compatibility
系统 SHALL 继续通过子虚道人的心魔幻境入口进入；新世界 SHALL 沿用现有心魔对象身份、强度计算、遭遇判定、物品生成和任务记账规则。本次变更 MUST 不新增 AI 决定的战斗属性、掉落、奖励或入场门槛。

#### Scenario: Complete the demon task
- **WHEN** 玩家接受原有斩杀心魔任务并在新世界击杀符合条件的心魔
- **THEN** 原有目标计数和完成奖励正常，任务仍要求现有的二十次击杀

#### Scenario: Description becomes available during combat
- **WHEN** 玩家战斗中房间描写生成完成
- **THEN** 敌人、生命、物品、战斗状态、遭遇次数与任务计数不变，不重新初始化房间

### Requirement: Shared geography with isolated runtime instances
系统 SHALL 允许玩家在各自幻境实例中探索同一公共地理，实例内房间 SHALL 使用规范身份复用。未经明确组队或管理操作，普通玩家 MUST 不因坐标相同而进入他人实例；临时玩家对象编号 MUST 不成为公共文字存档键。

#### Scenario: Two players visit the same location
- **WHEN** 两名玩家分别从子虚道人进入并探索同一世界坐标
- **THEN** 地貌及公共描写相同，NPC、战斗和地面物品实例不共用

#### Scenario: Return to the entrance coordinate
- **WHEN** 玩家从初始房间离开后沿道路返回初始坐标
- **THEN** 返回同一个实例的规范起点，不额外生成另一份同坐标战斗房间

### Requirement: Quiet and consistent room presentation
玩家 SHALL 使用现有移动和 look 命令查看地图。有效 AI 描写准备好后，下一次查看 SHALL 读取新文字；生成过程 MUST 不输出流式文字、进度条或完成广播。所有客户端 SHALL 获得普通文本房间输出。

#### Scenario: Look after background publication
- **WHEN** 后台已发布有效内容且玩家再次查看当前房间
- **THEN** 本次查看显示新描写，同时保留规则生成的出口、门与当前对象列表

### Requirement: Safe exit and session recovery
新世界 SHALL 提供稳定的起点离境出口和分布在可达道路上的离境点，使用现有 out 命令回到武庙。原连接恢复 SHALL 保持仍有效的实例；玩家对象或世界实例已经失效时，重新登录 SHALL 回到既有安全登录位置，不加载过期个人实例。

#### Scenario: AI outage does not prevent exit
- **WHEN** AI 服务不可用且玩家抵达离境点执行 out
- **THEN** 玩家正常返回武庙，退出不依赖创作任务和文字存档

#### Scenario: Login after a full driver restart
- **WHEN** 玩家此前在幻境内退出或驱动重启导致旧实例消失
- **THEN** 玩家按现有安全登录规则进入有效常规房间，再入幻境时创建新的个人实例，公共地理与文字仍保持

### Requirement: Controlled rollout and rollback
系统 SHALL 独立控制新世界入口与 AI 创作开关，保存世界清单；切换入口或停用 AI MUST 不改变仍在线实例的地形。旧世界及新世界 SHALL 有不同路径身份，回退 SHALL 保留存档并可停止接受新创作。

#### Scenario: Disable generation only
- **WHEN** 管理员停止 AI 创作或服务
- **THEN** 新地图仍可进入，已生成文字继续使用，未生成房间显示规则描写

#### Scenario: Roll back the entrance
- **WHEN** 管理员将后续入口切回旧幻境
- **THEN** 新入场使用旧入口，已在新世界中的玩家可继续移动和离境，公共存档不删除

### Requirement: Inspectable operation and reproducible verification
系统 SHALL 提供无需调用模型的固定种子地图预览、连通性与跨区块检查，以及创作任务状态、限额、失败原因和存档修复入口。管理操作 MUST 限制为授权人员；常规状态查看和修复已完成存档 MUST 不触发重新付费创作。

#### Scenario: Diagnose a failed room
- **WHEN** 管理员查看某世界坐标的生成状态
- **THEN** 能区分尚未申请、排队、运行、已完成待发布、已发布、受限和失败，并看到该坐标的规则事实与关联内容键

#### Scenario: Preview the same seed twice
- **WHEN** 管理员离线预览同一种子与范围，分别使用不同区块生成顺序
- **THEN** 得到相同地图事实及连通检查结果，且没有提交 AI 任务
