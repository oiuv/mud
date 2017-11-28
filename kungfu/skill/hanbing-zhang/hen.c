#include <ansi.h>
#include <combat.h>

#define HENG "「" HIG "踏雪无痕" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/hanbing-zhang/hen"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HENG "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HENG "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("hanbing-zhang", 1) < 100)
                return notify_fail("你寒冰掌不够娴熟，难以施展" HENG "。\n");

        if (me->query_skill_prepared("strike") != "hanbing-zhang")
                return notify_fail("你没有准备寒冰掌，难以施展" HENG "。\n");

        if (me->query_skill("dodge") < 150)
                return notify_fail("你的轻功修为不够，难以施展" HENG "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在的真气不够，难以施展" HENG "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("hanbing-zhang", 1) +
             me->query_skill("dodge", 1) / 2;

        dp = target->query_skill("dodge");

        msg = HIC "\n$N" HIC "怒喝一声，施出绝招「" HIG "踏雪无痕" HIC 
              "」刹时间，寒意袭卷漫天，但见$N" HIC "双掌连续反转，不断"
              "拍向$n" HIC "，竟将$n" HIC "困在掌风之下。\n" NOR;
        message_sort(msg, me, target);
        
        if (random(ap) > dp / 2)
        {
		msg = HIR "$n" HIR "心中一惊，一时间竟无从应对，"
                      "竟被困在$N" HIR "的掌风之中。\n" NOR;

                target->start_busy(ap / 40 + 2);
               	me->start_busy(1);
                me->add("neili", -100);
        } else
        {
                msg = CYN "$n" CYN "看破$N" CYN "毫无攻击之意，于"
                      "是大胆反攻，将$N" CYN "这招尽数化解。\n" NOR;

                me->start_busy(2);
                me->add("neili", -30);
        }
        message_vision(msg, me, target);

        return 1;
}
