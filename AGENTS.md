# Repository Guidelines

## Project Structure & Module Organization

This is a UTF-8 Chinese MUD written primarily in LPC and run by FluffOS. Administrative daemons and configuration live in `adm/`; player, wizard, and test commands are under `cmds/`. Game content is organized across `d/`, `b/`, `world/`, and `clone/`. Shared behavior belongs in `feature/`, `inherit/`, and `std/`, while headers and macros live in `include/`. Keep technical documentation in `docs/`; `www/` contains the WebSocket client assets. `mudcore/` is a Git submodule, and `ai/` is an optional Python service.

## Documentation Layout & Sources

- `doc/` 是历史 LPC、efun/apply 文档归档，仅供历史查阅，不作为当前开发依据。
- 查阅 efun/apply 的签名、行为和限制时，必须使用所用 FluffOS 版本对应的 `fluffos/docs/` 文档或 `fluffos/src/` 源码；有疑义时以驱动实现为准，并核对功能的支持版本。
- `docs/` 存放本项目的游戏开发文档。目前覆盖不全，随功能开发、修复和重构同步补充完善，不安排专项补齐或以全量覆盖为交付前提。
- `help/` 统一存放面向游戏用户的文档，包括玩法说明、命令用法和操作帮助；开发者参考与实现细节留在 `docs/`。
- 所有面向玩家的游戏更新（新功能、玩法或数值调整、操作变化及问题修复）必须在同一变更中同步更新 `help/changelog`，玩家通过 `help changelog` 查看。沿用现有日期倒序和游戏内显示格式，用简洁中文说明玩家能感知的变化及必要的操作示例，不直接复制技术提交记录，不把未实现或尚未开放的功能写成已可用。纯内部重构、开发规范等无玩家影响的变更无需写入玩家更新日志。

## Build, Test, and Development Commands

当前 MUDLIB 最低支持 **FluffOS v2026.0712.3**，开发与测试以该版本及更新版本为目标，不为更早的驱动添加兼容分支。使用晚于最低版本才引入的功能时，须核对实际支持版本并明确提升最低要求，不能把“现代 FluffOS”当作所有新特性均可用的保证。

- `git submodule update --init` initializes the required `mudcore` framework.
- `./build.sh` installs Linux prerequisites and builds the FluffOS driver; `./build_msys2.sh` is the Windows/MSYS2 equivalent.
- `./run.sh` starts the Linux build with `config.ini`; `run.bat` starts the Windows driver.
- `driver config.ini -d` runs directly in debug mode. Default listeners are telnet ports `5566`/`6666` and WebSocket port `8888`.
- `cd ai && python -m pip install -r requirements.txt && python main.py -d` starts the optional AI service in debug mode.

## AI Service

遵循 KISS：优先保证正常条件下任务正确完成与常见故障恢复，选择性借鉴成熟 Agent，不为假设中的边界场景增加框架、抽象或恢复分支。模型负责判断与生成，程序保管权限、证据关联、用量、取消及提交状态；compact 只要求文本工作摘要，不要求模型用 JSON 复述证据元数据。简化实现不削弱安全和业务完成检查，效果以任务续行与正确结果验收。

Use AI_CLIENT_D for game-side AI requests; keep NPC validation/display in AI_NPC_D. Register capabilities explicitly in ai/main.py with separate capacity and opt-in long request types. Model-backed business capabilities use ai/src/runtime/Runner and ai/src/llm.py; retrieval uses the unified Tool boundary. Maintain business prompts in ai/skills/, loaded through the single skill(name, path?) tool, including preloads. Runtime compact instead uses ai/src/runtime/prompts/compact.md directly, without Tool/Skill permissions; trigger at 80% of the configured model window or earlier for output space. Preserve evidence, authority, complete tool groups and shared accounting; replace history only after validation. Cumulative call counts and elapsed task time do not terminate live long requests. NPC long requests share caller liveness/cancellation across summary, investigation and compact; keep single-I/O timeouts and legacy short deadlines separate. World queue, business quotas and normal single-generation behavior remain. Keep persistence/deduplication in business modules and commit verified candidates through runner.commit() before success. Do not import game business into the runtime or derive source/admin authority from request fields. See docs/architecture/ai-service.md and docs/daemons/ai_client_d.md. Tests use temporary data/fake models; live API tests require authorization.

