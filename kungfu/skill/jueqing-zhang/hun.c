#include <ansi.h>
#include <combat.h>

#define HUN "「" HIM "魂飞魄散" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/jueqing-zhang/hun"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HUN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HUN "只能空手施展。\n");

        if ((int)me->query_skill("jueqing-zhang", 1) < 140)
                return notify_fail("你绝情掌不够娴熟，难以施展" HUN "。\n");

        if (me->query_skill_mapped("strike") != "jueqing-zhang")
                return notify_fail("你没有激发绝情掌，难以施展" HUN "。\n");

        if (me->query_skill_prepared("strike") != "jueqing-zhang")
                return notify_fail("你没有准备绝情掌，难以施展" HUN "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" HUN "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不够，难以施展" HUN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIC "\n$N" HIC "运转真气，将内力注于掌风之中，双掌猛"
              "然拍向$n" HIC "，掌风凌厉无比，气势凌人，直可惊天"
              "地，泣鬼神，正是绝情谷绝学「" HIM "魂飞魄散" HIC "」。"
              "\n" NOR;

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("jueqing-zhang", 1);
                damage += random(damage);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "但见$N" HIR "双掌拍来，掌风作响，"
                                           "当真气势凌人。$n" HIR "顿觉心惊胆战，"
                                           "毫无招架之力，微迟疑间$N" HIR "这掌"
                                           "已正中$n" HIR "胸口，顿将$p震退数步。"
                                           " \n" NOR);

                me->start_busy(3);
                me->add("neili", -200);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这掌拍来，内力"
                       "充盈，气势凌人，只得奋力向后一纵，才躲"
                       "过这一掌。\n" NOR;

                me->start_busy(4);
                me->add("neili", -100);
        }
        message_sort(msg, me, target);
        return 1;
}
