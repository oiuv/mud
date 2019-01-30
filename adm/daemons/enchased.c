// Written By Lonely@Nitan3

#include <ansi.h>

// #pragma optimize
// #pragma save_binary

#define NAME    0
#define DESC    1
#define VALUE   2
/*
mixed *jewel = ({
        ({ "宝石碎片", "一片宝石碎片。", 80000 }),
        ({ "宝石", "一块金光闪闪的精美宝石，华丽异常。", 100000 }),
        ({ "稀世宝石", "一块金光闪闪的精美宝石，给人以不同寻常的感觉。", 120000 }),
        ({ "帝之宝石", "一块闪烁这奇异光芒的宝石，让人感到一阵阵的心悸。", 140000 }),
        ({ "圣之宝石", "一块闪烁这奇异光芒的宝石，让人感到一阵阵的心悸。", 160000 }),
        ({ "魔之宝石", "一块闪烁这奇异光芒的宝石，让人感到一阵阵的心悸。", 180000 }),
        ({ "神之宝石", "一块闪烁这奇异光芒的宝石，让人感到一阵阵的心悸。", 200000 }),
});
*/
mapping special_data = ([
        /*
        "int"   : "后天悟性",
        "str"   : "后天臂力",
        "con"   : "后天根骨",
        "dex"   : "后天身法",
        	*/
        	//新增 by 薪有所属 统一为四字风格，看着整齐。后续如果有新属性随时补充更新。
        	//附加属性有这个但实际query_per()中此属性无效，故定义为无效容貌
        "personality"   : "无效容貌",
        "attack"        : "战斗攻击",
        "defense"       : "战斗防御",
        "parry"         : "有效招架",
        "dodge"         : "有效轻功",
        "force"         : "有效内功",
        "armor"         : "战斗护甲",
        "damage"        : "兵器伤害",
        "unarmed_damage": "空手伤害",
        "unarmed"       : "有效拳脚",
        "cuff"          : "有效拳法",
        "strike"        : "有效掌法",
        "hand"          : "有效手法",
        "finger"        : "有效指法",
        "claw"          : "有效爪法",
        "warm"          : "保暖能力",
        	
        	/*
        	//留着作相关属性翻译参考
        "max_neili"     : "最大内力上限",
        "max_jingli"    : "最大精力上限",
        "max_qi"        : "最大气血上限",
        "max_jing"      : "最大精气上限",
        "max_potential" : "最大潜能上限",
        "max_experience": "最大体会上限",
        "attack"        : "战斗攻击力有效等级",
        "defense"       : "战斗防御力有效等级",
        "parry"         : "战斗招架力有效等级",
        "dodge"         : "战斗躲闪力有效等级",
        "armor"         : "战斗保护力",
        "damage"        : "战斗兵器伤害力",
        "unarmed_damage": "战斗拳脚伤害力",
        "ap_power"      : "绝招战斗攻击力百分比",
        "dp_power"      : "绝招战斗防御力百分比",
        "da_power"      : "绝招战斗伤害力百分比",
        "add_poison"            : "附带毒气攻击效果百分比",
        "reduce_poison"         : "化解毒气攻击效果百分比",
        "avoid_poison"          : "回避毒气攻击机率百分比",
        "add_cold"              : "附带冷冻攻击效果百分比",
        "add_fire"              : "附带火焰攻击效果百分比",
        "add_lighting"          : "附带闪电攻击效果百分比",
        "add_magic"             : "附带魔法攻击效果百分比",
        "reduce_cold"           : "化解冷冻攻击效果百分比",
        "reduce_fire"           : "化解火焰攻击效果百分比",
        "reduce_lighting"       : "化解闪电攻击效果百分比",
        "reduce_magic"          : "化解魔法攻击效果百分比",
        "avoid_cold"            : "回避冷冻攻击机率百分比",
        "avoid_fire"            : "回避火焰攻击机率百分比",
        "avoid_lighting"        : "回避闪电攻击机率百分比",
        "avoid_magic"           : "回避魔法攻击机率百分比",
        "effjing_recover"       : "提高每次最大精气恢复值",
        "effqi_recover"         : "提高每次最大气血恢复值",
        "research_times": "提升研究的次数",
        "learn_times"   : "提升学习的次数",
        "practice_times": "提升练习的次数",
        "derive_times"  : "提升汲取的消耗",
        "study_times"   : "提升读书的次数",
        "study_effect"  : "提升读书的效果百分比",
        "learn_effect"  : "提升学习的效果百分比",
        "avoid_parry"   : "回避特殊招架机率百分比",                     // 符文防具
        "avoid_dodge"   : "回避特殊躲闪机率百分比",                     // 符文防具
        "avoid_attack"  : "回避特殊攻击机率百分比",                     // 符文防具
        "reduce_age"    : "降低自己的年纪",
        "research_effect"       : "提升研究的效果百分比",
        "practice_effect"       : "提升练习的效果百分比",
        "derive_effect"         : "提升汲取的效果百分比",
        
        "avoid_noperform"       : HIR "回避绝招使用限制机率百分比",         // 终极兵器
        "target_noperform"      : HIB "限制对手使用绝招机率百分比",         // 终极防具
        "add_busy"      : HIR "对手忙乱秒数",                           // 终极兵器
        "reduce_busy"   : HIB "化解忙乱秒数",                               // 终极防具
        "avoid_busy"    : HIB "回避忙乱机率百分比",                         // 终极防具
        "xuruo_status"  : HIR "让对手处于虚弱状态机率百分比",               // 终极兵器
        "avoid_xuruo"   : HIB "回避虚弱机率百分比",                         // 终极防具
        "add_skilllevel": HIR "提升所有技能等级",                           // 终极兵器
        "add_damage"    : HIR "追加最终伤害百分比",                         // 终极兵器
        "reduce_damage" : HIB "化解最终伤害百分比",                         // 终极防具
        	*/
]);

string special_desc(string arg)
{
        if (! undefinedp(special_data[arg]))
                return special_data[arg];
        else
                return to_chinese(arg);
}