模型调用按次结算并汇总到父级账本，区分主/子过程、业务/摘要/compact/向量/重排；输入、缓存输入、输出及失败用量缺失必须标为未知，不当作零费用。缓存输入属于总输入子集，本地检索缓存命中不产生新模型调用。费用仅按部署配置 `MODEL_PRICES_PER_MILLION` 估算，不硬编码报价、不据此中断任务；评测保留有限题集和显式真实调用授权，缺少质量验收不报告“每个正确答案”的成本。

提供方实际返回的思考字段与正文分开，按模型协议保留在本 Agent 历史并纳入容量/compact，不进入玩家回复、业务成功历史/缓存或父 Agent 交付。允许通过可信本地配置显式开启受限思考诊断，结合工具轨迹和最终答案分析质量；普通日志不自动输出正文，不转储密钥配置或 SDK 异常原文。诊断目录须受 OS 权限保护、排除源码读取范围和 Git 提交，不能由玩家载荷或 Skill 开启；诊断开关不改变协议保留或触发额外模型调用。思考不是事实证据，质量仍须对照源码与标准答案验收。

源码访问采用单仓库配置：`SOURCE_ENABLED` 默认启用，`SOURCE_ROOT` 默认 `ai/` 的父目录，相对路径以服务目录为准。NPC、已启用的主 Agent 和本机诊断共用仓库及统一敏感排除，允许必要片段外发，不上传整库；不再添加逐目录、逐 Agent/角色的源码权限矩阵。保留只读、仓库边界、知识/会话隔离及工具/取消/证据/提交检查，世界和摘要不获得源码工具；显式关闭后仍可文档问答。固定题与全仓库调查分开记录范围、策略版本及结果。

公共名称字典 `data/e2c_dict.o` 是精确文件例外，复用 `source.search/read` 查询与外发必要片段，不开放其他存档、不执行对象。长行按真实行列截取，证据保留整文件 hash；实际私有路径排除、源码关闭和仓库边界优先，替代仓库不回读本库字典。含字典的效果题集另存版本，不改写原快照或混算旧报告。

源码问答的玩家正文不得泄露内部路径、函数和证据标识；管理员证据视图仅通过 OS 授权的本机诊断入口提供，不接受网络载荷自授管理权限。`ai/scripts/debug_source.py` 默认预览，执行须有范围/外发授权并将报告保存于受保护目录。证据代表源码快照，不证明实服已加载，也不代表答案语义已经人工验收。

源码问答效果题须来自本游戏真实源码，开发者先查明条件、数值及调用依赖，记录可复核依据。虚构武学只能用作自动回归，不要求游戏维护者核对虚构门规，也不能用其通过率替代实际游戏效果。将实际模型回答与源码基准对照后，再核查源码无法证明的实服状态；外发范围和模型调用授权仍独立确认。

专业任务经统一 `agent.list` / `agent.invoke` 绑定既有业务，不通过 socket 自回调或绕过业务提交/容量。首期仅允许单层顺序委派；子任务保留根身份、权限交集、用量和取消，独立管理历史及模型窗口，不自动回传原始工具过程。世界委派仅操作宿主绑定的冻结事实，后台受理不代表正文完成；不要把长委派当作一次 I/O 套用固定 Tool 总超时。

主 Agent 仅经默认关闭的显式 `agent_run` 接入；简单目标直接处理，不强制委派。专业成果提交后才可生成请求内引用，主 Agent 接收必要结论、限制及待办，仍负责整体完成判断。原成果由可信交付层解析，不再生成；核验归属、有效权限、完整性、取消和输出约束。compact 保留这些关联，持久成功缓存保存已解析响应及完整请求/权限指纹，不保存悬空引用，不改旧 NPC 缓存或自动重跑收费任务。

