// corpse_poison.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "corpse_poison"; }

string chinese_name() { return "腐尸毒"; }

string update_msg_others()
{
        return WHT "$N" WHT "全身上下淌着黄水，不住的嘶嚎，散发"
               "出阵阵极难闻的恶臭。\n" NOR;
}

string update_msg_self()
{
        return WHT "你只觉全身肌肤便似腐烂了一般，散发出一股极难"
               "闻的恶臭。\n" NOR;
}

string die_msg_others()
{
        return WHT "$N" WHT "嘶嚎了几声，就再没半点动静，全身散"
               "发出一股恶臭。\n" NOR;
}

string die_reason()
{
        return "腐尸毒发作身亡了";
}