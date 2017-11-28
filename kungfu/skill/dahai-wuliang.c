inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "wuliang-xinfa" ||
               force == "lingjiu-xinfa" ||
               force == "bahuang-gong" ||
               force == "wudoumi-shengong";
}

int query_neili_improve(object me)
{
    int lvl;

    lvl = (int)me->query_skill("dahai-wuliang", 1);
    return lvl * lvl * 15 * 7 / 100 / 200;
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force", 1) < 50)
                return notify_fail("你的基本内功火候还不够。\n");

        if (me->query("gender") == "无性" && (int)me->query_skill("dahai-wuliang", 1) > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的大海无量。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("大海无量只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"dahai-wuliang/" + func;
}
