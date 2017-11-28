// baituo-xinfa.c 白驼心法

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force) 
{        
	return force == "hamagong"; 
}

int valid_learn(object me)
{
        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("白驼心法只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"baituo-xinfa/" + func;
}
