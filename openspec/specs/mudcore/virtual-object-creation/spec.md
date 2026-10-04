# mudcore 通用虚拟对象

## Purpose

让独立 mudcore 宿主按统一创建回调接入任意业务类型的虚拟对象，同时保留已公开的旧目录路由和宿主覆盖能力；框架自身不依赖具体游戏的数据、玩法或父仓库，并提供独立接入文档与验证。

## Requirements

### Requirement: Framework supports generic opt-in virtual providers

mudcore SHALL 支持 `/处理程序/标识` 与 `object create_virtual_object(string key)` 的通用约定，原样传递末段，由处理程序解释参数并返回新对象或 `0`。实现新接口的程序 SHALL 可位于世界、怪物目录之外；框架 MUST NOT 要求宿主采用本游戏目录、品种数据或某个预设对象父类。

#### Scenario: A standalone host creates a non-room object

- **WHEN** 隔离宿主未定义 WORLD_DIR/MOB_DIR，却提供普通物品的新接口程序
- **THEN** 可按虚拟路径加载与克隆该物品，不加载本游戏的服装数据、幻境服务或其他未选业务

### Requirement: Existing host dispatch and public entries remain compatible

框架 SHALL 保留 VIRTUAL_D 替换，以及 WORLD_DIR、MOB_DIR 和框架默认地区路由的既有优先次序与宿主覆盖入口。公开的 `compile_area()`、`compile_mob()`、`query_maze_room()` SHALL 保持可调用；未实现新接口的旧宿主在原支持范围内仍可使用坐标、整数编号或旧迷宫回调。目录外的通用接入 MUST NOT 顺带开放这些旧式隐式构造。

#### Scenario: A host overrides a legacy dispatcher

- **WHEN** 宿主继承框架守护精灵，覆盖地区或怪物分派并通过 VIRTUAL_D 使用
- **THEN** 匹配目录仍进入宿主覆盖，调用父实现也能保持旧宿主的正常创建行为

#### Scenario: A host keeps old virtual providers

- **WHEN** 原支持目录内的处理程序仅提供两/三个整数构造、怪物整数构造或旧迷宫回调
- **THEN** 升级框架后原合法路径仍可使用，不要求宿主立即批量改写代码

### Requirement: A selected new provider is authoritative

框架默认分派 SHALL 在处理程序提供新接口时使用它，而非按后缀形状推断构造参数。新接口拒绝或抛错 MUST NOT 触发旧式回退；实际异常 SHALL 传播供宿主诊断。驱动入口 SHALL 只交付对象或加载失败，不把旧辅助接口的错误文本当作虚拟对象。

#### Scenario: Both new and old callbacks exist

- **WHEN** 处理程序同时具有新旧接口，且新接口返回 `0` 或抛错
- **THEN** 本次加载失败或传播异常，旧回调不会为同一请求创建另一对象

### Requirement: Framework adoption is independently documented and verified

mudcore SHALL 独立说明新接口、驱动命名与初始化时序、宿主覆盖、旧接口迁移和可选依赖；框架示例 SHALL 展示新约定。验收 SHALL 包含默认与宿主覆盖、实体扩展名、真实虚拟加载/克隆及旧入口兼容；测试 MUST 使用隔离数据，不把父 LIB 的通过结果当作框架守护精灵已验证。

#### Scenario: Framework is tested without this game

- **WHEN** 使用框架隔离测试宿主运行通用接口及旧接口回归
- **THEN** 无需本游戏对象、正式数据或外部服务即可完成验证，并明确实际驱动版本和未验证宿主范围
