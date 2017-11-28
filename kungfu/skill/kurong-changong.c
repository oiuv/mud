inherit FORCE;

int valid_enable(string usage)
{
	return usage == "force";
}

int valid_force(string force)
{
        return force == "xiantian-gong" ||
               force == "quanzhen-xinfa"  ||
               force == "xuanmen-neigong"  ||
               force == "duanshi-xinfa";
}

int query_neili_improve(object me)
{
    	int lvl;

    	lvl = (int)me->query_skill("kurong-changong", 1);
    	return lvl * lvl * 15 * 15 / 100 / 200;
}

int valid_learn(object me)
{
    	if (me->query("gender") == "无性")
        	return notify_fail("你无根无性，阴阳不调，难以领会枯荣禅功。\n");

    	return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("枯荣禅功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"kurong-changong/" + func;
}
