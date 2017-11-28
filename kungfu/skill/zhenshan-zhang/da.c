#include <ansi.h>
#include <combat.h>

#define DA "「" WHT "隔山打牛" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;

        if (userp(me) && ! me->query("can_perform/zhenshan-zhang/da"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(DA "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail("你必须空手才能使用" DA "。\n");         
                
        if ((int)me->query_skill("zhenshan-zhang", 1) < 40)
                return notify_fail("你的震山掌不够娴熟，难以施展" DA "。\n");

        if (me->query("max_neili") < 200)
                return notify_fail("你的内功修为不足，难以施展" DA "。\n");

        if (me->query_skill_mapped("strike") != "zhenshan-zhang")
                return notify_fail("你没有激发震山掌，难以施展" DA "。\n");

        if (me->query_skill_prepared("strike") != "zhenshan-zhang")
                return notify_fail("你没有准备使用震山掌，难以施展" DA "。\n");

        if (me->query("neili") < 50)
                return notify_fail("你现在真气太弱，难以施展" DA "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "脚蹲马步，深吸一口气，使出隔山打牛，双掌对准$n"
              WHT "平平推出。\n" NOR;
        me->add("neili", -30);

        if (random(me->query_skill("force")) > target->query_skill("force") / 2)
        {
                me->start_busy(3);
                target->start_busy(random(3));
                
                damage = (int)me->query_skill("force", 1);
                damage = damage / 3 + random(damage / 3);
                
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "$n" HIR "见势连忙向后一纵，但却只觉"
                                           "胸口一震，顿时两耳轰鸣，已被$N" HIR "掌"
                                           "劲所伤！\n:内伤@?");
        } else 
        {
                me->start_busy(3);
                msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，并没有上当。\n" NOR;
        }
        message_combatd(msg, me, target);
        return 1;
}

