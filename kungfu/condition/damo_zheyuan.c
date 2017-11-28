#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit "/inherit/condition/damo";

string name() { return "damo_zheyuan"; }

string chinese_name() { return "折元之扰"; }

string update_msg_others()
{
        return HIM "$N" HIM "脸色忽然大变，黄豆般大的汗珠顺"
               "着脸庞涔涔而下。\n" NOR;
}

string update_msg_self()
{
        return HIR "丹田处一阵火起，忽又变得冰凉，想必是受到"
               "达摩折元剑的干扰。\n" NOR;
}

string die_reason(string name)
{
        return "真元崩溃而亡了";
}

int neili_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];

        if (d > 300 )
                d = 100 + (d - 300) / 12;
        else
        if (d > 60)
                d = 60 + (d - 60 ) / 6;
        d *= 3;
        if (d < 10) d = 10;

        return d / 2 + random(d);
}
