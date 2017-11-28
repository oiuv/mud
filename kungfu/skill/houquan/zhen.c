// zhen.c 猴拳「震」字诀

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	int damage;
	string msg;

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("神功震敌只能对战斗中的对手使用。\n");

	if (objectp(me->query_temp("weapon")))
		return notify_fail("你必须空手才能使用「震」字诀！\n");		
		
        if ((int)me->query_skill("houquan", 1) < 50)
		return notify_fail("你的猴拳不够娴熟，不会使用「震」字诀。\n");
	                        
        if ((int)me->query("neili", 1) < 100)
		return notify_fail("你现在真气太弱，不能使用「震」字诀。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = CYN "$N" CYN "默运神功，使出猴拳「震」字诀，企图以内力震伤$n"
              CYN "。\n" NOR;
	me->add("neili", -80);

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		me->start_busy(3);
		target->start_busy(random(3));
		
		damage = (int)me->query_skill("force", 1);
                damage = damage / 3 + random(damage / 3);

                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 30, "内伤:?");
	} else 
	{
		me->start_busy(3);
		msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的企图，并没有上当。\n" NOR;
	}
	message_combatd(msg, me, target);
	return 1;
}
