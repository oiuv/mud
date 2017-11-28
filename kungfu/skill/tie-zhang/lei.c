#include <ansi.h>
#include <combat.h>

#define LEI "「" HIR "掌心雷" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;
        int damage;

        if (userp(me) && ! me->query("can_perform/tie-zhang/lei"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LEI "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(LEI "只能空手施展。\n");

        if ((int)me->query_skill("tie-zhang", 1) < 160)
                return notify_fail("你铁掌掌法火候不够，难以施展" LEI "。\n");

        if (me->query_skill_mapped("strike") != "tie-zhang")
                return notify_fail("你没有激发铁掌掌法，难以施展" LEI "。\n");

        if (me->query_skill_prepared("strike") != "tie-zhang")
                return notify_fail("你没有准备铁掌掌法，难以施展" LEI "。\n");

        if ((int)me->query_skill("force") < 240)
                return notify_fail("你的内功修为不够，难以施展" LEI "。\n");

        if ((int)me->query("max_neili") < 2500)
                return notify_fail("你的内力修为不够，难以施展" LEI "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在的真气不足，难以施展" LEI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "运转真气施出「" HIR "掌心雷" NOR +
              WHT "」绝技，双掌翻红，有如火烧，朝$n" WHT "猛"
              "然拍出。\n" NOR;

        ap = me->query_skill("strike") + me->query("str") * 8;
        dp = target->query_skill("parry") + target->query("con") * 8;

        if (ap / 2 + random(ap) > dp)
        {
                damage = ap + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 65,
                                           HIR "结果只听$n" HIR "一声闷哼，被$N"
                                           HIR "一掌劈个正着，口中鲜血狂喷而出。"
                                           "\n" NOR);
                me->add("neili", -250);
                me->start_busy(3);
        } else
        {
                msg += CYN "$n" CYN "眼见$N" CYN "来势汹涌，丝毫"
                       "不敢小觑，急忙闪在了一旁。\n" NOR;
                me->add("neili", -100);
                me->start_busy(4);
        }
        message_combatd(msg, me, target);

        return 1;
}