AI 开发遵循简化架构：主 Agent 是 MUD 通用智能体，专业子 Agent 可直达或按需委派；Tool 提供能力、Skill 提供必要指导、Hook 负责观测和必要干预。默认由模型自主规划，仅明确场景规定工作流，不为评测题增加固定规则或强制清单。仅明确要求结构化结果的接口启用 `Agent(json_output=True)`，使用 JSON Object；文本和 compact 不启用 JSON，不增加 Schema 转换或修复模型。JSON 调用不发送 `max_tokens`，更换模型须同步核对环境变量中的上下文窗口与最大输出容量；本地证据、取消、权限和业务提交检查不能省略。

Tool 只维护功能与调用接口，风险操作授权由 Hook 按管理员策略控制；外部工具由管理员配置。调用已授权接口时，不额外干预外部工具自身的缓存维护等内部行为，不把“只读查询”误解为工具内部必须零写入；这不向模型开放任意命令或源码/游戏数据修改能力。

外部 CLI 共用 `exec(program, args)`，不为每个程序或子命令增加模型工具。管理员绑定程序、操作、参数和工作目录，Hook 前后复核；Skill 仅指导用法，不授予权限。CodeGraph 复用源码边界与当前证据读取，各操作调用对应真实命令，旧配置升级不自动扩大操作或工具授权。配置示例只放常用项，高级设置见 `docs/architecture/ai-configuration.md` 和 `ai-cli-tools.md`。

NPC 与主 Agent 的规则答案只生成一份带证据的玩家段落 `parts`；程序原样拼接正文并提取同源结论，不让模型重复撰写 `answer/claims`。证据元数据不展示给玩家，角色表达可以保留；同源或格式合格不证明事实正确，仍按源码与业务标准验收。代码和对应 Skill 的格式说明须同步更新，旧成功缓存不重生成。

真正缺资料时允许明确标注的推测或条件假设，说明依据及未核实部分；复用无证据段落与 `pending`，不增加字段或审稿模型。推断不列入已核实规则，不代替决定性证据或玩家实时状态；无害发散不判失败，但与已知事实矛盾或后文将假设肯定化仍属错误。评测审核完整正文，不只核对带证据段落。

## Coding Style & Naming Conventions

AI 辅助命令统一放在 `ai/scripts/`，保持单层目录，以 `ops_`（运维）、`debug_`（诊断）、`verify_`（验证）、`bench_`（性能）、`eval_`（效果评测）、`example_`（接入示例）命名；自动测试与夹具仍放 `ai/tests/`。新增或改名时同步 `ai/scripts/README.md`、启动器、导入及文档引用，并明确写数据、连接服务和模型消费行为，不能仅凭名称认定离线或无副作用。

Honor `.editorconfig`: UTF-8, LF endings, four-space indentation, trimmed trailing whitespace, and a final newline. Never use tabs in LPC. Declare variables at the start of a function, before executable statements. Use `snake_case` for all new LPC functions, including sefuns, lfuns, callbacks, and framework hooks; do not encode function origin through casing. Preserve driver-mandated names and documented legacy aliases. Constants use `UPPER_SNAKE_CASE`; descriptive camelCase local variables remain allowed. Do not rename stored fields or protocol keys for style. Follow the surrounding directory’s lowercase LPC filename and object-ID patterns. For mudcore API migration and compatibility, see `mudcore/docs/function-naming.md`.

Function names must describe actual behavior, not mechanically split capital letters: treat `todo` as one concept, distinguish collections/counts/descriptions, and use action verbs for mutations. A naming-only change must preserve parameters, return values, boolean polarity, and stored data.

### 物品与迁移数据命名

物品 `*_data.h` 的顶层品种按规范 ID 自然升序排列，数字后缀按数值排序（如 `chahua1`、`chahua2`、…、`chahua13`）。新增品种放入对应位置；排序不重新编号，不改变品种内部字段、输入别名或属性数组的顺序。生成与审计工具须使用同一排序规则，历史源码快照与离线映射不因排版重写。

规范 ID 和新增文件名应简洁、唯一、能大致识别内容。允许有意义的短名称加稳定编号，如 `buyi2`、`xiuhuaxie2`、`chahua13`；多词使用 snake_case。不为表达所有颜色、价格、重量、描述或限制而拼接长限定词，也不带仅表示历史来源的目录或作者前缀。已有简洁名称保留，编号不随排序或插入改变，等价定义仍合并。此规则适用于所有后续数据迁移；更名须同步调用、测试、文档及旧记录的离线映射，不改变玩家名称、属性或行为，不增加运行期别名。

