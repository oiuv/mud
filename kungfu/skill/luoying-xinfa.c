// luoying-xinfa.c 落英心法
// written by deaner
// modified by Venus Oct.1997

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_learn(object me)
{
    return ::valid_learn(me);
}

int valid_force(string force)
{
    return force == "bibo-shengong";
}

int practice_skill(object me)
{
    return notify_fail("落英心法只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
    return SKILL_D("luoying-xinfa/") + func;
}
