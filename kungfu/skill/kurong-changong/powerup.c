#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;

        if (target != me)
                return notify_fail("你只能用枯荣禅功来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        me->add("neili", -100);
        me->receive_damage("qi", 0);

        // 亦枯亦荣
        if ((int)me->query_skill("kurong-changong", 1) > 250)
	        message_combatd(HIG "$N" HIG "运起枯荣禅功，全身皮肤竟变得一半犹"
                                "如婴儿，另一半却似干皱的树皮。\n" NOR, me);
        // 全荣
        else if ((int)me->query_skill("kurong-changong", 1) > 200)
	        message_combatd(HIC "$N" HIC "暗自凝神，运起枯荣禅功，全身皮肤竟"
                                "变得犹如婴儿般光滑亮泽。\n" NOR, me);
        // 全枯
        else if ((int)me->query_skill("kurong-changong", 1) > 150)
	        message_combatd(YEL "$N" YEL "暗自凝神，运起枯荣禅功，全身皮肤竟"
                                "变得犹如树皮般干皱苍老。\n" NOR, me);
        // 半枯半荣
        else
	        message_combatd(HIY "$N" HIY "暗自凝神，运起枯荣禅功，真气顿时游"
                                "遍全身。\n" NOR, me);

        me->add_temp("apply/attack", skill / 3);
        me->add_temp("apply/defense", skill / 3);
        me->set_temp("powerup", 1);

        me->start_call_out((:call_other, __FILE__, "remove_effect", me,
                           skill / 3:), skill);
        if (me->is_fighting()) me->start_busy(3);
        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/defense", -amount);
                me->delete_temp("powerup");
                tell_object(me, "你的枯荣禅功运行完毕，将内力收回丹田。\n");
        }
}
