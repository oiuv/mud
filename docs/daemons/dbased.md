# DBASE_D - 数据库管理守护进程

## 概述
DBASE_D 是MUD游戏中的数据持久化守护进程，专门用于管理游戏对象的存储和加载。它提供了一个集中式的数据存储系统，允许对象保存其状态数据，并在需要时恢复。

## 核心功能

### 对象数据持久化
- 保存游戏对象的状态数据到磁盘
- 从磁盘加载对象数据
- 清理无效对象数据
- 自动保存机制（每15分钟）

### 数据管理
- 基于对象路径的键值存储
- 支持任意类型的数据存储
- 权限控制（仅ROOT或对象自身可访问）
- 数据完整性检查

## 数据存储机制

### 存储路径
数据存储在 `/data/dbased` 文件中，使用映射结构保存所有对象的数据。

### 存储格式
```
键：对象路径（如 "/d/city/kedian"）
值：任意类型的数据（mixed）
```

### 自动保存
- 心跳函数每15分钟自动保存所有数据
- MUD关闭时自动保存
- 支持手动触发保存

## 主要接口函数

### 数据查询
```lpc
// 查询对象自身的数据
mixed data = DBASE_D->query_data();

// 查询指定对象的数据
mixed data = DBASE_D->query_object_data(object ob);

// 查询所有保存的对象路径
string *objects = DBASE_D->query_saved_object();

// 查询完整数据库映射
mapping db = DBASE_D->query_save_dbase();
```

### 数据设置
```lpc
// 保存对象自身的数据
DBASE_D->set_data(mixed data);

// 保存指定对象的数据
DBASE_D->set_object_data(object ob, mixed data);
```

### 对象管理
```lpc
// 清除对象（删除对象并清理数据）
DBASE_D->clear_object(mixed ob);
```

## 权限控制

### 访问限制
- 只有ROOT权限或对象自身可以保存/读取数据
- 防止未授权的数据访问
- 对象路径标准化处理

### 安全机制
```lpc
// 权限检查示例
if (!is_root(previous_object()) && previous_object() != ob)
    return 0; // 拒绝访问
```

## 使用示例

### 对象保存数据
```lpc
// 在对象中实现保存函数
void save_dbase_data()
{
    mapping data;

    data = ([
        "room_desc": query("long"),
        "items": all_inventory(),
        "exits": query("exits")
    ]);

    DBASE_D->set_data(data);
}
```

### 对象加载数据
```lpc
// 在对象中实现加载函数
void receive_dbase_data(mixed data)
{
    if (!data) return;

    if (mapp(data))
    {
        if (data["room_desc"])
            set("long", data["room_desc"]);

        // 恢复其他数据...
    }
}
```

## 自动保存机制

### 心跳函数
```lpc
// 每15分钟自动保存
protected int heart_beat()
{
    set_heart_beat(900 + random(20));
    announce_all_save_object(ONLY_SAVE);
}
```

### 保存通知
- 通知所有已注册的对象保存数据
- 处理对象销毁和数据清理
- 记录保存日志

## 数据清理

### 无效数据清理
```lpc
// 清理不存在的对象数据
if (file_size(e[i] + ".c") < 0)
{
    log_file("dbase", sprintf("data of (%s) cleaned because no found object.\n", e[i]));
    if (raw) map_delete(save_dbase, e[i]);
}
```

### 对象销毁
- 自动清理已销毁对象的数据
- 支持手动清理指定对象
- 权限验证确保数据安全

## 错误处理

### 日志记录
- 清理无效数据时记录日志
- 保存失败时记录错误信息
- 权限拒绝时记录访问尝试

### 异常处理
- 使用catch处理对象操作异常
- 防止系统崩溃
- 确保数据完整性

## 相关文件
- `/adm/daemons/dbased.c` - 守护进程实现
- `/data/dbased` - 数据存储文件
- `/log/dbase` - 操作日志文件