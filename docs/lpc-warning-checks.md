# LPC 编译警告检查

清理类型警告时保持原有运算顺序、截断位置、返回类型及游戏数值，不使用 `#pragma no_warnings` 隐藏问题。语义说明见 [类型转换](LPC_Language_FluffOS.md#35-类型转换)。

## 隔离全库编译

从仓库根目录运行（Node.js 18+，FluffOS `lpcc` 须支持 `--batch`）：

```sh
node tools/tests/check_lpc_warnings.mjs bin/lpcc.exe
```

也可在编译器路径后指定要检查的受版本管理的源文件。脚本复制主库和 mudcore 的游戏源码到系统临时目录，排除存档、驱动源码、开发工具和隔离测试。不会读取 `.env`、玩家存档或正式运行配置；不启动正式服务。

临时宿主重命名 `create`，保留函数体编译但不执行初始化；为部分旧武学的全局表达式提供固定技能值的临时 `this_player()`。这只验证编译，不代表角色状态或玩法回归。所有选中程序均须成功，编译器输出及 `debug.log` 中的 LPC 警告、错误须为零；临时目录保留完整诊断。

Windows 驱动可能输出 `WARNING: Platform doesn't support eval limit!`，这是驱动的平台能力提示，不是 LPC 编译警告。脚本单独显示该提示，不修改驱动或屏蔽其他警告。

## 数值与框架回归

```sh
node tools/tests/test_numeric_conversions.mjs bin/driver.exe
node mudcore/tests/run.mjs bin/driver.exe
```

数值回归从当前源码提取修改后的表达式，与测试夹具中保留的旧隐式转换比较，检查结果和整数返回类型；涵盖 25 处武学增量、NPC 技能等级、任务等级、装备伤害及百分比的正负值、小数和分段边界。旧夹具刻意保留隐式转换，因此仅允许 `/tests/before.lpc` 的预期截断警告，当前表达式不得有警告。

框架回归另外检查进度条整段、部分段、负进度、满进度和溢出标记的输出，并执行既有四组隔离套件。

## 2026-10-06 验证记录

- 实测 Windows 驱动标识：`fluffos 20260929-5270e7d6-328aaf10`。
- 隔离编译：**10058/10058** 个受版本管理的游戏程序通过，**0 个 LPC 警告、0 个错误**；该数量与实服目录中的文件统计不必完全一致。
- 数值对照：**1299** 组全部一致。
- mudcore：default **2308**、overrides **2313**、minimal **58**、custom **59** 项 LPC 检查及 Node 通信断言全部通过。
- 本次修改的 LPC 文件均已格式化并通过 `--check`；未重启或修改正式服务、未迁移存档。
- 维护者随后在实际游戏中重新执行 `updateall /`，确认全量编译通过且没有警告；此项为维护者反馈，与上述隔离验证分别记录。
