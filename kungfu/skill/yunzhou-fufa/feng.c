#include <ansi.h>

inherit F_SSERVER;

#define FENG "「" HIG "风魔舞" NOR "」"

int perform(object me, object target)
{
        object weapon;
        string msg;

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FENG "只能对战斗中的对手使用。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放"
                                   "胆攻击吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            weapon->query("skill_type") != "whip")
                return notify_fail("你的武器不对，无法施展" FENG "\n");

        if (me->query_skill("yunzhou-fufa", 1) < 60)
                return notify_fail("你的云帚拂法级别不够，无法施展" FENG "！\n");

        if (me->query("neili") < 100)
                return notify_fail("你现在真气不够，无法施展" FENG "！\n");

        if (me->query_skill_mapped("whip") != "yunzhou-fufa")
                return notify_fail("你没有激发云帚拂法，无法施展" FENG "！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIY "\n$N暴喝一声，潜运体内真气，将" + weapon->name() + HIY 
              "挥舞得呼呼直响，直破长空，犹如漫天狂沙般卷向$n。" NOR;

        me->start_busy(1);

        message_sort(msg, me, target);

        if (random(me->query("combat_exp")) > (int)target->query("combat_exp") / 2)
        {
                msg = HIR "$n" HIR "只觉风声萧萧，眼前万千鞭影，顿感"
                      "手脚无措，惊慌不已。\n" NOR;
                target->start_busy((int)me->query_skill("yunzhou-fufa") / 25 + 2);
        } else
        {
                msg = CYN "可是$p" CYN "看破了$P"
                      CYN "的企图，斜跳躲闪开来。\n" NOR;
        }
        me->add("neili", -80);
        message_combatd(msg, me, target);

        return 1;
}
