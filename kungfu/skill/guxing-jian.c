#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N手中$w快速猛刺，连连逼迫向$n",
        "force"  :  80,
        "dodge"  :  28,
        "damage" :  20,
	"lvl"    :  0,
        "damage_type":  "刺伤",
]),
([      "action" :  "$N手中$w横向一扫，一式「神龙摆尾」，剑光闪过，刹那间$w已到$n$l",
        "force"  :  90,
        "dodge"  :  24,
        "damage" :  25,
	"lvl"    :  30,
        "damage_type":  "砍伤",
]),
([     
        "action" :  "剑光不定，$N忽地反转剑身，一式「昙花一现」，猛然间$w刺向$n$l",
        "force"  :  100,
        "dodge"  :  24,
        "damage" :  30,
	"lvl"    :  60,
        "damage_type":  "刺伤",
]),
([      
        "action" :  "$N不进反退，一式「逆水行舟」，$w倒握于手中，却斜身一剑指向$n",
        "force"  :  120, 
        "dodge"  :  30,
        "damage" :  35,
	"lvl"    :  90,
        "damage_type":  "刺伤",
]),
([      
        "action" : "$N飞身跃起，手中$w一横，一式「横扫千军」，力道非凡，袭向$n$l",
        "force"  :  140,
        "dodge"  :  40,
        "damage" :  40,
	"lvl"    :  120,
        "damage_type":  "刺伤",
]),
});

int valid_learn(object me)
{
    	object ob; 

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        	return notify_fail("你必须先找一把剑才能练剑法。\n");

    	if ((int)me->query("max_neili") < 400)
        	return notify_fail("你目前的内力修为不够，没有办法练孤星剑法。\n");

    	if (me->query_skill("force") < 100)
        	return notify_fail("你的内功修为不够，没有办法练孤星剑法。\n");

    	if (me->query_skill("sword", 1) < 80)
		return notify_fail("你的基本剑法火候太浅，没有办法练孤星剑法。\n");

    	if (me->query_skill("sword", 1) < me->query_skill("guxing-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的孤星剑法。\n");

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

        level = (int) me->query_skill("guxing-jian", 1);
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
       	        return notify_fail("你的内力不足，没有办法练习孤星剑法。\n");

        if ((int)me->query("qi") < 50)
        	return notify_fail("你的体力不够练孤星剑法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"guxing-jian/" + action;
}

