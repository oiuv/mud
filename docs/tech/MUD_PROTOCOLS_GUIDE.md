# FluffOS MUD协议完整指南

## 现代MUD协议架构

**核心原则**: 现代MUD开发采用GMCP作为主力协议，保留MSSP用于服务器列表，MSP用于音效支持

---

## 协议详解与实现

### GMCP (Generic Mud Communication Protocol)
**协议代码**: 201 (0xC9)

**功能描述**: 现代JSON数据交换协议，用于客户端与服务器之间的结构化数据传输，是MXP、MSDP、ZMP的现代替代品

**相关EFUNs**:
- `int has_gmcp(object ob)` - 检查玩家是否启用GMCP
- `void send_gmcp(string message)` - 发送GMCP消息到客户端

**相关APPLYs**:
- `void gmcp_enable()` - GMCP启用时调用
- `void gmcp(string message)` - 收到GMCP数据时调用

**完整示例**:
```lpc
// 角色状态同步
void send_character_status() {
    mapping data = ([
        "vitals": ([
            "hp": this_player()->query("hp"),
            "max_hp": this_player()->query("max_hp"),
            "mp": this_player()->query("mp"),
            "max_mp": this_player()->query("max_mp")
        ]),
        "combat": ([
            "in_combat": this_player()->query("in_combat"),
            "target": this_player()->query("target")
        ])
    ]);
    
    if (has_gmcp(this_player())) {
        this_player()->send_gmcp("Char.Status " + json_encode(data));
    }
}

// 房间信息同步
void send_room_info(object player) {
    object env = environment(player);
    if (!env || !has_gmcp(player)) return;
    
    mapping data = ([
        "name": env->query("short"),
        "description": env->query("long"),
        "exits": keys(env->query("exits")),
        "items": keys(env->query("items") || ([]))
    ]);
    
    player->send_gmcp("Room.Info " + json_encode(data));
}

// 接收客户端GMCP请求
void gmcp(string message) {
    string cmd, data;
    
    if (sscanf(message, "%s %s", cmd, data) != 2) {
        cmd = message;
        data = "";
    }
    
    switch (cmd) {
        case "Core.Hello":
            write("欢迎！GMCP已连接。\n");
            send_initial_data();
            break;
        case "Char.Request":
            send_character_status();
            break;
        case "Room.Request":
            send_room_info(this_player());
            break;
    }
}
```

### MSSP (Mud Server Status Protocol)
**协议代码**: 70 (0x46)

**功能描述**: 服务器状态广播协议，用于MUD列表网站获取服务器信息

**相关APPLY**:
- `mapping get_mud_stats()` - 返回服务器统计信息

**官方MSSP变量规范**:

**必需字段**:
- **NAME** - MUD名称
- **PLAYERS** - 当前在线玩家数
- **UPTIME** - MUD启动的Unix时间戳

**通用字段**:
- **CHARSET** - 字符集
- **CODEBASE** - 代码库版本
- **CONTACT** - 联系邮箱
- **CRAWL_DELAY** - 爬虫延迟时间
- **CREATED** - 创建时间
- **DISCORD** - Discord链接
- **HOSTNAME** - 主机名
- **ICON** - 图标URL
- **IP** - IP地址
- **IPV6** - IPv6地址
- **LANGUAGE** - 语言
- **LOCATION** - 地理位置
- **MINIMUM_AGE** - 最小年龄限制
- **PORT** - 端口号
- **REFERRAL** - 推荐链接
- **SSL** - SSL端口
- **WEBSITE** - 网站地址

**分类字段**:
- **FAMILY** - 系列（如：DikuMUD, LPMud, MOO等）
- **GENRE** - 类型（如：Fantasy, Sci-Fi, Historical等）
- **GAMEPLAY** - 游戏性（如：Adventure, Hack and Slash, Player versus Player等）
- **STATUS** - 状态（如：Alpha, Beta, Live）
- **GAMESYSTEM** - 游戏系统
- **INTERMUD** - 互联MUD协议
- **SUBGENRE** - 子类型

