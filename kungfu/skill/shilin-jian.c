#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w发出“嗖嗖”两声，$w斜刺$n$l，正是一招「书声朗朗」",
        "force"  : 70,
        "dodge"  : 38,
        "parry"  : 25,
        "attack" : 15,
        "damage" : 20,
	"lvl"    : 0,
        "damage_type" : "刺伤",
        "skill_name"  : "书声朗朗",
]),
([      "action" : "$N$w忽转，竟向$n的$l刺去，一式「岁岁青苍」已然使出",
        "force"  : 85,
        "dodge"  : 45,
        "parry"  : 40,
        "attack" : 28,
        "damage" : 30,
	"lvl"    : 25,
        "damage_type" : "刺伤",
        "skill_name"  : "岁岁青苍",
]),
([     
        "action" : "$N手中$w连续刺出三剑「剑出三生」，分向$n的面门，咽喉，和$l刺去",
        "force"  : 120,
        "dodge"  : 55,
        "parry"  : 45,
        "attack" : 40,
        "damage" : 38,
	"lvl"    : 50,
        "damage_type" : "刺伤",
        "skill_name"  : "剑出三生",
]),
([      
        "action" : "$N轻啸一声，一招「铺天盖地」，$w挽出一个剑花，剑光四射，洒向$n",
        "force"  : 150, 
        "dodge"  : 65,
        "parry"  : 50,
        "attack" : 45,
        "damage" : 45,
	"lvl"    : 75,
        "damage_type" : "刺伤",
        "skill_name"  : "铺天盖地",
]),
([      
        "action" : "$N凝神聚气，猛然一剑刺出，不偏不倚，一招「石廪书声」直指$n$l",
        "force"  : 180,
        "dodge"  : 80,
        "parry"  : 60,
        "attack" : 55,
        "damage" : 60,
	"lvl"    : 100,
        "damage_type" : "刺伤",
        "skill_name"  : "石廪书声",
]),
});

string main_skill()
{
	return "wushen-jian";
}

int valid_learn(object me)
{
    	object ob;

        if (me->query_skill("wushen-jian", 1) > 0)
                return notify_fail("你已演练合成了衡山五神剑，不必再单独学习。\n");

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        	return notify_fail("你必须先找一把剑才能练剑法。\n");

        if ((int)me->query("max_neili") < 400)
        	return notify_fail("你的内力不够，没有办法练石廪剑法。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 60)
           	return notify_fail("你的基本剑法火候不够，无法学习石廪剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("shilin-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的石廪剑法。\n");

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

        level = (int) me->query_skill("shilin-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
       object weapon;

       if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

       if((int)me->query("neili") < 60 )
        	   return notify_fail("你的内力不足，没有办法练习石廪剑法。\n");

       if ((int)me->query("qi") < 65)
        	   return notify_fail("你的体力不够练石廪剑法。\n");

       me->receive_damage("qi", 45);
       me->add("neili", -55);
       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"shilin-jian/" + action;
}
