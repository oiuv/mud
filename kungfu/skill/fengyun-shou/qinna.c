// qinna.c 擒拿

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me)
{
	string msg;
	object target;
	int skill, ap, dp, damage;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }

	if (! target || ! me->is_fighting(target))
		return notify_fail("风云手「擒拿」只能在战斗中对对手使用。\n");

	skill = me->query_skill("fengyun-shou", 1);

	if (skill < 120)
		return notify_fail("你的风云手等级不够，不会使用「擒拿」！\n");

	if (me->query("neili") < 100)
		return notify_fail("你的真气不够，无法运用「擒拿」！\n");

	if (me->query_skill_mapped("hand") != "fengyun-shou")
		return notify_fail("你没有激发风云手，无法使用「擒拿」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "贴上前来，和$n" HIC "近身搏击，只见$P"
	      "的手忽折忽扭，或抓或甩，令人眼花缭乱！\n" NOR;

	ap = me->query_skill("hand");
	dp = target->query_skill("parry");
	if (ap / 2 + random(ap) > dp)
	{
		me->add("neili", -80);
		damage = 40 + ap / 6 + random(ap / 6);
		msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30,
                                           HIR "$p" HIR "奋力抵抗，终究不敌$P"
                                           HIR "，连中数招后还是被压制得无法"
                                           "反击！\n" NOR);
		me->start_busy(1);
                if (ap / 3 + random(ap) > dp && ! target->is_busy())
                        target->start_busy(ap / 25 + 2);
	} else
	{
		msg += CYN "可是$p" CYN "的看破了$P" CYN
                       "的招式，巧妙的一一拆解，没露半点破绽！\n" NOR;
		me->add("neili",-20);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
