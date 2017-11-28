#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "tiezhang_yin"; }

string chinese_name() { return "铁掌阴寒劲"; }

string update_msg_others()
{
        return HIB "$N" HIB "面色惨白，嘴皮乌紫，冷不丁打了一个寒战。\n" NOR;
}

string update_msg_self()
{
        return HIB "你感到胸口处传来阵阵刺痛，全身血液竟似要凝结住一般。\n" NOR;
}

