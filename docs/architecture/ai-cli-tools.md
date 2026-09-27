# AI 授权 CLI 工具

统一入口为 `exec(program, args)`，例如 `exec(program="git_info", args=["version"])`。`program` 是管理员定义的别名，`args` 是参数数组，不是 Shell 字符串。程序、工作目录及可调用操作均由本地配置绑定，模型不能另外指定。

## 配置普通 CLI

高级配置 `CLI_PROGRAMS_FILE` 指向管理员维护的 JSON 文件；相对路径以 `ai/` 为准。默认空值不加载任何普通 CLI，也不要求安装外部程序。可以从 `ai/config/cli_programs.example.json` 复制为 `cli_programs.json`，按需修改；不要改正式 `.env` 或把密钥放进命令参数。实际配置文件排除于模型源码读取范围，默认本机文件名已加入 Git 忽略；自定义文件同样不要提交。

每个程序配置 `command`、`cwd`、`description` 和 `operations`。`command` 为程序名/路径，也可为 JSON argv 字符串；固定前缀由管理员提供，不能使用模型模板替换。`operations` 的键是 `args` 第一项，其 `arguments` 约束余下参数，复用已有本地 JSON 契约，不新增模型输出格式要求。

示例仅允许 `git version`，不开放其他 Git 操作或额外选项：

```json
{
  "git_info": {
    "command": "git",
    "cwd": "..",
    "description": "查看本机 Git 版本。",
    "operations": {
      "version": {
        "description": "返回版本，不接受其他参数。",
        "arguments": {"type": "array", "maxItems": 0}
      }
    }
  }
}
```

配置发现不等于 Agent 授权：受信任装配还须授予 `exec`，`RUNTIME_POLICY` 只能收紧已有权限。可用程序及参数说明由该工具提供，不增加命令列举工具；多个 CLI 共用同一入口。需要源码证据等特殊处理时，程序绑定可复用专用授权及结果适配，不另建模型工具。

## 调用与安全边界

- 参数在 Hook 前后均验证；Hook 拒绝时不启动进程，改写后不能扩大原授权。声明操作时必须限制访问目标、输出位置及其他危险选项，不能仅白名单程序名后放行任意参数。
- 只配置已审查的只读功能，不授权任意 Shell、解释器求值、文件修改或游戏数值修改。配置与 Hook 不是 OS 沙箱；服务账号仍需最小权限。
- Windows 支持 PATH 或显式路径的正常 npm/pnpm `.cmd` 启动器；无需手工找包内 Node/JS。参数按批处理转发规则转义，`%`、`!`、引号及连接符作为数据；不接受换行/NUL 或 `.ps1`。自定义启动器若再次解释参数，须独立验证，不能宣称任意脚本均安全。
- 复用工具运行时的用量、取消及单次 15 秒故障超时，不新增任务总期限。stdout 有界，stderr/异常原文不进入模型；普通 CLI 输出标为未受信资料，不登记为源码证据。外部工具自己的缓存维护不受干预。
- 取消/超时会停止等待，POSIX 清理本次进程组，Windows 尝试清理本次进程树并回收直接进程；不保证能停止外部程序主动脱离的独立进程，不交付迟到成功。

## CodeGraph 与迁移

模型不再看到 `codegraph.explore`；NPC 与主 Agent 在源码开启时可通过 `exec` 使用获准程序。CodeGraph 别名为 `codegraph`，专用适配保留源码过滤、当前读取、hash 及证据登记，不能在普通 CLI 配置中覆盖此保留别名。

保留原 `CODEGRAPH_ENABLED`、`CODEGRAPH_COMMAND` 和 `SOURCE_ROOT`，默认关闭状态和显式路径不变。`CODEGRAPH_OPERATIONS` 默认仅 `explore`；管理员可明确设为 `explore,query,callers,callees,impact,node,files` 开放全部查询，或填写所需子集。不自动安装、建库或授权新操作。

若 `RUNTIME_POLICY.tools` 曾列出 `codegraph.explore`，须管理员明确将它换成 `exec`；旧上限不会自动翻译或扩大。检查 `CLI_PROGRAMS_FILE` 中的程序也都是希望该入口使用的能力；没有此文件时不增加其他程序。关闭源码时 CodeGraph 不注册，普通 CLI 不因此获得源码证据能力。

按目标选择操作，不规定查询顺序。例如：

- `{"program":"codegraph","args":["explore","learn"]}`：实现与相关源码。
- `{"program":"codegraph","args":["query","learn","--limit","4"]}`：符号定位。
- `{"program":"codegraph","args":["node","learn","--file","teachers/elder.lpc"]}`：同名消歧。
- `callers/callees/impact` 接符号名；`files` 可带 `--filter` 或 `--pattern`。

工具目录给出每项可用参数，模型不能覆盖仓库路径。位置和关系是索引线索，原文来自本次安全读取；`files` 只给当前可读路径，不伪造源码证据。本机 CodeGraph 1.6.0 的 `node` 实测未按分页参数截取内容，因此模型入口只开放符号/文件查询与同名消歧，指定行补读用 `source.read`，不承诺 CLI 未实现的行为。旧 `context` 效果报告保留为历史，不改称 `explore` 的结果。

## 验证

离线回归使用临时程序，不调用真实模型：

```sh
python -m unittest ai.tests.test_exec ai.tests.test_codegraph ai.tests.test_codegraph_exec ai.tests.test_config_example -v
```

Windows 参数测试使用真实 `.cmd` 转发，覆盖中文/空格、引号、变量、连接符及 PATH；Linux 跳过该平台专属项，并独立验证原生进程、取消、超时和授权。实际 CodeGraph 查询与同条件模型效果另行验收，不以假 CLI 通过替代。
