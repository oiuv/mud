// mizong-neigong

inherit FORCE;

int valid_enable(string usage)
{
        return usage == "force";
}

int valid_force(string force)
{
        return force == "longxiang-gong" ||
               force == "xiaowuxiang" ||
               force == "xuedao-dafa";
}

int valid_learn(object me)
{
	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("密宗内功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"mizong-neigong/" + func;
}
