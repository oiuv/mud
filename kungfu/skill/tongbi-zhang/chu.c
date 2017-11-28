#include <ansi.h>
#include <combat.h>

#define CHU "「" HIM "孤雁出群" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/tongbi-zhang/chu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHU "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(CHU "只能空手施展。\n");

        if ((int)me->query_skill("tongbi-zhang", 1) < 80)
                return notify_fail("你通臂六合掌不够娴熟，难以施展" CHU "。\n");

        if (me->query_skill_prepared("strike") != "tongbi-zhang")
                return notify_fail("你没有准备通臂六合掌，难以施展" CHU "。\n");

        if (me->query_skill("force") < 80)
                return notify_fail("你的内功修为不够，难以施展" CHU "。\n");

        if ((int)me->query("neili") < 120)
                return notify_fail("你现在的真气不够，难以施展" CHU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIC "\n$N" HIC "腾空而起，施展出绝招「" HIM "孤雁出群" HIC "」，"
              "犹如一只大雁临空而下，双掌猛地拍向$n" HIC "。\n" NOR;
        message_sort(msg, me, target); 

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("strike", 1);
                damage = damage * 2 / 3;
                msg = COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage , 25,
                                           HIR "但见$N" HIR "双掌拍来，掌风作响，"
                                           "当真迅捷无比。$n" HIR "顿觉心惊胆战，"
                                           "毫无招架之力，微作迟疑间$N" HIR "这掌"
                                           "已正中$n" HIR "胸口，顿将$p震退数步。"
                                           " \n" NOR);

                me->start_busy(1 + random(2));
                me->add("neili", -80);
        } else
        {
                msg = CYN "$n" CYN "见$N" CYN "这掌拍来，内力"
                      "充盈，只得向后一纵，才躲过这一掌。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_sort(msg, me, target);
        return 1;
}