**世界数据字段**:
- **AREAS** - 区域数量
- **HELPFILES** - 帮助文件数量
- **MOBILES** - NPC数量
- **OBJECTS** - 物品数量
- **ROOMS** - 房间数量
- **CLASSES** - 职业数量
- **LEVELS** - 等级上限
- **RACES** - 种族数量
- **SKILLS** - 技能数量

**协议支持字段**:
- **ANSI** - ANSI颜色支持
- **UTF-8** - UTF-8编码支持
- **VT100** - VT100终端支持
- **XTERM_256_COLORS** - XTERM 256色支持
- **XTERM_TRUE_COLORS** - XTERM真彩色支持

**完整示例**:
```lpc
// 在master.c中实现 - 严格遵循官方MSSP规范
mapping get_mud_stats() {
    return ([
        // 必需字段
        "NAME": "炎黄群侠传",
        "PLAYERS": sprintf("%d", sizeof(users())),
        "UPTIME": sprintf("%d", uptime()),
        
        // 通用字段
        "CHARSET": "UTF-8",
        "CODEBASE": "FluffOS " + __VERSION__,
        "CONTACT": "admin@mud.ren",
        "CREATED": "2020-01-01",
        "HOSTNAME": "mud.ren",
        "IP": "123.456.789.012",
        "LANGUAGE": "Chinese",
        "LOCATION": "China",
        "MINIMUM_AGE": "16",
        "PORT": "4000",
        "WEBSITE": "https://mud.ren",
        
        // 分类字段
        "FAMILY": "LPMud",
        "GENRE": "Fantasy",
        "GAMEPLAY": "Roleplaying",
        "STATUS": "Live",
        
        // 世界数据字段
        "AREAS": "100",
        "HELPFILES": "500",
        "MOBILES": "2000",
        "OBJECTS": "10000",
        "ROOMS": "3000",
        "CLASSES": "8",
        "LEVELS": "100",
        "RACES": "5",
        "SKILLS": "200",
        
        // 协议支持字段
        "ANSI": "1",
        "UTF-8": "1",
        "VT100": "1",
        "XTERM_256_COLORS": "1"
    ]);
}
```

### MSP (Mud Sound Protocol)
**协议代码**: 90 (0x5A)

**功能描述**: 音效和背景音乐播放协议，支持音量、循环等控制

**相关EFUNs**:
- `int has_msp(object ob)` - 检查玩家是否启用MSP
- `void telnet_msp_oob(string command)` - 发送MSP命令

**协议格式规范**:
MSP命令使用以下格式：
```
!!TYPE(filename V=音量 L=循环 P=优先级 C=继续 T=类型 U=URL)
```

**参数详解**:
| 参数 | 适用类型 | 取值范围 | 默认值 | 说明 |
|------|----------|----------|--------|------|
| **filename** | SOUND/MUSIC | 字符串 | - | 音频文件路径，支持通配符，"Off"停止播放 |
| **V** (Volume) | SOUND/MUSIC | 0-100 | 100 | 音量控制，0静音，100最大音量 |
| **L** (Loops) | SOUND/MUSIC | -1, 正整数 | 1 | 循环次数，-1表示无限循环 |
| **P** (Priority) | SOUND | 0-100 | 50 | 优先级，数值高的音效会覆盖低优先级的 |
| **C** (Continue) | MUSIC | 0/1 | 1 | 是否继续播放，0停止当前音乐，1继续 |
| **T** (Type) | SOUND/MUSIC | 字符串 | - | 音频类型标识，区分不同类别的音效 |
| **U** (URL) | SOUND/MUSIC | URL字符串 | - | 音频文件下载地址，可设置默认URL |

**标准命令格式**:
- **音效**: `!!SOUND(filename V=0-100 L=1/-1 P=0-100 T=type U=url)`
- **音乐**: `!!MUSIC(filename V=0-100 L=1/-1 C=0/1 T=type U=url)`
- **停止**: `!!SOUND(Off)` 或 `!!MUSIC(Off)`

