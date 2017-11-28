#include <ansi.h>
inherit F_SSERVER;

#define QU "「" HIW "双龙取水" NOR "」"

int perform(object me)
{
        string msg;
        object weapon, target;
        int skill, ap, dp;

        if (userp(me) && ! me->query("can_perform/xianglong-zhang/qu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(QU "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(QU "只能空手使用。\n");

        if ((int)me->query_skill("xianglong-zhang", 1) < 150)
                return notify_fail("你降龙十八掌火候不够，难以施展" QU "。\n");

        if (me->query_skill_mapped("strike") != "xianglong-zhang")
                return notify_fail("你没有激发降龙十八掌，难以施展" QU "。\n");

        if (me->query_skill_prepared("strike") != "xianglong-zhang")
                return notify_fail("你没有准备降龙十八掌，难以施展" QU "。\n");

        if (! objectp(weapon = target->query_temp("weapon")))
                return notify_fail("对方没有使用兵器，难以施展" QU "。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功修为不够，难以施展" QU "。\n");

        if ((int)me->query("max_neili") < 3000)
                return notify_fail("你的内力修为不够，难以施展" QU "。\n");

        if ((int)me->query("neili") < 500)
                return notify_fail("你现在的真气不足，难以施展" QU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIW "$N" HIW "暴喝一声，全身内劲迸发，气贯右臂奋力外扯，企图将$n"
              HIW "的" + weapon->name() + HIW "吸入掌中。\n" NOR;

        ap = me->query_skill("strike") + me->query("str") * 10;
        dp = target->query_skill("parry") + target->query("dex") * 10;

        if (ap / 3 + random(ap) > dp)
        {
                me->add("neili", -300);
                msg += HIR "$n" HIR "只觉周围气流涌动，手中" + weapon->name()
                       + HIR "竟然拿捏不住，向$N" HIR "掌心脱手飞去。\n" NOR;
                me->start_busy(2);
                weapon->move(me, 1);
        } else
        {
                me->add("neili", -200);
                msg += CYN "$n" CYN "只觉周围气流涌动，慌忙中连将手中"
                       + weapon->name() + CYN "挥舞得密不透风，使得$N"
                       CYN "无从下手。\n" NOR;
                me->start_busy(3);
        }
        message_combatd(msg, me, target);
        return 1;
}
