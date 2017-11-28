// shield.c 先天无极劲

#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int a_amount);

int exert(object me, object target)
{
        int skill;
        string msg;

        if ((int)me->query_skill("xiantian-gong", 1) < 50)
                return notify_fail("你的先天功还不够深厚。\n");

        if ((int)me->query("neili") < 200) 
                return notify_fail("你现在的真气不够。\n");

        if ((int)me->query_temp("shield"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        msg = HIW "$N" HIW "深深吸了一口气，双臂一振，一股浑厚的气劲登"
              "时盘旋在身边四周。\n" NOR;
        message_combatd(msg, me);

        me->add_temp("apply/armor", skill / 2);
        me->set_temp("shield", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect", me,
                              skill / 2 :), skill);

        me->add("neili", -100);
        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("shield"))
        {
                me->add_temp("apply/armor", -amount);
                me->delete_temp("shield");
                tell_object(me, "你先天无极劲运转完一个周天，将内力收回丹田。\n");
        }
}
