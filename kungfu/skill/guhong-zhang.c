#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「奔流直下」，右掌一翻，向$n的$l拍去",
        "force"  : 55,
	"attack" : 4,
        "dodge"  : 30,
        "parry"  : 25,       
        "damage" : 20, 
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "奔流直下",
]),
([      "action" : "$N使一招「力挡群山」，右手斜出，劈向$n的$l",
        "force"  : 68,
	"attack" : 6,
        "dodge"  : 48,
        "parry"  : 30,        
        "damage" : 30, 
        "lvl"    : 25,
        "damage_type" : "瘀伤",
        "skill_name"  : "力挡群山",
]),
([      "action" : "$N双手带风，一式「单刀附会」，掌力浑厚，击向$n的$l",
        "force"  : 78,
	"attack" : 10,
        "dodge"  : 50,
        "parry"  : 60,        
        "damage" : 38, 
        "lvl"    : 50,
        "damage_type" : "瘀伤",
        "skill_name"  : "单刀附会", 
]),
([      "action" : "$N双手微抬，左右齐出，一招「水中探月」，已将$n$l笼罩",
        "force"  : 86,
	"attack" : 12,
        "dodge"  : 44,
        "parry"  : 71,      
        "damage" : 45, 
        "lvl"    : 70,
        "damage_type" : "瘀伤",
         "skill_name" : "水中探月",
]),
([      "action" : "$N双掌翻腾，掌风凌厉，一式「春风细雨」，飘然不定，击向$n$l",
        "force"  : 100,
	"attack" : 15,
        "dodge"  : 55,
        "parry"  : 60,       
        "damage" : 50, 
        "lvl"    : 90,
        "damage_type" : "瘀伤",
        "skill_name"  : "春风细雨",
]),
([      "action" : "$N双掌拍出，一式「双管齐下」，掌法一快一慢，向$n的$l打去",
        "force"  : 125,
	"attack" : 15,
        "dodge"  : 60,
        "parry"  : 55, 
        "damage" : 55,        
        "lvl"    : 100,
        "damage_type" : "瘀伤",
        "skill_name"  : "双管齐下",
]),
([      "action" : "$N快步向前，身法陡快，一招「秋卷落叶」，掌风已到$n$l",
        "force"  : 140,
	"attack" : 18,
        "dodge"  : 80,
        "parry"  : 71, 
        "damage" : 63,     
        "lvl"    : 110,
        "damage_type" : "瘀伤",
        "skill_name"  : "秋卷落叶",
]),
([      "action" : "$N双掌下垂，似是无力，但又猛然加快，似攻非攻，一式「人海孤鸿」\n"
                   "使出，双掌已到$n$l",
        "force"  : 155,
	"attack" : 25,
        "dodge"  : 76,
        "parry"  : 80,   
        "damage" : 80,    
        "lvl"    : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "人海孤鸿",
]),
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练孤鸿掌法必须空手。\n");

        if ((int)me->query_skill("force") < 40)
                return notify_fail("你的内功火候不够，无法学孤鸿掌法。\n");

        if ((int)me->query("max_neili") < 120)
                return notify_fail("你的内力太弱，无法练孤鸿掌法。\n");

        if ((int)me->query_skill("strike", 1) < 30)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("guhong-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的孤鸿掌法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
            if (level >= action[i]["lvl"])
                return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("guhong-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练孤鸿掌法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"guhong-zhang/" + action;
}
