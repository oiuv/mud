
inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
    return (force == "xuanming-shengong");
}

int valid_learn(object me)
{
    return ::valid_learn(me);
}

int practice_skill(object me)
{
    return notify_fail("冥谷心法只能用学(learn)的来增加熟练度。\n");
}

