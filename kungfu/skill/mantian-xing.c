// mantian-xing.c 满天星
// modified by Venus Oct.1997

#include <ansi.h>

inherit SKILL;

int valid_enable(string usage) { return usage == "throwing"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("force") < 60)
                return notify_fail("你的内功心法火候不够，无法学满天星。\n");

        if ((int)me->query_skill("dodge") < 60)
                return notify_fail("你的轻功火候不够，无法领悟满天星。\n");

        if ((int)me->query_dex() < 25)
                return notify_fail("你的身法不够灵巧，无法领悟满天星。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("mantian-xing", 1))
                return notify_fail("你的基本暗器水平有限，难以领会更高深的满天星。\n");

        return 1;
}

int practice_skill(object me)
{
//      object weapon;

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练满天星。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -35);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"mantian-xing/" + action;
}