// wudang-yaoli.c

inherit SKILL;

string type() { return "knowledge"; }

int valid_enable(string usage) { return usage == "medical"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("medical", 1) < 100)
                return notify_fail("你的基本医术造诣太浅，无"
                                   "法领会深奥的武当药理。\n");

        if ((int)me->query_skill("medical", 1) < (int)me->query_skill("wudang-yaoli", 1))
                return notify_fail("你的基本医术水平有限，无"
                                   "法掌握更深奥的武当药理。\n");

        return 1;
}
