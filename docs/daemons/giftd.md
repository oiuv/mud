# GIFT_D - 奖励系统守护进程

## 概述
GIFT_D 是MUD游戏的奖励系统守护进程，专门负责处理玩家在游戏中获得的各种奖励，包括经验、潜能、实战体会、神等。它提供了统一的奖励分配机制，确保奖励的公平性和一致性。

## 核心功能

### 奖励类型
- **经验奖励 (exp)**: 提升玩家等级
- **潜能奖励 (pot)**: 用于学习技能
- **实战体会 (mar)**: 提升实战经验
- **神奖励 (shen)**: 影响玩家道德值
- **声望奖励 (score)**: 提升江湖声望
- **技能奖励**: 提升特定技能等级

### 延迟奖励机制
- 支持延迟1-3秒发放奖励
- 确保奖励消息显示在事件之后
- 避免奖励消息被刷屏覆盖

## 主要接口函数

### 基础奖励
```lpc
// 通用奖励接口
varargs void bonus(object who, mapping b, int flag);

// 参数说明：
// who - 接受奖励的玩家对象
// b - 奖励映射，包含奖励类型和数量
// flag - 特殊标志位（可选）

// 示例：
mapping reward = ([
    "exp": 1000,      // 经验奖励
    "pot": 500,       // 潜能奖励
    "mar": 200,       // 实战体会
    "shen": 50        // 神值奖励
]);
GIFT_D->bonus(player, reward);
```

### 延迟奖励
```lpc
// 延迟通用奖励（1秒后发放）
void delay_bonus(object who, mapping b);

// 延迟工作奖励（1秒后发放）
void delay_work_bonus(object who, mapping b);

// 延迟自由任务奖励（3秒后发放）
void delay_freequest_bonus(object who);

// 延迟礼物奖励（1秒后发放）
void delay_gift_bonus(object who, mapping b);
```

### 专用奖励接口
```lpc
// 工作奖励（如打工、任务完成）
varargs void work_bonus(object who, mapping b);

// 礼物奖励（特殊物品奖励）
varargs void gift_bonus(object who, mapping b);

// 自由任务奖励（随机任务奖励）
varargs void freequest_bonus(object who);
```

## 奖励计算机制

### 奖励公式
```lpc
// 经验奖励计算
exp = base_exp * (1 + random(20) / 100);

// 潜能奖励计算
pot = base_pot * (1 + random(20) / 100);

// 实战体会计算
mar = base_mar * (1 + random(20) / 100);
```

### 奖励上限
- 经验：受玩家当前等级限制
- 潜能：受玩家潜能上限限制
- 实战体会：无上限
- 神值：受玩家当前神值限制

## 奖励类型详解

### 标准奖励映射
```lpc
mapping reward = ([
    "exp": 1000,      // 经验值
    "pot": 500,       // 潜能值
    "mar": 200,       // 实战体会
    "shen": 50,       // 神值
    "score": 100,     // 声望值
    "weiwang": 50     // 威望值
]);
```

### 技能奖励
```lpc
// 提升特定技能
mapping skill_reward = ([
    "skill_name": "force",
    "improve": 1000   // 技能提升值
]);
```

## 使用示例

### 基础奖励使用
```lpc
// 玩家完成任务获得奖励
void give_quest_reward(object player)
{
    mapping reward = ([
        "exp": 5000,
        "pot": 2500,
        "mar": 1000,
        "score": 200
    ]);

    GIFT_D->bonus(player, reward);
}
```

### 延迟奖励使用
```lpc
// 玩家击败NPC后延迟奖励
void on_npc_death(object player, object npc)
{
    mapping reward = ([
        "exp": npc->query("combat_exp") / 10,
        "pot": npc->query("combat_exp") / 20,
        "mar": npc->query("combat_exp") / 50
    ]);

    // 延迟3秒发放，确保死亡消息先显示
    GIFT_D->delay_bonus(player, reward);
}
```

### 工作奖励使用
```lpc
// 玩家完成工作获得奖励
void complete_work(object player, string work_type)
{
    mapping reward;

    switch (work_type) {
    case "mining":
        reward = (["exp": 100, "pot": 50]);
        break;
    case "fishing":
        reward = (["exp": 80, "pot": 40]);
        break;
    default:
        reward = (["exp": 50, "pot": 25]);
    }

    GIFT_D->work_bonus(player, reward);
}
```

## 心跳机制

### 自动清理
```lpc
// 每15分钟心跳一次
set_heart_beat(900);

// 心跳时执行清理操作
protected void heart_beat()
{
    // 清理过期奖励记录等
}
```

## 系统配置

### 守护进程配置
- 心跳间隔：900秒（15分钟）
- 频道ID："奖励精灵"
- 清理周期：15分钟

### 奖励平衡
- 奖励数值根据玩家等级动态调整
- 防止过度奖励
- 保持游戏平衡性

## 调试功能

### 奖励日志
```lpc
// 记录奖励发放日志
log_file("gift", sprintf("%s give %O to %s\n",
    ctime(time()), reward, player->name()));
```

### 奖励统计
- 每日奖励统计
- 玩家奖励历史
- 系统奖励总量监控

## 相关文件
- `/adm/daemons/giftd.c` - 守护进程实现
- `/include/quest.h` - 任务相关定义
- `/log/gift` - 奖励发放日志

## 注意事项
- 奖励数值需要平衡，避免破坏游戏经济
- 延迟奖励机制确保消息显示顺序正确
- 所有奖励都经过系统统一处理，确保公平性
- 奖励上限机制防止玩家过度刷取

GIFT_D 作为游戏奖励系统的核心组件，为所有游戏活动提供标准化的奖励机制，确保玩家体验的公平性和游戏系统的稳定性。通过统一的奖励接口，简化了游戏开发中的奖励处理逻辑。`,