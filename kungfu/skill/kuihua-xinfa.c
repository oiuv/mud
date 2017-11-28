// kuihua-xinfa.c 葵花心法

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return 1;
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("kuihua-xinfa", 1);
        return lvl * lvl * 15 * 10 / 100 / 200;
}

int valid_learn(object me)
{
        if (me->query("gender") != "无性")
                return notify_fail("欲练神功，挥刀自宫！\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
	return notify_fail("葵花心法只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
	return __DIR__"kuihua-xinfa/" + func;
}
