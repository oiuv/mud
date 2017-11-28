// ci.c 刺剑

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	object weapon;
	int damage;
	string msg;
        int ap, dp;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
		return notify_fail("「刺剑」只能对战斗中的对手使用。\n");

	if (! objectp(weapon = me->query_temp("weapon")) ||
	    (string)weapon->query("skill_type") != "sword")
		return notify_fail("你使用的武器不对。\n");
		
	if ((int)me->query_skill("xiyang-jian", 1) < 70)
		return notify_fail("你的西洋剑术不够娴熟，不会使用「刺剑」。\n");
	                        
	if ((int)me->query_skill("force") < 120)
		return notify_fail("你的内功修为不够高，难以运用「刺剑」。\n");
			
	if ((int)me->query("neili") < 300)
		return notify_fail("你现在真气不够，不能使用「刺剑」。\n");

        if (me->query_skill_mapped("sword") != "xiyang-jian")
                return notify_fail("你没有激发西洋剑术不够娴熟，不能使用「刺剑」。\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "\n$N" HIC "一声呼哨，手中的" +
              weapon->name() + HIC "犹如一道电光闪向$n" HIC "的胸前。\n"NOR;

        ap = me->query_skill("sword");
        dp = target->query_skill("parry");
	if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 2 + random(ap * 2 / 3);
                me->add("neili", -70);
		msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 70,
                                           HIR "$n" HIR "急忙招架，却是慢了一步，被这"
                                           "一剑正好刺中胸口，鲜血飞溅！\n" NOR);
		me->start_busy(2);
	} else 
	{
		msg += CYN "然而$p" CYN "眼明手快，不慌不忙的将$P"
                       CYN "的剑招架开。\n"NOR;
		me->add("neili", -30);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
