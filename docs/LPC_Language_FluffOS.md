# FluffOS LPC 语言语法指南

> 核对基线：仓库内 `fluffos/` 的提交 `b1fb96f`（2026-07-24）。
> 本文覆盖当前构建启用的 LPC 语法、核心运行时语义和常用 efun；efun 是否可用仍取决于编译时功能包。
> 若本文与更新后的驱动冲突，以 `grammar.y`、词法器与编译选项、`*.spec` 和 `testsuite/` 为准，并同步修订本文。

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
| `buffer` | 字节数组（每元素 0-255） | 引用类型 |
| `class` / `struct` | 具名字段结构 | 引用类型 |
| `mixed` | 任意类型（关闭类型检查） | — |
| `void` | 仅用于函数返回值，表示无返回 | — |

**值类型**（`int`、`string`、`float`）赋值和传参时复制值。
**引用类型**（`mapping`、`function`、`object`、数组、`buffer`、`class`/`struct`）赋值和传参时共享引用。

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

当前构建未启用 `ARRAY_RESERVED_WORD`，因此不要使用旧式 `int array nums` 写法。

### 3.3 Class 类型

```c
class Person {
    string name;
    int level;
    float *scores;
}

// 当前构建同时启用 struct；它与 class 使用同一套语法和运行时表示
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

修饰符可组合使用：

```c
nosave private int internalCounter;
public varargs mixed query(string key, mixed def) { ... }
```

当前构建启用了 `SENSIBLE_MODIFIERS`：`static` 不是关键字，使用 `private` 或 `nosave` 明确表达意图；`virtual` 也不是 LPC 修饰符。`varargs` 只能修饰函数，不能用于 `private:` 这类全局修饰符标签。

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

这是语言能力；本仓库的贡献规范仍要求局部变量集中在函数开头，提交代码时遵循 `AGENTS.md`。

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
| 最低 | `=` `+=` `-=` 等赋值 | 右结合 |
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
| 最高 | `!` `~` 一元 `-` | — |

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
- `ref` 只能原地修改数组和 buffer 的元素。对字符串的 `ref` 遍历不会修改原字符串。
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

默认值使用函数指针语法 `: (: expr :)`，在**调用时**在**调用者上下文**中求值。

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
foo()                   // 本对象或全局函数
::foo()                 // 绕过继承，直接调用本对象的版本
Parent::foo()           // 调用指定继承类的方法
int::to_string(42)      // 内置类型方法
```

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

| 类型 | 语法 | 参数求值时机 |
|------|------|-------------|
| 本地函数 | `(: func :)` 或 `func` | 创建时 |
| efun 指针 | `(: efun :)` | 创建时 |
| call_other | `(: object, "method" :)` | 创建时 |
| 表达式函数 | `(: $1 + $2 :)` | 使用时 |
| 匿名函数 | `function(type arg) { ... }` | 使用时 |

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
// 调用指定继承类的方法
Object::reset();

// 调用当前对象中被覆盖的版本
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

`class` 是共享引用的具名字段结构，不支持继承。赋值不会复制实例，对任一别名修改字段都会影响同一个实例；`struct` 是当前构建启用的同义关键字。

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

文件名可由宏产生：`#include CONFIG`

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

### 16.6 预定义宏

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
string err = catch(some_dangerous_call());
if (err) {
    write("Error: " + err + "\n");
}

// 捕获代码块中的错误
string err = catch {
    load_object("/dangerous");
    do_something();
};
```

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

以下仅列常用 efun。准确签名以 `fluffos/src/packages/*.spec` 为准；数据库、PCRE、加密、数学等功能还取决于对应功能包是否编译。

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
call_out(func, delay)           // 延时调用
remove_call_out(id)             // 取消延时调用
```

### 18.11 函数指针操作

```c
evaluate(func, args...)         // 调用函数指针
function_owner(func)            // 函数所属对象
map_array(arr, func)            // 用函数映射数组
filter_array(arr, func)         // 用函数过滤数组
```

---

## 19. 编码风格建议

### 19.1 格式

- **编码与换行**：UTF-8、LF，保留文件末尾换行并移除行尾空白
- **缩进**：4 空格，不用 Tab
- **花括号**：遵循相邻代码；本仓库 LPC 通常将函数和控制块的左花括号单独成行

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

始终在文件开头使用：

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

## 附录：快速参考卡

### 类型速查
```
int float string object mapping function buffer mixed void
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

> 本指南已按上述 FluffOS 基线的编译器语法、词法配置、efun 规范和回归测试核对。驱动升级后应重新核对并更新基线。
