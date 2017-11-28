// tianhua.c 天花乱坠

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;
        int ap, dp;

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("天花乱坠只能对战斗中的对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon")))
                return notify_fail("你必须手持兵刃才能施展天花乱坠！\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");

	if ((int)me->query_skill("never-defeated", 1) < 100)
		return notify_fail("你的不败神功不够深厚，不会使用天花乱坠。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "手中的" + weapon->name() + HIC
              "一勾一划，简单明了的压向$n" HIC "！\n" NOR;

        ap = me->query_skill("never-defeated", 1) * 3 / 2 +
             me->query_skill("martial-cognize", 1);
        dp = target->query_skill("parry") +
             target->query_skill("martial-cognize", 1);

	if (ap / 2 + random(ap) > dp)
        {
		msg += HIR "结果$p" HIR "被$P" HIR "逼得施展不开半点招式！\n" NOR;
		target->start_busy(ap / 45 + 2);
	} else
        {
		msg += CYN "可是$p" CYN "看破了$P" CYN "的招数，"
                       "镇定自若，应对自如。\n" NOR;
		me->start_busy(1);
	}
	message_combatd(msg, me, target);

	return 1;
}
