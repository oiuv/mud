#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N手中$w忽地斜刺，嗡嗡作响，直指$n$l",
        "force"  :  45,
        "dodge"  :  28,
        "damage" :  5,
	"lvl"    :  0,
        "damage_type":  "刺伤",
]),
([      "action" :  "$N手中$w反转，踏步向前，一剑刺向$n$l",
        "force"  :  60,
        "dodge"  :  24,
        "damage" :  8,
	"lvl"    :  30,
        "damage_type":  "刺伤",
]),
([     
        "action" :  "寒光闪过，$N怒喝一声，飞身跃起，$w嗡嗡两声，已到$n$l",
        "force"  :  80,
        "dodge"  :  24,
        "damage" :  15,
	"lvl"    :  60,
        "damage_type":  "刺伤",
]),
([      
        "action" :  "$N手中$w化出一道弧线，紧接着剑势收回，却平平一剑刺向$n$l",
        "force"  :  100, 
        "dodge"  :  30,
        "damage" :  25,
	"lvl"    :  80,
        "damage_type":  "刺伤",
]),
([      
        "action" : "$N不慌不忙，猛地手中$w连续刺出，快如闪电，直指$n$l",
        "force"  :  110,
        "dodge"  :  38,
        "damage" :  30,
	"lvl"    :  100,
        "damage_type":  "刺伤",
]),
});

int valid_learn(object me)
{
    	object ob; 

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        	return notify_fail("你必须先找一把剑才能练剑法。\n");

    	if ((int)me->query("max_neili") < 100)
        	return notify_fail("你目前的内力修为不够，没有办法练嵩山剑法。\n");

    	if (me->query_skill("sword", 1) < 15)
		return notify_fail("你的基本剑法火候太浅，没有办法练嵩山剑法。\n");

    	if (me->query_skill("sword", 1) < me->query_skill("songshan-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的绝情剑法。\n");

    	return 1;
}

int valid_enable(string usage)
{
    	return usage == "sword" || usage == "parry";
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

        level = (int) me->query_skill("songshan-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
    	object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "sword")
        	return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("neili") < 40)
       	        return notify_fail("你的内力不足，没有办法练习嵩山剑法。\n");

        if ((int)me->query("qi") < 50)
        	return notify_fail("你的体力不够练嵩山剑法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -30);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"songshan-jian/" + action;
}

