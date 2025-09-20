# CHAR_D - 角色设置守护进程

## 概述
CHAR_D 是MUD游戏的角色设置守护进程，负责根据角色种族设置角色的基本属性和能力。它为不同类型的角色（人类、妖魔、野兽）提供标准化的初始化配置，并处理角色死亡时的尸体生成。

## 核心功能

### 角色初始化
- **种族识别**：根据角色种族调用相应的设置程序
- **默认种族**：未指定种族时默认为"人类"
- **属性初始化**：设置角色的基本属性值
- **种族特性**：不同种族具有不同的初始配置

### 种族支持
- **人类**：调用human种族设置
- **妖魔**：调用monster种族设置
- **野兽**：调用beast种族设置
- **错误处理**：未知种族会报错

### 尸体管理
- **尸体生成**：角色死亡时生成尸体对象
- **物品掉落**：处理角色死亡时的物品掉落
- **幽灵处理**：幽灵状态角色不生成尸体
- **巫师例外**：巫师不生成尸体

## 主要接口函数

### 角色设置
```lpc
// 设置角色基本属性
void setup_char(object ob)

// 参数：
// ob - 要设置的角色对象

// 处理流程：
// 1. 确定角色种族（默认人类）
// 2. 调用对应的种族设置程序
// 3. 初始化基本属性值
// 4. 设置负重能力
// 5. 重置动作
```

### 尸体生成
```lpc
// 生成角色尸体
varargs object make_corpse(object victim, object killer)

// 参数：
// victim - 死亡的角色对象
// killer - 击杀者对象（可选）

// 返回：生成的尸体对象，失败返回0
```

## 种族设置程序

### 种族定义
```lpc
#define HUMAN_RACE   "/adm/daemons/race/human"    // 人类种族设置
#define BEAST_RACE   "/adm/daemons/race/beast"    // 野兽种族设置
#define MONSTER_RACE "/adm/daemons/race/monster"  // 妖魔种族设置
```

### 种族处理流程
```lpc
// 根据种族调用对应设置
switch (race)
{
case "人类":
    HUMAN_RACE->setup_human(ob);
    break;
case "妖魔":
    MONSTER_RACE->setup_monster(ob);
    break;
case "野兽":
    BEAST_RACE->setup_beast(ob);
    break;
default:
    error("Chard: undefined race " + race + ".\n");
}
```

## 属性初始化

### 基本属性设置
```lpc
// 气血和精神初始值
if (undefinedp(my["jing"]))
    my["jing"] = my["max_jing"];
if (undefinedp(my["qi"]))
    my["qi"] = my["max_qi"];

// 有效气血和精神
if (undefinedp(my["eff_jing"]) || my["eff_jing"] > my["max_jing"])
    my["eff_jing"] = my["max_jing"];
if (undefinedp(my["eff_qi"]) || my["eff_qi"] > my["max_qi"])
    my["eff_qi"] = my["max_qi"];
```

### 神值初始化
```lpc
// 神类型设置
if (undefinedp(my["shen_type"]))
    my["shen_type"] = 0;

// 神值计算
if (undefinedp(my["shen"]))
{
    if (userp(ob))
        my["shen"] = 0;  // 玩家初始为0
    else
        my["shen"] = my["shen_type"] * my["combat_exp"] / 10;  // NPC按经验计算
}
```

### 负重能力设置
```lpc
// 计算最大负重
if (!ob->query_max_encumbrance())
    ob->set_max_encumbrance(20000 + ob->query("str") * 2000 + ob->query_str() * 300);
```

## 尸体生成机制

### 生成条件
- **排除巫师**：巫师角色不生成尸体
- **排除幽灵**：幽灵状态角色不生成尸体
- **物品掉落**：死亡时物品会掉落到环境中

### 尸体处理流程
```lpc
// 物品掉落处理
inv = all_inventory(victim);
inv->owner_is_killed(killer);
inv -= ({0});

// 物品位置处理
while (i--)
{
    if (environment(victim)->is_area())
        area_move_side(inv[i], victim);  // 区域环境特殊处理
    else
        inv[i]->move(environment(victim));  // 普通环境直接掉落
}
```

### 尸体对象创建
```lpc
// 创建尸体对象
corpse = new (CORPSE_OB);
corpse->make_corpse(victim, killer);
return corpse;
```

## 使用示例

### 设置新角色
```lpc
// 创建新角色时调用
object player = new (PLAYER_OB);
CHAR_D->setup_char(player);
```

### 角色死亡处理
```lpc
// 角色死亡时生成尸体
object killer = attacker;
object corpse = CHAR_D->make_corpse(victim, killer);
if (corpse)
    corpse->move(environment(victim));
```

## 系统配置

### 权限设置
```lpc
void create() { seteuid(getuid()); }
// 设置有效用户ID，确保有权限访问种族设置程序
```

### 注释说明
- **已注释代码**：关于内力和精力上限的检查被注释掉
- **巫师保护**：明确说明巫师不生成尸体
- **种族错误**：未知种族会产生明确的错误信息

## 相关文件
- `/adm/daemons/chard.c` - 角色设置守护进程
- `/adm/daemons/race/human.c` - 人类种族设置
- `/adm/daemons/race/beast.c` - 野兽种族设置
- `/adm/daemons/race/monster.c` - 妖魔种族设置
- 尸体对象：CORPSE_OB

## 注意事项
- 角色必须有明确的种族定义
- 不同种族会调用不同的设置程序
- 巫师角色死亡不会生成尸体
- 幽灵状态的角色物品会直接掉落
- 负重能力基于力量属性计算
- 神值计算方式在玩家和NPC间有区别

CHAR_D 为MUD游戏提供了标准化的角色初始化机制，确保不同种族的角色具有合适的初始配置，同时处理角色死亡时的物品掉落和尸体生成，是角色管理的重要组成部分。'