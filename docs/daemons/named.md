# NAME_D - 玩家姓名管理守护进程

## 概述
NAME_D 是MUD游戏的玩家姓名管理守护进程，负责维护玩家姓名与ID的映射关系，确保游戏内姓名的唯一性和可查询性。它为游戏提供了姓名查找、重名检测、姓名历史记录等核心功能。

## 核心功能

### 姓名映射管理
- 玩家姓名到ID的映射存储
- 支持同名玩家记录（按注册顺序）
- 姓名唯一性验证
- 姓名变更历史记录

### 姓名生成支持
- 内置百家姓列表
- 复姓支持（如：东方、欧阳、慕容等）
- 姓名合法性验证
- 敏感词过滤

### 查询系统
- 根据姓名查找ID
- 根据ID查找姓名
- 模糊姓名搜索
- 姓名使用情况统计

## 姓名映射机制

### 存储结构
```lpc
// 存储格式：按姓名首字母分层存储
// 例如："张三" 存储在 "/z/张三" 键下
mapping name_to_ids = ([
    "z/张三" : "zhangsan001/zhangsan002",
    "l/李四" : "lisi"
]);
```

### 百家姓列表
```lpc
nosave string *family_name = ({
    "东方", "独孤", "慕容", "欧阳", "司马",
    "西门", "尉迟", "长孙", "诸葛", "上官",
    "夏候", "闻人", "皇甫", "澹台", "公治",
    "淳于", "申屠", "公孙", "公羊", "轩辕",
    "令狐", "钟离", "宇文", "幕容", "仲孙",
    "司徒", "司空", "端木", "公良", "百里",
    "东郭", "南郭", "呼延", "羊舌", "东门",
    "南官", "南宫", "拓拔", "完颜", "耶律",
    "鲜于"
});
```

## 主要接口函数

### 姓名注册
```lpc
// 注册玩家姓名映射
NAME_D->map_name(string name, string id);

// 示例：
NAME_D->map_name("张三", "zhangsan");
NAME_D->map_name("李四", "lisi");
```

### 姓名查询
```lpc
// 根据姓名查询ID（返回所有同名玩家）
string *ids = NAME_D->query_ids(string name);

// 根据ID查询姓名
string name = NAME_D->query_name(string id);

// 检查姓名是否存在
int exists = NAME_D->name_exists(string name);
```

### 姓名管理
```lpc
// 移除姓名映射
NAME_D->remove_name(string name, string id);

// 更新姓名映射
NAME_D->update_name(string old_name, string new_name, string id);
```

## 存储机制

### 数据存储
- 存储文件：`/data/named`
- 按姓名首字母分层存储
- 支持同名玩家记录（用斜杠分隔）

### 持久化机制
- 自动保存姓名变更
- MUD关闭时强制保存
- 支持手动保存和恢复

## 姓名验证功能

### 合法性检查
```lpc
// 检查姓名是否合法
int valid = NAME_D->valid_name(string name);

// 检查姓名是否包含敏感词
int sensitive = NAME_D->has_sensitive_word(string name);

// 检查姓名长度
int length_ok = NAME_D->check_name_length(string name);
```

### 复姓支持
```lpc
// 检查是否为复姓
int is_complex = NAME_D->is_complex_family(string name);

// 获取姓名中的姓氏
string family = NAME_D->get_family_name(string name);
```

## 使用示例

### 玩家创建时注册姓名
```lpc
// 玩家创建角色时
void player_created(object player, string name)
{
    string id = player->query("id");

    // 检查姓名是否已存在
    if (NAME_D->name_exists(name))
    {
        tell_object(player, "该姓名已被使用，请选择其他姓名。\n");
        return;
    }

    // 注册姓名映射
    NAME_D->map_name(name, id);
    tell_object(player, "姓名注册成功！\n");
}
```

### 姓名查找功能
```lpc
// 根据姓名查找玩家
object find_player_by_name(string name)
{
    string *ids = NAME_D->query_ids(name);
    if (!sizeof(ids)) return 0;

    // 返回第一个匹配的玩家
    return find_player(ids[0]);
}
```

### 姓名变更处理
```lpc
// 玩家改名处理
void change_player_name(object player, string new_name)
{
    string old_name = player->query("name");
    string id = player->query("id");

    // 移除旧姓名映射
    NAME_D->remove_name(old_name, id);

    // 注册新姓名映射
    NAME_D->map_name(new_name, id);

    tell_object(player, "姓名变更成功！\n");
}
```

## 数据管理

### 存储格式
```lpc
// 存储结构示例
mapping name_data = ([
    "z/张三" : "zhangsan001/zhangsan002",  // 同名玩家
    "l/李四" : "lisi",                     // 单一玩家
    "w/王五" : "wangwu"
]);
```

### 查询优化
- 按首字母分层存储
- 快速姓名查找
- 批量姓名处理

## 系统配置

### 存储路径定义
```lpc
// 姓名存储路径定义
#define PATH(name) (name[0..0] + "/" + name)
```

### 持久化机制
- 自动保存：姓名变更时自动保存
- 手动保存：支持手动触发保存
- 系统关闭：MUD关闭时强制保存

## 调试功能

### 姓名统计
```lpc
// 获取姓名使用统计
mapping stats = NAME_D->query_name_stats();

// 获取重名列表
mapping duplicates = NAME_D->query_duplicate_names();

// 获取所有姓名列表
string *all_names = NAME_D->query_all_names();
```

### 数据验证
```lpc
// 验证姓名数据完整性
int valid = NAME_D->validate_name_data();

// 清理无效姓名映射
NAME_D->cleanup_invalid_mappings();
```

## 相关文件
- `/adm/daemons/named.c` - 守护进程实现
- `/data/named` - 姓名数据存储
- 内置百家姓列表用于姓名生成

## 注意事项
- 姓名映射一旦建立，通常不删除（除非玩家删除）
- 支持同名玩家，通过ID区分
- 姓名变更需要谨慎处理，可能影响社交关系
- 所有姓名操作都通过守护进程进行，确保数据一致性

NAME_D 作为游戏社交系统的核心组件，为玩家查找、社交互动、系统管理提供了可靠的姓名服务。通过统一的姓名管理机制，确保游戏世界的社交生态健康发展。该守护进程是连接玩家与游戏世界的重要桥梁，为所有基于姓名的功能提供基础支持。`,