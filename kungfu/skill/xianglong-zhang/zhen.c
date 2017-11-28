#include <ansi.h>
#include <combat.h>

#define ZHEN "「" HIW "震惊百里" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        int damage;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/xianglong-zhang/zhen"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHEN "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHEN "只能空手使用。\n");

        if ((int)me->query_skill("xianglong-zhang", 1) < 150)
                return notify_fail("你降龙十八掌火候不够，难以施展" ZHEN "。\n");

        if (me->query_skill_mapped("strike") != "xianglong-zhang")
                return notify_fail("你没有激发降龙十八掌，难以施展" ZHEN "。\n");

        if (me->query_skill_prepared("strike") != "xianglong-zhang")
                return notify_fail("你没有准备降龙十八掌，难以施展" ZHEN "。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功修为不够，难以施展" ZHEN "。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不够，难以施展" ZHEN "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" ZHEN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "施出降龙十八掌之「" HIW "震惊百里" NOR +
              WHT "」，全身真气鼓动，双掌如排山倒海般压向$n" WHT "。\n"NOR;  

        ap = me->query_skill("strike") + me->query("str") * 10;
        dp = target->query_skill("dodge") + target->query("dex") * 10;

        if (ap / 2 + random(ap) > dp)
        { 
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 80,
                                           HIR "$n" HIR "只觉一股罡风涌至，根本不"
                                           "及躲避，$N" HIR "双掌正中前胸，鲜血如"
                                           "箭般喷出。\n" NOR);
                me->add("neili", -400);
                me->start_busy(3);
        } else
        {
                msg += CYN "$n" CYN "眼见$N" CYN "来势汹涌，丝毫不"
                       "敢小觑，急忙闪在了一旁。\n" NOR;
                me->add("neili", -200);
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        return 1;
}

