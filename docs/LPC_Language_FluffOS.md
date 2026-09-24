# FluffOS LPC 语言语法指南

> 当前 MUDLIB 最低支持 **FluffOS v2026.0712.3**。本文也记载后续驱动新增语法；最低运行版本不代表支持本文全部扩展。开发时须核对下述支持起点，使用更晚引入的功能前先明确提升项目驱动要求。

> 核对基线：FluffOS 源码提交 `2c27287500daf48a87a1f89d69a97d8b9603028d`（2026-09-16），核对日期为 2026-09-18。
> 本文按最新已核对的 FluffOS 源码描述 LPC 语法、核心运行时语义和常用 efun；涉及可选功能时注明编译开关或功能包。
> 关键新增与行为修正的支持起点见[关键更新的支持版本](#关键更新的支持版本)，按引入提交及日期标注。
> 若本文与更新后的驱动冲突，以 `grammar.y`、语义规则实现、词法器与编译选项、`packages/<包名>/<包名>.spec` 和 `testsuite/` 为准，并同步修订本文。核对依据见文末附录。

---

## 目录

1. [概述](#1-概述)
2. [源文件与对象系统](#2-源文件与对象系统)
3. [类型系统](#3-类型系统)
4. [变量与声明](#4-变量与声明)
5. [字面量](#5-字面量)
6. [运算符](#6-运算符)
7. [控制流](#7-控制流)
8. [函数](#8-函数)
9. [一等函数与 Lambda](#9-一等函数与-lambda)
10. [面向对象：继承与 class](#10-面向对象继承与-class)
11. [数组](#11-数组)
12. [Mapping（关联数组）](#12-mapping关联数组)
13. [字符串高级操作](#13-字符串高级操作)
14. [Buffer（二进制缓冲区）](#14-buffer二进制缓冲区)
15. [索引与切片](#15-索引与切片)
16. [预处理器](#16-预处理器)
17. [特殊内置形式](#17-特殊内置形式)
18. [内置函数（Efun）分类速查](#18-内置函数efun分类速查)
19. [编码风格建议](#19-编码风格建议)
20. [异步函数与 Promise](#20-异步函数与-promise)

---

## 1. 概述

LPC（Lars Pensjö C）是专为 MUD（多人在线文字冒险游戏）设计的脚本语言。FluffOS 是一个高性能 LPC 驱动程序，它实现了 LPC 编译器、字节码虚拟机、网络服务器和可插拔功能包。

LPC 的核心特点：
- **动态类型**，支持可选的编译时严格类型检查
- **面向对象**：基于文件的继承机制
- **函数式**：函数是一等公民，支持 Lambda、函数指针、闭包
- **UTF-8 原生**：字符串内部以 UTF-8 存储，按扩展字形簇计量长度
- **类 C 语法**：if/for/while/switch 等控制结构与 C 语言相似

---

## 2. 源文件与对象系统

### 2.1 文件扩展名

LPC 源文件使用 `.lpc`（推荐）或 `.c`（传统兼容）扩展名。

**解析规则：**
- 带扩展名的路径精确匹配：`load_object("/foo.c")` 只找 `foo.c`
- 无扩展名的路径优先查找 `.lpc`，再回退到 `.c`
- 对象名永远不带扩展名：`file_name(ob)` 返回 `/std/room`，而非 `/std/room.lpc`

```c
// 加载对象 — 不要手动加扩展名
object ob = load_object("/std/room");
```

### 2.2 对象生命周期

LPC 中每个源文件编译为一个"程序"（program），可以被：
- **直接加载**为单例对象
- **克隆**（`clone_object` / `new`）为多个独立实例
- **继承**（`inherit`）到其他对象中

对象不会因为 LPC 引用计数归零就自动销毁。驱动会周期性地向长期未活动的对象调用 `clean_up(int inherited_ref)`；是否执行 `destruct()` 由对象自己决定。也可以显式调用 `destruct(ob)` 销毁对象。

### 2.3 `__INIT` 函数

`__INIT` 是编译器为全局变量初始化自动生成的隐藏函数，驱动在 `create()` 之前调用它。Mudlib 不应自行定义或直接调用 `__INIT()`；需要自定义初始化逻辑时实现 `create()`。

---

## 3. 类型系统

### 3.1 基本类型

| 类型 | 说明 | 值/引用 |
|------|------|---------|
| `int` | 整数（64位） | 值类型 |
| `float` | 浮点数（C `double`，约15位有效数字） | 值类型 |
| `string` | UTF-8 字符串（不可变值语义） | 值类型 |
| `object` | 对象指针 | 引用类型 |
| `mapping` | 关联数组（哈希表） | 引用类型 |
| `function` | 函数指针 | 引用类型 |
| `promise` / `promise<T>` | 异步结果，详见第20节 | 引用类型 |
| `buffer` | 字节数组（每元素 0-255） | 引用类型 |
| `class` / `struct` | 具名字段结构 | 引用类型 |
| `mixed` | 任意类型（关闭类型检查） | — |
| `void` | 仅用于函数返回值，表示无返回 | — |

**值类型**（`int`、`string`、`float`）赋值和传参时复制值。
**引用类型**（`mapping`、`function`、`object`、`promise`、数组、`buffer`、`class`/`struct`）赋值和传参时共享引用。

```c
int a = 10;             // 值类型
string s = "hello";     // 值类型
mapping m = ([]);       // 引用类型
mapping m2 = m;         // m2 和 m 指向同一个 mapping
m2["key"] = "value";    // m["key"] 也会是 "value"
```

### 3.2 数组类型

数组通过在元素类型后加 `*` 声明：

```c
int *numbers;           // int 数组
string *names;          // string 数组
mixed *stuff;           // mixed 数组（可存放任意类型）
```

旧式 `int array nums` 写法依赖兼容选项 `ARRAY_RESERVED_WORD`（源码默认关闭）；本文统一使用 `int *nums` 写法。

### 3.3 Class 类型

```c
class Person {
    string name;
    int level;
    float *scores;
}

// struct 与 class 使用同一套语法和运行时表示，关键字是否启用取决于编译选项
struct Point {
    int x;
    int y;
}
```

详见 [第10节 面向对象](#10-面向对象继承与-class)。

### 3.4 类型修饰符

| 修饰符 | 作用 |
|--------|------|
| `private` | 函数不可从其他对象调用，继承者也不可访问 |
| `protected` | 禁止其他对象调用，供对象自身及继承关系内部使用 |
| `public` | 对外可见；即使通过私有继承引入也保持公开 |
| `nomask` | 禁止被继承覆盖或 `shadow()` |
| `nosave` | 全局变量不参与 `save_object()` / `restore_object()` |
| `varargs` | 函数可接受可变数量参数 |
| `async` | 异步函数；调用得到 Promise，函数体可使用 `await` / `acatch` |

修饰符可组合使用：

```c
nosave private int internalCounter;
public varargs mixed query(string key, mixed def) { ... }
```

启用编译选项 `SENSIBLE_MODIFIERS` 时，`static` 不是关键字，使用 `private` 或 `nosave` 明确表达意图；`virtual` 也不是 LPC 修饰符。`varargs` 和 `async` 只能修饰函数，不能用于 `private:` 这类全局修饰符标签。

### 3.5 类型转换

类型转换使用 C 风格的强制转换语法，但**不实际转换值**——仅用于满足编译器的类型检查。实际转换请用 `to_int()`、`to_float()` 等函数。

```c
int x = (int)some_float;        // 不做实际转换
string s = (string)some_value;  // 仅满足编译器
float f = to_float(x);          // 真正的类型转换
```

### 3.6 严格类型检查

强烈推荐在每个文件开头启用：

```c
#pragma strict_types
```

启用后：
- 函数必须声明返回类型
- 函数参数必须声明类型
- 调用和赋值会进行类型检查
- 使用 `mixed` 关闭特定位置的检查

---

## 4. 变量与声明

### 4.1 全局变量

在文件顶层声明，所有函数共享：

```c
#pragma strict_types

int hp;
string name;
mixed *inventory;
```

带初始化：

```c
int max_hp = 100;
string greeting = "Welcome!";
```

### 4.2 局部变量

在函数体内声明，可以出现在**任何位置**（C99 风格）：

```c
void example() {
    int x = 1;
    write("x = " + x + "\n");
    string msg = "hello";      // 在函数中间声明
    int a, b, c;               // 同一类型多个变量
    int *arr = ({ 1, 2, 3 });  // 带初始化
    write(msg + "\n");
}
```

局部变量的声明位置属于语言支持范围，是否集中在函数开头可由项目编码规范约定。

### 4.3 变量初始化

```c
int x;                   // 默认初始化为 0
int y = 42;              // 显式初始化
string s;                // 默认初始化为 0 (undefined)
string s2 = "hello";     // 显式初始化
mixed *arr;              // 默认初始化为 0
mixed *arr2 = ({ 1, 2 }); // 显式初始化
```

---

## 5. 字面量

### 5.1 整数字面量

```c
42                  // 十进制
0xFF                // 十六进制（0x 或 0X 前缀）
0777                // 十进制 777；LPC 没有 C 风格八进制整数字面量
0b1010              // 二进制（0b 或 0B 前缀）
1_000_000           // 下划线分隔符（可读性）
```

### 5.2 浮点字面量

```c
3.14                // 标准形式
1.                  // 等价于 1.0
2.5e6               // 科学记数法：2500000.0
2.5e-3              // 科学记数法：0.0025
1_000.25            // 带下划线分隔
```

### 5.3 字符串字面量

```c
"hello world"                   // 双引号字符串
"hello" " world"                // 相邻字符串编译时自动拼接
"line1\nline2"                  // 转义序列
"€ 3,50"                        // 直接写 UTF-8 字符
"\u20ac 3,50"                   // \uXXXX Unicode 转义（4位十六进制）
"\ud83d\ude00"                  // 代理对（surrogate pair）表示增补平面字符
"\U0001f600"                    // \UXXXXXXXX Unicode 转义（8位十六进制）
"\x41"                          // \x 十六进制转义：'A'
"\101"                          // 八进制转义：'A'
```

### 5.4 字符字面量

```c
'A'                 // 返回整数值 65
'\n'                // 换行符
'\x41'              // 十六进制
'\101'              // 八进制
```

字符字面量表示单个字节或转义后的整数，不支持 `\u` / `\U` Unicode 转义；Unicode 文本请使用字符串。

### 5.5 模板字面量（反引号）

使用反引号 `` ` `` 包裹，支持 `${expression}` 插值：

```c
string name = "Alice";
int count = 3;

`Hello, ${name}!`              // "Hello, Alice!"
`You have ${count} items.`     // "You have 3 items."
`Sum: ${1 + 2}`                // "Sum: 3"
```

**转义：**
```c
`price is \$100`               // 美元符号转义
`use \`backticks\``            // 反引号转义
```

**换行处理：** 模板字面量内的换行会被**折叠**（移除）：
```c
`line one
line two`
// 结果: "line oneline two"
```

模板字面量支持常见单字符、八进制和十六进制转义，但不解析 `\u` / `\U` Unicode 转义；需要时直接写 UTF-8 字符。

**相邻拼接：** 模板字面量可与普通字符串和其它模板字面量相邻拼接：
```c
`Hello, ${name}! ` `How are you?`
`Count: ${n}` " items"
"Hello, " `${name}!`
```

### 5.6 Heredoc 文本块

```c
// @ 产生单个字符串（每行带 \n）
string text = @END
这里可以写
多行文本内容
END;

// @@ 产生字符串数组（每行一个元素）
string *lines = @@END
第一行
第二行
第三行
END;
```

`@` 产生的字符串包含末尾换行；`@@` 产生的数组不包含换行。

### 5.7 复合字面量

```c
// 数组字面量
({ })                    // 空数组
({ 1, 2, 3 })            // int 数组
({ "a", "b", "c", })     // string 数组（支持尾逗号）

// Mapping 字面量
([])                              // 空 mapping
([ "key1": val1, "key2": val2, ]) // 带尾逗号
```

---

## 6. 运算符

### 6.1 算术运算符

| 运算符 | 说明 | 示例 |
|--------|------|------|
| `+` | 加法 / 字符串拼接 / 数组合并 / mapping 合并 | `a + b` |
| `-` | 减法 / 数组差集 | `a - b` |
| `*` | 乘法 / mapping 复合（数学意义） | `a * b` |
| `/` | 除法 | `a / b` |
| `%` | 取模 | `a % b` |

整数溢出行为：`-fwrapv` 编译选项使 `+`、`-`、`*`、一元 `-` 的溢出为**有定义的二进制补码回绕**（不是 UB），LPC 脚本可以依赖此行为。但 `INT_MIN / -1` 和 `INT_MIN % -1` 仍为未定义行为，驱动会报错。

位移操作的移位数会被截断到低 6 位（`& 63`），匹配 Java 的 `long` 移位语义。

### 6.2 比较运算符

| 运算符 | 说明 |
|--------|------|
| `==` | 相等（值类型比较值，引用类型比较指针） |
| `!=` | 不等 |
| `<` | 小于 |
| `<=` | 小于等于 |
| `>` | 大于 |
| `>=` | 大于等于 |

### 6.3 逻辑运算符

| 运算符 | 说明 | 短路 |
|--------|------|------|
| `&&` | 逻辑与 | 是 |
| `\|\|` | 逻辑或 | 是 |
| `!` | 逻辑非 | — |

### 6.4 位运算符

| 运算符 | 说明 |
|--------|------|
| `&` | 整数按位与 / 数组交集 |
| `\|` | 整数按位或 / 数组并集 |
| `^` | 按位异或 |
| `~` | 按位取反 |
| `<<` | 左移 |
| `>>` | 右移 |

```c
mixed *common = a & b;   // 数组交集
mixed *merged = a | b;   // 数组并集
```

### 6.5 赋值运算符

| 运算符 | 说明 |
|--------|------|
| `=` | 简单赋值 |
| `+=` `-=` `*=` `/=` `%=` | 算术复合赋值 |
| `&=` `\|=` `^=` | 位运算复合赋值 |
| `<<=` `>>=` | 移位复合赋值 |

### 6.6 逻辑赋值运算符（短路）

| 运算符 | 等价于 | 说明 |
|--------|--------|------|
| `\|\|=` | `x = x \|\| val` | falsy 时赋值 |
| `&&=` | `x = x && val` | truthy 时赋值 |
| `??=` | `x = x ?? val` | undefined 时赋值 |

### 6.7 自增 / 自减

```c
++x    --x    // 前置（先加后用）
x++    x--    // 后置（先用后加）
```

### 6.8 条件运算符

```c
// 三元运算符
int max = (a > b) ? a : b;

// 空值合并（??）
// 左侧为 undefined 时返回右侧（注意：0 和 "" 不是 undefined）
mixed val = some_mapping["key"] ?? "default";
```

### 6.9 可选链（仅 mapping）

```c
mapping m = 0;

// 传统写法会报错："Indexing on illegal type"
// 可选链安全返回 undefined（数值表现为 0）
mixed val = m?.key;         // 返回 undefined，不报错
mixed val2 = m?.["key"];    // 等价写法
mixed val3 = m.?["key"];    // 另一种写法
```

可选链只能读取，不能作为赋值左值。

### 6.10 逗号运算符

```c
// 从左到右求值，返回最右边的值
a = (x = 1, y = 2, x + y);  // a = 3
```

### 6.11 运算符优先级（从低到高）

| 优先级 | 运算符 | 结合性 |
|--------|--------|--------|
| 最低 | `,` 逗号表达式 | 左结合 |
| | `=` `+=` `-=` 等赋值 | 右结合 |
| | `? :` 三元 | 右结合 |
| | `??` 空值合并 | 左结合 |
| | `\|\|` 逻辑或 | 左结合 |
| | `&&` 逻辑与 | 左结合 |
| | `\|` 按位或 | 左结合 |
| | `^` 按位异或 | 左结合 |
| | `&` 按位与 | 左结合 |
| | `==` `!=` | 左结合 |
| | `>` `>=` `<` `<=` | 左结合 |
| | `<<` `>>` | 左结合 |
| | `+` `-` | 左结合 |
| | `*` `/` `%` | 左结合 |
| | `!` `~` 一元 `-`、cast、`await`、前置 `++` / `--` | 前缀 |
| 最高 | 函数调用、索引/切片、成员访问、后置 `++` / `--` | 后缀 |

---

## 7. 控制流

### 7.1 if / else

```c
if (hp <= 0) {
    write("You are dead!\n");
} else if (hp < 20) {
    write("You are badly wounded.\n");
} else {
    write("You are fine.\n");
}
```

### 7.2 while 循环

```c
int i = 0;
while (i < 10) {
    write(i + "\n");
    i++;
}
```

### 7.3 do-while 循环

```c
int i = 0;
do {
    write(i + "\n");
    i++;
} while (i < 10);
```

### 7.4 for 循环

```c
// 基本形式
for (int i = 0; i < 10; i++) {
    write(i + "\n");
}

// 多变量
int i;
int j;
for (i = 0, j = 10; i < j; i++, j--) {
    write(i + " " + j + "\n");
}

// 省略部分
int i = 0;
for (; i < 10; ) {
    write(i++ + "\n");
}
```

### 7.5 foreach 循环

```c
// 遍历数组
int *nums = ({ 1, 2, 3, 4, 5 });
foreach (int x in nums) {
    write(x + "\n");
}

// 按引用遍历（修改原数组）
int *nums = ({ 1, 2, 3 });
foreach (int ref n in nums) {
    n *= 2;     // nums 变为 ({ 2, 4, 6 })
}

// & 是 ref 的语法糖
foreach (int & n in nums) {
    n *= 2;
}

// 遍历 mapping
mapping data = ([ "a": 1, "b": 2 ]);
foreach (string key, mixed val in data) {
    write(key + " = " + val + "\n");
}

// 遍历字符串（按 UTF-8 扩展字形簇）
foreach (int ch in "hello") {
    write(ch + "\n");   // 输出 Unicode 码点
}

// 遍历 buffer
buffer buf = allocate_buffer(3);
foreach (int b in buf) {
    write(b + "\n");    // 输出 0-255 的字节值
}
```

**注意：**

- 双变量 `foreach (key, value in expr)` 只适用于 mapping；数组、字符串和 buffer 使用单变量形式。
- `ref` 可原地修改数组、buffer 的元素，以及 mapping 的值；例如 `foreach (string key, mixed ref value in data) { value *= 2; }`。mapping 的键不能用 `ref` 修改。
- 对字符串的 `ref` 遍历不会修改原字符串。
- 异步函数中，使用局部循环变量的普通 `foreach` 支持 `await`；`ref` 或全局循环变量仍有限制，见第20.2节。
- 字符串按扩展字形簇遍历；无法表示为单一 Unicode 码点的多码点簇会得到 `-1`，需要完整文本时使用范围切片。

### 7.6 switch / case

```c
switch (action) {
    case "north":
        move_player("north");
        break;
    case "south":
        move_player("south");
        break;
    case "look":
        describe_room();
        break;
    default:
        write("Unknown action.\n");
}
```

**LPC 特有的 switch 特性：**

1. **字符串 case**：
```c
switch (str) {
    case "hello": ...; break;
    case "world": ...; break;
}
```

2. **整数范围 case**：
```c
switch (level) {
    case 1..10:    write("Beginner\n"); break;
    case 11..50:   write("Intermediate\n"); break;
    case 51..:     write("Expert\n"); break;    // 51 到无穷
    case ..0:      write("Invalid\n"); break;   // 0 以下
}
```

3. **case 标签中的编译时常量表达式**：
```c
#define FLAG_A 1
#define FLAG_B 2
switch (flags) {
    case FLAG_A | FLAG_B: ...; break;
}
```

**注意：** 缺少 `break` 会穿透到下一个 case（与 C 相同）。

### 7.7 break / continue

```c
break;       // 跳出当前循环或 switch
continue;    // 跳到下一次循环的条件判断
```

### 7.8 return

```c
return;           // void 函数
return value;     // 返回值
```

当声明的返回类型与表达式的静态类型分别为 `int` / `float` 时，编译器执行数值转换；这与第3.5节只改变类型标记的显式 cast 不同：

```c
int wholePart() { return 3.9; }      // 真正返回 int 3
float realValue() { return 5; }     // 真正返回 float 5.0
float realZero() { return 0; }      // 真正返回 float 0.0
mixed keepValue() { return 1.5; }   // 保留 float 值
```

该规则不逐项转换 `int *` / `float *` 数组，也不代表任意 `mixed` 返回值都会在运行时按声明重新检查。

---

## 8. 函数

### 8.1 函数定义

```c
int add(int a, int b) {
    return a + b;
}

void greet(string name) {
    write("Hello, " + name + "!\n");
}
```

### 8.2 函数原型（前向声明）

在 `strict_types` 模式下，调用尚未定义的函数需要原型：

```c
int add(int, int);     // 类型必须，参数名可选
void greet(string);
```

### 8.3 可变参数（varargs）

```c
varargs mixed query(string key, mixed def) {
    // def 是可选参数
    return def;
}

// 调用
query("name");           // def 为 0
query("name", "Unknown"); // def 为 "Unknown"
```

函数声明中最后的 `...` 表示接受剩余参数为数组：

```c
varargs void debug(string fmt, mixed *args...) {
    // args 包含 fmt 之后的所有参数
}
```

### 8.4 默认参数

```c
void greet(string name, string title : (: "friend" :)) {
    write("Hello, " + title + " " + name + "!\n");
}

greet("Alice");            // 使用默认值 "friend"
greet("Bob", "Sir");       // 覆盖为 "Sir"
```

默认值使用函数指针语法 `: (: expr :)`，在**调用时**在**调用者上下文**中求值。带默认值的参数必须位于参数列表末尾。

默认参数表达式内不能声明局部变量，也不能使用 `await` / `acatch`；需要复杂处理时调用普通辅助函数。

### 8.5 按引用传递（ref / &）

```c
void increment(int ref value) {
    value++;
}

void append_item(mixed & arr, mixed item) {
    arr += ({ item });
}

int x = 10;
increment(ref x);    // x = 11
increment(& x);      // x = 12

mixed *items = ({ "a" });
append_item(& items, "b");  // items = ({ "a", "b" })
```

**限制：**
- `ref` 必须在声明和调用处同时使用
- 参数必须是左值（变量，不能是表达式）
- 不能引用数组/字符串的范围

### 8.6 函数调用方式

```c
// 调用本对象函数
add(1, 2);

// 调用其他对象方法
ob->query("name");
call_other(ob, "query", "name");

// efun:: 前缀 — 绕过 simul_efun，直接调用驱动内置函数
efun::write("hello");

// 通过函数指针调用
function f = add;
f(1, 2);
(*f)(1, 2);        // 旧式写法
evaluate(f, 1, 2); // 等价写法

// 通过索引的函数指针调用
function *ops = ({ add, subtract });
ops[0](1, 2);
```

### 8.7 函数名称限定

```c
foo()                   // 普通函数调用，可调用本对象覆盖后的实现
::foo()                 // 调用继承链中的实现，绕过本对象同名覆盖
room::foo()             // 指定已继承的 room.c / room.lpc 中的实现
efun::write("hello")    // 直接调用驱动 efun，绕过 simul_efun
```

`room` 匹配继承文件去掉扩展名后的名称，须先有对应的 `inherit`。即使限定名写成 `int`、`object` 等类型关键字，也仍走继承文件查找；`int::to_string(42)` 不是内置类型方法语法。

---

## 9. 一等函数与 Lambda

函数在 LPC 中是一等公民，可以存储在变量中、作为参数传递、作为返回值。

### 9.1 传统函数指针语法 `(: ... :)`

```c
// 本地函数引用
function f = (: local_func :);

// efun 引用
function f = (: write :);

// 带绑定参数
function f = (: write, "Hello!\n" :);
f();                    // 输出 "Hello!\n"

// 对象方法引用
function f = (: ob, "query_name" :);

// 表达式函数
function f = (: $1 + $2 :);
evaluate(f, 3, 4);      // 返回 7
```

### 9.2 简化语法（新）

```c
// 直接赋值函数名（无需 (: :)）
function f = add;
function f = write;

// 直接调用（无需 evaluate()）
int result = f(5, 3);

// 存储在数据结构中
function *ops = ({ add, subtract, multiply });
int r = ops[0](10, 5);

mapping cmds = ([
    "attack": do_attack,
    "defend": do_defend,
]);
cmds["attack"]();
```

### 9.3 匿名函数（Lambda）

```c
function f = function(int x) {
    int y = x * 2;
    return y + 1;
};

int result = f(5);   // result = 11
```

### 9.4 五种函数指针类型

| 类型 | 语法 | 求值说明 |
|------|------|----------|
| 本地函数 | `(: func :)` 或 `func` | 创建函数引用，调用时执行函数 |
| efun 指针 | `(: efun :)` | 创建 efun 引用，调用时执行 |
| call_other | `(: object, "method" :)` | 创建时绑定目标，调用时执行方法 |
| 表达式函数 | `(: $1 + $2 :)` | 调用时计算表达式 |
| 匿名函数 | `function(type arg) { ... }` | 调用时执行函数体 |

调用实参在调用时求值；`(: func, expr :)` 的预绑定参数 `expr` 则在创建指针时求值。不要把绑定参数的求值时机理解为函数体在创建时执行。

### 9.5 `$()` 捕获表达式

在表达式函数指针中，`$(expr)` 强制在**创建时**求值并缓存结果：

```c
// $(this_player()->query_name()) 在创建时求值一次
function f = (: tell_object($1, $(this_player()->query_name()) + " bows.\n") :);
```

### 9.6 `$N` 参数占位符

在表达式函数指针中，`$1`、`$2`、`$3`... 引用调用时传入的参数：

```c
function cmp = (: $1 - $2 :);           // 两个参数的比较器
int *sorted = sort_array(arr, cmp);
```

---

## 10. 面向对象：继承与 class

### 10.1 继承（inherit）

继承是 LPC 面向对象的核心机制，基于**文件**而非类：

```c
inherit "/std/object";              // 公有继承（默认）
private inherit "/std/internal";    // 私有继承
public inherit "/std/weapon";       // 公有继承（显式）
```

**特性：**
- 子对象自动获得父对象的所有函数和变量
- 子对象可覆盖父对象的同名函数
- 多继承支持：一个对象可继承多个父对象

**访问被覆盖的父函数：**

```c
// 假设已 inherit "/std/object"，调用该文件中的父函数
object::reset();

// 调用继承链中被本对象覆盖的实现
::query_long();
```

### 10.2 访问控制

```c
private:     // 后续定义默认为 private
int secret;
void internal_func() { ... }

public:      // 后续定义默认为 public
void external_api() { ... }
```

### 10.3 Class（结构体）

`class` 是共享引用的具名字段结构，不支持继承。赋值不会复制实例，对任一别名修改字段都会影响同一个实例；`struct` 是受编译选项控制的同义关键字。

```c
// 定义
class Person {
    string name;
    int level;
    float *scores;
}

// 创建实例
class Person npc = new(class Person);

// 带初始化创建
class Person npc = new(class Person, name : "Alice", level : 10);

class Person alias = npc;
alias->level = 20;               // npc->level 同时变为 20

// 访问成员（两种语法）
npc.name = "Bob";
npc->name = "Bob";

// 类型转换
((class Person)some_mixed)->name;
```

**跨文件共享 class 定义：** 通过 `inherit` 共享，不要用 `#include`。

---

## 11. 数组

### 11.1 声明与初始化

```c
int *nums;                   // 未初始化（默认为 0）
int *nums2 = ({ 1, 2, 3 }); // 带初始化
string *names = ({ "Alice", "Bob" });
mixed *arr = allocate(10);   // 分配10个元素（初始化为 0）
```

### 11.2 访问与修改

```c
int x = arr[0];         // 读取第一个元素
arr[2] = 42;            // 修改第三个元素
int last = arr[<1];     // 读取最后一个元素
```

### 11.3 数组运算

```c
// 合并
int *c = a + b;         // 连接两个数组

// 差集
int *d = a - b;         // 从 a 中移除 b 中的元素

// 复合赋值
a += ({ 4, 5 });        // 追加元素
a -= ({ 3 });           // 移除元素

// 长度
int len = sizeof(arr);
```

### 11.4 二维数组

```c
mixed a = ({ ({ 1, 2, 3 }), ({ 4, 5, 6 }) });
int x = a[0][1];   // x = 2

// 或者
mixed a = allocate(10);
a[0] = allocate(10);
a[1] = allocate(10);
a[0][0] = 42;
```

### 11.5 展开运算符（spread）

```c
int *a = ({ 1, 2 });
int *b = ({ 3, 4 });
int *c = ({ a..., b... });   // ({ 1, 2, 3, 4 })

// 函数参数展开
func(a..., extra_arg);
```

---

## 12. Mapping（关联数组）

### 12.1 声明与初始化

```c
mapping m;                          // 未初始化（默认为 0）
mapping m2 = ([]);                  // 空 mapping
mapping m3 = ([ "key1": 1, "key2": 2 ]);  // 带初始化
```

**重要：** mapping 必须先初始化才能使用！否则会报 "Indexing on illegal type"。

### 12.2 访问与修改

```c
m["key"] = value;           // 设置/新增键值对
mixed val = m["key"];       // 读取
mixed val2 = m->key;        // 等价的箭头语法
map_delete(m, "key");       // 删除键值对
```

### 12.3 Mapping 操作

```c
// 获取所有键和值
mixed *k = keys(m);
mixed *v = values(m);

// 大小
int size = sizeof(m);

// 判断键是否存在
if (!undefinedp(m["key"])) { ... }

// 合并（并集）
mapping merged = m1 + m2;

// 复合（数学意义）
mapping composed = m1 * m2;

// 追加
m += ([ "new_key": value ]);
```

### 12.4 二维 Mapping

```c
mapping x = ([]);
mapping y = ([]);
y["a"] = "c";
x["b"] = y;
// x["b"]["a"] == "c"
```

---

## 13. 字符串高级操作

### 13.1 UTF-8 原生支持

LPC 字符串内部以 UTF-8 存储。长度按**扩展字形簇**（用户感知字符）计算：

```c
strlen("abc")   == 3
strlen("你好")  == 2     // 6 字节 UTF-8，2 个字符
strlen("👍🏽")    == 1     // 2 个码点，1 个字符
sizeof("你好")  == 2     // 与 strlen() 相同规则
```

### 13.2 长度 vs 显示宽度

```c
strlen("你好")   == 2     // 字符数
strwidth("你好") == 4     // 显示宽度（全角字符占2列）
sprintf("%-10s|", ...)    // sprintf 按显示宽度填充
```

### 13.3 字符串索引

```c
int codepoint = "abc"[0];       // 返回 Unicode 码点 97 ('a')
string ch = "hello"[0..0];      // 返回子串 "h"
```

注意：对多码点字形簇（如 `👍🏽`）使用单字符索引会报错。用 `str[i..i]` 范围提取。

### 13.4 编码转换

```c
// 连接编码：自动转码
set_encoding("GBK");             // 设置当前交互连接编码；无参数时恢复 UTF-8
string enc = query_encoding();   // 查询当前交互连接编码

// 显式转码
buffer buf = string_encode(str, "GBK");
string s = string_decode(buf, "GBK");
buffer trans = buffer_transcode(buf, "GBK", "UTF-8");
```

### 13.5 常用字符串函数

```c
strlen(str)                        // 字符数
strwidth(str)                      // 显示宽度
sizeof(str)                        // 同 strlen
sprintf(fmt, ...)                  // 格式化
sscanf(str, fmt, v1, v2, ...)      // 解析；目标参数直接写左值，不加 &
explode(str, delim)                // 分割为数组
implode(arr, delim)                // 合并为字符串
strsrch(str, target)               // 搜索子串位置
replace_string(str, old, new)      // 替换子串
regexp(arr, pattern)               // 正则匹配过滤
pcre_match(str, pattern)           // PCRE 正则匹配
```

---

## 14. Buffer（二进制缓冲区）

### 14.1 基本操作

```c
buffer buf = allocate_buffer(4);    // 创建4字节缓冲区
buffer buf2 = "abc";                // 从字符串自动转换（UTF-8 字节）
buffer buf3 = ({ 1, 2, 255 });      // 从 int 数组自动转换

int len = sizeof(buf);              // 字节长度
bufferp(buf);                       // 类型检查
```

### 14.2 索引与范围

```c
buf[0] = 200;               // 写入字节（0-255）
int x = buf[0];             // 读取字节（始终为 unsigned 0-255）
int y = buf[<1];            // 最后一个字节

buffer part = buf[1..2];    // 子缓冲区（副本）
buf[1..2] = allocate_buffer(5);  // 范围赋值（可改变大小）
```

### 14.3 自动类型提升

```c
buffer buf = "abc";                 // string -> buffer（UTF-8 字节）
buf = ({ 1, 2, 255 });             // int[] -> buffer
buf += "e";                        // 追加 UTF-8 字节
buf = ({ 300 });                   // 错误：超出 0-255
```

---

## 15. 索引与切片

### 15.1 正向索引

```c
arr[0]              // 第一个元素
arr[3]              // 第四个元素
str[0]              // 第一个字符的 Unicode 码点
m["key"]            // mapping 键查找
```

### 15.2 反向索引（`<` 前缀）

```c
arr[<1]             // 最后一个元素
arr[<3]             // 倒数第三个元素
str[<1]             // 最后一个字符
```

### 15.3 范围切片

```c
arr[0..4]           // 元素 0 到 4（包含两端）
arr[2..<1]          // 从第3个到最后一个
arr[<3..<1]         // 倒数第3个到最后一个
arr[2..]            // 从第3个到末尾
arr[..<2]           // 从开头到倒数第2个（包含）
```

### 15.4 范围赋值（左值）

```c
arr[1..3] = ({ 10, 20 });     // 替换子数组
str[0..2] = "new";             // 替换子串
arr[0..0] = ({ 1, 2, 3 });    // 插入（数组变长）
```

---

## 16. 预处理器

预处理与词法分析一体化（单趟扫描），不是独立的预处理阶段。

### 16.1 #define / #undef

```c
// 对象宏
#define MAX_HP 100
#define GREETING "Welcome!"

// 函数宏（注意：括号必须紧跟名称，无空格）
#define SQUARE(x) ((x) * (x))
#define MSG(who, text) tell_object(who, text "\n")

// 字符串化参数
#define STR(x) #x
STR(hello)   // "hello"

// 标记粘合
#define CONCAT(a, b) a ## b
CONCAT(foo, bar)   // foobar

// 多行宏
#define LONG_MACRO(x) do { \
    write(x);              \
    write("\n");           \
} while (0)

// 取消定义
#undef MAX_HP
```

### 16.2 #include

```c
#include "defs.h"       // 先相对当前文件目录，再搜索 include path
#include <mudlib.h>     // 只搜索 include path
```

文件名可由宏产生：`#include CONFIG`。

`#include` 与 `inherit` 应保留源码中的先后顺序，不能为排版将头文件统一移到继承语句之前；头文件可能引用继承引入的 class 或函数。当前上游格式化器也保留该顺序。

`include_list(ob)` 返回对象编译时实际打开的头文件列表，包含嵌套头文件和实际打开的全局头文件；按首次出现顺序去重，不含对象自身源文件及未生效条件分支中的头文件。省略参数时查询 `this_object()`。

### 16.3 条件编译

```c
#ifdef FEATURE_X
    // FEATURE_X 已定义时编译
#endif

#ifndef GUARD_H
#define GUARD_H
    // include guard
#endif

#if EXPRESSION
    // 整数常量表达式
#elif OTHER_EXPR
    // 否则如果
#else
    // 否则
#endif
```

`#if` 表达式支持完整的 C 运算符优先级，以及：
- `defined(NAME)` — 宏是否已定义
- `efun_defined(name)` — 驱动是否编译了该 efun

```c
#if defined(__PACKAGE_CRYPTO__) && efun_defined(hash)
string h = hash("sha256", data);
#endif
```

### 16.4 #pragma

```c
#pragma strict_types       // 强制类型检查（强烈推荐）
#pragma warnings           // 启用警告
#pragma no_warnings        // 禁用警告
#pragma save_types         // 保存类型信息（供继承者类型检查）
#pragma optimize           // 启用额外优化
#pragma show_error_context // 错误时显示源码上下文
```

上述 pragma 都可加 `no_` 前缀关闭，例如 `#pragma no_optimize`。未知 pragma 只产生警告并被忽略。

### 16.5 #error / #warn

```c
#error "This configuration is not supported"
#warn "This function is deprecated, use new_func instead"
```

此外，`#echo text` 会在编译时向标准错误输出文本，`#line N "file"` 会重设后续诊断使用的行号和可选文件名；`#breakpoint` 仅为兼容而接受，当前实现会忽略它。

### 16.6 指令行续行与注释

以 `#` 开始的预处理指令先拼接反斜杠加换行，再识别注释。`#` 和指令名之间可以有块注释；续行也可出现在指令的字符串内部。

```c
# /* comment */ define LIMIT 10
#define GREETING "hel\
lo"                             // 展开为 "hello"
#define VALUE 1 // note \
这一物理行仍属于上一行注释
```

特别注意指令中 `//` 注释末尾的反斜杠：下一物理行也会被吞入注释。以上规则描述指令行，不表示普通 LPC 字符串都可以这样换行。

### 16.7 预定义宏

| 宏 | 说明 |
|----|------|
| `__FILE__` | 当前文件名 |
| `__LINE__` | 当前行号 |
| `__DIR__` | 当前文件目录 |
| `FLUFFOS` | FluffOS 版本号 |
| `MAX_INT` | 最大整数值 |
| `__PACKAGE_*__` | 各功能包是否编译（如 `__PACKAGE_DB__`、`__PACKAGE_CRYPTO__`） |

---

## 17. 特殊内置形式

### 17.1 catch — 异常捕获

```c
// 捕获表达式中的错误
mixed err = catch(some_dangerous_call());
if (err) {
    write(sprintf("Error: %O\n", err));
}

// 捕获代码块中的错误
mixed err = catch {
    load_object("/dangerous");
    do_something();
};
```

`catch` 成功返回 `0`，失败返回错误值。驱动错误通常是以 `*` 开头的字符串，`throw(value)` 可抛出其他非零值，因此用 `mixed` 保存结果。普通 `catch` 内不能使用 `await`；需要跨异步挂起捕获异常时使用第20.3节的 `acatch`。

### 17.2 sscanf — 字符串解析

```c
string input = "Alice 25";
string name;
int age;
sscanf(input, "%s %d", name, age);
// name = "Alice", age = 25
```

### 17.3 parse_command — 命令解析

```c
parse_command(cmd, env, fmt, lvalue, ...);
```

### 17.4 time_expression — 计时

```c
int ticks = time_expression {
    some_expensive_operation();
};
int oneCallTicks = time_expression(some_expensive_operation());
write("Operation took " + ticks + " ticks.\n");
```

### 17.5 new — 克隆对象 / 创建 class 实例

```c
// 克隆对象
object ob = new("/npc/goblin");

// 带参数克隆
object ob = new("/npc/goblin", "Goblin King");

// 创建 class 实例
class Person p = new(class Person, name : "Alice", level : 10);
```

---

## 18. 内置函数（Efun）分类速查

以下仅列常用 efun。准确签名以 `fluffos/src/packages/<包名>/<包名>.spec` 为准；数据库、PCRE、加密、数学等功能还取决于对应功能包是否编译。

### 18.1 数组操作

```c
allocate(size)                  // 分配数组
sizeof(arr)                     // 数组长度
member_array(item, arr)         // 查找元素索引
filter(arr, func)               // 过滤
map(arr, func)                  // 映射
sort_array(arr, func)           // 排序
unique_array(arr, func)         // 按函数分组
a & b                           // 数组交集（运算符，不是 efun）
a | b                           // 数组并集（运算符，不是 efun）
```

### 18.2 字符串操作

```c
sprintf(fmt, ...)               // 格式化
sscanf(str, fmt, ...)           // 解析
explode(str, delim)             // 分割
implode(arr, delim)             // 合并
strsrch(str, target)            // 搜索
replace_string(str, old, new)   // 替换
strlen(str)                     // 长度
strwidth(str)                   // 显示宽度
lower_case(str)                 // 转小写
capitalize(str)                 // 首字母大写
trim(str)                       // 去空白
crypt(str, seed)                // 加密
```

### 18.3 正则表达式

```c
pcre_match(str, pattern)        // PCRE 匹配
pcre_replace(str, pattern, rep) // PCRE 替换
pcre_extract(str, pattern)      // PCRE 提取
regexp(arr, pattern)            // 数组过滤
```

### 18.4 对象操作

```c
clone_object(path)              // 克隆（等价 new）
destruct(ob)                    // 销毁
move_object(env)                // 将当前对象移动到目标环境
environment(ob)                 // 所在环境
all_inventory(ob)               // 所有内容物
find_object(path)               // 查找对象
file_name(ob)                   // 文件名
living(ob)                      // 是否活物
userp(ob)                       // 是否玩家
interactive(ob)                 // 是否在线
```

### 18.5 玩家交互

```c
write(str)                      // 向当前玩家输出
tell_object(ob, str)            // 向指定对象输出
say(str)                        // 向同房间所有人输出
input_to(func)                  // 等待输入
add_action(func, verb)          // 注册命令
this_player()                   // 当前玩家
this_object()                   // 当前对象
```

### 18.6 数学函数

```c
abs(x)                          // 绝对值
sqrt(x)                         // 平方根
random(n)                       // 随机数 0..n-1
to_int(x)                       // 转整数
to_float(x)                     // 转浮点
```

### 18.7 浮点数学

```c
sin(x)  cos(x)  tan(x)         // 三角函数
asin(x) acos(x) atan(x)       // 反三角
pow(x, y)                       // 幂
log(x)  exp(x)                  // 对数/指数
floor(x)  ceil(x)              // 取整
```

### 18.8 文件操作

```c
read_file(path)                 // 读文件
write_file(path, str)           // 写文件
file_size(path)                 // 文件大小
rename(old, new)                // 重命名
rm(path)                        // 删除
mkdir(path)                     // 创建目录
get_dir(pattern)                // 列目录
```

### 18.9 数据库

```c
db_connect(host, database, user, type) // 连接；user/type 可省略
db_exec(conn, sql)              // 执行查询
db_fetch(conn, row)             // 获取指定结果行
db_close(conn)                  // 关闭
db_status()                     // 状态
```

### 18.10 系统函数

```c
time()                          // 当前时间戳
uptime()                        // 运行时间
memory_info()                   // 内存信息
debug_info(level, ob)           // 调试信息
call_out(func, delay, args...)  // 传统回调形式，返回整数句柄
call_out(delay)                 // Promise 形式，到时以 0 完成
call_out_walltime(delay)        // 墙钟定时的 Promise 形式；也保留回调形式
remove_call_out(id)             // 取消整数句柄对应的定时器
include_list(ob)                // 编译时实际包含的头文件，可省略 ob
```

### 18.11 函数指针操作

```c
evaluate(func, args...)         // 调用函数指针
function_owner(func)            // 函数所属对象
map_array(arr, func)            // 用函数映射数组
filter_array(arr, func)         // 用函数过滤数组
```

### 18.12 异步文件操作

这些 efun 需要 `PACKAGE_ASYNC`；Promise 类型、`async` / `await` 语法和第20节的核心 Promise efun 不依赖这个功能包。

| 调用方式（省略回调） | 结果 |
|--------------------|------|
| `async_read(path)` | 返回 Promise，完成值为文件内容；读取失败以负整数拒绝 |
| `async_write(path, text, flag)` | 返回 Promise，成功无有效载荷；失败以负整数拒绝；`flag == 1` 覆盖，否则追加 |
| `async_getdir(pattern)` | 返回 Promise，完成值为排序后的文件名数组 |

传入末尾 `function` 回调时仍走原有回调接口。`async_db_exec(conn, sql, callback, ...)` 还需要 `PACKAGE_DB`，当前仍要求回调，不能省略回调当成 Promise 使用。

### 18.13 外部进程

需要 `PACKAGE_EXTERNAL`，命令索引对应运行配置中的 `external_cmd_N`。

| 调用 | 说明 |
|------|------|
| `external_start(index, args)` | 省略回调时返回 Promise；传统回调形式仍返回 socket fd |
| `external_create(index, args)` | 分配进程句柄，尚不启动进程 |
| `external_run(handle)` | 启动该句柄对应的进程，返回 Promise；每个句柄只能启动一次 |
| `external_write(handle, text)` / `external_close_stdin(handle)` | 写入或关闭标准输入 |
| `external_stdout(handle)` / `external_stderr(handle)` / `external_exit_code(handle)` | 读取结果 |
| `external_kill(handle)` | 停止子进程，保留句柄及结果 |
| `external_close(handle)` | 停止进程并释放句柄；未完成的运行 Promise 会拒绝 |

`external_start` / `external_run` 的 Promise 完成值是 `({ stdout, stderr, exitCode })`。进程以非零状态退出仍是完成，调用方必须检查 `exitCode`；启动失败则拒绝。句柄归创建对象所有，使用后应 `external_close`。

直接 `promise_reject` 这两种进程 Promise 会终止子进程；普通 `promise_race` 超时不会。`promise_cancel` 只适用于 `async` 函数的返回 Promise，不能用来取消这些进程 Promise。

---

## 19. 编码风格建议

以下排版和命名为可选风格建议，不是 LPC 语法限制；具体项目可以采用其他一致的编码规范。

### 19.1 格式

- **编码与换行**：UTF-8、LF，保留文件末尾换行并移除行尾空白
- **缩进**：示例使用4空格；项目内统一缩进宽度，避免混用 Tab 与空格
- **局部变量**：支持第4.2节所述的 C99 式声明，也可以集中在函数开头
- **花括号**：左花括号同行或独占一行均合法，保持风格一致；下面示例采用独占一行

```c
void example()
{
    if (condition)
    {
        do_something();
    }
    else
    {
        do_other();
    }
}
```

### 19.2 命名

- 局部变量和业务辅助函数：描述性 `camelCase`（如 `maxHp`、`formatMessage`）
- 驱动 apply、efun 和既有框架钩子：保留 `under_score`（如 `query_name`、`clean_up`）
- 宏/常量：`UPPER_SNAKE_CASE`（如 `MAX_HP`、`DEFAULT_ROOM`）
- 类名：`PascalCase`（如 `class Person`、`class WeaponData`）

### 19.3 类型检查

建议在文件开头启用严格类型检查：

```c
#pragma strict_types
```

### 19.4 头文件保护

```c
#ifndef MYLIB_H
#define MYLIB_H

// 定义内容...

#endif
```

### 19.5 宏最佳实践

```c
// 参数加括号
#define SQUARE(x) ((x) * (x))

// 多语句宏用 do-while 包裹
#define WRITE_LINE(text) do { \
    write(text);               \
    write("\n");               \
} while (0)
```

---

## 20. 异步函数与 Promise

基础语法、Promise 链式接口和 `async_yield` 自 `858d5da9`（2026-08-27）支持。局部变量 `foreach` 跨 `await`、第20.4节的组合器、第20.5节的取消机制及取消状态 `3` 自 `7c808c8b`（2026-09-09）支持。

### 20.1 Promise 类型与状态

`promise` 表示一次异步结果，`promise<T>` 可声明完成值的类型。裸 `promise` 等价于 `promise<mixed>`：

```c
promise<int> result;
promise<int> *results;        // Promise 数组
promise<string *> names;      // 完成值为 string 数组的 Promise
```

类型参数可以是普通类型、数组或 class，不支持 `promise<void>` 或嵌套的 Promise 载荷。`promise<T>` 是类型声明，不会对动态 `mixed` 载荷进行全面的运行时类型检查。`promisep(value)` 判断是否为 Promise，`typeof(p)` 返回 `"promise"`。

Promise 具有引用身份：`p == q` 比较是否同一实例，作为 mapping 键也按身份区分，`copy(p)` 不复制异步操作。它不能持久化，`save_object()` 将其保存为 `0`。

| `promise_status(p)` | 状态 | `promise_result(p)` |
|--------------------|------|---------------------|
| `0` | pending，尚未完成 | 抛出错误 |
| `1` | fulfilled，成功完成 | 完成值 |
| `2` | rejected，失败 | 拒绝原因 |
| `3` | cancelled，已取消 | 取消原因 |

`promise_result` 读取失败或取消原因，不会像 `await` 那样将原因抛出。创建和完成 Promise 的基础接口：

```c
promise p = promise_create();
promise_resolve(p, 42);        // 成功完成
// 或 promise_reject(p, reason); 失败；同一个 Promise 不能重复完成
```

以另一个 Promise 完成时会跟随它的结果，不会产生嵌套 Promise。重复完成（包括已开始跟随另一个尚未完成的 Promise）会报错；`async` 函数返回的 Promise 由函数体负责完成，不能通过 `promise_resolve` / `promise_reject` 强行修改。

### 20.2 async 与 await

`async` 修饰函数；声明的返回类型仍用于检查函数体内的 `return`，调用方得到 Promise。例如 `async int f()` 调用后得到 `promise<int>`。`async void` 也合法，适用于没有业务返回值的异步工作。

下面是一个完整示例，需要 `PACKAGE_ASYNC`：

```c
#pragma strict_types

private async string readNotice(string path)
{
    return await async_read(path);
}

async void showNotice(object player, string path)
{
    string content;
    mixed err;

    err = acatch {
        content = await readNotice(path);
    };
    if (!objectp(player))
        return;
    if (err)
    {
        tell_object(player, sprintf("读取失败：%O\n", err));
        return;
    }
    tell_object(player, content);
}
```

调度与求值规则：

- 调用后先同步执行函数体，直到遇到需要挂起的 `await`，或直接结束；`async` 不会把整段 LPC 代码转移到后台线程。
- `await` 非 Promise 时直接返回原值，不挂起；`await` 任意 Promise 时都会挂起，包括已经完成的 Promise，之后由微任务队列恢复执行。
- 成功恢复得到完成值，失败或取消则在 `await` 处抛出对应原因。每次恢复有新的执行成本预算。
- `await` 是一元前缀运算符，`await p + 3` 等于 `(await p) + 3`。
- 连续 `await` 可能在同一轮微任务处理中继续执行。需要让事件循环处理网络及到期定时器时使用 `await async_yield()`，不要用 `await call_out(0)` 代替。
- 挂起期间对象仍可接收其他调用；恢复后应重新检查共享状态及对象是否有效。`this_player()` 的恢复受运行配置 `this_player in call_out` 控制。

限制与兼容性：

- 原型、定义以及继承覆盖必须一致声明 `async`；不能给变量加 `async`，也不能写 `async:`。
- `await` / `acatch` 只允许直接出现在异步函数体内，不允许写在其内部的普通 Lambda、匿名函数、默认参数或全局初始化中。
- 普通 `catch` 和 `time_expression` 内不能 `await`，应将异步工作移出这些区域或改用 `acatch`。
- 局部循环变量的普通 `foreach` 支持跨 `await`，包括数组、mapping、字符串、buffer 和嵌套循环。全局循环变量、`ref` 循环变量/实参，以及仍在栈上的字符串字符或 buffer 字节左值不能跨挂起保存，会触发运行时错误。
- 当前源码允许 `arr[i] += await p` 和 `value += await p`：复合赋值先求右侧，再取得赋值目标。不要沿用旧文档中禁止此写法的说明。
- `create`、`init`、`id`、`heart_beat` 等对象 apply 声明为 `async` 会编译失败；`valid_read` 等 master 专用 apply 的同名声明会警告。驱动需要即时返回值，权限校验和 `add_action` 命令函数不能返回 Promise；需要异步处理时由同步入口启动辅助函数。
- 挂起期间所属对象被销毁、`recompile_object()` 重编译或 `replace_program()` 替换程序时，原调用不再恢复，返回的 Promise 会拒绝。

### 20.3 acatch 与清理

`acatch(expr)` 和 `acatch { ... }` 的返回约定与 `catch` 相同：成功为 `0`，失败为错误值；它们还可捕获挂起后收到的 Promise 拒绝或取消。错误值可能是整数、字符串等，使用 `mixed` 保存。

`acatch` 只能用于异步函数，不能嵌入普通 `catch`；`acatch` 内可有不含 `await` 的普通 `catch`。`break` / `continue` 不能跳出捕获区域，`return` 可以正常退出。

`defer(function)` 注册的清理回调会跨 `await` 保留，在函数最终退出时执行。但对象销毁、等待中的 Promise 被回收等放弃执行路径不能保证运行清理回调；必须跨这些情况清理的资源应交给寿命更长的管理对象。

### 20.4 Promise 链与组合器

| 接口 | 行为 |
|------|------|
| `promise_then(p, onValue, onError)` | 返回新的 Promise；回调参数可省略，回调返回值或抛出的错误决定后续结果 |
| `promise_catch(p, onError)` | 只处理失败的链式形式，返回新的 Promise |
| `promise_all(items)` | 全部成功后按输入顺序返回值数组；遇到首个失败立即失败 |
| `promise_any(items)` | 首个成功者决定结果；全部失败则以按输入顺序收集的原因数组拒绝 |
| `promise_race(items)` | 首个完成者决定结果，成功、失败或取消均可 |
| `promise_all_settled(items)` | 等待全部结束，返回每项状态及结果，不因某项失败而拒绝 |

组合器接收 `mixed *`，非 Promise 元素视为已成功的值。空数组的 `all` / `all_settled` 立即完成为空数组，`any` 拒绝，`race` 直接报错。

`promise_all_settled` 每项结果采用以下格式：

```c
([ "status": 1, "value": value ])   // 成功
([ "status": 2, "reason": reason ]) // 失败
([ "status": 3, "reason": reason ]) // 取消
```

组合器不会自动停止尚未结束的操作。用 `promise_race` 限制等待时间时，超时只结束等待；需要停止工作，还须调用对应操作的取消或关闭接口。

### 20.5 协作取消与诊断

`promise_cancel(p)` 只接受 `async` 函数返回的 Promise。返回 `1` 表示已发出取消请求，`0` 表示函数体已结束、无可取消的工作；对其他来源的 Promise 调用会报错。

取消是协作式的：在下一次 `await` 抛出 `"*async function cancelled"`；已经挂起的调用会从等待对象脱离并安排恢复，不必等原操作完成。错误未被捕获时，返回的 Promise 进入状态 `3`。请求被投递后即消耗，函数可在 `acatch` 中捕获，等待清理工作并正常返回；没有下一次 `await` 的函数也可能正常执行完毕。

取消请求不会自动传播到被等待的其他异步函数。`call_out(delay)`、异步文件 I/O、组合器等返回的 Promise 不能用 `promise_cancel` 取消。需要单独撤销定时器时使用传统 `call_out(func, delay)` 的整数句柄和 `remove_call_out(handle)`。

`async_info()` 提供异步运行诊断；长期不结束的等待会占用挂起函数额度。无人观察的拒绝会在 Promise 被释放时写入调试日志，调用方应通过 `await` / `acatch` 或 Promise 错误回调处理失败。

---

## 附录：快速参考卡

### 类型速查
```
int float string object mapping function buffer mixed void
promise / promise<T>  — 异步结果
class 类名 / struct 类名
类型名 *      — 数组
类型名 &      — 引用参数
```

### 字面量速查
```
42  0xFF  0b1010  1_000_000     — 整数（无八进制字面量）
3.14  2.5e6  1.                 — 浮点
"hello"  "\u20ac"  '\n'         — 字符串/字符
`hello ${name}`                  — 模板字符串
@END ... END                     — 文本块（字符串）
@@END ... END                    — 文本块（字符串数组）
({ 1, 2, 3 })                    — 数组
([ "k": v ])                     — mapping
```

### 控制流速查
```
if (cond) { } else if (cond) { } else { }
while (cond) { }
do { } while (cond);
for (init; cond; step) { }
foreach (var in expr) { }
foreach (k, v in expr) { }
switch (expr) { case val: ...; break; default: ...; }
break;  continue;  return;  return expr;
```

### 函数速查
```
int func(int a, string b) { }              — 标准定义
varargs mixed func(mixed a, mixed b) { }   — 可变参数
void func(int a : (: default :)) { }       — 默认参数
void func(int ref x) { }                   — 引用参数
void func(int & x) { }                     — 引用参数（语法糖）
int func(int a);                           — 前向声明
async int func(int a) { return a; }        — 调用得到 promise<int>
await expr;                               — 异步函数内等待
acatch { await expr; };                    — 跨异步挂起捕获异常
```

### 函数指针速查
```
function f = func_name;            — 简化语法
function f = (: func_name :);     — 传统语法
function f = (: $1 + $2 :);       — 表达式函数
function f = function(int x) { return x; };  — 匿名函数
f(args);                           — 直接调用
evaluate(f, args);                 — 传统调用
```

---

> 本指南已按上述 FluffOS 基线的编译器语法、词法配置、efun 规范和回归用例核对。FluffOS 源码更新后应重新核对并更新基线。

---

## 附录：本次同步与核对依据

文档基线从 `b1fb96f`（2026-07-24）同步到 `2c272875`（2026-09-16），依据源码、efun 签名和回归用例核对。

### 关键更新的支持版本

下表的“支持起点”表示包含该提交（含本提交）的驱动源码开始支持对应能力或修正。日期取自提交记录，便于定位；判断是否具备能力以是否包含该提交为准。

| 关键更新 | 支持起点 | 文档位置 |
|----------|----------|----------|
| 函数 `return` 按声明执行标量 `int` / `float` 数值转换 | `88224998`（2026-07-27） | 第7.8节 |
| 默认参数表达式内禁止声明局部变量 | `9e11248f`（2026-08-20） | 第8.4节 |
| `promise<T>`、`async` / `await` / `acatch`、基础 Promise 接口及 `async_yield`；包括已完成 Promise 仍挂起及复合赋值右侧 `await` | `858d5da9`（2026-08-27） | 第20.1—20.3节，第20.4节的链式接口 |
| `async_read` / `async_write` / `async_getdir`、`call_out` / `call_out_walltime` 省略回调时返回 Promise | `858d5da9`（2026-08-27） | 第18.10、18.12节 |
| `include_list` 查询编译时实际包含的头文件 | `faccd243`（2026-09-03） | 第16.2、18.10节 |
| 预处理指令先拼接反斜杠续行，再识别注释 | `ac9f6191`（2026-09-07） | 第16.6节 |
| 外部进程句柄 API、`external_start` / `external_run` 的 Promise 形式及拒绝 Promise 时终止子进程 | `b8dd5866`（2026-09-09） | 第18.13节 |
| Promise 组合器、`promise_cancel`、取消状态 `3`，以及局部循环变量的 `foreach` 跨 `await` | `7c808c8b`（2026-09-09） | 第7.5、20.1、20.2、20.4、20.5节 |

`::foo()` 调用继承实现、mapping 值的 `ref` 遍历等属于旧说明纠正，并非本次源码才引入的能力。`2c272875`（2026-09-16）修正的是上游格式化器保留 `#include` / `inherit` 顺序的行为，不是新增语言语法。

### 源码与测试依据

| 内容 | 实现与签名 | 回归用例或上游说明 |
|------|------------|--------------------|
| Promise / async / await / acatch | [语法](../fluffos/src/compiler/internal/grammar.y)、[表达式语义](../fluffos/src/compiler/internal/grammar_rules_exprs.cc)、[core.spec](../fluffos/src/packages/core/core.spec) | [Promise 类型](../fluffos/testsuite/single/tests/efuns/promise_typed.lpc)、[await 求值和复合赋值](../fluffos/testsuite/single/tests/operators/await.lpc)、[异步 foreach](../fluffos/testsuite/single/tests/efuns/async_foreach.lpc) |
| 组合器与取消 | [Promise 状态与类型](../fluffos/docs/lpc/types/promise.md)、[异步执行模型](../fluffos/docs/concepts/general/async.md) | [组合器](../fluffos/testsuite/single/tests/efuns/promise_combinators.lpc)、[取消](../fluffos/testsuite/single/tests/efuns/promise_cancel.lpc) |
| 文件、定时器、外部进程 Promise 接口 | [async.spec](../fluffos/src/packages/async/async.spec)、[external.spec](../fluffos/src/packages/external/external.spec)、[call_out](../fluffos/docs/efun/calls/call_out.md) | [external_run](../fluffos/docs/efun/external/external_run.md)、[external_start](../fluffos/docs/efun/external/external_start.md) |
| 返回值数值转换、默认参数限制 | [返回语句实现](../fluffos/src/compiler/internal/grammar_rules_loops.cc)、[默认实参求值](../fluffos/src/vm/internal/base/interpret.cc) | [返回值转换](../fluffos/testsuite/single/tests/operators/return_type_coercion.lpc)、[默认参数声明限制](../fluffos/testsuite/single/tests/compiler/default_arg_decl.lpc) |
| 继承限定调用、mapping 引用遍历 | [继承函数查找](../fluffos/src/compiler/internal/compiler.cc)、[函数限定名实现](../fluffos/src/compiler/internal/grammar_rules_exprs.cc) | [函数调用语法](../fluffos/testsuite/single/tests/compiler/syntax_functions.lpc)、[mapping ref](../fluffos/testsuite/single/tests/operators/foreach_ref_mapping.lpc) |
| 预处理续行、头文件依赖 | [include_list](../fluffos/docs/efun/system/include_list.md)、[上游源码顺序约定](../fluffos/docs/lpc/style-guide.md) | [预处理器](../fluffos/testsuite/single/tests/compiler/preprocessor.lpc)、[include_list 测试](../fluffos/testsuite/single/tests/efuns/include_list.lpc) |

注意：上游 `docs/lpc/constructs/async.md` 仍残留“只等待 pending Promise 才挂起”和“`arr[i] += await p` 不允许”的旧说明。本指南已按当前实现及 `operators/await.lpc` 修正，后续维护时不能直接复制这些旧段落。
