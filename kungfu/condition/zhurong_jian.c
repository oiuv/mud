#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "zhurong_jian"; }

string chinese_name() { return "烈炎剑气"; }

string update_msg_others()
{
       return HIR "$N" HIR "一声惨嚎，剑伤处竟犹如被烈火灼烧过一般！\n" NOR;
}

string update_msg_self()
{
        return HIR "你感到一股锥心的灼痛从剑伤处传来，血液竟似要沸腾了起来！\n" NOR;
}

