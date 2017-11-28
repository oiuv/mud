#include <ansi.h>
#include <combat.h>

#define HAN "「" HIW "极天寒掌" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/hanbing-zhang/han"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(HAN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HAN "只能空手施展。\n");

        if ((int)me->query_skill("hanbing-zhang", 1) < 160)
                return notify_fail("你寒冰掌不够娴熟，难以施展" HAN "。\n");

        if (me->query_skill_prepared("strike") != "hanbing-zhang")
                return notify_fail("你没有准备寒冰掌，难以施展" HAN "。\n");

        if (me->query_skill("force") < 180)
                return notify_fail("你的内功修为不够，难以施展" HAN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不够，难以施展" HAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        msg = HIY "\n$N" HIY "运转真气，将内力注于掌上，施出"
              "绝招「" HIW "极天寒掌" HIY "」，双掌猛然拍向$n" 
              HIY "，掌风阴寒无比，透出阵阵寒气，犹如置身冰天"
              "雪地中一般，令人不寒而栗。\n" NOR;

        if (ap / 2 + random(ap) > dp)
        {
                damage = (int)me->query_skill("hanbing-zhang", 1);
                damage += random(damage);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 60,
                                           HIR "但见$N" HIR "双掌拍来，掌风作响，"
                                           "寒气逼人。$n" HIR "顿觉心惊胆战，"
                                           "毫无招架之力，微迟疑间$N" HIR "这掌"
                                           "已正中$n" HIR "胸口，顿将$p震退数步。"
                                           " \n" NOR);

                me->start_busy(3);
                me->add("neili", -220);
        } else
        {
                msg += CYN "$n" CYN "见$N" CYN "这掌拍来，内力"
                       "充盈，气势凌人，只得奋力向后一纵，才躲"
                       "过这一掌。\n" NOR;

                me->start_busy(4);
                me->add("neili", -120);
        }
        message_sort(msg, me, target);
        return 1;
}
