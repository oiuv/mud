
#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "yufengdu"; }

string chinese_name() { return "玉蜂毒"; }

string update_msg_others()
{
        return HIW "$N" HIW "面色痛苦，四肢不住的微微抽动。\n" NOR;
}

string update_msg_self()
{
        return HIG "你只觉全身奇痒无比，犹如许多虫蚁钻入在体内。\n" NOR;
}
