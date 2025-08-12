# 炎黄群侠传虚拟对象系统设计方案

## 系统概述

本方案实现了一个兼容现有架构的虚拟对象系统，通过SQLite3数据库统一管理游戏对象，支持动态生成房间、NPC和物品，无需创建大量物理文件。

## 数据库设计

### 1. 核心表结构

```sql
-- 区域基础信息表
CREATE TABLE areas (
    area_code VARCHAR(50) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    area_type VARCHAR(20) NOT NULL,        -- 区域类型：city, village, wilderness, dungeon, instance, system
    description TEXT,
    extra_data TEXT
);

-- 统一对象表（NPC、物品、道具等所有游戏对象）
CREATE TABLE objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_code VARCHAR(50) NOT NULL,
    obj_code VARCHAR(100) NOT NULL,
    obj_name VARCHAR(100) NOT NULL,
    obj_type VARCHAR(30) NOT NULL,        -- npc, food, weapon, armor, hands等
    obj_subtype VARCHAR(30),
    value INTEGER DEFAULT 0,              -- 通用：价格/价值（NPC为悬赏金额）
    weight INTEGER DEFAULT 1,             -- 通用：重量
    unit VARCHAR(10) DEFAULT "个",         -- 通用：单位
    description TEXT,                     -- 通用：详细描述
    material VARCHAR(30),                 -- 物品专用：材料
    level INTEGER,                        -- NPC专用：等级/经验等级
    age INTEGER,                          -- NPC专用：年龄
    gender VARCHAR(10),                   -- NPC专用：性别
    combat_exp INTEGER DEFAULT 0,         -- NPC专用：战斗经验
    armor_prop INTEGER,                   -- 防具专用：防御值
    weapon_prop INTEGER,                  -- 武器专用：攻击力
    food_supply INTEGER,                  -- 食物专用：补给值
    extra_data TEXT,                      -- JSON格式存储额外属性
    UNIQUE(area_code, obj_code),
    FOREIGN KEY (area_code) REFERENCES areas(area_code)
);

-- 房间数据表
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_code VARCHAR(50) NOT NULL,
    room_code VARCHAR(100) NOT NULL,
    room_type VARCHAR(30) NOT NULL,
    short_desc TEXT NOT NULL,
    long_desc TEXT NOT NULL,
    is_outdoors INTEGER DEFAULT 1,
    -- 地图和寻路支持字段
    coord_x INTEGER DEFAULT 0,            -- X坐标（地图用）
    coord_y INTEGER DEFAULT 0,            -- Y坐标（地图用）
    coord_z INTEGER DEFAULT 0,            -- Z坐标（楼层用）
    map_icon VARCHAR(5) DEFAULT '□',       -- 地图图标
    walk_cost INTEGER DEFAULT 1,          -- 行走代价（寻路用）
    is_walkable INTEGER DEFAULT 1,        -- 是否可通行
    extra_data TEXT,
    UNIQUE(area_code, room_code),
    FOREIGN KEY (area_code) REFERENCES areas(area_code)
);

-- 房间出口关系表
CREATE TABLE room_exits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_code VARCHAR(50) NOT NULL,
    room_code VARCHAR(100) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    target_area VARCHAR(50) NOT NULL,
    target_room VARCHAR(100) NOT NULL,
    exit_type VARCHAR(20) DEFAULT 'normal',           -- 出口类型：normal, door, gate, locked, hidden
    door_name VARCHAR(50),                            -- 门名称，如"木门"、"铁门"
    door_desc TEXT,                                   -- 门描述
    door_status INTEGER DEFAULT 0,                    -- 门状态：0=开放, 1=关闭, 2=上锁, 4=破坏
    key_code VARCHAR(50),                             -- 开锁所需的钥匙代码
    lock_difficulty INTEGER DEFAULT 0                -- 开锁难度等级
    UNIQUE(area_code, room_code, direction),
    FOREIGN KEY (area_code) REFERENCES areas(area_code)
);

-- 房间对象关联表（统一处理NPC和物品）
CREATE TABLE room_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_code VARCHAR(50) NOT NULL,
    room_code VARCHAR(100) NOT NULL,
    obj_area VARCHAR(50) NOT NULL,
    obj_code VARCHAR(100) NOT NULL,
    base_count INTEGER DEFAULT 1,
    random_add INTEGER DEFAULT 0,
    count_expression TEXT,
    spawn_rate INTEGER DEFAULT 100,       -- 出现概率百分比(0-100)
    UNIQUE(area_code, room_code, obj_area, obj_code),
    FOREIGN KEY (area_code) REFERENCES areas(area_code)
);

-- 索引优化
CREATE INDEX idx_rooms_area_room ON rooms(area_code, room_code);
CREATE INDEX idx_objects_area_code ON objects(area_code);
CREATE INDEX idx_exits_area_room ON room_exits(area_code, room_code);
CREATE INDEX idx_room_objects_composite ON room_objects(area_code, room_code, obj_area, obj_code);
```

