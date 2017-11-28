// xuehai-mogong

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "mizong-neigong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xuehai-mogong", 1);
        return lvl * lvl * 15 * 13 / 100 / 200;
}

int valid_learn(object me)
{
	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("血海魔功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"xuehai-mogong/" + func;
}
