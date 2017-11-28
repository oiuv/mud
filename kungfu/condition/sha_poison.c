#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "sha_poison"; }

string chinese_name() { return "砂毒"; }

string update_msg_others()
{
       return HIR "$N" HIR "脸色霎地变的煞白，全身不停的颤抖。\n" NOR;
}

string update_msg_self()
{
        return HIR "你只觉毒气攻心，顿时感到一股莫名的恶心，全身瘫软无力！\n" NOR;
}

