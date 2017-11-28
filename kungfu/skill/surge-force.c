// surge-force.c 怒海狂涛

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force) { return 1; }

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("surge-force", 1);
        return lvl * lvl * 15 * 19 / 100 / 200;
}

int valid_learn(object me)
{
	if (me->query("gender") != "男性")
		return notify_fail("你不具有男性的阳刚之气，无法修习怒海狂涛。\n");

	if ((int)me->query_skill("force", 1) < 150)
		return notify_fail("你的基本内功火候还不够，还不能修炼怒海狂涛。\n");

        if (me->query_str() < 45)
                return notify_fail("你的膂力不足，难以修习怒海狂涛。\n");


	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("怒海狂涛只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"surge-force/" + func;
}
