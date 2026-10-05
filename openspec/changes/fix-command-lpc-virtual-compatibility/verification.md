# 指令兼容性修复验收

验证日期：2026-10-05。使用本机 `bin/driver.exe`，启动记录版本为
`fluffos 20260929-5270e7d6-91de2eaf (Microsoft Windows)`。

## 实施范围

计划中的 28 个指令已修复，全部在隔离 MUDLIB 中编译，并实际调用涉及的分支。
复用现有 `lpc_file`、`lpc_object_path`、`lpc_source_files` 和原生虚拟创建协议；
没有新增解析框架、品种枚举接口、运行期路径别名或存档迁移。

| 指令 | 本次运行覆盖 |
| --- | --- |
| `updatei` | 混合扩展名、三层/多重继承与去重、更新前快照、虚拟蓝图重建、玩家/克隆/安全地点排除、预览/阈值、迁出/创建/恢复失败 |
| `giveall`、`giftall` | 实体/虚拟物品、原资格及同 IP 筛选、数量、交付、部分失败和构造异常后的临时克隆清理 |
| `child`、`flyto`、`home` | 无加载副作用的实例查询、冷/热目标一致、虚拟房间、双扩展名及工作室后备位置 |
| `rideto`、`whistle`、`make` | 既有住房/坐骑/配方目标、双扩展名与虚拟路径、原限制、药材查询和缺失目标 |
| `learn` | `.c`/`.lpc` 已学内功互斥拒绝及兼容通过 |
| `skill`、`checkskill` | 中文名/英文名、混合扩展名招式列表、去重与数量、未学会/不可用分支 |
| `skills`、`myskill`、`yanlian`、`setsk`、`tongji`、`special` | 各自的源码存在性分支、旧格式与 `.lpc` 目标、原筛选或拒绝条件 |
| `team`、`vote` | 固定目录子命令、双扩展名、原参数传递、未知/越界输入及原业务限制 |
| `loadall` | 冷加载、同名去重、失败统计、异步子目录、直接及递归排除 tests/隐藏/非游戏目录 |
| `guilei` | 双扩展名扫描、房间/NPC 装备/货表虚拟引用、跳过处理程序、不完整货表、失败计数与临时对象清理 |
| `fcrypt` | `.c`/`.lpc`/`.h`、子目录、原授权和实际版本处理函数、虚拟路径不加载/不写入 |
| `info`、`data`、`sa`、`ff`、`more` | 对象身份与真实源码区分、克隆编号、函数定义来源、虚拟处理程序返回另一程序、缺源码和读取拒绝 |

额外复跑既有 `hotupdate` 时发现一条过时断言：当前驱动已支持命名函数引用
在热更新后重新绑定。驱动源码 `src/vm/internal/base/function.cc` 与实际调用均证实
旧 `(: version :)` 返回新值 `2`，而不是继续执行旧值 `1`。
据此更新测试，接受“安全拒绝”或“正确重绑”，另加匿名闭包必须拒绝的检查；
只同步该指令的提示/帮助，不改变热更新逻辑或驱动。因此实际修改为
28 个兼容性指令，另有 1 个帮助表述修正。

## 真实驱动结果

以下命令从仓库根目录执行，均通过；数字为断言数，不代表独立玩法数量。

| 命令 | 结果 |
| --- | --- |
| `node tools/tests/test_command_compatibility.mjs bin/driver.exe` | 162 项，0 失败；格式化后复跑通过 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --clone-command` | 51 项，0 失败 |
| `node tools/tests/test_cloth_objects.mjs bin/driver.exe --all` | 28,382 项，0 失败；离线迁移回归通过 |
| `node tools/tests/test_illusion_world.mjs bin/driver.exe` | 160,254 项，0 失败；重启、内容回调、异步兜底通过 |
| `node tools/tests/test_illusion_encounters.mjs` | 遭遇基线检查通过 |
| `node mudcore/tests/run.mjs bin/driver.exe` | 默认 2,198、覆盖配置 2,203、契约 55、自定义契约 56 项，全部通过 |
| `node tools/tests/test_hotupdate.mjs bin/driver.exe` | 更新断言后 68 项，0 失败 |

幻境和热更新测试会故意生成错误源码验证失败保护；这些预期编译错误不等同于
测试失败，最终以断言汇总、完成标记及进程退出码共同判定。
`fcrypt` 复用本库实际 `append_sn` / `file_valid` / `file_crypt`，不将当前函数的
简化行为宣称为已经实现额外的加密或完整性校验能力。

## 静态及交付检查

- 重扫 `/cmds/` 下 335 个实际 LPC 源码/头文件（含 3 个未跟踪的本地测试文件，未修改）。
- 保留合理的 `.c`：纯文件操作、明确生成的临时源码、固定存在文件、注释，以及驱动接受后缀的既有实例查询；未机械清零搜索结果。
- `goto` 相关旧后缀仅在注释；`clear` 有原生加载兜底；`summon` 及 `info` 的既有驱动对象查询无需为后缀重复改写。
- 本次 42 个修改/新增 LPC 文件均经项目格式化入口处理，`--check` 为 0 个待格式化文件。
- `git diff --check`、`openspec validate fix-command-lpc-virtual-compatibility --strict` 和差异审查均已通过；任务为 18/18，不修改食物迁移规划。

## 边界

测试启动临时驱动，只使用临时目录和回环地址；没有连接正式游戏、修改玩家存档、
派发真实物品或调用真实 AI。角色、安全规则及周边守护由最小夹具替换，覆盖的是
上述实际指令分支，不代表已经验证全部 335 个指令的所有玩法或正式服完整权限环境。

本次不要求数据转换；验证过程中未操作正式服务。`updatei` 的失败处理不承诺
复活已销毁对象，既有克隆也不会因重建蓝图自动刷新。正式全量 `updateall /`
尚未在本次执行，不以隔离回归替代实服上线检查。
