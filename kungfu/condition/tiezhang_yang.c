#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "tiezhang_yang"; }

string chinese_name() { return "铁掌纯阳劲"; }

string update_msg_others()
{
        return RED "只听$N" RED "闷哼一声，双目凸出，嘴角渗出几丝鲜血。\n" NOR;
}

string update_msg_self()
{
        return RED "你只觉丹田处有如火焚，便似有千万钢针一齐扎入体内。\n" NOR;
}

