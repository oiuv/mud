#include <ansi.h>
#include <combat.h>

#define LIAN "「" HIW "夺命连环" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int count;
        int lvl;
        int i;

        if (userp(me) && ! me->query("can_perform/lianhuan-mizongtui/lian"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LIAN "只能对战斗中的对手使用。\n");

        if ((lvl = (int)me->query_skill("lianhuan-mizongtui", 1)) < 120)
                return notify_fail("你的连环迷踪腿不够娴熟，难以施展" LIAN "。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(LIAN "只能空手施展。\n");
                
        if (me->query("max_neili") < 1800)
                return notify_fail("你的内力的修为不够，现在无法使用" LIAN "。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，难以施展" LIAN "。\n");

        if ((int)me->query_skill("dodge") < 150)
                return notify_fail("你的轻功火候不够，难以施展" LIAN "。\n");

        if (me->query_skill_prepared("unarmed") != "lianhuan-mizongtui")
                return notify_fail("你现在没有准备使用连环迷踪腿，难以施展" LIAN "。\n");

        if ((int)me->query("neili", 1) < 200)
                return notify_fail("你现在真气太弱，难以施展" LIAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "陡见$N" HIW "全身飞速旋转，双腿忽前忽后，接连贯出数腿，流星般疾射$n"
              HIW "胸口。\n" NOR;

        me->add("neili", -150);

        if (random(me->query_skill("dodge") + me->query_skill("unarmed")) >
            target->query_skill("parry"))
        {
                msg += HIR "$n" HIR "顿时觉得眼花缭乱，无数条腿"
                       "向自己奔来，只得拼命运动抵挡。\n" NOR;
                count = lvl / 5;
                me->add_temp("apply/attack", count);
        } else
        {
                msg += HIC "可是$n" HIC "凝神顿气，奋力抵挡，丝"
                       "毫不受腿影的干扰，。\n" NOR;
                count = 0;
        }
        message_combatd(msg, me, target);

        for (i = 0; i < 5; i++)
        {
                if (! me->is_fighting(target))
                        break;
                COMBAT_D->do_attack(me, target, 0, 0);
        }
        me->start_busy(random(5));
        me->add_temp("apply/attack", -count);
        return 1;
}
