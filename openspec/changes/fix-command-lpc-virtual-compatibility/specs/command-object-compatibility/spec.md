# 指令源码与对象兼容性

## Purpose

保证 LIB 的管理、技能和玩家指令在传统 `.c`、现代 `.lpc` 及虚拟对象并存时正确发现与操作目标，区分实体源码和运行身份，并保留既有权限、玩法与失败保护，避免数据化迁移后合法功能失效或资格检查被跳过。

## ADDED Requirements

### Requirement: Commands distinguish source files from object identities

指令 SHALL 根据操作用途区分实体源码与对象身份。支持源码输入的指令 SHALL 接受真实 `.c`、`.lpc` 及可解析的无后缀路径，无后缀选择与驱动一致，显式源码后缀不得静默改为另一文件。原本操作游戏对象的指令 MUST NOT 仅因合法虚拟身份没有同名实体源码而拒绝它；纯文件操作 MUST NOT 将虚拟身份当作存在的文件。

#### Scenario: Equivalent physical sources use different extensions

- **WHEN** 维护者分别以无后缀和准确显式后缀指定 `.c`、`.lpc` 对象或源码
- **THEN** 指令定位相应目标，不补错扩展名；显式不存在的源码文件明确报告不存在，不默默选另一扩展名

#### Scenario: A valid virtual item is distributed

- **WHEN** 管理员通过物品发放指令指定合法虚拟品种
- **THEN** 符合原条件的接收者得到原数量与落点的物品，不要求该品种拥有实体源码；被拒绝或构造失败不报告为发放成功

#### Scenario: Configured movement and crafting targets are virtual

- **WHEN** 原有家园、召回或配方配置引用合法虚拟对象，且调用者满足原业务条件
- **THEN** 对应指令可以加载并使用目标；冷加载与已加载目标的资格规则一致，缺少对象或创建异常有明确失败反馈

#### Scenario: Instance listing has no creation side effect

- **WHEN** 维护者查看某个实体或虚拟身份的已加载实例
- **THEN** 结果按原实例统计语义展示，未加载时报告为空，不为判断实体文件或生成列表主动创建新实例

### Requirement: Skills and fixed subcommands support both source extensions

技能查询、演练、设置、统计、学习条件及特技检查 SHALL 将 `.lpc` 与 `.c` 同等处理；绝招和内功子命令列表 SHALL 正确取得无后缀名称并去重。固定目录子命令分派 SHALL 支持双扩展名，同时保留原操作白名单和目录边界，不增加任意虚拟子命令入口。

#### Scenario: A previously learned force skill uses lpc

- **WHEN** 玩家已学的 `.lpc` 内功与拟学习技能互斥
- **THEN** 学习被原规则拒绝，不能因为找不到同名 `.c` 而跳过互斥检查；改用等价 `.c` 得到相同结果

#### Scenario: Skill and action directories contain mixed sources

- **WHEN** 查询、演练或列举含 `.c` 和 `.lpc` 的技能、子技能、绝招或内功
- **THEN** 合法项均被识别，名称没有残留后缀，同名项不会重复计数，原不可用/未学会等规则不变

#### Scenario: Team and vote dispatch to lpc subcommands

- **WHEN** 合法固定子命令由 `.lpc` 实现
- **THEN** 能按原参数和授权执行；不存在或不在原允许范围的子命令仍被拒绝

### Requirement: Batch source operations report accurate scope and results

批量源码操作 SHALL 识别双扩展名，按逻辑对象去重，并保持源码操作边界。批量加载 SHALL 排除既定非游戏目录、隐藏路径与测试夹具，直接指定被排除路径也不得执行其中代码。归类 SHALL 区分处理程序与实际物品，正确处理房间/NPC 已引用的虚拟品种，不自动猜测全部品种。签名类文件操作 SHALL 支持 `.lpc` 并保留既有 `.c`、`.h` 行为。失败和跳过 MUST NOT 计为成功。

#### Scenario: Mixed game source and test directories are scanned

- **WHEN** 批量加载包含实体 `.c`、`.lpc`、隐藏目录、tests 和非游戏目录的树
- **THEN** 合法游戏源文件被发现，每个逻辑对象仅加载一次，被排除代码不执行；直接指定其子目录仍被排除

#### Scenario: Classification encounters a provider and virtual goods

