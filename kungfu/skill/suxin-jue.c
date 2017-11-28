inherit FORCE;

int valid_enable(string usage) 
{ 
        return usage == "force"; 
}

int valid_force(string force)
{
        return force == "yunv-xinjing" ||
               force == "xuanmen-neigong" ||
               force == "xiantian-gong" ||
               force == "quanzhen-xinfa";
}

int valid_learn(object me)
{
            return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("素心绝只能用学(learn)来增加熟练度。\n");
}

string exert_function_file(string func)
{
            return __DIR__"suxin-jue/" + func;
}
