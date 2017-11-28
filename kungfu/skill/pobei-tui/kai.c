#include <ansi.h>
#include <combat.h>

#define KAI "「" WHT "五岳为开" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;

        if (userp(me) && ! me->query("can_perform/pobei-tui/kai"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(KAI "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" KAI "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅，难以施展" KAI "。\n");

        if ((lvl = (int)me->query_skill("pobei-tui", 1)) < 100)
                return notify_fail("你的破碑腿不够娴熟，难以施展" KAI "。\n");

        if (me->query_skill_mapped("unarmed") != "pobei-tui")
                return notify_fail("你现在没有激发破碑腿，难以施展" KAI "。\n");

        if (me->query_skill_prepared("unarmed") != "pobei-tui")
                return notify_fail("你现在没有准备破碑腿，难以施展" KAI "。\n");

        if ((int)me->query("neili", 1) < 150)
                return notify_fail("你现在真气太弱，难以施展" KAI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "只见$N" WHT "身形猛转，霎那间双腿流星般连环踢出，足带风尘，腿影将$n"
              WHT "团团笼罩。\n" NOR;
        me->add("neili", -100);

        if (random(me->query_skill("force") + me->query_skill("unarmed")) >
            target->query_skill("force"))
        {
                msg += HIR "$n" HIR "见无数腿影向自己袭来，全然分辨"
                       "不清真伪，只得拼命运动抵挡。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "可是$n" HIC "凝神顿气，奋力抵挡，丝毫不"
                       "受腿影的干扰，。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        for (i = 0; i < 4; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(random(4));
        me->add_temp("apply/attack", -count);
        return 1;
}
