// iceshock.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "iceshock"; }

string chinese_name() { return "寒毒"; }

string update_msg_others()
{
       return HIR "$N忽然打了一个哆嗦。\n" NOR;
}

string update_msg_self()
{
        return HIB "你觉得就像掉到了冰窖里一样，看来是寒毒发作了！\n" NOR;
}
