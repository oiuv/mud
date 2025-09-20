# CONFIG_D - 配置管理守护进程

## 概述
CONFIG_D 是MUD游戏的配置管理守护进程，负责从文本配置文件 `/adm/etc/config` 中加载和管理游戏配置参数。它提供类型安全的配置参数访问接口，支持注释和系统禁用参数。

## 核心功能

### 配置加载与解析
- **文本配置解析**：从 `/adm/etc/config` 文件读取配置
- **类型安全访问**：提供整数和字符串类型的安全访问接口
- **注释支持**：支持配置参数的注释说明
- **系统禁用**：支持被系统注释禁用的参数
- **持久化缓存**：配置加载后缓存到内存中

### 配置管理
- **集中管理**：所有游戏参数集中在一个配置文件中
- **实时访问**：配置参数实时可查询
- **错误处理**：语法错误日志记录
- **Windows兼容**：自动处理Windows换行符

## 主要接口函数

### 配置加载
```lpc
void load_config()
```
- **功能**：解析配置文件并加载参数到内存
- **行为**：
  - 读取 `/adm/etc/config` 文件内容
  - 按行处理配置，支持Windows换行符处理
  - 支持注释行（以 `#` 开头）
  - 支持系统禁用参数（以 `&` 开头）
  - 提取行内注释（参数后的 `#` 内容）
  - 解析 `参数名 : 值` 格式
  - 错误日志记录到 `/log/config`

### 配置查询
```lpc
int query_int(string index)
```
- **参数**：`index` - 配置参数名称
- **返回**：整数值（转换失败返回0）
- **功能**：获取整数配置值并自动类型转换

```lpc
string query_string(string index)
```
- **参数**：`index` - 配置参数名称
- **返回**：字符串值（未找到返回"unknow"）
- **功能**：获取字符串配置值

### 元数据查询
```lpc
string query_remember(string index)
```
- **参数**：`index` - 配置参数名称
- **返回**：配置参数的注释文本（如果有）

```lpc
string query_affix(string index)
```
- **参数**：`index` - 配置参数名称
- **返回**：配置参数的附加注释文本（如果有）

```lpc
string query_config_file_name()
```
- **返回**：配置文件路径 "/adm/etc/config"

## 数据结构与存储

### 存储后端
守护进程继承自 `F_DBASE` 提供键值存储系统：
- **主存储**：使用继承自 `F_DBASE` 的 `dbase` 映射
- **临时存储**：使用 `tmp_dbase` 存储元数据（注释、附加信息）
- **访问方法**：`set()`, `query()`, `set_temp()`, `query_temp()`

### 配置文件格式
```
# 注释行 (以#开头)
参数名 : 值

& 系统注释的参数 (以&开头，表示被系统禁用)
```

### 数据组织
- **配置值**：直接存储在 `dbase` 映射中
- **注释**：存储在 `tmp_dbase` 中，前缀为 "remember/"
- **附加信息**：存储在 `tmp_dbase` 中，前缀为 "affix/"

## 配置与初始化

### 文件位置
- **配置文件**：`/adm/etc/config`（由 `CONFIG_DIR "config"` 定义）
- **CONFIG_DIR**：`/adm/etc/`（在 `globals.h` 中定义）

### 初始化过程
1. **守护进程创建**：`create()` 函数设置有效用户ID并调用 `load_config()`
2. **文件读取**：将整个配置文件读入内存
3. **行处理**：按以下规则处理每一行：
   - 移除Windows兼容性换行符
   - 去除前后空白字符
   - 处理注释行（以 `#` 开头）
   - 处理系统禁用参数（以 `&` 开头）
   - 提取参数行后的行内注释
   - 使用 `sscanf()` 解析 `参数 : 值` 格式

### 错误处理
- **语法错误**：记录到 `/log/config` 文件，包含问题行内容
- **缺失文件**：优雅处理缺失的配置文件
- **类型转换**：安全的整数转换，失败时回退到0

## 使用示例

### 基本配置访问
```lpc
// 获取整数配置值
int max_users = CONFIG_D->query_int("max users");

// 获取字符串配置值
string mud_name = CONFIG_D->query_string("internet mud name");

// 获取带注释的配置
string comment = CONFIG_D->query_remember("max users");
```

### 配置文件示例
```config
# 本地能够接纳的最大用户数目
max users : 500

# INTERNET互连网络中MUD的名字
internet mud name : yhmud

# 系统注释的示例（被禁用）
& wiz lock : 0

# 带行内注释的参数
mudlist1 : 118.190.104.241 5567     #炎黄群侠传
```

### 代码库集成示例
```lpc
// 来自 logind.c - 检查是否需要玩家重建
if (CONFIG_D->query_int("ask_recreate"))

// 来自 cpud.c - CPU监控配置
if (CONFIG_D->query_int("cpu_check_period") < 2)
    check_period = CONFIG_D->query_int("cpu_check_period");
```

## 系统集成

### 主对象集成
主对象 (`/adm/single/master.c`) 检查 `CONFIG_D` 和 `VERSION_D` 的存在，以确定MUD是否应在发布模式或开发模式下运行。

### 系统范围使用
配置守护进程被MUD系统的各种守护进程使用：
- **logind.c**：玩家重建策略
- **cpud.c**：CPU监控设置
- **网络服务**：各种网络配置参数

### 关键集成点
- **全局访问**：通过 `CONFIG_D` 宏系统范围可用
- **类型安全**：提供 `query_int()` 和 `query_string()` 实现安全类型访问
- **缓存**：自动缓存转换后的值以提高性能
- **元数据**：保留配置注释和系统管理功能

### 配置类别（来自示例配置）
- **网络设置**：服务器地址、端口、MUD列表
- **系统限制**：最大用户数、巫师锁定级别
- **通信**：SMTP服务器配置
- **游戏设置**：区域信息、编码、重建策略

CONFIG_D 守护进程作为关键基础设施组件，提供集中化、类型安全的配置管理，支持文档和系统管理功能。它将所有游戏配置集中管理，确保配置的一致性和可维护性。