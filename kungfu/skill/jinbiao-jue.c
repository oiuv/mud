#include <ansi.h>

inherit SKILL;

int valid_learn(object me)
{
        object ob;
  
        if (me->query_skill("throwing", 1) < 10)
                return notify_fail("你的暗器技能不够娴熟。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("jinbiao-jue", 1))
                return notify_fail("你的基本暗器水平有限，难以领会更精妙的金镖诀。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "throwing";
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 80)
                return notify_fail("你的气不够，没有办法练习金镖诀。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够，没有办法练习金镖诀。\n");

        me->receive_damage("qi", 70);
        me->add("neili", -50);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinbiao-jue/" + action;
}
