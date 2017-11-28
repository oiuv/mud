#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N手中$w平平一刀，一式「万里乌云」，挥向$n$l",
        "force"  :  80,
        "dodge"  :  28,
        "damage" :  20,
	"lvl"    :  0,
        "damage_type":  "刺伤",
        "skill_name"  : "万里乌云",
]),
([      "action" :  "$N手中$w自空而下，一式「云深雾锁」，劈向$n$l",
        "force"  :  90,
        "dodge"  :  24,
        "damage" :  25,
	"lvl"    :  30,
        "damage_type":  "砍伤",
        "skill_name"  : "云深雾锁",
]),
([     
        "action" :  "刀光闪烁间，$N腾空而起，半空直下，一式「五雷轰顶」"
                    "，手中$w已经到$n$l",
        "force"  :  100,
        "dodge"  :  24,
        "damage" :  30,
	"lvl"    :  60,
        "damage_type":  "刺伤",
        "skill_name"  : "五雷轰顶",
]),
([      
        "action" :  "$N不慌不忙，一式「风声萧萧」，手中$w反转不定，猛地"
                    "一刀砍向$n$l",
        "force"  :  120, 
        "dodge"  :  30,
        "damage" :  35,
	"lvl"    :  90,
        "damage_type":  "刺伤",
        "skill_name"  : "风声萧萧",
]),
([      
        "action" : "$N双手握刀，一式「力劈群山」，手中$w自上而下，如长龙"
                   "般而下，砍向$n$l",
        "force"  :  140,
        "dodge"  :  40,
        "damage" :  40,
	"lvl"    :  120,
        "damage_type":  "刺伤",
        "skill_name"  : "力劈群山",
]),
});

int valid_learn(object me)
{
    	object ob; 

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "blade")
        	return notify_fail("你必须先找一把剑才能练落云刀法。\n");

    	if ((int)me->query("max_neili") < 400)
        	return notify_fail("你目前的内力修为不够，没有办法练落云刀法。\n");

    	if (me->query_skill("force") < 100)
        	return notify_fail("你的内功修为不够，没有办法练落云刀法。\n");

    	if (me->query_skill("blade", 1) < 80)
		return notify_fail("你的基本剑法火候太浅，没有办法练落云刀法。\n");

    	if (me->query_skill("blade", 1) < me->query_skill("luoyun-dao", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的孤星剑法。\n");

    	return 1;
}

int valid_enable(string usage)
{
    	return usage == "blade" || usage == "parry";
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

        level = (int) me->query_skill("luoyun-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
    	object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "blade")
        	return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("neili") < 40)
       	        return notify_fail("你的内力不足，没有办法练习落云刀法。\n");

        if ((int)me->query("qi") < 50)
        	return notify_fail("你的体力不够练落云刀法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"luoyun-dao/" + action;
}

