// rose_poison.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "rose_poison"; }

string chinese_name() { return "火玫瑰毒"; }

string update_msg_others()
{
       return "$N打了个寒战，抖了几抖。\n";
}

string update_msg_self()
{
        return HIG "你中的" HIR "［火玫瑰毒］" HIG "发作了！\n";
}
