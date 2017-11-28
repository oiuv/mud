// fugu.c 如蛆附骨

#include <ansi.h>

inherit F_SSERVER;

#define GU "「" HIW "如蛆附骨" NOR "」"

int perform(object me, object target)
{
        object weapon;
        string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/tianshan-zhang/fugu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(GU "只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "staff")
                return notify_fail("你使用的武器不对。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");
                
        if ((int)me->query_skill("tianshan-zhang", 1) < 60)
                return notify_fail("你的天山杖法不够娴熟，不会使用" GU "。\n");

        if (me->query_skill_mapped("staff") != "tianshan-zhang")
                return notify_fail("你没有激发天山杖法，使不了" GU "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "桀桀奸笑，手中的" + weapon->name() +
              HIG "就像影子一般袭向$n。\n" NOR;

        ap = me->query_skill("staff");
        dp = target->query_skill("dodge");
        if (ap * 11 / 20 + random(ap) > dp)
        {
                msg += HIR "结果$n" HIR "被$N" HIR "吓得惊慌失措，"
                       "一时间手忙脚乱，难以应对！\n" NOR;
                target->start_busy((int)me->query_skill("staff") / 25 + 2);
        } else
        {
                msg += "可是$n" HIR "看破了$N" HIR "的企图，"
                       "轻轻一退，闪去了$N" HIR "的追击。\n" NOR;
                me->start_busy(1);
        }
        message_combatd(msg, me, target);

        return 1;
}
