# Verification

## Scope

日期：2026-10-07。本次只增加统一入口、编排单元测试和开发说明，不修改原五组脚本、LPC 断言、游戏逻辑或正式数据。不将用户已完成的 9,989 档案全编译当作新入口的测试结果。

## Entry Tests

- `node --check tools/test_gameplay.mjs` 与 `node --check tools/tests/test_gameplay_runner.mjs`：语法检查通过。
- `node --test tools/tests/test_gameplay_runner.mjs`：22/22 通过；首轮含空格绝对脚本路径用例发现拼接错误，改为 `resolve()` 后完整重跑通过。
- 覆盖五组固定正向清单、驱动/Python 传参、Windows/Linux 默认路径分支、未知/缺失/重复参数、缺依赖、无依赖帮助、仓库外调用、真实 Node 子进程 cwd/含空格 argv/中文双流输出、动态统计、摘要缺失/冲突、失败续跑、启动异常及中断不继续。
- 编排失败用例使用受控替身；这些 22 项不计入游戏回归检查数。

## Real Driver Run

执行 `node tools/test_gameplay.mjs`，Windows / Node.js v24.21.0，默认使用本库 `bin/driver.exe` 和 `ai/.venv/Scripts/python.exe`。命令退出码 **0**，五组正向回归合计 **788 项、0 失败、0 组未知计数**，总耗时 **104.12 秒**。逐组如下：

| 套件 | 检查 / 失败 | 耗时 | 系统临时目录名 |
| --- | --- | --- | --- |
| 交易与背包 | 61 / 0 | 37.49 s | `mud-commerce-audit-RRUE7a` |
| 公共战斗 | 410 / 0 | 33.86 s | `mud-weapon-combat-5Ir1lQ` |
| 具体武学 | 115 / 0 | 11.61 s | `mud-martial-audit-6i5GwK` |
| AI LPC 通信 | 166 / 0 | 13.83 s | `mud-ai-lpc-JO0Upw` |
| NPC 重连 | 36 / 0 | 7.34 s | `mud-npc-reconnect-YfyEGJ` |

各目录的 `driver-output.txt` 已逐一检查，含成功标记；前四组含检查计数，重连 36 项由原 Node 脚本输出，未将 LPC 端单个 PASS 当作 36 项计数。Windows 既有 `Platform doesn't support eval limit!` 提示保持，无 LPC 编译错误或警告。耗时包含各组复制源码、启动和清理，不代表游戏响应时延。

## User Confirmation

2026-10-07，用户从仓库真实路径运行统一入口并提供完整输出：五组分别为
61、410、115、166、36 项检查，全部通过；合计 788 项、0 失败、0 组未知计数，
总耗时 83.48 秒。此为用户复测记录，与上方开发阶段实测分别保留。

用户同时确认链接路径启动会静默退出，而真实路径运行正常。已通过临时目录联接复现：
入口的路径字符串比较未解析链接，导致未执行 `main()`。用户决定暂不修复，
保留原实现并使用真实路径运行；临时新增的链接测试已撤回，不宣称支持该启动方式。
提交前再次运行两个文件的语法检查及 22 项编排测试，全部通过。

## Final Review

- `node tools/test_gameplay.mjs --help` 正常退出且不启动测试，实际选项与三份使用文档一致。
- `git diff --check` 与 `openspec validate add-gameplay-regression-entry --strict` 通过。
- 五组原入口、LPC 实现/断言及 mudcore 无改动；没有新增 LPC 文件，无需 LPC 格式化。本次 Node 脚本已通过语法和功能检查。
- `data/e2c_dict.o`、`data/emoted.o` 的 SHA-256 与本轮开始时相同；原有未提交变化保留，没有修改 README 项目介绍、玩家日志或正式配置。
- 覆盖范围为已确认六项任务：固定编排及依赖、结果/失败/中断、文档、编排测试、真实五组复跑、最终差异与规范审查。不据此宣称全库逻辑或 Linux 实机验证通过。

## Boundaries

- Windows 主机实际运行；非 Windows 默认路径分支有单元测试，不宣称 Linux 实机验收。
- 复用原脚本的系统临时目录、本机随机端口和日志保留方式；不连接正式服、不读写玩家存档或调用付费模型。
- 工作区原有 `data/e2c_dict.o`、`data/emoted.o` 不纳入本次提交；本次经用户确认提交测试入口及相关文档，不归档其他 OpenSpec 变更、不推送。
