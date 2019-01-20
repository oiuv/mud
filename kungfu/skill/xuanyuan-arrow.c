// xuanyuan-arrow.c

#include <ansi.h>

inherit SKILL;

int valid_learn(object me)
{
        // object ob;

        if (me->query_skill("throwing", 1) < 20)
                return notify_fail("你的暗器技能不够娴熟，怎能在激战中上箭开弓射敌？\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("xuanyuan-arror", 1))
                return notify_fail("你的基本暗器水平有限，难以领会更精妙的射箭之术。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "throwing";
}

int practice_skill(object me)
{
        // object weapon;

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不足，拉不开弓！\n");

        me->receive_damage("qi", 70);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xuanyuan-arrow/" + action;
}
