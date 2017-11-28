#include <ansi.h>
#include <combat.h>

#define BAO "「" HIW "蛟龙抱" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/dulong-shenzhua/bao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(BAO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(BAO "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("dulong-shenzhua", 1) < 80)
                return notify_fail("你毒龙神爪功不够娴熟，难以施展" BAO "。\n");

        if (me->query_skill_mapped("claw") != "dulong-shenzhua")
                return notify_fail("你没有毒龙神爪功，难以施展" BAO "。\n");

        if (me->query_skill_prepared("claw") != "dulong-shenzhua")
                return notify_fail("你没有准备毒龙神爪功，难以施展" BAO "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" BAO "。\n");

        if ((int)me->query("neili") < 200)
                return notify_fail("你现在的真气不够，难以施展" BAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("dulong-shenzhua", 1) +
             me->query_skill("dodge", 1) / 2;

        dp = target->query_skill("dodge");

        msg = HIC "\n$N" HIC "尖啸一声，双爪齐出，施出绝招「" HIW "蛟龙抱" HIC "」，"
              "双爪犹如蛟龙般将$n" HIC "缠住。\n" NOR;

        message_sort(msg, me, target);
        
        if (random(ap) > dp / 2)
        {
		msg = HIR "$n" HIR "心神惧裂，一时间竟无从应对。\n" NOR;
                target->start_busy(ap / 36 + 1);
               	me->start_busy(1);
                me->add("neili", -160);
        } else
        {
                msg = CYN "$n" CYN "看破$N" CYN "毫无攻击之意，于"
                      "是大胆反攻，将$N" CYN "这招尽数化解。\n" NOR;

                me->start_busy(2);
                me->add("neili", -60);
        }
        message_vision(msg, me, target);

        return 1;
}
