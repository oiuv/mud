// fire_poison.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "fire_poison"; }

string chinese_name() { return "星宿毒焰"; }

string update_msg_others()
{
        return HIR "$N" HIR "一声惨嚎，全身竟燃起了" HIG "碧绿色"
               HIR "的火焰。\n" NOR;
}

string update_msg_self()
{
        return HIR "你只觉全身灼热无比，身体上燃起的" HIG "碧焰"
               HIR "直焚心髓。\n" NOR;
}

string die_msg_others()
{
        return HIR "$N" HIR "焦枯的身子在地上扑腾了几下，就再没"
               "半点动静了。\n" NOR;
}

string die_reason()
{
        return "被星宿毒焰活活烧死了";
}