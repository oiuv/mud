# combatd - 战斗守护进程

## 📋 概述

combatd 是炎黄群侠传MUD游戏的战斗消息守护进程，负责处理战斗中的伤害消息显示、战斗状态描述和PK数据管理。基于实际代码实现，提供丰富的战斗描述系统。

## 🎯 主要功能

### 1. 伤害消息系统
- **多类型伤害支持**: 擦伤、刺伤、瘀伤、震伤、内伤、点穴、抽伤等
- **6级伤害分级**: 根据伤害值自动匹配合适的描述级别
- **上下文感知**: 支持攻击者和防御者的个性化描述

### 2. 战斗状态管理
- **警戒消息**: 战斗开始前的警戒状态描述
- **追击消息**: 战斗追击过程的描述
- **胜负消息**: 战斗结束时的胜负描述

### 3. PK数据管理
- **PK信息记录**: 记录玩家间的战斗数据
- **PK信息查询**: 提供PK信息查询接口
- **战斗统计**: 维护战斗相关的统计数据

### 4. 消息模板系统
- **丰富的消息库**: 每种伤害类型都有6个级别的描述模板
- **占位符支持**: 支持攻击者、防御者、部位等动态替换
- **个性化显示**: 根据战斗情况选择合适的描述

## 💻 技术实现

### 核心消息模板

```lpc
// 擦伤消息模板（6个级别）
string *scratch_msg = ({
    "只见$n一声惨叫，被$N在$p$l擦出一道血痕。",
    "$N一招下去，$n的$l被划出一条细长的血痕。",
    "$N的攻击划破了$n$l的表皮，渗出一丝血珠。",
    "$N的攻势在$n$l擦出一道血痕，$n痛得咧了咧嘴。",
    "只见$N一招命中，$n的$l被划出一道又长又深的血痕。",
    "血光飞溅中，$N重重地划破了$n的$l，伤口处皮肉都翻了起来。"
});

// 其他伤害类型类似定义...
```

### 主要函数接口

#### 伤害消息生成
```lpc
string damage_msg(int damage, string type)
```
- **参数**: damage - 伤害值, type - 伤害类型
- **返回**: 格式化后的伤害描述消息
- **功能**: 根据伤害值和类型生成相应的伤害描述

#### PK信息管理
```lpc
void add_pk_list(string id1, string id2, int flag)
void delete_pk(string id1, string id2)
mapping query_pk_list(string id)
```
- **功能**: PK信息的记录、删除和查询

#### 战斗前后信息
```lpc
void set_bhinfo(string msg)   // 设置战斗前信息
void set_ahinfo(string msg)   // 设置战斗后信息
string query_bhinfo()         // 获取战斗前信息
string query_ahinfo()         // 获取战斗后信息
```

## 🔄 工作流程

### 伤害消息生成流程

1. **伤害值分级**
   ```lpc
   // 根据伤害值确定等级（0-5）
   if (damage < 10) level = 0;
   else if (damage < 25) level = 1;
   else if (damage < 50) level = 2;
   else if (damage < 100) level = 3;
   else if (damage < 200) level = 4;
   else level = 5;
   ```

2. **消息模板选择**
   ```lpc
   // 根据伤害类型选择对应的消息数组
   switch (type) {
   case "擦伤": msg = scratch_msg[level]; break;
   case "刺伤": msg = stab_msg[level]; break;
   // ... 其他伤害类型
   }
   ```

3. **占位符替换**
   ```lpc
   // 替换消息中的占位符
   msg = replace_string(msg, "$N", attacker_name);
   msg = replace_string(msg, "$n", defender_name);
   msg = replace_string(msg, "$p", defender_possessive);
   msg = replace_string(msg, "$l", limb_name);
   ```

## ⚙️ 伤害类型系统

### 支持的物理伤害类型

| 伤害类型 | 典型描述 | 占位符示例 |
|----------|----------|------------|
| 擦伤 | "划出一道血痕" | 皮肤表层受伤 |
| 刺伤 | "刺了个正中" | 穿刺性伤害 |
| 瘀伤 | "被打得瘀青了" | 钝器撞击伤害 |
| 割伤 | "被划出一道伤口" | 切割性伤害 |
| 震伤 | "被震得气血翻涌" | 内力震荡伤害 |
| 内伤 | "受了点内伤" | 内劲造成的内伤 |
| 点穴 | "被点中要穴" | 穴位攻击 |
| 抽伤 | "被抽得皮开肉绽" | 鞭类武器伤害 |

### 伤害等级划分

| 等级 | 伤害值范围 | 描述特征 |
|------|------------|----------|
| 0级 | 0-9 | 轻微，几乎无感 |
| 1级 | 10-24 | 轻伤，略有疼痛 |
| 2级 | 25-49 | 中等，明显疼痛 |
| 3级 | 50-99 | 重伤，影响行动 |
| 4级 | 100-199 | 严重，行动困难 |
| 5级 | 200+ | 极重，生命垂危 |

### 占位符系统

| 占位符 | 说明 | 示例 |
|--------|------|------|
| $N | 攻击者姓名 | "张三" |
| $n | 防御者姓名 | "李四" |
| $p | 防御者所有格 | "李四的" |
| $l | 受伤部位 | "右臂" |

## ⚠️ 开发注意事项

### 消息模板管理
1. **模板完整性** - 每种伤害类型必须包含6个级别的消息
2. **占位符一致性** - 确保所有占位符在模板中正确使用
3. **上下文适配** - 消息内容要适合战斗上下文

### 性能优化
1. **数组访问** - 使用数组索引而非循环查找
2. **字符串处理** - 优化replace_string的调用次数
3. **内存管理** - 避免创建过多的临时字符串

### 扩展性考虑
1. **伤害类型扩展** - 支持添加新的伤害类型
2. **等级扩展** - 支持调整伤害等级划分
3. **占位符扩展** - 支持新的动态内容占位符

## 🔧 开发接口

### 基础使用
```lpc
// 生成伤害消息
string msg = COMBAT_D->damage_msg(damage, "刺伤");
msg = replace_string(msg, "$N", me->name());
msg = replace_string(msg, "$n", you->name());
msg = replace_string(msg, "$l", "胸口");

// 显示消息
tell_object(you, msg);
```

### PK信息记录
```lpc
// 记录PK信息
COMBAT_D->add_pk_list(killer_id, victim_id, 1);

// 查询PK信息
mapping pk_info = COMBAT_D->query_pk_list(player_id);
```

### 战斗前后信息
```lpc
// 设置战斗前信息
COMBAT_D->set_bhinfo("两人仇人相见，分外眼红！");

// 设置战斗后信息
COMBAT_D->set_ahinfo("战斗结束后，两人各自收招。");
```

## 📋 相关功能

### 警戒消息示例
```lpc
// 生成警戒消息
msg = guard_msg[random(sizeof(guard_msg))];
msg = replace_string(msg, "$N", attacker->name());
msg = replace_string(msg, "$n", defender->name());
```

### 追击消息示例
```lpc
// 生成追击消息
msg = catch_hunt_msg[random(sizeof(catch_hunt_msg))];
msg = replace_string(msg, "$N", attacker->name());
msg = replace_string(msg, "$n", defender->name());
```

---
*基于 adm/daemons/combatd.c 实际代码实现*
*维护团队：炎黄群侠传开发组*