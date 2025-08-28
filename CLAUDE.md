# CLAUDE.md

本文件为Claude Code (claude.ai/code) 提供在此中文MUD代码库中工作的指导。

## 项目概述
这是一个中文MUD（多人文字游戏）项目，名为"炎黄群侠传"。基于[mudcore](https://github.com/mudcore/mudcore) 框架开发，使用FluffOS作为游戏驱动。

## 技术栈
- **驱动**: FluffOS v2019+ (源码在 `/fluffos` 目录)
- **框架**: mudcore v1.6+ (作为git子模块集成在 `/mudcore`)
- **语言**: LPC (LPC编程语言)
- **编码**: UTF-8 (端口6666)、GBK (端口5566)、WebSocket (端口8000)

## 快速开始

### 初始设置
```bash
# 克隆项目（包含子模块）
git clone --recurse-submodules https://github.com/oiuv/mud.git
cd mud

# 如果已克隆，更新子模块
git submodule update --init
```

### 构建驱动
**Windows (MSYS2)**:
```bash
./build_msys2.sh
```

**Linux**:
```bash
./build.sh
```

### 运行MUD
```bash
# Windows
run.bat

# Linux/Unix
driver config.ini

# 调试模式
driver config.ini -d
```

**端口说明**:
- **6666**: UTF-8 telnet
- **5566**: GBK telnet
- **8000**: WebSocket (网页客户端)

## LPC核心语法（避免C语言陷阱）

### ⚠️ 强制规则（编译器硬性要求）

#### 1. 变量声明规则（C89标准）
```lpc
// ❌ 绝对禁止：变量声明在语句之后
int wrong_example() {
    int a = 10;
    write("处理中...");  // 语句
    int b = 20;        // 编译失败
}

// ✅ 正确：所有变量必须在函数开头声明
int correct_example() {
    int a = 10;
    int b = 20;
    write("处理中...");
    return a + b;
}
```

#### 2. 基本类型映射
| C语言 | LPC语言 | 示例 |
|-------|----------|------|
| `int` | `int` | 64位有符号整型 |
| `float` | `float` | 双精度浮点 |
| `char*` | `string` | 内置字符串类型 |
| `struct` | `class` | 数据封装类 |
| `void*` | `mixed` | 任意类型 |
| 数组 | `int *arr` | `int *arr = allocate(10)` |

#### 3. 数组和映射语法
```lpc
// 数组
int *arr = ({1, 2, 3});                    // 正确
string *names = ({"张三", "李四"});         // 正确

// 映射
mapping data = (["name":"张三", "age":25]); // 正确
mapping empty = ([]);                      // 空映射

// 数组操作
arr = arr + ({4, 5});    // 合并
arr = arr - ({2});       // 删除元素
```

#### 4. LPC特有的class系统
```lpc
// ✅ 正确的class定义
class person {
    string name;
    int age;
    mapping skills;
    string *hobbies;
}

// ✅ 类实例化
class person p = new(class person);
p->name = "张三";
p->age = 25;

// ✅ 创建时直接赋值（推荐）
class person p2 = new(class person,
    name: "李四",
    age: 30,
    skills: (["剑法":85]),
    hobbies: ({"书法"})
);

// ✅ 成员访问两种操作符：-> 和 .（均可读写）
write(sprintf("姓名: %s\n", p->name));  // -> 操作符
write(sprintf("年龄: %d\n", p.age));    // . 操作符

// ❌ 不存在的特性：LPC不支持class继承
// class student extends person {}  // 错误

// ✅ 正确的做法：使用组合而非继承
class student {
    class person info;               // 组合person对象
    string school;
    int grade;
}
```

#### 5. 函数参数和可变参数
```lpc
// 函数原型（必须在文件开头声明）
int add_numbers(int a, int b);
int calculate_damage(object attacker, object defender);

// 可变参数 - 两种语法
void log_info(string tag, mixed *args...) {
    printf("[%s] ", tag);
    foreach (mixed arg in args) {
        printf("%O ", arg);
    }
    printf("\n");
}

// 传统varargs语法
varargs void debug_log(string msg, mixed arg1, mixed arg2) {
    printf("DEBUG: %s", msg);
    if (!undefinedp(arg1)) printf(" %O", arg1);
    if (!undefinedp(arg2)) printf(" %O", arg2);
    printf("\n");
}
```

#### 6. LPC vs C语言关键字对照

**C语言支持，LPC不支持**:
- `char`, `short`, `long`, `double`, `unsigned`, `signed`
- `struct`, `typedef`, `union`, `enum`
- `const`, `volatile`, `static`, `register`, `extern`
- `malloc`, `free`, `sizeof`, `goto`

**LPC特有**:
- `string`, `object`, `mixed`, `mapping`, `buffer`, `function`
- `class`, `inherit`, `varargs`, `foreach`, `in`
- `public`, `protected`, `private`, `nosave`
- `this_object()`, `this_player()`, `new()`, `clone_object()`

## 代码风格规范

为了避免歧义，文档大量使用了「能愿动词」，对应的解释如下：

- 必须 (MUST)：绝对，严格遵循，请照做，无条件遵守；
- 一定不可 (MUST NOT)：禁令，严令禁止；
- 应该 (SHOULD) ：强烈建议这样做，但是不强求；
- 不该 (SHOULD NOT)：强烈不建议这样做，但是不强求；
- 可以 (MAY) 和 可选 (OPTIONAL) ：选择性高一点，在这个文档内，此词语使用较少；

      The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
      NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
      "OPTIONAL" in this document are to be interpreted as described in
      [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### 命名约定

* 文件名 **应该** 使用大写开头的驼峰式命名（和JAVA类似，LPC文件名也是类名，所以建议按类名规范命名，但LPC中类的存在感很弱，只有在`Room::setup()`这样的地方用到类名，所以此命名约定为建议而不是强求）；
* 常量所有字母都  **必须** 大写，单词间用下划线分隔；
* 业务级函数（开发者自主实现的业务逻辑方法）名称 **必须** 符合 camelCase 式的小写开头驼峰命名规范，系统级函数（包括 efun、apply、核心框架函数）保持under_score命名风格；
* 变量命名 **必须** 遵循以下规范，按作用域区分风格：
  * **局部变量**（方法内部临时使用）：**必须** 使用 camelCase 小写开头驼峰命名，禁止使用单字母命名（短循环变量如 `i`、`j` 可例外）。
    示例：`tempData`、`loopCount`、`userInput`
  * **全局变量**（跨类/跨模块共享）：**必须** 使用“模块前缀（首字母大写）+ PascalCase”命名，通过首字母大写与局部/成员变量形成视觉区分，前缀明确归属模块。
    示例：`SocketConnections`（Socket模块的全局连接集合）、`DnsCache`（DNS模块的全局缓存）、`HttpConfig`（HTTP模块的全局配置）
  * 变量命名 **必须** 体现具体含义，避免模糊名称（如禁用 `data`、`info`，应使用 `recvData`、`userInfo`）。

### LPC编码风格规范

* 所有 LPC 文件 **必须** 以 `不带 BOM 的 UTF-8` 编码；
* 所有 LPC 文件 **必须** 使用 Unix LF (linefeed) 作为行的结束符;
* 所有 LPC 文件 **必须** 以一个空白行作为结束;
* 代码 **必须** 使用 4 个空格符而不是「Tab 键」进行缩进。
* 非空行后 **一定不可** 有多余的空格符。
* 空行 **可以** 使得阅读代码更加方便以及有助于代码的分块。
* 每行 **一定不可** 存在多于一条语句。
* 每行的字符数 **应该** 软性保持在 80 个之内，理论上 **不该** 多于 120 个，但 **一定不可** 有硬性限制。
* 方法的开始花括号（{） **必须** 写在函数声明后自成一行，结束花括号（}）也 **必须** 写在函数主体后自成一行。
* 匿名函数的开始花括号 **必须** 写在声明的同一行，结束花括号 **必须** 紧跟主体结束的下一行。
* 方法参数列表中，每个逗号后面 **必须** 要有一个空格，而逗号前面 **一定不可** 有空格。
* 参数列表 **可以** 分列成多行，这样，包括第一个参数在内的每个参数都 **必须** 单独成行。
* 拆分成多行的参数列表后，结束括号以及方法开始花括号 **必须** 写在同一行，中间用一个空格分隔。
* 全局变量和方法 **必须** 添加访问修饰符（`private`、`protected` 以及 `public`），`nosave` 以及 `nomask` **必须** 声明在访问修饰符之前，而 `varargs` **必须** 声明在访问修饰符之后。
* **不该** 使用下划线作为前缀，来区分属性或方法是 `protected` 或 `private`。
* 控制结构的关键字后 **必须** 要有一个空格符，而调用方法或函数时则 **一定不可** 有。
* 控制结构的开始左括号后和结束右括号前，都 **一定不可** 有空格符。
* 控制结构的开始花括号（{） **必须** 写在声明后自成一行，结束花括号（}）也 **必须** 写在主体后自成一行。
* 结构体主体 **必须** 要有一次缩进。


## 目录结构

### 核心目录
```
├── adm/                    # 管理文件
├── cmds/                   # 命令实现
├── clone/                  # 可克隆对象
├── d/                      # 游戏世界区域
├── mudcore/                # mudcore框架
├── include/                # 头文件
├── inherit/                # 对象类型继承
└── std/                    # 标准对象模板
```

### 关键配置文件
- `config.cfg`: 驱动主要配置
- `include/globals.h`: 全局定义和宏
- `adm/etc/config`: 游戏配置
- `data/.env`: 数据库环境变量

## 开发工作流程

### 添加新房间
```lpc
// /d/beijing/new_room.c
#include <room.h>

inherit ROOM;

void create() {
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

void create() {
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

void create() {
    set_name("测试物品", ({ "test item", "item" }));
    set("long", "这是一个测试用的物品。");
    set_weight(100);
    setup();
}
```

## 测试与调试

### 游戏内测试命令
```bash
eval <代码>      # 直接执行LPC代码 (仅限管理员)
```

### 系统测试
对于复杂系统测试，推荐创建专门的测试命令存放到 `/cmds/test/` 目录，然后在游戏中使用对应指令运行测试。例如：

```bash
# 运行socket测试
socktest client
socktest server
socktest udpclient
socktest udpserver
socktest info

# 运行HTTP测试
httptest get https://httpbin.org/json
httptest post https://httpbin.org/post
httptest json

# 运行类系统测试
classtest basic
classtest inherit
classtest nested
```

### 调试模式
```bash
# 启用调试模式
driver config.ini -d

# 查看日志
/log/debug.log   # 详细调试信息
/log/error.log   # 错误跟踪
```

## 头文件引用

### 自动包含
- `globals.h` - 全局定义和宏（自动包含）
- `ansi.h` - ANSI颜色代码
- `mudcore.h` - mudcore框架定义

### 功能头文件
```lpc
#include <room.h>      // 房间系统
#include <command.h>   // 命令处理
#include <combat.h>    // 战斗系统
#include <armor.h>     // 防具系统
#include <weapon.h>    // 武器系统
#include <skill.h>     // 技能系统
#include <socket.h>    // 网络编程
#include <mysql.h>     // 数据库操作
```

## 常见编译错误

1. **变量声明位置错误** - 必须放在函数开头
2. **数组声明语法错误** - 使用 `allocate()` 或 `({...})`
3. **类继承语法错误** - LPC不支持类继承，使用组合模式
4. **结构体语法错误** - 使用 `class` 而非 `struct`
5. **指针语法错误** - LPC无指针概念，使用对象引用
