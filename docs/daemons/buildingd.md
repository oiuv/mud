# BUILDING_D - 建筑物代码生成守护进程

## 概述
BUILDING_D 是MUD游戏的建筑物代码生成守护进程，负责动态生成房间和区域的基础代码模板。它为游戏提供标准化的建筑对象模板，支持快速创建新的房间和区域对象。

## 核心功能

### 代码模板生成
- **房间模板**：生成标准房间对象的LPC代码
- **区域模板**：生成区域对象的LPC代码
- **继承配置**：自动设置正确的继承关系
- **坐标支持**：区域对象支持坐标系统配置

### 模板结构
- **标准化代码**：提供一致的代码结构
- **可定制性**：支持后续手动编辑扩展
- **注释标识**：清晰的代码区域标记
- **继承关系**：预置正确的继承类

## 主要接口函数

### 房间代码生成
```lpc
// 获取房间基础代码模板
string getRoomCode()

// 返回代码结构：
// - 继承BUILD类
// - 包含标准房间框架
// - 预留编辑区域
// - 自动生成注释
```

### 区域代码生成
```lpc
// 获取区域代码模板
string getAreaCode(int x, int y)

// 参数：
// x - X轴尺寸
// y - Y轴尺寸

// 返回代码结构：
// - 继承AREA_BUILD类
// - 设置默认名称"空地"
// - 配置坐标系统尺寸
// - 包含setup()调用
```

## 代码模板结构

### 房间模板
```lpc
// created by BUILDING_D

inherit BUILD;

// 预留编辑区域
// 用户可在此区域添加自定义内容
```

### 区域模板
```lpc
// created by BUILDING_D

inherit AREA_BUILD;

void create()
{
    set("name", "空地");
    set("x_axis_size", X尺寸);
    set("y_axis_size", Y尺寸);

    // 预留编辑区域
    // 用户可在此区域添加自定义内容

    setup();
}
```

## 使用示例

### 生成房间代码
```lpc
// 获取房间基础代码
string room_code = BUILDING_D->getRoomCode();

// 输出示例：
// // created by BUILDING_D
//
// inherit BUILD;
//
// 预留编辑区域
```

### 生成区域代码
```lpc
// 生成10x15的区域代码
string area_code = BUILDING_D->getAreaCode(10, 15);

// 输出示例：
// // created by BUILDING_D
//
// inherit AREA_BUILD;
//
// void create()
// {
//     set("name", "空地");
//     set("x_axis_size", 10);
//     set("y_axis_size", 15);
//
//     预留编辑区域
//
//     setup();
// }
```

## 模板特性

### 代码结构
- **头部注释**：自动生成创建标识
- **继承声明**：预置正确的继承类
- **标准方法**：包含必要的create()方法
- **坐标配置**：区域模板支持坐标系统

### 可扩展性
- **预留区域**：提供显式的编辑区域
- **标准方法**：预置setup()调用
- **属性设置**：基础属性预置但可覆盖

## 继承类说明

### BUILD类
- **功能**：标准房间基础类
- **提供**：房间基本框架和方法
- **位置**：游戏框架中的房间基类

### AREA_BUILD类
- **功能**：区域建筑基础类
- **提供**：区域坐标系统和基本功能
- **特性**：支持x_axis_size和y_axis_size配置

## 使用场景

### 动态创建房间
```lpc
// 创建新房间文件
void create_new_room(string filename)
{
    string code = BUILDING_D->getRoomCode();
    write_file(filename, code, 1);
}
```

### 动态创建区域
```lpc
// 创建新区域文件
void create_new_area(string filename, int width, int height)
{
    string code = BUILDING_D->getAreaCode(width, height);
    write_file(filename, code, 1);
}
```

## 系统配置

### 权限设置
```lpc
void create() { seteuid(getuid()); }
// 设置有效用户ID，确保代码生成权限
```

### 模板标记
- **创建标记**：所有模板包含"created by BUILDING_D"注释
- **编辑标记**：清晰的编辑区域标识
- **继承标记**：明确的继承类声明

## 代码区域划分

### 房间模板区域
```lpc
////////////////////////
// start ROOM CODE
////////////////////////
// 自动生成的房间代码
////////////////////////
// edit ROOM CODE
////////////////////////
// 用户编辑区域
```

### 区域模板区域
```lpc
////////////////////////
// start AREA CODE
////////////////////////
// 自动生成的区域代码
// 包含坐标配置
////////////////////////
// edit AREA CODE
////////////////////////
// 用户编辑区域
```

## 相关文件
- `/adm/daemons/buildingd.c` - 代码生成守护进程
- 继承的BUILD类 - 标准房间基类
- 继承的AREA_BUILD类 - 区域建筑基类

## 注意事项
- 生成的代码仅为基础模板，需要后续手动编辑
- 坐标尺寸参数仅适用于区域模板
- 生成的代码需要保存到相应文件才能使用
- 标准属性（如"空地"名称）可以根据需要修改
- setup()调用是区域模板的必要组成部分

BUILDING_D 为MUD游戏提供了标准化的代码模板生成服务，简化了新房间和区域的创建过程，确保代码结构的一致性和规范性。该守护进程是游戏开发工具链的重要组成部分。'