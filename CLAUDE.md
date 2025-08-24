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

## LPC核心语法速查

### ⚠️ 关键差异（避免C语言习惯导致的错误）

#### 1. LPC函数声明规则（与C89标准完全一致）

**LPC变量声明规则与C89标准完全一致：**
- **所有变量声明必须在函数体的最开头** - 任何语句之前
- **变量声明后才可以有语句** - 严禁在语句之后声明变量
- **同一作用域不可重复声明变量名**
- **函数声明必须在文件开头声明** - 在使用前必须声明

**注意：LPC完全遵循C89的变量声明规则，这是强制要求，不是可选的。**

**LPC函数声明标准格式：**
```lpc
// ✅ 正确：函数原型声明（文件开头）
int calculate_damage(object attacker, object defender);

// ✅ 正确：函数定义 - 所有变量在最开头声明
int calculate_damage(object attacker, object defender) {
    int damage, base_damage, modifier;
    string *skills;
    object weapon;
    
    // 所有变量声明完毕，开始语句
    base_damage = attacker->query("str") * 2;
    modifier = random(10) + 1;
    damage = base_damage + modifier;
    
    return damage;
}

// ❌ 绝对禁止：变量声明在语句之后
int wrong_example() {
    int a = 10;
    write("处理中...");  // 这是语句
    int b = 20;        // 错误：变量声明在语句之后 - 编译失败
    return a + b;
}
```

#### 2. 数据类型差异
```lpc
// 基本类型
int        // 64位有符号整型
float      // 双精度浮点
string     // 字符串，支持 str[n]、str[n..m] 索引
object     // 对象类型，所有.c文件都是对象
mixed      // 任意类型，运行时检查
mapping    // 关联数组 ([key:value, key2:value2])
buffer     // 二进制缓冲区
function   // 函数指针
```

#### 3. 数组和映射语法
```lpc
// 数组
int *arr = ({1, 2, 3});           // 正确
string *names = ({"张三", "李四"}); // 正确

// 映射
mapping data = (["name":"张三", "age":25]); // 正确
mapping empty = ([]);                        // 空映射

// 数组操作
arr = arr + ({4, 5});    // 合并
arr = arr - ({2});       // 删除元素
```

#### 4. 函数声明和修饰符
```lpc
// 函数原型（必须在文件开头声明）
int add_numbers(int a, int b);

// 函数定义
int add_numbers(int a, int b) {
    return a + b;
}

// 访问修饰符
public int public_func() {}      // 默认
protected int protected_func() {} // 继承类可访问
private int private_func() {}     // 仅本类可访问
```

#### 5. 特殊语法
```lpc
// foreach循环（LPC特有）
foreach (string name in names) {
    write(name + "\n");
}

// switch支持字符串和范围
switch (str) {
    case "hello":
        break;
    case 1..10:
        break;
}

// 函数指针（闭包语法）
function f = (: add_numbers, 10, 20 :);
int result = evaluate(f);  // 或使用 (*f)()

// 匿名函数
function square = function(int x) { return x * x; };

// 函数参数默认值（FluffOS 2023.12+）
void greet(string name : (: "世界" :), int times : (: 1 :)) {
    for (int i = 0; i < times; i++) {
        printf("你好，%s！\n", name);
    }
}

// 可变参数（不定参数）- 两种语法

// 方法1：使用 ...（推荐）
void log_info(string tag, mixed *args...) {
    printf("[%s] ", tag);
    foreach (mixed arg in args) {
        printf("%O ", arg);
    }
    printf("\n");
}

// 方法2：使用 varargs（传统）
varargs void debug_log(string msg, mixed arg1, mixed arg2) {
    printf("DEBUG: %s", msg);
    if (!undefinedp(arg1)) printf(" %O", arg1);
    if (!undefinedp(arg2)) printf(" %O", arg2);
    printf("\n");
}

// 使用示例对比
log_info("系统", 1, 2, 3);                    // 输出：[系统] 1 2 3 
log_info("测试");                             // 输出：[测试] 
log_info("数据", "hello", ({1,2,3}), (["a":1])); // 输出：[数据] "hello" ({ 1, 2, 3 }) ([ "a" : 1 ])

debug_log("启动");                            // 输出：DEBUG: 启动
debug_log("错误", 500, "timeout");            // 输出：DEBUG: 错误 500 "timeout"

// 重要区别：
// ... 语法：不传参数时得到空数组 ()
// varargs：不传参数时参数为 undefined/null
```

#### 6. 预处理器指令
```lpc
#define MAX_PLAYERS 100
#include <ansi.h>

#ifdef DEBUG
    debug_message("调试信息");
#endif
```

#### 7. 继承系统
```lpc
inherit "/std/room";           // 继承标准房间
inherit F_CLEAN_UP;            // 继承清理功能

// 调用父类方法
::create();                   // 调用父类的create方法
```

#### 8. 对象创建
```lpc
// 创建对象
object npc = new("/clone/npc/test");
object room = clone_object("/d/beijing/room1");

// 对象方法调用
npc->set_name("测试者");
npc->move(this_object());
```

#### 9. 字符串操作
```lpc
string str = "Hello World";
string sub1 = str[0..4];      // "Hello"
string sub2 = str[<5..];      // "World"
string sub3 = str[6..];       // "World"

// 字符串连接
string full = "Hello" + " " + "World";
```

#### 10. 常见错误避免
```lpc
// ❌ 错误：变量声明不在开头
int func() {
    int a = 10;
    write("处理中...");  // 这是语句，不是声明
    int b = 20;  // 错误：变量声明必须在开头
    return a + b;
}

// ✅ 正确
int func() {
    int a = 10;
    int b = 20;
    write("处理中...");
    return a + b;
}

// ❌ 错误：C风格的数组声明
int arr[10];     // 错误

// ✅ 正确
int *arr = allocate(10);
int *arr2 = ({1, 2, 3, 4, 5});

// ❌ 错误：重复声明
int func() {
    int x = 10;
    // ...其他代码...
    int x = 20;  // 错误：同一作用域重复声明
}

// ❌ 错误：错误的映射语法
mapping data = {"name":"张三"};  // 错误：使用了{}而非[]

// ✅ 正确
mapping data = (["name":"张三"]);
```

### 调试技巧
- 使用 `debug_message("调试信息")` 输出调试信息
- `write()` 函数向当前用户输出
- `printf()` 格式化输出
- `sprintf()` 格式化字符串

### 重要文件引用
```lpc
// 注意：globals.h 由系统自动全局包含，无需显式引用
#include <ansi.h>      // ANSI颜色代码
#include <room.h>      // 房间定义
#include <command.h>   // 命令相关
#include <socket.h>    // 网络编程
```

### 头文件目录
- **项目头文件**: `/include/` - 项目特定定义
- **框架头文件**: `/mudcore/include/` - mudcore框架定义

### 常用头文件
**基础头文件** (自动包含):
- `globals.h` - 全局定义和宏
- `ansi.h` - ANSI颜色代码
- `mudcore.h` - mudcore框架定义

**功能头文件**:
- `room.h` - 房间系统
- `command.h` - 命令处理
- `combat.h` - 战斗系统
- `armor.h` - 防具系统
- `weapon.h` - 武器系统
- `skill.h` - 技能系统
- `socket.h` - 网络编程
- `mysql.h` - 数据库操作
