// huan.c 血刀刀法「幻影」

#include <ansi.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	string msg;

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("血刀刀法「幻影」只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
		return notify_fail("你使用的武器不对。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");
		
	if ((int)me->query_skill("xue-dao", 1) < 80)
		return notify_fail("你的血刀刀法不够娴熟，不会使用「幻影」。\n");

        if (me->query("neili") < 60)
                return notify_fail("你现在真气不够，无法使用「幻影」。\n");

        if (me->query_skill_mapped("blade") != "xue-dao")
                return notify_fail("你没有激发血刀刀法，不能使用「幻影」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "使出血刀刀法绝技，把手中的" +
              weapon->name() + HIR "舞得飞快，幻起层层刀影逼向$n"
              HIR "！\n";

        me->add("neili", -50);
	if (random(me->query("combat_exp")) > (int)target->query("combat_exp") / 2)
        {
		msg += HIR "结果$p" HIR "被$P" HIR "闹个手忙脚乱，"
                       "只能紧守门户，不敢擅动！\n" NOR;
		target->start_busy((int)me->query_skill("blade") / 27 + 2);
	} else
        {
		msg += "可是$p" HIR "看破了$P" HIR "的企图，并"
                       "不慌张，应对自如。\n" NOR;
		me->start_busy(1);
	}
	message_combatd(msg, me, target);

	return 1;
}
