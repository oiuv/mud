#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill, lvl, layer;

        lvl = me->query_skill("longxiang-gong", 1);
        layer = lvl / 30;

        if (layer > 13) layer = 13;

        if (target != me)
                return notify_fail("你只能提升自己的防御力。\n");

        if (layer < 3)
                return notify_fail("你龙象般若功修为不够，难以运功。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你目前的真气不够。\n");

        if ((int)me->query_temp("shield"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        message_combatd(HIW "$N" HIW "暗聚龙象般若功第" + chinese_number(layer) +
                        "层功力，顿时一股白雾蒸腾而起，瞬间笼罩$N" HIW "全身！\n"
                        NOR, me);

        me->add_temp("apply/armor", skill / 2);
        me->add("neili", -100);
        me->set_temp("shield", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 2:), skill);

        if (me->is_fighting()) me->start_busy(2);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("shield"))
        {
                me->add_temp("apply/armor", -amount);
                me->delete_temp("shield");
                tell_object(me, "你的龙象般若功运行完毕，将内力收回丹田。\n");
        }
}
