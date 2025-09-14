# itemd - 物品系统守护进程

## 功能概述

itemd守护进程负责管理游戏中的高级物品系统，包括物品浸透、圣化、镶嵌、召唤、追杀奖励、耐久度管理等复杂功能。支持武器的魔法属性增强和特殊效果。

## 核心数据结构

### 可浸透物品列表
```lpc
string *imbue_list = ({
    "/clone/fam/gift/int3",    // 智力+3
    "/clone/fam/gift/con3",    // 体质+3
    "/clone/fam/gift/str3",    // 力量+3
    "/clone/fam/gift/dex3",    // 敏捷+3
    "/clone/fam/item/stone4",  // 特殊石头
});

string *imbue_list2 = ({
    "/clone/fam/max/xuanhuang",     // 玄黄丹
    "/clone/fam/max/longjia",       // 龙甲丹
    "/clone/fam/obj/guo",           // 无花果
    "/clone/fam/item/bless_water",  // 圣水
});
```

### 浸透配置常量
```lpc
#define RANDOM_IMBUE_OK 50    // 浸透成功随机界限
#define SAN_PER_IMBUE 1       // 每次浸入需要圣化次数
```

## 接口函数

### 杀人奖励系统

#### killer_reward
```lpc
void killer_reward(object me, object victim, object item)
```
记录杀人信息并奖励武器属性增长。

**功能：**
- 记录武器击杀的好人/坏人数量
- 统计玩家击杀(PKS)和NPC击杀(MKS)
- 记录武器拥有者信息（最多12人）
- 根据击杀目标经验值奖励武器成长

**记录数据：**
- `combat/WPK_NOTBAD` - 击杀好人数量
- `combat/WPK_NOTGOOD` - 击杀坏人数量
- `combat/WPK_GOOD` - 击杀正义之士数量
- `combat/WPK_BAD` - 击杀邪恶之徒数量
- `combat/PKS` - 击杀玩家数量
- `combat/MKS` - 击杀NPC数量
- `owner` - 武器拥有者映射

### 物品召唤系统

#### receive_summon
```lpc
int receive_summon(object me, object item)
```
召唤属于自己的物品到身边，自动装备。

**消耗：**
- 精力：200点

**特殊效果：**
- 不同距离显示不同的召唤特效
- 自动装备武器和防具
- 移除物品的no_get属性

**召唤特效：**
- 物品在同一房间：直接获取
- 物品在其他地方：闪电、长虹、金光等特效

### 物品隐藏系统

#### hide_anywhere
```lpc
int hide_anywhere(object me, object item)
```
将物品隐藏到虚无空间。

**消耗：**
- 精力：100点

**限制：**
- 必须是物品所有者
- 物品被销毁但可随时召唤

### 物品追寻系统

#### receive_miss
```lpc
int receive_miss(object me, object item)
```
追寻物品位置并传送到该处。

**消耗：**
- 精力：300-400点（随机）

**限制：**
- 物品必须在户外环境
- 不能追寻在其他玩家身上的物品
- 显示华丽的传送特效

### 武器插地系统

#### do_stab
```lpc
int do_stab(object me, object item)
```
将武器插在地上，设置拾取限制。

**限制：**
- 必须是武器或手套类装备
- 必须在户外环境（巫师除外）

**效果：**
- 设置no_get属性
- 记录插地者ID
- 只有主人或插地者可以拾取

### 武器触摸系统

#### do_touch
```lpc
mixed do_touch(object me, object item)
```
触摸物品触发特殊效果。

**效果：**
- 非所有者会受到伤害（50-100点气伤害）
- 所有者消耗精力触发随机特效
- 极低概率触发群体治疗（1/1000）
- 正常情况下恢复内力到最大值

### 武器强化系统

#### do_san（圣化）
```lpc
int do_san(object me, object item)
```
对武器进行圣化，为后续浸透做准备。

**要求：**
- 内力≥最大内力的90%
- 精力≥最大精力的90%
- 基本内功技能≥300级
- 最大内力≥8000
- 最大精力≥1000

**消耗：**
- 最大内力：-(圣化次数+5)
- 内力：-(圣化次数×10+100)
- 最大精力：-(圣化次数+5)
- 精力：-(圣化次数×5+50)
- 经验：-(圣化次数×100+1000)
- 潜能：-(圣化次数×10+100)

**风险：**
- 内力未满时有概率降低基本内功技能10-15级

