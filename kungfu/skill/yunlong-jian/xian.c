// xian.c  云龙三现

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("云龙三现只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");
		
	if ((int)me->query_skill("yunlong-jian", 1) < 50)
		return notify_fail("你的云龙剑法不够娴熟，不会使用「云龙三现」！\n");
	                        
	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功火候不够，不能使用「云龙三现」。\n");

        if (me->query_skill_mapped("sword") != "yunlong-jian")
                return notify_fail("你没有激发云龙剑法，不能使用「云龙三现」！\n");
			
	if ((int)me->query("neili", 1) < 300)
		return notify_fail("你现在真气不够，不能使用「云龙三现」！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIM "$N" HIM "微微一笑，猛吸一口气，以气驭剑攻击虚虚实实的攻向$n"
              HIM "！\n" NOR;

	if (random(me->query_skill("force")) > target->query_skill("force") / 2)
	{
		damage = (int)me->query_skill("force") / 2;
                damage += random(damage);

		me->add("neili", -180);
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 30,
		                           HIR "只见$N" HIR "手中剑光幻作一条金龙，腾空而"
                                           "起倏的罩向$n" HIR "，\n$p" HIR "只觉一股大力"
                                           "铺天盖地般压来，登时眼前一花，两耳轰鸣，哇的"
                                           "喷出一口鲜血！！\n" NOR);
		me->start_busy(2);
	} else
	{
		msg += CYN "可是$p" CYN "猛地向前一跃，跳出了$P"
                       CYN "的攻击范围。\n"NOR;
		me->add("neili", -100);
		me->start_busy(4);
	}
	message_combatd(msg, me, target);

	return 1;
}
