// MODIFY BY RCWIZ 2003

#include <ansi.h>

#define FEI "「" HIG "飞絮飘渺" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	// object weapon;
	string msg;

	if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/huashan-zhang/piao"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(FEI "只能对战斗中的对手使用。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");

	if ((int)me->query_skill("huashan-zhang", 1) < 30)
		return notify_fail("你的华山掌法不够娴熟，不会使用" FEI  "。\n");

        if (me->query_skill_prepared("strike") != "huashan-zhang")
                return notify_fail("你没有准备使用华山掌法，无法施展" FEI  "。\n");

        if (me->query("neili") < 60)
                return notify_fail("你现在真气不够，无法施展" FEI  "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

        msg = HIM "\n猛然间$N" HIM "双掌不断拍向$n" HIM "出，风声呼呼，攻到途中忽又左"
              "手虚出右手作势欲发，虚虚实实，飘渺不定，正是华山绝招「" HIG  "飞絮飘渺" HIM
              "」。 顷刻剑$n" HIM "已被$N" HIM "掌风笼罩。\n" NOR;

        me->add("neili", -30);
	if (random(me->query_skill("cuff")) > (int)target->query_skill("force") / 2)
        {
		msg += HIR "结果$p" HIR "一时无法辨别其中虚实，竟无法施招。\n" NOR;
		target->start_busy((int)me->query_skill("strike") / 25 + 2);
	} else
        {
		msg += CYN "可是$n" CYN "看破其中虚实，更不理会。\n" NOR;
		me->start_busy(1);
	}
	message_sort(msg, me, target);

	return 1;
}
