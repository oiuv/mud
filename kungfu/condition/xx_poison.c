// xx_poison.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "xx_poison"; }

string chinese_name() { return "星宿掌毒"; }

string update_msg_others()
{
       return HIG "$N" HIG "的身子突然晃了两晃，牙关格格地响了起来。" NOR;
}

string update_msg_self()
{
        return HIB "忽然一阵刺骨的奇寒袭来，你中的星宿掌毒发作了！\n" NOR;
}
