#include <ansi.h>
#include <combat.h>

#define ZHEN "「" WHT "八卦震" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/wai-bagua/zhen"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHEN "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(ZHEN "只能空手施展。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不足，难以施展" ZHEN  "。\n");

        if ((int)me->query_skill("wai-bagua", 1) < 60)
                return notify_fail("你的外八卦不够娴熟，难以施展" ZHEN  "。\n");
                                
        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" ZHEN  "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "深吸一口气，双掌交错，一招「八卦震」平平拍出，企"
              "图以内力震伤$n" WHT "。\n" NOR;
        me->add("neili", -50);

        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                me->start_busy(3);
                target->start_busy(random(3));

                damage = (int)me->query_skill("wai-bagua", 1);
                damage = damage / 2 + random(damage / 2);
                
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "结果$n" HIR "微微一楞，没有看破招"
                                           "中奥妙，$N" HIR "双掌正好拍在胸前。\n"
                                           NOR ":内伤@?");
        } else 
        {
                me->start_busy(3);
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，并没有上当。\n" NOR;
        }
        message_combatd(msg, me, target);
        return 1;
}
