inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "nei-bagua" ||
               force == "bagua-xinfa" ||
               force == "shangjia-neigong";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("nei-bagua", 1);
        return lvl * lvl * 15 * 8 / 100 / 200;
}

int valid_learn(object me)
{
        if (me->query("gender") == "无性" &&
            (int)me->query_skill("nei-bagua", 1) > 49)
                return notify_fail("你无根无性，阴阳难调，无法学习更高深的内八卦。\n");

        if ((int)me->query_skill("force", 1) < 80)
                return notify_fail("你的基本内功火候还不够。\n");

        if ((int)me->query_skill("wai-bagua", 1) < 100)
                return notify_fail("你的外八卦功夫火候还不够。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("内八卦只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"nei-bagua/" + func;
}
