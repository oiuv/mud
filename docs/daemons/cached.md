# CACHED_D - 玩家数据缓存守护进程

## 概述
CACHED_D 是MUD游戏的玩家数据缓存守护进程，负责将玩家数据缓存到SQLite数据库中，为网页接口、全服排行等外部系统提供高效的数据访问。它提供了完整的CRUD（创建、读取、更新、删除）操作接口。

## 核心功能

### 数据缓存
- **SQLite存储**：使用SQLite数据库存储玩家数据
- **实时同步**：玩家数据变更时实时更新缓存
- **标准化字段**：统一的数据字段结构
- **排名支持**：支持按任意字段排序查询

### 数据库操作
- **数据插入**：新玩家数据自动插入缓存
- **数据更新**：玩家数据变更时实时更新
- **数据删除**：玩家数据清理时同步删除
- **数据查询**：支持排序和条件查询

## 数据库结构

### 表结构
```sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(10) PRIMARY KEY NOT NULL,
    `name` VARCHAR(10) NOT NULL,
    `title` VARCHAR(50) DEFAULT NULL,
    `master` VARCHAR(10) DEFAULT NULL,
    `mobile` INTEGER DEFAULT NULL,
    `age` INTEGER DEFAULT NULL,
    `qi` INTEGER DEFAULT NULL,
    `jing` INTEGER DEFAULT NULL,
    `neili` INTEGER DEFAULT NULL,
    `jingli` INTEGER DEFAULT NULL,
    `combat_exp` INTEGER DEFAULT NULL,
    `kill` INTEGER DEFAULT NULL,
    `die` INTEGER DEFAULT NULL,
    `updated_at` INTEGER DEFAULT NULL
)
```

### 字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(10) | 玩家ID（主键） |
| name | VARCHAR(10) | 玩家名称 |
| title | VARCHAR(50) | 玩家称号 |
| master | VARCHAR(10) | 师父名称 |
| mobile | INTEGER | 手机号 |
| age | INTEGER | 年龄 |
| qi | INTEGER | 最大气血 |
| jing | INTEGER | 最大精神 |
| neili | INTEGER | 最大内力 |
| jingli | INTEGER | 最大精力 |
| combat_exp | INTEGER | 战斗经验 |
| kill | INTEGER | 总击杀数 |
| die | INTEGER | 死亡次数 |
| updated_at | INTEGER | 更新时间戳 |

## 主要接口函数

### 数据库初始化
```lpc
mixed init_db()
// 功能：初始化数据库和表结构
// 操作：
// - 删除已存在的users表
// - 创建新的users表
// - 如失败则禁用缓存功能
```

### 数据插入
```lpc
mixed insert(object user, int last_touched)

// 参数：
// user - 玩家对象
// last_touched - 最后更新时间戳

// 数据提取：
// - 从玩家对象获取所有字段数据
// - 计算击杀数（MKS + PKS）
// - 提取师父名称
// - 插入到数据库
```

### 数据更新
```lpc
mixed update(object user)

// 功能：更新现有玩家数据
// 操作：
// - 根据玩家ID定位记录
// - 更新所有字段数据
// - 设置当前时间为更新时间
```

### 数据删除
```lpc
mixed delete(object user)

// 功能：删除玩家缓存数据
// 操作：
// - 根据玩家ID删除记录
```

### 数据查询
```lpc
varargs mixed get(string column, string order)

// 参数：
// column - 排序字段（默认：combat_exp）
// order - 排序方式（默认：desc）

// 功能：
// - 按指定字段排序查询
// - 支持升序和降序
// - 返回完整数据列表
```

## 数据映射关系

### 玩家数据映射
```lpc
// 从玩家对象提取数据
mapping my = user->query_entire_dbase();

// 字段映射：
// id         -> my["id"]
// name       -> my["name"]
// title      -> my["title"]
// master     -> my["family"]["master_name"]（如果存在）
// mobile     -> my["mobile"]
// age        -> my["age"]
// qi         -> my["max_qi"]
// jing       -> my["max_jing"]
// neili      -> my["max_neili"]
// jingli     -> my["max_jingli"]
// combat_exp -> my["combat_exp"]
// kill       -> my["combat"]["MKS"] + my["combat"]["PKS"]
// die        -> my["combat"]["dietimes"]
```

## 系统配置

### 编译条件
```lpc
#ifdef __USE_SQLITE3__
// 条件编译：仅在启用SQLite3时编译
```

### 数据库配置
```lpc
// 数据库连接
nosave object db;

// 数据库文件路径：/data/db.sqlite
void create()
{
    db = new (CORE_DB, "", "/data/db.sqlite", "", __USE_SQLITE3__);
}
```

