# EMOTE_D - 表情系统守护进程

## 概述
EMOTE_D 是MUD游戏的表情系统守护进程，负责管理和管理游戏内的表情(emote)系统。它提供了一个全面的表情数据库，支持玩家、NPC之间的表情交互，以及频道和跨MUD的表情通信。

## 核心功能

### 表情定义存储
- **表情模式管理**：维护表情模式及其关联消息的数据库
- **消息处理**：处理表情命令并为不同观众生成适当消息
- **目标处理**：管理针对特定玩家或NPC的表情
- **频道集成**：支持通信频道中的表情
- **跨MUD通信**：处理来自远程MUD的表情

### 表情系统特性
- **基于模式匹配**：支持简单("smile")和参数化("smile $")模式
- **观众特定消息**：为表情发出者、目标和观察者提供不同消息
- **自我定位支持**：针对自我的表情的特殊处理
- **频道集成**：支持频道通信中的表情
- **跨MUD兼容性**：处理来自远程MUD的表情

## 主要接口函数

### 主要执行函数
```lpc
mixed do_emote(object me, string verb, string arg, int channel_emote, string who, string default_color)
```
- **用途**：表情的主要执行函数
- **参数**：
  - `me`：执行表情的玩家对象
  - `verb`：表情命令（如"smile"、"laugh"）
  - `arg`：可选目标参数（玩家名称）
  - `channel_emote`：频道表情布尔标志
  - `who`：特殊情况的覆盖名称
  - `default_color`：消息颜色代码

### 表情定义管理
```lpc
void set_emote(string pattern, mapping def, int raw)
```
- **用途**：创建或更新表情定义
- **参数**：
  - `pattern`：表情模式（如"smile"或"smile $")
  - `def`：包含消息定义的映射
  - `raw`：布尔标志跳过自动保存

```lpc
mapping query_emote(string pattern)
```
- **用途**：通过模式检索表情定义
- **参数**：`pattern` - 要查询的表情模式
- **返回**：包含表情消息的映射，如未找到返回0

```lpc
void delete_emote(string pattern)
```
- **用途**：从数据库中删除表情
- **参数**：`pattern` - 要删除的表情模式

### 查询函数
```lpc
string *query_all_emote()
```
- **用途**：列出所有可用表情
- **返回**：所有表情模式的数组

## 数据结构与存储机制

### 核心数据结构
```lpc
mapping emote;  // 主表情数据库
```

### 表情定义结构
每个表情模式映射到一个包含以下消息类型的映射：
- **myself**：表情发出者看到的消息
- **target**：目标看到的消息（适用时）
- **others**：观察者看到的消息
- **myself_self**：针对自我的表情消息
- **others_self**：自我表情的观察者消息
- **myself_target**：表情发出者针对目标的消息
- **others_target**：针对目标表情的观察者消息

### 消息替换变量
- `$N`：表情发出者名称
- `$n`：目标名称
- `$P`：表情发出者代词
- `$p`：目标代词
- `$C`：表情发出者亲近称呼
- `$c`：目标亲近称呼
- `$R`：目标尊称
- `$r`：目标蔑称
- `$S`：表情发出者自称
- `$s`：表情发出者自蔑称

### 存储优化
守护进程使用基于数组的存储系统来优化内存使用：
```lpc
#define UPDATE_TIME         0
#define MSG_MYSELF          1
#define MSG_OTHERS          2
#define MSG_MYSELF_SELF     3
#define MSG_OTHERS_SELF     4
#define MSG_MYSELF_TARGET   5
#define MSG_TARGET          6
#define MSG_OTHERS_TARGET   7
#define UPDATE_USER         8
```

## 配置与初始化

### 持久化
- **保存文件**：`/data/emoted`（由 `query_save_file()` 定义）
- **自动保存**：默认启用（除非 `raw` 参数为 true）
- **恢复**：守护进程创建时自动加载

### 依赖关系
- **F_SAVE**：提供保存/恢复功能
- **F_DBASE**：提供数据库操作
- **RANK_D**：处理尊称/蔑称系统
- **CHANNEL_D**：管理频道通信

### 环境变量
- `env/no_emote`：玩家设置阻止表情
- `env/can_emote`：玩家设置允许特定表情
- `doing`：玩家活动状态（影响表情限制）

## 使用示例

### 基本表情使用
```lpc
// 玩家输入：smile
EMOTE_D->do_emote(me, "smile", "", 0, 0, CYN);

// 玩家输入：smile alice
EMOTE_D->do_emote(me, "smile", "alice", 0, 0, CYN);
```

### 频道表情
```lpc
// 基于频道的表情
EMOTE_D->do_emote(me, "wave", "everyone", 1, 0, "");
```

### 跨MUD表情
```lpc
// 远程MUD表情（channel_emote = 4）
EMOTE_D->do_emote(me, "bow", "mud=RemoteMUD name=Bob id=player age=25 gender=male respect=Sir rude=you", 4, "RemoteMUD", "");
```

### 创建/修改表情
```lpc
// 定义新表情
mapping def = ([
    "myself": "你微笑了一下。",
    "others": "$N微笑了一下。",
    "myself_target": "你对$n微笑了一下。",
    "target": "$N对你微笑了一下。",
    "others_target": "$N对$n微笑了一下。"
]);
EMOTE_D->set_emote("smile", def, 0);
```

## 系统集成

### 命令系统集成
- 命令如 `/cmds/std/emote.c` 使用基本表情功能
- `/cmds/std/femote.c` 提供表情搜索功能
- 管理命令（`/cmds/imm/edemote.c` 等）管理表情定义

### 频道系统
- 与 `CHANNEL_D` 集成用于基于频道的表情
- 处理跨MUD表情通信

### 玩家限制
- 尊重玩家 `env/no_emote` 设置
- 支持 `env/can_emote` 用于选择性权限
- 与玩家可见性和封禁系统集成

### 战斗/活动系统
- 检查玩家 `doing` 状态（例如"scheme"活动）
- 应用适当的限制和消耗

### 排名系统
- 使用 `RANK_D` 生成尊称/蔑称
- 提供年龄适当的代词和称谓

## 关键特性

1. **基于模式匹配**：支持简单("smile")和参数化("smile $")模式
2. **观众特定消息**：为表情发出者、目标和观察者提供不同消息
3. **自我定位支持**：针对自我的表情的特殊处理
4. **频道集成**：支持频道通信中的表情
5. **跨MUD兼容性**：处理来自远程MUD的表情
6. **权限系统**：尊重玩家隐私设置
7. **内存优化**：基于数组的存储以提高效率
8. **持久化**：自动保存/加载功能

EMOTE_D 守护进程作为全面的表情系统，增强了MUD环境中的玩家互动和角色扮演能力。它提供了一个灵活且可扩展的表情框架，支持复杂的社交互动和跨MUD通信。