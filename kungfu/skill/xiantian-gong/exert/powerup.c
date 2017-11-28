#include <ansi.h>
inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用先天功来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        me->add("neili", -100);

        message_combatd(HIW "$N" HIW "微一凝神，运起先天气功，足底尘土泛"
                        "起，全身真气冲关欲出。\n" NOR, me);

        me->add_temp("apply/attack", skill * 2 / 5);
        me->add_temp("apply/dodge", skill * 2 / 5);
        me->add_temp("apply/parry", skill * 2 / 5);
        me->set_temp("powerup", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect", me,
                              skill * 2 / 5 :), skill);
        if (me->is_fighting()) me->start_busy(3);
        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/dodge", -amount);
                me->add_temp("apply/parry", -amount);
                me->delete_temp("powerup");
                tell_object(me, "你的先天功运行完毕，将内力收回丹田。\n");
        }
}
