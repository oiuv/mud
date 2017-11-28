// quanzhen-xinfa 全真心法

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
        return force == "xiantian-gong" ||
               force == "suxin-jue" ||
               force == "yunv-xinjing" ||
               force == "duanshi-xinfa" ||
               force == "kurong-changong" ||
               force == "xuanmen-neigong";
}

int valid_learn(object me)
{
        return 1;
}

int practice_skill(object me)
{
        return notify_fail("全真心法只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"quanzhen-xinfa/" + func;
}
