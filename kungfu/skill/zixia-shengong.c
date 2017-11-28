// zixia-shengong.c 紫霞神功
// By Hop

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force) 
{       return force == "huashan-xinfa" ||
               force == "henshan-xinfa" ||
               force == "songshan-xinfa" ||
               force == "hanbing-zhenqi" ||
               force == "zhenyue-jue"; 
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("zixia-shengong", 1);
        return lvl * lvl * 15 * 14 / 100 / 200;
}

int valid_learn(object me)
{
	if (me->query("gender") == "无性" &&
	    (int)me->query_skill("zixia-shengong", 1) > 49)
		return notify_fail("你无根无性，阴阳不调，难以领会高深的紫霞神功。\n");

	if ((int)me->query_skill("force", 1) < 60)
		return notify_fail("你的基本内功火候还不够，还不能学习紫霞神功。\n");

	return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("紫霞神功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"zixia-shengong/" + func;
}
