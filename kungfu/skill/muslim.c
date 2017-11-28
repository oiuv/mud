inherit SKILL;

string type() { return "knowledge"; }

void skill_improved(object me)
{}

int valid_learn(object me)
{
        if ((int)me->query_skill("literate", 1) < 100)
                return notify_fail("你连读书写字都没学好，怎么学习回文？\n");

        if ((int)me->query_skill("literate", 1) < (int)me->query_skill("muslim", 1))
                return notify_fail("你的读书写字水平有限，无法掌握更深奥的回文。\n");

        return 1;

}
