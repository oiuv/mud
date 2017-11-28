#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "wudu_shenzhang"; }

string chinese_name() { return "噬心毒"; }

string update_msg_others()
{
       return HIR "只见$N" HIR "手按胸口，面色泛黑，痛苦万分。\n" NOR;
}

string update_msg_self()
{
        return HIB "你忽觉心口疼痛万分，犹如万千虫蚁噬心穿骨！\n" NOR;
}
