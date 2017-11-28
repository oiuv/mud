inherit FORCE;

int valid_enable(string usage)
{
	return usage == "force";
}

int valid_force(string force)
{       return force == "huashan-xinfa" ||
               force == "henshan-xinfa" ||
               force == "songshan-xinfa" ||
               force == "hanbing-zhenqi" ||
               force == "zixia-shengong"; 
}

int query_neili_improve(object me)
{
    	int lvl;

    	lvl = (int)me->query_skill("zhenyue-jue", 1);
   	return lvl * lvl * 15 * 10 / 100 / 200;
}

int valid_learn(object me)
{
        if ( me->query("gender") == "无性" && (int)me->query_skill("zhenyue-jue", 1) > 99)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的镇岳诀。\n");

        if ((int)me->query_skill("force", 1) < 70)
            	return notify_fail("你的基本内功火候还不够。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("镇岳诀只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"zhenyue-jue/" + func;
}