### 错误处理
```lpc
// 初始化失败处理
if (stringp(res))
{
    env("CACHE_DATA", 0);  // 禁用缓存功能
}
```

## 使用示例

### 初始化数据库
```lpc
// 系统启动时初始化
mixed result = CACHED_D->init_db();
if (stringp(result))
    write("缓存数据库初始化失败：" + result);
```

### 插入玩家数据
```lpc
// 新玩家注册时
object player = find_player("testuser");
CACHED_D->insert(player, time());
```

### 更新玩家数据
```lpc
// 玩家数据变更时
object player = find_player("testuser");
CACHED_D->update(player);
```

### 查询排行榜
```lpc
// 获取经验排行榜
mixed rank_list = CACHED_D->get("combat_exp", "desc");

// 获取击杀排行榜
mixed kill_rank = CACHED_D->get("kill", "desc");
```

### 删除玩家数据
```lpc
// 玩家删除时
object player = find_player("testuser");
CACHED_D->delete(player);
```

## 性能优化

### 索引设计
- **主键索引**：id字段作为主键
- **排序字段**：支持按任意字段排序
- **时间戳**：updated_at用于增量更新

### 批量操作
- **单次操作**：每个函数处理单个玩家
- **异步处理**：可配合定时任务批量更新

## 外部接口

### 网页集成
- **数据格式**：标准JSON格式
- **访问方式**：通过SQLite直接查询
- **实时性**：数据更新后立即可用

### 排行系统
- **全服排行**：支持任意字段排序
- **实时更新**：玩家数据变更时同步
- **分页查询**：支持大数据量分页

## 相关文件
- `/adm/daemons/cached.c` - 缓存守护进程
- `/data/db.sqlite` - SQLite数据库文件
- 依赖：CORE_DB类（SQLite3封装）

## 注意事项
- 仅在启用SQLite3时生效（__USE_SQLITE3__）
- 数据库文件路径固定为/data/db.sqlite
- 表结构变更需要重新初始化
- 数据同步为实时更新，无延迟
- 支持通配符查询和复杂条件筛选

CACHED_D 为MUD游戏提供了高效的数据缓存和接口服务，使外部系统能够实时访问玩家数据，是游戏数据开放的重要组件。'"file_path":"C:\msys64\home\Administrator\mud\docs\daemons\cached.md"}'}<function_calls>```markdown
# CACHED_D - 玩家数据缓存守护进程

## 概述
CACHED_D 是MUD游戏的玩家数据缓存守护进程，负责将玩家数据缓存到SQLite数据库中，为网页接口、全服排行等外部系统提供高效的数据访问。它提供了完整的CRUD（创建、读取、更新、删除）操作接口。

## 核心功能

### 数据缓存
- **SQLite存储**：使用SQLite数据库存储玩家数据
- **实时同步**：玩家数据变更时实时更新缓存
- **标准化字段**：统一的数据字段结构
- **排名支持**：支持按任意字段排序查询

### 数据库操作
- **数据插入**：新玩家数据自动插入缓存
- **数据更新**：玩家数据变更时实时更新
- **数据删除**：玩家数据清理时同步删除
- **数据查询**：支持排序和条件查询

## 数据库结构

### 表结构
```sql
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(10) PRIMARY KEY NOT NULL,
    `name` VARCHAR(10) NOT NULL,
    `title` VARCHAR(50) DEFAULT NULL,
    `master` VARCHAR(10) DEFAULT NULL,
    `mobile` INTEGER DEFAULT NULL,
    `age` INTEGER DEFAULT NULL,
    `qi` INTEGER DEFAULT NULL,
    `jing` INTEGER DEFAULT NULL,
    `neili` INTEGER DEFAULT NULL,
    `jingli` INTEGER DEFAULT NULL,
    `combat_exp` INTEGER DEFAULT NULL,
    `kill` INTEGER DEFAULT NULL,
    `die` INTEGER DEFAULT NULL,
    `updated_at` INTEGER DEFAULT NULL
)
```

### 字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | VARCHAR(10) | 玩家ID（主键） |
| name | VARCHAR(10) | 玩家名称 |
| title | VARCHAR(50) | 玩家称号 |
| master | VARCHAR(10) | 师父名称 |
| mobile | INTEGER | 手机号 |
| age | INTEGER | 年龄 |
| qi | INTEGER | 最大气血 |
| jing | INTEGER | 最大精神 |
| neili | INTEGER | 最大内力 |
| jingli | INTEGER | 最大精力 |
| combat_exp | INTEGER | 战斗经验 |
| kill | INTEGER | 总击杀数 |
| die | INTEGER | 死亡次数 |
| updated_at | INTEGER | 更新时间戳 |

## 主要接口函数

### 数据库初始化
```lpc
mixed init_db()
// 功能：初始化数据库和表结构
// 操作：
// - 删除已存在的users表
// - 创建新的users表
// - 如失败则禁用缓存功能
```

### 数据插入
```lpc
mixed insert(object user, int last_touched)

