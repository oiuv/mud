// jiaohua-neigong.c

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
    return force == "huntian-qigong";
}

int valid_learn(object me)
{
	return 1;
}

int practice_skill(object me)
{
	return notify_fail("叫花内功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
    return __DIR__"jiaohua-neigong/" + func;
}
