#include <ansi.h>
#include <combat.h>

#define GUI "「" HIR "鬼魅身法" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
//      object weapon;
        int ap, dp;
        int skill;

        if (userp(me) && ! me->query("can_perform/pixie-jian/gui"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

        if (! target)
        {
                me->clean_up_enemy();
                target = me->select_opponent();
        }

        if (! me->is_fighting(target))
                return notify_fail(GUI "只能对战斗中的对手使用。\n");

	if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        skill = me->query_skill("pixie-jian", 1);

        if (skill < 100)
                return notify_fail("你的辟邪剑法不够娴熟，难以施展" GUI "。\n");

        if (me->query("neili") < 100)
                return notify_fail("你现在的真气不足，难以施展" GUI "。\n");

        if (me->query_skill_mapped("dodge") != "pixie-jian")
                return notify_fail("你没有准备使用辟邪剑法，难以施展" GUI "。\n");

        if (! living(target))
                return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIR "$N" HIR "身子忽进忽退，宛若鬼魅，身形诡秘异常，在$n"
              HIR "身边飘忽不定。\n" NOR;

        ap = me->query_skill("pixie-jian", 1) * 2;
        dp = target->query_skill("parry");

	if (ap / 2 + random(ap) > dp)
        {
		msg += HIR "$p" HIR "霎时只觉眼花缭乱，只能紧守门户，不"
                       "敢妄自出击！\n" NOR;
		target->start_busy(ap / 45 + 2);
		me->start_busy(1);
	} else
        {
		msg += CYN "可是$p" CYN "看破了$P" CYN "的身法，并没有受"
                       "到任何影响。\n" NOR;
		me->start_busy(2);
	}
        me->add("neili", -50);
	message_combatd(msg, me, target);

	return 1;
}