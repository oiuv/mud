# EVENT_D - 事件调度守护进程

## 概述
EVENT_D 是MUD游戏的事件调度守护进程，负责管理和调度基于游戏时间的各种事件。它作为中央事件调度系统，收集和管理来自 `/adm/daemons/event/` 目录的所有游戏事件，并在特定的游戏时间触发它们。

## 核心功能

### 事件收集与管理
- **事件收集**：从 `/adm/daemons/event/` 目录收集所有游戏事件
- **事件调度**：在特定的游戏时间（年、月、日、时）调度事件触发
- **时间监控**：监控游戏时间并在预定时间到达时自动触发事件
- **集中接口**：为其他游戏对象提供注册未来事件的集中接口

### 时间系统
守护进程基于游戏时间（非真实时间）运行，心跳间隔为60真实秒代表1游戏小时。

## 主要接口函数

### 核心调度函数
```lpc
mixed at_when(int year, int month, int day, int hour, mixed para)
```
- **用途**：在绝对游戏时间安排事件
- **参数**：
  - `year`：游戏年份（4位数格式）
  - `month`：游戏月份（0-11，其中0 = 一月）
  - `day`：游戏日期（1-31）
  - `hour`：游戏小时（0-23）
  - `para`：传递给事件触发函数的自定义参数数据
- **安全性**：只有具有 ROOT_UID 的对象才能注册事件

```lpc
mixed at_after(int year, int month, int day, int hour, mixed para)
```
- **用途**：相对于当前游戏时间安排事件
- **参数**：与 `at_when()` 相同，但具有特殊的负值处理：
  - 负值表示绝对时间（例如，`day = -5` 表示月份的第5天）
  - 正值添加到当前游戏时间

### 查询函数
```lpc
string *query_all_event()
```
- **返回**：`string*` - 所有事件文件名的数组（不含.c扩展名）

```lpc
mapping query_event_list()
```
- **返回**：`mapping` - 当前待处理事件及其预定时间

### 事件生命周期函数
```lpc
void create_event()
```
（在事件对象上调用）
- **用途**：初始化并安排事件
- **调用者**：守护进程启动时的 `collect_all_event()`

```lpc
void trigger_event(mixed para)
```
（在事件对象上调用）
- **用途**：执行预定的事件
- **调用者**：当事件时间到达时的 `heart_beat()`

## 数据结构与存储机制

### 核心数据结构
```lpc
nosave string *event_name;      // 事件文件名数组
nosave mapping event_list;      // 待处理事件映射
```

### 事件列表格式
```lpc
event_list = ([
    "事件对象路径": ({年份, 月份, 日期, 小时, 参数})
]);
```

### 时间编码系统
事件使用压缩的时间格式进行高效比较：
```lpc
time_value = 年份 * 1000000 + 月份 * 10000 + 日期 * 100 + 小时;
```

### 事件目录结构
事件存储在 `/adm/daemons/event/` 目录中，每种事件类型都有单独的 `.c` 文件。

## 配置与初始化

### 启动序列
1. **设置系统身份**：`seteuid(ROOT_UID)`
2. **宣布启动**：通过 CHANNEL_D 广播系统消息
3. **扫描事件目录**：从 `/adm/daemons/event/` 加载所有 `.c` 文件
4. **清理现有事件**：销毁任何已加载的事件对象
5. **初始化数据结构**：重置 `event_list` 映射
6. **延迟收集**：15秒后安排 `collect_all_event()` 调用
7. **启动心跳**：设置心跳间隔为60秒（1游戏小时）

### 事件收集过程
`collect_all_event()` 函数：
- 遍历事件目录中的所有事件文件
- 在每个事件对象上调用 `create_event()` 以初始化调度

### 心跳监控
- **频率**：每60真实秒（1游戏小时）
- **过程**：
  - 通过 `NATURE_D->query_localtime()` 查询当前游戏时间
  - 检查所有待处理事件与当前时间的对比
  - 触发时间已到达的事件
  - 从待处理列表中移除已触发的事件
  - 将任何错误记录到 `/log/static/event`

## 使用示例

### 基本事件注册
```lpc
// 安排明天早上5点的事件
EVENT_D->at_after(0, 0, 1, -5, "bonus_event");

// 安排特定日期/时间的事件
EVENT_D->at_when(2024, 0, 15, 14, "special_event_data");
```

### 事件对象实现
```lpc
// /adm/daemons/event/sunrise.c
void create_event() {
    // 安排明天日出时（早上5点）
    EVENT_D->at_after(0, 0, 1, -5);
}

void trigger_event(mixed para) {
    // 事件执行逻辑
    object *players = users();
    foreach (object player in players) {
        tell_object(player, HIR "太阳从东方升起，新的一天开始了！\n" NOR);
    }
}
```

### 基于时间的事件示例
```lpc
// 安排下个月15号下午3点
EVENT_D->at_after(0, 1, 15, 15, "festival_data");

// 安排绝对时间：2025年1月1日午夜
EVENT_D->at_when(2025, 0, 1, 0, "new_year_event");
```

## 系统集成

### 依赖关系
- **NATURE_D**：通过 `query_localtime()` 提供游戏时间查询
- **CHANNEL_D**：系统公告功能
- **TIME_D**：底层时间管理（通过 NATURE_D）

### 安全集成
- **ROOT_UID 验证**：只有根级对象才能注册事件
- **前一个对象验证**：确保合法的事件注册
- **错误日志记录**：全面错误跟踪到 `/log/static/event`

### 系统中的事件示例
当前事件实现包括：
- **emei.c**：峨眉山日出事件，带有佛教技能奖励
- **huanggs.c**：黄果树瀑布事件
- **qiantang.c**：钱塘江潮汐事件
- **tianchi.c**：天池（天池）事件
- **wuliang.c**：无量山事件

### 错误处理
- **try-catch 保护**：事件触发包装在错误处理中
- **日志记录**：失败的事件与时间戳和错误详情一起记录
- **优雅降级**：个别事件失败不会影响系统操作

EVENT_D 提供了一个强大的、基于时间的调度系统，与游戏的时间管理无缝集成，并支持与游戏世界时间进程相关的丰富、预定的游戏体验。它使游戏世界能够根据时间和季节变化自动产生动态事件，增强了游戏的沉浸感和真实感。该守护进程是游戏世界时间系统的重要组成部分，确保所有时间相关的事件都能准确、及时地触发。,