# 通用虚拟对象创建约定

LIB 由 `adm/single/master/object.c` 接收 FluffOS 的 `compile_object()` 回调，再交给 `adm/daemons/virtuald.c`。该守护精灵与 mudcore 使用相同的处理程序接口。

## 路径与接口

没有对应实体源码的 `/provider/key`，由实体 `provider.lpc` 或 `provider.c` 处理。对象引用不带扩展名，同名加载遵循驱动的 `.lpc` 优先级，不应主动创建同名双扩展文件。

```c
object create_virtual_object(string key);
```

守护精灵只按最后一个 `/` 拆分，将非空 key 原样传入。`7`、`1,2` 和 `1,2,3` 都只是字符串；坐标、编号或品种的含义由处理程序解释。不逐级向上查找，不增加类型注册表。

处理程序返回一个新克隆供驱动接管；未知或非法 key 返回 `0`。不得返回自身、共享蓝图、已登记虚拟对象或错误文本。缺程序、缺接口或返回 `0` 时加载不成功；构造异常向调用方传播。

## 创建与生命周期

当前可直接使用的例子：

```c
object item, room;

item = new("/d/items/cloth/baise_changpao");
room = load_object("/u/mudren/workroom/-2,3,1");
```

`load_object(path)` 获取该虚拟路径的蓝图；`new(path)` 创建实例；`new(base_name(ob))` 按规范身份重建。处理程序可返回自身程序的克隆，也可创建另一程序，如 `d/illusion/world.lpc` 返回 `/d/illusion/room` 的克隆。

巫师 `clone` 指令也使用同一加载链路，例如 `clone /d/items/neck/baijin_quan`，不要求虚拟路径存在实体文件。实体对象支持 `.c`、`.lpc` 及无扩展名路径；原有授权、数量和物品落点规则不变。

1. 驱动定位并加载处理程序，调用新接口；无参加载处理程序不应生成待交付商品。
2. 接口解析/校验 key，创建独立对象。可变实例数据不得串用，不以临时克隆名作为持久身份。
3. 返回后由驱动完成虚拟命名、克隆标志和 UID，并调用 `virtual_start()`。依赖最终 `base_name()` 的初始化放在这里；守护精灵不补调 `create()`、`setup()` 或手动赋权。

服装用 `virtual_start()` 设置同品种默认对象并只执行一次 `setup()`；普通房间原有构造逻辑继续保留。不要因为统一接口而把所有初始化再次放进 `virtual_start()`。

## 管理指令中的身份与源码

`file_name()` 是当前对象身份（克隆含 `#编号`），`base_name()` 是逻辑蓝图路径，
两者都不应直接拼接 `.c` 当作实体源码。实体源码通过 `lpc_file()` 解析；虚拟
对象没有同名源码。`info`、`data`、`sa` 分开显示身份与可找到的实体源码，
`ff` 解析函数实际定义程序的源码扩展名。

`more <对象名>` 对实体对象读取实际源码；对虚拟对象读取 `/provider/key`
对应的处理程序，并提示这不一定是对象实际执行的程序。该功能不加载对象，
最终文件仍须通过读取授权。`child` 仅列出现有实例，不探测或创建虚拟品种。

批量 `loadall` 扫描真实源码并跳过测试及非游戏目录；`guilei` 不把处理程序
克隆成商品，只追踪房间、NPC 和货表已有的对象引用；`fcrypt` 只改写真实文件。

## 现有接入点

| 处理程序 | key 含义与职责 |
| --- | --- |
| `d/items/cloth.lpc` | 登记的服装品种键；校验定义、创建独立实例 |
| `d/items/boots.lpc` | 登记的鞋靴品种键；继承 BOOTS，独立于 CLOTH 行为 |
| `d/illusion/world.lpc` | `世界~X~Y~实例`；保留世界、坐标和玩家归属校验 |
| `u/mudren/maze.c`、`workroom.c` | 严格解析两/三个有符号整数；两参数仍缺省 `z=0`，拒绝尾随文本 |
| `inherit/room/vrm.c` → `CORE_VRM` | 继承框架新接口，支持 `entry`、`exit`、`x-y`；黑森林和个人迷宫无须另写转发 |

新增类型只实现此回调，不修改守护精灵。虚拟对象仍受 master 安全规则、业务资格和存取检查约束；能创建不代表自动允许存档或访问他人实例。

mudcore 为其他旧 MUD 保留原目录路由及旧接口，详见[框架约定](../../mudcore/docs/daemons/virtual_d.md)。本 LIB 已全部迁移，不依赖 daemon 的旧式分派。

## 验证与部署

```powershell
node mudcore/tests/run.mjs bin/driver.exe
node tools/tests/test_illusion_world.mjs bin/driver.exe
node tools/tests/test_cloth_objects.mjs bin/driver.exe --all
node tools/tests/test_cloth_objects.mjs bin/driver.exe --clone-command
node tools/tests/test_command_compatibility.mjs bin/driver.exe
node tools/tests/test_cloth_objects.mjs bin/driver.exe --bench
node tools/tests/test_boots_objects.mjs bin/driver.exe --all
```

均在临时目录验证；幻境回归需 `ai/.venv`，仅连接本机假 AI 服务，不调用真实模型。夹具验证通用协议和实际业务代码，不能替代正式服部署后的巡检。

LIB 和含新 `CORE_VRM` 的 mudcore 须配套部署，安排维护重启，避免旧继承链驻留；不能只更新 daemon。回退时同时恢复配套 LIB/框架代码后冷启动。

涉及物品数据化时，按[物品迁移说明](data-driven-items.md)配套处理代码和存档。
