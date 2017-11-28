
#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用太玄功来提升自己的防御力。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你的真气不够。\n");

        if ((int)me->query_skill("taixuan-gong", 1) < 40)
                return notify_fail("你的太玄功等级不够。\n");

        if ((int)me->query_temp("shield"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        me->add("neili", -100);
        me->receive_damage("qi", 0);

        message_vision(HIG "$N" HIG "默默运功，昔日侠客岛石壁上的口诀一一"
                        "呈现，太玄功内劲已护于全身。\n" NOR, me);

        if (me->query("breakup"))
        {
             me->add_temp("apply/armor", skill);
             me->set_temp("shield", 1);
			 me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill :), skill);
        }
        else
        {
             me->add_temp("apply/armor", skill / 2);
             me->set_temp("shield", 1);
			 me->start_call_out((: call_other, __FILE__, "remove_effect", me, skill / 2 :), skill);
        }

        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("shield"))
        {
                me->add_temp("apply/armor", -amount);
                me->delete_temp("shield");
                tell_object(me, "你的太玄功运行完毕，将内力收回丹田。\n");
        }
       
}