**完整示例**:
```lpc
// 播放音效
void play_sound(object player, string sound_file, int volume, int priority) {
    if (has_msp(player)) {
        player->telnet_msp_oob(sprintf("!!SOUND(%s V=%d L=1 P=%d)\r\n", 
            sound_file, volume, priority));
    }
}

// 播放背景音乐
void play_music(object player, string music_file, int volume, int loops) {
    if (has_msp(player)) {
        player->telnet_msp_oob(sprintf("!!MUSIC(%s V=%d L=%d C=1)\r\n", 
            music_file, volume, loops));
    }
}

// 停止音乐
void stop_music(object player) {
    if (has_msp(player)) {
        player->telnet_msp_oob("!!MUSIC(Off)\r\n");
    }
}

// 高级音效系统示例
void play_ambient_sound(object player, string sound_type) {
    mapping ambient_sounds = ([
        "forest": "ambient/forest.wav",
        "cave": "ambient/cave.wav", 
        "village": "ambient/village.wav",
        "combat": "ambient/battle.wav"
    ]);
    
    string sound_file = ambient_sounds[sound_type];
    if (sound_file && has_msp(player)) {
        // 环境音效：低音量，无限循环，低优先级
        player->telnet_msp_oob(sprintf("!!MUSIC(%s V=30 L=-1 C=1)\r\n", sound_file));
    }
}

// 战斗音效系统
void combat_sound(object attacker, object target, string action) {
    mapping sounds = ([
        "hit": "combat/sword_hit.wav",
        "miss": "combat/sword_miss.wav", 
        "dodge": "combat/dodge.wav",
        "block": "combat/block.wav",
        "critical": "combat/critical.wav"
    ]);
    
    string sound_file = sounds[action];
    if (sound_file && has_msp(attacker)) {
        // 战斗音效：高音量，单次播放，高优先级
        play_sound(attacker, sound_file, 90, 80);
    }
    if (sound_file && has_msp(target)) {
        play_sound(target, sound_file, 90, 80);
    }
}

// 设置默认音频URL
void set_default_audio_url(object player, string url) {
    if (has_msp(player)) {
        player->telnet_msp_oob(sprintf("!!SOUND(Off U=%s)\r\n", url));
    }
}
```

### MXP (Mud eXtension Protocol)
**协议代码**: 91 (0x5B)

**功能描述**: 富文本标记协议，支持颜色、链接、图片等HTML/XML样式标记

**相关EFUNs**:
- `int has_mxp(object ob)` - 检查玩家是否启用MXP
- `void act_mxp()` - 激活MXP模式

**相关APPLYs**:
- `void mxp_enable()` - MXP启用时调用
- `string mxp_tag(string tag)` - 处理MXP标签时调用

**完整示例**:
```lpc
// 发送颜色文本
void send_colored_text(object player, string text, string color) {
    if (has_mxp(player)) {
        tell_object(player, sprintf("<COLOR %s>%s</COLOR>", color, text));
    } else {
        tell_object(player, text);
    }
}

// 创建可点击链接
void send_link(object player, string text, string command) {
    if (has_mxp(player)) {
        tell_object(player, sprintf("<A HREF=\"%s\">%s</A>", command, text));
    } else {
        tell_object(player, sprintf("%s (%s)", text, command));
    }
}

// 发送图片
void send_image(object player, string image_url, string alt_text) {
    if (has_mxp(player)) {
        tell_object(player, sprintf("<IMG SRC=\"%s\" ALT=\"%s\">", image_url, alt_text));
    } else {
        tell_object(player, alt_text);
    }
}

// 房间描述增强
void send_enhanced_room_desc(object player, object room) {
    string desc = room->query("long");
    
    if (has_mxp(player)) {
        // 高亮出口
        mapping exits = room->query("exits");
        string *exit_dirs = keys(exits);
        
        foreach (string dir in exit_dirs) {
            desc = replace_string(desc, dir, 
                sprintf("<A HREF=\"go %s\"><COLOR GREEN>%s</COLOR></A>", dir, dir));
        }
        
        // 高亮物品
        object *items = all_inventory(room);
        foreach (object item in items) {
            string item_name = item->query("name");
            if (item_name && strsrch(desc, item_name) != -1) {
                desc = replace_string(desc, item_name,
                    sprintf("<A HREF=\"look %s\"><COLOR CYAN>%s</COLOR></A>", 
                        item_name, item_name));
            }
        }
    }
    
    tell_object(player, desc);
}
```

