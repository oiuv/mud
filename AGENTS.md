# Repository Guidelines

## Project Structure & Module Organization

This is a UTF-8 Chinese MUD written primarily in LPC and run by FluffOS. Administrative daemons and configuration live in `adm/`; player, wizard, and test commands are under `cmds/`. Game content is organized across `d/`, `b/`, `world/`, and `clone/`. Shared behavior belongs in `feature/`, `inherit/`, and `std/`, while headers and macros live in `include/`. Keep technical documentation in `docs/`; `www/` contains the WebSocket client assets. `mudcore/` is a Git submodule, and `ai/` is an optional Python service.

## Build, Test, and Development Commands

- `git submodule update --init` initializes the required `mudcore` framework.
- `./build.sh` installs Linux prerequisites and builds the FluffOS driver; `./build_msys2.sh` is the Windows/MSYS2 equivalent.
- `./run.sh` starts the Linux build with `config.ini`; `run.bat` starts the Windows driver.
- `driver config.ini -d` runs directly in debug mode. Default listeners are telnet ports `5566`/`6666` and WebSocket port `8888`.
- `cd ai && python -m pip install -r requirements.txt && python main.py -d` starts the optional AI service in debug mode.

## AI Service

Use AI_CLIENT_D for all game-side AI requests; keep NPC validation and display in AI_NPC_D. Register Python capabilities explicitly in ai/main.py, with separate bounded capacity and deadlines. Reuse ai/src/llm.py for model calls; prompts, persistence and durable deduplication belong to each business module. See docs/daemons/ai_client_d.md for contracts. Automated tests use temporary data and fake models; live API calls are separate.

## Coding Style & Naming Conventions

Honor `.editorconfig`: UTF-8, LF endings, four-space indentation, trimmed trailing whitespace, and a final newline. Never use tabs in LPC. Declare variables at the start of a function, before executable statements. Use `snake_case` for all new LPC functions, including sefuns, lfuns, callbacks, and framework hooks; do not encode function origin through casing. Preserve driver-mandated names and documented legacy aliases. Constants use `UPPER_SNAKE_CASE`; descriptive camelCase local variables remain allowed. Do not rename stored fields or protocol keys for style. Follow the surrounding directory’s lowercase LPC filename and object-ID patterns. For mudcore API migration and compatibility, see `mudcore/docs/function-naming.md`.

Function names must describe actual behavior, not mechanically split capital letters: treat `todo` as one concept, distinguish collections/counts/descriptions, and use action verbs for mutations. A naming-only change must preserve parameters, return values, boolean polarity, and stored data.

### LPC 文件命名

`mudcore/` 的文件命名遵循其自身 `AGENTS.md`。

- 游戏中新建 LPC 源文件使用 `.lpc` 扩展名，文件名沿用所在目录的小写命名方式，例如 `quest_helper.lpc`。头文件继续使用 `.h`。
- 修改已有 `.c` 文件时保留原文件名，不因本规范批量改名。同一路径下不要新增同名的 `.c` 和 `.lpc` 文件，它们对应同一个对象名。
- `inherit`、`load_object()`、`clone_object()`、`call_other()` 等对象引用优先使用无扩展名路径，如 `"/std/room"`；`#include` 仍写实际文件名。
- 引入新 `.lpc` 文件时检查所属模块的命令索引、目录扫描和更新工具；涉及只识别 `.c` 或拼接 `".c"` 的加载路径时，同步兼容双扩展名并验证新文件可被发现、加载。

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

开发中涉及 LPC 语法、类型、运算符、编译器扩展或 efun 签名时，以 `docs/LPC_Language_FluffOS.md` 的最新内容为项目标准。驱动升级后，应先根据 `fluffos/` 源码和测试同步该文档。

## Commit & Pull Request Guidelines

Recent history favors concise subjects such as `fix: ...`, `feat: ...`, and `refactor: ...`; use an imperative summary in Chinese or English and keep each commit focused. Pull requests should explain behavior changes, list affected paths and validation commands, and link relevant issues. Add screenshots for `www/` changes or a short game transcript/log excerpt for gameplay changes.

## Security & Configuration

Copy `data/.env.example` to `data/.env` locally. Never commit credentials, generated logs, dumps, temporary files, or player data.
