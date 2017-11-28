// buddhism.c 禅宗心法
// Modified by Venus Oct.1997

inherit SKILL;
void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int valid_learn(object me)
{
        if( (int)me->query("guilty") > 0 )
                return notify_fail("你屡犯僧家数戒，尘俗之心太重，无法修炼禅宗心法。\n");

        return 1;
}

int practice_skill(object me)
{
    return notify_fail("禅宗心法只能靠学(learn)来提高。\n");
}
