# NATURE_D - 自然环境守护进程

## 概述
NATURE_D 是MUD游戏的自然环境守护进程，负责管理游戏的自然环境系统，包括日/夜循环管理、季节性天气系统、环境效果以及基于当前时间和天气的动态房间描述。

## 核心功能

### 日/夜循环管理
- **时间阶段控制**：控制游戏日内的时间阶段进展（午夜、黎明、日出、早晨、正午、下午、傍晚、夜晚）
- **阶段转换**：使用 `call_out()` 进行精确的阶段转换调度
- **消息广播**：向户外玩家广播时间阶段变化消息
- **房间描述更新**：根据当前时间阶段动态更新房间描述

### 季节性天气系统
- **季节性天气模式**：根据游戏日历实现季节性天气模式
- **天气配置文件**：动态加载基于季节的不同天气配置
- **天气效果**：管理天气对玩家的环境效果

### 环境效果管理
- **季节性疾病**：管理对玩家的季节性环境影响，包括季节性疾病
- **温度效果**：根据季节和天气管理温度相关效果
- **环境互动**：支持基于环境的游戏机制

## 主要接口函数

### 时间查询函数
```lpc
varargs mixed *query_localtime(int t)
```
- **用途**：在真实时间和游戏时间之间转换
- **参数**：可选时间戳 `t`（如未提供则使用当前时间）
- **返回**：游戏时间尺度的时间组件

```lpc
varargs int query_minute(int t)
varargs int query_hour(int t)
varargs int query_day(int t)
varargs int query_month(int t)
varargs int query_year(int t)
```
- **用途**：获取游戏时间的各个组成部分
- **参数**：可选时间戳 `t`
- **返回**：游戏时间的分钟、小时、日期、月份、年份

### 环境描述函数
```lpc
string outdoor_room_description()
```
- **用途**：为户外房间生成大气描述
- **返回**：带当前时间/天气条件的颜色代码格式化字符串

```lpc
string game_time()
```
- **用途**：获取格式化的游戏时间
- **返回**：游戏时间的格式化字符串

### 日阶段管理
```lpc
void select_day_phase()
void update_day_phase()
```
- **用途**：内部函数管理时间阶段转换
- **自动调用**：使用 `call_out()` 进行预定阶段更改

## 数据结构与存储机制

### 主要数据结构
```lpc
nosave mapping *day_phase
```
- **类型**：包含时间阶段定义的映射数组
- **每个阶段的结构**：
  - `hour`：开始小时（0-23）
  - `time_msg`：阶段开始时向户外玩家广播的消息
  - `desc_msg`：在此阶段房间查看中使用的描述
  - `event_fun`：阶段转换时调用的可选函数
  - `outcolor`：户外描述的ANSI颜色代码

### 季节性天气文件
守护进程根据季节动态加载不同的天气配置：
- `/adm/etc/nature/day_phase` - 默认天气
- `/adm/etc/nature/spring_rain`、`spring_sun`、`spring_wind`
- `/adm/etc/nature/summer_rain`、`summer_sun`、`summer_wind`
- `/adm/etc/nature/autumn_rain`、`autumn_sun`、`autumn_wind`
- `/adm/etc/nature/winter_rain`、`winter_sun`、`winter_wind`

### 配置文件格式
```
hour:time_msg:desc_msg:event_fun:outcolor
%d:%s:%s:%s:%s
```
后跟每时间阶段的5个字段数据行。

## 配置与初始化

### 系统常量
```lpc
#define REMEMBER_CHAR '#'  // 配置文件中的注释字符
#define GAME_TIME(t) (t - 971000000)  // 游戏时间转换
#define DATE_SCALE 60  // 时间比例因子
```

### 时间常量（来自 localtime.h）
```lpc
LT_SEC, LT_MIN, LT_HOUR, LT_MDAY, LT_MON, LT_YEAR, LT_WDAY
```

### 初始化过程
1. **create()**：从 `/adm/etc/nature/day_phase` 加载默认日阶段
2. **select_day_phase()**：确定当前阶段并安排下一次转换
3. **自动更新**：使用 `call_out()` 进行精确计时

## 使用示例

### 获取当前游戏时间
```lpc
// 获取格式化的游戏时间字符串
string current_time = NATURE_D->game_time();
// 返回："炎黄历XX年春X月X日X时"
```

### 获取户外描述
```lpc
// 获取当前户外大气描述
string desc = NATURE_D->outdoor_room_description();
// 返回带当前时间/天气上下文的彩色描述
```

### 时间组件查询
```lpc
// 获取单个时间组件
int hour = NATURE_D->query_hour();
int month = NATURE_D->query_month();
```

## 系统集成

### 时间守护进程集成
- **TIME_D**：提供核心时间管理服务
- **query_localtime()**：委托给 TIME_D 进行实际时间计算
- **游戏时间比例**：使用 `DATE_SCALE` (60) 将真实时间转换为游戏时间

### 房间系统集成
- **户外房间**：通过 `outdoor_room_description()` 自动接收大气描述
- **消息广播**：向所有户外玩家发送阶段转换消息
- **环境效果**：季节性疾病影响户外玩家

### 事件系统集成
- **阶段事件**：在特定时间调用如 `event_noon()`、`event_midnight()` 等函数
- **季节事件**：触发季节转换和天气变化
- **玩家效果**：根据季节应用如中暑、冻伤等条件

### 健康系统集成
- **季节性疾病**：
  - 春季：咳嗽 (`ill_kesou`)
  - 夏季：中暑 (`ill_zhongshu`)
  - 秋季：感冒 (`ill_shanghan`)
  - 冬季：冻伤 (`ill_dongshang`)
- **环境防护**：考虑来自装备/房间的保暖奖励

## 关键特性

1. **动态天气**：季节性天气模式自动变化
2. **实时更新**：使用 `call_out()` 机制进行精确计时
3. **玩家沉浸**：大气消息和描述增强游戏体验
4. **环境游戏**：天气影响玩家健康和条件
5. **可配置**：所有天气模式存储在外部文本文件中，便于修改

NATURE_D 守护进程在后台持续运行，管理游戏的自然节奏并为玩家提供沉浸式环境体验。它确保游戏世界的时间流逝自然且有意义，通过动态的天气变化和昼夜循环增强游戏的真实感和沉浸感。该守护进程是游戏世界生态系统的核心组件，为所有基于时间和环境的游戏机制提供基础支持。