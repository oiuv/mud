#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "tianchan_zhang"; }

string chinese_name() { return "蟾蛊毒"; }

string update_msg_others()
{
       return HIB "只见$N" HIB "蟾蛊毒气上涌，面上竟浮现出一层黑气，不住的颤抖。\n" NOR;
}

string update_msg_self()
{
        return HIB "你只觉蟾蛊毒攻心，头晕目眩，一阵说不出的恶心。\n" NOR;
}