#### do_imbue（浸透）
```lpc
int do_imbue(object me, object item, object imbue)
```
使用特殊物品对武器进行浸透增强。

**要求：**
- 武器必须完成圣化（sizeof(magic/do_san) ≥ SAN_PER_IMBUE）
- 使用正确的浸透物品
- 浸透物品必须在可浸透列表中

**成功条件：**
- random(浸透次数) ≥ RANDOM_IMBUE_OK (50)

#### do_enchase（镶嵌）
```lpc
int do_enchase(object me, object item, object tessera)
```
在武器上镶嵌宝石，赋予魔法属性。

**要求：**
- 武器必须完成浸透（magic/imbue_ok）
- 镶嵌技能≥200级
- 宝石必须可以镶嵌（can_be_enchased）
- 宝石必须有魔法属性

**效果：**
- 赋予武器魔法威力和类型
- 增加武器重量
- 发布系统传闻

### 魔法武器战斗系统

#### weapon10lv_hit_ob
```lpc
mixed weapon10lv_hit_ob(object me, object victim, object weapon, int damage_bonus)
```
10级魔法武器的特殊攻击效果。

**支持魔法类型：**
- `lighting` - 闪电攻击：伤害内力和气
- `cold` - 冷冻攻击：伤害精和气
- `fire` - 火焰攻击：伤害精和气
- `magic` - 魔法攻击：吸取气和内力

**特效：**
- 随机触发6种不同的强力攻击招式
- 可能触发12连环攻击（continue_attack）

#### weapon_hit_ob
```lpc
mixed weapon_hit_ob(object me, object victim, object weapon, int damage_bonus)
```
9级魔法武器的特殊攻击效果。

**特效：**
- 4种不同的伤害效果
- 可能触发5-8次连续攻击

### 耐久度管理系统

#### reduce_consistence
```lpc
void reduce_consistence(object item)
```
降低物品的耐久度。

**特殊材料：**
- 寰宇天晶（tian jing）- 永不磨损

#### equip_setup
```lpc
void equip_setup(object item)
```
设置物品的默认耐久度属性。

**材料稳定性表：**
| 材料 | 稳定性 | 特点 |
|------|--------|------|
| cloth | 0 | 永不损坏 |
| paper | 3 | 无法修理 |
| bone | 8 | 难以修理 |
| bamboo/wood | 10 | 难以修理 |
| copper/silver | 40 | 可修理 |
| iron | 45 | 可修理 |
| gold | 50 | 可修理 |
| steel | 75 | 可修理 |
| stone | 80 | 可修理 |
| 其他 | 100 | 高稳定性 |

## 工作流程

### 武器强化流程
1. **圣化准备** - 多位高手进行圣化
2. **浸透选择** - 选择合适的浸透物品
3. **浸透执行** - 进行浸透，可能失败
4. **镶嵌准备** - 达到浸透完成状态
5. **宝石镶嵌** - 镶嵌魔法宝石
6. **魔法武器完成** - 获得魔法属性和特效

### 物品召唤流程
1. **位置检查** - 确认物品位置和状态
2. **精力消耗** - 扣除200点精力
3. **特效显示** - 根据距离显示不同特效
4. **物品移动** - 将物品移动到玩家身上
5. **自动装备** - 自动装备武器和防具

## 使用示例

```lpc
// 记录击杀奖励
itemd->killer_reward(killer, victim, weapon);

// 召唤物品
if (itemd->receive_summon(me, item)) {
    tell_object(me, "召唤成功！");
}

// 圣化武器
if (itemd->do_san(me, weapon)) {
    tell_object(me, "圣化完成！");
}

// 浸透武器
object imbue_ob = new(imbue_list[random(sizeof(imbue_list))]);
if (itemd->do_imbue(me, weapon, imbue_ob)) {
    tell_object(me, "浸透成功！");
}

// 镶嵌宝石
if (itemd->do_enchase(me, weapon, tessera)) {
    tell_object(me, "镶嵌成功！");
}
```

## 技术特点

- **完整的强化链** - 圣化→浸透→镶嵌的完整武器强化系统
- **丰富的特效** - 多种视觉效果和战斗特效
- **所有权系统** - 严格的物品所有权验证
- **平衡性设计** - 各种消耗和风险平衡机制
- **魔法战斗系统** - 支持多种魔法属性的武器特效
- **耐久度管理** - 基于材料的差异化耐久度系统