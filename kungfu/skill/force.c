// force.c

#include <ansi.h>

inherit SKILL;

int valid_learn(object me) {return 1;}

string exert_function_file(string func)
{
        return "/kungfu/skill/force/" + func;
}

void skill_improved(object me)
{
}

