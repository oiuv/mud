#include <ansi.h>
#include <combat.h>

#define LING "「" HIC "凌空指穴" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
        int ap, dp;

        if (userp(me) && ! me->query("can_perform/tiangang-zhi/ling"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(LING "只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("force") < 150)
		return notify_fail("你内功火候不够，难以施展" LING "。\n");

	if ((int)me->query_skill("tiangang-zhi") < 100)
		return notify_fail("你的天罡指穴法修为不够，难以施展" LING "。\n");

	if ((int)me->query("neili") < 100)
		return notify_fail("你的真气现在不够，难以施展" LING "。\n");

	if (target->is_busy())
		return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if (me->query_skill_mapped("finger") != "tiangang-zhi")
                return notify_fail("你没有激发天罡指穴法，不能施展" LING "。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "使出天罡指穴法绝技「凌空指穴」，左手"
              "一连七指向着$n" HIC "胸前大穴接连戳出。\n" NOR;
        ap = me->query_skill("finger");
        dp = target->query_skill("dodge");
	if (ap / 2 + random(ap) > dp)
	{
		msg += HIR "结果$p" HIR "不及攻敌，拼力躲避$P"
                       HIR "指力顿时动作大乱！\n" NOR;
		target->start_busy((int)me->query_skill("tiangang-zhi", 1) / 22 + 2);
		me->add("neili", -100);
	} else
	{
		msg += CYN "$p" CYN "情急智生，奋力一跃，退出老远。\n" NOR;
		me->start_busy(3);
                me->add("neili", -30);
	}
	message_combatd(msg, me, target);

	return 1;
}

