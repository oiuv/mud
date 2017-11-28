#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "ss_poison"; }

string chinese_name() { return "生死符"; }

string update_msg_others()
{
       return HIR "只见$N" HIR "哀嚎连连，双手在身上一阵乱抓，苦不堪言。\n" NOR;
}

string update_msg_self()
{
        return HIB "忽然一股寒流夹着一阵灼热涌上心来，你中的生死符发作了！\n" NOR;
}