### 2. 数据示例

```sql
-- 区域类型示例
INSERT INTO areas (area_code, area_name, area_type, description) VALUES
('chengdu', '成都城', 'city', '天府之国的中心，物产丰富'),
('shaolin', '少林寺', 'dungeon', '武学圣地，高手云集'),
('huashan', '华山', 'wilderness', '五岳之一，险峻异常'),
('yangzhou', '扬州城', 'city', '江南水乡，商贾云集'),
('xiangyang', '襄阳城', 'city', '军事重镇，兵家必争'),
('system', '系统通用', 'system', '系统通用对象和模板'),
('instance', '桃花岛', 'instance', '副本地图，限制进入');

-- 东大街房间
INSERT INTO rooms (area_code, room_code, room_type, short_desc, long_desc, is_outdoors, extra_data) VALUES
('chengdu', 'eastroad1', 'street', '东大街', 
'你走在东大街坚实的青石板地面上。南边可以通向东城门
路边有一个简陋的茶摊，一块洗得发白了的旧帆布正顶着头顶
火辣辣的阳光，一张长几上放着几只大号粗瓷碗。碗中盛满着
可口的茶水。往西北通往北大街，东北方一座大店面里传出阵
阵划拳的喧闹。', 1, '{"resource":{"water":1}}');

-- 对象数据
INSERT INTO objects (area_code, obj_code, obj_name, obj_type, obj_subtype, value, weight, unit, description, age, gender, combat_exp) VALUES
-- NPC示例
('chengdu', 'xiaozei', '小贼', 'npc', 'thief', 50, 70, '个', '一个鬼鬼祟祟的小贼', 25, '男性', 800),
('chengdu', 'tanghua', '唐掌柜', 'npc', 'boss', 0, 70, '个', '蓉城酒楼掌柜，财大势大', 46, '男性', 50000),

-- 物品示例
('chengdu', 'peanut', '花生', 'food', 'snack', 5, 50, '袋', '一袋香喷喷的花生', NULL, NULL, NULL),
('chengdu', 'fruit', '水果', 'food', 'fruit', 10, 100, '个', '新鲜的水果', NULL, NULL, NULL),
('chengdu', 'mint', '薄荷糖', 'food', 'candy', 2, 20, '个', '清凉的薄荷糖', NULL, NULL, NULL),

-- 武器示例
('system', 'changjian', '长剑', 'weapon', 'sword', 200, 5000, '柄', '普通的精钢剑，剑客标准配备', NULL, NULL, NULL, 25),
('system', 'zhitao', '指套', 'weapon', 'hands', 6000, 500, '副', '五个环环相链的铁指套，前端锋利如刃', NULL, NULL, NULL, 15);

-- 出口数据
INSERT INTO room_exits (area_code, room_code, direction, target_area, target_room, exit_type, door_name, door_desc, door_status, key_code, lock_difficulty) VALUES
('chengdu', 'eastroad1', 'northeast', 'chengdu', 'jiudian', 'normal', NULL, NULL, 0, NULL, 0),
('chengdu', 'eastroad1', 'northwest', 'chengdu', 'northroad3', 'normal', NULL, NULL, 0, NULL, 0),
('chengdu', 'eastroad1', 'south', 'chengdu', 'eastroad2', 'normal', NULL, NULL, 0, NULL, 0),
('chengdu', 'temple', 'north', 'chengdu', 'inner_court', 'door', '木门', '一扇厚重的木门', 1, NULL, 0),
('chengdu', 'treasury', 'east', 'chengdu', 'secret_room', 'locked', '铁门', '一扇坚固的铁门，上着锁', 3, 'treasury_key', 5);

-- 房间对象关联
INSERT INTO room_objects (area_code, room_code, obj_area, obj_code, base_count, random_add, count_expression) VALUES
('chengdu', 'eastroad1', 'chengdu', 'xiaozei', 1, 0, '1'),
('chengdu', 'eastroad1', 'chengdu', 'peanut', 5, 25, '5 + random(25)'),
('chengdu', 'eastroad1', 'chengdu', 'fruit', 1, 5, '1 + random(5)'),
('chengdu', 'eastroad1', 'chengdu', 'mint', 1, 5, '1 + random(5)');
```

