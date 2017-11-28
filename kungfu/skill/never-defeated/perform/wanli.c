// wanli.c 晴空万里

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
        object  weapon;
	int     damage;
	string  msg;
        string  pmsg;
        string *limbs;
        string  limb;
        int ap, dp;

	if (! target) target = offensive_target(me);

	if (! target || ! me->is_fighting(target))
		return notify_fail("晴空万里只能对战斗中的对手使用。\n");

        if ((int)me->query_skill("never-defeated", 1) < 120)
		return notify_fail("你的不败神功还不够娴熟，不能使用晴空万里。\n");
	                        
        if ((int)me->query("neili", 1) < 200)
		return notify_fail("你现在内力太弱，不能使用晴空万里。\n");
			
        if (! objectp(weapon = me->query_temp("weapon")))
                return notify_fail("你必须手持兵刃才能施展晴空万里！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIC "$N" HIC "怀抱" + weapon->name() + HIC "，一"
              "圈圈的划向$n" HIC "，将$p" HIC "卷在当中！\n" NOR;
	me->add("neili", -20);

        ap = me->query_skill("never-defeated", 1) * 3 / 2 +
             me->query_skill("martial-cognize", 1);
        dp = target->query_skill("parry") +
             target->query_skill("martial-cognize", 1);

        if (ap / 2 + random(ap * 2) > dp)
        {
		me->start_busy(2);
                me->add("neili", -180);

		target->start_busy(1 + random(3));

		damage = ap + (int)me->query_skill("force");
                damage = damage / 2 + random(damage / 2);

                if (arrayp(limbs = target->query("limbs")))
                        limb = limbs[random(sizeof(limbs))];
                else
                        limb = "要害";
                pmsg = HIR "$n连忙腾挪躲闪，然而“扑哧”一声，" + weapon->name() +
		       HIR "正好击中$p" HIR "的" + limb + "，$p"
		       HIR "一声惨叫，连退数步。\n" NOR;
                msg += COMBAT_D->do_damage(me, target, WEAPON_ATTACK, damage, 50, pmsg);
	} else 
	{
		me->start_busy(2);
		msg += CYN "可是$p" CYN "看破了$P"
                       CYN "的变化，见招拆招，没有受到任何伤害。\n"NOR;
	}

	message_combatd(msg, me, target);

	return 1;
}
