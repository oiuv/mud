#include <ansi.h>

inherit SKILL;

int valid_enable(string usage) 
{ 
       return usage == "throwing"; 
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功心法火候不够，无法学冰魄神针。\n");

        if ((int)me->query_skill("dodge") < 100)
                return notify_fail("你的轻功火候不够，无法领悟冰魄神针。\n");

        if ((int)me->query_dex() < 34)
                return notify_fail("你的身法不够灵巧，无法领悟冰魄神针。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("bingpo-shenzhen", 1))
                return notify_fail("你的基本暗器水平有限，难以领会更高深的冰魄神针。\n");

        return 1;
}

int practice_skill(object me)
{
        object weapon;

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练冰魄神针。\n");

        me->receive_damage("qi", 72);
        me->add("neili", -65);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"bingpo-shenzhen/" + action;
}