## 虚拟对象实现

### 1. 主路由守护进程 (`/adm/daemons/virtual_d.c`)

```lpc
mixed compile_object(string file)
{
    mapping path_data;
    
    // 解析虚拟对象路径
    path_data = PATH_PARSER->parse_path(file);
    if (!path_data) {
        return 0; // 不是虚拟对象路径，让驱动处理
    }
    
    // 根据类型路由到相应虚拟对象
    switch(path_data["type"]) {
        case "room":
            return new("/d/virtual/room", path_data["area"], path_data["code"]);
        case "npc":
            return new("/d/virtual/object", path_data["area"], path_data["code"]);
        case "object":
            return new("/d/virtual/object", path_data["area"], path_data["code"]);
    }
    
    return 0;
}
```

### 2. 路径解析工具 (`/adm/daemons/path_parser.c`)

```lpc
mapping parse_path(string file)
{
    mapping result = ([ ]);
    
    // 房间路径: /d/{area}/{room_code}
    if (sscanf(file, "/d/%s/%s", result["area"], result["code"])) {
        // 排除npc和obj子目录
        if (result["code"][0..3] == "npc/" || result["code"][0..3] == "obj/") {
            return 0;
        }
        result["type"] = "room";
        return result;
    }
    
    // NPC路径: /d/{area}/npc/{npc_code}
    if (sscanf(file, "/d/%s/npc/%s", result["area"], result["code"])) {
        result["type"] = "npc";
        return result;
    }
    
    // 物品路径: /d/{area}/obj/{obj_code}
    if (sscanf(file, "/d/%s/obj/%s", result["area"], result["code"])) {
        result["type"] = "object";
        return result;
    }
    
    return 0;
}
```

### 3. 虚拟房间实现 (`/d/virtual/room.c`)

```lpc
inherit ROOM;
#include <dbase.h>

void create(string area, string room_code)
{
    mapping room_data;
    mapping exits_data;
    
    // 从数据库加载房间数据
    room_data = DBASE_D->query_room(area, room_code);
    if (!room_data) {
        setup_default_room(area, room_code);
        return;
    }
    
    // 设置基本属性
    set("short", room_data["short_desc"]);
    set("long", room_data["long_desc"]);
    set("outdoors", room_data["is_outdoors"] ? area : 0);
    
    // 设置额外属性
    if (room_data["extra_data"]) {
        mapping extra = json_decode(room_data["extra_data"]);
        foreach (string key, mixed value in extra) {
            set(key, value);
        }
    }
    
    // 设置出口和门
    setup_exits(area, room_code);
    
    // 设置对象
    setup_objects(area, room_code);
    
    setup();
}

private void setup_objects(string area, string room_code)
{
    mapping objects = ([ ]);
    mixed obj_data = DBASE_D->query_room_objects(area, room_code);
    
    foreach (mapping obj in obj_data) {
        int count = calculate_count(obj);
        if (count > 0) {
            string full_path = sprintf("/d/%s/%s", obj["obj_area"], obj["obj_code"]);
            objects[full_path] = count;
        }
    }
    
    if (sizeof(objects) > 0) {
        set("objects", objects);
    }
}

// 设置出口和门
private void setup_exits(string area, string room_code)
{
    mapping exits = ([ ]);
    mixed exits_data = DBASE_D->query_exits(area, room_code);
    
    foreach (mapping exit in exits_data) {
        string target_path = sprintf("/d/%s/%s", exit["target_area"], exit["target_room"]);
        
        if (exit["exit_type"] == "normal") {
            exits[exit["direction"]] = target_path;
        } else {
            // 创建门对象
            string door_id = sprintf("%s_%s_%s", area, room_code, exit["direction"]);
            string door_path = sprintf("/d/virtual/door", door_id);
            
            exits[exit["direction"]] = ([
                "file": target_path,
                "door": door_id,
                "name": exit["exit_name"] || "门",
                "type": exit["exit_type"],
                "locked": exit["is_locked"],
                "closed": exit["is_closed"],
                "key": exit["key_code"],
                "difficulty": exit["lock_difficulty"],
                "desc": exit["door_desc"]
            ]);
        }
    }
    
    if (sizeof(exits) > 0) {
        set("exits", exits);
    }
}

private int calculate_count(mapping obj)
{
    if (obj["count_expression"]) {
        return parse_expression(obj["count_expression"]);
    }
    
    // 检查出现概率
    if (obj["spawn_rate"] < 100 && random(100) > obj["spawn_rate"]) {
        return 0;
    }
    
    return obj["base_count"] + random(obj["random_add"]);
}

private int parse_expression(string expr)
{
    if (sscanf(expr, "%d + random(%d)", int base, int rand)) {
        return base + random(rand);
    }
    if (sscanf(expr, "random(%d)", int rand)) {
        return random(rand);
    }
    return to_int(expr);
}

private void setup_default_room(string area, string room_code)
{
    set("short", sprintf("%s街道", capitalize(area)));
    set("long", sprintf("这是一条普通的%s街道。", capitalize(area)));
    set("outdoors", area);
}
```

