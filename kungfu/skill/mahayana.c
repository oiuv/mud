//mahayana.c  大乘涅磐功
inherit SKILL;

string type() { return "knowledge"; }

int valid_learn(object me)
{
    if ((int)me->query("shen") < 0 )
       return notify_fail("你的邪气太重，无法修炼大乘涅磐功。\n");

    return 1;
}

void skill_improved(object me)
{
}
