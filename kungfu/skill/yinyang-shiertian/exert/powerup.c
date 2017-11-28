#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用阴阳十二重天来提升自己的战斗力。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        message_combatd(HIR "$N" HIR "双目微闭，体内九阴九阳真气疾速运转十二周天，顿"
                        "时只见一股澎湃无比的气劲笼罩全身。\n" NOR, me);

        me->add_temp("apply/attack", skill / 2);
        me->add_temp("apply/defense", skill / 2);
        me->add_temp("apply/unarmed_damage", skill / 2);
        me->add_temp("apply/damage", skill / 2);
        me->add_temp("apply/parry", skill / 2);
        me->add_temp("apply/dodge", skill / 2);
        me->add_temp("apply/armor", skill * 2);
        me->set_temp("powerup", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 2 :), skill);

        if (me->is_fighting()) me->start_busy(3);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/defense", -amount);
                me->add_temp("apply/unarmed_damage", -amount);
                me->add_temp("apply/damage", -amount);
                me->add_temp("apply/parry", -amount);
                me->add_temp("apply/dodge", -amount);
                me->add_temp("apply/armor", -(amount * 4));
                me->delete_temp("powerup");
                tell_object(me, HIW "你的阴阳十二重天运行完毕，将内力收回丹田。\n" NOR);
        }
}
