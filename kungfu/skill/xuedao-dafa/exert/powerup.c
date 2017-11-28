#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount, int lv);

int exert(object me, object target)
{
        object weapon;
        int skill, lv;

        if (target != me)
                return notify_fail("你只能用血刀大法来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        lv = me->query_skill("xuedao-dafa", 1) / 3;

        me->add("neili", -100);
        me->receive_damage("qi", 0);

        message_combatd(HIR "$N" HIR "仰天一声狂哮，全身骨骼爆响，真气荡漾，杀"
                        "气弥漫，气势迫人。\n" NOR, me);

        if (objectp(weapon = me->query_temp("weapon")) &&
           (string)weapon->query("skill_type") == "blade" &&
           me->query_skill_mapped("blade") == "xuedao-dafa")
        {
        	message_combatd(HIR "$N" HIR "嗔目狞笑，手中" + weapon->name() +
                                HIR "顿时漾起一道血光，漫起无边杀意。\n" NOR, me);
        }

        me->add_temp("apply/attack", skill / 3);
        me->add_temp("apply/defense", skill / 3);
        me->add_temp("apply/damage", lv);
        me->set_temp("powerup", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3, lv :), skill);
        if (me->is_fighting())
        	me->start_busy(3);

        return 1;
}

void remove_effect(object me, int amount, int lv)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/defense", -amount);
                me->add_temp("apply/damage", -lv);
                me->delete_temp("powerup");
                tell_object(me, "你的血刀大法运行完毕，将内力收回丹田。\n");
        }
}
