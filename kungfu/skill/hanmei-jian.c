#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action" : "$N纵身跃起手中$w轻挥，一招「踏雪寻梅」，斩向$n后颈",
        "force"  : 80,
        "attack" : 35,
        "parry"  : 10,
        "dodge"  : 30,
        "damage" : 7,
        "lvl"    : 0,
        "skill_name" : "踏雪寻梅",
        "damage_type" : "刺伤"
]),
([      "action" : "$N手中$w连话三个弧形，一招「梅雪争春」，向$n的右臂齐肩斩落",
        "force"  : 100,
        "attack" : 45,
        "parry"  : 22,
        "dodge"  : 45,
        "damage" : 11,
        "lvl"    : 30,
        "skill_name" : "梅雪争春",
        "damage_type" : "刺伤"
]),
([      "action" : "$N轻吁一声，飞身一跃而起，一招「剑毒梅香」，连续向$n刺出数剑",
        "force"  : 120,
        "attack" : 51,
        "parry"  : 18,
        "dodge"  : 53,
        "damage" : 15,
        "lvl"    : 60,
        "skill_name" : "剑毒梅香",
        "damage_type" : "刺伤"
]),
([      "action" : "$N仰天一声清啸，斜行向前，一招「梅花三弄」，$w横削直击，击向$n的$l",
        "force"  : 150,
        "attack" : 58,
        "parry"  : 20,
        "dodge"  : 52,
        "damage" : 20,
        "lvl"    : 90,
        "skill_name" : "梅花三弄",
        "damage_type" : "割伤"
]),
});

int valid_enable(string usage) { return usage == "sword" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力不够，无法修习寒梅剑法。\n");

        if ((int)me->query_skill("sword", 1) < 10)
                return notify_fail("你的基本剑法火候太浅，无法修习寒梅剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("hanmei-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的寒梅剑法。\n");

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

        level = (int) me->query_skill("hanmei-jian",1);
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

        if ((int)me->query("qi") < 65)
                return notify_fail("你的体力不够练寒梅剑法。\n");

        if ((int)me->query("neili") < 20)
                return notify_fail("你的内力不够练寒梅剑法。\n");

        me->receive_damage("qi", 60);
        me->add("neili", -16);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hanmei-jian/" + action;
}