// 参数：
// user - 玩家对象
// last_touched - 最后更新时间戳

// 数据提取：
// - 从玩家对象获取所有字段数据
// - 计算击杀数（MKS + PKS）
// - 提取师父名称
// - 插入到数据库
```

### 数据更新
```lpc
mixed update(object user)

// 功能：更新现有玩家数据
// 操作：
// - 根据玩家ID定位记录
// - 更新所有字段数据
// - 设置当前时间为更新时间
```

### 数据删除
```lpc
mixed delete(object user)

// 功能：删除玩家缓存数据
// 操作：
// - 根据玩家ID删除记录
```

### 数据查询
```lpc
varargs mixed get(string column, string order)

// 参数：
// column - 排序字段（默认：combat_exp）
// order - 排序方式（默认：desc）

// 功能：
// - 按指定字段排序查询
// - 支持升序和降序
// - 返回完整数据列表
```

## 数据映射关系

### 玩家数据映射
```lpc
// 从玩家对象提取数据
mapping my = user->query_entire_dbase();

// 字段映射：
// id         -> my["id"]
// name       -> my["name"]
// title      -> my["title"]
// master     -> my["family"]["master_name"]（如果存在）
// mobile     -> my["mobile"]
// age        -> my["age"]
// qi         -> my["max_qi"]
// jing       -> my["max_jing"]
// neili      -> my["max_neili"]
// jingli     -> my["max_jingli"]
// combat_exp -> my["combat_exp"]
// kill       -> my["combat"]["MKS"] + my["combat"]["PKS"]
// die        -> my["combat"]["dietimes"]
```

## 系统配置

### 编译条件
```lpc
#ifdef __USE_SQLITE3__
// 条件编译：仅在启用SQLite3时编译
```

### 数据库配置
```lpc
// 数据库连接
nosave object db;

// 数据库文件路径：/data/db.sqlite
void create()
{
    db = new (CORE_DB, "", "/data/db.sqlite", "", __USE_SQLITE3__);
}
```

### 错误处理
```lpc
// 初始化失败处理
if (stringp(res))
{
    env("CACHE_DATA", 0);  // 禁用缓存功能
}
```

## 使用示例

### 初始化数据库
```lpc
// 系统启动时初始化
mixed result = CACHED_D->init_db();
if (stringp(result))
    write("缓存数据库初始化失败：" + result);
```

### 插入玩家数据
```lpc
// 新玩家注册时
object player = find_player("testuser");
CACHED_D->insert(player, time());
```

### 更新玩家数据
```lpc
// 玩家数据变更时
object player = find_player("testuser");
CACHED_D->update(player);
```

### 查询排行榜
```lpc
// 获取经验排行榜
mixed rank_list = CACHED_D->get("combat_exp", "desc");

// 获取击杀排行榜
mixed kill_rank = CACHED_D->get("kill", "desc");
```

### 删除玩家数据
```lpc
// 玩家删除时
object player = find_player("testuser");
CACHED_D->delete(player);
```

## 性能优化

### 索引设计
- **主键索引**：id字段作为主键
- **排序字段**：支持按任意字段排序
- **时间戳**：updated_at用于增量更新

### 批量操作
- **单次操作**：每个函数处理单个玩家
- **异步处理**：可配合定时任务批量更新

## 外部接口

### 网页集成
- **数据格式**：标准JSON格式
- **访问方式**：通过SQLite直接查询
- **实时性**：数据更新后立即可用

### 排行系统
- **全服排行**：支持任意字段排序
- **实时更新**：玩家数据变更时同步
- **分页查询**：支持大数据量分页

## 相关文件
- `/adm/daemons/cached.c` - 缓存守护进程
- `/data/db.sqlite` - SQLite数据库文件
- 依赖：CORE_DB类（SQLite3封装）

## 注意事项
- 仅在启用SQLite3时生效（__USE_SQLITE3__）
- 数据库文件路径固定为/data/db.sqlite
- 表结构变更需要重新初始化
- 数据同步为实时更新，无延迟
- 支持通配符查询和复杂条件筛选

CACHED_D 为MUD游戏提供了高效的数据缓存和接口服务，使外部系统能够实时访问玩家数据，是游戏数据开放的重要组件。'