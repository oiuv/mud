#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "cuixin_zhang"; }

string chinese_name() { return "催心掌掌力"; }

string update_msg_others()
{
       return HIR "$N" HIR "一声惨嚎，内息逆流，“哇”的一声喷出一大口鲜血。\n" NOR;
}

string update_msg_self()
{
        return HIR "你只感到五脏六腑翻腾不止，剧毒攻心，看来是中了催心掌掌劲的干扰！\n" NOR;
}