### MSDP (Mud Server Data Protocol)
**协议代码**: 69 (0x45)

**功能描述**: 键值对数据交换协议，是GMCP的前身，用于角色状态、游戏数据等传输

**相关EFUNs**:
- `int has_msdp(object ob)` - 检查玩家是否启用MSDP
- `void send_msdp_variable(string variable, mixed value)` - 发送MSDP变量

**相关APPLYs**:
- `void msdp_enable()` - MSDP启用时调用
- `void msdp(string message)` - 收到MSDP数据时调用

**完整示例**:
```lpc
// 发送角色属性
void send_character_stats(object player) {
    if (has_msdp(player)) {
        player->send_msdp_variable("HEALTH", player->query("hp"));
        player->send_msdp_variable("HEALTH_MAX", player->query("max_hp"));
        player->send_msdp_variable("MANA", player->query("mp"));
        player->send_msdp_variable("MANA_MAX", player->query("max_mp"));
        player->send_msdp_variable("LEVEL", player->query("level"));
        player->send_msdp_variable("EXPERIENCE", player->query("exp"));
    }
}

// 发送房间信息
void send_room_data(object player) {
    object env = environment(player);
    if (!env || !has_msdp(player)) return;
    
    player->send_msdp_variable("ROOM_NAME", env->query("short"));
    player->send_msdp_variable("ROOM_DESCRIPTION", env->query("long"));
    player->send_msdp_variable("ROOM_EXITS", implode(keys(env->query("exits")), ","));
    
    object *items = all_inventory(env) - ({player});
    string *item_names = map_array(items, (: $1->query("short") :));
    player->send_msdp_variable("ROOM_ITEMS", implode(item_names, ","));
}

// 处理客户端MSDP请求
void msdp(string message) {
    string variable, value;
    
    if (sscanf(message, "%s %s", variable, value) != 2) {
        variable = message;
        value = "";
    }
    
    switch (variable) {
        case "REPORT":
            send_character_stats(this_player());
            break;
        case "ROOM":
            send_room_data(this_player());
            break;
    }
}
```

### ZMP (Zenith Mud Protocol)
**协议代码**: 93 (0x5D)

**功能描述**: 插件系统协议，允许客户端调用服务器端插件功能

**相关EFUNs**:
- `int has_zmp(object ob)` - 检查玩家是否启用ZMP
- `void send_zmp(string module, string *args)` - 发送ZMP命令

**相关APPLYs**:
- `void zmp_enable()` - ZMP启用时调用
- `void zmp_command(string module, string *args)` - 收到ZMP命令时调用

**完整示例**:
```lpc
// 注册ZMP模块
void zmp_enable() {
    // 通知客户端支持的模块
    send_zmp("core", ({"hello", "1.0"}));
    send_zmp("mapper", ({"init", "1.0"}));
    send_zmp("inventory", ({"init", "1.0"}));
}

// 处理ZMP命令
void zmp_command(string module, string *args) {
    switch (module) {
        case "mapper":
            handle_mapper_command(args);
            break;
        case "inventory":
            handle_inventory_command(args);
            break;
        case "combat":
            handle_combat_command(args);
            break;
    }
}

// 地图插件
void handle_mapper_command(string *args) {
    switch (args[0]) {
        case "get_map":
            send_map_data();
            break;
        case "get_room":
            send_room_info();
            break;
    }
}

void send_map_data() {
    object env = environment(this_player());
    if (!env) return;
    
    mapping exits = env->query("exits");
    string *exit_data = ({ environment(env)->query("short") });
    
    foreach (string dir, string dest in exits) {
        exit_data += ({ dir, dest });
    }
    
    send_zmp("mapper", ({"map_data"}) + exit_data);
}

// 背包插件
void handle_inventory_command(string *args) {
    object *inv = all_inventory(this_player());
    string *items = map_array(inv, (: $1->query("short") :));
    
    send_zmp("inventory", ({"items"}) + items);
}

// 战斗插件
void handle_combat_command(string *args) {
    switch (args[0]) {
        case "status":
            send_combat_status();
            break;
        case "attack":
            this_player()->force_me("attack " + args[1]);
            break;
    }
}
```

