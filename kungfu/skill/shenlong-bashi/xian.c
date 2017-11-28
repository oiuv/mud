// xian.c 神龙初现

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
//      object weapon;
        int damage;
        string msg;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("神龙初现只能对战斗中的对手使用。\n");

        if ((int)me->query_skill("shenlong-bashi", 1) < 100)
                return notify_fail("你的神龙八式手法还不够娴熟，不能使用神龙初现。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，不能使用神龙初现。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你现在真气不够，不能使用神龙初现。\n");

        if (me->query_skill_mapped("hand") != "shenlong-bashi")
                return notify_fail("你没有激发神龙八式手法，不能使用神龙初现。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "脚下轻浮，踉踉跄跄，似倒非倒，跌跌撞撞的冲向$n"
              HIG "，同时伸手就是一招，诡秘之极。\n" NOR;

        me->start_busy(2);
        if (random(me->query_skill("hand")) > target->query_skill("parry") / 2)
        {
                damage = (int)me->query_skill("force");
                damage = damage / 2 + random(damage / 2);

                target->start_busy(1);
                me->add("neili", -125);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 35,
                                           HIR "$p" HIR "左遮右挡，却没能挡住$P" HIR "这看似无赖"
		                           "的招数，结果被$P" HIR "重重的击中，哇的吐了一口鲜血。\n" NOR);
        } else
        {
                msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，巧妙的挡住了$P"
                       CYN "的进攻。\n" NOR;
                me->add("neili", -30);
        }
        message_combatd(msg, me, target);

        return 1;
}