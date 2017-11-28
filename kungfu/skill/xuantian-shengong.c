// xuantian-shengong.c 玄天神功
// modified by Venus Oct.1997

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_learn(object me)
{
    if ( (int)me->query_skill("force", 1) < 120 )
        return notify_fail("你的基本内功火候还不够。\n");

    if (me->query("gender") == "无性" &&
        (int)me->query_skill("xuantian-shengong", 1) > 49)
    	    return notify_fail("你无根无性，阴阳不调，难以领会高深的玄天神功。\n");

    return 1;
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xuantian-shengong", 1);
        return lvl * lvl * 15 * 10 / 100 / 200;
}

int practice_skill(object me)
{
    return notify_fail("玄天神功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
    return __DIR__"xuantian-force/" + func;
}
