// shedao-neigong 蛇岛内功

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
	return force=="shenlong-xinfa";
}

int valid_learn(object me)
{
	return ::valid_learn(me);
}

int practice_skill(object me)
{
    return notify_fail("蛇岛内功只能通过学或是从运用(exert)中增加熟练度。\n");
}

string exert_function_file(string func)
{
    return __DIR__"shedao-neigong/" + func;
}
