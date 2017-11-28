#include <ansi.h>
#include <combat.h>

#define ZHUO "「" WHT "大巧若拙" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/guzhuo-zhang/zhuo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(ZHUO "只能对战斗中的对手使用。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(ZHUO "只能空手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("force") < 220)
                return notify_fail("你内功修为不够，难以施展" ZHUO "。\n");

        if ((int)me->query("max_neili") < 1800)
                return notify_fail("你内力修为不够，难以施展" ZHUO "。\n");

        if ((int)me->query_skill("guzhuo-zhang", 1) < 150)
                return notify_fail("你古拙掌法火候不够，难以施展" ZHUO "。\n");

        if (me->query_skill_mapped("strike") != "guzhuo-zhang")
                return notify_fail("你没有激发古拙掌法，难以施展" ZHUO "。\n");

        if (me->query_skill_prepared("strike") != "guzhuo-zhang")
                return notify_fail("你没有准备古拙掌法，难以施展" ZHUO "。\n");

        if ((int)me->query("neili") < 300)
                return notify_fail("你现在真气不够，难以施展" ZHUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = WHT "$N" WHT "手腕一探，平平推出一掌，顿时掌风激进，尘沙四起，直"
              "刮得$n" WHT "面庞隐隐生疼。\n" NOR;
        me->add("neili", -150);

        ap = me->query_skill("strike");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)

        {
                msg += HIR "$n" HIR "见$N" HIR "掌风凌厉，慌"
                       "忙招架，顿时便失了先机。\n" NOR;
                target->start_busy((int)me->query_skill("guzhuo-zhang", 1) / 22 + 2);
                me->start_busy(1);
        } else
        {
                msg += CYN "可是$n" CYN "不慌不忙，看破了$N"
                       CYN "此招虚实，并没有受到半点影响。\n" NOR;
                me->start_busy(2);
        }
        message_combatd(msg, me, target);

        return 1;
}
