//hanxing-bada.c 寒星八打

inherit SKILL;

int valid_learn(object me)
{
        object ob;

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力不够，没有办法练寒星八打。\n");

        if ((int)me->query_skill("throwing", 1) < (int)me->query_skill("hanxing-bada", 1))
                return notify_fail("你的基本暗器水平有限，无法领悟更高深的寒星八打术。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "throwing";
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不足，无法练习寒星八打。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够，没有办法练习寒星八打。\n");

        me->receive_damage("qi", 40);
        me->add("neili", -45);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hanxing-bada/" + action;
}
