#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「滚滚长江」，左手斜出，一掌向$n的$l打去",
        "force"  : 10,
        "dodge"  : 30,
        "parry"  : 25,       
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "滚滚长江",
]),
([      "action" : "$N使一招「大江东去」，右手挥出，劈向$n的$l",
        "force" : 25,
        "dodge" : 48,
        "parry" : 30,        
        "lvl"   : 10,
        "damage_type" : "瘀伤",
        "skill_name"  : "大江东去",
]),
([      "action" : "$N双手回撤，忽地反转，一式「天日无华」，击向$n的$l",
        "force"  : 35,
        "dodge"  : 50,
        "parry"  : 45,        
        "lvl"    : 20,
        "damage_type" : "瘀伤",
        "skill_name"  : "天日无华", 
]),
([      "action" : "$N双手分开，左右齐出，一招「水火不容」，分击$n的面门和$l",
        "force" : 42,
        "dodge" : 44,
        "parry" : 71,      
        "lvl"   : 30,
        "damage_type" : "瘀伤",
         "skill_name" : "水火不容",
]),
([      "action" : "$N单脚踏出，屈身向前，一式「连绵不绝」，击向$n$l",
        "force"  : 50,
        "dodge"  : 55,
        "parry"  : 60,       
        "lvl"    : 42,
        "damage_type" : "瘀伤",
        "skill_name"  : "连绵不绝",
]),
([      "action" : "$N双手猛然回收，突然右掌直出，一式「漫天花雨」向$n的$l打去",
        "force"  : 60,
        "dodge"  : 60,
        "parry"  : 62,        
        "lvl"    : 55,
        "damage_type" : "瘀伤",
        "skill_name"  : "漫天花雨",
]),
([      "action" : "$N快步向前，一招「阳光娇子」，左掌直击$n$l",
        "force"  : 70,
        "dodge"  : 54,
        "parry"  : 71,     
        "lvl"    : 65,
        "damage_type" : "瘀伤",
        "skill_name"  : "阳光娇子",
]),
([      "action" : "$N掌风凌厉，掌速猛然变快，一式「会心一击」双掌已到$n$l",
        "force"  : 80,
        "dodge"  : 76,
        "parry"  : 80,       
        "lvl"    : 80,
        "damage_type" : "瘀伤",
        "skill_name"  : "会心一击",
]),
});

int valid_enable(string usage)
{
	return usage == "strike" || usage == "parry";
}

int valid_combine(string combo)
{
        return combo == "songshan-quan";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练嵩山掌法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学嵩山掌法。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力修为太弱，无法练嵩山掌法。\n");

        if ((int)me->query_skill("strike", 1) < 20)
                return notify_fail("你的基本掌法火候太浅，无法练嵩山掌法。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("songshan-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的嵩山掌法。\n");

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
        level = (int) me->query_skill("songshan-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练嵩山掌法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -35);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"songshan-zhang/" + action;
}
