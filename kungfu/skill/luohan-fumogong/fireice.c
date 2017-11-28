#include <ansi.h>

inherit F_CLEAN_UP;

#define FIREICE "「" HIW "冰" HIR "火" HIW "九重天" NOR "」"

void remove_effect(object me, int amount);

int exert(object me, object target)
{
        int skill;
        string fam;
        fam = me->query("family/family_name");

        if (userp(me) && ! me->query("skybook/item/xuanbingjiu"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (target != me)
                return notify_fail("你只能用" FIREICE "来提升自己的战斗力。\n");

        if ((int)me->query_temp("fireice"))
                return notify_fail("你现在正在施展" FIREICE "。\n");

        if ((int)me->query_skill("luohan-fumogong", 1) < 180)
                return notify_fail("你罗汉伏魔功火候不足，难以施展" FIREICE "。\n");

        if ((int)me->query("max_neili") < 4000)
                return notify_fail("你的内力修为不足，难以施展" FIREICE "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的内力不足，难以施展" FIREICE "。\n");

        skill = me->query_skill("luohan-fumogong", 1);
        me->add("neili", -300);
        me->receive_damage("qi", 0);

        message_combatd(HIC "$N" HIC "纵声长啸，运转「" HIW "冰"
                        HIR "火" HIW "九重天" HIC "」真气，聚力"
                        "于掌间，光华流动，煞为壮观。\n" NOR, me);

        me->add_temp("apply/unarmed_damage", skill / 4);
        me->add_temp("apply/damage", skill / 4);
        me->add_temp("apply/armor", skill / 2);
        me->set_temp("fireice", 1);

        me->start_call_out((: call_other, __FILE__, "remove_effect",
                              me, skill / 4 :), skill);

        if (me->is_fighting())
                me->start_busy(3);

        return 1;
}

void remove_effect(object me, int amount)
{
        if (me->query_temp("fireice"))
        {
                me->add_temp("apply/unarmed_damage", -amount);
                me->add_temp("apply/damage", -amount);
                me->add_temp("apply/armor", -amount * 2);
                me->delete_temp("fireice");
                tell_object(me, "你的" FIREICE "运行完毕，将内力收回丹田。\n");
        }
}
