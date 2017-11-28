#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N飞身跃起，挺剑刺向$n$l，正是一招「天山人间」",
        "force"  :  45,
        "dodge"  :  18,
        "parry"  :  20,
        "attack" :  10,
        "damage" :  20,
	"lvl"    :  0,
        "damage_type" : "刺伤",
        "skill_name"  : "天山人间"
]),
([      "action" :  "$N气运于剑，陡然直进，一招「一柱擎天」已然使出，$w直指$n$l",
        "force"  :  90,
        "dodge"  :  25,
        "parry"  :  40,
        "attack" :  24,
        "damage" :  35,
	"lvl"    :  25,
        "damage_type" : "刺伤",
        "skill_name"  : "一柱擎天"
]),
([     
        "action" :  "$N剑势突变，飘忽不定，一式「云里雾里」，向$n$l刺去",
        "force"  :  110,
        "dodge"  :  30,
        "parry"  :  40,
        "attack" :  30,
        "damage" :  40,
	"lvl"    :  50,
        "damage_type" : "刺伤",
        "skill_name"  : "云里雾里"
]),
([      
        "action" :  "$N轻啸一声，$w一抖，一式「气冠长虹」，眨眼间$w已到$n$l",
        "force"  :  120, 
        "dodge"  :  45,
        "parry"  :  45,
        "attack" :  35,
        "damage" :  48,
	"lvl"    :  75,
        "damage_type" : "刺伤",
        "skill_name"  : "气冠长虹"
]),
([      
        "action" : "$N踏前半步，手中$w如影如幻，竟向$n$l刺去，正是一招「天柱云气」",
        "force"  :  160,
        "dodge"  :  80,
        "parry"  :  60,
        "attack" :  55,
        "damage" :  60,
	"lvl"    :  100,
        "damage_type" : "刺伤",
        "skill_name"  : "天柱云气"
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
   
        if ((int)me->query("max_neili") < 300)
        	return notify_fail("你的内力不够，没有办法练天柱剑法。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 60)
           	return notify_fail("你的基本剑法火候不够，无法学习天柱剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("tianzhu-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的天柱剑法。\n");

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

        level = (int) me->query_skill("tianzhu-jian", 1);
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

       if ((int)me->query("neili") < 60)
        	   return notify_fail("你的内力不足，没有办法练习天柱剑法。\n");

       if ((int)me->query("qi") < 65)
        	   return notify_fail("你的体力不够练天柱剑法。\n");

       me->receive_damage("qi", 40);
       me->add("neili", -50);
       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tianzhu-jian/" + action;
}
