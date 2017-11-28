#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用圣火神功来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        me->add("neili", -150);
        message_combatd(HIM "$N默运圣火神功，脸色先由黄翻紫，紧接着由紫翻蓝，再由蓝翻红，最后又恢"
                        "复为黄色，甚为诡异。\n" NOR,me);
        me->add_temp("apply/attack", skill * 1 / 3);
        me->add_temp("apply/dodge", skill * 1 / 3);
        me->add_temp("apply/parry", skill * 1 / 3);
        me->set_temp("powerup", 1);

        me->start_call_out((:call_other, __FILE__, "remove_effect", me, skill * 1 / 3 :), skill);
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
                tell_object(me, "你的圣火神功运行完毕，长长地吐了口气，将内力收回丹田。\n");
        }
}

