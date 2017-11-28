
#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "hanbingdu"; }

string chinese_name() { return "冰魄银针剧毒"; }

string update_msg_others()
{
        return HIW "$N" HIW "脸色苍白，四肢僵硬，全身上下透出阵"
               "阵寒气。\n" NOR;
}

string update_msg_self()
{
        return HIW "你只觉全身冰冷无比，四肢百骸难受之极，如堕"
               "冰狱。\n" NOR;
}

