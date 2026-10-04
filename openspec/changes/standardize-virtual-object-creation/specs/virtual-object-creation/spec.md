# 通用虚拟对象创建

## Purpose

为 LIB 的房间、物品和其他虚拟对象提供同一套路径与创建回调约定，使守护精灵不再解释具体业务参数，并在迁移现有用法时保持对象身份、初始化时序、玩法与存档行为不变。

## ADDED Requirements

### Requirement: Virtual providers receive an opaque suffix

LIB SHALL 按虚拟路径最后一个 `/` 定位对应的实体处理程序，将非空末段原样传给公开回调 `create_virtual_object(string key)`。处理程序 SHALL 支持 `.lpc` 和既有 `.c`；同名优先级 SHALL 与驱动一致。守护精灵 MUST NOT 按末段的数字、逗号或对象用途猜测构造参数。

#### Scenario: A numeric-looking key is business data

- **WHEN** 处理程序接收 `7`、`1,2` 或 `1,2,3` 形式的合法品种键
- **THEN** 回调收到原字符串，由它决定该键代表坐标、编号或普通名称，守护精灵不另行创建坐标对象

#### Scenario: Providers use different source extensions

- **WHEN** 两个有效虚拟路径分别由 `.c` 和 `.lpc` 程序实现新接口
- **THEN** 两者均可创建；无对应程序或无新接口的请求不自动克隆普通对象

### Requirement: Providers control creation and rejection

处理程序 SHALL 返回供驱动接管的新对象，或以 `0` 拒绝未知/非法标识。守护精灵 MUST NOT 在该接口返回 `0` 或抛错后回退到旧迷宫、坐标或其他类型分支，也 MUST NOT 将字符串等非对象值当作成功结果；实际构造错误 SHALL 保持可诊断。

#### Scenario: A provider rejects a coordinate-shaped key

- **WHEN** 新接口收到 `1,2` 并返回 `0`
- **THEN** 本次虚拟加载失败，不再调用带两个整数参数的构造函数

#### Scenario: A provider creates another program

- **WHEN** 处理程序解析标识后返回由另一实体程序创建的对象
- **THEN** 该对象可由驱动作为所请求虚拟对象接管，不要求处理程序与返回对象使用同一程序

### Requirement: Virtual identity and lifecycle remain driver owned

统一接口 SHALL 继续使用 FluffOS 原生虚拟对象生命周期，不手动重命名、提升 UID 或二次触发初始化。依赖最终虚拟身份的初始化 SHALL 在驱动赋名后的既有阶段完成；不同路径品种及可变实例状态 SHALL 继续独立。

#### Scenario: A virtual variety is loaded and cloned

- **WHEN** 通过同一路径读取蓝图并创建多个实例，再按实例的规范路径重建
- **THEN** 蓝图、克隆标志、base_name、UID/EUID 和默认对象关系保持正确，初始化次数不增加，实例可变状态不串用

### Requirement: Existing game consumers retain their behavior

LIB SHALL 将现有服装、无限幻境、传统迷宫和坐标房间统一接入新接口，同时保留既有有效虚拟路径、合法参数语义、数量、交易、存取和玩法。仅因本次接口统一 MUST NOT 转换持久数据、调用 AI 或改变幻境归属校验。

#### Scenario: Existing virtual paths are reused

- **WHEN** 原服装品种路径、迷宫 entry/exit/坐标路径或个人幻境路径通过新分派加载
- **THEN** 获得相同品种或房间，原有装备/交易/存取、出口及实例隔离规则继续生效

#### Scenario: An unauthorized personal world is requested

- **WHEN** 玩家尝试加载不属于自己的幻境实例
- **THEN** 原业务校验仍拒绝访问，不因采用通用创建接口而获得其他玩家的房间
