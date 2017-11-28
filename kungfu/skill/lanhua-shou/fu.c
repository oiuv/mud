#include <ansi.h>
#include <combat.h>

#define FU "「" HIC "兰花拂穴" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/lanhua-shou/fu"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(FU "只能对战斗中的对手使用。\n");

        if (objectp(me->query_temp("weapon")))
                return notify_fail(FU "只能空手施展。\n");

        if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query_skill("lanhua-shou", 1) < 120)
                return notify_fail("你兰花拂穴手不够娴熟，难以施展" FU "。\n");

        if ((int)me->query_skill("jingluo-xue", 1) < 120)
                return notify_fail("你对经络学的了解不够，难以施展" FU "。\n");

        if (me->query_skill_mapped("hand") != "lanhua-shou")
                return notify_fail("你没有激发兰花拂穴手，难以施展" FU "。\n");

        if (me->query_skill_prepared("hand") != "lanhua-shou")
                return notify_fail("你没有准备兰花拂穴手，难以施展" FU "。\n");

        if ((int)me->query("neili") < 100)
                return notify_fail("你现在真气不足，难以施展" FU "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "反手轻轻伸出三指，婉转如一朵盛开的兰花，轻点$n"
              HIC "胁下要穴。\n";

        ap = me->query_skill("hand");
        dp = target->query_skill("parry") / 2;
	if (ap / 2 + random(ap) > dp)
	{
		msg +=  HIR "$p" HIR "只觉胁下一麻，已被$P"
                        HIR "点个正着，顿时全身酸软，呆立当场。\n" NOR;
		target->start_busy(ap / 30 + 2);
		me->add("neili", -100);
                me->start_busy(1);
	} else
	{
		msg += CYN "可是$p" CYN "看破了$P" CYN
		       "的企图，轻轻一跃，跳了开去。\n" NOR;
		me->start_busy(2);
	}
	message_combatd(msg, me, target);

	return 1;
}
