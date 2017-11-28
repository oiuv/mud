// shenlong-xinfa.c 神龙心法

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
	return force == "shedao-neigong";
}

int valid_learn(object me)
{
	if (me->query("gender") == "无性" &&
        (int)me->query_skill("shenlong-xinfa", 1) > 49)
		return notify_fail("你无根无性，阴阳不调，难以领会高深的神龙心法。\n");

	return ::valid_learn(me);
}

int practice_skill(object me)
{
    return notify_fail("神龙心法只能通过学或是从运用(exert)中增加熟练度。\n");
}

string exert_function_file(string func)
{
    return __DIR__"shenlong-xinfa/" + func;
}
