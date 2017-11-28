#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "lb_poison"; }

string chinese_name() { return "绿波剧毒"; }

string update_msg_others()
{
       return HIB "只见$N" HIB "脸色煞白，身子晃了两晃，步法散乱，便似喝醉酒一般。\n" NOR;
}

string update_msg_self()
{
        return HIR "你只觉一股莫名的恶心涌上心头，全身上下气血翻滚，经脉不畅。\n" NOR;
}
