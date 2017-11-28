#include <ansi.h>
#include <combat.h>

#define CHAN "「" HIW "缠字诀" NOR "」"

inherit F_SSERVER;

int perform(object me, object target)
{
	string msg;
        object weapon;

        if (userp(me) && ! me->query("can_perform/yunlong-bian/chan"))
                return notify_fail("你所使用的外功中没有这种功能。\n");

	if (! target) target = offensive_target(me);

        if (! target || ! me->is_fighting(target))
                return notify_fail(CHAN "只能在战斗中对对手使用。\n");

        if (! objectp(weapon = me->query_temp("weapon"))
           || weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对，难以施展" CHAN "。\n");

	if ((int)me->query_skill("yunlong-bian",1) < 50)
		return notify_fail("你云龙鞭法火候太浅，难以施展" CHAN "。\n");

        if (me->query_skill_mapped("whip") != "yunlong-bian")
                return notify_fail("你没有激发云龙鞭法，难以施展" CHAN "。\n");

	if (target->is_busy())
                return notify_fail(target->name() + "目前正自顾不暇，放胆攻击吧。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你现在的真气不足，难以施展" CHAN "。\n");

        if (! living(target))
               return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = WHT "$N" WHT "使出云龙鞭法「缠」字诀，连挥" + weapon->name() +
              WHT"企图把$n"  WHT "的全身缠住。\n" NOR;

	if (random(me->query_skill("whip")) > target->query_skill("parry") / 2)
        {
		msg += HIR "结果$p" HIR "顿时被$P" HIR "的鞭势牢牢缠住，"
                       "攻得措手不及！\n" NOR;
		target->start_busy((int)me->query_skill("whip") / 22 + 1);
	} else
        {
		msg += CYN "可是$p" CYN "看破了$P" CYN "的企图，并没有上"
                "当。\n" NOR;
	}
        me->add("neili", -30);
	me->start_busy(2);
	message_combatd(msg, me, target);
	return 1;
}
