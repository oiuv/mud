#include <ansi.h>
#include <combat.h>

#define JU "「" HIM "真龙聚" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/dulong-shenzhua/ju"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(JU "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(JU "只能空手施展。\n");

        if ((int)me->query_skill("dulong-shenzhua", 1) < 130)
                return notify_fail("你毒龙神爪功不够娴熟，难以施展" JU "。\n");

        if (me->query_skill_mapped("claw") != "dulong-shenzhua")
                return notify_fail("你没有激发毒龙神爪功，难以施展" JU "。\n");

        if (me->query_skill_prepared("claw") != "dulong-shenzhua")
                return notify_fail("你没有准备毒龙神爪功，难以施展" JU "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" JU "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" JU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("claw") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");

        msg = HIC "\n$N" HIC "运转真气，将体内真气积聚于双爪间，猛然间双爪凌"
              "空而下，犹如神龙般划向$n" HIC "，这招正是玄冥谷绝学「" HIM "真"
              "龙聚" HIC "」。\n" NOR;

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 65,
                                           HIR "但见$N" HIR "双爪划过，$n" HIR "已闪避不及，胸口被$N" HIR
                                           "抓出十条血痕。\n" NOR);

                me->start_busy(3);
                me->add("neili", -220);
        } else
        {
                msg += CYN "$n" CYN "奋力招架，竟将$N" CYN "这招化解。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_sort(msg, me, target);
        return 1;
}
