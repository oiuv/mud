// agile.c 如鬼似魅
// Created by Doing Lu 10/7/2K

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIC "如鬼似魅" NOR; }

int perform(object me, string skill)
{
        int count;

        if (me->query("qi") < 80)
                return notify_fail("你的体力不支，无法竭力提升自己的速度。\n");

        message_vision(HIC "$N" HIC "脚尖一点，踢起一些尘"
                       "土，整个人顿时如同纸鹞一般飘飘忽忽。\n" NOR, me);
        count = me->query_dex();

        if (me->query_temp("special_skill/agile", 1))
                return notify_fail("你已经竭力提升你自己的速度了。\n");

        me->receive_damage("qi", 40 + random(40));
        me->set_temp("special_skill/agile", 1);
        me->add_temp("apply/dodge", count);
        me->start_call_out((: call_other, __FILE__, "remove_effect", me,
			      count :), 60 + random(30));

        return 1;
}

void remove_effect(object me, int count)
{
        me->delete_temp("special_skill/agile");
        me->add_temp("apply/dodge", -count);
        tell_object(me, "你的如鬼似魅施展完毕，身形一顿，又慢了下来。\n");
}
