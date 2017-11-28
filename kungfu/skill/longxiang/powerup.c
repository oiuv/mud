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
                return notify_fail("你只能提升自己的战斗力。\n");

        if (layer < 3)
                return notify_fail("你龙象般若功修为不够，难以运功。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你目前的真气不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");

        message_vision(HIY "$N" HIY "运足龙象般若功第" + chinese_number(layer) +
                       "层功力，全身骨骼节节暴响，罡气向四周扩散开来！\n" NOR, me);

        me->add_temp("apply/attack", (skill / 3) + (layer * 15));
        me->add_temp("apply/parry", skill / 3);
        me->add_temp("apply/dodge", skill / 3);
        me->set_temp("powerup", 1);
        me->add("neili", -100);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3 :), skill);

        if (me->is_fighting()) me->start_busy(3);

        return 1;
}
/*
void remove_effect(object me, int amount)
{
        if ((int)me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -(amount - (layer * 15)));
                me->add_temp("apply/parry", -amount);
                me->add_temp("apply/dodge", -amount);
                me->delete_temp("powerup");
                tell_object(me, "你的龙象般若功运行完毕，将内力收回丹田。\n");
        }
}*/
