#include <ansi.h>

#define RUO "「" HIG "空明若玄" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	int level;
	string msg;

        if (userp(me) && ! me->query("can_perform/kongming-quan/ruo"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(RUO "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(RUO "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((level = me->query_skill("kongming-quan", 1)) < 100)
                return notify_fail("你的空明拳不够娴熟，难以施展" RUO "。\n");

        if (me->query_skill_mapped("unarmed") != "kongming-quan")
                return notify_fail("你没有激发空明拳，难以施展" RUO "。\n");

        if (me->query_skill_prepared("unarmed") != "kongming-quan")
                return notify_fail("你没有准备空明拳，难以施展" RUO "。\n");

        if ((int)me->query("neili", 1) < 100)
                return notify_fail("你现在的真气太弱，难以施展" RUO "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = WHT "$N" WHT "使出空明拳「" HIG "空明若玄" NOR + WHT "」，双手"
              "吞吐不定，运转如意，试图扰乱$n" WHT "的攻势。\n" NOR;

        me->add("neili", -50);
        if (random(level) > (int)target->query_skill("parry", 1) / 2)
        {
		msg += HIR "结果$n" HIR "被$N" HIR "的拳招所牵制，招架"
                       "不迭，全然无法反击！\n" NOR;
		target->start_busy(level / 16 + 2);
	} else
        {
		msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，镇定逾"
                       "恒，全神应对自如。\n" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
