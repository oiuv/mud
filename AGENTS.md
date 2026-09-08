# Repository Guidelines

## Project Structure & Module Organization

This is a UTF-8 Chinese MUD written primarily in LPC and run by FluffOS. Administrative daemons and configuration live in `adm/`; player, wizard, and test commands are under `cmds/`. Game content is organized across `d/`, `b/`, `world/`, and `clone/`. Shared behavior belongs in `feature/`, `inherit/`, and `std/`, while headers and macros live in `include/`. Keep technical documentation in `docs/`; `www/` contains the WebSocket client assets. `mudcore/` is a Git submodule, and `ai_service/` is an optional Python service.

## Build, Test, and Development Commands

- `git submodule update --init` initializes the required `mudcore` framework.
- `./build.sh` installs Linux prerequisites and builds the FluffOS driver; `./build_msys2.sh` is the Windows/MSYS2 equivalent.
- `./run.sh` starts the Linux build with `config.ini`; `run.bat` starts the Windows driver.
- `driver config.ini -d` runs directly in debug mode. Default listeners are telnet ports `5566`/`6666` and WebSocket port `8888`.
- `cd ai_service && python -m pip install -r requirements.txt && python main.py -d` starts the optional AI NPC service in debug mode.

## Coding Style & Naming Conventions

Honor `.editorconfig`: UTF-8, LF endings, four-space indentation, trimmed trailing whitespace, and a final newline. Never use tabs in LPC. Declare variables at the start of a function, before executable statements. Use `UPPER_SNAKE_CASE` for constants, descriptive camelCase for local variables and business helpers, and established `under_score` names for driver applies, efuns, and framework hooks. Follow the surrounding directory’s lowercase LPC filename and object-ID patterns.

## Testing Guidelines

There is no repository-wide coverage runner. Start FluffOS in debug mode, inspect `log/debug.log` and `log/error.log`, and exercise the affected gameplay path. Administrator-only `eval` supports focused checks; reusable command tests belong in `cmds/test/`. Include regression steps for rooms, NPCs, commands, or protocols touched.

## LPC Language Reference

开发中涉及 LPC 语法、类型、运算符、编译器扩展或 efun 签名时，以 `docs/LPC_Language_FluffOS.md` 的最新内容为项目标准。驱动升级后，应先根据 `fluffos/` 源码和测试同步该文档。

## Commit & Pull Request Guidelines

Recent history favors concise subjects such as `fix: ...`, `feat: ...`, and `refactor: ...`; use an imperative summary in Chinese or English and keep each commit focused. Pull requests should explain behavior changes, list affected paths and validation commands, and link relevant issues. Add screenshots for `www/` changes or a short game transcript/log excerpt for gameplay changes.

## Security & Configuration

Copy `data/.env.example` to `data/.env` locally. Never commit credentials, generated logs, dumps, temporary files, or player data.
