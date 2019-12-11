#include <ansi.h>
#include <combat.h>

#define SHAN "「" HIW "闪剑诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
  int ap, dp;
	string msg;

        if (userp(me) && ! me->query("can_perform/tianyu-qijian/shan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(SHAN "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对，难以施展" SHAN "。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

	if ((int)me->query_skill("tianyu-qijian", 1) < 60)
		return notify_fail("你的天羽奇剑不够娴熟，难以施展" SHAN "。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不足，难以施展" SHAN "。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你现在的真气不足，难以施展" SHAN "。\n");

        if (me->query_skill_mapped("sword") != "tianyu-qijian")
                return notify_fail("你没有激发天羽奇剑，难以施展" SHAN "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIW "$N" HIW "身子微动，手腕一探，顿时一道剑光至剑尖透出，疾电般"
              "射向$n" HIW "。\n" NOR;
	me->add("neili", -80);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)

	{
		msg += HIR "$n" HIR "大吃一惊，慌忙招架，这一下便失了先机。\n" NOR;
		target->start_busy((int)me->query_skill("tianyu-qijian", 1) / 23 + 1);
	} else
	{
		msg += CYN "可是$p" CYN "不慌不忙，看破了此招"
                       "虚实，并没有受到半点影响。\n" NOR;
		me->add("neili", -100);
		me->start_busy(1);
	}
	message_combatd(msg, me, target);

	return 1;
}
