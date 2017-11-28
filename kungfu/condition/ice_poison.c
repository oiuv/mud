//ice_poison.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "ice_poison"; }

string chinese_name() { return "寒冰掌毒"; }

string update_msg_others()
{
       return HIB "$N的身子突然晃了两晃，牙关格格地响了起来。\n" NOR;
}

string update_msg_self()
{
        return HIB "忽然一阵奇寒从丹田升起，沁入四肢百骸，你中的寒冰绵掌之毒发作了！\n" NOR;
}
