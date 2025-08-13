# CLAUDE.md

本文件为Claude Code (claude.ai/code) 提供在此中文MUD代码库中工作的指导。

## 项目概述
这是一个中文MUD（多人文字游戏）项目，名为"炎黄群侠传"。基于[mudcore](https://github.com/mudcore/mudcore) 框架开发，使用FluffOS作为游戏驱动。这是一个现代UTF-8编码的经典武侠题材MUD游戏。

## 核心架构

### 技术栈
- **驱动**: FluffOS v2019+ (源码在 `/fluffos` 目录)
- **框架**: mudcore v1.6+ (作为git子模块集成在 `/mudcore`)
- **语言**: LPC (LPC编程语言)
- **编码**: UTF-8 (端口6666)、GBK (端口5566)、WebSocket (端口8000)

### 目录结构
```
├── adm/                    # 管理文件
│   ├── daemons/           # 系统守护进程 (战斗、聊天、经济等)
│   ├── etc/               # 配置文件 (欢迎信息、封禁列表等)
│   ├── npc/               # 特殊NPC定义
│   └── single/            # 核心系统对象 (master.c, simul_efun.c)
├── b/                     # 特殊区域 (船只位置、任务)
├── bin/                   # 空目录 (编译后二进制)
├── binaries/              # 空目录 (驱动二进制)
├── clone/                 # 可克隆对象
│   ├── beast/            # 动物NPC
│   ├── board/            # 公告板
│   ├── book/             # 技能书和秘籍
│   ├── cloth/            # 服装和防具
│   ├── weapon/           # 武器
│   ├── npc/              # 标准NPC
│   ├── shop/             # 商店NPC和物品
│   └── 各种物品/          # 物品、草药、鱼等
├── cmds/                  # 命令实现
│   ├── adm/              # 管理员命令
│   ├── arch/             # 建筑师命令
│   ├── chat/             # 聊天命令
│   ├── imm/              # 神仙命令
│   ├── skill/            # 技能相关命令
│   ├── std/              # 标准玩家命令
│   ├── test/             # 测试命令
│   ├── usr/              # 用户工具
│   └── wiz/              # 巫师命令
├── d/                     # 游戏世界区域
│   ├── baituo/           # 白驼山区域
│   ├── beijing/          # 北京城区域
│   ├── changan/          # 长安城区域
│   └── chengdu/          # 成都城区域
├── data/                  # 运行时数据文件 (.o文件)
├── feature/               # 核心功能实现
├── fluffos/               # FluffOS驱动源码
├── help/                  # 帮助文档
├── include/               # 头文件 (globals.h等)
├── inherit/               # 对象类型继承
├── kungfu/                # 武功系统
├── log/                   # 日志文件
├── mudcore/               # mudcore框架 (git子模块)
├── shadow/                # 影子对象实现
├── std/                   # 标准对象模板
├── temp/                  # 临时文件
├── www/                   # Web界面文件
└── 各种工具/              # 构建脚本、工具
```

## 构建与运行命令

### 初始设置
```bash
# 克隆项目（包含子模块）
git clone --recurse-submodules https://github.com/oiuv/mud.git
cd mud

# 如果已克隆，更新子模块
git submodule update --init
```

### 构建驱动（MSYS2/Windows）
```bash
# 构建FluffOS驱动
./build_msys2.sh

# 执行内容：
# 1. 安装MSYS2依赖
# 2. 从gitee.com/fluffos/fluffos克隆/构建FluffOS
# 3. 编译SQLite支持
# 4. 复制driver.exe到项目根目录
```

### 构建驱动（Linux）
```bash
# 构建FluffOS驱动
./build.sh

# 执行内容：
# 1. 安装apt依赖
# 2. 从gitee.com/fluffos/fluffos克隆/构建FluffOS
# 3. 编译SQLite支持
# 4. 安装驱动到/usr/local/games/
```

### 运行MUD
```bash
# Windows
run.bat

# Linux/Unix
driver config.ini

# 调试模式
driver config.ini -fdebug
driver config.ini -d
```

### 端口说明
- **6666**: UTF-8 telnet
- **5566**: GBK telnet
- **8000**: WebSocket (网页客户端)

## 开发工作流程

### 添加新区域
1. 在 `/d/[区域名]/` 创建区域目录
2. 定义房间，继承 `/inherit/room/room.c`
3. 在 `/clone/npc/` 或区域特定目录添加NPC
4. 在 `/clone/` 子目录添加物品/对象
5. 根据需要更新 `/help/` 中的帮助文档

### 添加新命令
1. 在适当的 `/cmds/` 子目录创建命令文件
2. 实现 `main(object me, string arg)` 函数
3. 实现 `help(object me)` 函数用于文档
4. 通过文件系统权限确保适当权限

### 添加新技能
1. 在 `/kungfu/skill/[技能名].c` 定义技能
2. 继承适当的技能基类
3. 在 `/clone/book/` 添加技能书
4. 更新帮助文档

### 数据库集成
- 通过mudcore的DB系统使用SQLite
- 配置在 `/data/.env`
- 通过 `/feature/dbase.c` 和 `/adm/daemons/dbased.c` 进行数据库操作

## 关键配置文件

- **`config.cfg`**: 驱动的主要运行时配置
- **`include/globals.h`**: 全局定义和宏
- **`adm/etc/config`**: 游戏配置设置
- **`adm/etc/motd`**: 每日消息
- **`data/.env`**: 数据库/API的环境变量

## 游戏系统

### 战斗系统
- 位于 `/adm/daemons/combatd.c`
- 技能在 `/kungfu/skill/` 目录
- 武器/防具在 `/clone/weapon/` 和 `/clone/cloth/`

### 经济系统
- 货币: `/clone/money/` (铜钱、银子、黄金、现金)
- 商店: `/clone/shop/` 和 `/inherit/room/shop.c`
- 银行: `/inherit/room/bank.c`

### 任务系统
- 任务守护进程: `/adm/daemons/questd.c`
- 任务定义: `/clone/quest/` 和 `/adm/daemons/quest/`
- 任务类型: 送信、探索、捕捉等

### NPC系统
- 标准NPC: `/inherit/char/npc.c`
- 特殊NPC: `/adm/npc/` (剧情角色)
- 通用NPC: `/clone/npc/` (杀手、宠物、训练师)

### 帮助系统
- 命令帮助: `/help/cmds/`
- 技能帮助: `/help/skills/`
- 区域地图: `/help/map_*`
- 通用帮助: `/help/` 根目录

## 测试与调试

### 测试命令
```bash
# 游戏内测试命令
test <函数名>    # 测试各种系统函数
eval <代码>      # 直接执行LPC代码 (仅限管理员)
```

### 调试模式
- 使用 `driver config.ini -d` 启用调试模式
- 查看 `/log/debug.log` 获取详细日志
- 使用 `/log/error.log` 跟踪错误

### 性能分析
- 启用命令分析: 在globals.h中取消 `#define PROFILE_COMMANDS` 注释
- 查看 `/adm/daemons/profiled.c` 进行性能监控

## 常见开发任务

### 添加新房间
```lpc
// /d/beijing/new_room.c
#include <room.h>

inherit ROOM;

void create()
{
    set("short", "新房间");
    set("long", "这是一个新建的房间，用于测试。");
    set("exits", ([
        "north" : __DIR__"room2",
        "south" : __DIR__"room1",
    ]));
    setup();
}
```

### 添加新NPC
```lpc
// /clone/npc/test_npc.c
#include <ansi.h>
#include <command.h>

inherit NPC;

void create()
{
    set_name("测试者", ({ "test npc", "test" }));
    set("long", "这是一个测试用的NPC。");
    set("combat_exp", 1000);
    set("str", 20);
    set_skill("unarmed", 50);
    setup();
}
```

### 添加新物品
```lpc
// /clone/misc/test_item.c
#include <ansi.h>
#include <item.h>

inherit ITEM;

void create()
{
    set_name("测试物品", ({ "test item", "item" }));
    set("long", "这是一个测试用的物品。");
    set_weight(100);
    setup();
}
```

## 安全说明
- 管理员账号: `mudren` (预配置)
- 安全守护进程: `/adm/daemons/securityd.c`
- 基于文件路径和用户级别的权限系统
- `/cmds/wiz/` 中的巫师命令需要适当权限

## 外部集成
- **HTTP**: 通过mudcore HTTP客户端 `/inherit/Http.c`
- **MySQL**: 通过 `/adm/daemons/mysqld.c`
- **短信**: 通过 `/adm/daemons/sms_d.c`
- **QQ集成**: 通过 `/adm/daemons/qq_d.c`

## 备份与维护
- 通过 `/adm/daemons/backupd.c` 自动备份
- 备份目录: `/backup/`
- 玩家数据在 `/data/` 目录 (*.o文件)
- 系统日志在 `/log/` 目录
