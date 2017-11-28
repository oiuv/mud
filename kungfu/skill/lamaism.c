// lamaism.c 密宗心法

inherit SKILL;

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int valid_learn(object me)
{
    return 1;
}

int practice_skill(object me)
{
    return notify_fail("密宗心法只能靠学(learn)来提高。\n");
}

