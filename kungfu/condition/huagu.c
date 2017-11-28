// huagu.c

#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "huagu"; }

string chinese_name() { return "化骨掌伤"; }

string update_msg_others()
{
       return HIC "$N" HIC "的身子突然晃了两晃，几乎跌倒。\n" NOR;
}

string update_msg_self()
{
        return HIR "忽然浑身一阵剧痛，你中的化骨绵掌毒发了！\n" NOR;
}

string die_reason(string name)
{
        return "筋断骨碎，死的惨不堪言";
}
