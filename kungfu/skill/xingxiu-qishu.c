// xingxiu-qishu.c

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage)
{
        return usage == "poison";
}

int valid_learn(object me)
{
        if ((int)me->query_skill("poison", 1) < 100)
                return notify_fail("你的基本毒技造诣太浅，无"
                                   "法领会深奥的星宿奇术。\n");

        if ((int)me->query_skill("poison", 1) < (int)me->query_skill("xingxiu-qishu", 1))
                return notify_fail("你的基本毒技水平有限，无"
                                   "法掌握更深奥的星宿奇术。\n");

        return 1;
}
