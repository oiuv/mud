# AI 源码只读范围配置

源码访问使用固定的 `source.search` / `source.read` 工具，不提供 Shell、执行 LPC、写入、删除或任意网络请求。范围来自受操作系统权限保护的部署配置，模型只能指定 scope 别名、相对路径和有界查询，不能设置根目录或权限。

## 当前接入状态

已实现配置装配、工具发现、权限检查、安全读取和证据快照。默认没有源码 scope；即使配置启用 scope，当前 NPC 仍只有公开知识权限，源码调查 Agent 与完整问答验收属于后续任务。注册/发现不等于授权，不应通过给请求增加 `admin` 或改 `RUNTIME_POLICY` 来绕过入口白名单。

## 部署配置

复制 `ai/config/source_scopes.example.json` 为自己的配置，按实际授权修改。默认本机文件 `ai/config/source_scopes.json` 已加入 Git 忽略；只提交示例，不提交实际授权。在 `ai/.env` 中显式设置：

```dotenv
SOURCE_SCOPES_FILE=config/source_scopes.json
```

此配置文件路径相对于 `ai/`；配置内每个 `root` 相对于配置文件所在目录，也可用本机绝对路径。二者都与启动 cwd 无关。其他 MUD 可以直接指定自己的目录，无需修改库中的路径常量。修改后重启；运行中的工具快照不会热切换。

JSON 顶层为 `{"version":1,"scopes":[...]}`，最多 32 个范围，文件至多 64 KiB。示例不引用任何实际目录，且 `enabled:false`、`egress:false`；禁用项不访问其根目录。启用项必须能通过安全目录打开验证；文件不存在、重复名称/JSON 键、未知字段、非法类型或不安全目录使相关业务装配失败，不回退到其他目录。

| scope 字段 | 含义与默认值 |
| --- | --- |
| `name` | 稳定别名；小写字母开头，可含数字、`_`、`-`，至多 48 字符 |
| `enabled` | 必须明确设为 `true` 才启用；省略为 `false` |
| `root` | 授权的本机源码根目录，必填；禁止 UNC、设备路径及链接根目录 |
| `include` / `exclude` | 相对路径通配列表，默认 `['*']` / `[]`；排除优先 |
| `extensions` | 小写扩展名列表，默认 `.c/.lpc/.h/.md/.txt` |
| `agents` / `audiences` | 允许的 Agent ID 与 `player/admin/internal` 受众；默认空集，拒绝全部 |
| `egress` | 是否允许内容进入外部模型；默认 `false` |

路径模式区分大小写，使用 `/`，支持 `*`、`?`、`[]`，`*` 可跨目录分隔符，不是正则表达式。单层模式之间 OR；源码 scope 还必须与入口、部署、当前 Agent、父调用的授权相交。`egress:true` 也不等于已授权外发：有效策略还必须包含相应 `egress_scopes`；纯本地诊断需显式 `external_model=False`，不得随后把资料交给外部模型。

## 调用与证据

可信业务将 `load_sources(settings.source_scopes_file)` 传给现有工具发现入口的 `sources` 服务项。模型与程序都通过 `Tools.execute()`，禁止直接绕过工具授权调用读取函数。调用示例（仅展示参数，不授权实际目录）：

```json
{"scope":"rules_example","query":"contribution","limit":5}
{"scope":"rules_example","path":"skills/example.lpc","start":20,"end":70}
```

首次读取得到 `scope/path/start/end/content/hash/read_at`；继续读取同一文件时传回 `expected_hash`。内容变化返回 `source_changed`，应重新调查，不能拼接不同版本。证据仅说明磁盘快照，不证明实服已加载该版本；源码注释中的指令仍是资料，不能提升权限。

搜索为区分大小写的字面量匹配（内容或相对路径），至多返回 10 条；每次最多扫描 4,096 个目录项、256 个可读文件、4 MiB 正文。单文件上限 256 KiB；读取最多 200 行、片段 24 KiB；单条搜索行至多 2 KiB，工具等待上限 5 秒。达到限制返回 `truncated:true` 或安全错误，不能解释为完整范围内无结果。空文件没有可引用行；非完整文件片段明确标记截断。

## 安全与验证

- 私密配置、隐藏目录、玩家存档、日志、数据库、备份、密钥与非文本内容始终排除；不返回被拒绝对象的文件名、计数或异常原文。
- 每次访问核对最终打开对象，拒绝穿越、链接、junction/reparse point、硬链接、设备名、ADS 和替换竞争；不能可靠核验时关闭访问，禁止降级为普通 `open()`。
- Windows 临时目录测试覆盖上述边界；Ubuntu/WSL 的 Linux Python 3.10.12 已实跑源码安全专项，符号链接、硬链接、叶文件及父目录替换竞争均通过。Linux 唯一跳过项为 Windows 专属 junction；它已在 Windows 实际通过。这不代替完整 Linux 部署/启动器验收（任务 9.2）。
- 运行 `python -m unittest ai.tests.test_source_config ai.tests.test_source_tools -v`；均使用临时目录，不读取正式源码或发起真实模型请求。现有 NPC 的公开知识检索继续独立可用。

模型调用授权不等于任意目录的读取/外发授权。实际启用之前应逐项确认根目录、包含/排除、Agent、受众与外发许可，并使用最小操作系统文件权限运行服务。