### 玩家可见文本

- 所有玩家可能看到的名称、描述和提示都必须符合武侠游戏语境，包括房间、物品、NPC 对话、命令反馈、帮助文本、系统消息、异常提示、默认值、占位内容和降级文案。
- 不向玩家展示“模板”“绑定实例”“后台队列”“API”“数据库”等实现术语；用玩家能理解的游戏内现象和操作表达。例如，未初始化的幻境显示“未知心魔幻境”和雾霭描写，而不是“心魔幻境模板”或“尚未绑定玩家实例”。
- 技术术语及实现细节仅放在代码注释、受限日志和管理员工具中。不要将异常原文、内部路径、协议状态或服务响应直接拼入玩家消息；按游戏语境提供可执行的提示，诊断信息另行记录。
- 修改涉及显示的代码时，审查正常、未初始化、失败、超时及服务不可用路径，确保兜底内容同样遵守本规范。管理员专用诊断仍可使用准确的技术术语。

### LPC 文件命名

`mudcore/` 的文件命名遵循其自身 `AGENTS.md`。

- 游戏中新建 LPC 源文件使用 `.lpc` 扩展名，文件名沿用所在目录的小写命名方式，例如 `quest_helper.lpc`。头文件继续使用 `.h`。
- 修改已有 `.c` 文件时保留原文件名，不因本规范批量改名。同一路径下不要新增同名的 `.c` 和 `.lpc` 文件，它们对应同一个对象名。
- `inherit`、`load_object()`、`clone_object()`、`call_other()` 等对象引用优先使用无扩展名路径，如 `"/std/room"`；`#include` 仍写实际文件名。
- 引入新 `.lpc` 文件时检查所属模块的命令索引、目录扫描和更新工具；涉及只识别 `.c` 或拼接 `".c"` 的加载路径时，同步兼容双扩展名并验证新文件可被发现、加载。

## Virtual Objects

虚拟对象统一采用 `/provider/key` 路径，由实体处理程序实现 `object create_virtual_object(string key)`；守护精灵只原样传递末段，业务自行解析坐标/编号、检查归属并返回新克隆或 `0`。新代码不使用 `query_maze_room()` 作为通用入口，不增加 daemon 类型分支，不手动重命名、赋权或重复初始化；依赖最终虚拟身份的初始化使用驱动 `virtual_start()`。继承 CORE_VRM 的迷宫须配套更新 mudcore。约定、测试和部署边界见 `docs/architecture/virtual-objects.md`。

## LPC Formatting（必须执行）

修改或新增 LPC 源文件（`.c`、`.lpc`）及其头文件（`.h`）后，AI 必须在交付或提交前对本次修改的文件运行格式化，再运行 `--check` 验证。此要求也适用于 `mudcore/` 子模块。

- 统一使用项目入口 `tools/format_lpc.mjs`，参数固定为 `indentSize: 4`、`printWidth: 100`。采用 K&R 大括号风格，其他间距与换行交由 FluffOS 格式化器处理。
- 需要 Node.js 18+ 和本地 `fluffos/tools/lpc-syntax/` 源码，无需 `npm install`。上游 `format-corpus.mjs` 默认使用两空格，不要直接用其默认值格式化游戏代码。
- 仅传入本次修改或新建的 LPC 文件，保留其他文件现状。路径含空格时加引号；子模块文件同样从主仓库根目录指定。
- 工具在写入前检查 token 序列、字面量与注释内容，以及幂等性；任一文件检查失败时，本批文件不写入。工具缺失或报错时，应说明原因并解决，不能跳过检查后声称格式化完成。
- 保留字符串、模板、heredoc、注释及预处理指令中的受保护内容；其中原有的超长行或尾部空格不应为了满足排版检查而被改写。
- 格式化后审查差异，并按改动范围执行 LPC 编译或游戏回归检查。格式化不替代命名规范、变量声明位置要求或功能验证。

从仓库根目录执行，以下文件路径替换为本次实际修改的文件：

