#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w一转，回身一剑，刺向$n$l，正是一招「月挂长空」",
        "force"  : 90,
        "dodge"  : 21,
        "parry"  : 25,
        "attack" : 10,
        "damage" : 22,
	"lvl"    : 0,
        "damage_type" : "刺伤",
        "skill_name"  : "月挂长空",
]),
([      "action" :  "只见$N身法陡然加快，施展出「剑气纵横」，剑风荡漾，$w瞬间已至$n$l",
        "force"  : 100,
        "dodge"  : 24,
        "parry"  : 28,
        "attack" : 12,
        "damage" : 25,
	"lvl"    : 25,
        "damage_type" : "刺伤",
        "skill_name"  : "剑气纵横",
]),
([      "action" : "$N纵身跃起，使出一招「晴空万里」，陡见$w从半空直指$N$l",
        "force"  : 130,
        "dodge"  : 25,
        "parry"  : 31,
        "attack" : 13,
        "damage" : 38,
	"lvl"    : 50,
        "damage_type" : "刺伤",
        "skill_name"  : "晴空万里",
]),
([      "action" : "$N腾空而起，一招「月下山头」来势又准又快，手中$w已到$n$l",
        "force"  : 150, 
        "dodge"  : 25,
        "parry"  : 35,
        "attack" : 15,
        "damage" : 50,
	"lvl"    : 75,
        "damage_type" : "刺伤",
        "skill_name"  : "月下山头",
]),
([      "action" : "$N剑峰忽转，一剑笔直地向$n$l刺来，内劲十足，正是一招「穿月无限」",
        "force"  : 170,
        "dodge"  : 27,
        "parry"  : 38,
        "attack" : 18,
        "damage" : 63,
	"lvl"    : 100,
        "damage_type" : "刺伤",
        "skill_name"  : "穿月无限",
]),
([      "action" : "$N手中$w猛然回撤，紧接着一剑，气势磅礴，剑气纵横，正是「皓月穿空」",
        "force"  : 200,
        "dodge"  : 30,
        "parry"  : 40,
        "attack" : 20,
        "damage" : 80,
	"lvl"    : 120,
        "damage_type" : "刺伤",
        "skill_name"  : "皓月穿空",
]),
});

int valid_learn(object me)
{
        object ob;

        if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
                return notify_fail("你必须先找一把剑才能练剑法。\n");

        if ((int)me->query("max_neili") < 600)
                return notify_fail("你的内力修为不够，无法学习穿月剑法。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅，无法学习穿月剑法。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习穿月剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("chuanyue-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的穿月剑法。\n");

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

        level = (int) me->query_skill("chuanyue-jian", 1);
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

       if((int)me->query("neili") < 60 )
        	   return notify_fail("你的内力不足，没有办法练习穿月剑法。\n");

       if ((int)me->query("qi") < 65)
        	   return notify_fail("你的体力不够练穿月剑法。\n");

       me->receive_damage("qi", 40);
       me->add("neili", -50);
       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"chuanyue-jian/" + action;
}

