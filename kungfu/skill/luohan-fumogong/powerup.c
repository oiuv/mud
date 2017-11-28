#include <ansi.h>

inherit F_CLEAN_UP;

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;
        string fam;
        fam = me->query("family/family_name");

        // 要求只有喝过玄冰碧火酒或是少林派玩家才能施展
        if (userp(me)
           && fam != "少林派"
           && ! me->query("skybook/item/xuanbingjiu"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (target != me)
                return notify_fail("你只能用罗汉伏魔神功来提升自己的战斗力。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_temp("powerup"))
                return notify_fail("你已经在运功中了。\n");

        skill = me->query_skill("force");
        me->add("neili", -100);
        me->receive_damage("qi", 0);

        if (me->query("skybook/item/xuanbingjiu")
           && fam == "少林派")
	        message_combatd(HIY "$N" HIY "高呼一声佛号，运起罗汉伏魔神"
                                "功，全身皮肤一半呈现" NOR + HIB "靛青" HIY
                                "色，另一半却为" HIR "血红" HIY "色。\n"
                                NOR, me);
        else

        if (fam == "少林派")
	        message_combatd(HIY "$N" HIY "高呼一声佛号，运起罗汉伏魔神"
                                "功，全身真气澎湃，衣衫随之鼓胀。\n"
                                NOR, me);

        else
	        message_combatd(HIY "$N" HIY "微一凝神，运起罗汉伏魔神功，"
                                "全身肌肤竟交替呈现出" NOR + HIB "靛青" HIY
                                "与" HIR "血红" HIY "两色。\n" NOR, me);

 
        me->add_temp("apply/attack", skill / 3);
        me->add_temp("apply/defense", skill / 3);
        me->set_temp("powerup", 1);
       

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 3 :), skill);

        if (me->is_fighting())
                me->start_busy(3);
        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("powerup"))
        {
                me->add_temp("apply/attack", -amount);
                me->add_temp("apply/defense", -amount);
                me->delete_temp("powerup");
                tell_object(me, "你的罗汉伏魔神功运行完毕，将内力收回丹田。\n");
        }
}