```sh
node tools/format_lpc.mjs cmds/adm/updateall.c
node tools/format_lpc.mjs --check cmds/adm/updateall.c

# 修改 mudcore 时使用相同规则
node tools/format_lpc.mjs mudcore/inherit/user_gmcp.c
node tools/format_lpc.mjs --check mudcore/inherit/user_gmcp.c
```

`--check` 不修改文件；发现需要格式化的文件或检查失败时返回非零退出码。

## Testing Guidelines

There is no repository-wide coverage runner. Start FluffOS in debug mode, inspect `log/debug.log` and `log/error.log`, and exercise the affected gameplay path. Administrator-only `eval` supports focused checks; reusable command tests belong in `cmds/test/`. Include regression steps for rooms, NPCs, commands, or protocols touched.

## LPC Language Reference

开发中涉及 LPC 语法、类型、运算符或编译器扩展时，以 `docs/LPC_Language_FluffOS.md` 的最新内容为项目标准，并注意其中标注的核对基线与支持版本。efun/apply 的签名和行为必须查阅 `fluffos/docs/` 或 `fluffos/src/`，不以历史 `doc/` 或项目指南中的摘要替代驱动依据。驱动升级或开发中发现差异时，根据源码和测试同步修订相关内容。

## Commit & Pull Request Guidelines

Recent history favors concise subjects such as `fix: ...`, `feat: ...`, and `refactor: ...`; use an imperative summary in Chinese or English and keep each commit focused. Pull requests should explain behavior changes, list affected paths and validation commands, and link relevant issues. Add screenshots for `www/` changes or a short game transcript/log excerpt for gameplay changes.

## Security & Configuration

Copy `data/.env.example` to `data/.env` locally. Never commit credentials, generated logs, dumps, temporary files, or player data.

### 权限架构与后续开发

后续开发以[简化权限规范](docs/architecture/security-permissions.md)为准：新功能仅区分玩家与管理员，复用驱动 `wizardp()` 标记判断管理身份，不细分巫师等级；代码经 Git 审查、测试和部署交付，不再以按巫师等级分区的在线源码开发为目标。开发贡献者身份不自动获得实服管理权限；只有出现明确的运营需求时才另行设计受限 GM，不预建多级权限或复杂 RBAC 框架。

- 新功能和重构不为 `immortal/apprentice/wizard/arch` 中间等级、个人开发目录授权或旧在线编辑流程增加兼容分支、别名和新依赖；不新增 `wiz_level() >= 数字` 等等级序号判断。
- 保留 UID/EUID、对象归属、文件与存档访问、身份切换及管理操作授权。Root/Domain 等对象身份不是人员角色，不得把全部对象提权为 Root，或将 `valid_*` 改为无条件放行。
- 源码由部署流程写入；后续不新增在线编辑源码的开发入口，旧命令保留但不作为日常开发流程。必要的更新、重启、数据管理及 `eval` 等高危操作仍须受授权、调用者校验和审计约束，不因采用 Git 而免检；本规范不调整已有操作的权限。
- **旧实现保留，新功能遵守新规范。** 现有六级权限、账号角色、命令路径及目录规则不迁移、不顺带改写，全面迁移不是新功能开发的前提。新管理员命令放在 `/cmds/adm/`，以 `wizardp(me)` 判断管理身份，保留调用者、对象归属及具体操作授权检查；不要求新功能使用旧 `(admin)` 名称或等级序号判断，不另建权限运行时。巫师标记由可信身份流程通过 `enable_wizard()` / `disable_wizard()` 管理，不能由玩家输入自授。现有多个旧巫师等级都可能具有该标记，不能据此批量替换旧命令的 `valid_grant()` 或改变既有权限；整体迁移须另行确认。
- 旧权限系统功能正常即可长期共存，不列为默认待迁移债务，不设清理期限。仅在具体场景显示安全、维护或功能接入方面的明确收益，且迁移收益高于成本和风险时，才提出独立迁移建议；未经确认不实施，不因架构年代或形式统一而重构。
- 本规范属于本 MUDLIB 的宿主策略，不将两角色业务规则硬编码进通用 `mudcore`；不改变既有物品存档迁移和驱动最低版本要求。