### 4. 数据库访问接口 (`/adm/daemons/dbase_d.c`)

```lpc
mapping query_room(string area, string room_code)
{
    string sql = sprintf(
        "SELECT * FROM rooms WHERE area_code = '%s' AND room_code = '%s'",
        area, room_code
    );
    mixed result = query(sql);
    return sizeof(result) > 0 ? result[0] : 0;
}

mapping query_exits(string area, string room_code)
{
    string sql = sprintf(
        "SELECT direction, target_area, target_room FROM room_exits " +
        "WHERE area_code = '%s' AND room_code = '%s'",
        area, room_code
    );
    mixed result = query(sql);
    
    mapping exits = ([ ]);
    foreach (mixed row in result) {
        string target_path = sprintf("/d/%s/%s", row["target_area"], row["target_room"]);
        exits[row["direction"]] = target_path;
    }
    
    return exits;
}

mixed query_room_objects(string area, string room_code)
{
    string sql = sprintf(
        "SELECT ro.*, o.obj_type, o.obj_name " +
        "FROM room_objects ro " +
        "JOIN objects o ON ro.obj_area = o.area_code AND ro.obj_code = o.obj_code " +
        "WHERE ro.area_code = '%s' AND ro.room_code = '%s'",
        area, room_code
    );
    
    return query(sql);
}

mapping query_object(string area, string obj_code)
{
    string sql = sprintf(
        "SELECT * FROM objects WHERE area_code = '%s' AND obj_code = '%s'",
        area, obj_code
    );
    mixed result = query(sql);
    return sizeof(result) > 0 ? result[0] : 0;
}
```

## 使用指南

### 1. 数据管理

```sql
-- 添加新区域
INSERT INTO areas (area_code, area_name, area_type) VALUES ('beijing', '北京城', 'city');

-- 添加新房间
INSERT INTO rooms (area_code, room_code, room_type, short_desc, long_desc, is_outdoors) VALUES
('beijing', 'tiananmen', 'landmark', '天安门', '雄伟的天安门城楼...', 1);

-- 添加出口
INSERT INTO room_exits VALUES ('beijing', 'tiananmen', 'north', 'beijing', 'forbidden_city');

-- 添加房间对象
INSERT INTO room_objects (area_code, room_code, obj_area, obj_code, base_count, random_add, count_expression) VALUES
('beijing', 'tiananmen', 'system', 'common_guard', 2, 0, '2'),
('chengdu', 'eastroad1', 'chengdu', 'xiaozei', 1, 0, '1'),
('chengdu', 'eastroad1', 'chengdu', 'peanut', 5, 25, '5 + random(25)');
```

### 2. 访问方式

无需修改现有代码，系统会自动处理：
- `/d/chengdu/eastroad1` → 虚拟房间
- `/d/chengdu/npc/xiaozei` → 虚拟NPC
- `/d/chengdu/obj/peanut` → 虚拟物品

### 3. count_expression和spawn_rate详解

#### 3.1 count_expression - 动态数量计算

支持多种数量计算模式：

```sql
-- 固定数量
('chengdu', 'eastroad1', 'chengdu', 'xiaozei', 1, 0, '1', 100)

-- 随机数量：基础2个，随机增加0-5个
('chengdu', 'market', 'chengdu', 'vendor', 2, 5, '2 + random(5)', 90)

-- 基于时间的动态数量
('beijing', 'day', 'system', 'guard', 3, 2, 'hour > 6 && hour < 20 ? 5 : 2', 100)

-- 基于玩家数量
('shaolin', 'training', 'shaolin', 'monk', 1, 0, '1 + online_players/10', 80)
```

#### 3.2 spawn_rate - 出现概率控制

控制对象的生成概率：

