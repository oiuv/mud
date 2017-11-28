// 云龙神功

inherit FORCE;

int valid_enable(string usage)
{
	return usage == "force";
}

int valid_learn(object me)
{
	if (me->query("gender") == "无性" &&
            (int)me->query_skill("yunlong-shengong", 1) > 49)
		return notify_fail("你无根无性，阴阳不调，难以领会高深的云龙神功。\n");

	if ((int)me->query_skill("force", 1) < 30)
		return notify_fail("你的基本内功火候还不够，无法领会云龙神功。\n");

	return ::valid_learn(me);
}


int practice_skill(object me)
{
	return notify_fail("云龙内功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"yunlong-shengong/" + func;
}
