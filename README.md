# 炎黄群侠传 MUD

炎黄群侠传是一款 UTF-8 中文武侠文字游戏，基于炎黄 2003，融合多款侠客行类 MUD 的玩法。玩家可以在文字构成的江湖中拜师习武、行走山川、完成任务，与其他侠客共同闯荡江湖。

- [在线体验](https://mud.ren:8888/)
- [游戏交流与答疑](https://bbs.mud.ren/nodes/6)
- [游戏帮助](help/) · [更新说明](help/changelog)（游戏内输入 `help changelog`）

![游戏画面](mud.png)

## 游戏特色

- **武侠江湖**：多门派武学、内功与绝招，配合不同兵器、装备和成长路线。
- **任务与探索**：新手引导、师门任务、江湖历练、世界地图及各地支线，提供长期游玩的目标。
- **心魔幻境**：可持续探索的山川与遗迹，地图道路保持稳定；每位玩家独立遭遇心魔、拾取物品，可通过传送门返回江湖。
- **智能 NPC 与场景描写**：可选 AI 服务支持 NPC 对话与游戏答疑，并为幻境补充景物描写；未启用场景创作时仍可正常探索。
- **多端游玩**：支持 Telnet 客户端和浏览器，网页端适配中文输入与手机屏幕；也可使用 Mudlet 连接。

![游戏帮助](help.png)

## 启动前准备

游戏驱动要求 **FluffOS v2026.0712.3 或更新版本**，支持 Linux 和 Windows，也可通过 Docker 运行。AI 服务为可选组件，不是启动游戏的前提。

### 下载游戏

游戏包含必需的 mudcore 子模块，请一并下载：

```sh
git clone --recurse-submodules https://github.com/oiuv/mud.git
cd mud
```

也可使用 [Gitee 镜像](https://gitee.com/mudren/mud)。已有仓库若尚未下载子模块，在项目根目录执行：

```sh
git submodule update --init
```

### 配置游戏

首次启动前，将 `data/.env.example` 复制为 `data/.env`，按需填写本地配置；已有配置请直接编辑，不要覆盖。游戏和 AI 服务使用不同的配置文件。

| 运行方式 | 驱动配置 | 默认连接地址 |
| --- | --- | --- |
| Linux | `config.ini` | Telnet：5566（GBK）、6666（UTF-8）；网页：http://localhost:8888/ |
| Windows | `config.cfg` | Telnet：6666（UTF-8）；网页：http://localhost:8000/ |
| Docker | `docker.config.cfg` | Telnet：5566（GBK）、6666（UTF-8）；网页：http://localhost:8080/ |

远程连接时，将 `localhost` 换为服务器地址，并放行实际使用的端口。网页客户端选择相应地址、端口及 WS/WSS 连接方式；WSS 需要服务器配置 TLS。

## 启动游戏服务

以下命令均从项目根目录执行。更新正在使用的驱动前，请先停止游戏服务。

### Linux

Debian/Ubuntu 安装 Bash、Git 后执行：

```sh
bash build.sh
bash run.sh
```

构建脚本安装所需依赖、更新 FluffOS 官方源码，默认生成 `fluffos/build/bin/driver`；安装软件包时按需使用 sudo，不要用 sudo 运行整个脚本。`run.sh` 使用 `config.ini` 在前台运行游戏。

其他 Linux 发行版需自行准备依赖，再使用 `bash build.sh --local`。构建选项见 `bash build.sh --help`。

### Windows

安装 MSYS2，在 **MinGW64 终端**中编译驱动：

```sh
bash build_msys2.sh
```

默认产物复制到项目 `bin/`。注意：此脚本默认会恢复 `fluffos/` 中已跟踪文件的本地修改后更新官方源码；如需保留修改，先备份，或在依赖已齐备时使用 `--local` 跳过更新。更多选项见 `bash build_msys2.sh --help`。

随后在 PowerShell 或 CMD 中管理游戏：

```powershell
.\run.bat
.\run.bat status
.\run.bat stop
```

`run.bat` 使用 `bin/driver.exe` 和 `config.cfg`，后台启动前检查重复进程及端口占用。日志位于 `log/debug.log`；更多命令见 `.\run.bat help`。

`stop` 和 `restart` 会直接结束驱动进程；正式服请先在游戏内完成保存及关服操作。

### Docker

启动 Docker 引擎后，在 Linux Bash 或 Windows MSYS2 Bash 中执行：

```sh
bash docker.build.sh
bash docker.run.sh start
bash docker.run.sh status
bash docker.run.sh logs
bash docker.run.sh stop
```

构建脚本默认恢复并更新 FluffOS 官方源码；已有本地仓库时，`bash docker.build.sh --local` 使用该仓库已提交的版本，不包含未提交修改。

游戏目录挂载到容器内，首次启动会补齐缺失的 `data/.env`，日志保存在本机 `log/`。更新镜像后执行 `bash docker.run.sh restart`。修改映射端口等选项见 `bash docker.run.sh help`。

## 启动 AI 服务（可选）

需要 **Python 3.10+** 和可用的模型服务。游戏与 AI 服务分别启动；首次准备环境会下载 Python 依赖。

Linux 还需安装 venv 和 util-linux，在项目根目录执行：

```sh
bash ai/run.sh setup
# 编辑 ai/.env，填写模型连接配置后启动
bash ai/run.sh start
bash ai/run.sh status
bash ai/run.sh logs
bash ai/run.sh stop
```

Windows 使用：

```powershell
.\ai\run.bat setup
notepad .\ai\.env
.\ai\run.bat start
.\ai\run.bat status
.\ai\run.bat logs
.\ai\run.bat stop
```

`setup` 会创建虚拟环境并补齐配置模板，不覆盖已有配置：

- `ai/.env`：聊天模型使用 `OPENAI_API_KEY`、`OPENAI_BASE_URL` 和 `OPENAI_MODEL`；可选向量检索与重排另用 `DASHSCOPE_API_KEY`，未配置时使用本地检索。
- `ai/config/npc_roles.json`：配置 NPC 的身份与对话风格。
- 修改配置后，使用对应脚本的 `restart` 命令重启 AI 服务。日志位于 `ai/logs/ai.log`。

启动时会更新知识库；配置向量服务后，补充文档向量会消耗模型额度。未配置聊天密钥时只能使用离线演示回复，不能获得真实智能问答。

Docker 游戏容器不包含 AI 服务，需单独启动，并将游戏的 `AI_SERVER_HOST` 配置为能访问 AI 服务的地址；容器内的 `127.0.0.1` 不是宿主机。详细连接配置见 [AI 服务启动说明](ai/README.md#启动)。

## 开始游玩

连接后按提示创建角色。初入江湖可先输入 `help newbie` 和 `help tutorial` 查看新手指引，用 `map view` 察看附近地图。

启用 AI 服务后，可在扬州客店向周不通提问，例如 `talk butong about 如何拜师`。想探索心魔幻境，可到武庙二楼输入 `ask zixu about 心魔幻境`，详情见 `help huanjing`。

最新玩法与调整均可在游戏中输入 `help changelog` 查阅。
