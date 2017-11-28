// zihui-xinfa 紫徽心法

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "murong-xinfa";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("zihui-xinfa", 1);
                return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_learn(object me)
{
	if (me->query("gender") == "无性" && (int)me->query_skill("zihui-xinfa", 1) > 49)
		return notify_fail("你无根无性，阴阳不调，难以领会更高深的紫徽心法。\n");

	if ((int)me->query_skill("force", 1) < 20)
		return notify_fail("你的基本内功火候还不够，还不能学习紫徽心法。\n");

	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("紫徽心法只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"zihui-xinfa/" + func;
}
