#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("「纵横」只能对战斗中的对手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");
                
        if ((int)me->query_skill("six-finger", 1) < 120)
                return notify_fail("你的六脉神剑火候不够，不会使用「纵横」。\n");

        if (me->query("neili") < 100)
                return notify_fail("你的真气不够，无法施展「纵横」。\n");

        if (me->query_temp("weapon"))
                return notify_fail("你必须空手才能施展「纵横」。\n");

        if (me->query_skill_mapped("finger") != "six-finger")
                return notify_fail("你没有激发六脉神剑，无法施展「纵横」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "只见$N" HIW "一声轻笑，十指纷弹，剑气如奔，连绵无尽的缕缕剑气豁然贯向$n" HIW "！\n" NOR;

        ap = me->query_skill("six-finger", 1) +
             me->query_skill("finger", 1) / 2;
        dp = target->query_skill("force");

        if (ap / 2 + random(ap) > dp)
        {
                msg += HIR "结果$p" HIR "被这纵横交错的剑气逼得手忙脚乱，应接不暇！\n" NOR;
                target->start_busy(ap / 21 + 2);
        } else
        {
                msg += CYN "可是$p" CYN "并不慌张，运起内功将$P"
                       CYN "的剑气尽数化解。\n" NOR;
                me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}

