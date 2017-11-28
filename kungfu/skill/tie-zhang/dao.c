#include <ansi.h>
#include <combat.h>

#define DAO "「" HIR "五指刀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int i, count;

        if (userp(me) && ! me->query("can_perform/tie-zhang/dao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DAO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(DAO "只能空手施展。\n");

        if ((int)me->query_skill("tie-zhang", 1) < 180)
                return notify_fail("你铁掌掌法火候不够，难以施展" DAO "。\n");

        if (me->query_skill_mapped("strike") != "tie-zhang")
                return notify_fail("你没有激发铁掌掌法，难以施展" DAO "。\n");

        if (me->query_skill_prepared("strike") != "tie-zhang")
                return notify_fail("你没有准备铁掌掌法，难以施展" DAO "。\n");

        if ((int)me->query_skill("force") < 280)
                return notify_fail("你的内功修为不够，难以施展" DAO "。\n");

        if ((int)me->query("max_neili") < 2800)
                return notify_fail("你的内力修为不够，难以施展" DAO "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在的真气不足，难以施展" DAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "身形一展，施出铁掌绝技「" HIR "五指刀" NOR +
              WHT "」，掌锋激起层层气浪，朝$n" WHT "狂劈而去。\n" NOR;  

        ap = me->query_skill("strike") + me->query("str") * 6;
        dp = target->query_skill("parry") + target->query("dex") * 6;

        if (ap / 2 + random(ap) > dp)
        {
                msg += HIR "$n" HIR "面对$N" HIR "这排山倒海般的攻"
                       "势，完全无法抵挡，招架散乱，连连退后。\n" NOR;
                count = ap / 12;
        } else
        {
                msg += HIC "$n" HIC "心底微微一惊，心知不妙，急忙"
                       "凝聚心神，竭尽所能化解$N" HIC "数道掌力。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        me->add_temp("apply/attack", count);
        me->add_temp("apply/unarmed_damage", count / 2);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;

                if (random(5) < 2 && ! target->is_busy())
                        target->start_busy(1);

                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->add("neili", -250);
        me->start_busy(1 + random(5));
        me->add_temp("apply/attack", -count);
        me->add_temp("apply/unarmed_damage", -count / 2);
        return 1;
}