---

## 现代MUD推荐配置

### 配置原则
现代MUD开发采用"GMCP优先"策略，保持与旧客户端的兼容性

### 完整配置示例
```bash
# config.mud
# 现代MUD标准配置
enable gmcp : 1    # 现代数据交换协议（主力协议）
enable mssp : 1    # 服务器列表必需协议
enable msp : 1     # 音效支持（有音频资源时开启）

# 兼容性配置（根据需求开启）
enable mxp : 0     # 富文本标记（现代Web客户端可替代）
enable zmp : 0     # 插件系统（GMCP可替代）
enable msdp : 0    # 键值对数据（GMCP可替代）
```

### 现代项目建议
- **新项目**: 仅启用GMCP + MSSP (+ MSP如有音效)
- **现有项目**: 逐步迁移MSDP/ZMP/MXP功能到GMCP
- **兼容性**: 保持旧协议支持直到用户完成迁移

---

## 协议对比与迁移

### 功能对照表
| 功能需求 | 传统协议 | GMCP实现 | 迁移优势 |
|----------|----------|----------|----------|
| **角色状态** | MSDP: HEALTH=100 | `{"hp":100,"max_hp":150}` | 结构化数据 |
| **房间描述** | MXP: `<color red>房间名` | `{"name":"房间名","color":"red"}` | 客户端渲染 |
| **地图插件** | ZMP: mapper.show | `{"module":"Map","action":"show"}` | JSON格式 |
| **物品列表** | MSDP: ITEMS=sword,shield | `{"items":[{"name":"剑"}]}` | 数组支持 |
| **战斗状态** | MSDP: IN_COMBAT=1 | `{"combat":{"active":true,"target":"敌人"}}` | 复杂数据 |

### 完整迁移示例
```lpc
// MSDP到GMCP迁移
// 旧版MSDP
void send_stats_old() {
    send_msdp_variable("HEALTH", this_player()->query("hp"));
    send_msdp_variable("MANA", this_player()->query("mp"));
}

// 新版GMCP
void send_stats_new() {
    mapping data = ([
        "health": this_player()->query("hp"),
        "mana": this_player()->query("mp"),
        "max_health": this_player()->query("max_hp"),
        "max_mana": this_player()->query("max_mp")
    ]);
    send_gmcp("Char.Vitals " + json_encode(data));
}
```

---

## 重要参考资源

### 协议规范文档
- **GMCP协议规范**: https://tintin.mudhalla.net/protocols/gmcp/
- **MSP协议规范**: https://www.zuggsoft.com/zmud/msp.htm
- **MSSP协议规范**: https://tintin.mudhalla.net/protocols/mssp/
- **MSDP协议规范**: https://tintin.mudhalla.net/protocols/msdp/
- **MXP协议规范**: https://www.zuggsoft.com/zmud/mxp.htm
- **ZMP协议规范**: http://discworld.starturtle.net/external/protocols/zmp.html

### 现代MUD开发原则

**现代配置 = GMCP(1) + MSSP(1) + MSP(可选)**

- **GMCP**: 承担所有数据交换功能
- **MSSP**: 保持服务器列表兼容性
- **MSP**: 音效支持（有音频资源时启用）
- **其他协议**: 保持兼容性，逐步迁移到GMCP