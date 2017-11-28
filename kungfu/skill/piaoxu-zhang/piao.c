#include <ansi.h>
#include <combat.h>

#define PIAO "「" HIW "飞絮飘零" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;

        if (userp(me) && ! me->query("can_perform/piaoxu-zhang/piao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(PIAO "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(PIAO "只能空手施展。\n");

        if ((lvl = (int)me->query_skill("piaoxu-zhang", 1)) < 80)
                return notify_fail("你飘絮掌法不够娴熟，难以施展" PIAO "。\n");

        if (me->query_skill_mapped("strike") != "piaoxu-zhang")
                return notify_fail("你没有激发飘絮掌法，难以施展" PIAO "。\n");

        if (me->query_skill_prepared("strike") != "piaoxu-zhang")
                return notify_fail("你没有准备飘絮掌法，难以施展" PIAO "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" PIAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "微微一笑，单掌施出飘絮掌法绝技「飞絮飘零」，顿时掌"
              "影重重，虚实难辨，全全笼罩$n" HIW "而去。\n" NOR;
        me->add("neili", -50);

        if (random(me->query_skill("force") + me->query_skill("strike")) >
            target->query_skill("force"))
        {
                msg += HIR "$n" HIR "顿时觉得眼花缭乱，全然分辨"
                       "不清真伪，只得拼命运动抵挡。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "可是$n" HIC "凝神顿气，奋力抵挡，丝"
                       "毫不受掌影的干扰，。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        for (i = 0; i < 3; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(random(3));
        me->add_temp("apply/attack", -count);
        return 1;
}
