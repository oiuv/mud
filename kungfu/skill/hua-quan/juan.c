#include <ansi.h>
#include <combat.h>

#define JUAN "「" HIY "风卷霹雳上九天" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/hua-quan/juan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JUAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JUAN "只能空手施展。\n");

        if ((int)me->query_skill("hua-quan", 1) < 120)
                return notify_fail("你的西岳华拳不够娴熟，难以施展" JUAN "。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" JUAN "。\n");

        if ((int)me->query("neili") < 400)
                return notify_fail("你现在真气不够，难以施展" JUAN "。\n");

        if (me->query_skill_mapped("cuff") != "hua-quan") 
                return notify_fail("你没有激发西岳华拳，难以施展" JUAN "。\n");

        if (me->query_skill_prepared("cuff") != "hua-quan")
                return notify_fail("你现在没有准备使用西岳华拳，难以施展" JUAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "只见$N" HIY "身形疾转，双拳聚力齐发，一式「风卷霹雳上九天」携"
              "着隐隐风雷之势贯向$n" HIY "！\n" NOR;

        if (random(me->query_skill("cuff")) > target->query_skill("dodge") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("cuff");
                damage = damage / 2 + random(damage);
                me->add("neili", -250);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 45,
                                           HIR "结果$n" HIR "闪避不及，被$P" HIR
                                           "双拳贯中，凄然一声惨嚎，口喷鲜血，身"
                                           "子向后飞出丈许。\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -80);
                msg += CYN "$p" CYN "见$P" CYN "拳势汹涌，不敢硬"
                       "作抵挡，当即斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
