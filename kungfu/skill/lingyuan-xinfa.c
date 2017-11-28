// lingyuan-xinfa.c 灵元心法
// written by deaner
// Modified by Venus Oct.1997

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_learn(object me)
{
    return ::valid_learn(me);
}

int practice_skill(object me)
{
    return notify_fail("灵元心法只能用学习的来增加熟练度。\n");
}

string exert_function_file(string func)
{
    return SKILL_D("lingyuan-xinfa/") + func;
}
