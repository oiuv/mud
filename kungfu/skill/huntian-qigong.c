// huntian-qigong.c

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "jiaohua-neigong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("huntian-qigong", 1);
        return lvl * lvl * 15 * 9 / 100 / 200;
}

int valid_learn(object me)
{
		if (me->query("gender") == "无性" && (int)me->query_skill("huntian-qigong", 1) > 49)
			return notify_fail("你无根无性，阴阳不调，难以领会更高深的混天气功。\n");

        if (me->query_skill("force", 1) < 30)
                return notify_fail("你的基本内功火候不够，无法学习混天气功。\n");

	    return 1;
}

int practice_skill(object me)
{
	    return notify_fail("混天气功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"huntian-qigong/" + func;
}
