# 武侠无限世界

## 当前状态

最低驱动版本为 **FluffOS v2026.0712.3**；构建须启用 CRYPTO，提供 SHA-256 `hash`。功能属于游戏 LIB，不向 mudcore 引入具体玩法或外部服务依赖。

第一阶段已实现确定性地图、道路、旧村/残寺、虚拟房间和个人实例，通过隔离驱动回归，**尚待完整游戏验收，不是正式开放版本**。子虚道人默认仍使用旧幻境。M2 AI 创作、持久队列、正文发布及 M3 正式内容/开放准备尚未实现；当前探索不调用模型。

实际进度见 [任务清单](../../openspec/changes/add-wuxia-infinite-world/tasks.md) 和 [验证记录](../../openspec/changes/add-wuxia-infinite-world/validation.md)。所有玩家可见内容遵守 [AGENTS.md](../../AGENTS.md#玩家可见文本)，包括异常与占位提示。

## 模块与地图规则

| 文件 | 职责 |
| --- | --- |
| `inherit/illusion/identity.lpc` | 世界身份、清单校验、固定顺序摘要 |
| `inherit/illusion/generator.lpc` | 整数地形/气候场、负坐标及安全边界 |
| `inherit/illusion/catalog.lpc`、`topology.lpc` | 内容校验、生态/片区、场景与道路连通 |
| `inherit/illusion/inspection.lpc` | 单区块及四邻区只读诊断 |
| `adm/daemons/illusion_world_d.lpc` | 清单、64 区块 LRU、最多 256 个实例、入口开关 |
| `d/illusion/world.lpc`、`room.lpc` | 虚拟路径、玩家归属、默认文本与离境 |
| `inherit/room/illusion_base.lpc` | 新旧幻境共用的原心魔遭遇与掉落逻辑 |
| `d/illusion/catalog.json` | `test-v1` 内容表：四生态、两种九房间结构 |

地图只依赖冻结清单与坐标，不使用玩家身份、时间或全局随机数。每轴范围为 ±1,000,000,000；16×16 区块采用向下取整，`-1` 位于区块 `-1` 的局部格 `15`，边界不环绕。

枢纽连接成对边界口；场景只开放模板声明的门径。跨块场景的各片段必须能从本区合法门径接路，否则整体拒绝，不裁剪或穿墙。普通可进入格均连到枢纽。起点及每组 4×4 区块中的指定枢纽提供稳定 `out` 返回武庙。

玩家共享地理，但房间、NPC 和物品实例独立。虚拟路径携带临时实例标识，公共坐标 z=0；`look` 不重新初始化物品或遭遇。首次入场失败释放新实例，已有实例重入失败保留登记。

## 世界清单

清单位于 `data/illusion_world/worlds/<world_id>.json`，运行目录已排除出 Git。

提交源代码、手工维护的 `d/illusion/catalog.json` 内容表及回归测试；不提交运行生成的世界清单、地图导出、正文存档、日志或玩家数据。自动测试产物保存在系统临时目录，游戏中手动导出的报告也应保存在仓库外或已忽略目录。世界运行数据虽不进 Git，部署与回滚仍须单独备份。

- ID 以小写字母开头，仅含小写字母、数字、连字符，最长 48 字符；测试 ID 必须以 `test-` 开头。
- 种子范围 `0..2147483647`；清单冻结生成器版本、内容版本/摘要和参数。同 ID 同内容可重复初始化，不同内容拒绝覆盖。
- 缺失、损坏、超限或摘要不符时拒绝，不自动创建替代世界。先写同目录 `.pending` 再重命名；遗留文件须人工检查。
- 摘要采用固定字段顺序和 UTF-8 字节长度编码，用于一致性检查，不是认证签名。
- 当前内容仍在调整。内容表变化后，先让测试玩家离境，重载守护程序，使用**新的测试 ID**；不要改写旧清单。
- 测试内容表禁止初始化正式世界，测试世界禁止设为公共入口。

## 管理命令

须有管理员权限；地图命令的搜索路径还需包含 `/cmds/test/`。更新 `commandd` 后刷新索引：

```text
rehash /cmds/adm
rehash /cmds/test
illusion status
illusion init test-huanjing-m1 42
illusion_world test-huanjing-m1 0 0
illusion_world test-huanjing-m1 0 0 json
illusion enter test-huanjing-m1
```

`illusion_world` 接收**区块坐标**。默认输出字符图、生态/场景格数、边界口、连通及反向边检查；`json` 向终端输出完整报告，可由客户端保存。预览不写清单、不创建 ROOM、不调用 AI。

图例：`@` 起点，`O` 离境，`S` 场景，`+` 道路，`.` 荒野，`#` 不可进入；北在上，东在右。

`illusion entry off` 关闭新入口。开关仅在内存中，重载或重启后默认关闭，尚非持久化开放配置。重载会使旧临时实例失效，应先离境；失效房间保留紧急 `out`。

## 自动回归

```sh
node tools/tests/test_illusion_encounters.mjs
node tools/tests/test_illusion_world.mjs
# 其他平台可指定已构建驱动
node tools/tests/test_illusion_world.mjs /path/to/driver
```

测试使用临时 MUDLIB、随机环回端口和两条连接，编译真实地图/移动实现；宿主房间、NPC 和权限使用测试替身。不读取玩家数据、不启动正式游戏、不调用模型，也不扩大驱动评估限制。

输出目录保留 `driver-output.txt`、`data/map-scan.json`、`data/cross-scene.json`、`data/preview-*.txt/.json`。它们包含种子、完整事实摘要、地图和连通报告。原心魔逻辑另以提取前的 token 摘要校验。

## 游戏验收与回退

1. 执行 `updateall /`，确认新旧模板及命令编译；刷新命令索引，创建独立测试世界。
2. 测试移动、反向返回、重复 `look`、NPC/物品隔离和 `out`，分别检查 Telnet 与现有 Web 客户端。
3. 关闭 AI 服务，实走“雾林 → 旧村 → 残寺 → 离境”，验证原心魔任务二十次击杀及奖励。
4. 验证断线原对象重连、退出重登、驱动重启后的安全位置，不保存过期实例为永久出生点。
5. 公共入口保持关闭；回滚移除新模板前先让全部测试玩家离境，保留清单和记录。

种子 42 的已验证地标：旧村 `(-61,36)`、残寺 `(-4,41)`、跨块旧村 `(91,-240)`。其起点是苍岭，不能将自动回归称为已完成“雾林起步”的实走验收。

道路形态、生态比例和收益节奏仍须调图及实玩检查。现有计时混合缓存命中/未命中，不能证明冷区 p95 目标达标；正式内容和上线验收留在后续阶段。
