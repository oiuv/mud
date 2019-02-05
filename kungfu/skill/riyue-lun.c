#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N使一招「破竹势」，抡起手中的$w向$n的$l砸去",
        "force"  : 120,
        "attack" : 27,
        "dodge"  : -10,
        "parry"  : 40,
        "lvl"    : 0,
        "damage" : 62,
        "damage_type" : "挫伤",
        "skill_name"  : "破竹势",
]),
([      "action" : "$N使一招「隐山谷势」，双肩一沉，舞动手中$w向$n的$l横扫",
        "force"  : 160,
        "attack" : 38,
        "dodge"  : -20,
        "parry"  : 45,
        "lvl"    : 35,
        "damage" : 66,
        "damage_type" : "挫伤",
        "skill_name"  : "隐山谷势",
]),
([      "action" : "$N使一招「隐微势」，就地一滚，手中自下而上撩向$n的$l",
        "force"  : 200,
        "attack" : 43,
        "dodge"  : -20,
        "parry"  : 47,
        "lvl"    : 70,
        "damage" : 70,
        "damage_type" : "挫伤",
        "skill_name"  : "隐微势",
]),
([      "action" : "$N使一招「擒纵势」，身形起伏之际$w扫向$n的$l",
        "force"  : 240,
        "attack" : 51,
        "dodge"  : 5,
        "parry"  : 50,
        "lvl"    : 100,
        "damage" : 75,
        "damage_type" : "挫伤",
        "skill_name"  : "擒纵势",
]),
([      "action" : "$N使一招「圆满势」，$w如离弦之箭般直捣$n的$l",
        "force"  : 280,
        "attack" : 55,
        "dodge"  : -10,
        "parry"  : 55,
        "lvl"    : 120,
        "damage" : 80,
        "damage_type" : "挫伤",
        "skill_name"  : "圆满势",
]),
([      "action" : "$N跃入半空，使一招「月重辉势」，高举$w敲向$n的$l",
        "force"  : 320,
        "attack" : 61,
        "dodge"  : 10,
        "parry"  : 60,
        "lvl"    : 140,
        "damage" : 85,
        "damage_type" : "挫伤",
        "skill_name"  : "月重辉势",
]),
([      "action" : "$N使一招「捉月势」，斜举手中$w击向$n的$l",
        "force"  : 360,
        "attack" : 65,
        "dodge"  : -15,
        "parry"  : 68,
        "lvl"    : 150,
        "damage" : 95,
        "damage_type" : "挫伤",
        "skill_name"  : "捉月势",
]),
([      "action" : "$N提一口真气，使出「显吉祥」，$w扫向$n的头部",
        "force"  : 400,
        "attack" : 70,
        "dodge"  : -20,
        "parry"  : 75,
        "lvl"    : 160,
        "damage" : 110,
        "damage_type" : "挫伤",
        "skill_name"  : "显吉祥",
]),
});


int valid_enable(string usage)
{
	return usage == "hammer" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query("str") < 32)
                return notify_fail("你先天膂力不足，难以修炼日月轮法。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("hammer", 1) < 100)
                return notify_fail("你的基本锤法不够，难以修炼日月轮法。\n");

        if ((int)me->query_skill("hammer", 1) < (int)me->query_skill("riyue-lun", 1))
                return notify_fail("你的基本锤法水平有限，无法领会更高深的日月轮法。\n");

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
        level = (int) me->query_skill("riyue-lun",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "hammer")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够，练不了日月轮法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，练不了日月轮法。\n");

        me->receive_damage("qi", 62);
        me->add("neili", -68);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"riyue-lun/" + action;
}
