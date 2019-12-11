#include <ansi.h>
#include <combat.h>

#define SUI "「" HIG "随波逐流" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
  int ap, dp;
	string msg;

        if (userp(me) && ! me->query("can_perform/luoying-shenjian/sui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail(SUI "只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对，难以施展" SUI "。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

	if ((int)me->query_skill("luoying-shenjian", 1) < 80)
		return notify_fail("你落英神剑不够娴熟，难以施展" SUI "。\n");

        if (me->query_skill_mapped("sword") != "luoying-shenjian")
                return notify_fail("你没有激发落英神剑，难以施展" SUI "。\n");

	if ((int)me->query_skill("force") < 100)
		return notify_fail("你的内功火候不足，难以施展" SUI "。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你现在的真气不足，难以施展" SUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIG "$N" HIG "手中" + weapon->name() + HIG "疾转，剑幕缭绕，引得周"
              "围气流波动不已，笼罩$n" HIG "四方。\n" NOR;

	me->add("neili", -80);

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");

        if (ap / 2 + random(ap) > dp)

	{
		msg += HIR "$n" HIR "勘不透$N" HIR "招中奥妙，不敢擅自出招，顿时"
                       "便失了先机。\n" NOR;
		target->start_busy((int)me->query_skill("luoying-shenjian", 1) / 22 + 1);
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
