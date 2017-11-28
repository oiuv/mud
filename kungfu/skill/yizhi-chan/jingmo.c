// jingmo.c 惊魔一指

#include <ansi.h>
#include <combat.h>

inherit F_SSERVER;

int perform(object me, object target)
{
	int damage;
	string msg;
        int ap, dp;

        if (! target)
        {
	        me->clean_up_enemy();
	        target = me->select_opponent();
        }
	if (! target || ! me->is_fighting(target))
		return notify_fail("「惊魔一指」只能对战斗中的对手使用。\n");

	if ((int)me->query_skill("yizhi-chan", 1) < 120)
		return notify_fail("你的一指禅还不够娴熟，现在还无法使用「惊魔一指」。\n");

        if ((int)me->query_skill("force") < 180)
                return notify_fail("你的内功火候不够，难以施展「惊魔一指」。\n");
	                        
	if ((int)me->query("neili") < 200)
		return notify_fail("你现在真气不够，无法运用「惊魔一指」。\n");
			
	if (me->query_skill_mapped("finger") != "yizhi-chan") 
		return notify_fail("你没有激发一指禅，无法使用惊魔一指！\n");

       if (! living(target))
              return notify_fail("对方都已经这样了，用不着这么费力吧？\n");

	msg = HIY "$N" HIY "大喝一声，中指按出，一股锐利的杀气攻向$n"
              HIY "，气势恢宏之极！\n" NOR;

        ap = me->query_skill("finger");
        dp = target->query_skill("dodge");
	if (ap / 2 + random(ap) > dp)
	{
		damage = ap / 2 + random(ap / 2);
                msg += COMBAT_D->do_damage(me, target, UNARMED_ATTACK, damage, 50,
                                           HIR "只见$p" HIR "躲闪不及，被$P"
                                           HIR "这一指正戳在胸前，不由得连声"
                                           "惨叫，胸口鲜血直流！\n" NOR);
    me->add("neili", -100);
		me->start_busy(2);
	} else 
	{
		msg += CYN "可是$p" CYN "急忙跃开，躲开了$P"
                       CYN "这一指。\n" NOR;
		me->add("neili", -60);
		me->start_busy(3);
	}
	message_combatd(msg, me, target);

	return 1;
}
