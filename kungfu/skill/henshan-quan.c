#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「只手揽月」，左手斜出，一拳向$n的$l打去",
        "force"  : 10,
        "dodge"  : 30,
        "parry"  : 25,       
        "lvl"    : 0,
        "damage_type" : "瘀伤",
        "skill_name"  : "只手揽月",
]),
([      "action" : "$N使一招「只手揽日」，右手挥出，劈向$n的$l",
        "force" : 25,
        "dodge" : 48,
        "parry" : 30,        
        "lvl"   : 10,
        "damage_type" : "瘀伤",
        "skill_name"  : "只手揽日",
]),
([      "action" : "$N双手回撤，忽地反转，一式「风迎紫烟」，击向$n的$l",
        "force"  : 35,
        "dodge"  : 50,
        "parry"  : 45,        
        "lvl"    : 20,
        "damage_type" : "瘀伤",
        "skill_name"  : "风迎紫烟", 
]),
([      "action" : "$N双手分开，左右齐出，一招「水火不容」，分击$n的面门和$l",
        "force" : 42,
        "dodge" : 44,
        "parry" : 71,      
        "lvl"   : 30,
        "damage_type" : "瘀伤",
         "skill_name" : "水火不容",
]),
([      "action" : "$N单脚踏出，屈身向前，一式「满面春风」，击向$n$l",
        "force"  : 50,
        "dodge"  : 55,
        "parry"  : 60,       
        "lvl"    : 42,
        "damage_type" : "瘀伤",
        "skill_name"  : "满面春风",
]),
([      "action" : "$N双手猛然回收，突然右拳直出，一式「纵虎归山」向$n的$l打去",
        "force"  : 60,
        "dodge"  : 60,
        "parry"  : 62,        
        "lvl"    : 55,
        "damage_type" : "瘀伤",
        "skill_name"  : "纵虎归山",
]),
([      "action" : "$N快步向前，一招「普天同庆」，左拳直击$n$l",
        "force"  : 70,
        "dodge"  : 54,
        "parry"  : 71,     
        "lvl"    : 65,
        "damage_type" : "瘀伤",
        "skill_name"  : "普天同庆",
]),
([      "action" : "$N拳风凌厉，拳速猛然变快，一式「殊途同归」双拳已到$n$l",
        "force"  : 80,
        "dodge"  : 76,
        "parry"  : 80,       
        "lvl"    : 80,
        "damage_type" : "瘀伤",
        "skill_name"  : "殊途同归",
]),
});

int valid_enable(string usage)
{
	return usage == "cuff" || usage == "parry";
}

int valid_combine(string combo)
{
        return combo == "biluo-zhang";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练衡山拳法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学衡山拳法。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力修为太弱，无法练衡山拳法。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅，无法练衡山拳法。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("henshan-quan", 1))
                return notify_fail("你的基本拳法水平有限，无法领会更高深的衡山拳法。\n");

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
        level = (int) me->query_skill("henshan-quan", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练衡山拳法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -35);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"henshan-quan/" + action;
}
