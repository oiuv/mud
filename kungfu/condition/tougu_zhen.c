#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "tougu_zhen"; }

string chinese_name() { return "透骨寒针之扰"; }

string update_msg_others()
{
       return HIC "$N只觉一股奇寒散尽七筋八脉，犹感身陷万蚁之狱，全身不停的颤抖。\n" NOR;
}

string update_msg_self()
{
        return HIC "你感到一股切骨奇寒由伤口处升起，看来是中了透骨针内劲的干扰！\n" NOR;
}

