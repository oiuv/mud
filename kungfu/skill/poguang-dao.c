#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N手中$w横空而出，一式「破空式」，$w已到$n$l",
        "force"  : 90,
        "dodge"  : 21,
        "parry"  : 25,
        "attack" : 10,
        "damage" : 22,
	"lvl"    : 0,
        "damage_type" : "刺伤",
        "skill_name"  : "破空式",
]),
([      "action" : "$N手中$w平平挥出，一式「横空式」，$w砍向$n$l ",
        "force"  : 100,
        "dodge"  : 24,
        "parry"  : 28,
        "attack" : 12,
        "damage" : 25,
	"lvl"    : 25,
        "damage_type" : "刺伤",
        "skill_name"  : "横空式",
]),
([      "action" : "$N纵身跃起，施出一式「冷光式」，$w寒光一闪已到$n$l",
        "force"  : 120,
        "dodge"  : 25,
        "parry"  : 31,
        "attack" : 13,
        "damage" : 38,
	"lvl"    : 50,
        "damage_type" : "刺伤",
        "skill_name"  : "冷光式",
]),
([      "action" : "$N腾空而起，一式「穿阳式」，手中$w直砍向$n$l",
        "force"  : 140, 
        "dodge"  : 25,
        "parry"  : 35,
        "attack" : 15,
        "damage" : 50,
	"lvl"    : 75,
        "damage_type" : "刺伤",
        "skill_name"  : "穿阳式",
]),
([      "action" : "$N刀峰忽转，施出一式「回旋式」，$w蜿蜒而进，袭向$n$l",
        "force"  : 160,
        "dodge"  : 27,
        "parry"  : 38,
        "attack" : 18,
        "damage" : 63,
	"lvl"    : 100,
        "damage_type" : "刺伤",
        "skill_name"  : "回旋式",
]),
([      "action" : "$N怒喝一声，手中$w狂舞不定，一式「狂风式」，如无数把$w罩向$n",
        "force"  : 180,
        "dodge"  : 30,
        "parry"  : 40,
        "attack" : 20,
        "damage" : 80,
	"lvl"    : 120,
        "damage_type" : "刺伤",
        "skill_name"  : "狂风式",
]),
});

int valid_learn(object me)
{
        object ob;

        if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "blade")
                return notify_fail("你必须先找一把剑才能练破光刀法。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力修为不够，无法学习破光刀法。\n");

        if ((int)me->query_skill("force") < 120)
                return notify_fail("你的内功火候太浅，无法学习破光刀法。\n");

        if ((int)me->query_skill("blade", 1) < 100)
                return notify_fail("你的基本刀法火候不够，无法学习破光刀法。\n");

        if (me->query_skill("blade", 1) < me->query_skill("poguang-dao", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的破光刀法。\n");

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

        level = (int) me->query_skill("poguang-dao", 1);
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
        	   return notify_fail("你的内力不足，没有办法练习破光刀法。\n");

       if ((int)me->query("qi") < 55)
        	   return notify_fail("你的体力不够练破光刀法。\n");

       me->receive_damage("qi", 40);
       me->add("neili", -50);

       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"poguang-dao/" + action;
}

