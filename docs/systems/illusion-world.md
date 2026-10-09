# 武侠无限世界

## 当前状态

最低驱动版本为 **FluffOS v2026.0712.3**。`hash()` 优先使用驱动原生实现；驱动未提供时，由 `adm/single/simul_efun/fluffos.c` 兼容 MD5、SHA-256。生产构建建议启用 `PACKAGE_CRYPTO` 以获得更好的性能。功能属于游戏 LIB，不向 mudcore 引入具体玩法或外部服务依赖。

幻境包含确定性地图、道路、多房间场景、虚拟房间与个人实例，并支持 AI 异步创作和持久正文。AI 是可选组件，停服时仍可探索默认地图并读取已保存正文。

启用、管理与正文审读见[无限世界 AI 创作](illusion-world-ai.md)。入口状态以运行配置及 `illusion status` 为准；历史验收见[验证记录](../../openspec/changes/archive/2026-09-30-add-wuxia-infinite-world/validation.md)。

## 模块与地图规则

| 文件 | 职责 |
| --- | --- |
| `inherit/illusion/identity.lpc` | 世界身份、清单校验、固定顺序摘要 |
| `inherit/illusion/generator.lpc` | 整数地形/气候场、负坐标及安全边界 |
| `inherit/illusion/catalog.lpc`、`topology.lpc` | 内容校验、生态/片区、场景与道路连通 |
| `inherit/illusion/inspection.lpc` | 单区块及四邻区只读诊断 |
| `adm/daemons/illusion_world_d.lpc` | 清单、64 区块 LRU、最多 256 个实例、入口开关 |
| `inherit/illusion/content.lpc`、`adm/daemons/illusion_content_d.lpc` | 规范事实/内容键、真实进入申请、限速、256 正文 LRU |
| `ai/src/world/` | 独立持久任务、模型调用、校验及原子 JSON 发布 |
| `d/illusion/world.lpc`、`room.lpc` | 虚拟路径、玩家归属、默认文本与离境 |
| `inherit/room/illusion_base.lpc` | 新旧幻境共用的原心魔遭遇与掉落逻辑 |
| `d/illusion/catalog.json`、`catalog-wuxia-v1.json` | 测试与正式内容表，按世界清单版本选择 |

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
- 内容表发布后保持冻结。修改影响地图事实的内容时，使用新内容版本和新世界 ID，不改写已有清单。
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

`illusion entry 世界ID` / `illusion entry off` 切换后续玩家入场入口，设置保存到 `data/illusion_world/runtime.json`，重启后校验并恢复；未配置或配置无效时关闭新入口。外部修改配置后可调用 `illusion_world_d->reload_runtime()`，保留在线实例。销毁并重建守护程序会使旧实例失效，应先让玩家离境；失效房间保留紧急 `out`。

## 自动回归

```sh
node tools/tests/test_hash.mjs
node tools/tests/test_illusion_encounters.mjs
node tools/tests/test_illusion_world.mjs
# 其他平台可指定已构建驱动
node tools/tests/test_illusion_world.mjs /path/to/driver
```

`test_hash.mjs` 验证原生与后备 MD5、SHA-256 实现及 LPC/Python 幻境摘要协议。可用 `node tools/tests/test_hash.mjs /path/to/driver /path/to/python` 指定驱动与解释器。

测试使用临时 MUDLIB、随机环回端口、SQLite 和本地假模型，编译真实地图及移动实现；宿主房间、NPC 和权限使用测试替身。另启动独立驱动验证存档冷启动，不读取玩家数据、不连接正式服务或外部模型 API。

需要已安装 `ai/requirements.txt` 的 Python 环境，默认使用 `ai/.venv`。可指定驱动与解释器：`node tools/tests/test_illusion_world.mjs /path/to/driver /path/to/python`。

输出目录保留 `driver-output.txt`、`data/map-scan.json`、`data/cross-scene.json`、`data/preview-*.txt/.json`。它们包含种子、完整事实摘要、地图和连通报告。原心魔逻辑另以提取前的 token 摘要校验。

## 游戏验收与回退

1. 执行 `updateall /`，确认新旧模板及命令编译；刷新命令索引，创建独立测试世界。
2. 测试移动、反向返回、重复 `look`、NPC/物品隔离和 `out`，分别检查 Telnet 与现有 Web 客户端。
3. 关闭 AI 服务，经过不同生态、旧村和残寺后离境，验证原心魔任务二十次击杀及奖励。
4. 验证断线原对象重连、退出重登、驱动重启后的安全位置，不保存过期实例为永久出生点。
5. 验收使用独立测试世界；回滚前关闭公共入口并让玩家离境，保留清单和记录。

种子 42 的已验证地标：旧村 `(-61,36)`、残寺 `(-4,41)`、跨块旧村 `(91,-240)`。起点为苍岭。

地图与正文的独立性能测量使用 `node tools/tests/test_illusion_world.mjs --bench`，统计口径见[自动验证](illusion-world-ai.md#自动验证)。
