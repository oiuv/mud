#include <ansi.h>

#define WANG "「" HIW "天罗地网" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
//	object weapon;
	int level;
	string msg;

	if (! target) target = offensive_target(me);

        if (userp(me) && ! me->query("can_perform/tianluo-diwang/wang"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target || ! me->is_fighting(target))
		return notify_fail(WANG "只能对战斗中的对手使用。\n");

	if (me->query_temp("weapon"))
		return notify_fail("你必须空手才能施展" WANG "。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧！\n");
		
	if ((level = me->query_skill("tianluo-diwang", 1)) < 60)
		return notify_fail("你的天罗地网掌还不够娴熟，无法施展" WANG "。\n");

	if (me->query_skill("dodge") < 40)
		return notify_fail("你的轻功修为不够，无法施展" WANG "。\n");

        if (me->query_skill_prepared("strike") != "tianluo-diwang")
                return notify_fail("你没有准备天罗地网掌，难以施展" WANG "。\n");

        if (me->query("neili") < 70)
                return notify_fail("你现在真气不够，无法使用" WANG "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIG "\n$N" HIG "双掌齐出，幻化出无数掌影，将$n" HIG "团团笼罩。" NOR;
        message_sort(msg, me, target);

        me->add("neili", -60);
        if (random(level) > (int)target->query_skill("dodge", 1) / 2)
        {
		msg = HIR "结果$p" HIR "被$P" HIR "压制的难以反击，"
                      "只能竭力抵挡！\n" NOR;

		target->start_busy(level / 16 + 2);
                me->start_busy(2 + random(2));
	} else
        {
		msg = CYN "可是$p" CYN "身形一闪，跃出$P" CYN "的掌力"
                      "所及的范围。\n" NOR;

		me->start_busy(1);
	}
	message_vision(msg, me, target);

	return 1;
}