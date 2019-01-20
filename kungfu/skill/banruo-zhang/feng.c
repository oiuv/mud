#include <ansi.h>

inherit F_CLEAN_UP;
inherit F_SSERVER;

void remove_effect(object me, int a_amount, int d_amount);

int perform(object me)
{
        // object weapon;
        int skill;
        string msg;

        if ((int)me->query_skill("banruo-zhang", 1) < 60)
                return notify_fail("你的般若掌法不够娴熟，不会使用「封魔」。\n");

        if ((int)me->query("neili") < 200 )
                return notify_fail("你的真气不够，无法使用「封魔」。\n");

        if ((int)me->query_temp("brz_feng"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("banruo-zhang", 1);
        msg = HIG "$N" HIG "使出般若掌「封魔」式，双掌翻飞将周身护住。\n" NOR;
        message_combatd(msg, me);

        me->add_temp("apply/attack", -skill / 4);
        me->add_temp("apply/dodge", skill / 3);
        me->set_temp("brz_feng", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 4, skill / 3 :), skill / 4);

        me->add("neili", -100);
        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int a_amount, int d_amount)
{
        if (me->query_temp("brz_feng"))
        {
                me->add_temp("apply/attack", a_amount);
                me->add_temp("apply/dodge", -d_amount);
                me->delete_temp("brz_feng");
                tell_object(me, "你的般若掌「封魔」运行完毕，将内力收回丹田。\n");
        }
}
