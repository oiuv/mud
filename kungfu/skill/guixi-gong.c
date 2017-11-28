// guixi-gong.c

inherit FORCE;

int valid_enable(string usage) { return usage == "force"; }

int valid_force(string force)
{
    return force == "huagong-dafa" ||
           force == "freezing-force";
}

int valid_learn(object me)
{
        return 1;
}

int practice_skill(object me)
{
        return notify_fail("龟息功只能用学(learn)的来增加熟练度。\n");
}
