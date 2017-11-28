// fenglei-zifa.c

inherit SKILL;

int valid_learn(object me)
{
        object ob;

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力不够，没有办法练风雷子法。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，没有办法练风雷子法。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("fenglei-zifa", 1))
                return notify_fail("你的基本暗器水平有限，无法领会更高深的风雷子法。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "throwing";
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 40)
                return notify_fail("你的气不够，没有办法练习风雷子法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够，没有办法练习风雷子法。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -48);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"fenglei-zifa/" + action;
}
