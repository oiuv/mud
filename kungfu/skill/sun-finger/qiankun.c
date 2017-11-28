// qiankun.c 一阳指 「一指乾坤」

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
        int ap, dp;
        int damage;

	if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail("「一指乾坤」只能在战斗中使用。\n");

	if ((int)me->query_skill("sun-finger", 1) < 100)
		return notify_fail("你的一阳指修为不够，目前还不能施展一指乾坤绝技！\n");

	if ((int)me->query_skill("force") < 160)
		return notify_fail("你内功火候不够，难以施展一指乾坤！\n");

	if ((int)me->query("neili") < 500)
		return notify_fail("你的真气不够，无法施展「一指乾坤」！\n");

	if (me->query_skill_mapped("finger") != "sun-finger") 
		return notify_fail("你没有激发一阳指法，无法使用「一指乾坤」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "使出一阳指绝技「一指乾坤」，攻向$n"
              HIY "的要穴，招式变化精奇之极！\n" HIY;

        ap = me->query_skill("finger") + me->query_skill("force");
        dp = target->query_skill("parry") + target->query_skill("force");
	if (ap / 2 + random(ap) > dp)
	{
                damage = ap / 3 + random(ap / 4);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 66,
                                           HIR "结果$p" HIR "没能避开$P"
                                           HIR "这一指，正被点中檀中大穴，浑身"
                                           "气血登时倒流，哇哇连吐几口鲜血！\n" NOR);
		me->add("neili", -200);
                me->start_busy(1);
	} else
	{
		msg += CYN "可是$p" CYN "看破了$P"
                       CYN "急忙退闪，连消带打躲开了这一击。\n" NOR;
		me->start_busy(3);
                me->add("neili", -50);
	}
	message_combatd(msg, me, target);

	return 1;
}
