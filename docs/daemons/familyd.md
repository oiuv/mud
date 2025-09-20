# FAMILY_D - 门派管理守护进程

## 概述
FAMILY_D 是MUD游戏中的门派系统管理守护进程，负责管理所有门派的声望、仇恨关系、门派信息等。它维护着一个完整的门派生态系统，包括门派间的竞争关系和声望排名。

## 核心功能

### 门派声望管理
- 维护各门派的声望值
- 声望排行榜管理
- 基础声望配置
- 声望上限控制（10亿）

### 门派仇恨系统
- 管理门派间的仇恨关系
- 个人仇恨记录（每人最多100个仇人）
- 仇恨值自动清理机制
- 门派间敌对关系维护

### 门派基础信息
- 门派ID到名称的映射
- 门派基本信息管理
- 门派查询接口

## 门派声望系统

### 基础声望配置
```lpc
nosave mapping base_family_fame = ([
    "少林寺"   : 10000000,  // 最高基础声望
    "武当派"   : 8000000,
    "丐帮"     : 7000000,
    "全真教"   : 6000000,
    "华山派"   : 5000000,
    // ... 其他门派按历史地位排序
]);
```

### 声望上限
- 最大门派声望：10亿（MAX_FAMILY_FAME）
- 防止声望无限增长
- 保持游戏平衡

## 门派信息映射

### 门派ID映射
```lpc
nosave mapping family_name = ([
    "dalunsi"  : "大轮寺",
    "duan"     : "段氏皇族",
    "emei"     : "峨嵋派",
    "gaibang"  : "丐帮",
    "gumu"     : "古墓派",
    "henshan"  : "衡山派",
    "honghua"  : "红花会",
    // ... 完整的ID到名称映射
]);
```

## 仇恨系统管理

### 个人仇恨限制
- 每人最多100个仇人（MAX_HATRED_PERSON）
- 超过限制时自动清理10个（HATREDP_REMOVED）
- 保持仇恨列表的有效性

### 仇恨类型
- 个人仇恨：玩家间的个人恩怨
- 门派仇恨：门派间的集体仇恨
- 自动仇恨：基于行为的自动添加

## 主要接口函数

### 门派声望操作
```lpc
// 查询门派声望
int fame = FAMILY_D->query_family_fame(string family);

// 设置门派声望
FAMILY_D->set_family_fame(string family, int fame);

// 增加门派声望
FAMILY_D->add_family_fame(string family, int fame);
```

### 仇恨系统操作
```lpc
// 查询门派仇恨列表
mapping hatreds = FAMILY_D->query_family_hatred(string family);

// 添加门派仇恨
FAMILY_D->add_family_hatred(string family, string target, int hatred);

// 减少门派仇恨
FAMILY_D->remove_family_hatred(string family, string target);
```

### 门派信息查询
```lpc
// 根据ID获取门派名称
string name = FAMILY_D->query_family_name(string family_id);

// 根据名称获取门派ID
string id = FAMILY_D->query_family_id(string family_name);

// 获取所有门派列表
string *families = FAMILY_D->query_all_families();
```

## 数据存储

### 存储文件
- 主数据：`/data/familyd`
- 包含所有门派声望和仇恨关系

### 持久化机制
- 自动保存变更
- 支持手动保存和恢复
- 自动备份机制

## 排行榜功能

### 门派声望排行
```lpc
// 获取声望排行榜
mapping ranks = FAMILY_D->query_family_rank();

// 获取指定门派排名
int rank = FAMILY_D->query_family_rank(string family);
```

### 排行更新
- 声望变更时自动更新排名
- 支持实时排名查询
- 历史排名记录

## 使用示例

### 增加门派声望
```lpc
// 玩家完成任务增加门派声望
void complete_family_quest(object player)
{
    string family = player->query("family/family_name");
    int fame = 1000; // 获得的声望值

    FAMILY_D->add_family_fame(family, fame);

    tell_object(player, "你为本门增加了 " + fame + " 点声望！\n");
}
```

### 门派仇恨处理
```lpc
// 处理门派间的仇恨事件
void family_conflict(string family1, string family2, int hatred)
{
    // 增加相互仇恨
    FAMILY_D->add_family_hatred(family1, family2, hatred);
    FAMILY_D->add_family_hatred(family2, family1, hatred);

    // 广播消息
    CHANNEL_D->do_channel(this_object(), "rumor",
        family1 + "与" + family2 + "之间的仇恨加深了！");
}
```

## 性能优化

### 缓存机制
- 门派信息缓存
- 声望数据缓存
- 仇恨关系缓存

### 批量操作
- 支持批量更新声望
- 批量仇恨处理
- 排行榜批量计算

## 相关文件
- `/adm/daemons/familyd.c` - 守护进程实现
- `/data/familyd` - 门派数据存储
- `/include/family.h` - 门派定义常量

## 注意事项
- 门派声望具有上限控制
- 仇恨系统有自动清理机制
- 基础声望配置反映了门派的历史地位
- 所有门派操作都需要通过守护进程进行，确保数据一致性

## 扩展功能
- 支持新增门派动态注册
- 门派合并和分裂处理
- 门派技能系统关联
- 门派任务系统集成

该守护进程是维护游戏世界门派生态平衡的核心组件，确保门派系统的公平性和可玩性。通过统一的接口管理所有门派数据，为游戏提供稳定的门派功能支持。`,