inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "xiaoyao-xinfa" ||
               force == "beiming-shengong" ||
               force == "bahuang-gong" ||
               force == "lingjiu-xinfa" ||
               force == "mizong-neigong" ||
               force == "xuedao-dafa" ||
               force == "longxiang-gong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("xiaowuxiang", 1);
        return lvl * lvl * 15 * 14 / 100 / 200;
}

int valid_learn(object me)
{
        if ((int)me->query_skill("force", 1) < 80)
                return notify_fail("你的基本内功火候不足，不能学小无相功。\n");

        if (me->query("gender") == "无性" &&
        (int)me->query_skill("xiaowuxiang", 1) > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的小无相功。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("小无相功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"xiaowuxiang/" + func;
}