- **WHEN** 归类遇到虚拟处理程序，且另有房间/NPC 的物品表引用该程序提供的品种
- **THEN** 处理程序不会被无参克隆并计作商品；实际引用的虚拟品种可按规范身份归类，不伪造对应 `.c` 文件；临时对象在失败分支也被释放

#### Scenario: A source fails to load

- **WHEN** 批量加载或归类中某一项创建异常或没有得到有效对象
- **THEN** 报告失败项及实际结果，不将其累计为成功，也不声称整目录全部成功

### Requirement: Inheritance updates are extension aware and failure safe

继承更新 SHALL 正确处理混合扩展名的实体继承链及原筛选范围内已加载的虚拟蓝图，先完成选中的实体依赖，再重建相关虚拟蓝图，不枚举未加载虚拟路径。更新 SHALL 保留玩家/克隆排除、仅预览与超量确认规则。没有获得有效新对象或恢复位置失败 SHALL 如实报告，不误报成功或继续对无效对象操作；安全迁出失败 MUST NOT 销毁仍承载玩家的旧对象。

#### Scenario: Mixed and multiple inheritance is updated

- **WHEN** 一个实体继承根的已加载后代混用 `.c`、`.lpc` 并包含多重继承
- **THEN** 选中的父程序在子程序前更新，每个目标仅处理一次，不把 `.lpc` 后代改成错误的 `.c`；相关已加载虚拟蓝图按原身份重建，现存克隆不被顺带销毁

#### Scenario: Preview or force protection prevents mutation

- **WHEN** 未请求编译，或涉及对象超过原阈值但没有强制确认，或只输入选项未输入根路径
- **THEN** 不销毁或重建任何目标，输出预览、确认要求或用法，不触发空值异常

#### Scenario: Rebuilding a room fails

- **WHEN** 旧房间内容已安全迁出，但重建抛错或返回非对象
- **THEN** 更新停止并报告失败路径，不输出该项成功、不对空对象操作；已迁出的内容留在安全地点并明确未恢复，不声称自动回滚了旧状态

#### Scenario: Moving players out fails

- **WHEN** 旧对象中的玩家无法安全迁出
- **THEN** 保留旧对象并停止该次更新，不销毁仍承载玩家的对象

### Requirement: Source inspection distinguishes virtual identity and provider

对象信息 SHALL 如实展示运行身份；若展示源码文件，SHALL 使用实际存在的扩展名，不在虚拟或克隆身份后伪造 `.c`。按对象查看源码 SHALL 对实体对象解析真实文件，对虚拟对象明确区分没有同名源码与处理程序源码。函数来源展示 SHALL 正确处理 `.lpc` 定义。最终读取目标 SHALL 继续接受原权限检查。

#### Scenario: A virtual item has a different implementation program

- **WHEN** 维护者查看由处理程序创建、实际使用另一程序的虚拟物品信息及源码
- **THEN** 信息显示其虚拟身份而非不存在的品种源码；若展示处理程序文件，明确标记为处理程序，不冒称对象实际实现源码

#### Scenario: A function is defined in lpc source

- **WHEN** 查询来自 `.lpc` 程序的函数定义位置
- **THEN** 展示准确来源，不能补为不存在的 `.c`；源码已经不存在时如实保留程序身份说明

#### Scenario: Object-based source reading is unauthorized

- **WHEN** 用户能看到某个对象但无权读取其实体或处理程序源码
- **THEN** 源码读取被拒绝，不能以对象可见或虚拟身份绕过文件权限

### Requirement: Compatibility fixes preserve game and authority boundaries

兼容修复 SHALL 保持既有管理等级、文件权限、归属校验、发放条件、数量、配方、技能条件和玩家状态规则。加载成功 MUST NOT 被当成业务授权；管理员诊断可包含技术路径，玩家失败提示 SHALL 保持游戏语境，不泄露底层异常。修复 MUST NOT 要求改变物品身份或持久数据，也 MUST NOT 为纯文件操作或实体热更新自动增加虚拟实例修改能力。

#### Scenario: A valid object is not permitted for this player

- **WHEN** 目标可加载，但玩家不满足原移动、召回、制药、学习或物品接收条件
- **THEN** 原规则继续拒绝操作，不因为采用 `.lpc` 或虚拟路径而放宽

#### Scenario: Legacy and migrated objects are used after the repair

- **WHEN** 相同合法操作分别针对旧 `.c` 对象和兼容后的 `.lpc`/虚拟对象执行
- **THEN** 原玩法效果、数量与权限保持一致，既有合法存档不因本次指令修复而需要转换
