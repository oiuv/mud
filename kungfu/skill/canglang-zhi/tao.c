#include <ansi.h>
#include <combat.h>

#define TAO "「" HIG "碧浪滔天" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/canglang-zhi/tao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(TAO "只能对战斗中的对手使用。\n");

        if (! target || ! me->is_fighting(target))
                return notify_fail(TAO "只能对战斗中的对手使用。\n");

        if ((int)me->query_skill("canglang-zhi", 1) < 80)
                return notify_fail("你沧浪指法不够娴熟，难以施展" TAO "。\n");

        if (me->query_skill_mapped("finger") != "canglang-zhi")
                return notify_fail("你没有激发沧浪指法，难以施展" TAO "。\n");

        if (me->query_skill_prepared("finger") != "canglang-zhi")
                return notify_fail("你没有准备沧浪指法，难以施展" TAO "。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功修为不够，难以施展" TAO "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在的真气不够，难以施展" TAO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "陡然施出一势「碧浪滔天」，十指纷翻，指气嗤然作"
              "响，全全笼罩$n" HIG "。\n" NOR;

        if (random(me->query_skill("finger")) > target->query_skill("parry") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("finger");
                damage = 40 + damage / 3 + random(damage / 3);
                me->add("neili", -80);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "结果$n" HIR "躲闪不及，被$N" HIR
                                           "一指命中，全身气血翻腾不已。\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -50);
                msg += CYN "可是$n" CYN "识破了$N"
                       CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}
