#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「冰封万里」，右掌一翻，向$n的$l拍去",
        "force"  : 90,
	"attack" : 4,
        "dodge"  : 30,
        "parry"  : 25,       
        "damage" : 25, 
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "冰封万里",
]),
([      "action" : "$N使一招「不寒而栗」，左手猛地拍向$n的$l",
        "force"  : 110,
	"attack" : 6,
        "dodge"  : 48,
        "parry"  : 30,        
        "damage" : 40, 
        "lvl"    : 25,
        "damage_type" : "瘀伤",
        "skill_name"  : "不寒而栗",
]),
([      "action" : "$N双目微闭，一式「冰冻三尺」，掌力浑厚，击向$n的$l",
        "force"  : 120,
	"attack" : 10,
        "dodge"  : 50,
        "parry"  : 60,        
        "damage" : 48, 
        "lvl"    : 50,
        "damage_type" : "瘀伤",
        "skill_name"  : "冰冻三尺", 
]),
([      "action" : "$N双手微抬，左右齐出，一招「水火不容」，已将$n$l笼罩",
        "force"  : 150,
	"attack" : 12,
        "dodge"  : 44,
        "parry"  : 71,      
        "damage" : 55, 
        "lvl"    : 70,
        "damage_type" : "瘀伤",
         "skill_name" : "水火不容",
]),
([      "action" : "$N双掌翻腾，却欲停止，一式「万里雪飘」，飘然不定，击向$n$l",
        "force"  : 180,
	"attack" : 15,
        "dodge"  : 55,
        "parry"  : 60,       
        "damage" : 60, 
        "lvl"    : 90,
        "damage_type" : "瘀伤",
        "skill_name"  : "万里雪飘",
]),
([      "action" : "$N单掌直出，内劲十足，一式「寒冰无极」，掌法一快一慢，向$n的$l打去",
        "force"  : 210,
	"attack" : 15,
        "dodge"  : 60,
        "parry"  : 62, 
        "damage" : 70,        
        "lvl"    : 100,
        "damage_type" : "瘀伤",
        "skill_name"  : "寒冰无极",
]),
([      "action" : "$N快步踏出，双掌暗自运劲，一招「冰天雪地」，掌风已到$n$l",
        "force"  : 240,
	"attack" : 18,
        "dodge"  : 80,
        "parry"  : 71, 
        "damage" : 80,     
        "lvl"    : 110,
        "damage_type" : "瘀伤",
        "skill_name"  : "冰天雪地",
]),
([      "action" : "$N左掌忽地拍向$n，又突然收回，紧跟着右掌斜出，一招「"
                   "天寒地冻」劈向$n$l",
        "force"  : 280,
	"attack" : 25,
        "dodge"  : 76,
        "parry"  : 80,   
        "damage" : 90,    
        "lvl"    : 120,
        "damage_type" : "瘀伤",
        "skill_name"  : "天寒地冻",
]),
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练寒冰掌必须空手。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候不够，无法学寒冰掌。\n");

        if ((int)me->query("max_neili") < 600)
                return notify_fail("你的内力太弱，无法练寒冰掌。\n");

        if ((int)me->query_skill("strike", 1) < 100)
                return notify_fail("你的基本掌法火候太浅。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("hanbing-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的寒冰掌。\n");

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
        level = (int) me->query_skill("hanbing-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练寒冰掌。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -60);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hanbing-zhang/" + action;
}