```sql
-- 100%必定出现
('chengdu', 'temple', 'chengdu', 'abbot', 1, 0, '1', 100)

-- 30%概率出现（稀有NPC）
('chengdu', 'eastroad1', 'system', 'rare_master', 1, 0, '1', 30)

-- 50%概率出现（随机事件）
('huashan', 'cliff', 'system', 'hermit', 1, 0, '1', 50)

-- 80%概率出现（常见物品）
('beijing', 'market', 'beijing', 'goods', 5, 10, '5 + random(10)', 80)
```

#### 3.3 实际应用场景

```sql
-- 成都东大街动态场景
INSERT INTO room_objects VALUES
('chengdu', 'eastroad1', 'chengdu', 'xiaozei', 1, 0, '1', 100),                    -- 必出1个小贼
('chengdu', 'eastroad1', 'chengdu', 'peanut', 5, 25, '5 + random(25)', 90),        -- 90%概率出5-30个花生
('chengdu', 'eastroad1', 'system', 'rare_vendor', 1, 0, '1', 20),                  -- 20%概率出稀有商人
('chengdu', 'eastroad1', 'chengdu', 'patrol_guard', 2, 1, '2 + random(1)', 60);   -- 60%概率出2-3个巡逻守卫
```

### 4. obj_area字段详解

`obj_area`字段实现了**跨区域资源复用**功能，支持以下使用场景：

#### 3.1 本地对象引用
```sql
-- 使用本区域的对象
('chengdu', 'eastroad1', 'chengdu', 'xiaozei', 1, 0, '1', 'npc')
-- 实际路径：/d/chengdu/xiaozei
```

#### 3.2 系统通用对象
```sql
-- 创建系统通用区域
INSERT INTO areas (area_code, area_name, area_type) VALUES 
('system', '系统通用', 'system'),
('common', '公共资源', 'common');

-- 创建通用守卫对象
INSERT INTO objects VALUES 
('system', 'common_guard', '守卫', 'npc', 'guard', 10, 0, 70, '通用守卫');

-- 任何区域都可以使用
('beijing', 'tiananmen', 'system', 'common_guard', 2, 0, '2', 'npc')
('changan', 'citygate', 'system', 'common_guard', 1, 0, '1', 'npc')
```

#### 3.3 特色对象共享
```sql
-- 北京特色小吃被成都商人贩卖
('chengdu', 'market', 'beijing', 'beijing_snack', 1, 0, '1', 'food')
-- 实际路径：/d/beijing/beijing_snack
```

#### 3.4 管理优势
- **减少重复数据**：通用对象只需创建一次
- **统一更新**：修改系统级对象影响所有引用区域
- **灵活组合**：任意区域可自由组合使用其他区域资源
- **路径清晰**：通过obj_area+obj_code唯一定位对象

### 4. 区域类型(area_type)设计用途

`area_type`字段用于支持未来的扩展功能：

#### 4.1 区域类型分类
- **city**: 城市区域（如成都、北京、长安）
- **village**: 村庄区域（如新手村、小村庄）
- **wilderness**: 野外区域（如华山、泰山）
- **dungeon**: 副本区域（如少林寺、古墓派）
- **instance**: 副本地图（如桃花岛、特殊任务地图）
- **system**: 系统通用区域（存放通用对象模板）

#### 4.2 未来扩展应用
```lpc
// 基于区域类型进行特殊处理
switch(area_type) {
    case "city":
        // 城市区域：允许摆摊、有守卫巡逻
        break;
    case "wilderness":
        // 野外区域：随机遭遇、天气影响
        break;
    case "dungeon":
        // 副本区域：限制进入、特殊规则
        break;
    case "instance":
        // 副本地图：独立副本、重置机制
        break;
}
```

#### 4.3 数据查询优化
```sql
-- 查询所有城市区域
SELECT * FROM areas WHERE area_type = 'city';

-- 查询适合新手的区域
SELECT * FROM areas WHERE area_type IN ('city', 'village');

-- 查询副本地图
SELECT * FROM areas WHERE area_type = 'instance';
```

### 5. 兼容性保证

1. **文件优先**：物理文件存在时优先加载
2. **路径兼容**：保持现有 `/d/{area}/{code}` 格式
3. **功能完整**：支持所有现有功能
4. **渐进迁移**：可逐步将现有文件转换为数据库记录

## 系统优势

1. **零文件架构**：无需创建大量物理文件
2. **动态配置**：修改数据库即可更新游戏内容
3. **统一管理**：所有游戏对象统一数据库管理
4. **跨区支持**：支持对象和房间的跨区域关联
5. **灵活扩展**：新增区域只需数据库配置
6. **表达式支持**：支持复杂的数量计算表达式