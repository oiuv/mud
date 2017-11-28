#include <ansi.h>
#include <combat.h>

#define ZHI "「" HIG "剑指南山" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/zhongnan-zhi/zhi"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHI "只能空手施展。\n");

        if ((int)me->query_skill("zhongnan-zhi", 1) < 60)
                return notify_fail("你终南指法不够娴熟，难以施展" ZHI "。\n");

        if (me->query_skill_mapped("finger") != "zhongnan-zhi")
                return notify_fail("你没有激发终南指法，难以施展" ZHI "。\n");

        if (me->query_skill_prepared("finger") != "zhongnan-zhi")
                return notify_fail("你没有准备终南指法，难以施展" ZHI "。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你内功修为不够，难以施展" ZHI "。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你现在的真气不够，难以施展" ZHI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "斜斜一指刺出，指尖晃动不已，遥遥点向$n"
              HIG "要穴所在。\n" NOR;

        if (random(me->query_skill("finger")) > target->query_skill("parry") / 2)
        {
                me->start_busy(2);
                damage = me->query_skill("finger");
                damage = 40 + damage / 3 + random(damage / 4);
                me->add("neili", -60);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 20,
                                           HIR "结果$p" HIR "招架失误，被$P" HIR
                                           "这一指点了个正着，内息登时一滞，气血倒流。\n" NOR);
        } else
        {
                me->start_busy(3);
                me->add("neili", -20);
                msg += CYN "可是$p" CYN "识破了$P"
                       CYN "这一招，斜斜一跃避开。\n" NOR;
        }
        message_combatd(msg, me, target);

        return 1;
}