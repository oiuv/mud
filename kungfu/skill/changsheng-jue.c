inherit FORCE;

int valid_enable(string usage)
{
        return usage == "force";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("changsheng-jue", 1);
        return lvl * lvl * 15 * 22 / 100 / 200;
}

int valid_force(string force)
{
        return 1;
}

int valid_learn(object me)
{
        int lvl = (int)me->query_skill("changsheng-jue", 1);

        if (me->query("character") != "狡黠多变")
                return notify_fail("你心中暗想：这不过是道家练气的口诀罢了，哪里是什么神功？\n");

        if (me->query("int") < 35)
                return notify_fail("你觉得长生决过于艰深，难以理解。\n");

        if (me->query("con") < 31)
                return notify_fail("依照你的根骨无法修炼长生决。\n");

        if ((int)me->query_skill("martial-cognize", 1) < 300)
                return notify_fail("你的武学修养没有办法理解其中的精神奥义。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("长生决只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"changsheng-jue/" + func;
}

