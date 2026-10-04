# Proposal

## Why

虚拟对象已用于迷宫、无限幻境与数据化服装，但 LIB 和 mudcore 仍把后缀解析绑定到坐标和 `query_maze_room()`。统一创建约定可使新增对象类型只实现自身的解析与构造，不必继续修改守护精灵的类型分支。

## What Changes

- 统一新接口 `object create_virtual_object(string key)`：守护精灵按最后一个 `/` 定位处理程序，原样传递末段；处理程序负责解释、校验并返回新对象，拒绝时返回 `0`。驱动仍负责命名与 `virtual_start()`。
- **BREAKING（仅当前 LIB 的自定义处理程序协议）**：LIB 不再自动解析二/三维坐标或调用旧迷宫名称；同步迁移现有坐标房间、迷宫接入、无限幻境和普通服装。已有虚拟路径、物品身份及存档不改。
- mudcore 提供相同通用接口，不限制新对象必须属于世界或怪物目录，不引入本游戏数据。保留 `VIRTUAL_D` 宿主替换和已公开的 `compile_area()`、`compile_mob()`、`query_maze_room()` 兼容入口；旧坐标/编号约定仅服务未迁移宿主，新接口一旦存在即负责本次请求，不在拒绝或抛错后另走旧分支。
- 更新框架迷宫组件与示例，补充 LIB 和 mudcore 各自可独立阅读的约定、迁移说明及隔离驱动回归。
- 不增加注册中心、工厂服务、参数 schema 或自动存档迁移；不修改驱动，不重启正式服务，不扩展上一批服装迁移范围。

## Capabilities

### New Capabilities

- `virtual-object-creation`：LIB 的统一路径分派、处理程序回调、驱动生命周期及现有游戏对象迁移。
- `mudcore/virtual-object-creation`：框架通用创建接口、既有宿主覆盖与旧接口兼容、独立接入和验证。

### Modified Capabilities

无。现有 `mudcore/module-contracts` 的独立文档与兼容要求继续适用；幻境玩法和数据化物品的行为契约不变。

## Impact

LIB：`adm/daemons/virtuald.c`、`d/illusion/world.lpc`、`d/items/cloth.lpc`、`u/mudren/maze.c`、`u/mudren/workroom.c` 及迷宫继承链、相关测试和开发文档。`inherit/room/vrm.c` 通过 CORE_VRM 获得新入口，不能因 `replace_program()` 丢失接口。

mudcore：`system/daemons/virtual_d.c`、`inherit/vrm.c`、`world/area/` 示例、`tests/`、虚拟对象/组件接入文档与 CHANGELOG；不要求当前 LIB 改用框架守护精灵，也不修改外部 minimud/MyMud 检出。

此变更以当前尚未提交的普通 CLOTH 重构为前置工作区，单独记录新增任务，不改写其已完成的 13/13 历史。接口变更后重新运行相应回归；已有物品代码/存档切换要求仍独立有效，不把本次接口统一当作生产部署完成。
